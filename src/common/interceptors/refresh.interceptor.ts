import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from 'src/providers/auth/auth.service';
import { RequestWithUser } from 'src/providers/auth/types/requestWithUser';
import { UsersService } from 'src/providers/users/users.service';

// this is where I want to set cookie headers based on passport.js
// giving me back a user in my request.
@Injectable()
export class RefreshInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RefreshInterceptor.name);
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const userId = request.user?.id;

    const { refresh_cookie, refresh_token } =
      await this.authService.getCookieWithJwtRefreshToken(userId);

    await this.userService.setRefreshToken(refresh_token, userId);
    response.setHeader('Set-Cookie', [refresh_cookie]);

    this.logger.debug('[Refresh] Interceptor...');

    return next.handle();
  }
}
