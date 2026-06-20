import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkOrderDto {
  @ApiProperty({ description: '池塘ID' })
  @IsUUID()
  @IsNotEmpty()
  pondId: string;

  @ApiProperty({ description: '工单标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '设备类型', example: 'aerator' })
  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @ApiProperty({ description: '工单描述' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: '工单类型', example: 'automatic' })
  @IsString()
  @IsOptional()
  orderType?: string;

  @ApiProperty({ description: '触发来源', example: 'sensor' })
  @IsString()
  @IsOptional()
  triggerSource?: string;

  @ApiProperty({ description: '触发值', required: false })
  @IsNumber()
  @IsOptional()
  triggerValue?: number;

  @ApiProperty({ description: '阈值', required: false })
  @IsNumber()
  @IsOptional()
  thresholdValue?: number;

  @ApiProperty({ description: '指派处理人', required: false })
  @IsString()
  @IsOptional()
  assignee?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class HandleWorkOrderDto {
  @ApiProperty({ description: '处理结果' })
  @IsString()
  @IsNotEmpty()
  handleResult: string;

  @ApiProperty({ description: '操作人' })
  @IsString()
  @IsNotEmpty()
  operator: string;
}
