import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameStatus } from './enum/kafka.enum';
import { User } from './user.entity';

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn()
  game_id?: string;

  @Column({ type: 'uuid' })
  player1_id: string;

  @Column({ type: 'uuid', nullable: true })
  player2_id: string;

  @Column()
  player1_score: number;

  @Column()
  player2_score: number;

  @Column()
  duration: number;

  @Column()
  status: GameStatus;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player1_id' })
  player1: User;

  @ManyToOne(() => User, (user) => user.user_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player2_id' })
  player2: User;
}
