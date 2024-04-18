import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from 'src/dto/chat.dto';
import { User } from 'src/entities/user.entity';
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

  async createUser(userDto: UserDto): Promise<User> {
    const newUser = this.create(userDto);
    this.save(newUser);
    console.log(`User ${newUser.userName} created.`);
    return newUser;
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.findOneBy({ userId: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
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

  async setUserSocket(userId: string, socketId: string): Promise<User> {
    const user = await this.getUserById(userId);
    user.socketId = socketId;
    this.save(user);
    console.log(`SocketId of user ${user.userName} set to ${user.socketId}.`);
    return user;
  }

  async setUserName(userId: string, userName: string): Promise<User> {
    const user = await this.getUserById(userId);
    user.userName = userName;
    this.save(user);
    console.log(`User name of user ${user.userId} set to ${user.userName}.`);
    return user;
  }
}
