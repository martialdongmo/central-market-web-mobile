export interface ShopResponse {
  id: string;        // UUID
  name: string;
  code: string;

  email: string;
  managerName: string;
  contactPhone: string;
  
  categoryName: string;
  address: string;
    city: string;
     shopOpen: boolean;

  latitude: string;
  longitude: string;

  userId: number;    // Long -> number
}