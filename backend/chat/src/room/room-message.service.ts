import { Logger, Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { RoomManagementService } from './room-management.service'
import { RoomPermissionService } from './room-permission.service'
import { User } from 'src/entities/user.entity'
import { Room } from 'src/entities/room.entity'
import { Message } from 'src/entities/message.entity'
import {
  UserDto,
  MessageDto,
  MessageRoomDto,
  MessageUserDto,
} from 'src/dto/chat.dto'

@Injectable()
export class RoomMessageService {
  constructor (
    private userService: UserService,
    private roomPermissionService: RoomPermissionService,
    private roomManagementService: RoomManagementService,
  ) {}

  private logger = new Logger('RoomMessageService')
  async broadcastMessage (
    payload: MessageDto,
  ): Promise<MessageRoomDto[] | string> {
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(payload.roomName)
    if (roomIndex === -1) {
      this.logger.log(`${payload.roomName} does not exist`)
      return 'Not Existing Room'
    }
    const user: User | undefined = await this.userService.getUserById(
      payload.user.userId,
    )
    if (!user) return 'Not Existing User'
    if (!(await this.roomPermissionService.isUser(roomIndex, user.userId))) {
      this.logger.log(`${user.userId} is not a user of the chat`)
      return 'You Are Not A Room Member'
    }
    const isMuted: boolean = await this.roomPermissionService.isMuted(roomIndex, user)
    if (isMuted) {
      this.logger.log(`${user.userId} is muted`)
      return 'You Are Muted'
    }
    const isBanned: boolean = await this.roomPermissionService.isBanned(
      roomIndex,
      user.userId,
    )
    if (isBanned) {
      this.logger.log(`${user.userId} is banned`)
      return 'You Are Banned'
    }
    return await this.addMessageToRoom(roomIndex, user, payload)
  }

  async addMessageToRoom (
    roomIndex: number,
    user: User,
    messageDto: MessageDto,
  ): Promise<MessageRoomDto[]> {
    const message: Message = {
      user,
      message: messageDto.message,
      roomName: messageDto.roomName,
      timesent: new Date(),
    }
    this.logger.log(message)
    const rooms: Room[] = await this.roomManagementService.getRooms()
    rooms[roomIndex].messages.push(message)
    const numberOfMessage: number = rooms[roomIndex].messages.length
    if (numberOfMessage > 30)
      rooms[roomIndex].messages.splice(0, numberOfMessage - 30)
    const newUser: MessageUserDto = {
      userId: user.userId,
      userName: user.userName,
      blockedBy: await this.userService.getAllBlockingUsersByBlockedUserId(
        user.userId,
      ),
      blockedUsers: await this.userService.getAllBlockedUsersByBlockingUserId(
        user.userId,
      ),
    }
    const messageRoom: MessageRoomDto = {
      user: newUser,
      roomName: message.roomName,
      message: message.message,
      timesent: message.timesent,
    }
    return [messageRoom]
  }

  async getAllMessages (
    user: UserDto['userId'],
    roomName: string,
  ): Promise<MessageRoomDto[]> {
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex === -1) {
      throw 'Not Existing Room'
    }
    const newUser: User | undefined = await this.userService.getUserById(user)
    if (newUser === undefined) {
      throw 'Not Existing User'
    }
    if (!(await this.roomPermissionService.isUser(roomIndex, newUser.userId))) {
      throw 'Not Room User'
    }
    let messages: MessageRoomDto[] = []
    const rooms: Room[] = await this.roomManagementService.getRooms()
    for (const message of rooms[roomIndex].messages) {
      const user: MessageUserDto = {
        userId: message.user.userId,
        userName: message.user.userName,
        blockedBy: await this.userService.getAllBlockingUsersByBlockedUserId(
          message.user.userId,
        ),
        blockedUsers: await this.userService.getAllBlockedUsersByBlockingUserId(
          message.user.userId,
        ),
      }
      const messageDto: MessageRoomDto = {
        user: user,
        roomName: message.roomName,
        message: message.message,
        timesent: message.timesent,
      }
      messages.push(messageDto)
    }
    return messages
  }
}
