import { VineyardService } from './../../services/vineyard.service';
import { Pipe, PipeTransform } from '@angular/core';
import { ActionType, Action } from 'src/app/models/action.model';

@Pipe({
  name: 'activeType',
})
export class ActiveTypePipe implements PipeTransform {
  constructor(private vineyardService: VineyardService) {}

  transform(actions: Action[]): ActionType[] {
    return actions.length > 0 ? [...new Set(actions.map((a: Action) => a.type))] : [];
  }
}
