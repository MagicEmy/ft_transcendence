import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FoundException } from './found-exception';

@Injectable()
export class FourtyTwoAuthGuard extends AuthGuard('42') {
  private logger: Logger = new Logger(FourtyTwoAuthGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const activate = (await super.canActivate(context)) as boolean;
      const request = super.getRequest(context);
      await super.logIn(request);
      if (!activate) {
        const resp = context.switchToHttp().getResponse();
        resp.setHeader('location', 'http://localhost:3000/?status=forbidden');
        throw new FoundException('Redirecting you to login...');
      } else {
        return true;
      }
    } catch (error) {
      this.logger.error(`Unknown error occurred`);
      return false;
    }
  }
}
