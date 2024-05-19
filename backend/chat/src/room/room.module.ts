import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
