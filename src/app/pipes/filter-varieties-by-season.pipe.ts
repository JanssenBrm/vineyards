import {Pipe, PipeTransform} from '@angular/core';
import {Variety} from '../models/variety.model';
import {Action, ActionType} from '../models/action.model';

@Pipe({
  name: 'filterVarietiesBySeason'
})
export class FilterVarietiesBySeasonPipe implements PipeTransform {

  transform(varieties: Variety[], actions: Action[]): any {
    const plantedVars = actions ? [].concat(...actions.filter((a: Action) => a.type === ActionType.Planting).map((a: Action) => a.variety)) : [];
    return varieties.filter((v: Variety) => plantedVars.includes(v.id));
  }

}
