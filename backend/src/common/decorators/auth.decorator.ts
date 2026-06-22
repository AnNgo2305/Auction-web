import type { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { AuthType } from '@common/types/auth-type.enum';

export const AUTH_TYPE_KEY = 'auth_type';

export const Auth = (type: AuthType = AuthType.ACCESS_TOKEN): CustomDecorator =>
  SetMetadata(AUTH_TYPE_KEY, type);
