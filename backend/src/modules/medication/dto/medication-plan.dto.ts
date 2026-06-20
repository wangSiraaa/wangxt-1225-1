import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicationPlanDto {
  @ApiProperty({ description: '池塘ID' })
  @IsUUID()
  @IsNotEmpty()
  pondId: string;

  @ApiProperty({ description: '药品ID' })
  @IsUUID()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ description: '方案名称' })
  @IsString()
  @IsNotEmpty()
  planName: string;

  @ApiProperty({ description: '用药剂量' })
  @IsNumber()
  @IsNotEmpty()
  dosage: number;

  @ApiProperty({ description: '剂量单位' })
  @IsString()
  @IsNotEmpty()
  dosageUnit: string;

  @ApiProperty({ description: '开始日期' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: '结束日期' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ description: '开方技术员' })
  @IsString()
  @IsNotEmpty()
  technician: string;

  @ApiProperty({ description: '使用方法', required: false })
  @IsString()
  @IsOptional()
  usageMethod?: string;

  @ApiProperty({ description: '备注说明', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
