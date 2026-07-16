import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroTablaProy',
  pure: false,
})
export class FiltroTablaProyPipe implements PipeTransform {

  /* transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  } */
  transform(data: Array<any>, searchTxt: string ): Array<any> {
    if (data.length === 0 || !searchTxt) {
      return data;
    }
    let filtered = [];
    let padre='';
    /* for (let i=data.length-1;i>=0;i--) {
      if (data[i].id_proyecto!='' && data[i].descripcion.toLowerCase().includes(searchTxt.toLowerCase())) {
        filtered.push(data[i]);
        padre=data[i].id_grupo.toString();
      }
      if(data[i].id_proyecto=='' && padre.toLowerCase()==data[i].id_grupo.toString().toLowerCase()){
        filtered.push(data[i]);
      }
    } */
    for (let i=data.length-1;i>=0;i--) {
      if (data[i].descripcion.toLowerCase().replace(/\s+/g, ' ').includes(searchTxt.toLowerCase().replace(/\s+/g, ' '))) {
        filtered.push(data[i]);
        padre=data[i].id_grupo.toString();

        if(data[i].nro.toString()!=''){
          let indins=filtered.length-1;
          for(let j=i+1;j<data.length;j++){
            if(data[j].id_grupo==data[i].id_grupo){
              if(indins-1<data.length && indins>0){
                if(data[j].id_proyecto==filtered[indins-1].id_proyecto){
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
      else if(padre==data[i].id_grupo.toString() && data[i].nro.toString()!=''){
        filtered.push(data[i]);
        //padre=data[i].nro.toString()==''?data[i].id_grupo.toString():'';
      }
    }
    
    return filtered.reverse();
  };
}
