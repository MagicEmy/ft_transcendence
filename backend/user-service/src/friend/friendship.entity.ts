import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'friendships' })
@Unique(['user_id', 'friend_id'])
export class Friendship {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  user_id: string;

  @Column()
  friend_id: string;
}
