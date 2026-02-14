import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
  filSelServ = null
  id_registro = null
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

  constructor(private _logisticaService: LogisticaService, private toaster: ToastrService, public formService: FormsService, private equiposServiciosService: EquiposServiciosService) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true;
      this.tablaRegActividades = []
      this.reqCompletos = []
      this.tablaRequerimientos = []
      this.tablaServicios = []
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
    const response = await this.equiposServiciosService.listarEquipoServicio(obj)

    if (response.length) {
      response.forEach(element => {
        if (element.index_grupo !== 0) {
          element.parcial = element.cantidad * element.precio_unitario

        }
      });
      this.tablaServicios = response
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
      this.tablaRequerimientos = this.reqCompletos.filter(ele => row.idgrupo == ele.idgrupo)
      console.log('tablaRequerimientos', this.tablaRequerimientos)
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

  cambioVista(ind: any) {
    this.subvista = ind;
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
      console.log('gruposExistententes', gruposExistententes)
      console.log('filaRegAct', filaRegAct)
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
      console.log('servicio', servicio)
      const response = await this.equiposServiciosService.guardarEquipoServicio(servicio)
      console.log('response', response)
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
      console.log('arbru', row)
      console.log('his.tablaRequerimientos', this.tablaRequerimientos)
      const filaReq = this.tablaRequerimientos.find((ele: servicio) => Number(ele.id_registro) == Number(row.id_registro) && Number(ele.id_grupo) == Number(row.id_grupo) && Number(ele.id_fila) == Number(row.id_fila) && Number(ele.ind_rep == row.ind_rep))
      console.log('filaReq', filaReq)
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
      console.log('this.formEquipo', this.formEquipo.value)
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
      console.log('filaServicio', filaServicio)
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
        unidad: null,
        id_equipo: null,
        index_array: index == null ? this.tablaServicios.length : index,
        id_proyecto: this.id_proyecto,
        tipo: null,
        tipo_registro: null
      }
      console.log('equipo', equipo)
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
      console.log('tablaServicios', this.tablaServicios)
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
}
