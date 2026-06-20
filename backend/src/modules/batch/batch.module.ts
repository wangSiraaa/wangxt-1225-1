import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { Batch } from './entities/batch.entity';
import { SalesBatch } from './entities/sales-batch.entity';
import { MedicationModule } from '../medication/medication.module';
import { PondModule } from '../pond/pond.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch, SalesBatch]),
    MedicationModule,
    PondModule,
  ],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
