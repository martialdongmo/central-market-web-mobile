export interface CartItem {
  shopLatitude: number;
  shopLongitude: number;
  productId: string;

  productName: string;
  imageUrl?: string;

  price: number;
  promotionPrice?: number | null;

  shopId: string;
  shopName: string;

  quantity: number;
}