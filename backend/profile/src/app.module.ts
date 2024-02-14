import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
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
    }),
    UserModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
