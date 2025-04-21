import { ModalTipoInsumoComponent } from './../modal-tipo-insumo/modal-tipo-insumo.component';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-tipo-insumo',
  templateUrl: './tipo-insumo.component.html',
  styleUrls: ['./tipo-insumo.component.scss']
})
export class TipoInsumoComponent implements OnInit {
  @Input('height') height: number = 100;
  @Output() cargaCompleta = new EventEmitter<boolean>()
  buscando = false;
  displayedColumn: string[] = ['id_tipo_insumo', 'desc_tipo_insumo','abrev', 'activo', 'acciones'];
  fila_sel: any;
  dataSource = new MatTableDataSource<any>();
  maximizar = false
  @Output() expanded  = new EventEmitter<boolean>()
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  constructor(private configuracionService: ConfiguracionService,
    private modalService: NgbModal,
    private swalService: SwalService) { }
  busqueda = '';
 
  async ngOnInit() {
    try {
      /* this.cargaCompleta.emit(true); */
      await this.asignarbody()
      await this.listarTipoInsumo()
      /* this.cargaCompleta.emit(false); */
    } catch (e) {
      console.log(e);
    }
  }

  async asignarbody() {
    var resto = 200;
    if (document.body.clientWidth <= 992) {
      resto = 220;
      if (document.body.clientWidth <= 768) {
        this.height = (window.innerHeight - resto) / 2;
      } else {
        this.height = window.innerHeight - resto;
      }
    } else {
      this.height = window.innerHeight - resto;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 200;
    if (document.body.clientWidth <= 992) {
      resto = 220;
      if (document.body.clientWidth <= 768) {
        this.height = (window.innerHeight - resto) / 2;
      } else {
        this.height = window.innerHeight - resto;
      }
    } else {
      this.height = window.innerHeight - resto;
    }
  }

  async listarTipoInsumo() {
    this.buscando = true
    this.dataSource.data = []
    this.dataSource.data = await this.configuracionService.listarTipoInsumo()
    this.dataSource.sort = this.sort;
    this.buscando = false
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

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }

  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }

  async openModal(datos = null, editar = null, ver = null) {
    try{
      const modalRef = this.modalService.open(ModalTipoInsumoComponent, {
        size: 'md',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false//no cerrar el modal con ESC
      })
      modalRef.componentInstance.editar = editar
      modalRef.componentInstance.datos = datos
      modalRef.componentInstance.ver = ver
      const result = await modalRef.result
      if (result === 'ok') {
        SwalService.success()
        await this.listarTipoInsumo()
      }
    }
    catch (e){
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
    }
  }

  async eliminar(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el tipo insumo seleccionado')
      if (sw.isConfirmed) {
        this.cargaCompleta.emit(true);
        const respuesta=await this.configuracionService.eliminarTipoInsumo({ id_tipo_insumo: row.id_tipo_insumo })
        this.cargaCompleta.emit(false);
        if(respuesta[0].id=="0"){
          SwalService.error('Advertencia',respuesta[0].mensaje);
          await this.listarTipoInsumo()
        }
        else{
          SwalService.success()
          await this.listarTipoInsumo()
        }
      }
    } catch (err) {
      SwalService.error(err)
    }
  }
  async expandir() {
    this.maximizar = !this.maximizar
    this.expanded.emit(this.maximizar)
  } 
}
