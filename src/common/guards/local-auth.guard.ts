import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/providers/auth/types/requestWithUser';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);
  async canActivate(context: ExecutionContext) {
    const parentCanActivate = (await super.canActivate(context)) as boolean;
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const { user } = request;
    this.logger.debug(`[LOCAL STRATEGY] Guard... USER ID: ${user.id}`);

    if (!user) {
      return false;
    }

    return parentCanActivate;
  }
}
