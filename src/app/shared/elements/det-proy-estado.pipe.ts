import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'detProyEstado'
})
export class DetProyEstadoPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case '0':
        return 'Incompleto'
      case '1':
        return 'Propio'
      case '2':
        return 'Vinculado'
      case '3':
        return 'Sin Data'
      default:
        return ''
    }
  }
}
