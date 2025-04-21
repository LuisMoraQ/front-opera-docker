import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'separador'
})
export class ReemplazarTextoPipe implements PipeTransform {

   async transform(insumo: string): Promise<string> {
    const array = insumo.split('|')
    const sepador = '  -  '
    let nuevoTexto: string = ''
    if (array.length > 0) {
      await array.reduce(async (a, texto, currentIndex) => {
        // Wait for the previous item to finish processing
        await a;
        if (currentIndex > 0) {
          nuevoTexto = nuevoTexto + sepador + texto
        } else {
          nuevoTexto = nuevoTexto + texto
        }
      }, Promise.resolve());
    }
    return nuevoTexto.toString()
  }

}
