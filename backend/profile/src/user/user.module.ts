import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), StatsModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [TypeOrmModule, UserRepository, UserService],
})
export class UserModule {}
