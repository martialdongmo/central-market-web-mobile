export interface CustomerResponse {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    defaultDeliveryAddressId: string;
    active?: boolean;
}