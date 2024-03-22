import { Injectable } from '@nestjs/common';
import { CacheInterface } from './username-cache.interface';

@Injectable()
export class UsernameCache {
  private usernameCache: CacheInterface = {};

  getUsername(user_id: string): string {
    console.log('returning user_name from cache'); // for debugging
    return this.usernameCache[user_id];
  }

  setUsername(user_id: string, user_name: string): void {
    this.usernameCache[user_id] = user_name;
    console.log('saving user_name in cache'); // for debugging
  }
}
