import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { dataSource, dataSourceOptions } from './db/data-source';
import { PostgresDBModule } from '@app/shared/postgresdb.module';
import { SharedModule } from '@app/shared';

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
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
