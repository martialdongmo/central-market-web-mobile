import { Currency } from "../enums/currency-type";

export interface RegisterRequest {
    
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    latitude: string;
    longitude: string;
    currency: Currency; // new field
}