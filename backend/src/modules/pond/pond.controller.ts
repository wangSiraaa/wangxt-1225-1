import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PondService } from './pond.service';
import { CreatePondDto, UpdatePondDto } from './dto/pond.dto';
import { CreateWaterQualityDto } from './dto/water-quality.dto';
import { CreateMortalityDto } from './dto/mortality.dto';

@ApiTags('池塘管理')
@Controller('pond')
export class PondController {
  constructor(private readonly pondService: PondService) {}

  @Get()
  @ApiOperation({ summary: '获取所有池塘列表' })
  findAll() {
    return this.pondService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个池塘详情' })
  @ApiParam({ name: 'id', description: '池塘ID' })
  findOne(@Param('id') id: string) {
    return this.pondService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建池塘' })
  create(@Body() createPondDto: CreatePondDto) {
    return this.pondService.create(createPondDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新池塘信息' })
  @ApiParam({ name: 'id', description: '池塘ID' })
  update(@Param('id') id: string, @Body() updatePondDto: UpdatePondDto) {
    return this.pondService.update(id, updatePondDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除池塘' })
  @ApiParam({ name: 'id', description: '池塘ID' })
  remove(@Param('id') id: string) {
    return this.pondService.remove(id);
  }

  @Post('water-quality')
  @ApiOperation({ summary: '录入水质数据' })
  createWaterQuality(@Body() dto: CreateWaterQualityDto) {
    return this.pondService.createWaterQuality(dto);
  }

  @Get(':pondId/water-quality')
  @ApiOperation({ summary: '查询水质记录' })
  @ApiParam({ name: 'pondId', description: '池塘ID' })
  getWaterQualityRecords(@Param('pondId') pondId: string) {
    return this.pondService.getWaterQualityRecords(pondId);
  }

  @Post('mortality')
  @ApiOperation({ summary: '录入死亡率数据' })
  createMortality(@Body() dto: CreateMortalityDto) {
    return this.pondService.createMortality(dto);
  }

  @Get(':pondId/mortality')
  @ApiOperation({ summary: '查询死亡率记录' })
  @ApiParam({ name: 'pondId', description: '池塘ID' })
  getMortalityRecords(@Param('pondId') pondId: string) {
    return this.pondService.getMortalityRecords(pondId);
  }

  @Get(':pondId/sensor/latest')
  @ApiOperation({ summary: '获取传感器最新数据' })
  @ApiParam({ name: 'pondId', description: '池塘ID' })
  getSensorLatest(@Param('pondId') pondId: string) {
    return this.pondService.getSensorLatest(pondId);
  }

  @Get(':pondId/sensor/history')
  @ApiOperation({ summary: '获取传感器历史数据' })
  @ApiParam({ name: 'pondId', description: '池塘ID' })
  getSensorHistory(@Param('pondId') pondId: string) {
    return this.pondService.getSensorHistory(pondId);
  }

  @Get(':pondId/sensor/check-do')
  @ApiOperation({ summary: '检查溶氧是否连续偏低' })
  @ApiParam({ name: 'pondId', description: '池塘ID' })
  checkLowDissolvedOxygen(
    @Param('pondId') pondId: string,
    @Query('threshold') threshold?: number,
  ) {
    return this.pondService.checkLowDissolvedOxygen(pondId, threshold ? Number(threshold) : undefined);
  }
}
