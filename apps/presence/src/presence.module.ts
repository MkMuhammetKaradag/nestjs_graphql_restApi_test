import { Module } from '@nestjs/common';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedModule } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    SharedModule,
  ],
  controllers: [PresenceController],
  providers: [PresenceService, ConfigService],
})
export class PresenceModule {}
