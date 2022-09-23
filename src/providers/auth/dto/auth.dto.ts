import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/prisma/generated-classes/user';

export class AuthDto extends PickType(User, ['email']) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
