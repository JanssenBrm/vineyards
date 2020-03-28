import { Pipe, PipeTransform } from '@angular/core';
import { Vineyard } from 'src/app/models/vineyard.model';
import { ActionType, Action } from 'src/app/models/action.model';

@Pipe({
  name: 'activeType'
})
export class ActiveTypePipe implements PipeTransform {

  transform(vineyard: Vineyard): ActionType[] {
    return vineyard ? [...new Set(vineyard.actions.map((a: Action) => a.type))] : [];
  }

}
