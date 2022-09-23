import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class User {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: String })
  hashedPassword: string;

  @ApiPropertyOptional({ type: String })
  hashedRt?: string;
}
