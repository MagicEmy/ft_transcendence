import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './jwt-auth/auth.service';
import { JwtStrategy } from './jwt-auth/jwt-strategy';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AuthService',
        transport: Transport.TCP,
        options: {
          host: 'auth_service',
          port: 3003,
        },
      },
      {
        name: 'GameService',
        transport: Transport.TCP,
        options: {
          host: 'game_service',
          port: 3007,
        },
      },
      {
        name: 'UserService',
        transport: Transport.TCP,
        options: {
          host: 'user_service',
          port: 3008,
        },
      },
      {
        name: 'StatsService',
        transport: Transport.TCP,
        options: {
          host: 'stats_service',
          port: 3009,
        },
      },
    ]),
    PassportModule.register({ session: false }),
    JwtModule.register({}),
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, JwtStrategy],
})
export class AppModule {}
