import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomModule } from 'src/room/room.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports : [RoomModule, UserModule],
    providers: [ChatGateway]
})
export class ChatGatewayModule {}
