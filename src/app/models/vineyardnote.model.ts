import * as moment from 'moment';

export interface VineyardBaseNote {
  id: string;
  date: moment.Moment;
  title: string;
  description: string;
  tags: string[];
}

export interface VineyardBaseNoteDoc {
  id: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
}
export interface VineyardNote extends VineyardBaseNote {
  html: string;
}
