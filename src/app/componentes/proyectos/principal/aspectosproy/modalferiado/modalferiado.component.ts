import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Component({
  selector: 'app-modalferiado',
  templateUrl: './modalferiado.component.html',
  styleUrls: ['./modalferiado.component.scss']
})
export class ModalferiadoComponent implements OnInit {
  mostrar_carga_todo = false;
  @Input() editar = false;
  @Input() datos = null;
  @Input() id_proyecto = '';
  @Input() nro = '';

  formDatos = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    fecha: new UntypedFormControl('', [Validators.required]),
    laborado: new UntypedFormControl(false),
  })

  get descripcion(): UntypedFormControl { return this.formDatos.get('descripcion') as UntypedFormControl }
  get fecha(): UntypedFormControl { return this.formDatos.get('fecha') as UntypedFormControl }
  get laborado(): UntypedFormControl { return this.formDatos.get('laborado') as UntypedFormControl }

  constructor(
    private modal: NgbActiveModal,
    private principalService: PrincipalService,
    private toaster: ToastrService
  ) { }

  ngOnInit(): void {
    try {
      this.accionModal()
    } catch (e) {
      SwalService.error()
      console.log(e);
    }
  }
  async accionModal() {
    if (this.editar) {
      let fechaform = moment(this.datos.fecha).format('YYYY-MM-DD');
      this.formDatos.reset({
        descripcion: this.datos?.descripcion,
        fecha: fechaform,
        laborado: this.datos?.laborado == 1 ? true : false,
      })
    }
  }
  async guardar() {
    try {
      if (!this.editar) {//guardar
        if (this.formDatos.invalid) {
          this.formDatos.markAllAsTouched()
          this.toaster.error('Datos incompletos', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
          return
        } else {
          const sw = await SwalService.confirm('Estas seguro?', 'Se actualizara la programacion de la obra')
          if (sw.isConfirmed) {
            this.mostrar_carga_todo = true
            const body = {
              id_proyecto: this.id_proyecto,
              descripcion: this.descripcion.value.toUpperCase(),
              fecha: this.fecha.value,
              laborado: this.laborado.value ? 1 : 0,
            };
            const response = await this.principalService.GuardarFeriadosDiasProy(body)
            // this.mostrar_carga_todo = false
            if (response[0].id == "1") {
              this.closeModal(response)
            }
            else {
              this.mostrar_carga_todo = false
              SwalService.error('Advertencia', response.mensaje)
            }
          }
        }
      }
      else {//editar
        if (this.formDatos.invalid) {
          this.formDatos.markAllAsTouched()
          this.toaster.error('Datos incompletos', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
          return
        } else {
          const sw = await SwalService.confirm('Estas seguro?', 'Se actualizara la programacion de la obra')
          if (sw.isConfirmed) {
            this.mostrar_carga_todo = true
            const body = {
              'id_proyecto': this.id_proyecto,
              'nro': this.nro,
              'descripcion': this.descripcion.value.toUpperCase(),
              'fecha': this.fecha.value,
              'laborado': this.laborado.value ? 1 : 0,
            };
            const response = await this.principalService.ModificarFeriadosDiasProy(body)
            if (response[0].id == "1") {
              this.closeModal(response)
            }
            else {
              this.mostrar_carga_todo = false
              SwalService.error('Advertencia', response.mensaje)
            }
          }
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  closeModal(result: any) {
    this.modal.close(result)
  }
}
