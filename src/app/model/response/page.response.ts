import { SortInfo } from "../utils/sortInfo";

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber:    number;
    pageSize:      number;
    offset:        number;
    paged:         boolean;
    unpaged:       boolean;
    sort:          SortInfo;   // Spring includes this
  };
  sort:            SortInfo;   // also at top level
  totalElements:   number;
  totalPages:      number;
  size:            number;
  number:          number;     // current page index
  first:           boolean;
  last:            boolean;
  numberOfElements: number;
  empty:           boolean;
}