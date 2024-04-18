import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // await app.listen(3003); // USE WHEN RUNNING DIRECTLY ON THE HOST
  // app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  await app.listen(3000); // USE WHEN RUNNING IN DOCKER!!!
}
bootstrap();
