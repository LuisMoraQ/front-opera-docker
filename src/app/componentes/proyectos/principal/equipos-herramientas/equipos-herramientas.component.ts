import { plantilla } from './../hoja-metrados/modal-metrado-excel/plantilla';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { EquiposServiciosService } from 'src/app/servicios/equipos-servicios.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
export interface servicio {
  item: string,
  descripcion: string,
  placa: string,
  fecha_solicitud: string,
  unidad: string | null,
  cantidad: string,
  precio_unitario: string,
  parcial: number,
  estado: number,
  index_grupo: number,
  id_grupo_servicio: number,
  id_grupo: number,
  id_equipo: number,
  id_registro: number | null,
  id_fila: number | null,
  ind_rep: number | null,
  index_array: number,
  id_proyecto: number,
  tipo_registro: string,
  tipo: string
}
@Component({
  selector: 'app-equipos-herramientas',
  templateUrl: './equipos-herramientas.component.html',
  styleUrls: ['./equipos-herramientas.component.scss']
})
export class EquiposHerramientasComponent implements OnInit {
  mostrar_carga_todo = false
  scrollbut = false;
  subvista = 1
  id_proyecto = null
  buscando6 = false
  tablaRegActividades: any[] = [];
  reqCompletos = []
  tablaRequerimientos = []
  filSelRegAct = null
  filSelReq = null
  tablaServicios = []
  tablaServiciosCompleto = []
  filSelServ = null
  id_registro = null
  calendario = []
  mesSeleccionado = null
  calendarioFiltrado = null
  grupoSeleccionado = ''
  tablaPlanilla = []
  celdaSel = [null, null];
  registroForm!: FormGroup;
  fechaActual = new Date();

  @Input() set tabproyecto(value: any) {
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    // this.tipoProy = datosproy.get('id_clasificacion').value;
    // this.colores = value.get('aspectab').value;
    // this.decima = value.get('decimal').value;
    // this.solover = value.get('solover').value;
    // const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    // this.simbolo = datosrec.value.simbolo
  }
  @ViewChild("modalServicio") modalServicio: ModalBasicComponent;
  @ViewChild("modalEquipo") modalEquipo: ModalBasicComponent;

  formServicio = new UntypedFormGroup({
    id_servicio: new UntypedFormControl('', []),
    descripcion: new UntypedFormControl('', [Validators.required])
  })
  get id_servicio(): UntypedFormControl { return this.formServicio.get('id_servicio') as UntypedFormControl }
  get descripcion_servicio(): UntypedFormControl { return this.formServicio.get('descripcion') as UntypedFormControl }

  formEquipo = new UntypedFormGroup({
    id_servicio: new UntypedFormControl('', []),
    descripcion: new UntypedFormControl('', [Validators.required]),
    placa: new UntypedFormControl('', [Validators.required]),
    fecha_solicitada: new UntypedFormControl('', [Validators.required]),
    cantidad: new UntypedFormControl('', [Validators.required]),
    precio_unitario: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('', []),
    fila_requerimiento: new UntypedFormControl('', [Validators.required]),
    id_registro: new UntypedFormControl('', []),
    idgrupo: new UntypedFormControl('', []),
    idfila: new UntypedFormControl('', []),
    indrep: new UntypedFormControl('', []),
  })
  get id_servicio_equipo(): UntypedFormControl { return this.formEquipo.get('id_servicio') as UntypedFormControl }
  get descripcion_equipo(): UntypedFormControl { return this.formEquipo.get('descripcion') as UntypedFormControl }
  get fecha_solicitada_equipo(): UntypedFormControl { return this.formEquipo.get('fecha_solicitada') as UntypedFormControl }
  get cantidad_equipo(): UntypedFormControl { return this.formEquipo.get('cantidad') as UntypedFormControl }
  get precio_unitario_equipo(): UntypedFormControl { return this.formEquipo.get('precio_unitario') as UntypedFormControl }
  get placa_equipo(): UntypedFormControl { return this.formEquipo.get('placa') as UntypedFormControl }
  get estado_equipo(): UntypedFormControl { return this.formEquipo.get('estado') as UntypedFormControl }
  get id_registro_equipo(): UntypedFormControl { return this.formEquipo.get('id_registro') as UntypedFormControl }
  get idgrupo_equipo(): UntypedFormControl { return this.formEquipo.get('idgrupo') as UntypedFormControl }
  get idfila_equipo(): UntypedFormControl { return this.formEquipo.get('idfila') as UntypedFormControl }
  get indrep_equipo(): UntypedFormControl { return this.formEquipo.get('indrep') as UntypedFormControl }
  get fila_requerimiento(): UntypedFormControl { return this.formEquipo.get('fila_requerimiento') as UntypedFormControl }


