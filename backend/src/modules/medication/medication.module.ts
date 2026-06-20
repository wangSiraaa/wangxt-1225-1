import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';
import { Medicine } from './entities/medicine.entity';
import { MedicationPlan } from './entities/medication-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, MedicationPlan])],
  controllers: [MedicationController],
  providers: [MedicationService],
  exports: [MedicationService],
})
export class MedicationModule {}
