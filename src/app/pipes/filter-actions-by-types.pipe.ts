import { Pipe, PipeTransform } from '@angular/core';
import { Action, ActionType } from '../models/action.model';

@Pipe({
  name: 'filterActionsByTypes',
})
export class FilterActionsByTypesPipe implements PipeTransform {
  transform(actions: Action[], types: string[]): any {
    return actions.filter((a: Action) => types.map((t: string) => ActionType[t]).indexOf(a.type) >= 0);
  }
}
