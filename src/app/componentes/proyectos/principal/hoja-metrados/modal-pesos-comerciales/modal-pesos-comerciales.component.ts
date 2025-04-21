import { mensaje } from './../../../../../servicios/signalrcustom.service';
import { SwalService } from './../../../../../servicios/swal.service';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { ToastrService } from 'ngx-toastr';

export interface pesoModel {
  id_peso: number;
  medida: string;
  peso: number;
  estado: number;
  id_usuario: number;
  fuente: number;
  tipoacero: string;
  bloqueado: boolean;
}
@Component({
  selector: 'app-modal-pesos-comerciales',
  templateUrl: './modal-pesos-comerciales.component.html',
  styleUrls: ['./modal-pesos-comerciales.component.scss'],
})
export class ModalPesosComercialesComponent implements OnInit {
  mostrar_cargar_todo = false
  listaPesos: pesoModel[] = [];
  seleccionado = null;
  buscando = false;
  @Input() id_usuario = null;
  formPesoComercial = new UntypedFormGroup({
    id: new UntypedFormControl(''),
    medida: new UntypedFormControl('', [Validators.required]),
    peso: new UntypedFormControl('', [Validators.required, Validators.min(0.1)]),
    tipoacero: new UntypedFormControl('CORRUGADO', [Validators.required]),
    estado: new UntypedFormControl(false, []),
  });
  itemSeleccionado = null;
  actualizarPrincipal = false;
  eliminados = [];
  @Input() ocultosPesorCom = [];
  @Input() tablaAcerosProyecto = []
  get id(): UntypedFormControl {
    return this.formPesoComercial.get('id') as UntypedFormControl;
  }
  get medida(): UntypedFormControl {
    return this.formPesoComercial.get('medida') as UntypedFormControl;
  }
  get peso(): UntypedFormControl {
    return this.formPesoComercial.get('peso') as UntypedFormControl;
  }
  get estado(): UntypedFormControl {
    return this.formPesoComercial.get('estado') as UntypedFormControl;
  }
  get tipoacero(): UntypedFormControl {
    return this.formPesoComercial.get('tipoacero') as UntypedFormControl;
  }

  constructor(
    private modal: NgbActiveModal,
    public formsService: FormsService,
    private metradoService: MetradoService,
    private toaster: ToastrService
  ) {}

  async ngOnInit() {
    try {
      await this.listarPesosPorUsuario();
    } catch (e) {
      console.log(e);
      SwalService.error();
    }
  }

