import {
    UserDto,
  } from '../dto/chat.dto';
  
  export class User implements UserDto {
    constructor(attrs: UserDto) {
      Object.assign(this, attrs);
    }
    userId: string;
    userName: string;
    socketId: string;
    blockedUsers: User[];
  }
  