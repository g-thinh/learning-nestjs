import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from 'src/providers/users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly logger = new Logger(LocalStrategy.name);
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Omit<User, 'hashedPassword' | 'hashedRt'>> {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    this.logger.log('validate...', user);
    return user;
  }
}
