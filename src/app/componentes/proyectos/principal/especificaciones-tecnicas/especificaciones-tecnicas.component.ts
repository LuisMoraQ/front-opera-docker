import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TinymceComponent } from 'angular2-tinymce';
import { ToastrService } from 'ngx-toastr';
import { ClasificacionService } from 'src/app/servicios/clasificacion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { EspecificacionesTecnicasService } from 'src/app/servicios/especificaciones-tecnicas.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { SwalService } from 'src/app/servicios/swal.service';
import stringSimilarity from 'string-similarity-js';
import { createNumberMask } from 'text-mask-addons';
import { ModalBusquedaEspecificacionComponent } from './modal-busqueda-especificacion/modal-busqueda-especificacion.component';
import { ModalVerEspecificacionComponent } from './modal-ver-especificacion/modal-ver-especificacion.component';
import { ModalVinculoPartidasEspComponent } from './modal-vinculo-partidas-esp/modal-vinculo-partidas-esp.component';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { MatStepper } from '@angular/material/stepper';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { ReportesComponent } from '../../reportes/reportes.component';
import * as moment from 'moment';

var mammoth = require('mammoth/mammoth.browser');
import { InvertirColorService } from 'src/app/servicios/invertir-color.service';
import { SignalrcustomService } from 'src/app/servicios/signalrcustom.service';
import { Subscription } from 'rxjs';
import { AddImgUrlComponent } from 'src/app/shared/add-img-url/add-img-url.component';

export interface archivoimg {
  nombre: any;
  base: any;
}

export interface insumo {
  descripcion: string;
  unidad: string;
  cantidad: string;
  precio: number;
  parcial: number;
  num_det: number;
}

