import { UserStatusEnum } from '../kafka.enum';

export class StatusChangeDto {
  userId: string;
  newStatus: UserStatusEnum;
}

export class UserIdNameLoginDto {
  userId: string;
  intraLogin: string;
  userName: string;
}

export class UserIdNameDto {
  userId: string;
  userName: string;
}
