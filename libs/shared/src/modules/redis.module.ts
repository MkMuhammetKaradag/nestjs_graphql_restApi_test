import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { redisStore } from 'cache-manager-redis-yet';

import { RedisCacheService } from '../services/redis-cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from '../services/redis.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get('REDIS_URI'),
          ttl: 5000,
        }),
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
  // providers: [RedisCacheService],
  // exports: [RedisCacheService],
})
export class RedisModule {}
