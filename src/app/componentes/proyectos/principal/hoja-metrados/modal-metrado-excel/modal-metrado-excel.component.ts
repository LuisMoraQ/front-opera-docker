import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { stringSimilarity } from "string-similarity-js";
import * as XLSX from 'xlsx';
import { ModalPlantillaComponent } from '../modal-plantilla/modal-plantilla.component';
import { SwalService } from './../../../../../servicios/swal.service';
import { arraydcols, arraygcols, arrayicols, metrado, metradoModel } from './metrado';
import { plantilla, plantillaModel } from './plantilla';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';

export interface hoja {
  nombre: string,
  plantilla: any,
  columnas: plantilla,
  columnas_completas: boolean,
  tabla_estructurada: any,
  tabla_excel: any,
  inicio_tabla: number,
  header: any,
  cant_header: any
  grupos_header: any,
  body_tabla: any,
  tabla_titulos_partida: any,
  considerar: boolean,
  filasNoValidas: any
}

export interface partidaTabla {
  indice: number,
  descripcion: string,
  item: string,
  unidad: string,
  existeHoja: number,
  ind: number,
  ind_parecido_excel: any,
  ind_similar_excel: any,
  ind_iguales_excel: any
  ind_parecido_excel_titulo: any,
  ind_iguales_excel_titulo: any,
  ind_similar_excel_titulo: any,
  arrayIndIguales: any,
  checkeado: boolean
}

