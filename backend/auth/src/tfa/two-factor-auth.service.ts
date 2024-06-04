import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';


@Injectable()
export class TwoFactorAuthService {
    constructor(
        private readonly usersService: UserService,
    ) { }


    async generateTwoFactorAuthenticationSecret(userId: string) {
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(userId, 'OUR_APP_NAME', secret);
        this.usersService.addTwoFactorAuthentication(userId, secret);

        return otpAuthUrl;
    }

    async generateQrCodeDataURL(otpAuthUrl: string) {
        return toDataURL(otpAuthUrl);
    }

    async isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, userId: string) {
        return authenticator.verify({
        token: twoFactorAuthenticationCode,
        secret: await this.usersService.getTwoFactorAuthenticationSecret(userId),
        });
    }
    async disableTwoFactorAuthentication(userId: string) {
        await this.usersService.disableTwoFactorAuthentication(userId);
    }

}