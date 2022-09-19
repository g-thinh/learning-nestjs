import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestService } from 'src/providers/request.service';
import { JwtPayload } from '../../auth/strategies';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private readonly requestService: RequestService) {
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

    this.requestService.setUserId(user.sub);

    return parentCanActivate;
  }
}
