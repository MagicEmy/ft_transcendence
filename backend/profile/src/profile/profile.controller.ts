import { Controller, Get, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileDto } from './dto/profile-dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/:id')
  getProfileById(@Param('id') id: string): Promise<ProfileDto> {
    return this.profileService.getProfileById(id);
  }
}
