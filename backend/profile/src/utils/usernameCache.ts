import { Injectable } from '@nestjs/common';
import { CacheInterface } from '../interfaces/username-cache.interface';

@Injectable()
export class UsernameCache {
  private usernameCache: CacheInterface = {};

  getUsername(user_id: string): string {
    return this.usernameCache[user_id];
  }

  setUsername(user_id: string, user_name: string): void {
    this.usernameCache[user_id] = user_name;
  }
}
