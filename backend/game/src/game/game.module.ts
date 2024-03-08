import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'STATS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'stats',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'stats-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
