import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';

export function extractUserIdFromCookies(
  cookies: string,
  cookieName: string,
): string {
  console.log(
    `in extractUserIdFromCookies, cookies is ${cookies} and name ${cookieName}`,
  );
  if (cookies) {
    for (const cookie of cookies.toString().split(';')) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        return value;
      }
    }
  }
  throw new BadRequestException(`No userId found in cookies`);
}

export const GetUserId = createParamDecorator(
  async (data: unknown, context: ExecutionContext): Promise<string> => {
    const cookies = context.switchToHttp().getRequest().get('cookie');
    return extractUserIdFromCookies(cookies, 'userId');
  },
);
