import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicineDto {
  @ApiProperty({ description: '药品名称' })
  @IsString()
  @IsNotEmpty()
  medicineName: string;

  @ApiProperty({ description: '药品编码' })
  @IsString()
  @IsNotEmpty()
  medicineCode: string;

  @ApiProperty({ description: '生产厂家', required: false })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ description: '规格' })
  @IsString()
  @IsNotEmpty()
  specification: string;

  @ApiProperty({ description: '单位' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: '停药期天数' })
  @IsNumber()
  @IsNotEmpty()
  withdrawalPeriodDays: number;

  @ApiProperty({ description: '是否为禁用药', default: false })
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean;

  @ApiProperty({ description: '使用说明', required: false })
  @IsString()
  @IsOptional()
  usageInstructions?: string;

  @ApiProperty({ description: '禁忌症', required: false })
  @IsString()
  @IsOptional()
  contraindications?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateMedicineDto {
  @ApiProperty({ description: '药品名称', required: false })
  @IsString()
  @IsOptional()
  medicineName?: string;

  @ApiProperty({ description: '生产厂家', required: false })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ description: '规格', required: false })
  @IsString()
  @IsOptional()
  specification?: string;

  @ApiProperty({ description: '单位', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: '停药期天数', required: false })
  @IsNumber()
  @IsOptional()
  withdrawalPeriodDays?: number;

  @ApiProperty({ description: '是否为禁用药', required: false })
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean;

  @ApiProperty({ description: '使用说明', required: false })
  @IsString()
  @IsOptional()
  usageInstructions?: string;

  @ApiProperty({ description: '禁忌症', required: false })
  @IsString()
  @IsOptional()
  contraindications?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}
