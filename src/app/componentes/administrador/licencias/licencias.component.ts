import { ModalLicenciaComponent } from './modal-licencia/modal-licencia.component';
import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-licencias',
  templateUrl: './licencias.component.html',
  styleUrls: ['./licencias.component.scss']
})
export class LicenciasComponent implements OnInit {
  @Input('height') height: number = 100;
  busqueda = ''
  buscando: boolean = false;
  fila_sel: any
  mostrar_carga_todo = false;
  mostrar_carga = false
  displayedColumn: string[] = ['id_licencia', 'desc_licencia', 'abrev', 'limitado', 'precio', 'tiempo', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('table', { read: MatSort, static: true }) sort: MatSort;
  busqueda2=''
  dataSource2=[]
  fila_sel2=-1
  buscando2=false
  notsel=null
  estnot=false
  opcver=false
  titmodal=''
  @ViewChild("modalEditarNot") modalEditnot: ModalBasicComponent;
  formNoti = new UntypedFormGroup({
    id_noti: new UntypedFormControl(''),
    titulo: new UntypedFormControl('', [Validators.required]),
    mensaje: new UntypedFormControl('', [Validators.required]),
    icono: new UntypedFormControl(''),
    estado: new UntypedFormControl('2', [Validators.required]),
    id_usuario: new UntypedFormControl(''),
  })
  get id_noti(): UntypedFormControl { return this.formNoti.get('id_noti') as UntypedFormControl }
  get titulo(): UntypedFormControl { return this.formNoti.get('titulo') as UntypedFormControl }
  get mensaje(): UntypedFormControl { return this.formNoti.get('mensaje') as UntypedFormControl }
  get icono(): UntypedFormControl { return this.formNoti.get('icono') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formNoti.get('estado') as UntypedFormControl }
  get id_usuario(): UntypedFormControl { return this.formNoti.get('id_usuario') as UntypedFormControl }
  constructor(private modalService: NgbModal,
    private configuracionService: ConfiguracionService,
    private toaster: ToastrService,
    private administradorService: AdministradorService) { }

  async ngOnInit() {
    try {
      var resto =document.body.clientWidth <= 992?220:200;
      this.height = window.innerHeight - resto;
      await this.listarLicencias()
      await this.listarNotif();
    } catch (e) {
      SwalService.error()
      console.log(e);
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = document.body.clientWidth <= 992?220:200;
    this.height = window.innerHeight - resto;
  }
  async listarTiposUsuario() {
    const response = await this.configuracionService.ListarTiposUsuarios2({estado:'1'})
    return response
  }
  async listarLicencias() {
    try {
      this.buscando = true
      this.dataSource.data = []
      this.dataSource.data = await this.administradorService.listarLicencias({estado: ''})
      this.dataSource.sort = this.sort;
      this.buscando = false
    } catch (e) {
      SwalService.error()
      console.log(e);
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

  async openModal(datos = null, editar = null, ver = null) {
    try{
      this.mostrar_carga_todo = true
      const tiposUsuarios = await this.listarTiposUsuario()
      const tabla = await this.recuperarTabla(datos?.id_licencia, tiposUsuarios)
      const modalRef = this.modalService.open(ModalLicenciaComponent, { size: 'md',backdrop: 'static',windowClass: 'pcoded', keyboard: false })
      modalRef.componentInstance.editar = editar
      modalRef.componentInstance.datos = datos
      modalRef.componentInstance.tabla = tabla
      modalRef.componentInstance.ver = ver
      modalRef.componentInstance.tiposUsuarios = tiposUsuarios
      // modalRef.componentInstance.tipoInsumos = this.tipoInsumos
      this.mostrar_carga_todo = false
      const result = await modalRef.result
      if (result === 'ok') {
        SwalService.success()
        await this.listarLicencias()
      }
    }
    catch(e){
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
      console.log('error',e)
    }
  }

  async recuperarTabla(idLicencia, tiposUsuarios) {
    let response = []
    if (idLicencia) {
      const input = {
        id_licencia: idLicencia
      }
      response = await this.administradorService.listarDetalleLicencia(input)
    }
    let arrayTabla = []
    tiposUsuarios.map(tipo => {
      let objeto
      const siExiste = response.filter(detalle => detalle.id_tipo == tipo.id_tipo)
      if (siExiste[0]) {
        objeto = {
          id_tipo: siExiste[0].id_tipo,
          nombre: siExiste[0].nom_tipo,
          cantidad: siExiste[0].cantidad,
          principal: siExiste[0].principal,
          edpresu: siExiste[0].edpresu
        }
      } else {
        objeto = {
          id_tipo: tipo.id_tipo,
          nombre: tipo.nom_tipo,
          cantidad: 0,
          principal: 0,
          edpresu:0
        }
      }
      arrayTabla.push(objeto)
    })
    return arrayTabla
  }
  async eliminarLicencia(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la Licencia seleccionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarlicencia = {
          id_licencia: row.id_licencia
        }
        const respuesta = await this.administradorService.eliminarLicencia(eliminarlicencia)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == "0") {
          SwalService.error('Advertencia', respuesta[0].mensaje);
          await this.listarLicencias()
        }
        else {
          SwalService.success('Correcto',respuesta[0].mensaje)
          await this.listarLicencias()
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
  //notificaciones
  async listarNotif(){
    try {
      this.buscando2 = true
      this.dataSource2 = []
      let resp= await this.administradorService.listarNotif({todo:1})
      this.dataSource2=resp;
      this.buscando2 = false
    } catch (e) {
      this.dataSource2=[]
      SwalService.error()
      console.log(e);
    }
  }
  limpiarfiltro2(){
    this.busqueda = '';
  }
  cambindicesel2(ind:any){
    if (ind == this.fila_sel2)
      this.fila_sel2 = -1;
    else
      this.fila_sel2 = ind;
  }
  openModal2(rowsel:any,edita:boolean){
    if(rowsel){
      if(!edita){
        this.notsel=rowsel
        this.estnot=rowsel.estado
        this.opcver=true;
        this.titmodal='Ver Notificación'
      }
      else{
        this.titmodal='Editar Notificación'
        //cargar datos del registro
        this.id_noti.setValue(rowsel.id_noti)
        this.titulo.setValue(rowsel.titulo)
        this.mensaje.setValue(rowsel.mensaje)
        this.icono.setValue(rowsel.icono??'')
        this.estado.setValue(rowsel.estado)
        this.id_usuario.setValue(rowsel.id_usuario)
      }
    }
    else{
      this.titmodal='Nueva Notificación'
    }
    this.modalEditnot.show();
  }
  cerrarModal(){
    this.modalEditnot.hide();
    this.notsel=null;
    this.opcver=false
    //limpiar elementos
    this.formNoti.reset({
      id_noti: '',
      titulo: '',
      mensaje: '',
      icono: '',
      estado: '2',
      id_usuario: '',
    })
  }
  async guardarModal(){
    if(!this.formNoti.invalid){
      this.mostrar_carga_todo=true;
      const params = {
        id_noti: this.id_noti.value,
        titulo: this.titulo.value,
        mensaje: this.mensaje.value,
        icono:this.icono.value,
        estado:this.estado.value,
      }
      let res= await this.administradorService.guardarNotif(params);
      this.mostrar_carga_todo=false;
      if(res?.id=='1'){
        this.cerrarModal();
        this.toaster.success('La operación se realizo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        this.listarNotif();
      }
      else{
        await SwalService.error('Advertencia','No se encontro los datos del usuario.');
      }
    }
    else{
      this.formNoti.markAllAsTouched();
      this.toaster.error('Debe llenar los campos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }
  async eliminar2(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminará la Notificación seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const respuesta = await this.administradorService.eliminarNotif({id_noti:row.id_noti,estado:row.estado})
        this.mostrar_carga_todo = false;
        if (respuesta?.id == "1") {
          this.toaster.success('La operación se realizo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          this.listarNotif();
        } else {
          SwalService.error('Advertencia', respuesta[0].mensaje);  
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
}

