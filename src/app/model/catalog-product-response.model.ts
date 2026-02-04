export interface CatalogProductResponse {
  productId: string;
  productName: string;
  description: string;
  imageUrl: string;

  categoryId: string;
  categoryName: string;    

  shopId: string;
  shopName: string;
  shopOpen?: boolean;   

  price: number;
  promotionActive: boolean;
  promotionPrice?: number;

  inStock: boolean;
  availableQuantity: number;

  distanceKm?: number;
  popularityScore?: number;
  totalSales?: number;
}