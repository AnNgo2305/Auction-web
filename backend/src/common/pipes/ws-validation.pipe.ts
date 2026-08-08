import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';
import { ERROR_CLASS_VALIDATION_FAILED } from '@common/constants/error.constant';

@Injectable()
export class WsValidationPipe extends ValidationPipe {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    {
      try {
        return await super.transform(value, metadata);
      } catch (error) {
        throw new BadRequestException({
          ...ERROR_CLASS_VALIDATION_FAILED,
          message: error instanceof Error ? error.message : 'Validation failed',
        });
      }
    }
  }
}