  async cambioCheckbox(check, i) {
    this.listaPesos[i].estado = check ? 1 : 0;
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async editarRow(item, i) {
    this.itemSeleccionado = i;
    this.formPesoComercial.patchValue({
      id: item.id_peso,
      medida: item.medida,
      peso: item.peso,
      estado: item.estado,
      tipoacero: item.tipoacero ? item.tipoacero : 'CORRUGADO',
      bloqueado: item.bloqueado
    });
  }

  async actualizarFila() {
    if (
      this.formPesoComercial.invalid ||
      !this.medida.value ||
      !this.peso.value
    ) {
      if (!this.medida.value) {
        this.medida.setErrors({ incorrect: true });
      }
      if (!this.peso.value) {
        this.peso.setErrors({ incorrect: true });
      }
      this.formPesoComercial.markAllAsTouched();
      this.toaster.error('Datos incompletos', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    } else {
      const encontrado = await this.listaPesos.find(
        (ele, index) =>
          ele.medida == this.medida.value && this.itemSeleccionado !== index
      );
      if (encontrado) {
        this.medida.setErrors({ incorrect: true });
        this.toaster.error('Medida existente', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else {
        const item = this.listaPesos[this.itemSeleccionado];
        var row: pesoModel = {
          estado: item.estado,
          fuente: item.fuente,
          id_peso: item.id_peso,
          id_usuario: item.id_usuario,
          medida: this.medida.value,
          tipoacero: this.tipoacero.value,
          peso: this.peso.value,
          bloqueado: false
        };
        this.listaPesos[this.itemSeleccionado] = row;
        this.itemSeleccionado = null;
        this.limpiarFormulario();
      }
    }
  }

  async agregarPesoComercial() {
    if (
      this.formPesoComercial.invalid ||
      !this.medida.value ||
      !this.peso.value
    ) {
      if (!this.medida.value) {
        this.medida.setErrors({ incorrect: true });
      }
      if (!this.peso.value) {
        this.peso.setErrors({ incorrect: true });
      }
      this.formPesoComercial.markAllAsTouched();
      this.toaster.error('Datos incompletos', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    } else {
      const encontrado = await this.listaPesos.find(
        (ele) => ele.medida == this.medida.value
      );
      if (encontrado) {
        this.medida.setErrors({ incorrect: true });
        this.toaster.error('Medida existente', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else {
        var row: pesoModel = {
          estado: 1,
          fuente: 1,
          id_peso: null,
          id_usuario: this.id_usuario,
          medida: this.medida.value,
          peso: this.peso.value,
          tipoacero: this.tipoacero.value,
          bloqueado: false
        };
        this.listaPesos.push(row);
        this.limpiarFormulario();
      }
    }
  }

  limpiarFormulario() {
    this.formPesoComercial.patchValue({
      id: '',
      medida: '',
      peso: '',
      estado: false,
      tipoacero: 'CORRUGADO',
    });
    this.medida.markAsPending();
    this.peso.markAsPending();
    this.medida.markAsUntouched();
    this.peso.markAsUntouched();
  }

  async listarPesosPorUsuario() {
    const obj = {
      id_usuario: this.id_usuario,
      estado: '',
    };
    const response = await this.metradoService.listarPesosComerciales(obj);
    console.log('response', JSON.parse(JSON.stringify(response)))
    if (response.length) {
      let k = 0
      for (const iterator of response) {
        iterator.tipoacero = iterator.tipoacero
          ? iterator.tipoacero
          : 'CORRUGADO';
        // const valor =
        //   iterator.medida + '|' + iterator.peso + '|' + iterator.tipoacero;
        if (this.ocultosPesorCom[k]?.includes(Number(this.id_usuario))) {
          iterator.estado = 0;
        } else {
          iterator.estado = 1;
        }
        const a =
        iterator.medida +
        (iterator.tipoacero
          ? iterator.tipoacero == 'CORRUGADO'
            ? '(C)'
            : '(L)'
          : '(C)');
        const encontrado = await this.tablaAcerosProyecto.find(ele => ele.diametro?.replace('\\', '') == a)
        iterator.bloqueado = encontrado ? true: false
        k++
      }
      this.listaPesos = response;
    } else {
      this.listaPesos = [];
    }
  }

  async guardarTablaPesosMetrado() {
    try {
      this.mostrar_cargar_todo = true
      this.ocultosPesorCom = [];
      this.ocultosPesorCom.length = 10
      let k = 0
      for (const element of this.listaPesos) {
        if (element.fuente == 0 && !element.estado) {
          const id_usuario = Number(this.id_usuario)
          if (!this.ocultosPesorCom[k]?.includes(id_usuario)) {
            this.ocultosPesorCom[k] = (!this.ocultosPesorCom[k]?.length ? [id_usuario] : this.ocultosPesorCom[k].push(id_usuario))
          }
          element.estado = 1;
        }
        k++
      }
      const datos1 = JSON.stringify(this.listaPesos);
      const datos2 = JSON.stringify(this.eliminados);
      const obj = JSON.stringify({
        datos1: datos1,
        datos2: datos2,
      });
      const response = await this.metradoService.guardarPesosComerciales(obj);
      if (response.id == '1') {
        
        this.closeModal(true);

      } else {
        this.mostrar_cargar_todo = false

        SwalService.error(response.mensaje);
        return;
      }
    } catch (e) {
      this.mostrar_cargar_todo = false
      SwalService.error(e);
      console.log(e);
    }
  }

  async eliminarPesoComercial(i, peso) {
    const sw = await SwalService.confirm(
      'esta seguro?',
      'Se eliminará el peso comercial : ' + peso.medida
    );
    if (sw.isConfirmed) {
      if (peso.id_peso) {
        const existe = await this.eliminados.find((ele) => ele == peso.id_peso);
        if (!existe) {
          this.eliminados.push(peso.id_peso);
        }
      }
      this.listaPesos.splice(i, 1);
    }
  }

  closeModal(guardar = null) {
    if (guardar) {
      this.modal.close(this.ocultosPesorCom);
    } else {
      this.modal.close(null);
    }
  }
}
