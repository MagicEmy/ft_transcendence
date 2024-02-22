import { Injectable } from '@nestjs/common';
import { MessageDto, MutedDto, RoomDto, UserDto } from '../dto/chat.dto'
import { User } from 'src/entities/user.entity';
import { Room } from 'src/entities/room.entity';
import { UserService } from '../user/user.service';
import { Message } from 'src/entities/message.entity';


@Injectable()
export class RoomService {
    constructor(private userService: UserService) {}

    private rooms: Room[] = []



// methods that menage rooms
    async addRoom (
        roomName: Room['roomName'], host: UserDto['userId'],
        exclusive: boolean, password: string
        ): Promise<void> {
        const hostUser = await this.userService.getUserById(host)
        if (hostUser === 'Not Existing')
            throw new Error("the Host is not an User");
            
        const room = await this.getRoomIndexByName(roomName);
        if (room === -1) {
            await this.rooms.push( {roomName, host : hostUser, admins: [hostUser],
                                    users: [hostUser], banned: null, muteds: null, exclusive, password, messages: [] });
        }
    }
    async getRooms(): Promise<Room[]>{
        return this.rooms;
    }

    async getRoomByName(roomName: Room['roomName']): Promise<Room | 'Not Existing'> {
        const findRoom = this.rooms.find((room) => room.roomName === roomName)
        if (!findRoom) {
            return 'Not Existing';
        }
        return findRoom;
    }

    async getRoomIndexByName(roomName: Room['roomName']): Promise<number>{
        const roomIndex = this.rooms.findIndex((room) => room.roomName === roomName);
        return roomIndex;
    }

    async getRoomHost (roomName: Room['roomName']): Promise<User>{
        const roomIndex = await this.getRoomIndexByName(roomName);
        return this.rooms[roomIndex].host;
    }

    
    async removeRoom( roomName: Room['roomName']): Promise<void> {
        const room = await this.getRoomIndexByName(roomName)
        if (room === -1) {
            throw 'The room does not exist';
        }
        this.rooms.splice(room, 1);
    }

//  method that menage messages

    async broadcastMessage(roomName: string, userId: UserDto['userId'], message: MessageDto): Promise <Message | false> {
        const roomIndex = await this.getRoomIndexByName(roomName)
        const user = await this.userService.getUserById(userId);
        if (user === "Not Existing")
            throw "User does not exist";
        const isMuted = this.isMuted(roomIndex, user);
        if (isMuted)
            return false;
        return await this.addMessageToRoom (roomIndex, user, message);

    }

    async addMessageToRoom (roomIndex: number, user: User, messageDto: MessageDto): Promise <Message>
    {
        const message : Message = { user, message: messageDto.message, roomName: messageDto.roomName, timesent: Date.now()}
        
        await this.rooms[roomIndex].messages.push(message);
        const numberOfMessage = this.rooms[roomIndex].messages.length;
        if ( numberOfMessage > 20)
        this.rooms[roomIndex].messages.splice(0, numberOfMessage - 20);
        return message;
    }

    async getAllMessages (user: UserDto['userId'], roomName: string): Promise<Message[]>
    {   
        const roomIndex = await this.getRoomIndexByName(roomName);
        if (roomIndex === -1) {
            throw 'Not Existing Room';
        }
        const newUser = await this.userService.getUserById(user);
        if (newUser === 'Not Existing')
            throw 'Not Existing user';
        const userList = this.rooms[roomIndex].users;
        if (userList.find(users => users.userId === user))
            throw 'Not Room User';
        return this.rooms[roomIndex].messages;
    }


//  method that menage users

    async isBanned (roomIndex: number, userId: UserDto['userId']): Promise<boolean>{
        const bannedList = this.rooms[roomIndex].banned
        if (bannedList.find(ban => ban.userId === userId))
            return true;
        return false;
    }

    async isAdmin (roomIndex: number, userId: UserDto['userId']): Promise<boolean>{
        const adminList = this.rooms[roomIndex].admins
        if (adminList.find(admin => admin.userId === userId))
            return true;
        return false;
    }

    async isMuted (roomIndex: number, user: User): Promise<boolean>{
        const mutedList = this.rooms[roomIndex].muteds;
        const muted = mutedList.find(muted => muted.userId === user.userId);
        if (muted)
        {    
            const now = Date.now()
            if (now > muted.unmutedTime)
            {
                await this.rooms[roomIndex].banned.filter((user) => user.userId !== muted.userId);
                return false;
            }
            return true;
        }
        return false;
    }

