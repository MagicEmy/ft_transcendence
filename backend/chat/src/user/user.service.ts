import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto, ChatUserDto, BlockedUserDto } from 'src/dto/chat.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from './user.repository';
import { BlockedUserRepository } from './blocked-user.repository';
import { StatusChangeDto, UserIdNameDto } from 'src/kafka/dto/kafka-dto';

@Injectable()
export class UserService {
  constructor( 
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(BlockedUserRepository)
    private readonly blockedUserRepository: BlockedUserRepository,
  ) {}
  private users: User[] = [];

  async addUser(userDto: UserDto, socketId: string): Promise<User> {
    return await this.userRepository.createUser({
      userId: userDto.userId,
      userName: userDto.userName,
      socketId,
      online: true,
      game: '',
    });
  }

  async setUserName(userNameDto: UserIdNameDto): Promise<void> {
    const found : User | undefined = await this.getUserById(userNameDto.userId);
    if (found instanceof User) {
      found.userName = userNameDto.userName;
      await this.userRepository.save(found);
    }
  }

  async getUserBySocketId(socketId: string): Promise<User | undefined> {
    const user : User | undefined  = await this.userRepository.getUserBySocketId(socketId);
    if (!user) {
      return undefined;
    }
    return user;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    // validate userId
    const found : User | undefined = await this.userRepository.getUserById(userId);
    if (!found) {
      return undefined;
    } else {
      return found;
    }
  }
  async getAllUsers(): Promise<ChatUserDto[]> {
    const usersInDB: User[] = await this.userRepository.getAllUsers();
    const users: ChatUserDto[] = await Promise.all(
      usersInDB.map(async (user) => ({
        userId: user.userId,
        userName: user.userName,
        online: user.online,
        userBeenBlocked: await this.getAllBlockingUsersByBlockedUserId(
          user.userId,
        ),
      })),
    );
    return users;
  }

  async getUserSocketById(userId: string): Promise<string | undefined> {
    return await this.userRepository.getSocketIdByUserId(userId);
  }

  async setUsername(userId: string, userName: string): Promise<User> {
    // validate userId to be uuid
    const user : User = await this.userRepository.setUsername(userId, userName);
    console.log(`User name of user ${userId} set to ${userName}`);
    return user;
  }

  async setUserSocketStatus(
    user: UserDto,
    socketId: string,
    status: boolean,
  ): Promise<StatusChangeDto> {
    return this.userRepository.setUserSocketStatus(
      user.userId,
      socketId,
      status,
    );
  }

  async blockUser(blockedUserDto: BlockedUserDto): Promise<string> {
    return await this.blockedUserRepository.setUserAsBlocked(blockedUserDto);
  }

  async unblockUser(blockedUserDto: BlockedUserDto): Promise<string> {
    return await this.blockedUserRepository.setUserAsUnblocked(blockedUserDto);
  }

  // returns a list of userIds that are blocked by a specific user (blockingUserId), a.k.a. a.k.a. "WHOM DID I BLOCK?"
  async getAllBlockedUsersByBlockingUserId(
    blockingUserId: string,
  ): Promise<string[]> {
    return await this.blockedUserRepository.getAllBlockedUsersByBlockingUserId(
      blockingUserId,
    );
  }

  // returns a list of userIds by whom a specific user (blockedUserId) is blocked, a.k.a. "WHO BLOCKED ME?"
  async getAllBlockingUsersByBlockedUserId(
    blockedUserId: string,
  ): Promise<string[]> {
    return await this.blockedUserRepository.getAllBlockingUsersByBlockedUserId(
      blockedUserId,
    );
  }

  async isBlockedBy(blockedUserDto: BlockedUserDto): Promise<boolean> {
    return await this.blockedUserRepository.isBlockedBy(blockedUserDto);
  }

  async checkBlockedUser(user: UserDto, userCheck: string): Promise<string> {
    if (
      await this.isBlockedBy({
        blockedUserId: userCheck,
        blockingUserId: user.userId,
      })
    ) {
      return 'You Blocked the User';
    }
    if (
      await this.isBlockedBy({
        blockedUserId: user.userId,
        blockingUserId: userCheck,
      })
    ) {
      return 'The User Blocked You';
    }
    return 'Not Blocked';
  }
}
