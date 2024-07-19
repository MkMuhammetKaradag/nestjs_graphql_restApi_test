import { Inject, UseGuards } from '@nestjs/common';
import { Context, Query, Resolver, Subscription } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { User } from './entities/user.entity';
import { AuthGuard } from '@app/shared';
import { GetPresenceResponse } from './types/presence.types';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './pubSub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
const POST_ADDED_EVENT = 'postAdded';
@Resolver('app')
export class AppResolver {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    @Inject('PRESENCE_SERVICE')
    private readonly presenceService: ClientProxy,

    @Inject(PUB_SUB)
    private pubSub: RedisPubSub,
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

  // @UseInterceptors(UserInterceptor)
  @Subscription(() => User)
  @UseGuards(AuthGuard)
  postAdded(@Context() context: { req: Request }) {
    return this.pubSub.asyncIterator(POST_ADDED_EVENT);
  }
}
