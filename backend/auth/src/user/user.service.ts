import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarRepository } from './avatar.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { Token } from './token-entity';
import { TokenRepository } from './token.repository';
import { RefreshTokenDto } from './dto/refresh-token-dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(AvatarRepository)
    private avatarRepository: AvatarRepository,
    @InjectRepository(TokenRepository)
    private tokenRepository: TokenRepository,
  ) {}

  // User

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
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
      throw new RpcException(new NotFoundException(`Refresh token not found`));
    }
    return this.userRepository.findOneBy({ user_id: token.user_id });
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
          map((value) => {
            return {
              mimeType: value.headers['content-type'],
              image: value.data,
            };
          }),
        ),
    );
  }

  async createAvatarRecord(userId: string, avatarUrl: string): Promise<string> {
    const response = await this.getAvatarFrom42Api(avatarUrl);
    return this.avatarRepository.createAvatarRecord({
      userId,
      mimeType: response.mimeType,
      avatar: response.image,
    });
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
