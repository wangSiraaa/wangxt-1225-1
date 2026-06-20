import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { PondModule } from './modules/pond/pond.module';
import { MedicationModule } from './modules/medication/medication.module';
import { BatchModule } from './modules/batch/batch.module';
import { WorkOrderModule } from './modules/workorder/workorder.module';
import { DatabaseConfigService } from './config/database.config';
import { RedisConfigService } from './config/redis.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    CacheModule.registerAsync({
      useClass: RedisConfigService,
      isGlobal: true,
    }),
    PondModule,
    MedicationModule,
    BatchModule,
    WorkOrderModule,
  ],
})
export class AppModule {}
