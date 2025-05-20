import { SwalService } from './../../../../servicios/swal.service';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import * as moment from 'moment';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { AgrupacionProyectosComponent } from '../../agrupacion-proyectos/agrupacion-proyectos.component';
import { FormsService } from 'src/app/servicios/forms.service';

@Component({
  selector: 'app-modal-proyecto',
  templateUrl: './modal-proyecto.component.html',
  styleUrls: ['./modal-proyecto.component.scss']
})
export class ModalProyectoComponent implements OnInit {
  @Input() fuente=1;
  @Input() editar = null
  @Input() datos = null
  @Input() ver = null
  @Input() clasificaciones = []
  @Input() grupos = []
  @Input() departamentos = []
  @Input() idUsuario = null
  mostrar_carga_todo = false;
  formProyecto = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    descripcion2: new UntypedFormControl('', [Validators.required]),
    id_clasificacion: new UntypedFormControl('', [Validators.required]),
    modalidad: new UntypedFormControl('', [Validators.required]),
    id_grupo: new UntypedFormControl('0', [Validators.required]),
    moneda: new UntypedFormControl('0', [Validators.required]),
    estado: new UntypedFormControl('', [Validators.required]),
    cod_pais: new UntypedFormControl(227, []),
    departamento: new UntypedFormControl('', []),
    distrito: new UntypedFormControl('', []),
    provincia: new UntypedFormControl('', []),
    otrodepartamento: new UntypedFormControl('', []),
    otrodistrito: new UntypedFormControl('', []),
    otraprovincia: new UntypedFormControl('', []),
    direccion: new UntypedFormControl('', []),
    fecha_elaboracion: new UntypedFormControl('', [Validators.required, this.fechaElaboracionValidator()]),
    plazo: new UntypedFormControl('', [Validators.required, Validators.min(1), Validators.max(5000)]),
    fecha_inicio: new UntypedFormControl('', [Validators.required, this.fechaElaboracionValidator()]),
    fecha_culmina: new UntypedFormControl('', [Validators.required,  this.fechaElaboracionValidator()]),
  })
  get descripcion(): UntypedFormControl { return this.formProyecto.get('descripcion') as UntypedFormControl }
  get descripcion2(): UntypedFormControl { return this.formProyecto.get('descripcion2') as UntypedFormControl }
  get id_clasificacion(): UntypedFormControl { return this.formProyecto.get('id_clasificacion') as UntypedFormControl }
  get modalidad(): UntypedFormControl { return this.formProyecto.get('modalidad') as UntypedFormControl }
  get id_grupo(): UntypedFormControl { return this.formProyecto.get('id_grupo') as UntypedFormControl }
  get moneda(): UntypedFormControl { return this.formProyecto.get('moneda') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formProyecto.get('estado') as UntypedFormControl }
  get cod_pais(): UntypedFormControl { return this.formProyecto.get('cod_pais') as UntypedFormControl }
  // get id_localidad(): FormControl { return this.formProyecto.get('id_localidad') as FormControl }
  get direccion(): UntypedFormControl { return this.formProyecto.get('direccion') as UntypedFormControl }
  get departamento(): UntypedFormControl { return this.formProyecto.get('departamento') as UntypedFormControl }
  get distrito(): UntypedFormControl { return this.formProyecto.get('distrito') as UntypedFormControl }
  get provincia(): UntypedFormControl { return this.formProyecto.get('provincia') as UntypedFormControl }
  get otrodepartamento(): UntypedFormControl { return this.formProyecto.get('otrodepartamento') as UntypedFormControl }
  get otrodistrito(): UntypedFormControl { return this.formProyecto.get('otrodistrito') as UntypedFormControl }
  get otraprovincia(): UntypedFormControl { return this.formProyecto.get('otraprovincia') as UntypedFormControl }
  get fecha_elaboracion(): UntypedFormControl { return this.formProyecto.get('fecha_elaboracion') as UntypedFormControl }
  get plazo(): UntypedFormControl { return this.formProyecto.get('plazo') as UntypedFormControl }
  get fecha_inicio(): UntypedFormControl { return this.formProyecto.get('fecha_inicio') as UntypedFormControl }
  get fecha_culmina(): UntypedFormControl { return this.formProyecto.get('fecha_culmina') as UntypedFormControl }
  modalidades = [
    { id: 0, nombre: 'DIRECTA' },
    { id: 1, nombre: 'CONTRATA' }
  ]

  estados = [
    { id: 0, nombre: 'BORRADOR' },
    { id: 1, nombre: 'APROBADO' },
    { id: 2, nombre: 'EVALUACIÓN' }
  ]
  paises=[]
  monedas=[]
  provincias = []
  distritos = []
  OtroPais:boolean=false
  calculandofecha=false;
  actlista=false;
  datos2
  constructor(private modal: NgbActiveModal,
    private principalService: PrincipalService,
    private configuracionService: ConfiguracionService,
    private modalService: NgbModal, 
    public activeModal: NgbActiveModal,
    public formsService: FormsService,
    private toaster: ToastrService) { }

  async ngOnInit() {
      this.paises = await this.configuracionService.listarPaises();
      this.monedas = await this.configuracionService.listarMonedas();
    if(!this.editar){
      this.estado.setValue(0);
      this.estado.disable();
    }else if(this.editar&&this.ver){
       const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.datos.id_proyecto})
       detalleProyecto.monedanom = await  this.monedas.find((item)=>item.id_moneda==detalleProyecto.moneda).moneda
       detalleProyecto.modalidadnom=  this.modalidades.find((item)=>item.id==detalleProyecto.modalidad).nombre
       detalleProyecto.estadonom=  this.estados.find((item)=>item.id==detalleProyecto.estado).nombre
       const prueba2 = await this.grupos.find((item)=>item.id_grupo==detalleProyecto.id_grupo)
       detalleProyecto.gruposnom= prueba2? prueba2.descripcion:''
       this.datos2 = detalleProyecto
       this.modalidad.setValue(detalleProyecto.modalidad);
       this.moneda.setValue(detalleProyecto.moneda);
       this.estado.setValue(detalleProyecto.estado);
       this.id_grupo.setValue(detalleProyecto.id_grupo);
       this.id_clasificacion.setValue(detalleProyecto.id_clasificacion);
       this.direccion.setValue(detalleProyecto.direccion);
       this.cod_pais.setValue(detalleProyecto.cod_pais);
       this.distrito.setValue(detalleProyecto.id_deptact+'-'+detalleProyecto.id_provact+'-'+detalleProyecto.id_distact);
    }
  }
  async CambiarPais(id) {
    if (id === '227') {
      this.OtroPais = false;
    } else {
      this.OtroPais = true;
    }
  }
  async listarProvincias(idDepartamento: number) {
    this.provincias = []
    this.distritos = []
    this.provincia.setValue('')
    this.distrito.setValue('')
    if (!idDepartamento) {
      this.provincia.clearValidators()
      this.provincia.updateValueAndValidity()
      this.distrito.clearValidators()
      this.distrito.updateValueAndValidity()
      return
    }
    this.provincia.setValidators([Validators.required])
    this.provincia.updateValueAndValidity()
    this.distrito.setValidators([Validators.required])
    this.distrito.updateValueAndValidity()
    this.provincias = await this.configuracionService.Provincia(idDepartamento)
  }
  async listarDistritos(idProvincia: string) {
    this.distritos = []
    this.distrito.reset()
    this.distrito.setValue('')
    if (!idProvincia) {
      this.distrito.clearValidators()
      this.distrito.updateValueAndValidity()
      return
    }
    const provincia = this.provincia.value.split('-')
    this.distritos = await this.configuracionService.Distrito(this.departamento.value, provincia[1])
  }
  async almacenar(value=0) {
    if (this.editar&&value==0) {
      await this.actualizar()
    }else{
      await this.guardar(value)
    }
  }
  async guardar(value) {
    try {
      if (this.formProyecto.invalid) {
        this.formProyecto.markAllAsTouched()
        this.toaster.error('Datos incompletos o erroneos', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
        return
      } else {
        this.mostrar_carga_todo = true;
        const principal= value==2? this.datos.id_proyecto :''
        let descpasa=this.descripcion.value.toString().toUpperCase().trim().replace(/\s+/g, ' ')//quitar saltos y espacios, solo mayuscula
        const dataProyecto = {
          id_principal:principal,
          cui:this.cod_pais.value===227? '':this.otrodepartamento.value+'|'+ this.otraprovincia.value+'|'+ this.otrodistrito.value,
          descripcion: descpasa,
          id_clasificacion: this.id_clasificacion.value,
          modalidad: this.modalidad.value,
          id_grupo: this.id_grupo.value,
          moneda: this.moneda.value,
          estado: this.estado.value,
          cod_pais: this.cod_pais.value,
          id_localidad: this.distrito.value,
          direccion: this.direccion.value,
          fecha_elaboracion: this.fecha_elaboracion.value ? moment(this.fecha_elaboracion.value).format('YYYY-MM-DD') : '',
          plazo: this.plazo.value,
          fecha_inicio: this.fecha_inicio.value ? moment(this.fecha_inicio.value).format('YYYY-MM-DD') : '',
          fecha_culmina: this.fecha_culmina.value ? moment(this.fecha_culmina.value).format('YYYY-MM-DD') : '',
          id_usuario: this.idUsuario,
          fuente: this.fuente,
        }
        const resp = await this.principalService.guardarProyecto(dataProyecto)
        const id_nuevo=resp.idproy
        if(value!==2){
            let descpasa=this.descripcion2.value.toString().toUpperCase().trim().replace(/\s+/g, ' ')//quitar saltos y espacios, solo mayuscula
            const dataProyecto = {
              id_principal: id_nuevo,
              cui:this.cod_pais.value===227? '':this.otrodepartamento.value+'|'+ this.otraprovincia.value+'|'+ this.otrodistrito.value,
              descripcion: descpasa,
              id_clasificacion: this.id_clasificacion.value,
              modalidad: this.modalidad.value,
              id_grupo: this.id_grupo.value,
              moneda: this.moneda.value,
              estado: this.estado.value,
              cod_pais: this.cod_pais.value,
              id_localidad: this.distrito.value,
              direccion: this.direccion.value,
              fecha_elaboracion: this.fecha_elaboracion.value ? moment(this.fecha_elaboracion.value).format('YYYY-MM-DD') : '',
              plazo: this.plazo.value,
              fecha_inicio: this.fecha_inicio.value ? moment(this.fecha_inicio.value).format('YYYY-MM-DD') : '',
              fecha_culmina: this.fecha_culmina.value ? moment(this.fecha_culmina.value).format('YYYY-MM-DD') : '',
              id_usuario: this.idUsuario,
              fuente: this.fuente,
            }
            const resp2 =await this.principalService.guardarProyecto(dataProyecto)
        }
        this.mostrar_carga_todo = false;
        if (resp.id == "1") {
          this.closeModal('ok')
        }
        else {
          SwalService.error('Advertencia', resp.mensaje);
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      SwalService.error(e)
    }
  }
  async actualizar() {
  }
  closeModal(result: any = null) {
    this.modal.close({datos:result,actlista:this.actlista});
  }
  convertir() {
    // // const variable  = String.fromCharCode(&#xf2bc;)
    // return variable
  }

  async verGrupoProyecto() {
    try{
      const valoract=this.id_grupo.value
      const gruposact=this.grupos;
      this.grupos=[]
      this.mostrar_carga_todo = true
      const modalRef = this.modalService.open(AgrupacionProyectosComponent, { size: 'md',backdrop: 'static',windowClass: 'pcoded',keyboard:false })
      modalRef.componentInstance.fuente = this.fuente
      this.mostrar_carga_todo = false
      const result = await modalRef.result
      if (result) {
        if(result.datos.length>0){
          this.grupos = result.datos
          if(valoract!=''){
            let encuentra=this.grupos.find(dato=> dato.id_grupo==valoract);
            if(encuentra){
              this.id_grupo.setValue(valoract)
            }
            else{
              this.id_grupo.setValue('');
            }
            /* this.id_grupo.updateValueAndValidity(); */
          }
        }
        else{
          this.grupos=gruposact;
          this.id_grupo.setValue(valoract)
        }
        if(result.actlista){
          this.actlista=true;
        }
      }
    }
    catch(error){
      this.mostrar_carga_todo=false;
      console.log(error)
    }
  }
  async CalculaFechaFin(valmod:any){
    if(valmod==0){//plazo
      let plazores=!isNaN(Number(this.plazo.value))?this.plazo.value:1;
      if(plazores==null || plazores=='' || plazores==0){
        this.fecha_culmina.setValue(this.fecha_inicio.value);
        this.plazo.setValue(1);
      }
      else{
        if(this.fecha_inicio.value){
          let fechaf=new Date(this.fecha_inicio.value);
          this.calculandofecha=true;
          fechaf.setDate(fechaf.getDate()+Number(plazores))
          this.calculandofecha=false;
          this.fecha_culmina.setValue(moment(fechaf).format('YYYY-MM-DD'))
        }
      }
    }else if(valmod==1){//inicio
      if(this.fecha_inicio.value!=''){
        if (moment(this.fecha_inicio.value).format('dddd').toUpperCase() == 'DOMINGO') {
          this.fecha_inicio.setValue(null)
          this.fecha_culmina.setValue(null)
          this.toaster.error('La fecha inicio no puede iniciar Domingo', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })

          return 
        }
        let plazores=!isNaN(Number(this.plazo.value))?this.plazo.value:0;
        if(plazores==null || plazores==''){
          this.fecha_culmina.setValue(this.fecha_inicio.value);
        }
        else{
          let fechaf=new Date(this.fecha_inicio.value);
          this.calculandofecha=true;
          fechaf.setDate(fechaf.getDate()+Number(plazores))
          this.calculandofecha=false;
          this.fecha_culmina.setValue(moment(fechaf).format('YYYY-MM-DD'))
        }
      }
    }else if(valmod==2){//culmina
      if(this.fecha_culmina.value!=''){
        if(this.fecha_inicio.value!=''){
          //fecha culmina menor, error, asignar fecha actual plazo 1 dia
          let fechaa = moment(this.fecha_inicio.value);
          let fechab = moment(this.fecha_culmina.value);
          let difdias=fechab.diff(fechaa, 'days');
          if(difdias<0){
            this.toaster.error('La Fecha de Culminación no puede ser menor a la Fecha Inicial.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            this.fecha_culmina.setValue(this.fecha_inicio.value)
            this.plazo.setValue(1)
          }
          else{
            this.plazo.setValue(difdias+1)
          }
        }
      }
    }
  }
  TeclaCalcFin(event:any){
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  fechaElaboracionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Si no hay valor, no aplicar validación
      }
      const fechaElaboracion = new Date(control.value);
      const fechaActual = new Date();
      // Calcular las fechas límites
      const fechaLimiteInferior = new Date(fechaActual);
      fechaLimiteInferior.setFullYear(fechaActual.getFullYear() - 25); // 25 años antes de la fecha actual
      const fechaLimiteSuperior = new Date(fechaActual);
      fechaLimiteSuperior.setFullYear(fechaActual.getFullYear() + 25); // 25 años después de la fecha actual
      // Validación: la fecha debe estar dentro del rango
      if (fechaElaboracion < fechaLimiteInferior || fechaElaboracion > fechaLimiteSuperior) {
        return { fechaInvalida: 'La fecha debe estar entre 25 años antes y 25 años después de la fecha actual.' };
      }
      return null; // Si es válida
    };
}
}



