import { Injectable } from '@nestjs/common';
import { UserDto } from 'src/dto/chat.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UserService{
    private users: User[] = []

    async addUser( user: UserDto)
    {
        const findUser = await this.getUserById(user.userId);
        if (findUser == 'Not Existing') {
            const tempUser: User = {userId: user.userId, userName: user.userName, socketId: user.socketId, blockedUsers:[]};
            const newUser = new User(tempUser);
            this.users.push(newUser);
        }
    }

    async getUserById (user: User['userId']): Promise <User | 'Not Existing'>
    {
        const searchForUserIndex = await this.getUserIndexById(user)
        if (searchForUserIndex === -1) {
            return 'Not Existing';
        }
        return this.users[searchForUserIndex];
    }

    async setUsername (user: User, username: string)
    {
        const searchUser = await this.getUserIndexById(user.userId)
        if (searchUser !== -1)
            this.users[searchUser].userName = username
    }

    async getUserIndexById (userId: User['userId']): Promise <number>
    {
        const searchForUserIndex = this.users.findIndex(
            (user) => user.userId === userId,
          );
          return searchForUserIndex;
    }
}

