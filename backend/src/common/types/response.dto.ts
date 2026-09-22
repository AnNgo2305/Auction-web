import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponse {
  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: unknown;
}

export class ErrorResponse {
  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ description: 'Application-specific error code' })
  errorCode: string;

  @ApiProperty({ description: 'Human-readable error message' })
  message: string;
}
