export enum UserRole {
  BASIC,
  PREMIUM,
  ADMIN,
}

export interface UserData {
  id: string;
  name: string;
  role: UserRole;
  customerId?: string;
}

export const NON_PREMIUM_ROLES = [UserRole.BASIC];
export const PREMIUM_ROLES = [UserRole.PREMIUM, UserRole.ADMIN];
