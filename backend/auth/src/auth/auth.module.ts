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
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { TfaStrategy } from './utils/tfa-strategy';
import { TwoFactorAuthService } from 'src/tfa/two-factor-auth.service';
import { TfaRepository } from 'src/tfa/tfa.repository';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'stats',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'auth-client',
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
    ConfigService,
    UserService,
    UserRepository,
    TfaStrategy,
    TwoFactorAuthService,
    TfaRepository,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
