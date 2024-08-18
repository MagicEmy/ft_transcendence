import { Injectable, Logger, Inject } from '@nestjs/common'
import { RoomUserManagementService } from './room-user-management.service'
import { RoomPermissionService } from './room-permission.service'
import { RoomModerationService } from './room-moderation.service'
import { ToDoUserRoomDto, ModerationType, ModerateResponseDto, RoomMessageDto} from '../dto/chat.dto'

@Injectable()
export class RoomRouterService {

    constructor(
        @Inject(RoomModerationService) private readonly roomModerationService: RoomModerationService,
        @Inject(RoomUserManagementService) private readonly roomUserManagementService: RoomUserManagementService,
    ) { }
    private logger = new Logger('RoomRouterService')

    async handleMute( payload: ToDoUserRoomDto): Promise<ModerateResponseDto> {
        const response = await this.roomModerationService.addUserToMuted(
            payload.roomName,
            payload.user.userId,
            payload.toDoUser,
            payload.timer,
        )
        const toDoUser_message: RoomMessageDto = {
            roomName: payload.roomName,
            message: `You have been muted for ${payload.timer} seconds`,
        }
        const moderationResponse: ModerateResponseDto = {
            success: response === 'Success',
            user_response: response === 'Success' ? 'muted' : response,
            toDoUser_message : toDoUser_message,
        }
        return moderationResponse
    }

    async handleUnmute(toDoUserRoomDto: ToDoUserRoomDto): Promise<ModerateResponseDto> {
        const response = await this.roomModerationService.removeUserFromMuted(
            toDoUserRoomDto.roomName,
            toDoUserRoomDto.user.userId,
            toDoUserRoomDto.toDoUser,
        )
        const toDoUser_message: RoomMessageDto = {
            roomName: toDoUserRoomDto.roomName,
            message: `You have been unmuted`,
        }
        const moderationResponse: ModerateResponseDto = {
            success: response === 'Success',
            user_response: response === 'Success' ? 'unmuted' : response,
            toDoUser_message : toDoUser_message,
        }
        return moderationResponse
    }

    async handleBan(toDoUserRoomDto: ToDoUserRoomDto): Promise<ModerateResponseDto> {
        const response = await this.roomModerationService.addUserToBanned(
            toDoUserRoomDto.roomName,
            toDoUserRoomDto.user.userId,
            toDoUserRoomDto.toDoUser,
        )
        const toDoUser_message: RoomMessageDto = {
            roomName: toDoUserRoomDto.roomName,
            message: `Banned`,
        }
        const moderationResponse: ModerateResponseDto = {
            success: response === 'success',
            user_response: response === 'success' ? 'banned' : response,
            toDoUser_message : toDoUser_message,
        }
        return moderationResponse
    }

    async handleUnban(toDoUserRoomDto: ToDoUserRoomDto): Promise<ModerateResponseDto> {
        const response = await this.roomModerationService.removeUserFromBanned(
            toDoUserRoomDto.roomName,
            toDoUserRoomDto.user.userId,
            toDoUserRoomDto.toDoUser,
        )
        const toDoUser_message: RoomMessageDto = {
            roomName: toDoUserRoomDto.roomName,
            message: '',
        }
        const moderationResponse: ModerateResponseDto = {
            success: response === 'Success',
            user_response: response === 'Success' ? 'unbanned' : response,
            toDoUser_message : toDoUser_message,
        }
        return moderationResponse
    }

    async handleAdd(toDoUserRoomDto: ToDoUserRoomDto): Promise<ModerateResponseDto> {
        const response = await this.roomUserManagementService.addUserToRoom(
            toDoUserRoomDto.roomName,
            toDoUserRoomDto.user.userId,
            toDoUserRoomDto.toDoUser,
        )
        const toDoUser_message: RoomMessageDto = {
            roomName: toDoUserRoomDto.roomName,
            message: `You have been added to the room`,
        }
        const moderationResponse: ModerateResponseDto = {
            success: response === 'Success',
            user_response: response === 'Success' ? 'added to the room' : response,
            toDoUser_message : toDoUser_message,
        }
        return moderationResponse
    }

    async handleKick(toDoUserRoomDto: ToDoUserRoomDto): Promise<ModerateResponseDto> {
        const response = await this.roomUserManagementService.kickUserFromRoom(
            toDoUserRoomDto.roomName,
            toDoUserRoomDto.user.userId,
            toDoUserRoomDto.toDoUser,
        )
        const toDoUser_message: RoomMessageDto = {
            roomName: toDoUserRoomDto.roomName,
            message: `Kicked`,
        }
        const moderationResponse: ModerateResponseDto = {
            success: response === 'Success',
            user_response: response === 'Success' ? 'kicked' : response,
            toDoUser_message : toDoUser_message,
        }
        return moderationResponse
    }

    async handleMakeAdmin(toDoUserRoomDto: ToDoUserRoomDto): Promise<ModerateResponseDto> {
        const response = await this.roomModerationService.makeUserAdmin(
            toDoUserRoomDto.roomName,
            toDoUserRoomDto.user.userId,
            toDoUserRoomDto.toDoUser,
        )
        const toDoUser_message: RoomMessageDto = {
            roomName: toDoUserRoomDto.roomName,
            message: `You have been made an admin`,
        }
        const moderationResponse: ModerateResponseDto = {
            success: response === 'Success',
            user_response: response === 'Success' ? 'made as admin' : response,
            toDoUser_message : toDoUser_message,
        }
        return moderationResponse
    }

    async handleRemoveAdmin(toDoUserRoomDto: ToDoUserRoomDto): Promise<ModerateResponseDto> {
        const response = await this.roomModerationService.removeUserFromAdmin(
            toDoUserRoomDto.roomName,
            toDoUserRoomDto.user.userId,
            toDoUserRoomDto.toDoUser,
        )
        const toDoUser_message: RoomMessageDto = {
            roomName: toDoUserRoomDto.roomName,
            message: `You have been removed as an admin`,
        }
        const moderationResponse: ModerateResponseDto = {
            success: response === 'Success',
            user_response: response === 'Success' ? 'removed as admin' : response,
            toDoUser_message : toDoUser_message,
        }
        return moderationResponse
    }


    private moderationHandlers = {
        [ModerationType.MUTE]: (payload: ToDoUserRoomDto) => this.handleMute(payload),
        [ModerationType.UNMUTE]: (payload: ToDoUserRoomDto) => this.handleUnmute(payload),
        [ModerationType.BAN]: (payload: ToDoUserRoomDto) => this.handleBan(payload),
        [ModerationType.UNBAN]: (payload: ToDoUserRoomDto) => this.handleUnban(payload),
        [ModerationType.ADD]: (payload: ToDoUserRoomDto) => this.handleAdd(payload),
        [ModerationType.KICK]: (payload: ToDoUserRoomDto) => this.handleKick(payload),
        [ModerationType.MAKEADMIN]: (payload: ToDoUserRoomDto) => this.handleMakeAdmin(payload),
        [ModerationType.REMOVEADMIN]: (payload: ToDoUserRoomDto) => this.handleRemoveAdmin(payload),
    };

    public async handleModeration(toDoUserRoomDto: ToDoUserRoomDto): Promise<ModerateResponseDto> {
        const handler = this.moderationHandlers[toDoUserRoomDto.type];
        if (!handler) {
            throw new Error(`No handler found for moderation type: ${toDoUserRoomDto.type}`);
        }
        return handler(toDoUserRoomDto);
    }

}