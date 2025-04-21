
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FechasService } from 'src/app/servicios/fechas.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import * as moment from 'moment';

@Component({
  selector: 'app-header-calendario',
  templateUrl: './header-calendario.component.html',
  styleUrls: ['./header-calendario.component.scss']
})
export class HeaderCalendarioComponent implements OnInit {
  @Input() data = []
  @Input() idProyecto = null
  @Input() fechaFinGrafico = null
  @Input() fechaIniGrafico = null
  @Input() view_mode = null
  @Input() color_noLabo = ''
  @Input() color_feriado = ''
  @Input() color_actual = ''
  @Output() listaMeses = new EventEmitter<any>()
  @Output() tabla = new EventEmitter<any>()
  fechaActual: string;
  ancho = 18
  @Output() cargaCompletada = new EventEmitter<boolean>()
  @Input() set actualizarHeader(value: any) {    
    if (value && value.fechaIniGrafico && value.fechaFinalGrafico) {
      // this.fechaIniGrafico = value.fechaIniGrafico
      // this.fechaFinGrafico = value.fechaFinGrafico
      // this.recuperarCalendario(value.fechaIniGrafico, value.fechaFinGrafico)
      this.tipoCalendario (this.fechaIniGrafico, this.fechaFinGrafico)
    }
  }
  meses = []
  constructor(private principalService: PrincipalService, private fechasService: FechasService) { }

  async ngOnInit() {
    this.tipoCalendario (this.fechaIniGrafico, this.fechaFinGrafico)
  }

  async tipoCalendario (fechaIniGrafico, fechaFinGrafico) {
    if (this.view_mode == 'Day') {
      this.ancho = 18
      await this.recuperarCalendario(fechaIniGrafico, fechaFinGrafico)
    } else if (this.view_mode == 'Week') {
      this.ancho = 35
      await this.recuperarCalendarioSemanal(fechaIniGrafico, fechaFinGrafico)
    } else if (this.view_mode == 'Month') {
      this.ancho = 120
      await this.recuperarCalendarioMensual(fechaIniGrafico, fechaFinGrafico)
    } else if (this.view_mode == 'Year') {
      this.ancho = 360
      await this.recuperarCalendarioAnual(fechaIniGrafico, fechaFinGrafico)
    }
  }
  async fechaActualServidor() {
    const response = await this.fechasService.fechaServidor()
    const fechaservidor = new Date(response.mensaje)
    this.fechaActual = moment(fechaservidor).format('YYYY-MM-DD')
  }

  async recuperarCalendario(fechaIniGrafico, fechaFinGrafico) {
    if (fechaIniGrafico && fechaFinGrafico) {
      await this.fechaActualServidor()
      const objeto = {
        id_proyecto: this.idProyecto,
        diasanterior: 7,
        diasposterior: 14, //agregar mas 1 dia por la libreria ,
        fechaini: fechaIniGrafico,
        fechafin: fechaFinGrafico
      }
      const response = await this.principalService.calendarioProgra2Fechas(objeto)
      if (!response) {
        this.data = []
        return
      }      
      response.map(ele => {
        ele.class = ''
        const fecha = ele.anio + '-' + ((ele.mes.length == 1) ? 0 + ele.mes : ele.mes) + '-' + ele.dia
        if (fecha == this.fechaActual) {
          ele.diaActual = true
          if (this.view_mode == 'Day') {
            ele.class = this.color_actual
          }
        } else {
          ele.diaActual = false
          if (ele.feriado && this.view_mode == 'Day') {
            ele.class = this.color_feriado
          }
          if (ele.nolabor && this.view_mode == 'Day') {
            ele.class = this.color_noLabo
          }
        }
        ele.width = 18
      })
      this.data = response
      this.meses = await this.mesesCant(response)
      this.listaMeses.emit(this.meses)
      this.tabla.emit(this.meses)
      // this.cargaCompletada.emit(true)
    } else {
      this.data = []
      this.meses = []
      this.listaMeses.emit(this.meses)
      this.tabla.emit(this.meses)
    }
  }

  async recuperarCalendarioSemanal(fechaIniGrafico, fechaFinGrafico) {
    let fechas = []
    const ff = moment(fechaFinGrafico).add(18, 'days')
    let cur_date = moment(fechaIniGrafico).subtract(7, 'days')
    const obj = {
      nom_mes: moment(cur_date).format("MMMM"),
      anio: moment(cur_date).format("YYYY"),
      dia: moment(cur_date).format("DD"),
      nom_dia: moment(cur_date).format("ddd"),
      width: 35,
      class: ''
    }
    fechas.push(obj)
    while (cur_date < ff) {
      cur_date = moment(cur_date).add(7, 'days')
      const obj = {
        nom_mes: moment(cur_date).format("MMMM"),
        anio: moment(cur_date).format("YYYY"),
        dia: moment(cur_date).format("DD"),
        nom_dia: moment(cur_date).format("ddd"),
        width: 35,
        class: ''
      }
      fechas.push(obj)
    }
    this.data = fechas
    this.meses = await this.mesesCant(fechas)
    this.tabla.emit(this.meses)
    // this.listaMeses.emit(this.meses)
  }

