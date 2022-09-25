import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from 'src/prisma/generated-classes/user';

export class CreateUserDto extends PickType(User, ['email']) {
  @ApiProperty({ type: String })
  password: string;
}
