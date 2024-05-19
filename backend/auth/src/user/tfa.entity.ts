import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tfa' })
export class Tfa {
  @PrimaryColumn()
  user_id: string;

  @Column({ nullable: true })
  secret: string;

  @Column()
  is_enabled: boolean;
}
