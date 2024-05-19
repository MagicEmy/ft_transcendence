import { UserStatusEnum } from 'src/utils/kafka.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_status' })
export class UserStatus {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column()
  status: UserStatusEnum;
}
