import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ValidateUserDto } from 'src/user/dto/validate-user-dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtPayloadDto } from './dto/jwt-payload-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser({ intra_login }: ValidateUserDto): Promise<User> {
    console.log(`in AuthService validateUser() ${intra_login}`);
    const user = await this.userService.getUserByIntraLogin(intra_login);

    console.log(user);
    if (user) {
      return user;
    }
    const newUser = await this.userService.createUser({
      intra_login: intra_login,
      user_name: intra_login,
    });
    console.log(`leaving AuthService validateUser() ${intra_login}`);
    return newUser;
    // or should we return null in some cases?
  }

  async login(jwtPayloadDto: JwtPayloadDto): Promise<{ access_token: string }> {
    return {
      access_token: this.jwtService.sign(jwtPayloadDto),
    };
  }
}
