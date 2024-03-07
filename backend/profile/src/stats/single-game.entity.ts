import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class SingleGame {
  @PrimaryColumn()
  game_id: string;

  @Column()
  player_id: string;

  @Column({ type: 'timestamptz' })
  game_start: Date;

  @Column({ type: 'timestamptz', nullable: true })
  game_end: Date;

  @Column()
  score: number;
}
