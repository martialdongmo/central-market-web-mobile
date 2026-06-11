import { PaymentMethod } from "../enums/payment-method";
import { OrderItemResponse } from "./orderItemResponse";
import { DeliveryType } from "../enums/deliveryType";
import { OrderStatus } from "./orders/orderStatus";

export interface OrderResponse{
    id: string;
    totalAmount: number;
    subtotalAmount:number;
    deliveryFee:number;
    reference: string;
    status: OrderStatus;

    paymentMethod: PaymentMethod;
    deliveryType:DeliveryType

    customerId: string;
    shopId: string;
    deliveryAddressId:string;

    items: OrderItemResponse[];
    createdAt: string;
    created:string;
} 