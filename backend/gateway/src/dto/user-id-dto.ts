import { ApiProperty } from '@nestjs/swagger';

export class UserIdDto {
  @ApiProperty({
    example: '1a5575b6-0738-4ce0-86bd-0b16f62b77d3',
    required: true,
  })
  userId: string;
}
