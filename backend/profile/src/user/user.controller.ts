import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get('/:id')
  getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Patch('/:id/user_name')
  changeUserName(
    @Param('id') id: string,
    @Body('user_name') user_name: string,
  ): Promise<User> {
    return this.userService.changeUserName(id, user_name);
  }

  // this function creates n number of random users, this is to make testing easier
  @Post('/batch-create')
  async createRandomUsers(@Body('n') n: number) {
    const newRandomUsers: User[] = [];
    for (let i = 0; i < n; i++) {
      try {
        newRandomUsers.push(await this.userService.createRandomUser());
      } catch (error) {
        console.log(error);
        i--;
      }
    }
    return newRandomUsers;
  }
}
