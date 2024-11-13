import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  private logger: Logger = new Logger(RpcToHttpExceptionFilter.name);
  catch(exception: RpcException, host: ArgumentsHost) {
    // this.logger.debug(`Exception caught: `, exception);
    const error: any = exception.getError();
    const response = host.switchToHttp().getResponse();
    response
      .status(
        error?.statusCode ||
          error?.status ||
          error.toString().includes('ENOTFOUND')
          ? 404
          : 500,
      )
      .json(error);
  }
}
