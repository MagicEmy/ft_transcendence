import { ApiProperty } from '@nestjs/swagger';
import { UserStatusEnum } from 'src/utils/kafka.enum';

export class StatusDto {
  @ApiProperty({
    example: 'CHAT_ONLINE|CHAT_OFFLINE|ONLINE|GAME|OFFLINE',
    required: true,
  })
  status: UserStatusEnum;
}
