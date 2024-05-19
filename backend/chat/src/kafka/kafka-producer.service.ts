import { Injectable } from '@nestjs/common';
import { StatusChangeDto } from './dto/kafka-dto';
import { INewGame, KafkaTopic } from './kafka.enum';
import { Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService {
  announceStartOfPairGame(newGame: INewGame, kafkaProducer: Producer) {
    console.log('in announceStartOfPairGame(); about to emit');
    console.log(newGame);
    kafkaProducer.send({
      topic: KafkaTopic.NEW_GAME,
      messages: [{ value: JSON.stringify(newGame) }],
    });
  }

  announceChangeOfStatus(
    statusChangeDto: StatusChangeDto,
    kafkaProducer: Producer,
  ) {
    console.log('in announceChangeOfStatus(); about to emit');
    console.log(statusChangeDto);
    kafkaProducer.send({
      topic: KafkaTopic.STATUS_CHANGE,
      messages: [{ value: JSON.stringify(statusChangeDto) }],
    });
  }
}
