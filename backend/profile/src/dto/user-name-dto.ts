import { ApiProperty } from '@nestjs/swagger';

export class UserNameDto {
  @ApiProperty({
    example: 'bblumenth',
    required: true,
  })
  userName: string;
}
