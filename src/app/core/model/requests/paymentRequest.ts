export interface PaymentRequest {
    orderId: string;
    amount: number;
    paymentMethod: string;
    phoneNumber: string;
    reference?:string;
    customerId:string;
    email:string;
    fullName:string;
    userId:number;
}   