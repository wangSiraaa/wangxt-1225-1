import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pond } from '../../pond/entities/pond.entity';

@Entity('device_work_order')
export class DeviceWorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  orderCode: string;

  @Column({ type: 'uuid' })
  pondId: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  deviceType: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  orderType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  triggerSource: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  triggerValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  thresholdValue: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  assignee: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  handleResult: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  operator: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string;

  @Column({ type: 'text', nullable: true })
  aeratorHandleRemark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pondId' })
  pond: Pond;
}
