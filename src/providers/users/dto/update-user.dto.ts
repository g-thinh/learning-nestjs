import { PartialType } from '@nestjs/swagger';
import { User } from 'src/prisma/generated-classes/user';

export class UpdateUserDto extends PartialType(User) {}
