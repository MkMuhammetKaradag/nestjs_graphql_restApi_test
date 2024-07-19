import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { AuthGuard, RedisService, SharedService } from '@app/shared';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly sharedService: SharedService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getHello(): Promise<{ message: string }> {
    return await this.presenceService.getHello();
  }

  @MessagePattern({ cmd: 'get-presence' })
  @UseInterceptors(CacheInterceptor)
  async getFoo(@Ctx() context: RmqContext) {
    // cnst channel = context.getChannelRef();
    // const originalMessage = context.getMessage();
    // channel.ack(originalMessage);
    this.sharedService.acknowledgeMessage(context);
    const foo = await this.redisService.get('foo');
    if (foo) {
      console.log('cached');
      return foo;
    }
    const f = await this.presenceService.getHello();
    this.redisService.set('foo', f);
    return f;
  }
}
