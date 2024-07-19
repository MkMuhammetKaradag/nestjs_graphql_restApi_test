import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ClientProxy } from '@nestjs/microservices';

import { Observable, switchMap, catchError } from 'rxjs';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    if (ctx.getType() !== 'http' && ctx.getType().toString() !== 'graphql')
      return next.handle();
    const gqlContext = GqlExecutionContext.create(ctx);
    const { req } = gqlContext.getContext();

    const request = ctx.switchToHttp().getRequest();
    // const authHeader = request.headers['authorization'];
    console.log('hello');
    const authHeader =
      ctx.getType().toString() !== 'graphql'
        ? (request.headers['authorization'] as string)
        : (req.headers.authorization as string);

    if (!authHeader) return next.handle();

    const authHeaderParts = authHeader.split(' ');

    if (authHeaderParts.length !== 2) return next.handle();

    const [, jwt] = authHeaderParts;

    return this.authService.send({ cmd: 'decode-jwt' }, { jwt }).pipe(
      switchMap(({ user }) => {
        request.user = user;
        req.user = user;
        return next.handle();
      }),
      catchError(() => next.handle()),
    );
  }
}
