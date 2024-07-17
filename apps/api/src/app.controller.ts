import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    private readonly appService: AppService,
  ) {}

  @Get()
  async getUser() {
    return this.authService.send(
      {
        cmd: 'get-user',
      },
      {},
    );
  }
}
