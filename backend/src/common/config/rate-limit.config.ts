import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => ({
  short: {
    ttl: Number(process.env.THROTTLE_SHORT_TTL ?? 1000),
    limit: Number(process.env.THROTTLE_SHORT_LIMIT ?? 3),
  },

  medium: {
    ttl: Number(process.env.THROTTLE_MEDIUM_TTL ?? 10000),
    limit: Number(process.env.THROTTLE_MEDIUM_LIMIT ?? 20),
  },

  long: {
    ttl: Number(process.env.THROTTLE_LONG_TTL ?? 60000),
    limit: Number(process.env.THROTTLE_LONG_LIMIT ?? 100),
  },
}));