@Component({
  selector: 'app-modal-metrado-excel',
  templateUrl: './modal-metrado-excel.component.html',
  styleUrls: ['./modal-metrado-excel.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ModalMetradoExcelComponent implements OnInit {
  @Input() titulo = null
  @Input() nombreArchivo = null
  @Input() wbExcel: XLSX.WorkBook;
  @Input() listaTablas = []
  @Input() idProyecto = null
  @Input() listaPresuesto = []

  vista = 0
  @ViewChild('stepper') stepper: MatStepper;
  mostrar_carga_todo = false;
  idUsuario = null
  cargandoData = false

  listaPlantillas: plantilla[] = [];
  plantillaSeleccionada: plantilla = null;
  filaTabla = null
  tablaPresupuesto = []
  header = [];
  arrayPresupuesto: any[] = [];
  tablaExcel: metrado[] = []
  gcols: number = 0;
  dcols: number = 0;
  fcols: number = 0;
  icols: number = 0;
  headerTabla: any[] = [];

  listaHojasSeleccionadas: hoja[] = [];
  hojaSeleccionada: hoja;
  permitirPasar = false
  headerTablaEstructurada = [];
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = ''
  titulo1letra: any = ''
  buscando3: boolean = false;
  headerSuperior: any;
  tablaFinal: any[] = [];
  idPlantillaFinal: number = null;
  headerTablaEstructurada2: any[] = [];
  mostrar_carga_todo4 = true
  habilitadoCorreccion = false

  filaTablaExcel = null
  filaTablaPresu = null
  selectDeterminado = null

  @ViewChild('modalConflictos') modalConflictos: ModalBasicComponent;
  filtradosPresu: any[];
  filtradosExcel: any[];
  arrayIndices: any = [];
  todosCheck: boolean = false;
  constructor(private toaster: ToastrService,
    private modalService: NgbModal,
    public formsService: FormsService,
    private _EncriptadorService: EncriptadorService,
    private encriptadorService: EncriptadorService,
    private principalService: PrincipalService,
    private metradoService: MetradoService,
    private modal: NgbActiveModal) { }

  async ngOnInit() {
    this.aspectos = JSON.parse(this._EncriptadorService.recuperarlocalstory('aspectostablas'));
    this.idUsuario = await this.encriptadorService.recuperarlocalstory('idusuario');
    await this.listarPlantillas()
  }

  closeModal(result: any = null) {
    this.modal.close(result);
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  pintar() {
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }

  // botones navegacion
  async accionSiguienteBoton() {
    try {
      if (this.vista < 3) {
        if (this.vista == 0) {
          const valido = this.listaTablas.filter(ele => ele.considerar)          
          if (!valido.length || !this.plantillaSeleccionada) {
            const msj = !valido.length && !this.plantillaSeleccionada ? 'Selecciona una hoja a importar y una plantilla' : (valido.length ? 'Ninguna Plantilla seleccionada' : 'Ninguna Hoja Excel seleccionada')
            this.toaster.error(msj, 'Error', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 2000
            })
            return
          } else {
            this.sgteStepp()
            this.listaHojasSeleccionadas = []
            await this.verificarPlantilla(valido)
            if (this.listaHojasSeleccionadas.length) {
              await this.opcionHojasValidas(0)
            }
          }
        } else if (this.vista == 1) {
          let valido = true
          let hojasErroneas = []
          for (let hoja of this.listaHojasSeleccionadas) {
            if (!hoja.columnas_completas) {
              valido = false
              break
            }
            let existeitem = false
            let existedescripcion = false
            let existemtotal = false
            let array = ['descripcion', 'item', 'mtotal']
            var inicioValido = false
            for (const iterator of hoja.tabla_excel) {
              if ((!existeitem || !existedescripcion || !existemtotal) && array.length) {
                let i = 0
                if (iterator[hoja.body_tabla['item']]) {
                  var titulo = (iterator[hoja.body_tabla['item']]).toString().split('.')
                }
                if (!inicioValido && (Number(iterator[hoja.body_tabla['item']]) == Number(this.titulo.item) || titulo && Number(titulo[0]) == Number(this.titulo.item))) {
                  inicioValido = true
                }
                if (inicioValido) {
                  for (const key of array) {

                    if (iterator[hoja.body_tabla[key]] !== null && iterator[hoja.body_tabla[key]] !== undefined && iterator[hoja.body_tabla[key]] !== '') {
                      if (key == 'descripcion') {
                        existedescripcion = true
                        const index = array.indexOf('descripcion')
                        array.splice(index, 1)
                      } else if (key == 'item') {
                        if (Number(iterator[hoja.body_tabla['item']]) == Number(this.titulo.item) || Number(titulo[0]) == Number(this.titulo.item)) {
                          existeitem = true
                          const index = array.indexOf('item')
                          array.splice(index, 1)
                        }
                      } else if (key == 'mtotal') {
                        if (!isNaN(Number(iterator[hoja.body_tabla['mtotal']]))) {
                          existemtotal = true
                          const index = array.indexOf('mtotal')
                          array.splice(index, 1)
                        }
                      }
                    }
                    i++
                  }
                }
              } else {
                break
              }
            }
            if (!existeitem || !existedescripcion || !existemtotal) {
              const arr = []
              if (!existeitem) {
                arr.push('item')
              } else {
                if (!existemtotal) {
                  arr.push('mtotal')
                } else {
                  if (!existedescripcion) {
                    arr.push('descripcion')
                  }
                }
              }

              hojasErroneas.push('Hoja = <b>' + hoja.nombre + '</b> : Columna( <b>' + arr.join(',') + ' </b>)')
            }
          }

          if (!valido || hojasErroneas.length) {
            if (!valido) {
              this.toaster.error('Asignacion de columnas en hojas excel incompletas o no validas.', 'Error', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 7000
              })
            } else {
              this.toaster.error('No se encontro data valida en columna : <br>' + hojasErroneas.join('; <br>'), 'Error', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 7000,
                enableHtml: true
              })
            }
            this.mostrar_carga_todo = false
            return
          } else {
            this.tablaPresupuesto = []
            this.tablaExcel = []
            this.mostrar_carga_todo = true
            this.sgteStepp()
            setTimeout(async () => {
              const valido = await this.crearTablas()
              if (!valido) {
                this.pintar();
              }
              this.mostrar_carga_todo = false
            }, 500);
          }
        } else if (this.vista == 2) {
          this.mostrar_carga_todo = true
          if (this.permitirPasar) {
            this.sgteStepp()
            await this.crearTablaFinal()
            this.mostrar_carga_todo = false
            return
          }
          // const cantidadFaltantes = await this.tablaPresupuesto.filter(ele => ele.existeHoja == 0)
          // if (cantidadFaltantes.length > 10) {
          //   SwalService.error('Error', 'Cantidad de no existentes de presupuesto en excel sobrepasa la cantidad minima (' + cantidadFaltantes.length + '/10)')
          //   this.mostrar_carga_todo = false
          //   return
          // }
          const erroresExcel = await this.tablaExcel.filter(ele => ele.tipoError !== null && ele.tipoError !== 1)

          if (erroresExcel.length) {
            let cantidadRepetidos = 0
            let cantidadParecidos = 0
            let cantidadDescripcionDif = 0
            for (let ele of erroresExcel) {
              if (ele.tipoError == 3) {
                cantidadRepetidos++
              } else if (ele.tipoError == 2 || ele.tipoError == 4) {
                cantidadParecidos++
              } else if (ele.tipoError == 0) {
                cantidadDescripcionDif++
              }
            }

            if (cantidadRepetidos > 0) {
              SwalService.error('Errores en la data excel', 'Existen ' + cantidadRepetidos + ' repetidos')
              this.mostrar_carga_todo = false
              return
            } else {
              if (cantidadDescripcionDif > 0 || cantidadParecidos > 0) {
                const sw = await SwalService.confirm('', 'Exìsten filas con conflictos no resueltos, desea omitir la informacion relacionada a estas filas?')
                if (sw.isConfirmed) {
                  this.permitirPasar = true
                  this.sgteStepp()
                  await this.crearTablaFinal()
                  this.mostrar_carga_todo = false
                } else {
                  this.mostrar_carga_todo = false
                  return
                }
              }
            }
          } else {
            this.permitirPasar = true
            this.sgteStepp()
            await this.crearTablaFinal()
            this.mostrar_carga_todo = false
          }
        } else {
        }
      }
    } catch (e) {
      SwalService.error('Error', e)
      console.log(e);

    }
  }

  sgteStepp() {
    this.stepper.selected.interacted = true;
    this.stepper.selected.completed = false;
    this.stepper.next()
    this.vista = Number(this.stepper.selected.label)
  }

  async accionRegresarBoton() {
    if (this.vista > 0) {
      this.stepper.selected.interacted = false;
      this.stepper.selected.completed = false;
      this.filaTablaExcel = null
      this.filaTablaPresu = null
      this.habilitadoCorreccion = false
      if (this.vista == 3) { this.tablaFinal = []; this.permitirPasar = false }
      this.stepper.previous()
      this.vista = Number(this.stepper.selected.label)
    }
  }

  // paso 1
  async listarPlantillas() {
    try {
      const obj = {
        id_usuario: this.idUsuario
      }
      const response = await this.metradoService.listarPlantillaMetrado(obj)
      for (let i = 0; i < response.length; i++) {
        for (let parametro in response[i]) {
          if (response[i][parametro] && parametro !== 'nom_plantilla') {
            response[i][parametro] = Number(response[i][parametro])
          }
        }
      }
      this.listaPlantillas = response
    } catch (e) {
      SwalService.error()
      console.log(e);
    }
  }

  async modalPlantilla() {
    try {
      const modalRef = this.modalService.open(ModalPlantillaComponent, {
        size: 'lg',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false//no cerrar el modal con ESC
      })
      modalRef.componentInstance.id_usuario = this.idUsuario
      const result = await modalRef.result
      if (result) {
        await this.listarPlantillas()
      }
    } catch (e) {
      console.log(e)
    }
  }

  async editarNombrePlantillas() {
    try {
      const res = await SwalService.input('Nombre Plantilla', this.plantillaSeleccionada.nom_plantilla)
      if (!res.isConfirmed) {
        return
      }
      if (!res.value) {
        this.toaster.error('Nombre de plantilla no valida', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000
        })
        return
      }
      if (this.plantillaSeleccionada.nom_plantilla !== res.value) {
        this.mostrar_carga_todo = true
        const obj = {
          id_plantilla: this.plantillaSeleccionada.id_plantilla,
          nom_plantilla: (res.value).toUpperCase()
        }
        const response = await this.metradoService.editarNombrePlantillaMetrado(obj)
        if (response.id == '1') {
          this.plantillaSeleccionada.nom_plantilla = obj.nom_plantilla
          this.toaster.success('Se actualizó correctamente', 'Éxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
          this.mostrar_carga_todo = false
        } else {
          this.toaster.success(response.mensaje, 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000
          })
          this.mostrar_carga_todo = false
        }

      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e)
      SwalService.error()
    }
  }

  async considerarHoja(event, indice) {
    this.listaTablas[indice].considerar = event.checked
  }

  async cambioVistaPlantillas(nombrePlantilla) {
    this.plantillaSeleccionada = this.listaPlantillas.find(ele => ele.nom_plantilla == nombrePlantilla)
    await this.crearTabla()
  }

  async eliminarPlantilla() {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la Plantilla  seleccionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_plantilla: this.plantillaSeleccionada.id_plantilla
        }
        const response = await this.metradoService.eliminarPlantillaMetrado(obj)
        if (response[0].id == '0') {
          this.toaster.error(response[0].mensaje, 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
        } else {
          this.toaster.success('Se eliminó Correctamente.', 'Exitó', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
          this.headerTabla = []
          this.icols = 0
          this.dcols = 0
          this.gcols = 0
          this.fcols = 0
          this.listaTablas = await this.listaTablas.map(ele => {
            if (ele.plantilla) {
              if (ele.plantilla.nom_plantilla == this.plantillaSeleccionada.nom_plantilla) {
                ele.header = null
                ele.plantilla = null
                ele.grupos_header = null
              }
            }
            return ele
          })
          this.plantillaSeleccionada = {}
          await this.listarPlantillas()
          this.mostrar_carga_todo = false
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }

  // PASO 2
  async verificarPlantilla(valido) {
    this.listaHojasSeleccionadas = valido
    let i = 0
    for (let hoja of this.listaHojasSeleccionadas) {
      await this.asignarPlantillasHoja(this.plantillaSeleccionada, i)
      hoja.plantilla = this.plantillaSeleccionada
      if (hoja.cant_header.length < hoja.header.length) {
        hoja.columnas_completas = false
      } else {
        hoja.columnas_completas = true
      }
      const columnas = new plantillaModel()
      hoja.columnas = columnas
      const nuevo = {}
      let idx = 0
      for (let value of hoja.header) {
        nuevo[value] = idx
        idx++
      }
      hoja.body_tabla = nuevo
      i++
    }  
  }

  async asignarPlantillasHoja(plantilla, indice) {
    let arrayNuevo = {}
    if (plantilla) {
      Object.entries(plantilla).forEach(([key, value]) => {
        if (typeof (value) == 'number' && value !== null && key !== 'id_plantilla' && key !== 'id_usuario') {
          arrayNuevo[key] = value
        }
      });
      let nuevo = []
      nuevo.length = Object.keys(arrayNuevo).length;
      for (let i in arrayNuevo) {
        nuevo[arrayNuevo[i]] = i
      }
      const object = Object.assign({}, nuevo)
      const obj = []
      let icols = 0
      let dcols = 0
      let gcols = 0
      let fcols = 0
      for (let j in object) {
        const valor = object[j]
        arraygcols.includes(valor) ? gcols++ : ''
        arraydcols.includes(valor) ? dcols++ : ''
        if (gcols || dcols) {
          arrayicols.includes(valor) ? fcols++ : ''
        } else {
          arrayicols.includes(valor) ? icols++ : ''
        }
        obj.push(valor)
      }
      const grupos = {
        i: icols,
        g: gcols,
        d: dcols,
        f: fcols
      }
      this.listaHojasSeleccionadas[indice].grupos_header = grupos
      this.listaHojasSeleccionadas[indice].header = obj
    } else {
      this.listaHojasSeleccionadas[indice].grupos_header = null
      this.listaHojasSeleccionadas[indice].header = null
    }
  }

  async opcionHojasValidas(indice) {
    this.mostrar_carga_todo = true
    setTimeout(() => {
      this.hojaSeleccionada = null
      let hoja = null
      if (indice !== null) {
        hoja = this.listaHojasSeleccionadas[indice]
        this.header.length = JSON.parse(JSON.stringify(hoja.cant_header.length))
      } else {
        hoja = null
      }
      this.header = JSON.parse(JSON.stringify(hoja.cant_header))      
      if (this.header[0] !== '') {
        this.header.unshift('')
      }

      this.hojaSeleccionada = hoja
      this.mostrar_carga_todo = false
    }, 500);
  }

  async cambioFilaInicio(indice) {
    this.filaTabla = indice
    const index = await this.listaHojasSeleccionadas.indexOf(this.hojaSeleccionada)
    this.listaHojasSeleccionadas[index].inicio_tabla = indice
  }

  async cambioColumna(ele, tipo) {
    const indiceLista = await this.listaHojasSeleccionadas.indexOf(this.hojaSeleccionada)
    const array = Object.values(this.listaHojasSeleccionadas[indiceLista].body_tabla)
    const existe = await array.find(elemento => Number(elemento) === Number(ele))
    const valor = existe !== undefined ? '' : Number(ele)
    this.listaHojasSeleccionadas[indiceLista].body_tabla[tipo] = Number(ele)
    let valido = true
    if (valor === '') {
      this.toaster.error('Valor ya asignado en otra columna', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
    } else {

    }
    const arrayValues = Object.values(this.listaHojasSeleccionadas[indiceLista].body_tabla)
    for (let elemento of arrayValues) {
      const encontrados = await arrayValues.filter(ele => ele == elemento)
      if (encontrados.length > 1 || elemento == null || elemento == undefined || elemento === '') {
        valido = false
        break
      }
    }
    this.listaHojasSeleccionadas[indiceLista].columnas_completas = valido
  }

  vericono() {
    const icono = '&#9888;'
    return String.fromCodePoint(Number(icono.slice(2, -1)))
  }

  async crearTablas() {
    let valido = false
    let valido1 = false
    for (let i = 0; i < this.listaHojasSeleccionadas.length; i++) {
      let tablaNueva: metrado[] = []
      const opcion = this.listaHojasSeleccionadas[i]
      let anterior = null
      for (let j = opcion.inicio_tabla; j < opcion.tabla_excel.length; j++) {

        const row = opcion.tabla_excel[j]
        let rowNuevo = new metradoModel()
        if (row && row.length) {
          for (let key in opcion.body_tabla) {
            rowNuevo[key] = row[opcion.body_tabla[key]]
          }
        }
        if (rowNuevo.item) {
          const itemSinCeros = await this.convertirItem(anterior, rowNuevo.item)
          if (itemSinCeros !== '') {
            valido = true
          }
          rowNuevo.item = itemSinCeros
          anterior = itemSinCeros
        }
        if (Number(rowNuevo.mtotal) > 0) {
          valido1 = true
        }
        tablaNueva.push(rowNuevo)
      }
      this.listaHojasSeleccionadas[i].tabla_estructurada = tablaNueva
    }
    if (!valido || !valido1) {
      for (let row of this.listaHojasSeleccionadas) {
        row.tabla_estructurada = []
      }
      const str = !valido && !valido1 ? 'Item , Mtotal' : (!valido ? 'Item' : 'Mtotal')
      this.toaster.error('Columna ' + str + ' no valida', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return true
    } else {
      await this.tablaPresupuestoEstructura()
    }
  }

  async convertirItem(anterior, item) {
    let itemString = ''
    if (item) {
      if (anterior) {
        var spliteadoAnterior = (anterior).toString().split('.')
      }
      let spliteado = (item).toString().split('.')
      if (spliteado.length > 1 && spliteado[spliteado.length - 1] == '') {
        spliteado.pop()
      }
      const array = await spliteado.map(ele => (parseInt(ele)).toString())
      let novalido = spliteado.find(ele => ele == 'NaN' || isNaN(Number(ele)))
      if (novalido) {
        return
      }

      if (array !== undefined && spliteadoAnterior !== undefined && array.length && spliteadoAnterior.length && array[array.length - 1] == '1' && spliteadoAnterior[array.length - 1] == '9') {
        array[array.length - 1] = '10'
      }
      itemString = array.join('.')
    }
    return itemString !== 'NaN' ? itemString : ''
  }

  async crearTabla() {
    const noValidos = ['nom_plantilla', 'id_usuario', 'id_plantilla']
    let longitud = 0
    this.gcols = 0
    this.icols = 0
    this.fcols = 0
    this.dcols = 0
    for (let clave in this.plantillaSeleccionada) {
      if (this.plantillaSeleccionada[clave] && !noValidos.includes(clave)) {
        longitud++
      }
    }
    this.headerTabla.length = longitud
    for (let clave in this.plantillaSeleccionada) {
      if (typeof (this.plantillaSeleccionada[clave]) == 'number' && !noValidos.includes(clave)) {
        arraygcols.includes(clave) ? this.gcols++ : ''
        arrayicols.includes(clave) ? this.icols++ : ''
        arraydcols.includes(clave) ? this.dcols++ : ''
        this.headerTabla[this.plantillaSeleccionada[clave]] = clave
      }
    }
    let i = 0
    for (let celda of this.headerTabla) {
      const existe = arrayicols.includes(celda)
      if (existe) {
        i++
      } else {
        break
      }
    }
    this.fcols = this.icols - i
    this.icols = i
  }

  async asignarTodos() {
    if (this.hojaSeleccionada.columnas_completas) {
      for (const iterator of this.listaHojasSeleccionadas) {
        iterator.body_tabla = this.hojaSeleccionada.body_tabla
      }
      this.toaster.success('Se asignó correctamente a todas la hojas', 'Correcto', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return
    } else {
      this.toaster.error('Columnas incompletas', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000
      })
      return
    }
  }


  // paso 3 
  async tablaPresupuestoEstructura() {
    let arrayTitulos = []
    for (let hoja of this.listaHojasSeleccionadas) {
      let arrayHoja = []
      let metradoIndiceActivo = false
      for (let value of hoja.tabla_estructurada) {
        value.nom_hoja = hoja.nombre
        const index = await this.listaTablas.map(e => e.nombre).indexOf(hoja.nombre);
        value.id_hoja = index
        if (value.descripcion) {
          if (value.item) {
            metradoIndiceActivo = true
            value.esMetrado = 0
            if (value.item.length == 1) {
              const existe = arrayTitulos.find(ele => ele.item == value.item)
              if (existe) {
              } else {
                arrayHoja.push(value)
              }
            } else {
              arrayHoja.push(value)
            }
          } else {
            if (metradoIndiceActivo) {
              value.esMetrado = 1
              value.tipo = 0
              // if ((value.mparcial == null || value.mparcial == undefined) && (value.mtotal == null || value.mtotal == undefined)) {
              //   value.tipo = 0
              // } else if ((value.mparcial !== null && value.mparcial !== undefined) && (value.mtotal == null || value.mtotal == undefined) && value.descripcion) {
              //   value.tipo = 1
              // } else {
              //   // console.log('submetrado')
              // }
              arrayHoja.push(value)
            }

          }
        }
      }
      if (arrayTitulos.length) {
        const mayor = await this.compararItems(arrayTitulos[0].item, arrayHoja[0].item)
        if (mayor == 2) {
          arrayTitulos = arrayTitulos.concat(arrayHoja)
        } else {
          arrayTitulos = arrayHoja.concat(arrayTitulos)
        }
      } else {
        arrayTitulos = arrayTitulos.concat(arrayHoja)
      }

    }
    let i = 0
    arrayTitulos = await arrayTitulos.map((ele, index) => {
      ele.id_metrado = index;
      if (ele.item) {
        ele.ind_titulo = i
        i++
      }
      ele.arrayIguales = []
      ele.arrayIndIguales = []
      return ele
    })
    this.tablaExcel = arrayTitulos
    let array: partidaTabla[] = []
    let j = 0
    for (let partida of this.listaPresuesto) {
      const existe = await this.verificarExisteEnExcel(partida)
      let obj: partidaTabla = {
        descripcion: partida.descripcion,
        item: partida.item,
        indice: partida.indice,
        unidad: partida.unidad,
        existeHoja: existe.encontrado,
        ind: j,
        ind_iguales_excel_titulo: existe.iguales_tit,
        ind_parecido_excel_titulo: existe.parecidos_tit,
        ind_similar_excel_titulo: existe.similar_tit,
        ind_parecido_excel: existe.parecidos,
        ind_iguales_excel: existe.iguales,
        ind_similar_excel: existe.similar,
        arrayIndIguales: existe.duplicados,
        checkeado: false
      }
      array.push(obj)
      j++
    }
    this.tablaPresupuesto = array
    await this.evaluarErrores()
  }

  async compararItems(item1, item2) {
    const spliteado1 = item1.split('.')
    const spliteado2 = item2.split('.')
    let esMayor = null
    if (spliteado1.length < spliteado2.length) {
      esMayor = 2
    } else if (spliteado1.length > spliteado2.length) {
      esMayor = 1
    } else if (spliteado1.length == spliteado2.length) {
      let i = 0
      while (!esMayor) {
        if (spliteado1[i] < spliteado2[i]) {
          esMayor = 2
        } else if (spliteado1[i] > spliteado2[i]) {
          esMayor = 1
        } else if (spliteado1[i] == spliteado2[i]) {
          esMayor = null
        }
        i++
      }
    }
    return esMayor
  }

  async verificarExisteEnExcel(metrado) {

    const descripcionBuscar = metrado.descripcion.toUpperCase().trim().replace(/\s+/g, ' ');
    let existe = 0
    let iguales = []
    let parecidos = []
    let similar = []
    let iguales_tit = []
    let parecidos_tit = []
    let similar_tit = []
    let encontradosItem = []
    for (let ele of this.tablaExcel) {
      const descripcionEle = ele.descripcion.toUpperCase().trim().replace(/\s+/g, ' ');
      if (!ele.esMetrado) {
        let valor1, valor2
        if (ele.descripcion.length > metrado.descripcion.length) {
          valor1 = descripcionEle
          valor2 = descripcionBuscar
        } else {
          valor1 = descripcionBuscar
          valor2 = descripcionEle
        }
        if (ele.item === metrado.item) {
          encontradosItem.push(ele.ind_titulo)
        }
        let parece = stringSimilarity(valor1, valor2);//usar para comparar parecidos
        if (1 >= parece && parece >= 0.99 && ele.item == metrado.item) {
          iguales_tit.push(ele.ind_titulo)
          iguales.push(ele.id_metrado)

        } else if (parece < 0.99 && parece >= 0.45 && ele.item == metrado.item) {
          parecidos_tit.push(ele.ind_titulo)
          parecidos.push(ele.id_metrado)
        } else if (parece < 0.45 && ele.item == metrado.item) {
          similar_tit.push(ele.ind_titulo)
          similar.push(ele.id_metrado)
        }
      }
    }
    if (!iguales.length && !parecidos.length && !similar.length) {
      existe = 0
    } else if (iguales.length == 1 && !parecidos.length && !similar.length) {
      existe = 1
    } else if (parecidos.length == 1 && !iguales.length && !similar.length) {
      existe = 2
    } else if (!parecidos.length && !iguales.length && similar.length) {
      existe = 4
    } else {
      existe = 3
    }
    const obj = {
      encontrado: existe,
      parecidos_tit: parecidos_tit,
      iguales_tit: iguales_tit,
      parecidos: parecidos,
      iguales: iguales,
      duplicados: encontradosItem,
      similar: similar,
      similar_tit: similar_tit
    }
    return obj
  }

  async evaluarErrores() {
    for (let row of this.tablaPresupuesto) {
      let tipoError = null
      const descripcionBuscar = row.descripcion.toUpperCase().trim().replace(/\s+/g, ' ');
      const encontrados = await this.tablaExcel.filter(ele => {
        if (ele.item == row.item) {
          return ele
        }
      })
      if (encontrados.length) {
        if (encontrados.length == 1) {
          const descripcionEle = encontrados[0].descripcion.toUpperCase().trim().replace(/\s+/g, ' ');
          let parece = stringSimilarity(descripcionEle, descripcionBuscar);
          if (1 >= parece && parece >= 0.99) {
            tipoError = 1
          } else if (parece < 0.99 && parece >= 0.75) {
            tipoError = 2
          } else {
            tipoError = 0
          }
          this.tablaExcel[encontrados[0].id_metrado].tipoError = tipoError
          this.tablaExcel[encontrados[0].id_metrado].indiceParentesco = row.ind
        } else {
          let arrayIndIgua = []
          let arraFilaIgua = []
          await encontrados.map(ele => { arrayIndIgua.push(ele.id_metrado); arraFilaIgua.push(ele.ind_titulo) })
          for (let ele of encontrados) {
            this.tablaExcel[ele.id_metrado].tipoError = 3
            this.tablaExcel[ele.id_metrado].arrayIguales = arraFilaIgua
            this.tablaExcel[ele.id_metrado].arrayIndIguales = arrayIndIgua
          }
        }
      }
    }
  }

  async reemplazarPorParecido(fila) {
    const sw = await SwalService.confirm('Estas seguro?', null,
      'Se reemplazara : <br>' + '<strong style="font-size: 10px"> ' + fila.item + ' - ' + fila.descripcion + '</strong><br> &nbsp;&#8681;&nbsp; <br> <strong style="font-size: 10px">' + this.tablaPresupuesto[fila.indiceParentesco].item + ' - ' + this.tablaPresupuesto[fila.indiceParentesco].descripcion + '</strong>')
    if (sw.isConfirmed) {
      let filaTablaExcel =  this.tablaExcel[fila.id_metrado]
      let filaTablaPresu = this.tablaPresupuesto[fila.indiceParentesco]
      filaTablaExcel.item = filaTablaPresu.item
      filaTablaExcel.descripcion = filaTablaPresu.descripcion
      filaTablaExcel.tipoError = 1
      filaTablaExcel.arrayIguales = [filaTablaExcel.ind_titulo]
      filaTablaExcel.arrayIndIguales = [filaTablaExcel.id_metrado]
      filaTablaPresu.existeHoja = 1
      filaTablaPresu.indiceParentesco = filaTablaExcel.ind_titulo
      filaTablaPresu.ind_iguales_excel = [filaTablaExcel.id_metrado]
      filaTablaPresu.arrayIndIguales = [filaTablaExcel.ind_titulo]
      filaTablaPresu.ind_iguales_excel_titulo = [filaTablaExcel.ind_titulo]

      filaTablaPresu.ind_parecido_excel = []
      filaTablaPresu.ind_parecido_excel_titulo = []
      filaTablaPresu.ind_similar_excel_titulo = []
      filaTablaPresu.ind_similar_excel = []
    } else {
      return
    }
  }

  async cambiarMultiple() {
    try {
      this.mostrar_carga_todo = true
      setTimeout(() => {
        for (const ind of this.arrayIndices) {
          let filaTablaExcel = this.filtradosExcel[ind]
          let filaTablaPresu = this.filtradosPresu[ind]
          filaTablaExcel.item = filaTablaPresu.item
          filaTablaExcel.descripcion = filaTablaPresu.descripcion
          filaTablaExcel.tipoError = 1
          filaTablaExcel.arrayIguales = [filaTablaExcel.ind_titulo]
          filaTablaExcel.arrayIndIguales = [filaTablaExcel.id_metrado]
          filaTablaPresu.existeHoja = 1
          filaTablaPresu.indiceParentesco = filaTablaExcel.ind_titulo
          filaTablaPresu.ind_iguales_excel = [filaTablaExcel.id_metrado]
          filaTablaPresu.arrayIndIguales = [filaTablaExcel.ind_titulo]
          filaTablaPresu.ind_iguales_excel_titulo = [filaTablaExcel.ind_titulo]

          filaTablaPresu.ind_parecido_excel = []
          filaTablaPresu.ind_parecido_excel_titulo = []
          filaTablaPresu.ind_similar_excel_titulo = []
          filaTablaPresu.ind_similar_excel = []
        }
        this.modalConflictos.hide()
        this.mostrar_carga_todo = false
      }, 50);
    } catch (e) {
      this.mostrar_carga_todo = true
      SwalService.error(e)
    }

  }

  async cancelarReemplazo() {
    this.filaTablaExcel = null;
    this.filaTablaPresu = null;
    this.habilitadoCorreccion = false
  }

  async habilitarReemplazoExcel(row) {
    this.habilitadoCorreccion = true
    this.filaTablaExcel = row
  }

  async reemplazarPorExcel(row) {

    if (row && this.filaTablaPresu) {
      const sw = await SwalService.confirm('Estas seguro?', null,
        'Se reemplazaran la fila de tabla presupuesto a la fila de tabla excel')
      if (sw.isConfirmed) {
        for await (const i of row.arrayIguales) {
          if (row.ind_titulo !== i) {
            this.tablaExcel[i].tipoError = 5
            this.tablaExcel[i].arrayIguales = []
            this.tablaExcel[i].arrayIndIguales = []
          }
        }
        this.filaTablaExcel.item = this.filaTablaPresu.item
        this.filaTablaExcel.descripcion = this.filaTablaPresu.descripcion
        this.filaTablaExcel.tipoError = 1
        this.filaTablaExcel.arrayIguales = [this.filaTablaExcel.ind_titulo]
        this.filaTablaExcel.arrayIndIguales = [this.filaTablaExcel.id_metrado]
        this.filaTablaPresu.existeHoja = 1
        this.filaTablaPresu.indiceParentesco = row.ind_titulo
        this.filaTablaPresu.ind_iguales_excel = [row.id_metrado]
        this.filaTablaPresu.arrayIndIguales = [row.ind_titulo]
        this.filaTablaPresu.ind_iguales_excel_titulo = [row.ind_titulo]
        this.filaTablaPresu.ind_parecido_excel = []
        this.filaTablaPresu.ind_parecido_excel_titulo = []
        this.filaTablaPresu.ind_similar_excel_titulo = []
        this.filaTablaPresu.ind_similar_excel = []
        this.filaTablaExcel = null
        this.filaTablaPresu = null
        this.habilitadoCorreccion = false
      }
    } else {
      this.toaster.error('Seleccione 1 fila de tabla Presupuesto ', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000
      })
    }

  }

  async reemplazarTodos() {
    const encontrado = await this.tablaExcel.find(ele => ele.tipoError == 2 || ele.tipoError == 0)
    if (encontrado) {
      const sw = await SwalService.confirm('Estas seguro?', null,
        'Se reemplazaran las descripciones de todas las filas con parecidos y diferentes a presupuesto')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        for (const iterator of this.tablaExcel) {
          if (iterator.tipoError == 2 || iterator.tipoError == 0 || iterator.tipoError == 3) {
            this.tablaExcel[iterator.id_metrado].descripcion = this.tablaPresupuesto[iterator.indiceParentesco].descripcion
            this.tablaExcel[iterator.id_metrado].tipoError = 1
            this.tablaPresupuesto[iterator.indiceParentesco].existeHoja = 1
            this.tablaPresupuesto[iterator.indiceParentesco].ind_iguales_excel = JSON.parse(JSON.stringify(this.tablaPresupuesto[iterator.indiceParentesco].ind_parecido_excel))
            this.tablaPresupuesto[iterator.indiceParentesco].ind_iguales_excel_titulo = JSON.parse(JSON.stringify(this.tablaPresupuesto[iterator.indiceParentesco].ind_parecido_excel_titulo))
            this.tablaPresupuesto[iterator.indiceParentesco].ind_parecido_excel = []
            this.tablaPresupuesto[iterator.indiceParentesco].ind_parecido_excel_titulo = []
            this.tablaPresupuesto[iterator.indiceParentesco].ind_similar_excel = []
            this.tablaPresupuesto[iterator.indiceParentesco].ind_similar_excel_titulo = []
          }
        }
        this.mostrar_carga_todo = false
        this.toaster.success('Se reemplazo correctamente', 'Éxito', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
      }
    } else {
      this.toaster.info('Ningun elemento para reemplazar', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000
      })
    }

  }

  async modalSolucionConflictos() {

    this.modalConflictos.show()
    this.mostrar_carga_todo = true
    setTimeout(() => {
      this.filtradosExcel = []
      this.filtradosPresu = []
      this.arrayIndices = []
      this.todosCheck = false
      this.filtradosPresu = this.tablaPresupuesto.filter(ele => (ele.ind_parecido_excel.length || ele.ind_similar_excel.length) && ele.arrayIndIguales.length == 1)
      for (const iterator of this.filtradosPresu) {
        if (iterator.ind_parecido_excel.length) {
          for (const indice of iterator.ind_parecido_excel) {
            this.filtradosExcel.push(this.tablaExcel[indice])
          }
        } else {
          for (const indice of iterator.ind_similar_excel) {
            this.filtradosExcel.push(this.tablaExcel[indice])
          }
        }
      }
      this.mostrar_carga_todo = false
    }, 100);

  }
  ///paso 4
  async crearTablaFinal() {
    this.mostrar_carga_todo = true
    this.headerTablaEstructurada = []
    this.headerTablaEstructurada2 = []
    let tablaFinal = []
    let arra = []
    if (this.listaHojasSeleccionadas.length) {
      const arrayG = ['gdescripcion', 'gcantidad', 'gfactor', 'gnveces', 'glongitud', 'gancho', 'galtura', 'gsubtotal']
      const arrayD = ['ddescripcion', 'dcantidad', 'dfactor', 'dnveces', 'dlongitud', 'dancho', 'daltura', 'dsubtotal']
      const arrayM = ['mparcial', 'mtotal']
      let arrayHeader = JSON.parse(JSON.stringify(this.listaHojasSeleccionadas[0].header))
      this.headerTablaEstructurada = this.listaHojasSeleccionadas[0].header
      for (let elemento of arrayHeader) {
        if (arrayG.includes(elemento) || arrayD.includes(elemento) || arrayM.includes(elemento)) {
          const newStr = elemento.slice(1)
          arra.push(newStr)
        } else {
          arra.push(elemento)
        }
      }
      this.headerTablaEstructurada2 = arra
      this.headerSuperior = this.listaHojasSeleccionadas[0].grupos_header
      this.idPlantillaFinal = this.listaHojasSeleccionadas[0].plantilla.id_plantilla      
      for (let ele of this.tablaPresupuesto) {
        if (ele.existeHoja == 1 && ele.unidad) {
          const arrayIndexar = await this.metradoPorPartida(ele.ind_iguales_excel[0], ele)
          tablaFinal = tablaFinal.concat(arrayIndexar)
        } else {
          const total = ele.item && ele.unidad ? '0.00' : null
          const format = new metradoModel(ele.item, ele.descripcion, ele.unidad, null, null, null, null, null, ele.indice, null, total)
          tablaFinal.push(format)
        }
      }
      let i = 0
      for (let ele of tablaFinal) {
        ele.id_metrado = i
        i++
      }

    } else {
    }
    setTimeout(async () => {
      this.tablaFinal = tablaFinal
      const encontrad = this.tablaFinal.find(ele => ele.nom_hoja)
      this.tablaFinal[0].nom_hoja = encontrad.nom_hoja      
      this.mostrar_carga_todo = false
    }, 500);
  }

  async metradoPorPartida(ind, partida) {
    const arrayNumericos = ['factor1', 'factor2', 'factor3', 'subtotal', 'gfactor', 'glongitud', 'gancho', 'galtura', 'gsubtotal', 'dfactor', 'dlongitud', 'dancho', 'daltura', 'dsubtotal', 'area', 'volumen', 'mparcial', 'subtotal']
    let arrayIndexar = []
    const excel = this.tablaExcel[ind]
    let redondeadoTotal = null
    let redondeadoParcial = null
    if (excel.mtotal !== null && excel.mtotal !== undefined && excel.mtotal !== '') {
      const valor = await this.formsService.redondeo(excel.mtotal, 2)
      redondeadoTotal = isNaN(Number(valor)) ? excel.mtotal : valor;
    }
    if (excel.mparcial !== null && excel.mparcial !== undefined && excel.mtotal !== '') {
      const valor = await this.formsService.redondeo(excel.mparcial, 2)
      redondeadoParcial = isNaN(Number(valor)) ? excel.mparcial : valor;
    }
    if (excel.item && excel.unidad && redondeadoTotal == null) {
      redondeadoTotal = await this.formsService.redondeo(0, 2)
    }
    const formato = new metradoModel(partida.item, partida.descripcion, partida.unidad, excel.id_metrado, excel.esMetrado, 1, excel.id_hoja, excel.nom_hoja, partida.indice, excel.ind_titulo, redondeadoTotal, excel.detalle, excel.cantidad, excel.nveces, excel.factor1, excel.factor2, excel.gdescripcion, excel.gcantidad, excel.gfactor, excel.gnveces, excel.glongitud, excel.gancho, excel.galtura, excel.gsubtotal, excel.ddescripcion, excel.dcantidad, excel.dfactor, excel.dnveces, excel.dlongitud, excel.dancho, excel.daltura, excel.dsubtotal, excel.area, excel.volumen, redondeadoParcial, excel.existePresu, partida.ind, excel.tipoError, excel.indiceParentesco)
    arrayIndexar.push(formato)
    for (let i = ind + 1; i < this.tablaExcel.length; i++) {
      if (this.tablaExcel[i].esMetrado) {
        const excel2 = this.tablaExcel[i]
        let redondeadoTotal2 = null
        let redondeadoParcial2 = null
        if (excel2.mtotal !== null && excel2.mtotal !== undefined) {
          const valor = await this.formsService.redondeo(excel.mtotal, 2)
          redondeadoTotal2 = isNaN(Number(valor)) ? excel.mtotal : valor;
        }
        if (excel2.mparcial !== null && excel2.mparcial !== undefined) {
          const valor = await this.formsService.redondeo(excel.mparcial, 2)
          redondeadoParcial2 = isNaN(Number(valor)) ? excel.mparcial : valor;
        }
        for (const iterator in excel2) {
          if (parseFloat(excel2[iterator]) && arrayNumericos.includes(iterator)) {
            const numero = await this.formsService.redondeo(excel2[iterator], 2);
            excel2[iterator] = isNaN(Number(numero)) ? excel2[iterator] : numero
          }
        }

        const formato2 = new metradoModel(excel2.item, excel2.descripcion, excel2.unidad, excel2.id_metrado, excel2.esMetrado, excel2.tipo, excel2.id_hoja, excel2.nom_hoja, partida.indice, excel2.ind_titulo, redondeadoTotal2, excel2.detalle, excel2.cantidad, excel2.nveces, excel2.factor1, excel2.factor2, excel2.gdescripcion, excel2.gcantidad, excel2.gfactor, excel2.gnveces, excel2.glongitud, excel2.gancho, excel2.galtura, excel2.gsubtotal, excel2.ddescripcion, excel2.dcantidad, excel2.dfactor, excel2.dnveces, excel2.dlongitud, excel2.dancho, excel2.daltura, excel2.dsubtotal, excel2.area, excel2.volumen, redondeadoParcial2, excel2.existePresu, excel2.partida_ref, excel2.tipoError, excel2.indiceParentesco)
        arrayIndexar.push(formato2)
      } else {
        break
      }
    }
    return arrayIndexar
  }


  async toggleOnResult(itemsel, indice) {
    this.tablaFinal[indice].icomost = 0;
    let nuevogru = false;
    for (let i = indice + 1; i < this.tablaFinal.length; i++) {
      if (!this.tablaFinal[i].item && this.tablaFinal[i].esMetrado) {
        this.tablaFinal[i].mostrar = 1;
      } else {
        if (this.tablaFinal[i].item != itemsel && !nuevogru) {
          var palabra = this.tablaFinal[i].item
            .toString()
            .substring(0, itemsel.toString().length + 1);
          if (palabra == itemsel + '.') {
            if (
              itemsel.split('.').length + 1 ==
              this.tablaFinal[i].item.toString().split('.').length
            ) {
              this.tablaFinal[i].mostrar = 1;
            } else {
              this.tablaFinal[i].mostrar = this.tablaFinal[i].estmost;
            }
          } else {
            nuevogru = true;
          }
        } else {
          break;
        }
      }
    }
  }

  async toggleOffResult(itemsel, indice) {
    this.tablaFinal[indice].icomost = 1;
    let ind2 = indice + 1;
    let nuevogru = false;
    for (let i = ind2; i < this.tablaFinal.length; i++) {
      if (!this.tablaFinal[i].item && this.tablaFinal[i].esMetrado) {
        this.tablaFinal[i].mostrar = 0;
      } else {
        if (this.tablaFinal[i].item != itemsel && !nuevogru) {
          var palabra = this.tablaFinal[i].item
            .toString()
            .substring(0, itemsel.toString().length + 1);
          if (palabra == itemsel + '.') {
            this.tablaFinal[i].estmost = this.tablaFinal[i].mostrar;
            this.tablaFinal[i].mostrar = 0;
          } else {
            nuevogru = true;
          }
        } else {
          break;
        }
      }
    }
  }

  async toggleOnPartida(indice) {
    this.tablaFinal[indice].icomost = 0
    const ind2 = indice + 1;
    for (let i = ind2; i < this.tablaFinal.length; i++) {
      if (!this.tablaFinal[i].item && this.tablaFinal[i].esMetrado) {
        this.tablaFinal[i].mostrar = 1;
      } else {
        break
      }
    }
  }

  async toggleOffPartida(indice) {
    this.tablaFinal[indice].icomost = 1
    const ind2 = indice + 1;
    for (let i = ind2; i < this.tablaFinal.length; i++) {
      if (!this.tablaFinal[i].item && this.tablaFinal[i].esMetrado) {
        this.tablaFinal[i].mostrar = 0;
      } else {
        break
      }
    }
  }

  maxtodo() {
    for (let row of this.tablaFinal) {
      row.mostrar = 1;
      row.icomost = 1;
    }
  }

  mintodo() {
    for (let row of this.tablaFinal) {
      if (row.item) {
        if (row.item.split('.').length > 1) {
          row.estmost = row.mostrar;
          row.mostrar = 0;
          row.icomost = 1;
        }
        else {
          row.icomost = 0; row.mostrar = 1;
        }
      } else {
        row.mostrar = 0;
        row.icomost = 1;
      }
    }
  }

  async actualizarTitulosSuperiores(ind) {
    let item = this.tablaFinal[ind].item;
    let spliteado = item.split('.')
    let titem = '';
    while (spliteado.length > 1) {
      let encontrados = [];
      spliteado.pop()
      titem = spliteado.join('.') + '.'
      encontrados = await this.tablaFinal.filter(
        (ele) => {
          if (ele.item) {
            var split = ele.item.split('.')
            split.pop()
            if (split.join('.') + '.' == titem)
              return ele
          }
        }
      );
      let mTotal = 0;
      await encontrados.map(
        (ele) => (mTotal = (ele.mtotal !== null ? Number(ele.mtotal) : 0) + mTotal)
      );
      var elementoPadre = this.tablaFinal.find(
        (ele) => ele.item && (spliteado).join('.') == ele.item
      );
      const redondeado = await this.formsService.redondeo(mTotal, 2)
      this.tablaFinal[elementoPadre.id_metrado].mtotal = redondeado;
    }
  }

  async guardarTablaFinal() {
    try {
      const sw = await SwalService.confirm('Estas seguro?', null, 'Se guardara la tabla de resultado al titulo : <br> <strong>' + this.titulo.item + ' - ' + this.titulo.descripcion + '</strong>')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        for await (let ele of this.tablaFinal) {
          ele.estmost = 1; ele.mostrar = 1; ele.icomost = 1
        }
        const id_proyecto = this.idProyecto;
        const id_usuario = this.idUsuario;
        const indice_tit = this.titulo.indice;
        const nomarchivo = this.nombreArchivo;
        const plantilla = this.idPlantillaFinal;
        console.log(this.tablaFinal)
        const datos1 = JSON.stringify(this.tablaFinal);
        const obj = JSON.stringify({
          id_proyecto: id_proyecto,
          id_usuario: id_usuario,
          indice_tit: indice_tit,
          nomarchivo: nomarchivo,
          plantilla: plantilla,
          datos1: datos1
        });
        const response = await this.metradoService.importarMetrado(obj)
        if (response.id == '1') {
          let cantidadRegistrados = 0
          let totalPartidas = 0
          for (let elemento of this.listaPresuesto) {
            if (elemento.unidad) {
              totalPartidas++
            }
            const encontrado = await this.tablaFinal.find(ele => ele.item == elemento.item && ele.descripcion == elemento.descripcion)
            if (encontrado) {
              elemento.metrado = parseFloat(encontrado.mtotal)
              if (elemento.metrado !== 0 && elemento.unidad && elemento.unidad) {
                cantidadRegistrados++
              }
            }
          }
          if (cantidadRegistrados> 0) {
             var porcentaje = (cantidadRegistrados * 100) / totalPartidas;
          } else {
            porcentaje = 0
          }
         
          const rendiValido =  Math.floor(porcentaje)
           await this.actualizarTituloMetrado(rendiValido);
          this.toaster.success('Se guardo Correctamente', 'Éxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
          this.closeModal({respuesta:'ok',porcentaje:rendiValido})
        } else {
          SwalService.error('Error', response.mensaje)
        }
        this.mostrar_carga_todo = false
      }
    } catch (e) {
      SwalService.error()
      console.log(e);
      this.mostrar_carga_todo = false
    }
  }

  async actualizarTituloMetrado(porcentaje) {
    const obj = {
      id_proyecto: this.idProyecto,
      indice: this.titulo.indice,
      tipo_registro: this.titulo.tipo_registro,
      estado_metrado: porcentaje,
    };
    await this.metradoService.actualizarTituloMetrado(obj);
  }

  async cerrarModal() {
    this.modalConflictos.hide();
  }

  async cambiocheck(event, ind) {
    if (event) {
      if (ind !== null) {
        this.arrayIndices.push(ind)
      } else {
        this.arrayIndices = []
        this.filtradosExcel.map((ele, index) => this.arrayIndices.push(index))
        this.todosCheck = true
      }
    } else {
      if (ind !== null) {
        const posicion = this.arrayIndices.findIndex(ele => ind == ele)
        this.arrayIndices.splice(posicion, 1)
      } else {
        this.arrayIndices = []

      }
      this.todosCheck = false
    }
  }

  
}