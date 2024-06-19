import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tfa' })
export class Tfa {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ nullable: true })
  secret: string;

  @Column()
  is_enabled: boolean;

  @Column({ nullable: true })
  qr_code: string;

  @OneToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
