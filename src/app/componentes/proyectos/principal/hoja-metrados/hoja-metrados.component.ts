import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { Metrado, metradoModelo } from './modal-editar-metrado/metrado';
import { Acero, aceroModelo } from './modal-editar-metrado/acero';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import * as math from 'mathjs';
import { ModalPesosComercialesComponent } from './modal-pesos-comerciales/modal-pesos-comerciales.component';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { ReportesComponent } from '../../reportes/reportes.component';
import {
  arraydcols,
  arraygcols,
  arrayicols,
} from './modal-metrado-excel/metrado';
import { Subscription } from 'rxjs';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import {
  hoja,
  ModalMetradoExcelComponent,
} from './modal-metrado-excel/modal-metrado-excel.component';
import * as XLSX from 'xlsx';
import { NgSelectComponent } from '@ng-select/ng-select';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2,
}
export interface tipo {
  id_tipo: number;
  tipo_usuario: string;
}
export interface registro {
  id_tipo: Number;
  tipo_registro: string;
}
@Component({
  selector: 'app-hoja-metrados',
  templateUrl: './hoja-metrados.component.html',
  styleUrls: ['./hoja-metrados.component.scss']
})
export class HojaMetradosComponent implements OnInit, OnDestroy, AfterViewInit {
  vincClasiRel$: Subscription = new Subscription();
  vincPart$: Subscription = new Subscription();
  habilitadoCopiar = false;
  todosCheck = false;
  idProyecto = null;
  moneda = 'S/';
  simbolo = 'S/';
  colores = null;
  decima = null;
  ultStilos: any;
  solover = false;
  aspectos: any;
  tablaPrincipal: any[] = [];
  tablaSistemaProyecto: Metrado[] = [];
  tablaAcerosProyecto: Acero[] = [];
  tablaInformacion = [];
  tablaSistema = [];
  tablaAceros = [];
  tablaExcelAdjunta = [];
  headerExcel = [];
  tiposRegistro: registro[] = [
    { id_tipo: 0, tipo_registro: 'SISTEMA' },
    { id_tipo: 1, tipo_registro: 'HOJA CÀLCULO' },
  ];
  existeTemp = false;
  dec_metrado = 2;
  mask_metrado = '0.2';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  indiceTitulo: any = null;
  cantidadFilasTabla = 25;
  seleccionCelda: any;
  ultiCelda: any;
  formulaCopiada: string = null;
  isPasting: boolean;
  celdaFocus = null;
  scrollbut: boolean = false;
  scrollbut2: boolean = false;
  scrollbut3: boolean = false;
  accionUltSelect: string;
  cantidadMetrados: number = 0;
  vinculadoExcel: boolean;
  noConsistente: boolean;
  noConsistente2: boolean;
  tablaExcelProyecto: any[];
  visible: boolean = false;
  saltardescripcion: boolean;
  @Input() set tabproyecto(value: any) {
    this.idProyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    const datosrec = (aspectosGen.get('datos_recuperado') as UntypedFormGroup)
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    if (this.decima?.toString().includes('|')) {
      let arrdec = this.decima.split('|');
      this.dec_metrado = arrdec[0];
      this.mask_metrado = '0.' + arrdec[0];
      this.dec_precio = arrdec[1];
      this.mask_precio = '0.' + arrdec[1];
      this.dec_parcial = arrdec[2];
      this.mask_parcial = '0.' + arrdec[2];
      // this.dec_cant=arrdec[3];
      // this.mask_cant='0.'+arrdec[3];
    }
    this.solover = value.get('solover').value;
    this.simbolo=datosrec.value.simbolo
  }
  tituloSeleccionado = null;
  partidaSeleccionada = null;
  metradoSeleccionado = null;
  aceroSeleccionado = null;
  titInformSel = null;
  indiceTitSel = null;
  activetab = 1;
  mostrar_carga_todo = false;
  buscando = false;
  buscando2 = false;
  id_usuario = null;
  permisos = [];
  permVinculo = false;
  permisosGenerales = false;
  datosproy = null;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  listaPesos = [];
  tablaTitResumen = [];
  tablaTitulo = [];
  mostrarColrs: boolean = false;
  @ViewChild('p') public popover: NgbPopover;
  @ViewChild('p2') public popover2: NgbPopover;
  @ViewChild('p3') public popover3: NgbPopover;
  @ViewChild('p5') public popover5: NgbPopover;
  @ViewChild('box') box: ElementRef;
  @ViewChild('box2') box2: ElementRef;
  @ViewChild('box3') box3: ElementRef;
  @ViewChild('box4') box4: ElementRef;
  public status: Status = Status.OFF;
  private boxPosition: { left: number; top: number };
  private containerPos: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  public mouse: { x: number; y: number };
  @Input('width') public width: number = 0;
  @Input('height') public height: number = 600;
  @Input('left') public left: number = 0;
  @Input('top') public top: number = 0;
  hBotones: number = 0;
  hBotones2: number = 0;
  tamanioPantalla: number;
  editable = false;
  filaSel = null;
  filaSel2 = null;
  filaSel3 = null;
  bloquearBotones = false;
  habEditColMet = false;
  verTablaSistema = true;
  habEditFormula = false;
  tempFormula: any[] = [];
  cantFil: any = 0;
  habilitadoMultiple = false;
  arrayCopiadosMetrado = [];
  celdasCopiadosMetrado = [];
  arrayCopiadosAceros = [];
  celdasCopiadosAceros = [];
  inicioCeldaCopiado = null;
  finCeldaCopiado = null;
  copiadoCeldas: boolean = false;
  tipoCopiado = 0;
  valorCopiado: string = null;
  mostrar_carga_todo2 = false;
  selectedItem: string | null = null;
  permitirCambio = false;
  stilosTit = { color: '', alineamiento: 'left', tipo: '', size: '10' };
  stilosMet = { color: '', alineamiento: 'left', tipo: '', size: '10' };
  stilosSubM = { color: '', alineamiento: 'left', tipo: '', size: '10' };
  stilosTexto = { color: '', alineamiento: 'left', tipo: '', size: '10' };
  ocultarTieneAceros = false;
  ocultosPesorCom = [];
  modificandofila = false;
  excelMultiple = false;
  filaExcelSel = null;
  indexTablaExcel: any = null;
  verColumnasPresu = false;
  startTimer: any; //temporales
  running = false; //temporales
  tiempo = 0; //temporales
  bloqtemp = false; //temporales
  timer2: any; //temporales
  initim2 = false; //temporales
  worker: Worker; //temporales
  token: any; //temporales
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
  archivoText = null;
  faltantesPresupuesto: any[] = [];
  @ViewChild('modalEstilos') modalEstilos: ModalBasicComponent;
  // @ViewChild('select') ngSelect: NgSelectComponent;
  constructor(
    private encriptadorService: EncriptadorService,
    private principalService: PrincipalService,
    public metradoService: MetradoService,
    public formsService: FormsService,
    private toaster: ToastrService,
    private modalService: NgbModal,
    private presuservice: PresupuestosService,
    private renderer: Renderer2
  ) {
    if (typeof Worker !== 'undefined') {
      //temporales
      this.worker = new Worker(
        new URL('src/app/workers/work1.worker', import.meta.url),
        { type: 'module' }
      );
    }
  }
  ngAfterViewInit(): void {
  }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true;
      await this.permisosUsuario();
      await this.datosProyec();
      this.aspectos = JSON.parse(this.colores);
      await this.pintar();
      this.token = await this.encriptadorService.recuperarlocalstory('token'); //temporales
      await this.listarMetrados();
      await this.listarPesosPorUsuario();
      this.mostrar_carga_todo = false;
    } catch (e) {
      console.log(e);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
    this.mostrarColrs = false
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    clearInterval(this.startTimer);
    if (this.existeTemp && !this.solover && this.editable) {
      // const tabla1 = this.encriptadorService.comprimirJSON(this.tablaPrincipal);
      // const tabla2 = this.encriptadorService.comprimirJSON(
      //   this.tablaSistemaProyecto
      // );
      // const tabla3 = this.encriptadorService.comprimirJSON(
      //   this.tablaAcerosProyecto
      // );
      this.guardarTemporal(
        this.tablaPrincipal,
        this.tablaSistemaProyecto,
        this.tablaAcerosProyecto
      );
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    var resto;
    resto = 130;
    this.tamanioPantalla = document.body.clientWidth - 105;
    this.height = window.innerHeight - resto;
    this.width = document.body.clientWidth / 2.5;
    setTimeout(() => {
      if (this.box2) {
        const wBotones = this.box2.nativeElement.clientWidth;
        if (wBotones < 703) {
          this.scrollbut = true;
        } else {
          this.scrollbut = false;
        }
      }
      if (this.box3) {
        const wBotones = this.box3.nativeElement.clientWidth;
        if (wBotones < 345) {
          this.scrollbut2 = true;
        } else {
          this.scrollbut2 = false;
        }
      }
      if (this.box4) {
        const wBotones = this.box4.nativeElement.clientWidth;
        if (wBotones < 703) {
          this.scrollbut3 = true;
        } else {
          this.scrollbut3 = false;
        }
      }
    }, 50);
    return;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse = { x: event.clientX, y: event.clientY };
    if (this.status === Status.RESIZE) {
      this.resize();
    }
    this.loadBox();
    this.loadContainer();
  }

  leftDivBut() {
    var face1 = document.getElementById('divbut');
    face1.scrollLeft += 15;
  }

  leftDivBut2() {
    var face1 = document.getElementById('divbut2');
    face1.scrollLeft += 15;
  }

  leftDivBut3() {
    var face1 = document.getElementById('divbut3');
    face1.scrollLeft += 15;
  }

  rigthDivBut() {
    var face1 = document.getElementById('divbut');
    face1.scrollLeft -= 15;
  }

  rigthDivBut2() {
    var face1 = document.getElementById('divbut2');
    face1.scrollLeft -= 15;
  }

  rigthDivBut3() {
    var face1 = document.getElementById('divbut3');
    face1.scrollLeft -= 15;
  }

  setStatus(event: MouseEvent, status: number) {
    if (status === 1) {
      event.stopPropagation();
    }
    this.status = status;
  }

  private resize() {
    if (this.resizeCondMeet()) {
      this.width = Number(this.mouse.x > this.boxPosition.left)
        ? this.mouse.x - this.boxPosition.left
        : 0;
      setTimeout(() => {
        if (this.box2) {
          const wBotones = this.box2.nativeElement.clientWidth;
          if (wBotones < 703) {
            this.scrollbut = true;
          } else {
            this.scrollbut = false;
          }
        }
        if (this.box3) {
          const wBotones = this.box3.nativeElement.clientWidth;
          if (wBotones < 345) {
            this.scrollbut2 = true;
          } else {
            this.scrollbut2 = false;
          }
        }
        if (this.box4) {
          const wBotones = this.box4.nativeElement.clientWidth;
          if (wBotones < 703) {
            this.scrollbut3 = true;
          } else {
            this.scrollbut3 = false;
          }
        }
      }, 50);
    }
  }

  private resizeCondMeet() {
    const right = this.containerPos?.left + 70;
    return (
      this.mouse.x > right &&
      this.mouse.x < this.tamanioPantalla &&
      this.mouse.y < this.containerPos.bottom
    );
  }

  private loadBox() {
    if (!this.box) {
      return;
    }
    const { left, top } = this.box.nativeElement.getBoundingClientRect();
    this.boxPosition = { left, top };
  }

  private loadContainer() {
    if (!this.boxPosition) {
      return;
    }
    const left = this.boxPosition.left - this.left;
    const top = this.boxPosition.top - this.top;
    const right = left + 800;
    const bottom = top + 800;
    this.containerPos = { left, top, right, bottom };
  }

  async verificarCambiosPresupuesto() {
    let presutemp = await this.presuservice.ExistePresuTemp({
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
    });
    return presutemp;
  }

  async permisosUsuario() {
    this.id_usuario = this.encriptadorService.recuperarlocalstory('idusuario');
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
    });
    if (datoaccs.length) {
      const titmetra = datoaccs[0].titmetra
        ? JSON.parse(datoaccs[0].titmetra)
        : [];
      if (titmetra.length) {
        this.permisos = titmetra;
      }
      if (datoaccs[0].presu) {
        this.permVinculo = true;
      }
    } else {
      this.permisosGenerales = true;
      this.permVinculo = true;
    }
  }

  async datosProyec() {
    const detalleProyecto = await this.principalService.recuperarDatosProyecto({
      id_proyecto: this.idProyecto,
    });
    this.datosproy = detalleProyecto;
    this.moneda = this.simbolo?this.simbolo:'S/'
  }

  Expandetodo() {
    if (this.filaSel !== null) {
      let row = this.tablaTitulo[this.filaSel];
      if (!row.unidad) {
        let itemsel = row.item;
        row.icomost = 1;
        let nuevogru = false;
        for (let i = this.filaSel + 1; i < this.tablaTitulo.length; i++) {
          if (this.tablaTitulo[i].item != itemsel && !nuevogru) {
            var palabra = this.tablaTitulo[i].item
              .toString()
              .substring(0, itemsel.toString().length + 1);
            if (palabra == itemsel + '.') {
              this.tablaTitulo[i].mostrar = 1;
              this.tablaTitulo[i].icomost = 1;
              this.tablaTitulo[i].estmost = 1;
            } else {
              nuevogru = true;
            }
          } else {
            break;
          }
        }
      }
    }
  }

  ContraeTodo() {
    if (this.filaSel !== null) {
      let row = this.tablaTitulo[this.filaSel];
      if (!row.unidad) {
        let inpri = this.filaSel;
        let itemsel = row.item;
        row.icomost = 1;
        let nuevogru = false;
        for (let i = inpri + 1; i < this.tablaTitulo.length; i++) {
          if (this.tablaTitulo[i].item != itemsel && !nuevogru) {
            var palabra = this.tablaTitulo[i].item
              .toString()
              .substring(0, itemsel.toString().length + 1);
            if (palabra == itemsel + '.') {
              if (
                this.tablaTitulo[i].item.split('.').length ==
                itemsel.split('.').length + 1
              ) {
                this.tablaTitulo[i].mostrar = 1;
                this.tablaTitulo[i].icomost = 0;
                this.tablaTitulo[i].estmost = 1;
              } else {
                this.tablaTitulo[i].mostrar = 0;
                this.tablaTitulo[i].icomost = 0;
                this.tablaTitulo[i].estmost = 0;
              }
            } else {
              nuevogru = true;
            }
          } else {
            break;
          }
        }
      }
    }
  }

  maxtodo() {
    for (let row of this.tablaTitulo) {
      if (row.item.split('.').length > 1) {
        row.mostrar = 1;
      }
      row.icomost = 1;
    }
  }

  mintodo() {
    for (let row of this.tablaTitulo) {
      if (row.item.split('.').length > 1) {
        row.estmost = row.mostrar;
        row.mostrar = 0;
      } else {
        row.icomost = 0;
        row.mostrar = 1;
      }
    }
  }

  pintar() {
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }

  tooltipTipo(partida) {
    let string = '';
    if (partida.vinculo) {
      string = 'Metrado vinculado en presupuesto';
    } else {
      if (partida.ed_pre) {
        string = 'Metrado  desde presupuesto';
      } else {
        if (partida.metrado == 0 && partida.cant_metrado == 0) {
          string = 'Metrado no registrado';
        } else if (
          partida.cant_metrado > 0 &&
          partida.cant_metrado !== partida.metrado
        ) {
          string = 'Metrado editado manualmente';
        } else if (
          partida.cant_metrado &&
          partida.metrado == partida.cant_metrado
        ) {
          string = 'Metrado de tabla hoja metrado';
        }
      }
    }
    return string;
  }

  tipoClass(partida) {
    let string = '';
    if (partida.vinculo) {
      string = 'fa fa-code-fork fa-rotate-270 text-success';
    } else {
      if (partida.ed_pre) {
        string = 'fa-exclamation-triangle text-warning2';
      } else {
        if (partida.metrado == 0 && partida.cant_metrado == 0) {
          string = 'fa-exclamation-triangle text-danger';
        } else if (
          partida.cant_metrado > 0 &&
          partida.cant_metrado !== partida.metrado
        ) {
          string = 'fa-pencil-square-o text-custom';
        } else if (partida.metrado && partida.metrado == partida.cant_metrado) {
          string = 'fa-th-list text-primary';
        }
      }
    }
    return string;
  }

  alineamientoTexto(row) {
    let alineamiento = '';
    if (row.id_metrado !== null) {
      if (row.estitulo == 1) {
        alineamiento = this.stilosTit.alineamiento
          ? this.stilosTit.alineamiento + '!important'
          : 'left';
      } else if (!row.estitulo && row.esMetrado) {
        alineamiento = this.stilosMet.alineamiento
          ? this.stilosMet.alineamiento + '!important'
          : 'left';
      } else if (!row.estitulo && !row.esMetrado) {
        alineamiento = this.stilosSubM.alineamiento
          ? this.stilosSubM.alineamiento + '!important'
          : 'left';
      } else if (row.estitulo == 2) {
        alineamiento = this.stilosTexto.alineamiento
          ? this.stilosTexto.alineamiento + '!important'
          : 'left';
      }
    }
    return alineamiento;
  }

  alineamientoTexto2(row) {
    let alineamiento = '';
    if (row.id_metrado !== null) {
      if (row.nivel == 1) {
        alineamiento = this.stilosTit.alineamiento
          ? this.stilosTit.alineamiento + '!important'
          : 'left';
      } else if (row.nivel == 2) {
        alineamiento = this.stilosMet.alineamiento
          ? this.stilosMet.alineamiento + '!important'
          : 'left';
      } else if (row.nivel == 3 || !row.nivel) {
        alineamiento = this.stilosSubM.alineamiento
          ? this.stilosSubM.alineamiento + '!important'
          : 'left';
      } else if (row.nivel == 4) {
        alineamiento = this.stilosTexto.alineamiento
          ? this.stilosTexto.alineamiento + '!important'
          : 'left';
      }
    }
    return alineamiento;
  }

  colorTexto2(row) {
    let color = '';
    if (!row.item) {
      if (row.nivel == 1) {
        color = this.stilosTit.color
          ? this.stilosTit.color + '!important'
          : 'left';
      } else if (row.nivel == 2) {
        color = this.stilosMet.color
          ? this.stilosMet.color + '!important'
          : 'left';
      } else if (row.nivel == 3 || !row.nivel) {
        color = this.stilosSubM.color
          ? this.stilosSubM.color + '!important'
          : 'left';
      } else if (row.nivel == 4) {
        color = this.stilosTexto.color
          ? this.stilosTexto.color + '!important'
          : 'left';
      }
    }
    return color;
  }

  textoSize(row) {
    let size = '';
    if (!row.item) {
      if (row.nivel == 1) {
        size = this.stilosTit.size ? this.stilosTit.size + '!important' : '10';
      } else if (row.nivel == 2) {
        size = this.stilosMet.size ? this.stilosMet.size + '!important' : '10';
      } else if (row.nivel == 3 || row.nivel == null) {
        size = this.stilosSubM.size
          ? this.stilosSubM.size + '!important'
          : '10';
      } else if (row.nivel == 4) {
        size = this.stilosTexto.size
          ? this.stilosTexto.size + '!important'
          : '10';
      }
    }
    return size;
  }

  async listarPesosPorUsuario() {
    const obj = {
      id_usuario: this.id_usuario,
      estado: 1,
    };
    const response = await this.metradoService.listarPesosComerciales(obj);
    let tablaPesos = [];
    if (response.length) {
      let k = 0;
      for (let ele of response) {
        // const medida = JSON.parse(JSON.stringify(ele.medida));
        ele.medida =
          ele.medida +
          (ele.tipoacero
            ? ele.tipoacero == 'CORRUGADO'
              ? '(C)'
              : '(L)'
            : '(C)');
        // const valor = medida + '|' + ele.peso + '|' + ele.tipoacero;

        // if (this.ocultosPesorCom.includes(valor)) {
        //   ele.estado = 0;
        // } else {
        //   ele.estado = ele.estado !== undefined ? ele.estado : 1;
        // }
        if (ele.fuente == 0) {
          if (this.ocultosPesorCom[k]?.includes(Number(this.id_usuario))) {
            ele.estado = 0;
          } else {
            ele.estado = 1;
          }
        }
        if (ele.estado) {
          tablaPesos.push(ele);
        }
        k++;
      }
      this.listaPesos = tablaPesos;
    } else {
      this.listaPesos = [];
    }
  }

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
  //       this.existeTemp = true;
  //       respuesta = JSON.parse(response[0].datatitulos);
  //     }
  //     return respuesta;
  //   } catch (e) {
  //     console.log(e);
  //     SwalService.error(e);
  //   }
  // }

  async listarTitulos() {
    this.visible = false;
    const obj = {
      id_proyecto: this.idProyecto,
    };
    const response = await this.metradoService.listarTitulosDeMetrados(obj);
    // let res= await this.presuservice.listarTopPresupuesto({id_proyecto:this.idProyecto});
    // const response = res[0].filter(ite => ite.item.split('.').length < 2);
    if (response.length) {
      let i = 0;
      for (const element of response) {
        const tabla = await this.filtrarTitulo(element);
        const vinculado = await this.verificarVinculo(tabla, element);
        const existePermiso = this.permisos.find(
          (ele) => ele.ind == element.indice
        );
        element.vinculado = vinculado;
        element.tipo_registro = !element.tipo_registro ? 1 : 0;
        element.editable =
          existePermiso?.edit == 1 || this.permisosGenerales ? true : false;
        element.permVinculo = this.permVinculo;
        i++;
        if (element.editable && !element.tipo_registro) {
          this.visible = true;
        }
      }
      this.tablaTitResumen = response;
    } else {
      this.tablaTitResumen = [];
    }
  }

  async calcularPorcentajeRegistro(tabla, tipo_registro, tablaExcel = []) {
    let vinculado = true;
    let porcentaje = null;
    let cantidadPartidas = 0;
    let metradosValidos = 0;
    if (!tipo_registro) {
      for (const row of tabla) {
        if (row.unidad) {
          cantidadPartidas++;
          if (
            row.ed_pre == 0 &&
            Number(row.cant_metrado) !== Number(row.cantidad)
          ) {
            vinculado = false;
          }
          if (
            row.cant_metrado !== null &&
            Number(row.cant_metrado) !== 0 &&
            !row.ed_pre
          ) {
            metradosValidos++;
          }
        }
      }
      if (!tabla.length) {
        vinculado = true;
      }
    } else {
      if (tabla.length) {
        for (const iterator of tablaExcel) {
          if (iterator.unidad && iterator.item) {
            cantidadPartidas++;
            const encontrado = await tabla.find(
              (ele) =>
                ele.indice == iterator.indice &&
                Number(ele.cantidad) === Number(iterator.mtotal)
            );

            if (!encontrado) {
              vinculado = false;
            }
            if (Number(iterator.mtotal) !== 0) {
              metradosValidos++;
            }
          }
        }
      } else {
        vinculado = true;
      }
    }
    if (cantidadPartidas > 0) {
      porcentaje = (metradosValidos * 100) / cantidadPartidas;
    } else {
      porcentaje = 0;
    }
    if (porcentaje == 0) {
      vinculado = false;
    }
    const rendiValido = Math.floor(porcentaje);
    const index = await this.tablaTitResumen.findIndex(
      (ele) => this.indiceTitulo == ele.indice
    );
    this.tablaTitResumen[index].estado_metrado = rendiValido;
    this.tablaTitResumen[index].vinculado = !this.existeTemp
      ? vinculado
      : false;
  }

  async listarInformacionTitulo(titulo) {
    try {
      if (this.titInformSel !== titulo) {
        this.titInformSel = titulo;
        this.tablaInformacion = [];
        this.buscando2 = true;
        const obj = {
          id_proyecto: this.idProyecto,
          indice: titulo.indice,
        };
        const response = await this.metradoService.listarInformacionMetrado(
          obj
        );
        this.tablaInformacion = response ? response : [];
        this.buscando2 = false;
      }
    } catch (e) {
      this.buscando2 = false;
      SwalService.error();
      console.log(e);
    }
  }

  async listarMetrados() {
    this.tablaPrincipal = [];
    this.tablaSistemaProyecto = [];
    this.tablaAcerosProyecto = [];
    this.tablaExcelProyecto = [];
    const datosTemporal = await this.listarTemporal();
    this.visible = false;
    if (datosTemporal) {
      this.existeTemp = true;
      this.tablaPrincipal = datosTemporal.tablaPrincipal;
      this.tablaSistemaProyecto = datosTemporal.tablaSistemaProyecto;
      this.tablaAcerosProyecto = datosTemporal.tablaAcerosProyecto;
      this.tablaTitResumen = datosTemporal.tablaTitResumen;
      this.ocultosPesorCom = datosTemporal.ocultarpesos;
      this.stilosTit = datosTemporal.estilos.stilosTit;
      this.stilosMet = datosTemporal.estilos.stilosMet;
      this.stilosSubM = datosTemporal.estilos.stilosSubM;
      this.stilosTexto = datosTemporal.estilos.stilosTexto;
    
      for (const element of this.tablaTitResumen) {
      
        const existePermiso = this.permisos.find(
          (ele) => ele.ind == element.indice
        );
       
        element.editable =
          existePermiso?.edit == 1 || this.permisosGenerales ? true : false;
        if (!element.tipo_registro) {
          const tabla = await this.filtrarTitulo(element);
          const vinculado = await this.verificarVinculo(tabla, element);
          element.vinculado = vinculado;
        }
        if (element.editable && !element.tipo_registro) {
          this.visible = true;
        }
      }
    } else {
      const obj2 = {
        id_proyecto: this.idProyecto,
        titulo: '',
      };
      const response2 = await this.metradoService.tablasMetradoTit(obj2);
      let cont = 0;
      for (const ele of response2[0]) {
        ele.ind = cont;
        if (ele.metrado == null) {
          ele.metrado = this.formsService.redondeo(0, this.dec_metrado);
        }
        ele.metrado = this.formsService.redondeo(
          Number(ele.metrado),
          this.dec_metrado
        );
        if (ele.cantidad == null) {
          ele.cantidad = this.formsService.redondeo(0, this.dec_metrado);
        }

        if (ele.ed_pre == 1) {
          ele.cant_metrado = this.formsService.redondeo(
            ele.cantidad,
            this.dec_metrado
          );
        } else {
          if (ele.cant_metrado == null) {
            ele.cant_metrado = this.formsService.redondeo(
              JSON.parse(JSON.stringify(ele.cantidad)),
              this.dec_metrado
            );
          }
        }
        ele.cant_metrado = this.formsService.redondeo(
          Number(ele.cant_metrado),
          this.dec_metrado
        );
        if (ele.plantilla == null) {
          ele.plantilla = 0;
        }
        if (ele.metrado_valido == null) {
          ele.metrado_valido = 0;
        }
        ele.permitirCambio = 1;
        ele.editarMetrado = 0;
        ele.editadoMetrado = 0;
        ele.totalAceros = this.formsService.redondeo(0, this.dec_metrado);
        if (!ele.unidad) {
        } else {
          ele.parcial = ele.precio * Number(ele.cant_metrado);
        }
        ele.mostrar = true;
        ele.icomost = !ele.unidad ? '1' : '0';
        cont++;
      }
      this.tablaPrincipal = response2[0];
      
      let tablaSistemaProyecto = [];
      let ind = 0;
      for (const ele of response2[1]) {
        const obj = new metradoModelo(
          ele.descripcion,
          ele.esMetrado,
          ele.item,
          ele.id_metrado,
          ele.indice,
          ele.id_proyecto,
          null,
          ele.tieneSubmetrado,
          ele.tieneAceros,
          ele.estitulo,
          ele.estilo,
          ele.cantidad,
          ele.n_veces,
          ele.largo,
          ele.ancho,
          ele.altura,
          this.formsService.redondeo(ele.subtotal, this.dec_metrado),
          this.formsService.redondeo(ele.parcial, this.dec_metrado),
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          false,
          0,
          ele.archivo,
          ele.icomost,
          ele.mostrar,
          ele.id_padre,
          ele.estmost,
          ind
        );
        tablaSistemaProyecto.push(obj);
        ind++;
      }
      this.tablaSistemaProyecto = tablaSistemaProyecto;
      let tablaAcerosProyecto = [];
      let j = 0;
      for (const fila of response2[2]) {
        const acero = new aceroModelo(
          fila.descripcion,
          fila.esMetrado,
          fila.item,
          fila.id_metrado,
          fila.indice,
          fila.id_proyecto,
          fila.cantidad,
          fila.diametro,
          fila.elementos,
          fila.total1,
          fila.longitud,
          fila.total2,
          fila.pesodiametro,
          this.formsService.redondeo(fila.parcial, this.dec_metrado),
          this.formsService.redondeo(fila.subtotal, this.dec_metrado),
          fila.id_padre,
          fila.tieneSubmetrado,
          fila.estitulo,
          0,
          false,
          false,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          fila.archivo,
          fila.estilo,
          0,
          1,
          0,
          j
        );
        tablaAcerosProyecto.push(acero);
        j++;
      }
      this.tablaAcerosProyecto = tablaAcerosProyecto;
      await this.listarTitulos();
      const existeEstilos = await this.tablaPrincipal.find((ele) => ele.estilo);
      if (!existeEstilos) {
        this.stilosTit = {
          color: '',
          alineamiento: 'left',
          tipo: '',
          size: '10',
        };
        this.stilosMet = {
          color: '',
          alineamiento: 'left',
          tipo: '',
          size: '10',
        };
        this.stilosSubM = {
          color: '',
          alineamiento: 'left',
          tipo: '',
          size: '10',
        };
        this.stilosTexto = {
          color: '',
          alineamiento: 'left',
          tipo: '',
          size: '10',
        };
        this.ocultosPesorCom = [];
      } else {
        const stiloArr = existeEstilos.estilo?.split('@');
        let array = [];
        if (stiloArr.length > 2) {
          array = stiloArr;
          this.ocultosPesorCom = [];
        } else if (stiloArr.length == 1) {
          array = stiloArr[0] ? JSON.parse(stiloArr[0]) : [];
        } else if (stiloArr.length == 2) {
          array = stiloArr[0] ? JSON.parse(stiloArr[0]) : [];
          this.ocultosPesorCom = JSON.parse(stiloArr[1]);
        }

        this.stilosTit = array[0]
          ? array[0]
          : { color: '', alineamiento: 'left', tipo: '', size: '10' };
        this.stilosMet = array[1]
          ? array[1]
          : { color: '', alineamiento: 'left', tipo: '', size: '10' };
        this.stilosSubM = array[2]
          ? array[2]
          : { color: '', alineamiento: 'left', tipo: '', size: '10' };
        this.stilosTexto = array[3]
          ? array[3]
          : { color: '', alineamiento: 'left', tipo: '', size: '10' };
        this.ocultosPesorCom = [];
      }
    }
    this.noConsistente = false;
    this.noConsistente2 = false;
    this.faltantesPresupuesto = [];
    this.vinculadoExcel = true;
  }

  async filtrarTitulo(titulo) {
    const filtrados = this.tablaPrincipal.filter((ele) => {
      const splitItem = ele.item.split('.');
      if (Number(splitItem[0]) == Number(titulo.item)) {
        return ele;
      }
    });
    filtrados.map((ele, index) => (ele.ind2 = index));
    return filtrados;
  }

  async verificarVinculo(tabla, titulo) {
    let vinculado = true;
    if (!titulo.tipo_registro) {
      for (const element of tabla) {
        if (element.unidad) {
          if (
            element.ed_pre == 0 &&
            Number(element.cant_metrado) !== Number(element.cantidad)
          ) {
            vinculado = false;
            break;
          }
        }
      }
      if (!tabla.length) {
        vinculado = true;
      }
    } else {
      const response = await this.listarTablaExcel(titulo.indice,titulo.item);
      const response2 = await this.tablaTipoExcel(response, tabla);
      if (!response2?.vinculado || !response2?.body.length) {
        vinculado = false;
      }
    }
    return vinculado;
  }

  async verHojaMetrado(titulo) {
    this.activetab = 2;
    if (this.indiceTitulo == titulo?.indice) {
      return;
    }
    this.mostrar_carga_todo = true;
    setTimeout(async () => {
      this.tablaTitulo = [];
      this.habEditColMet = false;
      this.tablaSistema = [];
      this.tablaAceros = [];
      this.headerExcel = null;
      this.indexTablaExcel = null;
      this.tablaExcelAdjunta = [];
      this.metradoSeleccionado = null;
      this.partidaSeleccionada = null;
      this.aceroSeleccionado = null;
      this.filaSel = null;
      this.filaSel2 = null;
      this.filaSel3 = null;
      this.verTablaSistema = null;
      this.bloquearBotones = false;
      this.habilitadoCopiar = false;
      this.todosCheck = false;
      this.cantidadMetrados = null;
      this.ultStilos = null;
      this.ultiCelda = null;
      this.verColumnasPresu = false;
      this.pintar();
      this.noConsistente = false;
      this.noConsistente2 = false;
       this.faltantesPresupuesto = [];
      this.vinculadoExcel = true;
      if (!titulo) {
        titulo = await this.tablaTitResumen.find(
          (ele) => ele.indice == this.indiceTitulo
        );
        this.titInformSel = titulo;
      } else {
        this.titInformSel = titulo;
      }

      if (this.indiceTitulo !== titulo.indice) {
        this.indiceTitulo = titulo.indice;
        let tabla = await this.filtrarTitulo(titulo);
        this.tablaTitulo = tabla;
      }

      this.editable = titulo.editable;
      await this.onResize();
      if (!this.hBotones2 && this.tablaPrincipal.length) {
        this.hBotones2 = 45;
      }
      if (this.titInformSel.tipo_registro) {
        const response = await this.listarTablaExcel(titulo.indice,titulo.item)
        const response2 = await this.tablaTipoExcel(response, this.tablaTitulo);
        this.tablaExcelAdjunta = response2.body;
        this.headerExcel = response2.header;
      }
      this.mostrar_carga_todo = false;
    }, 5);
  }

  async tablaTipoExcel(response, tablaPresu) {
    let header = null;
    let body = [];
    let vinculado = true;
    if (response) {
      if (response[1]) {
        header = await this.estructurarHeader(response[1][0]);
      }
      if (response[0]) {
        for (const element of tablaPresu) {
          const encontrado = await response[0].find(ele => ele.item == element.item && ele.descripcion == element.descripcion)
          
          if (!encontrado) {
            vinculado = false
            this.noConsistente2 = true
            this.faltantesPresupuesto.push(element.item + '-' + element.descripcion);
          }
        }
        console.log(tablaPresu)
        console.log(response[0])
        for (let iterator of response[0]) {
          iterator.seleccionado = false;
          iterator.filaModificada = iterator.filaModificada ? true : false;
          if (iterator.tipo == 0) {
            iterator.nivel =
              iterator.nivel == null ? 3 : Number(iterator.nivel);
          }

          iterator.icomost = 1;
          iterator.mostrar = 1;
          let encontrado = await tablaPresu.find(
            (ele) => ele.indice == iterator.indice
          );
          console.log(encontrado)
          iterator.descripcion2 = null;
          iterator.item2 = null;
          iterator.metrado2 = null;
          if (!encontrado) {
            // encontrado.vinculado = 0; ///ERRor
            iterator.pintar = 1;
            this.noConsistente2 = true;
            vinculado = false;
          } else {
            iterator.descripcion2 = encontrado.descripcion;
            iterator.item2 = encontrado.item;
            iterator.metrado2 = encontrado.cant_metrado;
            if (iterator.item) {
              if (iterator.unidad) {
                if (Number(encontrado.cantidad) !== Number(iterator.mtotal)) {
                  iterator.pintar = 2;
                  encontrado.vinculado = 0;
                  this.vinculadoExcel = false;
                  if (Number(iterator.mtotal) > 0) {
                    vinculado = false;
                  } 

                } else {
                  iterator.pintar = null;
                  encontrado.vinculado = 1;
                }
              }

              if (
                iterator.item !== encontrado.item ||
                iterator.descripcion !== encontrado.descripcion
              ) {
                // console.log('iterator', iterator)
                //   console.log('encontrado.item',iterator.item ,encontrado.item , '||',
                //     iterator.descripcion , encontrado.descripcion)
                this.noConsistente = true;
                vinculado = false;
                iterator.pintar = 1;
                encontrado.vinculado = 0;
              }
            } else {
            }
          }
        }
        body = response[0];
      }
    }
    console.log(body)
    console.log(vinculado)
    return { header: header, body: body, vinculado: vinculado };
  }

  toggleOnpresu(itemsel, indice) {
    this.tablaTitulo[indice].icomost = 1;
    let nuevogru = false;
    for (let i = indice + 1; i < this.tablaTitulo.length; i++) {
      if (this.tablaTitulo[i].item != itemsel && !nuevogru) {
        var palabra = this.tablaTitulo[i].item
          .toString()
          .substring(0, itemsel.toString().length + 1);
        if (palabra == itemsel + '.') {
          if (
            itemsel.split('.').length + 1 ==
            this.tablaTitulo[i].item.toString().split('.').length
          ) {
            this.tablaTitulo[i].mostrar = 1;
          } else {
            this.tablaTitulo[i].mostrar = this.tablaTitulo[i].estmost;
          }
        } else {
          nuevogru = true;
        }
      } else {
        break;
      }
    }
  }

  toggleOffpresu(itemsel, indice) {
    this.tablaTitulo[indice].icomost = 0;
    let ind2 = indice + 1;
    let nuevogru = false;
    for (let i = ind2; i < this.tablaTitulo.length; i++) {
      if (this.tablaTitulo[i].item != itemsel && !nuevogru) {
        var palabra = this.tablaTitulo[i].item
          .toString()
          .substring(0, itemsel.toString().length + 1);
        if (palabra == itemsel + '.') {
          this.tablaTitulo[i].estmost = this.tablaTitulo[i].mostrar;
          this.tablaTitulo[i].mostrar = 0;
        } else {
          nuevogru = true;
        }
      } else {
        break;
      }
    }
  }

  fueradeTabla() {
    // this.metradoSeleccionado = null;
    // this.valorCopiado = null;
    // this.aceroSeleccionado = null;
    // this.filaSel2 = -1;
    // this.filaSel3 = -1;
    // this.mostrarColrs = false;
    // this.tempFormula = [];
    // }
  }

  async seleccionRowTablaTit(row, i) {
    if (this.filaSel == i) {
      return;
    }
    if (this.modificandofila) {
      this.toaster.error('Terminando calculos de la anterior fila', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
    this.CancelarCopiarFraccionTabla();
    this.filaSel2 = null;
    this.filaSel3 = null;
    this.tablaSistema = [];
    this.tablaAceros = [];
    this.buscando2 = true;
    this.todosCheck = false;
    this.permitirCambio = false;
    this.mostrarColrs = false
    this.habilitadoCopiar = false;
    const filtradoSistema = await this.tablaSistemaProyecto.filter(
      (ele) => ele.indice == row.indice
    );
    const filtradoAceros = await this.tablaAcerosProyecto.filter(
      (ele) => ele.indice == row.indice
    );
    if (!filtradoAceros.length) {
      this.tablaTitulo[i].permitirCambio = 1;
      // this.tablaPrincipal[this.tablaTitulo[i].ind].permitirCambio = 1;
      this.verTablaSistema = true;
    } else {
      this.tablaTitulo[i].permitirCambio = 0;
      // this.tablaPrincipal[this.tablaTitulo[i].ind].permitirCambio = 0;
      this.verTablaSistema = false;
    }
    let tablaSistema = [];
    let tablaAceros = [];
    let existeLigado = false;
    this.cantidadMetrados = 0;
    filtradoSistema.map((ele) => {
      if (ele.tieneAceros) {
        existeLigado = true;
      }
      if (!ele.estitulo && ele.esMetrado) {
        this.cantidadMetrados++;
      }
      ele.editarCopiar = false;
      ele.editarEliminar = false;
      ele.editaraltura = 0;
      ele.editarancho = 0;
      ele.editarcantidad = 0;
      ele.editardescripcion = 0;
      ele.editarlargo = 0;
      ele.editarn_veces = 0;
    });

    if ((filtradoSistema.length < 2 && !existeLigado) || existeLigado) {
      this.permitirCambio = true;
    }

    filtradoSistema.sort((a, b) => a.id_metrado - b.id_metrado);
    tablaSistema = filtradoSistema;
    if (tablaSistema.length < this.cantidadFilasTabla) {
      const faltantes = this.cantidadFilasTabla - filtradoSistema.length;
      for (let i = 0; i < faltantes; i++) {
        const metrado = new metradoModelo(
          '',
          1,
          '',
          null,
          row?.indice,
          this.idProyecto
        );
        tablaSistema.push(metrado);
      }
    }
    this.tablaSistema = tablaSistema;
    this.bloquearBotones = existeLigado ? true : false;
    filtradoAceros.sort((a, b) => a.id_metrado - b.id_metrado);
    let totalAceros = 0;
    filtradoAceros.map((ele) => {
      if (ele.id_metrado !== null && ele.esMetrado && !ele.estitulo) {
        totalAceros = totalAceros + Number(ele.subtotal);
      }
      ele.editarCopiar = false;
      ele.editarEliminar = false;
      ele.editararchivo = 0;
      ele.editarcantidad = 0;
      ele.editardescripcion = 0;
      ele.editardiametro = 0;
      ele.editarelementos = 0;
      ele.editarlongitud = 0;
      ele.editarpesodiametro = 0;
    });
    tablaAceros = JSON.parse(JSON.stringify(filtradoAceros));
    if (tablaAceros.length < this.cantidadFilasTabla) {
      const faltantes = this.cantidadFilasTabla - tablaAceros.length;
      for (let i = 0; i < faltantes; i++) {
        const row = new aceroModelo(
          null,
          1,
          null,
          null,
          this.partidaSeleccionada?.indice,
          this.idProyecto
        );
        tablaAceros.push(row);
      }
    }
    this.tablaAceros = tablaAceros;

    if (filtradoAceros.length) {
      this.tablaTitulo[i].totalAceros = this.formsService.redondeo(
        totalAceros,
        this.dec_metrado
      );

      // this.tablaTitulo[i].metrado =
      //   this.tablaTitulo[i].totalAceros;

      // if (row.ed_pre == 0) {
      //   this.tablaTitulo[this.filaSel].cant_metrado =
      //     this.tablaTitulo[this.filaSel].metrado;
      // }
    }

    this.partidaSeleccionada = row;
    this.filaSel = i;
    if (this.partidaSeleccionada?.unidad) {
      setTimeout(() => {
        if (this.box2) {
          const wBotones = this.box2.nativeElement.clientWidth;
          if (wBotones < 703) {
            this.scrollbut = true;
          } else {
            this.scrollbut = false;
          }
        }
        if (this.box3) {
          const wBotones = this.box3.nativeElement.clientWidth;
          if (wBotones < 345) {
            this.scrollbut2 = true;
          } else {
            this.scrollbut2 = false;
          }
        }
        if (this.box4) {
          const wBotones = this.box4.nativeElement.clientWidth;
          if (wBotones < 703) {
            this.scrollbut3 = true;
          } else {
            this.scrollbut3 = false;
          }
        }
      }, 50);
    }
    // this.archivoText = this.verTablaSistema ? row.archivo: row.estilo
    this.buscando2 = false;
  }

  async edicionCeldaMetrado(partida, i) {
    if (this.solover || !this.editable || !this.habEditColMet) {
      return;
    }
    partida.unidad
      ? (this.tablaTitulo[i].editarMetrado = 1)
      : (this.tablaTitulo[i].editarMetrado = 0);
  }

  async evaluarTextoMetrado(valor3, i) {
    if (valor3 == '' || valor3 == undefined || valor3 == null) {
      return;
    }
    this.filaSel2 = null;
    this.filaSel3 = null;
    this.tablaTitulo[i].editarMetrado = 0;
    const valor = valor3.split(',').join('');
    const parteEntera = Math.floor(valor).toString();
    if (parteEntera.length > 8) {
      this.toaster.warning(
        'El metrado sobrepasa el limite de caracteres permitido, disminuya los montos ingresados',
        'Advertencia',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
     return
    }
    
    if (
      valor !== this.tablaTitulo[i].cant_metrado &&
      (valor !== null || !isNaN(valor))
    ) {
      this.tablaTitulo[i].cant_metrado = this.formsService.redondeo(
        valor,
        this.dec_metrado
      );
      this.actualizarTitulosSuperiores(i);
      this.tablaTitulo[i].editadoMetrado = 1;
      this.tablaTitulo[i].ed_pre = 0;
      this.tablaTitulo[i].vinculado = 0;
      this.tablaPrincipal[this.tablaTitulo[i].ind] = this.tablaTitulo[i];
      // await this.calcularMontosRowPrincipal();
      // await this.actualizarDataPrincipal();
      // this.stiloFormula();
      // this.guardarTablaTemporal(1);
      this.actualizarTemp();
    } else {
    }
  }

  async moverAbajoPrincipal(event, i) {
    if (i < this.tablaTitulo.length - 1) {
      event.target.blur();
      let sgteValido = null;
      let index = i + 1;
      while (!sgteValido) {
        if (this.tablaTitulo[index].unidad) {
          sgteValido = true;
        } else {
          if (index < this.tablaTitulo.length) {
            index++;
          } else {
            index = i;
            break;
          }
        }
      }
      if (index == null) {
        return;
      }
      this.tablaTitulo[index].editarMetrado = 1;
      this.filaSel = index;
    } else {
      return;
    }
  }

  async moverArribaPrincipal(event, i) {
    if (i > 1) {
      let sgteValido = null;
      let index = i - 1;
      while (!sgteValido || index == 0) {
        if (this.tablaTitulo[index].unidad) {
          sgteValido = true;
        } else {
          if (index > 0) {
            index--;
          } else {
            break;
          }
        }
      }
      if (index == 0 || !sgteValido) {
        index = i;
      }
      if (index !== i) {
        event.target.blur();
      } else {
        event.target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        event.target.focus();
      }
      this.tablaTitulo[index].editarMetrado = 1;
      this.filaSel = index;
    } else {
      return;
    }
  }

  async seleccionRowMetrado(i) {
    this.filaSel2 = i;
    this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
    this.mostrarColrs = false
    this.stiloFormula();
  }

  teclaFormula(value) {
    if (!this.habEditFormula) {
      this.tempFormula = [];
      return;
    }
    this.tempFormula = this.convertirAArray(value.toUpperCase());
  }

  existeEdicion(fila) {
    let valido = false;
    if (!this.habEditFormula) {
      this.tempFormula = [];
    }
    this.tempFormula.map((ele) => {
      if (ele.toString().includes(fila)) {
        valido = true;
      }
    });
    return valido;
  }

  convertirAArray(expresion: string, tipo = false): string[] {
    let array = [];
    const partes = expresion.split(/([\+\-\*/\(\)])/);
    let resultado = partes.filter((elemento) => elemento !== '');
    if (tipo) {
      array = resultado.map((ele) => {
        return ele;
      });
    } else {
      for (const ele of resultado) {
        const valorNumerico = parseFloat(ele);
        if (
          !isNaN(valorNumerico) &&
          valorNumerico.toString().length !== ele.length
        ) {
          const texto = ele.slice(valorNumerico.toString().length);
          array.push(valorNumerico);
          array.push('*');
          array.push(texto);
        } else {
          array.push(ele);
        }
      }
    }
    return array;
  }

  stiloFormula() {
    // this.habEditFormula = false
    let result = '';
    if (
      this.metradoSeleccionado &&
      this.metradoSeleccionado?.id_metrado !== null &&
      !this.metradoSeleccionado?.estitulo &&
      ((this.metradoSeleccionado?.esMetrado &&
        !this.metradoSeleccionado?.tieneSubmetrado) ||
        !this.metradoSeleccionado?.esMetrado)
    ) {
      let letras = {
        C: '#c18861',
        D: '#459ab8',
        E: '#60407b',
        F: '#3b9061',
        G: '#b352a4',
      };
      let palabra =
        this.metradoSeleccionado.id_padre == null
          ? 'C*D*E*F*G'
          : this.metradoSeleccionado.id_padre;
      for (let i = 0; i < palabra.length; i++) {
        // Letra actual
        let letra = palabra[i];
        let indice = letra.toUpperCase();
        if (letras.hasOwnProperty(indice)) {
          const color = letras[indice];
          result += `<span style="color:${color}">${letra}</span>`;
        } else {
          result += letra;
        }
      }
      var span = document.getElementById('spanformula');
      if (span) {
        span.innerHTML = result;
      }
    } else {
      var span = document.getElementById('spanformula');
      if (span) {
        span.innerHTML = result;
      }
    }
  }

  habilitarEditarSistema(celda, rowIndex) {
    if (
      this.solover ||
      (this.bloquearBotones && celda !== 'descripcion') ||
      !this.editable
    ) {
      return;
    }
    if (
      this.bloquearBotones &&
      this.tablaSistema[rowIndex].id_metrado == null
    ) {
      return;
    }
    if (!this.seleccionCelda && !this.copiadoCeldas) {
      this.filaSel2 = rowIndex;
      this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
      this.tablaSistema[rowIndex]['editar' + celda] = 1;
    } else {
      if (this.seleccionCelda) {
      } else {
        this.metradoSeleccionado = null;
        this.filaSel2 = null;
        const array = [
          'descripcion',
          'cantidad',
          'n_veces',
          'largo',
          'ancho',
          'altura',
          'archivo',
        ];
        if (!this.inicioCeldaCopiado && !this.finCeldaCopiado) {
          const ind = array.indexOf(celda);
          this.inicioCeldaCopiado = {
            fila: JSON.parse(JSON.stringify(rowIndex)),
            columna: ind == -1 ? null : ind,
            colname: celda,
          };
        } else if (this.inicioCeldaCopiado && !this.finCeldaCopiado) {
          const ind = array.indexOf(celda);
          this.finCeldaCopiado = {
            fila: JSON.parse(JSON.stringify(rowIndex)),
            columna: ind == -1 ? null : ind,
            colname: celda,
          };
        } else {
          this.inicioCeldaCopiado = null;
          this.finCeldaCopiado = null;
        }
      }
    }
  }

  handleKeyDown(event: KeyboardEvent, index: number, columna: string) {
    if (event.key === 'ArrowUp') {
      event.preventDefault(); // Evita el comportamiento predeterminado
      this.moverArribaTablaSistema(event, columna, index);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); // Evita el comportamiento predeterminado
      this.moverAbajoTablaSistema(event, columna, index);
    } else if (event.key === 'ArrowRight') {
      this.moverDerechaTablaSistema(event, columna, index);
    } else if (event.key === 'ArrowLeft') {
      this.moverIzquierdaTablaSistema(event, columna, index);
    }
  }

  async moverDerechaTablaSistema(event, columna, index) {
    if (columna == 'descripcion') {
      const inputElement = event.target as HTMLInputElement;
      const valueLength = inputElement.value.length;

      if (inputElement.selectionStart === valueLength) {
        if (this.saltardescripcion) {
          event.target.blur();
          const element = this.sgteColumna(columna, true);
          this.tablaSistema[index]['editar' + element] = 1;
        } else {
          this.saltardescripcion = true;
        }
      } else {
        this.saltardescripcion = false;
      }
    } else if (columna !== 'altura') {
      this.saltardescripcion = false;
      event.target.blur();
      const element = this.sgteColumna(columna, true);
      this.tablaSistema[index]['editar' + element] = 1;
    }
  }

  async moverIzquierdaTablaSistema(event, columna, index) {
    if (columna == 'descripcion') {
    } else {
      event.target.blur();
      const element = this.sgteColumna(columna, false);
      this.tablaSistema[index]['editar' + element] = 1;
    }
  }

  sgteColumna(columna, derecha) {
    let sgte = null;
    switch (columna) {
      case 'descripcion':
        sgte = !derecha ? 'descripcion' : 'cantidad';
        return sgte;
      case 'cantidad':
        sgte = !derecha ? 'descripcion' : 'n_veces';
        return sgte;
      case 'n_veces':
        sgte = !derecha ? 'cantidad' : 'largo';
        return sgte;
      case 'largo':
        sgte = !derecha ? 'n_veces' : 'ancho';
        return sgte;
      case 'ancho':
        sgte = !derecha ? 'largo' : 'altura';
        return sgte;
      case 'altura':
        sgte = !derecha ? 'ancho' : 'altura';
        return sgte;
      // case 'archivo':
      //   sgte = !derecha ? 'altura' : 'archivo';
      //   return sgte;
      default:
        return sgte;
    }
  }

  async moverArribaTablaSistema(value, columna, i) {
    if (this.filaSel2 > 0) {
      value.target.blur();
      const index = i - 1;
      this.tablaSistema[index]['editar' + columna] = 1;
      this.filaSel2 = index;
      this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
      this.stiloFormula();
      if (index == 1) {
        value.target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    } else {
      return;
    }
  }

  async moverAbajoTablaSistema(value, columna, i) {
    if (this.filaSel2 < this.tablaSistema.length - 1) {
      value.target.blur();
      // this.tablaSistema[i]['editar' + columna] = 0;
      const index = i + 1;

      this.tablaSistema[index]['editar' + columna] = 1;
      this.filaSel2 = index;
      this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
      this.stiloFormula();
    } else if (this.filaSel2 == this.tablaSistema.length - 1) {
      const metrado = new metradoModelo(
        '',
        1,
        '',
        null,
        this.partidaSeleccionada?.indice,
        this.idProyecto
      );
      this.tablaSistema.push(metrado);
      value.target.blur();
      // this.tablaSistema[i]['editar' + columna] = 0;
      const index = i + 1;

      this.tablaSistema[index]['editar' + columna] = 1;
      this.filaSel2 = index;
      this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
      this.stiloFormula();
    } else {
      return;
    }
  }

  async blurInputSistema(event, i, input) {
    this.modificandofila = true;
    this.saltardescripcion = false;
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    let value = event.target.value;
    this.tablaSistema[i]['editar' + input] = 0;
    if (!isNaN(value) && value.trim() !== '') {
      const partes = value.split('.');
      if (partes[0].length > 8) {
        this.toaster.warning(
          'El valor excede al maximo de 8 caracteres en la parte entera',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
          }
        );
        return;
      }
    } else {
      const  cantLimite = (input == 'descripcion' ? 200 : 80) 
      if (input.length > cantLimite) {
        this.toaster.warning(
          'El valor excede al maximo de ' + cantLimite + ' caracteres para texto',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
          }
        );
        return;
      }
    }

    if (
      this.tablaSistema[i][input] == value ||
      value == undefined ||
      value == null
    ) {
      this.modificandofila = false;
      return;
    }
    // if (value && value.length > 50) {
    //   value = value.slice(0, 49);
    //   this.toaster.warning(
    //     'El valor excede al maximo de 50 caracteres, se recorto el texto',
    //     'Advertencia',
    //     {
    //       closeButton: false,
    //       positionClass: 'toast-bottom-right',
    //       timeOut: 3000,
    //     }
    //   );
    // }
    // console.log('l1', event.target.value.length);
    // console.log('l', value.length);
    let modificado = 0;
    const indiceSel = JSON.parse(
      JSON.stringify(this.tablaTitulo[filaSel].indice)
    );
    if (this.tablaSistema[i].id_metrado !== null) {
      if (value == undefined || value == null) {
        this.modificandofila = false;
        return;
      }
      if (
        (this.tablaSistema[i][input] == null
          ? ''
          : this.tablaSistema[i][input]) !== value
      ) {
        const spliteado = value.split('.');
        if (
          spliteado.length == 2 &&
          !isNaN(Number(spliteado[1])) &&
          !spliteado[0]
        ) {
          value = '0.' + spliteado[1];
        }
        this.tablaSistema[i][input] = value;
        modificado = 1;
      }
    } else {
      if (this.tablaSistema[i].id_metrado == null) {
        if (value !== '' && value !== undefined && value !== null) {
          const spliteado = value.split('.');
          if (
            spliteado.length == 2 &&
            !isNaN(Number(spliteado[1])) &&
            !spliteado[0]
          ) {
            value = '0.' + spliteado[1];
          }
          this.tablaSistema[i] = new metradoModelo(
            '',
            1,
            '',
            i + 1,
            indiceSel,
            this.idProyecto
          );

          if (input == 'descripcion') {
            this.tablaSistema[i].ind = this.tablaSistemaProyecto.length;
            this.tablaSistema[i].subtotal = this.formsService.redondeo(
              0,
              this.dec_metrado
            );
            this.tablaSistema[i].parcial = this.formsService.redondeo(
              0,
              this.dec_metrado
            );

            if (this.cantidadMetrados < 2) {
              this.tablaSistema.map((ele) => {
                if (!ele.estitulo && ele.esMetrado && ele.id_metrado !== null) {
                  this.cantidadMetrados++;
                }
              });
            }
          }
          this.tablaSistema[i][input] = value;
          this.tablaSistema[i].ind = this.tablaSistemaProyecto.length;
          this.tablaSistemaProyecto.push(this.tablaSistema[i]);
          modificado = 1;
        }
      } else {
        if (value !== undefined && value !== null) {
          const spliteado = value.split('.');
          if (
            spliteado.length == 2 &&
            !isNaN(Number(spliteado[1])) &&
            !spliteado[0]
          ) {
            value = '0.' + spliteado[1];
          }
          this.tablaSistema[i][input] = value;
          modificado = 1;
        }
      }
    }
    if (modificado) {
      if (input !== 'descripcion') {
        await this.actuaTablaSistema(filaSel);
      } else {
        this.tablaTitulo[filaSel].editadoMetrado = 1;
        this.tablaPrincipal[this.tablaTitulo[i].ind] = this.tablaTitulo[i];
        this.actualizarTemp();
      }
    }
    this.modificandofila = false;
  }

  //acciones Sistema
  async agregarMetrado(multiple = false) {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    this.mostrarColrs = false
    if (this.metradoSeleccionado) {
      let indice = null;
      if (this.metradoSeleccionado.id_metrado !== null) {
        indice = filaSel2 + 1;
      } else {
        indice = filaSel2;
      }
      const metrado = new metradoModelo(
        '',
        1,
        '',
        1,
        this.tablaTitulo[filaSel]?.indice,
        this.idProyecto
      );
      metrado.parcial = this.formsService.redondeo(0, this.dec_metrado);
      metrado.subtotal = this.formsService.redondeo(0, this.dec_metrado);
      this.tablaSistema.splice(indice, 0, metrado);
      this.metradoSeleccionado = this.tablaSistema[filaSel2];
    } else {
      this.toaster.error('Ninguna fila seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
    if (!multiple) {
      await this.actuaTablaSistema(filaSel);
      this.stiloFormula();
      // this.guardarTablaTemporal('agregarMEtrado');
    }
  }

  async agregarMultipleMetrado(cantidad) {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    for (let i = 0; i < cantidad; i++) {
      await this.agregarMetrado(true);
    }
    if (cantidad > 0) {
      await this.actuaTablaSistema(filaSel);
      this.popover.close();
      this.stiloFormula();
      // this.guardarTablaTemporal('agregarMultipleMetrado');
    }
  }

  async agregarSubmetrado(multiple = false, idx = null) {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const indiceSel = JSON.parse(
      JSON.stringify(this.partidaSeleccionada.indice)
    );
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    this.mostrarColrs = false
    if (this.metradoSeleccionado) {
      let index = null;
      if (idx == null) {
        index =
          this.metradoSeleccionado?.id_metrado !== null
            ? filaSel2 + 1
            : filaSel2;
      } else {
        index = idx;
      }
      if (
        this.metradoSeleccionado.esMetrado &&
        !this.metradoSeleccionado.estitulo
      ) {
        this.tablaSistema[filaSel2].tieneSubmetrado = 1;
        this.tablaSistema[filaSel2].tieneAceros = 0;
      }
      const subMetrado = new metradoModelo(
        '',
        0,
        '',
        index,
        indiceSel,
        this.idProyecto
      );
      this.tablaSistema.splice(index, 0, subMetrado);
      subMetrado.parcial = this.formsService.redondeo(0, this.dec_metrado);
      subMetrado.subtotal = this.formsService.redondeo(0, this.dec_metrado);
      this.metradoSeleccionado = this.tablaSistema[filaSel2];
      if (!multiple) {
        await this.actuaTablaSistema(filaSel);
        //   await this.calculoMontosSistema();
        //   await this.actualizarDataPrincipal();
        this.stiloFormula();
        //   this.guardarTablaTemporal('agregarMEtrado');
      }

      // this.stiloFormula();
    } else {
      this.toaster.error('Ninguna fila seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
  }

  async agregarMultipleSubmetrado(cantidad) {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (this.popover2.isOpen()) {
      this.popover2.close();
    }
    if (this.metradoSeleccionado) {
      if (this.metradoSeleccionado.estitulo == 1) {
        this.toaster.error('No se puede agregar debajo de un título', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      }
      let index = null;
      const inicio =
        this.metradoSeleccionado.id_metrado !== null ? filaSel2 + 1 : filaSel2;
      for (let i = 0; i < cantidad; i++) {
        const a = inicio + i;
        await this.agregarSubmetrado(true, a);
      }
      await this.actuaTablaSistema(filaSel);
      // await this.calculoMontosSistema();
      // await this.actualizarDataPrincipal();
      this.stiloFormula();
      // this.guardarTablaTemporal('agregarMultipleSubmetrado');
    } else {
      this.toaster.error('Ninguna fila Seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
  }

  async convertirFilaATitulo() {
    let cambio = 0;
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (this.verTablaSistema) {
      if (this.metradoSeleccionado?.id_metrado !== null) {
        if (this.metradoSeleccionado.tieneAceros) {
          this.toaster.error('No se puede convertir a titulo', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          this.tablaSistema[filaSel2].estitulo = 1;
          this.tablaSistema[filaSel2].esMetrado = 1;
          this.tablaSistema[filaSel2].tieneAceros = 0;
          cambio = 1;
        }
      } else {
        if (this.metradoSeleccionado?.id_metrado == null) {
          this.tablaSistema[filaSel2].estitulo = 1;
          this.tablaSistema[filaSel2].esMetrado = 1;
          this.tablaSistema[filaSel2].tieneAceros = 0;
          cambio = 1;
        } else {
          const texto =
            filaSel2 == null
              ? 'Ningun elemento Seleccionado'
              : 'No se puede convertir a titulo';
          this.toaster.error(texto, 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        }
      }
      if (cambio) {
        await this.actuaTablaSistema(filaSel);
        this.stiloFormula();
        // this.guardarTablaTemporal('convertirFilaATituloM');
      }
    } else {
    }
  }

  async convertirFilaATexto(multiple = false) {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (this.verTablaSistema) {
      if (this.metradoSeleccionado?.id_metrado !== null) {
        let valor = 2;
        if (this.metradoSeleccionado.estitulo == 2) {
          valor = 0;
        }
        this.tablaSistema[filaSel2].estitulo = valor;
        await this.actuaTablaSistema(filaSel);
        // await this.actualizarDataPrincipal();
        this.stiloFormula();
        // this.guardarTablaTemporal('convertirFilaATexto');
      } else {
        this.toaster.info('Ningun Fila seleccionada', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      }
    } else {
      // if (this.aceroSeleccionado?.id_metrado !== null) {
      //   let valor = 2;
      //   if (this.aceroSeleccionado.estitulo == 2) {
      //     valor = 0;
      //   }
      //   this.tablaAceros[this.filaSel3].estitulo = valor;
      //   await this.actualizarTablaCompletaAceros();
      //   await this.calcularMontosAceros();
      //   await this.actualizarDataPrincipal();
      //   this.stiloFormula();
      //   this.guardarTablaTemporal('convertirFilaATexto');
      // } else {
      //   this.toaster.info('Ningun Fila seleccionada', '', {
      //     closeButton: false,
      //     positionClass: 'toast-bottom-right',
      //     timeOut: 4000,
      //   });
      //   return;
      // }
    }
  }

  async agregarFila(arriba = false) {
    let desplazar = arriba ? 0 : 1;
    const indiceSel = JSON.parse(
      JSON.stringify(this.partidaSeleccionada.indice)
    );
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (this.verTablaSistema) {
      if (this.metradoSeleccionado) {
        const metrado = new metradoModelo(
          null,
          1,
          '',
          null,
          indiceSel,
          this.idProyecto
        );
        this.tablaSistema.splice(filaSel2 + desplazar, 0, metrado);
        this.filaSel2 = filaSel2 + (arriba ? 1 : 0);

        this.metradoSeleccionado = this.tablaSistema[filaSel2];
      } else {
        const metrado = new metradoModelo(
          null,
          1,
          '',
          null,
          indiceSel,
          this.idProyecto
        );
        this.tablaSistema.push(metrado);
      }
    } else {
      if (this.aceroSeleccionado) {
        const metrado = new aceroModelo(
          null,
          1,
          '',
          null,
          indiceSel,
          this.idProyecto
        );
        this.tablaAceros.splice(this.filaSel3 + desplazar, 0, metrado);
        this.filaSel3 = this.filaSel3 + (arriba ? 1 : 0);

        this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
      } else {
        const metrado = new aceroModelo(
          null,
          1,
          '',
          null,
          indiceSel,
          this.idProyecto
        );
        this.tablaAceros.push(metrado);
      }
    }
  }

  async agregarFilas(arriba = false) {
    const cantidad = this.cantFil;
    for (let i = 0; i < cantidad; i++) {
      await this.agregarFila(arriba);
    }
    this.popover3.close();
  }

  @HostListener('document:keydown.control.arrowup', ['$event'])
  async moverArriba() {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (this.verTablaSistema) {
      if (this.metradoSeleccionado.id_metrado == null) {
        this.toaster.error('No se puede mover', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else if (
        this.metradoSeleccionado.esMetrado &&
        !this.metradoSeleccionado.estitulo
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const anteriorValido = await this.anteValido(
          filaSel2 - 1,
          'tablaSistema'
        );
        if (!anteriorValido || anteriorValido?.antExistente?.estitulo) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          for (let i = filaSel2 - 1; i >= 0; i--) {
            const row = this.tablaSistema[i];
            if (
              !row.esMetrado ||
              (row.esMetrado && row.id_metrado == null) ||
              row.estitulo == 2
            ) {
              array.push(row);
            } else if (
              (row.esMetrado && row.id_metrado !== null) ||
              row.estitulo == 1
            ) {
              array.push(row);
              index = i;
              break;
            }
          }
          for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
            const existeSgte = await this.sgteexistente(i, 'tablaSistema');
            if (existeSgte) {
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
              if (!row.esMetrado) {
                array2.push(row);
              } else {
                if (row.id_metrado !== null && row.esMetrado) {
                  break;
                } else {
                  array2.push(row);
                }
              }
            } else {
              break;
            }
          }
          const obj = JSON.parse(JSON.stringify(this.tablaSistema[filaSel2]));
          array2.unshift(obj);
          this.filaSel2 = index;

          array2.reverse();
          for (let elemento of array2) {
            this.tablaSistema.splice(index, 0, elemento);
          }
          this.tablaSistema.splice(
            index + array2.length + array.length,
            array2.length
          );
          await this.actuaTablaSistema(filaSel);
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
          // await this.actualizarDataPrincipal();
          this.stiloFormula();
          // this.guardarTablaTemporal('moverArriba1');
        }
      } else if (
        !this.metradoSeleccionado.esMetrado &&
        !this.metradoSeleccionado.estitulo
      ) {
        const anterior = await this.anteValido(filaSel2 - 1, 'tablaSistema');
        if (!anterior || anterior?.antExistente?.esMetrado) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          const inx = JSON.parse(JSON.stringify(this.filaSel2));
          const ele = JSON.parse(JSON.stringify(this.metradoSeleccionado));
          this.tablaSistema[anterior.index] = ele;
          this.tablaSistema[inx] = anterior.antExistente;
          await this.actuaTablaSistema(filaSel);
          this.filaSel2 = anterior.index;
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
          // await this.actualizarDataPrincipal();
          this.stiloFormula();
          // this.guardarTablaTemporal('moverArriba2');
        }
      } else if (
        this.metradoSeleccionado.esMetrado &&
        this.metradoSeleccionado.estitulo == 1
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const anteriorValido = await this.anteValido(
          filaSel2 - 1,
          'tablaSistema'
        );
        if (!anteriorValido.antExistente) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          for (let i = filaSel2 - 1; i >= 0; i--) {
            const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
            if (
              (row.esMetrado && !row.estitulo) ||
              !row.esMetrado ||
              row.estitulo == 2
            ) {
              array.push(row);
            } else if (row.estitulo == 1) {
              array.push(row);
              index = i;
              break;
            }
          }
          const obj = JSON.parse(
            JSON.stringify(this.tablaSistema[this.filaSel2])
          );
          array2.push(obj);
          for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
            const existeSgte = await this.sgteexistente(i, 'tablaSistema');
            if (existeSgte) {
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
              if (!row.estitulo || row.estitulo == 2) {
                array2.push(row);
              } else {
                if (row.id_metrado !== null && row.esMetrado) {
                  break;
                }
              }
            } else {
              break;
            }
          }
          this.filaSel2 = index;
          array2.reverse();
          for (let elemento of array2) {
            this.tablaSistema.splice(index, 0, elemento);
          }
          this.tablaSistema.splice(
            index + array2.length + array.length,
            array2.length
          );
          await this.actuaTablaSistema(filaSel);
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
          // await this.actualizarDataPrincipal();
          this.stiloFormula();
          // this.guardarTablaTemporal('moverArriba3');
        }
      } else if (
        this.metradoSeleccionado.esMetrado &&
        this.metradoSeleccionado.estitulo == 2 &&
        !this.metradoSeleccionado.tieneSubmetrado
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const anteriorValido = await this.anteValido(
          filaSel2 - 1,
          'tablaSistema'
        );
        if (
          !anteriorValido.antExistente ||
          anteriorValido?.antExistente?.estitulo == 1
        ) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          for (let i = filaSel2 - 1; i >= 0; i--) {
            const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
            if (!row.estitulo || row.estitulo == 2) {
              array.push(row);
            } else if (row.estitulo == 1) {
              array.push(row);
              index = i;
              break;
            }
          }
          const obj = JSON.parse(
            JSON.stringify(this.tablaSistema[this.filaSel2])
          );
          array2.push(obj);
          for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
            const existeSgte = await this.sgteexistente(i, 'tablaSistema');
            if (existeSgte) {
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
              if (!row.estitulo || row.estitulo == 2) {
                array2.push(row);
              } else {
                if (row.id_metrado !== null && row.estitulo == 1) {
                  break;
                }
              }
            } else {
              break;
            }
          }
          this.filaSel2 = index;
          array2.reverse();
          for (let elemento of array2) {
            this.tablaSistema.splice(index, 0, elemento);
          }
          this.tablaSistema.splice(
            index + array2.length + array.length,
            array2.length
          );
          await this.actuaTablaSistema(filaSel);
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
          // this.guardarTablaTemporal('moverArriba3')
        }
      }
    } else {
      if (this.aceroSeleccionado.id_metrado == null) {
        this.toaster.error('No se puede mover', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else if (
        this.aceroSeleccionado.esMetrado &&
        !this.aceroSeleccionado.estitulo
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const anteriorValido = await this.anteValido(
          this.filaSel3 - 1,
          'tablaAceros'
        );
        if (!anteriorValido || anteriorValido?.antExistente?.estitulo) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          for (let i = this.filaSel3 - 1; i >= 0; i--) {
            const row = this.tablaAceros[i];
            if (
              !row.esMetrado ||
              (row.esMetrado && row.id_metrado == null) ||
              row.estitulo == 2
            ) {
              array.push(row);
            } else if (
              (row.esMetrado && row.id_metrado !== null) ||
              row.estitulo == 1
            ) {
              array.push(row);
              index = i;
              break;
            }
          }
          for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
            const existeSgte = await this.sgteexistente(i, 'tablaAceros');
            if (existeSgte) {
              const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
              if (!row.esMetrado) {
                array2.push(row);
              } else {
                if (row.id_metrado !== null && row.esMetrado) {
                  break;
                } else {
                  array2.push(row);
                }
              }
            } else {
              break;
            }
          }
          const obj = JSON.parse(
            JSON.stringify(this.tablaAceros[this.filaSel3])
          );
          array2.unshift(obj);
          this.filaSel3 = index;

          array2.reverse();
          for (let elemento of array2) {
            this.tablaAceros.splice(index, 0, elemento);
          }
          this.tablaAceros.splice(
            index + array2.length + array.length,
            array2.length
          );
          await this.actuaTablaAceros(this.filaSel);
          this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
          // await this.actualizarDataPrincipal();
          // this.guardarTablaTemporal('moverArriba1');
        }
      } else if (
        !this.aceroSeleccionado.esMetrado &&
        !this.aceroSeleccionado.estitulo
      ) {
        const anterior = await this.anteValido(
          this.filaSel3 - 1,
          'tablaAceros'
        );
        if (!anterior || anterior?.antExistente?.esMetrado) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          const inx = JSON.parse(JSON.stringify(this.filaSel3));
          const ele = JSON.parse(JSON.stringify(this.aceroSeleccionado));
          this.tablaAceros[anterior.index] = ele;
          this.tablaAceros[inx] = anterior.antExistente;
          await this.actuaTablaAceros(this.filaSel);
          this.filaSel3 = anterior.index;
          this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
          // await this.actualizarDataPrincipal();
          // this.guardarTablaTemporal('moverArriba2');
        }
      } else if (
        this.aceroSeleccionado.esMetrado &&
        this.aceroSeleccionado.estitulo == 1
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const anteriorValido = await this.anteValido(
          this.filaSel3 - 1,
          'tablaAceros'
        );
        if (!anteriorValido.antExistente) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          for (let i = this.filaSel3 - 1; i >= 0; i--) {
            const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
            if (
              (row.esMetrado && !row.estitulo) ||
              !row.esMetrado ||
              row.estitulo == 2
            ) {
              array.push(row);
            } else if (row.estitulo == 1) {
              array.push(row);
              index = i;
              break;
            }
          }
          const obj = JSON.parse(
            JSON.stringify(this.tablaAceros[this.filaSel3])
          );
          array2.push(obj);
          for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
            const existeSgte = await this.sgteexistente(i, 'tablaAceros');
            if (existeSgte) {
              const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
              if (!row.estitulo || row.estitulo == 2) {
                array2.push(row);
              } else {
                if (row.id_metrado !== null && row.esMetrado) {
                  break;
                }
              }
            } else {
              break;
            }
          }
          this.filaSel3 = index;
          array2.reverse();
          for (let elemento of array2) {
            this.tablaAceros.splice(index, 0, elemento);
          }
          this.tablaAceros.splice(
            index + array2.length + array.length,
            array2.length
          );
          await this.actuaTablaAceros(this.filaSel);
          this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
          // await this.actualizarDataPrincipal();
          this.stiloFormula();
          // this.guardarTablaTemporal('moverArriba3');
        }
      } else if (
        this.aceroSeleccionado.esMetrado &&
        this.aceroSeleccionado.estitulo == 2 &&
        !this.aceroSeleccionado.tieneSubmetrado
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const anteriorValido = await this.anteValido(
          this.filaSel3 - 1,
          'tablaAceros'
        );
        if (
          !anteriorValido.antExistente ||
          anteriorValido?.antExistente?.estitulo == 1
        ) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          for (let i = this.filaSel3 - 1; i >= 0; i--) {
            const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
            if (!row.estitulo || row.estitulo == 2) {
              array.push(row);
            } else if (row.estitulo == 1) {
              array.push(row);
              index = i;
              break;
            }
          }
          const obj = JSON.parse(
            JSON.stringify(this.tablaAceros[this.filaSel3])
          );
          array2.push(obj);
          for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
            const existeSgte = await this.sgteexistente(i, 'tablaAceros');
            if (existeSgte) {
              const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
              if (!row.estitulo || row.estitulo == 2) {
                array2.push(row);
              } else {
                if (row.id_metrado !== null && row.estitulo == 1) {
                  break;
                }
              }
            } else {
              break;
            }
          }
          this.filaSel3 = index;
          array2.reverse();
          for (let elemento of array2) {
            this.tablaAceros.splice(index, 0, elemento);
          }
          this.tablaAceros.splice(
            index + array2.length + array.length,
            array2.length
          );
          await this.actuaTablaAceros(this.filaSel);
          this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
          // this.guardarTablaTemporal('moverArriba3')
        }
      }
    }
  }

  async sgteValido(indice, tabla) {
    let sgteExistente = null;
    let index = null;
    for (let i = indice; i < this[tabla].length; i++) {
      const row = this[tabla][i];
      if (row.id_metrado !== null && row.estitulo !== 2) {
        sgteExistente = row;
        index = i;
        break;
      }
    }
    return { sgteExistente: sgteExistente, index: index };
  }

  async anteValido(indice, tabla) {
    let antExistente = null;
    let index = null;
    for (let i = indice; i >= 0; i--) {
      const row = this[tabla][i];
      if (row.id_metrado !== null && row.estitulo !== 2) {
        antExistente = row;
        index = i;
        break;
      }
    }
    return { antExistente: antExistente, index: index };
  }

  async sgteexistente(ind, tabla) {
    let existe = false;
    for (let i = ind; i < this[tabla].length; i++) {
      const element = this[tabla][i];
      if (element.id_metrado !== null) {
        existe = true;
        break;
      }
    }
    return existe;
  }

  async antexistente(ind, tabla) {
    let existe = false;
    for (let i = ind; i >= 0; i--) {
      const element = this[tabla][i];
      if (element.id_metrado !== null) {
        existe = true;
        break;
      }
    }
    return existe;
  }

  @HostListener('document:keydown.control.arrowdown', ['$event'])
  async moverAbajo() {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (this.verTablaSistema) {
      if (this.metradoSeleccionado.id_metrado == null) {
        this.toaster.error('No se puede mover', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else if (
        this.metradoSeleccionado.esMetrado &&
        !this.metradoSeleccionado.estitulo
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        array.push(this.tablaSistema[filaSel2]);
        for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
          const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
          if (
            !row.esMetrado ||
            (row.esMetrado && row.id_metrado == null) ||
            row.estitulo == 2
          ) {
            array.push(row);
          } else if ((row.esMetrado && row.id_metrado) || row.estitulo == 1) {
            index = i;
            break;
          }
        }
        const sgteValido = await this.sgteValido(
          filaSel2 + array.length,
          'tablaSistema'
        );
        if (!sgteValido?.sgteExistente || sgteValido?.sgteExistente?.estitulo) {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          array2.push(this.tablaSistema[filaSel2 + array.length]);
          for (
            let i = filaSel2 + array.length + 1;
            i < this.tablaSistema.length;
            i++
          ) {
            const existeSgte = await this.sgteValido(i, 'tablaSistema');
            if (existeSgte?.sgteExistente) {
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
              if (
                !row.esMetrado ||
                (row.esMetrado && row.id_metrado == null) ||
                row.estitulo == 2
              ) {
                array2.push(row);
              } else if (
                (row.id_metrado !== null && row.esMetrado) ||
                row.estitulo == 1
              ) {
                index = i;
                break;
              }
            } else {
              break;
            }
          }
          const inx = JSON.parse(JSON.stringify(this.filaSel2));
          array.reverse();
          for (let elemento of array) {
            this.tablaSistema.splice(
              inx + array2.length + array.length,
              0,
              elemento
            );
          }
          this.tablaSistema.splice(inx, array.length);
          this.filaSel2 = inx + array2.length;
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
          await this.actuaTablaSistema(filaSel);
          // await this.actualizarDataPrincipal();
          this.stiloFormula();
          // this.guardarTablaTemporal('moverAbajo1');
        }
      } else if (!this.metradoSeleccionado.esMetrado) {
        const sgte = await this.sgteValido(filaSel2 + 1, 'tablaSistema');
        if (!sgte?.sgteExistente || sgte?.sgteExistente?.esMetrado) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          const inx = JSON.parse(JSON.stringify(this.filaSel2));
          const ele = JSON.parse(JSON.stringify(this.metradoSeleccionado));
          this.tablaSistema[sgte.index] = ele;
          this.tablaSistema[inx] = sgte.sgteExistente;
          await this.actuaTablaSistema(filaSel);
          this.filaSel2 = sgte.index;
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
          // await this.actualizarDataPrincipal();
          this.stiloFormula();
          // this.guardarTablaTemporal('moverAbajo2');
        }
      } else if (
        this.metradoSeleccionado.esMetrado &&
        this.metradoSeleccionado.estitulo == 1
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const obj = JSON.parse(
          JSON.stringify(this.tablaSistema[this.filaSel2])
        );
        array.push(obj);
        for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
          const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
          if (row.estitulo !== 1) {
            array.push(row);
          } else if (row.estitulo == 1) {
            break;
          }
        }
        const sgteValido = await this.sgteValido(
          filaSel2 + array.length,
          'tablaSistema'
        );
        if (!sgteValido?.sgteExistente) {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          array2.push(this.tablaSistema[filaSel2 + array.length]);
          for (
            let i = filaSel2 + array.length + 1;
            i < this.tablaSistema.length;
            i++
          ) {
            const existeSgte = await this.sgteValido(i, 'tablaSistema');
            if (existeSgte?.sgteExistente) {
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
              if (row.estitulo !== 1) {
                array2.push(row);
              } else if (row.estitulo == 1) {
                index = i;
                break;
              }
            } else {
              break;
            }
          }
          const inx = JSON.parse(JSON.stringify(this.filaSel2));
          array.reverse();
          for (let elemento of array) {
            this.tablaSistema.splice(
              inx + array2.length + array.length,
              0,
              elemento
            );
          }
          this.tablaSistema.splice(inx, array.length);
          this.filaSel2 = inx + array2.length;
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
          await this.actuaTablaSistema(filaSel);
          // await this.actualizarDataPrincipal();
          this.stiloFormula();
          // this.guardarTablaTemporal('moverAbajo3');
        }
      } else if (
        this.metradoSeleccionado.esMetrado &&
        this.metradoSeleccionado.estitulo == 2 &&
        !this.metradoSeleccionado.tieneSubmetrado
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const obj = JSON.parse(
          JSON.stringify(this.tablaSistema[this.filaSel2])
        );
        array.push(obj);
        for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
          const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
          if (!row.estitulo || row.estitulo == 2) {
            array.push(row);
          } else if (row.estitulo == 1) {
            break;
          }
        }
        const sgteValido = await this.sgteValido(
          filaSel2 + array.length,
          'tablaSistema'
        );
        if (!sgteValido?.sgteExistente) {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          array2.push(this.tablaSistema[filaSel2 + array.length]);
          for (
            let i = filaSel2 + array.length + 1;
            i < this.tablaSistema.length;
            i++
          ) {
            const existeSgte = await this.sgteValido(i, 'tablaSistema');
            if (existeSgte?.sgteExistente) {
              const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
              if (!row.estitulo || row.estitulo == 2) {
                array2.push(row);
              } else if (row.estitulo == 1) {
                index = i;
                break;
              }
            } else {
              break;
            }
          }
          const inx = JSON.parse(JSON.stringify(this.filaSel2));
          array.reverse();
          for (let elemento of array) {
            this.tablaSistema.splice(
              inx + array2.length + array.length,
              0,
              elemento
            );
          }
          this.tablaSistema.splice(inx, array.length);
          this.filaSel2 = inx + array2.length;
          this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
          await this.actuaTablaSistema(filaSel);
          // await this.actualizarDataPrincipal();
          this.stiloFormula();
          // this.guardarTablaTemporal('moverAbajo3');
        }
      }
    } else {
      if (this.aceroSeleccionado.id_metrado == null) {
        this.toaster.error('No se puede mover', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else if (
        this.aceroSeleccionado.esMetrado &&
        !this.aceroSeleccionado.estitulo
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        array.push(this.tablaAceros[this.filaSel3]);
        for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
          const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
          if (
            !row.esMetrado ||
            (row.esMetrado && row.id_metrado == null) ||
            row.estitulo == 2
          ) {
            array.push(row);
          } else if ((row.esMetrado && row.id_metrado) || row.estitulo == 1) {
            index = i;
            break;
          }
        }
        const sgteValido = await this.sgteValido(
          this.filaSel3 + array.length,
          'tablaAceros'
        );
        if (!sgteValido?.sgteExistente || sgteValido?.sgteExistente?.estitulo) {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          array2.push(this.tablaAceros[this.filaSel3 + array.length]);
          for (
            let i = this.filaSel3 + array.length + 1;
            i < this.tablaAceros.length;
            i++
          ) {
            const existeSgte = await this.sgteValido(i, 'tablaAceros');
            if (existeSgte?.sgteExistente) {
              const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
              if (
                !row.esMetrado ||
                (row.esMetrado && row.id_metrado == null) ||
                row.estitulo == 2
              ) {
                array2.push(row);
              } else if (
                (row.id_metrado !== null && row.esMetrado) ||
                row.estitulo == 1
              ) {
                index = i;
                break;
              }
            } else {
              break;
            }
          }
          const inx = JSON.parse(JSON.stringify(this.filaSel3));
          array.reverse();
          for (let elemento of array) {
            this.tablaAceros.splice(
              inx + array2.length + array.length,
              0,
              elemento
            );
          }
          this.tablaAceros.splice(inx, array.length);
          this.filaSel3 = inx + array2.length;
          this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
          await this.actuaTablaAceros(this.filaSel);
          // await this.actualizarDataPrincipal();
          // this.guardarTablaTemporal('moverAbajo1');
        }
      } else if (!this.aceroSeleccionado.esMetrado) {
        const sgte = await this.sgteValido(this.filaSel3 + 1, 'tablaAceros');
        if (!sgte?.sgteExistente || sgte?.sgteExistente?.esMetrado) {
          this.toaster.error('No se puede mover', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          const inx = JSON.parse(JSON.stringify(this.filaSel3));
          const ele = JSON.parse(JSON.stringify(this.aceroSeleccionado));
          this.tablaAceros[sgte.index] = ele;
          this.tablaAceros[inx] = sgte.sgteExistente;
          await this.actuaTablaAceros(this.filaSel);
          this.filaSel3 = sgte.index;
          this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
          // await this.actualizarDataPrincipal();
          // this.guardarTablaTemporal('moverAbajo2');
        }
      } else if (
        this.aceroSeleccionado.esMetrado &&
        this.aceroSeleccionado.estitulo == 1
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const obj = JSON.parse(JSON.stringify(this.tablaAceros[this.filaSel3]));
        array.push(obj);
        for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
          const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
          if (row.estitulo !== 1) {
            array.push(row);
          } else if (row.estitulo == 1) {
            break;
          }
        }
        const sgteValido = await this.sgteValido(
          this.filaSel3 + array.length,
          'tablaAceros'
        );
        if (!sgteValido?.sgteExistente) {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          array2.push(this.tablaAceros[this.filaSel3 + array.length]);
          for (
            let i = this.filaSel3 + array.length + 1;
            i < this.tablaAceros.length;
            i++
          ) {
            const existeSgte = await this.sgteValido(i, 'tablaAceros');
            if (existeSgte?.sgteExistente) {
              const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
              if (row.estitulo !== 1) {
                array2.push(row);
              } else if (row.estitulo == 1) {
                index = i;
                break;
              }
            } else {
              break;
            }
          }
          const inx = JSON.parse(JSON.stringify(this.filaSel3));
          array.reverse();
          for (let elemento of array) {
            this.tablaAceros.splice(
              inx + array2.length + array.length,
              0,
              elemento
            );
          }
          this.tablaAceros.splice(inx, array.length);
          this.filaSel3 = inx + array2.length;
          this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
          await this.actuaTablaAceros(this.filaSel);
          // await this.actualizarDataPrincipal();
          // this.guardarTablaTemporal('moverAbajo3');
        }
      } else if (
        this.aceroSeleccionado.esMetrado &&
        this.aceroSeleccionado.estitulo == 2 &&
        !this.aceroSeleccionado.tieneSubmetrado
      ) {
        let array = [];
        let array2 = [];
        let index = null;
        const obj = JSON.parse(JSON.stringify(this.tablaAceros[this.filaSel3]));
        array.push(obj);
        for (let i = this.filaSel3 + 1; i < this.tablaAceros.length; i++) {
          const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
          if (!row.estitulo || row.estitulo == 2) {
            array.push(row);
          } else if (row.estitulo == 1) {
            break;
          }
        }
        const sgteValido = await this.sgteValido(
          this.filaSel3 + array.length,
          'tablaAceros'
        );
        if (!sgteValido?.sgteExistente) {
          this.toaster.error('No se puede desplazar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          array2.push(this.tablaAceros[this.filaSel3 + array.length]);
          for (
            let i = this.filaSel3 + array.length + 1;
            i < this.tablaAceros.length;
            i++
          ) {
            const existeSgte = await this.sgteValido(i, 'tablaAceros');
            if (existeSgte?.sgteExistente) {
              const row = JSON.parse(JSON.stringify(this.tablaAceros[i]));
              if (!row.estitulo || row.estitulo == 2) {
                array2.push(row);
              } else if (row.estitulo == 1) {
                index = i;
                break;
              }
            } else {
              break;
            }
          }
          const inx = JSON.parse(JSON.stringify(this.filaSel3));
          array.reverse();
          for (let elemento of array) {
            this.tablaAceros.splice(
              inx + array2.length + array.length,
              0,
              elemento
            );
          }
          this.tablaAceros.splice(inx, array.length);
          this.filaSel3 = inx + array2.length;
          this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
          await this.actuaTablaAceros(this.filaSel);
          // await this.actualizarDataPrincipal();
          // this.guardarTablaTemporal('moverAbajo3');
        }
      }
    }
  }

  @HostListener('document:keydown.control.arrowleft', ['$event'])
  async subirNivelfila(e?: KeyboardEvent) {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (!this.habilitadoMultiple) {
      if (this.verTablaSistema) {
        if (this.metradoSeleccionado.id_metrado !== null) {
          const sgte = await this.sgteValido(filaSel2 + 1, 'tablaSistema');
          const anterior = await this.anteValido(filaSel2 - 1, 'tablaSistema');
          if (
            !this.metradoSeleccionado.estitulo &&
            this.metradoSeleccionado.esMetrado
          ) {
            this.metradoSeleccionado.estitulo = 1;
            this.metradoSeleccionado.esMetrado = 1;
            this.metradoSeleccionado.tieneAceros = 0;
            this.metradoSeleccionado.tieneSubmetrado = 0;
          } else if (
            !this.metradoSeleccionado.estitulo &&
            !this.metradoSeleccionado.esMetrado
          ) {
            if (
              anterior.index !== null &&
              anterior.antExistente.esMetrado &&
              !anterior.antExistente.estitulo &&
              sgte.index !== null &&
              ((sgte.sgteExistente.esMetrado && !sgte.sgteExistente.estitulo) ||
                sgte.sgteExistente.estitulo)
            ) {
              this.tablaSistema[anterior.index].tieneSubmetrado = 0;
              this.tablaSistema[anterior.index].tieneAceros = 0;
            } else if (
              anterior.index !== null &&
              anterior.antExistente.esMetrado &&
              !anterior.antExistente.estitulo &&
              sgte.index !== null &&
              !sgte.sgteExistente.esMetrado &&
              !sgte.sgteExistente.estitulo
            ) {
              this.tablaSistema[anterior.index].tieneSubmetrado = 1;
              this.tablaSistema[anterior.index].tieneAceros = 0;
            }
            this.metradoSeleccionado.estitulo = 0;
            this.metradoSeleccionado.esMetrado = 1;
            this.metradoSeleccionado.tieneAceros = 0;
            this.metradoSeleccionado.tieneSubmetrado = 0;
          } else if (this.metradoSeleccionado.estitulo == 1) {
            return;
          } else if (this.metradoSeleccionado.estitulo == 2) {
            if (
              anterior.index !== null &&
              anterior.antExistente.esMetrado &&
              !anterior.antExistente.estitulo
            ) {
              this.tablaSistema[anterior.index].tieneSubmetrado = 1;
              this.tablaSistema[anterior.index].tieneAceros = 0;
            } else if (anterior.index == null) {
              return;
            }
            this.metradoSeleccionado.estitulo = 0;
            this.metradoSeleccionado.esMetrado = 0;
            this.metradoSeleccionado.tieneAceros = 0;
            this.metradoSeleccionado.tieneSubmetrado = 0;
          }
          await this.actuaTablaSistema(filaSel);
          // await this.calculoMontosSistema();
          // await this.actualizarDataPrincipal();
          this.stiloFormula();
          // this.guardarTablaTemporal('volverMetrado');
        } else {
          this.toaster.error('Fila seleccionada no valida', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
        }
        this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
      } else {
        if (this.aceroSeleccionado.id_metrado !== null) {
          const sgte = await this.sgteValido(this.filaSel3 + 1, 'tablaAceros');
          const anterior = await this.anteValido(
            this.filaSel3 - 1,
            'tablaAceros'
          );
          if (
            !this.aceroSeleccionado.estitulo &&
            this.aceroSeleccionado.esMetrado
          ) {
            this.aceroSeleccionado.estitulo = 1;
            this.aceroSeleccionado.esMetrado = 1;
            this.aceroSeleccionado.tieneAceros = 0;
            this.aceroSeleccionado.tieneSubmetrado = 0;
          } else if (
            !this.aceroSeleccionado.estitulo &&
            !this.aceroSeleccionado.esMetrado
          ) {
            if (
              anterior.index !== null &&
              anterior.antExistente.esMetrado &&
              !anterior.antExistente.estitulo &&
              sgte.index !== null &&
              ((sgte.sgteExistente.esMetrado && !sgte.sgteExistente.estitulo) ||
                sgte.sgteExistente.estitulo)
            ) {
              this.tablaAceros[anterior.index].tieneSubmetrado = 0;
              this.tablaAceros[anterior.index].tieneAceros = 0;
            } else if (
              anterior.index !== null &&
              anterior.antExistente.esMetrado &&
              !anterior.antExistente.estitulo &&
              sgte.index !== null &&
              !sgte.sgteExistente.esMetrado &&
              !sgte.sgteExistente.estitulo
            ) {
              this.tablaAceros[anterior.index].tieneSubmetrado = 1;
              this.tablaAceros[anterior.index].tieneAceros = 0;
            }
            this.aceroSeleccionado.estitulo = 0;
            this.aceroSeleccionado.esMetrado = 1;
            this.aceroSeleccionado.tieneAceros = 0;
            this.aceroSeleccionado.tieneSubmetrado = 0;
          } else if (this.aceroSeleccionado.estitulo == 1) {
            return;
          } else if (this.aceroSeleccionado.estitulo == 2) {
            if (
              anterior.index !== null &&
              anterior.antExistente.esMetrado &&
              !anterior.antExistente.estitulo
            ) {
              this.tablaAceros[anterior.index].tieneSubmetrado = 1;
              this.tablaAceros[anterior.index].tieneAceros = 0;
            } else if (anterior.index == null) {
              return;
            }
            this.aceroSeleccionado.estitulo = 0;
            this.aceroSeleccionado.esMetrado = 0;
            this.aceroSeleccionado.tieneAceros = 0;
            this.aceroSeleccionado.tieneSubmetrado = 0;
          }
          await this.actuaTablaAceros(this.filaSel);
          // await this.calculoMontosSistema();
          // await this.actualizarDataPrincipal();
          // this.guardarTablaTemporal('volverMetrado');
        } else {
          this.toaster.error('Fila seleccionada no valida', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
        }
        this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
      }
    } else {
      let tipoTabla = this.verTablaSistema ? 'tablaSistema' : 'tablaAceros';
      const filtrados = await this[tipoTabla].filter((ele) => ele.editarCopiar);
      this[tipoTabla].map((ele) => {
        ele.editarCopiar = false;
        ele.editarEliminar = false;
      });
      if (filtrados.length) {
        let titulos = 0;
        let metrados = 0;
        let submetrados = 0;
        await filtrados.map((ele) => {
          if (!ele.esMetrado) {
            submetrados++;
          } else if (ele.esMetrado && ele.estitulo !== 1) {
            metrados++;
          } else if (ele.esMetrado && ele.estitulo == 1) {
            titulos++;
          }
        });

        if (metrados > 0 && !titulos && !submetrados) {
          for (const iterator of filtrados) {
            if (
              iterator.id_metrado !== null &&
              iterator.esMetrado &&
              !iterator.tieneSubmetrado
            ) {
              iterator.esMetrado = 1;
              iterator.estitulo = 1;
            } else {
              this.toaster.error(
                'Metrado: ' +
                  iterator.descripcion +
                  ' tiene submetrados relacionados',
                'Error',
                {
                  closeButton: false,
                  positionClass: 'toast-bottom-right',
                  timeOut: 4000,
                }
              );
              return;
            }
          }
        } else if (!metrados && titulos > 0 && !submetrados) {
          this.toaster.error('Titulo es el maximo nivel', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else if (!metrados && !titulos && submetrados > 0) {
          for (const iterator of filtrados) {
            if (iterator.id_metrado !== null && !iterator.esMetrado) {
              iterator.esMetrado = 1;
              iterator.estitulo = 0;
            }
          }
        } else {
          this.toaster.error(
            'No se convertir elementos de diferentes tipos',
            'Error',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 2000,
            }
          );
          return;
        }
        if (tipoTabla == 'tablaSistema') {
          await this.actuaTablaSistema(filaSel);
          this.stiloFormula();
        } else {
          await this.actuaTablaAceros(this.filaSel);
        }
        // this.guardarTablaTemporal('volverMetrado');
      }
      this.habilitadoMultiple = false;
      this.habilitadoCopiar = false;
      this.todosCheck = false;
    }
  }

  @HostListener('document:keydown.control.arrowright', ['$event'])
  async bajarNivel(e?: KeyboardEvent) {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    const filaSel3 = JSON.parse(JSON.stringify(this.filaSel3));
    if (!this.habilitadoMultiple) {
      if (this.verTablaSistema) {
        if (
          this.metradoSeleccionado &&
          this.metradoSeleccionado.id_metrado !== null
        ) {
          const sgte = await this.sgteValido(filaSel2 + 1, 'tablaSistema');
          const anterior = await this.anteValido(filaSel2 - 1, 'tablaSistema');
          if (
            !this.metradoSeleccionado.esMetrado &&
            !this.metradoSeleccionado.estitulo
          ) {
            this.tablaSistema[filaSel2].estitulo = 2;
            this.tablaSistema[filaSel2].esMetrado = 0;
            this.tablaSistema[filaSel2].tieneAceros = 0;
            this.tablaSistema[filaSel2].tieneSubmetrado = 0;
            if (anterior.index !== null) {
              if (
                anterior.antExistente.esMetrado &&
                !anterior.antExistente.estitulo &&
                (sgte?.sgteExistente?.esMetrado ||
                  sgte?.sgteExistente?.estitulo)
              ) {
                this.tablaSistema[anterior.index].tieneSubmetrado = 0;
                this.tablaSistema[anterior.index].tieneAceros = 0;
              } else if (
                (anterior.antExistente.esMetrado &&
                  !anterior.antExistente.estitulo &&
                  !sgte?.sgteExistente?.esMetrado) ||
                !sgte?.sgteExistente?.estitulo
              ) {
                this.tablaSistema[anterior.index].tieneSubmetrado = 1;
                this.tablaSistema[anterior.index].tieneAceros = 0;
              }
            }
          } else if (
            this.metradoSeleccionado.esMetrado &&
            !this.metradoSeleccionado.estitulo
          ) {
            if (anterior.index !== null) {
              this.tablaSistema[filaSel2].estitulo = 0;
              this.tablaSistema[filaSel2].esMetrado = 0;
              this.tablaSistema[filaSel2].tieneAceros = 0;
              this.tablaSistema[filaSel2].tieneSubmetrado = 0;
              if (
                anterior.antExistente.esMetrado &&
                !anterior.antExistente.estitulo
              ) {
                this.tablaSistema[anterior.index].tieneSubmetrado = 1;
                this.tablaSistema[anterior.index].tieneAceros = 0;
              } else {
              }
            } else {
              this.toaster.error('No se puede bajar de nivel', 'Error', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 2000,
              });
              return;
            }
          } else if (
            this.metradoSeleccionado.esMetrado &&
            this.metradoSeleccionado.estitulo == 1
          ) {
            this.tablaSistema[filaSel2].estitulo = 0;
            this.tablaSistema[filaSel2].esMetrado = 1;
            this.tablaSistema[filaSel2].tieneAceros = 0;
            this.tablaSistema[filaSel2].tieneSubmetrado = 0;
          } else {
            return;
          }

          await this.actuaTablaSistema(filaSel);
          // await this.calculoMontosSistema();
          // this.guardarTablaTemporal('volverSubmetrado');
          this.metradoSeleccionado = this.tablaSistema[filaSel2];
        } else {
          this.toaster.error('Fila seleccionada no valida', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
        }
      } else {

        // if (filaSel3 !== null) {
        //   this.aceroSeleccionado = this.tablaAceros[filaSel3]
        // }
        if (
          this.aceroSeleccionado &&
          this.aceroSeleccionado.id_metrado !== null
        ) {
          const sgte = await this.sgteValido(this.filaSel3 + 1, 'tablaAceros');
          const anterior = await this.anteValido(
            this.filaSel3 - 1,
            'tablaAceros'
          );
          if (
            !this.aceroSeleccionado.esMetrado &&
            !this.aceroSeleccionado.estitulo
          ) {
            this.tablaAceros[this.filaSel3].estitulo = 2;
            this.tablaAceros[this.filaSel3].esMetrado = 0;
            this.tablaAceros[this.filaSel3].tieneAceros = 0;
            this.tablaAceros[this.filaSel3].tieneSubmetrado = 0;
            if (anterior.index !== null) {
              if (
                anterior.antExistente.esMetrado &&
                !anterior.antExistente.estitulo &&
                (sgte?.sgteExistente?.esMetrado ||
                  sgte?.sgteExistente?.estitulo)
              ) {
                this.tablaAceros[anterior.index].tieneSubmetrado = 0;
                this.tablaAceros[anterior.index].tieneAceros = 0;
              } else if (
                (anterior.antExistente.esMetrado &&
                  !anterior.antExistente.estitulo &&
                  !sgte?.sgteExistente?.esMetrado) ||
                !sgte?.sgteExistente?.estitulo
              ) {
                this.tablaAceros[anterior.index].tieneSubmetrado = 1;
                this.tablaAceros[anterior.index].tieneAceros = 0;
              }
            }
          } else if (
            this.aceroSeleccionado.esMetrado &&
            !this.aceroSeleccionado.estitulo
          ) {
            if (anterior.index !== null) {
              this.tablaAceros[this.filaSel3].estitulo = 0;
              this.tablaAceros[this.filaSel3].esMetrado = 0;
              this.tablaAceros[this.filaSel3].tieneAceros = 0;
              this.tablaAceros[this.filaSel3].tieneSubmetrado = 0;
              if (
                anterior.antExistente.esMetrado &&
                !anterior.antExistente.estitulo
              ) {
                this.tablaAceros[anterior.index].tieneSubmetrado = 1;
                this.tablaAceros[anterior.index].tieneAceros = 0;
              } else {
              }
            } else {
              this.toaster.error('No se puede bajar de nivel', 'Error', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 2000,
              });
              return;
            }
          } else if (
            this.aceroSeleccionado.esMetrado &&
            this.aceroSeleccionado.estitulo == 1
          ) {
            this.tablaAceros[this.filaSel3].estitulo = 0;
            this.tablaAceros[this.filaSel3].esMetrado = 1;
            this.tablaAceros[this.filaSel3].tieneAceros = 0;
            this.tablaAceros[this.filaSel3].tieneSubmetrado = 0;
          } else {
            return;
          }

          await this.actuaTablaAceros(this.filaSel);
          // await this.calculoMontosSistema();
          // this.guardarTablaTemporal('volverSubmetrado');
          this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
        } else {
          this.toaster.error('Fila seleccionada no valida', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
        }
      }
    } else {
      let tipoTabla = this.verTablaSistema ? 'tablaSistema' : 'tablaAceros';
      const filtrados = await this[tipoTabla].filter((ele) => ele.editarCopiar);
      this[tipoTabla].map((ele) => {
        ele.editarCopiar = false;
        ele.editarEliminar = false;
      });
      if (filtrados.length) {
        let titulos = 0;
        let metrados = 0;
        let submetrados = 0;
        let textos = 0;
        await filtrados.map((ele) => {
          if (!ele.esMetrado && ele.id_metrado !== null) {
            submetrados++;
          } else if (
            ele.esMetrado &&
            ele.estitulo !== 1 &&
            ele.id_metrado !== null
          ) {
            metrados++;
          } else if (ele.estitulo == 1 && ele.id_metrado !== null) {
            titulos++;
          } else if (ele.estitulo == 2 && ele.id_metrado !== null) {
            textos++;
          }
        });

        if (metrados > 0 && !titulos && !submetrados && !textos) {
          for (const iterator of filtrados) {
            iterator.esMetrado = 0;
            iterator.estitulo = 0;
            iterator.tieneSubmetrados = 0;
          }
        } else if (!metrados && titulos > 0 && !submetrados && !textos) {
          for (const iterator of filtrados) {
            iterator.esMetrado = 1;
            iterator.estitulo = 0;
            iterator.tieneSubmetrados = 0;
          }
        } else if (!metrados && !titulos && submetrados > 0 && !textos) {
          for (const iterator of filtrados) {
            iterator.esMetrado = 0;
            iterator.estitulo = 2;
            iterator.tieneSubmetrados = 0;
          }
        } else if (!metrados && !titulos && submetrados > 0 && !textos) {
          this.toaster.error('Texto es el mínimo nivel', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        } else {
          this.toaster.error(
            'No se puede convertir elementos de diferentes tipos',
            'Error',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 2000,
            }
          );
          return;
        }

        if (tipoTabla == 'tablaSistema') {
          await this.actuaTablaSistema(filaSel);
        } else {
          await this.actuaTablaAceros(this.filaSel);
        }
        // this.guardarTablaTemporal('volverSubmetrado');
        // this.habilitadoMultiple = false;
      }
    }
    this.habilitadoMultiple = false;
    this.habilitadoCopiar = false;
    this.todosCheck = false;
  }

  async desplazarArriba() {
    const indiceSel = JSON.parse(
      JSON.stringify(this.partidaSeleccionada.indice)
    );
    if (this.verTablaSistema) {
      if (this.metradoSeleccionado?.id_metrado !== null && this.filaSel2 > 0) {
        const dataMetrado = JSON.parse(
          JSON.stringify(this.metradoSeleccionado)
        );
        const indAnterior = this.filaSel2 - 1;
        if (this.tablaSistema[indAnterior]?.id_metrado == null) {
          this.tablaSistema[indAnterior] = dataMetrado;
          this.tablaSistema[this.filaSel2] = new metradoModelo(
            '',
            1,
            '',
            null,
            indiceSel,
            this.idProyecto
          );
          this.metradoSeleccionado = this.tablaSistema[indAnterior];
          this.filaSel2 = indAnterior;
        } else {
          this.toaster.error('No se puede desplazar elemento', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        }
      } else {
        this.toaster.error('No se puede desplazar elemento', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
    } else {
      if (this.aceroSeleccionado?.id_metrado !== null && this.filaSel3 > 0) {
        const dataMetrado = JSON.parse(JSON.stringify(this.aceroSeleccionado));
        const indAnterior = this.filaSel3 - 1;
        if (this.tablaAceros[indAnterior]?.id_metrado == null) {
          this.tablaAceros[indAnterior] = dataMetrado;
          this.tablaAceros[this.filaSel3] = new aceroModelo(
            null,
            1,
            null,
            null,
            indiceSel,
            this.idProyecto
          );
          this.aceroSeleccionado = this.tablaAceros[indAnterior];
          this.filaSel3 = indAnterior;
        } else {
          this.toaster.error('No se puede desplazar elemento', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        }
      } else {
        this.toaster.error('No se puede desplazar elemento', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
    }
  }

  async desplazarAbajo() {
    const indiceSel = JSON.parse(
      JSON.stringify(this.partidaSeleccionada.indice)
    );
    if (this.verTablaSistema) {
      if (this.metradoSeleccionado?.id_metrado !== null) {
        const dataMetrado = JSON.parse(
          JSON.stringify(this.metradoSeleccionado)
        );
        const indSgte = this.filaSel2 + 1;
        if (
          this.tablaSistema[indSgte]?.id_metrado == null &&
          indSgte < this.tablaSistema.length
        ) {
          this.tablaSistema[indSgte] = dataMetrado;
          this.tablaSistema[this.filaSel2] = new metradoModelo(
            '',
            1,
            '',
            null,
            indiceSel,
            this.idProyecto
          );
          this.metradoSeleccionado = this.tablaSistema[indSgte];
          this.filaSel2 = indSgte;
          // await this.actualizarTablaCompleta();
        } else {
          this.toaster.error('No se puede desplazar elemento', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        }
      } else {
        this.toaster.error('No se puede desplazar elemento', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
    } else {
      if (this.aceroSeleccionado?.id_metrado !== null) {
        const dataMetrado = JSON.parse(JSON.stringify(this.aceroSeleccionado));
        const indSgte = this.filaSel3 + 1;
        if (
          this.tablaAceros[indSgte]?.id_metrado == null &&
          indSgte < this.tablaAceros.length
        ) {
          this.tablaAceros[indSgte] = dataMetrado;
          this.tablaAceros[this.filaSel3] = new aceroModelo(
            null,
            1,
            null,
            null,
            indiceSel,
            this.idProyecto
          );
          this.aceroSeleccionado = this.tablaAceros[indSgte];
          this.filaSel3 = indSgte;
          // await this.actualizarTablaCompleta();
        } else {
          this.toaster.error('No se puede desplazar elemento', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        }
      } else {
        this.toaster.error('No se puede desplazar elemento', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
    }
  }

  async copiarFila() {
    this.arrayCopiadosMetrado = [];
    this.arrayCopiadosAceros = [];
    if (this.verTablaSistema) {
      if (this.metradoSeleccionado?.id_metrado !== null) {
        this.arrayCopiadosMetrado.push(
          JSON.parse(JSON.stringify(this.metradoSeleccionado))
        );

        this.mostrarColrs = false;
        this.tempFormula = [];
        this.toaster.info('', 'Copiado', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else {
        this.toaster.error('Ninguna Fila Seleccionada', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
    } else {
      if (this.aceroSeleccionado?.id_metrado !== null) {
        this.arrayCopiadosAceros.push(
          JSON.parse(JSON.stringify(this.aceroSeleccionado))
        );
        this.mostrarColrs = false;
        this.tempFormula = [];
        this.toaster.info('', 'Copiado', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else {
        this.toaster.error('Ninguna Fila Seleccionada', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
    }
  }

  async eliminarRow() {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    if (this.verTablaSistema) {
      let arrayEliminar = [];
      if (this.habilitadoCopiar) {
        this.tablaSistema.map((ele, index) => {
          if (ele.editarEliminar || ele.editarCopiar) {
            arrayEliminar.push(index);
            ele.editarEliminar = false;
            ele.editarCopiar = false;
          }
        });
        this.habilitadoCopiar = false;
        this.todosCheck = false;
      } else {
        arrayEliminar.push(this.filaSel2);
      }
      if (!arrayEliminar.length) {
        this.toaster.error('Ninguna fila seleccionada', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
      arrayEliminar.sort((a, b) => b - a);
      for (let indice of arrayEliminar) {
        if (this.tablaSistema[indice].id_metrado !== null) {
          this.tablaSistemaProyecto[this.tablaSistema[indice].ind].indice =
            null;
        }

        this.tablaSistema.splice(indice, 1);
      }
      // this.tablaSistemaProyecto.map((ele, index) => (ele.ind = index));
      this.habilitadoMultiple = false;
      await this.actuaTablaSistema(filaSel);
      this.metradoSeleccionado = null;
      this.mostrarColrs = false;
      this.tempFormula = [];
      this.filaSel2 = null;
      this.stiloFormula();
    } else {
      let arrayEliminar = [];
      if (this.habilitadoCopiar) {
        this.tablaAceros.map((ele, index) => {
          if (ele.editarEliminar || ele.editarCopiar) {
            arrayEliminar.push(index);
            ele.editarEliminar = false;
            ele.editarCopiar = false;
          }
        });
        this.habilitadoCopiar = false;
        this.todosCheck = false;
      } else {
        arrayEliminar.push(this.filaSel3);
      }
      if (!arrayEliminar.length) {
        this.toaster.error('Ninguna fila seleccionada', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
      arrayEliminar.sort((a, b) => b - a);
      for (let indice of arrayEliminar) {
        this.tablaAcerosProyecto[this.tablaAceros[indice].ind].indice = null;
        this.tablaAceros.splice(indice, 1);
      }
      this.tablaAcerosProyecto.map((ele, index) => (ele.ind = index));
      this.habilitadoMultiple = false;
      await this.actuaTablaAceros(this.filaSel);
      this.aceroSeleccionado = null;
      this.mostrarColrs = false;
      this.tempFormula = [];
      this.filaSel3 = null;
    }
  }

  async limpiarTabla() {
    if (this.partidaSeleccionada?.unidad) {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se eliminará todos los registros de la tabla hoja de metrado sistema'
      );
      if (sw.isConfirmed) {
        this.buscando2 = true;
        let indOrdenado = this.tablaSistema
          .filter((ele) => ele.id_metrado !== null)
          .map((ele) => ele.ind);
        indOrdenado.sort((a, b) => b - a);
        for (let element of indOrdenado) {
          this.tablaSistemaProyecto[element].indice = null;
        }
        this.tablaSistema = [];
        for (let i = 0; i < this.cantidadFilasTabla - 1; i++) {
          const metrado = new metradoModelo(
            '',
            1,
            '',
            null,
            this.partidaSeleccionada?.indice,
            this.idProyecto
          );
          this.tablaSistema.push(metrado);
        }
        this.cantidadMetrados = 0;
        this.permitirCambio = true;
        this.filaSel2 = null;
        this.filaSel3 = null;
        this.metradoSeleccionado = null;
        this.mostrarColrs = false;
        this.tempFormula = [];
        this.tablaTitulo[this.filaSel].metrado = this.formsService.redondeo(
          0,
          this.dec_metrado
        );
        this.tablaTitulo[this.filaSel].ed_pre = 0;
        this.tablaTitulo[this.filaSel].permitirCambio = 1;
        this.tablaTitulo[this.filaSel].cant_metrado =
          this.formsService.redondeo(0, this.dec_metrado);
        this.tablaTitulo[this.filaSel].totalAceros = this.formsService.redondeo(
          0,
          this.dec_metrado
        );
        this.calcularMontosRowPrincipal(this.filaSel);
        this.calcularPorcentajeRegistro(this.tablaTitulo, 0);
        this.tablaTitulo[this.filaSel].editadoMetrado = 1;
        this.todosCheck = false;
        this.habilitadoCopiar = false;
        this.stiloFormula();
        this.tablaPrincipal[this.tablaTitulo[this.filaSel].ind] =
          this.tablaTitulo[this.filaSel];
        this.actualizarTemp();
        this.buscando2 = false;
      }
    }
  }

  async copiarFilaMultiple() {
    this.arrayCopiadosMetrado = [];
    this.arrayCopiadosAceros = [];
    this.celdasCopiadosMetrado = [];
    this.celdasCopiadosAceros = [];

    if (this.verTablaSistema) {
      let i = 0;
      this.tablaSistema.map((ele, index) => {
        if (ele.editarCopiar && ele.id_metrado !== null) {
          i++;
          ele.editarCopiar = false;
          this.arrayCopiadosMetrado.push(JSON.parse(JSON.stringify(ele)));
          this.tablaSistema[index].editarCopiar = false;
        }
        ele.editarCopiar = false;
      });
      if (!this.arrayCopiadosMetrado.length) {
        this.toaster.error('Ninguna fila seleccionada', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
      } else {
        this.habilitadoCopiar = false;
        this.todosCheck = false;
        this.filaSel2 = null;
        this.metradoSeleccionado = null;
        this.mostrarColrs = false;
        this.tempFormula = [];
        this.toaster.info('', 'Copiado', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
      }
    } else {
      let i = 0;
      this.tablaAceros.map((ele, index) => {
        if (ele.editarCopiar && ele.id_metrado !== null) {
          i++;
          ele.editarCopiar = false;
          this.arrayCopiadosAceros.push(JSON.parse(JSON.stringify(ele)));
          this.tablaAceros[index].editarCopiar = false;
        }
        ele.editarCopiar = false;
      });
      if (!this.arrayCopiadosAceros.length) {
        this.toaster.error('Ninguna fila seleccionada', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
      } else {
        this.habilitadoCopiar = false;
        this.todosCheck = false;
        this.filaSel3 = null;
        this.aceroSeleccionado = null;
        this.mostrarColrs = false;
        this.tempFormula = [];
        this.toaster.info('', 'Copiado', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
      }
    }
    // this.ultiCelda = null;
  }

  async habilitarMultiple() {
    if (this.verTablaSistema) {
      this.filaSel2 = null;
      this.metradoSeleccionado = null;
      this.mostrarColrs = false;
      this.tempFormula = [];
    } else {
      this.filaSel3 = null;
      // this.aceroSeleccionado = null;
    }
    this.todosCheck = false;
    this.habilitadoCopiar = true;
  }

  async cambioCheckboxCopiar(valor, index) {
    if (!valor) {
      this.todosCheck = false;
    }
    if (this.verTablaSistema) {
      const row = this.tablaSistema[index];
      this.tablaSistema[index].editarCopiar = valor;
      if (row.esMetrado && !row.estitulo && valor) {
        for (let i = index + 1; i < this.tablaSistema.length; i++) {
          if (!this.tablaSistema[i].esMetrado) {
            this.tablaSistema[i].editarCopiar = true;
          } else {
            if (
              this.tablaSistema[i].estitulo == 1 ||
              (this.tablaSistema[i].id_metrado !== null &&
                this.tablaSistema[i].esMetrado)
            ) {
              break;
            }
          }
        }
      } else if (!row.esMetrado && !row.estitulo && !valor) {
      } else if (row.esMetrado && row.estitulo == 1 && valor) {
        for (let i = index + 1; i < this.tablaSistema.length; i++) {
          if (this.tablaSistema[i].estitulo == 1) {
            break;
          }
          if (this.tablaSistema[i].id_metrado !== null) {
            this.tablaSistema[i].editarCopiar = true;
          }
        }
      } else if (row.esMetrado && !row.estitulo && !valor) {
      }
    } else {
      const row = this.tablaAceros[index];
      this.tablaAceros[index].editarCopiar = valor;
      if (row.esMetrado && !row.estitulo && valor) {
        for (let i = index + 1; i < this.tablaAceros.length; i++) {
          if (!this.tablaAceros[i].esMetrado) {
            this.tablaAceros[i].editarCopiar = true;
          } else {
            if (
              this.tablaAceros[i].estitulo == 1 ||
              (this.tablaAceros[i].id_metrado !== null &&
                this.tablaAceros[i].esMetrado)
            ) {
              break;
            }
          }
        }
      } else if (!row.esMetrado && !row.estitulo && !valor) {
      } else if (row.esMetrado && row.estitulo == 1 && valor) {
        for (let i = index + 1; i < this.tablaAceros.length; i++) {
          if (this.tablaAceros[i].estitulo == 1) {
            break;
          }
          if (this.tablaAceros[i].id_metrado !== null) {
            this.tablaAceros[i].editarCopiar = true;
          }
        }
      } else if (row.esMetrado && !row.estitulo && !valor) {
      }
    }
  }

  async cambioCheckboxTodos(tabla = 'tablaSistema') {
    if (this.todosCheck) {
      this[tabla].map((ele) => {
        if (ele.id_metrado !== null) {
          ele.editarCopiar = true;
        }
      });
    } else {
      this[tabla].map((ele) => {
        if (ele.id_metrado !== null) {
          ele.editarCopiar = false;
        }
      });
    }
  }

  async copiarFraccionTabla() {
    this.copiadoCeldas = true;
    this.inicioCeldaCopiado = null;
    this.finCeldaCopiado = null;
    this.metradoSeleccionado = null;
    this.filaSel2 = null;
  }

  evaluarPintadoCelda(fila, columna) {
    let pintar = false;
    let iniciox = null;
    let inicioy = null;
    let finx = null;
    let finy = null;
    if (this.copiadoCeldas && this.inicioCeldaCopiado && this.finCeldaCopiado) {
      if (this.inicioCeldaCopiado.columna > this.finCeldaCopiado.columna) {
        inicioy = this.finCeldaCopiado.columna;
        finy = this.inicioCeldaCopiado.columna;
      } else {
        finy = this.finCeldaCopiado.columna;
        inicioy = this.inicioCeldaCopiado.columna;
      }
      if (this.inicioCeldaCopiado.fila > this.finCeldaCopiado.fila) {
        iniciox = this.finCeldaCopiado.fila;
        finx = this.inicioCeldaCopiado.fila;
      } else {
        finx = this.finCeldaCopiado.fila;
        iniciox = this.inicioCeldaCopiado.fila;
      }
      if (
        iniciox <= fila &&
        fila <= finx &&
        inicioy <= columna &&
        columna <= finy
      ) {
        pintar = true;
      }
    } else if (
      this.copiadoCeldas &&
      this.inicioCeldaCopiado &&
      !this.finCeldaCopiado
    ) {
      if (
        fila == this.inicioCeldaCopiado.fila &&
        columna == this.inicioCeldaCopiado.columna
      ) {
        pintar = true;
      }
    }
    return pintar;
  }

  async guardarSeleccionadosCeldas(limpiar = false) {
    let iniciox = null;
    let inicioy = null;
    let finx = null;
    let finy = null;
    let arrayCopiar = [];
    if (this.copiadoCeldas && this.inicioCeldaCopiado && this.finCeldaCopiado) {
      if (this.inicioCeldaCopiado.columna > this.finCeldaCopiado.columna) {
        inicioy = this.finCeldaCopiado.columna;
        finy = this.inicioCeldaCopiado.columna;
      } else {
        finy = this.finCeldaCopiado.columna;
        inicioy = this.inicioCeldaCopiado.columna;
      }
      if (this.inicioCeldaCopiado.fila > this.finCeldaCopiado.fila) {
        iniciox = this.finCeldaCopiado.fila;
        finx = this.inicioCeldaCopiado.fila;
      } else {
        finx = this.finCeldaCopiado.fila;
        iniciox = this.inicioCeldaCopiado.fila;
      }
      const array = [
        'descripcion',
        'cantidad',
        'n_veces',
        'largo',
        'ancho',
        'altura',
      ];
      let validos = [];
      if (inicioy == finy) {
        validos = [array[inicioy]];
      } else {
        validos = array.slice(inicioy, finy + 1);
      }

      for (let i = iniciox; i <= finx; i++) {
        let obj = [];
        const row = this.tablaSistema[i];
        for (const key of validos) {
          obj.push(row[key]);
          if (limpiar) {
            row[key] = null;
          }
        }
        arrayCopiar.push(obj);
      }
    } else if (
      this.copiadoCeldas &&
      this.inicioCeldaCopiado &&
      !this.finCeldaCopiado
    ) {
      let obj = {};
      const valor =
        this.tablaSistema[this.inicioCeldaCopiado.fila][
          this.inicioCeldaCopiado.colname
        ];
      const arr = [valor];
      arrayCopiar.push(arr);
    } else {
      this.toaster.error('Ninguna celda seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
    this.arrayCopiadosMetrado = [];
    this.celdasCopiadosMetrado = arrayCopiar;
  }

  async pegarCopiados() {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    if (this.verTablaSistema) {
      if (this.filaSel2 == null && !this.ultiCelda) {
        this.toaster.error(
          'Seleccione una fila o celda valida para pegar',
          '',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          }
        );
        return;
      } else {
        const array = [
          'descripcion',
          'cantidad',
          'n_veces',
          'largo',
          'ancho',
          'altura',
        ];
        const indiceSel = JSON.parse(
          JSON.stringify(this.tablaTitulo[this.filaSel]?.indice)
        );

        if (this.celdasCopiadosMetrado.length) {
          const idx = array.indexOf(this.ultiCelda);
          const arrayValidos =
            idx == -1 ? array : array.slice(idx, array.length);
          let ind = JSON.parse(JSON.stringify(this.filaSel2));
          for (const iterator of this.celdasCopiadosMetrado) {
            if (ind > this.tablaSistema.length) {
              let metrado = new metradoModelo(
                null,
                1,
                '',
                0,
                indiceSel,
                this.idProyecto
              );
              for (let i = 0; i < iterator.length; i++) {
                metrado[arrayValidos[i]] = iterator[i];
              }
              metrado.id_metrado = 0;
              metrado.ind = null;
              this.tablaSistema.push(metrado);
            } else {
              let metrado = this.tablaSistema[ind];
              // metrado.id_metrado = 0;
              // metrado.ind = null;
              const omitir = ['id_metrado', 'indice'];
              for (let i = 0; i < iterator.length; i++) {
                metrado[arrayValidos[i]] = iterator[i];
              }
            }
            ind++;
          }
        } else if (this.arrayCopiadosMetrado.length) {
          let ind = JSON.parse(JSON.stringify(this.filaSel2));
          let celdasEspecificas = [];
          if (this.ultiCelda) {
            const idx = array.indexOf(this.ultiCelda);
            celdasEspecificas =
              idx == -1 ? array : array.slice(idx, array.length);
          }
          for (let iterator of this.arrayCopiadosMetrado) {
            iterator.id_metrado = 0;
            iterator.ind = null;
            iterator.indice = indiceSel;
            if (ind > this.tablaSistema.length) {
              if (!celdasEspecificas.length) {
                this.tablaSistema.push(iterator);
              } else {
                let metrado = new metradoModelo(
                  null,
                  1,
                  '',
                  0,
                  indiceSel,
                  this.idProyecto
                );
                let k = 0;
                for (const key of celdasEspecificas) {
                  metrado[key] = iterator[array[k]];
                  k++;
                }
                metrado.id_metrado = 0;
                metrado.ind = null;
                this.tablaSistema.push(metrado);
              }
            } else {
              if (!celdasEspecificas.length) {
                iterator.id_metrado = 0;
                iterator.ind = null;
                this.tablaSistema[ind] = iterator;
              } else {
                let metrado = this.tablaSistema[ind];
                let k = 0;
                if (!metrado) {
                  metrado = new metradoModelo(
                    null,
                    1,
                    '',
                    0,
                    indiceSel,
                    this.idProyecto
                  );
                  for (const key of celdasEspecificas) {
                    metrado[key] = iterator[array[k]];
                    k++;
                  }
                  metrado.id_metrado = 0;
                  metrado.ind = null;
                  this.tablaSistema.push(metrado);
                } else {
                  for (const key of celdasEspecificas) {
                    metrado[key] = iterator[array[k]];
                    k++;
                  }
                  // metrado.id_metrado = 0;
                  // metrado.ind = null;
                  this.tablaSistema[ind] = metrado;
                }
              }
            }
            ind++;
          }
          this.ultiCelda = null;
        } else {
          this.toaster.info('Ningun dato  copiada', '', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        }
      }
      await this.actuaTablaSistema(filaSel);
      this.stiloFormula();
      // this.guardarTablaTemporal('cortarSeleccionados');
      this.ultiCelda = null;
      this.arrayCopiadosAceros = [];
      this.arrayCopiadosMetrado = [];
      this.celdasCopiadosAceros = [];
      this.celdasCopiadosMetrado = [];
    } else {
      if (this.filaSel3 == null && !this.ultiCelda) {
        this.toaster.error(
          'Seleccione una fila o celda valida para pegar',
          '',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          }
        );
        return;
      } else {
        const array = [
          'descripcion',
          'cantidad',
          'elementos',
          'longitud',
          'ancho',
          'pesodiametro',
        ];
        const indiceSel = JSON.parse(
          JSON.stringify(this.tablaTitulo[this.filaSel]?.indice)
        );

        if (this.arrayCopiadosAceros.length) {
          let ind = JSON.parse(JSON.stringify(this.filaSel3));
          let celdasEspecificas = [];
          if (this.ultiCelda) {
            const idx = array.indexOf(this.ultiCelda);
            celdasEspecificas =
              idx == -1 ? array : array.slice(idx, array.length);
          }

          for (let iterator of this.arrayCopiadosAceros) {
            iterator.id_metrado = 0;
            iterator.ind = null;
            iterator.indice = indiceSel;
            if (ind > this.tablaAceros.length) {
              if (!celdasEspecificas.length) {
                this.tablaAceros.push(iterator);
              } else {
                let metrado = new aceroModelo(
                  null,
                  1,
                  null,
                  null,
                  indiceSel,
                  this.idProyecto
                );
                let k = 0;
                for (const key of celdasEspecificas) {
                  metrado[key] = iterator[array[k]];
                  k++;
                }
                metrado.ind = null;
                metrado.id_metrado = 0;
                this.tablaAceros.push(metrado);
              }
            } else {
              if (!celdasEspecificas.length) {
                iterator.ind = null;
                iterator.id_metrado = 0;
                this.tablaAceros[ind] = iterator;
              } else {
                let metrado = this.tablaAceros[ind];
                let k = 0;
                if (!metrado) {
                  metrado = new aceroModelo(
                    null,
                    1,
                    null,
                    null,
                    indiceSel,
                    this.idProyecto
                  );
                  for (const key of celdasEspecificas) {
                    metrado[key] = iterator[array[k]];
                    k++;
                  }
                  metrado.ind = null;
                  metrado.id_metrado = 0;
                  this.tablaAceros.push(metrado);
                } else {
                  for (const key of celdasEspecificas) {
                    metrado[key] = iterator[array[k]];
                    k++;
                  }
                  metrado.ind = null;
                  metrado.id_metrado = 0;
                  this.tablaAceros[ind] = metrado;
                }
              }
            }
            ind++;
          }
          this.ultiCelda = null;
        } else {
          this.toaster.info('Ningun dato  copiada', '', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 2000,
          });
          return;
        }
      }
      await this.actuaTablaAceros(this.filaSel);
      // this.guardarTablaTemporal('cortarSeleccionados');
      this.ultiCelda = null;
      this.arrayCopiadosAceros = [];
      this.arrayCopiadosMetrado = [];
      this.celdasCopiadosAceros = [];
      this.celdasCopiadosMetrado = [];
    }
  }

  async cortarSeleccionados() {
    let arrayCortados = [];
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    if (this.verTablaSistema) {
      let indicesEliminar = [];
      if (this.habilitadoCopiar) {
        this.tablaSistema = this.tablaSistema.map((ele) => {
          if (ele.editarCopiar) {
            indicesEliminar.push(ele.ind);
            ele.ind = null;
            ele.id_metrado = 0;
            ele.editarCopiar = false;
            arrayCortados.push(JSON.parse(JSON.stringify(ele)));

            const metrado = new metradoModelo(
              null,
              1,
              '',
              null,
              this.tablaTitulo[filaSel]?.indice,
              this.idProyecto
            );
            metrado.ind = null;
            metrado.id_metrado = null;
            ele = metrado;
          }
          return ele;
        });
      } else {
        if (this.copiadoCeldas) {
          await this.guardarSeleccionadosCeldas(true);
          this.copiadoCeldas = false;
        } else {
          indicesEliminar.push(this.metradoSeleccionado.ind);
          const metrado = new metradoModelo(
            null,
            1,
            '',
            null,
            this.tablaTitulo[filaSel]?.indice,
            this.idProyecto
          );
          metrado.ind = null;
          metrado.id_metrado = null;
          this.metradoSeleccionado.editarCopiar = false;
          arrayCortados.push(
            JSON.parse(JSON.stringify(this.metradoSeleccionado))
          );
          this.metradoSeleccionado = null;
          this.tablaSistema[this.filaSel2] = metrado;
        }
        this.habilitadoCopiar = false;
      }

      this.arrayCopiadosMetrado = arrayCortados;
      indicesEliminar.sort((a, b) => b - a);
      for (const indice of indicesEliminar) {
        this.tablaSistemaProyecto[indice].indice = null;
      }
      await this.actuaTablaSistema(filaSel);
      this.stiloFormula();
      this.ultiCelda = null;
      this.habilitadoCopiar = false;
    } else {
      let indicesEliminar = [];
      if (this.habilitadoCopiar) {
        this.tablaAceros = this.tablaAceros.map((ele) => {
          if (ele.editarCopiar) {
            indicesEliminar.push(ele.ind);
            ele.ind = null;
            ele.id_metrado = 0;
            ele.editarCopiar = false;
            arrayCortados.push(JSON.parse(JSON.stringify(ele)));

            const metrado = new aceroModelo(
              null,
              1,
              null,
              null,
              this.partidaSeleccionada?.indice,
              this.idProyecto
            );
            ele = metrado;
          }
          return ele;
        });
      } else {
        if (this.copiadoCeldas) {
          await this.guardarSeleccionadosCeldas(true);
          this.copiadoCeldas = false;
        } else {
          this.aceroSeleccionado.editarCopiar = false;
          arrayCortados.push(
            JSON.parse(JSON.stringify(this.aceroSeleccionado))
          );
          indicesEliminar.push(this.aceroSeleccionado.ind);
          const metrado = new aceroModelo(
            null,
            1,
            null,
            null,
            this.partidaSeleccionada?.indice,
            this.idProyecto
          );
          this.aceroSeleccionado = null;
          this.tablaAceros[this.filaSel3] = metrado;
        }
        this.habilitadoCopiar = false;
      }
      await this.actuaTablaAceros(this.filaSel);
      this.stiloFormula();
      this.arrayCopiadosAceros = arrayCortados;
      indicesEliminar.sort((a, b) => b - a);
      for (const indice of indicesEliminar) {
        this.tablaAcerosProyecto[indice].indice = null;
      }
      this.ultiCelda = null;
      this.habilitadoCopiar = false;
    }
  }

  async limpiarCopiados() {
    if (this.formulaCopiada !== null) {
      this.formulaCopiada = null;
    }
    this.habilitadoCopiar = false;
    this.arrayCopiadosAceros = [];
    this.arrayCopiadosMetrado = [];
    this.CancelarCopiarFraccionTabla();
    this.tablaSistema = this.tablaSistema.map((ele) => {
      ele.editarCopiar = false;
      ele.editarEliminar = false;
      return ele;
    });
    this.tablaAceros = this.tablaAceros.map((ele) => {
      ele.editarCopiar = false;
      ele.editarEliminar = false;
      return ele;
    });
    this.todosCheck = false;
  }

  async CancelarCopiarFraccionTabla() {
    this.copiadoCeldas = false;
    this.inicioCeldaCopiado = null;
    this.finCeldaCopiado = null;
    this.metradoSeleccionado = null;
    this.filaSel2 = null;
    this.todosCheck = false;
  }

  async opcionPegadoExterno(tipo) {
    this.tipoCopiado = tipo;
    this.seleccionCelda = true;
    this.toaster.info(
      'Seleccione una celda para realizar el pegado y despues pegue el contenido con "CTRL+V"',
      'Éxito',
      {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 6000,
      }
    );
  }

  cancelarCopiadoExt() {
    this.valorCopiado = null;
    this.seleccionCelda = false;
    // this.celdaInicio = null;
    // this.opcionHabilitarSistema = null;
    this.tipoCopiado = 0;
    // const input = document.getElementById('copiado');
    // input.focus({
    //   preventScroll: true,
    // });
  }

  @HostListener('document:keydown.arrowup', ['$event'])
  async desplazartop() {
    if (this.filaSel2 !== null && this.verTablaSistema) {
      const row = JSON.parse(JSON.stringify(this.tablaSistema[this.filaSel2]));
      const arr = [
        'editardescripcion',
        'editarcantidad',
        'editarn_veces',
        'editarlargo',
        'editarancho',
        'editaraltura',
      ];
      for (const element of arr) {
        if (row[element]) {
          return;
        }
      }
      if (this.filaSel2 > 0) {
        const encontrado = await this.tablaSistema.find(
          (ele) => ele.tieneAceros && ele.id_metrado !== null
        );
        if (encontrado) {
          return;
        }
        let sgteValido = null;
        let index = this.filaSel2 - 1;
        while (!sgteValido && index >= 0) {
          if (this.tablaSistema[index].mostrar) {
            sgteValido = true;
          } else {
            index--;
          }
        }
        // this.tablaSistema[index]['editar' + this.opcionHabilitarSistema] = 1;
        this.filaSel2 = index;
        this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
        this.stiloFormula();
      } else {
        return;
      }
    } else if (this.filaSel3 !== null && !this.verTablaSistema) {
      const row = JSON.parse(JSON.stringify(this.tablaAceros[this.filaSel3]));
      const arr = [
        'editardescripcion',
        'editarcantidad',
        'editarelementos',
        'editarlongitud',
        'editarpesodiametro',
        'editardiametro',
      ];
      for (const element of arr) {
        if (row[element]) {
          return;
        }
      }
      if (this.filaSel3 > 0) {
        let sgteValido = null;
        let index = this.filaSel3 - 1;
        while (!sgteValido && index >= 0) {
          if (this.tablaAceros[index].mostrar) {
            sgteValido = true;
          } else {
            index--;
          }
        }
        // this.tablaSistema[index]['editar' + this.opcionHabilitarSistema] = 1;
        this.filaSel3 = index;
        this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
      } else {
        return;
      }
    }
  }
  @HostListener('document:keydown.arrowdown', ['$event'])
  async desplazarbot() {
    if (this.verTablaSistema && this.filaSel2 !== null) {
      const row = JSON.parse(JSON.stringify(this.tablaSistema[this.filaSel2]));
      const arr = [
        'editardescripcion',
        'editarcantidad',
        'editarn_veces',
        'editarlargo',
        'editarancho',
        'editaraltura',
      ];
      for (const element of arr) {
        if (row[element]) {
          return;
        }
      }
      if (this.filaSel2 + 1 < this.tablaSistema.length) {
        const encontrado = await this.tablaSistema.find(
          (ele) => ele.tieneAceros && ele.id_metrado !== null
        );
        if (encontrado) {
          return;
        }
        let sgteValido = null;
        let index = this.filaSel2 + 1;
        while (!sgteValido && index < this.tablaSistema.length) {
          if (this.tablaSistema[index].mostrar) {
            sgteValido = true;
          } else {
            index++;
          }
        }

        this.filaSel2 = index;
        this.metradoSeleccionado = this.tablaSistema[this.filaSel2];
        this.stiloFormula();
      }
      // setTimeout(() => {
      //   const contenedor = document.getElementById('contenedor'); // Cambia por el ID de tu contenedor
      //   const elemento = document.getElementById(`ts-${this.filaSel2}`); // Cambia por el ID que uses para cada fila

      //   if (contenedor && elemento) {
      //     const contenedorRect = contenedor.getBoundingClientRect();
      //     const elementoRect = elemento.getBoundingClientRect();

      //     // Calcular la posición central
      //     const elementoOffset = elementoRect.top - contenedorRect.top;
      //     const scrollPos =
      //       elementoOffset -
      //       contenedorRect.height / 2 +
      //       elementoRect.height / 2;

      //     contenedor.scrollTo({
      //       top: scrollPos,
      //       behavior: 'smooth', // Para un scroll suave
      //     });
      //   }
      // }, 0); //
    } else if (!this.verTablaSistema && this.filaSel3 !== null) {
      const row = JSON.parse(JSON.stringify(this.tablaAceros[this.filaSel3]));
      const arr = [
        'editardescripcion',
        'editarcantidad',
        'editarelementos',
        'editarlongitud',
        'editarpesodiametro',
        'editardiametro',
      ];
      for (const element of arr) {
        if (row[element]) {
          return;
        }
      }
      if (this.filaSel3 + 1 < this.tablaAceros.length) {
        const encontrado = await this.tablaAceros.find(
          (ele) => ele.tieneAceros && ele.id_metrado !== null
        );
        if (encontrado) {
          return;
        }
        let sgteValido = null;
        let index = this.filaSel3 + 1;
        while (!sgteValido && index < this.tablaAceros.length) {
          if (this.tablaAceros[index].mostrar) {
            sgteValido = true;
          } else {
            index++;
          }
        }

        this.filaSel3 = index;
        this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
        this.stiloFormula();
      }
      // setTimeout(() => {
      //   const contenedor = document.getElementById('contenedor2'); // Cambia por el ID de tu contenedor
      //   const elemento = document.getElementById(`ta-${this.filaSel3}`); // Cambia por el ID que uses para cada fila

      //   if (contenedor && elemento) {
      //     const contenedorRect = contenedor.getBoundingClientRect();
      //     const elementoRect = elemento.getBoundingClientRect();

      //     // Calcular la posición central
      //     const elementoOffset = elementoRect.top - contenedorRect.top;
      //     const scrollPos =
      //       elementoOffset -
      //       contenedorRect.height / 2 +
      //       elementoRect.height / 2;

      //     contenedor.scrollTo({
      //       top: scrollPos,
      //       behavior: 'smooth', // Para un scroll suave
      //     });
      //   }
      // }, 0);
    }
  }

  @HostListener('document:keydown.control', ['$event'])
  async handleKey(event: KeyboardEvent) {
    const clipboardValido = !!navigator.clipboard;
    this.valorCopiado = null;
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    if (filaSel2 !== null && this.verTablaSistema) {
      const metCopia = JSON.parse(JSON.stringify(this.tablaSistema[filaSel2]));
      const array = [
        'editardescripcion',
        'editarcantidad',
        'editarn_veces',
        'editarlargo',
        'editarancho',
        'editaraltura',
      ];
      const array2 = [
        'descripcion',
        'cantidad',
        'n_veces',
        'largo',
        'ancho',
        'altura',
      ];
      this.celdaFocus = null;
      if (filaSel2 !== null) {
        let i = 0;
        for (const element of array) {
          if (metCopia[element]) {
            this.celdaFocus = array2[i];
            break;
          }
          i++;
        }
      }
      if (!clipboardValido) {
        const input = document.getElementById('copiado');
        setTimeout(() => {
          if (input) {
            input.focus();
          }
        }, 0);
      }
    } else if (this.filaSel3 !== null && !this.verTablaSistema) {
      const metCopia = JSON.parse(
        JSON.stringify(this.tablaAceros[this.filaSel3])
      );
      const array = [
        'editardescripcion',
        'editarcantidad',
        'editarelementos',
        'editarlongitud',
        'editarpesodiametro',
      ];
      const array2 = [
        'descripcion',
        'cantidad',
        'elementos',
        'longitud',
        'pesodiametro',
      ];
      this.celdaFocus = null;
      if (this.filaSel3 !== null) {
        let i = 0;
        for (const element of array) {
          if (metCopia[element]) {
            this.celdaFocus = array2[i];
            break;
          }
          i++;
        }
      }
      if (!clipboardValido) {
        const input = document.getElementById('copiado2');
        setTimeout(() => {
          if (input) {
            input.focus();
          }
        }, 0);
      }
    }
  }

  @HostListener('document:paste', ['$event'])
  async handlePaste(event: ClipboardEvent) {
    const clipboardValido = !!navigator.clipboard;
    if (!this.partidaSeleccionada?.unidad || this.solover) {
      this.valorCopiado = null;
      return;
    }

    if (this.filaSel2 == null && this.verTablaSistema) {
      this.valorCopiado = null;
      this.toaster.error(
        'Seleccione una fila de la tabla hoja de metrado para pegar',
        'Error',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    } else if (this.filaSel3 == null && !this.verTablaSistema) {
      this.valorCopiado = null;
      this.toaster.error(
        'Seleccione una fila de la tabla hoja de acero para pegar',
        'Error',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    } else if (this.verTablaSistema && this.bloquearBotones) {
      this.valorCopiado = null;
      return;
    }
    this.mostrar_carga_todo2 = true;
    if (!clipboardValido) {
      const string = this.verTablaSistema ? 'copiado' : 'copiado2';
      const input = document.getElementById(string);
      setTimeout(async () => {
        input.blur();
        var c = (<HTMLInputElement>document.getElementById(string)).value;
        const paracopiar = JSON.parse(JSON.stringify(c));
        this.valorCopiado = null;
        if (this.partidaSeleccionada.unidad && this.filaSel !== null) {
          await this.textoCopSplit(paracopiar, true);
        }
      }, 10);
    } else {
      event.preventDefault();
      const text = await navigator.clipboard
        ?.readText()
        ?.then((copiedText) => {
          return copiedText;
        })
        .catch((e) => {
          return null;
        });
      if (this.partidaSeleccionada.unidad && this.filaSel !== null) {
        this.textoCopSplit(text, true);
      }
    }
  }

  @HostListener('document:copy', ['$event'])
  handleCopy(event: ClipboardEvent): void {
    // if (this.celdaFocus) {
    //   let valorcopiado = null;
    //   if (this.filaSel2 !== null && this.verTablaSistema) {
    //     valorcopiado = this.tablaSistema[this.filaSel2][this.celdaFocus];
    //   } else if (this.filaSel3 !== null && !this.verTablaSistema) {
    //     valorcopiado = this.tablaAceros[this.filaSel3][this.celdaFocus];
    //   }
    //   if (valorcopiado) {
    //     navigator.clipboard
    //       .writeText(valorcopiado)
    //       .then(() => {
    //         this.celdaFocus = null;
    //       })
    //       .catch((err) => {
    //         this.celdaFocus = null;
    //       });
    //   }
    // }
    const clipboardValido = !!navigator.clipboard;
    if (!clipboardValido) {
      if (this.celdaFocus) {
        let valorcopiado = null;
        if (this.filaSel2 !== null && this.verTablaSistema) {
          valorcopiado = this.tablaSistema[this.filaSel2][this.celdaFocus];
        } else if (this.filaSel3 !== null && !this.verTablaSistema) {
          valorcopiado = this.tablaAceros[this.filaSel3][this.celdaFocus];
        }

        if (valorcopiado) {
          // Usar un elemento oculto para copiar el texto
          const textArea = document.createElement('textarea');
          textArea.value = valorcopiado;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            this.celdaFocus = null; // Resetea celdaFocus después de copiar
          } catch (err) {
            console.error('Error al copiar el texto: ', err);
          } finally {
            document.body.removeChild(textArea); // Elimina el textarea
          }
        }
      }
    } else {
    }
  }

  async textoCopSplit(text, tipo = false) {
    try {
      const filaSel = JSON.parse(JSON.stringify(this.filaSel));
      const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      const indiceSel = JSON.parse(
        JSON.stringify(this.partidaSeleccionada.indice)
      );
      if (this.verTablaSistema) {
        let opciones = [];
        let opcion = null;
        const array = [
          'descripcion',
          'cantidad',
          'n_veces',
          'largo',
          'ancho',
          'altura',
        ];
        if (!this.celdaFocus) {
          if (this.metradoSeleccionado.id_metrado !== null) {
            if (this.metradoSeleccionado.esMetrado == 1) {
              opciones = [
                'Bajo la agrupacion seleccionada',
                'Reemplazar seleccionado',
              ];
            } else {
              opciones = ['Bajo la agrupacion seleccionada'];
            }
            const sw = await SwalService.optionokcancel(
              opciones,
              'Opción pegado',
              '0'
            );
            if (sw !== undefined) {
              opcion = Number(sw);
            } else {
              this.valorCopiado = null;
              this.mostrar_carga_todo2 = false;
              this.mostrar_carga_todo = false;
              return;
            }
          } else {
            opcion = 0;
          }
        } else {
          opcion = Number(1);
        }
        let arrayStructura = [];
        let completo = [];
        const celda = this.celdaFocus ? this.celdaFocus : 'descripcion';
        const idx = array.indexOf(celda);
        const arrayValidos = array.slice(idx == -1 ? 0 : idx, array.length);
        if (tipo) {
          const a = text.split(/(\n\r|\n|\r)/gm);
          const splitText = text.split('\n');
          splitText.map((ele) => {
            if (ele !== '') {
              const sp = ele.split('\t');
              const arrayLimpio = sp.map(item => item?.trim());
              completo.push(arrayLimpio);
            }
          });
        } else {
          completo = text.split('	');
        }
        let msjRecorte = false;
        for (const iterator of completo) {
          var fila = {};
          let i = 0;
          for (const key of arrayValidos) {
            // if (iterator[i] && iterator[i].length > 50) {
            //   iterator[i] = iterator[i].slice(0, 49);
            //   msjRecorte = true;
            // }
            if (
              iterator[i] !== null &&
              iterator[i] !== undefined &&
              iterator[i] !== ''
            ) {
              if (!isNaN(iterator[i]) && iterator[i].trim() !== '') {
                const partes = iterator[i].split('.');
                if (partes[0].length > 8) {
                  iterator[i] = '';
                  msjRecorte = true;
                }
              } else {
                const cantLimite = (key == 'descripcion' ? 200 : 80) 
                if (iterator[i].length > cantLimite) {
                  iterator[i] = '';
                  msjRecorte = true;
                }
              }
            }
            const splitPunto = iterator[i] ? iterator[i].split(',') : [];
            let valor = null;
            if (splitPunto.length == 2) {
              if (
                !isNaN(Number(splitPunto[0])) &&
                !isNaN(Number(splitPunto[1]))
              ) {
                valor = splitPunto.join('.');
              } else {
                valor = iterator[i];
              }
            } else {
              valor = iterator[i];
            }
            fila[key] = valor;
            i++;
          }
          arrayStructura.push(fila);
        }
        let indice = null;
        const valido = await this.sgteValido(filaSel2 + 1, 'tablaSistema');
        if (opcion) {
          indice = JSON.parse(JSON.stringify(filaSel2));
        } else {
          //bajo la seleccion
          if (valido.index !== null) {
            let inicio = filaSel2 !== -1 ? filaSel2 : 0;
            if (this.metradoSeleccionado.id_metrado == null) {
              inicio = JSON.parse(JSON.stringify(filaSel2));
            }
            for (let i = inicio + 1; i < this.tablaSistema.length; i++) {
              let row = this.tablaSistema[i];
              if ((row.id_metrado !== null && row.esMetrado) || row.estitulo) {
                if (indice == null) {
                  indice = i;
                }
                break;
              } else if (
                row.id_metrado !== null &&
                !row.esMetrado &&
                !row.estitulo
              ) {
                indice = i + 1;
              } else if (row.id_metrado == null && indice == null) {
                indice = i;
              }
            }
          } else {
            indice = JSON.parse(JSON.stringify(filaSel2));
          }
        }
        let k = 0;
        for (const row of arrayStructura) {
          let metrado = null;
          if (opcion) {
            let omitir = false;
            if (
              this.tablaSistema[indice + k] &&
              this.tablaSistema[indice + k]?.id_metrado !== null &&
              indice + k <= this.tablaSistema.length
            ) {
              metrado = JSON.parse(
                JSON.stringify(this.tablaSistema[indice + k])
              );
              if (metrado.id_metrado !== null) {
                omitir = true;
              }
            } else {
              metrado = new metradoModelo(
                '',
                1,
                '',
                0,
                indiceSel,
                this.idProyecto
              );
            }
            let arromitir = ['id_metrado', 'indice'];
            for (let key in row) {
              if (omitir && arromitir.includes(key)) {
              } else {
                if (row[key] !== undefined) {
                  metrado[key] = row[key];
                }
              }
            }

            if (indice + k <= this.tablaSistema.length) {
              this.tablaSistema[indice + k] = metrado;
            } else {
              this.tablaSistema.push(metrado);
            }
          } else {
            metrado = new metradoModelo(
              '',
              1,
              '',
              0,
              indiceSel,
              this.idProyecto
            );
            let j = 0;
            for (let key in row) {
              if (row[key] !== undefined) {
                metrado[key] = row[key];
              }
            }
            metrado.id_metrado = 0;
            metrado.ind = null;
            if (indice + k <= this.tablaSistema.length) {
              this.tablaSistema.splice(indice + k, 0, metrado);
            } else {
              this.tablaSistema.push(metrado);
            }
          }
          k++;
        }
        await this.actuaTablaSistema(filaSel);
        this.stiloFormula();
        if (msjRecorte) {
          this.toaster.warning(
            'Se omitieron valores (textos mayores a 50 caracteres 0 numericos con la parte entera mayores a 8 digitos)',
            'Advertencia',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 7000,
            }
          );
        }
      } else {
        let opciones = [];
        let opcion = null;
        const array = [
          'descripcion',
          'cantidad',
          'elementos',
          'longitud',
          'pesodiametro',
        ];
        if (!this.celdaFocus) {
          if (this.aceroSeleccionado.id_metrado !== null) {
            if (this.aceroSeleccionado.esMetrado == 1) {
              opciones = [
                'Bajo la agrupacion seleccionada',
                'Reemplazar seleccionado',
              ];
            } else {
              opciones = ['Bajo la agrupacion seleccionada'];
            }
            const sw = await SwalService.optionokcancel(
              opciones,
              'Opción pegado',
              '0'
            );
            if (sw !== undefined) {
              opcion = Number(sw);
            } else {
              this.valorCopiado = null;
              return;
            }
          } else {
            opcion = 0;
          }
        } else {
          opcion = Number(1);
        }
        let arrayStructura = [];
        let completo = [];
        const celda = this.celdaFocus ? this.celdaFocus : 'descripcion';
        const idx = array.indexOf(celda);
        const arrayValidos = array.slice(idx == -1 ? 0 : idx, array.length);
        if (tipo) {
          const a = text.split(/(\n\r|\n|\r)/gm);
          const splitText = text.split('\n');
          splitText.map((ele) => {
            if (ele !== '') {
              const sp = ele.split('\t');
              const arrayLimpio = sp.map(item => item.trim());
              completo.push(arrayLimpio);
            }
          });
        } else {
          completo = text.split('	');
        }
        let msjRecorte = false;
        for (const iterator of completo) {
          var fila = {};
          let i = 0;
          for (const key of arrayValidos) {
            // if (iterator[i] && iterator[i].length > 50) {
            //   console.log('iterator[i]', iterator[i].length);
            //   iterator[i] = iterator[i].slice(0, 49);
            //   msjRecorte = true;
            // }
            if (
              iterator[i] !== null &&
              iterator[i] !== undefined &&
              iterator[i] !== ''
            ) {
              if (!isNaN(iterator[i]) && iterator[i].trim() !== '') {
                iterator[i] = iterator[i].trim()
                const partes = iterator[i].split('.');
                if (partes[0].length > 8) {
                  iterator[i] = '';
                  msjRecorte = true;
                }
              } else {
                const cantLimite = (key == 'descripcion' ? 200 : 80) 
                if (iterator[i].length > cantLimite) {
                  iterator[i] = '';
                  msjRecorte = true;
                }
              }
            }
            const splitPunto = iterator[i] ? iterator[i].split(',') : [];
            let valor = null;
            if (splitPunto.length == 2) {
              if (
                !isNaN(Number(splitPunto[0])) &&
                !isNaN(Number(splitPunto[1]))
              ) {
                valor = splitPunto.join('.');
              } else {
                valor = iterator[i];
              }
            } else {
              valor = iterator[i];
            }
            fila[key] = valor;
            i++;
          }
          arrayStructura.push(fila);
        }
        let indice = null;
        const valido = await this.sgteValido(this.filaSel3 + 1, 'tablaAceros');
        if (opcion) {
          indice = JSON.parse(JSON.stringify(this.filaSel3));
        } else {
          //bajo la seleccion
          if (valido.index !== null) {
            let inicio = this.filaSel3 !== -1 ? this.filaSel3 : 0;
            if (this.aceroSeleccionado.id_metrado == null) {
              inicio = JSON.parse(JSON.stringify(this.filaSel3));
            }
            for (let i = inicio + 1; i < this.tablaAceros.length; i++) {
              let row = this.tablaAceros[i];
              if ((row.id_metrado !== null && row.esMetrado) || row.estitulo) {
                if (indice == null) {
                  indice = i;
                }
                break;
              } else if (
                row.id_metrado !== null &&
                !row.esMetrado &&
                !row.estitulo
              ) {
                indice = i + 1;
              } else if (row.id_metrado == null && indice == null) {
                indice = i;
              }
            }
          } else {
            indice = JSON.parse(JSON.stringify(this.filaSel3));
          }
        }
        let k = 0;
        for (const row of arrayStructura) {
          let metrado = null;
          if (opcion) {
            let omitir = false;
            if (
              this.tablaAceros[indice + k] &&
              this.tablaAceros[indice + k]?.id_metrado !== null &&
              indice + k <= this.tablaAceros.length
            ) {
              metrado = JSON.parse(
                JSON.stringify(this.tablaAceros[indice + k])
              );
              if (metrado.id_metrado !== null) {
                omitir = true;
              }
            } else {
              metrado = new aceroModelo(
                null,
                1,
                null,
                null,
                indiceSel,
                this.idProyecto
              );
            }
            let arromitir = ['id_metrado', 'indice'];
            for (let key in row) {
              if (omitir && arromitir.includes(key)) {
              } else {
                if (row[key] !== undefined) {
                  metrado[key] = row[key];
                }
              }
            }

            if (indice + k <= this.tablaAceros.length) {
              this.tablaAceros[indice + k] = metrado;
            } else {
              this.tablaAceros.push(metrado);
            }
          } else {
            metrado = new aceroModelo(
              null,
              1,
              null,
              null,
              indiceSel,
              this.idProyecto
            );
            let j = 0;
            for (let key in row) {
              if (row[key] !== undefined) {
                metrado[key] = row[key];
              }
            }
            metrado.id_metrado = 0;
            metrado.ind = null;
            if (indice + k <= this.tablaAceros.length) {
              this.tablaAceros.splice(indice + k, 0, metrado);
            } else {
              this.tablaAceros.push(metrado);
            }
          }
          k++;
        }
        if (msjRecorte) {
          this.toaster.warning(
            'Se omitieron valores (texto mayor a 200 caracteres en descripcion o 80 caracteres en los demas, en caso sea  numerico con la parte entera mayores a 8 digitos)',
            'Advertencia',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 7000,
            }
          );
        }
        await this.actuaTablaAceros(this.filaSel);
      }
      this.seleccionCelda = false;
      this.celdaFocus = null;
      this.tipoCopiado = 0;
      this.mostrar_carga_todo2 = false;
    } catch (e) {
      SwalService.error(e);
      this.mostrar_carga_todo2 = false;
      console.log(e);
    }
  }

  async actuaTablaSistema(filaSel) {
    this.modificandofila = true;
    let j = 0;
    let k = 0;
    let existeMetrado = false;
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    for (let element of this.tablaSistema) {
      if (
        element.descripcion !== null ||
        element.cantidad !== null ||
        element.n_veces !== null ||
        element.largo !== null ||
        element.ancho !== null ||
        element.altura !== null ||
        element.id_metrado !== null
      ) {
        element.id_metrado = j;
        // element.indice = this.tablaTitulo[filaSel].indice;
        j++;
        if (element.ind == null) {
          element.ind = this.tablaSistemaProyecto.length;
          this.tablaSistemaProyecto.push(element);
        }
      }
      if (
        !this.tablaSistema[k].esMetrado &&
        !this.tablaSistema[k].estitulo &&
        !existeMetrado
      ) {
        this.tablaSistema[k].esMetrado = 1;
        existeMetrado = true;
      } else if (this.tablaSistema[k].estitulo == 1) {
        existeMetrado = false;
      }
      if (this.tablaSistema[k].esMetrado && !this.tablaSistema[k].estitulo) {
        const sgteValido = await this.sgteValido(k + 1, 'tablaSistema');
        if (
          sgteValido?.sgteExistente &&
          !sgteValido?.sgteExistente?.esMetrado
        ) {
          this.tablaSistema[k].tieneSubmetrado = 1;
        } else {
          this.tablaSistema[k].tieneSubmetrado = 0;
        }
      } else {
        if (
          this.tablaSistema[k].esMetrado &&
          this.tablaSistema[k].estitulo == 1
        ) {
          const sgteValido = await this.sgteValido(k + 1, 'tablaSistema');
          if (
            sgteValido?.sgteExistente &&
            !sgteValido?.sgteExistente?.esMetrado
          ) {
            await this.convertirSgtesSubAMert(k + 1, 'tablaSistema');
          }
        }
        this.tablaSistema[k].tieneSubmetrado = 0;
      }
      if (this.tablaSistema[k].esMetrado && !this.tablaSistema[k].estitulo) {
        existeMetrado = true;
      }
      k++;
    }
    let sumaTotal = 0;
    let sumaGrupo = 0;
    this.cantidadMetrados = 0;
    for (let i = this.tablaSistema.length - 1; i >= 0; i--) {
      let row = this.tablaSistema[i];
      if (row.id_metrado !== null) {
        let sumarow = 0;
        if (!row.tieneAceros && !row.estitulo) {
          let array = [];
          const largo =
            (await this.isNumber(row.largo)) &&
            row.largo !== null &&
            row.largo !== ''
              ? Number(row.largo)
              : null;
          const ancho =
            (await this.isNumber(row.ancho)) &&
            row.ancho !== null &&
            row.ancho !== ''
              ? Number(row.ancho)
              : null;
          const altura =
            (await this.isNumber(row.altura)) &&
            row.altura !== null &&
            row.altura !== ''
              ? Number(row.altura)
              : null;
          const cantidad =
            (await this.isNumber(row.cantidad)) &&
            row.cantidad !== null &&
            row.cantidad !== ''
              ? Number(row.cantidad)
              : null;
          const n_veces =
            (await this.isNumber(row.n_veces)) &&
            row.n_veces !== null &&
            row.n_veces !== ''
              ? Number(row.n_veces)
              : null;
          if (
            this.isNumber(row.largo) ||
            this.isNumber(row.ancho) ||
            this.isNumber(row.altura) ||
            this.isNumber(row.cantidad) ||
            this.isNumber(row.n_veces)
          ) {
            const array2 = [
              { key: cantidad, value: 'C' },
              { key: n_veces, value: 'D' },
              { key: largo, value: 'E' },
              { key: ancho, value: 'F' },
              { key: altura, value: 'G' },
            ];
            let validosFormula = [];
            if (row.id_padre == null) {
              validosFormula = ['C', '*', 'D', '*', 'E', '*', 'F', '*', 'G'];
            } else if (row.id_padre == '') {
              validosFormula = [];
            } else {
              validosFormula = this.convertirAArray(row.id_padre);
            }
            let i = 0;
            for (const iterator of validosFormula) {
              const operadores = ['*', '(', ')', '+', '-', '/'];
              if (operadores.includes(iterator) || !isNaN(Number(iterator))) {
                array.push(iterator);
                i++;
              } else {
                const encontrado = array2.find((ele) => ele.value == iterator);
                // if (encontrado) {
                //   if (encontrado.key !== null) {
                if (
                  encontrado.key == null &&
                  (row.id_padre == null || row.id_padre == 'C*D*E*F*G')
                ) {
                  if (
                    cantidad == null &&
                    n_veces == null &&
                    largo == null &&
                    ancho == null &&
                    altura == null
                  ) {
                    array.push(encontrado.key);
                  } else {
                    array.push(1);
                  }
                } else {
                  array.push(encontrado.key);
                }
                i++;
              }
            }
            const operadores = ['*', '(', '+', '-', '/'];
            const operadores2 = ['*', ')', '+', '-', '/'];
            if (operadores.includes(array[array.length - 1])) {
              array.pop();
            }
            if (operadores2.includes(array[0])) {
              array.shift();
            }
            let producto = null;
            if (array.includes(null)) {
              if (row.id_padre == null || row.id_padre == 'C*D*E*F*G') {
                row.item = '';
              } else {
                row.item = '1-1';
              }
              producto = 0;
            } else {
              producto = await this.calcularformula(array.join(''));
              row.item = '';
            }
            sumarow =
              producto == null
                ? 0
                : Number(
                    this.formsService.redondeo(producto, this.dec_metrado)
                  );
          } else {
            sumarow = 0;
          }
        } else {
        }
        if (sumarow) {
          const parteEntera = Math.floor(sumarow).toString();

          if (parteEntera.length > 8) {
            this.toaster.warning(
              'El total sobrepasa el limite de caracteres permitido, disminuya los montos ingresados',
              'Advertencia',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              }
            );
            sumarow = 0;
          }
        }
        if (!row.esMetrado) {
          this.tablaSistema[i].parcial = this.formsService.redondeo(
            sumarow,
            this.dec_metrado
          );
          this.tablaSistema[i].subtotal = this.formsService.redondeo(
            sumarow,
            this.dec_metrado
          );
          if (row.estitulo !== 2) {
            sumaGrupo = sumaGrupo + sumarow;
          }
        } else {
          if (!row.estitulo && !row.tieneAceros) {
            if (row.tieneSubmetrado) {
              this.tablaSistema[i].parcial = this.formsService.redondeo(
                0,
                this.dec_metrado
              );
              this.tablaSistema[i].subtotal = this.formsService.redondeo(
                sumaGrupo,
                this.dec_metrado
              );
            } else {
              sumaGrupo = sumaGrupo + sumarow;
              this.tablaSistema[i].parcial = this.formsService.redondeo(
                sumarow,
                this.dec_metrado
              );
              this.tablaSistema[i].subtotal = this.formsService.redondeo(
                sumaGrupo,
                this.dec_metrado
              );
            }
            if (row.estitulo == 0) {
              sumaTotal = sumaTotal + sumaGrupo;
            }
            sumaGrupo = 0;
          } else if (row.estitulo == 1) {
            this.tablaSistema[i].parcial = this.formsService.redondeo(
              0,
              this.dec_metrado
            );
            this.tablaSistema[i].subtotal = this.formsService.redondeo(
              0,
              this.dec_metrado
            );
            sumaGrupo = 0;
          } else if (row.tieneAceros) {
            sumaTotal = Number(row.subtotal);
            sumaGrupo = Number(row.subtotal);
            sumarow = Number(row.subtotal);
            sumaGrupo = 0;
          }
        }
        if (!row.estitulo && row.esMetrado) {
          this.cantidadMetrados++;
        }
        this.tablaSistemaProyecto[row.ind] = row;
      }
    }
    if (filaSel2 !== -1) {
      this.metradoSeleccionado = this.tablaSistema[filaSel2];
    }
    if (sumaTotal) {
      const parteEntera = Math.floor(sumaTotal).toString();

      if (parteEntera.length > 8) {
        this.toaster.warning(
          'El total sobrepasa el limite de caracteres permitido, disminuya los montos ingresados',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        sumaTotal = 0;
      }
    }
    this.tablaTitulo[filaSel].metrado = this.formsService.redondeo(
      sumaTotal,
      this.dec_metrado
    );
    this.permitirCambio = this.cantidadMetrados > 1 ? false : true;
    this.tablaTitulo[filaSel].ed_pre = 0;
    this.tablaTitulo[filaSel].cant_metrado = this.formsService.redondeo(
      sumaTotal,
      this.dec_metrado
    );
    this.tablaTitulo[filaSel].editadoMetrado = 1;
    this.tablaPrincipal[this.tablaTitulo[filaSel].ind] =
      this.tablaTitulo[filaSel];
    this.calcularMontosRowPrincipal(filaSel);
    this.calcularPorcentajeRegistro(this.tablaTitulo, 0);
    this.actualizarTemp();

    this.modificandofila = false;
    if (this.tablaSistema.length < this.cantidadFilasTabla) {
      const faltantes = this.cantidadFilasTabla - this.tablaSistema.length;
      for (let i = 0; i < faltantes; i++) {
        const row = new metradoModelo(
          null,
          1,
          null,
          null,
          this.partidaSeleccionada?.indice,
          this.idProyecto
        );
        this.tablaSistema.push(row);
      }
    }
  }

  async convertirSgtesSubAMert(indice, tabla) {
    let row = null;
    while (!row?.esMetrado && row?.id_metrado !== null) {
      row = this[tabla][indice];
      if (!row.esMetrado && row.id_metrado !== null) {
        this[tabla][indice].esMetrado = 1;
        this[tabla][indice].estitulo = 0;
        indice++;
        row = this[tabla][indice];
      } else {
        return;
      }
    }
  }

  isNumber(n) {
    return !isNaN(Number(n)) && isFinite(n);
  }

  calcularformula(texto) {
    try {
      const valor = math.evaluate(texto);
      const parteEntera = Math.floor(valor).toString();

      if (parteEntera.length > 8) {
        return null;
      }

      return valor;
      // return math.evaluate(texto);
    } catch {
      return null;
    }
  }

  async calcularFormulaSistema(row) {
    let formula = [];
    let texto = '';
    if (
      row.id_metrado !== null &&
      ((row.esMetrado == 0 && row.estitulo == 0) ||
        (row.esMetrado == 1 && row.estitulo == 0 && !row.tieneSubmetrado))
    ) {
      if (this.isNumber(row.cantidad) && row.cantidad) {
        formula.push('C');
      }
      if (this.isNumber(row.n_veces) && row.n_veces) {
        formula.push('D');
      }
      if (this.isNumber(row.largo) && row.largo) {
        formula.push('E');
      }
      if (this.isNumber(row.ancho) && row.ancho) {
        formula.push('F');
      }
      if (this.isNumber(row.altura) && row.altura) {
        formula.push('G');
      }
      texto = formula.join(' * ');
    }
    return texto;
  }

  limitarCaracteres(): void {
    if (this.archivoText.length > 50) {
      this.archivoText = this.archivoText.slice(0, 50);
    }
  }

  manejarPegar(event: ClipboardEvent): void {
    const textoPegado = event.clipboardData?.getData('text') || '';
    if (this.archivoText.length + textoPegado.length > 50) {
      event.preventDefault();
      const espacioRestante = 50 - this.archivoText.length;
      this.archivoText += textoPegado.slice(0, espacioRestante);
    }
  }

  closePop(texto, filaSel2, filaSel3) {
    if (this.verTablaSistema) {
      if (
        texto !== null &&
        this.tablaSistema[filaSel2].archivo !== texto
      ) {
        this.tablaSistema[filaSel2].archivo = texto;
        this.tablaSistemaProyecto[this.tablaSistema[filaSel2].ind]= this.tablaSistema[filaSel2]
        this.tablaTitulo[this.filaSel].editadoMetrado = 1
        this.tablaPrincipal[this.tablaTitulo[this.filaSel].ind] = this.tablaTitulo[this.filaSel]
        this.actualizarTemp();
        // this.toaster.success('guardado', '', {
        //   closeButton: false,
        //   positionClass: 'toast-bottom-right',
        //   timeOut: 2000,
        // });
        
      }
    } else {
      if (texto !== null && this.tablaAceros[filaSel3].estilo !== texto) {
        this.tablaAceros[filaSel3].estilo = texto;
        // this.guardarTablaTemporal('archivoText');
        this.tablaAcerosProyecto[this.tablaAceros[filaSel3].ind]= this.tablaAceros[filaSel3]
        this.tablaTitulo[this.filaSel].editadoMetrado = 1
        this.tablaPrincipal[this.tablaTitulo[this.filaSel].ind] = this.tablaTitulo[this.filaSel]
        this.actualizarTemp();
        // this.toaster.success('guardado', '', {
        //   closeButton: false,
        //   positionClass: 'toast-bottom-right',
        //   timeOut: 2000,
        // });
        
      }
    }
    this.popover5?.close();
  }

  async mostrarColores(row) {
    if (!this.seleccionCelda) {
      if (
        this.metradoSeleccionado?.id_metrado !== null &&
        !this.metradoSeleccionado?.estitulo &&
        ((this.metradoSeleccionado?.esMetrado &&
          !this.metradoSeleccionado?.tieneSubmetrado) ||
          !this.metradoSeleccionado?.esMetrado)
      ) {
        if (this.mostrarColrs) {
          this.mostrarColrs = false;
        } else {
          this.mostrarColrs = true;
        }
      } else {
        this.mostrarColrs = false;
      }
    }
  }

  pintarCelda(letra) {
    let valido = false;
    if (this.metradoSeleccionado.id_metrado !== null) {
      const formula =
        this.metradoSeleccionado.id_padre == null
          ? 'C*D*E*F*G'
          : this.metradoSeleccionado.id_padre;
      const spliteado = formula.split(/[/+*-]+/);
      spliteado.map((ele) => {
        if (ele.includes(letra)) {
          valido = true;
        }
      });
    }
    return valido;
  }

  async reiniciarFormula() {
    if (
      this.metradoSeleccionado &&
      this.metradoSeleccionado?.id_metrado !== null
    ) {
      const filaSel = JSON.parse(JSON.stringify(this.filaSel));
      const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
      let arrayIndices = [];

      if (this.metradoSeleccionado.esMetrado) {
        for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
          const row = this.tablaSistema[i];
          if (row.id_metrado !== null) {
            if (
              (row.esMetrado && !row.estitulo) ||
              (!row.esMetrado && row.estitulo)
            ) {
              break;
            } else if (!row.esMetrado && !row.estitulo) {
              arrayIndices.push(i);
            }
          }
        }

        if (arrayIndices.length) {
          const sw = await SwalService.confirm(
            'Estas seguro?',
            'Se reiniciara la formula de todas las filas relacionadas al metrado'
          );
          if (sw.isConfirmed) {
            arrayIndices.unshift(filaSel2);
          } else {
            return;
          }
        } else if (
          this.metradoSeleccionado.esMetrado &&
          !this.metradoSeleccionado.tieneSubmetrado &&
          !this.metradoSeleccionado.estitulo
        ) {
          arrayIndices.push(filaSel2);
        }
      } else if (this.metradoSeleccionado.estitulo) {
        return;
      } else if (
        !this.metradoSeleccionado.esMetrado &&
        !this.metradoSeleccionado.estitulo &&
        !this.metradoSeleccionado.tieneSubmetrado
      ) {
        arrayIndices.push(filaSel2);
      }
      if (arrayIndices.length) {
        for (const iterator of arrayIndices) {
          this.tablaSistema[iterator].id_padre = 'C*D*E*F*G';
        }
        await this.actuaTablaSistema(filaSel);
      }

      this.stiloFormula();
      // }
    }
  }

  verificarHabForm() {
    this.tempFormula = [];
    this.mostrarColrs = false;
    if (this.solover || !this.editable || this.permitirCambio) {
      return;
    }
    if (this.filaSel2 !== null) {
      if (
        this.metradoSeleccionado?.id_metrado == null ||
        (this.metradoSeleccionado.esMetrado &&
          this.metradoSeleccionado.tieneSubmetrado) ||
        this.metradoSeleccionado.tieneAceros ||
        this.metradoSeleccionado.estitulo
      ) {
        this.toaster.error('Formula no editable', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      }
      this.habEditFormula = true;
      // this.mostrarColrs = true

      this.teclaFormula(
        this.metradoSeleccionado.id_padre == null
          ? 'C*D*E*F*G'
          : this.metradoSeleccionado.id_padre
      );
    } else {
      this.toaster.error(
        'Ninguna fila seleccionada de la tabla hoja metrado',
        null,
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        }
      );
      this.mostrarColrs = false;
      this.habEditFormula = false;

      return;
    }
  }

  async evaluarFormula(texto, fuente) {
    this.habEditFormula = false;
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    const filaSel2 = JSON.parse(JSON.stringify(this.filaSel2));
    setTimeout(async () => {
      if (this.metradoSeleccionado !== null) {
        const validos = ['C', 'D', 'E', 'F', 'G', '*', '(', ')', '+', '-', '/'];
        texto = texto.toString().toUpperCase().replace(/\s+/g, '');
        const spliteado = this.convertirAArray(texto, true);
        let arrayCorrecto = [];
        const respuesta = await this.previaPruebaFormula(spliteado);
        if (!respuesta.valido) {
          this.toaster.error('Formula no Valida', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
          });
          this.stiloFormula();
          return;
        } else {
          arrayCorrecto = respuesta.arrayCorrecto;
        }

        const formula = arrayCorrecto.join('');
        if (formula !== this.tablaSistema[filaSel2].id_padre) {
          this.tablaSistema[filaSel2].id_padre = formula;
          await this.actuaTablaSistema(filaSel);
          this.stiloFormula();
        }
        this.stiloFormula();
      } else {
        this.stiloFormula();
        return;
      }
    }, 50);
    //
  }

  async previaPruebaFormula(texto) {
    const columnas = ['C', 'D', 'E', 'F', 'G'];
    let nuevoString = [];
    let formula = [];
    let valido = true;
    for (const iterator of texto) {
      if (iterator.length > 1) {
        const numero = parseFloat(iterator);
        if (isNaN(numero)) {
          valido = false;
          break;
        } else {
          const texto = iterator.slice(numero.toString().length);
          if (!texto && !isNaN(numero)) {
            nuevoString.push(numero);
            formula.push(iterator);
          } else {
            if (columnas.includes(texto)) {
              nuevoString.push(numero);
              nuevoString.push('*');
              nuevoString.push(1);
              formula.push(iterator);
            } else {
              valido = false;
              break;
            }
          }
        }
      } else {
        if (columnas.includes(iterator)) {
          nuevoString.push(1);
          formula.push(iterator);
        } else {
          nuevoString.push(iterator);
          formula.push(iterator);
        }
      }
    }
    valido = await this.calcularformula(nuevoString.join(''));
    return { valido: valido, arrayCorrecto: formula };
  }

  async copiarFormula() {
    if (
      this.metradoSeleccionado &&
      this.metradoSeleccionado.id_metrado !== null
    ) {
      if (
        this.metradoSeleccionado?.estitulo ||
        (this.metradoSeleccionado.esMetrado &&
          (this.metradoSeleccionado.tieneAceros ||
            this.metradoSeleccionado.tieneSubmetrado))
      ) {
        this.toaster.error('Fila seleccionada no valida', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else {
        this.formulaCopiada =
          this.metradoSeleccionado.id_padre == null
            ? 'C*D*E*F*G'
            : this.metradoSeleccionado.id_padre;
        this.toaster.info('Formula Copiada', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
      }
    } else {
      this.toaster.error('Ninguna fila seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
  }

  async pegarFormula() {
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    if (
      (this.metradoSeleccionado ||
        (!this.metradoSeleccionado && this.habilitadoCopiar)) &&
      this.metradoSeleccionado?.id_metrado !== null &&
      !this.metradoSeleccionado?.estitulo &&
      !this.metradoSeleccionado?.tieneAceros
    ) {
      if (this.habilitadoCopiar) {
        const encontrados = this.tablaSistema.filter((ele) => ele.editarCopiar);
        for (const iterator of encontrados) {
          if (
            ((iterator.esMetrado && !iterator.tieneSubmetrado) ||
              !iterator.esMetrado) &&
            !iterator.estitulo
          ) {
            iterator.id_padre = this.formulaCopiada;
            iterator.editarCopiar = false;
          }
        }
        this.habilitadoCopiar = false;
      } else {
        this.metradoSeleccionado.id_padre = this.formulaCopiada;
      }
      await this.actuaTablaSistema(filaSel);
      this.stiloFormula();
    } else {
      this.toaster.error('No se puede pegar en la fila seleccionada', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
  }

  /// tabla aceros
  async seleccionRowAceros(i) {
    this.filaSel3 = i;
    this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
    this.mostrarColrs = false
  }

  async habilitarEditarAceros(celda, rowIndex) {
 
    if (this.filaSel3 !== null || this.filaSel3 !== undefined && this.ultiCelda == 'diametro')  {
      this.tablaAceros[this.filaSel3].editardiametro = 0;
    }
    if (this.solover || !this.editable || !this.partidaSeleccionada?.unidad) {
      return;
    }
    if (
      (celda == 'diametro' || celda == 'pesodiametro') &&
      this.tablaAceros[rowIndex].id_metrado == null
    ) {
      return;
    }
    this.filaSel3 = rowIndex;
    this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
    this.tablaAceros[rowIndex]['editar' + celda] = 1;
    setTimeout(() => {
      const a = document.getElementById('s' + this.filaSel3);
      if (a) {
         const b = a.getElementsByTagName('input');
      b[0].select();
      }
     
    }, 50);
  }

  async blurInputAceros(event, i, input) {
    this.saltardescripcion = false;
    let value = event.target.value;
    const filaSel = JSON.parse(JSON.stringify(this.filaSel));
    this.tablaAceros[i]['editar' + input] = 0;
    if (!isNaN(value) && value.trim() !== '') {
      const partes = value.split('.');
      if (partes[0].length > 8) {
        this.toaster.warning(
          'El valor excede al maximo de 8 caracteres en la parte entera',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
          }
        );
        return;
      }
    } else {
      const  cantLimite = (input == 'descripcion' ? 200 : 80) 
      if (input.length > cantLimite) {
        this.toaster.warning(
          'El valor excede al maximo de ' + cantLimite + ' caracteres para texto',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
          }
        );
        return;
      }
    }
    let modificado = 0;
   
    if (this.tablaAceros[i].id_metrado !== null) {
      if (value == undefined) {
        return;
      }
      if (
        (this.tablaAceros[i][input] == null
          ? ''
          : this.tablaAceros[i][input]) !== value
      ) {
        const spliteado = value.split('.');
        if (
          spliteado.length == 2 &&
          !isNaN(Number(spliteado[1])) &&
          !spliteado[0]
        ) {
          value = '0.' + spliteado[1];
        }
        this.tablaAceros[i][input] = value;
        modificado = 1;
      }
    } else {
      if (this.tablaAceros[i].id_metrado == null) {
        if (value !== '' && value !== undefined) {
          const spliteado = value.split('.');
          if (
            spliteado.length == 2 &&
            !isNaN(Number(spliteado[1])) &&
            !spliteado[0]
          ) {
            value = '0.' + spliteado[1];
          }

          this.tablaAceros[i] = new aceroModelo(
            null,
            1,
            null,
            0,
            this.tablaTitulo[filaSel]?.indice,
            this.idProyecto
          );
          if (input == 'descripcion') {
            this.tablaAceros[i].subtotal = this.formsService.redondeo(
              0,
              this.dec_metrado
            );
            this.tablaAceros[i].parcial = this.formsService.redondeo(
              0,
              this.dec_metrado
            );
          }
          this.bloquearBotones = true;
          this.tablaAceros[i][input] = value;
          this.tablaAceros[i].ind = this.tablaAcerosProyecto.length;
          this.tablaAcerosProyecto.push(this.tablaAceros[i]);
          modificado = 1;
        }
      } else {
        if (value !== undefined) {
          const spliteado = value.split('.');
          if (
            spliteado.length == 2 &&
            !isNaN(Number(spliteado[1])) &&
            !spliteado[0]
          ) {
            value = '0.' + spliteado[1];
          }
          this.tablaAceros[i][input] = value;
          modificado = 1;
        }
      }
    }
    if (modificado && input !== 'descripcion') {
      await this.actuaTablaAceros(filaSel);
    } else {
      this.tablaTitulo[filaSel].editadoMetrado = 1;
      this.tablaPrincipal[this.tablaTitulo[filaSel].ind] =
        this.tablaTitulo[filaSel];
        this.actualizarTemp();
    }
  }

  async actuaTablaAceros(filaSel) {
    this.modificandofila = true;
    let j = 0;
    let k = 0;
    let existeMetrado = false;
    for (let element of this.tablaAceros) {
      if (
        element.descripcion !== null ||
        element.cantidad !== null ||
        element.elementos !== null ||
        element.longitud !== null ||
        element.diametro !== null ||
        element.pesodiametro !== null ||
        element.id_metrado !== null
      ) {
        element.id_metrado = j;
        element.indice = this.tablaTitulo[filaSel].indice;
        j++;
        if (element.ind == null) {
          element.ind = this.tablaAcerosProyecto.length;
          this.tablaAcerosProyecto.push(element);
        }
      }
      if (
        !this.tablaAceros[k].esMetrado &&
        !this.tablaAceros[k].estitulo &&
        !existeMetrado
      ) {
        this.tablaAceros[k].esMetrado = 1;
        existeMetrado = true;
      } else if (this.tablaAceros[k].estitulo == 1) {
        existeMetrado = false;
      }
      if (this.tablaAceros[k].esMetrado && !this.tablaAceros[k].estitulo) {
        const sgteValido = await this.sgteValido(k + 1, 'tablaAceros');
        if (
          sgteValido?.sgteExistente &&
          !sgteValido?.sgteExistente?.esMetrado
        ) {
          this.tablaAceros[k].tieneSubmetrado = 1;
        } else {
          this.tablaAceros[k].tieneSubmetrado = 0;
        }
      } else {
        if (
          this.tablaAceros[k].esMetrado &&
          this.tablaAceros[k].estitulo == 1
        ) {
          const sgteValido = await this.sgteValido(k + 1, 'tablaAceros');
          if (
            sgteValido?.sgteExistente &&
            !sgteValido?.sgteExistente?.esMetrado
          ) {
            await this.convertirSgtesSubAMert(k + 1, 'tablaAceros');
          }
        }
        this.tablaAceros[k].tieneSubmetrado = 0;
      }
      if (this.tablaAceros[k].esMetrado && !this.tablaAceros[k].estitulo) {
        existeMetrado = true;
      }
      k++;
    }
    let sumaGrupo = 0;
    let existefilavalido = 0;
    let sumaSubTotales = 0;
    for (let indice = this.tablaAceros.length - 1; indice >= 0; indice--) {
      let row = this.tablaAceros[indice];
      // console.log('row', row)
      if (row.id_metrado !== null) {
        let total1 = 0;
        let total2 = 0;
        let subtotal = 0;
        if (row.cantidad !== null && row.elementos !== null) {
          total1 =
            (row.cantidad && Number(row.cantidad) ? Number(row.cantidad) : 0) *
            (row.elementos && Number(row.elementos)
              ? Number(row.elementos)
              : 0);
          const parteEntera = Math.floor(total1).toString();
          if (parteEntera.length > 8) {
            total1 = 0;
            this.toaster.warning(
              'El total sobrepasa el limite de caracteres permitido, disminuya los montos ingresados',
              'Advertencia',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              }
            );
          }
          total1 = Number(this.formsService.redondeo(
            total1,
            2
          ));
        }
        if (total1 !== 0 && row.longitud !== null) {
          total2 =
            total1 *
            (row.longitud && Number(row.longitud) ? Number(row.longitud) : 0);
          const parteEntera = Math.floor(total2).toString();
          if (parteEntera.length > 8) {
            this.toaster.warning(
              'El total sobrepasa el limite de caracteres permitido, disminuya los montos ingresados',
              'Advertencia',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              }
            );
            total2 = 0;
          }
          total2 = Number(this.formsService.redondeo(
            total2,
            2
          ));
        }
        if (total2 !== 0 && row.pesodiametro !== null) {
          subtotal =
            total2 *
            (row.pesodiametro && Number(row.pesodiametro)
              ? Number(row.pesodiametro)
              : 0);
          const parteEntera = Math.floor(subtotal).toString();
          if (parteEntera.length > 8) {
            subtotal = 0;
            this.toaster.warning(
              'El total sobrepasa el limite de caracteres permitido, disminuya los montos ingresados',
              'Advertencia',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              }
            );
          }
        }
        this.tablaAceros[indice].total1 = this.formsService.redondeo(
          total1,
          this.dec_metrado
        );
        this.tablaAceros[indice].total2 = this.formsService.redondeo(
          total2,
          this.dec_metrado
        );
        subtotal = Number(this.formsService.redondeo(
          subtotal,
          this.dec_metrado
        ));
        if (row.estitulo == 0) {
          sumaGrupo = sumaGrupo + subtotal;
        }
        if (!row.esMetrado) {
          this.tablaAceros[indice].parcial = this.formsService.redondeo(
            subtotal,
            this.dec_metrado
          );
          this.tablaAceros[indice].subtotal = this.formsService.redondeo(
            0,
            this.dec_metrado
          );
        } else {
          if (row.estitulo) {
            this.tablaAceros[indice].parcial = this.formsService.redondeo(
              0,
              this.dec_metrado
            );
            this.tablaAceros[indice].subtotal = this.formsService.redondeo(
              0,
              this.dec_metrado
            );
          } else {
            this.tablaAceros[indice].parcial = this.formsService.redondeo(
              subtotal,
              this.dec_metrado
            );
            this.tablaAceros[indice].subtotal = this.formsService.redondeo(
              sumaGrupo,
              this.dec_metrado
            );
          }
          sumaGrupo = 0;
        }
        sumaSubTotales = sumaSubTotales + subtotal;
        existefilavalido = 1;
        this.tablaAcerosProyecto[row.ind] = row;
      }
    }

    if (this.filaSel3 !== -1) {
      this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
    }
    if (sumaSubTotales) {
      const parteEntera = Math.floor(sumaSubTotales).toString();
      if (parteEntera.length > 8) {
        this.toaster.warning(
          'El total sobrepasa el limite de caracteres permitido, disminuya los montos ingresados',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        sumaSubTotales = 0;
      }
    }
    this.tablaTitulo[filaSel].totalAceros = this.formsService.redondeo(
      sumaSubTotales,
      this.dec_metrado
    );
    this.tablaTitulo[filaSel].metrado = this.formsService.redondeo(
      sumaSubTotales,
      this.dec_metrado
    );
    this.tablaTitulo[filaSel].ed_pre = 0;
    this.tablaTitulo[filaSel].cant_metrado = this.formsService.redondeo(
      sumaSubTotales,
      this.dec_metrado
    );
    this.resumenAceros(false, filaSel);
    this.tablaTitulo[filaSel].editadoMetrado = 1;
    this.tablaTitulo[filaSel].permitirCambio = existefilavalido ? 0 : 1;
    this.tablaPrincipal[this.tablaTitulo[filaSel].ind] =
      this.tablaTitulo[filaSel];
    this.bloquearBotones = existeMetrado ? true : false;
    this.calcularMontosRowPrincipal(filaSel);
    this.calcularPorcentajeRegistro(this.tablaTitulo, 0);
    this.actualizarTemp();
    this.modificandofila = false;
    if (this.tablaAceros.length < this.cantidadFilasTabla) {
      const faltantes = this.cantidadFilasTabla - this.tablaAceros.length;
      for (let i = 0; i < faltantes; i++) {
        const row = new aceroModelo(
          null,
          1,
          null,
          null,
          this.partidaSeleccionada?.indice,
          this.idProyecto
        );
        this.tablaAceros.push(row);
      }
    }
  }

  handleKeyDown2(event: KeyboardEvent, index: number, columna: string) {
    if (event.key === 'ArrowUp') {
      event.preventDefault(); // Evita el comportamiento predeterminado
      this.moverArribaTablaAceros(event, columna, index);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); // Evita el comportamiento predeterminado
      this.moverAbajoTablaAceros(event, columna, index);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.moverDerechaTablaAceros(event, columna, index);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.moverIzquierdaTablaAceros(event, columna, index);
    }
  }

  async moverArribaTablaAceros(value, columna, i) {
    if (this.filaSel3 > 0) {
      const index = i - 1;
      if (
        (columna == 'pesodiametro' || columna == 'diametro') &&
        this.tablaAceros[index].id_metrado == null
      ) {
        return;
      }
      value.target.blur();
      this.tablaAceros[index]['editar' + columna] = 1;
      this.filaSel3 = index;
      this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
      if (index == 1) {
        value.target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    } else {
      return;
    }
  }

  async moverAbajoTablaAceros(value, columna, i) {
    if (this.filaSel3 < this.tablaAceros.length - 1) {
      const index = i + 1;
      if (
        (columna == 'pesodiametro' || columna == 'diametro') &&
        this.tablaAceros[index].id_metrado == null
      ) {
        return;
      }
      value.target.blur();
      this.tablaAceros[index]['editar' + columna] = 1;
      this.filaSel3 = index;
      this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
    } else if (this.filaSel3 == this.tablaAceros.length - 1) {
      const row = new aceroModelo(
        null,
        1,
        null,
        null,
        this.partidaSeleccionada?.indice,
        this.idProyecto
      );
      this.tablaAceros.push(row);
      value.target.blur();
      const index = i + 1;

      this.tablaAceros[index]['editar' + columna] = 1;
      this.filaSel3 = index;
      this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
    } else {
      return;
    }
  }

  async moverDerechaTablaAceros(event, columna, index) {
    if (columna == 'descripcion') {
      this.selectedItem = null;
      const inputElement = event.target as HTMLInputElement;
      const valueLength = inputElement.value.length;
      if (inputElement.selectionStart === valueLength) {
        if (this.saltardescripcion) {
          event.target.blur();
          const element = this.sgteColumnaAcero(columna, true);
          this.tablaAceros[index]['editar' + element] = 1;
        } else {
          this.saltardescripcion = true;
        }
      } else {
        this.saltardescripcion = false;
      }
    } else if (columna !== 'diametro' && columna !== 'longitud') {
      this.saltardescripcion = false;
      if (
        (this.tablaAceros[index].id_metrado == null && columna == 'longitud') ||
        columna == 'pesodiametro'
      ) {
        return;
      }
      event.target.blur();
      const element = this.sgteColumnaAcero(columna, true);
      this.tablaAceros[index]['editar' + element] = 1;
      this.selectedItem = null;
    } else if (columna == 'longitud') {
      this.saltardescripcion = false;
      if (this.tablaAceros[index].id_metrado == null) {
        return;
      }
      this.tablaAceros[index]['editardiametro'] = 1;
      setTimeout(() => {
        const a = document.getElementById('s' + this.filaSel3);
        const b = a.getElementsByTagName('input');
        b[0].select();
      }, 50);
    }
  }

  async moverIzquierdaTablaAceros(event, columna, index) {
    if (columna == 'descripcion') {
    } else if (columna == 'pesodiametro') {
      this.tablaAceros[index]['editardiametro'] = 1;
      setTimeout(() => {
        const a = document.getElementById('s' + this.filaSel3);
        const b = a.getElementsByTagName('input');
        b[0].select();
      }, 50);
    } else {
      event.target.blur();
      const element = this.sgteColumnaAcero(columna, false);
      this.tablaAceros[index]['editar' + element] = 1;
    }
  }

  sgteColumnaAcero(columna, derecha) {
    let sgte = null;
    switch (columna) {
      case 'descripcion':
        sgte = !derecha ? 'descripcion' : 'cantidad';
        return sgte;
      case 'cantidad':
        sgte = !derecha ? 'descripcion' : 'elementos';
        return sgte;
      case 'elementos':
        sgte = !derecha ? 'cantidad' : 'longitud';
        return sgte;
      case 'longitud':
        sgte = !derecha ? 'elementos' : 'diametro';
        return sgte;
      case 'diametro':
        sgte = !derecha ? 'longitud' : 'diametro';
        return sgte;
      case 'pesodiametro':
        sgte = !derecha ? 'diametro' : 'pesodiametro';
        return sgte;
      // case 'archivo':
      //   sgte = !derecha ? 'pesodiametro' : 'archivo';
      //   return sgte;
      default:
        return sgte;
    }
  }

  onKeyDown(event: KeyboardEvent, select: any) {
  
    const options = select.items;
    const currentIndex = options.indexOf(this.selectedItem);
    const validCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
   
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.accionUltSelect = event.key;
      select.blur();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      select.open();
      if (event.key === 'ArrowDown') {
        if (validCurrentIndex < options.length - 1) {
          this.selectedItem = options[validCurrentIndex + 1].value;
        } else {
          select.blur();
        }
      } else if (event.key === 'ArrowUp') {
        if (validCurrentIndex > 0) {
          this.selectedItem = options[validCurrentIndex - 1].value;
        }
      }

      // setTimeout(() => {
      //   // Buscar las opciones en el DOM (usando un querySelector global)
      //   const options = document.querySelectorAll('.ng-select .ng-option');
      //   console.log('options', options)
      //   // Buscar la opción enfocada lista de opciones
      //   let focusedOption = Array.from(options).find((option: any) => option.classList.contains('ng-option-focused'));
      //   console.log('focusedOption', focusedOption)
      //   if (focusedOption) {
      //     // Aplicar el estilo de fondo y texto a la opción enfocada
      //     this.renderer.setStyle(focusedOption, 'background-color', '#e24e34');
      //     this.renderer.setStyle(focusedOption, 'color', 'white');
      //   }
      // }, 0);

    }
  }

  async blurSelect() {
    this.tablaAceros[this.filaSel3].editardiametro = 0;
    if (this.accionUltSelect == 'ArrowLeft') {
      this.tablaAceros[this.filaSel3].editarlongitud = 1;
    } else if (this.accionUltSelect == 'ArrowRight') {
      this.tablaAceros[this.filaSel3].editarpesodiametro = 1;
    }
    this.accionUltSelect = null;
  }

  async cambioPesoComercial(event, i) {
    const encontrado = this.listaPesos.find((ele) => ele.medida == event);
    if (encontrado) {
      if (
        this.tablaAceros[i].id_metrado !== null &&
        !this.tablaAceros[i].estitulo &&
        ((this.tablaAceros[i].esMetrado &&
          !this.tablaAceros[i].tieneSubmetrado) ||
          !this.tablaAceros[i].esMetrado)
      ) {
        this.tablaAceros[i].diametro = event;
        this.tablaAceros[i].pesodiametro = encontrado.peso;

        await this.actuaTablaAceros(this.filaSel);
        // await this.calcularMontosAceros();
        // await this.actualizarDataPrincipal();
        // this.stiloFormula();
        // this.guardarTablaTemporal('cambioPesoComercial');
      }
    }
  }

  //acciones tablaceros
  async agregarMetradoAcero(multiple = false) {
    if (this.aceroSeleccionado) {
      let indice = null;
      if (this.aceroSeleccionado.id_metrado !== null) {
        indice = this.filaSel3 + 1;
      } else {
        indice = this.filaSel3;
      }
      const metrado = new aceroModelo(
        null,
        1,
        null,
        0,
        this.partidaSeleccionada?.indice,
        this.idProyecto
      );
      metrado.parcial = this.formsService.redondeo(0, this.dec_metrado);
      metrado.subtotal = this.formsService.redondeo(0, this.dec_metrado);
      this.tablaAceros.splice(indice, 0, metrado);
      this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
    } else {
      this.toaster.error('Ninguna fila seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
    if (!multiple) {
      await this.actuaTablaAceros(this.filaSel);
      // this.guardarTablaTemporal('agregarMEtrado');
    }
  }

  async agregarMultipleMetradoAcero(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      await this.agregarMetradoAcero(true);
    }
    if (cantidad > 0) {
      await this.actuaTablaAceros(this.filaSel);
      // await this.calculoMontosSistema();
      // await this.actualizarDataPrincipal();
      this.popover.close();
      // this.guardarTablaTemporal('agregarMultipleMetrado');
    }
  }

  async agregarSubmetradoAcero(multiple = false, idx = null) {
    if (this.aceroSeleccionado) {
      let index = null;
      if (idx == null) {
        index =
          this.aceroSeleccionado?.id_metrado !== null
            ? this.filaSel3 + 1
            : this.filaSel3;
      } else {
        index = idx;
      }
      if (
        this.aceroSeleccionado.esMetrado &&
        !this.aceroSeleccionado.estitulo
      ) {
        this.tablaAceros[this.filaSel3].tieneSubmetrado = 1;
        this.tablaAceros[this.filaSel3].tieneAceros = 0;
      }
      const subMetrado = new aceroModelo(
        null,
        0,
        null,
        0,
        this.partidaSeleccionada.indice,
        this.idProyecto
      );
      this.tablaAceros.splice(index, 0, subMetrado);
      subMetrado.parcial = this.formsService.redondeo(0, this.dec_metrado);
      subMetrado.subtotal = this.formsService.redondeo(0, this.dec_metrado);
      this.aceroSeleccionado = this.tablaAceros[this.filaSel3];
      if (!multiple) {
        await this.actuaTablaAceros(this.filaSel);
        //   await this.calculoMontosSistema();
        //   await this.actualizarDataPrincipal();
        this.stiloFormula();
        //   this.guardarTablaTemporal('agregarMEtrado');
      }

      // this.stiloFormula();
    } else {
      this.toaster.error('Ninguna fila seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
  }

  async agregarMultipleSubmetradoAcero(cantidad) {
    if (this.popover2.isOpen()) {
      this.popover2.close();
    }
    if (this.aceroSeleccionado) {
      if (this.aceroSeleccionado.estitulo == 1) {
        this.toaster.error('No se puede agregar debajo de un título', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      }
      let index = null;
      const inicio =
        this.aceroSeleccionado.id_metrado !== null
          ? this.filaSel3 + 1
          : this.filaSel3;
      for (let i = 0; i < cantidad; i++) {
        const a = inicio + i;
        await this.agregarSubmetradoAcero(true, a);
      }
      await this.actuaTablaAceros(this.filaSel);
      // await this.calculoMontosSistema();
      // await this.actualizarDataPrincipal();
      // this.guardarTablaTemporal('agregarMultipleSubmetrado');
    } else {
      this.toaster.error('Ninguna fila Seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
  }

  async convertirFilaATituloAcero() {
    let cambio = 0;
    if (this.aceroSeleccionado?.id_metrado !== null) {
      if (this.aceroSeleccionado.tieneAceros) {
        this.toaster.error('No se puede convertir a titulo', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      } else {
        this.tablaAceros[this.filaSel3].estitulo = 1;
        this.tablaAceros[this.filaSel3].esMetrado = 1;
        this.tablaAceros[this.filaSel3].tieneAceros = 0;
        cambio = 1;
      }
    } else {
      if (this.aceroSeleccionado?.id_metrado == null) {
        this.tablaAceros[this.filaSel3].estitulo = 1;
        this.tablaAceros[this.filaSel3].esMetrado = 1;
        this.tablaAceros[this.filaSel3].tieneAceros = 0;
        cambio = 1;
      } else {
        const texto =
          this.filaSel3 == null
            ? 'Ningun elemento Seleccionado'
            : 'No se puede convertir a titulo';
        this.toaster.error(texto, 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
    }
    if (cambio) {
      await this.actuaTablaAceros(this.filaSel);
      // this.guardarTablaTemporal('convertirFilaATituloM');
    }
  }

  async convertirFilaATextoAcero(multiple = false) {
    if (this.aceroSeleccionado?.id_metrado !== null) {
      let valor = 2;
      if (this.aceroSeleccionado.estitulo == 2) {
        valor = 0;
      }
      this.tablaAceros[this.filaSel3].estitulo = valor;
      await this.actuaTablaAceros(this.filaSel);
      // await this.actualizarDataPrincipal();
      this.stiloFormula();
      // this.guardarTablaTemporal('convertirFilaATexto');
    } else {
      this.toaster.info('Ningun Fila seleccionada', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return;
    }
  }

  async limpiarTablaAceros() {
    if (this.partidaSeleccionada?.unidad) {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se eliminará todos los registros de la tabla hojas metrado acero y el resumen en la tabla sistema'
      );
      if (sw.isConfirmed) {
        this.buscando2 = true;
        let indOrdenado = this.tablaAceros
          .filter((ele) => ele.id_metrado !== null)
          .map((ele) => ele.ind);
        indOrdenado.sort((a, b) => b - a);
        for (let element of indOrdenado) {
          this.tablaAcerosProyecto[element].indice = null;
        }
        this.tablaAceros = [];
        for (let i = 0; i < this.cantidadFilasTabla - 1; i++) {
          const metrado = new aceroModelo(
            null,
            1,
            null,
            null,
            this.partidaSeleccionada?.indice,
            this.idProyecto
          );
          this.tablaAceros.push(metrado);
        }
        this.filaSel2 = null;
        this.filaSel3 = null;
        this.metradoSeleccionado = null;
        this.aceroSeleccionado = null;
        this.mostrarColrs = false;
        this.tempFormula = [];
        this.tablaTitulo[this.filaSel].metrado = this.formsService.redondeo(
          0,
          this.dec_metrado
        );
        this.tablaTitulo[this.filaSel].ed_pre = 0;
        this.tablaTitulo[this.filaSel].cant_metrado =
          this.formsService.redondeo(0, this.dec_metrado);
        this.tablaTitulo[this.filaSel].totalAceros = this.formsService.redondeo(
          0,
          this.dec_metrado
        );
        this.tablaTitulo[this.filaSel].permitirCambio = 1;
        this.tablaTitulo[this.filaSel].editadoMetrado = 1;
        this.stiloFormula();
        await this.resumenAceros(true, this.filaSel);
        this.todosCheck = false;
        this.habilitadoCopiar = false;
        this.tablaPrincipal[this.tablaTitulo[this.filaSel].ind] =
          this.tablaTitulo[this.filaSel];
        this.calcularPorcentajeRegistro(this.tablaTitulo, 0);
        this.actualizarTemp();
        this.buscando2 = false;
      }
    }
  }

  async resumenAceros(limpiar = false, filaSel) {
    let tablaSistema = [];

    await this.tablaSistema.filter((ele) => {
      if (ele.id_metrado !== null) {
        tablaSistema.push(ele);
      }
    });
    let nuevaTabla = [];
    if (tablaSistema.length) {
      let indOrdenado = tablaSistema
        .filter((ele) => ele.id_metrado !== null && !ele.tieneAceros)
        .map((ele) => ele.ind);
      indOrdenado.sort((a, b) => b - a);
      for (let element of indOrdenado) {
        this.tablaSistemaProyecto[element].indice = null;
      }
      nuevaTabla = tablaSistema.filter(
        (ele) => ele.id_metrado !== null && ele.tieneAceros
      );
      if (nuevaTabla.length) {
        nuevaTabla[0].id_metrado = 0;
        nuevaTabla[0].parcial = this.tablaTitulo[filaSel].totalAceros;
        nuevaTabla[0].subtotal = this.tablaTitulo[filaSel].totalAceros;
        this.tablaSistemaProyecto[nuevaTabla[0].ind] = nuevaTabla[0];
      }
    } else {
      let metrado = new metradoModelo(
        'Acero',
        1,
        '',
        0,
        this.tablaTitulo[filaSel]?.indice,
        this.idProyecto
      );
      metrado.tieneAceros = 1;
      metrado.ind = this.tablaSistemaProyecto.length;
      this.tablaSistemaProyecto.push(metrado);
      nuevaTabla.push(metrado);
    }
    if (!limpiar) {
      const array = [];
      let sumaTotalPeso = 0;
      let sumaTotalLongitud = 0;
      for (const iterator of this.listaPesos) {
        const filtrados = this.tablaAceros.filter(
          (ele) =>
            ele.id_metrado !== null &&
            !ele.estitulo &&
            ((ele.esMetrado && !ele.tieneSubmetrado) || !ele.esMetrado) &&
            ele.diametro == iterator.medida
        );

        //corrugado es / 9 liso /6
        if (filtrados.length) {
          let sumaPeso = 0;
          let sumaLongitud = 0;
          filtrados.map((ele) => {
            sumaPeso = sumaPeso + Number(ele.parcial);
            sumaLongitud = sumaLongitud + Number(ele.total2);
          });
          sumaTotalPeso =
            sumaTotalPeso +
            Number(this.formsService.redondeo(sumaPeso, this.dec_metrado));
          sumaTotalLongitud =
            sumaTotalLongitud +
            Number(this.formsService.redondeo(sumaLongitud, this.dec_metrado));
          const obj = {
            descripcion: 'Acero Corrugado  de ' + iterator.medida,
            cantidad: iterator.medida,
            n_veces: 'Peso =',
            largo:
              Number(this.formsService.redondeo(sumaPeso, this.dec_metrado)) +
              ' Kg',
            ancho: 'Longitud =',
            altura:
              Number(
                this.formsService.redondeo(sumaLongitud, this.dec_metrado)
              ) + 'ml',
            esMetrado: 0,
            estitulo: 0,
          };
          let subMetrado = new metradoModelo(
            '',
            0,
            '',
            0,
            this.tablaTitulo[filaSel].indice,
            this.idProyecto
          );
          for (const key in obj) {
            subMetrado[key] = obj[key];
          }
          array.push(subMetrado);
        }
      }
      let j = 1;
      for (const iterator of array) {
        iterator.id_metrado = j;
        iterator.ind = this.tablaSistemaProyecto.length;
        nuevaTabla.push(iterator);
        this.tablaSistemaProyecto.push(iterator);
        j++;
      }
    }

    if (nuevaTabla.length < this.cantidadFilasTabla) {
      const faltantes = this.cantidadFilasTabla - nuevaTabla.length;
      for (let i = 0; i < faltantes; i++) {
        const metrado = new metradoModelo(
          '',
          1,
          '',
          null,
          this.tablaTitulo[filaSel]?.indice,
          this.idProyecto
        );
        nuevaTabla.push(metrado);
      }
    }
    this.tablaSistema = nuevaTabla;
  }

  async cambioTabla(tipotabla) {
    if (tipotabla) {
      this.verTablaSistema = true;
    } else {
      this.verTablaSistema = false;
    }
    this.aceroSeleccionado = null;
    this.filaSel2 = null;
    this.filaSel3 = null;
    this.metradoSeleccionado = false;
    this.accionUltSelect = null;
    this.mostrarColrs = false;
    this.tempFormula = [];
    if (this.partidaSeleccionada?.unidad) {
      setTimeout(() => {
        if (this.box2) {
          const wBotones = this.box2.nativeElement.clientWidth;
          if (wBotones < 703) {
            this.scrollbut = true;
          } else {
            this.scrollbut = false;
          }
        }
        if (this.box3) {
          const wBotones = this.box3.nativeElement.clientWidth;
          if (wBotones < 345) {
            this.scrollbut2 = true;
          } else {
            this.scrollbut2 = false;
          }
        }
        if (this.box4) {
          const wBotones = this.box4.nativeElement.clientWidth;
          if (wBotones < 703) {
            this.scrollbut3 = true;
          } else {
            this.scrollbut3 = false;
          }
        }
      }, 50);
    }
  }

  activarAceros(checked, i) {
    const ind = this.tablaSistema[i].ind;
    if (checked) {
      this.tablaSistema[i].tieneAceros = 1;
      this.tablaSistemaProyecto[ind].tieneAceros = 1;
      this.permitirCambio = true;
      this.cantidadMetrados = 1;
      this.bloquearBotones = true;
    } else {
      this.tablaSistema[i].tieneAceros = 0;

      this.tablaSistemaProyecto[ind].tieneAceros = 0;
      this.permitirCambio = true;
      this.cantidadMetrados = 1;
      this.bloquearBotones = false;
    }
    this.tablaSistema[i].editadoMetrado = 1;
    this.tablaSistemaProyecto[ind].editadoMetrado = 1;
  }

  async modalPesosComerciales() {
    try {
      const modalRef = this.modalService.open(ModalPesosComercialesComponent, {
        size: 'md',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.id_usuario = this.id_usuario;
      modalRef.componentInstance.ocultosPesorCom = this.ocultosPesorCom;
      modalRef.componentInstance.tablaAcerosProyecto = this.tablaAcerosProyecto;
      const result = await modalRef.result;
      if (result !== null) {
        this.mostrar_carga_todo = true;
        this.listaPesos = [];
        this.ocultosPesorCom = result;
        let titulosArr = [];
        const ocultos = this.ocultosPesorCom.length
          ? this.ocultosPesorCom
          : null;
        for (const element of this.tablaPrincipal) {
          const itemSplit = element.item.split('.');
          if (itemSplit.length == 1) {
            let array = [];

            const stilos = [
              this.stilosTit,
              this.stilosMet,
              this.stilosSubM,
              this.stilosTexto,
            ];
            const textoa = JSON.stringify(stilos);
            const textob = JSON.stringify(this.ocultosPesorCom);
            const entexto = textoa + '@' + textob;
            element.estilo = entexto;
            titulosArr.push(element);
          }
        }
        const response = await this.guardarXTitulo(
          this.titInformSel,
          titulosArr,
          [],
          [],
          []
        );

        this.mostrar_carga_todo = false;
        if (response.id !== '1') {
          this.toaster.error('No se pudo guardar los cambios', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
          });
        } else {
          await this.listarPesosPorUsuario();
          this.toaster.success('Se guardo correctamente', 'Correcto', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  // async asignarTitulosConfPesosCom() {
  //   for (const element of this.tablaPrincipal) {
  //     const long = element.item.split('.');
  //     if (long.length == 1) {
  //       // element.
  //       let arr = []
  //       if (element.estilo) {
  //           const arrStilos = JSON.parse(element.estilo)
  //           if (arrStilos.length == 4) {
  //             arr = [arrStilos,]
  //           }
  //       } else {

  //       }
  //       element.estilo = JSON.stringify(arr)
  //     }
  //   }
  // }

  getDiametro(row: any): any {
    let diametro = null;
    if (!row.diametro?.includes('(C)') && !row.diametro?.includes('(L)')) {
      diametro = row.diametro + (row.tipoacero == 'CORRUGADO' ? '(C)' : '(L)');
    } else {
      diametro = row.diametro;
    }
    const existe = this.listaPesos.some((peso) => peso.medida === diametro);
    return existe ? row.diametro : null;
  }

  async limpiarTablasSeleccionado() {
    try {
      const string = this.partidaSeleccionada
        ? this.partidaSeleccionada.unidad
          ? 'Se limpiara toda informacion registrada para la partida seleccionada'
          : 'Se limpiara toda informacion registrada en todas las partidas pertenecientes al grupo seleccionado'
        : 'Se limpiara toda la informacion registrada en todo el titulo seleccionado';
      const sw = await SwalService.confirm('Estas seguro?', string);
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        let indicesEliminar = [];
        let titulos = [];
        if (!this.partidaSeleccionada) {
          for (const element of this.tablaTitulo) {
            if (element.unidad) {
              await this.limpiarFila(element.ind2);
              indicesEliminar.push(element.indice);
            } else {
              titulos.push(element.ind2);
            }
          }
        } else if (this.partidaSeleccionada.unidad) {
          await this.limpiarFila(this.partidaSeleccionada.ind2);
          indicesEliminar.push(this.partidaSeleccionada.indice);
        } else {
          let encontrados = [];
          const titem = this.partidaSeleccionada.item + '.';
          encontrados = await this.tablaTitulo.filter(
            (ele) => ele.item.includes(titem) && ele.unidad
          );
          for (let partida of encontrados) {
            await this.limpiarFila(partida.ind2);
            indicesEliminar.push(partida.indice);
          }
        }
        this.tablaSistemaProyecto = await this.tablaSistemaProyecto.filter(
          (ele) => !indicesEliminar.includes(ele.indice)
        );
        this.tablaAcerosProyecto = await this.tablaAcerosProyecto.filter(
          (ele) => !indicesEliminar.includes(ele.indice)
        );
        this.tablaSistemaProyecto.map((ele, index) => (ele.ind = index));
        this.tablaAcerosProyecto.map((ele, index) => (ele.ind = index));
        if (this.partidaSeleccionada?.unidad) {
          const index = JSON.parse(JSON.stringify(this.filaSel));
          this.filaSel = null;
          await this.seleccionRowTablaTit(this.tablaTitulo[index], index);
        }
        this.actuaParcialesTitulos();
        this.calcularPorcentajeRegistro(this.tablaTitulo, 0);
        this.actualizarTemp();
        this.mostrar_carga_todo = false;
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      SwalService.error();
      console.log(e);
    }
  }

  async limpiarFila(index) {
    this.tablaTitulo[index].cant_metrado = this.formsService.redondeo(
      0,
      this.dec_metrado
    );
    this.tablaTitulo[index].parcial =
      Number(this.tablaTitulo[index].cant_metrado) *
      Number(this.tablaTitulo[index].precio);
    this.tablaTitulo[index].editadoMetrado = 1;
    this.tablaTitulo[index].ed_pre = 0;
    this.tablaTitulo[index].metrado = this.formsService.redondeo(
      0,
      this.dec_metrado
    );
    this.tablaTitulo[index].permitirCambio = 1;
    this.tablaTitulo[index].totalAceros = this.formsService.redondeo(
      0,
      this.dec_metrado
    );
    this.tablaPrincipal[this.tablaTitulo[index].ind] = this.tablaTitulo[index];
  }

  async vincularHojasMetradoAMetrado() {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      null,
      'Se vinculara el monto de hojas metrado de todas las partidas relacionadas al titulo'
    );
    if (sw.isConfirmed) {
      this.mostrar_carga_todo = true;
      let crearTemp = false;
      for (let row of this.tablaTitulo) {
        if (row.unidad && Number(row.cant_metrado) !== Number(row.metrado)) {
          row.cant_metrado = this.formsService.redondeo(
            Number(row.metrado),
            this.dec_metrado
          );
          row.parcial = this.formsService.redondeo(
            Number(row.precio) * Number(row.cant_metrado),
            this.dec_parcial
          );
          row.editadoMetrado = 1;
          row.vinculado = 0;
          row.ed_pre = 0;
        }
      }
      this.actuaParcialesTitulos();
      this.calcularPorcentajeRegistro(this.tablaTitulo, 0);
      this.stiloFormula();
      if (crearTemp) {
        this.actualizarTemp();
      }

      // await this.guardarTablaTemporal('vincularHojasMetradoAMetrado');
      this.mostrar_carga_todo = false;
      this.toaster.success('Se  actualizó correctamente', 'Correcto', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
    }
  }

  async modalEstilosDetalle() {
    const obj = {
      stilosTit: this.stilosTit,
      stilosMet: this.stilosMet,
      stilosSubM: this.stilosSubM,
      stilosTexto: this.stilosTexto,
    };
    this.ultStilos = JSON.parse(JSON.stringify(obj));
    this.modalEstilos.show();
  }

  async cerrarModal() {
    if (this.ultStilos) {
      this.stilosTit = this.ultStilos.stilosTit;
      this.stilosMet = this.ultStilos.stilosMet;
      this.stilosSubM = this.ultStilos.stilosSubM;
      this.stilosTexto = this.ultStilos.stilosTexto;
    }
    this.modalEstilos.hide();
  }

  cambiarcolor(valor, fila, columna) {
    this[fila][columna] = valor;
  }

  async actualizarEstilosProyecto() {
    this.mostrar_carga_todo = true;
    const stilos = [
      this.stilosTit,
      this.stilosMet,
      this.stilosSubM,
      this.stilosTexto,
    ];
    let titulosArr = [];
    for (const element of this.tablaPrincipal) {
      const itemSplit = element.item.split('.');
      if (itemSplit.length == 1) {
        let array = [];
        // if (element.estilo) {
        //   const stiloArr = JSON.parse(element.estilo);
        //   if (stiloArr.length > 2) {
        //     array = [stilos, null];
        //   } else if (stiloArr.length == 1) {
        //     array = [stilos, null];
        //   } else if (stiloArr.length == 2) {
        //     array = [stilos, stiloArr[1]];
        //   }
        // } else {
        //   array = [stilos, null];
        // }
        const textoa = JSON.stringify(stilos);
        const textob = JSON.stringify(this.ocultosPesorCom);
        const entexto = textoa + '@' + textob;

        element.estilo = entexto;
        // element.editadoMetrado = 1;
        titulosArr.push(element);
      }
    }
    const response = await this.guardarXTitulo(
      this.titInformSel,
      titulosArr,
      [],
      [],
      []
    );
    this.mostrar_carga_todo = false;
    if (response.id !== '1') {
      this.toaster.error('No se pudo guardar los cambios', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
    } else {
      this.modalEstilos.hide();
      this.toaster.success('Se guardo correctamente', 'Correcto', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
    }
    // this.actualizarTemp();
  }

  async impresionMetrado(tipo) {
    try {
      this.mostrar_carga_todo = true;
      const temporal = this.existeTemp;
      const temporalPresu = await this.verificarCambiosPresupuesto();
      if (temporal || temporalPresu.length) {
        let msj = '';
        if (temporal && temporalPresu.length) {
          msj = 'Existen cambios sin guardar en presupuesto y hojas de metrado';
        } else if (!temporal && temporalPresu.length) {
          msj = 'Existen cambios sin guardar en presupuesto ';
        } else if (temporal && !temporalPresu.length) {
          msj = 'Existen cambios sin guardar en hojas de metrado ';
        }
        this.mostrar_carga_todo = false;
        this.toaster.error(msj, '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      } else {
        let tablaCompleta = [];
        let tabla = [];
        let arrayHeader = [];
        let keys_body = [];
        let col_alig = [];
        let keys_dec = [];
        let orientacion = '';
        let tipoRep = 0;
        let tituloaux;
        if (this.titInformSel.tipo_registro == 1) {
          const response = await this.listarTablaExcel(
            this.titInformSel.indice,
            this.titInformSel.item
          );
          tipoRep = 2;
          if (response) {
            if (response[1]) {
              var structuraheader = await this.estructurarHeader(
                response[1][0]
              );
              if (structuraheader.grupos_header) {
                let h1 = [];
                if (structuraheader.grupos_header.i > 0) {
                  const obj = {
                    text: '',
                    colSpan: structuraheader.grupos_header.i,
                    rowSpan: 1,
                  };
                  h1.push(obj);
                }
                if (structuraheader.grupos_header.g > 0) {
                  const obj = {
                    text: 'Generales',
                    colSpan: structuraheader.grupos_header.g,
                    rowSpan: 1,
                  };
                  h1.push(obj);
                }
                if (structuraheader.grupos_header.d > 0) {
                  const obj = {
                    text: 'Descuentos',
                    colSpan: structuraheader.grupos_header.d,
                    rowSpan: 1,
                  };
                  h1.push(obj);
                }
                if (structuraheader.grupos_header.f > 0) {
                  const obj = {
                    text: '',
                    colSpan: structuraheader.grupos_header.f,
                    rowSpan: 1,
                  };
                  h1.push(obj);
                }
                if (h1.length) {
                  arrayHeader.push(h1);
                }
              }
              if (structuraheader.header2) {
                let h2 = [];
                for (const celda of structuraheader.header2) {
                  const obj = {
                    text: celda.toUpperCase(),
                    colSpan: 1,
                    rowSpan: 1,
                  };
                  h2.push(obj);
                }
                if (h2.length) {
                  arrayHeader.push(h2);
                  if (h2.length > 6) {
                    orientacion = 'landscape';
                  }
                }
              }
              if (structuraheader.header) {
                keys_body = structuraheader.header;
                const arrLeft = ['item', 'descripcion'];
                const arrright = [
                  'mtotal',
                  'subtotal',
                  'gsubtotal',
                  'dsubtotal',
                  'mparcial',
                ];
                for (const key of keys_body) {
                  let dec = null;
                  let alineamiento = 'center';
                  if (arrLeft.includes(key)) {
                    alineamiento = 'left';
                  }
                  if (arrright.includes(key)) {
                    alineamiento = 'right';
                    dec = this.dec_metrado;
                  }

                  col_alig.push(alineamiento);
                  keys_dec.push(dec);
                }
              }
            }
            if (response[0]) {
              tabla = response[0];
            }

            for (const iterator of tabla) {
              let obj2 = {};
              if (iterator.item) {
                let tipol = '';
                let colorl = '';
                let fondol = '';
                let valor2 = iterator.item.toString().split('.');
                if (this.titulo1letra != undefined) {
                  if (iterator.unidad) {
                    colorl = this.titulo1letra[11];
                  } else {
                    let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                    colorl = this.titulo1letra[ind];
                  }
                }
                if (this.titulo1color != undefined) {
                  if (iterator.unidad) {
                    fondol = this.titulo1color[11];
                  } else {
                    let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                    fondol = this.titulo1color[ind];
                  }
                }
                if (this.titulo1 != undefined) {
                  if (iterator.unidad) {
                    tipol = this.titulo1[11];
                  } else {
                    let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                    tipol = this.titulo1[ind];
                  }
                }
                for (const key of keys_body) {
                  obj2[key] = iterator[key] ? iterator[key] : '';
                }

                obj2['tipoletra'] = tipol;
                obj2['color'] = colorl == 'unset' ? '' : colorl;
                obj2['fondo'] = fondol == 'none' ? '' : fondol;
                obj2['alinea'] = '';
                obj2['fontSize'] = '';
              } else {
                for (const key of keys_body) {
                  obj2[key] = iterator[key] ? iterator[key] : '';
                }

                if (iterator.nivel == 1) {
                  const alineamiento =
                    this.stilosTit.alineamiento == 'start'
                      ? 'left'
                      : this.stilosTit.alineamiento == 'end'
                      ? 'right'
                      : this.stilosTit.alineamiento;
                  obj2['tipoletra'] = this.stilosTit.tipo;
                  obj2['color'] = this.stilosTit.color;
                  obj2['fondo'] = '';
                  obj2['alinea'] = alineamiento;
                  obj2['fontSize'] = this.stilosTit.size;
                } else if (iterator.nivel == 4) {
                  const alineamiento =
                    this.stilosTexto.alineamiento == 'start'
                      ? 'left'
                      : this.stilosTexto.alineamiento == 'end'
                      ? 'right'
                      : this.stilosTexto.alineamiento;
                  obj2['tipoletra'] = this.stilosTexto.tipo;
                  obj2['color'] = this.stilosTexto.color;
                  obj2['fondo'] = '';
                  obj2['alinea'] = alineamiento;
                  obj2['fontSize'] = this.stilosTexto.size;
                } else if (iterator.nivel == 2) {
                  const alineamiento =
                    this.stilosMet.alineamiento == 'start'
                      ? 'left'
                      : this.stilosMet.alineamiento == 'end'
                      ? 'right'
                      : this.stilosMet.alineamiento;
                  obj2['tipoletra'] = this.stilosMet.tipo;
                  obj2['color'] = this.stilosMet.color;
                  obj2['fondo'] = '';
                  obj2['alinea'] = alineamiento;
                  obj2['fontSize'] = this.stilosMet.size;
                } else if (iterator.nivel == 3 || !iterator.nivel) {
                  const alineamiento =
                    this.stilosSubM.alineamiento == 'start'
                      ? 'left'
                      : this.stilosSubM.alineamiento == 'end'
                      ? 'right'
                      : this.stilosSubM.alineamiento;
                  obj2['tipoletra'] = this.stilosSubM.tipo;
                  obj2['color'] = this.stilosSubM.color;
                  obj2['fondo'] = '';
                  obj2['alinea'] = alineamiento;
                  obj2['fontSize'] = this.stilosSubM.size;
                }
              }
              tablaCompleta.push(obj2);
            }
          }
          tituloaux = 'HOJA DE METRADO DESAGREGADO';
        } else {
          const obj = {
            id_proyecto: this.idProyecto,
            titulo: this.titInformSel.item,
          };
          const response = await this.metradoService.tablasMetradoTit(obj);
          tabla = response[0];
          const detallesSistema = response[1];
          const detalleAceros = response[2];
          if (tipo == 0) {
            tituloaux = 'RESUMEN DEL METRADO';
            arrayHeader = ['ITEM', 'DESCRIPCIÓN', 'UNIDAD', 'METRADO'];
            keys_dec = [null, null, null, this.dec_metrado];
            col_alig = ['left', 'left', 'center', 'right'];
            keys_body = ['item', 'descripcion', 'unidad', 'cant_metrado'];
            for (const iterator of tabla) {
              let tipol = '';
              let colorl = '';
              let fondol = '';
              let valor2 = iterator.item.toString().split('.');
              if (this.titulo1letra != undefined) {
                if (iterator.unidad) {
                  colorl = this.titulo1letra[11];
                } else {
                  let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                  colorl = this.titulo1letra[ind];
                }
              }
              if (this.titulo1color != undefined) {
                if (iterator.unidad) {
                  fondol = this.titulo1color[11];
                } else {
                  let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                  fondol = this.titulo1color[ind];
                }
              }
              if (this.titulo1 != undefined) {
                if (iterator.unidad) {
                  tipol = this.titulo1[11];
                } else {
                  let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                  tipol = this.titulo1[ind];
                }
              }
              const metrado =
                Number(iterator.cant_metrado) == 0
                  ? iterator.cantidad
                  : Number(iterator.cant_metrado);
              const obj = {
                item: iterator.item,
                descripcion: iterator.descripcion, //es aca creo
                unidad: iterator.unidad,
                cant_metrado: this.formsService.redondeo(
                  metrado,
                  this.dec_metrado
                ),
                tipoletra: tipol,
                color: colorl == 'unset' ? '' : colorl,
                fondo: fondol == 'none' ? '' : fondol,
                alinea: '',
                fonstSize: '',
              };
              tablaCompleta.push(obj);
            }
          } else if (tipo == 1) {
            tituloaux = 'HOJA DE METRADO DESAGREGADO';
            tipoRep = 2;
            arrayHeader = [
              'ITEM',
              'DESCRIPCIÓN',
              'CANTIDAD',
              'N VECES',
              'LARGO',
              'ANCHO',
              'ALTURA',
              'PARCIAL',
              'SUBTOTAL',
              'METRADO',
              'UNIDAD',
            ];
            orientacion = 'landscape';
            col_alig = [
              'left',
              'left',
              'left',
              'left',
              'left',
              'left',
              'left',
              'right',
              'right',
              'right',
              'center',
            ];
            keys_body = [
              'item',
              'descripcion',
              'cantidad',
              'n_veces',
              'largo',
              'ancho',
              'altura',
              'parcial',
              'subtotal',
              'cant_metrado',
              'unidad',
            ];
            keys_dec = [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              this.dec_metrado,
              this.dec_metrado,
              this.dec_metrado,
              null,
            ];
            for (const iterator of tabla) {
              let tipol = '';
              let colorl = '';
              let fondol = '';
              let valor2 = iterator.item.toString().split('.');
              if (this.titulo1letra != undefined) {
                if (iterator.unidad) {
                  colorl = this.titulo1letra[11];
                } else {
                  let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                  colorl = this.titulo1letra[ind];
                }
              }
              if (this.titulo1color != undefined) {
                if (iterator.unidad) {
                  fondol = this.titulo1color[11];
                } else {
                  let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                  fondol = this.titulo1color[ind];
                }
              }
              if (this.titulo1 != undefined) {
                if (iterator.unidad) {
                  tipol = this.titulo1[11];
                } else {
                  let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                  tipol = this.titulo1[ind];
                }
              }
              const metrado =
                Number(iterator.cant_metrado) == 0
                  ? iterator.cantidad
                  : Number(iterator.cant_metrado);
              const obj = {
                item: iterator.item,
                descripcion: iterator.descripcion,
                unidad: iterator.unidad,
                cant_metrado: this.formsService.redondeo(
                  metrado,
                  this.dec_metrado
                ),
                n_veces: null,
                largo: null,
                ancho: null,
                altura: null,
                parcial: null,
                subtotal: null,
                tipoletra: tipol,
                color: colorl == 'unset' ? '' : colorl,
                fondo: fondol == 'none' ? '' : fondol,
                alinea: '',
                fonstSize: '',
              };
              tablaCompleta.push(obj);
              // if (iterator.item && iterator.unidad) {
              const filtrados = detallesSistema.filter(
                (ele) => ele.indice == iterator.indice
              );
              if (filtrados.length) {
                for (const row of filtrados) {
                  let obj2 = {};
                  for (const key of keys_body) {
                    let texto = null;
                    if (key == 'item' || key == 'unidad' || key == 'metrado') {
                      texto = '';
                    } else {
                      const arraynoValido = ['parcial', 'subtotal'];
                      // if (row.estitulo || row.tieneSubmetrado) {
                      //   if (arraynoValido.includes(key)) {
                      //     texto = '';
                      //   } else {
                      //     texto =
                      //       key == 'parcial' || key == 'subtotal'
                      //         ? this.formsService.redondeo(
                      //             row[key],
                      //             this.dec_metrado
                      //           )
                      //         : row[key] !== undefined
                      //         ? row[key]
                      //         : '';
                      //   }
                      // } else {
                      //   texto = row[key] !== undefined ? row[key] : '';
                      // }
                      if (
                        (row.estitulo && arraynoValido.includes(key)) ||
                        (!row.esMetrado && !row.estitulo && key == 'subtotal')
                      ) {
                        texto = '';
                      } else if (row.tieneSubmetrado && key == 'parcial') {
                        texto = '';
                      } else {
                        texto =
                          key == 'parcial' || key == 'subtotal'
                            ? this.formsService.redondeo(
                                row[key],
                                this.dec_metrado
                              )
                            : row[key] !== undefined
                            ? row[key]
                            : '';
                      }
                      obj2[key] =
                        texto !== undefined && texto !== null ? texto : '';
                    }
                  }
                  if (row.estitulo == 1) {
                    const alineamiento =
                      this.stilosTit.alineamiento == 'start'
                        ? 'left'
                        : this.stilosTit.alineamiento == 'end'
                        ? 'right'
                        : this.stilosTit.alineamiento;
                    obj2['tipoletra'] = this.stilosTit.tipo;
                    obj2['color'] = this.stilosTit.color;
                    obj2['fondo'] = '';
                    obj2['alinea'] = alineamiento;
                    obj2['fontSize'] = this.stilosTit.size;
                  } else if (row.estitulo == 2) {
                    const alineamiento =
                      this.stilosTexto.alineamiento == 'start'
                        ? 'left'
                        : this.stilosTexto.alineamiento == 'end'
                        ? 'right'
                        : this.stilosTexto.alineamiento;
                    obj2['tipoletra'] = this.stilosTexto.tipo;
                    obj2['color'] = this.stilosTexto.color;
                    obj2['fondo'] = '';
                    obj2['alinea'] = alineamiento;
                    obj2['fontSize'] = this.stilosTexto.size;
                  } else if (!row.estitulo && row.esMetrado) {
                    const alineamiento =
                      this.stilosMet.alineamiento == 'start'
                        ? 'left'
                        : this.stilosMet.alineamiento == 'end'
                        ? 'right'
                        : this.stilosMet.alineamiento;
                    obj2['tipoletra'] = this.stilosMet.tipo;
                    obj2['color'] = this.stilosMet.color;
                    obj2['fondo'] = '';
                    obj2['alinea'] = alineamiento;
                    obj2['fontSize'] = this.stilosMet.size;
                  } else if (!row.estitulo && !row.esMetrado) {
                    const alineamiento =
                      this.stilosSubM.alineamiento == 'start'
                        ? 'left'
                        : this.stilosSubM.alineamiento == 'end'
                        ? 'right'
                        : this.stilosSubM.alineamiento;
                    obj2['tipoletra'] = this.stilosSubM.tipo;
                    obj2['color'] = this.stilosSubM.color;
                    obj2['fondo'] = '';
                    obj2['alinea'] = alineamiento;
                    obj2['fontSize'] = this.stilosSubM.size;
                  }
                  obj2['formula']=row.id_padre
                  obj2['esmetrado']=row.esMetrado
                  obj2['estitulo']=row.estitulo
                  tablaCompleta.push(obj2);
                }
              }
              // }
            }
          } else if (tipo == 2) {
            tituloaux = 'HOJA DE METRADO DE ACERO';
            const h1 = [
              { text: '', colSpan: 2, rowSpan: 1 },
              { text: 'CANTIDAD', colSpan: 1, rowSpan: 2 },
              { text: 'CANTIDAD', colSpan: 2, rowSpan: 1 },
              { text: 'LONGITUD(m)', colSpan: 2, rowSpan: 1 },
              { text: '', colSpan: 2, rowSpan: 1 },
              { text: 'TOTAL(Kg)', colSpan: 2, rowSpan: 1 },
              { text: '', colSpan: 2, rowSpan: 1 },
            ];
            arrayHeader.push(h1);
            const h2 = [
              { text: 'ITEM', colSpan: 1, rowSpan: 1 },
              { text: 'DESCRIPCIÓN', colSpan: 1, rowSpan: 1 },
              { text: '# ELEMENTOS', colSpan: 1, rowSpan: 1 },
              { text: 'TOTAL', colSpan: 1, rowSpan: 1 },
              { text: 'POR DISEÑO', colSpan: 1, rowSpan: 1 },
              { text: 'TOTAL', colSpan: 1, rowSpan: 1 },
              { text: 'Ø', colSpan: 1, rowSpan: 1 },
              { text: 'PESO', colSpan: 1, rowSpan: 1 },
              { text: 'PARCIAL', colSpan: 1, rowSpan: 1 },
              { text: 'SUB TOTAL', colSpan: 1, rowSpan: 1 },
              { text: 'METRADO', colSpan: 1, rowSpan: 1 },
              { text: 'UNIDAD', colSpan: 1, rowSpan: 1 },
            ];
            orientacion = 'landscape';
            tipoRep = 2;
            arrayHeader.push(h2);
            keys_body = [
              'item',
              'descripcion',
              'cantidad',
              'elementos',
              'total1',
              'longitud',
              'total2',
              'diametro',
              'pesodiametro',
              'parcial',
              'subtotal',
              'metrado',
              'unidad',
            ];
            keys_dec = [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              this.dec_metrado,
              this.dec_metrado,
              this.dec_metrado,
              null,
            ];
            col_alig = [
              'left',
              'left',
              'center',
              'center',
              'right',
              'center',
              'right',
              'center',
              'center',
              'right',
              'right',
              'right',
              'center',
            ];

            for (const iterator of tabla) {
              if (iterator.unidad && iterator.item) {
                const filtrados = detalleAceros.filter(
                  (ele) => ele.indice == iterator.indice
                );
                if (filtrados.length) {
                  let tipol = '';
                  let colorl = '';
                  let fondol = '';
                  let valor2 = iterator.item.toString().split('.');
                  if (this.titulo1letra != undefined) {
                    if (iterator.unidad) {
                      colorl = this.titulo1letra[11];
                    } else {
                      let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                      colorl = this.titulo1letra[ind];
                    }
                  }
                  if (this.titulo1color != undefined) {
                    if (iterator.unidad) {
                      fondol = this.titulo1color[11];
                    } else {
                      let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                      fondol = this.titulo1color[ind];
                    }
                  }
                  if (this.titulo1 != undefined) {
                    if (iterator.unidad) {
                      tipol = this.titulo1[11];
                    } else {
                      let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
                      tipol = this.titulo1[ind];
                    }
                  }
                  const metrado =
                    Number(iterator.cant_metrado) == 0
                      ? iterator.cantidad
                      : Number(iterator.cant_metrado);
                  const obj = {
                    item: iterator.item,
                    descripcion: iterator.descripcion,
                    unidad: iterator.unidad,
                    metrado: this.formsService.redondeo(
                      metrado,
                      this.dec_metrado
                    ),
                    cantidad: null,
                    elementos: null,
                    total1: null,
                    longitud: null,
                    total2: null,
                    diametro: null,
                    pesodiametro: null,
                    parcial: null,
                    subtotal: null,
                    tipoletra: tipol,
                    color: colorl == 'unset' ? '' : colorl,
                    fondo: fondol == 'none' ? '' : fondol,
                    alinea: '',
                    fonstSize: '',
                  };
                  tablaCompleta.push(obj);
                  for (const row of filtrados) {
                    let obj2 = {};
                    for (const key of keys_body) {
                      let texto = null;
                      if (
                        key == 'item' ||
                        key == 'unidad' ||
                        key == 'metrado'
                      ) {
                        texto = '';
                      } else {
                        const arraynoValido = [
                          'total1',
                          'total2',
                          'diametro',
                          'pesodiametro',
                          'parcial',
                          'subtotal',
                        ];
                        const arraynoValido2 = [
                          'total1',
                          'total2',
                          'diametro',
                          'pesodiametro',
                          'parcial',
                        ];
                        // if (row.estitulo || row.tieneSubmetrado) {
                        //   if (arraynoValido.includes(key)) {
                        //     texto = '';
                        //   } else {
                        //     texto =
                        //       key == 'parcial' || key == 'subtotal'
                        //         ? this.formsService.redondeo(
                        //             row[key],
                        //             this.dec_metrado
                        //           )
                        //         : row[key] !== undefined
                        //         ? row[key]
                        //         : '';
                        //   }
                        // } else {
                        //   if (key == 'subtotal' && !row.estitulo && !row.esMetrado) {
                        //     texto = ''
                        //   } else {
                        //     texto = row[key] !== undefined ? row[key] : '';
                        //   }

                        // }
                        if (row.estitulo && arraynoValido.includes(key)) {
                          texto = '';
                        } else if (
                          row.tieneSubmetrado &&
                          arraynoValido2.includes(key)
                        ) {
                          texto = '';
                        } else {
                          texto =
                            key == 'parcial' || key == 'subtotal'
                              ? this.formsService.redondeo(
                                  row[key],
                                  this.dec_metrado
                                )
                              : row[key] !== undefined
                              ? row[key]
                              : '';
                        }
                        obj2[key] =
                          texto !== undefined && texto !== null ? texto : '';
                      }
                    }
                    if (row.estitulo == 1) {
                      const alineamiento =
                        this.stilosTit.alineamiento == 'start'
                          ? 'left'
                          : this.stilosTit.alineamiento == 'end'
                          ? 'right'
                          : this.stilosTit.alineamiento;
                      obj2['tipoletra'] = this.stilosTit.tipo;
                      obj2['color'] = this.stilosTit.color;
                      obj2['fondo'] = '';
                      obj2['alinea'] = alineamiento;
                      obj2['fontSize'] = this.stilosTit.size;
                    } else if (row.estitulo == 2) {
                      const alineamiento =
                        this.stilosTexto.alineamiento == 'start'
                          ? 'left'
                          : this.stilosTexto.alineamiento == 'end'
                          ? 'right'
                          : this.stilosTexto.alineamiento;
                      obj2['tipoletra'] = this.stilosTexto.tipo;
                      obj2['color'] = this.stilosTexto.color;
                      obj2['fondo'] = '';
                      obj2['alinea'] = alineamiento;
                      obj2['fontSize'] = this.stilosTexto.size;
                    } else if (!row.estitulo && row.esMetrado) {
                      const alineamiento =
                        this.stilosMet.alineamiento == 'start'
                          ? 'left'
                          : this.stilosMet.alineamiento == 'end'
                          ? 'right'
                          : this.stilosMet.alineamiento;
                      obj2['tipoletra'] = this.stilosMet.tipo;
                      obj2['color'] = this.stilosMet.color;
                      obj2['fondo'] = '';
                      obj2['alinea'] = alineamiento;
                      obj2['fontSize'] = this.stilosMet.size;
                    } else if (!row.estitulo && !row.esMetrado) {
                      const alineamiento =
                        this.stilosSubM.alineamiento == 'start'
                          ? 'left'
                          : this.stilosSubM.alineamiento == 'end'
                          ? 'right'
                          : this.stilosSubM.alineamiento;
                      obj2['tipoletra'] = this.stilosSubM.tipo;
                      obj2['color'] = this.stilosSubM.color;
                      obj2['fondo'] = '';
                      obj2['alinea'] = alineamiento;
                      obj2['fontSize'] = this.stilosSubM.size;
                    }
                    tablaCompleta.push(obj2);
                  }
                }
              }
            }
          }
        }

        let datos = {
          datos_proyecto: this.datosproy,
          header: arrayHeader,
          keys_body: keys_body,
          keys_dec: keys_dec,
          col_alig: col_alig,
          tabla: tablaCompleta,
          concat_tabla2: false,
          tipo_reporte: tipoRep,
          orientacion: orientacion,
          moneda: this.simbolo, // condicionar
          titulo: tituloaux,
        };
        datos.datos_proyecto.subproyecto = this.titInformSel?.descripcion;
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
    } catch (e) {
      this.mostrar_carga_todo = false;
      SwalService.error();
      console.log(e);
    }
  }

  async listarTablaExcel(indice,item) {
    try {
      const obj = {
        id_proyecto: this.idProyecto,
        indice_tit: indice,
        item:item,
      };
      const response = await this.metradoService.listarTopMetrados(obj);
      console.log(response)
      return response;
    } catch (e) {
      SwalService.error();
      console.log(e);
    }
  }

  async estructurarHeader(plantilla) {
    let arrayNuevo = {};
    let headerExcel = { grupos_header: null, header: [], header2: [] };
    if (plantilla) {
      Object.entries(plantilla).forEach(([key, value]) => {
        if (
          typeof value == 'string' &&
          value !== null &&
          key !== 'id_plantilla' &&
          key !== 'id_usuario'
        ) {
          arrayNuevo[key] = isNaN(parseInt(value)) ? '' : parseInt(value);
        }
      });
      let nuevo = [];
      nuevo.length = Object.keys(arrayNuevo).length;
      for (let i in arrayNuevo) {
        if (arrayNuevo[i] !== null && arrayNuevo[i] !== '') {
          nuevo[arrayNuevo[i]] = i;
        }
      }
      const object = Object.assign({}, nuevo);
      const obj = [];
      let icols = 0;
      let dcols = 0;
      let gcols = 0;
      let fcols = 0;
      let cambio = false;
      for (let j in object) {
        const valor = object[j];
        arraygcols.includes(valor) ? gcols++ : '';
        arraydcols.includes(valor) ? dcols++ : '';
        if (gcols || dcols) {
          arrayicols.includes(valor) ? fcols++ : '';
        } else {
          arrayicols.includes(valor) ? icols++ : '';
        }
        if (valor !== 'nom_plantilla') {
          obj.push(valor);
        }
      }
      const grupos = {
        i: icols,
        g: gcols,
        d: dcols,
        f: fcols,
      };
      let arra = [];
      const arrayG = [
        'gdescripcion',
        'gcantidad',
        'gfactor',
        'gnveces',
        'glongitud',
        'gancho',
        'galtura',
        'gsubtotal',
      ];
      const arrayD = [
        'ddescripcion',
        'dcantidad',
        'dfactor',
        'dnveces',
        'dlongitud',
        'dancho',
        'daltura',
        'dsubtotal',
      ];
      const arrayM = ['mparcial', 'mtotal'];
      for (let elemento of obj) {
        if (elemento == 'nom_plantilla') {
        } else {
          if (
            arrayG.includes(elemento) ||
            arrayD.includes(elemento) ||
            arrayM.includes(elemento)
          ) {
            const newStr = elemento.slice(1);
            arra.push(newStr);
          } else {
            arra.push(elemento);
          }
        }
      }
      headerExcel.header2 = arra;
      headerExcel.grupos_header = grupos;
      headerExcel.header = obj;
    } else {
      headerExcel.header2 = null;
      headerExcel.grupos_header = null;
      headerExcel.header = null;
    }
    return headerExcel;
  }

  //excel
  async seleccionTablaExcel(row, i) {
    this.filaExcelSel = row;
    this.indexTablaExcel = i;
  }

  async multipleSeleccion() {
    this.excelMultiple = !this.excelMultiple;
    // if (this.tablaExcelAdjunta.length) {
    //   console.log(this.tablaExcelAdjunta);
    // }
  }

  async cambioCheckExcel(i, event) {
    this.tablaExcelAdjunta[i].seleccionado = event.checked;
  }

  async nivelSeleccionado(nivel) {
    if (this.excelMultiple) {
      this.mostrar_carga_todo = true;
      let i = 0;
      for (const iterator of this.tablaExcelAdjunta) {
        if (iterator.seleccionado) {
          iterator.nivel = Number(nivel);
          iterator.filaModificada = true;
          this.tablaExcelAdjunta[i].nivel = Number(nivel);
          this.tablaExcelAdjunta[i].filaModificada = true;
        }
        i++;
      }
      this.mostrar_carga_todo = false;
    } else {
      if (this.filaExcelSel) {
        this.filaExcelSel.nivel = Number(nivel);
        this.filaExcelSel.filaModificada = true;
        this.tablaExcelAdjunta[this.indexTablaExcel].nivel = Number(nivel);
        this.tablaExcelAdjunta[this.indexTablaExcel].filaModificada = true;
      } else {
        this.toaster.error('Ninguna Fila seleccionada', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        });
        return;
      }
    }
  }

  async seleccionarTodoPartida(index) {
    for (let i = index + 1; i < this.tablaExcelAdjunta.length; i++) {
      if (
        (this.tablaExcelAdjunta[i].tipo == 0 ||
          this.tablaExcelAdjunta[i].tipo == null) &&
        !this.tablaExcelAdjunta[i].item
      ) {
        this.tablaExcelAdjunta[i].filaModificada = true;
        this.tablaExcelAdjunta[i].seleccionado = true;
      } else {
        break;
      }
    }
  }

  maxtodoExcel() {
    for (let row of this.tablaExcelAdjunta) {
      row.mostrar = 1;
      row.icomost = 1;
    }
  }

  mintodoExcel() {
    for (let row of this.tablaExcelAdjunta) {
      if (!row.item) {
        // if (row.item.split('.').length > 1) {
        row.mostrar = 0;

        row.icomost = 1;
      }
      //
      else {
        if (row.unidad) {
          row.icomost = 0;
        }
        row.mostrar = 1;
      }
    }
  }

  async toggleOnExcel(itemsel, indice) {
    this.tablaExcelAdjunta[indice].icomost = 1;
    let ind2 = indice + 1;
    for (let i = ind2; i < this.tablaExcelAdjunta.length; i++) {
      if (this.tablaExcelAdjunta[i].tipo == 0) {
        this.tablaExcelAdjunta[i].mostrar = 1;
      } else {
        const spliteado = this.tablaExcelAdjunta[i].item.split('.');
        const splitSelect = itemsel.split('.');
        if (splitSelect.length < spliteado.length) {
          this.tablaExcelAdjunta[i].mostrar = 1;
        } else {
          if (!this.tablaExcelAdjunta[i].item) {
            this.tablaExcelAdjunta[i].mostrar = 1;
          } else {
            break;
          }
        }
      }
    }
  }

  async toggleOffExcel(itemsel, indice) {
    this.tablaExcelAdjunta[indice].icomost = 0;
    let ind2 = indice + 1;
    for (let i = ind2; i < this.tablaExcelAdjunta.length; i++) {
      if (this.tablaExcelAdjunta[i].tipo === 0) {
        this.tablaExcelAdjunta[i].mostrar = 0;
      } else {
        const spliteado = this.tablaExcelAdjunta[i].item.split('.');
        const splitSelect = itemsel.split('.');
        if (splitSelect.length < spliteado.length) {
          this.tablaExcelAdjunta[i].mostrar = 0;
        } else {
          if (!this.tablaExcelAdjunta[i].item) {
            this.tablaExcelAdjunta[i].mostrar = 0;
          } else {
            break;
          }
        }
      }
    }
  }

  async guardarCambiosTablaExcelImportado() {
    const existeCAmbios = await this.tablaExcelAdjunta.find(
      (ele) => ele.filaModificada
    );
    if (existeCAmbios) {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se guardaran todos los cambios realizados en la tabla del titulo : ' +
          this.titInformSel.item +
          ' - ' +
          this.titInformSel?.descripcion
      );
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const modificados = await this.tablaExcelAdjunta.filter(
          (ele) => ele.filaModificada
        );
        const datos1 = JSON.stringify(modificados);
        const obj = JSON.stringify({
          datos1: datos1,
        });
        const response = await this.metradoService.ModificaNivMetradoExcel(obj);

        if (response.id == '1') {
          // await this.guardarSoloStilos()
          // const index = this.dataTitulos.findIndex((object) => {
          //   return object.dataTitulo.indice === Number(this.indiceTitulo);
          // });
          // if (sinGuardar) {
          //   await this.actualizarDataPrincipal();
          //   this.stiloFormula();
          //   await this.guardarTablaTemporal('guardarExcel');
          // }
          this.actualizarTemp();
          this.mostrar_carga_todo = false;
          this.toaster.success(response.mensaje, 'Éxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
        } else {
          this.mostrar_carga_todo = false;
          this.toaster.error(response.mensaje, 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
        }
      }
    } else {
      this.toaster.info('Ningun cambio registrado', null, {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      return;
    }
  }

  async eliminarTablaExcelImportada() {
    try {
      if (this.tablaExcelAdjunta.length) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          'Se eliminará toda la tabla importada relacionada a : ' +
            this.titInformSel.descripcion
        );
        if (sw.isConfirmed) {
          this.mostrar_carga_todo = true;
          const obj = {
            id_proyecto: this.idProyecto,
            indicetit: this.indiceTitulo,
          };
          const response = await this.metradoService.limpiarTopMetrado(
            obj
          );
          console.log(response)
          if (response[0].id == '1') {
            const index = this.tablaTitResumen.findIndex(ele => this.titInformSel.indice == ele.indice)
            this.tablaTitResumen[index].vinculado = false
            this.tablaTitResumen[index].estado_metrado = 0 
            this.headerExcel = null;
            this.tablaExcelAdjunta = [];
            this.toaster.success('Se eliminó correctamente', 'Éxito', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            });
          } else {
            SwalService.error('Error', response[0].mensaje);
          }
          this.mostrar_carga_todo = false;
        }
      } else {
        this.toaster.error('Ninguna tabla excel importada', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
      }
    } catch (e) {
      console.log(e);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  async verTablaTablaPresuExcel() {
    this.verColumnasPresu = !this.verColumnasPresu;
  }

  async cambioTipoRegistro(tipo, i, titulo) {
    if (this.tablaTitResumen[i].estado_metrado == 0) {
      this.tablaTitResumen[i].tipo_registro = tipo.id_tipo;
      // await this.actualizarTituloMetrado(titulo, tipo);
      this.actualizarTemp();
    } else {
      return;
    }
  }

  // async actualizarTituloMetrado(titulo, tipo_registro) {
  //   try {
  //     this.mostrar_carga_todo = true;
  //     if (tipo_registro) {
  //       let tabla = await this.filtrarTitulo(titulo);
  //       await this.limpiarRegistros(tabla, titulo);
  //       // await this.listarMetrados();
  //     }
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       indice: titulo.indice,
  //       tipo_registro: tipo_registro.id_tipo,
  //       estado_metrado: titulo.estado_metrado,
  //     };
  //     const response = await this.metradoService.actualizarTituloMetrado(obj);
  //     if (response[0].res == '1') {
  //       this.mostrar_carga_todo = false;
  //       this.toaster.success(response[0].mensaje, 'Ok', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //     }
  //   } catch (e) {
  //     this.mostrar_carga_todo = false;
  //     SwalService.error();
  //     console.log(e);
  //   }
  // }

  async limpiarRegistros(tabla, tituloSeleccionado) {
    let arrayEditados = [];
    let arrayMetrados = [];
    let arrayAceros = [];
    let arrayEditadosDetalle = [];
    for (let iterator of tabla) {
      if (iterator.unidad) {
        iterator.cant_metrado = this.formsService.redondeo(0, this.dec_metrado);
        iterator.parcial =
          Number(iterator.cant_metrado) * Number(iterator.precio);
        iterator.ed_pre = 0;
        iterator.metrado = this.formsService.redondeo(0, this.dec_metrado);
        iterator.permitirCambio = 1;
        iterator.totalAceros = this.formsService.redondeo(0, this.dec_metrado);
        arrayEditadosDetalle.push(iterator.indice);
        arrayEditados.push(iterator);
      }
    }
    const id_proyecto = this.idProyecto;
    const id_usuario = this.id_usuario;
    const indice_tit = tituloSeleccionado.indice;
    const item_tit = tituloSeleccionado.item;
    const desc_tit = tituloSeleccionado.descripcion;
    const datos1 = JSON.stringify(arrayEditados);
    const datos2 = JSON.stringify(arrayMetrados);
    const datos3 = JSON.stringify(arrayEditadosDetalle);
    const datos4 = JSON.stringify(arrayAceros);
    const obj = JSON.stringify({
      id_proyecto: id_proyecto,
      id_usuario: id_usuario,
      indice_tit: indice_tit,
      item_tit: item_tit,
      desc_tit: desc_tit,
      datos1: datos1,
      datos2: datos2,
      datos3: datos3,
      datos4: datos4,
    });
    const response = await this.metradoService.guardarCambiosMetrado(obj);
  }

  start() {
    try {
      if (!this.running) {
        this.running = true;
        this.startTimer = setInterval(async () => {
          this.tiempo++;
          if (this.tiempo == 5) {
            this.guardarTemporal(
              this.tablaPrincipal,
              this.tablaSistemaProyecto,
              this.tablaAcerosProyecto
            );
            this.stop();
          }
        }, 1000);
      } else {
        this.stop();
      }
    } catch (ex) {
      console.log(ex);
    }
  }
  stop() {
    clearInterval(this.startTimer);
    this.running = false;
    this.tiempo = 0;
  }
  restart() {
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
  }
  actualizarTemp(ind?) {
    if (this.bloqtemp && !this.initim2) {
      //temporales
      this.initim2 = true;
      this.start2();
    } else if (this.tiempo < 5) {
      this.restart();
    } //temporales
    this.existeTemp = true;
  }

  async ngOnDestroy() {
    clearInterval(this.startTimer);
    clearInterval(this.timer2);
    if (this.token) {
      if ((this.running && !this.bloqtemp) || this.initim2) {
        this.guardarTemporal(
          this.tablaPrincipal,
          this.tablaSistemaProyecto,
          this.tablaAcerosProyecto
        );
      }
    }
    this.vincClasiRel$.unsubscribe();
    this.vincPart$.unsubscribe();
  }

  async onNavChange(event) {
    let titulo = null;
    if (event.nextId == 1) {
    } else {
      if (this.indiceTitulo == null) {
        titulo = this.tablaTitResumen[0];
      } else {
        titulo = await this.tablaTitResumen.find(
          (ele) => ele.indice == this.indiceTitulo
        );
      }
      await this.verHojaMetrado(titulo);
    }
  }

  async guardarCambios() {
    try {
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
      }
      if (this.existeTemp) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          'Se guardara todos los cambios realizados'
        );
        if (sw.isConfirmed) {
          this.mostrar_carga_todo = true;
          this.stop();
          let titulosNoguard = [];
          let bloqproy=false;
          for (const element of this.tablaTitResumen) {
            let arrPrinc = [];
            let arrSistm = [];
            let arrAceros = [];
            let arrPrincElim = [];
            let guardarInfTit = true;
            if (element.editable) {
              if (!element.tipo_registro) {
                const partidas = await this.tablaPrincipal.filter(
                  (ele) =>
                    ele.item.split('.')[0] == element.item && ele.editadoMetrado
                );
                if (partidas.length) {
                  for (const row of partidas) {
                    arrPrinc.push(row);
                    arrPrincElim.push(row.indice);
                    const metSiste = await this.tablaSistemaProyecto.filter(
                      (ele) => ele.indice == row?.indice
                    );
                    const metAcer = await this.tablaAcerosProyecto.filter(
                      (ele) => ele.indice == row?.indice
                    );
                    arrSistm = arrSistm.concat(metSiste);
                    arrAceros = arrAceros.concat(metAcer);
                  }
                  // console.log('element', element);
                  // console.log('arrPrinc', arrPrinc);
                  // console.log('arrSistm', arrSistm);
                  // console.log('arrPrincElim', arrPrincElim);
                  // console.log('arrAceros', arrAceros);
                  const resGuard = await this.guardarXTitulo(
                    element,
                    arrPrinc,
                    arrSistm,
                    arrPrincElim,
                    arrAceros
                  );
                  if (resGuard.id !== '1') {
                    console.log('%cEste titulo tiene error : ' + element.item +' --> ' + resGuard.mensaje, 'color: red; font-size: 15px; font-weight: bold;');
                    bloqproy=resGuard.id=='2'?true:false;
                    guardarInfTit = false;
                    titulosNoguard.push(
                      '&#8212; ' + element.item + ' - ' + element.descripcion
                    );
                  } else {
                    for (const ele of partidas) {
                      this.tablaPrincipal[ele.ind].editadoMetrado = 0;
                    }
                  }
                }

                if (guardarInfTit) {
                  const obj = {
                    id_proyecto: this.idProyecto,
                    indice: element.indice,
                    tipo_registro: element.tipo_registro,
                    estado_metrado: element.estado_metrado,
                  };

                  const response =
                    await this.metradoService.actualizarTituloMetrado(obj);
                }
              } else {
                const obj = {
                  id_proyecto: this.idProyecto,
                  indice: element.indice,
                  tipo_registro: element.tipo_registro,
                  estado_metrado: element.estado_metrado,
                };

                const response =
                  await this.metradoService.actualizarTituloMetrado(obj);
              }
            }
          }

          if (titulosNoguard.length) {
            await this.guardarTemporal(
              this.tablaPrincipal,
              this.tablaSistemaProyecto,
              this.tablaAcerosProyecto
            );
            this.mostrar_carga_todo = false;
            if(bloqproy){
              this.toaster.error('Estan guardandose cambios en el proyecto. Intentar mas tarde.','Advertencia',
                {
                  closeButton: false,
                  positionClass: 'toast-bottom-right',
                  timeOut: 5000,
                  enableHtml: true,
                }
              );
            }
            else{
              this.toaster.error(
                'No se pudieron guardar los siguientes titulos :<br>' +
                  titulosNoguard.join(' <br>'),
                null,
                {
                  closeButton: false,
                  positionClass: 'toast-bottom-right',
                  timeOut: 5000,
                  enableHtml: true,
                }
              );
            }
          } else {
            await this.descartarTemporal();
            await this.reiniciarPry();
            this.mostrar_carga_todo = false;
            this.toaster.success('Se guardó correctamente', 'Correcto', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 3000,
            });
            return;
          }
        }
      } else {
        this.toaster.info('No existen cambios para almacenar', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      SwalService.error(e);
      console.log(e);
    }
  }

  async guardarXTitulo(
    titulo,
    arrayEditados,
    arrayMetrados,
    arrayEditadosDetalle,
    arrayAceros
  ) {
    const id_proyecto = this.idProyecto;
    const id_usuario = this.id_usuario;
    const indice_tit = titulo.indice;
    const item_tit = titulo.item;
    const desc_tit = titulo.descripcion;
    const datos1 = JSON.stringify(arrayEditados);
    const datos2 = JSON.stringify(arrayMetrados);
    const datos3 = JSON.stringify(arrayEditadosDetalle);
    const datos4 = JSON.stringify(arrayAceros);
    const obj = JSON.stringify({
      id_proyecto: id_proyecto,
      id_usuario: id_usuario,
      indice_tit: indice_tit,
      item_tit: item_tit,
      desc_tit: desc_tit,
      datos1: datos1,
      datos2: datos2,
      datos3: datos3,
      datos4: datos4,
    });
    const response = await this.metradoService.guardarCambiosMetrado(obj);
    return response;
  }

  async descartarTodosLoscambios() {
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
    }
    if (this.existeTemp) {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se descartaran todos los cambios realizados'
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
        }
        this.mostrar_carga_todo = true;
        this.stop();

        await this.descartarTemporal();
        await this.permisosUsuario();
        await this.pintar();
        await this.listarMetrados();
        const titulo = await this.tablaTitResumen.find(
          (ele) => ele.indice == this.indiceTitulo
        );
        if (this.indiceTitulo !== null && this.activetab == 2) {
          this.indiceTitulo = null;
          await this.verHojaMetrado(titulo);
        }
        // await this.listarTitulos();
        await this.listarPesosPorUsuario();
        this.mostrar_carga_todo = false;
        this.toaster.success('Se descartó correctamente', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
      }
    } else {
      this.toaster.info('Ningun cambio realizado', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
    }
  }

  async calcularMontosRowPrincipal(ind = this.filaSel) {
    const valorEditado = this.tablaTitulo[ind].cant_metrado;
    const parcial = Number(valorEditado) * Number(this.tablaTitulo[ind].precio);
    this.tablaTitulo[ind].parcial = parcial;
    this.actualizarTitulosSuperiores(ind);
  }

  async actualizarTitulosSuperiores(ind) {
    let item = this.tablaTitulo[ind].item;
    let spliteado = item.split('.');
    let titem = '';
    while (spliteado.length > 1) {
      let encontrados = [];
      spliteado.pop();
      titem = spliteado.join('.') + '.';
      encontrados = await this.tablaTitulo.filter((ele) => {
        if (ele.item) {
          var split = ele.item.split('.');
          split.pop();
          if (split.join('.') + '.' == titem) {
            return ele;
          }
        }
      });
      let parcialTotal = 0;
      await encontrados.map(
        (ele) => (parcialTotal = ele.parcial + parcialTotal)
      );
      var elementoPadre = this.tablaTitulo.find(
        (ele) => ele.item && spliteado.join('.') == ele.item
      );
      const redondeado = await this.formsService.redondeo(
        parcialTotal,
        this.dec_parcial
      );
      if (
        elementoPadre &&
        this.tablaTitulo[elementoPadre.ind2].parcial !== parseFloat(redondeado)
      ) {
        this.tablaTitulo[elementoPadre.ind2].parcial = parseFloat(redondeado);
      }
    }
  }

  async actuaParcialesTitulos() {
    let titulos = [];
    for (let i = this.tablaTitulo.length - 1; i >= 0; i--) {
      const row = this.tablaTitulo[i];
      if (!row.unidad) {
        titulos.push(row.ind2);
      }
    }
    for (const element of titulos) {
      await this.updatetitulo2(element);
    }
  }

  async updatetitulo2(indice) {
    const arrayItem = this.tablaTitulo[indice].item.split('.');
    const encontrados = await this.tablaTitulo.filter((ele) => {
      const arrayItem2 = ele.item.split('.');
      arrayItem2.pop();
      if (arrayItem.join('.') == arrayItem2.join('.')) {
        return ele;
      }
    });
    let parcialTotal = 0;
    if (encontrados.length) {
      await encontrados.map(
        (ele) => (parcialTotal = Number(ele.parcial) + parcialTotal)
      );
    } else {
    }
    this.tablaTitulo[indice].parcial = this.formsService.redondeo(
      parcialTotal,
      this.dec_parcial
    );
  }

  async listarTemporal() {
    try {
      const id_proyecto = this.idProyecto;
      const id_usuario = this.id_usuario;
      let tablaPrincipal = [];
      let tablaSistemaProyecto = [];
      let tablaAcerosProyecto = [];
      const obj = {
        id_proyecto: id_proyecto,
        id_usuario: id_usuario,
      };
      const metradotemp =
        await this.metradoService.listarCambiosTemporalesMetrado2(obj);
      let respuesta = null;
      if (metradotemp[0]) {
        tablaPrincipal = await this.encriptadorService.descomprimirJSON(
          metradotemp[0].datapresu
        );
        tablaSistemaProyecto = await this.encriptadorService.descomprimirJSON(
          metradotemp[0].datasistema
        );
        const tablasAceroYResumen =
          await this.encriptadorService.descomprimirJSON(
            metradotemp[0].dataaceros
          );
        const array = tablasAceroYResumen[2]?.estilos
          ? tablasAceroYResumen[2]?.estilos
          : [];
        const stilosTit = array[0]
          ? array[0]
          : { color: '', alineamiento: 'left', tipo: '', size: '10' };
        const stilosMet = array[1]
          ? array[1]
          : { color: '', alineamiento: 'left', tipo: '', size: '10' };
        const stilosSubM = array[2]
          ? array[2]
          : { color: '', alineamiento: 'left', tipo: '', size: '10' };
        const stilosTexto = array[3]
          ? array[3]
          : { color: '', alineamiento: 'left', tipo: '', size: '10' };
        const ocultosPesorCom = tablasAceroYResumen[2]?.ocultarpesos
          ? tablasAceroYResumen[2]?.ocultarpesos
          : [];
        const stilos = {
          stilosTit: stilosTit,
          stilosMet: stilosMet,
          stilosSubM: stilosSubM,
          stilosTexto,
        };
        respuesta = {
          tablaPrincipal: tablaPrincipal,
          tablaSistemaProyecto: tablaSistemaProyecto,
          tablaAcerosProyecto: tablasAceroYResumen[0],
          tablaTitResumen: tablasAceroYResumen[1],
          estilos: stilos,
          ocultarpesos: ocultosPesorCom,
        };
      }
      return respuesta;
    } catch (e) {
      console.log(e);
      SwalService.error(e);
    }
  }

  async guardarTemporal(tabla1, tabla2, tabla3) {
    this.bloqtemp = true;
    const stilos = [
      this.stilosTit,
      this.stilosMet,
      this.stilosSubM,
      this.stilosTexto,
    ];
    let tabla_1 = '';
    let tabla_2 = '';
    let tabla3y4 = '';
    await this.compressTextAsync(JSON.stringify(tabla1))
      .then((compressedText) => {
        tabla_1 = compressedText;
      })
      .catch((error) => {
        console.error('Error en la compresión:', error);
      });
    await this.compressTextAsync(JSON.stringify(tabla2))
      .then((compressedText) => {
        tabla_2 = compressedText;
      })
      .catch((error) => {
        console.error('Error en la compresión:', error);
      });
    const tab3 = [
      tabla3,
      this.tablaTitResumen,
      { estilos: stilos, ocultarpesos: this.ocultosPesorCom },
    ];
    await this.compressTextAsync(JSON.stringify(tab3))
      .then((compressedText) => {
        tabla3y4 = compressedText;
      })
      .catch((error) => {
        console.error('Error en la compresión:', error);
      });
    // const tabla_1 = this.encriptadorService.comprimirJSON(tabla1);
    // const tabla_2 = this.encriptadorService.comprimirJSON(tabla2);
    // const tabla3y4 = this.encriptadorService.comprimirJSON([
    //   tabla3,
    //   this.tablaTitResumen,
    //   { estilos: stilos, ocultarpesos: this.ocultosPesorCom },
    // ]);
    const id_proyecto = this.idProyecto;
    const id_usuario = this.id_usuario;
    const obj = {
      id_proyecto: id_proyecto,
      id_usuario: id_usuario,
      datapresu: tabla_1,
      datasistema: tabla_2,
      dataaceros: tabla3y4,
    };
    const response = await this.metradoService.guardarCambiosTemporalesMetrado2(
      obj
    );
    this.bloqtemp = false;
    this.stop();
    // console.log('response', response);
  }

  async descartarTemporal() {
    try {
      const id_proyecto = this.idProyecto;
      const id_usuario = this.id_usuario;
      const obj = {
        id_proyecto: id_proyecto,
        id_usuario: id_usuario,
      };
      const response =
        await this.metradoService.descartarCambiosTemporalesMetrado2(obj);
      this.existeTemp = false;
    } catch (e) {
      console.log(e);
      SwalService.error(e);
    }
  }

  async reiniciarPry() {
    await this.permisosUsuario();
    // await this.listarMetrados();
    // const titulo = await this.tablaTitResumen.find(
    //   (ele) => ele.indice == this.indiceTitulo
    // );
    this.tablaInformacion = [];
    this.titInformSel = null;
    this.partidaSeleccionada = null;
    this.filaSel = null;
    this.filaSel2 = null;
    this.filaSel3 = null;
    this.tablaSistema = [];
    this.tablaTitResumen = [];
    this.tablaAceros = [];
    this.todosCheck = false;
    this.permitirCambio = false;
    this.habilitadoCopiar = false;

    await this.listarMetrados();
    if (this.activetab == 2) {
      let titulo = await this.tablaTitResumen.find(
        (ele) => ele.indice == this.indiceTitulo
      );
      if (!titulo && this.tablaTitResumen.length) {
        titulo = this.tablaTitResumen[0];
      }
      this.titInformSel = titulo;
      this.indiceTitulo = null;
      await this.verHojaMetrado(this.titInformSel);
    } else {
      this.indiceTitulo = null;
    }
    //   // this.indiceTitulo = null;
    //   await this.listarMetrados();
    //   // let titulo = await this.tablaTitResumen.find(
    //   //   (ele) => ele.indice == this.indiceTitulo
    //   // );
    //   // if (!titulo && this.tablaTitResumen.length) {
    //     const titulo = this.tablaTitResumen[0];
    //   // }
    //   this.titInformSel = titulo
    //   await this.verHojaMetrado(titulo);
    // } else if (this.activetab == 1) {

    //   await this.listarMetrados();
    // }
    // // await this.listarTitulos();
    // await this.listarPesosPorUsuario();
  }

  async ListarPresupuestoTemp() {
    const obj = { id_proyecto: this.idProyecto, id_usuario: '' };
    const response = await this.presuservice.ExistePresuTemp(obj);
    return response.length ? true : false;
  }

  async vincular(titulo, index = null) {
    try {
      let titNoVinculados = [];
      const tempPresu = await this.ListarPresupuestoTemp();
      if (!tempPresu && !this.existeTemp) {
        this.mostrar_carga_todo = true;
        let tablaVincular = [];
        if (titulo) {
          const tablatitulo = await this.filtrarTitulo(titulo);
          if (!titulo.tipo_registro) {
            const validos = await this.validosVinculo(tablatitulo, [], 0);
            if (validos !== null) {
              tablaVincular = validos;
            }
            this.tablaTitResumen[index].vinculado = true;
          } else {
            const response = await this.listarTablaExcel(titulo.indice,titulo.item);
            const tablaExcel = await this.tablaTipoExcel(response, tablatitulo);
            const validos = await this.validosVinculo(
              tablatitulo,
              tablaExcel.body,
              1
            );
            if (validos !== null) {
              tablaVincular = validos;
              this.tablaTitResumen[index].vinculado = true;
            } else {
              titNoVinculados.push(titulo.item + ' - ' + titulo.descripcion);
              this.tablaTitResumen[index].vinculado = false;
            }
          }
        } else {
          let i = 0;
          for (const tit of this.tablaTitResumen) {
            if (tit.editable) {
              const tablatitulo = await this.filtrarTitulo(tit);

              if (!tit.tipo_registro) {
                const validos = await this.validosVinculo(tablatitulo, [], 0);
                if (validos !== null) {
                  tablaVincular = tablaVincular.concat(validos);
                }
                this.tablaTitResumen[i].vinculado = true;
              } else {
                const response = await this.listarTablaExcel(tit.indice,tit.item);
                const tablaExcel = await this.tablaTipoExcel(
                  response,
                  tablatitulo
                );

                const validos = await this.validosVinculo(
                  tablatitulo,
                  tablaExcel.body,
                  1
                );
                if (validos !== null) {
                  tablaVincular = tablaVincular.concat(validos);
                  this.tablaTitResumen[i].vinculado = true;
                } else {
                  titNoVinculados.push(tit.item + ' - ' + tit.descripcion);
                  this.tablaTitResumen[i].vinculado = false;
                }
              }
            }
            i++;
          }
        }
        if (tablaVincular.length) {
          const resGuardado = await this.vincularTabla(tablaVincular);
          if (resGuardado == '1') {
            await this.reiniciarPry();
            this.mostrar_carga_todo = false;
            if (!titNoVinculados.length) {
              this.toaster.success('Se vinculó correctamente', 'Correcto', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              });
              return;
            } else {
              const texto = titNoVinculados
                .map((ele) => {
                  return '<i>' + ele + '</i>';
                })
                .join('<br>');
              this.toaster.warning(
                'Se omitieron los titulos por diferencia de estructura: <b> <br>' +
                  texto +
                  '</b><br>',
                'Advertencia',
                {
                  closeButton: false,
                  positionClass: 'toast-bottom-right',
                  timeOut: 4000,
                  enableHtml: true,
                }
              );
              return;
            }
          } else if (resGuardado == '2') {
            this.mostrar_carga_todo = false;
            this.toaster.error(
              'Se estan guardando cambios en presupuesto , intente guardar cambios mas tarde',
              'Error',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
                enableHtml: false,
              }
            );
            return;
          } else {
            this.mostrar_carga_todo = false;
            this.toaster.error('No se pudo guardar los cambios', 'Error', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
              enableHtml: false,
            });
            return;
          }
        } else {
          this.mostrar_carga_todo = false;
          this.toaster.info('Ningun parametro para vincular', '', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          return;
        }
      } else {
        this.mostrar_carga_todo = false;
        let msj = '';
        if (this.existeTemp && !tempPresu) {
          msj = 'Existe datos no guardados en hojas metrado';
        } else if (!this.existeTemp && tempPresu) {
          msj = 'Existe datos no guardados en edición de presupuesto';
        } else {
          msj = 'Existe cambios en edicion de presupuesto y en hojas metrado';
        }

        this.toaster.error(msj + ', guarde o descarte los cambios', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error(e);
    }
  }

  async validosVinculo(tablaPresu, tablaExcel, tipo) {
    let omitir = false;
    let elemVincular = [];
    if (tipo) {
      for (const rowT of tablaExcel) {
        const encontrado = tablaPresu.find(
          (ele) => ele.indice == rowT.indice
        );

        if (!encontrado) {
          omitir = true;
        }
      }
      if (!omitir) {
        for (const row of tablaExcel) {
          if (row.unidad) {
            const encontrado = await tablaPresu.find(
              (ele) => ele.indice == row.indice && ele.unidad
            );
            if (encontrado) {
              const obj = {
                cant_metrado: this.formsService.redondeo(
                  Number(row.mtotal),
                  this.dec_metrado
                ),
                cantidad: encontrado.cantidad,
                descripcion: encontrado.descripcion,
                ed_pre: 0,
                id_proyecto: encontrado.id_proyecto,
                indice: encontrado.indice,
                item: encontrado.item,
                itemord: encontrado.itemord,
                metrado: encontrado.metrado,
                parcial: encontrado.parcial,
                plantilla: encontrado.plantilla,
                precio: encontrado.precio,
                tipo_registro: encontrado.tipo_registro,
                vinculado: 0, //CORREGIR PARA SOLO ENVIAR DIFERENTE NO TODOS
                unidad: encontrado.unidad,
              };
              if (Number(obj.cant_metrado)) {
                elemVincular.push(obj);
              }
            } else {
              return null;
            }
          }
        }
      } else {
        return null;
      }
    } else {
      for (const row of tablaPresu) {
        if (row.unidad) {
          elemVincular.push(row);
        }
      }
    }
    return elemVincular;
  }

  async vincularTabla(concatenado) {
    const datos1 = JSON.stringify(concatenado);
    const obj = JSON.stringify({
      id_proyecto: this.idProyecto,
      datos1: datos1,
    });
    const response = await this.metradoService.vincularMetradoAPresupuesto(obj);
    return response.id;
  }

  async importarExcel(evt: any) {
    try {
      this.mostrar_carga_todo = true;
      setTimeout(() => {
        
     
      const target: DataTransfer = <DataTransfer>evt.target;
      if (target.files.length !== 1) {
        throw new Error('No se puede agregar multiples documentos');
      }
      const reader: FileReader = new FileReader();
      const nombreArchivo = target.files[0].name;
      reader.onload = async (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        const wbExcel = wb;
        const lista = wb.SheetNames;
        let listaTablas = [];
        lista.map((ele) => {
          const item: hoja = {
            nombre: ele,
            plantilla: null,
            columnas: null,
            columnas_completas: false,
            tabla_estructurada: null,
            tabla_excel: [],
            inicio_tabla: 0,
            body_tabla: null,
            cant_header: null,
            grupos_header: null,
            header: null,
            tabla_titulos_partida: null,
            considerar: false,
            filasNoValidas: [],
          };
          listaTablas.push(item);
        });
        listaTablas = await this.recuperarTablaExcel(wbExcel, listaTablas);
        await this.datosParaExcel(nombreArchivo, wbExcel, listaTablas);
        this.mostrar_carga_todo = false;
      };
      reader.readAsBinaryString(target.files[0]);
      const fileUpload = document.getElementById('archivo') as HTMLInputElement;
      if (fileUpload != null) {
        fileUpload.value = null;
      }
    }, 10);
    } catch (e) {
      SwalService.error(e);
      console.log(e);
    }
  }
  leerHojaConFormulasEvaluadas(ws: XLSX.WorkSheet): any[][] {
  const resultado: any[][] = [];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const fila: any[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      const cell = ws[cell_ref];
      if (!cell) {
        fila.push('');
        continue;
      }
      if (cell.f && cell.v !== undefined) {
        fila.push(cell.v);
      }else if (cell.f && cell.v === undefined) {
        const formula = cell.f;
        if (/^[A-Z]+\d+(\*[A-Z]+\d+)+$/.test(formula)) {
          try {
            const valores = formula
              .split('*')
              .map(ref => {
                const c = ws[ref.trim()];
                return c && c.v ? Number(c.v) : 1;
              });
            const resultadoFormula = valores.reduce((a, b) => a * b, 1);
            fila.push(resultadoFormula);
          } catch {
            fila.push(`(no evaluada): =${formula}`);
          }
        } else {
          fila.push(`(fórmula no evaluada): =${formula}`);
        }
      }
      else {
        fila.push(cell.v ?? '');
      }
    }
    resultado.push(fila);
  }
  return resultado;
  }
  async recuperarTablaExcel(webExcel, listaTablas) {
    for (let hoja of listaTablas) {
      let filasInvalidas = [];
      let excelData;
      const ws: XLSX.WorkSheet = webExcel.Sheets[hoja.nombre];
      // excelData = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, raw: false });
      excelData = this.leerHojaConFormulasEvaluadas(ws);
      let mayor = 0;
      let header = [];
      await excelData.map((ele, index) => {
        if (ele.length > 79) {
          filasInvalidas.push(index + 2);
        }
        if (mayor < ele.length) {
          mayor = ele.length;
        }
      });
      for (let i = 0; i < mayor; i++) {
        header.push(i);
      }
      const excelCompleto = JSON.parse(JSON.stringify(excelData));
      hoja.tabla_excel = excelCompleto;
      hoja.cant_header = header;
      hoja.filasNoValidas = filasInvalidas;
    }
    return listaTablas;
  }

  async datosParaExcel(nombreArchivo, wbExcel, listaTablas) {
    const modalRef = this.modalService.open(ModalMetradoExcelComponent, {
      size: 'lg modalgrande',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false,
    });
    modalRef.componentInstance.titulo = this.titInformSel;
    modalRef.componentInstance.nombreArchivo = nombreArchivo;
    modalRef.componentInstance.wbExcel = wbExcel;
    modalRef.componentInstance.listaTablas = listaTablas;
    modalRef.componentInstance.idProyecto = this.idProyecto;
    modalRef.componentInstance.listaPresuesto = this.tablaTitulo;
    // modalRef.componentInstance.estilos =
    const result = await modalRef.result;
    if (result && result?.respuesta == 'ok') {
      this.mostrar_carga_todo = true;
      const index = this.tablaTitResumen.findIndex(ele=> ele.indice == this.titInformSel.indice ) 
      this.tablaTitResumen[index].estado_metrado = result.porcentaje
      const response = await this.listarTablaExcel(this.titInformSel.indice,this.titInformSel.item);
      const response2 = await this.tablaTipoExcel(response, this.tablaTitulo);
      this.tablaExcelAdjunta = response2.body;
      this.headerExcel = response2.header;
      this.mostrar_carga_todo = false;
    }
  }

  // verTitulo(event) {
  //   if (event !== this.tituloSeleccionado) {
  //     this.tituloSeleccionado = event
  //     this.activetab = 2
  //   }

  // }

  toggleOnSistema(index) {
    this.tablaSistema[index].icomost = 0;
    for (let i = index + 1; i < this.tablaSistema.length; i++) {
      const row = this.tablaSistema[i];
      if (this.tablaSistema[index].estitulo == 1) {
        if (!row.estitulo || row.estitulo == 2) {
          this.tablaSistema[i].mostrar = 1;
          this.tablaSistema[i].icomost = 0;
        } else {
          break;
        }
      } else if (this.tablaSistema[index].estitulo == 0) {
        if (!row.esMetrado || row.id_metrado == null) {
          this.tablaSistema[i].mostrar = 1;
          this.tablaSistema[i].icomost = 0;
        } else {
          break;
        }
      } else {
        if (!row.estitulo) {
          this.tablaSistema[i].mostrar = 1;
          this.tablaSistema[i].icomost = 0;
        } else {
          break;
        }
      }
    }
  }

  async toggleOffSistema(index) {
    this.tablaSistema[index].icomost = 1;
    let existe = false;
    for (let i = index + 1; i < this.tablaSistema.length; i++) {
      const row = this.tablaSistema[i];
      if (row.id_metrado !== null) {
        existe = true;
        break;
      }
    }
    if (index + 1 > this.tablaSistema.length || !existe) {
      return;
    }
    for (let i = index + 1; i < this.tablaSistema.length; i++) {
      const row = this.tablaSistema[i];
      // if (this.tablaSistema[i].id_metrado !== null) {
      const ext = await this.sgteexistente(i, 'tablaSistema');
      if (this.tablaSistema[index].estitulo == 1 && ext) {
        if (!row.estitulo || row.estitulo == 2) {
          this.tablaSistema[i].mostrar = 0;
        } else {
          break;
        }
      } else if (
        !this.tablaSistema[index].estitulo &&
        this.tablaSistema[index].esMetrado
      ) {
        if (
          (!row.esMetrado || (row.esMetrado && row.id_metrado == null)) &&
          ext
        ) {
          this.tablaSistema[i].mostrar = 0;
        } else {
          break;
        }
      } else {
        if (!row.estitulo && ext) {
          this.tablaSistema[i].mostrar = 0;
        } else {
          break;
        }
      }
      // }
    }
  }

  toggleOnAceros(index) {
    this.tablaAceros[index].icomost = 0;
    for (let i = index + 1; i < this.tablaAceros.length; i++) {
      const row = this.tablaAceros[i];
      if (this.tablaAceros[index].estitulo == 1) {
        if (!row.estitulo || row.estitulo == 2) {
          this.tablaAceros[i].mostrar = 1;
          this.tablaAceros[i].icomost = 0;
        } else {
          break;
        }
      } else if (this.tablaAceros[index].estitulo == 0) {
        if (!row.esMetrado || row.id_metrado == null) {
          this.tablaAceros[i].mostrar = 1;
          this.tablaAceros[i].icomost = 0;
        } else {
          break;
        }
      } else {
        if (!row.estitulo) {
          this.tablaAceros[i].mostrar = 1;
          this.tablaAceros[i].icomost = 0;
        } else {
          break;
        }
      }
    }
  }

  async toggleOffAceros(index) {
    this.tablaAceros[index].icomost = 1;
    let existe = false;
    for (let i = index + 1; i < this.tablaAceros.length; i++) {
      const row = this.tablaAceros[i];
      if (row.id_metrado !== null) {
        existe = true;
        break;
      }
    }
    if (index + 1 > this.tablaAceros.length || !existe) {
      return;
    }
    for (let i = index + 1; i < this.tablaAceros.length; i++) {
      const row = this.tablaAceros[i];
      // if (this.tablaAceros[i].id_metrado !== null) {
      const ext = await this.sgteexistente(i, 'tablaAceros');
      if (this.tablaAceros[index].estitulo == 1 && ext) {
        if (!row.estitulo || row.estitulo == 2) {
          this.tablaAceros[i].mostrar = 0;
        } else {
          break;
        }
      } else if (
        !this.tablaAceros[index].estitulo &&
        this.tablaAceros[index].esMetrado
      ) {
        if (
          (!row.esMetrado || (row.esMetrado && row.id_metrado == null)) &&
          ext
        ) {
          this.tablaAceros[i].mostrar = 0;
        } else {
          break;
        }
      } else {
        if (!row.estitulo && ext) {
          this.tablaAceros[i].mostrar = 0;
        } else {
          break;
        }
      }
      // }
    }
  }
   maxtodoMetrado() {
    for (let row of this.tablaSistema) {
      if (row.id_metrado !== null) {
        row.mostrar = 1;
      }
      row.icomost = 0;
    }
  }

  async mintodoMetrado() {
    let titulo = false;
    let metrado = false;
    let i = 0;
    for (let row of this.tablaSistema) {
      const ext = await this.sgteexistente(i, 'tablaSistema');
      if (!ext) {
        break;
      }
      if (row.estitulo == 1) {
        titulo = true;
      } else if (row.esMetrado && !row.estitulo) {
        metrado = true;
      }
      if (titulo) {
        if (row.estitulo == 1) {
          row.icomost = 1;
          row.mostrar = 1;
        } else {
          row.estmost = row.mostrar;
          row.mostrar = 0;
        }
      } else if (!titulo && metrado) {
        if (row.estitulo == 1) {
          row.icomost = 0;
          row.mostrar = 1;

          titulo = true;
        } else if (row.esMetrado) {
          row.icomost = 0;
          row.mostrar = 1;
          metrado = true;
        } else {
          row.estmost = row.mostrar;
          row.mostrar = 0;
        }
      }

      i++;
    }
  }
}
