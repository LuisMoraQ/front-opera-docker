import { Component, Input, OnInit,HostListener,ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from './../../../../servicios/swal.service';
@Component({
  selector: 'app-modal-licencia',
  templateUrl: './modal-licencia.component.html',
  styleUrls: ['./modal-licencia.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalLicenciaComponent implements OnInit {
  @Input('height') height: number = 100;
  @Input() editar = null
  @Input() datos = null
  @Input() ver = null
  @Input() tabla = []
  @Input() tiposUsuarios = []
  mostrar_carga_todo = false
  dataSource: MatTableDataSource<any>;
  displayedColumn: string[] = ['nombre', 'cantidad', 'principal','Editapresu'];
  formLicencia = new UntypedFormGroup({
    desc_licencia: new UntypedFormControl('', [Validators.required]),
    abrev: new UntypedFormControl('', [Validators.required]),
    precio: new UntypedFormControl('0.00', [Validators.required, Validators.min(0)]),
    limitado: new UntypedFormControl(true, [Validators.required]),
    tiempo: new UntypedFormControl('0', [Validators.required, Validators.min(0)]),
    estado: new UntypedFormControl(true, []),
    limitproy: new UntypedFormControl(true, [Validators.required]),
    nroproys: new UntypedFormControl('0', [Validators.required, Validators.min(1)]),
    tablaDetalle: new UntypedFormArray([], [Validators.required])
  })
  get desc_licencia(): UntypedFormControl { return this.formLicencia.get('desc_licencia') as UntypedFormControl }
  get abrev(): UntypedFormControl { return this.formLicencia.get('abrev') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.formLicencia.get('precio') as UntypedFormControl }
  get limitado(): UntypedFormControl { return this.formLicencia.get('limitado') as UntypedFormControl }
  get tiempo(): UntypedFormControl { return this.formLicencia.get('tiempo') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formLicencia.get('estado') as UntypedFormControl }
  get limitproy(): UntypedFormControl { return this.formLicencia.get('limitproy') as UntypedFormControl }
  get nroproys(): UntypedFormControl { return this.formLicencia.get('nroproys') as UntypedFormControl }
  get tablaDetalle(): UntypedFormArray {
    return this.formLicencia.get('tablaDetalle') as UntypedFormArray;
  }
  constructor(private modal: NgbActiveModal,
    private administradorService: AdministradorService,
    private formsService: FormsService,
    private toaster: ToastrService) { }

  async ngOnInit() {
    try {
      this.height = window.innerHeight - 396;
      await this.accionModal()
    } catch (e) {
      SwalService.error()
      console.log(e);
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
      this.height = window.innerHeight - 396;
  }
  async accionModal() {
    if (this.editar) {
      this.formLicencia.reset({
        desc_licencia: this.datos?.desc_licencia,
        abrev: this.datos?.abrev,
        precio: parseFloat(this.datos?.precio).toFixed(2),
        limitado: this.datos?.limitado == 1 ? true : false,
        tiempo: this.datos?.tiempo,
        estado: this.datos?.estado == 1 ? true : false,
        limitproy: this.datos?.limitproy == 1 ? true : false,
        nroproys:this.datos?.nroproys
      })
      if (this.limitado.value) {
        this.tiempo.setValidators([Validators.required, Validators.min(0)])
        this.tiempo.updateValueAndValidity()
      } else {
        this.tiempo.clearValidators()
        this.tiempo.updateValueAndValidity()
      }
      if (this.limitproy.value) {
        this.nroproys.setValidators([Validators.required, Validators.min(1)])
        this.nroproys.updateValueAndValidity()
      } else {
        this.nroproys.clearValidators()
        this.nroproys.updateValueAndValidity()
      }
    }
    await this.iniciarDataSource()
  }
  async iniciarDataSource() {
    await this.setForm()
    this.dataSource = new MatTableDataSource((this.formLicencia.get('tablaDetalle') as UntypedFormArray).controls);
    this.dataSource.filterPredicate = (data: UntypedFormGroup, filter: string) => {
      return Object.values(data.controls).some(x => x.value == filter);
    };
  }
  async setForm() {
    const userCtrl = this.formLicencia.get('tablaDetalle') as UntypedFormArray;
    this.tabla.forEach((tipo) => {
      userCtrl.push(this.crearTablaDetalle(tipo))
    })
  };
  crearTablaDetalle(tipo) {
    const seccionForm = new UntypedFormGroup({
      id_tipo: new UntypedFormControl(tipo.id_tipo, []),
      nombre: new UntypedFormControl(tipo.nombre, []),
      cantidad: new UntypedFormControl(tipo.cantidad, [Validators.required, Validators.min(0)]),
      principal: new UntypedFormControl(tipo.principal == 1 ? true : false, []),
      edpresu: new UntypedFormControl(tipo.edpresu == 1 ? true : false, [])
    })
    if(this.ver){
      seccionForm.get('principal').disable()
      seccionForm.get('principal').updateValueAndValidity()
      seccionForm.get('edpresu').disable()
      seccionForm.get('edpresu').updateValueAndValidity()
    }
    if (tipo.principal) {
      seccionForm.get('cantidad').disable()
      seccionForm.get('cantidad').updateValueAndValidity()
    }
    return seccionForm
  }
  async cambioPrincipal(i) {
    this.tablaDetalle.value.map((detalle, indice) => {
      const row = (this.tablaDetalle.controls[indice] as UntypedFormGroup)
      if(row.get('principal').value==true){
        row.get('cantidad').setValue(0);
      }
      if (indice !== i || row.get('principal').value==false) {
        row.get('principal').setValue(false)
        row.get('cantidad').enable()
        row.get('cantidad').updateValueAndValidity()
      } else {
        row.get('cantidad').setValue(1)
        row.get('cantidad').disable()
        row.get('cantidad').updateValueAndValidity()
      }
    })
  }
  async verificarDecimales() {
    const precioValido = await this.formsService.autocompletarPrecio(this.precio.value, 2)
    this.precio.setValue(precioValido)
  }
  async verificar(i) {
    const row = (this.tablaDetalle.controls[i] as UntypedFormGroup)
    const input = row.get('cantidad').invalid
    if (input) {
      row.get('cantidad').setValue(0)
    }
  }
  async cambioLimitado() {
    this.tiempo.reset()
    this.tiempo.setValue('0')
    if (this.limitado.value) {
      this.tiempo.setValidators([Validators.required, Validators.min(0)])
      this.tiempo.updateValueAndValidity()
    } else {
      this.tiempo.clearValidators()
      this.tiempo.updateValueAndValidity()
    }
  }
  async almacenar() {
    if (this.editar) {
      await this.actualizar()
    } else {
      await this.guardar()
    }
  }
  async actualizar() {
    try {
      if (this.formLicencia.invalid) {
        this.formLicencia.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Advertencia', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        let existeprinc=false;
        for(let i=0;i<this.tablaDetalle.value.length;i++){
          if(this.tablaDetalle.value[i].principal==true){
            existeprinc=true;
            break;
          }
        }
        if(existeprinc){
          this.mostrar_carga_todo = true
          const tabla1 = JSON.stringify(this.tablaDetalle.getRawValue());
          const body = JSON.stringify({
            'id_licencia': this.datos.id_licencia,
            'desc_licencia': this.desc_licencia.value.toUpperCase(),
            'abrev': this.abrev.value.trim().toUpperCase(),
            'precio': this.precio.value,
            'limitado': this.limitado.value ? 1 : 0,
            'tiempo': this.tiempo.value !== '0' ? Number(this.tiempo.value) : null,
            'estado': this.estado.value ? 1 : 0,
            'limitproy': this.limitproy.value ? 1 : 0,
            'nroproys':this.nroproys.value !=='0'?Number(this.nroproys.value):null,
            'datos1': tabla1,
          });
          const response = await this.administradorService.editarLicencia(body)
          this.mostrar_carga_todo = false
          if (response.id == "1") {
            this.closeModal('ok')
          }
          else {
            SwalService.error('Advertencia', response.mensaje)
          }
        }
        else{
          this.toaster.error('Seleccionar una fila como Principal', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  async guardar() {
    try {
      if (this.formLicencia.invalid) {
        this.formLicencia.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        return
      } else {
        let existeprinc=false;
        for(let i=0;i<this.tablaDetalle.value.length;i++){
          if(this.tablaDetalle.value[i].principal==true){
            existeprinc=true;
            break;
          }
        }
        if(existeprinc){
          this.mostrar_carga_todo = true
          const tabla1 = JSON.stringify(this.tablaDetalle.getRawValue());
          const body = JSON.stringify({
            'desc_licencia': this.desc_licencia.value.toUpperCase(),
            'abrev': this.abrev.value.trim().toUpperCase(),
            'precio': this.precio.value,
            'limitado': this.limitado.value ? 1 : 0,
            'tiempo': this.tiempo.value !== '0' ? Number(this.tiempo.value) : null,
            'estado': this.estado.value ? 1 : 0,
            'limitproy': this.limitproy.value ? 1 : 0,
            'nroproys':this.nroproys.value !=='0'?Number(this.nroproys.value):null,
            'datos1': tabla1,
          });
          const response = await this.administradorService.guardarLicencia(body)
          this.mostrar_carga_todo = false
          if (response.id == "1") {
            this.closeModal('ok')
          }
          else {
            SwalService.error('Advertencia', response.mensaje)
          }
        }
        else{
          this.toaster.error('Seleccionar una fila como Principal', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  async cambioLimitproy() {
    this.nroproys.reset()
    this.nroproys.setValue('0')
    if (this.limitproy.value) {
      this.nroproys.setValidators([Validators.required, Validators.min(1)])
      this, this.nroproys.updateValueAndValidity()
    } else {
      this.nroproys.clearValidators()
      this, this.nroproys.updateValueAndValidity()
    }
  }
  closeModal(result: any = null) {
    this.modal.close(result)
  }
}
