import {
    UserDto,
  } from '../dto/chat.dto';
import { 
	Column, 
	Entity, 
	PrimaryColumn, 
	PrimaryGeneratedColumn 
  } from 'typeorm';

@Entity({ name: 'users' })
export class User implements UserDto {
  constructor(attrs: UserDto) {
    Object.assign(this, attrs);
  }

  @PrimaryGeneratedColumn()
  id: string;

  @PrimaryColumn('uuid')
  userId: string;

  @Column()
  userName: string;

  @Column()
  socketId: string;
}
