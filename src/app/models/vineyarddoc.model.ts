import { VineyardBase } from './vineyard.model';

export interface VineyardDoc extends VineyardBase {
  location: string;
}
export interface SharedVineyardDoc {
  user: string;
  vineyard: string;
}
