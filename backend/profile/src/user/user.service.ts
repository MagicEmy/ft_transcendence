import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileUserInfoDto } from './dto/profile-user-info-dto';
import { FriendRepository } from './friend.repository';
import { AddFriendDto } from './dto/add-friend-dto';
import { Friend } from './friend.entity';
import { UsernameCache } from './usernameCache';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(FriendRepository)
    private readonly friendRepository: FriendRepository,
    private readonly usernameCache: UsernameCache,
  ) {}

  async getUserInfoForProfile(user_id: string): Promise<ProfileUserInfoDto> {
    try {
      const user = await this.getUserById(user_id);
      return {
        user_id: user_id,
        user_name: user.user_name,
        avatar: user.avatar,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new BadRequestException();
      }
    }
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

  async changeUserName(user_id: string, user_name: string): Promise<User> {
    const found = await this.getUserById(user_id);
    if (!found) {
      throw new NotFoundException(`User with ID "${user_id}" not found`);
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
    let user_name = this.usernameCache.getUsername(user_id);
    if (user_name) {
      return user_name;
    }

    const fromDB = await this.userRepository
      .createQueryBuilder('users')
      .select('user_name')
      .where('user_id = :user_id', { user_id })
      .getRawOne();
    if (!fromDB) {
      user_name = '<user deleted>';
    } else {
      user_name = fromDB.user_name;
    }
    this.usernameCache.setUsername(user_id, user_name);
    return user_name;
  }

  async getFriends(user_id: string): Promise<string[]> {
    console.log('in getFriends()');
    const friendsRaw = await this.friendRepository
      .createQueryBuilder('friends')
      .select('friend_id')
      .where('user_id LIKE :user_id', { user_id: user_id })
      .getRawMany();
    if (friendsRaw.length === 0) {
      return [];
    }
    const friends = friendsRaw.map((item) => item.friend_id);
    return friends;
  }
}
