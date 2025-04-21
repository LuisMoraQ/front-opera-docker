import { SwalService } from 'src/app/servicios/swal.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit,ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { ToastrService } from 'ngx-toastr'
import * as moment from 'moment';
import { PrincipalService } from 'src/app/servicios/principal.service';
@Component({
  selector: 'app-modal-mantusuario',
  templateUrl: './modal-mantusuario.component.html',
  styleUrls: ['./modal-mantusuario.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalMantusuarioComponent implements OnInit {
  //datos recibe
  @Input() editar;
  @Input() datosUsuario = null;
  @Input() datosdepartamento = null;
  @Input() datostipo_user = null;
  @Input() datoslicencias = null;
  opcver=false;
  //datos componente
  userproceso:any;
  mostrar_carga_todo = false;
  fecha_actual:any;
  tiposUsuario = []
  licencias = [];
  nacionalidades = [{ id: 227, nombre: 'Peruana' }]
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
    { id: 2, nombre: 'SUSPENDIDO' }
  ]
  errorcorreo='';
  formUsuario = new UntypedFormGroup({
    id_usuario: new UntypedFormControl('', []),
    nombres: new UntypedFormControl('', [Validators.required]),
    /* nrodoc: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]), */
    telefono: new UntypedFormControl('', []),
    correo: new UntypedFormControl('', [Validators.required, Validators.pattern(`${this.formService.RE_EMAIL}`)]),
    estado: new UntypedFormControl('', [Validators.required]),
    /* tipoUser: new FormControl('', [Validators.required]), */
    licencia:new UntypedFormControl('',[Validators.required]),
    tiempo:new UntypedFormControl(''),
    /* nacionalidad: new FormControl('', []), */
    fechaasig: new UntypedFormControl(''),
    fechaCulminacion: new UntypedFormControl('', []),
    provinciaActual: new UntypedFormControl('', []),
    departamentoActual: new UntypedFormControl('', []),
    distritoActual: new UntypedFormControl('', []),
    direccion: new UntypedFormControl('', []),
    genero: new UntypedFormControl('', []),
  })
  datosUsuarioDetalle: any;

  get id_usuario(): UntypedFormControl { return this.formUsuario.get('id_usuario') as UntypedFormControl }
  get nombres(): UntypedFormControl { return this.formUsuario.get('nombres') as UntypedFormControl }
  get telefono(): UntypedFormControl { return this.formUsuario.get('telefono') as UntypedFormControl }
  get correo(): UntypedFormControl { return this.formUsuario.get('correo') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formUsuario.get('estado') as UntypedFormControl }
  /* get tipoUser(): FormControl { return this.formUsuario.get('tipoUser') as FormControl } */
  /* get nacionalidad(): FormControl { return this.formUsuario.get('nacionalidad') as FormControl } */
  get licencia(): UntypedFormControl {return this.formUsuario.get('licencia') as UntypedFormControl }
  get tiempo():UntypedFormControl{return this.formUsuario.get('tiempo') as UntypedFormControl}
  get fechaasig(): UntypedFormControl { return this.formUsuario.get('fechaasig') as UntypedFormControl }
  get fechaCulminacion(): UntypedFormControl { return this.formUsuario.get('fechaCulminacion') as UntypedFormControl }
  get provinciaActual(): UntypedFormControl { return this.formUsuario.get('provinciaActual') as UntypedFormControl }
  get departamentoActual(): UntypedFormControl { return this.formUsuario.get('departamentoActual') as UntypedFormControl }
  get distritoActual(): UntypedFormControl { return this.formUsuario.get('distritoActual') as UntypedFormControl }
  get direccion(): UntypedFormControl { return this.formUsuario.get('direccion') as UntypedFormControl }
  get genero(): UntypedFormControl { return this.formUsuario.get('genero') as UntypedFormControl }

  constructor(private modal: NgbActiveModal,
    private configuracionService: ConfiguracionService,
    public formService: FormsService,
    private toaster: ToastrService,
    private principalService: PrincipalService,
    private encriptadorService: EncriptadorService) { }


  async ngOnInit() {
    try {
      this.departamentos = this.datosdepartamento;
      this.tiposUsuario = this.datostipo_user;
      this.licencias=this.datoslicencias;
      this.userproceso=this.encriptadorService.recuperarlocalstory('idusuario');
      this.opcver=this.editar==false && this.datosUsuario!=null?true:false;
      await this.accionModal()//revisar
    } catch (e) {
      SwalService.error()
    }
  }

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

  async accionModal() {
    try{
      if (this.editar) {
        this.formUsuario.reset({
          id_usuario: this.datosUsuario.id_usuario,
          nombres: this.datosUsuario.nombres,
          /* nrodoc: this.datosUsuario.nrodoc, */
          telefono: this.datosUsuario.telefono,
          correo: this.datosUsuario.correo,
          estado: this.datosUsuario.estado,
          /* tipoUser: this.datosUsuario.id_tipo, */
          /* nacionalidad: this.datosUsuario.id_pais, */
          licencia:this.datosUsuario.id_licencia,
          fechaasig: this.datosUsuarioDetalle.fechaasig?moment(this.datosUsuarioDetalle.fechaasig).format('YYYY-MM-DD'):'',
          fechaCulminacion: this.datosUsuarioDetalle.fechacul?moment(this.datosUsuarioDetalle.fechacul).format('YYYY-MM-DD'):'',
          departamentoActual: '',
          provinciaActual: '',
          distritoActual: '',
          direccion: this.datosUsuarioDetalle.direccion,
          genero: this.datosUsuario.genero,
        })
        if(this.datosUsuarioDetalle.id_deptact!=null){
          this.mostrar_carga_todo=true;
          this.departamentoActual.setValue(this.datosUsuarioDetalle.id_deptact)
          await this.listarProvincias(this.departamentoActual.value)
          const idDepProv = this.datosUsuarioDetalle.id_deptact + '-' + this.datosUsuarioDetalle.id_provact
          this.provinciaActual.setValue(idDepProv)
          await this.listarDistritos(this.provinciaActual.value)
          const idDepProvDist = this.datosUsuarioDetalle.id_deptact + '-' + this.datosUsuarioDetalle.id_provact + '-' + this.datosUsuarioDetalle.id_distact
          this.distritoActual.setValue(idDepProvDist)
          this.mostrar_carga_todo=false;
        }
      }
      else{
        this.estado.setValue(1);
        let fechana=new Date(moment(this.fecha_actual).format('YYYY-MM-DD')+' 09:00:00');
        fechana.setDate(fechana.getDate()+1)
        this.fechaasig.setValue(moment(fechana).format('YYYY-MM-DD'));
        /* this.fechaCulminacion.setValue('2022-10-03') */
      }
    }
    catch{
      this.mostrar_carga_todo=false;
    }
  }

  async almacenar() {
    if (!this.editar) {
      await this.guardar()
    } else {
      await this.actualizar()
    }
  }

  async guardar() {
    try {
      if (this.formUsuario.invalid) {
        this.formUsuario.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo=true;
        const dataUsuario = {
          id_usuario: this.encriptadorService.recuperarlocalstory('idusuario'),
          nombres: this.nombres.value,
          telefono: this.telefono.value,
          correo: this.correo.value,
          id_tipo:'',
          nacionalidad:'',
          nrodoc:'',
          estado: this.estado.value,
          /* tipouser: this.tipoUser.value, */
          /* nacionalidad: this.nacionalidad.value, */
          id_licencia:this.licencia.value,
          fechaasig: this.fechaasig.value? moment(this.fechaasig.value).format('YYYY-MM-DD'):'',
          fechacul: this.fechaCulminacion.value?moment(this.fechaCulminacion.value).format('YYYY-MM-DD'):'',
          localact: this.distritoActual.value,
          direccion: this.direccion.value,
          genero: this.genero.value,
          id_usermod:this.userproceso
        }
        const resp=await this.configuracionService.GuardarUsuario(dataUsuario)
        if(resp.id=="1"){
          const dataproy = await this.principalService.recuperarDatosProyecto({id_proyecto: 147})
          if(dataproy && (resp.observacion??'')!=''){
            //duplicar proyecto plantilla, cargar datos del proyecto
            let descpasa="MEJORAMIENTO DE CARRETERA DE CAMINO VECINAL"
            const body = JSON.stringify({
              'id_proyecto': 147,
              'id_usuario': 9,
              'userfinal': resp.observacion,
              'admitidos': '1|1|1|1|1|1',//arrpermite.join('|'),
              'asignaund': 1,
              'cui': '',
              'descripcion': descpasa,
              'id_clasificacion': dataproy.id_clasificacion,
              'modalidad': dataproy.modalidad,
              'id_grupo': 0,
              'moneda': dataproy.moneda,
              'estado': 0,
              'cod_pais': dataproy.cod_pais,//null
              'id_localidad': dataproy.id_localidad?dataproy.id_deptact+'-'+dataproy.id_provact+'-'+dataproy.id_distact:null,//dataproy.id_localidad,//null, no manda correctamente
              'direccion': dataproy.direccion,
              'fecha_elaboracion': dataproy.fecha_elaboracion?moment(dataproy.fecha_elaboracion).format('YYYY-MM-DD') : null,
              'plazo': dataproy.plazo,
              'fecha_inicio': dataproy.fecha_inicio ? moment(dataproy.fecha_inicio).format('YYYY-MM-DD') : null,
              'fecha_culmina': dataproy.fecha_culmina ? moment(dataproy.fecha_culmina).format('YYYY-MM-DD') : null,
              'fuente': 1,
              'desplaza': false,
              'difidas': 0,
            });
            await this.principalService.DuplicarProy2(body);
            this.mostrar_carga_todo = false;
          }
          this.closeModal(resp)
        }
        else{
          this.mostrar_carga_todo=false;
          SwalService.error('Advertencia',resp.mensaje??'No se pudo realizar la operación');
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      SwalService.error(e)
    }
  }

  async actualizar() {
    try {
      if (this.formUsuario.invalid) {
        this.formUsuario.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo=true;
        const dataUsuario = {
          id_usuario: this.id_usuario.value,
          nombres: this.nombres.value,
          telefono: this.telefono.value ? this.telefono.value : '',
          correo: this.correo.value,
          estado: this.estado.value,
          /* tipouser: this.tipoUser.value, */
          /* nacionalidad: this.nacionalidad.value ? this.nacionalidad.value : '', */
          localact: this.distritoActual.value,
          direccion: this.direccion.value ? this.direccion.value : '',
          genero: this.genero.value?this.genero.value:'',
          id_usermod:this.userproceso
        }
        const resp=await this.configuracionService.modificarUsuario(dataUsuario);
        this.mostrar_carga_todo=false;
        /* this.toaster.success('Se actualizò correctamente', 'Éxito', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        }) */
        if(resp[0].id=="1"){
          this.closeModal(resp[0].mensaje)
        }
        else{
          SwalService.error('Advertencia',resp[0].mensaje);
        }
      }
    } catch (e) {
      console.log(e)
      this.mostrar_carga_todo=false;
      SwalService.error()
    }
  }
  closeModal(result: any = null) {
    this.modal.close(result)
  }
  //restaurar password
  async RestaurarPassword(){
    try{
      this.mostrar_carga_todo=true;
      const res=await this.configuracionService.RestaurarPassw(this.id_usuario.value,this.datosUsuario.correo,0);//necesita pasar login
      this.mostrar_carga_todo=false;
      if(res.id=="1"){
        SwalService.success('Correcto',res.mensaje)
        /* this.modaleditar.hide(); */
      }
      else{
        SwalService.error('Advertencia',res.mensaje)
        /* this.modaleditar.hide(); */
      }
    }
    catch{
      this.mostrar_carga_todo=false;
      SwalService.error('Advertencia','Ocurrio una excepción al momento de realizar la oepración.')
    }
  }
  //restaurar login
  async RestaurarTodo(){
    try{
      this.mostrar_carga_todo=true;
      const res=await this.configuracionService.RestaurarPassw(this.id_usuario.value,this.correo.value,1);//necesita pasar login
      this.mostrar_carga_todo=false;
      if(res.id=="1"){
        SwalService.success('Correcto',res.mensaje)
        /* this.modaleditar.hide(); */
      }
      else{
        SwalService.error('Advertencia',res.mensaje)
        /* this.modaleditar.hide(); */
      }
    }
    catch{
      this.mostrar_carga_todo=false;
      SwalService.error('Advertencia','Ocurrio una excepción al momento de realizar la oepración.')
    }
  }
  //calcular la fecha final al seleccionar la licencia
  Licenciasel(idlice:any){
    if(idlice!=''){
      for(let i=0;i<this.licencias.length;i++){
        if(idlice==this.licencias[i].id_licencia){
          if(this.licencias[i].limitado==1){
            this.tiempo.setValue(this.licencias[i].tiempo)
            const nuevo=this.fecha_actual;
            const fechfin=new Date();
            fechfin.setDate(nuevo.getDate()+this.licencias[i].tiempo)
            this.fechaCulminacion.setValue(moment(fechfin).format('YYYY-MM-DD'));
          }
          else{
            this.tiempo.setValue("Ilimitado")
          }
          break;
        }
      }
    }
    else{
      this.tiempo.setValue('');
      this.fechaCulminacion.setValue('');
    }
  }
  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  verificarCorreo(){
    this.correo.markAsTouched();
    if(this.correo.value==''){
      this.errorcorreo='';
    }
    else{
      if(this.correo.status=='INVALID'){
        this.errorcorreo='Formato de correo incorrecto.';
      }
      else{
        this.errorcorreo='';
      }
    }
  }
}
