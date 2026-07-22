import { plantilla } from './../hoja-metrados/modal-metrado-excel/plantilla';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
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
  id_grupo: number,
  id_equipo: number,
  id_registro: number | null,
  id_fila: number | null,
  ind_rep: number | null,
  index_elemento: number,
  id_proyecto: number,
  tipo_registro: string,
  tipo: string,
  nroprov: number,
  tiempo_registrado: number,
  valorGlobal: null,
  desagregadosCompleto: Array<any>,
  total_registrado: number
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
  tablaEquiposAgregar = []
  unidades = [
    'HM',
    'DIA'
  ]
  sumaPorDiaPlanilla = []
  totalMes = 0
  detalleMensual = []
  resumenPorAnio: any[] = [];
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
  @ViewChild("modalEstado") modalEstado: ModalBasicComponent;

  formServicio = new UntypedFormGroup({
    id_servicio: new UntypedFormControl('', []),
    descripcion: new UntypedFormControl('', [Validators.required])
  })
  get id_servicio(): UntypedFormControl { return this.formServicio.get('id_servicio') as UntypedFormControl }
  get descripcion_servicio(): UntypedFormControl { return this.formServicio.get('descripcion') as UntypedFormControl }


  formEquipo = new UntypedFormGroup({
    fila_requerimiento: new UntypedFormControl('', [Validators.required]),
    equipos: new FormArray([])
  })
  get fila_requerimiento(): UntypedFormControl { return this.formEquipo.get('fila_requerimiento') as UntypedFormControl }
  get equipos(): FormArray {
    return this.formEquipo.get('equipos') as FormArray;
  }

  formDesagregado = new UntypedFormGroup({
    id_desagregado: new UntypedFormControl('', []),
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
    minutos_dia: new UntypedFormControl('', []),
    coste_dia: new UntypedFormControl('', []),
    observaciones: new UntypedFormControl('', [])
  })
  get id_desagregado(): UntypedFormControl { return this.formDesagregado.get('id_desagregado') as UntypedFormControl }
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
  get minutos_dia(): UntypedFormControl { return this.formDesagregado.get('minutos_dia') as UntypedFormControl }
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

  actualizarEquipos = false
  idEquiposEliminar = []
  selFilPlan = null
  verDetalle = ''
  iduser_local = null
  equipoEditado = false
  tipoSeleccionado: string = 'H-M';
  buscando = false
  listaRegistros = []
  estadoModificado = null
  id_equipo_modificar = null
  columnasEstatica = false
  private acumuladoCantidades: number[] = [];
  private acumuladoParciales: number[] = [];
  todosExpandidos = true
  todosExpandidosNueva = true
  todosExpandidosNueva2 = true

  private evitandoDobleEjecucion = false;
  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef, private encriptadorService: EncriptadorService, private _logisticaService: LogisticaService, private toaster: ToastrService, public formService: FormsService, private equiposServiciosService: EquiposServiciosService) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true;

      let res = await this._logisticaService.ListarAdquisicionesProy({ id_proyecto: this.id_proyecto });
      this.listaRegistros = res
      this.buscando6 = false;
      if (res?.length > 0) {
        this.id_registro = res[0].id_registro
        await this.cambioDataRegistro()
      }
      else {
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      SwalService.error()
    }
  }

  // async cambioDataRegistro() {
  //   this.mostrar_carga_todo = true
  //   console.log('b')
  //   setTimeout(async () => {

  //     this.limpiarVariables()
  //     // this.id_registro = this.listaRegistros[this.registroSeleccionado]?.id_registro
  //     const obj = { id_proyecto: this.id_proyecto, id_registro: this.id_registro, tipocontra: 2 }
  //     const resp = await this.equiposServiciosService.listarAgrupamientoRequerimientos(obj)
  //     const desagregados = await this.listarDesagregadosEquipos()
  //     await this.listarEquiposServicios(desagregados)
  //     const tablaRegActividades = resp.agrupacion.map(element => {
  //       element.servicios = this.tablaServiciosCompleto.filter(ele => ele.id_grupo == Number(element.idgrupo) && ele.id_registro == element.id_registro)
  //       return element
  //     })
  //     this.tablaRegActividades = await this.procesarCantidadAcumulada(tablaRegActividades)
  //     this.reqCompletos = resp.desagregados
  //     this.grupoSeleccionado = ''
  //     await this.calcularTotales()
  //     this.iduser_local = this.encriptadorService.recuperarlocalstory('idusuario');
  //     this.mostrar_carga_todo = false
  //     console.log('c')
  //   }, 0);

  // }
  async cambioDataRegistro() {
    this.mostrar_carga_todo = true
    await new Promise(resolve => setTimeout(resolve, 0));

    this.limpiarVariables()
    const obj = { id_proyecto: this.id_proyecto, id_registro: this.id_registro, tipocontra: 2 }
    const resp = await this.equiposServiciosService.listarAgrupamientoRequerimientos(obj)
    const desagregados = await this.listarDesagregadosEquipos()
    await this.listarEquiposServicios(desagregados)

    const tablaRegActividades = resp.agrupacion
      .filter(element => element.indice == null)
      .map(element => {
        element.servicios = this.tablaServiciosCompleto.filter(ele =>
          ele.id_grupo == Number(element.idgrupo) &&
          ele.id_registro == element.id_registro
        );
        return element;
      });
    this.tablaRegActividades = await this.procesarCantidadAcumulada(tablaRegActividades)
    this.reqCompletos = resp.desagregados
    this.grupoSeleccionado = ''
    await this.calcularTotales()
    this.iduser_local = this.encriptadorService.recuperarlocalstory('idusuario');
    this.mostrar_carga_todo = false
  }

  limpiarVariables() {
    this.tablaRegActividades = [];
    this.reqCompletos = []
    this.tablaRequerimientos = []
    this.filSelRegAct = null
    this.filSelReq = null
    this.tablaServicios = []
    this.tablaServiciosCompleto = []
    this.filSelServ = null
    // this.id_registro = null
    this.calendario = []
    this.mesSeleccionado = null
    this.calendarioFiltrado = null
    this.grupoSeleccionado = ''
    this.tablaPlanilla = []
    this.celdaSel = [null, null];
    this.sumaPorDiaPlanilla = []
    this.totalMes = 0
    this.detalleMensual = []
    this.actualizarEquipos = false
    this.idEquiposEliminar = []
    this.selFilPlan = null
    this.verDetalle = ''
    this.equipoEditado = false
    this.tipoSeleccionado = 'H-M';
    this.estadoModificado = null
    this.acumuladoCantidades = [];
    this.acumuladoParciales = [];
    this.resumenPorAnio = [];
  }

  // procesarCantidadAcumulada(data) {
  //   return data.map(actividad => {
  //     // Calcular el total acumulado de todos los servicios de esta actividad
  //     const totalActividad = actividad.servicios?.reduce((totalServicios, servicio) => {
  //       const sumaServicio = servicio.desagregadosCompleto?.reduce((total, d) => {
  //         if (servicio.tipo === 'H-M' || servicio.tipo === 'DIA') {
  //           return total + (d.horas_dia || 0);
  //         }
  //         if (servicio.tipo === 'MES' || servicio.tipo === 'GLOBAL') {
  //           const suma = d.horas_detalle?.split('/').reduce((sum, rango) => {
  //             const partes = rango.split('|');
  //             return sum + (parseFloat(partes[2]) || 0);
  //           }, 0) || 0;
  //           return total + suma;
  //         }
  //         return total;
  //       }, 0) || 0;
  //       return totalServicios + sumaServicio;
  //     }, 0) || 0;

  //     return {
  //       ...actividad,
  //       presupuestoEjecutado: totalActividad,
  //       saldo: actividad.parcial - totalActividad,

  //       porcentaje: actividad.parcial !== 0 ? ((actividad.parcial - totalActividad) / actividad.parcial) * 100 : 0,
  //       servicios: actividad.servicios?.map(servicio => ({
  //         ...servicio,
  //         presupuestoEjecutado: servicio.desagregadosCompleto?.reduce((total, d) => {
  //           if (servicio.tipo === 'H-M' || servicio.tipo === 'DIA') {
  //             return total + (d.horas_dia || 0);
  //           }
  //           if (servicio.tipo === 'MES' || servicio.tipo === 'GLOBAL') {
  //             const suma = d.horas_detalle?.split('/').reduce((sum, rango) => {
  //               const partes = rango.split('|');
  //               return sum + (parseFloat(partes[2]) || 0);
  //             }, 0) || 0;
  //             return total + suma;
  //           }
  //           return total;
  //         }, 0) || 0
  //       })) || []
  //     };
  //   });
  // }
  procesarCantidadAcumulada(data) {
    return data.map(actividad => {
      // Calcular el total acumulado de todos los servicios de esta actividad
      const totalActividad = actividad.servicios?.reduce((totalServicios, servicio) => {
        const sumaServicio = servicio.desagregadosCompleto?.reduce((total, d) => {
          if (servicio.tipo === 'H-M' || servicio.tipo === 'DIA') {
            return total + ((d.horas_dia * servicio.precio_unitario) || 0);
          }
          if (servicio.tipo === 'MES' || servicio.tipo === 'GLOBAL') {
            const suma = d.horas_detalle?.split('/').reduce((sum, rango) => {
              const partes = rango.split('|');
              return sum + ((parseFloat(partes[2]) * servicio.precio_unitario) || 0);
            }, 0) || 0;
            return total + suma;
          }
          return total;
        }, 0) || 0;
        return totalServicios + sumaServicio;
      }, 0) || 0;

      // Calcular saldo y porcentaje
      const saldo = actividad.parcial - totalActividad;
      const porcentaje = actividad.parcial !== 0
        ? ((actividad.parcial - totalActividad) / actividad.parcial) * 100
        : 0;

      return {
        ...actividad,
        presupuestoEjecutado: totalActividad,
        saldo: saldo,
        porcentaje: porcentaje,  // Esto mostrará negativo cuando saldo es negativo
        servicios: actividad.servicios?.map(servicio => ({
          ...servicio,
          presupuestoEjecutado: servicio.desagregadosCompleto?.reduce((total, d) => {
            if (servicio.tipo === 'H-M' || servicio.tipo === 'DIA') {
              return total + (d.horas_dia || 0);
            }
            if (servicio.tipo === 'MES' || servicio.tipo === 'GLOBAL') {
              const suma = d.horas_detalle?.split('/').reduce((sum, rango) => {
                const partes = rango.split('|');
                return sum + (parseFloat(partes[2]) || 0);
              }, 0) || 0;
              return total + suma;
            }
            return total;
          }, 0) || 0
        })) || []
      };
    });
  }

  calcularTotalDesagregado(servicio) {
    if (!servicio.desagregadosCompleto || servicio.desagregadosCompleto.length === 0) {
      return 0;
    }

    return servicio.desagregadosCompleto.reduce((total, d) => {
      if (servicio.tipo === 'H-M' || servicio.tipo === 'DIA') {
        return total + (d.horas_dia || 0);
      }
      if (servicio.tipo === 'MES' || servicio.tipo === 'GLOBAL') {
        const suma = d.horas_detalle?.split('/').reduce((sum, rango) => {
          const partes = rango.split('|');
          return sum + (parseFloat(partes[2]) || 0);
        }, 0) || 0;
        return total + suma;
      }
      return total;
    }, 0);
  }

  async listarEquiposServicios(desagregados) {
    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: this.id_registro
    }
    const response = await this.equiposServiciosService.listarEquipoServicio(obj)
    if (response.length) {
      response.forEach(async element => {
        if (element.index_grupo !== 0) {
          element.desagregadosCompleto = desagregados.filter(ele => ele.id_equipo == element.id_equipo)
          const tiempo_registrado = await this.calcularTotalDesagregado(element);
          element.parcial = element.cantidad * element.precio_unitario

          element.tiempo_registrado = tiempo_registrado
          if (element.tipo == 'GLOBAL') {
            element.precio_unitario = element.tiempo_registrado ? (element.total_registrado / element.tiempo_registrado) : 0
          } else {
            element.total_registrado = element.tiempo_registrado * element.precio_unitario
          }

        }
      });
      this.tablaServiciosCompleto = response
    }
  }

  recalcularMontos() {

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

      const tablaRequerimientos = this.reqCompletos.filter(ele => row.idgrupo == ele.idgrupo)
      const id_prov = row.nroprov;

      this.tablaRequerimientos = [...tablaRequerimientos]
        .map(servicio => {
          // Seleccionar precio y marca según el proveedor
          let precioSeleccionado = 0;
          let marcaSeleccionada = '';

          switch (Number(id_prov)) {
            case 1:
              precioSeleccionado = Number(servicio.preciosol1) || 0;
              marcaSeleccionada = servicio.marca1 || '';
              break;
            case 2:
              precioSeleccionado = Number(servicio.preciosol2) || 0;
              marcaSeleccionada = servicio.marca2 || '';
              break;
            case 3:
              precioSeleccionado = Number(servicio.preciosol3) || 0;
              marcaSeleccionada = servicio.marca3 || '';
              break;
            default:
              precioSeleccionado = 0;
              marcaSeleccionada = '';
          }

          // Calcular parcial (precio * cantidad)
          const cantidad = Number(servicio.cantidad) || 0;
          const parcial = precioSeleccionado * cantidad;

          // Buscar elementos encontrados en tablaServiciosCompleto
          const encontrados = this.tablaServiciosCompleto.filter(ele =>
            Number(servicio.idgrupo) == Number(ele.id_grupo) &&
            servicio.idfila == ele.id_fila
          );
          // Procesar los elementos encontrados pasando el array encontrados
          const resultado = this.procesarElementosEncontrados(encontrados);
          return {
            ...servicio,
            precio: precioSeleccionado,      // Precio seleccionado según proveedor
            marca: marcaSeleccionada,        // Marca seleccionada según proveedor
            parcial: parcial,                // Parcial calculado
            precio_usada: resultado.precio_usada,
            cantidad_usada: resultado.cantidad_usada,
            parcial_usada: resultado.parcial_usada,
            todos_iguales: resultado.todos_iguales,
            // Mantener los valores originales si los necesitas
            precioOriginal1: servicio.preciosol1,
            precioOriginal2: servicio.preciosol2,
            precioOriginal3: servicio.preciosol3,
            marcaOriginal1: servicio.marca1,
            marcaOriginal2: servicio.marca2,
            marcaOriginal3: servicio.marca3
          };
        });

      // const tablaServicios = this.tablaServiciosCompleto.filter(ele =>
      //   Number(ele.id_grupo) == Number(row.idgrupo)
      // );
      // this.tablaServicios = [...tablaServicios].sort((a, b) => {
      //   // Primero ordenar por index_grupo
      //   if (a.index_grupo !== b.index_grupo) {
      //     return a.index_grupo - b.index_grupo;
      //   }
      //   // Si tienen el mismo index_grupo, ordenar por index_elemento
      //   return a.index_elemento - b.index_elemento;
      // });
      const tablaServicios = this.tablaServiciosCompleto.filter(ele =>
        Number(ele.id_grupo) == Number(row.idgrupo)
      );

      this.tablaServicios = [...tablaServicios].sort((a, b) => {
        if (a.index_grupo !== b.index_grupo) {
          return a.index_grupo - b.index_grupo;
        }
        return a.index_elemento - b.index_elemento;
      }).map((item, index, array) => {
        item.icomost = '1'; // Todos los grupos empiezan colapsados
        item.visible = true; // La cabecera siempre visible

        return item;
      });
      this.todosExpandidos = true
      await this.calcularTotales()
      this.mostrar_carga_todo = false
    }
  }

  procesarElementosEncontrados(encontrados) {
    if (!encontrados || encontrados.length === 0) {
      return {
        precio_usada: null,
        cantidad_usada: null,
        parcial_usada: 0,
        todos_iguales: null
      };
    }
    const primerPrecio = encontrados[0].precio_unitario;
    const primerTipo = encontrados[0].tipo;
    const todosMismoPrecio = encontrados.every(ele => ele.precio_unitario === primerPrecio);
    const todosMismoTipo = encontrados.every(ele => ele.tipo === primerTipo);
    // Sumar todos los total_registrado de cada elemento encontrado
    const sumaTotalRegistrado = encontrados.reduce((sum, ele) =>
      sum + ((ele.tiempo_registrado !== 0 && ele.precio_unitario !== 0) ? (ele.total_registrado || 0) : 0), 0);
    if (todosMismoPrecio && todosMismoTipo) {
      return {
        precio_usada: primerPrecio,
        cantidad_usada: encontrados.reduce((sum, ele) => sum + (ele.tiempo_registrado || 0), 0),
        parcial_usada: sumaTotalRegistrado,
        todos_iguales: true
      };
    } else {
      return {
        precio_usada: null,
        cantidad_usada: null,
        parcial_usada: sumaTotalRegistrado,  // Aquí debe ir la suma de total_registrado
        todos_iguales: false
      };
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
    if (ind == this.subvista) {
      return
    }
    if (this.equipoEditado) {
      this.evitandoDobleEjecucion = true;
      await this.guardarActualizarCambiosDesagregado(true);
      this.evitandoDobleEjecucion = false;
    }
    this.subvista = ind;
    if (this.subvista == 2 || this.subvista == 3) {
      this.mostrar_carga_todo = true
      const resp = await this.equiposServiciosService.obtenerCalendarioProyecto({ id_proyecto: this.id_proyecto, meses_adicionales: 5 })
      if (resp.calendario_por_meses?.length) {
        this.selFilPlan = null
        this.verDetalle = ''
        this.detalleMensual = []
        this.calendario = resp.calendario_por_meses
        this.mesSeleccionado = 0
        this.calendarioFiltrado = this.calendario[this.mesSeleccionado]
        this.celdaSel = [null, null]
        this.equipoEditado = false
        this.formDesagregado.reset()
        this.formDesagregado.disable()
        this.formDesagregado.get('tiempos')?.disable();
        this.grupoSeleccionado = ''
        const desagredados = await this.listarDesagregadosEquipos()
        await this.filtrarPlanillaEquiposServicios(desagredados)

      } else {

      }
      this.mostrar_carga_todo = false
    } else {
      this.mostrar_carga_todo = true
      let res = await this._logisticaService.ListarAdquisicionesProy({ id_proyecto: this.id_proyecto });
      this.listaRegistros = res
      this.buscando6 = false;
      if (res?.length > 0) {
        this.id_registro = res[0].id_registro
        await this.cambioDataRegistro()
      }
      this.mostrar_carga_todo = false
    }

  }

  async listarDesagregadosEquipos() {
    try {
      const resp = await this.equiposServiciosService.listarDesagregadoEquipo({ id_proyecto: this.id_proyecto })
      return resp
    } catch (error) {
      console.log(error)
      SwalService.error()
    }

  }

  async cambioArea() {
    this.mostrar_carga_todo = true
    setTimeout(async () => {
      if (this.equipoEditado) {
        this.evitandoDobleEjecucion = true;
        await this.guardarActualizarCambiosDesagregado(true);
        this.evitandoDobleEjecucion = false;
      }
      this.calendarioFiltrado = this.calendario[this.mesSeleccionado]
      const desagredados = await this.listarDesagregadosEquipos()
      await this.filtrarPlanillaEquiposServicios(desagredados)
      this.mostrar_carga_todo = false
    }, 0);
  }

  filtrarPlanillaEquiposServicios(desagredados) {
    this.mostrar_carga_todo = true
    setTimeout(async () => {
      this.tablaPlanilla = []
      this.sumaPorDiaPlanilla = []
      let nuevaTabla = []
      let tablaServicios = []
      this.totalMes = 0
      this.todosExpandidosNueva = true
      this.todosExpandidosNueva2 = true
      // Variable para controlar si es subvista 3
      const esSubvista3 = this.subvista === 3;

      // Array para almacenar la suma por día de todos los elementos (solo para subvista 3)
      let sumaPorDia = [];

      if (this.grupoSeleccionado !== '') {
        const row = this.tablaRegActividades[this.grupoSeleccionado]
        tablaServicios = this.tablaServiciosCompleto.filter(ele => Number(ele.id_grupo) == Number(row.idgrupo))
        tablaServicios = [...tablaServicios].sort((a, b) => {
          if (a.index_grupo !== b.index_grupo) {
            return a.index_grupo - b.index_grupo;
          }
          return a.index_elemento - b.index_elemento;
        });
        this.tablaPlanilla = tablaServicios.filter(ele => ele.index_grupo !== 0)

        // Si es subvista 3, agregar propiedad mostrar a cada elemento
        if (esSubvista3) {
          this.tablaPlanilla.forEach(element => {
            element.mostrar = 1;
          });
        }
      } else {
        // Solo inicializar sumaPorDia si es subvista 3
        if (esSubvista3 && this.calendarioFiltrado?.dias) {
          sumaPorDia = new Array(this.calendarioFiltrado.dias.length).fill(0);
        }

        for (const element of this.tablaRegActividades) {
          let j = 0
          const filtrados = this.tablaServiciosCompleto.filter(ele => Number(ele.id_grupo) == Number(element.idgrupo) && ele.index_elemento !== 0)
          const grupo = {
            "id_equipo": null,
            "id_proyecto": null,
            "id_registro": null,
            "id_grupo": null,
            "id_fila": null,
            "ind_rep": null,
            "index_elemento": null,
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
            item: j,
            valorGlobal: null,
            desagregadosCompleto: [],
            valorMensual: null,
            desagregadosMes: [],
            mostrar: 1,
            visible: true,
            icomost: '1'
          }

          // Solo agregar propiedad mostrar si es subvista 3
          if (esSubvista3) {
            grupo.mostrar = 1;
          }

          nuevaTabla.push(grupo)

          for (const element of filtrados) {
            j++
            element.cabecera = false
            element.mostrar = 1
            element.icomost = '1'
            // Solo agregar propiedad mostrar si es subvista 3
            if (esSubvista3) {
              element.mostrar = 1;
            }

            const planilla = this.calendarioFiltrado?.dias.map(ele => {
              const encontrado = desagredados.find(reg => reg.fecha.split('T')[0] == ele.fecha && reg.id_equipo == element.id_equipo)
              return encontrado ? encontrado : null
            })
            const completos = desagredados.filter(reg => reg.id_equipo == element.id_equipo)
            element.planilla = planilla
            element.item = j
            element.desagregadosCompleto = completos
            element.visible = true
            if (element.tipo == 'GLOBAL') {
              element.valorGlobal = completos[0]
              const valorGlobal = completos.find(ele => ele)
              const arrayMes = await this.evaluarGlobalMes(valorGlobal?.horas_detalle, 'GLOBAL')
              element.valorGlobal = valorGlobal
              element.arrayMes = arrayMes
              const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
              element.total_hm = total
              element.parcial = total * element.precio_unitario

              // Solo sumar al total por día si es subvista 3
              if (esSubvista3 && arrayMes && arrayMes.length === sumaPorDia.length) {
                arrayMes.forEach((valor, idx) => {
                  sumaPorDia[idx] += (Number(valor) || 0) * element.precio_unitario;
                });
              }
            } else if (element.tipo == 'MES') {
              element.valorGlobal = null
              const valorMes = planilla.find(ele => ele)
              element.valorMensual = valorMes
              const arrayMes = await this.evaluarGlobalMes(valorMes?.horas_detalle, 'MES')
              element.arrayMes = arrayMes
              const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
              element.total_hm = total
              element.parcial = total * element.precio_unitario

              // Solo sumar al total por día si es subvista 3
              if (esSubvista3 && arrayMes && arrayMes.length === sumaPorDia.length) {
                arrayMes.forEach((valor, idx) => {
                  sumaPorDia[idx] += (Number(valor) || 0) * element.precio_unitario;
                });
              }
            } else {
              element.arrayMes = []
              const total = planilla.reduce((acc, ele) => acc + (Number(ele?.horas_dia) || 0), 0)
              element.total_hm = total
              element.parcial = total * element.precio_unitario

              // Solo sumar al total por día si es subvista 3
              if (esSubvista3 && planilla && planilla.length === sumaPorDia.length) {
                planilla.forEach((dia, idx) => {
                  sumaPorDia[idx] += (Number(dia?.horas_dia) || 0) * element.precio_unitario;
                });
              }
            }
          }
          nuevaTabla = nuevaTabla.concat(filtrados)
        }
        this.tablaPlanilla = nuevaTabla
        // Solo agregar el array de sumas por día si es subvista 3
        if (esSubvista3 && sumaPorDia.length > 0) {
          this.sumaPorDiaPlanilla = sumaPorDia;
          this.totalMes = sumaPorDia.reduce((acumulador, valorActual) => acumulador + valorActual, 0);
        }
      }
      this.mostrar_carga_todo = false
    }, 50);
  }

  evaluarGlobalMes(horasDetalle, tipo) {
    // if (tipo == 'GLOBAL') {
    //   const calendario = this.calendario
    //   console.log('global', calendario)
    // } else {
    const mes = this.calendarioFiltrado?.dias
    if (!horasDetalle) return new Array(mes.length).fill(0);

    // Crear un Set con todas las fechas que están en los rangos
    const fechasEnRango = new Set();

    horasDetalle.split('/').forEach(rango => {
      if (!rango.trim()) return;

      const [fechaInicioStr, fechaFinStr] = rango.split('|');
      const fechaInicio = new Date(fechaInicioStr);
      const fechaFin = new Date(fechaFinStr);

      // Agregar todas las fechas entre inicio y fin al Set
      let fechaActual = new Date(fechaInicio);
      while (fechaActual <= fechaFin) {
        fechasEnRango.add(fechaActual.toISOString().split('T')[0]);
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    });

    // Mapear el calendario: 1 si la fecha está en el Set, 0 si no
    return mes.map(dia => fechasEnRango.has(dia.fecha) ? 1 : 0);
    // }
  }

  async cambioMes() {
    this.mostrar_carga_todo = true
    setTimeout(async () => {
      if (this.equipoEditado) {
        this.evitandoDobleEjecucion = true;
        await this.guardarActualizarCambiosDesagregado(true);
        this.evitandoDobleEjecucion = false;
      }
      this.calendarioFiltrado = this.calendario[this.mesSeleccionado]
      const desagredados = await this.listarDesagregadosEquipos()
      await this.filtrarPlanillaEquiposServicios(desagredados)
      this.mostrar_carga_todo = false
    }, 0);

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
      const gruposExistentes = this.tablaServicios.filter(ele => ele.index_elemento == 0)
      const elementoMayorIndex = gruposExistentes.reduce((max, ele) =>
        ele.index_grupo > max.index_grupo ? ele : max
        , gruposExistentes[0]);
      const filaRegAct = this.tablaRegActividades[this.filSelRegAct]
      const servicio: servicio = {
        cantidad: null,
        descripcion: this.descripcion_servicio.value,
        id_grupo: filaRegAct.idgrupo,
        fecha_solicitud: null,
        id_registro: filaRegAct.id_registro,
        index_grupo: elementoMayorIndex?.index_grupo ? (elementoMayorIndex.index_grupo + 1) : 1,
        estado: null,
        item: null,
        parcial: 0,
        placa: null,
        precio_unitario: null,
        unidad: null,
        id_equipo: null,
        id_fila: filaRegAct.idfila,
        ind_rep: null,
        index_elemento: 0,
        id_proyecto: this.id_proyecto,
        tipo: null,
        tipo_registro: null,
        nroprov: null,
        tiempo_registrado: 0,
        valorGlobal: null,
        desagregadosCompleto: [],
        total_registrado: 0,
      }
      const serviciosArray = [servicio];
      const idsInsertados = await this.equiposServiciosService.guardarEquiposServicio(serviciosArray)
      if (idsInsertados && idsInsertados.length > 0) {
        serviciosArray.forEach((serv, index) => {
          if (index < idsInsertados.length) {
            serv.id_equipo = idsInsertados[index];
          }
        });
        this.tablaServiciosCompleto = this.tablaServiciosCompleto.concat(serviciosArray)
        const row = this.tablaRegActividades[this.filSelRegAct]
        const i = this.filSelRegAct
        this.filSelRegAct = null
        await this.selTablaRegAct(row, i)
        this.modalServicio.hide();
      } else {
        SwalService.error('No se pudieron guardar los servicios');
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
    this.actualizarEquipos = false
    this.equipos.clear();

    this.fila_requerimiento.reset('');

    this.formEquipo.markAsPristine();
    this.formEquipo.markAsUntouched();
    this.formEquipo.updateValueAndValidity();
    this.tablaEquiposAgregar = []
    this.idEquiposEliminar = []
    if (row) {
      this.actualizarEquipos = true
      const elementosGrupo = this.tablaServicios.filter(ele => ele.index_grupo == row.index_grupo && ele.index_elemento !== 0)
      for (const requerimiento of elementosGrupo) {
        const fecha_solicitud = requerimiento.fecha_solicitud
          ? requerimiento.fecha_solicitud.split('T')[0]
          : null;
        const form = this.fb.group({
          item: ['E-' + requerimiento.id_fila],
          descripcion: [requerimiento?.descripcion || '', Validators.required],
          placa: [requerimiento?.placa],
          fecha_solicitud: [fecha_solicitud],
          unidad: [requerimiento.unidad, [Validators.required]],
          cantidad: [requerimiento.cantidad, [Validators.required]],
          precio_unitario: [requerimiento.precio_unitario, [Validators.required]],
          parcial: [requerimiento.cantidad * requerimiento.precio_unitario],
          estado: [requerimiento?.estado],
          index_grupo: [requerimiento?.index_grupo],
          id_grupo: [requerimiento?.id_grupo],
          id_equipo: [requerimiento?.id_equipo],
          id_registro: [requerimiento.id_registro],
          id_fila: [requerimiento?.id_fila],
          ind_rep: [requerimiento?.ind_rep],
          index_elemento: [requerimiento?.index_elemento],
          id_proyecto: [requerimiento?.id_proyecto],
          tipo_registro: [requerimiento?.tipo_registro],
          tipo: [{
            value: requerimiento?.tipo,
            disabled: requerimiento?.desagregadosCompleto?.length > 0
          }],
          nroprov: [requerimiento?.nroprov],
          desagregadosCompleto: [requerimiento?.desagregadosCompleto],
          tiempo_registrado: [requerimiento?.tiempo_registrado],
          total_registrado: [requerimiento?.total_registrado]
        });
        this.equipos.push(form)
      }
    } else {
      this.actualizarEquipos = false
    }
    this.modalEquipo.show()
  }

  abrirModalEstado(row) {
    this.modalEstado.show()
    this.estadoModificado = null
    this.id_equipo_modificar = null
    this.estadoModificado = row.estado?.toString() || '1'
    this.id_equipo_modificar = row.id_equipo
  }

  cerrarModalEstado() {
    this.modalEstado.hide()
  }

  async actualizarEstadoEquipo() {
    try {
      this.mostrar_carga_todo = true
      const obj = {
        id_proyecto: this.id_proyecto,
        id_equipo: this.id_equipo_modificar,
        estado: this.estadoModificado
      }

      const response = await this.equiposServiciosService.actualizarEstadoEquipo(obj)
      // Verificar si la respuesta es exitosa
      if (response && Array.isArray(response) && response.length > 0 && response[0].mensaje === "Registro actualizado correctamente") {

        // Convertir estado a número si es necesario (depende de cómo lo tengas en tu array)
        const nuevoEstado = typeof this.estadoModificado === 'string'
          ? parseInt(this.estadoModificado)
          : this.estadoModificado

        // Actualizar en tablaServicios
        const indexServicios = this.tablaServicios.findIndex(
          item => item.id_equipo === this.id_equipo_modificar
        )

        if (indexServicios !== -1) {
          this.tablaServicios[indexServicios].estado = nuevoEstado
        }

        // Actualizar en tablaServiciosCompleto
        const indexServiciosCompleto = this.tablaServiciosCompleto.findIndex(
          item => item.id_equipo === this.id_equipo_modificar
        )

        if (indexServiciosCompleto !== -1) {
          this.tablaServiciosCompleto[indexServiciosCompleto].estado = nuevoEstado
        }

        // Mostrar mensaje de éxito
        this.toaster.success('Estado actualizado correctamente', 'Éxito')

        // Cerrar el modal si es necesario
        this.modalEstado.hide()

        // Opcional: Recargar la selección actual si es necesario
        if (this.filSelRegAct !== null && this.tablaRegActividades[this.filSelRegAct]) {
          const row = this.tablaRegActividades[this.filSelRegAct]
          const i = this.filSelRegAct
          await this.selTablaRegAct(row, i)
        }

      } else {
        // Si la respuesta no es la esperada
        this.toaster.error(response?.message || 'Error al actualizar el estado', 'Error')
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      SwalService.error()
    }
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
      const filtrados = this.tablaServicios.filter(ele => ele.index_grupo == filaServicio.index_grupo && ele.index_elemento !== 0)
      const filaRegAct = this.tablaRegActividades[this.filSelRegAct]
      let serviciosArray = []
      let i = filtrados.length + 1
      for (const element of this.equipos.value) {
        const equipo: servicio = {
          cantidad: this.formService.redondeo(element.cantidad, 5),
          descripcion: element.descripcion,
          id_grupo: filaRegAct.idgrupo,
          fecha_solicitud: element.fecha_solicitud,
          id_registro: element.id_registro,
          id_fila: element.id_fila,
          ind_rep: element.ind_rep,
          index_grupo: filaServicio.index_grupo,
          estado: 1,
          item: element.item,
          parcial: element.precio_unitario * element.cantidad,
          placa: element.placa,
          precio_unitario: this.formService.redondeo(element.precio_unitario, 5),
          unidad: element.unidad,
          id_equipo: null,
          index_elemento: i,
          id_proyecto: this.id_proyecto,
          tipo: element.tipo,
          tipo_registro: element.tipo_registro,
          nroprov: element.nroprov,
          tiempo_registrado: 0,
          valorGlobal: null,
          desagregadosCompleto: [],
          total_registrado: element.total_registrado
        }
        serviciosArray.push(equipo)
        i++
      }
      const idsInsertados = await this.equiposServiciosService.guardarEquiposServicio(serviciosArray)
      if (idsInsertados && idsInsertados.length > 0) {
        serviciosArray.forEach((serv, index) => {
          if (index < idsInsertados.length) {
            serv.id_equipo = idsInsertados[index];
          }
        });
        this.tablaServiciosCompleto = this.tablaServiciosCompleto.concat(serviciosArray)
        const row = this.tablaRegActividades[this.filSelRegAct]
        const i = this.filSelRegAct
        this.filSelRegAct = null
        await this.selTablaRegAct(row, i)
        this.modalEquipo.hide();
        this.toaster.success(
          `Se guardo correctamente`,
          'Éxito'
        );
      } else {
        SwalService.error('No se pudieron guardar los servicios');
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      SwalService.error()
      console.log(error)
    }
  }

  calcularParcial(equipo: AbstractControl) {
    const tiempo_registrado = equipo.get('tiempo_registrado')?.value;
    const precioUnitario = equipo.get('precio_unitario')?.value;

    let total_registrado = 0;
    if (tiempo_registrado && precioUnitario && !isNaN(tiempo_registrado) && !isNaN(precioUnitario)) {
      const cantNum = Number(tiempo_registrado);
      const precioNum = Number(precioUnitario);
      total_registrado = Number(this.formService.redondeo(cantNum * precioNum, 5));
    }

    equipo.get('total_registrado')?.setValue(total_registrado, { emitEvent: false });
  }

  // Calcula el precio unitario cuando se edita parcial (modo GLOBAL)
  calcularPrecioUnitario(equipo: AbstractControl) {
    const tiempo_registrado = equipo.get('tiempo_registrado')?.value;
    const total_registrado = equipo.get('total_registrado')?.value;
    let precioUnitario = 0;

    if (tiempo_registrado && total_registrado && !isNaN(tiempo_registrado) && !isNaN(total_registrado)) {
      const cantNum = Number(tiempo_registrado);
      const parcialNum = Number(total_registrado);
      precioUnitario = cantNum !== 0 ? Number(this.formService.redondeo((parcialNum / cantNum), 5)) : 0;
    }

    equipo.get('precio_unitario')?.setValue(precioUnitario, { emitEvent: false });
  }

  async actualizarEquiposServicio() {
    try {
      if (this.equipos.invalid) {
        this.equipos.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto2',
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
      let elementosActualizar = []
      for (const element of this.equipos.value) {
        const equipo: servicio = {
          cantidad: element.cantidad,
          descripcion: element.descripcion,
          id_grupo: element.id_grupo,
          fecha_solicitud: element.fecha_solicitud,
          id_registro: element.id_registro,
          id_fila: element.id_fila,
          ind_rep: element.ind_rep,
          index_grupo: element.index_grupo,
          estado: element.estado,
          item: element.item,
          parcial: element.precio_unitario * element.cantidad,
          placa: element.placa,
          precio_unitario: element.precio_unitario,
          unidad: element.unidad,
          id_equipo: element.id_equipo,
          index_elemento: element.index_elemento,
          id_proyecto: element.id_proyecto,
          tipo: element.tipo,
          tipo_registro: element.tipo_registro,
          nroprov: element.nroprov,
          tiempo_registrado: element.tiempo_registrado,
          valorGlobal: element.valorGlobal,
          desagregadosCompleto: element.desagregadosCompleto,
          total_registrado: element.total_registrado
        }
        elementosActualizar.push(equipo)
      }

      const payload = {
        elementosActualizar: elementosActualizar,
        idsEliminar: this.idEquiposEliminar,
        id_proyecto: this.id_proyecto
      };
      const response = await this.equiposServiciosService.actualizarEliminarEquiposServicio(payload);
      if (response && response.success) {
        if (this.idEquiposEliminar.length > 0) {
          this.tablaServiciosCompleto = this.tablaServiciosCompleto.filter(
            item => !this.idEquiposEliminar.includes(item.id_equipo)
          );
        }

        for (const nuevo of elementosActualizar) {
          const indexExistente = this.tablaServiciosCompleto.findIndex(
            item => item.id_equipo === nuevo.id_equipo && nuevo.id_equipo !== null
          );

          if (indexExistente !== -1) {
            // Obtener el objeto existente
            const existente = this.tablaServiciosCompleto[indexExistente];

            // ACTUALIZAR SOLO LOS CAMPOS QUE SE ENVIARON AL BACKEND
            // Mantener todas las propiedades frontend (desagregadosCompleto, total_registrado, fecha_creacion, etc.)
            existente.cantidad = nuevo.cantidad;
            existente.descripcion = nuevo.descripcion;
            existente.id_grupo = nuevo.id_grupo;
            existente.fecha_solicitud = nuevo.fecha_solicitud;
            existente.id_registro = nuevo.id_registro;
            existente.id_fila = nuevo.id_fila;
            existente.ind_rep = nuevo.ind_rep;
            existente.index_grupo = nuevo.index_grupo;
            existente.estado = nuevo.estado;
            existente.item = nuevo.item;
            existente.parcial = nuevo.precio_unitario * nuevo.cantidad; // Recalcular parcial
            existente.placa = nuevo.placa;
            existente.precio_unitario = nuevo.precio_unitario;
            existente.unidad = nuevo.unidad;
            existente.index_elemento = nuevo.index_elemento;
            existente.tipo = nuevo.tipo;
            existente.tipo_registro = nuevo.tipo_registro;
            existente.nroprov = nuevo.nroprov;
            existente.tiempo_registrado = nuevo.tiempo_registrado;
            existente.valorGlobal = nuevo.valorGlobal;
            existente.total_registrado = nuevo.total_registrado;

          }
        }

        this.tablaServiciosCompleto.sort((a, b) => {
          if (a.index_grupo !== b.index_grupo) {
            return a.index_grupo - b.index_grupo;
          }
          return a.index_elemento - b.index_elemento;
        });

        const row = this.tablaRegActividades[this.filSelRegAct]
        const i = this.filSelRegAct
        this.filSelRegAct = null
        await this.selTablaRegAct(row, i)
        this.idEquiposEliminar = [];
        this.equipos.clear();
        this.modalEquipo.hide();

        this.toaster.success(
          `Actualizados: ${response.idsActualizados?.length || 0} - Eliminados: ${response.idsEliminados?.length || 0}`,
          'Éxito'
        );
      } else {
        this.toaster.error(response.message || 'Error en la operación', 'Error');
      }
      await this.actualizarDataCompleta()
      this.mostrar_carga_todo = false;
    } catch (e) {
      this.mostrar_carga_todo = false
      SwalService.error()
      console.log(e)
    }
  }

  async eliminarGrupo(row, i) {

    const novalido = this.tablaServicios.find(ele => ele.index_grupo == row.index_grupo && ele.desagregadosCompleto.length)
    if (novalido) {
      this.toaster.error(
        'El servicio tiene equipos con registros en planilla',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 6000,
        }
      );
      return
    }
    const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la servicio con los equipos  relacionados')
    if (sw.isConfirmed) {
      this.mostrar_carga_todo = true
      const idsEquipoEliminados = [];
      const indicesPrimeros = []; // Array para guardar los índices
      this.tablaServiciosCompleto.forEach((item, index) => {
        if (item.id_registro === row.id_registro && item.index_grupo === row.index_grupo && item.id_grupo == row.id_grupo) {
          indicesPrimeros.push(index);
          idsEquipoEliminados.push(item.id_equipo);
        }
      });

      try {

        const payload = {
          elementosActualizar: [],
          idsEliminar: idsEquipoEliminados,
          id_proyecto: this.id_proyecto
        };
        const response = await this.equiposServiciosService.actualizarEliminarEquiposServicio(payload);
        if (response && response.success) {
          this.tablaServiciosCompleto = this.tablaServiciosCompleto.filter(item => {
            return !(item.id_registro === row.id_registro && item.index_grupo === row.index_grupo && item.id_grupo == row.id_grupo);
          });

          if (this.tablaServicios) {
            this.tablaServicios = this.tablaServicios.filter(item =>
              !(item.id_registro === row.id_registro && item.index_grupo === row.index_grupo && item.id_grupo == row.id_grupo)
            );
          }
        }
        await this.actualizarDataCompleta()
      } catch (error) {
        this.mostrar_carga_todo = false
        console.error('Error al llamar al endpoint:', error);
        SwalService.error()
        throw error;
      }
    }
    this.mostrar_carga_todo = false
  }

  calcularTotales() {
    for (const element of this.tablaRequerimientos) {
      // Filtrar servicios relacionados con este requerimiento
      const filtrados = this.tablaServicios.filter((ele: servicio) =>
        Number(ele.id_registro) === Number(element.id_registro) &&
        Number(ele.ind_rep) === Number(element.indrep) &&
        Number(ele.id_grupo) === Number(element.idgrupo) &&
        Number(ele.id_fila) === Number(element.idfila)
      );

      // Verificar si todos los servicios tienen el mismo tipo y precio_unitario
      const primerServicio = filtrados[0];
      const tienenMismoTipo = filtrados.every(servicio => servicio.tipo === primerServicio?.tipo);
      const tienenMismoPrecio = filtrados.every(servicio => servicio.precio_unitario === primerServicio?.precio_unitario);
      const sonHomogeneos = tienenMismoTipo && tienenMismoPrecio && filtrados.length > 0;

      // Calcular el total de tiempo_registrado (cantidad_usada)
      const sumaTotalTiempoRegistrado = filtrados.reduce((acc, item) => acc + (Number(item.tiempo_registrado) || 0), 0);

      // Calcular el total de parcial_usada (suma de total_registrado)
      // const sumaTotalRegistrado = filtrados.reduce((acc, item) => acc + (Number(item.total_registrado) || 0), 0);
      const sumaTotalRegistrado = filtrados.reduce((sum, ele) =>
        sum + ((ele.tiempo_registrado !== 0 && ele.precio_unitario !== 0) ? (ele.total_registrado || 0) : 0), 0);
      if (sonHomogeneos) {
        // Caso homogéneo: todos tienen mismo tipo y precio_unitario
        element.cantidad_usada = sumaTotalTiempoRegistrado;
        element.precio_usada = primerServicio.precio_unitario;
        element.parcial_usada = sumaTotalRegistrado;
      } else {
        // Caso heterogéneo: difieren en tipo o precio_unitario
        element.cantidad_usada = null;
        element.precio_usada = null;
        element.parcial_usada = sumaTotalRegistrado;
      }

      // Calcular saldo
      element.saldo = (Number(element.parcial) || 0) - (Number(element.parcial_usada) || 0);
    }

    // Recalcular acumulados por grupo
    let acumuladoGrupo = 0;
    let acumuladoTotal = 0;

    for (let i = this.tablaServicios.length - 1; i >= 0; i--) {
      const element = this.tablaServicios[i];
      if (element.index_grupo === 0) {
        element.parcial = acumuladoGrupo;
        acumuladoTotal += acumuladoGrupo;
        acumuladoGrupo = 0;
      } else {
        acumuladoGrupo += element.parcial;
      }
    }

  }

  async seleccionCelda(i, j) {
    if (this.evitandoDobleEjecucion) {
      return;
    }
    const tipoFila = this.tablaPlanilla[i]?.tipo;
    if (tipoFila === 'GLOBAL' || tipoFila === 'MES') {
      // Para GLOBAL y MES, no hacer nada al hacer clic en celda
      return;
    }
    if (this.celdaSel[0] !== i || this.celdaSel[1] !== j) {
      if (this.equipoEditado) {
        this.evitandoDobleEjecucion = true;
        await this.guardarActualizarCambiosDesagregado(true);
        this.evitandoDobleEjecucion = false;
      }
      this.buscando = true
      this.celdaSel = [i, j]
      // this.formDesagregado.reset()
      this.id_desagregado.reset()
      this.horas_dia.reset()
      this.minutos_dia.reset()
      this.coste_dia.reset()
      this.observaciones.reset()
      // this.observaciones.enable()
      this.horas_dia.enable()
      while (this.tiempos.value.length) {
        this.tiempos.removeAt(0);
      }
      let dataDiaEquipo = null
      this.coste_unitario.setValue(this.tablaPlanilla[i].precio_unitario)
      this.unidad.setValue(this.tablaPlanilla[i].unidad)
      this.tiempo_programado.setValue(this.tablaPlanilla[i].cantidad)
      if (this.tablaPlanilla[i].tipo == 'MES') {
        dataDiaEquipo = this.tablaPlanilla[i].valorMensual
      } else if (this.tablaPlanilla[i].tipo == 'GLOBAL') {
        dataDiaEquipo = this.tablaPlanilla[i].valorGlobal
      } else {
        dataDiaEquipo = this.tablaPlanilla[i].planilla[j]
        if (this.tablaPlanilla[i].tipo == 'DIA') {
          this.horas_dia.disable()
        }
      }
      if (dataDiaEquipo) {
        const tiempos = dataDiaEquipo.horas_detalle

        if (tiempos) {
          const esFecha = this.tipoSeleccionado === 'MES' || this.tipoSeleccionado === 'GLOBAL';

          // Separar por '/' para obtener cada fila
          const filas = dataDiaEquipo.horas_detalle.split('/');

          filas.forEach((fila: string) => {
            // Separar por '|' para obtener inicio y fin
            const [valor1, valor2, valor3] = fila.split('|');

            // Crear el grupo según el tipo
            const grupoControles: any = {
              tiempo: [0]
            };

            if (esFecha) {
              grupoControles.fechaInicio = [valor1 || '', Validators.required];
              grupoControles.fechaFin = [valor2 || '', Validators.required];
            } else {
              grupoControles.inicio = [valor1 || '', Validators.required];
              grupoControles.fin = [valor2 || '', Validators.required];
            }
            grupoControles.tiempo = [valor3 || 0];
            const nuevoGrupo = this.fb.group(grupoControles, {
              validators: [this.validarFila.bind(this)]
            });

            this.tiempos.push(nuevoGrupo);
          });
          if (this.tiempos.value.length) {
            await this.actualizarTiempoUtilizado(false);
            this.observaciones.enable()
          } else {
            await this.calcularSaldo()
          }
          this.equipoEditado = false
        }

        this.id_desagregado.setValue(dataDiaEquipo.id_desagregado)
        this.horas_dia.setValue(dataDiaEquipo.horas_dia)
        let total = 0
        this.tablaPlanilla[i].desagregadosCompleto.forEach(ele => {
          total += Number(ele.horas_dia);
        });
        this.tiempo_utilizado.setValue(total)
        const saldo = this.tiempo_programado.value - total
        this.saldo_utilizar.setValue(saldo)
        this.minutos_dia.setValue(dataDiaEquipo.minutos_dia)
        this.observaciones.setValue(dataDiaEquipo.observaciones)
        this.coste_dia.setValue(dataDiaEquipo.costo_dia)
      } else {

      }
      this.buscando = false
    }
  }

  eliminarTiempo(index: number) {
    this.tiempos.removeAt(index);
    this.actualizarTiempoUtilizado();
  }

  cambioHorasDia() {
    while (this.tiempos.value.length) {
      this.tiempos.removeAt(0);
    }
    this.calcularSaldo()
    this.minutos_dia.setValue(this.horas_dia.value * 60)
    this.equipoEditado = true
  }

  calcularTiempo(index: number) {
    // 1. Notificar a todas las filas que deben re-validarse (para detectar choques mutuos)
    this.tiempos.controls.forEach(control => {
      control.updateValueAndValidity({ emitEvent: false });
    });

    const tiempoControl = this.tiempos.at(index) as FormGroup;

    // 2. Si la fila es válida, calculamos minutos, si no, es 0
    if (tiempoControl.valid && this.tipoSeleccionado !== 'MES' && this.tipoSeleccionado !== 'GLOBAL') {
      const [hI, mI] = tiempoControl.get('inicio')?.value.split(':').map(Number);
      const [hF, mF] = tiempoControl.get('fin')?.value.split(':').map(Number);
      const total = (hF * 60 + mF) - (hI * 60 + mI);
      tiempoControl.get('tiempo')?.setValue(total, { emitEvent: false });
    } else if (tiempoControl.invalid) {
      tiempoControl.get('tiempo')?.setValue(0, { emitEvent: false });
    } else {

    }
    if (this.tiempos.value.length) {
      this.actualizarTiempoUtilizado();
    } else {
      this.calcularSaldo()
    }
    this.cdRef.detectChanges();
  }

  private ejecutarValidacionFila(index: number) {
    const tiempoControl = this.tiempos.at(index) as FormGroup;
    const inicio = tiempoControl.get('inicio')?.value;
    const fin = tiempoControl.get('fin')?.value;

    if (!inicio || !fin) {
      tiempoControl.setErrors(null);
      return;
    }

    const [hI, mI] = inicio.split(':').map(Number);
    const [hF, mF] = fin.split(':').map(Number);
    const minI = hI * 60 + mI;
    const minF = hF * 60 + mF;

    let errores: any = null;

    if (minI >= minF) {
      errores = { inicioMayor: true };
    } else if (this.haySolapamientoHorario(inicio, fin, index)) {
      errores = { solapamiento: true };
    }
    // EL CAMBIO CLAVE: setTimeout
    setTimeout(() => {
      tiempoControl.setErrors(errores, { emitEvent: false });

      if (errores) {
        tiempoControl.get('tiempo')?.setValue(0, { emitEvent: false });
        tiempoControl.get('inicio')?.markAsDirty();
        tiempoControl.get('inicio')?.markAsTouched();
        tiempoControl.get('fin')?.markAsDirty();
        tiempoControl.get('fin')?.markAsTouched();
      } else {
        tiempoControl.get('tiempo')?.setValue(minF - minI, { emitEvent: false });
      }
      this.cdRef.detectChanges();
    });
  }

  actualizarTiempoUtilizado(cambio = true) {
    let totalMinutos = 0;

    this.tiempos.controls.forEach(control => {
      const tiempoControl = control as UntypedFormGroup;
      const minutos = tiempoControl.get('tiempo')?.value || 0;
      totalMinutos += Number(minutos);
    });
    totalMinutos = this.tipoSeleccionado == 'H-M' ? Number((totalMinutos).toFixed(5)) : (this.tipoSeleccionado == 'DIA' ? 60 : (this.tipoSeleccionado == 'MES' ? 60 : 60));
    this.minutos_dia.setValue(totalMinutos);
    this.horas_dia.setValue(this.tipoSeleccionado == 'H-M' ? Number((totalMinutos / 60).toFixed(5)) : 1);
    if (this.tablaPlanilla[this.selFilPlan]?.tipo !== 'HM' && !this.tiempos.value.length) {
      this.horas_dia.setValue(0)
      this.minutos_dia.setValue(0);
    }
    this.calcularSaldo();
    if (cambio) {
      this.equipoEditado = true
    }

  }

  calcularSaldo() {
    let minutosProg = 0;
    const progValue = this.horas_dia.value;

    if (progValue) {
      if (typeof progValue === 'string' && progValue.includes(':')) {
        const [horas, minutos] = progValue.split(':').map(Number);
        minutosProg = (horas * 60) + (minutos || 0);
      } else {
        minutosProg = Math.round(parseFloat(progValue.toString()) * 60);
      }
    }

    // Obtener el coste unitario por hora
    const costeUnitario = this.coste_unitario.value || 0;

    // Calcular horas trabajadas (convertir minutos a horas)
    const horasTrabajadas = minutosProg / 60;

    // Calcular el coste del día (horas * coste por hora)
    const costeDia = horasTrabajadas * costeUnitario;

    // Redondear a 2 decimales para moneda
    this.coste_dia.setValue(Math.round(costeDia * 100) / 100);
    let total = 0
    // this.tablaPlanilla[this.selFilPlan]?.desagregadosCompleto.map(ele => ele.horas_dia + total)
    this.tablaPlanilla[this.selFilPlan]?.desagregadosCompleto.forEach(ele => {
      total += Number(ele.horas_dia);
    });

    this.tiempo_utilizado.setValue(total)
    const saldo = this.tiempo_programado.value - total
    this.saldo_utilizar.setValue(saldo)
    if (this.tablaPlanilla[this.selFilPlan].tipo !== 'MES') {
      const total2 = this.tablaPlanilla[this.selFilPlan].planilla.reduce((acc, ele) => acc + (Number(ele?.horas_dia) || 0), 0)
      this.tablaPlanilla[this.selFilPlan].total_hm = total2
      this.tablaPlanilla[this.selFilPlan].parcial = total2 * this.tablaPlanilla[this.selFilPlan].precio_unitario
    } else if (this.tablaPlanilla[this.selFilPlan].tipo !== 'GLOBAL') {
      const total2 = this.tablaPlanilla[this.selFilPlan].planilla.reduce((acc, ele) => acc + (Number(ele?.horas_dia) || 0), 0)
      this.tablaPlanilla[this.selFilPlan].total_hm = total2
      // this.tablaPlanilla[this.selFilPlan].parcial = total2 * this.tablaPlanilla[this.selFilPlan].precio_unitario
      this.tablaPlanilla[this.selFilPlan].precio_unitario = total2 !== 0
        ? Number((this.tablaPlanilla[this.selFilPlan].total_registrado / total2).toFixed(5))
        : 0;

    } else {
      const total = this.tablaPlanilla[this.selFilPlan].arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
      this.tablaPlanilla[this.selFilPlan].total_hm = total
      this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
    }

  }

  async guardarActualizarCambiosDesagregado(cambio = false) {
    if (!this.equipoEditado) {
      this.toaster.info(
        'Ningun cambio realizado',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return
    }
    try {
      if (this.tiempos.invalid) {
        if (!cambio) {
          this.tiempos.markAllAsTouched()
          this.toaster.error(
            'Datos horas laborados incorrecto',
            'Error',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        } else {
          this.equipoEditado = false
        }
        return
      }
      this.mostrar_carga_todo = true
      const fila = this.tablaPlanilla[this.selFilPlan]
      const data = this.formDesagregado.getRawValue()
      const horas_detalle_Array = this.tiempos.value.map(ele => (ele.inicio || ele.fechaInicio) + '|' + (ele.fin || ele.fechaFin) + '|' + ele.tiempo);
      const horas_detalle = horas_detalle_Array.join('/')
      let diaSeleccionado = null
      let row = null
      if (fila.tipo == 'H-M' || fila.tipo == 'DIA') {
        diaSeleccionado = this.calendarioFiltrado.dias[this.celdaSel[1]]
        row = this.tablaPlanilla[this.celdaSel[0]]
      } else if (fila.tipo == 'MES') {
        diaSeleccionado = this.calendarioFiltrado.dias[0]
        row = this.tablaPlanilla[this.selFilPlan]
      } else {
        diaSeleccionado = this.calendario[0].dias[0]
        row = this.tablaPlanilla[this.selFilPlan]
      }
      if ((horas_detalle || data.horas_dia)) {
        if (data.id_desagregado) {
          const obj = {
            id_desagregado: data.id_desagregado,
            id_proyecto: this.id_proyecto,
            id_equipo: row.id_equipo,
            fecha: diaSeleccionado.fecha,
           id_proveedor: null,
            horas_dia: data.horas_dia,
            minutos_dia: data.minutos_dia,
            costo_dia: data.coste_dia,
            horas_detalle: horas_detalle,
            observaciones: data.observaciones == null ? '' : data.observaciones,
          }
          const resp = await this.equiposServiciosService.actualizarDesagregadoEquipo(obj)
          if (resp[0]?.mensaje == '1') {
            // Actualizar la celda en la tabla
            if (fila.tipo == 'H-M' || fila.tipo == 'DIA') {
              this.tablaPlanilla[this.celdaSel[0]].planilla[this.celdaSel[1]] = obj
            } else if (fila.tipo == 'MES') {
              this.tablaPlanilla[this.selFilPlan].valorMensual = obj
              const arrayMes = await this.evaluarGlobalMes(obj?.horas_detalle, 'MES')
              this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
              const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
              this.tablaPlanilla[this.selFilPlan].total_hm = total
              this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
            } else {
              this.tablaPlanilla[this.selFilPlan].valorGlobal = obj
              const valorGlobal = obj
              const arrayMes = await this.evaluarGlobalMes(valorGlobal?.horas_detalle, 'GLOBAL')
              this.tablaPlanilla[this.selFilPlan].valorGlobal = valorGlobal
              this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
              const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
              this.tablaPlanilla[this.selFilPlan].total_hm = total
              this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
            }


            // Actualizar el elemento en el array desagregadosCompleto
            const array = this.tablaPlanilla[this.selFilPlan].desagregadosCompleto
            const indice = array.findIndex(ele => ele.id_desagregado === obj.id_desagregado) // CORREGIDO: ===
            if (indice !== -1) {
              array[indice] = obj
              // CORREGIDO: Asignar el array completo, no solo un elemento
              this.tablaPlanilla[this.selFilPlan].desagregadosCompleto = array
            }
            if (horas_detalle) {
              this.actualizarTiempoUtilizado(false);
            } else {
              this.calcularSaldo()
            }

            this.equipoEditado = false
            this.toaster.success(
              'Se realizo con exito',
              'Éxito',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
          } else {
            SwalService.error()
          }
        } else {
          const obj = {
            id_proyecto: this.id_proyecto,
            id_equipo: row.id_equipo,
            fecha: diaSeleccionado.fecha,
            // 🟢 Si es cadena vacía, pásalo a null para que .NET no falle al parsear int?
            id_proveedor: null,
            horas_dia: data.horas_dia,
            minutos_dia: data.minutos_dia,
            costo_dia: data.coste_dia,
            horas_detalle: horas_detalle,
            observaciones: data.observaciones ?? null
          };
          const resp = await this.equiposServiciosService.guardarDesagregadoEquipo(obj)

          if (resp[0]?.id_desagregado) {
            obj['id_desagregado'] = resp[0].id_desagregado

            if (fila.tipo == 'H-M' || fila.tipo == 'DIA') {
              this.tablaPlanilla[this.celdaSel[0]].planilla[this.celdaSel[1]] = obj
              this.tablaPlanilla[this.celdaSel[0]].desagregadosCompleto.push(obj)
              if (horas_detalle) {
                this.actualizarTiempoUtilizado();
              } else {
                this.calcularSaldo()
              }
            } else if (fila.tipo == 'MES') {
              this.tablaPlanilla[this.selFilPlan].valorMensual = obj
              const arrayMes = await this.evaluarGlobalMes(obj?.horas_detalle, 'MES')
              this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
              const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
              this.tablaPlanilla[this.selFilPlan].total_hm = total
              this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
              this.tablaPlanilla[this.selFilPlan].desagregadosCompleto.push(obj)
            } else {
              this.tablaPlanilla[this.selFilPlan].valorGlobal = obj
              const valorGlobal = obj
              const arrayMes = await this.evaluarGlobalMes(valorGlobal?.horas_detalle, 'GLOBAL')
              this.tablaPlanilla[this.selFilPlan].valorGlobal = valorGlobal
              this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
              const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
              this.tablaPlanilla[this.selFilPlan].total_hm = total
              this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
              this.tablaPlanilla[this.selFilPlan].desagregadosCompleto.push(obj)
            }

            this.id_desagregado.setValue(resp[0].id_desagregado)
            this.equipoEditado = false
            this.toaster.success(
              'Se realizo con exito',
              'Éxito',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
          } else {
            SwalService.error()
          }
        }
      } else {
        const obj = {
          id_desagregado: this.id_desagregado.value
        }
        const resp = await this.equiposServiciosService.eliminarDesagregadoEquipo(obj)

        if (resp[0].mensaje == '1') {
          while (this.tiempos.value.length) {
            this.tiempos.removeAt(0);
          }

          if (fila.tipo == 'H-M' || fila.tipo == 'DIA') {
            this.tablaPlanilla[this.celdaSel[0]].planilla[this.celdaSel[1]] = null
            this.tablaPlanilla[this.celdaSel[0]].desagregadosCompleto =
              this.tablaPlanilla[this.celdaSel[0]].desagregadosCompleto.filter(
                item => item.id_desagregado !== this.id_desagregado.value
              );
            let total = 0
            // this.tablaPlanilla[this.selFilPlan].desagregadosCompleto.map(ele => ele.horas_dia + total)
            this.tablaPlanilla[this.selFilPlan]?.desagregadosCompleto.forEach(ele => {
              total += Number(ele.horas_dia);
            });
            this.tiempo_utilizado.setValue(total)
          } else if (fila.tipo == 'MES') {
            this.tablaPlanilla[this.selFilPlan].valorMensual = null
            this.tablaPlanilla[this.selFilPlan].valorGlobal = null
            const arrayMes = await this.evaluarGlobalMes('', 'MES')
            this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
            const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
            this.tablaPlanilla[this.selFilPlan].total_hm = total
            this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
            this.tablaPlanilla[this.selFilPlan].desagregadosCompleto = []
            this.tiempo_utilizado.setValue(total)
          } else {
            this.tablaPlanilla[this.selFilPlan].valorMensual = null
            this.tablaPlanilla[this.selFilPlan].valorGlobal = null

            const arrayMes = await this.evaluarGlobalMes('', 'GLOBAL')
            this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
            const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
            this.tablaPlanilla[this.selFilPlan].total_hm = total
            this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
            this.tablaPlanilla[this.selFilPlan].desagregadosCompleto = []
            this.tiempo_utilizado.setValue(total)
          }


          this.id_desagregado.setValue('')

          const saldo = this.tiempo_programado.value - 0
          this.saldo_utilizar.setValue(saldo)
          this.minutos_dia.setValue('')
          this.horas_dia.setValue('')
          this.observaciones.setValue('')
          this.coste_dia.setValue('')
          this.equipoEditado = false
          this.toaster.success(
            'Se realizo con exito',
            'Éxito',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        }
      }
      this.mostrar_carga_todo = false

    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  crearFilaServicio(): FormGroup {

    const requerimiento = this.tablaRequerimientos[this.fila_requerimiento.value]
    const regAct = this.tablaRegActividades[this.filSelRegAct]
    const form = this.fb.group({
      item: ['E-' + requerimiento?.idfila],
      descripcion: [requerimiento?.descripcion || '', Validators.required],
      placa: [''],
      fecha_solicitud: [requerimiento?.fecha_sol],
      unidad: [requerimiento?.unidad],
      cantidad: [requerimiento?.cantidad, [Validators.required]],
      precio_unitario: [requerimiento?.precio, [Validators.required]],
      parcial: [0, [Validators.required]],
      estado: [1],
      index_grupo: [0],
      id_grupo: [0],
      id_equipo: [null],
      id_registro: [requerimiento?.id_registro],
      id_fila: [requerimiento?.idfila],
      ind_rep: [requerimiento?.indrep],
      index_elemento: [this.equipos.length],
      id_proyecto: [this.id_proyecto],
      tipo_registro: ['ALQUILADO'],
      tipo: [{
        value: 'H-M',
        disabled: false
      }],
      nroprov: [regAct?.nroprov],
      desagregadosCompleto: [[]],
      tiempo_registrado: [0],
      total_registrado: [0]
    });
    return form

  }

  agregarFila() {
    const nuevaFila = this.crearFilaServicio();
    this.equipos.push(nuevaFila);



  }
  // Eliminar fila
  eliminarFilaModal(index: number, row) {
    if (row.desagredados?.length) {
      this.toaster.error(
        'El equipo tiene registros en planilla, elimine todos los registro en planilla para poder eliminar',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return
    }
    if (this.actualizarEquipos) {
      const id = this.equipos.value[index].id_equipo
      if (!this.idEquiposEliminar.includes(id)) {
        this.idEquiposEliminar.push(id)
      }
    }

    this.equipos.removeAt(index);

    this.reordenarPorGrupo();
  }

  reordenarPorGrupo() {
    const valores = this.equipos.value;

    const grupos = {};

    for (let i = 0; i < valores.length; i++) {
      const grupo = valores[i].index_grupo;
      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }
      grupos[grupo].push({ index: i, valor: valores[i] });
    }

    for (let grupo in grupos) {
      const elementos = grupos[grupo];
      elementos.sort((a, b) => (a.valor.index_elemento || 0) - (b.valor.index_elemento || 0));

      for (let j = 0; j < elementos.length; j++) {
        this.equipos.at(elementos[j].index).patchValue({
          index_elemento: j + 1  // Empieza en 1
        });
      }
    }
  }

  async seleccionFilaPlanrow(row, i) {
    if (this.evitandoDobleEjecucion) {
      return;
    }

    if (this.selFilPlan == i) {
      return
    }
    if (this.equipoEditado && (row.tipo == 'GLOBAL' || row.tipo == 'MES')) {
      this.evitandoDobleEjecucion = true;
      await this.guardarActualizarCambiosDesagregado(true);
      this.evitandoDobleEjecucion = false;
    }
    this.celdaSel = [null, null]
    this.buscando = true
    this.detalleMensual = []
    this.acumuladoCantidades = [];
    this.acumuladoParciales = [];
    this.resumenPorAnio = [];
    row.item !== 0 ? this.selFilPlan = i : null
    this.formDesagregado.reset()
    while (this.tiempos.value.length) {
      this.tiempos.removeAt(0);
    }
    this.tipoSeleccionado = row.tipo
    if (row.tipo == 'GLOBAL') {
      // this.observaciones.enable()
      this.coste_unitario.setValue(this.tablaPlanilla[i].precio_unitario)
      this.unidad.setValue(this.tablaPlanilla[i].unidad)
      this.tiempo_programado.setValue(this.tablaPlanilla[i].cantidad)
      const dataDiaEquipo = row.valorGlobal

      if (dataDiaEquipo) {
        // Si existe, asignamos los valores
        this.id_desagregado.setValue(dataDiaEquipo.id_desagregado)
        this.horas_dia.setValue(dataDiaEquipo.horas_dia)
        this.minutos_dia.setValue(dataDiaEquipo.minutos_dia)
        this.observaciones.setValue(dataDiaEquipo.observaciones)
        this.coste_dia.setValue(dataDiaEquipo.costo_dia)
        const tiempos = dataDiaEquipo.horas_detalle
        if (tiempos) {
          const esFecha = this.tipoSeleccionado === 'MES' || this.tipoSeleccionado === 'GLOBAL';

          // Separar por '/' para obtener cada fila
          const filas = dataDiaEquipo.horas_detalle.split('/');

          filas.forEach((fila: string) => {
            // Separar por '|' para obtener inicio y fin
            const [valor1, valor2, valor3] = fila.split('|');

            // Crear el grupo según el tipo
            const grupoControles: any = {
              tiempo: [0]
            };

            if (esFecha) {
              grupoControles.fechaInicio = [valor1 || '', Validators.required];
              grupoControles.fechaFin = [valor2 || '', Validators.required];
            } else {
              grupoControles.inicio = [valor1 || '', Validators.required];
              grupoControles.fin = [valor2 || '', Validators.required];
            }
            grupoControles.tiempo = [valor3 || 0];
            const nuevoGrupo = this.fb.group(grupoControles, {
              validators: [this.validarFila.bind(this)]
            });

            this.tiempos.push(nuevoGrupo);
          });
          if (this.tiempos.value.length) {
            this.actualizarTiempoUtilizado(false);
          } else {
            this.calcularSaldo()
          }
          this.equipoEditado = false
        }
      } else {
        // Si no existe, limpiamos o asignamos valores por defecto
        this.id_desagregado.setValue(null)
        this.horas_dia.setValue(0)
        this.minutos_dia.setValue(0)
        this.observaciones.setValue('')
        this.coste_dia.setValue(0)
      }

      // El cálculo del total siempre se hace (no depende de dataDiaEquipo)
      let total = 0
      this.tablaPlanilla[i].desagregadosCompleto.forEach(ele => {
        total += Number(ele?.horas_dia || 0);
      });
      this.tiempo_utilizado.setValue(total)

      // Aquí también validamos tiempo_programado
      const saldo = (this.tiempo_programado?.value || 0) - total
      this.saldo_utilizar.setValue(saldo)
    } else if (row.tipo == 'DIA') {
      this.horas_dia.disable()

    } else if (row.tipo == 'MES') {
      const dataDiaEquipo = row.valorMensual
      this.coste_unitario.setValue(this.tablaPlanilla[i].precio_unitario)
      this.unidad.setValue(this.tablaPlanilla[i].unidad)
      this.tiempo_programado.setValue(this.tablaPlanilla[i].cantidad)
      if (dataDiaEquipo) {
        // Si existe, asignamos los valores
        this.id_desagregado.setValue(dataDiaEquipo.id_desagregado)
        this.horas_dia.setValue(dataDiaEquipo.horas_dia)
        this.minutos_dia.setValue(dataDiaEquipo.minutos_dia)
        this.observaciones.setValue(dataDiaEquipo.observaciones)
        this.coste_dia.setValue(dataDiaEquipo.costo_dia)
        const tiempos = dataDiaEquipo.horas_detalle
        if (tiempos) {
          const esFecha = this.tipoSeleccionado === 'MES';

          // Separar por '/' para obtener cada fila
          const filas = dataDiaEquipo.horas_detalle.split('/');

          filas.forEach((fila: string) => {
            // Separar por '|' para obtener inicio y fin
            const [valor1, valor2, valor3] = fila.split('|');

            // Crear el grupo según el tipo
            const grupoControles: any = {
              tiempo: [0]
            };

            if (esFecha) {
              grupoControles.fechaInicio = [valor1 || '', Validators.required];
              grupoControles.fechaFin = [valor2 || '', Validators.required];
            } else {
              grupoControles.inicio = [valor1 || '', Validators.required];
              grupoControles.fin = [valor2 || '', Validators.required];
            }
            grupoControles.tiempo = [valor3 || 0];
            const nuevoGrupo = this.fb.group(grupoControles, {
              validators: [this.validarFila.bind(this)]
            });

            this.tiempos.push(nuevoGrupo);
          });
          if (this.tiempos.value.length) {
            this.actualizarTiempoUtilizado(false);
          } else {
            this.calcularSaldo()
          }
        }
      } else {
        // Si no existe, limpiamos o asignamos valores por defecto
        this.id_desagregado.setValue(null)
        this.horas_dia.setValue(0)
        this.minutos_dia.setValue(0)
        this.observaciones.setValue('')
        this.coste_dia.setValue(0)
      }

      // El cálculo del total siempre se hace (no depende de dataDiaEquipo)
      let total = 0
      this.tablaPlanilla[i].desagregadosCompleto.forEach(ele => {
        total += Number(ele?.horas_dia || 0);
      });
      this.tiempo_utilizado.setValue(total)

      // Aquí también validamos tiempo_programado
      const saldo = (this.tiempo_programado?.value || 0) - total
      this.saldo_utilizar.setValue(saldo)

    }
    if (this.selFilPlan !== null) {
      await this.cambioDetalle()
    }
    if (this.tiempos.value.length) {
      this.observaciones.enable()
    }
    this.buscando = false
  }

  procesarEquipoPorMes(equipo, mesesCalendario) {
    // Primero, obtener los resultados de los registros existentes
    const resultadosConDatos = [];
    const precio = equipo.precio_unitario;
    const tipo = equipo.tipo;

    // Obtener los desagregados
    const desagregados = equipo.desagregadosCompleto || equipo.desagregados || [];

    desagregados.forEach((desag, idx) => {
      if (tipo === 'H-M' || tipo === 'DIA') {
        // Caso 1: Registros individuales por fecha
        if (desag.fecha) {
          const fecha = new Date(desag.fecha);
          const anio = fecha.getFullYear();
          const mes = fecha.getMonth() + 1;
          const cantidad = desag.horas_dia || 0;

          if (cantidad > 0) {
            resultadosConDatos.push({
              mes: this.obtenerNombreMes(mes),
              anio: anio,
              mes_numero: mes,
              cantidad: cantidad,
              precio_unitario: precio,
              parcial: cantidad * precio,
              registros: [{
                id: desag.id_desagregado,
                fecha: desag.fecha,
                valor: cantidad
              }]
            });
          }
        }
      }
      else if (tipo === 'MES' || tipo === 'GLOBAL') {
        // Caso 2: Periodos (pueden tener múltiples rangos)
        if (desag.horas_detalle) {
          const periodos = desag.horas_detalle.split('/');

          periodos.forEach(periodo => {
            const [inicio, fin, cantidad] = periodo.split('|');
            const cant = parseFloat(cantidad);

            if (cant > 0) {
              const fechaInicio = new Date(inicio);
              const fechaFin = new Date(fin);
              const mesesCubiertos = [];

              // Obtener todos los meses entre inicio y fin
              let current = new Date(fechaInicio);
              current.setDate(1);
              let end = new Date(fechaFin);
              end.setDate(1);

              while (current <= end) {
                mesesCubiertos.push({
                  anio: current.getFullYear(),
                  mes: current.getMonth() + 1
                });
                current.setMonth(current.getMonth() + 1);
              }

              // Agregar el periodo a cada mes
              mesesCubiertos.forEach(m => {
                resultadosConDatos.push({
                  mes: this.obtenerNombreMes(m.mes),
                  anio: m.anio,
                  mes_numero: m.mes,
                  cantidad: cant,
                  precio_unitario: precio,
                  parcial: cant * precio,
                  registros: [{
                    id: desag.id_desagregado,
                    periodo: `${inicio} al ${fin}`,
                    valor: cant
                  }]
                });
              });
            }
          });
        }
      }
    });

    // Agrupar los resultados con datos
    const datosAgrupados = {};
    resultadosConDatos.forEach(r => {
      const key = `${r.anio}-${r.mes_numero}`;
      if (!datosAgrupados[key]) {
        datosAgrupados[key] = {
          mes: r.mes,
          anio: r.anio,
          mes_numero: r.mes_numero,
          cantidad: 0,
          precio_unitario: r.precio_unitario,
          parcial: 0,
          registros: []
        };
      }
      datosAgrupados[key].cantidad += r.cantidad;
      datosAgrupados[key].parcial += r.parcial;
      datosAgrupados[key].registros.push(...r.registros);
    });

    // Crear array con todos los meses del calendario
    const todosLosMeses = [];

    mesesCalendario.forEach(mesCalendario => {
      const key = `${mesCalendario.anio}-${mesCalendario.mes}`;
      const datosExistentes = datosAgrupados[key];

      todosLosMeses.push({
        mes: mesCalendario.mes_nombre.toUpperCase(),
        anio: mesCalendario.anio,
        mes_numero: mesCalendario.mes,
        cantidad: datosExistentes ? datosExistentes.cantidad : 0,
        precio_unitario: precio,
        parcial: datosExistentes ? datosExistentes.parcial : 0,
        registros: datosExistentes ? datosExistentes.registros : [],
        tiene_datos: !!datosExistentes,
        mes_display: mesCalendario.mes_display
      });
    });

    // Ordenar por año y mes
    const resultado = todosLosMeses.sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      return a.mes_numero - b.mes_numero;
    });

    // Asignar a detalleMensual
    this.detalleMensual = resultado;
    this.recalcularAcumuladosYResumen();
    return resultado;
  }

  recalcularAcumuladosYResumen() {
    // Recalcular acumulados mensuales
    this.acumuladoCantidades = [];
    this.acumuladoParciales = [];

    let acumCantidad = 0;
    let acumParcial = 0;

    for (let i = 0; i < this.detalleMensual.length; i++) {
      acumCantidad += this.detalleMensual[i].cantidad;
      acumParcial += this.detalleMensual[i].parcial;

      this.acumuladoCantidades[i] = acumCantidad;
      this.acumuladoParciales[i] = acumParcial;
    }

    // Recalcular resumen por año
    this.calcularResumenPorAnio();
  }

  calcularResumenPorAnio() {
    const resumenMap = new Map<number, { cantidad: number, parcial: number }>();

    this.detalleMensual.forEach(mes => {
      const anio = mes.anio;
      if (!resumenMap.has(anio)) {
        resumenMap.set(anio, { cantidad: 0, parcial: 0 });
      }
      const anioData = resumenMap.get(anio);
      anioData.cantidad += mes.cantidad;
      anioData.parcial += mes.parcial;
    });

    // Convertir a array y ordenar por año
    this.resumenPorAnio = Array.from(resumenMap.entries())
      .map(([anio, data]) => ({
        anio: anio,
        cantidad_total: data.cantidad,
        parcial_total: data.parcial
      }))
      .sort((a, b) => a.anio - b.anio);
  }

  // Función auxiliar
  obtenerNombreMes(mes) {
    const nombres = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    return nombres[mes - 1];
  }

  async cambioDetalle() {
    if (this.selFilPlan == null) {
      return
    }
    this.buscando = true
    const row = this.tablaPlanilla[this.selFilPlan]
    if (this.verDetalle == 'desagregado') {
      if (row.nroprov) {
        const obj = {
          id_proyecto: row.id_proyecto,
          id_registro: row.id_registro,
          idgrupo: row.id_grupo,
          idfila: row.id_fila,
          id_usuario: Number(this.iduser_local),
          nroprov: row.nroprov
        }
        const dataProveedor = await this.equiposServiciosService.recuperarProveedor(obj)
        const datosCombinados = dataProveedor[0][0] || [];
        const proveedorData = dataProveedor[1][0] || {}; // Primer fila de los datos
        const orden = 'Orden de Atención OC - ' + datosCombinados.nro_orden
        this.ordenServicio.setValue(orden)
        this.proveedor.setValue(proveedorData.nombre_proveedor || proveedorData.razon)
        this.telefono.setValue(proveedorData.telefono_proveedor || proveedorData.telefono)
        this.correo.setValue(proveedorData.correo_proveedor || proveedorData.correo)

        let total = 0
        this.tablaPlanilla[this.selFilPlan]?.desagregadosCompleto.forEach(ele => {
          total += Number(ele.horas_dia);
        });
        this.tiempo_utilizado.setValue(total)
        const saldo = this.tiempo_programado.value - total
        this.saldo_utilizar.setValue(saldo)
      } else {

      }
    } else if (this.verDetalle == 'mensual') {

      this.detalleMensual = await this.procesarEquipoPorMes(row, this.calendario);

    } else {

    }
    this.buscando = false
  }


  calcularAcumuladoCantidad(indice: number): number {
    let acumulado = 0;
    for (let i = 0; i <= indice; i++) {
      acumulado += this.detalleMensual[i]?.cantidad || 0;
    }
    return acumulado;
  }

  // Método para calcular acumulado de parcial
  calcularAcumuladoParcial(indice: number): number {
    let acumulado = 0;
    for (let i = 0; i <= indice; i++) {
      acumulado += this.detalleMensual[i]?.parcial || 0;
    }
    return acumulado;
  }

  // Obtener fecha mínima del mes actual
  obtenerMinFechaMes(): string {
    if (this.calendarioFiltrado && this.calendarioFiltrado.dias && this.calendarioFiltrado.dias.length > 0) {
      return this.calendarioFiltrado.dias[0].fecha;
    }
    return '';
  }

  // Obtener fecha máxima del mes actual
  obtenerMaxFechaMes(): string {
    if (this.calendarioFiltrado && this.calendarioFiltrado.dias && this.calendarioFiltrado.dias.length > 0) {
      return this.calendarioFiltrado.dias[this.calendarioFiltrado.dias.length - 1].fecha;
    }
    return '';
  }



  validarFechasPeriodo(index: number) {
    const tiempoGroup = this.tiempos.at(index) as FormGroup;
    const ctrlIni = tiempoGroup.get('fechaInicio');
    const ctrlFin = tiempoGroup.get('fechaFin');
    const tipoPeriodo = this.tipoSeleccionado;
    // Resetear errores del grupo
    tiempoGroup.setErrors(null);

    if (ctrlIni?.value && ctrlFin?.value) {
      const inicio = new Date(ctrlIni.value + 'T00:00:00');
      const fin = new Date(ctrlFin.value + 'T00:00:00');

      let errores: any = null;

      // Validar que las fechas estén dentro del rango permitido según el tipo
      if (tipoPeriodo === 'GLOBAL') {
        const minFecha = this.obtenerMinFechaGlobal();
        const maxFecha = this.obtenerMaxFechaGlobal();
        if (minFecha && maxFecha) {
          const fechaMin = new Date(minFecha + 'T00:00:00');
          const fechaMax = new Date(maxFecha + 'T00:00:00');

          if (inicio < fechaMin || fin > fechaMax) {
            errores = { fechaFueraDeRango: true };
          }
        }
      } else if (tipoPeriodo === 'MES') {
        // Validar dentro del mes actual
        const minFecha = this.obtenerMinFechaMes();
        const maxFecha = this.obtenerMaxFechaMes();
        if (minFecha && maxFecha) {
          const fechaMin = new Date(minFecha + 'T00:00:00');
          const fechaMax = new Date(maxFecha + 'T00:00:00');

          if (inicio < fechaMin || fin > fechaMax) {
            errores = { fechaFueraDeRango: true };
          }
        }
      }

      // Si ya hay error de rango, no continuar
      if (errores) {
        tiempoGroup.setErrors(errores);
        ctrlIni.markAsTouched();
        ctrlFin.markAsTouched();
        return;
      }

      // Validar que inicio no sea mayor que fin
      if (inicio > fin) {
        errores = { fechaInvalida: true };
      }
      // Validar solapamiento
      else if (this.haySolapamiento(inicio, fin, index)) {
        errores = { solapamiento: true };
      }

      if (errores) {
        // ASIGNAR EL ERROR AL GRUPO
        tiempoGroup.setErrors(errores);
        // FORZAR QUE EL CONTROL SEPA QUE ESTÁ MAL
        ctrlIni.markAsTouched();
        ctrlFin.markAsTouched();
      } else {
        this.calcularDiasPeriodo(tiempoGroup);
      }
    }
    if (this.tiempos.value.length) {
      this.actualizarTiempoUtilizado();
    } else {
      this.calcularSaldo();
    }
  }

  // Calcular días del período
  calcularDiasPeriodo(tiempoGroup: FormGroup): any {
    const fechaInicio = tiempoGroup.get('fechaInicio')?.value;
    const fechaFin = tiempoGroup.get('fechaFin')?.value;

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
      tiempoGroup.get('tiempo')?.setValue(diffDays);
      return diffDays;
    }
    return '';
  }

  // Obtener meses disponibles para GLOBAL (mayores o iguales al mes inicio)
  obtenerMesesDisponibles(index: number): any[] {
    const tiempoGroup = this.tiempos.at(index) as FormGroup;
    const mesInicio = tiempoGroup.get('mesInicio')?.value;

    if (!mesInicio) return this.calendarioFiltrado;

    const [anioInicio, mesInicioNum] = mesInicio.split('-').map(Number);

    return this.calendarioFiltrado.filter(mes => {
      return mes.anio > anioInicio ||
        (mes.anio === anioInicio && mes.mes >= mesInicioNum);
    });
  }

  // Validar meses para GLOBAL
  validarMesesGlobal(index: number) {
    const tiempoGroup = this.tiempos.at(index) as FormGroup;
    const mesInicio = tiempoGroup.get('mesInicio')?.value;
    const mesFin = tiempoGroup.get('mesFin')?.value;

    if (mesInicio && mesFin) {
      const [anioInicio, mesInicioNum] = mesInicio.split('-').map(Number);
      const [anioFin, mesFinNum] = mesFin.split('-').map(Number);

      // Validar que mesFin >= mesInicio
      if (anioFin < anioInicio || (anioFin === anioInicio && mesFinNum < mesInicioNum)) {
        tiempoGroup.setErrors({ fechaInvalida: true });
      } else {
        // this.calcularMesesGlobal(tiempoGroup);
      }
    }
  }

  agregarTiempo() {
    let nuevoGrupo: FormGroup;

    switch (this.tipoSeleccionado) {
      case 'MES':
      case 'GLOBAL':
        nuevoGrupo = this.fb.group({
          fechaInicio: ['', Validators.required],
          fechaFin: ['', Validators.required],
          tiempo: [0]
        }, { validators: [this.validarFila.bind(this)] }); // <-- Validador de grupo
        break;

      default: // H-M y DIA
        nuevoGrupo = this.fb.group({
          inicio: ['', Validators.required],
          fin: ['', Validators.required],
          tiempo: [0]
        }, { validators: [this.validarFila.bind(this)] }); // <-- Validador de grupo
    }

    this.tiempos.push(nuevoGrupo);
    this.actualizarTiempoUtilizado();
    if (this.tiempos.value.length) {
      this.observaciones.enable()
    }
  }

  validarFila(group: AbstractControl): ValidationErrors | null {
    const g = group as FormGroup;
    const tipo = this.tipoSeleccionado;

    // Extraer valores según el tipo
    const inicio = (tipo === 'MES' || tipo === 'GLOBAL') ? g.get('fechaInicio')?.value : g.get('inicio')?.value;
    const fin = (tipo === 'MES' || tipo === 'GLOBAL') ? g.get('fechaFin')?.value : g.get('fin')?.value;

    if (!inicio || !fin) return null;

    // Lógica para H-M y DIA (Horas)
    if (tipo !== 'MES' && tipo !== 'GLOBAL') {
      const toMin = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const nIni = toMin(inicio);
      const nFin = toMin(fin);

      if (nIni >= nFin) return { inicioMayor: true };

      // Buscar solapamiento en el array
      const indexActual = this.tiempos.controls.findIndex(c => c === g);
      const hayChoque = this.tiempos.controls.some((control, i) => {
        if (i === indexActual) return false;
        const fI = control.get('inicio')?.value;
        const fF = control.get('fin')?.value;
        if (fI && fF) {
          const eIni = toMin(fI);
          const eFin = toMin(fF);
          return nIni < eFin && nFin > eIni;
        }
        return false;
      });

      return hayChoque ? { solapamiento: true } : null;
    }

    // Lógica para MES y GLOBAL (Fechas)
    const dIni = new Date(inicio).getTime();
    const dFin = new Date(fin).getTime();

    if (dIni >= dFin) return { fechaInvalida: true };

    return null;
  }
  // Establecer valores por defecto que no se solapen con períodos existentes
  establecerValoresPorDefectoSinSolapamiento(nuevoGrupo: FormGroup) {
    if (this.tiempos.length === 0) {
      // Si no hay períodos, usar el primer día disponible
      const minFecha = this.tipoSeleccionado === 'MES'
        ? this.obtenerMinFechaMes()
        : this.obtenerMinFechaGlobal();

      if (minFecha) {
        nuevoGrupo.patchValue({
          fechaInicio: minFecha,
          fechaFin: minFecha
        });
      }
    } else {
      // Buscar el primer espacio disponible sin solapamiento
      const fechasOcupadas = this.obtenerFechasOcupadas();
      const fechaLibre = this.encontrarPrimeraFechaLibre(fechasOcupadas);

      if (fechaLibre) {
        nuevoGrupo.patchValue({
          fechaInicio: fechaLibre,
          fechaFin: fechaLibre
        });
      }
    }
  }

  // Obtener todas las fechas ocupadas
  obtenerFechasOcupadas(): { inicio: Date, fin: Date }[] {
    const fechas: { inicio: Date, fin: Date }[] = [];

    for (let i = 0; i < this.tiempos.length; i++) {
      const tiempoGroup = this.tiempos.at(i) as FormGroup;
      const fechaInicio = tiempoGroup.get('fechaInicio')?.value;
      const fechaFin = tiempoGroup.get('fechaFin')?.value;

      if (fechaInicio && fechaFin) {
        fechas.push({
          inicio: new Date(fechaInicio),
          fin: new Date(fechaFin)
        });
      }
    }

    // Ordenar por fecha de inicio
    return fechas.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }

  // Encontrar la primera fecha libre disponible
  encontrarPrimeraFechaLibre(fechasOcupadas: { inicio: Date, fin: Date }[]): string | null {
    const minFecha = new Date(this.tipoSeleccionado === 'MES'
      ? this.obtenerMinFechaMes()
      : this.obtenerMinFechaGlobal());

    if (fechasOcupadas.length === 0) {
      return this.formatearFecha(minFecha);
    }

    // Verificar si hay espacio antes del primer período
    const primerPeriodo = fechasOcupadas[0];
    if (minFecha < primerPeriodo.inicio) {
      return this.formatearFecha(minFecha);
    }

    // Buscar espacios entre períodos
    for (let i = 0; i < fechasOcupadas.length - 1; i++) {
      const finActual = fechasOcupadas[i].fin;
      const inicioSiguiente = fechasOcupadas[i + 1].inicio;

      // Sumar un día al finActual para encontrar el siguiente día disponible
      const diaSiguiente = new Date(finActual);
      diaSiguiente.setDate(diaSiguiente.getDate() + 1);

      if (diaSiguiente < inicioSiguiente) {
        return this.formatearFecha(diaSiguiente);
      }
    }

    // Si no hay espacio, usar el día después del último período
    const ultimoPeriodo = fechasOcupadas[fechasOcupadas.length - 1];
    const diaSiguiente = new Date(ultimoPeriodo.fin);
    diaSiguiente.setDate(diaSiguiente.getDate() + 1);

    const maxFecha = new Date(this.tipoSeleccionado === 'MES'
      ? this.obtenerMaxFechaMes()
      : this.obtenerMaxFechaGlobal());

    if (diaSiguiente <= maxFecha) {
      return this.formatearFecha(diaSiguiente);
    }

    return null; // No hay fechas libres
  }

  // Formatear fecha para input type date
  formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  // Obtener fecha mínima para GLOBAL (primer día del calendario completo)
  obtenerMinFechaGlobal(): string {
    if (this.calendario && this.calendario.length > 0) {
      // Tomar el primer mes del calendario completo
      const primerMes = this.calendario[0];
      // El primer día siempre es el 1 del mes
      return `${primerMes.anio}-${String(primerMes.mes).padStart(2, '0')}-01`;
    }
    return '';
  }

  // Obtener fecha máxima para GLOBAL (último día del calendario completo)
  obtenerMaxFechaGlobal(): string {
    if (this.calendario && this.calendario.length > 0) {
      // Tomar el último mes del calendario completo
      const ultimoMes = this.calendario[this.calendario.length - 1];
      // Obtener el último día del mes usando el array de días
      if (ultimoMes.dias && ultimoMes.dias.length > 0) {
        // Tomar la última fecha del array de días
        return ultimoMes.dias[ultimoMes.dias.length - 1].fecha;
      }
      // Fallback: calcular el último día del mes
      const ultimoDia = new Date(ultimoMes.anio, ultimoMes.mes, 0).getDate();
      return `${ultimoMes.anio}-${String(ultimoMes.mes).padStart(2, '0')}-${ultimoDia}`;
    }
    return '';
  }

  // Validar fechas para GLOBAL
  validarFechasGlobal(index: number) {
    const tiempoGroup = this.tiempos.at(index) as FormGroup;
    const fechaInicio = tiempoGroup.get('fechaInicio')?.value;
    const fechaFin = tiempoGroup.get('fechaFin')?.value;

    // Limpiar errores previos
    delete tiempoGroup.errors?.['fechaInvalida'];
    delete tiempoGroup.errors?.['fechaFueraRango'];
    delete tiempoGroup.errors?.['solapamiento'];

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      // Validar que fechaInicio <= fechaFin
      if (inicio > fin) {
        tiempoGroup.setErrors({ fechaInvalida: true });
        return;
      }

      // Validar que estén dentro del rango global
      const minFecha = new Date(this.obtenerMinFechaGlobal());
      const maxFecha = new Date(this.obtenerMaxFechaGlobal());

      if (inicio < minFecha || fin > maxFecha) {
        tiempoGroup.setErrors({ fechaFueraRango: true });
        return;
      }

      // Validar que no haya solapamiento con otros períodos
      if (this.haySolapamiento(inicio, fin, index)) {
        tiempoGroup.setErrors({ solapamiento: true });
        return;
      }
    }

    // this.calcularMesesGlobal(tiempoGroup);
  }

  // Modificar calcularMesesGlobal para trabajar con fechas
  calcularMesesGlobal(tiempoGroup: FormGroup): string {
    const fechaInicio = tiempoGroup.get('fechaInicio')?.value;
    const fechaFin = tiempoGroup.get('fechaFin')?.value;

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      // Calcular diferencia en meses
      const añosDiff = fin.getFullYear() - inicio.getFullYear();
      const mesesDiff = fin.getMonth() - inicio.getMonth();
      const totalMeses = añosDiff * 12 + mesesDiff + 1; // +1 para incluir ambos meses

      tiempoGroup.get('tiempo')?.setValue(totalMeses);
      return totalMeses + (totalMeses === 1 ? ' mes' : ' meses');
    }
    return '';
  }

  haySolapamiento(nuevoInicio: Date, nuevoFin: Date, indexActual: number): boolean {
    const nIni = nuevoInicio.getTime();
    const nFin = nuevoFin.getTime();

    return this.tiempos.controls.some((control, i) => {
      if (i === indexActual) return false;

      const fI = control.get('fechaInicio')?.value;
      const fF = control.get('fechaFin')?.value;

      if (fI && fF) {
        const eIni = new Date(fI + 'T00:00:00').getTime();
        const eFin = new Date(fF + 'T00:00:00').getTime();
        // Un rango choca con otro si el inicio de uno es menor al fin del otro y viceversa
        return nIni <= eFin && nFin >= eIni;
      }
      return false;
    });
  }

  haySolapamientoHorario(nuevoInicio: string, nuevoFin: string, indexActual: number): boolean {
    if (!nuevoInicio || !nuevoFin) return false;

    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const nIni = toMin(nuevoInicio);
    const nFin = toMin(nuevoFin);

    const a = this.tiempos.controls.some((control, i) => {
      if (i === indexActual) return false;

      const fI = control.get('inicio')?.value;
      const fF = control.get('fin')?.value;

      if (fI && fF) {
        const eIni = toMin(fI);
        const eFin = toMin(fF);

        // LOG DE DEPURACIÓN: Verás esto en la consola

        // Lógica de solapamiento estricta:
        const solapa = nIni < eFin && nFin > eIni;
        // if (solapa) console.log('¡SOLAPAMIENTO DETECTADO!');

        return solapa;
      }
      return false;
    });

    return a
  }

  mostrarError(tiempo: FormGroup, campo: string): boolean {
    const control = tiempo.get(campo);
    if (!control) return false;

    // Si el grupo (fila) tiene error de solapamiento o inicioMayor, el input es inválido
    const tieneErrorGrupo = tiempo.hasError('solapamiento') || tiempo.hasError('inicioMayor');

    // El control debe estar 'touched' o 'dirty' para mostrar el rojo (evita que todo esté rojo al cargar)
    const haSidoTocado = control.touched || control.dirty;

    return (control.invalid && haSidoTocado) || (tieneErrorGrupo && haSidoTocado);
  }

  async eliminarDesagregado() {
    try {
      this.mostrar_carga_todo = true
      const equipo = this.tablaPlanilla[this.celdaSel[0]]
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà registro seleccionado al equipo')
      if (sw.isConfirmed) {
        const obj = {
          id_desagregado: this.id_desagregado.value
        }
        const resp = await this.equiposServiciosService.eliminarDesagregadoEquipo(obj)
        if (resp[0].mensaje == '1') {
          while (this.tiempos.value.length) {
            this.tiempos.removeAt(0);
          }
          this.tablaPlanilla[this.celdaSel[0]].planilla[this.celdaSel[1]] = null
          this.tablaPlanilla[this.celdaSel[0]].desagregadosCompleto =
            this.tablaPlanilla[this.celdaSel[0]].desagregadosCompleto.filter(
              item => item.id_desagregado !== this.id_desagregado.value
            );
          let total = 0
          // this.tablaPlanilla[this.selFilPlan].desagregadosCompleto.map(ele => ele.horas_dia + total)
          this.tablaPlanilla[this.selFilPlan]?.desagregadosCompleto.forEach(ele => {
            total += Number(ele.horas_dia);
          });
          this.id_desagregado.setValue('')
          this.tiempo_utilizado.setValue(total)
          const saldo = this.tiempo_programado.value - 0
          this.saldo_utilizar.setValue(saldo)
          this.minutos_dia.setValue('')
          this.horas_dia.setValue('')
          this.observaciones.setValue('')
          this.coste_dia.setValue('')
          this.equipoEditado = false
        }
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      SwalService.error()
      console.log(error)
    }

  }


  async actualizarDataCompleta() {

    const i = this.filSelRegAct
    this.filSelRegAct = null
    const tablaRegActividades = this.tablaRegActividades.map(element => {
      element.servicios = this.tablaServiciosCompleto.filter(ele => ele.id_grupo == Number(element.idgrupo) && ele.id_registro == element.id_registro)
      return element
    })
    this.tablaRegActividades = await this.procesarCantidadAcumulada(tablaRegActividades)
    const row = this.tablaRegActividades[i]

    await this.selTablaRegAct(row, i)
    await this.calcularTotales()
  }

  // Método para toggle ON (mostrar elementos)
  toggleOn(row, indice) {
    if (row.icomost === '0') {
      // Cambiar el icono de la cabecera actual
      row.icomost = '1';
      // Mostrar todos los elementos del grupo
      this.mostrarElementosDelGrupo(indice);
    }
  }

  // Método para toggle OFF (ocultar elementos)
  toggleOff(row, indice) {
    if (row.icomost === '1') {
      // Cambiar el icono de la cabecera actual
      row.icomost = '0';
      // Ocultar todos los elementos del grupo
      this.ocultarElementosDelGrupo(indice);
    }
  }

  // Mostrar elementos del grupo
  mostrarElementosDelGrupo(cabeceraIndex) {
    // Buscar la siguiente cabecera
    const siguienteCabeceraIndex = this.tablaServicios.findIndex(
      (item, index) => index > cabeceraIndex && item.index_elemento === 0
    );

    const limite = siguienteCabeceraIndex !== -1 ? siguienteCabeceraIndex : this.tablaServicios.length;

    // Mostrar todos los elementos entre la cabecera actual y la siguiente cabecera
    for (let i = cabeceraIndex + 1; i < limite; i++) {
      this.tablaServicios[i].visible = true;
    }
  }

  // Ocultar elementos del grupo
  ocultarElementosDelGrupo(cabeceraIndex) {
    // Buscar la siguiente cabecera
    const siguienteCabeceraIndex = this.tablaServicios.findIndex(
      (item, index) => index > cabeceraIndex && item.index_elemento === 0
    );

    const limite = siguienteCabeceraIndex !== -1 ? siguienteCabeceraIndex : this.tablaServicios.length;

    // Ocultar todos los elementos entre la cabecera actual y la siguiente cabecera
    for (let i = cabeceraIndex + 1; i < limite; i++) {
      this.tablaServicios[i].visible = false;
    }
  }

  // Método toggle que alterna entre expandir y contraer
  toggleTodo() {
    if (this.todosExpandidos) {
      this.contraerTodo();
    } else {
      this.expandirTodo();
    }
  }
  // Expandir todos los grupos (usando métodos existentes)
  expandirTodo() {
    this.tablaServicios.forEach((item, index) => {
      if (item.index_elemento === 0) {
        item.icomost = '1';
        this.mostrarElementosDelGrupo(index);
      }
    });
    this.todosExpandidos = true;
  }

  // Contraer todos los grupos (usando métodos existentes)
  contraerTodo() {
    this.tablaServicios.forEach((item, index) => {
      if (item.index_elemento === 0) {
        item.icomost = '0';
        this.ocultarElementosDelGrupo(index);
      }
    });
    this.todosExpandidos = false;
  }

  // Métodos para la nueva tabla
  toggleOnNueva(row, indice) {
    if (row.icomost === '0') {
      row.icomost = '1';
      this.mostrarElementosDelGrupoNueva(indice);
    }
  }

  toggleOffNueva(row, indice) {
    if (row.icomost === '1') {
      row.icomost = '0';
      this.ocultarElementosDelGrupoNueva(indice);
    }
  }

  toggleOnNueva2(row, indice) {
    if (row.icomost === '0') {
      row.icomost = '1';
      this.mostrarElementosDelGrupoNueva2(indice);
    }
  }

  toggleOffNueva2(row, indice) {
    if (row.icomost === '1') {
      row.icomost = '0';
      this.ocultarElementosDelGrupoNueva2(indice);
    }
  }


  mostrarElementosDelGrupoNueva(cabeceraIndex) {
    const siguienteCabeceraIndex = this.tablaPlanilla.findIndex(
      (item, index) => index > cabeceraIndex && item.item === 0
    );

    const limite = siguienteCabeceraIndex !== -1 ? siguienteCabeceraIndex : this.tablaPlanilla.length;

    for (let i = cabeceraIndex + 1; i < limite; i++) {
      this.tablaPlanilla[i].visible = true;
    }
  }

  ocultarElementosDelGrupoNueva(cabeceraIndex) {
    const siguienteCabeceraIndex = this.tablaPlanilla.findIndex(
      (item, index) => index > cabeceraIndex && item.item === 0
    );

    const limite = siguienteCabeceraIndex !== -1 ? siguienteCabeceraIndex : this.tablaPlanilla.length;

    for (let i = cabeceraIndex + 1; i < limite; i++) {
      this.tablaPlanilla[i].visible = false;
    }
  }


  mostrarElementosDelGrupoNueva2(cabeceraIndex) {
    const siguienteCabeceraIndex = this.tablaPlanilla.findIndex(
      (item, index) => index > cabeceraIndex && item.item === 0
    );

    const limite = siguienteCabeceraIndex !== -1 ? siguienteCabeceraIndex : this.tablaPlanilla.length;

    for (let i = cabeceraIndex + 1; i < limite; i++) {
      this.tablaPlanilla[i].visible = true;
    }
  }

  ocultarElementosDelGrupoNueva2(cabeceraIndex) {
    const siguienteCabeceraIndex = this.tablaPlanilla.findIndex(
      (item, index) => index > cabeceraIndex && item.item === 0
    );

    const limite = siguienteCabeceraIndex !== -1 ? siguienteCabeceraIndex : this.tablaPlanilla.length;

    for (let i = cabeceraIndex + 1; i < limite; i++) {
      this.tablaPlanilla[i].visible = false;
    }
  }

  // Métodos para expandir/contraer todo en la nueva tabla
  expandirTodoNueva() {
    this.tablaPlanilla.forEach((item, index) => {
      if (item.item === 0) {
        item.icomost = '1';
        this.mostrarElementosDelGrupoNueva(index);
      }
    });
    this.todosExpandidosNueva = true;
  }

  expandirTodoNueva2() {
    this.tablaPlanilla.forEach((item, index) => {
      if (item.item === 0) {
        item.icomost = '1';
        this.mostrarElementosDelGrupoNueva2(index);
      }
    });
    this.todosExpandidosNueva2 = true;
  }

  contraerTodoNueva() {
    this.tablaPlanilla.forEach((item, index) => {
      if (item.item === 0) {
        item.icomost = '0';
        this.ocultarElementosDelGrupoNueva(index);
      }
    });
    this.todosExpandidosNueva = false;
  }

  contraerTodoNueva2() {
    this.tablaPlanilla.forEach((item, index) => {
      if (item.item === 0) {
        item.icomost = '0';
        this.ocultarElementosDelGrupoNueva2(index);
      }
    });
    this.todosExpandidosNueva2 = false;
  }

  toggleTodoNueva() {
    if (this.todosExpandidosNueva) {
      this.contraerTodoNueva();
    } else {
      this.expandirTodoNueva();
    }
  }

  toggleTodoNueva2() {
    if (this.todosExpandidosNueva2) {
      this.contraerTodoNueva2();
    } else {
      this.expandirTodoNueva2();
    }
  }


  onVerDetalleChange(value: boolean): void {
    this.verDetalle = !this.verDetalle ? 'desagregado' : '';
    if (this.selFilPlan !== null && this.tablaPlanilla[this.selFilPlan]) {
      this.cambioDetalle()
    }
  }

  calcularSum(row, i) {
    let total = 0
    if (i < this.tablaServicios.length - 1) {
      for (let index = i + 1; index < this.tablaServicios.length; index++) {
        if (this.tablaServicios[index]?.index_elemento !== 0) {
          total = this.tablaServicios[index].total_registrado + total;
        } else {
          break
        }
      }
    }
    return total
  }
}
