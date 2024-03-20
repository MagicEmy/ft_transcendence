import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ValidateUserDto } from 'src/user/dto/validate-user-dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtPayloadDto } from './dto/jwt-payload-dto';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject('STATS_SERVICE') private readonly statsClient: ClientKafka,
  ) {}
  async validateUser({ intra_login }: ValidateUserDto): Promise<User> {
    const user = await this.userService.getUserByIntraLogin(intra_login);

    console.log(user);
    if (user) {
      return user;
    }
    const newUser = await this.userService.createUser({
      intra_login: intra_login,
      user_name: intra_login,
    });
    // broadcast new user creation to profile and chat
    this.statsClient.emit('new_user', {
      user_id: newUser.user_id,
      intra_login: newUser.intra_login,
      user_name: newUser.user_name,
    });
    return newUser;
    // or should we return null in some cases?
  }

  async login(
    jwtPayloadDto: JwtPayloadDto,
  ): Promise<{ access_token: string; user_id: string; user_name: string }> {
    const token = this.jwtService.sign(jwtPayloadDto);
    console.log(token);
    return {
      access_token: token,
      user_id: jwtPayloadDto.sub,
      user_name: jwtPayloadDto.user_name,
    };
  }
}
