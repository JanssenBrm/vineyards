import { VineyardService } from './../../services/vineyard.service';
import { Pipe, PipeTransform } from '@angular/core';
import { Action, ActionType } from '../../models/action.model';
import { Vineyard } from 'src/app/models/vineyard.model';

@Pipe({
  name: 'lastAction'
})
export class LastActionPipe implements PipeTransform {

  constructor(private vineyardService: VineyardService) {}

  transform(vineyard: Vineyard, type: ActionType[], seasons: []): any {
    const actions = this.vineyardService.getActionsByTypeAndYear(vineyard, type, seasons);
    return actions.length > 0 ? [actions[0]] : [];
  }

}