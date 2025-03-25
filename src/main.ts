import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  Transport,
  RpcException,
} from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { rabbitMqConfig } from './rabbitMQ/rabbitmq.config';
import { ConfigService } from '@nestjs/config';
import { initializeDatabase } from './database/data-source';

async function bootstrap() {
  console.log("🔄 Ensuring database exists...");
  await initializeDatabase();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: rabbitMqConfig.urls,
        queue: "auth_queue",
        queueOptions: rabbitMqConfig.queueOptions,
      },
    },
  );
  

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorDetails = errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        }));

        console.log({errors})

        throw new RpcException({
          status: 'error',
          message: 'Validation failed',
          errors: errorDetails,
        });
      },
    }),
  );

  const configService = app.get(ConfigService);

  // Debugging: Print all env variables
  console.log('PORT:', process.env.PORT);
  console.log(
    'PORT from ConfigService:',
    configService.get<number>('PORT', 3000),
  ); // Fallback to 3000
  console.log(
    'Database Config:',
    configService.get<string>('DB_HOST'),
    configService.get<number>('DB_PORT', 5432), // Fallback for safety
    configService.get<string>('DB_USERNAME'),
    configService.get<string>('DB_PASSWORD'),
    configService.get<string>('DB_NAME'),
  );

  await app.listen();
  console.log('✅ Auth Microservice is running');
}
bootstrap();
