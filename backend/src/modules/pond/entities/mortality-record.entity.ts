import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pond } from './pond.entity';

@Entity('mortality_record')
export class MortalityRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pondId: string;

  @Column({ type: 'int' })
  mortalityCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  mortalityRate: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cause: string;

  @Column({ type: 'varchar', length: 50 })
  recorder: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string;

  @CreateDateColumn()
  recordedAt: Date;

  @ManyToOne(() => Pond, pond => pond.mortalityRecords)
  @JoinColumn({ name: 'pondId' })
  pond: Pond;
}
