import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalService } from './../../../../servicios/swal.service';
import { ModalUnidadDeMedidaComponent } from 'src/app/componentes/administrador/caracteristicas-insumo/modal-unidad-de-medida/modal-unidad-de-medida.component';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-buscaaddunidadmed',
  templateUrl: './buscaaddunidadmed.component.html',
  styleUrls: ['./buscaaddunidadmed.component.scss']
})
export class BuscaaddunidadmedComponent implements OnInit {
  @Input() Listaunidades = []
  @Input() operador = 0;
  @Input() esinsumo = 0;
  @Input() tipoinsumo;
  @Input() fuentepasa=1;
  @Input() iduser:any;
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  busqueda = '';
  buscando = false
  actarray=false;
  displayedColumn: string[] = ['indice', 'unidad', 'descripcion'];
  fila_sel: any;
  dataSource = new MatTableDataSource<any>();
  seleccionado: any = null;

  constructor(
    private configuracionService: ConfiguracionService,
    private modal: NgbActiveModal,
    private modalService: NgbModal,
    private adminservice: AdministradorService,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService,
  ) { }

  ngOnInit(): void {
    try {
      this.iduser = this.iduser??this.encriptadorService.recuperarlocalstory('idusuario');
      this.dataSource.data = this.Listaunidades;
      // await this.asignarbody()
      // await this.listarIndicesUnificados()
      document.getElementById('inpbusq')?.focus();
      this.dataSource.sort = this.sort;
    } catch (e) {
      SwalService.error()
    }
  }
  async seleccionar(row = null) {
    if(row){
      let datoSelecccionado
      if (row) {
        datoSelecccionado = row
      } else {
        datoSelecccionado = this.seleccionado
      }
      let objret={
        datosel:datoSelecccionado,
        actarray:this.actarray,
        tablaact:this.dataSource.data
      }
      this.modal.close(objret)
    }
    else{
      if(this.fila_sel!=-1){
        let objret={
          datosel:this.dataSource.data[this.fila_sel],
          actarray:this.actarray,
          tablaact:this.dataSource.data
        }
        this.modal.close(objret)
      }
      else{
        this.toaster.error('No selecciono una unidad en la tabla.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
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
    this.modal.close()
  }
  async openNuevo(){
    try{
      // this.mostrar_carga = true
      let arrtipoInsumos = await this.configuracionService.listarTipoInsumo({ activo: 1, esinsumo: 1 })
      const modalRef = this.modalService.open(ModalUnidadDeMedidaComponent, { size: 'md',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
      modalRef.componentInstance.editar = false;
      modalRef.componentInstance.datos = null;
      modalRef.componentInstance.ver = false;
      modalRef.componentInstance.fuente = this.fuentepasa;
      modalRef.componentInstance.tipoInsumos = arrtipoInsumos;
      modalRef.componentInstance.id_user = this.iduser;
      // this.mostrar_carga = false
      const result = await modalRef.result
      if (result === 'ok') {
        SwalService.success()
        this.actarray=true;
        this.listarMedidas();
      }
    }
    catch (e){
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
      console.log('error',e)
    }
  }
  async listarMedidas(){
    if(this.esinsumo==1){
      this.dataSource.data = await this.adminservice.listarUnidadMedxtipo({
        id_usuario:this.iduser,
        tipo_insumo:this.tipoinsumo
      })
    }
    else{
      this.dataSource.data = await this.adminservice.listarUnidadMed({
        id_usuario:this.iduser,
        fuente:this.fuentepasa==0?0:'',
        activo: 1,
        operador:this.operador
      })
    }
  }
}
