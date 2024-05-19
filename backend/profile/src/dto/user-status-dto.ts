import { UserStatusEnum } from 'src/utils/kafka.enum';

export class UserStatusDto {
  user_id: string;
  status: UserStatusEnum;
}
