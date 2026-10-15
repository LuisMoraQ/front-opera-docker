import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { EquiposServiciosService } from 'src/app/servicios/equipos-servicios.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, concatMap, debounceTime, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HostListener } from '@angular/core';
import Swal from 'sweetalert2';
import { PrincipalService } from 'src/app/servicios/principal.service';
import * as moment from 'moment';
import { FormsService } from 'src/app/servicios/forms.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

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

export interface ItemMetradoDiario {
  id_metrado?: number;
  id_proyecto?: number;
  indice?: number;
  fecha?: string;
  tipo?: number | null; // 1: Metrado, 2: Submetrado, 3: Título, 4: Texto | null: Fila Vacía
  index_elemento_gp?: number | null;
  index_titulo?: number | null;
  descripcion?: string;
  cantidad?: string | number;
  n_veces?: string | number;
  longitud?: string | number;
  ancho?: string | number;
  alto?: string | number;
  detalle1?: string;
  detalle2?: string;
  subtotal?: number; // Representa PARCIAL en UI
  total?: number;    // Representa SUBTOTAL/ACUMULADO en UI
  formula?: string;
  editarCopiar?: Boolean;
  // Propiedades de UI para interactividad
  seleccionado?: boolean;
  expandido?: boolean;
  oculto?: boolean;
  id_fila?: string; // UID temporal para tracking en tabla
}

interface ResultadoGuardado {
  ok: boolean;
  sinCambios?: boolean;
  res?: any;
  err?: any;
}
@Component({
  selector: 'app-metrado-mensual',
  templateUrl: './metrado-mensual.component.html',
  styleUrls: ['./metrado-mensual.component.scss']
})
export class MetradoMensualComponent implements OnInit, OnDestroy {
  @ViewChild('inputFx') inputFx?: ElementRef<HTMLInputElement>;

  @Input('height') height: number = 100;
  subvista = 1;
  scrollbut = false;
  scrollbut2 = false;
  prueba;
  id_proyecto;
  solover;
  moneda;
  decima;
  colores;
  tipoProy;
  id_userproy;
  nomproy = '';
  simbolo;
  dec_metrado;
  mesSeleccionado: string = '';
  listaMesesProyecto: any[] = [];
  cabeceraDias: any[] = [];
  partidas: any[] = [];

  columnasEstatica: boolean = false;
  todosExpandidos: boolean = true;
  selFilPlan: number = -1;
  selFilPlanIndice: number = -1;
  listaPlanillaEjecutada: any[] = []
  // listaMetradosDiarios: any[] = []
  mostrar_carga_todo = false
  activarDiario: boolean = false;
  diaSeleccionado: string | null = null;
  partidaSeleccionada: any = null;
  titulo1
  titulo1color
  titulo1letra
  aspectos: any;
  MIN_FILAS: number = 20; // Variable global configurable
  listaMetradosDiarios: ItemMetradoDiario[] = [];

  // Selección y portapapeles
  filaExcelSel: ItemMetradoDiario | null = null;
  metradoSeleccionado: ItemMetradoDiario | null = null;
  idxSeleccionado: number = -1;

  // Estados para Copiado/Cortado
  habilitadoCopiar: boolean = false;
  copiadoCeldas: boolean = false;
  arrayCopiadosMetrado: ItemMetradoDiario[] = [];
  // celdasCopiadosMetrado: any[][] = [];

  // Selección matricial de celdas
  primerClickCelda: { fila: number, col: number } | null = null;
  segundoClickCelda: { fila: number, col: number } | null = null;
  cantFil = 20
  totalGeneralMetrados: number = 0;

  private guardar$ = new Subject<void>();
  private guardando = false;
  private cambiosPendientes = false;
  habEditFormula = false
  // private readonly FORMULA_DEFAULT = 'B*C*D*E*F*G*H';
  private readonly FORMULA_DEFAULT = 'B*C*D*E*F*G';
  // private readonly LETRAS_VALIDAS = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];
  private readonly LETRAS_VALIDAS = ['B', 'C', 'D', 'E', 'F', 'G'];
  private guardadoEnVuelo = false;
  // Mapa letra → campo del modelo
  private subGuardar?: Subscription;
  // private readonly MAPA_LETRAS: Record<string, keyof ItemMetradoDiario> = {
  //   B: 'detalle1',
  //   C: 'detalle2',
  //   D: 'cantidad',
  //   E: 'n_veces',
  //   F: 'longitud',
  //   G: 'ancho',
  //   H: 'alto',
  // };
  private readonly MAPA_LETRAS: Record<string, keyof ItemMetradoDiario> = {
    B: 'detalle1',
    C: 'cantidad',
    D: 'n_veces',
    E: 'longitud',
    F: 'ancho',
    G: 'alto',
  };
  tempFormula: string[] = [];
  formulaCopiada: string | null = null;
  formulaTemporal = '';
  private _keyProcessing = false;

  todosCheck = false;
  filasCopiadas: ItemMetradoDiario[] = [];
  arrayCortados = []
  // Celda inicio de la selección
  celdaInicio: { fila: number; columna: string } | null = null;

  // Celda fin de la selección
  celdaFin: { fila: number; columna: string } | null = null;

  // Celdas copiadas: array de { filaOrigen, columna, valor }
  celdasCopiadosMetrado: Array<{
    filaOrigen: number;
    columna: string;
    valor: any;
    filaOffset: number;   // 🆕
    colOffset: number;    // 🆕
  }> = [];
  bloqueCopiado = { alto: 0, ancho: 0 };
  // readonly COLUMNAS_EDITABLES = ['descripcion', 'detalle1', 'detalle2', 'cantidad', 'n_veces', 'longitud', 'ancho', 'alto'];
  readonly COLUMNAS_EDITABLES = ['descripcion', 'detalle1', /* 'detalle2', */ 'cantidad', 'n_veces', 'longitud', 'ancho', 'alto'];
  ultimaCeldaSeleccionada: string | null = null;
  @Input() set tabproyecto(value: any) {
    this.prueba = value;
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    this.id_userproy = datosrec.value.id_usuario;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    this.moneda = datosproy.get('moneda').value.toString() == '0' ? 'S/' : '$';
    this.simbolo = datosrec.value.simbolo;
    this.nomproy = this.id_userproy = datosrec.value.descripcion;
    this.dec_metrado = this.prueba.value.decimal.split('|')[0] ?? 2;
    this.aspectos = JSON.parse(this.colores);
  }
  private _shortcutProcessing = false;
  private _shortcutBlocked = false;
  filasParaEliminar: ItemMetradoDiario[] = [];
  private readonly DEBOUNCE_MS = 3000
  private focusTimeout?: ReturnType<typeof setTimeout>;
  private cancelarDebounce$ = new Subject<void>();
  private hayCambiosSinGuardar = false;
  tablaCopiada: ItemMetradoDiario[] | null = null;

  readonly MAX_LENGTHS: Record<string, number> = {
    descripcion: 1000,
    detalle1: 1000,
    detalle2: 1000,
    cantidad: 500,
    n_veces: 500,
    longitud: 500,
    ancho: 500,
    alto: 500,
  };
  partidasDelTitulo: any[] = [];

  // Datos RS2 (metrados del índice)
  partidasPlanilla: any[] = [];

  // Plantilla actual (RS3) — ya la tienes
  plantillaActual: any = null;

  // Columnas de la plantilla ordenadas (precalculadas)
  columnasPlantilla: Array<{ key: string; label: string; orden: number }> = [];

  // Selección de celdas en la planilla
  copiadoCeldasPlanilla = false;
  celdaInicioPlanilla: { fila: number; columna: string } | null = null;
  celdaFinPlanilla: { fila: number; columna: string } | null = null;

  // Buffer de celdas copiadas desde la planilla
  celdasCopiadasDesdePlanilla: Array<{ filaOrigen: number; columna: string; valor: any }> = [];
  idxSeleccionadoPlanilla: number = -1;
  private readonly MAPA_KEYS_PLANTILLA: Record<string, string> = {
    // Plantilla / RS2 (top_metrados) → Tabla principal (ItemMetradoDiario)
    'descripcion': 'descripcion',
    'detalle': 'detalle1',    // top_metrados.detalle     → ItemMetradoDiario.detalle1
    'cantidad': 'cantidad',
    'nveces': 'n_veces',     // top_metrados.nveces      → ItemMetradoDiario.n_veces
    'glongitud': 'longitud',    // top_metrados.glongitud   → ItemMetradoDiario.longitud
    'dancho': 'ancho',       // top_metrados.dancho      → ItemMetradoDiario.ancho
    'daltura': 'alto',        // top_metrados.daltura     → ItemMetradoDiario.alto
    // Sin destino en ItemMetradoDiario → se ignoran al pegar
    // 'item', 'factor1', 'factor2', 'factor3', 'gancho', 'galtura',
    // 'dlongitud', 'area', 'volumen', 'unidad', 'mtotal', 'formula'
  };

  columnasFijas: boolean = false;

  partidasDetalle: any[] = [];
  cabeceraDiasDetalle: any[] = [];
  mesSeleccionadoDetalle: string = '';
  listaMesesProyectoDetalle: any[] = [];

  // Sets de expandidos (para no tocar 'partidas')
  partidasDetalleExpandidas = new Set<number>();
  detallesOcultos = new Set<number>();   // id_fila de detalles ocultos
  idxSeleccionadoDetalle: number = -1;   // índice de la partida
  idxDetalleSeleccionado: number = -1;   // índice del detalle dentro de la partida

  estadoResumen: any = {
    total_partidas: 0,
    con_registro: 0,
    en_proceso: 0,
    valor_planificado: 0,
    valor_ejecutado: 0,
    avance_general: 0
  };

  estadoMeses: any[] = [];

  estadoTotales: any = {
    total_planificado: 0,
    total_ejecutado: 0,
    desviacion_total: 0,
    avance_general: 0
  };

