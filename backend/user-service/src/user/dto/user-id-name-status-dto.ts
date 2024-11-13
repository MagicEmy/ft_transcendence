import { UserStatusEnum } from '../enum/kafka.enum';

export class UserIdNameStatusDto {
  userId: string;
  userName: string;
  status: UserStatusEnum;
}
