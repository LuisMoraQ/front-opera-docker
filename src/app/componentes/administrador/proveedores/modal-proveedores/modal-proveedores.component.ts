import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { FormsService } from 'src/app/servicios/forms.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ToastrService } from 'ngx-toastr';
import { AdministradorService } from 'src/app/servicios/administrador.service';

@Component({
  selector: 'app-modal-proveedores',
  templateUrl: './modal-proveedores.component.html',
  styleUrls: ['./modal-proveedores.component.scss']
})
export class ModalProveedoresComponent implements OnInit {
  @Input() editar = null
  @Input() datos = null
  @Input() ver = null
  @Input() departamentos = []
  mostrar_carga_todo = false

  formProveedor = new UntypedFormGroup({
    nrodoc: new UntypedFormControl('', [Validators.required, Validators.minLength(11)]),
    nombre_razon: new UntypedFormControl('', [Validators.required]),
    direccion: new UntypedFormControl('', []),
    telefono: new UntypedFormControl('', []),
    correo: new UntypedFormControl('', []),
    id_departamento: new UntypedFormControl('', []),
    estado: new UntypedFormControl(true, [])
  })

  get nrodoc(): UntypedFormControl { return this.formProveedor.get('nrodoc') as UntypedFormControl }
  get nombre_razon(): UntypedFormControl { return this.formProveedor.get('nombre_razon') as UntypedFormControl }
  get direccion(): UntypedFormControl { return this.formProveedor.get('direccion') as UntypedFormControl }
  get telefono(): UntypedFormControl { return this.formProveedor.get('telefono') as UntypedFormControl }
  get correo(): UntypedFormControl { return this.formProveedor.get('correo') as UntypedFormControl }
  get id_departamento(): UntypedFormControl { return this.formProveedor.get('id_departamento') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formProveedor.get('estado') as UntypedFormControl }
  constructor(private modal: NgbActiveModal,
    private toaster: ToastrService,
    private administradorService: AdministradorService,
    public formService: FormsService) { }

  async ngOnInit() {
    await this.accionModal()
  }

  async accionModal() {
    if (this.editar) {
      this.formProveedor.reset({
        nrodoc: this.datos?.nrodoc,
        nombre_razon: this.datos?.nombre_razon,
        direccion: this.datos?.direccion ? this.datos.direccion : '',
        telefono: this.datos?.telefono ? this.datos.telefono : '',
        correo: this.datos?.correo ? this.datos.correo : '',
        id_departamento: this.datos?.id_departamento ? this.datos.id_departamento : '',
        estado: this.datos?.activo ? true : false
      })
    }
  }

  async almacenar() {
    if (this.editar) {
      await this.actualizar()
    } else {
      await this.guardar()
    }
  }
  async guardar() {
    try {
      if (this.formProveedor.invalid) {
        this.formProveedor.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true
        const input = {
          nrodoc: this.nrodoc.value,
          nombre_razon: (this.nombre_razon.value).toUpperCase().trim(),
          direccion: this.direccion.value,
          telefono: (this.telefono.value).trim(),
          correo: (this.correo.value).trim(),
          id_departamento: this.id_departamento.value,
          activo: this.estado.value ? 1 : 0,
        }
        const response = await this.administradorService.guardarProveedores(input)
        this.mostrar_carga_todo = false
        if (response.id == "1") {
          SwalService.success()
          await this.closeModal('ok')
        } else {
          SwalService.error('Advertencia', response.mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }


  async actualizar() {
    try {
      if (this.formProveedor.invalid) {
        this.formProveedor.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true
        const input = {
          id_proveedor: this.datos.id_proveedor,
          nrodoc: this.nrodoc.value,
          nombre_razon: (this.nombre_razon.value).toUpperCase().trim(),
          direccion: this.direccion.value,
          telefono: (this.telefono.value).trim(),
          correo: (this.correo.value).trim(),
          id_departamento: this.id_departamento.value,
          activo: this.estado.value ? 1 : 0,
        }
        const response = await this.administradorService.editarProveedores(input)
        this.mostrar_carga_todo = false
        if (response.id == "1") {
          SwalService.success()
          await this.closeModal('ok')
        } else {
          SwalService.error('Advertencia', response.mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }

  closeModal(result: any = null) {
    this.modal.close(result)
  }
}
