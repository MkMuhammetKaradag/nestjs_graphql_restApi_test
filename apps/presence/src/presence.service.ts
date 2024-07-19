import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  async getHello(): Promise<{ message: string }> {
    console.log('NOT CACHED!');
    return {
      message: 'hello mami',
    };
  }
}
