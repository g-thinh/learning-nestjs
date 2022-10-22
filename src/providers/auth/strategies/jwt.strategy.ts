import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/providers/users/users.service';
import { JwtPayload } from '../types/jwtPayload';

/**
 * Middleware for validating the JWT access token found in a cookie header and
 * appends the `user` to the `request`.
 *
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies.Authentication;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = this.userService.findOne(payload.sub);

    if (!user) {
      throw new BadRequestException();
    }

    return user;
  }
}
