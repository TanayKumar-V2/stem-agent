import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.REDIS_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
  }

  getClient(): Redis {
    return this.redis;
  }
}
