import { VintageEvent } from './vintageevent.model';
import * as moment from 'moment';

export interface NoteBase {
  id: string;
  date: moment.Moment;
  stage: VintageEvent;
  description: string;
  files: string[];
}

export interface NoteBaseDoc {
  id: string;
  date: string;
  stage: VintageEvent;
  description: string;
  files: string[];
}

export interface Note extends NoteBase {
  html: string;
}
