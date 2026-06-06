export interface PaymentResponse{
    paymentId: string;
    orderId: string;
    amount: number;
    paymentMethod: string;
    status: string;
     fullName: string;
      phoneNumber: string;
    createtAt: string;
    reference?: string;
}