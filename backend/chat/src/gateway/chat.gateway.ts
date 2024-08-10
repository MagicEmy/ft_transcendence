import {
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  CreateRoomDto,
  MessageDto,
  JoinRoomDto,
  UserDto,
  DoWithUserDto,
  RoomShowDto,
  UserAndRoom,
  ToDoUserRoomDto,
  UpdateRoomDto,
  MessageRoomDto,
  RoomUserDto,
  ChatUserDto,
} from 'src/dto/chat.dto';
import { UserService } from 'src/user/user.service';
import { RoomService } from 'src/room/room.service';
import { User } from 'src/entities/user.entity';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';
import { GameTypes, MatchTypes, UserStatusEnum } from 'src/kafka/kafka.enum';
import { Room } from 'src/entities/room.entity';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  @WebSocketServer() server: Server;

  private logger = new Logger('chatGateway');

  async disconnetOldSocket(user: User, socketId : string) {
    const userOld : User | undefined = await this.userService.getUserById(user.userId);
    if (userOld === undefined) {
      this.logger.log(`${user.userId} has not active chat`);
      return;
    }
    const userRoom : string[] = await this.roomService.getRoomWithUserByUserID(
      userOld.userId,
    );
    if (userRoom.length === 0) {
      this.logger.log(`${user.userId} has not active chat`);
      return;
    }
    userRoom.forEach((room) => {
      this.server.in(userOld.socketId).socketsLeave(room);
      this.server.in(socketId).socketsLeave(room);
    });
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('chat')
  async sendMessage(
    @MessageBody()
    payload: MessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to send a message in ${payload.roomName}`,
    );
    await this.userService.addUser(payload.user, client.id);
    const message: MessageRoomDto[] | string = await this.roomService.broadcastMessage(payload);
    if (typeof message === 'string') {
      this.server.to(client.id).emit('chat_response', message);
    } else {
      this.server.to(client.id).emit('chat_response', 'Success');
      this.logger.log(message);
      this.server.to(payload.roomName).emit('chat', message);
      this.server.emit('notifications', payload.roomName);
      this.logger.log(
        `${payload.user.userId} sent a message in ${payload.roomName}`,
      );
    }
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('create_room')
  async createRoom(
    @MessageBody()
    payload: CreateRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to create ${payload.roomName}`,
    );
    if (payload.roomName.indexOf('#') !== -1) {
      this.server
        .to(client.id)
        .emit('create_room_response', 'Room name cannot contain #');
      return;
    }
    await this.userService.addUser(payload.user, client.id);
    const response : string = await this.roomService.addRoom(payload);
    if (response !== 'Success') {
      this.server.to(client.id).emit('create_room_response', response);
      this.logger.log(`${payload.user.userId} error ${response}`);
      return;
    }
    this.logger.log(`${payload.user.userId} created ${payload.roomName}`);
    const roomList: RoomShowDto[] = await this.roomService.getRoomsAvailable();
    this.server.emit('chat_rooms', roomList);
    const myRoomlist: RoomShowDto[] = await this.roomService.getMyRooms(
      payload.user.userId,
    );
    this.server.to(client.id).emit('my_rooms', myRoomlist);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('update_room')
  async updateRoom(
    @MessageBody()
    payload: UpdateRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to update ${payload.roomName}`,
    );
    if (payload.roomName.indexOf('#') !== -1) {
      this.server
        .to(client.id)
        .emit('update_room_response', 'Direct room cannot be changed');
      return;
    }
    await this.userService.addUser(payload.user, client.id);
    const response : string = await this.roomService.updateRoom(payload);
    this.server.to(client.id).emit('update_room_response', response);
    if (response !== 'Success') {
      this.logger.log(`${payload.user.userId} error ${response}`);
      return;
    }
    this.logger.log(`${payload.user.userId} updated ${payload.roomName}`);
    const roomList: RoomShowDto[] = await this.roomService.getRoomsAvailable();
    this.server.emit('chat_rooms', roomList);
    const myRoomlist: RoomShowDto[] = await this.roomService.getMyRooms(
      payload.user.userId,
    );
    this.server.to(client.id).emit('my_rooms', myRoomlist);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('join_room')
  async joinRoom(
    @MessageBody()
    payload: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} with ${client.id} is trying to join ${payload.roomName}`,
    );
    const user: User | undefined = await this.userService.getUserById(payload.user.userId);
    if (user ===  undefined ) {
      this.server.to(client.id).emit('join_chat_response', 'User not found');
      return;
    }
    //guard for avoid user using more than one socket
    await this.disconnetOldSocket(user, client.id);

    await this.userService.addUser(payload.user, client.id);
    const response : string = await this.roomService.addNewUserToRoom(
      payload.roomName,
      payload.user.userId,
      payload.password,
    );
    this.server.to(client.id).emit('join_chat_response', response);
    if (response !== 'Success') {
      return;
    }
    this.server.in(client.id).socketsJoin(payload.roomName);
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
    this.logger.log(`${JSON.stringify(userList)}`);
    const messages : MessageRoomDto[] = await this.roomService.getAllMessages(
      payload.user.userId,
      payload.roomName,
    );
    this.server.to(client.id).emit('chat', messages);

    this.logger.log(`${payload.user.userId} joined ${payload.roomName}`);
    // DM: if payload.roomName === 'general' ==> status needs to change to 'chatting'
    if (payload.roomName === 'general') {
      this.kafkaProducerService.announceChangeOfStatus({
        userId: payload.user.userId,
        newStatus: UserStatusEnum.CHAT,
      });
    }

    const myRoomlist: RoomShowDto[] = await this.roomService.getMyRooms(
      payload.user.userId,
    );
    this.server.to(client.id).emit('my_rooms', myRoomlist);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('join_direct_room')
  async creatDirectRoom(
    @MessageBody()
    payload: DoWithUserDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.userCreator.userId} is trying to create a direct room`,
    );

    await this.userService.addUser(payload.userCreator, client.id);
    const response : string = await this.roomService.addDirectRoom(payload);

    this.server.to(client.id).emit('join_direct_room_response', response);
    if (response.indexOf('#') === -1) return;

    this.logger.log(`${payload.userCreator.userId} created ${response}`);
    const user: User | undefined = await this.userService.getUserById(payload.userCreator.userId);
    if (user === undefined ) return;
    await this.disconnetOldSocket(user, client.id);
    const messages: MessageRoomDto[] = await this.roomService.getAllMessages(
      payload.userCreator.userId,
      response,
    );
    const userInvited : User | undefined = await this.userService.getUserById(payload.userReceiver.userId);
    console.log(messages);
    this.server.in(client.id).socketsJoin(response);
    this.server.in(userInvited.socketId).socketsJoin(response);
    this.server.to(client.id).emit('chat', messages);
    const userList : RoomUserDto = await this.roomService.getUserInRoom(response);
    this.server.to(response).emit('room_users', userList);
    this.logger.log(`${payload.userCreator.userId} joined ${response}`);
    const myRoomlist: RoomShowDto[] = await this.roomService.getMyRooms(
      payload.userCreator.userId,
    );
    this.server.to(client.id).emit('my_rooms', myRoomlist);
    this.server.to(userInvited.socketId).emit('my_rooms', myRoomlist);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('block_user')
  async BlockUser(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.addUser(payload.user, client.id);
    this.logger.log(
      `${payload.user.userId} is trying to block ${payload.toDoUser}`,
    );
    if (payload.user.userId === payload.toDoUser) {
      this.server
        .to(client.id)
        .emit('block_user_response', 'You cannot block yourself');
      return;
    }
    const response : string = await this.userService.blockUser({
      blockingUserId: payload.user.userId,
      blockedUserId: payload.toDoUser,
    });
    this.server.to(client.id).emit('block_user_response', response);
    if (response === 'Already Blocked') {
      this.logger.log(
        `${payload.user.userId} already blocked ${payload.toDoUser}`,
      );
      return;
    }
    this.logger.log(`${payload.user.userId} blocked ${payload.toDoUser}`);
    const users : ChatUserDto[] = await this.userService.getAllUsers();
    this.server.emit('chat_users', users);
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('unblock_user')
  async UnblockUser(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to unblock ${payload.toDoUser}`,
    );
    await this.userService.addUser(payload.user, client.id);
    const response : string = await this.userService.unblockUser({
      blockingUserId: payload.user.userId,
      blockedUserId: payload.toDoUser,
    });
    this.server.to(client.id).emit('unblock_user_response', response);
    if (response === 'Not Blocked') {
      this.logger.log(
        `${payload.user.userId} is not blocked ${payload.toDoUser}`,
      );
      return;
    }
    this.logger.log(`${payload.user.userId} unblocked ${payload.toDoUser}`);
    const users : ChatUserDto[] = await this.userService.getAllUsers();
    this.server.emit('chat_users', users);
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('invite_game')
  async createGame(
    @MessageBody()
    payload: DoWithUserDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`${payload.userCreator.userId} is trying to create a game`);
    await this.userService.addUser(payload.userCreator, client.id);
    const userReceiver : User | undefined = await this.userService.getUserById(
      payload.userReceiver.userId,
    );
    const user : User | undefined = await this.userService.getUserById(payload.userCreator.userId);
    if (
      userReceiver === undefined ||
      userReceiver.socketId === '' ||
      user === undefined
    ) {
      this.server
        .to(client.id)
        .emit('invite_game_response', 'the user You invited is not Online');
      return;
    }
    const blocked : string = await this.userService.checkBlockedUser(
      user,
      userReceiver.userId,
    );
    if (blocked !== 'Not Blocked') {
      this.server.to(client.id).emit('invite_game_response', blocked);
      return;
    }
    if (user.userId === userReceiver.userId) {
      this.server
        .to(client.id)
        .emit('invite_game_response', 'You cannot invite yourself');
      return;
    }
    if (user.game !== '') {
      this.server
        .to(client.id)
        .emit(
          'invite_game_response',
          'you need to decline the previus game first',
        );
      return;
    }
    if (userReceiver.game !== '') {
      this.server
        .to(client.id)
        .emit(
          'invite_game_response',
          'The user You invited is already invited by someone else',
        );
      return;
    }
    this.logger.log(`game invite send to ${userReceiver.userId} from ${user.userId}`); 
    this.logger.log(`game invite send`);
    await this.userService.setGame(
      userReceiver.userId,
      user.userId,
    );
    
    await this.userService.setGame(
      user.userId,
      userReceiver.userId,
    );

    this.server.to(client.id).emit('invite_game_response', 'Success');
    const invitation = {
      type: 'invitation',
      user: payload.userCreator,
    };
    const host = {
      type: 'host',
      user: payload.userReceiver,
    };
    this.logger.log(
      `host hi  ${JSON.stringify(host)} receiver ${JSON.stringify(invitation)}`,
    );
    this.server.to(userReceiver.socketId).emit('game', invitation);
    this.server.to(client.id).emit('game', host);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('accept_game')
  async joinGame(
    @MessageBody()
    payload: DoWithUserDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`${payload.userCreator.userId} is trying to join a game`);
    await this.userService.addUser(payload.userCreator, client.id);
    const userReceiver : User | undefined = await this.userService.getUserById(
      payload.userReceiver.userId,
    );
    this.logger.log(`payload inviter ${payload.userCreator.userId} receiver ${payload.userReceiver.userId}`);
    const user : User | undefined = await this.userService.getUserById(payload.userCreator.userId);
    if (user === undefined || userReceiver === undefined) {
      this.server
        .to(client.id)
        .emit('accept_game_response', 'The user dont exist');
      return;
    }
    this.logger.log(`user id inviter ${user.userId} receiver ${userReceiver.userId}`); 
    this.logger.log(`user game inviter ${user.game} receiver ${userReceiver.game}`);
    if (user.game !== userReceiver.userId) {
      this.server
        .to(client.id)
        .emit('accept_game_response', 'You are not invited to this game');
      return;
    }

    if (userReceiver.socketId === '') {
      this.userService.setGame(user.userId, '');
      this.server
        .to(client.id)
        .emit('accept_game_response', 'The user that invited you is not Onine');
      return;
    }
    const blocked : string = await this.userService.checkBlockedUser(
      payload.userCreator,
      payload.userReceiver.userId,
    );
    if (blocked !== 'Not Blocked') {
      this.server.to(client.id).emit('accept_game_response', blocked);
      return;
    }
    this.logger.log(`game started`);
    this.kafkaProducerService.announceStartOfPairGame({
      gameType: GameTypes.PONG,
      matchType: MatchTypes.PAIR,
      player1ID: payload.userCreator.userId,
      player2ID: payload.userReceiver.userId,
    }); // DM added
    const accept = {
      type: 'start the game',
      user: payload.userCreator,
    };
    this.server.to(userReceiver.socketId).emit('game', accept);
    this.server.to(user.socketId).emit('game', accept);
    this.server.to(client.id).emit('accept_game_response', 'Success');
    await this.userService.setGame(userReceiver.userId, '');
    await this.userService.setGame(user.userId, '');
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('decline_game')
  async declineGame(
    @MessageBody()
    payload: DoWithUserDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`${payload.userCreator.userId} is trying to join a game`);
    await this.userService.addUser(payload.userCreator, client.id);
    const userReceiver : User | undefined = await this.userService.getUserById(
      payload.userReceiver.userId,
    );
    const user : User | undefined = await this.userService.getUserById(payload.userCreator.userId);
    if (user === undefined ) {
      this.server
        .to(client.id)
        .emit('decline_game_response', 'The user dont exist');
      return;
    }
    if (user.game !== payload.userReceiver.userId) {
      this.server
        .to(client.id)
        .emit('decline_game_response', 'You are not invited to this game');
      return;
    }
    if (userReceiver === undefined) {
      await this.userService.setGame(user.userId, '');
      this.server
        .to(client.id)
        .emit('decline_game_response', 'The user dont exist');
      return;
    }
    await this.userService.setGame(userReceiver.userId, '');
    await this.userService.setGame(user.userId, '');
    const decline = {
      type: 'decline the game',
    };
    this.server.to(user.socketId).emit('game', decline);
    this.server.to(userReceiver.socketId).emit('game', decline);
    this.logger.log(`decline`);
    this.server.to(client.id).emit('decline_game_response', 'Success');
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('leave_room')
  async leaveRoom(
    @MessageBody()
    payload: UserAndRoom,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to leave ${payload.roomName}`,
    );
    await this.roomService.removeUserFromRoom(
      payload.roomName,
      payload.user.userId,
    );
    this.server.in(client.id).socketsLeave(payload.roomName);
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);

    this.logger.log(`this is what is in there ${JSON.stringify(userList)}`);
    this.server.to(payload.roomName).emit('room_users', userList);
    const myRoomlist: RoomShowDto[] = await this.roomService.getMyRooms(
      payload.user.userId,
    );
    this.server.to(client.id).emit('my_rooms', myRoomlist);
    this.logger.log(`${payload.user.userId} left ${payload.roomName}`);
    const roomList: RoomShowDto[] = await this.roomService.getRoomsAvailable();
    this.server.emit('chat_rooms', roomList);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('chat_users')
  async joinchat(
    @MessageBody()
    user: UserDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`${user.userName} joined the chat`);
    //guard for avoid user using more than one socket
    await this.userService.addUser(user, client.id);
    await this.userService.setUserSocketStatus(user, client.id, true);
    const users : ChatUserDto[] = await this.userService.getAllUsers();
    this.server.emit('chat_users', users);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('chat_rooms')
  async getAllRooms(
    @MessageBody()
    user: UserDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.addUser(user, client.id);
    const roomList: RoomShowDto[] = await this.roomService.getRoomsAvailable();
    const myRoomlist: RoomShowDto[] = await this.roomService.getMyRooms(
      user.userId,
    );
    this.server.to(client.id).emit('chat_rooms', roomList);
    this.server.to(client.id).emit('my_rooms', myRoomlist);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('add_user')
  async addUser(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.addUser(payload.user, client.id);
    this.logger.log(
      `${payload.user.userId} is trying to add ${payload.toDoUser}`,
    );
    const response : string  = await this.roomService.addUserToRoom(
      payload.user.userId,
      payload.roomName,
      payload.toDoUser,
    );
    this.logger.log(response);
    this.server.to(client.id).emit('add_user_response', response);
    if (response !== 'Success') {
      return;
    }
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
    this.logger.log(`${payload.user.userId} added ${payload.toDoUser}`);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('kick_user')
  async kickUser(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.addUser(payload.user, client.id);
    this.logger.log(
      `${payload.user.userId} is trying to kick ${payload.toDoUser}`,
    );
    this.logger.log(`${payload.user.userId} is trying to kick ${payload.toDoUser}`);
    this.logger.log(`${payload.roomName}`);
    const response : string = await this.roomService.kickUserFromRoom(
      payload.roomName,
      payload.user.userId,
      payload.toDoUser,
    );
    this.server.to(client.id).emit('kick_user_response', response);
    if (response !== 'Success') {
      return;
    }
    const toKickUser: User | undefined = await this.userService.getUserById(payload.toDoUser);
    if (toKickUser === undefined) {
      return;
    }
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
    this.server.to(toKickUser.socketId).emit('kick_user_out', "you are kicked out");
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('ban_user')
  async banUser(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.addUser(payload.user, client.id);
    this.logger.log(
      `${payload.user.userId} is trying to ban ${payload.toDoUser}`,
    );
    const response : string = await this.roomService.addUserToBanned(
      payload.roomName,
      payload.user.userId,
      payload.toDoUser,
    );
    this.server.to(client.id).emit('ban_user_response', response);
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('unban_user')
  async unBanUser(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.addUser(payload.user, client.id);
    this.logger.log(
      `${payload.user.userId} is trying to unban ${payload.toDoUser}`,
    );
    await this.roomService.removeUserFromBanned(
      payload.roomName,
      payload.user.userId,
      payload.toDoUser,
    );

    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
    const toBanUser: User | undefined = await this.userService.getUserById(payload.toDoUser);
    if (toBanUser === undefined) {
      return;
    }
    this.server.to(toBanUser.socketId).emit('kick_user_out', "you are banned");
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('mute_user')
  async muteUser(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.addUser(payload.user, client.id);
    this.logger.log(
      `${payload.user.userId} is trying to mute ${payload.toDoUser} for ${payload.timer} seconds`,
    );
    await this.roomService.addUserToMuted(
      payload.roomName,
      payload.user.userId,
      payload.toDoUser,
      payload.timer,
    );
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('unmute_user')
  async unMuteUser(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.addUser(payload.user, client.id);
    this.logger.log(
      `${payload.user.userId} is trying to unmute ${payload.toDoUser}`,
    );
    await this.roomService.removeUserFromMuted(
      payload.roomName,
      payload.user.userId,
      payload.toDoUser,
    );
    const userList: RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('make_admin')
  async addAdmin(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.addUser(payload.user, client.id);
    this.logger.log(
      `${payload.user.userId} is trying to make admin ${payload.toDoUser}`,
    );
    await this.roomService.addUserToAdmin(
      payload.roomName,
      payload.user.userId,
      payload.toDoUser,
    );
    const userList : RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('remove_admin')
  async removeAdmin(
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to remove admin ${payload.toDoUser}`,
    );
    await this.userService.addUser(payload.user, client.id);
    await this.roomService.removeUserFromAdmin(
      payload.roomName,
      payload.user.userId,
      payload.toDoUser,
    );
    const userList: RoomUserDto = await this.roomService.getUserInRoom(payload.roomName);
    this.server.to(payload.roomName).emit('room_users', userList);
  }

  async handleConnection(socket: Socket): Promise<string> {
    this.logger.log(`Socket connected: ${socket.id}`);
    return socket.id;
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const user: User | undefined =
      await this.userService.getUserBySocketId(socket.id);
    this.logger.log(`Socket disconnected: ${socket.id}`);
    if (user === undefined) return;
    if (user.game !== '') {
      const userReceiver : User | undefined = await this.userService.getUserById(user.game);
      if (userReceiver !== undefined) {
        await this.userService.setGame(userReceiver.userId, '');
      }
    }
    await this.userService.setGame(user.userId, '');
    await this.disconnetOldSocket(user, socket.id);
    await this.userService.setUserSocketStatus(user, '', false);
    const users: ChatUserDto[] = await this.userService.getAllUsers();
    this.server.to('chat_users').emit('chat_users', users);
    const rooms : Room[] = await this.roomService.getRooms();
    rooms.forEach(async (room) => {
    const usersInRoom : RoomUserDto = await this.roomService.getUserInRoom(room.roomName);
    this.server.to(room.roomName).emit('room_users', usersInRoom);
    });
  }
}
