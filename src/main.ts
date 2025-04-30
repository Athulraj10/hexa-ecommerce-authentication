import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { initializeDatabase } from './database/data-source';
import { ValidationPipe } from '@nestjs/common';
import { GrpcErrorInterceptor } from './grpc/interceptor/error.interceptor';
import { RpcCustomException } from './shared/exceptions/rpc-custom.exception';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { rabbitMqConfig } from './rabbitMQ/rabbitmq.config';
import { CustomConfigModule } from './config/config.module';

async function bootstrap() {
  try {
    const configModule = await NestFactory.createApplicationContext(CustomConfigModule);
    const configService = configModule.get(ConfigService);

    console.log('🔄 Initializing database...');
    await initializeDatabase();
    
    const app = await NestFactory.create(AppModule);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          return new RpcCustomException(
            GrpcStatus.INVALID_ARGUMENT,
            'Validation failed',
            { errors: errors.map((e) => e.constraints) },
          );
        },
      }),
    );

    // Global interceptor
    app.useGlobalInterceptors(new GrpcErrorInterceptor());

    // RabbitMQ Microservice
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: rabbitMqConfig.urls,
        queue: configService.get('appEnvConfig.RABBITMQ_QUEUE'),
        queueOptions: {
          durable: true,
        },
      },
    });

    // gRPC Microservice
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(__dirname, 'proto/auth.proto'),
        url: `${configService.get('appEnvConfig.GRPC_HOST', '0.0.0.0')}:${configService.get('appEnvConfig.GRPC_PORT', '4001')}`,
      },
    });

    await app.startAllMicroservices();
    
    const httpPort = configService.get('appEnvConfig.HTTP_PORT');
    await app.listen(httpPort);

    console.log('\n🚀 Services Running:');
    console.log(`- RabbitMQ: Connected to ${configService.get('appEnvConfig.RABBITMQ_URL')}`);
    console.log(`- gRPC: ${configService.get('appEnvConfig.GRPC_HOST', '0.0.0.0')}:${configService.get('appEnvConfig.GRPC_PORT')}`);
    console.log(`- HTTP: ${httpPort}`);
  } catch (err) {
    console.error('❌ Bootstrap failed:', err);
    process.exit(1);
  }
}

bootstrap();