    async addUserToRoom(roomName: string, userId: UserDto['userId'], exclusive: boolean, password: string): Promise<void> {
        const roomIndex = await this.getRoomIndexByName(roomName);
        const newUser = await this.userService.getUserById(userId);
        if (newUser === 'Not Existing'){
            throw 'The user do not exist and cannot be added to the room';
        }
        if (this.isBanned(roomIndex, userId)){
            throw 'The user is banned';
        }
        if (roomIndex !== -1){
            if (this.rooms[roomIndex].password !== password ){
                throw 'User Not Authorized';
            }
            this.rooms[roomIndex].users.push(newUser)
            const host = await this.getRoomHost(roomName);
            if(host.userId === newUser.userId){
                this.rooms[roomIndex].host.socketId = newUser.socketId;
            }
        } else {
            await this.addRoom(roomName, newUser.userId, exclusive, password);
        }
    }

    async addUserToBanned(roomName: Room['roomName'], user: UserDto['userId'], toBan: UserDto['userId']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'The room does not exist';
        }
        const banUser = await this.userService.getUserById(toBan)
        if (banUser === 'Not Existing')
            throw 'not existing user';
        if (await this.isAdmin(roomIndex, user))
        {
            if( await this.isBanned(roomIndex, banUser.userId))
            throw 'The User is already banned';
            
            const host = await this.getRoomHost(roomName);
            if (host.userId === toBan)
                throw 'User Not Authorized';
            await this.rooms[roomIndex].banned.push(banUser);
            this.kickUserFromRoom(roomName, user, toBan);
        }
        else
            throw 'User Not Authorized';
    }

    async addUserToMuted(roomName: Room['roomName'], user: UserDto['userId'], toMute: UserDto['userId'], timer: number): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'The room does not exist';
        }
        const muteUser = await this.userService.getUserById(toMute)
        if (muteUser === 'Not Existing')
            throw 'not existing user';
        if (await this.isAdmin(roomIndex, user))
        {
            const host = await this.getRoomHost(roomName);
            if (host.userId === toMute)
                throw 'User Not Authorized';
            if( await this.isMuted(roomIndex, muteUser))
                throw 'The User is already muted';
            const timeEnd = (Date.now() / 1000) + timer;
            const mute : MutedDto =  {userId: toMute, unmutedTime: timeEnd};
            await this.rooms[roomIndex].muteds.push(mute);
        }
    }

    async removeUserFromBanned(roomName: Room['roomName'], user: UserDto['userId'], toUnban: UserDto['userId']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'The room does not exist';
        }
        const toUnbanUser = await this.userService.getUserById(toUnban)
        if (toUnbanUser === 'Not Existing')
            throw 'Not existing user';
        if (await this.isAdmin(roomIndex, user))
        {
            if( await this.isBanned(roomIndex, toUnbanUser.userId) != true)
                throw 'The User is not banned';
            
            await this.rooms[roomIndex].banned.filter((user) => user.userId !== toUnbanUser.userId);
        }
        else
            throw 'User Not Authorized';
    }

    async removeUserFromMuted(roomName: Room['roomName'], user: UserDto['userId'], toUnmute: UserDto['userId']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'The room does not exist';
        }
        const toUnmuteUser = await this.userService.getUserById(toUnmute)
        if (toUnmuteUser === 'Not Existing')
            throw 'Not existing user';
        if (await this.isAdmin(roomIndex, user))
        {
            if( await this.isBanned(roomIndex, toUnmuteUser.userId) != true)
                throw 'The User is not muted';
        
            await this.rooms[roomIndex].banned.filter((user) => user.userId !== toUnmuteUser.userId);
        }
        else
            throw 'User Not Authorized';
    }

    async removeUserFromRoom(socketId: User['socketId'], roomName: Room['roomName']): Promise<void>{
        const room = await this.getRoomIndexByName(roomName);
        this.rooms[room].users = this.rooms[room].users.filter((user) => user.socketId !== socketId);
        if (this.rooms[room].users.length == 0)
            await this.removeRoom(roomName);
    }

    
    async kickUserFromRoom(roomName: Room['roomName'], user: UserDto['userId'], toKick: UserDto['userId'])
    {
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'The room does not exist';
        }
        const tokick = await this.userService.getUserById(toKick)
        if (tokick === 'Not Existing')
            throw 'Not existing user';
        if (await this.isAdmin(roomIndex, user))
        {
            const hostName = await this.getRoomHost(roomName);
            if (hostName.userId === tokick.userId)
                throw 'User Not Authorized';
            await this.rooms[roomIndex].users.filter((user) => user.userId !== tokick.userId);
        }
        else
            throw 'User Not Authorized';
    }

    async removeUserFromAllRoom(socketId: User['socketId']): Promise<void> {
        const rooms = await this.getRoomByUserSocketId(socketId);
        for (const room of rooms) {
           await this.removeUserFromRoom(socketId, room.roomName);
        }
    }

    async getRoomByUserSocketId(socketId: User['socketId']): Promise<Room[]> {
        const filteredRooms= this.rooms.filter((room) => {
            const found = room.users.find(user => user.socketId === socketId);
            if (found) {
                return found;
            }
        });
        return filteredRooms;
    }

}


