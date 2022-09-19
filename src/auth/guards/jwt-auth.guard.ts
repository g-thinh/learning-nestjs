import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestService } from 'src/request.service';
import { JwtPayload } from '../strategies';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly requestService: RequestService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const parentCanActivate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    const user = request?.user as JwtPayload;

    if (!user) {
      return true;
    }

    this.requestService.setUserId(user.sub);

    return parentCanActivate;
  }
}
