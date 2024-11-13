import { InjectRepository } from '@nestjs/typeorm';
import { BlockedUserDto } from 'src/dto/chat.dto';
import { BlockedUser } from 'src/entities/blocked-user.entity';
import { Repository } from 'typeorm';

export class BlockedUserRepository extends Repository<BlockedUser> {
  constructor(
    @InjectRepository(BlockedUser)
    blockedUserRepository: Repository<BlockedUser>,
  ) {
    super(
      blockedUserRepository.target,
      blockedUserRepository.manager,
      blockedUserRepository.queryRunner,
    );
  }

  async getAllBlockedUsersByBlockingUserId(
    blockingUserId: string,
  ): Promise<string[]> {
    const queryResult = await this.findBy({ blockingUserId: blockingUserId });
    const blockedUsers = queryResult.map((item) => item.blockedUserId);
    return blockedUsers;
  }

  async getAllBlockingUsersByBlockedUserId(
    blockedUserId: string,
  ): Promise<string[]> {
    const queryResult = await this.findBy({ blockedUserId: blockedUserId });
    const blockingUsers = queryResult.map((item) => item.blockingUserId);
    return blockingUsers;
  }

  async isBlockedBy(blockedUserDto: BlockedUserDto): Promise<boolean> {
    const found = await this.findOneBy({
      blockingUserId: blockedUserDto.blockingUserId,
      blockedUserId: blockedUserDto.blockedUserId,
    });
    if (!found) {
      return false;
    }
    return true;
  }

  async setUserAsBlocked(blockedUserDto: BlockedUserDto): Promise<string> {
    const newBlock = this.create(blockedUserDto);
    try {
      await this.save(newBlock);
      return 'Success';
    } catch (error) {
      if (error.code !== '23505') {
        return 'Already Blocked';
      } else {
        console.log(
          'Caught an error when trying to insert a new blocked relationship:',
        );
        console.log(error);
        return 'Error'; // TBD whether this is ok
      }
    }
  }

  async setUserAsUnblocked({
    blockingUserId,
    blockedUserId,
  }: BlockedUserDto): Promise<string> {
    // check whether the blocked relationship even exists?
    try {
      this.createQueryBuilder()
        .delete()
        .where('blockedUserId = :blockedUserId', {
          blockedUserId: blockedUserId,
        })
        .andWhere('blockingUserId = :blockingUserId', {
          blockingUserId: blockingUserId,
        })
        .execute(); // examine what this returns upon success/not found
      // if they were not blocked, return 'Not Blocked'
      return 'Success';
    } catch (error) {
      console.log('Caught an error when trying to unblock a relationship:');
      console.log(error);
      return 'Error';
    }
  }
}
