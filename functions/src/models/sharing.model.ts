export enum SharingPermission {
  NONE,
  VIEW,
}
export interface SharingOpts {
  user: string;
  permissions: SharingPermission;
}

export interface SharedVineyardOpts {
  user: string;
  vineyard: string;
}
