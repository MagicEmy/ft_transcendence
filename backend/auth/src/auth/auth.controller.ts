import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FourtyTwoAuthGuard } from './utils/fourty-two-auth-guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
  @UseGuards(FourtyTwoAuthGuard)
  @Get('42/login')
  async handleLogin(@Req() req) {
    console.log(`in handleLogin`);
    console.log(req);
    return this.authService.login(req.user);
  }

  @UseGuards(FourtyTwoAuthGuard)
  @Get('42/redirect')
  handleRedirect(@Req() req) {
    console.log('In handleRedirect()');
    console.log(req);
    return { msg: 'Redirected!' };
  }
}
