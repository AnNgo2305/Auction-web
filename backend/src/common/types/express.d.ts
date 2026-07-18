import type { AccessTokenPayload } from '@common/types/token-payload.interface';

declare module 'express' {
  export interface Request {
    user?: AccessTokenPayload;
    requestId?: string;
    sessionId?: string;
  }
}
