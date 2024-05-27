import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'GameService',
        transport: Transport.TCP,
        options: {
          host: 'game_service',
          port: 3007,
        },
      },
      {
        name: 'UserService',
        transport: Transport.TCP,
        options: {
          host: 'user_service',
          port: 3008,
        },
      },
      {
        name: 'StatsService',
        transport: Transport.TCP,
        options: {
          host: 'stats_service',
          port: 3009,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
