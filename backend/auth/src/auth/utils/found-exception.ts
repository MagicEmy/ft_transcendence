import { HttpException, HttpStatus } from '@nestjs/common';

export class FoundException extends HttpException {
  constructor(message: string = 'Found') {
    super(message, HttpStatus.FOUND);
  }
}