  versions = []
  version = null
  aspectosdias: any;
  tablaferiados = [];
  arrayDiasNoLabEdit = [];
  dataProyecto = null;
  noLaborables = [];
  plazoHabil: number = 0;
  ffProyecto: any;
  fiProyecto: any;
  FFRestriccion: string;
  dataPrincipal = []
  uidsOrdenados: any[] = [];
  tablaIdGantt: filaProgramacion[] = [];
  dec_parcial = 2
  ultimoidGantt = null;
  id_usuario = null
  fechaIniGrafico: string = '';
  fechaFinalGrafico: string = '';
  dataHeader: any = [];
  ffLimite: any;
  fiLimite: any;
  totalesDesembolso = []
  sumaTotalParciales = null
  tablaDesembolso = []
  mesesHeader = [];
  yearsHeader = [];
  porcentajesDesembolso: any[] = [];
  listaInsumos = []
  valorPlanificadoPorMes: Record<string, number> = {};
  constructor(private _EncriptadorService: EncriptadorService, public formsService: FormsService, private principalService: PrincipalService, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer, private equiposServiciosService: EquiposServiciosService, private RecursosHumanosService: RecursosHumanosService, private toaster: ToastrService,) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      await this.cargarCalendario()
      this.pintar()
      this.inicializarColaGuardado();
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      SwalService.error()
      console.log(error)
    }

  }


  /** Devuelve el índice de la columna dentro de COLUMNAS_EDITABLES */
  private idxColumna(columna: string): number {
    return this.COLUMNAS_EDITABLES.indexOf(columna);
  }

  trackByFila(index: number, item: ItemMetradoDiario): any {
    return item.id_fila || item.id_metrado || index;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.metaKey) return;
    if (event.repeat) { event.preventDefault(); return; }

    const target = event.target as HTMLElement;
    if (target?.id === 'inputFormulaMet') return;

    // 🔑 Bloquear solo si es la MISMA tecla en el mismo tick
    const key = event.key;
    if (this._shortcutBlocked) {
      event.preventDefault();
      return;
    }
    this._shortcutBlocked = true;
    // Se libera en el próximo frame (~16ms)
    requestAnimationFrame(() => { this._shortcutBlocked = false; });

    switch (key) {
      case 'ArrowUp': event.preventDefault(); event.stopPropagation(); if (this.filaExcelSel) this.moverArriba(); break;
      case 'ArrowDown': event.preventDefault(); event.stopPropagation(); if (this.filaExcelSel) this.moverAbajo(); break;
      case 'ArrowLeft': event.preventDefault(); event.stopPropagation(); if (this.filaExcelSel) this.subirNivelfila(null); break;
      case 'ArrowRight': event.preventDefault(); event.stopPropagation(); if (this.filaExcelSel) this.bajarNivel(null); break;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  async onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.guardando || this.cambiosPendientes || this.filasParaEliminar.length) {
      await this.flushGuardado();
    }
  }

  async onPasteInput(event: ClipboardEvent, fila: number, columna: string) {
    console.log('=== onPasteInput ===');
    console.log('fila:', fila, 'columna:', columna);
    console.log('target:', event.target);
    console.log('clipboardData:', event.clipboardData);

    // Si el foco está en el input de fórmula, no interferir
    const target = event.target as HTMLElement | null;
    if (target?.id === 'inputFormulaMet') return;

    // Actualizar la selección (por si el usuario hizo clic sin mover el cursor)
    this.idxSeleccionado = fila;
    this.ultimaCeldaSeleccionada = columna;
    this.filaExcelSel = this.listaMetradosDiarios[fila] ?? null;
    this.metradoSeleccionado = this.filaExcelSel;

    const texto = event.clipboardData?.getData('text/plain') ?? '';
    console.log('texto pegado:', JSON.stringify(texto));
    if (!texto) return;

    // Detectar si es matriz (Excel) o texto plano
    const esMatriz = texto.includes('\t') || texto.includes('\n');

    if (esMatriz) {
      event.preventDefault();   // Solo bloqueamos si es matriz
      await this.pegarMatrizDesdePortapapeles(texto, fila, columna);
      return;
    }

    // Texto plano → SÍ interceptamos para aplicar maxlength
    event.preventDefault();
    this.pegarTextoPlano(texto, fila, columna);
  }

  private pegarTextoPlano(texto: string, fila: number, columna: string) {
    const item = this.listaMetradosDiarios[fila];
    if (!item) return;

    const max = this.MAX_LENGTHS[columna] ?? 500;

    // Normalizar: quitar saltos de línea, trim
    let valor = texto.replace(/[\r\n]+/g, ' ').trim();

    // Truncar al límite de BD
    if (valor.length > max) {
      valor = valor.substring(0, max);
      this.toaster.warning(`Texto truncado a ${max} caracteres`, '', { timeOut: 2500 });
    }

    // Normalizar números si es columna numérica
    if (['detalle1',
      // 'detalle2', 
      'cantidad', 'n_veces', 'longitud', 'ancho', 'alto'].includes(columna)) {
      valor = this.normalizarNumero(valor);
    }

    (item as any)[columna] = valor;

    // Si la fila era vacía y ahora tiene contenido, asignarle tipo
    if (item.tipo == null && this.tieneContenido(item)) {
      item.tipo = 1;
      this.validarEstructuraDespuesDeCambio(this.idxSeleccionado);
    }

    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();
    this.toaster.success('Pegado', '', { timeOut: 1200 });
  }

  private async pegarMatrizDesdePortapapeles(texto: string, filaInicio: number, colInicio: string) {
    // Parsear
    const filasTexto = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    if (filasTexto.length > 0 && filasTexto[filasTexto.length - 1].trim() === '') {
      filasTexto.pop();
    }
    const matriz: string[][] = filasTexto.map(f => f.split('\t'));
    if (!matriz.length) return;

    // Confirmación si es grande
    if (matriz.length > 5 || (matriz[0]?.length ?? 0) > 3) {
      const result = await Swal.fire({
        title: '¿Pegar matriz?',
        html: `Se pegarán <b>${matriz.length}</b> fila(s) × <b>${matriz[0]?.length ?? 0}</b> columna(s) desde la celda actual.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, pegar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });
      if (!result.isConfirmed) return;
    }

    const colDestinoIdx = this.idxColumna(colInicio);
    if (colDestinoIdx < 0) return;

    let celdasPegadas = 0;
    let celdasTruncadas = 0;

    for (let fr = 0; fr < matriz.length; fr++) {
      const filaDest = filaInicio + fr;
      if (filaDest >= this.listaMetradosDiarios.length) break;

      const filaObj = this.listaMetradosDiarios[filaDest];

      for (let fc = 0; fc < matriz[fr].length; fc++) {
        const colDestIdx = colDestinoIdx + fc;
        if (colDestIdx >= this.COLUMNAS_EDITABLES.length) break;

        const columna = this.COLUMNAS_EDITABLES[colDestIdx];
        const max = this.MAX_LENGTHS[columna] ?? 500;

        let valor = (matriz[fr][fc] ?? '').toString();

        if (valor.length > max) {
          valor = valor.substring(0, max);
          celdasTruncadas++;
        }

        if (['detalle1',
          // 'detalle2', 
          'cantidad', 'n_veces', 'longitud', 'ancho', 'alto'].includes(columna)) {
          valor = this.normalizarNumero(valor);
        }

        (filaObj as any)[columna] = valor;

        if (filaObj.tipo == null && this.tieneContenido(filaObj)) {
          filaObj.tipo = 1;
        }

        celdasPegadas++;
      }
    }

    this.validarEstructuraDespuesDeCambio(filaInicio);
    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();

    let msg = `${celdasPegadas} celda(s) pegadas`;
    if (celdasTruncadas > 0) msg += `, ${celdasTruncadas} truncada(s)`;
    this.toaster.success(msg, '', { timeOut: 2500 });
  }

  private obtenerRangoBloque(idx: number): { inicio: number; fin: number } {
    const lista = this.listaMetradosDiarios;
    const item = lista[idx];
    if (!item) return { inicio: idx, fin: idx + 1 };

    // 🔑 TÍTULO (3) → solo esa fila, salvo que tenga hijos reales (Metrado/Submetrado/Texto)
    if (item.tipo === 3) {
      let fin = idx + 1;
      for (let i = idx + 1; i < lista.length; i++) {
        const h = lista[i];
        // Si encontramos otro Título → parar
        if (h.tipo === 3) break;
        // Si encontramos un hijo real (Metrado, Submetrado o Texto) → extender
        if (h.tipo === 1 || h.tipo === 2 || h.tipo === 4) {
          fin = i + 1;
        }
        // Si es vacía, no extender pero seguir buscando
      }
      return { inicio: idx, fin };
    }

    // METRADO (1) → solo la fila (o con sus Submetrados si los tiene)
    if (item.tipo === 1) {
      let fin = idx + 1;
      for (let i = idx + 1; i < lista.length; i++) {
        const h = lista[i];
        if (h.tipo === 1 || h.tipo === 3) break;
        if (h.tipo === 2) fin = i + 1;
      }
      return { inicio: idx, fin };
    }

    // SUBMETRADO (2) o TEXTO (4) → solo la fila
    return { inicio: idx, fin: idx + 1 };
  }

  pintar() {
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }

  leftDivBut() {
    var face1 = document.getElementById('divbut3');
    face1.scrollLeft += 15;
  }

  rigthDivBut() {
    var face1 = document.getElementById('divbut3');
    face1.scrollLeft -= 15;
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async cambioVista(ind: any) {
    console.log('════════════════════════════════════════');
    console.log('cambioVista →', ind, '| subvista anterior:', this.subvista);
    this.subvista = ind;
    this.mostrar_carga_todo = true;

    try {
      // ══════════════════════════════════════════════
      // SUBVISTA 2: METRADO DESAGREGADO
      // ══════════════════════════════════════════════
      if (ind === 2) {
        console.log('[cambioVista-2] partidasDetalle.length:', this.partidasDetalle?.length);

        if (!this.partidasDetalle?.length) {
          console.log('[cambioVista-2] Cargando cargarCalendarioDetalle...');
          await this.cargarCalendarioDetalle();
          console.log('[cambioVista-2] partidasDetalle DESPUÉS:', this.partidasDetalle?.length);
        } else {
          console.log('[cambioVista-2] Ya hay datos, saltando...');
        }
      }

      // ══════════════════════════════════════════════
      // SUBVISTA 3: RESUMEN DE METRADOS
      // ══════════════════════════════════════════════
      if (ind === 3) {
        // 🆕 SIEMPRE recargar el cronograma si aún no existe el mapa
        const mapaVacio = Object.keys(this.valorPlanificadoPorMes ?? {}).length === 0;

        console.log('[cambioVista-3] valorPlanificadoPorMes ANTES:', this.valorPlanificadoPorMes);

        if (mapaVacio || !this.mesesHeader?.length) {
          console.log('[cambioVista-3] Cargando CronogramaValorizado...');
          await this.CronogramaValorizado();
          console.log('[cambioVista-3] valorPlanificadoPorMes DESPUÉS:', this.valorPlanificadoPorMes);
        }

        // 🆕 SIEMPRE recargar el estado de registro (para reflejar cambios de la subvista 1)
        console.log('[cambioVista-3] Cargando cargarEstadoRegistroMetrados...');
        await this.cargarEstadoRegistroMetrados();
      }
    } catch (error) {
      console.error('❌ Error en cambioVista:', error);
      SwalService.error();
    } finally {
      this.mostrar_carga_todo = false;
      console.log('════════════════════════════════════════');
    }
  }

  procesarPartidas(partidasBackend: any[]) {
    return (partidasBackend || []).map((p: any) => {
      // Calculamos el nivel de profundidad basado en la cantidad de puntos en el 'item'
      // Ej: "01" -> nivel 0 | "01.01" -> nivel 1 | "01.01.01" -> nivel 2
      const nivel = p.item ? (p.item.split('.').length - 1) : 0;

      // Si no tiene unidad de medida, se asume que es un título/agrupador
      const esPadre = !p.unidad || p.unidad.trim() === '';

      return {
        ...p,
        nivel: nivel,
        paddingLeft: nivel * 15, // 15px por cada nivel de profundidad
        esPadre: esPadre,
        expandido: true,  // Estado inicial expandido
        visible: true     // Visibilidad
      };
    });
  }

  toggleFila(row: any) {
    if (!row.esPadre) return; // Solo los títulos/padres pueden expandir/contraer

    row.expandido = !row.expandido;
    const itemPadre = row.item + '.'; // Ej: "01.01."

    this.partidas.forEach((p: any) => {
      // Si el ítem empieza con la clave del padre, es un descendiente
      if (p.item && p.item.startsWith(itemPadre)) {
        if (!row.expandido) {
          // Ocultar si el padre se contrae
          p.visible = false;
          p.expandido = false;
        } else {
          // Mostrar solo los hijos directos al expandir
          const subItem = p.item.replace(itemPadre, '');
          if (!subItem.includes('.')) {
            p.visible = true;
          }
        }
      }
    });
  }

  async seleccionarDia(row: any, dia: any, indexFila: number, indiceReal: number) {
    this.mostrar_carga_todo = true;
    const titulo_sel = this.obtenerTituloRaiz(row, indexFila);
    console.log('titulo_sel', titulo_sel);

    try {
      // 1) Flush de guardado pendiente
      if (this.hayCambiosSinGuardar || this.cambiosPendientes || this.filasParaEliminar.length > 0 || this.guardando) {
        await this.flushGuardado();
      }

      // 2) Actualizar selección actual
      this.selFilPlan = indexFila;
      this.selFilPlanIndice = indiceReal;
      this.diaSeleccionado = dia.numero_dia;
      this.partidaSeleccionada = row;

      // 3) Resetear selección de la tabla principal
      this.metradoSeleccionado = null;
      this.idxSeleccionado = -1;
      this.filaExcelSel = null;
      this.habEditFormula = false;
      this.tempFormula = [];

      // 4) Resetear estados de la planilla (RS2)
      this.partidasPlanilla = [];
      this.columnasPlantilla = [];
      this.idxSeleccionadoPlanilla = -1;
      this.copiadoCeldasPlanilla = false;
      this.celdaInicioPlanilla = null;
      this.celdaFinPlanilla = null;

      // 5) Construir fecha
      const fecha = this.construirFechaISO();

      // 6) Llamar al backend
      const resp = await this.RecursosHumanosService.listarMetradoDiarioPartida({
        id_proyecto: this.id_proyecto,
        indice: indiceReal,
        indice_titulo: titulo_sel?.indice ?? 0,
        item_titulo: titulo_sel?.item ?? '',
        fecha: fecha,
      });
      console.log('resp', resp);

      // 7) RS2: partidas de la planilla + props UI
      this.partidasPlanilla = (resp?.partidas ?? []).map((p: any) => ({
        ...p,
        id_fila: Math.random().toString(36).substring(2, 9),
        nivel: p.item ? (p.item.split('.').length - 1) : 0,
        esPadre: !p.unidad || String(p.unidad).trim() === '',
        expandido: true,
        oculto: false,
      }));
      this.partidasDelTitulo = resp?.partidas ?? [];

      // 8) RS3: plantilla
      this.plantillaActual = resp?.plantilla?.[0] ?? null;
      this.construirColumnasPlantilla(this.plantillaActual);

      // 9) RS1: metrado diario
      const filas = (resp?.filas ?? []).map(f => ({
        ...f,
        id_fila: Math.random().toString(36).substring(2, 9),
        expandido: true,
        oculto: false,
      }));
      this.cargarDatosDia(filas);

    } catch (error) {
      console.error('Error al listar metrado diario:', error);
      SwalService.error();
      this.cargarDatosDia([]);
      this.partidasPlanilla = [];
      this.columnasPlantilla = [];
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  private obtenerTituloRaiz(row: any, indexFila: number): any {
    if (!row?.item) return null;

    const partes = String(row.item).split('.');
    if (partes.length <= 1) return row;   // ya es raíz → retorna la fila completa

    const raiz = partes[0];               // "1.1.1.1" → "1"

    // 1) Búsqueda rápida hacia atrás desde la fila seleccionada
    for (let i = indexFila; i >= 0; i--) {
      const p = this.partidas[i];
      if (!p?.item) continue;
      if (p.item === raiz) return p;     // ✅ retorna el objeto completo
    }

    // 2) Fallback: recorrer todo el array
    const encontrado = this.partidas.find(p => p.item === raiz);
    return encontrado ?? null;             // ✅ retorna el objeto completo
  }
  // Calcula el nivel según la cantidad de puntos '.'
  getPaddingLeft(item: string): number {
    if (!item) return 0;
    const nivel = item.split('.').length - 1; // "1" = 0, "1.1" = 1, "1.1.1" = 2
    const pixelesPorNivel = 5; // 5px por cada nivel jerárquico
    return nivel * pixelesPorNivel;
  }

  async cargarDetalleMetradoDiario(partida: any, numeroDia: string) {
    try {
      // Aquí puedes llamar a tu servicio enviando el id_partida/item y el día seleccionado
      /*
      const resp = await this.RecursosHumanosService.obtenerDetalleDiario({
        id_proyecto: this.id_proyecto,
        item: partida.item,
        dia: numeroDia,
        mes: this.mesSeleccionado
      });
      this.listaPlanillaEjecutada = resp.planilla;
      this.listaMetradosDiarios = resp.detalles;
      */
    } catch (error) {
      console.error('Error al cargar detalle del día:', error);
    }
  }

  async cargarCalendario() {
    try {
      const resp = await this.RecursosHumanosService.listarMetradoDiarioMes({
        id_proyecto: this.id_proyecto
      });

      console.log('Respuesta completa backend:', resp);

      if (resp) {
        // 1. Asignar Mes Seleccionado y Lista de Meses
        this.mesSeleccionado = resp.mes_seleccionado;
        this.listaMesesProyecto = resp.meses_proyecto || [];

        // 2. Asignar Cabecera de Días
        this.cabeceraDias = resp.calendario_cabecera || [];

        // 3. Formatear y Mapear las Partidas
        this.partidas = (resp.partidas || []).map((item: any) => {
          const esTituloSinUnidad = !item.unidad || String(item.unidad).trim() === '';

          return {
            ...item,
            visible: true,
            expandido: true,                    // 🆕 necesario para el toggle
            esPadre: esTituloSinUnidad,         // 🆕 títulos/subtítulos
            es_titulo: item.item ? item.item.split('.').length <= 2 : false
          };
        });

        console.log('this.partidas', this.partidas);
      }

    } catch (error) {
      console.error('Error al cargar metrado diario:', error);
      throw error;
    }
  }

  // Método cuando el usuario cambia el mes en el <mat-select>
  async onChangeMes(nuevoMes: string) {
    try {
      this.mostrar_carga_todo = true;

      if (this.hayCambiosSinGuardar || this.cambiosPendientes || this.filasParaEliminar.length > 0 || this.guardando) {
        await this.flushGuardado();
      }

      const resp = await this.RecursosHumanosService.listarMetradoDiarioMes({
        id_proyecto: this.id_proyecto,
        mes: nuevoMes
      });

      if (resp) {
        this.mesSeleccionado = resp.mes_seleccionado;
        this.cabeceraDias = resp.calendario_cabecera || [];

        // 🆕 Mismo mapeo que cargarCalendario
        this.partidas = (resp.partidas || []).map((item: any) => {
          const esTituloSinUnidad = !item.unidad || String(item.unidad).trim() === '';

          return {
            ...item,
            visible: true,
            expandido: true,                    // 🆕
            esPadre: esTituloSinUnidad,         // 🆕
            es_titulo: item.item ? item.item.split('.').length <= 2 : false
          };
        });
      }

      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
      console.error(error);
    }
  }
  cargarDatosDia(registrosBD: ItemMetradoDiario[] = []) {
    this.listaMetradosDiarios = [...registrosBD];

    // Rellenar hasta MIN_FILAS si vienen menos
    while (this.listaMetradosDiarios.length < this.MIN_FILAS) {
      this.listaMetradosDiarios.push(this.crearFilaVacia());
    }

    this.recalcularTotalesYJerarquia();
  }

  crearFilaVacia(): ItemMetradoDiario {
    return {
      id_fila: Math.random().toString(36).substring(2, 9),
      tipo: null,
      descripcion: '',
      cantidad: '',
      n_veces: '',
      longitud: '',
      ancho: '',
      alto: '',
      detalle1: '',
      detalle2: '',
      subtotal: 0,
      total: 0,
      expandido: true
    };
  }

  recalcularTotalesYJerarquia() {
    const lista = this.listaMetradosDiarios;

    // 1️⃣ SUBMETRADOS y METRADOS sin hijos: usan su fórmula
    for (const item of lista) {
      if (item.tipo === 2) {
        // Submetrado → fórmula propia
        item.subtotal = this.calcularFormula(item);
        item.total = item.subtotal;
      } else if (item.tipo === 1) {
        // Metrado sin hijos → fórmula propia (se recalcula abajo si tiene hijos)
        item.subtotal = this.calcularFormula(item);
        item.total = item.subtotal;
      } else if (item.tipo === 3 || item.tipo === 4) {
        item.subtotal = 0;
        item.total = 0;
      }
    }

    // 2️⃣ METRADOS con hijos SUBMETRADO: suman subtotales de sus hijos
    for (let i = lista.length - 1; i >= 0; i--) {
      const item = lista[i];
      if (item.tipo !== 1) continue;

      let suma = 0;
      let tieneHijos = false;

      for (let j = i + 1; j < lista.length; j++) {
        const hijo = lista[j];
        if (hijo.tipo === 1 || hijo.tipo === 3) break;  // siguiente metrado o título
        if (hijo.tipo === 2) {
          suma += hijo.subtotal || 0;
          tieneHijos = true;
        }
      }

      if (tieneHijos) {
        item.subtotal = suma;
        item.total = suma;
      }
    }

    // 3️⃣ TÍTULOS: suman totales de sus METRADOS hijos
    for (let i = lista.length - 1; i >= 0; i--) {
      const item = lista[i];
      if (item.tipo !== 3) continue;

      let suma = 0;
      for (let j = i + 1; j < lista.length; j++) {
        const hijo = lista[j];
        if (hijo.tipo === 3) break;  // siguiente título
        if (hijo.tipo === 1) suma += hijo.total || 0;
      }
      item.subtotal = suma;
      item.total = suma;
    }

    // 4️⃣ TOTAL GENERAL
    const titulos = lista.filter(x => x.tipo === 3);
    this.totalGeneralMetrados = titulos.length
      ? titulos.reduce((acc, x) => acc + (x.total || 0), 0)
      : lista.filter(x => x.tipo === 1).reduce((acc, x) => acc + (x.total || 0), 0);
  }

  // calcularFormula(item: ItemMetradoDiario): number {
  //   const formulaRaw = item.formula?.toUpperCase().trim();
  //   const esEstandar = !formulaRaw || formulaRaw === 'B*C*D*E*F*G*H';
  //   const formula = formulaRaw || 'B*C*D*E*F*G*H';

  //   const mapa: Record<string, keyof ItemMetradoDiario> = {
  //     B: 'detalle1',
  //     C: 'detalle2',
  //     D: 'cantidad',
  //     E: 'n_veces',
  //     F: 'longitud',
  //     G: 'ancho',
  //     H: 'alto',
  //   };

  //   // 1) Recolectar valores y detectar si hay al menos uno numérico
  //   const valores: Record<string, { raw: any; num: number; esNum: boolean; vacio: boolean }> = {};
  //   let hayAlgunNumerico = false;

  //   for (const letra of ['B', 'C', 'D', 'E', 'F', 'G', 'H']) {
  //     const raw = item[mapa[letra]];
  //     const vacio = raw === null || raw === undefined || String(raw).trim() === '';
  //     const n = vacio ? NaN : parseFloat(String(raw).replace(',', '.'));
  //     const esNum = !isNaN(n);

  //     valores[letra] = { raw, num: esNum ? n : 0, esNum, vacio };
  //     if (esNum) hayAlgunNumerico = true;
  //   }

  //   // 2) Fórmula ESTÁNDAR: si no hay ningún valor numérico en B-H → 0
  //   if (esEstandar && !hayAlgunNumerico) {
  //     return 0;
  //   }

  //   // 3) Fórmula PERSONALIZADA: si alguna celda referenciada no es numérica → 0
  //   if (!esEstandar) {
  //     const letrasEnFormula = [...new Set(formula.match(/[B-H]/g) || [])];
  //     for (const letra of letrasEnFormula) {
  //       const v = valores[letra];
  //       // Si no es numérica (vacía o texto) → 0
  //       if (!v.esNum) return 0;
  //     }
  //   }

  //   // 4) Reemplazar valores en la expresión
  //   let expr = formula;
  //   for (const letra of ['B', 'C', 'D', 'E', 'F', 'G', 'H']) {
  //     const v = valores[letra];

  //     // En fórmula estándar: vacío → 1 (neutro multiplicativo)
  //     // En fórmula personalizada: los vacíos ya se descartaron en el paso 3
  //     let valorFinal = 1;
  //     if (v.esNum) {
  //       valorFinal = v.num;
  //     } else if (!esEstandar) {
  //       // No debería llegar aquí por el paso 3, pero por seguridad
  //       valorFinal = 0;
  //     }

  //     expr = expr.replace(new RegExp(letra, 'g'), valorFinal.toString());
  //   }

  //   return this.evaluarExpresion(expr) ?? 0;
  // }
  calcularFormula(item: ItemMetradoDiario): number {
    const formulaRaw = item.formula?.toUpperCase().trim();
    const esEstandar = !formulaRaw || formulaRaw === 'B*C*D*E*F*G';
    const formula = formulaRaw || 'B*C*D*E*F*G';

    const mapa: Record<string, keyof ItemMetradoDiario> = {
      B: 'detalle1',
      C: 'cantidad',
      D: 'n_veces',
      E: 'longitud',
      F: 'ancho',
      G: 'alto',
    };

    const valores: Record<string, { raw: any; num: number; esNum: boolean; vacio: boolean }> = {};
    let hayAlgunNumerico = false;

    for (const letra of ['B', 'C', 'D', 'E', 'F', 'G']) {
      const raw = item[mapa[letra]];
      const vacio = raw === null || raw === undefined || String(raw).trim() === '';
      const n = vacio ? NaN : parseFloat(String(raw).replace(',', '.'));
      const esNum = !isNaN(n);

      valores[letra] = { raw, num: esNum ? n : 0, esNum, vacio };
      if (esNum) hayAlgunNumerico = true;
    }

    if (esEstandar && !hayAlgunNumerico) return 0;

    if (!esEstandar) {
      const letrasEnFormula = [...new Set(formula.match(/[B-G]/g) || [])];
      for (const letra of letrasEnFormula) {
        const v = valores[letra];
        if (!v.esNum) return 0;
      }
    }

    let expr = formula;
    for (const letra of ['B', 'C', 'D', 'E', 'F', 'G']) {
      const v = valores[letra];
      let valorFinal = 1;
      if (v.esNum) valorFinal = v.num;
      else if (!esEstandar) valorFinal = 0;
      expr = expr.replace(new RegExp(letra, 'g'), valorFinal.toString());
    }

    return this.evaluarExpresion(expr) ?? 0;
  }

  evaluarExpresion(expresion: string): number | null {
    try {
      // eslint-disable-next-line no-new-func
      const r = Function(`"use strict"; return (${expresion});`)();
      return (typeof r === 'number' && isFinite(r)) ? r : null;
    } catch {
      return null;
    }
  }

  subirNivelfila(filaTarget: ItemMetradoDiario | null) {
    const target = filaTarget || this.metradoSeleccionado;

    if (!target) {
      this.toaster.warning('Selecciona una fila primero', '', { timeOut: 2000 });
      return;
    }

    if (!target.tipo) {
      this.toaster.warning('La fila seleccionada está vacía', '', { timeOut: 2000 });
      return;
    }

    const colActual = this.ultimaCeldaSeleccionada ?? 'descripcion';

    // 🔔 Validar si puede subir
    if (target.tipo === 3) {
      this.toaster.warning('Un Título no puede subir más de nivel', '', { timeOut: 2500 });
      return;
    }

    // Subir nivel
    if (target.tipo === 2) target.tipo = 1;       // Submetrado → Metrado
    else if (target.tipo === 1) target.tipo = 3;  // Metrado → Título

    if (target.expandido === undefined) target.expandido = false;

    this.limpiarFormulaSiNoAplica(target);
    this.validarEstructuraDespuesDeCambio(this.idxSeleccionado);

    const nuevoIdx = this.listaMetradosDiarios.indexOf(target);
    if (nuevoIdx >= 0) {
      this.idxSeleccionado = nuevoIdx;
      this.filaExcelSel = target;
      this.metradoSeleccionado = target;
    }

    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();

    setTimeout(() => this.focarInput(nuevoIdx, colActual, false), 30);
  }

  bajarNivel(filaTarget: ItemMetradoDiario | null) {
    const target = filaTarget || this.metradoSeleccionado;

    if (!target) {
      this.toaster.warning('Selecciona una fila primero', '', { timeOut: 2000 });
      return;
    }

    if (!target.tipo) {
      this.toaster.warning('La fila seleccionada está vacía', '', { timeOut: 2000 });
      return;
    }

    const colActual = this.ultimaCeldaSeleccionada ?? 'descripcion';

    // 🔔 Validar si puede bajar
    if (target.tipo === 2) {
      this.toaster.warning('Un Submetrado no puede bajar más de nivel', '', { timeOut: 2500 });
      return;
    }

    // Bajar nivel
    if (target.tipo === 3) target.tipo = 1;       // Título → Metrado
    else if (target.tipo === 1) target.tipo = 2;  // Metrado → Submetrado

    if (target.tipo === 2) {
      target.expandido = false;
    } else if (target.expandido === undefined) {
      target.expandido = false;
    }

    this.limpiarFormulaSiNoAplica(target);
    this.validarEstructuraDespuesDeCambio(this.idxSeleccionado);

    const nuevoIdx = this.listaMetradosDiarios.indexOf(target);
    if (nuevoIdx >= 0) {
      this.idxSeleccionado = nuevoIdx;
      this.filaExcelSel = target;
      this.metradoSeleccionado = target;
    }

    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();

    setTimeout(() => this.focarInput(nuevoIdx, colActual, false), 30);
  }

  validarEstructuraDespuesDeCambio(idxModificado: number) {
    // Si un Submetrado queda sin un Metrado padre arriba, se auto-promociona a Metrado
    let metradoPadreEncontrado = false;
    for (let i = 0; i < this.listaMetradosDiarios.length; i++) {
      const fila = this.listaMetradosDiarios[i];
      if (fila.tipo === 1) metradoPadreEncontrado = true;
      if (fila.tipo === 3) metradoPadreEncontrado = false;

      if (fila.tipo === 2 && !metradoPadreEncontrado) {
        fila.tipo = 1; // Convierte a metrado por falta de jerarquía
        metradoPadreEncontrado = true;
      }
    }
  }

  // 4. Agregar y Eliminar Filas
  agregarFilaSel(esArriba: boolean = false) {
    const nuevaFila = this.crearFilaVacia();
    const pos = this.idxSeleccionado >= 0 ? this.idxSeleccionado + (esArriba ? 0 : 1) : this.listaMetradosDiarios.length;
    this.listaMetradosDiarios.splice(pos, 0, nuevaFila);
    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();
  }

  agregarFilas(esArriba: boolean) {
    const cantidad = parseInt(this.cantFil as any) || 1;
    const pos = this.idxSeleccionado >= 0 ? this.idxSeleccionado + (esArriba ? 0 : 1) : this.listaMetradosDiarios.length;

    const nuevasFilas: ItemMetradoDiario[] = Array.from({ length: cantidad }, () => this.crearFilaVacia());
    this.listaMetradosDiarios.splice(pos, 0, ...nuevasFilas);
    this.recalcularTotalesYJerarquia();
  }

  eliminarRow() {
    if (this.idxSeleccionado < 0) return;

    const fila = this.listaMetradosDiarios[this.idxSeleccionado];

    // ✅ Si la fila tiene id_metrado, agregarla al buffer de eliminación
    if (fila && fila.id_metrado && fila.id_metrado > 0) {
      this.filasParaEliminar.push(fila);
    }

    this.listaMetradosDiarios.splice(this.idxSeleccionado, 1);

    if (this.listaMetradosDiarios.length < this.MIN_FILAS) {
      this.listaMetradosDiarios.push(this.crearFilaVacia());
    }

    this.validarEstructuraDespuesDeCambio(this.idxSeleccionado);
    this.recalcularTotalesYJerarquia();

    // ✅ Disparar guardado y actualizar total del día
    this.solicitarGuardado();
  }

  async limpiarTabla() {
    // Confirmar acción (destructiva)
    const confirmar = await SwalService.confirm(
      'Se eliminarán todos los registros del día actual. ¿Continuar?',
      'Limpiar tabla'
    );
    if (!confirmar) return;

    // Marcar todas las filas con id_metrado para eliminar
    for (const f of this.listaMetradosDiarios) {
      if (f.id_metrado && f.id_metrado > 0) {
        this.filasParaEliminar.push(f);
      }
    }

    this.cargarDatosDia([]);       // Rellena con MIN_FILAS vacías
    this.solicitarGuardado();      // ✅ Dispara guardado
  }

  onKeyDown(event: KeyboardEvent, filaIdx: number, colNombre: string) {
    // Solo bloquear Ctrl+flechas (navegación); dejar pasar Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, etc.
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();

      // Teclas que SÍ queremos bloquear (para que no interfieran con el navegador)
      const bloquear = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

      if (bloquear.includes(key)) {
        event.preventDefault();
      }

      // Dejar pasar el resto (v, c, x, a, z, etc.)
      return;
    }

    // const columnas = ['descripcion', 'detalle1', 'detalle2', 'cantidad', 'n_veces', 'longitud', 'ancho', 'alto'];
    const columnas = ['descripcion', 'detalle1', 'cantidad', 'n_veces', 'longitud', 'ancho', 'alto'];

    const colIdx = columnas.indexOf(colNombre);
    const input = event.target as HTMLInputElement;
    const valor = input.value ?? '';
    const selStart = input.selectionStart ?? 0;
    const selEnd = input.selectionEnd ?? 0;
    const todoSeleccionado = selStart === 0 && selEnd === valor.length && valor.length > 0;

    // 🔽 DERECHA
    if (event.key === 'ArrowRight') {
      if (todoSeleccionado || selEnd === valor.length) {
        if (colIdx < columnas.length - 1) {
          event.preventDefault();
          this.moverFocoYSeleccion(filaIdx, columnas[colIdx + 1]);
        }
      }
      return;
    }

    // 🔼 IZQUIERDA
    if (event.key === 'ArrowLeft') {
      if (todoSeleccionado || selStart === 0) {
        if (colIdx > 0) {
          event.preventDefault();
          this.moverFocoYSeleccion(filaIdx, columnas[colIdx - 1]);
        }
      }
      return;
    }

    // 🔽 ABAJO
    if (event.key === 'ArrowDown') {
      if (filaIdx < this.listaMetradosDiarios.length - 1) {
        event.preventDefault();
        this.moverFocoYSeleccion(filaIdx + 1, colNombre);
      }
      return;
    }

    // 🔼 ARRIBA
    if (event.key === 'ArrowUp') {
      if (filaIdx > 0) {
        event.preventDefault();
        this.moverFocoYSeleccion(filaIdx - 1, colNombre);
      }
      return;
    }
  }

  moverFocoYSeleccion(filaIdx: number, colNombre: string) {
    const item = this.listaMetradosDiarios[filaIdx];
    if (item) {
      this.idxSeleccionado = filaIdx;
      this.filaExcelSel = item;
      this.metradoSeleccionado = item;
    }

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = undefined;
    }

    this.focarInput(filaIdx, colNombre, true);

    this.scrollTimeout = setTimeout(() => {
      this.scrollTimeout = undefined;
      const el = document.getElementById(`input-${filaIdx}-${colNombre}`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 30);
  }

  private scrollTimeout?: ReturnType<typeof setTimeout>;

  focarInput(filaIdx: number, colNombre: string, seleccionarTodo: boolean = true) {
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = undefined;
    }

    this.focusTimeout = setTimeout(() => {
      this.focusTimeout = undefined;

      const el = document.getElementById(`input-${filaIdx}-${colNombre}`) as HTMLInputElement | null;
      if (!el) return;

      el.focus();
      if (seleccionarTodo) el.select();
    }, 20);
  }



  private selectTimeout?: ReturnType<typeof setTimeout>;

  seleccionarTodo(event: FocusEvent) {
    // Ya no usamos seleccionarTodo desde el HTML, pero lo dejamos
    // por si algún otro componente lo necesita
    const el = event.target as HTMLInputElement;
    if (!el) return;
    el.select();
  }

  toggleFilaHijos(parentIdx: number) {
    const parent = this.listaMetradosDiarios[parentIdx];
    if (!parent || (parent.tipo !== 1 && parent.tipo !== 3)) return;

    parent.expandido = !parent.expandido;
    const ocultar = !parent.expandido;

    for (let i = parentIdx + 1; i < this.listaMetradosDiarios.length; i++) {
      const item = this.listaMetradosDiarios[i];

      // Si el elemento padre es TÍTULO (3), se colapsan metrados, submetrados y textos hasta el siguiente título
      if (parent.tipo === 3) {
        if (item.tipo === 3) break; // Detenerse en el siguiente Título
        item.oculto = ocultar;
      }
      // Si el elemento padre es METRADO (1), se colapsan únicamente sus submetrados y textos inmediatos
      else if (parent.tipo === 1) {
        if (item.tipo === 1 || item.tipo === 3) break; // Detenerse si encuentra un Metrado o Título
        item.oculto = ocultar;
      }
    }
  }

  onCellEdit(item: ItemMetradoDiario) {
    // Si la fila no tiene tipo definido (es vacía) y el usuario escribió algo, asignarle tipo = 1 (Metrado)
    if (item.tipo === null && this.tieneContenido(item)) {
      item.tipo = 1;
      this.validarEstructuraDespuesDeCambio(this.idxSeleccionado);
    }
    // Si borran todo el contenido de la fila, vuelve a ser vacía (tipo = null)
    else if (item.tipo === 1 && !this.tieneContenido(item)) {
      item.tipo = null;
      item.subtotal = 0;
      item.total = 0;
    }

    // Recalcular parciales, totales y jerarquía
    this.recalcularTotalesYJerarquia();
  }

  tieneContenido(item: ItemMetradoDiario): boolean {
    const val = (v: any) => v !== null && v !== undefined && String(v).trim() !== '';
    return (
      val(item.descripcion) ||
      val(item.detalle1) ||
      // val(item.detalle2) ||
      val(item.cantidad) ||
      val(item.n_veces) ||
      val(item.longitud) ||
      val(item.ancho) ||
      val(item.alto)
    );
  }

  onEditTexto(item: ItemMetradoDiario) {
    if (item.tipo === null && this.tieneContenido(item)) {
      item.tipo = 1;
    } else if (item.tipo !== null && !this.tieneContenido(item)) {
      item.tipo = null;
      item.subtotal = 0;
      item.total = 0;
    }

    // this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();     // ✅
  }

  onEditGeometria(item: ItemMetradoDiario) {
    if (item.tipo === null && this.tieneContenido(item)) {
      item.tipo = 1;
    }
    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();     // ✅
  }

  async pegarCopiados() {
    const idx = this.idxSeleccionado;

    let tipo: 'filas' | 'cortado' | 'celdas' | null = null;
    if (this.celdasCopiadosMetrado.length) tipo = 'celdas';
    else if (this.arrayCortados.length) tipo = 'cortado';
    else if (this.arrayCopiadosMetrado.length) tipo = 'filas';

    if (!tipo) {
      this.toaster.error('Nada para pegar', '', { timeOut: 2000 });
      return;
    }

    // Celdas → directo
    if (tipo === 'celdas') {
      if (idx == null || idx < 0 || !this.ultimaCeldaSeleccionada) {
        SwalService.warning('Atención', 'Selecciona una celda inicio para pegar');
        return;
      }
      this.pegarCeldas(idx, this.ultimaCeldaSeleccionada);
      return;
    }

    // Filas / Cortado → preguntar debajo/reemplazar
    if (idx == null || idx < 0) {
      this.toaster.error('Selecciona una fila destino', '', { timeOut: 2000 });
      return;
    }

    const opcion = await SwalService.optionokcancel(
      { debajo: 'Pegar debajo', reemplazar: 'Reemplazar fila seleccionada' },
      '¿Cómo pegar?',
      'debajo'
    );

    if (!opcion) return;

    const modo = opcion as 'debajo' | 'reemplazar';

    if (tipo === 'cortado') {
      this.pegarCortado(idx, modo);
    } else {
      this.pegarFilas(idx, modo);
    }
  }

  private pegarFilas(idxDestino: number, modo: 'debajo' | 'reemplazar') {
    const lista = this.listaMetradosDiarios;
    const copias = this.arrayCopiadosMetrado.map(f => this.clonarSinIds(f));
    if (!copias.length) return;

    if (modo === 'debajo') {
      // Insertar debajo de la fila seleccionada
      lista.splice(idxDestino + 1, 0, ...copias);
      this.idxSeleccionado = idxDestino + 1;

    } else {
      // Reemplazar la fila seleccionada
      // Eliminamos 1 fila (la seleccionada) e insertamos las copias
      lista.splice(idxDestino, 1, ...copias);
      this.idxSeleccionado = idxDestino;
    }

    // Reindexar
    lista.forEach((item, i) => item.indice = i);

    // Recalcular
    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();

    // Seleccionar primera fila pegada
    this.filaExcelSel = copias[0];
    this.metradoSeleccionado = copias[0];

    // Scroll
    setTimeout(() => {
      document.getElementById('ts-' + this.idxSeleccionado)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 50);

    this.toaster.success(
      modo === 'debajo' ? `${copias.length} fila(s) pegadas debajo` : `Fila reemplazada por ${copias.length} fila(s)`,
      '', { timeOut: 2000 }
    );
  }
  // private pegarCortado(idxDestino: number, modo: 'debajo' | 'reemplazar' = 'debajo') {
  //   const lista = this.listaMetradosDiarios;
  //   const origen = this.arrayCortados;
  //   if (!origen.length) return;

  //   // Detectar si el destino está dentro del bloque cortado → no hacer nada
  //   const indicesOrigen = origen.map(f => lista.indexOf(f)).filter(i => i >= 0);
  //   if (indicesOrigen.includes(idxDestino)) {
  //     this.toaster.warning('El destino está dentro del bloque cortado', '', { timeOut: 2000 });
  //     return;
  //   }
  //   // 1) Eliminar las filas cortadas del array original
  //   let offset = 0;
  //   for (const fila of origen) {
  //     const i = lista.indexOf(fila);
  //     if (i >= 0 && i < idxDestino) offset++;
  //     if (i >= 0) lista.splice(i, 1);
  //   }

  //   // 2) Ajustar destino por las filas eliminadas antes
  //   const nuevoDestino = idxDestino - offset;

  //   // 3) Insertar según modo
  //   if (modo === 'debajo') {
  //     lista.splice(nuevoDestino + 1, 0, ...origen);
  //     this.idxSeleccionado = nuevoDestino + 1;
  //   } else {
  //     // Reemplazar la fila destino
  //     lista.splice(nuevoDestino, 1, ...origen);
  //     this.idxSeleccionado = nuevoDestino;
  //   }

  //   // 4) Reindexar
  //   lista.forEach((item, i) => item.indice = i);

  //   // 5) Recalcular
  //   this.recalcularTotalesYJerarquia();
  //   this.solicitarGuardado();

  //   // 6) Seleccionar primera fila movida
  //   this.filaExcelSel = origen[0];
  //   this.metradoSeleccionado = origen[0];

  //   // 7) Limpiar buffer de cortado
  //   this.arrayCortados = [];

  //   // 8) Scroll
  //   setTimeout(() => {
  //     document.getElementById('ts-' + this.idxSeleccionado)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  //   }, 50);

  //   this.toaster.success('Filas movidas', '', { timeOut: 2000 });
  // }
  private pegarCeldas(filaDestino: number, colDestino: string) {
    const lista = this.listaMetradosDiarios;
    const colDestinoIdx = this.idxColumna(colDestino);
    if (colDestinoIdx < 0) return;

    // 🆕 1) Calcular cuántas filas necesita el bloque pegado
    const maxFilaOffset = Math.max(...this.celdasCopiadosMetrado.map(c => c.filaOffset ?? 0));
    const filasNecesarias = filaDestino + maxFilaOffset + 1;

    // 🆕 2) Auto-expandir SIN LÍMITE
    while (lista.length < filasNecesarias) {
      lista.push(this.crearFilaVacia());
    }

    // 3) Pegar celdas + acumular filas modificadas
    const filasModificadas = new Set<number>();

    for (const celda of this.celdasCopiadosMetrado) {
      const filaDest = filaDestino + (celda.filaOffset ?? 0);
      const colDestIdx = colDestinoIdx + (celda.colOffset ?? 0);

      if (filaDest >= 0 && filaDest < lista.length &&
        colDestIdx >= 0 && colDestIdx < this.COLUMNAS_EDITABLES.length) {
        const columna = this.COLUMNAS_EDITABLES[colDestIdx];
        (lista[filaDest] as any)[columna] = celda.valor;
        filasModificadas.add(filaDest);
      }
    }

    // 4) Normalizar numéricos + promover tipo
    for (const idx of filasModificadas) {
      const fila = lista[idx];
      if (!fila) continue;

      fila.detalle1 = this.normalizarNumero(fila.detalle1);
      fila.cantidad = this.normalizarNumero(fila.cantidad);
      fila.n_veces = this.normalizarNumero(fila.n_veces);
      fila.longitud = this.normalizarNumero(fila.longitud);
      fila.ancho = this.normalizarNumero(fila.ancho);
      fila.alto = this.normalizarNumero(fila.alto);

      if (fila.tipo == null && this.tieneContenido(fila)) {
        fila.tipo = 1;
        fila.expandido = fila.expandido ?? false;
      }
    }

    // 5) Validar jerarquía
    if (filasModificadas.size > 0) {
      const minIdx = Math.min(...Array.from(filasModificadas));
      this.validarEstructuraDespuesDeCambio(minIdx);
    }

    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();
    this.toaster.success(`${this.celdasCopiadosMetrado.length} celda(s) pegadas`, '', { timeOut: 2000 });
  }

  private clonarSinIds(f: ItemMetradoDiario): ItemMetradoDiario {
    return {
      id_proyecto: f.id_proyecto, fecha: f.fecha, tipo: f.tipo,
      descripcion: f.descripcion, cantidad: f.cantidad, n_veces: f.n_veces,
      longitud: f.longitud, ancho: f.ancho, alto: f.alto,
      detalle1: f.detalle1, detalle2: f.detalle2,
      subtotal: f.subtotal, total: f.total, formula: f.formula,
      expandido: false, oculto: false, seleccionado: false, editarCopiar: false,
      id_metrado: null as any, index_elemento_gp: null, index_titulo: null, indice: null,
    };
  }

  onFilaBlur(event: FocusEvent, item: ItemMetradoDiario) {
    const fila = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as HTMLElement | null;

    // Si el foco se quedó dentro de la misma fila, no hacer nada
    if (next && fila.contains(next)) return;

    // 1) Normalizar numéricos
    item.detalle1 = this.normalizarNumero(item.detalle1);
    // item.detalle2 = this.normalizarNumero(item.detalle2);
    item.cantidad = this.normalizarNumero(item.cantidad);
    item.n_veces = this.normalizarNumero(item.n_veces);
    item.longitud = this.normalizarNumero(item.longitud);
    item.ancho = this.normalizarNumero(item.ancho);
    item.alto = this.normalizarNumero(item.alto);

    // 2) Ajustar tipo según contenido
    const tiene = this.tieneContenido(item);

    if (item.tipo == null && tiene) {
      // Fila vacía con contenido → METRADO por defecto (tiene ícono de toggle)
      item.tipo = 1;
      item.expandido = item.expandido ?? false;

    } else if (item.tipo != null && !tiene) {
      // Fila con tipo pero sin contenido → resetear
      item.tipo = null;
      item.formula = null;
      item.subtotal = 0;
      item.total = 0;
      item.expandido = false;

    } else if (item.tipo != null) {
      // La fila mantiene tipo → limpiar fórmula si ya no aplica
      this.limpiarFormulaSiNoAplica(item);

      // Asegurar que expandido esté definido
      if (item.expandido === undefined) item.expandido = false;
    }

    // 3) Recalcular y guardar
    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();
  }

  /** Se llama cada vez que cambia el tipo de una fila */
  limpiarFormulaSiNoAplica(item: ItemMetradoDiario) {
    if (!item) return;
    if (!this.esFilaFormulaEditable(item)) {
      item.formula = null;
    }
  }


  /** Valida que las celdas referenciadas en la fórmula sean numéricas */
  // validarFormulaConValores(item: ItemMetradoDiario, formula: string): { ok: boolean; errores: string[] } {
  //   const errores: string[] = [];
  //   const letras = [...new Set(formula.toUpperCase().match(/[B-H]/g) || [])];

  //   for (const letra of letras) {
  //     const campo = this.MAPA_LETRAS[letra];
  //     const valor = item[campo];
  //     if (!this.esNumerico(valor)) {
  //       errores.push(`Celda ${letra} contiene texto: "${valor}"`);
  //     }
  //   }
  //   return { ok: errores.length === 0, errores };
  // }
  validarFormulaConValores(item: ItemMetradoDiario, formula: string): { ok: boolean; errores: string[] } {
    const errores: string[] = [];
    const letras = [...new Set(formula.toUpperCase().match(/[B-G]/g) || [])];

    for (const letra of letras) {
      const campo = this.MAPA_LETRAS[letra];
      const valor = item[campo];
      if (!this.esNumerico(valor)) {
        errores.push(`Celda ${letra} contiene texto: "${valor}"`);
      }
    }
    return { ok: errores.length === 0, errores };
  }

  private toNumber(val: any): number {
    if (val === null || val === undefined || val === '') return 1; // ← 1 en vez de 0
    const n = parseFloat(String(val).replace(',', '.'));
    return isNaN(n) ? 1 : n; // texto también = 1
  }

  /** Verifica si un valor es numérico (o vacío) */
  private esNumerico(val: any): boolean {
    if (val === null || val === undefined || val === '') return true;
    return !isNaN(parseFloat(String(val).replace(',', '.')));
  }
  esFilaFormulaEditable(item?: ItemMetradoDiario): boolean {
    const m = item ?? this.metradoSeleccionado;
    if (!m) return false;
    if (m.tipo == null) return false;
    if (m.tipo === 3 || m.tipo === 4) return false;
    if (m.tipo === 2) return true;
    if (m.tipo === 1) return !this.tieneSubmetradosHijos(m);
    return false;
  }

  private tieneSubmetradosHijos(item: ItemMetradoDiario): boolean {
    const idx = this.listaMetradosDiarios.indexOf(item);
    if (idx < 0) return false;
    for (let j = idx + 1; j < this.listaMetradosDiarios.length; j++) {
      const h = this.listaMetradosDiarios[j];
      if (h.tipo === 1 || h.tipo === 3) break;   // siguiente metrado o título
      if (h.tipo === 2) return true;
    }
    return false;
  }

  // teclaFormula(texto: string) {
  //   this.formulaTemporal = texto;
  //   const letras = (texto || '').toUpperCase().match(/[B-H]/g) || [];
  //   this.tempFormula = [...new Set(letras)];
  // }

  teclaFormula(texto: string) {
    this.formulaTemporal = texto;
    const letras = (texto || '').toUpperCase().match(/[B-G]/g) || [];
    this.tempFormula = [...new Set(letras)];
  }

  pintarCelda(letra: string): boolean {
    if (!this.habEditFormula) return false;
    if (!this.metradoSeleccionado) return false;
    return this.tempFormula.includes(letra.toUpperCase());
  }
  /** Al salir del input fx, limpiar tempFormula */
  limpiarTempFormula() {
    this.tempFormula = [];
  }

  activarEdicionFormula() {
    if (!this.esFilaFormulaEditable()) return;
    // this.formulaTemporal = this.metradoSeleccionado?.formula ?? 'B*C*D*E*F*G*H';
    this.formulaTemporal = this.metradoSeleccionado?.formula ?? 'B*C*D*E*F*G';
    this.habEditFormula = true;
    this.teclaFormula(this.formulaTemporal);

    setTimeout(() => {
      this.inputFx?.nativeElement?.focus();
      this.inputFx?.nativeElement?.select();
    });
  }

  desactivarEdicionFormula() {
    this.habEditFormula = false;
    this.tempFormula = [];
  }

  normalizarNumero(valor: any): string {
    if (valor === null || valor === undefined) return '';
    let v = String(valor).trim();
    if (!v) return v;

    // Si empieza con "." → anteponer 0
    if (v.startsWith('.')) v = '0' + v;

    // Si termina con "." → agregar 0
    if (v.endsWith('.')) v = v + '0';

    // Múltiples puntos → dejar solo el primero
    const partes = v.split('.');
    if (partes.length > 2) {
      v = partes[0] + '.' + partes.slice(1).join('');
    }

    return v;
  }

  inicializarColaGuardado() {
    this.subGuardar = this.guardar$.pipe(
      debounceTime(this.DEBOUNCE_MS),
      takeUntil(this.cancelarDebounce$),   // ✅ cancelable
      concatMap(() => from(this.ejecutarGuardado()))
    ).subscribe(() => {
      if (this.cambiosPendientes) {
        this.cambiosPendientes = false;
        this.guardar$.next();
      }
    });
  }

  private async ejecutarGuardado(): Promise<void> {
    const { payload, filasEnviadas } = this.construirPayload();

    if (!payload.filas_serializadas) {
      this.hayCambiosSinGuardar = false;
      return;
    }

    this.guardando = true;
    this.cambiosPendientes = false;

    try {
      const res: any = await this.RecursosHumanosService.guardarMetradoDiario(payload);

      const ids: Array<{ posicion: number; id_metrado: number }> = res?.ids_generados ?? [];
      for (const item of ids) {
        const fila = filasEnviadas[item.posicion];
        if (fila) {
          fila.id_metrado = item.id_metrado;
          fila.id_proyecto = this.id_proyecto;
          fila.indice = this.selFilPlanIndice;
          fila.fecha = payload.fecha;
        }
      }

      // ✅ ACTUALIZAR EL TOTAL DEL DÍA EN EL CALENDARIO
      this.actualizarTotalDiaEnCalendario(payload.fecha);

      this.filasParaEliminar = [];
      this.hayCambiosSinGuardar = false;
    } catch (err) {
      this.toaster.error('Error al guardar metrado', '', { timeOut: 3000 });
      console.error(err);
    } finally {
      this.guardando = false;
    }
  }

  // private actualizarTotalDiaEnCalendario(): void {
  //   // Verificar que haya una partida y un día seleccionados
  //   if (this.selFilPlan < 0 || this.selFilPlan >= this.partidas.length) return;
  //   if (!this.diaSeleccionado) return;

  //   const row = this.partidas[this.selFilPlan];
  //   if (!row) return;

  //   // El total del día actual = totalGeneralMetrados (ya calculado)
  //   const totalDia = this.totalGeneralMetrados ?? 0;

  //   // Asegurar que 'dias' exista
  //   if (!row.dias) row.dias = {};

  //   // Normalizar la clave del día a "DD" (dos dígitos)
  //   const dd = String(this.diaSeleccionado).padStart(2, '0');
  //   row.dias[dd] = totalDia;

  //   // ✅ Recalcular metrado_mes sumando todos los días de esa partida
  //   let sumaMes = 0;
  //   for (const k of Object.keys(row.dias)) {
  //     sumaMes += Number(row.dias[k]) || 0;
  //   }
  //   row.metrado_mes = sumaMes;

  //   // ✅ Recalcular acumulado = metrado_anterior + metrado_mes
  //   row.acumulado = (row.metrado_anterior || 0) + sumaMes;

  //   // ✅ Recalcular saldo = presupuesto - acumulado
  //   row.saldo = (row.metrado_presupuesto || 0) - row.acumulado;
  // }

  private actualizarTotalDiaEnCalendario(fechaPayload: string): void {
    if (this.selFilPlan < 0 || this.selFilPlan >= this.partidas.length) return;

    const row = this.partidas[this.selFilPlan];
    if (!row) return;

    // Derivar el día desde la fecha del payload (yyyy-MM-dd)
    const partes = (fechaPayload || '').split('-');
    if (partes.length !== 3) return;
    const dd = partes[2].padStart(2, '0');

    const totalDia = this.totalGeneralMetrados ?? 0;

    if (!row.dias) row.dias = {};
    row.dias[dd] = totalDia;

    // Recalcular metrado_mes, acumulado y saldo
    let sumaMes = 0;
    for (const k of Object.keys(row.dias)) {
      sumaMes += Number(row.dias[k]) || 0;
    }
    row.metrado_mes = sumaMes;
    row.acumulado = (row.metrado_anterior || 0) + sumaMes;
    row.saldo = (row.metrado_presupuesto || 0) - row.acumulado;
  }

  solicitarGuardado() {
    this.hayCambiosSinGuardar = true;

    if (this.guardando) {
      this.cambiosPendientes = true;
      return;
    }
    this.guardar$.next();
  }

  async flushGuardado() {
    // 1. Cancelar cualquier debounce pendiente
    this.cancelarDebounce$.next();

    // 2. Esperar si hay guardado en vuelo
    while (this.guardando) {
      await new Promise(r => setTimeout(r, 50));
    }

    // 3. Ejecutar guardado actual
    await this.ejecutarGuardado();

    // 4. Repetir si hubo cambios durante el guardado
    while (this.cambiosPendientes) {
      this.cambiosPendientes = false;
      await this.ejecutarGuardado();
    }

    // 5. Re-inicializar la cola (porque cancelamos el Subject)
    this.cancelarDebounce$ = new Subject<void>();
    this.subGuardar?.unsubscribe();
    this.inicializarColaGuardado();
  }

  async ngOnDestroy() {
    this.cancelarFocusPendiente();
    this.subGuardar?.unsubscribe();
    await this.flushGuardado();
  }

  private construirPayload(): { payload: any; filasEnviadas: ItemMetradoDiario[] } {
    // this.calcularEsHoja?.();   // si lo tienes

    const filasSerializadas: string[] = [];
    const filasEnviadas: ItemMetradoDiario[] = [];
    let pos = 0;

    for (const x of this.listaMetradosDiarios) {
      if (x.tipo == null) continue;

      const accion: 'insert' | 'update' =
        (x.id_metrado && x.id_metrado > 0) ? 'update' : 'insert';

      const campos = [
        accion, x.id_metrado ?? 0, x.tipo ?? 0,
        (x.descripcion ?? '').replace(/[;|]/g, ','),
        (x.cantidad ?? '').toString().replace(/[;|]/g, ','),
        (x.n_veces ?? '').toString().replace(/[;|]/g, ','),
        (x.longitud ?? '').toString().replace(/[;|]/g, ','),
        (x.ancho ?? '').toString().replace(/[;|]/g, ','),
        (x.alto ?? '').toString().replace(/[;|]/g, ','),
        (x.detalle1 ?? '').replace(/[;|]/g, ','),
        (x.detalle2 ?? '').replace(/[;|]/g, ','),
        x.subtotal ?? 0, x.total ?? 0,
        (x.formula || this.FORMULA_DEFAULT).replace(/[;|]/g, ','),
        pos, pos,
      ];
      filasSerializadas.push(campos.join(';'));
      filasEnviadas.push(x);
      pos++;
    }

    // ✅ DELETE (esto ya lo tienes, solo confirma que está)
    this.filasParaEliminar
      .filter(x => x.id_metrado && x.id_metrado > 0)
      .forEach(x => {
        const campos = ['delete', x.id_metrado, 0, '', '', '', '', '', '', '', '', 0, 0, '', 0, 0];
        filasSerializadas.push(campos.join(';'));
      });

    return {
      payload: {
        id_proyecto: this.id_proyecto,
        indice: this.selFilPlanIndice ?? 0,
        fecha: this.construirFechaISO(),
        filas_serializadas: filasSerializadas.join('|'),
      },
      filasEnviadas,
    };
  }

  evaluarFormula(texto: string, fuente: 'ent' | 'blur') {
    this.habEditFormula = false;
    this.tempFormula = [];

    const item = this.metradoSeleccionado;
    if (!item) return;

    const formula = (texto || '').toString().toUpperCase().replace(/\s+/g, '');
    if (!formula) return;

    // Validar sintaxis
    const tokens = this.convertirAArray(formula, true);
    const respuesta = this.previaPruebaFormula(tokens);
    if (respuesta.valido == null) {
      this.toaster.error('Fórmula no válida', 'Error', { timeOut: 3000 });
      return;
    }

    // Validar que las celdas referenciadas sean numéricas
    const validacion = this.validarFormulaConValores(item, formula);
    if (!validacion.ok) {
      // S.fire({
      //   icon: 'warning',
      //   title: 'Fórmula con valores no numéricos',
      //   html: validacion.errores.join('<br>'),
      //   confirmButtonText: 'Entendido',
      // });
      this.toaster.error('Fórmula con valores no numéricos')
      return; // No guarda, no altera
    }

    // Guardar
    const formulaFinal = respuesta.arrayCorrecto.join('');
    if (formulaFinal !== item.formula) {
      item.formula = formulaFinal;
      this.recalcularTotalesYJerarquia();
      this.solicitarGuardado();
    }
  }

  // formulaChars(): string[] {
  //   const formula = (this.metradoSeleccionado?.formula ?? 'B*C*D*E*F*G*H').toUpperCase();
  //   return formula.split('');
  // }

  formulaChars(): string[] {
    const formula = (this.metradoSeleccionado?.formula ?? 'B*C*D*E*F*G').toUpperCase();
    return formula.split('');
  }


  stiloFormula() {
    this.habEditFormula = false;
    this.tempFormula = [];
  }

  copiarFormula() {
    const m = this.metradoSeleccionado;
    if (!m || !this.esFilaFormulaEditable(m)) {
      this.toaster.error('Fila seleccionada no válida para copiar fórmula', '', {
        closeButton: false, positionClass: 'toast-bottom-right', timeOut: 2000,
      });
      return;
    }
    this.formulaCopiada = m.formula ?? this.FORMULA_DEFAULT;
    this.toaster.info('Fórmula copiada', '', {
      closeButton: false, positionClass: 'toast-bottom-right', timeOut: 2000,
    });
  }

  async pegarFormula() {
    if (!this.formulaCopiada) {
      this.toaster.error('No hay fórmula copiada', '', { timeOut: 2000 });
      return;
    }
    const m = this.metradoSeleccionado;
    if (!m || !this.esFilaFormulaEditable(m)) {
      this.toaster.error('Fila seleccionada no válida para pegar fórmula', '', { timeOut: 2000 });
      return;
    }
    m.formula = this.formulaCopiada;
    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();
  }

  convertirAArray(texto: string, esFormula: boolean = false): string[] {
    if (!texto) return [];
    let t = String(texto);
    if (esFormula) t = t.toUpperCase().replace(/\s+/g, '');

    const tokens: string[] = [];
    let buffer = '';

    const pushBuffer = () => {
      if (buffer) {
        tokens.push(buffer);
        buffer = '';
      }
    };

    for (const ch of t) {
      // Operadores y paréntesis → token propio
      if (['+', '-', '*', '/', '(', ')'].includes(ch)) {
        pushBuffer();
        tokens.push(ch);
      }
      // Cualquier otro carácter → acumular (número o letra)
      else {
        buffer += ch;
      }
    }
    pushBuffer();

    return tokens;
  }

  // previaPruebaFormula(tokens: string[]): { valido: number | null; arrayCorrecto: string[] } {
  //   const columnas = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];
  //   const nuevoString: (string | number)[] = [];
  //   const formula: string[] = [];
  //   let valido = true;

  //   for (const token of tokens) {
  //     if (/^(\d+\.?\d*|\.\d+)$/.test(token)) {
  //       nuevoString.push(token);
  //       formula.push(token);
  //       continue;
  //     }
  //     if (columnas.includes(token)) {
  //       nuevoString.push(1);
  //       formula.push(token);
  //       continue;
  //     }
  //     if (['+', '-', '*', '/', '(', ')'].includes(token)) {
  //       nuevoString.push(token);
  //       formula.push(token);
  //       continue;
  //     }
  //     valido = false;
  //     break;
  //   }

  //   if (!valido) return { valido: null, arrayCorrecto: [] };

  //   const resultado = this.evaluarExpresion(nuevoString.join(''));
  //   if (resultado === null) return { valido: null, arrayCorrecto: [] };

  //   return { valido: resultado, arrayCorrecto: formula };
  // }

  // calcularFormulaExpresion(item: ItemMetradoDiario): number {
  //   const formula = item.formula ?? 'B*C*D*E*F*G*H';

  //   let expr = formula.toUpperCase();

  //   // Mapa letra → campo del modelo
  //   const mapa: Record<string, keyof ItemMetradoDiario> = {
  //     B: 'detalle1',
  //     C: 'detalle2',
  //     D: 'cantidad',
  //     E: 'n_veces',
  //     F: 'longitud',
  //     G: 'ancho',
  //     H: 'alto',
  //   };

  //   for (const letra of ['B', 'C', 'D', 'E', 'F', 'G', 'H']) {
  //     const campo = mapa[letra];
  //     const raw = item[campo];

  //     // Vacío o no numérico → 1 (neutro multiplicativo)
  //     let valor = 1;
  //     if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
  //       const n = parseFloat(String(raw).replace(',', '.'));
  //       valor = isNaN(n) ? 1 : n;
  //     }

  //     expr = expr.replace(new RegExp(letra, 'g'), valor.toString());
  //   }

  //   try {
  //     // eslint-disable-next-line no-new-func
  //     const result = Function(`"use strict"; return (${expr});`)();
  //     return isNaN(result) || !isFinite(result) ? 0 : result;
  //   } catch {
  //     return 0;
  //   }
  // }
  previaPruebaFormula(tokens: string[]): { valido: number | null; arrayCorrecto: string[] } {
    const columnas = ['B', 'C', 'D', 'E', 'F', 'G'];
    const nuevoString: (string | number)[] = [];
    const formula: string[] = [];
    let valido = true;

    for (const token of tokens) {
      if (/^(\d+\.?\d*|\.\d+)$/.test(token)) {
        nuevoString.push(token);
        formula.push(token);
        continue;
      }
      if (columnas.includes(token)) {
        nuevoString.push(1);
        formula.push(token);
        continue;
      }
      if (['+', '-', '*', '/', '(', ')'].includes(token)) {
        nuevoString.push(token);
        formula.push(token);
        continue;
      }
      valido = false;
      break;
    }

    if (!valido) return { valido: null, arrayCorrecto: [] };

    const resultado = this.evaluarExpresion(nuevoString.join(''));
    if (resultado === null) return { valido: null, arrayCorrecto: [] };

    return { valido: resultado, arrayCorrecto: formula };
  }

  // readonly COLORES_LETRAS: Record<string, string> = {
  //   B: '#c62828',  // rojo oscuro       → DETALLE 1
  //   C: '#f9a825',  // ámbar oscuro      → DETALLE 2
  //   D: '#2e7d32',  // verde oscuro      → CANTIDAD
  //   E: '#1565c0',  // azul oscuro       → # VECES
  //   F: '#6a1b9a',  // púrpura oscuro    → LONGITUD
  //   G: '#e65100',  // naranja oscuro    → ANCHO
  //   H: '#ad1457',  // rosa oscuro       → ALTO
  // };

  readonly COLORES_LETRAS: Record<string, string> = {
    B: '#c62828',  // rojo oscuro    → DETALLE 1
    C: '#2e7d32',  // verde oscuro   → CANTIDAD
    D: '#1565c0',  // azul oscuro    → # VECES
    E: '#6a1b9a',  // púrpura oscuro → LONGITUD
    F: '#e65100',  // naranja oscuro → ANCHO
    G: '#ad1457',  // rosa oscuro    → ALTO
  };

  formulaColoreada(): SafeHtml {
    // const formula = (this.metradoSeleccionado?.formula ?? 'B*C*D*E*F*G*H').toUpperCase();
    const formula = (this.metradoSeleccionado?.formula ?? 'B*C*D*E*F*G').toUpperCase();

    let html = '';
    for (const ch of formula) {
      if (this.COLORES_LETRAS[ch]) {
        html += `<span style="display:inline-block;background:${this.COLORES_LETRAS[ch]};padding:1px 3px;border-radius:2px;font-weight:bold;">${ch}</span>`;
      } else {
        html += `<span style="display:inline-block;">${ch}</span>`;
      }
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  moverArriba() {
    const idx = this.idxSeleccionado;
    if (idx == null || idx < 0) {
      this.toaster.warning('Selecciona una fila primero', '', { timeOut: 2000 });
      return;
    }

    const lista = this.listaMetradosDiarios;
    const filaSel = lista[idx];
    if (!filaSel || filaSel.tipo == null) {
      this.toaster.warning('La fila seleccionada está vacía', '', { timeOut: 2000 });
      return;
    }

    const colActual = this.ultimaCeldaSeleccionada ?? 'descripcion';
    const tipo = filaSel.tipo;

    // Buscar hermano anterior del mismo tipo
    let idxHermano = -1;
    for (let i = idx - 1; i >= 0; i--) {
      const f = lista[i];
      if (f.tipo == null) continue;

      if (tipo === 3) {
        if (f.tipo === 3) { idxHermano = i; break; }
      } else if (tipo === 1) {
        if (f.tipo === 3) break;
        if (f.tipo === 1) { idxHermano = i; break; }
      } else if (tipo === 2) {
        if (f.tipo === 3 || f.tipo === 1) break;
        if (f.tipo === 2) { idxHermano = i; break; }
      } else if (tipo === 4) {
        if (f.tipo === 3 || f.tipo === 1) break;
        if (f.tipo === 4) { idxHermano = i; break; }
      }
    }

    // 🔔 Toaster según el motivo
    if (idxHermano < 0) {
      const mensajes: Record<number, string> = {
        3: 'No hay otro Título antes para intercambiar',
        1: 'No hay otro Metrado antes dentro del mismo Título',
        2: 'No hay otro Submetrado antes dentro del mismo Metrado',
        4: 'No hay otro Texto antes en el mismo nivel',
      };
      this.toaster.warning(
        mensajes[tipo] ?? 'No se puede mover arriba',
        '',
        { timeOut: 2500 }
      );
      return;
    }

    const bloqueHermano = this.obtenerRangoBloque(idxHermano);
    const bloqueActual = this.obtenerRangoBloque(idx);

    const antes = lista.slice(0, bloqueHermano.inicio);
    const bloqueA = lista.slice(bloqueHermano.inicio, bloqueHermano.fin);
    const bloqueB = lista.slice(bloqueActual.inicio, bloqueActual.fin);
    const vacias = lista.slice(bloqueHermano.fin, bloqueActual.inicio);
    const despues = lista.slice(bloqueActual.fin);

    const nuevaLista = [...antes, ...bloqueB, ...vacias, ...bloqueA, ...despues];

    lista.length = 0;
    lista.push(...nuevaLista);

    const nuevoIdx = lista.indexOf(filaSel);
    if (nuevoIdx >= 0) {
      this.idxSeleccionado = nuevoIdx;
      this.filaExcelSel = filaSel;
      this.metradoSeleccionado = filaSel;

      setTimeout(() => this.focarInput(nuevoIdx, colActual, false), 30);
    }

    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();
  }

  moverAbajo() {
    const idx = this.idxSeleccionado;
    if (idx == null || idx < 0) {
      this.toaster.warning('Selecciona una fila primero', '', { timeOut: 2000 });
      return;
    }

    const lista = this.listaMetradosDiarios;
    const filaSel = lista[idx];
    if (!filaSel || filaSel.tipo == null) {
      this.toaster.warning('La fila seleccionada está vacía', '', { timeOut: 2000 });
      return;
    }

    const colActual = this.ultimaCeldaSeleccionada ?? 'descripcion';
    const tipo = filaSel.tipo;

    // Buscar hermano siguiente del mismo tipo
    let idxHermano = -1;
    for (let i = idx + 1; i < lista.length; i++) {
      const f = lista[i];
      if (f.tipo == null) continue;

      if (tipo === 3) {
        if (f.tipo === 3) { idxHermano = i; break; }
      } else if (tipo === 1) {
        if (f.tipo === 3) break;
        if (f.tipo === 1) { idxHermano = i; break; }
      } else if (tipo === 2) {
        if (f.tipo === 3 || f.tipo === 1) break;
        if (f.tipo === 2) { idxHermano = i; break; }
      } else if (tipo === 4) {
        if (f.tipo === 3 || f.tipo === 1) break;
        if (f.tipo === 4) { idxHermano = i; break; }
      }
    }

    // 🔔 Toaster según el motivo
    if (idxHermano < 0) {
      const mensajes: Record<number, string> = {
        3: 'No hay otro Título después para intercambiar',
        1: 'No hay otro Metrado después dentro del mismo Título',
        2: 'No hay otro Submetrado después dentro del mismo Metrado',
        4: 'No hay otro Texto después en el mismo nivel',
      };
      this.toaster.warning(
        mensajes[tipo] ?? 'No se puede mover abajo',
        '',
        { timeOut: 2500 }
      );
      return;
    }

    const bloqueHermano = this.obtenerRangoBloque(idxHermano);
    const bloqueActual = this.obtenerRangoBloque(idx);

    const antes = lista.slice(0, bloqueActual.inicio);
    const bloqueA = lista.slice(bloqueActual.inicio, bloqueActual.fin);
    const bloqueB = lista.slice(bloqueHermano.inicio, bloqueHermano.fin);
    const vacias = lista.slice(bloqueActual.fin, bloqueHermano.inicio);
    const despues = lista.slice(bloqueHermano.fin);

    const nuevaLista = [...antes, ...bloqueB, ...vacias, ...bloqueA, ...despues];

    lista.length = 0;
    lista.push(...nuevaLista);

    const nuevoIdx = lista.indexOf(filaSel);
    if (nuevoIdx >= 0) {
      this.idxSeleccionado = nuevoIdx;
      this.filaExcelSel = filaSel;
      this.metradoSeleccionado = filaSel;

      setTimeout(() => this.focarInput(nuevoIdx, colActual, false), 30);
    }

    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();
  }
  copiarFila() {
    const idx = this.idxSeleccionado;
    if (idx == null) return;

    const lista = this.listaMetradosDiarios;
    const original = lista[idx];
    if (!original) return;

    // 1) Crear copia SIN los IDs
    const copia: ItemMetradoDiario = {
      id_proyecto: original.id_proyecto,
      indice: null,
      fecha: original.fecha,
      tipo: original.tipo,
      descripcion: original.descripcion,
      cantidad: original.cantidad,
      n_veces: original.n_veces,
      longitud: original.longitud,
      ancho: original.ancho,
      alto: original.alto,
      detalle1: original.detalle1,
      detalle2: original.detalle2,
      subtotal: original.subtotal,
      total: original.total,
      formula: original.formula,
      expandido: false,
      oculto: false,
      seleccionado: false,
      id_metrado: null as any,
      index_elemento_gp: null,
      index_titulo: null,
    };

    // 🔑 Guardar en arrayCopiadosMetrado (NO insertar directamente)
    this.arrayCopiadosMetrado = [copia];

    // 🔑 Limpiar las otras fuentes
    this.celdasCopiadosMetrado = [];
    this.arrayCortados = [];

    this.toaster.info('Fila copiada. Selecciona destino y pega.', '', { timeOut: 2500 });
  }

  habilitarMultiple() {
    this.habilitadoCopiar = true;
    this.listaMetradosDiarios.forEach(f => f['editarCopiar'] = false);
  }

  cambioCheckboxFila(checked: boolean, idx: number) {
    const lista = this.listaMetradosDiarios;
    const item = lista[idx];
    if (!item) return;

    item['editarCopiar'] = checked;

    if (item.tipo === 3) {
      // Título → marcar todos los hijos hasta el siguiente título
      for (let i = idx + 1; i < lista.length; i++) {
        if (lista[i].tipo === 3) break;
        if (lista[i].tipo != null) lista[i]['editarCopiar'] = checked;
      }
    } else if (item.tipo === 1) {
      // Metrado → marcar sus submetrados hijos
      for (let i = idx + 1; i < lista.length; i++) {
        if (lista[i].tipo === 1 || lista[i].tipo === 3) break;
        if (lista[i].tipo === 2) lista[i]['editarCopiar'] = checked;
      }
    }

    this.actualizarCheckTodos();
  }

  private actualizarCheckTodos() {
    const filasConTipo = this.listaMetradosDiarios.filter(f => f.tipo != null);
    this.todosCheck = filasConTipo.length > 0 && filasConTipo.every(f => f['editarCopiar']);
  }

  cambioCheckboxTodos() {
    const marcar = this.todosCheck;
    this.listaMetradosDiarios.forEach(f => {
      if (f.tipo != null) f['editarCopiar'] = marcar;
    });
  }

  copiarFilaMultiple() {
    const lista = this.listaMetradosDiarios;

    const marcadas = lista.filter(f => f['editarCopiar'] === true);
    if (!marcadas.length) {
      this.toaster.error('No hay filas seleccionadas', '', { timeOut: 2000 });
      return;
    }

    // 🔑 Guardar en arrayCopiadosMetrado (no en filasCopiadas)
    this.arrayCopiadosMetrado = marcadas.map(fila => {
      const copia: ItemMetradoDiario = {
        id_proyecto: fila.id_proyecto,
        fecha: fila.fecha,
        tipo: fila.tipo,
        descripcion: fila.descripcion,
        cantidad: fila.cantidad,
        n_veces: fila.n_veces,
        longitud: fila.longitud,
        ancho: fila.ancho,
        alto: fila.alto,
        detalle1: fila.detalle1,
        detalle2: fila.detalle2,
        subtotal: fila.subtotal,
        total: fila.total,
        formula: fila.formula,
        expandido: false,
        oculto: false,
        seleccionado: false,
        editarCopiar: false,
        id_metrado: null as any,
        index_elemento_gp: null,
        index_titulo: null,
        indice: null,
      };
      return copia;
    });

    // Limpiar las otras fuentes (solo una activa a la vez)
    this.celdasCopiadosMetrado = [];
    this.arrayCortados = [];

    // Salir del modo selección
    this.habilitadoCopiar = false;
    this.todosCheck = false;
    lista.forEach(f => f['editarCopiar'] = false);

    this.toaster.info(`${this.arrayCopiadosMetrado.length} fila(s) copiadas. Selecciona destino y pega.`, '', {
      timeOut: 3000,
    });
  }

  limpiarCopiados() {
    // 1) Modo selección múltiple
    this.habilitadoCopiar = false;
    this.todosCheck = false;
    this.listaMetradosDiarios.forEach(f => f['editarCopiar'] = false);

    // 2) Modo selección de celdas
    this.copiadoCeldas = false;
    this.celdaInicio = null;
    this.celdaFin = null;

    // 3) Buffers
    this.arrayCopiadosMetrado = [];
    this.celdasCopiadosMetrado = [];
    this.arrayCortados = [];

    // 4) Fórmula copiada
    this.formulaCopiada = null;

    // 5) Estado de fórmula
    this.habEditFormula = false;
    this.tempFormula = [];

    this.toaster.info('Acción cancelada', '', { timeOut: 1500 });
  }

  pegarFila() {
    if (!this.filasCopiadas.length) {
      this.toaster.error('No hay filas copiadas', '', { timeOut: 2000 });
      return;
    }

    const idx = this.idxSeleccionado;
    if (idx == null) {
      this.toaster.error('Selecciona una fila destino', '', { timeOut: 2000 });
      return;
    }

    const lista = this.listaMetradosDiarios;

    // 1) Clonar el buffer (para no compartir referencias si se pega varias veces)
    const copias: ItemMetradoDiario[] = this.filasCopiadas.map(f => ({
      ...f,
      id_metrado: null as any,
      index_elemento_gp: null,
      index_titulo: null,
      indice: null,
      expandido: false,
      oculto: false,
      seleccionado: false,
      editarCopiar: false,
    }));

    // 2) Insertar debajo de la fila seleccionada
    lista.splice(idx + 1, 0, ...copias);

    // 3) Reindexar
    lista.forEach((item, i) => item.indice = i);

    // 4) Recalcular y guardar
    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();

    // 5) Seleccionar la primera fila pegada
    this.idxSeleccionado = idx + 1;
    this.filaExcelSel = copias[0];
    this.metradoSeleccionado = copias[0];

    // 6) Scroll
    setTimeout(() => {
      document.getElementById('ts-' + (idx + 1))?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 50);

    this.toaster.success('Fila(s) pegadas', '', { timeOut: 2000 });
  }

  copiarFraccionTabla() {
    this.copiadoCeldas = true;
    this.celdaInicio = null;
    this.celdaFin = null;
    this.toaster.info('Selecciona la celda inicio', '', { timeOut: 2000 });
  }

  private cancelarFocusPendiente() {
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = undefined;
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = undefined;
    }
  }

  // Cuando el usuario hace mousedown en un <td> de celda editable
  onCeldaMouseDown(event: MouseEvent, fila: number, columna: string) {
    // 1) Cancelar cualquier focus pendiente (evita saltos)
    this.cancelarFocusPendiente();

    // 2) Actualizar selección de celda (para pegar celdas)
    this.ultimaCeldaSeleccionada = columna;
    this.idxSeleccionado = fila;
    this.filaExcelSel = this.listaMetradosDiarios[fila] ?? null;
    this.metradoSeleccionado = this.filaExcelSel;

    // 3) Selección matricial (para copiar/pegar rango)
    this.seleccionarCelda(fila, columna);

    // 4) Si NO es modo "copiadoCeldas", dejar que el navegador haga focus
    //    normal en el <input>. Si quieres forzarlo, descomenta:
    // event.preventDefault();
    // this.focarInput(fila, columna, false);
  }

  onFilaMouseDown(fila: number, item: ItemMetradoDiario) {
    this.cancelarFocusPendiente();
    this.idxSeleccionado = fila;
    this.filaExcelSel = item;
    this.metradoSeleccionado = item;
  }

  seleccionarCelda(fila: number, columna: string) {
    // ✅ Cancelar cualquier focus pendiente
    this.cancelarFocusPendiente();

    if (!this.copiadoCeldas) return;

    const f = Number(fila);
    if (isNaN(f)) return;

    if (!this.celdaInicio) {
      this.celdaInicio = { fila: f, columna };
      this.toaster.info('Selecciona la celda fin', '', { timeOut: 2000 });
      return;
    }

    if (this.celdaInicio.fila === f && this.celdaInicio.columna === columna && !this.celdaFin) {
      return;
    }

    if (!this.celdaFin) {
      this.celdaFin = { fila: f, columna };
      return;
    }

    this.celdaInicio = { fila: f, columna };
    this.celdaFin = null;
  }

  onInputFocus(columna: string) {
    this.ultimaCeldaSeleccionada = columna;
    // ⚠️ NO hacer el.select() aquí. El select nativo del navegador ya lo hace
    //    con el click. Forzarlo causa el salto de foco.
  }

  esCeldaEnRango(fila: number, columna: string): boolean {
    if (!this.copiadoCeldas) return false;
    if (!this.celdaInicio) return false;

    const f = Number(fila);
    if (isNaN(f)) return false;

    const colInicio = this.idxColumna(this.celdaInicio.columna);
    const colActual = this.idxColumna(columna);
    if (colInicio < 0 || colActual < 0) return false;

    // 🔑 Si solo hay celdaInicio → pintar solo esa celda
    if (!this.celdaFin) {
      return f === Number(this.celdaInicio.fila) && colActual === colInicio;
    }

    // Si hay celdaFin → pintar el rango completo
    const colFin = this.idxColumna(this.celdaFin.columna);
    if (colFin < 0) return false;

    const filaMin = Math.min(Number(this.celdaInicio.fila), Number(this.celdaFin.fila));
    const filaMax = Math.max(Number(this.celdaInicio.fila), Number(this.celdaFin.fila));
    const colMin = Math.min(colInicio, colFin);
    const colMax = Math.max(colInicio, colFin);

    return f >= filaMin && f <= filaMax && colActual >= colMin && colActual <= colMax;
  }

  guardarSeleccionadosCeldas() {
    if (!this.celdaInicio || !this.celdaFin) {
      this.toaster.error('Selecciona celda inicio y fin', '', { timeOut: 2000 });
      return;
    }

    const filaMin = Math.min(this.celdaInicio.fila, this.celdaFin.fila);
    const filaMax = Math.max(this.celdaInicio.fila, this.celdaFin.fila);
    const colInicio = this.idxColumna(this.celdaInicio.columna);
    const colFin = this.idxColumna(this.celdaFin.columna);
    const colMin = Math.min(colInicio, colFin);
    const colMax = Math.max(colInicio, colFin);

    const lista = this.listaMetradosDiarios;
    const celdas: Array<{
      filaOrigen: number;
      columna: string;
      valor: any;
      filaOffset: number;
      colOffset: number;
    }> = [];

    for (let f = filaMin; f <= filaMax; f++) {
      for (let c = colMin; c <= colMax; c++) {
        const columna = this.COLUMNAS_EDITABLES[c];
        celdas.push({
          filaOrigen: f,
          columna,
          valor: lista[f]?.[columna as keyof ItemMetradoDiario],
          filaOffset: f - filaMin,   // 🆕
          colOffset: c - colMin,     // 🆕
        });
      }
    }

    this.celdasCopiadosMetrado = celdas;
    this.bloqueCopiado = {
      alto: filaMax - filaMin + 1,
      ancho: colMax - colMin + 1,
    };

    this.arrayCopiadosMetrado = [];
    this.arrayCortados = [];

    this.copiadoCeldas = false;
    this.celdaInicio = null;
    this.celdaFin = null;

    this.toaster.success(`${celdas.length} celda(s) copiadas`, '', { timeOut: 2500 });
  }

  cortarSeleccionados() {
    const lista = this.listaMetradosDiarios;

    let marcadas: ItemMetradoDiario[] = [];
    if (this.habilitadoCopiar) {
      marcadas = lista.filter(f => f['editarCopiar'] === true);
      if (!marcadas.length) {
        this.toaster.error('No hay filas seleccionadas', '', { timeOut: 2000 });
        return;
      }
    } else {
      const idx = this.idxSeleccionado;
      if (idx == null || idx < 0 || !lista[idx]) {
        this.toaster.error('No hay fila seleccionada', '', { timeOut: 2000 });
        return;
      }
      marcadas = [lista[idx]];
    }

    // 🔑 Marcar para DELETE si ya tienen id_metrado
    marcadas.forEach(f => {
      if (f.id_metrado && f.id_metrado > 0) {
        f['_eliminar'] = true;
        // Agregar al payload de eliminación
        this.filasParaEliminar.push(f);
      }
    });

    this.arrayCortados = [...marcadas];

    this.arrayCopiadosMetrado = [];
    this.celdasCopiadosMetrado = [];

    this.habilitadoCopiar = false;
    this.todosCheck = false;
    lista.forEach(f => f['editarCopiar'] = false);

    // 🔑 Remover del array (las de eliminar ya quedaron registradas)
    for (const fila of marcadas) {
      const i = lista.indexOf(fila);
      if (i >= 0) lista.splice(i, 1);
    }

    while (lista.length < this.MIN_FILAS) {
      lista.push(this.crearFilaVacia());
    }

    lista.forEach((item, i) => item.indice = i);
    this.validarEstructuraDespuesDeCambio(0);
    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();

    this.toaster.info(
      `${marcadas.length} fila(s) cortadas. Selecciona destino y pega.`,
      '',
      { timeOut: 3000 }
    );
  }

  private pegarCortado(idxDestino: number, modo: 'debajo' | 'reemplazar' = 'debajo') {
    const lista = this.listaMetradosDiarios;
    const origen = this.arrayCortados;
    if (!origen.length) return;

    // 🔑 1) Quitar del buffer de eliminación las filas que vamos a pegar
    //    (porque ya no deben borrarse, van a reinsertarse en su nuevo lugar)
    const idsPegados = new Set(
      origen.map(f => f.id_metrado).filter(id => id != null && id > 0)
    );
    this.filasParaEliminar = this.filasParaEliminar.filter(
      f => !idsPegados.has(f.id_metrado)
    );

    // 🔑 2) Quitar el flag _eliminar de las filas pegadas (si quedó marcado)
    origen.forEach(f => { delete f['_eliminar']; });

    // 3) Insertar según modo
    if (modo === 'debajo') {
      lista.splice(idxDestino + 1, 0, ...origen);
      this.idxSeleccionado = idxDestino + 1;
    } else {
      lista.splice(idxDestino, 1, ...origen);
      this.idxSeleccionado = idxDestino;
    }

    // 4) Reindexar
    lista.forEach((item, i) => item.indice = i);

    // 5) Validar jerarquía
    this.validarEstructuraDespuesDeCambio(this.idxSeleccionado);

    // 6) Recalcular
    this.recalcularTotalesYJerarquia();
    this.solicitarGuardado();

    // 7) Seleccionar primera fila movida
    this.filaExcelSel = origen[0];
    this.metradoSeleccionado = origen[0];

    // 8) Limpiar buffer de cortado
    this.arrayCortados = [];

    // 9) Scroll
    setTimeout(() => {
      document.getElementById('ts-' + this.idxSeleccionado)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 50);

    this.toaster.success('Filas movidas', '', { timeOut: 2000 });
  }

  private construirFechaISO(): string {
    // mesSeleccionado puede venir como "2026-10" o "10"
    const mes = this.mesSeleccionado;
    const dia = this.diaSeleccionado;

    if (!mes || !dia) {
      return new Date().toISOString().slice(0, 10);
    }

    // Normalizar día a 2 dígitos
    const dd = String(dia).padStart(2, '0');

    // Si mesSeleccionado ya es "YYYY-MM"
    if (/^\d{4}-\d{2}$/.test(mes)) {
      return `${mes}-${dd}`;
    }

    // Si mesSeleccionado es solo "MM" (o "M")
    const mm = String(mes).padStart(2, '0');
    const yyyy = new Date().getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }

  copiarTablaCompleta() {
    const filasValidas = this.listaMetradosDiarios.filter(f => f.tipo != null);

    if (!filasValidas.length) {
      this.toaster.warning('No hay datos para copiar', '', { timeOut: 2000 });
      return;
    }

    // Clonar profundamente y limpiar identidad (id_metrado, id_fila, indice, fecha)
    this.tablaCopiada = filasValidas.map(f => ({
      ...f,
      id_metrado: undefined,
      id_fila: undefined,
      indice: undefined,
      fecha: undefined,
      // Forzar recálculo de UI al pegar
      expandido: true,
      oculto: false,
      seleccionado: false,
      editarCopiar: false,
    }));

    this.toaster.info(
      `${this.tablaCopiada.length} fila(s) copiadas. Selecciona día/partida destino y pulsa Pegar.`,
      '', { timeOut: 3000 }
    );
  }

  async pegarTablaCompleta() {
    // 1. Validaciones
    if (!this.tablaCopiada?.length) {
      this.toaster.error('No hay tabla copiada', '', { timeOut: 2000 });
      return;
    }

    if (this.selFilPlanIndice < 0) {
      this.toaster.warning('Selecciona una partida y un día destino', '', { timeOut: 2500 });
      return;
    }

    if (!this.diaSeleccionado) {
      this.toaster.warning('Selecciona un día destino', '', { timeOut: 2500 });
      return;
    }

    // 2. Confirmar acción destructiva
    const confirmar = await SwalService.confirm(
      'Se eliminarán los registros actuales del día y se reemplazarán por ' +
      this.tablaCopiada.length + ' fila(s). ¿Continuar?',
      'Reemplazar tabla'
    );

    if (!confirmar) return;
    this.mostrar_carga_todo = true;

    try {
      // 3. Flush antes de reemplazar (por si hay cambios pendientes en el día actual)
      if (this.hayCambiosSinGuardar || this.cambiosPendientes || this.filasParaEliminar.length > 0 || this.guardando) {
        await this.flushGuardado();
      }

      // 4. Marcar TODAS las filas actuales con id_metrado para eliminar
      for (const f of this.listaMetradosDiarios) {
        if (f.id_metrado && f.id_metrado > 0) {
          this.filasParaEliminar.push(f);
        }
      }

      // 5. Reemplazar la tabla con las filas copiadas (sin ids)
      const fecha = this.construirFechaISO();
      this.listaMetradosDiarios = this.tablaCopiada.map(f => ({
        ...f,
        id_metrado: null as any,
        id_fila: Math.random().toString(36).substring(2, 9),
        id_proyecto: this.id_proyecto,
        indice: this.selFilPlanIndice,
        fecha: fecha,
        expandido: true,
        oculto: false,
        seleccionado: false,
        editarCopiar: false,
      }));

      // 6. Rellenar con filas vacías hasta MIN_FILAS
      while (this.listaMetradosDiarios.length < this.MIN_FILAS) {
        this.listaMetradosDiarios.push(this.crearFilaVacia());
      }

      // 7. Recalcular totales y disparar guardado
      this.recalcularTotalesYJerarquia();
      this.solicitarGuardado();

      // 8. Actualizar el total del día en el calendario (si tienes el método)
      this.actualizarTotalDiaEnCalendario(fecha);

      // 9. Limpiar buffer de copiado
      this.tablaCopiada = null;

      this.toaster.success('Tabla pegada correctamente', '', { timeOut: 2500 });
    } catch (error) {
      console.error('Error al pegar tabla:', error);
      this.toaster.error('Error al pegar la tabla', '', { timeOut: 3000 });
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  private construirColumnasPlantilla(plantilla: any): void {
    if (!plantilla) {
      this.columnasPlantilla = [];
      return;
    }

    // Cada key de la plantilla (descripcion, cantidad, nveces, ...)
    // tiene un value que es el ORDEN en el header
    const columnas = Object.keys(plantilla)
      .filter(k => k !== 'id_plantilla' && k !== 'nom_plantilla')
      .map(key => ({
        key,
        label: this.etiquetaColumna(key),   // "cantidad" → "CANT."
        orden: Number(plantilla[key]) || 999
      }))
      .filter(c => c.orden < 999)             // ignora keys sin orden
      .sort((a, b) => a.orden - b.orden);

    this.columnasPlantilla = columnas;
  }

  private etiquetaColumna(key: string): string {
    const map: Record<string, string> = {
      item: 'ITEM',
      descripcion: 'DESCRIPCIÓN',
      detalle: 'DETALLE',
      cantidad: 'CANT.',
      nveces: '#VECES',
      factor1: 'FACTOR 1',
      factor2: 'FACTOR 2',
      factor3: 'FACTOR 3',
      glongitud: 'LONGITUD',
      gancho: 'GANCHO',
      galtura: 'ALTURA',
      dlongitud: 'D.LONG.',
      dancho: 'D.ANCHO',
      daltura: 'D.ALTURA',
      area: 'ÁREA',
      volumen: 'VOLUMEN',
      unidad: 'UND.',
      mtotal: 'TOTAL',
      formula: 'FÓRMULA',
    };
    return map[key] ?? key.toUpperCase();
  }

  getValorCelda(det: any, key: string): any {
    const valor = det?.[key];
    if (valor === null || valor === undefined || valor === '') return '';
    // Formateo numérico
    if (['cantidad', 'nveces', 'factor1', 'factor2', 'factor3', 'glongitud', 'gancho', 'galtura',
      'dlongitud', 'dancho', 'daltura', 'area', 'volumen', 'mtotal', 'subtotal', 'total'].includes(key)) {
      const num = parseFloat(String(valor));
      return isNaN(num) ? valor : num.toFixed(2);
    }
    return valor;
  }

  trackByFilaPlanilla(index: number, item: any): any {
    return item?.id_metrado ?? index;
  }

  onFilaMouseDownPlanilla(fila: number, item: any): void {
    this.idxSeleccionadoPlanilla = fila;
  }

  onCeldaMouseDownPlanilla(event: MouseEvent, fila: number, columna: string): void {
    this.cancelarFocusPendiente();

    this.idxSeleccionadoPlanilla = fila;

    if (!this.copiadoCeldasPlanilla) return;

    if (!this.celdaInicioPlanilla) {
      this.celdaInicioPlanilla = { fila, columna };
      this.toaster.info('Selecciona la celda fin', '', { timeOut: 2000 });
      return;
    }

    if (this.celdaInicioPlanilla.fila === fila &&
      this.celdaInicioPlanilla.columna === columna &&
      !this.celdaFinPlanilla) return;

    if (!this.celdaFinPlanilla) {
      this.celdaFinPlanilla = { fila, columna };
      return;
    }

    // Reiniciar selección
    this.celdaInicioPlanilla = { fila, columna };
    this.celdaFinPlanilla = null;
  }

  esCeldaEnRangoPlanilla(fila: number, columna: string): boolean {
    if (!this.copiadoCeldasPlanilla) return false;
    if (!this.celdaInicioPlanilla) return false;

    const colInicio = this.idxColumnaPlantilla(this.celdaInicioPlanilla.columna);
    const colActual = this.idxColumnaPlantilla(columna);
    if (colInicio < 0 || colActual < 0) return false;

    if (!this.celdaFinPlanilla) {
      return fila === this.celdaInicioPlanilla.fila && colActual === colInicio;
    }

    const colFin = this.idxColumnaPlantilla(this.celdaFinPlanilla.columna);
    if (colFin < 0) return false;

    const filaMin = Math.min(this.celdaInicioPlanilla.fila, this.celdaFinPlanilla.fila);
    const filaMax = Math.max(this.celdaInicioPlanilla.fila, this.celdaFinPlanilla.fila);
    const colMin = Math.min(colInicio, colFin);
    const colMax = Math.max(colInicio, colFin);

    return fila >= filaMin && fila <= filaMax &&
      colActual >= colMin && colActual <= colMax;
  }

  private idxColumnaPlantilla(columna: string): number {
    return this.columnasPlantilla.findIndex(c => c.key === columna);
  }

  copiarFraccionTablaPlanilla(): void {
    this.copiadoCeldasPlanilla = true;
    this.celdaInicioPlanilla = null;
    this.celdaFinPlanilla = null;
    this.toaster.info('Selecciona la celda inicio', '', { timeOut: 2000 });
  }

  cancelarSeleccionPlanilla(): void {
    this.copiadoCeldasPlanilla = false;
    this.celdaInicioPlanilla = null;
    this.celdaFinPlanilla = null;
  }

  guardarSeleccionadosCeldasPlanilla(): void {
    if (!this.celdaInicioPlanilla || !this.celdaFinPlanilla) {
      this.toaster.error('Selecciona celda inicio y fin', '', { timeOut: 2000 });
      return;
    }

    const filaMin = Math.min(this.celdaInicioPlanilla.fila, this.celdaFinPlanilla.fila);
    const filaMax = Math.max(this.celdaInicioPlanilla.fila, this.celdaFinPlanilla.fila);
    const colInicio = this.idxColumnaPlantilla(this.celdaInicioPlanilla.columna);
    const colFin = this.idxColumnaPlantilla(this.celdaFinPlanilla.columna);
    const colMin = Math.min(colInicio, colFin);
    const colMax = Math.max(colInicio, colFin);

    const celdas: Array<{
      filaOrigen: number;
      columna: string;
      valor: any;
      filaOffset: number;
      colOffset: number;
    }> = [];
    let ignoradas = 0;

    for (let f = filaMin; f <= filaMax; f++) {
      for (let c = colMin; c <= colMax; c++) {
        const col = this.columnasPlantilla[c];
        if (!col) continue;

        const keyDestino = this.normalizarKey(col.key);
        if (!keyDestino) { ignoradas++; continue; }

        celdas.push({
          filaOrigen: f,
          columna: keyDestino,
          valor: this.partidasPlanilla[f]?.[col.key] ?? '',
          filaOffset: f - filaMin,   // 🆕
          colOffset: c - colMin,     // 🆕
        });
      }
    }

    if (!celdas.length) {
      this.toaster.error('Las columnas seleccionadas no son pegables en la tabla principal', '', { timeOut: 2500 });
      return;
    }

    this.celdasCopiadosMetrado = celdas;
    this.bloqueCopiado = {
      alto: filaMax - filaMin + 1,
      ancho: colMax - colMin + 1,
    };

    this.arrayCopiadosMetrado = [];
    this.arrayCortados = [];

    this.copiadoCeldasPlanilla = false;
    this.celdaInicioPlanilla = null;
    this.celdaFinPlanilla = null;

    let msg = `${celdas.length} celda(s) copiadas`;
    if (ignoradas > 0) msg += `, ${ignoradas} ignorada(s)`;
    this.toaster.success(msg, '', { timeOut: 2500 });
  }

  private normalizarKey(key: string): string | null {
    const mapped = this.MAPA_KEYS_PLANTILLA[key];
    return mapped ?? null;   // null = no se puede pegar
  }

  toggleFilaPlanilla(row: any, indexFila: number): void {
    if (!row.esPadre) return;   // solo agrupadores pueden contraer

    row.expandido = !row.expandido;
    const ocultar = !row.expandido;

    const nivelPadre = row.nivel ?? 0;

    for (let i = indexFila + 1; i < this.partidasPlanilla.length; i++) {
      const hijo = this.partidasPlanilla[i];
      const nivelHijo = hijo.nivel ?? 0;

      // Si llegamos a un hermano o superior → detener
      if (nivelHijo <= nivelPadre) break;

      // Ocultar/mostrar solo hijos directos y descendientes
      hijo.oculto = ocultar;
      if (ocultar) hijo.expandido = false;   // contraer también los nietos
    }
  }

  // trackByFilaPlanilla(index: number, item: any): any {
  //   return item?.id_fila ?? item?.indice ?? index;
  // }

  getPaddingLeftPlanilla(item: string): number {
    if (!item) return 0;
    const nivel = item.split('.').length - 1;
    return nivel * 5;
  }

  toggleColumnasFijas(): void {
    this.columnasFijas = !this.columnasFijas;
  }

  async cargarCalendarioDetalle(): Promise<void> {
    try {
      const resp = await this.RecursosHumanosService.listarMetradoDiarioDetalleMes({
        id_proyecto: this.id_proyecto
      });

      if (resp) {
        this.mesSeleccionadoDetalle = resp.mes_seleccionado;
        this.listaMesesProyectoDetalle = resp.meses_proyecto || [];
        this.cabeceraDiasDetalle = resp.calendario_cabecera || [];

        this.partidasDetalle = (resp.partidas || []).map((p: any) => ({
          ...p,
          expandido: true,
          visible: true
        }));
      }
    } catch (error) {
      console.error('Error cargando detalle:', error);
      SwalService.error();
    }
  }

  async onChangeMesDetalle(nuevoMes: string): Promise<void> {
    if (!nuevoMes) return;

    try {
      this.mostrar_carga_todo = true;

      const resp = await this.RecursosHumanosService.listarMetradoDiarioDetalleMes({
        id_proyecto: this.id_proyecto,
        mes: nuevoMes
      });

      if (resp) {
        this.mesSeleccionadoDetalle = resp.mes_seleccionado;
        this.cabeceraDiasDetalle = resp.calendario_cabecera || [];
        this.partidasDetalle = (resp.partidas || []).map((p: any) => ({
          ...p,
          expandido: true,
          visible: true
        }));
      }
    } catch (error) {
      SwalService.error();
      console.error(error);
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  toggleDetallePartida(partida: any, idx: number): void {
    partida.expandido = !partida.expandido;
  }

  onDetalleMouseDown(iPartida: number, jDetalle: number): void {
    this.idxSeleccionadoDetalle = iPartida;
    this.idxDetalleSeleccionado = jDetalle;
  }

  getPaddingLeftDetalle(d: any, p: any): number {
    const nivelPadre = p?.item ? String(p.item).split('.').length - 1 : 0;

    let nivelRelativo = 1;
    if (d.tipo === 3) nivelRelativo = 1;  // Título → hijo directo
    if (d.tipo === 1) nivelRelativo = 2;  // Metrado → hijo del título
    if (d.tipo === 2) nivelRelativo = 3;  // Submetrado → hijo del metrado

    return (nivelPadre + nivelRelativo) * 14;
  }


  tieneSubHijos(d: any, detalles: any[], j: number): boolean {
    // Solo Metrado (1) y Título (3) pueden tener hijos
    if (d.tipo !== 1 && d.tipo !== 3) return false;

    if (j >= detalles.length - 1) return false;

    const siguiente = detalles[j + 1];

    // Si el siguiente es de MAYOR jerarquía o igual → no es hijo
    // Criterio: el siguiente debe ser un tipo "de menor rango"
    if (d.tipo === 1) {
      // Metrado → su hijo es Submetrado (2)
      return siguiente.tipo === 2;
    }

    if (d.tipo === 3) {
      // Título → su hijo puede ser Metrado (1) o Submetrado (2)
      return siguiente.tipo === 1 || siguiente.tipo === 2;
    }

    return false;
  }

  toggleSubDetalle(d: any): void {
    d.expandido = d.expandido !== false ? false : true;

    const detalles = this.partidasDetalle
      .find((pp: any) => pp.detalles?.includes(d))?.detalles ?? [];
    const idx = detalles.indexOf(d);
    if (idx < 0) return;

    const ocultar = d.expandido === false;

    // Ocultar/mostrar todos los descendientes según el tipo
    for (let i = idx + 1; i < detalles.length; i++) {
      const sig = detalles[i];

      // Detenernos cuando lleguemos a un hermano o superior
      if (d.tipo === 3 && (sig.tipo === 3)) break;   // siguiente título → stop
      if (d.tipo === 1 && (sig.tipo === 1 || sig.tipo === 3)) break;   // siguiente metrado/título → stop

      // Ocultar descendientes
      sig.oculto = ocultar;

      // Si el descendiente también tiene hijos y estamos contrayendo, contraer también
      if (ocultar) sig.expandido = false;
    }
  }



  debeMostrarTogglePartida(p: any): boolean {
    const esTitulo = !p?.unidad || String(p.unidad).trim() === '';
    if (esTitulo) return true;                  // ✅ títulos siempre tienen toggle
    return this.partidaTieneHijos(p);           // ✅ partidas solo si tienen hijos
  }

  partidaTieneHijos(p: any): boolean {
    return Array.isArray(p?.detalles) && p.detalles.length > 0;
  }

  esTituloSinUnidad(row: any): boolean {
    return !row?.unidad || String(row.unidad).trim() === '';
  }

  async cargarEstadoRegistroMetrados(): Promise<void> {
    try {
      this.mostrar_carga_todo = true;

      console.group('🚀 cargarEstadoRegistroMetrados');
      console.log('valorPlanificadoPorMes:', this.valorPlanificadoPorMes);
      console.log('Keys del mapa:', Object.keys(this.valorPlanificadoPorMes));

      // ─────────────────────────────────────────────
      // 1) Validación temprana
      // ─────────────────────────────────────────────
      const tieneVP = Object.keys(this.valorPlanificadoPorMes).length > 0;
      if (!tieneVP) {
        console.warn('⚠️ valorPlanificadoPorMes está VACÍO. Se cargará el cronograma primero.');
        await this.CronogramaValorizado();
        console.log('valorPlanificadoPorMes después de CronogramaValorizado:', this.valorPlanificadoPorMes);
      }

      // ─────────────────────────────────────────────
      // 2) Llamar al backend
      // ─────────────────────────────────────────────
      const resp = await this.RecursosHumanosService.estadoRegistroMetrados({
        id_proyecto: this.id_proyecto
      });

      console.log('respuesta backend:', resp);

      if (resp) {
        this.estadoResumen = resp.resumen ?? this.estadoResumen;
        this.estadoTotales = resp.totales ?? this.estadoTotales;

        // ─────────────────────────────────────────────
        // 3) Cruzar cada mes con el VP del cronograma
        // ─────────────────────────────────────────────
        this.estadoMeses = (resp.meses ?? []).map((m: any) => {
          const vp = this.valorPlanificadoPorMes[m.codigo_mes] ?? 0;

          console.log(
            `  → Mes ${m.codigo_mes} (${m.label_mes}): VP=${vp}, EV=${m.valor_ejecutado}`
          );

          const ev = Number(m.valor_ejecutado) || 0;
          const avance = vp > 0 ? (ev / vp) * 100 : 0;
          const desviacion = vp - ev;

          return {
            ...m,
            valor_planificado: vp,
            avance: avance,
            desviacion: desviacion
          };
        });

        console.log('estadoMeses FINAL:', this.estadoMeses);

        // ─────────────────────────────────────────────
        // 4) Recalcular totales
        // ─────────────────────────────────────────────
        this.recalcularResumenConVP();
        console.log('estadoTotales FINAL:', this.estadoTotales);
        console.log('estadoResumen FINAL:', this.estadoResumen);
      }

      console.groupEnd();
    } catch (error) {
      console.error('❌ Error al cargar estado de metrados:', error);
      SwalService.error();
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  private recalcularResumenConVP(): void {
    let totalVP = 0;
    let totalEV = 0;

    this.estadoMeses.forEach((m: any) => {
      totalVP += Number(m.valor_planificado) || 0;
      totalEV += Number(m.valor_ejecutado) || 0;
    });

    this.estadoTotales.total_planificado = totalVP;
    this.estadoTotales.total_ejecutado = totalEV;
    this.estadoTotales.desviacion_total = totalVP - totalEV;
    this.estadoTotales.avance_general = totalVP > 0 ? (totalEV / totalVP) * 100 : 0;

    // También el resumen de arriba
    this.estadoResumen.valor_planificado = totalVP;
    this.estadoResumen.valor_ejecutado = totalEV;
    this.estadoResumen.avance_general = totalVP > 0 ? (totalEV / totalVP) * 100 : 0;
  }

  async CronogramaValorizado() {
    this.id_usuario = this._EncriptadorService.recuperarlocalstory('idusuario');
    await this.recuperarDatosProyecto(this.id_proyecto)
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
    // this.dataCalendMat = await this.generarCalendarioMaterialesPorTipo('MANO DE OBRA');
  }

  async listarVersiones() {
    this.versions = []
    const obj = {
      id_proyecto: this.id_proyecto
    }
    const res = await this.RecursosHumanosService.listarVersionProgramacion(obj)
    this.versions.push({ descripcion: 'Base (No Editable)', id_version: 0, id_proyecto: this.id_proyecto })
    this.versions = this.versions.concat(res)
    if (this.versions.length > 0) {
      this.version = this.versions[this.versions.length - 1].id_version

    } else {

      this.version = 0
    }
  }

  async cargarDatos() {
    let resulta = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.id_proyecto,
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


      this.arrayDiasNoLabEdit = nolab1 == '' ? [] : nolab1.split('|');
    }
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
      id_proyecto: this.id_proyecto,
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

  async listarProgramacion(inicio = false) {
    const input = { id_proyecto: this.id_proyecto, version: this.version };
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
      id_proyecto: this.id_proyecto,
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

  async recuperarCalendario(fechaIniGrafico, fechaFinGrafico) {
    let data = []
    if (fechaIniGrafico && fechaFinGrafico) {

      const objeto = {
        id_proyecto: this.id_proyecto,
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
      this.valorPlanificadoPorMes = {};

      this.mesesHeader.forEach((mes: any, idx: number) => {
        // item.inicio tiene formato 'YYYY-MM-DD'
        const codigo = moment(mes.inicio).format('YYYY-MM');   // 'YYYY-MM'
        const montoVP = Number(this.totalesDesembolso[idx]) || 0;
        this.valorPlanificadoPorMes[codigo] = montoVP;
      });

      // this.sumPorcDesem = sumPorc;
      // if (Number(this.sumPorcDesem) > 100) {
      //   this.sumPorcDesem = this.formsService.redondeo(100, 2);
      // }
      // this.tablaDesemDesactua = false;
      // await this.listarInsumosXProyecto();
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

  // async listarInsumosXProyecto() {
  //   try {
  //     this.listaInsumos = [];
  //     const obj = {
  //       id_proyecto: this.id_proyecto,
  //     };
  //     const response = await this.principalService.relacionInsumosProy(obj);
  //     this.listaInsumos = response.length ? response : [];
  //   } catch (error) {
  //     console.error('Error:', error);
  //     this.mostrar_carga_todo = false;
  //     SwalService.error(error)
  //   }

  // }
}
