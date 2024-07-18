import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard {
  constructor() {}

  hasJwt() {
    return {
      jwt: 'token',
    };
  }
}
