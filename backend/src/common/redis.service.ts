import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async setSensorData(pondId: string, data: any): Promise<void> {
    const key = `sensor:latest:${pondId}`;
    await this.client.set(key, JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    }));
  }

  async getSensorData(pondId: string): Promise<any> {
    const key = `sensor:latest:${pondId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async getSensorHistory(pondId: string, limit: number = 10): Promise<any[]> {
    const listKey = `sensor:history:${pondId}`;
    const history = await this.client.lrange(listKey, 0, limit - 1);
    return history.map(item => JSON.parse(item));
  }

  async addSensorHistory(pondId: string, data: any): Promise<void> {
    const listKey = `sensor:history:${pondId}`;
    await this.client.lpush(listKey, JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    }));
    await this.client.ltrim(listKey, 0, 99);
  }
}
