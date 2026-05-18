import { ProcesosRhService } from './../../../servicios/procesos-rh.service';
import { SwalService } from './../../../servicios/swal.service';
import { RecursosHumanosService } from './../../../servicios/recursoshumanos.service';
import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
const moment = require('moment');
import { filatabla } from '../../configuraciones/parametros/parametros.component';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import * as math from 'mathjs';
import { AnchocolDirective } from 'src/app/directivas/anchocol.directive';
import { Anchocol2Directive } from 'src/app/directivas/anchocol2.directive';
import { FormulaEvaluatorService } from 'src/app/servicios/formula-evaluator.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { EquiposServiciosService } from 'src/app/servicios/equipos-servicios.service';
interface DiaEntrada {
  anio: number;
  mes_nombre: string;
  mes_numero: number;
  dia_nombre: string;
  dia_numero: number;
  fecha: string;
}

interface DiaSalida {
  dia: string;
  abreviatura: string;
  numero_dia_mes: number;
  laborable: boolean;
  feriado: boolean;
  fecha: string;
}

interface MesSalida {
  mes: string;
  mes_numero: number;
  cantdias: number;
  dias: DiaSalida[];
}

interface AnioSalida {
  anio: number;
  cantmeses: number;
  cantdias: number;
  meses: MesSalida[];
}

interface filaTabla {
  id_area: number,
  area: string,
  id_cargo: number,
  cargo: string,
  id_asignacion: number,
  id_usuario: number,
  estado: string | number,
  descripcion_usuario: string,
  fecha_inicio: string,
  fecha_fin: string,
  dias: any,
  nro_grupo: number | null,
  total_jornada: number | null,
  coste_dia: number | null,
  coste_mensual: number | null,
  mostrar: boolean,
  asistenciaExistente: boolean,
  invalido: boolean,
  dias_laborados: number | null,
  dias_dominicales: number | null,
  dias_feriados: number | null,
  dias_tardanzas: number | null,
  dias_permiso: number | null,
  dias_otros: number | null,
  dias_faltados: number | null,
  descuentos: any,
  diasNoLaborables: any,
  feriadosSoloFecha: any
  tipo_cargo: number,
  estado_pago: number,
  planilla_mensual_aprobada: any
}
interface Asistencia {
  id_asistencia: number;
  id_proyecto: number;
  id_asignacion: number;
  id_usuario: number;
  id_area: number;
  id_cargo: number;
  tipo_asistencia: number;
  fecha_hora: string;
  id_supervisor: number | null;
  modo_registro: number;
  nombres_usuario: string;
  apellidos_usuario: string;
  nombre_completo_usuario: string;
  nombre_area: string;
  nombre_cargo: string;
  nombres_supervisor: string | null;
  apellidos_supervisor: string | null;
  nombre_completo_supervisor: string | null;
}

interface AsistenciaAgrupada {
  id_usuario: number;
  id_proyecto: number;
  id_area: number;
  id_cargo: number;
  id_asignacion: number;
  nombres_usuario: string;
  apellidos_usuario: string;
  nombre_completo_usuario: string;
  nombre_area: string;
  nombre_cargo: string;
  tipo_asistencia1: string | null;
  tipo_asistencia2: string | null;
  tipo_asistencia3: string | null;
  tipo_asistencia4: string | null;
  registros_completos: boolean; // Si tiene los 4 tipos de asistencia
}

interface filaPresAnalitico {
  id_presupuesto: number;
  id_proyecto: number;
  id_area: number;
  item: string;
  descripcion: string;
  abreviatura: string;
  formula: string;
  cargos: cargoFila[];
}

interface cargoFila {
  id_cargo: number;
  porcentaje: number | null;
  parcial: number | null,
  editable?: boolean
}

interface AsistenciaAgrupadaPorDia extends AsistenciaAgrupada {
  fecha: string; // Fecha en formato YYYY-MM-DD
  fecha_display: string; // Fecha para mostrar
}

interface planillaAprobada {
  id_aprobado_planilla?: number;
  id_proyecto: number;
  id_usuario: number | null;
  descripcion_usuario: string | null;
  id_area: number;
  area: string;
  id_cargo: number | null;
  cargo: string | null;
  tipo_cargo: number | null;
  dias: string; // fecha,costedia,horas_extra, monto, monto_extra, tipo
  tipos_dias: string;  //  Formato: "dias_laborados|dias_dominicales|dias_feriados|dias_tardanzas|dias_permiso|dias_faltados|dias_otros"
  coste_dia: number | null;
  coste_mensual: number | null;
  tipo_fila: number;  // 0 = Area, 1 = Cargo, 2 = Usuario (reemplaza a esArea y esCargo)
  mes: string;
  coste_pagado?: number;
  id_asignacion: number;
  estado_pago?: number; // 0 = pendiente, 1 = pagado, etc.
  adjunto?: string; // ruta o URL del archivo adjunto
}

interface FilaArea {
  esArea: true;
  id_area: number;
  area: string;
  icomost: boolean;
}

interface FilaCargo {
  esArea: false;
  id_area: number;
  area: string;
  id_cargo: number;
  cargo: string;
  tipo_cargo: number;
  tipo_cargo_vinculado: boolean;
  index: number;
  esActivo: boolean;
  mostrar: boolean;
  requerimientoVinculado: boolean;
}

