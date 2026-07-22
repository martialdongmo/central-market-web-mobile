export interface DeliveryAddressRequest {
  phoneNumber: string;
  fullName: string;
  addressLine: string;
  city: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  defaultAddress: boolean;
  label?: string;

}