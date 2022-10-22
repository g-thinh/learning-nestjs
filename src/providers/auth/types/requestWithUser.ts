import { User } from '@prisma/client';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: Omit<User, 'hashedRt' | 'hashedPassword'>;
  test?: string;
}
