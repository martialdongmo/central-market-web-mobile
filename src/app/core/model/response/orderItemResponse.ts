import { Currency } from "../enums/currency-type";

export interface OrderItemResponse {
    productId: string;
    productName: string;
    imageUrl: string;

    priceAtPurchase: number;
    quantity: number;
     currency:Currency; 

    shopId: string;
    shopName: string;
}