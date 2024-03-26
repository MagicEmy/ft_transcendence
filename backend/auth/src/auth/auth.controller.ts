import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { FourtyTwoAuthGuard } from './utils/fourty-two-auth-guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './utils/jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(FourtyTwoAuthGuard)
  @Get('42/login')
  async handleLogin() {}

  @UseGuards(FourtyTwoAuthGuard)
  @Get('42/redirect')
  handleRedirect(@Req() req, @Res() res) {
    console.log('In handleRedirect()');
    console.log(req.user);
    this.authService.login({
      user_name: req.user.user_name,
      sub: req.user.user_id,
      intra_login: req.user.intra_login,
    });
    res.redirect('http://localhost:3000/dashboard');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
