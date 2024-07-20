import { UserStatusEnum } from '../enum/kafka.enum';

export class StatusChangeDto {
  userId: string;
  newStatus: UserStatusEnum;
}
