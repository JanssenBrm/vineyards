import { Pipe, PipeTransform } from '@angular/core';
import { NoteBase } from '../models/note.model';
import { VintageEvent } from '../models/vintageevent.model';

@Pipe({
  name: 'noteTypes',
})
export class NoteTypesPipe implements PipeTransform {
  transform(notes: NoteBase[]): VintageEvent[] {
    const keys = Object.keys(VintageEvent);
    return notes
      .map((n: NoteBase) => n.stage)
      .filter((s: VintageEvent, idx: number, events: VintageEvent[]) => events.indexOf(s) === idx)
      .sort((s1: VintageEvent, s2: VintageEvent) => (keys.indexOf(s1) > keys.indexOf(s2) ? 1 : -1));
  }
}
