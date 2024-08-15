import { IsNotEmpty, IsString, IsBoolean, IsInt, IsEnum, IsUUID } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsUUID(4)
  userId: string;
  @IsNotEmpty()
  @IsString()
  userName: string;
}

export class CreateUserDto {
  userId: string;
  userName: string;
  socketId: string;
  online: boolean;
  game: string;
}

export class RoomDto {
  roomName: string;
  host: UserDto;
  admins: UserDto[];
  users: UserDto[];
  banned: UserDto[];
  muteds: MutedDto[];
  exclusive: boolean;
  password: string;
  direct: boolean;
}

export class DoWithUserDto {
  @IsNotEmpty()
  userCreator: UserDto;
  @IsNotEmpty()
  userReceiver: UserDto;
}

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  roomName: string;
  @IsNotEmpty()
  user: UserDto;
  @IsNotEmpty()
  @IsBoolean()
  exclusive: boolean;
  @IsString()
  password: string;
}

export class JoinRoomDto {
  @IsNotEmpty()
  @IsString()
  roomName: string;
  @IsNotEmpty()
  user: UserDto;
  @IsString()
  password: string;
}

export enum ModerationType {
  MUTE = 'mute',
  UNMUTE = 'unmute',
  BAN = 'ban',
  UNBAN = 'unban',
  ADD = 'add',
  KICK = 'kick',
  MAKEADMIN = 'makeadmin',
  REMOVEADMIN = 'removeadmin',
}

export class ToDoUserRoomDto {
  @IsNotEmpty()
  @IsString()
  roomName: string;
  @IsNotEmpty()
  @IsEnum(ModerationType)
  type: ModerationType
  @IsNotEmpty()
  user: UserDto;
  @IsNotEmpty()
  @IsUUID(4)
  toDoUser: string;
  @IsInt()
  @IsNotEmpty()
  timer: number;
}

export class MutedDto {
  userId: string;
  unmutedTime: number;
}

export class MessageDto {
  @IsNotEmpty()
  user: UserDto;
  @IsNotEmpty()
  @IsString()
  message: string;
  @IsNotEmpty()
  @IsString()
  roomName: string;
}

export class UserAndRoom {
  @IsNotEmpty()
  user: UserDto;
  @IsNotEmpty()
  @IsString()
  roomName: string;
}

export class UserShowDto {
  userId: string;
  userName: string;
  isMuted: boolean;
  isBanned: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  online: boolean;
  userBeenBlocked: string[];
}

export class ChatUserDto {
  userId: string;
  userName: string;
  userBeenBlocked: string[];
  online: boolean;
}

export class RoomUserDto {
  roomName: string;
  users: UserShowDto[];
}

export class RoomShowDto {
  roomName: string;
  password: boolean;
  exclusive: boolean;
  owner: string;
}

export class UpdateRoomDto {
  @IsNotEmpty()
  user: UserDto;
  @IsNotEmpty()
  @IsString()
  roomName: string;
  @IsBoolean()
  @IsNotEmpty()
  updatePassword: boolean;
  @IsString()
  newPassword: string;
  @IsBoolean()
  @IsNotEmpty()
  updateExclusive: boolean;
}

export class BlockedUserDto {
  blockingUserId: string;
  blockedUserId: string;
}

export class MessageUserDto {
  userId: string;
  userName: string;
  blockedUsers: string[];
  blockedBy: string[];
}
export class MessageRoomDto {
  roomName: string;
  message: string;
  timesent: Date;
  user: MessageUserDto;
}
export class RoomMessageDto {
  roomName: string;
  message: string;
}

export class ModerateResponseDto {
  success: boolean;
  user_response: string;
  toDoUser_message: RoomMessageDto;
}

