import { SwalService } from './../../../../servicios/swal.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { MatSort } from '@angular/material/sort';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-indice-lista',
  templateUrl: './modal-indice-lista.component.html',
  styleUrls: ['./modal-indice-lista.component.scss']
})
export class ModalIndiceListaComponent implements OnInit {
  @Input('height') height: number = 500;
  @Input() tiposIndice = []
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  busqueda = '';
  buscando = false
  displayedColumn: string[] = ['id_indice', 'desc_indice', 'activo'];
  fila_sel: any;
  dataSource = new MatTableDataSource<any>();
  seleccionado: any = null;
  constructor(private configuracionService: ConfiguracionService,
    private modal: NgbActiveModal) { }

  async ngOnInit() {
    try {
      this.dataSource.data = this.tiposIndice;
      // await this.asignarbody()
      // await this.listarIndicesUnificados()
      document.getElementById('inpbusq').focus();
      this.dataSource.sort = this.sort;
    } catch (e) {
      SwalService.error()
    }
  }

  // async listarIndicesUnificados() {
  //   this.buscando = true;
  //   this.dataSource.data = [];
  //   this.dataSource.data = await this.configuracionService.listarIndiceUnificados()
  //   this.buscando = false;
  // }

  async seleccionarIndice(row = null) {
    let datoSelecccionado
    if (row) {
      datoSelecccionado = row
    } else {
      datoSelecccionado = this.seleccionado
    }
    this.modal.close(datoSelecccionado)
  }

  applyFilterPrinc(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  limpiarfiltro() {
    this.busqueda = '';
    if (this.busqueda == '')
      this.dataSource.filter = "";
  }

  cambindicesel(ind: any, row) {
    this.seleccionado = row
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }

  closeModal(result: any = null) {
    console.log('cerrar');
    
    this.modal.close(result)
  }
}
