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
  async handleRedirect(@Req() req, @Res() res) {
    console.log('In handleRedirect()');
    console.log(req.user);
    // const { access_token, user_id } = await this.authService.login({
    const response = await this.authService.login({
      user_name: req.user.user_name,
      sub: req.user.user_id,
      intra_login: req.user.intra_login,
    });

    if (!response) {
      console.log('Bad payload, unauthorized user!');
      req.redirect(`http://localhost:3000/`);
      return;
    }

    // Send the access token in the response body (JSON format)
    res.json({ access_token: response.access_token });
    res.redirect('http://localhost:3000/dashboard');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}

//In this code, res.cookie() is used to set cookies with the names ‘access_token’ and ‘user_id’.
//The { httpOnly: true } option is used to create HTTP-only cookies, which cannot be accessed by client-side JavaScript.
//This provides an added layer of security against cross-site scripting (XSS) attacks.

/*
this is an example of what will be returned after authentication of a user:
{
	access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJlbWxpY2FtZSIsInN1YiI6IjcyZjljZDZiLTZjOTgtNDg3Zi05OTk1LWZiNTc0ZDAxMGExNSIsImludHJhX2xvZ2luIjoiZW1saWNhbWUiLCJpYXQiOjE3MTA0NDE1MDMsImV4cCI6MTcxMDQ0NTEwM30.Wa_qyRMRu2Jqdti3tCuSSFCSpbWqjJelX4cMIx6Eu3w"
	user_id: "72f9cd6b-6c98-487f-9995-fb574d010a15"
	user_name: "emlicame"
}
*/
