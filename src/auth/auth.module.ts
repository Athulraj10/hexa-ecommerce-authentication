import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RabbitMQModule } from 'src/rabbitMQ/rabbitmq.module';
import { ResponseService } from 'src/services/response';
import { JwtService } from 'src/services/jwt.service'; // Use custom JwtService
import { UUIDService } from 'src/services/uuid.service';
import { UserDatabaseService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { RefreshToken } from 'src/database/entities/refreshToken.entity';
import { ConfigModule } from '@nestjs/config';

import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'config/jwt.config';
import { JwtConfigModule } from 'src/jwt config/jwt.register.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, RefreshToken]),
    RabbitMQModule,
    JwtConfigModule
  ],
  controllers: [AuthController],
  providers: [
    ResponseService,
    JwtService, 
    UUIDService,
    UserDatabaseService,
  ],
})
export class AuthModule {}