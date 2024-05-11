import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipDto } from '../dto/friendship-dto';

export class FriendRepository extends Repository<Friend> {
  constructor(
    @InjectRepository(Friend) private friendRepository: Repository<Friend>,
  ) {
    super(
      friendRepository.target,
      friendRepository.manager,
      friendRepository.queryRunner,
    );
  }

  async addFriend(friendshipDto: FriendshipDto): Promise<Friend> {
    const friend = this.friendRepository.create(friendshipDto);
    try {
      await this.friendRepository.save(friend);
    } catch (error) {
      if (error.code !== '23505') {
        console.log(error);
      }
    }
    return friend;
  }

  async getFriends(user_id: string): Promise<string[]> {
    const friendsRaw = await this.createQueryBuilder('friends')
      .select('friend_id')
      .where('user_id LIKE :user_id', { user_id: user_id })
      .getRawMany();
    if (friendsRaw.length === 0) {
      return [];
    }
    const friends = friendsRaw.map((item) => item.friend_id);
    return friends;
  }

  async removeFriend(friendshipDto: FriendshipDto): Promise<FriendshipDto> {
    try {
      this.createQueryBuilder()
        .delete()
        .where('friend_id = :friend_id', { friend_id: friendshipDto.friend_id })
        .andWhere('user_id = :user_id', { user_id: friendshipDto.user_id })
        .execute();
      console.log(
        `User ${friendshipDto.user_id} just unfriended user ${friendshipDto.friend_id}`,
      );
    } catch (error) {
      console.log('Caught an error when trying to remove a friendship:');
      console.log(error);
    }
    return friendshipDto;
  }
}
