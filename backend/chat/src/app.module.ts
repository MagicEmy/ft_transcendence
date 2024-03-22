import { Module } from '@nestjs/common';
import { ChatGatewayModule } from './gateway/chat.gateway.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ChatGatewayModule],
})
export class AppModule {}
