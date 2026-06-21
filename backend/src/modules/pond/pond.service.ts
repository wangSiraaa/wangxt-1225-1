import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pond } from './entities/pond.entity';
import { WaterQualityRecord } from './entities/water-quality-record.entity';
import { MortalityRecord } from './entities/mortality-record.entity';
import { DeviceWorkOrder } from '../workorder/entities/device-work-order.entity';
import { CreatePondDto, UpdatePondDto } from './dto/pond.dto';
import { CreateWaterQualityDto } from './dto/water-quality.dto';
import { CreateMortalityDto } from './dto/mortality.dto';
import { RedisService } from '../../common/redis.service';

@Injectable()
export class PondService {
  constructor(
    @InjectRepository(Pond)
    private pondRepository: Repository<Pond>,
    @InjectRepository(WaterQualityRecord)
    private waterQualityRepository: Repository<WaterQualityRecord>,
    @InjectRepository(MortalityRecord)
    private mortalityRepository: Repository<MortalityRecord>,
    @InjectRepository(DeviceWorkOrder)
    private workOrderRepository: Repository<DeviceWorkOrder>,
    private redisService: RedisService,
  ) {}

  async findAll(): Promise<Pond[]> {
    return this.pondRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Pond> {
    const pond = await this.pondRepository.findOne({ where: { id } });
    if (!pond) {
      throw new NotFoundException(`池塘 ${id} 不存在`);
    }
    return pond;
  }

  async create(createPondDto: CreatePondDto): Promise<Pond> {
    const existing = await this.pondRepository.findOne({
      where: { pondCode: createPondDto.pondCode },
    });
    if (existing) {
      throw new BadRequestException(`池塘编号 ${createPondDto.pondCode} 已存在`);
    }
    const pond = this.pondRepository.create(createPondDto);
    return this.pondRepository.save(pond);
  }

  async update(id: string, updatePondDto: UpdatePondDto): Promise<Pond> {
    const pond = await this.findOne(id);
    Object.assign(pond, updatePondDto);
    return this.pondRepository.save(pond);
  }

  async remove(id: string): Promise<void> {
    const pond = await this.findOne(id);
    await this.pondRepository.remove(pond);
  }

  async createWaterQuality(dto: CreateWaterQualityDto): Promise<WaterQualityRecord> {
    await this.findOne(dto.pondId);
    const record = this.waterQualityRepository.create(dto);
    const saved = await this.waterQualityRepository.save(record);

    await this.redisService.setSensorData(dto.pondId, {
      dissolvedOxygen: dto.dissolvedOxygen,
      ph: dto.ph,
      temperature: dto.temperature,
      ammoniaNitrogen: dto.ammoniaNitrogen,
      nitrite: dto.nitrite,
      turbidity: dto.turbidity,
    });
    await this.redisService.addSensorHistory(dto.pondId, {
      dissolvedOxygen: dto.dissolvedOxygen,
      ph: dto.ph,
      temperature: dto.temperature,
    });

    return saved;
  }

  async getWaterQualityRecords(pondId: string): Promise<WaterQualityRecord[]> {
    return this.waterQualityRepository.find({
      where: { pondId },
      order: { recordedAt: 'DESC' },
      take: 50,
    });
  }

  async createMortality(dto: CreateMortalityDto): Promise<MortalityRecord> {
    const pond = await this.findOne(dto.pondId);
    const record = this.mortalityRepository.create(dto);
    const saved = await this.mortalityRepository.save(record);

    if (pond.stockQuantity > 0) {
      pond.stockQuantity = Math.max(0, pond.stockQuantity - dto.mortalityCount);
      await this.pondRepository.save(pond);
    }

    return saved;
  }

  async getMortalityRecords(pondId: string): Promise<MortalityRecord[]> {
    return this.mortalityRepository.find({
      where: { pondId },
      order: { recordedAt: 'DESC' },
      take: 50,
    });
  }

  async getSensorLatest(pondId: string): Promise<any> {
    const data = await this.redisService.getSensorData(pondId);
    if (!data) {
      const records = await this.getWaterQualityRecords(pondId);
      if (records.length > 0) {
        const latest = records[0];
        return {
          dissolvedOxygen: latest.dissolvedOxygen,
          ph: latest.ph,
          temperature: latest.temperature,
          ammoniaNitrogen: latest.ammoniaNitrogen,
          nitrite: latest.nitrite,
          turbidity: latest.turbidity,
          timestamp: latest.recordedAt,
          source: 'database',
        };
      }
      return null;
    }
    return { ...data, source: 'redis' };
  }

  async getSensorHistory(pondId: string): Promise<any[]> {
    const history = await this.redisService.getSensorHistory(pondId, 20);
    if (history.length > 0) {
      return history;
    }
    const records = await this.getWaterQualityRecords(pondId);
    return records.map(r => ({
      dissolvedOxygen: r.dissolvedOxygen,
      ph: r.ph,
      temperature: r.temperature,
      timestamp: r.recordedAt,
    }));
  }

  async checkLowDissolvedOxygen(pondId: string, threshold: number = 5): Promise<{ isLow: boolean; consecutiveCount: number }> {
    const history = await this.redisService.getSensorHistory(pondId, 3);
    if (history.length < 3) {
      return { isLow: false, consecutiveCount: history.filter(h => h.dissolvedOxygen < threshold).length };
    }
    const consecutiveLow = history.slice(0, 3).every(h => h.dissolvedOxygen < threshold);
    return {
      isLow: consecutiveLow,
      consecutiveCount: history.filter(h => h.dissolvedOxygen < threshold).length,
    };
  }

  async getLatestAeratorOrder(pondId: string): Promise<DeviceWorkOrder | null> {
    const orders = await this.workOrderRepository.find({
      where: {
        pondId,
        deviceType: 'aerator',
        status: 'completed',
      },
      order: { completedAt: 'DESC' },
      take: 1,
    });
    return orders.length > 0 ? orders[0] : null;
  }

  async getPondStatus(pondId: string): Promise<{
    pond: Pond;
    sensorData: any;
    latestAeratorOrder: DeviceWorkOrder | null;
  }> {
    const pond = await this.findOne(pondId);
    const sensorData = await this.getSensorLatest(pondId);
    const latestAeratorOrder = await this.getLatestAeratorOrder(pondId);

    return {
      pond,
      sensorData,
      latestAeratorOrder,
    };
  }
}
