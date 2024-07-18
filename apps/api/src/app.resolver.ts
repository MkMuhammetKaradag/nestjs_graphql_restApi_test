import { Inject, UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { User } from './entities/user.entity';
import { AuthGuard } from '@app/shared';
import { GetPresenceResponse } from './types/presence.types';

@Resolver('app')
export class AppResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    @Inject('PRESENCE_SERVICE')
    private readonly presenceService: ClientProxy,
  ) {}
  @Query(() => [User])
  async getUsers() {
    return this.authService.send(
      {
        cmd: 'get-user',
      },
      {},
    );
  }

  @Query(() => GetPresenceResponse)
  @UseGuards(AuthGuard)
  async getPresence(@Context() context: { req: Request }) {
    console.log('graphql');
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }
}
