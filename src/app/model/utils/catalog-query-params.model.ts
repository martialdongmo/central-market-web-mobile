// catalog-query-params.model.ts
export interface CatalogQueryParams {
  keyword?:       string;
  categoryId?:    string;

  promotionOnly?: boolean;
  inStockOnly?:   boolean;
  minPrice?:      number;
  maxPrice?:      number;

  lat?:           number;
  lng?:           number;
  radiusKm?:      number;     // used by /all, /nearby, /category — NOT /promotions or /search

  page?:          number;
  size?:          number;
  sort?:          string;     // e.g. "price,asc" | "popularityScore,desc"
}