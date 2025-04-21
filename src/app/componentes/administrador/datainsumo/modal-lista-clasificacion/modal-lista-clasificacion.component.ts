import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from 'src/app/servicios/swal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalClasificacionComercialComponent } from '../../caracteristicas-insumo/modal-clasificacion-comercial/modal-clasificacion-comercial.component';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';

export interface clasificacionInsumo {
  abrev: string;
  abrev_tipo: string;
  activo: number;
  desc_clasi: string;
  desc_tipo_insumo: string;
  id_clasificacion: number;
  id_tipo_insumo: number;
}
@Component({
  selector: 'app-modal-lista-clasificacion',
  templateUrl: './modal-lista-clasificacion.component.html',
  styleUrls: ['./modal-lista-clasificacion.component.scss']
})
export class ModalListaClasificacionComponent implements OnInit {
  @Input('height') height: number = 100;
  @Input() tipoInsumos = []
  @Input() clasiInsumos = []
  @Input() tipoInsumo = ''
  @Input() id_user;
  @Input() fuentepasa;
  @Input() clasipresu=false;//mostrar un columna mas y reordenar el arreglo, agregando un parametro adicional
  @Input() clexiste=[];
  tipoInspasa=[];
  busqueda = ''
  dataSource = [];//new MatTableDataSource<any>();
  //displayedColumn: string[] = ['abrev', 'desc_clasi', 'fuente','desc_tipo_insumo','acciones'];
  fila_sel: any;
  seleccionado: any = null;
  mostrar_carga_todo = false;
  constructor(
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    private modalService: NgbModal,
    private configuracionService: ConfiguracionService,
    private administradorService: AdministradorService,
    ) { }

  async ngOnInit() {
    try {
      let resto = 220;
      this.height = window.innerHeight - resto;
      await this.cambioTipoInsumo()
      document.getElementById('inpbusq').focus();
    } catch (e) {
      SwalService.error(e)
    }
  }
  applyFilterPrinc(event: Event) {
    /* const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    } */
  }
  async cambioTipoInsumo() {
    this.dataSource = []
    // this.buscando = true
    if (this.tipoInsumo) {
      this.dataSource = await this.clasiInsumos.filter(clasificacion => clasificacion.id_tipo_insumo == this.tipoInsumo)
    } else {
      this.dataSource = this.clasiInsumos;
    }

    if(this.clasipresu && this.clexiste.length>0){//reordenar con los que existe
      for(let row of this.dataSource){
        row.existe=0;
        for(let a=0;a<this.clexiste.length;a++){
          if(row.id_clasificacion==this.clexiste[a].id_clasificacion){
            row.existe=1;
            this.clexiste.splice(a,1);
            break;
          }
        }
      }
      this.dataSource.sort( (a, b) => {
        if (b.existe < a.existe) {
          return -1;
        }
        if (b.existe > a.existe) {
          return 1;
        }
        if(a.descripcion < b.descripcion) {
          return -1;
        }
        if(a.id_tipo_insumo > b.id_tipo_insumo) {
          return 1;
        }
        return 0;
      });
    }
    // this.buscando = false
  }
  async seleccionarTipo(row = null) {
    if (this.seleccionado) {
      const objeto = {
        id_tipo: this.seleccionado.id_tipo_insumo,
        id_clasificacion: this.seleccionado.id_clasificacion,
        desc_clasi:this.seleccionado.desc_clasi
      }
      this.closeModal(objeto)
    } else {
      this.toaster.error('Ninguna Clasificación Comercial Seleccionada', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return
    }

  }
  limpiarfiltro() {
    this.busqueda = '';
    /* if (this.busqueda == '')
      this.dataSource.filter = ""; */
  }

  cambindicesel(ind: any, row) {
    if (ind == this.fila_sel) {
      this.fila_sel = -1;
      this.seleccionado = null
    } else {
      this.fila_sel = ind;
      this.seleccionado = row
    }
  }

  closeModal(result: any = null) {
    this.modal.close(result)
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async listarTipoInsumo() {
    const activo = { activo: 1 }
    this.tipoInspasa = await this.configuracionService.listarTipoInsumo(activo)
  }
  async openModal() {
    try{
      // this.mostrar_carga = true
      await this.listarTipoInsumo();
      const modalRef = this.modalService.open(ModalClasificacionComercialComponent, { size: 'md',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
      modalRef.componentInstance.editar = false;
      /* modalRef.componentInstance.datos = datos; */
      modalRef.componentInstance.bloqtipo = true;
      modalRef.componentInstance.fuentepasa = this.fuentepasa;
      modalRef.componentInstance.tipoInsumos = this.tipoInspasa
      modalRef.componentInstance.insumosel=this.tipoInsumo;
      modalRef.componentInstance.id_user=this.id_user;
      // this.mostrar_carga = false
      const result = await modalRef.result
      if (result) {
        SwalService.success()
        //await this.listarClasificacionesComerciales()
        //cerrar modal y seleccionar?
        const objeto = {
          id_tipo: result.id_tipo,
          id_clasificacion: result.id_clasificacion,
          desc_clasi:result.desc_clasi
        }
        this.closeModal(objeto)
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
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminará:  ' + row.desc_clasi)
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarClasificacion = {
          id_clasificacion: row.id_clasificacion
        }
        const respuesta = await this.administradorService.eliminarClasiInsumosData(eliminarClasificacion)
        if (respuesta.id == "1") {
          SwalService.success()
          await this.listarClasificacionInsumo()
          await this.cambioTipoInsumo()
        } else {
          SwalService.error('Advertencia', respuesta.mensaje);
          // await this.listarClasificacionesComerciales()
        }
        this.mostrar_carga_todo=false;
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
  async listarClasificacionInsumo() {
    this.clasiInsumos = []
    const activo = {
      activo: 1,
      id_tipo_insumo:'',
      id_usuario:this.id_user,
      fuente:this.fuentepasa==0?0:''
    }
    this.clasiInsumos = await this.administradorService.listarClasiInsumosData(activo)
    //this.clasiInsumosFiltrado = await this.clasiInsumos.filter(clasificacion => clasificacion.id_tipo_insumo == this.id_tipo.value)
  }
  async editarclasi(row){
    try{
      // this.mostrar_carga = true
      await this.listarTipoInsumo();
      const modalRef = this.modalService.open(ModalClasificacionComercialComponent, { size: 'md',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
      modalRef.componentInstance.editar = true;
      modalRef.componentInstance.datos = row;
      modalRef.componentInstance.bloqtipo = true;
      modalRef.componentInstance.fuentepasa = this.fuentepasa;
      modalRef.componentInstance.tipoInsumos = this.tipoInspasa
      modalRef.componentInstance.insumosel=this.tipoInsumo;
      modalRef.componentInstance.id_user=this.id_user;
      // this.mostrar_carga = false
      const result = await modalRef.result
      if (result) {
        SwalService.success();
        await this.listarClasificacionInsumo();
        await this.cambioTipoInsumo();
        for(let i=0;i<this.dataSource.length;i++){
          if(this.dataSource[i].id_clasificacion==row.id_clasificacion){
            this.fila_sel=i;
          }
        }
        //cerrar modal y seleccionar?
        /* const objeto = {
          id_tipo: result.id_tipo,
          id_clasificacion: result.id_clasificacion
        }
        this.closeModal(objeto) */
      }
    }
    catch (e){
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
      console.log('error',e)
    }
  }
}
