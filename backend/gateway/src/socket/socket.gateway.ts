import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { KafkaTopic, UserStatusEnum } from 'src/enum/kafka.enum';

@WebSocketGateway({ cors: true })
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger(StatusGateway.name);
  constructor(
    @Inject('UserService') private readonly userService: ClientProxy,
  ) {}

  @WebSocketServer() server: Server;
  private readonly connectedUsers: Map<string, string> = new Map();

  handleConnection(socket: Socket): void {
    const userId: string =
      typeof socket.handshake.query.userIdContext == 'string'
        ? socket.handshake.query.userIdContext
        : socket.handshake.query.userIdContext[0];
    if (!userId) {
      socket.disconnect();
      return;
    }
    this.connectedUsers.set(socket.id, userId);
    this.logger.log(`User ${userId} connected`);
    this.userService.emit(KafkaTopic.STATUS_CHANGE, {
      userId,
      newStatus: UserStatusEnum.ONLINE,
    });
  }

  handleDisconnect(socket: Socket) {
    const userId = this.connectedUsers.get(socket.id);
    if (userId) {
      this.connectedUsers.delete(socket.id);
      this.logger.log(`User ${userId} disconnected`);
      this.userService.emit(KafkaTopic.STATUS_CHANGE, {
        userId,
        newStatus: UserStatusEnum.OFFLINE,
      });
    }
  }
}
