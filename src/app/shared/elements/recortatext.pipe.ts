import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'recortacodigo'
})
export class RecortatextPipe implements PipeTransform {

  transform(value: any, opcion: any): unknown {
    try{
      if(value){
        if(opcion === true){
          return value.substring(0,2);
        }
        else{
          return value;
        }
      }
      else{
        return null;
      }
    }catch(e){
      console.log(e)
      return '';
    }
  }

}
