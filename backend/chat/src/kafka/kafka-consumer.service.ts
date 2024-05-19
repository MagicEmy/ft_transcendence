import { Injectable } from '@nestjs/common';
import { NewUserDto, UserNameDto } from './dto/kafka-dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class KafkaConsumerService {
  constructor(private readonly userService: UserService) {}
  // creation of new user
  addNewUser(data: string) {
    const newUserDto: NewUserDto = JSON.parse(data);
    console.log(
      'in addNewUser() in KafkaConsumerService; parameter is ',
      newUserDto,
    );
    console.log(newUserDto.user_id, newUserDto.user_name);
    this.userService.addUser(
      { userId: newUserDto.user_id, userName: newUserDto.user_name },
      '',
    );
  }

  // test_chat     | Kafka consumed: username_change {"userId":"abc123","userName":"Belinda"}
  // test_chat     | in changeUsername() in KafkaConsumerService; parameter is  {"userId":"abc123","userName":"Belinda"}
  // test_chat     | string

  // change of user_name
  //   changeUsername(userNameDto: UserNameDto) {
  changeUsername(data: string) {
    const userNameDto: UserNameDto = JSON.parse(data);
    console.log(
      'in changeUsername() in KafkaConsumerService; parameter is ',
      userNameDto,
    );
    console.log(userNameDto.userId, userNameDto.userName);
    this.userService.setUserName(userNameDto);
  }
}
