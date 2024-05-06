import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AvatarRepository } from './avatar.repository';
import { Avatar } from './avatar.entity';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices'; // ONLY FOR TESTING

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Avatar]),
    HttpModule,
    ClientsModule.register([
      // ONLY FOR TESTING PURPOSES - to be removed
      {
        name: 'STATS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'stats',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'stats-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, AvatarRepository],
  exports: [TypeOrmModule, UserRepository, UserService, AvatarRepository],
})
export class UserModule {}
