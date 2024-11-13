// to be removed once stuff works well
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { ClientKafka, MessagePattern } from '@nestjs/microservices';
import { of } from 'rxjs';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    @Inject('STATS_SERVICE') private readonly statsClient: ClientKafka, // for testing only
  ) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  //   FOR TESTING PURPOSES ONLY:
  @MessagePattern('createUsers')
  async createManyUsers(no: number) {
    const newUsers: string[] = [];
    for (let i: number = 1; i <= no; i++) {
      const number = Math.floor(Math.random() * 90000 + 10000);
      const user = await this.userService.createUser({
        intraLogin: `Rando${number}`,
        userName: `Rando${number}`,
      });
      newUsers.push(user.user_id);
      this.userService.createAvatarRecord(
        user.user_id,
        'https://loremflickr.com/200/200/dog',
        // `https://source.unsplash.com/random/200x200?sig=$${number}`,
      );
      this.statsClient.emit('new_user', {
        userId: user.user_id,
        intraLogin: user.intra_login,
        userName: user.user_name,
      });
    }
    return of(newUsers);
  }
}
