import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Observable, catchError, of, throwError } from 'rxjs';
import { JwtPayloadDto } from 'src/dto/jwt-payload-dto';
import { TokensDto } from 'src/dto/tokens-dto';
import * as jwt from 'jsonwebtoken';
import { UserIdNameLoginDto } from 'src/dto/user-id-name-login-dto';
import { DeleteRefreshTokenDto } from 'src/dto/delete-refresh-token-dto';
import { ConfigService } from '@nestjs/config';
import { UserIdNameDto } from 'src/dto/user-id-name-dto';
import { extractTokenFromCookies } from 'src/utils/cookie-utils';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger(AuthService.name);
  constructor(
    @Inject('AuthService') private readonly authService: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  generateJwtTokens(jwtPayloadDto: JwtPayloadDto): Observable<TokensDto> {
    const pattern = 'getTokens';
    const payload = jwtPayloadDto;
    return this.authService.send<TokensDto>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error(`caught: `, error);
        return throwError(
          () => new RpcException(error.response || 'An unknown error occurred'),
        );
      }),
    );
  }

  validateRefreshToken(refreshToken: string, secret: string): any {
    try {
      const user = jwt.verify(refreshToken, secret);
      return user;
    } catch (error) {
      this.deleteRefreshTokenFromDB({
        refreshToken: refreshToken,
      });
      throw error;
    }
  }

  getUserByRefreshToken(refreshToken: string): Observable<UserIdNameLoginDto> {
    const pattern = 'getUserByRefreshToken';
    const payload = refreshToken;
    return this.authService.send<UserIdNameLoginDto>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error(`caught: `, error);
        return throwError(
          () => new RpcException(error.response || 'An unknown error occurred'),
        );
      }),
    );
  }

  deleteRefreshTokenFromDB(deleteRefreshTokenDto: DeleteRefreshTokenDto): void {
    const pattern = 'deleteRefreshTokenFromDB';
    const payload = deleteRefreshTokenDto;
    this.authService.emit(pattern, payload);
  }

  getUserIdName(cookies: string): Observable<UserIdNameDto> {
    const token = extractTokenFromCookies({
      cookie: cookies,
      cookieName: this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'),
    });
    try {
      const decoded: any = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_SECRET'),
      );
      return of({
        userId: decoded.sub,
        userName: decoded.userName,
      });
    } catch (error) {
      this.logger.error(`Invalid access token`);
      throw new RpcException(new UnauthorizedException(`Invalid access token`));
    }
  }

  createMockUsers(no: number): Observable<string[]> {
    const pattern = 'createUsers';
    const payload = no;
    return this.authService.send(pattern, payload);
  }
}
