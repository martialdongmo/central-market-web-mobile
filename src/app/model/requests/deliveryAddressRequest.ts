export interface DeliveryAddressRequest{
         label?: string;
        addressLine: string;
        fullName: string;
        city: string;
        region?: string;
        latitude: string;
        longitude: string;
        defaultAddress?: boolean;
}