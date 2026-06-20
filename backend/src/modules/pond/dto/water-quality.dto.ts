import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaterQualityDto {
  @ApiProperty({ description: '池塘ID' })
  @IsUUID()
  @IsNotEmpty()
  pondId: string;

  @ApiProperty({ description: '溶氧量(mg/L)' })
  @IsNumber()
  @IsNotEmpty()
  dissolvedOxygen: number;

  @ApiProperty({ description: 'pH值' })
  @IsNumber()
  @IsNotEmpty()
  ph: number;

  @ApiProperty({ description: '水温(℃)' })
  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @ApiProperty({ description: '氨氮(mg/L)', required: false })
  @IsNumber()
  @IsOptional()
  ammoniaNitrogen?: number;

  @ApiProperty({ description: '亚硝酸盐(mg/L)', required: false })
  @IsNumber()
  @IsOptional()
  nitrite?: number;

  @ApiProperty({ description: '浊度(NTU)', required: false })
  @IsNumber()
  @IsOptional()
  turbidity?: number;

  @ApiProperty({ description: '记录人' })
  @IsString()
  @IsNotEmpty()
  recorder: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}
