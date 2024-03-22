import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { AddFriendDto } from './dto/add-friend-dto';
import { Friend } from './friend.entity';
import { UsernameCache } from './usernameCache';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private usernameCache: UsernameCache,
  ) {}

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

  @Post('/friend')
  addFriend(@Body() addFriendDto: AddFriendDto): Promise<Friend> {
    return this.userService.addFriend(addFriendDto);
  }

  // for testing purposes (gets all friends of a specific user)
  @Get('/:id/friends')
  getFriends(@Param('id') user_id: string) {
    return this.userService.getFriends(user_id);
  }

  // for testing purposes, returns a user_name
  @Get('/:id/username')
  getUserName(@Param('id') user_id: string) {
    return this.userService.getUserName(user_id);
  }

  @Post('/cache')
  putUsernameInCache(@Body() user_id: string, user_name: string) {
    this.usernameCache.setUsername(user_id, user_name);
  }

  @Get('/:id/cache')
  getUsernameFromCache(@Param('id') user_id: string) {
    return this.usernameCache.getUsername(user_id);
  }
}
