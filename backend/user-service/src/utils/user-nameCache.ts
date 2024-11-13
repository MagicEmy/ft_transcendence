import { Injectable } from '@nestjs/common';
import { CacheInterface } from '../user/interface/user-name-cache.interface';
import { UserIdNameDto } from 'src/user/dto/user-id-name-dto';

@Injectable()
export class UserNameCache {
  private userNameCache: CacheInterface = {};

  getUserName(userId: string): string {
    return this.userNameCache[userId];
  }

  setUserName(userNameDto: UserIdNameDto): void {
    this.userNameCache[userNameDto.userId] = userNameDto.userName;
  }
}
