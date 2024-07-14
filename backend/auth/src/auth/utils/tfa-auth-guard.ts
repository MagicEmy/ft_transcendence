import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { FoundException } from './found-exception';

@Injectable()
export class TfaAuthGuard extends AuthGuard('tfa') {
  private logger: Logger = new Logger(TfaAuthGuard.name);
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const activate = (await super.canActivate(context)) as boolean;
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
