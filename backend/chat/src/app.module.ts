import { Module } from '@nestjs/common';
import { ChatGatewayModule } from './gateway/chat.gateway.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { User } from './entities/user.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { KafkaController } from './kafka/kafka.controller';
import { KafkaModule } from './kafka/kafka.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [KafkaController],
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
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [User, BlockedUser],
        synchronize: true,
      }),
    }),
    ClientsModule.register([
      {
        name: 'CHAT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'chat-client',
            brokers: ['kafka:29092'],
          },
          consumer: {
            groupId: 'game-consumer',
          },
        },
      },
    ]),
    ChatGatewayModule,
    KafkaModule,
  ],
})
export class AppModule {}
