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
  item: string;
  descripcion: string;
  placa: string;
  fecha_solicitud: string | null;
  unidad: string | null;
  cantidad: number | string;          // Puede venir string de input, pero para operaciones se castea a number
  precio_unitario: number | string;   // Puede venir string de input, pero para operaciones se castea a number
  parcial: number;
  estado: number;
  index_grupo: number;
  id_grupo: number;
  id_equipo: number;
  id_registro: number | null;
  id_fila: number | null;
  ind_rep: number | null;
  index_elemento: number;
  id_proyecto: number;
  tipo_registro: string;
  tipo: string;
  nroprov: number;
  tiempo_registrado: number;
  valorGlobal: any;                   // Cambiado de 'null' literal a 'any' o 'number | null'
  desagregadosCompleto: Array<any>;
  total_registrado: number;
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
  mostrarDetalleHoras: boolean = false;
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
    fechaRegistroGlobal: new UntypedFormControl('', []),
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
  get fechaRegistroGlobal(): UntypedFormControl {
    return this.formDesagregado.get('fechaRegistroGlobal') as UntypedFormControl;
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

  // async cambioDataRegistro() {j
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

  calcularTotalDesagregado(servicio: any): number {
    const tiempoOriginal = Number(servicio.tiempo_registrado) || 0;

    if (!servicio.desagregadosCompleto || servicio.desagregadosCompleto.length === 0) {
      return tiempoOriginal;
    }

    const suma = servicio.desagregadosCompleto.reduce((total: number, d: any) => {
      // 1. Tipos Por Horas/Día Directo (H-M, DIA)
      if (servicio.tipo === 'H-M' || servicio.tipo === 'DIA') {
        return total + (Number(d.horas_dia) || 0);
      }

      // 2. Tipo MES
      if (servicio.tipo === 'MES') {
        if (d.horas_detalle) {
          const sumaDetalle = d.horas_detalle.split('/').reduce((sum: number, rango: string) => {
            const partes = rango.split('|');
            return sum + (parseFloat(partes[2]) || 0);
          }, 0);

          if (sumaDetalle > 0) return total + sumaDetalle;
        }
        return total + (Number(d.horas_dia) || 0);
      }

      // 3. Tipo GLOBAL: Si tiene costo_dia, sumamos el costo acumulado directamente
      if (servicio.tipo === 'GLOBAL') {
        if (Number(d.costo_dia) > 0) {
          return total + Number(d.costo_dia);
        }
        // Fallback a suma de horas_detalle si no hay costo_dia definido
        if (d.horas_detalle) {
          const sumaDetalle = d.horas_detalle.split('/').reduce((sum: number, rango: string) => {
            const partes = rango.split('|');
            return sum + (parseFloat(partes[2]) || 0);
          }, 0);
          if (sumaDetalle > 0) return total + sumaDetalle;
        }
        return total + (Number(d.horas_dia) || 0);
      }

      return total;
    }, 0);

    return suma > 0 ? suma : tiempoOriginal;
  }

  async listarEquiposServicios(desagregados: any[]) {
    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: this.id_registro
    };

    const response = await this.equiposServiciosService.listarEquipoServicio(obj);

    if (response?.length) {
      for (const element of response) {
        if (element.index_grupo !== 0) {
          // 1. Asignamos desagregados pertenecientes a este equipo
          element.desagregadosCompleto = desagregados.filter(
            ele => ele.id_equipo == element.id_equipo
          );

          // 2. Preservamos los datos originales de la BD
          const precioBD = Number(element.precio_unitario) || 0;
          const cantidadBD = Number(element.cantidad) || 0;
          const tiempoBD = Number(element.tiempo_registrado) || 0;

          element.precio_unitario = precioBD;
          element.parcial = cantidadBD * precioBD;

          // 3. Calculamos la suma acumulada de las horas/días de los desagregados
          const sumaDesagregados = await this.calcularTotalDesagregado(element);

          if (element.tipo === 'GLOBAL') {
            // 1. Preservamos el tiempo registrado base de la BD (ej. 80)
            element.tiempo_registrado = tiempoBD > 0 ? tiempoBD : sumaDesagregados;

            // 2. Preservamos el total_registrado original de la BD (22800)
            // Si no viniera de la BD, tomamos el cálculo base (tiempoBD * precioBD)
            const totalOriginalBD = (Number(element.total_registrado) > 0)
              ? Number(element.total_registrado)
              : (tiempoBD * precioBD);

            // Mantenemos los 22800 intactos
            element.total_registrado = totalOriginalBD;

          } else {
            // Para H-M, DIA, MES: Sí depende del avance consumido * precio unitario
            element.tiempo_registrado = sumaDesagregados;
            element.total_registrado = element.tiempo_registrado * precioBD;
          }
        }
      }

      this.tablaServiciosCompleto = response;
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
      this.mostrar_carga_todo = true;
      this.filSelRegAct = i;
      this.filSelServ = null;
      this.filSelReq = null;

      const tablaRequerimientos = this.reqCompletos.filter(ele => row.idgrupo == ele.idgrupo);
      const id_prov = row.nroprov;

      this.tablaRequerimientos = tablaRequerimientos.map(servicio => {
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
        }
        const cantidad = Number(servicio.cantidad) || 0;
        const parcial = precioSeleccionado * cantidad;
        const encontrados = this.tablaServiciosCompleto.filter(ele =>
          Number(servicio.idgrupo) === Number(ele.id_grupo) &&
          Number(servicio.idfila) === Number(ele.id_fila)
        );
        const resultado = this.procesarElementosEncontrados(encontrados);
        // --- EVALUACIÓN DEL ESTADO ---
        // Comparación de parciales con margen para evitar fallos por flotantes
        const sonParcialesIguales = parcial > 0 && Math.abs(parcial - resultado.parcial_usada) < 0.01;

        // Es CULMINADO (2) si los parciales son iguales O si todos los encontrados están en estado 2
        const esCulminado = sonParcialesIguales || resultado.todos_culminados;
        const estadoCalculado = esCulminado ? 2 : 1;

        return {
          ...servicio,
          precio: precioSeleccionado,
          marca: marcaSeleccionada,
          parcial: parcial,
          precio_usada: resultado.precio_usada,
          cantidad_usada: resultado.cantidad_usada,
          parcial_usada: resultado.parcial_usada,
          todos_iguales: resultado.todos_iguales,
          saldo: parcial - resultado.parcial_usada,
          estado: estadoCalculado // <--- Asignamos el estado evaluado
        };
      });

      // Filtrar y ordenar la vista de servicios
      const tablaServicios = this.tablaServiciosCompleto.filter(ele =>
        Number(ele.id_grupo) === Number(row.idgrupo)
      );

      this.tablaServicios = [...tablaServicios]
        .sort((a, b) => a.index_grupo - b.index_grupo || a.index_elemento - b.index_elemento)
        .map(item => ({
          ...item,
          icomost: '1',
          visible: true
        }));

      this.todosExpandidos = true;
      this.mostrar_carga_todo = false;
    }
  }

  procesarElementosEncontrados(encontrados: any[]) {
    if (!encontrados || encontrados.length === 0) {
      return {
        precio_usada: null,
        cantidad_usada: null,
        parcial_usada: 0,
        todos_iguales: null,
        todos_culminados: false
      };
    }

    // Convertimos explícitamente a Number
    const primerPrecio = Number(encontrados[0].precio_unitario) || 0;
    const primerTipo = encontrados[0].tipo;

    const todosMismoPrecio = encontrados.every(
      ele => Number(ele.precio_unitario) === primerPrecio
    );
    const todosMismoTipo = encontrados.every(ele => ele.tipo === primerTipo);

    // Verificamos si absolutamente TODOS los elementos asociados ya están culminados (estado == 2)
    const todosCulminados = encontrados.every(ele => Number(ele.estado) === 2);

    const sumaTotalRegistrado = encontrados.reduce(
      (sum, ele) => sum + (Number(ele.total_registrado) || 0), 0
    );

    const sumaTiempoRegistrado = encontrados.reduce(
      (sum, ele) => sum + (Number(ele.tiempo_registrado) || 0), 0
    );

    return {
      precio_usada: todosMismoPrecio && todosMismoTipo ? primerPrecio : null,
      cantidad_usada: sumaTiempoRegistrado,
      parcial_usada: sumaTotalRegistrado,
      todos_iguales: todosMismoPrecio && todosMismoTipo,
      todos_culminados: todosCulminados
    };
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
            j++;
            element.cabecera = false;
            element.mostrar = 1;
            element.icomost = '1';

            if (esSubvista3) {
              element.mostrar = 1;
            }

            const planilla = this.calendarioFiltrado?.dias.map(ele => {
              const encontrado = desagredados.find(reg => reg.fecha.split('T')[0] == ele.fecha && reg.id_equipo == element.id_equipo);
              return encontrado ? encontrado : null;
            });

            const completos = desagredados.filter(reg => reg.id_equipo == element.id_equipo);
            element.planilla = planilla;
            element.item = j;
            element.desagregadosCompleto = completos;
            element.visible = true;

            if (element.tipo == 'GLOBAL') {
              element.valorGlobal = completos.find(ele => ele) || null;
              const valorGlobal = element.valorGlobal;

              const precioUnitarioNum = Number(element.precio_unitario) || 0;
              const totalRegistradoNum = Number(element.total_registrado) || 0;
              const tiempoRegistradoNum = Number(element.tiempo_registrado) || 0;

              const totalDias = this.calendarioFiltrado?.dias?.length || 0;
              const arrayMesGlobal = new Array(totalDias).fill(0);

              if (valorGlobal && totalDias > 0 && valorGlobal.horas_detalle) {
                const rangos = valorGlobal.horas_detalle.split('/');

                rangos.forEach((rango: string) => {
                  const [fInicioStr, fFinStr] = rango.split('|');
                  if (fInicioStr && fFinStr) {
                    const inicioIso = fInicioStr.trim().split('T')[0];
                    const finIso = fFinStr.trim().split('T')[0];

                    this.calendarioFiltrado.dias.forEach((diaObj: any, idx: number) => {
                      const fechaDiaIso = diaObj.fecha.trim().split('T')[0];
                      if (fechaDiaIso >= inicioIso && fechaDiaIso <= finIso) {
                        arrayMesGlobal[idx] = 1; // Mantiene los marcadores visuales en el calendario
                      }
                    });
                  }
                });
              }

              element.arrayMes = arrayMesGlobal;
              element.total_hm = tiempoRegistradoNum;
              element.parcial = totalRegistradoNum > 0 ? totalRegistradoNum : (precioUnitarioNum * tiempoRegistradoNum);

              // 🟢 CÁLCULO SUBVISTA 3 PARA GLOBAL:
              // Solo se suma el costo diario puntual (costo_dia o precio_unitario)
              // en la FECHA EXACTA de registro, NO en todo el rango abonado.
              if (esSubvista3 && valorGlobal) {
                const fechaGlobalStr = (valorGlobal.fechaRegistroGlobal || valorGlobal.fecha || '').split('T')[0];
                const idxDiaPuntual = this.calendarioFiltrado?.dias?.findIndex((dia: any) => dia.fecha === fechaGlobalStr);

                if (idxDiaPuntual !== undefined && idxDiaPuntual !== -1 && idxDiaPuntual < sumaPorDia.length) {
                  // Asigna el costo diario del registro (285) únicamente al día de inicio
                  const montoDiario = Number(valorGlobal.costo_dia) || precioUnitarioNum;
                  sumaPorDia[idxDiaPuntual] += montoDiario;
                }
              }

            } else if (element.tipo == 'MES') {
              element.valorGlobal = null;
              const valorMes = planilla.find(ele => ele);
              element.valorMensual = valorMes;
              const arrayMes = await this.evaluarGlobalMes(valorMes?.horas_detalle, 'MES');
              element.arrayMes = arrayMes;
              const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0);
              element.total_hm = total;
              element.parcial = total * (Number(element.precio_unitario) || 0);

              if (esSubvista3 && arrayMes && arrayMes.length === sumaPorDia.length) {
                arrayMes.forEach((valor, idx) => {
                  sumaPorDia[idx] += (Number(valor) || 0) * (Number(element.precio_unitario) || 0);
                });
              }

            } else {
              // TIPOS 'DIA' y 'H-M'
              element.arrayMes = [];
              const total = planilla.reduce((acc, ele) => acc + (Number(ele?.horas_dia) || 0), 0);
              element.total_hm = total;
              element.parcial = total * (Number(element.precio_unitario) || 0);

              // 🟢 CÁLCULO SUBVISTA 3 PARA DIA / H-M:
              // Toma directamente el costo_dia calculado del desagregado de cada día
              if (esSubvista3 && planilla && planilla.length === sumaPorDia.length) {
                planilla.forEach((dia, idx) => {
                  if (dia) {
                    const costoCalculado = Number(dia.costo_dia) || ((Number(dia.horas_dia) || 0) * (Number(element.precio_unitario) || 0));
                    sumaPorDia[idx] += costoCalculado;
                  }
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
    const mes = this.calendarioFiltrado?.dias;
    if (!mes || !horasDetalle) return new Array(mes?.length || 0).fill(0);

    const fechasEnRango = new Set<string>();

    horasDetalle.split('/').forEach(rango => {
      if (!rango.trim()) return;

      const [fechaInicioStr, fechaFinStr] = rango.split('|');
      if (!fechaInicioStr || !fechaFinStr) return;

      // Normalizar a YYYY-MM-DD sin instanciar Date en UTC
      const fInicio = fechaInicioStr.split('T')[0];
      const fFin = fechaFinStr.split('T')[0];

      let curr = new Date(fInicio + 'T00:00:00');
      const end = new Date(fFin + 'T00:00:00');

      while (curr <= end) {
        const year = curr.getFullYear();
        const month = String(curr.getMonth() + 1).padStart(2, '0');
        const day = String(curr.getDate()).padStart(2, '0');
        fechasEnRango.add(`${year}-${month}-${day}`);

        curr.setDate(curr.getDate() + 1);
      }
    });

    return mes.map(dia => fechasEnRango.has(dia.fecha) ? 1 : 0);
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

  // abrirModalEquipo(row?: servicio) {
  //   this.actualizarEquipos = false
  //   this.equipos.clear();

  //   this.fila_requerimiento.reset('');

  //   this.formEquipo.markAsPristine();
  //   this.formEquipo.markAsUntouched();
  //   this.formEquipo.updateValueAndValidity();
  //   this.tablaEquiposAgregar = []
  //   this.idEquiposEliminar = []
  //   if (row) {
  //     this.actualizarEquipos = true
  //     const elementosGrupo = this.tablaServicios.filter(ele => ele.index_grupo == row.index_grupo && ele.index_elemento !== 0)
  //     for (const requerimiento of elementosGrupo) {
  //       const fecha_solicitud = requerimiento.fecha_solicitud
  //         ? requerimiento.fecha_solicitud.split('T')[0]
  //         : null;
  //       const form = this.fb.group({
  //         item: ['E-' + requerimiento.id_fila],
  //         descripcion: [requerimiento?.descripcion || '', Validators.required],
  //         placa: [requerimiento?.placa],
  //         fecha_solicitud: [fecha_solicitud],
  //         unidad: [requerimiento.unidad, [Validators.required]],
  //         cantidad: [requerimiento.cantidad, [Validators.required]],
  //         precio_unitario: [requerimiento.precio_unitario, [Validators.required]],
  //         parcial: [requerimiento.cantidad * requerimiento.precio_unitario],
  //         estado: [requerimiento?.estado],
  //         index_grupo: [requerimiento?.index_grupo],
  //         id_grupo: [requerimiento?.id_grupo],
  //         id_equipo: [requerimiento?.id_equipo],
  //         id_registro: [requerimiento.id_registro],
  //         id_fila: [requerimiento?.id_fila],
  //         ind_rep: [requerimiento?.ind_rep],
  //         index_elemento: [requerimiento?.index_elemento],
  //         id_proyecto: [requerimiento?.id_proyecto],
  //         tipo_registro: [requerimiento?.tipo_registro],
  //         tipo: [{
  //           value: requerimiento?.tipo,
  //           disabled: requerimiento?.desagregadosCompleto?.length > 0
  //         }],
  //         nroprov: [requerimiento?.nroprov],
  //         desagregadosCompleto: [requerimiento?.desagregadosCompleto],
  //         tiempo_registrado: [requerimiento?.tiempo_registrado],
  //         total_registrado: [requerimiento?.total_registrado]
  //       });
  //       this.equipos.push(form)
  //     }
  //   } else {
  //     this.actualizarEquipos = false
  //   }
  //   this.modalEquipo.show()
  // }

  abrirModalEquipo(row?: servicio) {
    this.actualizarEquipos = false;
    this.equipos.clear();

    this.fila_requerimiento.reset('');
    this.formEquipo.markAsPristine();
    this.formEquipo.markAsUntouched();
    this.formEquipo.updateValueAndValidity();
    this.tablaEquiposAgregar = [];
    this.idEquiposEliminar = [];

    if (row) {
      this.actualizarEquipos = true;
      const elementosGrupo = this.tablaServicios.filter(
        ele => ele.index_grupo == row.index_grupo && ele.index_elemento !== 0
      );

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

        // Si al cargar ya es GLOBAL, aseguramos deshabilitar los controles correspondientes
        if (requerimiento?.tipo === 'GLOBAL') {
          form.get('cantidad')?.disable({ emitEvent: false });
          form.get('precio_unitario')?.disable({ emitEvent: false });
        }

        // Activar el escuchador para cambios futuros
        this.escucharCambioTipo(form);

        this.equipos.push(form);
      }
    } else {
      this.actualizarEquipos = false;
    }

    this.modalEquipo.show();
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
      if (this.formEquipo.invalid || !this.equipos.value?.length) {
        this.formEquipo.markAllAsTouched();
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return;
      }

      this.mostrar_carga_todo = true;
      const filaServicio = this.tablaServicios[this.filSelServ];

      const filtrados = this.tablaServicios.filter(
        ele => ele.index_grupo == filaServicio.index_grupo && ele.index_elemento !== 0
      );
      const filaRegAct = this.tablaRegActividades[this.filSelRegAct];

      let serviciosArray = [];
      let i = filtrados.length + 1;

      for (const element of this.equipos.getRawValue()) {

        // Si es GLOBAL y por algún motivo el total_registrado venía en 0, 
        // aseguramos que tome el valor de 'parcial' o la multiplicación de cantidad * precio
        const totalRegistradoCalculado = element.tipo === 'GLOBAL'
          ? (element.total_registrado || (element.precio_unitario * element.cantidad))
          : (element.total_registrado || 0);

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

          // FIX: Mantenemos los valores que vienen del FormArray en lugar de forzar 0
          tiempo_registrado: element.tiempo_registrado ?? 0,
          valorGlobal: element.valorGlobal ?? null,
          desagregadosCompleto: element.desagregadosCompleto ?? [],
          total_registrado: totalRegistradoCalculado
        };

        serviciosArray.push(equipo);
        i++;
      }

      const idsInsertados = await this.equiposServiciosService.guardarEquiposServicio(serviciosArray);

      if (idsInsertados && idsInsertados.length > 0) {
        serviciosArray.forEach((serv, index) => {
          if (index < idsInsertados.length) {
            serv.id_equipo = idsInsertados[index];
          }
        });

        this.tablaServiciosCompleto = this.tablaServiciosCompleto.concat(serviciosArray);
        const row = this.tablaRegActividades[this.filSelRegAct];
        const indexAct = this.filSelRegAct;
        this.filSelRegAct = null;

        await this.selTablaRegAct(row, indexAct);
        this.modalEquipo.hide();
        this.toaster.success('Se guardó correctamente', 'Éxito');
      } else {
        SwalService.error('No se pudieron guardar los servicios');
      }

      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
      console.error(error);
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
      for (const element of this.equipos.getRawValue()) {
        const cantidadNum = Number(element.cantidad) || 0;
        const precioNum = Number(element.precio_unitario) || 0;

        const equipo: servicio = {
          cantidad: cantidadNum,
          descripcion: element.descripcion,
          id_grupo: element.id_grupo,
          fecha_solicitud: element.fecha_solicitud,
          id_registro: element.id_registro,
          id_fila: element.id_fila,
          ind_rep: element.ind_rep,
          index_grupo: element.index_grupo,
          estado: element.estado,
          item: element.item,
          parcial: precioNum * cantidadNum, // Previene NaN
          placa: element.placa,
          precio_unitario: precioNum,
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
        };
        elementosActualizar.push(equipo);
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
        await this.calcularTotales()
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
      // await this.actualizarDataCompleta()
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

  // Verifica si un requerimiento ya fue registrado/agregado como GLOBAL
  requerimientoEsGlobal(idFila: any, indexIgnorarModal: number = -1): boolean {
    if (!idFila) return false;

    // 1. Validar en registros guardados en la tabla principal
    const existeEnTabla = this.tablaServiciosCompleto.some(
      item => Number(item.id_fila) === Number(idFila) && item.tipo === 'GLOBAL'
    );

    if (existeEnTabla) return true;

    // 2. Validar en el FormArray del modal actual (por si se agregaron varias filas antes de guardar)
    const existeEnModal = this.equipos.controls.some((ctrl, index) => {
      if (index === indexIgnorarModal) return false; // Para permitir edición sobre la misma fila si fuera necesario
      const val = ctrl.value;
      return Number(val.id_fila) === Number(idFila) && val.tipo === 'GLOBAL';
    });

    return existeEnModal;
  }

  calcularTotales() {
    for (const element of this.tablaRequerimientos) {
      const filtrados = this.tablaServicios.filter((ele: servicio) =>
        Number(ele.id_registro) === Number(element.id_registro) &&
        Number(ele.ind_rep) === Number(element.indrep) &&
        Number(ele.id_grupo) === Number(element.idgrupo) &&
        Number(ele.id_fila) === Number(element.idfila)
      );

      if (filtrados.length === 0) continue; // Protección si no hay registros

      const primerServicio = filtrados[0];
      const tienenMismoTipo = filtrados.every(s => s.tipo === primerServicio?.tipo);
      const tienenMismoPrecio = filtrados.every(s => Number(s.precio_unitario) === Number(primerServicio?.precio_unitario));
      const sonHomogeneos = tienenMismoTipo && tienenMismoPrecio;

      const sumaTotalTiempo = filtrados.reduce((acc, item) => acc + (Number(item.tiempo_registrado) || 0), 0);
      const sumaTotalRegistrado = filtrados.reduce((sum, ele) =>
        sum + ((ele.tiempo_registrado !== 0 && ele.precio_unitario !== 0) ? (Number(ele.total_registrado) || 0) : 0), 0);

      // Mantenimiento de valores acumulados siempre
      element.parcial_usada = sumaTotalRegistrado;

      if (sonHomogeneos) {
        element.cantidad_usada = sumaTotalTiempo;
        element.precio_usada = primerServicio.precio_unitario;
      } else {
        // Si es valor global/heterogéneo, mantén las sumas totales acumuladas si tu UI lo requiere
        element.cantidad_usada = sumaTotalTiempo;
        element.precio_usada = null; // O el valor promedio/global
      }

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
        acumuladoGrupo += Number(element.parcial) || 0;
      }
    }
  }
  
  async seleccionCelda(i: number, j: number) {
    this.selFilPlan = i;

    if (this.evitandoDobleEjecucion) {
      return;
    }

    const filaActual = this.tablaPlanilla[i];
    if (!filaActual) return;

    const tipoFila = filaActual.tipo;

    // Para GLOBAL y MES la selección es a nivel de fila, no de celda diaria
    if (tipoFila === 'GLOBAL' || tipoFila === 'MES') {
      return;
    }

    // Actualizar obligatoriamente el tipo seleccionado
    this.tipoSeleccionado = tipoFila;

    if (this.celdaSel[0] !== i || this.celdaSel[1] !== j) {
      if (this.equipoEditado) {
        this.evitandoDobleEjecucion = true;
        await this.guardarActualizarCambiosDesagregado(true);
        this.evitandoDobleEjecucion = false;
      }

      this.buscando = true;
      this.celdaSel = [i, j];

      // Resetear campos del formulario desagregado
      this.id_desagregado.reset();
      this.horas_dia.reset();
      this.minutos_dia.reset();
      this.coste_dia.reset();
      this.observaciones.reset();

      if (tipoFila === 'DIA') {
        this.horas_dia.disable({ emitEvent: false });
      } else {
        this.horas_dia.enable({ emitEvent: false });
      }

      // Limpiar el FormArray de tiempos
      this.tiempos.clear({ emitEvent: false });

      // Cargar datos estáticos de la fila
      this.coste_unitario.setValue(filaActual.precio_unitario, { emitEvent: false });
      this.unidad.setValue(filaActual.unidad, { emitEvent: false });
      this.tiempo_programado.setValue(filaActual.cantidad, { emitEvent: false });

      const dataDiaEquipo = filaActual.planilla?.[j];

      if (dataDiaEquipo) {
        if (dataDiaEquipo.horas_detalle) {
          const filas = dataDiaEquipo.horas_detalle.split('/');

          filas.forEach((fila: string) => {
            const [valor1, valor2, valor3] = fila.split('|');

            // Al ser DIA u H-M siempre requiere controles de horario ('inicio' y 'fin')
            const grupoControles = this.fb.group({
              inicio: [valor1 || '', Validators.required],
              fin: [valor2 || '', Validators.required],
              tiempo: [valor3 || 0]
            }, {
              validators: [this.validarFila.bind(this)]
            });

            this.tiempos.push(grupoControles);
          });

          if (this.tiempos.length > 0) {
            await this.actualizarTiempoUtilizado(false);
            this.observaciones.enable({ emitEvent: false });
          } else {
            await this.calcularSaldo();
          }
        }

        this.id_desagregado.setValue(dataDiaEquipo.id_desagregado, { emitEvent: false });
        this.horas_dia.setValue(dataDiaEquipo.horas_dia, { emitEvent: false });
        this.minutos_dia.setValue(dataDiaEquipo.minutos_dia, { emitEvent: false });
        this.observaciones.setValue(dataDiaEquipo.observaciones, { emitEvent: false });
        this.coste_dia.setValue(dataDiaEquipo.costo_dia, { emitEvent: false });

        // Recalcular acumulados del equipo
        let total = 0;
        if (Array.isArray(filaActual.desagregadosCompleto)) {
          filaActual.desagregadosCompleto.forEach((ele: any) => {
            total += Number(ele.horas_dia || 0);
          });
        }
        this.tiempo_utilizado.setValue(total, { emitEvent: false });
        this.saldo_utilizar.setValue((this.tiempo_programado.value || 0) - total, { emitEvent: false });
      }

      this.equipoEditado = false;
      this.buscando = false;
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

    if (cambio && this.tiempos.valid) {
      this.equipoEditado = true
    }

  }

  calcularSaldo(): void {
    const filaActual = this.tablaPlanilla[this.selFilPlan];
    if (!filaActual) return;

    const esGlobal = filaActual.tipo === 'GLOBAL';

    // --- 1. CÁLCULO DE MINUTOS Y COSTE DEL DÍA ---
    let minutosProg = 0;
    const progValue = this.horas_dia.value;

    if (progValue) {
      if (typeof progValue === 'string' && progValue.includes(':')) {
        const [horas, minutos] = progValue.split(':').map(Number);
        minutosProg = horas * 60 + (minutos || 0);
      } else {
        minutosProg = Math.round(parseFloat(progValue.toString()) * 60);
      }
    }

    const costeUnitario = Number(this.coste_unitario.value) || 0;
    const horasTrabajadas = minutosProg / 60;
    const costeDia = horasTrabajadas * costeUnitario;

    this.coste_dia.setValue(Math.round(costeDia * 100) / 100, { emitEvent: false });

    // --- 2. CÁLCULO DE SALDOS ACUMULADOS ---
    const total = (filaActual.desagregadosCompleto || []).reduce(
      (acc: number, ele: any) => acc + (Number(ele.horas_dia) || 0),
      0
    );

    this.tiempo_utilizado.setValue(total, { emitEvent: false });

    const tiempoProgramado = Number(this.tiempo_programado.value) || 0;
    this.saldo_utilizar.setValue(tiempoProgramado - total, { emitEvent: false });

    // Si es GLOBAL finalizamos sin recalcular la fila en tabla
    if (esGlobal) return;

    // --- 3. RECÁLCULO DE TOTALES EN LA TABLA ---
    if (Array.isArray(filaActual.planilla)) {
      const totalHorasPlanilla = filaActual.planilla.reduce(
        (acc: number, ele: any) => acc + (Number(ele?.horas_dia) || 0),
        0
      );

      filaActual.total_hm = totalHorasPlanilla;

      if (filaActual.tipo === 'MES') {
        filaActual.precio_unitario = totalHorasPlanilla !== 0
          ? Number(((filaActual.total_registrado || 0) / totalHorasPlanilla).toFixed(5))
          : 0;
      } else {
        // H-M, HM y DIA
        filaActual.parcial = totalHorasPlanilla * (Number(filaActual.precio_unitario) || 0);
      }

      // Forzar actualización de referencia para tablas de Angular/RxJS
      this.tablaPlanilla = [...this.tablaPlanilla];
    }
  }

  // async guardarActualizarCambiosDesagregado(cambio = false) {
  //   if (!this.equipoEditado) {
  //     this.toaster.info(
  //       'Ningun cambio realizado',
  //       '',
  //       {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       }
  //     );
  //     return
  //   }
  //   try {
  //     console.log('this.equipoEditado', this.equipoEditado)
  //     console.log('this.tiempos', this.tiempos)
  //     if (this.tiempos.invalid) {
  //       if (!cambio) {
  //         this.tiempos.markAllAsTouched()
  //         this.toaster.error(
  //           'Datos horas laborados incorrecto',
  //           'Error',
  //           {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 4000,
  //           }
  //         );
  //       } else {
  //         this.equipoEditado = false
  //       }
  //       return
  //     }
  //     this.mostrar_carga_todo = true
  //     const fila = this.tablaPlanilla[this.selFilPlan]
  //     const data = this.formDesagregado.getRawValue()
  //     const horas_detalle_Array = this.tiempos.value.map(ele => (ele.inicio || ele.fechaInicio) + '|' + (ele.fin || ele.fechaFin) + '|' + ele.tiempo);
  //     const horas_detalle = horas_detalle_Array.join('/')
  //     let diaSeleccionado = null
  //     let row = null
  //     if (fila.tipo == 'H-M' || fila.tipo == 'DIA') {
  //       diaSeleccionado = this.calendarioFiltrado.dias[this.celdaSel[1]]
  //       row = this.tablaPlanilla[this.celdaSel[0]]
  //     } else if (fila.tipo == 'MES') {
  //       diaSeleccionado = this.calendarioFiltrado.dias[0]
  //       row = this.tablaPlanilla[this.selFilPlan]
  //     } else {
  //       diaSeleccionado = this.calendario[0].dias[0]
  //       row = this.tablaPlanilla[this.selFilPlan]
  //     }
  //     if ((horas_detalle || data.horas_dia)) {
  //       if (data.id_desagregado) {
  //         const obj = {
  //           id_desagregado: data.id_desagregado,
  //           id_proyecto: this.id_proyecto,
  //           id_equipo: row.id_equipo,
  //           fecha: diaSeleccionado.fecha,
  //           id_proveedor: null,
  //           horas_dia: data.horas_dia,
  //           minutos_dia: data.minutos_dia,
  //           costo_dia: data.coste_dia,
  //           horas_detalle: horas_detalle,
  //           observaciones: data.observaciones == null ? '' : data.observaciones,
  //         }
  //         console.log('objac', obj)
  //         const resp = await this.equiposServiciosService.actualizarDesagregadoEquipo(obj)
  //         console.log('resp', resp)
  //         if (resp[0]?.mensaje == '1') {
  //           // Actualizar la celda en la tabla
  //           if (fila.tipo == 'H-M' || fila.tipo == 'DIA') {
  //             this.tablaPlanilla[this.celdaSel[0]].planilla[this.celdaSel[1]] = obj
  //           } else if (fila.tipo == 'MES') {
  //             this.tablaPlanilla[this.selFilPlan].valorMensual = obj
  //             const arrayMes = await this.evaluarGlobalMes(obj?.horas_detalle, 'MES')
  //             this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
  //             const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
  //             this.tablaPlanilla[this.selFilPlan].total_hm = total
  //             this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
  //           } else {
  //             this.tablaPlanilla[this.selFilPlan].valorGlobal = obj
  //             const valorGlobal = obj
  //             const arrayMes = await this.evaluarGlobalMes(valorGlobal?.horas_detalle, 'GLOBAL')
  //             this.tablaPlanilla[this.selFilPlan].valorGlobal = valorGlobal
  //             this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
  //             const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
  //             this.tablaPlanilla[this.selFilPlan].total_hm = total
  //             this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
  //           }


  //           // Actualizar el elemento en el array desagregadosCompleto
  //           const array = this.tablaPlanilla[this.selFilPlan].desagregadosCompleto
  //           const indice = array.findIndex(ele => ele.id_desagregado === obj.id_desagregado) // CORREGIDO: ===
  //           if (indice !== -1) {
  //             array[indice] = obj
  //             // CORREGIDO: Asignar el array completo, no solo un elemento
  //             this.tablaPlanilla[this.selFilPlan].desagregadosCompleto = array
  //           }
  //           if (horas_detalle) {
  //             this.actualizarTiempoUtilizado(false);
  //           } else {
  //             this.calcularSaldo()
  //           }

  //           this.equipoEditado = false
  //           this.toaster.success(
  //             'Se realizo con exito',
  //             'Éxito',
  //             {
  //               closeButton: false,
  //               positionClass: 'toast-bottom-right',
  //               timeOut: 4000,
  //             }
  //           );
  //         } else {
  //           SwalService.error()
  //         }
  //       } else {
  //         const obj = {
  //           id_proyecto: this.id_proyecto,
  //           id_equipo: row.id_equipo,
  //           fecha: diaSeleccionado.fecha,
  //           // 🟢 Si es cadena vacía, pásalo a null para que .NET no falle al parsear int?
  //           id_proveedor: null,
  //           horas_dia: data.horas_dia,
  //           minutos_dia: data.minutos_dia,
  //           costo_dia: data.coste_dia,
  //           horas_detalle: horas_detalle,
  //           observaciones: data.observaciones ?? null
  //         };
  //         console.log('objg', obj)
  //         const resp = await this.equiposServiciosService.guardarDesagregadoEquipo(obj)
  //         console.log('resp', resp)
  //         if (resp[0]?.id_desagregado) {
  //           obj['id_desagregado'] = resp[0].id_desagregado

  //           if (fila.tipo == 'H-M' || fila.tipo == 'DIA') {
  //             this.tablaPlanilla[this.celdaSel[0]].planilla[this.celdaSel[1]] = obj
  //             this.tablaPlanilla[this.celdaSel[0]].desagregadosCompleto.push(obj)
  //             if (horas_detalle) {
  //               this.actualizarTiempoUtilizado();
  //             } else {
  //               this.calcularSaldo()
  //             }
  //           } else if (fila.tipo == 'MES') {
  //             this.tablaPlanilla[this.selFilPlan].valorMensual = obj
  //             const arrayMes = await this.evaluarGlobalMes(obj?.horas_detalle, 'MES')
  //             this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
  //             const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
  //             this.tablaPlanilla[this.selFilPlan].total_hm = total
  //             this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
  //             this.tablaPlanilla[this.selFilPlan].desagregadosCompleto.push(obj)
  //           } else {
  //             this.tablaPlanilla[this.selFilPlan].valorGlobal = obj
  //             const valorGlobal = obj
  //             const arrayMes = await this.evaluarGlobalMes(valorGlobal?.horas_detalle, 'GLOBAL')
  //             this.tablaPlanilla[this.selFilPlan].valorGlobal = valorGlobal
  //             this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
  //             const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
  //             this.tablaPlanilla[this.selFilPlan].total_hm = total
  //             this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
  //             this.tablaPlanilla[this.selFilPlan].desagregadosCompleto.push(obj)
  //           }

  //           this.id_desagregado.setValue(resp[0].id_desagregado)
  //           this.equipoEditado = false
  //           this.toaster.success(
  //             'Se realizo con exito',
  //             'Éxito',
  //             {
  //               closeButton: false,
  //               positionClass: 'toast-bottom-right',
  //               timeOut: 4000,
  //             }
  //           );
  //         } else {
  //           SwalService.error()
  //         }
  //       }
  //     } else {
  //       const obj = {
  //         id_desagregado: this.id_desagregado.value
  //       }
  //       console.log('elim', obj)
  //       const resp = await this.equiposServiciosService.eliminarDesagregadoEquipo(obj)
  //       console.log('resp', resp)
  //       if (resp[0].mensaje == '1') {
  //         while (this.tiempos.value.length) {
  //           this.tiempos.removeAt(0);
  //         }

  //         if (fila.tipo == 'H-M' || fila.tipo == 'DIA') {
  //           this.tablaPlanilla[this.celdaSel[0]].planilla[this.celdaSel[1]] = null
  //           this.tablaPlanilla[this.celdaSel[0]].desagregadosCompleto =
  //             this.tablaPlanilla[this.celdaSel[0]].desagregadosCompleto.filter(
  //               item => item.id_desagregado !== this.id_desagregado.value
  //             );
  //           let total = 0
  //           // this.tablaPlanilla[this.selFilPlan].desagregadosCompleto.map(ele => ele.horas_dia + total)
  //           this.tablaPlanilla[this.selFilPlan]?.desagregadosCompleto.forEach(ele => {
  //             total += Number(ele.horas_dia);
  //           });
  //           this.tiempo_utilizado.setValue(total)
  //         } else if (fila.tipo == 'MES') {
  //           this.tablaPlanilla[this.selFilPlan].valorMensual = null
  //           this.tablaPlanilla[this.selFilPlan].valorGlobal = null
  //           const arrayMes = await this.evaluarGlobalMes('', 'MES')
  //           this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
  //           const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
  //           this.tablaPlanilla[this.selFilPlan].total_hm = total
  //           this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
  //           this.tablaPlanilla[this.selFilPlan].desagregadosCompleto = []
  //           this.tiempo_utilizado.setValue(total)
  //         } else {
  //           this.tablaPlanilla[this.selFilPlan].valorMensual = null
  //           this.tablaPlanilla[this.selFilPlan].valorGlobal = null

  //           const arrayMes = await this.evaluarGlobalMes('', 'GLOBAL')
  //           this.tablaPlanilla[this.selFilPlan].arrayMes = arrayMes
  //           const total = arrayMes.reduce((acc, ele) => acc + (Number(ele) || 0), 0)
  //           this.tablaPlanilla[this.selFilPlan].total_hm = total
  //           this.tablaPlanilla[this.selFilPlan].parcial = total * this.tablaPlanilla[this.selFilPlan].precio_unitario
  //           this.tablaPlanilla[this.selFilPlan].desagregadosCompleto = []
  //           this.tiempo_utilizado.setValue(total)
  //         }


  //         this.id_desagregado.setValue('')

  //         const saldo = this.tiempo_programado.value - 0
  //         this.saldo_utilizar.setValue(saldo)
  //         this.minutos_dia.setValue('')
  //         this.horas_dia.setValue('')
  //         this.observaciones.setValue('')
  //         this.coste_dia.setValue('')
  //         this.equipoEditado = false
  //         this.toaster.success(
  //           'Se realizo con exito',
  //           'Éxito',
  //           {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 4000,
  //           }
  //         );
  //       }
  //     }
  //     this.mostrar_carga_todo = false

  //   } catch (error) {
  //     this.mostrar_carga_todo = false
  //     console.log(error)
  //     SwalService.error()
  //   }
  // }

  async guardarActualizarCambiosDesagregado(cambio = false): Promise<boolean | void> {


    if (!this.equipoEditado) {
      this.toaster.info('Ningún cambio realizado', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return;
    }

    try {
      // ==========================================
      // 1. VALIDACIÓN DEL FORMULARIO DE TIEMPOS
      // ==========================================
      if (this.tiempos.invalid) {
        if (!cambio) {
          this.tiempos.markAllAsTouched();
          this.toaster.error('Datos horas laborados incorrectos', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
        } else {
          this.equipoEditado = false;
        }
        return;
      }

      const fila = this.tablaPlanilla[this.selFilPlan];
      const data = this.formDesagregado.getRawValue();
      const esGlobal = fila.tipo === 'GLOBAL';

      // ==========================================
      // 2. VALIDACIÓN DE FECHA OBLIGATORIA (GLOBAL)
      // ==========================================
      if (esGlobal && !data.fechaRegistroGlobal) {
        if (!cambio) {
          this.toaster.warning('La fecha asignada es obligatoria para el tipo GLOBAL', 'Advertencia', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
        } else {
          this.equipoEditado = false;
        }
        return false;
      }

      this.mostrar_carga_todo = true;

      // Detalle de horas formateado (inicio|fin|tiempo/...)
      const horasDetalleArray = this.tiempos.value.map(
        (ele: any) => `${ele.inicio || ele.fechaInicio || ''}|${ele.fin || ele.fechaFin || ''}|${ele.tiempo || ''}`
      );
      const horasDetalle = horasDetalleArray.join('/');

      // ==========================================
      // 3. DETERMINACIÓN DE OBJETIVOS Y NAVEGACIÓN
      // ==========================================
      let diaSeleccionado = null;
      let targetIndex = this.selFilPlan;

      if (fila.tipo === 'H-M' || fila.tipo === 'DIA') {
        targetIndex = this.celdaSel[0];
        diaSeleccionado = this.calendarioFiltrado?.dias?.[this.celdaSel[1]];
      } else if (fila.tipo === 'MES') {
        diaSeleccionado = this.calendarioFiltrado?.dias?.[0];
      }

      const targetRow = this.tablaPlanilla[targetIndex];
      const fechaPayload = esGlobal ? data.fechaRegistroGlobal : diaSeleccionado?.fecha;

      if (!fechaPayload) {
        this.mostrar_carga_todo = false;
        if (cambio) this.equipoEditado = false;
        return false;
      }

      const tieneContenidoGuardable = Boolean(horasDetalle || data.horas_dia || esGlobal);

      if (tieneContenidoGuardable) {
        if (data.id_desagregado) {
          // ==========================================
          // A. ACTUALIZACIÓN DE REGISTRO
          // ==========================================
          const obj = {
            id_desagregado: data.id_desagregado,
            id_proyecto: this.id_proyecto,
            id_equipo: targetRow.id_equipo,
            fecha: fechaPayload,
            id_proveedor: null,
            horas_dia: data.horas_dia,
            minutos_dia: data.minutos_dia,
            costo_dia: data.coste_dia,
            horas_detalle: horasDetalle,
            observaciones: data.observaciones ?? '',
          };

          const resp = await this.equiposServiciosService.actualizarDesagregadoEquipo(obj);

          if (resp[0]?.mensaje === '1') {
            const rowClonada = { ...targetRow };

            // 1. Actualización inmutable de la colección principal
            const arrayCompleto = [...(rowClonada.desagregadosCompleto || [])];
            const indice = arrayCompleto.findIndex(ele => ele.id_desagregado === obj.id_desagregado);

            const objetoActualizado = {
              ...obj,
              fechaRegistroGlobal: data.fechaRegistroGlobal,
              costo_dia: Number(data.coste_dia) || 0,
              horas_dia: Number(data.horas_dia) || 0
            };

            if (indice !== -1) {
              arrayCompleto[indice] = objetoActualizado;
            } else {
              arrayCompleto.push(objetoActualizado);
            }
            rowClonada.desagregadosCompleto = arrayCompleto;

            // 2. Mapeo según el tipo de fila
            if (fila.tipo === 'H-M' || fila.tipo === 'DIA') {
              const planillaCopy = [...(rowClonada.planilla || [])];
              planillaCopy[this.celdaSel[1]] = { ...objetoActualizado };
              rowClonada.planilla = planillaCopy;

            } else if (fila.tipo === 'MES') {
              rowClonada.valorMensual = { ...objetoActualizado };
              const arrayMes = await this.evaluarGlobalMes(obj.horas_detalle, 'MES');
              rowClonada.arrayMes = arrayMes;

              const total = arrayMes.reduce((acc: number, ele: any) => acc + (Number(ele) || 0), 0);
              rowClonada.total_hm = total;
              rowClonada.parcial = total * (Number(rowClonada.precio_unitario) || 0);

            } else {
              // Caso GLOBAL
              rowClonada.valorGlobal = {
                ...objetoActualizado,
                fechaRegistroGlobal: data.fechaRegistroGlobal,
              };

              // Reconstruir arrayMes para tipo GLOBAL parseando rangos de fechas
              const totalDias = this.calendarioFiltrado?.dias?.length || 0;
              const arrayMesGlobal = new Array(totalDias).fill(0);

              rowClonada.desagregadosCompleto.forEach((item: any) => {
                if (item.horas_detalle && item.horas_detalle.trim() !== '') {
                  // 1. Separar cada rango registrado (ej: "2024-11-01|2024-11-02|2")
                  const rangos = item.horas_detalle.split('/');

                  rangos.forEach((rangoStr: string) => {
                    const partes = rangoStr.split('|');
                    if (partes.length >= 2) {
                      const fInicio = new Date(partes[0] + 'T00:00:00');
                      const fFin = new Date(partes[1] + 'T00:00:00');

                      // 2. Mapear cada día del calendario filtrado
                      this.calendarioFiltrado?.dias?.forEach((diaCal: any, idxDia: number) => {
                        const fDiaCal = new Date(diaCal.fecha.split('T')[0] + 'T00:00:00');

                        // Comprobar si el día actual cae dentro del rango [fInicio, fFin]
                        if (fDiaCal >= fInicio && fDiaCal <= fFin) {
                          // Asigna 1 (o la marca requerida para cada día del rango en la matriz)
                          arrayMesGlobal[idxDia] = 1;
                        }
                      });
                    }
                  });
                } else {
                  // Si no tiene horas_detalle pero sí una fecha individual
                  const fechaItemStr = (item.fechaRegistroGlobal || item.fecha || '').split('T')[0];
                  const idxDia = this.calendarioFiltrado?.dias?.findIndex(
                    (d: any) => (d.fecha || '').split('T')[0] === fechaItemStr
                  );

                  if (idxDia !== -1 && idxDia !== undefined && (Number(item.costo_dia) > 0 || Number(item.horas_dia) > 0)) {
                    arrayMesGlobal[idxDia] = 1;
                  }
                }
              });

              rowClonada.arrayMes = arrayMesGlobal;
            }

            // Asignar objeto completamente clonado a la tabla
            this.tablaPlanilla[targetIndex] = rowClonada;

            if (!esGlobal) {
              if (horasDetalle) {
                this.actualizarTiempoUtilizado(false);
              } else {
                this.calcularSaldo();
              }
            }

            this.notificarExito();
          } else {
            SwalService.error();
          }
        } else {
          // ==========================================
          // B. CREACIÓN DE REGISTRO
          // ==========================================
          const obj = {
            id_proyecto: this.id_proyecto,
            id_equipo: targetRow.id_equipo,
            fecha: fechaPayload,
            id_proveedor: null,
            horas_dia: data.horas_dia,
            minutos_dia: data.minutos_dia,
            costo_dia: data.coste_dia,
            horas_detalle: horasDetalle,
            observaciones: data.observaciones ?? '',
          };

          const resp = await this.equiposServiciosService.guardarDesagregadoEquipo(obj);

          if (resp[0]?.id_desagregado) {
            const nuevoObj = {
              ...obj,
              id_desagregado: resp[0].id_desagregado,
              fechaRegistroGlobal: data.fechaRegistroGlobal,
              costo_dia: Number(data.coste_dia) || 0,
              horas_dia: Number(data.horas_dia) || 0
            };
            const rowClonada = { ...targetRow };

            // Usar targetRow.tipo para garantizar consistencia con el índice destino
            const tipoFilaTarget = targetRow.tipo || fila.tipo;

            if (tipoFilaTarget === 'H-M' || tipoFilaTarget === 'DIA') {
              const planillaCopy = [...(rowClonada.planilla || [])];
              planillaCopy[this.celdaSel[1]] = { ...nuevoObj };
              rowClonada.planilla = planillaCopy;
              rowClonada.desagregadosCompleto = [
                ...(rowClonada.desagregadosCompleto || []),
                { ...nuevoObj },
              ];

              this.tablaPlanilla[targetIndex] = rowClonada;

              if (horasDetalle) {
                this.actualizarTiempoUtilizado();
              } else {
                this.calcularSaldo();
              }
            } else if (tipoFilaTarget === 'MES') {
              rowClonada.valorMensual = { ...nuevoObj };
              const arrayMes = await this.evaluarGlobalMes(nuevoObj.horas_detalle, 'MES');
              rowClonada.arrayMes = arrayMes;

              const total = arrayMes.reduce((acc: number, ele: any) => acc + (Number(ele) || 0), 0);
              rowClonada.total_hm = total;
              rowClonada.parcial = total * (Number(rowClonada.precio_unitario) || 0);
              rowClonada.desagregadosCompleto = [
                ...(rowClonada.desagregadosCompleto || []),
                { ...nuevoObj },
              ];

              this.tablaPlanilla[targetIndex] = rowClonada;
            } else {
              // Caso GLOBAL: Reconstrucción robusta de arrayMesGlobal
              rowClonada.valorGlobal = { ...nuevoObj };

              const totalDias = this.calendarioFiltrado?.dias?.length || 0;
              const arrayMesGlobal = new Array(totalDias).fill(0);

              const nuevaColeccion = [
                ...(rowClonada.desagregadosCompleto || []),
                { ...nuevoObj }
              ];
              rowClonada.desagregadosCompleto = nuevaColeccion;

              // Evaluamos la colección completa contemplando tanto horas_detalle (rangos) como fechas puntuales
              rowClonada.desagregadosCompleto.forEach((item: any) => {
                if (item.horas_detalle && item.horas_detalle.trim() !== '') {
                  const rangos = item.horas_detalle.split('/');
                  rangos.forEach((rangoStr: string) => {
                    const partes = rangoStr.split('|');
                    if (partes.length >= 2 && partes[0] && partes[1]) {
                      const fInicio = new Date(partes[0] + 'T00:00:00');
                      const fFin = new Date(partes[1] + 'T00:00:00');

                      this.calendarioFiltrado?.dias?.forEach((diaCal: any, idxDia: number) => {
                        const fDiaCal = new Date(diaCal.fecha.split('T')[0] + 'T00:00:00');
                        if (fDiaCal >= fInicio && fDiaCal <= fFin) {
                          arrayMesGlobal[idxDia] = 1;
                        }
                      });
                    }
                  });
                } else {
                  const fechaItemStr = (item.fechaRegistroGlobal || item.fecha || '').split('T')[0];
                  const idxDia = this.calendarioFiltrado?.dias?.findIndex(
                    (d: any) => (d.fecha || '').split('T')[0] === fechaItemStr
                  );

                  if (idxDia !== -1 && idxDia !== undefined && (Number(item.costo_dia) > 0 || Number(item.horas_dia) > 0)) {
                    arrayMesGlobal[idxDia] = Number(item.costo_dia) || Number(item.horas_dia) || 1;
                  }
                }
              });

              rowClonada.arrayMes = arrayMesGlobal;
              this.tablaPlanilla[targetIndex] = rowClonada;
            }

            this.id_desagregado.setValue(resp[0].id_desagregado, { emitEvent: false });
            this.notificarExito();
          } else {
            SwalService.error();
          }
        }
      } else {
        // ==========================================
        // C. ELIMINACIÓN DE REGISTRO
        // ==========================================
        const idDesagregado = this.id_desagregado.value;

        if (!idDesagregado) {
          this.mostrar_carga_todo = false;
          this.equipoEditado = false;
          return;
        }

        const resp = await this.equiposServiciosService.eliminarDesagregadoEquipo({
          id_desagregado: idDesagregado,
        });

        if (resp[0]?.mensaje === '1') {
          this.tiempos.clear({ emitEvent: false });
          const rowClonada = { ...targetRow };

          if (fila.tipo === 'H-M' || fila.tipo === 'DIA') {
            const planillaCopy = [...(rowClonada.planilla || [])];
            planillaCopy[this.celdaSel[1]] = null;
            rowClonada.planilla = planillaCopy;
            rowClonada.desagregadosCompleto = (rowClonada.desagregadosCompleto || []).filter(
              (item: any) => item.id_desagregado !== idDesagregado
            );

            this.tablaPlanilla[targetIndex] = rowClonada;

            const total = (rowClonada.desagregadosCompleto || [])
              .reduce((acc: number, ele: any) => acc + (Number(ele.horas_dia) || 0), 0);

            this.tiempo_utilizado.setValue(total, { emitEvent: false });
          } else if (fila.tipo === 'MES') {
            rowClonada.valorMensual = null;
            rowClonada.valorGlobal = null;

            const arrayMes = await this.evaluarGlobalMes('', 'MES');
            rowClonada.arrayMes = arrayMes;

            const total = arrayMes.reduce((acc: number, ele: any) => acc + (Number(ele) || 0), 0);
            rowClonada.total_hm = total;
            rowClonada.parcial = total * (Number(rowClonada.precio_unitario) || 0);
            rowClonada.desagregadosCompleto = [];

            this.tablaPlanilla[targetIndex] = rowClonada;
            this.tiempo_utilizado.setValue(total, { emitEvent: false });
          } else {
            // Eliminación Tipo GLOBAL
            rowClonada.valorMensual = null;
            rowClonada.valorGlobal = null;

            const totalDias = this.calendarioFiltrado?.dias?.length || 0;
            rowClonada.arrayMes = new Array(totalDias).fill(0);
            rowClonada.desagregadosCompleto = (rowClonada.desagregadosCompleto || []).filter(
              (item: any) => item.id_desagregado !== idDesagregado
            );

            this.tablaPlanilla[targetIndex] = rowClonada;
          }

          this.id_desagregado.setValue('', { emitEvent: false });

          if (!esGlobal) {
            const saldo = Number(this.tiempo_programado.value || 0);
            this.saldo_utilizar.setValue(saldo, { emitEvent: false });
          }

          // Reseteo del formulario
          this.minutos_dia.setValue('', { emitEvent: false });
          this.horas_dia.setValue('', { emitEvent: false });
          this.observaciones.setValue('', { emitEvent: false });
          this.coste_dia.setValue('', { emitEvent: false });
          this.fechaRegistroGlobal.setValue('', { emitEvent: false });

          this.notificarExito();
        } else {
          SwalService.error();
        }
      }

      // Forzar detección de cambios en Angular reasignando la tabla
      this.tablaPlanilla = [...this.tablaPlanilla];
      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.error('Error en guardarActualizarCambiosDesagregado:', error);
      SwalService.error();
    }
  }

  // Helper interno para notificar éxito y limpiar estado de edición
  private notificarExito(): void {
    this.equipoEditado = false;
    this.toaster.success('Se realizó con éxito', 'Éxito', {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: 4000,
    });
  }

  crearFilaServicio(): FormGroup {
    const requerimiento = this.tablaRequerimientos[this.fila_requerimiento.value];
    const regAct = this.tablaRegActividades[this.filSelRegAct];

    const cantInicial = requerimiento?.cantidad ?? 0;
    const precioInicial = requerimiento?.precio ?? 0;
    const parcialInicial = cantInicial * precioInicial;

    const form = this.fb.group({
      item: ['E-' + requerimiento?.idfila],
      descripcion: [requerimiento?.descripcion || '', Validators.required],
      placa: [''],
      fecha_solicitud: [requerimiento?.fecha_sol],
      unidad: [requerimiento?.unidad],
      cantidad: [cantInicial, [Validators.required]],
      precio_unitario: [precioInicial, [Validators.required]],
      parcial: [parcialInicial, [Validators.required]],
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
      // NACE DESHABILITADO para que en el HTML se renderice directamente como texto plano (span)
      total_registrado: [{ value: 0, disabled: true }]
    });

    // Activar el escuchador para cambios de tipo (GLOBAL, H-M, etc.)
    this.escucharCambioTipo(form);
    return form;
  }

  private escucharCambioTipo(form: FormGroup): void {
    const tipoControl = form.get('tipo');
    if (!tipoControl) return;

    tipoControl.valueChanges.subscribe((nuevoTipo: string) => {
      const idFila = form.get('id_fila')?.value;
      const idGrupo = form.get('id_grupo')?.value;

      if (nuevoTipo === 'GLOBAL') {
        const filasExistentes = this.obtenerFilasPorRequerimiento(idFila);

        // REGLA 1: No se puede cambiar a GLOBAL si ya existen 2 o más filas para este requerimiento
        if (filasExistentes.length > 1) {
          this.toaster.warning(
            'No se puede cambiar a GLOBAL porque este requerimiento ya tiene múltiples registros creados.',
            'Operación no permitida'
          );
          tipoControl.setValue('H-M', { emitEvent: false });
          return;
        }

        // REGLA 2: Si ya existía otro registro previo que era GLOBAL
        const indexActual = this.equipos.controls.findIndex(c => c === form);
        const existeOtroGlobal = filasExistentes.some(
          f => f.get('tipo')?.value === 'GLOBAL' && this.equipos.controls.indexOf(f) !== indexActual
        );

        if (existeOtroGlobal) {
          this.toaster.warning(
            'Este requerimiento ya tiene un registro GLOBAL activo.',
            'Atención'
          );
          tipoControl.setValue('H-M', { emitEvent: false });
          return;
        }
      }

      const cantidadCtrl = form.get('cantidad');
      const precioCtrl = form.get('precio_unitario');
      const totalCtrl = form.get('total_registrado');
      const tiempoCtrl = form.get('tiempo_registrado');
      const parcialCtrl = form.get('parcial');

      if (nuevoTipo === 'GLOBAL') {
        // 1. Buscamos el requerimiento correspondiente por id_grupo e id_fila
        // (si fila_requerimiento no tiene un valor seleccionado aún)
        let requerimiento = null;
        const filaReqIndex = this.fila_requerimiento?.value;

        if (filaReqIndex !== null && filaReqIndex !== '' && this.tablaRequerimientos[filaReqIndex]) {
          requerimiento = this.tablaRequerimientos[filaReqIndex];
        } else {
          requerimiento = this.tablaRequerimientos.find(
            req => Number(req.idgrupo) === Number(idGrupo) && Number(req.idfila) === Number(idFila)
          );
        }

        // 2. Extraemos los valores del requerimiento o mantenemos los que ya tenía el form como fallback
        const cantInicial = Number(requerimiento?.cantidad ?? cantidadCtrl?.value) || 0;
        const precioInicial = Number(requerimiento?.precio ?? precioCtrl?.value) || 0;
        const totalInicial = Number(requerimiento?.parcial ?? (cantInicial * precioInicial)) || 0;

        // 3. Asignamos los valores al formulario
        cantidadCtrl?.setValue(cantInicial, { emitEvent: false });
        precioCtrl?.setValue(precioInicial, { emitEvent: false });
        totalCtrl?.setValue(totalInicial, { emitEvent: false });
        tiempoCtrl?.setValue(cantInicial, { emitEvent: false });
        parcialCtrl?.setValue(totalInicial, { emitEvent: false });

        // Deshabilitamos controles para GLOBAL
        cantidadCtrl?.disable({ emitEvent: false });
        precioCtrl?.disable({ emitEvent: false });
      } else {
        // Si cambia a otro tipo diferente de GLOBAL, rehabilitamos los controles
        cantidadCtrl?.enable({ emitEvent: false });
        precioCtrl?.enable({ emitEvent: false });
      }

      totalCtrl?.disable({ emitEvent: false });
      form.updateValueAndValidity({ emitEvent: false });
    });
  }

  agregarFila() {
    const indexReq = this.formEquipo.get('fila_requerimiento')?.value;
    if (indexReq === null || indexReq === undefined || indexReq === '') return;

    const requerimiento = this.tablaRequerimientos[indexReq];
    const idFila = requerimiento?.idfila;

    // BLOQUEO: Si el requerimiento ya existe como GLOBAL, no permite agregar más filas
    if (this.requerimientoEsGlobal(idFila)) {
      this.toaster.warning(
        'Este requerimiento ya fue registrado como GLOBAL y no admite más partidas/registros.',
        'Requerimiento Bloqueado'
      );
      return;
    }

    const nuevaFila = this.crearFilaServicio();
    this.equipos.push(nuevaFila);
  }

  // Eliminar fila
  eliminarFilaModal(index: number) {
    // 1. Obtenemos el grupo actual del FormArray
    const equipoFormGroup = this.equipos.at(index);
    const valorForm = equipoFormGroup.value;

    // 2. Evaluamos desagregados (o desagregadosCompleto según cómo lo hayas nombrado)
    const desagregados = valorForm.desagregados || valorForm.desagregadosCompleto || [];

    if (desagregados && desagregados.length > 0) {
      this.toaster.error(
        'El equipo tiene registros en planilla, elimine todos los registros en planilla para poder eliminar',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return; // Cancela la eliminación
    }

    // 3. Si es en modo actualización, registramos el ID para eliminar en el backend
    if (this.actualizarEquipos) {
      const id = valorForm.id_equipo;
      if (id && !this.idEquiposEliminar.includes(id)) {
        this.idEquiposEliminar.push(id);
      }
    }

    // 4. Eliminamos la fila y reordenamos
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

  // async seleccionFilaPlanrow(row, i) {
  //   if (this.evitandoDobleEjecucion) {
  //     return;
  //   }

  //   if (this.selFilPlan == i) {
  //     return
  //   }
  //   if (this.equipoEditado && (row.tipo == 'GLOBAL' || row.tipo == 'MES')) {
  //     this.evitandoDobleEjecucion = true;
  //     await this.guardarActualizarCambiosDesagregado(true);
  //     this.evitandoDobleEjecucion = false;
  //   }
  //   this.celdaSel = [null, null]
  //   this.buscando = true
  //   this.detalleMensual = []
  //   this.acumuladoCantidades = [];
  //   this.acumuladoParciales = [];
  //   this.resumenPorAnio = [];
  //   row.item !== 0 ? this.selFilPlan = i : null
  //   this.formDesagregado.reset()
  //   while (this.tiempos.value.length) {
  //     this.tiempos.removeAt(0);
  //   }
  //   this.tipoSeleccionado = row.tipo
  //   if (row.tipo == 'GLOBAL') {
  //     // this.observaciones.enable()
  //     this.coste_unitario.setValue(this.tablaPlanilla[i].precio_unitario)
  //     this.unidad.setValue(this.tablaPlanilla[i].unidad)
  //     this.tiempo_programado.setValue(this.tablaPlanilla[i].cantidad)
  //     const dataDiaEquipo = row.valorGlobal

  //     if (dataDiaEquipo) {
  //       // Si existe, asignamos los valores
  //       this.id_desagregado.setValue(dataDiaEquipo.id_desagregado)
  //       this.horas_dia.setValue(dataDiaEquipo.horas_dia)
  //       this.minutos_dia.setValue(dataDiaEquipo.minutos_dia)
  //       this.observaciones.setValue(dataDiaEquipo.observaciones)
  //       this.coste_dia.setValue(dataDiaEquipo.costo_dia)
  //       const tiempos = dataDiaEquipo.horas_detalle
  //       if (tiempos) {
  //         const esFecha = this.tipoSeleccionado === 'MES' || this.tipoSeleccionado === 'GLOBAL';

  //         // Separar por '/' para obtener cada fila
  //         const filas = dataDiaEquipo.horas_detalle.split('/');

  //         filas.forEach((fila: string) => {
  //           // Separar por '|' para obtener inicio y fin
  //           const [valor1, valor2, valor3] = fila.split('|');

  //           // Crear el grupo según el tipo
  //           const grupoControles: any = {
  //             tiempo: [0]
  //           };

  //           if (esFecha) {
  //             grupoControles.fechaInicio = [valor1 || '', Validators.required];
  //             grupoControles.fechaFin = [valor2 || '', Validators.required];
  //           } else {
  //             grupoControles.inicio = [valor1 || '', Validators.required];
  //             grupoControles.fin = [valor2 || '', Validators.required];
  //           }
  //           grupoControles.tiempo = [valor3 || 0];
  //           const nuevoGrupo = this.fb.group(grupoControles, {
  //             validators: [this.validarFila.bind(this)]
  //           });

  //           this.tiempos.push(nuevoGrupo);
  //         });
  //         if (this.tiempos.value.length) {
  //           this.actualizarTiempoUtilizado(false);
  //         } else {
  //           this.calcularSaldo()
  //         }
  //         this.equipoEditado = false
  //       }
  //     } else {
  //       // Si no existe, limpiamos o asignamos valores por defecto
  //       this.id_desagregado.setValue(null)
  //       this.horas_dia.setValue(0)
  //       this.minutos_dia.setValue(0)
  //       this.observaciones.setValue('')
  //       this.coste_dia.setValue(0)
  //     }

  //     // El cálculo del total siempre se hace (no depende de dataDiaEquipo)
  //     let total = 0
  //     this.tablaPlanilla[i].desagregadosCompleto.forEach(ele => {
  //       total += Number(ele?.horas_dia || 0);
  //     });
  //     this.tiempo_utilizado.setValue(total)

  //     // Aquí también validamos tiempo_programado
  //     const saldo = (this.tiempo_programado?.value || 0) - total
  //     this.saldo_utilizar.setValue(saldo)
  //   } else if (row.tipo == 'DIA') {
  //     this.horas_dia.disable()

  //   } else if (row.tipo == 'MES') {
  //     const dataDiaEquipo = row.valorMensual
  //     this.coste_unitario.setValue(this.tablaPlanilla[i].precio_unitario)
  //     this.unidad.setValue(this.tablaPlanilla[i].unidad)
  //     this.tiempo_programado.setValue(this.tablaPlanilla[i].cantidad)
  //     if (dataDiaEquipo) {
  //       // Si existe, asignamos los valores
  //       this.id_desagregado.setValue(dataDiaEquipo.id_desagregado)
  //       this.horas_dia.setValue(dataDiaEquipo.horas_dia)
  //       this.minutos_dia.setValue(dataDiaEquipo.minutos_dia)
  //       this.observaciones.setValue(dataDiaEquipo.observaciones)
  //       this.coste_dia.setValue(dataDiaEquipo.costo_dia)
  //       const tiempos = dataDiaEquipo.horas_detalle
  //       if (tiempos) {
  //         const esFecha = this.tipoSeleccionado === 'MES';

  //         // Separar por '/' para obtener cada fila
  //         const filas = dataDiaEquipo.horas_detalle.split('/');

  //         filas.forEach((fila: string) => {
  //           // Separar por '|' para obtener inicio y fin
  //           const [valor1, valor2, valor3] = fila.split('|');

  //           // Crear el grupo según el tipo
  //           const grupoControles: any = {
  //             tiempo: [0]
  //           };

  //           if (esFecha) {
  //             grupoControles.fechaInicio = [valor1 || '', Validators.required];
  //             grupoControles.fechaFin = [valor2 || '', Validators.required];
  //           } else {
  //             grupoControles.inicio = [valor1 || '', Validators.required];
  //             grupoControles.fin = [valor2 || '', Validators.required];
  //           }
  //           grupoControles.tiempo = [valor3 || 0];
  //           const nuevoGrupo = this.fb.group(grupoControles, {
  //             validators: [this.validarFila.bind(this)]
  //           });

  //           this.tiempos.push(nuevoGrupo);
  //         });
  //         if (this.tiempos.value.length) {
  //           this.actualizarTiempoUtilizado(false);
  //         } else {
  //           this.calcularSaldo()
  //         }
  //       }
  //     } else {
  //       // Si no existe, limpiamos o asignamos valores por defecto
  //       this.id_desagregado.setValue(null)
  //       this.horas_dia.setValue(0)
  //       this.minutos_dia.setValue(0)
  //       this.observaciones.setValue('')
  //       this.coste_dia.setValue(0)
  //     }

  //     // El cálculo del total siempre se hace (no depende de dataDiaEquipo)
  //     let total = 0
  //     this.tablaPlanilla[i].desagregadosCompleto.forEach(ele => {
  //       total += Number(ele?.horas_dia || 0);
  //     });
  //     this.tiempo_utilizado.setValue(total)

  //     // Aquí también validamos tiempo_programado
  //     const saldo = (this.tiempo_programado?.value || 0) - total
  //     this.saldo_utilizar.setValue(saldo)

  //   }
  //   if (this.selFilPlan !== null) {
  //     await this.cambioDetalle()
  //   }
  //   if (this.tiempos.value.length) {
  //     this.observaciones.enable()
  //   }
  //   this.buscando = false
  // }

  // Helper para dar formato YYYY-MM-DD a cualquier fecha que venga del backend/UI
  private formatearFechaInput(fechaRaw: string | Date): string {
    if (!fechaRaw) return '';
    if (typeof fechaRaw === 'string') {
      return fechaRaw.split('T')[0];
    }
    const fechaObj = new Date(fechaRaw);
    return fechaObj.toISOString().split('T')[0];
  }

  async seleccionFilaPlanrow(row: any, i: number) {
    if (this.evitandoDobleEjecucion) {
      return;
    }

    if (this.selFilPlan === i) {
      return;
    }

    // 1. EVALUAR Y EJECUTAR AUTOGUARDADO EN LA FILA ANTERIOR
    const filaAnterior = this.selFilPlan !== null ? this.tablaPlanilla[this.selFilPlan] : null;

    if (this.equipoEditado && filaAnterior && (filaAnterior.tipo === 'GLOBAL' || filaAnterior.tipo === 'MES')) {
      this.evitandoDobleEjecucion = true;
      try {
        await this.guardarActualizarCambiosDesagregado(true);
      } catch (err) {
        console.error('Error durante autoguardado:', err);
      } finally {
        this.evitandoDobleEjecucion = false;
      }
    }

    // 2. RESETEAR SELECCIÓN Y LIMPIAR DATOS DE DETALLE
    this.celdaSel = [null, null]; // Se resetea explícitamente la celda previa
    this.buscando = true;
    this.detalleMensual = [];
    this.acumuladoCantidades = [];
    this.acumuladoParciales = [];
    this.resumenPorAnio = [];

    if (row.item !== 0) {
      this.selFilPlan = i;
    }

    // Limpieza modular del formulario y los FormArray de tiempos
    this.limpiarFormularioDetalle();

    // Actualizar el tipo de selección ANTES de procesar los datos
    this.tipoSeleccionado = row.tipo;

    // 3. CASO GLOBAL
    if (row.tipo === 'GLOBAL') {
      this.fechaRegistroGlobal.enable({ emitEvent: false });
      this.coste_unitario.setValue(row.precio_unitario, { emitEvent: false });
      this.unidad.setValue(row.unidad, { emitEvent: false });
      this.tiempo_programado.setValue(row.cantidad, { emitEvent: false });

      const dataDiaEquipo = row.valorGlobal;

      if (dataDiaEquipo) {
        this.id_desagregado.setValue(dataDiaEquipo.id_desagregado, { emitEvent: false });
        this.horas_dia.setValue(dataDiaEquipo.horas_dia, { emitEvent: false });
        this.minutos_dia.setValue(dataDiaEquipo.minutos_dia, { emitEvent: false });
        this.observaciones.setValue(dataDiaEquipo.observaciones, { emitEvent: false });
        this.coste_dia.setValue(dataDiaEquipo.costo_dia, { emitEvent: false });

        const fechaRaw =
          dataDiaEquipo.fechaRegistroGlobal ||
          dataDiaEquipo.fecha ||
          (row.desagregadosCompleto && row.desagregadosCompleto[0]?.fecha);

        this.fechaRegistroGlobal.setValue(fechaRaw ? this.formatearFechaInput(fechaRaw) : '', { emitEvent: false });

        // Parsear la estructura mediante método común
        this.cargarDetalleTiempos(dataDiaEquipo.horas_detalle, true);
      } else {
        this.limpiarCamposDesagregado();
        this.fechaRegistroGlobal.setValue('', { emitEvent: false });
      }

      this.calcularTotalesYSaldos(i);
    }
    // 4. CASO MES
    else if (row.tipo === 'MES') {
      this.coste_unitario.setValue(row.precio_unitario, { emitEvent: false });
      this.unidad.setValue(row.unidad, { emitEvent: false });
      this.tiempo_programado.setValue(row.cantidad, { emitEvent: false });

      const dataDiaEquipo = row.valorMensual;

      if (dataDiaEquipo) {
        this.id_desagregado.setValue(dataDiaEquipo.id_desagregado, { emitEvent: false });
        this.horas_dia.setValue(dataDiaEquipo.horas_dia, { emitEvent: false });
        this.minutos_dia.setValue(dataDiaEquipo.minutos_dia, { emitEvent: false });
        this.observaciones.setValue(dataDiaEquipo.observaciones, { emitEvent: false });
        this.coste_dia.setValue(dataDiaEquipo.costo_dia, { emitEvent: false });

        this.cargarDetalleTiempos(dataDiaEquipo.horas_detalle, true);
      } else {
        this.limpiarCamposDesagregado();
      }

      this.calcularTotalesYSaldos(i);
    }
    // 5. CASO DIA / H-M
    else if (row.tipo === 'DIA' || row.tipo === 'H-M') {
      if (row.tipo === 'DIA') {
        this.horas_dia.disable({ emitEvent: false });
      } else {
        this.horas_dia.enable({ emitEvent: false });
      }
      this.limpiarCamposDesagregado();
    }

    this.equipoEditado = false;

    if (this.selFilPlan !== null) {
      await this.cambioDetalle();
    }

    if (this.tiempos.value.length) {
      this.observaciones.enable({ emitEvent: false });
    }

    this.buscando = false;
  }

  private limpiarFormularioDetalle(): void {
    this.formDesagregado.reset(undefined, { emitEvent: false });
    this.id_desagregado.setValue(null, { emitEvent: false });
    this.horas_dia.setValue(null, { emitEvent: false });
    this.minutos_dia.setValue(null, { emitEvent: false });
    this.coste_dia.setValue(null, { emitEvent: false });
    this.observaciones.setValue(null, { emitEvent: false });

    // Limpia por completo la colección dinámica
    this.tiempos.clear({ emitEvent: false });
  }
  // =============================================================
  // MÉTODOS AUXILIARES
  // =============================================================

  private cargarDetalleTiempos(horasDetalle: string, esFecha: boolean) {
    if (!horasDetalle) return;

    const filas = horasDetalle.split('/');

    filas.forEach((fila: string) => {
      const [valor1, valor2, valor3] = fila.split('|');

      const grupoControles: any = {
        tiempo: [valor3 || 0]
      };

      if (esFecha) {
        grupoControles.fechaInicio = [valor1 || '', Validators.required];
        grupoControles.fechaFin = [valor2 || '', Validators.required];
      } else {
        grupoControles.inicio = [valor1 || '', Validators.required];
        grupoControles.fin = [valor2 || '', Validators.required];
      }

      const nuevoGrupo = this.fb.group(grupoControles, {
        validators: [this.validarFila.bind(this)]
      });

      this.tiempos.push(nuevoGrupo, { emitEvent: false });
    });

    if (this.tiempos.value.length) {
      this.actualizarTiempoUtilizado(false);
    } else {
      this.calcularSaldo();
    }
  }

  private limpiarCamposDesagregado() {
    this.id_desagregado.setValue(null, { emitEvent: false });
    this.horas_dia.setValue(0, { emitEvent: false });
    this.minutos_dia.setValue(0, { emitEvent: false });
    this.observaciones.setValue('', { emitEvent: false });
    this.coste_dia.setValue(0, { emitEvent: false });
  }

  private calcularTotalesYSaldos(indexPlanilla: number) {
    let total = 0;
    this.tablaPlanilla[indexPlanilla]?.desagregadosCompleto?.forEach((ele: any) => {
      total += Number(ele?.horas_dia || 0);
    });

    this.tiempo_utilizado.setValue(total, { emitEvent: false });
    const saldo = (this.tiempo_programado?.value || 0) - total;
    this.saldo_utilizar.setValue(saldo, { emitEvent: false });
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
      // 1. Obtener fila e ID
      const idxFila = this.celdaSel?.[0] ?? this.selFilPlan;
      const filaActual = this.tablaPlanilla?.[idxFila];
      const idEliminar = this.id_desagregado.value;

      if (!filaActual || !idEliminar) {
        console.warn('No hay registro o desagregado seleccionado para eliminar.');
        return;
      }

      const sw = await SwalService.confirm('¿Estás seguro?', 'Se eliminará el registro seleccionado');
      if (!sw.isConfirmed) return;

      this.mostrar_carga_todo = true;

      const obj = { id_desagregado: idEliminar };
      const resp = await this.equiposServiciosService.eliminarDesagregadoEquipo(obj);

      if (resp[0]?.mensaje == '1') {
        // 2. Limpiar FormArray de tiempos
        while (this.tiempos.value.length) {
          this.tiempos.removeAt(0, { emitEvent: false });
        }

        // 3. RECARGAR Y SINCRONIZAR CON LA BASE DE DATOS Y LA TABLA
        const desagregadosActualizados = await this.listarDesagregadosEquipos();
        await this.filtrarPlanillaEquiposServicios(desagregadosActualizados);

        // 4. Limpiar campos del formulario
        this.id_desagregado.setValue('', { emitEvent: false });
        this.tiempo_utilizado.setValue(0, { emitEvent: false });
        this.saldo_utilizar.setValue(this.tiempo_programado.value || 0, { emitEvent: false });
        this.minutos_dia.setValue('', { emitEvent: false });
        this.horas_dia.setValue('', { emitEvent: false });
        this.observaciones.setValue('', { emitEvent: false });
        this.coste_dia.setValue('', { emitEvent: false });
        if (this.fechaRegistroGlobal) this.fechaRegistroGlobal.setValue('', { emitEvent: false });

        this.equipoEditado = false;

        this.toaster.success('Se eliminó con éxito', 'Éxito', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
      } else {
        SwalService.error();
      }
    } catch (error) {
      console.error('Error en eliminarDesagregado:', error);
      SwalService.error();
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  async actualizarDataCompleta() {
    const i = this.filSelRegAct;

    // 1. Re-agrupar los servicios en la tabla de actividades
    const tablaRegActividades = this.tablaRegActividades.map(element => {
      element.servicios = this.tablaServiciosCompleto.filter(
        ele => Number(ele.id_grupo) === Number(element.idgrupo) && Number(ele.id_registro) === Number(element.id_registro)
      );
      return element;
    });

    this.tablaRegActividades = await this.procesarCantidadAcumulada(tablaRegActividades);

    // 2. Si había una fila seleccionada, re-seleccionarla para actualizar requerimientos y servicios
    if (i !== null && this.tablaRegActividades[i]) {
      const row = this.tablaRegActividades[i];
      this.filSelRegAct = null; // Para forzar que selTablaRegAct entre al IF
      await this.selTablaRegAct(row, i); // <-- Esto YA ejecuta calcularTotales() internamente
    }
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

  /**
 * Devuelve todas las filas activas que pertenecen al id_fila especificado.
 */
  private obtenerFilasPorRequerimiento(idFila: number | string): FormGroup[] {
    return this.equipos.controls.filter(c => c.get('id_fila')?.value === idFila) as FormGroup[];
  }

  /**
   * Verifica si un requerimiento ya tiene al menos una fila con tipo 'GLOBAL'.
   */
  marcarComoEditado(): void {
    if (!this.buscando) {
      this.equipoEditado = true;
    }
  }


  esFechaGlobalRegistrada(row: any, diaCalendario: any): boolean {
    if (!row || !diaCalendario || !row.desagregadosCompleto) return false;

    const fechaCalStr = (diaCalendario.fecha || '').split('T')[0];

    return row.desagregadosCompleto.some((item: any) => {
      const fechaItemStr = (item.fechaRegistroGlobal || item.fecha || '').split('T')[0];
      return fechaItemStr === fechaCalStr;
    });
  }


}
