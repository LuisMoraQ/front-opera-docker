import { itemsMenu } from './../../menu-proyecto-list';
import { SwalService } from 'src/app/servicios/swal.service';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PrincipalService } from 'src/app/servicios/principal.service';

@Component({
  selector: 'app-modal-hito',
  templateUrl: './modal-hito.component.html',
  styleUrls: ['./modal-hito.component.scss']
})
export class ModalHitoComponent implements OnInit {
  @Input() partidaSeleccionada = null
  @Input() fechaInicioProyecto = null
  @Input() idProyecto = null
  @Input() idUsuario = null
  @Input() dataPrincipal = []
  @Input() version = null
  formHito = new UntypedFormGroup({
    fechaInicio: new UntypedFormControl('', [Validators.required]),
    duracion: new UntypedFormControl(0,),
    fechaFin: new UntypedFormControl('', [Validators.required]),
    descripcion: new UntypedFormControl('', [Validators.required]),
    ubicacionFinal: new UntypedFormControl(1, [Validators.required])
  })
  itemRelacionado: any;
  uidReferencia: any;
  unidad: any;
  indiceIndexar: any;
  predecesor = ''
  ubicaciones = [{ id: 1, descripcion: 'Sin referencia y debajo de la selección' }, { id: 2, descripcion: 'Con referencia y debajo de la selección' }, { id: 3, descripcion: 'Con referencia y al final del grupo' }]
  get fechaInicio(): UntypedFormControl { return this.formHito.get('fechaInicio') as UntypedFormControl }
  get fechaFin(): UntypedFormControl { return this.formHito.get('fechaFin') as UntypedFormControl }
  get descripcion(): UntypedFormControl { return this.formHito.get('descripcion') as UntypedFormControl }
  get ubicacionFinal(): UntypedFormControl { return this.formHito.get('ubicacionFinal') as UntypedFormControl }

  constructor(private modal: NgbActiveModal,
    private principalService: PrincipalService,
    private toaster: ToastrService) { }

  async ngOnInit() {
    this.fechaInicio.setValue(this.partidaSeleccionada.fechaini)
    this.fechaFin.setValue(this.partidaSeleccionada.fechafin)
    if (!this.partidaSeleccionada.unidad) {
      this.ubicacionFinal.setValue(true)
    }
    await this.cambioPosicionCreacionPartida()
  }

  async cambioPosicionCreacionPartida() {
    if (this.ubicacionFinal.value == 3) {
      if (this.partidaSeleccionada.unidad) {
        let indiceIndexar = null
        const nivel = this.partidaSeleccionada.item.split('.').length
        let encontrado2, encontrado1
        for (let i = this.partidaSeleccionada.ind + 1; i < this.dataPrincipal.length; i++) {
          const nivel2 = this.dataPrincipal[i].item.split('.').length
          if (nivel2 < nivel) {
            encontrado2 = this.dataPrincipal[i]
            break;
          }
        }
        for (let i = this.partidaSeleccionada.ind - 1; i > 0; i--) {
          const nivel2 = this.dataPrincipal[i].item.split('.').length
          if (nivel2 < nivel) {
            encontrado1 = this.dataPrincipal[i]
            break;
          }
        }
        if (!encontrado2) {
          indiceIndexar = this.dataPrincipal.length
        } else {
          indiceIndexar = encontrado2.ind
        }
        this.itemRelacionado = encontrado1.item
        this.uidReferencia = encontrado1.uid
        this.unidad = encontrado1.unidad
        this.indiceIndexar = indiceIndexar
      } else {
        let indiceIndexar = null
        const nivel = this.partidaSeleccionada.item.split('.').length
        let encontrado2
        for (let i = this.partidaSeleccionada.ind + 1; i < this.dataPrincipal.length; i++) {
          const nivel2 = this.dataPrincipal[i].item.split('.').length
          if (nivel2 <= nivel) {
            encontrado2 = this.dataPrincipal[i]
            break;
          }
        }
        if (!encontrado2) {
          indiceIndexar = this.dataPrincipal.length
        } else {
          indiceIndexar = encontrado2.ind
        }
        this.itemRelacionado = this.partidaSeleccionada.item
        this.uidReferencia = this.partidaSeleccionada.uid
        this.unidad = this.partidaSeleccionada.unidad
        this.indiceIndexar = indiceIndexar
      }
      this.predecesor = (this.partidaSeleccionada.idgantt).toString()
    } else if (this.ubicacionFinal.value == 2) {
      if (this.partidaSeleccionada.unidad) {
        this.itemRelacionado = this.partidaSeleccionada.item
        this.uidReferencia = this.partidaSeleccionada.uid
        this.unidad = this.partidaSeleccionada.unidad
        this.indiceIndexar = this.partidaSeleccionada.idgantt
        this.predecesor = (this.partidaSeleccionada.idgantt).toString()
      } else {
        SwalService.warning('falta implementar', 'error')
        console.log('4', this.itemRelacionado, this.uidReferencia, this.unidad, this.indiceIndexar);
      }
    } else {
      this.indiceIndexar = this.partidaSeleccionada.idgantt
      this.predecesor = ''
      this.uidReferencia = this.partidaSeleccionada.uid
      this.itemRelacionado = this.partidaSeleccionada.item
      this.unidad = this.partidaSeleccionada.unidad
    }
  }

  async cambioUbicacion() {
    if (this.ubicacionFinal.value == 1) {
      this.predecesor = ''
    } else {
      this.predecesor = (this.partidaSeleccionada.idgantt).toString()
    }
  }

  async guardarHito() {
    try {
      if (this.formHito.invalid) {
        this.formHito.markAllAsTouched()
        this.toaster.error('Campos Incompletos', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return
      } else {
        const objPrincipal = {
          item: this.itemRelacionado,
          fechafin: this.fechaInicio.value,
          fechaInicio: this.fechaInicio.value,
          idgantt: this.partidaSeleccionada.idgantt,
          uid: null,
          unidad: this.unidad,
          descripcion: (this.descripcion.value).trim().toUpperCase(),
          ind: this.partidaSeleccionada.ind,
          indice_refer: this.uidReferencia,
          referencias: this.ubicacionFinal.value !== 1 ? (this.partidaSeleccionada.idgantt).toString() : '',
          referenciados: this.ubicacionFinal.value !== 1 ? JSON.stringify([[this.partidaSeleccionada.uid, '', '']]) : '',
          indiceIndexar: this.indiceIndexar,
          version: this.version
        }
        // const objectGuardar = {
        //   id_proyecto: this.idProyecto,
        //   descripcion: this.descripcion.value.trim().toUpperCase(),
        //   fechaini: this.fechaInicio.value,
        //   fechafin: this.fechaInicio.value,
        //   id_usuario: this.idUsuario,
        //   referencias: (this.partidaSeleccionada.idgantt).toString(),
        //   referenciados: JSON.stringify([[this.partidaSeleccionada.uid, '', '']]),
        //   indice_refer: this.uidReferencia
        // }
        // const response = await this.principalService.guardarHito(objectGuardar)
        // if (response[0].id == '1') {
        //   objPrincipal.uid = response[0].uid
        this.closeModal(objPrincipal);
        // }
      }
    } catch (e) {
      SwalService.error()
      console.log(e)
    }

  }

  closeModal(result: any = null) {
    this.modal.close(result);
  }
}
