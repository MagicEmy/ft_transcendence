import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // await app.listen(3003); // USE WHEN RUNNING DIRECTLY ON THE HOST
  await app.listen(3000); // USE WHEN RUNNING IN DOCKER!!!
}
bootstrap();
