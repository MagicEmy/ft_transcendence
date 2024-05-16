import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tokens' })
export class Token {
  @PrimaryColumn({ unique: true })
  user_id: string;

  @Column({ nullable: true })
  refresh_token: string;
}
