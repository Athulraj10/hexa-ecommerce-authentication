import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'config/jwt.config';

@Module({
  imports: [
    JwtModule.register({
      secret:"jwtrefreshcrytoncode", //jwtConfig.jwtAccessTokenSecret, // Access token secret
      signOptions: { expiresIn: jwtConfig.accessTokenExpiresIn }, // Access token expiration
    }),
  ],
  exports: [JwtModule], // Export JwtModule to make it available in other modules
})
export class JwtConfigModule {
    constructor(){
        console.log(JwtModule)
        console.log({jwtConfig})
    }
}