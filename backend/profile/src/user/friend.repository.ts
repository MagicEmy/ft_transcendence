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
}
