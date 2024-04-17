import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice<MicroserviceOptions>({
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
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.KAFKA,
  //     options: {
  //       client: {
  //         brokers: ['kafka:29092'],
  //       },
  //       consumer: {
  //         groupId: 'stats-consumer',
  //       },
  //     },
  //   },
  // );
  // app.listen();
}

bootstrap();

// const app = await NestFactory.create(AppModule);
// const microservice = app.connectMicroservice<MicroserviceOptions>({
//   transport: Transport.TCP,
// });

// await app.startAllMicroservices();
// await app.listen(3001);
