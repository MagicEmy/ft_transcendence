import { MutedDto, RoomDto} from "src/dto/chat.dto";
import { User } from "./user.entity";
import { Message } from "./message.entity";

export class Room implements RoomDto{
    constructor(attrs: RoomDto) {
        Object.assign(this, attrs);
      }
      roomName: string
      host: User
      admins: User[]
      users: User[]
      banned: User[]
      muteds: MutedDto[]
      exclusive: boolean
      password: string
      direct: boolean
      messages: Message[]
}
    
