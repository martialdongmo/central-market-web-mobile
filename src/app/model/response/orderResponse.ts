import { OrderStatus } from "src/app/services/order.service";
import { PaymentMethod } from "../enums/payment-method";
import { OrderItemResponse } from "./orderItemResponse";
import { DeliveryType } from "../enums/deliveryType";

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