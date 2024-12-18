import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FriendshipDto {
  @ApiProperty({
    example: '1a5575b6-0738-4ce0-86bd-0b16f62b77d3',
    required: true,
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: '43d0ea20-9866-4dab-b7eb-3b05a16537d5',
    required: true,
  })
  @IsUUID()
  friendId: string;
}
