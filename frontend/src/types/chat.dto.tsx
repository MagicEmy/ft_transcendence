import { Socket } from "socket.io-client";

export interface UserDto {
    userId: string
    userName: string
}

export interface DoWithUserDto {
    userCreator: UserDto;
    userReceiver: UserDto;
  }
  

export interface CreateRoomDto{
    roomName: string
    user: UserDto
    exclusive: boolean
    exclusiveMember: string[]
    password: string
}

export interface JoinRoomDto{
    roomName: string
    user: UserDto
    password: string
}

export interface RoomDto{
    roomName: string
    password: boolean
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

export interface ToDoUserRoomDto{
    roomName: string
    user: UserDto
    type: ModerationType
    toDoUser: string
    timer: number
}
export class RoomMessageDto {
    roomName: string;
    message: string;
}


export interface MutedDto{
    userId: string
    unmutedTime: number

}

export interface MessageDto {
    user: UserDto
    message: string
    roomName: string
}

export interface UserOnlineDto {
    userId: string;
    userName: string;
    socketId: string;
    online: boolean;
    game: string;
    blockedUsers: string[];
    blockedBy: string[];

}

export interface MessageRecivedDto {
    user: UserOnlineDto;
    message: string;
    roomName: string;
    timesent: Date;
}

export interface LeaveRoomDto{
    user: UserDto
    roomName: string
}

export interface BlockedUserDto {
	blockingUserId: string;
	blockedUserId: string;
}

export interface UserShowDto {
    userId: string;
    userName: string;
    isMuted: boolean;
    isBanned: boolean;
    isAdmin: boolean;
    isOwner: boolean;
    online: boolean;
    userBeenBlocked: string[];
  }

export interface RoomUserDto {
    roomName: string;
    users: UserShowDto[];
}

export interface RoomShowDto {
    roomName: string;
    password: boolean;
    exclusive: boolean;
    owner: string;
  }

export interface UpdateRoomDto{
    user: UserDto;
    roomName: string;
    updatePassword: boolean;
    newPassword: string;
    updateExclusive: boolean;
}

export interface ChatUserDto {
    userId: string;
    userName: string;
    userBeenBlocked: string[];
    online: boolean;
}

export interface GameDto {
    type: string;
    user: UserDto;
}

export interface MessageUserDto {
    userId: string;
    userName: string;
    blockedUsers: string[];
    blockedBy: string[];
  }
  export interface MessageRoomDto {
    roomName: string;
    message: string;
    timesent: Date;
    user: MessageUserDto;
  }

  export interface KickDto {
    roomName: string;
    message: string;
  }

export interface ChatContextType {
    socket: Socket; 
    currentRoom: RoomDto | null; 
    setCurrentRoom: React.Dispatch<React.SetStateAction<RoomDto | null>>;
    members: ChatUserDto[]; 
    setMembers: React.Dispatch<React.SetStateAction<ChatUserDto[]>>;
    roomMembers: RoomUserDto;
    setRoomMembers: React.Dispatch<React.SetStateAction<RoomUserDto>>;
    messages: MessageRoomDto[];
    setMessages: React.Dispatch<React.SetStateAction<MessageRoomDto[]>>;
    directMsg: UserDto | null;
    setDirectMsg: React.Dispatch<React.SetStateAction<UserDto | null>>;
    rooms:  RoomShowDto[]; 
    setRooms: React.Dispatch<React.SetStateAction<RoomShowDto[]>>;
    myRooms:  RoomShowDto[]; 
    setMyRooms: React.Dispatch<React.SetStateAction<RoomShowDto[]>>;
}

export interface Notification{
    roomName: string;
    count: number;
}