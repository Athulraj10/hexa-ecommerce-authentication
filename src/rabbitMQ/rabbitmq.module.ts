import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitMqConfig } from './rabbitmq.config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: rabbitMqConfig.urls,
          queue: "auth_queue",
          queueOptions: rabbitMqConfig.queueOptions,
        },
      },
      // {
      //   name: 'PAYMENT_SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: rabbitMqConfig.urls,
      //     queue: rabbitMqConfig.queues.payment_queue,
      //     queueOptions: rabbitMqConfig.queueOptions,
      //   },
      // },
      // {
      //   name: 'PRODUCT_SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: rabbitMqConfig.urls,
      //     queue: rabbitMqConfig.queues.product_queue,
      //     queueOptions: rabbitMqConfig.queueOptions,
      //   },
      // },
      // {
      //   name: 'ORDER_SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: rabbitMqConfig.urls,
      //     queue: rabbitMqConfig.queues.order_queue,
      //     queueOptions: rabbitMqConfig.queueOptions,
      //   },
      // },
      // {
      //   name: 'ADMIN_SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: rabbitMqConfig.urls,
      //     queue: rabbitMqConfig.queues.admin_queue,
      //     queueOptions: rabbitMqConfig.queueOptions,
      //   },
      // },
      // {
      //   name: 'PROFILE_SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: rabbitMqConfig.urls,
      //     queue: rabbitMqConfig.queues.profile_queue,
      //     queueOptions: rabbitMqConfig.queueOptions,
      //   },
      // },
      // {
      //   name: 'CENTERLIZED_DATABASE_SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: rabbitMqConfig.urls,
      //     queue: rabbitMqConfig.queues.database_queue,
      //     queueOptions: rabbitMqConfig.queueOptions,
      //   },
      // },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
