import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessTokenKey: process.env.ACCESS_TOKEN_KEY as string,
  refreshTokenKey: process.env.REFRESH_TOKEN_KEY as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
}));
