import { VineyardBase, VineyardPermissions } from './vineyard.model';

export interface VineyardDoc extends VineyardBase {
  location: string;
}

export interface VineyardPermissionsDoc {
  permissions: VineyardPermissions;
}
export interface SharedVineyardDoc {
  user: string;
  vineyard: string;
}
