import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { initializeDatabase } from './database/data-source';
import { rabbitMqConfig } from './rabbitMQ/rabbitmq.config';
import { GrpcErrorInterceptor } from './grpc/interceptor/error.interceptor';
import { RpcCustomException } from './shared/exceptions/rpc-custom.exception';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { GrpcValidationInterceptor } from './pipes/grpc-validation.pipe';

async function bootstrap() {
  // 1. Database Initialization
  console.log('🔄 Initializing database...');
  await initializeDatabase();

  // 2. Create Parent Application (for shared modules/config)
  const app = await NestFactory.create(AppModule);

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //     transformOptions: { enableImplicitConversion: true },
  //     exceptionFactory: (errors) => {
  //       return new RpcCustomException(
  //         GrpcStatus.INVALID_ARGUMENT,
  //         'Validation failed',
  //         { errors: errors.map((e) => e.constraints) },
  //       );
  //     },
  //   }),
  // );

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
  const urlForGRPC =  `127.0.0.1:${configService.get('GRPC_PORT', 4001)}`;
  console.log({urlForGRPC}) 
  const grpcService = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      url:urlForGRPC,
      protoPath: join(process.cwd(), 'dist/src/proto/auth.proto'), 
    },
  });

// In bootstrap(), keep only one registration:
  // app.useGlobalInterceptors(new GrpcErrorInterceptor());
  // app.useGlobalInterceptors(new GrpcValidationInterceptor());
  // 6. Start all microservices
  await app.startAllMicroservices();

  

  // 7. Start HTTP Server (if needed)
  const httpPort = configService.get('HTTP_PORT', 4001);
  await app.listen(httpPort);

  console.log('\n🚀 Services Running:');
  console.log(`- RabbitMQ: Connected to ${configService.get('RABBITMQ_URL')}`);
  console.log(`- HTTP: ${httpPort}`);
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
