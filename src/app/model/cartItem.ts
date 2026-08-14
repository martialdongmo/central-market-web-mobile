export interface CartItem {
  shopLatitude: number;
  shopLongitude: number;
  productId: string;

  productName: string;
  imageUrl?: string;

  price: number;
  promotionPrice?: number | null;
  promotionActive: boolean; 

  shopId: string;
  userUuid: string;
  shopName: string;
  shopEmail: string;

  quantity: number;
}