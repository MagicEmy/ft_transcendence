import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [RoomController],
  providers: [RoomService, UserService],
  exports: [RoomService],
})
export class RoomModule {}
