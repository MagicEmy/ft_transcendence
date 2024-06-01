import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtPayloadDto } from './dto/jwt-payload-dto';
import { ClientKafka } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidateUserDto } from 'src/user/dto/validate-user-dto';
import { TokensDto } from './dto/tokens-dto';
import { Token } from 'src/user/token-entity';
import { DeleteRefreshTokenDto } from './dto/delete-refresh-token-dto';
import * as jwt from 'jsonwebtoken';
import { CookieTokenDto } from './dto/cookie-token-dto';
import { CookieAndCookieNameDto } from './dto/cookie-and-cookie-name-dto';
import { UserIdNameLoginDto } from 'src/user/dto/user-id-name-login-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('AUTH_SERVICE') private readonly statsClient: ClientKafka,
  ) {}

  async validateUser(validateUserDto: ValidateUserDto): Promise<User> {
    const user = await this.validateUserOrAddNewOne(validateUserDto);
    return user;
  }

  async validateUserOrAddNewOne(
    validateUserDto: ValidateUserDto,
  ): Promise<User> {
    const { intraLogin, avatarUrl } = validateUserDto;
    let user = await this.userService.getUserByIntraLogin(intraLogin);
    if (!user) {
      user = await this.userService.createUser({
        intraLogin: intraLogin,
        userName: intraLogin,
      });

      this.userService.createAvatarRecord(user.user_id, avatarUrl);

      // new user creation is broadcast to profile and chat
      this.statsClient.emit('new_user', {
        userId: user.user_id,
        intraLogin: user.intra_login,
        userName: user.user_name,
      });
    }
    return user;
  }

  login(user: User): TokensDto {
    const { user_id, user_name, intra_login } = user;
    return this.generateJwtTokens({
      sub: user_id,
      userName: user_name,
      intraLogin: intra_login,
    });
  }

  generateJwtTokens(jwtPayloadDto: JwtPayloadDto): TokensDto {
    const jwtAccessToken = this.generateJwtAccessToken(jwtPayloadDto);
    const jwtRefreshToken = this.generateJwtRefreshToken(jwtPayloadDto.sub);
    this.userService.saveRefreshTokenInDB({
      userId: jwtPayloadDto.sub,
      refreshToken: jwtRefreshToken,
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

  getCookieWithTokens(cookieTokenDto: CookieTokenDto): string {
    const cookie = `${cookieTokenDto.cookieName}=${cookieTokenDto.token}; Path=/; HttpOnly; Secure=true; Max-Age=${cookieTokenDto.expirationTime}`;
    return cookie;
  }

  async deleteRefreshTokenFromDB(
    deleteRefreshTokenDto: DeleteRefreshTokenDto,
  ): Promise<Token> | null {
    const { userId, refreshToken } = deleteRefreshTokenDto;
    if (!userId && refreshToken) {
      try {
        const user: UserIdNameLoginDto =
          await this.getUserByRefreshToken(refreshToken);
        return this.userService.deleteRefreshToken(user.userId);
      } catch (error) {}
    } else if (userId) {
      return this.userService.deleteRefreshToken(userId);
    }
    return null;
  }

  async getRefreshTokenFromDB(userId: string): Promise<string> {
    return this.userService.getRefreshToken(userId);
  }

  async getUserByRefreshToken(
    refreshToken: string,
  ): Promise<UserIdNameLoginDto> {
    try {
      const user = await this.userService.getUserByRefreshToken(refreshToken);
      return {
        userId: user.user_id,
        userName: user.user_name,
        intraLogin: user.intra_login,
      };
    } catch (error) {
      return null;
    }
  }

  extractTokenFromCookies(cookieAndCookieName: CookieAndCookieNameDto): string {
    console.log(
      'in extractTokenFromCookies, cookieAndCookieName is ',
      cookieAndCookieName,
    );
    let tokenValue = '';
    if (cookieAndCookieName.cookie) {
      cookieAndCookieName.cookie
        .toString()
        .split(';')
        .forEach((cookie) => {
          const [name, value] = cookie.trim().split('=');
          if (name === cookieAndCookieName.cookieName) {
            tokenValue = value;
          }
        });
    }
    return tokenValue;
  }

  //   getJwtTokenPayload(req): UserDto {
  getJwtTokenPayload(cookies: string): any {
    const refreshToken = this.extractTokenFromCookies({
      cookie: cookies,
      cookieName: this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'),
    });
    try {
      const user = jwt.verify(
        refreshToken,
        this.configService.get('JWT_ACCESS_SECRET'),
      );
      return user;
    } catch (error) {
      console.log('Caught an error when decoding refreshToken');
      console.log(error);
    }
    return null;
  }
}
