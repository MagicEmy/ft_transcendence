import { WebSocketGateway, WebSocketServer, MessageBody, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io"
import { MessageDto, JoinRoomDto, toDoUserRoomDto, GetMessageDto } from "src/dto/chat.dto";
import { UserService } from "src/user/user.service";
import { RoomService } from "src/room/room.service";
import { Message } from "src/entities/message.entity";

@WebSocketGateway()

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private roomService: RoomService,
    private userService: UserService,
  ) {}
  @WebSocketServer() server: Server;

    private logger = new Logger('chatGateway')

    @SubscribeMessage('chat')
    async handleChatEvent(
        @MessageBody() 
        payload: MessageDto
    ): Promise<boolean> {
      this.logger.log(payload);
      const message = this.roomService.broadcastMessage(payload.roomName, payload.user.userId, payload)
      if (message)
        this.server.to(payload.roomName).emit('chat', message);
      return true;
    }

    @SubscribeMessage('join_room')
    async handlesetClientDataRvent(
      @MessageBody()
      payload: JoinRoomDto,
    ): Promise<void> {
      this.logger.log(`${payload.user.socketId} is trying to join ${payload.roomName}`);
      this.userService.addUser(payload.user);
      await this.roomService.addUserToRoom(payload.roomName, payload.user.userId, payload.exclusive, payload.password);

      this.server.in(payload.user.socketId).socketsJoin(payload.roomName);
    }

    @SubscribeMessage('Get_all_Messages')
    async getAllMessages(@MessageBody()
    payload: GetMessageDto): Promise<Message[]>
    {
        const messages= await this.roomService.getAllMessages(payload.roomName, payload.user.userId)
        return messages
      }

    @SubscribeMessage('kick')
    async kickUser(
      @MessageBody()
      payload: toDoUserRoomDto,
    ): Promise<boolean> {
      this.logger.log(`${payload.toDoUser.userId} is trying to kick ${payload.user.userId} from ${payload.roomName}`);
      this.roomService.kickUserFromRoom(payload.roomName, payload.user.userId, payload.toDoUser.userId)
      this.server.in(payload.toDoUser.socketId).socketsLeave(payload.roomName);
      this.logger.log(`${payload.toDoUser.userId} has kicked ${payload.user.userId} from ${payload.roomName}`);
      return true;
    }

    @SubscribeMessage('ban')
    async banUser(
      @MessageBody()
      payload: toDoUserRoomDto
    ): Promise<boolean> {
      this.logger.log(`${payload.toDoUser.userId} is trying to ban ${payload.user.userId} from ${payload.roomName}`);
      this.roomService.addUserToBanned(payload.roomName, payload.user.userId, payload.toDoUser.userId)
      this.server.in(payload.toDoUser.socketId).socketsLeave(payload.roomName);
      this.logger.log(`${payload.toDoUser.userId} has banned ${payload.user.userId} from ${payload.roomName}`);
      return true;
    }

    @SubscribeMessage('unBan')
    async unBanUser(
      @MessageBody()
      payload: toDoUserRoomDto
    ): Promise<boolean> {
      this.logger.log(`${payload.toDoUser.userId} is trying to unban ${payload.user.userId} from ${payload.roomName}`);
      this.roomService.removeUserFromMuted(payload.roomName, payload.user.userId, payload.toDoUser.userId)
      this.logger.log(`${payload.toDoUser.userId} has unbanned ${payload.user.userId} from ${payload.roomName}`);
      return true;
    }

    @SubscribeMessage('unBan')
    async unMuteUser(
      @MessageBody()
      payload: toDoUserRoomDto
    ): Promise<boolean> {
      this.logger.log(`${payload.toDoUser.userId} is trying to unmute ${payload.user.userId} from ${payload.roomName}`);
      this.roomService.removeUserFromBanned(payload.roomName, payload.user.userId, payload.toDoUser.userId)
      this.logger.log(`${payload.toDoUser.userId} has unmuted ${payload.user.userId} from ${payload.roomName}`);
      return true;
    }


    @SubscribeMessage('mute')
    async muteUser(
      @MessageBody()
      payload: toDoUserRoomDto,
    ): Promise<boolean> {
      this.logger.log(`${payload.toDoUser.userId} is trying to mute ${payload.user.userId} from ${payload.roomName}`);
      this.roomService.addUserToMuted(payload.roomName, payload.user.userId, payload.toDoUser.userId, payload.timer)
      this.logger.log(`${payload.toDoUser.userId} has muted ${payload.user.userId} from ${payload.roomName}`);
      return true;
    }

    async handleConnection(socket: Socket): Promise<void> {
      this.logger.log(`Socket connected: ${socket.id}`)
      

    }
  
    async handleDisconnect(socket: Socket): Promise<void> {
      await this.roomService.removeUserFromAllRoom(socket.id)
      this.logger.log(`Socket disconnected: ${socket.id}`)
    }
} 