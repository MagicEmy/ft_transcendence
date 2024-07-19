import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarRepository } from './avatar.repository';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { Token } from './token-entity';
import { TokenRepository } from './token.repository';
import { RefreshTokenDto } from './dto/refresh-token-dto';
import { RpcException } from '@nestjs/microservices';
import { readFile } from 'fs';
import { lookup } from 'mime-types';
import { AvatarDto } from './dto/avatar-dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(AvatarRepository)
    private avatarRepository: AvatarRepository,
    @InjectRepository(TokenRepository)
    private tokenRepository: TokenRepository,
    private readonly configService: ConfigService,
  ) {}

  // User

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async getUserById(userId: string): Promise<User> {
    return this.userRepository.findOneBy({
      user_id: userId,
    });
  }

  async getUserByIntraLogin(intraLogin: string): Promise<User> {
    return this.userRepository.findOneBy({
      intra_login: intraLogin,
    });
  }

  async getUserByRefreshToken(refreshToken: string): Promise<User> {
    const token = await this.tokenRepository.findOneBy({
      refresh_token: refreshToken,
    });
    if (!token) {
      this.logger.log(`Refresh token does not exist in the database`);
      throw new RpcException(
        new NotFoundException(`Refresh token does not exist in the database`),
      );
    }
    return this.userRepository.findOneBy({ user_id: token.user_id });
  }

  async deleteUser(userId: string): Promise<void> {
    return this.userRepository.deleteUser(userId);
  }

  //   Avatar

  async getAvatarFrom42Api(
    avatarUrl: string,
  ): Promise<{ mimeType: string; image: Buffer }> {
    return await firstValueFrom(
      this.httpService
        .get(avatarUrl, {
          responseType: 'arraybuffer',
        })
        .pipe(
          catchError((error) => throwError(() => new NotFoundException())),
          map((value) => {
            return {
              mimeType: value.headers['content-type'],
              image: value.data,
            };
          }),
        ),
    );
  }

  async getDefaultAvatar(userId: string): Promise<AvatarDto> {
    const path = this.configService.get('DEFAULT_AVATAR_PATH');
    return new Promise((resolve, reject) => {
      readFile(path, (err, data) => {
        if (err) {
          return reject(err);
        }
        const mimeType: string = lookup(path) || 'application/octet-stream';
        resolve({
          userId,
          avatar: data,
          mimeType,
        });
      });
    });
  }

  async createAvatarRecord(userId: string, avatarUrl: string): Promise<string> {
    try {
      const response = await this.getAvatarFrom42Api(avatarUrl);
      return this.avatarRepository.createAvatarRecord({
        userId,
        mimeType: response.mimeType,
        avatar: response.image,
      });
    } catch (error) {
      this.logger.warn(
        `Avatar of user ${userId} not found, saving the default avatar`,
      );
      // save a default avatar
      try {
        return this.avatarRepository.createAvatarRecord(
          await this.getDefaultAvatar(userId),
        );
      } catch (error) {
        this.logger.error(
          `Error creating avatar record for user ${userId}`,
          error,
        );
      }
    }
  }

  //   Token

  async saveRefreshTokenInDB(refreshTokenDto: RefreshTokenDto): Promise<Token> {
    return this.tokenRepository.replaceOrCreateRefreshToken(refreshTokenDto);
  }

  async deleteRefreshToken(userId: string): Promise<Token> {
    return this.tokenRepository.replaceOrCreateRefreshToken({
      userId: userId,
      refreshToken: null,
    });
  }

  async getRefreshTokenFromDB(userId: string): Promise<string> | null {
    const token = await this.tokenRepository.findOneBy({ user_id: userId });
    return token ? token.refresh_token : null;
  }
}
