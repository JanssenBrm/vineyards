import { VineyardService } from './../../services/vineyard.service';
import { Pipe, PipeTransform } from '@angular/core';
import { Action, ActionType } from '../../models/action.model';
import { Vineyard } from 'src/app/models/vineyard.model';

@Pipe({
  name: 'lastAction'
})
export class LastActionPipe implements PipeTransform {

  constructor(private vineyardService: VineyardService) {}

  transform(actions: Action[], types: ActionType[]): any {
    if (types.length > 0) {
      actions = actions.filter((a: Action) => (types.indexOf(a.type) >= 0));
    }
    return actions.length > 0 ? [actions[0]] : [];
  }

}
