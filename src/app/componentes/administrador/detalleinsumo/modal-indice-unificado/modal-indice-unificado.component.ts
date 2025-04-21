import { SwalService } from './../../../../servicios/swal.service';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { FormsService } from 'src/app/servicios/forms.service';

@Component({
  selector: 'app-modal-indice-unificado',
  templateUrl: './modal-indice-unificado.component.html',
  styleUrls: ['./modal-indice-unificado.component.scss']
})
export class ModalIndiceUnificadoComponent implements OnInit {
  @Input() editar = null
  @Input() datos = null
  @Input() ver = null
  mostrar_carga_todo=false;
  formIndiceUnificado = new UntypedFormGroup({
    id_indice: new UntypedFormControl('', [Validators.required,Validators.minLength(2),Validators.maxLength(2)]),
    descripcion: new UntypedFormControl('', [Validators.required]),
    abrev: new UntypedFormControl(''),
    activo: new UntypedFormControl(true, [Validators.required])
  })
  estado : any 
  get id_indice(): UntypedFormControl { return this.formIndiceUnificado.get('id_indice') as UntypedFormControl }
  get descripcion(): UntypedFormControl { return this.formIndiceUnificado.get('descripcion') as UntypedFormControl }
  get abreviatura(): UntypedFormControl { return this.formIndiceUnificado.get('abrev') as UntypedFormControl }
  get activo(): UntypedFormControl { return this.formIndiceUnificado.get('activo') as UntypedFormControl }
  constructor(private modal: NgbActiveModal,
    private toaster: ToastrService,
    public formService: FormsService,
    private configuracionService: ConfiguracionService) { }

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
        this.formIndiceUnificado.reset({
          id_indice: this.datos?.id_indice,
          descripcion: this.datos?.desc_indice,
          abrev:this.datos?.abrev,
          activo: this.datos?.activo == 1 ? true: false 
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
      if (this.formIndiceUnificado.invalid) {
        this.formIndiceUnificado.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        const dataUsuario = {
          id_indice: this.id_indice.value ,
          desc_indice: this.descripcion.value.toUpperCase(),
          abrev:this.abreviatura.value.trim().toUpperCase(),
          activo: this.activo.value == true ?  1: 0,
        }
        this.mostrar_carga_todo=true;
        const respuesta=await this.configuracionService.guardarIndiceUnificado(dataUsuario)
        this.mostrar_carga_todo=false;
        // this.toaster.success('Se guardo correctamente', 'Éxito', {
        //   closeButton: false,
        //   positionClass: 'toast-bottom-right',
        //   timeOut: 5000
        // })
        if(respuesta[0].id=="0"){
          SwalService.error('Advertencia',respuesta[0].mensaje)
        }
        else{
          this.closeModal('ok')
        }
      }
    } catch (e) {
      console.log(e);
      SwalService.error()
    }

  }

  async actualizar() {
    try {
      if (this.formIndiceUnificado.invalid) {
        this.formIndiceUnificado.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        const dataUsuario = {
          id_indice: this.id_indice.value ,
          desc_indice: this.descripcion.value.toUpperCase(),
          abrev:this.abreviatura.value.trim().toUpperCase(),
          activo: this.activo.value == true ?  1: 0,
        }
        this.mostrar_carga_todo=true;
        const respuesta=await this.configuracionService.editarIndiceUnificado(dataUsuario)
        this.mostrar_carga_todo=false;
        // this.toaster.success('Se actualizò correctamente', 'Éxito', {
        //   closeButton: false,
        //   positionClass: 'toast-bottom-right',
        //   timeOut: 5000
        // })
        if(respuesta[0].id=="1"){
          this.closeModal('ok')
        }
        else{
          SwalService.error('Advertencia',respuesta[0].mensaje)
        }
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
