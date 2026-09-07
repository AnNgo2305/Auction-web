import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AddressType } from '@generated/prisma/enums';

export class UpdateAddressesDto {
  @IsNotEmpty({ message: 'Street address is required' })
  @IsString({ message: 'Street address must be a string' })
  @MaxLength(255, {
    message: 'Street address must not exceed 255 characters',
  })
  streetAddress!: string;

  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  @MaxLength(255, {
    message: 'City must not exceed 255 characters',
  })
  city!: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  @MaxLength(255, {
    message: 'State must not exceed 255 characters',
  })
  state?: string;

  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @MaxLength(255, {
    message: 'Postal code must not exceed 255 characters',
  })
  postalCode?: string;

  @IsNotEmpty({ message: 'Country is required' })
  @IsString({ message: 'Country must be a string' })
  @MaxLength(255, {
    message: 'Country must not exceed 255 characters',
  })
  country!: string;

  @IsNotEmpty({ message: 'Address type is required' })
  @IsEnum(AddressType, {
    message: 'Address type must be a valid address type',
  })
  addressType!: AddressType;
}
