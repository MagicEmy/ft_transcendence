import { UserStatusEnum } from 'src/enums/kafka.enum';

export class UserStatusDto {
  user_id: string;
  status: UserStatusEnum;
}
