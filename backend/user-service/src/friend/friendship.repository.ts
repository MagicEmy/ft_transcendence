import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipDto } from './dto/friendship-dto';

export class FriendshipRepository extends Repository<Friendship> {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
  ) {
    super(
      friendshipRepository.target,
      friendshipRepository.manager,
      friendshipRepository.queryRunner,
    );
  }

  async createFriendship(friendshipDto: FriendshipDto): Promise<Friendship> {
    const friend = this.friendshipRepository.create({
      user_id: friendshipDto.userId,
      friend_id: friendshipDto.friendId,
    });
    try {
      await this.friendshipRepository.save(friend);
    } catch (error) {
      throw error;
    }
    return friend;
  }

  async getFriends(userId: string): Promise<string[]> {
    const friendsRaw = await this.createQueryBuilder('friendships')
      .select('friend_id')
      .where('user_id LIKE :userId', { userId: userId })
      .getRawMany();
    if (friendsRaw.length === 0) {
      return [];
    }
    const friends = friendsRaw.map((item) => item.friend_id);
    return friends;
  }

  async removeFriendship(friendshipDto: FriendshipDto): Promise<FriendshipDto> {
    try {
      this.createQueryBuilder()
        .delete()
        .where('friend_id = :friend_id', { friend_id: friendshipDto.friendId })
        .andWhere('user_id = :user_id', { user_id: friendshipDto.userId })
        .execute();
    } catch (error) {
      console.log('Caught an error when trying to remove a friendship:');
      throw error;
    }
    return friendshipDto;
  }
}
