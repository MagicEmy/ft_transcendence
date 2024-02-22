import { Controller, Get, Param } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room } from 'src/entities/room.entity';

@Controller()
export class RoomController {
    constructor(private roomService: RoomService) {}

    @Get('api/room')
    async getAllRooms(): Promise<Room[]> {
        return await this.roomService.getRooms()
    }

    @Get('api/room/:room')
    async getRoom(@Param() params): Promise<Room> {
        const rooms = await this.roomService.getRooms()
        const room =  await this.roomService.getRoomIndexByName(params.room)
        return rooms[room]
    }
    
}
