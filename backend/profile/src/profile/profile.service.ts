import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserRepository) userRepository: UserRepository,
  ) {}

  async getProfileById(id: string): Promise< {

  }
}
