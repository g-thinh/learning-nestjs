import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  private userId: string | number | undefined;

  getUserId() {
    return this.userId;
  }

  setUserId(userId: string | number) {
    this.userId = userId;
  }
}
