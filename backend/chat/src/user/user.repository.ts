import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/chat.dto';
import { User } from 'src/entities/user.entity';
import { StatusChangeDto } from 'src/kafka/dto/kafka-dto';
import { UserStatusEnum } from 'src/kafka/kafka.enum';
import { Repository } from 'typeorm';

export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.create(createUserDto);
    try {
      this.save(newUser);
      console.log(`User ${newUser.userName} created.`);
    } catch (error) {
      if (error.code !== '23505') {
        // '23505' means duplicate entry
        throw new InternalServerErrorException(
          `[chat_db] error when creating user id ${newUser.userId}`,
        );
      }
    }
    return newUser;
  }

  async getUserById(userId: string): Promise<User> {
    return this.findOneBy({ userId: userId });
  }

  async getAllUsers(): Promise<User[]> {
    return this.find();
  }

  async getUserBySocketId(socketId: string): Promise<User> {
    const user = this.findOneBy({ socketId: socketId });
    if (!user) {
      throw new NotFoundException(`User with socketId ${socketId} not found`);
    }
    return user;
  }

  async getSocketIdByUserId(userId: string): Promise<string> {
    const user = await this.getUserById(userId);
    return user.socketId;
  }

  async setUserSocketStatus(
    userId: string,
    socketId: string,
    status: boolean,
  ): Promise<void> {
    const user = await this.getUserById(userId);
    user.socketId = socketId;
    user.online = status;
    try {
      this.save(user);
      console.log(
        `SocketId of user ${user.userName} set to ${user.socketId} and online is ${status}.`,
      );
    } catch (error) {
      console.log('ERROR in setUserSocketStatus()');
      console.log(error);
    }
  }

  async setUsername(userId: string, userName: string): Promise<User> {
    const user = await this.getUserById(userId);
    user.userName = userName;
    this.save(user);
    console.log(`User name of user ${user.userId} set to ${user.userName}.`);
    return user;
  }

  async setGame(userId: string, game: string): Promise<string> {
    const user = await this.getUserById(userId);
    if (user) {
      user.game = game;
      return game;
    }
    return '';
  }
}
