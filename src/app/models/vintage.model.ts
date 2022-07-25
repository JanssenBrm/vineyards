import { VintageColor } from './vintagecolor.model';

export enum VintageStatus {
  NOTSTARTED = 'Not started',
  INPROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export interface Vintage {
  id: string;
  year: number;
  name: string;
  color: VintageColor;
  varieties: string[];
  cover?: string;
  status: VintageStatus;
}

export const VINTAGE_STATUS_COLORS = {
  NOTSTARTED: 'rgb(255, 99, 132)',
  INPROGRESS: 'rgb(54, 162, 235)',
  COMPLETED: 'rgb(75, 192, 192)',
};
