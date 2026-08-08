import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { ERROR_MISSING_ACCESS_TOKEN } from '@common/constants/error.constant';

interface SocketData {
  userId: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();

    const data = client.data as SocketData;

    if (!data.userId) {
      throw new UnauthorizedException(ERROR_MISSING_ACCESS_TOKEN);
    }

    return true;
  }
}
