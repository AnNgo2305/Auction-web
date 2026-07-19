export class CursorPaginationMetaDto {
  limit!: number;

  itemCount!: number;

  hasNextPage!: boolean;

  nextCursor?: string;
}

export class PaginationResult<T> {
  data!: T[];

  meta!: CursorPaginationMetaDto;
}