type Fila = FilaArea | FilaCargo;
@Component({
  selector: 'app-planillas',
  templateUrl: './planillas.component.html',
  styleUrls: ['./planillas.component.scss']
})
export class PlanillasComponent implements OnInit, OnChanges, OnDestroy {
  @Input() idProyecto = null
  @Input() tablaPresInd = null
  abreviaturas: Record<string, string> = {
    Lunes: "Lu",
    Martes: "Ma",
    Miércoles: "Mi",
    Jueves: "Ju",
    Viernes: "Vi",
    Sábado: "Sa",
    Domingo: "Do"
  };
  noLaborables = []
  mostrar_carga_todo = false
  mesSeleccionado = 0
  meses = []
  calendario = []
  calendarioFiltrado = []
  asignaciones = []
  areaSeleccionada = ''
  areaSeleccionada2 = ''
  areas = []
  cargos = []
  cargosFiltrados = []
  cargosFiltrados2 = []
  cargoSeleccionada = ''
  cargoSeleccionada2 = ''
  tablaFiltrada: filaTabla[] = []
  tipos = [
    { codigo: 'A', tipo: 'ASISTIO' },
    { codigo: 'T', tipo: 'TARDANZA' },
    { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA' },
    { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA' },
    { codigo: 'F', tipo: 'FALTA' },
    { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA' },
    { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA' },
    { codigo: 'FM', tipo: 'DESCANSO MEDICO' },
    { codigo: 'FV', tipo: 'VACACIONES' },
    { codigo: 'FC', tipo: 'CITA MEDICA' },
    { codigo: 'FD', tipo: 'DUELO' },
    // { codigo: 'FE', tipo: 'NO MARCO ENTRADA' },
    // { codigo: 'FS', tipo: 'NO MARCO SALIDA' },
    { codigo: 'OBS', tipo: 'OBSERVADO' },
    { codigo: 'IN', tipo: 'INCOMPLETO' },
    { codigo: 'TEX', tipo: 'TEXTRA' }
  ]
  ocultarSinAsistencia: boolean = false;
  activetab = 1
  diaSeleccionado = ''
  fechaSeleccionada = ''
  tablaAsistenciaMovil = []
  filAsisMov = null
  diasSemana = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
  totalMes: number = 0;
  tablaPresAnalitico: filaPresAnalitico[] = []
  tablaPresAnaliticoFooter: filaPresAnalitico[] = []
  dec_parcial = 3
  cargosFiltradosPres = []
  areaSeleccionadaPres = null
  filPresAna = null

  contador: number = 0;
  tiempoLimite: number = 3; // 5 segundos
  intervalo: number = 100; // Actualiza cada 100ms para mayor precisión

  // horasJornal = 8
  private actualizacionEnCurso = false;
  private contadorSegundos = 0;
  private tiempoLimiteSegundos = 3; // 3 segundos de espera
  private temporizador: any = null;
  tablaMesUsuario = []
  @ViewChildren(Anchocol2Directive) anchors: QueryList<Anchocol2Directive>;
  @ViewChild("modalDetalleUsuario") modalDetalleUsuario: ModalBasicComponent;
  @ViewChild("modalvinculo") modalvinculo: ModalBasicComponent;
  @ViewChild("modalPlanillaAprobada") modalPlanillaAprobada: ModalBasicComponent;
  @ViewChild("modalPlanillaVinculo") modalPlanillaVinculo: ModalBasicComponent;
  usuarioSeleccionado: any;
  filTabFil = null
  mostrarSelColum: boolean;
  cantidadUsuariosDia: number[] = [];
  mesSelAcum = null
  areaSelAcum = null
  cargoSelAcum = null
  mesesAcum = []
  areasAcum = []
  cargosAcum = []
  cargosFiltradosAcum = []
  consolidado = []
  tablaAcumFiltrada = []
  calendarioCompleto
  calendarioFiltrado2
  totalesAcumulados = {}
  cargosFiltrados3 = []
  fechaMinima = null
  fechaMaxima = null
  tablaVinculos = []
  id_usuario = null
  searchText: string = '';
  planillaAprobada = null
  listaRegistros = []
  id_registro = null

  tablaRequerimientos = []
  tablaRegActividades = []
  tablaRequerimientosCompleto = []
  buscando3 = false
  buscando4 = false
  filSelRegAct = null
  tablaData = []
  filSelReq = null
  requerimientosCargos = []
  reqcargSeleccionado = null;
  cargosVinculados = []
  mostrar_carga: boolean = false;
  tablaReq = []
  tablaDes = []
  tablaPlanXVinc = []
  reporteEstructurado = []
  procesadosPlanilla: Set<string>;
  @Input() set tabproyecto(value: any) {

    this.idProyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    // this.id_userproy = datosrec.value.id_usuario;
    // this.tipoProy = datosproy.get('id_clasificacion').value;
    // this.colores = value.get('aspectab').value;
    // this.decima = value.get('decimal').value;
    // this.solover = value.get('solover').value;
    // this.moneda = datosproy.get('moneda').value.toString() == '0' ? 'S/' : '$';
    // this.simbolo = datosrec.value.simbolo;
    // this.nomproy = this.id_userproy = datosrec.value.descripcion;
    // this.dec_metrado = this.prueba.value.decimal.split('|')[0] ?? 2;
    // this.fechas1 = datosrec.value;
  }

  formvinculo = new UntypedFormGroup({
    id_area: new UntypedFormControl('', []),
    id_cargo: new UntypedFormControl('', []),
    fecha_inicio: new UntypedFormControl('', [Validators.required, this.validarRangoFechasPersonalizado()]),
    fecha_fin: new UntypedFormControl('', [Validators.required, this.validarRangoFechasPersonalizado()])
  }, { validators: this.validarRangoEntreFechas() }); // ← Agregar validador aquí
  get id_area_vinculo(): UntypedFormControl { return this.formvinculo.get('id_area') as UntypedFormControl }
  get id_cargo_vinculo(): UntypedFormControl { return this.formvinculo.get('id_cargo') as UntypedFormControl }
  get fecha_inicio_vinculo(): UntypedFormControl { return this.formvinculo.get('fecha_inicio') as UntypedFormControl }
  get fecha_fin_vinculo(): UntypedFormControl { return this.formvinculo.get('fecha_fin') as UntypedFormControl }

  formPlanillaVinculo = new UntypedFormGroup({
    id_vinculo: new UntypedFormControl('', []),
    descripcion: new UntypedFormControl('', [Validators.required]),
    mes: new UntypedFormControl('', [Validators.required])
  });

  get id_vinculo(): UntypedFormControl { return this.formPlanillaVinculo.get('id_vinculo') as UntypedFormControl }
  get descripcion(): UntypedFormControl { return this.formPlanillaVinculo.get('descripcion') as UntypedFormControl }
  get mes(): UntypedFormControl { return this.formPlanillaVinculo.get('mes') as UntypedFormControl }

  constructor(private ProcesosRhService: ProcesosRhService, private recursosHumanosService: RecursosHumanosService, private cdRef: ChangeDetectorRef, private appRef: ApplicationRef, private toaster: ToastrService,
    public formsService: FormsService, private formulaEvaluator: FormulaEvaluatorService, private equiposServiciosService: EquiposServiciosService, private _logisticaService: LogisticaService, private procesosRhService: ProcesosRhService, private encriptadorService: EncriptadorService) { }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      this.id_usuario = this.encriptadorService.recuperarlocalstory('idusuario');
      this.inicializarFechaActual()
      await this.listarAsignacionesProyecto()
      await this.listarAdquisiciones()
      if (this.listaRegistros?.length > 0) {
        this.id_registro = this.listaRegistros[0].id_registro
        await this.cambioDataRegistro()
      }
      // this.tablaData = this.generarTablaCompleta(this.areas, this.cargos)
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async listarAdquisiciones() {
    let res = await this._logisticaService.ListarAdquisicionesProy({ id_proyecto: this.idProyecto });

    this.listaRegistros = res

  }

  async cambioDataRegistro() {
    this.buscando3 = true
    this.tablaRegActividades = []
    this.tablaRequerimientos = []
    this.cargosVinculados = []
    this.tablaData = []
    this.filSelRegAct = null
    this.filSelReq = null
    this.requerimientosCargos = []
    this.reqcargSeleccionado = null

    const obj = { id_proyecto: this.idProyecto, id_registro: this.id_registro, tipocontra: 3 }
    const resp = await this.recursosHumanosService.listarAgrupamientoRequerimientos(obj)
    if (resp) {
      this.tablaRegActividades = resp.agrupacion
      this.tablaRequerimientosCompleto = resp.desagregados
      await this.listarRequerimientoCargo()

      this.cargosVinculados = this.requerimientosCargos.reduce((acc, ele) => {
        return acc.concat(ele.cargos.split('|'));
      }, []);

      if (this.activetab == 1) {
        this.tablaData = this.generarTablaCompleta(this.areas, this.cargos, this.cargosVinculados)
      } else if (this.activetab == 5) {
        await this.vincularReporteConRequerimientos()
      }
    }
    this.buscando3 = false
  }


  async selTablaRegAct(row, i) {
    this.buscando4 = true
    this.filSelRegAct = i
    this.filSelReq = null

    this.tablaRequerimientos = this.tablaRequerimientosCompleto.filter(ele =>
      ele.id_registro === row.id_registro &&
      String(ele.idgrupo) === String(row.idgrupo)
    )

    // await this.listarRequerimientoCargo(row)

    // this.cargosVinculados = this.requerimientosCargos.reduce((acc, ele) => {
    //   return acc.concat(ele.cargos.split('|'));
    // }, []);

    // if (this.activetab == 1) {
    //   this.tablaData = this.generarTablaCompleta(this.areas, this.cargos, this.cargosVinculados)
    // } else if (this.activetab == 5) {
    //   await this.vincularReporteConRequerimientos()
    // }

    this.buscando4 = false
  }

  clearSearch() {
    this.searchText = '';
  }

  private inicializarFechaActual() {
    const hoy = new Date();

    // Formato: YYYY-MM-DD (para input type="date")
    const year = hoy.getFullYear();
    const month = ('0' + (hoy.getMonth() + 1)).slice(-2);
    const day = ('0' + hoy.getDate()).slice(-2);

    this.fechaSeleccionada = `${year}-${month}-${day}`;

  }

  ngOnChanges() {
    // Reaplicar estilos después de que la vista se renderice
    setTimeout(() => {
      this.anchors.forEach(anchor => {
        // Forzar reaplicación
      });
    }, 100);
  }


  async cambioVista(event) {
    this.mostrar_carga_todo = true
    this.activetab = event
    this.filSelRegAct = null
    this.filSelReq = null
    if (event == 2 && !this.areaSeleccionadaPres) {
      this.areaSeleccionadaPres = this.areas.length ? this.areas[0]?.id_area : null
      await this.cambioAreaPres()
    } else if (event == 3 || event == 4) {
      this.mostrar_carga_todo = true
      this.mesSelAcum = null
      this.mesesAcum = []
      this.areasAcum = []
      this.cargosAcum = []
      this.consolidado = []
      this.tablaAcumFiltrada = []
      this.calendarioCompleto = []
      this.calendarioFiltrado2 = []
      this.totalesAcumulados = {}
      this.areaSelAcum = null
      const consolidado = await this.procesosRhService.calendarioXAsignaciones(this.idProyecto)
      this.mesesAcum = consolidado.consolidadoPorMeses?.map(ele => { return ele.mes_key })
      this.areasAcum = consolidado.areas
      this.cargosAcum = consolidado.cargos
      this.consolidado = this.agregarEncabezadosArea(consolidado.consolidadoPorMeses);
      this.calendarioCompleto = consolidado.calendario
      this.mostrar_carga_todo = false
    } else if (event == 5) {
      this.mostrar_carga_todo = true
      this.tablaReq = []
      this.tablaDes = []
      this.tablaPlanXVinc = []
      this.reporteEstructurado = []
      // Cargar tablaRegActividades y tablaRequerimientosCompleto si no existen
      if (!this.tablaRegActividades || this.tablaRegActividades.length === 0) {
        const obj = { id_proyecto: this.idProyecto, id_registro: this.id_registro, tipocontra: 3 }
        const resp = await this.recursosHumanosService.listarAgrupamientoRequerimientos(obj)
        if (resp) {
          this.tablaRegActividades = resp.agrupacion
          this.tablaRequerimientosCompleto = resp.desagregados
        }
      }

      // Cargar requerimientosCargos para todas las filas de tablaRegActividades
      if (this.tablaRegActividades && this.tablaRegActividades.length > 0) {
        // Cargar relaciones para la primera fila (o para todas)
        const primeraFila = this.tablaRegActividades[0];
        // await this.listarRequerimientoCargo(primeraFila);
      }
      const data = await this.procesosRhService.listarInformacionRHPlanilla(this.idProyecto)
      const calendario = await this.procesosRhService.calendarioXAsignaciones(this.idProyecto)
      const tabla = this.generarTablaCompleta(this.areas, this.cargos, [])
      const resultadosPorMes = await this.generarPlanillaProyecto(data, calendario, tabla)
      const reporteEstructurado = this.generarReportePlanillaPlano(resultadosPorMes, tabla);
      this.reporteEstructurado = reporteEstructurado
      await this.procesarAcumuladosRegActividades()

    }
    this.mostrar_carga_todo = false
  }


  generarTablaCompleta(areas: any[], cargos: any[], cargosVinculados: any[]): Fila[] {
    const tabla: Fila[] = [];

    areas.forEach(area => {
      tabla.push({
        esArea: true,
        id_area: area.id_area,
        area: area.descripcion,
        icomost: true
      });

      const cargosArea = cargos.filter(cargo => cargo.id_area === area.id_area);

      cargosArea.forEach(cargo => {
        let maxTipo = 0;
        const categoriasActivas = [];

        if (cargo.categoria_t1 === 1) {
          maxTipo = Math.max(maxTipo, 1);
          categoriasActivas.push(1);
        }
        if (cargo.categoria_t2 === 1) {
          maxTipo = Math.max(maxTipo, 2);
          categoriasActivas.push(2);
        }
        if (cargo.categoria_t3 === 1) {
          maxTipo = Math.max(maxTipo, 3);
          categoriasActivas.push(3);
        }
        if (cargo.categoria_t4 === 1) {
          maxTipo = Math.max(maxTipo, 4);
          categoriasActivas.push(4);
        }
        if (cargo.categoria_t5 === 1) {
          maxTipo = Math.max(maxTipo, 5);
          categoriasActivas.push(5);
        }

        for (let tipo = 1; tipo <= maxTipo; tipo++) {
          // Crear la clave de búsqueda: "id_cargo-tipo"
          const claveBusqueda = `${cargo.id_cargo}-${tipo}`;

          // Verificar si esta combinación específica existe en cargosVinculados
          const estaVinculado = cargosVinculados.includes(claveBusqueda);

          tabla.push({
            esArea: false,
            id_area: area.id_area,
            area: area.descripcion,
            id_cargo: cargo.id_cargo,
            cargo: cargo.descripcion,
            tipo_cargo: tipo,
            tipo_cargo_vinculado: estaVinculado, // Ahora refleja el estado real
            index: tipo - 1,
            esActivo: categoriasActivas.includes(tipo),
            mostrar: true,
            requerimientoVinculado: estaVinculado,
          });
        }
      });
    });

    return tabla;
  }

  agregarEncabezadosArea(consolidadoData) {
    return consolidadoData.map(mes => {
      const nuevosItems = [];
      let areaActual = null;

      mes.items.forEach((item, index) => {
        // Si es una fila de total de área, la mantenemos como está
        if (item.es_total_area) {
          // Si había un área activa, agregamos el total antes de cambiar
          if (areaActual !== null) {
            areaActual = null;
          }
          nuevosItems.push(item);
          return;
        }

        // Si cambia de área, agregamos encabezado
        if (areaActual !== item.id_area) {
          areaActual = item.id_area;

          // Creamos el encabezado del área
          const encabezadoArea = {
            id_area: item.id_area,
            descripcion_area: item.descripcion_area,
            id_cargo: null,
            descripcion_cargo: `ÁREA: ${item.descripcion_area}`,
            tipo_cargo: null,
            cantidad: null,
            asignaciones: [],
            calendario: item.calendario.map(dia => ({
              ...dia,
              detalle_asistencias: []
            })),
            costo_total: null,
            es_encabezado_area: true // Nueva bandera para identificar encabezados
          };

          nuevosItems.push(encabezadoArea);
        }

        // Agregamos el item normal
        nuevosItems.push(item);
      });

      return {
        ...mes,
        items: nuevosItems
      };
    });
  }

  ngOnDestroy() {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }

  detenerTemporizador() {
    if (this.temporizador) {
      this.actualizarPresAnaliticoRH()
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
  }

  async listarAsignacionesProyecto() {
    this.mostrar_carga_todo = true
    this.meses = []
    const obj = {
      id_proyecto: this.idProyecto
    }
    const resp = await this.recursosHumanosService.listarAsignacionesProyecto(obj)
    this.fechaMinima = resp.fecha_minima
    this.fechaMaxima = resp.fecha_maxima
    this.fechaMinima = this.convertirFormatoFecha(resp.fecha_minima);
    this.fechaMaxima = this.convertirFormatoFecha(resp.fecha_maxima);
    await this.listarAreasYCargos()
    this.asignaciones = resp.asignaciones
    if (resp) {
      this.calendario = this.agruparPorAnioMes(resp.calendario)
      for (const anio of this.calendario) {
        for (const mes of anio.meses) {
          this.meses.push(anio.anio + ' - ' + mes.mes)
        }
      }
      // await this.cambioDeMes()
    }
    this.mostrar_carga_todo = false
  }

  convertirFormatoFecha(fecha: string): string {
    if (!fecha) return '';

    // Si ya está en formato YYYY-MM-DD, devolver igual
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return fecha;
    }

    // Convertir de DD-MM-YYYY a YYYY-MM-DD
    const partes = fecha.split('-');
    if (partes.length === 3) {
      // Asumiendo formato DD-MM-YYYY
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    return fecha;
  }

  async listarAreasYCargos() {
    try {

      const obj = {
        id_proyecto: this.idProyecto
      }
      const resp = await this.recursosHumanosService.listarCargosPorArea(obj)
      this.areas = resp[0]
      this.cargos = resp[1]
    } catch (e) {
      console.log(e)
      SwalService.error()
    }
  }

  agruparPorAnioMes(
    datos: DiaEntrada[]
  ): AnioSalida[] {
    const esLaborable = (dia: string): boolean =>
      !this.noLaborables.includes(dia);
    return datos.reduce<AnioSalida[]>((acc, item) => {

      // ===== AÑO =====
      let anioObj = acc.find(a => a.anio === item.anio);
      if (!anioObj) {
        anioObj = {
          anio: item.anio,
          cantmeses: 0,
          cantdias: 0,
          meses: []
        };
        acc.push(anioObj);
      }

      // ===== MES =====
      let mesObj = anioObj.meses.find(
        m => m.mes_numero === item.mes_numero
      );

      if (!mesObj) {
        mesObj = {
          mes: item.mes_nombre,
          mes_numero: item.mes_numero,
          cantdias: 0,
          dias: []
        };
        anioObj.meses.push(mesObj);
        anioObj.cantmeses++;
      }

      // ===== DÍA =====
      mesObj.dias.push({
        dia: item.dia_nombre,
        abreviatura: this.abreviaturas[item.dia_nombre],
        numero_dia_mes: item.dia_numero,
        laborable: esLaborable(item.dia_nombre),
        feriado: false,
        fecha: item.fecha
      });

      mesObj.cantdias++;
      anioObj.cantdias++;

      return acc;
    }, []);
  }

  cambioDeMes() {
    this.mostrar_carga_todo = true
    let i = 0
    this.calendarioFiltrado = []
    for (const anio of this.calendario) {
      for (const mes of anio.meses) {
        if (i == this.mesSeleccionado) {
          this.calendarioFiltrado.push(
            {
              nombre: anio.anio + '-' + mes.mes,
              colspan: mes.cantdias,
              dias: mes.dias
            }
          )
        }
        i++
      }
    }
    this.mostrar_carga_todo = false
  }

  async cambioArea() {
    this.cargoSeleccionada = ''
    this.cargosFiltrados = this.cargos.filter(ele => ele.id_area == this.areaSeleccionada)
  }

  async cambioArea2() {
    this.cargoSeleccionada2 = ''
    this.cargosFiltrados2 = this.cargos.filter(ele => ele.id_area == this.areaSeleccionada2)
  }


  async listarRegistrosAsistencia(fechaini, fechafin) {
    const obj = {
      id_proyecto: this.idProyecto,
      fecha_inicio: fechaini,
      fecha_fin: fechafin
    }
    const res = await this.recursosHumanosService.listarRegistrosAsistencia(obj)
    return res
  }

  async filtroListadoCargos() {
    this.mostrar_carga_todo = true
    this.tablaFiltrada = []
    this.totalMes = 0
    this.cantidadUsuariosDia = []
    // 1. Desactivar detección automática temporalmente
    this.cdRef.detach();

    // 2. Forzar un solo renderizado inicial
    this.cdRef.detectChanges();
    this.mostrarSelColum = this.areaSeleccionada && this.cargoSeleccionada ? true : false

    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      await this.cambioDeMes()
      const inicio = this.calendarioFiltrado[0].dias[0].fecha
      const fin = this.calendarioFiltrado[0].dias[this.calendarioFiltrado[0].colspan - 1].fecha
      const registrosAsistencia = await this.listarRegistrosAsistencia(inicio, fin)
      const data = {
        id_proyecto: this.idProyecto,
        id_area: 0
      }
      const datos = await this.recursosHumanosService.listarHorarioYFeriadosArea(data)
      let diasMesVacios = []
      for (let i = 0; i < this.calendarioFiltrado[0]?.colspan; i++) {
        diasMesVacios.push(null)
      }
      const mesesMap = {
        'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
        'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
        'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
      };

      const mesFormateado = this.meses[this.mesSeleccionado].split(' - ')
        .reverse()
        .map((part, i) => i === 0 ? mesesMap[part] : part)
        .join('-');
      console.log('mesFormateado', mesFormateado)
      let tablaNueva = []
      const montosAreas = await this.listarMontosAreaPresAnaliticoRH()
      if (!this.areaSeleccionada) {
        let totalMes = 0
        for (const area of this.areas) {
          let letTotalAreas = 0
          const cargos = this.cargos.filter(ele => ele.id_area == area.id_area)
          let areagrupo = []
          for (const cargo of cargos) {
            let cargoTotal = 0
            const asignaciones = await this.asignaciones.filter(ele => ele.id_area == cargo.id_area && ele.id_cargo == cargo.id_cargo && this.verificarAsignacionEnMes(ele, mesFormateado))
            // console.log('asignaciones', asignaciones)
            if (!areagrupo.length && asignaciones.length) {
              const areadata: filaTabla = {
                area: area.descripcion,
                cargo: null,
                descripcion_usuario: null,
                dias: diasMesVacios,
                estado: null,
                fecha_fin: '',
                fecha_inicio: '',
                id_area: area.id_area,
                id_asignacion: null,
                id_cargo: null,
                id_usuario: null,
                nro_grupo: null,
                total_jornada: null,
                coste_dia: null,
                coste_mensual: null,
                mostrar: true,
                asistenciaExistente: true,
                invalido: false,
                dias_dominicales: null,
                dias_feriados: null,
                dias_laborados: null,
                dias_otros: null,
                dias_permiso: null,
                dias_tardanzas: null,
                dias_faltados: null,
                descuentos: null,
                diasNoLaborables: null,
                feriadosSoloFecha: null,
                tipo_cargo: null,
                estado_pago: null,
                planilla_mensual_aprobada: null
              }
              areagrupo.push(areadata)
            }
            if (asignaciones.length) {
              const cargoData: filaTabla = {
                area: area.descripcion,
                cargo: cargo.descripcion,
                descripcion_usuario: null,
                dias: diasMesVacios,
                estado: null,
                fecha_fin: '',
                fecha_inicio: '',
                id_area: area.id_area,
                id_asignacion: null,
                id_cargo: cargo.id_cargo,
                id_usuario: null,
                nro_grupo: null,
                total_jornada: null,
                coste_dia: null,
                coste_mensual: null,
                mostrar: true,
                asistenciaExistente: true,
                invalido: false,
                dias_dominicales: null,
                dias_feriados: null,
                dias_laborados: null,
                dias_otros: null,
                dias_permiso: null,
                dias_tardanzas: null,
                dias_faltados: null,
                descuentos: null,
                diasNoLaborables: null,
                feriadosSoloFecha: null,
                tipo_cargo: null,
                estado_pago: null,
                planilla_mensual_aprobada: null
              }
              areagrupo.push(cargoData)
              let j = 1
              for (const usuario of asignaciones) {
                let dataHorario = datos[0].find(ele => ele.id_area == usuario.id_area)
                if (!dataHorario) {
                  dataHorario = {
                    id_configuracion: null,
                    id_proyecto: usuario.id_proyecto,
                    id_area: usuario.id_area,
                    inicio_semana: 'LUNES',
                    dias_nolaborables: 'DOMINGO',
                    hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
                    hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
                    hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
                    hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
                    totales_dia: 48,
                    descuentos: '|10|10||100|100|||||||',
                    tardanza: 10,
                    tiempo_extra: 0
                  }
                }
                const costesCargoDia = montosAreas.find(ele => ele.id_area == usuario.id_area && ele.tipo == ('JORNAL CATEGORIA ' + usuario.tipo_cargo))?.cargos.find(ele => ele.id_cargo == usuario.id_cargo)
                let costeDia = costesCargoDia ? costesCargoDia.parcial : 0

                const descuentos = dataHorario?.descuentos.split('|')
                const diasNoLaborables = dataHorario?.dias_nolaborables.split('|')
                const feriadosSoloFecha = datos[1].filter(ele => {
                  const areas = ele.areas?.split('|');
                  return areas && areas.includes(usuario.id_area.toString());
                }).map(ele => ele.fecha.split('T')[0]);
                const resusuario = await this.filtrarPorUsuario(registrosAsistencia, usuario.id_usuario, usuario.id_asignacion, descuentos, diasNoLaborables, feriadosSoloFecha, costeDia)
                // const existe = registroMes.find(ele => ele.id_control)
                const planilla_mensual_aprobada = await this.consultarPlanillaAprobada(usuario.id_usuario, usuario.id_proyecto, mesFormateado, usuario.id_area, usuario.id_cargo)
                const asignacionData: filaTabla = {
                  area: area.descripcion,
                  cargo: cargo.descripcion,
                  descripcion_usuario: usuario.descripcion_usuario,
                  dias: resusuario.registroMes,
                  estado: usuario.estado,
                  fecha_fin: usuario.fecha_fin,
                  fecha_inicio: usuario.fecha_inicio,
                  id_area: area.id_area,
                  id_asignacion: usuario.id_asignacion,
                  id_cargo: cargo.id_cargo,
                  id_usuario: usuario.id_usuario,
                  nro_grupo: j,
                  total_jornada: 0,
                  coste_dia: costeDia,
                  coste_mensual: resusuario.montoMes,
                  mostrar: true,
                  asistenciaExistente: true,
                  invalido: resusuario.invalido,
                  dias_dominicales: resusuario.conteos.dias_dominicales,
                  dias_faltados: resusuario.conteos.dias_faltados,
                  dias_feriados: resusuario.conteos.dias_feriados,
                  dias_laborados: resusuario.conteos.dias_laborados,
                  dias_otros: resusuario.conteos.dias_otros,
                  dias_permiso: resusuario.conteos.dias_permiso,
                  dias_tardanzas: resusuario.conteos.dias_tardanzas,
                  descuentos: descuentos,
                  diasNoLaborables: diasNoLaborables,
                  feriadosSoloFecha: feriadosSoloFecha,
                  tipo_cargo: usuario.tipo_cargo,
                  estado_pago: planilla_mensual_aprobada == null ? 0 : planilla_mensual_aprobada.estado_pago,
                  planilla_mensual_aprobada: planilla_mensual_aprobada
                }
                cargoTotal += resusuario.montoMes
                areagrupo.push(asignacionData)
                j++
              }
            }
            letTotalAreas += cargoTotal
          }
          tablaNueva = tablaNueva.concat(areagrupo)
          // this.cdRef.detectChanges();
          totalMes += letTotalAreas
        }
        this.totalMes = totalMes
      } else {
        let areaarray = []
        let totalMes = 0
        for (const area of this.areas) {
          let letTotalAreas = 0
          if (area.id_area == this.areaSeleccionada) {
            const areadata: filaTabla = {
              area: area.descripcion,
              cargo: null,
              descripcion_usuario: null,
              dias: diasMesVacios,
              estado: null,
              fecha_fin: '',
              fecha_inicio: '',
              id_area: area.id_area,
              id_asignacion: null,
              id_cargo: null,
              id_usuario: null,
              nro_grupo: null,
              total_jornada: null,
              coste_dia: null,
              coste_mensual: null,
              mostrar: true,
              asistenciaExistente: true,
              invalido: false,
              dias_dominicales: null,
              dias_feriados: null,
              dias_laborados: null,
              dias_otros: null,
              dias_permiso: null,
              dias_tardanzas: null,
              dias_faltados: null,
              descuentos: null,
              diasNoLaborables: null,
              feriadosSoloFecha: null,
              tipo_cargo: null,
              estado_pago: null,
              planilla_mensual_aprobada: null
            }
            areaarray.push(areadata)
            const cargos = this.cargos.filter(ele => ele.id_area == area.id_area)
            let cargosBuscar = []
            if (this.cargoSeleccionada) {
              const encontrado = cargos.find(ele => ele.id_cargo == this.cargoSeleccionada)
              if (encontrado) {
                cargosBuscar.push(encontrado)
              }
            } else {
              cargosBuscar = cargos
            }

            for (const cargo of cargosBuscar) {
              let cargoTotal = 0
              const asignaciones = await this.asignaciones.filter(ele => ele.id_area == cargo.id_area && ele.id_cargo == cargo.id_cargo)
              const cargoData: filaTabla = {
                area: area.descripcion,
                cargo: cargo.descripcion,
                descripcion_usuario: null,
                dias: diasMesVacios,
                estado: null,
                fecha_fin: '',
                fecha_inicio: '',
                id_area: area.id_area,
                id_asignacion: null,
                id_cargo: cargo.id_cargo,
                id_usuario: null,
                nro_grupo: null,
                total_jornada: null,
                coste_dia: null,
                coste_mensual: null,
                mostrar: true,
                asistenciaExistente: true,
                invalido: false,
                dias_dominicales: null,
                dias_feriados: null,
                dias_laborados: null,
                dias_otros: null,
                dias_permiso: null,
                dias_tardanzas: null,
                dias_faltados: null,
                descuentos: null,
                diasNoLaborables: null,
                feriadosSoloFecha: null,
                tipo_cargo: null,
                estado_pago: null,
                planilla_mensual_aprobada: null
              }

              areaarray.push(cargoData)
              let j = 1
              for (const usuario of asignaciones) {
                let dataHorario = datos[0].find(ele => ele.id_area == usuario.id_area)
                if (!dataHorario) {
                  dataHorario = {
                    id_configuracion: null,
                    id_proyecto: usuario.id_proyecto,
                    id_area: usuario.id_area,
                    inicio_semana: 'LUNES',
                    dias_nolaborables: 'DOMINGO',
                    hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
                    hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
                    hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
                    hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
                    totales_dia: 48,
                    descuentos: '|10|10||100|100|||||||',
                    tardanza: 10,
                    tiempo_extra: 0
                  }
                }
                // const costesCargoHora = montosAreas.find(ele => ele.id_area == usuario.id_area && ele.tipo == "JORNAL DIARIO")?.cargos.find(ele => ele.id_cargo == usuario.id_cargo)
                const costesCargoDia = montosAreas.find(ele => ele.id_area == usuario.id_area && ele.tipo == ('JORNAL CATEGORIA ' + usuario.tipo_cargo))?.cargos.find(ele => ele.id_cargo == usuario.id_cargo)
                // let costeHora = costesCargoHora ? costesCargoHora.parcial : 0
                let costeDia = costesCargoDia ? costesCargoDia.parcial : 0
                const descuentos = dataHorario?.descuentos.split('|')
                const diasNoLaborables = dataHorario?.dias_nolaborables.split('|')
                const feriadosSoloFecha = datos[1].filter(ele => {
                  const areas = ele.areas?.split('|');
                  return areas && areas.includes(usuario.id_area.toString());
                }).map(ele => ele.fecha.split('T')[0]);
                const resusuario = await this.filtrarPorUsuario(registrosAsistencia, usuario.id_usuario, usuario.id_asignacion, descuentos, diasNoLaborables, feriadosSoloFecha, costeDia)
                const planilla_mensual_aprobada = await this.consultarPlanillaAprobada(usuario.id_usuario, usuario.id_proyecto, mesFormateado, usuario.id_area, usuario.id_cargo)

                const asignacionData: filaTabla = {
                  area: area.descripcion,
                  cargo: cargo.descripcion,
                  descripcion_usuario: usuario.descripcion_usuario,
                  dias: resusuario.registroMes,
                  estado: usuario.estado,
                  fecha_fin: usuario.fecha_fin,
                  fecha_inicio: usuario.fecha_inicio,
                  id_area: area.id_area,
                  id_asignacion: usuario.id_asignacion,
                  id_cargo: cargo.id_cargo,
                  id_usuario: usuario.id_usuario,
                  nro_grupo: j,
                  total_jornada: 0,
                  coste_dia: costeDia,
                  coste_mensual: resusuario.montoMes,
                  mostrar: true,
                  asistenciaExistente: true,
                  invalido: resusuario.invalido,
                  dias_dominicales: resusuario.conteos.dias_dominicales,
                  dias_faltados: resusuario.conteos.dias_faltados,
                  dias_feriados: resusuario.conteos.dias_feriados,
                  dias_laborados: resusuario.conteos.dias_laborados,
                  dias_otros: resusuario.conteos.dias_otros,
                  dias_permiso: resusuario.conteos.dias_permiso,
                  dias_tardanzas: resusuario.conteos.dias_tardanzas,
                  descuentos: descuentos,
                  diasNoLaborables: diasNoLaborables,
                  feriadosSoloFecha: feriadosSoloFecha,
                  tipo_cargo: usuario.tipo_cargo,
                  estado_pago: planilla_mensual_aprobada == null ? 0 : planilla_mensual_aprobada.estado_pago,
                  planilla_mensual_aprobada: planilla_mensual_aprobada
                }
                cargoTotal += resusuario.montoMes
                areaarray.push(asignacionData)
                j++
              }
              letTotalAreas += cargoTotal
            }
          }
          totalMes += letTotalAreas
        }
        this.totalMes = totalMes
        tablaNueva = areaarray
      }
      let ocultar = true
      let ocultarArea = true
      if (this.ocultarSinAsistencia) {
        for (let i = tablaNueva.length - 1; i >= 0; i--) {

          const element = tablaNueva[i];
          if (element.id_asignacion) {
            const existe = element.dias.find(ele => ele.id_control)
            ocultar = existe ? false : true
            ocultarArea = existe ? false : true
            element.asistenciaExistente = existe ? true : false
          } else if (element.id_cargo) {
            element.asistenciaExistente = !ocultar
            if (ocultar) {
              ocultar = true
            }
          } else {
            element.asistenciaExistente = !ocultarArea
            if (ocultarArea) {
              ocultarArea = true
            }
          }
        }

        this.tablaFiltrada = tablaNueva
      } else {
        this.tablaFiltrada = tablaNueva
      }
      // this.mostrar_carga_todo = false
      await this.recalcularTotales()
      console.log('this.tablaFiltrada', this.tablaFiltrada)
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.cdRef.reattach();
      this.mostrar_carga_todo = false;
      this.cdRef.detectChanges();
    }
  }

  getEstadoPago(row: any): number {
    // Si es pendiente sin planilla aprobada
    if (row.estado_pago === 0 && !row.planilla_mensual_aprobada) {
      return 0; // Pendiente
    }

    // Si es 0 pero tiene planilla aprobada, considerarlo como pagado/aprobado
    if (row.estado_pago === 0 && row.planilla_mensual_aprobada) {
      return 1; // Pagado
    }

    // Retornar el estado_pago directamente para otros casos
    return [1, 2, 3].includes(row.estado_pago) ? row.estado_pago : -1;
  }

  // Agrega esta función en tu componente
  verificarAsignacionEnMes(asignacion, mesFormateado) {
    // Convertir mesFormateado (ej: "08-2024") a fechas de inicio y fin del mes
    const [mes, anio] = mesFormateado.split('-');
    const inicioMes = new Date(parseInt(anio), parseInt(mes) - 1, 1);
    const finMes = new Date(parseInt(anio), parseInt(mes), 0); // Último día del mes

    // Convertir fechas de asignación
    const inicioAsignacion = new Date(asignacion.fecha_inicio);
    const finAsignacion = asignacion.fecha_fin ? new Date(asignacion.fecha_fin) : new Date(9999, 11, 31);

    // Verificar si hay intersección de fechas
    return (inicioAsignacion <= finMes && finAsignacion >= inicioMes);
  }

  async consultarPlanillaAprobada(id_usuario, id_proyecto, mes, id_area, id_cargo) {
    const obj = {
      id_proyecto: id_proyecto,
      id_usuario: id_usuario,
      mes: mes,
      id_area: id_area,
      id_cargo: id_cargo
    }
    const resp = await this.recursosHumanosService.consultarPlanillaAprobada(obj)
    return resp.length ? resp[0] : null
  }

  trackByFn(index: number, item: any): any {
    // Retorna un identificador único
    if (item.id_usuario) return item.id_usuario;
    if (item.id_cargo) return `cargo_${item.id_cargo}`;
    if (item.id_area) return `area_${item.id_area}`;
    return index;
  }

  filtrarPorUsuario(registrosAsistencia: any[], id_usuario: number, id_asignacion: number, descuentos: string[], diasNoLaborables: string[], feriadosSoloFecha: string[], costedia) {

    const dias = this.calendarioFiltrado[0].dias;

    // Tipos de asistencia con sus códigos
    const tipos = [
      { codigo: 'A', tipo: 'ASISTIO' },
      { codigo: 'T', tipo: 'TARDANZA' },
      { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA' },
      { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA' },
      { codigo: 'F', tipo: 'FALTA' },
      { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA' },
      { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA' },
      { codigo: 'FM', tipo: 'DESCANSO MEDICO' },
      { codigo: 'FV', tipo: 'VACACIONES' },
      { codigo: 'FC', tipo: 'CITA MEDICA' },
      { codigo: 'FD', tipo: 'DUELO' },
      { codigo: 'PE', tipo: 'PERMISO' },
      { codigo: 'OBS', tipo: 'OBSERVADO' },
      { codigo: 'IN', tipo: 'INCOMPLETO' },
      { codigo: 'TEX', tipo: 'TEXTRA' }
    ];

    // Crear un mapa para búsqueda rápida de tipos
    const tipoMap = new Map();
    tipos.forEach((tipoObj, index) => {
      tipoMap.set(tipoObj.codigo, {
        ...tipoObj,
        descuento: descuentos[index] || "0"
      });
    });

    // Crear un mapa de registros para búsqueda más rápida
    const registroMap = new Map();

    registrosAsistencia.forEach(registro => {
      if (registro.id_usuario == id_usuario && registro.id_asignacion == id_asignacion) {
        const clave = moment(registro.fecha).format('YYYY-MM-DD');
        registroMap.set(clave, registro);
      }
    });

    // Función para obtener día de la semana en español
    const getDiaSemanaEspanol = (fechaMoment: moment.Moment): string => {
      const diasMap: { [key: string]: string } = {
        'SUNDAY': 'DOMINGO',
        'MONDAY': 'LUNES',
        'TUESDAY': 'MARTES',
        'WEDNESDAY': 'MIÉRCOLES',
        'THURSDAY': 'JUEVES',
        'FRIDAY': 'VIERNES',
        'SATURDAY': 'SÁBADO'
      };

      const diaIngles = fechaMoment.format('dddd').toUpperCase();
      return diasMap[diaIngles] || diaIngles;
    };

    // Variables para acumular
    let montoTotal = 0;
    let tieneInvalido = false;

    // Inicializar contadores
    let dias_laborados = 0;
    let dias_dominicales = 0;
    let dias_feriados = 0;
    let dias_tardanzas = 0;
    let dias_permiso = 0;
    let dias_faltados = 0;
    let dias_otros = 0;

    // Procesar cada día
    const registroMes = dias.map(dia => {
      const fechaDia = moment(dia.fecha, 'DD-MM-YYYY');
      const fechaDiaKey = fechaDia.format('YYYY-MM-DD');
      const diaSemana = getDiaSemanaEspanol(fechaDia);

      const encontrado = registroMap.get(fechaDiaKey);
      const tipoCodigo = encontrado?.tipo || '';

      // Determinar si es día no laborable o feriado
      const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
      const esFeriado = feriadosSoloFecha.includes(fechaDiaKey);
      // const esDiaEspecial = esDiaNoLaborable || esFeriado;
      const esDiaEspecial = false
      // CONTAR DIAS DOMINICALES
      if (diaSemana === 'DOMINGO') {
        dias_dominicales++;
      }

      // CONTAR DIAS FERIADOS
      if (esFeriado) {
        dias_feriados++;
      }

      // Verificar si el tipo es inválido (IN o OBS)
      if (tipoCodigo === 'IN' || tipoCodigo === 'OBS') {
        tieneInvalido = true;
      }

      // CONTAR POR TIPO DE ASISTENCIA (solo si es día laborable)
      if (!esDiaEspecial) {
        // DIAS LABORADOS: 'A', 'TEX'
        if (tipoCodigo === 'A' || tipoCodigo === 'TEX') {
          dias_laborados++;
        }
        // DIAS TARDANZAS: 'T', 'TI', 'TJ'
        else if (tipoCodigo === 'T' || tipoCodigo === 'TI' || tipoCodigo === 'TJ') {
          dias_tardanzas++;
        }
        // DIAS PERMISO: 'PE'
        else if (tipoCodigo === 'PE') {
          dias_permiso++;
        }
        // DIAS FALTADOS: 'F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD'
        else if (['F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD', '', null].includes(tipoCodigo)) {
          dias_faltados++;
        }
        // DIAS OTROS: 'OBS', 'IN' y cualquier otro código no categorizado
        else if (tipoCodigo === 'OBS' || tipoCodigo === 'IN' || (tipoCodigo && !tipoMap.has(tipoCodigo))) {
          dias_otros++;
        }
      }

      // Inicializar valores
      let monto = 0;
      let descuentoAplicado = "0";
      let tipoDescripcion = '';

      // Obtener información del tipo si existe
      if (tipoCodigo && tipoCodigo !== '') {
        const tipoInfo = tipoMap.get(tipoCodigo);

        if (tipoInfo) {
          tipoDescripcion = tipoInfo.tipo;
          descuentoAplicado = tipoInfo.descuento;

          // Calcular monto con descuento (solo si no es día especial)
          if (!esDiaEspecial) {
            if (descuentoAplicado && descuentoAplicado !== "") {
              const porcentajeDescuento = parseInt(descuentoAplicado) || 0;
              const descuentoMonto = costedia * (porcentajeDescuento / 100);
              monto = costedia - descuentoMonto;
            } else {
              monto = costedia; // Sin descuento
            }
          }
          // Si es día especial, monto ya está en 0
        } else {
          // Tipo no encontrado en la lista
          tipoDescripcion = 'TIPO DESCONOCIDO';
          if (!esDiaEspecial) {
            monto = costedia;
          }
        }
      } else {
        // Tipo vacío
        tipoDescripcion = '';
        if (!esDiaEspecial) {
          monto = 0; // Tipo vacío en día laborable = 0
        }
      }

      // Si es día especial, mostrar descripción especial pero mantener el tipo original
      let descripcionMostrar = tipoDescripcion;
      if (esDiaEspecial && !tipoDescripcion) {
        descripcionMostrar = esFeriado ? 'FERIADO' : 'DIA NO LABORABLE';
      }

      // Acumular el monto total
      montoTotal += monto;

      return {
        tipo: tipoCodigo, // Mantener el tipo original
        tipoDescripcion: descripcionMostrar,
        fecha: dia.fecha,
        fuente: encontrado?.fuente || null,
        habilitado: true,
        asistencia1: encontrado?.asistencia_1,
        asistencia2: encontrado?.asistencia_2,
        asistencia3: encontrado?.asistencia_3,
        asistencia4: encontrado?.asistencia_4,
        monto_extra: encontrado?.monto_extra || 0,
        horas_extra: encontrado?.horas_extra || 0,
        id_control: encontrado?.id_control || null,
        // Campos nuevos para la funcionalidad
        monto: monto, // Será 0 si es día especial
        costedia: costedia,
        descuento: descuentoAplicado, // Mantener el descuento original
        esDiaNoLaborable: esDiaNoLaborable,
        esFeriado: esFeriado,
        esDiaEspecial: esDiaEspecial,
        // Datos adicionales del registro
        ...(encontrado ? {
          id_proyecto: encontrado.id_proyecto,
          id_usuario: encontrado.id_usuario,
          id_asignacion: encontrado.id_asignacion,
          fecha_registro: encontrado.fecha_registro
        } : {})
      };
    });

    // Retornar objeto con registroMes, montoMes e invalido
    return {
      registroMes: registroMes,
      montoMes: montoTotal,
      invalido: tieneInvalido,
      // Nuevos contadores
      conteos: {
        dias_laborados: dias_laborados,
        dias_dominicales: dias_dominicales,
        dias_feriados: dias_feriados,
        dias_tardanzas: dias_tardanzas,
        dias_permiso: dias_permiso,
        dias_faltados: dias_faltados,
        dias_otros: dias_otros
      }
    };
  }

  getSelectClass(tipoCodigo: string): string {
    const clases: { [key: string]: string } = {
      'A': 'bg-success',
      'T': 'bg-warning text-dark',
      'TI': 'bg-orange text-white',
      'TJ': 'bg-yellow text-dark',
      'F': 'bg-danger',
      'FI': 'bg-dark-red text-white',
      'FJ': 'bg-pink text-white',
      'FM': 'bg-purple text-white',
      'FV': 'bg-info text-white',
      'FC': 'bg-teal text-white',
      'FD': 'bg-dark text-white',
      'PE': 'bg-secondary text-white',
      // 'FS': 'bg-light text-dark border',

      // Nuevos estados con colores únicos
      'OBS': 'bg-indigo text-white',        // Violeta para observado
      'IN': 'bg-light-blue text-dark border',     // Cian para incompleto
      'TEX': 'bg-lime text-dark'  // Verde suave para tiempo extra
    };
    return clases[tipoCodigo] || 'bg-light text-dark';
  }

  getColor(codigo: string): string {
    const colores: { [key: string]: string } = {
      'A': '#28a745',
      'T': '#ffc107',
      'TI': '#fd7e14',
      'TJ': '#ffeb3b',
      'F': '#dc3545',
      'FI': '#c82333',
      'FJ': '#e83e8c',
      'FM': '#6f42c1',
      'FV': '#17a2b8',
      'FC': '#20c997',
      'FD': '#343a40',
      'PE': '#6c757d',
      // 'FS': '#f8f9fa',

      // Colores alternativos
      'OBS': '#8b5cf6',    // Violeta - Observado
      'IN': '#06b6d4',     // Cian - Incompleto
      'TEX': '#22c55e'     // Verde - Tiempo extra
    };
    return colores[codigo] || '#f8f9fa';
  }

  getTextColor(codigo: string): string {
    // Definir los grupos de colores de texto
    const textoBlanco = new Set([
      'TI', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD', 'OBS', // Fondos oscuros
      'A', 'F', 'PE'                                    // Variables con fondo oscuro
    ]);

    const textoNegro = new Set([
      'T', 'TJ', 'IN', 'TEX'  // Fondos claros
    ]);

    // Si está en el grupo de texto blanco, retornar 'white'
    if (textoBlanco.has(codigo)) {
      return 'white';
    }

    // Si está en el grupo de texto negro, retornar 'black'
    if (textoNegro.has(codigo)) {
      return 'black';
    }

    // Por defecto, texto negro
    return 'black';
  }

  async onTipoChange(nuevoValor: string, fila: number, columna: any) {

    // if (this.tablaFiltrada[fila].dias[columna].tipo !== nuevoValor) {
    this.tablaFiltrada[fila].dias[columna].tipo = nuevoValor
    const row = this.tablaFiltrada[fila]
    if (!this.tablaFiltrada[fila].dias[columna].id_control) {
      await this.guardarRegistro(row, row.dias[columna], nuevoValor, fila, columna)

      this.recalcularTodoFila(fila)
    } else {
      this.actualizarRegistro(row, row.dias[columna], nuevoValor, row.dias[columna].id_control, fila, columna)
    }

    // }
  }

  recalcularTodoFila(ind: number): void {

    // 1. Recalcular montos
    this.recalcularMontosFila(ind);

    // 2. Recalcular contadores
    this.recalcularContadoresFila(ind);

    this.recalcularTotales()
  }

  recalcularTotales() {
    let totalMes = 0
    this.tablaFiltrada.map(ele => { if (ele.mostrar && ele.id_usuario) { totalMes += ele.coste_mensual } })
    this.totalMes = totalMes
    const codigosFaltas = ['F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD'];
    this.cantidadUsuariosDia = this.calendarioFiltrado[0]?.dias?.map(() => 0);

    if (this.tablaFiltrada.length) {
      this.tablaFiltrada.forEach(usuario => {
        // REMOVER la condición de id_asignacion o usar un check más flexible
        // Si quieres contar incluso usuarios sin asignación, elimina este if
        // O usa: if (usuario.dias && usuario.dias.length > 0)

        usuario.dias?.forEach((dia, index) => {
          if (dia && dia.tipo && dia.tipo.trim() !== '') {
            if (!codigosFaltas.includes(dia.tipo) && this.cantidadUsuariosDia[index] !== undefined) {
              this.cantidadUsuariosDia[index] += 1;
            }
            // Si quieres contar cualquier registro con tipo no vacío:
            // if (this.cantidadUsuariosDia[index] !== undefined) {
            //   this.cantidadUsuariosDia[index] += 1;
            // }
          }
        });
      });
    }
  }

  async guardarRegistro(row, dataDia, tipo, fila, columna) {
    try {
      const partesFecha = dataDia.fecha.split('-');
      const fechaFormateada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
      const convertirFechaMySQL = (fechaStr: string) => {
        if (!fechaStr) return '';
        // Reemplazar T por espacio para formato MySQL
        return fechaStr.replace('T', ' ');
      };

      // CONVERTIR valores null a strings vacíos
      const obj = {
        id_proyecto: this.idProyecto.toString(),
        id_usuario: row.id_usuario.toString(),
        id_area: row.id_area.toString(),
        id_cargo: row.id_cargo.toString(),
        id_asignacion: row.id_asignacion.toString(),
        fecha: fechaFormateada,
        tipo: tipo,
        fuente: '1',
        asistencia_1: dataDia.asistencia1 ? convertirFechaMySQL(dataDia.asistencia1) : '',
        asistencia_2: dataDia.asistencia2 ? convertirFechaMySQL(dataDia.asistencia2) : '',
        asistencia_3: dataDia.asistencia3 ? convertirFechaMySQL(dataDia.asistencia3) : '',
        asistencia_4: dataDia.asistencia4 ? convertirFechaMySQL(dataDia.asistencia4) : '',
        horas_extra: (dataDia.horas_extra || 0).toString(),
        monto_extra: (dataDia.monto_extra || 0).toString()
      }

      const resp = await this.recursosHumanosService.guardarRegistrosAsistencia(obj)

      if (resp && resp[0]?.resultado == 'OK') {
        this.tablaFiltrada[fila].dias[columna].id_control = resp[0].id_control
        this.tablaFiltrada[fila].dias[columna].fuente = obj.fuente
        this.tablaFiltrada[fila].dias[columna].tipo = obj.tipo
      } else {
        SwalService.error()
        return null;
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
      return null;
    }
  }

  async actualizarRegistro(row, dataDia, tipo, id_control, fila, columna) {
    try {
      const partesFecha = dataDia.fecha.split('-');
      const fechaFormateada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
      const convertirFechaMySQL = (fechaStr: string) => {
        if (!fechaStr) return '';
        return fechaStr.replace('T', ' ');
      };

      const obj = {
        id_control: id_control.toString(),
        id_proyecto: this.idProyecto.toString(),
        id_usuario: row.id_usuario.toString(),
        id_area: row.id_area.toString(),
        id_cargo: row.id_cargo.toString(),
        id_asignacion: row.id_asignacion.toString(),
        fecha: fechaFormateada,
        tipo: tipo,
        fuente: "1",
        asistencia_1: dataDia.asistencia1 ? convertirFechaMySQL(dataDia.asistencia1) : '',
        asistencia_2: dataDia.asistencia2 ? convertirFechaMySQL(dataDia.asistencia2) : '',
        asistencia_3: dataDia.asistencia3 ? convertirFechaMySQL(dataDia.asistencia3) : '',
        asistencia_4: dataDia.asistencia4 ? convertirFechaMySQL(dataDia.asistencia4) : '',
        horas_extra: (dataDia.horas_extra || 0).toString(),
        monto_extra: (dataDia.monto_extra || 0).toString()
      }
      const resp = await this.recursosHumanosService.actualizarRegistrosAsistencia(obj)
      if (resp && resp[0]?.id !== '1') {
        SwalService.error()
      } else if (resp) {
        this.tablaFiltrada[fila].dias[columna].fuente = obj.fuente
        this.tablaFiltrada[fila].dias[columna].tipo = obj.tipo
        this.recalcularTodoFila(fila)
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
    }
  }

  // Método para recalcular solo los contadores de una fila específica usando los datos que ya tiene
  recalcularContadoresFila(ind: number): void {
    const row = this.tablaFiltrada[ind];

    if (!row || !row.dias || !Array.isArray(row.dias)) {
      console.error('Fila no válida o sin días');
      return;
    }

    // Usar los parámetros que ya están en la fila
    const descuentosRaw = row.descuentos || [];
    const descuentos = typeof descuentosRaw === 'string'
      ? descuentosRaw.split('|')  // No usar slice(1) porque el primer elemento vacío es para ASISTIO
      : descuentosRaw;

    // const diasNoLaborables = row.diasNoLaborables || ['DOMINGO'];
     const diasNoLaborables = []
    const feriadosSoloFecha = row.feriadosSoloFecha || [];

    // Crear mapa de tipos con descuentos
    const tipoMap = new Map();
    const tipos = [
      { codigo: 'A', tipo: 'ASISTIO' },
      { codigo: 'T', tipo: 'TARDANZA' },
      { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA' },
      { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA' },
      { codigo: 'F', tipo: 'FALTA' },
      { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA' },
      { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA' },
      { codigo: 'FM', tipo: 'DESCANSO MEDICO' },
      { codigo: 'FV', tipo: 'VACACIONES' },
      { codigo: 'FC', tipo: 'CITA MEDICA' },
      { codigo: 'FD', tipo: 'DUELO' },
      { codigo: 'PE', tipo: 'PERMISO' },
      { codigo: 'OBS', tipo: 'OBSERVADO' },
      { codigo: 'IN', tipo: 'INCOMPLETO' },
      { codigo: 'TEX', tipo: 'TEXTRA' }
    ];

    tipos.forEach((tipoObj, index) => {
      tipoMap.set(tipoObj.codigo, {
        ...tipoObj,
        descuento: descuentos[index] || "0"
      });
    });

    // Función para obtener día de la semana en español
    const getDiaSemanaEspanol = (fechaMoment: moment.Moment): string => {
      const diasMap: { [key: string]: string } = {
        'SUNDAY': 'DOMINGO',
        'MONDAY': 'LUNES',
        'TUESDAY': 'MARTES',
        'WEDNESDAY': 'MIÉRCOLES',
        'THURSDAY': 'JUEVES',
        'FRIDAY': 'VIERNES',
        'SATURDAY': 'SÁBADO'
      };

      const diaIngles = fechaMoment.format('dddd').toUpperCase();
      return diasMap[diaIngles] || diaIngles;
    };

    // Reiniciar contadores
    const conteos = {
      dias_laborados: 0,
      dias_dominicales: 0,
      dias_feriados: 0,
      dias_tardanzas: 0,
      dias_permiso: 0,
      dias_faltados: 0,
      dias_otros: 0
    };

    let tieneInvalido = false;

    // Procesar cada día
    row.dias.forEach(dia => {
      if (!dia || !dia.fecha) return;

      try {
        const fechaDia = moment(dia.fecha, 'DD-MM-YYYY');
        const fechaDiaKey = fechaDia.format('YYYY-MM-DD');
        const diaSemana = getDiaSemanaEspanol(fechaDia);

        // Determinar si es día no laborable o feriado
        const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
        const esFeriado = feriadosSoloFecha.includes(fechaDiaKey);
        const esDiaEspecial = esDiaNoLaborable || esFeriado;

        // CONTAR DIAS DOMINICALES
        if (diaSemana === 'DOMINGO') {
          conteos.dias_dominicales++;
        }

        // CONTAR DIAS FERIADOS
        if (esFeriado) {
          conteos.dias_feriados++;
        }

        // Verificar si el tipo es inválido (IN o OBS)
        if (dia.tipo === 'IN' || dia.tipo === 'OBS') {
          tieneInvalido = true;
        }

        // CONTAR POR TIPO DE ASISTENCIA (solo si es día laborable)
        if (!esDiaEspecial) {
          const tipoCodigo = dia.tipo || '';

          // DIAS LABORADOS: 'A', 'TEX'
          if (tipoCodigo === 'A' || tipoCodigo === 'TEX') {
            conteos.dias_laborados++;
          }
          // DIAS TARDANZAS: 'T', 'TI', 'TJ'
          else if (tipoCodigo === 'T' || tipoCodigo === 'TI' || tipoCodigo === 'TJ') {
            conteos.dias_tardanzas++;
          }
          // DIAS PERMISO: 'PE'
          else if (tipoCodigo === 'PE') {
            conteos.dias_permiso++;
          }
          // DIAS FALTADOS: 'F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD'
          else if (['F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD', '', null].includes(tipoCodigo)) {
            conteos.dias_faltados++;
          }
          // DIAS OTROS: 'OBS', 'IN' y cualquier otro código no categorizado
          else if (tipoCodigo === 'OBS' || tipoCodigo === 'IN' || (tipoCodigo && !tipoMap.has(tipoCodigo))) {
            conteos.dias_otros++;
          }
        }
      } catch (error) {
        console.warn('Error procesando día:', dia, error);
      }
    });

    // Actualizar la fila directamente
    row.dias_dominicales = conteos.dias_dominicales;
    row.dias_faltados = conteos.dias_faltados;
    row.dias_feriados = conteos.dias_feriados;
    row.dias_laborados = conteos.dias_laborados;
    row.dias_otros = conteos.dias_otros;
    row.dias_permiso = conteos.dias_permiso;
    row.dias_tardanzas = conteos.dias_tardanzas;
    row.invalido = tieneInvalido;


    // También recalcular coste_mensual si es necesario (sumando los montos de cada día)
    if (row.dias && row.dias.length > 0) {
      const nuevoCosteMensual = row.dias.reduce((total, dia) => {
        return total + (dia?.monto || 0);
      }, 0);

      row.coste_mensual = nuevoCosteMensual;
    }

    // Forzar actualización de la vista
    this.tablaFiltrada = [...this.tablaFiltrada];

  }

  // Método para recalcular solo los montos de una fila (si cambió el tipo de asistencia)
  recalcularMontosFila(ind: number): void {
    const row = this.tablaFiltrada[ind];

    if (!row || !row.dias || !Array.isArray(row.dias)) {
      return;
    }

    // Usar los parámetros que ya están en la fila
    // const descuentos = row.descuentos || [];
    const descuentosRaw = row.descuentos || [];
    const descuentos = typeof descuentosRaw === 'string'
      ? descuentosRaw.split('|')  // No usar slice(1) porque el primer elemento vacío es para ASISTIO
      : descuentosRaw;


    // Crear mapa de tipos con descuentos
    const tipoMap = new Map();
    const tipos = [
      { codigo: 'A', tipo: 'ASISTIO' },
      { codigo: 'T', tipo: 'TARDANZA' },
      { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA' },
      { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA' },
      { codigo: 'F', tipo: 'FALTA' },
      { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA' },
      { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA' },
      { codigo: 'FM', tipo: 'DESCANSO MEDICO' },
      { codigo: 'FV', tipo: 'VACACIONES' },
      { codigo: 'FC', tipo: 'CITA MEDICA' },
      { codigo: 'FD', tipo: 'DUELO' },
      { codigo: 'PE', tipo: 'PERMISO' },
      { codigo: 'OBS', tipo: 'OBSERVADO' },
      { codigo: 'IN', tipo: 'INCOMPLETO' },
      { codigo: 'TEX', tipo: 'TEXTRA' }
    ];

    tipos.forEach((tipoObj, index) => {
      tipoMap.set(tipoObj.codigo, {
        ...tipoObj,
        descuento: descuentos[index] || "0"
      });
    });

    let montoTotal = 0;

    // Procesar cada día para recalcular montos
    row.dias.forEach(dia => {
      if (!dia || !dia.fecha) return;

      try {
        const fechaDia = moment(dia.fecha, 'DD-MM-YYYY');
        const fechaDiaKey = fechaDia.format('YYYY-MM-DD');
        const diaSemana = this.getDiaSemanaEspanol(fechaDia);

        // Usar los parámetros de la fila
        // const diasNoLaborables = row.diasNoLaborables || ['DOMINGO'];
         const diasNoLaborables = []
        const feriadosSoloFecha = row.feriadosSoloFecha || [];

        const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
        const esFeriado = feriadosSoloFecha.includes(fechaDiaKey);
        const esDiaEspecial = esDiaNoLaborable || esFeriado;

        const tipoCodigo = dia.tipo || '';
        let monto = 0;
        let descuentoAplicado = "0";

        // Obtener información del tipo si existe
        if (tipoCodigo && tipoCodigo !== '') {
          const tipoInfo = tipoMap.get(tipoCodigo);

          if (tipoInfo) {
            descuentoAplicado = tipoInfo.descuento;

            // Calcular monto con descuento (solo si no es día especial)
            if (!esDiaEspecial) {
              if (descuentoAplicado && descuentoAplicado !== "") {
                const porcentajeDescuento = parseInt(descuentoAplicado) || 0;
                const descuentoMonto = dia.costedia * (porcentajeDescuento / 100);
                monto = dia.costedia - descuentoMonto;
              } else {
                monto = dia.costedia; // Sin descuento
              }
            }
            // Si es día especial, monto ya está en 0
          } else {
            // Tipo no encontrado en la lista
            if (!esDiaEspecial) {
              monto = dia.costedia;
            }
          }
        } else {
          // Tipo vacío
          if (!esDiaEspecial) {
            monto = 0; // Tipo vacío en día laborable = 0
          }
        }

        // Actualizar el monto del día
        dia.monto = monto;
        dia.descuento = descuentoAplicado;
        montoTotal += monto;

      } catch (error) {
        console.warn('Error recalculando monto para día:', dia, error);
      }
    });

    // Actualizar el coste_mensual de la fila
    row.coste_mensual = montoTotal;

    // Forzar actualización de la vista
    this.tablaFiltrada = [...this.tablaFiltrada];

  }

  // Método auxiliar: obtener día de la semana en español
  getDiaSemanaEspanol(fecha: moment.Moment): string {
    const diasMap: { [key: string]: string } = {
      'SUNDAY': 'DOMINGO',
      'MONDAY': 'LUNES',
      'TUESDAY': 'MARTES',
      'WEDNESDAY': 'MIÉRCOLES',
      'THURSDAY': 'JUEVES',
      'FRIDAY': 'VIERNES',
      'SATURDAY': 'SÁBADO'
    };

    const diaIngles = fecha.format('dddd').toUpperCase();
    return diasMap[diaIngles] || diaIngles;
  }

  async listarAsistenciasMovil() {

    try {
      this.mostrar_carga_todo = true
      this.tablaAsistenciaMovil = []
      this.filAsisMov = null
      const obj = {
        id_proyecto: this.idProyecto,
        id_area: this.areaSeleccionada2,
        id_cargo: this.cargoSeleccionada2,
        fecha_inicio: this.fechaSeleccionada,
        fecha_fin: this.fechaSeleccionada,
      }
      const tablaAsistenciaMovil = await this.recursosHumanosService.listarAsistenciaMovil(obj)
      if (!tablaAsistenciaMovil.length) {
        this.toaster.info(
          'No se encontraron registros para esta fecha',
          '',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      } else {
        const response = await this.agrupar(tablaAsistenciaMovil)
        this.tablaAsistenciaMovil = response
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }

  }

  // async vincularASistenciaDiaPlanilla(tablaAsistenciaMovil) {
  //   try {
  //     console.log('vincularASistenciaDiaPlanilla', tablaAsistenciaMovil)
  //     if (!tablaAsistenciaMovil.length) {
  //       this.toaster.info(
  //         'Ningun dato que vincular',
  //         '',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         }
  //       );
  //       this.mostrar_carga_todo = false
  //       return
  //     }
  //     // this.mostrar_carga_todo = true
  //     const data = {
  //       id_proyecto: this.idProyecto,
  //       id_area: 0
  //     }
  //     const datos = await this.recursosHumanosService.listarHorarioYFeriadosArea(data)
  //     console.log('horarios', datos)
  //     let dataAlmacenar = []
  //     for (const usuario of tablaAsistenciaMovil) {
  //       let horarioArea = datos[0].find(ele => ele.id_area == usuario.id_area)
  //       if (!horarioArea) {
  //         horarioArea = {
  //           id_configuracion: null,
  //           id_proyecto: usuario.id_proyecto,
  //           id_area: usuario.id_area,
  //           inicio_semana: 'LUNES',
  //           dias_nolaborables: 'DOMINGO',
  //           hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
  //           hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
  //           hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
  //           hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
  //           totales_dia: 48,
  //           descuentos: '|10|10||100|100|||||||',
  //           tardanza: 0,
  //           tiempo_extra: 0
  //         }
  //       }
  //       console.log('horarioArea', horarioArea)
  //       let feriados = []
  //       if (datos[1]?.length) {
  //         feriados = datos[1]
  //           .filter(ele => {
  //             const areas = ele.areas?.split('|');
  //             return areas.includes(usuario.id_area.toString());
  //           })
  //           .map(ele => {
  //             return {
  //               ...ele,
  //               fecha_formateada: moment(ele.fecha).format('DD-MM-YYYY')
  //             };
  //           });
  //       }
  //       const resultado = await this.analizarUsuario(usuario, horarioArea, horarioArea.tardanza ? horarioArea.tardanza : 0)
  //       const fecha = usuario.tipo_asistencia1 ||
  //         usuario.tipo_asistencia2 ||
  //         usuario.tipo_asistencia3 ||
  //         usuario.tipo_asistencia4
  //       const convertirFechaMySQL = (fechaStr: string) => {
  //         if (!fechaStr) return null;
  //         // Reemplazar T por espacio para formato MySQL
  //         return fechaStr.replace('T', ' ');
  //       };
  //       const obj =
  //       {
  //         id_proyecto: usuario.id_proyecto,
  //         id_usuario: usuario.id_usuario,
  //         id_area: usuario.id_area,
  //         id_cargo: usuario.id_cargo,
  //         id_asignacion: usuario.id_asignacion,
  //         fecha: moment(fecha).format('YYYY-MM-DD'),
  //         tipo: resultado.estado || '',
  //         fuente: 0,
  //         fecha_registro: null,
  //         asistencia_1: usuario.tipo_asistencia1 ? convertirFechaMySQL(usuario.tipo_asistencia1) : null,
  //         asistencia_2: usuario.tipo_asistencia2 ? convertirFechaMySQL(usuario.tipo_asistencia2) : null,
  //         asistencia_3: usuario.tipo_asistencia3 ? convertirFechaMySQL(usuario.tipo_asistencia3) : null,
  //         asistencia_4: usuario.tipo_asistencia4 ? convertirFechaMySQL(usuario.tipo_asistencia4) : null,
  //         horas_extra: 0,
  //         monto_extra: 0
  //       }
  //       dataAlmacenar.push(obj)
  //     }
  //     // const datos1 = JSON.stringify(dataAlmacenar);
  //     // const obj = JSON.stringify({
  //     //   datos1: datos1,
  //     // });
  //     const resp = await this.recursosHumanosService.guardarActualizarRegistrosAsistencia(dataAlmacenar)
  //     if (resp?.id == "1") {
  //       this.tablaFiltrada = []
  //       this.toaster.success(
  //         resp?.mensaje,
  //         'Correcto',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 5000,
  //         }
  //       );
  //     } else {
  //       SwalService.error()
  //     }
  //     this.mostrar_carga_todo = false
  //   } catch (error) {
  //     console.log(error)
  //     this.mostrar_carga_todo = false
  //     SwalService.error()
  //   }
  // }

  async vincularASistenciaDiaPlanilla(tablaAsistenciaMovil, obj) {
    try {

      if (!tablaAsistenciaMovil.length) {
        this.toaster.info(
          'Ningun dato que vincular',
          '',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        this.mostrar_carga_todo = false;
        return;
      }

      const data = {
        id_proyecto: this.idProyecto,
        id_area: 0
      };

      const datos = await this.recursosHumanosService.listarHorarioYFeriadosArea(data);

      // Validar la estructura de datos
      const horarios = datos[0] || []; // Array de horarios
      const feriadosData = datos[1] || []; // Array de feriados (puede ser vacío)

      let dataAlmacenar = [];

      for (const usuario of tablaAsistenciaMovil) {
        // Buscar horario del área
        let horarioArea = horarios.find(ele => ele.id_area == usuario.id_area);

        if (!horarioArea) {
          horarioArea = {
            id_configuracion: null,
            id_proyecto: usuario.id_proyecto,
            id_area: usuario.id_area,
            inicio_semana: 'LUNES',
            dias_nolaborables: 'DOMINGO',
            hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
            hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
            hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
            hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
            totales_dia: 48,
            descuentos: '|10|10||100|100|||||||',
            tardanza: 0,
            tiempo_extra: 0
          };
        }


        // Procesar feriados - VALIDANDO QUE EXISTAN DATOS
        let feriados = [];

        // Verificar si feriadosData existe y tiene longitud
        if (feriadosData && feriadosData.length) {
          feriados = feriadosData
            .filter(ele => {
              // Validar si areas es null o undefined
              if (!ele.areas) {
                return false; // Si areas es null, no aplicar a ninguna área
              }

              // Convertir el string de áreas a array
              const areas = ele.areas.split('|');

              // Verificar si el área del usuario está incluida
              return areas.includes(usuario.id_area.toString());
            })
            .map(ele => {
              return {
                ...ele,
                fecha_formateada: moment(ele.fecha).format('DD-MM-YYYY')
              };
            });
        }


        // Analizar usuario
        const resultado = await this.analizarUsuario(
          usuario,
          horarioArea,
          horarioArea.tardanza ? horarioArea.tardanza : 0
        );

        // Obtener fecha de asistencia
        const fecha = usuario.tipo_asistencia1 ||
          usuario.tipo_asistencia2 ||
          usuario.tipo_asistencia3 ||
          usuario.tipo_asistencia4;

        // Función para convertir fecha a formato MySQL
        const convertirFechaMySQL = (fechaStr: string) => {
          if (!fechaStr) return null;
          // Reemplazar T por espacio para formato MySQL
          return fechaStr.replace('T', ' ');
        };

        const obj = {
          id_proyecto: usuario.id_proyecto,
          id_usuario: usuario.id_usuario,
          id_area: usuario.id_area,
          id_cargo: usuario.id_cargo,
          id_asignacion: usuario.id_asignacion,
          fecha: moment(fecha).format('YYYY-MM-DD'),
          tipo: resultado.estado || '',
          fuente: 0,
          fecha_registro: null,
          asistencia_1: usuario.tipo_asistencia1 ? convertirFechaMySQL(usuario.tipo_asistencia1) : null,
          asistencia_2: usuario.tipo_asistencia2 ? convertirFechaMySQL(usuario.tipo_asistencia2) : null,
          asistencia_3: usuario.tipo_asistencia3 ? convertirFechaMySQL(usuario.tipo_asistencia3) : null,
          asistencia_4: usuario.tipo_asistencia4 ? convertirFechaMySQL(usuario.tipo_asistencia4) : null,
          horas_extra: 0,
          monto_extra: 0
        };

        dataAlmacenar.push(obj);
      }

      // Guardar registros
      const resp = await this.recursosHumanosService.guardarActualizarRegistrosAsistencia(dataAlmacenar);

      if (resp?.id == "1") {
        this.tablaFiltrada = [];
        await this.guardarRegistroVinculoPlanilla(obj)
        this.toaster.success(
          resp?.mensaje,
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
      } else {
        SwalService.error();
      }

      this.mostrar_carga_todo = false;
      // this.modalvinculo.hide()
    } catch (error) {
      console.log(error);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  agrupar(asistencias: Asistencia[]): AsistenciaAgrupada[] {
    const grupos = new Map<string, any>();

    asistencias.forEach(asistencia => {
      const clave = this.generarClave(asistencia);

      if (!grupos.has(clave)) {
        grupos.set(clave, this.crearGrupoBase(asistencia));
      }

      this.asignarAsistenciaPorTipo(grupos.get(clave), asistencia);
    });

    return this.procesarGrupos(grupos);
  }

  // Generar clave única para agrupación
  generarClave(asistencia: Asistencia): string {
    return `${asistencia.id_usuario}_${asistencia.id_proyecto}_${asistencia.id_area}_${asistencia.id_cargo}_${asistencia.id_asignacion}`;
  }

  // Crear objeto base del grupo
  crearGrupoBase(asistencia: Asistencia): any {
    return {
      id_usuario: asistencia.id_usuario,
      id_proyecto: asistencia.id_proyecto,
      id_area: asistencia.id_area,
      id_cargo: asistencia.id_cargo,
      id_asignacion: asistencia.id_asignacion,
      nombres_usuario: asistencia.nombres_usuario,
      apellidos_usuario: asistencia.apellidos_usuario,
      nombre_completo_usuario: asistencia.nombre_completo_usuario,
      nombre_area: asistencia.nombre_area,
      nombre_cargo: asistencia.nombre_cargo,
      tipo_asistencia1: null,
      tipo_asistencia2: null,
      tipo_asistencia3: null,
      tipo_asistencia4: null,
      total_registros: 0
    };
  }

  // Asignar asistencia según tipo
  asignarAsistenciaPorTipo(grupo: any, asistencia: Asistencia): void {
    const propiedad = `tipo_asistencia${asistencia.tipo_asistencia}`;
    if (grupo.hasOwnProperty(propiedad)) {
      grupo[propiedad] = asistencia.fecha_hora;
      grupo.total_registros++;
    }
  }

  // Procesar y añadir propiedades adicionales
  procesarGrupos(grupos: Map<string, any>): AsistenciaAgrupada[] {
    return Array.from(grupos.values()).map(grupo => {
      const registrosCompletos = grupo.tipo_asistencia1 !== null &&
        grupo.tipo_asistencia2 !== null &&
        grupo.tipo_asistencia3 !== null &&
        grupo.tipo_asistencia4 !== null;

      return {
        ...grupo,
        registros_completos: registrosCompletos,
        tiene_ingreso: grupo.tipo_asistencia1 !== null,
        tiene_salida_almuerzo: grupo.tipo_asistencia2 !== null,
        tiene_retorno_almuerzo: grupo.tipo_asistencia3 !== null,
        tiene_salida: grupo.tipo_asistencia4 !== null
      };
    });
  }

  // // Filtrar por usuario específico
  // static filtrarPorUsuario(asistenciasAgrupadas: AsistenciaAgrupada[], idUsuario: number): AsistenciaAgrupada[] {
  //   return asistenciasAgrupadas.filter(grupo => grupo.id_usuario === idUsuario);
  // }

  // Obtener usuarios con registros incompletos
  static obtenerIncompletos(asistenciasAgrupadas: AsistenciaAgrupada[]): AsistenciaAgrupada[] {
    return asistenciasAgrupadas.filter(grupo => !grupo.registros_completos);
  }

  obtenerIndiceDia(fechaString) {
    // Extraer solo la parte de la fecha (sin hora)
    const fechaPart = fechaString.split('T')[0];
    const [year, month, day] = fechaPart.split('-').map(Number);

    // Crear fecha en hora local pero forzando la hora a mediodía
    // para evitar problemas de cambios de día por diferencia horaria
    const fecha = new Date(year, month - 1, day, 12, 0, 0);

    const diaJS = fecha.getDay();

    // Convertir: Lunes=0, Domingo=6
    return diaJS === 0 ? 6 : diaJS - 1;
  }

  // Convertir hora string "HH:MM:SS" a milisegundos del día
  horaStringAMilisegundos(horaStr) {
    if (!horaStr || horaStr === '00:00:00') return null;

    const partes = horaStr.split(':');
    const horas = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);
    const segundos = parseInt(partes[2]);

    return (horas * 3600 + minutos * 60 + segundos) * 1000;
  }

  // analizarUsuario(usuario, horarioArea, toleranciaTardanza) {
  //   // Obtener el día del primer registro (asumiendo que todos los registros son del mismo día)
  //   const fechaRegistro = usuario.tipo_asistencia1 ||
  //     usuario.tipo_asistencia2 ||
  //     usuario.tipo_asistencia3 ||
  //     usuario.tipo_asistencia4;

  //   if (!fechaRegistro) {
  //     return {
  //       estado: 'falto',
  //       diferencias: null,
  //       detalles: 'No hay registros de asistencia'
  //     };
  //   }

  //   const indiceDia = this.obtenerIndiceDia(fechaRegistro);
  //   const diaSemana = this.diasSemana[indiceDia];
  //   // Obtener horas esperadas para ese día

  //   const horasEsperadas = {
  //     ingresoManana: horarioArea.hora_ingreso_manana.split('|')[indiceDia],
  //     salidaManana: horarioArea.hora_salida_manana.split('|')[indiceDia],
  //     ingresoTarde: horarioArea.hora_ingreso_tarde.split('|')[indiceDia],
  //     salidaTarde: horarioArea.hora_salida_tarde.split('|')[indiceDia]
  //   };
  //   // Calcular diferencias
  //   const diferencias = {
  //     tipo1: this.calcularDiferencia(usuario.tipo_asistencia1, horasEsperadas.ingresoManana),
  //     tipo2: this.calcularDiferencia(usuario.tipo_asistencia2, horasEsperadas.salidaManana),
  //     tipo3: this.calcularDiferencia(usuario.tipo_asistencia3, horasEsperadas.ingresoTarde),
  //     tipo4: this.calcularDiferencia(usuario.tipo_asistencia4, horasEsperadas.salidaTarde)
  //   };
  //    console.log('horasEsperadas', horasEsperadas)
  //   console.log('diferencias', diferencias)
  //   // Contar registros existentes
  //   const registrosExistentes = [
  //     usuario.tipo_asistencia1,
  //     usuario.tipo_asistencia2,
  //     usuario.tipo_asistencia3,
  //     usuario.tipo_asistencia4
  //   ].filter(reg => reg !== null && reg !== undefined).length;
  //   // Verificar si es día no laborable
  //   const esDiaNoLaborable = horarioArea.dias_nolaborables.includes(diaSemana) ||
  //     horasEsperadas.ingresoManana === '00:00:00';

  //   if (esDiaNoLaborable) {
  //     return {
  //       estado: 'observado',
  //       diferencias: diferencias,
  //       detalles: `Día no laborable (${diaSemana})`,
  //       registrosCompletos: registrosExistentes === 4
  //     };
  //   }

  //   // Evaluar estado según criterios
  //   let estado = '';
  //   let detalles = '';

  //   // 1. Falto - No hay ningún registro
  //   if (registrosExistentes === 0) {
  //     estado = 'F';
  //     detalles = 'No hay registros de asistencia';
  //   }
  //   // 2. Asistió - Todos los registros en hora exacta
  //   else if (diferencias.tipo1 === 0 &&
  //     diferencias.tipo2 === 0 &&
  //     diferencias.tipo3 === 0 &&
  //     diferencias.tipo4 === 0) {
  //     estado = 'A';
  //     detalles = 'Todos los registros en hora exacta';
  //   }
  //   // 3. Tardanza - Ingreso mañana o tarde después del tiempo de tolerancia
  //   else if (registrosExistentes == 4 && ((diferencias.tipo1 > 0 && diferencias.tipo1 * 1000 > toleranciaTardanza) ||
  //     (diferencias.tipo3 > 0 && diferencias.tipo3 * 1000 > toleranciaTardanza))) {

  //     estado = 'T';
  //     detalles = `Retraso en ingreso (tolerancia: ${horarioArea.tardanza || 10} min)`;
  //   }
  //   // 4. Horas Exceso - Salida mañana o tarde después de la hora
  //   else if (registrosExistentes == 4 && ((diferencias.tipo2 > 0 && diferencias.tipo2 > 0) ||
  //     (diferencias.tipo4 > 0 && diferencias.tipo4 > 0))) {
  //     estado = 'TEX';
  //     detalles = 'Tiempo extra trabajado';
  //   }
  //   // 5. Incompleto - Faltan registros (pero hay al menos uno)
  //   else if (registrosExistentes < 4) {
  //     estado = 'IN';
  //     detalles = `Faltan ${4 - registrosExistentes} registros`;
  //   }
  //   // 6. Observado - Otros casos (antes de la hora, dentro de tolerancia, etc.)
  //   else {
  //     estado = 'OBS';
  //     detalles = 'Registros dentro de parámetros normales';
  //   }

  //   return {
  //     estado: estado,
  //     diferencias: diferencias,
  //     detalles: detalles,
  //     registrosCompletos: registrosExistentes === 4,
  //     dia: diaSemana,
  //     horasEsperadas: horasEsperadas
  //   };
  // }

  analizarUsuario(usuario, horarioArea, toleranciaTardanza) {
    // Obtener el día del primer registro (asumiendo que todos los registros son del mismo día)
    const fechaRegistro = usuario.tipo_asistencia1 ||
      usuario.tipo_asistencia2 ||
      usuario.tipo_asistencia3 ||
      usuario.tipo_asistencia4;

    if (!fechaRegistro) {
      return {
        estado: 'falto',
        diferencias: null,
        detalles: 'No hay registros de asistencia'
      };
    }

    const indiceDia = this.obtenerIndiceDia(fechaRegistro);
    const diaSemana = this.diasSemana[indiceDia];

    // Obtener horas esperadas para ese día
    const horasEsperadas = {
      ingresoManana: this.obtenerHoraEsperada(horarioArea.hora_ingreso_manana, indiceDia),
      salidaManana: this.obtenerHoraEsperada(horarioArea.hora_salida_manana, indiceDia),
      ingresoTarde: this.obtenerHoraEsperada(horarioArea.hora_ingreso_tarde, indiceDia),
      salidaTarde: this.obtenerHoraEsperada(horarioArea.hora_salida_tarde, indiceDia)
    };
    const registros = {
      ingresoManana: usuario.tipo_asistencia1,
      salidaManana: usuario.tipo_asistencia2,
      ingresoTarde: usuario.tipo_asistencia3,
      salidaTarde: usuario.tipo_asistencia4
    }

    // Verificar si existen las horas esperadas
    const existeIngresoManana = horasEsperadas.ingresoManana !== null && horasEsperadas.ingresoManana !== '00:00:00';
    const existeSalidaManana = horasEsperadas.salidaManana !== null && horasEsperadas.salidaManana !== '00:00:00';
    const existeIngresoTarde = horasEsperadas.ingresoTarde !== null && horasEsperadas.ingresoTarde !== '00:00:00';
    const existeSalidaTarde = horasEsperadas.salidaTarde !== null && horasEsperadas.salidaTarde !== '00:00:00';

    // Verificar registros existentes del usuario
    const existeRegistro1 = usuario.tipo_asistencia1 !== null && usuario.tipo_asistencia1 !== undefined;
    const existeRegistro2 = usuario.tipo_asistencia2 !== null && usuario.tipo_asistencia2 !== undefined;
    const existeRegistro3 = usuario.tipo_asistencia3 !== null && usuario.tipo_asistencia3 !== undefined;
    const existeRegistro4 = usuario.tipo_asistencia4 !== null && usuario.tipo_asistencia4 !== undefined;

    // Contar registros existentes
    const registrosExistentes = [
      existeRegistro1,
      existeRegistro2,
      existeRegistro3,
      existeRegistro4
    ].filter(existe => existe).length;

    // Verificar si es día no laborable
    const esDiaNoLaborable = horarioArea.dias_nolaborables.includes(diaSemana) ||
      (!existeIngresoManana && !existeSalidaManana && !existeIngresoTarde && !existeSalidaTarde);

    if (esDiaNoLaborable) {
      // Verificar si hay registros en día no laborable
      if (registrosExistentes > 0) {
        return {
          estado: 'OBS',
          diferencias: null,
          detalles: `Registros en día no laborable (${diaSemana})`,
          registrosCompletos: false,
          dia: diaSemana,
          horasEsperadas: horasEsperadas
        };
      }
      return {
        estado: 'observado',
        diferencias: null,
        detalles: `Día no laborable (${diaSemana})`,
        registrosCompletos: false,
        dia: diaSemana,
        horasEsperadas: horasEsperadas
      };
    }

    // Verificar incompatibilidad entre registros y horas esperadas
    // Si no existe hora esperada pero sí existe registro -> OBS
    if ((!existeIngresoManana && existeRegistro1) ||
      (!existeSalidaManana && existeRegistro2) ||
      (!existeIngresoTarde && existeRegistro3) ||
      (!existeSalidaTarde && existeRegistro4)) {
      return {
        estado: 'OBS',
        diferencias: null,
        detalles: 'Registro sin hora esperada correspondiente',
        registrosCompletos: false,
        dia: diaSemana,
        horasEsperadas: horasEsperadas,
        tardanza: toleranciaTardanza,
        tiempo_extra: horarioArea.tiempo_extra
      };
    }

    // Si no existe registro pero sí existe hora esperada -> IN (incompleto)
    const registrosFaltantes = [];
    if (existeIngresoManana && !existeRegistro1) registrosFaltantes.push('ingreso mañana');
    if (existeSalidaManana && !existeRegistro2) registrosFaltantes.push('salida mañana');
    if (existeIngresoTarde && !existeRegistro3) registrosFaltantes.push('ingreso tarde');
    if (existeSalidaTarde && !existeRegistro4) registrosFaltantes.push('salida tarde');

    if (registrosFaltantes.length > 0) {
      return {
        estado: 'IN',
        diferencias: null,
        detalles: `Faltan registros: ${registrosFaltantes.join(', ')}`,
        registrosCompletos: false,
        dia: diaSemana,
        horasEsperadas: horasEsperadas,
        tardanza: toleranciaTardanza,
        tiempo_extra: horarioArea.tiempo_extra
      };
    }

    // Si no hay registros ni horas esperadas (día libre) -> observado
    if (registrosExistentes === 0 &&
      !existeIngresoManana &&
      !existeSalidaManana &&
      !existeIngresoTarde &&
      !existeSalidaTarde) {
      return {
        estado: 'observado',
        diferencias: null,
        detalles: 'Día sin horas laborales definidas',
        registrosCompletos: false,
        dia: diaSemana,
        horasEsperadas: horasEsperadas,
        tardanza: toleranciaTardanza,
        tiempo_extra: horarioArea.tiempo_extra
      };
    }

    // Calcular diferencias solo para las combinaciones que existen
    const diferencias = {
      tipo1: existeRegistro1 && existeIngresoManana ?
        this.calcularDiferencia(usuario.tipo_asistencia1, horasEsperadas.ingresoManana) : null,
      tipo2: existeRegistro2 && existeSalidaManana ?
        this.calcularDiferencia(usuario.tipo_asistencia2, horasEsperadas.salidaManana) : null,
      tipo3: existeRegistro3 && existeIngresoTarde ?
        this.calcularDiferencia(usuario.tipo_asistencia3, horasEsperadas.ingresoTarde) : null,
      tipo4: existeRegistro4 && existeSalidaTarde ?
        this.calcularDiferencia(usuario.tipo_asistencia4, horasEsperadas.salidaTarde) : null
    };



    // Convertir minutos a segundos para comparaciones
    const toleranciaTardanzaSegundos = toleranciaTardanza * 60; // minutos a segundos
    const tiempoExtraSegundos = (horarioArea.tiempo_extra || 0) * 60; // minutos a segundos

    // console.log('Tolerancia tardanza:', toleranciaTardanza, 'min =', toleranciaTardanzaSegundos, 'seg');
    // console.log('Tiempo extra:', horarioArea.tiempo_extra || 0, 'min =', tiempoExtraSegundos, 'seg');

    // Evaluar estado según criterios
    let estado = '';
    let detalles = '';

    // 1. Falto - No hay ningún registro cuando debería haber
    if (registrosExistentes === 0 && (existeIngresoManana || existeSalidaManana || existeIngresoTarde || existeSalidaTarde)) {
      estado = 'falto';
      detalles = 'No hay registros de asistencia';
    }
    // 2. Asistió - Todos los registros en hora exacta (solo donde ambos existen)
    else if ((!existeRegistro1 || diferencias.tipo1 === 0) &&
      (!existeRegistro2 || diferencias.tipo2 === 0) &&
      (!existeRegistro3 || diferencias.tipo3 === 0) &&
      (!existeRegistro4 || diferencias.tipo4 === 0)) {
      estado = 'A';
      detalles = 'Todos los registros en hora exacta';
    }
    // 3. Tardanza - Ingreso mañana o tarde dentro de la tolerancia (positivo pero <= tolerancia)
    else if (((existeRegistro1 && existeIngresoManana && diferencias.tipo1 > 0 && diferencias.tipo1 <= toleranciaTardanzaSegundos) ||
      (existeRegistro3 && existeIngresoTarde && diferencias.tipo3 > 0 && diferencias.tipo3 <= toleranciaTardanzaSegundos))) {

      estado = 'T';
      detalles = `Retraso dentro de tolerancia (${toleranciaTardanza} min)`;
    }
    // 4. TEX - Tiempo extra (salida después del tiempo extra permitido)
    else if (((existeRegistro2 && existeSalidaManana && diferencias.tipo2 > 0 &&
      diferencias.tipo2 > tiempoExtraSegundos) ||
      (existeRegistro4 && existeSalidaTarde && diferencias.tipo4 > 0 &&
        diferencias.tipo4 > tiempoExtraSegundos))) {

      estado = 'TEX';
      detalles = `Tiempo extra trabajado (más de ${horarioArea.tiempo_extra || 0} min)`;
    }
    // 5. Observado por tardanza excesiva (más que la tolerancia)
    else if (((existeRegistro1 && existeIngresoManana && diferencias.tipo1 > 0 && diferencias.tipo1 > toleranciaTardanzaSegundos) ||
      (existeRegistro3 && existeIngresoTarde && diferencias.tipo3 > 0 && diferencias.tipo3 > toleranciaTardanzaSegundos))) {

      estado = 'OBS';
      detalles = `Retraso excede tolerancia (más de ${toleranciaTardanza} min)`;
    }
    // 6. Observado por salida antes de tiempo (diferencia negativa)
    else if (((existeRegistro2 && existeSalidaManana && diferencias.tipo2 < 0) ||
      (existeRegistro4 && existeSalidaTarde && diferencias.tipo4 < 0))) {

      estado = 'OBS';
      detalles = 'Salida antes de la hora programada';
    }
    // 7. Observado por ingreso antes de tiempo (diferencia negativa)
    else if (((existeRegistro1 && existeIngresoManana && diferencias.tipo1 < 0) ||
      (existeRegistro3 && existeIngresoTarde && diferencias.tipo3 < 0))) {

      estado = 'OBS';
      detalles = 'Ingreso antes de la hora programada';
    }
    // 8. Observado por salida dentro del tiempo extra permitido (positivo pero <= tiempo extra)
    else if (((existeRegistro2 && existeSalidaManana && diferencias.tipo2 > 0 && diferencias.tipo2 <= tiempoExtraSegundos) ||
      (existeRegistro4 && existeSalidaTarde && diferencias.tipo4 > 0 && diferencias.tipo4 <= tiempoExtraSegundos))) {

      estado = 'OBS';
      detalles = `Salida dentro del tiempo extra permitido (hasta ${horarioArea.tiempo_extra || 0} min)`;
    }
    // 9. Otros casos observados
    else {
      estado = 'OBS';
      detalles = 'Registros dentro de parámetros normales';
    }

    return {
      estado: estado,
      diferencias: diferencias,
      detalles: detalles,
      registrosCompletos: registrosExistentes === 4,
      dia: diaSemana,
      horasEsperadas: horasEsperadas,
      registros: registros,
      tardanza: toleranciaTardanza,
      tiempo_extra: horarioArea.tiempo_extra
    };
  }

  // Función auxiliar para obtener hora esperada
  obtenerHoraEsperada(cadenaHoras, indiceDia) {
    if (!cadenaHoras) return null;
    const horas = cadenaHoras.split('|');
    if (indiceDia >= horas.length) return null;
    const hora = horas[indiceDia];
    return hora === '00:00:00' ? null : hora;
  }

  // Función para calcular diferencia en segundos
  calcularDiferencia(registro: string, horaEsperada: string): number | null {
    if (!registro || !horaEsperada) return null;

    const fechaRegistro = new Date(registro).getTime(); // timestamp en ms

    // Extraer hora, minutos y segundos de la hora esperada
    const [horas, minutos, segundos] = horaEsperada.split(':').map(Number);

    // Crear fecha base (usando la fecha del registro pero con la hora esperada)
    const fechaBase = new Date(registro);
    fechaBase.setHours(horas, minutos, segundos, 0);
    const timestampEsperado = fechaBase.getTime(); // timestamp en ms

    // Calcular diferencia en segundos
    return (fechaRegistro - timestampEsperado) / 1000;
  }

  findabrev(input) {
    let encontrado = this.tablaPresAnalitico.find((item) => item.abreviatura == input)
    if (encontrado) {
      // return encontrado.monto
    } else {
      return ''
    }
  }

  convertirAArray(expresion: string): string[] {
    const partes = expresion.split(/([\+\-\*/\(\)])/)
    const resultado = partes.filter((elemento) => elemento !== '')
    return resultado
  }

  VerifBucle(formula: any, vbusq: any) {
    const arregloResultado = this.convertirAArray(formula);
    let bucle = false;
    for (let a = 0; a < arregloResultado.length; a++) {
      const operadores = arregloResultado[a].match(/[+\-*()/]/g);
      if (!operadores) {
        if (arregloResultado[a] == vbusq) {
          bucle = true;
          break;
        }
        for (let row of this.tablaPresAnalitico) {
          if (row.abreviatura == arregloResultado[a]) {
            if ((row.formula ?? '') != '') {
              bucle = this.VerifBucle(row.formula, vbusq); //recursivo
              if (bucle) {
                break;
              }
            }
          }
        }
      }
    }
    return bucle;
  }

  calcularformula(texto) {
    try {
      return math.evaluate(texto);
    } catch {
      return null;
    }
  }

  async cambioAreaPres() {
    this.cargosFiltradosPres = []
    this.cargosFiltradosPres = this.cargos.filter(ele => ele.id_area == this.areaSeleccionadaPres)

    await this.listarPresAnaliticoArea();
  }

  async listarPresAnaliticoArea() {
    try {
      this.mostrar_carga_todo = true;
      this.tablaPresAnalitico = [];
      this.tablaPresAnaliticoFooter = [];
      // this.horasJornal = 8
      if (this.cargosFiltradosPres.length === 0) {
        console.warn('No hay cargos configurados');
        return;
      }

      const obj = {
        id_proyecto: this.idProyecto,
        id_area: this.areaSeleccionadaPres
      };

      const resp2 = await this.recursosHumanosService.listarPresAnaliticoRH(obj);
      let array = [];
      let array2 = [];
      resp2.forEach(element => {
        let cargos = [];
        if (element.cargos) {
          cargos = this.convertirStringACargoFila(element.cargos);
        } else {
          cargos = this.getCargosPorDefecto();
        }
        const fila: filaPresAnalitico = {
          abreviatura: element.abreviatura,
          descripcion: element.descripcion,
          formula: element.formula,
          id_area: element.id_area,
          id_presupuesto: element.id_presupuesto,
          id_proyecto: element.id_proyecto,
          item: element.item,
          cargos: cargos
        };
        if (element.item.includes('0-')) {

          array2.push(fila)
        } else {
          array.push(fila);
        }
      });


      this.tablaPresAnalitico = array;
      // await this.recalcularTodasFormulas();
      this.tablaPresAnaliticoFooter = array2
      this.mostrar_carga_todo = false;

    } catch (error) {
      console.log(error);
      SwalService.error();
      this.mostrar_carga_todo = false;
    }
  }

  convertirStringACargoFila(cadena: string): cargoFila[] {
    if (!cadena || cadena.trim() === '') return [];

    return cadena
      .split('|') // Separar por pipe
      .filter(item => item.trim() !== '') // Filtrar items vacíos
      .map(item => {
        const partes = item.split('/');
        const id_cargo = parseInt(partes[0].trim(), 10);

        if (isNaN(id_cargo)) return null;

        // Inicializar valores por defecto
        let porcentaje: number | null = null;
        let parcial: number = 0;

        // Analizar según la cantidad de partes
        if (partes.length === 3) {
          // Formato: id/porcentaje/parcial
          if (partes[1].trim() !== '') {
            porcentaje = parseFloat(partes[1].trim());
          }
          if (partes[2].trim() !== '') {
            parcial = parseFloat(partes[2].trim());
          }
        } else if (partes.length === 2) {
          // Formato: id/porcentaje o id//parcial
          if (partes[1].trim() === '') {
            // Formato: id// (solo ID)
            porcentaje = null;
            parcial = 0;
          } else if (partes[1].includes('.')) {
            // Si contiene punto decimal, es porcentaje
            porcentaje = parseFloat(partes[1].trim());
          } else {
            // Es parcial
            parcial = parseFloat(partes[1].trim());
          }
        } else if (partes.length === 1) {
          // Solo ID
          porcentaje = null;
          parcial = 0;
        }

        return {
          id_cargo: id_cargo,
          porcentaje: porcentaje,
          parcial: parcial
        };
      })
      .filter(cargo => cargo !== null) as cargoFila[];
  }

  agregarFila() {
    const cargos: cargoFila[] = this.cargosFiltradosPres.map(ele => { return { id_cargo: ele.id_cargo, porcentaje: null, parcial: 0 } })

    const fil: filaPresAnalitico = {
      abreviatura: '',
      cargos: JSON.parse(JSON.stringify(cargos)),
      descripcion: '',
      formula: '',
      id_area: this.areaSeleccionadaPres,
      id_presupuesto: null,
      id_proyecto: this.idProyecto,
      item: (this.tablaPresAnalitico.length + 1).toString()
    }
    let arrayGuardar = []
    if (!this.tablaPresAnalitico.length) {

      const categorias = ['JORNAL DIARIO', 'JORNAL HORARIO', 'JORNAL CATEGORIA 1', 'JORNAL CATEGORIA 2', 'JORNAL CATEGORIA 3', 'JORNAL CATEGORIA 4', 'JORNAL CATEGORIA 5']
      let i = 0
      for (const element of categorias) {
        var fila: filaPresAnalitico = {
          abreviatura: '',
          cargos: JSON.parse(JSON.stringify(cargos)),
          descripcion: element,
          formula: element == 'JORNAL HORARIO' ? '8' : '',
          id_area: this.areaSeleccionadaPres,
          id_presupuesto: null,
          id_proyecto: this.idProyecto,
          item: ('0-' + i).toString()
        }
        i++
        arrayGuardar.push(fila)
      }
    }
    arrayGuardar.push(fil)

    this.guardarPresAnaliticoRH(arrayGuardar)
    // this.tablaPresAnalitico.push(fil)

  }

  reiniciarContador() {
    this.contadorSegundos = 0;

    // Si ya hay un temporizador en curso, lo detenemos
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }

    // Creamos un nuevo temporizador
    this.temporizador = setTimeout(() => {
      this.actualizarPresAnaliticoRH();
      this.temporizador = null;
    }, this.tiempoLimiteSegundos * 1000);
  }

  iniciarTemporizador() {
    this.temporizador = setInterval(() => {
      this.contador += this.intervalo / 1000; // Incrementa en fracciones de segundo


      if (this.contador >= this.tiempoLimite) {
        this.actualizarPresAnaliticoRH();
        this.detenerTemporizador();
      }
    }, this.intervalo);
  }

  blurDescripcion(value, i) {
    const row = this.tablaPresAnalitico[i];
    if (row.descripcion !== value) {
      this.tablaPresAnalitico[i].descripcion = value;
      this.reiniciarContador();
    }
  }

  blurAbreviatura(valor, index) {
    if (valor == this.tablaPresAnalitico[index].abreviatura) {
      return;
    }

    const nuevaAbrev = valor.toUpperCase().trim();

    // Verificar si la abreviatura ya existe
    const existe = this.tablaPresAnalitico.some((fila, i) =>
      i !== index && fila.abreviatura === nuevaAbrev
    );

    if (existe) {
      alert(`La abreviatura "${nuevaAbrev}" ya existe`);
      return;
    }

    const viejaAbrev = this.tablaPresAnalitico[index].abreviatura;
    this.tablaPresAnalitico[index].abreviatura = nuevaAbrev;

    // Si cambió la abreviatura, recalcular dependencias
    if (viejaAbrev !== nuevaAbrev) {
      this.recalcularTodasFormulas();
      this.reiniciarContador();
    }
  }

  blurporcentaje(valor, filaIndex, cargoIndex) {
    if (filaIndex === 0) return; // Fila base no tiene porcentajes

    const valorActual = this.tablaPresAnalitico[filaIndex].cargos[cargoIndex].porcentaje;
    const nuevoPorcentaje = parseFloat(valor) || 0;

    // Solo recalcular si realmente cambió
    if (valorActual !== nuevoPorcentaje) {
      this.tablaPresAnalitico[filaIndex].cargos[cargoIndex].porcentaje = nuevoPorcentaje;

      // Recalcular todas las fórmulas para actualizar dependencias
      this.recalcularTodasFormulas();
      this.reiniciarContador();
    }
  }

  blurporcentajeFooter(valor, filaIndex, cargoIndex) {
    // if (filaIndex === 0) return; // Fila base no tiene porcentajes
    const valorActual = this.tablaPresAnaliticoFooter[filaIndex].cargos[cargoIndex].porcentaje;
    const nuevoPorcentaje = parseFloat(valor) || 0;

    // Solo recalcular si realmente cambió
    if (valorActual !== nuevoPorcentaje) {
      this.tablaPresAnaliticoFooter[filaIndex].cargos[cargoIndex].porcentaje = nuevoPorcentaje;

      // Recalcular todas las fórmulas para actualizar dependencias
      this.recalcularTodasFormulas();
      this.reiniciarContador();
    }
  }

  blurparcial(valor, filaIndex, cargoIndex) {
    const valorActual = this.tablaPresAnalitico[filaIndex].cargos[cargoIndex].parcial;
    const nuevoParcial = parseFloat(valor) || 0;

    if (valorActual !== nuevoParcial) {
      this.tablaPresAnalitico[filaIndex].cargos[cargoIndex].parcial = nuevoParcial;
      this.tablaPresAnalitico[filaIndex].formula = '';
      this.recalcularTodasFormulas(true);
      this.reiniciarContador();
    }
  }

  blurparcialFooter(valor, filaIndex, cargoIndex) {
    const valorActual = this.tablaPresAnaliticoFooter[filaIndex].cargos[cargoIndex].parcial;
    const nuevoParcial = parseFloat(valor) || 0;

    if (valorActual !== nuevoParcial) {
      this.tablaPresAnaliticoFooter[filaIndex].cargos[cargoIndex].parcial = nuevoParcial;
      // this.tablaPresAnaliticoFooter[filaIndex].formula = '';
      this.recalcularTodasFormulas(true);
      this.reiniciarContador();
    }
  }

  blurFormula(valor: string, index: number) {
    if (index === 0) return; // Fila base no tiene fórmula

    this.tablaPresAnalitico[index].formula = valor.toUpperCase();
    this.recalcularTodasFormulas();
    this.reiniciarContador();
  }

  // async recalcularTodasFormulas(soloFooter = false) {
  //   if (!soloFooter) {
  //     await this.formulaEvaluator.evaluarTodasFormulas(this.tablaPresAnalitico);
  //   }

  //   const acumulados: cargoFila[] = Object.values(
  //     this.tablaPresAnalitico.reduce((acc, element) => {
  //       element.cargos.forEach(ele => {
  //         const id = ele.id_cargo;
  //         if (!acc[id]) {
  //           acc[id] = {
  //             id_cargo: id,
  //             parcial: 0,
  //             porcentaje: null
  //           };
  //         }
  //         acc[id].parcial! += (ele.parcial || 0);
  //       });
  //       return acc;
  //     }, {} as { [key: number]: cargoFila })
  //   );
  //   // this.tablaPresAnaliticoFooter[0].cargos = JSON.parse(JSON.stringify(acumulados))

  //   let i = 0
  //   let acumuladosCalculados
  //   console.log('a1', JSON.parse(JSON.stringify(this.tablaPresAnaliticoFooter)))
  //   for (const element of this.tablaPresAnaliticoFooter) {
  //     if (i == 0) {
  //       // Caso 0: copiar los acumulados directamente
  //       element.cargos = JSON.parse(JSON.stringify(acumulados));
  //     } else if (i == 1) {
  //       // Caso 1: dividir todos por las horas
  //       const horas = element?.formula ? Number(element?.formula) : 1;
  //       acumuladosCalculados = acumulados.map(ele => ({
  //         ...ele,
  //         parcial: (ele.parcial || 0) / horas
  //       }));
  //       element.cargos = acumuladosCalculados;
  //     } else {
  //       let k = 0
  //       for (const cargo of element.cargos) {
  //         if (cargo.porcentaje) {
  //           console.log('cargo', cargo)
  //           console.log('p1', JSON.parse(JSON.stringify(cargo.porcentaje)))
  //           cargo.parcial =
  //             acumuladosCalculados[k]?.parcial == null ||
  //               cargo?.porcentaje == null ||
  //               cargo.porcentaje === 0
  //               ? null
  //               : acumuladosCalculados[k].parcial * (cargo.porcentaje / 100);
  //           console.log('p2', JSON.parse(JSON.stringify(cargo.porcentaje)))
  //         } else if (!cargo.porcentaje && !acumuladosCalculados[k]?.parcial) {
  //           cargo.parcial = null
  //         }
  //         k++
  //       }


  //     }
  //     i++
  //   }
  //   console.log('a2', JSON.parse(JSON.stringify(this.tablaPresAnaliticoFooter)))
  // }

  async recalcularTodasFormulas(soloFooter = false) {
    if (!soloFooter) {
      await this.formulaEvaluator.evaluarTodasFormulas(this.tablaPresAnalitico);
    }

    const acumulados: cargoFila[] = Object.values(
      this.tablaPresAnalitico.reduce((acc, element) => {
        element.cargos.forEach(ele => {
          const id = ele.id_cargo;
          if (!acc[id]) {
            acc[id] = {
              id_cargo: id,
              parcial: 0,
              porcentaje: null
            };
          }
          // Redondear acumulación también
          const parcialRedondeado = parseFloat((ele.parcial || 0).toFixed(3));
          acc[id].parcial! += parcialRedondeado;
        });
        return acc;
      }, {} as { [key: number]: cargoFila })
    );

    // Redondear los acumulados también
    acumulados.forEach(cargo => {
      if (cargo.parcial !== null && cargo.parcial !== undefined) {
        cargo.parcial = parseFloat(cargo.parcial.toFixed(3));
      }
    });

    let i = 0;
    let acumuladosCalculados: cargoFila[] = [];


    for (const element of this.tablaPresAnaliticoFooter) {
      if (i == 0) {
        // Caso 0: copiar los acumulados directamente
        element.cargos = JSON.parse(JSON.stringify(acumulados));
        acumuladosCalculados = JSON.parse(JSON.stringify(acumulados));
        // Asegurar que todos los parciales estén redondeados
        element.cargos.forEach(cargo => {
          if (cargo.parcial !== null && cargo.parcial !== undefined) {
            cargo.parcial = parseFloat(cargo.parcial.toFixed(3));
          }
        });
      } else if (i == 1) {
        // Caso 1: dividir todos por las horas
        const horas = element?.formula ? Number(element?.formula) : 1;
        const a = acumulados.map(ele => {
          let parcial = ele.parcial || 0;
          if (horas !== 0) {
            parcial = parcial / horas;
          }
          return {
            ...ele,
            parcial: parcial !== null && parcial !== undefined
              ? parseFloat(parcial.toFixed(3))
              : null
          };
        });
        element.cargos = a;
      } else {
        let k = 0;
        for (const cargo of element.cargos) {
          if (cargo.porcentaje) {

            if (acumuladosCalculados[k]?.parcial != null &&
              cargo?.porcentaje != null &&
              cargo.porcentaje !== 0) {

              // Calcular con 6 decimales para precisión y luego redondear a 3
              const calculo = acumuladosCalculados[k].parcial * (cargo.porcentaje / 100);
              cargo.parcial = parseFloat(calculo.toFixed(3));
            } else {
              cargo.parcial = null;
            }

          } else if (!cargo.porcentaje && !acumuladosCalculados[k]?.parcial) {
            cargo.parcial = null;
          } else if (!cargo.porcentaje && acumuladosCalculados[k]?.parcial != null) {
            // Si no hay porcentaje pero sí hay acumulado, mantener el acumulado redondeado
            cargo.parcial = parseFloat((acumuladosCalculados[k].parcial || 0).toFixed(3));
          }
          k++;
        }
      }
      i++;
    }

  }

  obtenerDependencias(formula: string): string[] {
    return this.formulaEvaluator.obtenerDependencias(formula);
  }

  async guardarPresAnaliticoRH(array = []) {

    try {
      this.mostrar_carga_todo = true
      let arrayGuardar = []

      for (const fila of array) {

        const cargos = this.convertirCargosAString(fila.cargos)
        const obj = {
          id_proyecto: this.idProyecto,
          id_area: this.areaSeleccionadaPres,
          item: fila.item,
          descripcion: fila.descripcion,
          abreviatura: fila.abreviatura,
          formula: fila.formula,
          cargos: cargos
        }

        arrayGuardar.push(obj)
      }
      const response = await this.recursosHumanosService.guardarPresAnaliticoRH(arrayGuardar)
      if (response?.length > 1) {
        await this.listarPresAnaliticoArea()
        this.tablaFiltrada = []
        this.totalMes = 0
        this.cantidadUsuariosDia = []
      } else if (response?.length == 1 && arrayGuardar.length == 1) {
        // Si es solo un elemento, encontrar su índice y actualizar
        const itemABuscar = arrayGuardar[0].item;

        // Encontrar el índice del elemento que coincide
        const index = this.tablaPresAnalitico.findIndex(ele => ele.item == itemABuscar);

        if (index !== -1) {
          // Actualizar solo esa fila con el id_control de la respuesta
          this.tablaPresAnalitico[index].id_presupuesto = response[0].id_presupuesto;

          // Si necesitas actualizar otros campos de la respuesta
          // this.tablaPresAnalitico[index] = { ...this.tablaPresAnalitico[index], ...response[0] };
        } else {
          console.warn(`No se encontró el elemento con item: ${itemABuscar}`);
        }
        this.tablaFiltrada = []
        this.totalMes = 0
        this.cantidadUsuariosDia = []
      } else {
        SwalService.error()
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }

  }

  async actualizarPresAnaliticoRH() {
    // Si ya hay una actualización en curso, salimos
    if (this.actualizacionEnCurso) {
      // console.log('Actualización ya en curso, ignorando...');
      return;
    }

    // Si hay un temporizador pendiente, lo cancelamos
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }

    try {
      this.actualizacionEnCurso = true;
      // console.log('Iniciando actualización...');

      // Preparar el array de registros
      let completo = []
      const registros = this.tablaPresAnalitico.map(fila => ({
        id_presupuesto: fila.id_presupuesto,
        id_proyecto: fila.id_proyecto,
        id_area: fila.id_area,
        item: fila.item,
        descripcion: fila.descripcion,
        abreviatura: fila.abreviatura,
        formula: fila.formula,
        cargos: this.convertirCargosAString(fila.cargos)
      }));

      const registros2 = this.tablaPresAnaliticoFooter.map(fila => ({
        id_presupuesto: fila.id_presupuesto,
        id_proyecto: fila.id_proyecto,
        id_area: fila.id_area,
        item: fila.item,
        descripcion: fila.descripcion,
        abreviatura: fila.abreviatura,
        formula: fila.formula,
        cargos: this.convertirCargosAString(fila.cargos)
      }));

      completo = registros.concat(registros2)
      // Solo enviar si hay registros
      if (completo.length > 0) {
        const response = await this.recursosHumanosService.actualizarPresAnaliticoRHLote(completo);
        if (response.success) {
          // console.log('Registros actualizados correctamente');
          this.tablaFiltrada = []
          this.totalMes = 0
          this.cantidadUsuariosDia = []
        } else {
          SwalService.error(response.message || 'Error al actualizar registros');
        }
      }

    } catch (error) {
      console.error('Error:', error);
      SwalService.error('Error al actualizar los registros');
    } finally {
      // Siempre liberar el estado de actualización
      this.actualizacionEnCurso = false;
    }
  }

  convertirCargosAString(cargos: cargoFila[]): string {
    if (!cargos || cargos.length === 0) return '';

    return cargos
      .map(cargo => {
        let porcentaje = cargo.porcentaje ?? '';
        let parcial = cargo.parcial ?? '';

        if (typeof porcentaje === 'number' && Number.isNaN(porcentaje)) {
          porcentaje = '';
        }

        if (typeof parcial === 'number' && Number.isNaN(parcial)) {
          parcial = '';
        }

        return `${cargo.id_cargo}/${porcentaje}/${parcial}`;
      })
      .join('|');
  }
  // async eliminarFila() {
  //   if (this.filPresAna === undefined || this.filPresAna === null) {
  //     SwalService.error('No hay fila seleccionada para eliminar');
  //     return;
  //   }

  //   try {
  //     // 1. Obtener el elemento a eliminar
  //     const elementoAEliminar = this.tablaPresAnalitico[this.filPresAna];

  //     if (!elementoAEliminar) {
  //       SwalService.error('No se encontró el elemento a eliminar');
  //       return;
  //     }

  //     const abreviaturaEliminar = elementoAEliminar.abreviatura;
  //     const itemEliminar = elementoAEliminar.item;
  //     const idPresupuestoEliminar = elementoAEliminar.id_presupuesto;

  //     // 2. Preparar array para actualizaciones
  //     const actualizaciones: any[] = [];

  //     // 3. Buscar fórmulas que usen esta abreviatura
  //     const abreviaturasLimpieza = [abreviaturaEliminar];
  //     const formulasActualizadas = new Set<string>();
  //     const maxProfundidad = 10;
  //     let profundidad = 0;

  //     while (abreviaturasLimpieza.length > 0 && profundidad < maxProfundidad) {
  //       profundidad++;
  //       const abreviaturaActual = abreviaturasLimpieza.shift()!;
  //       const esElementoEliminando = abreviaturaActual === this.tablaPresAnalitico[this.filPresAna].abreviatura;

  //       // Buscar fórmulas que contengan esta abreviatura
  //       this.tablaPresAnalitico.forEach((elemento, index) => {
  //         if (index === this.filPresAna) return; // Saltar el elemento que se eliminará

  //         if (elemento.formula && this.formulaContieneAbreviatura(elemento.formula, abreviaturaActual)) {
  //           // CASO 1: Si la abreviatura actual es la del elemento que se ELIMINA
  //           // Entonces limpiar la fórmula del elemento que la referencia
  //           if (esElementoEliminando) {
  //             actualizaciones.push({
  //               id_presupuesto: elemento.id_presupuesto,
  //               item: elemento.item,
  //               descripcion: elemento.descripcion,
  //               abreviatura: elemento.abreviatura,
  //               formula: '', // Fórmula vacía porque referencia a un elemento eliminado
  //               cargos: elemento.cargos || this.getCargosPorDefecto()
  //             });
  //             formulasActualizadas.add(elemento.abreviatura);

  //             // Si limpiamos esta fórmula, podría afectar a otras que dependan de ella
  //             if (!abreviaturasLimpieza.includes(elemento.abreviatura)) {
  //               abreviaturasLimpieza.push(elemento.abreviatura);
  //             }
  //           }
  //           // CASO 2: Si contiene una abreviatura que fue invalidada (pero no es el elemento eliminado)
  //           // Solo aplicar si NO es el elemento que se está eliminando directamente
  //           else if (!esElementoEliminando) {
  //             // Limpiar la fórmula de la referencia inválida
  //             const nuevaFormula = this.limpiarFormula(elemento.formula, abreviaturaActual);

  //             // Verificar si la fórmula resultante es válida
  //             const formulaEsValida = this.esFormulaValida(nuevaFormula);

  //             actualizaciones.push({
  //               id_presupuesto: elemento.id_presupuesto,
  //               item: elemento.item,
  //               descripcion: elemento.descripcion,
  //               abreviatura: elemento.abreviatura,
  //               formula: formulaEsValida ? nuevaFormula : '',
  //               cargos: elemento.cargos || this.getCargosPorDefecto()
  //             });

  //             formulasActualizadas.add(elemento.abreviatura);

  //             // Si la fórmula quedó inválida, propagar el efecto
  //             if (!formulaEsValida) {
  //               if (!abreviaturasLimpieza.includes(elemento.abreviatura)) {
  //                 abreviaturasLimpieza.push(elemento.abreviatura);
  //               }
  //             }
  //           }
  //         }
  //       });
  //     }

  //     // 4. Recalcular todas las fórmulas (después de limpiar las dependencias)
  //     this.recalcularTodasFormulas();

  //     // 5. Reordenar items si es necesario
  //     if (itemEliminar) {
  //       // Obtener todos los items mayores al que se elimina
  //       const elementosReordenar = this.tablaPresAnalitico
  //         .filter((elemento, index) => {
  //           if (index === this.filPresAna) return false;
  //           const itemNum = parseInt(elemento.item);
  //           const itemEliminarNum = parseInt(itemEliminar);
  //           return !isNaN(itemNum) && !isNaN(itemEliminarNum) && itemNum > itemEliminarNum;
  //         })
  //         .sort((a, b) => parseInt(a.item) - parseInt(b.item));

  //       // Actualizar items
  //       elementosReordenar.forEach((elemento, index) => {
  //         const nuevoItem = (parseInt(itemEliminar) + index).toString();

  //         // Verificar si ya existe una actualización para este elemento
  //         const idxActualizacion = actualizaciones.findIndex(
  //           a => a.id_presupuesto === elemento.id_presupuesto
  //         );

  //         if (idxActualizacion !== -1) {
  //           // Actualizar item en la actualización existente
  //           actualizaciones[idxActualizacion].item = nuevoItem;
  //         } else {
  //           // Agregar nueva actualización - MANTENER LOS CARGOS
  //           actualizaciones.push({
  //             id_presupuesto: elemento.id_presupuesto,
  //             item: nuevoItem,
  //             descripcion: elemento.descripcion,
  //             abreviatura: elemento.abreviatura,
  //             formula: elemento.formula || '',
  //             cargos: elemento.cargos || this.getCargosPorDefecto() // Mantener cargos existentes o usar por defecto
  //           });
  //         }
  //       });
  //     }

  //     // 6. Preparar request para backend
  //     const request = {
  //       id_presupuesto: idPresupuestoEliminar,
  //       id_proyecto: this.idProyecto,
  //       id_area: this.areaSeleccionadaPres,
  //       actualizaciones: actualizaciones
  //     };

  //     console.log('Request para backend:', request);

  //     // 7. Enviar al backend
  //     SwalService.confirm(
  //       '¿Está seguro de eliminar este registro?',
  //       'Esta acción eliminará el registro y actualizará ' + actualizaciones.length + ' registros relacionados.'
  //     ).then(async (result) => {
  //       if (result.isConfirmed) {
  //         this.mostrar_carga_todo = true;

  //         try {
  //           const response = await this.recursosHumanosService.eliminarYActualizarPresAnaliticoRH(request);

  //           if (response.success) {
  //             // Eliminar localmente la fila
  //             this.tablaPresAnalitico.splice(this.filPresAna, 1);

  //             // Actualizar items localmente
  //             this.actualizarItemsLocalmente();

  //             // Recalcular fórmulas después de eliminar
  //             this.recalcularTodasFormulas();

  //             SwalService.success(response.message);
  //             this.filPresAna = undefined;
  //           } else {
  //             SwalService.error(response.message || 'Error al eliminar el registro');
  //           }
  //         } catch (error) {
  //           console.error('Error:', error);
  //           SwalService.error('Error al procesar la eliminación');
  //         } finally {
  //           this.mostrar_carga_todo = false;
  //         }
  //       }
  //     });
  //     console.log('this.tablaPresAnalitico', this.tablaPresAnalitico)
  //   } catch (error) {
  //     console.error('Error en eliminación:', error);
  //     SwalService.error('Error al preparar la eliminación');
  //   }
  // }

  async eliminarFila() {
    if (this.filPresAna === undefined || this.filPresAna === null) {
      SwalService.error('No hay fila seleccionada para eliminar');
      return;
    }

    try {
      // 1. Obtener el elemento a eliminar
      const elementoAEliminar = this.tablaPresAnalitico[this.filPresAna];

      if (!elementoAEliminar) {
        SwalService.error('No se encontró el elemento a eliminar');
        return;
      }

      const abreviaturaEliminar = elementoAEliminar.abreviatura;
      const itemEliminar = elementoAEliminar.item;
      const idPresupuestoEliminar = elementoAEliminar.id_presupuesto;

      // 2. Preparar array para actualizaciones
      const actualizaciones: any[] = [];

      // 3. Buscar fórmulas que usen esta abreviatura (y propagar)
      const abreviaturasLimpieza = [abreviaturaEliminar];
      const formulasActualizadas = new Set<string>();
      const maxProfundidad = 10;
      let profundidad = 0;

      while (abreviaturasLimpieza.length > 0 && profundidad < maxProfundidad) {
        profundidad++;
        const abreviaturaActual = abreviaturasLimpieza.shift()!;

        // Buscar fórmulas que contengan esta abreviatura
        this.tablaPresAnalitico.forEach((elemento, index) => {
          if (index === this.filPresAna) return; // Saltar el elemento que se eliminará

          if (elemento.formula && this.formulaContieneAbreviatura(elemento.formula, abreviaturaActual)) {

            // CASO A: Si la abreviatura actual es la del elemento que se ELIMINA
            if (abreviaturaActual === abreviaturaEliminar) {

              // Limpiar la fórmula completamente porque referencia a un elemento eliminado
              actualizaciones.push({
                id_presupuesto: elemento.id_presupuesto,
                item: elemento.item,
                descripcion: elemento.descripcion,
                abreviatura: elemento.abreviatura,
                formula: '', // Fórmula vacía
                cargos: elemento.cargos || this.getCargosPorDefecto()
              });

              formulasActualizadas.add(elemento.abreviatura);

              // Esta fila ahora tiene fórmula vacía, podría afectar a otras
              if (!abreviaturasLimpieza.includes(elemento.abreviatura) &&
                !formulasActualizadas.has(elemento.abreviatura)) {
                abreviaturasLimpieza.push(elemento.abreviatura);
              }
            }
            // CASO B: Si contiene una abreviatura que fue invalidada
            else {

              // Limpiar solo la referencia a la abreviatura inválida
              const nuevaFormula = this.limpiarFormula(elemento.formula, abreviaturaActual);

              // Verificar si la fórmula resultante es válida
              const formulaEsValida = this.esFormulaValida(nuevaFormula);

              actualizaciones.push({
                id_presupuesto: elemento.id_presupuesto,
                item: elemento.item,
                descripcion: elemento.descripcion,
                abreviatura: elemento.abreviatura,
                formula: formulaEsValida ? nuevaFormula : '',
                cargos: elemento.cargos || this.getCargosPorDefecto()
              });

              formulasActualizadas.add(elemento.abreviatura);

              // Si la fórmula quedó inválida, propagar el efecto
              if (!formulaEsValida) {
                if (!abreviaturasLimpieza.includes(elemento.abreviatura) &&
                  !formulasActualizadas.has(elemento.abreviatura)) {
                  abreviaturasLimpieza.push(elemento.abreviatura);
                }
              }
            }
          }
        });

      }

      // 4. Eliminar duplicados en actualizaciones (mantener la última)
      const actualizacionesUnicas = [];
      const idsProcesados = new Set();

      for (let i = actualizaciones.length - 1; i >= 0; i--) {
        const act = actualizaciones[i];
        if (!idsProcesados.has(act.id_presupuesto)) {
          actualizacionesUnicas.unshift(act);
          idsProcesados.add(act.id_presupuesto);
        }
      }


      // 5. Recalcular todas las fórmulas (después de limpiar las dependencias)
      this.recalcularTodasFormulas();

      // 6. Reordenar items si es necesario
      if (itemEliminar) {
        // Obtener todos los items mayores al que se elimina
        const elementosReordenar = this.tablaPresAnalitico
          .filter((elemento, index) => {
            if (index === this.filPresAna) return false;
            const itemNum = parseInt(elemento.item);
            const itemEliminarNum = parseInt(itemEliminar);
            return !isNaN(itemNum) && !isNaN(itemEliminarNum) && itemNum > itemEliminarNum;
          })
          .sort((a, b) => parseInt(a.item) - parseInt(b.item));


        // Actualizar items
        elementosReordenar.forEach((elemento, index) => {
          const nuevoItem = (parseInt(itemEliminar) + index).toString();

          // Verificar si ya existe una actualización para este elemento
          const idxActualizacion = actualizacionesUnicas.findIndex(
            a => a.id_presupuesto === elemento.id_presupuesto
          );

          if (idxActualizacion !== -1) {
            // Actualizar item en la actualización existente
            actualizacionesUnicas[idxActualizacion].item = nuevoItem;
          } else {
            // Agregar nueva actualización - MANTENER LOS CARGOS
            actualizacionesUnicas.push({
              id_presupuesto: elemento.id_presupuesto,
              item: nuevoItem,
              descripcion: elemento.descripcion,
              abreviatura: elemento.abreviatura,
              formula: elemento.formula || '',
              cargos: elemento.cargos || this.getCargosPorDefecto()
            });
          }
        });
      }

      // 7. Preparar request para backend
      const request = {
        id_presupuesto: idPresupuestoEliminar,
        id_proyecto: this.idProyecto,
        id_area: this.areaSeleccionadaPres,
        actualizaciones: actualizacionesUnicas
      };


      // 8. Enviar al backend
      SwalService.confirm(
        '¿Está seguro de eliminar este registro?',
        'Esta acción eliminará el registro y actualizará ' + actualizacionesUnicas.length + ' registros relacionados.'
      ).then(async (result) => {
        if (result.isConfirmed) {
          this.mostrar_carga_todo = true;

          try {
            const response = await this.recursosHumanosService.eliminarYActualizarPresAnaliticoRH(request);

            if (response.success) {
              // Eliminar localmente la fila
              this.tablaPresAnalitico.splice(this.filPresAna, 1);

              // Actualizar items localmente
              this.actualizarItemsLocalmente();

              // Recalcular fórmulas después de eliminar
              this.recalcularTodasFormulas();

              SwalService.success(response.message);
              this.filPresAna = undefined;
              this.tablaFiltrada = []
              this.totalMes = 0
              this.cantidadUsuariosDia = []
            } else {
              SwalService.error(response.message || 'Error al eliminar el registro');
            }
          } catch (error) {
            console.error('Error:', error);
            SwalService.error('Error al procesar la eliminación');
          } finally {
            this.mostrar_carga_todo = false;
          }
        }
      });

    } catch (error) {
      console.error('Error en eliminación:', error);
      SwalService.error('Error al preparar la eliminación');
    }
  }
  // Método auxiliar para verificar si una fórmula contiene una abreviatura (con o sin %)
  formulaContieneAbreviatura(formula: string, abreviatura: string): boolean {
    if (!formula || !abreviatura) return false;

    // Crear regex que busque la abreviatura con o sin %, y también con * después del %
    // Patrones a buscar: F2, %F2, %*F2
    const patron = `(?:%\\*?|\\b)${abreviatura}\\b`;
    const regex = new RegExp(patron, 'g');
    const contiene = regex.test(formula);


    return contiene;
  }

  limpiarFormula(formula: string, abreviatura: string): string {
    if (!formula || !abreviatura) return formula || '';


    let nuevaFormula = formula;

    // 1. Eliminar %*ABREV (patrón con asterisco)
    const regexPorcentajeAsterisco = new RegExp(`%\\*${abreviatura}\\b`, 'g');
    nuevaFormula = nuevaFormula.replace(regexPorcentajeAsterisco, '');

    // 2. Eliminar %ABREV (patrón sin asterisco)
    const regexPorcentaje = new RegExp(`%${abreviatura}\\b`, 'g');
    nuevaFormula = nuevaFormula.replace(regexPorcentaje, '');

    // 3. Eliminar ABREV (solo cuando es palabra completa)
    const regexSolo = new RegExp(`\\b${abreviatura}\\b`, 'g');
    nuevaFormula = nuevaFormula.replace(regexSolo, '');

    // 4. Manejar casos especiales con paréntesis
    // Eliminar (ABREV), (%ABREV), (%*ABREV)
    const regexParentesis = new RegExp(`\\(\\s*%?\\*?${abreviatura}\\s*\\)`, 'g');
    nuevaFormula = nuevaFormula.replace(regexParentesis, '()');

    // 5. Limpiar la fórmula resultante
    const resultado = this.limpiarFormulaResultante(nuevaFormula);

    return resultado;
  }

  // // Método para limpiar la fórmula después de eliminar referencias
  limpiarFormulaResultante(formula: string): string {
    if (!formula) return '';

    let limpia = formula.trim();

    // Si la fórmula ya está vacía, retornar string vacío
    if (!limpia) return '';

    // 1. Eliminar paréntesis vacíos
    limpia = limpia.replace(/\(\s*\)/g, '');

    // 2. Eliminar operadores duplicados
    limpia = limpia
      .replace(/\+\s*\+/g, '+')
      .replace(/\-\s*\-/g, '-')
      .replace(/\*\s*\*/g, '*')
      .replace(/\/\s*\//g, '/')
      .replace(/\+\s*\-/g, '-')
      .replace(/\-\s*\+/g, '-');

    // 3. Eliminar operadores al inicio y final
    limpia = limpia.replace(/^\s*[+\-*/]\s*|\s*[+\-*/]\s*$/g, '');

    // 4. Simplificar expresiones matemáticas si es posible
    if (this.esExpresionMatematica(limpia)) {
      const resultadoSimplificado = this.simplificarExpresion(limpia);
      if (resultadoSimplificado !== null) {
        return resultadoSimplificado;
      }
    }

    // 5. Si después de limpiar queda solo espacios o nada, devolver string vacío
    const final = limpia.trim();
    return final || '';
  }

  // Verificar si es una expresión matemática válida
  esExpresionMatematica(expresion: string): boolean {
    if (!expresion) return false;
    // Verificar que solo contenga números, operadores, paréntesis y puntos decimales
    return /^[\d\s+\-*/().]+$/.test(expresion);
  }

  // Simplificar expresión matemática
  simplificarExpresion(expresion: string): string | null {
    try {
      // Limpiar la expresión
      const sinEspacios = expresion.replace(/\s+/g, '');

      // Verificar si es válida
      if (!sinEspacios || /^[+\-*/]+$/.test(sinEspacios)) {
        return '';
      }

      // Eliminar operadores duplicados consecutivos
      const sinDuplicados = sinEspacios.replace(/([+\-*/])\1+/g, '$1');

      // Eliminar operadores al inicio/final
      const limpiaFinal = sinDuplicados.replace(/^[+\-*/]+|[+\-*/]+$/g, '');

      if (!limpiaFinal) {
        return '';
      }

      // Intentar evaluar
      const evaluar = new Function('return ' + limpiaFinal);
      const resultado = evaluar();

      // Verificar que el resultado sea un número válido
      if (typeof resultado === 'number' && !isNaN(resultado) && isFinite(resultado)) {
        // Redondear a 2 decimales
        return parseFloat(resultado.toFixed(2)).toString();
      }

      return null;
    } catch (e) {
      console.warn('Error al simplificar expresión:', e);
      return null;
    }
  }

  // Verificar si una fórmula es válida
  esFormulaValida(formula: string): boolean {
    if (!formula || formula.trim() === '') {
      return false;
    }

    // Verificar que no contenga solo operadores
    if (/^[+\-*/]+$/.test(formula.replace(/\s+/g, ''))) {
      return false;
    }

    // Verificar que sea una expresión matemática válida o tenga referencias
    return this.esExpresionMatematica(formula) || /[A-Z]{2,}/.test(formula);
  }

  // Método para obtener cargos por defecto
  getCargosPorDefecto() {
    return this.cargosFiltradosPres.map(cargo => ({
      id_cargo: cargo.id,
      porcentaje: null,
      parcial: 0
    }));
  }

  // Método para actualizar items localmente
  actualizarItemsLocalmente() {
    // Ordenar por item numérico
    this.tablaPresAnalitico.sort((a, b) => {
      const itemA = parseInt(a.item) || 0;
      const itemB = parseInt(b.item) || 0;
      return itemA - itemB;
    });

    // Renumerar items
    this.tablaPresAnalitico.forEach((elemento, index) => {
      elemento.item = (index + 1).toString();
    });
  }

  async moverFilaArriba() {
    // Validaciones: no hay selección, es la primera fila seleccionable (índice 1), o es índice 0
    if (this.filPresAna === null || this.filPresAna === undefined ||
      this.filPresAna <= 1) { // Cambiado de === 0 a <= 1
      return;
    }

    const indexActual = this.filPresAna;
    const indexNuevo = indexActual - 1;

    // Mover la fila
    const filaAMover = this.tablaPresAnalitico.splice(indexActual, 1)[0];
    this.tablaPresAnalitico.splice(indexNuevo, 0, filaAMover);

    // Renumerar todos los items
    await this.actualizarItemsSecuencialmente();

    // Actualizar selección
    this.filPresAna = indexNuevo;

    this.recalcularTodasFormulas();
    this.reiniciarContador();
  }

  async moverFilaAbajo() {
    // Validaciones: no hay selección, es la última fila, o es índice 0
    if (this.filPresAna === null || this.filPresAna === undefined ||
      this.filPresAna === 0 || // Añadido para evitar mover índice 0
      this.filPresAna >= this.tablaPresAnalitico.length - 1) {
      return;
    }

    const indexActual = this.filPresAna;
    const indexNuevo = indexActual + 1;

    // Mover la fila
    const filaAMover = this.tablaPresAnalitico.splice(indexActual, 1)[0];
    this.tablaPresAnalitico.splice(indexNuevo, 0, filaAMover);

    // Renumerar todos los items
    await this.actualizarItemsSecuencialmente();

    // Actualizar selección
    this.filPresAna = indexNuevo;

    this.recalcularTodasFormulas();
    this.reiniciarContador();
  }

  private actualizarItemsSecuencialmente(): void {
    this.tablaPresAnalitico.forEach((fila, index) => {
      fila.item = (index + 1).toString();
    });
  }

  blurHoraJornal(value, i) {
    if (value == '') {
      this.toaster.success(
        'Debe de ser valor numerico hora jornada',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
      return;
    }
    const acumulados = this.tablaPresAnaliticoFooter[0].cargos
    if (value !== this.tablaPresAnaliticoFooter[i]?.formula) {
      this.tablaPresAnaliticoFooter[i].formula = value;
      let acumuladosCalculados = []
      for (const element of this.tablaPresAnaliticoFooter) {
        if (i == 0) {

        } else if (i == 1) {
          // Caso 1: dividir todos por las horas
          const horas = element?.formula ? Number(element?.formula) : 1;
          acumuladosCalculados = acumulados.map(ele => ({
            ...ele,
            parcial: (ele.parcial || 0) / horas
          }));
          element.cargos = acumuladosCalculados;
        } else {
          let k = 0
          for (const cargo of element.cargos) {
            if (cargo.porcentaje) {
              cargo.parcial =
                acumuladosCalculados[k]?.parcial == null ||
                  cargo?.porcentaje == null ||
                  cargo.porcentaje === 0
                  ? null
                  : acumuladosCalculados[k].parcial * (cargo.porcentaje / 100);
            } else if (!cargo.porcentaje && !acumuladosCalculados[k]?.parcial) {
              cargo.parcial = null
            }
          }


        }
      }
    }
  }

  async eliminarAreaPresAnaliticoRH() {
    try {
      const sw = await SwalService.confirm('Esta seguro?', 'Se eliminaran los datos de presupuesto analitico del area')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: this.idProyecto,
          id_area: this.areaSeleccionadaPres
        }
        const resp = await this.recursosHumanosService.eliminarAreaPresAnaliticoRH(obj)
        if (resp) {
          this.tablaPresAnalitico = [];
          this.tablaPresAnaliticoFooter = []
          this.tablaFiltrada = []
          this.totalMes = 0
          this.cantidadUsuariosDia = []
          this.toaster.success(
            'Se eliminaron correctamente los registros',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            }
          );
        }
        this.mostrar_carga_todo = false
      }
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }

  }

  detalleUsuario(row) {
    this.tablaMesUsuario = []

    this.tablaMesUsuario = row.dias.map(ele => {
      // Crear una copia profunda del objeto
      const nuevoElemento = JSON.parse(JSON.stringify(ele));
      const fecha = this.convertirFechadia(ele.fecha)
      nuevoElemento.fecha = fecha;
      nuevoElemento.editado = false;
      return nuevoElemento;
    });
    this.modalDetalleUsuario.show()
  }

  cerrarModalDetalleUsuario() {
    this.modalDetalleUsuario.hide()
  }

  convertirFechadia(fechaStr: string) {

    if (!fechaStr) return null;

    // Si la fecha está en formato DD-MM-YYYY
    if (fechaStr.includes('-')) {
      const partes = fechaStr.split('-');
      if (partes.length === 3) {
        // Convertir DD-MM-YYYY a YYYY-MM-DD
        const dia = parseInt(partes[0], 10);
        return dia
      }
    }

    // Si ya está en formato válido o ISO
    return new Date(fechaStr);
  }

  convertirFecha(fechaStr: string): string {
    // Convierte "31-12-2025" a "2025-12-31"
    if (!fechaStr) return '';


    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      const dia = parts[0];
      const mes = parts[1];
      const anio = parts[2];

      // Validar que sea una fecha válida
      if (dia && mes && anio) {
        const fechaFormateada = `${anio}-${mes}-${dia}`;
        return fechaFormateada;
      }
    }

    console.warn('Formato de fecha no reconocido:', fechaStr);
    return fechaStr;
  }

  blurModal(value, key, i) {

    if (value !== this.tablaMesUsuario[i][key]) {
      this.tablaMesUsuario[i].editado = true
      this.tablaMesUsuario[i][key] = value
    }

  }

  // async guardarLoteUsuarioExtras() {
  //   try {

  //     const filtrados = [];
  //     const indicesFiltrados = [];
  //     const indicesTablaMes = []; // Guardar índices en tablaMesUsuario

  //     // Obtener elementos editados
  //     this.tablaMesUsuario.forEach((ele, index) => {
  //       if (ele.editado) {
  //         filtrados.push(ele);
  //         indicesFiltrados.push(index);
  //         indicesTablaMes.push(index);
  //       }
  //     });

  //     if (!filtrados.length) {
  //       this.toaster.error('Ningún cambio registrado', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //       return;
  //     }

  //     this.mostrar_carga_todo = true;
  //     let elementosGuardar = [];

  //     // IMPORTANTE: Guardar información de referencia
  //     const referencias = []; // Para poder actualizar después

  //     const convertirFechaMySQL = (fechaStr: string) => {
  //       if (!fechaStr) return null;
  //       return fechaStr.replace('T', ' ');
  //     };

  //     for (let j = 0; j < filtrados.length; j++) {
  //       const row = filtrados[j];
  //       const indTablaMes = indicesTablaMes[j];

  //       // Obtener fecha del usuario seleccionado
  //       const fechaOriginal = this.usuarioSeleccionado.dias[indTablaMes]?.fecha;
  //       const fechaFormateada = this.convertirFecha(fechaOriginal);

  //       const obj = {
  //         id_control: row.id_control || null,
  //         id_proyecto: this.idProyecto,
  //         id_usuario: this.usuarioSeleccionado.id_usuario,
  //         id_area: this.usuarioSeleccionado.id_area,
  //         id_cargo: this.usuarioSeleccionado.id_cargo,
  //         id_asignacion: this.usuarioSeleccionado.id_asignacion,
  //         fecha: fechaFormateada,
  //         tipo: row.tipo,
  //         fuente: 2,
  //         asistencia_1: row.asistencia1 ? convertirFechaMySQL(row.asistencia1) : null,
  //         asistencia_2: row.asistencia2 ? convertirFechaMySQL(row.asistencia2) : null,
  //         asistencia_3: row.asistencia3 ? convertirFechaMySQL(row.asistencia3) : null,
  //         asistencia_4: row.asistencia4 ? convertirFechaMySQL(row.asistencia4) : null,
  //         horas_extra: row.horas_extra || 0,
  //         monto_extra: row.monto_extra || 0
  //       };

  //       elementosGuardar.push(obj);

  //       // Guardar referencia para poder actualizar después
  //       referencias.push({
  //         id_usuario: this.usuarioSeleccionado.id_usuario,
  //         fecha: fechaFormateada,
  //         fechaOriginal: fechaOriginal,
  //         indiceTablaMes: indTablaMes,
  //         indiceEnvio: j
  //       });
  //     }

  //     console.log('referencias', referencias)
  //     const resp = await this.recursosHumanosService.guardarLoteRegistroAsistenciaRH(elementosGuardar);
  //     console.log('resp', resp)
  //     if (resp && resp.success && resp.data) {

  //       // Actualizar this.tablaFiltrada
  //       this.actualizarTablaFiltrada(resp.data, referencias);

  //       this.toaster.success(
  //         `${resp.data.length} registros guardados correctamente`,
  //         'Éxito',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         }
  //       );

  //       // Cerrar modal si está abierto
  //       if (this.modalDetalleUsuario) {
  //         this.modalDetalleUsuario.hide();
  //       }
  //     }

  //     this.mostrar_carga_todo = false;
  //   } catch (error) {
  //     this.mostrar_carga_todo = false;
  //     console.error('Error al guardar:', error);
  //     this.toaster.error('Error al guardar los registros', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 4000,
  //     });
  //   }
  // }

  // Método para actualizar tablaFiltrada CORREGIDO
  actualizarTablaFiltrada(datosBackend: any[], referencias: any[]) {

    // Encontrar la fila del usuario en tablaFiltrada
    const usuarioId = this.usuarioSeleccionado.id_usuario;
    const areaId = this.usuarioSeleccionado.id_area;
    const cargoId = this.usuarioSeleccionado.id_cargo;
    const asignacionId = this.usuarioSeleccionado.id_asignacion;

    // Buscar la fila correspondiente en tablaFiltrada
    const filaUsuario = this.tablaFiltrada.find(fila =>
      fila.id_usuario === usuarioId &&
      fila.id_area === areaId &&
      fila.id_cargo === cargoId &&
      fila.id_asignacion === asignacionId
    );

    if (!filaUsuario) {
      console.error('No se encontró la fila del usuario en tablaFiltrada');
      return;
    }


    // Actualizar cada día en la fila
    datosBackend.forEach((respuesta, index) => {

      // Verificar que tenemos datos
      if (!respuesta.datos || !Array.isArray(respuesta.datos) || respuesta.datos.length === 0) {
        return;
      }

      // ¡IMPORTANTE! datos es un array, tomar el primer elemento
      const datos = respuesta.datos[0];

      const ref = referencias[index];
      if (!ref) {
        return;
      }

      const fechaOriginal = ref.fechaOriginal;

      // Buscar el día en la fila
      const diaIndex = filaUsuario.dias.findIndex(dia =>
        dia && dia.fecha === fechaOriginal
      );

      if (diaIndex !== -1) {

        // Actualizar el día
        const dia = filaUsuario.dias[diaIndex];

        // Actualizar campos principales
        dia.id_control = datos.id_control;
        dia.tipo = datos.tipo || '';
        dia.horas_extra = datos.horas_extra || 0;
        dia.monto_extra = datos.monto_extra || 0;
        dia.fecha_registro = datos.fecha_registro;
        dia.id_proyecto = datos.id_proyecto;
        dia.id_usuario = datos.id_usuario;
        dia.id_asignacion = datos.id_asignacion;

        // Actualizar asistencias si existen
        if (datos.asistencia_1) {
          dia.asistencia1 = this.formatFechaFromBackend(datos.asistencia_1);
        }
        if (datos.asistencia_2) {
          dia.asistencia2 = this.formatFechaFromBackend(datos.asistencia_2);
        }
        if (datos.asistencia_3) {
          dia.asistencia3 = this.formatFechaFromBackend(datos.asistencia_3);
        }
        if (datos.asistencia_4) {
          dia.asistencia4 = this.formatFechaFromBackend(datos.asistencia_4);
        }

        // Actualizar tipoDescripcion
        dia.tipoDescripcion = this.getTipoDescripcion(datos.tipo || '');

        // Recalcular monto si es necesario
        if (dia.costedia) {
          dia.monto = this.calcularMonto(datos.tipo || '', dia.costedia);
          dia.descuento = this.calcularDescuento(datos.tipo || '', dia.costedia);
        }


        // Forzar actualización de la vista (si usas Angular)
        this.tablaFiltrada = [...this.tablaFiltrada];

      } else {
        console.warn(`❌ No se encontró fecha ${fechaOriginal} en la fila del usuario`);
      }
    });

    // Recalcular totales
    this.recalcularTotalesFila(filaUsuario);
  }

  // Método auxiliar para tipoDescripcion
  getTipoDescripcion(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'T': 'TARDANZA',
      'IN': 'INCOMPLETO',
      'F': 'FALTA',
      '': 'NORMAL'
    };
    return tipos[tipo] || tipo;
  }

  // Formato de fecha mejorado
  formatFechaFromBackend(fechaStr: string): string {
    if (!fechaStr) return null;

    // Si ya tiene formato ISO (con T), dejarlo igual
    if (fechaStr.includes('T')) {
      return fechaStr;
    }

    // Convertir "2025-12-31 00:00:00" a "2025-12-31T00:00:00"
    return fechaStr.replace(' ', 'T');
  }

  calcularMonto(tipo: string, costeDia: number): number {
    // Lógica de cálculo basada en el tipo
    if (tipo === 'T') return costeDia * 0.98; // 2% descuento por tardanza
    if (tipo === 'IN') return costeDia * 0.5; // 50% por incompleto
    if (tipo === 'F') return 0; // Falta total
    return costeDia; // Normal
  }

  calcularDescuento(tipo: string, costeDia: number): string {
    if (tipo === 'T') return '2';
    if (tipo === 'IN') return '50';
    if (tipo === 'F') return '100';
    return '0';
  }

  recalcularTotalesFila(fila: any) {
    // Recalcular coste_mensual sumando todos los montos
    if (fila.dias && fila.dias.length > 0) {
      let totalMensual = 0;
      fila.dias.forEach(dia => {
        if (dia && dia.monto) {
          totalMensual += dia.monto;
        }
      });
      fila.coste_mensual = totalMensual;
    }
  }


  async procesarRegistrosAsistencia(
    elementos: any[],
    fuente: number,
    mensajeExito: string = 'Registros guardados correctamente'
  ): Promise<boolean> {
    try {
      if (!elementos.length) {
        this.toaster.error('Ningún cambio registrado', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return false;
      }

      this.mostrar_carga_todo = true;

      // Preparar elementos para enviar
      const elementosGuardar = elementos.map(elemento => ({
        ...elemento,
        fuente: fuente // Diferenciar fuente (1 para cambiarColumna, 2 para guardarLoteUsuarioExtras)
      }));


      const resp = await this.recursosHumanosService.guardarLoteRegistroAsistenciaRH(elementosGuardar);

      if (resp && resp.success && resp.data) {
        // Actualizar tablaFiltrada con la respuesta
        this.actualizarTablaFiltradaConRespuesta(resp.data, elementos);

        this.toaster.success(
          `${resp.data.length} ${mensajeExito}`,
          'Éxito',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error al procesar registros:', error);
      this.toaster.error('Error al guardar los registros', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return false;
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  // Método mejorado para actualizar tablaFiltrada
  actualizarTablaFiltradaConRespuesta(datosBackend: any[], elementosOriginales: any[]) {
    // Crear un mapa para acceso rápido por usuario+fecha
    const mapaActualizaciones = new Map();

    datosBackend.forEach((respuesta, index) => {
      if (!respuesta.datos || !Array.isArray(respuesta.datos) || respuesta.datos.length === 0) {
        return;
      }

      const datos = respuesta.datos[0];
      const elementoOriginal = elementosOriginales[index];

      if (datos && elementoOriginal) {
        const clave = `${elementoOriginal.id_usuario}_${elementoOriginal.fecha}`;
        mapaActualizaciones.set(clave, {
          datos,
          elementoOriginal
        });
      }
    });

    // Actualizar todas las filas afectadas
    this.tablaFiltrada.forEach(fila => {
      if (!fila.id_usuario) return;

      fila.dias.forEach((dia, diaIndex) => {
        if (!dia || !dia.fecha) return;

        const clave = `${fila.id_usuario}_${this.convertirFecha(dia.fecha)}`;
        const actualizacion = mapaActualizaciones.get(clave);

        if (actualizacion) {
          this.actualizarDia(dia, actualizacion.datos);
        }
      });

      // Recalcular totales de la fila
      this.recalcularTotalesFila(fila);

    });

    // Forzar actualización de la vista
    this.tablaFiltrada = [...this.tablaFiltrada];

  }

  // Método auxiliar para actualizar un día específico
  actualizarDia(dia: any, datosBackend: any) {
    // Actualizar campos principales
    dia.id_control = datosBackend.id_control;
    dia.tipo = datosBackend.tipo || '';
    dia.horas_extra = datosBackend.horas_extra || 0;
    dia.monto_extra = datosBackend.monto_extra || 0;
    dia.fecha_registro = datosBackend.fecha_registro;
    dia.id_proyecto = datosBackend.id_proyecto;
    dia.id_usuario = datosBackend.id_usuario;
    dia.id_asignacion = datosBackend.id_asignacion;
    dia.fuente = datosBackend.fuente
    // Actualizar asistencias
    if (datosBackend.asistencia_1) {
      dia.asistencia1 = this.formatFechaFromBackend(datosBackend.asistencia_1);
    }
    if (datosBackend.asistencia_2) {
      dia.asistencia2 = this.formatFechaFromBackend(datosBackend.asistencia_2);
    }
    if (datosBackend.asistencia_3) {
      dia.asistencia3 = this.formatFechaFromBackend(datosBackend.asistencia_3);
    }
    if (datosBackend.asistencia_4) {
      dia.asistencia4 = this.formatFechaFromBackend(datosBackend.asistencia_4);
    }

    // Actualizar tipoDescripcion
    dia.tipoDescripcion = this.getTipoDescripcion(datosBackend.tipo || '');

    // Recalcular monto si es necesario
    if (dia.costedia) {
      dia.monto = this.calcularMonto(datosBackend.tipo || '', dia.costedia);
      dia.descuento = this.calcularDescuento(datosBackend.tipo || '', dia.costedia);
    }
  }

  async cambiarColumna(value: string, k: number, selectElement: HTMLSelectElement) {
    try {
      const sw = await SwalService.confirm(
        '¿Está seguro?',
        `Se actualizarán todos los usuarios con el estado ${value} en el día seleccionado`
      );

      if (!sw.isConfirmed) {
        setTimeout(() => {
          selectElement.value = '';
        }, 0);
        return;
      }

      const elementos = [];
      const referencias = [];

      // Recorrer tablaFiltrada para obtener todos los usuarios
      this.tablaFiltrada.forEach(element => {
        if (element.id_usuario && element.dias[k]) {
          const dia = element.dias[k];
          const fechaOriginal = dia.fecha;
          const fechaFormateada = this.convertirFecha(fechaOriginal);

          elementos.push({
            id_control: dia.id_control || null,
            id_proyecto: this.idProyecto,
            id_usuario: element.id_usuario,
            id_area: element.id_area,
            id_cargo: element.id_cargo,
            id_asignacion: element.id_asignacion,
            fecha: fechaFormateada,
            tipo: value,
            fuente: 1,
            asistencia_1: dia.asistencia1 ? this.convertirFechaMySQL(dia.asistencia1) : null,
            asistencia_2: dia.asistencia2 ? this.convertirFechaMySQL(dia.asistencia2) : null,
            asistencia_3: dia.asistencia3 ? this.convertirFechaMySQL(dia.asistencia3) : null,
            asistencia_4: dia.asistencia4 ? this.convertirFechaMySQL(dia.asistencia4) : null,
            horas_extra: dia.horas_extra || 0,
            monto_extra: dia.monto_extra || 0
          });

          referencias.push({
            id_usuario: element.id_usuario,
            fecha: fechaFormateada,
            fechaOriginal: fechaOriginal
          });
        }
      });

      if (elementos.length === 0) {
        this.toaster.error('No hay usuarios para actualizar', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        setTimeout(() => {
          selectElement.value = '';
        }, 0);
        return;
      }

      const success = await this.procesarRegistrosAsistencia(
        elementos,
        1,
        'registros actualizados correctamente'
      );

      if (success) {
        // También actualizar tablaMesUsuario si está abierta
        if (this.tablaMesUsuario && this.tablaMesUsuario.length > 0) {
          this.tablaMesUsuario.forEach(dia => {
            dia.editado = false;
          });
        }
        this.recalcularTotales()
      }

      // Resetear el select
      setTimeout(() => {
        selectElement.value = '';
      }, 0);

    } catch (error) {
      console.error('Error en cambiarColumna:', error);
      SwalService.error();

      // Resetear el select incluso en error
      setTimeout(() => {
        if (selectElement) {
          selectElement.value = '';
        }
      }, 0);
    }
  }

  async guardarLoteUsuarioExtras() {
    try {
      const filtrados = [];
      const referencias = [];

      // Obtener elementos editados
      this.tablaMesUsuario.forEach((ele, index) => {
        if (ele.editado) {
          filtrados.push(ele);

          const fechaOriginal = this.usuarioSeleccionado.dias[index]?.fecha;
          const fechaFormateada = this.convertirFecha(fechaOriginal);

          referencias.push({
            id_usuario: this.usuarioSeleccionado.id_usuario,
            fecha: fechaFormateada,
            fechaOriginal: fechaOriginal,
            indiceTablaMes: index
          });
        }
      });

      if (filtrados.length === 0) {
        this.toaster.error('Ningún cambio registrado', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      }

      const elementos = [];

      for (let j = 0; j < filtrados.length; j++) {
        const row = filtrados[j];
        const ref = referencias[j];

        const obj = {
          id_control: row.id_control || null,
          id_proyecto: this.idProyecto,
          id_usuario: this.usuarioSeleccionado.id_usuario,
          id_area: this.usuarioSeleccionado.id_area,
          id_cargo: this.usuarioSeleccionado.id_cargo,
          id_asignacion: this.usuarioSeleccionado.id_asignacion,
          fecha: ref.fecha,
          tipo: row.tipo,
          fuente: 2,
          asistencia_1: row.asistencia1 ? this.convertirFechaMySQL(row.asistencia1) : null,
          asistencia_2: row.asistencia2 ? this.convertirFechaMySQL(row.asistencia2) : null,
          asistencia_3: row.asistencia3 ? this.convertirFechaMySQL(row.asistencia3) : null,
          asistencia_4: row.asistencia4 ? this.convertirFechaMySQL(row.asistencia4) : null,
          horas_extra: row.horas_extra || 0,
          monto_extra: row.monto_extra || 0
        };

        elementos.push(obj);
      }

      const success = await this.procesarRegistrosAsistencia(
        elementos,
        2,
        'registros guardados correctamente'
      );

      if (success) {
        // Limpiar tablaMesUsuario
        this.recalcularTotales()
        this.tablaMesUsuario.forEach(dia => {
          dia.editado = false;
        });

        // Cerrar modal si está abierto
        if (this.modalDetalleUsuario) {
          this.modalDetalleUsuario.hide();
        }

      }

    } catch (error) {
      console.error('Error en guardarLoteUsuarioExtras:', error);
      this.toaster.error('Error al guardar los registros', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    }
  }

  convertirFechaMySQL(fechaStr: string): string {
    if (!fechaStr) return null;
    return fechaStr.replace('T', ' ');
  }

  async listarMontosAreaPresAnaliticoRH() {
    let montos = []
    const obj = {
      id_proyecto: this.idProyecto
    }
    const resp = await this.recursosHumanosService.listarMontosAreaPresAnaliticoRH(obj)
    if (resp.length) {
      const toNumberOrNull = (value: string): number | null => {
        if (!value || value.trim() === '') {
          return null;
        }
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };
      for (const element of resp) {
        const cargos = [];

        // Verificar que element.cargos sea un string válido
        if (element.cargos && typeof element.cargos === 'string') {
          // Dividir por | para obtener cada cargo
          const cargosStrings = element.cargos.split('|');

          for (const cargoStr of cargosStrings) {
            // Dividir cada cargo por //
            const partes = cargoStr.split('/');

            // Crear objeto cargo con los índices correctos
            const cargo = {
              id_cargo: toNumberOrNull(partes[0]),
              porcentaje: toNumberOrNull(partes[1]),
              parcial: toNumberOrNull(partes[2])
            };

            // Solo agregar si tiene id_cargo
            if (cargo.id_cargo !== null) {
              cargos.push(cargo);
            }
          }
        }

        const data = {
          id_area: element.id_area,
          cargos: cargos,
          tipo: element.descripcion,
          horas_dia: element.formula
        };

        montos.push(data);
      }
    }
    return montos
  }

  // Método para convertir a número romano
  getRomanNumeral(num: number): string {
    if (!num) return
    const romanNumerals: { [key: number]: string } = {
      1: 'I',
      2: 'II',
      3: 'III',
      4: 'IV',
      5: 'V'
    };

    return romanNumerals[num] || num.toString();
  }

  // Método para obtener clase CSS según categoría (opcional)
  getCategoriaBadgeClass(categoria: number): string {
    const classes: { [key: number]: string } = {
      1: 'badge badge-primary',
      2: 'badge badge-success',
      3: 'badge badge-info',
      4: 'badge badge-warning',
      5: 'badge badge-danger'
    };

    return classes[categoria] || 'badge badge-secondary';
  }

  cambioAreaAcum(select) {
    this.cargoSelAcum = null
    if (this.areaSelAcum) {
      this.cargosFiltradosAcum = this.cargosAcum.filter(ele => ele.id_area == this.areaSelAcum)
    } else {

    }

  }

  filtroAcum() {

    if (this.mesSelAcum === null || this.mesSelAcum === undefined) {
      this.toaster.error(
        'Seleccione un mes ',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        }
      );
      return;
    }

    const mesSeleccionado = this.consolidado[this.mesSelAcum];

    if (!mesSeleccionado) {
      // console.error('Mes no encontrado en el consolidado');
      this.toaster.error(
        'Mes no encontrado en el consolidado ',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        }
      );
      this.tablaAcumFiltrada = [];
      this.totalesAcumulados = {}
      return;
    }
    this.filtrarCalendarioPorMes(mesSeleccionado);
    let itemsFiltrados = mesSeleccionado.items;


    if (this.areaSelAcum && this.areaSelAcum !== '') {
      itemsFiltrados = itemsFiltrados.filter(item =>
        item.id_area == this.areaSelAcum
      );

      if (this.cargoSelAcum && this.cargoSelAcum !== '') {
        itemsFiltrados = itemsFiltrados.filter(item =>
          item.id_cargo == this.cargoSelAcum
        );
      }
    }

    this.tablaAcumFiltrada = itemsFiltrados;

    let acumulados = {}
    let totalGeneral = 0
    for (const fila of this.tablaAcumFiltrada) {
      // Solo excluye los encabezados de área, pero incluye los totales
      if (!fila.es_total_area && !fila.es_encabezado_area) {
        for (const dia of fila.calendario) {
          acumulados[dia.fecha] = (acumulados[dia.fecha] || 0) + dia.monto_dia;
        }
      }
      if (fila.es_total_area) {
        totalGeneral = totalGeneral + fila.costo_total
      }
    }
    this.totalesAcumulados = { acumulados: Object.values(acumulados), totalGeneral }
  }

  normalizarNombreMes(nombreMes: string): string {
    const mesesMap: { [key: string]: string } = {
      'ENERO': 'Enero',
      'FEBRERO': 'Febrero',
      'MARZO': 'Marzo',
      'ABRIL': 'Abril',
      'MAYO': 'Mayo',
      'JUNIO': 'Junio',
      'JULIO': 'Julio',
      'AGOSTO': 'Agosto',
      'SETIEMBRE': 'Setiembre',
      'SEPTIEMBRE': 'Setiembre',
      'OCTUBRE': 'Octubre',
      'NOVIEMBRE': 'Noviembre',
      'DICIEMBRE': 'Diciembre'
    };

    const nombreUpper = nombreMes.toUpperCase();
    return mesesMap[nombreUpper] || nombreMes.charAt(0) + nombreMes.slice(1).toLowerCase();
  }

  filtrarCalendarioPorMes(mesSeleccionado: any) {
    this.calendarioFiltrado2 = null;

    if (!mesSeleccionado || !this.calendarioCompleto || this.calendarioCompleto.length === 0) {
      return;
    }

    const mesKey = mesSeleccionado.mes_key;
    const partes = mesKey.split('-');

    if (partes.length !== 2) {
      console.error('Formato de mes_key inválido:', mesKey);
      return;
    }

    const nombreMesMayusculas = partes[0];
    const anio = parseInt(partes[1]);

    // Normalizar el nombre del mes
    const nombreMesNormalizado = this.normalizarNombreMes(nombreMesMayusculas);

    if (this.calendarioCompleto[0]?.meses) {
      const meses = this.calendarioCompleto[0].meses;
      // Buscar coincidencia exacta
      let mesEncontrado = meses.find((mes: any) =>
        mes.mes === nombreMesNormalizado && mes.anio === anio
      );

      // Si no se encuentra, buscar ignorando mayúsculas/minúsculas
      if (!mesEncontrado) {
        mesEncontrado = meses.find((mes: any) =>
          mes.mes.toUpperCase() === nombreMesMayusculas && mes.anio === anio
        );
      }

      if (mesEncontrado) {
        this.calendarioFiltrado2 = mesEncontrado;
        // console.log('Calendario filtrado encontrado:', this.calendarioFiltrado2);
      } else {
        console.warn('No se encontró calendario para el mes:', mesKey);

      }
    }
  }

  async abrirModalVinculo() {
    this.mostrar_carga_todo = true
    await this.listarRegistrosVinculoPlanilla()
    this.modalvinculo.show()
    this.formvinculo.reset()
    this.mostrar_carga_todo = false
  }

  async listarRegistrosVinculoPlanilla() {
    const obj = {
      id_proyecto: this.idProyecto
    }
    this.tablaVinculos = await this.recursosHumanosService.listarRegistrosVinculoPlanilla(obj)
    // const resp = await this.recursosHumanosService.listarRegistrosVinculoPlanilla(obj)
    // let todosLosRegistros = [];
    // for (let i = 0; i < 50; i++) {
    //   todosLosRegistros = todosLosRegistros.concat(resp);
    // }
    // this.tablaVinculos = todosLosRegistros;
  }

  cerrarModalVinculo() {
    this.modalvinculo.hide()
  }


  cambioSelectAreaVinculo(select) {
    this.cargosFiltrados3 = this.cargos.filter(ele => Number(ele.id_area) == Number(this.id_area_vinculo.value))
    this.id_cargo_vinculo.reset()
    if (!this.id_area_vinculo.value) {
      this.id_cargo_vinculo.disable()
    } else {
      this.id_cargo_vinculo.enable()
    }
  }

  async vincularAPlanilla() {
    try {
      if (this.formvinculo.invalid) {
        this.formvinculo.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto o datos no validos',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return

      } else {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: this.idProyecto,
          id_area: this.id_area_vinculo.value || '',
          id_cargo: this.id_cargo_vinculo.value || '',
          fecha_inicio: this.fecha_inicio_vinculo.value,
          fecha_fin: this.fecha_fin_vinculo.value,
        }
        const tablaAsistenciaMovil = await this.recursosHumanosService.listarAsistenciaMovil(obj)
        if (!tablaAsistenciaMovil.length) {
          this.mostrar_carga_todo = false
          this.toaster.info(
            'No se encontraron registros para esta fecha',
            '',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        } else {
          const response = await this.agruparPorDia(tablaAsistenciaMovil)
          await this.vincularASistenciaDiaPlanilla(response, obj)
          this.formvinculo.reset()
          this.mostrar_carga_todo = false
        }
      }
    } catch (error) {

    }
  }

  async guardarRegistroVinculoPlanilla(obj) {
    const obj2 = {
      id_proyecto: obj.id_proyecto,
      id_area: obj.id_area,
      id_cargo: obj.id_cargo,
      fecha_inicio: obj.fecha_inicio,
      fecha_fin: obj.fecha_fin,
      usuario_registrador: this.id_usuario
    }
    const resp = await this.recursosHumanosService.guardarRegistroVinculoPlanilla(obj2)
    if (resp.length) {

      this.tablaVinculos = resp
    }
  }

  validarRangoFechasPersonalizado(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fecha = control.value;

      if (!fecha) {
        return null; // Dejar que required valide si es necesario
      }

      // Validar formato de fecha
      if (!this.esFechaValida(fecha)) {
        return { formatoInvalido: true };
      }

      const fechaDate = new Date(fecha);
      const minDate = new Date(this.fechaMinima);
      const maxDate = new Date(this.fechaMaxima);

      // Validar contra fecha mínima
      if (fechaDate < minDate) {
        return {
          fechaMenorQueMinima: {
            mensaje: `La fecha debe ser posterior o igual a ${this.formatearFechaParaMostrar(this.fechaMinima)}`,
            minima: this.fechaMinima
          }
        };
      }

      // Validar contra fecha máxima
      if (fechaDate > maxDate) {
        return {
          fechaMayorQueMaxima: {
            mensaje: `La fecha debe ser anterior o igual a ${this.formatearFechaParaMostrar(this.fechaMaxima)}`,
            maxima: this.fechaMaxima
          }
        };
      }

      return null;
    };
  }

  // Validador para el rango entre fecha inicio y fecha fin
  validarRangoEntreFechas(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const inicio = group.get('fecha_inicio')?.value;
      const fin = group.get('fecha_fin')?.value;

      if (inicio && fin) {
        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);

        // Validar que las fechas sean válidas
        if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
          return null;
        }

        if (fechaInicio > fechaFin) {
          // Establecer error en fecha_fin
          group.get('fecha_fin')?.setErrors({
            fechaMenorQueInicio: {
              mensaje: `La fecha fin no puede ser menor a la fecha inicio (${this.formatearFechaParaMostrar(inicio)})`
            }
          });
          return { rangoInvalido: true };
        } else {
          // Limpiar el error de fecha_fin si existe y la validación pasa
          const finErrors = group.get('fecha_fin')?.errors;
          if (finErrors && finErrors['fechaMenorQueInicio']) {
            const newErrors = { ...finErrors };
            delete newErrors['fechaMenorQueInicio'];
            group.get('fecha_fin')?.setErrors(Object.keys(newErrors).length ? newErrors : null);
          }
          return null;
        }
      }

      return null;
    };
  }

  // Validar que la fecha tenga formato correcto
  esFechaValida(fecha: string): boolean {
    if (!fecha) return false;

    // Verificar formato YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;

    // Verificar que sea una fecha real
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const fechaObj = new Date(anio, mes - 1, dia);

    return fechaObj.getFullYear() === anio &&
      fechaObj.getMonth() === mes - 1 &&
      fechaObj.getDate() === dia;
  }

  // Formatear fecha para mostrar en mensajes de error
  formatearFechaParaMostrar(fecha: string): string {
    if (!fecha) return '';
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  // Método para validar en tiempo real mientras escribe
  onFechaChange(campo: string, event: any) {
    const valor = event.target.value;
    const control = this.formvinculo.get(campo);

    if (valor) {
      control?.updateValueAndValidity();
    }
  }

  agruparPorDia(asistencias: Asistencia[]): AsistenciaAgrupadaPorDia[] {
    const grupos = new Map<string, any>();

    asistencias.forEach(asistencia => {
      const fecha = asistencia.fecha_hora.split('T')[0];
      const clave = `${asistencia.id_usuario}_${asistencia.id_proyecto}_${asistencia.id_area}_${asistencia.id_cargo}_${asistencia.id_asignacion}_${fecha}`;

      if (!grupos.has(clave)) {
        grupos.set(clave, {
          id_usuario: asistencia.id_usuario,
          id_proyecto: asistencia.id_proyecto,
          id_area: asistencia.id_area,
          id_cargo: asistencia.id_cargo,
          id_asignacion: asistencia.id_asignacion,
          fecha: fecha,
          fecha_display: this.formatearFechaParaMostrar(fecha),
          nombres_usuario: asistencia.nombres_usuario,
          apellidos_usuario: asistencia.apellidos_usuario,
          nombre_completo_usuario: asistencia.nombre_completo_usuario,
          nombre_area: asistencia.nombre_area,
          nombre_cargo: asistencia.nombre_cargo,
          tipo_asistencia1: null,
          tipo_asistencia2: null,
          tipo_asistencia3: null,
          tipo_asistencia4: null,
          total_registros: 0
        });
      }

      const grupo = grupos.get(clave);
      const propiedad = `tipo_asistencia${asistencia.tipo_asistencia}`;
      if (grupo.hasOwnProperty(propiedad)) {
        grupo[propiedad] = asistencia.fecha_hora;
        grupo.total_registros++;
      }
    });

    // Convertir Map a Array y procesar
    return Array.from(grupos.values()).map(grupo => ({
      ...grupo,
      registros_completos: grupo.tipo_asistencia1 !== null &&
        grupo.tipo_asistencia2 !== null &&
        grupo.tipo_asistencia3 !== null &&
        grupo.tipo_asistencia4 !== null,
      tiene_ingreso: grupo.tipo_asistencia1 !== null,
      tiene_salida_almuerzo: grupo.tipo_asistencia2 !== null,
      tiene_retorno_almuerzo: grupo.tipo_asistencia3 !== null,
      tiene_salida: grupo.tipo_asistencia4 !== null
    })).sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return a.id_usuario - b.id_usuario;
    });
  }


  // async aprobarPlanilla() {
  //   try {
  //     this.mostrar_carga_todo = true;
  //     const valido = await this.verificarAprobarPlanilla()
  //     this.mostrar_carga_todo = false;
  //     if (!valido.valido) {
  //       this.toaster.error(valido.msj, '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 5000,
  //       });
  //       return
  //     }
  //     SwalService.confirm(
  //       '¿Está seguro ?',
  //       'Se aprobará la planilla para el mes de ' + this.meses[this.mesSeleccionado] + ' y el mes ya no sera editable'
  //     ).then(async (result) => {
  //       if (result.isConfirmed) {
  //         try {
  //           this.mostrar_carga_todo = true;
  //           let tablaPlanillaAprobada = []
  //           const mesesMap = {
  //             'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
  //             'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
  //             'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
  //           };

  //           const mesFormateado = this.meses[this.mesSeleccionado].split(' - ')
  //             .reverse()
  //             .map((part, i) => i === 0 ? mesesMap[part] : part)
  //             .join('-');
  //           for (const element of this.tablaFiltrada) {
  //             const resultado = this.generarStringRegistros(element.dias);
  //             // Crear el string único con todos los valores separados por |
  //             const tipos_dias = [
  //               element.dias_laborados,
  //               element.dias_dominicales,
  //               element.dias_feriados,
  //               element.dias_tardanzas,
  //               element.dias_permiso,
  //               element.dias_faltados,
  //               element.dias_otros
  //             ].join('|');


  //             let tipo_fila = 0;
  //             if (element.id_cargo && !element.id_usuario) {
  //               tipo_fila = 1;  // esCargo
  //             } else if (element.id_usuario) {
  //               tipo_fila = 2;  // esUsuario (si aplica)
  //             } else if (!element.id_cargo && !element.id_usuario) {
  //               tipo_fila = 0;  // esArea
  //             }

  //             const obj: planillaAprobada = {
  //               id_proyecto: this.idProyecto,
  //               id_usuario: element.id_usuario,
  //               descripcion_usuario: element.descripcion_usuario,
  //               id_area: element.id_area,
  //               area: element.area,
  //               id_cargo: element.id_cargo,
  //               cargo: element.cargo,
  //               tipo_cargo: element.tipo_cargo,
  //               dias: resultado,
  //               tipos_dias: tipos_dias,
  //               coste_dia: element.coste_dia,
  //               coste_mensual: element.coste_mensual,
  //               tipo_fila: tipo_fila, // 0 = Area, 1 = Cargo, 2 = Usuario (opcional),
  //               mes: mesFormateado,
  //               id_asignacion:row.id_asignacion,
  //             }
  //             tablaPlanillaAprobada.push(obj)
  //           }
  //         } catch (error) {
  //           console.error('Error:', error);
  //           SwalService.error('Error al procesar la eliminación');
  //           this.mostrar_carga_todo = false;
  //         } finally {
  //           this.mostrar_carga_todo = false;
  //         }
  //       }
  //     });

  //   } catch (error) {
  //     this.mostrar_carga_todo = false
  //     console.log(error)
  //     SwalService.error()
  //   }
  // }

  generarStringRegistros(data: any[]): string {
    return data.map(item => {
      return [
        item?.fecha || '',
        item?.costedia || 0,
        item?.horas_extra || 0,
        item?.monto || 0,
        item?.monto_extra || 0,
        item?.tipo || ''
      ].join('|');
    }).join('/');
  }

  verificarAprobarPlanilla() {
    let valido = true
    let msj = ''
    if (!this.tablaFiltrada.length) {
      msj = 'Tabla planilla vacia'
      valido = false
    } else if (this.tablaFiltrada.some(ele => ele.invalido)) {
      valido = false
      msj = 'Existe usuario con Coste mensual no válido'
    }

    return { valido: valido, msj: msj }
  }

  async aprobarPlanillaUsuario(row, i) {
    try {
      const sw = await SwalService.confirm('Esta seguro?', 'Se ' + (row.planilla_mensual_aprobada == null ? ' almacenará la planilla del mes actual  al usuario' : ' reemplazará la anterior planilla almacenada por los datos actuales del mes'))
      if (sw.isConfirmed) {
        console.log('row', row)
        this.mostrar_carga_todo = true
        const mesesMap = {
          'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
          'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
          'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
        };

        const mesFormateado = this.meses[this.mesSeleccionado].split(' - ')
          .reverse()
          .map((part, i) => i === 0 ? mesesMap[part] : part)
          .join('-');
        const resultado = this.generarStringRegistros(row.dias);

        // Crear el string único con todos los valores separados por |
        const tipos_dias = [
          row.dias_laborados,
          row.dias_dominicales,
          row.dias_feriados,
          row.dias_tardanzas,
          row.dias_permiso,
          row.dias_faltados,
          row.dias_otros
        ].join('|');


        let tipo_fila = 0;
        if (row.id_cargo && !row.id_usuario) {
          tipo_fila = 1;  // esCargo
        } else if (row.id_usuario) {
          tipo_fila = 2;  // esUsuario (si aplica)
        } else if (!row.id_cargo && !row.id_usuario) {
          tipo_fila = 0;  // esArea
        }
        if (row.planilla_mensual_aprobada == null) {
          const objAgregar: planillaAprobada = {
            id_proyecto: this.idProyecto,
            id_usuario: row.id_usuario,
            descripcion_usuario: row.descripcion_usuario,
            id_area: row.id_area,
            area: row.area,
            id_cargo: row.id_cargo,
            cargo: row.cargo,
            tipo_cargo: row.tipo_cargo,
            dias: resultado, // fecha,costedia,horas_extra, monto, monto_extra, tipo
            tipos_dias: tipos_dias,  //  Formato: "dias_laborados|dias_dominicales|dias_feriados|dias_tardanzas|dias_permiso|dias_faltados|dias_otros"
            coste_dia: row.coste_dia,
            coste_mensual: row.coste_mensual,
            tipo_fila: 2,  // 0 = Area, 1 = Cargo, 2 = Usuario (reemplaza a esArea y esCargo)
            mes: mesFormateado,
            coste_pagado: 0,
            id_asignacion: row.id_asignacion,
            estado_pago: 0, // 0 = pendiente, 1 = pagado, etc.
            adjunto: '', // ruta o URL del archivo adjunto
          }
          const resp = await this.recursosHumanosService.guardarPlanillaMensualAprobada(objAgregar)
          if (resp[0]?.id_aprobado_planilla) {
            objAgregar['id_aprobado_planilla'] = resp[0]?.id_aprobado_planilla
            row.planilla_mensual_aprobada = objAgregar
            this.toaster.success(
              'Se guardo correctamente',
              'Correcto',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
          } else {
            this.toaster.error(
              'No se pudo guardar',
              'Error',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
          }
        } else {
          const objActualizar: planillaAprobada = {
            id_aprobado_planilla: row.planilla_mensual_aprobada.id_aprobado_planilla,
            id_proyecto: this.idProyecto,
            id_usuario: row.id_usuario,
            descripcion_usuario: row.descripcion_usuario,
            id_area: row.id_area,
            area: row.area,
            id_cargo: row.id_cargo,
            cargo: row.cargo,
            tipo_cargo: row.tipo_cargo,
            dias: resultado, // fecha,costedia,horas_extra, monto, monto_extra, tipo
            tipos_dias: tipos_dias,  //  Formato: "dias_laborados|dias_dominicales|dias_feriados|dias_tardanzas|dias_permiso|dias_faltados|dias_otros"
            coste_dia: row.coste_dia,
            coste_mensual: row.coste_mensual,
            tipo_fila: 2,  // 0 = Area, 1 = Cargo, 2 = Usuario (reemplaza a esArea y esCargo)
            mes: mesFormateado,
            coste_pagado: 0,
            id_asignacion: row.id_asignacion,
            estado_pago: 0, // 0 = pendiente, 1 = pagado, etc.
            adjunto: '' // ruta o URL del archivo adjunto
          }
          const resp = await this.recursosHumanosService.actualizarPlanillaMensualAprobada(objActualizar)
          if (resp[0]?.id_aprobado_planilla) {
            objActualizar['id_aprobado_planilla'] = resp[0]?.id_aprobado_planilla
            row.planilla_mensual_aprobada = objActualizar
            this.toaster.success(
              'Se actualizó correctamente',
              'Correcto',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
          } else {
            this.toaster.error(
              'No se pudo guardar',
              'Error',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
          }
        }
        this.mostrar_carga_todo = false
      }
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async eliminarPlanillaAprobado(row, i) {
    try {
      const sw = await SwalService.confirm('Esta seguro?', 'Se eliminara la planilla almacenada para el mes del usuario seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: row.planilla_mensual_aprobada.id_proyecto,
          id_aprobado_planilla: row.planilla_mensual_aprobada.id_aprobado_planilla
        }
        const res = await this.recursosHumanosService.eliminarPlanillaMensualAprobada(obj)
        if (res[0].codigo == 1) {
          row.planilla_mensual_aprobada = null
          this.toaster.success(
            res[0].mensaje,
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        } else {
          this.toaster.error(
            res[0].mensaje,
            '',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        }
        this.mostrar_carga_todo = false
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
    }
  }

  abrirModalPlanillaAprobada(row) {
    // Asignar los datos originales
    this.planillaAprobada = row.planilla_mensual_aprobada;

    if (this.planillaAprobada) {
      // Parsear el string 'dias' a un array de objetos
      this.planillaAprobada.diasArray = this.parseDiasString(this.planillaAprobada.dias);

      // Parsear el string 'tipos_dias' a un objeto con propiedades
      const tiposDiasObj = this.parseTiposDiasString(this.planillaAprobada.tipos_dias);
      this.planillaAprobada.dias_laborados = tiposDiasObj.dias_laborados;
      this.planillaAprobada.dias_dominicales = tiposDiasObj.dias_dominicales;
      this.planillaAprobada.dias_feriados = tiposDiasObj.dias_feriados;
      this.planillaAprobada.dias_tardanzas = tiposDiasObj.dias_tardanzas;
      this.planillaAprobada.dias_permiso = tiposDiasObj.dias_permiso;
      this.planillaAprobada.dias_faltados = tiposDiasObj.dias_faltados;
      this.planillaAprobada.dias_otros = tiposDiasObj.dias_otros;

      // Convertir tipo_fila de booleano/numero a número
      this.planillaAprobada.tipo_fila = this.planillaAprobada.tipo_fila === true ? 1 :
        (this.planillaAprobada.tipo_fila === false ? 0 :
          Number(this.planillaAprobada.tipo_fila) || 0);

      // Convertir estado_pago de booleano a número
      this.planillaAprobada.estado_pago = this.planillaAprobada.estado_pago === true ? 1 :
        (this.planillaAprobada.estado_pago === false ? 0 :
          Number(this.planillaAprobada.estado_pago) || 0);
    }

    this.modalPlanillaAprobada.show();
  }

  // Función para parsear el string 'dias' a un array de objetos
  parseDiasString(diasString: string): any[] {
    if (!diasString) return [];

    return diasString.split('/').map(item => {
      const partes = item.split('|');
      return {
        fecha: partes[0] || '',
        costedia: parseFloat(partes[1]) || 0,
        horas_extra: parseFloat(partes[2]) || 0,
        monto: parseFloat(partes[3]) || 0,
        monto_extra: parseFloat(partes[4]) || 0,
        tipo: partes[5] || ''
      };
    });
  }

  // Función para parsear el string 'tipos_dias' a un objeto con los 7 valores
  parseTiposDiasString(tiposDiasString: string): any {
    if (!tiposDiasString) {
      return {
        dias_laborados: 0,
        dias_dominicales: 0,
        dias_feriados: 0,
        dias_tardanzas: 0,
        dias_permiso: 0,
        dias_faltados: 0,
        dias_otros: 0
      };
    }

    const valores = tiposDiasString.split('|');
    return {
      dias_laborados: parseInt(valores[0]) || 0,
      dias_dominicales: parseInt(valores[1]) || 0,
      dias_feriados: parseInt(valores[2]) || 0,
      dias_tardanzas: parseInt(valores[3]) || 0,
      dias_permiso: parseInt(valores[4]) || 0,
      dias_faltados: parseInt(valores[5]) || 0,
      dias_otros: parseInt(valores[6]) || 0
    };
  }



  // Función para generar el string 'tipos_dias' desde un objeto
  generarStringTiposDias(tipos: any): string {
    return [
      tipos?.dias_laborados || 0,
      tipos?.dias_dominicales || 0,
      tipos?.dias_feriados || 0,
      tipos?.dias_tardanzas || 0,
      tipos?.dias_permiso || 0,
      tipos?.dias_faltados || 0,
      tipos?.dias_otros || 0
    ].join('|');
  }

  cerrarModalAprobado() {
    this.planillaAprobada = null
    this.modalPlanillaAprobada.hide()
  }

  abrirModalPlanillaVinculo(row?) {
    this.formPlanillaVinculo.reset()
    if (row) {

    } else {

    }
    this.modalPlanillaVinculo.show()
  }

  cerrarModalPlanillaVinculo() {
    this.modalPlanillaVinculo.hide()
  }

  selTablaReq(row, i) {
    if (i !== this.filSelReq) {
      this.filSelReq = i;
      this.reqcargSeleccionado = null;
    }

    const adqui = this.tablaRegActividades[this.filSelRegAct];
    this.reqcargSeleccionado = this.requerimientosCargos.find(ele =>
      ele.idfila_req == adqui.idfila &&
      ele.idfila_des == row.idfila &&
      ele.idgrupo == row.idgrupo &&
      ele.indrep == row.indrep
    );

    if (!this.reqcargSeleccionado) {
      // 🔥 NO limpiar filSelReq, mantener la selección
      console.log('Esta fila no tiene relación con ningún cargo - La tabla se mostrará vacía');
    } else {
      console.log('Relación encontrada:', this.reqcargSeleccionado);
      console.log('Cargos vinculados:', this.reqcargSeleccionado.cargos);
    }

    // Forzar actualización de la vista
    this.reporteEstructurado = [...this.reporteEstructurado];
  }

  async listarRequerimientoCargo() {
    const obj = {
      id_proyecto: this.idProyecto,
      // id_registro: row.id_registro,
      // idgrupo: row.idgrupo,
      // idfila: row.idfila,
    }
    this.requerimientosCargos = await this.recursosHumanosService.listarRequerimientoCargo(obj)
    console.log('this.requerimientosCargos', this.requerimientosCargos)
  }

  // async onVinculadoChange(cargo, event: any) {
  //   this.mostrar_carga = true
  //   const isChecked = event.checked;
  //   const requerimiento = this.tablaRequerimientos[this.filSelReq];
  //   const adqui = this.tablaRegActividades[this.filSelRegAct];
  //   let cargosRelacionados = this.reqcargSeleccionado?.cargos
  //     ? this.reqcargSeleccionado.cargos.split('|').filter(c => c)
  //     : [];


  //   const cargoId = cargo.id_cargo.toString() + '-' + cargo.tipo_cargo;
  //   const index = cargosRelacionados.indexOf(cargoId);

  //   if (isChecked && index === -1) {
  //     cargosRelacionados.push(cargoId);
  //   } else if (!isChecked && index !== -1) {
  //     cargosRelacionados.splice(index, 1);
  //   } else {
  //     console.log('No se realizaron cambios en el array');
  //   }

  //   try {
  //     if (cargosRelacionados.length > 0) {
  //       const obj: any = {
  //         id_proyecto: this.idProyecto,
  //         id_registro: requerimiento.id_registro,
  //         idgrupo: requerimiento.idgrupo,
  //         idfila_des: requerimiento.idfila,
  //         idfila_req: adqui.idfila,
  //         indrep: requerimiento.indrep,
  //         cargos: cargosRelacionados.join('|')
  //       };


  //       if (this.reqcargSeleccionado) {
  //         obj.id_relacion = this.reqcargSeleccionado.id_relacion;
  //         const resp = await this.recursosHumanosService.actualizarRequerimientoCargo(obj);
  //         console.log('Actualizado:', resp);

  //         this.reqcargSeleccionado.cargos = cargosRelacionados.join('|');
  //         if (this.reqcargSeleccionado) {
  //           this.reqcargSeleccionado.cargos = cargosRelacionados.join('|');
  //         }

  //       } else {
  //         // Crear nuevo
  //         console.log('Creando nuevo...');
  //         const resp = await this.recursosHumanosService.guardarRequerimientoCargo(obj);
  //         console.log('Creado:', resp);

  //         const nuevoId = resp[0]?.nuevo_id_relacion || resp[0]?.id_relacion;

  //         if (nuevoId) {
  //           // Asignar el objeto COMPLETO, no solo id_relacion y cargos
  //           this.reqcargSeleccionado = {
  //             id_relacion: nuevoId,
  //             id_proyecto: obj.id_proyecto,
  //             id_registro: obj.id_registro,
  //             idgrupo: obj.idgrupo,
  //             idfila_req: obj.idfila_req,
  //             idfila_des: obj.idfila_des,
  //             indrep: obj.indrep,
  //             cargos: obj.cargos
  //           };
  //           console.log('reqcargSeleccionado creado:', this.reqcargSeleccionado);
  //         }
  //       }
  //     } else if (this.reqcargSeleccionado) {
  //       // Eliminar todos los cargos
  //       console.log('Eliminando registro completo...');
  //       const resp = await this.recursosHumanosService.eliminarRequerimientoCargo({
  //         id_relacion: this.reqcargSeleccionado.id_relacion
  //       });
  //       console.log('Eliminado:', resp);
  //       this.reqcargSeleccionado = null;
  //       console.log('Objetos limpiados');
  //     } else {
  //       console.log('No hay cargos relacionados y no hay registro seleccionado');
  //     }
  //     await this.actualizarCargosVinculados();
  //     // Actualizar el estado del toggle localmente
  //     cargo.tipo_cargo_vinculado = isChecked;

  //     // Actualizar el estado del toggle localmente
  //     cargo.tipo_cargo_vinculado = isChecked;
  //     console.log('Estado del toggle actualizado:', cargo.tipo_cargo_vinculado);
  //     console.log('this.reqcargSeleccionado', this.reqcargSeleccionado)
  //     this.mostrar_carga = false
  //   } catch (error) {
  //     console.error('Error al procesar el cambio:', error);
  //     // Revertir el cambio en caso de error
  //     cargo.tipo_cargo_vinculado = !isChecked;
  //     // Mostrar mensaje de error al usuario
  //     alert('Error al guardar los cambios. Intente nuevamente.');
  //     this.mostrar_carga = false
  //   }
  // }

  async onVinculadoChange(cargo, event: any) {
    this.mostrar_carga = true
    const isChecked = event.checked;
    const requerimiento = this.tablaRequerimientos[this.filSelReq];
    const adqui = this.tablaRegActividades[this.filSelRegAct];
    let cargosRelacionados = this.reqcargSeleccionado?.cargos
      ? this.reqcargSeleccionado.cargos.split('|').filter(c => c)
      : [];

    const cargoId = cargo.id_cargo.toString() + '-' + cargo.tipo_cargo;
    const index = cargosRelacionados.indexOf(cargoId);

    if (isChecked && index === -1) {
      cargosRelacionados.push(cargoId);
    } else if (!isChecked && index !== -1) {
      cargosRelacionados.splice(index, 1);
    } else {
      console.log('No se realizaron cambios en el array');
    }

    try {
      if (cargosRelacionados.length > 0) {
        const obj: any = {
          id_proyecto: this.idProyecto,
          id_registro: requerimiento.id_registro,
          idgrupo: requerimiento.idgrupo,
          idfila_des: requerimiento.idfila,
          idfila_req: adqui.idfila,
          indrep: requerimiento.indrep,
          cargos: cargosRelacionados.join('|')
        };

        if (this.reqcargSeleccionado) {
          obj.id_relacion = this.reqcargSeleccionado.id_relacion;
          const resp = await this.recursosHumanosService.actualizarRequerimientoCargo(obj);

          this.reqcargSeleccionado.cargos = cargosRelacionados.join('|');

          // ACTUALIZAR el registro en requerimientosCargos
          const indexEnRequerimientos = this.requerimientosCargos.findIndex(
            ele => ele.id_relacion === this.reqcargSeleccionado.id_relacion
          );
          if (indexEnRequerimientos !== -1) {
            this.requerimientosCargos[indexEnRequerimientos].cargos = cargosRelacionados.join('|');
          }

        } else {
          // CREAR NUEVO
          const resp = await this.recursosHumanosService.guardarRequerimientoCargo(obj);

          const nuevoId = resp[0]?.nuevo_id_relacion || resp[0]?.id_relacion;

          if (nuevoId) {
            // Crear el nuevo registro completo
            const nuevoRegistro = {
              id_relacion: nuevoId,
              id_proyecto: obj.id_proyecto,
              id_registro: obj.id_registro,
              idgrupo: obj.idgrupo,
              idfila_req: obj.idfila_req,
              idfila_des: obj.idfila_des,
              indrep: obj.indrep,
              cargos: obj.cargos
            };

            this.reqcargSeleccionado = nuevoRegistro;

            // AGREGAR el nuevo registro a requerimientosCargos
            this.requerimientosCargos.push(nuevoRegistro);
          }
        }
      } else if (this.reqcargSeleccionado) {
        // ELIMINAR todos los cargos
        const resp = await this.recursosHumanosService.eliminarRequerimientoCargo({
          id_relacion: this.reqcargSeleccionado.id_relacion
        });

        // ELIMINAR el registro de requerimientosCargos
        const indexEnRequerimientos = this.requerimientosCargos.findIndex(
          ele => ele.id_relacion === this.reqcargSeleccionado.id_relacion
        );
        if (indexEnRequerimientos !== -1) {
          this.requerimientosCargos.splice(indexEnRequerimientos, 1);
        }

        this.reqcargSeleccionado = null;
      } else {
        console.log('No hay cargos relacionados y no hay registro seleccionado');
      }

      // ACTUALIZAR cargosVinculados basado en requerimientosCargos actualizado
      this.cargosVinculados = this.requerimientosCargos.reduce((acc, ele) => {
        if (ele.cargos) {
          return acc.concat(ele.cargos.split('|'));
        }
        return acc;
      }, []);

      // Actualizar el estado del toggle localmente
      cargo.tipo_cargo_vinculado = isChecked;
      this.mostrar_carga = false

    } catch (error) {
      console.error('Error al procesar el cambio:', error);
      // Revertir el cambio en caso de error
      cargo.tipo_cargo_vinculado = !isChecked;
      alert('Error al guardar los cambios. Intente nuevamente.');
      this.mostrar_carga = false
    }
  }

  verDisabled(cargo) {
    const cargoId = cargo.id_cargo.toString() + '-' + cargo.tipo_cargo;
    const row = this.reqcargSeleccionado?.cargos ? this.reqcargSeleccionado?.cargos?.split('|') : []
    let existe = false
    if ((this.cargosVinculados.includes(cargoId) && !row.includes(cargoId)) || this.filSelReq == null) {
      existe = true
    }
    return existe
  }

  async actualizarCargosVinculados() {

    if (this.reqcargSeleccionado?.cargos) {
      this.cargosVinculados = this.reqcargSeleccionado.cargos.split('|');
    } else {
      this.cargosVinculados = [];
    }
  }

  // Método único para expandir (maxtodo)
  maxtodo(index?: number): void {
    const procesarArea = (fila: any, idx: number) => {
      fila.icomost = false; // Cambiar a false porque después de expandir, muestra icono de contraer
      for (let i = idx + 1; i < this.tablaData.length; i++) {
        const nextRow = this.tablaData[i];
        if (nextRow.esArea) break;
        if (!nextRow.esArea) nextRow.mostrar = false; // false = mostrar
      }
    };

    if (index !== undefined) {
      const areaRow = this.tablaData[index];
      if (areaRow?.esArea) procesarArea(areaRow, index);
    } else {
      this.tablaData.forEach((fila, idx) => {
        if (fila.esArea) procesarArea(fila, idx);
      });
    }
  }

  // Método único para contraer (mintodo)
  mintodo(index?: number): void {
    const procesarArea = (fila: any, idx: number) => {
      fila.icomost = true; // Cambiar a true porque después de contraer, muestra icono de expandir
      for (let i = idx + 1; i < this.tablaData.length; i++) {
        const nextRow = this.tablaData[i];
        if (nextRow.esArea) break;
        if (!nextRow.esArea) nextRow.mostrar = true; // true = ocultar
      }
    };

    if (index !== undefined) {
      const areaRow = this.tablaData[index];
      if (areaRow?.esArea) procesarArea(areaRow, index);
    } else {
      this.tablaData.forEach((fila, idx) => {
        if (fila.esArea) procesarArea(fila, idx);
      });
    }
  }

  async generarPlanillaProyecto(data, completo, tabla) {
    console.log('data', data);
    console.log('tabla', tabla);

    // 🔥 INICIALIZAR el Set al inicio de cada llamada
    this.procesadosPlanilla = new Set();

    const montosAreas = await this.listarMontosAreaPresAnaliticoRH();
    const obj = {
      id_proyecto: this.idProyecto,
      id_area: 0
    };
    const datos = await this.recursosHumanosService.listarHorarioYFeriadosArea(obj);

    const mesesMap = {
      'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
      'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
      'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
    };

    // Crear un mapa de planillas aprobadas por mes y asignación
    const planillaAprobadaMap = new Map();
    if (data.planilla_aprobada && data.planilla_aprobada.length > 0) {
      data.planilla_aprobada.forEach(planilla => {
        const key = `${planilla.id_asignacion}_${planilla.mes}`;
        planillaAprobadaMap.set(key, planilla);
      });
    }

    let asistenciaRestante = [...data.asistencia];
    const resultadosPorMes = {};

    for (const anio of completo.calendario) {
      for (const mes of anio.meses) {
        const mesFormat = mesesMap[mes.mes] + '-' + mes.anio;
        const filtrados = [];
        const indicesAEliminar = [];

        // Recorrer registros de asistencia
        for (let i = 0; i < asistenciaRestante.length; i++) {
          const registro = asistenciaRestante[i];
          const fecha = new Date(registro.fecha);
          const mesNumero = String(fecha.getMonth() + 1).padStart(2, '0');
          const añoNumero = fecha.getFullYear();
          const mesKey = `${mesNumero}-${añoNumero}`;

          if (mesKey === mesFormat) {
            // Verificar si existe planilla aprobada para esta asignación y mes
            const planillaKey = `${registro.id_asignacion}_${mesKey}`;
            const planillaExistente = planillaAprobadaMap.get(planillaKey);

            if (planillaExistente) {
              // Verificar si ya procesamos este mes para esta asignación
              const asignacionMesKey = `${registro.id_asignacion}_${mesFormat}`;

              if (!this.procesadosPlanilla.has(asignacionMesKey)) {
                this.procesadosPlanilla.add(asignacionMesKey);

                // Determinar estado según estado_pago
                let estadoPlanilla = '';
                let estadoNumerico = planillaExistente.estado_pago;
                if (typeof estadoNumerico === 'boolean') {
                  estadoNumerico = estadoNumerico ? 1 : 0;
                }

                switch (estadoNumerico) {
                  case 0:
                    estadoPlanilla = 'APROBADO';
                    break;
                  case 1:
                    estadoPlanilla = 'PAGADO';
                    break;
                  case 2:
                    estadoPlanilla = 'RECHAZADO';
                    break;
                  default:
                    estadoPlanilla = 'APROBADO';
                }

                // Crear UN SOLO registro con el monto TOTAL del mes
                const registroUnico = {
                  ...registro,
                  coste_dia: planillaExistente.coste_dia || 0,
                  monto_calculado: planillaExistente.coste_mensual || 0,
                  monto_base: planillaExistente.coste_mensual || 0,
                  descuento_aplicado: "0",
                  es_dia_no_laborable: false,
                  es_feriado: false,
                  es_dia_especial: false,
                  tipo_descripcion: 'PLANILLA APROBADA',
                  dia_semana: this.getDiaSemanaEspanol(moment(registro.fecha)),
                  es_planilla_aprobada: true,
                  estado_planilla: estadoPlanilla,
                  estado_pago: estadoNumerico,
                  cantidad_dias: 1,
                  es_registro_mensual: true
                };

                filtrados.push(registroUnico);
              }

              // Siempre eliminar el registro de asistencia diaria
              indicesAEliminar.push(i);
            } else {
              // Calcular usando asistencia diaria
              let dataHorario = datos[0].find(ele => ele.id_area == registro.id_area);
              if (!dataHorario) {
                dataHorario = {
                  id_configuracion: null,
                  id_proyecto: registro.id_proyecto,
                  id_area: registro.id_area,
                  inicio_semana: 'LUNES',
                  dias_nolaborables: 'DOMINGO',
                  hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
                  hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
                  hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
                  hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
                  totales_dia: 48,
                  descuentos: '|10|10||100|100|||||||',
                  tardanza: 10,
                  tiempo_extra: 0
                };
              }

              const descuentos = dataHorario?.descuentos.split('|');
              const diasNoLaborables = dataHorario?.dias_nolaborables.split('|');
              const feriadosSoloFecha = datos[1].filter(ele => {
                const areas = ele.areas?.split('|');
                return areas && areas.includes(registro.id_area.toString());
              }).map(ele => ele.fecha.split('T')[0]);

              const costesCargoDia = montosAreas.find(ele =>
                ele.id_area == registro.id_area &&
                ele.tipo == ('JORNAL CATEGORIA ' + registro.tipo_cargo)
              )?.cargos.find(ele => ele.id_cargo == registro.id_cargo);

              let costeDia = costesCargoDia ? costesCargoDia.parcial : 0;

              const fechaMoment = moment(registro.fecha);
              const diaSemana = this.getDiaSemanaEspanol(fechaMoment);
              const fechaKey = fechaMoment.format('YYYY-MM-DD');

              const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
              const esFeriado = feriadosSoloFecha.includes(fechaKey);
              // const esDiaEspecial = esDiaNoLaborable || esFeriado;
              const esDiaEspecial = false
              const tipoCodigo = registro.tipo || '';
              const tipoInfo = this.obtenerTipoInfo(tipoCodigo);

              let montoDia = 0;
              let descuentoAplicado = "0";

              if (!esDiaEspecial) {
                if (tipoInfo && tipoInfo.descuento && tipoInfo.descuento !== "") {
                  const porcentajeDescuento = parseInt(tipoInfo.descuento) || 0;
                  const descuentoMonto = costeDia * (porcentajeDescuento / 100);
                  montoDia = costeDia - descuentoMonto;
                  descuentoAplicado = tipoInfo.descuento;
                } else if (tipoCodigo === 'A' || tipoCodigo === 'TEX') {
                  montoDia = costeDia;
                  descuentoAplicado = "0";
                } else if (!tipoCodigo || tipoCodigo === '') {
                  montoDia = 0;
                  descuentoAplicado = "100";
                } else {
                  montoDia = 0;
                  descuentoAplicado = "100";
                }
              } else {
                montoDia = 0;
                descuentoAplicado = "100";
              }

              const horasExtra = registro.horas_extra || 0;
              const montoExtra = registro.monto_extra || 0;
              const montoTotalDia = montoDia + montoExtra;

              const registroEnriquecido = {
                ...registro,
                coste_dia: costeDia,
                monto_calculado: montoTotalDia,
                monto_base: montoDia,
                descuento_aplicado: descuentoAplicado,
                es_dia_no_laborable: esDiaNoLaborable,
                es_feriado: esFeriado,
                es_dia_especial: esDiaEspecial,
                tipo_descripcion: tipoInfo?.tipo || '',
                dia_semana: diaSemana,
                es_planilla_aprobada: false,
                estado_planilla: 'PENDIENTE',
                estado_pago: null,
                cantidad_dias: 1
              };

              filtrados.push(registroEnriquecido);
              indicesAEliminar.push(i);
            }
          }
        }

        // Eliminar del array (de atrás hacia adelante)
        for (let i = indicesAEliminar.length - 1; i >= 0; i--) {
          asistenciaRestante.splice(indicesAEliminar[i], 1);
        }

        resultadosPorMes[mesFormat] = filtrados;
        console.log(`Mes ${mesFormat}: ${filtrados.length} registros - Restantes: ${asistenciaRestante.length}`);

        if (asistenciaRestante.length === 0) break;
      }
      if (asistenciaRestante.length === 0) break;
    }

    console.log('resultadosPorMes', resultadosPorMes);
    return resultadosPorMes;
  }

  generarReportePlanillaPlano(resultadosPorMes: any, organigrama: any[]) {
    const filasReporte = [];
    let totalGeneral = 0;

    const nombreMeses = {
      '01': 'ENERO', '02': 'FEBRERO', '03': 'MARZO', '04': 'ABRIL',
      '05': 'MAYO', '06': 'JUNIO', '07': 'JULIO', '08': 'AGOSTO',
      '09': 'SEPTIEMBRE', '10': 'OCTUBRE', '11': 'NOVIEMBRE', '12': 'DICIEMBRE'
    };

    const descripcionBase = this.tablaRegActividades[this.filSelRegAct]?.descripcion || 'PLANILLA PERSONAL OBRERO';

    const mesesOrdenados = Object.keys(resultadosPorMes).sort((a, b) => {
      const [mesA, añoA] = a.split('-');
      const [mesB, añoB] = b.split('-');
      if (añoA !== añoB) return parseInt(añoA) - parseInt(añoB);
      return parseInt(mesA) - parseInt(mesB);
    });

    let contadorMes = 1;

    for (const mesKey of mesesOrdenados) {
      const [mesNum, año] = mesKey.split('-');
      const registros = resultadosPorMes[mesKey];

      if (registros.length === 0) continue;

      // Agrupar por cargo y tipo
      const acumulado = new Map();

      registros.forEach(registro => {
        const key = `${registro.id_cargo}_${registro.tipo_cargo}`;

        if (!acumulado.has(key)) {
          acumulado.set(key, {
            id_cargo: registro.id_cargo,
            cargo: registro.descripcion_cargo,
            tipo_cargo: registro.tipo_cargo,
            cantidad_asignaciones: 0,
            monto_total: 0,
            tieneInvalido: false,
            estados: new Set(),
            asignaciones_contadas: new Set()
          });
        }

        const item = acumulado.get(key);

        const uniqueKey = `${registro.id_asignacion}_${mesKey}`;
        if (!item.asignaciones_contadas.has(uniqueKey)) {
          item.asignaciones_contadas.add(uniqueKey);
          item.cantidad_asignaciones += 1;
        }

        item.monto_total += registro.monto_calculado || 0;

        if (registro.tipo === 'IN' || registro.tipo === 'OBS') {
          item.tieneInvalido = true;
        }

        if (registro.estado_planilla) {
          item.estados.add(registro.estado_planilla);
        }
        if (registro.estado_pago !== undefined && registro.estado_pago !== null) {
          item.estado_pago = registro.estado_pago;
        }
      });

      const mesNombre = `${nombreMeses[mesNum]} ${año}`;
      const descripcionCompleta = `${descripcionBase} - ${mesNombre}`;

      filasReporte.push({
        item: `${contadorMes}`,
        descripcion: descripcionCompleta,
        und: '',
        cantidad: '',
        registro_planilla: '',
        pu: '',
        parcial: '',
        estado: '',
        es_cabecera: true,
        mes_key: mesKey,
        mes_nombre: mesNombre
      });

      let totalMes = 0;

      for (const [key, value] of acumulado) {
        totalMes += value.monto_total;

        let precioUnitario = 0;
        if (value.cantidad_asignaciones > 0) {
          precioUnitario = value.monto_total / value.cantidad_asignaciones;
        }

        let estadoCargo = '';
        if (value.tieneInvalido) {
          estadoCargo = 'INVALIDO';
        } else if (value.estados.has('PENDIENTE')) {
          estadoCargo = 'PENDIENTE';
        } else if (value.estados.has('APROBADO')) {
          estadoCargo = 'APROBADO';
        } else if (value.estados.has('PAGADO')) {
          estadoCargo = 'PAGADO';
        } else {
          estadoCargo = 'PENDIENTE';
        }

        // ✅ Aquí ya se incluyen id_cargo y tipo_cargo
        filasReporte.push({
          item: `MD-${String(filasReporte.length).padStart(2, '0')}`,
          descripcion: `${value.cargo} - TIPO ${this.convertirTipoCargo(value.tipo_cargo)}`,
          und: 'DH',
          cantidad: value.cantidad_asignaciones,
          registro_planilla: '',
          pu: ` ${precioUnitario.toFixed(2)}`,
          parcial: ` ${value.monto_total.toFixed(2)}`,
          estado: estadoCargo,
          es_cabecera: false,
          id_cargo: value.id_cargo,      // ✅ Ya está
          tipo_cargo: value.tipo_cargo,  // ✅ Ya está
          mes_key: mesKey
        });
      }

      contadorMes++;
      totalGeneral += totalMes;
    }

    // filasReporte.push({
    //   item: '',
    //   descripcion: '',
    //   und: '',
    //   cantidad: '',
    //   registro_planilla: '',
    //   pu: '',
    //   parcial: `${totalGeneral.toFixed(2)}`,
    //   estado: '',
    //   es_total: true
    // });

    return filasReporte;
  }

  private obtenerTipoInfo(tipoCodigo: string): { codigo: string, tipo: string, descuento: string } | null {
    const tipos = [
      { codigo: 'A', tipo: 'ASISTIO', descuento: "0" },
      { codigo: 'T', tipo: 'TARDANZA', descuento: "10" },
      { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA', descuento: "10" },
      { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA', descuento: "0" },
      { codigo: 'F', tipo: 'FALTA', descuento: "100" },
      { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA', descuento: "100" },
      { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA', descuento: "0" },
      { codigo: 'FM', tipo: 'DESCANSO MEDICO', descuento: "0" },
      { codigo: 'FV', tipo: 'VACACIONES', descuento: "0" },
      { codigo: 'FC', tipo: 'CITA MEDICA', descuento: "0" },
      { codigo: 'FD', tipo: 'DUELO', descuento: "0" },
      { codigo: 'PE', tipo: 'PERMISO', descuento: "0" },
      { codigo: 'OBS', tipo: 'OBSERVADO', descuento: "100" },
      { codigo: 'IN', tipo: 'INCOMPLETO', descuento: "100" },
      { codigo: 'TEX', tipo: 'TEXTRA', descuento: "0" }
    ];

    const encontrado = tipos.find(t => t.codigo === tipoCodigo);
    return encontrado || null;
  }

  private convertirTipoCargo(tipo: number): string {
    const tipos: { [key: number]: string } = {
      1: 'I',
      2: 'II',
      3: 'III',
      4: 'IV',
      5: 'V'
    };
    return tipos[tipo] || tipo.toString();
  }

  vincularReporteConRequerimientos() {
    console.log('=== INICIO vincularReporteConRequerimientos ===');

    if (!this.reporteEstructurado || this.reporteEstructurado.length === 0) {
      console.warn('reporteEstructurado está vacío, no se puede vincular');
      return;
    }

    // Inicializar los campos en cada fila de tablaRequerimientos
    this.tablaRequerimientos.forEach(req => {
      req.parcial_usado = 0;
      req.cantidad_usado = 0;
      req.precio_usado = 0;
      req.estado_global = 'PENDIENTE';
    });

    // Limpiar los campos en reporteEstructurado
    this.reporteEstructurado.forEach(fila => {
      if (!fila.es_cabecera && !fila.es_total) {
        fila.item_requerimiento = null;
        fila.tiene_relacion = false;
      }
    });

    const filaPrincipal = this.tablaRegActividades[this.filSelRegAct];

    if (!filaPrincipal) {
      console.warn('No hay fila principal seleccionada');
      return;
    }

    const relacionesFiltradas = this.requerimientosCargos.filter(relacion =>
      relacion.id_registro === filaPrincipal.id_registro &&
      String(relacion.idgrupo) === String(filaPrincipal.idgrupo)
    );

    const cargoToItemMap = new Map();

    relacionesFiltradas.forEach(relacion => {
      const cargosVinculados = relacion.cargos.split('|');

      const filaRequerimiento = this.tablaRequerimientos.find(req =>
        req.id_registro === relacion.id_registro &&
        String(req.idgrupo) === String(relacion.idgrupo) &&
        req.idfila === relacion.idfila_des &&
        req.indrep === relacion.indrep
      );

      if (filaRequerimiento) {
        const itemRequerimiento = `E-${filaRequerimiento.idfila}`;

        cargosVinculados.forEach(cargoStr => {
          const partes = cargoStr.split('-');
          const id_cargo = parseInt(partes[0]);
          const tipo_cargo = parseInt(partes[1]);
          const key = `${id_cargo}_${tipo_cargo}`;
          cargoToItemMap.set(key, itemRequerimiento);
        });
      }
    });

    this.reporteEstructurado.forEach(fila => {
      if (!fila.es_cabecera && !fila.es_total && fila.id_cargo !== undefined && fila.tipo_cargo !== undefined) {
        const key = `${fila.id_cargo}_${fila.tipo_cargo}`;
        if (cargoToItemMap.has(key)) {
          fila.tiene_relacion = true;
          fila.item_requerimiento = cargoToItemMap.get(key);
        } else {
          fila.tiene_relacion = false;
          fila.item_requerimiento = null;
        }
      }
    });

    // Acumular montos por requerimiento y calcular estado
    relacionesFiltradas.forEach(relacion => {
      const cargosVinculados = relacion.cargos.split('|');

      const filaRequerimiento = this.tablaRequerimientos.find(req =>
        req.id_registro === relacion.id_registro &&
        String(req.idgrupo) === String(relacion.idgrupo) &&
        req.idfila === relacion.idfila_des &&
        req.indrep === relacion.indrep
      );

      if (filaRequerimiento) {
        let totalParcial = 0;
        let totalCantidad = 0;

        // 🔥 Variables para calcular el estado - prioridad: ERROR > PENDIENTE > APROBADO > PAGADO
        let tieneError = false;
        let tienePendiente = false;
        let tieneAprobado = false;
        let tienePagado = false;

        cargosVinculados.forEach(cargoStr => {
          const partes = cargoStr.split('-');
          const id_cargo = parseInt(partes[0]);
          const tipo_cargo = parseInt(partes[1]);

          this.reporteEstructurado.forEach(fila => {
            if (!fila.es_cabecera && fila.id_cargo === id_cargo && fila.tipo_cargo === tipo_cargo && fila.tiene_relacion) {
              let parcial = fila.parcial;
              if (typeof parcial === 'string') {
                parcial = parseFloat(parcial.replace('S/', '').replace(' ', '').trim()) || 0;
              } else {
                parcial = parseFloat(parcial) || 0;
              }

              totalParcial += parcial;
              totalCantidad += fila.cantidad || 0;

              // 🔥 Evaluar estado - prioridad más baja (menos prioritaria) prevalece
              const estado = fila.estado_planilla || fila.estado;
              if (estado === 'INVALIDO' || fila.tipo === 'IN' || fila.tipo === 'OBS') {
                tieneError = true;
              } else if (estado === 'PENDIENTE') {
                tienePendiente = true;
              } else if (estado === 'APROBADO') {
                tieneAprobado = true;
              } else if (estado === 'PAGADO') {
                tienePagado = true;
              }
            }
          });
        });

        filaRequerimiento.parcial_usado = totalParcial;
        filaRequerimiento.cantidad_usado = totalCantidad;

        if (filaRequerimiento.cantidad_usado > 0) {
          filaRequerimiento.precio_usado = parseFloat((filaRequerimiento.parcial_usado / filaRequerimiento.cantidad_usado).toFixed(2));
        } else {
          filaRequerimiento.precio_usado = 0;
        }

        filaRequerimiento.saldo = (filaRequerimiento.parcial || 0) - totalParcial;

        // 🔥 Asignar estado_global según prioridad (el estado menos prioritario prevalece)
        // Orden de prioridad: ERROR > PENDIENTE > APROBADO > PAGADO
        if (tieneError) {
          filaRequerimiento.estado_global = 'ERROR';
        } else if (tienePendiente) {
          filaRequerimiento.estado_global = 'PENDIENTE';
        } else if (tieneAprobado) {
          filaRequerimiento.estado_global = 'APROBADO';
        } else if (tienePagado) {
          filaRequerimiento.estado_global = 'PAGADO';
        } else {
          filaRequerimiento.estado_global = 'PENDIENTE';
        }

        console.log(`Estado para ${filaRequerimiento.descripcion}: ${filaRequerimiento.estado_global}`);
      }
    });

    console.log('=== FIN vincularReporteConRequerimientos ===');
  }

  get reporteEstructuradoFiltrado() {
    // Si no hay fila seleccionada, mostrar todos
    if (this.filSelReq === null || this.filSelReq === undefined) {
      return this.reporteEstructurado;
    }

    // Obtener la fila seleccionada
    const filaSeleccionada = this.tablaRequerimientos[this.filSelReq];
    if (!filaSeleccionada) {
      return this.reporteEstructurado;
    }

    // 🔥 Si no hay relación, retornar array vacío
    if (!this.reqcargSeleccionado) {
      return [];
    }

    // Obtener los cargos vinculados de la relación
    const cargosVinculados = this.reqcargSeleccionado.cargos.split('|');

    // Crear un Set con los cargos vinculados
    const cargosSet = new Set();
    cargosVinculados.forEach(cargoStr => {
      const [id_cargo, tipo_cargo] = cargoStr.split('-').map(Number);
      cargosSet.add(`${id_cargo}_${tipo_cargo}`);
    });

    // Filtrar reporteEstructurado
    const resultado = [];
    const mesesConDetalle = new Set();

    // Primera pasada: identificar meses que tienen detalle filtrado
    for (const fila of this.reporteEstructurado) {
      if (!fila.es_cabecera && !fila.es_total) {
        const key = `${fila.id_cargo}_${fila.tipo_cargo}`;
        if (cargosSet.has(key)) {
          mesesConDetalle.add(fila.mes_key);
        }
      }
    }

    // Segunda pasada: construir resultado
    for (const fila of this.reporteEstructurado) {
      if (fila.es_total) {
        resultado.push(fila);
      } else if (fila.es_cabecera) {
        // Solo mostrar cabecera si hay detalle en ese mes
        if (mesesConDetalle.has(fila.mes_key)) {
          resultado.push(fila);
        }
      } else {
        const key = `${fila.id_cargo}_${fila.tipo_cargo}`;
        if (cargosSet.has(key)) {
          resultado.push(fila);
        }
      }
    }

    return resultado;
  }

  // async procesarAcumuladosPorFilaRegActividad() {
  //   for (let i = 0; i < this.tablaRegActividades.length; i++) {
  //     const filaRegAct = this.tablaRegActividades[i];

  //     // Filtrar requerimientos que pertenecen a esta fila
  //     const requerimientosFila = this.tablaRequerimientosCompleto.filter(req =>
  //       req.id_registro === filaRegAct.id_registro &&
  //       String(req.idgrupo) === String(filaRegAct.idgrupo)
  //     );

  //     // Calcular el total de parcial_usado sumando todos los requerimientos de esta fila
  //     let totalPresupuestoEjecutado = 0;

  //     for (const req of requerimientosFila) {
  //       // Buscar relación para este requerimiento
  //       const relacion = this.requerimientosCargos.find(rel =>
  //         rel.id_registro === req.id_registro &&
  //         String(rel.idgrupo) === String(req.idgrupo) &&
  //         rel.idfila_des === req.idfila &&
  //         rel.indrep === req.indrep
  //       );

  //       if (relacion) {
  //         // Calcular parcial_usado para este requerimiento
  //         const cargosVinculados = relacion.cargos.split('|');
  //         let totalParcial = 0;

  //         cargosVinculados.forEach(cargoStr => {
  //           const [id_cargo, tipo_cargo] = cargoStr.split('-').map(Number);

  //           // Buscar en reporteEstructurado (si ya existe)
  //           if (this.reporteEstructurado && this.reporteEstructurado.length > 0) {
  //             this.reporteEstructurado.forEach(fila => {
  //               if (!fila.es_cabecera && !fila.es_total &&
  //                 fila.id_cargo === id_cargo && fila.tipo_cargo === tipo_cargo) {
  //                 let parcial = fila.parcial;
  //                 if (typeof parcial === 'string') {
  //                   parcial = parseFloat(parcial.replace('S/', '').replace(' ', '').trim()) || 0;
  //                 } else {
  //                   parcial = parseFloat(parcial) || 0;
  //                 }
  //                 totalParcial += parcial;
  //               }
  //             });
  //           }
  //         });

  //         // Guardar en el requerimiento
  //         req.parcial_usado = totalParcial;
  //         totalPresupuestoEjecutado += totalParcial;
  //       } else {
  //         req.parcial_usado = 0;
  //       }
  //     }

  //     // Asignar valores a la fila de tablaRegActividades
  //     filaRegAct.presupuestoEjecutado = totalPresupuestoEjecutado;
  //     filaRegAct.saldo = (filaRegAct.reqsol || 0) - totalPresupuestoEjecutado;

  //     // Calcular porcentaje
  //     if (filaRegAct.reqsol && filaRegAct.reqsol !== 0) {
  //       filaRegAct.porcentaje = (filaRegAct.saldo / filaRegAct.reqsol) * 100;
  //     } else {
  //       filaRegAct.porcentaje = 0;
  //     }

  //     // Calcular estado de la fila basado en los requerimientos
  //     filaRegAct.estadoGlobal = this.calcularEstadoFilaRegActividad(requerimientosFila);
  //   }
  // }

  calcularEstadoFilaRegActividad(requerimientos: any[]): string {
    // Jerarquía: PAGADO > APROBADO > PENDIENTE > INVALIDO
    let tienePagado = false;
    let tieneAprobado = false;
    let tienePendiente = false;
    let tieneInvalido = false;

    for (const req of requerimientos) {
      if (req.estado === 2) { // CULMINADO
        tienePagado = true;
      } else if (req.estado === 1) { // EJECUCION
        tienePendiente = true;
      }

      // Verificar si tiene registros inválidos (IN u OBS)
      if (this.tieneRegistrosInvalidos(req)) {
        tieneInvalido = true;
      }
    }

    // Retornar según jerarquía
    if (tienePagado) return 'PAGADO';
    if (tieneAprobado) return 'APROBADO';
    if (tienePendiente) return 'PENDIENTE';
    if (tieneInvalido) return 'INVALIDO';
    return 'PENDIENTE';
  }

  tieneRegistrosInvalidos(req: any): boolean {
    // Buscar si en reporteEstructurado hay registros IN u OBS para los cargos relacionados
    const relacion = this.requerimientosCargos.find(rel =>
      rel.id_registro === req.id_registro &&
      String(rel.idgrupo) === String(req.idgrupo) &&
      rel.idfila_des === req.idfila &&
      rel.indrep === req.indrep
    );

    if (!relacion || !this.reporteEstructurado) return false;

    const cargosVinculados = relacion.cargos.split('|');

    for (const cargoStr of cargosVinculados) {
      const [id_cargo, tipo_cargo] = cargoStr.split('-').map(Number);

      const tieneInvalido = this.reporteEstructurado.some(fila =>
        !fila.es_cabecera && !fila.es_total &&
        fila.id_cargo === id_cargo && fila.tipo_cargo === tipo_cargo &&
        (fila.estado === 'INVALIDO' || fila.tipo === 'IN' || fila.tipo === 'OBS')
      );

      if (tieneInvalido) return true;
    }

    return false;
  }

  async procesarAcumuladosRegActividades() {
    if (!this.tablaRegActividades || this.tablaRegActividades.length === 0) return;
    if (!this.reporteEstructurado || this.reporteEstructurado.length === 0) return;
    if (!this.requerimientosCargos || this.requerimientosCargos.length === 0) return;

    // Crear un mapa de acumulados por cargo desde reporteEstructurado
    const acumuladoPorCargo = new Map();

    this.reporteEstructurado.forEach(fila => {
      if (!fila.es_cabecera && !fila.es_total && fila.id_cargo && fila.tipo_cargo) {
        const key = `${fila.id_cargo}_${fila.tipo_cargo}`;
        let parcial = fila.parcial;
        if (typeof parcial === 'string') {
          parcial = parseFloat(parcial.replace('S/', '').replace(' ', '').trim()) || 0;
        } else {
          parcial = parseFloat(parcial) || 0;
        }

        if (!acumuladoPorCargo.has(key)) {
          acumuladoPorCargo.set(key, 0);
        }
        acumuladoPorCargo.set(key, acumuladoPorCargo.get(key) + parcial);
      }
    });

    // Procesar cada fila de tablaRegActividades
    for (const row of this.tablaRegActividades) {
      // Filtrar requerimientos que pertenecen a esta fila desde tablaRequerimientosCompleto
      const requerimientosFila = this.tablaRequerimientosCompleto.filter(req =>
        req.id_registro === row.id_registro &&
        String(req.idgrupo) === String(row.idgrupo)
      );

      let totalPresupuestoEjecutado = 0;

      // Para cada requerimiento, buscar su relación y sumar los cargos
      for (const req of requerimientosFila) {
        // Buscar la relación que corresponde a este requerimiento
        const relacion = this.requerimientosCargos.find(rel =>
          rel.id_registro === req.id_registro &&
          String(rel.idgrupo) === String(req.idgrupo) &&
          rel.idfila_des === req.idfila &&
          rel.indrep === req.indrep
        );

        if (relacion && relacion.cargos) {
          const cargos = relacion.cargos.split('|');
          for (const cargoStr of cargos) {
            const [id_cargo, tipo_cargo] = cargoStr.split('-').map(Number);
            const key = `${id_cargo}_${tipo_cargo}`;
            totalPresupuestoEjecutado += acumuladoPorCargo.get(key) || 0;
          }
        }
      }

      // Asignar valores a la fila
      row.presupuestoEjecutado = totalPresupuestoEjecutado;
      row.saldo = (row.reqsol || 0) - totalPresupuestoEjecutado;

      // Calcular porcentaje
      if (row.reqsol && row.reqsol !== 0) {
        row.porcentaje = (row.saldo / row.reqsol) * 100;
      } else {
        row.porcentaje = 0;
      }
    }

    console.log('tablaRegActividades actualizada:', this.tablaRegActividades);
  }

  calcularEstadoRequerimiento(filaRequerimiento: any): string {
    // Buscar la relación para este requerimiento
    const adqui = this.tablaRegActividades[this.filSelRegAct];
    const relacion = this.requerimientosCargos.find(ele =>
      ele.idfila_req == adqui?.idfila &&
      ele.idfila_des == filaRequerimiento.idfila &&
      ele.idgrupo == filaRequerimiento.idgrupo &&
      ele.indrep == filaRequerimiento.indrep
    );

    if (!relacion || !relacion.cargos) {
      return 'PENDIENTE';
    }

    const cargosVinculados = relacion.cargos.split('|');

    // Jerarquía: PAGADO > APROBADO > PENDIENTE > INVALIDO
    let tienePagado = false;
    let tieneAprobado = false;
    let tienePendiente = false;
    let tieneInvalido = false;

    for (const cargoStr of cargosVinculados) {
      const [id_cargo, tipo_cargo] = cargoStr.split('-').map(Number);

      // Buscar en reporteEstructurado todas las filas de este cargo
      const cargosEnReporte = this.reporteEstructurado.filter(fila =>
        !fila.es_cabecera && !fila.es_total &&
        fila.id_cargo === id_cargo &&
        fila.tipo_cargo === tipo_cargo
      );

      for (const cargo of cargosEnReporte) {
        const estado = cargo.estado_planilla || cargo.estado;

        if (estado === 'INVALIDO' || cargo.tipo === 'IN' || cargo.tipo === 'OBS') {
          tieneInvalido = true;
        } else if (estado === 'PAGADO') {
          tienePagado = true;
        } else if (estado === 'APROBADO') {
          tieneAprobado = true;
        } else if (estado === 'PENDIENTE') {
          tienePendiente = true;
        }
      }
    }

    // Retornar según jerarquía
    if (tienePagado) return 'PAGADO';
    if (tieneAprobado) return 'APROBADO';
    if (tienePendiente) return 'PENDIENTE';
    if (tieneInvalido) return 'INVALIDO';

    return 'PENDIENTE';
  }

}



