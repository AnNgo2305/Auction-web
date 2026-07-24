import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductCommentDto {
  @IsString({
    message: 'Content must be a string.',
  })
  @MaxLength(2000, {
    message: 'Content must not exceed 2000 characters.',
  })
  content: string;

  @IsOptional()
  @IsInt({
    message: 'Rating must be an integer.',
  })
  @Min(1, {
    message: 'Rating must be at least 1.',
  })
  @Max(5, {
    message: 'Rating must not exceed 5.',
  })
  rating?: number;
}
