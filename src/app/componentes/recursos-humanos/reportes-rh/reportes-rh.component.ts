import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { ProcesosRhService } from 'src/app/servicios/procesos-rh.service';
import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
interface DataHeader {
  nombre: string;
  cantidad: number;
  width: number | null;
}

interface Partida {
  descripcion: string;
  item: string;
  unidad: string;
  inicio: string;
  fin: string;
  [key: string]: any;
}

interface Insumo {
  descripcion: string;
  id_tipo_insumo: number | string;
  partidas: Partida[];
  [key: string]: any;
}

interface RangoFecha {
  inicio: Date;
  fin: Date;
}

interface RangoDia {
  inicio: number;
  fin: number;
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

interface DetalleDia {
  fecha: string;
  total_monto: number;
  detalle: {
    id_asignacion: number;
    monto: number;
    origen: 'PLANILLA_APROBADA' | 'ASISTENCIA';
    tipo?: string; // Tipo de asistencia (A, T, F, etc.)
    descripcion?: string; // Descripción del cargo/área
  }[];
}

export interface filaProgramacion {
  descripcion?: string;
  fechafin: string;
  fechaini: string;
  referencia: string;
  referenciados: any;
  restriccion: any;
  restriccion2: any;
  condini: any;
  condfin: any;
  parcial?: any;
  hijos: any;
  hijos_uid: any;
  detalle_partida?: any;
  predecesor: boolean;
  nroclick: number;
  editarRest: boolean;
  editarCua?: boolean;
  editarDur: boolean;
  editarFF?: boolean;
  editarFI: boolean;
  editarPred: boolean;
  editarDescrip: boolean;
  indice_ref_hito: any;
  fechafinBD?: boolean;
  fechainiBD?: boolean;
  idgantt: number;
  filaEditada: boolean;
  cuadrillaMO?: any;
  cuadrillaEQ?: any;
  cuadrillaMO1?: any;
  cuadrillaEQ1?: any;
  diasHabilesValido: boolean;
  duracion: number;
  unidad?: string;
  cuadrilla: number;
  metrado: number;
  rendimiento: number;
  tiempoUnitario: number;
  duraciontot: number;
  duracionreq: number;
  icomost?: number;
  id_proyecto?: number;
  id_unidad?: any;
  id_usuario?: any;
  ind: number;
  ind2: number;
  indice: number;
  item?: string;
  mostrar?: number;
  nivel?: number;
  uid: number;
}

interface IAgrupamiento {
  id_agrupamiento: number;
  id_elemento: number | null;
  id_proyecto: number;
  descripcion: string;
  indice: number | null;
  orden: number;
  abreviatura: string;
  descripcion_costo: string;
  id_indice: number | null;
  monto_presupuesto: number;
  dias_pres: number,
  pres_asignado: number,
  dias_eje: number,
  ejecucion_presu: number,
  variacion_presu: number,
  variacion_plazo: number,
  porcentaje: number,
  mostrar: number;
  icomost: number;
  estado: number | null;
  abrev: string,
  porcentajeTot: number
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
@Component({
  selector: 'app-reportes-rh',
  templateUrl: './reportes-rh.component.html',
  styleUrls: ['./reportes-rh.component.scss']
})
export class ReportesRhComponent implements OnInit {
  idProyecto = null
  @ViewChild("modalAgregarElemento") modalAgregarElemento: ModalBasicComponent;
  @ViewChild("modalActualizarAgrupado") modalActualizarAgrupado: ModalBasicComponent;
  @ViewChild("modalAgregarAgrupados") modalAgregarAgrupados: ModalBasicComponent;
  @ViewChild("modalRHMensual") modalRHMensual: ModalBasicComponent;
  calendarioCompleto: any;
  @Input() set tabproyecto(value: any) {
    this.idProyecto = value.get('id_proyecto').value;
  }
  subvista = 1
  listaRegistros = []
  id_registro = null
  mostrar_carga_todo = false
  private montosAreasCache: any[] = [];
  private horariosFeriadosCache: any = null;
  private procesadosPlanilla = new Set();
  reporteMensual = []
  detallePorDia = []

  tablaDesembolso = []
  totalesDesembolso = []
  sumaTotalParciales = null
  dec_parcial = 2
  dec_cant = 2
  listaInsumos = []
  dataPrincipal = []
  versions = []
  version = null
  uidsOrdenados: any[] = [];
  tablaIdGantt: filaProgramacion[] = [];
  ultimoidGantt = null;
  aspectosdias: any;
  tablaferiados = [];
  arrayDiasNoLabEdit = [];
  id_usuario = null
  plazoHabil: number = 0;
  noLaborables = [];
  dataProyecto = null;
  ffProyecto: any;
  fiProyecto: string;
  FFRestriccion: string;
  moneda
  fechaIniGrafico: string;
  fechaFinalGrafico: string = '';
  ffLimite: any;
  fiLimite: any;
  dataHeader: any = [];
  mesesHeader = [];
  yearsHeader = [];
  arrayMeses: string[] = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Setiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  fechaMaxIngr = '';
  arrayDiasSemana = [
    'LUNES',
    'MARTES',
    'MIÉRCOLES',
    'JUEVES',
    'VIERNES',
    'SÁBADO',
    'DOMINGO',
  ];
  porcentajesDesembolso: any[] = [];
  mesesMostrar: any[] = [];
  nroMeses: any[];
  totalColumna: any = null;
  calendarioMateriales: any[] = [];
  totalesMateriales: any[] = [];
  totalParcialesCalMat = null;
  totColRedMat = [];
  porcTotMat: any[];
  totalPorcMat: string = '';
  tablaMatDesac = false;

  tablaPresInd = []
  tablaAgrupamientos: IAgrupamiento[] = []
  filSel = null

  meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  anios = []
  costosFiltrados = []

  tablaFiltrada = []
  totalMes = 0
  mostrarSelColum = true
  calendarioFiltrado = []
  calendario = []
  areas = []
  cargos = []
  asignaciones = []
  ocultarSinAsistencia = false
  abreviaturas: Record<string, string> = {
    Lunes: "Lu",
    Martes: "Ma",
    Miércoles: "Mi",
    Jueves: "Ju",
    Viernes: "Vi",
    Sábado: "Sa",
    Domingo: "Do"
  };
  fechaMinima = null
  fechaMaxima = null
  cantidadUsuariosDia: number[] = [];
  mesSeleccionado = 0
  mesesAcum = []
  areasAcum = []
  cargosAcum = []
  consolidado = []
  mesSelAcum = null
  areaSelAcum = null
  cargoSelAcum = null
  tablaAcumFiltrada = []
  totalesAcumulados = {}
  calendarioFiltrado2
  dataCalendMat = null
  id_reg = null

  formElementos = new UntypedFormGroup({
    anio: new UntypedFormControl('', [Validators.required]),
    mes: new UntypedFormControl('', [Validators.required])
  })

  get anio(): UntypedFormControl { return this.formElementos.get('anio') as UntypedFormControl }
  get mes(): UntypedFormControl { return this.formElementos.get('mes') as UntypedFormControl }

  formAgrupacion = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    indice: new UntypedFormControl('', [Validators.required]),
    orden: new UntypedFormControl('', []),
    estado: new UntypedFormControl(false, []),
    id_agrupamiento: new UntypedFormControl('', [])
  })
  get descripcion(): UntypedFormControl { return this.formAgrupacion.get('descripcion') as UntypedFormControl }
  get indice(): UntypedFormControl { return this.formAgrupacion.get('indice') as UntypedFormControl }
  get orden(): UntypedFormControl { return this.formAgrupacion.get('orden') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formAgrupacion.get('estado') as UntypedFormControl }
  get id_agrupamiento(): UntypedFormControl { return this.formAgrupacion.get('id_agrupamiento') as UntypedFormControl }
  constructor(private cdRef: ChangeDetectorRef, private toaster: ToastrService, private presuservice: PresupuestosService, private principalService: PrincipalService, private _EncriptadorService: EncriptadorService, private _logisticaService: LogisticaService, private recursosHumanosService: RecursosHumanosService, private procesosRhService: ProcesosRhService, public formsService: FormsService) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      this.id_usuario = this._EncriptadorService.recuperarlocalstory('idusuario');
      await this.cargarInfoRH()
      await this.cargarProgramacion()
      await this.estructurarTabla()
      this.mostrar_carga_todo = false
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async cargarProgramacion() {
    await this.recuperarDatosProyecto(this.idProyecto)
    await this.listarVersiones()
    await this.cargarDatos();
    await this.listaFeriados();
    await this.listarProgramacion()
    const feriados = await this.fechasLimitesGraficos(this.dataPrincipal);
    await this.recuperarCalendario(this.fechaIniGrafico, this.fechaFinalGrafico)
    let formattedDate = moment(this.fechaIniGrafico).format('YYYY-MM-DD');
    let inicio = new Date(formattedDate + 'T00:00:00');

    let formattedDate2 = moment(this.fechaFinalGrafico).format('YYYY-MM-DD');
    let fin = new Date(formattedDate2 + 'T00:00:00');

    let fiLimite = null;
    let ffLimite = null;

    fiLimite = moment(inicio).subtract(6, 'days');
    ffLimite = moment(fin).add(15, 'days');
    this.fiLimite = moment(fiLimite).format('YYYY-MM-DD');
    this.ffLimite = moment(ffLimite).format('YYYY-MM-DD');
    await this.generarTablaDesembolso();

    // Esta ya la tienes, solo asegúrate de tener la versión actualizada que filtra por "total"
    this.dataCalendMat = await this.generarCalendarioMaterialesPorTipo('MANO DE OBRA');
  }

