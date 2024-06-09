import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipDto } from './dto/friendship-dto';
import { RpcException } from '@nestjs/microservices';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

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

  async createFriendship(friendshipDto: FriendshipDto): Promise<FriendshipDto> {
    const friend = this.create({
      user_id: friendshipDto.userId,
      friend_id: friendshipDto.friendId,
    });
    try {
      await this.save(friend);
    } catch (error) {
      if (error.code === '23503') {
        // '23503' means query error (constraint violation)
        throw new RpcException(
          new BadRequestException(error.driverError + '; ' + error.detail),
        );
      } else if (error.code !== '23505') {
        // '23505' means duplicate entry
        throw new RpcException(
          new InternalServerErrorException(
            error.driverError + '; ' + error.detail,
          ),
        );
      }
    }
    return friendshipDto;
  }

  async getFriends(userId: string): Promise<string[]> {
    const friendsRaw = await this.createQueryBuilder('friendships')
      .select('friend_id')
      .where('user_id = :userId', { userId: userId })
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
      throw new RpcException(new InternalServerErrorException());
    }
    return friendshipDto;
  }
}
