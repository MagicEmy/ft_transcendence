import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { UserIdNameLoginDto } from 'src/user/dto/user-id-name-login-dto';
import { TwoFactorAuthService } from 'src/tfa/two-factor-auth.service';
import { Response } from 'express';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { KafkaTopic } from 'src/enum/kafka.enum';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tfaService: TwoFactorAuthService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.authClient.subscribeToResponseOf(KafkaTopic.NEW_USER);
    await this.authClient.connect();
  }

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
      try {
        user = await this.userService.createUser({
          intraLogin: intraLogin,
          userName: intraLogin,
        });
      } catch (error) {
        this.logger.error(`Error creating user ${intraLogin}`, error);
        return null;
      }
      try {
        await this.tfaService.createTfaRecord(user.user_id);
        await this.userService.createAvatarRecord(user.user_id, avatarUrl);
      } catch (error) {
        this.logger.error(
          `Error creating Tfa or avatar record for user ${intraLogin}`,
          error,
        );
        try {
          this.userService.deleteUser(user.user_id);
        } catch (e) {
          this.logger.error(`Error deleting user ${intraLogin}`, e);
        }
        return null;
      }

      // new user creation is broadcast to profile and chat
      try {
        await this.announceNewUser({
          userId: user.user_id,
          intraLogin: user.intra_login,
          userName: user.user_name,
        });
      } catch (error) {
        try {
          await new Promise((sleep) => setTimeout(sleep, 200));
          this.userService.deleteUser(user.user_id);
        } catch (error) {
          this.logger.error(`Error deleting user ${intraLogin}`, error);
          return null;
        }
      }
    }
    return user;
  }

  private announceNewUser(userIdNameLoginDto: UserIdNameLoginDto): any {
    const result = this.authClient
      .send(KafkaTopic.NEW_USER, userIdNameLoginDto)
      .pipe(
        catchError((error) => {
          this.logger.error(
            `Error communicating creation of user ${userIdNameLoginDto.intraLogin}`,
            error,
          );
          return throwError(() => new InternalServerErrorException());
        }),
      );
    return lastValueFrom(result);
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
    const cookie = `${cookieTokenDto.cookieName}=${cookieTokenDto.token}; Path=/; HttpOnly; Max-Age=${cookieTokenDto.expirationTime}`;
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
        this.logger.error(
          `User corresponding to the token ${refreshToken} not found`,
        );
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

  addCookiesToResponse(resp: Response, user: User): Response {
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
    const userIdCookie = `userId=${user.user_id}; Path=/; HttpOnly; Max-Age=${this.configService.get('JWT_REFRESH_EXPIRATION_TIME')}`; // do the lax thing
    resp.setHeader('Set-Cookie', [accessCookie, refreshCookie, userIdCookie]);
    return resp;
  }

  async isTfaEnabled(userId): Promise<boolean> {
    return this.tfaService.isTwoFactorAuthenticationEnabled(userId);
  }
}
