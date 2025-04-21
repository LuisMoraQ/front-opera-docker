import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroBusqTabla',
  pure: false
})
export class FiltroBusqTablaPipe implements PipeTransform {
  transform(data: Array<any>, searchTxt: string, arrayBusqueda: Array<any>): Array<any> {
    if (data.length === 0 || !searchTxt || !arrayBusqueda.length) {
      return data;
    }
    let filtered = [];
    let considerarTitulo = false
    for (let i = data.length - 1; i >= 0; i--) {
      let considerar = false
      if (data[i].unidad !== '') {
        for (let elemento of arrayBusqueda) {
          if (data[i][elemento].toLowerCase().replace(/\s+/g, ' ').includes(searchTxt.toLowerCase().replace(/\s+/g, ' '))) {
            considerar = true
            considerarTitulo = true
          }
        }
      }
      if (data[i].unidad == '' && considerarTitulo) {
        considerarTitulo = false
        considerar = false
        filtered.push(data[i]);

      }
      if (considerar) {
        filtered.push(data[i]);
      }
    }

    return filtered.reverse();
  };
}
