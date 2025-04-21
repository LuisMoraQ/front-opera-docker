import { Component, OnInit, Input, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';

import { FormsService } from 'src/app/servicios/forms.service';
import { ConfiguracionService } from '../../../../servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { SwalService } from '../../../../servicios/swal.service'

@Component({
  selector: 'app-usuariosec',
  templateUrl: './usuariosec.component.html',
  styleUrls: ['./usuariosec.component.scss']
})
export class UsuariosecComponent implements OnInit {
  @Output() cargaParcial = new EventEmitter<boolean>()
  @Input('height')  height: number=100;
  mostrar_carga_todo=false;
  buscando1=false;
  id_usuarioadm:any;
  mensaje_res:string;
  titmodal:any;
  opcver=false;
  datosusuariodetalle:any;
  datosfila:any;
  verclave=false;
  //tabla principal
  displayedColumnorg: string[] = ['id_usuario','nombres','telefono','correo','usuario','tipo','estado','acciones'];
  dataSourceorg= new MatTableDataSource();
  filaorg_sel:any;

  @ViewChild("modalEditar") modalEditar: ModalBasicComponent;
  @ViewChild("modAccesos") modAccesos: ModalBasicComponent;
  @ViewChild('table1', { read: MatSort, static: true }) sort1: MatSort;

  formUsuario = new UntypedFormGroup({
    id_usuario: new UntypedFormControl('', []),
    nombres: new UntypedFormControl('', [Validators.required]),
    telefono: new UntypedFormControl('', []),
    correo: new UntypedFormControl('',),
    estado: new UntypedFormControl('', [Validators.required]),
    provinciaActual: new UntypedFormControl('', []),
    departamentoActual: new UntypedFormControl('', []),
    distritoActual: new UntypedFormControl('', []),
    direccion: new UntypedFormControl('', []),
    genero: new UntypedFormControl('', []),
  })
  get id_usuario(): UntypedFormControl { return this.formUsuario.get('id_usuario') as UntypedFormControl }
  get nombres(): UntypedFormControl { return this.formUsuario.get('nombres') as UntypedFormControl }
  get telefono(): UntypedFormControl { return this.formUsuario.get('telefono') as UntypedFormControl }
  get correo(): UntypedFormControl { return this.formUsuario.get('correo') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formUsuario.get('estado') as UntypedFormControl }
  get provinciaActual(): UntypedFormControl { return this.formUsuario.get('provinciaActual') as UntypedFormControl }
  get departamentoActual(): UntypedFormControl { return this.formUsuario.get('departamentoActual') as UntypedFormControl }
  get distritoActual(): UntypedFormControl { return this.formUsuario.get('distritoActual') as UntypedFormControl }
  get direccion(): UntypedFormControl { return this.formUsuario.get('direccion') as UntypedFormControl }
  get genero(): UntypedFormControl { return this.formUsuario.get('genero') as UntypedFormControl }

  formLogin = new UntypedFormGroup({
    id_usuariolog:new UntypedFormControl('', [Validators.required]),
    login: new UntypedFormControl('', [Validators.required]),
    clave: new UntypedFormControl('', [Validators.required]),
  })
  get id_usuariolog():UntypedFormControl { return this.formLogin.get('id_usuariolog') as UntypedFormControl }
  get login(): UntypedFormControl { return this.formLogin.get('login') as UntypedFormControl }
  get clave(): UntypedFormControl { return this.formLogin.get('clave') as UntypedFormControl }

  departamentos = []
  provincias = []
  distritos = []
  generos = [
    { id: 1, nombre: 'FEMENINO' },
    { id: 2, nombre: 'MASCULINO' }
  ]
  tiposEstado = [
    { id: 1, nombre: 'ACTIVO' },
    { id: 0, nombre: 'INACTIVO' },
    /* { id: 2, nombre: 'SUSPENDIDO' } */
  ]

  constructor(
    private configuracionService: ConfiguracionService,
    private _EncriptadorService: EncriptadorService,
    private toaster: ToastrService,
    public formService: FormsService,
  ) { }

  ngOnInit(): void {
    var resto=605;
    if(document.body.clientWidth<=992)
      resto=625;
    this.height=window.innerHeight-resto;
    this.id_usuarioadm=this._EncriptadorService.recuperarlocalstory('idusuario');

    this.onListar();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto=605;
    if(document.body.clientWidth<=992)
      resto=625;
    this.height=window.innerHeight-resto;
  }
  async onListar(){
    try{
      this.dataSourceorg.data=[];
      this.buscando1=true;
      const param = {
        id_admin: this.id_usuarioadm
      }
      this.dataSourceorg.data=await this.configuracionService.ListarUsuariosSecundarios(param);
      this.dataSourceorg.sort = this.sort1;
      this.buscando1=false;
    }
    catch{
      this.buscando1=false;
    }
  }
  cambindicesel(ind:any){
    if(ind==this.filaorg_sel)
      this.filaorg_sel=-1;
    else
      this.filaorg_sel=ind;
  }
  quitarfoco(element:any){
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  //modal usuario secundario
  async listarProvincias(idDepartamento: number) {
    this.provincias = []
    this.distritos = []
    this.provinciaActual.setValue('')
    this.distritoActual.setValue('')
    if (!idDepartamento) {
      this.provinciaActual.clearValidators()
      this.provinciaActual.updateValueAndValidity()
      this.distritoActual.clearValidators()
      this.distritoActual.updateValueAndValidity()
      return
    }
    this.provinciaActual.setValidators([Validators.required])
    this.provinciaActual.updateValueAndValidity()
    this.distritoActual.setValidators([Validators.required])
    this.distritoActual.updateValueAndValidity()
    this.provincias = await this.configuracionService.Provincia(idDepartamento)
    this.formUsuario.markAllAsTouched();
  }

  async listarDistritos(idProvincia: string) {
    this.distritos = []
    this.distritoActual.reset()
    this.distritoActual.setValue('')
    if (!idProvincia) {
      this.distritoActual.clearValidators()
      this.distritoActual.updateValueAndValidity()
      return
    }
    const provincia = this.provinciaActual.value.split('-')
    this.distritos = await this.configuracionService.Distrito(this.departamentoActual.value, provincia[1])
  }
  async openModal(row:any,editar:any){
    try{
      this.cargaParcial.emit(true);
      this.datosfila=row;
      //cargar los datos necesarios para pasar al otro modal
      let respuesta=await this.configuracionService.VerDatosUsuarioDetalle(row.id_usuario??'')
      if(respuesta.length>0){
        this.datosusuariodetalle=respuesta[0];
      }
      let tablas = await this.configuracionService.DatosModalUsuario()
      this.departamentos=tablas[0];

      if(editar){
        this.titmodal="Editar Usuario";
        this.opcver=false;
        //asignar valore al form
        this.formUsuario.reset({
          id_usuario: this.datosfila.id_usuario,
          nombres: this.datosfila.nombres,
          telefono: this.datosfila.telefono,
          correo: this.datosfila.correo,
          estado: this.datosfila.estado,
          departamentoActual: '',
          provinciaActual: '',
          distritoActual: '',
          direccion: this.datosusuariodetalle.direccion,
          genero: this.datosusuariodetalle.id_genero,
        })
        if(this.datosusuariodetalle.id_deptact!=null){
          this.departamentoActual.setValue(this.datosusuariodetalle.id_deptact)
          await this.listarProvincias(this.departamentoActual.value)
          const idDepProv = this.datosusuariodetalle.id_deptact + '-' + this.datosusuariodetalle.id_provact
          this.provinciaActual.setValue(idDepProv)
          await this.listarDistritos(this.provinciaActual.value)
          const idDepProvDist = this.datosusuariodetalle.id_deptact + '-' + this.datosusuariodetalle.id_provact + '-' + this.datosusuariodetalle.id_distact
          this.distritoActual.setValue(idDepProvDist)
        }
      }
      else{
        this.titmodal="Ver Datos de Usuario";
        this.opcver=true;
      }
      this.modalEditar.show()
      this.cargaParcial.emit(false);
    }
    catch{
      this.cargaParcial.emit(false);
      this.toaster.error('No se pudo cargar los datos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }
  cerrarModal(){
    this.modalEditar.hide()
  }
  async guardarModal(){
    try{
      if(!this.formUsuario.invalid){
        this.mostrar_carga_todo=true;
        const params = {
          id_usuario: this.id_usuario.value,
          nombres: this.nombres.value,
          telefono: this.telefono.value??'',
          correo:this.correo.value??'',
          id_pais:'',
          localact:this.distritoActual.value??'',
          direccion:this.direccion.value??'',
          genero:this.genero.value??'',
          estado:this.estado.value??'',
          id_usermod:this.id_usuarioadm,
        }
        let res= await this.configuracionService.modificarUsuarioSec(params);
        this.mostrar_carga_todo=false;
        if(res[0].id=='1'){
          this.cerrarModal();
          this.onListar();
          await SwalService.success('Exitoso','Los datos se actualizaron correctamente.');
        }
        else{
          await SwalService.error('Advertencia','No se encontro los datos del usuario.');
        }
      }
      else{
        this.formUsuario.markAllAsTouched();
        this.toaster.error('Debe llenar los campos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      }
    }
    catch{
      // Entra aquí si el servicio entrega un código http de error EJ: 404, 
      this.mostrar_carga_todo=false;
      await SwalService.error('Advertencia','No se pudo guardar los cambios.');
    }
  }
  limpiarDatos(){
    this.formUsuario.reset({
      id_usuario: this.datosfila.id_usuario,
      nombres: this.datosfila.nro+"-"+this.datosfila.nom_tipo,
      telefono: '',
      correo: '',
      estado: '1',
      departamentoActual: '',
      provinciaActual: '',
      distritoActual: '',
      direccion: '',
      genero: '',
    })
    this.provinciaActual.clearValidators()
    this.provinciaActual.updateValueAndValidity()
    this.distritoActual.clearValidators()
    this.distritoActual.updateValueAndValidity()
  }
  //modal usuarios secundarios
  async OpenModalAccesos(row){
    try{
      this.cargaParcial.emit(true);
      const param = {
        id_usuario: row.id_usuario
      }
      let resp=await this.configuracionService.DatosaccUsuariosSec(param);
      this.formLogin.reset({
        id_usuariolog:row.id_usuario,
        login:resp[0].login??'',
        clave:resp[0].clave??''
      })
      this.cargaParcial.emit(false);
      this.modAccesos.show();
    }
    catch{
      this.cargaParcial.emit(false);
      this.toaster.error('No se pudo cargar los datos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }
  async GuardarAcc(){
    try{
      if(!this.formLogin.invalid){
        this.mostrar_carga_todo=true;
        const params = {
          id_usuario: this.id_usuariolog.value,
          login: this.login.value,
          clave: this.clave.value,
          id_usermod:this.id_usuarioadm
        }
        let res= await this.configuracionService.ModaccUsuariosSec(params);
        this.mostrar_carga_todo=false;
        if(res[0].id=='1'){
          this.cerrarModalAcc();
          this.onListar();
          await SwalService.success('Exitoso','Los datos se actualizaron correctamente.');
        }
        else{
          await SwalService.error('Advertencia',res[0].mensaje);
        }
      }
      else{
        this.formLogin.markAllAsTouched();
        this.toaster.error('Debe llenar los campos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      }
    }
    catch{
      // Entra aquí si el servicio entrega un código http de error EJ: 404, 
      this.mostrar_carga_todo=false;
      await SwalService.error('Advertencia','No se pudo guardar los cambios.');
    }
  }
  cerrarModalAcc(){
    this.verclave=false;
    this.modAccesos.hide();
  }
}
