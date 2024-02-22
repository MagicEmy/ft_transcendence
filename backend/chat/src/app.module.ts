import { Module } from '@nestjs/common';
import { ChatGatewayModule } from './gateway/chat.gateway.module';

@Module({
  imports: [ChatGatewayModule],
})
export class AppModule {}
