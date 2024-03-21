import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameStatus } from './game-status.enum';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  game_id?: string;

  @Column()
  player1_id: string;

  @Column()
  player2_id: string;

  @Column()
  player1_score: number;

  @Column()
  player2_score: number;

  @Column()
  duration: number;

  @Column()
  status: GameStatus;
}
