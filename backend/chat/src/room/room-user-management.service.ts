import { Injectable, Logger } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { RoomManagementService } from './room-management.service'
import { RoomPermissionService } from './room-permission.service'
import { User } from 'src/entities/user.entity'
import { RoomUserDto, RoomDto, UserDto, UserShowDto } from '../dto/chat.dto'
import { Room } from 'src/entities/room.entity'

@Injectable()
export class RoomUserManagementService {
  constructor (
    private readonly userService: UserService,
    private readonly roomManagementService: RoomManagementService,
    private readonly roomPermissionService: RoomPermissionService,
  ) {}
  private logger = new Logger('RoomUserMenagementService')

  async addNewUserToRoom (
    roomName: RoomDto['roomName'],
    userId: UserDto['userId'],
    password: string,
  ): Promise<string> {
    const newUser: User | undefined = await this.userService.getUserById(userId)
    if (!newUser) {
      throw 'Not Existing User'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex !== -1) {
      if (rooms[roomIndex].direct) {
        return 'You Are Not Authorized'
      }
      if (await this.roomPermissionService.isBanned(roomIndex, userId)) {
        return 'You Are Banned'
      }
      if (rooms[roomIndex].password !== password) {
        return 'You Are Not Authorized'
      }
      if (
        rooms[roomIndex].exclusive &&
        !(await this.roomPermissionService.isUser(roomIndex, userId))
      ) {
        return 'You Are Not Authorized'
      }
      if (await this.roomPermissionService.isOwner(roomIndex, userId)) {
        rooms[roomIndex].host.socketId = newUser.socketId
        return 'Success'
      }
      if (await this.roomPermissionService.isUser(roomIndex, userId)) {
        return 'Success'
      }
      rooms[roomIndex].users.push(newUser)
      return 'Success'
    }
    return 'Not existing Room'
  }

  async addUserToRoom (
    roomName: Room['roomName'],
    user: UserDto['userId'],
    userToAdd: string,
  ): Promise<string> {
    const newUser: User | undefined = await this.userService.getUserById(user)
    const toAddser: User | undefined = await this.userService.getUserById(
      userToAdd,
    )

    if (!newUser || !toAddser) {
      throw 'Not Existing User'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex !== -1) {
      if (rooms[roomIndex].direct || rooms[roomIndex].roomName === 'general') {
        return 'You Are Not Authorized'
      }
      if (await this.roomPermissionService.isAdmin(roomIndex, user)) {
        if (await this.roomPermissionService.isUser(roomIndex, userToAdd)) {
          return 'Already User'
        } else {
          rooms[roomIndex].users.push(toAddser)
          return 'Success'
        }
      }
    }
    return 'You Are Not Authorized'
  }

  async removeUserFromRoom (
    roomName: Room['roomName'],
    userId: User['userId'],
  ): Promise<void> {
    console.log(roomName + 'remove user')
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex === -1) throw 'Not Existing Room'
    const rooms: Room[] = await this.roomManagementService.getRooms()
    if (rooms[roomIndex].direct) throw 'Not Authorized User'

    rooms[roomIndex].users = rooms[roomIndex].users.filter(
      user => user.userId !== userId,
    )
    if (rooms[roomIndex].roomName === 'general') return
    rooms[roomIndex].admins = rooms[roomIndex].admins.filter(
      user => user.userId !== userId,
    )
    if (await this.roomPermissionService.isOwner(roomIndex, userId)) {
      if (rooms[roomIndex].admins && rooms[roomIndex].admins.length !== 0) {
        rooms[roomIndex].host = rooms[roomIndex].admins[0]
      } else if (
        rooms[roomIndex].users &&
        rooms[roomIndex].users.length !== 0
      ) {
        if (
          await this.roomPermissionService.isBanned(
            roomIndex,
            rooms[roomIndex].users[0].userId,
          )
        )
          rooms[roomIndex].banned = rooms[roomIndex].banned.filter(
            user => user.userId !== rooms[roomIndex].users[0].userId,
          )
        rooms[roomIndex].host = rooms[roomIndex].users[0]
        rooms[roomIndex].admins.push(rooms[roomIndex].users[0])
      }
    }
    if (!rooms[roomIndex].users || rooms[roomIndex].users.length === 0)
      await this.roomManagementService.removeRoom(roomName)
  }

  async kickUserFromRoom (
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toKick: UserDto['userId'],
  ): Promise<string> {
    console.log(roomName)
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    if (roomIndex === -1) {
      throw 'Not Existing Room'
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    if (rooms[roomIndex].direct || rooms[roomIndex].roomName === 'general')
      throw 'Not Authorized User'
    const tokick: User | undefined = await this.userService.getUserById(toKick)
    if (!tokick) throw 'Not Existing User'
    if (await this.roomPermissionService.isBanned(roomIndex, tokick.userId))
      return 'User Is Banned'
    if (
      (await this.roomPermissionService.isAdmin(roomIndex, user)) &&
      !(await this.roomPermissionService.isOwner(roomIndex, toKick))
    ) {
      await this.removeUserFromRoom(roomName, tokick.userId)
    } else return 'Not Authorized User'
    return 'Success'
  }

  async getUserInRoom (roomName: Room['roomName']): Promise<RoomUserDto> {
    const roomIndex: number =
      await this.roomManagementService.getRoomIndexByName(roomName)
    let roomUsersList: RoomUserDto = {
      roomName: roomName,
      users: [],
    }
    if (roomIndex === -1) {
      return roomUsersList
    }
    const rooms: Room[] = await this.roomManagementService.getRooms()
    await this.roomPermissionService.cronUnmute(roomIndex)
    const userList: UserShowDto[] = []
    for (const user of rooms[roomIndex].users) {
      const oldUser: UserShowDto = {
        userId: user.userId,
        userName: user.userName,
        isMuted: await this.roomPermissionService.isMuted(roomIndex, user),
        isBanned: await this.roomPermissionService.isBanned(
          roomIndex,
          user.userId,
        ),
        isAdmin: await this.roomPermissionService.isAdmin(
          roomIndex,
          user.userId,
        ),
        isOwner: await this.roomPermissionService.isOwner(
          roomIndex,
          user.userId,
        ),
        userBeenBlocked:
          await this.userService.getAllBlockingUsersByBlockedUserId(
            user.userId,
          ),
        online: user.online,
      }
      userList.push(oldUser)
    }
    roomUsersList.users = userList
    return roomUsersList
  }

  async getRoomByUserSocketId (socketId: User['socketId']): Promise<Room[]> {
    const rooms: Room[] = await this.roomManagementService.getRooms()
    const filteredRooms: Room[] = rooms.filter(room => {
      const found: User = room.users.find(user => user.socketId === socketId)
      if (found) {
        return found
      }
    })
    return filteredRooms
  }

  async getRoomWithUserByUserID (userId: UserDto['userId']): Promise<string[]> {
    const rooms: Room[] = await this.roomManagementService.getRooms()
    const userRooms: string[] = []
    rooms.forEach(element => {
      if (element.users.length !== 0)
        if (element.users.find(user => user.userId === userId) !== undefined)
          userRooms.push(element.roomName)
    })
    return userRooms
  }
}
