import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRepository } from './friend.repository';
import { FriendshipDto } from '../dto/friendship-dto';
import { Friend } from './friend.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(FriendRepository)
    private readonly friendRepository: FriendRepository,
  ) {}

  async addFriend(friendshipDto: FriendshipDto): Promise<Friend> {
    return this.friendRepository.addFriend(friendshipDto);
    // find a way to prevent duplicate entries (perhaps in frontend)
  }

  async getFriends(user_id: string): Promise<string[]> {
    return this.friendRepository.getFriends(user_id);
  }

  async unfriend(friendshipDto: FriendshipDto): Promise<FriendshipDto> {
    return this.friendRepository.removeFriend(friendshipDto);
  }
}
