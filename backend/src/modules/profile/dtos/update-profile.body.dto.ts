import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Gender } from '@generated/prisma/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User full name',
    nullable: true,
    example: 'Nguyen Van A',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'fullName must be a string' })
  @MaxLength(255, { message: 'fullName must not exceed 255 characters' })
  fullName!: string | null;

  @ApiPropertyOptional({
    description: 'User phone number',
    nullable: true,
    example: '0123456789',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'phoneNumber must be a string' })
  @MaxLength(255, { message: 'phoneNumber must not exceed 255 characters' })
  phoneNumber!: string | null;

  @ApiPropertyOptional({
    description: 'User biography',
    nullable: true,
    example: 'Software developer',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'bio must be a string' })
  @MaxLength(500, { message: 'bio must not exceed 500 characters' })
  bio!: string | null;

  @ApiPropertyOptional({
    description: 'User date of birth',
    nullable: true,
    example: '2000-01-01',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'dateOfBirth must be a valid ISO date string' })
  dateOfBirth!: string | null;

  @ApiPropertyOptional({
    description: 'User gender',
    nullable: true,
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'gender must be a valid enum value' })
  gender!: Gender | null;
}
