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
import { Friend } from '../friend/friend.entity';
import { UsernameCache } from '../utils/usernameCache';
import { AvatarService } from '../avatar/avatar.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { FriendService } from '../friend/friend.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly usernameCache: UsernameCache,
    private readonly avatarService: AvatarService,
    private readonly friendService: FriendService,
  ) {}

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
    return this.userService.changeUsername(id, user_name);
  }

  //   friend
  @Post('/friend')
  addFriend(@Body() friendshipDto: FriendshipDto): Promise<Friend> {
    return this.friendService.addFriend(friendshipDto);
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
    console.log(image);
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
