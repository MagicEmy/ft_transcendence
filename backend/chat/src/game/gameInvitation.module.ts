import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { GameInvitation } from './game-invitation.service';

@Module({
  imports: [UserModule, KafkaModule],
  providers: [GameInvitation],
  exports: [GameInvitation],
})
export class GameInvitationModule {}
