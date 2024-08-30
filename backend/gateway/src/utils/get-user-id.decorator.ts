import {
  BadRequestException,
  ExecutionContext,
  Logger,
  createParamDecorator,
} from '@nestjs/common';
import { JwtPayloadDto } from 'src/dto/jwt-payload-dto';

export function extractValueFromCookies(
  cookies: string,
  cookieName: string,
): string {
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
  const logger: Logger = new Logger(extractValueFromCookies.name);
  const cookies = context.switchToHttp().getRequest().get('cookie');
    let userId;
    try {
      userId = extractValueFromCookies(cookies, 'userId');
    } catch (error) {
      try {
        const token = extractValueFromCookies(cookies, 'Refresh');
        const base64Payload = token.split(".")[1];    
        const payloadBuffer = Buffer.from(base64Payload, "base64");
        const user: JwtPayloadDto = JSON.parse(payloadBuffer.toString()) as JwtPayloadDto;
        userId = user.sub;
      } catch (error) {
          logger.error(`User could not be identified`);
          return null;
      }
    }
    return userId;
  }
);
