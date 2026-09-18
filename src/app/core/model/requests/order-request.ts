import { DeliveryAddressRequest } from "../delivery-address";
import { Currency } from "../enums/currency-type";
import { DeliveryType } from "../enums/deliveryType";
import { PaymentMethod } from "../enums/payment-method";
import { OrderItemRequest } from "./order-tem-request";

export interface OrderRequest {
    userId: string;
    customerId: string;
    deliveryAddressId: string;
    paymentMethod: PaymentMethod;
    currency: Currency;    // NEW
    deliveryType: DeliveryType;
    deviceInfo: string; 
    note?: string;
    items: OrderItemRequest[];
}