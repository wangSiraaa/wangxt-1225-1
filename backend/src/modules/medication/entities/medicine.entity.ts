import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('medicine')
export class Medicine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  medicineName: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  medicineCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 50 })
  specification: string;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'int', default: 0 })
  withdrawalPeriodDays: number;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  usageInstructions: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  contraindications: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
