import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroNiveles', pure: false
})
export class FiltroNivelesPipe implements PipeTransform {
  transform(data: Array<any>, searchTxt: string, camposBusqueda: string[] = ['item', 'descripcion']): Array<any> {
    // Si no hay datos o no hay texto de búsqueda, retornar todos los datos
    if (!data || data.length === 0 || !searchTxt || searchTxt.trim() === '') {
      return data || [];
    }

    const searchLower = searchTxt.toLowerCase().trim();
    const resultado = new Set<any>(); // Para evitar duplicados

    // Función para verificar si un elemento coincide con la búsqueda
    const coincide = (element: any): boolean => {
      if (!element) return false;

      // Si tiene mostrar: 0, no considerarlo
      if (element.mostrar === 0) return false;

      // Buscar en los campos especificados
      for (const campo of camposBusqueda) {
        const valor = element[campo];
        if (valor && valor.toString().toLowerCase().includes(searchLower)) {
          return true;
        }
      }
      return false;
    };

    // Función para obtener el padre de un item (ej: "1.1.1" -> "1.1")
    const getPadre = (item: string): string => {
      if (!item) return '';
      const partes = item.toString().split('.');
      if (partes.length <= 1) return '';
      return partes.slice(0, -1).join('.');
    };

    // Función para obtener todos los padres de un item (incluyendo el mismo)
    const obtenerPadres = (item: string): string[] => {
      const padres: string[] = [];
      let actual = item;

      while (actual && actual !== '') {
        padres.unshift(actual); // Agregar al inicio para mantener orden
        actual = getPadre(actual);
      }

      return padres;
    };

    // Función para buscar un elemento por su item
    const buscarPorItem = (itemBuscado: string): any => {
      if (!itemBuscado) return null;
      return data.find(el => el && el.item && el.item.toString() === itemBuscado);
    };

    // 1. Encontrar todos los elementos que coinciden con la búsqueda
    const elementosCoincidentes = data.filter(el => coincide(el));

    // 2. Para cada elemento coincidente, agregar él y todos sus padres
    for (const elemento of elementosCoincidentes) {
      if (!elemento || !elemento.item) continue;

      const itemStr = elemento.item.toString();
      const padres = obtenerPadres(itemStr);

      // Agregar todos los padres
      for (const itemPadre of padres) {
        const elementoPadre = buscarPorItem(itemPadre);
        if (elementoPadre) {
          resultado.add(elementoPadre);
        }
      }
    }

    // 3. Retornar los elementos en el orden original
    return data.filter(el => resultado.has(el));
  }

}
