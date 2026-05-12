export interface PageResponse<T> {
  content: T[];

  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };

  totalElements: number;
  totalPages: number;
  size: number;
  number: number;

  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}