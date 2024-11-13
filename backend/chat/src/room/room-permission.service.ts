import { Injectable, Logger, forwardRef, Inject, } from '@nestjs/common';
import { RoomManagementService } from './room-management.service';
import { User } from 'src/entities/user.entity';
import { UserDto, MutedDto } from '../dto/chat.dto';
import { Room } from 'src/entities/room.entity';

@Injectable()
export class RoomPermissionService {
  constructor(
      @Inject(forwardRef(() => RoomManagementService))
      private readonly roomManagementService: RoomManagementService,
    ) { }
  
    
  private logger = new Logger('RoomPermissionService');

    async isBanned (
        roomIndex: number,
        userId: UserDto['userId'],
    ): Promise<boolean> {
        const rooms: Room[] = await this.roomManagementService.getRooms()
        const bannedList: User[] = rooms[roomIndex].banned
        if (bannedList.length === 0) return false
        const banned: User | undefined = bannedList.find(
          ban => ban.userId === userId,
        )
        console.log(banned)
        if (banned === undefined) return false
        return true
      }
    
      async isAdmin (
        roomIndex: number,
        userId: UserDto['userId'],
      ): Promise<boolean> {
        const rooms: Room[] = await this.roomManagementService.getRooms()
        const adminList: User[] = rooms[roomIndex].admins
        if (adminList.length === 0) return false
        const admin: User | undefined = adminList.find(
          admin => admin.userId === userId,
        )
        if (admin !== undefined) return true
        return false
      }

    async cronUnmute(roomIndex: number): Promise<void> {
        this.logger.log('Cron job for unmuting users')
        const rooms: Room[] = await this.roomManagementService.getRooms()
        const mutedList: MutedDto[] = rooms[roomIndex].muteds
        if (mutedList.length === 0) return
        const now = Date.now()
        rooms[roomIndex].muteds = mutedList.filter(
          muted => now / 1000 < muted.unmutedTime,
        )
      }
    
    async isMuted(roomIndex: number, user: User): Promise<boolean> {
        const rooms: Room[] = await this.roomManagementService.getRooms()
        const mutedList: MutedDto[] = rooms[roomIndex].muteds
        if (mutedList.length === 0) return false
        await this.cronUnmute(roomIndex)
        const muted: MutedDto | undefined = mutedList.find(
          muted => muted.userId === user.userId,
        )
        if (muted !== undefined) {
          return true
        }
        return false
      }
    
    async isUser (roomIndex: number, userId: UserDto['userId']): Promise<boolean> {
        const rooms: Room[] = await this.roomManagementService.getRooms()
        const userList: User[] = rooms[roomIndex].users
        let isMember: boolean = false
        userList.forEach(user => {
          if (user.userId === userId) isMember = true
        })
    
        return isMember
      }
    
    async isOwner(
        roomIndex: number,
        userId: UserDto['userId'],
    ): Promise<boolean> {
        const rooms: Room[] = await this.roomManagementService.getRooms()
        if (rooms[roomIndex].roomName === 'general' || rooms[roomIndex].direct)
          return false
        return rooms[roomIndex].host.userId === userId
      }
    


    validateRoomForAction(room: Room): void {
        if (room.direct || room.roomName === 'general') {
          this.logger.error(`Unauthorized attempt to do action in room ${room.roomName}`);
          throw   'Not authorized to do actions in this room';
        }
      }
}