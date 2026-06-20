import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { Batch } from './entities/batch.entity';
import { SalesBatch } from './entities/sales-batch.entity';
import { CreateBatchDto, CreateSalesBatchDto } from './dto/batch.dto';
import { MedicationService } from '../medication/medication.service';
import { PondService } from '../pond/pond.service';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(SalesBatch)
    private salesBatchRepository: Repository<SalesBatch>,
    private medicationService: MedicationService,
    private pondService: PondService,
  ) {}

  async findAllBatches(status?: string): Promise<Batch[]> {
    const where: any = {};
    if (status) where.status = status;
    return this.batchRepository.find({
      where,
      relations: ['pond'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneBatch(id: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: ['pond'],
    });
    if (!batch) {
      throw new NotFoundException(`养殖批次 ${id} 不存在`);
    }
    return batch;
  }

  async createBatch(dto: CreateBatchDto): Promise<Batch> {
    await this.pondService.findOne(dto.pondId);
    const batch = this.batchRepository.create({
      ...dto,
      stockDate: dayjs(dto.stockDate).toDate(),
      batchCode: `B${dayjs().format('YYYYMMDD')}${uuidv4().slice(0, 6).toUpperCase()}`,
      status: 'farming',
    });
    return this.batchRepository.save(batch);
  }

  async completeBatch(id: string): Promise<Batch> {
    const batch = await this.findOneBatch(id);
    if (batch.status !== 'farming') {
      throw new BadRequestException(`批次状态为「${batch.status}」，不能标记完成`);
    }
    batch.status = 'completed';
    return this.batchRepository.save(batch);
  }

  async findAllSalesBatches(status?: string): Promise<SalesBatch[]> {
    const where: any = {};
    if (status) where.status = status;
    return this.salesBatchRepository.find({
      where,
      relations: ['batch', 'pond'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneSalesBatch(id: string): Promise<SalesBatch> {
    const salesBatch = await this.salesBatchRepository.findOne({
      where: { id },
      relations: ['batch', 'pond'],
    });
    if (!salesBatch) {
      throw new NotFoundException(`销售批次 ${id} 不存在`);
    }
    return salesBatch;
  }

  async createSalesBatch(dto: CreateSalesBatchDto): Promise<SalesBatch> {
    const batch = await this.findOneBatch(dto.batchId);
    await this.pondService.findOne(dto.pondId);

    const withdrawalCheck = await this.medicationService.checkWithdrawalPeriod(
      dto.pondId,
      dayjs(dto.harvestDate).toDate(),
    );

    if (!withdrawalCheck.canRelease) {
      const activePlanNames = withdrawalCheck.activePlans
        .map(p => `${p.medicine.medicineName}(停药至${dayjs(p.withdrawalEndDate).format('YYYY-MM-DD')})`)
        .join('、');
      throw new BadRequestException(
        `停药期未满，不能生成销售批次。当前仍在停药期的药品：${activePlanNames}`,
      );
    }

    const salesBatch = this.salesBatchRepository.create({
      ...dto,
      harvestDate: dayjs(dto.harvestDate).toDate(),
      inspectionDate: dayjs(dto.inspectionDate).toDate(),
      salesBatchCode: `SB${dayjs().format('YYYYMMDD')}${uuidv4().slice(0, 6).toUpperCase()}`,
      withdrawalPeriodVerified: true,
      withdrawalEndDate: withdrawalCheck.latestWithdrawalEndDate,
      status: 'qualified',
    });

    const saved = await this.salesBatchRepository.save(salesBatch);

    if (batch.status === 'farming') {
      batch.status = 'harvested';
      await this.batchRepository.save(batch);
    }

    return saved;
  }

  async releaseSalesBatch(id: string): Promise<SalesBatch> {
    const salesBatch = await this.findOneSalesBatch(id);
    if (salesBatch.status !== 'qualified') {
      throw new BadRequestException(`销售批次状态为「${salesBatch.status}」，不能放行`);
    }
    salesBatch.status = 'released';
    return this.salesBatchRepository.save(salesBatch);
  }

  async rejectSalesBatch(id: string, reason: string): Promise<SalesBatch> {
    const salesBatch = await this.findOneSalesBatch(id);
    if (salesBatch.status === 'released') {
      throw new BadRequestException('已放行的销售批次不能驳回');
    }
    salesBatch.status = 'rejected';
    salesBatch.qualityRemarks = reason;
    return this.salesBatchRepository.save(salesBatch);
  }

  async preCheckWithdrawal(pondId: string, harvestDate: string): Promise<{
    canCreate: boolean;
    reason?: string;
    activePlans?: any[];
    earliestReleaseDate?: string;
  }> {
    const check = await this.medicationService.checkWithdrawalPeriod(
      pondId,
      dayjs(harvestDate).toDate(),
    );

    if (check.canRelease) {
      return { canCreate: true };
    }

    const activePlanNames = check.activePlans.map(p => ({
      medicineName: p.medicine.medicineName,
      withdrawalEndDate: dayjs(p.withdrawalEndDate).format('YYYY-MM-DD'),
    }));

    const earliestDate = dayjs(check.latestWithdrawalEndDate).add(1, 'day').format('YYYY-MM-DD');

    return {
      canCreate: false,
      reason: `停药期未满，最早可出塘日期：${earliestDate}`,
      activePlans: activePlanNames,
      earliestReleaseDate: earliestDate,
    };
  }
}
