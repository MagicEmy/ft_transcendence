import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FoundException } from './found-exception';

@Injectable()
export class FourtyTwoAuthGuard extends AuthGuard('42') {
  async canActivate(context: ExecutionContext) {
    try {
      const activate = (await super.canActivate(context)) as boolean;
      const request = super.getRequest(context);
      await super.logIn(request);
      if (!activate) {
        const resp = context.switchToHttp().getResponse();
        resp.setHeader('location', 'http://localhost:3000/?status=forbidden');
        console.log('just set the header', resp.header);
        throw new FoundException('Redirecting you to login...');
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
