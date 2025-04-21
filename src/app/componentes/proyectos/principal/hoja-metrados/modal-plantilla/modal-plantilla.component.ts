import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { plantilla2 } from './../modal-metrado-excel/plantilla';

@Component({
  selector: 'app-modal-plantilla',
  templateUrl: './modal-plantilla.component.html',
  styleUrls: ['./modal-plantilla.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalPlantillaComponent implements OnInit {
  @Input() id_usuario = null
  mostrar_carga_todo = false
  gcols = 0
  dcols = 0
  fcols = 0
  icols: number = 0;
  formPlantilla = new UntypedFormGroup({
    id_usuario: new UntypedFormControl(null, []),
    nom_plantilla: new UntypedFormControl('', [Validators.required]),
    item: new UntypedFormControl(null, [Validators.required]),
    descripcion: new UntypedFormControl(null, [Validators.required]),
    mtotal: new UntypedFormControl(null, [Validators.required]),
    detalle: new UntypedFormControl(false, []),
    cantidad: new UntypedFormControl(false, []),
    nveces: new UntypedFormControl(false, []),
    factor1: new UntypedFormControl(false, []),
    factor2: new UntypedFormControl(false, []),
    factor3: new UntypedFormControl(false, []),
    subtotal: new UntypedFormControl(false, []),
    otro: new UntypedFormControl(false, []),
    gdescripcion: new UntypedFormControl(false, []),
    gcantidad: new UntypedFormControl(false, []),
    gfactor: new UntypedFormControl(false, []),
    gnveces: new UntypedFormControl(false, []),
    glongitud: new UntypedFormControl(false, []),
    gancho: new UntypedFormControl(false, []),
    galtura: new UntypedFormControl(false, []),
    gsubtotal: new UntypedFormControl(false, []),
    ddescripcion: new UntypedFormControl(false, []),
    dcantidad: new UntypedFormControl(false, []),
    dfactor: new UntypedFormControl(false, []),
    dnveces: new UntypedFormControl(false, []),
    dlongitud: new UntypedFormControl(false, []),
    dancho: new UntypedFormControl(false, []),
    daltura: new UntypedFormControl(false, []),
    dsubtotal: new UntypedFormControl(false, []),
    area: new UntypedFormControl(false, []),
    volumen: new UntypedFormControl(false, []),
    mparcial: new UntypedFormControl(false, []),
    unidad: new UntypedFormControl(false, [Validators.required])
  })
  cantidadCeldas = [];
  ordenTabla: any = [];
  header: any = [];
  submit: boolean = false;
  // get id_usuario(): FormControl { return this.formPlantilla.get('id_usuario') as FormControl }
  get nom_plantilla(): UntypedFormControl { return this.formPlantilla.get('nom_plantilla') as UntypedFormControl }
  get item(): UntypedFormControl { return this.formPlantilla.get('item') as UntypedFormControl }
  get descripcion(): UntypedFormControl { return this.formPlantilla.get('descripcion') as UntypedFormControl }
  get mtotal(): UntypedFormControl { return this.formPlantilla.get('mtotal') as UntypedFormControl }
  get detalle(): UntypedFormControl { return this.formPlantilla.get('detalle') as UntypedFormControl }
  get cantidad(): UntypedFormControl { return this.formPlantilla.get('cantidad') as UntypedFormControl }
  get nveces(): UntypedFormControl { return this.formPlantilla.get('nveces') as UntypedFormControl }
  get factor1(): UntypedFormControl { return this.formPlantilla.get('factor1') as UntypedFormControl }
  get factor2(): UntypedFormControl { return this.formPlantilla.get('factor2') as UntypedFormControl }
  get factor3(): UntypedFormControl { return this.formPlantilla.get('factor3') as UntypedFormControl }
  get subtotal(): UntypedFormControl { return this.formPlantilla.get('subtotal') as UntypedFormControl }
  get otro(): UntypedFormControl { return this.formPlantilla.get('otro') as UntypedFormControl }
  get gdescripcion(): UntypedFormControl { return this.formPlantilla.get('gdescripcion') as UntypedFormControl }
  get gcantidad(): UntypedFormControl { return this.formPlantilla.get('gcantidad') as UntypedFormControl }
  get gfactor(): UntypedFormControl { return this.formPlantilla.get('gfactor') as UntypedFormControl }
  get gnveces(): UntypedFormControl { return this.formPlantilla.get('gnveces') as UntypedFormControl }
  get glongitud(): UntypedFormControl { return this.formPlantilla.get('glongitud') as UntypedFormControl }
  get gancho(): UntypedFormControl { return this.formPlantilla.get('gancho') as UntypedFormControl }
  get galtura(): UntypedFormControl { return this.formPlantilla.get('galtura') as UntypedFormControl }
  get gsubtotal(): UntypedFormControl { return this.formPlantilla.get('gsubtotal') as UntypedFormControl }
  get ddescripcion(): UntypedFormControl { return this.formPlantilla.get('ddescripcion') as UntypedFormControl }
  get dcantidad(): UntypedFormControl { return this.formPlantilla.get('dcantidad') as UntypedFormControl }
  get dfactor(): UntypedFormControl { return this.formPlantilla.get('dfactor') as UntypedFormControl }
  get dnveces(): UntypedFormControl { return this.formPlantilla.get('dnveces') as UntypedFormControl }
  get dlongitud(): UntypedFormControl { return this.formPlantilla.get('dlongitud') as UntypedFormControl }
  get dancho(): UntypedFormControl { return this.formPlantilla.get('dancho') as UntypedFormControl }
  get daltura(): UntypedFormControl { return this.formPlantilla.get('daltura') as UntypedFormControl }
  get dsubtotal(): UntypedFormControl { return this.formPlantilla.get('dsubtotal') as UntypedFormControl }
  get area(): UntypedFormControl { return this.formPlantilla.get('area') as UntypedFormControl }
  get volumen(): UntypedFormControl { return this.formPlantilla.get('volumen') as UntypedFormControl }
  get mparcial(): UntypedFormControl { return this.formPlantilla.get('mparcial') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formPlantilla.get('unidad') as UntypedFormControl }

  constructor(private modal: NgbActiveModal,
    private metradoService: MetradoService,
    private toaster: ToastrService) { }

  ngOnInit() {
  }

  closeModal(result: any = null) {
    this.modal.close(result);
  }

  async guardarPlantilla() {
    this.submit = true
    if (this.formPlantilla.invalid) {
      this.formPlantilla.markAllAsTouched()
      let array = []
      this.nom_plantilla.value ? '' : array.push('NOMBRE PLANTILLA')
      this.item.value ? '' : array.push('ITEM')
      this.descripcion.value ? '' : array.push('DESCRIPCION')
      this.unidad.value ? '' : array.push('UNIDAD')
      this.mtotal.value ? '' : array.push('M. TOTAL')
      this.toaster.error('Campos obligatorios :' + array.join(','), 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000
      })
      return
    } else {
      this.mostrar_carga_todo = true
      const plantilla: plantilla2 = {
        area: this.area.value ? 1 : '',
        cantidad: this.cantidad.value ? 1 : '',
        daltura: this.daltura.value ? 1 : '',
        dancho: this.dancho.value ? 1 : '',
        dcantidad: this.dcantidad.value ? 1 : '',
        ddescripcion: this.ddescripcion.value ? 1 : '',
        descripcion: this.descripcion.value ? 1 : '',
        detalle: this.detalle.value ? 1 : '',
        dfactor: this.dfactor.value ? 1 : '',
        dlongitud: this.dlongitud.value ? 1 : '',
        dnveces: this.dnveces.value ? 1 : '',
        dsubtotal: this.dsubtotal.value ? 1 : '',
        factor1: this.factor1.value ? 1 : '',
        factor2: this.factor2.value ? 1 : '',
        factor3: this.factor3.value ? 1 : '',
        subtotal: this.subtotal.value ? 1 : '',
        otro: this.otro.value ? 1 : '',
        galtura: this.galtura.value ? 1 : '',
        gancho: this.gancho.value ? 1 : '',
        gcantidad: this.gcantidad.value ? 1 : '',
        gdescripcion: this.gdescripcion.value ? 1 : '',
        gfactor: this.gfactor.value ? 1 : '',
        glongitud: this.glongitud.value ? 1 : '',
        gnveces: this.gnveces.value ? 1 : '',
        gsubtotal: this.gsubtotal.value ? 1 : '',
        id_usuario: this.id_usuario,
        item: this.item.value ? 1 : '',
        mparcial: this.mparcial.value ? 1 : '',
        mtotal: this.mtotal.value ? 1 : '',
        nom_plantilla: (this.nom_plantilla.value).trim().toUpperCase(),
        nveces: this.nveces.value ? 1 : '',
        unidad: this.unidad.value ? 1 : '',
        volumen: this.volumen.value ? 1 : '',
        id_plantilla: null
      }      
      this.header = await this.header.map((ele, index) => { ele.indice = index; return ele })
      const nuevo = await this.buscarPosicion(plantilla)  
      const response = await this.metradoService.guardarPlantillaMetrado(nuevo)
      if (response.id == '0') {
        this.mostrar_carga_todo = false
        this.toaster.error(response.mensaje, 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = false
        this.toaster.success('Se guardo Correctamente.', 'Exitó', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        this.closeModal('ok')
      }
    }
  }

  async buscarPosicion(elemento) {
    await Object.entries(elemento).forEach(async ([key, value]) => {
      if (value) {
        const encontrado = await this.header.find(ele => ele.opcion == key)
        if (encontrado)
          elemento[key] = encontrado.indice
      }
    });
    return elemento
  }

  async cambioCheckbox(opcion: string, nombre: string, grupo: number, value) {
    const obj = {
      opcion: opcion,
      nombre: nombre,
      grupo: grupo
    }
    if (value) {
      if (grupo == 0) {
        this.header.push(obj)
      } else {
        let ultGrupo1 = null
        let ultGrupo2 = null
        for (let i = this.header.length - 1; i >= 0; i--) {
          this.header[i].grupo == 1 ? ultGrupo1 = i : ultGrupo1 = null
          if (ultGrupo1) {
            break
          }
        }
        for (let i = this.header.length - 1; i >= 0; i--) {
          this.header[i].grupo == 2 ? ultGrupo2 = i : ultGrupo2 = null
          if (ultGrupo2) {
            break
          }
        }
        if (grupo == 1) {
          if (ultGrupo1) {
            this.header.splice(ultGrupo1 + 1, 0, obj)
          } else {
            if (ultGrupo2) {
              this.header.splice(ultGrupo2 + 1, 0, obj)
            } else {
              this.header.push(obj)
            }
          }
        } else {
          if (ultGrupo2) {
            this.header.splice(ultGrupo2 + 1, 0, obj)
          } else {
            if (ultGrupo1) {
              this.header.splice(ultGrupo1 + 1, 0, obj)
            } else {
              this.header.push(obj)
            }
          }
        }
      }
    } else {
      const encontrado = this.header.find(ele => ele.opcion == opcion)
      const indice = this.header.indexOf(encontrado)
      this.header.splice(indice, 1)      
    }
    this.actualizarCeldas()
  }

  actualizarCeldas() {
    this.icols = 0
    this.gcols = 0
    this.dcols = 0
    this.fcols = 0
    let inicio = true
    for (let celda of this.header) {
      if (celda.grupo == 0) {
        if (inicio) {
          this.icols++
        } else {
          this.fcols++
        }
      } else if (celda.grupo == 1) {
        inicio = false
        this.gcols++
      } else {
        inicio = false
        this.dcols++
      }
    }
    this.cantidadCeldas.length = this.icols + this.gcols + this.dcols + this.fcols
  }

  desplazarIzquierda(indice, item) {
    if (indice > 0) {
      if (item.grupo == 0) {
        var celdaAnt = null
        let index = null
        let agregar = 0
        for (let i = indice - 1; i >= 0; i--) {
          this.header[i].grupo == 0 ? celdaAnt = this.header[i] : agregar = 1
          if (celdaAnt) {
            index = i
            break
          }
        }
        if (celdaAnt) {
          const celda = this.header[indice]
          this.header.splice(indice, 1)
          this.header.splice(index + agregar, 0, celda)
          this.actualizarCeldas()
        } else {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
          return
        }
      } else if (item.grupo == 1) {
        const celdaAnt = this.header[indice - 1]
        if (celdaAnt.grupo == 1) {
          const celda = this.header[indice]
          this.header[indice] = celdaAnt
          this.header[indice - 1] = celda
        } else {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
          return
        }
      } else if (item.grupo == 2) {
        const celdaAnt = this.header[indice - 1]
        if (celdaAnt.grupo == 2) {
          const celda = this.header[indice]
          this.header[indice] = celdaAnt
          this.header[indice - 1] = celda
          return
        } else {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
          return
        }
      }
    } else {
      this.toaster.error('No se puede desplazar', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return
    }
  }

  desplazarDerecha(indice, item) {
    if (indice < this.header.length) {
      if (item.grupo == 0) {
        var celdSig = null
        let index = null
        let descontar = 0
        for (let i = indice + 1; i < this.header.length; i++) {
          this.header[i].grupo == 0 ? celdSig = this.header[i] : descontar = 1
          if (celdSig) {
            index = i
            break
          }
        }
        if (celdSig) {
          const celda = this.header[indice]
          this.header.splice(indice, 1)
          this.header.splice(index - descontar, 0, celda)
        } else {
          if (indice + 1 == this.header.length) {
            this.toaster.error('No se puede desplazar', 'Error', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 2000
            })
            return
          } else {
            const celda = this.header[indice]
            this.header.splice(indice, 1)
            this.header.push(celda)
          }
        }
        this.actualizarCeldas()
      } else if (item.grupo == 1) {
        const celdaPost = this.header[indice + 1]
        if (celdaPost.grupo == 1) {
          const celda = this.header[indice]
          this.header[indice] = celdaPost
          this.header[indice + 1] = celda
          return
        } else {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
          return
        }
      } else if (item.grupo == 2) {
        const celdaPost = this.header[indice + 1]
        if (celdaPost.grupo == 2) {
          const celda = this.header[indice]
          this.header[indice] = celdaPost
          this.header[indice - 1] = celda
          return
        } else {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
          return
        }
      }
    } else {
      this.toaster.error('No se puede desplazar', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return
    }
  }

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
}
