import { registerAs } from '@nestjs/config';

export default registerAs('password', () => ({
  saltRounds: parseInt(process.env.SALT_ROUNDS ?? '10', 10),
}));
