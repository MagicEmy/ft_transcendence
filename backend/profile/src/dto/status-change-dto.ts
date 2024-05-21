import { UserStatusEnum } from 'src/enums/kafka.enum';

export class StatusChangeDto {
  userId: string;
  oldStatus: UserStatusEnum;
  newStatus: UserStatusEnum;
}
