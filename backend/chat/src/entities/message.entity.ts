import { MessageDto } from "src/dto/chat.dto";
import { User } from "./user.entity";


  
export class Message implements MessageDto {
    constructor(attrs: MessageDto) {
      Object.assign(this, attrs);
    }
    user: User;
    message: string;
    roomName: string;
    timesent: Date;
}