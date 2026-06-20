import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Batch } from './batch.entity';
import { Pond } from '../../pond/entities/pond.entity';

@Entity('sales_batch')
export class SalesBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  salesBatchCode: string;

  @Column({ type: 'uuid' })
  batchId: string;

  @Column({ type: 'uuid' })
  pondId: string;

  @Column({ type: 'date' })
  harvestDate: Date;

  @Column({ type: 'int' })
  harvestQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  averageWeight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalWeight: number;

  @Column({ type: 'varchar', length: 50 })
  qualityInspector: string;

  @Column({ type: 'date' })
  inspectionDate: Date;

  @Column({ type: 'text', nullable: true })
  inspectionReport: string;

  @Column({ type: 'boolean', default: false })
  withdrawalPeriodVerified: boolean;

  @Column({ type: 'date', nullable: true })
  withdrawalEndDate: Date;

  @Column({ type: 'text', nullable: true })
  qualityRemarks: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  customer: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  destination: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batchId' })
  batch: Batch;

  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pondId' })
  pond: Pond;
}
