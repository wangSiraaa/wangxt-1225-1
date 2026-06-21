import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PondService } from './pond.service';
import { PondController } from './pond.controller';
import { Pond } from './entities/pond.entity';
import { WaterQualityRecord } from './entities/water-quality-record.entity';
import { MortalityRecord } from './entities/mortality-record.entity';
import { DeviceWorkOrder } from '../workorder/entities/device-work-order.entity';
import { RedisService } from '../../common/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pond, WaterQualityRecord, MortalityRecord, DeviceWorkOrder])],
  controllers: [PondController],
  providers: [PondService, RedisService],
  exports: [PondService, RedisService],
})
export class PondModule {}
