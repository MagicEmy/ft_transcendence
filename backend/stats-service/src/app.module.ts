import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StatsService } from './stats/stats.service';
import { StatsRepository } from './stats/stats.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { Stats } from './stats/stats.entity';
import { User } from './stats/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
    TypeOrmModule.forFeature([Stats, User]),
    ClientsModule.register([
      {
        name: 'RANK_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'rank-client',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'game-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [StatsService, StatsRepository],
})
export class AppModule {}
