import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pond } from '../../pond/entities/pond.entity';
import { Medicine } from './medicine.entity';

@Entity('medication_plan')
export class MedicationPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pondId: string;

  @Column({ type: 'uuid' })
  medicineId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  planCode: string;

  @Column({ type: 'varchar', length: 100 })
  planName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dosage: number;

  @Column({ type: 'varchar', length: 50 })
  dosageUnit: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date' })
  withdrawalEndDate: Date;

  @Column({ type: 'varchar', length: 50 })
  technician: string;

  @Column({ type: 'text', nullable: true })
  usageMethod: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pondId' })
  pond: Pond;

  @ManyToOne(() => Medicine)
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;
}
