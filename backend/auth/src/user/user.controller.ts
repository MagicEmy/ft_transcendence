// to be removed once stuff works well
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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

  @Get()
  createAvatarRecord(
    @Query('user_id') user_id: string,
    @Query('avatar_url') avatar_url: string,
  ): Promise<string> {
    return this.userService.createAvatarRecord(user_id, avatar_url);
  }
}