  formDesagregado = new UntypedFormGroup({
    ordenServicio: new UntypedFormControl('', []),
    proveedor: new UntypedFormControl('', []),
    telefono: new UntypedFormControl('', []),
    correo: new UntypedFormControl('', []),
    coste_unitario: new UntypedFormControl('', []),
    unidad: new UntypedFormControl('', []),
    tiempo_programado: new UntypedFormControl('', []),
    tiempo_utilizado: new UntypedFormControl('', []),
    saldo_utilizar: new UntypedFormControl('', []),
    tiempos: new FormArray([]),
    horas_dia: new UntypedFormControl('', []),
    coste_dia: new UntypedFormControl('', []),
    observaciones: new UntypedFormControl('', [])
  })
  get ordenServicio(): UntypedFormControl { return this.formDesagregado.get('ordenServicio') as UntypedFormControl }
  get proveedor(): UntypedFormControl { return this.formDesagregado.get('proveedor') as UntypedFormControl }
  get telefono(): UntypedFormControl { return this.formDesagregado.get('telefono') as UntypedFormControl }
  get correo(): UntypedFormControl { return this.formDesagregado.get('correo') as UntypedFormControl }
  get coste_unitario(): UntypedFormControl { return this.formDesagregado.get('coste_unitario') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formDesagregado.get('unidad') as UntypedFormControl }
  get tiempo_programado(): UntypedFormControl { return this.formDesagregado.get('tiempo_programado') as UntypedFormControl }
  get tiempo_utilizado(): UntypedFormControl { return this.formDesagregado.get('tiempo_utilizado') as UntypedFormControl }
  get saldo_utilizar(): UntypedFormControl { return this.formDesagregado.get('saldo_utilizar') as UntypedFormControl }
  get horas_dia(): UntypedFormControl { return this.formDesagregado.get('horas_dia') as UntypedFormControl }
  get coste_dia(): UntypedFormControl { return this.formDesagregado.get('coste_dia') as UntypedFormControl }
  get observaciones(): UntypedFormControl { return this.formDesagregado.get('observaciones') as UntypedFormControl }
  get tiempos(): FormArray {
    return this.formDesagregado.get('tiempos') as FormArray;
  }
  get tiempoTotal(): string {
    let totalMinutos = 0;
    this.tiempos.controls.forEach(control => {
      const tiempo = control.get('tiempo')?.value;
      if (tiempo) {
        const [horas, minutos] = tiempo.split(':').map(Number);
        totalMinutos += (horas * 60) + minutos;
      }
    });

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }
  constructor(private fb: FormBuilder, private _logisticaService: LogisticaService, private toaster: ToastrService, public formService: FormsService, private equiposServiciosService: EquiposServiciosService) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true;
      this.tablaRegActividades = []
      this.reqCompletos = []
      this.tablaRequerimientos = []
      this.tablaServicios = []
      this.tablaServiciosCompleto = []
      let res = await this._logisticaService.ListarAdquisicionesProy({ id_proyecto: this.id_proyecto });
      this.buscando6 = false;
      console.log('res', res)
      if (res?.length > 0) {
        this.id_registro = res[0]?.id_registro
        console.log('res[0]', res[0])
        let res2 = await this._logisticaService.listarRelinsAdqui({ id_proyecto: this.id_proyecto, id_registro: res[0]?.id_registro, conrelins: '0' });
        console.log('res2', res2)
        console.log('trt', res2)
        this.tablaRegActividades = res2[0].filter(ele => ele.idfila == 0)
        console.log('this.tablaRegActividades', this.tablaRegActividades)
        this.grupoSeleccionado = ''
        this.reqCompletos = res2[1]
        await this.listarEquiposServicios()
        await this.calcularTotales()

      }
      else {
        // this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      SwalService.error()
    }
  }

  async listarEquiposServicios() {
    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: this.id_registro
    }
    console.log('obj', obj)
    const response = await this.equiposServiciosService.listarEquipoServicio(obj)
    console.log('response', response)
    if (response.length) {
      response.forEach(element => {
        if (element.index_grupo !== 0) {
          element.parcial = element.cantidad * element.precio_unitario

        }
      });
      this.tablaServiciosCompleto = response
      console.log('this.tablaServiciosCompleto', this.tablaServiciosCompleto)
    }
  }

  estructurarTablas(tablas) {
    let nuevaTabla = []

    return nuevaTabla
  }

  async selTablaRegAct(row, i) {
    if (i !== this.filSelRegAct) {
      this.mostrar_carga_todo = true
      this.filSelRegAct = i
      this.filSelServ = null
      this.filSelReq = null
      this.tablaRequerimientos = this.reqCompletos.filter(ele => row.idgrupo == ele.idgrupo)
      this.tablaServicios = this.tablaServiciosCompleto.filter(ele => Number(ele.id_grupo) == Number(row.idgrupo))
      await this.calcularTotales()
      this.mostrar_carga_todo = false
    }

  }

  selTablaReq(row, i) {
    this.filSelReq = i
  }

  selTablaServ(row, i) {
    this.filSelServ = i
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async cambioVista(ind: any) {
    this.subvista = ind;
    if (this.subvista == 2) {
      this.mostrar_carga_todo = true
      const resp = await this.equiposServiciosService.obtenerCalendarioProyecto({ id_proyecto: this.id_proyecto, meses_adicionales: 5 })
      if (resp.calendario_por_meses?.length) {
        this.calendario = resp.calendario_por_meses
        this.mesSeleccionado = 0
        this.calendarioFiltrado = this.calendario[this.mesSeleccionado]
        this.celdaSel = [null, null]
        this.formDesagregado.disable()
        this.formDesagregado.get('tiempos')?.disable();
        this.grupoSeleccionado = ''
        await this.filtrarPlanillaEquiposServicios()
        await this.listarDesagregadosEquipos()

      }
      this.mostrar_carga_todo = false
    }
  }

  async listarDesagregadosEquipos() {
    try {
      const resp = await this.equiposServiciosService.listarDesagregadoEquipo({ id_proyecto: this.id_proyecto })
      console.log('resp', resp)
    } catch (error) {
      console.log(error)
      SwalService.error()
    }

  }

  filtrarPlanillaEquiposServicios() {

    this.mostrar_carga_todo = true
    const desagregado = []
    setTimeout(() => {
      this.tablaPlanilla = []
      let nuevaTabla = []
      let tablaServicios = []
      if (this.grupoSeleccionado !== '') {
        const row = this.tablaRegActividades[this.grupoSeleccionado]
        tablaServicios = this.tablaServiciosCompleto.filter(ele => Number(ele.id_grupo) == Number(row.idgrupo))
        this.tablaPlanilla = tablaServicios.filter(ele => ele.index_grupo !== 0)
      } else {

        for (const element of this.tablaRegActividades) {
          let j = 0
          const filtrados = this.tablaServiciosCompleto.filter(ele => Number(ele.id_grupo) == Number(element.idgrupo) && ele.index_grupo !== 0)
          const grupo = {
            "id_equipo": null,
            "id_proyecto": null,
            "id_registro": null,
            "id_grupo": null,
            "id_fila": null,
            "ind_rep": null,
            "index_array": null,
            "index_grupo": null,
            "descripcion": element.descripcion,
            "placa": null,
            "fecha_solicitud": null,
            "cantidad": null,
            "precio_unitario": null,
            "estado": null,
            "unidad": null,
            "tipo_registro": null,
            "tipo": null,
            "fecha_creacion": null,
            planilla: [],
            cabecera: true,
            item: j
          }
          nuevaTabla.push(grupo)
          for (const element of filtrados) {
            j++
            element.cabecera = false

            const planilla = this.calendarioFiltrado?.dias.map(ele => {
              const encontrado = desagregado.find(reg => reg.fecha == ele.fecha && reg.id_equipo == element.id_equipo)
              return encontrado ? encontrado : null
            })
            element.planilla = planilla
            element.item = j
          }
          nuevaTabla = nuevaTabla.concat(filtrados)
        }
        this.tablaPlanilla = nuevaTabla
      }
      console.log('tablaPlanilla', this.tablaPlanilla)
      this.mostrar_carga_todo = false
    }, 50);

  }

  cambioMes() {
    this.calendarioFiltrado = this.calendario[this.mesSeleccionado]
  }

  async agregarServicio() {
    try {
      if (this.formServicio.invalid) {
        this.formServicio.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      this.mostrar_carga_todo = true
      const gruposExistententes = this.tablaServicios.filter(ele => ele.index_grupo == 0)
      const filaRegAct = this.tablaRegActividades[this.filSelRegAct]

      const servicio: servicio = {
        cantidad: null,
        descripcion: this.descripcion_servicio.value,
        id_grupo: filaRegAct.idgrupo,
        fecha_solicitud: null,
        id_grupo_servicio: gruposExistententes.length + 1,
        id_registro: filaRegAct.id_registro,
        index_grupo: 0,
        estado: null,
        item: null,
        parcial: 0,
        placa: null,
        precio_unitario: null,
        unidad: null,
        id_equipo: null,
        id_fila: null,
        ind_rep: null,
        index_array: this.tablaServicios.length + 1,
        id_proyecto: this.id_proyecto,
        tipo: null,
        tipo_registro: null
      }
      const response = await this.equiposServiciosService.guardarEquipoServicio(servicio)
      if (response[0]?.id_equipo) {
        servicio.id_equipo = response[0]?.id_equipo
        this.tablaServicios.push(servicio)
        this.modalServicio.hide()
      } else {
        SwalService.error()
      }

      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      SwalService.error()
      console.log(error)
    }
  }

  abrirModalServicio() {
    this.formServicio.reset()
    this.modalServicio.show()
  }

  cerrarModalServicio() {
    this.modalServicio.hide()
  }

  cerrarModalEquipo() {
    this.modalEquipo.hide()
  }

  abrirModalEquipo(row?: servicio) {
    this.formEquipo.reset()
    if (row) {
      const fechaCulminacion = row.fecha_solicitud
        ? row.fecha_solicitud.split('T')[0]
        : null;

      const filaReq = this.tablaRequerimientos.find((ele: servicio) => Number(ele.id_registro) == Number(row.id_registro) && Number(ele.id_grupo) == Number(row.id_grupo) && Number(ele.id_fila) == Number(row.id_fila) && Number(ele.ind_rep == row.ind_rep))
      this.formEquipo.patchValue({
        id_equipo: row.id_equipo,
        descripcion: row.descripcion,
        placa: row.placa,
        fecha_solicitada: moment(fechaCulminacion).format('DD-MM-YYYY'),
        cantidad: row.cantidad,
        precio_unitario: row.precio_unitario,
        estado: row.estado,
        fila_requerimiento: filaReq,
      })
    }
    this.modalEquipo.show()
  }

  async agregarEquipo() {
    try {
      if (this.formEquipo.invalid) {
        this.formEquipo.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      this.mostrar_carga_todo = true
      const gruposExistententes = this.tablaServicios.filter(ele => ele.index_grupo == 0)
      const filaServicio = this.tablaServicios[this.filSelServ]
      let index = null
      let j = 1
      if (this.filSelServ < this.tablaServicios.length + 1) {
        for (let i = this.filSelServ + 1; i < this.tablaServicios.length; i++) {
          const element = this.tablaServicios[i];
          if (element.index_grupo == 0) {
            index = i
          } else {
            j++
          }
        }
      }
      const equipo: servicio = {
        cantidad: this.cantidad_equipo.value,
        descripcion: this.descripcion_equipo.value,
        id_grupo: this.idgrupo_equipo.value,
        fecha_solicitud: this.fecha_solicitada_equipo.value,
        id_grupo_servicio: gruposExistententes.length + 1,
        id_registro: this.id_registro_equipo.value,
        id_fila: this.idfila_equipo.value,
        ind_rep: this.indrep_equipo.value,
        index_grupo: j,
        estado: 0,
        item: null,
        parcial: this.cantidad_equipo.value * this.precio_unitario_equipo.value,
        placa: this.placa_equipo.value,
        precio_unitario: this.precio_unitario_equipo.value,
        unidad: filaServicio.unidad,
        id_equipo: null,
        index_array: index == null ? this.tablaServicios.length : index,
        id_proyecto: this.id_proyecto,
        tipo: null,
        tipo_registro: null
      }
      const response = await this.equiposServiciosService.guardarEquipoServicio(equipo)
      if (response[0]?.id_equipo) {
        equipo.id_equipo = response[0]?.id_equipo
        if (index !== null) {
          this.tablaServicios.splice(index, 0, equipo)
        } else {
          this.tablaServicios.push(equipo)
        }
        await this.calcularTotales()
        this.modalEquipo.hide()
      } else {
        SwalService.error()
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      SwalService.error()
      console.log(error)
    }
  }

  eliminarFila(row, i) {
    console.log('row', row)
  }

  cambioFilaRequerimiento() {
    const valor = this.tablaRequerimientos[this.fila_requerimiento.value]
    console.log('valor', valor)
    this.id_registro_equipo.setValue(valor.id_registro)
    this.idgrupo_equipo.setValue(valor.idgrupo)
    this.idfila_equipo.setValue(valor.idfila)
    this.indrep_equipo.setValue(valor.indrep)
  }

  calcularTotales() {
    console.log('this.tablaServicios', this.tablaServicios)
    for (const element of this.tablaRequerimientos) {
      console.log('element', element)
      const filtrados = this.tablaServicios.filter((ele: servicio) => Number(ele.id_registro) == Number(element.id_registro) && Number(ele.ind_rep) == Number(element.indrep) && Number(ele.id_grupo) == Number(element.idgrupo) && Number(ele.id_fila == element.idfila))
      console.log('filtrados', filtrados)
      const sumaTotalCantidad = filtrados.reduce((acc, item) => acc + Number(item.cantidad), 0)
      const sumaTotalPrecio = filtrados.reduce((acc, item) => acc + Number(item.precio_unitario), 0)
      let precio_promedio = 0
      if (filtrados.length) {
        const parcialacumulado = filtrados.reduce((acc, item) => acc + Number(item.parcial), 0)
        console.log('parcialacumulado', parcialacumulado)
        console.log('sumaTotalCantidad', sumaTotalCantidad)
        precio_promedio = parcialacumulado / sumaTotalCantidad
      }
      element.cantidad_usada = sumaTotalCantidad
      element.precio_usada = precio_promedio
      element.parcial_usada = sumaTotalCantidad * precio_promedio
      element.saldo = Number(element.parcial) - Number(element.parcial_usada)
    }
    let acumuladoGrupo = 0
    let acumuladoTotal = 0
    for (let i = this.tablaServicios.length - 1; i >= 0; i--) {
      const element = this.tablaServicios[i];
      if (element.index_grupo == 0) {
        element.parcial = acumuladoGrupo
        acumuladoTotal += acumuladoGrupo
        acumuladoGrupo = 0
      } else {
        acumuladoGrupo += element.parcial
      }
    }
  }

  seleccionCelda(i, j) {

    if (this.celdaSel[0] !== i || this.celdaSel[1] !== j) {
      this.celdaSel = [i, j]
      this.formDesagregado.reset()
      while (this.tiempos.value.length) {
        this.tiempos.removeAt(0);
      }
      this.observaciones.enable()
      const data = this.tablaPlanilla[i].planilla[j]

    }
  }

  // Agregar nuevo tiempo
  agregarTiempo() {
    const tiempoForm = new UntypedFormGroup({
      inicio: new UntypedFormControl('', []),
      fin: new UntypedFormControl('', []),
      tiempo: new UntypedFormControl({ value: 0, disabled: true }, []) // 👈 Valor inicial 0 minutos
    });

    this.tiempos.push(tiempoForm);
    this.actualizarTiempoUtilizado();
  }

  // Eliminar tiempo
  eliminarTiempo(index: number) {
    this.tiempos.removeAt(index);
    this.actualizarTiempoUtilizado();
  }

  // Calcular tiempo en minutos
  calcularTiempo(index: number) {
    const tiempoControl = this.tiempos.at(index) as UntypedFormGroup;

    const inicio = tiempoControl.get('inicio')?.value;
    const fin = tiempoControl.get('fin')?.value;

    // Limpiar error previo
    tiempoControl.setErrors(null);

    // Si falta alguno de los dos campos, tiempo = 0 minutos
    if (!inicio || !fin) {
      tiempoControl.get('tiempo')?.setValue(0);
      this.actualizarTiempoUtilizado();
      return;
    }

    // Validar formato de hora (HH:MM)
    const tiempoRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!tiempoRegex.test(inicio) || !tiempoRegex.test(fin)) {
      tiempoControl.get('tiempo')?.setValue(0);
      this.actualizarTiempoUtilizado();
      return;
    }

    const [horaInicio, minInicio] = inicio.split(':').map(Number);
    const [horaFin, minFin] = fin.split(':').map(Number);

    const minutosInicio = horaInicio * 60 + minInicio;
    let minutosFin = horaFin * 60 + minFin;

    // Validar que inicio no sea mayor que fin
    if (minutosInicio > minutosFin) {
      tiempoControl.setErrors({ inicioMayor: true });
      tiempoControl.get('tiempo')?.setValue(0);
      this.actualizarTiempoUtilizado();
      return;
    }

    // Calcular tiempo en minutos
    const diferenciaMinutos = minutosFin - minutosInicio;

    // Guardar directamente los minutos
    tiempoControl.get('tiempo')?.setValue(diferenciaMinutos);

    this.actualizarTiempoUtilizado();
  }

  // Actualizar tiempo utilizado (suma de minutos)
  actualizarTiempoUtilizado() {
    let totalMinutos = 0;

    this.tiempos.controls.forEach(control => {
      const tiempoControl = control as UntypedFormGroup;
      const minutos = tiempoControl.get('tiempo')?.value || 0;
      totalMinutos += minutos;
    });

    // Guardar el total en minutos
    this.tiempo_utilizado.setValue(totalMinutos);
    this.calcularSaldo();
  }

  // Calcular saldo (en minutos)
  calcularSaldo() {
    // Obtener tiempo programado (convertir a minutos)
    let minutosProg = 0;
    const progValue = this.tiempo_programado.value;

    if (progValue) {
      if (typeof progValue === 'string' && progValue.includes(':')) {
        // Si viene en formato HH:MM
        const [horas, minutos] = progValue.split(':').map(Number);
        minutosProg = (horas * 60) + (minutos || 0);
      } else {
        // Si es número (horas) o string numérico
        minutosProg = Math.round(parseFloat(progValue.toString()) * 60);
      }
    }

    // Obtener tiempo utilizado (ya está en minutos)
    const minutosUtil = this.tiempo_utilizado.value || 0;

    const saldoMinutos = minutosProg - minutosUtil;

    // Guardar saldo en minutos
    this.saldo_utilizar.setValue(saldoMinutos);
  }

  guardarCambiosDesagregado() {
    try {
      console.log('this.form', this.formDesagregado.value)
      console.log('this.formDesagregado', this.formDesagregado.getRawValue())
      const data = this.formDesagregado.getRawValue()
      const horas_detalle_Array = data.tiempos.map(ele => { return ele.inicio + '|' + ele.fin })
      const horas_detalle = horas_detalle_Array.join('/')
      const row = this.tablaPlanilla[this.celdaSel[0]]
      const obj = {
        id_proyecto: this.id_proyecto,
        id_equipo: data.ordenServicio,
        fecha: '',
        id_proveedor: row.id_proveedor,
        horas_dia: data.horas_dia,
        costo_dia: data.coste_dia,
        horas_detalle: horas_detalle,
        observaciones: data.observaciones,
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
    }
  }
}
