import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreProyecto'
})
export class NombreProyectoPipe implements PipeTransform {

  transform(arg: any, array: any, row: any, tipDes : any): any {
    let string = ''
    if (row.unidad || tipDes) {
      const encontrado = array.find(ele => Number(ele.id_proyecto) == Number(row.vinculo_espproy2))      
      if (encontrado) 
        string = encontrado.descripcion
    }    
    return string
  }

}
