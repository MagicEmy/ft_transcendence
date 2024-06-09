import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtPayloadDto } from './dto/jwt-payload-dto';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidateUserDto } from 'src/user/dto/validate-user-dto';
import { TokensDto } from './dto/tokens-dto';
import { Token } from 'src/user/token-entity';
import { DeleteRefreshTokenDto } from './dto/delete-refresh-token-dto';
import { CookieTokenDto } from './dto/cookie-token-dto';
import { CookieAndCookieNameDto } from './dto/cookie-and-cookie-name-dto';
import { UserIdNameLoginDto } from 'src/user/dto/user-id-name-login-dto';
import { TwoFactorAuthService } from 'src/tfa/two-factor-auth.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tfaService: TwoFactorAuthService,
    @Inject('AUTH_SERVICE') private readonly statsClient: ClientKafka,
  ) {}

  async validateUser(validateUserDto: ValidateUserDto): Promise<User> {
    const user = await this.validateUserOrAddNewOne(validateUserDto);
    return user;
  }

  private async validateUserOrAddNewOne(
    validateUserDto: ValidateUserDto,
  ): Promise<User> {
    const { intraLogin, avatarUrl } = validateUserDto;
    let user = await this.userService.getUserByIntraLogin(intraLogin);
    if (!user) {
      try {
        user = await this.userService.createUser({
          intraLogin: intraLogin,
          userName: intraLogin,
        });

        this.userService.createAvatarRecord(user.user_id, avatarUrl);
        this.tfaService.createTfaRecord(user.user_id);
      } catch (error) {
        return null;
      }

      // new user creation is broadcast to profile and chat
      this.statsClient.emit('new_user', {
        userId: user.user_id,
        intraLogin: user.intra_login,
        userName: user.user_name,
      });
    }
    return user;
  }

  async getUser(userId: string): Promise<User> {
    return this.userService.getUserById(userId);
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

  private generateJwtAccessToken(jwtPayloadDto: JwtPayloadDto): string {
    return this.jwtService.sign(jwtPayloadDto, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_EXPIRATION_TIME')}`,
    });
  }

  private generateJwtRefreshToken(userId: string): string {
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
    if (userId) {
      return this.userService.deleteRefreshToken(userId);
    } else if (refreshToken) {
      try {
        const user: UserIdNameLoginDto =
          await this.getUserByRefreshToken(refreshToken);
        return this.userService.deleteRefreshToken(user.userId);
      } catch (error) {}
    }
    return null;
  }

  async getUserByRefreshToken(
    refreshToken: string,
  ): Promise<UserIdNameLoginDto> {
    try {
      const user = await this.userService.getUserByRefreshToken(refreshToken);
      if (!user) {
        throw new RpcException(new NotFoundException(`User not found`));
      }
      return {
        userId: user.user_id,
        userName: user.user_name,
        intraLogin: user.intra_login,
      };
    } catch (error) {
      throw error;
    }
  }

  extractTokenFromCookies(cookieAndCookieName: CookieAndCookieNameDto): string {
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

  addCookiesToResponse(resp: Response, user): Response {
    const tokens = this.login(user);
    // setting the jwt tokens in cookies
    const accessCookie = this.getCookieWithTokens({
      cookieName: this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'),
      token: tokens.jwtAccessToken,
      expirationTime: this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
    });
    const refreshCookie = this.getCookieWithTokens({
      cookieName: this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME'),
      token: tokens.jwtRefreshToken,
      expirationTime: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });
    resp.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return resp;
  }

  async isTfaEnabled(userId): Promise<boolean> {
    return this.tfaService.isTwoFactorAuthenticationEnabled(userId);
  }
}
