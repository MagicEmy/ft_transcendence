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

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        console.log(`key is ${configService.get('JWT_SECRET')}`);
        const cnf = {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: 3600 },
        };
        console.log(`cnf is`);
        console.log(cnf);
        return cnf;
      },
    }),
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
  exports: [PassportModule],
})
export class AuthModule {}
