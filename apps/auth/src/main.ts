import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SharedService } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  // const USER = configService.get<string>('RABBITMQ_USER');
  // const PASSWORD = configService.get<string>('RABBITMQ_PASS');
  // const HOST = configService.get<string>('RABBITMQ_HOST');
  // const QUEUE = configService.get<string>('RABBITMQ_AUTH_QUEUE');

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
  //     noAck: false,
  //     queue: QUEUE,
  //     queueOptions: {
  //       durable: true,
  //     },
  //   },
  // });
  const sharedService = app.get(SharedService);
  const queue = configService.get<string>('RABBITMQ_AUTH_QUEUE');
  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
}
bootstrap();
