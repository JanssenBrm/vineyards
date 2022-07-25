import { Pipe, PipeTransform } from '@angular/core';
import { Note } from '../models/note.model';
import { VintageEvent } from '../models/vintageevent.model';

@Pipe({
  name: 'noteTypes',
})
export class NoteTypesPipe implements PipeTransform {
  transform(notes: Note[]): VintageEvent[] {
    const keys = Object.keys(VintageEvent);
    return notes
      .map((n: Note) => n.stage)
      .filter((s: VintageEvent, idx: number, events: VintageEvent[]) => events.indexOf(s) === idx)
      .sort((s1: VintageEvent, s2: VintageEvent) => (keys.indexOf(s1) > keys.indexOf(s2) ? 1 : -1));
  }
}
