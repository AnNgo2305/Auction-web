import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductCommentUserDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Username',
    example: 'nguyenvana',
  })
  username!: string;

  @ApiProperty({
    description: 'Public profile image URL',
    nullable: true,
    example: 'https://example.com/avatar.jpg',
  })
  profileImageUrl!: string | null;
}

export class ProductCommentItemResponseDto {
  @ApiProperty({
    description: 'Product comment ID',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  commentId!: string;

  @ApiProperty({
    description: 'Content of the product comment',
    example: 'This product has excellent quality.',
  })
  content!: string;

  @ApiPropertyOptional({
    description: 'Rating given to the product, from 1 to 5',
    nullable: true,
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  rating?: number | null;

  @ApiProperty({
    description: 'Comment creation time',
    example: '2026-09-22T05:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Comment last update time',
    example: '2026-09-22T06:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'User who created the comment',
    type: ProductCommentUserDto,
  })
  user!: ProductCommentUserDto;
}

export class GetProductCommentsResponseDto {
  @ApiProperty({
    description: 'List of comments for the product',
    type: [ProductCommentItemResponseDto],
  })
  comments!: ProductCommentItemResponseDto[];

  @ApiProperty({
    description:
      'Cursor for retrieving the next page. Null when there are no more comments.',
    nullable: true,
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  nextCursor!: string | null;
}
