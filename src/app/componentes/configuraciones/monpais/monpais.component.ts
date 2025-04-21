import { Component, Input, OnInit,Output,EventEmitter,HostListener,ViewChild } from '@angular/core';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component'
@Component({
  selector: 'app-monpais',
  templateUrl: './monpais.component.html',
  styleUrls: ['./monpais.component.scss']
})
export class MonpaisComponent implements OnInit {
  @Input('height') height: number = 100;
  mostrar_carga=false
  mostrar_carga_todo=false
  esSecund=false
  mostrar=false
  maximizar = false;
  dataSource=[]
  dataSource2=[]
  busqueda = '';
  busqueda2 = '';
  fila_sel:any
  fila_sel2:any
  editar=false
  ver=false
  datos
  @ViewChild("modalPais") modalPais: ModalBasicComponent
  @Output() expanded  = new EventEmitter<boolean>()

  constructor(
      private configuracionService: ConfiguracionService,
  ) { }

  async ngOnInit() {
      try {
          var resto = 200;
          if (document.body.clientWidth <= 992) {
            resto = 220;
            if (document.body.clientWidth <= 768) {
              this.height = (window.innerHeight - resto) / 2;
            } else {
              this.height = window.innerHeight - resto;
            }
          } else {
            this.height = window.innerHeight - resto;
          }
          // this.id_user = this._EncriptadorService.recuperarlocalstory('idusuario');
          this.dataSource = await this.configuracionService.listarPaises();
          this.dataSource2=  await this.configuracionService.listarMonedas();
          /* await this.listarUnidadesDeMedida2() */
        } catch (e) {
          SwalService.error()
          console.log(e);
        }

  }
  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }
  cambindicesel2(ind: any) {
    if (ind == this.fila_sel2)
      this.fila_sel2 = -1;
    else
      this.fila_sel2 = ind;
  }

  async expandir() {
    this.maximizar = !this.maximizar
    this.expanded.emit(this.maximizar)
  } 
  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 200;
    if (document.body.clientWidth <= 992) {
      resto = 220;
      if (document.body.clientWidth <= 768) {
        this.height = (window.innerHeight - resto) / 2;
      } else {
        this.height = window.innerHeight - resto;
      }
    } else {
      this.height = window.innerHeight - resto;
    }
  }
  async openModal(fuente:any,datos = null, editar = null, ver = null) {
    this.editar=editar
    this.ver=ver
    this.datos = datos;
    if(!editar && !ver){
      this.formPaises.get('abrev').setValue('')
    }else if(editar && !ver){

    }
    this.modalPais.show()
  }
  closeModal(){
    this.modalPais.hide()
  }
  almacenar(){

  }
  formPaises = new UntypedFormGroup({
    pais: new UntypedFormControl('', [Validators.required]),
    abrev: new UntypedFormControl('', [Validators.required]),
    codigo: new UntypedFormControl('', [Validators.required]),
    moneda:new UntypedFormControl(''),
  })
  get pais(): UntypedFormControl { return this.formPaises.get('pais') as UntypedFormControl }
  get abrev(): UntypedFormControl { return this.formPaises.get('abrev') as UntypedFormControl }
  get codigo(): UntypedFormControl { return this.formPaises.get('codigo') as UntypedFormControl }
  get moneda(): UntypedFormControl { return this.formPaises.get('moneda') as UntypedFormControl }
}
