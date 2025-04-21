import { mensaje } from './../../../../../servicios/signalrcustom.service';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
@Component({
  selector: 'app-modal-no-laborables',
  templateUrl: './modal-no-laborables.component.html',
  styleUrls: ['./modal-no-laborables.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ModalNoLaborablesComponent implements OnInit {
  mostrar_carga_todo = false
  buscando = false
  @Input() idproyecto = null
  @Input() inicioProyect = null
  @Input() fila = null
  @Input() tablaferiados = []
  @ViewChild('myForm') myForm: NgForm;
  // tablaferiados: any = [];
  actualizar: boolean = false;
  indexSeleccionado: any = null;
  arrayEliminados: any = [];
  actualizarPrincipal = false
  constructor(private modal: NgbActiveModal,
    private principalService: PrincipalService,
    private toaster: ToastrService) { }

  formDatos = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    fecha: new UntypedFormControl('', [Validators.required]),
    laborado: new UntypedFormControl(0),
    id_proyecto: new UntypedFormControl(null),
    nro: new UntypedFormControl(null)
  })

  get descripcion(): UntypedFormControl { return this.formDatos.get('descripcion') as UntypedFormControl }
  get fecha(): UntypedFormControl { return this.formDatos.get('fecha') as UntypedFormControl }
  get laborado(): UntypedFormControl { return this.formDatos.get('laborado') as UntypedFormControl }
  get id_proyecto(): UntypedFormControl { return this.formDatos.get('id_proyecto') as UntypedFormControl }
  get nro(): UntypedFormControl { return this.formDatos.get('nro') as UntypedFormControl }


  async ngOnInit() {
    try {
      this.buscando = true
      if (this.fila) {
        await this.recuperarFila(this.fila)
      }
      this.buscando = false
    } catch (error) {
      this.buscando = false
      SwalService.error()
      console.log(error);
    }
  }

  // async recuperarAspectos() {
  //   let resulta = await this.principalService.ListarAspectosDiasProy({ id_proyecto: this.idproyecto })
  //   if (resulta.length) {
  //     this.tablaferiados = resulta[1];
  //     console.log('this.tablaferiados', this.tablaferiados);
  //   }
  // }

  async agregarFila() {
    if (this.formDatos.invalid) {
      this.formDatos.markAllAsTouched()
      this.toaster.error('Datos incompletos', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return
    } else {
      const response = await this.verificarFechaValida()
      if (response) {
        this.toaster.error(response.texto, 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000
        })
        return
      } else {
        const obj = {
          id_proyecto: this.idproyecto,
          descripcion: this.descripcion.value.toUpperCase(),
          fecha: this.fecha.value,
          laborado: this.laborado.value,
          nro: null
        }
        this.closeModal(obj)
      }
    }
  }

  // async actualizarFila() {
  //   if (this.formDatos.invalid) {
  //     this.formDatos.markAllAsTouched()
  //     this.toaster.error('Datos incompletos', 'Error', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 5000
  //     })
  //     return
  //   } else {
  //     this.tablaferiados[this.indexSeleccionado].descripcion = (this.descripcion.value).toUpperCase()
  //     this.tablaferiados[this.indexSeleccionado].fecha = this.fecha.value
  //     this.tablaferiados[this.indexSeleccionado].laborado = this.laborado.value
  //     this.tablaferiados[this.indexSeleccionado].id_proyecto = this.id_proyecto.value
  //     this.tablaferiados[this.indexSeleccionado].nro = this.nro.value
  //     this.limpiarFormulario()
  //   }
  // }

  async limpiarFormulario() {
    this.formDatos.reset(
      { laborado: 0, descripcion: '', fecha: '', id_proyecto: this.idproyecto, nro: null }
    )
    this.myForm.resetForm();
    this.actualizar = false
    this.indexSeleccionado = null
  }

  async recuperarFila(fila) {
    this.actualizar = true
    this.descripcion.setValue(fila.descripcion)
    this.fecha.setValue(moment(fila.fecha).format('YYYY-MM-DD'))
    this.laborado.setValue(fila.laborado)
    this.id_proyecto.setValue(fila.id_proyecto)
    this.nro.setValue(fila.nro)
  }

  // async eliminarFila(fila, index) {
  //   const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la fila seleccionada')
  //   if (sw.isConfirmed) {
  //     if (fila.nro) {
  //       this.arrayEliminados.push(fila.nro)
  //     }
  //     this.tablaferiados.splice(index, 1)
  //   }
  // }

  async verificarFechaValida() {
    let valido = true
    let string = ''
    const fechaIniProy = moment(this.inicioProyect).format('YYYY-MM-DD')
    if (this.fecha.valid && (fechaIniProy >= this.fecha.value)) {
      // this.toaster.error('La fecha ingresada debe de ser mayor a : ' + moment(this.inicioProyect).format('DD-MM-YYYY'), 'Error', {
      //   closeButton: false,
      //   positionClass: 'toast-bottom-right',
      //   timeOut: 4000
      // })
      string = 'La fecha ingresada debe de ser mayor a : ' + moment(this.inicioProyect).format('DD-MM-YYYY')
      valido = false
    }
    if (!this.fila) {
      const encontrado = await this.tablaferiados.find(ele => moment(ele.fecha).format('YYYY-MM-DD') == moment(this.fecha.value).format('YYYY-MM-DD'))
      if (encontrado) {
        string = 'Fecha ya registrada'
        valido = false
      }
    } else {
      const encontrado = await this.tablaferiados.find(ele => {
        if (ele !== this.fila && moment(ele.fecha).format('YYYY-MM-DD') == moment(this.fecha.value).format('YYYY-MM-DD')) {
          return ele
        }
      })
      if (encontrado) {
        string = 'Fecha ya registrada en otro feriado'
        valido = false
      }
    }
    const respuesta = !valido ? { valido: valido, texto: string } : null
    return respuesta
  }

  // async guardar() {
  //   try {
  //     if (this.tablaferiados.length || this.arrayEliminados.length) {
  //       const sw = await SwalService.confirm('Estas seguro?', 'Se guardara todos los cambios realizados en la tabla')
  //       if (sw.isConfirmed) {
  //         this.mostrar_carga_todo = true
  //         this.limpiarFormulario()
  //         const datos1 = JSON.stringify(this.tablaferiados)
  //         const datos2 = JSON.stringify(this.arrayEliminados)
  //         const obj = JSON.stringify({
  //           'id_proyecto': this.idproyecto,
  //           'datos1': datos1,
  //           'datos2': datos2,
  //         });
  //         const response = await this.principalService.guardaCambiosTablaFeriados(obj)
  //         this.mostrar_carga_todo = false
  //         if (response.id == '1') {
  //           this.actualizarPrincipal = true
  //           this.toaster.success('Se guardo correctamente', 'Éxito', {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 5000
  //           })
  //           this.closeModal(this.actualizarPrincipal)

  //         } else {
  //           SwalService.error('Error', response.mensaje)
  //         }
  //       }
  //     } else {
  //       this.toaster.error('Ningun feriado agregado', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 5000
  //       })
  //       return
  //     }
  //   } catch (e) {
  //     SwalService.error()
  //     console.log(e);
  //     this.mostrar_carga_todo = false
  //   }
  // }


  closeModal(result: any) {
    this.modal.close(result)
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
}
