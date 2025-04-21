import { ModalUnidadDeMedidaComponent } from './../modal-unidad-de-medida/modal-unidad-de-medida.component';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { MatSort } from '@angular/material/sort';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

@Component({
  selector: 'app-unidad-de-medida',
  templateUrl: './unidad-de-medida.component.html',
  styleUrls: ['./unidad-de-medida.component.scss']
})
export class UnidadDeMedidaComponent implements OnInit {
  @Input('height') height: number = 100;
  @Output() cargaCompleta2 = new EventEmitter<boolean>()
  busqueda = '';
  buscando: boolean = false;
  mostrar_carga = false;
  mostrar_carga_todo = false;
  fila_sel: any;
  id_user:any;
  displayedColumn: string[] = ['nro','id_unidad', 'unidad', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<any>();
  maximizar = false
  @Output() expanded  = new EventEmitter<boolean>()
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  constructor(
    private administradorService: AdministradorService,
    private modalService: NgbModal,
    private configuracionService: ConfiguracionService,
    private _EncriptadorService: EncriptadorService,
    ) { }

  async ngOnInit() {
    try {
      this.id_user = this._EncriptadorService.recuperarlocalstory('idusuario');
      await this.asignarbody()
      await this.listarUnidadesDeMedida()
    } catch (e) {
      SwalService.error()
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

  async listarUnidadesDeMedida() {
    const input = {
      id_usuario:this.id_user,
      fuente:0,
      activo: '',
      operador:0
    }
    this.buscando = true;
    this.dataSource.data = [];
    this.dataSource.data = await this.administradorService.listarUnidadMed(input)
    this.dataSource.sort = this.sort;
    this.buscando = false;
  }

  async openModal(datos = null, editar = null, ver = null) {
    try{
      // this.mostrar_carga = true
      let arrtipoInsumos = await this.configuracionService.listarTipoInsumo({ activo: 1, esinsumo: 1 })
      const modalRef = this.modalService.open(ModalUnidadDeMedidaComponent, {
        size: 'md',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false//no cerrar el modal con ESC
      })
      modalRef.componentInstance.editar = editar;
      modalRef.componentInstance.datos = datos;
      modalRef.componentInstance.ver = ver;
      modalRef.componentInstance.fuente = 0;
      modalRef.componentInstance.tipoInsumos = arrtipoInsumos;
      // this.mostrar_carga = false
      const result = await modalRef.result
      if (result === 'ok') {
        SwalService.success()
        await this.listarUnidadesDeMedida()
      }
    }
    catch (e){
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
      console.log('error',e)
    }
  }

  async eliminarUnidadDeMedida(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la Unidad de Medida  seleccionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarUnidadMedida = {
          id_unidad: row.id_unidad
        }
        const respuesta = await this.administradorService.eliminarUnidadMed(eliminarUnidadMedida)
        this.mostrar_carga_todo = false;
        if (respuesta.id == "0") {
          SwalService.error('Advertencia', respuesta.mensaje);
          await this.listarUnidadesDeMedida()
        }
        else {
          SwalService.success()
          await this.listarUnidadesDeMedida()
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }

  async expandir() {
    this.maximizar = !this.maximizar
    this.expanded.emit(this.maximizar)
  } 
}
