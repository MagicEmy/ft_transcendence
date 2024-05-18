import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { FriendshipDto } from '../dto/friendship-dto';
import { UsernameCache } from '../utils/usernameCache';
import { AvatarService } from '../avatar/avatar.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { FriendService } from '../friend/friend.service';
import { EventPattern } from '@nestjs/microservices';
import { UserStatusEnum } from 'src/utils/user-status.enum';
import { FriendWithNameDto } from 'src/dto/friend-with-name-dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly usernameCache: UsernameCache,
    private readonly avatarService: AvatarService,
    private readonly friendService: FriendService,
  ) {}

  @EventPattern('new_user')
  createUserStatus(data: any): void {
    console.log(this.userService.createUserStatus(data.user_id));
  }

  @Patch('/:id/status')
  changeUserStatus(
    @Param('id') user_id: string,
    @Body('status') status: UserStatusEnum,
  ) {
    return this.userService.changeUserStatus({ user_id, status });
  }

  @Get('/:id/status')
  getUserStatus(@Param('id') user_id: string) {
    return this.userService.getUserStatus(user_id);
  }

  //   user
  @Get('/:id')
  getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Patch('/:id/user_name')
  changeUsername(
    @Param('id') id: string,
    @Body('user_name') user_name: string,
  ): Promise<User> {
    return this.userService.changeUsername({ userId: id, userName: user_name });
  }

  //   friend
  @Post('/friend')
  async addFriend(
    @Body() friendshipDto: FriendshipDto,
  ): Promise<FriendWithNameDto> {
    try {
      const friend = await this.friendService.addFriend(friendshipDto);
      const friendUsername = await this.userService.getUsername(
        friend.friend_id,
      );
      return {
        userId: friend.user_id,
        friendId: friend.friend_id,
        friendUsername: friendUsername,
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/friend')
  unfriend(@Body() friendshipDto: FriendshipDto): Promise<FriendshipDto> {
    return this.friendService.unfriend(friendshipDto);
  }

  //   avatar
  @Patch('/:id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  changeAvatar(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<string> {
    return this.avatarService.setAvatar({
      user_id: id,
      avatar: image.buffer,
      mime_type: image.mimetype,
    });
  }

  @Get('/:id/avatar')
  async getAvatar(
    @Param('id') user_id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const avatarRecord = await this.avatarService.getAvatar(user_id);
    res.set({
      'Content-Type': `${avatarRecord.mime_type}`,
    });
    return new StreamableFile(avatarRecord.avatar);
  }

  // TESTING - TO BE DELETED
  // for testing purposes (gets all friends of a specific user)
  @Get('/:id/friends')
  getFriends(@Param('id') user_id: string) {
    return this.friendService.getFriends(user_id);
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
