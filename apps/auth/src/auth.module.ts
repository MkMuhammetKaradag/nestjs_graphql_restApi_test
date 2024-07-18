import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { dataSource, dataSourceOptions } from './db/data-source';

import {
  PostgresDBModule,
  SharedModule,
  SharedService,
  UsersRepository,
} from '@app/shared';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { JwtStrategy } from './jwt-strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   // useFactory: (configService: ConfigService) => ({
    //   //   type: 'postgres',
    //   //   url: configService.get<string>('POSTGRES_URI'),
    //   //   autoLoadEntities: true,
    //   //   synchronize: true, // shouldn't be used in production - may lose data
    //   // }),
    //   useFactory: () => ({
    //     ...dataSourceOptions,
    //     autoLoadEntities: true,
    //     synchronize: true, // shouldn't be used in production - may lose data
    //   }),
    //   inject: [ConfigService],
    // }),
    SharedModule,
    PostgresDBModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtGuard,
    JwtStrategy,
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
  ],
})
export class AuthModule {}
