import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ERROR_CLASS_VALIDATION_FAILED } from '@common/constants/error.constant';

@Injectable()
export class ValidationPipe implements PipeTransform {
  private options = {
    transform: true,
    validate: true,
    errorMessage: ERROR_CLASS_VALIDATION_FAILED.message,
    transformOptions: { enableImplicitConversion: true },
    validateOptions: { whitelist: true, forbidNonWhitelisted: true },
  };

  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: Array<new (...args: unknown[]) => unknown> = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !types.includes(metatype);
  }

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object: unknown = plainToInstance(
      metatype,
      value,
      this.options.transformOptions,
    );
    if (object instanceof Object) {
      const errors = await validate(object);

      if (errors.length > 0) {
        const messages = Object.fromEntries(
          errors.map((err) => [
            err.property,
            Object.values(err.constraints ?? {}),
          ]),
        );
        throw new BadRequestException({
          ...ERROR_CLASS_VALIDATION_FAILED,
          message: messages,
        });
      }
    }

    return object;
  }
}
