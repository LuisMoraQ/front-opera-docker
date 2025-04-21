import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroAcu',
  pure: false,
})
export class FiltroAcuPipe implements PipeTransform {

  /* transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  } */
  transform(data: Array<any>, searchTxt: string ): Array<any> {
    if (data.length === 0 || !searchTxt) {
      return data;
    }
    let filtered = [];
    /* let padre=''; */
    for (let i=data.length-1;i>=0;i--) {
      if (data[i].unidad!='' && data[i].descripcion.toLowerCase().includes(searchTxt.toLowerCase())) {
        filtered.push(data[i]);
        /* padre=data[i].id_tipo_insumo.toString(); */
      }
      if(data[i].unidad==''/*  && padre==data[i].id_tipo_insumo */){
        filtered.push(data[i]);
      }
    }
    
    return filtered.reverse();
  };
}
