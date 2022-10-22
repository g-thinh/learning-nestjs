import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from 'src/providers/auth/auth.service';
import { RequestWithUser } from 'src/providers/auth/types/requestWithUser';

// this is where I want to set cookie headers based on passport.js
// giving me back a user in my request.
@Injectable()
export class AuthInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuthInterceptor.name);
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const userId = request.user.id;

    const { access_cookie, access_token } =
      await this.authService.getCookieWithJwtToken(userId);

    //retrieve the previous interceptors refresh cookie
    const headers = response.getHeaders();
    const refresh_cookie = headers['set-cookie']?.toString();

    //append the refresh cookie with the new access cookie
    response.setHeader('Set-Cookie', [access_cookie, refresh_cookie]);

    //modify the request user object with the verified access token
    const jwtPayload = this.jwtService.verify(access_token);
    request.user = jwtPayload;

    this.logger.debug('[Auth] Interceptor...');
    return next.handle();
  }
}
