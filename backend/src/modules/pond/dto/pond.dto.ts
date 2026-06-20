import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePondDto {
  @ApiProperty({ description: '池塘编号' })
  @IsString()
  @IsNotEmpty()
  pondCode: string;

  @ApiProperty({ description: '池塘名称' })
  @IsString()
  @IsNotEmpty()
  pondName: string;

  @ApiProperty({ description: '面积(平方米)' })
  @IsNumber()
  @IsNotEmpty()
  area: number;

  @ApiProperty({ description: '养殖品种' })
  @IsString()
  @IsNotEmpty()
  species: string;

  @ApiProperty({ description: '投放数量', required: false })
  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @ApiProperty({ description: '平均体重(克)', required: false })
  @IsNumber()
  @IsOptional()
  averageWeight?: number;

  @ApiProperty({ description: '状态', enum: ['active', 'inactive', 'maintenance'], default: 'active', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdatePondDto {
  @ApiProperty({ description: '池塘名称', required: false })
  @IsString()
  @IsOptional()
  pondName?: string;

  @ApiProperty({ description: '面积(平方米)', required: false })
  @IsNumber()
  @IsOptional()
  area?: number;

  @ApiProperty({ description: '养殖品种', required: false })
  @IsString()
  @IsOptional()
  species?: string;

  @ApiProperty({ description: '投放数量', required: false })
  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @ApiProperty({ description: '平均体重(克)', required: false })
  @IsNumber()
  @IsOptional()
  averageWeight?: number;

  @ApiProperty({ description: '状态', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}
