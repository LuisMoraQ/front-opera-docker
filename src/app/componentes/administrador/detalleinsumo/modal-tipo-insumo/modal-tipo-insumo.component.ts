import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-modal-tipo-insumo',
  templateUrl: './modal-tipo-insumo.component.html',
  styleUrls: ['./modal-tipo-insumo.component.scss']
})
export class ModalTipoInsumoComponent implements OnInit {
  @Input() editar = null
  @Input() datos = null
  @Input() ver = null
  formTipoInsumo = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    abrev:new UntypedFormControl('', [Validators.required]),
    esinsumo:new UntypedFormControl(true, [Validators.required]),
    afcuadrilla:new UntypedFormControl(true, [Validators.required]),
    activo: new UntypedFormControl(true, [Validators.required])
  })
  estado : any 
  get descripcion(): UntypedFormControl { return this.formTipoInsumo.get('descripcion') as UntypedFormControl }
  get abrev(): UntypedFormControl { return this.formTipoInsumo.get('abrev') as UntypedFormControl }
  get esinsumo(): UntypedFormControl { return this.formTipoInsumo.get('esinsumo') as UntypedFormControl }
  get afcuadrilla(): UntypedFormControl { return this.formTipoInsumo.get('afcuadrilla') as UntypedFormControl }
  get activo(): UntypedFormControl { return this.formTipoInsumo.get('activo') as UntypedFormControl }
  constructor(private modal: NgbActiveModal,
    private toaster: ToastrService,
    public formService: FormsService,
    private configuracionService: ConfiguracionService) { }

    mostrar_carga_todo=false;

  async ngOnInit() {
    try {
      this.estado = this.datos?.activo == 1 ? true: false
      await this.accionModal()
    } catch (e) {
      console.log(e);

    }
  }

  async accionModal() {
    try {
      if (this.editar) {
        this.formTipoInsumo.reset({
          descripcion: this.datos?.desc_tipo_insumo,
          abrev: this.datos?.abrev,
          esinsumo:this.datos.esinsumo==1?true:false,
          activo: this.datos.activo == 1 ? true: false
        })
      }
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
      if (this.formTipoInsumo.invalid) {
        this.formTipoInsumo.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        const dataUsuario = {
          desc_tipo_insumo: this.descripcion.value.toUpperCase(),
          abrev:this.abrev.value.trim().toUpperCase(),
          esinsumo:this.esinsumo.value?1:0,
          afcuadrilla:this.afcuadrilla.value?1:0,
          activo: String(this.activo.value == true ?  1: 0),
        }
        this.mostrar_carga_todo=true;
        const respuesta=await this.configuracionService.guardarTipoInsumo(dataUsuario)
        this.mostrar_carga_todo=false;
        if(respuesta[0].id=="1"){
          this.closeModal('ok')
        }
        else{
          SwalService.error('Advertencia',respuesta[0].mensaje)
        }
        // this.toaster.success('Se guardo correctamente', 'Éxito', {
        //   closeButton: false,
        //   positionClass: 'toast-bottom-right',
        //   timeOut: 5000
        // })
      }
    } catch (e) {
      console.log(e);
      SwalService.error()
    }

  }

  async actualizar() {
    try {
      if (this.formTipoInsumo.invalid) {
        this.formTipoInsumo.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        const dataUsuario = {
          id_tipo_insumo: this.datos?.id_tipo_insumo,
          desc_tipo_insumo: this.descripcion.value.toUpperCase() ,
          abrev:this.abrev.value.trim().toUpperCase(),
          esinsumo:this.esinsumo.value?1:0,
          afcuadrilla:this.afcuadrilla.value?1:0,
          activo: this.activo.value == true ?  1: 0,
        }
        this.mostrar_carga_todo=true;
        const respuesta=await this.configuracionService.editarTipoInsumo(dataUsuario)
        this.mostrar_carga_todo=false;
        if(respuesta[0].id=="1"){
          this.closeModal('ok')
        }
        else{
          SwalService.error('Advertencia',respuesta[0].mensaje);
        }
        // this.toaster.success('Se actualizò correctamente', 'Éxito', {
        //   closeButton: false,
        //   positionClass: 'toast-bottom-right',
        //   timeOut: 5000
        // })
      }
    } catch (e) {
      console.log(e);
      SwalService.error()
    }
  }

  closeModal(result: any = null) {
    this.modal.close(result)
  }
}
