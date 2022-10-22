import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/providers/auth/types/requestWithUser';

@Injectable()
export class RtAuthGuard extends AuthGuard('jwt-refresh') {
  private readonly logger = new Logger(RtAuthGuard.name);
  async canActivate(context: ExecutionContext) {
    const parentCanActivate = (await super.canActivate(context)) as boolean;
    const request: RequestWithUser = context.switchToHttp().getRequest();

    //we dont really need to verify the user again, based on the the context
    //passportjs will know that the user has been validated in the strategy middleware
    const { user } = request;
    if (!user) {
      return false;
    }
    this.logger.debug(`[RT STRATEGY] Guard... USER ID: ${user.id}`);
    return parentCanActivate;
  }
}
