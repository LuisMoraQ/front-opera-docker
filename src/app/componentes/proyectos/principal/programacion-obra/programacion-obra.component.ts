import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Gantt from 'frappe-gantt';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import * as XLSX from 'xlsx';
import { ModalHitoComponent } from './modal-hito/modal-hito.component';
import { ModalProgramacionXmlComponent } from './modal-programacion-xml/modal-programacion-xml.component';
import { ReportesComponent } from '../../reportes/reportes.component';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8;';
const EXCEL_EXT = '.xlsx';
import html2canvas from 'html2canvas';
var js2xmlparser = require('js2xmlparser');
moment.locale('es');

import { Chart } from 'chart.js';
import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2,
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

export interface rutaCritica {
  id: number;
  duracion: number;
  predecesora: string;
  nodosPadre: string;
  duracionreal: number;
  inicioCercano: 0;
  finalCercano: 0;
  inicioLejano: 0;
  finalLejano: 0;
  holgura: null;
  referencia: string;
  diasdd: string;
}

export interface filaGantt {
  id: string;
  name: string;
  start: string;
  end: string;
  dependencies: string;
  referencias: string;
  custom_class: string;
  index: number;
  item: string;
  unidad: string;
  types: any;
  cuadrillaMQ: any;
  cuadrillaEQ: any;
}

@Component({
  selector: 'app-programacion-obra',
  templateUrl: './programacion-obra.component.html',
  styleUrls: ['./programacion-obra.component.scss'],
})
export class ProgramacionObraComponent implements OnInit, OnDestroy {
  @ViewChild('box') box: ElementRef;
  public chart: any;
  public chart2: any;
  indiceSeleccionado: any = null;
  fechaFinGrafico: string;
  fechaIniGrafico: string;
  tabSelect: any = 1;
  tablaDesembolso: any[] = [];
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
  coloresProgra = [
    { nombre: 'color_1', id: '#ccc3a980' },
    { nombre: 'color_2', id: '#c674d180' },
    { nombre: 'color_3', id: '#95B9DD80' },
    { nombre: 'color_4', id: '#ef616180' },
    { nombre: 'color_5', id: '#86e54180' },
    { nombre: 'color_6', id: '#eea02680' },
  ];
  totalesDesembolso: any[] = [];
  redTotDesem = [];
  porcentajesDesembolso: any[] = [];
  sumaTotalParciales: any = null;
  tablaDesemDesactua = false;
  tablaMatDesac = false;
  tablaGrafDesac = false;
  calendarioMateriales: any[] = [];
  totalesCalendMat: any[] = [];
  totalParcialesCalMat = null;
  rowSeleccionado: any = null;
  progTiempNoVAlidos: boolean;
  noLaborables = [];
  plazoHabil: number = 0;
  tablaIdGantt: filaProgramacion[] = [];
  detallesGenerados: boolean = false;
  ffLimite: any;
  fiLimite: any;
  limitesIncorrectos: boolean = false;
  detalleGenerado: boolean = true;
  colorNoLabo: any;
  colorFeriado: any;
  colorActual: any;
  verMontos: boolean = false;
  widthTotales: number = 0;
  dataHeader: any = [];
  porcentajes: any[] = [];
  totalPorc: number = 0;
  total: number = 0;
  totalesMateriales: any[] = [];
  totColRedMat = [];
  totalColumna: any = null;
  partsInsumos: any = null;
  totInsumDEtalles: any[] = [];
  listaInsumos: any = [];
  sumPorcDesem: any = null;
  mesesMostrar: any[] = [];
  ocultarFueraRango = false;
  fueraPlazo: boolean = false;
  ffProyecto: any;
  fiProyecto: string;
  hTabla: number;
  hGantt: number;
  widthCalendario: number;
  nroMeses: any[];
  porcTotMat: any[];
  totalPorcMat: string = '';
  existetemp: boolean = false;
  tablaGrafico: any[] = [];
  versionEditable: boolean = false
  @Input() set ocultarMenu(value: any) {
    this.menuOculto = value;
    if (this.view_mode) {
      if (this.menuOculto) {
        this.widthHeaderGantt = this.width + 45;
      } else {
        this.widthHeaderGantt = this.width + 150;
      }
    }
  }
  @Input('width') public width: number = document.body.clientWidth / 2;
  @Input('height') public height: number = 600;
  @Input('left') public left: number = 0;
  @Input('top') public top: number = 0;
  @Input() idProyecto = null;
  @Input() nombreProyecto = '';

  mostrar_carga_todo: boolean = false;
  mostrar_carga_todo2: boolean = false;
  buscando: boolean = false;

