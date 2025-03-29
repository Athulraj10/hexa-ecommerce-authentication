import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { initializeDatabase } from './database/data-source';
import { rabbitMqConfig } from './rabbitMQ/rabbitmq.config';

async function bootstrap() {
  // 1. Database Initialization
  console.log('🔄 Initializing database...');
  await initializeDatabase();

  // 2. Create Parent Application (for shared modules/config)
  const app = await NestFactory.create(AppModule);

  // 3. Global Validation Setup (for both HTTP and gRPC)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. RabbitMQ Microservice Setup
  const configService = app.get(ConfigService);

  const rabbitMqService = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: rabbitMqConfig.urls,
      queue: 'auth_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // 5. gRPC Microservice Setup
  const grpcService = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      url: `0.0.0.0:${configService.get('GRPC_PORT', 4001)}`,
      protoPath: join(__dirname, '../proto/auth.proto'),
    },
  });

  // 6. Start all microservices
  await app.startAllMicroservices();

  // 7. Start HTTP Server (if needed)
  const httpPort = configService.get('HTTP_PORT', 3000);
  await app.listen(httpPort);

  console.log('\n🚀 Services Running:');
  console.log(`- gRPC: ${configService.get('GRPC_PORT', 4001)}`);
  console.log(`- RabbitMQ: Connected to ${configService.get('RABBITMQ_URL')}`);
  console.log(`- HTTP: ${httpPort}`);
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
