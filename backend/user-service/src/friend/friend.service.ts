import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipRepository } from './friendship.repository';
import { FriendshipDto } from './dto/friendship-dto';
import { Friendship } from './friendship.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(FriendshipRepository)
    private readonly friendshipRepository: FriendshipRepository,
  ) {}

  async createFriendship(friendshipDto: FriendshipDto): Promise<Friendship> {
    return this.friendshipRepository.createFriendship(friendshipDto);
  }

  async getFriends(userId: string): Promise<string[]> {
    return this.friendshipRepository.getFriends(userId);
  }

  async removeFriendship(friendshipDto: FriendshipDto): Promise<FriendshipDto> {
    return this.friendshipRepository.removeFriendship(friendshipDto);
  }
}
