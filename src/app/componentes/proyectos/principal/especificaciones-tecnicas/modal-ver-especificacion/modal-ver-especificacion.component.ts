import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TinymceComponent } from 'angular2-tinymce';

@Component({
  selector: 'app-modal-ver-especificacion',
  templateUrl: './modal-ver-especificacion.component.html',
  styleUrls: ['./modal-ver-especificacion.component.scss']
})
export class ModalVerEspecificacionComponent implements OnInit, AfterViewInit {
  @Input() especificacion = null
  @ViewChild('tinymce2', { static: false }) public tinymce: TinymceComponent;

  constructor(private modal: NgbActiveModal) { }

  ngOnInit() {
  }

  ngAfterViewInit() {

  }
  closeModal(result: any = null) {
    this.modal.close();
  }
}
