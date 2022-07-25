import { Pipe, PipeTransform } from '@angular/core';
import { Note } from '../models/note.model';

@Pipe({
  name: 'filterNotesByTypes',
})
export class FilterNotesByTypesPipe implements PipeTransform {
  transform(notes: Note[], types: string[]): any {
    return notes.filter((n: Note) => types.indexOf(n.stage) >= 0);
  }
}
