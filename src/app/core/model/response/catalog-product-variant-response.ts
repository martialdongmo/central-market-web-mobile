export interface CatalogProductVariantResponse {
  id: string;             // UUID → string
  sku: string;
  color: string;
  size: string;
  material: string;
  imageUrl: string;
  price: number;          // BigDecimal → number
  extraPrice: number;     // BigDecimal → number
  availableQty: number;   // Double → number
  inStock: boolean;
  active: boolean;
}
