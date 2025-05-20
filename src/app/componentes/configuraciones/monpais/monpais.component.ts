import { Component, Input, OnInit,Output,EventEmitter,HostListener,ViewChild } from '@angular/core';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component'
import { ToastrService } from 'ngx-toastr';
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
  expandido: 'ninguno' | 'div1' | 'div2' = 'ninguno';
  @ViewChild("modalPais") modalPais: ModalBasicComponent
  @ViewChild("modalMoneda") modalMoneda: ModalBasicComponent
  @Output() expanded  = new EventEmitter<boolean>()

  constructor(
      private configuracionService: ConfiguracionService,
      private toaster: ToastrService,
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
          await this.listarPaises()
          await this.listarMonedas()
        } catch (e) {
          SwalService.error()
          console.log(e);
        }
  }
  async listarPaises(){
    this.dataSource = await this.configuracionService.listarPaises();
  }
  async listarMonedas(){
    this.dataSource2=  await this.configuracionService.listarMonedas();
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
  FindMoneda(value){
    return this.dataSource2.find(item=>item.id_moneda==value)?.simbolo
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

  async openModal(fuente:any,datos = null, editar = null, ver = null) {
    this.editar=editar
    this.ver=ver
    if(!editar && !ver){
      this.formPaises.get('abrev').setValue('')
      this.formPaises.get('pais').setValue('')
      this.formPaises.get('codigo').setValue('')
      this.formPaises.get('moneda').setValue('')
    }else if(editar && !ver){
      this.datos=datos
      this.formPaises.get('abrev').setValue(datos?.clave)
      this.formPaises.get('pais').setValue(datos?.pais)
      this.formPaises.get('codigo').setValue(datos?.codigo)
      this.formPaises.get('moneda').setValue(datos?.id_moneda==null?'':datos.id_moneda)
    }else{
      this.datos =datos
    }
    this.modalPais.show()
  }
  closeModal(){
    this.modalPais.hide()
  }
  async almacenar(){
    if (!this.editar) {
      await this.guardar()
    } else {
      await this.actualizar()
    }
  }
  async guardar() {
    try {
      if (this.formPaises.invalid) {
        this.formPaises.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true;
        const datos= {
          pais:this.formPaises.get('pais').value.toUpperCase(),
          clave:this.formPaises.get('abrev').value.toUpperCase(),
          codigo:this.formPaises.get('codigo').value.toUpperCase(),
          id_moneda:this.formPaises.get('moneda').value,
        }
        const respuesta = await this.configuracionService.GuardarPaises(datos)
        this.mostrar_carga_todo = false;
        if (respuesta[0].res == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          await this.listarPaises()
          this.closeModal()
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error()
    }
  }
  async actualizar() {
    try {
      if (this.formPaises.invalid) {
        this.formPaises.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true;
        const datos= {
          cod_pais:this.datos.cod_pais,
          pais:this.formPaises.get('pais').value.toUpperCase(),
          clave:this.formPaises.get('abrev').value.toUpperCase(),
          codigo:this.formPaises.get('codigo').value.toUpperCase(),
          id_moneda:this.formPaises.get('moneda').value,
        }
        const respuesta = await this.configuracionService.ModificarPais(datos)
        this.mostrar_carga_todo = false;
        if (respuesta[0].res == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          await this.listarPaises()
          this.closeModal()
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error()
    }
  }
  async eliminarPais(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el pais seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarPais = {
          cod_pais: row.cod_pais
        }
        const respuesta = await this.configuracionService.EliminarPais(eliminarPais)
        this.mostrar_carga_todo = false;
        if (respuesta[0].res == "1") {
          SwalService.success()
          await this.listarPaises()
        }else {
          SwalService.error('Advertencia', respuesta[0].mensaje);
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
  formMoneda = new UntypedFormGroup({
    moneda2: new UntypedFormControl('', [Validators.required]),
    abrev2: new UntypedFormControl('', [Validators.required]),
    simbolo: new UntypedFormControl('', [Validators.required]),
  })
  get moneda2(): UntypedFormControl { return this.formMoneda.get('moneda2') as UntypedFormControl }
  get abrev2(): UntypedFormControl { return this.formMoneda.get('abrev2') as UntypedFormControl }
  get simbolo(): UntypedFormControl { return this.formMoneda.get('simbolo') as UntypedFormControl }

  async openModal2(fuente:any,datos = null, editar = null, ver = null) {
    this.editar=editar
    this.ver=ver
    if(!editar && !ver){
      this.formMoneda.get('abrev2').setValue('')
      this.formMoneda.get('moneda2').setValue('')
      this.formMoneda.get('simbolo').setValue('')
    }else if(editar && !ver){
      this.datos=datos
      this.formMoneda.get('abrev2').setValue(datos?.abreviatura)
      this.formMoneda.get('moneda2').setValue(datos?.moneda)
      this.formMoneda.get('simbolo').setValue(datos?.simbolo)
    }else{
      this.datos=datos
    }
    this.modalMoneda.show()
  }
  closeModal2(){
    this.modalMoneda.hide()
  }
  async almacenar2(){
    if (!this.editar) {
      await this.guardar2()
    } else {
      await this.actualizar2()
    }
  }
  async guardar2() {
    try {
      if (this.formMoneda.invalid) {
        this.formMoneda.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true;
        const datos= {
          moneda:this.formMoneda.get('moneda2').value.toUpperCase(),
          simbolo:this.formMoneda.get('simbolo').value.toUpperCase(),
          abreviatura:this.formMoneda.get('abrev2').value.toUpperCase(),
        }
        const respuesta = await this.configuracionService.GuardarMoneda(datos)
        this.mostrar_carga_todo = false;
        if (respuesta[0].res == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          await this.listarMonedas()
          this.closeModal2()
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error()
    }
  }
  async actualizar2() {
    try {
      if (this.formMoneda.invalid) {
        this.formMoneda.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true;
        const datos= {
          id_moneda:this.datos.id_moneda,
          moneda:this.formMoneda.get('moneda2').value.toUpperCase(),
          simbolo:this.formMoneda.get('simbolo').value.toUpperCase(),
          abreviatura:this.formMoneda.get('abrev2').value.toUpperCase(),
        }
        const respuesta = await this.configuracionService.ModificarMoneda(datos)
        this.mostrar_carga_todo = false;
        if (respuesta[0].res == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          await this.listarMonedas()
          this.closeModal2()
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error()
    }
  }

  limpiarfiltro() {
    this.busqueda = '';
  }
  limpiarfiltro2() {
    this.busqueda2 = '';
  }
  toggleExpand(div: 'div1' | 'div2') {
    this.expandido = this.expandido === div ? 'ninguno' : div;
  }
  async eliminarMoneda(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el pais seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarPais = {
          id_moneda: row.id_moneda
        }
        const respuesta = await this.configuracionService.EliminarMoneda(eliminarPais)
        this.mostrar_carga_todo = false;
        if (respuesta[0].res == "1") {
          SwalService.success()
          await this.listarMonedas()
        }else {
          SwalService.error('Advertencia', respuesta.mensaje);
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }

}

