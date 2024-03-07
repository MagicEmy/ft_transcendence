import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { Users } from './users.entity';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<Users> {
    return this.usersService.createUser(createUserDto);
  }

  @Get('/:id')
  getUserById(@Param('id') id: string): Promise<Users> {
    return this.usersService.getUserById(id);
  }

  @Patch('/:id/user_name')
  changeUserName(
    @Param('id') id: string,
    @Body('user_name') user_name: string,
  ): Promise<Users> {
    return this.usersService.changeUserName(id, user_name);
  }
}
