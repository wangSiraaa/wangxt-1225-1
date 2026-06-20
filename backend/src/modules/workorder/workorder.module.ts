import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderService } from './workorder.service';
import { WorkOrderController } from './workorder.controller';
import { DeviceWorkOrder } from './entities/device-work-order.entity';
import { PondModule } from '../pond/pond.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceWorkOrder]),
    PondModule,
  ],
  controllers: [WorkOrderController],
  providers: [WorkOrderService],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}
