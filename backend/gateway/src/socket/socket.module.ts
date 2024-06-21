import { Module } from '@nestjs/common';
import { StatusGateway } from './socket.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'UserService',
        transport: Transport.TCP,
        options: {
          host: 'user_service',
          port: 3008,
        },
      },
    ]),
  ],
  providers: [StatusGateway],
})
export class SocketModule {}
