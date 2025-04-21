import { ModalClasificacionComercialComponent } from './../modal-clasificacion-comercial/modal-clasificacion-comercial.component';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
//import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { MatSort } from '@angular/material/sort';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

export interface tipoInsumo {
  activo: number;
  desc_tipo_insumo: string;
  id_tipo_insumo: number
}
@Component({
  selector: 'app-clasificacion-comercial',
  templateUrl: './clasificacion-comercial.component.html',
  styleUrls: ['./clasificacion-comercial.component.scss']
})
export class ClasificacionComercialComponent implements OnInit {
  @Input('height') height: number = 100;
  @Output() cargaCompleta = new EventEmitter<boolean>()
  busqueda = '';
  buscando: boolean = false;
  mostrar_carga = false;
  mostrar_carga_todo = false;
  fila_sel: any;
  tipoInsumos: tipoInsumo[] = [];
  displayedColumn: string[] = ['id_clasificacion', 'desc_clasi', 'abrev','desc_tipo_insumo', 'activo', 'acciones'];
  dataSource = [];
  datafil:any =[];
  maximizar = false
  iduser:any;
  @Output() expanded  = new EventEmitter<boolean>()
  @Input() fuentepasa:any;
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  constructor(private administradorService: AdministradorService,
    private configuracionService: ConfiguracionService,
    private encriptadorService: EncriptadorService,
    private modalService: NgbModal) { }

  async ngOnInit() {
    try {
      this.iduser = this.encriptadorService.recuperarlocalstory('idusuario');
      await this.listarTipoInsumo();
      await this.asignarbody()
      await this.listarClasificacionesComerciales()
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

  /* applyFilterPrinc(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  } */
  limpiarfiltro() {
    this.busqueda = '';
    /* if (this.busqueda == '')
      this.dataSource.filter = ""; */
  }
  cambiarTipoIns(idtipo: any) {
    if(idtipo===''){
      this.dataSource=this.datafil
    }
    else{
      this.dataSource = this.datafil.filter(x => x.id_tipo_insumo === parseInt(idtipo));
    }
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

  async listarClasificacionesComerciales() {
    const input = {
      activo: '',
      id_tipo_insumo:'',
      id_usuario:this.iduser,
      fuente: this.fuentepasa==1?'':this.fuentepasa
    }
    this.buscando = true;
    this.dataSource = [];
    let tablaaux=await this.administradorService.listarClasiInsumosData(input);
    this.dataSource = tablaaux;
    this.datafil=tablaaux;
    this.buscando = false;
  }
  async listarTipoInsumo() {
    this.tipoInsumos = []
    const activo = {
      activo: 1,
      esinsumo: 1
    }
    this.tipoInsumos = await this.configuracionService.listarTipoInsumo(activo)
  }
  async openModal(datos = null, editar = null, ver = null) {
    try{
      // this.mostrar_carga = true
      const modalRef = this.modalService.open(ModalClasificacionComercialComponent, {
        size: 'md',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false//no cerrar el modal con ESC
      })
      modalRef.componentInstance.editar = editar;
      modalRef.componentInstance.datos = datos;
      modalRef.componentInstance.ver = ver;
      modalRef.componentInstance.fuentepasa = this.fuentepasa;
      modalRef.componentInstance.tipoInsumos = this.tipoInsumos
      // this.mostrar_carga = false
      const result = await modalRef.result
      if (result) {
        SwalService.success()
        await this.listarClasificacionesComerciales()
      }
    }
    catch (e){
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
      console.log('error',e)
    }
  }

  async eliminarClasificacionComercial(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la Clasificacíon  seleccionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarClasificacion = {
          id_clasificacion: row.id_clasificacion
        }
        const respuesta = await this.administradorService.eliminarClasiInsumosData(eliminarClasificacion)
        this.mostrar_carga_todo = false;
        if (respuesta.id == "0") {
          SwalService.error('Advertencia', respuesta.mensaje);
          await this.listarClasificacionesComerciales()
        }
        else {
          SwalService.success()
          await this.listarClasificacionesComerciales()
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
