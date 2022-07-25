import { Pipe, PipeTransform } from '@angular/core';
import { Action } from '../models/action.model';

@Pipe({
  name: 'filterActionsByVarieties',
})
export class FilterActionsByVarietiesPipe implements PipeTransform {
  transform(actions: Action[], varities: string[]): any {
    return actions.filter((a: Action) => a.variety.filter((v: string) => varities.includes(v)).length > 0);
  }
}
