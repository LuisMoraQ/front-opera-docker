import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'agrupamiento'
})
export class AgrupamientoPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    console.log('value', value)
    console.log('args', args)
    return value;
  }

}
