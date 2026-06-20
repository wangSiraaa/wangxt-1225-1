import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WaterQualityRecord } from './water-quality-record.entity';
import { MortalityRecord } from './mortality-record.entity';

@Entity('pond')
export class Pond {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  pondCode: string;

  @Column({ type: 'varchar', length: 100 })
  pondName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area: number;

  @Column({ type: 'varchar', length: 50 })
  species: string;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageWeight: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => WaterQualityRecord, record => record.pond)
  waterQualityRecords: WaterQualityRecord[];

  @OneToMany(() => MortalityRecord, record => record.pond)
  mortalityRecords: MortalityRecord[];
}