  async fechasLimitesGraficos(tablagantt) {
    let mayor = null;
    let menor = null;
    await tablagantt.map((ele) => {
      if (ele.unidad || ele.duracion == 0) {
        if (mayor == null) {
          mayor = ele.fechafin;
        } else {
          if (mayor < ele.fechafin) {
            mayor = ele.fechafin;
          }
        }
        if (menor == null) {
          menor = ele.fechaini;
        } else {
          if (menor > ele.fechaini) {
            menor = ele.fechaini;
          }
        }
      }
    });
    let fechaIniGrafico = null;
    let fechaFinalGrafico = null;
    if (this.dataProyecto.fecha_inicio < menor) {
      fechaIniGrafico = this.dataProyecto.fecha_inicio;
    } else {
      fechaIniGrafico = menor;
    }
    if (this.dataProyecto.fecha_culmina > mayor) {
      fechaFinalGrafico = this.dataProyecto.fecha_culmina;
    } else {
      fechaFinalGrafico = mayor;
    }

    if (fechaIniGrafico == null) {
      fechaIniGrafico = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');

    }
    if (fechaFinalGrafico == null) {
      fechaFinalGrafico = moment(this.dataProyecto.fecha_culmina).format('YYYY-MM-DD');
    }
    this.fechaIniGrafico = JSON.parse(JSON.stringify(fechaIniGrafico));
    this.fechaFinalGrafico = JSON.parse(JSON.stringify(fechaFinalGrafico));

    fechaFinalGrafico = moment(fechaFinalGrafico)
      .add(15, 'days')
      .format('YYYY-MM-DD');
    let fechaInicio = moment(fechaIniGrafico)
      .subtract(7, 'days')
      .format('YYYY-MM-DD');
    let feriados = [];
    while (fechaInicio <= fechaFinalGrafico) {
      const nombreDia = moment.weekdays(moment(fechaInicio).day());
      if (this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())) {
        const obj = {
          fecha: fechaInicio,
          lolabor: 1,
          feriado: 0,
        };
        feriados.push(obj);
      } else {
        const existe = this.tablaferiados.find(
          (ele) => moment(ele.fecha).format('YYYY-MM-DD') == fechaInicio
        );
        if (existe) {
          const obj = {
            fecha: fechaInicio,
            lolabor: 0,
            feriado: 1,
          };
          feriados.push(obj);
        }
      }
      fechaInicio = moment(fechaInicio).add(1, 'days').format('YYYY-MM-DD');
    }
    return feriados;
  }

  async cargarInfoRH() {
    // Obtener calendario
    const calendario = await this.procesosRhService.calendarioXAsignaciones(this.idProyecto);
    const data = await this.procesosRhService.listarInformacionRHPlanilla(this.idProyecto)

    // Cargar datos auxiliares (una sola vez)
    await this.cargarDatosAuxiliares();

    // Generar reporte con detalle
    const { resumenMensual, detallePorDia } = await this.generarReporteMensualConDetalle(data, calendario);

    // Guardar en variables para mostrar en la vista
    this.reporteMensual = resumenMensual;
    this.detallePorDia = detallePorDia;
  }

  async cargarDatosAuxiliares() {
    // Cargar montos por área
    this.montosAreasCache = await this.listarMontosAreaPresAnaliticoRH();

    // Cargar horarios y feriados
    const obj = { id_proyecto: this.idProyecto, id_area: 0 };
    this.horariosFeriadosCache = await this.recursosHumanosService.listarHorarioYFeriadosArea(obj);
  }

  cambioVista(vista) {
    this.subvista = vista
    this.mostrar_carga_todo = true
  }


  async generarReporteMensual(data: any, calendario: any): Promise<any[]> {
    // Mapa para almacenar qué asignaciones ya fueron procesadas por planilla en cada fecha
    const fechasProcesadasPorAsignacion = new Set<string>();

    // Mapa para acumular monto total por día (de todas las asignaciones)
    const montoPorDia = new Map<string, number>();

    // 1. PROCESAR PLANILLAS APROBADAS (Prioridad)
    for (const planilla of data.planilla_aprobada || []) {
      const diasStr = planilla.dias;
      const diasArray = diasStr.split('/');

      for (const diaStr of diasArray) {
        if (!diaStr) continue;
        const partes = diaStr.split('|');
        if (partes.length >= 6) {
          const fecha = partes[0]; // Formato: DD-MM-YYYY
          const tipo = partes[5]; // Tipo de asistencia

          // Solo si hay registro (tipo no vacío)
          if (tipo && tipo.trim() !== '') {
            const monto = (parseFloat(partes[3]) || 0) + (parseFloat(partes[4]) || 0);
            const key = `${planilla.id_asignacion}_${fecha}`;

            // Marcar esta asignación como procesada para esta fecha
            fechasProcesadasPorAsignacion.add(key);

            // Acumular monto por día
            const montoActual = montoPorDia.get(fecha) || 0;
            montoPorDia.set(fecha, montoActual + monto);
          }
        }
      }
    }

    // 2. PROCESAR ASISTENCIAS (solo asignaciones que NO tienen planilla aprobada para esa fecha)
    for (const asistencia of data.asistencia || []) {
      const fecha = moment(asistencia.fecha).format('DD-MM-YYYY');
      const key = `${asistencia.id_asignacion}_${fecha}`;

      // Solo procesar si esta asignación no tiene planilla aprobada para esta fecha
      if (!fechasProcesadasPorAsignacion.has(key)) {
        // Calcular monto usando la misma lógica de generarPlanillaProyecto
        const monto = await this.calcularMontoAsistencia(asistencia);

        if (monto > 0) {
          const montoActual = montoPorDia.get(fecha) || 0;
          montoPorDia.set(fecha, montoActual + monto);
        }
      }
    }

    // 3. GENERAR REPORTE POR MES usando el calendario
    const mesesMap: { [key: string]: string } = {
      'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
      'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
      'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
    };

    const resultado: any[] = [];

    for (const anioObj of calendario.calendario) {
      for (const mesObj of anioObj.meses) {
        const mesNumero = mesesMap[mesObj.mes];
        const mesKey = `${mesNumero}-${mesObj.anio}`;

        let totalMontoMes = 0;
        let diasConRegistro = 0;

        // Recorrer cada día del mes
        for (const dia of mesObj.dias) {
          const fechaDia = dia.fecha;
          const montoDia = montoPorDia.get(fechaDia) || 0;

          if (montoDia > 0) {
            totalMontoMes += montoDia;
            diasConRegistro++;
          }
        }

        resultado.push({
          mes: mesKey,
          nombre_mes: mesObj.mes,
          anio: mesObj.anio,
          cantidad_dias: diasConRegistro,
          total_monto: totalMontoMes
        });
      }
    }

    // Ordenar por fecha
    return resultado.sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      const mesA = parseInt(a.mes.split('-')[0]);
      const mesB = parseInt(b.mes.split('-')[0]);
      return mesA - mesB;
    });
  }

  // // Método para calcular el monto de una asistencia (copiado de tu generarPlanillaProyecto)
  // private async calcularMontoAsistencia(asistencia: any): Promise<number> {
  //   // Obtener horario del área
  //   let dataHorario = this.horariosFeriadosCache?.[0]?.find(ele => ele.id_area == asistencia.id_area);
  //   if (!dataHorario) {
  //     dataHorario = {
  //       id_configuracion: null,
  //       id_proyecto: asistencia.id_proyecto,
  //       id_area: asistencia.id_area,
  //       inicio_semana: 'LUNES',
  //       dias_nolaborables: 'DOMINGO',
  //       hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
  //       hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
  //       hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
  //       hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
  //       totales_dia: 48,
  //       descuentos: '0|10|10|0|100|100|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
  //       tardanza: 10,
  //       tiempo_extra: 0
  //     };
  //   }

  //   const diasNoLaborables = dataHorario?.dias_nolaborables?.split('|') || [];
  //   const feriadosSoloFecha = this.horariosFeriadosCache?.[1]?.filter(ele => {
  //     const areas = ele.areas?.split('|');
  //     return areas && areas.includes(asistencia.id_area.toString());
  //   }).map(ele => ele.fecha.split('T')[0]) || [];

  //   // Obtener coste por día
  //   const costesCargoDia = this.montosAreasCache.find(ele =>
  //     ele.id_area == asistencia.id_area &&
  //     ele.tipo == ('JORNAL CATEGORIA ' + asistencia.tipo_cargo)
  //   )?.cargos.find(ele => ele.id_cargo == asistencia.id_cargo);

  //   let costeDia = costesCargoDia ? costesCargoDia.parcial : 0;

  //   const fechaMoment = moment(asistencia.fecha);
  //   const diaSemana = this.getDiaSemanaEspanol(fechaMoment);
  //   const fechaKey = fechaMoment.format('YYYY-MM-DD');

  //   const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
  //   const esFeriado = feriadosSoloFecha.includes(fechaKey);
  //   const esDiaEspecial = false;
  //   const tipoCodigo = asistencia.tipo || '';
  //   const tipoInfo = this.obtenerTipoInfo(tipoCodigo);

  //   let montoDia = 0;

  //   if (!esDiaEspecial) {
  //     if (tipoInfo && tipoInfo.descuento && tipoInfo.descuento !== "") {
  //       const porcentajeDescuento = parseInt(tipoInfo.descuento) || 0;
  //       const descuentoMonto = costeDia * (porcentajeDescuento / 100);
  //       montoDia = costeDia - descuentoMonto;
  //     } else if (tipoCodigo === 'A' || tipoCodigo === 'TEX') {
  //       montoDia = costeDia;
  //     } else if (!tipoCodigo || tipoCodigo === '') {
  //       montoDia = 0;
  //     } else {
  //       montoDia = 0;
  //     }
  //   } else {
  //     montoDia = 0;
  //   }

  //   const horasExtra = asistencia.horas_extra || 0;
  //   const montoExtra = asistencia.monto_extra || 0;

  //   return montoDia + montoExtra;
  // }

  private async calcularMontoAsistencia(asistencia: any): Promise<number> {
    // Obtener horario del área
    let dataHorario = this.horariosFeriadosCache?.[0]?.find(ele => ele.id_area == asistencia.id_area);
    if (!dataHorario) {
      dataHorario = {
        id_configuracion: null,
        id_proyecto: asistencia.id_proyecto,
        id_area: asistencia.id_area,
        inicio_semana: 'LUNES',
        dias_nolaborables: 'DOMINGO',
        hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
        hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
        hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
        hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
        totales_dia: 48,
        descuentos: "0|10|10|0|100|100|0|0|0|0|0|0|0|100|100|0|0|0|0|0|0",
        tardanza: 10,
        tiempo_extra: 0
      };
    }
    const diasNoLaborables = dataHorario?.dias_nolaborables?.split('|') || [];
    const feriadosSoloFecha = this.horariosFeriadosCache?.[1]?.filter(ele => {
      const areas = ele.areas?.split('|');
      return areas && areas.includes(asistencia.id_area.toString());
    }).map(ele => ele.fecha.split('T')[0]) || [];

    // Obtener coste por día
    const costesCargoDia = this.montosAreasCache.find(ele =>
      ele.id_area == asistencia.id_area &&
      ele.tipo == ('JORNAL CATEGORIA ' + asistencia.tipo_cargo)
    )?.cargos.find(ele => ele.id_cargo == asistencia.id_cargo);

    let costeDia = costesCargoDia ? costesCargoDia.parcial : 0;

    const fechaMoment = moment(asistencia.fecha);
    const diaSemana = this.getDiaSemanaEspanol(fechaMoment);
    const fechaKey = fechaMoment.format('YYYY-MM-DD');

    const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
    const esFeriado = feriadosSoloFecha.includes(fechaKey);
    // const esDiaEspecial = esDiaNoLaborable || esFeriado; 
    const esDiaEspecial = false
    const tipoCodigo = asistencia.tipo || '';
    const tipoInfo = this.obtenerTipoInfoConDescuentos(tipoCodigo, dataHorario.descuentos);
    let montoDia = 0;

    if (!esDiaEspecial) {
      if (tipoInfo && tipoInfo.valor !== undefined && tipoInfo.tipoValor) {
        const porcentaje = parseInt(tipoInfo.valor) || 0;

        if (tipoInfo.tipoValor === 'descuento') {
          // Descuento: resta del costo del día
          if (porcentaje > 0) {
            const descuentoMonto = costeDia * (porcentaje / 100);
            montoDia = costeDia - descuentoMonto;
          } else {
            montoDia = costeDia;
          }
        } else if (tipoInfo.tipoValor === 'bonificacion') {
          // Bonificación: suma al costo del día
          if (porcentaje > 0) {
            const bonificacionMonto = costeDia * (porcentaje / 100);
            montoDia = costeDia + bonificacionMonto;
          } else {
            montoDia = costeDia;
          }
        } else {
          montoDia = costeDia;
        }
      } else if (tipoCodigo === 'A' || tipoCodigo === 'TEX') {
        montoDia = costeDia;
      } else if (!tipoCodigo || tipoCodigo === '') {
        montoDia = 0;
      } else {
        montoDia = 0;
      }
    } else {
      // Días especiales (no laborables o feriados)
      // Aquí puedes definir si se paga o no
      montoDia = 0; // O costeDia si se paga igual
    }

    const horasExtra = asistencia.horas_extra || 0;
    const montoExtra = asistencia.monto_extra || 0;

    return montoDia + montoExtra;
  }

  private obtenerTipoInfoConDescuentos(tipoCodigo: string, descuentosString: string): any {
    // Definir los tipos en orden (debe coincidir con el orden de la cadena de descuentos)
    const tipos = [
      { codigo: 'A', tipo: 'ASISTIO', tipoValor: 'descuento' },
      { codigo: 'T', tipo: 'TARDANZA', tipoValor: 'descuento' },
      { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA', tipoValor: 'descuento' },
      { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA', tipoValor: 'descuento' },
      { codigo: 'F', tipo: 'FALTA', tipoValor: 'descuento' },
      { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA', tipoValor: 'descuento' },
      { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA', tipoValor: 'descuento' },
      { codigo: 'FM', tipo: 'DESCANSO MEDICO', tipoValor: 'descuento' },
      { codigo: 'FV', tipo: 'VACACIONES', tipoValor: 'descuento' },
      { codigo: 'PE', tipo: 'PERMISO', tipoValor: 'descuento' },        // ← Cambió: ahora índice 9
      { codigo: 'D1', tipo: 'DESCUENTO OPCIONAL 1', tipoValor: 'descuento' }, // índice 10
      { codigo: 'D2', tipo: 'DESCUENTO OPCIONAL 2', tipoValor: 'descuento' }, // índice 11
      { codigo: 'D3', tipo: 'DESCUENTO OPCIONAL 3', tipoValor: 'descuento' }, // índice 12
      { codigo: 'OBS', tipo: 'OBSERVADO', tipoValor: 'descuento' },      // índice 13
      { codigo: 'IN', tipo: 'INCOMPLETO', tipoValor: 'descuento' },      // índice 14
      { codigo: 'TEX', tipo: 'TEXTRA', tipoValor: 'descuento' },         // índice 15
      { codigo: 'BN', tipo: 'BONO NO LABORABLE', tipoValor: 'bonificacion' }, // índice 16
      { codigo: 'BF', tipo: 'BONO FERIADO', tipoValor: 'bonificacion' },      // índice 17
      { codigo: 'B1', tipo: 'BONO OPCIONAL 1', tipoValor: 'bonificacion' },   // índice 18
      { codigo: 'B2', tipo: 'BONO OPCIONAL 2', tipoValor: 'bonificacion' },   // índice 19
      { codigo: 'B3', tipo: 'BONO OPCIONAL 3', tipoValor: 'bonificacion' }    // índice 20
    ];

    // Dividir la cadena de descuentos
    const valoresDescuento = descuentosString?.split('|') || [];

    // Encontrar el índice del tipo
    const index = tipos.findIndex(t => t.codigo === tipoCodigo);

    if (index !== -1 && index < valoresDescuento.length) {
      const tipoBase = tipos[index];
      return {
        ...tipoBase,
        valor: valoresDescuento[index] || "0"
      };
    }

    // Si no se encuentra, retornar un objeto por defecto
    return {
      codigo: tipoCodigo,
      tipo: 'DESCONOCIDO',
      tipoValor: 'descuento',
      valor: '0'
    };
  }

  private getDiaSemanaEspanol(fecha: moment.Moment): string {
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

  // private obtenerTipoInfo(tipoCodigo: string): { codigo: string, tipo: string, descuento: string } | null {
  //   const tipos = [
  //     { codigo: 'A', tipo: 'ASISTIO', descuento: "0" },
  //     { codigo: 'T', tipo: 'TARDANZA', descuento: "10" },
  //     { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA', descuento: "10" },
  //     { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA', descuento: "0" },
  //     { codigo: 'F', tipo: 'FALTA', descuento: "100" },
  //     { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA', descuento: "100" },
  //     { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA', descuento: "0" },
  //     { codigo: 'FM', tipo: 'DESCANSO MEDICO', descuento: "0" },
  //     { codigo: 'FV', tipo: 'VACACIONES', descuento: "0" },
  //     { codigo: 'FC', tipo: 'CITA MEDICA', descuento: "0" },
  //     { codigo: 'FD', tipo: 'DUELO', descuento: "0" },
  //     { codigo: 'PE', tipo: 'PERMISO', descuento: "0" },
  //     { codigo: 'D1', tipo: 'DESCUENTO OPCIONAL 1', descuento: "0" },
  //     { codigo: 'D2', tipo: 'DESCUENTO OPCIONAL 2', descuento: "0" },
  //     { codigo: 'D3', tipo: 'DESCUENTO OPCIONAL 3', descuento: "0" },
  //     { codigo: 'OBS', tipo: 'OBSERVADO', descuento: "100" },
  //     { codigo: 'IN', tipo: 'INCOMPLETO', descuento: "100" },
  //     { codigo: 'TEX', tipo: 'TEXTRA', descuento: "0" },
  //     { codigo: 'BN', tipo: 'BONO NO LABORABLE', descuento: "0" },
  //     { codigo: 'BF', tipo: 'BONO FERIADO', descuento: "0" },
  //     { codigo: 'B1', tipo: 'BONO OPCIONAL 1', descuento: "0" },
  //     { codigo: 'B2', tipo: 'BONO OPCIONAL 2', descuento: "0" },
  //     { codigo: 'B3', tipo: 'BONO OPCIONAL 3', descuento: "0" }
  //   ];
  //   return tipos.find(t => t.codigo === tipoCodigo) || null;
  // }

  async listarMontosAreaPresAnaliticoRH() {
    let montos = []
    const obj = { id_proyecto: this.idProyecto }
    const resp = await this.recursosHumanosService.listarMontosAreaPresAnaliticoRH(obj)
    if (resp.length) {
      const toNumberOrNull = (value: string): number | null => {
        if (!value || value.trim() === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };
      for (const element of resp) {
        const cargos = [];
        if (element.cargos && typeof element.cargos === 'string') {
          const cargosStrings = element.cargos.split('|');
          for (const cargoStr of cargosStrings) {
            const partes = cargoStr.split('/');
            const cargo = {
              id_cargo: toNumberOrNull(partes[0]),
              porcentaje: toNumberOrNull(partes[1]),
              parcial: toNumberOrNull(partes[2])
            };
            if (cargo.id_cargo !== null) cargos.push(cargo);
          }
        }
        montos.push({
          id_area: element.id_area,
          cargos: cargos,
          tipo: element.descripcion,
          horas_dia: element.formula
        });
      }
    }
    return montos
  }


  async generarReporteMensualConDetalle(data: any, calendario: any): Promise<{
    resumenMensual: any[];
    detallePorDia: DetalleDia[];
  }> {
    // Mapa para almacenar qué asignaciones ya fueron procesadas por planilla en cada fecha
    const fechasProcesadasPorAsignacion = new Set<string>();

    // Mapa para almacenar el detalle completo por día
    const detallePorDiaMap = new Map<string, DetalleDia>();

    // 1. PROCESAR PLANILLAS APROBADAS (Prioridad)
    for (const planilla of data.planilla_aprobada || []) {
      const diasStr = planilla.dias;
      const diasArray = diasStr.split('/');

      for (const diaStr of diasArray) {
        if (!diaStr) continue;
        const partes = diaStr.split('|');
        if (partes.length >= 6) {
          const fecha = partes[0]; // Formato: DD-MM-YYYY
          const tipo = partes[5]; // Tipo de asistencia
          const monto = (parseFloat(partes[3]) || 0) + (parseFloat(partes[4]) || 0);

          // Solo si hay registro (tipo no vacío)
          if (tipo && tipo.trim() !== '') {
            const key = `${planilla.id_asignacion}_${fecha}`;
            fechasProcesadasPorAsignacion.add(key);

            // Obtener o crear el detalle del día
            if (!detallePorDiaMap.has(fecha)) {
              detallePorDiaMap.set(fecha, {
                fecha: fecha,
                total_monto: 0,
                detalle: []
              });
            }

            const diaDetalle = detallePorDiaMap.get(fecha)!;
            diaDetalle.detalle.push({
              id_asignacion: planilla.id_asignacion,
              monto: monto,
              origen: 'PLANILLA_APROBADA',
              tipo: tipo,
              descripcion: `${planilla.cargo} - ${planilla.area}`
            });
            diaDetalle.total_monto += monto;
          }
        }
      }
    }

    // 2. PROCESAR ASISTENCIAS (solo asignaciones que NO tienen planilla aprobada para esa fecha)
    for (const asistencia of data.asistencia || []) {
      const fecha = moment(asistencia.fecha).format('DD-MM-YYYY');
      const key = `${asistencia.id_asignacion}_${fecha}`;

      // Solo procesar si esta asignación no tiene planilla aprobada para esta fecha
      if (!fechasProcesadasPorAsignacion.has(key)) {
        // Calcular monto usando tu lógica existente
        const monto = await this.calcularMontoAsistencia(asistencia);

        if (monto > 0) {
          // Obtener o crear el detalle del día
          if (!detallePorDiaMap.has(fecha)) {
            detallePorDiaMap.set(fecha, {
              fecha: fecha,
              total_monto: 0,
              detalle: []
            });
          }

          const diaDetalle = detallePorDiaMap.get(fecha)!;
          diaDetalle.detalle.push({
            id_asignacion: asistencia.id_asignacion,
            monto: monto,
            origen: 'ASISTENCIA',
            tipo: asistencia.tipo,
            descripcion: `${asistencia.descripcion_cargo} - ${asistencia.descripcion_area}`
          });
          diaDetalle.total_monto += monto;
        }
      }
    }

    // 3. GENERAR REPORTE POR MES usando el calendario
    const mesesMap: { [key: string]: string } = {
      'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
      'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
      'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
    };

    const resumenMensual: any[] = [];

    for (const anioObj of calendario.calendario) {
      for (const mesObj of anioObj.meses) {
        const mesNumero = mesesMap[mesObj.mes];
        const mesKey = `${mesNumero}-${mesObj.anio}`;

        let totalMontoMes = 0;
        let diasConRegistro = 0;

        // Recorrer cada día del mes
        for (const dia of mesObj.dias) {
          const fechaDia = dia.fecha;
          const diaDetalle = detallePorDiaMap.get(fechaDia);

          if (diaDetalle && diaDetalle.total_monto > 0) {
            totalMontoMes += diaDetalle.total_monto;
            diasConRegistro++;
          }
        }

        resumenMensual.push({
          mes: mesKey,
          nombre_mes: mesObj.mes,
          anio: mesObj.anio,
          cantidad_dias: diasConRegistro,
          total_monto: totalMontoMes
        });
      }
    }

    // Ordenar resumen por fecha
    resumenMensual.sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      const mesA = parseInt(a.mes.split('-')[0]);
      const mesB = parseInt(b.mes.split('-')[0]);
      return mesA - mesB;
    });

    // Convertir detalle a array y ordenar por fecha
    const detallePorDia = Array.from(detallePorDiaMap.values())
      .sort((a, b) => {
        const [diaA, mesA, anioA] = a.fecha.split('-');
        const [diaB, mesB, anioB] = b.fecha.split('-');
        if (anioA !== anioB) return parseInt(anioA) - parseInt(anioB);
        if (mesA !== mesB) return parseInt(mesA) - parseInt(mesB);
        return parseInt(diaA) - parseInt(diaB);
      });

    return {
      resumenMensual,
      detallePorDia
    };
  }

  async listarVersiones() {
    this.versions = []
    const obj = {
      id_proyecto: this.idProyecto
    }
    const res = await this.recursosHumanosService.listarVersionProgramacion(obj)
    this.versions.push({ descripcion: 'Base (No Editable)', id_version: 0, id_proyecto: this.idProyecto })
    this.versions = this.versions.concat(res)
    if (this.versions.length > 0) {
      this.version = this.versions[this.versions.length - 1].id_version

    } else {

      this.version = 0
    }
  }

  async listarProgramacion(inicio = false) {
    const input = { id_proyecto: this.idProyecto, version: this.version };
    const response = await this.principalService.listarProgramacionProyecto(
      input
    );


    if (response[0].length) {
      const arrayHitos = response[1];
      let arrayProgRecuperados = response[0];
      let arrayUIDsOrdenados = [];
      arrayUIDsOrdenados.length = response[2][0].uid;
      this.dataPrincipal = await this.formatoProgramacion(
        arrayProgRecuperados,
        false
      );
      this.dataPrincipal.map((ele) => (arrayUIDsOrdenados[ele.uid] = ele));
      this.uidsOrdenados = arrayUIDsOrdenados;
      if (arrayHitos.length) {
        for await (let hito of arrayHitos) {
          this.uidsOrdenados[hito.uid] = hito;
          const hitoFormat = await this.formatoHito(hito);
          const encontrado = this.dataPrincipal.find(
            (ele) => hito.indice_refer == ele.uid
          );
          if (encontrado) {
            hitoFormat.item = encontrado.item;
            hitoFormat.unidad = encontrado.unidad;
            await this.indexarElemento(encontrado, hitoFormat);
          }
        }
      }
      this.dataPrincipal = await this.dataPrincipal.map((ele, index) => {
        ele.ind = index;
        ele.ind2 = index;
        return ele;
      });
      const filter4 = await this.dataPrincipal.filter(
        (ele) => ele.filaEditada
      );
      this.tablaIdGantt = await this.dataPrincipal.filter(
        (ele) => ele.duracion && !ele.indice_ref_hito
      );
      let ultimo = null;
      this.tablaIdGantt = this.tablaIdGantt.map((ele, index) => {
        ele.idgantt = index + 1;
        ultimo = index + 1;
        return ele;
      });
      const actualizar = await this.referenciasCorrectas();
      await this.actualizarTitulos2(inicio);
      // if (!this.solover) {
      //   const arrayEliminar = await this.listarIndicesElimPresupuesto();
      //   if (arrayEliminar.length) {
      //     const tablaguardar = await this.actualizarPrograInd(arrayEliminar);
      //     if (tablaguardar.length) {
      //       await this.guardar2(tablaguardar, true);
      //       return;
      //     }
      //   }
      // }
      this.ultimoidGantt = ultimo;
    }


    if (!this.dataPrincipal.length) {
      this.mostrar_carga_todo = false;
    }
    // console.table(this.dataPrincipal, [
    //   'uid',
    //   'idgantt',
    //   'item',
    //   'fechaini',
    //   'fechafin',
    //   'referencia',
    //   'referenciados',
    //   'hijos',
    //   'hijos_uid',
    //   'condini',
    //   'condfin',
    // ]);
  }

  async referenciasCorrectas() {
    let guardar = false;
    for (const iterator of this.dataPrincipal) {
      if (iterator.referenciados) {
        iterator.referencia = await this.referenciaCorrecta(
          JSON.parse(iterator.referenciados)
        );
        // if (
        //   !iterator.condini &&
        //   !iterator.condfin &&
        //   iterator.unidad &&
        //   !iterator.indice_ref_hito
        // ) {
        //   await this.actuaEliminado(iterator);
        //   iterator.filaEditada = true;
        //   guardar = true;
        // }
      } else {
      }
    }
    return guardar;
  }

  async referenciaCorrecta(referenciados) {
    let referencias = [];
    for (const iterator of referenciados) {
      const encontrado = await this.dataPrincipal.find(
        (ele) => ele.uid == iterator[0]
      );
      let idgantt;
      if (encontrado) {
        idgantt = encontrado.idgantt;
      }
      const ref =
        idgantt +
        iterator[1] +
        (iterator[2] ? (iterator[3] ? iterator[3] : '+') + iterator[2] : '');
      referencias.push(ref);
    }
    return referencias.join(',');
  }

  async indexarElemento(partidaReferente, elementoIndex) {
    let indiceCreacion;
    if (partidaReferente.unidad) {
      indiceCreacion = partidaReferente.ind + 1;
    } else {
      const nivel = partidaReferente.item?.split('.').length;
      let encontrado2;
      for (
        let i = partidaReferente.ind + 1;
        i < this.dataPrincipal.length;
        i++
      ) {
        const nivel2 = this.dataPrincipal[i].item?.split('.').length;
        if (nivel2 <= nivel) {
          encontrado2 = this.dataPrincipal[i];
          break;
        }
      }
      if (!encontrado2) {
        indiceCreacion = this.dataPrincipal.length;
      } else {
        indiceCreacion = encontrado2.ind;
      }
    }
    this.dataPrincipal.splice(indiceCreacion, 0, elementoIndex);
    this.dataPrincipal.map((ele, index) => {
      this.dataPrincipal[index].ind = index;
      this.dataPrincipal[index].ind2 = index;
    });
  }

  async actualizarTitulos2(noConsiderar = false) {
    let titulos = [];
    await this.dataPrincipal.map((ele) => {
      if (!ele.unidad && !ele.indice_ref_hito && ele.item) {
        titulos.push(ele.ind);
      }
    });
    titulos.reverse();
    for (const iterator of titulos) {
      await this.updatetitulo2(iterator, noConsiderar);
    }
  }

  async updatetitulo2(indice, noConsiderar) {
    const fechaiIni = JSON.parse(
      JSON.stringify(this.dataPrincipal[indice].fechaini)
    );
    const fechaiFin = JSON.parse(
      JSON.stringify(this.dataPrincipal[indice].fechafin)
    );
    const arrayItem = this.dataPrincipal[indice].item?.split('.');
    const encontrados = await this.dataPrincipal.filter((ele) => {
      const arrayItem2 = ele.item.split('.');
      arrayItem2.pop();
      if (arrayItem.join('.') == arrayItem2.join('.') && !ele.indice_ref_hito) {
        return ele;
      }
    });
    let mayorFF = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
    let menorFI = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
    if (encontrados.length) {
      encontrados.map((ele, index) => {
        if (index == 0) {
          menorFI = ele.fechaini;
        }
        if (ele.fechaini < menorFI) {
          menorFI = ele.fechaini;
        }
        if (ele.fechafin > mayorFF) {
          mayorFF = ele.fechafin;
        }
      });
    } else {
    }
    this.dataPrincipal[indice].fechaini = JSON.parse(JSON.stringify(menorFI));
    this.dataPrincipal[indice].fechafin = JSON.parse(JSON.stringify(mayorFF));
    const response = await this.calcularFechaComplemento(
      '',
      this.dataPrincipal[indice].fechaini,
      this.dataPrincipal[indice].fechafin
    );
    this.dataPrincipal[indice].duracion = Number(response.duracion);
    this.dataPrincipal[indice].duraciontot = Number(response.duraciontot);
    if (!noConsiderar) {
      if (
        fechaiIni !== this.dataPrincipal[indice].fechaini ||
        fechaiFin !== this.dataPrincipal[indice].fechafin
      ) {
        this.dataPrincipal[indice].filaEditada = true;
      }
    }
  }

  async formatoProgramacion(dataPrincipal, importado) {
    if (!dataPrincipal.length) {
      return;
    }
    let tabla: filaProgramacion[] = [];

    for await (let element of dataPrincipal) {
      if (!element.fechafin) {
        element.fechafin = moment(this.dataProyecto.fecha_inicio).format(
          'YYYY-MM-DD'
        );
        element.fechafinBD = false;
      } else {
        element.fechafin = moment(element.fechafin).format('YYYY-MM-DD');
        element.fechafinBD = true;
      }
      if (!element.fechaini) {
        element.fechaini = moment(this.dataProyecto.fecha_inicio).format(
          'YYYY-MM-DD'
        );
        element.fechainiBD = false;
      } else {
        element.fechaini = moment(element.fechaini).format('YYYY-MM-DD');
        element.fechainiBD = true;
      }
      if (!element.restriccion) {
        element.restriccion = '';
      } else {
        element.restriccion = moment(element.restriccion).format('YYYY-MM-DD');
      }
      if (!element.restriccion2) {
        element.restriccion2 = '';
      } else {
        element.restriccion2 = moment(element.restriccion2).format(
          'YYYY-MM-DD'
        );
      }
      if (!element.condini) {
        element.condini = '';
      }
      if (!element.condfin) {
        element.condfin = '';
      }
      if (!element.parcial) {
        element.parcial = '0.00';
      } else {
        element.parcial = this.formsService.redondeo(
          element.parcial,
          this.dec_parcial
        );
      }

      if (!element.hijos) {
        element.hijos = '';
      }
      if (!element.hijos_uid) {
        element.hijos_uid = '';
      }

      element.predecesor = false;
      element.nroclick = null;
      element.editarRest = false;
      element.editarDur = false;
      element.editarFI = false;
      element.editarFF = false;
      element.editarPred = false;
      element.editarCua = false;
      element.editarDescrip = false;
      element.idgantt = null;
      element.filaEditada = false;
      element.detalle_partida = null;
      element.cuadrillaMO = null;
      element.cuadrillaEQ = null;
      element.cuadrillaMO1 = null;
      element.cuadrillaEQ1 = null;
      element.diasHabilesValido = true;
      element.metrado = this.formsService.redondeo(element.metrado, 5);
      if (
        isNaN(Number(element.rendimiento)) ||
        element.rendimiento == 0 ||
        element.rendimiento == '0'
      ) {
        element.rendimiento = 1;
      }
      if (element.indice_ref_hito) {
        element.duracion = 0;
        element.fechafin = element.fechaini;
      } else {
        element.indice_ref_hito = null;
        if (element.unidad) {
          if (element.referencia == null) {
            element.cuadrilla = 1;
            element.tiempoUnitario = Number(element.tiempoUnitario)
              ? element.tiempoUnitario
              : this.formsService.redondeo(
                parseFloat(element.metrado) / parseFloat(element.rendimiento),
                5
              );
            const diasRequeridos =
              parseFloat(element.tiempoUnitario) /
              parseFloat(element.cuadrilla ? element.cuadrilla : 1);
            element.duracion = element.unidad
              ? Math.ceil(diasRequeridos == 0 ? 1 : diasRequeridos)
              : 1;
            if (element.duracion > this.plazoHabil) {
              element.diasHabilesValido = false;
              element.duracion = this.plazoHabil;
              const cuadrillaNecesaria =
                element.tiempoUnitario /
                (element.duracion ? element.duracion : 1);
              element.cuadrilla = Number(
                this.formsService.redondeo(cuadrillaNecesaria, 2)
              );
              element.filaEditada = true;
              const response = await this.calcularFechaComplemento(
                element.duracion,
                element.fechaini,
                ''
              );
              element.fechafin = response.fecha;
              element.duraciontot = response.duraciontot;
            } else {
              const response = await this.calcularFechaComplemento(
                element.duracion,
                element.fechaini,
                ''
              );
              element.diasHabilesValido = true;
              element.fechafin = response.fecha;
              element.duraciontot = response.duraciontot;
            }
          } else {
            element.cuadrilla = element.cuadrilla ? element.cuadrilla : 1;
            element.tiempoUnitario = element.metrado / element.rendimiento;
          }
        } else {
          element.referencia = '';
        }
      }
      tabla.push(element);
    }
    return tabla;
  }

  async listaFeriados() {
    let arrayFeriados = [];
    let fecha = JSON.parse(
      JSON.stringify(moment(this.dataProyecto.fecha_inicio))
    );
    let ff = moment(this.dataProyecto.fecha_culmina).format('YYYY-MM-DD');
    while (moment(fecha).format('YYYY-MM-DD') <= ff) {
      const nombreDia = moment
        .weekdays(moment(fecha).day())
        .toLocaleUpperCase();
      const existe = await this.tablaferiados.find(
        (ele) => moment(ele.fecha).format('YYYY-MM-DD') == fecha
      );
      if (this.arrayDiasNoLabEdit.includes(nombreDia) || existe) {
        arrayFeriados.push(moment(fecha).format('YYYY-MM-DD'));
      }
      fecha = moment(fecha).add(1, 'days').format('YYYY-MM-DD');
    }
    this.noLaborables = arrayFeriados;
    this.plazoHabil = this.dataProyecto.plazo - this.noLaborables.length;
  }

  async cargarDatos() {
    let resulta = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.idProyecto,
    });

    if (resulta.length > 0) {
      this.aspectosdias = resulta[0];
      for (const iterator of resulta[1]) {
        iterator.fecha = moment(iterator.fecha).format('YYYY-MM-DD');
      }
      this.tablaferiados = resulta[1];
      const nolab1 =
        this.aspectosdias[0]?.nolabo1 != null
          ? this.aspectosdias[0].nolabo1
          : '';
      const coloresString =
        this.aspectosdias[0]?.nolabo2 != null
          ? this.aspectosdias[0].nolabo2
          : '';
      const arrayColores = coloresString.split('|');
      // this.colorNoLabo = arrayColores[0] ? arrayColores[0] : 'color_1';
      // this.colorFeriado = arrayColores[1] ? arrayColores[1] : 'color_1';
      // this.colorActual = arrayColores[2] ? arrayColores[2] : 'color_1';

      // const encontrado1 = this.coloresProgra.find(
      //   (ele) => ele.nombre == this.colorFeriado
      // );
      // const encontrado2 = this.coloresProgra.find(
      //   (ele) => ele.nombre == this.colorNoLabo
      // );
      // const encontrado3 = this.coloresProgra.find(
      //   (ele) => ele.nombre == this.colorActual
      // );

      // this.colorFeriadosLey = encontrado1 ? encontrado1.id : '#ccc3a980';
      // this.colorNoLaboLey = encontrado2 ? encontrado2.id : '#ccc3a980';
      // this.colorDiaActLey = encontrado3 ? encontrado3.id : '#ccc3a980';

      this.arrayDiasNoLabEdit = nolab1 == '' ? [] : nolab1.split('|');
    }
  }

  async calcularFechaComplemento(duracion, fechaini, fechafin) {
    let diasTotales = null;
    let diasHabiles = duracion ? duracion : null;
    let fecha = null;
    if (!duracion && fechaini && fechafin) {
      if (fechafin > fechaini) {
        var finia = moment(fechaini);
        var f2 = moment(fechafin);
        var f1 = moment(fechaini);
        diasHabiles = 0;
        diasTotales = f2.diff(f1, 'days') + 1;

        while (
          moment(finia).format('YYYY-MM-DD') < moment(f2).format('YYYY-MM-DD')
        ) {
          fecha = moment(finia).add(1, 'days').format('YYYY-MM-DD');
          const nombreDia = moment.weekdays(moment(fecha).day());
          const existe = await this.tablaferiados.find(
            (ele) => moment(ele.fecha).format('YYYY-MM-DD') == fecha
          );
          if (
            !existe &&
            !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
          ) {
            diasHabiles++;
          }
          finia = moment(fecha);
        }
        diasHabiles = diasHabiles + 1;
      } else {
        diasHabiles = 1;
        diasTotales = 1;
      }
    } else if (duracion) {
      if (fechaini && !fechafin) {
        var finia = moment(fechaini);
        let duracionPendiente = duracion == 1 ? 1 : Number(duracion) - 1;
        if (duracion == 1) {
          fecha = fechaini;
        } else {
          while (duracionPendiente > 0) {
            fecha = moment(finia).add(1, 'days').format('YYYY-MM-DD');
            const nombreDia = moment.weekdays(moment(fecha).day());
            const existe = await this.tablaferiados.find(
              (ele) => ele.fecha == fecha
            );
            if (
              !existe &&
              !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
            ) {
              duracionPendiente--;
            }
            finia = moment(fecha);
          }
        }
        var fini = moment(fechaini);
        var ffin = moment(fecha);
        diasTotales = ffin.diff(fini, 'days') + 1;
      } else {
        if (duracion == 1) {
          diasHabiles = 1;
          diasTotales = 1;
          fecha = fechafin;
        } else {
          var f1 = moment(fechafin);
          let duracionPendiente = Number(duracion) - 1;
          while (duracionPendiente > 0) {
            fecha = moment(f1).subtract(1, 'days').format('YYYY-MM-DD');
            const nombreDia = moment.weekdays(moment(fecha).day());
            const existe = await this.tablaferiados.find(
              (ele) => ele.fecha == fecha
            );
            if (
              !existe &&
              !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
            ) {
              duracionPendiente--;
            }
            f1 = moment(fecha);
          }
          var ffin = moment(fechafin);
          var fini = moment(fecha);
          diasTotales = ffin.diff(fini, 'days') + 1;
        }
      }
    } else if (duracion < 0 && fechaini) {
      var f1 = moment(fechaini);
      let duracionPendiente = Number(duracion) - 1;
      while (duracionPendiente > 0) {
        fecha = moment(f1).subtract(1, 'days').format('YYYY-MM-DD');
        const nombreDia = moment.weekdays(moment(fecha).day());
        const existe = await this.tablaferiados.find(
          (ele) => ele.fecha == fecha
        );
        if (
          !existe &&
          !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
        ) {
          duracionPendiente--;
        }
        f1 = moment(fecha);
      }
      var ffin = moment(fechaini);
      var fini = moment(fecha);
      diasTotales = ffin.diff(fini, 'days') + 1;
    } else {
      console.log('falta');
    }
    // if (
    //   moment(fecha).format('YYYY-MM-DD') > this.ffLimite ||
    //   moment(fecha).format('YYYY-MM-DD') < this.fiLimite
    // ) {
    //   this.prograNoActua = true;
    //   this.limitesIncorrectos = true;
    // }
    const obj = {
      duracion: diasHabiles,
      duraciontot: diasTotales,
      fecha: fecha,
    };
    return obj;
  }

  async formatoHito(hito) {
    const obj: filaProgramacion = {
      condfin: '',
      condini: '',
      cuadrilla: null,
      descripcion: hito.descripcion,
      duracion: 0,
      duracionreq: 0,
      duraciontot: 0,
      editarCua: false,
      editarDescrip: false,
      editarDur: false,
      editarFF: false,
      editarFI: false,
      editarPred: false,
      editarRest: false,
      fechafin: moment(hito.fechafin).format('YYYY-MM-DD'),
      fechafinBD: true,
      fechaini: moment(hito.fechaini).format('YYYY-MM-DD'),
      fechainiBD: true,
      hijos: '',
      icomost: 1,
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
      idgantt: null,
      ind: null,
      ind2: null,
      indice: null,
      hijos_uid: '',
      item: '',
      metrado: null,
      mostrar: 1,
      nivel: 1,
      nroclick: null,
      predecesor: false,
      referencia: hito.referencias ? hito.referencias : '',
      referenciados: hito.referenciados ? hito.referenciados : '',
      rendimiento: null,
      restriccion: '',
      restriccion2: '',
      uid: hito.uid,
      unidad: '',
      indice_ref_hito: hito.indice_refer,
      diasHabilesValido: true,
      filaEditada: false,
      tiempoUnitario: null,
    };
    return obj;
  }

  async recuperarDatosProyecto(idProyecto) {
    const inputProyecto = {
      id_proyecto: idProyecto,
    };
    this.dataProyecto = await this.principalService.recuperarDatosProyecto(
      inputProyecto
    );
    this.fiProyecto = moment(this.dataProyecto?.fecha_inicio).format(
      'YYYY-MM-DD'
    );
    this.ffProyecto = moment(this.dataProyecto?.fecha_culmina).format(
      'YYYY-MM-DD'
    );
    const objeto = {
      id_proyecto: this.idProyecto,
      duracion: this.dataProyecto.plazo,
      fechaini: moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD'),
      fechafin: '',
      posterior: 0,
    };
    const response = await this.principalService.fechaDespuesDuracion(objeto);
    this.FFRestriccion = response.fecha;
    // this.moneda = this.dataProyecto.moneda.toString() == '0' ? 'S/' : '$';
    this.moneda = 'S/'
  }

  async generarTablaDesembolso() {
    try {

      // this.fueraPlazo = false;
      let tablaDesembolso = [];
      let index = 0;
      let fi = null;
      let ff = null;
      this.totalesDesembolso = [];
      this.sumaTotalParciales = null;
      let sumaPartidas = 0;
      for (const iterator of this.dataPrincipal) {
        iterator.parcial = this.formsService.redondeo(
          iterator.parcial,
          this.dec_parcial
        );
        if (!iterator.unidad) {
          const cant = iterator.item?.split('.');
          if (cant?.length == 1) {
            fi = !fi
              ? iterator.fechaini
              : fi < iterator.fechaini
                ? fi
                : iterator.fechaini;
            ff = !ff
              ? iterator.fechafin
              : ff > iterator.fechafin
                ? ff
                : iterator.fechafin;
            if (iterator.duracion && !iterator.indice_ref_hito)
              sumaPartidas = sumaPartidas + Number(iterator.parcial);
          }
        }
        this.sumaTotalParciales = this.formsService.redondeo(
          sumaPartidas,
          this.dec_parcial
        );

        if (iterator.indice_ref_hito || iterator.duracion == 0) {
        } else {
          const obj = {
            descripcion: iterator.descripcion,
            item: iterator.item,
            unidad: iterator.unidad,
            duracion: iterator.duracion,
            duraciontot: iterator.duraciontot,
            ind: index,
            indice: iterator.indice,
            parcial: iterator.parcial,
            fechaini: iterator.fechaini,
            fechafin: iterator.fechafin,
            meses: [],
          };
          tablaDesembolso.push(obj);
          index++;
        }
      }
      this.tablaDesembolso = tablaDesembolso;
      var fecha1 = moment(this.fiLimite);
      var fecha2 = moment(this.ffLimite);

      const meses = this.dataHeader.length;
      const anioInicio = moment(fecha1).format('yy');
      const anioFin = moment(fecha2).format('yy');
      const years = Number(anioFin) - Number(anioInicio);

      const mesInicio = moment(fecha1).format('MM');

      this.mesesHeader = [];
      this.yearsHeader = [];
      for (let i = 0; i <= years; i++) {
        const anio = Number(anioInicio) + i;
        this.yearsHeader.push({ year: anio, col: 0 });
      }
      for (let i = 0; i < meses; i++) {
        let mesCant;
        const cant = Number(mesInicio) + i;
        if (cant > 12) {
          mesCant = cant % 12;
        } else {
          mesCant = cant;
        }
        this.mesesHeader.push({
          mes: mesCant == 0 ? 12 : mesCant,
          inicio: null,
          fin: null,
          feriados: [],
        });
      }
      let i = 0;
      let j = 0;
      for (const item of this.mesesHeader) {
        this.yearsHeader[i].col = this.yearsHeader[i].col + 1;

        if (i == 0) {
          let ini;
          if (j == 0) {
            ini = moment(fecha1).format('DD');
          } else {
            ini = 1;
          }

          var primerDia = moment(
            new Date(
              this.yearsHeader[i].year.toString(),
              item.mes - 1,
              Number(ini)
            )
          ).format('YYYY-MM-DD');
          var ultimoDia = moment(
            new Date(this.yearsHeader[i].year.toString(), item.mes - 1 + 1, 0)
          ).format('YYYY-MM-DD');
          item.inicio = primerDia;
          item.fin = ultimoDia;
        } else {
          let ultimoDia2 = null;
          var primerDia = moment(
            new Date(this.yearsHeader[i].year.toString(), item.mes - 1, 1)
          ).format('YYYY-MM-DD');
          if (j !== this.mesesHeader.length - 1) {
            ultimoDia2 = moment(
              new Date(
                this.yearsHeader[i].year.toString(),
                item.mes - 1 + 1,
                0
              )
            ).format('YYYY-MM-DD');
          } else {
            ultimoDia2 = ff;
          }
          item.inicio = primerDia;
          item.fin = ultimoDia2;
        }
        if (item.mes == 12) {
          i++;
        }
        j++;
        const arrayFeriados = await this.crearArrayFeriadosXMes(item, j);
        item.feriados = arrayFeriados;
      }
      for (const iterator of this.tablaDesembolso) {
        if (iterator.unidad) {
          const fip = moment(iterator.fechaini).format('YYYY-MM-DD');
          const ffp = moment(iterator.fechafin).format('YYYY-MM-DD');
          const fiL = moment(this.dataProyecto.fecha_inicio).format(
            'YYYY-MM-DD'
          );
          const ffL = moment(this.dataProyecto.fecha_culmina).format(
            'YYYY-MM-DD'
          );
          if (fip < fiL || ffp > ffL) {
            iterator.fuera_rango = true;
            // this.fueraPlazo = true;
          } else {
            iterator.fuera_rango = false;
          }

          let dias = [];
          dias.length = this.mesesHeader.length;
          let fecha = fip;
          let i = 0;
          for (const mes of this.mesesHeader) {
            const fim = moment(mes.inicio).format('YYYY-MM-DD');
            const ffm = moment(mes.fin).format('YYYY-MM-DD');
            if (fecha >= fim && fecha <= ffm) {
              if (ffp < ffm) {
                var fini = moment(fecha).format('YYYY-MM-DD');
                var ffin = moment(ffp).format('YYYY-MM-DD');
                const numeroDias = await this.calcularDiasHabiles(
                  fini,
                  ffin,
                  mes.feriados
                );
                const monto =
                  (Number(iterator.parcial) / Number(iterator.duracion)) *
                  numeroDias;
                const montoRed = this.formsService.redondeo(
                  monto,
                  this.dec_parcial
                );
                const porcentaje =
                  (100 * numeroDias) / Number(iterator.duracion);
                dias[i] = {
                  dias: numeroDias,
                  monto: montoRed,
                  porcentaje: porcentaje,
                };
                fecha = ffm;
                break;
              } else {
                var fini = moment(fecha).format('YYYY-MM-DD');
                var ffin = moment(ffm).format('YYYY-MM-DD');
                const numeroDias = await this.calcularDiasHabiles(
                  fini,
                  ffin,
                  mes.feriados
                );
                const monto =
                  (Number(iterator.parcial) / Number(iterator.duracion)) *
                  numeroDias;
                const montoRed = this.formsService.redondeo(
                  monto,
                  this.dec_parcial
                );
                const porcentaje =
                  (100 * numeroDias) / Number(iterator.duracion);
                dias[i] = {
                  dias: numeroDias,
                  monto: montoRed,
                  porcentaje: porcentaje,
                };
                fecha = moment(ffm).add(1, 'days').format('YYYY-MM-DD');
              }
            }
            i++;
          }
          iterator.meses = dias;
        } else {
          let dias = [];
          for (const mes of this.mesesHeader) {
            dias.push({ dias: null, monto: null });
          }
          iterator.meses = dias;
        }
      }
      this.totalesDesembolso = [];
      // this.redTotDesem = [];
      for (let iterator of this.mesesHeader) {
        this.totalesDesembolso.push(0);
      }
      for (const iterator of this.tablaDesembolso) {
        if (iterator.unidad) {
          let index = 0;
          for (const row of iterator.meses) {
            if (row) {
              this.totalesDesembolso[index] =
                Number(row.monto) > 0
                  ? this.totalesDesembolso[index] + Number(row.monto)
                  : this.totalesDesembolso[index];
            }
            index++;
          }
        }
      }
      // this.redTotDesem = this.totalesDesembolso.map((ele) =>
      //   this.formsService.redondeo(ele, this.dec_parcial)
      // );

      let total = 0;
      this.totalesDesembolso.map((ele) => (total = total + ele));
      this.porcentajesDesembolso = [];
      let sumPorc = 0;
      for (const iterator of this.totalesDesembolso) {
        const porcentaje = (iterator * 100) / total;
        sumPorc = sumPorc + porcentaje;
        const porcRed = this.formsService.redondeo(porcentaje, 2);
        this.porcentajesDesembolso.push(porcRed);
      }

      // this.sumPorcDesem = sumPorc;
      // if (Number(this.sumPorcDesem) > 100) {
      //   this.sumPorcDesem = this.formsService.redondeo(100, 2);
      // }
      // this.tablaDesemDesactua = false;
      await this.listarInsumosXProyecto();
    }
    catch (e) {
      console.error('Error:', e);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  async crearArrayFeriadosXMes(item, index) {
    let arrFeriados = [];
    var fini = moment(item.inicio);
    var ffin = moment(item.fin);
    const numeroDias = ffin.diff(fini, 'days') + 1;
    for (let i = 0; i < numeroDias; i++) {
      const fecha = moment(item.inicio).add(i, 'days').format('YYYY-MM-DD');
      const nombreDia = moment.weekdays(moment(fecha).day());
      const existe = await this.tablaferiados.find(
        (ele) => moment(ele.fecha).format('YYYY-MM-DD') == fecha
      );
      if (existe || this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())) {
        arrFeriados.push(fecha);
      }
    }
    return arrFeriados;
  }

  async recuperarDataHeader(event) {
    this.dataHeader = event ? event : [];
    await this.evaluarOcultarColum(false);
    this.mostrar_carga_todo = false;
  }

  async evaluarOcultarColum(checked) {
    // this.mesesMostrar = [];
    const inicio = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
    const final = moment(this.dataProyecto.fecha_culmina).format('YYYY-MM-DD');
    let array = [];
    // this.ocultarFueraRango = checked;
    let ultimoAnio = null;
    let array2 = [];
    let i = 0;
    let j = 0;
    let acum = 0;
    for (const iterator of this.dataHeader) {
      const mes = iterator.nombre.split('-')[0].trim();
      const anio = iterator.nombre.split('-')[1].trim();
      const index = this.arrayMeses.findIndex(
        (ele) => ele.toUpperCase() == mes
      );
      const fecha =
        anio +
        '-' +
        (index + 1 < 10 ? '0' + (index + 1) : index + 1) +
        '-' +
        '01';
      const f1 = moment(inicio).format('YYYY-MM');
      const f2 = moment(final).format('YYYY-MM');
      const fevaluar = moment(fecha).format('YYYY-MM');
      j++;
      let valor = null;

      if (!checked) {
        if (fecha <= final && fecha >= inicio) {
          array.push(1);
          valor = 1;
        } else {
          if (
            (f2 > fevaluar && f1 > fevaluar) ||
            (f2 < fevaluar && f1 < fevaluar)
          ) {
            array.push(0);
            valor = 0;
          } else {
            array.push(2);
            valor = 2;
          }
        }
      } else {
        if (
          (f2 > fevaluar && f1 > fevaluar) ||
          (f2 < fevaluar && f1 < fevaluar)
        ) {
          if (Number(this.porcentajesDesembolso[acum]) > 0) {
            array.push(1);
            valor = 1;
          } else {
            array.push(0);
            valor = 0;
          }
        } else {
          array.push(1);
          valor = 1;
        }
      }

      if (!ultimoAnio) {
        ultimoAnio = anio;
        if (valor) {
          i++;
        }
        array2.push(i);
      } else {
        if (ultimoAnio !== anio) {
          ultimoAnio = anio;
          i = 0;
          if (valor) {
            i++;
          }
          array2.push(i);
        } else {
          if (valor) {
            i++;
          }
          array2[array2.length - 1] = i;
        }
      }
      acum++;
    }
    this.mesesMostrar = array;
    this.nroMeses = [];
    let nr = 1;
    for (const i of this.mesesMostrar) {
      if (i > 0) {
        this.nroMeses.push(nr);
        nr++;
      } else {
        this.nroMeses.push(null);
      }
    }
    // this.colspanAnios = array2;
  }

  async listarInsumosXProyecto() {
    try {
      this.listaInsumos = [];
      const obj = {
        id_proyecto: this.idProyecto,
      };
      const response = await this.principalService.relacionInsumosProy(obj);
      this.listaInsumos = response.length ? response : [];
    } catch (error) {
      console.error('Error:', error);
      this.mostrar_carga_todo = false;
      SwalService.error(error)
    }

  }

  async calcularDiasHabiles(fi, ff, feriados) {
    let dias = 0;
    let fecha = fi;
    while (fecha <= ff) {
      if (!feriados.includes(fecha)) {
        dias++;
      }
      fecha = moment(fecha).add(1, 'days').format('YYYY-MM-DD');
    }
    return dias;
  }
  // async generarCalendarioMaterialesPorTipo(tipo: 'MANO DE OBRA' | 'MATERIALES' | 'EQUIPOS' | 'SUBCONTRATOS') {
  //   try {
  //     // Primero genera el calendario completo
  //     await this.generarCalendarioMateriales();

  //     // Luego formatea para el tipo específico
  //     const diasPorMes = this.calcularDiasUnicosPorMesOptimized(
  //       this.calendarioMateriales,
  //       "1",
  //       this.dataHeader
  //     );
  //     console.log('diasPorMes', diasPorMes)
  //   } catch (error) {
  //     console.error(`Error al generar calendario para ${tipo}:`, error);
  //     return {};
  //   }
  // }

  async generarCalendarioMateriales() {
    this.totalColumna = null;
    this.calendarioMateriales = [];
    const obj = {
      id_proyecto: this.idProyecto,
    };
    let array = [];
    for (let i = 0; i < this.dataHeader.length; i++) {
      array.push(0);
    }
    this.totalesMateriales = JSON.parse(JSON.stringify(array));
    let response = await this.principalService.relInsPrograDetallado(obj);
    if (response == null) {
      SwalService.error(response);
      this.mostrar_carga_todo = false;
      return;
    }
    let auxiliar = JSON.parse(JSON.stringify(response));
    let acumulados = await this.agrupadoXinsumo(auxiliar);
    let sumag = 0;
    let suma2 = 0;
    for (const iterator of this.listaInsumos) {
      if (Number(iterator.num_det) > 0) {
        sumag += Number(iterator.parcial);
      }
    }
    for (const iterator of auxiliar) {
      if (Number(iterator.id_tipo_insumo) != 5) {
        suma2 += Number(iterator.parcial);
      }
    }

    let formatPresu = [];
    let totalCostoParciales = 0;
    for (const element of this.tablaDesembolso) {
      let insumos = [];
      if (element.unidad) {
        const encontrados = await response.filter(
          (ele) =>
            ele.indice == element.indice &&
            ele.id_tipo_insumo !== 0 &&
            ele.id_tipo_insumo !== 5
        );
        if (encontrados.length) {
          encontrados.forEach((iterator) => {
            const obj = {
              descripcion: iterator.descripcion,
              meses: array,
              unidad: iterator.unidad,
              parcial: iterator.parcial,
              precio: iterator.precio,
              id_insumo: iterator.id_insumo,
              id_tipo_insumo: iterator.id_tipo_insumo,
              cantidades: array,
              cantidad: iterator.cantidad,
              descripcion_partida: element.descripcion,
              item_partida: element.item,
              indice_partida: element.indice,
              unidad_partida: element.unidad,
              operador: iterator.operador,
              inicio: element.fechaini,
              fin: element.fechafin,
            };
            insumos.push(obj);
          });
        }
      }
      const parcial_2dec = this.formsService.redondeo(
        Number(element.parcial),
        this.dec_parcial
      );
      let partida = {
        descripcion: element.descripcion,
        item: element.item,
        indice: element.indice,
        parcial: Number(parcial_2dec).toFixed(2),
        unidad: element.unidad,
        meses: element.meses,
        insumos: insumos,
        inicio: element.fechaini,
        fin: element.fechafin
      };
      formatPresu.push(partida);
    }
    for (let ele of formatPresu) {
      if (ele.unidad) {
        let pocentajeTotal = 0;
        for (let element of ele.insumos) {
          if (Number(ele.parcial) > 0) {
            element.porcentaje = (element.parcial * 100) / ele.parcial;
          } else {
            element.porcentaje = 0;
          }
          pocentajeTotal += element.porcentaje;
        }
        for (let insumo of ele.insumos) {
          let meses = [];
          for (const mes of ele.meses) {
            if (mes) {
              const monto = (mes.monto * insumo.porcentaje) / 100;
              meses.push(monto);
            } else {
              meses.push(0);
            }
          }
          insumo.meses = meses;
        }
      }
    }
    let concatInsumos = [];
    for (const iterator of formatPresu) {
      if (iterator.unidad) {
        concatInsumos = concatInsumos.concat(iterator.insumos);
      }
    }
    for (const iterator of acumulados) {
      const existentes = concatInsumos.filter((ele) => {
        if (iterator.operador == '%') {
          if (
            iterator.descripcion == ele.descripcion &&
            iterator.id_tipo_insumo == ele.id_tipo_insumo &&
            ele.id_tipo_insumo !== 0 &&
            ele.id_tipo_insumo !== 5
          ) {
            return ele;
          }
        } else {
          if (
            iterator.descripcion == ele.descripcion &&
            iterator.id_tipo_insumo == ele.id_tipo_insumo &&
            iterator.precio == ele.precio &&
            ele.id_tipo_insumo !== 0 &&
            ele.id_tipo_insumo !== 5
          ) {
            return ele;
          }
        }
      });
      let meses = JSON.parse(JSON.stringify(iterator.meses));
      let cantidades = JSON.parse(JSON.stringify(iterator.cantidades));
      let partidas = [];

      for (let row of existentes) {
        let i = 0;
        const objPart = {
          descripcion: row.descripcion_partida,
          porcentaje: row.porcentaje,
          item: row.item_partida,
          unidad: row.unidad,
          meses: row.meses,
          cantidades: row.cantidades,
          parcial: this.formsService.redondeo(row.parcial, this.dec_parcial),
          inicio: row.inicio || iterator.inicio,
          fin: row.fin || iterator.fin,
          diasPorMes: [] // Aquí guardaremos los días calculados para cada columna de mes
        };
        partidas.push(objPart);
        for (const mes of row.meses) {
          // if (iterator.compensa && i == 0) {
          //   console.log(' Number(iterator.compensa)',  Number(iterator.compensa));

          //   meses[i] = meses[i] + Number(iterator.compensa)
          // }
          meses[i] = meses[i] + mes;
          cantidades[i] = this.formsService.redondeo(
            meses[i] / iterator.precio,
            this.dec_cant
          );
          i++;
        }
      }
      let suma = 0;
      partidas.map((ele) => (suma += Number(ele.parcial)));
      iterator.parcialCalculado = suma;
      iterator.partidas = partidas;
      iterator.meses = meses;
      iterator.cantidades = cantidades;
      if (iterator.compensa) {
        const index = iterator.meses.findIndex((ele) => ele > 0);
        iterator.meses[index] =
          iterator.meses[index] + Number(iterator.compensa);
        iterator.cantidades[index] = Number(
          this.formsService.redondeo(
            iterator.meses[index] / Number(iterator.precio),
            this.dec_cant
          )
        );
        let indices = [];
        let insumos = iterator.partidas.filter((ele, index) => {
          if (ele.meses.find((ele) => ele > 0)) {
            indices.push(index);
            return ele;
          }
        });
        let valorCompensa = Number(iterator.compensa);
        let i = 0;
        for (let element of insumos) {
          let j = 0;
          for (let mes of element.meses) {
            if (mes > 0) {
              const valor = mes + valorCompensa;

              if (valor > 0) {
                iterator.partidas[indices[i]].meses[j] = valor;
                valorCompensa = 0;
              } else {
                valorCompensa = valorCompensa - mes;
                iterator.partidas[indices[i]].meses[j] = 0;
              }
            }
            let parcial = 0;
            element.meses.map((ele) => {
              parcial = ele + parcial;
            });
            iterator.partidas[indices[i]].parcial = this.formsService.redondeo(
              parcial,
              this.dec_parcial
            );
            if (valorCompensa == 0) {
              break;
            }
            j++;
          }
          if (valorCompensa == 0) {
            break;
          }
          i++;
        }
      }
    }

    let tablaFinal = [];
    let j = 1;
    const arrayTipos = [
      'MANO DE OBRA (MO)',
      'MATERIALES (MAT)',
      'EQUIPOS (EQ)',
      'SUBCONTRATOS (SUBCONT)',
    ];
    for (const iterator of arrayTipos) {
      let totalGrupo = JSON.parse(JSON.stringify(array));
      const obj = {
        cantidad: 0,
        cantidades: array,
        descripcion: arrayTipos[j - 1],
        id_insumo: null,
        id_tipo_insumo: j,
        ind: null,
        meses: array,
        parcial: 0,
        partidas: [],
        precio: 0,
        unidad: '',
      };
      tablaFinal.push(obj);
      let filtXtipo = await acumulados.filter((ele) => ele.id_tipo_insumo == j);
      filtXtipo = await filtXtipo.map((ele, index) => {
        ele.ind2 = index;
        return ele;
      });
      let sumaGrupo2 = 0;
      filtXtipo.map((ele) => (sumaGrupo2 = sumaGrupo2 + Number(ele.parcial)));
      tablaFinal = tablaFinal.concat(filtXtipo);
      for (const insum of filtXtipo) {
        let k = 0;
        for (const mes of insum.meses) {
          totalGrupo[k] = totalGrupo[k] + mes;
          this.totalesMateriales[k] = this.totalesMateriales[k] + mes;
          k++;
        }
      }

      const totRd = totalGrupo.map((ele) =>
        this.formsService.redondeo(ele, this.dec_parcial)
      );
      const sumagrupo = this.formsService.redondeo(
        totalGrupo.reduce((a, b) => a + b, 0),
        this.dec_parcial
      );
      const sumagrupoComp = totalGrupo.reduce((a, b) => a + b, 0);

      const obj2 = {
        cantidad: 0,
        cantidades: array,
        descripcion: 'total',
        id_insumo: null,
        id_tipo_insumo: j,
        ind: null,
        meses: totRd,
        parcial: sumagrupo,
        partidas: [],
        precio: 0,
        unidad: '',
      };
      tablaFinal.push(obj2);
      j++;
    }
    this.totalParcialesCalMat = this.formsService.redondeo(
      this.totalesMateriales.reduce((a, b) => a + b, 0),
      this.dec_parcial
    );
    const totalParcialesCalMatComp = this.totalesMateriales.reduce(
      (a, b) => a + b,
      0
    );
    acumulados.map((ele) => (totalCostoParciales += Number(ele.parcial)));

    this.totColRedMat = this.totalesMateriales.map((ele) =>
      this.formsService.redondeo(ele, this.dec_parcial)
    );
    let totalPorMat = 0;
    this.porcTotMat = [];
    for (const iterator of this.totColRedMat) {
      const porcentaje =
        (Number(iterator) * 100) / Number(this.totalParcialesCalMat);
      const porcRed = this.formsService.redondeo(porcentaje, this.dec_parcial);
      totalPorMat = totalPorMat + Number(porcentaje);
      this.porcTotMat.push(porcRed);
    }
    this.totalPorcMat = this.formsService.redondeo(totalPorMat, 2);

    this.totalColumna = this.formsService.redondeo(
      totalCostoParciales,
      this.dec_parcial
    );
    this.calendarioMateriales = tablaFinal;
    this.totalParcialesCalMat = sumag; //Corregir
    this.tablaMatDesac = false;
  }


  async agrupadoXinsumo(auxiliar) {
    let array = [];
    for (let i = 0; i < this.dataHeader.length; i++) {
      array.push(0);
    }
    let acumulados = [];
    let prueba = [];
    for (const iterator of this.listaInsumos) {
      if (iterator.num_det == '0') {
      } else {
        const obj = {
          descripcion: iterator.descripcion,
          id_insumo: iterator.id_insumo,
          id_tipo_insumo: iterator.id_tipo_insumo,
          partidas: [],
          precio: iterator.precio,
          cantidad: this.formsService.redondeo(
            iterator.cantidad,
            this.dec_cant
          ),
          parcial: this.formsService.redondeo(
            iterator.parcial,
            this.dec_parcial
          ),
          meses: array,
          unidad: iterator.unidad,
          cantidades: array,
          operador: iterator.operador,
          compensa: iterator.compensa,
        };
        const partEncon = await auxiliar.filter((ele) => {
          if (iterator.operador == '%') {
            if (
              iterator.descripcion == ele.descripcion &&
              iterator.id_tipo_insumo == ele.id_tipo_insumo &&
              ele.id_tipo_insumo !== 0 &&
              ele.id_tipo_insumo !== 5
            ) {
              const partida = {
                descripcion: ele.partida,
                indice: ele.indice,
                parcial: ele.parcial,
                meses: array,
                porcentaje: 0,
                indice_partida: ele.indice,
                descripcion_partida: ele.descripcion,
                item_partida: ele.item,
                unidad_partida: ele.unidad,
              };
              return partida;
            }
          } else {
            if (
              iterator.descripcion == ele.descripcion &&
              iterator.id_tipo_insumo == ele.id_tipo_insumo &&
              iterator.precio == ele.precio &&
              ele.id_tipo_insumo !== 0 &&
              ele.id_tipo_insumo !== 5
            ) {
              const partida = {
                descripcion: ele.partida,
                indice: ele.indice,
                parcial: ele.parcial,
                meses: array,
                porcentaje: 0,
                indice_partida: ele.indice,
                descripcion_partida: ele.descripcion,
                item_partida: ele.item,
                unidad_partida: ele.unidad,
              };
              return partida;
            }
          }
        });

        prueba.push(obj);
      }
    }
    return prueba;
  }

  async estructurarTabla() {
    await this.listarPresInd();
    const suma = await this.listarProcuAsignado()
    await this.listarPanel(suma);
    await this.listarAgrupamientos(suma);

  }

  async listarProcuAsignado() {
    let suma = 0;
    try {
      const res = await this._logisticaService.ListarAdquisicionesProy({
        id_proyecto: this.idProyecto
      });

      if (res?.length) {
        this.listaRegistros = res;
        this.id_registro = res[0].id_registro;  // Asignar el valor

        // Forzar detección de cambios
        setTimeout(() => {
          this.cdRef.detectChanges();
        });
      }

      // Cargar datos relacionados
      let res2 = await this._logisticaService.listarRelinsAdqui({
        id_proyecto: this.idProyecto,
        id_registro: this.id_registro,
        conrelins: '0'
      });

      if (res2[0]?.length) {
        suma = res2[0]
          .filter(ele => ele.id_filadetalle == null && ele.tipocontra == 3)
          .reduce((total, ele) => total + ele.reqsol, 0);
      }
    } catch (error) {
      console.error('Error en listarProcuAsignado:', error);
    }
    return suma;
  }
  async cambioDataRegistro() {
    this.mostrar_carga_todo = true
    // Calcular la nueva suma
    let nuevaSuma = 0;
    try {
      const res2 = await this._logisticaService.listarRelinsAdqui({
        id_proyecto: this.idProyecto,
        id_registro: this.id_registro,
        conrelins: '0'
      });

      if (res2[0]?.length) {
        nuevaSuma = res2[0]
          .filter(ele => ele.id_filadetalle == null && ele.tipocontra == 3)
          .reduce((total, ele) => total + ele.reqsol, 0);
      }

      // Actualizar los pres_asignado en this.tablaAgrupamientos
      await this.actualizarPresAsignadoEnTabla(nuevaSuma);
      this.mostrar_carga_todo = false
    } catch (error) {
      console.error('Error al cambiar registro:', error);
      this.mostrar_carga_todo = false
    }
  }

  private actualizarPresAsignadoEnTabla(nuevaSuma: number) {
    // Actualizar cada elemento de la tabla
    this.tablaAgrupamientos = this.tablaAgrupamientos.map(item => {
      // Si es el elemento padre (COSTO DIRECTO) - id_elemento === null
      if (item.id_elemento === null) {
        return {
          ...item,
          pres_asignado: nuevaSuma
        };
      }
      // Si es un elemento hijo (meses)
      else {
        // Calcular el pres_asignado basado en porcentajeTot
        const porcentajeTot = item.porcentajeTot || 0;
        const nuevoPresAsignado = (nuevaSuma * porcentajeTot) / 100;

        return {
          ...item,
          pres_asignado: nuevoPresAsignado
        };
      }
    });


    // Forzar detección de cambios si es necesario
    this.cdRef.detectChanges();
  }

  async listarPresInd() {
    let res = await this.presuservice.ListarPresuIndirecto({
      id_usuario: this.id_usuario,
      id_proyecto: this.idProyecto,
      titulo: 0,
    });
    if (res.id == '1') {
      let tabs = JSON.parse(res.tabla);
      this.tablaPresInd = tabs[0];
    }
  }

  async listarPanel(suma) {
    this.tablaAgrupamientos = []
    // this.anios = []
    const enc = this.tablaPresInd.find(ele => ele.abrev == 'CD' && ele.descripcion == 'COSTO DIRECTO')
    let res = []
    const cd: IAgrupamiento = {
      id_agrupamiento: 0,
      id_elemento: null,
      id_proyecto: this.idProyecto,
      descripcion: 'COSTO DIRECTO',
      indice: enc.indice,
      orden: 0,
      abreviatura: enc.abrev,
      descripcion_costo: enc?.descripcion,
      id_indice: enc?.id_indice,
      monto_presupuesto: this.dataCalendMat?.parcial,
      dias_eje: 0,
      dias_pres: 0,
      ejecucion_presu: 0,
      porcentaje: 0,
      pres_asignado: 0,
      variacion_plazo: 0,
      variacion_presu: 0,
      mostrar: 1,
      icomost: 1,
      estado: null,
      abrev: enc.abrev,
      porcentajeTot: 0
    }

    const obj = {
      id_proyecto: this.idProyecto
    }
    res = await this.recursosHumanosService.listarAgrupamientoExpTec(obj)
    res.unshift(cd)
    if (res.length) {
      let agrupActual = null
      for (const element of res) {
        if (!element.id_elemento) {
          agrupActual = element
        }
        const encontrado = this.tablaPresInd.find(ele => ele.indice == element.indice)
        const obj: IAgrupamiento = {
          id_agrupamiento: element.id_agrupamiento,
          id_elemento: element.id_elemento,
          id_proyecto: element.id_proyecto,
          descripcion: element.descripcion,
          indice: element.indice,
          orden: element.id_elemento ? element.orden_elemento : element.orden,
          abreviatura: agrupActual?.abrev,
          descripcion_costo: encontrado?.descripcion,
          id_indice: encontrado?.id_indice,
          monto_presupuesto: element.abrev == 'CD' ? element.monto_presupuesto : encontrado?.monto,
          dias_eje: 0,
          ejecucion_presu: 0,
          dias_pres: 0,
          porcentaje: 0,
          pres_asignado: element.abrev == 'CD' ? suma : 0,
          variacion_plazo: 0,
          variacion_presu: 0,
          mostrar: 1,
          icomost: 1,
          estado: element.estado,
          abrev: encontrado?.abrev,
          porcentajeTot: 100
        }
        this.tablaAgrupamientos.push(obj)
      }
      // this.tablaAgrupamientos = res.map(ele => { ele.mostrar = 1; ele.rubro = ''; return ele })
    }
  }

  openModalElementos() {
    this.formElementos.reset()
    this.modalAgregarElemento.show();
  }

  actualizarModal(row) {
    this.formAgrupacion.reset()
    this.descripcion.setValue(row.descripcion)
    this.estado.setValue(row.estado == 2 ? true : false)
    this.id_agrupamiento.setValue(row.id_agrupamiento)
    this.modalActualizarAgrupado.show();
  }

  async eliminarElemento(index: number) {
    this.mostrar_carga_todo = true;

    const elementoAEliminar = this.tablaAgrupamientos[index];
    const elementosAActualizar = [];


    // 1. Reordenar los elementos que están después del eliminado
    for (let i = index + 1; i < this.tablaAgrupamientos.length; i++) {
      if (this.tablaAgrupamientos[i].orden !== undefined &&
        this.tablaAgrupamientos[i].id_elemento) {

        // Disminuir el orden en 1
        this.tablaAgrupamientos[i].orden -= 1;

        // Guardar para actualizar en BD
        elementosAActualizar.push({
          id_proyecto: this.tablaAgrupamientos[i].id_proyecto,
          id_elemento: this.tablaAgrupamientos[i].id_elemento,
          id_agrupamiento: this.tablaAgrupamientos[i].id_agrupamiento,
          descripcion: this.tablaAgrupamientos[i].descripcion,
          orden: this.tablaAgrupamientos[i].orden,
          estado: this.tablaAgrupamientos[i].estado || 0
        });
      }
    }

    // 2. Preparar datos para enviar al backend
    const requestData = {
      elementoEliminar: JSON.stringify(elementoAEliminar),
      elementosActualizar: JSON.stringify(elementosAActualizar)
    }


    try {
      const resultado = await this.recursosHumanosService.eliminarElementoAgrupamiento(requestData);

      if (resultado && resultado.id === "1") {
        // await this.listarPresInd();
        // await this.listarPanel();
        // await this.listarProgramacion();
        await this.estructurarTabla()
      } else {
        console.error('Error al eliminar:', resultado?.mensaje);
        SwalService.error(resultado?.mensaje || 'Error al eliminar elemento');
      }

    } catch (error) {
      console.error('Error:', error);
      SwalService.error('Error al eliminar elemento');
      this.mostrar_carga_todo = false;
    }

    this.mostrar_carga_todo = false;
  }

  async eliminarAgrupamiento(index: number) {
    this.mostrar_carga_todo = true;

    const agrupamientoAEliminar = this.tablaAgrupamientos[index];
    const agrupamientosAActualizar = [];


    // Validar que sea un agrupamiento (no tiene id_elemento)
    if (agrupamientoAEliminar.id_elemento) {
      console.error('No se puede eliminar - es un elemento, no un agrupamiento');
      SwalService.error('Solo se pueden eliminar agrupamientos completos');
      this.mostrar_carga_todo = false;
      return;
    }

    // 1. Reordenar los agrupamientos que están después del eliminado
    for (let i = index + 1; i < this.tablaAgrupamientos.length; i++) {
      // Solo procesar agrupamientos (que no tienen id_elemento)
      if (!this.tablaAgrupamientos[i].id_elemento) {
        // Disminuir el orden en 1
        this.tablaAgrupamientos[i].orden -= 1;

        // Guardar para actualizar en BD
        agrupamientosAActualizar.push({
          id_proyecto: this.tablaAgrupamientos[i].id_proyecto,
          id_agrupamiento: this.tablaAgrupamientos[i].id_agrupamiento,
          descripcion: this.tablaAgrupamientos[i].descripcion,
          orden: this.tablaAgrupamientos[i].orden,
          estado: this.tablaAgrupamientos[i].estado || 0
        });
      }
    }

    // 2. Preparar datos para enviar al backend
    const requestData = {
      agrupamientoEliminar: JSON.stringify(agrupamientoAEliminar),
      agrupamientosActualizar: JSON.stringify(agrupamientosAActualizar)
    }


    try {
      const resultado = await this.recursosHumanosService.eliminarAgrupamientoCompleto(requestData);

      if (resultado && resultado.id === "1") {
        // Eliminar localmente de la tabla

        // await this.listarPresInd();
        // await this.listarPanel();
        // await this.listarProgramacion();
        await this.estructurarTabla()

      } else {
        console.error('Error al eliminar agrupamiento:', resultado?.mensaje);
        SwalService.error(resultado?.mensaje || 'Error al eliminar agrupamiento');
      }

    } catch (error) {
      console.error('Error:', error);
      SwalService.error('Error al eliminar agrupamiento');
    }

    this.mostrar_carga_todo = false;
  }

  cerrarModal3() {
    this.modalAgregarElemento.hide();
  }

  async agregarElemento(index) {
    this.mostrar_carga_todo = true;
    const row = this.tablaAgrupamientos[index];
    const fecha = this.mes.value + '-' + this.anio.value;
    const existe = this.tablaAgrupamientos.find(ele => ele.descripcion == fecha)
    // Convertir la nueva fecha
    if (existe) {
      this.mostrar_carga_todo = false
      this.toaster.error(
        'Fecha ya existente',
        'Error',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return
    }
    const nuevaFecha = this.parsearFecha(fecha);

    // Buscar la posición correcta
    let posicionInsercion = index + 1;

    for (let i = index + 1; i < this.tablaAgrupamientos.length; i++) {
      const element = this.tablaAgrupamientos[i];
      if (!element.id_elemento) break;

      const fechaElemento = this.parsearFecha(element.descripcion);
      if (nuevaFecha <= fechaElemento) {
        posicionInsercion = i;
        break;
      }
      posicionInsercion = i + 1;
    }

    // CALCULAR ORDEN - LÓGICA SIMPLIFICADA
    let orden = 1;

    // Si hay elementos antes de la posición de inserción
    if (posicionInsercion > 0) {
      const elementoAnterior = this.tablaAgrupamientos[posicionInsercion - 1];
      if (elementoAnterior && elementoAnterior.orden !== undefined) {
        if (posicionInsercion === index + 1) {
          orden = 1;
        } else {
          orden = elementoAnterior.orden + 1;
        }
      }
    }

    // Guardar los elementos que necesitan actualización
    const elementosAActualizar = [];

    // Si estamos insertando en medio, necesitamos reordenar los elementos siguientes
    if (posicionInsercion < this.tablaAgrupamientos.length) {
      // Incrementar el orden de todos los elementos siguientes
      for (let i = posicionInsercion; i < this.tablaAgrupamientos.length; i++) {
        if (this.tablaAgrupamientos[i].orden !== undefined &&
          this.tablaAgrupamientos[i].id_elemento) {
          this.tablaAgrupamientos[i].orden += 1;
          // Guardar referencia para actualizar en BD
          elementosAActualizar.push({
            id_proyecto: this.tablaAgrupamientos[i].id_proyecto,
            id_elemento: this.tablaAgrupamientos[i].id_elemento,
            id_agrupamiento: this.tablaAgrupamientos[i].id_agrupamiento,
            descripcion: this.tablaAgrupamientos[i].descripcion,
            orden: this.tablaAgrupamientos[i].orden,
            estado: this.tablaAgrupamientos[i].estado || 0
          });
        }
      }
    }

    const elementoNuevo = {
      id_agrupamiento: row.id_agrupamiento,
      id_proyecto: row.id_proyecto,
      descripcion: fecha,
      orden: orden,
      estado: 0  // Estado por defecto
    };

    const requestData = {
      datos1: JSON.stringify(elementoNuevo),
      datos2: JSON.stringify(elementosAActualizar)
    }


    await this.guardarElemento(requestData);
    this.mostrar_carga_todo = false;
  }

  parsearFecha(fechaString: string): Date {
    const [mes, anio] = fechaString.split('-');
    const meses = {
      'ENERO': 0, 'FEBRERO': 1, 'MARZO': 2, 'ABRIL': 3, 'MAYO': 4, 'JUNIO': 5,
      'JULIO': 6, 'AGOSTO': 7, 'SEPTIEMBRE': 8, 'OCTUBRE': 9, 'NOVIEMBRE': 10, 'DICIEMBRE': 11
    };

    const mesNumero = meses[mes.toUpperCase()];
    const anioNumero = parseInt(anio);

    return new Date(anioNumero, mesNumero);
  }

  async guardarElemento(row) {
    try {
      const res = await this.recursosHumanosService.guardarElementoAgrupamiento(row);
      await this.listarPresInd();
      const suma = await this.listarProcuAsignado()
      await this.listarPanel(suma);
      await this.listarAgrupamientos(suma);
      this.cerrarModal3();
    } catch (error) {
      console.log(error);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  cerrarModal2() {
    this.modalActualizarAgrupado.hide();
  }

  async actualizarAgrupamiento() {
    try {
      const obj = {
        id_agrupamiento: this.id_agrupamiento.value,
        id_proyecto: this.idProyecto,
        estado: this.estado.value == true ? 2 : (this.tablaAgrupamientos[this.filSel].estado == null ? 0 : this.tablaAgrupamientos[this.filSel].estado),
        descripcion: this.descripcion.value
      }
      const resp = await this.recursosHumanosService.actualizarAgrupamientoExpTec(obj)
      this.cerrarModal2()
    } catch (error) {
      console.log(error)
      SwalService.error()
    }
  }

  openModal() {
    this.costosFiltrados = []
    this.formAgrupacion.reset()
    this.modalAgregarAgrupados.show();

    setTimeout(() => {
      const costos = this.tablaAgrupamientos.filter(ele => !ele.id_elemento);
      this.costosFiltrados = this.tablaPresInd.filter(ele =>
        ele.indice && !costos.some(costo => costo.indice === ele.indice)
      );
    });
  }

  cerrarModal() {
    this.costosFiltrados = []
    this.modalAgregarAgrupados.hide();

  }

  async guardarAgrupamiento() {
    try {
      this.mostrar_carga_todo = true
      if (this.formAgrupacion.invalid) {
        this.mostrar_carga_todo = false
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
      const existe = this.tablaAgrupamientos.find(ele => !ele.id_elemento && ele.indice == this.indice.value)
      if (existe) {
        this.mostrar_carga_todo = false
        this.toaster.error(
          'Costo relacionado ya asignado en otro agrupamiento',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      const cantidadAgrupamientos = (this.tablaAgrupamientos.filter(ele => !ele.id_elemento)).length
      const obj = {
        id_proyecto: this.idProyecto,
        descripcion: this.descripcion.value.trim(),
        indice: this.indice.value,
        orden: cantidadAgrupamientos + 1
      }
      const resp = await this.recursosHumanosService.guardarAgrupamientoExpTec(obj)
      // await this.listarPresInd();
      // await this.listarPanel();
      // await this.listarProgramacion();
      await this.estructurarTabla()
      this.mostrar_carga_todo = false
      this.cerrarModal()

    } catch (error) {
      console.log(error)
      SwalService.error()
    }


  }


  async listarAgrupamientos(suma) {
    const mesesMap: { [key: string]: string } = {
      'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
      'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
      'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
    };
    const input = { id_proyecto: this.idProyecto };
    const response = await this.recursosHumanosService.listarPrograConFechasLimite(input);
    this.anios = this.obtenerArrayAñosConMargen(response.calendario);

    // Crear mapa de reporte mensual
    const reporteMap = new Map();
    this.reporteMensual.forEach(reporte => {
      const key = `${this.obtenerNombreMes(reporte.mes.split('-')[0])}-${reporte.anio}`;
      reporteMap.set(key, { dias: reporte.cantidad_dias, monto: reporte.total_monto });
    });

    const tablaNueva = [];
    for (const element of this.tablaAgrupamientos) {
      tablaNueva.push(element);
      // const montoMensual = element.monto_presupuesto / response.calendario.length;
      let montoMensual = 0
      const pres_asignado = 0
      let dias_presu = 0
      response.calendario.forEach((ele, index) => {
        const key = `${ele.mes}-${ele.anio}`;

        const encontrado = this.dataCalendMat?.detalle[mesesMap[ele.mes] + '-' + ele.anio]
        montoMensual = encontrado ? encontrado?.monto : 0
        dias_presu = encontrado ? encontrado?.dias : 0
        const reporte = reporteMap.get(key) || { dias: 0, monto: 0 };

        const variacion_presu = montoMensual - reporte.monto;
        const variacion_plazo = dias_presu - reporte.dias; // 0 = dias_pres (expediente técnico)
        const porcentaje = montoMensual !== 0 ? (variacion_presu / montoMensual) * 100 : (reporte.monto !== 0 ? 100 : 0);
        const procentaje_proporcion = (montoMensual / element.monto_presupuesto) * 100;
        const montoPresAsign = (suma * procentaje_proporcion) / 100;
        tablaNueva.push({
          ...element,
          id_elemento: 1,
          descripcion: `${ele.mes}-${ele.anio}`,
          orden: index + 1,
          monto_presupuesto: montoMensual,
          dias_eje: reporte.dias,
          ejecucion_presu: reporte.monto,
          dias_pres: dias_presu,
          pres_asignado: montoPresAsign,
          variacion_plazo: variacion_plazo,
          variacion_presu: variacion_presu,
          porcentaje: porcentaje,
          mostrar: 1,
          icomost: 1,
          porcentajeTot: procentaje_proporcion
        });
      });
    }
    this.tablaAgrupamientos = tablaNueva;
  }

  private obtenerNombreMes(numeroMes: string): string {
    const meses: any = { '01': 'ENERO', '02': 'FEBRERO', '03': 'MARZO', '04': 'ABRIL', '05': 'MAYO', '06': 'JUNIO', '07': 'JULIO', '08': 'AGOSTO', '09': 'SEPTIEMBRE', '10': 'OCTUBRE', '11': 'NOVIEMBRE', '12': 'DICIEMBRE' };
    return meses[numeroMes] || numeroMes;
  }

  obtenerArrayAñosConMargen(calendario, margen = 2) {
    const todasLasFechas = calendario.flatMap(item => item.dias);
    const años = todasLasFechas.map(fecha => parseInt(fecha.split('-')[0]));

    const añoMin = Math.min(...años);
    const añoMax = Math.max(...años);

    const arrayAños = [];
    for (let año = añoMin - margen; año <= añoMax + margen; año++) {
      arrayAños.push(año);
    }

    return arrayAños;
  }

  verInfoMes(row) {

  }

  toggleOnpresu(row: any, index: number) {
    row.icomost = 1;
    let i = index + 1;
    while (i < this.tablaAgrupamientos.length && this.tablaAgrupamientos[i].id_elemento === 1) {
      this.tablaAgrupamientos[i].mostrar = 1;
      i++;
    }
  }

  toggleOffpresu(row: any, index: number) {
    row.icomost = 0;
    let i = index + 1;
    while (i < this.tablaAgrupamientos.length && this.tablaAgrupamientos[i].id_elemento === 1) {
      this.tablaAgrupamientos[i].mostrar = 0;
      i++;
    }
  }

  cerrarModalRHMensual() {
    this.modalRHMensual.hide()
  }
  async abrirModalRHMensual(row) {
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
    this.mostrar_carga_todo = true
    this.modalRHMensual.show()
    await this.filtrarPorMes(row)
    await this.filtroAcum()
    this.mostrar_carga_todo = false
  }

  async filtrarPorMes(row) {
    const consolidado = await this.procesosRhService.calendarioXAsignaciones(this.idProyecto)
    this.mesesAcum = consolidado.consolidadoPorMeses?.map(ele => { return ele.mes_key })
    this.areasAcum = consolidado.areas
    this.cargosAcum = consolidado.cargos
    this.consolidado = this.agregarEncabezadosArea(consolidado.consolidadoPorMeses);
    this.mesSelAcum = this.consolidado.findIndex(ele => ele.mes_key == row.descripcion)
    this.calendarioCompleto = consolidado.calendario
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

  async filtroListadoCargos() {
    this.mostrar_carga_todo = true
    this.tablaFiltrada = []
    this.totalMes = 0
    this.cantidadUsuariosDia = []
    // 1. Desactivar detección automática temporalmente
    this.cdRef.detach();

    // 2. Forzar un solo renderizado inicial
    this.cdRef.detectChanges();
    // this.mostrarSelColum = this.areaSeleccionada && this.cargoSeleccionada ? true : false

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
      let tablaNueva = []
      const montosAreas = await this.listarMontosAreaPresAnaliticoRH()
      // if (!this.areaSeleccionada) {
      let totalMes = 0
      for (const area of this.areas) {
        let letTotalAreas = 0
        const cargos = this.cargos.filter(ele => ele.id_area == area.id_area)
        let areagrupo = []
        for (const cargo of cargos) {
          let cargoTotal = 0
          const asignaciones = await this.asignaciones.filter(ele => ele.id_area == cargo.id_area && ele.id_cargo == cargo.id_cargo && this.verificarAsignacionEnMes(ele, mesFormateado))
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
                  descuentos: "0|10|10|0|100|100|0|0|0|0|0|0|0|100|100|0|0|0|0|0|0",
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
      // } else {
      //   let areaarray = []
      //   let totalMes = 0
      //   for (const area of this.areas) {
      //     let letTotalAreas = 0
      //     if (area.id_area == this.areaSeleccionada) {
      //       const areadata: filaTabla = {
      //         area: area.descripcion,
      //         cargo: null,
      //         descripcion_usuario: null,
      //         dias: diasMesVacios,
      //         estado: null,
      //         fecha_fin: '',
      //         fecha_inicio: '',
      //         id_area: area.id_area,
      //         id_asignacion: null,
      //         id_cargo: null,
      //         id_usuario: null,
      //         nro_grupo: null,
      //         total_jornada: null,
      //         coste_dia: null,
      //         coste_mensual: null,
      //         mostrar: true,
      //         asistenciaExistente: true,
      //         invalido: false,
      //         dias_dominicales: null,
      //         dias_feriados: null,
      //         dias_laborados: null,
      //         dias_otros: null,
      //         dias_permiso: null,
      //         dias_tardanzas: null,
      //         dias_faltados: null,
      //         descuentos: null,
      //         diasNoLaborables: null,
      //         feriadosSoloFecha: null,
      //         tipo_cargo: null,
      //         estado_pago: null,
      //         planilla_mensual_aprobada: null
      //       }
      //       areaarray.push(areadata)
      //       const cargos = this.cargos.filter(ele => ele.id_area == area.id_area)
      //       let cargosBuscar = []
      //       if (this.cargoSeleccionada) {
      //         const encontrado = cargos.find(ele => ele.id_cargo == this.cargoSeleccionada)
      //         if (encontrado) {
      //           cargosBuscar.push(encontrado)
      //         }
      //       } else {
      //         cargosBuscar = cargos
      //       }

      //       for (const cargo of cargosBuscar) {
      //         let cargoTotal = 0
      //         const asignaciones = await this.asignaciones.filter(ele => ele.id_area == cargo.id_area && ele.id_cargo == cargo.id_cargo)
      //         const cargoData: filaTabla = {
      //           area: area.descripcion,
      //           cargo: cargo.descripcion,
      //           descripcion_usuario: null,
      //           dias: diasMesVacios,
      //           estado: null,
      //           fecha_fin: '',
      //           fecha_inicio: '',
      //           id_area: area.id_area,
      //           id_asignacion: null,
      //           id_cargo: cargo.id_cargo,
      //           id_usuario: null,
      //           nro_grupo: null,
      //           total_jornada: null,
      //           coste_dia: null,
      //           coste_mensual: null,
      //           mostrar: true,
      //           asistenciaExistente: true,
      //           invalido: false,
      //           dias_dominicales: null,
      //           dias_feriados: null,
      //           dias_laborados: null,
      //           dias_otros: null,
      //           dias_permiso: null,
      //           dias_tardanzas: null,
      //           dias_faltados: null,
      //           descuentos: null,
      //           diasNoLaborables: null,
      //           feriadosSoloFecha: null,
      //           tipo_cargo: null,
      //           estado_pago: null,
      //           planilla_mensual_aprobada: null
      //         }

      //         areaarray.push(cargoData)
      //         let j = 1
      //         for (const usuario of asignaciones) {
      //           let dataHorario = datos[0].find(ele => ele.id_area == usuario.id_area)
      //           if (!dataHorario) {
      //             dataHorario = {
      //               id_configuracion: null,
      //               id_proyecto: usuario.id_proyecto,
      //               id_area: usuario.id_area,
      //               inicio_semana: 'LUNES',
      //               dias_nolaborables: 'DOMINGO',
      //               hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
      //               hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
      //               hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
      //               hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
      //               totales_dia: 48,
      //               descuentos: '|10|10||100|100|||||||',
      //               tardanza: 10,
      //               tiempo_extra: 0
      //             }
      //           }
      //           // const costesCargoHora = montosAreas.find(ele => ele.id_area == usuario.id_area && ele.tipo == "JORNAL DIARIO")?.cargos.find(ele => ele.id_cargo == usuario.id_cargo)
      //           const costesCargoDia = montosAreas.find(ele => ele.id_area == usuario.id_area && ele.tipo == ('JORNAL CATEGORIA ' + usuario.tipo_cargo))?.cargos.find(ele => ele.id_cargo == usuario.id_cargo)
      //           // let costeHora = costesCargoHora ? costesCargoHora.parcial : 0
      //           let costeDia = costesCargoDia ? costesCargoDia.parcial : 0
      //           const descuentos = dataHorario?.descuentos.split('|')
      //           const diasNoLaborables = dataHorario?.dias_nolaborables.split('|')
      //           const feriadosSoloFecha = datos[1].filter(ele => {
      //             const areas = ele.areas?.split('|');
      //             return areas && areas.includes(usuario.id_area.toString());
      //           }).map(ele => ele.fecha.split('T')[0]);
      //           const resusuario = await this.filtrarPorUsuario(registrosAsistencia, usuario.id_usuario, usuario.id_asignacion, descuentos, diasNoLaborables, feriadosSoloFecha, costeDia)
      //           const planilla_mensual_aprobada = await this.consultarPlanillaAprobada(usuario.id_usuario, usuario.id_proyecto, mesFormateado, usuario.id_area, usuario.id_cargo)

      //           const asignacionData: filaTabla = {
      //             area: area.descripcion,
      //             cargo: cargo.descripcion,
      //             descripcion_usuario: usuario.descripcion_usuario,
      //             dias: resusuario.registroMes,
      //             estado: usuario.estado,
      //             fecha_fin: usuario.fecha_fin,
      //             fecha_inicio: usuario.fecha_inicio,
      //             id_area: area.id_area,
      //             id_asignacion: usuario.id_asignacion,
      //             id_cargo: cargo.id_cargo,
      //             id_usuario: usuario.id_usuario,
      //             nro_grupo: j,
      //             total_jornada: 0,
      //             coste_dia: costeDia,
      //             coste_mensual: resusuario.montoMes,
      //             mostrar: true,
      //             asistenciaExistente: true,
      //             invalido: resusuario.invalido,
      //             dias_dominicales: resusuario.conteos.dias_dominicales,
      //             dias_faltados: resusuario.conteos.dias_faltados,
      //             dias_feriados: resusuario.conteos.dias_feriados,
      //             dias_laborados: resusuario.conteos.dias_laborados,
      //             dias_otros: resusuario.conteos.dias_otros,
      //             dias_permiso: resusuario.conteos.dias_permiso,
      //             dias_tardanzas: resusuario.conteos.dias_tardanzas,
      //             descuentos: descuentos,
      //             diasNoLaborables: diasNoLaborables,
      //             feriadosSoloFecha: feriadosSoloFecha,
      //             tipo_cargo: usuario.tipo_cargo,
      //             estado_pago: planilla_mensual_aprobada == null ? 0 : planilla_mensual_aprobada.estado_pago,
      //             planilla_mensual_aprobada: planilla_mensual_aprobada
      //           }
      //           cargoTotal += resusuario.montoMes
      //           areaarray.push(asignacionData)
      //           j++
      //         }
      //         letTotalAreas += cargoTotal
      //       }
      //     }
      //     totalMes += letTotalAreas
      //   }
      //   this.totalMes = totalMes
      //   tablaNueva = areaarray
      // }
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
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.cdRef.reattach();
      this.mostrar_carga_todo = false;
      this.cdRef.detectChanges();
    }
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

  async listarRegistrosAsistencia(fechaini, fechafin) {
    const obj = {
      id_proyecto: this.idProyecto,
      fecha_inicio: fechaini,
      fecha_fin: fechafin
    }
    const res = await this.recursosHumanosService.listarRegistrosAsistencia(obj)
    return res
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

  async listarAsignacionesProyecto() {
    this.mostrar_carga_todo = true
    this.meses = []
    const obj = {
      id_proyecto: this.idProyecto
    }
    const resp = await this.recursosHumanosService.listarAsignacionesProyecto(obj)
    // this.fechaMinima = resp.fecha_minima
    // this.fechaMaxima = resp.fecha_maxima
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
      { codigo: 'PE', tipo: 'PERMISO' },
      { codigo: 'D1', tipo: 'DESCUENTO OPCIONAL 1' },
      { codigo: 'D2', tipo: 'DESCUENTO OPCIONAL 2' },
      { codigo: 'D3', tipo: 'DESCUENTO OPCIONAL 3' },
      { codigo: 'OBS', tipo: 'OBSERVADO' },
      { codigo: 'IN', tipo: 'INCOMPLETO' },
      { codigo: 'TEX', tipo: 'TEXTRA' },
      { codigo: 'BN', tipo: 'BONO NO LABORABLE' },
      { codigo: 'BF', tipo: 'BONO FERIADO' },
      { codigo: 'B1', tipo: 'BONO OPCIONAL 1' },
      { codigo: 'B2', tipo: 'BONO OPCIONAL 2' },
      { codigo: 'B3', tipo: 'BONO OPCIONAL 3' },
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

  async filtroAcum() {

    // if (this.mesSelAcum === null || this.mesSelAcum === undefined) {
    //   this.toaster.error(
    //     'Seleccione un mes ',
    //     '',
    //     {
    //       closeButton: false,
    //       positionClass: 'toast-bottom-right',
    //       timeOut: 3000,
    //     }
    //   );
    //   return;
    // }

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
    await this.filtrarCalendarioPorMes(mesSeleccionado);
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


  async recuperarCalendario(fechaIniGrafico, fechaFinGrafico) {
    let data = []
    if (fechaIniGrafico && fechaFinGrafico) {

      const objeto = {
        id_proyecto: this.idProyecto,
        diasanterior: 7,
        diasposterior: 14, //agregar mas 1 dia por la libreria ,
        fechaini: fechaIniGrafico,
        fechafin: fechaFinGrafico
      }
      const response = await this.principalService.calendarioProgra2Fechas(objeto)
      if (!response) {
        this.dataHeader = []
        return
      }
      // response.map(ele => {
      //   ele.class = ''
      //   const fecha = ele.anio + '-' + ((ele.mes.length == 1) ? 0 + ele.mes : ele.mes) + '-' + ele.dia
      //   if (fecha == this.fechaActual) {
      //     ele.diaActual = true
      //     if (this.view_mode == 'Day') {
      //       ele.class = this.color_actual
      //     }
      //   } else {
      //     ele.diaActual = false
      //     if (ele.feriado && this.view_mode == 'Day') {
      //       ele.class = this.color_feriado
      //     }
      //     if (ele.nolabor && this.view_mode == 'Day') {
      //       ele.class = this.color_noLabo
      //     }
      //   }
      //   ele.width = 18
      // })
      this.dataHeader = await this.mesesCant(response)


    } else {
      data = []
      this.dataHeader = []
    }
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

  transformarCalendarioMaterialesCompleto(): { meses: { [key: string]: number }, total: number } {
    const resultado: { [key: string]: number } = {};
    let total = 0;

    const totalItem = this.calendarioMateriales.find(item => item.descripcion === 'total');

    if (totalItem && totalItem.meses) {
      for (let i = 0; i < totalItem.meses.length; i++) {
        // Usar mesesHeader que tiene la información del mes
        if (this.mesesHeader && this.mesesHeader[i]) {
          const mes = this.mesesHeader[i].mes;
          const anio = this.yearsHeader.find(y => y.col > i)?.year || new Date().getFullYear();
          const mesKey = `${mes.toString().padStart(2, '0')}-${anio}`;
          resultado[mesKey] = parseFloat(totalItem.meses[i]);
        } else {
          // Fallback si no hay datos
          resultado[`mes_${i + 1}`] = parseFloat(totalItem.meses[i]);
        }
      }
      total = parseFloat(totalItem.parcial);
    }

    return { meses: resultado, total: total };
  }

  obtenerDiasPorMesDesdeTablaDesembolso(): { [key: string]: number } {
    const resultado: { [key: string]: number } = {};

    // Recorrer tablaDesembolso
    for (const partida of this.tablaDesembolso) {
      if (!partida.unidad || !partida.meses) continue;

      for (let i = 0; i < partida.meses.length; i++) {
        const mesData = partida.meses[i];
        if (mesData && mesData.dias && mesData.dias > 0) {
          // Obtener la clave del mes
          let mesKey = `mes_${i + 1}`;
          if (this.mesesHeader && this.mesesHeader[i]) {
            const mesNum = this.mesesHeader[i].mes;
            let yearIndex = 0;
            let acumulado = 0;
            for (let y = 0; y < this.yearsHeader.length; y++) {
              acumulado += this.yearsHeader[y].col;
              if (i < acumulado) {
                yearIndex = y;
                break;
              }
            }
            const anio = this.yearsHeader[yearIndex]?.year || new Date().getFullYear();
            mesKey = `${mesNum.toString().padStart(2, '0')}-${anio}`;
          }

          resultado[mesKey] = (resultado[mesKey] || 0) + mesData.dias;
        }
      }
    }

    return resultado;
  }

  obtenerMontosPorMes(): { [key: string]: number } {
    const resultado: { [key: string]: number } = {};

    // Buscar el total de MANO DE OBRA en calendarioMateriales
    const totalItem = this.calendarioMateriales?.find(item =>
      item.descripcion === 'total' && item.id_tipo_insumo === 1
    );

    if (totalItem && totalItem.meses) {
      for (let i = 0; i < totalItem.meses.length; i++) {
        const monto = parseFloat(totalItem.meses[i]);
        if (monto !== 0) {
          let mesKey = `mes_${i + 1}`;
          if (this.mesesHeader && this.mesesHeader[i]) {
            const mesNum = this.mesesHeader[i].mes;
            let yearIndex = 0;
            let acumulado = 0;
            for (let y = 0; y < this.yearsHeader.length; y++) {
              acumulado += this.yearsHeader[y].col;
              if (i < acumulado) {
                yearIndex = y;
                break;
              }
            }
            const anio = this.yearsHeader[yearIndex]?.year || new Date().getFullYear();
            mesKey = `${mesNum.toString().padStart(2, '0')}-${anio}`;
          }
          resultado[mesKey] = monto;
        }
      }
    }

    return resultado;
  }
  calcularDiasUnicosPorMes(
    calendariomateriales: Insumo[],
    idTipoInsumo: number | string,
    dataHeader: DataHeader[]
  ): number[] {

    // Buscar el insumo del tipo específico
    const insumoFiltrado = calendariomateriales.find(
      item => item.id_tipo_insumo == idTipoInsumo
    );

    // Recoger todas las partidas con fechas
    let todasLasPartidas: Partida[] = [];

    if (insumoFiltrado?.partidas?.length) {
      // Si el insumo tiene partidas, usarlas
      todasLasPartidas = insumoFiltrado.partidas.filter(
        partida => partida.inicio && partida.fin
      );
    } else {
      // Buscar en todos los calendariomateriales las partidas con fechas
      for (const item of calendariomateriales) {
        if (item.partidas?.length) {
          for (const partida of item.partidas) {
            if (partida.inicio && partida.fin) {
              todasLasPartidas.push(partida);
            }
          }
        }
      }
    }

    if (todasLasPartidas.length === 0) {
      return new Array(dataHeader.length).fill(0);
    }

    // Precalcular rangos mensuales
    const rangosMensuales = this.precalcularRangosMensuales(dataHeader);

    // Usar Set para almacenar días únicos por mes
    const diasPorMesSet: Set<number>[] = dataHeader.map(() => new Set<number>());


    // Procesar cada partida
    for (const partida of todasLasPartidas) {
      if (!partida.inicio || !partida.fin) continue;

      const partidaInicio = new Date(partida.inicio);
      const partidaFin = new Date(partida.fin);

      if (isNaN(partidaInicio.getTime()) || isNaN(partidaFin.getTime())) {
        continue;
      }


      // Para cada mes que intersecta
      for (let i = 0; i < rangosMensuales.length; i++) {
        const mes = rangosMensuales[i];

        const interseccionInicio = new Date(Math.max(partidaInicio.getTime(), mes.inicio.getTime()));
        const interseccionFin = new Date(Math.min(partidaFin.getTime(), mes.fin.getTime()));

        if (interseccionInicio <= interseccionFin) {
          const startDay = interseccionInicio.getDate();
          const endDay = interseccionFin.getDate();

          for (let dia = startDay; dia <= endDay; dia++) {
            diasPorMesSet[i].add(dia);
          }
        }
      }
    }

    const resultados = diasPorMesSet.map(set => set.size);

    return resultados;
  }

  /**
   * Precalcula los rangos de fechas para cada mes según dataHeader
   */
  precalcularRangosMensuales(dataHeader: DataHeader[]): { inicio: Date; fin: Date }[] {
    const mesesMap: Record<string, number> = {
      'ENERO': 0, 'FEBRERO': 1, 'MARZO': 2, 'ABRIL': 3,
      'MAYO': 4, 'JUNIO': 5, 'JULIO': 6, 'AGOSTO': 7,
      'SETIEMBRE': 8, 'OCTUBRE': 9, 'NOVIEMBRE': 10, 'DICIEMBRE': 11
    };

    return dataHeader.map(header => {
      const [nombreMes, añoStr] = header.nombre.split(' - ');
      const mes = mesesMap[nombreMes];
      const año = parseInt(añoStr);

      const ultimoDiaMes = new Date(año, mes + 1, 0);
      let inicio: Date, fin: Date;

      if (header.cantidad >= 28) {
        // Mes completo
        inicio = new Date(año, mes, 1);
        fin = ultimoDiaMes;
      } else {
        // Mes parcial (últimos N días)
        inicio = new Date(año, mes + 1, 0);
        inicio.setDate(ultimoDiaMes.getDate() - header.cantidad + 1);
        fin = ultimoDiaMes;
      }

      return { inicio, fin };
    });
  }
  async generarCalendarioMaterialesPorTipo(tipo: 'MANO DE OBRA' | 'MATERIALES' | 'EQUIPOS' | 'SUBCONTRATOS') {
    try {
      const tipoMap: Record<string, number> = {
        'MANO DE OBRA': 1,
        'MATERIALES': 2,
        'EQUIPOS': 3,
        'SUBCONTRATOS': 4
      };

      const idTipo = tipoMap[tipo];
      // Asegurar que el calendario esté generado con los días calculados
      if (!this.calendarioMateriales || this.calendarioMateriales.length === 0) {
        await this.generarCalendarioMaterialesConDias(); // Usar la versión que calcula días
      }

      // Buscar la fila "total" para este tipo
      const insumoBase = this.calendarioMateriales.find(
        item => item.id_tipo_insumo === idTipo && item.descripcion === "total"
      );

      if (!insumoBase) {
        console.warn(`No se encontró fila "total" para tipo ${tipo} con id ${idTipo}`);

        return {
          tipo,
          idTipo,
          parcial: 0,
          detalle: {}
        };
      }



      // Calcular días por mes usando las partidas
      const diasPorMes = this.calcularDiasUnicosPorMes(
        this.calendarioMateriales,
        idTipo,
        this.dataHeader
      );

      // Obtener montos y parcial desde la fila "total"
      const meses = insumoBase.meses || new Array(this.dataHeader.length).fill("0.00");
      const parcial = insumoBase.parcial || "0";

      // Crear detalle con formato MM-YYYY
      const detalle: Record<string, { dias: number; monto: number }> = {};

      this.dataHeader.forEach((header, index) => {
        const mesFormateado = this.formatearMes(header.nombre);
        const montoMensual = parseFloat(meses[index] || "0");

        detalle[mesFormateado] = {
          dias: diasPorMes[index],
          monto: montoMensual
        };
      });



      return {
        tipo,
        idTipo,
        parcial: parseFloat(parcial),
        detalle
      };
    } catch (error) {
      console.error(`Error al generar calendario para ${tipo}:`, error);
      return {
        tipo,
        parcial: 0,
        detalle: {}
      };
    }
  }

  async generarCalendarioMaterialesConDias() {
    // Llamar a tu función original
    await this.generarCalendarioMateriales();

    // Calcular los días por mes para todas las partidas
    this.calcularDiasPorMesEnPartidas();

  }

  calcularDiasPorMesEnPartidas() {
    if (!this.calendarioMateriales || !this.dataHeader) return;

    // Recorrer todos los items del calendario
    for (const item of this.calendarioMateriales) {
      // Si tiene partidas, calcular días para cada una
      if (item.partidas && item.partidas.length > 0) {
        for (const partida of item.partidas) {
          if (partida.inicio && partida.fin) {
            partida.diasPorMes = this.calcularDiasPorPartida(partida, this.dataHeader);
          } else {
            partida.diasPorMes = new Array(this.dataHeader.length).fill(0);
          }
        }
      }
    }

  }

  async obtenerFilaTotalPorTipo(idTipo: number) {
    if (!this.calendarioMateriales || this.calendarioMateriales.length === 0) {
      await this.generarCalendarioMateriales();
    }

    // Buscar específicamente la fila con id_tipo_insumo y descripcion "total"
    const filaTotal = this.calendarioMateriales.find(
      item => item.id_tipo_insumo === idTipo && item.descripcion === "total"
    );

    if (filaTotal) {

      return filaTotal;
    } else {
      console.warn(`No se encontró fila con descripcion "total" para id_tipo_insumo ${idTipo}`);
      return null;
    }
  }

  async generarDiasPorMesParaTodosLosTipos() {
    try {
      if (!this.calendarioMateriales || this.calendarioMateriales.length === 0) {
        await this.generarCalendarioMateriales();
      }

      const tipos = ['MANO DE OBRA', 'MATERIALES', 'EQUIPOS', 'SUBCONTRATOS'];
      const resultados: Record<string, any> = {};

      for (const tipo of tipos) {
        const idTipo = tipo === 'MANO DE OBRA' ? 1 : tipo === 'MATERIALES' ? 2 : tipo === 'EQUIPOS' ? 3 : 4;

        // IMPORTANTE: Filtrar la fila que tiene id_tipo_insumo Y descripcion = "total"
        const insumoFiltrado = this.calendarioMateriales.find(
          item => item.id_tipo_insumo == idTipo && item.descripcion === "total"
        );

        // Si no encuentra la fila de total, buscar cualquier otra con ese id_tipo_insumo
        const insumoAlternativo = !insumoFiltrado ? this.calendarioMateriales.find(
          item => item.id_tipo_insumo == idTipo
        ) : null;

        const insumoBase = insumoFiltrado || insumoAlternativo;

        // Calcular días por mes
        const diasPorMes = this.calcularDiasUnicosPorMes(
          this.calendarioMateriales,
          idTipo,
          this.dataHeader
        );

        // Obtener los montos mensuales del insumo filtrado (fila de total)
        const meses = insumoBase?.meses || new Array(this.dataHeader.length).fill("0.00");
        const parcial = insumoBase?.parcial || "0";

        // Crear detalle con formato MM-YYYY y valores combinados
        const detalle: Record<string, { dias: number; monto: number }> = {};

        this.dataHeader.forEach((header, index) => {
          // Convertir "MES - AÑO" a "MM-YYYY"
          const mesFormateado = this.formatearMes(header.nombre);
          const montoMensual = parseFloat(meses[index] || "0");

          detalle[mesFormateado] = {
            dias: diasPorMes[index],
            monto: montoMensual
          };
        });

        resultados[tipo] = {
          idTipo,
          parcial: parseFloat(parcial),
          detalle,
          // Información adicional para depuración
          _debug: {
            encontradoFilaTotal: !!insumoFiltrado,
            descripcion: insumoBase?.descripcion,
            cantidad: insumoBase?.cantidad
          }
        };
      }

      return resultados;
    } catch (error) {
      console.error('Error al generar días por mes:', error);
      return {};
    }
  }

  /**
   * Actualiza los objetos de calendario agregando los días por mes calculados
   */
  actualizarCalendarioConDiasPorMes() {
    if (!this.calendarioMateriales || !this.dataHeader) return;

    for (const item of this.calendarioMateriales) {
      if (item.id_tipo_insumo && typeof item.id_tipo_insumo === 'number') {
        const diasPorMes = this.calcularDiasUnicosPorMes(
          this.calendarioMateriales,
          item.id_tipo_insumo,
          this.dataHeader
        );

        item.diasPorMes = diasPorMes;
        item.diasPorMesDetalle = this.dataHeader.reduce((acc, header, idx) => {
          acc[header.nombre] = diasPorMes[idx];
          return acc;
        }, {} as Record<string, number>);
      }

      // También actualizar las partidas individuales si es necesario
      if (item.partidas) {
        for (const partida of item.partidas) {
          if (partida.inicio && partida.fin) {
            partida.diasPorMes = this.calcularDiasPorPartida(partida, this.dataHeader);
          }
        }
      }
    }

  }

  /**
   * Calcula los días por mes para una partida específica
   */
  calcularDiasPorPartida(partida: Partida, dataHeader: DataHeader[]): number[] {
    if (!partida.inicio || !partida.fin) return new Array(dataHeader.length).fill(0);

    const rangosMensuales = this.precalcularRangosMensuales(dataHeader);
    const partidaInicio = new Date(partida.inicio);
    const partidaFin = new Date(partida.fin);
    const diasPorMes: number[] = new Array(dataHeader.length).fill(0);

    for (let i = 0; i < rangosMensuales.length; i++) {
      const mes = rangosMensuales[i];
      const interseccionInicio = new Date(Math.max(partidaInicio.getTime(), mes.inicio.getTime()));
      const interseccionFin = new Date(Math.min(partidaFin.getTime(), mes.fin.getTime()));

      if (interseccionInicio <= interseccionFin) {
        const diffTime = Math.abs(interseccionFin.getTime() - interseccionInicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        diasPorMes[i] = diffDays;
      }
    }

    return diasPorMes;
  }

  formatearMes(nombreMes: string): string {
    const mesesMap: Record<string, string> = {
      'ENERO': '01',
      'FEBRERO': '02',
      'MARZO': '03',
      'ABRIL': '04',
      'MAYO': '05',
      'JUNIO': '06',
      'JULIO': '07',
      'AGOSTO': '08',
      'SETIEMBRE': '09',
      'OCTUBRE': '10',
      'NOVIEMBRE': '11',
      'DICIEMBRE': '12'
    };

    const [mes, anio] = nombreMes.split(' - ');
    const mesNumero = mesesMap[mes];
    return `${mesNumero}-${anio}`;
  }

  async obtenerCalendarioCompletoPorTipo(tipo: 'MANO DE OBRA' | 'MATERIALES' | 'EQUIPOS' | 'SUBCONTRATOS') {
    const resultado = await this.generarCalendarioMaterialesPorTipo(tipo);

    // Validación adicional para asegurar que los montos son correctos
    const montosArray = Object.values(resultado.detalle).map(item => item.monto);
    const sumaMontos = montosArray.reduce((sum, monto) => sum + monto, 0);
    const parcialNumerico = resultado.parcial;


    if (Math.abs(sumaMontos - parcialNumerico) > 0.01) {
      console.warn(`⚠️ Discrepancia en montos para ${tipo}`);
    }

    return {
      ...resultado,
      validacion: {
        sumaMontos: sumaMontos,
        parcialRegistrado: parcialNumerico,
        esConsistente: Math.abs(sumaMontos - parcialNumerico) <= 0.01
      }
    };
  }
}