@Component({
  selector: 'app-especificaciones-tecnicas',
  templateUrl: './especificaciones-tecnicas.component.html',
  styleUrls: ['./especificaciones-tecnicas.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EspecificacionesTecnicasComponent
  implements OnInit, AfterContentChecked, OnDestroy
{
  actuavista$: Subscription = new Subscription();
  displayBasic2: boolean;
  @ViewChild('stepper') stepper: MatStepper;
  @Input() idProyecto = null;
  active = 1;
  detalles = [
    'DESCRIPCION DE LOS TRABAJOS',
    'PROCESO CONSTRUCTIVO',
    'MATERIALES / EQUIPOS',
    'LA UNIDAD DE LA MEDIDA DE LA PARTIDA ES',
    'FORMA DE PAGO',
  ];
  tablaEspecificaciones = [];
  listaTitulos = [];
  rowSeleccionado = null;
  mostrar_carga_todo = false;
  mostrar_carga_todo2 = false;
  mostrar_carga_todo3 = false;
  buscando2 = false;

  id_proyecto;
  tipoProy;
  colores;
  decima;
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  dec_metrado = 4;
  mask_metrado = '0.4';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  dec_cant = 4;
  mask_cant = '0.4';
  public especificacionTexto: string = '';
  vista: number = null;
  tablaCostoUnitario = [];
  plantillaBase = null;
  imagenPegar: any = null;
  tab = 0;
  @ViewChild('tinymce', { static: false }) public tinymce: TinymceComponent;
  @ViewChild('tinymce2', { static: false }) public tinymce2: TinymceComponent;
  heightUl: number;
  clasificaciones = [];
  clasificacion = '';
  buscarSel = false;
  tablaVinculo = [];
  id_user: any;
  plantillaCreada: boolean;
  forma = 1;
  tipo_proy = '';
  proyectos = '';
  tipobusq = '';
  listaProyUsuario = [];
  toppings = new UntypedFormControl('');
  proyectosSeleccionados = [];
  buscando = false;
  buscando3: boolean = false;
  datadeProy: any;
  busqueda = '';
  arrayBusqueda = ['descripcion', 'fuente'];
  multiple = false;
  visualizarVinculado = true;
  tablaVinculado = [];
  tipoBusqueda = 1;
  porcentajeBusqueda = 80;
  textoInicio = null;
  estructuraTitulos = [];
  iniciado = false;
  editable = false;
  bloquear = false;
  tablaEspecProy = [];
  subvista = 1;
  infoTitulo = null;
  paso = 0;
  TipoReemplazo: number = 1;
  @ViewChild('modalWord') modalWord: ModalBasicComponent;
  @ViewChild('modalGeneralidades') modalGeneralidades: ModalBasicComponent;

  encontradosDoc: any[] = [];
  tablaEspTit: any[] = [];
  htmlDocumento: any = '';
  nombreDocumento: string = '';
  arregloHtml: any[] = [];
  filaSelF: any = null;
  tablaFilasNumericas: any[] = [];
  htmlResaltado = [];
  tipoComparacion: number = 1;
  bloquearAccion: boolean = false;
  arrayPintar: any[] = [];
  filaSelC = null;
  filItemEdit: any;
  datosproy: any;
  moneda: string;
  htmlGeneralidades = null;
  tempEspecTecn: boolean = false;
  today = new Date();
  NombreUsuario: any;
  permisos = [];
  titClick: any = null;
  indiceFinal: number;
  permisoGeneral: boolean = false;
  actualizarVista: boolean = false;
  idCreadorProy = null;
  solover = false;
  simbolo
  @Input() set tabproyecto(value: any) {
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    const datos_recuperado = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    this.idCreadorProy = datos_recuperado.value.id_usuario;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    this.simbolo=datosrec.value.simbolo
  }

  formTitulo = new UntypedFormGroup({
    tituloSeleccionado: new UntypedFormControl(null, []),
  });
  get tituloSeleccionado(): UntypedFormControl {
    return this.formTitulo.get('tituloSeleccionado') as UntypedFormControl;
  }

  formTinyMce = new UntypedFormGroup({
    espeTiny: new UntypedFormControl(null, []),
  });
  get espeTiny(): UntypedFormControl {
    return this.formTinyMce.get('espeTiny') as UntypedFormControl;
  }

  public maskUsAmountDecimal = createNumberMask({
    prefix: '',
    allowDecimal: false,
    integerLimit: 3,
  });

  habMult = false;
  especCopiada = null;
  constructor(
    private presuservice: PresupuestosService,
    private principalService: PrincipalService,
    private especificacionesTecnicasService: EspecificacionesTecnicasService,
    private _ClasificacionService: ClasificacionService,
    private toaster: ToastrService,
    private sanitizer: DomSanitizer,
    public formsService: FormsService,
    private _EncriptadorService: EncriptadorService,
    private modalService: NgbModal,
    public metradoService: MetradoService,
    private changeDetectorRef: ChangeDetectorRef,
    public InvertirColorService: InvertirColorService,
    private _SignalrcustomService: SignalrcustomService
  ) {}

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true;
      this.pintar();
      this.id_user = this._EncriptadorService.recuperarlocalstory('idusuario');
      this.NombreUsuario = JSON.parse(
        this._EncriptadorService.recuperarlocalstory('nombre')
      );

      await this.datosProyec();
      await this.listarTitulos(true);
      await this.recuperarPlantilla();
      await this.listarClasificacionProyectos();
      await this.recuperarProyectos();
      this.onResize();

      this.actuavista$ = this._SignalrcustomService.actuaVista.subscribe(
        (mensaje) => {
          const idProyMod = parseInt(JSON.parse(mensaje), 10);
          if (Number(idProyMod) === Number(this.idProyecto)) {
            this.actualizarVista = true;
            if (this.active == 1) {
              this.refrescar();
            } else if (this.active == 2) {
              const indexTit = this.listaTitulos.indexOf(
                (ele) => ele.indice == this.tituloSeleccionado
              );
              if (this.permisos[indexTit]?.edit !== 1) {
                this.refrescar();
              }
            }
          }
        }
      );
      this.mostrar_carga_todo = false;
      this.changeDetectorRef.detach();
    } catch (error) {
      console.log('err', error);
      SwalService.error(error);
      this.mostrar_carga_todo = false;
    }
  }

  ngOnDestroy(): void {
    // if (this.tempEspecTecn){
    //   this.guardarTemporal()
    // }
    this.actuavista$.unsubscribe();
  }

  ngAfterContentChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  async listarIndicesElimPresupuesto() {
    try {
      let array = [];
      const obj = {
        id_proyecto: this.idProyecto,
      };
      const response = await this.principalService.listarIndiceEliminados(obj);
      if (response.indelipres2) {
        let spliteado = response.indelipres2.split(',');
        array = spliteado.map(Number);
      }
      return array;
    } catch (e) {
      SwalService.error(e);
      console.log(e);
    }
  }

  async limpiarIndicesElimina() {
    try {
      const obj = {
        id_proyecto: this.idProyecto,
        opcion: 1,
      };
      const response = await this.principalService.limpiarIndicesElimina(obj);
      if (response.id !== '1') {
        SwalService.error(response);
      }
    } catch (e) {
      SwalService.error(e);
    }
  }

  async datosProyec() {
    const detalleProyecto = await this.principalService.recuperarDatosProyecto({
      id_proyecto: this.idProyecto,
    });
    this.datosproy = detalleProyecto;
    // this.moneda = this.datosproy.moneda.toString() == '0' ? 'S/' : '$';
    this.moneda = this.simbolo?this.simbolo:'S/'
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    const hg = document.getElementById('tabs')?.clientHeight;
    if (hg) {
      this.heightUl = 180 + hg;
    }
  }

  pintar() {
    this.aspectos = JSON.parse(this.colores);
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }

  async listarClasificacionProyectos() {
    try {
      const input = { activo: '1' };
      this.clasificaciones =
        await this._ClasificacionService.ListarClasificacion(input);
    } catch (e) {
      console.log(e);
      SwalService.error();
    }
  }

  async recuperarPlantilla() {
    const obj = {
      id_proyecto: this.idProyecto,
    };
    const response =
      await this.especificacionesTecnicasService.listarPlantillaEspec(obj);
    if (response.length) {
      this.plantillaBase = response;
    } else {
      this.plantillaBase = null;
      this.vista = 0;
    }
  }

  async recuperarProyectos() {
    const obj = {
      id_usuario: this.id_user,
    };
    this.listaProyUsuario =
      await this.especificacionesTecnicasService.listarProyEspecifica(obj);
    this.listaProyUsuario.sort((a, b) => b.fuente - a.fuente);
  }

  limpiarfiltro() {
    this.busqueda = '';
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async ListarPresupuestoTemp() {
    const obj = { id_proyecto: this.idProyecto, id_usuario: '' };
    const response = await this.presuservice.ExistePresuTemp(obj);
    return response.length ? true : false;
  }

  async listarTitulos(inicio = false) {
    // const tempPresu = await this.ListarPresupuestoTemp();
    // if (tempPresu) {
    //   this.mostrar_carga_todo = false;
    //   SwalService.warning(
    //     'Error',
    //     'Cambios no guardados en Edicion de presupuesto. El encargado  debe guardar o descartar los cambios en la vista edicion de presupuesto'
    //   );
    //   return;
    // }
    this.tablaEspecProy = [];
    // const temporal = await this.listarTemporal();
    // if (temporal?.tablaEspecProy) {
    //   this.tempEspecTecn = true;
    //   this.tablaEspecProy = temporal.tablaEspecProy;
    // } else {
    this.tablaEspecProy = await this.recuperarEspecificaciones('');

    this.tempEspecTecn = false;
    // const indicesEliminar = await this.listarIndicesElimPresupuesto();
    // if (indicesEliminar.length) {
    //   const modificados = await this.limpiarIndicesEliminados(indicesEliminar);
    //   if (modificados.length) {
    //     const cortar = await this.guardar2(modificados);
    //     if (!cortar) {
    //       await this.limpiarIndicesElimina();
    //       await this.listarTitulos(true);
    //       return;
    //     }
    //   }
    // }
    // }
    await this.permisosUsuario();
    await this.separarTitulos();
  }

  async limpiarIndicesEliminados(arrayIndices, cambiar = false) {
    let modificados = [];
    for (const row of this.tablaEspecProy) {
      let editado = row.editado;
      if (row.vinculo_part) {
        if (arrayIndices.includes(Number(row.vinculo_part))) {
          // row.editado = false;
          if (row.indice == row.vinculo_part) {
            if (cambiar) {
              row.editado = false;
            }
            const encontrados = await this.tablaEspecProy.filter(
              (ele) =>
                ele.vinculo_part == row.indice &&
                ele.indice !== ele.vinculo_part
            );
            if (encontrados.length > 1) {
              const indicePadre = encontrados[0].indice;
              let i = 0;
              for (const ele of encontrados) {
                if (i == 0) {
                  ele.tipo_vinc = 'MANUAL';
                  let porc = 0;
                  if (ele.especificacion) {
                    porc = await this.contarCaracteresEspecTec(
                      ele.especificacion
                    );
                  }
                  ele.porcentaje = porc;
                } else {
                  ele.tipo_vinc = 'IDEM';
                  ele.itemvinculo = encontrados[0].item;
                }
                ele.vinculo_part = indicePadre;
                if (cambiar) {
                  this.tablaEspecProy[ele.ind].editado = true;
                } else {
                  modificados.push(ele);
                }

                i++;
              }
            } else {
              for (const ele of encontrados) {
                ele.vinculo_part = null;
                ele.tipo_vinc = 'MANUAL';
                ele.color_vincpart = null;
                let porc = 0;
                if (ele.especificacion) {
                  porc = await this.contarCaracteresEspecTec(
                    ele.especificacion
                  );
                }
                ele.porcentaje = porc;

                if (cambiar) {
                  this.tablaEspecProy[ele.ind].editado = true;
                } else {
                  modificados.push(ele);
                }
              }
            }
          } else {
            const existe = await this.tablaEspecProy.find(
              (ele) => ele.indice == row.vinculo_part
            );
            if (!existe) {
              row.vinculo_part = 'MANUAL';
              row.color_vincpart = null;
              row.itemvinculo = null;
              let porc = 0;
              if (row.especificacion) {
                porc = await this.contarCaracteresEspecTec(row.especificacion);
              }
              row.porcentaje = porc;

              if (cambiar) {
                this.tablaEspecProy[row.ind].editado = true;
              } else {
                modificados.push(row);
              }
            }
          }
        }
      }
      if (editado) {
        modificados.push(row);
      }
    }
    return modificados;
  }

  async permisosUsuario() {
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({
      id_proyecto: this.idProyecto,
      id_usuario: this.id_user,
    });
    if (datoaccs.length) {
      const titespec = datoaccs[0].titespec
        ? JSON.parse(datoaccs[0].titespec)
        : [];
      if (titespec.length) {
        this.permisos = titespec;
      }
    } else {
      this.permisoGeneral = true;
    }
  }

  async listarTitEspecif() {
    const obj = {
      id_proyecto: this.idProyecto,
    };
    const response =
      await this.especificacionesTecnicasService.listarTitEspecif(obj);
    return response;
  }

  async listarInformacionTitulo(row, index) {
    this.titClick = index;
    if (this.infoTitulo?.indice == row && row.item == this.infoTitulo?.item) {
      return;
    }

    if (row.ultimoMod) {
      const partida = await this.tablaEspecProy.find(
        (ele) => ele.indice == row.ultimoMod.indice
      );
      const obj = {
        descpart: partida.descripcion,
        descripcion: row.descripcion,
        editor: row.ultimoMod.id_usuario,
        fechamod: row.ultimoMod.fecha,
        id_proyecto: this.idProyecto,
        indice: row.indice,
        item: row.item,
        itemord: row.itemord,
        itempart: partida.item,
        nombres: row.ultimoMod.nombres,
        tipo_vinc: partida.tipo_vinc,
      };
      this.infoTitulo = obj;
    } else {
      const guardadoTit = await this.listarTitEspecif();
      this.infoTitulo = await guardadoTit.find(
        (ele) => ele.indice == row.indice
      );
    }
  }

  async separarTitulos() {
    let index = 0;
    let editable = true;
    for (const iterator of this.tablaEspecProy) {
      iterator.editado = iterator.editado ? iterator.editado : false;
      iterator.selectMult = false;
      iterator.porcentaje2 = null;

      if (iterator.item.split('.').length == 1) {
        const existePermi = await this.permisos.find(
          (ele) => ele.ind == iterator.indice
        );
        let editable = false;
        if (existePermi) {
          editable = existePermi?.edit == 0 ? false : true;
        } else {
          if (this.permisoGeneral) {
            editable = true;
          }
        }
        const tabla = await this.tablaTitulo(
          this.tablaEspecProy,
          iterator.item,
          index
        );
        iterator.registroTit = (
          await this.calculoPorcentajeTitulo(tabla)
        ).porcentaje;
      }
      iterator.editable = editable;
      index++;
    }
    const titulos = await this.filtrarTitulos(this.tablaEspecProy);
    this.listaTitulos = titulos;
  }

  async verTituloSelect(titulo) {
    if (!this.plantillaBase) {
      this.toaster.error('Plantilla especificacion tecnica no creada', null, {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      return;
    }
    this.mostrar_carga_todo = true;
    // setTimeout(async () => {
    this.active = 2;
    await this.cambiarTitulo(titulo.indice, true);

    // }, 10);
  }

  async tablaTitulo(data, item, index) {
    let tabla = [];
    for (let i = index; i < data.length; i++) {
      const spliteado = data[i].item.split('.');
      if (spliteado[0] == item) {
        tabla.push(data[i]);
      } else {
        break;
      }
    }
    return tabla;
  }

  async filtrarTitulos(data) {
    let titulos = [];
    titulos = data.filter((ele) => {
      const spliteado = ele.item.split('.');
      if (spliteado.length == 1) {
        return ele;
      }
    });
    return titulos;
  }

  async recuperarEspecificaciones(item) {
    const obj = {
      id_proyecto: this.idProyecto,
      titulo: item,
    };
    let response = await this.especificacionesTecnicasService.listarEspecTitulo(
      obj
    );
    let array = response.length ? response : [];

    for (const iterator of array) {
      iterator.editado = false;
      iterator.selectMult = false;
      iterator.ultimoMod = null;
      iterator.registroTit = 0;
    }
    return array;
  }

  async cambiarTitulo(event, mostrarCarga = false) {
    if (mostrarCarga) {
      this.buscando = true;
    }

    setTimeout(async () => {
      this.editable = false;
      if (this.rowSeleccionado && this.textoInicio !== this.espeTiny.value) {
        await this.guardarEspecificacion(false);
      }
      this.tablaEspecificaciones = [];
      const existe = await this.permisos.find((ele) => ele.ind == event);
      if (!this.permisos.length) {
        this.editable = true;
      } else {
        this.editable = existe?.edit == 1 ? true : false;
      }
      if (this.permisoGeneral) {
        this.editable = true;
      }
      this.espeTiny.setValue(null);
      this.vista = 0;
      this.proyectosSeleccionados = [];
      this.clasificacion = '';
      this.busqueda = '';
      this.tablaVinculo = [];
      this.forma = 1;
      this.tab = 0;
      this.tablaCostoUnitario = [];
      this.rowSeleccionado = null;
      this.textoInicio = null;
      const encontrado = await this.tablaEspecProy.find(
        (ele) => ele.indice == event
      );
      const tabla = await this.tablaTitulo(
        this.tablaEspecProy,
        encontrado.item,
        encontrado.ind
      );
      this.tituloSeleccionado.setValue(event);
      this.tablaEspecificaciones = tabla;
      if (this.rowSeleccionado) {
        await this.evaluarIDEMS();
      }
      if (mostrarCarga) {
        this.mostrar_carga_todo = false;
        this.buscando = false;
      }
    }, 50);
  }

  async evaluarIDEMS() {
    for (const row of this.tablaEspecificaciones) {
      if (row.tipo_vinc == 'IDEM') {
        const principal = await this.tablaEspecProy.find(
          (ele) => ele.indice == ele.vinculo_part
        );
        if (!principal?.editable || !row.editable) {
          row.color_vincpart = null;
          row.itemvinculo = null;
          row.tipo_vinc = 'MANUAL';
          let porc = null;
          if (this.rowSeleccionado.especificacion) {
            porc = await this.contarCaracteresEspecTec(
              this.rowSeleccionado.especificacion
            );
          }
          row.porcentaje = porc;
          row.vinculo_part = null;
        }
      }
    }
  }

  async cambioDeTab(event) {
    this.vista = event.nextId;
    if (this.vista == 3) {
      // await this.valorPlantillla();
    } else if (this.vista == 2) {
      await this.iniciarVista2();
    } else if (this.vista == 1) {
      await this.recuperarCostoUnitarioPartida(this.rowSeleccionado.indice);
    }
    this.changeDetectorRef.detectChanges();
  }

  async iniciarVista2() {
    this.tablaVinculado = [];
    this.buscando2 = true;
    if (this.rowSeleccionado.vinculo_esp) {
      this.visualizarVinculado = false;
      await this.estructurarTablaVinc();
    } else {
      this.visualizarVinculado = true;
    }
    this.buscando2 = false;
  }

  async clickFila(row) {
    if (row !== this.rowSeleccionado) {
      if (
        this.editable && !this.solover &&
        this.rowSeleccionado &&
        this.rowSeleccionado.indice !== row.indice &&
        this.espeTiny.value !== this.textoInicio
      ) {
        await this.guardarEspecificacion(false);
      }
      await this.refrescar();
      this.vista = 3;
      this.tab = 3;
      this.espeTiny.setValue(null);
      this.rowSeleccionado = row;
      this.proyectosSeleccionados = [];
      this.clasificacion = '';
      this.textoInicio = null;
      this.busqueda = '';
      this.tablaVinculo = [];
      this.forma = 1;
      this.tablaCostoUnitario = [];
      this.mostrar_carga_todo2 = true;
      this.iniciado = false;
      if (
        this.rowSeleccionado.especificacion == '' &&
        (this.rowSeleccionado.tipo_vinc == 'PENDIENTE' ||
          this.rowSeleccionado.tipo_vinc == null)
      ) {
        this.rowSeleccionado.especificacion = null;
      }
      if (this.vista == 3 || !this.vista) {
        const valor = await this.valorPlantillla();
        this.espeTiny.setValue(valor);
        setTimeout(() => {
          if (this.textoInicio == null) {
            if (this.rowSeleccionado.tipo_vinc == 'IDEM') {
              this.textoInicio = JSON.parse(
                JSON.stringify(this.espeTiny.value)
              );
            } else {
              if (this.editable && !this.solover) {
                const b = this.tinymce.editor?.getContent({ format: 'html' });
                this.espeTiny.setValue(null);
                this.textoInicio = b;
              } else {
                this.textoInicio = this.espeTiny.value;
              }
            }
            this.espeTiny.setValue(this.textoInicio);
          }
          this.tab = 3;
          this.onResize();
          this.mostrar_carga_todo2 = false;
        }, 50);
      } else if (this.vista == 2) {
        if (!this.rowSeleccionado?.unidad) {
          this.tipoBusqueda = 0;
        } else {
          this.tipoBusqueda = 1;
        }
        await this.iniciarVista2();
      } else if (this.vista == 1) {
        await this.recuperarCostoUnitarioPartida(this.rowSeleccionado.indice);
      }
      if (!this.editable) {
        this.bloquear = false;
      }
      this.mostrar_carga_todo2 = false;
    }
  }
  async recuperarCostoUnitarioPartida(indice, retornar = false) {
    const obj = {
      id_proyecto: this.idProyecto,
      indice: indice,
    };
    const response =
      await this.especificacionesTecnicasService.costoUnitarioXPartida(obj);
    let tablaCostoUnitario = response.length ? response : [];

    tablaCostoUnitario.sort((a, b) => {
      if (a.id_tipo_insumo < b.id_tipo_insumo) {
        return -1;
      }
      if (a.id_tipo_insumo > b.id_tipo_insumo) {
        return 1;
      }
      return 0;
    });
    if (retornar) {
    } else {
      this.tablaCostoUnitario = [];
    }
    let tablaNueva = [];
    let tipo = [];
    const tiposText = [
      'MANO DE OBRA',
      'MATERIALES',
      'EQUIPO',
      'SUB CONTRATOS',
      'SUBPARTIDAS',
    ];
    for (const element of tablaCostoUnitario) {
      if (!tipo.includes(element.id_tipo_insumo)) {
        tipo.push(element.id_tipo_insumo);
        const obj: insumo = {
          descripcion: tiposText[element.id_tipo_insumo - 1],
          cantidad: null,
          parcial: null,
          precio: null,
          unidad: null,
          num_det: 0,
        };
        if (retornar) {
          tablaNueva.push(obj);
        } else {
          this.tablaCostoUnitario.push(obj);
        }
      }
      tipo.push(element.id_tipo_insumo);
      const obj: insumo = {
        descripcion: element.descripcion,
        cantidad: element.cantidad,
        parcial: element.parcial,
        precio: element.precio,
        unidad: element.unidad,
        num_det: 1,
      };
      if (retornar) {
        tablaNueva.push(obj);
      } else {
        this.tablaCostoUnitario.push(obj);
      }
    }
    if (retornar) {
      return tablaNueva;
    }
  }

  async valorPlantillla() {
    let valor = null;
    if (this.rowSeleccionado.tipo_vinc == 'IDEM') {
      this.bloquear = true;
      valor = await this.estructuraIdem();
      // if (valor == null) {
      //   await this.estructurarEspecTecnicas();
      // } else {
      // }
    } else {
      this.bloquear = false;
      if (
        this.rowSeleccionado.tipo_vinc !== 'PENDIENTE' &&
        this.rowSeleccionado.tipo_vinc !== null
      ) {
        valor = this.rowSeleccionado.especificacion;
      } else {
        if (this.rowSeleccionado.unidad) {
          if (
            this.rowSeleccionado.tipo_vinc == 'PENDIENTE' ||
            this.rowSeleccionado.tipo_vinc == null
          ) {
            await this.estructurarEspecTecnicas();
            valor = this.espeTiny.value;
          } else {
            valor = this.rowSeleccionado.especificacion;
            // this.textoInicio = JSON.parse(
            //   JSON.stringify(this.rowSeleccionado.especificacion)
            // );
            // this.iniciado = true;
          }
        } else {
          valor = '';
          // this.textoInicio = JSON.parse(
          //   JSON.stringify(this.rowSeleccionado.especificacion)
          // );
          // this.iniciado = true;
        }
      }
    }
    return valor;
    // this.vista = 3;
  }

  async estructuraIdem(row = this.rowSeleccionado) {
    let texto = '';
    if (this.plantillaBase[10].informacion == 'DUPLICAR CONTENIDO') {
      const princi = await this.tablaEspecProy.find(
        (ele) => ele.indice == ele.vinculo_part
      );
      if (princi.especificacion == null) {
        const especifi = await this.estructurarEspecTecnicas(princi, true);
        // texto = this.espeTiny.value;
        texto = especifi;
      } else {
        texto = row.especificacion;
      }
    } else {
      texto =
        '<p>' + this.plantillaBase[10].detalle + ' ' + row.itemvinculo + '</p>';
    }
    return texto;
  }

  async habilitarEdicionIdem() {
    this.bloquear = false;
  }

  async estructurarEspecTecnicas(
    fila = this.rowSeleccionado,
    retornar = false
  ) {
    this.espeTiny.setValue(null);
    let texto = '';
    if (this.plantillaBase.length) {
      for (let i = 0; i < this.plantillaBase.length - 1; i++) {
        if (this.plantillaBase[i].seleccion) {
          let contenido = '';
          if (this.plantillaBase[i + 1].informacion == 'UNIDAD DE MEDIDA') {
            contenido =
              '<p style="padding-left: 40px;">El trabajo ejecutado se médira por la unidad : <b style="color:red; font-weight:800">' +
              fila?.unidad +
              `</p>`;
          }
          if (this.plantillaBase[i + 1].informacion == 'INSUMOS') {
            const rowInsumos = this.plantillaBase[i + 1].detalle
              ? JSON.parse(this.plantillaBase[i + 1].detalle)
              : [];
            contenido = await this.recuperarInsumosMEtYEqui(rowInsumos, fila);
          }
          let completo =
            '<p><strong id="' +
            (this.plantillaBase[i + 1].informacion == 'INSUMOS'
              ? 'insumo'
              : i) +
            '" style="padding-left: 40px; text-decoration: underline;">' +
            this.plantillaBase[i].detalle +
            '</strong></p><p style="padding-left: 40px">' +
            contenido +
            '</p>';
          texto = texto + completo;
        }
      }
      this.espeTiny.setValue(texto);
      if (retornar) {
        return texto;
      }
    } else {
      this.plantillaCreada = false;
    }
  }

  async recuperarInsumosMEtYEqui(
    seleccionados,
    rowSeleccionado = this.rowSeleccionado,
    tablaCostoUnitario = null
  ) {
    await this.recuperarCostoUnitarioPartida(rowSeleccionado.indice);
    let permitir = false;
    let arrayElementos = [];
    if (!tablaCostoUnitario) {
      tablaCostoUnitario = this.tablaCostoUnitario;
    }
    for (const iterator of tablaCostoUnitario) {
      if (!iterator.num_det) {
        if (seleccionados.includes(iterator.descripcion)) {
          permitir = true;
          arrayElementos.push({ descripcion: iterator.descripcion, tipo: 1 });
        }
        if (!seleccionados.includes(iterator.descripcion)) {
          permitir = false;
        }
      } else {
        if (permitir == true) {
          arrayElementos.push({ descripcion: iterator.descripcion, tipo: 0 });
        }
      }
    }
    let lista = null;
    if (arrayElementos.length) {
      lista =
        '<p style="padding-left: 40px;">Los materiales  utilizados en la partida son : </p>';
      let i = 0;
      for (const iterator of arrayElementos) {
        if (iterator.tipo == 1) {
          lista =
            lista +
            '<h5 style="margin-left: 45px; font-weight:900;">' +
            iterator.descripcion +
            '</h5> ';
        } else {
          if (arrayElementos[i - 1].tipo == 1) {
            lista = lista + '<ul>';
          }
          lista =
            lista +
            '<li style="margin-left: 30px">' +
            iterator.descripcion +
            '</li>';

          if (i < arrayElementos.length - 1) {
            if (arrayElementos[i + 1].tipo == 1) {
              lista = lista + '</ul>';
            }
          }
          if (i == arrayElementos.length - 1) {
            lista = lista + '</ul>';
          }
        }
        i++;
      }
    } else {
      lista = '';
    }
    return lista;
  }

  async SubirArchivo() {
    const imgTagCount = (this.espeTiny.value.match(/<img/g) || []).length;
    if(imgTagCount>=5){
      this.toaster.error('No se puede agregar mas de 5 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const fileUpload = document.getElementById(
      'fileUpload'
    ) as HTMLInputElement;
    if (fileUpload != null) {
      fileUpload.value = null;
    }
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      let anchi = 100;
      let altoi = 100;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          anchi = img.width;
          altoi = img.height;
        };
        img.src = e.target.result;
        this.extraerBase64(file).then(async (imagen: any) => {
          let fagre: archivoimg;
          fagre = { nombre: file.name, base: imagen.base };
          imagen = fagre;
          await this.cursor(imagen.base, anchi, altoi);
        });
      };
      reader.readAsDataURL(file);
    };
    fileUpload.click();
  }

  extraerBase64 = async ($event: any) =>
    new Promise((resolve, reject) => {
      try {
        const unsafeimg = window.URL.createObjectURL($event);
        const image = this.sanitizer.bypassSecurityTrustUrl(unsafeimg);
        const reader = new FileReader();
        reader.readAsDataURL($event);
        reader.onload = () => {
          resolve({
            base: reader.result,
          });
        };
        reader.onerror = (error) => {
          resolve({
            base: null,
          });
        };
      } catch (e) {
        return null;
      }
    });

  async resetearEspecificacion() {
    try {
      this.mostrar_carga_todo2 = true;

      await this.estructurarEspecTecnicas();

      this.mostrar_carga_todo2 = false;
    } catch (e) {
      SwalService.error(e);
      this.mostrar_carga_todo = false;
    }
  }

  async limpiarEspecificacion() {
    this.espeTiny.setValue('');
  }

  async cursor(img, ancho, alto) {
    let propor = 1;
    let nanch = ancho;
    let nalt = alto;
    if (ancho > 250 || alto > 250) {
      propor = Number((ancho / alto).toFixed(3));
      nanch = ancho > alto ? 250 : Number((250 * propor).toFixed(3));
      nalt = ancho > alto ? Number(Math.trunc(250 / propor).toFixed(3)) : 250;
    }
    const array = document.getElementsByTagName('img');
    const text =
      '<img src="' +
      img +
      '" width="' +
      nanch +
      '" height="' +
      nalt +
      '" id=' +
      'img' +
      array.length +
      '/>';
    if (img) {
      this.tinymce.editor.execCommand('mceInsertContent', false, text);
    }
  }

  async guardarEspecificacion(cargaPantalla = true) {
    let vinculados = [];
    if (this.textoInicio !== this.espeTiny.value) {
      let agregartexto = '';
      if (cargaPantalla) {
        this.mostrar_carga_todo2 = true;
      }
      let guardar = false;
      if (this.rowSeleccionado.tipo_vinc == 'IDEM') {
        this.rowSeleccionado.especificacion = this.espeTiny.value;
        this.rowSeleccionado.tipo_vinc = 'MANUAL';
        this.rowSeleccionado.color_vincpart = null;
        this.rowSeleccionado.itemvinculo = null;
        this.rowSeleccionado.vinculo_part = null;
        this.rowSeleccionado.editado = true;
        guardar = true;
        const obj = {
          indice: this.rowSeleccionado.indice,
          fecha: moment(this.today).format(),
          id_usuario: this.id_user,
          nombres: this.NombreUsuario,
        };
        this.tablaEspecificaciones[0].ultimoMod = obj;
      }
      if (
        this.rowSeleccionado.tipo_vinc == 'PENDIENTE' ||
        this.rowSeleccionado.tipo_vinc == null
      ) {
        this.rowSeleccionado.plantilla = null;
        this.rowSeleccionado.especificacion = this.espeTiny.value;
        this.rowSeleccionado.tipo_vinc = 'MANUAL';
        this.rowSeleccionado.editado = true;
        guardar = true;
        const obj = {
          indice: this.rowSeleccionado.indice,
          fecha: moment(this.today).format(),
          id_usuario: this.id_user,
          nombres: this.NombreUsuario,
        };
        this.tablaEspecificaciones[0].ultimoMod = obj;
      } else {
        this.rowSeleccionado.especificacion = this.espeTiny.value;
        this.rowSeleccionado.editado = true;
        this.rowSeleccionado.tipo_vinc = 'MANUAL';
        guardar = true;
        const obj = {
          indice: this.rowSeleccionado.indice,
          fecha: moment(this.today).format(),
          id_usuario: this.id_user,
          nombres: this.NombreUsuario,
        };
        this.tablaEspecificaciones[0].ultimoMod = obj;
        if (this.rowSeleccionado.vinculo_esp) {
          this.rowSeleccionado.tipo_vinc = 'SIST/MAN';
          vinculados.push(this.rowSeleccionado);
        }
      }
      if (this.rowSeleccionado.vinculo_part === this.rowSeleccionado.indice) {
        const grupoVinculo = await this.tablaEspecProy.filter(
          (ele) =>
            ele.vinculo_part == this.rowSeleccionado.vinculo_part &&
            ele.indice !== this.rowSeleccionado.indice
        );
        for (const iterator of grupoVinculo) {
          if (iterator.editable) {
            iterator.especificacion = this.rowSeleccionado.especificacion;
            iterator.editado = true;
            guardar = true;
            if (iterator.item.split('.')[0] == this.tablaEspecificaciones[0]) {
              const obj = {
                indice: this.rowSeleccionado.indice,
                fecha: moment(this.today).format(),
                id_usuario: this.id_user,
                nombres: this.NombreUsuario,
              };
              this.tablaEspecificaciones[0].ultimoMod = obj;
            }
            agregartexto = ', y se actualizaron los vinculados a esta partida.';
            vinculados.push(iterator);
          }
        }
      }

      if (this.rowSeleccionado.tipo_vinc == 'MANUAL') {
        let porc = null;
        if (this.rowSeleccionado.especificacion) {
          porc = await this.contarCaracteresEspecTec(
            this.rowSeleccionado.especificacion
          );
        }
        if (porc !== this.rowSeleccionado.porcentaje) {
          this.rowSeleccionado.porcentaje = porc;
          this.rowSeleccionado.editado = true;
          guardar = true;
          const obj = {
            indice: this.rowSeleccionado.indice,
            fecha: moment(this.today).format(),
            id_usuario: this.id_user,
            nombres: this.NombreUsuario,
          };
          this.tablaEspecificaciones[0].ultimoMod = obj;
          vinculados.push(this.rowSeleccionado);
        }
      }
      if (cargaPantalla) {
        // await this.guardarTemporal();
        await this.guardarmodificados(vinculados);
        this.mostrar_carga_todo2 = false;
        // this.toaster.success(
        //   'Se guardo correctamente' + agregartexto,
        //   'Correcto',
        //   {
        //     closeButton: false,
        //     positionClass: 'toast-bottom-right',
        //     timeOut: 4000,
        //   }
        // );
      } else {
        if (guardar) {
          // this.guardarTemporal();
          await this.guardarmodificados(vinculados);
          this.textoInicio = JSON.parse(
            JSON.stringify(this.rowSeleccionado.especificacion)
          );
        }
      }
    } else {
      if (cargaPantalla) {
        this.toaster.info('Ningun cambio realizado', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
      }
      return;
    }
    this.refrescar();
  }

  async refrescar() {
    if (this.actualizarVista) {
      this.mostrar_carga_todo = true;
      // this.toaster.info(
      //   'Se detectaron cambios en presupuesto , se actualizará la vista',
      //   null,
      //   {
      //     closeButton: false,
      //     positionClass: 'toast-bottom-right',
      //     timeOut: 4000,
      //   }
      // );
      SwalService.informative(
        '',
        'Se detectaron cambios en presupuesto, se actualizaron los datos'
      );
      this.actualizarVista = false;
      await this.volverAcargarVista();
    }
  }

  async volverAcargarVista() {
    this.mostrar_carga_todo = true;
    this.rowSeleccionado = null;
    this.vista = 0;
    this.tab = 0;
    this.espeTiny.setValue(null);
    await this.listarTitulos(true);

    this.mostrar_carga_todo = false;
  }

  async calculoPorcentajeTitulo(tabla) {
    let partidas = 0;
    let conEspecificacion = 0;
    let porcentaje = '0';
    tabla.map((ele) => {
      if (ele.unidad) {
        partidas++;
        if (ele.tipo_vinc !== null && ele.tipo_vinc !== 'PENDIENTE') {
          conEspecificacion++;
        }
      }
    });
    if (partidas > 0) {
      const porcentaje1 = (conEspecificacion / partidas) * 100;
      porcentaje = this.formsService.redondeo(porcentaje1, 2);
    }
    return {
      partidas: partidas,
      conEspecificacion: conEspecificacion,
      porcentaje: porcentaje,
    };
  }

  async buscarPartidas() {
    try {
      if (
        this.porcentajeBusqueda == null ||
        this.porcentajeBusqueda < 60 ||
        this.porcentajeBusqueda > 100
      ) {
        this.toaster.error('Porcentaje no válido', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
        return;
      } else {
        this.buscando3 = true;
        const obj = {
          id_partida:
            this.tipoBusqueda == 1
              ? this.rowSeleccionado.id_partida == null
                ? ''
                : this.rowSeleccionado.id_partida
              : '',
          partida: this.rowSeleccionado?.descripcion,
          porcentaje: this.porcentajeBusqueda,
          id_usuario: this.id_user,
          fuente: Number(this.tipoBusqueda),
          partsist: this.tipoBusqueda == 1 ? 1 : 0,
          partusua: this.tipoBusqueda == 1 ? 1 : 0,
          tipo_proy: this.tipoBusqueda == 1 ? 1 : 0,
          proyectos: '',
          tipobusq:
            this.tipoBusqueda == 1 ? 1 : this.rowSeleccionado?.unidad ? 1 : 2,
        };
        const response =
          await this.especificacionesTecnicasService.buscarPareceEspecPart(obj);
        const existe = await response.find(
          (ele) => Number(ele.fuente) !== 0 && Number(ele.fuente) !== 1
        );
        this.datadeProy = existe ? false : true;
        if (response) {
          this.buscando3 = false;
          for (const iterator of response) {
            iterator.checkVinculo = false;
            if (this.rowSeleccionado?.vinculo_espproy) {
              if (
                Number(this.rowSeleccionado.vinculo_espproy) ==
                  Number(iterator.id_proy) &&
                Number(this.rowSeleccionado.vinculo_esp) ==
                  Number(iterator.indice)
              ) {
                iterator.checkVinculo = true;
              }
            } else {
              if (
                Number(this.rowSeleccionado.vinculo_esp) ==
                Number(iterator.indice)
              ) {
                iterator.checkVinculo = true;
              }
            }
          }
          this.tablaVinculo = response;
        }
      }
    } catch (error) {
      console.log(error);
      SwalService.error(error);
      this.buscando3 = false;
    }
  }

  cambioTipoProy(select) {
    if (select == 1) {
      this.proyectosSeleccionados = [];
    } else {
      this.clasificacion = '';
    }
  }

  mostrarAlerta() {
    if (this.plantillaBase?.length) {
    } else {
      this.toaster.error(
        'Plantilla especificacion tecnica no creada',
        'Advertencia',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
    }
  }

  verificar(item) {
    return (
      !this.proyectosSeleccionados.includes(item) &&
      this.proyectosSeleccionados.length > 4
    );
  }

  async especTecnXPartida(item) {
    try {
      const modalRef = this.modalService.open(ModalVerEspecificacionComponent, {
        size: 'lg',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.especificacion = item.especificacion;
      const result = await modalRef.result;
      if (result) {
      }
    } catch (e) {
      console.log(e);
    }
  }

  async vincularETxTitulo() {
    try {
      await this.refrescar();
      const dataTitulo = await this.listaTitulos.find(
        (ele) => ele.indice == this.tituloSeleccionado.value
      );
      const modalRef = this.modalService.open(
        ModalBusquedaEspecificacionComponent,
        {
          size: 'xl',
          backdrop: 'static',
          windowClass: 'pcoded',
          keyboard: false,
        }
      );
      modalRef.componentInstance.clasificaciones = this.clasificaciones;
      modalRef.componentInstance.listaProyUsuario = this.listaProyUsuario;
      modalRef.componentInstance.tablaEspecificaciones =
        this.tablaEspecificaciones;
      modalRef.componentInstance.titulo1 = this.titulo1;
      modalRef.componentInstance.titulo1color = this.titulo1color;
      modalRef.componentInstance.titulo1letra = this.titulo1letra;
      modalRef.componentInstance.id_user = this.id_user;
      modalRef.componentInstance.dataTitulo = dataTitulo;
      modalRef.componentInstance.idproyecto = this.idProyecto;
      const result = await modalRef.result;
      if (result) {
        this.mostrar_carga_todo = true;
        const modificados = await this.reemplazarVinculados(result);
        if (modificados.length) {
          await this.guardarmodificados(modificados);
        }
        // await this.guardarTemporal();
        await this.refrescar();
        this.rowSeleccionado = null;
        this.vista = 0;
        this.tab = 0;
        this.mostrar_carga_todo = false;
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
    }
  }

  async reemplazarVinculados(result) {
    let tablaModificados = [];
    for (const iterator of result) {
      const encontrado = await this.tablaEspecificaciones.find(
        (ele) => Number(ele.indice) == Number(iterator.indice)
      );
      if (encontrado) {
        encontrado.porcentaje = iterator.porcentaje2;
        encontrado.vinculo_esp = iterator.vinculo_esp2;
        encontrado.vinculo_espproy = iterator.vinculo_espproy2;
        encontrado.especificacion = iterator.especificacion2;
        encontrado.editado = true;
        const obj = {
          indice: encontrado.indice,
          fecha: moment(this.today).format(),
          id_usuario: this.id_user,
          nombres: this.NombreUsuario,
        };
        this.tablaEspecificaciones[0].ultimoMod = obj;
        encontrado.tipo_vinc = 'SISTEMA';
        encontrado.plantilla = null;
        encontrado.vinculo_fuente = iterator.vinculo_fuente;

        encontrado.color_vincpart = iterator.color_vincpart;

        if (encontrado.vinculo_part == encontrado.indice) {
          const grupoVinculo = await this.tablaEspecProy.filter(
            (ele) => ele.vinculo_part == encontrado.indice
          );
          if (grupoVinculo.length) {
            for (const row of grupoVinculo) {
              row.especificacion = encontrado.especificacion;
              row.color_vincpart = encontrado.color_vincpart;
              row.itemvinculo = encontrado.itemvinculo;
              row.editado = true;
              const obj = {
                indice: row.indice,
                fecha: moment(this.today).format(),
                id_usuario: this.id_user,
                nombres: this.NombreUsuario,
              };
              tablaModificados.push(row);
              this.tablaEspecificaciones[0].ultimoMod = obj;
            }
          } else {
            tablaModificados.push(encontrado);
          }
        } else {
          tablaModificados.push(encontrado);
        }
      }
    }
    return tablaModificados;
  }

  async accionVincular(checked, idx) {
    for (const iterator of this.tablaVinculo) {
      iterator.checkVinculo = false;
    }
    if (checked) {
      this.tablaVinculo[idx].checkVinculo = true;
      this.rowSeleccionado.editado = true;
      const obj = {
        indice: this.rowSeleccionado.indice,
        fecha: moment(this.today).format(),
        id_usuario: this.id_user,
        nombres: this.NombreUsuario,
      };
      this.tablaEspecificaciones[0].ultimoMod = obj;
      this.rowSeleccionado.vinculo_esp = this.tablaVinculo[idx].indice;
      this.rowSeleccionado.especificacion =
        this.tablaVinculo[idx].especificacion;
      this.rowSeleccionado.plantilla = null;
      this.rowSeleccionado.vinculo_espproy =
        this.forma == 1 ? null : this.tablaVinculo[idx].id_proy;
      this.rowSeleccionado.porcentaje = this.tablaVinculo[idx].porc;
      this.rowSeleccionado.tipo_vinc = 'SISTEMA';
      this.rowSeleccionado.vinculo_fuente = this.tablaVinculo[idx].fuente;
    } else {
      if (this.rowSeleccionado.vinculo_esp == this.tablaVinculo[idx].indice) {
        this.rowSeleccionado.editado = true;

        const obj = {
          indice: this.rowSeleccionado.indice,
          fecha: moment(this.today).format(),
          id_usuario: this.id_user,
          nombres: this.NombreUsuario,
        };
        this.tablaEspecificaciones[0].ultimoMod = obj;
        this.rowSeleccionado.vinculo_esp = null;
        this.rowSeleccionado.vinculo_espproy = null;
        this.rowSeleccionado.plantilla = null;
        this.rowSeleccionado.porcentaje = null;
        this.rowSeleccionado.tipo_vinc = null;
        this.rowSeleccionado.vinculo_fuente = null;
      }
    }
    const modificados = [this.rowSeleccionado];
    await this.guardarmodificados(modificados);
    // this.guardarTemporal();
  }

  async descartarCambios() {
    // const temporal = await this.listarTemporal();
    // if (temporal) {
    //   const sw = await SwalService.confirm(
    //     'Estas seguro?',
    //     'Se descartará todos los cambios realizados'
    //   );
    //   if (sw.isConfirmed) {
    //     this.mostrar_carga_todo = true;
    //     this.rowSeleccionado = null;
    //     this.tab = 0;
    //     this.vista = 0;
    //     this.busqueda = '';
    //     this.proyectosSeleccionados = [];
    //     this.clasificacion = '';
    //     this.tablaVinculo = [];
    //     this.espeTiny.setValue(null);
    //     this.textoInicio = null;
    //     this.forma = 1;
    //     this.tablaCostoUnitario = [];
    //     await this.descartarTemporal();
    //     this.tablaEspecificaciones = [];
    //     this.espeTiny.setValue(null);
    //     await this.recuperarPlantilla();
    //     await this.listarTitulos(true);
    //     await this.listarClasificacionProyectos();
    //     await this.recuperarProyectos();
    //     setTimeout(async () => {
    //       await this.cambiarTitulo(this.tituloSeleccionado.value, false);
    //       this.mostrar_carga_todo = false;
    //       this.toaster.success('Se restauro correctamente', 'Éxito', {
    //         closeButton: false,
    //         positionClass: 'toast-bottom-right',
    //         timeOut: 4000,
    //       });
    //     }, 50);
    //   }
    // } else {
    //   this.toaster.info('Ningun cambio realizado', null, {
    //     closeButton: false,
    //     positionClass: 'toast-bottom-right',
    //     timeOut: 4000,
    //   });
    // }
  }

  async guardarCambios() {
    try {
      const encontrado = await this.tablaEspecProy.filter((ele) => ele.editado);
      if (encontrado.length) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          'Se guardaran todos los cambios realizados'
        );
        if (sw.isConfirmed) {
          this.mostrar_carga_todo = true;
          if (this.rowSeleccionado) {
            await this.guardarEspecificacion(false);
          }
          const cortar = await this.apiGuardar();
          if (cortar) {
            this.mostrar_carga_todo = false;
            return;
          }
          await this.descartarTemporal();
          for (const iterator of this.tablaEspecificaciones) {
            iterator.editado = false;
          }
        }
      } else {
        this.toaster.info('Ningun cambio realizado', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async apiGuardar() {
    let cortar = false;
    let tablaGuardado = [];
    const indicesEliminar = await this.listarIndicesElimPresupuesto();
    if (indicesEliminar.length) {
      await this.limpiarIndicesEliminados(indicesEliminar, true);
    }
    for (const row of this.tablaEspecProy) {
      if (row.editado) {
        tablaGuardado.push(row);
        row.editado = false;
      }
      if (row.item.split('.').length == 1 && row.ultimoMod) {
        await this.guardarInformacionTitulo(row);
        row.ultimoMod = null;
      }
    }

    const datos1 = JSON.stringify(tablaGuardado);
    const obj = JSON.stringify({
      id_proyecto: this.idProyecto,
      datos1: datos1,
    });
    const response =
      await this.especificacionesTecnicasService.guardarCambiosEspec(obj);
    if (response.id == '1') {
      if (indicesEliminar.length) {
        await this.limpiarIndicesElimina();
      }
      this.mostrar_carga_todo = false;
      this.toaster.success('Se almaceno correctamente', 'Éxito', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    } else if (response.id == '2') {
      this.mostrar_carga_todo = false;
      this.toaster.error(
        'No se pudo guardar, cambios almacenandose en presupuesto intente guardar en un momento',
        'Adevertencia',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 7000,
        }
      );
      cortar = true;
    } else {
      this.mostrar_carga_todo = false;
      SwalService.error();
      cortar = true;
    }
    return cortar;
  }

  async guardar2(tabla) {
    let cortar = false;
    const datos1 = JSON.stringify(tabla);
    const obj = JSON.stringify({
      id_proyecto: this.idProyecto,
      datos1: datos1,
    });
    const response =
      await this.especificacionesTecnicasService.guardarCambiosEspec(obj);
    if (response.id !== '1') {
      cortar = true;
    }
    return cortar;
  }

  async guardarInformacionTitulo(data) {
    const partida = this.tablaEspecProy.find(
      (ele) => ele.indice == data.ultimoMod.indice
    );
    const obj = {
      id_proyecto: this.idProyecto,
      indice: data.indice,
      tipo_vinc: partida.tipo_vinc,
      itempart: partida.item,
      descpart: partida.descripcion,
      editor: data.ultimoMod.id_usuario,
    };
    const response =
      await this.especificacionesTecnicasService.guardarInfoEspec(obj);
  }

  async habilitarMultiple() {
    await this.refrescar();
    this.multiple = !this.multiple;
    if (!this.multiple) {
      for (const iterator of this.tablaEspecificaciones) {
        iterator.selectMult = false;
      }
    } else {
      this.rowSeleccionado = null;
      this.busqueda = '';
    }
  }

  async resetearVinculo() {
    await this.refrescar();
    if (this.multiple) {
      const seleccionados = await this.tablaEspecificaciones.filter(
        (ele) => ele.selectMult
      );
      if (seleccionados.length) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          'Se reiniciara la informacion de las filas seleccionadas'
        );
        if (sw.isConfirmed) {
          let modificados = [];
          this.mostrar_carga_todo = true;
          for (const iterator of seleccionados) {
            const ele = await this.resetearVinculoFila(Number(iterator.ind));
            modificados.push(ele);
          }

          this.vista = 0;
          this.tab = 0;
          this.textoInicio = null;
          this.rowSeleccionado = null;
          this.multiple = false;
          await this.guardarmodificados(modificados);
          // await this.guardarTemporal();
          this.mostrar_carga_todo = false;
        }
      } else {
        this.toaster.info('Ninguna fila seleccionada', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
      }
    } else {
      if (this.rowSeleccionado) {
        const encontrado = await this.tablaEspecProy.filter(
          (ele) => ele.vinculo_part == this.rowSeleccionado.vinculo_part
        );
        if (
          this.rowSeleccionado.vinculo_part == this.rowSeleccionado.indice &&
          encontrado.length > 1
        ) {
          this.toaster.error('Partida principal de un vinculo', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          });
        } else {
          const sw = await SwalService.confirm(
            'Estas seguro?',
            'Se reiniciara la informacion de la fila seleccionada'
          );
          if (sw.isConfirmed) {
            this.mostrar_carga_todo = true;
            if (this.rowSeleccionado.vinculo_part) {
              if (encontrado.length == 2) {
                for (const iterator of encontrado) {
                  if (iterator.indice == iterator.vinculo_part) {
                    iterator.itemvinculo = null;
                    iterator.color_vincpart = null;
                    iterator.vinculo_part = null;
                  }
                }
              }
            }

            await this.resetearVinculoFila(Number(this.rowSeleccionado.ind));
            await this.valorPlantillla();

            this.vista = 3;
            this.tab = 3;
            this.textoInicio = null;
            const c = JSON.parse(JSON.stringify(this.rowSeleccionado.ind));
            this.rowSeleccionado = null;

            await this.clickFila(this.tablaEspecProy[c]);
            this.multiple = false;
            // await this.guardarTemporal();
            const modificados = [this.rowSeleccionado];
            await this.guardarmodificados(modificados);
            this.mostrar_carga_todo = false;
          }
        }
      } else {
        this.toaster.error('Ninguna fila seleccionada', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
      }
    }
  }

  async resetearVinculoFila(index) {
    this.tablaEspecProy[index].especificacion = null;
    this.tablaEspecProy[index].modalidad = null;
    this.tablaEspecProy[index].porcentaje = null;
    this.tablaEspecProy[index].porcentaje2 = null;
    this.tablaEspecProy[index].tipo_vinc = null;
    this.tablaEspecProy[index].vinculo_esp = null;
    this.tablaEspecProy[index].vinculo_espproy = null;
    this.tablaEspecProy[index].vinculo_part = null;
    this.tablaEspecProy[index].itemvinculo = null;
    this.tablaEspecProy[index].color_vincpart = null;
    this.tablaEspecProy[index].plantilla = null;
    this.tablaEspecProy[index].editado = true;
    const obj = {
      indice: this.tablaEspecProy[index].indice,
      fecha: moment(this.today).format(),
      id_usuario: this.id_user,
      nombres: this.NombreUsuario,
    };
    this.tablaEspecProy[0].ultimoMod = obj;
    this.tablaEspecProy[index].selectMult = false;
    this.tablaEspecProy[index].vinculo_fuente = null;
    return this.tablaEspecProy[index];
  }

  async estructurarTablaVinc() {
    const obj = {
      vinculo_esp: this.rowSeleccionado.vinculo_esp,
      vinculo_espproy:
        this.rowSeleccionado.vinculo_espproy !== null
          ? this.rowSeleccionado.vinculo_espproy
          : '',
    };
    const response =
      await this.especificacionesTecnicasService.recuperaEspVinculada(obj);
    if (response.length) {
      this.tablaVinculado = response;
    }
  }

  // async guardarTemporal() {
  //   try {
  //     this.tempEspecTecn = true;
  //     const obj2 = {
  //       tablaEspecProy: this.tablaEspecProy,
  //     };
  //     const obj = {
  //       id_proyecto: this.id_proyecto,
  //       id_usuario: this.id_user,
  //       datatemp: JSON.stringify(obj2),
  //     };
  //     const response =
  //       await this.especificacionesTecnicasService.guardarEspecTemp(obj);

  //   } catch (e) {
  //     console.log(e);
  //     SwalService.error(e);
  //   }
  // }

  // async listarTemporal() {
  //   let data;
  //   const obj = {
  //     id_proyecto: this.id_proyecto,
  //     id_usuario: this.id_user,
  //   };
  //   const response = await this.especificacionesTecnicasService.listarEspecTemp(
  //     obj
  //   );
  //   if (!response.length) {
  //     data = null;
  //   } else {
  //     data = JSON.parse(response[0].datatemp);
  //   }
  //   return data;
  // }

  async descartarTemporal() {
    const obj = {
      id_proyecto: this.id_proyecto,
      id_usuario: this.id_user,
    };
    const response =
      await this.especificacionesTecnicasService.descartaCambiosEspec(obj);
    this.tempEspecTecn = false;
  }

  async openModalVinculoTitulo() {
    try {
      if (this.permisos.length && !this.permisos[0].edit) {
        this.toaster.error('Edicion no disponible', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      }
      this.mostrar_carga_todo = true;
      setTimeout(async () => {
        await this.refrescar();
        this.mostrar_carga_todo = false;
        const modalRef = this.modalService.open(
          ModalVinculoPartidasEspComponent,
          {
            size: 'xl',
            backdrop: 'static',
            windowClass: 'pcoded',
            keyboard: false,
          }
        );
        modalRef.componentInstance.fondo = this.titulo1;
        modalRef.componentInstance.color = this.titulo1color;
        modalRef.componentInstance.letra = this.titulo1letra;
        modalRef.componentInstance.dec_metrado = this.dec_metrado;
        modalRef.componentInstance.mask_metrado = this.mask_metrado;
        modalRef.componentInstance.dec_precio = this.dec_precio;
        modalRef.componentInstance.mask_precio = this.mask_precio;
        modalRef.componentInstance.dec_parcial = this.dec_parcial;
        modalRef.componentInstance.mask_parcial = this.mask_parcial;
        modalRef.componentInstance.tablaEspecificaciones = this.tablaEspecProy;
        const result = await modalRef.result;
        if (result) {
          this.mostrar_carga_todo = true;
          if (result?.indices.length) {
            let i = 0;
            for (const element of result.indices) {
              this.tablaEspecProy[element] = result.filas[i];
              i++;
            }
            await this.guardarmodificados(result.filas);
            await this.separarTitulos();
            await this.cambiarTitulo(this.tituloSeleccionado.value);
          }
          // this.tablaEspecProy = result;

          // await this.guardarTemporal();
          await this.refrescar();

          this.rowSeleccionado = null;
          this.textoInicio = null;
          this.espeTiny.setValue(null);
          this.vista = null;
          this.tab = null;
          this.mostrar_carga_todo = false;
        }
      }, 100);
    } catch (e) {
      this.mostrar_carga_todo = false;
      SwalService.error();
      console.log('e', e);
    }
  }

  async buscarParecidos() {
    let tablaProyecto = await this.recuperarEspecificaciones('');
    let datareturn = null;
    if (this.rowSeleccionado && this.rowSeleccionado?.unidad) {
      let rowsel = this.rowSeleccionado;
      let data = JSON.parse(JSON.stringify(this.tablaEspecificaciones));
      let filtered = [];
      let arrind = [];
      let padre = '';
      let rowpri;
      for (let i = data.length - 1; i >= 0; i--) {
        if (rowsel.vinculo && rowsel.vinculo == data[i].vinculo) {
          let parece = stringSimilarity(
            data[i].descripcion,
            rowsel.descripcion
          );
          data[i].seleccion = 1;
          data[i].porc = this.formsService.redondeo(parece * 100, 2);
          data[i].verbloq = 1;
          filtered.push(data[i]);
          arrind.push(i);
          padre = data[i].item.substring(0, data[i].item.lastIndexOf('.'));
          if (rowsel.vinculo == data[i].indice) {
            rowpri = data[i];
          }
        } else {
          let parece = stringSimilarity(
            data[i].descripcion,
            rowsel.descripcion
          );
          if (parece >= 0.9 && data[i].unidad != '') {
            if (data[i].unidad != '' && data[i].vinculo != null) {
              data[i].seleccion = 2;

              if (rowsel.vinculo && data[i].vinculo == rowsel.vinculo) {
                data[i].seleccion = 1;
                rowpri = data[i];
              }
            } else {
              data[i].seleccion = rowsel.indice == data[i].indice ? 1 : 0;
            }
            data[i].porc = this.formsService.redondeo(parece * 100, 2);
            data[i].verbloq = 1;
            filtered.push(data[i]);
            arrind.push(i);
            padre = data[i].item.substring(0, data[i].item.lastIndexOf('.'));
          }
        }
        if (padre == data[i].item) {
          if (data[i].unidad != '' && data[i].vinculo != null) {
            data[i].seleccion = 2;
          }
          filtered.push(data[i]);
          arrind.push(i);
          padre =
            data[i].item.split('.').length > 1
              ? data[i].item.substring(0, data[i].item.lastIndexOf('.'))
              : '';
        }
      }
      let tablapasa = filtered.reverse();
      let indicestabla = arrind.reverse();
      datareturn = {
        tablapasa: tablapasa,
        indicestabla: indicestabla,
        rowpri: rowpri,
      };
    } else {
      const msj =
        this.rowSeleccionado?.unidad == ''
          ? 'Fila seleccionada no es partida'
          : 'Ninguna fila seleccionada';
      this.toaster.error(msj, 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    }
    return datareturn;
  }

  async contarCaracteresEspecTec(especificacion) {
    let nuevo = '';
    let considerar = false;
    var count = especificacion.split('<img').length - 1;
    for (const iterator of especificacion) {
      if (considerar && iterator !== '<') {
        nuevo = nuevo + iterator;
      }
      if (iterator == '<') {
        considerar = false;
      }
      if (iterator == '>' && !considerar) {
        considerar = true;
      }
    }

    const nuevo2 = nuevo.split(/&nbsp;| /).join('');
    const total = (nuevo2.length ? nuevo2.length : 0) + count;
    return total;
  }

  async cambioDeTabPrinci(event) {
    this.active = event.nextId;
    if (event.nextId == 1) {
      this.infoTitulo = null;
      let index = 0;

      let indice = null;
      if (this.tituloSeleccionado.value) {
        indice = this.tituloSeleccionado.value;
      } else {
        indice = this.listaTitulos[0].indice;
      }
      await this.cambiarTitulo(indice, true);
      for (const iterator of this.tablaEspecProy) {
        if (iterator.item.split('.').length == 1) {
          const tabla = await this.tablaTitulo(
            this.tablaEspecProy,
            iterator.item,
            index
          );
          iterator.registroTit = (
            await this.calculoPorcentajeTitulo(tabla)
          ).porcentaje;
        }
        index++;
      }
    } else {
      if (!this.tablaEspecificaciones.length) {
        const titulo = this.listaTitulos[0];
        await this.verTituloSelect(titulo);

        await this.recuperarPlantilla();
        this.infoTitulo = null;
      }
    }

    this.textoInicio = null;
    this.rowSeleccionado = null;
    this.tab = 0;
    this.vista = null;
    this.espeTiny.setValue(null);
  }

  async cambioPlantilla() {
    await this.recuperarPlantilla();
  }

  async verificarPlantillaText() {
    if (!this.plantillaBase) {
      this.toaster.error('Plantilla no creada', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    }
  }

  async noValido() {
    await this.refrescar();
    this.toaster.error('Guarde o descarte los cambios no almacenados', '', {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: 4000,
    });
    return;
  }

  async importarWord(event: any) {
    await this.refrescar();
    const fileUpload = document.getElementById(
      'fileUpload2'
    ) as HTMLInputElement;
    if (fileUpload != null) {
      fileUpload.value = null;
    }
    fileUpload.onchange = () => {
      this.htmlDocumento = '';
      this.modalWord.show();
      this.TipoReemplazo = 1;
      this.mostrar_carga_todo = true;
      let htmlText = '';
      this.paso = 0;
      this.indiceFinal = null;
      const file = fileUpload.files[0];
      if (!file) {
        this.mostrar_carga_todo = false;
        return;
      }
      if (
        file?.type !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        this.mostrar_carga_todo = false;
        this.toaster.error(
          'Formato documento no válido, Permitidos .docx',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return;
      }
      this.nombreDocumento = file.name;
      this.paso = 0;
      file.arrayBuffer().then(async (buff) => {
        let x = new Uint8Array(buff);
        await mammoth
          .convertToHtml({ arrayBuffer: x })
          .then(async function (result) {
            var html = result.value;
            var messages = result.messages;
            htmlText = html;
          })
          .catch(function (error) {
            console.error(error);
          });
        await this.analizarDataWord(htmlText, true);

        this.mostrar_carga_todo = false;
      });
    };
  }

  cerrarModal() {
    this.tipoComparacion = 1;
    this.paso = 0;
    this.stepper.reset();
    this.modalWord.hide();
    this.tablaEspTit = [];
    this.htmlDocumento = null;
    this.arregloHtml = [];
    this.tablaFilasNumericas = [];
    this.bloquearAccion = false;
    const fileUpload = document.getElementById(
      'fileUpload2'
    ) as HTMLInputElement;
    if (fileUpload) {
      fileUpload.value == '';
    }
  }

  cerrarModal2() {
    this.modalGeneralidades.hide();
    this.htmlGeneralidades = null;
  }

  async analizarDataWord(html, inicio = false) {
    html = html.split('<img').join('<img style ="height:300px;width:450px"');
    if (!this.tablaEspecificaciones.length) {
      this.toaster.error('Titulo sin ningun valor a analizar', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return;
    }
    this.htmlResaltado = [];

    this.htmlDocumento = JSON.parse(JSON.stringify(html));
    this.arregloHtml = [];
    if (inicio) {
      let j = 0;
      for (const iterator of this.tablaEspecificaciones) {
        const obj = {
          ind: j,
          item: iterator.item,
          descripcion: iterator.descripcion,
          tipo_vinc: iterator.tipo_vinc,
          parecidos: [],
          iguales: [],
          tipoError: null,
          unidad: iterator.unidad,
          especificacion: null,
          indice: iterator.indice,
        };
        this.tablaEspTit.push(obj);
        j++;
      }
    }
    html = html.replace(/<td><p>/g, '<td>');
    html = html.replace(/<\/p><\/td>/g, '</td>');
    html = html.replace(/\t/g, '   ');
    let arreglo = html.split('<p>').join('|||||').split('|||||');
    this.arregloHtml = arreglo;
    this.tablaFilasNumericas = [];
    let considerados = [];
    let i = 0;
    let k = 0;
    let especif = '';
    const sgtetitulo = await this.listaTitulos.find(
      (ele) => ele.item > this.tablaEspecificaciones[0].item
    );
    for (const iterator of arreglo) {
      especif = especif + iterator;
      let div = document.createElement('div');
      div.innerHTML = iterator;
      let text2 = div.textContent || div.innerText || '';
      const text3 = text2.replace(/ /g, '');
      const numero = parseFloat(text3);
      const itemTitu = this.tablaEspecificaciones[0].item;
      if (!isNaN(numero) && numero.toString().split('.')[0] == itemTitu) {
        const spliteado = text2.split(' ');
        let itemArr = [];

        for (const celda of spliteado) {
          const numerico = parseInt(celda);
          if (!isNaN(Number(numerico))) {
            const arrCelda = celda.split('.');
            for (const ele of arrCelda) {
              if (!isNaN(Number(ele)) && ele !== '') {
                itemArr.push(Number(ele));
              } else {
                itemArr = [];
                break;
              }
            }
          } else {
            break;
          }
        }
        const itemRecuperado = itemArr.join('.');
        const descripcion = text2.replace(spliteado[0], '');
        if (considerados?.length) {
          const response = await this.compararItems(
            considerados[considerados.length - 1]?.item,
            itemArr.join('.')
          );
          if (response == 1 || itemArr[itemArr.length - 1] == 0) {
            itemArr = [];
          }
        }

        if (itemArr.length) {
          especif = '';
          const obj = {
            ind: k,
            ind_completo: i,
            ind_parecido_presu: null,
            ind_igual_presu: null,
            item: itemRecuperado,
            descripcion: descripcion.trim(),
            parecidos: [],
            iguales: [],
            repetidos: [],
            tipoError: null,
          };

          await this.tablaEspTit.map((ele, index) => {
            const text1 = ele.descripcion
              .replace(/ /g, '')
              .trim()
              .toUpperCase();
            const text2 = obj.descripcion
              .replace(/ /g, '')
              .trim()
              .toUpperCase();
            const parece = stringSimilarity(text1, text2);
            if (ele.item == obj.item && parece > 0.79 && parece < 0.96) {
              obj.parecidos.push(ele.ind);
              obj.tipoError = 2;
              obj.ind_parecido_presu = index;
              this.tablaEspTit[index].parecidos.push(obj.ind);
              this.tablaEspTit[index].tipoError = 2;
            } else if (ele.item == obj.item && parece > 0.95) {
              obj.iguales.push(ele.ind);
              obj.tipoError = 0;
              obj.ind_igual_presu = index;
              this.tablaEspTit[index].iguales.push(obj.ind);
              this.tablaEspTit[index].tipoError = 0;
            } else {
              if (ele.item == obj.item && parece < 0.8) {
                obj.parecidos.push(ele.ind);
                obj.tipoError = 3;
                obj.ind_parecido_presu = index;
                this.tablaEspTit[index].parecidos.push(obj.ind);
                this.tablaEspTit[index].tipoError = 3;
              }
            }
          });

          considerados.push(obj);
          this.htmlResaltado.push('<p class="resaltado">' + iterator);
          this.tablaFilasNumericas.push(obj);
          k++;
        } else {
          this.htmlResaltado.push('<p>' + iterator);
        }
      } else if (!isNaN(numero)) {
        const spliteado = text3.split(/[\s.]+/);
        let itemArr = [];
        for (const celda of spliteado) {
          const numerico = parseInt(celda);
          if (!isNaN(Number(numerico))) {
            itemArr.push(numerico);
            if (numerico.toString().length !== celda.toString().length) {
              break;
            }
          } else {
            break;
          }
        }
        const itemRecuperado = itemArr.join('.');
        const descripcion = text2.replace(itemRecuperado, '');

        if (sgtetitulo) {
          const text1 = text3.replace(/ /g, '').trim().toUpperCase();
          const text2 = (sgtetitulo.item + sgtetitulo.descripcion)
            .replace(/ /g, '')
            .trim()
            .toUpperCase();
          const parece = stringSimilarity(text1, text2);

          if (parece > 0.95) {
            this.indiceFinal = i;
          }
        }
        const obj = {
          ind: k,
          ind_completo: i,
          ind_parecido_presu: null,
          ind_igual_presu: null,
          item: itemRecuperado,
          descripcion: descripcion.trim(),
          parecidos: [],
          iguales: [],
          repetidos: [],
          tipoError: null,
        };
        this.tablaFilasNumericas.push(obj);
        this.htmlResaltado.push('<p>' + iterator);
      } else {
        this.htmlResaltado.push('<p>' + iterator);
      }
      i++;
    }
    var ele = document.getElementById('containerWord');
    ele.innerHTML = this.htmlResaltado.join('');
    this.encontradosDoc = considerados;
    let n = 0;
    for (const iterator of this.encontradosDoc) {
      const repetidos = await this.encontradosDoc.filter(
        (ele, index) => ele.item == iterator.item && n !== index
      );

      if (repetidos.length) {
        iterator.repetidos = repetidos;
        iterator.tipoError = 1;
      }
      n++;
    }
    this.mostrar_carga_todo = false;
  }

  async compararItems(item1: string, item2: string) {
    const parts1 = item1.split('.').map(Number);
    const parts2 = item2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const v1 = parts1[i] || 0;
      const v2 = parts2[i] || 0;

      if (v1 > v2) return 1;
      if (v1 < v2) return -1;
    }
    return 0;
  }

  async cambioTipoComparacion() {
    try {
      this.mostrar_carga_todo = true;
      const html = this.htmlDocumento;
      this.htmlResaltado = [];
      this.tablaFilasNumericas = [];
      this.encontradosDoc = [];
      this.tablaEspTit = [];
      let j = 0;
      this.bloquearAccion = false;
      for (const iterator of this.tablaEspecificaciones) {
        const obj = {
          ind: j,
          item: iterator.item,
          descripcion: iterator.descripcion,
          tipo_vinc: iterator.tipo_vinc,
          parecidos: [],
          iguales: [],
          tipoError: null,
          unidad: iterator.unidad,
          especificacion: null,
          indice: iterator.indice,
        };
        this.tablaEspTit.push(obj);
        j++;
      }
      if (this.tipoComparacion == 2) {
        await this.tipoDescripcion(html);
      } else {
        await this.analizarDataWord(html);
      }
    } catch (e) {
      console.log(e);
      this.mostrar_carga_todo = false;
      SwalService.error(e);
    }
  }

  async tipoDescripcion(html) {
    let listaConsiderados = [];
    let div = document.createElement('textArea');
    div.innerHTML = this.htmlDocumento;
    const data2 = div.innerText.split('<p>').join('|||||').split('|||||');
    setTimeout(async () => {
      let k = 0;
      let i = 0;
      for (const iterator of this.arregloHtml) {
        let div = document.createElement('div');
        div.innerHTML = iterator;
        let text2 = div.textContent || div.innerText || '';
        const descripcion = text2.replace(/ /g, '');
        const encontrados = await this.tablaEspTit.filter((ele) => {
          const desUnid = ele.descripcion.replace(/ /g, '');
          const parece = stringSimilarity(
            descripcion.toUpperCase(),
            desUnid.toUpperCase()
          );
          if (parece > 0.5) {
            return ele;
          }
        });
        if (encontrados.length) {
          const obj = {
            ind: k,
            ind_completo: i,
            ind_parecido_presu: null,
            ind_igual_presu: null,
            item: null,
            descripcion: text2.trim(),
            parecidos: encontrados,
            iguales: [],
            repetidos: [],
            tipoError: null,
          };
          obj.tipoError = 2;
          for (const fil of encontrados) {
            this.tablaEspTit[fil.ind].parecidos.push(k);
            this.tablaEspTit[fil.ind].tipoError = 2;
          }
          this.encontradosDoc.push(obj);
          this.htmlResaltado.push('<p class="resaltado">' + iterator);

          k++;
        } else {
          this.htmlResaltado.push('<p>' + iterator);
        }
        i++;
      }
      var ele = document.getElementById('containerWord');
      ele.innerHTML = this.htmlResaltado.join('');
      this.mostrar_carga_todo = false;
    }, 50);
  }

  async multipleTipoDescripcion() {
    const sw = await SwalService.confirm(
      'Esta seguro?',
      'Se asignara item en la tacla documento con los que tengan 1 coincidencia de n° doc'
    );
    if (sw.isConfirmed) {
      this.mostrar_carga_todo = true;
      for (const iterator of this.tablaEspTit) {
        if (iterator.parecidos.length == 1) {
          const indDocumento = iterator.parecidos[0];
          for (const row of this.encontradosDoc[indDocumento].parecidos) {
            const indice = this.tablaEspTit[row]?.parecidos?.findIndex(
              (ele) => ele == row
            );
            if (indice !== -1) {
              this.tablaEspTit[row.ind].parecidos?.splice(indice, 1);
              if (!this.tablaEspTit[row.ind]?.parecidos.length) {
                this.tablaEspTit[row.ind].tipoError = null;
              }
            }
          }
          iterator.tipoError = 0;
          iterator.parecidos = [];
          iterator.iguales = [indDocumento];

          this.encontradosDoc[indDocumento].ind_igual_presu = iterator.ind;
          this.encontradosDoc[indDocumento].iguales = [iterator.ind];
          this.encontradosDoc[indDocumento].tipoError = 0;
          this.encontradosDoc[indDocumento].parecidos = [];
          this.encontradosDoc[indDocumento].ind_parecido_presu = null;
          this.encontradosDoc[indDocumento].item = iterator.item;
          this.encontradosDoc[indDocumento].descripcion = iterator.descripcion;
        }
      }
      this.mostrar_carga_todo = false;
    } else {
      return;
    }
  }

  async siguientePaso() {
    try {
      if (this.paso < 4) {
        this.mostrar_carga_todo = true;
        if (this.paso == 0) {
          if (!this.encontradosDoc.length) {
            this.mostrar_carga_todo = false;
            this.toaster.error(
              'No existen coincidencias del documento con presupuesto del sistema',
              'Error',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              }
            );
            return;
          }
          this.bloquearAccion = false;
          if (this.tipoComparacion == 1) {
            for (const iterator of this.encontradosDoc) {
              const encontrados = this.encontradosDoc.filter(
                (ele) => ele.item == iterator.item && iterator.ind !== ele.ind
              );
              if (encontrados.length) {
                iterator.repetidos = encontrados;
                iterator.tipoError = 1;
                this.bloquearAccion = true;                
              }
            }
          }
        } else if (this.paso == 1) {
          if (!this.encontradosDoc.length) {
            this.mostrar_carga_todo = false;
            this.toaster.error(
              'Ninguna fila valida en  tabla documento',
              'Error',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
            return;
          }
          let noValidos = false;
          let noSolucionados = false;
          for (const ele of this.encontradosDoc) {
            if (ele.repetidos.length || ele.tipoError == 1) {
              noValidos = true;
              break;
            } else if (ele.parecidos.length || ele.tipoError == 2) {
              noSolucionados = true;
            }
          }
          // const noValidos = await this.encontradosDoc.find(ele => ele.repetidos || ele.tipoError == 1)
          if (noValidos) {
            this.mostrar_carga_todo = false;
            this.toaster.error(
              'Existen items repetidos en el documento, corrija documento',
              'Error',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
            return;
          } else {
            if (noSolucionados) {
              this.mostrar_carga_todo = false;
              var sw = await SwalService.confirm(
                'Advertencia',
                'Existen fila parecidas no solucionadas desea omitir la informacion ligada a estas?'
              );
              if (sw.isConfirmed) {
                // this.paso = 3;
              } else {
                return;
              }
            }
          }
          for (const element of this.tablaEspTit) {
            element.editado = false;
          }
          await this.agregarEspecificacion();
        } else {
        }
        this.sgteStepp();
        this.mostrar_carga_todo = false;
      }
    } catch (e) {
      console.log(e);
      this.mostrar_carga_todo = false;
      SwalService.error(e);
    }
  }

  async regresarPaso() {
    this.paso--;
    if (this.paso == 0) {
      var ele = document.getElementById('containerWord');
      ele.innerHTML = this.htmlDocumento;
    }
  }

  async reemplazarParecido(row) {
    const parecido = this.tablaEspTit[row.ind_parecido_presu];
    row.descripcion = parecido.descripcion;
    row.parecidos = [];
    row.ind_parecido_presu = null;
    row.iguales = [parecido.ind];
    row.ind_igual_presu = parecido.ind;
    row.tipoError = 0;
    this.arregloHtml[row.ind_completo] =
      '<strong> ' +
      parecido.item +
      ' ' +
      parecido.descripcion +
      ' </strong></p>';
    this.tablaEspTit[parecido.ind].iguales = [row.ind];
    this.tablaEspTit[parecido.ind].parecidos = [];
    this.tablaEspTit[parecido.ind].tipoError = 0;
  }

  async solucionMultiple() {
    const sw = await SwalService.confirmCheck2(
      'Estas seguro?',
      'Se reemplazará todas las filas parecidas',
      null,
      'Reemplazar tambien los de descripcion diferente.'
    );
    // console.log('sw', sw)
    // const sw = await SwalService.confirm(
    //   'Estas seguro?',
    //   'Se reemplazara todas las filas parecidas o diferentes con la descripcion de presupuesto'
    // );
    if (sw.isConfirmed) {
      this.mostrar_carga_todo = true;
      let filtrados = [];
      if (sw.value == 1) {
        filtrados = await this.encontradosDoc.filter(
          (ele) => ele.parecidos.length
        );
      } else {
        filtrados = await this.encontradosDoc.filter(
          (ele) => ele.parecidos.length && ele.tipoError == 2
        );
      }
      for (const iterator of filtrados) {
        await this.reemplazarParecido(iterator);
      }
      this.mostrar_carga_todo = false;
    }
  }

  async agregarEspecificacion() {
    let ultimo = null;
    let i = 0;
    for (const iterator of this.tablaEspTit) {
      let especificacion = '';
      if (iterator.iguales?.length) {
        const inicio = this.encontradosDoc[iterator.iguales[0]].ind_completo;
        const indiceTabCom = this.tablaFilasNumericas.findIndex(
          (ele) => inicio == ele.ind_completo
        );
        let sgteFila = null;
        let fin = null;
        if (indiceTabCom + 1 < this.tablaFilasNumericas.length) {
          sgteFila = this.tablaFilasNumericas[indiceTabCom + 1];
          const sgte2 = await this.concantenarEspecificaciones(
            indiceTabCom + 1
          );

          fin = sgte2 == null ? sgteFila.ind_completo : sgte2;
        } else {
          sgteFila = this.tablaFilasNumericas[indiceTabCom];
          fin = sgteFila.ind_completo;
        }
        const cantidad = fin - inicio;
        if (cantidad > 0) {
          for (let i = inicio + 1; i < fin; i++) {
            const element = '<p>' + this.arregloHtml[i];
            especificacion = especificacion + element;
            if (especificacion && (especificacion.includes('<ul>') || especificacion.includes('<li>'))) {
              especificacion = especificacion
              .replace(/(<ul><li>)+/g, '<ul><li>') 
              .replace(/(<\/li><\/ul>)+/g, '</li></ul>');
             }
          }
        } else {
          especificacion = '';
        }
        if (
          this.TipoReemplazo == 1 ||
          (this.TipoReemplazo == 2 &&
            (!this.tablaEspecificaciones[i].tipo_vinc ||
              this.tablaEspecificaciones[i].tipo_vinc == 'PENDIENTE'))
        ) {
          if (especificacion) {
            const array = [
              'IDEM',
              'IDENTICO',
              'PARECIDO',
              'IGUAL',
              'ÍDEM',
              'IDÉNTICO',
            ];
            const texto = especificacion.toUpperCase();
            const contieneElement = (array, texto) => {
              return array.some((element) => texto.includes(element));
            };
            const existe: boolean = contieneElement(array, texto);
            const longitud = texto.length;
            if (existe && longitud < 301) {
              iterator.tipo_vinc = 'DOC/IDEM';
              iterator.editado = true;
            } else {
              iterator.tipo_vinc = 'DOCUMENTO';
              iterator.editado = true;
            }
          } else {
            iterator.tipo_vinc = 'VACIO';
            iterator.editado = true;
          }
        } else {
          iterator.tipo_vinc = 'mantiene';
          especificacion = null;
          iterator.editado = false;
        }
        if (especificacion && (especificacion.includes('<ul>') || especificacion.includes('<li>'))) {
          especificacion = especificacion
          .replace(/(<ul><li>)+/g, '<ul><li>')  // Reemplaza múltiples <ul><li> anidados por uno solo
          .replace(/(<\/li><\/ul>)+/g, '</li></ul>');
         }
        iterator.especificacion = especificacion;
        ultimo = iterator;
      }

      i++;
    }
    if (
      (ultimo.ind == this.tablaEspTit.length - 1 && this.TipoReemplazo == 1) ||
      (this.TipoReemplazo == 2 &&
        (ultimo.tipo_vinc == 'DOCUMENTO' ||
          ultimo.tipo_vinc == 'DOC/IDEM' ||
          ultimo.tipo_vinc == 'VACIO'))
    ) {
      await this.finalUltimaEspec(ultimo);
    }
  }

  async concantenarEspecificaciones(inicio) {
    let fin = null;
    for (let i = inicio; i < this.tablaFilasNumericas.length; i++) {
      const ele = this.tablaFilasNumericas[i];
      if (!ele.iguales.length && !ele.parecidos.length) {
        fin = ele.ind_completo;
      } else {
        fin = ele.ind_completo;
        break;
      }
    }

    return fin;
  }

  async finalUltimaEspec(ultimo) {
    const inicio = this.encontradosDoc[ultimo.iguales[0]].ind_completo;
    let especificacion = '';
    const final =
      this.indiceFinal !== null ? this.indiceFinal : this.arregloHtml.length;
    for (let i = inicio + 1; i < final; i++) {
      const element = '<p>' + this.arregloHtml[i];
      especificacion = especificacion + element;
    }
    let div = document.createElement('div');
    
    div.innerHTML = especificacion;
    let text2 = div.textContent || div.innerText || '';
    if (text2.length > 10000) {
      this.toaster.error(
        'La ultima  partida sobrepasa al limite de caracteres considerados',
        'Advertencia',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 8000,
        }
      );
      this.tablaEspTit[ultimo.ind].especificacion = especificacion;
    } else {
      this.tablaEspTit[ultimo.ind].especificacion = especificacion;
    }
    if (this.tablaEspTit[ultimo.ind].especificacion) {
      const array = ['IDEM', 'IDENTICO', 'PARECIDO', 'IGUAL'];
      const texto = this.tablaEspTit[ultimo.ind].especificacion.toUpperCase();
      const contieneElement = (array, texto) => {
        return array.some((element) => texto.includes(element));
      };
      const existe: boolean = contieneElement(array, texto);
      const longitud = texto.length;
      if (existe && longitud < 301) {
        this.tablaEspTit[ultimo.ind].tipo_vinc = 'DOC/IDEM';
      } else {
        this.tablaEspTit[ultimo.ind].tipo_vinc = 'DOCUMENTO';
      }
      this.tablaEspTit[ultimo.ind].editado = true;
    } else {
      this.tablaEspTit[ultimo.ind].tipo_vinc = 'VACIO';
      this.tablaEspTit[ultimo.ind].editado = true;
    }
  }



  listaindices(row) {
    let lista = [];
    if (row.parecidos.length) {
      for (const iterator of row.parecidos) {
        lista.push(iterator + 1);
      }
    } else {
      for (const iterator of row.iguales) {
        lista.push(iterator + 1);
      }
    }
    return lista.join(',');
  }

  async focusFilaEncontrado(index, row) {
    this.filaSelC = index;
    if (row.parecidos.length) {
      var element = document.getElementById(row.parecidos[0]);
      element.scrollIntoView({ block: 'center' });
      this.arrayPintar = row.parecidos;
    } else {
      if (row.iguales.length) {
        this.arrayPintar = row.iguales;
      } else {
        this.arrayPintar = [];
      }
    }
  }

  sgteStepp() {
    this.stepper.selected.interacted = true;
    this.stepper.selected.completed = false;
    this.stepper.next();
    this.paso = Number(this.stepper.selected.label);
  }

  async accionRegresarBoton() {
    if (this.paso > 0) {
      this.filaSelC = null;
      if (this.paso == 2) {
        var element = document.getElementById('espec_part');
        if (element?.innerHTML) {
          element.innerHTML = null;
        }
        this.filaSelF = null;
        for (const iterator of this.tablaEspTit) {
          if (iterator.tipo_vinc == 'WORD') {
            iterator.especificacion = null;
          }
        }
      }
      this.stepper.selected.interacted = false;
      this.stepper.selected.completed = false;
      this.stepper.previous();
      this.paso = Number(this.stepper.selected.label);
    }
  }

  async verEspecificacion(row, index) {
    this.mostrar_carga_todo3 = true;
    this.filaSelF = index;
    setTimeout(() => {
      var contenedor = document.getElementById('espec_part');
      contenedor.innerHTML = row.especificacion;
      this.mostrar_carga_todo3 = false;
    }, 50);
  }

  async asignarItem(index, row) {
    if (!this.arrayPintar.includes(index)) {
      this.arrayPintar = [];
      this.filaSelC = null;
    }
    if (row.parecidos && !row.item) {
      this.filItemEdit = index;
    }
  }

  async verificarItemValido(value, index) {
    this.filItemEdit = null;
    if (value === this.encontradosDoc[index].item || !value) {
      return;
    }
    const existe = await this.encontradosDoc[index].parecidos.find(
      (ele) => ele.item === value
    );

    if (existe) {
      this.encontradosDoc[index].ind_igual_presu = existe.ind;
      this.encontradosDoc[index].iguales = [existe.ind];
      this.encontradosDoc[index].tipoError = 0;
      this.encontradosDoc[index].parecidos = [];
      this.encontradosDoc[index].ind_parecido_presu = null;
      this.encontradosDoc[index].item = existe.item;
      this.encontradosDoc[index].descripcion = existe.descripcion;
      for (const iterator of this.tablaEspTit[existe.ind].parecidos) {
        const indice = this.encontradosDoc[iterator.ind]?.parecidos?.findIndex(
          (ele) => ele == iterator
        );
        if (indice !== -1) {
          this.encontradosDoc[iterator.ind].parecidos?.splice(indice, 1);
          if (!this.encontradosDoc[iterator.ind]?.parecidos.length) {
            this.encontradosDoc[iterator.ind].tipoError = null;
          }
        }
      }
      this.tablaEspTit[existe.ind].tipoError = 0;
      this.tablaEspTit[existe.ind].parecidos = [];
      this.tablaEspTit[existe.ind].iguales = [index];
      await this.focusFilaEncontrado(existe.ind, existe);
    } else {
    }
  }

  async moverEditar(position, index) {
    let ind = null;
    let valido = false;

    if (position.keyCode.toString() == '38') {
      position.target.blur();
      while (!valido && index > 0) {
        index--;
        if (this.encontradosDoc[index].parecidos.length) {
          valido = true;
          ind = index;
        }
      }
      if (ind !== null) {
        this.filItemEdit = ind;
      }
    } else if (position.keyCode.toString() == '40') {
      position.target.blur();
      while (!valido && index < this.encontradosDoc.length) {
        index++;
        if (this.encontradosDoc[index].parecidos.length) {
          valido = true;
          ind = index;
        }
      }
      if (ind !== null) {
        this.filItemEdit = ind;
      }
    }
  }

  async verificarPlantilla() {
    await this.recuperarPlantilla();
    this.subvista = 2;
  }

  async agregarGeneralidadesReporte() {
    await this.refrescar();
    if (this.tempEspecTecn) {
      this.toaster.error('Guarde o descarte los cambios no almacenados', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return;
    }
    const sw = await SwalService.option3(
      'Desea agregar generalidades?',
      '',
      'AGREGAR',
      'OMITIR'
    );
    if (sw.isConfirmed) {
      this.modalGeneralidades.show();
      setTimeout(() => {
        this.tinymce2.editor.execCommand('mceFocus', false, 'tiny2');
      }, 500);
    } else if (sw.isDenied) {
      await this.generarReporteEspecificacion();
    } else {
      this.htmlGeneralidades = null;
      return;
    }
  }

  async generarReporteEspecificacion() {
    try {
      this.mostrar_carga_todo = true;
      let html1 = this.htmlGeneralidades;
      this.modalGeneralidades.hide();

      let titulo1 = '';
      let titulo2 = 'ESPECIFICACIÓN POR PARTIDA';
      let tabla = [];

      for (const row of this.tablaEspecificaciones) {
        let tipol = '';
        let colorl = '';
        let fondol = '';
        let valor2 = row.item.toString().split('.');
        if (this.titulo1letra != undefined) {
          if (row.unidad != '') {
            colorl = this.titulo1letra[11];
          } else {
            let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
            colorl = this.titulo1letra[ind];
          }
        }
        let espe =
          row.especificacion == null && row.unidad
            ? this.espeTiny.value
            : row.especificacion == null
            ? ''
            : row.especificacion;
        if (this.titulo1 != undefined) {
          if (row.unidad != '') {
            tipol = this.titulo1[11];
            if (row.tipo_vinc == 'IDEM') {
              espe = await this.estructuraIdem(row);
            } else {
              if (
                (row.especificacion == null && row.tipo_vinc == 'PENDIENTE') ||
                row.tipo_vinc == null
              ) {
                espe = await this.estructurarEspecTecnicas(row, true);
              } else {
                espe = row.especificacion;
              }

              // espe == null && row.unidad
              //   ? this.espeTiny.value
              //   : row.especificacion == null
              //   ? ''
              //   : row.especificacion;
            }
          } else {
            let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
            tipol = this.titulo1[ind];
          }
        }
        let esp = ' ';
        let descp = esp.repeat(valor2.length - 1) + row.descripcion;
        tabla.push({
          item: row.item,
          descripcion: descp,
          unidad: row.unidad,
          tipoletra: tipol,
          color: colorl == 'unset' ? '' : colorl,
          fondo: fondol,
          especificacion: espe == null ? '' : espe,
        });
      }
      titulo1 = 'ESPECIFICACIÓN TÉCNICA GENERAL';
      const datos = {
        datos_proyecto: this.datosproy,
        header: [],
        keys_body: [],
        col_alig: [],
        tabla: tabla,
        concat_tabla2: false,
        tipo_reporte: 4,
        orientacion: '',
        moneda: this.simbolo,
        titulo: titulo1,
        html: html1,
        titulo2: titulo2,
      };
      this.mostrar_carga_todo = false;
      const modalRef = this.modalService.open(ReportesComponent, {
        size: 'lg modalgrande',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.datos = datos;
      const result = await modalRef.result;
      if (this.rowSeleccionado) {
        const c = JSON.parse(JSON.stringify(this.rowSeleccionado.ind));
        this.rowSeleccionado = null;
        await this.clickFila(this.tablaEspecProy[c]);
      }
    } catch (e) {
      console.log(e);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  async guardarImportar() {
    try {
      this.mostrar_carga_todo = true;
      const guardar = await this.tablaEspTit.filter((ele) => ele.editado);
      if (!guardar.length) {
        this.toaster.info('Ninguna cambio para guardar', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        this.mostrar_carga_todo = false;
        return;
      }
      const sw = await SwalService.confirm(
        'Esta seguro?',
        'Se guardaran todo los cambios realizados'
      );

      if (sw.isConfirmed) {
        for (const iterator of this.tablaEspTit) {
          if (
            iterator.tipo_vinc == 'DOCUMENTO' ||
            iterator.tipo_vinc == 'VACIO' ||
            iterator.tipo_vinc == 'DOC/IDEM'
          ) {
            if (iterator.vinculo_part) {
              await this.eliminarVinculos(iterator);
              iterator.tipo_vinc = 'MANUAL';
            }
            let partida = await this.tablaEspecProy.find(
              (ele) => iterator.indice == ele.indice
            );
            this.tablaEspecProy[Number(partida.ind)].especificacion =
              iterator.especificacion;
            this.tablaEspecProy[Number(partida.ind)].tipo_vinc =
              iterator.tipo_vinc == 'DOCUMENTO' ? 'DOCUMENTO' : 'MANUAL';

            this.tablaEspecProy[Number(partida.ind)].plantilla = null;
            this.tablaEspecProy[Number(partida.ind)].editado = true;
            this.tablaEspecProy[Number(partida.ind)].color_vincpart = null;
            this.tablaEspecProy[Number(partida.ind)].itemvinculo = null;
            this.tablaEspecProy[Number(partida.ind)].vinculo_part = null;
            let porc = null;
            if (
              this.tablaEspecProy[Number(partida.ind)].especificacion &&
              this.tablaEspecProy[Number(partida.ind)].tipo_vinc == 'MANUAL'
            ) {
              porc = await this.contarCaracteresEspecTec(
                this.tablaEspecProy[Number(partida.ind)].especificacion
              );
            }
            this.tablaEspecProy[Number(partida.ind)].porcentaje = porc;
            this.tablaEspecProy[Number(partida.ind)].porcentaje2 = null;
            this.tablaEspecProy[Number(partida.ind)].vinculo = null;
            this.tablaEspecProy[Number(partida.ind)].vinculo_esp = null;
            this.tablaEspecProy[Number(partida.ind)].vinculo_espproy = null;
            this.tablaEspecProy[Number(partida.ind)].vinculo_fuente = null;
            this.tablaEspecProy[Number(partida.ind)].vinculo_part = null;
          }
        }
        const cortar = await this.apiGuardar();
        if (cortar) {
          this.mostrar_carga_todo = false;
          return;
        }
        this.modalWord.hide();
        this.cerrarModal();
      } else {
      }
      this.mostrar_carga_todo = false;
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error();
    }
  }

  async eliminarVinculos(partida) {
    const encontrados = this.tablaEspecProy.filter(
      (ele) => ele.vinculo_part == partida.indice && partida.editable
    );
    if (encontrados.length) {
      for (const row of encontrados) {
        this.tablaEspecProy[row.ind].vinculo_part = null;
        this.tablaEspecProy[row.ind].editado = true;
        this.tablaEspecProy[row.ind].color_vincpart = null;
        this.tablaEspecProy[row.ind].itemvinculo = null;
        this.tablaEspecProy[row.ind].tipo_vinc = null;
      }
    }
  }

  async AgregaInsumosEsp(
    rowSeleccionado?,
    especificacionTexto?,
    asignar = true
  ) {
    if (!rowSeleccionado) {
      rowSeleccionado = this.rowSeleccionado;
    }
    if (!especificacionTexto) {
      especificacionTexto = this.espeTiny.value;
    }
    if (rowSeleccionado && rowSeleccionado.unidad) {
      let tiposText = [];
      const i = this.plantillaBase?.findIndex(
        (ele) => ele.informacion === 'INSUMOS'
      );
      let titulo = '';
      if (i !== -1) {
        tiposText = this.plantillaBase[i].detalle
          ? JSON.parse(this.plantillaBase[i].detalle)
          : [
              'MANO DE OBRA',
              'MATERIALES',
              'EQUIPO',
              'SUB CONTRATOS',
              'SUBPARTIDAS',
            ];
        const text = this.plantillaBase[i - 1].selecciona
          ? this.plantillaBase[i - 1].detalle
          : 'DETALLE INSUMOS';
        titulo =
          '<p><strong id="' +
          'insumo' +
          '" style="padding-left: 40px; text-decoration: underline;">' +
          text +
          '</strong></p>';
      } else {
        titulo =
          '<p><strong id="' +
          'insumo' +
          '" style="padding-left: 40px; text-decoration: underline;">' +
          'DETALLE INSUMOS' +
          '</strong></p>';
      }
      if (rowSeleccionado.especificacion !== null) {
        if (
          rowSeleccionado.tipo_vinc !== 'IDEM' &&
          rowSeleccionado.tipo_vinc !== 'PENDIENTE' &&
          rowSeleccionado.tipo_vinc !== null
        ) {
          const tabla = await this.recuperarCostoUnitarioPartida(
            rowSeleccionado.indice,
            true
          );
          const contenido = await this.recuperarInsumosMEtYEqui(
            tiposText,
            rowSeleccionado,
            tabla
          );
          let arr = rowSeleccionado.especificacion
            .split('<p>')
            .join('|||||')
            .split('|||||');
          const indice = arr.findIndex((ele) => ele.includes('id="insumo"'));
          if (indice !== -1) {
            const a = arr[indice].replace('</p>', '||');
            let arr2 = a.split('||');
            const textoReemplazo = arr2[0] + contenido;
            arr[indice] = textoReemplazo;
            especificacionTexto = arr.join('<p>');
          } else {
            especificacionTexto = especificacionTexto + titulo + contenido;
          }
          if (asignar) {
            this.espeTiny.setValue(especificacionTexto);
          }
        } else {
        }
      } else {
        this.toaster.info('Insumos ya actualizados', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        // const tabla = await this.recuperarCostoUnitarioPartida(
        //   rowSeleccionado.indice,
        //   true
        // );
        // const contenido = await this.recuperarInsumosMEtYEqui(
        //   tiposText,
        //   rowSeleccionado,
        //   tabla
        // );
        // especificacionTexto = titulo + contenido;
        // if (asignar) {
        //   this.espeTiny.setValue(especificacionTexto);
        // }
      }
    }
    if (!asignar) {
      return especificacionTexto;
    }
  }

  async agregarInsumosTitulo() {
    try {
      await this.refrescar();
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se modificaran las partidas diferente a tipo vinculo "IDEM" y  "PENDIENTE" '
      );
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const tiposText = [
          'MANO DE OBRA',
          'MATERIALES',
          'EQUIPO',
          'SUB CONTRATOS',
          'SUBPARTIDAS',
        ];
        let guardarTemp = false;
        let modificados = [];
        for (const element of this.tablaEspecificaciones) {
          if (element.unidad) {
            const tabla = await this.recuperarCostoUnitarioPartida(
              element.indice,
              true
            );
            const contenido = await this.recuperarInsumosMEtYEqui(
              tiposText,
              element,
              tabla
            );
            if (
              element.tipo_vinc !== 'PENDIENTE' &&
              element.tipo_vinc !== null &&
              element.tipo_vinc !== 'IDEM'
            ) {
              const response = await this.AgregaInsumosEsp(
                element,
                element.especificacion,
                false
              );
              element.especificacion = response;
              element.editado = true;
              guardarTemp = true;
              if (element.indice == element.vinculo_part) {
                const grupoVinculo = await this.tablaEspecProy.filter(
                  (ele) =>
                    ele.vinculo_part == element.vinculo_part &&
                    ele.indice !== element.indice
                );
                for (const iterator of grupoVinculo) {
                  if (iterator.editable) {
                    iterator.especificacion = element.especificacion;
                    iterator.editado = true;
                    if (
                      iterator.item.split('.')[0] ==
                      this.tablaEspecificaciones[0]
                    ) {
                      const obj = {
                        indice: element.indice,
                        fecha: moment(this.today).format(),
                        id_usuario: this.id_user,
                        nombres: this.NombreUsuario,
                      };
                      this.tablaEspecificaciones[0].ultimoMod = obj;
                    }
                    modificados.push(iterator);
                  }
                }
              }
              modificados.push(element);
            } else {
            }
          }
        }
        if (modificados.length) {
          await this.guardarmodificados(modificados);
        }

        this.mostrar_carga_todo = false;
        this.toaster.success('Se realizó correctamente', 'Éxito', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      SwalService.error(e);
    }
  }

  async eliminarEspecificacion() {
    const sw = await SwalService.confirm(
      'esta seguro?',
      'Se descartará la especificacion de todas las filas con vinculo DOC/IDEM'
    );
    if (sw.isConfirmed) {
      this.mostrar_carga_todo = true;
      for (const element of this.tablaEspTit) {
        if (element.tipo_vinc == 'DOC/IDEM') {
          element.especificacion_borrada = JSON.parse(
            JSON.stringify(element.especificacion)
          );
          element.tipo_vinc = 'VACIO';
        }
      }
      var contenedor = document.getElementById('espec_part');
      contenedor.innerHTML = this.tablaEspTit[this.filaSelF].especificacion;
      this.mostrar_carga_todo = false;
    }
  }

  async agregarEspecificacionEliminada() {
    const sw = await SwalService.confirm(
      'esta seguro?',
      'Se reestaurará las especificaciones de las partidas descartadas'
    );
    if (sw.isConfirmed) {
      this.mostrar_carga_todo = true;
      for (const element of this.tablaEspTit) {
        if (element?.tipo_vinc == 'VACIO' && element?.especificacion_borrada) {
          element.tipo_vinc = 'DOC/IDEM';
          element.especificacion = element.especificacion_borrada;
          element.especificacion_borrada = null;
        }
      }
      var contenedor = document.getElementById('espec_part');
      contenedor.innerHTML = this.tablaEspTit[this.filaSelF].especificacion;
      this.mostrar_carga_todo = false;
    }
  }

  async limpiartitulo(titulo) {
    try {
      if (this.tempEspecTecn) {
        this.toaster.info('Guarde o descarte los cambios no almacenados', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      }
      let text1 = '';
      let text2 = '';
      if (titulo) {
        text1 = 'Esta seguro que desea reiniciar  el titulo seleccionado?';
        text2 =
          'Se eliminará todas las especificaciones de cada partida y título , se eliminará algun vinculo de otros titulos relacionados';
      } else {
        text1 =
          'Esta seguro que desea reiniciar todo el proyecto seleccionado?';
        text2 = 'Se eliminará todas las especificaciones del proyecto';
      }
      const respu = await SwalService.confirmCheck(text1, text2);
      if (respu.isConfirmed) {
        this.mostrar_carga_todo = true;
        const obj = {
          id_proyecto: this.id_proyecto,
          item: titulo ? titulo.item : '',
          indice: titulo.indice,
          eliplanti: 0,
        };
        const response =
          await this.especificacionesTecnicasService.reiniciarEspec(obj);
        if (response.id == '1') {
          await this.eliminarIdemsAlTitulo(titulo);

          this.tablaEspTit = [];
          this.tablaEspecProy = [];
          this.listaTitulos = [];
          this.rowSeleccionado = null;
          this.infoTitulo = null;
          this.tablaEspecificaciones = [];
          await this.listarTitulos(true);
          this.mostrar_carga_todo = false;
          this.toaster.success('Se restauró correctamente.', 'Correcto', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 7000,
          });
        } else {
          this.mostrar_carga_todo = false;
          SwalService.error(response.mensaje);
        }
      }
    } catch (e) {
      SwalService.error(e);
      console.log(e);
      this.mostrar_carga_todo = false;
    }
  }

  async eliminarIdemsAlTitulo(titulo) {
    let modificados = [];
    const tabla = await this.tablaTitulo(
      this.tablaEspecProy,
      titulo.item,
      titulo.ind
    );
    const arrIndIdems = tabla.map((ele) => {
      return ele.indice;
    });
    for (const element of tabla) {
      const encontrados = await this.tablaEspecProy.filter(
        (ele) =>
          !arrIndIdems.includes(ele.indice) &&
          ele.editable &&
          ele.vinculo_part == element.indice &&
          ele.indice !== ele.vinculo_part
      );
      if (encontrados.length > 1) {
        const indicePadre = encontrados[0].indice;
        let i = 0;
        for (const ele of encontrados) {
          if (i == 0) {
            ele.tipo_vinc = 'MANUAL';
            let porc = 0;
            if (ele.especificacion) {
              porc = await this.contarCaracteresEspecTec(ele.especificacion);
            }
            ele.porcentaje = porc;
          } else {
            ele.tipo_vinc = 'IDEM';
            ele.itemvinculo = encontrados[0].item;
          }
          ele.vinculo_part = indicePadre;

          modificados.push(ele);

          i++;
        }
      } else {
        for (const ele of encontrados) {
          ele.vinculo_part = null;
          ele.tipo_vinc = 'MANUAL';
          ele.color_vincpart = null;
          let porc = 0;
          if (ele.especificacion) {
            porc = await this.contarCaracteresEspecTec(ele.especificacion);
          }
          ele.porcentaje = porc;
          modificados.push(ele);
        }
      }
    }
    if (modificados.length) {
      const noGuardado = await this.guardar2(modificados);
      // if (noGuardado) {
      //   this.toaster.error(
      //     'No se pudo guardar, cambios almacenandose en presupuesto intente guardar en un momento',
      //     'Adevertencia',
      //     {
      //       closeButton: false,
      //       positionClass: 'toast-bottom-right',
      //       timeOut: 7000,
      //     }
      //   );
      //   return;
      // } else {

      // }
    }
  }

  bloqueadoTodo() {
    let margin = false;
    const existe = this.listaTitulos.find((ele) => ele.editable);
    if (existe) {
      margin = true;
    }
    return margin;
  }

  async guardarmodificados(tabla) {
    const datos1 = JSON.stringify(tabla);
    const obj = JSON.stringify({
      id_proyecto: this.idProyecto,
      datos1: datos1,
    });
    const response =
      await this.especificacionesTecnicasService.guardarCambiosEspec(obj);
    if (response.id == '1') {
      this.mostrar_carga_todo = false;
      this.toaster.success('Se almaceno correctamente', 'Éxito', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    } else if (response.id == '2') {
      this.mostrar_carga_todo = false;
      this.toaster.warning(
        'No se pudo guardar, se estan almacenando cambios en presupuesto, intentenlo en un momento',
        'Advertencia',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 7000,
        }
      );
    } else {
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  async copiarEspecSelec() {
    // if (!this.multiple) {
    if (
      this.rowSeleccionado &&
      this.rowSeleccionado?.unidad &&
      this.rowSeleccionado?.tipo_vinc !== 'IDEM' &&
      this.rowSeleccionado?.tipo_vinc !== 'PENDIENTE' &&
      this.rowSeleccionado?.tipo_vinc !== null
    ) {
      this.especCopiada = this.rowSeleccionado.especificacion;
      this.toaster.info('Copiado', null, {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
    } else {
      let msj = '';
      if (!this.rowSeleccionado) {
        msj = 'Ninguna partida seleccionada';
      } else if (!this.rowSeleccionado?.unidad) {
        msj = 'Titulos no permitidos para esta accion';
      } else if (this.rowSeleccionado?.tipo_vinc == 'IDEM') {
        msj = 'No permitido partidas con tipo vinculo IDEM';
      } else {
        msj = 'Fila Seleccionada no valida';
      }
      this.toaster.error(msj, null, {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
      return;
    }
    // } else {

    // }
  }

  async pegarEspecCopiada() {
    if (this.especCopiada == null) {
      this.toaster.error('Ninguna especificación copiada', null, {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
      return;
    }
    this.mostrar_carga_todo = true;
    let seleccionados = [];
    let iniciar = false;
    if (this.multiple) {
      seleccionados = await this.tablaEspecificaciones.filter(
        (ele) => ele.selectMult
      );
      if (seleccionados.length) {
      } else {
        this.mostrar_carga_todo = false;
        this.toaster.error('Ninguna fila seleccionada', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      }
    } else {
      if (this.rowSeleccionado) {
        seleccionados.push(this.rowSeleccionado);
        iniciar = true;
      } else {
        this.mostrar_carga_todo = false;
        this.toaster.error('Ninguna fila seleccionada', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 3000,
        });
        return;
      }
    }
    let modificados = [];
    for (const element of seleccionados) {
      element.especificacion = this.especCopiada;
      element.tipo_vinc = 'MANUAL';
      element.color_vincpart = null;
      let porc = 0;
      if (element.especificacion) {
        porc = await this.contarCaracteresEspecTec(element.especificacion);
      }
      element.porcentaje = porc;
      if (element.indice == element.vinculo_part) {
        const grupoVinculo = await this.tablaEspecProy.filter(
          (ele) =>
            ele.vinculo_part == element.vinculo_part &&
            ele.indice !== element.indice
        );
        for (const iterator of grupoVinculo) {
          if (iterator.editable) {
            iterator.especificacion = element.especificacion;
            if (iterator.item.split('.')[0] == this.tablaEspecificaciones[0]) {
              const obj = {
                indice: element.indice,
                fecha: moment(this.today).format(),
                id_usuario: this.id_user,
                nombres: this.NombreUsuario,
              };
              this.tablaEspecificaciones[0].ultimoMod = obj;
            }
            modificados.push(iterator);
          }
        }
      }
      element.selectMult = false;
      modificados.push(element);
    }
    await this.guardarmodificados(modificados);
    if (iniciar) {
      const c = JSON.parse(JSON.stringify(this.rowSeleccionado.ind));
      this.rowSeleccionado = null;
      await this.clickFila(this.tablaEspecProy[c]);
    } else {
      this.rowSeleccionado = null;
      this.vista = 0;
      this.tab = 0;
    }
    this.multiple = false;
    this.mostrar_carga_todo = false;
  }
  //imagenes drive
  async openImgDrive(){
    const imgTagCount = (this.espeTiny.value.match(/<img/g) || []).length;
    if(imgTagCount>=5){
      this.toaster.error('No se puede agregar mas de 5 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const modalRef = this.modalService.open(AddImgUrlComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
    const result = await modalRef.result
    if (result) {
      const element = document.getElementById("tiny");
      var ancholim=element.offsetWidth-90;
      //ancho img
      let ancho=255;
      let alto=255;
      let valido=true;
      await this.getImageDimensions(result)
      .then(dimensions => {
        ancho=dimensions.width
        alto=dimensions.height
      })
      .catch(error => {
        valido=false
        this.toaster.error('No se puedo cargar la imagen.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      });
      if(!valido){return}
      //alto img 
      let propor=1;
      let nanch=ancho;
      let nalt=alto;
      if(ancho>ancholim){
        propor=Number((ancho/alto).toFixed(3));
        nanch=ancho>alto?ancholim:Number((ancholim*propor).toFixed(3));
        nalt=ancho>alto?Number(Math.trunc(ancholim/propor).toFixed(3)):ancholim;
      }
      const text = '<img src="' + result + '" width="'+nanch+'" height="'+nalt+'"/>'
      this.tinymce.editor.execCommand('mceInsertContent', false, text);
    }
  }
  getImageDimensions(base64Image: string): Promise<{ width: number, height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        resolve({ width, height });
      };
      img.onerror = reject;
      img.src = base64Image;
    });
  }
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    if (clipboardData) {
      const types = clipboardData.types;
      if (types.includes("text/html")) {
        const htmlData = clipboardData.getData("text/html");
        if (htmlData.includes("<img")) {
          this.toaster.error('No puedes pegar imágenes directamente. Usa la opción de insertar imagen.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
          event.preventDefault();
        }
      }
    }
  }
}
