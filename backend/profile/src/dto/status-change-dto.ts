import { UserStatusEnum } from 'src/utils/kafka.enum';

export class StatusChangeDto {
  userId: string;
  oldStatus: UserStatusEnum;
  newStatus: UserStatusEnum;
}
