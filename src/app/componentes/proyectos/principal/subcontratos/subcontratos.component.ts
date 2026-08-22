import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { EquiposServiciosService } from 'src/app/servicios/equipos-servicios.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { SubcontratosService } from 'src/app/servicios/subcontratos.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';

export interface subcontrato {
  item: string;
  descripcion: string;
  // placa: string;
  fecha_solicitud: string | null;
  unidad: string | null;
  cantidad: number | string;          // Puede venir string de input, pero para operaciones se castea a number
  precio_unitario: number | string;   // Puede venir string de input, pero para operaciones se castea a number
  parcial: number;
  estado: number;
  index_grupo: number;
  id_grupo: number;
  id_subcontrato: number;
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
  selector: 'app-subcontratos',
  templateUrl: './subcontratos.component.html',
  styleUrls: ['./subcontratos.component.scss']
})

export class SubcontratosComponent implements OnInit {
  id_proyecto = null
  scrollbut = false;
  @Input() set tabproyecto(value: any) {
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;

  }
  mostrar_carga_todo = false
  listaRegistros = []
  buscando6 = false
  id_registro = null
  tablaRegActividades: any[] = [];
  reqCompletos = []
  tablaRequerimientos = []
  filSelRegAct = null
  filSelReq = null
  tablaSubcontratos = []
  tablaSubcontratosCompleto = []
  filSelSubc = null
  calendario = []
  mesSeleccionado = null
  calendarioFiltrado = null
  grupoSeleccionado = ''
  tablaPlanilla = []
  celdaSel = [null, null];
  sumaPorDiaPlanilla = []
  totalMes = 0
  detalleMensual = []
  actualizarSubcontratos = false
  idSubcontratosEliminar = []
  selFilPlan = null
  verDetalle = ''
  subcontratoEditado = false
  estadoModificado = null
  private acumuladoCantidades: number[] = [];
  private acumuladoParciales: number[] = [];
  resumenPorAnio: any[] = [];
  iduser_local = null
  subvista = 1
  private evitandoDobleEjecucion = false;
  todosExpandidos = true
  tablaSubcontratosAgregar = []
  id_subcontrato_modificar = null
  tipoSeleccionado = 'H-M'
  todosExpandidosNueva = true
  todosExpandidosNueva2 = true
  buscando = false
  columnasEstatica = false
  @ViewChild("modalSubContratoCabecera") modalSubContratoCabecera: ModalBasicComponent;
  @ViewChild("modalSubContrato") modalSubContrato: ModalBasicComponent;
  @ViewChild("modalEstado") modalEstado: ModalBasicComponent;
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
  formSubcontratoCabecera = new UntypedFormGroup({
    id_subcontrato: new UntypedFormControl('', []),
    descripcion: new UntypedFormControl('', [Validators.required])
  })
  get id_subcontrato(): UntypedFormControl { return this.formSubcontratoCabecera.get('id_subcontrato') as UntypedFormControl }
  get descripcion_subcontrato(): UntypedFormControl { return this.formSubcontratoCabecera.get('descripcion') as UntypedFormControl }

  formSubcontratos = new UntypedFormGroup({
    fila_requerimiento: new UntypedFormControl('', [Validators.required]),
    subcontratos: new FormArray([])
  })
  get fila_requerimiento(): UntypedFormControl { return this.formSubcontratos.get('fila_requerimiento') as UntypedFormControl }
  get subcontratos(): FormArray {
    return this.formSubcontratos.get('subcontratos') as FormArray;
  }

