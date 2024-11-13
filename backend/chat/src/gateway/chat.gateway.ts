import {
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { UserService } from 'src/user/user.service'
import { User } from 'src/entities/user.entity'
import { ValidationPipe, UsePipes } from '@nestjs/common'
import { KafkaProducerService } from 'src/kafka/kafka-producer.service'
import { UserStatusEnum } from 'src/kafka/kafka.enum'
import { Room } from 'src/entities/room.entity'
import { RoomManagementService } from 'src/room/room-management.service'
import { RoomUserManagementService } from 'src/room/room-user-management.service'
import { RoomMessageService } from 'src/room/room-message.service'
import { RoomRouterService } from 'src/room/room-router.service';
import { GameInvitation } from 'src/game/game-invitation.service'
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
  ModerateResponseDto,
  ResponseDto
} from 'src/dto/chat.dto'
import { GameInvitationDto, GameInvitationtype } from 'src/dto/game.dto'

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor (
    private roomManagementService: RoomManagementService,
    private roomUserManagementService: RoomUserManagementService,
    private roomRouterService: RoomRouterService,
    private roomMessageService: RoomMessageService,
    private userService: UserService,
    private readonly gameInvitation: GameInvitation,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}
  @WebSocketServer() server: Server

  private logger = new Logger('chatGateway')

  async disconnetOldSocket (user: User, socketId: string) {
    const userOld: User | undefined = await this.userService.getUserById(
      user.userId,
    )
    if (userOld === undefined) {
      this.logger.log(`${user.userId} has not active chat`)
      return
    }
    const userRoom: string[] =
      await this.roomUserManagementService.getRoomWithUserByUserID(
        userOld.userId,
      )
    if (userRoom.length === 0) {
      this.logger.log(`${user.userId} has not active chat`)
      return
    }
    userRoom.forEach(room => {
      this.server.in(userOld.socketId).socketsLeave(room)
      this.server.in(socketId).socketsLeave(room)
    })
  }
  
  async updateUsers() {
    const userRoom: Room[] = await this.roomManagementService.getRooms()
    for (const room of userRoom) {
      const userList: RoomUserDto = await this.roomUserManagementService.getUserInRoom(room.roomName);
      this.server.to(room.roomName).emit('room_users', userList);
    }
    const users: ChatUserDto[] = await this.userService.getAllUsers()
    this.server.emit('chat_users', users)
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('chat')
  async sendMessage (
    @MessageBody()
    payload: MessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to send a message in ${payload.roomName}`,
    )
    await this.userService.setUserSocketStatus(payload.user, client.id, true)
    const message: MessageRoomDto[] | string =
      await this.roomMessageService.broadcastMessage(payload)
    if (typeof message === 'string') {
      this.server.to(client.id).emit('response', message)
    } else {
      this.logger.log(message)
      this.server.to(payload.roomName).emit('chat', message)
      this.server.emit('notifications', payload.roomName)
      this.logger.log(
        `${payload.user.userId} sent a message in ${payload.roomName}`,
      )
    }
    this.updateUsers()
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('create_room')
  async createRoom (
    @MessageBody()
    payload: CreateRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to create ${payload.roomName}`,
    )
    if (payload.roomName.indexOf('#') !== -1) {
      this.server
        .to(client.id)
        .emit('response', 'Room name cannot contain #')
      return
    }
    await this.userService.setUserSocketStatus(payload.user, client.id, true)
    const response: string = await this.roomManagementService.addRoom(payload)
    if (response !== 'Success') {
      this.server.to(client.id).emit('response', response)
      this.logger.log(`${payload.user.userId} error ${response}`)
      return
    }
    this.logger.log(`${payload.user.userId} created ${payload.roomName}`)
    const roomList: RoomShowDto[] =
      await this.roomManagementService.getRoomsAvailable()
    this.server.emit('chat_rooms', roomList)
    const myRoomList: RoomShowDto[] = await this.roomManagementService.getMyRooms( payload.user.userId)
    this.server.to(client.id).emit('my_rooms', myRoomList)
    this.server.to(client.id).emit('response', `Success! ${payload.roomName} created`)
    this.updateUsers()
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('update_room')
  async updateRoom (
    @MessageBody()
    payload: UpdateRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to update ${payload.roomName}`,
    )
    if (payload.roomName.indexOf('#') !== -1) {
      this.server
        .to(client.id)
        .emit('response', 'Direct room cannot be changed')
      return
    }
    await this.userService.setUserSocketStatus(payload.user, client.id, true)
    const response: string = await this.roomManagementService.updateRoom(
      payload,
    )
    this.server.to(client.id).emit('response', response)
    const roomList: RoomShowDto[] =
      await this.roomManagementService.getRoomsAvailable()
    this.server.emit('chat_rooms', roomList)
    const myRoomList: RoomShowDto[] = await this.roomManagementService.getMyRooms( payload.user.userId)
    this.server.to(client.id).emit('my_rooms', myRoomList)
    this.updateUsers()
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('join_room')
  async joinRoom (
    @MessageBody()
    payload: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} with ${client.id} is trying to join ${payload.roomName}`,
    )
    const user: User | undefined = await this.userService.getUserById(
      payload.user.userId,
    )
    if (user === undefined) {
      this.server.to(client.id).emit('join_chat_response', 'User not found')
      return
    }
    //guard for avoid user using more than one socket
    await this.disconnetOldSocket(user, client.id)

    await this.userService.setUserSocketStatus(payload.user, client.id, true)
    const response: string =
      await this.roomUserManagementService.addNewUserToRoom(
        payload.roomName,
        payload.user.userId,
        payload.password,
      )
    this.server.to(client.id).emit('join_chat_response', response)
    if (response !== 'Success') {
      return
    }
    this.server.in(client.id).socketsJoin(payload.roomName)
    const userList: RoomUserDto =
      await this.roomUserManagementService.getUserInRoom(payload.roomName)
    this.server.to(payload.roomName).emit('room_users', userList)
    this.logger.log(`${JSON.stringify(userList)}`)
    const messages: MessageRoomDto[] =
      await this.roomMessageService.getAllMessages(
        payload.user.userId,
        payload.roomName,
      )
    this.server.to(client.id).emit('chat', messages)

    this.logger.log(`${payload.user.userId} joined ${payload.roomName}`)
    // DM: if payload.roomName === 'general' ==> status needs to change to 'chatting'
    if (payload.roomName === 'general') {
      this.kafkaProducerService.announceChangeOfStatus({
        userId: payload.user.userId,
        newStatus: UserStatusEnum.CHAT,
      })
    }
    const myRoomList: RoomShowDto[] = await this.roomManagementService.getMyRooms( payload.user.userId)
    this.server.to(client.id).emit('my_rooms', myRoomList)
    this.updateUsers()
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('join_direct_room')
  async creatDirectRoom (
    @MessageBody()
    payload: DoWithUserDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.userCreator.userId} is trying to create a direct room`,
    )

    await this.userService.setUserSocketStatus(payload.userCreator, client.id, true)
    const response: string = await this.roomManagementService.addDirectRoom(
      payload,
    )

    this.server.to(client.id).emit('join_direct_room_response', response)
    if (response.indexOf('#') === -1) return

    this.logger.log(`${payload.userCreator.userId} created ${response}`)
    const user: User | undefined = await this.userService.getUserById(
      payload.userCreator.userId,
    )
    if (user === undefined) return
    await this.disconnetOldSocket(user, client.id)
    const messages: MessageRoomDto[] =
      await this.roomMessageService.getAllMessages(
        payload.userCreator.userId,
        response,
      )
    const userInvited: User | undefined = await this.userService.getUserById(
      payload.userReceiver.userId,
    )
    console.log(messages)
    this.server.in(client.id).socketsJoin(response)
    this.server.to(client.id).emit('chat', messages)
    this.updateUsers()
    this.logger.log(`${payload.userCreator.userId} joined ${response}`)
    const myRoomlist: RoomShowDto[] =
      await this.roomManagementService.getMyRooms(payload.userCreator.userId)
    this.server.to(client.id).emit('my_rooms', myRoomlist)
    this.server.to(userInvited.socketId).emit('my_rooms', myRoomlist)
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('block_user')
  async BlockUser (
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.setUserSocketStatus(payload.user, client.id, true)
    this.logger.log(
      `${payload.user.userId} is trying to block ${payload.toDoUser}`,
    )
    if (payload.user.userId === payload.toDoUser) {
      this.server
        .to(client.id)
        .emit('response', 'You cannot block yourself')
      return
    }
    const response: string = await this.userService.blockUser({
      blockingUserId: payload.user.userId,
      blockedUserId: payload.toDoUser,
    })
    this.server.to(client.id).emit('response', response)
    if (response === 'Already Blocked') 
      this.logger.log(`${payload.user.userId} already blocked ${payload.toDoUser}`,)
    else 
      this.logger.log(`${payload.user.userId} blocked ${payload.toDoUser}`)
    this.updateUsers()
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('unblock_user')
  async UnblockUser (
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to unblock ${payload.toDoUser}`,
    )
    await this.userService.setUserSocketStatus(payload.user, client.id, true)
    const response: string = await this.userService.unblockUser({
      blockingUserId: payload.user.userId,
      blockedUserId: payload.toDoUser,
    })
    this.server.to(client.id).emit('response', response)
    if (response === 'Not Blocked') 
      this.logger.log(`${payload.user.userId} is not blocked ${payload.toDoUser}`)
    else
      this.logger.log(`${payload.user.userId} unblocked ${payload.toDoUser}`)
    this.updateUsers()
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('game_invitation')
  async createGame(
    @MessageBody()
    payload: GameInvitationDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.setUserSocketStatus(payload.sender, client.id, true)
    const receiver: User | undefined = await this.userService.getUserById(
      payload.receiver.userId,
    )
    const user: User | undefined = await this.userService.getUserById(
      payload.sender.userId,
    )
    const remove = {
      type: 'Remove',
    }
    if (!user)
      throw new Error('User not found');
    let response: ResponseDto;

    if (payload.type === GameInvitationtype.SEND) {
      response = await this.gameInvitation.sendGameInvitation(user, receiver);
      if (response.success) {
        const invitation = {
          type: 'invitation',
          user: payload.sender,
        }
        const host = {
          type: 'host',
          user: payload.receiver,
        }
        this.server.to(receiver.socketId).emit('game_invitation', invitation)
        this.server.to(client.id).emit('game_invitation', host)
      }
    }
    else if (payload.type === GameInvitationtype.ACCEPT) {
      response = await this.gameInvitation.acceptGameInvitation(user, receiver);
      if (response.success) {
        const accept = {
          type: 'start the game',
          user: payload.sender,
        }
        this.server.to(receiver.socketId).emit('game_invitation', accept)
        this.server.to(client.id).emit('game_invitation', accept)
      }
      else
        this.server.to(client.id).emit('game_invitation', remove)
    }
    else if (payload.type === GameInvitationtype.DECLINE) {
      response = await this.gameInvitation.declineGameInvitation(user, receiver);
      if (response.success) {
        this.server.to(client.id).emit('game_invitation', remove)
        this.server.to(receiver.socketId).emit('game_invitation', remove)
        this.server.to(receiver.socketId).emit('response', `${user.userName} declined the game invitation`)
      }
      else 
        this.server.to(client.id).emit('game_invitation', remove)
    }
    this.server.to(client.id).emit('response', response.message)
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('leave_room')
  async leaveRoom (
    @MessageBody()
    payload: UserAndRoom,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(
      `${payload.user.userId} is trying to leave ${payload.roomName}`,
    )
    await this.roomUserManagementService.removeUserFromRoom(
      payload.roomName,
      payload.user.userId,
    )
    this.server.in(client.id).socketsLeave(payload.roomName)
    this.updateUsers()
    const myRoomlist: RoomShowDto[] =
      await this.roomManagementService.getMyRooms(payload.user.userId)
    this.server.to(client.id).emit('my_rooms', myRoomlist)
    this.logger.log(`${payload.user.userId} left ${payload.roomName}`)
    const roomList: RoomShowDto[] =
      await this.roomManagementService.getRoomsAvailable()
    this.server.emit('chat_rooms', roomList)
    this.server.to(client.id).emit('response', `Success! ${payload.roomName} left`)
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('chat_users')
  async joinchat (
    @MessageBody()
    user: UserDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`${user.userName} joined the chat`)
    //guard for avoid user using more than one socket
    await this.userService.setUserSocketStatus(user, client.id, true)
    this.updateUsers()
    const userIn: User | undefined = await this.userService.getUserById(user.userId)
    if (userIn === undefined) return
    const userGame: boolean | {} = await this.gameInvitation.getGameIvitation(userIn)
    if (userGame !== false) {
      this.server.to(client.id).emit('game_invitation', userGame)
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('chat_rooms')
  async getAllRooms (
    @MessageBody()
    user: UserDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.userService.setUserSocketStatus(user, client.id, true)
    const roomList: RoomShowDto[] =
      await this.roomManagementService.getRoomsAvailable()
    const myRoomlist: RoomShowDto[] =
      await this.roomManagementService.getMyRooms(user.userId)
    this.server.to(client.id).emit('chat_rooms', roomList)
    this.server.to(client.id).emit('my_rooms', myRoomlist)
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('moderate_room')
  async moderateRoom( 
    @MessageBody()
    payload: ToDoUserRoomDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {

    await this.userService.setUserSocketStatus(payload.user, client.id, true)
    const toDoUser: User | undefined = await this.userService.getUserById(
      payload.toDoUser,
    )
    if (toDoUser === undefined) {
      this.server.to(client.id).emit('response', 'User not found');
      return;
    }
    let response: ModerateResponseDto = await this.roomRouterService.handleModeration(payload);
    if (response.success) {
      this.server.to(client.id).emit('response', toDoUser.userName + " " + response.user_response);
      if (toDoUser.socketId !== '') {
        this.server.to(toDoUser.socketId).emit('moderate_room_action', response.user_response);
        if (payload.type === 'add') {
          const myRoomList: RoomShowDto[] = await this.roomManagementService.getMyRooms( payload.toDoUser)
          this.server.to(toDoUser.socketId).emit('my_rooms', myRoomList)
        }
      }
    }
    else {
      this.server.to(client.id).emit('response', response.user_response);
    }
    this.updateUsers()
  }

  async handleConnection (socket: Socket): Promise<string> {
    this.logger.log(`Socket connected: ${socket.id}`)
    return socket.id
  }

  async handleDisconnect (socket: Socket): Promise<void> {
    const user: User | undefined = await this.userService.getUserBySocketId(
      socket.id,
    )
    this.logger.log(`Socket disconnected: ${socket.id}`)
    if (user === undefined) return
    if (user.game !== '') {
      const userReceiver: User | undefined = await this.userService.getUserById(
        user.game,
      )
      if (userReceiver !== undefined) {
        await this.userService.setGame(userReceiver.userId, '', false)
      }
    }
    await this.userService.setGame(user.userId, '', false)
    await this.disconnetOldSocket(user, socket.id)
    await this.userService.setUserSocketStatus(user, '', false)
    const users: ChatUserDto[] = await this.userService.getAllUsers()
    this.server.to('chat_users').emit('chat_users', users)
    const rooms: Room[] = await this.roomManagementService.getRooms()
    rooms.forEach(async room => {
      const usersInRoom: RoomUserDto =
        await this.roomUserManagementService.getUserInRoom(room.roomName)
      this.server.to(room.roomName).emit('room_users', usersInRoom)
    })
  }
}
