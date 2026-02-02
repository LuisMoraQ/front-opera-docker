import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroTablaCol'
})
export class FiltroTablaColPipe implements PipeTransform {
  transform(items: any[], termino: string, columnas: string[] = []): any[] {
    if (!items || !termino || termino.trim() === '') {
      return items;
    }
    
    const searchTerm = termino.toLowerCase().trim();
    
    // Si no se especifican columnas, buscar en todas las propiedades
    if (columnas.length === 0) {
      return items.filter(item => {
        // Buscar en todas las propiedades del objeto
        return Object.keys(item).some(key => {
          const value = item[key];
          return value && value.toString().toLowerCase().includes(searchTerm);
        });
      });
    }
    
    // Filtrar solo por las columnas especificadas
    return items.filter(item => {
      return columnas.some(columna => {
        const value = item[columna];
        return value && value.toString().toLowerCase().includes(searchTerm);
      });
    });
  }

}
