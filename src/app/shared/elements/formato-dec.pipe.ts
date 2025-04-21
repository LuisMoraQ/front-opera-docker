import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoDec'
})
export class FormatoDecPipe implements PipeTransform {

  transform(value: string): string {
    try{
      if(value === '' || value == null){
        return '';
      }
      else{
        let valor=parseFloat(value);
        let arrval=valor.toString().split('.');
        if(arrval.length>1){
          if(arrval[1].length<2){
            return valor.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
          }
          else{
            return (arrval[0]+"."+arrval[1].substring(0,6)).replace(/\d(?=(\d{3})+\.)/g, '$&,');
          }
        }
        else{
          return valor.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }
      }
    }catch(e){
      console.log(e)
      return '';
    }
  }
}
