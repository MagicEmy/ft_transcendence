import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { AddFriendDto } from './dto/add-friend-dto';
import { Friend } from './friend.entity';
import { UsernameCache } from './usernameCache';
import { EventPattern } from '@nestjs/microservices';
import { AvatarService } from './avatar.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private usernameCache: UsernameCache,
    private readonly avatarService: AvatarService,
  ) {}

  @EventPattern('new_user')
  createAvatarRecord(data: any): void {
    console.log('in controller new_user function');
    console.log(data);
    this.avatarService.createAvatarRecord(data.user_id);
  }

  @Get('/:id')
  getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Patch('/:id/user_name')
  changeUsername(
    @Param('id') id: string,
    @Body('user_name') user_name: string,
  ): Promise<User> {
    return this.userService.changeUsername(id, user_name);
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
  getUsername(@Param('id') user_id: string) {
    return this.userService.getUsername(user_id);
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
