import { OmitType } from '@nestjs/swagger';
import { User } from 'src/prisma/generated-classes/user';

export class ValidateAuthDto extends OmitType(User, [
  'hashedRt',
  'hashedPassword',
]) {}
