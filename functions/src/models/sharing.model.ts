export enum SharingPermission {
  NONE,
  VIEW,
}
export interface SharingOpts {
  user: string;
  permissions: SharingPermission;
}
