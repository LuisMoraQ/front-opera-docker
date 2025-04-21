import { AdministradorService } from 'src/app/servicios/administrador.service';
import { ToastrService } from 'ngx-toastr';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalService } from 'src/app/servicios/swal.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

export interface tipoInsumo {
  activo: number;
  desc_tipo_insumo: string;
  id_tipo_insumo: number
}
@Component({
  selector: 'app-modal-clasificacion-comercial',
  templateUrl: './modal-clasificacion-comercial.component.html',
  styleUrls: ['./modal-clasificacion-comercial.component.scss']
})
export class ModalClasificacionComercialComponent implements OnInit {
  @Input() editar = null
  @Input() datos = null
  @Input() ver = null
  @Input() tipoInsumos: tipoInsumo[] = [];
  @Input() insumosel='';
  @Input() fuentepasa = 0;
  @Input() bloqtipo = false;
  @Input() id_user;
  valactivo=true;

  mostrar_carga_todo = false;
  formClasificacionComercial = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    abrev: new UntypedFormControl('', [Validators.required]),
    id_tipo:new UntypedFormControl('', [Validators.required]),
    activo: new UntypedFormControl(true, [Validators.required])
  })
  estado: any
  get descripcion(): UntypedFormControl { return this.formClasificacionComercial.get('descripcion') as UntypedFormControl }
  get abreviatura(): UntypedFormControl { return this.formClasificacionComercial.get('abrev') as UntypedFormControl }
  get id_tipo(): UntypedFormControl { return this.formClasificacionComercial.get('id_tipo') as UntypedFormControl }
  get activo(): UntypedFormControl { return this.formClasificacionComercial.get('activo') as UntypedFormControl }
  constructor(private modal: NgbActiveModal,
    private administradorService: AdministradorService,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService) { }

  async ngOnInit() {
    this.id_user = this.id_user??this.encriptadorService.recuperarlocalstory('idusuario');
    this.valactivo=this.datos?.activo == 1 ? true : false;
    await this.accionModal()
  }

  async accionModal() {
    try {
      if (this.editar) {
        this.formClasificacionComercial.reset({
          descripcion: this.datos?.desc_clasi,
          abrev: this.datos?.abrev,
          id_tipo:this.datos?.id_tipo_insumo,
          activo: this.datos?.activo == 1 ? true : false
        })
        this.id_tipo.disable();
      }else{
        if(this.bloqtipo && this.insumosel!=''){
          this.id_tipo.disable();
          this.id_tipo.setValue(this.insumosel);
        }
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
      if (this.formClasificacionComercial.invalid) {
        this.formClasificacionComercial.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        const dataClasificacion = {
          desc_clasi: this.descripcion.value.toUpperCase(),
          abrev: (this.abreviatura.value).trim().toUpperCase(),
          id_tipo_insumo:this.id_tipo.value,
          activo: this.activo.value == true ? 1 : 0,
          id_usuario:this.id_user,
          fuente:this.fuentepasa
        }
        this.mostrar_carga_todo = true;
        const respuesta = await this.administradorService.guardarClasiInsumosData(dataClasificacion)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == "0") {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
        else {
          let objresp={
            id_clasificacion:respuesta[0].idadd,
            id_tipo:this.id_tipo.value,
            desc_clasi:this.descripcion.value.toUpperCase()
          }
          this.closeModal(objresp);
        }
      }
    } catch (e) {
      console.log(e);
      SwalService.error()
    }

  }

  async actualizar() {
    try {
      if (this.formClasificacionComercial.invalid) {
        this.formClasificacionComercial.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        const editClasificacion = {
          id_clasificacion: this.datos?.id_clasificacion,
          desc_clasi: this.descripcion.value.toUpperCase(),
          abrev: (this.abreviatura.value).trim().toUpperCase(),
          //id_tipo_insumo:this.id_tipo.value,
          activo: this.activo.value == true ? 1 : 0,
        }
        this.mostrar_carga_todo = true;
        const respuesta = await this.administradorService.modificarClasiInsumosData(editClasificacion)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == "1") {
          let objresp={
            id_clasificacion:respuesta[0].idadd,
            id_tipo:this.id_tipo.value
          }
          this.closeModal(objresp)
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
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
