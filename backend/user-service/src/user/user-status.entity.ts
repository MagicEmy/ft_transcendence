import { UserStatusEnum } from './enum/kafka.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_status' })
export class UserStatus {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column()
  status: UserStatusEnum;

  @OneToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
