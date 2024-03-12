import { Injectable } from '@nestjs/common';
import { ValidateUserDto } from 'src/user/dto/validate-user-dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async validateUser({ intra_login }: ValidateUserDto): Promise<User> {
    console.log('AuthService');
    console.log(intra_login);
    const found = await this.userService.getUserByIntraLogin(intra_login);

    console.log(found);
    if (!found) {
      console.log(`Gotta add user ${intra_login}`);
      const created = await this.userService.createUser({
        intra_login: intra_login,
        user_name: intra_login,
      });
      return created;
    } else {
      console.log(`We already have ${intra_login}`);
      return found;
    }
  }
}
