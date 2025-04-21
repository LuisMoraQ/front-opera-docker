import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtoTablaDesc',
  pure: false,
})
export class FiltoTablaDescPipe implements PipeTransform {

  /* transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  } */
  transform(data: Array<any>, searchTxt: string, nomele:string='descripcion' ): Array<any> {
    if (data.length === 0 || !searchTxt) {
      return data;
    }
    let filtered = [];
    for (let i=data.length-1;i>=0;i--) {
      if (data[i][nomele].toLowerCase().replace(/\s+/g, ' ').includes(searchTxt.toLowerCase().replace(/\s+/g, ' '))) {
        filtered.push(data[i]);
      }
    }
    
    return filtered.reverse();
  };
}
