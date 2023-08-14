import { UserRole } from '../../models/userdata.model';
import { ProductInfo } from '../premium.model';

const BASIC_FEATURES = [
  'Create multiple vineyards',
  'Register the actions on your vineyard',
  'Access basic statistics',
  'Create notes',
];

const PREMIUM_FEATURES = [
  'Features of the basic user',
  'Get weather statistics and frost warnings',
  'Compare growing seasons',
  'Follow up on your vintages',
];

export const ROLES: ProductInfo[] = [
  {
    role: UserRole.BASIC,
    label: 'Basic User',
    features: BASIC_FEATURES,
  },
  {
    role: UserRole.PREMIUM,
    label: 'Premium User',
    features: PREMIUM_FEATURES,
    productId: 'prod_KTUcFkMNO7j7lw',
  },
];
