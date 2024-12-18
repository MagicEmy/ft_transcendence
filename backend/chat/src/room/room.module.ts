import { Module } from '@nestjs/common';
import { RoomManagementService } from './room-management.service';
import { RoomUserManagementService } from './room-user-management.service';
import { RoomPermissionService } from './room-permission.service';
import { RoomModerationService } from './room-moderation.service';
import { RoomMessageService } from './room-message.service';
import { RoomRouterService } from './room-router.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    RoomManagementService,
    RoomUserManagementService,
    RoomPermissionService,
    RoomModerationService,
    RoomMessageService,
    RoomRouterService
  ],
  exports: [
    RoomManagementService,
    RoomUserManagementService,
    RoomPermissionService,
    RoomModerationService,
    RoomMessageService,
    RoomRouterService
  ],
})
export class RoomModule {}