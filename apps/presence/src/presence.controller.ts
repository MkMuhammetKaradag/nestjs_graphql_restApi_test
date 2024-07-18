import { Controller, Get, UseGuards } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { AuthGuard, SharedService } from '@app/shared';

@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly sharedService: SharedService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  getHello(): { message: string } {
    return this.presenceService.getHello();
  }

  @MessagePattern({ cmd: 'get-presence' })
  async getUser(@Ctx() context: RmqContext) {
    // const channel = context.getChannelRef();
    // const originalMessage = context.getMessage();
    // channel.ack(originalMessage);
    this.sharedService.acknowledgeMessage(context);

    return this.presenceService.getHello();
  }
}
