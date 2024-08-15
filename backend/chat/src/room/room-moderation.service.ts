import { Injectable, Logger } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { RoomManagementService } from './room-management.service'
import { RoomPermissionService } from './room-permission.service'
import { User } from 'src/entities/user.entity'
import { UserDto, MutedDto } from '../dto/chat.dto'
import { Room } from 'src/entities/room.entity'

@Injectable()
export class RoomModerationService {
  constructor (
    private userService: UserService,
    private roomManagementService: RoomManagementService,
    private roomPermissionService: RoomPermissionService,
  ) {}
  private logger = new Logger('RoomModerationService')

  async addUserToBanned (
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toBan: UserDto['userId'],
  ): Promise<string> {
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex === -1) {
      this.logger.error('Not Existing Room')
      throw 'Not Existing Room'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    const room: Room = rooms[roomIndex]
    this.roomPermissionService.validateRoomForAction(room)
    const banUser: User | undefined = await this.userService.getUserById(toBan)
    if (!banUser) {
      this.logger.error('Not Existing User')
      throw 'Not Existing User'
    }
    if (!await this.roomPermissionService.isAdmin(roomIndex, user)) 
      return 'Not Authorized User'
    if (await this.roomPermissionService.isBanned(roomIndex, banUser.userId))
        return 'Already Banned User';
    if (await this.roomPermissionService.isOwner(roomIndex, toBan))
        return 'Not Authorized User';
    room.banned.push(banUser)
    this.logger.log(
      `User ${toBan} banned from room ${roomName} by user ${user}`,
    )
    return 'Success'
  }

  async addUserToUser (
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toExclusive: UserDto['userId'],
  ): Promise<string> {
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex === -1) {
      throw 'Not Existing Room'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    this.roomPermissionService.validateRoomForAction(rooms[roomIndex])

    const exclusiveUser: User | undefined = await this.userService.getUserById(
      toExclusive,
    )
    if (!exclusiveUser) throw 'Not Existing User'
    if (!(await this.roomPermissionService.isAdmin(roomIndex, user)))
      return 'Not Authorized User'
    if (
      await this.roomPermissionService.isBanned(roomIndex, exclusiveUser.userId)
    )
      return 'Banned User'
    if (
      await this.roomPermissionService.isUser(roomIndex, exclusiveUser.userId)
    )
      return 'Already User'

    if (
      await this.roomPermissionService.isUser(roomIndex, exclusiveUser.userId)
    ) {
      this.logger.error('Already User')
      return 'Already User'
    }

    rooms[roomIndex].users.push(exclusiveUser)
    return 'Success'
  }

  async makeUserAdmin (
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toAdmin: UserDto['userId'],
  ): Promise<string> {
    const roomIndex = await this.roomManagementService.getRoomIndexByName(
      roomName,
    )
    if (roomIndex === -1) {
      return 'Not Existing Room'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    this.roomPermissionService.validateRoomForAction(rooms[roomIndex])
    const adminUser: User | undefined = await this.userService.getUserById(
      toAdmin,
    )
    if (!(await this.roomPermissionService.isAdmin(roomIndex, user)))
      return 'Not Authorized User'
    if (await this.roomPermissionService.isBanned(roomIndex, adminUser.userId))
      return 'Banned User'
    if (await this.roomPermissionService.isAdmin(roomIndex, adminUser.userId))
      return 'Already Admin User'
    if (await this.roomPermissionService.isAdmin(roomIndex, adminUser.userId))
      return 'Already Admin User'
    rooms[roomIndex].admins.push(adminUser)
    return 'Success'
  }

  async addUserToMuted (
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toMute: UserDto['userId'],
    timer: number,
  ): Promise<string> {
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex === -1) {
      throw 'Not Existin Room'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    this.roomPermissionService.validateRoomForAction(rooms[roomIndex])
    const muteUser: User | undefined = await this.userService.getUserById(
      toMute,
    )
    if (!muteUser) throw 'Not Existing User'
    if (
      (await this.roomPermissionService.isAdmin(roomIndex, user)) &&
      !(await this.roomPermissionService.isAdmin(roomIndex, toMute))
    ) {
      if (await this.roomPermissionService.isMuted(roomIndex, muteUser))
        return 'Already Muted User'
      const timeEnd = Date.now() / 1000 + timer
      const mute: MutedDto = { userId: toMute, unmutedTime: timeEnd }
      const rooms: Room[] = await this.roomManagementService.getRooms()
      rooms[roomIndex].muteds.push(mute)
      return 'Seccess'
    }
  }

  async removeUserFromBanned (
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toUnban: UserDto['userId'],
  ): Promise<string> {
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex === -1) {
      throw 'Not Existing Room'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    this.roomPermissionService.validateRoomForAction(rooms[roomIndex])
    const toUnbanUser: User | undefined = await this.userService.getUserById(
      toUnban,
    )
    if (!toUnbanUser) throw 'Not Existing User'
    if (!(await this.roomPermissionService.isAdmin(roomIndex, user))) {
      this.logger.error('Not Authorized User')
      return 'Not Authorized User '
    }
    if (
      !(await this.roomPermissionService.isBanned(
        roomIndex,
        toUnbanUser.userId,
      ))
    )
      return 'Not Banned User'

    rooms[roomIndex].banned = rooms[roomIndex].banned.filter(
      ban => ban.userId !== toUnbanUser.userId,
    )
    return 'Success'
  }

  async removeUserFromMuted (
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toUnmute: UserDto['userId'],
  ): Promise<string> {
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex === -1) {
      throw 'Not Existing Room'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    this.roomPermissionService.validateRoomForAction(rooms[roomIndex])
    const toUnmuteUser: User | undefined = await this.userService.getUserById(
      toUnmute,
    )
    if (!toUnmuteUser) throw 'Not Existing User'
    if (!(await this.roomPermissionService.isAdmin(roomIndex, user)))
      return 'Not Authorized User'
    if (!(await this.roomPermissionService.isMuted(roomIndex, toUnmuteUser)))
      return 'Not Muted User'

    rooms[roomIndex].muteds = rooms[roomIndex].muteds.filter(
      mute => mute.userId !== toUnmuteUser.userId,
    )
    return 'Success'
  }

  async removeUserFromAdmin (
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toUnadmin: UserDto['userId'],
  ): Promise<string> {
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex === -1) {
      throw 'Not Existing Room'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    this.roomPermissionService.validateRoomForAction(rooms[roomIndex])
    const toUnadminUser: User | undefined = await this.userService.getUserById(
      toUnadmin,
    )
    if (!toUnadminUser) throw 'Not Existing User'
    if (!(await this.roomPermissionService.isOwner(roomIndex, user)))
      return 'Not Authorized User'
    if (
      !(await this.roomPermissionService.isAdmin(
        roomIndex,
        toUnadminUser.userId,
      ))
    )
      return 'Not Admin User'
    rooms[roomIndex].admins = rooms[roomIndex].admins.filter(
      admin => admin.userId !== toUnadminUser.userId,
    )
    return 'Success'
  }
}
