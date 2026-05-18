import { DeliveryAddressRequest } from "./deliveryAddressRequest";

export interface CustomerRequest{
    userId: string;
    firstName: string;
    
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    defaultDeliveryAddressId: string;
    addressRequest?: DeliveryAddressRequest;
    active?: boolean;
}