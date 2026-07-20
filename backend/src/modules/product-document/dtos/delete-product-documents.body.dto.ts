import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class DeleteProductDocumentsDto {
  @IsArray({
    message: 'Document IDs must be an array.',
  })
  @ArrayMinSize(1, {
    message: 'At least one document ID is required.',
  })
  @ArrayMaxSize(10, {
    message: 'A maximum of 10 document IDs can be deleted at once.',
  })
  @IsUUID('4', {
    each: true,
    message: 'Each document ID must be a valid UUID.',
  })
  documentIds: string[];
}
