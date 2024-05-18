import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtPayloadDto } from './dto/jwt-payload-dto';
import { ClientKafka } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidateUserDto } from 'src/user/dto/validate-user-dto';
import { NewUserDto } from './dto/new-user-dto';
import { TokensDto } from './dto/tokens-dto';
import { Token } from 'src/user/token-entity';
import { DeleteRefreshTokenDto } from './dto/delete-refresh-token-dto';

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

      this.userService.createAvatarRecord(user.user_id, avatar_url);

      // new user creation is broadcast to profile and chat
      this.announceNewUser({
        user_id: user.user_id,
        intra_login: user.intra_login,
        user_name: user.user_name,
      });
    }
    return user;
  }

  private announceNewUser(newUserDto: NewUserDto): void {
    this.statsClient.emit('new_user', newUserDto);
  }

  login(user: User): TokensDto {
    const { user_id, user_name, intra_login } = user;
    return this.generateJwtTokens({
      sub: user_id,
      user_name,
      intra_login,
    });
  }

  generateJwtTokens(jwtPayloadDto: JwtPayloadDto): TokensDto {
    const jwtAccessToken = this.generateJwtAccessToken(jwtPayloadDto);
    const jwtRefreshToken = this.generateJwtRefreshToken(jwtPayloadDto.sub);
    this.userService.saveRefreshTokenInDB({
      user_id: jwtPayloadDto.sub,
      refresh_token: jwtRefreshToken,
    });
    return {
      jwtAccessToken: jwtAccessToken,
      jwtRefreshToken: jwtRefreshToken,
    };
  }

  generateJwtAccessToken(jwtPayloadDto: JwtPayloadDto): string {
    return this.jwtService.sign(jwtPayloadDto, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_EXPIRATION_TIME')}`,
    });
  }

  generateJwtRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRATION_TIME')}`,
      },
    );
  }

  getTokenCookieOptions(expirationTime: string, httpOnly: boolean) {
    return {
      path: '/',
      secure: true,
      expires: new Date(Date.now() + Number(expirationTime)),
      httpOnly: httpOnly,
    };
  }

  async deleteRefreshTokenFromDB(
    deleteRefreshTokenDto: DeleteRefreshTokenDto,
  ): Promise<Token> | null {
    const { userId, refreshToken } = deleteRefreshTokenDto;
    if (!userId && refreshToken) {
      try {
        const user = await this.getUserByRefreshToken(refreshToken);
        return this.userService.deleteRefreshToken(user.user_id);
      } catch (error) {}
    } else if (userId) {
      return this.userService.deleteRefreshToken(userId);
    }
    return null;
  }

  async getRefreshTokenFromDB(userId: string): Promise<string> {
    return this.userService.getRefreshToken(userId);
  }

  async getUserByRefreshToken(refreshToken: string): Promise<User> {
    return this.userService.getUserByRefreshToken(refreshToken);
  }
}
