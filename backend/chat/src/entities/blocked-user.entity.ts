import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'blocked_users' })
@Unique(['blockingUserId', 'blockedUserId'])
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  blockingUserId: string;

  @Column()
  blockedUserId: string;
}
