import { Variety } from './variety.model';

export interface Season {
  year: number;
  varieties: Variety[];
}
