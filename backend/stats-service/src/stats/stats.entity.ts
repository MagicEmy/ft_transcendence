import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Opponent } from './enum/opponent.enum';
import { User } from './user.entity';

@Entity()
@Unique(['user_id', 'opponent'])
export class Stats {
  @PrimaryGeneratedColumn()
  stats_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column()
  opponent: Opponent;

  @Column({ default: 0 })
  total_time_playing_days: number;

  @Column({ default: 0 })
  total_time_playing_miliseconds: number;

  @Column({ default: 0 })
  points_total: number;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @Column({ default: 0 })
  draws: number;

  @Column({ default: 0 })
  max_score: number;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
