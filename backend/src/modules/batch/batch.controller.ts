import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BatchService } from './batch.service';
import { CreateBatchDto, CreateSalesBatchDto } from './dto/batch.dto';

@ApiTags('批次管理')
@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get('list')
  @ApiOperation({ summary: '获取养殖批次列表' })
  @ApiQuery({ name: 'status', description: '状态', required: false })
  findAllBatches(@Query('status') status?: string) {
    return this.batchService.findAllBatches(status);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取养殖批次详情' })
  findOneBatch(@Param('id') id: string) {
    return this.batchService.findOneBatch(id);
  }

  @Post('create')
  @ApiOperation({ summary: '创建养殖批次' })
  createBatch(@Body() dto: CreateBatchDto) {
    return this.batchService.createBatch(dto);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: '标记养殖批次完成' })
  completeBatch(@Param('id') id: string) {
    return this.batchService.completeBatch(id);
  }

  @Get('sales/list')
  @ApiOperation({ summary: '获取销售批次列表' })
  @ApiQuery({ name: 'status', description: '状态', required: false })
  findAllSalesBatches(@Query('status') status?: string) {
    return this.batchService.findAllSalesBatches(status);
  }

  @Get('sales/:id')
  @ApiOperation({ summary: '获取销售批次详情' })
  findOneSalesBatch(@Param('id') id: string) {
    return this.batchService.findOneSalesBatch(id);
  }

  @Post('sales/create')
  @ApiOperation({ summary: '创建销售批次（出塘）' })
  createSalesBatch(@Body() dto: CreateSalesBatchDto) {
    return this.batchService.createSalesBatch(dto);
  }

  @Put('sales/:id/release')
  @ApiOperation({ summary: '放行销售批次（出塘）' })
  releaseSalesBatch(@Param('id') id: string) {
    return this.batchService.releaseSalesBatch(id);
  }

  @Put('sales/:id/inspect')
  @ApiOperation({ summary: '质检员确认（质检）' })
  inspectSalesBatch(
    @Param('id') id: string,
    @Body('passed') passed: boolean,
    @Body('inspector') inspector: string,
    @Body('report') report?: string,
  ) {
    return this.batchService.inspectSalesBatch(id, passed, inspector, report);
  }

  @Put('sales/:id/reject')
  @ApiOperation({ summary: '驳回销售批次' })
  rejectSalesBatch(@Param('id') id: string, @Body('reason') reason: string) {
    return this.batchService.rejectSalesBatch(id, reason);
  }

  @Get('pre-check/withdrawal')
  @ApiOperation({ summary: '预检停药期是否满足出塘条件' })
  @ApiQuery({ name: 'pondId', description: '池塘ID', required: true })
  @ApiQuery({ name: 'harvestDate', description: '计划出塘日期', required: true })
  preCheckWithdrawal(
    @Query('pondId') pondId: string,
    @Query('harvestDate') harvestDate: string,
  ) {
    return this.batchService.preCheckWithdrawal(pondId, harvestDate);
  }
}
