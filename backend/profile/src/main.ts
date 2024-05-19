import { NestFactory } from '@nestjs/core';
import { ProfileModule } from './profile.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ProfileModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Profile Module')
    .setDescription('API for all profile/user related requests')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

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
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap();
