import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'tokens' })
export class Token {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ nullable: true })
  refresh_token: string;

  @OneToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
