import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileResponseDto {
  @ApiProperty({
    description: 'User full name',
    nullable: true,
    example: 'Nguyen Van A',
  })
  fullName!: string | null;

  @ApiProperty({
    description: 'User phone number',
    nullable: true,
    example: '0123456789',
  })
  phoneNumber!: string | null;

  @ApiProperty({
    description: 'User biography',
    nullable: true,
    example: 'Software developer',
  })
  bio!: string | null;

  @ApiProperty({
    description: 'User date of birth',
    nullable: true,
    example: '2000-01-01',
  })
  dateOfBirth!: Date | null;

  @ApiProperty({
    description: 'User gender',
    nullable: true,
    example: 'MALE',
  })
  gender!: string | null;
}
