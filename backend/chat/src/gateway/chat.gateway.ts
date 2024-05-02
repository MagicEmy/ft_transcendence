import { WebSocketGateway, WebSocketServer, MessageBody, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io"
import { CreateRoomDto, MessageDto, JoinRoomDto, toDoUserRoomDto, GetMessageDto, UserDto, LeaveRoomDto } from "src/dto/chat.dto";
import { UserService } from "src/user/user.service";
import { RoomService } from "src/room/room.service";
import { Message } from "src/entities/message.entity";


@WebSocketGateway({})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private roomService: RoomService,
    private userService: UserService,
  ) {}
  @WebSocketServer() server: Server;

    private logger = new Logger('chatGateway');

    async disconnetOldSocket(user: UserDto ){
      const userOld = await this.userService.getUserById(user.userId);
      if(userOld === "Not Existing" || user.socketId.length === 0){
        this.logger.log(`${user.userId} has not active chat`);
        return;
      }
      if(user.socketId === userOld.socketId)
        return ;
      const userRoom = await this.roomService.getRoomWithUserByUserID(userOld.userId);
      if (userRoom.length === 0){
        this.logger.log(`${user.userId} has not active chat`);
        return;
      }
      userRoom.forEach(room => {
        this.server.in(userOld.socketId).socketsLeave(room);
      });
    }

    async connectNewSocket(user: UserDto ){
      const userOld = await this.userService.getUserById(user.userId);
      if(userOld === "Not Existing"){
        this.logger.log(`${user.userId} has not active chat`);
        return;
      }
      if(user.socketId === userOld.socketId)
        return ;
      await this.userService.setUserSocket(user.userId, user.socketId);
      const userRoom = await this.roomService.getRoomWithUserByUserID(userOld.userId);
      if (userRoom.length === 0){
        this.logger.log(`${user.userId} has not active chat`);
        return;
      }
      userRoom.forEach(room => {
        this.server.in(userOld.socketId).socketsJoin(room);
      });
    }




    @SubscribeMessage('subscribe_old_chat')
    async reSubscribe (
      @MessageBody() 
      payload: UserDto){
      
      this.logger.log(`${payload.userId} is trying to resubscrive with sockedId ${payload.socketId}`);
      await this.disconnetOldSocket(payload);
      await this.connectNewSocket(payload);
    }

    @SubscribeMessage('chat')
    async sendMessage(
        @MessageBody() 
        payload: MessageDto
    ): Promise<boolean> {
      this.logger.log(payload);
      this.logger.log(`${payload.user.socketId} is trying to send a message in ${payload.roomName}`);
      // guard for avoid user using more than one socket
      await this.disconnetOldSocket(payload.user);
      await this.connectNewSocket(payload.user);

      await this.userService.addUser(payload.user);
      const message = await this.roomService.broadcastMessage(payload);
      if (message){
        this.server.to(payload.roomName).emit('chat', message);
        return true;
      }
    }

    @SubscribeMessage('create_room')
    async createRoom(
      @MessageBody()
      payload: CreateRoomDto,
    ): Promise<void> {
      this.logger.log(`${payload.user.socketId} is trying to create ${payload.roomName}`);
      // guard for avoid user using more than one socket
      await this.disconnetOldSocket(payload.user);
      await this.connectNewSocket(payload.user);

      await this.userService.addUser(payload.user);
      await this.roomService.addRoom(payload);
      this.server.in(payload.user.socketId).socketsJoin(payload.roomName);
      this.logger.log(`${payload.user.socketId} created ${payload.roomName}`);
    }
      
    @SubscribeMessage('join_room')
    async joinRoom(
      @MessageBody()
      payload: JoinRoomDto,
    ): Promise<void> {

      this.logger.log(`${payload.user.socketId} is trying to join ${payload.roomName}`);
      // guard for avoid user using more than one socket
      await this.disconnetOldSocket(payload.user);
      await this.connectNewSocket(payload.user);
      
      await this.userService.addUser(payload.user);
      await this.roomService.addUserToRoom(payload.roomName, payload.user.userId, payload.password);
      this.server.in(payload.user.socketId).socketsJoin(payload.roomName);
      this.logger.log(`${payload.user.socketId} joined ${payload.roomName}`);
    }

    @SubscribeMessage('Get_all_Messages')
    async getAllMessages(@MessageBody()
    payload: GetMessageDto): Promise<Message[]>
    {
        const messages= await this.roomService.getAllMessages(payload.roomName, payload.user.userId);
        return messages;
    }

    @SubscribeMessage('leave_room')
    async leaveRoom(@MessageBody()
    payload: LeaveRoomDto)
    {
        this.logger.log(`${payload.user.socketId} is leaving ${payload.roomName}`);
        await this.roomService.removeUserFromRoom(payload.user.userId, payload.roomName);
        this.server.in(payload.user.socketId).socketsLeave(payload.roomName);
        this.logger.log(`${payload.user.socketId} left ${payload.roomName}`);
      }

    @SubscribeMessage('kick')
    async kickUser(
      @MessageBody()
      payload: toDoUserRoomDto,
    ): Promise<boolean> {
      this.logger.log(`${payload.user.userId} is trying to kick ${payload.toDoUser} from ${payload.roomName}`);
      await this.roomService.kickUserFromRoom(payload.roomName, payload.user.userId, payload.toDoUser);
      const kick = await this.userService.getUserById(payload.toDoUser);
      if( kick === "Not Existing")
        return false;
      this.server.in(kick.socketId).socketsLeave(payload.roomName);
      this.logger.log(`${payload.user.userId} has kicked ${payload.user.userId} from ${payload.roomName}`);
      return true;
    }

    @SubscribeMessage('ban')
    async banUser(
      @MessageBody()
      payload: toDoUserRoomDto
    ): Promise<boolean> {
      this.logger.log(`${payload.user.userId} is trying to ban ${payload.toDoUser} from ${payload.roomName}`);
      await this.roomService.addUserToBanned(payload.roomName, payload.user.userId, payload.toDoUser);
      const kick = await this.userService.getUserById(payload.toDoUser);
      if( kick === "Not Existing")
        return false;
      this.server.in(kick.socketId).socketsLeave(payload.roomName);
      this.logger.log(`${payload.user.userId} has banned ${payload.toDoUser} from ${payload.roomName}`);
      return true;
    }

    @SubscribeMessage('unBan')
    async unBanUser(
      @MessageBody()
      payload: toDoUserRoomDto
    ): Promise<boolean> {
      this.logger.log(`${payload.user.userId} is trying to unban ${payload.toDoUser} from ${payload.roomName}`);
      await this.roomService.removeUserFromBanned(payload.roomName, payload.user.userId, payload.toDoUser);
      this.logger.log(`${payload.user.userId} has unbanned ${payload.toDoUser} from ${payload.roomName}`);
      return true;
    }

    @SubscribeMessage('unMute')
    async unMuteUser(
      @MessageBody()
      payload: toDoUserRoomDto
    ): Promise<boolean> {
      this.logger.log(`${payload.user.userId} is trying to unmute ${payload.toDoUser} from ${payload.roomName}`);
      await this.roomService.removeUserFromMuted(payload.roomName, payload.user.userId, payload.toDoUser);
      this.logger.log(`${payload.user.userId} has unmuted ${payload.toDoUser} from ${payload.roomName}`);
      return true;
    }

    @SubscribeMessage('add_admin')
    async addAdmin(
      @MessageBody()
      payload: toDoUserRoomDto
    ): Promise<boolean> {
      this.logger.log(`${payload.user.userId} is trying to make ${payload.toDoUser} admin of ${payload.roomName}`);
      await this.roomService.addUserToAdmin(payload.roomName, payload.user.userId, payload.toDoUser);
      this.logger.log(`${payload.user.userId} has made admin ${payload.toDoUser} in ${payload.roomName}`);
      return true;
    }

    @SubscribeMessage('remove_admin')
    async removeAdmin(
      @MessageBody()
      payload: toDoUserRoomDto
    ): Promise<boolean> {
      this.logger.log(`${payload.user.userId} is trying to remove ${payload.toDoUser} from admin in ${payload.roomName}`);
      await this.roomService.removeUserFromAdmin(payload.roomName, payload.user.userId, payload.toDoUser);
      this.logger.log(`${payload.user.userId} has removed ${payload.toDoUser} from admin in ${payload.roomName}`);
      return true;
    }


    @SubscribeMessage('mute')
    async muteUser(
      @MessageBody()
      payload: toDoUserRoomDto,
    ): Promise<boolean> {
      this.logger.log(`${payload.user.userId} is trying to mute ${payload.toDoUser} from ${payload.roomName}`);
      await this.roomService.addUserToMuted(payload.roomName, payload.user.userId, payload.toDoUser, payload.timer);
      this.logger.log(`${payload.user.userId} has muted ${payload.toDoUser} from ${payload.roomName} for ${payload.timer} seconds`);
      return true;
    }



    async handleConnection(socket: Socket): Promise<string> {
      this.logger.log(`Socket connected: ${socket.id}`);
      return socket.id;
    }
  
    async handleDisconnect(socket: Socket): Promise<void> {
      const user = await this.userService.getUserBySocketId(socket.id);
      this.logger.log(`Socket disconnected: ${socket.id}`);
      if (user !== 'Not Existing')
        await this.userService.setUserSocket(user.userId, "");
    }
} 