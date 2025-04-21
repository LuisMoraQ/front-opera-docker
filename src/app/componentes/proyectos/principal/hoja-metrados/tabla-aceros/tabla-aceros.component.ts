import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, ViewChild, OnChanges, AfterContentChecked, AfterViewChecked, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { Acero, aceroModelo } from '../modal-editar-metrado/acero';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ModalPesosComercialesComponent } from '../modal-pesos-comerciales/modal-pesos-comerciales.component';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

@Component({
  selector: 'app-tabla-aceros',
  templateUrl: './tabla-aceros.component.html',
  styleUrls: ['./tabla-aceros.component.scss']
})
export class TablaAcerosComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('p') public popover: NgbPopover;
  @ViewChild('p2') public popover2: NgbPopover;
  @ViewChild('p3') public popover3: NgbPopover;
  seleccionadoTabla1: any;
  mostrar_carga_todo = false
  posicionCursor;
  filaSel = null
  @Input() filaSeleccionada = null
  habilitarTabla = null
  tablaAceros: Acero[] = []
  cantidadFilas = 20
  buscando2 = false
  eliminarMultiple = false
  detalleRowSelect = null
  cantidadFilasTabla = 20
  listaPesos = [];
  id_usuario = null
  @Input() sumaSubTotales: number = 0;
  tipoEdicion: any = null
  iniciado = false
  cancelarEvento: boolean = false;
  get seleccionadoRow(): any {
    return this.seleccionadoTabla1;
  }
  @Input() set seleccionadoRow(value: any) {
  
    this.seleccionadoTabla1 = value;    
    if (this.seleccionadoTabla1.plantilla == 1) {
      this.iniciarTablaAceros()
      this.seleccionadoTabla1.tablaInicialAcero = this.tablaAceros
    }
  }
  @Output() filaAceroSelect = new EventEmitter<number>()
  @Output() tablaAcero = new EventEmitter<any>()
  @Output() totalAceros = new EventEmitter<any>()
  @Output() tablaSistema = new EventEmitter<any>()
  constructor(private metradoService: MetradoService, private toaster: ToastrService,
    private encriptadorService: EncriptadorService,
    private modalService: NgbModal,
    public formsService: FormsService) { }

  async ngOnInit() {
    this.id_usuario = this.encriptadorService.recuperarlocalstory('idusuario');
    await this.listarPesosPorUsuario()
  }

  @HostListener('document:keydown.control.arrowright', ['$event'])
  async volverSubmetrado(e?: KeyboardEvent, a?) {

    if (this.cancelarEvento) {
      this.cancelarEvento = false
      return
    }
    if (this.detalleRowSelect?.id_metrado !== null) {
      if (this.detalleRowSelect.id_metrado !== null && this.detalleRowSelect.esMetrado) {
        let existeSubmetrado = null
        for (let i = this.detalleRowSelect.id_metrado + 1; i < this.tablaAceros.length; i++) {
          if (this.tablaAceros[i].esMetrado) {
            break
          } else {
            existeSubmetrado = this.tablaAceros[i]
          }
        }
        if (!existeSubmetrado && this.detalleRowSelect.id_metrado > 0) {
          const metrado = this.detalleRowSelect
          metrado.esMetrado = 0
          metrado.item = '-'
          this.tablaAceros[this.detalleRowSelect.id_metrado] = metrado
          await this.actualizarTablaCompleta()
          this.detalleRowSelect = this.tablaAceros[this.filaSel]
          this.filaAceroSelect.emit(this.detalleRowSelect)
          return
        } else if (this.detalleRowSelect.id_metrado == 0) {
          this.toaster.error('No se puede convertir a submetrado', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
          return
        } else {
          this.toaster.error('El metrado contiene submetrados', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000
          })
          return
        }
      }
    } else {
      this.toaster.error('No se puede convertir', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return
    }
    e.preventDefault();
  }

  @HostListener('document:keydown.control.arrowleft', ['$event'])
  async volverMetrado(e?: KeyboardEvent) {
    if (this.cancelarEvento) {
      this.cancelarEvento = false
      return
    }
    if (this.detalleRowSelect) {
      if (this.detalleRowSelect.id_metrado && !this.detalleRowSelect.esMetrado) {
        this.tablaAceros[this.detalleRowSelect.id_metrado].esMetrado = 1
        await this.actualizarTablaCompleta()
      } else {
        return
      }

    } else {
      this.toaster.error('Ninguna fila seleccionada', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return
    }
    e.preventDefault();
  }

  async moverArriba(e?: KeyboardEvent) {
    if (this.detalleRowSelect.esMetrado) {
      let metradoAnterior = null
      let metradoPosterior = null
      let indSubAnt = []
      let indSubPost = []
      if (!this.detalleRowSelect.id_metrado) {
        this.toaster.error('No se puede mover', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000
        })
        return
      }
      for (let i = this.detalleRowSelect.id_metrado - 1; i >= 0; i--) {
        if (!metradoAnterior) {
          if (this.tablaAceros[i].esMetrado) {
            metradoAnterior = this.tablaAceros[i]
          } else {
            indSubAnt.push(i)
          }
        } else {
          break
        }
      }
      for (let i = this.detalleRowSelect.id_metrado + 1; i < this.tablaAceros.length; i++) {
        if (!metradoPosterior) {
          if (this.tablaAceros[i].esMetrado) {
            metradoPosterior = this.tablaAceros[i]
          } else {
            indSubPost.push(i)
          }
        } else {
          break
        }
      }
      const cantidad = indSubPost.length
      const indIndexar = JSON.parse(JSON.stringify(metradoAnterior.id_metrado))
      const indSelect = JSON.parse(JSON.stringify(this.detalleRowSelect.id_metrado))

      for (let i = cantidad; i >= 0; i--) {
        const partidaSel = JSON.parse(JSON.stringify(this.tablaAceros[indSelect + cantidad]))
        this.tablaAceros.splice(indIndexar, 0, partidaSel)
      }
      for (let i = cantidad; i >= 0; i--) {
        this.tablaAceros.splice(indSelect + cantidad + 1, 1)
      }

      await this.actualizarTablaCompleta()
      this.filaSel = indIndexar
      this.detalleRowSelect = this.tablaAceros[this.filaSel]
      this.filaAceroSelect.emit(this.detalleRowSelect)
    } else {
      const partidaSel = JSON.parse(JSON.stringify(this.tablaAceros[this.detalleRowSelect.id_metrado]))
      const partidaAnt = JSON.parse(JSON.stringify(this.tablaAceros[this.detalleRowSelect.id_metrado - 1]))
      if (partidaAnt.esMetrado) {
        this.toaster.error('No se puede mover mas', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000
        })
        return
      } else {
        this.tablaAceros[this.filaSel - 1] = partidaSel
        this.tablaAceros[this.filaSel - 1].item = ''
        this.tablaAceros[this.filaSel - 1].id_metrado = this.filaSel - 1
        this.tablaAceros[this.filaSel] = partidaAnt
        this.tablaAceros[this.filaSel].item = ''
        this.tablaAceros[this.filaSel].id_metrado = this.filaSel

        this.filaSel = this.filaSel - 1
        this.detalleRowSelect = this.tablaAceros[this.filaSel]
        this.filaAceroSelect.emit(this.detalleRowSelect)
      }
    }
    if (e)
      e.preventDefault();
  }

  async moverAbajo(e?: KeyboardEvent) {
    if (this.detalleRowSelect.esMetrado) {
      let metradoPosterior = null
      let cantSubMetrSgte = []
      let cantSubMetrSelec = []
      for (let i = this.detalleRowSelect.id_metrado + 1; i < this.tablaAceros.length; i++) {
        if (this.tablaAceros[i].id_metrado !== null) {
          if (this.tablaAceros[i].esMetrado) {
            metradoPosterior = this.tablaAceros[i]
            break
          } else {
            cantSubMetrSelec.push(i)
          }
        }
      }

      if (!metradoPosterior?.id_metrado) {
        this.toaster.error('No se puede mover', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000
        })
        return
      }
      for (let i = metradoPosterior.id_metrado + 1; i < this.tablaAceros.length; i++) {
        if (!this.tablaAceros[i].esMetrado && this.tablaAceros[i].id_metrado !== null) {
          cantSubMetrSgte.push(i)
        }
        if (this.tablaAceros[i].esMetrado && this.tablaAceros[i].id_metrado !== null) {
          break
        }
      }
      const cantSelec = cantSubMetrSelec.length + 1
      const cantSgteMetr = cantSubMetrSgte.length + 1
      const indIndexar = JSON.parse(JSON.stringify(metradoPosterior.id_metrado + cantSgteMetr))
      const indSelect = JSON.parse(JSON.stringify(this.detalleRowSelect.id_metrado))
      for (let i = cantSelec - 1; i >= 0; i--) {
        const partidaSel = JSON.parse(JSON.stringify(this.tablaAceros[indSelect + i]))
        this.tablaAceros.splice(indIndexar, 0, partidaSel)
      }
      for (let i = 0; i < cantSelec; i++) {
        this.tablaAceros.splice(indSelect, 1)
      }
      await this.actualizarTablaCompleta()
      this.filaSel = indSelect + cantSgteMetr
      this.detalleRowSelect = this.tablaAceros[this.filaSel]
      this.filaAceroSelect.emit(this.detalleRowSelect)
    } else {
      const partidaSel = JSON.parse(JSON.stringify(this.tablaAceros[this.detalleRowSelect.id_metrado]))
      const partidaSig = JSON.parse(JSON.stringify(this.tablaAceros[this.detalleRowSelect.id_metrado + 1]))
      if (partidaSig.esMetrado) {
        this.toaster.error('No se puede mover mas', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000
        })
        return
      } else {
        this.tablaAceros[this.filaSel + 1] = partidaSel
        this.tablaAceros[this.filaSel + 1].item = ''
        this.tablaAceros[this.filaSel + 1].id_metrado = this.filaSel + 1
        this.tablaAceros[this.filaSel] = partidaSig
        this.tablaAceros[this.filaSel].item = ''
        this.tablaAceros[this.filaSel].id_metrado = this.filaSel
        this.filaSel = this.filaSel + 1
        this.detalleRowSelect = this.tablaAceros[this.filaSel]
        this.filaAceroSelect.emit(this.detalleRowSelect)
      }
    }
    if (e)
      e.preventDefault();
  }

  quitarfoco(element: any) {
    if (element?.target) {
      element.target.blur();
      element.target.parentElement.blur();
    }
  }

  async iniciarTablaAceros() {
    this.tablaAceros = []
    if (this.seleccionadoTabla1?.plantilla == 1) {
      if (!this.seleccionadoTabla1?.detalleAcero) {
        this.buscando2 = true
        const arrayRecuperado = await this.listarMetradoXPartida()
        if (arrayRecuperado.length) {
          for (let fila of arrayRecuperado) {
            const acero = new aceroModelo(
              fila.descripcion, fila.esMetrado, fila.item, fila.id_metrado, fila.indice, fila.id_proyecto, fila.cantidad, fila.diametro, fila.elementos, fila.total1, fila.longitud, fila.total2, fila.subtotal, fila.id_padre, fila.tieneSubmetrado
            )
            this.tablaAceros.push(acero)
          }
        }
        if (this.tablaAceros.length < this.cantidadFilas) {
          const faltantes = this.cantidadFilas - this.tablaAceros.length
          for (let i = 0; i < faltantes; i++) {
            const row = new aceroModelo('', 1, null, null, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
            this.tablaAceros.push(row)
          }
        }
        await this.actualizarTablaCompleta()
        await this.calculartotales()
        this.buscando2 = false
      } else {
        this.buscando2 = true
        this.tablaAceros = this.seleccionadoTabla1.detalleAcero
        this.buscando2 = false
      }
    } else {
      this.tablaAceros = []
    }

  }

  async listarMetradoXPartida() {
    const obj = {
      id_proyecto: this.seleccionadoTabla1.id_proyecto,
      indice: this.seleccionadoTabla1.indice
    }
    const response = await this.metradoService.listarMetradoXPartida(obj)
    const array = response[1].length ? response[1]: []
    return array
  }

  async actualizarTablaCompleta() {
    let item = 1
    this.seleccionadoTabla1.editadoMetrado = 1
    this.tablaAceros = await this.tablaAceros.map((ele, index) => {
      if (ele.id_metrado !== null) {
        ele.id_metrado = index
        if (ele.esMetrado) {
          ele.item = (item).toString()
          item++
          if (!this.tablaAceros[index + 1].esMetrado && this.tablaAceros[index + 1].id_metrado !== null) {
            ele.tieneSubmetrado = 1
          } else if (this.tablaAceros[index + 1].esMetrado && this.tablaAceros[index + 1].id_metrado !== null) {
            ele.tieneSubmetrado = 0
          }
        } else {
          ele.item = '-'
        }
      }
      return ele
    })
    await this.actualizarParametrosPrincipal()
  }

  async habilitarEditar(celda, rowIndex) {
    this.tipoEdicion = null
    this.cancelarEvento = true
    if (this.filaSel !== null && this.tablaAceros[this.filaSel].id_metrado !== null) {
      this.tablaAceros[this.filaSel].editardiametro = 0
    }
    this.filaSel = rowIndex
    this.filaSeleccionada = this.tablaAceros[this.filaSel]
    this.detalleRowSelect = this.tablaAceros[this.filaSel]
    this.filaAceroSelect.emit(this.filaSeleccionada)
    if (this.filaSeleccionada.id_metrado == null && celda !== 'descripcion' && this.tablaAceros[rowIndex]?.tieneSubmetrado == 1) {
      return
    } else {
      this.tablaAceros[this.filaSel].editardiametro = 0
      switch (celda) {
        case 'descripcion':
          this.tablaAceros[rowIndex].editardescripcion = 1
          break;
        case 'elementos':
          this.tablaAceros[rowIndex].editarelementos = 1
          break;
        case 'cantidad':
          this.tablaAceros[rowIndex].editarcantidad = 1
          break;
        case 'diametro':
          this.tablaAceros[rowIndex].editardiametro = 1
          break;
        case 'longitud':
          this.tablaAceros[rowIndex].editarlongitud = 1
          break;
        default:
          break;
      }
    }
  }

  async evaluarTexto(value, input, input2, i) {
    this.tablaAceros[i]['editar' + input] = 0
    if (input2 == 'descripcion' && value) {
      const row = this.tablaAceros[i]
      if (row.id_metrado !== null) {
        this.tablaAceros[i][input2] = (value).toUpperCase()
      } else {
        const nuevoRow = new aceroModelo('', 1, '1', 0, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto, null, null, null, 0, null, 0)
        nuevoRow[input2] = (value).toUpperCase()
        this.tablaAceros[i] = nuevoRow
        await this.actualizarTablaCompleta()
      }
    } else {
      if (this.tablaAceros[i].id_metrado !== null) {
        this.tablaAceros[i][input2] = (value).toUpperCase()
      } else {
        return
      }
    }
    await this.calculartotales()
    this.detalleRowSelect = this.tablaAceros[i]
    // this.cancelarEvento = false
  }

  async actualizarTexto(value, i, input, sgteEdit?) {

    const anterior = this.tablaAceros[i][input]
    if (value !== anterior) {
      if (input == 'descripcion' && value) {
        const row = this.tablaAceros[i]
        if (row.id_metrado !== null) {
          this.tablaAceros[i][input] = (value).toUpperCase()
        } else {
          const nuevoRow = new aceroModelo('', 1, '1', 0, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto, null, null, null, 0, null, 0)
          nuevoRow[input] = (value).toUpperCase()
          this.tablaAceros[i] = nuevoRow
          await this.actualizarTablaCompleta()
          if (sgteEdit)
            this.tablaAceros[i]['editar' + sgteEdit] = 1
        }
      } else {
        if (this.tablaAceros[i].id_metrado !== null) {
          this.tablaAceros[i][input] = (value).toUpperCase()
        } else {
          return
        }
      }
      this.detalleRowSelect = this.tablaAceros[i]
      await this.calculartotales()
      // this.cancelarEvento = false
    }
  }

  async presionarTecla(event, indRow, edit, param) {
    this.tipoEdicion = null
    this.iniciado = false
    // this.cancelarEvento = true
    if (event.keyCode.toString() == "40") {
      if (indRow + 1 < this.tablaAceros.length) {
        this.tablaAceros[indRow]['editar' + edit] = 0;
        await this.actualizarTexto((event.target.value).toUpperCase(), indRow, param)
        let sgteValido = null
        let index = indRow + 1
        if (edit !== 'Descripcion') {
          while (!sgteValido) {
            if (!this.tablaAceros[index].tieneSubmetrado) {
              sgteValido = true
            } else {
              index++
            }
          }
        }
        this.tablaAceros[index]['editar' + edit] = 1;
        this.filaSel = index
        this.filaSeleccionada = this.tablaAceros[this.filaSel]
        this.detalleRowSelect = this.tablaAceros[this.filaSel]
        this.filaAceroSelect.emit(this.filaSeleccionada)
      } else {
        return
      }
    } else if (event.keyCode.toString() == "38") {
      if (indRow > 0) {
        this.tablaAceros[indRow]['editar' + edit] = 0;
        await this.actualizarTexto((event.target.value).toUpperCase(), indRow, param)
        let sgteValido = null
        let index = indRow - 1
        if (edit !== 'Descripcion') {
          while (!sgteValido) {
            if (!this.tablaAceros[index].tieneSubmetrado) {
              sgteValido = true
            } else {
              index--
            }
          }
        }
        this.tablaAceros[index]['editar' + edit] = 1;
        this.filaSel = index
        this.filaSeleccionada = this.tablaAceros[this.filaSel]
        this.detalleRowSelect = this.tablaAceros[this.filaSel]
        this.filaAceroSelect.emit(this.filaSeleccionada)
      } else {
        return
      }
    } else if (event.keyCode.toString() == "39") {
      this.tipoEdicion = edit
      this.cancelarEvento = true
      this.detalleRowSelect = this.tablaAceros[indRow]
      const longitudTexto = event.target.value.length
      const posicionCursor = event.target.selectionStart
      !this.posicionCursor ? this.posicionCursor = posicionCursor : this.posicionCursor = this.posicionCursor
      if (this.tablaAceros[indRow].tieneSubmetrado && this.tablaAceros[indRow].esMetrado) {
        return
      }
      if (this.posicionCursor > longitudTexto) {
        const sgte = this.sgteColumna(edit, true)
        this.tablaAceros[indRow]['editar' + edit] = 0;
        this.tablaAceros[indRow]['editar' + sgte] = 1;
        await this.actualizarTexto((event.target.value).toUpperCase(), indRow, param, sgte)
        this.posicionCursor = null
      } else if (this.posicionCursor == longitudTexto) {
        this.posicionCursor++
        return
      } else {
        this.posicionCursor = posicionCursor
        return
      }
    } else if (event.keyCode.toString() == "37") {
      this.detalleRowSelect = this.tablaAceros[indRow]
      const posicionCursor = event.target.selectionStart
      !this.posicionCursor ? this.posicionCursor = posicionCursor : this.posicionCursor = this.posicionCursor
      if (this.posicionCursor < 0) {
        const sgte = this.sgteColumna(edit, false)
        await this.actualizarTexto((event.target.value).toUpperCase(), indRow, edit)
        this.tablaAceros[indRow]['editar' + edit] = 0;
        this.tablaAceros[indRow]['editar' + sgte] = 1;
        this.posicionCursor = null
      } else if (posicionCursor == 0) {
        this.posicionCursor--
        return
      } else {
        this.posicionCursor = posicionCursor
        return
      }
    } else if (event.keyCode.toString() == "13") {
      this.detalleRowSelect = this.tablaAceros[indRow]
      await this.evaluarTexto((event.target.value).toUpperCase(), edit, param, indRow)
      this.tablaAceros[indRow]['editar' + edit] = 0
    }
  }

  sgteColumna(columna, derecha) {
    let sgte = null
    switch (columna) {
      case 'Descripcion':
        sgte = !derecha ? 'Descripcion' : 'Cantidad'
        return sgte
      case 'Cantidad':
        sgte = !derecha ? 'Descripcion' : 'Elementos'
        return sgte
      case 'Elementos':
        sgte = !derecha ? 'Cantidad' : 'Longitud'
        return sgte
      case 'Longitud':
        sgte = !derecha ? 'Elementos' : 'Diametro'
        return sgte
      case 'Diametro':
        sgte = !derecha ? 'Longitud' : 'Diametro'
        return sgte
      default:
        return sgte
    }

  }

  async agregarAceroTitulo() {
    if (this.detalleRowSelect !== null) {
      let sgteMetrado = null
      let ultimoSubMetrado = null
      if (this.tablaAceros.length > this.detalleRowSelect.id_metrado) {
        for (let i = this.detalleRowSelect.id_metrado + 1; i < this.tablaAceros.length; i++) {
          if (this.tablaAceros[i].id_metrado !== null) {
            if (this.tablaAceros[i].esMetrado) {
              sgteMetrado = this.tablaAceros[i]
              break
            } else {
              ultimoSubMetrado = this.tablaAceros[i]
            }
          } else {
            break
          }
        }
      }
      if (sgteMetrado) {
        const metrado = new aceroModelo('', 1, '1', sgteMetrado.id_metrado + 1, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        this.tablaAceros.splice(sgteMetrado.id_metrado, 0, metrado)
      } else {
        let metrado
        let index
        if (ultimoSubMetrado) {
          index = ultimoSubMetrado.id_metrado + 1
          metrado = new aceroModelo('', 1, '1', ultimoSubMetrado.id_metrado + 1, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        } else {
          index = this.tablaAceros[this.filaSel].id_metrado + 1
          metrado = new aceroModelo('', 1, '1', index, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        }
        this.tablaAceros.splice(index, 0, metrado)
      }
      if (this.tablaAceros[this.tablaAceros.length - 1].id_metrado == null) {
        this.tablaAceros.pop()
      }
    } else {
      let ultimoExistente = null
      for (let i = this.tablaAceros.length - 1; i >= 0; i--) {
        if (this.tablaAceros[i].id_metrado !== null) {
          ultimoExistente = this.tablaAceros[i]
          break
        }
      }
      if (ultimoExistente) {
        this.tablaAceros[0] = new aceroModelo('', 1, '1', 0, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        const acero = new aceroModelo('', 1, '1', ultimoExistente.id_metrado + 1, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        this.tablaAceros[ultimoExistente.id_metrado + 1] = acero
      } else {
        this.tablaAceros[0] = new aceroModelo('', 1, '1', 0, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
      }
      await this.actualizarTablaCompleta()
    }
  }

  async agregarSecundario() {
    if (this.detalleRowSelect) {
      if (this.detalleRowSelect.esMetrado) {
        let ultimoSubMetrado = null
        if (this.detalleRowSelect.id_metrado < this.tablaAceros.length) {
          for (let i = this.detalleRowSelect.id_metrado + 1; i < this.tablaAceros.length; i++) {
            if (this.tablaAceros[i].id_metrado !== null) {
              if (this.tablaAceros[i].esMetrado) {
                break
              } else {
                ultimoSubMetrado = this.tablaAceros[i]
              }
            } else {
              break
            }
          }
        }
        let index = null
        if (ultimoSubMetrado) {
          index = ultimoSubMetrado.id_metrado + 1
        } else {
          index = this.detalleRowSelect.id_metrado + 1
        }
        const subMetrado = new aceroModelo('', 0, '-', index, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        this.tablaAceros.splice(index, 0, subMetrado)
        await this.limpiarMetrado(this.filaSel)
      } else {
        const subMetrado = new aceroModelo('', 0, '-', this.detalleRowSelect.id_metrado, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        this.tablaAceros.splice(this.detalleRowSelect.id_metrado + 1, 0, subMetrado)
        await this.limpiarMetrado(this.filaSel)
      }

      if (this.tablaAceros[this.tablaAceros.length - 1].id_metrado == null) {
        this.tablaAceros.pop()
      }
      await this.actualizarTablaCompleta()
    } else {
      this.toaster.error('Ningun Metrado Seleccionado', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return
    }
  }

  async limpiarMetrado(i) {
    this.tablaAceros[i].cantidad = null
    this.tablaAceros[i].diametro = null
    this.tablaAceros[i].elementos = null
    this.tablaAceros[i].longitud = null
    this.tablaAceros[i].pesodiametro = null
    this.tablaAceros[i].total1 = null
    this.tablaAceros[i].total2 = null
    this.tablaAceros[i].tieneSubmetrado = 1
  }

  async agregarFila() {
    const metrado = new aceroModelo(null, 1, null, null, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
    this.tablaAceros.push(metrado)
  }

  async agregarFilas(cantidad) {
    // if (this.popover3.isOpen()) this.popover3.close();
    // for (let i = 0; i < cantidad; i++) {
    //   await this.agregarFila()
    // }
  }

  async desplazarArriba() {
    if (this.detalleRowSelect?.id_metrado !== null && this.detalleRowSelect?.id_metrado > 0) {
      const indAnterior = this.detalleRowSelect.id_metrado - 1
      if (this.tablaAceros[indAnterior]?.id_metrado == null) {
        this.tablaAceros[indAnterior] = this.detalleRowSelect
        this.tablaAceros[this.detalleRowSelect.id_metrado] = new aceroModelo(null, 1, null, null, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        this.detalleRowSelect = this.tablaAceros[indAnterior]
        this.filaSel = indAnterior
        // this.dataSource[this.filaSel].editadoMetrado = 1
        await this.actualizarTablaCompleta()
      } else {
        this.toaster.error('No se puede desplazar elemento', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000
        })
        return
      }
    } else {
      this.toaster.error('No se puede desplazar elemento', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return
    }
  }

  async desplazarAbajo() {
    if (this.detalleRowSelect?.id_metrado !== null) {
      const indSgte = this.detalleRowSelect.id_metrado + 1
      if (this.tablaAceros[indSgte]?.id_metrado == null && indSgte < this.tablaAceros.length) {
        this.tablaAceros[indSgte] = this.detalleRowSelect
        this.tablaAceros[this.detalleRowSelect.id_metrado] = new aceroModelo(null, 1, null, null, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        this.detalleRowSelect = this.tablaAceros[indSgte]
        this.filaSel = indSgte
        // this.dataSource[this.filaSel].editadoMetrado = 1
        await this.actualizarTablaCompleta()
      } else {
        this.toaster.error('No se puede desplazar elemento', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000
        })
        return
      }
    } else {
      this.toaster.error('No se puede desplazar elemento', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return
    }
  }

  async eliminarRow() {
    if (this.detalleRowSelect.esMetrado) {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el metrado y submetrados relacionados')
      if (sw.isConfirmed) {
        let ultimoSubmetrado = null
        for (let i = this.detalleRowSelect.id_metrado + 1; i < this.tablaAceros.length; i++) {
          if (this.tablaAceros[i].esMetrado) {
            break
          } else {
            ultimoSubmetrado = this.tablaAceros[i].id_metrado
          }
        }
        let cantidad
        ultimoSubmetrado ? cantidad = ultimoSubmetrado - this.detalleRowSelect.id_metrado : cantidad = 0
        this.tablaAceros.splice(this.detalleRowSelect.id_metrado, cantidad + 1)
        // this.dataSource[this.filaSel].editadoMetrado = 1
      }
    } else {
      this.tablaAceros.splice(this.detalleRowSelect.id_metrado, 1)
      // this.dataSource[this.filaSel].editadoMetrado = 1
    }
    await this.actualizarTablaCompleta()
    if (this.tablaAceros.length < this.cantidadFilasTabla) {
      const cantidad = this.cantidadFilasTabla - this.tablaAceros.length
      for (let i = 0; i < cantidad; i++) {
        const metrado = new aceroModelo(null, 1, null, null, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        this.tablaAceros.push(metrado)
      }
    }
    await this.calculartotales()
    this.detalleRowSelect = null
    this.filaSel = -1
    // await this.verificarValidosTabla()
  }

  seleccionRowTabla(i) {
    this.filaSel = i
    this.detalleRowSelect = this.tablaAceros[i]
    this.filaAceroSelect.emit(this.detalleRowSelect)
  }

  async agregarMultipleMetrado(cantidad) {
    if (this.popover.isOpen()) this.popover.close();
    if (this.detalleRowSelect?.id_metrado !== null) {
      for (let i = 0; i < cantidad; i++) {
        await this.agregarAceroTitulo()
      }
    } else {
      let existente = null
      if (this.tablaAceros.length) {
        for (let i = this.tablaAceros.length - 1; i >= 0; i--) {
          if (this.tablaAceros[i].id_metrado !== null) {
            existente = this.tablaAceros[i]
            break
          }
        }
      }
      let index = null
      if (existente) {
        index = existente.id_metrado + 1
      } else {
        index = 0
      }
      for (let i = 0; i < cantidad; i++) {
        const acero = new aceroModelo('', 1, '1', index, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        this.tablaAceros.splice(index, 0, acero)
        if (!this.tablaAceros[this.tablaAceros.length - 1].id_metrado) {
          this.tablaAceros.pop()
        }
      }

      let nroMetrado = 1
      this.tablaAceros = await this.tablaAceros.map((ele, index) => {
        if (ele.id_metrado !== null) {
          ele.id_metrado = index
          if (ele.esMetrado) {
            ele.item = (nroMetrado).toString()
            nroMetrado++
          } else {
            ele.item = '-'
          }
        }
        return ele
      })
    }
  }

  async agregarMultipleSubmetrado(cantidad) {
    if (this.popover2.isOpen()) this.popover2.close();
    if (this.detalleRowSelect.id_metrado !== null) {
      let index = null
      if (this.detalleRowSelect.esMetrado) {
        let ultimoSubmetrado = null
        let sgteMetrado = null
        for (let i = this.detalleRowSelect.id_metrado + 1; i < this.tablaAceros.length; i++) {
          if (this.tablaAceros[i].id_metrado !== null) {
            if (!this.tablaAceros[i].esMetrado) {
              ultimoSubmetrado = this.tablaAceros[i]
            } else {
              sgteMetrado = this.tablaAceros[i]
              break
            }
          } else {
            break
          }
        }
        if (ultimoSubmetrado) {
          index = ultimoSubmetrado.id_metrado + 1
        } else {
          index = sgteMetrado ? sgteMetrado.id_metrado : this.detalleRowSelect.id_metrado + 1
        }
      } else {
        index = this.detalleRowSelect.id_metrado + 1
      }
      for (let i = 0; i < cantidad; i++) {
        const acero = new aceroModelo('', 0, '-', index, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
        this.tablaAceros.splice(index, 0, acero)
      }
      if (this.filaSel !== null) {
        this.tablaAceros[this.filaSel].cantidad = null
        this.tablaAceros[this.filaSel].diametro = null
        this.tablaAceros[this.filaSel].elementos = null
        this.tablaAceros[this.filaSel].longitud = null
        this.tablaAceros[this.filaSel].pesodiametro = null
        this.tablaAceros[this.filaSel].total1 = 0
        this.tablaAceros[this.filaSel].total2 = 0
        // this.tablaAceros[this.filaSel].subtotal = this.formsService.redondeo(0, this.dec
      }
      await this.actualizarTablaCompleta()
      for (let i = this.tablaAceros.length - 1; i >= 0; i--) {
        if (this.tablaAceros.length > 20 && this.tablaAceros[i].id_metrado == null) {
          this.tablaAceros.splice(i, 1)
        } else {
          break
        }
      }
      await this.calculartotales()
    } else {
      this.toaster.error('Ningun Metrado Seleccionado', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return

    }
  }

  async eliminarVarios() {
    if (this.eliminarMultiple) {
      const validos = await this.tablaAceros.filter(ele => ele.id_metrado !== null && ele.editarEliminar)
      if (validos.length) {
        const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà todos los metrados seleccionados')
        if (sw.isConfirmed) {
          for (let i = this.tablaAceros.length - 1; i >= 0; i--) {
            if (this.tablaAceros[i].editarEliminar) {
              this.tablaAceros.splice(i, 1)
              if (this.tablaAceros.length < 20) {
                const acero = new aceroModelo(null, 1, null, null, this.seleccionadoTabla1.indice, this.seleccionadoTabla1.id_proyecto)
                this.tablaAceros.push(acero)
              }
            }
          }
          // this.dataSource[this.filaSel].editadoMetrado = 1
          this.detalleRowSelect = null
          this.filaSel = -1
          let nroMetrado = 1
          this.tablaAceros = await this.tablaAceros.map((ele, index) => {
            if (ele.id_metrado !== null) {
              ele.id_metrado = index
              if (ele.esMetrado) {
                ele.item = (nroMetrado).toString()
                nroMetrado++
              } else {
                ele.item = '-'
              }
            }
            return ele
          })
          await this.calculartotales()
        }
        this.eliminarMultiple = false
        return

      } else {
        this.eliminarMultiple = false
        this.toaster.error('Ningun elemento para eliminar', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000
        })
        return
      }
    } else {
      const existe = this.tablaAceros.find(ele => ele.id_metrado !== null)
      if (existe) {
        this.eliminarMultiple = true
      } else {
        this.eliminarMultiple = false
      }
      return
    }
  }

  async cambioCheckbox(valor, index) {
    const row = this.tablaAceros[index]
    this.tablaAceros[index].editarEliminar = valor
    if (row.esMetrado && valor) {
      for (let i = index + 1; i < this.tablaAceros.length; i++) {
        if (!this.tablaAceros[i].esMetrado) {
          this.tablaAceros[i].editarEliminar = true
        } else {
          break
        }
      }
    } else if (!row.esMetrado && !valor) {
      for (let i = index - 1; i >= 0; i--) {
        if (this.tablaAceros[i].esMetrado) {
          this.tablaAceros[i].editarEliminar = false
          break
        } else {

        }
      }
    }
  }

  async abrirModalPesosComerciales() {
    try {
      const modalRef = this.modalService.open(ModalPesosComercialesComponent, {
        size: 'md',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false//no cerrar el modal con ESC
      })
      modalRef.componentInstance.id_usuario = this.seleccionadoTabla1.id_usuario;
      const result = await modalRef.result
      if (result) {

      }
    } catch (e) {
      console.log(e);
    }
  }

  async listarPesosPorUsuario() {
    const obj = {
      id_usuario: this.id_usuario,
      estado: 1
    }
    const response = await this.metradoService.listarPesosComerciales(obj)
    if (response.length) {
      this.listaPesos = response
    } else {
      this.listaPesos = []
    }
  }

  async cambioPesoComercial(event, i) {
    const encontrado = this.listaPesos.find(ele => ele.medida == event)
    if (encontrado) {
      if (this.tablaAceros[i].id_metrado !== null && this.tablaAceros[i].tieneSubmetrado == 0)
        this.tablaAceros[i].diametro = event
      this.tablaAceros[i].pesodiametro = encontrado.peso

    }
    this.tablaAceros[i].editardiametro = 0
    this.quitarfoco(event)
    await this.calculartotales()
  }

  async calculartotales() {
    this.sumaSubTotales = 0
    let sumaGrupo = 0
    for (let indice = this.tablaAceros.length - 1; indice >= 0; indice--) {
      const row = this.tablaAceros[indice]
      if (row.id_metrado !== null) {
        let total1 = 0
        let total2 = 0
        let subtotal = 0

        if (row.cantidad !== null && row.elementos !== null) {
          total1 = (row.cantidad ? Number(row.cantidad) : 0) * (row.elementos ? Number(row.elementos) : 0)
        }

        if (total1 !== 0 && row.longitud !== null) {
          total2 = total1 * (row.longitud ? Number(row.longitud) : 0)
        }
        if (total2 !== 0 && row.pesodiametro !== null) {
          subtotal = total2 * (row.pesodiametro ? Number(row.pesodiametro) : 0)
        }
        this.tablaAceros[indice].total1 = total1
        this.tablaAceros[indice].total2 = total2

        sumaGrupo = sumaGrupo + subtotal
        // if (!row.esMetrado) {
        //   this.tablaAceros[indice].subtotal = subtotal
        // } else {
        //   this.tablaAceros[indice].subtotal = sumaGrupo
        //   sumaGrupo = 0
        // }

        this.sumaSubTotales = this.sumaSubTotales + subtotal
      }
    }
    await this.actualizarParametrosPrincipal()
  }

  async ngOnDestroy() {
    await this.actualizarParametrosPrincipal()
  }

  actualizarParametrosPrincipal() {
    const obj = {
      tabla: this.tablaAceros,
      filaSel: this.seleccionadoTabla1,
      total: this.sumaSubTotales
    }
    this.tablaAcero.emit(obj)
    this.totalAceros.emit(this.sumaSubTotales)
  }

  ngAfterViewChecked() {
    if (this.tipoEdicion == 'Longitud' && !this.iniciado) {
      const a = document.getElementById('s' + this.filaSel)
      if (a) {
        this.iniciado = true
        const b = a.getElementsByTagName('input')
        b[0].select()
      }
    }
  }

  blurSelect(e) {
    if (e) {
      const a = document.getElementById('s' + this.filaSel)
      if (a) {
        this.iniciado = false
        this.tipoEdicion = null
        this.tablaAceros[this.filaSel].editardiametro = 0
      }
    }
  }

  async evaluarTeclaLeft(event) {
    if (event.keyCode.toString() == "37") {
      this.blurSelect(event)
      const sgte = this.sgteColumna('Diametro', false)
      this.tablaAceros[this.filaSel]['editar' + 'Diametro'] = 0;
      this.tablaAceros[this.filaSel]['editar' + sgte] = 1;
    }
  }
}
