import { UserStatusEnum } from '../enum/kafka.enum';

export class StatusChangeDto {
  userId: string;
  oldStatus: UserStatusEnum;
  newStatus: UserStatusEnum;
}
