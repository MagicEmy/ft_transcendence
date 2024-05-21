import { ApiProperty } from '@nestjs/swagger';
import { UserStatusEnum } from 'src/utils/user-status.enum';

export class StatusDto {
  @ApiProperty({
    example: 'ONLINE|GAME|OFFLINE',
    required: true,
  })
  status: UserStatusEnum;
}
