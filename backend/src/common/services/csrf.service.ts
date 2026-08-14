import { Injectable, UnauthorizedException } from '@nestjs/common';
import { csrfConfig } from '@common/config/csrf.config';
import type { Request, Response } from 'express';
import { DoubleCsrfProtection } from 'csrf-csrf';
import { ERROR_MISSING_ACCESS_TOKEN } from '@common/constants/error.constant';

@Injectable()
export class CsrfService {
  private readonly csrf = csrfConfig();

  generateToken(req: Request, res: Response): string {
    const accessToken = req.cookies?.access_token as string;

    if (!accessToken) {
      throw new UnauthorizedException(ERROR_MISSING_ACCESS_TOKEN);
    }

    return this.csrf.generateCsrfToken(req, res);
  }

  get protection(): DoubleCsrfProtection {
    return this.csrf.doubleCsrfProtection;
  }
}
