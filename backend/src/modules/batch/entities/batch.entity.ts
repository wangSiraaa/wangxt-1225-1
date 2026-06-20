import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pond } from '../../pond/entities/pond.entity';

@Entity('batch')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  batchCode: string;

  @Column({ type: 'uuid' })
  pondId: string;

  @Column({ type: 'varchar', length: 100 })
  batchName: string;

  @Column({ type: 'date' })
  stockDate: Date;

  @Column({ type: 'int' })
  stockQuantity: number;

  @Column({ type: 'varchar', length: 50 })
  species: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  initialAverageWeight: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 20, default: 'farming' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Pond)
  @JoinColumn({ name: 'pondId' })
  pond: Pond;
}
