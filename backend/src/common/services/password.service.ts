import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import passwordConfig from '@common/config/password.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor(
    @Inject(passwordConfig.KEY)
    private readonly passwordConfigValue: ConfigType<typeof passwordConfig>,
  ) {
    this.saltRounds = this.passwordConfigValue.saltRounds;
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to hash password: ${errorMessage}`);
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to compare password: ${errorMessage}`);
    }
  }
}
