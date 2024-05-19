import { ApiProperty } from '@nestjs/swagger';

export class UserIdNameDto {
  @ApiProperty({
    example: '1a5575b6-0738-4ce0-86bd-0b16f62b77d3',
    required: true,
  })
  userId: string;

  @ApiProperty({
    example: 'bblumenth',
    required: true,
  })
  userName: string;
}
