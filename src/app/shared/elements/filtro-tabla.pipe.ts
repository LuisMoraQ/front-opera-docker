import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroTabla',
  pure: false,
})
export class FiltroTablaPipe implements PipeTransform {

  /* transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  } */
  transform(data: Array<any>, searchTxt: string, tipofila:string='1' ): Array<any> {
    if (data.length === 0 || !searchTxt) {
      return data;
    }
    let filtered = [];
    let padre='';
    for (let i=data.length-1;i>=0;i--) {
      if (/* data[i].esgrupo==tipofila && */ data[i].descripcion.toLowerCase().replace(/\s+/g, ' ').includes(searchTxt.toLowerCase().replace(/\s+/g, ' '))) {
        filtered.push(data[i]);
        padre=data[i].agrupacion.substring(0,data[i].agrupacion.lastIndexOf('.'));
        
        if(data[i].esgrupo=='0'){
          let indins=filtered.length-1;
          for(let j=i+1;j<data.length;j++){
            var palabra = data[j].agrupacion.toString().substring(0, data[i].agrupacion.length + 1)
            if(palabra==data[i].agrupacion+'.'){
              if(indins-1<data.length && indins>0){
                if(data[j].agrupacion==filtered[indins-1].agrupacion){
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
      if(data[i].esgrupo==0 && padre==data[i].agrupacion){
        filtered.push(data[i]);
        padre=data[i].agrupacion.split('.').length>1?data[i].agrupacion.substring(0,data[i].agrupacion.lastIndexOf('.')):'';
        
      }
    }
    
    return filtered.reverse();
  };
}
