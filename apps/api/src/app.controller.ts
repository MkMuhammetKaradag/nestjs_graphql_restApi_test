import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import {
  AuthGuard,
  UserEntity,
  UserInterceptor,
  UserRequest,
} from '@app/shared';
import { PubSub } from 'graphql-subscriptions';
import { User } from './entities/user.entity';
import { catchError, of, switchMap } from 'rxjs';
import { PUB_SUB } from './pubSub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
const POST_ADDED_EVENT = 'postAdded';
@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    @Inject('PRESENCE_SERVICE')
    private readonly presenceService: ClientProxy,
    private readonly appService: AppService,

    @Inject(PUB_SUB)
    private pubSub: RedisPubSub,
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

  @UseGuards(AuthGuard)
  @Get('presence')
  async getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }

  @Post('auth/register')
  async register(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const res = this.authService
      .send(
        {
          cmd: 'register',
        },
        {
          firstName,
          lastName,
          email,
          password,
        },
      )
      .pipe(
        switchMap((user) => {
          this.pubSub.publish(POST_ADDED_EVENT, {
            postAdded: {
              ...user,
            },
          });
          return of(user);
        }),
        catchError(() => {
          throw new HttpException(
            'User already exists',
            HttpStatus.BAD_REQUEST,
          );
        }),
      );

    return res;
  }

  @Post('auth/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send(
      {
        cmd: 'login',
      },
      {
        email,
        password,
      },
    );
  }

  // Note: This would be done already from the main Facebook App thus simple end point provided to simplify this process.
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('add-friend/:friendId')
  async addFriend(
    @Req() req: UserRequest,
    @Param('friendId') friendId: number,
  ) {
    if (!req?.user) {
      throw new BadRequestException();
    }

    return this.authService.send(
      {
        cmd: 'add-friend',
      },
      {
        userId: req.user.id,
        friendId,
      },
    );
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('get-friends')
  async getFriends(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException();
    }

    return this.authService.send(
      {
        cmd: 'get-friends',
      },
      {
        userId: req.user.id,
      },
    );
  }
}
