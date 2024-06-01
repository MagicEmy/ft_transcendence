import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomModule } from 'src/room/room.module';
import { UserModule } from 'src/user/user.module';
import { KafkaConsumerService } from 'src/kafka/kafka-consumer.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Module({
    imports : [RoomModule, UserModule],
    providers: [ChatGateway, KafkaConsumerService, KafkaProducerService],
})
export class ChatGatewayModule {}
