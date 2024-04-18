// FILE CREATED FOR TESTING AND DEBUGGIN PURPOSES

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { BlockedUserDto, UserDto } from 'src/dto/chat.dto';
import { User } from 'src/entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  addUser(@Body() userDto: UserDto): Promise<User> {
    return this.userService.addUser(userDto);
  }

  @Patch('/:id/username')
  setUserName(
    @Param('id') userId: string,
    @Body('userName') userName: string,
  ): Promise<User> {
    return this.userService.setUserName(userId, userName);
  }

  @Patch('/:id/socket')
  setUserSocket(
    @Param('id') userId: string,
    @Body('socketId') socketId: string,
  ): Promise<User> {
    return this.userService.setUserSocket(userId, socketId);
  }

  @Get('/userbysocket/:id')
  getUserBySocketId(
    @Param('id') socketId: string,
  ): Promise<User | 'Not Existing'> {
    return this.userService.getUserBySocketId(socketId);
  }

  @Get('/socketbyuser/:id')
  getUserSocketById(@Param('id') userId: string): Promise<string> {
    return this.userService.getUserSocketById(userId);
  }

  //   BLOCKING OF USERS

  @Post('/block')
  blockUser(@Body() blockedUserDto: BlockedUserDto) {
    this.userService.blockUser(blockedUserDto);
  }

  @Post('/unblock')
  unblockUser(@Body() blockedUserDto: BlockedUserDto) {
    this.userService.unblockUser(blockedUserDto);
  }

  @Get('/blocked/:id')
  getAllBlocked(@Param('id') userId: string): Promise<string[]> {
    return this.userService.getAllBlockedUsersByBlockingUserId(userId);
  }

  @Get('/isblocked')
  isBlockedBy(
    @Query('blockedId') blockedId: string,
    @Query('blockingId') blockingId: string,
  ): Promise<boolean> {
    console.log(
      `in isBlockedBy(); blocked is ${blockedId}, blocking is ${blockingId}`,
    );
    return this.userService.isBlockedBy({
      blockingUserId: blockingId,
      blockedUserId: blockedId,
    });
  }

  @Get('/:id')
  getUserById(@Param('id') userId: string): Promise<User | 'Not Existing'> {
    return this.userService.getUserById(userId);
  }
}
