import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pond } from './pond.entity';

@Entity('water_quality_record')
export class WaterQualityRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pondId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  dissolvedOxygen: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  ph: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  temperature: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ammoniaNitrogen: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  nitrite: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  turbidity: number;

  @Column({ type: 'varchar', length: 50 })
  recorder: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string;

  @CreateDateColumn()
  recordedAt: Date;

  @ManyToOne(() => Pond, pond => pond.waterQualityRecords)
  @JoinColumn({ name: 'pondId' })
  pond: Pond;
}
