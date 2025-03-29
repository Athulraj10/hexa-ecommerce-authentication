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
import { join } from 'path';

async function bootstrap() {
  console.log("🔄 Ensuring database exists...");
  await initializeDatabase();

  const app = await NestFactory.create(AppModule);

  // Apply global pipes to the app instance
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

        console.log({ errors });

        throw new RpcException({
          status: 'error',
          message: 'Validation failed',
          errors: errorDetails,
        });
      },
    }),
  );

  // Create RabbitMQ microservice
  const rabbitMqService = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: rabbitMqConfig.urls,
      queue: 'auth_queue',
      queueOptions: rabbitMqConfig.queueOptions,
    },
  });

  // Create gRPC microservice
  const grpcService = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(process.cwd(), 'dist/proto/auth.proto'), 
      url: 'localhost:4001',
    },
  });

  // Start RabbitMQ and gRPC microservices
  await rabbitMqService.listen();
  console.log('✅ RabbitMQ Microservice is running...');
  
  await grpcService.listen();
  console.log('✅ gRPC Auth Microservice is running on port 4001');

  // Additional configuration for HTTP service (if needed)
  const configService = app.get(ConfigService);

  console.log('PORT:', process.env.PORT);
  console.log('PORT from ConfigService:', configService.get<number>('PORT', 3000));
  console.log(
    'Database Config:',
    configService.get<string>('DB_HOST'),
    configService.get<number>('DB_PORT', 5432),
    configService.get<string>('DB_USERNAME'),
    configService.get<string>('DB_PASSWORD'),
    configService.get<string>('DB_NAME'),
  );

  // If your application also needs HTTP functionality (like health checks), you can uncomment the following:
  // await app.listen(3000); // For HTTP server
  console.log('✅ Auth Microservice is running');
}

bootstrap();
