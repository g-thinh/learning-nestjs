import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('db', () => ({
  url: process.env.DATABASE_URL,
}));
