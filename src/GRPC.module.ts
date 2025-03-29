import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(process.cwd(), 'dist/proto/auth.proto'),
          url: 'localhost:4001',
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GRPCModule {
  constructor() {
    console.log('GRPCModule loaded successfully');
  }
}
