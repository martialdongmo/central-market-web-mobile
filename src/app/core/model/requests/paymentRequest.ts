import { Currency } from "../enums/currency-type";

export interface PaymentRequest {
    orderId: string;
    amount: number;
    currency: Currency;    // NEW
    paymentMethod: string;
    phoneNumber: string;
    reference?:string;
    customerId:string;
    email:string;
    fullName:string;
    userId:number;
}   