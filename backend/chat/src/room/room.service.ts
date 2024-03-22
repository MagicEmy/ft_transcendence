import { Injectable } from '@nestjs/common';
import { CreateRoomDto, MessageDto, MutedDto, RoomDto, UserDto } from '../dto/chat.dto'
import { User } from 'src/entities/user.entity';
import { Room } from 'src/entities/room.entity';
import { UserService } from '../user/user.service';
import { Message } from 'src/entities/message.entity';
import { Logger } from "@nestjs/common";

@Injectable()
export class RoomService {
    constructor(private userService: UserService) {}

    private rooms: Room[] = [];
    private logger = new Logger('RoomService');


// methods that menage rooms
    async addRoom ( {user: host, roomName, exclusive, password }: CreateRoomDto
        ): Promise<void> {
        const hostUser = await this.userService.getUserById(host.userId)
        if (hostUser === 'Not Existing')
            throw "Not Existing User";
            
        const room = await this.getRoomIndexByName(roomName);
        if (room === -1) {
            await this.rooms.push( {roomName: roomName, host : hostUser, admins: [hostUser],
                                    users: [hostUser], banned: [], muteds: [], exclusive, password, messages: [] });
        }
        else
            throw "Already Existing Room";
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
            throw 'Not Existing Room';
        }
        this.rooms.splice(room, 1);
    }

  

//  method that menage messages

    async broadcastMessage(payload: MessageDto): Promise <Message | false> {
        const roomIndex = await this.getRoomIndexByName(payload.roomName)
        if (roomIndex === -1){
            this.logger.log(`${payload.roomName} does not exist`)
            return false;
        }
        const user = await this.userService.getUserById(payload.user.userId);
        if (user === "Not Existing")
            throw "Not Existing User";
        if (!await this.isUser(roomIndex, user.userId )){
            this.logger.log(`${user.userId} is not a user of the chat`);
            return false;
        }
        const isMuted = await this.isMuted(roomIndex, user);
        if (isMuted){
            this.logger.log(`${user.userId} is muted`);
            return false;
        }   
        return await this.addMessageToRoom(roomIndex, user, payload);

    }

    async addMessageToRoom (roomIndex: number, user: User, messageDto: MessageDto): Promise <Message>
    {
        const message : Message = { user, message: messageDto.message, roomName: messageDto.roomName, timesent: Date()};
        
        this.rooms[roomIndex].messages.push(message);
        const numberOfMessage = this.rooms[roomIndex].messages.length;
        if ( numberOfMessage > 20)
        this.rooms[roomIndex].messages.splice(0, numberOfMessage - 20);
        console.log(message);
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
            throw 'Not Existing User';
        const userList = this.rooms[roomIndex].users;
        if (userList.find(users => users.userId === user))
            throw 'Not Room User';
        return this.rooms[roomIndex].messages;
    }


