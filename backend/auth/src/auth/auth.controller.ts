import { Controller, Get, UseGuards } from '@nestjs/common';
import { FourtyTwoAuthGuard } from './utils/fourty-two-auth-guard';

@Controller('auth')
export class AuthController {
  @Get('42/login')
  @UseGuards(FourtyTwoAuthGuard)
  handleLogin() {
    return { msg: '42 authentication' };
  }

  @Get('42/redirect')
  @UseGuards(FourtyTwoAuthGuard)
  handleRedirect() {
    console.log('In handleRedirect()');
    return { msg: 'Redirected!' };
  }
}
