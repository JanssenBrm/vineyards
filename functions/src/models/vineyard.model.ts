export enum VineyardPermissions {
  NONE,
  VIEW,
  EDIT,
  OWNER,
}

export interface Vineyard {
  id: string;
  name: string;
  address: string;
  location: any;
}

export interface SharedVineyard extends Vineyard {
  shared: boolean;
  permissions: VineyardPermissions;
  owner: string;
  ownerName: string;
}
