import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  getHello(): { message: string } {
    return {
      message: 'hello mami',
    };
  }
}
