import { Component, OnInit,Input } from '@angular/core';
import { FormArray, FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modaladdtitulo',
  templateUrl: './modaladdtitulo.component.html',
  styleUrls: ['./modaladdtitulo.component.scss']
})
export class ModaladdtituloComponent implements OnInit {
  mostrar_carga_todo = false
  formAgrega = new UntypedFormGroup({
    titulo: new UntypedFormControl('', [Validators.required]),
  })

  @Input() titmodal:any;
  get titulo(): UntypedFormControl { return this.formAgrega.get('titulo') as UntypedFormControl }

  constructor(
    private toaster: ToastrService,
    private modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    document.getElementById('descrip').focus();
  }

  async Guardar() {
    try {
      if (this.formAgrega.invalid) {
        this.formAgrega.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        /* this.mostrar_carga_todo = true
        this.mostrar_carga_todo = false */
          this.closeModal(this.titulo.value.toUpperCase())
      }
    } catch (e) {
      /* this.mostrar_carga_todo = false */
    }
  }
  keyaction(event:any){
    try {
      if(event.keyCode.toString() == "13")
      {
        if (this.formAgrega.invalid) {
          this.formAgrega.markAllAsTouched()
          this.toaster.error('Datos incompletos', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
          return
        } else {
            this.closeModal(this.titulo.value.toUpperCase())
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  closeModal(result: any = null) {
    this.modal.close(result)
  }
}
