import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'blocked_users' })
@Unique(['blockingUserId', 'blockedUserId'])
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  blockingUserId: string;

  @Column()
  blockedUserId: string;

  @ManyToOne(() => User, (user) => user.userId, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockingUserId' })
  blocking: User;

  @ManyToOne(() => User, (user) => user.userId, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockedUserId' })
  blocked: User;
}
