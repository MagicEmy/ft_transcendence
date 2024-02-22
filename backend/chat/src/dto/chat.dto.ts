export interface UserDto {
    userId: string
    userName: string
    socketId: string
}

export interface RoomDto{
    roomName: string
    host: UserDto
    admins: UserDto[]
    users: UserDto[]
    banned: UserDto[]
    muteds: MutedDto[]
    exclusive: boolean
    password: string
}

export interface JoinRoomDto{
    roomName: string
    user: UserDto
    exclusive: boolean
    password: string
}

export interface toDoUserRoomDto{
    roomName: string
    user: UserDto
    toDoUser: UserDto
    timer: number
}


export interface MutedDto{
    userId: string
    unmutedTime: number

}

export interface ChatMessageDto{
    user: UserDto
    message: string
    roomName: string
}

export interface MessageDto {
    user: UserDto
    message: string
    roomName: string
}

export interface GetMessageDto {
    user: UserDto
    roomName: string
}