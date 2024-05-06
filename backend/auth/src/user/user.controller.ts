// to be removed once stuff works well
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { ClientKafka } from '@nestjs/microservices';

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

  @Get()
  createAvatarRecord(
    @Query('user_id') user_id: string,
    @Query('avatar_url') avatar_url: string,
  ): Promise<string> {
    return this.userService.createAvatarRecord(user_id, avatar_url);
  }

  //   FOR TESTING PURPOSES ONLY:
  @Get('create/:no')
  async createManyUsers(@Param('no') no: number) {
    const newUsers: string[] = [];
    for (let i: number = 1; i <= no; i++) {
      const number = Math.floor(Math.random() * 90000 + 10000);
      const user = await this.userService.createUser({
        intra_login: `Rando${number}`,
        user_name: `Rando${number}`,
      });
      newUsers.push(user.user_id);
      this.userService.createAvatarRecord(
        user.user_id,
        'https://cdn.intra.42.fr/users/58b00e4d02e766a5f77b4b625877bc03/medium_dmalacov.jpg',
      );
      this.statsClient.emit('new_user', {
        user_id: user.user_id,
        intra_login: user.intra_login,
        user_name: user.user_name,
      });
    }
    return newUsers;
  }
}
