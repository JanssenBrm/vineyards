import { VintageEvent } from './vintageevent.model';

export interface NoteBase {
  id: string;
  date: string;
  stage: VintageEvent;
  description: string;
  files: string[];
}

export interface Note extends NoteBase {
  html: string;
}
