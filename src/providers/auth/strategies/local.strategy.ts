import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * Middleware for validating authentication crendentials in request body and
 * returning the user to the `request` object.
 *
 * @remarks
 * `username` has been renamed to `email` in the `constructor`
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly logger = new Logger(LocalStrategy.name);
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);

    this.logger.debug('[LOCAL STRATEGY] Middleware...');
    return user;
  }
}
