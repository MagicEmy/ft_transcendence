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
import { FriendWithNameDto } from 'src/dto/friend-with-name-dto';
import { KafkaTopic } from 'src/utils/kafka.enum';
import { UserIdNameDto } from 'src/dto/user-id-name-dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { StatusDto } from 'src/dto/status-dto';
import { UserNameDto } from 'src/dto/user-name-dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly usernameCache: UsernameCache,
    private readonly avatarService: AvatarService,
    private readonly friendService: FriendService,
  ) {}

  @EventPattern(KafkaTopic.NEW_USER)
  createUserStatus(data: any): void {
    console.log(this.userService.createUserStatus(data.user_id));
  }

  @EventPattern(KafkaTopic.STATUS_CHANGE)
  updateUserStatus(data: any): void {
    console.log('in updateUserStatus(), received', data);
    console.log(typeof data);
    this.userService.changeUserStatus({
      user_id: data.userId,
      status: data.newStatus,
    });
  }

  @ApiBody({
    type: StatusDto,
  })
  @Patch('/:id/status')
  changeUserStatus(
    @Param('id') user_id: string,
    @Body('status') status: StatusDto,
  ) {
    return this.userService.changeUserStatus({
      user_id,
      status: status.status,
    });
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

  @ApiBody({
    type: UserNameDto,
  })
  @Patch('/:id/user_name')
  changeUsername(
    @Param('id') id: string,
    @Body('user_name') userName: UserNameDto,
  ): Promise<User> {
    return this.userService.changeUsername({
      userId: id,
      userName: userName.userName,
    });
  }

  //   friend
  @ApiBody({
    type: FriendshipDto,
  })
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

  @ApiBody({
    type: FriendshipDto,
  })
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
  @ApiTags('testing only')
  @Get('/:id/friends')
  getFriends(@Param('id') user_id: string) {
    return this.friendService.getFriends(user_id);
  }

  // for testing purposes, returns a user_name
  @ApiTags('testing only')
  @Get('/:id/username')
  getUsername(@Param('id') user_id: string) {
    return this.userService.getUsername(user_id);
  }

  @ApiTags('testing only')
  @ApiBody({
    type: UserIdNameDto,
  })
  @Post('/cache')
  putUsernameInCache(@Body() userIdNameDto: UserIdNameDto) {
    this.usernameCache.setUsername(
      userIdNameDto.userId,
      userIdNameDto.userName,
    );
  }

  @ApiTags('testing only')
  @Get('/:id/cache')
  getUsernameFromCache(@Param('id') user_id: string) {
    return this.usernameCache.getUsername(user_id);
  }
}
