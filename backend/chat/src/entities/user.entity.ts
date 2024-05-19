import { UserDto } from '../dto/chat.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User implements UserDto {
  constructor(attrs: UserDto) {
    Object.assign(this, attrs);
  }

  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  userName: string;

  @Column({ nullable: true })
  socketId: string;

  @Column()
  online: boolean;

  @Column()
  game: string;
}