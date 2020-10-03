import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(value: any[], args: {key: string, type: 'dateString', desc?: boolean}): any[] {
    const sorted = value.sort((v1: any, v2: any) => {
      if (args.type === 'dateString') {
        return moment(v1[args.key]).isSameOrBefore(moment(v2[args.key])) ? -1 : 1;
      }
      return 1;
    });

    return args.desc ? sorted.reverse() : sorted;
  }

}
