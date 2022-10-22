import { ApiProperty } from '@nestjs/swagger';

export class PayloadDto {
  @ApiProperty()
  sub: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  iat: number;

  @ApiProperty()
  exp: number;
}
