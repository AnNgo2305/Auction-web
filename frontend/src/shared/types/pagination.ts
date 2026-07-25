export class CursorPaginationMetaData {
  limit!: number;

  itemCount!: number;

  hasNextPage!: boolean;

  nextCursor?: string;
}

export class PaginationData<T> {
  data!: T[];

  meta!: CursorPaginationMetaData;
}
