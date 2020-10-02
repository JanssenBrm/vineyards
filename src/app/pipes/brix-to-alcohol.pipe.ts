import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'brixToAlcohol'
})
export class BrixToAlcoholPipe implements PipeTransform {

  transform(value: number, ...args: any[]): string {
    return (value * .55).toFixed(1);
  }

}
