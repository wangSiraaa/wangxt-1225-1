import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WorkOrderService } from './workorder.service';
import { CreateWorkOrderDto, HandleWorkOrderDto } from './dto/workorder.dto';

@ApiTags('设备工单')
@Controller('workorder')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get('list')
  @ApiOperation({ summary: '获取设备工单列表' })
  @ApiQuery({ name: 'status', description: '状态', required: false })
  @ApiQuery({ name: 'pondId', description: '池塘ID', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('pondId') pondId?: string,
  ) {
    return this.workOrderService.findAll(status, pondId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取工单详情' })
  findOne(@Param('id') id: string) {
    return this.workOrderService.findOne(id);
  }

  @Post('create')
  @ApiOperation({ summary: '创建设备工单' })
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(dto);
  }

  @Put(':id/start')
  @ApiOperation({ summary: '开始处理工单' })
  startWork(
    @Param('id') id: string,
    @Body('assignee') assignee: string,
  ) {
    return this.workOrderService.startWork(id, assignee);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: '完成工单' })
  completeWork(
    @Param('id') id: string,
    @Body() dto: HandleWorkOrderDto,
  ) {
    return this.workOrderService.completeWork(id, dto);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: '取消工单' })
  cancelWork(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('operator') operator: string,
  ) {
    return this.workOrderService.cancelWork(id, reason, operator);
  }

  @Post('aerator/check/:pondId')
  @ApiOperation({ summary: '检查溶氧偏低自动生成增氧工单' })
  @ApiParam({ name: 'pondId', description: '池塘ID' })
  @ApiQuery({ name: 'threshold', description: '溶氧阈值', required: false })
  checkAndCreateAeratorOrder(
    @Param('pondId') pondId: string,
    @Query('threshold') threshold?: string,
  ) {
    return this.workOrderService.checkAndCreateAeratorOrder(
      pondId,
      threshold ? Number(threshold) : undefined,
    );
  }

  @Get('stats/summary')
  @ApiOperation({ summary: '获取工单统计数据' })
  getStatistics() {
    return this.workOrderService.getStatistics();
  }
}
