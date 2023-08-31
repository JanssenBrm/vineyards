import { Vineyard } from './vineyard.model';

export interface VineyardDoc extends Vineyard {
  location: string;
}
export interface SharedVineyardDoc {
  user: string;
  vineyard: string;
}
