import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtPayloadDto } from './dto/jwt-payload-dto';
import { ClientKafka } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { UserWithTokenDto } from './dto/user-with-token-dto';
import { ValidateUserDto } from 'src/user/dto/validate-user-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('STATS_SERVICE') private readonly statsClient: ClientKafka,
  ) {}

  async validateUser(validateUserDto: ValidateUserDto): Promise<User> {
    const user = await this.validateUserOrAddNewOne(validateUserDto);
    return user;
  }

  async validateUserOrAddNewOne(
    validateUserDto: ValidateUserDto,
  ): Promise<User> {
    const { intra_login, avatar_url } = validateUserDto;
    let user = await this.userService.getUserByIntraLogin(intra_login);
    if (!user) {
      user = await this.userService.createUser({
        intra_login: intra_login,
        user_name: intra_login,
      });

      // TO BE ADDED: get profile picture from 42 api and create avatar record
      this.userService.createAvatarRecord(user.user_id, avatar_url);

      // new user creation is broadcast to profile and chat
      this.statsClient.emit('new_user', {
        user_id: user.user_id,
        intra_login: user.intra_login,
        user_name: user.user_name,
      });
    }
    return user;
  }

  login(userWithToken: UserWithTokenDto): string {
    const { user_id, user_name, intra_login, refresh_token } = userWithToken;
    const token = this.generateJwtToken({
      sub: user_id,
      user_name,
      intra_login,
    });
    return this.createCookieWithTokens(token, refresh_token);
  }

  generateJwtToken(jwtPayloadDto: JwtPayloadDto): string {
    return this.jwtService.sign(jwtPayloadDto);
  }

  createCookieWithTokens(token: string, refresh_token: string) {
    return `Authentication=${token}; Refresh=${refresh_token} HttpOnly; Path=/; secure=true; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
  }
}
