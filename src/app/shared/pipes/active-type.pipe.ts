import { VineyardService } from './../../services/vineyard.service';
import { Pipe, PipeTransform } from '@angular/core';
import { Vineyard } from 'src/app/models/vineyard.model';
import { ActionType, Action } from 'src/app/models/action.model';

@Pipe({
  name: 'activeType'
})
export class ActiveTypePipe implements PipeTransform {

  constructor(private vineyardService: VineyardService) {}


  transform(vineyard: Vineyard, seasons: number[]): ActionType[] {
    const actions = this.vineyardService.getActionsInYears(vineyard, [], seasons);
    return actions.length > 0 ? [...new Set(actions.map((a: Action) => a.type))] : [];
  }

}
