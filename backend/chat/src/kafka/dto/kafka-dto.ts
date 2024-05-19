import { UserStatusEnum } from '../kafka.enum';

export class StatusChangeDto {
  userId: string;
  oldStatus: UserStatusEnum;
  newStatus: UserStatusEnum;
}

export class NewUserDto {
  user_id: string;
  intra_login: string;
  user_name: string;
}

export class UserNameDto {
  userId: string;
  userName: string;
}
