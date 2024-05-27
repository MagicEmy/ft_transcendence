import { Injectable } from '@nestjs/common';
import { NewUserDto, UserIdNameDto } from './dto/kafka-dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class KafkaConsumerService {
  constructor(private readonly userService: UserService) {}

  // creation of new user
  addNewUser(newUserDto: NewUserDto) {
    this.userService.addUser(
      { userId: newUserDto.userId, userName: newUserDto.userName },
      '',
    );
  }

  // change of user_name
  changeUsername(userNameDto: UserIdNameDto) {
    this.userService.setUserName(userNameDto);
  }
}
