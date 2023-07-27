import { Pipe, PipeTransform } from '@angular/core';
import { Action } from '../models/action.model';

@Pipe({
  name: 'filterActionsBySeason',
})
export class FilterActionsBySeasonPipe implements PipeTransform {
  transform(actions: Action[], seasons: number[]): any {
    return actions.filter((a: Action) => seasons && seasons.indexOf(a.date.year()) >= 0);
  }
}
