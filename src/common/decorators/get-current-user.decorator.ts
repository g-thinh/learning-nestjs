import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';

type JwtPayloadKey = keyof JwtPayload;

export const GetCurrentUser = createParamDecorator(
  (data: JwtPayloadKey, context: ExecutionContext) => {
    const request = context?.switchToHttp().getRequest();

    //if no key is specified return the payload
    if (!data) {
      return request?.user;
    }

    return request.user[data as JwtPayloadKey];
  },
);
