import { registerAs } from '@nestjs/config';

// https://docs.nestjs.com/techniques/configuration#configuration-namespaces
// this enables the auth namespace to be used in the ConfigService get() method
// with dot notation
export const authConfig = registerAs('auth', () => ({
  secret: process.env.JWT_SECRET,
}));
