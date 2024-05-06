import { NestFactory } from '@nestjs/core';
import { ProfileModule } from './profile.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ProfileModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:29092'],
      },
      consumer: {
        groupId: 'stats-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap();
