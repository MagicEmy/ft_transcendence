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
import { Token } from './token-entity';
import { TokenRepository } from './token.repository';
import { Tfa } from '../tfa/tfa.entity';
import { TfaRepository } from '../tfa/tfa.repository';
import { TwoFactorAuthController } from 'src/tfa/two-factor-auth.controller';
import { TwoFactorAuthService } from 'src/tfa/two-factor-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Avatar, Token, Tfa]),
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
  controllers: [UserController, TwoFactorAuthController],
  providers: [
    UserService,
    UserRepository,
    AvatarRepository,
    TokenRepository,
    TfaRepository,
    TwoFactorAuthService,
  ],
  exports: [
    TypeOrmModule,
    UserRepository,
    UserService,
    AvatarRepository,
    TokenRepository,
    TfaRepository,
  ],
})
export class UserModule {}
