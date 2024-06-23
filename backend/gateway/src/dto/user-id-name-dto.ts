import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsString, IsUUID, Length } from 'class-validator';

export class UserIdNameDto {
  @ApiProperty({
    example: '1a5575b6-0738-4ce0-86bd-0b16f62b77d3',
    required: true,
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'Bella_Ridley',
    required: true,
  })
  @IsString()
  @Length(2, 15)
  @IsAlphanumeric()
  userName: string;
}
