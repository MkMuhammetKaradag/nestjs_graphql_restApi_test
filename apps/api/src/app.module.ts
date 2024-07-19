import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedModule } from '@app/shared';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';

import { join } from 'path';
import { PubSub } from 'graphql-subscriptions';
import { PubSubModule } from './pubSub.module';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    PubSubModule,
    // GraphQLModule.forRootAsync({
    //   driver: ApolloDriver,
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     playground: Boolean(configService.get('GRAPHQL_PLAYGROUND')),
    //     autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //     installSubscriptionHandlers: true,
    //     subscriptions: {
    //       'graphql-ws': true,
    //       'subscriptions-transport-ws': true,
    //     },
    //   }),
    // }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      installSubscriptionHandlers: true,
      playground: false, // Playground'ı manuel olarak ekleyeceğiz
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams, webSocket, context) => {
            // console.log('connectionPara', context);
            if (connectionParams.authorization) {
              return {
                req: {
                  headers: {
                    authorization: connectionParams.authorization,
                  },
                },
              };
            }
            throw new Error('Missing auth token!');
          },
        },
      },
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    }),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq(
      'PRESENCE_SERVICE',
      process.env.RABBITMQ_PRESENCE_QUEUE,
    ),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppResolver,
    // {
    //   provide: 'AUTH_SERVICE',
    //   useFactory: (configService: ConfigService) => {
    //     const USER = configService.get<string>('RABBITMQ_USER');
    //     const PASSWORD = configService.get<string>('RABBITMQ_PASS');
    //     const HOST = configService.get<string>('RABBITMQ_HOST');
    //     const QUEUE = configService.get<string>('RABBITMQ_AUTH_QUEUE');
    //     return ClientProxyFactory.create({
    //       transport: Transport.RMQ,
    //       options: {
    //         urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
    //         queue: QUEUE,
    //         queueOptions: {
    //           durable: true,
    //         },
    //       },
    //     });
    //   },
    //   inject: [ConfigService],
    // },
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
})
export class AppModule {}
