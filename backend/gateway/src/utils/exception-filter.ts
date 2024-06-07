import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    console.log('RpcToHttp filter triggered');
    const error: any = exception.getError();
    const response = host.switchToHttp().getResponse();
    response.status(error.statusCode || error.status).json(error);
  }
}
