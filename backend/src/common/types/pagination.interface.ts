import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CursorPaginationMetaDto {
  @ApiProperty({
    description: 'Maximum number of items requested per page',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Number of items returned in the current page',
    example: 1,
  })
  itemCount!: number;

  @ApiProperty({
    description: 'Whether more items are available',
    example: true,
  })
  hasNextPage!: boolean;

  @ApiPropertyOptional({
    description: 'Cursor used to retrieve the next page',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  nextCursor?: string;
}

export class PaginationResult<T> {
  @ApiProperty({
    description: 'Items returned in the current page',
    isArray: true,
  })
  data!: T[];

  @ApiProperty({
    description: 'Cursor-based pagination metadata',
    type: CursorPaginationMetaDto,
  })
  meta!: CursorPaginationMetaDto;
}
