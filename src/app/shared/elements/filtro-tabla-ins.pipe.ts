import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroTablaIns',
  pure: false,
})
export class FiltroTablaInsPipe implements PipeTransform {

  /* transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  } */
  transform(data: Array<any>, searchTxt: string ): Array<any> {
    if (data.length === 0 || !searchTxt) {
      return data;
    }
    let filtered = [];
    let padre='';
    for (let i=data.length-1;i>=0;i--) {
      if (data[i].grupo==1 && data[i].descripcion.toLowerCase().includes(searchTxt.toLowerCase())) {
        filtered.push(data[i]);
        padre=data[i].desc_clasi;
      }
      if(data[i].grupo==0 && padre.toLowerCase()==data[i].desc_clasi.toLowerCase()){
        filtered.push(data[i]);
      }
    }
    
    return filtered.reverse();
  };
}
