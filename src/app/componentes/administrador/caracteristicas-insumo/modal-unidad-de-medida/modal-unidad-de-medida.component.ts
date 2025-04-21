import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-modal-unidad-de-medida',
  templateUrl: './modal-unidad-de-medida.component.html',
  styleUrls: ['./modal-unidad-de-medida.component.scss']
})
export class ModalUnidadDeMedidaComponent implements OnInit {
  @Input() editar = null
  @Input() datos = null
  @Input() ver = null
  @Input() fuente = null
  @Input() id_user:any;
  mostrar_carga_todo = false;
  formUnidadMedida = new UntypedFormGroup({
    unidad: new UntypedFormControl('', [Validators.required]),
    abrev: new UntypedFormControl('', [Validators.required]),
    activo: new UntypedFormControl(true, [Validators.required]),
    porcentaje:new UntypedFormControl(false),
    tipo_insumo:new UntypedFormControl(''),
    util1:new UntypedFormControl(false),
    util2:new UntypedFormControl(false),
    util3:new UntypedFormControl(false),
    util4:new UntypedFormControl(false),
    automatico:new UntypedFormControl('')
  })
  @Input() tipoInsumos=[];
  estado: any;
  ver_activo:any;
  ver_porc:any;
  addauto:any;
  verutil1:any;
  verutil2:any;
  verutil3:any;
  verutil4:any;
  desc_tipo_insumo='';
  get unidad(): UntypedFormControl { return this.formUnidadMedida.get('unidad') as UntypedFormControl }
  get abreviatura(): UntypedFormControl { return this.formUnidadMedida.get('abrev') as UntypedFormControl }
  get activo(): UntypedFormControl { return this.formUnidadMedida.get('activo') as UntypedFormControl }
  get porcentaje(): UntypedFormControl { return this.formUnidadMedida.get('porcentaje') as UntypedFormControl }
  get tipo_insumo(): UntypedFormControl { return this.formUnidadMedida.get('tipo_insumo') as UntypedFormControl }
  get util1(): UntypedFormControl { return this.formUnidadMedida.get('util1') as UntypedFormControl }
  get util2(): UntypedFormControl { return this.formUnidadMedida.get('util2') as UntypedFormControl }
  get util3(): UntypedFormControl { return this.formUnidadMedida.get('util3') as UntypedFormControl }
  get util4(): UntypedFormControl { return this.formUnidadMedida.get('util4') as UntypedFormControl }
  get automatico(): UntypedFormControl { return this.formUnidadMedida.get('automatico') as UntypedFormControl }
  
  constructor(
    private modal: NgbActiveModal,
    private administradorService: AdministradorService,
    private toaster: ToastrService,
    private _EncriptadorService: EncriptadorService,
    ) { }

