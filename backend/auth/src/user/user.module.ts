import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Avatar } from './avatar.entity';
import { AvatarRepository } from './avatar.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Avatar])],
  controllers: [UserController],
  providers: [UserService, UserRepository, AvatarRepository],
  exports: [TypeOrmModule, UserRepository, UserService, AvatarRepository],
})
export class UserModule {}
