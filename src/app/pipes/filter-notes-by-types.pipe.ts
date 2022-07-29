import { Pipe, PipeTransform } from '@angular/core';
import { NoteBase } from '../models/note.model';

@Pipe({
  name: 'filterNotesByTypes',
})
export class FilterNotesByTypesPipe implements PipeTransform {
  transform(notes: NoteBase[], types: string[]): any {
    return notes.filter((n: NoteBase) => types.indexOf(n.stage) >= 0);
  }
}
