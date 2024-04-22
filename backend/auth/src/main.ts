import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // await app.listen(3003); // USE WHEN RUNNING DIRECTLY ON THE HOST
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: [configService.get('FRONTEND_URL')],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  await app.listen(3000); // USE WHEN RUNNING IN DOCKER!!!
}
bootstrap();
