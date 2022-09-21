import { PickType } from '@nestjs/mapped-types';
import { IsDefined, IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateUserDto extends PickType(User, ['email']) {
  @MinLength(8)
  @IsNotEmpty({ message: 'password is missing' })
  @IsDefined()
  password: string;
}
