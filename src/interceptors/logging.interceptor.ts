import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestService } from 'src/request.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private requestService: RequestService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;
    const userId = this.requestService.getUserId();

    this.logger.log(
      `[BEFORE] ${method} ${url} ${userAgent} ${ip}: ${
        context.getClass().name
      } ${context.getHandler().name}`,
    );

    this.logger.log(
      `${userId ? 'Authenticated' : 'Un-authenticated'} userId: ${userId}`,
    );

    const timeBeforeRouteHandle = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const contentLength = response.get('content-length');
        const responseTime = timeBeforeRouteHandle - Date.now();

        this.logger.log(
          `[AFTER] ${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}: ${responseTime}ms`,
        );
      }),
    );
  }
}