  async mesesCant(response) {
    let nuevoArray = []
    let mesAnio
    let cantidad = 0
    response.map((ele, index) => {
      if (index == 0) {
        mesAnio = ele.nom_mes + ` - ` + ele.anio
        cantidad++
        return
      }
      const fecha = ele.nom_mes + ` - ` + ele.anio
      if (mesAnio == fecha) {
        cantidad++
      } else {
        const objeto = {
          nombre: mesAnio,
          cantidad: cantidad,
          width: cantidad * ele.width
        }
        nuevoArray.push(objeto)
        mesAnio = fecha
        cantidad = 1
      }
      if (index == response.length - 1) {
        if (!nuevoArray.length) {
          const objeto = {
            nombre: mesAnio,
            cantidad: cantidad,
            width: cantidad * ele.width
          }
          nuevoArray.push(objeto)
        }
        if (nuevoArray[nuevoArray.length - 1].nombre !== mesAnio) {
          const objeto = {
            nombre: mesAnio,
            cantidad: cantidad,
            width: cantidad * ele.width
          }
          nuevoArray.push(objeto)
        }
      }
    })
    return nuevoArray
  }

  async recuperarCalendarioMensual(fechaIniGrafico, fechaFinGrafico) {
    let fechas = []
    const ff = moment(fechaFinGrafico).add(1, 'years')
    const anio = moment(fechaIniGrafico).format('YYYY')
    const fechaInicio = anio + '-01-01'
    let cur_date = moment(fechaInicio)
    const obj = {
      nom_mes: moment(cur_date).format("MMMM"),
      num_mes: moment(cur_date).format("MM"),
      anio: moment(cur_date).format("YYYY"),
      dia: moment(cur_date).format("MMMM"),
      nom_dia: moment(cur_date).format("ddd"),
      width: null,
      class: ''
    }
    const nroDias = new Date(Number(obj.anio), Number(obj.num_mes), 0).getDate()
    obj.width = (nroDias * 120) / 30
    fechas.push(obj)
    while (cur_date < ff) {
      cur_date = moment(cur_date).add(1, 'months')
      const obj = {
        nom_mes: moment(cur_date).format("MMMM"),
        num_mes: moment(cur_date).format("MM"),
        anio: moment(cur_date).format("YYYY"),
        dia: moment(cur_date).format("MMMM"),
        nom_dia: moment(cur_date).format("ddd"),
        width: null,
        class: ''
      }
      const nroDias = new Date(Number(obj.anio), Number(obj.num_mes), 0).getDate()
      obj.width = (nroDias * 120) / 30
      fechas.push(obj)
    }
    this.data = fechas
    let anios = []
    let cantidad = 0
    let year = null
    let acumulado = 0
    for (const iterator of fechas) {
      if (year == null) {
        year = iterator.anio

      } else {
        if (year && year !== iterator.anio) {
          const obj = {
            nombre: year,
            cantidad: cantidad,
            width: acumulado
          }
          anios.push(obj)
          year = null
          cantidad = 0
          acumulado = 0
        }
      }
      cantidad++
      acumulado = acumulado + iterator.width
    }

    if (year !== null) {
      const obj = {
        nombre: year,
        cantidad: cantidad,
        width: acumulado
      }
      anios.push(obj)
    }
    this.meses = anios
    // this.listaMeses.emit(this.data)
    this.tabla.emit(this.meses)
  }

  async recuperarCalendarioAnual(fechaIniGrafico, fechaFinGrafico) {
    const ff = moment(fechaFinGrafico).add(1, 'years')
    const fechaInicio = moment(fechaIniGrafico).subtract(1, 'years')
    let cur_date = moment(fechaInicio)
    let fechas = []
    const obj = {
      nom_mes: moment(cur_date).format("MMMM"),
      anio: moment(cur_date).format("YYYY"),
      dia: moment(cur_date).format("YYYY"),
      nom_dia: moment(cur_date).format("ddd"),
      width: 360,
      class: ''
    }
    fechas.push(obj)
    while (cur_date < ff) {
      cur_date = moment(cur_date).add(1, 'years')
      const obj = {
        nom_mes: moment(cur_date).format("MMMM"),
        anio: moment(cur_date).format("YYYY"),
        dia: moment(cur_date).format("YYYY"),
        nom_dia: moment(cur_date).format("ddd"),
        width: 360,
        class: ''
      }
      fechas.push(obj)
    }
    this.data = fechas
    this.meses = fechas
    this.tabla.emit(this.meses)
  }
}
