import { registerAs } from '@nestjs/config';

export const dbConfig = registerAs('db', () => ({
  url: process.env.DATABASE_URL,
  name: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
}));
