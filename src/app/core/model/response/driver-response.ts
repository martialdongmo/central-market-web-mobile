import { DriverStatus } from "../enums/driver-status";
import { VehicleType } from "../enums/vehicle-type";

export interface DriverResponse {
id: string;
userUuid: string;
fullName: string;
email: string;
phoneNumber: string;
licencePlate: string;
vehicleType: VehicleType;
status: DriverStatus;
createdAt: Date;
}