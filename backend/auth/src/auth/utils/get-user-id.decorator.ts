import {
  BadRequestException,
  ExecutionContext,
  Logger,
  createParamDecorator,
} from '@nestjs/common';

export function extractUserIdFromCookies(
  cookies: string,
  cookieName: string,
): string {
  const logger: Logger = new Logger(extractUserIdFromCookies.name);
  if (cookies) {
    for (const cookie of cookies.toString().split(';')) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        return value;
      }
    }
  }
  logger.error(`No userId found in cookie ${cookies}`);
  throw new BadRequestException(`No userId found in cookies`);
}

export const GetUserId = createParamDecorator(
  async (data: unknown, context: ExecutionContext): Promise<string> => {
    const cookies = context.switchToHttp().getRequest().get('cookie');
    return extractUserIdFromCookies(cookies, 'userId');
  },
);
