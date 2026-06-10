import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '@generated/prisma/enums';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { Request } from 'express';
import { ERROR_USER_FORBIDDEN } from '@common/constants/error.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user;

    if (
      !user ||
      !user.role ||
      !requiredRoles.includes(<'ADMIN' | 'BIDDER' | 'SELLER'>user.role)
    ) {
      throw new ForbiddenException(ERROR_USER_FORBIDDEN);
    }

    return true;
  }
}
