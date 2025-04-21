import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPresu',
  pure: false,
})
export class FiltroPresuPipe implements PipeTransform {

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
      if (data[i].descripcion.toLowerCase().replace(/\s+/g, ' ').includes(searchTxt.toLowerCase().replace(/\s+/g, ' '))) {
        filtered.push(data[i]);
        padre=data[i].item.substring(0,data[i].item.lastIndexOf('.'));
        if(data[i].unidad==''){
          let indins=filtered.length-1;
          for(let j=i+1;j<data.length;j++){
            var palabra = data[j].item.toString().substring(0, data[i].item.length + 1)
            if(palabra==data[i].item+'.'){
              if(indins-1<data.length && indins>0){
                if(data[j].item==filtered[indins-1].item){
                  indins--;
                }
                else{
                  filtered.splice(indins,0,data[j]);
                }
              }
              else{
                filtered.splice(indins,0,data[j]);
              }
            }
            else{
              break;
            }
          }
        }
      }
      if(padre==data[i].item){
        filtered.push(data[i]);
        padre=data[i].item.split('.').length>1?data[i].item.substring(0,data[i].item.lastIndexOf('.')):'';
      }
    }
    
    return filtered.reverse();
  };
}
