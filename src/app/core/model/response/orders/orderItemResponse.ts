export interface OrderItemResponse {
  productId: string;      // UUID → string
  productName: string;
  imageUrl: string;

  priceAtPurchase: number; // BigDecimal → number
  quantity: number;        // Integer → number

  shopId: string;          // UUID → string
  shopName: string;
}
