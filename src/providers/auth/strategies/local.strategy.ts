import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

//This middleware will validate my authentication credentials and pass
//a user object to the request. Next stop is the Guard.
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
    console.log('validating', email, password);
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('unable to validate user');
    }

    this.logger.debug('[LOCAL STRATEGY] Middleware...');
    return user;
  }
}
