export interface OrderItemResponse {
    productId: string;
    productName: string;
    imageUrl: string;

    priceAtPurchase: number;
    quantity: number;

    shopId: string;
    shopName: string;
}