import { UserStatusEnum } from 'src/utils/user-status.enum';

export class UserStatusDto {
  user_id: string;
  status: UserStatusEnum;
}
