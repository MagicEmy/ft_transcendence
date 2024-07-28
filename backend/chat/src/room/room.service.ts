import { Injectable, Logger } from '@nestjs/common';
import {
  CreateRoomDto,
  DoWithUserDto,
  MessageDto,
  MutedDto,
  RoomDto,
  RoomShowDto,
  UserDto,
  UserAndRoom,
  UserShowDto,
  RoomUserDto,
  UpdateRoomDto,
  MessageRoomDto,
  MessageUserDto,
} from '../dto/chat.dto';
import { User } from 'src/entities/user.entity';
import { Room } from 'src/entities/room.entity';
import { UserService } from '../user/user.service';
import { Message } from 'src/entities/message.entity';

@Injectable()
export class RoomService {
  constructor(private userService: UserService) {}

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
  ];

  private logger = new Logger('RoomService');

  // methods that menage rooms
  async addRoom({
    user: host,
    roomName,
    exclusive,
    password,
  }: CreateRoomDto): Promise<string> {
    const hostUser : User | undefined = await this.userService.getUserById(host.userId);
    if (!hostUser) return 'Not Existing User';

    const room : number = await this.getRoomIndexByName(roomName);
    if (room === -1) {
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
      });
    } else return 'Already Existing Room';
    return 'Success';
  }

  async addDirectRoom({
    userCreator,
    userReceiver,
  }: DoWithUserDto): Promise<string> {
    const userStart : User | undefined = await this.userService.getUserById(userCreator.userId);
    const userReceive : User | undefined = await this.userService.getUserById(userReceiver.userId);
    if (!userStart || !userReceive)
      return 'Not Existing User';
    const blocked : string = await this.userService.checkBlockedUser(userCreator, userReceiver.userId);
    if (blocked !== 'Not Blocked') {
      return blocked;
    }
    let chatId = '';
    if (userStart.userId > userReceiver.userId)
      chatId = "#" + userCreator.userId + userReceiver.userId;
    else chatId = "#" + userReceiver.userId + userCreator.userId;
    const room : number = await this.getRoomIndexByName(chatId);
    if (room === -1) {
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
      });
    }
    return chatId;
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms;
  }
  // it shows only rooms that are public or protected with password
  async getRoomsAvailable(): Promise<RoomShowDto[]> {
    const rooms: RoomShowDto[] = [];
    this.rooms.forEach((room, index) => {
      if (!room.exclusive && !room.direct) {
        let roomToAdd: RoomShowDto;
        if (room.roomName === 'general') {
          roomToAdd = {
            roomName: this.rooms[index].roomName,
            password: false,
            exclusive: false,
            owner: "",
          };
        } else {
          roomToAdd = {
            roomName: this.rooms[index].roomName,
            password: this.rooms[index].password !== '',
            exclusive: false,
            owner: this.rooms[index].host.userId,
          };
        }
        rooms.push(roomToAdd);
      }
    });
    return rooms;
  }

  async getMyRooms(userId: UserDto['userId']): Promise<RoomShowDto[]> {
    const myRooms: RoomShowDto[] = [];
    this.rooms.forEach(async (room, index) => {
      if (!room.direct && (await this.isUser(index, userId))) {
        let room: RoomShowDto;
        if (this.rooms[index].roomName === 'general') {
          
          room = {
            roomName: this.rooms[index].roomName,
            password: false,
            exclusive: false,
            owner: "",
          };
        } else {
           room = {
            roomName: this.rooms[index].roomName,
            password: this.rooms[index].password !== '',
            exclusive: this.rooms[index].exclusive,
            owner: this.rooms[index].host.userId,
          };
        }
        myRooms.push(room);
        }
    });
    this.logger.log("this rooms" + myRooms );
    return myRooms;
  }


  async getRoomIndexByName(roomName: Room['roomName']): Promise<number> {
    const roomIndex : number  = this.rooms.findIndex(
      (room) => room.roomName === roomName,
    );
    return roomIndex;
  }

  async updateRoom({
    user,
    roomName,
    updatePassword,
    newPassword,
    updateExclusive
  }: UpdateRoomDto): Promise<string> {
    const hostUser: User | undefined = await this.userService.getUserById(user.userId);
    if (!hostUser) return 'Not Existing User';
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) return 'Not Existing Room';
    if (! await this.isOwner(roomIndex, hostUser.userId)) return 'Not Authorized User';
    if (updatePassword) {
      this.rooms[roomIndex].password = newPassword;
      this.rooms[roomIndex].exclusive = false;
    }
    else {
      this.rooms[roomIndex].exclusive = updateExclusive;
      this.rooms[roomIndex].password = '';
    }
    return 'Success';
}
  async removeRoom(roomName: Room['roomName']): Promise<string> {
    const room : number = await this.getRoomIndexByName(roomName);
    if (room === -1) {
      return 'Not Existing Room';
    }
    if (this.rooms[room].roomName === 'general') {
      return 'general Room Cannot Be Removed';
    }
    this.rooms.splice(room, 1);
  }

  //  method that menage messages

  async broadcastMessage(payload: MessageDto): Promise<MessageRoomDto[] | string> {
    const roomIndex : number = await this.getRoomIndexByName(payload.roomName);
    if (roomIndex === -1) {
      this.logger.log(`${payload.roomName} does not exist`);
      return 'Not Existing Room';
    }
    const user : User | undefined = await this.userService.getUserById(payload.user.userId);
    if (!user) return 'Not Existing User';
    if (!(await this.isUser(roomIndex, user.userId))) {
      this.logger.log(`${user.userId} is not a user of the chat`);
      return 'You Are Not A Room Member';
    }
    const isMuted : boolean = await this.isMuted(roomIndex, user);
    if (isMuted) {
      this.logger.log(`${user.userId} is muted`);
      return 'You Are Muted';
    }
    const isBanned : boolean = await this.isBanned(roomIndex, user.userId)
    if (isBanned) {
      this.logger.log(`${user.userId} is banned`);
      return 'You Are Banned';
    }
    return await this.addMessageToRoom(roomIndex, user, payload);
  }

  async addMessageToRoom(
    roomIndex: number,
    user: User,
    messageDto: MessageDto,
  ): Promise<MessageRoomDto[]> {
    const message: Message = {
      user,
      message: messageDto.message,
      roomName: messageDto.roomName,
      timesent: new Date(),
    };
    this.logger.log(message);
    this.rooms[roomIndex].messages.push(message);
    const numberOfMessage : number = this.rooms[roomIndex].messages.length;
    if (numberOfMessage > 30)
      this.rooms[roomIndex].messages.splice(0, numberOfMessage - 30);
    const newUser: MessageUserDto = {
      userId: user.userId,
      userName: user.userName,
      blockedBy: await this.userService.getAllBlockingUsersByBlockedUserId(user.userId),
      blockedUsers: await this.userService.getAllBlockedUsersByBlockingUserId(user.userId),
    };
    const messageRoom: MessageRoomDto = {
      user: newUser,
      roomName: message.roomName,
      message: message.message,
      timesent: message.timesent,
    };
    return [messageRoom];
  }

  async getAllMessages(
    user: UserDto['userId'],
    roomName: string,
  ): Promise<MessageRoomDto[]> {
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'Not Existing Room';
    }
    const newUser : User | undefined = await this.userService.getUserById(user);
    if (newUser === undefined) {
      throw 'Not Existing User';
    }
    if (!(await this.isUser(roomIndex, newUser.userId))) {
      throw 'Not Room User';
    }
    let messages: MessageRoomDto[] = [];
    for (const message of this.rooms[roomIndex].messages){
      const user: MessageUserDto = {
        userId: message.user.userId,
        userName: message.user.userName,
        blockedBy: await this.userService.getAllBlockingUsersByBlockedUserId(message.user.userId),
        blockedUsers: await this.userService.getAllBlockedUsersByBlockingUserId(message.user.userId),
      };
      const messageDto: MessageRoomDto = {
        user: user,
        roomName: message.roomName,
        message: message.message,
        timesent: message.timesent,
      };
      messages.push(messageDto);
    };
    return messages;
  }

  //  method that menage users

  async isBanned(
    roomIndex: number,
    userId: UserDto['userId'],
  ): Promise<boolean> {
    const bannedList : User[] = this.rooms[roomIndex].banned;
    if (bannedList.length === 0) return false;
    const banned : User | undefined = bannedList.find((ban) => ban.userId === userId);
    console.log(banned);
    if (banned === undefined) return false;
    return true;
  }

  async isAdmin(
    roomIndex: number,
    userId: UserDto['userId'],
  ): Promise<boolean> {
    const adminList : User[]= this.rooms[roomIndex].admins;
    if (adminList.length === 0) return false;
    const admin : User | undefined = adminList.find((admin) => admin.userId === userId);
    if (admin !== undefined) return true;
    return false;
  }
  async cronUnmute(roomIndex: number): Promise<void> {
    const mutedList : MutedDto[]= this.rooms[roomIndex].muteds;
    if (mutedList.length === 0) return;
    const now = Date.now();
    this.rooms[roomIndex].muteds = mutedList.filter(
      (muted) => now / 1000 < muted.unmutedTime,
    );
  }

  async isMuted(roomIndex: number, user: User): Promise<boolean> {
    const mutedList : MutedDto[] = this.rooms[roomIndex].muteds;
    if (mutedList.length === 0) return false;
    await this.cronUnmute(roomIndex);
    const muted : MutedDto | undefined = mutedList.find((muted) => muted.userId === user.userId);
    if (muted !== undefined) {
      return true;
    }
    return false;
  }

  async isUser(roomIndex: number, userId: UserDto['userId']): Promise<boolean> {
    const userList : User[] = this.rooms[roomIndex].users;
    let isMember: boolean = false;
    userList.forEach((user) => {
      if (user.userId === userId) isMember = true;
    });

    return isMember;
  }

  async isOwner(
    roomIndex: number,
    userId: UserDto['userId'],
  ): Promise<boolean> {
    if (this.rooms[roomIndex].roomName === 'general' || this.rooms[roomIndex].direct) return false;
    return this.rooms[roomIndex].host.userId === userId;
  }

  async addNewUserToRoom(
    roomName: RoomDto['roomName'],
    userId: UserDto['userId'],
    password: string,
  ): Promise<string> {
    const newUser:  User | undefined={} = await this.userService.getUserById(userId);
    if (!newUser) {
      throw 'Not Existing User';
    }
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    if (roomIndex !== -1) {
      if (this.rooms[roomIndex].direct) {
        return 'You Are Not Authorized';
      }
      if (await this.isBanned(roomIndex, userId)) {
        return 'You Are Banned';
      }
      if (this.rooms[roomIndex].password !== password) {
        return 'You Are Not Authorized';
      }
      if (this.rooms[roomIndex].exclusive && !await this.isUser(roomIndex, userId)) {
        return 'You Are Not Authorized';
      }
      if (await this.isOwner(roomIndex, userId)) {
        this.rooms[roomIndex].host.socketId = newUser.socketId;
        return 'Success';
      }
      if (await this.isUser(roomIndex, userId)) {
        return 'Success';
      }
      this.rooms[roomIndex].users.push(newUser);
      return 'Success';
    } return 'Not existing Room';
  }

  async addUserToRoom(user: UserDto['userId'], roomName: Room['roomName'], userToAdd: string): Promise<string> {
    const newUser: User | undefined = await this.userService.getUserById(user);
    const toAddser : User | undefined = await this.userService.getUserById(userToAdd);

    if (!newUser || !toAddser)  {
      throw 'Not Existing User';
    }
    const roomIndex :number  = await this.getRoomIndexByName(roomName);
    if (roomIndex !== -1) {
      if (this.rooms[roomIndex].direct || this.rooms[roomIndex].roomName === 'general') {
        return 'You Are Not Authorized';
      }
      if (await this.isAdmin(roomIndex, user)) {
        if (await this.isUser(roomIndex, userToAdd)) {
          return 'Already User';
        }
        else {
          this.rooms[roomIndex].users.push(toAddser);
          return 'Success';
        }
      }
    }
    return 'You Are Not Authorized';
  }

  async addUserToBanned(
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toBan: UserDto['userId'],
  ): Promise<string> {
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'Not Existing Room';
    }
    if (this.rooms[roomIndex].direct || this.rooms[roomIndex].roomName === 'general') return 'Not Authorized User';
    const banUser : User | undefined = await this.userService.getUserById(toBan);
    if (!banUser) return 'Not Existing user';
    if (await this.isAdmin(roomIndex, user)) {
      if (await this.isBanned(roomIndex, banUser.userId))
        return 'Already Banned User';
      if (await this.isOwner(roomIndex, toBan))
        return 'Not Authorized User';
      this.rooms[roomIndex].banned.push(banUser);
      return 'Success';
    } else return 'Not Authorized User';
  }

  async addUserToUser(
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toExclusive: UserDto['userId'],
  ): Promise<string> {
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'Not Existing Room';
    }
    if (this.rooms[roomIndex].direct || this.rooms[roomIndex].roomName == 'general') throw 'Not Authorized User';
    const exclusiveUser : User | undefined = await this.userService.getUserById(toExclusive);
    if (!exclusiveUser) throw 'Not Existing User';
    if (await this.isAdmin(roomIndex, user)) {
      if (await this.isBanned(roomIndex, exclusiveUser.userId))
        return 'Banned User';
      if (await this.isUser(roomIndex, exclusiveUser.userId))
        return 'Already User';
      this.rooms[roomIndex].users.push(exclusiveUser);
      return 'Success';
    } else return 'Not Authorized User';
  }

  async addUserToAdmin(
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toAdmin: UserDto['userId'],
  ): Promise<string> {
    const roomIndex = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      return 'Not Existing Room';
    }
    if (this.rooms[roomIndex].direct || this.rooms[roomIndex].roomName === 'general') throw 'Not Authorized User';
    const adminUser : User | undefined = await this.userService.getUserById(toAdmin);
    if (!adminUser) return 'Not Existing User';
    if (await this.isAdmin(roomIndex, user)) {
      if (await this.isBanned(roomIndex, adminUser.userId))
        return 'Banned User';
      if (await this.isAdmin(roomIndex, adminUser.userId))
        return 'Already Admin User';
      this.rooms[roomIndex].admins.push(adminUser);
      return 'Success';
    } else return  'Not Authorized User';
  }

  async addUserToMuted(
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toMute: UserDto['userId'],
    timer: number,
  ): Promise<string> {
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'Not Existin Room';
    }
    if (this.rooms[roomIndex].direct || this.rooms[roomIndex].roomName === 'general') throw 'Not Authorized User';
    const muteUser : User | undefined = await this.userService.getUserById(toMute);
    if (!muteUser) throw 'Not Existing User';
    if (await this.isAdmin(roomIndex, user) && !await this.isAdmin(roomIndex, toMute)) {
      if (await this.isMuted(roomIndex, muteUser)) return 'Already Muted User';
      const timeEnd = Date.now() / 1000 + timer;
      const mute: MutedDto = { userId: toMute, unmutedTime: timeEnd };
      this.rooms[roomIndex].muteds.push(mute);
      return 'Seccess';
    }
    return 'Not Authorized User';
  }

  async removeUserFromBanned(
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toUnban: UserDto['userId'],
  ): Promise<string> {
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'Not Existing Room';
    }
    if (this.rooms[roomIndex].direct) throw 'Not Authorized User';
    const toUnbanUser : User | undefined = await this.userService.getUserById(toUnban);
    if (!toUnbanUser) throw 'Not Existing User';
    if (await this.isAdmin(roomIndex, user)) {
      if ((await this.isBanned(roomIndex, toUnbanUser.userId)) != true)
        return 'Not Banned User';

      this.rooms[roomIndex].banned = this.rooms[roomIndex].banned.filter(
        (ban) => ban.userId !== toUnbanUser.userId,
      );
      return 'Success';
    } else return 'Not Authorized User';
  }

  async removeUserFromMuted(
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toUnmute: UserDto['userId'],
  ): Promise<string> {
    const roomIndex: number = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'Not Existing Room';
    }
    if (this.rooms[roomIndex].direct || this.rooms[roomIndex].roomName === 'general') throw 'Not Authorized User';
    const toUnmuteUser: User | undefined = await this.userService.getUserById(toUnmute);
    if (!toUnmuteUser) throw 'Not Existing User';
    if (await this.isAdmin(roomIndex, user)) {
      if ((await this.isMuted(roomIndex, toUnmuteUser)) !== true)
        return 'Not Muted User';

      this.rooms[roomIndex].muteds = this.rooms[roomIndex].muteds.filter(
        (mute) => mute.userId !== toUnmuteUser.userId,
      );
      return 'Success';
    } else return 'Not Authorized User';
  }

  async removeUserFromAdmin(
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toUnadmin: UserDto['userId'],
  ): Promise<string> {
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'Not Existing Room';
    }
    if (this.rooms[roomIndex].direct || this.rooms[roomIndex].roomName === 'general') throw 'Not Authorized User';
    const toUnadminUser : User | undefined = await this.userService.getUserById(toUnadmin);
    if (!toUnadminUser) throw 'Not Existing User';
    if (await this.isAdmin(roomIndex, user) && !await this.isOwner(roomIndex, toUnadmin)){
      if ((await this.isAdmin(roomIndex, toUnadminUser.userId)) !== true)
        return 'User Not An Admin';

      this.rooms[roomIndex].admins = this.rooms[roomIndex].admins.filter(
        (admin) => admin.userId !== toUnadminUser.userId,
      );
      return 'Success';
    } else return 'Not Authorized User';
  }

  async removeUserFromRoom(
    roomName: Room['roomName'],
    userId: User['userId'],
  ): Promise<void> {
    const roomIndex : number  = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) throw 'Not Existing Room';
    if (this.rooms[roomIndex].direct) throw 'Not Authorized User';

    this.rooms[roomIndex].users = this.rooms[roomIndex].users.filter(
      (user) => user.userId !== userId,
    );
    if (this.rooms[roomIndex].roomName === "general")
      return;
    this.rooms[roomIndex].admins = this.rooms[roomIndex].admins.filter(
      (user) => user.userId !== userId,
    );
    if (await this.isOwner(roomIndex, userId)) {
      if (
        this.rooms[roomIndex].admins &&
        this.rooms[roomIndex].admins.length !== 0
      ) {
        this.rooms[roomIndex].host = this.rooms[roomIndex].admins[0];
      } else if (
        this.rooms[roomIndex].users &&
        this.rooms[roomIndex].users.length !== 0
      ) {
        this.rooms[roomIndex].host = this.rooms[roomIndex].users[0];
        this.rooms[roomIndex].admins.push(this.rooms[roomIndex].users[0]);
      }
    }
    if (
      !this.rooms[roomIndex].users ||
      this.rooms[roomIndex].users.length === 0
    )
      await this.removeRoom(roomName);
  }

  async kickUserFromRoom(
    roomName: Room['roomName'],
    user: UserDto['userId'],
    toKick: UserDto['userId'],
  ): Promise<string> {
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    if (roomIndex === -1) {
      throw 'Not Existing Room';
    }
    if (this.rooms[roomIndex].direct || this.rooms[roomIndex].roomName === 'general') throw 'Not Authorized User';
    const tokick : User | undefined  = await this.userService.getUserById(toKick);
    if (!tokick) throw 'Not Existing User';
    if (await this.isBanned(roomIndex, tokick.userId)) return 'User Is Banned';
    if (await this.isAdmin(roomIndex, user) && !(await this.isOwner(roomIndex, toKick))) {
      await this.removeUserFromRoom(tokick.userId, roomName);
    } else return 'Not Authorized User';
    return 'Success';
  }

  async getUserInRoom(
    roomName: Room['roomName'],
  ): Promise<RoomUserDto> {
    const roomIndex : number = await this.getRoomIndexByName(roomName);
    let roomUsersList: RoomUserDto = {
      roomName: roomName,
      users: [],
    };
    if (roomIndex === -1) {
      return  roomUsersList;
    }
    await this.cronUnmute(roomIndex);
    const userList: UserShowDto[] = [];
    for (const user of this.rooms[roomIndex].users) {
      const oldUser: UserShowDto = {
        userId: user.userId,
        userName: user.userName,
        isMuted: await this.isMuted(roomIndex, user),
        isBanned: await this.isBanned(roomIndex, user.userId),
        isAdmin: await this.isAdmin(roomIndex, user.userId),
        isOwner: await this.isOwner(roomIndex, user.userId),
        userBeenBlocked: await this.userService.getAllBlockingUsersByBlockedUserId(user.userId),
        online: user.online,
      };
      userList.push(oldUser);
    }
    roomUsersList.users = userList;
    return roomUsersList;
  }

  async getRoomByUserSocketId(socketId: User['socketId']): Promise<Room[]> {
    const filteredRooms : Room[] = this.rooms.filter((room) => {
      const found : User = room.users.find((user) => user.socketId === socketId);
      if (found) {
        return found;
      }
    });
    return filteredRooms;
  }

  // //automatically reconnect to old chat
  async getRoomWithUserByUserID(userId: UserDto['userId']): Promise<string[]> {
    const roomList : Room[] = this.rooms;
    const userRooms: string[] = [];
    roomList.forEach((element) => {
      if (element.users.length !== 0)
        if (element.users.find((user) => user.userId === userId) !== undefined)
          userRooms.push(element.roomName);
    });
    return userRooms;
  }
}
