import { Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    @Inject('PRESENCE_SERVICE')
    private readonly presenceService: ClientProxy,
    private readonly appService: AppService,
  ) {}

  @Get('auth')
  async getUser() {
    return this.authService.send(
      {
        cmd: 'get-user',
      },
      {},
    );
  }

  @Post('auth')
  async postUser() {
    return this.authService.send(
      {
        cmd: 'post-user',
      },
      {},
    );
  }

  @Get('presence')
  async getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }
}
