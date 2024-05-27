import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Opponent } from './enum/opponent.enum';

@Entity()
export class Stats {
  @PrimaryGeneratedColumn()
  stats_id: string;

  @Column()
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
}
