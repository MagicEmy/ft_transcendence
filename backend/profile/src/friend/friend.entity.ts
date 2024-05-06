import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'friends' })
export class Friend {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  user_id: string;

  @Column()
  friend_id: string;
}
