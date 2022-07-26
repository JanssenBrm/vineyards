export enum UserRole {
  BASIC,
  PREMIUM,
  ADMIN,
}

export interface UserData {
  id: string;
  name: string;
  role: UserRole;
}
