import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MedicationService } from './medication.service';
import { CreateMedicineDto, UpdateMedicineDto } from './dto/medicine.dto';
import { CreateMedicationPlanDto } from './dto/medication-plan.dto';

@ApiTags('用药管理')
@Controller('medication')
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Get('medicines')
  @ApiOperation({ summary: '获取药品列表' })
  @ApiQuery({ name: 'includeBanned', description: '是否包含禁用药', required: false })
  findAllMedicines(@Query('includeBanned') includeBanned?: string) {
    return this.medicationService.findAllMedicines(includeBanned === 'true');
  }

  @Get('medicines/:id')
  @ApiOperation({ summary: '获取药品详情' })
  findOneMedicine(@Param('id') id: string) {
    return this.medicationService.findOneMedicine(id);
  }

  @Post('medicines')
  @ApiOperation({ summary: '创建药品档案' })
  createMedicine(@Body() dto: CreateMedicineDto) {
    return this.medicationService.createMedicine(dto);
  }

  @Put('medicines/:id')
  @ApiOperation({ summary: '更新药品信息' })
  updateMedicine(@Param('id') id: string, @Body() dto: UpdateMedicineDto) {
    return this.medicationService.updateMedicine(id, dto);
  }

  @Delete('medicines/:id')
  @ApiOperation({ summary: '删除药品' })
  removeMedicine(@Param('id') id: string) {
    return this.medicationService.removeMedicine(id);
  }

  @Get('plans')
  @ApiOperation({ summary: '获取用药方案列表' })
  @ApiQuery({ name: 'pondId', description: '池塘ID', required: false })
  @ApiQuery({ name: 'status', description: '状态', required: false })
  findAllPlans(@Query('pondId') pondId?: string, @Query('status') status?: string) {
    return this.medicationService.findAllPlans(pondId, status);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: '获取用药方案详情' })
  findOnePlan(@Param('id') id: string) {
    return this.medicationService.findOnePlan(id);
  }

  @Post('plans')
  @ApiOperation({ summary: '开具用药方案' })
  createPlan(@Body() dto: CreateMedicationPlanDto) {
    return this.medicationService.createPlan(dto);
  }

  @Put('plans/:id/cancel')
  @ApiOperation({ summary: '取消用药方案' })
  cancelPlan(@Param('id') id: string) {
    return this.medicationService.cancelPlan(id);
  }

  @Put('plans/:id/complete')
  @ApiOperation({ summary: '标记用药方案完成' })
  completePlan(@Param('id') id: string) {
    return this.medicationService.completePlan(id);
  }

  @Get('plans/pond/:pondId/active')
  @ApiOperation({ summary: '获取池塘当前有效用药方案' })
  getPondActivePlans(@Param('pondId') pondId: string) {
    return this.medicationService.getPondActivePlans(pondId);
  }

  @Get('withdrawal/check/:pondId')
  @ApiOperation({ summary: '检查池塘停药期' })
  checkWithdrawalPeriod(@Param('pondId') pondId: string) {
    return this.medicationService.checkWithdrawalPeriod(pondId);
  }
}
