import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();
    // console.log('access->', req.headers, context.getType());

    if (
      context.getType() !== 'http' &&
      context.getType().toString() !== 'graphql' // graphql  yok yo kendin ekle export declare type ContextType = 'http' | 'ws' | 'rpc' | 'graphql'; yada stringe çevir ve karşılaştır
    ) {
      return false;
    }

    const authHeader =
      context.getType().toString() !== 'graphql'
        ? (context.switchToHttp().getRequest().headers[
            'authorization'
          ] as string)
        : (req.headers.authorization as string);

    if (!authHeader) return false;
    const authHeaderParts = (authHeader as string).split(' ');

    if (authHeaderParts.length !== 2) return false;

    const [, jwt] = authHeaderParts;
    console.log(jwt);
    return this.authService.send({ cmd: 'verify-jwt' }, { jwt }).pipe(
      switchMap(({ exp }) => {
        if (!exp) return of(false);

        const TOKEN_EXP_MS = exp * 1000;

        const isJwtValid = Date.now() < TOKEN_EXP_MS;

        return of(isJwtValid);
      }),
      catchError(() => {
        throw new UnauthorizedException();
      }),
    );
  }
}
