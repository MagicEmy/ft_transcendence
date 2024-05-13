import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FourtyTwoStrategy } from './utils/fourty-two-strategy';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './utils/jwt-access-strategy';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { JwtRefreshStrategy } from './utils/jwt-refresh-strategy';

@Module({
  imports: [
    ClientsModule.register([
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
    PassportModule.register({ session: false }),
    JwtModule.register({}),
    UserModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    FourtyTwoStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    ConfigService,
    UserService,
    UserRepository,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
