import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestWithUser } from 'src/providers/auth/types/requestWithUser';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const timeBeforeRouteHandle = Date.now();
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;

    const isAuthenticated = Boolean(request.user);
    const { user } = request;
    const userId = user?.id;

    this.logger.log(
      `[BEFORE] ${method} ${url} ${userAgent} ${ip}: ${
        context.getClass().name
      } ${context.getHandler().name}`,
    );

    this.logger.log(
      `${
        isAuthenticated ? '[Authenticated]' : '[Un-authenticated]'
      } - userId: ${userId}`,
    );

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
