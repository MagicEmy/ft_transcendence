import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddFriendDto } from './dto/add-friend-dto';

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

  async addFriend(addFriendDto: AddFriendDto) {
    const friend = this.friendRepository.create(addFriendDto);
    return this.friendRepository.save(friend);
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
}
