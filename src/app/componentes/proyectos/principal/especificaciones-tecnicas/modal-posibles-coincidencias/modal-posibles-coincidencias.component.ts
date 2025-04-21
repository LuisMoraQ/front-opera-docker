import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalVerEspecificacionComponent } from '../modal-ver-especificacion/modal-ver-especificacion.component';

@Component({
  selector: 'app-modal-posibles-coincidencias',
  templateUrl: './modal-posibles-coincidencias.component.html',
  styleUrls: ['./modal-posibles-coincidencias.component.scss']
})
export class ModalPosiblesCoincidenciasComponent implements OnInit {
  @Input() partidaSel = null
  @Input() arrayPosibles = []
  @Input() listaProyUsuario = []
  mostrar_carga_todo = false
  buscando = false
  predeterminado = null
  cambiado = false
  constructor(private modal: NgbActiveModal, private modalService: NgbModal,) { }

  async ngOnInit() {
    await this.iniciarSeleccionado()
  }

  async iniciarSeleccionado() {
    let encontrado = null
    if (this.partidaSel) {
      if (this.partidaSel.vinculo_espproy2) {
        encontrado = await this.arrayPosibles.find(ele => ele.vinculo_espproy2 == this.partidaSel.vinculo_espproy2 && ele.vinculo_esp2 == this.partidaSel.vinculo_esp2)
      } else {
        encontrado = await this.arrayPosibles.find(ele => ele.vinculo_esp2 == this.partidaSel.vinculo_esp2)
      }
    }
    this.predeterminado = encontrado
  }

  cambioValorCheck(checked, row) {
    if (checked) {
      this.predeterminado = row
    } else {
      this.predeterminado = null
    }
    this.cambiado = true
  }

  closeModal(result: any = null) {

    this.modal.close({ result: result, cambiado: this.cambiado });
  }

  async vincularSeleccionado() {
    this.closeModal(this.predeterminado)
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async especTecnXPartida(item) {
    try {
      const modalRef = this.modalService.open(ModalVerEspecificacionComponent, {
        size: 'lg',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.especificacion = item.especificacion;
      const result = await modalRef.result;
      if (result) {

      }
    } catch (e) {
      console.log(e);
    }
  }
}
