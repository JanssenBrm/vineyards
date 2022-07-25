import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'brixToAlcohol',
})
export class BrixToAlcoholPipe implements PipeTransform {
  transform(value: number): string {
    return (value * 0.55).toFixed(1);
  }
}
