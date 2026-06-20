import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { DeviceWorkOrder } from './entities/device-work-order.entity';
import { CreateWorkOrderDto, HandleWorkOrderDto } from './dto/workorder.dto';
import { PondService } from '../pond/pond.service';

@Injectable()
export class WorkOrderService {
  constructor(
    @InjectRepository(DeviceWorkOrder)
    private workOrderRepository: Repository<DeviceWorkOrder>,
    private pondService: PondService,
  ) {}

  async findAll(status?: string, pondId?: string): Promise<DeviceWorkOrder[]> {
    const where: any = {};
    if (status) where.status = status;
    if (pondId) where.pondId = pondId;
    return this.workOrderRepository.find({
      where,
      relations: ['pond'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DeviceWorkOrder> {
    const order = await this.workOrderRepository.findOne({
      where: { id },
      relations: ['pond'],
    });
    if (!order) {
      throw new NotFoundException(`设备工单 ${id} 不存在`);
    }
    return order;
  }

  async create(dto: CreateWorkOrderDto): Promise<DeviceWorkOrder> {
    await this.pondService.findOne(dto.pondId);
    const order = this.workOrderRepository.create({
      ...dto,
      orderCode: `WO${dayjs().format('YYYYMMDDHHmm')}${uuidv4().slice(0, 4).toUpperCase()}`,
      status: 'pending',
      orderType: dto.orderType || 'manual',
      triggerSource: dto.triggerSource || 'manual',
    });
    return this.workOrderRepository.save(order);
  }

  async startWork(id: string, assignee: string): Promise<DeviceWorkOrder> {
    const order = await this.findOne(id);
    if (order.status !== 'pending') {
      throw new BadRequestException(`工单状态为「${order.status}」，不能开始处理`);
    }
    order.status = 'processing';
    order.assignee = assignee;
    order.startedAt = new Date();
    return this.workOrderRepository.save(order);
  }

  async completeWork(id: string, dto: HandleWorkOrderDto): Promise<DeviceWorkOrder> {
    const order = await this.findOne(id);
    if (order.status !== 'processing') {
      throw new BadRequestException(`工单状态为「${order.status}」，不能完成`);
    }
    order.status = 'completed';
    order.handleResult = dto.handleResult;
    order.operator = dto.operator;
    order.completedAt = new Date();
    return this.workOrderRepository.save(order);
  }

  async cancelWork(id: string, reason: string, operator: string): Promise<DeviceWorkOrder> {
    const order = await this.findOne(id);
    if (order.status === 'completed') {
      throw new BadRequestException('已完成的工单不能取消');
    }
    order.status = 'cancelled';
    order.handleResult = reason;
    order.operator = operator;
    return this.workOrderRepository.save(order);
  }

  async checkAndCreateAeratorOrder(
    pondId: string,
    threshold: number = 5,
  ): Promise<DeviceWorkOrder | null> {
    const doCheck = await this.pondService.checkLowDissolvedOxygen(pondId, threshold);

    if (!doCheck.isLow) {
      return null;
    }

    const sensorData = await this.pondService.getSensorLatest(pondId);

    const pendingOrders = await this.workOrderRepository.find({
      where: {
        pondId,
        deviceType: 'aerator',
        status: 'pending',
      },
      order: { createdAt: 'DESC' },
      take: 1,
    });

    if (pendingOrders.length > 0) {
      const lastOrder = pendingOrders[0];
      const minutesDiff = dayjs().diff(dayjs(lastOrder.createdAt), 'minute');
      if (minutesDiff < 30) {
        return null;
      }
    }

    const pond = await this.pondService.findOne(pondId);
    const currentDO = sensorData?.dissolvedOxygen || 0;

    return this.create({
      pondId,
      title: `溶氧偏低警报 - ${pond.pondName}`,
      deviceType: 'aerator',
      description: `连续3次检测溶氧值低于阈值，当前溶氧: ${currentDO}mg/L，阈值: ${threshold}mg/L，请立即开启增氧设备。`,
      orderType: 'automatic',
      triggerSource: 'sensor',
      triggerValue: currentDO,
      thresholdValue: threshold,
      remark: `连续${doCheck.consecutiveCount}次检测偏低`,
    });
  }

  async getStatistics(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    todayCount: number;
  }> {
    const total = await this.workOrderRepository.count();
    const pending = await this.workOrderRepository.count({ where: { status: 'pending' } });
    const processing = await this.workOrderRepository.count({ where: { status: 'processing' } });
    const completed = await this.workOrderRepository.count({ where: { status: 'completed' } });
    const cancelled = await this.workOrderRepository.count({ where: { status: 'cancelled' } });

    const startOfToday = dayjs().startOf('day').toDate();
    const todayCount = await this.workOrderRepository
      .createQueryBuilder('o')
      .where('o.createdAt >= :startOfToday', { startOfToday })
      .getCount();

    return { total, pending, processing, completed, cancelled, todayCount };
  }
}
