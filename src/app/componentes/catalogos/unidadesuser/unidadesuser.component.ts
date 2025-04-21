import { Component, OnInit, Input, HostListener, ViewChild,Output,EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { MatSort } from '@angular/material/sort';
import { ModalUnidadDeMedidaComponent } from '../../administrador/caracteristicas-insumo/modal-unidad-de-medida/modal-unidad-de-medida.component';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';

@Component({
  selector: 'app-unidadesuser',
  templateUrl: './unidadesuser.component.html',
  styleUrls: ['./unidadesuser.component.scss']
})
export class UnidadesuserComponent implements OnInit {
  @Input('height') height: number = 100;
  busqueda = '';
  busqueda2 = '';
  buscando: boolean = false;
  buscando2: boolean = false;
  mostrar_carga = false;
  mostrar_carga_todo = false;
  fila_sel: any;
  fila_sel2: any;
  displayedColumn: string[] = ['nro', 'unidad','descripcion', 'activo', 'acciones'];
  dataSource = [];
  dataSource2 = new MatTableDataSource<any>();
  maximizar = false;
  id_user:any;

  @Output() expanded  = new EventEmitter<boolean>()

  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  @ViewChild('table2', { read: MatSort, static: true }) sort2: MatSort;

  constructor(
    private administradorService: AdministradorService,
    private modalService: NgbModal,
    private _EncriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
  ) { }

  async ngOnInit() {
    try {
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

      this.id_user = this._EncriptadorService.recuperarlocalstory('idusuario');

      await this.listarUnidadesDeMedida()
      /* await this.listarUnidadesDeMedida2() */
    } catch (e) {
      SwalService.error()
      console.log(e);
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
  /* applyFilterPrinc(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  } */
  applyFilterPrinc2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
  }
  limpiarfiltro() {
    this.busqueda = '';
    /* if (this.busqueda == '')
      this.dataSource.filter = ""; */
  }
  limpiarfiltro2() {
    this.busqueda2 = '';
    if (this.busqueda2 == '')
      this.dataSource2.filter = "";
  }
  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }
  cambindicesel2(ind: any) {
    if (ind == this.fila_sel2)
      this.fila_sel2 = -1;
    else
      this.fila_sel2 = ind;
  }

  async listarUnidadesDeMedida() {
    const input = {
      id_usuario:this.id_user,
      fuente:'',
      activo: '',
      operador:0
    }
    this.buscando = true;
    this.dataSource = [];
    this.dataSource = await this.administradorService.listarUnidadMed(input)
    this.buscando = false;
  }
  async listarUnidadesDeMedida2() {
    const input = {
      id_usuario:this.id_user,
      fuente:0,
      activo: '',
      operador:0
    }
    this.buscando2 = true;
    this.dataSource2.data = [];
    this.dataSource2.data = await this.administradorService.listarUnidadMed(input)
    this.dataSource2.sort = this.sort2;
    this.buscando2 = false;
  }
  async openModal(fuente:any,datos = null, editar = null, ver = null) {
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
      modalRef.componentInstance.fuente = fuente;
      modalRef.componentInstance.tipoInsumos = arrtipoInsumos;
      // this.mostrar_carga = false
      const result = await modalRef.result
      if (result === 'ok') {
        SwalService.success()
        if(fuente==1){
          await this.listarUnidadesDeMedida()
        }
        else{
          await this.listarUnidadesDeMedida2()
        }
      }
    }
    catch (e){
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
      console.log('error',e)
    }
  }
  async eliminarUnidadDeMedida(fuente,row) {
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
          if(fuente==1){
            await this.listarUnidadesDeMedida()
          }
          else
            await this.listarUnidadesDeMedida2()
        }
        else {
          SwalService.success()
          if(fuente==1){
          await this.listarUnidadesDeMedida()
          }
          else
            await this.listarUnidadesDeMedida2()
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  async expandir() {
    this.maximizar = !this.maximizar
    this.expanded.emit(this.maximizar)
  } 
}
