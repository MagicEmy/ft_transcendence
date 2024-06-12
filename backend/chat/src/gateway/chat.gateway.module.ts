import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomModule } from 'src/room/room.module';
import { UserModule } from 'src/user/user.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [RoomModule, UserModule, KafkaModule],
  providers: [ChatGateway],
})
export class ChatGatewayModule {}
