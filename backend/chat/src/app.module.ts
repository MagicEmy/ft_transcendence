import { Module } from '@nestjs/common';
import { ChatGatewayModule } from './gateway/chat.gateway.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { User } from './entities/user.entity';
import { BlockedUser } from './entities/blocked-user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER_CHAT'),
        password: configService.get('POSTGRES_PASSWORD_CHAT'),
        database: configService.get('POSTGRES_DB'),
        entities: [User, BlockedUser],
        synchronize: true,
      }),
    }),
    ChatGatewayModule,
  ],
})
export class AppModule {}
