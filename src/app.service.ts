import { Get, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  @Get('error')
  throwError() {
    throw new InternalServerErrorException();
  }
}
