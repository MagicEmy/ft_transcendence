import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileUserInfoDto } from './dto/profile-user-info-dto';
import { FriendRepository } from './friend.repository';
import { AddFriendDto } from './dto/add-friend-dto';
import { Friend } from './friend.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(FriendRepository)
    private readonly friendRepository: FriendRepository,
  ) {}

  async getUserInfoForProfile(user_id: string): Promise<ProfileUserInfoDto> {
    const user = await this.getUserById(user_id);
    return { user_id: user_id, user_name: user.user_name, avatar: user.avatar };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async getUserById(id: string): Promise<User> {
    const found = await this.userRepository.findOneBy({ user_id: id });

    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return found;
  }

  async getTotalNoOfUsers(): Promise<number> {
    return await this.userRepository.count();
  }

  async getUserByIntraLogin(intra_login: string): Promise<User> {
    return await this.userRepository.findOneBy({
      intra_login: intra_login,
    });
  }

  async changeUserName(id: string, user_name: string): Promise<User> {
    const found = await this.getUserById(id);
    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    found.user_name = user_name;
    this.userRepository.save(found);
    return found;
  }

  async addFriend(addFriendDto: AddFriendDto): Promise<Friend> {
    return this.friendRepository.addFriend(addFriendDto);
    // find a way to prevent duplicate entries (perhaps in frontend)
  }

  async getUserName(user_id: string): Promise<string> {
    const returned = await this.userRepository
      .createQueryBuilder('users')
      .select('user_name')
      .where('user_id = :user_id', { user_id })
      .getRawOne();
    return returned.user_name;
  }

  async getFriends(user_id: string): Promise<string[]> {
    console.log('in getFriends()');
    const friendsRaw = await this.friendRepository
      .createQueryBuilder('friends')
      .select('friend_id')
      .where('user_id LIKE :user_id', { user_id: user_id })
      .getRawMany();
    const friends = friendsRaw.map((item) => item.friend_id);
    return friends;
  }
}
