import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AddressType } from '@generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAddressesDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Nguyen Trai Street',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Street address is required' })
  @IsString({ message: 'Street address must be a string' })
  @MaxLength(255, {
    message: 'Street address must not exceed 255 characters',
  })
  streetAddress!: string;

  @ApiProperty({
    description: 'City',
    example: 'Hanoi',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  @MaxLength(255, {
    message: 'City must not exceed 255 characters',
  })
  city!: string;

  @ApiPropertyOptional({
    description: 'State or province',
    example: 'Cau Giay',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  @MaxLength(255, {
    message: 'State must not exceed 255 characters',
  })
  state?: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '100000',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @MaxLength(255, {
    message: 'Postal code must not exceed 255 characters',
  })
  postalCode?: string;

  @ApiProperty({
    description: 'Country',
    example: 'Vietnam',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Country is required' })
  @IsString({ message: 'Country must be a string' })
  @MaxLength(255, {
    message: 'Country must not exceed 255 characters',
  })
  country!: string;

  @ApiProperty({
    description: 'Address type',
    enum: AddressType,
    example: AddressType.Home,
  })
  @IsNotEmpty({ message: 'Address type is required' })
  @IsEnum(AddressType, {
    message: 'Address type must be a valid address type',
  })
  addressType!: AddressType;
}
