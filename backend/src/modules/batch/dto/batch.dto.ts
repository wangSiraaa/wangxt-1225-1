import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBatchDto {
  @ApiProperty({ description: '批次名称' })
  @IsString()
  @IsNotEmpty()
  batchName: string;

  @ApiProperty({ description: '池塘ID' })
  @IsUUID()
  @IsNotEmpty()
  pondId: string;

  @ApiProperty({ description: '放苗日期' })
  @IsDateString()
  @IsNotEmpty()
  stockDate: string;

  @ApiProperty({ description: '放苗数量' })
  @IsNumber()
  @IsNotEmpty()
  stockQuantity: number;

  @ApiProperty({ description: '养殖品种' })
  @IsString()
  @IsNotEmpty()
  species: string;

  @ApiProperty({ description: '初始平均体重(克)', required: false })
  @IsNumber()
  @IsOptional()
  initialAverageWeight?: number;

  @ApiProperty({ description: '苗种来源', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateSalesBatchDto {
  @ApiProperty({ description: '养殖批次ID' })
  @IsUUID()
  @IsNotEmpty()
  batchId: string;

  @ApiProperty({ description: '池塘ID' })
  @IsUUID()
  @IsNotEmpty()
  pondId: string;

  @ApiProperty({ description: '出塘日期' })
  @IsDateString()
  @IsNotEmpty()
  harvestDate: string;

  @ApiProperty({ description: '出塘数量' })
  @IsNumber()
  @IsNotEmpty()
  harvestQuantity: number;

  @ApiProperty({ description: '平均体重(克)' })
  @IsNumber()
  @IsNotEmpty()
  averageWeight: number;

  @ApiProperty({ description: '总重量(公斤)' })
  @IsNumber()
  @IsNotEmpty()
  totalWeight: number;

  @ApiProperty({ description: '质检员' })
  @IsString()
  @IsNotEmpty()
  qualityInspector: string;

  @ApiProperty({ description: '质检日期' })
  @IsDateString()
  @IsNotEmpty()
  inspectionDate: string;

  @ApiProperty({ description: '质检报告', required: false })
  @IsString()
  @IsOptional()
  inspectionReport?: string;

  @ApiProperty({ description: '质量备注', required: false })
  @IsString()
  @IsOptional()
  qualityRemarks?: string;

  @ApiProperty({ description: '客户', required: false })
  @IsString()
  @IsOptional()
  customer?: string;

  @ApiProperty({ description: '目的地', required: false })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}
