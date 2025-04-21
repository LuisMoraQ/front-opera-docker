import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'periodoHora'
})
export class PeriodoHoraPipe implements PipeTransform {

  transform(value: any, opcion: any): unknown {
    try{
      if(value){
        const date = new Date()
        const fecha = moment(date).format('YYYY-MM-DD')
        const completo = fecha + ' ' + value + ':00'
        const convertido = moment(completo).format('h:mm a')
        return convertido
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
