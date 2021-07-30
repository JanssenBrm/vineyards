import { Pipe, PipeTransform } from '@angular/core';
import {Note} from '../models/note.model';
import {Action, ActionType} from '../models/action.model';

@Pipe({
  name: 'filterActionsByVarieties'
})
export class FilterActionsByVarietiesPipe implements PipeTransform {

  transform(actions: Action[], varities: string[]): any {
    return actions.filter((a: Action) => a.variety.filter((v: string) => varities.includes(v)).length > 0);
  }

}
