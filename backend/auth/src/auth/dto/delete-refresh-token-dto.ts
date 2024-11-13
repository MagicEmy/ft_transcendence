import { IsString, IsUUID, ValidateIf } from 'class-validator';

export class DeleteRefreshTokenDto {
  @ValidateIf((dto) => !dto.refreshToken || dto.userId)
  @IsUUID()
  userId?: string;

  @ValidateIf((dto) => dto.refreshToken || !dto.userId)
  @IsString()
  refreshToken?: string;
}
