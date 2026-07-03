import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST as string,
  port: parseInt(process.env.MAIL_PORT ?? '587', 10),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER as string,
  password: process.env.MAIL_PASSWORD as string,
  from: process.env.MAIL_FROM as string,
}));
