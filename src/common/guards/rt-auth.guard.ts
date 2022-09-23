import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from 'src/providers/auth/strategies';

@Injectable()
export class RtAuthGuard extends AuthGuard('jwt-refresh') {
  private readonly logger = new Logger(RtAuthGuard.name);
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const parentCanActivate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    const user = request?.user as JwtPayload;
    this.logger.log('canActivate...', user);

    if (!user) {
      return false;
    }

    return parentCanActivate;
  }
}
