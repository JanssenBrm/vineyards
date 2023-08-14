import { UserRole } from '../models/userdata.model';

export interface ProductInfo {
  role: UserRole;
  label: string;
  features: string[];
  priceId?: string;
}
