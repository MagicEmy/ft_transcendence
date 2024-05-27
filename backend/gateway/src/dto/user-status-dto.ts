import { UserStatusEnum } from '../enum/kafka.enum';

export class UserStatusDto {
  userId: string;
  status: UserStatusEnum;
}
