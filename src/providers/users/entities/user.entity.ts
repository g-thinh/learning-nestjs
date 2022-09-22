import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { IsAlphanumeric, IsDate, IsEmail, IsNotEmpty } from 'class-validator';

@Entity()
export class User {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  @IsDate()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  @IsDate()
  updatedAt: Date;

  @Property()
  @IsEmail()
  email!: string;

  @Property()
  @IsNotEmpty()
  @IsAlphanumeric()
  hashedPassword!: string;

  @Property({ nullable: true })
  hashedRt?: string;
}
