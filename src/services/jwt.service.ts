import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtConfig } from 'config/jwt.config';

interface JwtPayload {
  email: string;
  role: string;
  userId: string;
}

@Injectable()
export class JwtService {
  constructor(private readonly jwt: NestJwtService) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(
      {
        email: payload.email,
        role: payload.role,
        userId: payload.userId,
      },
      {
        secret: jwtConfig.jwtAccessTokenSecret,
        expiresIn: jwtConfig.accessTokenExpiresIn, // Access token expiration
      },
    );
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(
      {
        email: payload.email,
        role: payload.role,
        userId: payload.userId,
      },
      {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshTokenExpiresIn, // Refresh token expiration
      },
    );
  }

  async verifyAccessToken(token: string): Promise<any> {
    try {
      return await this.jwt.verifyAsync(token, { secret: jwtConfig.jwtAccessTokenSecret });
    } catch (error) {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      return await this.jwt.verifyAsync(token, {
        secret: jwtConfig.refreshSecret,
      });
    } catch (error) {
      return null;
    }
  }
}