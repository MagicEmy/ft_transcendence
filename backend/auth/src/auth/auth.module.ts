import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FourtyTwoStrategy } from './utils/fourty-two-strategy';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ options: { session: false } }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    FourtyTwoStrategy,
    ConfigService,
    UserService,
    UserRepository,
  ],
})
export class AuthModule {}
