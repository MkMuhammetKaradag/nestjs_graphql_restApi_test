import { Controller, Get } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { AuthGuard } from '@app/shared/auth.guard';

@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly sharedService: SharedService,
    private readonly authGuard: AuthGuard,
  ) {}

  @Get()
  getHello(): string {
    return this.presenceService.getHello();
  }

  @MessagePattern({ cmd: 'get-presence' })
  async getUser(@Ctx() context: RmqContext) {
    // const channel = context.getChannelRef();
    // const originalMessage = context.getMessage();
    // channel.ack(originalMessage);
    this.sharedService.acknowledgeMessage(context);
    console.log('123', this.authGuard.hasJwt());
    return this.authGuard.hasJwt();
  }
}
