import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class DoubleGame {
  @PrimaryColumn()
  game_id: string;

  @Column()
  left_player_id: string;

  @Column()
  right_player_id: string;

  @Column({ type: 'timestamptz' })
  game_start: Date;

  @Column({ type: 'timestamptz', nullable: true })
  game_end: Date;

  @Column()
  left_score: number;

  @Column()
  right_score: number;
}
