import { IsNotEmpty, IsString, IsBoolean, IsInt, IsEnum, IsUUID } from 'class-validator';
import { UserDto } from './chat.dto';

export enum GameInvitationtype {
    SEND = 'send',
    ACCEPT = 'accept',
    DECLINE = 'decline',
}
export class GameInvitationDto {
    @IsEnum(GameInvitationtype)
    @IsNotEmpty()
    type: GameInvitationtype;
    @IsNotEmpty()
    sender: UserDto;
    @IsNotEmpty()
    receiver: UserDto;
}