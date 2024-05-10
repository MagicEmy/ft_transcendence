import { UserStatusEnum } from 'src/utils/user-status.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_status' })
export class UserStatus {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  user_id: string;

  @Column()
  status: UserStatusEnum;
}
