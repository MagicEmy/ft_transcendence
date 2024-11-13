import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GameService } from './game/game.service';
import { GameRepository } from './game/game.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Game } from './game/game.entity';
import { configValidationSchema } from './config.schema';
import { User } from './game/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Game, User]),
  ],
  controllers: [AppController],
  providers: [GameService, GameRepository],
})
export class AppModule {}
