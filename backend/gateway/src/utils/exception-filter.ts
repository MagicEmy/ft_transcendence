import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    console.log('RpcToHttp filter triggered');
	console.log('exception is', exception);
    const error: any = exception.getError();
    const response = host.switchToHttp().getResponse();
    response.status(error?.statusCode || error?.status || 500).json(error);
  }
}
