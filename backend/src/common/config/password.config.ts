export type PasswordConfig = {
  password: {
    saltRounds: number;
  };
};

export const passwordConfig = (): PasswordConfig => ({
  password: {
    saltRounds: parseInt(process.env.SALT_ROUNDS ?? '10', 10),
  },
});
