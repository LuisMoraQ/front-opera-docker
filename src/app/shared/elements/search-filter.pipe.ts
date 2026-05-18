import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
  pure: false
})
export class SearchFilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      return (
        (item.area_descripcion && item.area_descripcion.toLowerCase().includes(searchText)) ||
        (item.cargo_descripcion && item.cargo_descripcion.toLowerCase().includes(searchText)) ||
        (item.fecha_inicio && this.formatDate(item.fecha_inicio).includes(searchText)) ||
        (item.fecha_fin && this.formatDate(item.fecha_fin).includes(searchText)) ||
        (item.fecha_registro && this.formatDateTime(item.fecha_registro).includes(searchText))
      );
    });
  }

  private formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  }

  private formatDateTime(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const hours = d.getHours() % 12 || 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
    return `${this.formatDate(date)} ${hours}:${minutes} ${ampm}`;
  }


}