  public status: Status = Status.OFF;
  public mouse: { x: number; y: number };
  private boxPosition: { left: number; top: number };
  private containerPos: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };

  id_usuario: any;
  aspectos: any;
  dec_metrado = 4;
  mask_metrado = '0.4';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  dec_cant = 4;
  mask_cant = '0.4';
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  menuOculto = false;
  widthHeaderGantt: number;
  tamanioPantalla: number;
  dataProyecto = null;
  FFRestriccion: string;
  hoy = new Date();

  feriados: any = [];
  feriadosGantt: any = [];
  dataPrincipal: filaProgramacion[] = [];
  listaPartidas: any[] = [];
  uidsOrdenados: any[] = [];
  tasks = [];
  arrayAnteriorRC: any[] = [];
  arrayNuevoRC: any[] = [];
  seleccionados: any[] = [];
  hitosEliminados = [];
  arrayDiasNoLabEdit = [];
  tablaDetallePartida = [];

  rutaCriticaActualizada: boolean = true;
  actualizarHeader = null;
  fechaFinalGrafico: string = '';
  noEnlazar = false;

  gantt;
  ocultarColumnas = true;
  columnDiasCalendario = false;
  columnDiasRequeridos = false;
  columnCuadrilla = false;
  columnRendimiento = false;
  columnMetrado = false;
  columnRestriccion = false;

  displayBasic: boolean;
  displayBasic2: boolean;
  displayBasic3: boolean;

  fechaRestriccion = '';
  fechaRestriccion2 = '';
  acumuladorClicks = 0;
  partidaSeleccionada = null;
  filaSel = null;
  hitoAgregado: boolean = false;
  prograNoActua = false;
  ganttIniciado = false;
  buscando5 = false;
  active = 1;
  aspectosdias: any;
  tablaferiados = [];
  colores: any;
  decima: any;
  tipoProy = '';
  desacGrafico = [];
  grupoDesactualizados = [];
  solover = false;
  simbolo
  @Input() set tabproyecto(value: any) {
    this.idProyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    this.simbolo = datosrec.value.simbolo
  }
  columnasEstatica = false;
  columnasEstatica2 = false;
  formPredecesor = new UntypedFormGroup({
    tablaDetalle: new UntypedFormArray([]),
  });
  get tablaDetalle(): UntypedFormArray {
    return this.formPredecesor.get('tablaDetalle') as UntypedFormArray;
  }

  submitModal: boolean = false;
  FIinvalido: boolean = false;
  FFinvalido: boolean = false;
  stringPredecesor: string = '';
  tiposPredecesor = [
    { id: 'FC', value: 'FIN A COMIENZO' },
    { id: 'CC', value: 'COMIENZO A COMIENZO' },
    { id: 'FF', value: 'FIN A FIN' },
    { id: 'CF', value: 'COMIENZO A FIN' },
  ];
  listaPartidas2 = [];
  habilitarEditarTab1 = false;
  editadoFeriados = false;
  editadoJornada = false;

  verGrafico = false;
  view_mode = 'Day';
  actualizarTodo = false;
  ultimoidGantt = null;
  verDetalle = false;
  colspanAnios = [];
  filaValorizado = null;
  filaMateriales = null;

  preventscroll = false;
  filaModal = null;
  titulosActualizar = [];
  moneda = 'S/';

  tipoGraf = 'line';
  datosGraf: any;
  opcionesGraf: any;
  @ViewChild('modalPartInsum') modalPartInsum: ModalBasicComponent;
  wDescripcion = 300;

  startTimer: any; //temporales
  running = false; //temporales
  tiempo = 0; //temporales
  bloqtemp = false; //temporales
  timer2: any; //temporales
  initim2 = false; //temporales
  worker: Worker; //temporales
  token: any; //temporales

  colorFeriadosLey = '#ccc3a980';
  colorNoLaboLey = '#ccc3a980';
  colorDiaActLey = '#ccc3a980';
  wReferencia = 111;
  itemAuxActivo = false
  arrItemsAux = []

  versions = []
  version = null
  @ViewChild("modalAgregarVersion") modalAgregarVersion: ModalBasicComponent;
  formVersion = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required])
  })
  get descripcion(): UntypedFormControl { return this.formVersion.get('descripcion') as UntypedFormControl }
  constructor(
    private toaster: ToastrService,
    public formsService: FormsService,
    private modalService: NgbModal,
    private presuservice: PresupuestosService,
    private _EncriptadorService: EncriptadorService,
    private principalService: PrincipalService,
    private encriptadorService: EncriptadorService,
    private recursosHumanosService: RecursosHumanosService
  ) {
    if (typeof Worker !== 'undefined') {
      //temporales
      this.worker = new Worker(
        new URL('src/app/workers/work1.worker', import.meta.url),
        { type: 'module' }
      );
    } //temporales
  }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true;

      await this.listarVersiones()
      let decimales = this.decima;
      if (decimales?.toString().includes('|')) {
        let arrdec = decimales.split('|');
        this.dec_metrado = arrdec[0];
        this.mask_metrado = '0.' + arrdec[0];
        this.dec_precio = arrdec[1];
        this.mask_precio = '0.' + arrdec[1];
        this.dec_parcial = arrdec[2];
        this.mask_parcial = '0.' + arrdec[2];
        this.dec_cant = arrdec[3];
        this.mask_cant = '0.' + arrdec[3];
      }
      this.token = await this.encriptadorService.recuperarlocalstory('token'); //temporales
      this.onResize();
      this.pintar();
      await this.permisosUsuario();
      await this.iniciarProyecto();
      this.hTablasDinamico();
      this.tablaDetalle.valueChanges.subscribe(
        async (data) => await this.referenciaActualModal()
      );
      // this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      this.buscando = false;
      console.log(error);
      SwalService.error();
    }
  }

  async permisosUsuario() {
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
    });
    if (datoaccs.length) {
      if (datoaccs[0]?.progra == 0) {
        this.solover = true;
      }
    }
  }

  async actualizarPrograInd(arrIndices) {
    let partidas = [];
    for (const row of this.dataPrincipal) {
      if (row.unidad) {
        if (!row.indice_ref_hito) {
          if (arrIndices.includes(row.uid)) {
            row.filaEditada = false;
          } else {
            let editado = row.filaEditada;
            let limpiar = false;
            if (row.condini) {
              var condini = JSON.parse(row.condini);
              if (arrIndices.includes(condini[0])) {
                row.condini = '';
                limpiar = true;
                editado = true;
              }
            }
            if (row.condfin) {
              var condfin = JSON.parse(row.condfin);
              if (arrIndices.includes(condfin[0])) {
                row.condfin = '';
                limpiar = true;
                editado = true;
              }
            }
            if (row.hijos_uid) {
              var hijos_uid = JSON.parse(row.hijos_uid);
              let nuevo_hijos = [];
              for (const hijo of hijos_uid) {
                if (!arrIndices.includes(hijo)) {
                  nuevo_hijos.push(hijo);
                } else {
                  editado = true;
                }
              }
              row.hijos_uid = !nuevo_hijos.length
                ? ''
                : JSON.stringify(nuevo_hijos);
            }
            if (limpiar) {
              row.referenciados = '';
              row.referencia = '';
            } else {
              if (row.referenciados) {
                var referenciados = JSON.parse(row.referenciados);
                let indices = [];
                let i = 0;
                for (const ref of referenciados) {
                  if (arrIndices.includes(ref[0])) {
                    indices.unshift(i);
                  }
                  i++;
                }
                if (indices.length) {
                  let referencia = row.referencia.split(',');
                  for (const indic of indices) {
                    referenciados.splice(indic, 1);
                    referencia.splice(indic, 1);
                    editado = true;
                  }
                  row.referencia = referencia.join(',');
                  if (!referenciados.length) {
                    row.referenciados = '';
                  } else {
                    row.referenciados = JSON.stringify(referenciados);
                  }
                }
              }
            }

            if (editado) {
              if (row.hijos == null) {
                row.hijos = '';
              }
              if (row.hijos_uid == null) {
                row.hijos_uid = '';
              }
              if (row.indice_ref_hito == null) {
                row.indice_ref_hito = '';
              }
              partidas.push(row);
            }
          }
        } else {
          var indice_ref_hito = row.indice_ref_hito;
          if (arrIndices.includes(indice_ref_hito)) {
            // editado = true;
            this.hitosEliminados.push(row.uid);
          }
        }
      }
    }
    return partidas;
  }

  async iniciarProyecto() {
    const tempPresu = await this.ListarPresupuestoTemp();
    if (tempPresu) {
      this.mostrar_carga_todo = false;
      SwalService.warning(
        'Error',
        'Cambios no guardados en Edicion de presupuesto. El encargado  debe guardar o descartar los cambios en la vista edicion de presupuesto'
      );
      return;
    }
    await this.recuperarDatosProyecto(this.idProyecto);
    if (!this.dataProyecto.fecha_culmina) {
      this.mostrar_carga_todo = false;
      SwalService.warning(
        'Error',
        'Proyecto sin fecha culminacion registrada.'
      );
      return;
    }
    await this.cargarDatos();
    await this.listaFeriados();
    if (!this.plazoHabil) {
      this.mostrar_carga_todo = false;
      SwalService.warning('Error', 'Plazo del proyecto no valido.');
      return;
    }
    await this.listarProgramacion(true);
  }

  async ListarPresupuestoTemp() {
    this.id_usuario = this._EncriptadorService.recuperarlocalstory('idusuario');
    const obj = { id_proyecto: this.idProyecto, id_usuario: '' };
    const response = await this.presuservice.ExistePresuTemp(obj);
    return response.length ? true : false;
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  setStatus(event: MouseEvent, status: number) {
    if (status === 1) {
      event.stopPropagation();
    }
    this.status = status;
    this.hTablasDinamico();
  }

  async hTablasDinamico() {
    var face1 = document.getElementById('tablaProgramacion');
    var face2 = document.getElementById('ganttTabla');
    const overTP = face1?.offsetHeight - face1?.clientHeight;
    const overGT = face2?.offsetHeight - face2?.clientHeight;
    if (overTP > overGT) {
      this.hTabla = this.height + 17;
      this.hGantt = this.height;
    } else if (overTP == overGT) {
      this.hTabla = this.height;
      this.hGantt = this.height;
    } else {
      this.hTabla = this.height;
      this.hGantt = this.height + 17;
    }
  }

  SyncScroll() {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face1 = document.getElementById('tablaProgramacion');
    var face2 = document.getElementById('ganttTabla');
    var face3 = document.getElementById('tablaMontos');

    face1.scrollTop = face2.scrollTop;
    if (this.verMontos) {
      face3.scrollLeft = face2.scrollLeft;
    }
  }

  SyncScroll2() {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face1 = document.getElementById('tablaProgramacion');
    var face2 = document.getElementById('ganttTabla');
    face2.scrollTop = face1.scrollTop;
  }

  pintar() {
    this.id_usuario = this._EncriptadorService.recuperarlocalstory('idusuario');
    this.aspectos = JSON.parse(this.colores);
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }

  private resize() {
    if (this.resizeCondMeet()) {
      // this.width = Number(this.mouse.x > this.boxPosition.left) ? this.mouse.x - this.boxPosition.left : 0;
      this.width = Number(this.mouse.x);
      if (this.menuOculto) {
        this.widthHeaderGantt = this.width + 45;
      } else {
        this.widthHeaderGantt = this.width + 150;
      }
      this.anchoGant();
    }
  }

  private resizeCondMeet() {
    let right;
    if (this.menuOculto) {
      right = this.containerPos.left + 70;
    } else {
      right = this.containerPos.left;
    }

    return (
      this.mouse.x > right &&
      this.mouse.x < this.tamanioPantalla &&
      this.mouse.y < this.containerPos.bottom
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    var resto;
    if (document.body.clientWidth <= 992) {
      resto = 162;
    } else {
      resto = 162;
    }
    if (this.view_mode) {
      if (this.ocultarMenu) {
        this.tamanioPantalla = document.body.clientWidth - 5;
      } else {
        this.tamanioPantalla = document.body.clientWidth - 105;
      }
    } else {
      this.width = document.body.clientWidth;
    }
    if (this.verMontos || this.verDetalle) {
      this.anchoGant();
    } else {
      this.height = window.innerHeight - resto;
    }
    return;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse = { x: event.clientX, y: event.clientY };
    if (this.status === Status.RESIZE) this.resize();
  }

  async listarTemporalProgramacion() {
    let datosRecuperados = null;

    const obj = {
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
    };
    const response =
      await this.principalService.listarCambiosTemporalesProgramacion(obj);
    if (response) {
      // datosRecuperados = JSON.parse(response.dataprogra);
      datosRecuperados = await this.encriptadorService.descomprimirJSON(
        response.dataprogra
      );
    }
    return datosRecuperados;
  }

  // async guardarTemporalProgramacion(fuente) {
  //   const datos = {
  //     dataPrincipal: this.dataPrincipal,
  //     prograNoActua: this.prograNoActua,
  //     hitosEliminados: this.hitosEliminados,
  //   };
  //   const dataprogra = JSON.stringify(datos);
  //   const obj = {
  //     id_proyecto: this.idProyecto,
  //     id_usuario: this.id_usuario,
  //     dataprogra: dataprogra,
  //   };
  //   const response =
  //     await this.principalService.guardarCambiosTemporalesProgramacion(obj);
  //   this.existetemp = true;
  //   this.ocultarvistaInferior();
  // }

  async guardarTemporal(dataPrincipal, prograNoActua, hitosEliminados) {
    try {
      this.bloqtemp = true;

      const datos = {
        dataPrincipal: dataPrincipal,
        prograNoActua: prograNoActua,
        hitosEliminados: hitosEliminados,
      };
      let tabla_1 = '';
      await this.compressTextAsync(JSON.stringify(datos))
        .then((compressedText) => {
          tabla_1 = compressedText;
        })
        .catch((error) => {
          console.error('Error en la compresión:', error);
        });
      const obj = {
        id_proyecto: this.idProyecto,
        id_usuario: this.id_usuario,
        dataprogra: tabla_1,
      };
      const response =
        await this.principalService.guardarCambiosTemporalesProgramacion(obj);
      this.existetemp = true;
      this.bloqtemp = false;
      this.stop();
    } catch (e) {
      console.log('e', e)
      SwalService.error()
    }
  }

  async descartarTemporalProgramacion() {
    const obj = {
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
    };
    const response =
      await this.principalService.eliminarCambiosTemporalesProgramacion(obj);
    this.existetemp = false;
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
    this.moneda = this.simbolo ? this.simbolo : 'S/'
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

  async indexarElemento(partidaReferente, elementoIndex) {
    let indiceCreacion;
    if (partidaReferente.unidad) {
      indiceCreacion = partidaReferente.ind + 1;
    } else {
      const nivel = partidaReferente.item.split('.').length;
      let encontrado2;
      for (
        let i = partidaReferente.ind + 1;
        i < this.dataPrincipal.length;
        i++
      ) {
        const nivel2 = this.dataPrincipal[i].item.split('.').length;
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

  ngAfterViewInit() {
    this.loadBox();
    this.loadContainer();
  }

  private loadBox() {
    const { left, top } = this.box.nativeElement.getBoundingClientRect();
    this.boxPosition = { left, top };
  }

  private loadContainer() {
    const left = this.boxPosition.left - this.left;
    const top = this.boxPosition.top - this.top;
    const right = left + 800;
    const bottom = top + 800;
    this.containerPos = { left, top, right, bottom };
  }

  async habilitarEditar(rowIndex, input) {
    if (
      this.noEnlazar ||
      this.displayBasic ||
      this.displayBasic2 ||
      this.solover || !this.versionEditable
    ) {
      return;
    }
    if (this.progTiempNoVAlidos && input !== 'duracion') {
      this.toaster.error(
        'Error en exceso de duracion de una partida',
        'Error',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    }
    if (input == 'restriccion' && this.dataPrincipal[rowIndex].duracion) {
      this.dataPrincipal[rowIndex].editarRest = true;
      await this.crearRestriccion(rowIndex);
    }
    if (input == 'duracion' && this.dataPrincipal[rowIndex].duracion) {
      this.dataPrincipal[rowIndex].editarDur = true;
    }
    if (input == 'fechaini') {
      this.dataPrincipal[rowIndex].editarFI = true;
    }
    if (input == 'fechafin' && this.dataPrincipal[rowIndex].duracion) {
      this.dataPrincipal[rowIndex].editarFF = true;
    }
    if (input == 'predecesor') {
      this.dataPrincipal[rowIndex].editarPred = true;
    }
    if (input == 'cuadrilla' && this.dataPrincipal[rowIndex].duracion) {
      this.dataPrincipal[rowIndex].editarCua = true;
    }
    if (input == 'descripcion' && !this.dataPrincipal[rowIndex].duracion) {
      this.dataPrincipal[rowIndex].editarDescrip = true;
    }
  }

  deshabilitarEditar(rowIndex) {
    this.dataPrincipal[rowIndex].editarDur = false;
    this.dataPrincipal[rowIndex].editarFI = false;
    this.dataPrincipal[rowIndex].editarFF = false;
    this.dataPrincipal[rowIndex].editarPred = false;
    this.dataPrincipal[rowIndex].editarRest = false;
    this.dataPrincipal[rowIndex].editarCua = false;
    this.dataPrincipal[rowIndex].editarDescrip = false;
  }

  async crearRestriccion(index) {
    if (!this.displayBasic) {
      await this.deshabilitarEditar(index);
      this.indiceSeleccionado = index;
      this.displayBasic2 = true;
      if (this.dataPrincipal[index].restriccion) {
        this.fechaRestriccion = moment(
          this.dataPrincipal[index].restriccion
        ).format('YYYY-MM-DD');
      }
      if (this.dataPrincipal[index].restriccion2) {
        this.fechaRestriccion2 = moment(
          this.dataPrincipal[index].restriccion2
        ).format('YYYY-MM-DD');
      }
    }
  }

  async evaluarDescripcion(descripcion, index) {
    try {
      await this.deshabilitarEditar(index);
      const rowAnterior = JSON.parse(JSON.stringify(this.dataPrincipal[index]));
      if (descripcion == rowAnterior.descripcion) {
        return;
      } else {
        this.dataPrincipal[index].descripcion = descripcion
          .trim()
          .toUpperCase();
        if (this.dataPrincipal[index].uid !== null) {
          this.dataPrincipal[index].filaEditada = true;
          if (!this.desacGrafico.includes(index)) {
            this.desacGrafico.push(index);
          }
        }
        // this.guardarTemporalProgramacion('evaluarDescripcion');
        this.actualizarTemp();
      }
    } catch (e) {
      SwalService.error();
      console.log(e);
    }
  }

  async evaluarDuracion(duracion, index) {
    this.deshabilitarEditar(index);
    const row = this.dataPrincipal[index];
    if (
      duracion > 0 &&
      !isNaN(duracion) &&
      Number(duracion) <= Number(this.plazoHabil)
    ) {
      if (row.duracion !== Number(duracion)) {
        this.dataPrincipal[index].detalle_partida = null;
        this.dataPrincipal[index].diasHabilesValido = true;
        this.dataPrincipal[index].duracion = Number(duracion);
        const cuadrillaNecesaria =
          this.dataPrincipal[index].tiempoUnitario /
          (this.dataPrincipal[index].duracion
            ? this.dataPrincipal[index].duracion
            : 1);
        this.dataPrincipal[index].cuadrilla = Number(
          this.formsService.redondeo(cuadrillaNecesaria, 2)
        );
        this.dataPrincipal[index].filaEditada = true;
        if (row.condini || row.condfin) {
          const condi = row.condini
            ? JSON.parse(row.condini)
            : JSON.parse(row.condfin);
          if (condi[1] == 'CF' || condi[1] == 'FF') {
            const response = await this.calcularFechaComplemento(
              row.duracion,
              '',
              row.fechafin
            );

            this.dataPrincipal[index].fechaini = response.fecha;
            this.dataPrincipal[index].duraciontot = response.duraciontot;
          } else {
            const response = await this.calcularFechaComplemento(
              row.duracion,
              row.fechaini,
              ''
            );
            this.dataPrincipal[index].fechafin = response.fecha;
            this.dataPrincipal[index].duraciontot = response.duraciontot;
          }
        } else {
          const response = await this.calcularFechaComplemento(
            row.duracion,
            row.fechaini,
            ''
          );
          this.dataPrincipal[index].fechafin = response.fecha;
          this.dataPrincipal[index].duraciontot = response.duraciontot;
        }
        this.tablaDesemDesactua = true;
        this.tablaMatDesac = true;
        this.tablaGrafDesac = true;
        this.uidsOrdenados[this.dataPrincipal[index].uid].duracion =
          this.dataPrincipal[index].duracion;
        this.uidsOrdenados[this.dataPrincipal[index].uid].filaEditada =
          this.dataPrincipal[index].filaEditada;
        this.uidsOrdenados[this.dataPrincipal[index].uid].fechafin =
          this.dataPrincipal[index].fechafin;
        this.uidsOrdenados[this.dataPrincipal[index].uid].duraciontot =
          this.dataPrincipal[index].duraciontot;
        if (this.dataPrincipal[index].hijos_uid) {
          this.prograNoActua = true;
        }
        if (!this.desacGrafico.includes(index)) {
          this.desacGrafico.push(index);
        }
        this.updateRowGraph();
        this.quitarRutaCritica();
        // this.guardarTemporalProgramacion('evaluarDuracion');
        this.actualizarTemp();
      }
    } else {
      if (Number(duracion) > Number(this.plazoHabil)) {
        this.toaster.error(
          'Valor dias excendente a ' + this.plazoHabil,
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          }
        );
      } else {
        this.toaster.error('Duración no válida', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
      }
    }
  }

  async evaluarFechaInicio(fechainicio, index) {
    const row = this.dataPrincipal[index];
    if (row.condini) {
      this.toaster.error('Partida con predecesor', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
    } else {
      if (!moment(fechainicio).isValid()) {
        this.toaster.error('Fecha no valida', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
      } else {
        if (row.fechaini !== fechainicio) {
          const restriccionInput = this.dataPrincipal[index].restriccion
            ? moment(this.dataPrincipal[index].restriccion).format('YYYY-MM-DD')
            : '';
          const inicioProyecto = moment(this.dataProyecto.fecha_inicio).format(
            'YYYY-MM-DD'
          );
          if (fechainicio < restriccionInput || fechainicio < inicioProyecto) {
            const string =
              fechainicio < inicioProyecto
                ? 'Fecha menor a inicio de proyecto'
                : 'Fecha menor a la restriccion creada';
            this.toaster.error(string, 'Error', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 3000,
            });
          } else {
            const esNoLaborable = this.tablaferiados.find(
              (ele) => ele.fecha == fechainicio
            );
            const nombreDia = moment.weekdays(moment(fechainicio).day());
            if (
              esNoLaborable ||
              this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
            ) {
              const string = esNoLaborable?.nolabor
                ? 'La fecha seleccionada es no Laborable'
                : 'La fecha seleccionada es Feriado';
              this.toaster.error(string, 'Error', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              });
            } else {
              this.dataPrincipal[index].fechaini = fechainicio;
              this.dataPrincipal[index].restriccion = fechainicio;
              this.dataPrincipal[index].filaEditada = true;
              if (!this.desacGrafico.includes(index)) {
                this.desacGrafico.push(index);
              }
              const response = await this.calcularFechaComplemento(
                row.duracion,
                row.fechaini,
                ''
              );
              this.dataPrincipal[index].fechafin = response.fecha;
              this.dataPrincipal[index].duraciontot = response.duraciontot;
              this.uidsOrdenados[this.dataPrincipal[index].uid].fechaini =
                this.dataPrincipal[index].fechaini;
              this.uidsOrdenados[this.dataPrincipal[index].uid].filaEditada =
                this.dataPrincipal[index].filaEditada;
              this.uidsOrdenados[this.dataPrincipal[index].uid].fechafin =
                this.dataPrincipal[index].fechafin;
              this.uidsOrdenados[this.dataPrincipal[index].uid].duraciontot =
                this.dataPrincipal[index].duraciontot;
              if (this.dataPrincipal[index].hijos_uid) {
                this.prograNoActua = true;
              }
              this.tablaDesemDesactua = true;
              this.tablaMatDesac = true;
              this.tablaGrafDesac = true;
              if (!this.desacGrafico.includes(index)) {
                this.desacGrafico.push(index);
              }
              this.quitarRutaCritica();
              // this.guardarTemporalProgramacion('evaluarFechaInicio');
              this.actualizarTemp();
              this.updateRowGraph();
            }
          }
        }
      }
    }
    this.deshabilitarEditar(index);
  }

  async evaluarReferencia(referencia, index, guardar = true) {
    try {
      const row = this.dataPrincipal[index];
      if (referencia !== row.referencia) {
        if (!referencia) {
          if (row.condini) {
            await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid);
          }
          if (row.condfin) {
            await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid);
          }
          this.uidsOrdenados[row.uid].referencia = '';
          this.uidsOrdenados[row.uid].referenciados = '';
          this.uidsOrdenados[row.uid].condini = '';
          this.uidsOrdenados[row.uid].condfin = '';
          this.uidsOrdenados[row.uid].filaEditada = true;
          if (!this.desacGrafico.includes(index)) {
            this.desacGrafico.push(index);
          }
          if (this.dataPrincipal[index].hijos_uid) {
            this.prograNoActua = true;
          }
          if (guardar) {
            this.tablaDesemDesactua = true;
            this.tablaMatDesac = true;
            this.tablaGrafDesac = true;
            // this.guardarTemporalProgramacion('evaluarReferencia');
            this.actualizarTemp();
          }
          this.quitarRutaCritica();
          this.updateRowGraph();
        } else {
          let noValido = false;
          const arrayNopermitidos = ['ḉ', '`', '´', '^', , '¨', 'Ç', '*'];
          for (const caracter of referencia) {
            const existe = arrayNopermitidos.includes(caracter);
            if (existe) {
              this.toaster.error(
                'Caracter no permitido : "' + caracter + '"',
                'Error',
                {
                  closeButton: false,
                  positionClass: 'toast-bottom-right',
                  timeOut: 5000,
                }
              );
              noValido = true;
              break;
            }
          }
          if (!noValido) {
            const ids = referencia.split(/[,;]+/);
            const array = ids.map((ele) => parseInt(ele));
            let msj = '';
            for (const iterator of array) {
              if (iterator > this.ultimoidGantt) {
                msj = 'ID no existente : ' + iterator;
                break;
              }
              if (this.tablaIdGantt[iterator - 1] && !this.tablaIdGantt[iterator - 1].unidad) {
                msj = 'ID es titulo : ' + iterator;
                break;
              }
            }
            if (msj) {
              this.toaster.error(msj, 'Error', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              });
            } else {
              const valido = await this.predecesorCorregido(referencia, index);
              if (valido) {
                const respuesta = await this.verCiclo(
                  valido.referenciados,
                  index
                );
                if (respuesta) {
                  this.toaster.error(respuesta, 'Error', {
                    closeButton: false,
                    positionClass: 'toast-bottom-right',
                    timeOut: 5000,
                  });
                } else {
                  if (row.condini) {
                    await this.eliminarDelPadre(
                      JSON.parse(row.condini)[0],
                      row.uid
                    );
                  }
                  if (row.condfin) {
                    await this.eliminarDelPadre(
                      JSON.parse(row.condfin)[0],
                      row.uid
                    );
                  }
                  this.uidsOrdenados[row.uid].condini = '';
                  this.uidsOrdenados[row.uid].condfin = '';
                  const condicionales = await this.condicionanteFila(
                    valido.referenciados,
                    index
                  );
                  if (condicionales.condini) {
                    this.uidsOrdenados[row.uid].condini = JSON.stringify(
                      condicionales.condini
                    );
                    const hijos = await this.agregarAlPadre(
                      condicionales.condini[0],
                      row.uid
                    );
                    this.uidsOrdenados[condicionales.condini[0]].hijos_uid = hijos
                      ? JSON.stringify(hijos)
                      : '';
                  }
                  if (condicionales.condfin) {
                    this.uidsOrdenados[row.uid].condfin = JSON.stringify(
                      condicionales.condfin
                    );
                    const hijos = await this.agregarAlPadre(
                      condicionales.condfin[0],
                      row.uid
                    );
                    this.uidsOrdenados[condicionales.condfin[0]].hijos_uid = hijos
                      ? JSON.stringify(hijos)
                      : '';
                  }
                  this.uidsOrdenados[row.uid].referencia = valido.referencia;
                  this.uidsOrdenados[row.uid].referenciados = JSON.stringify(
                    valido.referenciados
                  );
                  this.uidsOrdenados[row.uid].filaEditada = true;
                  this.uidsOrdenados[row.uid].duracion = condicionales.duracion;
                  this.uidsOrdenados[row.uid].fechafin = condicionales.fechafin;
                  this.uidsOrdenados[row.uid].fechaini = condicionales.fechaini;
                  this.uidsOrdenados[row.uid].duraciontot =
                    condicionales.duraciontot;
                  if (this.dataPrincipal[index].hijos_uid) {
                    this.prograNoActua = true;
                  }
                  this.tablaDesemDesactua = true;
                  this.tablaMatDesac = true;
                  this.tablaGrafDesac = true;
                  if (!this.desacGrafico.includes(index)) {
                    this.desacGrafico.push(index);
                  }
                  if (guardar) {
                    // this.guardarTemporalProgramacion('evaluarReferencia');
                    this.actualizarTemp();
                  }
                  this.quitarRutaCritica();
                  this.updateRowGraph();
                }
              }
            }
          }
        }
      }
      this.deshabilitarEditar(index);
    } catch (e) {
      console.log(e)
      SwalService.error()
    }
  }

  async agregarAlPadre(uid, uidagregar) {
    const hijos = this.uidsOrdenados[uid].hijos_uid
      ? JSON.parse(this.uidsOrdenados[uid].hijos_uid)
      : [];
    let hijosArr = hijos;
    if (hijos) {
      if (!hijos.includes(uidagregar)) {
        hijosArr.push(uidagregar);
        this.uidsOrdenados[uid].filaEditada = true;
      }
    } else {
      hijosArr.push(uidagregar);
      this.uidsOrdenados[uid].filaEditada = true;
    }
    return hijosArr;
  }

  async eliminarDelPadre(uid, uideliminar) {
    const hijos = this.uidsOrdenados[uid].hijos_uid
      ? JSON.parse(this.uidsOrdenados[uid].hijos_uid)
      : [];
    let hijosArr = hijos;
    if (hijos) {
      if (hijos.includes(uideliminar)) {
        var indice = hijosArr.indexOf(uideliminar);
        hijosArr.splice(indice, 1);
        this.uidsOrdenados[uid].filaEditada = true;
      }
    }
    this.uidsOrdenados[uid].hijos_uid = hijosArr.length
      ? JSON.stringify(hijosArr)
      : '';
  }

  async condicionanteFila(referenciados, index) {
    let condini = null;
    let condfin = null;
    let fechafin = null;
    let duraciontot = null;
    let fechaini = null;
    let duracion = null;
    if (referenciados.length) {
      let fi = null;
      let ff = null;
      for await (const iterator of referenciados) {
        const response = await this.fechadeReferencia(iterator);
        if (iterator[1] == 'CF' || iterator[1] == 'FF') {
          if (response > ff || !ff) {
            ff = response;
            condfin = iterator;
          }
        } else {
          if (response > fi || !fi) {
            fi = response;
            condini = iterator;
          }
        }
      }

      if (fi && ff) {
        if (fi > ff) {
          ff = null;
          condfin = null;
        } else {
          fi = null;
          condini = null;
        }
      }
      if (ff && fi) {
        if (fi > ff) {
          const response1 = await this.calcularFechaComplemento(
            this.dataPrincipal[index].duracion,
            fi,
            ''
          );
          fechafin = response1.fecha;
          duraciontot = response1.duraciontot;
        } else {
          fi = fi ? fi : fechaini;
          ff = ff ? ff : fechafin;
          fechaini = fi;
          fechafin = ff;
          const response2 = await this.calcularFechaComplemento('', fi, ff);
          duracion = response2.duracion;
          duraciontot = response2.duraciontot;
        }
      } else {
        let response3 = await this.calcularFechaComplemento(
          this.dataPrincipal[index].duracion,
          fi,
          ff
        );
        if (ff && !fi && response3.fecha < this.dataProyecto.fecha_inicio) {
          const response4 = await this.calcularFechaComplemento(
            this.dataPrincipal[index].duracion,
            '',
            ff
          );
          fechaini = response4.fecha;
          fechafin = ff;
          duracion = this.dataPrincipal[index].duracion;
          duraciontot = response4.duraciontot;
        } else {
          fechaini = !fi ? response3.fecha : fi;
          fechafin = !ff ? response3.fecha : ff;
          duraciontot = response3.duraciontot;
        }
      }
    }
    const obj = {
      condini: condini,
      condfin: condfin,
      fechaini: fechaini ? fechaini : this.dataPrincipal[index].fechaini,
      fechafin: fechafin ? fechafin : this.dataPrincipal[index].fechafin,
      duracion: duracion ? duracion : this.dataPrincipal[index].duracion,
      duraciontot: duraciontot,
    };
    return obj;
  }

  async actualizarFechas(index) {
    const referenciados = JSON.parse(this.dataPrincipal[index].referenciados);
    if (referenciados.length) {
      let fi = null;
      let ff = null;
      for (const iterator of referenciados) {
        const response = await this.fechadeReferencia(iterator);
        if (iterator[1] == 'CF' || iterator[1] == 'FF') {
          if (response > ff || !ff) ff = response;
        } else {
          if (response > fi || !fi) fi = response;
        }
      }
      if (fi && ff) {
        if (fi > ff) {
          ff = null;
        } else {
          fi = null;
        }
      }
      if (ff && fi) {
        if (fi > ff) {
          const response = await this.calcularFechaComplemento(
            this.dataPrincipal[index].duracion,
            fi,
            ''
          );
          this.dataPrincipal[index].fechafin = response.fecha;
          this.dataPrincipal[index].duraciontot = response.duraciontot;
        } else {
          fi = fi ? fi : this.dataPrincipal[index].fechaini;
          ff = ff ? ff : this.dataPrincipal[index].fechafin;
          const response2 = await this.calcularFechaComplemento('', fi, ff);
          this.dataPrincipal[index].duracion = response2.duracion;
          this.dataPrincipal[index].duraciontot = response2.duraciontot;
        }
      } else {
        const response3 = await this.calcularFechaComplemento(
          this.dataPrincipal[index].duracion,
          fi,
          ff
        );
        this.dataPrincipal[index].fechaini = !fi ? response3.fecha : fi;
        this.dataPrincipal[index].fechafin = !ff ? response3.fecha : ff;
        this.dataPrincipal[index].duraciontot = response3.duraciontot;
      }
    }
  }

  async actualizarTablaCompleta() {
    for await (const iterator of this.dataPrincipal) {
      if (
        iterator.unidad &&
        !iterator.hijos_uid &&
        iterator.referenciados &&
        !iterator.indice_ref_hito
      ) {
        if (iterator.condini) {
          await this.eliminarDelPadre(
            JSON.parse(iterator.condini)[0],
            iterator.uid
          );
        }
        if (iterator.condfin) {
          await this.eliminarDelPadre(
            JSON.parse(iterator.condfin)[0],
            iterator.uid
          );
        }

        const condicionales = await this.condicionanteFila(
          JSON.parse(iterator.referenciados),
          iterator.ind
        );
        if (condicionales.condini) {
          this.uidsOrdenados[iterator.uid].condini = JSON.stringify(
            condicionales.condini
          );
          const hijos = await this.agregarAlPadre(
            condicionales.condini[0],
            iterator.uid
          );
          this.uidsOrdenados[condicionales.condini[0]].hijos_uid = hijos
            ? JSON.stringify(hijos)
            : '';
        }
        if (condicionales.condfin) {
          this.uidsOrdenados[iterator.uid].condfin = JSON.stringify(
            condicionales.condfin
          );
          const hijos = await this.agregarAlPadre(
            condicionales.condfin[0],
            iterator.uid
          );
          this.uidsOrdenados[condicionales.condfin[0]].hijos_uid = hijos
            ? JSON.stringify(hijos)
            : '';
        }
        this.uidsOrdenados[iterator.uid].duracion = condicionales.duracion;
        this.uidsOrdenados[iterator.uid].fechafin = condicionales.fechafin;
        this.uidsOrdenados[iterator.uid].fechaini = condicionales.fechaini;
        this.uidsOrdenados[iterator.uid].duraciontot =
          condicionales.duraciontot;
      }
    }

    for await (const iterator of this.dataPrincipal) {
      if (iterator.unidad && iterator.hijos_uid && !iterator.referenciados) {
        await this.actualizarEnlazados(iterator, false);
      }
      iterator.filaEditada = true;
    }
    await this.actualizarTitulos2();
    this.prograNoActua = false;
  }

  async actualizarModificados() {
    try {
      this.actualizarTodo = true;
      this.mostrar_carga_todo = true;
      this.titulosActualizar = [];
      setTimeout(async () => {
        const ordenado = this.grupoDesactualizados.sort();
        let titulos = [];
        for (const iterator of ordenado) {
          const row = this.dataPrincipal[iterator];
          if (row.duracion > 0) {
            if (!row.unidad) {
              this.titulosActualizar.push(iterator);
            } else {
              if (row.hijos_uid) {
                await this.actualizarEnlazados(row, true);
              } else {
              }
            }
          }
        }
        this.titulosActualizar.sort((a, b) => {
          return a - b;
        });
        this.titulosActualizar.reverse();
        for (const iterator of this.titulosActualizar) {
          if (!this.desacGrafico.includes(iterator)) {
            this.desacGrafico.push(iterator);
          }
          await this.updatetitulo2(iterator, true);
        }
        if (this.view_mode) {
          if (!this.limitesIncorrectos) {
            for (const iterator of this.desacGrafico) {
              await this.actualizarGrafico(iterator, 'actualizarModificados');
            }
            await this.actualizarRutaCritica(true, false);
          } else {
            await this.generarGrafico();
            await this.SyncScroll();
          }
        }
        this.desacGrafico = [];
        this.grupoDesactualizados = [];
        this.prograNoActua = false;
        this.tablaDesembolso = [];
        // await this.guardarTemporalProgramacion('actualizarModificados');
        await this.guardarTemporal(
          this.dataPrincipal,
          this.prograNoActua,
          this.hitosEliminados
        );
        this.mostrar_carga_todo = false;
        this.actualizarTodo = false;
      }, 200);
    } catch (e) {
      SwalService.error(e);
    }
  }

  async actualizarEnlazados(iterator, actualizar = false) {
    if (!iterator.hijos_uid) {
      return;
    } else {
      const hijos = JSON.parse(iterator.hijos_uid);
      for (const uid of hijos) {
        const row = this.uidsOrdenados[uid];
        await this.superioresTitulo(row);
        if (actualizar && !this.desacGrafico.includes(row.ind)) {
          this.desacGrafico.push(row.ind);
        }
        if (row.condini) {
          await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid);
        }
        if (row.condfin) {
          await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid);
        }
        const condicionales = await this.condicionanteFila(
          JSON.parse(row.referenciados),
          row.ind
        );
        if (condicionales.condini) {
          this.uidsOrdenados[row.uid].condini = JSON.stringify(
            condicionales.condini
          );
          const hijos = await this.agregarAlPadre(
            condicionales.condini[0],
            row.uid
          );
          this.uidsOrdenados[condicionales.condini[0]].hijos_uid = hijos
            ? JSON.stringify(hijos)
            : '';
        }
        if (condicionales.condfin) {
          this.uidsOrdenados[row.uid].condfin = JSON.stringify(
            condicionales.condfin
          );
          const hijos = await this.agregarAlPadre(
            condicionales.condfin[0],
            row.uid
          );
          this.uidsOrdenados[condicionales.condfin[0]].hijos_uid = hijos
            ? JSON.stringify(hijos)
            : '';
        }
        this.uidsOrdenados[row.uid].filaEditada = true;
        this.uidsOrdenados[row.uid].duracion = condicionales.duracion;
        this.uidsOrdenados[row.uid].fechafin = condicionales.fechafin;
        this.uidsOrdenados[row.uid].fechaini = condicionales.fechaini;
        this.uidsOrdenados[row.uid].duraciontot = condicionales.duraciontot;
        this.dataPrincipal[row.ind].filaEditada = true;
        this.dataPrincipal[row.ind].duracion = condicionales.duracion;
        this.dataPrincipal[row.ind].fechafin = condicionales.fechafin;
        this.dataPrincipal[row.ind].fechaini = condicionales.fechaini;
        this.dataPrincipal[row.ind].duraciontot = condicionales.duraciontot;
        await this.actualizarEnlazados(row, actualizar);
      }
    }
  }

  async superioresTitulo(row) {
    let itemSpliteado = row.item.split('.');
    itemSpliteado.pop();
    while (itemSpliteado.length) {
      const encontrado = await this.dataPrincipal.find((ele) => {
        if (ele.item === itemSpliteado.join('.')) {
          return ele;
        }
      });
      if (!this.titulosActualizar.includes(encontrado.ind)) {
        this.titulosActualizar.push(encontrado.ind);
      }
      itemSpliteado.pop();
    }
  }

  async fechadeReferencia(referencia) {
    let fecha = null;
    const row = this.uidsOrdenados[referencia[0]];
    if (referencia[1] == '' || referencia[1] == 'FC') {
      let fechac = row.fechafin;
      let fi;
      let existe = false;
      fi = moment(fechac).add(1, 'days').format('YYYY-MM-DD');
      do {
        const esFeriado = this.tablaferiados.find((ele) => ele.fecha == fi);
        const nombreDia = moment.weekdays(moment(fi).day());
        if (
          esFeriado ||
          this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
        ) {
          existe = true;
        } else {
          existe = false;
        }
        if (existe) {
          fi = moment(fi).add(1, 'days').format('YYYY-MM-DD');
        }
      } while (existe);
      fecha = fi;
    } else if (referencia[1] == 'CC') {
      fecha = row.fechaini;
    } else if (referencia[1] == 'CF') {
      let valido = false;
      let f = JSON.parse(JSON.stringify(row.fechaini));
      while (!valido) {
        f = moment(f).subtract(1, 'days').format('YYYY-MM-DD');
        const nombreDia = moment.weekdays(moment(f).day());
        const existe = await this.tablaferiados.find((ele) => ele.fecha == f);
        if (
          !existe &&
          !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
        ) {
          valido = true;
        }
      }
      fecha = f;
    } else if (referencia[1] == 'FF') {
      fecha = row.fechafin;
    }
    if (fecha) {
      if (referencia[2]) {
        const numero = parseInt(referencia[2]);
        const tipo = referencia[2].slice(numero.toString().length);
        let dias = 0;
        if (tipo == 'd' || tipo == 'D' || !tipo) {
          dias = numero;
        } else if (tipo == '%') {
          const dur = row.duracion;
          const cant = Math.ceil((dur * numero) / 100);
          dias = cant;
        } else {
        }
        if (referencia[3] == '-') {
          dias = dias + 1;
          fecha = (await this.calcularFechaComplemento(dias, null, fecha))
            .fecha;
        } else {
          dias = dias + 1;
          fecha = (await this.calcularFechaComplemento(dias, fecha, null))
            .fecha;
        }
      }
    }
    return fecha;
  }

  async verCiclo(referenciados, index) {
    let existe = false;
    let msj = '';
    const row = this.dataPrincipal[index];
    const ciclo = referenciados.find((ele) => ele[0] == row.uid);
    if (ciclo) {
      msj = 'No puede ser predecesor de si mismo';
      existe = true;
    } else {
      let uidsBusqueda = [];
      let uidsrecorridos = [];
      for (const iterator of referenciados) {
        uidsBusqueda.push(iterator[0]);
        uidsrecorridos.push(this.uidsOrdenados[iterator[0]].idgantt);
        while (uidsBusqueda.length) {
          const ref = this.uidsOrdenados[uidsBusqueda[0]].referenciados
            ? JSON.parse(this.uidsOrdenados[uidsBusqueda[0]].referenciados)
            : [];
          for await (const ele of ref) {
            uidsBusqueda.push(ele[0]);
            uidsrecorridos.push(this.uidsOrdenados[ele[0]].idgantt);
            if (uidsrecorridos.includes(row.idgantt)) {
              msj = 'Ciclo generado';
              uidsBusqueda = [];
            }
          }
          uidsBusqueda.shift();
        }
      }
    }
    return msj;
  }

  async verCondicionante(arrReferencia) {
    let condicionante = [];
    let inicios = [];
    let finales = [];
    const array1 = ['', 'FC', 'CC'];
    const array2 = ['FF', 'CF'];
    for (const iterator of arrReferencia) {
      let idgantt = null;
      let tipo = '';
      let diasAdd = '';
      if (iterator.includes('+')) {
        const splitplus = iterator.split('+');
        if (splitplus[0]) {
          idgantt = parseInt(splitplus[0]);
          tipo = splitplus[0].substring(idgantt.toString().length);
        }
        if (splitplus[1]) {
          const dias = parseInt(splitplus[1]);
          const ultimoCaracter = splitplus[1].slice(dias.toString().length);
          if (
            (!isNaN(dias) && ultimoCaracter == 'd') ||
            ultimoCaracter == 'D' ||
            ultimoCaracter == '' ||
            ultimoCaracter == '%'
          ) {
            diasAdd = splitplus[1];
          }
        }
      } else {
        idgantt = parseInt(iterator);
        tipo = iterator.substring(idgantt.toString().length);
      }
      if (array1.includes(tipo)) {
        inicios.push([idgantt, tipo, diasAdd]);
      } else {
        finales.push([idgantt, tipo, diasAdd]);
      }
    }
    let fiM = null;
    let ffM = null;
    let Mi = null;
    let Mf = null;
    let condini = '';
    let condfin = '';
    if (inicios.length) {
      for (const iterator of inicios) {
        const dias = parseInt(iterator[2]);
        const ultimoCaracter = iterator[2].slice(dias.toString().length);
        const duracionRef = this.uidsOrdenados[Number(iterator[0])].duracion;
        let diasAdd = 0;
        if (
          (dias > 0 && ultimoCaracter == '') ||
          ultimoCaracter == 'd' ||
          ultimoCaracter == 'D'
        ) {
          diasAdd = dias;
        } else if (ultimoCaracter == '%') {
          diasAdd = Math.ceil((duracionRef * dias) / 100);
        }
        const cantEnDias = dias + diasAdd;
        var fecharow = null;
        if (iterator[1] == 'CC') {
          fecharow = (
            await this.calcularFechaComplemento(
              0 + cantEnDias,
              this.dataPrincipal[iterator[0] - 1].fechaini,
              ''
            )
          ).fecha;
        } else {
          fecharow = (
            await this.calcularFechaComplemento(
              1 + cantEnDias,
              this.dataPrincipal[iterator[0] - 1].fechafin,
              ''
            )
          ).fecha;
        }

        fiM = fiM == null ? fecharow : fiM < fecharow ? fecharow : fiM;
        Mi = fiM == fecharow ? iterator : Mi;
      }
    }
    if (finales.length) {
      for (const iterator of finales) {
        var fecharow = null;
        const dias = parseInt(iterator[2]);
        const ultimoCaracter = iterator[2].slice(dias.toString().length);
        const duracionRef = this.uidsOrdenados[Number(iterator[0])].duracion;
        let diasAdd = 0;
        if (
          (dias > 0 && ultimoCaracter == '') ||
          ultimoCaracter == 'd' ||
          ultimoCaracter == 'D'
        ) {
          diasAdd = dias;
        } else if (ultimoCaracter == '%') {
          diasAdd = Math.ceil((duracionRef * dias) / 100);
        }
        const cantEnDias = dias + diasAdd;
        if (iterator[1] == 'CF') {
          fecharow = (
            await this.calcularFechaComplemento(
              0 + cantEnDias,
              '',
              this.dataPrincipal[iterator[0] - 1].fechafin
            )
          ).fecha;
        } else {
          fecharow = (
            await this.calcularFechaComplemento(
              1 + cantEnDias,
              this.dataPrincipal[iterator[0] - 1].fechafin,
              ''
            )
          ).fecha;
        }

        ffM = ffM == null ? fecharow : ffM < fecharow ? fecharow : ffM;
        Mf = ffM == fecharow ? iterator : Mf;
      }
    }
    let obj = { condini: '', condfin: '' };
    if (fiM && ffM) {
      obj.condini = fiM > ffM ? JSON.stringify(Mi) : '';
      obj.condfin = fiM < ffM ? JSON.stringify(Mf) : '';
    } else if (fiM && !ffM) {
      obj.condini = JSON.stringify(Mi);
      obj.condfin = '';
    } else if (!fiM && ffM) {
      obj.condini = '';
      obj.condfin = JSON.stringify(Mf);
    } else {
      obj = null;
    }
    return obj;
  }

  async predecesorCorregido(referencia, index) {
    const arrayR = referencia.split(/[,;]+/);
    let referenciados = [];
    let arrayString = [];
    let valido = true;
    let iteratorInvalido = '';
    for (let iterator of arrayR) {
      iterator = iterator.trim().replace(/ /g, '').toUpperCase();
      let idgantt = null;
      let tipo = '';
      let diasAdd = '';
      const spliteado = iterator.split(/[+-]+/);
      let tipoComplemento = null;
      let cantComplemento = null;
      const id = parseInt(spliteado[0]);
      if (!isNaN(id)) {
        idgantt = id;
        const tip = spliteado[0].substring(idgantt.toString().length);
        const arrayTipos = ['', 'FF', 'FC', 'CF', 'CC'];
        if (arrayTipos.includes(tip)) {
          tipo = tip;
        } else {
          valido = false;
        }
      } else {
        valido = false;
      }

      if (valido) {
        if (spliteado.length == 2) {
          if (iterator.includes('+') || iterator.includes('-')) {
            cantComplemento = parseInt(spliteado[1]);
            tipoComplemento = spliteado[1].substring(
              cantComplemento.toString().length
            );
            if (isNaN(cantComplemento)) {
              valido = false;
            } else {
              const arrayValido = ['d', 'D', '%', ''];
              if (!arrayValido.includes(tipoComplemento)) {
                valido = false;
              } else {
                if (tipoComplemento == '%') {
                  if (cantComplemento > 0 && cantComplemento < 101) {
                    diasAdd = cantComplemento + tipoComplemento;
                  } else {
                    valido = false;
                  }
                } else {
                  if (tipoComplemento == '') {
                    tipoComplemento = 'D';
                  }
                  if (
                    cantComplemento > 0 &&
                    cantComplemento < this.plazoHabil
                  ) {
                    diasAdd = cantComplemento + tipoComplemento;
                  } else {
                    valido = false;
                  }
                }
              }
            }
          } else {
            valido = false;
          }
        } else if (spliteado.length == 1) {
        } else {
          valido = false;
        }
      }

      if (!valido) {
        iteratorInvalido = iterator;
        break;
      } else {
        const uid = this.tablaIdGantt[idgantt - 1].uid;
        let operatorAdicional = '';
        if (diasAdd) {
          if (iterator.includes('-')) {
            operatorAdicional = '-';
          } else {
            operatorAdicional = '+';
          }
        }
        const refArr = [uid, tipo, diasAdd, operatorAdicional];
        const referencia =
          idgantt + tipo + (diasAdd ? operatorAdicional + diasAdd : '');
        referenciados.push(refArr);
        arrayString.push(referencia);
      }
    }
    if (!valido) {
      this.toaster.error('Predecesor invalido : ' + iteratorInvalido, 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      return null;
    } else {
      return {
        referencia: arrayString.join(','),
        referenciados: referenciados,
      };
    }
  }

  async superiores(index) {
    if (
      this.dataPrincipal[index].duracion &&
      !this.dataPrincipal[index].indice_ref_hito
    ) {
      const itemSpliteado = this.dataPrincipal[index].item.split('.');
      itemSpliteado.pop();
      while (itemSpliteado.length) {
        const encontrado = await this.dataPrincipal.find((ele) => {
          if (ele.item === itemSpliteado.join('.')) {
            return ele;
          }
        });
        if (!this.desacGrafico.includes(encontrado.ind)) {
          await this.updatetitulo2(encontrado.ind, true);
          this.desacGrafico.push(encontrado.ind);
        }
        itemSpliteado.pop();
      }
    }
  }

  async quitarRutaCritica() {
    this.gantt.quitarRutaCritica(this.arrayAnteriorRC);
    this.rutaCriticaActualizada = false;
    this.tablaDesemDesactua = true;
    this.tablaMatDesac = true;
    this.tablaGrafDesac = true;
  }

  async actualizarGrafico(indice, fuente) {
    if (this.view_mode) {
      const row = this.dataPrincipal[indice];
      // let finiGraf = new Date(this.gantt.options.gantt_start);
      const formattedDate = moment(this.gantt.options.gantt_start).format(
        'YYYY-MM-DD'
      );
      const finiGraf = new Date(formattedDate + 'T00:00:00');
      finiGraf.setHours(0, 0, 0);
      const fi = moment(row.fechaini);
      const ff = moment(row.fechafin).add(1, 'days');
      let fiG = null;
      if (
        this.gantt.options.view_mode == 'Day' ||
        this.gantt.options.view_mode == 'Week'
      ) {
        fiG = moment(finiGraf).subtract(7, 'days');
      } else if (this.gantt.options.view_mode == 'Month') {
        const anio = moment(finiGraf).format('YYYY');
        const fecha = anio + '-01-01';
        fiG = moment(fecha);
      } else if (this.gantt.options.view_mode == 'Year') {
        fiG = moment(finiGraf).subtract(2, 'years');
      }
      let diffFech = null;
      let duration = null;
      let x = null;
      let width2 = null;
      if (this.gantt.options.view_mode !== 'Month') {
        duration = ff.diff(fi, 'hours') / this.gantt.options.step;
        width2 = this.gantt.options.column_width * duration;
        if (this.gantt.options.view_mode == 'Day' && row.duracion == 0) {
          width2 = width2 - 10;
        }
        diffFech = fi.diff(fiG, 'hours');
        x =
          (diffFech / this.gantt.options.step) *
          this.gantt.options.column_width;
        if (this.gantt.options.view_mode == 'Year') {
          x = x / 2;
          if (!row.unidad && !row.indice_ref_hito) {
            width2 = width2 / 2;
          }
        }
      } else {
        duration = ff.diff(fi, 'hours') / this.gantt.options.step;
        width2 = this.gantt.options.column_width * duration;
        diffFech = fi.diff(fiG, 'day');
        x = (diffFech * this.gantt.options.column_width) / 30;
        if (this.gantt.options.view_mode == 'Day' && row.duracion == 0) {
          x = x + 7;
        }
      }
      // const fini = new Date(row.fechaini); //+1 dia agregar
      const formattedDate1 = moment(row.fechaini).format('YYYY-MM-DD');
      const fini = new Date(formattedDate1 + 'T00:00:00');
      // const ffin = new Date(row.fechafin); // mas 2 dias
      const formattedDate2 = moment(row.fechafin).format('YYYY-MM-DD');
      const ffin = new Date(formattedDate2 + 'T00:00:00');
      row.referencia = !row.referencia ? '' : row.referencia;
      // console.log('rr', row, indice, fini, ffin, width2, duration, x)
      this.gantt.actualizarBarras(row, indice, fini, ffin, width2, duration, x);
      if (this.rutaCriticaActualizada) {
        this.quitarRutaCritica();
      }
    }
  }

  async actualizarRutaCritica(api = true, inicial = true) {
    try {
      if (inicial) {
        this.mostrar_carga_todo = true;
      }
      if (api) {
        const filtradoPartidas = this.dataPrincipal.filter(
          (ele) => ele.unidad && ele.duracion && !ele.indice_ref_hito
        );
        const tabla1 = JSON.stringify(filtradoPartidas);
        const body = JSON.stringify({
          datos: tabla1,
        });
        const response = await this.principalService.generarRutaCr(body);
        // response.forEach((element, index) => {
        //   element.index = index;
        // });
        // this.arrayNuevoRC = response.filter(
        //   (ele) => ele.custom_class == 'bar-milestone'
        // );
        this.gantt.graficarRutaCritica(response);
        this.arrayAnteriorRC = response;
        this.rutaCriticaActualizada = true;
      }
      if (inicial) {
        this.mostrar_carga_todo = false;
        this.toaster.success('Ruta critica actualizada', 'Éxito', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
      }
    } catch (e) {
      console.log(e)
      this.mostrar_carga_todo = false;
    }
  }

  async cancelarMultiples() {
    this.dataPrincipal.forEach((row) => {
      row.predecesor = false;
      row.nroclick = null;
    });
    this.acumuladorClicks = 0;
    this.noEnlazar = false;
  }

  async guardarEnlaces() {
    try {
      let seleccionados = [];
      seleccionados = this.dataPrincipal.filter((row) => row.predecesor);
      if (!seleccionados.length) {
        this.toaster.error('Ninguna Partida Seleccionada', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
        return;
      } else {
        this.mostrar_carga_todo = true;
        await this.agregarReferencias(seleccionados);
        this.mostrar_carga_todo = false;
      }
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
      console.log(error);
    }
  }

  async agregarReferencias(seleccionados) {
    const ordenados = await seleccionados.sort(function (a, b) {
      if (a.nroclick < b.nroclick) {
        return -1;
      }
      if (a.nroclick > b.nroclick) {
        return 1;
      }
      return 0;
    });
    let i = 0;
    let idgantt = null;
    let uid = null;
    let arrayCiclos = [];
    for (const row of ordenados) {
      if (i > 0) {
        let nuevo;

        if (row.referenciados) {
          if (row.condini) {
            await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid);
          }
          if (row.condfin) {
            await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid);
          }
          const encontrado = JSON.parse(row.referenciados).find(
            (ele) => ele[0] == uid
          );
          const existe = encontrado ? true : false;
          if (!existe) {
            nuevo = JSON.parse(row.referenciados).concat([[uid, '', '', '']]);
          } else {
            nuevo = JSON.parse(row.referenciados);
          }
        } else {
          nuevo = [[uid, '', '', '']];
        }
        const referencia = await this.referenciaTexto(nuevo);
        const respuesta = await this.verCiclo(nuevo, row.ind);
        if (respuesta) {
          // this.toaster.error(respuesta +'con la partida de id gantt : '+ row.idgantt, 'Error', {
          //   closeButton: false,
          //   positionClass: 'toast-bottom-right',
          //   timeOut: 5000,
          // });
          arrayCiclos.push([' - ' + row.idgantt]);
        } else {
          if (row.condini) {
            await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid);
          }
          if (row.condfin) {
            await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid);
          }
          row.condini = '';
          row.condfin = '';
          const condicionales = await this.condicionanteFila(nuevo, row.ind);
          if (condicionales.condini) {
            this.uidsOrdenados[row.uid].condini = JSON.stringify(
              condicionales.condini
            );
            const hijos = await this.agregarAlPadre(
              condicionales.condini[0],
              row.uid
            );
            this.uidsOrdenados[condicionales.condini[0]].hijos_uid = hijos
              ? JSON.stringify(hijos)
              : '';
          }
          if (condicionales.condfin) {
            this.uidsOrdenados[row.uid].condfin = JSON.stringify(
              condicionales.condfin
            );
            const hijos = await this.agregarAlPadre(
              condicionales.condfin[0],
              row.uid
            );
            this.uidsOrdenados[condicionales.condfin[0]].hijos_uid = hijos
              ? JSON.stringify(hijos)
              : '';
          }
          this.uidsOrdenados[row.uid].referencia = referencia;
          this.uidsOrdenados[row.uid].referenciados = JSON.stringify(nuevo);
          this.uidsOrdenados[row.uid].filaEditada = true;
          this.uidsOrdenados[row.uid].duracion = condicionales.duracion;
          this.uidsOrdenados[row.uid].fechafin = condicionales.fechafin;
          this.uidsOrdenados[row.uid].fechaini = condicionales.fechaini;
          this.uidsOrdenados[row.uid].duraciontot = condicionales.duraciontot;
          this.tablaDesemDesactua = true;
          this.tablaMatDesac = true;
          this.tablaGrafDesac = true;
          if (this.dataPrincipal[row.ind].hijos_uid) {
            this.prograNoActua = true;
          }
          if (!this.desacGrafico.includes(row.ind)) {
            this.desacGrafico.push(row.ind);
          }
        }
        await this.updateRowGraph();
      }
      idgantt = row.idgantt;
      uid = row.uid;
      i++;
    }
    if (arrayCiclos.length) {
      const msj =
        'No se agregaron en las siguientas partidas por cilclos generados :<br>' +
        arrayCiclos.join(' <br>');
      this.toaster.error(msj, 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 8000,
        enableHtml: true,
      });
    }
    for (const row of this.dataPrincipal) {
      row.predecesor = false;
      row.nroclick = null;
    }
    this.acumuladorClicks = 0;
    this.noEnlazar = false;
    if (this.prograNoActua) {
      await this.actualizarModificados();
    } else {
      // await this.guardarTemporalProgramacion('agregarReferencias');
      await this.guardarTemporal(
        this.dataPrincipal,
        this.prograNoActua,
        this.hitosEliminados
      );
    }
  }

  async referenciaTexto(referenciados) {
    let referencia = [];
    let textRef = '';
    if (referenciados.length) {
      let i = 0;
      for (const iterator of referenciados) {
        const idgantt = this.uidsOrdenados[iterator[0]].idgantt;
        const ref =
          idgantt +
          iterator[1] +
          (iterator[2] > 0 ? '+' + iterator[2] + 'D' : '');
        referencia.push(ref);
        i++;
      }
      textRef = referencia.join(',');
    }
    return textRef;
  }

  checkMultiple(row, indice) {
    if (!row.predecesor == true) {
      this.acumuladorClicks++;
      this.dataPrincipal[indice].nroclick = this.acumuladorClicks;
      this.dataPrincipal[indice].predecesor = !row.predecesor;
    } else {
      this.dataPrincipal[indice].predecesor = !row.predecesor;
      this.dataPrincipal[indice].nroclick = null;
      if (this.acumuladorClicks > 0) {
        this.acumuladorClicks--;
        this.dataPrincipal.map((row) => {
          if (row.nroclick > this.acumuladorClicks && row.nroclick) {
            row.nroclick = row.nroclick - 1;
          }
        });
      }
    }
  }

  async abrirModalXml() {
    try {
      const temporal = await this.listarTemporalProgramacion();
      if (temporal || this.prograNoActua) {
        this.toaster.error(
          'Guarde o descarte los cambios realizados para poder importar programacion',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      } else {
        const prograSinHitos = await this.quitarHitosProgramacion();
        const modalRef = this.modalService.open(ModalProgramacionXmlComponent, {
          size: 'lg modalgrande',
          backdrop: 'static',
          windowClass: 'pcoded',
          keyboard: false, //no cerrar el modal con ESC
        });
        modalRef.componentInstance.titulo1 = this.titulo1;
        modalRef.componentInstance.titulo1color = this.titulo1color;
        modalRef.componentInstance.titulo1letra = this.titulo1letra;
        modalRef.componentInstance.nombreProyecto = this.nombreProyecto;
        modalRef.componentInstance.dataPrincipal = prograSinHitos;
        modalRef.componentInstance.idProyecto = this.idProyecto;
        modalRef.componentInstance.idUsuario = this.id_usuario;
        modalRef.componentInstance.fechaProyecto = moment(
          this.dataProyecto.fecha_inicio
        ).format('YYYY-MM-DD');
        modalRef.componentInstance.dataProyecto = this.dataProyecto;
        modalRef.componentInstance.noLaborables = {
          arrayDiasNoLabEdit: this.arrayDiasNoLabEdit,
          tablaferiados: this.tablaferiados,
        };
        modalRef.componentInstance.aspectosdias = this.aspectosdias;
        const result = await modalRef.result;
        if (result == 'ok') {
          this.mostrar_carga_todo = true;
          await this.cargarDatos();
          await this.listaFeriados();
          await this.listarProgramacion(true);
          this.tablaDesembolso = [];
          this.mostrar_carga_todo = false;
        }
      }
    } catch (e) {
      SwalService.error();
      console.log(e);
    }
  }

  async quitarHitosProgramacion() {
    let arrayNuevo = [];
    arrayNuevo = await this.dataPrincipal.filter((ele) => ele.duracion);
    arrayNuevo.map((ele, index) => {
      arrayNuevo[index].ind = index;
      arrayNuevo[index].ind2 = index;
    });
    return arrayNuevo;
  }

  async modalHito() {
    const modalRef = this.modalService.open(ModalHitoComponent, {
      size: 'md',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false, //no cerrar el modal con ESC
    });
    modalRef.componentInstance.partidaSeleccionada = this.partidaSeleccionada;
    modalRef.componentInstance.fechaInicioProyecto =
      this.dataProyecto.fecha_inicio;
    modalRef.componentInstance.idProyecto = this.idProyecto;
    modalRef.componentInstance.idUsuario = this.id_usuario;
    modalRef.componentInstance.dataPrincipal = this.dataPrincipal;
    modalRef.componentInstance.version = this.version;
    const result = await modalRef.result;
    if (result) {
      this.mostrar_carga_todo = true;
      this.partidaSeleccionada = null;
      this.filaSel = null;
      await this.agregarHito(result);
      this.hitoAgregado = true;
      this.prograNoActua = true;
      this.tablaDesemDesactua = true;
      this.tablaMatDesac = true;
      this.tablaGrafDesac = true;
      if (this.view_mode) {
        await this.generarGrafico();
      }
      // await this.guardarTemporalProgramacion('modalHito');
      this.actualizarTemp();
      this.mostrar_carga_todo = false;
    }
  }

  async agregarHito(row) {
    let hitoFormat: filaProgramacion = {
      descripcion: row.descripcion,
      item: row.item,
      idgantt: null,
      condfin: '',
      condini: '',
      cuadrilla: null,
      duracion: 0,
      duracionreq: 0,
      duraciontot: 0,
      editarCua: false,
      editarDur: false,
      editarFF: false,
      editarFI: false,
      editarPred: false,
      editarRest: false,
      fechafin: row.fechafin,
      fechafinBD: true,
      fechaini: row.fechafin,
      fechainiBD: true,
      hijos: '',
      icomost: 0,
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
      ind: null,
      ind2: null,
      indice: null,
      hijos_uid: '',
      metrado: null,
      mostrar: 1,
      nivel: 1,
      nroclick: null,
      predecesor: null,
      referencia: row.referencias,
      referenciados: row.referenciados,
      rendimiento: null,
      restriccion: '',
      restriccion2: '',
      unidad: row.unidad ? row.unidad : false,
      uid: row.uid,
      indice_ref_hito: row.indice_refer,
      diasHabilesValido: true,
      editarDescrip: false,
      filaEditada: true,
      tiempoUnitario: null,
      cuadrillaEQ: null,
      cuadrillaEQ1: null,
      cuadrillaMO: null,
      cuadrillaMO1: null,
      detalle_partida: null,
      id_unidad: null,
      parcial: null,
    };
    const index = this.uidsOrdenados[row.indice_refer].ind + 1;
    this.dataPrincipal.splice(index, 0, hitoFormat);
    this.dataPrincipal.map((ele, index) => {
      this.dataPrincipal[index].ind = index;
      this.dataPrincipal[index].ind2 = index;
    });
  }

  async eliminarHito(row) {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se eliminará el hito: ' + row.descripcion
    );
    if (sw.isConfirmed) {
      this.mostrar_carga_todo = true;
      if (row.uid) {
        const uid = JSON.parse(JSON.stringify(row.uid));
        this.hitosEliminados.push(uid);
        this.uidsOrdenados[row.uid] = null;
      }
      this.dataPrincipal.splice(row.ind, 1);
      // this.dataPrincipal.map((ele, index) => {
      //   this.dataPrincipal[index].ind = index
      //   this.dataPrincipal[index].ind2 = index
      // })
      // await this.referenciasCorrectas()
      this.partidaSeleccionada = null;
      this.filaSel = null;
      this.prograNoActua = true;
      if (this.view_mode) {
        await this.generarGrafico();
      }
      // await this.guardarTemporalProgramacion('eliminarHito');
      await this.guardarTemporal(
        this.dataPrincipal,
        this.prograNoActua,
        this.hitosEliminados
      );
      this.mostrar_carga_todo = false;
    }
  }

  async reprogramarInicio(row) {
    if (row.duracion && !row.referencia) {
      let element = this.dataPrincipal[row.ind];
      this.dataPrincipal[row.ind].fechaini = moment(
        this.dataProyecto.fecha_inicio
      ).format('YYYY-MM-DD');
      this.dataPrincipal[row.ind].fechafin = moment(
        this.dataProyecto.fecha_inicio
      ).format('YYYY-MM-DD');
      this.dataPrincipal[row.ind].referencia = '';
      this.dataPrincipal[row.ind].referenciados = '';
      this.dataPrincipal[row.ind].restriccion = '';
      this.dataPrincipal[row.ind].restriccion2 = '';
      this.dataPrincipal[row.ind].condini = '';
      this.dataPrincipal[row.ind].condfin = '';
      this.dataPrincipal[row.ind].filaEditada = true;
      this.uidsOrdenados[this.dataPrincipal[row.ind].uid] =
        this.dataPrincipal[row.ind];
      element.cuadrilla = 1;
      const diasHabiles = element.tiempoUnitario / element.cuadrilla;
      if (diasHabiles > this.plazoHabil) {
        element.diasHabilesValido = false;
        element.duracion = this.plazoHabil;
        const cuadrillaNecesaria =
          element.tiempoUnitario / (element.duracion ? element.duracion : 1);
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
        element.duracion = Math.ceil(diasHabiles);
        const response = await this.calcularFechaComplemento(
          element.duracion,
          element.fechaini,
          ''
        );
        element.fechafin = response.fecha;
        element.duraciontot = response.duraciontot;
        element.filaEditada = true;
      }
      await this.superiores(element.ind);
      if (element.hijos_uid) {
        this.prograNoActua = true;
      }
      if (!this.desacGrafico.includes(element.ind)) {
        this.desacGrafico.push(element.ind);
      }
      this.updateRowGraph();
      this.quitarRutaCritica();

      this.tablaDesemDesactua = true;
      this.tablaMatDesac = true;
      this.tablaGrafDesac = true;
      // this.guardarTemporalProgramacion('reprogramarInicio');
      this.actualizarTemp();
    } else {
      let msj = this.partidaSeleccionada.referencia
        ? 'Partida con predecesores'
        : 'Partida es hito';
      this.toaster.error(msj, 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      return;
    }
  }

  async actualizarFechaFinHito(fechainicio, index) {
    await this.deshabilitarEditar(index);
    const rowAnterior = this.dataPrincipal[index];
    if (fechainicio === rowAnterior.fechaini) {
      return;
    } else if (moment(fechainicio).isValid()) {
      this.dataPrincipal[index].fechaini = fechainicio;
      this.dataPrincipal[index].fechafin = fechainicio;
      this.dataPrincipal[index].filaEditada = true;
      this.actualizarGrafico(index, 'actualizarFechaFinHito');
      // this.guardarTemporalProgramacion('actualizarFechaFinHito');
      this.actualizarTemp();
    }
  }

  agregarPredecesorRow() {
    const rowForm = new UntypedFormGroup({
      partida: new UntypedFormControl('', [Validators.required]),
      tipo: new UntypedFormControl('', []),
      dias: new UntypedFormControl('', []),
      idgantt: new UntypedFormControl('', []),
      adiTipo: new UntypedFormControl('', []),
      adicional: new UntypedFormControl('', []),
    });
    this.tablaDetalle.push(rowForm);
  }

  textoRestriccion(row) {
    let texto1 = '';
    let texto2 = '';
    let texto3 = '';
    if (row.restriccion) {
      texto1 =
        'Restricción Ini.:  ' + moment(row.restriccion).format('DD-MM-YYYY');
    }
    if (row.restriccion2) {
      texto2 =
        'Restricción Fin:  ' + moment(row.restriccion2).format('DD-MM-YYYY');
    }
    var fecha1 = moment(row.fechafin);
    var fecha2 = moment(row.restriccion2);
    if (fecha1 > fecha2) {
      const diasExcendente = fecha1.diff(fecha2, 'days');
      texto3 = 'Restr. fin excede en: ' + diasExcendente + 'dias';
    }
    const string = texto1 + '\n ' + texto2 + '\n ' + texto3;
    return string;
  }

  async evaluarRefHito(value, index) {
    try {
      await this.deshabilitarEditar(index);
      const rowAnterior = this.dataPrincipal[index];
      if (value == rowAnterior.referencia) {
        return;
      } else {
        let stringReferencia = '';
        let stringReferenciados = '';
        if (value) {
          const valueSpliteado = value.split(',');
          let arraystring = [];
          let arrayuids = [];
          for await (let ele of valueSpliteado) {
            const idgantt = parseInt(ele);
            if (!isNaN(idgantt) && idgantt <= this.ultimoidGantt) {
              const encontrado = arraystring.includes(idgantt);
              if (!encontrado) {
                const uid = this.tablaIdGantt[idgantt - 1].uid;
                arraystring.push(idgantt);
                arrayuids.push([uid, '', '', '']);
              }
            } else {
              this.toaster.error('ID no valido: ' + ele, 'Error', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 3000,
              });
            }
          }
          stringReferencia = arraystring.join(',');
          stringReferenciados = JSON.stringify(arrayuids);
        }

        this.dataPrincipal[index].referencia = stringReferencia;
        this.dataPrincipal[index].referenciados = stringReferenciados;
        if (this.dataPrincipal[index].uid) {
          this.dataPrincipal[index].filaEditada = true;
        }
        this.actualizarGrafico(index, 'evaluarRefHito');
        // this.guardarTemporalProgramacion('evaluarRefHito');
        this.actualizarTemp();
      }
    } catch (e) {
      SwalService.error();
      console.log(e);
    }
  }

  async actualizarRestriccion() {
    this.submitModal = true;
    this.FIinvalido = false;
    this.FFinvalido = false;
    const row = this.dataPrincipal[this.indiceSeleccionado];
    const restriccionAnterior1 = row.restriccion;
    const restriccionAnterior2 = row.restriccion2;
    if (
      restriccionAnterior1 == this.fechaRestriccion &&
      restriccionAnterior2 == this.fechaRestriccion2
    ) {
      this.displayBasic2 = false;
      return;
    } else {
      const fiProyecto = moment(this.dataProyecto.fecha_inicio).format(
        'YYYY-MM-DD'
      );
      const fr = this.fechaRestriccion
        ? moment(this.fechaRestriccion).format('YYYY-MM-DD')
        : '';
      const fr2 = this.fechaRestriccion2
        ? moment(this.fechaRestriccion2).format('YYYY-MM-DD')
        : '';
      if (this.noLaborables.includes(this.fechaRestriccion)) {
        this.FIinvalido = true;
        this.toaster.error('Fecha no laborable', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      } else {
        this.FIinvalido = false;
      }
      if (this.noLaborables.includes(this.fechaRestriccion2)) {
        this.FFinvalido = true;
        this.toaster.error('Fecha no laborable', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      } else {
        this.FFinvalido = false;
      }
      if (!fr && fr2 && fr2 < fiProyecto) {
        this.FFinvalido = true;
        this.toaster.error(
          'Fecha restriccion final menor a la fecha inicio de proyecto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
          }
        );
        return;
      }
      if (fr && fiProyecto > fr) {
        this.FIinvalido = true;
        var msj1 =
          'Fecha inicio restriccion menor a la fecha inicio del proyecto';
      }
      if (fr2 && fr2 < fr) {
        this.FFinvalido = true;
        var msj2 = 'Fecha fin restriccion menor a la fecha inicio restriccion';
      }

      if (this.FIinvalido || this.FFinvalido) {
        const mjs =
          this.FIinvalido && this.FFinvalido
            ? msj1 + ' y ' + msj2
            : this.FIinvalido
              ? msj1
              : msj2;
        this.toaster.error(mjs, 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      } else {
        row.restriccion = fr;
        row.restriccion2 = fr2;
        row.filaEditada = true;
        // this.guardarTemporalProgramacion('restriccion');
        this.actualizarTemp();
      }
      // if (!row.referencia && !row.hijos_uid) {
      // } else {
      //   let textcompleto = ''
      //   if (row.referencia) {
      //     const text1 = 'Se quitara la referencia existente'
      //     textcompleto = text1
      //   }
      //   if (row.hijos_uid) {
      //     if (row.referencia) {
      //       textcompleto = textcompleto + ' y '
      //     }
      //     const text2 = 'originará actualizacion de las dependencias de la partida seleccionada'
      //     textcompleto = textcompleto + text2
      //   }
      //   const sw = await SwalService.confirm('Estas seguro?', textcompleto)
      //   if (sw.isConfirmed) {
      //   } else {
      //     return
      //   }
      // }

      // if (fr || fr2) {
      //   if (fr && fr2) {
      //     const response = await this.calcularFechaComplemento(null, fr, fr2)
      //     row.fechaini = fr
      //     row.duracion = response.duracion
      //     row.duraciontot = response.duraciontot
      //     row.fechafin = fr2
      //   } else if (fr && !fr2) {
      //     const response2 = await this.calcularFechaComplemento(row.duracion, fr, null)
      //     row.fechaini = fr
      //     row.duracion = response2.duracion
      //     row.duraciontot = response2.duraciontot
      //     row.fechafin = response2.fecha
      //   } else {
      //     const response3 = await this.calcularFechaComplemento(row.duracion, null, fr2)
      //     if (response3.fecha < this.dataProyecto.fecha_inicio) {
      //       const response4 = await this.calcularFechaComplemento(null, fiProyecto, fr2)
      //       row.duracion = response4.duracion
      //       row.duraciontot = response4.duraciontot
      //       row.fechaini = fiProyecto
      //       row.fechafin = fr2
      //     }
      //   }

      // }
      // if (row.referencia) {
      //   if (row.condini) {
      //     await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid)
      //     row.condini = ''
      //   }
      //   if (row.condfin) {
      //     await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid)
      //     row.condfin = ''
      //   }
      // }
      // row.restriccion = fr
      // row.restriccion2 = fr2
      // row.referencia = ''
      // row.referenciados = ''
      // row.filaEditada = true
      // this.fechaRestriccion = null
      // this.fechaRestriccion2 = null
      this.displayBasic2 = false;
    }
  }

  diasExcedente(fechafin) {
    var f1 = moment(fechafin);
    var f2 = moment(this.FFRestriccion);
    let string = '';
    if (f2 < f1) {
      string =
        'Sobrepasa a la  fecha fin proyecto : ' +
        moment(this.FFRestriccion).format('DD-MM-YYYY');
    } else {
      string = '';
    }
    return string;
  }

  async showBasicDialog(programacion, index) {
    this.indiceSeleccionado = index;
    this.tablaDetalle.clear();
    this.stringPredecesor = '';
    this.listaPartidas2 = this.dataPrincipal.filter(
      (prog) =>
        prog.unidad &&
        prog.idgantt !== programacion.idgantt &&
        !prog.indice_ref_hito
    );
    this.displayBasic = true;
    const referenciados = programacion.referenciados
      ? JSON.parse(programacion.referenciados)
      : '';
    if (referenciados) {
      referenciados.map((ele) => {
        let numero = null;
        let adiTipo = '';
        let adicional = '';
        if (ele[2]) {
          numero = ele[2];
          adiTipo = ele[3];
          adicional = (ele[3] == '+' ? '' : ele[3]) + ele[2];
        }
        const encontrado = this.listaPartidas2.find(
          (row) => Number(row.uid) === Number(ele[0])
        );
        const rowForm = new UntypedFormGroup({
          partida: new UntypedFormControl(encontrado.idgantt, [Validators.required]),
          tipo: new UntypedFormControl(ele[1], []),
          dias: new UntypedFormControl(numero, []),
          idgantt: new UntypedFormControl(
            this.uidsOrdenados[Number(ele[0])].idgantt,
            []
          ),
          adiTipo: new UntypedFormControl(adiTipo, []),
          adicional: new UntypedFormControl(adicional, []),
        });
        if (ele[0]) {
          this.tablaDetalle.push(rowForm);
        }
      });
    }
  }

  async verificarAdicionalValido(index) {
    const fg = this.tablaDetalle.controls[index] as UntypedFormGroup;
    let texto = fg.get('adicional').value.toUpperCase();
    texto = texto.trim().replace(/ /g, '').toUpperCase();
    const primerCar = texto[0];
    const dias = parseInt(texto);
    let valido = true;
    let cantComplemento;
    let tipoComplemento;
    let signo = '';
    if (
      primerCar == '-' ||
      primerCar == '+' ||
      (primerCar !== '-' && primerCar !== '+' && !isNaN(dias))
    ) {
      if (primerCar == '+' || primerCar == '-') {
        signo = JSON.parse(JSON.stringify(primerCar));
        if (primerCar == '+') {
          texto = texto.slice(1, -1);
        }
      } else if (!isNaN(dias)) {
        signo = '+';
      } else {
        valido = false;
      }
      if (valido) {
        cantComplemento = parseInt(texto);
        tipoComplemento = texto.substring(cantComplemento.toString().length);
        if (isNaN(cantComplemento)) {
          valido = false;
        } else {
          const arrayValido = ['d', 'D', '%', ''];
          if (!arrayValido.includes(tipoComplemento)) {
            valido = false;
          } else {
            if (tipoComplemento == '%') {
              if (cantComplemento > 0 && cantComplemento < 101) {
              } else {
                valido = false;
              }
            } else {
              if (tipoComplemento == '') {
                texto = texto + 'D';
              }
              if (cantComplemento < this.plazoHabil) {
              } else {
                valido = false;
              }
            }
          }
        }
      } else {
        valido = false;
      }
      if (!valido) {
        this.toaster.error('Adicional no válido : ' + texto, 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        const fg = this.tablaDetalle.controls[index] as UntypedFormGroup;
        fg.get('dias').setValue('');
        fg.get('adiTipo').setValue('');
        fg.get('adicional').setValue('');
      } else {
        const fg = this.tablaDetalle.controls[index] as UntypedFormGroup;
        if (cantComplemento) {
          if (signo == '-') {
            cantComplemento = cantComplemento * -1;
          }
          let valido = tipoComplemento
            ? cantComplemento + tipoComplemento
            : cantComplemento + 'D';

          fg.get('dias').setValue(valido);
          fg.get('adiTipo').setValue(signo);
          fg.get('adicional').setValue(texto);
        }
      }
    } else {
      const fg = this.tablaDetalle.controls[index] as UntypedFormGroup;
      fg.get('dias').setValue('');
      fg.get('adiTipo').setValue('');
      fg.get('adicional').setValue('');
    }
    this.referenciaActualModal();
  }

  async referenciaActualModal() {
    let predecesorString = [];
    let referenciados = [];
    await this.tablaDetalle.value.map((row, index) => {
      if (row.partida) {
        const uid = this.tablaIdGantt[Number(row.partida) - 1].uid;
        let refer = [uid, '', '', ''];
        if (row.tipo) {
          refer[1] = row.tipo;
        }
        if (row.dias) {
          refer[2] = row.dias;
          refer[3] = !row.adiTipo ? '+' : row.adiTipo;
        }
        const arrref =
          row.partida + row.tipo + (row.dias ? row.adiTipo + row.dias : '');
        predecesorString.push(arrref);
        referenciados.push(refer);
      }
    });
    this.stringPredecesor = predecesorString.join(',');
    return { texto: this.stringPredecesor, referenciados: referenciados };
  }

  async seleccionPartidaModal(index) {
    const existe = this.tablaDetalle.value.find(
      (ele, i) =>
        i !== index && ele.partida == this.tablaDetalle.value[index].partida
    );
    if (existe) {
      this.toaster.error('Partida ya seleccionada', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      const fg = this.tablaDetalle.controls[index] as UntypedFormGroup;
      fg.get('partida').setValue('');
      fg.get('tipo').setValue('');
      fg.get('dias').setValue('');
      fg.get('idgantt').setValue('');
      fg.get('adiTipo').setValue('');
      fg.get('adicional').setValue('');
    }
    const response = await this.referenciaActualModal();
    const valido = await this.predecesorCorregido(
      response.texto,
      this.indiceSeleccionado
    );
    const respuesta = await this.verCiclo(
      valido.referenciados,
      this.indiceSeleccionado
    );
    if (respuesta) {
      const fg = this.tablaDetalle.controls[index] as UntypedFormGroup;
      fg.get('partida').setValue('');
      fg.get('tipo').setValue('');
      fg.get('dias').setValue('');
      fg.get('idgantt').setValue('');
      fg.get('adiTipo').setValue('');
      fg.get('adicional').setValue('');
      this.toaster.error('La partida genera un ciclo', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      return;
    } else {
      const fg = this.tablaDetalle.controls[index] as UntypedFormGroup;
      fg.get('idgantt').setValue(fg.get('partida').value);
    }
  }

  async eliminarRow(index) {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se eliminarà la fila seleccionada'
    );
    if (sw.isConfirmed) {
      this.tablaDetalle.removeAt(index);
    }
  }

  async crearPredecesor() {
    if (this.tablaDetalle.invalid) {
      this.tablaDetalle.markAllAsTouched();
      this.toaster.error('Campo incompletos', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      return;
    }
    this.mostrar_carga_todo = true;
    const response = await this.referenciaActualModal();
    const rowAnterior = JSON.parse(
      JSON.stringify(this.dataPrincipal[this.indiceSeleccionado])
    );
    if (response.texto == rowAnterior.referencia) {
      this.mostrar_carga_todo = false;
      this.displayBasic = false;
      return;
    }
    const row = this.dataPrincipal[this.indiceSeleccionado];
    if (response.texto) {
      const valido = await this.predecesorCorregido(
        response.texto,
        this.indiceSeleccionado
      );
      if (row.condini) {
        await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid);
      }
      if (row.condfin) {
        await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid);
      }
      const condicionales = await this.condicionanteFila(
        valido.referenciados,
        this.indiceSeleccionado
      );
      if (condicionales.condini) {
        this.uidsOrdenados[row.uid].condini = JSON.stringify(
          condicionales.condini
        );
        const hijos = await this.agregarAlPadre(
          condicionales.condini[0],
          row.uid
        );
        this.uidsOrdenados[condicionales.condini[0]].hijos_uid = hijos
          ? JSON.stringify(hijos)
          : '';
      }
      if (condicionales.condfin) {
        this.uidsOrdenados[row.uid].condfin = JSON.stringify(
          condicionales.condfin
        );
        const hijos = await this.agregarAlPadre(
          condicionales.condfin[0],
          row.uid
        );
        this.uidsOrdenados[condicionales.condfin[0]].hijos_uid = hijos
          ? JSON.stringify(hijos)
          : '';
      }
      this.uidsOrdenados[row.uid].referencia = valido.referencia;
      this.uidsOrdenados[row.uid].referenciados = JSON.stringify(
        valido.referenciados
      );
      this.uidsOrdenados[row.uid].filaEditada = true;
      this.uidsOrdenados[row.uid].duracion = condicionales.duracion;
      this.uidsOrdenados[row.uid].fechafin = condicionales.fechafin;
      this.uidsOrdenados[row.uid].fechaini = condicionales.fechaini;
      this.uidsOrdenados[row.uid].duraciontot = condicionales.duraciontot;
      this.tablaDesemDesactua = true;
      this.tablaMatDesac = true;
      this.tablaGrafDesac = true;
    } else {
      if (row.condini) {
        await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid);
      }
      if (row.condfin) {
        await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid);
      }
      this.uidsOrdenados[row.uid].referencia = '';
      this.uidsOrdenados[row.uid].referenciados = '';
      this.uidsOrdenados[row.uid].condini = '';
      this.uidsOrdenados[row.uid].condfin = '';
      this.uidsOrdenados[row.uid].filaEditada = true;
      this.prograNoActua = true;
      this.tablaDesemDesactua = true;
      this.tablaMatDesac = true;
      this.tablaGrafDesac = true;
    }
    if (!this.desacGrafico.includes(this.indiceSeleccionado)) {
      this.desacGrafico.push(this.indiceSeleccionado);
    }
    if (this.dataPrincipal[this.indiceSeleccionado].hijos_uid) {
      this.prograNoActua = true;
    }

    // this.guardarTemporalProgramacion('evaluarReferencia');
    this.actualizarTemp();
    this.quitarRutaCritica();
    this.updateRowGraph();
    this.mostrar_carga_todo = false;
    this.displayBasic = false;
  }

  async restaurarProgramacion() {
    try {
      this.mostrar_carga_todo = true;
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se restaurará todas las partidas de la programacion con dias habiles en base a las cuadrillas de programacion de tiempos'
      );
      if (sw.isConfirmed) {
        await this.descartarTemporalProgramacion();
        const inputProyecto = {
          id_proyecto: this.idProyecto,
          id_usuario: this.id_usuario,
          version: this.version
        };
        console.log('inputProyecto', inputProyecto)
        const response = await this.principalService.restaurarPrograma(
          inputProyecto
        );
        await this.listarProgramacion(true);
        this.mostrar_carga_todo = false;
        this.toaster.success('Se restauró correctamente', 'Éxito', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
      } else {
        this.mostrar_carga_todo = false;
      }
    } catch (error) {
      console.log(error);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  ngOnDestroy() {
    this.limpiarGantt();
    clearInterval(this.startTimer);
    clearInterval(this.timer2);
    if (this.token) {
      //crear otro metodo pasando token
      if ((this.running && !this.bloqtemp) || this.initim2) {
        // this.GuardTemp(this.id_proyecto,this.id_user,this.ultindice,this.datasourcePri,this.datasourcePriacu,this.datasourcePrisub,this.inserta,this.modifica,this.elimina,this.insertaacu,this.modificaacu,this.eliminaacu);
        this.guardarTemporal(
          this.dataPrincipal,
          this.prograNoActua,
          this.hitosEliminados
        );
      }
    } //temporales
  }

  async limpiarGantt() {
    if (this.gantt) {
      this.gantt.clear();
      var element = document.getElementById('gantt');
      if (element) {
        element.innerHTML = '';
      }
      this.gantt = null;
    }
  }

  presTeclaTiempos(event, ind, input, input2) {
    if (event.keyCode.toString() == '27') {
      //esc descartar los cambios
      event.target.blur();
    } else if (event.keyCode.toString() == '13') {
      //enter
      event.target.blur();
    } else if (event.keyCode.toString() == '40') {
      // abajo
      const cantidadFilas = this.dataPrincipal.length;
      if (ind + 1 < cantidadFilas) {
        for (let i = ind + 1; i < cantidadFilas; i++) {
          if (this.dataPrincipal[i].unidad) {
            if (Number(this.dataPrincipal[i].duracion) == 0 && input == 'Dur') {
            } else {
              event.target.blur();
              this.dataPrincipal[i]['editar' + input] = true;
              break;
            }
          }
        }
      } else {
        return;
      }
    } else if (event.keyCode.toString() == '38') {
      //arriba
      const cantidadFilas = this.dataPrincipal.length;
      if (ind + 1 > 0) {
        for (let i = ind - 1; i > 0; i--) {
          if (this.dataPrincipal[i].unidad) {
            if (Number(this.dataPrincipal[i].duracion) == 0 && input == 'Dur') {
            } else {
              event.target.blur();
              this.dataPrincipal[i]['editar' + input] = true;
              break;
            }
          }
        }
      } else {
        return;
      }
    } else if (event.keyCode.toString() == '37') {
      //izquierda
    }
    if (event.keyCode.toString() == '39') {
      //derecha
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
    if (
      moment(fecha).format('YYYY-MM-DD') > this.ffLimite ||
      moment(fecha).format('YYYY-MM-DD') < this.fiLimite
    ) {
      this.prograNoActua = true;
      this.limitesIncorrectos = true;
    }
    const obj = {
      duracion: diasHabiles,
      duraciontot: diasTotales,
      fecha: fecha,
    };
    return obj;
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
    const arrayItem = this.dataPrincipal[indice].item.split('.');
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

  async generarFormulas() {
    this.mostrar_carga_todo = true;
    for (const iterator of this.dataPrincipal) {
      await this.recuperarDetallePartida(iterator);
      this.gantt.actualizarTextoPopUp(
        iterator.ind,
        iterator.cuadrillaMO1,
        iterator.cuadrillaEQ1
      );
    }
    this.detallesGenerados = true;
    this.mostrar_carga_todo = false;
  }

  async recuperarDetallePartida(row) {
    if (!row?.unidad) {
      this.detalleGenerado = true;
      return;
    }
    if (this.verDetalle && row && row.unidad) {
      this.detalleGenerado = false;
      let detalle_partida = [];
      if (row.unidad) {
        if (!row.detalle_partida) {
          const obj = {
            id_proyecto: this.idProyecto,
            indice: row.indice,
          };
          const listaInsumos = await this.principalService.detallePartidaProgra(
            obj
          );
          const arrayTipos = ['MANO DE OBRA', 'EQUIPOS'];
          let response = [];
          let i = 1;
          for (const iterator of arrayTipos) {
            const obj = {
              codigo: null,
              cuadrilla: null,
              cuadrillamod: null,
              descripcion: iterator,
              id_filadetalle: null,
              id_proyecto: null,
              id_tipo_insumo: i,
              indice: null,
              num_det: null,
              unidad: '',
            };
            response.push(obj);
            const encontrados = await listaInsumos.filter(
              (ele) => ele.id_tipo_insumo == i
            );
            response = response.concat(encontrados);
            i = i + 2;
          }
          if (response.length) {
            let arrayAbreviaturas = [];
            for (const iterator of response) {
              let word = '';
              const arrayTextos = ['DE', 'CON'];
              if (iterator.unidad) {
                const texto = iterator.descripcion.trim();
                if (texto.includes(' ')) {
                  const spliteado = texto.split(' ');
                  let i = 1;
                  if (spliteado.length > 1) {
                    while (
                      i < spliteado.length &&
                      arrayTextos.includes(spliteado[i].toUpperCase())
                    ) {
                      i++;
                    }
                  }
                  word = spliteado[0].substr(0, 1) + spliteado[i].substr(0, 1);
                } else {
                  word = texto.substr(0, 2);
                }
                const abrev = word[0].toUpperCase() + word.slice(1);
                const encontrados = arrayAbreviaturas.filter(
                  (ele) => ele == abrev
                );
                iterator.unidad2 = !encontrados.length
                  ? abrev
                  : abrev + encontrados.length;
                arrayAbreviaturas.push(abrev);
              } else {
                iterator.unidad2 = '';
              }
              iterator.cuadrilla2 = row.cuadrilla * iterator.cuadrilla;
            }
            detalle_partida = response;
          }
        }
        let cuadrillaArr = [[], []];
        let i = -1;
        for (const iterator of detalle_partida) {
          if (!iterator.unidad) {
            i++;
          } else {
            const texto =
              this.formsService.redondeo(iterator.cuadrilla, 2) +
              '(' +
              iterator.unidad2 +
              ')';
            cuadrillaArr[i].push(texto);
          }
        }
        const cuadrillaMO = cuadrillaArr[0].join(' + ');
        const cuadrillaEQ = cuadrillaArr[1].join(' + ');
        this.dataPrincipal[row.ind].detalle_partida = detalle_partida;
        this.dataPrincipal[row.ind].cuadrillaMO = cuadrillaMO;
        this.dataPrincipal[row.ind].cuadrillaEQ = cuadrillaEQ;
        await this.cuadrillaEditadaTabla(row.ind);
      }
    }
  }

  async cuadrillaEditadaTabla(ind) {
    const rowSeleccionado = this.dataPrincipal[ind];
    for (const iterator of rowSeleccionado.detalle_partida) {
      iterator.cuadrilla2 = rowSeleccionado.cuadrilla * iterator.cuadrilla;
    }
    let cuadrillaArr = [[], []];
    let i = -1;
    for (const iterator of rowSeleccionado.detalle_partida) {
      if (!iterator.unidad) {
        i++;
      } else {
        const texto =
          this.formsService.redondeo(iterator.cuadrilla2, 2) +
          '(' +
          iterator.unidad2 +
          ')';
        cuadrillaArr[i].push(texto);
      }
    }
    const cuadrillaMO = cuadrillaArr[0].join(' + ');
    const cuadrillaEQ = cuadrillaArr[1].join(' + ');
    this.dataPrincipal[ind].cuadrillaMO1 = cuadrillaMO;
    this.dataPrincipal[ind].cuadrillaEQ1 = cuadrillaEQ;
    this.detalleGenerado = true;
  }

  //Cuadro desembolso

  async generarTablaDesembolso() {
    try {
      if (this.prograNoActua) {
        this.toaster.error('Tabla gantt no actualizada ', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      } else {
        this.fueraPlazo = false;
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
            const cant = iterator.item.split('.');
            if (cant.length == 1) {
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
              this.fueraPlazo = true;
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
        this.redTotDesem = [];
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
        this.redTotDesem = this.totalesDesembolso.map((ele) =>
          this.formsService.redondeo(ele, this.dec_parcial)
        );

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
        // this.sumPorcDesem = this.formsService.redondeo(
        //   this.porcentajesDesembolso.reduce(
        //     (a, b) => Number(a) + Number(b),
        //     0
        //   ),
        //   2
        // );
        this.sumPorcDesem = sumPorc;
        if (Number(this.sumPorcDesem) > 100) {
          this.sumPorcDesem = this.formsService.redondeo(100, 2);
        }
        this.tablaDesemDesactua = false;
        await this.listarInsumosXProyecto();
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      SwalService.error();
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

  ///CALENDARIO MATERIALES

  async recalcularTablaMateriales() {
    this.mostrar_carga_todo = true;
    await this.generarTablaDesembolso();
    await this.evaluarOcultarColum(false);
    await this.generarCalendarioMateriales();
    await this.generarReporteGrafico();
    this.mostrar_carga_todo = false;
  }

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

  async evaluarColumnasTabla(event, tabla) {
    if (tabla == 'desembolso') {
      this.columnasEstatica = event;
    } else {
      this.columnasEstatica2 = event;
    }
  }

  ////NUEVO
  async cambioDeTab(event) {
    if (event.nextId == 2) {
      if (!this.tablaDesembolso.length) {
        this.mostrar_carga_todo = true;
        setTimeout(async () => {
          await this.generarTablaDesembolso();
          this.mostrar_carga_todo = false;
        }, 100);
      }
    } else if (event.nextId == 3) {
      if (!this.tablaDesembolso.length || !this.calendarioMateriales.length) {
        this.mostrar_carga_todo = true;
        setTimeout(async () => {
          if (!this.tablaDesembolso.length) {
            await this.generarTablaDesembolso();
            await this.generarCalendarioMateriales();
          } else {
            await this.generarCalendarioMateriales();
          }
          this.mostrar_carga_todo = false;
        }, 100);
      }
    } else if (event.nextId == 4) {
      if (!this.tablaDesembolso.length) {
        this.mostrar_carga_todo = true;
        setTimeout(async () => {
          if (!this.tablaDesembolso.length) {
            await this.generarTablaDesembolso();
            await this.generarChart();
          }
          this.mostrar_carga_todo = false;
        }, 100);
      } else {
        await this.generarChart();
        this.mostrar_carga_todo = false;
      }
    }
  }

  async listarProgramacion(inicio = false) {
    const temporal = await this.listarTemporalProgramacion();
    const input = { id_proyecto: this.idProyecto, version: this.version };

    const response = await this.principalService.listarProgramacionProyecto(
      input
    );
    if (temporal) {
      this.existetemp = true;
    } else {
      this.existetemp = false;
    }
    if (temporal && temporal.dataPrincipal) {
      const data = temporal.dataPrincipal;
      this.prograNoActua = temporal.prograNoActua;
      this.dataPrincipal = [];
      let arrayUIDsOrdenados = [];
      for (const iterator of data) {
        const tabla = await this.formatoFila(iterator, response[0]);
        this.dataPrincipal.push(tabla);
      }
      this.dataPrincipal = await this.dataPrincipal.map((ele, index) => {
        ele.ind = index;
        ele.ind2 = index;
        ele.referenciados = ele.referenciados == null ? '' : ele.referenciados;
        return ele;
      });
      let ultimo = null;
      this.dataPrincipal.map((ele) => {
        if (ele.uid) {
          arrayUIDsOrdenados[ele.uid] = ele;
        }
      });
      this.tablaIdGantt = await this.dataPrincipal.filter(
        (ele) => ele.duracion && !ele.indice_ref_hito
      );
      this.tablaIdGantt = this.tablaIdGantt.map((ele, index) => {
        ele.idgantt = index + 1;
        ultimo = index + 1;
        return ele;
      });
      this.uidsOrdenados = arrayUIDsOrdenados;
      const actualizar = await this.referenciasCorrectas();
      if (this.prograNoActua) {
        await this.actualizarTablaCompleta();
        // await this.actualizarModificados()
        if (actualizar) {
          // await this.guardarTemporalProgramacion('listarProgramacion');
          await this.guardarTemporal(
            this.dataPrincipal,
            this.prograNoActua,
            this.hitosEliminados
          );
        }
      } else {
        await this.actualizarTitulos2();
        // await this.guardarTemporalProgramacion('listarProgramacion');
        await this.guardarTemporal(
          this.dataPrincipal,
          this.prograNoActua,
          this.hitosEliminados
        );
      }
      this.ultimoidGantt = ultimo;
    } else {
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
        if (!this.solover) {
          const arrayEliminar = await this.listarIndicesElimPresupuesto();
          if (arrayEliminar.length) {
            const tablaguardar = await this.actualizarPrograInd(arrayEliminar);
            if (tablaguardar.length) {
              await this.guardar2(tablaguardar, true);
              return;
            }
          }
        }
        this.ultimoidGantt = ultimo;
      }
    }
    if (this.view_mode && this.dataPrincipal.length) {
      await this.generarGrafico();
    }
    this.prograNoActua = false;
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
        if (
          !iterator.condini &&
          !iterator.condfin &&
          iterator.unidad &&
          !iterator.indice_ref_hito
        ) {
          await this.actuaEliminado(iterator);
          iterator.filaEditada = true;
          guardar = true;
        }
      } else {
      }
    }
    return guardar;
  }

  async actuaEliminado(row) {
    if (row.condini) {
      await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid);
    }
    if (row.condfin) {
      await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid);
    }

    const condicionales = await this.condicionanteFila(
      JSON.parse(row.referenciados),
      row.ind
    );
    if (condicionales.condini) {
      this.uidsOrdenados[row.uid].condini = JSON.stringify(
        condicionales.condini
      );
      const hijos = await this.agregarAlPadre(
        condicionales.condini[0],
        row.uid
      );
      this.uidsOrdenados[condicionales.condini[0]].hijos_uid = hijos
        ? JSON.stringify(hijos)
        : '';
    }
    if (condicionales.condfin) {
      this.uidsOrdenados[row.uid].condfin = JSON.stringify(
        condicionales.condfin
      );
      const hijos = await this.agregarAlPadre(
        condicionales.condfin[0],
        row.uid
      );
      this.uidsOrdenados[condicionales.condfin[0]].hijos_uid = hijos
        ? JSON.stringify(hijos)
        : '';
    }
    this.uidsOrdenados[row.uid].referencia = row.referencia;
    this.uidsOrdenados[row.uid].referenciados = row.referenciados;

    this.uidsOrdenados[row.uid].filaEditada = true;
    this.uidsOrdenados[row.uid].duracion = condicionales.duracion;
    this.uidsOrdenados[row.uid].fechafin = condicionales.fechafin;
    this.uidsOrdenados[row.uid].fechaini = condicionales.fechaini;
    this.uidsOrdenados[row.uid].duraciontot = condicionales.duraciontot;
    if (this.dataPrincipal[row.ind].hijos_uid) {
      this.prograNoActua = true;
    }
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

  async visualizacionGrafico() {
    this.mostrar_carga_todo = true;
    this.tablaDesembolso = [];
    if (this.view_mode) {
      this.verDetalle = false;
      this.verMontos = false;
      this.width = document.body.clientWidth / 2;
      this.onResize();
      await this.generarGrafico();
      this.mostrar_carga_todo = false;
    } else {
      if (this.gantt) {
        this.width = document.body.clientWidth;
        this.fechaFinalGrafico = null;
        this.fechaIniGrafico = null;
        this.actualizarHeader = {
          fechaFinalGrafico: this.fechaFinalGrafico,
          fechaIniGrafico: this.fechaIniGrafico,
        };
        this.gantt.clear();
        var element = document.getElementById('gantt');
        if (element) {
          element.innerHTML = '';
        }
        this.mostrar_carga_todo = false;
      }
    }
  }

  async generarGrafico(refrescar = false) {
    try {
      if (!refrescar) {
        if (this.gantt) {
          await this.limpiarGantt();
        }
        this.fechaIniGrafico = null;
        this.fechaFinalGrafico = null;
      }
      // const tabla1 = JSON.stringify(this.dataPrincipal);
      // const body = JSON.stringify({
      //   datos: tabla1,
      // });
      // const response = await this.principalService.generarDataGantt(body);
      this.arrayAnteriorRC = [];
      // if (response.length) {
      //   response.forEach((element, index) => {
      //     element.index = index;
      //     element.item = this.dataPrincipal[index].item;
      //     element.unidad = this.dataPrincipal[index].unidad;
      //     const refererenciados = this.dataPrincipal[index].referenciados
      //       ? JSON.parse(this.dataPrincipal[index].referenciados)
      //       : [];
      //     let tipos = [];
      //     if (refererenciados.length) {
      //       refererenciados.map((ele) => tipos.push(ele[1]));
      //     }
      //     if (element.custom_class == 'bar-milestone') {
      //       this.arrayAnteriorRC.push(element);
      //     }
      //     element.types = tipos;
      //     element.cuadrillaMO = '';
      //     element.cuadrillaEQ = '';
      //   });
      const response = await this.estructuraFrappe(this.dataPrincipal);
      const feriados = await this.fechasLimitesGraficos(this.dataPrincipal);

      this.actualizarHeader = {
        fechaFinalGrafico: this.fechaFinalGrafico,
        fechaIniGrafico: this.fechaIniGrafico,
      };
      await this.datosGantt(
        response,
        feriados,
        this.fechaIniGrafico,
        this.fechaFinalGrafico
      );
      this.rutaCriticaActualizada = false;
      // } else {
      // }
    } catch (error) {
      console.log('err', error);
    }
  }

  async estructuraFrappe(data) {
    let response = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const referencia = row.referencia ? row.referencia : '';
      const dependencies = referencia
        .split(',')
        .map((ele) => parseInt(ele).toString());
      const refererenciados = row.referenciados
        ? JSON.parse(row.referenciados)
        : [];
      let tipos = [];
      if (refererenciados.length) {
        refererenciados.map((ele) => tipos.push(ele[1]));
      }
      const obj: filaGantt = {
        cuadrillaEQ: '',
        cuadrillaMQ: '',
        custom_class: row.unidad ? (row.duracion == 0 ? 'bar-hito ' : null) : 'bar-milestone2',
        dependencies: dependencies.join(','),
        end: moment(row.fechafin).format('YYYY-MM-DD'),
        start: moment(row.fechaini).format('YYYY-MM-DD'),
        id: row.idgantt !== null ? row.idgantt.toString() : null,
        index: i,
        item: row.item,
        name: row.descripcion,
        referencias: row.referencia,
        types: tipos,
        unidad: row.unidad,
      };
      response.push(obj);
    }
    return response;
  }

  async recuperarRutaCritica() {
    let arrayPartidas = [];
    for (const row of this.dataPrincipal) {
      if (row.unidad && !row.indice_ref_hito) {
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

  async datosGantt(tasks, feriadosGantt, fechaini, fechafin) {
    let formattedDate = moment(fechaini).format('YYYY-MM-DD');
    let inicio = new Date(formattedDate + 'T00:00:00');
    // const inicio = new Date(moment(fechaini).format('YYYY-MM-DD'));
    // const fin = new Date(moment(fechafin).format('YYYY-MM-DD'));
    let formattedDate2 = moment(fechafin).format('YYYY-MM-DD');
    let fin = new Date(formattedDate2 + 'T00:00:00');
    const finProyect = new Date(
      moment(this.dataProyecto.fecha_culmina)
        .add(1, 'days')
        .format('YYYY-MM-DD')
    );
    const iniProyect = new Date(
      moment(this.dataProyecto.fecha_inicio).add(1, 'days').format('YYYY-MM-DD')
    );
    let step = null;
    let column_width = null;
    let fiLimite = null;
    let ffLimite = null;
    if (this.view_mode === 'Day') {
      step = 24;
      column_width = 18;
      fiLimite = moment(inicio).subtract(6, 'days');
      ffLimite = moment(fin).add(15, 'days');
    } else if (this.view_mode === 'Week') {
      step = 24 * 7;
      column_width = 35;
      fiLimite = moment(inicio).subtract(6, 'days');
      ffLimite = moment(fin).add(7, 'days');
    } else if (this.view_mode === 'Month') {
      step = 24 * 30;
      column_width = 120;
      ffLimite = moment(fin).add(1, 'years');
      const anio = moment(inicio).format('YYYY');
      fiLimite = anio + '-01-01';
    } else if (this.view_mode === 'Year') {
      step = 24 * 365;
      column_width = 360;
      fiLimite = moment(inicio).subtract(3, 'years');
      ffLimite = moment(fin).add(2, 'years');
    }
    this.fiLimite = moment(fiLimite).format('YYYY-MM-DD');
    this.ffLimite = moment(ffLimite).format('YYYY-MM-DD');
    const existe = document.getElementById('gantt');
    if (!existe) {
      return;
    }
    if (!this.gantt) {
      this.gantt = new Gantt('#gantt', tasks, {
        header_height: 40,
        column_width: column_width, //10
        column_height: 5,
        height: 880,
        step: step, //50
        bar_height: 10,
        bar_height_tittle: 6,
        bar_corner_radius: 1,
        bar_corner_radius_tittle: 3,
        padding: 12,
        view_mode: this.view_mode,
        feriados: feriadosGantt,
        language: 'es',
        gantt_end: fin,
        gantt_start: inicio,
        finProyecto: finProyect,
        iniProyecto: iniProyect,
        mostrar_label: false,
        date_format: 'YYYY-MM-DD',
        draggable: false,
        bar_feriados: this.colorFeriado,
        bar_dia_actual: this.colorActual,
        bar_no_laborables: this.colorNoLabo,
      });
    } else {
      this.gantt.options.view_mode = this.view_mode;
      this.gantt.refresh(tasks, feriadosGantt, this.view_mode);
    }
  }

  async updateRowGraph() {
    if (this.desacGrafico?.length == 1) {
      await this.superiores(this.desacGrafico[0]);
    }
    if (this.desacGrafico?.length) {
      for (const iterator of this.desacGrafico) {
        await this.actualizarGrafico(iterator, 'updateRowGraph');
        if (!this.grupoDesactualizados.includes(iterator)) {
          this.grupoDesactualizados.push(iterator);
        }
      }
    }

    this.desacGrafico = [];
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
      this.colorNoLabo = arrayColores[0] ? arrayColores[0] : 'color_1';
      this.colorFeriado = arrayColores[1] ? arrayColores[1] : 'color_1';
      this.colorActual = arrayColores[2] ? arrayColores[2] : 'color_1';

      const encontrado1 = this.coloresProgra.find(
        (ele) => ele.nombre == this.colorFeriado
      );
      const encontrado2 = this.coloresProgra.find(
        (ele) => ele.nombre == this.colorNoLabo
      );
      const encontrado3 = this.coloresProgra.find(
        (ele) => ele.nombre == this.colorActual
      );

      this.colorFeriadosLey = encontrado1 ? encontrado1.id : '#ccc3a980';
      this.colorNoLaboLey = encontrado2 ? encontrado2.id : '#ccc3a980';
      this.colorDiaActLey = encontrado3 ? encontrado3.id : '#ccc3a980';

      this.arrayDiasNoLabEdit = nolab1 == '' ? [] : nolab1.split('|');
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

  async formatoFila(fila, actual) {
    const filaProgra: filaProgramacion = {
      condfin: fila.condfin ? fila.condfin : '',
      condini: fila.condini ? fila.condini : '',
      editarDescrip: false,
      editarDur: false,
      editarFI: false,
      editarPred: false,
      editarRest: false,
      hijos: fila.hijos ? fila.hijos : null,
      ind: fila.ind !== null ? fila.ind : null,
      cuadrilla: fila.cuadrilla ? fila.cuadrilla : null,
      diasHabilesValido: fila.diasHabilesValido
        ? fila.diasHabilesValido
        : false,
      duracion: fila.duracion !== null ? fila.duracion : 1,
      duracionreq: fila.duracionreq !== null ? fila.duracionreq : 1,
      duraciontot: fila.duraciontot !== null ? fila.duraciontot : 1,
      fechafin: fila.fechafin
        ? moment(fila.fechafin).format('YYYY-MM-DD')
        : null,
      fechaini: fila.fechaini
        ? moment(fila.fechaini).format('YYYY-MM-DD')
        : moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD'),
      filaEditada: fila.filaEditada ? fila.filaEditada : false,
      hijos_uid: fila.hijos_uid ? fila.hijos_uid : null,
      idgantt: null,
      ind2: null,
      indice: fila.indice,
      indice_ref_hito: fila.indice_ref_hito ? fila.indice_ref_hito : null,
      metrado: fila.metrado,
      nroclick: null,
      predecesor: fila.predecesor ? fila.predecesor : null,
      referencia: fila.referencia,
      referenciados: fila.referenciados ? fila.referenciados : null,
      rendimiento:
        isNaN(Number(fila.rendimiento)) || Number(fila.rendimiento) == 0
          ? 1
          : fila.rendimiento,
      restriccion: fila.restriccion ? fila.restriccion : '',
      restriccion2: fila.restriccion2 ? fila.restriccion2 : '',
      tiempoUnitario: fila.tiempoUnitario ? fila.tiempoUnitario : null,
      uid: fila.uid,
      cuadrillaEQ: fila.cuadrillaEQ ? fila.cuadrillaEQ : null,
      cuadrillaEQ1: fila.cuadrillaEQ1 ? fila.cuadrillaEQ1 : null,
      cuadrillaMO: fila.cuadrillaMO ? fila.cuadrillaMO : null,
      cuadrillaMO1: fila.cuadrillaMO1 ? fila.cuadrillaMO1 : null,
      descripcion: fila.descripcion,
      detalle_partida: null,
      editarCua: false,
      editarFF: false,
      fechafinBD: false,
      fechainiBD: false,
      icomost: fila.icomost,
      id_proyecto: fila.id_proyecto,
      id_unidad: fila.id_unidad,
      id_usuario: fila.id_usuario,
      item: fila.item,
      mostrar: 1,
      nivel: fila.nivel,
      parcial: fila.parcial,
      unidad: fila.unidad,
    };

    if (!filaProgra.indice_ref_hito) {
      const encontrado = await actual.find((ele) => ele.uid == filaProgra.uid);

      filaProgra.metrado = encontrado ? encontrado.metrado : filaProgra.metrado;
      const cuad = filaProgra.tiempoUnitario / filaProgra.duracion;
      filaProgra.cuadrilla = parseFloat(this.formsService.redondeo(cuad, 3));
    } else {
      filaProgra.duracion = 0;
    }

    return filaProgra;
  }

  async guardarCambios() {
    try {
      this.mostrar_carga_todo = true;
      if (this.bloqtemp /* || this.running */) {
        //temporales
        this.toaster.error(
          'Espere a que termine de guardar sus cambios en la nube. Tiene que desaparecer el icono de nube azul.',
          'Información',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      } //temporales
      const tempPresu = await this.ListarPresupuestoTemp();
      if (tempPresu) {
        this.mostrar_carga_todo = false;
        SwalService.warning(
          'Error',
          'Cambios no guardados en Edicion de presupuesto. El encargado  debe guardar o descartar los cambios en la vista edicion de presupuesto'
        );
        return;
      }
      // const existe = await this.dataPrincipal.find((ele) => ele.filaEditada);
      if (this.existetemp || this.hitosEliminados.length) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          'Se guardará todos los cambios realizados'
        );
        if (sw.isConfirmed) {
          this.stop(); //temporales
          const existe2 = await this.dataPrincipal.find(
            (ele) => ele.filaEditada && !ele.indice_ref_hito && ele.unidad
          );
          if (this.prograNoActua && existe2) {
            await this.actualizarTablaCompleta();
          }
          let partidas = [];
          let hitosEditados = [];
          let indicesHitos = [];
          await this.dataPrincipal.forEach((ele, index) => {
            if (ele.filaEditada) {
              ele.referencia = ele.referencia == null ? '' : ele.referencia;
              ele.referenciados =
                ele.referenciados == null ? '' : ele.referenciados;
              ele.hijos = ele.hijos == null ? '' : ele.hijos;
              ele.hijos_uid = ele.hijos_uid == null ? '' : ele.hijos_uid;
              ele.indice_ref_hito =
                ele.indice_ref_hito == null ? '' : ele.indice_ref_hito;
              if (!ele.indice_ref_hito) {
                partidas.push(ele);
              } else {
                hitosEditados.push(ele);
                if (!ele.uid) {
                  indicesHitos.push(index);
                }
              }
            }
          });
          const arrayEliminar = await this.listarIndicesElimPresupuesto();
          if (arrayEliminar.length) {
            partidas = await this.actualizarPrograInd(arrayEliminar);
          }
          const tabla1 = JSON.stringify(partidas);
          const body = JSON.stringify({
            id_usuario: this.id_usuario,
            datos1: tabla1,
            id_proyecto: this.idProyecto,
          });
          const response = await this.principalService.guardarDatosProgramacion(
            body
          );
          if (response.id == '1') {
            if (this.hitosEliminados.length || hitosEditados) {
              await this.modificacionesHitos(
                hitosEditados,
                this.hitosEliminados,
                indicesHitos
              );
            }
            await this.descartarTemporalProgramacion();
            if (arrayEliminar.length) {
              await this.limpiarIndicesElimina();
            }
            await this.iniciarProyecto();
            this.mostrar_carga_todo = false;
            this.toaster.success('Se guardó correctamente', 'Éxito', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            });
          } else if (response.id == '2') {
            this.actualizarTemp()
            this.mostrar_carga_todo = false;
            this.toaster.error(
              'Estan guardandose cambios en el proyecto. Intentar mas tarde.',
              'Adevertencia',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 7000,
              }
            );
          } else {
            this.actualizarTemp()
            this.mostrar_carga_todo = false;
            SwalService.error('Advertencia', response ? response.mensaje : 'Hubo un problema al realizar el proceso.');
          }
        } else {
          this.mostrar_carga_todo = false;
        }
      } else {
        this.mostrar_carga_todo = false;
        this.toaster.info('Ningun cambio que guardar', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error();
    }
  }

  async guardar2(partidas, temporal = false) {
    const tabla1 = JSON.stringify(partidas);
    const body = JSON.stringify({
      id_usuario: this.id_usuario,
      datos1: tabla1,
      id_proyecto: this.idProyecto,
    });
    const response = await this.principalService.guardarDatosProgramacion(body);
    if (response.id == '1') {
      if (this.hitosEliminados.length) {
        await this.modificacionesHitos([], this.hitosEliminados, []);
      }
      await this.limpiarIndicesElimina();
      await this.listarProgramacion(true);
    } else if (response.id == '2') {
      if (temporal) {
        // await this.guardarTemporalProgramacion('inicio');
        await this.guardarTemporal(
          this.dataPrincipal,
          this.prograNoActua,
          this.hitosEliminados
        );
      }
    } else {
      if (temporal) {
        // await this.guardarTemporalProgramacion('inicio');
        await this.guardarTemporal(
          this.dataPrincipal,
          this.prograNoActua,
          this.hitosEliminados
        );
      }
      SwalService.error();
    }
  }

  async listarIndicesElimPresupuesto() {
    try {
      let array = [];
      let arrayUids = [];
      const obj = {
        id_proyecto: this.idProyecto,
      };
      const response = await this.principalService.listarIndiceEliminados(obj);
      if (response.indelipres1) {
        let spliteado = response.indelipres1.split(',');
        array = spliteado.map(Number);

        for (const indice of array) {
          const encontrado = this.dataPrincipal.find(
            (ele) => Number(ele.indice) == indice
          );
          if (encontrado) {
            arrayUids.push(encontrado.uid);
          }
        }
      }
      return arrayUids;
    } catch (e) {
      SwalService.error(e);
      console.log(e);
    }
  }

  async limpiarIndicesElimina() {
    try {
      const obj = {
        id_proyecto: this.idProyecto,
        opcion: 0,
      };
      const response = await this.principalService.limpiarIndicesElimina(obj);
      if (response.id !== '1') {
        SwalService.error(response);
      }
    } catch (e) {
      SwalService.error(e);
    }
  }

  async limpiarVariablesCambio() {
    this.dataPrincipal = await this.dataPrincipal.map((ele) => {
      ele.filaEditada = false;
      return ele;
    });
    this.prograNoActua = false;
    this.indiceSeleccionado = null;
    this.noEnlazar = false;
    this.displayBasic = false;
    this.displayBasic2 = false;
    this.displayBasic3 = false;
    this.acumuladorClicks = 0;
    this.partidaSeleccionada = null;
    this.filaSel = null;
    this.hitosEliminados = [];
  }

  async modificacionesHitos(nuevos, eliminados, indices) {
    let hitosNuevos = [];
    let hitosModificados = [];
    let hitosEliminados = eliminados;

    if (nuevos.length) {
      for (const iterator of nuevos) {
        const obj = {
          id_proyecto: this.idProyecto,
          descripcion: iterator.descripcion.trim().toUpperCase(),
          fechaini: iterator.fechaini,
          fechafin: iterator.fechafin,
          id_usuario: this.id_usuario,
          referencias: iterator.referencia,
          referenciados: iterator.referenciados,
          indice_refer: iterator.indice_ref_hito,
          uid: iterator.uid,
          version: this.version
        };
        if (obj.uid !== null) {
          hitosModificados.push(obj);
        } else {
          hitosNuevos.push(obj);
        }
      }
    }

    const tabla1 = JSON.stringify(hitosNuevos);
    const tabla2 = JSON.stringify(hitosModificados);
    const tabla3 = JSON.stringify(hitosEliminados);
    const body = JSON.stringify({
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
      version: this.version,
      datos1: tabla1,
      datos2: tabla2,
      datos3: tabla3,
    });
    const response = await this.principalService.CambiosProyHitos(body);
    if (response.id == '1') {
      if (response.observacion) {
        const uidCreados = JSON.parse(response.observacion);
        if (uidCreados.length) {
          for (let i = 0; i < indices.length; i++) {
            this.dataPrincipal[indices[i]].uid = Number(uidCreados[i]);
          }
        }
      }
    }
  }

  async descartarCambios() {
    try {
      if (this.bloqtemp) {
        //temporales
        this.toaster.error(
          'Espere a que termine de guardar sus cambios en la nube. Tiene que desaparecer el icono de nube azul.',
          'Información',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      } //temporales

      // const temporal = await this.listarTemporalProgramacion();
      if (this.existetemp) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          'Se descartará todos los ultimos cambios realizados'
        );
        if (sw.isConfirmed) {
          if (this.bloqtemp) {
            //temporales
            this.toaster.error(
              'Espere a que termine de guardar sus cambios en la nube. Tiene que desaparecer el icono de nube azul.',
              'Información',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              }
            );
            return;
          } //temporale
          this.mostrar_carga_todo = true;
          this.stop(); //temporales
          await this.descartarTemporalProgramacion();
          this.uidsOrdenados = [];
          this.prograNoActua = false;
          this.tablaIdGantt = [];
          await this.iniciarProyecto();
          this.mostrar_carga_todo = false;
          this.toaster.success('Se descartó correctamente', 'Éxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
        } else {
          this.mostrar_carga_todo = false;
        }
      } else {
        this.mostrar_carga_todo = false;
        this.toaster.info('Ningun cambio para descartar', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
      }
    } catch (error) { }
  }

  async reiniciarProgramacion() {
    try {
      if (this.bloqtemp) {
        //temporales
        this.toaster.error(
          'Espere a que termine de guardar sus cambios en la nube. Tiene que desaparecer el icono de nube azul.',
          'Información',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      } //temporales
      this.mostrar_carga_todo = true;
      await this.descartarTemporalProgramacion();
      const inputProyecto = {
        id_proyecto: this.idProyecto,
        id_usuario: this.id_usuario,
      };
      const response = await this.principalService.restaurarPrograma(
        inputProyecto
      );
      await this.listarProgramacion();
      if (this.view_mode) {
        await this.generarGrafico();
      }
      this.mostrar_carga_todo = false;
      this.toaster.success('Se restauró correctamente', 'Éxito', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    } catch (error) {
      console.log(error);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  async quitarReferenciasProyecto2() {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se eliminará todas los predecesores de la programacion del proyecto'
    );
    if (sw.isConfirmed) {
      this.mostrar_carga_todo = true;
      for (const row of this.dataPrincipal) {
        if (row.condini) {
          await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid);
        }
        if (row.condfin) {
          await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid);
        }
        this.uidsOrdenados[row.uid].referencia = '';
        this.uidsOrdenados[row.uid].referenciados = '';
        this.uidsOrdenados[row.uid].condini = '';
        this.uidsOrdenados[row.uid].condfin = '';
        this.uidsOrdenados[row.uid].filaEditada = true;
      }
      // await this.guardarTemporalProgramacion('quitarReferenciasProyecto');
      await this.guardarTemporal(
        this.dataPrincipal,
        this.prograNoActua,
        this.hitosEliminados
      );
    }
    this.mostrar_carga_todo = false;
  }

  async quitarReferenciasProyecto() {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se eliminará todas los predecesores de la fila seleccionada'
    );
    if (sw.isConfirmed) {
      let row = this.rowSeleccionado;
      if (row.condini) {
        await this.eliminarDelPadre(JSON.parse(row.condini)[0], row.uid);
      }
      if (row.condfin) {
        await this.eliminarDelPadre(JSON.parse(row.condfin)[0], row.uid);
      }
      this.uidsOrdenados[row.uid].referencia = '';
      this.uidsOrdenados[row.uid].referenciados = '';
      this.uidsOrdenados[row.uid].condini = '';
      this.uidsOrdenados[row.uid].condfin = '';
      this.uidsOrdenados[row.uid].filaEditada = true;
      if (!this.desacGrafico.includes(row.ind)) {
        this.desacGrafico.push(row.ind);
      }
      // this.guardarTemporalProgramacion('quitarReferenciasProyecto');
      this.actualizarTemp();
      this.quitarRutaCritica();
      this.updateRowGraph();
    }
  }

  async exportarExcel() {
    const temporal = await this.listarTemporalProgramacion();
    if (temporal || this.prograNoActua) {
      this.toaster.error(
        'Guarde o descarte los cambios realizados para poder exportar programacion',
        'Error',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
      return;
    } else {
      this.mostrar_carga_todo = true;
      const tablaImport = [];
      for (const iterator of this.dataPrincipal) {
        const obj = {
          idgantt: iterator.idgantt,
          item: iterator.item,
          descripcion: iterator.descripcion,
          duracion: iterator.duracion,
          fecha_inicio: iterator.fechaini,
          fecha_fin: iterator.fechafin,
          predecesor: iterator.referencia,
        };
        tablaImport.push(obj);
      }
      await this.crearExcel(
        tablaImport,
        'PROGRAMACION ' + this.dataProyecto.descripcion
      );
      this.mostrar_carga_todo = false;
    }
  }

  async crearExcel(json: any, excelFileName: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcel(excelBuffer, excelFileName);
  }

  private saveAsExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = fileName + EXCEL_EXT;
    link.click();
  }

  async mostrar(event) {
    const ind = event.target.getAttribute('bar_id');
    if (ind !== null) {
      this.filaSel = ind;
    }
  }

  async verDetallePartida() {
    this.verDetalle = !this.verDetalle;
    if (this.verDetalle) {
      if (this.verMontos) {
        this.verMontos = false;
      }
      this.recuperarDetallePartida(this.rowSeleccionado);
    } else {
    }
    this.anchoGant();
  }

  async recuperarDataHeader(event) {
    this.dataHeader = event ? event : [];
    await this.evaluarOcultarColum(this.ocultarFueraRango);
    this.mostrar_carga_todo = false;
  }

  async evaluarOcultarColum(checked) {
    this.mesesMostrar = [];
    const inicio = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
    const final = moment(this.dataProyecto.fecha_culmina).format('YYYY-MM-DD');
    let array = [];
    this.ocultarFueraRango = checked;
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
    this.colspanAnios = array2;
  }

  async ocultarvistaInferior() {
    if (this.verDetalle || this.verMontos) {
      this.verDetalle = false;
      this.tablaDesembolso = [];
      this.verMontos = false;
      this.tablaDesemDesactua = true;
      this.tablaMatDesac = true;
      this.tablaGrafDesac = true;
      this.onResize();
    }
  }

  async verMontosPartida() {
    this.verMontos = !this.verMontos;
    if (this.verDetalle) {
      this.verDetalle = false;
    }
    this.anchoGant();
    if (!this.tablaDesembolso.length) {
      await this.generarTablaDesembolso();
      this.total = 0;
      let acumMontos = [];
      this.totalesDesembolso.map((ele) => {
        this.total = this.total + ele;
        acumMontos.push(this.total);
      });
      this.porcentajes = [];
      this.totalPorc = 0;
      let acumPorcentajes = [];
      this.totalesDesembolso.map((ele) => {
        const porcent = (ele * 100) / this.total;
        this.porcentajes.push(porcent);
        this.totalPorc = this.totalPorc + porcent;
        acumPorcentajes.push(this.totalPorc);
      });
    }
  }

  async anchoGant() {
    this.height = window.innerHeight - 162;
    const widhtcontainer = document.getElementById('calendario')?.clientWidth;
    let totales = 0;
    this.dataHeader.map((ele) => (totales = ele.width + totales));
    this.widthTotales = widhtcontainer < totales ? widhtcontainer : totales;

    if (this.verMontos && this.verDetalle) {
      this.height = this.height - 172;
    } else if (this.verMontos && !this.verDetalle) {
      this.height = this.height - 44;
    } else if (!this.verMontos && this.verDetalle) {
      this.height = this.height - 150;
    } else {
    }
    this.hTablasDinamico();
  }

  async modalPartidasXInsumCatMat(row) {
    this.partsInsumos = row;
    this.totInsumDEtalles = [];
    let array = [];
    for (let i = 0; i < this.dataHeader.length; i++) {
      array.push(0);
    }
    for (const iterator of row.partidas) {
      let k = 0;
      for (const mes of iterator.meses) {
        array[k] = array[k] + mes;
        k++;
      }
    }
    this.totInsumDEtalles = array;
    const suma = this.totInsumDEtalles.reduce((a, b) => a + b, 0);
    this.modalPartInsum.show();
  }

  cerrarModal() {
    this.partsInsumos = null;
    this.filaModal = null;
    this.modalPartInsum.hide();
  }

  async listarInsumosXProyecto() {
    this.listaInsumos = [];
    const obj = {
      id_proyecto: this.idProyecto,
    };
    const response = await this.principalService.relacionInsumosProy(obj);
    this.listaInsumos = response.length ? response : [];
  }

  redondeo(num) {
    return this.formsService.redondeo(num, this.dec_parcial);
  }

  async exportarXML() {
    let nombreArchivo = 'Programación - ';

    if (this.dataProyecto.descripcion?.length > 20) {
      nombreArchivo =
        nombreArchivo + this.dataProyecto.descripcion.substring(0, 20);
    } else {
      nombreArchivo = nombreArchivo + this.dataProyecto.descripcion;
    }
    const dataxml = await this.dataXml();
    const data = await this.generarXml(dataxml);
    this.descargarArchivo(data, nombreArchivo);
  }

  async dataXml() {
    const noLaborables = this.aspectosdias[0]?.nolabo1
      ? this.aspectosdias[0]?.nolabo1.split('|')
      : []; //  revisar
    const diassemana = [
      'LUNES',
      'MARTES',
      'MIÉRCOLES',
      'JUEVES',
      'VIERNES',
      'SÁBADO',
      'DOMINGO',
    ];
    let cantidadNoLab = 0;
    noLaborables.map((ele) => {
      if (diassemana.includes(ele.toUpperCase())) {
        cantidadNoLab++;
      }
    });
    const minutesperDay = 480;
    const minutesperWeek = minutesperDay * (7 - cantidadNoLab);
    const tablas = await this.formatXmlTask();
    const start = await this.formatXMLdate(this.fechaIniGrafico, true);
    const finish = await this.formatXMLdate(this.fechaFinalGrafico, false);
    const obj = {
      currentDate: moment(this.hoy).format('YYYY-MM-DD[T]HH:mm:ss'),
      startTime: '08:00:00',
      finishTime: '18:00:00',
      minutsperDay: minutesperDay,
      minutsperWeek: minutesperWeek,
      starDate: start,
      finishDate: finish,
      dayspermonth: 30,
      tasks: tablas.tasks,
      assignments: tablas.assigns,
    };
    return obj;
  }

  async minutosEntre2Fech(horainicio, horafin) {
    const fecha = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
    const a = fecha + ' ' + horainicio;
    const b = fecha + ' ' + horafin;
    let fechaa = moment(a);
    let fechab = moment(b);
    const resta = fechab.diff(fechaa, 'minutes');
    return resta;
  }

  async formatXMLdate(date, inicio = true) {
    const fecha =
      moment(date).format('YYYY-MM-DD') + (inicio ? 'T08:00:00' : 'T18:00:00');
    return fecha;
  }

  async formatXmlTask() {
    let tabla = [];
    let asignaciones = [];
    let ind = 0;
    const tipos = ['FF', 'FC', 'CF', 'CC'];
    for (const iterator of this.dataPrincipal) {
      const duracionPT = 'PT' + iterator.duracion * (480 / 60) + 'H0M0S';
      const nivel = iterator.item ? iterator.item.split('.').length : 1;
      let predecesorLinks = [];
      if (iterator.referenciados) {
        const array = JSON.parse(iterator.referenciados);
        for (const predecesor of array) {
          const numero = predecesor[2] ? parseInt(predecesor[2]) : 0;
          const tipoadd = predecesor[2]
            ? predecesor[2].slice(numero.toString().length)
            : '';
          const tipo = !predecesor[1] ? 1 : tipos.indexOf(predecesor[1]);
          const lag = numero ? (tipoadd && tipoadd == '%' ? 19 : 7) : 7;
          const signo = predecesor[2]
            ? predecesor[3]
              ? predecesor[3]
              : '+'
            : '';
          const prede = {
            PredecessorUID: predecesor[0],
            Type: tipo,
            CrossProject: 0,
            LinkLag:
              lag == 7
                ? parseFloat(signo + numero * 4800)
                : parseFloat(signo + numero),
            LagFormat: lag,
          };
          predecesorLinks.push(prede);
        }
      }
      const start = await this.formatXMLdate(iterator.fechaini, true);
      const finish = await this.formatXMLdate(iterator.fechafin, false);
      const obj = {
        UID: iterator.uid,
        ID: !iterator.indice_ref_hito ? iterator.idgantt : '',
        Name: iterator.descripcion,
        Active: 1,
        Manual: 0,
        Type: 0,
        IsNull: 0,
        CreateDate: moment(this.hoy).format('YYYY-MM-DD[T]HH:mm:ss'),
        WBS: !iterator.indice_ref_hito ? iterator.item : '',
        OutlineNumber: iterator.item,
        OutlineLevel: nivel,
        Priority: 500,
        Start: start,
        Finish: finish,
        Duration: duracionPT,
        ManualStart: start,
        ManualFinish: finish,
        ManualDuration: duracionPT,
        DurationFormat: 7,
        Work: 'PT0H0M0S',
        ResumeValid: 0,
        EffortDriven: 0,
        Recurring: 0,
        OverAllocated: 0,
        Estimated: 0,
        Milestone: iterator.duracion ? 0 : 1,
        Summary: iterator.unidad ? 0 : 1,
        DisplayAsSummary: 0,
        Critical: 1,
        IsSubproject: 0,
        IsSubprojectReadOnly: 0,
        ExternalTask: 0,
        EarlyStart: start,
        EarlyFinish: finish,
        LateStart: start,
        LateFinish: finish,
        StartVariance: 0,
        FinishVariance: 0,
        WorkVariance: '0.00',
        FreeSlack: 0,
        TotalSlack: 0,
        StartSlack: 0,
        FinishSlack: 0,
        FixedCost: 0,
        FixedCostAccrual: 3,
        PercentComplete: 0,
        PercentWorkComplete: 0,
        Cost: 0,
        OvertimeCost: 0,
        OvertimeWork: 'PT0H0M0S',
        ActualDuration: 'PT0H0M0S',
        ActualCost: 0,
        ActualOvertimeCost: 0,
        ActualWork: 'PT0H0M0S',
        ActualOvertimeWork: 'PT0H0M0S',
        RegularWork: 'PT0H0M0S',
        RemainingDuration: duracionPT,
        RemainingCost: 0,
        RemainingWork: 'PT0H0M0S',
        RemainingOvertimeCost: 0,
        RemainingOvertimeWork: 'PT0H0M0S',
        ACWP: '0.00',
        CV: '0.00',
        ConstraintType: !iterator.indice_ref_hito ? 0 : 4,
        ConstraintDate: !iterator.indice_ref_hito ? '' : start,
        CalendarUID: -1,
        LevelAssignments: 1,
        LevelingCanSplit: 1,
        LevelingDelay: 0,
        LevelingDelayFormat: 8,
        IgnoreResourceCalendar: 0,
        HideBar: 0,
        Rollup: 0,
        BCWS: '0.00',
        BCWP: '0.00',
        PhysicalPercentComplete: 0,
        EarnedValueMethod: 0,
        PredecessorLink: predecesorLinks,
        IsPublished: iterator.unidad || iterator.indice_ref_hito ? 1 : 0,
        CommitmentType: 0,
      };
      tabla.push(obj);
      if (iterator.unidad || iterator.indice_ref_hito) {
        const timesphases = await this.structuraDias(
          iterator.fechaini,
          iterator.fechafin,
          iterator.uid
        );
        const asiggn = {
          UID: iterator.uid,
          TaskUID: iterator.idgantt,
          ResourceUID: -65535,
          PercentWorkComplete: 0,
          ActualCost: 0,
          ActualOvertimeCost: 0,
          ActualOvertimeWork: 'PT0H0M0S',
          ActualWork: 'PT0H0M0S',
          ACWP: '0.00',
          Confirmed: 0,
          Cost: 0,
          CostRateTable: 0,
          RateScale: 0,
          CostVariance: 0,
          CV: '0.00',
          Delay: 0,
          Finish: finish,
          FinishVariance: 0,
          WorkVariance: '0.00',
          HasFixedRateUnits: 1,
          FixedMaterial: 0,
          LevelingDelay: 0,
          LevelingDelayFormat: 7,
          LinkedFields: 0,
          Milestone: 0,
          Overallocated: 0,
          OvertimeCost: 0,
          OvertimeWork: duracionPT,
          RegularWork: 'PT0H0M0S',
          RemainingCost: 0,
          RemainingOvertimeCost: 0,
          RemainingOvertimeWork: 'PT0H0M0S',
          RemainingWork: duracionPT,
          ResponsePending: 0,
          Start: start,
          StartVariance: 0,
          Units: 1,
          UpdateNeeded: 0,
          VAC: '0.00',
          Work: duracionPT,
          WorkContour: 0,
          BCWS: '0.00',
          BCWP: '0.00',
          BookingType: 0,
          CreationDate: moment(this.hoy).format('YYYY-MM-DD[T]HH:mm:ss'),
          BudgetCost: 0,
          BudgetWork: 'PT0H0M0S',
          TimephasedData: timesphases,
        };
        asignaciones.push(asiggn);
      }
      ind++;
    }
    return { tasks: tabla, assigns: asignaciones };
  }

  async structuraDias(start, finish, uid) {
    let a = moment(start);
    const b = moment(finish);
    let dias = [];
    let considerar = true;
    while (moment(a).format('YYYY-MM-DD') <= moment(b).format('YYYY-MM-DD')) {
      if (dias.length && considerar) {
        dias[dias.length - 1].Finish =
          moment(a).format('YYYY-MM-DD') + 'T08:00:00';
      }
      const dia = moment(a).format('YYYY-MM-DD');
      const nombreDia = moment.weekdays(moment(a).day());
      const existe = await this.tablaferiados.find(
        (ele) => moment(ele.fecha).format('YYYY-MM-DD') == dia
      );
      const diaSig = moment(a).add(1, 'days').format('YYYY-MM-DD');
      if (
        !existe &&
        !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
      ) {
        const obj = {
          Type: 1,
          UID: uid,
          Start: moment(a).format('YYYY-MM-DD') + 'T08:00:00',
          Finish:
            JSON.parse(
              JSON.stringify(moment(a).add(1, 'days').format('YYYY-MM-DD'))
            ) + 'T18:00:00',
          Unit: 2,
          Value: 'PT8H0M0S',
        };
        dias.push(obj);
        considerar = true;
      } else {
        considerar = false;
      }
      a = moment(diaSig);
    }
    dias[dias.length - 1].Finish =
      moment(dias[dias.length - 1].Start).format('YYYY-MM-DD') + 'T18:00:00';
    return dias;
  }

  async formatCalendario() {
    const calendario = [
      {
        UID: 1,
        Name: 'calendario importado',
        IsBaseCalendar: 1,
        WeekDays: {
          WeekDay: [],
        },
        Exceptions: {
          Exception: [],
        },
      },
    ];
    const data = await this.estrucCalend(calendario);
    calendario[0].WeekDays.WeekDay = data.calendario;
    if (data.exceptions) {
      calendario[0].Exceptions.Exception = data.exceptions;
    }
    return calendario;
  }

  async estrucCalend(calendario) {
    const diassemana = [
      'DOMINGO',
      'LUNES',
      'MARTES',
      'MIÉRCOLES',
      'JUEVES',
      'VIERNES',
      'SÁBADO',
    ];
    const feriados = this.tablaferiados;
    const noLaborables = this.arrayDiasNoLabEdit;
    let calendarioSemana = [];
    for (let i = 0; i < diassemana.length; i++) {
      let obj;
      if (noLaborables.includes(diassemana[i])) {
        obj = {
          DayType: i + 1,
          DayWorking: 0,
        };
      } else {
        obj = {
          DayType: i + 1,
          DayWorking: 1,
          WorkingTimes: {
            WorkingTime: [
              {
                FromTime: '08:00:00',
                ToTime: '12:00:00',
              },
              {
                FromTime: '14:00:00',
                ToTime: '18:00:00',
              },
            ],
          },
        };
      }
      calendarioSemana.push(obj);
    }
    let exceptions = [];
    for (const iterator of feriados) {
      const obj = {
        DayType: 0,
        DayWorking: 0,
        TimePeriod: {
          FromDate: iterator.fecha + 'T00:00:00',
          ToDate: iterator.fecha + 'T23:59:00',
        },
      };
      calendarioSemana.push(obj);
      const obj2 = {
        EnteredByOccurrences: 0,
        TimePeriod: {
          FromDate: iterator.fecha + 'T00:00:00',
          ToDate: iterator.fecha + 'T23:59:00',
        },
        Occurrences: 1,
        Name: iterator.descripcion,
        Type: 1,
        DayWorking: 0,
      };
      exceptions.push(obj2);
    }
    return { calendario: calendarioSemana, exceptions: exceptions };
  }

  async generarXml(dataxml) {
    const calendario = await this.formatCalendario();
    const obj = {
      '@': {
        xmlns: 'http://schemas.microsoft.com/project',
      },
      ActualsInSync: 0,
      AdminProject: 0,
      Assignments: {
        Assignment: {
          Assignment: dataxml.assignments,
        },
      },
      AutoAddNewResourcesAndTasks: 1,
      Autolink: 0,
      BaselineForEarnedValue: 0,
      Calendars: {
        Calendar: calendario,
      },
      CalendarUID: 1,
      CreationDate: dataxml.currentDate,
      CriticalSlackLimit: 0,
      CurrencyCode: 'PEN',
      CurrencyDigits: 2,
      CurrencySymbol: 'S/',
      CurrencySymbolPosition: 2,
      CurrentDate: dataxml.currentDate,
      DaysPerMonth: 20,
      DefaultFinishTime: dataxml.finishTime,
      DefaultFixedCostAccrual: 3,
      DefaultOvertimeRate: 0,
      DefaultStandardRate: 0,
      DefaultStartTime: dataxml.startTime,
      DefaultTaskEVMethod: 0,
      DefaultTaskType: 0,
      DurationFormat: 7,
      EditableActualCosts: 0,
      ExtendedAttributes: null,
      ExtendedCreationDate: '1984-01-01T00:00:00',
      FinishDate: dataxml.finishDate,
      FiscalYearStart: 0,
      FYStartDate: 1,
      HonorConstraints: 0,
      InsertedProjectsLikeSummary: 1,
      KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled: 0,
      LastSaved: dataxml.currentDate,
      MicrosoftProjectServerURL: 1,
      MinutesPerDay: dataxml.minutsperDay,
      MinutesPerWeek: dataxml.minutsperWeek,
      MoveCompletedEndsBack: 0,
      MoveCompletedEndsForward: 0,
      MoveRemainingStartsBack: 0,
      MoveRemainingStartsForward: 0,
      MultipleCriticalPaths: 0,
      Name: this.dataProyecto.id_proyecto + 'programacion',
      NewTasksAreManual: 1,
      NewTasksEffortDriven: 0,
      NewTasksEstimated: 1,
      NewTaskStartDate: 0,
      OutlineCodes: '',
      ProjectExternallyEdited: 0,
      RemoveFileProperties: 0,
      Resources: {
        Resource: {
          UID: 0,
          ID: 0,
          Type: 1,
          isNull: 0,
          Initials: 'U',
          Group: '',
          EmailAddress: '',
          MaxUnits: 1,
          PeakUnits: 1,
          OverAllocated: 0,
          Start:
            moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD') +
            'T08:00:00',
          Finish:
            moment(this.dataProyecto.fecha_culmina).format('YYYY-MM-DD') +
            'T18:00:00',
          CanLevel: 0,
          AccrueAt: 3,
          StandardRateFormat: 3,
          OvertimeRateFormat: 3,
          IsGeneric: 0,
          IsInactive: 0,
          IsEnterprise: 0,
          IsBudget: 0,
          AvailabilityPeriods: null,
        },
      },
      SaveVersion: 14,
      ScheduleFromStart: 1,
      SplitsInProgressTasks: 1,
      SpreadActualCost: 0,
      SpreadPercentComplete: 0,
      StartDate: dataxml.starDate,
      Tasks: {
        Task: dataxml.tasks,
      },
      TaskUpdatesResource: 1,
      Title: this.dataProyecto.descripcion,
      UpdateManuallyScheduledTasksWhenEditingLinks: 0,
      WBSMasks: '',
      WeekStartDay: 1,
      WorkFormat: 2,
    };
    return js2xmlparser.parse('Project', obj, {
      declaration: { encoding: 'UTF-8', standalone: 'yes' },
    });
  }

  async descargarArchivo(contenidoEnBlob, nombreArchivo) {
    var filename = 'file.xml';
    var pom = document.createElement('a');
    var bb = new Blob([contenidoEnBlob], { type: 'text/plain' });
    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);
    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true;
    pom.download = nombreArchivo + '.xml';
    pom.classList.add('dragout');
    pom.click();
  }

  async generarDataReporte() {
    this.mostrar_carga_todo = true;
    const itemsAux = await this.formsService.AddItemsAuxiliares(this.dataPrincipal, this.dataProyecto)
    if (itemsAux !== null && itemsAux.length) {
      this.itemAuxActivo = true
      this.arrItemsAux = itemsAux
    } else {
      this.itemAuxActivo = false
      this.arrItemsAux = []
    }
    if (!this.rutaCriticaActualizada) {
      const sw = await SwalService.multiple2(
        'Ruta critica no actualizada',
        'Desea agregar la ruta critica al reporte?',
        'AGREGAR',
        'OMITIR'
      );
      if (sw.isConfirmed) {
        await this.actualizarRutaCritica(true, false);
      }
    }
    this.wDescripcion = 550;
    this.wReferencia = 161;
    setTimeout(async () => {
      // const existe = await this.dataPrincipal.find((ele) => ele.filaEditada);
      if (!this.existetemp) {
        const arrayHeader = [];
        const keys_body = [];
        const col_alig = [];

        let tablaCompleta = [];
        let tipoRep = 0;
        let orientacion = 'landscape';
        let image = null;
        let image2 = null;
        let objTamanios = {};
        const MAX_WIDTH = 15500; // Máximo permitido para el ancho de la imagen
        const MAX_HEIGHT = 32000; // Máximo permitido para la altura de la imagen

        const tamanio = this.dataPrincipal.length * 22 + 50;

        // let bodyTablaProgra = document.getElementById('bodyTablaProgra');
        let bodyTabla = document.getElementById('bodyTabla');
        let tablaProgramacion = document.getElementById('tablaProgramacion');
        let calendario = document.getElementById('calendario');
        let ganttTabla = document.getElementById('ganttTabla');
        let tablaHtml = document.getElementById('tablaHtml');
        let ContenedorPrincipal = document.getElementById(
          'ContenedorPrincipal'
        );

        const hganttTabla = JSON.parse(JSON.stringify(ganttTabla.style.height));
        const wbodyTabla = JSON.parse(JSON.stringify(bodyTabla.style.width));
        const htablaProgramacion = JSON.parse(
          JSON.stringify(tablaProgramacion.style.height)
        );

        ganttTabla.style.height = bodyTabla.style.height;
        ganttTabla.style.position = 'static';
        var fecha1 = moment(this.fechaFinalGrafico);
        var fecha2 = moment(this.fechaIniGrafico);
        const diferencia2 = (fecha1.diff(fecha2, 'days') + 22) * 17;
        let tamanioCompleto = tablaHtml.clientWidth + diferencia2;
        const tamanio2 = tablaHtml.clientWidth + this.widthCalendario;

        // const listaDescripciones =
        //   bodyTablaProgra.getElementsByClassName('recortatextlinea');

        calendario.classList.remove('header-sticky-grafico');

        calendario.style.position = 'fixed';
        calendario.style.top = '160px !important';
        calendario.style.zIndex = '2';
        bodyTabla.style.width = tablaProgramacion.style.width;
        bodyTabla.classList.remove('pr-2');
        tablaProgramacion.style.height = null;
        let cortarproceso = false;
        const captureWidth =
          this.view_mode == 'Day' ? tamanioCompleto : tamanio2;
        const captureHeight = tamanio + 12;
        if (captureWidth > MAX_WIDTH || captureHeight > MAX_HEIGHT) {
          this.toaster.error(
            'No se puede generar el reporte ,la captura excede el tamaño permitido, se recomienda exportar a XML',
            'Error',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
          cortarproceso = true;
        } else {
          try {
            await html2canvas(ContenedorPrincipal, {
              allowTaint: true,
              useCORS: true,
              logging: false,
              height: tamanio + 12,
              windowHeight: tamanio + 12,
              width: this.view_mode == 'Day' ? tamanioCompleto : tamanio2,
              windowWidth: this.view_mode == 'Day' ? tamanioCompleto : tamanio2,
            }).then((canvas) => {
              objTamanios['graficoHtml'] = ContenedorPrincipal;
              objTamanios['canvas'] = canvas;
              objTamanios['h1imag'] = canvas.height;
              objTamanios['h2imag'] = parseFloat(canvas.style.height);
              objTamanios['w1imag'] = canvas.width;
              objTamanios['w2imag'] = parseFloat(canvas.style.width);
              objTamanios['wheader'] = tablaHtml.clientWidth;
              objTamanios['wcalendar'] = this.widthCalendario;
              objTamanios['wgantt'] = diferencia2;
              const imageData = canvas.toDataURL('image/png');
              image = imageData;

              // const croppedCanvas = document.createElement('canvas');
              // const ctx = croppedCanvas.getContext('2d');

              // croppedCanvas.width = canvas.width;
              // croppedCanvas.height = 50;
              // ctx.drawImage(
              //   canvas,
              //   0,
              //   0,
              //   canvas.width,
              //   50,
              //   0,
              //   0,
              //   canvas.width,
              //   50
              // );

              // image2 = croppedCanvas.toDataURL('image/png');
            });
          } catch (error) {
            console.error('Hubo un error al generar la imagen:', error);
            alert('Error al generar la imagen. Intenta nuevamente.');
          }
        }
        // this.mostrar_carga_todo = false
        // return
        this.wDescripcion = 300;
        this.wReferencia = 111;
        ganttTabla.style.removeProperty('height');
        ganttTabla.style.removeProperty('position');
        calendario.classList.add('header-sticky-grafico');
        calendario.style.removeProperty('position');
        ganttTabla.style.height = hganttTabla;
        bodyTabla.style.width = wbodyTabla;
        bodyTabla.classList.add('pr-2');
        tablaProgramacion.style.height = htablaProgramacion;
        calendario.style.removeProperty('top');
        calendario.style.removeProperty('zIndex');
        if (cortarproceso) {
          this.mostrar_carga_todo = false;
          return;
        }
        const datos = {
          datos_proyecto: this.dataProyecto,
          header: arrayHeader,
          keys_body: keys_body,
          col_alig: col_alig,
          tabla: tablaCompleta,
          concat_tabla2: false,
          tipo_reporte: tipoRep,
          orientacion: orientacion,
          moneda: this.simbolo, // condicionar
          titulo: 'PROGRAMACIÓN GANTT',
          image: image,
          // image2: image2,
          tamanios: objTamanios,
        };

        const modalRef = this.modalService.open(ReportesComponent, {
          size: 'lg modalgrande',
          backdrop: 'static',
          windowClass: 'pcoded',
          keyboard: false,
        });
        modalRef.componentInstance.datos = datos;
        const result = await modalRef.result;
        this.itemAuxActivo = false
        this.arrItemsAux = []
        this.mostrar_carga_todo = false;
      } else {
        this.wDescripcion = 300;
        this.itemAuxActivo = false
        this.arrItemsAux = []
        this.mostrar_carga_todo = false;
        this.toaster.error('Guarde o descarte los cambios realizados', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      }
    }, 100);
  }

  tablaHeader(event) {
    this.widthCalendario = 0;
    for (const iterator of event) {
      this.widthCalendario = iterator.width + this.widthCalendario;
    }
  }

  calculoRendCuadrMod(row) {
    const valor = this.formsService.redondeo(
      Number(row?.rendimiento) * Number(row?.cuadrilla),
      3
    );
    return valor;
  }

  async reporteCronogramaValorizado() {
    if (this.tablaDesemDesactua) {
      this.toaster.error('Tabla cronograma valorizado desactualizado', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return;
    }
    this.mostrar_carga_todo = true;
    let tablaReporte = [];
    let indice = 0;
    let keys_body = ['item', 'descripcion', 'unidad', 'costo_partida'];
    let keys_dec = [null, null, null, null, this.dec_parcial];
    for (const iterator of this.tablaDesembolso) {
      let tipol = '';
      let colorl = '';
      let fondol = '';
      let valor2 = iterator.item.toString().split('.');
      if (this.titulo1letra != undefined) {
        if (iterator.unidad != '') {
          colorl = this.titulo1letra[11];
        } else {
          let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
          colorl = this.titulo1letra[ind];
        }
      }
      if (this.titulo1color != undefined) {
        if (iterator.unidad != '') {
          fondol = this.titulo1color[11];
        } else {
          let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
          fondol = this.titulo1color[ind];
        }
      }
      if (this.titulo1 != undefined) {
        if (iterator.unidad != '') {
          tipol = this.titulo1[11];
        } else {
          let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
          tipol = this.titulo1[ind];
        }
      }

      let obj = {
        item: iterator.item,
        descripcion: iterator.descripcion,
        unidad: iterator.unidad,
        costo_partida: iterator.parcial,
        ind: indice,
        tipoletra: tipol,
        color: colorl == 'unset' ? '' : colorl,
        fondo: '',
      };
      let h = 0;
      for (let i = 0; i < iterator.meses.length; i++) {
        const mes = iterator.meses[i];
        if (this.mesesMostrar[i] !== 0) {
          obj['mes' + (h + 1)] = mes?.monto && mes?.dias > 0 ? mes?.monto : '';
          h++;
        }
      }
      tablaReporte.push(obj);
      indice++;
    }
    const tablaHeader = [];
    const h1 = [
      { text: 'ITEM', colSpan: 1, rowSpan: 2 },
      { text: 'DESCRIPCIÓN', colSpan: 1, rowSpan: 2 },
      { text: 'UNIDAD', colSpan: 1, rowSpan: 2 },
      { text: 'COSTO POR PARTIDA', colSpan: 1, rowSpan: 2 },
    ];
    let i = 0;
    for (const iterator of this.yearsHeader) {
      if (this.colspanAnios[i]) {
        const celda = {
          text: iterator.year,
          colSpan: this.colspanAnios[i],
          rowSpan: 1,
        };
        h1.push(celda);
      }
      i++;
    }
    tablaHeader.push(h1);
    let h2 = [];
    let j = 0;
    let col_alig = ['left', 'left', 'center', 'right'];
    let cantidadMeses = 0;
    for (const iterator of this.mesesHeader) {
      if (this.mesesMostrar[j] !== 0) {
        const celda = {
          text:
            'Mes ' +
            this.nroMeses[j] +
            '\n' +
            this.arrayMeses[iterator.mes - 1],
          colSpan: 1,
          rowSpan: 1,
        };
        h2.push(celda);
        col_alig.push('right');
        keys_body.push('mes' + this.nroMeses[j]);
        keys_dec.push(this.dec_parcial);
      }
      j++;
    }
    cantidadMeses = h2.length;
    tablaHeader.push(h2);
    let footer = [];
    let footer1 = [
      {
        text: ' ',
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
      {
        text: 'Monto Presupuesto',
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
      {
        text: ' ',
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
      {
        text: this.sumaTotalParciales,
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
    ];
    let k = 0;
    for (const iterator of this.redTotDesem) {
      if (this.mesesMostrar[k] !== 0) {
        const obj = {
          text: iterator,
          colSpan: 1,
          rowSpan: 1,
          tipoletra: '3',
          color: '',
          fondo: '',
          alinea: 'right',
        };
        footer1.push(obj);
      }
      k++;
    }
    footer.push(footer1);
    let footer2 = [
      {
        text: ' ',
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
      {
        text: ' ',
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
      {
        text: ' ',
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
      {
        text: this.formsService.redondeo(100, 2) + '%',
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
    ];
    let l = 0;
    for (const iterator of this.porcentajesDesembolso) {
      if (this.mesesMostrar[l] !== 0) {
        const obj = {
          text: iterator + ' %',
          colSpan: 1,
          rowSpan: 1,
          tipoletra: '3',
          color: '',
          fondo: '',
          alinea: 'center',
        };
        footer2.push(obj);
      }
      l++;
    }
    footer.push(footer2);
    //costos indirectos
    let tabindir = [];
    if (tabindir.length == 0) {
      tabindir = [];
      let res = await this.presuservice.ListarPresuIndirecto({
        id_usuario: this.id_usuario,
        id_proyecto: this.idProyecto,
        titulo: 0,
      });
      if (res.id == '1') {
        let tablapas = JSON.parse(res.tabla);
        tabindir = tablapas[0]
      }
    }
    const datos = {
      datos_proyecto: this.dataProyecto,
      header: tablaHeader,
      keys_body: keys_body,
      keys_dec: keys_dec,
      col_alig: col_alig,
      tabla: tablaReporte,
      tabla2: footer,
      concat_tabla2: true,
      tipo_reporte: 2,
      orientacion: cantidadMeses < 4 ? '' : 'landscape',
      moneda: this.simbolo, // condicionar
      titulo: 'CRONOGRAMA VALORIZADO',
      tabla3: tabindir,
    };
    const modalRef = this.modalService.open(ReportesComponent, {
      size: 'lg modalgrande',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false,
    });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
    this.mostrar_carga_todo = false;
  }

  async reporteCalendarioMateriales() {
    if (this.tablaMatDesac) {
      this.toaster.error('Tabla calendario mateirales desactualizado', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return;
    }
    let tabla = [];
    let tablaHeader = [];
    let col_alig = ['center', 'left', 'center', 'right', 'right', 'right'];
    let keys_body = [
      'ind',
      'descripcion',
      'unidad',
      'cantidad',
      'precio',
      'costo_partida',
    ];
    let keys_dec = [
      null,
      null,
      null,
      this.dec_cant,
      this.dec_precio,
      this.dec_parcial,
    ];
    let footer = [];
    let footer1 = [
      {
        text: 'Total parciales',
        colSpan: 5,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
      {
        text: this.formsService.redondeo(
          this.totalParcialesCalMat,
          this.dec_parcial
        ),
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'right',
      },
    ];
    let footer2 = [
      {
        text: '',
        colSpan: 5,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
      {
        text: this.formsService.redondeo(100, 2) + '%',
        colSpan: 1,
        rowSpan: 1,
        tipoletra: '3',
        color: '',
        fondo: '',
        alinea: 'center',
      },
    ];
    let h1 = [
      { text: 'N°', colSpan: 1, rowSpan: 3 },
      { text: 'DESCRIPCIÓN', colSpan: 1, rowSpan: 3 },
      { text: 'UNIDAD', colSpan: 1, rowSpan: 3 },
      { text: 'CANTIDAD', colSpan: 1, rowSpan: 3 },
      { text: 'PRECIO', colSpan: 1, rowSpan: 3 },
      { text: 'PARCIAL', colSpan: 1, rowSpan: 3 },
    ];
    let i = 0;
    for (const iterator of this.yearsHeader) {
      if (this.colspanAnios[i]) {
        const celda = {
          text: iterator.year,
          colSpan: this.colspanAnios[i] * 2,
          rowSpan: 1,
        };
        h1.push(celda);
      }
      i++;
    }
    let j = 0;
    let h2 = [];
    let h3 = [];
    let cantidadMeses = 0;
    for (const iterator of this.mesesHeader) {
      if (this.mesesMostrar[j] !== 0) {
        const celda = {
          text: this.arrayMeses[iterator.mes - 1]?.toUpperCase(),
          colSpan: 2,
          rowSpan: 1,
        };
        h2.push(celda);
        const celda2 = [
          {
            text: 'CANTIDAD',
            colSpan: 1,
            rowSpan: 1,
          },
          {
            text: 'MONTO',
            colSpan: 1,
            rowSpan: 1,
          },
        ];
        h3 = h3.concat(celda2);
        col_alig = col_alig.concat(['right', 'right']);
        keys_body = keys_body.concat([
          'cantidad' + cantidadMeses,
          'monto' + cantidadMeses,
        ]);
        keys_dec = keys_dec.concat([this.dec_cant, this.dec_parcial]);
        footer1 = footer1.concat({
          text: this.totColRedMat[j],
          colSpan: 1,
          rowSpan: 1,
          tipoletra: '3',
          color: '',
          fondo: '',
          alinea: 'right',
        });
        footer2 = footer2.concat({
          text: this.porcTotMat[j] + '%',
          colSpan: 1,
          rowSpan: 1,
          tipoletra: '3',
          color: '',
          fondo: '',
          alinea: 'center',
        });
        cantidadMeses++;
      }
      j++;
    }
    footer.push(footer1, footer2);

    tablaHeader.push(h1, h2, h3);
    for (const iterator of this.calendarioMateriales) {
      let tipol = '';
      let colorl = '';
      let fondol = '';

      let obj = {
        cantidad: iterator.ind2 == null ? '' : iterator.cantidad,
        precio: iterator.ind2 == null ? '' : iterator.precio,
        descripcion: iterator.descripcion,
        unidad: iterator.unidad,
        costo_partida:
          iterator.ind2 == null && iterator.descripcion !== 'total'
            ? ''
            : iterator.parcial,
        ind: iterator.ind2 == null ? '' : Number(iterator.ind2) + 1,
        tipoletra: iterator.ind2 == null ? '3' : '',
        color: '',
        fondo:
          iterator.ind2 == null
            ? iterator.descripcion == 'total'
              ? '#dddddd'
              : '#D8EFFD'
            : '',
        alinea:
          iterator.ind2 == null
            ? iterator.descripcion == 'total'
              ? ''
              : 'center'
            : '',
      };
      let l = 0;
      for (let i = 0; i < iterator.cantidades.length; i++) {
        const cantidad = iterator.unidad ? iterator.cantidades[i] : '';
        if (this.mesesMostrar[i] !== 0) {
          const cantidadVAlor = isNaN(Number(cantidad)) ? '0' : cantidad;
          obj['cantidad' + l] = Number(cantidadVAlor) == 0 ? '' : cantidadVAlor;
          l++;
        }
      }
      let m = 0;
      for (let i = 0; i < iterator.meses.length; i++) {
        const monto = iterator.unidad ? iterator.meses[i] : '';
        if (this.mesesMostrar[i] !== 0) {
          const montoValor = isNaN(Number(monto))
            ? this.formsService.redondeo(0, this.dec_parcial)
            : this.formsService.redondeo(monto, this.dec_parcial);
          obj['monto' + m] = Number(montoValor) == 0 ? '' : montoValor;
          m++;
        }
      }
      tabla.push(obj);
    }

    const datos = {
      datos_proyecto: this.dataProyecto,
      header: tablaHeader,
      keys_body: keys_body,
      keys_dec: keys_dec,
      col_alig: col_alig,
      tabla: tabla,
      tabla2: footer,
      concat_tabla2: true,
      tipo_reporte: 2,
      orientacion: cantidadMeses < 4 ? '' : 'landscape',
      moneda: this.simbolo, // condicionar
      titulo: 'CRONOGRAMA DE ADQUISICIONES',
    };
    const modalRef = this.modalService.open(ReportesComponent, {
      size: 'lg modalgrande',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false,
    });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
    this.mostrar_carga_todo = false;
  }

  async generarChart() {
    this.tipoGraf = 'line';

    this.opcionesGraf = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: (ctx) =>
            'Point Style: ' + ctx.chart.data.datasets[0].pointStyle,
        },
      },
    };
    let index = 0;
    let acumuladoMontos = 0;
    let acumuladoPorcentajes: number = 0;
    let tablaAvanceFisico = [
      {
        periodo: '',
        mesNombre: '',
        anio: '',
        mensualMonto: this.formsService.redondeo(0, this.dec_parcial),
        acumuladoMonto: this.formsService.redondeo(0, this.dec_parcial),
        mensualPorcentaje: this.formsService.redondeo(0, 2),
        acumuladoPorcentaje: this.formsService.redondeo(0, 2),
      },
    ];
    let ejeY = [0];
    let ejeX = [''];
    let ejeY2 = [0];

    let j = 0;
    let acumulado = null;
    for (const item of this.mesesHeader) {
      if (this.mesesMostrar[index] !== 0) {
        const nroMes = 'Mes ' + (j + 1);
        const nombreMes = this.arrayMeses[item.mes - 1];
        acumuladoMontos =
          Number(acumuladoMontos) + Number(this.redTotDesem[index]);
        acumuladoPorcentajes =
          Number(acumuladoPorcentajes) +
          Number(this.porcentajesDesembolso[index]);
        if (acumuladoPorcentajes > 100) {
          acumuladoPorcentajes = 100;
        } else {
          let existe = false;
          if (index < this.mesesHeader.length) {
            for (
              let i = index + 1;
              i < this.porcentajesDesembolso.length;
              i++
            ) {
              const element = this.porcentajesDesembolso[i];
              if (Number(element) > 0) {
                existe = true;
              }
            }
          }

          if (!existe && acumuladoPorcentajes < 100) {
            acumuladoPorcentajes = 100
          }
        }
        const obj = {
          periodo: nroMes,
          mesNombre: ' (' + nombreMes + ')',
          anio: moment(item.fin).format('YYYY'),
          mensualMonto: this.redTotDesem[index],
          acumuladoMonto: this.formsService.redondeo(
            acumuladoMontos,
            this.dec_parcial
          ),
          mensualPorcentaje: this.porcentajesDesembolso[index],
          acumuladoPorcentaje: this.formsService.redondeo(
            acumuladoPorcentajes,
            2
          ),
        };
        acumulado = obj.acumuladoPorcentaje;
        tablaAvanceFisico.push(obj);
        ejeX.push('Mes ' + (j + 1));
        ejeY.push(Number(this.formsService.redondeo(acumuladoPorcentajes, 2)));
        ejeY2.push(Number(obj.mensualMonto));
        j++;
      }
      index++;
    }
    if (this.mesesHeader.length) {
      tablaAvanceFisico.push({
        periodo: 'TOTAL CD',
        mesNombre: '',
        anio: '',
        mensualMonto: this.sumaTotalParciales,
        acumuladoMonto: this.sumaTotalParciales,
        mensualPorcentaje: acumulado,
        acumuladoPorcentaje: acumulado,
      });
    }
    this.tablaGrafico = tablaAvanceFisico;

    this.chart = new Chart('myChart', {
      type: 'line',
      data: {
        labels: ejeX,
        datasets: [
          {
            label: 'Columna G',
            data: ejeY,
            borderColor: 'rgba(255, 0, 0, 1)',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true, // Make the chart responsive
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Diagrama Curva S',
          fontSize: 15,
          fontColor: '#333',
        },
        scales: {
          xAxes: [
            {
              type: 'category',
              scaleLabel: {
                display: true,
                labelString: 'Meses',
                fontColor: '#911',
                fontSize: 12,
              },
            },
          ],
          yAxes: [
            {
              type: 'linear',
              scaleLabel: {
                display: true,
                labelString: 'Acumulado',
                fontColor: '#191',
                fontSize: 12,
              },
              ticks: {
                suggestedMin: 0,
                suggestedMax: 120,
                stepSize: 20,
                callback: function (value) {
                  return value + '%';
                },
              },
            },
          ],
        },
      },
    });

    this.chart2 = new Chart('myChart2', {
      type: 'bar',
      data: {
        labels: ejeX,
        datasets: [
          {
            label: 'Programado',
            data: ejeY2, // Y-axis data points
            backgroundColor: 'rgba(0,0,255, 0.2)', // Bar color
            borderColor: 'rgba(0,0,255, 1)', // Bar border color
            borderWidth: 1, // Width of the bar border
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Diagrama Gauss',
          fontSize: 15,
          fontColor: '#333',
        },
        datalabels: {
          display: true,
          anchor: 'center',
          align: 'center',
          color: '#000', // Text color
          font: {
            size: 12,
            weight: 'bold',
          },
          formatter: (value) => {
            return (
              'S/. ' +
              value.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            );
          },
        },
        scales: {
          xAxes: [
            {
              type: 'category',
              scaleLabel: {
                display: true,
                labelString: 'Meses',
                fontColor: '#911',
                fontSize: 12,
              },
            },
          ],
          yAxes: [
            {
              type: 'linear',
              scaleLabel: {
                display: true,
                labelString: 'Programado',
                fontColor: '#191',
                fontSize: 12,
              },
              ticks: {
                callback: function (value) {
                  return (
                    'S/. ' +
                    value.toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  );
                },
              },
            },
          ],
        },
      },
    });
    this.tablaGrafDesac = false;
  }

  async generarReporteGrafico() {
    this.mostrar_carga_todo = true;
    setTimeout(async () => {
      let header = [];
      const h1 = [
        { text: '', colSpan: 1, rowSpan: 3 },
        { text: 'PERIODO', colSpan: 2, rowSpan: 2 },
        { text: 'PROGRAMADO', colSpan: 4, rowSpan: 1 },
      ];
      header.push(h1);
      const h2 = [
        { text: 'COSTO EJECUCION PROGRAMADO', colSpan: 2, rowSpan: 1 },
        { text: '% EJECUCION PROGRAMADA', colSpan: 2, rowSpan: 1 },
      ];
      header.push(h2);
      const h3 = [
        { text: 'MES', colSpan: 1, rowSpan: 1 },
        { text: 'AÑO', colSpan: 1, rowSpan: 1 },
        { text: 'MENSUAL', colSpan: 1, rowSpan: 1 },
        { text: 'ACUMULADO', colSpan: 1, rowSpan: 1 },
        { text: 'MENSUAL', colSpan: 1, rowSpan: 1 },
        { text: 'ACUMULADO', colSpan: 1, rowSpan: 1 },
      ];
      header.push(h3);
      let keys_body = [
        'ind',
        'mes',
        'anio',
        'mensualMonto',
        'acumuladoMonto',
        'mensualPorcentaje',
        'acumuladoPorcentaje',
      ];
      let col_alig_mon = [
        'center',
        'left',
        'center',
        'right',
        'right',
        'right',
        'right',
      ];
      let keys_dec = [
        null,
        null,
        null,
        this.dec_parcial,
        this.dec_parcial,
        '2',
        '2',
      ];
      let tabla = [];
      let i = 0;
      for (const element of this.tablaGrafico) {
        const obj = {
          ind: null,
          mes: element.periodo + ' ' + element.mesNombre,
          anio: element.anio,
          mensualMonto: element.mensualMonto,
          acumuladoMonto: element.acumuladoMonto,
          mensualPorcentaje: element.mensualPorcentaje,
          acumuladoPorcentaje: element.acumuladoPorcentaje,
          tipoletra: '',
        };
        if ('TOTAL CD' !== element.periodo) {
          obj.ind = i;
          obj.tipoletra = '';
        } else {
          obj.tipoletra = '3';
        }
        tabla.push(obj);
        i++;
      }

      const image = this.chart.toBase64Image();
      const image2 = this.chart2.toBase64Image();
      this.mostrar_carga_todo = false;
      const datos = {
        datos_proyecto: this.dataProyecto,
        header: header,
        keys_body: keys_body,
        keys_dec: keys_dec,
        col_alig: col_alig_mon,
        tabla: tabla,
        concat_tabla2: false,
        tipo_reporte: 5,
        orientacion: '',
        moneda: this.simbolo, // condicionar
        titulo: 'GRAFICOS DIAGRAMA CURVA S Y DIAGRAMA GAUSS',
        img_curva: image,
        img_gauss: image2,
      };
      const modalRef = this.modalService.open(ReportesComponent, {
        size: 'lg modalgrande',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.datos = datos;
    }, 50);
  }

  start() {
    //temporales
    try {
      if (!this.running) {
        this.running = true;
        this.startTimer = setInterval(async () => {
          this.tiempo++;
          if (this.tiempo == 5) {
            //temporales
            // this.GuardTemp(this.id_proyecto,this.id_user,this.ultindice,this.datasourcePri,this.datasourcePriacu,this.datasourcePrisub,this.inserta,this.modifica,this.elimina,this.insertaacu,this.modificaacu,this.eliminaacu);
            this.guardarTemporal(
              this.dataPrincipal,
              this.prograNoActua,
              this.hitosEliminados
            );
          }
        }, 1000);
      } else {
        this.stop();
      }
    } catch (ex) {
      console.log(ex);
    }
  } //temporales

  compressTextAsync(text: string): Promise<string> {
    //temporales
    return new Promise((resolve, reject) => {
      if (this.worker) {
        this.worker.postMessage({ action: 'compress', text });
        this.worker.onmessage = (e) => {
          const { action, result } = e.data;
          if (action === 'compressed') {
            resolve(result);
          }
        };
        this.worker.onerror = (error) => {
          reject(error);
        };
      } else {
        reject('El Web Worker no está disponible.');
      }
    });
  } //temporales

  stop() {
    //temporales
    clearInterval(this.startTimer);
    this.running = false;
    this.tiempo = 0;
  }
  restart() {
    //temporales
    clearInterval(this.startTimer);
    this.running = false;
    this.tiempo = 0;
    this.start();
  }
  start2() {
    //temporales
    try {
      this.timer2 = setInterval(async () => {
        if (!this.bloqtemp) {
          this.start();
          this.stop2();
        }
      }, 1000);
    } catch (ex) {
      console.log(ex);
    }
  }
  stop2() {
    //temporales
    this.initim2 = false;
    clearInterval(this.timer2);
  }
  actualizarTemp() {
    if (this.bloqtemp && !this.initim2) {
      //temporales
      this.initim2 = true;
      this.start2();
    } else if (this.tiempo < 5) {
      this.restart();
    } //temporales
    this.existetemp = true;
  }

  evaluarTab(tab) {

    if (this.view_mode !== 'Day') {
      this.toaster.error(
        'Solo disponible en formato gráfico dia',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        }
      );
    }
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
      if (!this.version || this.version && Number(this.version) !== this.versions[this.versions.length - 1].id_version) {
        this.versionEditable = false
      } else {
        this.versionEditable = true
      }
    } else {
      this.versionEditable = false
      this.version = 0
    }
  }
  async cambioVersion() {
    this.mostrar_carga_todo = true
    if (!this.version || this.version && Number(this.version) !== this.versions[this.versions.length - 1].id_version) {
      this.versionEditable = false
    } else {
      this.versionEditable = true
    }
    await this.iniciarProyecto();
    this.mostrar_carga_todo = false
  }

  async guardarVersion() {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se bloqueara la edicion de la ultima version y se creara una version editable')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const obj = {
          descripcion: this.descripcion.value,
          id_proyecto: this.idProyecto
        }
        const res = await this.recursosHumanosService.guardarVersionProgramacion(obj)
        if (res.length) {
          this.version = null
          this.versions = []
          await this.listarVersiones()
          this.cerrarModalVersion()
          await this.iniciarProyecto();
          this.mostrar_carga_todo = false;
          this.toaster.success(
            'Se agrego correctamente',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        }
      }
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.log(error)
      SwalService.error()
    }
  }

  async eliminarVersion() {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminara todo los registros relacionados a la version seleccionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;

        const obj = {
          id_proyecto: this.idProyecto,
          id_version: this.version
        }
        const res = await this.recursosHumanosService.eliminarVersionProgramacion(obj)
        this.versions = []
        this.version = null
        this.versions.push({ descripcion: 'Base (No Editable)', id_version: 0, id_proyecto: this.idProyecto })
        this.versions = this.versions.concat(res)
        this.version = this.versions[this.versions.length - 1].id_version
        await this.iniciarProyecto();
        if (!this.version || this.version && Number(this.version) !== this.versions[this.versions.length - 1].id_version) {
          this.versionEditable = false
        } else {
          this.versionEditable = true
        }
        this.mostrar_carga_todo = false;
        this.toaster.success('Se elimino correctamente', 'Éxito', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
      }
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.log(error)
      SwalService.error()
    }

  }

  async modalAgregarVer() {
    this.formVersion.reset()
    this.modalAgregarVersion.show()

  }

  cerrarModalVersion() {
    this.modalAgregarVersion.hide()
  }
}
