import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse();

    const errorLog = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: error,
    };

    this.logger.error(errorLog);
    response.status(status).json(errorLog);
  }
}
