import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TfaAuthGuard extends AuthGuard('tfa') {}
