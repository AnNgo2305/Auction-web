import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetPasswordOtpResponseDto {
  @ApiProperty({
    description: 'Temporary token used to reset the user password',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  resetPasswordToken!: string;
}
