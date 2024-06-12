import { Inject, Injectable } from '@nestjs/common';
import { StatusChangeDto } from './dto/kafka-dto';
import { INewGame, KafkaTopic } from './kafka.enum';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService {
  constructor(
    @Inject('CHAT_SERVICE') private readonly kafkaProducerService: ClientKafka,
  ) {}
  announceStartOfPairGame(newGame: INewGame) {
    this.kafkaProducerService.send(KafkaTopic.NEW_GAME, newGame);
  }

  announceChangeOfStatus(statusChangeDto: StatusChangeDto) {
    this.kafkaProducerService.send(KafkaTopic.STATUS_CHANGE, statusChangeDto);
  }
}
