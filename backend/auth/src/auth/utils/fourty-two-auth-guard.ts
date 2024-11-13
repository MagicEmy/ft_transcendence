import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FoundException } from './found-exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FourtyTwoAuthGuard extends AuthGuard('42') {
  private logger: Logger = new Logger(FourtyTwoAuthGuard.name);
  constructor(private readonly configService: ConfigService) {
	super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const activate = (await super.canActivate(context)) as boolean;
      const request = super.getRequest(context);
      await super.logIn(request);
      if (!activate) {
        const resp = context.switchToHttp().getResponse();
        resp.setHeader('location', `http://${this.configService.get('REACT_APP_HOST')}:3000/?status=forbidden`);
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
