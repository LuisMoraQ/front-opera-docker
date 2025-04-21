import { Component, OnInit, Input, HostListener, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { ModalMantusuarioComponent } from './modal-mantusuario/modal-mantusuario.component';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { FormsService } from 'src/app/servicios/forms.service';
import { SignalrcustomService } from 'src/app/servicios/signalrcustom.service';
export interface filaMantenimientoUsuario {
  id_usuario: string;
  id_admin:string;
  nombres: string;
  telefono: string;
  correo: string;
  id_tipo: number;
  nom_tipo:string;
  genero:string;
  fechaasig: string;
  fechacul: string;
  id_licencia:string;
  estado: number;
  principal:string;
  mostrar:any;
  icomost:any;
}

@Component({
  selector: 'app-manteusuarios',
  templateUrl: './manteusuarios.component.html',
  styleUrls: ['./manteusuarios.component.scss']
})
export class ManteusuariosComponent implements OnInit {
  @ViewChild("modalRenovaLic") modalRenLic: ModalBasicComponent;
  fechahoy: any;
  mostrar_carga = false;
  mostrar_carga_todo=false;
  departamentos = [];
  tiposusuario=[];
  licencias=[];
  busqueda:any;
  padresbusq=[];
  tipoDocumentos = [
    { id: 0, nombre: 'DNI' },
    { id: 1, nombre: 'CARNET EXTRANJERIA' },
    { id: 2, nombre: 'PASAPORTE' },
    { id: 3, nombre: 'OTROS' }
  ];
  buscando1 = false;
  filaorg_sel: any;
  @Input('height') height: number = 100;
  displayedColumnorg: string[] = ['id_usuario', 'nombres', 'telefono', 'correo', 'fechaasig', 'fechacul', 'estado', 'licencia','id_tipo', 'acciones'];
  dataSourceorg = new MatTableDataSource<filaMantenimientoUsuario>();
  @ViewChild('table1', { read: MatSort, static: true }) sort1: MatSort;
  formUsuario = new UntypedFormGroup({
    id_usuario: new UntypedFormControl('', []),
    id_licencia: new UntypedFormControl('', []),
    limitado: new UntypedFormControl('', []),
    nombres: new UntypedFormControl('', []),
    fechaasig: new UntypedFormControl('', []),
    fechaculm: new UntypedFormControl('', []),
    tiempo:new UntypedFormControl(''),
    nuevaasig: new UntypedFormControl(''),
    nuevaculm: new UntypedFormControl(''),
    restante: new UntypedFormControl(''),
    tiempolic: new UntypedFormControl(''),
    /* fechaasig: new FormControl(''), */
  })
  datosUsuarioDetalle: any;
  licant='';
  iduser='';
  get mid_usuario(): UntypedFormControl { return this.formUsuario.get('id_usuario') as UntypedFormControl }
  get mid_licencia(): UntypedFormControl { return this.formUsuario.get('id_licencia') as UntypedFormControl }
  get mlimitado(): UntypedFormControl { return this.formUsuario.get('limitado') as UntypedFormControl }
  get mnombres(): UntypedFormControl { return this.formUsuario.get('nombres') as UntypedFormControl }
  get mfechaasig(): UntypedFormControl { return this.formUsuario.get('fechaasig') as UntypedFormControl }
  get mfechaculm(): UntypedFormControl { return this.formUsuario.get('fechaculm') as UntypedFormControl }
  get mtiempo(): UntypedFormControl { return this.formUsuario.get('tiempo') as UntypedFormControl }
  get mnuevaasig(): UntypedFormControl { return this.formUsuario.get('nuevaasig') as UntypedFormControl }
  get mnuevaculm(): UntypedFormControl { return this.formUsuario.get('nuevaculm') as UntypedFormControl }
  get mrestante(): UntypedFormControl { return this.formUsuario.get('restante') as UntypedFormControl }
  get mtiempolic(): UntypedFormControl { return this.formUsuario.get('tiempolic') as UntypedFormControl }
  /* get tipoUser(): FormControl { return this.formUsuario.get('tipoUser') as FormControl } */
  
  constructor(
    private modalService: NgbModal,
    private toaster: ToastrService,
    private configuracionService: ConfiguracionService,
    public _EncriptadorService: EncriptadorService,
    public formsService: FormsService,
    private _SignalrcustomService: SignalrcustomService,
  ) { }

  async ngOnInit() {
    try {
      var resto = 200;
      if (document.body.clientWidth <= 992)
        resto = 220;
      this.height = window.innerHeight - resto;

      this.iduser = this._EncriptadorService.recuperarlocalstory('idusuario');
      let res = await this._EncriptadorService.FechaActualBack();
      if (res.id == 1) {
        this.fechahoy = new Date(res.mensaje);
      }

      /* this.dataSourceorg.filterPredicate = function (record:filaMantenimientoUsuario,filter) {
        if(record.principal=='1' &&(record.nombres.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) || record.telefono?.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) || record.correo?.toLocaleLowerCase().includes(filter.toLocaleLowerCase()))){
          return true;
        }
        if(record.principal=='0'){
          return true;
        }
      } */
      this.dataSourceorg.filterPredicate = this.filterBySubject();

      /* SwalService.warningBlock() */
      await this.listarMantenimientoUsuarios()
      /* SwalService.closeAlert() */
    } catch (e) {
      console.log(e)
      SwalService.error()
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceorg.filter = filterValue.trim().toUpperCase();
  }
  filterBySubject() {
    let filterFunction = 
        (record: filaMantenimientoUsuario, filter: string): boolean => {
          if(record.principal=='1' && (record.nombres.toLocaleLowerCase().includes(filter.toLocaleLowerCase())/*  || record.telefono?.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) || record.correo?.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) */)){
            return true;
          }
          if(record.principal=='0'){
            const found=this.dataSourceorg.filteredData.find(element => (element.principal=='1' && element.id_admin==record.id_admin && (element.nombres.toLocaleLowerCase().includes(filter.toLocaleLowerCase())/*  || element.telefono?.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) || element.correo?.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) */)));
            return found?(found.id_usuario==record.id_admin?true:false):false;
          }
      };
    return filterFunction;
}
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // Get the browser window size
    var windowHeight = window.innerHeight;
    var resto = 200;
    if (document.body.clientWidth <= 992)
      resto = 220;
    this.height = windowHeight - resto;
    /* var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight; */
  }

  applyFilterPrinc(event: Event) {
    /* const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceorg.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceorg.paginator) {
      this.dataSourceorg.paginator.firstPage();
    } */

    const filterValue = (event.target as HTMLInputElement).value;
    this.busqueda=filterValue;
    this.dataSourceorg.filter = filterValue.trim().toLowerCase();
  }

  limpiarfiltro() {
    /* this.busqueda='';
    if(this.busqueda=='')
      this.dataSourceorg.filter = ""; */
      this.busqueda="";
    if(this.busqueda==''){
      this.dataSourceorg.filter="";
      this.padresbusq=[];
    }
  }

  async listarMantenimientoUsuarios() {
    try {
      this.dataSourceorg.data = [];
      this.buscando1 = true;
      this.dataSourceorg.data = await this.configuracionService.ListarMantenimientoUsuarios()
      this.dataSourceorg.sort = this.sort1;
      this.buscando1 = false;
    }
    catch {
      this.buscando1 = false;
    }
  }

  async openModal(datosUsuario = null, editar = false) {
    try {
      this.mostrar_carga = true;
      //cargar los datos necesarios para pasar al otro modal
      let respuesta = null;
      if(datosUsuario){
        respuesta=await this.configuracionService.VerDatosUsuarioDetalle(datosUsuario.id_usuario??'')
      }
      let opcver=datosUsuario!=null && editar==false;
      if(!opcver){
        let tablas = await this.configuracionService.DatosModalUsuario()
        this.departamentos=tablas[0];
        this.tiposusuario=tablas[1];
        this.licencias=tablas[2];
      }
      
      this.mostrar_carga = false;
      const modalRef = this.modalService.open(ModalMantusuarioComponent, {size: 'md',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
      modalRef.componentInstance.datosdepartamento = this.departamentos;
      modalRef.componentInstance.datostipo_user = this.tiposusuario;
      modalRef.componentInstance.datoslicencias = this.licencias;
      modalRef.componentInstance.fecha_actual=this.fechahoy;
      modalRef.componentInstance.editar = editar
      modalRef.componentInstance.datosUsuario = datosUsuario
      modalRef.componentInstance.datosUsuarioDetalle=respuesta?respuesta[0]:null
      const result = await modalRef.result;
      if (result) {
        SwalService.success('Correcto',result.mensaje)
        await this.listarMantenimientoUsuarios()
      }
    }
    catch (e){
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
      console.log('error',e)
    }
  }

  async eliminarUsuario(row) {
    try {
      /* const sw = await SwalService.confirm('Esta seguro?', 'Se eliminará el usuario seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminar = {
          id_usuario: row.id_usuario
        }
        const respuesta = await this.configuracionService.eliminarUsuario(eliminar)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == "1") {
          SwalService.success()
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje);
        }
        await this.listarMantenimientoUsuarios()
      } */

      const respu=await SwalService.confirmCheck('Esta seguro que desea Eliminar el Usuario?',
        'Se eliminará toda la información del usuario.');
      if(respu.isConfirmed){
        this.mostrar_carga_todo=true;
        const respuesta = await this.configuracionService.eliminarUsuarioTodo({id_usuario:row.id_usuario})
        this.mostrar_carga_todo = false;
        if (respuesta.id == "1") {
          SwalService.success()
        }
        else {
          SwalService.error('Advertencia', respuesta.mensaje);
        }
        await this.listarMantenimientoUsuarios()
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e)
      SwalService.error("Advertencia",'No se pudo realizar la operación.')
    }
  }

  cambindicesel(ind: any) {
    if (ind == this.filaorg_sel)
      this.filaorg_sel = -1;
    else
      this.filaorg_sel = ind;
  }
  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  toggleOn(condicion:any){
    for(let row of this.dataSourceorg.data){
      if(row.id_admin==condicion)
      {
        if(row.principal!='1')
        {
          row.mostrar=1;
        }
        else
          row.icomost=1;
      }
    }
  }
  toggleOff(condicion:any){
    for(let row of this.dataSourceorg.data){
      if(row.id_admin==condicion)
      {
        if(row.principal!='1')
        {
          row.mostrar=0;
        }
        else
          row.icomost=0;
      }
    }
  }
  maxtodo(){
    for(let row of this.dataSourceorg.data){
      if(row.principal!='1')
        row.mostrar=1;
      else
        row.icomost=1;
    }
  }
  mintodo(){
    for(let row of this.dataSourceorg.data){
      if(row.principal!='1')
        row.mostrar=0;
      else
        row.icomost=0;
    }
  }
  async liberauser(row:any){
    await this.configuracionService.LiberarUsuario({id_usuario:row.id_usuario})
    this.toaster.success('El usuario se libero correctamente', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
  }
  //renovar Licencia
  async openModRenovar(row){
    this.mostrar_carga=true;
    let tablas = await this.configuracionService.DatosModalUsuario()
    this.licencias=tablas[2];
    //asignar datos del usuario
    let respuesta=await this.configuracionService.VerDatosUsuarioDetalle(row.id_usuario??'');
    if(respuesta){
      this.licant=row.id_licencia;
      this.mid_usuario.setValue(row.id_usuario);
      this.mnombres.setValue(row.nombres)
      this.mid_licencia.setValue(row.id_licencia)
      this.mlimitado.setValue(respuesta[0].limitado)
      this.mfechaasig.setValue(moment(respuesta[0].fechaasig).format('YYYY-MM-DD'));
      this.mfechaculm.setValue(respuesta[0].fechacul?moment(respuesta[0].fechacul).format('YYYY-MM-DD'):null);
      if(respuesta[0].tiempo){
        if(respuesta[0].fechacul){
          let fechaa = moment(respuesta[0].fechacul);
          let fechab = moment(this.fechahoy);
          let difdias=(fechaa.diff(fechab, 'days'));
          this.mrestante.setValue(difdias<0?0:difdias+1);
        }
        this.mtiempo.setValue(respuesta[0].tiempo);
        this.mtiempolic.setValue(respuesta[0].tiempo);
        let fechana=new Date(new Date(moment(this.fechahoy).format('YYYY-MM-DD')+' 09:00:00'));
        let fechanf=new Date(new Date(moment(this.fechahoy).format('YYYY-MM-DD')+' 09:00:00'));
        fechana.setDate(fechana.getDate()+1)
        fechanf.setDate(fechanf.getDate()+(Number(respuesta[0].tiempo)))
        this.mnuevaasig.setValue(moment(fechana).format('YYYY-MM-DD'))
        this.mnuevaculm.setValue(moment(fechanf).format('YYYY-MM-DD'));
      }
      else{
        let fechana=new Date(new Date(moment(this.fechahoy).format('YYYY-MM-DD')+' 09:00:00'));
        fechana.setDate(fechana.getDate()+1)
        this.mnuevaasig.setValue(moment(fechana).format('YYYY-MM-DD'))
        this.mnuevaculm.setValue(null);
        this.mtiempo.setValue(null)//usar otro input,ocultar u otra accion
      }
      //sino es ilimitado,ocultar fechas, si cambia licencia activar
      this.modalRenLic.show();
    }
    else{
      this.toaster.error('No se pudo cargar la información del usuario.', 'Error', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
    }
    this.mostrar_carga=false;
  }
  calcularFin(){
    if(!isNaN(this.mtiempo.value)){
      let fechanf=new Date(new Date(moment(this.fechahoy).format('YYYY-MM-DD')+' 09:00:00'));
      fechanf.setDate(fechanf.getDate()+(Number(this.mtiempo.value)));
      this.mnuevaculm.setValue(moment(fechanf).format('YYYY-MM-DD'));
    }
  }
  EnterTiempo(event:any){
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  cerrarModal2(){
    //limpiar valores
    this.mid_usuario.setValue('');
    this.mid_licencia.setValue('');
    this.mlimitado.setValue('');
    this.mnombres.setValue('');
    this.mfechaasig.setValue('');
    this.mfechaculm.setValue('');
    this.mtiempo.setValue('');
    this.mnuevaasig.setValue('');
    this.mnuevaculm.setValue('');
    this.mrestante.setValue('');
    this.mtiempolic.setValue('');
    this.licant='';
    this.modalRenLic.hide();
  }
  async GuardarRenov(){
    try{
      this.mostrar_carga_todo=true;
      let res = await this.configuracionService.ActualizaLicUser(this.mid_usuario.value,moment(this.mnuevaasig.value).format('YYYY-MM-DD'),
      this.mlimitado.value==1?moment(this.mnuevaculm.value).format('YYYY-MM-DD'):'',this.mid_licencia.value,this.licant,this.iduser);//condicionar si es ilimitado, fechaculm =null
      this.mostrar_carga_todo=false;
      this.cerrarModal2();
      this.listarMantenimientoUsuarios();
    }
    catch(e){
      this.mostrar_carga_todo=false;
      console.log(e);
      this.toaster.error('No se pudo realizar la operación.', 'Error', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
    }
  }
  Licenciasel(idlice:any){
    if(idlice!=''){
      for(let i=0;i<this.licencias.length;i++){
        if(idlice==this.licencias[i].id_licencia){
          this.mid_licencia.setValue(this.licencias[i].id_licencia);
          this.mlimitado.setValue(this.licencias[i].limitado);
          if(this.licencias[i].limitado==1){
            if(this.licencias[i].tiempo){
              this.mtiempo.setValue(this.licencias[i].tiempo);
              this.mtiempolic.setValue(this.licencias[i].tiempo);
              let fechana=/* this.mfechaculm.value?new Date(this.mfechaculm.value+' 09:00:00'): */new Date(moment(this.fechahoy).format('YYYY-MM-DD')+' 09:00:00');
              let fechanf=/* this.mfechaculm.value?new Date(this.mfechaculm.value+' 09:00:00'): */new Date(moment(this.fechahoy).format('YYYY-MM-DD')+' 09:00:00');
              fechana.setDate(fechana.getDate()+1)
              fechanf.setDate(fechanf.getDate()+(Number(this.licencias[i].tiempo)))
              this.mnuevaasig.setValue(moment(fechana).format('YYYY-MM-DD'));
              this.mnuevaculm.setValue(moment(fechanf).format('YYYY-MM-DD'));
            }
            else{
              let fechana=new Date(moment(this.fechahoy).format('YYYY-MM-DD')+' 09:00:00');
              fechana.setDate(fechana.getDate()+1)
              this.mnuevaasig.setValue(moment(fechana).format('YYYY-MM-DD'));
              this.mtiempo.setValue(null)
              this.mnuevaculm.setValue(null);
            }
          }
          else{
            let fechana=new Date(moment(this.fechahoy).format('YYYY-MM-DD')+' 09:00:00');
            fechana.setDate(fechana.getDate()+1)
            this.mnuevaasig.setValue(moment(fechana).format('YYYY-MM-DD'));
            this.mtiempo.setValue(null);
            this.mnuevaculm.setValue(null);
          }
          break;
        }
      }
    }
    else{
      /* this.tiempo.setValue('');
      this.fechaCulminacion.setValue(''); */
    }
    console.log()
  }
  async ActualizaSistem(){
    const respu=await SwalService.confirm('Esta seguro que desea Recargar el Sistema de los usuarios conectados?','');
    if(respu.isConfirmed){
      await this._SignalrcustomService.ActuaSistem();
    }
  }
}
