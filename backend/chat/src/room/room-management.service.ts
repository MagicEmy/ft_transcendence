import { Injectable, Logger } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { Room } from 'src/entities/room.entity'
import { User } from 'src/entities/user.entity'
import {
  CreateRoomDto,
  DoWithUserDto,
  RoomShowDto,
  UserDto,
  UpdateRoomDto,
} from 'src/dto/chat.dto'
import { RoomPermissionService } from './room-permission.service'

@Injectable()
export class RoomManagementService {
    constructor(
        private userService: UserService,
        private roomPermissionService: RoomPermissionService
    ) {}

  private rooms: Room[] = [
    {
      roomName: 'general',
      host: null,
      admins: [],
      users: [],
      banned: [],
      muteds: [],
      exclusive: false,
      direct: false,
      password: '',
      messages: [],
    },
  ]
  private logger = new Logger('RoomManagementService')

  async addRoom ({
    user: host,
    roomName,
    exclusive,
    password,
  }: CreateRoomDto): Promise<string> {
    const hostUser: User | undefined = await this.userService.getUserById(
      host.userId,
    )
    if (!hostUser) return 'Not Existing User'
    this.logger.log('trying to add room roomName: ' + roomName)
    const room: number = await this.getRoomIndexByName(roomName)
    if (room !== -1) {
        this.logger.log('room is already existing')
        return 'Room Already Exists'
    }
    this.rooms.push({
        roomName: roomName,
        host: hostUser,
        admins: [hostUser],
        users: [hostUser],
        banned: [],
        muteds: [],
        exclusive,
        direct: false,
        password,
        messages: [],
      })
    this.logger.log( roomName + ' was added')
    return 'Success'
  }

  // direct room are created with this format an # followed by 
  // the userIds of the two users, the user with the lowest id is the first
  async addDirectRoom ({
    userCreator,
    userReceiver,
  }: DoWithUserDto): Promise<string> {
    const userStart: User | undefined = await this.userService.getUserById(
      userCreator.userId,
    )
    const userReceive: User | undefined = await this.userService.getUserById(
      userReceiver.userId,
    )
    if (!userStart || !userReceive) return 'Not Existing User'
    const blocked: string = await this.userService.checkBlockedUser(
      userCreator,
      userReceiver.userId,
    )
    if (blocked !== 'Not Blocked') {
      return blocked
    }
    let chatId = ''
    if (userStart.userId < userReceive.userId)
      chatId = '#' + userStart.userId + userReceive.userId
    else chatId = '#' + userReceive.userId + userStart.userId
    const room: number = await this.getRoomIndexByName(chatId)
    if (room !== -1) {
        this.logger.log('room is already existing')
        return chatId
    }
      
    this.rooms.push({
        roomName: chatId,
        host: null,
        admins: [],
        users: [userStart, userReceive],
        banned: [],
        muteds: [],
        exclusive: false,
        direct: true,
        password: '',
        messages: [],
      })
    this.logger.log('Direct room ' + chatId + ' was added')
    return chatId
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms
  }

  // it returns only rooms that are public or protected with password
  async getRoomsAvailable (): Promise<RoomShowDto[]> {
    const rooms: RoomShowDto[] = []
    this.rooms.forEach((room, index) => {
      if (!room.exclusive && !room.direct) {
        let roomToAdd: RoomShowDto
        if (room.roomName === 'general') {
          roomToAdd = {
            roomName: this.rooms[index].roomName,
            password: false,
            exclusive: false,
            owner: '',
          }
        } else {
          roomToAdd = {
            roomName: this.rooms[index].roomName,
            password: this.rooms[index].password !== '',
            exclusive: false,
            owner: this.rooms[index].host.userId,
          }
        }
        rooms.push(roomToAdd)
      }
    })
    return rooms
  }

  async getMyRooms (userId: UserDto['userId']): Promise<RoomShowDto[]> {
    const myRooms: RoomShowDto[] = []
    for (const [index, room] of this.rooms.entries()) {
      const isUser = await this.roomPermissionService.isUser(index, userId);
      if (!room.direct && isUser) {
        let roomShow: RoomShowDto;
        if (room.roomName === 'general') {
          roomShow = {
            roomName: room.roomName,
            password: false,
            exclusive: false,
            owner: '',
          };
        } else {
          roomShow = {
            roomName: room.roomName,
            password: room.password !== '',
            exclusive: room.exclusive,
            owner: room.host.userId,
          };
        }
        myRooms.push(roomShow);
      }
    }
    return myRooms
  }

  async getRoomIndexByName (roomName: Room['roomName']): Promise<number> {
    const roomIndex: number = this.rooms.findIndex(
      room => room.roomName === roomName,
    )
    return roomIndex
  }

  // group rooms can be of three tipes: public, protected with password or private
  async updateRoom ({
    user,
    roomName,
    updatePassword,
    newPassword,
    updateExclusive,
  }: UpdateRoomDto): Promise<string> {
    const hostUser: User | undefined = await this.userService.getUserById(
      user.userId,
    )
    if (!hostUser) return 'Not Existing User'
    const roomIndex: number = await this.getRoomIndexByName(roomName)
    if (roomIndex === -1) return 'Not Existing Room'
    
    this.roomPermissionService.validateRoomForAction(this.rooms[roomIndex]);
    if (!(await this.roomPermissionService.isOwner(roomIndex, hostUser.userId)))
      return 'Not Authorized User'
    let response: string = ''
    if (updatePassword) {
      
      this.rooms[roomIndex].password = newPassword
    
      this.rooms[roomIndex].exclusive = false
      if (this.rooms[roomIndex].password === '') {
        response = 'Success Room is Now Protected'
      } else if (newPassword === '') {
        response = 'Success Room is Now Public'
      } else {
        response = 'Success Password Updated'
      }
    } else {
      this.rooms[roomIndex].exclusive = updateExclusive
      this.rooms[roomIndex].password = ''
      response = 'Success Room is Now Exclusive'
    }
    return response
  }
  async removeRoom (roomName: Room['roomName']): Promise<string> {
    const room: number = await this.getRoomIndexByName(roomName)
    if (room === -1) {
      return 'Not Existing Room'
    }
    if (this.rooms[room].roomName === 'general') {
      return 'general Room Cannot Be Removed'
    }
    this.rooms.splice(room, 1)
  }
}
