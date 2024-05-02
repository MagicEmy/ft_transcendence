import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarRepository } from './avatar.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(AvatarRepository)
    private avatarRepository: AvatarRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async getUserByIntraLogin(intra_login: string): Promise<User> {
    return await this.userRepository.findOneBy({
      intra_login: intra_login,
    });
  }

  async getAvatarFrom42Api(
    avatar_url: string,
  ): Promise<{ mime_type: string; image: Buffer }> {
    return await firstValueFrom(
      this.httpService
        .get(avatar_url, {
          responseType: 'arraybuffer',
        })
        .pipe(
          map((value) => {
            return {
              mime_type: value.headers['content-type'],
              image: value.data,
            };
          }),
        ),
    );
  }

  async createAvatarRecord(
    user_id: string,
    avatar_url: string,
  ): Promise<string> {
    const response = await this.getAvatarFrom42Api(avatar_url);
    return this.avatarRepository.createAvatarRecord({
      user_id,
      mime_type: response.mime_type,
      avatar: response.image,
    });
  }
}
