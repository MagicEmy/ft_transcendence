import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserModule } from 'src/user/user.module';
import { KafkaController } from './kafka.controller';

@Module({
  controllers: [KafkaController],
  imports: [
    UserModule,
    ClientsModule.register([
      {
        name: 'CHAT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'chat-client',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'game-consumer',
          },
        },
      },
    ]),
  ],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}