  constructor(private fb: FormBuilder, public formService: FormsService, private _logisticaService: LogisticaService, private equiposServiciosService: EquiposServiciosService, private encriptadorService: EncriptadorService, private subcontratosService: SubcontratosService, private toaster: ToastrService) { }

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

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async cambioDataRegistro() {
    this.mostrar_carga_todo = true
    await new Promise(resolve => setTimeout(resolve, 0));

    this.limpiarVariables()
    const obj = { id_proyecto: this.id_proyecto, id_registro: this.id_registro, tipocontra: 4 }
    const resp = await this.equiposServiciosService.listarAgrupamientoRequerimientos(obj)
    const desagregados = await this.listarDesagregadosSubcontratos()
    await this.listarSubcontratos(desagregados)

    const tablaRegActividades = resp.agrupacion
      .filter(element => element.indice == null)
      .map(element => {
        element.servicios = this.tablaSubcontratosCompleto.filter(ele =>
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

  async listarDesagregadosSubcontratos() {
    try {
      const resp = await this.subcontratosService.listarDesagregadosSubcontratos({ id_proyecto: this.id_proyecto })
      return resp
    } catch (error) {
      console.log(error)
      SwalService.error()
    }

  }

  async listarSubcontratos(desagregados: any[]) {
    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: this.id_registro
    };

    const response = await this.subcontratosService.listarSubcontratos(obj);
    if (response?.length) {
      for (const element of response) {
        if (element.index_grupo !== 0) {
          // 1. Asignamos desagregados pertenecientes a este equipo
          element.desagregadosCompleto = desagregados.filter(
            ele => ele.id_subcontrato == element.id_subcontrato
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

      this.tablaSubcontratosCompleto = response;
    }


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

  limpiarVariables() {
    this.tablaRegActividades = [];
    this.reqCompletos = []
    this.tablaRequerimientos = []
    this.filSelRegAct = null
    this.filSelReq = null
    this.tablaSubcontratos = []
    this.tablaSubcontratosCompleto = []
    this.filSelSubc = null
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
    this.actualizarSubcontratos = false
    this.idSubcontratosEliminar = []
    this.selFilPlan = null
    this.verDetalle = ''
    this.subcontratoEditado = false
    // this.tipoSeleccionado = 'H-M';
    this.estadoModificado = null
    this.acumuladoCantidades = [];
    this.acumuladoParciales = [];
    this.resumenPorAnio = [];
  }

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

  calcularTotales() {
    for (const element of this.tablaRequerimientos) {
      const filtrados = this.tablaSubcontratos.filter((ele: subcontrato) =>
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

    for (let i = this.tablaSubcontratos.length - 1; i >= 0; i--) {
      const element = this.tablaSubcontratos[i];
      if (element.index_grupo === 0) {
        element.parcial = acumuladoGrupo;
        acumuladoTotal += acumuladoGrupo;
        acumuladoGrupo = 0;
      } else {
        acumuladoGrupo += Number(element.parcial) || 0;
      }
    }
  }

  async cambioVista(ind: any) {
    if (ind == this.subvista) {
      return
    }
    if (this.subcontratoEditado) {
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
        this.subcontratoEditado = false
        this.formDesagregado.reset()
        this.formDesagregado.disable()
        this.formDesagregado.get('tiempos')?.disable();
        this.grupoSeleccionado = ''
        const desagredados = await this.listarDesagregadosSubcontratos()
        await this.filtrarPlanillaSubcontratos(desagredados)

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

  async selTablaRegAct(row, i) {
    if (i !== this.filSelRegAct) {
      this.mostrar_carga_todo = true;
      this.filSelRegAct = i;
      this.filSelSubc = null;
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
        const encontrados = this.tablaSubcontratosCompleto.filter(ele =>
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
      const tablaServicios = this.tablaSubcontratosCompleto.filter(ele =>
        Number(ele.id_grupo) === Number(row.idgrupo)
      );

      this.tablaSubcontratos = [...tablaServicios]
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

  abrirModalSubcontrato() {
    this.formSubcontratoCabecera.reset()
    this.modalSubContratoCabecera.show()
  }

  cerrarModalSubcontrato() {
    this.modalSubContratoCabecera.hide()
  }

  async agregarSubcontrato() {
    try {
      if (this.formSubcontratoCabecera.invalid) {
        this.formSubcontratoCabecera.markAllAsTouched()
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
      const gruposExistentes = this.tablaSubcontratos.filter(ele => ele.index_elemento == 0)
      const elementoMayorIndex = gruposExistentes.reduce((max, ele) =>
        ele.index_grupo > max.index_grupo ? ele : max
        , gruposExistentes[0]);
      const filaRegAct = this.tablaRegActividades[this.filSelRegAct]
      const subcontrato: subcontrato = {
        cantidad: null,
        descripcion: this.descripcion_subcontrato.value,
        id_grupo: filaRegAct.idgrupo,
        fecha_solicitud: null,
        id_registro: filaRegAct.id_registro,
        index_grupo: elementoMayorIndex?.index_grupo ? (elementoMayorIndex.index_grupo + 1) : 1,
        estado: null,
        item: null,
        parcial: 0,
        // placa: null,
        precio_unitario: null,
        unidad: null,
        id_subcontrato: null,
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
      const subcontratosArray = [subcontrato];
      const idsInsertados = await this.subcontratosService.guardarSubcontrato(subcontratosArray)
      if (idsInsertados && idsInsertados.length > 0) {
        subcontratosArray.forEach((serv, index) => {
          if (index < idsInsertados.length) {
            serv.id_subcontrato = idsInsertados[index];
          }
        });
        this.tablaSubcontratosCompleto = this.tablaSubcontratosCompleto.concat(subcontratosArray)
        const row = this.tablaRegActividades[this.filSelRegAct]
        const i = this.filSelRegAct
        this.filSelRegAct = null
        await this.selTablaRegAct(row, i)
        this.modalSubContratoCabecera.hide();
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

  calcularSum(row, i) {
    let total = 0
    if (i < this.tablaSubcontratos.length - 1) {
      for (let index = i + 1; index < this.tablaSubcontratos.length; index++) {
        if (this.tablaSubcontratos[index]?.index_elemento !== 0) {
          total = this.tablaSubcontratos[index].total_registrado + total;
        } else {
          break
        }
      }
    }
    return total
  }

  abrirModalSubcontratos(row?: subcontrato) {
    this.actualizarSubcontratos = false;
    this.subcontratos.clear();

    this.fila_requerimiento.reset('');
    this.formSubcontratos.markAsPristine();
    this.formSubcontratos.markAsUntouched();
    this.formSubcontratos.updateValueAndValidity();
    this.tablaSubcontratosAgregar = [];
    this.idSubcontratosEliminar = [];

    if (row) {
      this.actualizarSubcontratos = true;
      const elementosGrupo = this.tablaSubcontratos.filter(
        ele => ele.index_grupo == row.index_grupo && ele.index_elemento !== 0
      );

      for (const requerimiento of elementosGrupo) {
        const fecha_solicitud = requerimiento.fecha_solicitud
          ? requerimiento.fecha_solicitud.split('T')[0]
          : null;
        const form = this.fb.group({
          item: ['E-' + requerimiento.id_fila],
          descripcion: [requerimiento?.descripcion || '', Validators.required],
          fecha_solicitud: [fecha_solicitud],
          unidad: [requerimiento.unidad, [Validators.required]],
          cantidad: [requerimiento.cantidad, [Validators.required]],
          precio_unitario: [requerimiento.precio_unitario, [Validators.required]],
          parcial: [requerimiento.cantidad * requerimiento.precio_unitario],
          estado: [requerimiento?.estado],
          index_grupo: [requerimiento?.index_grupo],
          id_grupo: [requerimiento?.id_grupo],
          id_subcontrato: [requerimiento?.id_subcontrato],
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


        this.subcontratos.push(form);
      }
    } else {
      this.actualizarSubcontratos = false;
    }

    this.modalSubContrato.show();
  }

  cerrarModalEquipo() {
    this.modalSubContrato.hide()
  }

  // Verifica si un requerimiento ya fue registrado/agregado como GLOBAL
  requerimientoEsGlobal(idFila: any, indexIgnorarModal: number = -1): boolean {
    if (!idFila) return false;

    // 1. Validar en registros guardados en la tabla principal
    const existeEnTabla = this.tablaSubcontratosCompleto.some(
      item => Number(item.id_fila) === Number(idFila)
    );

    if (existeEnTabla) return true;

    // 2. Validar en el FormArray del modal actual (por si se agregaron varias filas antes de guardar)
    const existeEnModal = this.subcontratos.controls.some((ctrl, index) => {
      if (index === indexIgnorarModal) return false; // Para permitir edición sobre la misma fila si fuera necesario
      const val = ctrl.value;
      return Number(val.id_fila) === Number(idFila);
    });

    return existeEnModal;
  }

  selTablaServ(row, i) {
    this.filSelSubc = i
  }

  agregarFila() {
    const indexReq = this.formSubcontratos.get('fila_requerimiento')?.value;
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
    this.subcontratos.push(nuevaFila);
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
      id_subcontrato: [null],
      id_registro: [requerimiento?.id_registro],
      id_fila: [requerimiento?.idfila],
      ind_rep: [requerimiento?.indrep],
      index_elemento: [this.subcontratos.length],
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
    // this.escucharCambioTipo(form);
    return form;
  }

  eliminarFilaModal(index: number) {
    // 1. Obtenemos el grupo actual del FormArray
    const equipoFormGroup = this.subcontratos.at(index);
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
    if (this.actualizarSubcontratos) {
      const id = valorForm.id_subcontrato;
      if (id && !this.idSubcontratosEliminar.includes(id)) {
        this.idSubcontratosEliminar.push(id);
      }
    }

    // 4. Eliminamos la fila y reordenamos
    this.subcontratos.removeAt(index);
    this.reordenarPorGrupo();
  }

  reordenarPorGrupo() {
    const valores = this.subcontratos.value;

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
        this.subcontratos.at(elementos[j].index).patchValue({
          index_elemento: j + 1  // Empieza en 1
        });
      }
    }
  }

  async agregarEquipo() {
    try {
      if (this.formSubcontratos.invalid || !this.subcontratos.value?.length) {
        this.formSubcontratos.markAllAsTouched();
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
      const filaServicio = this.tablaSubcontratos[this.filSelSubc];

      const filtrados = this.tablaSubcontratos.filter(
        ele => ele.index_grupo == filaServicio.index_grupo && ele.index_elemento !== 0
      );
      const filaRegAct = this.tablaRegActividades[this.filSelRegAct];

      let serviciosArray = [];
      let i = filtrados.length + 1;

      for (const element of this.subcontratos.getRawValue()) {

        // Si es GLOBAL y por algún motivo el total_registrado venía en 0, 
        // aseguramos que tome el valor de 'parcial' o la multiplicación de cantidad * precio
        const totalRegistradoCalculado = element.tipo === 'GLOBAL'
          ? (element.total_registrado || (element.precio_unitario * element.cantidad))
          : (element.total_registrado || 0);

        const equipo: subcontrato = {
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
          // placa: element.placa,
          precio_unitario: this.formService.redondeo(element.precio_unitario, 5),
          unidad: element.unidad,
          id_subcontrato: null,
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

      const idsInsertados = await this.subcontratosService.guardarSubcontrato(serviciosArray);

      if (idsInsertados && idsInsertados.length > 0) {
        serviciosArray.forEach((serv, index) => {
          if (index < idsInsertados.length) {
            serv.id_subcontrato = idsInsertados[index];
          }
        });

        this.tablaSubcontratosCompleto = this.tablaSubcontratosCompleto.concat(serviciosArray);
        const row = this.tablaRegActividades[this.filSelRegAct];
        const indexAct = this.filSelRegAct;
        this.filSelRegAct = null;

        await this.selTablaRegAct(row, indexAct);
        this.modalSubContrato.hide();
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

  async actualizarSubcontratosServicio() {
    try {
      if (this.subcontratos.invalid) {
        this.subcontratos.markAllAsTouched()
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
      for (const element of this.subcontratos.getRawValue()) {
        const cantidadNum = Number(element.cantidad) || 0;
        const precioNum = Number(element.precio_unitario) || 0;

        const equipo: subcontrato = {
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
          // placa: element.placa,
          precio_unitario: precioNum,
          unidad: element.unidad,
          id_subcontrato: element.id_subcontrato,
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
        idsEliminar: this.idSubcontratosEliminar,
        id_proyecto: this.id_proyecto
      };
      const response = await this.subcontratosService.actualizarEliminarSubcontratos(payload);
      if (response && response.success) {
        if (this.idSubcontratosEliminar.length > 0) {
          this.tablaSubcontratosCompleto = this.tablaSubcontratosCompleto.filter(
            item => !this.idSubcontratosEliminar.includes(item.id_subcontrato)
          );
        }

        for (const nuevo of elementosActualizar) {
          const indexExistente = this.tablaSubcontratosCompleto.findIndex(
            item => item.id_subcontrato === nuevo.id_subcontrato && nuevo.id_subcontrato !== null
          );

          if (indexExistente !== -1) {
            // Obtener el objeto existente
            const existente = this.tablaSubcontratosCompleto[indexExistente];

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

        this.tablaSubcontratosCompleto.sort((a, b) => {
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
        this.idSubcontratosEliminar = [];
        this.subcontratos.clear();
        this.modalSubContrato.hide();

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

    const novalido = this.tablaSubcontratos.find(ele => ele.index_grupo == row.index_grupo && ele.desagregadosCompleto.length)
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
      const idsSubcontratosEliminados = [];
      const indicesPrimeros = []; // Array para guardar los índices
      this.tablaSubcontratosCompleto.forEach((item, index) => {
        if (item.id_registro === row.id_registro && item.index_grupo === row.index_grupo && item.id_grupo == row.id_grupo) {
          indicesPrimeros.push(index);
          idsSubcontratosEliminados.push(item.id_subcontrato);
        }
      });

      try {

        const payload = {
          elementosActualizar: [],
          idsEliminar: idsSubcontratosEliminados,
          id_proyecto: this.id_proyecto
        };
        const response = await this.subcontratosService.actualizarEliminarSubcontratos(payload);
        if (response && response.success) {
          this.tablaSubcontratosCompleto = this.tablaSubcontratosCompleto.filter(item => {
            return !(item.id_registro === row.id_registro && item.index_grupo === row.index_grupo && item.id_grupo == row.id_grupo);
          });

          if (this.tablaSubcontratos) {
            this.tablaSubcontratos = this.tablaSubcontratos.filter(item =>
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

  async actualizarDataCompleta() {
    const i = this.filSelRegAct;

    // 1. Re-agrupar los servicios en la tabla de actividades
    const tablaRegActividades = this.tablaRegActividades.map(element => {
      element.servicios = this.tablaSubcontratosCompleto.filter(
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

  abrirModalEstado(row) {
    this.modalEstado.show()
    this.estadoModificado = null
    this.id_subcontrato_modificar = null
    this.estadoModificado = row.estado?.toString() || '1'
    this.id_subcontrato_modificar = row.id_subcontrato
  }

  cerrarModalEstado() {
    this.modalEstado.hide()
  }

  async actualizarEstadoSubcontrato() {
    try {
      this.mostrar_carga_todo = true
      const obj = {
        id_proyecto: this.id_proyecto,
        id_subcontrato: this.id_subcontrato_modificar,
        estado: this.estadoModificado
      }

      const response = await this.subcontratosService.actualizarEstadoSubcontrato(obj)
      // Verificar si la respuesta es exitosa
      if (response && Array.isArray(response) && response.length > 0 && response[0].mensaje === "Registro actualizado correctamente") {

        // Convertir estado a número si es necesario (depende de cómo lo tengas en tu array)
        const nuevoEstado = typeof this.estadoModificado === 'string'
          ? parseInt(this.estadoModificado)
          : this.estadoModificado

        // Actualizar en tablaServicios
        const indexServicios = this.tablaSubcontratos.findIndex(
          item => item.id_subcontrato === this.id_subcontrato_modificar
        )

        if (indexServicios !== -1) {
          this.tablaSubcontratos[indexServicios].estado = nuevoEstado
        }

        // Actualizar en tablaServiciosCompleto
        const indexServiciosCompleto = this.tablaSubcontratosCompleto.findIndex(
          item => item.id_subcontrato === this.id_subcontrato_modificar
        )

        if (indexServiciosCompleto !== -1) {
          this.tablaSubcontratosCompleto[indexServiciosCompleto].estado = nuevoEstado
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


  async cambioMes() {
    this.mostrar_carga_todo = true
    setTimeout(async () => {
      if (this.subcontratoEditado) {
        this.evitandoDobleEjecucion = true;
        await this.guardarActualizarCambiosDesagregado(true);
        this.evitandoDobleEjecucion = false;
      }
      this.calendarioFiltrado = this.calendario[this.mesSeleccionado]
      const desagredados = await this.listarDesagregadosSubcontratos()
      await this.filtrarPlanillaSubcontratos(desagredados)
      this.mostrar_carga_todo = false
    }, 0);

  }

  async guardarActualizarCambiosDesagregado(cambio = false): Promise<boolean | void> {

    if (!this.subcontratoEditado) {
      this.toaster.info('Ningún cambio realizado', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return;
    }

    try {
      // ==========================================
      // 1. VALIDACIÓN Y SERIALIZACIÓN DE TIEMPOS
      // ==========================================
      if (this.tiempos.invalid) {
        if (!cambio) {
          this.tiempos.markAllAsTouched();
          this.toaster.error('Datos ingresados incorrectos', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
        } else {
          this.subcontratoEditado = false;
        }
        return;
      }

      const puBase = Number(this.formDesagregado.get('coste_unitario')?.value || 0);

      const horasDetalleArray = this.tiempos.value.map((ele: any) => {
        const cantidad = Number(ele.cantidad || 0);
        const parcial = Number(ele.parcial || (cantidad * puBase));
        return `${cantidad}|${puBase}|${parcial}`;
      });
      const horasDetalle = horasDetalleArray.join('/');

      const data = this.formDesagregado.getRawValue();
      const tieneContenidoGuardable = Boolean(horasDetalle || Number(data.horas_dia) > 0);

      // Si NO tiene datos Y Tampoco tiene id_desagregado (era nuevo y se limpió) -> Cancelar operación
      if (!tieneContenidoGuardable && !data.id_desagregado) {
        this.subcontratoEditado = false;
        return;
      }

      this.mostrar_carga_todo = true;

      // ==========================================
      // 2. DETERMINACIÓN DE OBJETIVOS Y FECHA
      // ==========================================
      const targetIndex = this.celdaSel[0] ?? this.selFilPlan;
      const diaSeleccionado = this.calendarioFiltrado?.dias?.[this.celdaSel[1]];
      const targetRow = this.tablaPlanilla[targetIndex];
      const fechaPayload = diaSeleccionado?.fecha;

      if (!fechaPayload) {
        this.mostrar_carga_todo = false;
        if (cambio) this.subcontratoEditado = false;
        return false;
      }

      if (tieneContenidoGuardable) {
        if (data.id_desagregado) {
          // ==========================================
          // A. ACTUALIZACIÓN DE REGISTRO
          // ==========================================
          const obj = {
            id_desagregado: data.id_desagregado,
            id_proyecto: this.id_proyecto,
            id_subcontrato: targetRow.id_subcontrato,
            fecha: fechaPayload,
            id_proveedor: null,
            horas_dia: data.horas_dia,
            minutos_dia: data.minutos_dia || 0,
            costo_dia: data.coste_dia,
            horas_detalle: horasDetalle,
            observaciones: data.observaciones ?? '',
          };

          const resp = await this.subcontratosService.actualizarDesagregadoSubcontrato(obj);

          if (resp[0]?.mensaje === '1') {
            const rowClonada = { ...targetRow };
            const arrayCompleto = [...(rowClonada.desagregadosCompleto || [])];
            const indice = arrayCompleto.findIndex(ele => ele.id_desagregado === obj.id_desagregado);

            const objetoActualizado = {
              ...obj,
              costo_dia: Number(data.coste_dia) || 0,
              horas_dia: Number(data.horas_dia) || 0
            };

            if (indice !== -1) {
              arrayCompleto[indice] = objetoActualizado;
            } else {
              arrayCompleto.push(objetoActualizado);
            }
            rowClonada.desagregadosCompleto = arrayCompleto;

            const planillaCopy = [...(rowClonada.planilla || [])];
            planillaCopy[this.celdaSel[1]] = { ...objetoActualizado };
            rowClonada.planilla = planillaCopy;

            this.tablaPlanilla[targetIndex] = rowClonada;

            this.actualizarTotalesDia();
            this.actualizarEstadoObservaciones();
            this.calcularSaldo();

            this.subcontratoEditado = false;
            this.notificarExito();
          } else {
            SwalService.error();
          }
        } else {
          // ==========================================
          // B. CREACIÓN DE REGISTRO NUEVO
          // ==========================================
          const obj = {
            id_proyecto: this.id_proyecto,
            id_subcontrato: targetRow.id_subcontrato,
            fecha: fechaPayload,
            id_proveedor: null,
            horas_dia: data.horas_dia,
            minutos_dia: data.minutos_dia || 0,
            costo_dia: data.coste_dia,
            horas_detalle: horasDetalle,
            observaciones: data.observaciones ?? '',
          };

          const resp = await this.subcontratosService.guardarDesagregadoSubcontrato(obj);

          if (resp[0]?.id_desagregado) {
            const nuevoObj = {
              ...obj,
              id_desagregado: resp[0].id_desagregado,
              costo_dia: Number(data.coste_dia) || 0,
              horas_dia: Number(data.horas_dia) || 0
            };
            const rowClonada = { ...targetRow };

            const planillaCopy = [...(rowClonada.planilla || [])];
            planillaCopy[this.celdaSel[1]] = { ...nuevoObj };
            rowClonada.planilla = planillaCopy;

            rowClonada.desagregadosCompleto = [
              ...(rowClonada.desagregadosCompleto || []),
              { ...nuevoObj },
            ];

            this.tablaPlanilla[targetIndex] = rowClonada;

            this.id_desagregado.setValue(resp[0].id_desagregado, { emitEvent: false });

            this.actualizarTotalesDia();
            this.actualizarEstadoObservaciones();
            this.calcularSaldo();

            this.subcontratoEditado = false;
            this.notificarExito();
          } else {
            SwalService.error();
          }
        }
      } else if (data.id_desagregado) {
        // ==========================================
        // C. ELIMINACIÓN DE REGISTRO EXISTENTE
        // ==========================================
        const resp = await this.subcontratosService.eliminarDesagregadoSubcontrato({
          id_desagregado: data.id_desagregado,
        });

        if (resp[0]?.mensaje === '1') {
          this.tiempos.clear({ emitEvent: false });
          const rowClonada = { ...targetRow };

          const planillaCopy = [...(rowClonada.planilla || [])];
          planillaCopy[this.celdaSel[1]] = null;
          rowClonada.planilla = planillaCopy;

          rowClonada.desagregadosCompleto = (rowClonada.desagregadosCompleto || []).filter(
            (item: any) => item.id_desagregado !== data.id_desagregado
          );

          this.tablaPlanilla[targetIndex] = rowClonada;

          this.id_desagregado.setValue('', { emitEvent: false });
          this.minutos_dia.setValue(0, { emitEvent: false });
          this.horas_dia.setValue(0, { emitEvent: false });
          this.coste_dia.setValue(0, { emitEvent: false });
          this.observaciones.setValue('', { emitEvent: false });

          this.actualizarEstadoObservaciones();
          this.calcularSaldo();

          this.subcontratoEditado = false;
          this.notificarExito();
        } else {
          SwalService.error();
        }
      }

      this.tablaPlanilla = [...this.tablaPlanilla];
      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.error('Error en guardarActualizarCambiosDesagregado:', error);
      SwalService.error();
    }
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
      this.subcontratoEditado = true
    }

  }

  calcularSaldo() {
    const targetIndex = this.celdaSel[0] ?? this.selFilPlan;
    const filaActual = this.tablaPlanilla[targetIndex];

    if (!filaActual) return;

    let totalHorasConsumidas = 0;
    if (Array.isArray(filaActual.desagregadosCompleto)) {
      totalHorasConsumidas = filaActual.desagregadosCompleto.reduce(
        (acc: number, item: any) => acc + Number(item.horas_dia || 0), 0
      );
    }

    const programado = Number(this.tiempo_programado.value || filaActual.cantidad || 0);

    this.tiempo_utilizado.setValue(totalHorasConsumidas, { emitEvent: false });
    this.saldo_utilizar.setValue(programado - totalHorasConsumidas, { emitEvent: false });
  }

  private notificarExito(): void {
    this.subcontratoEditado = false;
    this.toaster.success('Se realizó con éxito', 'Éxito', {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: 4000,
    });
  }

  filtrarPlanillaSubcontratos(desagredados) {
    this.mostrar_carga_todo = true
    setTimeout(async () => {
      this.tablaPlanilla = []
      this.sumaPorDiaPlanilla = []
      let nuevaTabla = []
      let tablaSubcontratos = []
      this.totalMes = 0
      this.todosExpandidosNueva = true
      this.todosExpandidosNueva2 = true
      // Variable para controlar si es subvista 3
      const esSubvista3 = this.subvista === 3;

      // Array para almacenar la suma por día de todos los elementos (solo para subvista 3)
      let sumaPorDia = [];

      if (this.grupoSeleccionado !== '') {
        const row = this.tablaRegActividades[this.grupoSeleccionado]
        tablaSubcontratos = this.tablaSubcontratosCompleto.filter(ele => Number(ele.id_grupo) == Number(row.idgrupo))
        tablaSubcontratos = [...tablaSubcontratos].sort((a, b) => {
          if (a.index_grupo !== b.index_grupo) {
            return a.index_grupo - b.index_grupo;
          }
          return a.index_elemento - b.index_elemento;
        });
        this.tablaPlanilla = tablaSubcontratos.filter(ele => ele.index_grupo !== 0)

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
          const filtrados = this.tablaSubcontratosCompleto.filter(ele => Number(ele.id_grupo) == Number(element.idgrupo) && ele.index_elemento !== 0)
          const grupo = {
            "id_subcontrato": null,
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
              const encontrado = desagredados.find(reg => reg.fecha.split('T')[0] == ele.fecha && reg.id_subcontrato == element.id_subcontrato);
              return encontrado ? encontrado : null;
            });

            const completos = desagredados.filter(reg => reg.id_subcontrato == element.id_subcontrato);
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

  async cambioArea() {
    this.mostrar_carga_todo = true
    setTimeout(async () => {
      if (this.subcontratoEditado) {
        this.evitandoDobleEjecucion = true;
        await this.guardarActualizarCambiosDesagregado(true);
        this.evitandoDobleEjecucion = false;
      }
      this.calendarioFiltrado = this.calendario[this.mesSeleccionado]
      const desagredados = await this.listarDesagregadosSubcontratos()
      await this.filtrarPlanillaSubcontratos(desagredados)
      this.mostrar_carga_todo = false
    }, 0);
  }

  onVerDetalleChange(value: boolean): void {
    this.verDetalle = !this.verDetalle ? 'desagregado' : '';
    if (this.selFilPlan !== null && this.tablaPlanilla[this.selFilPlan]) {
      this.cambioDetalle()
    }
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

      this.detalleMensual = await this.procesarSubcontratosPorMes(row, this.calendario);

    } else {

    }
    this.buscando = false
  }

  procesarSubcontratosPorMes(equipo, mesesCalendario) {
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

  obtenerNombreMes(mes) {
    const nombres = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    return nombres[mes - 1];
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

  toggleTodoNueva() {
    if (this.todosExpandidosNueva) {
      this.contraerTodoNueva();
    } else {
      this.expandirTodoNueva();
    }
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

  expandirTodoNueva() {
    this.tablaPlanilla.forEach((item, index) => {
      if (item.item === 0) {
        item.icomost = '1';
        this.mostrarElementosDelGrupoNueva(index);
      }
    });
    this.todosExpandidosNueva = true;
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

  mostrarElementosDelGrupoNueva(cabeceraIndex) {
    const siguienteCabeceraIndex = this.tablaPlanilla.findIndex(
      (item, index) => index > cabeceraIndex && item.item === 0
    );

    const limite = siguienteCabeceraIndex !== -1 ? siguienteCabeceraIndex : this.tablaPlanilla.length;

    for (let i = cabeceraIndex + 1; i < limite; i++) {
      this.tablaPlanilla[i].visible = true;
    }
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

    if (this.subcontratoEditado && filaAnterior && (filaAnterior.tipo === 'GLOBAL' || filaAnterior.tipo === 'MES')) {
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

    this.subcontratoEditado = false;

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

  private formatearFechaInput(fechaRaw: string | Date): string {
    if (!fechaRaw) return '';
    if (typeof fechaRaw === 'string') {
      return fechaRaw.split('T')[0];
    }
    const fechaObj = new Date(fechaRaw);
    return fechaObj.toISOString().split('T')[0];
  }

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

  async seleccionCelda(i: number, j: number) {
    this.selFilPlan = i;

    if (this.evitandoDobleEjecucion) {
      return;
    }

    const filaActual = this.tablaPlanilla[i];
    if (!filaActual) return;

    const tipoFila = filaActual.tipo;

    if (tipoFila === 'GLOBAL' || tipoFila === 'MES') {
      return;
    }

    this.tipoSeleccionado = tipoFila;

    if (this.celdaSel[0] !== i || this.celdaSel[1] !== j) {
      if (this.subcontratoEditado) {
        this.evitandoDobleEjecucion = true;
        await this.guardarActualizarCambiosDesagregado(true);
        this.evitandoDobleEjecucion = false;
      }

      this.buscando = true;
      this.celdaSel = [i, j];

      // Resetear campos del formulario
      this.id_desagregado.reset();
      this.horas_dia.reset();
      this.minutos_dia.reset();
      this.coste_dia.reset();
      this.observaciones.reset();

      // Limpiar el FormArray de tiempos
      this.tiempos.clear({ emitEvent: false });

      // Cargar datos estáticos de la fila
      const pu = Number(filaActual.precio_unitario || 0);
      this.coste_unitario.setValue(pu, { emitEvent: false });
      this.unidad.setValue(filaActual.unidad, { emitEvent: false });
      this.tiempo_programado.setValue(filaActual.cantidad, { emitEvent: false });

      const dataDiaEquipo = filaActual.planilla?.[j];

      if (dataDiaEquipo) {
        // 1. Reconstruir FormArray usando el nuevo formato (cantidad | pu | parcial)
        if (dataDiaEquipo.horas_detalle && dataDiaEquipo.horas_detalle.trim() !== '') {
          const filas = dataDiaEquipo.horas_detalle.split('/');

          filas.forEach((filaStr: string) => {
            const [cant, precioU, parc] = filaStr.split('|');
            const cantidadNum = Number(cant || 0);
            const parcialNum = Number(parc || (cantidadNum * pu));

            const grupoControles = this.fb.group({
              cantidad: [cantidadNum],
              parcial: [parcialNum]
            });

            this.tiempos.push(grupoControles);
          });
        }

        // 2. Settear valores traídos de la base de datos
        this.id_desagregado.setValue(dataDiaEquipo.id_desagregado, { emitEvent: false });
        this.horas_dia.setValue(dataDiaEquipo.horas_dia, { emitEvent: false });
        this.minutos_dia.setValue(dataDiaEquipo.minutos_dia, { emitEvent: false });
        this.observaciones.setValue(dataDiaEquipo.observaciones, { emitEvent: false });
        this.coste_dia.setValue(dataDiaEquipo.costo_dia, { emitEvent: false });

        // 3. Recalcular acumulados del equipo/subcontrato
        let total = 0;
        if (Array.isArray(filaActual.desagregadosCompleto)) {
          filaActual.desagregadosCompleto.forEach((ele: any) => {
            total += Number(ele.horas_dia || 0);
          });
        }
        this.tiempo_utilizado.setValue(total, { emitEvent: false });
        this.saldo_utilizar.setValue((Number(this.tiempo_programado.value) || 0) - total, { emitEvent: false });
      }

      // 4. Sincronizar estado del campo observaciones y totales finales
      this.actualizarEstadoObservaciones();

      if (this.tiempos.length > 0) {
        this.actualizarTotalesDia();
      }

      this.subcontratoEditado = false;
      this.buscando = false;
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



  actualizarEstadoObservaciones() {
    const observacionesControl = this.formDesagregado.get('observaciones');

    if (this.tiempos.length > 0) {
      observacionesControl?.enable();
    } else {
      observacionesControl?.disable();
    }
  }

  // Llama a la función al agregar
  agregarTiempo() {
    const tiempoForm = this.fb.group({
      cantidad: [0],
      parcial: [0]
    });
    this.tiempos.push(tiempoForm);

    this.subcontratoEditado = true; // <-- Marca el formulario como editado al agregar
    this.actualizarEstadoObservaciones();
  }

  eliminarTiempo(idx: number) {
    this.tiempos.removeAt(idx);

    this.subcontratoEditado = true;
    this.actualizarEstadoObservaciones();
    this.actualizarTotalesDia(); // <-- Obligatorio para recalcular horas_dia y coste_dia
  }
  // Llama a la función al cargar la información inicial o resetear el formulario
  cargarDatosDesagregado(data: any) {
    // ... tu lógica de carga de datos ...

    this.actualizarEstadoObservaciones();
    this.subcontratoEditado = false; // <-- Restablece a false tras la carga inicial
  }

  calcularTiempo(idx: number) {
    const control = this.tiempos.at(idx);
    if (!control) return;

    const cantidadNueva = Number(control.get('cantidad')?.value || 0);
    const parcialAnterior = Number(control.get('parcial')?.value || 0);
    const pu = Number(this.formDesagregado.get('coste_unitario')?.value || 0);

    const parcialNuevo = cantidadNueva * pu;

    // Actualizamos el control del parcial en la fila
    control.patchValue({ parcial: parcialNuevo }, { emitEvent: false });

    // Si el valor cambia respecto al guardado, marcamos como editado
    if (parcialNuevo !== parcialAnterior) {
      this.subcontratoEditado = true;
    }

    // Recalculamos totales globales del día
    this.actualizarTotalesDia();
  }

  actualizarTotalesDia() {
    let totalCantidad = 0;
    let totalCosto = 0;

    this.tiempos.controls.forEach(ctrl => {
      totalCantidad += Number(ctrl.get('cantidad')?.value || 0);
      totalCosto += Number(ctrl.get('parcial')?.value || 0);
    });

    this.formDesagregado.patchValue({
      horas_dia: totalCantidad,
      coste_dia: totalCosto
    });
  }

  async eliminarDesagregado() {
    try {
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

      // 1. Llamada al servicio correcto de subcontratos
      const resp = await this.subcontratosService.eliminarDesagregadoSubcontrato({
        id_desagregado: idEliminar,
      });

      if (resp[0]?.mensaje === '1') {
        // 2. Limpiar FormArray de tiempos
        this.tiempos.clear({ emitEvent: false });

        // 3. Sincronizar la matriz local de la planilla e inmutabilidad
        const rowClonada = { ...filaActual };

        // Quitar de la celda de la matriz diaria
        if (this.celdaSel?.[1] !== undefined) {
          const planillaCopy = [...(rowClonada.planilla || [])];
          planillaCopy[this.celdaSel[1]] = null;
          rowClonada.planilla = planillaCopy;
        }

        // Quitar del acumulado global de la fila
        rowClonada.desagregadosCompleto = (rowClonada.desagregadosCompleto || []).filter(
          (item: any) => item.id_desagregado !== idEliminar
        );

        this.tablaPlanilla[idxFila] = rowClonada;
        this.tablaPlanilla = [...this.tablaPlanilla];

        // 4. Limpiar campos del formulario
        this.id_desagregado.setValue('', { emitEvent: false });
        this.minutos_dia.setValue(0, { emitEvent: false });
        this.horas_dia.setValue(0, { emitEvent: false });
        this.coste_dia.setValue(0, { emitEvent: false });
        this.observaciones.setValue('', { emitEvent: false });

        if (this.fechaRegistroGlobal) {
          this.fechaRegistroGlobal.setValue('', { emitEvent: false });
        }

        // 5. Reinstaurar estados de UI y saldos de la fila
        this.actualizarEstadoObservaciones();
        this.calcularSaldo();

        this.subcontratoEditado = false;

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

  expandirTodoNueva2() {
    this.tablaPlanilla.forEach((item, index) => {
      if (item.item === 0) {
        item.icomost = '1';
        this.mostrarElementosDelGrupoNueva2(index);
      }
    });
    this.todosExpandidosNueva2 = true;
  }


  toggleTodoNueva2() {
    if (this.todosExpandidosNueva2) {
      this.contraerTodoNueva2();
    } else {
      this.expandirTodoNueva2();
    }
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

}
