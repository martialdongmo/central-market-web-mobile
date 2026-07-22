export interface ProductResponse {
  productImageUrl: any;
  id: string;

  name: string;

  price: number;
  availableQuantity: number;

  sku: string;
  active: boolean;

  shopId: string;
  categoryName: string;

  imageUrl:string;

  createdBy: string;
}