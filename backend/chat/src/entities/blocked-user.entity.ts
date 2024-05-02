import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blocked_users')
@Index(['blockingUserId', 'blockedUserId'], { unique: true })
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  blockingUserId: string;

  @Column()
  blockedUserId: string;
}
