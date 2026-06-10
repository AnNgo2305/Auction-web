export type JwtConfig = {
  jwt: {
    accessTokenKey: string;
    refreshTokenKey: string;
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
  };
};

export const jwtConfig = (): JwtConfig => ({
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY as string,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY as string,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  },
});
