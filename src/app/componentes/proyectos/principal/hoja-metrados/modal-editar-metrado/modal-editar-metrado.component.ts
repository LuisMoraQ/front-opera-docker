import { element } from 'protractor';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { SwalService } from 'src/app/servicios/swal.service';
import * as XLSX from 'xlsx';
import {
  arraydcols,
  arraygcols,
  arrayicols,
  metradoModel,
} from '../modal-metrado-excel/metrado';
import {
  ModalMetradoExcelComponent,
  hoja,
} from '../modal-metrado-excel/modal-metrado-excel.component';
import { ModalResumenProyectoMetradoComponent } from '../modal-resumen-proyecto-metrado/modal-resumen-proyecto-metrado.component';
import { ModalPesosComercialesComponent } from './../modal-pesos-comerciales/modal-pesos-comerciales.component';
import { Acero, aceroModelo } from './acero';
import { Metrado, metradoModelo } from './metrado';
import * as moment from 'moment';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import * as math from 'mathjs';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { ReportesComponent } from '../../../reportes/reportes.component';
import { FormGroup } from '@angular/forms';
import { VariablesGlobalesService } from 'src/app/servicios/variables-globales.service';
import { FormulaPolinomicaService } from 'src/app/servicios/formula-polinomica.service';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2,
}

export interface dataRecuperadPorTitulo {
  data: partidaModelo[];
  dataInicial: partidaModelo[];
  guardado: number;
  modificado: boolean;
  dataTitulo: any;
  tipo_registro: number;
  dataHeader: any;
  dataExcel: any;
  excel_diferente: boolean;
  vinculado: boolean;
  editable: boolean;
}

export interface partidaModelo {
  cantidad: number;
  descripcion: string;
  detalleAcero: any;
  detalleMetrado: any;
  editadoMetrado: number;
  editarMetrado: number;
  estado_metrado: any;
  icomost: number;
  id_proyecto: number;
  id_unidad: string;
  id_usuario: number;
  ind: number;
  indice: number;
  item: string;
  itemord: string;
  metrado: string;
  metrado_valido: number;
  mostrar: number;
  parcial: number;
  permitirCambio: number;
  plantilla: number;
  precio: number;
  tablaInicialSistema: any;
  tablaInicialAcero: any;
  tipo_registro: number;
  unidad: string;
  vinculado: number;
  totalAceros: string;
  estmost: number;
  estilo: string;
  ed_pre: number;
  cant_metrado: string;
  formula: string;
}

@Component({
  selector: 'app-modal-editar-metrado',
  templateUrl: './modal-editar-metrado.component.html',
  styleUrls: ['./modal-editar-metrado.component.scss'],
})
export class ModalEditarMetradoComponent
  implements OnInit/* , AfterViewChecked, OnDestroy, OnChanges */
{
  /* @Input() dataVer = null;
  @Output() verResumen = new EventEmitter<any>();
  indiceTitulo = null;
  buscando = false;
  buscando2 = false;
  tamanioPantalla: number;
  mostrar_carga_todo = false;
  mostrar_carga_todo2 = false;
  dataTitulo = null;
  cantidadFilasTabla = 20;
  habilitarMultipleSelect = false;
  bloquearBotones: boolean = false;
  tablaSeleccionada: boolean = false;
  filaSel = null;
  filaSel2 = -1;
  filaSel3 = -1;
  partidaSeleccionada: partidaModelo = null;
  metradoSeleccionado: Metrado = null;
  aceroSeleccionado: Acero = null;
  posicionCursor;
  ocultarChecks: number = null;
  opcionHabilitarSistema: any = null;
  opcionHabilitarAceros: any = null;
  iniciado = false;
  habilitadoCopiar = false;

  listaTitulos = [];
  dataSource: partidaModelo[] = [];
  tablaSistema: Metrado[] = [];
  tablaAceros: Acero[] = [];
  listaPesos = [];
  arrayCopiadosMetrado = [];
  celdasCopiadosMetrado = [];
  arrayCopiadosAceros = [];
  celdasCopiadosAceros = [];
  dataTitulos: dataRecuperadPorTitulo[] = [];
  tablaExcelAdjunta = [];

  dec_metrado = 2;
  mask_metrado = '0.2';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  id_usuario: any;
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  excelMultiple = false;

  filaExcelSel = null;

  @Input() idProyecto = null;
  public status: Status = Status.OFF;
  private boxPosition: { left: number; top: number };
  private containerPos: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  @ViewChild('box') box: ElementRef;
  @ViewChild('box2') box2: ElementRef;
  @ViewChild('box3') box3: ElementRef;
  public mouse: { x: number; y: number };
  @Input('width') public width: number = 0;
  @Input('height') public height: number = 600;
  @Input('left') public left: number = 0;
  @Input('top') public top: number = 0;
  @ViewChild('p') public popover: NgbPopover;
  @ViewChild('p2') public popover2: NgbPopover;
  @ViewChild('p3') public popover3: NgbPopover;
  @ViewChild('p5') public popover5: NgbPopover;
  @ViewChild('modalEstilos') modalEstilos: ModalBasicComponent;
  headerExcel = null;
  vinculadoExcel: boolean = false;
  noConsistente: boolean = false;
  noConsistente2: boolean = false;
  hBotones: number = 0;
  hBotones2: number = 0;
  stiloMetrado: string;
  habEditFormula = false;
  mostrarColrs: boolean = false;
  tempFormula: any[] = [];
  cantFil: any = 0;
  copiadoActivo: boolean = false;
  formulaCopiada: string = null;
  valorCopiado: string = null;
  seleccionCelda = null;
  celdaInicio: any = null;
  tipoCopiado = 0;
  inicioCeldaCopiado = null;
  finCeldaCopiado = null;
  copiadoCeldas: boolean = false;
  ultiCelda: any = null;
  archivoText = null;
  stilosTit = { color: '', alineamiento: 'left', tipo: '', size: '10' };
  stilosMet = { color: '', alineamiento: 'left', tipo: '', size: '10' };
  stilosSubM = { color: '', alineamiento: 'left', tipo: '', size: '10' };
  stilosTexto = { color: '', alineamiento: 'left', tipo: '', size: '10' };
  colorletra = [
    { id: 'unset', nombre: 'sin color' },
    { id: '#000000', nombre: 'negro' },
    { id: '#fb6a6a', nombre: 'rojo' },
    { id: '#f391bd', nombre: 'rosado' },
    { id: '#a96efc', nombre: 'morado' },
    { id: '#4570b0', nombre: 'azul oscuro' },
    { id: '#709bff', nombre: 'azul' },
    { id: '#7dccfc', nombre: 'celeste' },
    { id: '#00a8b8', nombre: 'verde oscuro' },
    { id: '#47c2b4', nombre: 'turquesa' },
    { id: '#50fb97', nombre: 'verde' },
    { id: '#95eb5c', nombre: 'verde claro' },
    { id: '#fabd42', nombre: 'amarillo' },
    { id: '#fb7f60', nombre: 'naranja' },
    { id: '#9f6a60', nombre: 'marron' },
    { id: '#7995a0', nombre: 'gris' },
    { id: '#ba9e78', nombre: 'camel' },
    { id: '#7f8023', nombre: 'olive' },
    { id: '#65fbe7', nombre: 'teal' },
  ];
  tipoletra = [
    { id: '1', nombre: 'Normal' },
    { id: '2', nombre: 'Cursiva' },
    { id: '3', nombre: 'Negrita' },
    { id: '4', nombre: 'Cursiva Negrita' },
  ];

  tamanioletra = [
    { id: '6', nombre: '6' },
    { id: '7', nombre: '7' },
    { id: '8', nombre: '8' },
    { id: '9', nombre: '9' },
    { id: '10', nombre: '10' },
    { id: '11', nombre: '11' },
    { id: '12', nombre: '12' },
    { id: '13', nombre: '13' },
    { id: '14', nombre: '14' },
    { id: '15', nombre: '15' },
  ];

  alineamiento = [
    { id: 'start', nombre: 'Izquierda' },
    { id: 'center', nombre: 'Centro' },
    { id: 'end', nombre: 'derecha' },
  ];
  indexTablaExcel: any = null;

  tablaTituloSeleccionado: any[] = [];
  datosproy: any;
  moneda = 'S/';
  colores = null;
  decima = null;
  ultStilos: any;
  solover = false;
  faltantesPresupuesto: any[] = [];
  editable: boolean = false;
  existetemp = false;
  permisoGeneral: boolean = false;
  @Input() set tabproyecto(value: any) {
    this.idProyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as FormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as FormGroup;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    this.moneda = datosproy.get('moneda').value.toString() == '0' ? 'S/' : '$';
  }
  permisos = []; */
  constructor(
    /* private encriptadorService: EncriptadorService,
    private presuservice: PresupuestosService,
    private modalService: NgbModal, */
    public formsService: FormsService,
    public metradoService: MetradoService,
    /* private toaster: ToastrService,
    private principalService: PrincipalService,
    private variablesGlobalesService: VariablesGlobalesService */
  ) {}

  async ngOnInit() {
    // try {
    //   this.mostrar_carga_todo2 = true;
    //   this.aspectos = JSON.parse(
    //     this.encriptadorService.recuperarlocalstory('aspectostablas')
    //   );
    //   await this.datosProyec();
    //   this.aspectos = JSON.parse(this.colores);
    //   this.pintar();
    //   let decimales = this.decima;
    //   if (decimales?.toString().includes('|')) {
    //     let arrdec = decimales.split('|');
    //     this.dec_metrado = arrdec[0];
    //     this.mask_metrado = '0.' + arrdec[0];
    //     this.dec_precio = arrdec[1];
    //     this.mask_precio = '0.' + arrdec[1];
    //     this.dec_parcial = arrdec[2];
    //     this.mask_parcial = '0.' + arrdec[2];
    //     // this.dec_cant=arrdec[3];
    //     // this.mask_cant='0.'+arrdec[3];
    //   }
    //   this.id_usuario =
    //     this.encriptadorService.recuperarlocalstory('idusuario');
    //   await this.permisosUsuario();
    //   await this.listarPesosPorUsuario();
    //   await this.listarTitulos();
    //   this.onResize();
    //   this.mostrar_carga_todo2 = false;
    // } catch (e) {
    //   this.mostrar_carga_todo2 = false;
    //   console.log(e);
    //   SwalService.error();
    // }
  }

  // async datosProyec() {
  //   const detalleProyecto = await this.principalService.recuperarDatosProyecto({
  //     id_proyecto: this.idProyecto,
  //   });
  //   this.datosproy = detalleProyecto;
  //   this.moneda = this.datosproy.moneda.toString() == '0' ? 'S/' : '$';
  // }

  // async clickceldaArchivo(row, i) {
  //   this.ultiCelda = null;
  //   this.archivoText = null;
  //   if (row.id_metrado !== null) {
  //     this.archivoText = row.archivo == null ? '' : row.archivo;
  //     var input2 = document.getElementById('archivoT');
  //     if (input2) {
  //       input2.focus({
  //         preventScroll: true,
  //       });
  //     }
  //   } else {
  //     this.eventHandler();
  //   }
  // }

  // async recordHidden() {}

  // closePop(texto) {
  //   if (!this.tablaSeleccionada) {
  //     if (
  //       texto !== null &&
  //       this.tablaSistema[this.filaSel2].archivo !== texto
  //     ) {
  //       this.tablaSistema[this.filaSel2].archivo = texto;
  //       this.guardarTablaTemporal('archivoText');
  //       this.toaster.success('guardado', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //     }
  //   } else {
  //     if (texto !== null && this.tablaAceros[this.filaSel3].archivo !== texto) {
  //       this.tablaAceros[this.filaSel3].archivo = texto;
  //       this.guardarTablaTemporal('archivoText');
  //       this.toaster.success('guardado', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //     }
  //   }
  // }

  // eventHandler() {
  //   var input2 = document.getElementById('archivoT');
  //   if (this.habEditFormula) {
  //     return;
  //   }
  //   if (
  //     this.popover2.isOpen() ||
  //     this.popover3.isOpen() ||
  //     this.popover.isOpen() ||
  //     this.popover5?.isOpen() ||
  //     this.archivoText !== null
  //   ) {
  //     var input2 = document.getElementById('archivoT');
  //     if (input2) {
  //       input2.focus({
  //         preventScroll: true,
  //       });
  //     }
  //     return;
  //   } else {
  //     if (this.seleccionCelda) {
  //       // this.celdaInicio = null
  //     } else if (
  //       this.filaSel2 !== -1 &&
  //       this.opcionHabilitarSistema == null &&
  //       !this.habEditFormula &&
  //       !this.habilitadoCopiar &&
  //       !this.habilitarMultipleSelect
  //     ) {
  //       this.valorCopiado = null;
  //       var input = document.getElementById('copiado');
  //       if (input) {
  //         input.focus({
  //           preventScroll: true,
  //         });
  //       }
  //     } else {
  //       if (this.metradoSeleccionado) {
  //         if (
  //           !this.metradoSeleccionado.editaraltura &&
  //           !this.metradoSeleccionado.editarancho &&
  //           !this.metradoSeleccionado.editararchivo &&
  //           !this.metradoSeleccionado.editarcantidad &&
  //           !this.metradoSeleccionado.editardescripcion &&
  //           !this.metradoSeleccionado.editarlargo &&
  //           !this.metradoSeleccionado.editarn_veces
  //         ) {
  //           this.opcionHabilitarSistema = null;
  //           this.valorCopiado = null;
  //           var input = document.getElementById('copiado');
  //           if (input) {
  //             input.focus({
  //               preventScroll: true,
  //             });
  //           }
  //         }
  //       } else {
  //       }
  //     }
  //   }
  // }

  // ngOnDestroy() {
  //   if (this.existetemp) {
  //     this.guardarTablaTemporal('destroy');
  //   }
  // }

  // ngOnChanges() {}

  // ngAfterViewChecked() {
  //   if (this.opcionHabilitarAceros == 'diametro' && !this.iniciado) {
  //     const a = document.getElementById('s' + this.filaSel3);
  //     if (a) {
  //       this.iniciado = true;
  //       const b = a.getElementsByTagName('input');
  //       b[0].select();
  //     } else {
  //       this.iniciado = false;
  //     }
  //   }
  // }

  // @HostListener('window:mousemove', ['$event'])
  // onMouseMove(event: MouseEvent) {
  //   this.mouse = { x: event.clientX, y: event.clientY };
  //   if (this.status === Status.RESIZE) {
  //     this.resize();
  //   }
  //   this.loadBox();
  //   this.loadContainer();
  // }

  // // @HostListener('window:click', ['$event'])
  // fueradeTabla() {
  //   this.metradoSeleccionado = null;
  //   this.valorCopiado = null;
  //   this.aceroSeleccionado = null;
  //   this.filaSel2 = -1;
  //   this.filaSel3 = -1;
  //   this.mostrarColrs = false;
  //   this.tempFormula = [];
  //   // }
  // }

  // @HostListener('window:resize', ['$event'])
  // onResize(event?) {
  //   var resto;
  //   resto = 130;
  //   this.tamanioPantalla = document.body.clientWidth - 105;
  //   this.height = window.innerHeight - resto;
  //   this.width = document.body.clientWidth / 2.5;
  //   if (this.box2) {
  //     const hBotones = this.box2.nativeElement.offsetHeight;
  //     if (this.hBotones !== hBotones) {
  //       this.hBotones = hBotones;
  //     }
  //   }
  //   if (this.box2) {
  //     const hBotones2 = this.box3.nativeElement.offsetHeight;
  //     if (this.hBotones2 !== hBotones2) {
  //       this.hBotones2 = hBotones2;
  //     }
  //   }
  //   return;
  // }

  // @HostListener('document:keydown.arrowdown', ['$event'])
  // async botonAbajo(event) {
  //   if (this.filaSel !== null && this.filaSel2 == -1 && this.filaSel3 == -1) {
  //     const row = this.dataSource[this.filaSel];
  //     if (row.editarMetrado) {
  //       await this.moverAbajoTablaPrincipal(event.target.value, this.filaSel);
  //       this.partidaSeleccionada = this.dataSource[this.filaSel];
  //     } else {
  //       return;
  //     }
  //   } else if (this.filaSel2 !== -1 && this.filaSel3 == -1) {
  //     if (
  //       this.popover2.isOpen() ||
  //       this.popover3.isOpen() ||
  //       this.popover5?.isOpen() ||
  //       this.popover.isOpen()
  //     ) {
  //       this.popover.close();
  //       this.popover2.close();
  //       this.popover3.close();
  //       this.popover5?.close();
  //       return;
  //     }
  //     await this.moverAbajoTablaSistema(event);
  //   } else {
  //     if (
  //       this.popover2.isOpen() ||
  //       this.popover3.isOpen() ||
  //       this.popover5?.isOpen() ||
  //       this.popover.isOpen()
  //     ) {
  //       this.popover.close();
  //       this.popover2.close();
  //       this.popover5?.close();
  //       this.popover3.close();
  //       return;
  //     }
  //     if (this.filaSel3 + 1 <= this.tablaAceros.length) {
  //       const row = this.tablaAceros[this.filaSel3 + 1];
  //       if (
  //         (row.estitulo || (row.esMetrado && row.tieneSubmetrado)) &&
  //         this.opcionHabilitarAceros == 'longitud'
  //       ) {
  //         return;
  //       }
  //     }
  //     await this.moverAbajoTablaAcero(event);
  //   }
  // }

  // async moverAbajoTablaSistema(value) {
  //   if (this.filaSel2 + 1 < this.tablaSistema.length) {
  //     const encontrado = await this.tablaSistema.find(
  //       (ele) => ele.tieneAceros && ele.id_metrado !== null
  //     );
  //     if (encontrado) {
  //       return;
  //     }
  //     // this.tablaSistema[this.filaSel2]['editar' + this.opcionHabilitarSistema] = 0;
  //     let sgteValido = null;
  //     let index = this.filaSel2 + 1;
  //     while (!sgteValido && index < this.tablaSistema.length) {
  //       if (this.tablaSistema[index].mostrar) {
  //         sgteValido = true;
  //       } else {
  //         index++;
  //       }
  //     }

  //     this.tablaSistema[index]['editar' + this.opcionHabilitarSistema] = 1;
  //     this.filaSel2 = index;
  //     this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //     this.stiloFormula();
  //   } else {
  //     // if (this.filaSel2 + 1 == this.tablaSistema.length) {
  //     this.agregarFila(false);
  //     this.metradoSeleccionado['editar' + this.opcionHabilitarSistema] = 1;
  //     // }
  //     this.stiloFormula();
  //     return;
  //   }
  // }

  // async moverAbajoTablaAcero(value) {
  //   if (this.iniciado) {
  //     return;
  //   }
  //   if (this.filaSel3 + 1 < this.tablaAceros.length) {
  //     this.verificarTextoAceros(value.target.value, this.filaSel3);
  //     let sgteValido = null;
  //     let index = this.filaSel3 + 1;
  //     while (!sgteValido && index < this.tablaAceros.length) {
  //       if (this.tablaAceros[index].mostrar) {
  //         sgteValido = true;
  //       } else {
  //         index++;
  //       }
  //     }
  //     this.tablaAceros[index]['editar' + this.opcionHabilitarAceros] = 1;
  //     this.filaSel3 = index;
  //     this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //   } else {
  //     if (this.filaSel3 + 1 == this.tablaAceros.length) {
  //       this.agregarFila();
  //     }
  //     return;
  //   }
  // }

  // @HostListener('document:keydown.escape', ['$event'])
  // cancelarAccion(event) {
  //   if (this.filaSel !== null) {
  //     const row = this.dataSource[this.filaSel];
  //     if (row.editarMetrado == 1) {
  //       this.dataSource[this.filaSel].editarMetrado = 0;
  //     } else {
  //       return;
  //     }
  //   } else {
  //     return;
  //   }
  //   this.actualizarDataPrincipal();
  // }

  // @HostListener('document:keydown.enter', ['$event'])
  // async blurElementoSeleccionado(event, condicion?) {
  //   if (
  //     this.popover.isOpen() ||
  //     this.popover2.isOpen() ||
  //     this.popover5?.isOpen() ||
  //     this.popover3.isOpen()
  //   ) {
  //     this.popover.close();
  //     this.popover2.close();
  //     this.popover5?.close();
  //     this.popover3.close();
  //     return;
  //   }
  //   if (this.filaSel !== null && this.filaSel2 == -1 && this.filaSel3 == -1) {
  //   } else if (this.filaSel2 !== -1 && this.filaSel3 == -1) {
  //     this.opcionHabilitarSistema = null;
  //   } else {
  //     if (this.opcionHabilitarAceros !== 'diametro') {
  //       this.opcionHabilitarAceros = null;
  //     }
  //   }
  // }

  // @HostListener('document:keydown.arrowup', ['$event'])
  // async botonArriba(event) {
  //   if (this.habEditFormula) {
  //     return;
  //   }
  //   if (this.filaSel !== null && this.filaSel2 == -1 && this.filaSel3 == -1) {
  //     const row = this.dataSource[this.filaSel];
  //     if (row.editarMetrado) {
  //       await this.moverArribaTablaPrincipal(event.target.value, this.filaSel);
  //       this.partidaSeleccionada = this.dataSource[this.filaSel];
  //     } else {
  //       return;
  //     }
  //   } else if (this.filaSel2 !== -1 && this.filaSel3 == -1) {
  //     if (
  //       this.popover2?.isOpen() ||
  //       this.popover3?.isOpen() ||
  //       this.popover5?.isOpen() ||
  //       this.popover?.isOpen()
  //     ) {
  //       this.popover.close();
  //       this.popover2.close();
  //       this.popover5?.close();
  //       this.popover3.close();
  //       return;
  //     }
  //     await this.moverArribaTablaSistema(event);
  //   } else {
  //     if (
  //       this.popover2?.isOpen() ||
  //       this.popover3?.isOpen() ||
  //       this.popover5?.isOpen() ||
  //       this.popover?.isOpen()
  //     ) {
  //       this.popover.close();
  //       this.popover2.close();
  //       this.popover5?.close();
  //       this.popover3.close();
  //       return;
  //     }
  //     if (this.filaSel3 - 1 >= 0) {
  //       const row = this.tablaAceros[this.filaSel3 - 1];
  //       if (
  //         (row.estitulo || (row.esMetrado && row.tieneSubmetrado)) &&
  //         this.opcionHabilitarAceros == 'longitud'
  //       ) {
  //         return;
  //       }
  //     }
  //     await this.moverArribaTablaAceros(event);
  //   }
  // }

  // async moverArribaTablaSistema(value) {
  //   if (this.filaSel2 > 0) {
  //     const encontrado = await this.tablaSistema.find(
  //       (ele) => ele.tieneAceros && ele.id_metrado !== null
  //     );
  //     if (encontrado) {
  //       return;
  //     }
  //     let sgteValido = null;
  //     let index = this.filaSel2 - 1;
  //     while (!sgteValido && index >= 0) {
  //       if (this.tablaSistema[index].mostrar) {
  //         sgteValido = true;
  //       } else {
  //         index--;
  //       }
  //     }
  //     this.tablaSistema[index]['editar' + this.opcionHabilitarSistema] = 1;
  //     this.filaSel2 = index;
  //     this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //     this.stiloFormula();
  //   } else {
  //     return;
  //   }
  // }

  // async moverArribaTablaAceros(value) {
  //   if (this.iniciado) {
  //     return;
  //   }
  //   if (this.filaSel3 > 0) {
  //     let sgteValido = null;
  //     let index = this.filaSel3 - 1;
  //     while (!sgteValido && index >= 0) {
  //       if (this.tablaAceros[index].mostrar) {
  //         sgteValido = true;
  //       } else {
  //         index--;
  //       }
  //     }
  //     this.tablaAceros[index]['editar' + this.opcionHabilitarAceros] = 1;
  //     this.filaSel3 = index;
  //     this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //   } else {
  //     return;
  //   }
  // }

  // @HostListener('document:keydown.arrowright', ['$event'])
  // async botonDerecha(event) {
  //   if (
  //     this.popover2.isOpen() ||
  //     this.popover3.isOpen() ||
  //     this.popover5?.isOpen() ||
  //     this.popover.isOpen()
  //   ) {
  //     this.popover.close();
  //     this.popover2.close();
  //     this.popover5?.close();
  //     this.popover3.close();
  //     return;
  //   }
  //   if (
  //     this.filaSel &&
  //     this.filaSel2 !== -1 &&
  //     this.filaSel3 == -1 &&
  //     !this.habEditFormula
  //   ) {
  //     if (this.tablaSistema[this.filaSel2].tieneAceros) {
  //       return;
  //     }
  //     await this.moverDerechaTablaSistema(event);
  //   } else if (this.filaSel && this.filaSel2 == -1 && this.filaSel3 !== -1) {
  //     const row = this.tablaAceros[this.filaSel3];
  //     if (
  //       (row.estitulo || (row.esMetrado && row.tieneSubmetrado)) &&
  //       this.opcionHabilitarAceros == 'longitud'
  //     ) {
  //       return;
  //     }
  //     await this.moverDerechaTablaAceros(event);
  //   }
  // }

  // async moverDerechaTablaSistema(event) {
  //   if (!this.opcionHabilitarSistema) {
  //     return;
  //   }
  //   const longitudTexto = event?.target?.value?.length
  //     ? event.target.value.length
  //     : null;
  //   const posicionCursor = event?.target?.selectionStart;
  //   !this.posicionCursor
  //     ? (this.posicionCursor = posicionCursor)
  //     : (this.posicionCursor = this.posicionCursor);
  //   // if (
  //   //   this.tablaSistema[this.filaSel2].tieneAceros ||
  //   //   this.tablaSistema[this.filaSel2].estitulo == 1
  //   // ) {
  //   //   return;
  //   // }
  //   if (this.opcionHabilitarSistema == 'descripcion') {
  //     if (this.posicionCursor > longitudTexto || !longitudTexto) {
  //       const sgte = this.sgteColumna(this.opcionHabilitarSistema, true);
  //       this.tablaSistema[this.filaSel2][
  //         'editar' + this.opcionHabilitarSistema
  //       ] = 0;
  //       await this.verificarTextoSistema(event.target.value, this.filaSel2, 3);
  //       this.opcionHabilitarSistema = sgte;
  //       this.tablaSistema[this.filaSel2][
  //         'editar' + this.opcionHabilitarSistema
  //       ] = 1;
  //       this.posicionCursor = null;
  //     } else if (this.posicionCursor == longitudTexto) {
  //       this.posicionCursor++;
  //       return;
  //     } else {
  //       this.posicionCursor = posicionCursor;
  //       return;
  //     }
  //   } else {
  //     if (this.ocultarChecks < 2 && this.opcionHabilitarSistema == 'altura') {
  //       return;
  //     }
  //     const sgte = this.sgteColumna(this.opcionHabilitarSistema, true);
  //     this.tablaSistema[this.filaSel2][
  //       'editar' + this.opcionHabilitarSistema
  //     ] = 0;
  //     await this.verificarTextoSistema(event.target.value, this.filaSel2, 4);
  //     this.opcionHabilitarSistema = sgte;
  //     this.tablaSistema[this.filaSel2][
  //       'editar' + this.opcionHabilitarSistema
  //     ] = 1;
  //     this.posicionCursor = null;
  //   }
  // }

  // async moverDerechaTablaAceros(event) {
  //   if (!this.opcionHabilitarAceros) {
  //     return;
  //   }
  //   const longitudTexto = event?.target?.value?.length
  //     ? event.target.value.length
  //     : null;
  //   const posicionCursor = event.target.selectionStart;
  //   !this.posicionCursor
  //     ? (this.posicionCursor = posicionCursor)
  //     : (this.posicionCursor = this.posicionCursor);
  //   // if (
  //   //   this.tablaAceros[this.filaSel3].tieneSubmetrado &&
  //   //   this.tablaAceros[this.filaSel3].esMetrado == 1
  //   // ) {
  //   //   return;
  //   // }
  //   if (this.opcionHabilitarAceros == 'descripcion') {
  //     if (this.posicionCursor > longitudTexto || !longitudTexto) {
  //       const sgte = this.sgteColumnaAcero(this.opcionHabilitarAceros, true);
  //       this.tablaAceros[this.filaSel3][
  //         'editar' + this.opcionHabilitarAceros
  //       ] = 0;
  //       if (
  //         this.opcionHabilitarAceros == 'diametro' &&
  //         sgte !== this.opcionHabilitarAceros
  //       ) {
  //         this.blurSelect(event);
  //         this.iniciado = false;
  //       }
  //       if (this.opcionHabilitarAceros !== 'diametro') {
  //         await this.verificarTextoAceros(event.target.value, this.filaSel3);
  //       }

  //       this.opcionHabilitarAceros = sgte;
  //       this.tablaAceros[this.filaSel3][
  //         'editar' + this.opcionHabilitarAceros
  //       ] = 1;
  //       this.posicionCursor = null;
  //     } else if (this.posicionCursor == longitudTexto) {
  //       this.posicionCursor++;
  //       return;
  //     } else {
  //       this.posicionCursor = posicionCursor;
  //       return;
  //     }
  //   } else {
  //     const sgte = this.sgteColumnaAcero(this.opcionHabilitarAceros, true);
  //     this.tablaAceros[this.filaSel3][
  //       'editar' + this.opcionHabilitarAceros
  //     ] = 0;
  //     if (
  //       this.opcionHabilitarAceros == 'diametro' &&
  //       sgte !== this.opcionHabilitarAceros
  //     ) {
  //       this.blurSelect(event);
  //       this.iniciado = false;
  //     }
  //     if (this.opcionHabilitarAceros !== 'diametro') {
  //       await this.verificarTextoAceros(event.target.value, this.filaSel3);
  //     }
  //     this.opcionHabilitarAceros = sgte;
  //     this.tablaAceros[this.filaSel3][
  //       'editar' + this.opcionHabilitarAceros
  //     ] = 1;
  //     this.posicionCursor = null;
  //   }
  // }

  // @HostListener('document:keydown.arrowleft', ['$event'])
  // async botonIzquierda(event) {
  //   if (
  //     this.popover2.isOpen() ||
  //     this.popover3.isOpen() ||
  //     this.popover5?.isOpen() ||
  //     this.popover.isOpen()
  //   ) {
  //     this.popover.close();
  //     this.popover2.close();
  //     this.popover5?.close();
  //     this.popover3.close();
  //     return;
  //   }
  //   if (
  //     this.filaSel &&
  //     this.filaSel2 !== -1 &&
  //     this.filaSel3 == -1 &&
  //     !this.habEditFormula
  //   ) {
  //     if (this.tablaSistema[this.filaSel2].tieneAceros) {
  //       return;
  //     }
  //     await this.moverIzquierdaTablaSistema(event);
  //   } else if (this.filaSel && this.filaSel2 == -1 && this.filaSel3 !== -1) {
  //     await this.moverIzquierdaTablaAceros(event);
  //   }
  // }

  // async moverIzquierdaTablaSistema(event) {
  //   const posicionCursor = event.target.selectionStart;
  //   !this.posicionCursor
  //     ? (this.posicionCursor = posicionCursor)
  //     : (this.posicionCursor = this.posicionCursor);
  //   if (this.opcionHabilitarSistema == 'descripcion') {
  //     if (this.posicionCursor < 0) {
  //       const sgte = this.sgteColumna(this.opcionHabilitarSistema, false);
  //       this.tablaSistema[this.filaSel2][
  //         'editar' + this.opcionHabilitarSistema
  //       ] = 0;
  //       await this.verificarTextoSistema(event.target.value, this.filaSel2, 5);
  //       this.opcionHabilitarSistema = sgte;
  //       this.tablaSistema[this.filaSel2][
  //         'editar' + this.opcionHabilitarSistema
  //       ] = 1;
  //       this.posicionCursor = null;
  //     } else if (posicionCursor == 0) {
  //       this.posicionCursor--;
  //       return;
  //     } else {
  //       this.posicionCursor = posicionCursor;
  //       return;
  //     }
  //   } else {
  //     const sgte = this.sgteColumna(this.opcionHabilitarSistema, false);
  //     this.tablaSistema[this.filaSel2][
  //       'editar' + this.opcionHabilitarSistema
  //     ] = 0;
  //     await this.verificarTextoSistema(event.target.value, this.filaSel2, 6);
  //     this.opcionHabilitarSistema = sgte;
  //     this.tablaSistema[this.filaSel2][
  //       'editar' + this.opcionHabilitarSistema
  //     ] = 1;
  //     this.posicionCursor = null;
  //   }
  // }

  // async moverIzquierdaTablaAceros(event) {
  //   const posicionCursor = event.target.selectionStart;
  //   !this.posicionCursor
  //     ? (this.posicionCursor = posicionCursor)
  //     : (this.posicionCursor = this.posicionCursor);
  //   if (this.opcionHabilitarAceros == 'descripcion') {
  //     if (this.posicionCursor < 0) {
  //       const sgte = this.sgteColumnaAcero(this.opcionHabilitarAceros, false);
  //       this.tablaAceros[this.filaSel3][
  //         'editar' + this.opcionHabilitarAceros
  //       ] = 0;
  //       await this.verificarTextoSistema(event.target.value, this.filaSel3, 7);
  //       if (
  //         this.opcionHabilitarAceros == 'diametro' &&
  //         sgte !== this.opcionHabilitarAceros
  //       ) {
  //         this.blurSelect(event);
  //         this.iniciado = false;
  //       }
  //       this.opcionHabilitarAceros = sgte;
  //       this.tablaAceros[this.filaSel3][
  //         'editar' + this.opcionHabilitarAceros
  //       ] = 1;
  //       this.posicionCursor = null;
  //     } else if (posicionCursor == 0) {
  //       this.posicionCursor--;
  //       return;
  //     } else {
  //       this.posicionCursor = posicionCursor;
  //       return;
  //     }
  //   } else {
  //     const sgte = this.sgteColumnaAcero(this.opcionHabilitarAceros, false);
  //     this.tablaAceros[this.filaSel3][
  //       'editar' + this.opcionHabilitarAceros
  //     ] = 0;
  //     await this.verificarTextoSistema(event.target.value, this.filaSel3, 8);
  //     if (
  //       this.opcionHabilitarAceros == 'diametro' &&
  //       sgte !== this.opcionHabilitarAceros
  //     ) {
  //       this.blurSelect(event);
  //       this.iniciado = false;
  //     }
  //     this.opcionHabilitarAceros = sgte;
  //     this.tablaAceros[this.filaSel3][
  //       'editar' + this.opcionHabilitarAceros
  //     ] = 1;
  //     this.posicionCursor = null;
  //   }
  // }

  // @HostListener('document:keydown.control.arrowup', ['$event'])
  // async moverArriba(e: KeyboardEvent) {
  //   let cambio = 0;
  //   if (!this.tablaSeleccionada) {
  //     if (this.metradoSeleccionado.id_metrado == null) {
  //       this.toaster.error('No se puede mover', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     } else if (
  //       this.metradoSeleccionado.esMetrado &&
  //       !this.metradoSeleccionado.estitulo
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const anteriorValido = await this.anteValido(
  //         this.filaSel2 - 1,
  //         'tablaSistema'
  //       );
  //       if (!anteriorValido || anteriorValido?.antExistente?.estitulo) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         for (let i = this.filaSel2 - 1; i >= 0; i--) {
  //           const row = this.tablaSistema[i];
  //           if (
  //             !row.esMetrado ||
  //             (row.esMetrado && row.id_metrado == null) ||
  //             row.estitulo == 2
  //           ) {
  //             array.push(row);
  //           } else if (
  //             (row.esMetrado && row.id_metrado !== null) ||
  //             row.estitulo == 1
  //           ) {
  //             array.push(row);
  //             index = i;
  //             break;
  //           }
  //         }
  //         for (let i = this.filaSel2 + 1; i < this.tablaSistema.length; i++) {
  //           const existeSgte = await this.sgteexistente(i, 'tablaSistema');
  //           if (existeSgte) {
  //             const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //             if (!row.esMetrado) {
  //               array2.push(row);
  //             } else {
  //               if (row.id_metrado !== null && row.esMetrado) {
  //                 break;
  //               } else {
  //                 array2.push(row);
  //               }
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         const obj = JSON.parse(
  //           JSON.stringify(this.tablaSistema[this.filaSel2])
  //         );
  //         array2.unshift(obj);
  //         this.filaSel2 = index;

  //         array2.reverse();
  //         for (let elemento of array2) {
  //           this.tablaSistema.splice(index, 0, elemento);
  //         }
  //         this.tablaSistema.splice(
  //           index + array2.length + array.length,
  //           array2.length
  //         );
  //         await this.actualizarTablaCompleta();
  //         this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverArriba1');
  //       }
  //     } else if (
  //       !this.metradoSeleccionado.esMetrado &&
  //       !this.metradoSeleccionado.estitulo
  //     ) {
  //       const anterior = await this.anteValido(
  //         this.filaSel2 - 1,
  //         'tablaSistema'
  //       );
  //       if (!anterior || anterior?.antExistente?.esMetrado) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         const inx = JSON.parse(JSON.stringify(this.filaSel2));
  //         const ele = JSON.parse(JSON.stringify(this.metradoSeleccionado));
  //         this.tablaSistema[anterior.index] = ele;
  //         this.tablaSistema[inx] = anterior.antExistente;
  //         await this.actualizarTablaCompleta();
  //         this.filaSel2 = anterior.index;
  //         this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverArriba2');
  //       }
  //     } else if (
  //       this.metradoSeleccionado.esMetrado &&
  //       this.metradoSeleccionado.estitulo == 1
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const anteriorValido = await this.anteValido(
  //         this.filaSel2 - 1,
  //         'tablaSistema'
  //       );
  //       if (!anteriorValido.antExistente) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         for (let i = this.filaSel2 - 1; i >= 0; i--) {
  //           const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //           if (
  //             (row.esMetrado && !row.estitulo) ||
  //             !row.esMetrado ||
  //             row.estitulo == 2
  //           ) {
  //             array.push(row);
  //           } else if (row.estitulo == 1) {
  //             array.push(row);
  //             index = i;
  //             break;
  //           }
  //         }
  //         const obj = JSON.parse(
  //           JSON.stringify(this.tablaSistema[this.filaSel2])
  //         );
  //         array2.push(obj);
  //         for (let i = this.filaSel2 + 1; i < this.tablaSistema.length; i++) {
  //           const existeSgte = await this.sgteexistente(i, 'tablaSistema');
  //           if (existeSgte) {
  //             const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //             if (!row.estitulo || row.estitulo == 2) {
  //               array2.push(row);
  //             } else {
  //               if (row.id_metrado !== null && row.esMetrado) {
  //                 break;
  //               }
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         this.filaSel2 = index;
  //         array2.reverse();
  //         for (let elemento of array2) {
  //           this.tablaSistema.splice(index, 0, elemento);
  //         }
  //         this.tablaSistema.splice(
  //           index + array2.length + array.length,
  //           array2.length
  //         );
  //         await this.actualizarTablaCompleta();
  //         this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverArriba3');
  //       }
  //     } else if (
  //       this.metradoSeleccionado.esMetrado &&
  //       this.metradoSeleccionado.estitulo == 2 &&
  //       !this.metradoSeleccionado.tieneSubmetrado
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const anteriorValido = await this.anteValido(
  //         this.filaSel2 - 1,
  //         'tablaSistema'
  //       );
  //       if (
  //         !anteriorValido.antExistente ||
  //         anteriorValido?.antExistente?.estitulo == 1
  //       ) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         for (let i = this.filaSel2 - 1; i >= 0; i--) {
  //           const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //           if (!row.estitulo || row.estitulo == 2) {
  //             array.push(row);
  //           } else if (row.estitulo == 1) {
  //             array.push(row);
  //             index = i;
  //             break;
  //           }
  //         }
  //         const obj = JSON.parse(
  //           JSON.stringify(this.tablaSistema[this.filaSel2])
  //         );
  //         array2.push(obj);
  //         for (let i = this.filaSel2 + 1; i < this.tablaSistema.length; i++) {
  //           const existeSgte = await this.sgteexistente(i, 'tablaSistema');
  //           if (existeSgte) {
  //             const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //             if (!row.estitulo || row.estitulo == 2) {
  //               array2.push(row);
  //             } else {
  //               if (row.id_metrado !== null && row.estitulo == 1) {
  //                 break;
  //               }
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         this.filaSel2 = index;
  //         array2.reverse();
  //         for (let elemento of array2) {
  //           this.tablaSistema.splice(index, 0, elemento);
  //         }
  //         this.tablaSistema.splice(
  //           index + array2.length + array.length,
  //           array2.length
  //         );
  //         await this.actualizarTablaCompleta();
  //         this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //         // this.guardarTablaTemporal('moverArriba3')
  //       }
  //     }
  //   } else {
  //     if (this.aceroSeleccionado.id_metrado == null) {
  //       this.toaster.error('No se puede mover', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     } else if (
  //       this.aceroSeleccionado.esMetrado &&
  //       !this.aceroSeleccionado.estitulo
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const anteriorValido = await this.anteValido(
  //         this.filaSel3 - 1,
  //         'tablaAceros'
  //       );
  //       if (!anteriorValido || anteriorValido?.antExistente?.estitulo) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         for (let i = this.filaSel3 - 1; i >= 0; i--) {
  //           const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //           if (!row.esMetrado || (row.esMetrado && row.id_metrado == null)) {
  //             array.push(row);
  //           } else if (
  //             (row.esMetrado && row.id_metrado !== null) ||
  //             row.estitulo
  //           ) {
  //             array.push(row);
  //             index = i;
  //             break;
  //           }
  //         }
  //         for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
  //           const existeSgte = await this.sgteValido(i, 'tablaAceros');
  //           if (existeSgte?.sgteExistente) {
  //             const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //             if (!row.esMetrado) {
  //               array2.push(row);
  //             } else {
  //               if (row.id_metrado !== null && row.esMetrado) {
  //                 break;
  //               } else {
  //                 array2.push(row);
  //               }
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         const obj = JSON.parse(
  //           JSON.stringify(this.tablaAceros[this.filaSel3])
  //         );
  //         array2.push(obj);
  //         this.filaSel3 = index;
  //         for (let elemento of array2) {
  //           this.tablaAceros.splice(index, 0, elemento);
  //         }
  //         this.tablaAceros.splice(
  //           index + array2.length + array.length,
  //           array2.length
  //         );
  //         await this.actualizarTablaCompletaAceros();
  //         this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverArriba');
  //       }
  //     } else if (!this.aceroSeleccionado.esMetrado) {
  //       const anterior = await this.anteValido(
  //         this.filaSel3 - 1,
  //         'tablaAceros'
  //       );
  //       if (!anterior || anterior?.antExistente?.esMetrado) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         const inx = JSON.parse(JSON.stringify(this.filaSel3));
  //         const ele = JSON.parse(JSON.stringify(this.aceroSeleccionado));
  //         this.tablaAceros[anterior.index] = ele;
  //         this.tablaAceros[inx] = anterior.antExistente;
  //         await this.actualizarTablaCompletaAceros();
  //         this.filaSel3 = anterior.index;
  //         this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverArriba');
  //       }
  //     } else if (
  //       this.aceroSeleccionado.esMetrado &&
  //       this.aceroSeleccionado.estitulo == 1
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const anteriorValido = await this.anteValido(
  //         this.filaSel3 - 1,
  //         'tablaAceros'
  //       );
  //       if (!anteriorValido?.antExistente) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         for (let i = this.filaSel3 - 1; i >= 0; i--) {
  //           const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //           if ((row.esMetrado && !row.estitulo) || !row.esMetrado) {
  //             array.push(row);
  //           } else if (row.estitulo) {
  //             array.push(row);
  //             index = i;
  //             break;
  //           }
  //         }
  //         array2.push(this.tablaAceros[this.filaSel3]);
  //         for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
  //           const existeSgte = await this.sgteValido(i, 'tablaAceros');
  //           if (existeSgte?.sgteExistente) {
  //             const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //             if (!row.estitulo) {
  //               array2.push(row);
  //             } else {
  //               if (row.id_metrado !== null && row.esMetrado) {
  //                 break;
  //               }
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         this.filaSel3 = index;
  //         array2.reverse();
  //         for (let elemento of array2) {
  //           this.tablaAceros.splice(index, 0, elemento);
  //         }
  //         this.tablaAceros.splice(
  //           index + array2.length + array.length,
  //           array2.length
  //         );
  //         await this.actualizarTablaCompletaAceros();
  //         this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverArriba');
  //       }
  //     } else if (
  //       this.aceroSeleccionado.esMetrado &&
  //       this.aceroSeleccionado.estitulo == 2 &&
  //       !this.aceroSeleccionado.tieneSubmetrado
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const anteriorValido = await this.anteValido(
  //         this.filaSel3 - 1,
  //         'tablaAceros'
  //       );
  //       if (
  //         !anteriorValido.antExistente ||
  //         anteriorValido?.antExistente?.estitulo == 1
  //       ) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         for (let i = this.filaSel3 - 1; i >= 0; i--) {
  //           const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //           if (row.estitulo == 0) {
  //             array.push(row);
  //           } else if (row.estitulo !== 0) {
  //             array.push(row);
  //             index = i;
  //             break;
  //           }
  //         }
  //         const obj = JSON.parse(
  //           JSON.stringify(this.tablaAceros[this.filaSel3])
  //         );
  //         array2.push(obj);
  //         for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
  //           const existeSgte = await this.sgteValido(i, 'tablaAceros');
  //           if (existeSgte?.sgteExistente) {
  //             const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //             if (row.estitulo == 0) {
  //               array2.push(row);
  //             } else {
  //               if (row.id_metrado !== null && row.estitulo !== 0) {
  //                 break;
  //               }
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         this.filaSel3 = index;
  //         array2.reverse();
  //         for (let elemento of array2) {
  //           this.tablaAceros.splice(index, 0, elemento);
  //         }
  //         this.tablaAceros.splice(
  //           index + array2.length + array.length,
  //           array2.length
  //         );
  //         await this.actualizarTablaCompletaAceros();
  //         this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverArriba3');
  //       }
  //     }
  //   }
  //   if (e) {
  //     e.preventDefault();
  //   }
  // }

  // @HostListener('document:keydown.control.arrowdown', ['$event'])
  // async moverAbajo(e: KeyboardEvent) {
  //   let cambio = 0;
  //   if (!this.tablaSeleccionada) {
  //     if (this.metradoSeleccionado.id_metrado == null) {
  //       this.toaster.error('No se puede mover', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     } else if (
  //       this.metradoSeleccionado.esMetrado &&
  //       !this.metradoSeleccionado.estitulo
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       array.push(this.tablaSistema[this.filaSel2]);
  //       for (let i = this.filaSel2 + 1; i < this.tablaSistema.length; i++) {
  //         const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //         if (
  //           !row.esMetrado ||
  //           (row.esMetrado && row.id_metrado == null) ||
  //           row.estitulo == 2
  //         ) {
  //           array.push(row);
  //         } else if ((row.esMetrado && row.id_metrado) || row.estitulo == 1) {
  //           index = i;
  //           break;
  //         }
  //       }
  //       const sgteValido = await this.sgteValido(
  //         this.filaSel2 + array.length,
  //         'tablaSistema'
  //       );
  //       if (!sgteValido?.sgteExistente || sgteValido?.sgteExistente?.estitulo) {
  //         this.toaster.error('No se puede desplazar', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         array2.push(this.tablaSistema[this.filaSel2 + array.length]);
  //         for (
  //           let i = this.filaSel2 + array.length + 1;
  //           i < this.tablaSistema.length;
  //           i++
  //         ) {
  //           const existeSgte = await this.sgteValido(i, 'tablaSistema');
  //           if (existeSgte?.sgteExistente) {
  //             const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //             if (
  //               !row.esMetrado ||
  //               (row.esMetrado && row.id_metrado == null) ||
  //               row.estitulo == 2
  //             ) {
  //               array2.push(row);
  //             } else if (
  //               (row.id_metrado !== null && row.esMetrado) ||
  //               row.estitulo == 1
  //             ) {
  //               index = i;
  //               break;
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         const inx = JSON.parse(JSON.stringify(this.filaSel2));
  //         array.reverse();
  //         for (let elemento of array) {
  //           this.tablaSistema.splice(
  //             inx + array2.length + array.length,
  //             0,
  //             elemento
  //           );
  //         }
  //         this.tablaSistema.splice(inx, array.length);
  //         this.filaSel2 = inx + array2.length;
  //         this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //         await this.actualizarTablaCompleta();
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverAbajo1');
  //       }
  //     } else if (!this.metradoSeleccionado.esMetrado) {
  //       const sgte = await this.sgteValido(this.filaSel2 + 1, 'tablaSistema');
  //       if (!sgte?.sgteExistente || sgte?.sgteExistente?.esMetrado) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         const inx = JSON.parse(JSON.stringify(this.filaSel2));
  //         const ele = JSON.parse(JSON.stringify(this.metradoSeleccionado));
  //         this.tablaSistema[sgte.index] = ele;
  //         this.tablaSistema[inx] = sgte.sgteExistente;
  //         await this.actualizarTablaCompleta();
  //         this.filaSel2 = sgte.index;
  //         this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverAbajo2');
  //       }
  //     } else if (
  //       this.metradoSeleccionado.esMetrado &&
  //       this.metradoSeleccionado.estitulo == 1
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const obj = JSON.parse(
  //         JSON.stringify(this.tablaSistema[this.filaSel2])
  //       );
  //       array.push(obj);
  //       for (let i = this.filaSel2 + 1; i < this.tablaSistema.length; i++) {
  //         const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //         if (row.estitulo !== 1) {
  //           array.push(row);
  //         } else if (row.estitulo == 1) {
  //           break;
  //         }
  //       }
  //       const sgteValido = await this.sgteValido(
  //         this.filaSel2 + array.length,
  //         'tablaSistema'
  //       );
  //       if (!sgteValido?.sgteExistente) {
  //         this.toaster.error('No se puede desplazar', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         array2.push(this.tablaSistema[this.filaSel2 + array.length]);
  //         for (
  //           let i = this.filaSel2 + array.length + 1;
  //           i < this.tablaSistema.length;
  //           i++
  //         ) {
  //           const existeSgte = await this.sgteValido(i, 'tablaSistema');
  //           if (existeSgte?.sgteExistente) {
  //             const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //             if (row.estitulo !== 1) {
  //               array2.push(row);
  //             } else if (row.estitulo == 1) {
  //               index = i;
  //               break;
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         const inx = JSON.parse(JSON.stringify(this.filaSel2));
  //         array.reverse();
  //         for (let elemento of array) {
  //           this.tablaSistema.splice(
  //             inx + array2.length + array.length,
  //             0,
  //             elemento
  //           );
  //         }
  //         this.tablaSistema.splice(inx, array.length);
  //         this.filaSel2 = inx + array2.length;
  //         this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //         await this.actualizarTablaCompleta();
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverAbajo3');
  //       }
  //     } else if (
  //       this.metradoSeleccionado.esMetrado &&
  //       this.metradoSeleccionado.estitulo == 2 &&
  //       !this.metradoSeleccionado.tieneSubmetrado
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const obj = JSON.parse(
  //         JSON.stringify(this.tablaSistema[this.filaSel2])
  //       );
  //       array.push(obj);
  //       for (let i = this.filaSel2 + 1; i < this.tablaSistema.length; i++) {
  //         const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //         if (!row.estitulo || row.estitulo == 2) {
  //           array.push(row);
  //         } else if (row.estitulo == 1) {
  //           break;
  //         }
  //       }
  //       const sgteValido = await this.sgteValido(
  //         this.filaSel2 + array.length,
  //         'tablaSistema'
  //       );
  //       if (!sgteValido?.sgteExistente) {
  //         this.toaster.error('No se puede desplazar', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         array2.push(this.tablaSistema[this.filaSel2 + array.length]);
  //         for (
  //           let i = this.filaSel2 + array.length + 1;
  //           i < this.tablaSistema.length;
  //           i++
  //         ) {
  //           const existeSgte = await this.sgteValido(i, 'tablaSistema');
  //           if (existeSgte?.sgteExistente) {
  //             const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
  //             if (!row.estitulo || row.estitulo == 2) {
  //               array2.push(row);
  //             } else if (row.estitulo == 1) {
  //               index = i;
  //               break;
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         const inx = JSON.parse(JSON.stringify(this.filaSel2));
  //         array.reverse();
  //         for (let elemento of array) {
  //           this.tablaSistema.splice(
  //             inx + array2.length + array.length,
  //             0,
  //             elemento
  //           );
  //         }
  //         this.tablaSistema.splice(inx, array.length);
  //         this.filaSel2 = inx + array2.length;
  //         this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //         await this.actualizarTablaCompleta();
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverAbajo3');
  //       }
  //     }
  //   } else {
  //     if (this.aceroSeleccionado.id_metrado == null) {
  //       this.toaster.error('No se puede mover', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     } else if (
  //       this.aceroSeleccionado.esMetrado &&
  //       !this.aceroSeleccionado.estitulo
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const obj = JSON.parse(JSON.stringify(this.tablaAceros[this.filaSel3]));
  //       array.push(obj);
  //       for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
  //         const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //         if (!row.esMetrado || (row.esMetrado && row.id_metrado == null)) {
  //           array.push(row);
  //         } else if ((row.esMetrado && row.id_metrado) || row.estitulo) {
  //           index = i;
  //           break;
  //         }
  //       }
  //       const sgteValido = await this.sgteValido(
  //         this.filaSel3 + array.length,
  //         'tablaAceros'
  //       );
  //       if (!sgteValido?.sgteExistente || sgteValido?.sgteExistente?.estitulo) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         const obj2 = JSON.parse(
  //           JSON.stringify(this.tablaAceros[this.filaSel3 + array.length])
  //         );
  //         array2.push(obj2);
  //         for (
  //           let i = this.filaSel3 + array.length + 1;
  //           i < this.tablaAceros.length;
  //           i++
  //         ) {
  //           const existeSgte = await this.sgteValido(i, 'tablaAceros');
  //           if (existeSgte?.sgteExistente) {
  //             const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //             if (!row.esMetrado || (row.esMetrado && row.id_metrado == null)) {
  //               array2.push(row);
  //             } else if (
  //               (row.id_metrado !== null && row.esMetrado) ||
  //               row.estitulo
  //             ) {
  //               index = i;
  //               break;
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         const inx = JSON.parse(JSON.stringify(this.filaSel3));
  //         array.reverse();
  //         for (let elemento of array) {
  //           this.tablaAceros.splice(
  //             inx + array2.length + array.length,
  //             0,
  //             elemento
  //           );
  //         }
  //         this.tablaAceros.splice(inx, array.length);
  //         this.filaSel3 = inx + array2.length;
  //         this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //         await this.actualizarTablaCompletaAceros();
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverAbajo');
  //       }
  //     } else if (!this.aceroSeleccionado.esMetrado) {
  //       const sgte = await this.sgteValido(this.filaSel3 + 1, 'tablaAceros');
  //       if (!sgte?.sgteExistente || sgte?.sgteExistente?.esMetrado) {
  //         this.toaster.error('No se puede mover', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         const inx = JSON.parse(JSON.stringify(this.filaSel3));
  //         const ele = JSON.parse(JSON.stringify(this.aceroSeleccionado));
  //         this.tablaAceros[sgte.index] = ele;
  //         this.tablaAceros[inx] = sgte.sgteExistente;
  //         await this.actualizarTablaCompletaAceros();
  //         this.filaSel3 = sgte.index;
  //         this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverAbajo');
  //       }
  //     } else if (
  //       this.aceroSeleccionado.esMetrado &&
  //       this.aceroSeleccionado.estitulo == 1
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const obj3 = JSON.parse(
  //         JSON.stringify(this.tablaAceros[this.filaSel3])
  //       );
  //       array.push(obj3);
  //       for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
  //         const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //         if (!row.estitulo) {
  //           array.push(row);
  //         } else if (row.estitulo) {
  //           break;
  //         }
  //       }
  //       const sgteValido = await this.sgteValido(
  //         this.filaSel3 + array.length,
  //         'tablaAceros'
  //       );
  //       if (!sgteValido?.sgteExistente) {
  //         this.toaster.error('No se puede desplazar', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         const obj4 = JSON.parse(
  //           JSON.stringify(this.tablaAceros[this.filaSel3 + array.length])
  //         );
  //         array2.push(obj4);
  //         for (
  //           let i = this.filaSel3 + array.length + 1;
  //           i < this.tablaAceros.length;
  //           i++
  //         ) {
  //           const existeSgte = await this.sgteValido(i, 'tablaAceros');
  //           if (existeSgte?.sgteExistente) {
  //             const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //             if (!row.estitulo) {
  //               array2.push(row);
  //             } else if (row.estitulo) {
  //               index = i;
  //               break;
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         const inx = JSON.parse(JSON.stringify(this.filaSel3));
  //         array.reverse();
  //         for (let elemento of array) {
  //           this.tablaAceros.splice(
  //             inx + array2.length + array.length,
  //             0,
  //             elemento
  //           );
  //         }
  //         this.tablaAceros.splice(inx, array.length);
  //         this.filaSel3 = inx + array2.length;
  //         this.metradoSeleccionado = this.tablaAceros[this.filaSel3];
  //         await this.actualizarTablaCompletaAceros();
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverAbajo');
  //       }
  //     } else if (
  //       this.aceroSeleccionado.esMetrado &&
  //       this.aceroSeleccionado.estitulo == 2 &&
  //       !this.aceroSeleccionado.tieneSubmetrado
  //     ) {
  //       let array = [];
  //       let array2 = [];
  //       let index = null;
  //       const obj = JSON.parse(JSON.stringify(this.tablaAceros[this.filaSel3]));
  //       array.push(obj);
  //       for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
  //         const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //         if (row.estitulo == 0) {
  //           array.push(row);
  //         } else if (row.estitulo !== 0) {
  //           break;
  //         }
  //       }
  //       const sgteValido = await this.sgteValido(
  //         this.filaSel3 + array.length,
  //         'tablaAceros'
  //       );
  //       if (!sgteValido?.sgteExistente) {
  //         this.toaster.error('No se puede desplazar', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         array2.push(this.tablaAceros[this.filaSel3 + array.length]);
  //         for (
  //           let i = this.filaSel3 + array.length + 1;
  //           i < this.tablaAceros.length;
  //           i++
  //         ) {
  //           const existeSgte = await this.sgteValido(i, 'tablaAceros');
  //           if (existeSgte?.sgteExistente) {
  //             const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
  //             if (row.estitulo == 0) {
  //               array2.push(row);
  //             } else if (row.estitulo !== 0) {
  //               index = i;
  //               break;
  //             }
  //           } else {
  //             break;
  //           }
  //         }
  //         const inx = JSON.parse(JSON.stringify(this.filaSel3));
  //         array.reverse();
  //         for (let elemento of array) {
  //           this.tablaAceros.splice(
  //             inx + array2.length + array.length,
  //             0,
  //             elemento
  //           );
  //         }
  //         this.tablaAceros.splice(inx, array.length);
  //         this.filaSel3 = inx + array2.length;
  //         this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //         await this.actualizarTablaCompletaAceros();
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('moverAbajo');
  //       }
  //     }
  //   }
  //   if (e) {
  //     e.preventDefault();
  //   }
  // }

  // @HostListener('document:keydown.control.arrowleft', ['$event'])
  // async subirNivelfila(e?: KeyboardEvent) {
  //   if (!this.habilitadoCopiar) {
  //     if (!this.tablaSeleccionada) {
  //       if (this.metradoSeleccionado.id_metrado !== null) {
  //         const sgte = await this.sgteValido(this.filaSel2 + 1, 'tablaSistema');
  //         const anterior = await this.anteValido(
  //           this.filaSel2 - 1,
  //           'tablaSistema'
  //         );
  //         if (
  //           !this.metradoSeleccionado.estitulo &&
  //           this.metradoSeleccionado.esMetrado
  //         ) {
  //           this.metradoSeleccionado.estitulo = 1;
  //           this.metradoSeleccionado.esMetrado = 1;
  //           this.metradoSeleccionado.tieneAceros = 0;
  //           this.metradoSeleccionado.tieneSubmetrado = 0;
  //         } else if (
  //           !this.metradoSeleccionado.estitulo &&
  //           !this.metradoSeleccionado.esMetrado
  //         ) {
  //           if (
  //             anterior.index !== null &&
  //             anterior.antExistente.esMetrado &&
  //             !anterior.antExistente.estitulo &&
  //             sgte.index !== null &&
  //             ((sgte.sgteExistente.esMetrado && !sgte.sgteExistente.estitulo) ||
  //               sgte.sgteExistente.estitulo)
  //           ) {
  //             this.tablaSistema[anterior.index].tieneSubmetrado = 0;
  //             this.tablaSistema[anterior.index].tieneAceros = 0;
  //           } else if (
  //             anterior.index !== null &&
  //             anterior.antExistente.esMetrado &&
  //             !anterior.antExistente.estitulo &&
  //             sgte.index !== null &&
  //             !sgte.sgteExistente.esMetrado &&
  //             !sgte.sgteExistente.estitulo
  //           ) {
  //             this.tablaSistema[anterior.index].tieneSubmetrado = 1;
  //             this.tablaSistema[anterior.index].tieneAceros = 0;
  //           }
  //           this.metradoSeleccionado.estitulo = 0;
  //           this.metradoSeleccionado.esMetrado = 1;
  //           this.metradoSeleccionado.tieneAceros = 0;
  //           this.metradoSeleccionado.tieneSubmetrado = 0;
  //         } else if (this.metradoSeleccionado.estitulo == 1) {
  //           return;
  //         } else if (this.metradoSeleccionado.estitulo == 2) {
  //           if (
  //             anterior.index !== null &&
  //             anterior.antExistente.esMetrado &&
  //             !anterior.antExistente.estitulo
  //           ) {
  //             this.tablaSistema[anterior.index].tieneSubmetrado = 1;
  //             this.tablaSistema[anterior.index].tieneAceros = 0;
  //           } else if (anterior.index == null) {
  //             return;
  //           }
  //           this.metradoSeleccionado.estitulo = 0;
  //           this.metradoSeleccionado.esMetrado = 0;
  //           this.metradoSeleccionado.tieneAceros = 0;
  //           this.metradoSeleccionado.tieneSubmetrado = 0;
  //         }
  //         await this.actualizarTablaCompleta();
  //         await this.calculoMontosSistema();
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('volverMetrado');
  //       } else {
  //         this.toaster.error('Fila seleccionada no valida', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //       }
  //       this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //     } else {
  //       if (this.aceroSeleccionado.id_metrado !== null) {
  //         const sgte = await this.sgteValido(this.filaSel3 + 1, 'tablaAceros');
  //         const anterior = await this.anteValido(
  //           this.filaSel3 - 1,
  //           'tablaAceros'
  //         );
  //         if (
  //           !this.aceroSeleccionado.estitulo &&
  //           this.aceroSeleccionado.esMetrado
  //         ) {
  //           this.aceroSeleccionado.estitulo = 1;
  //           this.aceroSeleccionado.esMetrado = 1;
  //           this.aceroSeleccionado.tieneSubmetrado = 0;
  //         } else if (
  //           !this.aceroSeleccionado.estitulo &&
  //           !this.aceroSeleccionado.esMetrado
  //         ) {
  //           if (
  //             anterior.index !== null &&
  //             anterior.antExistente.esMetrado &&
  //             !anterior.antExistente.estitulo &&
  //             sgte.index !== null &&
  //             ((sgte.sgteExistente.esMetrado && !sgte.sgteExistente.estitulo) ||
  //               sgte.sgteExistente.estitulo)
  //           ) {
  //             this.tablaAceros[anterior.index].tieneSubmetrado = 0;
  //           } else if (
  //             anterior.index !== null &&
  //             anterior.antExistente.esMetrado &&
  //             !anterior.antExistente.estitulo &&
  //             sgte.index !== null &&
  //             !sgte.sgteExistente.esMetrado &&
  //             !sgte.sgteExistente.estitulo
  //           ) {
  //             this.tablaAceros[anterior.index].tieneSubmetrado = 1;
  //           }
  //           this.aceroSeleccionado.estitulo = 0;
  //           this.aceroSeleccionado.esMetrado = 1;
  //           this.aceroSeleccionado.tieneSubmetrado = 0;
  //         } else if (this.aceroSeleccionado.estitulo == 1) {
  //           return;
  //         } else if (this.aceroSeleccionado.estitulo == 2) {
  //           if (
  //             anterior.index !== null &&
  //             anterior.antExistente.esMetrado &&
  //             !anterior.antExistente.estitulo
  //           ) {
  //             this.tablaAceros[anterior.index].tieneSubmetrado = 1;
  //           } else if (anterior.index == null) {
  //             return;
  //           }
  //           this.aceroSeleccionado.estitulo = 0;
  //           this.aceroSeleccionado.esMetrado = 0;
  //           this.aceroSeleccionado.tieneSubmetrado = 0;
  //         }
  //         await this.actualizarTablaCompletaAceros();
  //         await this.calcularMontosAceros();
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('volverMetrado');
  //       } else {
  //         this.toaster.error('Fila seleccionada no valida', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //       }
  //       this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //     }
  //   } else {
  //     let tipoTabla = !this.tablaSeleccionada ? 'tablaSistema' : 'tablaAceros';
  //     const filtrados = await this[tipoTabla].filter((ele) => ele.editarCopiar);
  //     if (filtrados.length) {
  //       let titulos = 0;
  //       let metrados = 0;
  //       let submetrados = 0;
  //       await filtrados.map((ele) => {
  //         if (!ele.esMetrado) {
  //           submetrados++;
  //         } else if (ele.esMetrado && ele.estitulo !== 1) {
  //           metrados++;
  //         } else if (ele.esMetrado && ele.estitulo == 1) {
  //           titulos++;
  //         }
  //       });

  //       if (metrados > 0 && !titulos && !submetrados) {
  //         for (const iterator of filtrados) {
  //           if (
  //             iterator.id_metrado !== null &&
  //             iterator.esMetrado &&
  //             !iterator.tieneSubmetrado
  //           ) {
  //             iterator.esMetrado = 1;
  //             iterator.estitulo = 1;
  //           } else {
  //             this.toaster.error(
  //               'Metrado: ' +
  //                 iterator.descripcion +
  //                 ' tiene submetrados relacionados',
  //               'Error',
  //               {
  //                 closeButton: false,
  //                 positionClass: 'toast-bottom-right',
  //                 timeOut: 4000,
  //               }
  //             );
  //             return;
  //           }
  //         }
  //       } else if (!metrados && titulos > 0 && !submetrados) {
  //         this.toaster.error('Titulo es el maximo nivel', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else if (!metrados && !titulos && submetrados > 0) {
  //         for (const iterator of filtrados) {
  //           if (iterator.id_metrado !== null && !iterator.esMetrado) {
  //             iterator.esMetrado = 1;
  //             iterator.estitulo = 0;
  //           }
  //         }
  //       } else {
  //         this.toaster.error(
  //           'No se convertir elementos de diferentes tipos',
  //           'Error',
  //           {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 2000,
  //           }
  //         );
  //         return;
  //       }
  //       if (tipoTabla == 'tablaSistema') {
  //         await this.actualizarTablaCompleta();
  //         await this.calculoMontosSistema();
  //       } else {
  //         await this.actualizarTablaCompletaAceros();
  //         await this.calcularMontosAceros();
  //       }
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal('volverMetrado');
  //       this.habilitadoCopiar = false;
  //     }
  //   }
  // }

  // @HostListener('document:keydown.control.arrowright', ['$event'])
  // async bajarNivel(e?: KeyboardEvent) {
  //   if (!this.habilitadoCopiar) {
  //     if (!this.tablaSeleccionada) {
  //       if (
  //         this.metradoSeleccionado &&
  //         this.metradoSeleccionado.id_metrado !== null
  //       ) {
  //         const sgte = await this.sgteValido(this.filaSel2 + 1, 'tablaSistema');
  //         const anterior = await this.anteValido(
  //           this.filaSel2 - 1,
  //           'tablaSistema'
  //         );
  //         if (
  //           !this.metradoSeleccionado.esMetrado &&
  //           !this.metradoSeleccionado.estitulo
  //         ) {
  //           this.tablaSistema[this.filaSel2].estitulo = 2;
  //           this.tablaSistema[this.filaSel2].esMetrado = 0;
  //           this.tablaSistema[this.filaSel2].tieneAceros = 0;
  //           this.tablaSistema[this.filaSel2].tieneSubmetrado = 0;
  //           if (anterior.index !== null) {
  //             if (
  //               anterior.antExistente.esMetrado &&
  //               !anterior.antExistente.estitulo &&
  //               (sgte?.sgteExistente?.esMetrado ||
  //                 sgte?.sgteExistente?.estitulo)
  //             ) {
  //               this.tablaSistema[anterior.index].tieneSubmetrado = 0;
  //               this.tablaSistema[anterior.index].tieneAceros = 0;
  //             } else if (
  //               (anterior.antExistente.esMetrado &&
  //                 !anterior.antExistente.estitulo &&
  //                 !sgte?.sgteExistente?.esMetrado) ||
  //               !sgte?.sgteExistente?.estitulo
  //             ) {
  //               this.tablaSistema[anterior.index].tieneSubmetrado = 1;
  //               this.tablaSistema[anterior.index].tieneAceros = 0;
  //             }
  //           }
  //         } else if (
  //           this.metradoSeleccionado.esMetrado &&
  //           !this.metradoSeleccionado.estitulo
  //         ) {
  //           if (anterior.index !== null) {
  //             this.tablaSistema[this.filaSel2].estitulo = 0;
  //             this.tablaSistema[this.filaSel2].esMetrado = 0;
  //             this.tablaSistema[this.filaSel2].tieneAceros = 0;
  //             this.tablaSistema[this.filaSel2].tieneSubmetrado = 0;
  //             if (
  //               anterior.antExistente.esMetrado &&
  //               !anterior.antExistente.estitulo
  //             ) {
  //               this.tablaSistema[anterior.index].tieneSubmetrado = 1;
  //               this.tablaSistema[anterior.index].tieneAceros = 0;
  //             } else {
  //             }
  //           } else {
  //             this.toaster.error('No se puede bajar de nivel', 'Error', {
  //               closeButton: false,
  //               positionClass: 'toast-bottom-right',
  //               timeOut: 2000,
  //             });
  //             return;
  //           }
  //         } else if (
  //           this.metradoSeleccionado.esMetrado &&
  //           this.metradoSeleccionado.estitulo == 1
  //         ) {
  //           this.tablaSistema[this.filaSel2].estitulo = 0;
  //           this.tablaSistema[this.filaSel2].esMetrado = 1;
  //           this.tablaSistema[this.filaSel2].tieneAceros = 0;
  //           this.tablaSistema[this.filaSel2].tieneSubmetrado = 0;
  //         } else {
  //           return;
  //         }

  //         await this.actualizarTablaCompleta();
  //         await this.calculoMontosSistema();
  //         this.guardarTablaTemporal('volverSubmetrado');
  //         this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //       } else {
  //         this.toaster.error('Fila seleccionada no valida', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //       }
  //     } else {
  //       if (
  //         this.aceroSeleccionado &&
  //         this.aceroSeleccionado.id_metrado !== null
  //       ) {
  //         const sgte = await this.sgteValido(this.filaSel3 + 1, 'tablaAceros');
  //         const anterior = await this.anteValido(
  //           this.filaSel3 - 1,
  //           'tablaAceros'
  //         );
  //         if (
  //           !this.aceroSeleccionado.esMetrado &&
  //           !this.aceroSeleccionado.estitulo
  //         ) {
  //           this.tablaAceros[this.filaSel3].estitulo = 2;
  //           this.tablaAceros[this.filaSel3].esMetrado = 0;
  //           this.tablaAceros[this.filaSel3].tieneSubmetrado = 0;
  //           if (anterior.index !== null) {
  //             if (
  //               anterior.antExistente.esMetrado &&
  //               !anterior.antExistente.estitulo &&
  //               (sgte?.sgteExistente?.esMetrado ||
  //                 sgte?.sgteExistente?.estitulo)
  //             ) {
  //               this.tablaAceros[anterior.index].tieneSubmetrado = 0;
  //             } else if (
  //               (anterior.antExistente.esMetrado &&
  //                 !anterior.antExistente.estitulo &&
  //                 !sgte?.sgteExistente?.esMetrado) ||
  //               !sgte?.sgteExistente?.estitulo
  //             ) {
  //               this.tablaAceros[anterior.index].tieneSubmetrado = 1;
  //             }
  //           }
  //         } else if (
  //           this.aceroSeleccionado.esMetrado &&
  //           !this.aceroSeleccionado.estitulo
  //         ) {
  //           if (anterior.index !== null) {
  //             this.tablaAceros[this.filaSel3].estitulo = 0;
  //             this.tablaAceros[this.filaSel3].esMetrado = 0;
  //             this.tablaAceros[this.filaSel3].tieneSubmetrado = 0;
  //             if (
  //               anterior.antExistente.esMetrado &&
  //               !anterior.antExistente.estitulo
  //             ) {
  //               this.tablaAceros[anterior.index].tieneSubmetrado = 1;
  //             } else {
  //               // this.toaster.error('No se puede convertir a submetrado', 'Error', {
  //               //   closeButton: false,
  //               //   positionClass: 'toast-bottom-right',
  //               //   timeOut: 2000,
  //               // });
  //               // return
  //             }
  //           } else {
  //             this.toaster.error('No se puede bajar de nivel', 'Error', {
  //               closeButton: false,
  //               positionClass: 'toast-bottom-right',
  //               timeOut: 2000,
  //             });
  //             return;
  //           }
  //         } else if (
  //           this.aceroSeleccionado.esMetrado &&
  //           this.aceroSeleccionado.estitulo == 1
  //         ) {
  //           this.tablaAceros[this.filaSel3].estitulo = 0;
  //           this.tablaAceros[this.filaSel3].esMetrado = 1;
  //           this.tablaAceros[this.filaSel3].tieneSubmetrado = 0;
  //         } else {
  //           return;
  //         }
  //         await this.actualizarTablaCompletaAceros();
  //         await this.calcularMontosAceros();
  //         this.guardarTablaTemporal('volverSubmetrado');
  //       } else {
  //         this.toaster.error('Fila seleccionada no valida', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //       }
  //     }
  //   } else {
  //     let tipoTabla = !this.tablaSeleccionada ? 'tablaSistema' : 'tablaAceros';
  //     const filtrados = await this[tipoTabla].filter((ele) => ele.editarCopiar);
  //     if (filtrados.length) {
  //       let titulos = 0;
  //       let metrados = 0;
  //       let submetrados = 0;
  //       let textos = 0;
  //       await filtrados.map((ele) => {
  //         if (!ele.esMetrado && ele.id_metrado !== null) {
  //           submetrados++;
  //         } else if (
  //           ele.esMetrado &&
  //           ele.estitulo !== 1 &&
  //           ele.id_metrado !== null
  //         ) {
  //           metrados++;
  //         } else if (ele.estitulo == 1 && ele.id_metrado !== null) {
  //           titulos++;
  //         } else if (ele.estitulo == 2 && ele.id_metrado !== null) {
  //           textos++;
  //         }
  //       });

  //       if (metrados > 0 && !titulos && !submetrados && !textos) {
  //         for (const iterator of filtrados) {
  //           iterator.esMetrado = 0;
  //           iterator.estitulo = 0;
  //           iterator.tieneSubmetrados = 0;
  //         }
  //       } else if (!metrados && titulos > 0 && !submetrados && !textos) {
  //         for (const iterator of filtrados) {
  //           iterator.esMetrado = 1;
  //           iterator.estitulo = 0;
  //           iterator.tieneSubmetrados = 0;
  //         }
  //       } else if (!metrados && !titulos && submetrados > 0 && !textos) {
  //         for (const iterator of filtrados) {
  //           iterator.esMetrado = 0;
  //           iterator.estitulo = 2;
  //           iterator.tieneSubmetrados = 0;
  //         }
  //       } else if (!metrados && !titulos && submetrados > 0 && !textos) {
  //         this.toaster.error('Texto es el mínimo nivel', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         this.toaster.error(
  //           'No se puede convertir elementos de diferentes tipos',
  //           'Error',
  //           {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 2000,
  //           }
  //         );
  //         return;
  //       }
  //       if (tipoTabla == 'tablaSistema') {
  //         await this.actualizarTablaCompleta();
  //         await this.calculoMontosSistema();
  //       } else {
  //         await this.actualizarTablaCompletaAceros();
  //         await this.calcularMontosAceros();
  //       }
  //       this.guardarTablaTemporal('volverSubmetrado');
  //       this.habilitadoCopiar = false;
  //     }
  //   }
  // }

  // @HostListener('document:keydown.control.m', ['$event'])
  // async atajoTitulo(e: KeyboardEvent) {
  //   await this.convertirFilaATitulo();
  // }

  // @HostListener('document:keydown.control.v', ['$event'])
  // async copiadoPapelera(e) {
  //   if (!this.partidaSeleccionada?.unidad) {
  //     return;
  //   }
  //   if (this.tablaSeleccionada) {
  //     this.toaster.error(
  //       'No se puede pegar con esta accion en la tabla de aceros',
  //       'Error',
  //       {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       }
  //     );
  //     return;
  //   }
  //   this.copiadoActivo = true;
  //   if (this.filaSel2 == -1) {
  //     this.toaster.error(
  //       'Seleccione una fila de la tabla hoja de metrado para pegar',
  //       'Error',
  //       {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       }
  //     );
  //     return;
  //   }
  //   const text = await navigator.clipboard
  //     ?.readText()
  //     ?.then((copiedText) => {
  //       return copiedText;
  //     })
  //     .catch((e) => {
  //       return null;
  //     });
  //   // const text = await navigator.clipboard?.readText()?.then(ele => { return ele }).catch(e => { return null });
  //   if (text == null || text == undefined) {
  //     setTimeout(async () => {
  //       this.mostrar_carga_todo = true;
  //       const input = document.getElementById('copiado');
  //       input.blur();
  //       var c = (<HTMLInputElement>document.getElementById('copiado')).value;

  //       const paracopiar = JSON.parse(JSON.stringify(c));
  //       if (!this.opcionHabilitarSistema) {
  //         await this.textoCopSplit(paracopiar, true);
  //         this.copiadoActivo = false;
  //       } else {
  //         // this.copiadoActivo = true
  //         this.mostrar_carga_todo = false;
  //       }
  //     }, 50);
  //   } else {
  //     this.copiadoActivo = false;
  //     await this.textoCopSplit(text, false);
  //   }
  // }

  // async textoCopSplit(text, tipo = false) {
  //   try {
  //     let opciones = [];
  //     let opcion = null;
  //     const met = JSON.parse(JSON.stringify(this.metradoSeleccionado));
  //     const array = [
  //       'descripcion',
  //       'cantidad',
  //       'n_veces',
  //       'largo',
  //       'ancho',
  //       'altura',
  //     ];
  //     if (!this.seleccionCelda) {
  //       if (this.metradoSeleccionado.id_metrado !== null) {
  //         if (this.metradoSeleccionado.esMetrado == 1) {
  //           opciones = [
  //             'Bajo la agrupacion seleccionada',
  //             'Reemplazar seleccionado',
  //           ];
  //         } else {
  //           opciones = ['Bajo la agrupacion seleccionada'];
  //         }
  //         const sw = await SwalService.optionokcancel(
  //           opciones,
  //           'Opción pegado',
  //           '0'
  //         );
  //         if (sw !== undefined) {
  //           opcion = Number(sw);
  //         } else {
  //           this.valorCopiado = null;
  //           return;
  //         }
  //       } else {
  //         opcion = 0;
  //       }
  //     } else {
  //       opcion = Number(this.tipoCopiado);
  //     }

  //     let arrayStructura = [];
  //     let completo = [];
  //     const celda = this.seleccionCelda
  //       ? this.celdaInicio
  //       : this.opcionHabilitarSistema;
  //     const idx = array.indexOf(celda);
  //     const arrayValidos = array.slice(idx == -1 ? 0 : idx, array.length);
  //     if (tipo) {
  //       const a = text.split(/(\n\r|\n|\r)/gm);
  //       const splitText = text.split('\n');
  //       splitText.map((ele) => {
  //         if (ele !== '') {
  //           const sp = ele.split('\t');
  //           completo.push(sp);
  //         }
  //       });
  //     } else {
  //       completo = text.split('	');
  //     }

  //     for (const iterator of completo) {
  //       var fila = {};
  //       let i = 0;
  //       for (const key of arrayValidos) {
  //         fila[key] = iterator[i];
  //         i++;
  //       }
  //       arrayStructura.push(fila);
  //     }

  //     let indice = null;
  //     const valido = await this.sgteValido(this.filaSel2 + 1, 'tablaSistema');
  //     if (opcion) {
  //       indice = JSON.parse(JSON.stringify(this.filaSel2));
  //     } else {
  //       //bajo la seleccion
  //       if (valido.index !== null) {
  //         let inicio = this.filaSel2 !== -1 ? this.filaSel2 : 0;
  //         if (this.metradoSeleccionado.id_metrado == null) {
  //           inicio = JSON.parse(JSON.stringify(this.filaSel2));
  //         }
  //         for (let i = inicio + 1; i < this.tablaSistema.length; i++) {
  //           let row = this.tablaSistema[i];
  //           if ((row.id_metrado !== null && row.esMetrado) || row.estitulo) {
  //             if (indice == null) {
  //               indice = i;
  //             }
  //             break;
  //           } else if (
  //             row.id_metrado !== null &&
  //             !row.esMetrado &&
  //             !row.estitulo
  //           ) {
  //             indice = i + 1;
  //           } else if (row.id_metrado == null && indice == null) {
  //             indice = i;
  //           }
  //         }
  //       } else {
  //         indice = JSON.parse(JSON.stringify(this.filaSel2));
  //       }
  //     }
  //     // let arrayMetrados: Metrado[] = []

  //     let k = 0;
  //     for (const row of arrayStructura) {
  //       let metrado = null;
  //       if (opcion) {
  //         if (
  //           this.tablaSistema[indice + k] &&
  //           this.tablaSistema[indice + k]?.id_metrado !== null &&
  //           indice + k <= this.tablaSistema.length
  //         ) {
  //           metrado = JSON.parse(JSON.stringify(this.tablaSistema[indice + k]));
  //         } else {
  //           metrado = new metradoModelo(
  //             '',
  //             1,
  //             '',
  //             null,
  //             this.partidaSeleccionada.indice,
  //             this.idProyecto
  //           );
  //         }
  //         for (let key in row) {
  //           if (row[key] !== undefined) {
  //             metrado[key] = row[key];
  //           }
  //         }
  //         if (indice + k <= this.tablaSistema.length) {
  //           this.tablaSistema[indice + k] = metrado;
  //         } else {
  //           this.tablaSistema.push(metrado);
  //         }
  //       } else {
  //         metrado = new metradoModelo(
  //           '',
  //           1,
  //           '',
  //           null,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         let j = 0;
  //         for (let key in row) {
  //           if (row[key] !== undefined) {
  //             metrado[key] = row[key];
  //           }
  //         }
  //         if (indice + k <= this.tablaSistema.length) {
  //           this.tablaSistema.splice(indice + k, 0, metrado);
  //         } else {
  //           this.tablaSistema.push(metrado);
  //         }
  //       }
  //       k++;
  //     }
  //     await this.actualizarTablaCompleta();
  //     await this.calculoMontosSistema();
  //     // console.table(this.tablaSistema, ['id_metrado', 'esMetrado', 'descripcion', 'cantidad', 'n_veces', 'largo', 'ancho', 'altura']);
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('copiado');
  //     const input = document.getElementById('copiado');
  //     input.blur();
  //     this.valorCopiado = null;
  //     this.seleccionCelda = false;
  //     this.celdaInicio = null;
  //     this.tipoCopiado = 0;
  //     input.focus({
  //       preventScroll: true,
  //     });
  //     this.cancelarCopiadoExt();
  //     this.mostrar_carga_todo = false;
  //   } catch (e) {
  //     SwalService.error(e);
  //     this.mostrar_carga_todo = false;
  //     console.log(e);
  //   }
  // }

  // async opcionPegadoExterno(tipo) {
  //   this.tipoCopiado = tipo;
  //   this.seleccionCelda = true;
  //   this.toaster.info(
  //     'Seleccione una celda para realizar el pegado y despues pegue el contenido con "CTRL+V"',
  //     'Éxito',
  //     {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 6000,
  //     }
  //   );
  // }

  // cancelarCopiadoExt() {
  //   this.valorCopiado = null;
  //   this.seleccionCelda = false;
  //   this.celdaInicio = null;
  //   this.opcionHabilitarSistema = null;
  //   this.tipoCopiado = 0;
  //   const input = document.getElementById('copiado');
  //   input.focus({
  //     preventScroll: true,
  //   });
  // }

  // async copiadoCelda(text) {
  //   try {
  //     const met = JSON.parse(JSON.stringify(this.metradoSeleccionado));
  //     const array = [
  //       'descripcion',
  //       'cantidad',
  //       'n_veces',
  //       'largo',
  //       'ancho',
  //       'altura',
  //     ];
  //     const indice = array.indexOf(this.opcionHabilitarSistema);
  //     const arrayValidos = array.slice(indice, array.length);
  //     let arrayStructura = [];
  //     const split3 = text.split('\r\n');
  //     const split = split3[0].split(' ');
  //     const completo = split.map((ele) => ele.split('\t'));
  //     for (const iterator of completo) {
  //       var fila = {};
  //       let i = 0;
  //       for (const key of arrayValidos) {
  //         fila[key] = iterator[i];
  //         i++;
  //       }
  //       arrayStructura.push(fila);
  //     }
  //     let k = JSON.parse(JSON.stringify(this.filaSel2));
  //     for (const iterator of arrayStructura) {
  //       if (k < this.tablaSistema.length) {
  //         let row = this.tablaSistema[k];
  //         for (let key in iterator) {
  //           row[key] = iterator[key];
  //         }
  //         if (row.id_metrado == null) {
  //           row.esMetrado = 1;
  //           row.item = '';
  //           row.indice = this.partidaSeleccionada.indice;
  //           row.id_proyecto = this.idProyecto;
  //         }
  //       } else {
  //       }
  //       k++;
  //     }
  //     await this.actualizarTablaCompleta();
  //     await this.calculoMontosSistema();
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('copiado');
  //     const input = document.getElementById('copiado');
  //     input.blur();
  //     this.valorCopiado = null;
  //     input.focus({
  //       preventScroll: true,
  //     });
  //   } catch (e) {
  //     SwalService.error(e);
  //     this.mostrar_carga_todo = false;
  //     console.log(e);
  //   }
  // }

  // ngAfterViewInit() {}

  // quitarfoco(element: any) {
  //   if (element?.target) {
  //     element.target.blur();
  //     element.target.parentElement.blur();
  //   }
  // }

  // setStatus(event: MouseEvent, status: number) {
  //   if (status === 1) {
  //     event.stopPropagation();
  //   }
  //   this.status = status;
  // }

  // private resize() {
  //   if (this.resizeCondMeet()) {
  //     this.width = Number(this.mouse.x > this.boxPosition.left)
  //       ? this.mouse.x - this.boxPosition.left
  //       : 0;
  //     if (this.box2) {
  //       const hBotones = this.box2.nativeElement.offsetHeight;
  //       if (this.hBotones !== hBotones) {
  //         this.hBotones = hBotones;
  //       }
  //     }
  //     if (this.box3) {
  //       const hBotones2 = this.box3.nativeElement.offsetHeight;
  //       if (this.hBotones2 !== hBotones2) {
  //         this.hBotones2 = hBotones2;
  //       }
  //     }
  //   }
  // }

  // private resizeCondMeet() {
  //   const right = this.containerPos?.left + 70;
  //   return (
  //     this.mouse.x > right &&
  //     this.mouse.x < this.tamanioPantalla &&
  //     this.mouse.y < this.containerPos.bottom
  //   );
  // }

  // private loadBox() {
  //   if (!this.box) {
  //     return;
  //   }
  //   const { left, top } = this.box.nativeElement.getBoundingClientRect();
  //   this.boxPosition = { left, top };
  // }

  // private loadContainer() {
  //   if (!this.boxPosition) {
  //     return;
  //   }
  //   const left = this.boxPosition.left - this.left;
  //   const top = this.boxPosition.top - this.top;
  //   const right = left + 800;
  //   const bottom = top + 800;
  //   this.containerPos = { left, top, right, bottom };
  // }

  // pintar() {
  //   this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
  //   this.titulo1color = this.aspectos.colorPresupuesto.split('|');
  //   this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  // }

  // async convertirASubmetrado(tabla, ind) {
  //   this[tabla][ind].esMetrado = 0;
  //   this[tabla][ind].estitulo = 0;
  //   this[tabla][ind].tieneSubmetrado = 0;
  //   if (tabla == 'tablaSistema') {
  //     this[tabla][ind].tieneAceros = 0;
  //   }
  // }

  // //Principal
  // async listarPesosPorUsuario() {
  //   const obj = {
  //     id_usuario: this.id_usuario,
  //     estado: 1,
  //   };
  //   const response = await this.metradoService.listarPesosComerciales(obj);
  //   if (response.length) {
  //     for (const ele of response) {
  //       ele.medida =
  //         ele.medida +
  //         (ele.tipoacero
  //           ? ele.tipoacero == 'CORRUGADO'
  //             ? '(C)'
  //             : '(L)'
  //           : '(C)');
  //     }

  //     this.listaPesos = response;
  //   } else {
  //     this.listaPesos = [];
  //   }
  // }

  // async listarTitulos() {
  //   try {
  //     this.dataTitulos = [];
  //     this.listaTitulos = [];
  //     this.buscando = true;
  //     this.tablaExcelAdjunta = [];
  //     this.indiceTitulo = null;
  //     this.dataTitulo = null;
  //     const sinGuardar = await this.listarTablaTemporal();
  //     if (!sinGuardar) {
  //       const obj = {
  //         id_proyecto: this.idProyecto,
  //       };
  //       const response = await this.metradoService.listarTitulosDeMetrados(obj);
  //       await response.sort((a, b) => a.item - b.item);
  //       this.listaTitulos = response.length ? response : [];
  //       for await (let titulo of this.listaTitulos) {
  //         if (!titulo.tipo_registro) {
  //           titulo.tipo_registro = 0;
  //         }
  //         if (titulo.estado_metrado == null) {
  //           titulo.estado_metrado = 0;
  //         }
  //         let editable = false;
  //         if (this.permisoGeneral) {
  //           editable = true;
  //         } else {
  //           const existe = await this.permisos.find(
  //             (ele) => ele.ind == titulo.indice
  //           );

  //           if (existe) {
  //             editable = existe?.edit == 1 ? true : false;
  //           }
  //         }

  //         if (titulo.tipo_registro == 0) {
  //           const tablaRecuperada = await this.cambioTitulo(titulo.item);
  //           const inicial = JSON.parse(JSON.stringify(tablaRecuperada));

  //           let obj = {
  //             data: tablaRecuperada,
  //             dataInicial: inicial,
  //             guardado: null,
  //             modificado: false,
  //             dataTitulo: titulo,
  //             tipo_registro: 0,
  //             dataHeader: null,
  //             dataExcel: [],
  //             excel_diferente: false,
  //             vinculado: false,
  //             editable: editable,
  //           };
  //           const res = await this.verificarVinculado(obj);
  //           titulo.vinculado = res;
  //           this.dataTitulos.push(obj);
  //         } else {
  //           let header = null;
  //           let body = [];
  //           const tablaRecuperada = await this.cambioTitulo(titulo.item);
  //           let inicial = JSON.parse(JSON.stringify(tablaRecuperada));
  //           const response = await this.listarTablaExcel(titulo.indice);
  //           if (response) {
  //             if (response[1]) {
  //               header = await this.estructurarHeader(response[1][0]);
  //             }
  //             if (response[0]) {
  //               for (let iterator of response[0]) {
  //                 iterator.seleccionado = false;
  //                 iterator.filaModificada = iterator.filaModificada
  //                   ? true
  //                   : false;
  //                 if (iterator.tipo == 0) {
  //                   iterator.nivel =
  //                     iterator.nivel == null ? 3 : Number(iterator.nivel);
  //                 }
  //                 iterator.icomost = 1;
  //                 iterator.mostrar = 1;
  //                 let encontrado = await inicial.find(
  //                   (ele) => ele.indice == iterator.indice_fila
  //                 );
  //                 if (!encontrado) {
  //                   // encontrado.vinculado = 0; ///ERRor
  //                   iterator.pintar = 1;
  //                 } else {
  //                   if (iterator.item) {
  //                     if (iterator.unidad) {
  //                       if (
  //                         Number(encontrado.cantidad) !==
  //                         Number(iterator.mtotal)
  //                       ) {
  //                         iterator.pintar = 2;
  //                         encontrado.vinculado = 0;
  //                       } else {
  //                         iterator.pintar = null;
  //                         encontrado.vinculado = 1;
  //                       }
  //                     }

  //                     if (
  //                       iterator.item !== encontrado.item ||
  //                       iterator.descripcion !== encontrado.descripcion
  //                     ) {
  //                       iterator.pintar = 1;
  //                       encontrado.vinculado = 0;
  //                     }
  //                   } else {
  //                   }
  //                 }
  //               }
  //               body = response[0];
  //             }
  //           }
  //           let obj = {
  //             data: tablaRecuperada,
  //             dataInicial: inicial,
  //             guardado: null,
  //             modificado: false,
  //             dataTitulo: titulo,
  //             tipo_registro: 1,
  //             dataHeader: header,
  //             dataExcel: body,
  //             excel_diferente: false,
  //             vinculado: false,
  //             editable: editable,
  //           };
  //           await this.actualizarPorcentajeExcel(obj);
  //           const res = await this.verificarVinculado(obj);
  //           titulo.vinculado = res;
  //           this.dataTitulos.push(obj);
  //         }
  //       }
  //     } else {
  //       this.listaTitulos = sinGuardar.map((ele) => {
  //         return ele.dataTitulo;
  //       });
  //       for (const titulo of sinGuardar) {
  //         if (titulo.tipo_registro == 1) {
  //           let header = null;
  //           let body = [];
  //           const response = await this.listarTablaExcel(
  //             titulo.dataTitulo.indice
  //           );
  //           const tablaRecuperada = await this.cambioTitulo(
  //             titulo.dataTitulo.item
  //           );
  //           if (response) {
  //             if (response[1]) {
  //               header = await this.estructurarHeader(response[1][0]);
  //             }
  //             if (response[0]) {
  //               for (let iterator of response[0]) {
  //                 let encontrado = await tablaRecuperada.find(
  //                   (ele) => ele.indice == iterator.indice_fila
  //                 );
  //                 if (!encontrado) {
  //                   // encontrado.vinculado = 0;
  //                   iterator.pintar = 1;
  //                 } else {
  //                   if (iterator.item) {
  //                     if (iterator.unidad) {
  //                       if (
  //                         Number(encontrado.cantidad) !==
  //                         Number(iterator.mtotal)
  //                       ) {
  //                         iterator.pintar = 2;
  //                         encontrado.vinculado = 0;
  //                       } else {
  //                         iterator.pintar = null;
  //                         encontrado.vinculado = 1;
  //                       }
  //                     }
  //                     if (
  //                       iterator.item !== encontrado.item ||
  //                       iterator.descripcion !== encontrado.descripcion
  //                     ) {
  //                       iterator.pintar = 1;
  //                       if (iterator.unidad) {
  //                         encontrado.vinculado = 0;
  //                       }
  //                     }
  //                   }
  //                 }
  //                 iterator.seleccionado = false;
  //                 iterator.filaModificada = iterator.filaModificada
  //                   ? true
  //                   : false;
  //                 if (iterator.tipo == 0) {
  //                   iterator.nivel =
  //                     iterator.nivel == null ? 3 : Number(iterator.nivel);
  //                 }
  //                 iterator.icomost = 1;
  //                 iterator.mostrar = 1;
  //               }
  //               body = response[0];
  //             }
  //           }
  //           titulo.dataExcel = body;
  //           titulo.data = tablaRecuperada;
  //           titulo.dataInicial = tablaRecuperada;
  //         }

  //         let editable = false;
  //         if (this.permisoGeneral) {
  //           editable = true;
  //         } else {
  //           const existe = await this.permisos.find(
  //             (ele) => ele.ind == titulo.dataTitulo.indice
  //           );
  //           editable = existe?.edit == 1 ? true : false;
  //         }
  //         titulo.editable = editable;
  //       }
  //       this.dataTitulos = sinGuardar;
  //       this.existetemp = true;
  //     }
  //     if (this.dataTitulos.length) {
  //       // for (const titulo of this.dataTitulos) {
  //       //   const res = await this.verificarVinculado(titulo);
  //       //   console.log('res', res)
  //       //   titulo.dataTitulo.vinculado = res
  //       //   console.log('titulo', titulo)
  //       // }
  //       this.dataTitulo = this.dataTitulos[0].dataTitulo;
  //       if (this.dataVer) {
  //         this.indiceTitulo = this.dataVer.indice;
  //       } else {
  //         this.indiceTitulo = this.dataTitulos[0].dataTitulo.indice;
  //       }
  //       await this.cambiarTitulo(true);
  //     }
  //     this.buscando = false;
  //   } catch (e) {
  //     this.buscando = false;
  //     console.log(e);
  //     SwalService.error();
  //   }
  // }

  // async verificarVinculado(titulo) {
  //   let vinculado = true;
  //   let existeRegistro = false;
  //   if (titulo.tipo_registro == 0) {
  //     for (const row of titulo.data) {
  //       if (row.unidad) {
  //         if (
  //           row.ed_pre == 0 &&
  //           Number(row.cantidad) !== Number(row.cant_metrado)
  //         ) {
  //           vinculado = false;
  //           break;
  //         }
  //         if (Number(row.cant_metrado) !== 0) {
  //           existeRegistro = true;
  //         }
  //       }
  //     }
  //     // if (vinculado && existeRegistro) {
  //     //   console.log('fuera')
  //     //   vinculado = false
  //     // }
  //     if (!titulo.data.length) {
  //       vinculado = true;
  //     }
  //   } else {
  //     for (const row of titulo.dataExcel) {
  //       if (row.unidad) {
  //         const encontrado = await titulo.data.find(
  //           (ele) =>
  //             ele.indice == row.indice_fila &&
  //             Number(ele.cantidad) === Number(row.mtotal)
  //         );

  //         if (!encontrado) {
  //           vinculado = false;
  //           break;
  //         }
  //       }
  //     }
  //     if (!titulo.dataExcel.length) {
  //       vinculado = true;
  //     }
  //   }
  //   return vinculado;
  // }

  // async permisosUsuario() {
  //   const datoaccs = await this.principalService.ConfgsAsignaUserProy({
  //     id_proyecto: this.idProyecto,
  //     id_usuario: this.id_usuario,
  //   });
  //   if (datoaccs.length) {
  //     const titmetra = datoaccs[0].titmetra
  //       ? JSON.parse(datoaccs[0].titmetra)
  //       : [];
  //     if (titmetra.length) {
  //       this.permisos = titmetra;
  //     }
  //   } else {
  //     this.permisoGeneral = true;
  //   }
  // }

  // async cambiarTitulo(inicio = false) {
  //   if (!inicio) {
  //     this.mostrar_carga_todo = true;
  //   }
  //   this.noConsistente = false;
  //   this.noConsistente2 = false;
  //   this.vinculadoExcel = true;
  //   this.faltantesPresupuesto = [];
  //   const existeEstilos = await this.dataTitulos.find((ele) => {
  //     if (ele?.data[0]?.estilo) {
  //       return ele;
  //     }
  //   });
  //   if (!existeEstilos) {
  //     this.stilosTit = {
  //       color: '',
  //       alineamiento: 'left',
  //       tipo: '',
  //       size: '10',
  //     };
  //     this.stilosMet = {
  //       color: '',
  //       alineamiento: 'left',
  //       tipo: '',
  //       size: '10',
  //     };
  //     this.stilosSubM = {
  //       color: '',
  //       alineamiento: 'left',
  //       tipo: '',
  //       size: '10',
  //     };
  //     this.stilosTexto = {
  //       color: '',
  //       alineamiento: 'left',
  //       tipo: '',
  //       size: '10',
  //     };
  //   } else {
  //     if (existeEstilos.tipo_registro == 1) {
  //       var array = JSON.parse(existeEstilos.data[0].estilo);
  //     } else {
  //       array = JSON.parse(existeEstilos.data[0].estilo);
  //     }
  //     this.stilosTit = array[0]
  //       ? array[0]
  //       : { color: '', alineamiento: 'left', tipo: '', size: '10' };
  //     this.stilosMet = array[1]
  //       ? array[1]
  //       : { color: '', alineamiento: 'left', tipo: '', size: '10' };
  //     this.stilosSubM = array[2]
  //       ? array[2]
  //       : { color: '', alineamiento: 'left', tipo: '', size: '10' };
  //     this.stilosTexto = array[3]
  //       ? array[3]
  //       : { color: '', alineamiento: 'left', tipo: '', size: '10' };
  //   }
  //   this.headerExcel = null;
  //   this.tablaExcelAdjunta = [];
  //   this.dataSource = [];

  //   const index = await this.dataTitulos.find(
  //     (ele) => ele.dataTitulo.indice == this.indiceTitulo
  //   );
  //   this.dataTitulo = index.dataTitulo;
  //   this.editable = index.editable;
  //   if (this.dataTitulo.tipo_registro == 0) {
  //     this.dataSource = index.data;
  //     for (let row of this.dataSource) {
  //       row.editarMetrado = 0;
  //     }
  //   } else {
  //     this.headerExcel = index.dataHeader;
  //     this.tablaExcelAdjunta = index.dataExcel.length ? index.dataExcel : [];
  //     this.dataSource = index.data;
  //     for (const rowT of index.data) {
  //       const encontrado = index.dataExcel.find(
  //         (ele) =>
  //           ele.item === rowT.item && rowT.descripcion === ele.descripcion
  //       );
  //       if (!encontrado) {
  //         this.noConsistente2 = true;
  //         this.faltantesPresupuesto.push(rowT.item + '-' + rowT.descripcion);
  //       }
  //     }
  //     for (const iterator of this.tablaExcelAdjunta) {
  //       if (iterator.pintar == 2) {
  //         this.vinculadoExcel = false;
  //       }
  //       if (iterator.pintar == 1) {
  //         this.noConsistente = true;
  //         break;
  //       }
  //     }
  //   }
  //   this.habilitarMultipleSelect = false;
  //   this.bloquearBotones = false;
  //   this.tablaSeleccionada = null;
  //   this.filaSel2 = -1;
  //   this.filaSel3 = -1;
  //   this.filaSel = null;
  //   this.partidaSeleccionada = null;
  //   this.metradoSeleccionado = null;
  //   this.mostrarColrs = false;
  //   this.tempFormula = [];
  //   this.aceroSeleccionado = null;
  //   this.posicionCursor = null;
  //   this.ocultarChecks = null;
  //   this.opcionHabilitarSistema = null;
  //   this.opcionHabilitarAceros = null;
  //   this.iniciado = false;
  //   this.habilitadoCopiar = false;
  //   this.tablaAceros = [];
  //   this.tablaSistema = [];
  //   this.fueradeTabla();

  //   if (inicio) {
  //     await this.actualizarDataPrincipal();
  //   }
  //   if (!inicio) {
  //     this.mostrar_carga_todo = false;
  //   }
  // }

  // async cambioTitulo(itemBuscar) {
  //   this.indexTablaExcel = null;
  //   let array = [];
  //   this.dataSource = [];
  //   this.buscando = true;
  //   let titulos = [];
  //   const obj = {
  //     id_proyecto: this.idProyecto,
  //     item: itemBuscar + '.',
  //   };
  //   const response = await this.metradoService.listarTablaDeMetradoXTitulo(obj);
  //   array = response.length ? response : [];
  //   for await (let ele of array) {
  //     if (ele.metrado == null) {
  //       ele.metrado = this.formsService.redondeo(0, this.dec_metrado);
  //     }
  //     ele.metrado = this.formsService.redondeo(
  //       Number(ele.metrado),
  //       this.dec_metrado
  //     );
  //     if (ele.cantidad == null) {
  //       ele.cantidad = this.formsService.redondeo(0, this.dec_metrado);
  //     }

  //     if (ele.ed_pre == 1) {
  //       ele.cant_metrado = this.formsService.redondeo(
  //         ele.cantidad,
  //         this.dec_metrado
  //       );
  //     } else {
  //       if (ele.cant_metrado == null) {
  //         ele.cant_metrado = this.formsService.redondeo(
  //           JSON.parse(JSON.stringify(ele.cantidad)),
  //           this.dec_metrado
  //         );
  //       }
  //     }
  //     ele.cant_metrado = this.formsService.redondeo(
  //       Number(ele.cant_metrado),
  //       this.dec_metrado
  //     );
  //     if (ele.plantilla == null) {
  //       ele.plantilla = 0;
  //     }
  //     if (ele.metrado_valido == null) {
  //       ele.metrado_valido = 0;
  //     }
  //     ele.permitirCambio = 1;
  //     ele.detalleMetrado = [];
  //     ele.editarMetrado = 0;
  //     ele.tablaInicialSistema = [];
  //     ele.tablaInicialAcero = [];
  //     ele.detalleAcero = [];
  //     ele.editadoMetrado = 0;
  //     ele.totalAceros = this.formsService.redondeo(0, this.dec_metrado);
  //     if (!ele.unidad) {
  //       titulos.push(ele.ind);
  //     } else {
  //       ele.parcial = ele.precio * Number(ele.cant_metrado);
  //     }
  //   }
  //   titulos.reverse();
  //   for (const indice of titulos) {
  //     array[indice].parcial = await this.updateTitulo(indice, array);
  //   }
  //   return array;
  // }

  // async updateTitulo(indice, tabla) {
  //   const arrayItem = tabla[indice].item.split('.');
  //   const encontrados = await tabla.filter((ele) => {
  //     const arrayItem2 = ele.item.split('.');
  //     arrayItem2.pop();
  //     if (arrayItem.join('.') == arrayItem2.join('.')) {
  //       return ele;
  //     }
  //   });

  //   let sumaGrupo = 0;
  //   if (encontrados.length) {
  //     encontrados.map((ele, index) => {
  //       sumaGrupo = sumaGrupo + ele.parcial;
  //     });
  //   }
  //   return sumaGrupo;
  // }

  // async modalResumenTitulos() {
  //   try {
  //     const modalRef = this.modalService.open(
  //       ModalResumenProyectoMetradoComponent,
  //       {
  //         size: 'lg modalgrande',
  //         backdrop: 'static',
  //         windowClass: 'pcoded',
  //         keyboard: false,
  //       }
  //     );
  //     modalRef.componentInstance.id_usuario = this.id_usuario;
  //     modalRef.componentInstance.idProyecto = this.idProyecto;
  //     const result = await modalRef.result;
  //     if (result) {
  //       this.mostrar_carga_todo = true;
  //       await this.listarTitulos();
  //       this.mostrar_carga_todo = false;
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // Expandetodo() {
  //   if (this.filaSel > -1) {
  //     let row = this.dataSource[this.filaSel];
  //     if (row.unidad == '') {
  //       let itemsel = row.item;
  //       row.icomost = 1;
  //       let nuevogru = false;
  //       for (let i = this.filaSel + 1; i < this.dataSource.length; i++) {
  //         if (this.dataSource[i].item != itemsel && !nuevogru) {
  //           var palabra = this.dataSource[i].item
  //             .toString()
  //             .substring(0, itemsel.toString().length + 1);
  //           if (palabra == itemsel + '.') {
  //             this.dataSource[i].mostrar = 1;
  //             this.dataSource[i].icomost = 1;
  //             this.dataSource[i].estmost = 1;
  //           } else {
  //             nuevogru = true;
  //           }
  //         } else {
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }

  // ContraeTodo() {
  //   if (this.filaSel > -1) {
  //     let row = this.dataSource[this.filaSel];
  //     if (row.unidad == '') {
  //       let inpri = this.filaSel;
  //       let itemsel = row.item;
  //       row.icomost = 1;
  //       let nuevogru = false;
  //       for (let i = inpri + 1; i < this.dataSource.length; i++) {
  //         if (this.dataSource[i].item != itemsel && !nuevogru) {
  //           var palabra = this.dataSource[i].item
  //             .toString()
  //             .substring(0, itemsel.toString().length + 1);
  //           if (palabra == itemsel + '.') {
  //             if (
  //               this.dataSource[i].item.split('.').length ==
  //               itemsel.split('.').length + 1
  //             ) {
  //               this.dataSource[i].mostrar = 1;
  //               this.dataSource[i].icomost = 0;
  //               this.dataSource[i].estmost = 1;
  //             } else {
  //               this.dataSource[i].mostrar = 0;
  //               this.dataSource[i].icomost = 0;
  //               this.dataSource[i].estmost = 0;
  //             }
  //           } else {
  //             nuevogru = true;
  //           }
  //         } else {
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }

  // maxtodo() {
  //   for (let row of this.dataSource) {
  //     if (row.item.split('.').length > 1) {
  //       row.mostrar = 1;
  //     }
  //     row.icomost = 1;
  //   }
  // }

  // mintodo() {
  //   for (let row of this.dataSource) {
  //     if (row.item.split('.').length > 1) {
  //       row.estmost = row.mostrar;
  //       row.mostrar = 0;
  //     } else {
  //       row.icomost = 0;
  //       row.mostrar = 1;
  //     }
  //   }
  // }

  // toggleOnpresu(itemsel, indice) {
  //   this.dataSource[indice].icomost = 1;
  //   let nuevogru = false;
  //   for (let i = indice + 1; i < this.dataSource.length; i++) {
  //     if (this.dataSource[i].item != itemsel && !nuevogru) {
  //       var palabra = this.dataSource[i].item
  //         .toString()
  //         .substring(0, itemsel.toString().length + 1);
  //       if (palabra == itemsel + '.') {
  //         if (
  //           itemsel.split('.').length + 1 ==
  //           this.dataSource[i].item.toString().split('.').length
  //         ) {
  //           this.dataSource[i].mostrar = 1;
  //         } else {
  //           this.dataSource[i].mostrar = this.dataSource[i].estmost;
  //         }
  //       } else {
  //         nuevogru = true;
  //       }
  //     } else {
  //       break;
  //     }
  //   }
  // }

  // toggleOffpresu(itemsel, indice) {
  //   this.dataSource[indice].icomost = 0;
  //   let ind2 = indice + 1;
  //   let nuevogru = false;
  //   for (let i = ind2; i < this.dataSource.length; i++) {
  //     if (this.dataSource[i].item != itemsel && !nuevogru) {
  //       var palabra = this.dataSource[i].item
  //         .toString()
  //         .substring(0, itemsel.toString().length + 1);
  //       if (palabra == itemsel + '.') {
  //         this.dataSource[i].estmost = this.dataSource[i].mostrar;
  //         this.dataSource[i].mostrar = 0;
  //       } else {
  //         nuevogru = true;
  //       }
  //     } else {
  //       break;
  //     }
  //   }
  // }

  // async vincularColumnaMetrados() {
  //   const temporal = await this.listarTablaTemporal();
  //   const temporalPresu = await this.verificarCambiosPresupuesto();
  //   if (!temporal && !temporalPresu.length) {
  //     const sw = await SwalService.confirm(
  //       'Estas seguro?',
  //       'Se guardara todos los cambios realizados y vinculará la columna metrado de todos los titulos mayores a  0 del proyecto a Presupuesto'
  //     );
  //     if (sw.isConfirmed) {
  //       this.mostrar_carga_todo = true;
  //       await this.guardarTablaCompleta(true);
  //       await this.vincularMetradoGeneral();
  //       await this.descartarTablaTemporal();
  //       // await this.listarTitulos();
  //       this.mostrar_carga_todo = false;
  //       this.verResumen.emit(1);
  //       this.toaster.success('Se vinculó correctamente', 'Éxito', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //       return;
  //     }
  //   } else {
  //     if (temporalPresu.length) {
  //       this.toaster.error(
  //         'Existen datos sin guardar en Edicion de presupuesto',
  //         'Error',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         }
  //       );
  //       return;
  //     } else {
  //       const sw = await SwalService.confirm(
  //         'Estas seguro?',
  //         'Se guardara todos los cambios realizados y vinculara la columna metrado de todos los titulos mayores a  0 del proyecto a Presupuesto'
  //       );
  //       if (sw.isConfirmed) {
  //         this.mostrar_carga_todo = true;
  //         await this.guardarTablaCompleta(true);
  //         await this.vincularMetradoGeneral();
  //         // this.dataTitulos = []
  //         await this.descartarTablaTemporal();
  //         // await this.listarTitulos();
  //         // this.onResize();
  //         this.mostrar_carga_todo = false;
  //         this.verResumen.emit(1);
  //         this.toaster.success('Se vinculó correctamente', 'Éxito', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         });
  //         return;
  //       }
  //     }
  //   }
  // }

  // async vincularMetradoGeneral() {
  //   try {
  //     const data = await this.metradoService.listarTablaMetradoXProyecto({
  //       id_proyecto: this.idProyecto,
  //     });
  //     let concatenado = [];
  //     let nuevo = [];
  //     let omitidos = [];
  //     for (const titulo of this.dataTitulos) {
  //       let omitir = false;
  //       if (titulo.editable) {
  //         if (titulo.tipo_registro == 1) {
  //           if (titulo.dataExcel.length) {
  //             for (const rowT of titulo.data) {
  //               const encontrado = titulo.dataExcel.find(
  //                 (ele) => ele.indice_fila == rowT.indice
  //               );

  //               if (!encontrado) {
  //                 omitir = true;
  //               }
  //             }
  //             if (!omitir) {
  //               for (const row of titulo.dataExcel) {
  //                 if (row.item && row.pintar) {
  //                   if (row.pintar == 1) {
  //                     nuevo = [];
  //                     this.toaster.warning(
  //                       titulo.dataTitulo.item +
  //                         ' ' +
  //                         titulo.dataTitulo.descripcion +
  //                         ' ,no se vinculo por diferencia de estructura',
  //                       'Advertencia',
  //                       {
  //                         closeButton: false,
  //                         positionClass: 'toast-bottom-right',
  //                         timeOut: 3000,
  //                       }
  //                     );
  //                     return;
  //                     break;
  //                   }
  //                   const encontrado = await titulo.data.find(
  //                     (ele) => ele.indice == row.indice_fila && ele.unidad
  //                   );
  //                   const obj = {
  //                     cant_metrado: encontrado.cantidad,
  //                     cantidad: encontrado.cantidad,
  //                     descripcion: encontrado.descripcion,
  //                     ed_pre: encontrado.ed_pre,
  //                     id_proyecto: encontrado.id_proyecto,
  //                     indice: encontrado.indice,
  //                     item: encontrado.item,
  //                     itemord: encontrado.itemord,
  //                     metrado: encontrado.metrado,
  //                     parcial: encontrado.parcial,
  //                     plantilla: encontrado.plantilla,
  //                     precio: encontrado.precio,
  //                     tipo_registro: encontrado.tipo_registro,
  //                     vinculado: 0, //CORREGIR PARA SOLO ENVIAR DIFERENTE NO TODOS
  //                     unidad: encontrado.unidad,
  //                   };
  //                   if (encontrado) {
  //                     obj.cant_metrado = parseFloat(row.mtotal);
  //                     obj.ed_pre = 0;
  //                   }
  //                   if (obj.cant_metrado >= 0) {
  //                     nuevo.push(obj);
  //                   }
  //                 }
  //                 row.pintar = null;
  //               }
  //               concatenado = concatenado.concat(nuevo);
  //             } else {
  //               omitidos.push(
  //                 titulo.dataTitulo.item + ' ' + titulo.dataTitulo.descripcion
  //               );
  //             }
  //           }
  //         } else {
  //           for (const iterator of titulo.dataInicial) {
  //             if (
  //               iterator.unidad &&
  //               iterator.ed_pre == 0 &&
  //               Number(iterator.cant_metrado) > 0 &&
  //               Number(iterator.cant_metrado) !== Number(iterator.cantidad)
  //             ) {
  //               concatenado.push(iterator);
  //             } else {
  //             }
  //           }
  //         }
  //       }
  //     }

  //     const datos1 = JSON.stringify(concatenado);
  //     const obj = JSON.stringify({
  //       id_proyecto: this.idProyecto,
  //       datos1: datos1,
  //     });
  //     const response = await this.metradoService.vincularMetradoAPresupuesto(
  //       obj
  //     );
  //     if (omitidos.length) {
  //       this.toaster.warning(
  //         ' No se vinculo por diferencia de estructura :<br>' +
  //           omitidos.join(' <br>'),
  //         'Advertencia',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           enableHtml: true,
  //           timeOut: 7000,
  //         }
  //       );
  //     }
  //   } catch (e) {
  //     this.mostrar_carga_todo = false;
  //     SwalService.error();
  //     console.log(e);
  //   }
  // }

  // async verificarCambiosPresupuesto() {
  //   let presutemp = await this.presuservice.ExistePresuTemp({
  //     id_proyecto: this.idProyecto,
  //     id_usuario: this.id_usuario,
  //   });
  //   return presutemp;
  // }

  // async vincularHojasMetradoAMetrado() {
  //   if (this.dataTitulo) {
  //     const sw = await SwalService.confirm(
  //       'Estas seguro?',
  //       null,
  //       'Se vinculara el monto de hojas metrado de todas las partidas relacionadas al titulo : <br><strong>' +
  //         this.dataTitulo?.item +
  //         ' - ' +
  //         this.dataTitulo?.descripcion +
  //         '<strong>'
  //     );
  //     if (sw.isConfirmed) {
  //       this.mostrar_carga_todo = true;
  //       for (let row of this.dataSource) {
  //         if (row.unidad && Number(row.cant_metrado) !== Number(row.metrado)) {
  //           row.cant_metrado = this.formsService.redondeo(
  //             Number(row.metrado),
  //             this.dec_metrado
  //           );
  //           row.editadoMetrado = 1;
  //           row.vinculado = 0;
  //           row.ed_pre = 0;
  //           await this.calcularMontosRowPrincipal(row.ind);
  //           await this.actuaTitulos(row.ind);
  //         }
  //       }
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       await this.guardarTablaTemporal('vincularHojasMetradoAMetrado');
  //       this.mostrar_carga_todo = false;
  //       this.toaster.success('Se  actualizó correctamente', 'Correcto', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //     }
  //   }
  // }

  // async edicionCeldaMetrado(partida, i) {
  //   if (this.solover || !this.editable) {
  //     return;
  //   }
  //   partida.unidad
  //     ? (this.dataSource[i].editarMetrado = 1)
  //     : (this.dataSource[i].editarMetrado = 0);
  // }

  // async actualizarTitulosSuperiores(ind) {
  //   let item = this.dataSource[ind].item;
  //   let spliteado = item.split('.');
  //   let titem = '';
  //   while (spliteado.length > 1) {
  //     let encontrados = [];
  //     spliteado.pop();
  //     titem = spliteado.join('.') + '.';
  //     encontrados = await this.dataSource.filter((ele) => {
  //       if (ele.item) {
  //         var split = ele.item.split('.');
  //         split.pop();
  //         if (split.join('.') + '.' == titem) {
  //           return ele;
  //         }
  //       }
  //     });
  //     let parcialTotal = 0;
  //     await encontrados.map(
  //       (ele) => (parcialTotal = ele.parcial + parcialTotal)
  //     );
  //     var elementoPadre = this.dataSource.find(
  //       (ele) => ele.item && spliteado.join('.') == ele.item
  //     );
  //     const redondeado = await this.formsService.redondeo(
  //       parcialTotal,
  //       this.dec_parcial
  //     );
  //     if (
  //       elementoPadre &&
  //       this.dataSource[elementoPadre.ind].parcial !== parseFloat(redondeado)
  //     ) {
  //       this.dataSource[elementoPadre.ind].parcial = parseFloat(redondeado);
  //       this.dataSource[elementoPadre.ind].editadoMetrado = 1;
  //     }
  //   }
  // }

  // async evaluarTextoMetrado(valor3, i) {
  //   if (valor3 == '' || valor3 == undefined || valor3 == null) {
  //     return;
  //   }
  //   this.filaSel2 = -1;
  //   this.filaSel3 = -1;
  //   this.dataSource[i].editarMetrado = 0;
  //   const valor = valor3.split(',').join('');
  //   // const valor = Number(valor2);
  //   if (
  //     valor !== this.dataSource[i].cant_metrado &&
  //     (valor !== null || !isNaN(valor))
  //   ) {
  //     this.dataSource[i].cant_metrado = this.formsService.redondeo(
  //       valor,
  //       this.dec_metrado
  //     );
  //     this.dataSource[i].editadoMetrado = 1;
  //     this.dataSource[i].ed_pre = 0;
  //     this.dataSource[i].vinculado = 0;
  //     await this.calcularMontosRowPrincipal();
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal(1);
  //   } else {
  //   }
  // }

  // async calcularMontosRowPrincipal(ind = this.filaSel) {
  //   const valorEditado = this.dataSource[ind].cant_metrado;
  //   const parcial = Number(valorEditado) * Number(this.dataSource[ind].precio);
  //   this.dataSource[ind].parcial = parcial;
  //   await this.actualizarTitulosSuperiores(ind);
  //   await this.actualizarDataPrincipal();
  //   this.calcularPorcentajeXTitulo(this.dataSource);
  // }

  // async moverAbajoTablaPrincipal(cantidad, indiceEdicion) {
  //   let cambio = 0;
  //   if (indiceEdicion + 1 < this.dataSource.length) {
  //     this.dataSource[indiceEdicion].editarMetrado = 0;
  //     if (
  //       cantidad !== '' &&
  //       cantidad !== undefined &&
  //       cantidad !== null &&
  //       cantidad.toString() !==
  //         this.dataSource[indiceEdicion].cant_metrado.toString()
  //     ) {
  //       const valor = cantidad.split(',').join('');
  //       // const valor = Number(valor2);
  //       this.dataSource[indiceEdicion].cant_metrado = valor;
  //       this.dataSource[indiceEdicion].editadoMetrado = 1;
  //       this.dataSource[indiceEdicion].vinculado = 0;
  //       this.dataSource[indiceEdicion].ed_pre = 0;
  //       const indice = await this.dataTitulos
  //         .map((ele) => ele.dataTitulo.indice)
  //         .indexOf(Number(this.indiceTitulo));
  //       await this.calcularMontosRowPrincipal(indiceEdicion);
  //       this.dataTitulos[indice].modificado = true;
  //       cambio = 1;
  //     }
  //     let sgteValido = null;
  //     let index = indiceEdicion + 1;
  //     while (!sgteValido) {
  //       if (this.dataSource[index].unidad) {
  //         sgteValido = true;
  //       } else {
  //         if (index < this.dataSource.length) {
  //           index++;
  //         } else {
  //           index = indiceEdicion;
  //           break;
  //         }
  //       }
  //     }
  //     if (index == null) {
  //       return;
  //     }
  //     this.dataSource[index].editarMetrado = 1;
  //     this.filaSel = index;
  //     if (cambio == 1) {
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal(3);
  //     }
  //   } else {
  //     return;
  //   }
  // }

  // async moverArribaTablaPrincipal(cantidad, indiceEdicion) {
  //   let cambio = 0;
  //   if (indiceEdicion > 1) {
  //     this.dataSource[indiceEdicion].editarMetrado = 0;
  //     if (
  //       cantidad !== '' &&
  //       cantidad !== undefined &&
  //       cantidad !== null &&
  //       cantidad.toString() !==
  //         this.dataSource[indiceEdicion].cant_metrado.toString()
  //     ) {
  //       const valor2 = cantidad.split(',').join('');
  //       const valor = Number(valor2);
  //       this.dataSource[indiceEdicion].cant_metrado =
  //         this.formsService.redondeo(valor, this.dec_metrado);
  //       this.dataSource[indiceEdicion].editadoMetrado = 1;
  //       this.dataSource[indiceEdicion].ed_pre = 0;
  //       this.dataSource[indiceEdicion].vinculado = 0;
  //       const indice = await this.dataTitulos
  //         .map((ele) => ele.dataTitulo.indice)
  //         .indexOf(Number(this.indiceTitulo));
  //       await this.calcularMontosRowPrincipal(indiceEdicion);
  //       this.dataTitulos[indice].modificado = true;
  //       cambio = 1;
  //     }
  //     let sgteValido = null;
  //     let index = indiceEdicion - 1;
  //     while (!sgteValido || index == 0) {
  //       if (this.dataSource[index].unidad) {
  //         sgteValido = true;
  //       } else {
  //         if (index > 0) {
  //           index--;
  //         } else {
  //           break;
  //         }
  //       }
  //     }
  //     if (index == 0) {
  //       index = indiceEdicion;
  //     }
  //     this.dataSource[index].editarMetrado = 1;
  //     this.filaSel = index;
  //     if (cambio == 1) {
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal(3);
  //     }
  //   } else {
  //     return;
  //   }
  // }

  // async listarTablasPartida(indice) {
  //   try {
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       indice: indice,
  //     };
  //     const response = await this.metradoService.listarMetradoXPartida(obj);
  //     const arrays = response;
  //     return arrays;
  //   } catch (e) {
  //     console.log(e);
  //     SwalService.error();
  //   }
  // }

  // async seleccionRowTabla1(partida, index) {
  //   if (this.filaSel !== null) {
  //     if (this.habilitarMultipleSelect || this.habilitadoCopiar) {
  //       this.dataSource[this.filaSel].detalleMetrado = await this.dataSource[
  //         this.filaSel
  //       ].detalleMetrado.map((ele) => {
  //         ele.editarCopiar = false;
  //         ele.editarCopiar = false;
  //         return ele;
  //       });
  //       this.dataSource[this.filaSel].detalleAcero = await this.dataSource[
  //         this.filaSel
  //       ].detalleAcero.map((ele) => {
  //         ele.editarCopiar = false;
  //         ele.editarCopiar = false;
  //         return ele;
  //       });
  //       this.habilitarMultipleSelect = false;
  //       this.habilitadoCopiar = false;
  //     }
  //   }
  //   if (this.filaSel == index) {
  //     return;
  //   }
  //   this.filaSel = index;
  //   this.tablaSeleccionada = false;
  //   this.partidaSeleccionada = this.dataSource[this.filaSel];
  //   this.tablaSistema = [];
  //   this.filaSel2 = -1;
  //   this.filaSel3 = -1;
  //   this.metradoSeleccionado = null;
  //   this.mostrarColrs = false;
  //   this.tempFormula = [];
  //   this.tablaAceros = [];
  //   this.ultiCelda = null;
  //   this.opcionHabilitarAceros = null;
  //   this.opcionHabilitarSistema = null;
  //   this.ocultarChecks = null;
  //   this.formulaCopiada = null;
  //   this.buscando2 = true;
  //   this.inicioCeldaCopiado = null;
  //   this.finCeldaCopiado = null;

  //   if (!this.dataSource[this.filaSel].tablaInicialSistema.length) {
  //     const tablas = await this.listarTablasPartida(
  //       this.dataSource[this.filaSel].indice
  //     );
  //     await this.iniciarTablaSistema(tablas[0], this.filaSel);
  //     await this.iniciarTablaAceros(tablas[1], this.filaSel);
  //     const existeTablaMetrado = await tablas[0].filter(
  //       (ele) => ele.id_metrado !== null && !ele.estitulo && ele.esMetrado
  //     );
  //     const existeTablaAcero = await tablas[1].filter(
  //       (ele) => ele.id_metrado !== null
  //     );
  //     if (existeTablaMetrado.length) {
  //       this.dataSource[this.filaSel].permitirCambio = 0;
  //       this.ocultarChecks = existeTablaMetrado.length;
  //     } else {
  //       this.dataSource[this.filaSel].permitirCambio = 0;
  //       this.ocultarChecks = 0;
  //     }
  //     if (existeTablaAcero.length) {
  //       this.dataSource[this.filaSel].permitirCambio = 1;
  //       this.bloquearBotones = false;
  //       this.tablaSeleccionada = true;
  //     } else {
  //     }
  //   } else {
  //     this.tablaSistema = this.dataSource[index].detalleMetrado;
  //     this.tablaAceros = this.dataSource[index].detalleAcero;
  //     for (let metrado of this.tablaSistema) {
  //       metrado.editarCopiar = null;
  //       metrado.editaraltura = null;
  //       metrado.editarancho = null;
  //       metrado.editarcantidad = null;
  //       metrado.editardescripcion = null;
  //       metrado.editarlargo = null;
  //       metrado.editarn_veces = null;
  //       metrado.editarEliminar = null;
  //       metrado.editararchivo = null;
  //     }
  //     if (!this.tablaAceros.length) {
  //       await this.iniciarTablaAceros([], this.filaSel);
  //     }
  //     for (let aceros of this.tablaAceros) {
  //       if (aceros.id_metrado !== null) {
  //         aceros.editarCopiar = null;
  //         aceros.editarEliminar = null;
  //         aceros.editarcantidad = null;
  //         aceros.editardescripcion = null;
  //         aceros.editardiametro = null;
  //         aceros.editarelementos = null;
  //         aceros.editarlongitud = null;
  //         aceros.editartotal1 = null;
  //         aceros.editartotal2 = null;
  //       }
  //       await this.calcularFormulaAceros(aceros);
  //     }
  //     const encontrado = this.tablaSistema.filter(
  //       (ele) => ele.id_metrado !== null && !ele.estitulo && ele.esMetrado
  //     );
  //     if (encontrado.length) {
  //       this.ocultarChecks = encontrado.length;
  //       const existeLigado = encontrado.find((ele) => ele.tieneAceros);
  //       if (existeLigado) {
  //         this.tablaSeleccionada = true;
  //         this.bloquearBotones = false;
  //       } else {
  //         this.tablaSeleccionada = false;
  //         this.bloquearBotones = false;
  //       }
  //     } else {
  //       this.bloquearBotones = false;
  //       this.ocultarChecks = 0;
  //       this.tablaSeleccionada = false;
  //     }
  //   }
  //   await this.actualizarDataPrincipal();
  //   setTimeout(() => {
  //     if (this.partidaSeleccionada?.unidad) {
  //       if (this.box2) {
  //         const hBotones = this.box2.nativeElement.offsetHeight;
  //         if (this.hBotones !== hBotones) {
  //           this.hBotones = hBotones;
  //         }
  //       }
  //       if (this.box3) {
  //         const hBotones2 = this.box3.nativeElement.offsetHeight;
  //         if (this.hBotones2 !== hBotones2) {
  //           this.hBotones2 = hBotones2;
  //         }
  //       }
  //     } else {
  //       this.hBotones = 0;
  //     }
  //   }, 500);
  //   this.buscando2 = false;
  // }

  // async cambioTabla(event?, celda?) {
  //   this.tablaSeleccionada = event ? event.target.checked : celda;
  //   this.habilitarMultipleSelect = false;
  //   this.metradoSeleccionado = null;
  //   this.mostrarColrs = false;
  //   this.tempFormula = [];
  //   this.aceroSeleccionado = null;
  //   this.posicionCursor = null;
  //   this.opcionHabilitarAceros = null;
  //   this.opcionHabilitarSistema = null;
  //   this.iniciado = false;
  //   this.archivoText = null;
  //   this.ultiCelda = null;
  //   this.fueradeTabla();
  //   if (!this.tablaSeleccionada) {
  //     this.aceroSeleccionado = null;
  //     this.filaSel3 = -1;
  //     if (this.dataSource[this.filaSel].detalleMetrado.length) {
  //       this.tablaSistema = this.dataSource[this.filaSel].detalleMetrado;
  //       await this.calculoMontosSistema();
  //     } else {
  //       this.tablaSistema = JSON.parse(
  //         JSON.stringify(this.dataSource[this.filaSel].tablaInicialSistema)
  //       );
  //     }
  //     const existeVinculado = await this.tablaSistema.find(
  //       (ele) => ele.tieneAceros && ele.id_metrado !== null
  //     );
  //     if (existeVinculado) {
  //       this.bloquearBotones = true;
  //     }
  //   } else {
  //     this.filaSel2 = -1;
  //     this.bloquearBotones = false;
  //     this.metradoSeleccionado = null;
  //     this.mostrarColrs = false;
  //     this.tempFormula = [];
  //     if (this.dataSource[this.filaSel].detalleAcero.length) {
  //       this.tablaAceros = this.dataSource[this.filaSel].detalleAcero;
  //     } else {
  //       this.tablaAceros = JSON.parse(
  //         JSON.stringify(this.dataSource[this.filaSel].tablaInicialAcero)
  //       );
  //     }
  //   }
  //   await this.actualizarDataPrincipal();
  // }

  // async cambioCheckboxCopiar(valor, index) {
  //   if (!this.tablaSeleccionada) {
  //     const row = this.tablaSistema[index];
  //     this.tablaSistema[index].editarCopiar = valor;
  //     if (row.esMetrado && !row.estitulo && valor) {
  //       for (let i = index + 1; i < this.tablaSistema.length; i++) {
  //         if (!this.tablaSistema[i].esMetrado) {
  //           this.tablaSistema[i].editarCopiar = true;
  //         } else {
  //           if (
  //             this.tablaSistema[i].estitulo == 1 ||
  //             (this.tablaSistema[i].id_metrado !== null &&
  //               this.tablaSistema[i].esMetrado)
  //           ) {
  //             break;
  //           }
  //         }
  //       }
  //     } else if (!row.esMetrado && !row.estitulo && !valor) {
  //     } else if (row.esMetrado && row.estitulo == 1 && valor) {
  //       for (let i = index + 1; i < this.tablaSistema.length; i++) {
  //         if (this.tablaSistema[i].estitulo == 1) {
  //           break;
  //         }
  //         if (this.tablaSistema[i].id_metrado !== null) {
  //           this.tablaSistema[i].editarCopiar = true;
  //         }
  //       }
  //     } else if (row.esMetrado && !row.estitulo && !valor) {
  //     }
  //   } else {
  //     const row = this.tablaAceros[index];
  //     this.tablaAceros[index].editarCopiar = valor;
  //     if (row.esMetrado && !row.estitulo && valor) {
  //       for (let i = index + 1; i < this.tablaAceros.length; i++) {
  //         if (!this.tablaAceros[i].esMetrado) {
  //           this.tablaAceros[i].editarCopiar = true;
  //         } else {
  //           if (
  //             this.tablaAceros[i].estitulo == 1 ||
  //             (this.tablaAceros[i].id_metrado !== null &&
  //               this.tablaAceros[i].esMetrado)
  //           ) {
  //             break;
  //           }
  //         }
  //       }
  //     } else if (!row.esMetrado && !row.estitulo && !valor) {
  //     } else if (row.esMetrado && row.estitulo == 1 && valor) {
  //       for (let i = index + 1; i < this.tablaAceros.length; i++) {
  //         if (this.tablaAceros[i].estitulo == 1) {
  //           break;
  //         }
  //         if (this.tablaAceros[i].id_metrado !== null) {
  //           this.tablaAceros[i].editarCopiar = true;
  //         }
  //       }
  //     } else if (row.esMetrado && !row.estitulo && !valor) {
  //     }
  //   }
  // }

  // async habilitarMultiple() {
  //   if (!this.tablaSeleccionada) {
  //     this.filaSel2 = -1;
  //     this.metradoSeleccionado = null;
  //     this.mostrarColrs = false;
  //     this.tempFormula = [];
  //   } else {
  //     this.filaSel3 = -1;
  //     this.aceroSeleccionado = null;
  //   }
  //   this.habilitadoCopiar = true;
  // }

  // async copiarFila() {
  //   this.arrayCopiadosMetrado = [];
  //   this.arrayCopiadosAceros = [];
  //   if (!this.tablaSeleccionada) {
  //     if (this.metradoSeleccionado?.id_metrado !== null) {
  //       this.arrayCopiadosMetrado.push(
  //         JSON.parse(JSON.stringify(this.metradoSeleccionado))
  //       );
  //       this.filaSel2 = -1;
  //       this.metradoSeleccionado = null;
  //       this.mostrarColrs = false;
  //       this.tempFormula = [];
  //       this.toaster.info('', 'Copiado', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     } else {
  //       this.toaster.error('Ninguna Fila Seleccionada', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     }
  //   } else {
  //     if (this.aceroSeleccionado?.id_metrado !== null) {
  //       this.arrayCopiadosAceros.push(
  //         JSON.parse(JSON.stringify(this.aceroSeleccionado))
  //       );
  //       this.filaSel3 = -1;
  //       this.aceroSeleccionado = null;
  //       this.toaster.info('', 'Copiado', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     } else {
  //       this.toaster.error('Ninguna Fila Seleccionada', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     }
  //   }
  //   this.ultiCelda = null;
  // }

  // async copiarFilaMultiple() {
  //   this.arrayCopiadosMetrado = [];
  //   this.arrayCopiadosAceros = [];
  //   this.celdasCopiadosMetrado = [];
  //   this.celdasCopiadosAceros = [];
  //   this.habilitadoCopiar = false;
  //   if (!this.tablaSeleccionada) {
  //     let i = 0;
  //     this.tablaSistema.map((ele, index) => {
  //       if (ele.editarCopiar && ele.id_metrado !== null) {
  //         i++;
  //         this.arrayCopiadosMetrado.push(JSON.parse(JSON.stringify(ele)));
  //         this.tablaSistema[index].editarCopiar = true;
  //       }
  //     });
  //     if (i > 0) {
  //       this.filaSel2 = -1;
  //       this.metradoSeleccionado = null;
  //       this.mostrarColrs = false;
  //       this.tempFormula = [];
  //       this.toaster.info('', 'Copiado', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     } else {
  //     }
  //   } else {
  //     let i = 0;
  //     this.tablaAceros.map((ele, index) => {
  //       if (ele.editarCopiar && ele.id_metrado !== null) {
  //         i++;
  //         this.arrayCopiadosAceros.push(JSON.parse(JSON.stringify(ele)));
  //         this.tablaAceros[index].editarCopiar = true;
  //       }
  //     });
  //     if (i > 0) {
  //       this.filaSel3 = -1;
  //       this.aceroSeleccionado = null;
  //       this.mostrarColrs = false;
  //       this.tempFormula = [];
  //       this.toaster.info('', 'Copiado', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     } else {
  //     }
  //   }
  //   this.ultiCelda = null;
  // }

  // async cortarSeleccionados() {
  //   let arrayCortados = [];
  //   if (!this.tablaSeleccionada) {
  //     if (this.habilitadoCopiar) {
  //       this.tablaSistema = this.tablaSistema.map((ele) => {
  //         if (ele.editarCopiar) {
  //           arrayCortados.push(ele);
  //           const metrado = new metradoModelo(
  //             null,
  //             1,
  //             '',
  //             null,
  //             this.partidaSeleccionada?.indice,
  //             this.idProyecto
  //           );
  //           ele = metrado;
  //         }
  //         return ele;
  //       });
  //     } else {
  //       if (this.copiadoCeldas) {
  //         await this.guardarSeleccionadosCeldas(true);
  //         this.copiadoCeldas = false;
  //       } else {
  //         arrayCortados.push(this.metradoSeleccionado);
  //         const metrado = new metradoModelo(
  //           null,
  //           1,
  //           '',
  //           null,
  //           this.partidaSeleccionada?.indice,
  //           this.idProyecto
  //         );
  //         this.metradoSeleccionado = null;
  //         this.tablaSistema[this.filaSel2] = metrado;
  //       }
  //       this.habilitadoCopiar = false;
  //     }
  //     await this.actualizarTablaCompleta();
  //     await this.calculoMontosSistema();
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('cortarSeleccionados');
  //     this.arrayCopiadosMetrado = arrayCortados;
  //     this.ultiCelda = null;
  //     this.habilitadoCopiar = false;
  //   } else {
  //     //Aceros
  //     if (this.habilitadoCopiar) {
  //       this.tablaAceros = this.tablaAceros.map((ele) => {
  //         if (ele.editarCopiar) {
  //           arrayCortados.push(ele);
  //           const acero = new aceroModelo(
  //             null,
  //             1,
  //             null,
  //             null,
  //             this.partidaSeleccionada.indice,
  //             this.idProyecto
  //           );
  //           ele = acero;
  //         }
  //         return ele;
  //       });
  //     } else {
  //       if (this.copiadoCeldas) {
  //         // await this.guardarSeleccionadosCeldas(true)
  //         this.copiadoCeldas = false;
  //       } else {
  //         arrayCortados.push(this.aceroSeleccionado);
  //         const acero = new aceroModelo(
  //           null,
  //           1,
  //           null,
  //           null,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         this.aceroSeleccionado = null;
  //         this.tablaAceros[this.filaSel3] = acero;
  //       }
  //       this.habilitadoCopiar = false;
  //     }
  //     await this.actualizarTablaCompletaAceros();
  //     await this.calcularMontosAceros();
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('cortarSeleccionados');
  //     this.arrayCopiadosAceros = arrayCortados;
  //     this.ultiCelda = null;
  //     this.habilitadoCopiar = false;
  //   }
  // }

  // async pegarCopiados() {
  //   if (!this.tablaSeleccionada) {
  //     if (this.filaSel2 == -1 && !this.ultiCelda) {
  //       this.toaster.error(
  //         'Seleccione una fila o celda valida para pegar',
  //         '',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         }
  //       );
  //       return;
  //     } else {
  //       const array = [
  //         'descripcion',
  //         'cantidad',
  //         'n_veces',
  //         'largo',
  //         'ancho',
  //         'altura',
  //       ];
  //       const indiceSel = JSON.parse(
  //         JSON.stringify(this.dataSource[this.filaSel]?.indice)
  //       );

  //       if (this.celdasCopiadosMetrado.length) {
  //         const idx = array.indexOf(this.ultiCelda);
  //         const arrayValidos =
  //           idx == -1 ? array : array.slice(idx, array.length);
  //         let ind = JSON.parse(JSON.stringify(this.filaSel2));
  //         for (const iterator of this.celdasCopiadosMetrado) {
  //           if (ind > this.tablaSistema.length) {
  //             let metrado = new metradoModelo(
  //               null,
  //               1,
  //               '',
  //               null,
  //               indiceSel,
  //               this.idProyecto
  //             );
  //             for (let i = 0; i < iterator.length; i++) {
  //               metrado[arrayValidos[i]] = iterator[i];
  //             }
  //             this.tablaSistema.push(metrado);
  //           } else {
  //             let metrado = this.tablaSistema[ind];
  //             for (let i = 0; i < iterator.length; i++) {
  //               metrado[arrayValidos[i]] = iterator[i];
  //             }
  //           }
  //           ind++;
  //         }
  //       } else if (this.arrayCopiadosMetrado.length) {
  //         let ind = JSON.parse(JSON.stringify(this.filaSel2));
  //         let celdasEspecificas = [];
  //         if (this.ultiCelda) {
  //           const idx = array.indexOf(this.ultiCelda);
  //           celdasEspecificas =
  //             idx == -1 ? array : array.slice(idx, array.length);
  //         }

  //         for (const iterator of this.arrayCopiadosMetrado) {
  //           iterator.indice = indiceSel;
  //           if (ind > this.tablaSistema.length) {
  //             if (!celdasEspecificas.length) {
  //               this.tablaSistema.push(iterator);
  //             } else {
  //               let metrado = new metradoModelo(
  //                 null,
  //                 1,
  //                 '',
  //                 null,
  //                 indiceSel,
  //                 this.idProyecto
  //               );
  //               let k = 0;
  //               for (const key of celdasEspecificas) {
  //                 metrado[key] = iterator[array[k]];
  //                 k++;
  //               }
  //               this.tablaSistema.push(metrado);
  //             }
  //           } else {
  //             if (!celdasEspecificas.length) {
  //               this.tablaSistema[ind] = iterator;
  //             } else {
  //               let metrado = this.tablaSistema[ind];
  //               let k = 0;
  //               if (!metrado) {
  //                 metrado = new metradoModelo(
  //                   null,
  //                   1,
  //                   '',
  //                   null,
  //                   indiceSel,
  //                   this.idProyecto
  //                 );
  //                 for (const key of celdasEspecificas) {
  //                   metrado[key] = iterator[array[k]];
  //                   k++;
  //                 }
  //                 this.tablaSistema.push(metrado);
  //               } else {
  //                 for (const key of celdasEspecificas) {
  //                   metrado[key] = iterator[array[k]];
  //                   k++;
  //                 }
  //                 this.tablaSistema[ind] = metrado;
  //               }
  //             }
  //           }
  //           ind++;
  //         }
  //         this.ultiCelda = null;
  //       } else {
  //         this.toaster.info('Ningun dato  copiada', '', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       }
  //     }
  //     // console.log('tabla', this.tablaSistema)
  //     await this.actualizarTablaCompleta();
  //     await this.calculoMontosSistema();
  //     this.dataSource[this.filaSel].editadoMetrado = 1;
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('cortarSeleccionados');
  //     this.ultiCelda = null;
  //     this.arrayCopiadosAceros = [];
  //     this.arrayCopiadosMetrado = [];
  //     this.celdasCopiadosAceros = [];
  //     this.celdasCopiadosMetrado = [];
  //   } else {
  //     if (this.filaSel3 == -1 && !this.ultiCelda) {
  //       this.toaster.error(
  //         'Seleccione una fila o celda valida para pegar',
  //         '',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         }
  //       );
  //       return;
  //     } else {
  //       const array = ['descripcion', 'cantidad', 'elementos', 'longitud'];

  //       if (this.celdasCopiadosMetrado.length) {
  //       } else if (this.arrayCopiadosAceros.length) {
  //         let ind = JSON.parse(JSON.stringify(this.filaSel3));
  //         let celdasEspecificas = [];
  //         if (this.ultiCelda) {
  //           const idx = array.indexOf(this.ultiCelda);
  //           celdasEspecificas =
  //             idx == -1 ? array : array.slice(idx, array.length);
  //         }
  //         for (const iterator of this.arrayCopiadosAceros) {
  //           if (ind > this.tablaAceros.length) {
  //             if (!celdasEspecificas.length) {
  //               this.tablaAceros.push(iterator);
  //             } else {
  //               let acero = new aceroModelo(
  //                 null,
  //                 1,
  //                 null,
  //                 null,
  //                 this.partidaSeleccionada.indice,
  //                 this.idProyecto
  //               );
  //               let k = 0;
  //               for (const key of celdasEspecificas) {
  //                 acero[key] = iterator[array[k]];
  //                 k++;
  //               }
  //               this.tablaAceros.push(acero);
  //             }
  //           } else {
  //             if (!celdasEspecificas.length) {
  //               this.tablaAceros[ind] = iterator;
  //             } else {
  //               let acero = this.tablaAceros[ind];
  //               let k = 0;
  //               for (const key of celdasEspecificas) {
  //                 acero[key] = iterator[array[k]];
  //                 k++;
  //               }
  //               this.tablaAceros[ind] = acero;
  //             }
  //           }
  //           ind++;
  //         }
  //         this.ultiCelda = null;
  //       } else {
  //         this.toaster.info('Ningun dato  copiada', '', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       }
  //     }
  //     await this.actualizarTablaCompletaAceros();
  //     await this.calcularMontosAceros();
  //     this.guardarTablaTemporal('cortarSeleccionados');
  //     this.ultiCelda = null;
  //     this.arrayCopiadosAceros = [];
  //     this.arrayCopiadosMetrado = [];
  //     this.celdasCopiadosAceros = [];
  //     this.celdasCopiadosMetrado = [];
  //   }
  // }

  // async verificarAccionValidaMetrado(indice) {
  //   let permitido = false;
  //   let sgte = null;
  //   for (let i = indice + 1; i < this.tablaSistema.length; i++) {
  //     if (this.tablaSistema[i].id_metrado !== null) {
  //       sgte = this.tablaSistema[i];
  //       break;
  //     }
  //   }
  //   if (!sgte || this.tablaSistema[this.filaSel2].id_metrado == null) {
  //     permitido = true;
  //   } else {
  //     const primero = this.arrayCopiadosMetrado.length
  //       ? this.arrayCopiadosMetrado[0]
  //       : null;
  //     if (!this.tablaSistema[indice].esMetrado) {
  //       if (!primero.esMetrado) {
  //         permitido = true;
  //       } else {
  //       }
  //     } else {
  //       if (this.tablaSistema[indice].estitulo) {
  //         if (primero.esMetrado) {
  //           permitido = true;
  //         } else {
  //         }
  //       } else {
  //         if (!primero.esMetrado) {
  //           permitido = true;
  //         } else {
  //           permitido = true;
  //         }
  //       }
  //     }
  //   }
  //   return permitido;
  // }

  // async verificarAccionValidaAcero(indice) {
  //   let permitido = false;
  //   let sgte = null;
  //   for (let i = indice + 1; i < this.tablaAceros.length; i++) {
  //     if (this.tablaAceros[i].id_metrado !== null) {
  //       sgte = this.tablaAceros[i];
  //       break;
  //     }
  //   }
  //   if (!sgte || this.tablaAceros[this.filaSel3].id_metrado == null) {
  //     permitido = true;
  //   } else {
  //     const primero = this.arrayCopiadosAceros.length
  //       ? this.arrayCopiadosAceros[0]
  //       : null;
  //     if (!this.tablaAceros[indice].esMetrado) {
  //       if (!primero.esMetrado) {
  //         permitido = true;
  //       } else {
  //       }
  //     } else {
  //       if (this.tablaAceros[indice].estitulo) {
  //         if (primero.esMetrado) {
  //           permitido = true;
  //         } else {
  //         }
  //       } else {
  //         if (!primero.esMetrado) {
  //           permitido = true;
  //         } else {
  //           permitido = true;
  //         }
  //       }
  //     }
  //   }
  //   return permitido;
  // }

  // async limpiarCopiados() {
  //   if (this.formulaCopiada !== null) {
  //     this.formulaCopiada = null;
  //   }
  //   this.habilitadoCopiar = false;
  //   this.arrayCopiadosAceros = [];
  //   this.arrayCopiadosMetrado = [];
  //   this.CancelarCopiarFraccionTabla();
  //   this.tablaSistema = this.tablaSistema.map((ele) => {
  //     ele.editarCopiar = false;
  //     ele.editarCopiar = false;
  //     return ele;
  //   });
  //   this.tablaAceros = this.tablaAceros.map((ele) => {
  //     ele.editarCopiar = false;
  //     ele.editarCopiar = false;
  //     return ele;
  //   });
  // }

  // async convertirFilaATitulo() {
  //   let cambio = 0;
  //   if (!this.tablaSeleccionada) {
  //     if (this.metradoSeleccionado?.id_metrado !== null) {
  //       if (this.metradoSeleccionado.tieneAceros) {
  //         this.toaster.error('No se puede convertir a titulo', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       } else {
  //         this.tablaSistema[this.filaSel2].estitulo = 1;
  //         this.tablaSistema[this.filaSel2].esMetrado = 1;
  //         this.tablaSistema[this.filaSel2].tieneAceros = 0;
  //         await this.actualizarTablaCompleta();
  //         await this.calculoMontosSistema();
  //         cambio = 1;
  //       }
  //     } else {
  //       if (this.metradoSeleccionado?.id_metrado == null) {
  //         this.tablaSistema[this.filaSel2].estitulo = 1;
  //         this.tablaSistema[this.filaSel2].esMetrado = 1;
  //         this.tablaSistema[this.filaSel2].tieneAceros = 0;
  //         await this.actualizarTablaCompleta();
  //         await this.calculoMontosSistema();
  //         cambio = 1;
  //       } else {
  //         const texto =
  //           this.filaSel2 == -1
  //             ? 'Ningun elemento Seleccionado'
  //             : 'No se puede convertir a titulo';
  //         this.toaster.error(texto, 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       }
  //     }
  //     if (cambio) {
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal('convertirFilaATituloM');
  //     }
  //   } else {
  //     if (this.aceroSeleccionado?.id_metrado !== null) {
  //       this.tablaAceros[this.filaSel3].estitulo = 1;
  //       this.tablaAceros[this.filaSel3].esMetrado = 1;
  //       await this.actualizarTablaCompletaAceros();
  //       await this.calcularMontosAceros();
  //       cambio = 1;
  //     } else {
  //       if (this.aceroSeleccionado?.id_metrado == null) {
  //         this.tablaAceros[this.filaSel3].estitulo = 1;
  //         this.tablaAceros[this.filaSel3].esMetrado = 1;
  //         await this.actualizarTablaCompletaAceros();
  //         await this.calcularMontosAceros();
  //         cambio = 1;
  //       } else {
  //         const texto =
  //           this.filaSel3 == -1
  //             ? 'Ningun elemento Seleccionado'
  //             : 'No se puede convertir a titulo';
  //         this.toaster.error(texto, 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       }
  //     }
  //     if (cambio) {
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal('convertirFilaATituloM');
  //     }
  //   }
  // }

  // async convertirFilaATexto(multiple = false) {
  //   if (!this.tablaSeleccionada) {
  //     if (this.metradoSeleccionado?.id_metrado !== null) {
  //       let valor = 2;
  //       if (this.metradoSeleccionado.estitulo == 2) {
  //         valor = 0;
  //       }
  //       this.tablaSistema[this.filaSel2].estitulo = valor;
  //       await this.actualizarTablaCompleta();
  //       await this.calculoMontosSistema();
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal('convertirFilaATexto');
  //     } else {
  //       this.toaster.info('Ningun Fila seleccionada', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //       return;
  //     }
  //   } else {
  //     if (this.aceroSeleccionado?.id_metrado !== null) {
  //       let valor = 2;
  //       if (this.aceroSeleccionado.estitulo == 2) {
  //         valor = 0;
  //       }
  //       this.tablaAceros[this.filaSel3].estitulo = valor;
  //       await this.actualizarTablaCompletaAceros();
  //       await this.calcularMontosAceros();
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal('convertirFilaATexto');
  //     } else {
  //       this.toaster.info('Ningun Fila seleccionada', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //       return;
  //     }
  //   }
  // }

  // async convertirSgtesSubAMert(indice, tabla) {
  //   let row = null;
  //   while (!row?.esMetrado && row?.id_metrado !== null) {
  //     row = this[tabla][indice];
  //     if (!row.esMetrado && row.id_metrado !== null) {
  //       this[tabla][indice].esMetrado = 1;
  //       this[tabla][indice].estitulo = 0;
  //       indice++;
  //       row = this[tabla][indice];
  //     } else {
  //       return;
  //     }
  //   }
  // }

  // async descartarCambiosTitulo() {
  //   const index = await this.dataTitulos
  //     .map((ele) => ele.dataTitulo.indice)
  //     .indexOf(Number(this.indiceTitulo));

  //   if (
  //     JSON.stringify(this.dataSource) !==
  //     JSON.stringify(this.dataTitulos[index].dataInicial)
  //   ) {
  //     this.dataTitulos[index].data = this.dataSource;
  //     if (
  //       JSON.stringify(this.dataTitulos[index].data) !==
  //       JSON.stringify(this.dataTitulos[index].dataInicial)
  //     ) {
  //       this.dataTitulos[index].modificado = true;
  //     }
  //   }
  //   const sw = await SwalService.confirm(
  //     'Estas seguro?',
  //     null,
  //     'Se  descartará todos los cambios realizados en : <br><strong>' +
  //       this.dataTitulo.item +
  //       ' - ' +
  //       this.dataTitulo.descripcion +
  //       '<strong>'
  //   );
  //   if (sw.isConfirmed) {
  //     const index = await this.dataTitulos
  //       .map((ele) => ele.dataTitulo.indice)
  //       .indexOf(Number(this.indiceTitulo));
  //     if (this.dataTitulos[index].modificado) {
  //       this.dataSource = [];
  //       this.mostrar_carga_todo = true;
  //       this.dataSource = JSON.parse(
  //         JSON.stringify(this.dataTitulos[index].dataInicial)
  //       );
  //       this.dataTitulos[index].data = JSON.parse(
  //         JSON.stringify(this.dataTitulos[index].dataInicial)
  //       );
  //       this.tablaSeleccionada = false;
  //       this.partidaSeleccionada = null;
  //       this.tablaSistema = [];
  //       this.filaSel = null;
  //       this.filaSel2 = -1;
  //       this.filaSel3 = -1;
  //       this.metradoSeleccionado = null;
  //       this.mostrarColrs = false;
  //       this.tempFormula = [];
  //       this.tablaAceros = [];
  //       this.opcionHabilitarAceros = null;
  //       this.opcionHabilitarSistema = null;
  //       this.ocultarChecks = null;
  //       this.dataTitulos[index].guardado = null;
  //       this.dataTitulos[index].modificado = false;
  //       await this.actualizarDataPrincipal();
  //       this.mostrar_carga_todo = false;
  //     } else {
  //       this.toaster.info('Ningun cambio registrado', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //     }
  //   }
  // }

  // async descartarTodosLoscambios() {
  //   const sw = await SwalService.confirm(
  //     'Estas seguro?',
  //     null,
  //     'Se  descartará todos los cambios realizados en todos los titulos con tipo registro sistema y estilos no guardados.'
  //   );
  //   if (sw.isConfirmed) {
  //     this.mostrar_carga_todo = true;
  //     let i = 0;
  //     for await (let titulo of this.dataTitulos) {
  //       if (titulo.tipo_registro == 0) {
  //         titulo.data = JSON.parse(JSON.stringify(titulo.dataInicial));
  //       } else {
  //         titulo.dataExcel = await titulo.dataExcel.map((ele) => {
  //           ele.seleccionado = false;
  //           ele.filaModificada = false;
  //           return ele;
  //         });
  //       }
  //       titulo.guardado = null;
  //       titulo.modificado = false;
  //       if (titulo.dataTitulo.indice == this.indiceTitulo) {
  //         if (titulo.tipo_registro == 0) {
  //           this.dataSource = [];
  //           this.dataSource = JSON.parse(JSON.stringify(titulo.dataInicial));
  //           this.tablaSeleccionada = false;
  //           this.partidaSeleccionada = null;
  //           this.tablaSistema = [];
  //           this.filaSel = null;
  //           this.filaSel2 = -1;
  //           this.filaSel3 = -1;
  //           this.metradoSeleccionado = null;
  //           this.mostrarColrs = false;
  //           this.tempFormula = [];
  //           this.tablaAceros = [];
  //           this.opcionHabilitarAceros = null;
  //           this.opcionHabilitarSistema = null;
  //           this.ocultarChecks = null;
  //           await this.actualizarDataPrincipal();
  //         } else {
  //           let header = null;
  //           let body = [];
  //           const response = await this.listarTablaExcel(
  //             titulo.dataTitulo.indice
  //           );
  //           if (response) {
  //             if (response[1]) {
  //               header = await this.estructurarHeader(response[1][0]);
  //             }
  //             if (response[0]) {
  //               body = response[0];
  //             }
  //           }
  //           (titulo.dataHeader = header), (titulo.dataExcel = body);
  //           this.tablaExcelAdjunta = [];
  //           this.tablaExcelAdjunta = titulo.dataExcel;
  //           this.filaExcelSel = null;
  //         }
  //       }
  //       i++;
  //     }
  //     await this.descartarTablaTemporal();
  //     this.mostrar_carga_todo = false;
  //     this.verResumen.emit(1);
  //   }
  // }

  // async descartarCambiosPartida() {
  //   const string = this.partidaSeleccionada
  //     ? this.partidaSeleccionada.unidad
  //       ? 'Se limpiara toda informacion registrada para la partida seleccionada'
  //       : 'Se limpiara toda informacion registrada en todas las partidas pertenecientes al grupo seleccionado'
  //     : 'Se limpiara toda la informacion registrada en todo el titulo seleccionado';
  //   const sw = await SwalService.confirm('Estas seguro?', string);
  //   if (sw.isConfirmed) {
  //     if (this.partidaSeleccionada?.unidad) {
  //       this.buscando2 = true;
  //       await this.resetearPartida(this.filaSel);
  //       await this.iniciarTablaSistema([], this.filaSel);
  //       await this.iniciarTablaAceros([], this.filaSel);
  //       this.buscando2 = false;
  //     } else {
  //       var item = null;
  //       if (!this.partidaSeleccionada) {
  //         item = this.dataTitulo.item;
  //         // this.filaSel = null;
  //         // this.partidaSeleccionada = null;
  //         // // this.dataSource[0].estilo = ''
  //         // this.dataSource[0].editadoMetrado = 1;
  //       } else {
  //         item = this.partidaSeleccionada.item;
  //       }
  //       let encontrados = [];
  //       const titem = item + '.';
  //       encontrados = await this.dataSource.filter(
  //         (ele) => ele.item.includes(titem) && ele.unidad
  //       );
  //       for (let partida of encontrados) {
  //         this.filaSel = partida.ind;
  //         this.partidaSeleccionada = partida;
  //         await this.resetearPartida(partida.ind);

  //         await this.iniciarTablaSistema([], partida.ind);
  //         await this.iniciarTablaAceros([], partida.ind);
  //       }
  //       this.partidaSeleccionada = null;
  //       this.filaSel = null;
  //     }
  //     this.filaSel2 = -1;
  //     this.filaSel3 = -1;
  //     this.metradoSeleccionado = null;
  //     this.mostrarColrs = false;
  //     this.tempFormula = [];
  //     this.aceroSeleccionado = null;
  //     this.opcionHabilitarAceros = null;
  //     this.opcionHabilitarSistema = null;
  //     this.ocultarChecks = null;
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('descartarCambiosPartida');
  //   }
  // }

  // async limpiarTabla() {
  //   if (this.partidaSeleccionada?.unidad) {
  //     const sw = await SwalService.confirm(
  //       'Estas seguro?',
  //       'Se eliminará todos los registros de la tablas de la partida seleccionada'
  //     );
  //     if (sw.isConfirmed) {
  //       this.buscando2 = true;
  //       await this.resetearPartida(this.filaSel);
  //       await this.iniciarTablaAceros([], this.filaSel);
  //       await this.iniciarTablaSistema([], this.filaSel);
  //       this.filaSel2 = -1;
  //       this.filaSel3 = -1;
  //       this.metradoSeleccionado = null;
  //       this.mostrarColrs = false;
  //       this.tempFormula = [];
  //       this.aceroSeleccionado = null;
  //       this.opcionHabilitarAceros = null;
  //       this.opcionHabilitarSistema = null;
  //       this.ocultarChecks = null;
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal('descartarCambiosPartida');
  //       this.buscando2 = false;
  //     }
  //   }
  // }

  // async resetearPartida(indice, unico = false) {
  //   this.dataSource[indice].detalleAcero = [];
  //   this.dataSource[indice].detalleMetrado = [];
  //   this.dataSource[indice].editadoMetrado = 1;
  //   this.dataSource[indice].metrado = this.formsService.redondeo(
  //     0,
  //     this.dec_metrado
  //   );
  //   this.dataSource[indice].ed_pre = 1;
  //   this.dataSource[indice].cant_metrado = this.formsService.redondeo(
  //     this.dataSource[indice].cantidad,
  //     this.dec_metrado
  //   );
  //   this.dataSource[indice].permitirCambio = 0;
  //   this.dataSource[indice].plantilla = 0;
  //   this.dataSource[indice].tablaInicialAcero = [];
  //   this.dataSource[indice].tablaInicialSistema = [];
  //   this.dataSource[indice].totalAceros = this.formsService.redondeo(
  //     0,
  //     this.dec_metrado
  //   );
  //   this.dataSource[indice].vinculado = 0;
  //   // this.dataSource[indice].estilo = '';
  //   this.dataSource[indice].editarMetrado = null;
  //   this.dataSource[indice].estado_metrado = null;
  //   this.dataSource[indice].metrado_valido = null;
  //   this.dataSource[indice].totalAceros = this.formsService.redondeo(
  //     0,
  //     this.dec_metrado
  //   );
  //   await this.calcularMontosRowPrincipal(indice);
  //   await this.actualizarDataPrincipal();
  // }

  // /// tabla Sistema
  // async iniciarTablaSistema(tabla, indice) {
  //   this.tablaSistema = [];
  //   let bloquearBotones = false;
  //   await tabla.map(async (ele, index) => {
  //     if (ele.tieneAceros) {
  //       bloquearBotones = true;
  //     }
  //     let stilo = '';
  //     // if (ele.estilo) {
  //     //   stilo = ele.estilo ? ele.estilo : '';
  //     // } else {
  //     //   // const arrayStilos = this.dataSource[0].estilo
  //     //   //   ? JSON.parse(this.dataSource[0].estilo)
  //     //   //   : ['', '', ''];
  //     //   if (ele.id_metrado !== null && ele.estitulo == 1) {
  //     //     stilo = arrayStilos[0];
  //     //   } else if (ele.id_metrado !== null && !ele.estitulo && ele.esMetrado) {
  //     //     stilo = arrayStilos[1];
  //     //     this.stiloMetrado = stilo
  //     //   } else if (ele.id_metrado !== null && !ele.esMetrado) {
  //     //     stilo = arrayStilos[2];
  //     //   }
  //     // }
  //     // if (ele.id_metrado !== null && ele.esMetrado && ele.estitulo == 2 && !ele.tieneSubmetrado) {
  //     //   stilo = '';
  //     // }
  //     // const formula = await this.calcularFormulaSistema(ele)
  //     const recuperado = new metradoModelo(
  //       ele.descripcion,
  //       ele.esMetrado,
  //       ele.item,
  //       ele.id_metrado,
  //       ele.indice,
  //       ele.id_proyecto,
  //       null,
  //       ele.tieneSubmetrado,
  //       ele.tieneAceros,
  //       ele.estitulo,
  //       stilo,
  //       ele.cantidad,
  //       ele.n_veces,
  //       ele.largo,
  //       ele.ancho,
  //       ele.altura,
  //       this.formsService.redondeo(ele.subtotal, this.dec_metrado),
  //       this.formsService.redondeo(ele.parcial, this.dec_metrado),
  //       0,
  //       0,
  //       0,
  //       0,
  //       0,
  //       0,
  //       0,
  //       0,
  //       false,
  //       0,
  //       ele.archivo,
  //       ele.icomost,
  //       ele.mostrar,
  //       ele.id_padre,
  //       ele.estmost
  //     );
  //     this.tablaSistema.push(recuperado);
  //   });
  //   if (this.tablaSistema.length < this.cantidadFilasTabla) {
  //     const faltantes = this.cantidadFilasTabla - this.tablaSistema.length;
  //     for (let i = 0; i < faltantes; i++) {
  //       const metrado = new metradoModelo(
  //         '',
  //         1,
  //         '',
  //         null,
  //         this.partidaSeleccionada?.indice,
  //         this.idProyecto
  //       );
  //       this.tablaSistema.push(metrado);
  //     }
  //   }
  //   this.dataSource[indice].tablaInicialSistema = JSON.parse(
  //     JSON.stringify(this.tablaSistema)
  //   );
  //   this.dataSource[indice].detalleMetrado = this.tablaSistema;
  //   this.bloquearBotones = bloquearBotones;
  //   await this.actualizarDataPrincipal();
  // }

  // async seleccionRowMetrado(row, i) {
  //   if (this.habilitarMultipleSelect || this.habilitadoCopiar) {
  //     return;
  //   }
  //   this.filaSel2 = i;
  //   this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //   if (!this.opcionHabilitarSistema && this.archivoText == null) {
  //     var input = document.getElementById('copiado');
  //     if (input) {
  //       input.focus({
  //         preventScroll: true,
  //       });
  //     }
  //   } else {
  //     this.eventHandler();
  //   }
  //   this.mostrarColrs = false;
  //   this.tempFormula = [];
  //   await this.stiloFormula();
  // }

  // async habilitarEditarSistema(celda, rowIndex) {
  //   if (this.solover || !this.editable) {
  //     return;
  //   }
  //   if (!this.seleccionCelda && !this.copiadoCeldas) {
  //     if (!this.partidaSeleccionada?.unidad) {
  //       return;
  //     }
  //     if (this.tablaSistema[rowIndex].tieneAceros && celda !== 'descripcion') {
  //       return;
  //     }
  //     // const encontrado = await this.tablaSistema.find(
  //     //   (ele) => ele.tieneAceros && ele.id_metrado !== null
  //     // );
  //     // if (encontrado) {
  //     //   console.log('encontrado',this.tablaSistema[rowIndex].tieneAceros);
  //     //   return;
  //     // }
  //     if (celda == 'archivo' && this.ocultarChecks <= 1) {
  //       return;
  //     }
  //     this.opcionHabilitarSistema = celda;
  //     if (this.opcionHabilitarSistema) {
  //       this.valorCopiado = null;
  //       this.copiadoActivo = false;
  //     }
  //     this.filaSel2 = rowIndex;
  //     this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //     this.tablaSistema[rowIndex]['editar' + celda] = 1;
  //   } else {
  //     if (this.seleccionCelda) {
  //       this.valorCopiado = null;
  //       var input = document.getElementById('copiado');
  //       input.focus({
  //         preventScroll: true,
  //       });

  //       this.filaSel2 = rowIndex;
  //       this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //       this.celdaInicio = celda;
  //     } else {
  //       this.metradoSeleccionado = null;
  //       this.filaSel2 = -1;
  //       const array = [
  //         'descripcion',
  //         'cantidad',
  //         'n_veces',
  //         'largo',
  //         'ancho',
  //         'altura',
  //         'archivo',
  //       ];
  //       if (!this.inicioCeldaCopiado && !this.finCeldaCopiado) {
  //         const ind = array.indexOf(celda);
  //         this.inicioCeldaCopiado = {
  //           fila: JSON.parse(JSON.stringify(rowIndex)),
  //           columna: ind == -1 ? null : ind,
  //           colname: celda,
  //         };
  //       } else if (this.inicioCeldaCopiado && !this.finCeldaCopiado) {
  //         const ind = array.indexOf(celda);
  //         this.finCeldaCopiado = {
  //           fila: JSON.parse(JSON.stringify(rowIndex)),
  //           columna: ind == -1 ? null : ind,
  //           colname: celda,
  //         };
  //       } else {
  //         this.inicioCeldaCopiado = null;
  //         this.finCeldaCopiado = null;
  //       }
  //     }
  //   }
  // }

  // async verificarTextoSistema(value, i, ind) {
  //   let cambio = 0;

  //   if (this.tablaSistema[i].id_metrado !== null) {
  //     if (value == undefined) {
  //       return;
  //     }
  //     if (
  //       (this.tablaSistema[i][this.opcionHabilitarSistema] == null
  //         ? ''
  //         : this.tablaSistema[i][this.opcionHabilitarSistema]) !== value
  //     ) {
  //       const spliteado = value.split('.');
  //       if (
  //         spliteado.length == 2 &&
  //         !isNaN(Number(spliteado[1])) &&
  //         !spliteado[0]
  //       ) {
  //         value = '0.' + spliteado[1];
  //       }
  //       this.tablaSistema[i][this.opcionHabilitarSistema] = value;
  //       this.dataSource[this.filaSel].editadoMetrado = 1;
  //       cambio = 1;
  //     }
  //   } else {
  //     if (this.tablaSistema[i].id_metrado == null) {
  //       if (value !== '' && value !== undefined) {
  //         const spliteado = value.split('.');
  //         if (
  //           spliteado.length == 2 &&
  //           !isNaN(Number(spliteado[1])) &&
  //           !spliteado[0]
  //         ) {
  //           value = '0.' + spliteado[1];
  //         }
  //         this.tablaSistema[i] = new metradoModelo(
  //           '',
  //           1,
  //           '',
  //           i + 1,
  //           this.partidaSeleccionada?.indice,
  //           this.idProyecto
  //         );
  //         this.tablaSistema[i][this.opcionHabilitarSistema] = value;
  //         this.dataSource[this.filaSel].editadoMetrado = 1;
  //         await this.actualizarTablaCompleta();
  //         cambio = 1;
  //       }
  //     } else {
  //       if (value !== undefined) {
  //         const spliteado = value.split('.');
  //         if (
  //           spliteado.length == 2 &&
  //           !isNaN(Number(spliteado[1])) &&
  //           !spliteado[0]
  //         ) {
  //           value = '0.' + spliteado[1];
  //         }
  //         this.tablaSistema[i][this.opcionHabilitarSistema] = value;
  //         this.dataSource[this.filaSel].editadoMetrado = 1;
  //         cambio = 1;
  //       }
  //     }
  //   }
  //   await this.calculoMontosSistema();
  //   const encontrado = await this.tablaSistema.filter(
  //     (ele) => ele.id_metrado !== null && !ele.estitulo && ele.esMetrado
  //   );
  //   this.ocultarChecks = encontrado.length;
  //   this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //   this.dataSource[this.filaSel].detalleMetrado = this.tablaSistema;
  //   await this.actualizarDataPrincipal();
  //   if (cambio == 1) {
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('verificarTextoSistema');
  //   }
  //   this.eventHandler();
  // }

  // async blurInputSistema(event, i, input) {
  //   this.tablaSistema[i]['editar' + input] = 0;
  //   await this.verificarTextoSistema(event.target.value, i, 9);
  //   this.eventHandler();
  // }

  // async actualizarTablaCompleta() {
  //   let cambio = 0;
  //   let permitirCambio = 0;
  //   let nuevo = [];
  //   let j = 0;
  //   let existeMetrado = false;
  //   this.ocultarChecks = 0;
  //   for (let i = 0; i < this.tablaSistema.length; i++) {
  //     this.tablaSistema[i].editarCopiar = false;
  //     if (
  //       this.tablaSistema[i].id_metrado !== null ||
  //       this.tablaSistema[i].descripcion ||
  //       this.tablaSistema[i].cantidad ||
  //       this.tablaSistema[i].n_veces ||
  //       this.tablaSistema[i].largo ||
  //       this.tablaSistema[i].ancho ||
  //       this.tablaSistema[i].altura
  //     ) {
  //       this.tablaSistema[i].id_metrado = j;

  //       if (
  //         !this.tablaSistema[i].esMetrado &&
  //         !this.tablaSistema[i].estitulo &&
  //         !existeMetrado
  //       ) {
  //         this.tablaSistema[i].esMetrado = 1;
  //         existeMetrado = true;
  //       } else if (this.tablaSistema[i].estitulo == 1) {
  //         existeMetrado = false;
  //       }

  //       if (this.tablaSistema[i].esMetrado && !this.tablaSistema[i].estitulo) {
  //         const sgteValido = await this.sgteValido(i + 1, 'tablaSistema');
  //         if (
  //           sgteValido?.sgteExistente &&
  //           !sgteValido?.sgteExistente?.esMetrado
  //         ) {
  //           this.tablaSistema[i].tieneSubmetrado = 1;
  //         } else {
  //           this.tablaSistema[i].tieneSubmetrado = 0;
  //         }

  //         // this.tablaSistema[i].estilo = arrayEstilos[1] ? arrayEstilos[1] : '';
  //       } else {
  //         if (
  //           this.tablaSistema[i].esMetrado &&
  //           this.tablaSistema[i].estitulo == 1
  //         ) {
  //           const sgteValido = await this.sgteValido(i + 1, 'tablaSistema');
  //           if (
  //             sgteValido?.sgteExistente &&
  //             !sgteValido?.sgteExistente?.esMetrado
  //           ) {
  //             await this.convertirSgtesSubAMert(i + 1, 'tablaSistema');
  //           }
  //           // this.tablaSistema[i].estilo = arrayEstilos[0] ? arrayEstilos[0] : '';
  //         } else if (!this.tablaSistema[i].esMetrado) {
  //           // this.tablaSistema[i].estilo = arrayEstilos[2]
  //           //   ? arrayEstilos[2]
  //           //   : '';
  //         }
  //         // if (this.tablaSistema[i].esMetrado && this.tablaSistema[i].estitulo == 2 && !this.tablaSistema[i].tieneSubmetrado) {
  //         //   this.tablaSistema[i].estilo = ''
  //         // }
  //         this.tablaSistema[i].tieneSubmetrado = 0;
  //       }
  //       if (this.tablaSistema[i].esMetrado && !this.tablaSistema[i].estitulo) {
  //         existeMetrado = true;
  //       }
  //       j++;
  //     }
  //     // }
  //     if (this.tablaSistema[i].tieneAceros) {
  //       permitirCambio = 1;
  //     }
  //     this.tablaSistema[i].parcial = this.formsService.redondeo(
  //       Number(this.tablaSistema[i].parcial),
  //       this.dec_metrado
  //     );
  //     this.tablaSistema[i].subtotal = this.formsService.redondeo(
  //       Number(this.tablaSistema[i].subtotal),
  //       this.dec_metrado
  //     );
  //     nuevo.push(this.tablaSistema[i]);
  //   }
  //   this.tablaSistema = nuevo;
  //   this.dataSource[this.filaSel].detalleMetrado = this.tablaSistema;
  //   const encontrado = await this.tablaSistema.filter(
  //     (ele) => ele.id_metrado !== null && !ele.estitulo && ele.esMetrado
  //   );
  //   if (encontrado.length == 1 && encontrado[0]?.tieneSubmetrado) {
  //     this.ocultarChecks = 2;
  //   } else {
  //     this.ocultarChecks = encontrado.length;
  //   }
  //   if (
  //     JSON.stringify(this.dataSource[this.filaSel].tablaInicialSistema) ===
  //     JSON.stringify(this.dataSource[this.filaSel].detalleMetrado)
  //   ) {
  //     this.dataSource[this.filaSel].editadoMetrado = 0;
  //   } else {
  //     this.dataSource[this.filaSel].editadoMetrado = 1;
  //     cambio = 1;
  //   }
  //   this.dataSource[this.filaSel].permitirCambio = permitirCambio;
  //   if (cambio == 1) {
  //     // this.guardarTablaTemporal('actualizarTablaCompleta')
  //   }
  //   if (this.filaSel2 !== -1) {
  //     this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //   }
  // }

  // async sgteValido(indice, tabla) {
  //   let sgteExistente = null;
  //   let index = null;
  //   for (let i = indice; i < this[tabla].length; i++) {
  //     const row = this[tabla][i];
  //     if (row.id_metrado !== null && row.estitulo !== 2) {
  //       sgteExistente = row;
  //       index = i;
  //       break;
  //     }
  //   }
  //   return { sgteExistente: sgteExistente, index: index };
  // }

  // async anteValido(indice, tabla) {
  //   let antExistente = null;
  //   let index = null;
  //   for (let i = indice; i >= 0; i--) {
  //     const row = this[tabla][i];
  //     if (row.id_metrado !== null && row.estitulo !== 2) {
  //       antExistente = row;
  //       index = i;
  //       break;
  //     }
  //   }
  //   return { antExistente: antExistente, index: index };
  // }

  // sgteColumna(columna, derecha) {
  //   let sgte = null;
  //   switch (columna) {
  //     case 'descripcion':
  //       sgte = !derecha ? 'descripcion' : 'cantidad';
  //       return sgte;
  //     case 'cantidad':
  //       sgte = !derecha ? 'descripcion' : 'n_veces';
  //       return sgte;
  //     case 'n_veces':
  //       sgte = !derecha ? 'cantidad' : 'largo';
  //       return sgte;
  //     case 'largo':
  //       sgte = !derecha ? 'n_veces' : 'ancho';
  //       return sgte;
  //     case 'ancho':
  //       sgte = !derecha ? 'largo' : 'altura';
  //       return sgte;
  //     case 'altura':
  //       sgte = !derecha ? 'ancho' : 'altura';
  //       return sgte;
  //     // case 'archivo':
  //     //   sgte = !derecha ? 'altura' : 'archivo';
  //     //   return sgte;
  //     default:
  //       return sgte;
  //   }
  // }

  // async calcularItem(item, posterior, desplazar = false) {
  //   const spliteado = item.split('.');
  //   const nivel = item.split('.').length;
  //   let nuevoItem = null;
  //   if (!desplazar) {
  //     const ultimo = spliteado.pop();
  //     if (posterior) {
  //       const ultimoDigito = Number(ultimo) + 1;
  //       nuevoItem =
  //         nivel == 1
  //           ? ultimoDigito.toString()
  //           : spliteado.join('.') + '.' + ultimoDigito;
  //     } else {
  //       const ultimoDigito = Number(ultimo) - 1;
  //       nuevoItem =
  //         nivel == 1
  //           ? ultimoDigito.toString()
  //           : spliteado.join('.') + '.' + ultimoDigito;
  //     }
  //   } else {
  //     if (nivel == 1) {
  //       if (posterior) {
  //         nuevoItem = (Number(spliteado[0]) + 1).toString();
  //       } else {
  //         nuevoItem = (Number(spliteado[0]) - 1).toString();
  //       }
  //     } else {
  //       if (posterior) {
  //         nuevoItem =
  //           (Number(spliteado[0]) + 1).toString() + '.' + spliteado[1];
  //       } else {
  //         nuevoItem =
  //           (Number(spliteado[0]) - 1).toString() + '.' + spliteado[1];
  //       }
  //     }
  //   }
  //   return nuevoItem;
  // }

  // async calculoMontosSistema() {
  //   let cambio = 0;
  //   let sumaTotal = 0;
  //   let sumaGrupo = 0;
  //   for (let i = this.tablaSistema.length - 1; i >= 0; i--) {
  //     const row = this.tablaSistema[i];
  //     if (row.id_metrado !== null) {
  //       let sumarow = 0;
  //       if (!row.tieneAceros && !row.estitulo) {
  //         let array = [];
  //         const largo =
  //           (await this.isNumber(row.largo)) &&
  //           row.largo !== null &&
  //           row.largo !== ''
  //             ? Number(row.largo)
  //             : null;
  //         const ancho =
  //           (await this.isNumber(row.ancho)) &&
  //           row.ancho !== null &&
  //           row.ancho !== ''
  //             ? Number(row.ancho)
  //             : null;
  //         const altura =
  //           (await this.isNumber(row.altura)) &&
  //           row.altura !== null &&
  //           row.altura !== ''
  //             ? Number(row.altura)
  //             : null;
  //         const cantidad =
  //           (await this.isNumber(row.cantidad)) &&
  //           row.cantidad !== null &&
  //           row.cantidad !== ''
  //             ? Number(row.cantidad)
  //             : null;
  //         const n_veces =
  //           (await this.isNumber(row.n_veces)) &&
  //           row.n_veces !== null &&
  //           row.n_veces !== ''
  //             ? Number(row.n_veces)
  //             : null;
  //         if (
  //           this.isNumber(row.largo) ||
  //           this.isNumber(row.ancho) ||
  //           this.isNumber(row.altura) ||
  //           this.isNumber(row.cantidad) ||
  //           this.isNumber(row.n_veces)
  //         ) {
  //           const array2 = [
  //             { key: cantidad, value: 'C' },
  //             { key: n_veces, value: 'D' },
  //             { key: largo, value: 'E' },
  //             { key: ancho, value: 'F' },
  //             { key: altura, value: 'G' },
  //           ];
  //           let validosFormula = [];
  //           if (row.id_padre == null) {
  //             validosFormula = ['C', '*', 'D', '*', 'E', '*', 'F', '*', 'G'];
  //           } else if (row.id_padre == '') {
  //             validosFormula = [];
  //           } else {
  //             validosFormula = this.convertirAArray(row.id_padre);
  //           }
  //           let i = 0;
  //           for (const iterator of validosFormula) {
  //             const operadores = ['*', '(', ')', '+', '-', '/'];
  //             if (operadores.includes(iterator) || !isNaN(Number(iterator))) {
  //               array.push(iterator);
  //               i++;
  //             } else {
  //               const encontrado = array2.find((ele) => ele.value == iterator);
  //               // if (encontrado) {
  //               //   if (encontrado.key !== null) {
  //               if (
  //                 encontrado.key == null &&
  //                 (row.id_padre == null || row.id_padre == 'C*D*E*F*G')
  //               ) {
  //                 if (
  //                   cantidad == null &&
  //                   n_veces == null &&
  //                   largo == null &&
  //                   ancho == null &&
  //                   altura == null
  //                 ) {
  //                   array.push(encontrado.key);
  //                 } else {
  //                   array.push(1);
  //                 }
  //               } else {
  //                 array.push(encontrado.key);
  //               }
  //               i++;
  //             }
  //           }
  //           const operadores = ['*', '(', '+', '-', '/'];
  //           const operadores2 = ['*', ')', '+', '-', '/'];
  //           if (operadores.includes(array[array.length - 1])) {
  //             array.pop();
  //           }
  //           if (operadores2.includes(array[0])) {
  //             array.shift();
  //           }
  //           let producto = null;
  //           if (array.includes(null)) {
  //             if (row.id_padre == null || row.id_padre == 'C*D*E*F*G') {
  //               row.item = '';
  //             } else {
  //               row.item = '1-1';
  //             }
  //             producto = 0;
  //           } else {
  //             producto = await this.calcularformula(array.join(''));
  //             row.item = '';
  //           }
  //           sumarow =
  //             producto == null
  //               ? 0
  //               : Number(
  //                   this.formsService.redondeo(producto, this.dec_metrado)
  //                 );
  //         } else {
  //           sumarow = 0;
  //         }
  //       } else {
  //       }
  //       if (!row.esMetrado) {
  //         this.tablaSistema[i].parcial = this.formsService.redondeo(
  //           sumarow,
  //           this.dec_metrado
  //         );
  //         this.tablaSistema[i].subtotal = this.formsService.redondeo(
  //           sumarow,
  //           this.dec_metrado
  //         );
  //         if (row.estitulo !== 2) {
  //           sumaGrupo = sumaGrupo + sumarow;
  //         }
  //       } else {
  //         if (!row.estitulo && !row.tieneAceros) {
  //           if (row.tieneSubmetrado) {
  //             this.tablaSistema[i].parcial = this.formsService.redondeo(
  //               0,
  //               this.dec_metrado
  //             );
  //             this.tablaSistema[i].subtotal = this.formsService.redondeo(
  //               sumaGrupo,
  //               this.dec_metrado
  //             );
  //           } else {
  //             sumaGrupo = sumaGrupo + sumarow;
  //             this.tablaSistema[i].parcial = this.formsService.redondeo(
  //               sumarow,
  //               this.dec_metrado
  //             );
  //             this.tablaSistema[i].subtotal = this.formsService.redondeo(
  //               sumaGrupo,
  //               this.dec_metrado
  //             );
  //           }
  //           if (row.estitulo == 0) {
  //             sumaTotal = sumaTotal + sumaGrupo;
  //           }
  //           sumaGrupo = 0;
  //         } else if (row.estitulo == 1) {
  //           this.tablaSistema[i].parcial = this.formsService.redondeo(
  //             0,
  //             this.dec_metrado
  //           );
  //           this.tablaSistema[i].subtotal = this.formsService.redondeo(
  //             0,
  //             this.dec_metrado
  //           );
  //           sumaGrupo = 0;
  //         } else if (row.tieneAceros) {
  //           sumaTotal = Number(row.subtotal);
  //           sumaGrupo = Number(row.subtotal);
  //           sumarow = Number(row.subtotal);
  //           sumaGrupo = 0;
  //         }
  //       }
  //     }
  //   }
  //   if (sumaTotal !== Number(this.dataSource[this.filaSel].metrado)) {
  //     if (
  //       JSON.stringify(this.dataSource[this.filaSel].tablaInicialSistema) !==
  //       JSON.stringify(this.tablaSistema)
  //     ) {
  //       this.dataSource[this.filaSel].editadoMetrado = 1;
  //       cambio = 1;
  //     } else {
  //       this.dataSource[this.filaSel].editadoMetrado = 0;
  //     }
  //     this.dataSource[this.filaSel].metrado = this.formsService.redondeo(
  //       sumaTotal,
  //       this.dec_metrado
  //     );
  //     this.dataSource[this.filaSel].ed_pre = 0;
  //     this.dataSource[this.filaSel].vinculado = 0;
  //     this.dataSource[this.filaSel].cant_metrado = this.formsService.redondeo(
  //       sumaTotal,
  //       this.dec_metrado
  //     );
  //     await this.calcularMontosRowPrincipal();
  //     this.dataSource[this.filaSel].detalleMetrado = this.tablaSistema;
  //   }
  //   await this.actualizarDataPrincipal();
  // }

  // isNumber(n) {
  //   return !isNaN(Number(n)) && isFinite(n);
  // }

  // async agregarMetrado(multiple = false) {
  //   if (this.metradoSeleccionado) {
  //     let indice = null;
  //     if (this.metradoSeleccionado.id_metrado !== null) {
  //       indice = this.filaSel2 + 1;
  //     } else {
  //       indice = this.filaSel2;
  //     }
  //     const metrado = new metradoModelo(
  //       '',
  //       1,
  //       '',
  //       1,
  //       this.partidaSeleccionada?.indice,
  //       this.idProyecto
  //     );
  //     this.tablaSistema.splice(indice, 0, metrado);
  //     if (!multiple) {
  //       await this.actualizarTablaCompleta();
  //       await this.calculoMontosSistema();
  //     }
  //     this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //   } else {
  //     this.toaster.error('Ninguna fila seleccionada', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  //   if (!multiple) {
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('agregarMEtrado');
  //   }
  // }

  // async agregarMultipleMetrado(cantidad) {
  //   for (let i = 0; i < cantidad; i++) {
  //     await this.agregarMetrado(true);
  //   }
  //   if (cantidad > 0) {
  //     await this.actualizarTablaCompleta();
  //     await this.calculoMontosSistema();
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('agregarMultipleMetrado');
  //   }
  // }

  // async agregarSubmetrado(multiple = false, idx = null) {
  //   let cambio = 0;
  //   if (this.metradoSeleccionado) {
  //     let index = null;
  //     if (idx == null) {
  //       index =
  //         this.metradoSeleccionado?.id_metrado !== null
  //           ? this.filaSel2 + 1
  //           : this.filaSel2;
  //     } else {
  //       index = idx;
  //     }
  //     if (
  //       this.metradoSeleccionado.esMetrado &&
  //       !this.metradoSeleccionado.estitulo
  //     ) {
  //       this.tablaSistema[this.filaSel2].tieneSubmetrado = 1;
  //       this.tablaSistema[this.filaSel2].tieneAceros = 0;
  //     }
  //     const subMetrado = new metradoModelo(
  //       '',
  //       0,
  //       '',
  //       index,
  //       this.partidaSeleccionada.indice,
  //       this.idProyecto
  //     );
  //     this.tablaSistema.splice(index, 0, subMetrado);
  //     if (!multiple) {
  //       await this.actualizarTablaCompleta();
  //       await this.calculoMontosSistema();
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal('agregarMEtrado');
  //     }
  //     this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //   } else {
  //     this.toaster.error('Ninguna fila seleccionada', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  // }

  // async agregarMultipleSubmetrado(cantidad) {
  //   let cambio = 0;
  //   if (this.popover2.isOpen()) {
  //     this.popover2.close();
  //   }
  //   if (this.metradoSeleccionado) {
  //     if (this.metradoSeleccionado.estitulo == 1) {
  //       this.toaster.error('No se puede agregar debajo de un título', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 3000,
  //       });
  //       return;
  //     }
  //     let index = null;
  //     const inicio =
  //       this.metradoSeleccionado.id_metrado !== null
  //         ? this.filaSel2 + 1
  //         : this.filaSel2;
  //     for (let i = 0; i < cantidad; i++) {
  //       const a = inicio + i;
  //       await this.agregarSubmetrado(true, a);
  //     }
  //     await this.actualizarTablaCompleta();
  //     await this.calculoMontosSistema();
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('agregarMultipleSubmetrado');
  //   } else {
  //     this.toaster.error('Ninguna fila Seleccionada', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  // }

  // async desplazarArriba() {
  //   if (!this.tablaSeleccionada) {
  //     if (this.metradoSeleccionado?.id_metrado !== null && this.filaSel2 > 0) {
  //       const dataMetrado = JSON.parse(
  //         JSON.stringify(this.metradoSeleccionado)
  //       );
  //       const indAnterior = this.filaSel2 - 1;
  //       if (this.tablaSistema[indAnterior]?.id_metrado == null) {
  //         this.tablaSistema[indAnterior] = dataMetrado;
  //         this.tablaSistema[this.filaSel2] = new metradoModelo(
  //           '',
  //           1,
  //           '',
  //           null,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         this.metradoSeleccionado = this.tablaSistema[indAnterior];
  //         this.filaSel2 = indAnterior;
  //         await this.actualizarTablaCompleta();
  //       } else {
  //         this.toaster.error('No se puede desplazar elemento', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       }
  //     } else {
  //       this.toaster.error('No se puede desplazar elemento', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     }
  //   } else {
  //     if (
  //       this.aceroSeleccionado?.id_metrado !== null &&
  //       this.aceroSeleccionado?.id_metrado > 0
  //     ) {
  //       const indAnterior = this.aceroSeleccionado.id_metrado - 1;
  //       if (this.tablaAceros[indAnterior]?.id_metrado == null) {
  //         this.tablaAceros[indAnterior] = this.aceroSeleccionado;
  //         this.tablaAceros[this.aceroSeleccionado.id_metrado] = new aceroModelo(
  //           null,
  //           1,
  //           null,
  //           null,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         this.aceroSeleccionado = this.tablaAceros[indAnterior];
  //         this.filaSel3 = indAnterior;
  //         await this.actualizarTablaCompletaAceros();
  //       } else {
  //         this.toaster.error('No se puede desplazar elemento', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       }
  //     } else {
  //       this.toaster.error('No se puede desplazar elemento', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     }
  //   }
  // }

  // async desplazarAbajo() {
  //   if (!this.tablaSeleccionada) {
  //     if (this.metradoSeleccionado?.id_metrado !== null) {
  //       const dataMetrado = JSON.parse(
  //         JSON.stringify(this.metradoSeleccionado)
  //       );
  //       const indSgte = this.filaSel2 + 1;
  //       if (
  //         this.tablaSistema[indSgte]?.id_metrado == null &&
  //         indSgte < this.tablaSistema.length
  //       ) {
  //         this.tablaSistema[indSgte] = dataMetrado;
  //         this.tablaSistema[this.filaSel2] = new metradoModelo(
  //           '',
  //           1,
  //           '',
  //           null,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         this.metradoSeleccionado = this.tablaSistema[indSgte];
  //         this.filaSel2 = indSgte;
  //         await this.actualizarTablaCompleta();
  //       } else {
  //         this.toaster.error('No se puede desplazar elemento', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       }
  //     } else {
  //       this.toaster.error('No se puede desplazar elemento', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     }
  //   } else {
  //     if (this.aceroSeleccionado?.id_metrado !== null) {
  //       const indSgte = this.aceroSeleccionado.id_metrado + 1;
  //       if (
  //         this.tablaAceros[indSgte]?.id_metrado == null &&
  //         indSgte < this.tablaAceros.length
  //       ) {
  //         this.tablaAceros[indSgte] = this.aceroSeleccionado;
  //         this.tablaAceros[this.aceroSeleccionado.id_metrado] = new aceroModelo(
  //           null,
  //           1,
  //           null,
  //           null,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         this.aceroSeleccionado = this.tablaAceros[indSgte];
  //         this.filaSel3 = indSgte;
  //         await this.actualizarTablaCompletaAceros();
  //       } else {
  //         this.toaster.error('No se puede desplazar elemento', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 2000,
  //         });
  //         return;
  //       }
  //     } else {
  //       this.toaster.error('No se puede desplazar elemento', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     }
  //   }
  // }

  // async limpiarMultiples() {
  //   if (!this.tablaSeleccionada) {
  //     for (let i = this.tablaSistema.length - 1; i >= 0; i--) {
  //       if (this.tablaSistema[i].editarCopiar) {
  //         const metrado = new metradoModelo(
  //           '',
  //           1,
  //           '',
  //           null,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         this.tablaSistema[i] = metrado;
  //       }
  //     }
  //     await this, this.actualizarTablaCompleta();
  //     this.arrayCopiadosAceros = [];
  //     this.arrayCopiadosMetrado = [];
  //     this.metradoSeleccionado = null;
  //     this.mostrarColrs = false;
  //     this.tempFormula = [];
  //     this.filaSel2 = -1;
  //     await this.calculoMontosSistema();
  //   } else {
  //     for (let i = this.tablaAceros.length - 1; i >= 0; i--) {
  //       if (this.tablaAceros[i].editarCopiar) {
  //         const acero = new aceroModelo(
  //           '',
  //           1,
  //           '',
  //           null,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         this.tablaAceros[i] = acero;
  //       }
  //     }
  //     await this, this.actualizarTablaCompletaAceros();
  //     this.arrayCopiadosAceros = [];
  //     this.arrayCopiadosMetrado = [];
  //     this.aceroSeleccionado = null;
  //     this.filaSel3 = -1;
  //     await this.calcularMontosAceros();
  //   }
  // }

  // async eliminarRow() {
  //   if (!this.tablaSeleccionada) {
  //     let arrayEliminar = [];
  //     if (this.habilitadoCopiar) {
  //       this.tablaSistema.map((ele, index) => {
  //         if (ele.editarCopiar) {
  //           arrayEliminar.push(index);
  //         }
  //       });
  //     } else {
  //       arrayEliminar.push(this.filaSel2);
  //     }
  //     arrayEliminar.sort((a, b) => b - a);
  //     for (let indice of arrayEliminar) {
  //       this.tablaSistema.splice(indice, 1);
  //     }
  //     this.habilitadoCopiar = false;

  //     await this.actualizarTablaCompleta();
  //     await this.calculoMontosSistema();
  //     await this.verificarParametrosCambioTabla();
  //     this.metradoSeleccionado = null;
  //     this.mostrarColrs = false;
  //     this.tempFormula = [];
  //     this.filaSel2 = -1;
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('eliminarRow');
  //   } else {
  //     let arrayEliminar = [];
  //     if (this.habilitadoCopiar) {
  //       this.tablaAceros.map((ele, index) => {
  //         if (ele.editarCopiar) {
  //           arrayEliminar.push(index);
  //         }
  //       });
  //     } else {
  //       arrayEliminar.push(this.filaSel3);
  //     }
  //     arrayEliminar.sort((a, b) => b - a);
  //     for (let indice of arrayEliminar) {
  //       // const acero = new aceroModelo(
  //       //   '',
  //       //   1,
  //       //   '',
  //       //   null,
  //       //   this.partidaSeleccionada.indice,
  //       //   this.idProyecto
  //       // );
  //       // this.tablaAceros[indice] = acero;
  //       this.tablaAceros.splice(indice, 1);
  //     }
  //     this.habilitadoCopiar = false;

  //     await this.actualizarTablaCompletaAceros();
  //     await this.calcularMontosAceros();
  //     // await this.verificarParametrosCambioTabla();
  //     this.aceroSeleccionado = null;
  //     this.mostrarColrs = false;
  //     this.tempFormula = [];
  //     this.filaSel3 = -1;
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('eliminarRow');
  //   }
  // }

  // async limpiarContenidoFila() {
  //   if (!this.tablaSeleccionada) {
  //     if (this.habilitadoCopiar) {
  //       this.tablaSistema = this.tablaSistema.map((ele) => {
  //         if (ele.editarCopiar) {
  //           // const metrado = new metradoModelo(
  //           //   null,
  //           //   1,
  //           //   '',
  //           //   null,
  //           //   this.partidaSeleccionada?.indice,
  //           //   this.idProyecto
  //           // );
  //           // ele = metrado;
  //           ele.descripcion = '';
  //           ele.cantidad = '';
  //           ele.n_veces = '';
  //           ele.largo = '';
  //           ele.ancho = '';
  //           ele.altura = '';
  //         }
  //         return ele;
  //       });
  //       this.copiadoCeldas = false;
  //     } else {
  //       if (this.copiadoCeldas) {
  //         await this.guardarSeleccionadosCeldas(true);
  //         this.copiadoCeldas = false;
  //       } else {
  //         if (this.metradoSeleccionado?.id_metrado !== null) {
  //           // const metrado = new metradoModelo(
  //           //   null,
  //           //   1,
  //           //   '',
  //           //   null,
  //           //   this.partidaSeleccionada?.indice,
  //           //   this.idProyecto
  //           // );
  //           this.tablaSistema[this.filaSel2].descripcion = '';
  //           this.tablaSistema[this.filaSel2].cantidad = '';
  //           this.tablaSistema[this.filaSel2].n_veces = '';
  //           this.tablaSistema[this.filaSel2].largo = '';
  //           this.tablaSistema[this.filaSel2].ancho = '';
  //           this.tablaSistema[this.filaSel2].altura = '';
  //           this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //         } else {
  //           this.toaster.error('Fila no valida', '', {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 2000,
  //           });
  //           return;
  //         }
  //       }
  //     }

  //     await this.actualizarTablaCompleta();
  //     await this.calculoMontosSistema();
  //   } else {
  //     if (this.habilitadoCopiar) {
  //       this.tablaAceros = this.tablaAceros.map((ele) => {
  //         if (ele.editarCopiar) {
  //           // const acero = new aceroModelo(
  //           //   null,
  //           //   1,
  //           //   '',
  //           //   null,
  //           //   this.partidaSeleccionada.indice,
  //           //   this.idProyecto
  //           // );
  //           // ele = acero;
  //           ele.descripcion = '';
  //           ele.cantidad = '';
  //           ele.elementos = '';
  //           ele.longitud = '';
  //           ele.diametro = '';
  //           ele.pesodiametro = null;
  //         }
  //         return ele;
  //       });
  //       this.copiadoCeldas = false;
  //     } else {
  //       if (this.copiadoCeldas) {
  //         // await this.guardarSeleccionadosCeldas(true)
  //         this.copiadoCeldas = false;
  //       } else {
  //         if (this.aceroSeleccionado?.id_metrado !== null) {
  //           // const acero = new aceroModelo(
  //           //   null,
  //           //   1,
  //           //   '',
  //           //   null,
  //           //   this.partidaSeleccionada.indice,
  //           //   this.idProyecto
  //           // );
  //           // this.tablaAceros[this.filaSel3] = acero;
  //           this.tablaAceros[this.filaSel3].descripcion = '';
  //           this.tablaAceros[this.filaSel3].cantidad = '';
  //           this.tablaAceros[this.filaSel3].elementos = '';
  //           this.tablaAceros[this.filaSel3].longitud = '';
  //           this.tablaAceros[this.filaSel3].diametro = '';
  //           this.tablaAceros[this.filaSel3].pesodiametro = null;
  //           this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //         } else {
  //           this.toaster.error('Fila no valida', '', {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 2000,
  //           });
  //           return;
  //         }
  //       }
  //     }
  //     await this.actualizarTablaCompletaAceros();
  //     await this.calcularMontosAceros();
  //   }
  //   this.habilitadoCopiar = false;
  //   await this.actualizarDataPrincipal();
  //   this.stiloFormula();
  //   this.guardarTablaTemporal('eliminarMultiples');
  // }

  // async eliminarMultiples() {
  //   if (!this.tablaSeleccionada) {
  //     for (let i = this.tablaSistema.length - 1; i >= 0; i--) {
  //       if (this.tablaSistema[i].editarCopiar) {
  //         this.tablaSistema.splice(i, 1);
  //         if (this.tablaSistema.length < 20) {
  //           const metrado = new metradoModelo(
  //             null,
  //             1,
  //             '',
  //             null,
  //             this.partidaSeleccionada.indice,
  //             this.idProyecto
  //           );
  //           this.tablaSistema.push(metrado);
  //         }
  //       }
  //     }
  //     await this, this.actualizarTablaCompleta();
  //     this.metradoSeleccionado = null;
  //     this.mostrarColrs = false;
  //     this.tempFormula = [];
  //     this.filaSel2 = -1;
  //     await this.calculoMontosSistema();
  //   } else {
  //     for (let i = this.tablaAceros.length - 1; i >= 0; i--) {
  //       if (this.tablaAceros[i].editarCopiar) {
  //         this.tablaAceros.splice(i, 1);
  //         if (this.tablaAceros.length < 20) {
  //           const acero = new aceroModelo(
  //             null,
  //             1,
  //             '',
  //             null,
  //             this.partidaSeleccionada.indice,
  //             this.idProyecto
  //           );
  //           this.tablaAceros.push(acero);
  //         }
  //       }
  //     }
  //     await this, this.actualizarTablaCompletaAceros();
  //     this.aceroSeleccionado = null;
  //     this.filaSel3 = -1;
  //     await this.calcularMontosAceros();
  //   }
  //   this.guardarTablaTemporal('eliminarMultiples');
  // }

  // async agregarFila(arriba = false) {
  //   let desplazar = arriba ? 0 : 1;
  //   if (!this.tablaSeleccionada) {
  //     if (this.metradoSeleccionado) {
  //       const metrado = new metradoModelo(
  //         null,
  //         1,
  //         '',
  //         null,
  //         this.partidaSeleccionada.indice,
  //         this.idProyecto
  //       );
  //       this.tablaSistema.splice(this.filaSel2 + desplazar, 0, metrado);
  //       this.filaSel2 = this.filaSel2 + (arriba ? 1 : 0);

  //       this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
  //     } else {
  //       const metrado = new metradoModelo(
  //         null,
  //         1,
  //         '',
  //         null,
  //         this.partidaSeleccionada.indice,
  //         this.idProyecto
  //       );
  //       this.tablaSistema.push(metrado);
  //     }
  //   } else {
  //     if (this.aceroSeleccionado) {
  //       const acero = new aceroModelo(
  //         null,
  //         1,
  //         '',
  //         null,
  //         this.partidaSeleccionada.indice,
  //         this.idProyecto
  //       );
  //       this.tablaAceros.splice(this.filaSel3 + desplazar, 0, acero);
  //       this.filaSel3 + desplazar;
  //       this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //     } else {
  //       const acero = new aceroModelo(
  //         null,
  //         1,
  //         '',
  //         null,
  //         this.partidaSeleccionada.indice,
  //         this.idProyecto
  //       );
  //       this.tablaAceros.push(acero);
  //     }
  //   }
  // }

  // async agregarFilas(arriba = false) {
  //   const cantidad = this.cantFil;
  //   for (let i = 0; i < cantidad; i++) {
  //     await this.agregarFila(arriba);
  //   }
  //   this.popover3.close();
  // }

  // async activarAceros(checked, i) {
  //   this.tablaSistema[this.filaSel2].tieneAceros = checked ? 1 : 0;
  //   if (checked) {
  //     this.bloquearBotones = true;
  //     this.partidaSeleccionada.permitirCambio = 1;
  //     this.dataSource[this.filaSel].permitirCambio = 1;
  //     await this.resumenAceros(true);
  //   } else {
  //     this.bloquearBotones = false;
  //     await this.resumenAceros(false);
  //   }
  //   this.dataSource[this.filaSel].editadoMetrado = 1;

  //   this.tablaSistema[this.filaSel2].cantidad = null;
  //   this.tablaSistema[this.filaSel2].n_veces = null;
  //   this.tablaSistema[this.filaSel2].largo = null;
  //   this.tablaSistema[this.filaSel2].ancho = null;
  //   this.tablaSistema[this.filaSel2].altura = null;
  //   this.tablaSistema[this.filaSel2].parcial = this.formsService.redondeo(
  //     0,
  //     this.dec_metrado
  //   );
  //   this.tablaSistema[this.filaSel2].subtotal = this.formsService.redondeo(
  //     0,
  //     this.dec_metrado
  //   );
  //   this.partidaSeleccionada = this.dataSource[this.filaSel];
  //   await this.actualizarDataPrincipal();
  //   this.stiloFormula();
  //   this.guardarTablaTemporal('activarAceros');
  // }

  // async resumenAceros(agregar = false) {
  //   if (!agregar) {
  //     for (let i = this.filaSel2 + 1; i < this.tablaSistema.length; i++) {
  //       let row = this.tablaSistema[i];
  //       if (
  //         row.n_veces == 'Peso =' ||
  //         row.n_veces == 'Peso Total' ||
  //         row.ancho == 'Longitud =' ||
  //         row.ancho == 'Long. Total'
  //       ) {
  //         const metrado = new metradoModelo(
  //           '',
  //           1,
  //           '',
  //           null,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         this.tablaSistema[i] = metrado;
  //       }
  //     }
  //   } else {
  //     const array = [];
  //     let sumaTotalPeso = 0;
  //     let sumaTotalLongitud = 0;
  //     for (const iterator of this.listaPesos) {
  //       const filtrados = this.tablaAceros.filter(
  //         (ele) =>
  //           ele.id_metrado !== null &&
  //           !ele.estitulo &&
  //           ((ele.esMetrado && !ele.tieneSubmetrado) || !ele.esMetrado) &&
  //           ele.diametro == iterator.medida
  //       );
  //       if (filtrados.length) {
  //         let sumaPeso = 0;
  //         let sumaLongitud = 0;
  //         filtrados.map((ele) => {
  //           sumaPeso = sumaPeso + Number(ele.parcial);
  //           sumaLongitud = sumaLongitud + Number(ele.total2);
  //         });
  //         sumaTotalPeso =
  //           sumaTotalPeso +
  //           Number(this.formsService.redondeo(sumaPeso, this.dec_metrado));
  //         sumaTotalLongitud =
  //           sumaTotalLongitud +
  //           Number(this.formsService.redondeo(sumaLongitud, this.dec_metrado));
  //         const obj = {
  //           descripcion: 'Acero Corrugado  de ' + iterator.medida,
  //           cantidad: iterator.medida,
  //           n_veces: 'Peso =',
  //           largo:
  //             Number(this.formsService.redondeo(sumaPeso, this.dec_metrado)) +
  //             ' Kg',
  //           ancho: 'Longitud =',
  //           altura:
  //             Number(
  //               this.formsService.redondeo(sumaLongitud, this.dec_metrado)
  //             ) + ' Varillas',
  //           esMetrado: 0,
  //           estitulo: 0,
  //         };
  //         let subMetrado = new metradoModelo(
  //           '',
  //           0,
  //           '',
  //           0,
  //           this.partidaSeleccionada.indice,
  //           this.idProyecto
  //         );
  //         for (const key in obj) {
  //           subMetrado[key] = obj[key];
  //         }
  //         array.push(subMetrado);
  //       }
  //     }
  //     const ind = this.tablaSistema.findIndex(
  //       (ele) => ele.id_metrado !== null && ele.tieneAceros
  //     );
  //     let i = ind + 1;
  //     let j = 1;
  //     for (const iterator of array) {
  //       iterator.id_metrado = j;
  //       this.tablaSistema[i] = iterator;
  //       i++;
  //       j++;
  //     }
  //   }
  // }

  // async limpiarMetrado(i) {
  //   this.tablaSistema[i].altura = null;
  //   this.tablaSistema[i].ancho = null;
  //   this.tablaSistema[i].cantidad = null;
  //   this.tablaSistema[i].largo = null;
  //   this.tablaSistema[i].tieneAceros = null;
  //   this.tablaSistema[i].tieneSubmetrado = 1;
  // }

  // tooltipTipo(partida) {
  //   let string = '';
  //   if (partida.vinculo) {
  //     string = 'Metrado vinculado en presupuesto';
  //   } else {
  //     if (partida.ed_pre) {
  //       string = 'Metrado  desde presupuesto';
  //     } else {
  //       if (partida.metrado == 0 && partida.cant_metrado == 0) {
  //         string = 'Metrado no registrado';
  //       } else if (
  //         partida.cant_metrado > 0 &&
  //         partida.cant_metrado !== partida.metrado
  //       ) {
  //         string = 'Metrado editado manualmente';
  //       } else if (
  //         partida.cant_metrado &&
  //         partida.metrado == partida.cant_metrado
  //       ) {
  //         string = 'Metrado de tabla hoja metrado';
  //       }
  //     }
  //   }

  //   // if (partida.ed_pre) {
  //   //   if (partida.cantidad == 0 && partida.metrado == 0) {
  //   //     texto = 'Metrado no Registrado';
  //   //   } else if (typeof partida.cantidad == 'number') {
  //   //     texto = 'Metrado de presupuesto';
  //   //   } else if (
  //   //     typeof partida.metrado == 'number' &&
  //   //     typeof partida.cantidad == 'number' &&
  //   //     (partida.metrado == partida.cantidad || partida.vinculado)
  //   //   ) {
  //   //     texto = 'Metrado vinculado';
  //   //   }
  //   // } else {
  //   //   if (partida.metrado == 0) {
  //   //     texto = 'Monto tabla metrado no registrado';
  //   //   } else
  //   //     if (typeof partida.metrado == 'number' &&
  //   //       typeof partida.cantidad == 'number' &&
  //   //       partida.metrado !== partida.cantidad) {
  //   //       texto = 'Tabla metrado registrado pero difiere de metrado presupuesto';
  //   //     } else if (
  //   //       typeof partida.metrado == 'number' &&
  //   //       typeof partida.cantidad == 'number' &&
  //   //       (partida.metrado == partida.cantidad || partida.vinculado)
  //   //     ) {
  //   //       texto = 'Metrado vinculado';
  //   //     }
  //   // }
  //   return string;
  // }

  // tipoClass(partida) {
  //   let string = '';
  //   if (partida.vinculo) {
  //     string = 'fa fa-code-fork fa-rotate-270 text-success';
  //   } else {
  //     if (partida.ed_pre) {
  //       string = 'fa-exclamation-triangle text-warning2';
  //     } else {
  //       if (partida.metrado == 0 && partida.cant_metrado == 0) {
  //         string = 'fa-exclamation-triangle text-danger';
  //       } else if (
  //         partida.cant_metrado > 0 &&
  //         partida.cant_metrado !== partida.metrado
  //       ) {
  //         string = 'fa-pencil-square-o text-primary';
  //       } else if (partida.metrado && partida.metrado == partida.cant_metrado) {
  //         string = 'fa-th-list text-primary ';
  //       }
  //     }
  //   }

  //   // if (partida.cantidad == 0 && partida.metrado == 0) {
  //   //   string = 'fa-exclamation-triangle text-danger';
  //   // } else if (typeof partida.cantidad == 'number' && partida.metrado == 0) {
  //   //   string = 'fa-exclamation-triangle text-warning2';
  //   // } else if (typeof partida.metrado == 'number' && partida.cantidad == 0) {
  //   //   string = 'fa-pencil-square-o text-primary ';
  //   // } else if (
  //   //   typeof partida.metrado == 'number' &&
  //   //   typeof partida.cantidad == 'number' &&
  //   //   partida.metrado !== partida.cantidad
  //   // ) {
  //   //   string = 'fa-pencil-square-o text-warning2';
  //   // } else if (
  //   //   typeof partida.metrado == 'number' &&
  //   //   typeof partida.cantidad == 'number' &&
  //   //   (partida.metrado == partida.cantidad || partida.vinculado)
  //   // ) {
  //   //   string = 'fa fa-code-fork fa-rotate-270 text-success';
  //   // }
  //   return string;
  // }

  // toggleOnSistema(index) {
  //   this.tablaSistema[index].icomost = 0;
  //   for (let i = index + 1; i < this.tablaSistema.length; i++) {
  //     const row = this.tablaSistema[i];
  //     if (this.tablaSistema[index].estitulo == 1) {
  //       if (!row.estitulo || row.estitulo == 2) {
  //         this.tablaSistema[i].mostrar = 1;
  //         this.tablaSistema[i].icomost = 0;
  //       } else {
  //         break;
  //       }
  //     } else if (this.tablaSistema[index].estitulo == 0) {
  //       if (!row.esMetrado || row.id_metrado == null) {
  //         this.tablaSistema[i].mostrar = 1;
  //         this.tablaSistema[i].icomost = 0;
  //       } else {
  //         break;
  //       }
  //     } else {
  //       if (!row.estitulo) {
  //         this.tablaSistema[i].mostrar = 1;
  //         this.tablaSistema[i].icomost = 0;
  //       } else {
  //         break;
  //       }
  //     }
  //   }
  // }

  // async toggleOffSistema(index) {
  //   this.tablaSistema[index].icomost = 1;
  //   let existe = false;
  //   for (let i = index + 1; i < this.tablaSistema.length; i++) {
  //     const row = this.tablaSistema[i];
  //     if (row.id_metrado !== null) {
  //       existe = true;
  //       break;
  //     }
  //   }
  //   if (index + 1 > this.tablaSistema.length || !existe) {
  //     return;
  //   }
  //   for (let i = index + 1; i < this.tablaSistema.length; i++) {
  //     const row = this.tablaSistema[i];
  //     // if (this.tablaSistema[i].id_metrado !== null) {
  //     const ext = await this.sgteexistente(i, 'tablaSistema');
  //     if (this.tablaSistema[index].estitulo == 1 && ext) {
  //       if (!row.estitulo || row.estitulo == 2) {
  //         this.tablaSistema[i].mostrar = 0;
  //       } else {
  //         break;
  //       }
  //     } else if (
  //       !this.tablaSistema[index].estitulo &&
  //       this.tablaSistema[index].esMetrado
  //     ) {
  //       if (
  //         (!row.esMetrado || (row.esMetrado && row.id_metrado == null)) &&
  //         ext
  //       ) {
  //         this.tablaSistema[i].mostrar = 0;
  //       } else {
  //         break;
  //       }
  //     } else {
  //       if (!row.estitulo && ext) {
  //         this.tablaSistema[i].mostrar = 0;
  //       } else {
  //         break;
  //       }
  //     }
  //     // }
  //   }
  // }

  // async sgteexistente(ind, tabla) {
  //   let existe = false;
  //   for (let i = ind; i < this[tabla].length; i++) {
  //     const element = this[tabla][i];
  //     if (element.id_metrado !== null) {
  //       existe = true;
  //       break;
  //     }
  //   }
  //   return existe;
  // }

  // async antexistente(ind, tabla) {
  //   let existe = false;
  //   for (let i = ind; i >= 0; i--) {
  //     const element = this[tabla][i];
  //     if (element.id_metrado !== null) {
  //       existe = true;
  //       break;
  //     }
  //   }
  //   return existe;
  // }

  // maxtodoMetrado() {
  //   for (let row of this.tablaSistema) {
  //     if (row.id_metrado !== null) {
  //       row.mostrar = 1;
  //     }
  //     row.icomost = 0;
  //   }
  // }

  // async mintodoMetrado() {
  //   let titulo = false;
  //   let metrado = false;
  //   let i = 0;
  //   for (let row of this.tablaSistema) {
  //     const ext = await this.sgteexistente(i, 'tablaSistema');
  //     if (!ext) {
  //       break;
  //     }
  //     if (row.estitulo == 1) {
  //       titulo = true;
  //     } else if (row.esMetrado && !row.estitulo) {
  //       metrado = true;
  //     }
  //     if (titulo) {
  //       if (row.estitulo == 1) {
  //         row.icomost = 1;
  //         row.mostrar = 1;
  //       } else {
  //         row.estmost = row.mostrar;
  //         row.mostrar = 0;
  //       }
  //     } else if (!titulo && metrado) {
  //       if (row.estitulo == 1) {
  //         row.icomost = 0;
  //         row.mostrar = 1;

  //         titulo = true;
  //       } else if (row.esMetrado) {
  //         row.icomost = 0;
  //         row.mostrar = 1;
  //         metrado = true;
  //       } else {
  //         row.estmost = row.mostrar;
  //         row.mostrar = 0;
  //       }
  //     }

  //     i++;
  //   }
  // }

  // maxtodoAcero() {
  //   for (let row of this.tablaAceros) {
  //     if (row.id_metrado !== null) {
  //       row.mostrar = 1;
  //     }
  //     row.icomost = 0;
  //   }
  // }

  // async mintodoAcero() {
  //   let titulo = false;
  //   let metrado = false;
  //   let i = 0;
  //   for (let row of this.tablaAceros) {
  //     const ext = await this.sgteexistente(i, 'tablaAceros');
  //     if (!ext) {
  //       break;
  //     }
  //     if (row.estitulo == 1) {
  //       titulo = true;
  //     } else if (row.esMetrado && !row.estitulo) {
  //       metrado = true;
  //     }
  //     if (titulo) {
  //       if (row.estitulo == 1) {
  //         row.icomost = 1;
  //         row.mostrar = 1;
  //       } else {
  //         row.estmost = row.mostrar;
  //         row.mostrar = 0;
  //       }
  //     } else if (!titulo && metrado) {
  //       if (row.estitulo == 1) {
  //         row.icomost = 0;
  //         row.mostrar = 1;

  //         titulo = true;
  //       } else if (row.esMetrado) {
  //         row.icomost = 0;
  //         row.mostrar = 1;
  //         metrado = true;
  //       } else {
  //         row.estmost = row.mostrar;
  //         row.mostrar = 0;
  //       }
  //     }

  //     i++;
  //   }
  // }

  // async cambiarColorSeleccion(event) {
  //   // if (!this.tablaSeleccionada) {
  //   //   const stilo = this.dataSource[this.filaSel].estilo ? JSON.parse(this.dataSource[this.filaSel].estilo) : [];
  //   //   !stilo.length ? (stilo.length = 3) : '';
  //   //   const row = this.tablaSistema[this.filaSel2];
  //   //   const tipo = !row.esMetrado ? 2 : row.estitulo ? 0 : 1;
  //   //   const estiloTipo = stilo[tipo] ? stilo[tipo] : '';
  //   //   var spliteado = estiloTipo ? estiloTipo.split('||') : ['', ''];
  //   //   if (row.esMetrado) {
  //   //     if (row.estitulo) {
  //   //       stilo[0] = event + '||' + (spliteado[1] ? spliteado[1] : '');
  //   //     } else {
  //   //       stilo[1] = event + '||' + (spliteado[1] ? spliteado[1] : '');
  //   //     }
  //   //   } else {
  //   //     stilo[2] = event + '||' + (spliteado[1] ? spliteado[1] : '');
  //   //   }
  //   //   !stilo[0] ? (stilo[0] = '') : '';
  //   //   !stilo[1] ? (stilo[1] = '') : '';
  //   //   !stilo[2] ? (stilo[2] = '') : '';
  //   //   this.dataSource[this.filaSel].estilo = JSON.stringify(stilo);
  //   //   this.dataSource[this.filaSel].editadoMetrado = 1;
  //   //   await this.actualizarTablaCompleta();
  //   // } else {
  //   //   const stilo = this.dataSource[this.filaSel].estilo
  //   //     ? JSON.parse(this.dataSource[this.filaSel].estilo)
  //   //     : [];
  //   //   !stilo.length ? (stilo.length = 3) : '';
  //   //   const row = this.tablaAceros[this.filaSel3];
  //   //   const tipo = !row.esMetrado ? 2 : row.estitulo ? 0 : 1;
  //   //   const estiloTipo = stilo[tipo] ? stilo[tipo] : '';
  //   //   var spliteado = estiloTipo ? estiloTipo.split('||') : ['', ''];
  //   //   if (row.esMetrado) {
  //   //     if (row.estitulo) {
  //   //       stilo[0] = event + '||' + (spliteado[1] ? spliteado[1] : '');
  //   //     } else {
  //   //       stilo[1] = event + '||' + (spliteado[1] ? spliteado[1] : '');
  //   //     }
  //   //   } else {
  //   //     stilo[2] = event + '||' + (spliteado[1] ? spliteado[1] : '');
  //   //   }
  //   //   !stilo[0] ? (stilo[0] = '') : '';
  //   //   !stilo[1] ? (stilo[1] = '') : '';
  //   //   !stilo[2] ? (stilo[2] = '') : '';
  //   //   this.dataSource[this.filaSel].estilo = JSON.stringify(stilo);
  //   //   this.dataSource[this.filaSel].editadoMetrado = 1;
  //   //   await this.actualizarTablaCompletaAceros();
  //   // }
  //   // await this.actualizarDataPrincipal();
  //   // this.guardarTablaTemporal('cambiarColorSeleccion')
  // }

  // async alinearTipos() {
  //   // if (!this.tablaSeleccionada) {
  //   //   const stilo = this.dataSource[this.filaSel].estilo
  //   //     ? JSON.parse(this.dataSource[this.filaSel].estilo)
  //   //     : [];
  //   //   const row = this.tablaSistema[this.filaSel2];
  //   //   const tipo = !row.esMetrado ? 2 : row.estitulo ? 0 : 1;
  //   //   const estiloTipo = stilo[tipo] ? stilo[tipo] : '';
  //   //   var spliteado = estiloTipo ? estiloTipo.split('||') : ['', ''];
  //   //   const textoStyle = spliteado[1] ? spliteado[1] : '';
  //   //   let string = !textoStyle
  //   //     ? 'text-center'
  //   //     : textoStyle == 'text-left'
  //   //       ? 'text-center'
  //   //       : textoStyle == 'text-center'
  //   //         ? 'text-right'
  //   //         : 'text-left';
  //   //   !stilo.length ? (stilo.length = 3) : '';
  //   //   if (row.esMetrado) {
  //   //     if (row.estitulo) {
  //   //       stilo[0] = (spliteado[0] ? spliteado[0] : '') + '||' + string;
  //   //     } else {
  //   //       stilo[1] = (spliteado[0] ? spliteado[0] : '') + '||' + string;
  //   //     }
  //   //   } else {
  //   //     stilo[2] = (spliteado[0] ? spliteado[0] : '') + '||' + string;
  //   //   }
  //   //   !stilo[0] ? (stilo[0] = '') : '';
  //   //   !stilo[1] ? (stilo[1] = '') : '';
  //   //   !stilo[2] ? (stilo[2] = '') : '';
  //   //   this.dataSource[this.filaSel].estilo = JSON.stringify(stilo);
  //   //   this.dataSource[this.filaSel].editadoMetrado = 1;
  //   //   await this.actualizarTablaCompleta();
  //   // } else {
  //   //   const stilo = this.dataSource[this.filaSel].estilo
  //   //     ? JSON.parse(this.dataSource[this.filaSel].estilo)
  //   //     : [];
  //   //   const row = this.tablaAceros[this.filaSel3];
  //   //   const tipo = !row.esMetrado ? 2 : row.estitulo ? 0 : 1;
  //   //   const estiloTipo = stilo[tipo] ? stilo[tipo] : '';
  //   //   var spliteado = estiloTipo ? estiloTipo.split('||') : ['', ''];
  //   //   const textoStyle = spliteado[1] ? spliteado[1] : '';
  //   //   let string = !textoStyle
  //   //     ? 'text-center'
  //   //     : textoStyle == 'text-left'
  //   //       ? 'text-center'
  //   //       : textoStyle == 'text-center'
  //   //         ? 'text-right'
  //   //         : 'text-left';
  //   //   !stilo.length ? (stilo.length = 3) : '';
  //   //   if (row.esMetrado) {
  //   //     if (row.estitulo) {
  //   //       stilo[0] = (spliteado[0] ? spliteado[0] : '') + '||' + string;
  //   //     } else {
  //   //       stilo[1] = (spliteado[0] ? spliteado[0] : '') + '||' + string;
  //   //     }
  //   //   } else {
  //   //     stilo[2] = (spliteado[0] ? spliteado[0] : '') + '||' + string;
  //   //   }
  //   //   !stilo[0] ? (stilo[0] = '') : '';
  //   //   !stilo[1] ? (stilo[1] = '') : '';
  //   //   !stilo[2] ? (stilo[2] = '') : '';
  //   //   this.dataSource[this.filaSel].estilo = JSON.stringify(stilo);
  //   //   this.dataSource[this.filaSel].editadoMetrado = 1;
  //   //   await this.actualizarTablaCompletaAceros();
  //   // }
  //   // await this.actualizarDataPrincipal();
  //   // this.guardarTablaTemporal('alinearTipos')
  // }

  // async evaluarEstilosTabla(partida, tabla) {
  //   let stilo = '';
  //   // const partidaTitulo = this.dataSource[0];
  //   // let stilosSecundarios = partidaTitulo.estilo ? JSON.parse(partidaTitulo.estilo) : ['', '', ''];
  //   // if (partida.estitulo) {
  //   //   const encontrado = await this[tabla].find(
  //   //     (ele) => ele.estitulo && ele.id_metrado !== null && ele.estilo
  //   //   );
  //   //   stilo = encontrado
  //   //     ? encontrado.estilo
  //   //     : stilosSecundarios[0]
  //   //       ? stilosSecundarios[0]
  //   //       : '';
  //   // } else if (!partida.estitulo && partida.esMetrado) {
  //   //   const encontrado = await this[tabla].find(
  //   //     (ele) =>
  //   //       !ele.estitulo &&
  //   //       ele.esMetrado &&
  //   //       ele.id_metrado !== null &&
  //   //       ele.estilo
  //   //   );
  //   //   stilo = encontrado
  //   //     ? encontrado.estilo
  //   //     : stilosSecundarios[1]
  //   //       ? stilosSecundarios[1]
  //   //       : '';
  //   // } else if (!partida.esMetrado) {
  //   //   const encontrado = await this[tabla].find(
  //   //     (ele) => !ele.esMetrado && ele.id_metrado !== null && ele.estilo
  //   //   );
  //   //   stilo = encontrado
  //   //     ? encontrado.estilo
  //   //     : stilosSecundarios[2]
  //   //       ? stilosSecundarios[2]
  //   //       : '';
  //   // }

  //   return stilo;
  // }

  // async configurarColorGlobal() {
  //   // const sw = await SwalService.confirm(
  //   //   'Estas seguro?',
  //   //   null,
  //   //   'Se priorizara el estilo seleccionado de todas las tablas metrado y tabla aceros  del proyecto '
  //   // );
  //   // if (sw.isConfirmed) {
  //   //   const partidaTitulo = this.dataSource[0];
  //   //   let stilosPrincipal;
  //   //   let stilos = partidaTitulo.estilo
  //   //     ? JSON.parse(partidaTitulo.estilo)
  //   //     : ['', '', ''];
  //   //   if (!this.tablaSeleccionada) {
  //   //     if (this.metradoSeleccionado?.id_metrado == null) {
  //   //       this.toaster.error('Ninguna fila seleccionada', '', {
  //   //         closeButton: false,
  //   //         positionClass: 'toast-bottom-right',
  //   //         timeOut: 2000,
  //   //       });
  //   //       return;
  //   //     }
  //   //     if (!this.metradoSeleccionado?.estilo) {
  //   //       this.toaster.error('Fila con ningun estilo', 'Error', {
  //   //         closeButton: false,
  //   //         positionClass: 'toast-bottom-right',
  //   //         timeOut: 2000,
  //   //       });
  //   //       return;
  //   //     }
  //   //     const stilos = this.dataSource[this.filaSel].estilo
  //   //       ? JSON.parse(this.dataSource[this.filaSel].estilo)
  //   //       : ['', '', ''];
  //   //     let tipoSelect = null;
  //   //     !this.metradoSeleccionado.esMetrado
  //   //       ? (tipoSelect = 3)
  //   //       : !this.metradoSeleccionado.estitulo
  //   //         ? (tipoSelect = 1)
  //   //         : (tipoSelect = 0);
  //   //     stilosPrincipal = this.dataSource[0].estilo
  //   //       ? JSON.parse(this.dataSource[0].estilo)
  //   //       : ['', '', ''];
  //   //     stilosPrincipal[tipoSelect] = stilos[tipoSelect];
  //   //   } else {
  //   //     if (this.aceroSeleccionado?.id_metrado == null) {
  //   //       this.toaster.error('Ninguna fila seleccionada', '', {
  //   //         closeButton: false,
  //   //         positionClass: 'toast-bottom-right',
  //   //         timeOut: 2000,
  //   //       });
  //   //       return;
  //   //     }
  //   //     if (!this.aceroSeleccionado?.estilo) {
  //   //       this.toaster.error('Fila con ningun estilo', 'Error', {
  //   //         closeButton: false,
  //   //         positionClass: 'toast-bottom-right',
  //   //         timeOut: 2000,
  //   //       });
  //   //       return;
  //   //     }
  //   //     const stilos = this.dataSource[this.filaSel].estilo
  //   //       ? JSON.parse(this.dataSource[this.filaSel].estilo)
  //   //       : ['', '', ''];
  //   //     let tipoSelect = null;
  //   //     !this.aceroSeleccionado.esMetrado
  //   //       ? (tipoSelect = 3)
  //   //       : !this.aceroSeleccionado.estitulo
  //   //         ? (tipoSelect = 1)
  //   //         : (tipoSelect = 0);
  //   //     stilosPrincipal = this.dataSource[0].estilo
  //   //       ? JSON.parse(this.dataSource[0].estilo)
  //   //       : ['', '', ''];
  //   //     stilosPrincipal[tipoSelect] = stilos[tipoSelect];
  //   //   }
  //   //   !stilos[0] ? (stilos[0] = '') : stilos[0];
  //   //   !stilos[1] ? (stilos[1] = '') : stilos[1];
  //   //   !stilos[2] ? (stilos[2] = '') : stilos[2];
  //   //   !stilos[0] && !stilos[1] && !stilos[2] ? (stilos = '') : stilos;
  //   //   for (let titulo of this.dataTitulos) {
  //   //     if (titulo.tipo == 0) {
  //   //       titulo.data[0].estilo = JSON.stringify(stilosPrincipal);
  //   //       titulo.data[0].editadoMetrado = 1;
  //   //       titulo.modificado = true;
  //   //     }
  //   //   }
  //   // }
  //   // await this.actualizarDataPrincipal();
  //   // this.guardarTablaTemporal('configurarColorGlobal')
  // }

  // async eliminarStilosLocales() {
  //   // const tipoSelect = this.tablaSeleccionada
  //   //   ? 'aceroSeleccionado'
  //   //   : 'metradoSeleccionado';
  //   // let tipoSeleccionado = null;
  //   // if (this.filaSel2 == -1 && this.filaSel3 == -1) {
  //   //   tipoSeleccionado = 3;
  //   // } else {
  //   //   tipoSeleccionado = !this[tipoSelect].esMetrado
  //   //     ? 2
  //   //     : this[tipoSelect].estitulo
  //   //       ? 0
  //   //       : 1;
  //   // }
  //   // var stilos = this.dataSource[0].estilo
  //   //   ? JSON.parse(this.dataSource[0].estilo)
  //   //   : ['', '', ''];
  //   // tipoSeleccionado == 3
  //   //   ? (stilos = ['', '', ''])
  //   //   : stilos[tipoSeleccionado] == '';
  //   // if (this.dataSource[this.filaSel2].detalleAcero.length) {
  //   //   for (let metrado of this.dataSource[this.filaSel].detalleMetrado) {
  //   //     if (
  //   //       tipoSeleccionado == 2 &&
  //   //       metrado.id_metrado !== null &&
  //   //       !metrado.esMetrado
  //   //     ) {
  //   //       metrado.estilo = stilos[2];
  //   //     } else if (
  //   //       tipoSeleccionado == 1 &&
  //   //       metrado.id_metrado !== null &&
  //   //       !metrado.estitulo &&
  //   //       metrado.esMetrado
  //   //     ) {
  //   //       metrado.estilo = stilos[1];
  //   //     } else if (
  //   //       tipoSeleccionado == 0 &&
  //   //       metrado.id_metrado !== null &&
  //   //       metrado.estitulo
  //   //     ) {
  //   //       metrado.estilo = stilos[0];
  //   //     } else if (tipoSeleccionado == 3 && metrado.id_metrado !== null) {
  //   //       metrado.estilo = '';
  //   //     }
  //   //   }
  //   // }
  //   // if (this.dataSource[this.filaSel2].detalleAcero.length) {
  //   //   for (let acero of this.dataSource[this.filaSel2].detalleAcero) {
  //   //     if (
  //   //       tipoSeleccionado == 2 &&
  //   //       acero.id_metrado !== null &&
  //   //       !acero.esMetrado
  //   //     ) {
  //   //       acero.estilo = stilos[2];
  //   //     } else if (
  //   //       tipoSeleccionado == 1 &&
  //   //       acero.id_metrado !== null &&
  //   //       !acero.estitulo &&
  //   //       acero.esMetrado
  //   //     ) {
  //   //       acero.estilo = stilos[1];
  //   //     } else if (
  //   //       tipoSeleccionado == 0 &&
  //   //       acero.id_metrado !== null &&
  //   //       acero.estitulo
  //   //     ) {
  //   //       acero.estilo = stilos[0];
  //   //     } else if (tipoSeleccionado == 3 && acero.id_metrado !== null) {
  //   //       acero.estilo = '';
  //   //     }
  //   //   }
  //   // }
  //   // this.dataSource[this.filaSel].estilo = JSON.stringify(stilos);
  //   // this.dataSource[this.filaSel].editadoMetrado = 1;
  //   // this.guardarTablaTemporal('eliminarStilosLocales')
  // }

  // // tabla Aceros
  // async iniciarTablaAceros(tabla, index) {
  //   this.tablaAceros = [];
  //   if (!this.partidaSeleccionada?.tablaInicialAcero.length) {
  //     this.buscando2 = true;
  //     if (tabla.length) {
  //       for (let fila of tabla) {
  //         let stilo = '';

  //         const formula = await this.calcularFormulaAceros(fila);
  //         const acero = new aceroModelo(
  //           fila.descripcion,
  //           fila.esMetrado,
  //           fila.item,
  //           fila.id_metrado,
  //           fila.indice,
  //           fila.id_proyecto,
  //           fila.cantidad,
  //           fila.diametro,
  //           fila.elementos,
  //           fila.total1,
  //           fila.longitud,
  //           fila.total2,
  //           fila.pesodiametro,
  //           this.formsService.redondeo(fila.parcial, this.dec_metrado),
  //           this.formsService.redondeo(fila.subtotal, this.dec_metrado),
  //           formula,
  //           fila.tieneSubmetrado,
  //           fila.estitulo,
  //           0,
  //           false,
  //           false,
  //           0,
  //           0,
  //           0,
  //           0,
  //           0,
  //           0,
  //           0,
  //           0,
  //           fila.archivo,
  //           stilo,
  //           0,
  //           1,
  //           0
  //         );
  //         this.tablaAceros.push(acero);
  //       }
  //     }
  //     if (this.tablaAceros.length < this.cantidadFilasTabla) {
  //       const faltantes = this.cantidadFilasTabla - this.tablaAceros.length;
  //       for (let i = 0; i < faltantes; i++) {
  //         const row = new aceroModelo(
  //           '',
  //           1,
  //           '',
  //           null,
  //           this.partidaSeleccionada?.indice,
  //           this.idProyecto
  //         );
  //         this.tablaAceros.push(row);
  //       }
  //     }
  //     this.dataSource[index].tablaInicialAcero = JSON.parse(
  //       JSON.stringify(this.tablaAceros)
  //     );
  //     await this.calcularMontosAceros(true);
  //     this.buscando2 = false;
  //   } else {
  //     this.buscando2 = true;
  //     this.tablaAceros = this.partidaSeleccionada.detalleAcero;
  //     this.buscando2 = false;
  //   }
  //   await this.actualizarDataPrincipal();
  // }

  // async seleccionRowAceros(i) {
  //   if (this.habilitarMultipleSelect || this.habilitadoCopiar) {
  //     return;
  //   }
  //   this.filaSel3 = i;
  //   this.aceroSeleccionado = this.tablaAceros[i];
  // }

  // async habilitarEditarAceros(celda, rowIndex) {
  //   if (this.solover || !this.editable) {
  //     return;
  //   }
  //   if (!this.partidaSeleccionada?.unidad) {
  //     return;
  //   }
  //   if (
  //     (this.aceroSeleccionado?.estitulo ||
  //       this.aceroSeleccionado?.tieneSubmetrado) &&
  //     celda == 'diametro'
  //   ) {
  //     return;
  //   }
  //   // if (this.aceroSeleccionado?.estitulo == 1 && celda !== 'diametro') {
  //   //   return
  //   // }
  //   if (
  //     (this.aceroSeleccionado?.estitulo ||
  //       (this.aceroSeleccionado?.esMetrado &&
  //         this.aceroSeleccionado?.tieneSubmetrado)) &&
  //     celda == 'diametro'
  //   ) {
  //     return;
  //   }
  //   this.opcionHabilitarAceros = celda;
  //   this.filaSel3 = rowIndex;
  //   this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //   this.tablaAceros[rowIndex]['editar' + celda] = 1;
  // }

  // async blurInputAceros(event, i, input) {
  //   if (this.opcionHabilitarAceros == 'diametro') {
  //     return;
  //   }
  //   this.tablaAceros[i]['editar' + input] = 0;
  //   await this.verificarTextoAceros(event.target.value, i);
  // }

  // async verificarTextoAceros(event, i) {
  //   let cambio = 0;
  //   if (event == undefined) {
  //     return;
  //   }
  //   if (this.tablaAceros[i].id_metrado !== null) {
  //     if (
  //       (this.tablaAceros[i][this.opcionHabilitarAceros] == null
  //         ? ''
  //         : this.tablaAceros[i][this.opcionHabilitarAceros]) !== event
  //     ) {
  //       const spliteado = event?.split('.');
  //       if (
  //         spliteado &&
  //         spliteado.length == 2 &&
  //         !isNaN(Number(spliteado[1])) &&
  //         !spliteado[0]
  //       ) {
  //         event = '0.' + spliteado[1];
  //       }
  //       this.tablaAceros[i][this.opcionHabilitarAceros] = event;
  //       await this.calcularMontosAceros();
  //       cambio = 1;
  //     }
  //   } else {
  //     if (
  //       event !== '' &&
  //       this.opcionHabilitarAceros == 'descripcion' &&
  //       this.tablaAceros[i].id_metrado == null
  //     ) {
  //       const spliteado = event?.split('.');
  //       if (
  //         spliteado &&
  //         spliteado.length == 2 &&
  //         !isNaN(Number(spliteado[1])) &&
  //         !spliteado[0]
  //       ) {
  //         event = '0.' + spliteado[1];
  //       }
  //       this.tablaAceros[i] = new aceroModelo(
  //         event,
  //         1,
  //         '1',
  //         0,
  //         this.partidaSeleccionada.indice,
  //         this.idProyecto,
  //         null,
  //         null,
  //         null,
  //         0,
  //         null,
  //         0
  //       );
  //       this.dataSource[this.filaSel].editadoMetrado = 1;
  //       await this.actualizarTablaCompletaAceros();
  //       cambio = 1;
  //     } else {
  //     }
  //   }
  //   const encontrado = await this.tablaAceros.filter(
  //     (ele) => ele.id_metrado !== null
  //   );
  //   this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //   this.dataSource[this.filaSel].detalleAcero = this.tablaAceros;
  //   await this.actualizarDataPrincipal();
  //   if (cambio == 1) {
  //     await this.calcularMontosRowPrincipal();
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('verificarTextoAceros');
  //   }
  // }

  // async calcularMontosAceros(iniciar = false) {
  //   let sumaSubTotales = 0;
  //   let sumaGrupo = 0;
  //   for (let indice = this.tablaAceros.length - 1; indice >= 0; indice--) {
  //     const row = this.tablaAceros[indice];
  //     if (row.id_metrado !== null) {
  //       let total1 = 0;
  //       let total2 = 0;
  //       let subtotal = 0;
  //       if (row.cantidad !== null && row.elementos !== null) {
  //         total1 =
  //           (row.cantidad && Number(row.cantidad) ? Number(row.cantidad) : 0) *
  //           (row.elementos && Number(row.elementos)
  //             ? Number(row.elementos)
  //             : 0);
  //       }
  //       if (total1 !== 0 && row.longitud !== null) {
  //         total2 =
  //           total1 *
  //           (row.longitud && Number(row.longitud) ? Number(row.longitud) : 0);
  //       }
  //       if (total2 !== 0 && row.pesodiametro !== null) {
  //         subtotal =
  //           total2 *
  //           (row.pesodiametro && Number(row.pesodiametro)
  //             ? Number(row.pesodiametro)
  //             : 0);
  //       }
  //       this.tablaAceros[indice].total1 = total1;
  //       this.tablaAceros[indice].total2 = total2;
  //       if (row.estitulo == 0) {
  //         sumaGrupo = sumaGrupo + subtotal;
  //       }
  //       if (!row.esMetrado) {
  //         this.tablaAceros[indice].parcial = this.formsService.redondeo(
  //           subtotal,
  //           this.dec_metrado
  //         );
  //         this.tablaAceros[indice].subtotal = this.formsService.redondeo(
  //           0,
  //           this.dec_metrado
  //         );
  //       } else {
  //         if (row.estitulo) {
  //           this.tablaAceros[indice].parcial = this.formsService.redondeo(
  //             0,
  //             this.dec_metrado
  //           );
  //           this.tablaAceros[indice].subtotal = this.formsService.redondeo(
  //             0,
  //             this.dec_metrado
  //           );
  //         } else {
  //           this.tablaAceros[indice].parcial = this.formsService.redondeo(
  //             subtotal,
  //             this.dec_metrado
  //           );
  //           this.tablaAceros[indice].subtotal = this.formsService.redondeo(
  //             sumaGrupo,
  //             this.dec_metrado
  //           );
  //         }
  //         sumaGrupo = 0;
  //       }
  //       sumaSubTotales = sumaSubTotales + subtotal;
  //     }
  //   }
  //   this.dataSource[this.filaSel].totalAceros = this.formsService.redondeo(
  //     sumaSubTotales,
  //     this.dec_metrado
  //   );
  //   await this.resumenAceros(true);

  //   this.partidaSeleccionada = this.dataSource[this.filaSel];

  //   this.dataSource[this.filaSel].detalleAcero = this.tablaAceros;
  //   if (!iniciar) {
  //     this.dataSource[this.filaSel].editadoMetrado = 1;
  //     await this.verificarParametrosCambioTabla();
  //   }

  //   await this.actualizarDataPrincipal();
  // }

  // async actualizarTablaCompletaAceros() {
  //   let existeAcero = 0;
  //   let nuevo = [];
  //   let j = 0;
  //   for (let i = 0; i < this.tablaAceros.length; i++) {
  //     this.tablaAceros[i].editarCopiar = false;
  //     if (this.tablaAceros[i].id_metrado !== null) {
  //       existeAcero = 1;
  //       this.tablaAceros[i].id_metrado = j;
  //       if (this.tablaAceros[i].esMetrado && !this.tablaAceros[i].estitulo) {
  //         const sgteValido = await this.sgteValido(i + 1, 'tablaAceros');
  //         if (
  //           sgteValido?.sgteExistente &&
  //           !sgteValido?.sgteExistente?.esMetrado
  //         ) {
  //           this.tablaAceros[i].tieneSubmetrado = 1;
  //         } else {
  //           this.tablaAceros[i].tieneSubmetrado = 0;
  //         }
  //       } else {
  //         if (this.tablaAceros[i].esMetrado && this.tablaAceros[i].estitulo) {
  //           const sgteValido = await this.sgteValido(i + 1, 'tablaAceros');
  //           if (
  //             sgteValido.sgteExistente &&
  //             !sgteValido?.sgteExistente?.esMetrado
  //           ) {
  //             await this.convertirSgtesSubAMert(i + 1, 'tablaAceros');
  //           }
  //         } else if (!this.tablaAceros[i].esMetrado) {
  //           // this.tablaAceros[i].estilo = arrayEstilos[2] ? arrayEstilos[2] : '';
  //         }
  //         if (
  //           this.tablaAceros[i].esMetrado &&
  //           this.tablaAceros[i].estitulo == 2 &&
  //           !this.tablaAceros[i].tieneSubmetrado
  //         ) {
  //           // this.tablaAceros[i].estilo = ''
  //         }
  //         this.tablaAceros[i].tieneSubmetrado = 0;
  //       }
  //       this.tablaAceros[i].subtotal = this.formsService.redondeo(
  //         Number(this.tablaAceros[i].subtotal),
  //         this.dec_metrado
  //       );
  //       this.tablaAceros[i].parcial = this.formsService.redondeo(
  //         Number(this.tablaAceros[i].parcial),
  //         this.dec_metrado
  //       );
  //       j++;
  //     }
  //     nuevo.push(this.tablaAceros[i]);
  //   }
  //   this.tablaAceros = nuevo;
  //   this.dataSource[this.filaSel].detalleAcero = this.tablaAceros;
  //   this.dataSource[this.filaSel].metrado_valido = existeAcero;
  //   this.dataSource[this.filaSel].permitirCambio = existeAcero;
  //   await this.verificarParametrosCambioTabla();
  //   if (
  //     JSON.stringify(this.dataSource[this.filaSel].tablaInicialAcero) ===
  //     JSON.stringify(this.dataSource[this.filaSel].detalleAcero)
  //   ) {
  //     this.dataSource[this.filaSel].editadoMetrado = 0;
  //   } else {
  //     this.dataSource[this.filaSel].editadoMetrado = 1;
  //   }
  //   await this.actualizarDataPrincipal();
  // }

  // async blurSelect(e) {
  //   if (e) {
  //     const a = document.getElementById('s' + this.filaSel3);
  //     if (a) {
  //       this.tablaAceros[this.filaSel3].editardiametro = 0;
  //     }
  //   }
  //   this.iniciado = false;
  //   this.opcionHabilitarAceros = null;
  // }

  // sgteColumnaAcero(columna, derecha) {
  //   let sgte = null;
  //   switch (columna) {
  //     case 'descripcion':
  //       sgte = !derecha ? 'descripcion' : 'cantidad';
  //       return sgte;
  //     case 'cantidad':
  //       sgte = !derecha ? 'descripcion' : 'elementos';
  //       return sgte;
  //     case 'elementos':
  //       sgte = !derecha ? 'cantidad' : 'longitud';
  //       return sgte;
  //     case 'longitud':
  //       sgte = !derecha ? 'elementos' : 'diametro';
  //       return sgte;
  //     case 'diametro':
  //       sgte = !derecha ? 'longitud' : 'diametro';
  //       return sgte;
  //     // case 'pesodiametro':
  //     //   sgte = !derecha ? 'diametro' : 'archivo';
  //     //   return sgte;
  //     // case 'archivo':
  //     //   sgte = !derecha ? 'pesodiametro' : 'archivo';
  //     //   return sgte;
  //     default:
  //       return sgte;
  //   }
  // }

  // async cambioPesoComercial(event, i) {
  //   const encontrado = this.listaPesos.find((ele) => ele.medida == event);
  //   if (encontrado) {
  //     if (
  //       this.tablaAceros[i].id_metrado !== null &&
  //       this.tablaAceros[i].tieneSubmetrado == 0
  //     ) {
  //       this.tablaAceros[i].diametro = event;
  //       this.tablaAceros[i].pesodiametro = encontrado.peso;
  //       await this.calcularMontosAceros();
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal('cambioPesoComercial');
  //     }
  //   }
  // }

  // async verificarParametrosCambioTabla() {
  //   const tieneMetrado = await this.dataSource[
  //     this.filaSel
  //   ].detalleMetrado.find((ele) => ele.id_metrado !== null);
  //   const tieneVinculadoAcero = await this.dataSource[
  //     this.filaSel
  //   ].detalleMetrado.find((ele) => ele.id_metrado !== null && ele.tieneAceros);
  //   const tieneAceros = await this.dataSource[this.filaSel].detalleAcero.find(
  //     (ele) => ele.id_metrado !== null
  //   );
  //   if (tieneMetrado || tieneVinculadoAcero || tieneAceros) {
  //     // this.dataSource[this.filaSel].permitirCambio = 0;
  //     if (tieneAceros && !tieneMetrado && !tieneVinculadoAcero) {
  //       this.dataSource[this.filaSel].detalleMetrado[0] = new metradoModelo(
  //         'ACERO',
  //         1,
  //         '',
  //         0,
  //         this.partidaSeleccionada?.indice,
  //         this.idProyecto,
  //         null,
  //         null,
  //         1
  //       );
  //       this.dataSource[this.filaSel].detalleMetrado[0].parcial =
  //         this.dataSource[this.filaSel].totalAceros;
  //       this.dataSource[this.filaSel].detalleMetrado[0].subtotal =
  //         this.dataSource[this.filaSel].totalAceros;
  //       this.dataSource[this.filaSel].metrado = this.formsService.redondeo(
  //         Number(this.dataSource[this.filaSel].totalAceros),
  //         this.dec_metrado
  //       );
  //       this.dataSource[this.filaSel].ed_pre = 0;
  //       this.dataSource[this.filaSel].cant_metrado = this.formsService.redondeo(
  //         Number(this.dataSource[this.filaSel].metrado),
  //         this.dec_metrado
  //       );
  //       this.ocultarChecks = 1;
  //       this.dataSource[this.filaSel].vinculado = 0;
  //     } else {
  //       if (tieneAceros) {
  //         this.dataSource[this.filaSel].detalleMetrado[0].parcial =
  //           this.dataSource[this.filaSel].totalAceros;
  //         this.dataSource[this.filaSel].detalleMetrado[0].subtotal =
  //           this.dataSource[this.filaSel].totalAceros;
  //         this.dataSource[this.filaSel].metrado = this.formsService.redondeo(
  //           Number(this.dataSource[this.filaSel].totalAceros),
  //           this.dec_metrado
  //         );
  //         this.dataSource[this.filaSel].ed_pre = 0;
  //         this.dataSource[this.filaSel].cant_metrado =
  //           this.formsService.redondeo(
  //             Number(this.dataSource[this.filaSel].metrado),
  //             this.dec_metrado
  //           );
  //         this.dataSource[this.filaSel].vinculado = 0;
  //       }
  //     }
  //     //  await this.calcularMontosRowPrincipal();
  //   }
  //   await this.actualizarDataPrincipal();
  // }

  // async agregarAceroMetrado(multiple = false) {
  //   let cambio = 0;
  //   if (this.aceroSeleccionado) {
  //     let indice = null;
  //     if (this.aceroSeleccionado.id_metrado !== null) {
  //       indice = this.filaSel3 + 1;
  //     } else {
  //       indice = this.filaSel3;
  //     }
  //     const acero = new aceroModelo(
  //       '',
  //       1,
  //       '',
  //       indice,
  //       this.partidaSeleccionada?.indice,
  //       this.idProyecto
  //     );
  //     this.tablaAceros.splice(indice, 0, acero);
  //     if (!multiple) {
  //       await this.actualizarTablaCompletaAceros();
  //       await this.calcularMontosAceros();
  //     }
  //     this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //   } else {
  //     this.toaster.error('Ninguna fila seleccionada', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  //   if (!multiple) {
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('agregarAceroMetrado');
  //   }
  // }

  // async agregarMultipleAceroMetrado(cantidad) {
  //   for (let i = 0; i < cantidad; i++) {
  //     await this.agregarAceroMetrado(true);
  //   }
  //   if (cantidad > 0) {
  //     await this.actualizarTablaCompletaAceros();
  //     await this.calcularMontosAceros();
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('agregarMultipleAceroMetrado');
  //   }
  // }

  // async agregarSubmetradoAcero(multiple = false, idx = null) {
  //   // if (this.aceroSeleccionado) {
  //   //   if (this.aceroSeleccionado.esMetrado) {
  //   //     let ultimoSubMetrado = null;
  //   //     if (this.filaSel3 < this.tablaAceros.length) {
  //   //       for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
  //   //         if (this.tablaAceros[i].id_metrado !== null) {
  //   //           if (this.tablaAceros[i].esMetrado) {
  //   //             break;
  //   //           } else {
  //   //             ultimoSubMetrado = this.tablaAceros[i];
  //   //           }
  //   //         } else {
  //   //           break;
  //   //         }
  //   //       }
  //   //     }
  //   //     let index = null;
  //   //     if (ultimoSubMetrado) {
  //   //       index = ultimoSubMetrado.id_metrado + 1;
  //   //     } else {
  //   //       index = this.aceroSeleccionado.id_metrado + 1;
  //   //     }
  //   //     const subMetrado = new aceroModelo(
  //   //       '',
  //   //       0,
  //   //       '-',
  //   //       index,
  //   //       this.partidaSeleccionada.indice,
  //   //       this.idProyecto
  //   //     );
  //   //     this.tablaAceros.splice(index, 0, subMetrado);
  //   //     await this.limpiarAceroTitulo(this.filaSel3);

  //   //   } else {
  //   //     const subMetrado = new aceroModelo(
  //   //       '',
  //   //       0,
  //   //       '-',
  //   //       this.aceroSeleccionado.id_metrado,
  //   //       this.partidaSeleccionada.indice,
  //   //       this.idProyecto
  //   //     );
  //   //     this.tablaAceros.splice(this.filaSel3 + 1, 0, subMetrado);
  //   //     await this.limpiarAceroTitulo(this.filaSel3);
  //   //   }

  //   //   if (this.tablaAceros[this.tablaAceros.length - 1].id_metrado == null) {
  //   //     this.tablaAceros.pop();
  //   //   }
  //   //   await this.actualizarTablaCompletaAceros();
  //   //   this.guardarTablaTemporal('agregarSubmetradoAcero')
  //   // } else {
  //   //   this.toaster.error('Ningun Metrado Seleccionado', '', {
  //   //     closeButton: false,
  //   //     positionClass: 'toast-bottom-right',
  //   //     timeOut: 2000,
  //   //   });
  //   //   return;
  //   // }
  //   let cambio = 0;
  //   if (this.aceroSeleccionado) {
  //     let index = null;
  //     if (idx == null) {
  //       index =
  //         this.aceroSeleccionado?.id_metrado !== null
  //           ? this.filaSel3 + 1
  //           : this.filaSel3;
  //     } else {
  //       index = idx;
  //     }
  //     if (
  //       this.aceroSeleccionado.esMetrado &&
  //       !this.aceroSeleccionado.estitulo
  //     ) {
  //       this.tablaAceros[this.filaSel3].tieneSubmetrado = 1;
  //     }
  //     const subMetrado = new aceroModelo(
  //       '',
  //       0,
  //       '-',
  //       index,
  //       this.partidaSeleccionada.indice,
  //       this.idProyecto
  //     );
  //     this.tablaAceros.splice(index, 0, subMetrado);
  //     if (!multiple) {
  //       await this.actualizarTablaCompletaAceros();
  //       await this.calcularMontosAceros();
  //       await this.actualizarDataPrincipal();
  //       this.stiloFormula();
  //       this.guardarTablaTemporal('agregarMEtrado');
  //       this.existetemp = true;
  //     }
  //     this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
  //   } else {
  //     this.toaster.error('Ninguna fila seleccionada', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  // }

  // async agregarMultipleSecundarioAcero(cantidad) {
  //   // if (this.popover2.isOpen()) this.popover2.close();
  //   // if (this.aceroSeleccionado.id_metrado !== null) {
  //   //   let index = null;
  //   //   if (this.aceroSeleccionado.esMetrado) {
  //   //     let ultimoSubmetrado = null;
  //   //     let sgteMetrado = null;
  //   //     for (
  //   //       let i = this.aceroSeleccionado.id_metrado + 1;
  //   //       i < this.tablaAceros.length;
  //   //       i++
  //   //     ) {
  //   //       if (this.tablaAceros[i].id_metrado !== null) {
  //   //         if (!this.tablaAceros[i].esMetrado) {
  //   //           ultimoSubmetrado = this.tablaAceros[i];
  //   //         } else {
  //   //           sgteMetrado = this.tablaAceros[i];
  //   //           break;
  //   //         }
  //   //       } else {
  //   //         break;
  //   //       }
  //   //     }
  //   //     if (ultimoSubmetrado) {
  //   //       index = ultimoSubmetrado.id_metrado + 1;
  //   //     } else {
  //   //       index = sgteMetrado
  //   //         ? sgteMetrado.id_metrado
  //   //         : this.aceroSeleccionado.id_metrado + 1;
  //   //     }
  //   //   } else {
  //   //     index = this.aceroSeleccionado.id_metrado + 1;
  //   //   }
  //   //   for (let i = 0; i < cantidad; i++) {
  //   //     const acero = new aceroModelo(
  //   //       '',
  //   //       0,
  //   //       '-',
  //   //       index,
  //   //       this.partidaSeleccionada.indice,
  //   //       this.idProyecto
  //   //     );
  //   //     this.tablaAceros.splice(index, 0, acero);
  //   //   }
  //   //   if (this.filaSel3 !== null) {
  //   //     this.tablaAceros[this.filaSel3].cantidad = null;
  //   //     this.tablaAceros[this.filaSel3].diametro = null;
  //   //     this.tablaAceros[this.filaSel3].elementos = null;
  //   //     this.tablaAceros[this.filaSel3].longitud = null;
  //   //     this.tablaAceros[this.filaSel3].pesodiametro = null;
  //   //     this.tablaAceros[this.filaSel3].total1 = 0;
  //   //     this.tablaAceros[this.filaSel3].total2 = 0;
  //   //     this.tablaAceros[this.filaSel3].subtotal = 0;
  //   //   }
  //   //   await this.actualizarTablaCompletaAceros();
  //   //   for (let i = this.tablaAceros.length - 1; i >= 0; i--) {
  //   //     if (
  //   //       this.tablaAceros.length > 20 &&
  //   //       this.tablaAceros[i].id_metrado == null
  //   //     ) {
  //   //       this.tablaAceros.splice(i, 1);
  //   //     } else {
  //   //       break;
  //   //     }
  //   //   }
  //   //   await this.calcularMontosAceros();
  //   //   this.guardarTablaTemporal('agregarSubmetradoAcero')
  //   // } else {
  //   //   this.toaster.error('Ningun Metrado Seleccionado', '', {
  //   //     closeButton: false,
  //   //     positionClass: 'toast-bottom-right',
  //   //     timeOut: 2000,
  //   //   });
  //   //   return;
  //   // }
  //   if (this.popover2.isOpen()) {
  //     this.popover2.close();
  //   }
  //   if (this.aceroSeleccionado) {
  //     if (this.aceroSeleccionado.estitulo == 1) {
  //       this.toaster.error('No se puede agregar debajo de un título', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 3000,
  //       });
  //       return;
  //     }
  //     let index = null;
  //     const inicio =
  //       this.aceroSeleccionado.id_metrado !== null
  //         ? this.filaSel3 + 1
  //         : this.filaSel3;
  //     for (let i = 0; i < cantidad; i++) {
  //       const a = inicio + i;
  //       await this.agregarSubmetradoAcero(true, a);
  //     }
  //     await this.actualizarTablaCompletaAceros();
  //     await this.calcularMontosAceros();
  //     await this.actualizarDataPrincipal();
  //     this.stiloFormula();
  //     this.guardarTablaTemporal('agregarMultipleSubmetrado');
  //     this.existetemp = true;
  //   } else {
  //     this.toaster.error('Ninguna fila Seleccionada', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  // }

  // async limpiarAceroTitulo(i) {
  //   this.tablaAceros[i].cantidad = null;
  //   this.tablaAceros[i].diametro = null;
  //   this.tablaAceros[i].elementos = null;
  //   this.tablaAceros[i].longitud = null;
  //   this.tablaAceros[i].pesodiametro = null;
  //   this.tablaAceros[i].total1 = null;
  //   this.tablaAceros[i].total2 = null;
  //   this.tablaAceros[i].tieneSubmetrado = 1;
  //   this.tablaAceros[i].subtotal = this.formsService.redondeo(
  //     0,
  //     this.dec_metrado
  //   );
  // }

  // async modalPesosComerciales() {
  //   try {
  //     const modalRef = this.modalService.open(ModalPesosComercialesComponent, {
  //       size: 'md',
  //       backdrop: 'static',
  //       windowClass: 'pcoded',
  //       keyboard: false,
  //     });
  //     modalRef.componentInstance.id_usuario = this.id_usuario;
  //     const result = await modalRef.result;
  //     if (result) {
  //       await this.listarPesosPorUsuario();
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // async guardarporTitulo(dataSource) {
  //   try {
  //     let guardado = 0;
  //     let arrayEditados = [];
  //     let arrayMetrados = [];
  //     let arrayAceros = [];
  //     let arrayEditadosDetalle = [];
  //     let calculadoLlenado = 0;
  //     let totalPartidas = 0;
  //     for (let partida of dataSource) {
  //       let detalleValidos = [];
  //       if (partida.editadoMetrado) {
  //         arrayEditados.push(partida);
  //         if (partida.unidad) {
  //           if (
  //             partida.ed_pre == 0 &&
  //             Number(partida.cantidad) !== Number(partida.metrado)
  //           ) {
  //             partida.cantidad = JSON.parse(JSON.stringify(partida.metrado));
  //           }

  //           const array = partida.detalleMetrado ? partida.detalleMetrado : [];
  //           detalleValidos = await array.filter(
  //             (ele) => ele.id_metrado !== null
  //           );
  //           detalleValidos.map((ele) => arrayMetrados.push(ele));
  //           arrayEditadosDetalle.push(partida.indice);
  //           const array2 = partida.detalleAcero ? partida.detalleAcero : [];
  //           detalleValidos = await array2.filter(
  //             (ele) => ele.id_metrado !== null
  //           );
  //           detalleValidos.map((ele) => arrayAceros.push(ele));
  //           const existe = await arrayEditadosDetalle.find(
  //             (ele) => ele == partida.indice
  //           );
  //           if (!existe) {
  //             arrayEditadosDetalle.push(partida.indice);
  //           }
  //         } else {
  //         }
  //       }
  //       if (partida.unidad) {
  //         totalPartidas++;
  //         if (!partida.ed_pre || Number(partida.cant_metrado) !== 0) {
  //           calculadoLlenado++;
  //         }
  //       }
  //     }

  //     const tituloSelecciondo = await this.listaTitulos.find(
  //       (ele) => ele.indice == this.indiceTitulo
  //     );
  //     if (totalPartidas == 0) {
  //       var porcentaje = 0;
  //     } else {
  //       porcentaje = (calculadoLlenado * 100) / totalPartidas;
  //     }
  //     const id_proyecto = this.idProyecto;
  //     const id_usuario = this.id_usuario;
  //     const indice_tit = tituloSelecciondo.indice;
  //     const item_tit = tituloSelecciondo.item;
  //     const desc_tit = tituloSelecciondo.descripcion;
  //     const datos1 = JSON.stringify(arrayEditados);
  //     const datos2 = JSON.stringify(arrayMetrados);
  //     const datos3 = JSON.stringify(arrayEditadosDetalle);
  //     const datos4 = JSON.stringify(arrayAceros);
  //     const obj = JSON.stringify({
  //       id_proyecto: id_proyecto,
  //       id_usuario: id_usuario,
  //       indice_tit: indice_tit,
  //       item_tit: item_tit,
  //       desc_tit: desc_tit,
  //       datos1: datos1,
  //       datos2: datos2,
  //       datos3: datos3,
  //       datos4: datos4,
  //     });

  //     if (
  //       arrayEditados.length ||
  //       arrayMetrados.length ||
  //       arrayEditadosDetalle.length ||
  //       arrayAceros.length
  //     ) {
  //       const response = await this.metradoService.guardarCambiosMetrado(obj);
  //       if (response.id == '1') {
  //         await this.actualizarTituloMetrado(porcentaje);
  //         dataSource = await dataSource.map((ele) => {
  //           ele.editadoMetrado = 0;
  //           ele.tablaInicialAcero = JSON.parse(
  //             JSON.stringify(ele.detalleAcero)
  //           );
  //           ele.tablaInicialSistema = JSON.parse(
  //             JSON.stringify(ele.detalleMetrado)
  //           );
  //           return ele;
  //         });
  //         guardado = 1;
  //       } else {
  //         SwalService.error(response.mensaje);
  //         guardado = 0;
  //       }
  //     } else {
  //       guardado = 2;
  //     }
  //     return { guardado: guardado, dataSource: dataSource };
  //   } catch (e) {
  //     this.mostrar_carga_todo = false;
  //     console.log(e);
  //     SwalService.error();
  //   }
  // }

  // async calcularPorcentajeXTitulo(titulo) {
  //   let partidasTotal = 0;
  //   let partidasValidas = 0;
  //   for (const iterator of titulo) {
  //     if (iterator.unidad) {
  //       partidasTotal++;
  //       if (Number(iterator.cant_metrado) !== 0) {
  //         partidasValidas++;
  //       }
  //     }
  //   }
  //   if (partidasTotal == 0) {
  //     var porcentaje = 0;
  //   } else {
  //     porcentaje = (partidasValidas * 100) / partidasTotal;
  //   }

  //   const rendiValido = Math.floor(porcentaje);
  //   let titSelect = this.dataTitulos.find(
  //     (ele) => ele.dataTitulo.indice == this.indiceTitulo
  //   );
  //   const res = await this.verificarVinculado(titSelect);

  //   titSelect.dataTitulo.estado_metrado = rendiValido;
  //   titSelect.dataTitulo.vinculado = res;
  //   // this.variablesGlobalesService.porcentajeTit.next({indice: this.indiceTitulo,porcentaje:rendiValido})
  // }

  // async guardarTablaCompleta(vincular = false) {
  //   try {
  //     if (!vincular) {
  //       this.mostrar_carga_todo = true;
  //     }
  //     let correctos = 0;
  //     let incorrectos = 0;
  //     let noModificado = 0;
  //     for await (let elemento of this.dataTitulos) {
  //       if (elemento.tipo_registro == 0) {
  //         const encontrado = elemento.data.find((ele) => ele.editadoMetrado);
  //         // if (
  //         //   JSON.stringify(elemento.dataInicial) !==
  //         //   JSON.stringify(elemento.data) &&
  //         //   elemento.modificado
  //         // ) {
  //         if (encontrado && elemento.modificado && elemento.editable) {
  //           const response = await this.guardarporTitulo(elemento.data);
  //           elemento.guardado = response.guardado;
  //           if (response.guardado == 1) {
  //             elemento.data = response.dataSource;
  //             elemento.dataInicial = JSON.parse(
  //               JSON.stringify(response.dataSource)
  //             );
  //             elemento.guardado = null;
  //             elemento.modificado = false;
  //             correctos++;
  //           } else if (response.guardado == 2) {
  //             elemento.data = response.dataSource;
  //             elemento.dataInicial = JSON.parse(
  //               JSON.stringify(response.dataSource)
  //             );
  //             elemento.guardado = null;
  //             elemento.modificado = false;
  //             noModificado++;
  //           } else {
  //             incorrectos++;
  //           }
  //         } else {
  //           noModificado++;
  //         }
  //       } else {
  //         await this.actualizarPorcentajeExcel(elemento);
  //         noModificado++;
  //       }
  //     }

  //     if (incorrectos > 0) {
  //       this.toaster.error(
  //         'Ocurrio un error al almacenar la informacion',
  //         'ERROR',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         }
  //       );
  //     } else if (correctos > 0 && incorrectos == 0) {
  //       await this.descartarTablaTemporal();
  //       if (!vincular) {
  //         this.toaster.success('Se guardo correctamente', 'Éxito', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         });
  //         this.verResumen.emit(1);
  //         // await this.listarTitulos();
  //         // this.onResize();
  //       }
  //     } else if (
  //       noModificado == this.dataTitulos.length &&
  //       incorrectos == 0 &&
  //       correctos == 0
  //     ) {
  //       if (!vincular) {
  //         this.toaster.info('Ningun cambio registrado', '', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         });
  //       }
  //     }
  //     if (!vincular) {
  //       this.mostrar_carga_todo = false;
  //       // this.verResumen.emit(1);
  //     }
  //   } catch (e) {
  //     SwalService.error(e);
  //     this.mostrar_carga_todo = false;
  //     console.log(e);
  //   }
  // }

  // async actualizarPorcentajeExcel(elemento) {
  //   let calculadoLlenado = 0;
  //   let totalPartidas = 0;
  //   for (const iterator of elemento.dataExcel) {
  //     if (iterator.unidad && iterator.item) {
  //       totalPartidas++;
  //       if (Number(iterator.mtotal) !== 0) {
  //         calculadoLlenado++;
  //       }
  //     }
  //   }

  //   if (totalPartidas == 0) {
  //     var porcentaje = 0;
  //   } else {
  //     porcentaje = (calculadoLlenado * 100) / totalPartidas;
  //   }

  //   const rendiValido = Math.floor(porcentaje);
  //   const tituloSelecciondo = await this.listaTitulos.find(
  //     (ele) => ele.indice == elemento.dataTitulo.indice
  //   );
  //   const obj = {
  //     id_proyecto: this.idProyecto,
  //     indice: tituloSelecciondo.indice,
  //     tipo_registro: tituloSelecciondo.tipo_registro,
  //     estado_metrado: rendiValido,
  //   };
  //   const response = await this.metradoService.actualizarTituloMetrado(obj);
  // }

  // async actualizarTituloMetrado(porcentaje) {
  //   const rendiValido = Math.floor(porcentaje);
  //   const tituloSelecciondo = await this.listaTitulos.find(
  //     (ele) => ele.indice == this.indiceTitulo
  //   );
  //   const obj = {
  //     id_proyecto: this.idProyecto,
  //     indice: tituloSelecciondo.indice,
  //     tipo_registro:
  //       tituloSelecciondo.tipo_registro !== null
  //         ? tituloSelecciondo.tipo_registro
  //         : 0,
  //     estado_metrado: rendiValido,
  //   };
  //   const response = await this.metradoService.actualizarTituloMetrado(obj);
  // }

  // toggleOnAceros(index) {
  //   this.tablaAceros[index].icomost = 0;
  //   for (let i = index + 1; i < this.tablaAceros.length; i++) {
  //     const row = this.tablaAceros[i];
  //     if (this.tablaAceros[index].estitulo == 1) {
  //       if (!row.estitulo || row.estitulo == 2) {
  //         this.tablaAceros[i].mostrar = 1;
  //         this.tablaAceros[i].icomost = 0;
  //       } else {
  //         break;
  //       }
  //     } else if (this.tablaAceros[index].estitulo == 0) {
  //       if (!row.esMetrado || row.id_metrado == null) {
  //         this.tablaAceros[i].mostrar = 1;
  //         this.tablaAceros[i].icomost = 0;
  //       } else {
  //         break;
  //       }
  //     } else {
  //       if (!row.estitulo) {
  //         this.tablaAceros[i].mostrar = 1;
  //         this.tablaAceros[i].icomost = 0;
  //       } else {
  //         break;
  //       }
  //     }
  //   }
  // }

  // async toggleOffAceros(index) {
  //   this.tablaAceros[index].icomost = 1;
  //   let existe = false;
  //   for (let i = index + 1; i < this.tablaAceros.length; i++) {
  //     const row = this.tablaAceros[i];
  //     if (row.id_metrado !== null) {
  //       existe = true;
  //       break;
  //     }
  //   }
  //   if (index + 1 > this.tablaAceros.length || !existe) {
  //     return;
  //   }
  //   for (let i = index + 1; i < this.tablaAceros.length; i++) {
  //     const row = this.tablaAceros[i];
  //     // if (this.tablaAceros[i].id_metrado !== null) {
  //     const ext = await this.sgteexistente(i, 'tablaAceros');
  //     if (this.tablaAceros[index].estitulo == 1 && ext) {
  //       if (!row.estitulo || row.estitulo == 2) {
  //         this.tablaAceros[i].mostrar = 0;
  //       } else {
  //         break;
  //       }
  //     } else if (
  //       !this.tablaAceros[index].estitulo &&
  //       this.tablaAceros[index].esMetrado
  //     ) {
  //       if (
  //         (!row.esMetrado || (row.esMetrado && row.id_metrado == null)) &&
  //         ext
  //       ) {
  //         this.tablaAceros[i].mostrar = 0;
  //       } else {
  //         break;
  //       }
  //     } else {
  //       if (!row.estitulo && ext) {
  //         this.tablaAceros[i].mostrar = 0;
  //       } else {
  //         break;
  //       }
  //     }
  //     // }
  //   }
  // }

  // async guardarTablaTemporal(num: any) {
  //   try {
  //     // await this.actualizarDataPrincipal();
  //     // this.stiloFormula();
  //     this.existetemp = true;
  //     const id_proyecto = this.idProyecto;
  //     const id_usuario = this.id_usuario;
  //     const datos1 = JSON.stringify(this.dataTitulos);
  //     const obj = {
  //       id_proyecto: id_proyecto,
  //       id_usuario: id_usuario,
  //       datatitulos: datos1,
  //     };
  //     const response =
  //       await this.metradoService.guardarCambiosTemporalesMetrado(obj);
  //     console.log('response', response);
     
  //   } catch (e) {
  //     this.toaster.error(
  //       'No se guardo en data temporal el ultimo cambio',
  //       'Advertencia',
  //       {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       }
  //     );
  //     console.log(e);
  //   }
  // }

  // async descartarTablaTemporal() {
  //   try {
  //     const id_proyecto = this.idProyecto;
  //     const id_usuario = this.id_usuario;
  //     const obj = {
  //       id_proyecto: id_proyecto,
  //       id_usuario: id_usuario,
  //     };
  //     const response =
  //       await this.metradoService.descartarCambiosTemporalesMetrado(obj);
  //       this.existetemp = false
  //   } catch (e) {
  //     console.log(e);
  //     SwalService.error(e);
  //   }
  // }

  // async listarTablaTemporal() {
  //   try {
  //     const id_proyecto = this.idProyecto;
  //     const id_usuario = this.id_usuario;
  //     const obj = {
  //       id_proyecto: id_proyecto,
  //       id_usuario: id_usuario,
  //     };
  //     const response = await this.metradoService.listarCambiosTemporalesMetrado(
  //       obj
  //     );
  //     let respuesta = null;
  //     if (response[0]) {
  //       respuesta = JSON.parse(response[0].datatitulos);
  //     }
  //     return respuesta;
  //   } catch (e) {
  //     console.log(e);
  //     SwalService.error(e);
  //   }
  // }

  // async actualizarDataPrincipal() {
  //   const index = await this.dataTitulos
  //     .map((ele) => ele.dataTitulo.indice)
  //     .indexOf(Number(this.indiceTitulo));

  //   if (index !== null) {
  //     this.dataTitulos[index].data = this.dataSource;
  //     const existe = this.dataSource.find((ele) => ele.editadoMetrado);
  //     if (existe) {
  //       this.dataTitulos[index].modificado = true;
  //       this.dataTitulos[index].dataTitulo.vinculado = false;
  //     }
  //   }
  // }

  // //Titulo Excel
  // async importarExcel(evt: any) {
  //   try {
  //     this.mostrar_carga_todo = true;
  //     const target: DataTransfer = <DataTransfer>evt.target;
  //     if (target.files.length !== 1) {
  //       throw new Error('Cannot use multiple files');
  //     }
  //     const reader: FileReader = new FileReader();
  //     const nombreArchivo = target.files[0].name;
  //     reader.onload = async (e: any) => {
  //       const bstr: string = e.target.result;
  //       const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

  //       const wbExcel = wb;
  //       const lista = wb.SheetNames;
  //       let listaTablas = [];
  //       lista.map((ele) => {
  //         const item: hoja = {
  //           nombre: ele,
  //           plantilla: null,
  //           columnas: null,
  //           columnas_completas: false,
  //           tabla_estructurada: null,
  //           tabla_excel: [],
  //           inicio_tabla: 0,
  //           body_tabla: null,
  //           cant_header: null,
  //           grupos_header: null,
  //           header: null,
  //           tabla_titulos_partida: null,
  //           considerar: false,
  //           filasNoValidas: [],
  //         };
  //         listaTablas.push(item);
  //       });
  //       listaTablas = await this.recuperarTablaExcel(wbExcel, listaTablas);
  //       await this.datosParaExcel(nombreArchivo, wbExcel, listaTablas);
  //       this.mostrar_carga_todo = false;
  //     };
  //     reader.readAsBinaryString(target.files[0]);
  //     const fileUpload = document.getElementById('archivo') as HTMLInputElement;
  //     if (fileUpload != null) {
  //       fileUpload.value = null;
  //     }
  //   } catch (e) {
  //     SwalService.error(e);
  //     console.log(e);
  //   }
  // }

  // async recuperarTablaExcel(webExcel, listaTablas) {
  //   for (let hoja of listaTablas) {
  //     let filasInvalidas = [];
  //     let excelData;
  //     const ws: XLSX.WorkSheet = webExcel.Sheets[hoja.nombre];
  //     excelData = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
  //     let mayor = 0;
  //     let header = [];
  //     await excelData.map((ele, index) => {
  //       if (ele.length > 79) {
  //         filasInvalidas.push(index + 2);
  //       }
  //       if (mayor < ele.length) {
  //         mayor = ele.length;
  //       }
  //     });
  //     for (let i = 0; i < mayor; i++) {
  //       header.push(i);
  //     }
  //     const excelCompleto = JSON.parse(JSON.stringify(excelData));
  //     hoja.tabla_excel = excelCompleto;
  //     hoja.cant_header = header;
  //     hoja.filasNoValidas = filasInvalidas;
  //   }
  //   return listaTablas;
  // }

  // async datosParaExcel(nombreArchivo, wbExcel, listaTablas) {
  //   const listaPresupuesto = await this.dataTitulos.find(
  //     (ele) => ele.dataTitulo.indice == this.indiceTitulo
  //   );
  //   const modalRef = this.modalService.open(ModalMetradoExcelComponent, {
  //     size: 'lg modalgrande',
  //     backdrop: 'static',
  //     windowClass: 'pcoded',
  //     keyboard: false,
  //   });
  //   modalRef.componentInstance.titulo = this.dataTitulo;
  //   modalRef.componentInstance.nombreArchivo = nombreArchivo;
  //   modalRef.componentInstance.wbExcel = wbExcel;
  //   modalRef.componentInstance.listaTablas = listaTablas;
  //   modalRef.componentInstance.idProyecto = this.idProyecto;
  //   modalRef.componentInstance.listaPresuesto = listaPresupuesto.dataInicial;
  //   // modalRef.componentInstance.estilos =
  //   const result = await modalRef.result;
  //   if (result == 'ok') {
  //     this.mostrar_carga_todo = true;
  //     const index = this.dataTitulos.findIndex((object) => {
  //       return object.dataTitulo.indice === Number(this.indiceTitulo);
  //     });
  //     let header = null;
  //     let body = [];
  //     const response = await this.listarTablaExcel(
  //       this.dataTitulos[index].dataTitulo.indice
  //     );
  //     const tablaPresu = await this.cambioTitulo(
  //       this.dataTitulos[index].dataTitulo.item
  //     );
  //     if (response) {
  //       if (response[1]) {
  //         header = await this.estructurarHeader(response[1][0]);
  //       }
  //       if (response[0]) {
  //         for (let ele of response[0]) {
  //           ele.estmost = 1;
  //           ele.mostrar = 1;
  //           ele.icomost = 1;
  //           if (ele.unidad && ele.item) {
  //             let encontrado = await tablaPresu.find(
  //               (row) =>
  //                 ele.item === row.item && row.descripcion === ele.descripcion
  //             );
  //             if (!encontrado) {
  //               // encontrado.vinculado = 0;
  //               ele.pintar = 1;
  //               this.noConsistente = true;
  //             } else {
  //               if (ele.item) {
  //                 if (ele.unidad) {
  //                   if (Number(encontrado.cantidad) !== Number(ele.mtotal)) {
  //                     ele.pintar = 2;
  //                     encontrado.vinculado = 0;
  //                     this.vinculadoExcel = true;
  //                   } else {
  //                     ele.pintar = null;
  //                     encontrado.vinculado = 1;
  //                   }
  //                 }
  //                 if (
  //                   encontrado.item !== ele.item ||
  //                   encontrado.descripcion !== ele.descripcion
  //                 ) {
  //                   this.noConsistente = true;
  //                   ele.pintar = 1;
  //                 }
  //               } else {
  //                 ele.pintar = null;
  //                 encontrado.vinculado = 1;
  //               }
  //             }
  //           } else {
  //             ele.pintar = null;
  //           }
  //         }
  //         body = response[0];
  //       }
  //     }

  //     const tablaRecuperada = await this.cambioTitulo(
  //       this.dataTitulos[index].dataTitulo.item
  //     );
  //     const inicial = JSON.parse(JSON.stringify(tablaRecuperada));
  //     this.dataTitulos[index] = {
  //       data: tablaRecuperada,
  //       dataInicial: inicial,
  //       guardado: null,
  //       modificado: false,
  //       dataTitulo: this.dataTitulos[index].dataTitulo,
  //       tipo_registro: 1,
  //       dataHeader: header,
  //       dataExcel: body,
  //       excel_diferente: false,
  //       vinculado: false,
  //       editable: this.dataTitulos[index].editable,
  //     };
  //     this.headerExcel = header;
  //     this.tablaExcelAdjunta = body;
  //     this.dataSource = tablaRecuperada;
  //     // await this.verificarVinculadoExcel();
  //     this.mostrar_carga_todo = false;
  //   }
  // }

  // async listarTablaExcel(indice) {
  //   try {
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       indice: indice,
  //     };
  //     const response = await this.metradoService.listarTablaMetradoExcel(obj);
  //     return response;
  //   } catch (e) {
  //     SwalService.error();
  //     console.log(e);
  //   }
  // }

  // async estructurarHeader(plantilla) {
  //   let arrayNuevo = {};
  //   let headerExcel = { grupos_header: null, header: [], header2: [] };
  //   if (plantilla) {
  //     Object.entries(plantilla).forEach(([key, value]) => {
  //       if (
  //         typeof value == 'string' &&
  //         value !== null &&
  //         key !== 'id_plantilla' &&
  //         key !== 'id_usuario'
  //       ) {
  //         arrayNuevo[key] = isNaN(parseInt(value)) ? '' : parseInt(value);
  //       }
  //     });
  //     let nuevo = [];
  //     nuevo.length = Object.keys(arrayNuevo).length;
  //     for (let i in arrayNuevo) {
  //       if (arrayNuevo[i] !== null && arrayNuevo[i] !== '') {
  //         nuevo[arrayNuevo[i]] = i;
  //       }
  //     }
  //     const object = Object.assign({}, nuevo);
  //     const obj = [];
  //     let icols = 0;
  //     let dcols = 0;
  //     let gcols = 0;
  //     let fcols = 0;
  //     let cambio = false;
  //     for (let j in object) {
  //       const valor = object[j];
  //       arraygcols.includes(valor) ? gcols++ : '';
  //       arraydcols.includes(valor) ? dcols++ : '';
  //       if (gcols || dcols) {
  //         arrayicols.includes(valor) ? fcols++ : '';
  //       } else {
  //         arrayicols.includes(valor) ? icols++ : '';
  //       }
  //       if (valor !== 'nom_plantilla') {
  //         obj.push(valor);
  //       }
  //     }
  //     const grupos = {
  //       i: icols,
  //       g: gcols,
  //       d: dcols,
  //       f: fcols,
  //     };
  //     let arra = [];
  //     const arrayG = [
  //       'gdescripcion',
  //       'gcantidad',
  //       'gfactor',
  //       'gnveces',
  //       'glongitud',
  //       'gancho',
  //       'galtura',
  //       'gsubtotal',
  //     ];
  //     const arrayD = [
  //       'ddescripcion',
  //       'dcantidad',
  //       'dfactor',
  //       'dnveces',
  //       'dlongitud',
  //       'dancho',
  //       'daltura',
  //       'dsubtotal',
  //     ];
  //     const arrayM = ['mparcial', 'mtotal'];
  //     for (let elemento of obj) {
  //       if (elemento == 'nom_plantilla') {
  //       } else {
  //         if (
  //           arrayG.includes(elemento) ||
  //           arrayD.includes(elemento) ||
  //           arrayM.includes(elemento)
  //         ) {
  //           const newStr = elemento.slice(1);
  //           arra.push(newStr);
  //         } else {
  //           arra.push(elemento);
  //         }
  //       }
  //     }
  //     headerExcel.header2 = arra;
  //     headerExcel.grupos_header = grupos;
  //     headerExcel.header = obj;
  //   } else {
  //     headerExcel.header2 = null;
  //     headerExcel.grupos_header = null;
  //     headerExcel.header = null;
  //   }
  //   return headerExcel;
  // }

  // maxtodoExcel() {
  //   for (let row of this.tablaExcelAdjunta) {
  //     row.mostrar = 1;
  //     row.icomost = 1;
  //   }
  // }

  // mintodoExcel() {
  //   for (let row of this.tablaExcelAdjunta) {
  //     if (!row.item) {
  //       // if (row.item.split('.').length > 1) {
  //       row.mostrar = 0;

  //       row.icomost = 1;
  //     }
  //     //
  //     else {
  //       if (row.unidad) {
  //         row.icomost = 0;
  //       }
  //       row.mostrar = 1;
  //     }
  //   }
  // }

  // async toggleOnExcel(itemsel, indice) {
  //   // this.tablaExcelAdjunta[indice].icomost = 1;
  //   // let ind2 = indice + 1;
  //   // for (let i = ind2; i < this.tablaExcelAdjunta.length; i++) {
  //   //   if (!this.tablaExcelAdjunta[i].item && this.tablaExcelAdjunta[i].tipo !== null) {
  //   //     this.tablaExcelAdjunta[i].mostrar = 1;
  //   //   } else {
  //   //     const spliteado = this.tablaExcelAdjunta[i].item.split('.')
  //   //     const splitSelect = itemsel.split('.')
  //   //     if (splitSelect.length <= spliteado.length) {
  //   //       if (splitSelect.length == spliteado.length) {
  //   //         break
  //   //       }
  //   //       this.tablaExcelAdjunta[i].mostrar = 1;
  //   //     } else {
  //   //       break
  //   //     }
  //   //   }
  //   // }
  //   this.tablaExcelAdjunta[indice].icomost = 1;
  //   let ind2 = indice + 1;
  //   for (let i = ind2; i < this.tablaExcelAdjunta.length; i++) {
  //     if (this.tablaExcelAdjunta[i].tipo == 0) {
  //       this.tablaExcelAdjunta[i].mostrar = 1;
  //     } else {
  //       const spliteado = this.tablaExcelAdjunta[i].item.split('.');
  //       const splitSelect = itemsel.split('.');
  //       if (splitSelect.length < spliteado.length) {
  //         this.tablaExcelAdjunta[i].mostrar = 1;
  //       } else {
  //         if (!this.tablaExcelAdjunta[i].item) {
  //           this.tablaExcelAdjunta[i].mostrar = 1;
  //         } else {
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }

  // async toggleOffExcel(itemsel, indice) {
  //   this.tablaExcelAdjunta[indice].icomost = 0;
  //   let ind2 = indice + 1;
  //   for (let i = ind2; i < this.tablaExcelAdjunta.length; i++) {
  //     if (this.tablaExcelAdjunta[i].tipo === 0) {
  //       this.tablaExcelAdjunta[i].mostrar = 0;
  //     } else {
  //       const spliteado = this.tablaExcelAdjunta[i].item.split('.');
  //       const splitSelect = itemsel.split('.');
  //       if (splitSelect.length < spliteado.length) {
  //         this.tablaExcelAdjunta[i].mostrar = 0;
  //       } else {
  //         if (!this.tablaExcelAdjunta[i].item) {
  //           this.tablaExcelAdjunta[i].mostrar = 0;
  //         } else {
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }

  // async toggleOnPartida(indice, nivel) {
  //   this.tablaExcelAdjunta[indice].icomost = 1;
  //   const ind2 = indice + 1;
  //   for (let i = ind2; i < this.tablaExcelAdjunta.length; i++) {
  //     const niv =
  //       this.tablaExcelAdjunta[i].nivel == null &&
  //       this.tablaExcelAdjunta[i].tipo == 0
  //         ? 3
  //         : this.tablaExcelAdjunta[i].nivel;
  //     if (niv > nivel && this.tablaExcelAdjunta[i].tipo == 0) {
  //       this.tablaExcelAdjunta[i].mostrar = 1;
  //     } else {
  //       break;
  //     }
  //   }
  // }

  // async toggleOffPartida(indice, nivel) {
  //   this.tablaExcelAdjunta[indice].icomost = 0;
  //   const ind2 = indice + 1;
  //   for (let i = ind2; i < this.tablaExcelAdjunta.length; i++) {
  //     const niv =
  //       this.tablaExcelAdjunta[i].nivel == null &&
  //       this.tablaExcelAdjunta[i].tipo == 0
  //         ? 3
  //         : this.tablaExcelAdjunta[i].nivel;
  //     if (niv > nivel && this.tablaExcelAdjunta[i].tipo == 0) {
  //       this.tablaExcelAdjunta[i].mostrar = 0;
  //     } else {
  //       break;
  //     }
  //   }
  // }

  // async vincularExcelAPresupuesto() {
  //   if (this.tablaExcelAdjunta?.length) {
  //     const sw = await SwalService.confirm(
  //       'Estas seguro?',
  //       'Se vinculara los montos totales de las partidas a presupuesto'
  //     );
  //     if (sw.isConfirmed) {
  //       this.mostrar_carga_todo = true;
  //       for (let ele of this.dataSource) {
  //         const row = this.dataSource[ele.ind];
  //         if (row.unidad) {
  //           this.dataSource[ele.ind].cant_metrado = this.formsService.redondeo(
  //             Number(row.metrado),
  //             this.dec_metrado
  //           );
  //           this.dataSource[ele.ind].ed_pre = 0;
  //           this.dataSource[ele.ind].vinculado = 0;
  //           const parcial =
  //             Number(this.dataSource[ele.ind].cant_metrado) *
  //             Number(this.dataSource[ele.ind].precio);
  //           const redondeado = await this.formsService.redondeo(
  //             parcial,
  //             this.dec_parcial
  //           );
  //           this.dataSource[ele.ind].parcial = parseFloat(redondeado);
  //           await this.actuaTitulos(ele.ind);
  //         }
  //       }
  //       const response = await this.guardarporTitulo(this.dataSource);
  //       if (response.guardado == 1) {
  //         this.vinculadoExcel = true;
  //         this.toaster.success('Se vinculo correctamene', 'Éxito', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         });
  //       }
  //       this.mostrar_carga_todo = false;
  //     }
  //   } else {
  //     this.toaster.error('Ninguna tabla excel importada', 'Error', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 4000,
  //     });
  //   }
  // }

  // async actuaTitulos(ind) {
  //   let item = this.dataSource[ind].item;
  //   let spliteado = item.split('.');
  //   let titem = '';
  //   while (spliteado.length > 1) {
  //     let encontrados = [];
  //     spliteado.pop();
  //     titem = spliteado.join('.') + '.';
  //     encontrados = await this.dataSource.filter((ele) => {
  //       if (ele.item) {
  //         var split = ele.item.split('.');
  //         split.pop();
  //         if (split.join('.') + '.' == titem) {
  //           return ele;
  //         }
  //       }
  //     });
  //     let parcialTotal = 0;
  //     await encontrados.map(
  //       (ele) => (parcialTotal = ele.parcial + parcialTotal)
  //     );
  //     var elementoPadre = this.dataSource.find(
  //       (ele) => ele.item && spliteado.join('.') == ele.item
  //     );
  //     const redondeado = await this.formsService.redondeo(
  //       parcialTotal,
  //       this.dec_parcial
  //     );
  //     if (elementoPadre) {
  //       this.dataSource[elementoPadre.ind].parcial = parseFloat(redondeado);
  //       this.dataSource[elementoPadre.ind].editadoMetrado = 1;
  //     }
  //   }
  // }

  // // async verificarVinculadoExcel(tit = null) {
  // //   if (!tit) {
  // //     this.vinculadoExcel = true;
  // //     this.noConsistente = false;
  // //     var opcion = this.dataTitulos.find((object) => {
  // //       return object.dataTitulo.indice === Number(this.indiceTitulo);
  // //     });
  // //   } else {
  // //     opcion = tit
  // //   }
  // //   for (let row of opcion.dataExcel) {
  // //     if (row.item && row.unidad) {
  // //       const encontrado = await opcion.dataInicial.find(
  // //         (ele) => ele.indice == row.indice_fila
  // //       );
  // //       if (!encontrado) {
  // //         this.noConsistente = true;
  // //         row.pintar = 1;
  // //       } else {
  // //         if (row.item) {
  // //           if (encontrado.item !== row.item) {
  // //             this.noConsistente = true;
  // //             row.pintar = 1;
  // //           } else {

  // //           }
  // //         }
  // //         if (row.unidad) {
  // //           if (Number(encontrado.cantidad) !== Number(row.mtotal)) {
  // //             this.vinculadoExcel = false;
  // //             row.pintar = 2;

  // //           } else {

  // //           }
  // //         }
  // //       }
  // //     }
  // //   }
  // //   if (tit) {
  // //     return opcion
  // //   }
  // // }

  // async eliminarTablaExcelImportada() {
  //   try {
  //     if (this.tablaExcelAdjunta.length) {
  //       const sw = await SwalService.confirm(
  //         'Estas seguro?',
  //         'Se eliminará toda la tabla importada relacionada a : ' +
  //           this.dataTitulo.descripcion
  //       );
  //       if (sw.isConfirmed) {
  //         this.mostrar_carga_todo = true;
  //         const obj = {
  //           id_proyecto: this.idProyecto,
  //           indice: this.indiceTitulo,
  //         };
  //         const response = await this.metradoService.eliminarTablaMetradoExcel(
  //           obj
  //         );
  //         if (response[0].id == '1') {
  //           this.headerExcel = null;
  //           this.tablaExcelAdjunta = [];
  //           this.dataSource = [];
  //           this.vinculadoExcel = false;

  //           const index = this.dataTitulos.findIndex((object) => {
  //             return object.dataTitulo.indice === Number(this.indiceTitulo);
  //           });
  //           const tablaRecuperada = await this.cambioTitulo(
  //             this.dataTitulos[index].dataTitulo.item
  //           );
  //           this.dataTitulos[index].data = tablaRecuperada;
  //           this.dataTitulos[index].dataInicial = JSON.parse(
  //             JSON.stringify(tablaRecuperada)
  //           );
  //           this.dataTitulos[index].dataHeader = null;
  //           this.dataTitulos[index].dataExcel = [];
  //           this.dataTitulos[index].dataTitulo.estado_metrado = 0;
  //           this.dataTitulos[index].guardado = null;
  //           this.dataTitulos[index].modificado = false;
  //           const sinGuardar = await this.listarTablaTemporal();
  //           if (sinGuardar) {
  //             await this.actualizarDataPrincipal();
  //             this.stiloFormula();
  //             await this.guardarTablaTemporal('eliminarExcel');
  //           }
  //           this.toaster.success('Se eliminó correctamente', 'Éxito', {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 4000,
  //           });
  //         } else {
  //           SwalService.error('Error', response[0].mensaje);
  //         }
  //         this.mostrar_carga_todo = false;
  //       }
  //     } else {
  //       this.toaster.error('Ninguna tabla excel importada', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     this.mostrar_carga_todo = false;
  //     SwalService.error();
  //   }
  // }

  // async multipleSeleccion() {
  //   this.excelMultiple = !this.excelMultiple;
  //   // if (this.tablaExcelAdjunta.length) {
  //   //   console.log(this.tablaExcelAdjunta);
  //   // }
  // }

  // async cambioCheckExcel(i, event) {
  //   this.tablaExcelAdjunta[i].seleccionado = event.checked;
  // }

  // async subirNivel() {
  //   if (this.excelMultiple) {
  //     this.mostrar_carga_todo = true;
  //     for (const iterator of this.tablaExcelAdjunta) {
  //       if (iterator.seleccionado) {
  //         let nivel = iterator.nivel == null ? 2 : Number(iterator.nivel);
  //         iterator.nivel = nivel < 5 ? nivel + 1 : Number(nivel);
  //         iterator.filaModificada = true;
  //       }
  //     }
  //     this.mostrar_carga_todo = false;
  //   } else {
  //     let nivel =
  //       this.filaExcelSel.nivel == null ? 2 : Number(this.filaExcelSel.nivel);
  //     this.filaExcelSel.nivel = nivel < 5 ? nivel + 1 : Number(nivel);
  //     this.filaExcelSel.filaModificada = true;
  //   }
  // }

  // async nivelSeleccionado(nivel) {
  //   if (this.excelMultiple) {
  //     this.mostrar_carga_todo = true;
  //     let i = 0;
  //     for (const iterator of this.tablaExcelAdjunta) {
  //       if (iterator.seleccionado) {
  //         iterator.nivel = Number(nivel);
  //         iterator.filaModificada = true;
  //         this.tablaExcelAdjunta[i].nivel = Number(nivel);
  //         this.tablaExcelAdjunta[i].filaModificada = true;
  //       }
  //       i++;
  //     }
  //     this.mostrar_carga_todo = false;
  //   } else {
  //     if (this.filaExcelSel) {
  //       this.filaExcelSel.nivel = Number(nivel);
  //       this.filaExcelSel.filaModificada = true;
  //       this.tablaExcelAdjunta[this.indexTablaExcel].nivel = Number(nivel);
  //       this.tablaExcelAdjunta[this.indexTablaExcel].filaModificada = true;
  //     } else {
  //       this.toaster.error('Ninguna Fila seleccionada', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     }
  //   }
  // }

  // async guardarCambiosTablaExcelImportado() {
  //   const existeCAmbios = await this.tablaExcelAdjunta.find(
  //     (ele) => ele.filaModificada
  //   );

  //   if (existeCAmbios) {
  //     const sw = await SwalService.confirm(
  //       'Estas seguro?',
  //       'Se guardaran todos los cambios realizados en la tabla del titulo : ' +
  //         this.dataTitulo.item +
  //         ' - ' +
  //         this.dataTitulo?.descripcion
  //     );
  //     if (sw.isConfirmed) {
  //       this.mostrar_carga_todo = true;
  //       const modificados = await this.tablaExcelAdjunta.filter(
  //         (ele) => ele.filaModificada
  //       );
  //       const datos1 = JSON.stringify(modificados);
  //       const obj = JSON.stringify({
  //         datos1: datos1,
  //       });
  //       const response = await this.metradoService.ModificaNivMetradoExcel(obj);

  //       if (response.id == '1') {
  //         // await this.guardarSoloStilos()
  //         const sinGuardar = await this.listarTablaTemporal();
  //         const index = this.dataTitulos.findIndex((object) => {
  //           return object.dataTitulo.indice === Number(this.indiceTitulo);
  //         });
  //         await this.actualizarPorcentajeExcel(this.dataTitulos[index]);
  //         if (sinGuardar) {
  //           await this.actualizarDataPrincipal();
  //           this.stiloFormula();
  //           await this.guardarTablaTemporal('guardarExcel');
  //         }
  //         this.mostrar_carga_todo = false;
  //         this.toaster.success(response.mensaje, 'Éxito', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         });
  //       } else {
  //         this.mostrar_carga_todo = false;
  //         this.toaster.error(response.mensaje, 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         });
  //       }
  //     }
  //   } else {
  //     this.toaster.info('Ningun cambio registrado', null, {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  // }

  // async guardarSoloStilos() {
  //   try {
  //     for (const tit of this.dataTitulos) {
  //       const tituloSelecciondo = tit.dataTitulo;
  //       let arrayEditados = [];
  //       let arrayMetrados = [];
  //       let arrayEditadosDetalle = [];
  //       let arrayAceros = [];
  //       arrayEditados.push(tit.data[0]);

  //       // console.log('arrayEditados', arrayEditados, tit);

  //       const id_proyecto = this.idProyecto;
  //       const id_usuario = this.id_usuario;
  //       const indice_tit = tituloSelecciondo.indice;
  //       const item_tit = tituloSelecciondo.item;
  //       const desc_tit = tituloSelecciondo.descripcion;
  //       const datos1 = JSON.stringify(arrayEditados);
  //       const datos2 = JSON.stringify(arrayMetrados);
  //       const datos3 = JSON.stringify(arrayEditadosDetalle);
  //       const datos4 = JSON.stringify(arrayAceros);
  //       const obj = JSON.stringify({
  //         id_proyecto: id_proyecto,
  //         id_usuario: id_usuario,
  //         indice_tit: indice_tit,
  //         item_tit: item_tit,
  //         desc_tit: desc_tit,
  //         datos1: datos1,
  //         datos2: datos2,
  //         datos3: datos3,
  //         datos4: datos4,
  //       });
  //       const response = await this.metradoService.guardarCambiosMetrado(obj);
  //       // console.log('response', response);
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // async seleccionarTodoPartida(index) {
  //   for (let i = index + 1; i < this.tablaExcelAdjunta.length; i++) {
  //     if (
  //       (this.tablaExcelAdjunta[i].tipo == 0 ||
  //         this.tablaExcelAdjunta[i].tipo == null) &&
  //       !this.tablaExcelAdjunta[i].item
  //     ) {
  //       this.tablaExcelAdjunta[i].filaModificada = true;
  //       this.tablaExcelAdjunta[i].seleccionado = true;
  //     } else {
  //       break;
  //     }
  //   }
  // }

  // async calcularFormulaSistema(row) {
  //   let formula = [];
  //   let texto = '';
  //   if (
  //     row.id_metrado !== null &&
  //     ((row.esMetrado == 0 && row.estitulo == 0) ||
  //       (row.esMetrado == 1 && row.estitulo == 0 && !row.tieneSubmetrado))
  //   ) {
  //     if (this.isNumber(row.cantidad) && row.cantidad) {
  //       formula.push('C');
  //     }
  //     if (this.isNumber(row.n_veces) && row.n_veces) {
  //       formula.push('D');
  //     }
  //     if (this.isNumber(row.largo) && row.largo) {
  //       formula.push('E');
  //     }
  //     if (this.isNumber(row.ancho) && row.ancho) {
  //       formula.push('F');
  //     }
  //     if (this.isNumber(row.altura) && row.altura) {
  //       formula.push('G');
  //     }
  //     texto = formula.join(' * ');
  //   }
  //   return texto;
  // }

  // async calcularFormulaAceros(row) {
  //   let formula = [];
  //   let texto = '';
  //   if (
  //     row.id_metrado !== null &&
  //     row.esMetrado == 0 &&
  //     row.estitulo == 0 &&
  //     row.total1 > 0 &&
  //     row.total2 > 0
  //   ) {
  //     // if (this.isNumber(row.cantidad) && row.cantidad) {
  //     //   formula.push('C')
  //     // }
  //     // if (this.isNumber(row.n_veces) && row.n_veces) {
  //     //   formula.push('D')
  //     // }
  //     // if (this.isNumber(row.largo) && row.largo) {
  //     //   formula.push('E')
  //     // }
  //     // if (this.isNumber(row.ancho) && row.ancho) {
  //     //   formula.push('F')
  //     // }
  //     // if (this.isNumber(row.altura) && row.altura) {
  //     //   formula.push('G')
  //     // }
  //     texto = formula.join(' * ');
  //   }
  //   return texto;
  // }

  // async evaluarFormula(texto, fuente) {
  //   this.habEditFormula = false;
  //   setTimeout(async () => {
  //     if (this.metradoSeleccionado !== null) {
  //       const validos = ['C', 'D', 'E', 'F', 'G', '*', '(', ')', '+', '-', '/'];
  //       texto = texto.toString().toUpperCase().replace(/\s+/g, '');
  //       const spliteado = this.convertirAArray(texto, true);
  //       let arrayCorrecto = [];
  //       const respuesta = await this.previaPruebaFormula(spliteado);
  //       if (!respuesta.valido) {
  //         this.toaster.error('Formula no Valida', 'Error', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 3000,
  //         });
  //         this.stiloFormula();
  //         return;
  //       } else {
  //         arrayCorrecto = respuesta.arrayCorrecto;
  //       }

  //       const formula = arrayCorrecto.join('');
  //       if (formula !== this.tablaSistema[this.filaSel2].id_padre) {
  //         this.tablaSistema[this.filaSel2].id_padre = formula;
  //         await this.calculoMontosSistema();
  //         await this.verificarParametrosCambioTabla();
  //         await this.actualizarDataPrincipal();
  //         this.stiloFormula();
  //         this.guardarTablaTemporal('evaluarfor');
  //       }
  //       this.stiloFormula();
  //     } else {
  //       this.stiloFormula();
  //       return;
  //     }
  //   }, 50);
  //   //
  // }

  // async previaPruebaFormula(texto) {
  //   const columnas = ['C', 'D', 'E', 'F', 'G'];
  //   let nuevoString = [];
  //   let formula = [];
  //   let valido = true;
  //   for (const iterator of texto) {
  //     if (iterator.length > 1) {
  //       const numero = parseFloat(iterator);
  //       if (isNaN(numero)) {
  //         valido = false;
  //         break;
  //       } else {
  //         const texto = iterator.slice(numero.toString().length);
  //         if (!texto && !isNaN(numero)) {
  //           nuevoString.push(numero);
  //           formula.push(iterator);
  //         } else {
  //           if (columnas.includes(texto)) {
  //             nuevoString.push(numero);
  //             nuevoString.push('*');
  //             nuevoString.push(1);
  //             formula.push(iterator);
  //           } else {
  //             valido = false;
  //             break;
  //           }
  //         }
  //       }
  //     } else {
  //       if (columnas.includes(iterator)) {
  //         nuevoString.push(1);
  //         formula.push(iterator);
  //       } else {
  //         nuevoString.push(iterator);
  //         formula.push(iterator);
  //       }
  //     }
  //   }
  //   valido = await this.calcularformula(nuevoString.join(''));
  //   return { valido: valido, arrayCorrecto: formula };
  // }

  // verificarHabForm() {
  //   this.tempFormula = [];
  //   this.mostrarColrs = false;
  //   if (this.solover || !this.editable) {
  //     return;
  //   }
  //   if (this.filaSel2 !== -1) {
  //     if (
  //       this.metradoSeleccionado?.id_metrado == null ||
  //       (this.metradoSeleccionado.esMetrado &&
  //         this.metradoSeleccionado.tieneSubmetrado) ||
  //       this.metradoSeleccionado.tieneAceros ||
  //       this.metradoSeleccionado.estitulo
  //     ) {
  //       this.toaster.error('Formula no editable', null, {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 3000,
  //       });
  //       return;
  //     }
  //     this.habEditFormula = true;
  //     // this.mostrarColrs = true

  //     this.teclaFormula(
  //       this.metradoSeleccionado.id_padre == null
  //         ? 'C*D*E*F*G'
  //         : this.metradoSeleccionado.id_padre
  //     );
  //   } else {
  //     this.toaster.error(
  //       'Ninguna fila seleccionada de la tabla hoja metrado',
  //       null,
  //       {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 3000,
  //       }
  //     );
  //     this.mostrarColrs = false;
  //     this.habEditFormula = false;

  //     return;
  //   }
  // }

  // stiloFormula() {
  //   // this.habEditFormula = false
  //   let result = '';
  //   if (
  //     this.metradoSeleccionado &&
  //     this.metradoSeleccionado?.id_metrado !== null &&
  //     !this.metradoSeleccionado?.estitulo &&
  //     ((this.metradoSeleccionado?.esMetrado &&
  //       !this.metradoSeleccionado?.tieneSubmetrado) ||
  //       !this.metradoSeleccionado?.esMetrado)
  //   ) {
  //     let letras = {
  //       C: '#c18861',
  //       D: '#459ab8',
  //       E: '#60407b',
  //       F: '#3b9061',
  //       G: '#b352a4',
  //     };
  //     let palabra =
  //       this.metradoSeleccionado.id_padre == null
  //         ? 'C*D*E*F*G'
  //         : this.metradoSeleccionado.id_padre;
  //     for (let i = 0; i < palabra.length; i++) {
  //       // Letra actual
  //       let letra = palabra[i];
  //       let indice = letra.toUpperCase();
  //       if (letras.hasOwnProperty(indice)) {
  //         const color = letras[indice];
  //         result += `<span style="color:${color}">${letra}</span>`;
  //       } else {
  //         result += letra;
  //       }
  //     }
  //     var span = document.getElementById('spanformula');
  //     if (span) {
  //       span.innerHTML = result;
  //     }
  //   } else {
  //     var span = document.getElementById('spanformula');
  //     if (span) {
  //       span.innerHTML = result;
  //     }
  //   }
  // }

  // async mostrarColores(row) {
  //   if (!this.seleccionCelda) {
  //     if (
  //       this.metradoSeleccionado?.id_metrado !== null &&
  //       !this.metradoSeleccionado?.estitulo &&
  //       ((this.metradoSeleccionado?.esMetrado &&
  //         !this.metradoSeleccionado?.tieneSubmetrado) ||
  //         !this.metradoSeleccionado?.esMetrado)
  //     ) {
  //       if (this.mostrarColrs) {
  //         this.mostrarColrs = false;
  //       } else {
  //         this.mostrarColrs = true;
  //       }
  //     } else {
  //       this.mostrarColrs = false;
  //     }
  //   }
  // }

  // convertirAArray(expresion: string, tipo = false): string[] {
  //   let array = [];
  //   const partes = expresion.split(/([\+\-\*/\(\)])/);
  //   let resultado = partes.filter((elemento) => elemento !== '');
  //   if (tipo) {
  //     array = resultado.map((ele) => {
  //       return ele;
  //     });
  //   } else {
  //     for (const ele of resultado) {
  //       const valorNumerico = parseFloat(ele);
  //       if (
  //         !isNaN(valorNumerico) &&
  //         valorNumerico.toString().length !== ele.length
  //       ) {
  //         const texto = ele.slice(valorNumerico.toString().length);
  //         array.push(valorNumerico);
  //         array.push('*');
  //         array.push(texto);
  //       } else {
  //         array.push(ele);
  //       }
  //     }
  //   }
  //   return array;
  // }

  // calcularformula(texto) {
  //   try {
  //     return math.evaluate(texto);
  //   } catch {
  //     return null;
  //   }
  // }

  // pintarCelda(letra) {
  //   let valido = false;
  //   if (this.metradoSeleccionado.id_metrado !== null) {
  //     const formula =
  //       this.metradoSeleccionado.id_padre == null
  //         ? 'C*D*E*F*G'
  //         : this.metradoSeleccionado.id_padre;
  //     const spliteado = formula.split(/[/+*-]+/);
  //     spliteado.map((ele) => {
  //       if (ele.includes(letra)) {
  //         valido = true;
  //       }
  //     });
  //   }
  //   return valido;
  // }

  // teclaFormula(value) {
  //   if (!this.habEditFormula) {
  //     this.tempFormula = [];
  //     return;
  //   }
  //   this.tempFormula = this.convertirAArray(value.toUpperCase());
  // }

  // existeEdicion(fila) {
  //   let valido = false;
  //   if (!this.habEditFormula) {
  //     this.tempFormula = [];
  //   }
  //   this.tempFormula.map((ele) => {
  //     if (ele.toString().includes(fila)) {
  //       valido = true;
  //     }
  //   });
  //   return valido;
  // }

  // async reiniciarFormula() {
  //   if (
  //     this.metradoSeleccionado &&
  //     this.metradoSeleccionado?.id_metrado !== null
  //   ) {
  //     let arrayIndices = [];

  //     if (this.metradoSeleccionado.esMetrado) {
  //       for (let i = this.filaSel2 + 1; i < this.tablaSistema.length; i++) {
  //         const row = this.tablaSistema[i];
  //         if (row.id_metrado !== null) {
  //           if (
  //             (row.esMetrado && !row.estitulo) ||
  //             (!row.esMetrado && row.estitulo)
  //           ) {
  //             break;
  //           } else if (!row.esMetrado && !row.estitulo) {
  //             arrayIndices.push(i);
  //           }
  //         }
  //       }

  //       if (arrayIndices.length) {
  //         const sw = await SwalService.confirm(
  //           'Estas seguro?',
  //           'Se reiniciara la formula de todas las filas relacionadas al metrado'
  //         );
  //         if (sw.isConfirmed) {
  //           arrayIndices.unshift(this.filaSel2);
  //         } else {
  //           return;
  //         }
  //       } else if (
  //         this.metradoSeleccionado.esMetrado &&
  //         !this.metradoSeleccionado.tieneSubmetrado &&
  //         !this.metradoSeleccionado.estitulo
  //       ) {
  //         arrayIndices.push(this.filaSel2);
  //       }
  //     } else if (this.metradoSeleccionado.estitulo) {
  //       return;
  //     } else if (
  //       !this.metradoSeleccionado.esMetrado &&
  //       !this.metradoSeleccionado.estitulo &&
  //       !this.metradoSeleccionado.tieneSubmetrado
  //     ) {
  //       arrayIndices.push(this.filaSel2);
  //     }
  //     if (arrayIndices.length) {
  //       for (const iterator of arrayIndices) {
  //         this.tablaSistema[iterator].id_padre = 'C*D*E*F*G';
  //       }
  //       await this.calculoMontosSistema();
  //       await this.verificarParametrosCambioTabla();
  //       this.guardarTablaTemporal('evaluarfor');
  //     }

  //     this.stiloFormula();
  //     // }
  //   }
  // }

  // async copiarFormula() {
  //   if (
  //     this.metradoSeleccionado &&
  //     this.metradoSeleccionado.id_metrado !== null
  //   ) {
  //     if (
  //       this.metradoSeleccionado?.estitulo ||
  //       (this.metradoSeleccionado.esMetrado &&
  //         (this.metradoSeleccionado.tieneAceros ||
  //           this.metradoSeleccionado.tieneSubmetrado))
  //     ) {
  //       this.toaster.error('Fila seleccionada no valida', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //       return;
  //     } else {
  //       this.formulaCopiada =
  //         this.metradoSeleccionado.id_padre == null
  //           ? 'C*D*E*F*G'
  //           : this.metradoSeleccionado.id_padre;
  //       this.toaster.info('Formula Copiada', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 2000,
  //       });
  //     }
  //   } else {
  //     this.toaster.error('Ninguna fila seleccionada', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  // }

  // async pegarFormula() {
  //   if (
  //     (this.metradoSeleccionado ||
  //       (!this.metradoSeleccionado && this.habilitadoCopiar)) &&
  //     this.metradoSeleccionado?.id_metrado !== null &&
  //     !this.metradoSeleccionado?.estitulo &&
  //     !this.metradoSeleccionado?.tieneAceros
  //   ) {
  //     if (this.habilitadoCopiar) {
  //       const encontrados = this.tablaSistema.filter((ele) => ele.editarCopiar);
  //       for (const iterator of encontrados) {
  //         if (
  //           ((iterator.esMetrado && !iterator.tieneSubmetrado) ||
  //             !iterator.esMetrado) &&
  //           !iterator.estitulo
  //         ) {
  //           iterator.id_padre = this.formulaCopiada;
  //           iterator.editarCopiar = false;
  //         }
  //       }
  //       this.habilitadoCopiar = false;
  //     } else {
  //       this.metradoSeleccionado.id_padre = this.formulaCopiada;
  //     }
  //     this.stiloFormula();
  //   } else {
  //     this.toaster.error('No se puede pegar en la fila seleccionada', 'Error', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  // }

  // async copiarFraccionTabla() {
  //   this.copiadoCeldas = true;
  //   this.inicioCeldaCopiado = null;
  //   this.finCeldaCopiado = null;
  //   this.metradoSeleccionado = null;
  //   this.filaSel2 = -1;
  // }

  // async CancelarCopiarFraccionTabla() {
  //   this.copiadoCeldas = false;
  //   this.inicioCeldaCopiado = null;
  //   this.finCeldaCopiado = null;
  //   this.metradoSeleccionado = null;
  //   this.filaSel2 = -1;
  // }

  // async guardarSeleccionadosCeldas(limpiar = false) {
  //   let iniciox = null;
  //   let inicioy = null;
  //   let finx = null;
  //   let finy = null;
  //   let arrayCopiar = [];
  //   if (this.copiadoCeldas && this.inicioCeldaCopiado && this.finCeldaCopiado) {
  //     if (this.inicioCeldaCopiado.columna > this.finCeldaCopiado.columna) {
  //       inicioy = this.finCeldaCopiado.columna;
  //       finy = this.inicioCeldaCopiado.columna;
  //     } else {
  //       finy = this.finCeldaCopiado.columna;
  //       inicioy = this.inicioCeldaCopiado.columna;
  //     }
  //     if (this.inicioCeldaCopiado.fila > this.finCeldaCopiado.fila) {
  //       iniciox = this.finCeldaCopiado.fila;
  //       finx = this.inicioCeldaCopiado.fila;
  //     } else {
  //       finx = this.finCeldaCopiado.fila;
  //       iniciox = this.inicioCeldaCopiado.fila;
  //     }
  //     const array = [
  //       'descripcion',
  //       'cantidad',
  //       'n_veces',
  //       'largo',
  //       'ancho',
  //       'altura',
  //     ];
  //     let validos = [];
  //     if (inicioy == finy) {
  //       validos = [array[inicioy]];
  //     } else {
  //       validos = array.slice(inicioy, finy + 1);
  //     }

  //     for (let i = iniciox; i <= finx; i++) {
  //       let obj = [];
  //       const row = this.tablaSistema[i];
  //       for (const key of validos) {
  //         obj.push(row[key]);
  //         if (limpiar) {
  //           row[key] = null;
  //         }
  //       }
  //       arrayCopiar.push(obj);
  //     }
  //   } else if (
  //     this.copiadoCeldas &&
  //     this.inicioCeldaCopiado &&
  //     !this.finCeldaCopiado
  //   ) {
  //     let obj = {};
  //     const valor =
  //       this.tablaSistema[this.inicioCeldaCopiado.fila][
  //         this.inicioCeldaCopiado.colname
  //       ];
  //     const arr = [valor];
  //     arrayCopiar.push(arr);
  //   } else {
  //     this.toaster.error('Ninguna celda seleccionada', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 2000,
  //     });
  //     return;
  //   }
  //   this.arrayCopiadosMetrado = [];
  //   this.celdasCopiadosMetrado = arrayCopiar;
  // }

  // evaluarPintadoCelda(fila, columna) {
  //   let pintar = false;
  //   let iniciox = null;
  //   let inicioy = null;
  //   let finx = null;
  //   let finy = null;
  //   if (this.copiadoCeldas && this.inicioCeldaCopiado && this.finCeldaCopiado) {
  //     if (this.inicioCeldaCopiado.columna > this.finCeldaCopiado.columna) {
  //       inicioy = this.finCeldaCopiado.columna;
  //       finy = this.inicioCeldaCopiado.columna;
  //     } else {
  //       finy = this.finCeldaCopiado.columna;
  //       inicioy = this.inicioCeldaCopiado.columna;
  //     }
  //     if (this.inicioCeldaCopiado.fila > this.finCeldaCopiado.fila) {
  //       iniciox = this.finCeldaCopiado.fila;
  //       finx = this.inicioCeldaCopiado.fila;
  //     } else {
  //       finx = this.finCeldaCopiado.fila;
  //       iniciox = this.inicioCeldaCopiado.fila;
  //     }
  //     if (
  //       iniciox <= fila &&
  //       fila <= finx &&
  //       inicioy <= columna &&
  //       columna <= finy
  //     ) {
  //       pintar = true;
  //     }
  //   } else if (
  //     this.copiadoCeldas &&
  //     this.inicioCeldaCopiado &&
  //     !this.finCeldaCopiado
  //   ) {
  //     if (
  //       fila == this.inicioCeldaCopiado.fila &&
  //       columna == this.inicioCeldaCopiado.columna
  //     ) {
  //       pintar = true;
  //     }
  //   }
  //   return pintar;
  // }

  // // evaluarParcialConForm(row) {
  // //   if (row.id_metrado !== null && !row.estitulo && ((row.esMetrado && !row.tieneSubmetrado) || !row.esMetrado)) {
  // //     if (row.parcial == 0 && row.id_padre !== null && row.id_padre !== 'C*D*E*F*G' && row.cantidad) {
  // //         return '#'
  // //     }
  // //   }
  // // }

  // async buscarEspecifico(ind, esMetrado, estitulo, posterior, tabla) {
  //   let elemento = null;
  //   let index = null;
  //   if (posterior) {
  //     for (let i = ind; i < this[tabla].length; i++) {
  //       const row = this[tabla][i];
  //       if (
  //         row.id_metrado !== null &&
  //         row[esMetrado] == esMetrado &&
  //         row[estitulo] == estitulo
  //       ) {
  //         elemento = row;
  //         break;
  //       }
  //     }
  //   } else {
  //     for (let i = ind; i < this[tabla].length; i--) {
  //       const row = this[tabla][i];
  //       if (
  //         row.id_metrado !== null &&
  //         row[esMetrado] == esMetrado &&
  //         row[estitulo] == estitulo
  //       ) {
  //         elemento = row;
  //         break;
  //       }
  //     }
  //   }
  //   return { row: elemento, index: index };
  // }

  // async modalEstilosDetalle() {
  //   const existeEstilos = await this.dataTitulos.find((ele) => {
  //     if (ele.data[0].estilo) {
  //       return ele;
  //     }
  //   });
  //   if (existeEstilos) {
  //     var array = JSON.parse(existeEstilos.data[0].estilo);

  //     this.stilosTit = array[0]
  //       ? array[0]
  //       : { color: '', alineamiento: 'left', tipo: '', size: '10' };
  //     this.stilosMet = array[1]
  //       ? array[1]
  //       : { color: '', alineamiento: 'left', tipo: '', size: '10' };
  //     this.stilosSubM = array[2]
  //       ? array[2]
  //       : { color: '', alineamiento: 'left', tipo: '', size: '10' };
  //     this.stilosTexto = array[3]
  //       ? array[3]
  //       : { color: '', alineamiento: 'left', tipo: '', size: '10' };
  //   } else {
  //     this.stilosTit = {
  //       color: '',
  //       alineamiento: 'left',
  //       tipo: '',
  //       size: '10',
  //     };
  //     this.stilosMet = {
  //       color: '',
  //       alineamiento: 'left',
  //       tipo: '',
  //       size: '10',
  //     };
  //     this.stilosSubM = {
  //       color: '',
  //       alineamiento: 'left',
  //       tipo: '',
  //       size: '10',
  //     };
  //     this.stilosTexto = {
  //       color: '',
  //       alineamiento: 'left',
  //       tipo: '',
  //       size: '10',
  //     };
  //   }
  //   const obj = {
  //     stilosTit: this.stilosTit,
  //     stilosMet: this.stilosMet,
  //     stilosSubM: this.stilosSubM,
  //     stilosTexto: this.stilosTexto,
  //   };
  //   this.ultStilos = JSON.parse(JSON.stringify(obj));
  //   this.modalEstilos.show();
  // }

  // async cerrarModal() {
  //   if (this.ultStilos) {
  //     this.stilosTit = this.ultStilos.stilosTit;
  //     this.stilosMet = this.ultStilos.stilosMet;
  //     this.stilosSubM = this.ultStilos.stilosSubM;
  //     this.stilosTexto = this.ultStilos.stilosTexto;
  //   }
  //   this.modalEstilos.hide();
  // }

  // cambiarcolor(valor, fila, columna) {
  //   this[fila][columna] = valor;
  // }

  // async actualizarEstilosProyecto() {
  //   this.mostrar_carga_todo = true;
  //   const stilos = [
  //     this.stilosTit,
  //     this.stilosMet,
  //     this.stilosSubM,
  //     this.stilosTexto,
  //   ];

  //   for await (let titulo of this.dataTitulos) {
  //     titulo.data[0].estilo = JSON.stringify(stilos);
  //     titulo.data[0].editadoMetrado = 1;
  //     if (!titulo.tipo_registro) {
  //       titulo.modificado = true;
  //     }
  //   }
  //   this.habilitarMultipleSelect = false;
  //   this.bloquearBotones = false;
  //   this.tablaSeleccionada = null;
  //   this.filaSel2 = -1;
  //   this.filaSel3 = -1;
  //   this.filaSel = null;
  //   this.partidaSeleccionada = null;
  //   this.metradoSeleccionado = null;
  //   this.mostrarColrs = false;
  //   this.tempFormula = [];
  //   this.aceroSeleccionado = null;
  //   this.posicionCursor = null;
  //   this.ocultarChecks = null;
  //   this.opcionHabilitarSistema = null;
  //   this.opcionHabilitarAceros = null;
  //   this.iniciado = false;
  //   this.habilitadoCopiar = false;
  //   this.tablaAceros = [];
  //   this.tablaSistema = [];
  //   this.fueradeTabla();
  //   await this.guardarTablaTemporal('actualizarEstilosProyecto');
  //   this.modalEstilos.hide();
  //   this.mostrar_carga_todo = false;
  //   this.toaster.info(
  //     'Se modifico los estilos de detalles de metrados del proyecto, para guardar guarde los cambios del rpoyecto',
  //     '',
  //     {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 3000,
  //     }
  //   );
  // }

  // async seleccionTablaExcel(row, i) {
  //   this.filaExcelSel = row;
  //   this.indexTablaExcel = i;
  // }

  // alineamientoTexto(row) {
  //   let alineamiento = '';
  //   if (row.id_metrado !== null) {
  //     if (row.estitulo == 1) {
  //       alineamiento = this.stilosTit.alineamiento
  //         ? this.stilosTit.alineamiento + '!important'
  //         : 'left';
  //     } else if (!row.estitulo && row.esMetrado) {
  //       alineamiento = this.stilosMet.alineamiento
  //         ? this.stilosMet.alineamiento + '!important'
  //         : 'left';
  //     } else if (!row.estitulo && !row.esMetrado) {
  //       alineamiento = this.stilosSubM.alineamiento
  //         ? this.stilosSubM.alineamiento + '!important'
  //         : 'left';
  //     } else if (row.estitulo == 2) {
  //       alineamiento = this.stilosTexto.alineamiento
  //         ? this.stilosTexto.alineamiento + '!important'
  //         : 'left';
  //     }
  //   }
  //   return alineamiento;
  // }

  // alineamientoTexto2(row) {
  //   let alineamiento = '';
  //   if (row.id_metrado !== null) {
  //     if (row.nivel == 1) {
  //       alineamiento = this.stilosTit.alineamiento
  //         ? this.stilosTit.alineamiento + '!important'
  //         : 'left';
  //     } else if (row.nivel == 2) {
  //       alineamiento = this.stilosMet.alineamiento
  //         ? this.stilosMet.alineamiento + '!important'
  //         : 'left';
  //     } else if (row.nivel == 3 || !row.nivel) {
  //       alineamiento = this.stilosSubM.alineamiento
  //         ? this.stilosSubM.alineamiento + '!important'
  //         : 'left';
  //     } else if (row.nivel == 4) {
  //       alineamiento = this.stilosTexto.alineamiento
  //         ? this.stilosTexto.alineamiento + '!important'
  //         : 'left';
  //     }
  //   }
  //   return alineamiento;
  // }

  // colorTexto2(row) {
  //   let color = '';
  //   if (!row.item) {
  //     if (row.nivel == 1) {
  //       color = this.stilosTit.color
  //         ? this.stilosTit.color + '!important'
  //         : 'left';
  //     } else if (row.nivel == 2) {
  //       color = this.stilosMet.color
  //         ? this.stilosMet.color + '!important'
  //         : 'left';
  //     } else if (row.nivel == 3 || !row.nivel) {
  //       color = this.stilosSubM.color
  //         ? this.stilosSubM.color + '!important'
  //         : 'left';
  //     } else if (row.nivel == 4) {
  //       color = this.stilosTexto.color
  //         ? this.stilosTexto.color + '!important'
  //         : 'left';
  //     }
  //   }
  //   return color;
  // }

  // textoSize(row) {
  //   let size = '';
  //   if (!row.item) {
  //     if (row.nivel == 1) {
  //       size = this.stilosTit.size ? this.stilosTit.size + '!important' : '10';
  //     } else if (row.nivel == 2) {
  //       size = this.stilosMet.size ? this.stilosMet.size + '!important' : '10';
  //     } else if (row.nivel == 3 || row.nivel == null) {
  //       size = this.stilosSubM.size
  //         ? this.stilosSubM.size + '!important'
  //         : '10';
  //     } else if (row.nivel == 4) {
  //       size = this.stilosTexto.size
  //         ? this.stilosTexto.size + '!important'
  //         : '10';
  //     }
  //   }
  //   return size;
  // }

  // async impresionMetrado(tipo) {
  //   try {
  //     this.mostrar_carga_todo = true;
  //     this.tablaTituloSeleccionado = [];
  //     const temporal = await this.listarTablaTemporal();
  //     const temporalPresu = await this.verificarCambiosPresupuesto();
  //     if (temporal || temporalPresu.length) {
  //       let msj = '';
  //       if (temporal && temporalPresu.length) {
  //         msj = 'Existen cambios sin guardar en presupuesto y hojas de metrado';
  //       } else if (!temporal && temporalPresu.length) {
  //         msj = 'Existen cambios sin guardar en presupuesto ';
  //       } else if (temporal && !temporalPresu.length) {
  //         msj = 'Existen cambios sin guardar en hojas de metrado ';
  //       }
  //       this.mostrar_carga_todo = false;
  //       this.toaster.error(msj, '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 3000,
  //       });
  //       return;
  //     } else {
  //       let tablaCompleta = [];
  //       let tabla = [];
  //       let arrayHeader = [];
  //       let keys_body = [];
  //       let col_alig = [];
  //       let keys_dec = [];
  //       let orientacion = '';
  //       let tipoRep = 0;
  //       let tituloaux;
  //       if (this.dataTitulo.tipo_registro == 1) {
  //         const response = await this.listarTablaExcel(this.dataTitulo.indice);
  //         // console.log('response', response);
  //         tipoRep = 2;
  //         if (response) {
  //           if (response[1]) {
  //             var structuraheader = await this.estructurarHeader(
  //               response[1][0]
  //             );
  //             if (structuraheader.grupos_header) {
  //               let h1 = [];
  //               if (structuraheader.grupos_header.i > 0) {
  //                 const obj = {
  //                   text: '',
  //                   colSpan: structuraheader.grupos_header.i,
  //                   rowSpan: 1,
  //                 };
  //                 h1.push(obj);
  //               }
  //               if (structuraheader.grupos_header.g > 0) {
  //                 const obj = {
  //                   text: 'Generales',
  //                   colSpan: structuraheader.grupos_header.g,
  //                   rowSpan: 1,
  //                 };
  //                 h1.push(obj);
  //               }
  //               if (structuraheader.grupos_header.d > 0) {
  //                 const obj = {
  //                   text: 'Descuentos',
  //                   colSpan: structuraheader.grupos_header.d,
  //                   rowSpan: 1,
  //                 };
  //                 h1.push(obj);
  //               }
  //               if (structuraheader.grupos_header.f > 0) {
  //                 const obj = {
  //                   text: '',
  //                   colSpan: structuraheader.grupos_header.f,
  //                   rowSpan: 1,
  //                 };
  //                 h1.push(obj);
  //               }
  //               if (h1.length) {
  //                 arrayHeader.push(h1);
  //               }
  //             }
  //             if (structuraheader.header2) {
  //               let h2 = [];
  //               for (const celda of structuraheader.header2) {
  //                 const obj = {
  //                   text: celda.toUpperCase(),
  //                   colSpan: 1,
  //                   rowSpan: 1,
  //                 };
  //                 h2.push(obj);
  //               }
  //               if (h2.length) {
  //                 arrayHeader.push(h2);
  //                 if (h2.length > 6) {
  //                   orientacion = 'landscape';
  //                 }
  //               }
  //             }
  //             if (structuraheader.header) {
  //               keys_body = structuraheader.header;
  //               const arrLeft = ['item', 'descripcion'];
  //               const arrright = [
  //                 'mtotal',
  //                 'subtotal',
  //                 'gsubtotal',
  //                 'dsubtotal',
  //                 'mparcial',
  //               ];
  //               for (const key of keys_body) {
  //                 let dec = null;
  //                 let alineamiento = 'center';
  //                 if (arrLeft.includes(key)) {
  //                   alineamiento = 'left';
  //                 }
  //                 if (arrright.includes(key)) {
  //                   alineamiento = 'right';
  //                   dec = this.dec_metrado;
  //                 }

  //                 col_alig.push(alineamiento);
  //                 keys_dec.push(dec);
  //               }
  //             }
  //           }
  //           if (response[0]) {
  //             tabla = response[0];
  //           }

  //           for (const iterator of tabla) {
  //             let obj2 = {};
  //             if (iterator.item) {
  //               let tipol = '';
  //               let colorl = '';
  //               let fondol = '';
  //               let valor2 = iterator.item.toString().split('.');
  //               if (this.titulo1letra != undefined) {
  //                 if (iterator.unidad) {
  //                   colorl = this.titulo1letra[11];
  //                 } else {
  //                   let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                   colorl = this.titulo1letra[ind];
  //                 }
  //               }
  //               if (this.titulo1color != undefined) {
  //                 if (iterator.unidad) {
  //                   fondol = this.titulo1color[11];
  //                 } else {
  //                   let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                   fondol = this.titulo1color[ind];
  //                 }
  //               }
  //               if (this.titulo1 != undefined) {
  //                 if (iterator.unidad) {
  //                   tipol = this.titulo1[11];
  //                 } else {
  //                   let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                   tipol = this.titulo1[ind];
  //                 }
  //               }
  //               for (const key of keys_body) {
  //                 obj2[key] = iterator[key] ? iterator[key] : '';
  //               }

  //               obj2['tipoletra'] = tipol;
  //               obj2['color'] = colorl == 'unset' ? '' : colorl;
  //               obj2['fondo'] = fondol == 'none' ? '' : fondol;
  //               obj2['alinea'] = '';
  //               obj2['fontSize'] = '';
  //             } else {
  //               for (const key of keys_body) {
  //                 obj2[key] = iterator[key] ? iterator[key] : '';
  //               }

  //               if (iterator.nivel == 1) {
  //                 const alineamiento =
  //                   this.stilosTit.alineamiento == 'start'
  //                     ? 'left'
  //                     : this.stilosTit.alineamiento == 'end'
  //                     ? 'right'
  //                     : this.stilosTit.alineamiento;
  //                 obj2['tipoletra'] = this.stilosTit.tipo;
  //                 obj2['color'] = this.stilosTit.color;
  //                 obj2['fondo'] = '';
  //                 obj2['alinea'] = alineamiento;
  //                 obj2['fontSize'] = this.stilosTit.size;
  //               } else if (iterator.nivel == 4) {
  //                 const alineamiento =
  //                   this.stilosTexto.alineamiento == 'start'
  //                     ? 'left'
  //                     : this.stilosTexto.alineamiento == 'end'
  //                     ? 'right'
  //                     : this.stilosTexto.alineamiento;
  //                 obj2['tipoletra'] = this.stilosTexto.tipo;
  //                 obj2['color'] = this.stilosTexto.color;
  //                 obj2['fondo'] = '';
  //                 obj2['alinea'] = alineamiento;
  //                 obj2['fontSize'] = this.stilosTexto.size;
  //               } else if (iterator.nivel == 2) {
  //                 const alineamiento =
  //                   this.stilosMet.alineamiento == 'start'
  //                     ? 'left'
  //                     : this.stilosMet.alineamiento == 'end'
  //                     ? 'right'
  //                     : this.stilosMet.alineamiento;
  //                 obj2['tipoletra'] = this.stilosMet.tipo;
  //                 obj2['color'] = this.stilosMet.color;
  //                 obj2['fondo'] = '';
  //                 obj2['alinea'] = alineamiento;
  //                 obj2['fontSize'] = this.stilosMet.size;
  //               } else if (iterator.nivel == 3 || !iterator.nivel) {
  //                 const alineamiento =
  //                   this.stilosSubM.alineamiento == 'start'
  //                     ? 'left'
  //                     : this.stilosSubM.alineamiento == 'end'
  //                     ? 'right'
  //                     : this.stilosSubM.alineamiento;
  //                 obj2['tipoletra'] = this.stilosSubM.tipo;
  //                 obj2['color'] = this.stilosSubM.color;
  //                 obj2['fondo'] = '';
  //                 obj2['alinea'] = alineamiento;
  //                 obj2['fontSize'] = this.stilosSubM.size;
  //               }
  //             }
  //             tablaCompleta.push(obj2);
  //           }
  //         }
  //         tituloaux = 'HOJA DE METRADO DESAGREGADO';
  //       } else {
  //         const obj = {
  //           id_proyecto: this.idProyecto,
  //           titulo: this.dataTitulo.item,
  //         };
  //         const response = await this.metradoService.tablasMetradoTit(obj);
  //         tabla = response[0];
  //         const detallesSistema = response[1];
  //         const detalleAceros = response[2];
  //         if (tipo == 0) {
  //           tituloaux = 'RESUMEN DEL METRADO';
  //           arrayHeader = ['ITEM', 'DESCRIPCIÓN', 'UNIDAD', 'METRADO'];
  //           keys_dec = [null, null, null, this.dec_metrado];
  //           col_alig = ['left', 'left', 'center', 'right'];
  //           keys_body = ['item', 'descripcion', 'unidad', 'cant_metrado'];
  //           for (const iterator of tabla) {
  //             let tipol = '';
  //             let colorl = '';
  //             let fondol = '';
  //             let valor2 = iterator.item.toString().split('.');
  //             if (this.titulo1letra != undefined) {
  //               if (iterator.unidad) {
  //                 colorl = this.titulo1letra[11];
  //               } else {
  //                 let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                 colorl = this.titulo1letra[ind];
  //               }
  //             }
  //             if (this.titulo1color != undefined) {
  //               if (iterator.unidad) {
  //                 fondol = this.titulo1color[11];
  //               } else {
  //                 let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                 fondol = this.titulo1color[ind];
  //               }
  //             }
  //             if (this.titulo1 != undefined) {
  //               if (iterator.unidad) {
  //                 tipol = this.titulo1[11];
  //               } else {
  //                 let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                 tipol = this.titulo1[ind];
  //               }
  //             }
  //             const metrado =
  //               Number(iterator.cant_metrado) == 0
  //                 ? iterator.cantidad
  //                 : Number(iterator.cant_metrado);
  //             const obj = {
  //               item: iterator.item,
  //               descripcion: iterator.descripcion, //es aca creo
  //               unidad: iterator.unidad,
  //               cant_metrado: this.formsService.redondeo(
  //                 metrado,
  //                 this.dec_metrado
  //               ),
  //               tipoletra: tipol,
  //               color: colorl == 'unset' ? '' : colorl,
  //               fondo: fondol == 'none' ? '' : fondol,
  //               alinea: '',
  //               fonstSize: '',
  //             };
  //             tablaCompleta.push(obj);
  //           }
  //         } else if (tipo == 1) {
  //           tituloaux = 'HOJA DE METRADO DESAGREGADO';
  //           tipoRep = 2;
  //           arrayHeader = [
  //             'ITEM',
  //             'DESCRIPCIÓN',
  //             'CANTIDAD',
  //             'N VECES',
  //             'LARGO',
  //             'ANCHO',
  //             'ALTURA',
  //             'PARCIAL',
  //             'SUBTOTAL',
  //             'METRADO',
  //             'UNIDAD',
  //           ];
  //           orientacion = 'landscape';
  //           col_alig = [
  //             'left',
  //             'left',
  //             'left',
  //             'left',
  //             'left',
  //             'left',
  //             'left',
  //             'right',
  //             'right',
  //             'right',
  //             'center',
  //           ];
  //           keys_body = [
  //             'item',
  //             'descripcion',
  //             'cantidad',
  //             'n_veces',
  //             'largo',
  //             'ancho',
  //             'altura',
  //             'parcial',
  //             'subtotal',
  //             'cant_metrado',
  //             'unidad',
  //           ];
  //           keys_dec = [
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             this.dec_metrado,
  //             this.dec_metrado,
  //             this.dec_metrado,
  //             null,
  //           ];
  //           for (const iterator of tabla) {
  //             let tipol = '';
  //             let colorl = '';
  //             let fondol = '';
  //             let valor2 = iterator.item.toString().split('.');
  //             if (this.titulo1letra != undefined) {
  //               if (iterator.unidad) {
  //                 colorl = this.titulo1letra[11];
  //               } else {
  //                 let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                 colorl = this.titulo1letra[ind];
  //               }
  //             }
  //             if (this.titulo1color != undefined) {
  //               if (iterator.unidad) {
  //                 fondol = this.titulo1color[11];
  //               } else {
  //                 let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                 fondol = this.titulo1color[ind];
  //               }
  //             }
  //             if (this.titulo1 != undefined) {
  //               if (iterator.unidad) {
  //                 tipol = this.titulo1[11];
  //               } else {
  //                 let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                 tipol = this.titulo1[ind];
  //               }
  //             }
  //             const metrado =
  //               Number(iterator.cant_metrado) == 0
  //                 ? iterator.cantidad
  //                 : Number(iterator.cant_metrado);
  //             const obj = {
  //               item: iterator.item,
  //               descripcion: iterator.descripcion,
  //               unidad: iterator.unidad,
  //               cant_metrado: this.formsService.redondeo(
  //                 metrado,
  //                 this.dec_metrado
  //               ),
  //               n_veces: null,
  //               largo: null,
  //               ancho: null,
  //               altura: null,
  //               parcial: null,
  //               subtotal: null,
  //               tipoletra: tipol,
  //               color: colorl == 'unset' ? '' : colorl,
  //               fondo: fondol == 'none' ? '' : fondol,
  //               alinea: '',
  //               fonstSize: '',
  //             };
  //             tablaCompleta.push(obj);
  //             // if (iterator.item && iterator.unidad) {
  //             const filtrados = detallesSistema.filter(
  //               (ele) => ele.indice == iterator.indice
  //             );
  //             if (filtrados.length) {
  //               for (const row of filtrados) {
  //                 let obj2 = {};
  //                 for (const key of keys_body) {
  //                   let texto = null;
  //                   if (key == 'item' || key == 'unidad' || key == 'metrado') {
  //                     texto = '';
  //                   } else {
  //                     const arraynoValido = ['parcial', 'subtotal'];
  //                     // if (row.estitulo || row.tieneSubmetrado) {
  //                     //   if (arraynoValido.includes(key)) {
  //                     //     texto = '';
  //                     //   } else {
  //                     //     texto =
  //                     //       key == 'parcial' || key == 'subtotal'
  //                     //         ? this.formsService.redondeo(
  //                     //             row[key],
  //                     //             this.dec_metrado
  //                     //           )
  //                     //         : row[key] !== undefined
  //                     //         ? row[key]
  //                     //         : '';
  //                     //   }
  //                     // } else {
  //                     //   texto = row[key] !== undefined ? row[key] : '';
  //                     // }
  //                     if (
  //                       (row.estitulo && arraynoValido.includes(key)) ||
  //                       (!row.esMetrado && !row.estitulo && key == 'subtotal')
  //                     ) {
  //                       texto = '';
  //                     } else if (row.tieneSubmetrado && key == 'parcial') {
  //                       texto = '';
  //                     } else {
  //                       texto =
  //                         key == 'parcial' || key == 'subtotal'
  //                           ? this.formsService.redondeo(
  //                               row[key],
  //                               this.dec_metrado
  //                             )
  //                           : row[key] !== undefined
  //                           ? row[key]
  //                           : '';
  //                     }
  //                     obj2[key] =
  //                       texto !== undefined && texto !== null ? texto : '';
  //                   }
  //                 }
  //                 if (row.estitulo == 1) {
  //                   const alineamiento =
  //                     this.stilosTit.alineamiento == 'start'
  //                       ? 'left'
  //                       : this.stilosTit.alineamiento == 'end'
  //                       ? 'right'
  //                       : this.stilosTit.alineamiento;
  //                   obj2['tipoletra'] = this.stilosTit.tipo;
  //                   obj2['color'] = this.stilosTit.color;
  //                   obj2['fondo'] = '';
  //                   obj2['alinea'] = alineamiento;
  //                   obj2['fontSize'] = this.stilosTit.size;
  //                 } else if (row.estitulo == 2) {
  //                   const alineamiento =
  //                     this.stilosTexto.alineamiento == 'start'
  //                       ? 'left'
  //                       : this.stilosTexto.alineamiento == 'end'
  //                       ? 'right'
  //                       : this.stilosTexto.alineamiento;
  //                   obj2['tipoletra'] = this.stilosTexto.tipo;
  //                   obj2['color'] = this.stilosTexto.color;
  //                   obj2['fondo'] = '';
  //                   obj2['alinea'] = alineamiento;
  //                   obj2['fontSize'] = this.stilosTexto.size;
  //                 } else if (!row.estitulo && row.esMetrado) {
  //                   const alineamiento =
  //                     this.stilosMet.alineamiento == 'start'
  //                       ? 'left'
  //                       : this.stilosMet.alineamiento == 'end'
  //                       ? 'right'
  //                       : this.stilosMet.alineamiento;
  //                   obj2['tipoletra'] = this.stilosMet.tipo;
  //                   obj2['color'] = this.stilosMet.color;
  //                   obj2['fondo'] = '';
  //                   obj2['alinea'] = alineamiento;
  //                   obj2['fontSize'] = this.stilosMet.size;
  //                 } else if (!row.estitulo && !row.esMetrado) {
  //                   const alineamiento =
  //                     this.stilosSubM.alineamiento == 'start'
  //                       ? 'left'
  //                       : this.stilosSubM.alineamiento == 'end'
  //                       ? 'right'
  //                       : this.stilosSubM.alineamiento;
  //                   obj2['tipoletra'] = this.stilosSubM.tipo;
  //                   obj2['color'] = this.stilosSubM.color;
  //                   obj2['fondo'] = '';
  //                   obj2['alinea'] = alineamiento;
  //                   obj2['fontSize'] = this.stilosSubM.size;
  //                 }
  //                 tablaCompleta.push(obj2);
  //               }
  //             }
  //             // }
  //           }
  //         } else if (tipo == 2) {
  //           tituloaux = 'HOJA DE METRADO DE ACERO';
  //           const h1 = [
  //             { text: '', colSpan: 2, rowSpan: 1 },
  //             { text: 'CANTIDAD', colSpan: 1, rowSpan: 2 },
  //             { text: 'CANTIDAD', colSpan: 2, rowSpan: 1 },
  //             { text: 'LONGITUD(m)', colSpan: 2, rowSpan: 1 },
  //             { text: '', colSpan: 2, rowSpan: 1 },
  //             { text: 'TOTAL(Kg)', colSpan: 2, rowSpan: 1 },
  //             { text: '', colSpan: 2, rowSpan: 1 },
  //           ];
  //           arrayHeader.push(h1);
  //           const h2 = [
  //             { text: 'ITEM', colSpan: 1, rowSpan: 1 },
  //             { text: 'DESCRIPCIÓN', colSpan: 1, rowSpan: 1 },
  //             { text: '# ELEMENTOS', colSpan: 1, rowSpan: 1 },
  //             { text: 'TOTAL', colSpan: 1, rowSpan: 1 },
  //             { text: 'POR DISEÑO', colSpan: 1, rowSpan: 1 },
  //             { text: 'TOTAL', colSpan: 1, rowSpan: 1 },
  //             { text: 'Ø', colSpan: 1, rowSpan: 1 },
  //             { text: 'PEDO', colSpan: 1, rowSpan: 1 },
  //             { text: 'PARCIAL', colSpan: 1, rowSpan: 1 },
  //             { text: 'SUB TOTAL', colSpan: 1, rowSpan: 1 },
  //             { text: 'METRADO', colSpan: 1, rowSpan: 1 },
  //             { text: 'UNIDAD', colSpan: 1, rowSpan: 1 },
  //           ];
  //           orientacion = 'landscape';
  //           tipoRep = 2;
  //           arrayHeader.push(h2);
  //           keys_body = [
  //             'item',
  //             'descripcion',
  //             'cantidad',
  //             'elementos',
  //             'total1',
  //             'longitud',
  //             'total2',
  //             'diametro',
  //             'pesodiametro',
  //             'parcial',
  //             'subtotal',
  //             'metrado',
  //             'unidad',
  //           ];
  //           keys_dec = [
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             this.dec_metrado,
  //             this.dec_metrado,
  //             this.dec_metrado,
  //             null,
  //           ];
  //           col_alig = [
  //             'left',
  //             'left',
  //             'center',
  //             'center',
  //             'right',
  //             'center',
  //             'right',
  //             'center',
  //             'center',
  //             'right',
  //             'right',
  //             'right',
  //             'center',
  //           ];

  //           for (const iterator of tabla) {
  //             if (iterator.unidad && iterator.item) {
  //               const filtrados = detalleAceros.filter(
  //                 (ele) => ele.indice == iterator.indice
  //               );
  //               if (filtrados.length) {
  //                 let tipol = '';
  //                 let colorl = '';
  //                 let fondol = '';
  //                 let valor2 = iterator.item.toString().split('.');
  //                 if (this.titulo1letra != undefined) {
  //                   if (iterator.unidad) {
  //                     colorl = this.titulo1letra[11];
  //                   } else {
  //                     let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                     colorl = this.titulo1letra[ind];
  //                   }
  //                 }
  //                 if (this.titulo1color != undefined) {
  //                   if (iterator.unidad) {
  //                     fondol = this.titulo1color[11];
  //                   } else {
  //                     let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                     fondol = this.titulo1color[ind];
  //                   }
  //                 }
  //                 if (this.titulo1 != undefined) {
  //                   if (iterator.unidad) {
  //                     tipol = this.titulo1[11];
  //                   } else {
  //                     let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
  //                     tipol = this.titulo1[ind];
  //                   }
  //                 }
  //                 const metrado =
  //                   Number(iterator.cant_metrado) == 0
  //                     ? iterator.cantidad
  //                     : Number(iterator.cant_metrado);
  //                 const obj = {
  //                   item: iterator.item,
  //                   descripcion: iterator.descripcion,
  //                   unidad: iterator.unidad,
  //                   metrado: this.formsService.redondeo(
  //                     metrado,
  //                     this.dec_metrado
  //                   ),
  //                   cantidad: null,
  //                   elementos: null,
  //                   total1: null,
  //                   longitud: null,
  //                   total2: null,
  //                   diametro: null,
  //                   pesodiametro: null,
  //                   parcial: null,
  //                   subtotal: null,
  //                   tipoletra: tipol,
  //                   color: colorl == 'unset' ? '' : colorl,
  //                   fondo: fondol == 'none' ? '' : fondol,
  //                   alinea: '',
  //                   fonstSize: '',
  //                 };
  //                 tablaCompleta.push(obj);
  //                 for (const row of filtrados) {
  //                   let obj2 = {};
  //                   for (const key of keys_body) {
  //                     let texto = null;
  //                     if (
  //                       key == 'item' ||
  //                       key == 'unidad' ||
  //                       key == 'metrado'
  //                     ) {
  //                       texto = '';
  //                     } else {
  //                       const arraynoValido = [
  //                         'total1',
  //                         'total2',
  //                         'diametro',
  //                         'pesodiametro',
  //                         'parcial',
  //                         'subtotal',
  //                       ];
  //                       const arraynoValido2 = [
  //                         'total1',
  //                         'total2',
  //                         'diametro',
  //                         'pesodiametro',
  //                         'parcial',
  //                       ];
  //                       // if (row.estitulo || row.tieneSubmetrado) {
  //                       //   if (arraynoValido.includes(key)) {
  //                       //     texto = '';
  //                       //   } else {
  //                       //     texto =
  //                       //       key == 'parcial' || key == 'subtotal'
  //                       //         ? this.formsService.redondeo(
  //                       //             row[key],
  //                       //             this.dec_metrado
  //                       //           )
  //                       //         : row[key] !== undefined
  //                       //         ? row[key]
  //                       //         : '';
  //                       //   }
  //                       // } else {
  //                       //   if (key == 'subtotal' && !row.estitulo && !row.esMetrado) {
  //                       //     texto = ''
  //                       //   } else {
  //                       //     texto = row[key] !== undefined ? row[key] : '';
  //                       //   }

  //                       // }
  //                       if (row.estitulo && arraynoValido.includes(key)) {
  //                         texto = '';
  //                       } else if (
  //                         row.tieneSubmetrado &&
  //                         arraynoValido2.includes(key)
  //                       ) {
  //                         texto = '';
  //                       } else {
  //                         texto =
  //                           key == 'parcial' || key == 'subtotal'
  //                             ? this.formsService.redondeo(
  //                                 row[key],
  //                                 this.dec_metrado
  //                               )
  //                             : row[key] !== undefined
  //                             ? row[key]
  //                             : '';
  //                       }
  //                       obj2[key] =
  //                         texto !== undefined && texto !== null ? texto : '';
  //                     }
  //                   }
  //                   if (row.estitulo == 1) {
  //                     const alineamiento =
  //                       this.stilosTit.alineamiento == 'start'
  //                         ? 'left'
  //                         : this.stilosTit.alineamiento == 'end'
  //                         ? 'right'
  //                         : this.stilosTit.alineamiento;
  //                     obj2['tipoletra'] = this.stilosTit.tipo;
  //                     obj2['color'] = this.stilosTit.color;
  //                     obj2['fondo'] = '';
  //                     obj2['alinea'] = alineamiento;
  //                     obj2['fontSize'] = this.stilosTit.size;
  //                   } else if (row.estitulo == 2) {
  //                     const alineamiento =
  //                       this.stilosTexto.alineamiento == 'start'
  //                         ? 'left'
  //                         : this.stilosTexto.alineamiento == 'end'
  //                         ? 'right'
  //                         : this.stilosTexto.alineamiento;
  //                     obj2['tipoletra'] = this.stilosTexto.tipo;
  //                     obj2['color'] = this.stilosTexto.color;
  //                     obj2['fondo'] = '';
  //                     obj2['alinea'] = alineamiento;
  //                     obj2['fontSize'] = this.stilosTexto.size;
  //                   } else if (!row.estitulo && row.esMetrado) {
  //                     const alineamiento =
  //                       this.stilosMet.alineamiento == 'start'
  //                         ? 'left'
  //                         : this.stilosMet.alineamiento == 'end'
  //                         ? 'right'
  //                         : this.stilosMet.alineamiento;
  //                     obj2['tipoletra'] = this.stilosMet.tipo;
  //                     obj2['color'] = this.stilosMet.color;
  //                     obj2['fondo'] = '';
  //                     obj2['alinea'] = alineamiento;
  //                     obj2['fontSize'] = this.stilosMet.size;
  //                   } else if (!row.estitulo && !row.esMetrado) {
  //                     const alineamiento =
  //                       this.stilosSubM.alineamiento == 'start'
  //                         ? 'left'
  //                         : this.stilosSubM.alineamiento == 'end'
  //                         ? 'right'
  //                         : this.stilosSubM.alineamiento;
  //                     obj2['tipoletra'] = this.stilosSubM.tipo;
  //                     obj2['color'] = this.stilosSubM.color;
  //                     obj2['fondo'] = '';
  //                     obj2['alinea'] = alineamiento;
  //                     obj2['fontSize'] = this.stilosSubM.size;
  //                   }
  //                   tablaCompleta.push(obj2);
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }

  //       let datos = {
  //         datos_proyecto: this.datosproy,
  //         header: arrayHeader,
  //         keys_body: keys_body,
  //         keys_dec: keys_dec,
  //         col_alig: col_alig,
  //         tabla: tablaCompleta,
  //         concat_tabla2: false,
  //         tipo_reporte: tipoRep,
  //         orientacion: orientacion,
  //         moneda: this.moneda, // condicionar
  //         titulo: tituloaux,
  //       };
  //       datos.datos_proyecto.subproyecto = this.dataTitulo?.descripcion
  //       const modalRef = this.modalService.open(ReportesComponent, {
  //         size: 'lg modalgrande',
  //         backdrop: 'static',
  //         windowClass: 'pcoded',
  //         keyboard: false,
  //       });
  //       modalRef.componentInstance.datos = datos;
  //       const result = await modalRef.result;
  //       this.mostrar_carga_todo = false;
  //     }
  //   } catch (e) {
  //     this.mostrar_carga_todo = false;
  //     SwalService.error();
  //     console.log(e);
  //   }
  // }

  // async exportarExcel() {}

  // async estructurarInfoReporte(tipo, informacion, data, header = []) {}

  // async generarReporte() {}
}
