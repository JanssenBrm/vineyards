import { UserRole } from '../../models/userdata.model';
import { ProductInfo } from '../premium.model';
import { environment } from '../../../environments/environment';

const BASIC_FEATURES = [
  'Create a single vineyard',
  'Register the actions on your vineyard',
  'Access basic statistics',
  'Create notes',
];

const PREMIUM_FEATURES = [
  'Add multiple vineyards',
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
    priceId: environment.stripePremiumPrice,
  },
];
