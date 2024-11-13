import { Injectable } from '@nestjs/common';
import { UserIdNameLoginDto, UserIdNameDto } from './dto/kafka-dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class KafkaConsumerService {
  constructor(private readonly userService: UserService) {}

  // creation of new user
  addNewUser(userIdNameLoginDto: UserIdNameLoginDto) {
    return this.userService.addUser(
      {
        userId: userIdNameLoginDto.userId,
        userName: userIdNameLoginDto.userName,
      },
      '',
    );
  }

  // change of user_name
  changeUsername(userNameDto: UserIdNameDto) {
    this.userService.setUserName(userNameDto);
  }

  // game end -> remove from database
  removeGameFromDB(player1ID: string, player2ID: string) {
    this.userService.removeGameFromDB(player1ID, player2ID);
  }

  addGameForUser(playerID: string) {
    this.userService.setGame(playerID, playerID, true);
  }

}
