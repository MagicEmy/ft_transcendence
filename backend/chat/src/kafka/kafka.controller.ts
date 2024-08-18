import { Controller } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import {
  EventPattern,
  MessagePattern,
  RpcException,
} from '@nestjs/microservices';
import { KafkaTopic } from './kafka.enum';
import { UserIdNameDto, UserIdNameLoginDto } from './dto/kafka-dto';
import { IGameStatus } from './kafka.interface';

@Controller()
export class KafkaController {
  constructor(private readonly kafkaConsumerService: KafkaConsumerService) {}

  @MessagePattern(KafkaTopic.NEW_USER)
  addNewUser(data: UserIdNameLoginDto): string {
    try {
      const user = this.kafkaConsumerService.addNewUser(data);
      if (user) {
        return 'OK';
      }
    } catch (error) {}
    throw new RpcException(`User ${data.userId} not saved in chat_db`);
  }

  @EventPattern(KafkaTopic.USERNAME_CHANGE)
  changeUserName(data: UserIdNameDto): void {
    this.kafkaConsumerService.changeUsername(data);
  }

  @EventPattern(KafkaTopic.GAME_END)
  handleGameEnd(data: IGameStatus) {
    const { player1ID, player2ID } = data;
    this.kafkaConsumerService.removeGameFromDB(player1ID, player2ID);
  }
}
