import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Gender } from '@generated/prisma/enums';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'fullName must be a string' })
  @MaxLength(255, { message: 'fullName must not exceed 255 characters' })
  fullName!: string | null;

  @IsOptional()
  @IsString({ message: 'phoneNumber must be a string' })
  @MaxLength(255, { message: 'phoneNumber must not exceed 255 characters' })
  phoneNumber!: string | null;

  @IsOptional()
  @IsString({ message: 'bio must be a string' })
  @MaxLength(500, { message: 'bio must not exceed 500 characters' })
  bio!: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'dateOfBirth must be a valid ISO date string' })
  dateOfBirth!: string | null;

  @IsOptional()
  @IsEnum(Gender, { message: 'gender must be a valid enum value' })
  gender!: Gender | null;
}
