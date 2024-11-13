import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'avatars' })
export class Avatar {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'bytea' })
  avatar: Buffer;

  @Column()
  mime_type: string;

  @OneToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
