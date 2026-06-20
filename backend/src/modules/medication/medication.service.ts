import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { Medicine } from './entities/medicine.entity';
import { MedicationPlan } from './entities/medication-plan.entity';
import { CreateMedicineDto, UpdateMedicineDto } from './dto/medicine.dto';
import { CreateMedicationPlanDto } from './dto/medication-plan.dto';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
    @InjectRepository(MedicationPlan)
    private medicationPlanRepository: Repository<MedicationPlan>,
  ) {}

  async findAllMedicines(includeBanned: boolean = false): Promise<Medicine[]> {
    const where: any = {};
    if (!includeBanned) {
      where.isBanned = false;
    }
    return this.medicineRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOneMedicine(id: string): Promise<Medicine> {
    const medicine = await this.medicineRepository.findOne({ where: { id } });
    if (!medicine) {
      throw new NotFoundException(`药品 ${id} 不存在`);
    }
    return medicine;
  }

  async createMedicine(dto: CreateMedicineDto): Promise<Medicine> {
    const existing = await this.medicineRepository.findOne({
      where: { medicineCode: dto.medicineCode },
    });
    if (existing) {
      throw new BadRequestException(`药品编码 ${dto.medicineCode} 已存在`);
    }
    const medicine = this.medicineRepository.create(dto);
    return this.medicineRepository.save(medicine);
  }

  async updateMedicine(id: string, dto: UpdateMedicineDto): Promise<Medicine> {
    const medicine = await this.findOneMedicine(id);
    Object.assign(medicine, dto);
    return this.medicineRepository.save(medicine);
  }

  async removeMedicine(id: string): Promise<void> {
    const medicine = await this.findOneMedicine(id);
    await this.medicineRepository.remove(medicine);
  }

  async findAllPlans(pondId?: string, status?: string): Promise<MedicationPlan[]> {
    const where: any = {};
    if (pondId) where.pondId = pondId;
    if (status) where.status = status;
    return this.medicationPlanRepository.find({
      where,
      relations: ['medicine', 'pond'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOnePlan(id: string): Promise<MedicationPlan> {
    const plan = await this.medicationPlanRepository.findOne({
      where: { id },
      relations: ['medicine', 'pond'],
    });
    if (!plan) {
      throw new NotFoundException(`用药方案 ${id} 不存在`);
    }
    return plan;
  }

  async createPlan(dto: CreateMedicationPlanDto): Promise<MedicationPlan> {
    const medicine = await this.findOneMedicine(dto.medicineId);
    if (medicine.isBanned) {
      throw new BadRequestException(`药品「${medicine.medicineName}」为禁用药，不能开具用药方案`);
    }

    const startDate = dayjs(dto.startDate);
    const endDate = dayjs(dto.endDate);
    if (endDate.isBefore(startDate)) {
      throw new BadRequestException('用药结束日期不能早于开始日期');
    }

    const withdrawalEndDate = endDate.add(medicine.withdrawalPeriodDays, 'day').toDate();

    const plan = this.medicationPlanRepository.create({
      ...dto,
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      withdrawalEndDate,
      planCode: `MP${dayjs().format('YYYYMMDD')}${uuidv4().slice(0, 6).toUpperCase()}`,
      status: 'active',
    });

    return this.medicationPlanRepository.save(plan);
  }

  async cancelPlan(id: string): Promise<MedicationPlan> {
    const plan = await this.findOnePlan(id);
    if (plan.status === 'completed' || plan.status === 'cancelled') {
      throw new BadRequestException(`方案状态为「${plan.status}」，不能取消`);
    }
    plan.status = 'cancelled';
    return this.medicationPlanRepository.save(plan);
  }

  async completePlan(id: string): Promise<MedicationPlan> {
    const plan = await this.findOnePlan(id);
    if (plan.status !== 'active') {
      throw new BadRequestException(`方案状态为「${plan.status}」，不能标记完成`);
    }
    plan.status = 'completed';
    return this.medicationPlanRepository.save(plan);
  }

  async checkWithdrawalPeriod(pondId: string, checkDate?: Date): Promise<{
    canRelease: boolean;
    activePlans: MedicationPlan[];
    latestWithdrawalEndDate: Date | null;
  }> {
    const date = checkDate || new Date();
    const activePlans = await this.medicationPlanRepository.find({
      where: {
        pondId,
        status: 'active',
        withdrawalEndDate: MoreThan(date),
      },
      relations: ['medicine'],
    });

    const canRelease = activePlans.length === 0;
    let latestWithdrawalEndDate: Date | null = null;
    if (activePlans.length > 0) {
      latestWithdrawalEndDate = activePlans.reduce(
        (latest, plan) => (!latest || plan.withdrawalEndDate > latest ? plan.withdrawalEndDate : latest),
        null as Date | null,
      );
    }

    return {
      canRelease,
      activePlans,
      latestWithdrawalEndDate,
    };
  }

  async getPondActivePlans(pondId: string): Promise<MedicationPlan[]> {
    return this.medicationPlanRepository.find({
      where: {
        pondId,
        status: 'active',
      },
      relations: ['medicine'],
      order: { createdAt: 'DESC' },
    });
  }
}
