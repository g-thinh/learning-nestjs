import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/providers/auth/types/jwtPayload';
import { AuthService } from '../auth.service';

//this strategy will compare the hash of stored refresh token
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private readonly logger = new Logger(RtStrategy.name);
  constructor(configService: ConfigService, private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies.Refresh;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.rt_secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<any> {
    const refreshToken = req?.cookies?.Refresh;

    if (!refreshToken) {
      throw new BadRequestException('No Refresh Token');
    }

    this.logger.debug(`[RT Strategy] Midleware...`);
    const user = await this.authService.validateRefreshToken(
      payload.sub,
      refreshToken,
    );

    if (!user) {
      throw new BadRequestException();
    }

    return user;
  }
}
