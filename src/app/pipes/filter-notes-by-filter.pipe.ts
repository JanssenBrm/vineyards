import { Pipe, PipeTransform } from '@angular/core';
import { VineyardBaseNote } from '../models/vineyardnote.model';

@Pipe({
  name: 'filterNotesByFilter',
})
export class FilterNotesByFilterPipe implements PipeTransform {
  transform(notes: VineyardBaseNote[], filter: string): VineyardBaseNote[] {
    const text = filter.toLocaleLowerCase().replace('tag:', '');
    if (filter.includes('tag:')) {
      return notes.filter((n: VineyardBaseNote) => n.tags && n.tags.includes(text));
    } else {
      return notes.filter(
        (n: VineyardBaseNote) =>
          n.title.toLocaleLowerCase().includes(text) ||
          n.description.toLocaleLowerCase().includes(text) ||
          (n.tags && n.tags.includes(text))
      );
    }
  }
}
