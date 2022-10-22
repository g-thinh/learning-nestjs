import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from 'src/providers/auth/auth.service';
import { RequestWithUser } from 'src/providers/auth/types/requestWithUser';
import { UsersService } from 'src/providers/users/users.service';

/**
 * Interceptor for removing authentication related cookies in the request header.
 *
 * @remarks
 * Calls the `logout()` method to delete the `user` object in the request. Learn more {@Link https://www.passportjs.org/concepts/authentication/logout/ here}.
 *
 */
@Injectable()
export class LogoutInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LogoutInterceptor.name);
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

    const logout_cookie = this.authService.getCookiesForLogOut();

    await this.userService.removeRefreshToken(userId);
    response.setHeader('Set-Cookie', logout_cookie);

    this.logger.debug('[Logout] Interceptor...');

    //https://www.passportjs.org/concepts/authentication/logout/
    //This will remove the request.user property and clear the login session (if any).
    request.logout((error) => {
      if (!error) {
        throw new NotFoundException('There was an error signing out the user.');
      }
    });

    return next.handle();
  }
}
