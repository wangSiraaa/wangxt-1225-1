import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMortalityDto {
  @ApiProperty({ description: '池塘ID' })
  @IsUUID()
  @IsNotEmpty()
  pondId: string;

  @ApiProperty({ description: '死亡数量' })
  @IsNumber()
  @IsNotEmpty()
  mortalityCount: number;

  @ApiProperty({ description: '死亡率(%)' })
  @IsNumber()
  @IsNotEmpty()
  mortalityRate: number;

  @ApiProperty({ description: '死亡原因', required: false })
  @IsString()
  @IsOptional()
  cause?: string;

  @ApiProperty({ description: '记录人' })
  @IsString()
  @IsNotEmpty()
  recorder: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}