//  method that menage users

    async isBanned (roomIndex: number, userId: UserDto['userId']): Promise<boolean>{
        const bannedList = this.rooms[roomIndex].banned;
        if( bannedList.length === 0)
            return false;
        const banned = bannedList.find(ban => ban.userId === userId)
        console.log(banned);
        if (banned === undefined)
            return false;
        return true; 
    }


    async isAdmin (roomIndex: number, userId: UserDto['userId']): Promise<boolean>{
        const adminList = this.rooms[roomIndex].admins;
        if (adminList.length === 0)
            return false;
        const admin = adminList.find(admin => admin.userId === userId)
        if (admin !== undefined)
            return true;
        return false;
    }

    async isMuted (roomIndex: number, user: User): Promise<boolean>{
        const mutedList = this.rooms[roomIndex].muteds;
        if (mutedList.length === 0)
            return false;
        const muted = mutedList.find(muted => muted.userId === user.userId);
        if (muted !== undefined)
        {    
            const now = Date.now()
            if (now / 1000 > muted.unmutedTime)
            {
                await this.rooms[roomIndex].banned.filter((user) => user.userId !== muted.userId);
                return false;
            }
            return true;
        }
        return false;
    }

    async isUser (roomIndex: number, userId: UserDto['userId']): Promise<boolean>{
        const userList = this.rooms[roomIndex].users;
        const member = userList.find(admin => admin.userId === userId)
        if (member === undefined)
            return false;
        return true;
    }

    async addUserToRoom(roomName: RoomDto['roomName'], userId: UserDto['userId'], password: string): Promise<void> {
        const newUser = await this.userService.getUserById(userId);
        if (newUser === 'Not Existing'){
            throw 'Not Existing User';
        }

        const roomIndex = await this.getRoomIndexByName(roomName);
        if (roomIndex !== -1){
            if (await this.isBanned(roomIndex, userId)){
                throw 'Banned User';
            }
            if (this.rooms[roomIndex].password !== password ){
                throw 'Not Authorized User';
            }
            if (this.rooms[roomIndex].exclusive && !this.isUser(roomIndex, userId)){
                throw 'Not Authorized User';
            }
            this.rooms[roomIndex].users.push(newUser)
            const host = await this.getRoomHost(roomName);
            if(host.userId === newUser.userId){
                this.rooms[roomIndex].host.socketId = newUser.socketId;
            }
        }
        else
            throw 'Not existing Room';
    }


    async addUserToBanned(roomName: Room['roomName'], user: UserDto['userId'], toBan: UserDto['userId']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'Not Existing Room';
        }
        const banUser = await this.userService.getUserById(toBan)
        if (banUser === 'Not Existing')
            throw 'Not Existing user';
        if (await this.isAdmin(roomIndex, user))
        {
            if( await this.isBanned(roomIndex, banUser.userId))
            throw 'Already Banned User';
            
            const host = await this.getRoomHost(roomName);
            if (host.userId === toBan)
                throw 'Not Authorized User';
            this.rooms[roomIndex].banned.push(banUser);
            if (await this.isAdmin(roomIndex, toBan)){
                this.removeUserFromAdmin(roomName, user, toBan);
            }
            await this.kickUserFromRoom(roomName, user, toBan);
        }
        else
            throw 'Not Authorized User';
    }

    async addUserToUser(roomName: Room['roomName'], user: UserDto['userId'], toExclusive: UserDto['userId']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'Not Existing Room';
        }
        const exclusiveUser = await this.userService.getUserById(toExclusive)
        if (exclusiveUser === 'Not Existing')
            throw 'Not Existing User';
        if (await this.isAdmin(roomIndex, user))
        {
            if( await this.isBanned(roomIndex, exclusiveUser.userId))
                throw 'Banned User';
            if (await this.isUser(roomIndex, exclusiveUser.userId))
                throw 'Already User';
            await this.rooms[roomIndex].users.push(exclusiveUser);
        }
        else
            throw 'Not Authorized User';
    }

    async addUserToAdmin(roomName: Room['roomName'], user: UserDto['userId'], toAdmin: UserDto['userId']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'Not Existing Room';
        }
        const adminUser = await this.userService.getUserById(toAdmin);
        if (adminUser === 'Not Existing')
            throw 'Not Existing User';
        if (await this.isAdmin(roomIndex, user))
        {
            if( await this.isBanned(roomIndex, adminUser.userId))
                throw 'Banned User';
            if (await this.isAdmin(roomIndex, adminUser.userId))
                throw 'Already Admin User';
            this.rooms[roomIndex].admins.push(adminUser);
        }
        else
            throw 'Not Authorized User';
    }

    async addUserToMuted(roomName: Room['roomName'], user: UserDto['userId'], toMute: UserDto['userId'], timer: number): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'Not Existin Room';
        }
        const muteUser = await this.userService.getUserById(toMute)
        if (muteUser === 'Not Existing')
            throw 'Not Existing User';
        if (await this.isAdmin(roomIndex, user))
        {
            const host = await this.getRoomHost(roomName);
            if (host.userId === toMute)
                throw 'Not Authorized User';
            if( await this.isMuted(roomIndex, muteUser))
                throw 'Already Muted User';
            const timeEnd = (Date.now() / 1000) + timer;
            const mute : MutedDto =  {userId: toMute, unmutedTime: timeEnd};
            await this.rooms[roomIndex].muteds.push(mute);
        }
    }

    async removeUserFromBanned(roomName: Room['roomName'], user: UserDto['userId'], toUnban: UserDto['userId']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName)
        if (roomIndex === -1) {
            throw 'Not Existing Room';
        }
        const toUnbanUser = await this.userService.getUserById(toUnban)
        if (toUnbanUser === 'Not Existing')
            throw 'Not Existing User';
        if (await this.isAdmin(roomIndex, user))
        {
            if( await this.isBanned(roomIndex, toUnbanUser.userId) != true)
                throw 'Not Banned User';
            
            await this.rooms[roomIndex].banned.filter((user) => user.userId !== toUnbanUser.userId);
        }
        else
            throw 'Not Authorized User';
    }

    async removeUserFromMuted(roomName: Room['roomName'], user: UserDto['userId'], toUnmute: UserDto['userId']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName);
        if (roomIndex === -1) {
            throw 'Not Existing Room';
        }
        const toUnmuteUser = await this.userService.getUserById(toUnmute);
        if (toUnmuteUser === 'Not Existing')
            throw 'Not Existing User';
        if (await this.isAdmin(roomIndex, user))
        {
            if( await this.isBanned(roomIndex, toUnmuteUser.userId) != true)
                throw 'Not Muted User';
        
            await this.rooms[roomIndex].banned.filter((user) => user.userId !== toUnmuteUser.userId);
        }
        else
            throw 'Not Authorized User';
    }

    async removeUserFromAdmin(roomName: Room['roomName'], user: UserDto['userId'], toUnadmin: UserDto['userId']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName);
        if (roomIndex === -1) {
            throw 'Not Existing Room';
        }
        const toUnadminUser = await this.userService.getUserById(toUnadmin);
        if (toUnadminUser === 'Not Existing')
            throw 'Not Existing User';
        if ((await this.getRoomHost(roomName)).userId == user)
        {
            if( await this.isAdmin(roomIndex, toUnadminUser.userId) != true)
                throw 'Not Admin User';
        
            await this.rooms[roomIndex].admins.filter((user) => user.userId !== toUnadminUser.userId);
        }
        else
            throw 'Not Authorized User';
    }


    async removeUserFromRoom(userId: User['userId'], roomName: Room['roomName']): Promise<void>{
        const roomIndex = await this.getRoomIndexByName(roomName);
        if (roomIndex === -1)
            throw 'Not Existing Room';
        this.rooms[roomIndex].users = this.rooms[roomIndex].users.filter((user) => user.userId !== userId);
        this.rooms[roomIndex].admins = this.rooms[roomIndex].admins.filter((user) => user.userId !== userId);
        if (this.rooms[roomIndex].host.userId == userId){
            if (this.rooms[roomIndex].admins && this.rooms[roomIndex].admins.length !== 0 ){
                this.rooms[roomIndex].host = this.rooms[roomIndex].admins[0];
            }else if(this.rooms[roomIndex].users && this.rooms[roomIndex].users.length !== 0 ){
                this.rooms[roomIndex].host = this.rooms[roomIndex].users[0];
                this.rooms[roomIndex].admins.push(this.rooms[roomIndex].users[0]);
            }
        }
        if (!this.rooms[roomIndex].users || this.rooms[roomIndex].users.length === 0)
            await this.removeRoom(roomName);
    }

    
    async kickUserFromRoom(roomName: Room['roomName'], user: UserDto['userId'], toKick: UserDto['userId'])
    {
        const roomIndex = await this.getRoomIndexByName(roomName);
        if (roomIndex === -1) {
            throw 'Not Existing Room';
        }
        const tokick = await this.userService.getUserById(toKick);
        if (tokick === 'Not Existing')
            throw 'Not Existing User';
        if (await this.isAdmin(roomIndex, user))
        {
            const hostName = await this.getRoomHost(roomName);
            if (hostName.userId === tokick.userId)
                throw 'Not Authorized User';
            await this.removeUserFromRoom(tokick.userId, roomName);
        }
        else
            throw 'Not Authorized User';
    }

    // async removeUserFromAllRoom(socketId: User['socketId']): Promise<void> {
    //     const rooms = await this.getRoomByUserSocketId(socketId);
    //     for (const room of rooms) {
    //        await this.removeUserFromRoom(socketId, room.roomName);
    //     }
    // }

    async getRoomByUserSocketId(socketId: User['socketId']): Promise<Room[]> {
        const filteredRooms= this.rooms.filter((room) => {
            const found = room.users.find(user => user.socketId === socketId);
            if (found) {
                return found;
            }
        });
        return filteredRooms;
    }


    //automatically reconnect to old chat
    async getRoomWithUserByUserID(userId: UserDto['userId']): Promise<string[]>{
        const roomList = this.rooms;
        const userRooms : string[] = [];
        roomList.forEach(element => {
            if (element.users.find(user => user.userId === userId) !== undefined)
                userRooms.push(element.roomName);
            else if (element.host.userId === userId)
                userRooms.push(element.roomName);
        });
        return userRooms;
    }

}