  async ngOnInit() {
    try {
      await this.accionModal()
      this.id_user = this.id_user??this._EncriptadorService.recuperarlocalstory('idusuario');
      if(this.ver){
        this.ver_activo=this.datos?.activo==1?true:false;
        this.ver_porc=this.datos?.operador=='%'?true:false;
        this.verutil1=this.datos?.util1==1?true:false;
        this.verutil2=this.datos?.util2==1?true:false;
        this.verutil3=this.datos?.util3==1?true:false;
        this.verutil4=this.datos?.util4==1?true:false;
        this.addauto=this.datos?.automatico==1?true:false;
        let tipenc=this.tipoInsumos.find(ele=> this.datos?.tipo_insumo==ele.id_tipo_insumo);
        this.desc_tipo_insumo=tipenc?.desc_tipo_insumo;
      }
      if(document.getElementById('inpabr')){
        document.getElementById('inpabr')?.focus();
      }
      else{
        document.getElementById('descund')?.focus();
      }
    } catch (e) {
      SwalService.error()
    }
  }
  async accionModal() {
    try {
      if (this.editar) {
        this.formUnidadMedida.reset({
          unidad: this.datos?.descripcion,
          abrev: this.datos?.unidad,
          activo: this.datos?.activo == 1 ? true : false,
          porcentaje:this.datos?.operador=='%'?true:false,
          tipo_insumo:this.datos?.tipo_insumo??'',
          util1:this.datos?.util1==1?true:false,
          util2:this.datos?.util2==1?true:false,
          util3:this.datos?.util3==1?true:false,
          util4:this.datos?.util4==1?true:false,
          automatico:this.datos?.automatico==1?true:false
        })
      }
      this.cambiarporc();
      this.cambiargrupo();
    } catch (e) {
      console.log(e);
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
      if (this.formUnidadMedida.invalid) {
        this.formUnidadMedida.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        let count=0;
        count=this.porcentaje.value==1 && this.util1.value==1?count+1:this.porcentaje.value==1 && this.util2.value==1?count+1:this.porcentaje.value==1 && this.util3.value==1?count+1:this.porcentaje.value==1 && this.util4.value==1?count+1:count;
        if((this.porcentaje.value==1 && count>0) || this.porcentaje.value==0){
          const dataUnidadMedida = {
            unidad: (this.abreviatura.value).trim().toUpperCase(),
            descripcion: (this.unidad.value).trim().toUpperCase(),
            operador:this.porcentaje.value?'%':'',
            tipo_insumo:this.tipo_insumo.value,
            id_usuario:this.id_user,
            fuente:this.fuente,
            activo: this.activo.value == true ? 1 : 0,
            util1:this.util1.value?1:0,
            util2:this.util2.value?1:0,
            util3:this.util3.value?1:0,
            util4:this.util4.value?1:0,
            automatico:this.automatico.value?1:0
          }
          this.mostrar_carga_todo = true;
          const respuesta = await this.administradorService.guardarUnidadMed(dataUnidadMedida)
          this.mostrar_carga_todo = false;
          if (respuesta[0].id == "0") {
            SwalService.error('Advertencia', respuesta[0].mensaje)
          }
          else {
            this.closeModal('ok')
          }
        }
        else{
          this.toaster.error('Seleccione el grupo donde se utilizara el porcentaje', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error()
    }
  }
  async actualizar() {
    try {
      if (this.formUnidadMedida.invalid) {
        this.formUnidadMedida.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        console.log(this.porcentaje.value)
        const editUnidadMedida = {
          id_unidad: this.datos?.id_unidad,
          unidad: (this.abreviatura.value).trim().toUpperCase(),
          descripcion: (this.unidad.value).trim().toUpperCase(),
          operador:this.porcentaje.value?'%':'',
          tipo_insumo:this.tipo_insumo.value,
          id_usuario:this.id_user,
          fuente:this.fuente,
          activo: this.activo.value == true ? 1 : 0,
          util1:this.util1.value?1:0,
          util2:this.util2.value?1:0,
          util3:this.util3.value?1:0,
          util4:this.util4.value?1:0,
          automatico:this.automatico.value?1:0
        }
        this.mostrar_carga_todo = true;
        const respuesta = await this.administradorService.modificarUnidadMed(editUnidadMedida)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == "1") {
          this.closeModal('ok')
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error()
    }
  }
  closeModal(result: any = null) {
    this.modal.close(result)
  }
  cambiarporc(){
    if(!this.porcentaje.value){
      this.tipo_insumo.disable();
      this.tipo_insumo.setValue('');
      this.automatico.disable();
      this.automatico.setValue(false);
      this.util1.disable();
      this.util1.setValue(false);
      this.util2.disable();
      this.util2.setValue(false);
      this.util3.disable();
      this.util3.setValue(false);
      this.util4.disable();
      this.util4.setValue(false);
      this.tipo_insumo.clearValidators()
      this.tipo_insumo.updateValueAndValidity()
    }
    else{
      this.tipo_insumo.enable();
      this.automatico.enable();
      this.util1.enable();
      this.util2.enable();
      this.util3.enable();
      this.util4.enable();
      this.tipo_insumo.setValidators(Validators.required)
      this.tipo_insumo.updateValueAndValidity()
    }
  }
  cambiargrupo(){
    if(this.tipo_insumo.value==1 || this.tipo_insumo.value==''){
      this.util1.disable();
      this.util1.setValue(false);
    }
    else{
      this.util1.enable();
    }
    if(this.tipo_insumo.value==2 || this.tipo_insumo.value==''){
      this.util2.disable();
      this.util2.setValue(false);
    }
    else{
      this.util2.enable();
    }
    if(this.tipo_insumo.value==3 || this.tipo_insumo.value==''){
      this.util3.disable();
      this.util3.setValue(false);
    }
    else{
      this.util3.enable();
    }
    if(this.tipo_insumo.value==4 || this.tipo_insumo.value==''){
      this.util4.disable();
      this.util4.setValue(false);
    }
    else{
      this.util4.enable();
    }
  }
}
