import * as crypto from 'crypto';
(global as any).crypto = crypto;

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { RefreshToken } from './entities/refreshToken.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Ensures env variables are available
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        entities: [User, Address, RefreshToken],
      }),
    }),
    TypeOrmModule.forFeature([User, Address, RefreshToken]), // Import Entities
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
