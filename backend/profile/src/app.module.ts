import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'XXX',
      password: 'XXX',
      database: 'transcendence',
      autoLoadEntities: true,
      synchronize: true,
      // logging: true,
    }),
    UsersModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
