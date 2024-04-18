import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockedUserDto, UserDto } from 'src/dto/chat.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from './user.repository';
import { BlockedUserRepository } from './blocked-user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(BlockedUserRepository)
    private readonly blockedUserRepository: BlockedUserRepository,
  ) {}

  async addUser(userDto: UserDto): Promise<User> {
    let user = await this.userRepository.getUserById(userDto.userId);
    if (!user) {
      try {
        user = await this.userRepository.createUser(userDto);
      } catch (error) {
        console.log(error);
        // TBD what to throw
      }
    } else {
      await this.setUserSocket(userDto.userId, userDto.socketId);
    }
    return user;
  }

  // @Debora, you could consider changing these two functions to only return
  //   Promise<User> instead of Promise<User | 'Not Existing'>
  //   and then checking in the receiving function whether it is valid or undefined

  async getUserBySocketId(socketId: string): Promise<User | 'Not Existing'> {
    const user = this.userRepository.getUserBySocketId(socketId);
    if (!user) {
      return 'Not Existing';
    }
    return user;
  }

  async getUserById(userId: string): Promise<User | 'Not Existing'> {
    // validate userId
    const found = await this.userRepository.getUserById(userId);
    if (!found) {
      return 'Not Existing';
    } else {
      return found;
    }
  }

  async getUserSocketById(userId: string): Promise<string | undefined> {
    return this.userRepository.getSocketIdByUserId(userId);
  }

  async setUserName(userId: string, userName: string): Promise<User> {
    // validate userId to be uuid
    const user = await this.userRepository.setUserName(userId, userName);
    console.log(`User name of user ${userId} set to ${userName}`);
    return user;
  }

  async setUserSocket(userId: string, socketId: string): Promise<User> {
    const user = await this.userRepository.setUserSocket(userId, socketId);
    console.log(`SocketId of user ${userId} set to ${socketId}`);
    return user;
  }

  // FUNCTIONS RELATED TO BLOCKING OF USERS

  blockUser(blockedUserDto: BlockedUserDto) {
    this.blockedUserRepository.setUserAsBlocked(blockedUserDto);
  }

  unblockUser(blockedUserDto: BlockedUserDto) {
    this.blockedUserRepository.setUserAsUnblocked(blockedUserDto);
  }

  async getAllBlockedUsersByBlockingUserId(
    blockingUserId: string,
  ): Promise<string[]> {
    return this.blockedUserRepository.getAllBlockedUsersByBlockingUserId(
      blockingUserId,
    );
  }

  async isBlockedBy(blockedUserDto: BlockedUserDto): Promise<boolean> {
    return this.blockedUserRepository.isBlockedBy(blockedUserDto);
  }
}
