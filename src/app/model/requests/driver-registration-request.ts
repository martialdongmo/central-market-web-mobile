import { VehicleType } from "../enums/vehicle-type";

export interface DriverRegistrationRequest {
    licencePlate:string;
    vehicleType:VehicleType;
}
