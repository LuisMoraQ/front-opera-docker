import { Component, OnInit,Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-datosinsumo',
  templateUrl: './datosinsumo.component.html',
  styleUrls: ['./datosinsumo.component.scss']
})
export class DatosinsumoComponent implements OnInit {
  mostrar_carga_todo=false;
  insumoSeleccionado: any = null;
  mostrarModal: boolean;
  active: any = 0;
  indiceSeleccionado: any = null;
  bloquearAcciones: boolean = false;
  @Input() rowinsumo;

  constructor(
    private modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    console.log(this.rowinsumo)
    this.insumoSeleccionado = this.rowinsumo
    this.active = 1
    this.bloquearAcciones = true;
  }
  closeModal(result: any = null) {
    this.modal.close(result)
  }
}
