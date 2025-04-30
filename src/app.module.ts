import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RabbitMQModule } from './rabbitMQ/rabbitmq.module';
import { CustomConfigModule } from './config/config.module';

@Module({
  imports: [
    CustomConfigModule,
    DatabaseModule,
    RabbitMQModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    console.log('AppModule initialized');
  }
}