import { OrderItemResponse } from "../orderItemResponse";
import { DeliveryType } from "../../enums/deliveryType";
import { PaymentMethod } from "../../enums/payment-method";
import { OrderStatus } from "./orderStatus";

export interface CustomerOrderDetailResponse { id: string; reference: string; 
    status: OrderStatus; 
    subtotalAmount: number; 
    deliveryFee: number; totalAmount: number; 
    paymentMethod: PaymentMethod; 
    deliveryType: DeliveryType; 
    deliveryAddressId: string; addressLine: string; customerFullName: string;
    customerPhoneNumber: string; note: string; createdAt: string;
    items: OrderItemResponse[];

 }