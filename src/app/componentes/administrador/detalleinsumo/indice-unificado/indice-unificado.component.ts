import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { MatSort } from '@angular/material/sort';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalIndiceUnificadoComponent } from '../modal-indice-unificado/modal-indice-unificado.component';
import { SwalService } from 'src/app/servicios/swal.service';
@Component({
  selector: 'app-indice-unificado',
  templateUrl: './indice-unificado.component.html',
  styleUrls: ['./indice-unificado.component.scss']
})
export class IndiceUnificadoComponent implements OnInit {
  @Input('height') height: number = 200;
  @Output() cargaCompleta2 = new EventEmitter<boolean>()
  buscando = false;
  displayedColumn: string[] = ['id_indice', 'desc_indice','abrev','activo', 'acciones'];
  fila_sel: any;
  dataSource = new MatTableDataSource<any>();
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  constructor(private configuracionService: ConfiguracionService,
    private modalService: NgbModal) { }
  busqueda = '';
  maximizar = false
  @Output() expanded  = new EventEmitter<boolean>()
  async ngOnInit() {
    try {
      /* this.cargaCompleta2.emit(true); */
      this.dataSource.data = [];
      await this.asignarbody()
      await this.listarIndicesUnificados()
      this.dataSource.sort = this.sort;
      /* this.cargaCompleta2.emit(false); */
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

  async listarIndicesUnificados() {
    this.buscando = true;
    this.dataSource.data = [];
    this.dataSource.data = await this.configuracionService.listarIndiceUnificados()
    this.buscando = false;

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
      const modalRef = this.modalService.open(ModalIndiceUnificadoComponent, {
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
        await this.listarIndicesUnificados()
      }
    }
    catch (e){
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
      console.log('error',e)
    }
  }

  async eliminar(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el indice unificado seleccionado')
      if (sw.isConfirmed) {
        this.cargaCompleta2.emit(true);
        const respuesta=await this.configuracionService.eliminarIndiceUnificado({ id_indice: row.id_indice })
        this.cargaCompleta2.emit(false);
        if(respuesta[0].id=="1"){
          SwalService.success()
          await this.listarIndicesUnificados()
        }
        else{
          SwalService.error('Advertencia',respuesta[0].mensaje)
          await this.listarIndicesUnificados()
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
