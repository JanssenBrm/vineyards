import { Pipe, PipeTransform } from '@angular/core';
import {Note} from '../models/note.model';
import {VineyardNote} from "../models/vineyardnote.model";

@Pipe({
  name: 'filterNotesByFilter'
})
export class FilterNotesByFilterPipe implements PipeTransform {

  transform(notes: VineyardNote[], filter: string): VineyardNote[] {
    const text = filter.toLocaleLowerCase().replace('tag:', '');
    if (filter.includes('tag:')) {
      return notes.filter((n: VineyardNote) => n.tags && n.tags.includes(text)
      );
    } else {
      return notes.filter((n: VineyardNote) => n.title.toLocaleLowerCase().includes(text) ||
          n.description.toLocaleLowerCase().includes(text) ||
          (n.tags && n.tags.includes(text))
      );
    }
  }

}
