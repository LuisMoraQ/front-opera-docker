import {
  AfterContentChecked,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { FormulaPolinomicaService } from 'src/app/servicios/formula-polinomica.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalCantidadEdicionFpComponent } from './modal-cantidad-edicion-fp/modal-cantidad-edicion-fp.component';
import { UntypedFormGroup } from '@angular/forms';
import { ReportesComponent } from '../../reportes/reportes.component';
import html2canvas from 'html2canvas';
export interface insumoModel {
  ind: number;
  mostrar: number;
  icomost: number;
  descripcion: string;
  unidad: string;
  cantidad: string;
  precio: string;
  parcial: string;
  id_tipo_insumo: number;
  fuente: number;
  desc_indice: string;
  id_indice: string;
  sel_mult: boolean;
  nuevo_indice: any;
  operador: any;
  ind2: number;
}

export interface agrupamientoModel {
  desc_indice: string;
  id_indice: string;
  ind: number;
  indice_inicial: number;
  indice_modificado: number;
  acumulado: number;
  menor5: number;
  seleccion: boolean;
  agrupamiento: string;
  vinculo: string;
  montos: string;
  simbolo: string;
  indice: number;
  mostrar: number;
  icomost: number;
  considerar: number;
  tipo: string;
}

export interface tituloFP {
  ind: number;
  item: string;
  indice: number;
  descripcion: string;
  parcial: number;
  itemfp: string;
  seleccion: number;
  vinculo: number;
  monto_gru: number;
  itformula: string;
  denominacion: string;
  estado: number;
  vinculados_arr: string;
  agrupamiento: string;
  agrup_items: string;
  editar_denominacion: number;
  form_polinomica: string;
  arr_fp: string;
  modificado: boolean;
  modificado_descripcion: boolean;
  tablas: tablaAgrup;
  cambios: boolean;
  actualizado: boolean;
  tablaCI: any;
  tablaCI_titulo: any;
  ci_total: number;
  total_costos: number;
}

export interface cambiosAlterados {
  diferentes: Array<any>;
  eliminadoGuardado: Array<any>;
  noAgregado: Array<any>;
  tablaAgrup: Array<agrupamientoModel>;
  tablaMonom: Array<monomio>;
  tablaAgrupCorregida: Array<agrupamientoModel>;
  tablaMonomCorregida: Array<monomio>;
  sumaIndMod: any;
  sumaFactores: any;
}

export interface monomio {
  monomio: string;
  simbolo: string;
  ind: number;
  id_indice: string;
  desc_indice: string;
  factor: string;
  factor_inicial: string;
  acumulado: string;
  seleccion: boolean;
  agrupamiento: string;
  vinculo: string;
  editar_monomio: number;
  editar_simbolo: number;
  indice: number;
  considerar: number;
  tipo: string;
}

export interface tablaAgrup {
  indice: number;
  tablaAgrupamiento: Array<agrupamientoModel>;
  sumaIndMod: any;
  sumaFactor: any;
  tablaMonomio: Array<monomio>;
}

export interface valorFP {
  coeficiente: string;
  variacion_iu: string;
  monomio: string;
}

@Component({
  selector: 'app-formula-polinomica',
  templateUrl: './formula-polinomica.component.html',
  styleUrls: ['./formula-polinomica.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormulaPolinomicaComponent implements OnInit, AfterContentChecked {
  @Input() idProyecto = null;
  mostrar_carga_todo = false;
  mostrar_carga_todo2 = false;
  vista = 1;
  titulos: tituloFP[] = [];
  tituloSlider: any = null;
  buscando = false;
  buscando2 = false;
  grupoEdicion = -1;
  tabSeleccionado: any = 1;
  listaInsumos = [];
  listaIndicesUnificados = [];
  displayBasic2: boolean;
  indUniSeleccionado = null;
  agrupamientoSeleccionado = null;
  listaAgrupamiento: agrupamientoModel[] = [];
  listaEstructuraModificada = [];
  subvista: number = 1;
  titEstructSelect = null;
  tituloSeleccionado: tituloFP = null;
  titulosEstructurados = [];
  filtradosTitulos: any[] = [];
  monomioSeleccionado = null;

  dec_metrado = 2;
  mask_metrado = '0.2';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  dec_cant = 2;
  mask_cant = '0.2';
  buscando3: boolean = false;
  buscando4: boolean = false;
  agrupPrelMonomios: monomio[] = [];
  sumaFactor: string = '0.000';
  sumaIndMod: string = '0.000';
  agrupValido: number = 0;
  formulaPolinomicaInicial: string = '';
  formulaPolinomicaDefinida: string = '';
  arrayFP: valorFP[] = [];
  arrayFPInicial = [];
  iduser: any;
  disabAcciones: boolean = false;
  tablasInsXProy: any;
  bloquearEdicion: boolean = false;
  titulosActualizado: boolean = false;
  existTempCI = false;
  cambiosAgruCD = false;
  cambiosAgruCI = false;
  tablaMonomioValido: boolean = false;
  w_agrup = 120;
  tipoProy = null;
  colores;
  decima;
  solover;
  moneda;
  simbolo
  titulosFiltrados: tituloFP[] = [];
  existeTempFP = false;
  datosproy = null;
  totalCDProy: number;
  @Input() set tabproyecto(value: any) {
    this.idProyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    this.iduser = this.encriptadorService.recuperarlocalstory('idusuario');//datosrec.value.id_usuario;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    this.simbolo=datosrec.value.simbolo
  }
  constructor(
    private toaster: ToastrService,
    private encriptadorService: EncriptadorService,
    public formulaPolinomicaService: FormulaPolinomicaService,
    private presuservice: PresupuestosService,
    private modalService: NgbModal,
    private principalService: PrincipalService,
    public formService: FormsService,
    public configuracionService: ConfiguracionService
  ) {}

  async ngAfterContentChecked() {
    this.actualizarTamañoCeldaTotal();
  }

  async ngOnInit() {
    this.mostrar_carga_todo2 = true;
    await this.datosProyec();
    await this.recuperarTempIndirecto();
    await this.permisosUsuario();
    await this.verificarCambiosPresupuesto();
    await this.listarIndicesUnificados();
    await this.tablaInsumos();
    await this.evaluarDataIniFP();
    this.mostrar_carga_todo2 = false;
  }

  async permisosUsuario() {
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({
      id_proyecto: this.idProyecto,
      id_usuario: this.iduser,
    });
    if (datoaccs.length) {
      if (!datoaccs[0]?.formu) {
        this.solover = true;
      }
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

  async recuperarTempIndirecto() {
    const obj = { id_proyecto: this.idProyecto, id_usuario: '' };//
    let presutemp = await this.presuservice.ListarIndirectoTemp(obj);
    this.existTempCI = presutemp.length ? true : false;
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async listarPresupuesto() {
    let res = await this.presuservice.ListarPresupuestoProy({
      id_proyecto: this.idProyecto,
    });
    if (res) {
      this.tablasInsXProy = res;
    }
  }

  async openModalPrincipal() {
    try {
      this.subvista = 1;
      let titulos = [];
      await this.listarPresupuesto();
      this.listaInsumos = await this.listaInsumos.map((ele, index) => {
        ele.ind = index;
        ele.ind2 = index;
        return ele;
      });
      const modalRef = this.modalService.open(ModalCantidadEdicionFpComponent, {
        size: 'xl',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.listaInsumos = this.listaInsumos;
      modalRef.componentInstance.idProyecto = this.idProyecto;
      modalRef.componentInstance.listaIndicesUnificados =
        this.listaIndicesUnificados;
      modalRef.componentInstance.disabAcciones = this.disabAcciones;
      modalRef.componentInstance.tablasInsXProy = this.tablasInsXProy;
      modalRef.componentInstance.moneda = this.simbolo;
      modalRef.componentInstance.datosproy = this.datosproy;
      modalRef.componentInstance.solover =
        this.solover || this.existTempCI ? true : false;
      const result = await modalRef.result;
      if (result.actualizar) {
        this.mostrar_carga_todo2 = true;
        // this.listaInsumos = result.insumos;
        await this.eliminarTemporal();
        await this.reiniciarValores();
        // await this.recuperarTempIndirecto();
        // await this.verificarCambiosPresupuesto();
        await this.listarIndicesUnificados();
        await this.tablaInsumos();
        await this.evaluarDataIniFP();
        this.mostrar_carga_todo2 = false;
      }
    } catch (e) {}
  }

  async listarTemporal() {
    try {
      const obj = {
        id_proyecto: this.idProyecto,
        id_usuario: this.iduser,
      };
      const response =
        await this.formulaPolinomicaService.listarCambiosTemporalesFormulaPolinomica(
          obj
        );
      const nuevo = response ? JSON.parse(response.datatemp) : null;
      return nuevo;
    } catch (error) {
      SwalService.error(error);
    }
  }

  async guardarTemporal() {
    try {
      if (this.solover) {
        return
      }
      const datatemp = JSON.stringify(this.titulos);
      const obj = {
        id_proyecto: this.idProyecto,
        id_usuario: this.iduser,
        datatemp: datatemp,
      };
      const response =
        await this.formulaPolinomicaService.guardarCambiosTemporalesFormulaPolinomica(
          obj
        );
      this.titulosActualizado = false;
      this.existeTempFP = true;
    } catch (error) {
      SwalService.error(error);
    }
  }

  async eliminarTemporal() {
    try {
      const obj = {
        id_proyecto: this.idProyecto,
        id_usuario: this.iduser,
      };
      const response =
        await this.formulaPolinomicaService.eliminarCambiosTemporalesFormulaPolinomica(
          obj
        );
      this.existeTempFP = false;
    } catch (error) {
      SwalService.error(error);
    }
  }

  async listarIndicesUnificados() {
    try {
      this.listaIndicesUnificados = [];
      this.listaIndicesUnificados =
        await this.configuracionService.listarIndiceUnificados();
    } catch (e) {
      SwalService.error();
    }
  }

  async cambioTitulo(event) {
    const tit = await this.titulos.find((ele) => ele.indice == event);
    await this.cambioVista(2, tit);
  }

  async tablaInsumos() {
    const response = await this.listarInsumosXProyecto();
    await this.crearTablaInsumos(response);
  }

  async listarInsumosXProyecto() {
    const obj = {
      id_proyecto: this.idProyecto,
    };
    const response = await this.principalService.relacionInsumosProy(obj);
    return response;
  }

  async relacionInsumosProy(datasourcePri, datasourcePriacu, datasourcePrisub) {
    let tabacu = JSON.parse(JSON.stringify(datasourcePriacu));
    let tabsub = JSON.parse(JSON.stringify(datasourcePrisub));
    let tabresult = [];

    for (let b = 0; b < tabacu.length; b++) {
      let rowpart;
      for (let fipart of datasourcePri) {
        if (tabacu[b].indice == fipart.indice) {
          rowpart = fipart;
          break;
        }
      }
      if (tabacu[b].esinsumo == 0 && tabacu[b].num_det > 0) {
        /* let cantpasa = Number(rowpart.cantidad) * Number(tabacu[b].cantidad); */
        let cantpasa = Number(tabacu[b].cantidad);
        /* sumatot +=  */ this.cargaInsumoSubp(
          tabresult,
          cantpasa,
          Number(rowpart.cantidad),
          tabacu[b].indice_subp,
          tabsub
        );
      } else if (tabacu[b].esinsumo != 0) {
        const index = tabresult.findIndex((elem) => {
          if (elem.operador != '%') {
            if (
              elem.id_tipo_insumo === tabacu[b].id_tipo_insumo &&
              elem.descripcion == tabacu[b].descripcion &&
              elem.precio == tabacu[b].precio
            )
              return elem;
          } else {
            if (
              elem.id_tipo_insumo === tabacu[b].id_tipo_insumo &&
              elem.descripcion == tabacu[b].descripcion
            )
              return elem;
          }
        });
        if (index > -1) {
          if (tabresult[index].unidad != '') {
            if (tabacu[b].operador == '%') {
              let rparc = this.formService.redondeo(
                Number(tabresult[index].parcial) +
                  Number(rowpart.cantidad) * Number(tabacu[b].parcial),
                this.dec_parcial
              );
              tabresult[index].parcial = this.formService.redondeo(
                Number(rparc),
                this.dec_parcial
              );
            } else {
              let ropera = this.formService.redondeo(
                Number(tabresult[index].parcial) +
                  Number(rowpart.cantidad) * Number(tabacu[b].parcial),
                this.dec_parcial
              );
              tabresult[index].parcial = ropera;
              tabresult[index].cantidad =
                tabacu[b].unidad != ''
                  ? this.formService.redondeo(
                      Number(tabresult[index].parcial) /
                        Number(tabresult[index].precio),
                      this.dec_cant
                    )
                  : tabresult[index].cantidad;
            }
            // tabresult[index].cantidad = tabacu[b].unidad!=''?Number(tabresult[index].cantidad) + Number(rowpart.cantidad) * Number(tabacu[b].cantidad) : tabresult[index].cantidad;
            // sumatot += Number(rowpart.cantidad) * Number(tabacu[b].parcial);
          }
          //tabresult[index].parcial = Number(tabresult[index].parcial) + Number(rowpart.cantidad) * Number(tabacu[b].parcial);
        } else {
          // tabacu[b].cantidad = tabacu[b].unidad != '' ? Number(rowpart.cantidad) * Number(tabacu[b].cantidad) : tabacu[b].cantidad;
          // tabacu[b].parcial = Number(rowpart.cantidad) * Number(tabacu[b].parcial);
          //sumatot += tabacu[b].unidad != '' ? Number(tabacu[b].parcial) : 0;
          if (tabacu[b].operador == '%') {
            tabacu[b].cantidad = 0;
            tabacu[b].precio = 0;
            tabacu[b].parcial = this.formService.redondeo(
              Number(rowpart.cantidad) * Number(tabacu[b].parcial),
              this.dec_parcial
            );
          } else {
            let rparc = this.formService.redondeo(
              Number(rowpart.cantidad) * Number(tabacu[b].parcial),
              this.dec_parcial
            );
            tabacu[b].parcial = this.formService.redondeo(
              Number(rparc),
              this.dec_parcial
            );
            let ropera = this.formService.redondeo(
              Number(tabacu[b].parcial) / Number(tabacu[b].precio),
              this.dec_cant
            );
            tabacu[b].cantidad =
              tabacu[b].unidad != '' ? Number(ropera) : tabacu[b].cantidad;
          }
          tabresult.push(JSON.parse(JSON.stringify(tabacu[b])));
          tabresult[tabresult.length - 1].num_det =
            tabresult[tabresult.length - 1].num_det > 0
              ? 1
              : tabresult[tabresult.length - 1].num_det;
          tabresult[tabresult.length - 1].cuadrilla = '';
        }
      }
    }
    if (tabresult.length > 0) {
      //parciales agru
      let summano = 0;
      let summat = 0;
      let sumeq = 0;
      let sumsubc = 0;
      let sumsubp = 0;
      let spsummano = 0;
      let spsummat = 0;
      let spsumeq = 0;
      let spsumsubc = 0;
      //calcular sumas, luego agregar agrupaciones 1 sola vez
      for (let m = 0; m < tabresult.length; m++) {
        if (tabresult[m].unidad != '') {
          if (tabresult[m].id_tipo_insumo == '1') {
            summano += Number(tabresult[m].parcial);
            if (tabresult[m].operador != '%') {
              spsummano += Number(tabresult[m].parcial);
            }
          } else if (tabresult[m].id_tipo_insumo == '2') {
            summat += Number(tabresult[m].parcial);
            if (tabresult[m].operador != '%') {
              spsummat += Number(tabresult[m].parcial);
            }
          } else if (tabresult[m].id_tipo_insumo == '3') {
            sumeq += Number(tabresult[m].parcial);
            if (tabresult[m].operador != '%') {
              spsumeq += Number(tabresult[m].parcial);
            }
          } else if (tabresult[m].id_tipo_insumo == '4') {
            sumsubc += Number(tabresult[m].parcial);
            if (tabresult[m].operador != '%') {
              spsumsubc += Number(tabresult[m].parcial);
            }
          } else if (tabresult[m].id_tipo_insumo == '5') {
            sumsubp += Number(tabresult[m].parcial);
          }
        }
      }
      //agregar filas agrupaciones
      tabresult.push({
        abrev: null,
        cantidad: null,
        cuadrilla: null,
        desc_indice: null,
        descripcion: 'MANO DE OBRA',
        esinsumo: 1,
        fuente: 0,
        icomost: 1,
        id_filadetalle: null,
        id_indice: null,
        id_insumo: null,
        id_proyecto: this.idProyecto,
        id_subpartida: null,
        id_tipo_insumo: 1,
        id_unidad: '',
        indice: null,
        indice_subp: null,
        mostrar: 1,
        num_det: 0,
        operador: null,
        parcial: summano,
        precio: null,
        tipo: 'CD',
        tipo_insumo: null,
        unidad: '',
      });
      tabresult.push({
        abrev: null,
        cantidad: null,
        cuadrilla: null,
        desc_indice: null,
        descripcion: 'MATERIALES',
        esinsumo: 1,
        fuente: 0,
        icomost: 1,
        id_filadetalle: null,
        id_indice: null,
        id_insumo: null,
        id_proyecto: this.idProyecto,
        id_subpartida: null,
        id_tipo_insumo: 2,
        id_unidad: '',
        indice: null,
        indice_subp: null,
        mostrar: 1,
        num_det: 0,
        operador: null,
        parcial: summat,
        precio: null,
        tipo: 'CD',
        tipo_insumo: null,
        unidad: '',
      });
      tabresult.push({
        abrev: null,
        cantidad: null,
        cuadrilla: null,
        desc_indice: null,
        descripcion: 'EQUIPO',
        esinsumo: 1,
        fuente: 0,
        icomost: 1,
        id_filadetalle: null,
        id_indice: null,
        id_insumo: null,
        id_proyecto: this.idProyecto,
        id_subpartida: null,
        id_tipo_insumo: 3,
        id_unidad: '',
        indice: null,
        indice_subp: null,
        mostrar: 1,
        num_det: 0,
        operador: null,
        parcial: sumeq,
        precio: null,
        tipo: 'CD',
        tipo_insumo: null,
        unidad: '',
      });
      tabresult.push({
        abrev: null,
        cantidad: null,
        cuadrilla: null,
        desc_indice: null,
        descripcion: 'SUB CONTRATOS',
        esinsumo: 1,
        fuente: 0,
        icomost: 1,
        id_filadetalle: null,
        id_indice: null,
        id_insumo: null,
        id_proyecto: this.idProyecto,
        id_subpartida: null,
        id_tipo_insumo: 4,
        id_unidad: '',
        indice: null,
        indice_subp: null,
        mostrar: 1,
        num_det: 0,
        operador: null,
        parcial: sumsubc,
        precio: null,
        tipo: 'CD',
        tipo_insumo: null,
        unidad: '',
      });
      tabresult.push({
        abrev: null,
        cantidad: null,
        cuadrilla: null,
        desc_indice: null,
        descripcion: 'SUB PARTIDAS',
        esinsumo: 0,
        fuente: 0,
        icomost: 1,
        id_filadetalle: null,
        id_indice: null,
        id_insumo: null,
        id_proyecto: this.idProyecto,
        id_subpartida: null,
        id_tipo_insumo: 5,
        id_unidad: '',
        indice: null,
        indice_subp: null,
        mostrar: 1,
        num_det: 0,
        operador: null,
        parcial: sumsubp,
        precio: null,
        tipo: 'CD',
        tipo_insumo: null,
        unidad: '',
      });

      tabresult.sort((a, b) => {
        if (a.id_tipo_insumo < b.id_tipo_insumo) {
          return -1;
        }
        if (a.id_tipo_insumo > b.id_tipo_insumo) {
          return 1;
        }
        if (a.num_det < b.num_det) {
          return -1;
        }
        if (a.num_det > b.num_det) {
          return 1;
        }
        if (a.descripcion < b.descripcion) {
          return -1;
        }
        if (a.descripcion > b.descripcion) {
          return 1;
        }
        return 0;
      });
      /* let ndet = 1;
      for (let row of tabresult) {
        // row.parcial = Number(this.formService.redondeo(Number(row.parcial), 5));
        if (row.num_det == 0) {
          ndet = 1;
        } else {
          row.num_det = ndet++;
        }
        if(row.operador=="%"){
          row.precio = row.tipo_insumo == '1' ? summano : row.tipo_insumo == '2' ? summat : row.tipo_insumo == '3' ? sumeq : row.tipo_insumo == '4' ? sumsubc : '';
          let precfil=Number(row.precio);
          let parcial=Number(row.parcial);
          row.cantidad = row.precio == 0 || row.parcial == 0 ? 0 : this.formService.redondeo(parcial / precfil, this.dec_metrado);
        }
      } */
      for (let row of tabresult) {
        if (row.operador == '%') {
          row.precio =
            row.tipo_insumo == '1'
              ? spsummano
              : row.tipo_insumo == '2'
              ? spsummat
              : row.tipo_insumo == '3'
              ? spsumeq
              : row.tipo_insumo == '4'
              ? spsumsubc
              : '';
          let precfil = Number(row.precio);
          let parcial = Number(row.parcial);
          row.cantidad =
            row.precio == 0 || row.parcial == 0
              ? 0
              : this.formService.redondeo(parcial / precfil, this.dec_cant);
        }
      }
    }
    return tabresult;
  }

  cargaInsumoSubp(
    tabresult: any,
    cant_padre: any,
    cant_part: any,
    indice_padre: any,
    tabsub: any
  ) {
    //let sumasub = 0;
    for (let b = 0; b < tabsub.length; b++) {
      if (tabsub[b].indice == indice_padre) {
        if (tabsub[b].esinsumo == 0 && tabsub[b].num_det > 0) {
          let cantpasa = cant_padre * Number(tabsub[b].cantidad);
          /* sumasub +=  */ this.cargaInsumoSubp(
            tabresult,
            cantpasa,
            cant_part,
            tabsub[b].indice_subp,
            tabsub
          );
        } else if (tabsub[b].esinsumo != 0) {
          const index = tabresult.findIndex((elem) => {
            if (elem.operador != '%') {
              if (
                elem.id_tipo_insumo === tabsub[b].id_tipo_insumo &&
                elem.descripcion == tabsub[b].descripcion &&
                elem.precio == tabsub[b].precio
              )
                return elem;
            } else {
              if (
                elem.id_tipo_insumo === tabsub[b].id_tipo_insumo &&
                elem.descripcion == tabsub[b].descripcion
              )
                return elem;
            }
          });
          if (index > -1) {
            if (tabresult[index].unidad != '') {
              if (tabsub[b].operador == '%') {
                let calcval = this.formService.redondeo(
                  cant_padre * Number(tabsub[b].parcial),
                  this.dec_parcial + 1
                );
                let parctot = this.formService.redondeo(
                  Number(calcval) * cant_part,
                  this.dec_parcial
                );
                tabresult[index].parcial = this.formService.redondeo(
                  Number(tabresult[index].parcial) + Number(parctot),
                  this.dec_parcial
                );
              } else {
                let calcval = this.formService.redondeo(
                  cant_padre * Number(tabsub[b].parcial),
                  this.dec_parcial + 1
                );
                let parctot = this.formService.redondeo(
                  Number(calcval) * cant_part,
                  this.dec_parcial
                );
                tabresult[index].parcial = this.formService.redondeo(
                  Number(tabresult[index].parcial) + Number(parctot),
                  this.dec_parcial
                );
                if (tabresult[index].unidad != '') {
                  let ropera = this.formService.redondeo(
                    Number(tabresult[index].parcial) /
                      Number(tabresult[index].precio),
                    this.dec_cant
                  );
                  tabresult[index].cantidad =
                    tabsub[b].unidad != ''
                      ? Number(ropera)
                      : tabresult[index].cantidad;
                }
              }
              // tabresult[index].cantidad = tabsub[b].unidad != '' ? Number(tabresult[index].cantidad) + Number(cant_padre) * Number(tabsub[b].cantidad) : tabresult[index].cantidad;
              // sumasub += Number(cant_padre) * Number(tabsub[b].parcial);
            }
            // tabresult[index].parcial = Number(tabresult[index].parcial) + Number(cant_padre) * Number(tabsub[b].parcial);
          } else {
            if (tabsub[b].operador == '%') {
              let calcval = this.formService.redondeo(
                cant_padre * Number(tabsub[b].parcial),
                this.dec_parcial + 1
              );
              let parctot = this.formService.redondeo(
                Number(calcval) * cant_part,
                this.dec_parcial
              );
              tabsub[b].parcial = parctot;
            } else {
              let calcval = this.formService.redondeo(
                cant_padre * Number(tabsub[b].parcial),
                this.dec_parcial + 1
              );
              let parctot = this.formService.redondeo(
                Number(calcval) * cant_part,
                this.dec_parcial
              );
              tabsub[b].parcial = parctot;
              let ropera = this.formService.redondeo(
                Number(parctot) / Number(tabsub[b].precio),
                this.dec_cant
              );
              tabsub[b].cantidad =
                tabsub[b].unidad != '' ? Number(ropera) : tabsub[b].cantidad;
            }
            //sumasub+=(tabsub[b].unidad!=''?Number(tabsub[b].parcial):0);
            tabresult.push(tabsub[b]);
            tabresult[tabresult.length - 1].num_det =
              tabresult[tabresult.length - 1].num_det > 0
                ? 1
                : tabresult[tabresult.length - 1].num_det;
            tabresult[tabresult.length - 1].cuadrilla = '';

            // tabsub[b].cantidad = tabsub[b].unidad != '' ? Number(cant_padre) * Number(tabsub[b].cantidad) : tabsub[b].cantidad;
            // tabsub[b].parcial = Number(cant_padre) * Number(tabsub[b].parcial);
            // sumasub += tabsub[b].unidad != '' ? Number(tabsub[b].parcial) : 0;
            // tabresult.push(tabsub[b]);
            // tabresult[tabresult.length - 1].num_det = tabresult[tabresult.length - 1].num_det > 0 ? 1 : tabresult[tabresult.length - 1].num_det;
            // tabresult[tabresult.length - 1].cuadrilla = '';
          }
        }
      }
    }
    // return sumasub;
  }

  async crearTablaInsumos(tablaInsumos) {
    let summano = 0;
    let summat = 0;
    let sumeq = 0;
    let sumsubc = 0;
    let sumsubp = 0;
    //calcular sumas, luego agregar agrupaciones 1 sola vez
    for (let m = 0; m < tablaInsumos.length; m++) {
      if (tablaInsumos[m].unidad != '') {
        if (tablaInsumos[m].id_tipo_insumo == '1') {
          summano += Number(tablaInsumos[m].parcial);
        } else if (tablaInsumos[m].id_tipo_insumo == '2') {
          summat += Number(tablaInsumos[m].parcial);
        } else if (tablaInsumos[m].id_tipo_insumo == '3') {
          sumeq += Number(tablaInsumos[m].parcial);
        } else if (tablaInsumos[m].id_tipo_insumo == '4') {
          sumsubc += Number(tablaInsumos[m].parcial);
        } else if (tablaInsumos[m].id_tipo_insumo == '5') {
          sumsubp += Number(tablaInsumos[m].parcial);
        }
      }
    }
    //pindice: any, pdescripcion: any, pid_tipo_insumo: any, pparcial: any, pesinsumo: any, pafcuad: any
    //let filamano=this.CrearFilaAgru(pindice,'MANO DE OBRA','1',summano,1,1);
    tablaInsumos.push({
      id_tipo_insumo: 1,
      descripcion: 'MANO DE OBRA',
      parcial: summano,
      esinsumo: 1,
      icomost: 1,
      mostrar: 1,
      num_det: 0,
      unidad: '',
      cantidad: null,
      precio: null,
    });
    //filamano=this.CrearFilaAgru(pindice,'MATERIALES','2',summat,1,0);
    tablaInsumos.push({
      id_tipo_insumo: 2,
      descripcion: 'MATERIALES',
      parcial: summat,
      esinsumo: 1,
      icomost: 1,
      mostrar: 1,
      num_det: 0,
      unidad: '',
      cantidad: null,
      precio: null,
    });
    //filamano=this.CrearFilaAgru(pindice,'EQUIPO','3',sumeq,1,1);
    tablaInsumos.push({
      id_tipo_insumo: 3,
      descripcion: 'EQUIPO',
      parcial: sumeq,
      esinsumo: 1,
      icomost: 1,
      mostrar: 1,
      num_det: 0,
      unidad: '',
      cantidad: null,
      precio: null,
    });
    //filamano=this.CrearFilaAgru(pindice,'SUB CONTRATOS','4',sumsubc,1,0);
    tablaInsumos.push({
      id_tipo_insumo: 4,
      descripcion: 'SUB CONTRATOS',
      parcial: sumsubc,
      esinsumo: 1,
      icomost: 1,
      mostrar: 1,
      num_det: 0,
      unidad: '',
      cantidad: null,
      precio: null,
    });
    //filamano=this.CrearFilaAgru(pindice,'SUB PARTIDAS','5',sumsubp,0,0);
    tablaInsumos.push({
      id_tipo_insumo: 5,
      descripcion: 'SUB PARTIDAS',
      parcial: sumsubp,
      esinsumo: 0,
      icomost: 1,
      mostrar: 1,
      num_det: 0,
      unidad: '',
      cantidad: null,
      precio: null,
    });
    tablaInsumos.sort((a, b) => {
      if (a.id_tipo_insumo < b.id_tipo_insumo) {
        return -1;
      }
      if (a.id_tipo_insumo > b.id_tipo_insumo) {
        return 1;
      }
      if (a.num_det < b.num_det) {
        return -1;
      }
      if (a.num_det > b.num_det) {
        return 1;
      }
      if (a.descripcion < b.descripcion) {
        return -1;
      }
      if (a.descripcion > b.descripcion) {
        return 1;
      }
      return 0;
    });

    let i = 0;
    let nuevaStructura: insumoModel[] = [];
    for (let row of tablaInsumos) {
      const obj: insumoModel = {
        cantidad: this.formService.redondeo(row.cantidad, 3),
        descripcion: row.descripcion,
        fuente: row.fuente,
        icomost: row.icomost,
        id_tipo_insumo: row.id_tipo_insumo,
        ind: i,
        mostrar: row.mostrar,
        nuevo_indice: null,
        parcial: this.formService.redondeo(row.parcial, this.dec_parcial),
        precio: this.formService.redondeo(row.precio, this.dec_parcial),
        sel_mult: false,
        unidad: row.unidad,
        desc_indice: row.desc_indice,
        id_indice: row.id_indice,
        operador: row.operador,
        ind2: i,
      };
      nuevaStructura.push(obj);
      i++;
    }
    this.listaInsumos = nuevaStructura;
    this.listaInsumos = await this.listaInsumos.map((ele, index) => {
      ele.ind = index;
      return ele;
    });
  }

  async tablaActualizada(
    titulosPresu2: tituloFP[],
    titulosGuardados: tituloFP[]
  ) {
    var titulosPresu = JSON.parse(JSON.stringify(titulosPresu2));
    let nuevoElementos = [];
    let diferentes = [];
    let eliminados = [];
    let tablaCorrecta = [];
    let estado = null;
    for await (const iterator of titulosPresu) {
      const nuevo = await titulosGuardados.find(
        (ele) => ele.indice == iterator.indice
      );
      const diferente = await titulosGuardados.find(
        (ele) =>
          ele.indice == iterator.indice && ele.parcial !== iterator.parcial
      );
      if (diferente) {
        diferentes.push(iterator);
      }
      if (!nuevo) {
        nuevoElementos.push(iterator);
      }
    }
    for await (const iterator of titulosGuardados) {
      const eliminado = await titulosPresu.find(
        (ele) => ele.indice == iterator.indice
      );
      if (!eliminado) {
        eliminados.push(iterator);
      }
    }
    if (!nuevoElementos.length && !diferentes.length && !eliminados.length) {
      tablaCorrecta = titulosGuardados;
      this.titulosActualizado = false;
    } else {
      if (nuevoElementos.length) {
        this.titulosActualizado = true;
        for (const iterator of nuevoElementos) {
          const index = await this.moverFila(
            titulosGuardados,
            iterator.item,
            true
          );
          iterator.agrup_items = JSON.stringify([iterator.itemfp]);
          iterator.agrupamiento = JSON.stringify([iterator.itemfp]);
          iterator.denominacion = iterator.descripcion;
          iterator.itformula =
            'FP' + (iterator.ind + 1 < 10 ? '0' : '') + (iterator.ind + 1);
          iterator.monto_gru = JSON.parse(JSON.stringify(iterator.parcial));
          iterator.vinculados_arr = JSON.stringify([iterator.indice]);
          iterator.modificado = true;
          iterator.actualizado = false;
          titulosGuardados.splice(index, 0, iterator);
        }
      }
      if (diferentes.length) {
        this.titulosActualizado = true;
        for (const row of diferentes) {
          const encontrado: tituloFP = await titulosGuardados.find(
            (ele) => ele.indice == row.indice
          );
          if (encontrado) {
            encontrado.parcial = row.parcial;
            encontrado.modificado = true;
            encontrado.actualizado = false;
            encontrado.item = row.item;
            encontrado.itemfp = row.itemfp;
          }
        }
      }
      let nuevo = [];
      if (eliminados.length) {
        this.titulosActualizado = true;
        for (const iterator2 of titulosGuardados) {
          const existe = await eliminados.find(
            (ele) => ele.indice == iterator2.indice
          );
          if (!existe) {
            nuevo.push(iterator2);
          }
        }
      }
      this.titulosActualizado = true;
      tablaCorrecta = nuevo.length ? nuevo : titulosGuardados;
    }
    for (let iterator of tablaCorrecta) {
      let arrayVinculos = JSON.parse(iterator.vinculados_arr);
      let arrayCorrecto = [iterator.indice];
      let arrayAgrupItems = [iterator.item];
      let arrayAgrupFP = [iterator.itemfp];
      let monto_gru = iterator.parcial;
      if (arrayVinculos.length > 1) {
        for (const element of arrayVinculos) {
          if (element !== iterator.indice) {
            const existe = await tablaCorrecta.find(
              (ele) => ele.indice == element
            );
            if (existe) {
              arrayCorrecto.push(existe.indice);
              arrayAgrupItems.push(existe.item);
              arrayAgrupFP.push(existe.itemfp);
              monto_gru = monto_gru + existe.parcial;
              tablaCorrecta[existe.ind].vinculo =
                iterator.indice + '+' + iterator.tipo;
            } else {
              iterator.arr_fp = null;
              iterator.form_polinomica = null;
              iterator.modificado = true;
              iterator.actualizado = false;
            }
          }
        }
      }
      iterator.monto_gru = Number(this.formService.redondeo(monto_gru, 3));
      iterator.agrup_items = JSON.stringify(arrayAgrupItems);
      iterator.agrupamiento = JSON.stringify(arrayAgrupFP);
      iterator.vinculados_arr = JSON.stringify(arrayCorrecto);
    }
    return tablaCorrecta;
  }

  longitudTit(agrupamiento) {
    const longitud = JSON.parse(agrupamiento).length;
    return longitud;
  }

  joinTit(agrupamiento) {
    const string = JSON.parse(agrupamiento).join('+');
    return string;
  }

  joinAgrup(agrupamiento) {
    const arreglo = JSON.parse(agrupamiento);
    let nuevo = [];
    for (const iterator of arreglo) {
      if (!nuevo.includes(iterator)) {
        nuevo.push(iterator);
      }
    }
    return nuevo.join('+');
  }

  async cambioSeleccion(event, indice) {
    this.titulos[indice].seleccion = event ? 1 : 0;
    if (event) {
      this.tituloSlider = this.titulos[indice];
      let i = 0;
      for (let titulo of this.titulos) {
        if (i !== indice) {
          titulo.seleccion = 0;
        }
        i++;
      }
    } else {
      this.tituloSlider = null;
    }
  }

  async cambioVinculo(event, idx) {
    if (event) {
      const indEnc = await this.titulos.map((p) => p.seleccion).indexOf(1);
      this.titulos[idx].vinculo = this.titulos[indEnc].indice;
      var array = JSON.parse(this.titulos[indEnc].agrupamiento);
      var array2 = JSON.parse(this.titulos[indEnc].agrup_items);
      var array3 = JSON.parse(this.titulos[indEnc].vinculados_arr);
      if (!array.includes(this.titulos[idx].itemfp)) {
        array.push(this.titulos[idx].itemfp);
        array2.push(this.titulos[idx].item);
        array3.push(this.titulos[idx].indice);
        this.titulos[indEnc].agrupamiento = JSON.stringify(array);
        this.titulos[indEnc].agrup_items = JSON.stringify(array2);
        this.titulos[indEnc].vinculados_arr = JSON.stringify(array3);
        this.titulos[indEnc].monto_gru =
          this.titulos[indEnc].monto_gru + this.titulos[idx].total_costos;
        this.titulos[indEnc].form_polinomica = '';
        this.titulos[indEnc].arr_fp = null;
        this.titulos[indEnc].modificado = true;
        this.titulos[indEnc].tablas = null;
        this.titulos[indEnc].tablaCI = null;
        this.titulos[indEnc].cambios = true;
        this.titulos[indEnc].estado = 0;
        const objeto = JSON.parse(JSON.stringify(this.titulos[idx]));
        this.titulos.splice(idx, 1);
        const index = await this.moverFila(this.titulos, indEnc, false);
        objeto.modificado = true;
        objeto.tablas = null;
        objeto.tablaCI = null;
        objeto.cambios = true;
        objeto.estado = 0;
        objeto.arr_fp = null;
        objeto.form_polinomica = null;
        if (index == null) {
          this.titulos.push(objeto);
        } else {
          this.titulos.splice(index, 0, objeto);
        }
      }
    } else {
      const enc = await this.titulos.find(
        (ele) => ele.indice == this.titulos[idx].vinculo
      );
      this.titulos[enc.ind].monto_gru =
        this.titulos[enc.ind].monto_gru - this.titulos[idx].total_costos;
      var array = JSON.parse(this.titulos[enc.ind].agrupamiento);
      var array2 = JSON.parse(this.titulos[enc.ind].agrup_items);
      var array3 = JSON.parse(this.titulos[enc.ind].vinculados_arr);
      const ind = array.indexOf(this.titulos[idx].itemfp);
      array.splice(ind, 1);
      array2.splice(ind, 1);
      array3.splice(ind, 1);
      this.titulos[idx].vinculo = null;
      this.titulos[enc.ind].agrupamiento = JSON.stringify(array);
      this.titulos[enc.ind].agrup_items = JSON.stringify(array2);
      this.titulos[enc.ind].vinculados_arr = JSON.stringify(array3);
      this.titulos[enc.ind].modificado = true;
      this.titulos[enc.ind].tablas = null;
      this.titulos[enc.ind].tablaCI = null;
      this.titulos[enc.ind].cambios = true;
      this.titulos[enc.ind].arr_fp = null;
      this.titulos[enc.ind].estado = 0;
      const objeto = JSON.parse(JSON.stringify(this.titulos[idx]));
      objeto.modificado = true;
      objeto.tablas = null;
      objeto.tablaCI = null;
      objeto.cambios = true;
      objeto.arr_fp = null;
      objeto.form_polinomica = null;
      objeto.estado = 0;
      this.titulos.splice(idx, 1);
      const index = await this.moverFila(this.titulos, objeto.item, true);
      this.titulos.splice(index, 0, objeto);
    }
    this.titulos = await this.titulos.map((ele, index) => {
      ele.ind = index;
      return ele;
    });
    this.guardarTemporal();
    await this.filtroTitulos();
  }

  async moverFila(tabla, idx, regresar) {
    let indiceIndexar;
    if (!regresar) {
      const indEnc = await tabla.map((ele) => ele.seleccion).indexOf(1);
      indiceIndexar = null;
      for (let i = indEnc + 1; i < tabla.length; i++) {
        if (!tabla[i].vinculo) {
          indiceIndexar = i;
          break;
        }
      }
    } else {
      indiceIndexar = tabla.length;
      for (let i = tabla.length - 1; i >= 0; i--) {
        const itemNumero = parseInt(tabla[i].item);
        const itemNumeroSelect = parseInt(idx);
        if (itemNumero < itemNumeroSelect && !tabla[i].vinculo) {
          break;
        } else if (itemNumero > itemNumeroSelect && !tabla[i].vinculo) {
          indiceIndexar = i;
        }
      }
    }
    return indiceIndexar;
  }

  async blurDenominacion(event, i) {
    if (this.titulos[i].denominacion !== event.target.value.toUpperCase()) {
      this.titulos[i].modificado_descripcion = true;
      this.titulos[i].denominacion = event.target.value.toUpperCase();
      this.titulos[i].editar_denominacion = 0;
      await this.guardarTemporal();
    } else {
      this.titulos[i].editar_denominacion = 0;
    }
  }

  async editarDenominacion(i) {
    if (!this.disabAcciones && !this.solover && !this.existTempCI) {
      this.titulos[i].editar_denominacion = 1;
    }
  }

  async listarTablaIUxTitAlmacenado(indice) {
    const obj = {
      id_proyecto: this.idProyecto,
      indice: indice,
    };
    const response =
      await this.formulaPolinomicaService.listarTablaIUxTitAlmacenado(obj);
    return response;
  }

  async listarAlmacenadosMonomio(indice) {
    const obj = {
      id_proyecto: this.idProyecto,
      indice: indice,
    };
    const response =
      await this.formulaPolinomicaService.listarTablaMonomioxTitAlmacenado(obj);
    return response;
  }

  // async formatoTablaAgrup(titulo) {
  //   try {
  //     const stringTitulos = JSON.parse(titulo.agrup_items).join('.|') + '.';
  //     const obj = {
  //       id_proyecto: this.idProyecto,
  //       titulos: stringTitulos,
  //     };
  //     const response = await this.formulaPolinomicaService.listarRelacionInsumosXTipoTitulo(obj);
  //     const tablaResult = await this.relacionInsumosProy(response[0], response[1], response[2]);
  //     let arrayAgrupamiento = [];
  //     let totalTitulosAgrupados = titulo.monto_gru;
  //     let i = 0;
  //     let montoCostInd = 0
  //     const tablaCostoIndirecto = await this.tablaCostoIndirecto(stringTitulos)
  //     for (const row of tablaResult) {
  //       if (row.unidad) {
  //         const obj: agrupamientoModel = {
  //           desc_indice: row.desc_indice,
  //           id_indice: row.id_indice,
  //           ind: i,
  //           indice_inicial: 0,
  //           indice_modificado: 0,
  //           acumulado: row.parcial,
  //           menor5: 0,
  //           seleccion: false,
  //           agrupamiento: JSON.stringify([row.id_indice]),
  //           vinculo: null,
  //           montos: JSON.stringify([row.parcial]),
  //           simbolo: null,
  //           indice: titulo.indice,
  //           mostrar: 1,
  //           icomost: 1,
  //           considerar: 1,
  //           tipo: row.tipo
  //         };
  //         const existe = await arrayAgrupamiento.find(
  //           (ele) => ele.id_indice == obj.id_indice
  //         );
  //         if (!existe) {
  //           arrayAgrupamiento.push(obj);
  //           i++;
  //         } else {
  //           arrayAgrupamiento[existe.ind].acumulado =
  //             arrayAgrupamiento[existe.ind].acumulado + row.parcial;
  //           var array = JSON.parse(arrayAgrupamiento[existe.ind].montos);
  //           array.push(Number(this.formService.redondeo(row.parcial, 3)));
  //           arrayAgrupamiento[existe.ind].montos = JSON.stringify(array);
  //         }
  //       }
  //     }
  //     let sumaIndMod = 0;

  //     for (const fila of tablaCostoIndirecto) {
  //       const existeTablAgrup = arrayAgrupamiento.find(ele => ele.id_indice == fila.id_indice && fila.tipo == ele.tipo)
  //       if (!existeTablAgrup) {
  //         totalTitulosAgrupados = totalTitulosAgrupados + fila.monto
  //         const agregar = {
  //           desc_indice: fila.desc_indice,
  //           id_indice: fila.id_indice,
  //           ind: i,
  //           indice_inicial: 0,
  //           indice_modificado: 0,
  //           acumulado: fila.monto,
  //           menor5: 0,
  //           seleccion: false,
  //           agrupamiento: JSON.stringify([fila.id_indice]),
  //           vinculo: null,
  //           montos: JSON.stringify([fila.monto]),
  //           simbolo: null,
  //           indice: titulo.indice,
  //           mostrar: 1,
  //           icomost: 1,
  //           considerar: 1,
  //           tipo: fila.tipo
  //         }
  //         arrayAgrupamiento.push(agregar)
  //       } else {
  //         existeTablAgrup.acumulado = fila.monto
  //       }
  //     }

  //     for (const row of arrayAgrupamiento) {
  //       const porcentaje = (100 * row.acumulado) / totalTitulosAgrupados;
  //       sumaIndMod = sumaIndMod + (isNaN(porcentaje) ? 0 : porcentaje);
  //       row.indice_modificado = Number(
  //         this.formService.redondeo(isNaN(porcentaje) ? 0 : porcentaje, 3)
  //       );
  //       row.indice_inicial = Number(
  //         this.formService.redondeo(isNaN(porcentaje) ? 0 : porcentaje, 3)
  //       );
  //       row.menor5 = porcentaje < 5 ? 1 : 0;
  //     }
  //     arrayAgrupamiento.sort(function (a, b) {
  //       if (a.indice_inicial > b.indice_inicial) return -1;
  //       if (a.indice_inicial < b.indice_inicial) return 1;
  //     });
  //     arrayAgrupamiento = await arrayAgrupamiento.map((ele, index) => {
  //       ele.ind = index;
  //       return ele;
  //     });
  //     const dat = {
  //       tabla: arrayAgrupamiento,
  //       sumaIndMod: this.formService.redondeo(sumaIndMod, 3),
  //     };
  //     return dat;
  //   } catch (error) {

  //     this.buscando3 = false;
  //   }
  // }

  // async tablaCostoIndirecto(string) {
  //   let tabla = []
  //   const obj = {
  //     id_proyecto: this.idProyecto,
  //     titulos: string,
  //   };
  //   const response = await this.formulaPolinomicaService.listarCostoIndFormula(obj);

  //   if (response.length) {
  //     tabla = response
  //   }
  //   return tabla
  // }

  async formatoTablaMonomio(
    titulo,
    listaAgrupamiento,
    cambioManual = false,
    num
  ) {
    let anterior: monomio[] = [];
    if (cambioManual) {
      anterior = JSON.parse(JSON.stringify(this.agrupPrelMonomios));
    }
    const filtrados = await listaAgrupamiento.filter(
      (ele) => !ele.menor5 && !ele.vinculo
    );
    let sumaFactor = 0;
    let preMonomios = [];
    let ind = 0;
    for (let row of filtrados) {
      const factor = this.formService.redondeo(row.indice_modificado / 100, 5);
      const acumulado = this.formService.redondeo(100, 2);
      const obj: monomio = {
        monomio: '',
        simbolo: row.desc_indice.trim().charAt(0),
        ind: ind,
        id_indice: row.id_indice,
        desc_indice: row.desc_indice,
        factor: factor,
        factor_inicial: JSON.parse(JSON.stringify(factor)),
        acumulado: acumulado,
        seleccion: false,
        agrupamiento: JSON.stringify([row.id_indice]),
        vinculo: null,
        editar_monomio: 0,
        indice: titulo.indice,
        editar_simbolo: 0,
        considerar: 1,
        tipo: row.tipo,
      };
      preMonomios.push(obj);
      ind++;
      sumaFactor = sumaFactor + row.indice_modificado;
    }
    const agrupPrelMonomios = preMonomios.length ? preMonomios : [];
    const sumaFactor1 = this.formService.redondeo(sumaFactor / 100, 5);
    if (cambioManual) {
      for (let iterator of agrupPrelMonomios) {
        const existe = await anterior.find(
          (ele: monomio) =>
            ele.id_indice == iterator.id_indice && ele.tipo == iterator.tipo
        );
        if (!existe) {
          anterior[iterator.ind] = iterator;
        } else {
          anterior[existe.ind].factor_inicial = iterator.factor_inicial;
          // if (!anterior[existe.ind].vinculo) {
          //   anterior[existe.ind].factor = iterator.factor_inicial
          // }
        }
      }
      let ind = 0;
      let arrayNuevo = [];

      for (let ele of anterior) {
        const existe = await agrupPrelMonomios.find(
          (data) => data.id_indice == ele.id_indice
        );
        if (existe) {
          ele.ind = ind;
          arrayNuevo.push(ele);
          ind++;
        }
      }
      anterior = arrayNuevo;
    }

    const data = {
      tabla: anterior.length ? anterior : agrupPrelMonomios,
      sumaFactor:
        Number(sumaFactor1) > 0.99
          ? this.formService.redondeo(1, 5)
          : sumaFactor1,
    };
    return data;
  }

  // async restructuraTablas(row) {
  //   let data;
  //   let estructurado2;
  //   let estructurado3;
  //   estructurado2 = await this.formatoTablaAgrup(row);
  //   const tablaAgrupa = estructurado2.tabla;
  //   estructurado3 = await this.formatoTablaMonomio(row, tablaAgrupa, null, 3);
  //   data = {
  //     indice: row.indice,
  //     tablaAgrupamiento: tablaAgrupa,
  //     sumaIndMod: estructurado2.sumaIndMod,
  //     tablaMonomio: estructurado3.tabla,
  //     sumaFactor: estructurado3.sumaFactor,
  //   };
  //   return data;
  // }

  async verificarAgrupCumple(listaAgrupamiento) {
    let agrupValido;
    const menores = await listaAgrupamiento.filter(
      (ele) => ele.menor5 && !ele.vinculo
    );
    const cantAgrupa = await listaAgrupamiento.filter(
      (ele) => !ele.menor5 && !ele.vinculo
    );
    if (!menores.length) {
      agrupValido = 1;
    } else {
      agrupValido = 0;
    }
    return agrupValido;
  }

  async cambioSeleccionAgrupamiento(event, idx) {
    this.listaAgrupamiento[idx].seleccion = event;
    if (event) {
      this.agrupamientoSeleccionado = this.listaAgrupamiento[idx];
      let i = 0;
      for (let agrupamiento of this.listaAgrupamiento) {
        if (i !== idx) {
          agrupamiento.seleccion = false;
        }
        i++;
      }
    } else {
      this.agrupamientoSeleccionado = null;
    }
    this.monomioSeleccionado = null;
  }

  async cambioVinculoAgru(checked, idx) {
    if (checked) {
      const indEnc = await this.listaAgrupamiento
        .map((p) => p.seleccion)
        .indexOf(true);
      const indiceAGrupar = JSON.parse(
        JSON.stringify(this.listaAgrupamiento[indEnc].id_indice)
      );
      if (
        Number(this.listaAgrupamiento[indEnc].indice_modificado) <
        Number(this.listaAgrupamiento[idx].indice_modificado)
      ) {
        this.toaster.warning(
          'Se esta vinculado a uno de mayor a menor indice',
          'Alerta',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      }
      this.listaAgrupamiento[idx].vinculo = JSON.parse(
        JSON.stringify(
          this.agrupamientoSeleccionado.id_indice +
            '+' +
            this.agrupamientoSeleccionado.tipo
        )
      );

      var array = JSON.parse(this.listaAgrupamiento[indEnc].agrupamiento);
      const agruSelect = JSON.parse(this.listaAgrupamiento[idx].agrupamiento);
      let arrayParaMover = [];
      if (agruSelect.length > 1) {
        for (let i = 0; i < agruSelect.length; i++) {
          arrayParaMover.push(
            JSON.parse(JSON.stringify(this.listaAgrupamiento[idx + i]))
          );
        }
      } else if (agruSelect.length == 1) {
        arrayParaMover.push(
          JSON.parse(JSON.stringify(this.listaAgrupamiento[idx]))
        );
      }
      this.listaAgrupamiento.splice(idx, arrayParaMover.length);
      const index = await this.moverfilaAgrupIU(
        this.listaAgrupamiento,
        idx,
        false
      );
      arrayParaMover.reverse();
      let sumaindices = 0;
      let arrayconcat = [];
      for (let i = 0; i < arrayParaMover.length; i++) {
        this.listaAgrupamiento.splice(index, 0, arrayParaMover[i]);
        arrayParaMover[i].vinculo =
          indiceAGrupar + '+' + this.agrupamientoSeleccionado.tipo;
        arrayParaMover[i].indice_modificado = arrayParaMover[i].indice_inicial;
        arrayParaMover[i].agrupamiento = JSON.stringify([
          this.listaAgrupamiento[i].id_indice,
        ]);
        sumaindices = sumaindices + arrayParaMover[i].indice_inicial;
        arrayconcat.push(arrayParaMover[i].id_indice);
      }

      const indEnc2 = await this.listaAgrupamiento
        .map((p) => p.seleccion)
        .indexOf(true);
      this.listaAgrupamiento[indEnc2].agrupamiento = JSON.stringify(
        array.concat(arrayconcat.reverse())
      );
      const modificado = this.formService.redondeo(
        this.listaAgrupamiento[indEnc2].indice_modificado + sumaindices,
        5
      );
      this.listaAgrupamiento[indEnc2].indice_modificado =
        parseFloat(modificado);
      this.listaAgrupamiento[indEnc2].menor5 =
        this.listaAgrupamiento[indEnc2].indice_modificado < 5 ? 1 : 0;
      this.tituloSeleccionado.modificado = true;
    } else {
      this.listaAgrupamiento[idx].vinculo = null;
      this.listaAgrupamiento[idx].agrupamiento = JSON.stringify([
        this.listaAgrupamiento[idx].id_indice,
      ]);
      const objeto = JSON.parse(JSON.stringify(this.listaAgrupamiento[idx]));
      const indEnc = await this.listaAgrupamiento
        .map((p) => p.seleccion)
        .indexOf(true);
      var arrayAgrup = JSON.parse(this.listaAgrupamiento[indEnc].agrupamiento);
      const indicDelet = arrayAgrup.indexOf(objeto.id_indice);
      arrayAgrup.splice(indicDelet, 1);
      this.listaAgrupamiento[indEnc].agrupamiento = JSON.stringify(arrayAgrup);
      const modificado = this.formService.redondeo(
        this.listaAgrupamiento[indEnc].indice_modificado -
          this.listaAgrupamiento[idx].indice_inicial,
        5
      );
      this.listaAgrupamiento[indEnc].indice_modificado = parseFloat(modificado);
      this.listaAgrupamiento[indEnc].menor5 =
        this.listaAgrupamiento[indEnc].indice_modificado < 5 ? 1 : 0;
      this.listaAgrupamiento.splice(idx, 1);
      const index = await this.moverfilaAgrupIU(
        this.listaAgrupamiento,
        objeto.indice_inicial,
        true
      );
      this.listaAgrupamiento.splice(index, 0, objeto);
      this.tituloSeleccionado.modificado = true;
    }
    this.agrupValido = await this.verificarAgrupCumple(this.listaAgrupamiento);
    const estructurado3 = await this.formatoTablaMonomio(
      this.tituloSeleccionado,
      this.listaAgrupamiento,
      false,
      4
    );
    this.listaAgrupamiento = await this.listaAgrupamiento.map((ele, index) => {
      ele.ind = index;
      if (ele.vinculo) {
        ele.agrupamiento = JSON.stringify([ele.id_indice]);
      }
      return ele;
    });
    this.listaAgrupamiento = await this.ordenarTabla(
      this.listaAgrupamiento,
      'indice_modificado'
    );
    this.tituloSeleccionado.tablas.tablaAgrupamiento = this.listaAgrupamiento;
    this.tituloSeleccionado.tablas.sumaIndMod = this.sumaIndMod;
    const tablamon = await this.actualizarTablaMonomio(
      this.agrupPrelMonomios,
      estructurado3
    );
    this.agrupPrelMonomios = tablamon.tabla;
    this.actualizarAcumMonomios();
    this.agrupPrelMonomios = await this.ordenarTabla(
      this.agrupPrelMonomios,
      'factor'
    );
    this.tituloSeleccionado.tablas.tablaMonomio = this.agrupPrelMonomios;
    this.tituloSeleccionado.tablas.sumaFactor = tablamon.sumaFactor;

    this.sumaFactor = estructurado3.sumaFactor;
    await this.generarFormulaPolinomicaInicial();
    await this.generarFormulaPolinomicaDefinida();
    this.tituloSeleccionado.estado = await this.verificarEstadoTitulo(
      this.agrupValido,
      this.sumaFactor,
      this.listaAgrupamiento,
      this.agrupPrelMonomios
    );
    this.tablaMonomioValido = await this.evaluarConformMon(
      this.agrupPrelMonomios,
      this.sumaFactor
    );
    this.buscando4 = false;
    this.monomioSeleccionado = null;
    this.guardarTemporal();
  }

  async actualizarTamañoCeldaTotal() {
    var clientWidth = document.getElementById('h-agrupamiento')?.clientWidth;
    if (clientWidth !== undefined) {
      this.w_agrup = clientWidth + 0.82;
    }
  }

  async moverfilaAgrupIU(tabla, idx, regresar, parametro = 'indice_inicial') {
    let indiceIndexar;
    if (!regresar) {
      const indEnc = await tabla.map((ele) => ele.seleccion).indexOf(true);
      indiceIndexar = indEnc + 1;
      let noEncuentra = false;
      for (let i = indEnc + 1; i < tabla.length; i++) {
        if (tabla[i].vinculo) {
          indiceIndexar = i + 1;
        } else {
          noEncuentra = true;
          break;
        }
      }
      if (!noEncuentra && indiceIndexar == tabla.length - 1) {
        indiceIndexar = indiceIndexar + 1;
      }
    } else {
      indiceIndexar = tabla.length;
      for (let i = tabla.length - 1; i >= 0; i--) {
        const fi = parseFloat(tabla[i][parametro]);
        const fiSelect = parseFloat(idx);

        if (fi > fiSelect && !tabla[i].vinculo) {
          break;
        } else if (fi < fiSelect && !tabla[i].vinculo) {
          indiceIndexar = i;
        }
      }
    }
    return indiceIndexar;
  }

  async verificarEstadoTitulo(
    agrupValido,
    sumaFactor,
    listaAgrupamiento,
    agrupPrelMonomios
  ) {
    let estado = null;
    // if (agrupValido && Number(sumaFactor) == 1) {
    //   estado = 1;
    // } else {
    const filter = await listaAgrupamiento.filter((ele) => ele.vinculo);
    const filter2 = await agrupPrelMonomios.filter((ele) => ele.vinculo);
    let repetidos = false;
    let buscados = [];
    for (const iterator of agrupPrelMonomios) {
      if (buscados.includes(iterator.id_indice)) {
        repetidos = true;
        break;
      } else {
        buscados.push(iterator.id_indice);
      }
    }
    if (!filter.length && !filter2.length) {
      estado = 0;
    } else if (
      (filter.length && !agrupValido) ||
      (filter2.length && Number(sumaFactor) < 1) ||
      repetidos
    ) {
      estado = 2;
    } else if (agrupValido && Number(sumaFactor) == 1 && !repetidos) {
      estado = 1;
    }

    // }

    return estado;
  }

  async generarFormulaPolinomicaInicial() {
    this.formulaPolinomicaInicial = '';
    const inicio = JSON.parse(JSON.stringify(this.agrupPrelMonomios));
    let stringArray = [];
    let valoresArray: valorFP[] = [];
    for (const row of inicio) {
      const string =
        row.factor_inicial + ' ' + row.simbolo + '_r/' + row.simbolo + '_O';
      const coeficiente = row.factor_inicial.toString();
      const variacion = (row.simbolo + '_r').toString();
      const monomio = (row.simbolo + '_O').toString();
      valoresArray.push({
        coeficiente: coeficiente,
        variacion_iu: variacion,
        monomio: monomio,
      });
      stringArray.push(string);
    }
    this.formulaPolinomicaInicial = stringArray.join(' + ');
    this.arrayFPInicial = JSON.parse(JSON.stringify(valoresArray));
  }

  async generarFormulaPolinomicaDefinida(retornar = false) {
    this.formulaPolinomicaDefinida = '';
    const filter = await this.agrupPrelMonomios.filter((ele) => !ele.vinculo);
    let stringArray = [];
    let valoresArray: valorFP[] = [];
    for (const row of filter) {
      const string =
        row.factor + ' ' + row.simbolo + '_r/' + row.simbolo + '_O';
      stringArray.push(string);
      const coeficiente = row.factor.toString();
      const variacion = (row.simbolo + '_r').toString();
      const monomio = (row.simbolo + '_O').toString();
      valoresArray.push({
        coeficiente: coeficiente,
        variacion_iu: variacion,
        monomio: monomio,
      });
    }
    if (!retornar) {
      this.formulaPolinomicaDefinida = stringArray.join(' + ');
      this.tituloSeleccionado.form_polinomica = this.formulaPolinomicaDefinida;
      this.tituloSeleccionado.arr_fp = JSON.stringify(valoresArray);
      this.arrayFP = JSON.parse(JSON.stringify(valoresArray));
    } else {
      return {
        form_polinomica: this.formulaPolinomicaDefinida,
        arr_fp: JSON.stringify(valoresArray),
      };
    }
  }

  async cambioSelMonomio(event, idx) {
    this.agrupPrelMonomios[idx].seleccion = event;
    if (event) {
      this.monomioSeleccionado = this.agrupPrelMonomios[idx];
      let i = 0;
      for (let agrupamiento of this.agrupPrelMonomios) {
        if (i !== idx) {
          agrupamiento.seleccion = false;
        }
        i++;
      }
    } else {
      this.monomioSeleccionado = null;
    }
  }

  async cambioVinculoMonomio(event, idx) {
    if (event) {
      const indEnc = await this.agrupPrelMonomios
        .map((p) => p.seleccion)
        .indexOf(true);

      const indiceAGrupar = JSON.parse(
        JSON.stringify(this.agrupPrelMonomios[indEnc].id_indice)
      );
      if (
        Number(this.agrupPrelMonomios[indEnc].factor) <
        Number(this.agrupPrelMonomios[idx].factor)
      ) {
        this.toaster.warning(
          'Se esta vinculado a uno de mayor a menor indice',
          'Alerta',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      }
      this.agrupPrelMonomios[idx].vinculo = JSON.parse(
        JSON.stringify(
          this.monomioSeleccionado.id_indice +
            '+' +
            this.monomioSeleccionado.tipo
        )
      );
      var array = JSON.parse(this.agrupPrelMonomios[indEnc].agrupamiento);
      const agruSelect = JSON.parse(this.agrupPrelMonomios[idx].agrupamiento);
      let arrayParaMover: monomio[] = [];
      if (agruSelect.length > 1) {
        for (let i = 0; i < agruSelect.length; i++) {
          arrayParaMover.push(
            JSON.parse(JSON.stringify(this.agrupPrelMonomios[idx + i]))
          );
        }
      } else if (agruSelect.length == 1) {
        arrayParaMover.push(
          JSON.parse(JSON.stringify(this.agrupPrelMonomios[idx]))
        );
      }
      this.agrupPrelMonomios.splice(idx, arrayParaMover.length);
      const index = await this.moverfilaAgrupIU(
        this.agrupPrelMonomios,
        idx,
        false
      );
      arrayParaMover.reverse();
      let arrayconcat = [];
      let sumaFactores = 0;
      for (let i = 0; i < arrayParaMover.length; i++) {
        this.agrupPrelMonomios.splice(index, 0, arrayParaMover[i]);
        arrayParaMover[i].vinculo =
          indiceAGrupar + '+' + this.monomioSeleccionado.tipo;
        arrayParaMover[i].factor = this.formService.redondeo(
          Number(arrayParaMover[i].factor_inicial),
          5
        );
        arrayParaMover[i].agrupamiento = JSON.stringify([
          arrayParaMover[i].id_indice,
        ]);
        sumaFactores =
          sumaFactores + parseFloat(arrayParaMover[i].factor_inicial);
        arrayconcat.push(arrayParaMover[i].id_indice);
      }
      const indEnc2 = await this.agrupPrelMonomios
        .map((p) => p.seleccion)
        .indexOf(true);
      this.agrupPrelMonomios[indEnc2].agrupamiento = JSON.stringify(
        array.concat(arrayconcat.reverse())
      );
      this.agrupPrelMonomios[indEnc2].factor = this.formService.redondeo(
        parseFloat(this.agrupPrelMonomios[indEnc2].factor) + sumaFactores,
        5
      );
      this.tituloSeleccionado.modificado = true;
      this.agrupPrelMonomios = await this.agrupPrelMonomios.map(
        (ele, index) => {
          ele.ind = index;
          return ele;
        }
      );
    } else {
      this.agrupPrelMonomios[idx].vinculo = null;
      this.agrupPrelMonomios[idx].agrupamiento = JSON.stringify([
        this.agrupPrelMonomios[idx].id_indice,
      ]);
      const objeto = JSON.parse(JSON.stringify(this.agrupPrelMonomios[idx]));
      const indEnc = await this.agrupPrelMonomios
        .map((p) => p.seleccion)
        .indexOf(true);
      var arrayAgrup = JSON.parse(this.agrupPrelMonomios[indEnc].agrupamiento);
      const indicDelet = arrayAgrup.indexOf(objeto.id_indice);
      arrayAgrup.splice(indicDelet, 1);
      this.agrupPrelMonomios[indEnc].agrupamiento = JSON.stringify(arrayAgrup);
      this.agrupPrelMonomios[indEnc].factor = this.formService.redondeo(
        parseFloat(this.agrupPrelMonomios[indEnc].factor) -
          parseFloat(this.agrupPrelMonomios[idx].factor_inicial),
        5
      );
      this.agrupPrelMonomios.splice(idx, 1);
      const index = await this.moverfilaAgrupIU(
        this.agrupPrelMonomios,
        objeto.factor,
        true,
        'factor'
      );
      this.agrupPrelMonomios.splice(index, 0, objeto);
      this.tituloSeleccionado.modificado = true;
    }
    this.tituloSeleccionado.tablas.tablaAgrupamiento = this.listaAgrupamiento;
    this.tituloSeleccionado.tablas.sumaIndMod = this.sumaIndMod;
    this.tituloSeleccionado.tablas.tablaMonomio = this.agrupPrelMonomios;
    this.tituloSeleccionado.tablas.sumaFactor = this.sumaFactor;
    await this.actualizarAcumMonomios();
    await this.generarFormulaPolinomicaDefinida();
    this.tituloSeleccionado.estado = await this.verificarEstadoTitulo(
      this.agrupValido,
      this.sumaFactor,
      this.listaAgrupamiento,
      this.agrupPrelMonomios
    );
    this.tablaMonomioValido = await this.evaluarConformMon(
      this.agrupPrelMonomios,
      this.sumaFactor
    );
    this.guardarTemporal();
  }

  verificarAgrupValidoXMon(item) {
    let bloquear = false;
    let arrayAgrupados = [];
    if (this.monomioSeleccionado) {
      arrayAgrupados = this.agrupPrelMonomios.filter(
        (ele) =>
          ele.vinculo ==
          this.monomioSeleccionado?.id_indice +
            '+' +
            this.monomioSeleccionado?.tipo
      );
      const cantAgru = arrayAgrupados.length + 1;
      bloquear = arrayAgrupados.length == 2 && !item?.vinculo ? true : false;
      if (!item.vinculo) {
        const agrupadosItem = this.agrupPrelMonomios.filter(
          (ele) =>
            (ele.id_indice == item.id_indice && ele.tipo == item.tipo) ||
            ele.vinculo == item?.id_indice + '+' + item?.tipo
        );
        const total = agrupadosItem.length + cantAgru;
        if (total > 3) {
          bloquear = true;
        }
      }
    } else {
      if (
        this.disabAcciones ||
        this.bloquearEdicion ||
        !this.monomioSeleccionado
      ) {
        bloquear = true;
      }
    }
    return bloquear;
  }

  msjAgrupMonomio(item) {
    let msj = '';
    if (this.monomioSeleccionado) {
      const arrayAgrupados = this.agrupPrelMonomios.filter(
        (ele) =>
          ele.vinculo ==
          this.monomioSeleccionado?.id_indice +
            '+' +
            this.monomioSeleccionado?.tipo
      );
      if (arrayAgrupados.length == 2) {
        msj = 'No se puede agrupar mas de 3 elementos';
      } else {
        if (!item.vinculo) {
          const agrupadosItem = this.agrupPrelMonomios.filter(
            (ele) =>
              (ele.id_indice == item.id_indice && ele.tipo == item.tipo) ||
              ele.vinculo == item?.id_indice + '+' + item?.tipo
          );
          msj =
            agrupadosItem.length == 3
              ? 'Fila seleccionada con limite de agrupamiento'
              : '';
        }
        if (arrayAgrupados.length + 1 + arrayAgrupados.length > 3) {
          msj = 'No se puede agrupar con  esta fila';
        }
      }
    }
    if (msj) {
      this.toaster.error(msj, 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    }
  }

  editarMonomio(idx) {
    if (!this.disabAcciones && !this.solover && !this.existTempCI) {
      this.agrupPrelMonomios[idx].editar_monomio = 1;
    }
  }

  editarSimbolo(idx) {
    if (!this.disabAcciones && !this.solover && !this.existTempCI) {
      this.agrupPrelMonomios[idx].editar_simbolo = 1;
    }
  }

  async blurMonomio(event, i) {
    if (
      this.agrupPrelMonomios[i].monomio !== event.target.value.toUpperCase()
    ) {
      this.tituloSeleccionado.modificado = true;
      this.agrupPrelMonomios[i].monomio = event.target.value.toUpperCase();
      this.agrupPrelMonomios[i].editar_monomio = 0;
      await this.generarFormulaPolinomicaDefinida();
      this.guardarTemporal();
    } else {
      this.agrupPrelMonomios[i].editar_monomio = 0;
    }
  }

  async blurSimbolo(event, i) {
    if (
      this.agrupPrelMonomios[i].simbolo !== event.target.value.toUpperCase()
    ) {
      this.tituloSeleccionado.modificado = true;
      this.agrupPrelMonomios[i].simbolo = event.target.value.toUpperCase();
      this.agrupPrelMonomios[i].editar_simbolo = 0;
      await this.generarFormulaPolinomicaDefinida();
      this.guardarTemporal();
    } else {
      this.agrupPrelMonomios[i].editar_simbolo = 0;
    }
  }

  async actualizarAcumMonomios(agrup = null) {
    let tabla = [];
    if (!agrup) {
      tabla = this.agrupPrelMonomios;
    } else {
      tabla = agrup;
    }

    for (let row of tabla) {
      const array = JSON.parse(row.agrupamiento);
      let arrayTextos = [];
      if (array.length > 1) {
        for (const item of array) {
          const encontrado = await tabla.find((ele) => ele.id_indice === item);
          const porcentaje =
            (100 * Number(encontrado.factor_inicial)) / Number(row.factor);
          const index = tabla.findIndex((ele) => ele.id_indice === item);
          tabla[index].acumulado = this.formService.redondeo(porcentaje, 3);
          const inicial = encontrado.desc_indice.trim().charAt(0);
          arrayTextos.push(inicial);
        }

        // const porcentaje2 =
        //   (100 * Number(row.factor_inicial)) / Number(row.factor);
        // console.log('porcentaje2', porcentaje2);
        // tabla[row.ind].acumulado = this.formService.redondeo(porcentaje2, 3);
        row.simbolo = arrayTextos.join('');
      } else {
        if (!row.vinculo) {
          const inicial = row.desc_indice.trim().charAt(0);
          if (row.simbolo && inicial !== row.simbolo) {
            row.simbolo = row.simbolo;
          } else {
            row.simbolo = inicial;
          }
        }
        if (array.length == 1 && !row.vinculo) {
          row.acumulado = '100.000';
          row.factor = row.factor_inicial;
        }
      }
    }
    if (agrup) {
      return tabla;
    } else {
      this.agrupPrelMonomios = tabla;
    }
  }

  // async descartarTodosLoscambios() {
  //   const dataRecuperada = await this.listarTemporal();
  //   const existeCambios = await this.titulos.find(
  //     (ele) => ele.modificado || ele.modificado_descripcion
  //   );
  //   const cambiosActivos = await this.titulos.find(
  //     (ele) => ele.cambios
  //   );
  //   if (cambiosActivos) {
  //     this.toaster.error('Tablas agrupamiento desactualizadas', 'Error', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 4000,
  //     });
  //     return;
  //   }
  //   if (dataRecuperada && existeCambios) {
  //     const sw = await SwalService.confirm(
  //       'Estas seguro?',
  //       null,
  //       'Se descartará todos los cambios sin guardar realizados.'
  //     );
  //     if (sw.isConfirmed) {
  //       this.mostrar_carga_todo2 = true;
  //       this.vista = 1;
  //       await this.eliminarTemporal();
  //       await this.listarTitulos();
  //       await this.listarIndicesUnificados();
  //       await this.tablaInsumos();
  //       this.mostrar_carga_todo2 = false;
  //       this.toaster.success('Se descarto todos los cambios', 'Éxito', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //     }
  //   } else {
  //     this.toaster.info('Ningun cambio registrado para descartar', null, {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 4000,
  //     });
  //     return;
  //   }
  // }

  // async guardarCambios() {
  //   try {
  //     const tablaNoCorregidas = await this.titulos.filter((ele) => ele.cambios);
  //     if (!tablaNoCorregidas.length) {
  //       const existe = await this.titulos.find(
  //         (ele) => ele.modificado || ele.modificado_descripcion
  //       );
  //       if (existe) {
  //         const sw = await SwalService.confirm(
  //           'Estas seguro?',
  //           null,
  //           'Se guardara todos los cambios realizados.'
  //         );
  //         if (sw.isConfirmed) {
  //           this.mostrar_carga_todo = true;
  //           let tablatit: tituloFP[] = [];
  //           let tablaagrup = [];
  //           let tablamono = [];
  //           let arrayEliminado = [];
  //           tablatit = this.titulos;
  //           for (const row of tablatit) {
  //             if (row.modificado) {
  //               if (row.vinculo) {
  //                 arrayEliminado.push(row.indice);
  //               } else {
  //                 const encontrado = await this.titulos.find(
  //                   (ele) => ele.indice == row.indice
  //                 );
  //                 tablamono = tablamono.concat(encontrado.tablas?.tablaMonomio);
  //                 tablaagrup = tablaagrup.concat(
  //                   encontrado.tablas?.tablaAgrupamiento
  //                 );
  //               }
  //             }
  //           }
  //           const id_proyecto = this.idProyecto;
  //           const id_usuario = this.iduser;
  //           const limpiar = arrayEliminado.join('|');
  //           const datos1 = JSON.stringify(tablatit);
  //           const datos2 = JSON.stringify(tablaagrup);
  //           const datos3 = JSON.stringify(tablamono);
  //           const obj = JSON.stringify({
  //             id_proyecto: id_proyecto,
  //             id_usuario: id_usuario,
  //             limpiar: limpiar,
  //             datos1: datos1,
  //             datos2: datos2,
  //             datos3: datos3,
  //           });
  //           const response =
  //             await this.formulaPolinomicaService.guardarCambiosFormulaPolinomica(
  //               obj
  //             );
  //           if (response.id == '1') {
  //             for await (let iterator of this.titulos) {
  //               iterator.modificado = false;
  //               iterator.modificado_descripcion = false;
  //             }
  //             await this.eliminarTemporal();
  //             this.mostrar_carga_todo = false;
  //             this.titulosActualizado = false
  //             this.toaster.success(response.mensaje, 'Éxito', {
  //               closeButton: false,
  //               positionClass: 'toast-bottom-right',
  //               timeOut: 4000,
  //             });
  //           } else {
  //             this.mostrar_carga_todo = false;
  //             SwalService.error('ERROR', response.mensaje);
  //           }
  //         }
  //       } else {
  //         this.toaster.info('Ningun cambio registrado para guardar', null, {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         });
  //         return;
  //       }
  //     } else {
  //       this.toaster.error('Titulos con cambios no corregidos ', 'Error', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //     }
  //   } catch (error) {
  //     this.mostrar_carga_todo = false;
  //     SwalService.error(error);
  //   }
  // }

  async eliminarDataAlmacenadaProyecto(mostrarAlert = true) {
    try {
      if (mostrarAlert) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          null,
          'Se eliminara todos los datos de formula polinomica del proyecto'
        );
        if (sw.isConfirmed) {
          this.mostrar_carga_todo = true;
          const obj = {
            id_proyecto: this.idProyecto,
          };
          const response =
            await this.formulaPolinomicaService.eliminarDataFormulaPolinomicaxProyecto(
              obj
            );
          if (response[0].id == '1') {
            // this.titEstructSelect = null;
            await this.eliminarTemporal();
            await this.reiniciarValores();
            await this.recuperarTempIndirecto();
            await this.verificarCambiosPresupuesto();
            await this.listarIndicesUnificados();
            await this.tablaInsumos();

            await this.evaluarDataIniFP();
            this.mostrar_carga_todo = false;
            this.toaster.success(
              'Se reiniciaron los datos de formula polinomica del proyecto',
              'Éxito',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
          } else {
            this.mostrar_carga_todo = false;
            SwalService.error('Error', response[0].mensaje);
          }
        }
      } else {
        const obj = {
          id_proyecto: this.idProyecto,
        };
        const response =
          await this.formulaPolinomicaService.eliminarDataFormulaPolinomicaxProyecto(
            obj
          );
        if (response[0].id == '1') {
          // this.titEstructSelect = null;
          await this.eliminarTemporal();
          await this.reiniciarValores();
        } else {
          SwalService.error('Error', response[0].mensaje);
        }
      }
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error(error);
    }
  }

  async eliminarTablasPorTitulo(titulo, idx, proceso = false) {
    try {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        null,
        'Se eliminara todos los cambios en las tabla de agrupamiento de denominación : <br><b>' +
          titulo.denominacion +
          '<b>'
      );
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const obj = {
          id_proyecto: this.idProyecto,
          indice: titulo.indice,
        };
        const response =
          await this.formulaPolinomicaService.eliminarContenidoTituloFormulaPolinomica(
            obj
          );
        if (response[0].id == '1') {
          this.titEstructSelect = null;
          this.tituloSeleccionado = null;
          // this.titulos[idx].tablas.sumaFactor = null;
          // this.titulos[idx].tablas.sumaIndMod = null;
          // this.titulos[idx].tablas.tablaAgrupamiento = [];
          // this.titulos[idx].tablas.tablaMonomio = [];
          this.titulos[idx].tablas = null;
          this.titulos[idx].modificado = true;
          this.titulos[idx].estado = 0;
          this.titulos[idx].cambios = null;
          this.titulos[idx].form_polinomica = null;
          this.titulos[idx].arr_fp = null;
          await this.guardarTemporal();
          this.mostrar_carga_todo = false;
          this.toaster.success(response[0].mensaje, 'Éxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
        } else {
          this.mostrar_carga_todo = false;
          SwalService.error('Error', response[0].mensaje);
        }
      }
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error(error);
    }
  }

  async toggleOffAgrup(idx) {
    this.listaAgrupamiento[idx].icomost = 0;
    if (idx < this.listaAgrupamiento.length - 1) {
      for (
        let index = idx + 1;
        index < this.listaAgrupamiento.length;
        index++
      ) {
        const element = this.listaAgrupamiento[index];
        if (element.vinculo) {
          this.listaAgrupamiento[index].mostrar = 0;
        } else {
          break;
        }
      }
    }
  }

  async toggleOnAgrup(idx) {
    this.listaAgrupamiento[idx].icomost = 1;
    if (idx < this.listaAgrupamiento.length - 1) {
      for (
        let index = idx + 1;
        index < this.listaAgrupamiento.length;
        index++
      ) {
        const element = this.listaAgrupamiento[index];
        if (element.vinculo) {
          this.listaAgrupamiento[index].mostrar = 1;
        } else {
          break;
        }
      }
    }
  }

  async maxtodoAgrup() {
    for (let index = 0; index < this.listaAgrupamiento.length; index++) {
      const element = this.listaAgrupamiento[index];
      if (element.vinculo) {
        this.listaAgrupamiento[index].mostrar = 1;
      } else {
        this.listaAgrupamiento[index].icomost = 1;
      }
    }
  }

  async mintodoAgrup() {
    for (let index = 0; index < this.listaAgrupamiento.length; index++) {
      const element = this.listaAgrupamiento[index];
      if (element.vinculo) {
        this.listaAgrupamiento[index].mostrar = 0;
      } else {
        this.listaAgrupamiento[index].icomost = 0;
      }
    }
  }

  async verificarCambiosPresupuesto() {
    let presutemp = await this.presuservice.ExistePresuTemp({
      id_proyecto: this.idProyecto,
      id_usuario: this.iduser,
    });
    if (presutemp.length) {
      this.disabAcciones = true;
    } else {
      this.disabAcciones = false;
    }
  }

  // async corregirTablas() {
  //   const sw = await SwalService.confirm(
  //     'Estas seguro?',
  //     null,
  //     'Se actualizara la tabla agrupamiento con los cambios en indices unificados y se reiniciara la tabla monomios,'
  //   );
  //   if (sw.isConfirmed) {
  //     this.mostrar_carga_todo = true;
  //     const data: tituloFP = JSON.parse(
  //       JSON.stringify(this.tituloSeleccionado)
  //     );
  //     const agrupamiento = await data.cambios.tablaAgrupCorregida.map(
  //       (ele, index) => {
  //         ele.considerar = 1;
  //         ele.ind = index;
  //         return ele;
  //       }
  //     );
  //     const monomio = await data.cambios.tablaMonomCorregida.map(
  //       (ele, index) => {
  //         ele.considerar = 1;
  //         ele.ind = index;
  //         return ele;
  //       }
  //     );
  //     this.tituloSeleccionado.tablas.sumaFactor = data.cambios.sumaFactores;
  //     this.tituloSeleccionado.tablas.sumaIndMod = data.cambios.sumaIndMod;
  //     this.tituloSeleccionado.tablas.tablaAgrupamiento = agrupamiento;
  //     this.tituloSeleccionado.tablas.tablaMonomio = monomio;
  //     this.tituloSeleccionado.modificado = true;
  //     this.listaAgrupamiento = agrupamiento;
  //     this.agrupPrelMonomios = monomio;
  //     this.agrupValido = await this.verificarAgrupCumple(this.listaAgrupamiento);
  //     await this.generarFormulaPolinomicaInicial();
  //     await this.generarFormulaPolinomicaDefinida();
  //     this.tituloSeleccionado.cambios = null;
  //     this.tituloSeleccionado.estado = await this.verificarEstadoTitulo(this.agrupValido, this.sumaFactor, this.listaAgrupamiento, this.agrupPrelMonomios);
  //     await this.guardarTemporal();
  //     this.bloquearEdicion = false;
  //     this.titulosActualizado = false
  //     setTimeout(() => {
  //       this.toaster.success('Se actualizó correctamente', 'Éxito', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //       this.mostrar_carga_todo = false;
  //     }, 1000);
  //   }
  // }

  async listarPrincipal() {
    this.titulos = [];
    this.totalCDProy = 0;
    const obj = {
      id_proyecto: this.idProyecto,
    };
    let guardarTemp = false;
    const response =
      await this.formulaPolinomicaService.listarTablaTitulosFormPol(obj);
    const titPresuActualizado = response[0];
    const titulosGuardados = response[1];
    const existeTemporal = await this.listarTemporal();
    if (existeTemporal) {
      const tablaTitulos = await this.verificarCambiosTablaPrincipal(
        titPresuActualizado,
        existeTemporal
      );
      this.titulos = tablaTitulos.tablatemporal;

      this.existeTempFP = true;
      guardarTemp = tablaTitulos.guardarTemp;
    } else {
      if (titulosGuardados.length) {
        const tablaTitulos = await this.verificarCambiosTablaPrincipal(
          titPresuActualizado,
          titulosGuardados
        );
        this.titulos = tablaTitulos.tablatemporal;
        guardarTemp = tablaTitulos.guardarTemp;
      } else {
        // let totalCD = 0
        // titPresuActualizado.map(ele => {totalCD = totalCD + Number(ele.parcial)})
        await titPresuActualizado.map((ele) => {
          this.totalCDProy = this.totalCDProy + ele.parcial;
        });
        if (titPresuActualizado.length) {
          for (const titulo of titPresuActualizado) {
            // let totalCITit= 0
            // if (titulo.tablaCI?.length) {
            //   titulo.tablaCI.map(ele => {totalCITit = totalCITit + Number(ele.monto)})
            // }
            // const CI = (totalCITit * 100 * titulo.parcial) / totalCD
            let estrucFilTit = await this.estructurarTitulo(titulo);
            // console.log('CI', CI);

            // estrucFilTit.ci_total = CI
            this.titulos.push(estrucFilTit);
          }
        }
      }
      this.existeTempFP = false;
    }
    if (guardarTemp) {
      await this.guardarTemporal();
    }
    await this.filtroTitulos();
    // await this.calcularCIxTitulo();
  }

  async evaluarDataIniFP() {
    this.titulos = [];
    const obj = {
      id_proyecto: this.idProyecto,
    };
    let guardarTemp = false;
    const tablasBD =
      await this.formulaPolinomicaService.listarTablaTitulosFormPol(obj);
    const tablaTitAlmac = tablasBD[1];
    const tablaTitActualizada = tablasBD[0];
    const existeTemporal = await this.listarTemporal();
    let tablaTitulos = [];
    let totalCD_act = 0;
    for (const ele of tablaTitActualizada) {
      totalCD_act = totalCD_act + ele.parcial;
    }

    if (existeTemporal) {
      this.existeTempFP = true;
      const evaluacion = await this.verificarCambios(
        existeTemporal,
        tablaTitActualizada
      );
      if (evaluacion.reiniciar) {
        await this.eliminarDataAlmacenadaProyecto(false);
        for (const titulo of tablaTitActualizada) {
          const estrucFilTit = await this.estructurarTitulo(
            titulo,
            totalCD_act
          );
          this.titulos.push(estrucFilTit);
        }
      } else {
        this.titulos = evaluacion.tabla;
      }
    } else {
      if (tablaTitAlmac.length) {
        const evaluacion = await this.verificarCambios(
          tablaTitAlmac,
          tablaTitActualizada
        );
        if (evaluacion.reiniciar) {
          for (const titulo of tablaTitActualizada) {
            const estrucFilTit = await this.estructurarTitulo(
              titulo,
              totalCD_act
            );
            this.titulos.push(estrucFilTit);
          }
        } else {
          let titulos = [];
          for (let iterator of evaluacion.tabla) {
            // iterator = await this.tablasAlmAgrupYMon(iterator)
            let tit = await this.estructurarTitulo(iterator, totalCD_act);
            tit = await this.tablasAlmAgrupYMon(tit);
            titulos.push(tit);
          }
          this.titulos = titulos;
        }
      } else {
        //nuevo
        for (const titulo of tablaTitActualizada) {
          const estrucFilTit = await this.estructurarTitulo(
            titulo,
            totalCD_act
          );
          this.titulos.push(estrucFilTit);
        }
      }
    }
    await this.filtroTitulos();
  }

  async tablasAlmAgrupYMon(titulosel) {
    const tab1 = await this.listarTablaIUxTitAlmacenado(titulosel.indice);
    if (tab1.length) {
      let sumaIndMod = 0;
      let sumaFactor = 0;
      await tab1.map((ele) => {
        if (!ele.vinculo) {
          sumaIndMod = sumaIndMod + Number(ele.indice_modificado);
        }
      });
      var tab2 = await this.listarAlmacenadosMonomio(titulosel.indice);
      await tab2.map((ele) => {
        if (!ele.vinculo) {
          sumaFactor = sumaFactor + Number(ele.factor);
        }
      });
      const data = {
        indice: titulosel.indice,
        tablaAgrupamiento: tab1,
        sumaIndMod: this.formService.redondeo(Number(sumaIndMod), 3),
        tablaMonomio: tab2,
        sumaFactor: this.formService.redondeo(Number(sumaFactor), 5),
      };
      titulosel.tablas = data;
      titulosel.actualizado = false;
    }
    return titulosel;
  }

  async verificarCambios(tablaAlm, tablaAct) {

    let tabla = [];
    let desactualizados = [];
    let totalActua = 0;
    let reiniciarTotal = false;
    let agregar = [];
    let totalGuard = 0;
    tablaAct.map((ele) => (totalActua = totalActua + ele.parcial));
    for (const iterator of tablaAlm) {
      const existe = await tablaAct.find(
        (ele) => ele.indice == iterator.indice
      );
      if (!existe) {
        reiniciarTotal = true;
      }

      if (!iterator.vinculo) {
        // console.log('============================');
        // console.log('tit', iterator);
        const iuPresu = await this.formatoTablaAgrup(iterator);
        const Almacenados = await this.listarTablaIUxTitAlmacenado(
          iterator.indice
        );
        for (const iuAlmacenado of Almacenados) {
          if (iuAlmacenado.tipo == 'CD') {
          const encontrado = iuPresu.tabla.find(
            (ele) => iuAlmacenado.id_indice == ele.id_indice && iuAlmacenado.tipo == ele.tipo
          );
        
          if (
            !encontrado ||
            (encontrado && encontrado.montos !== iuAlmacenado.montos) ||  this.formService.redondeo(encontrado.acumulado, 2) !== this.formService.redondeo(iuAlmacenado.acumulado, 2)
          ) {
          
            // // console.log('comp', iuAlmacenado, );
            // // console.log('encon', encontrado);
            // // console.log('encontrado.montos', encontrado.montos, iuAlmacenado.montos)
            // console.log('encontrado.acumulado', this.formService.redondeo(encontrado.acumulado, 2), this.formService.redondeo(iuAlmacenado.acumulado, 2))
            reiniciarTotal = true;
          } else {
            // console.log('igual')
          }
        }
        }
      }
    }

    for (const tit of tablaAct) {
      const existe = await tablaAlm.find((ele) => ele.indice === tit.indice);
      const tablaCI = await this.tablaCostoIndirecto(tit.item + '.');
      let totalci = 0;
      if (tablaCI.length) {
        await tablaCI.map((ele) => (totalci = ele.monto + totalci));
      }

      // const montoci =
      //   totalActua == 0 ? 0 : (totalci * tit.parcial) / totalActua;
      const montoci = totalci;

      if (!existe) {
        agregar.push(tit);
        // reiniciarTotal = true;reiniciarTotal
      } else if (
        (existe &&
          this.formService.redondeo(existe.parcial, 5) !==
            this.formService.redondeo(tit.parcial, 5)) ||
        this.formService.redondeo(existe.ci_total, 5) !==
          this.formService.redondeo(montoci, 5)
      ) {
        reiniciarTotal = true;
      } else if (
        existe.item !== tit.item ||
        existe.descripcion !== tit.descripcion
      ) {
        desactualizados.push(tit);
      }
    }
    // console.log('pasa', reiniciarTotal);

    if (reiniciarTotal) {
      return { reiniciar: reiniciarTotal, tabla: tabla };
    } else {
      let totalCD_act = 0;
      for (const ele of tablaAlm) {
        totalCD_act = totalCD_act + ele.parcial;
      }
      for (const iterator of tablaAlm) {
        const encontrado = await desactualizados.find(
          (ele) => iterator.indice == ele.indice
        );
        if (encontrado) {
          iterator.item = encontrado.item;
          iterator.descripcion = encontrado.descripcion;
          const cantChar = iterator.item.length;
          iterator.itemfp =
            cantChar == 1 ? 'T0' + encontrado.item : 'T' + encontrado.item;
          iterator.itformula =
            cantChar == 1 ? 'FP0' + encontrado.item : 'FP' + encontrado.item;
          const usadoEn = await tablaAlm.filter((ele) =>
            JSON.parse(ele.vinculados_arr).includes(iterator.indice)
          );

          if (usadoEn.length) {
            for (const otrotit of usadoEn) {
              const arreglo = JSON.parse(otrotit.vinculados_arr);
              const arreglo1 = JSON.parse(otrotit.agrup_items);
              const arreglo2 = JSON.parse(otrotit.agrupamiento);
              const index = arreglo.indexOf(otrotit.indice);
              arreglo1[index] = iterator.item;
              arreglo2[index] = iterator.itemfp;
              otrotit.agrupamiento = JSON.stringify(arreglo2);
              otrotit.agrup_items = JSON.stringify(arreglo1);
            }
          }
        }
        iterator.seleccion = 0;
        tabla.push(iterator);
      }
      if (agregar.length) {
        for (const iterator of agregar) {
          const estrucFilTit = await this.estructurarTitulo(
            iterator,
            totalCD_act
          );
          const existe = await tabla.findIndex(
            (ele) => ele.item > iterator.item && !ele.vinculo
          );
          if (existe !== -1) {
            tabla.splice(existe, 0, estrucFilTit);
          } else {
            tabla.push(estrucFilTit);
          }
        }
      }
      tabla = await this.ordenarTablatitulos(tabla);

      return { reiniciar: reiniciarTotal, tabla: tabla };
    }
  }

  async verificarCambiosTablaPrincipal(tablaBD, tablaTemporal) {
    let actualizar = false;
    let actua1 = false;
    let actua2 = false;
    let actua3 = false;
    this.totalCDProy = 0;
    for (const iterator of tablaBD) {
      this.totalCDProy = this.totalCDProy + iterator.parcial;
      const noAgregado = tablaTemporal.find(
        (ele) => ele.indice == iterator.indice
      );
      if (!noAgregado) {
        actualizar = true;
        break;
      }
    }
    if (actualizar) {
      tablaTemporal = await this.tablaActualizada(tablaBD, tablaTemporal);
    }
    for (const titulo of tablaTemporal) {
      titulo.seleccion = 0;
      const encontrado = await tablaBD.find(
        (ele) => ele.indice == titulo.indice
      );
      if (encontrado) {
        titulo.descripcion = encontrado.descripcion;
        // titulo.item = encontrado.item
        if (titulo.parcial !== encontrado.parcial) {
          titulo.estado = 3;
          titulo.modificado = true;
          actua1 = true;
        } else {
        }
        titulo.parcial = encontrado.parcial;
        if (encontrado.item !== titulo.item) {
          titulo.item = encontrado.item;
          const cantChar = titulo.item.length;
          titulo.itemfp =
            cantChar == 1 ? 'T0' + encontrado.item : 'T' + encontrado.item;
          titulo.itformula =
            cantChar == 1 ? 'FP0' + encontrado.item : 'FP' + encontrado.item;
          const usadoEn = await tablaTemporal.filter((ele) =>
            JSON.parse(ele.vinculados_arr).includes(titulo.indice)
          );
          actua2 = true;
          if (usadoEn.length) {
            for (const iterator of usadoEn) {
              const arreglo = JSON.parse(iterator.vinculados_arr);
              const arreglo1 = JSON.parse(iterator.agrup_items);
              const arreglo2 = JSON.parse(iterator.agrupamiento);
              const index = arreglo.indexOf(titulo.indice);
              arreglo1[index] = titulo.item;
              arreglo2[index] = titulo.itemfp;
              iterator.agrupamiento = JSON.stringify(arreglo2);
              iterator.agrup_items = JSON.stringify(arreglo1);
            }
          }
        }
      }
    }
    tablaTemporal = await this.ordenarTablatitulos(tablaTemporal);
    for (const titulo of tablaTemporal) {
      const agrupamientoItems = JSON.parse(titulo.agrup_items).join('.|') + '.';
      const tablaCI_agrupado = await this.tablaCostoIndirecto(
        agrupamientoItems
      );
      const tablaCI_titulo = await this.tablaCostoIndirecto(titulo.item + '.');
      let totalci = 0;

      if (tablaCI_titulo.length) {
        await tablaCI_titulo.map((ele) => (totalci = ele.monto + totalci));
      }
      if (titulo.ci_total !== totalci) {
        titulo.estado = 3;
        titulo.modificado = true;
        actua3 = true;
      }
      titulo.ci_total = totalci;
      titulo.tablaCI = tablaCI_agrupado;
      titulo.total_costos = Number(titulo.parcial) + totalci;
      titulo.actualizado = false;
    }
    let i = 0;
    for (const titulo of tablaTemporal) {
      titulo.ind = i;
      const vincarr = JSON.parse(titulo.vinculados_arr);
      let monto = 0;
      for (const iterator of vincarr) {
        const encontrad = tablaTemporal.find((ele) => ele.indice == iterator);
        monto = monto + encontrad.total_costos;
      }
      titulo.monto_gru = monto;
      i++;
    }

    return {
      tablatemporal: tablaTemporal,
      guardarTemp: actua1 || actua2 || actua3 || actualizar,
    };
  }

  async ordenarTablatitulos(tabla) {
    let tablaOrdenada = [];
    for (const iterator of tabla) {
      if (!iterator.vinculo) {
        const encontrado = await tablaOrdenada.findIndex(
          (ele) => Number(ele.item) == Number(iterator.item)
        );
        if (encontrado == -1) {
          tablaOrdenada.push(iterator);
        } else {
          tablaOrdenada.splice(encontrado, 0, iterator);
        }
      }
    }
    tablaOrdenada.sort(function (a, b) {
      if (Number(a.item) < Number(b.item)) return -1;
      if (Number(a.item) > Number(b.item)) return 1;
    });
    let array2 = [];
    let i = 0;
    for (const iterator of tablaOrdenada) {
      if (JSON.parse(iterator.vinculados_arr).length > 1) {
        let array = [];
        const vinculados = JSON.parse(iterator.vinculados_arr);
        for (let i = 0; i < vinculados.length; i++) {
          const fila = await tabla.find(
            (ele) => Number(ele.indice) == Number(vinculados[i])
          );
          if (fila) {
            array.push(fila);
          }
        }
        if (array.length) {
          array2 = array2.concat(array);
        }

        // tablaOrdenada.splice()
      } else {
        array2.push(iterator);
      }
      i++;
    }
    return array2;
  }

  async estructurarTitulo(titulo, totalCDProy = 0) {
    const agrupamiento = titulo.agrup_items
      ? titulo.agrup_items
      : JSON.stringify([titulo.item]);
    // const agrupamientoItems = JSON.parse(agrupamiento).join('.|') + '.';
    // const tablaCI = await this.tablaCostoIndirecto(agrupamientoItems);
    const tablaCI = await this.tablaCostoIndirecto(titulo.item + '.');
    let totalci = 0;
    if (tablaCI.length) {
      await tablaCI.map((ele) => (totalci = ele.monto + totalci));
    }
    // console.log('totalci', totalci)
    // const montoci =
    //   totalCDProy == 0 ? 0 : (totalci * titulo.parcial) / totalCDProy;

    const montoci = totalci;
    let obj: tituloFP = {
      ind: titulo.ind,
      item: titulo.item,
      descripcion: titulo.descripcion,
      parcial: titulo.parcial,
      itemfp: titulo.itemfp
        ? titulo.itemfp
        : 'T' + (titulo.ind + 1 < 10 ? '0' : '') + (titulo.ind + 1),
      seleccion: 0,
      vinculo: titulo.vinculo,
      vinculados_arr: titulo.vinculados_arr
        ? titulo.vinculados_arr
        : JSON.stringify([titulo.indice]),
      agrupamiento: titulo.agrupamiento
        ? titulo.agrupamiento
        : JSON.stringify([titulo.itemfp]),
      denominacion: titulo.denominacion
        ? titulo.denominacion
        : titulo.descripcion,
      editar_denominacion: 0,
      estado: titulo.estado,
      indice: titulo.indice,
      itformula: titulo.itformula
        ? titulo.itformula
        : 'FP' + (titulo.ind + 1 < 10 ? '0' : '') + (titulo.ind + 1),
      monto_gru: titulo.monto_gru
        ? titulo.monto_gru
        : JSON.parse(JSON.stringify(Number(titulo.parcial) + montoci)),
      form_polinomica: titulo.arr_fp ? titulo.arr_fp : null,
      agrup_items: agrupamiento,
      arr_fp: titulo.arr_fp ? titulo.arr_fp : null,
      modificado: titulo.modificado !== null ? titulo.modificado : false,
      modificado_descripcion:
        titulo.modificado_descripcion !== null
          ? titulo.modificado_descripcion
          : false,
      tablas: titulo.tablas ? titulo.tablas : null,
      cambios: titulo.cambios ? titulo.cambios : null,
      actualizado: titulo.cambios ? titulo.cambios : true,
      ci_total: montoci,
      tablaCI: titulo.tablaCI ? tablaCI : null,
      tablaCI_titulo: tablaCI,
      total_costos: Number(titulo.parcial) + montoci,
    };
    return obj;
  }

  async tablaCostoIndirecto(string) {
    let tabla = [];
    const obj = {
      id_proyecto: this.idProyecto,
      titulos: string,
    };
    const response = await this.formulaPolinomicaService.listarCostoIndFormula(
      obj
    );
    if (response.length) {
      tabla = response;
    }
    return tabla;
  }

  async cambioVista(tab, titulosel) {
    if (tab == 2 && !titulosel.monto_gru) {
      this.toaster.error('Monto no valido', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return;
    }
    this.mostrar_carga_todo = true;
    this.vista = tab;
    this.tituloSeleccionado = titulosel;
    this.cambiosAgruCD = false;
    this.cambiosAgruCI = false;
    this.tablaMonomioValido = false;
    let guardar = false;
    if (this.vista == 2) {
      titulosel = await this.tablasAgrupTitulo(titulosel);
      // if (titulosel.tablaCI == null) {
      //   const agrupamientoItems =
      //     JSON.parse(titulosel.agrup_items).join('.|') + '.';
      //   const tablaCI_total = await this.tablaCostoIndirecto(agrupamientoItems);
      //   // const tablaCI_titulo = await this.tablaCostoIndirecto(
      //   //   titulosel.item + '.'
      //   // );
      //   let totalciAgrup = 0;
      //   // let tablaCIagrupado = [];
      //   await tablaCI_total.map((ele) => (totalciAgrup = ele.monto + totalciAgrup));
      //   // if (tablaCI_total.length) {
      //   //   tablaCIagrupado = tablaCI_total;
      //   // }
      //   // titulosel.ci_total = totalci;
      //   // titulosel.tablaCI = tablaCI_total;
      //   // titulosel.total_costos = Number(titulosel.parcial) + totalci;
      //   // titulosel.actualizado = false;
      // }
      // if (!titulosel.tablas && !titulosel.cambios) {
      //   console.log('a');

      //   const tab1 = await this.listarTablaIUxTitAlmacenado(titulosel.indice);
      //   if (tab1.length) {
      //     let sumaIndMod = 0;
      //     let sumaFactor = 0;
      //     await tab1.map((ele) => {
      //       if (!ele.vinculo) {
      //         sumaIndMod = sumaIndMod + Number(ele.indice_modificado);
      //       }
      //     });
      //     var tab2 = await this.listarAlmacenadosMonomio(titulosel.indice);
      //     await tab2.map((ele) => {
      //       if (!ele.vinculo) {
      //         sumaFactor = sumaFactor + Number(ele.factor);
      //       }
      //     });
      //     const data = {
      //       indice: titulosel.indice,
      //       tablaAgrupamiento: tab1,
      //       sumaIndMod: this.formService.redondeo(Number(sumaIndMod), 3),
      //       tablaMonomio: tab2,
      //       sumaFactor: this.formService.redondeo(Number(sumaFactor), 5),
      //     };
      //     titulosel.tablas = data;
      //     titulosel.actualizado = false;
      //   }
      // }
      // if (!titulosel.tablas) {
      //   console.log('b');
      //   const dataAgrupamiento = await this.formatoTablaAgrup(titulosel);
      //   const dataMonomio = await this.formatoTablaMonomio(
      //     titulosel,
      //     dataAgrupamiento.tabla,
      //     null,
      //     1
      //   );
      //   const data = {
      //     indice: titulosel.indice,
      //     tablaAgrupamiento: dataAgrupamiento.tabla,
      //     sumaIndMod: this.formService.redondeo(
      //       Number(dataAgrupamiento.sumaIndMod),
      //       3
      //     ),
      //     tablaMonomio: dataMonomio.tabla,
      //     sumaFactor: this.formService.redondeo(
      //       Number(dataMonomio.sumaFactor),
      //       5
      //     ),
      //   };
      //   titulosel.tablas = data;
      //   titulosel.actualizado = true;
      // } else {
      //   if (!titulosel.actualizado) {
      //     const tablaCorregida = await this.actualizarTablaAgrupamiento(
      //       titulosel
      //     );
      //     let dataMonomio = await this.formatoTablaMonomio(
      //       titulosel,
      //       tablaCorregida.nuevaTabla,
      //       null,
      //       1
      //     );
      //     if (titulosel.tablas.tablaMonomio.length) {
      //       dataMonomio = await this.actualizarTablaMonomio(
      //         JSON.parse(JSON.stringify(titulosel.tablas.tablaMonomio)),
      //         dataMonomio
      //       );
      //       dataMonomio.tabla = await this.actualizarAcumMonomios(
      //         dataMonomio.tabla
      //       );
      //     }
      //     const data = {
      //       indice: titulosel.indice,
      //       tablaAgrupamiento: tablaCorregida.nuevaTabla,
      //       sumaIndMod: this.formService.redondeo(
      //         Number(tablaCorregida.sumaIndMod),
      //         3
      //       ),
      //       tablaMonomio: dataMonomio.tabla,
      //       sumaFactor: this.formService.redondeo(
      //         Number(dataMonomio.sumaFactor),
      //         5
      //       ),
      //     };
      //     titulosel.tablas = data;
      //     titulosel.actualizado = true;
      //     if (
      //       tablaCorregida.existeCambiosCD ||
      //       tablaCorregida.existeCambiosCI
      //     ) {
      //       this.cambiosAgruCD = tablaCorregida.existeCambiosCD;
      //       this.cambiosAgruCI = tablaCorregida.existeCambiosCI;
      //       guardar = true;
      //     }
      //   } else {
      //   }
      // }
      this.listaAgrupamiento = titulosel.tablas?.tablaAgrupamiento
        ? titulosel.tablas?.tablaAgrupamiento
        : [];
      for (const iterator of this.listaAgrupamiento) {
        iterator.seleccion = false;
      }
      this.sumaIndMod = titulosel.tablas?.sumaIndMod;
      this.agrupPrelMonomios = titulosel.tablas?.tablaMonomio
        ? titulosel.tablas?.tablaMonomio
        : [];
      for (const iterator of this.agrupPrelMonomios) {
        iterator.seleccion = false;
      }

      this.sumaFactor = this.formService.redondeo(
        Number(titulosel.tablas?.sumaFactor) > 0.99
          ? 1
          : titulosel.tablas?.sumaFactor,
        5
      );
      await this.generarFormulaPolinomicaInicial();
      await this.generarFormulaPolinomicaDefinida();
      this.agrupValido = await this.verificarAgrupCumple(
        this.listaAgrupamiento
      );
      if (this.tituloSeleccionado.actualizado) {
        this.tituloSeleccionado.estado = await this.verificarEstadoTitulo(
          this.agrupValido,
          this.sumaFactor,
          this.listaAgrupamiento,
          this.agrupPrelMonomios
        );
      }
      this.tablaMonomioValido = await this.evaluarConformMon(
        this.agrupPrelMonomios,
        this.sumaFactor
      );
      if (guardar) {
        await this.guardarTemporal();
      }
    } else if (this.vista == 1) {
      this.agrupamientoSeleccionado = null;
      this.tituloSeleccionado = null;
      this.monomioSeleccionado = null;
      this.sumaFactor = null;
      this.sumaIndMod = null;
      this.agrupValido = 0;
      this.formulaPolinomicaInicial = '';
      this.formulaPolinomicaDefinida = '';
      this.arrayFP = [];
      this.arrayFPInicial = [];
      this.existTempCI = false;
      this.cambiosAgruCD = false;
      this.cambiosAgruCI = false;
      this.tablaMonomioValido = false;
    }
    this.mostrar_carga_todo = false;
  }

  async tablasAgrupTitulo(titulosel) {
    if (!titulosel.tablas) {
      const agrupamientoItems =
        JSON.parse(titulosel.agrup_items).join('.|') + '.';
      let tablaCI_total = await this.tablaCostoIndirecto(agrupamientoItems);
      let totalCD = 0;
      let CDAgrupado = 0;
      await this.titulos.map((ele) => (totalCD = totalCD + ele.parcial));
      let ind = titulosel.ind;
      CDAgrupado = CDAgrupado + titulosel.parcial;
      if (ind < this.titulos.length) {
        for (let i = titulosel.ind + 1; i < this.titulos.length; i++) {
          if (this.titulos[i].vinculo) {
            CDAgrupado = CDAgrupado + titulosel.parcial;
          } else {
            break;
          }
        }
      }
      for (const iterator of tablaCI_total) {
        iterator.monto = (iterator.monto * CDAgrupado) / totalCD;
      }

      titulosel.tablaCI = tablaCI_total;
      const dataAgrupamiento = await this.formatoTablaAgrup(titulosel);
      const dataMonomio = await this.formatoTablaMonomio(
        titulosel,
        dataAgrupamiento.tabla,
        null,
        1
      );
      const data = {
        indice: titulosel.indice,
        tablaAgrupamiento: dataAgrupamiento.tabla,
        sumaIndMod: this.formService.redondeo(
          Number(dataAgrupamiento.sumaIndMod),
          3
        ),
        tablaMonomio: dataMonomio.tabla,
        sumaFactor: this.formService.redondeo(
          Number(dataMonomio.sumaFactor),
          5
        ),
      };
      titulosel.tablas = data;
      titulosel.actualizado = true;
    } else {
    }
    return titulosel;
  }

  // async actualizarTablaAgrupamiento(titulosel) {
  //   let tablaAgrupamiento = [];
  //   let sumaIndMod = null;
  //   let existeCambiosCD = false;
  //   let existeCambiosCI = false;
  //   const tablaActua = await this.formatoTablaAgrup(titulosel);
  //   if (!titulosel.tablas?.tablaAgrupamiento) {
  //     tablaAgrupamiento = tablaActua.tabla;
  //     sumaIndMod = tablaActua.sumaIndMod;
  //   } else {
  //     let nuevaTabla = [];
  //     let total = 0;
  //     for (const fila of titulosel.tablas.tablaAgrupamiento) {
  //       fila.seleccion = 0;
  //       if (fila.tipo == 'CD') {
  //         const existeBD = tablaActua.tabla.find(
  //           (ele) => ele.id_indice == fila.id_indice && ele.tipo == 'CD'
  //         );
  //         if (existeBD) {
  //           const redondeonuevoAcu = Number(
  //             this.formService.redondeo(existeBD.acumulado, 5)
  //           );
  //           const redondeonuevoAcu2 = Number(
  //             this.formService.redondeo(fila.acumulado, 5)
  //           );
  //           if (redondeonuevoAcu2 !== redondeonuevoAcu) {
  //             existeCambiosCD = true;
  //           }
  //           fila.acumulado = existeCambiosCD
  //             ? redondeonuevoAcu
  //             : fila.acumulado;
  //           fila.montos = existeBD.montos;
  //           fila.estado = existeCambiosCD ? 3 : fila.estado;
  //           total = total + fila.acumulado;
  //           nuevaTabla.push(fila);
  //         } else {
  //           for (const ite of titulosel.tablas.tablaAgrupamiento) {
  //             if (ite.vinculo == fila.id_indice.toString() + '+' + fila.tipo) {
  //               existeCambiosCD = true;
  //               ite.vinculo = null;
  //               ite.agrupamiento = JSON.stringify([ite.id_indice]);
  //               fila.estado = 3;
  //             }
  //           }
  //         }
  //       } else {
  //         const existeBD_CI = titulosel.tablaCI.find(
  //           (ele) => ele.id_indice == fila.id_indice && ele.tipo == 'CI'
  //         );
  //         if (existeBD_CI) {
  //           const redondeonuevoAcu = Number(
  //             this.formService.redondeo(existeBD_CI.monto, 5)
  //           );
  //           const redondeonuevoAcu2 = Number(
  //             this.formService.redondeo(fila.acumulado, 5)
  //           );
  //           if (redondeonuevoAcu2 !== redondeonuevoAcu) {
  //             existeCambiosCI = true;
  //           }
  //           fila.acumulado = existeCambiosCI
  //             ? redondeonuevoAcu
  //             : fila.acumulado;
  //           fila.estado = existeCambiosCI ? 3 : fila.estado;
  //           total = total + fila.acumulado;
  //           nuevaTabla.push(fila);
  //         } else {
  //           for (const ite of titulosel.tablas.tablaAgrupamiento) {
  //             if (ite.vinculo == fila.id_indice.toString() + '+' + fila.tipo) {
  //               existeCambiosCI = true;
  //               ite.vinculo = null;
  //               ite.agrupamiento = JSON.stringify([ite.id_indice]);
  //               fila.estado = 3;
  //             }
  //           }
  //         }
  //       }
  //     }

  //     if (titulosel.tablaCI.length) {
  //       for (const fila of titulosel.tablaCI) {
  //         const filaTablaCI = nuevaTabla.find(
  //           (ele) => ele.id_indice == fila.id_indice && ele.tipo == 'CI'
  //         );
  //         if (filaTablaCI) {
  //           const redondeonuevoAcu = Number(
  //             this.formService.redondeo(filaTablaCI.acumulado, 5)
  //           );
  //           const redondeonuevoAcu2 = Number(
  //             this.formService.redondeo(fila.monto, 5)
  //           );
  //           if (redondeonuevoAcu2 !== redondeonuevoAcu) {
  //             existeCambiosCI = true;
  //           }
  //           filaTablaCI.acumulado = existeCambiosCI
  //             ? redondeonuevoAcu
  //             : fila.monto;
  //           fila.estado = existeCambiosCI ? 3 : fila.estado;
  //           total = total - filaTablaCI.acumulado + fila.monto;
  //         } else {
  //           existeCambiosCI = true;
  //           const agregar = {
  //             desc_indice: fila.desc_indice,
  //             id_indice: fila.id_indice,
  //             ind: null,
  //             indice_inicial: 0,
  //             indice_modificado: 0,
  //             acumulado: fila.monto,
  //             menor5: 0,
  //             seleccion: false,
  //             agrupamiento: JSON.stringify([fila.id_indice]),
  //             vinculo: null,
  //             montos: JSON.stringify([fila.monto]),
  //             simbolo: null,
  //             indice: titulosel.indice,
  //             mostrar: 1,
  //             icomost: 1,
  //             considerar: 1,
  //             tipo: fila.tipo,
  //           };
  //           total = total + fila.monto;
  //           nuevaTabla.unshift(agregar);
  //           fila.estado = existeCambiosCI ? 3 : fila.estado;
  //         }
  //       }
  //     }
  //     nuevaTabla.reverse();
  //     let agrup = 0;
  //     for (const row of nuevaTabla) {
  //       let porcentaje = 0;
  //       if (total > 0) {
  //         porcentaje = (100 * row.acumulado) / total;
  //       }

  //       row.indice_inicial = Number(this.formService.redondeo(porcentaje, 5));
  //       agrup = agrup + row.indice_inicial;
  //       if (!row.vinculo) {
  //         row.indice_modificado = agrup;
  //         agrup = 0;
  //       } else {
  //         row.indice_modificado = Number(
  //           this.formService.redondeo(porcentaje, 5)
  //         );
  //       }
  //       row.menor5 = row.indice_modificado < 5 ? 1 : 0;
  //     }
  //     nuevaTabla.reverse();
  //     nuevaTabla = await this.ordenarTabla(nuevaTabla, 'indice_modificado');
  //     let sumaIndMod = 0;
  //     nuevaTabla = await nuevaTabla.map((ele, index) => {
  //       ele.ind = index;
  //       if (ele.vinculo) {
  //         ele.agrupamiento = JSON.stringify([ele.id_indice]);
  //       } else {
  //         sumaIndMod = sumaIndMod + ele.indice_modificado;
  //       }
  //       return ele;
  //     });
  //     return {
  //       nuevaTabla: nuevaTabla,
  //       sumaIndMod: sumaIndMod,
  //       existeCambiosCD: existeCambiosCD,
  //       existeCambiosCI: existeCambiosCI,
  //     };
  //   }
  // }

  async ordenarTabla(tabla, parametro) {
    let tablaOrdenada = [];
    for (const iterator of tabla) {
      if (tablaOrdenada.length) {
        if (!iterator.vinculo) {
          const index = tablaOrdenada.findIndex(
            (ele) =>
              Number(ele[parametro]) < Number(iterator[parametro]) &&
              !ele.vinculo
          );
          if (index == -1) {
            tablaOrdenada.push(iterator);
          } else {
            if (index + 1 > tablaOrdenada.length) {
              tablaOrdenada.push(iterator);
            } else {
              tablaOrdenada.splice(index, 0, iterator);
            }
          }
        } else {
          const vinculoArr = iterator.vinculo.split('+');
          const ind = tablaOrdenada.findIndex(
            (ele) =>
              ele.id_indice == vinculoArr[0] &&
              ele.tipo == vinculoArr[1] &&
              ele.tipo == vinculoArr[1]
          );
          let agregado = false;
          let indValido = null;
          for (let i = ind + 1; i < tablaOrdenada.length; i++) {
            if (tablaOrdenada[i].vinculo) {
              indValido = i;
            } else {
              tablaOrdenada.splice(i, 0, iterator);
              agregado = true;
              break;
            }
          }
          if (!agregado) {
            tablaOrdenada.push(iterator);
          }
        }
      } else {
        tablaOrdenada.push(iterator);
      }
    }
    let i = 0;
    for (const iterator of tablaOrdenada) {
      iterator.ind = i;
      i++;
    }
    return tablaOrdenada;
  }

  async formatoTablaAgrup(titulo) {
    const stringTitulos = titulo.agrup_items
      ? JSON.parse(titulo.agrup_items).join('.|') + '.'
      : titulo.item + '.';
    const obj = {
      id_proyecto: this.idProyecto,
      titulos: stringTitulos,
    };
    const response =
      await this.formulaPolinomicaService.listarRelacionInsumosXTipoTitulo(obj);
    const tablaResult = await this.relacionInsumosProy(
      response[0],
      response[1],
      response[2]
    );
    let arrayAgrupamiento = [];
    let i = 0;
    for (const row of tablaResult) {
      if (row.unidad && row.id_indice && row.desc_indice) {
        const obj: agrupamientoModel = {
          desc_indice: row.desc_indice,
          id_indice: row.id_indice,
          ind: i,
          indice_inicial: 0,
          indice_modificado: 0,
          acumulado: Number(row.parcial),
          menor5: 0,
          seleccion: false,
          agrupamiento: JSON.stringify([row.id_indice]),
          vinculo: null,
          montos: JSON.stringify([row.parcial]),
          simbolo: null,
          indice: titulo.indice,
          mostrar: 1,
          icomost: 1,
          considerar: 1,
          tipo: row.tipo,
        };
        const existe = await arrayAgrupamiento.find(
          (ele) => ele.id_indice == obj.id_indice
        );
        if (!existe) {
          arrayAgrupamiento.push(obj);
          i++;
        } else {
          const acumNum =
            Number(arrayAgrupamiento[existe.ind].acumulado) +
            Number(row.parcial);
          // const acum5dig = Number(this.formService.redondeo(acumNum, 5))
          arrayAgrupamiento[existe.ind].acumulado = acumNum;
          var array = JSON.parse(arrayAgrupamiento[existe.ind].montos);
          array.push(Number(this.formService.redondeo(row.parcial, 5)));
          arrayAgrupamiento[existe.ind].montos = JSON.stringify(array);
        }
      }
    }
    // console.log('arrayAgrupamiento',JSON.parse(JSON.stringify(arrayAgrupamiento)));
    let acumuladoTot = 0;
    arrayAgrupamiento.map(
      (ele) => (acumuladoTot = Number(ele.acumulado) + acumuladoTot)
    );
    const objAgrup = await this.nuevaTablaAgrupamiento(
      titulo,
      arrayAgrupamiento
    );
    const dat = {
      tabla: objAgrup.tablaAgrupamiento,
      sumaIndMod: this.formService.redondeo(objAgrup.sumaIndMod, 5),
    };
    return dat;
  }

  async nuevaTablaAgrupamiento(titulo, tablaAgrupamiento) {
    let totalTitulosAgrupados = 0;
    let totalCI = 0;
    if (titulo.tablaCI?.length) {
      for (const fila of titulo.tablaCI) {
        const existeTablAgrup = tablaAgrupamiento.find(
          (ele) => ele.id_indice == fila.id_indice && fila.tipo == ele.tipo
        );
        if (!existeTablAgrup) {
          const agregar = {
            desc_indice: fila.desc_indice,
            id_indice: fila.id_indice,
            ind: null,
            indice_inicial: 0,
            indice_modificado: 0,
            acumulado: fila.monto,
            menor5: 0,
            seleccion: false,
            agrupamiento: JSON.stringify([fila.id_indice]),
            vinculo: null,
            montos: JSON.stringify([fila.monto]),
            simbolo: null,
            indice: titulo.indice,
            mostrar: 1,
            icomost: 1,
            considerar: 1,
            tipo: fila.tipo,
          };
          // totalTitulosAgrupados = totalTitulosAgrupados + fila.monto
          tablaAgrupamiento.unshift(agregar);
          totalCI = totalCI + agregar.acumulado;
        } else {
          // totalTitulosAgrupados = totalTitulosAgrupados - existeTablAgrup.acumulado + fila.monto
          existeTablAgrup.acumulado = fila.monto;
        }
      }
    }
    await tablaAgrupamiento.map((ele) => {
      totalTitulosAgrupados = ele.acumulado + totalTitulosAgrupados;
    });
    totalTitulosAgrupados = Number(
      this.formService.redondeo(totalTitulosAgrupados, 5)
    );
    let sumaIndMod = 0;
    let prueba = 0;
    let sumaAcum = 0;
    for (const row of tablaAgrupamiento) {
      let porcentaje = 0;
      if (totalTitulosAgrupados > 0) {
        porcentaje = (100 * row.acumulado) / totalTitulosAgrupados;
      }
      sumaAcum = sumaAcum + row.acumulado;
      prueba = row.acumulado + prueba;
      sumaIndMod = sumaIndMod + (isNaN(porcentaje) ? 0 : porcentaje);
      row.indice_modificado = Number(
        this.formService.redondeo(isNaN(porcentaje) ? 0 : porcentaje, 5)
      );
      row.indice_inicial = Number(
        this.formService.redondeo(isNaN(porcentaje) ? 0 : porcentaje, 5)
      );
      row.menor5 = porcentaje < 5 ? 1 : 0;
    }
    tablaAgrupamiento.sort(function (a, b) {
      if (a.indice_inicial > b.indice_inicial) return -1;
      if (a.indice_inicial < b.indice_inicial) return 1;
    });
    tablaAgrupamiento = await tablaAgrupamiento.map((ele, index) => {
      ele.ind = index;
      return ele;
    });
    return { tablaAgrupamiento: tablaAgrupamiento, sumaIndMod: sumaIndMod };
  }

  async actualizarTablaMonomio(tablaMonoAlmac, dataActualizada) {
    let nuevaTablaMon1 = JSON.parse(JSON.stringify(tablaMonoAlmac));
    let nuevaTablaMon = [];
    let factorAcumulado = 0;
    for (const iterator of nuevaTablaMon1) {
      const existe = dataActualizada.tabla.find(
        (ele) =>
          ele.id_indice == iterator.id_indice && ele.tipo == iterator.tipo
      );
      if (existe) {
        nuevaTablaMon.push(iterator);
      }
    }
    for (const iterator of dataActualizada.tabla) {
      const existe = nuevaTablaMon1.find(
        (ele) =>
          ele.id_indice == iterator.id_indice && ele.tipo == iterator.tipo
      );
      if (!existe) {
        nuevaTablaMon.push(iterator);
      }
    }
    let i = 0;

    for (const iterator of nuevaTablaMon) {
      iterator.seleccion = false;
      iterator.ind = i;
      const existe = dataActualizada.tabla.find(
        (ele) =>
          ele.id_indice == iterator.id_indice && ele.tipo == iterator.tipo
      );
      // console.log('existe', existe)
      if (existe) {
        iterator.factor_inicial = existe.factor_inicial;
        // iterator.factor = existe.factor_inicial;
        factorAcumulado = factorAcumulado + Number(iterator.factor_inicial);
      } else {
        iterator.vinculo = null;
        iterator.agrupamiento = JSON.stringify([iterator.id_indice]);
      }
      i++;
    }
    let acumulado = 0;
    let indices = [];
    for (let j = nuevaTablaMon.length - 1; j >= 0; j--) {
      let element = nuevaTablaMon[j];
      acumulado = acumulado = acumulado + Number(element.factor_inicial);
      indices.push(j);

      if (!element.vinculo) {
        for (const ind of indices) {
          (nuevaTablaMon[ind].factor = acumulado), 3;
        }
        indices = [];
        acumulado = 0;
      }
    }
    return {
      tabla: nuevaTablaMon,
      sumaFactor: this.formService.redondeo(factorAcumulado, 5),
    };
  }

  async filtroTitulos() {
    const titulosFiltrados = await this.titulos.filter((ele) => !ele.vinculo);
    this.titulosFiltrados = titulosFiltrados;
  }

  msjValidezTablaMono() {
    let msj = '';
    let arrayAcu = [];
    const cantidad = this.agrupPrelMonomios.filter((ele) => !ele.vinculo);
    if (cantidad.length > 8) {
      msj = 'TABLA MONOMIO INCORRECTA, cantidad de fila tabla mayor a 8';
    } else {
      for (const iterator of this.agrupPrelMonomios) {
        if (arrayAcu.includes(iterator.id_indice)) {
          msj =
            'TABLA MONOMIO INCORRECTA , existe 2 filas con el indice  ' +
            iterator.id_indice;
        } else {
          arrayAcu.push(iterator.id_indice);
        }
      }
    }

    return msj;
  }

  async evaluarConformMon(tablaMonomio, sumaFactor) {
    let valido = true;
    let arrayAcu = [];
    // for (const iterator of tablaMonomio) {
    //   if (arrayAcu.includes(iterator.id_indice)) {
    //     valido = false;
    //     break;
    //   } else {
    //     arrayAcu.push(iterator.id_indice);
    //   }
    // }
    // if (Number(sumaFactor) < 1) {
    //   valido = false;
    // }
    const cantidad = tablaMonomio.filter((ele) => !ele.vinculo);
    if (cantidad.length > 8) {
      valido = false;
    } else {
      if (Number(sumaFactor) < 1) {
        valido = false;
      }
    }
    if (!this.agrupValido) {
      valido = false;
    }
    return valido;
  }

  async guardarCambios() {
    try {
      if (!this.existeTempFP) {
        this.toaster.info('Ningun cambio registrado para guardar', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      }
      const modificados = await this.titulos.filter(
        (ele) => ele.modificado || !ele.tablas
      );
      if (modificados.length) {
        this.mostrar_carga_todo = true;
        let tablatit: tituloFP[] = [];
        let tablaagrup = [];
        let tablamono = [];
        let arrayEliminado = [];
        tablatit = this.titulos;
        // for (const titulosel of tablatit) {
        //   if (!titulosel.vinculo && !titulosel.tablas) {
        //     if (titulosel.tablaCI == null) {
        //       const agrupamientoItems =
        //         JSON.parse(titulosel.agrup_items).join('.|') + '.';
        //       const tablaCI_total = await this.tablaCostoIndirecto(
        //         agrupamientoItems
        //       );
        //       const tablaCI_titulo = await this.tablaCostoIndirecto(
        //         titulosel.item + '.'
        //       );

        //       let totalci = 0;
        //       let tablaCIagrupado = [];
        //       await tablaCI_titulo.map(
        //         (ele) => (totalci = ele.monto + totalci)
        //       );
        //       if (tablaCI_total.length) {
        //         tablaCIagrupado = tablaCI_total;
        //       }
        //       titulosel.ci_total = totalci;
        //       titulosel.tablaCI = tablaCI_total;
        //       titulosel.total_costos = Number(titulosel.parcial) + totalci;
        //       titulosel.actualizado = false;
        //     }
        //     if (!titulosel.tablas) {
        //       const tab1 = await this.listarTablaIUxTitAlmacenado(
        //         titulosel.indice
        //       );
        //       if (tab1.length) {
        //         let sumaIndMod = 0;
        //         let sumaFactor = 0;
        //         await tab1.map((ele) => {
        //           if (!ele.vinculo) {
        //             sumaIndMod = sumaIndMod + Number(ele.indice_modificado);
        //           }
        //         });
        //         var tab2 = await this.listarAlmacenadosMonomio(
        //           titulosel.indice
        //         );
        //         await tab2.map((ele) => {
        //           if (!ele.vinculo) {
        //             sumaFactor = sumaFactor + Number(ele.factor);
        //           }
        //         });
        //         const data = {
        //           indice: titulosel.indice,
        //           tablaAgrupamiento: tab1,
        //           sumaIndMod: this.formService.redondeo(Number(sumaIndMod), 3),
        //           tablaMonomio: tab2,
        //           sumaFactor: this.formService.redondeo(Number(sumaFactor), 5),
        //         };
        //         titulosel.tablas = data;
        //         titulosel.actualizado = false;
        //       }
        //     }
        //     if (!titulosel.tablas) {
        //       const dataAgrupamiento = await this.formatoTablaAgrup(titulosel);
        //       const dataMonomio = await this.formatoTablaMonomio(
        //         titulosel,
        //         dataAgrupamiento.tabla,
        //         null,
        //         1
        //       );
        //       const data = {
        //         indice: titulosel.indice,
        //         tablaAgrupamiento: dataAgrupamiento.tabla,
        //         sumaIndMod: this.formService.redondeo(
        //           Number(dataAgrupamiento.sumaIndMod),
        //           3
        //         ),
        //         tablaMonomio: dataMonomio.tabla,
        //         sumaFactor: this.formService.redondeo(
        //           Number(dataMonomio.sumaFactor),
        //           5
        //         ),
        //       };
        //       titulosel.tablas = data;
        //       titulosel.actualizado = true;
        //     } else {

        //     }
        //   }
        // }

        for (const titulosel of tablatit) {
          // if (titulosel.vinculo || titulosel.cambios) {
          arrayEliminado.push(titulosel.indice);
          // } else {
          // const encontrado = await this.titulos.find(
          //   (ele) => ele.indice == titulosel.indice
          // );
          if (titulosel.tablas?.tablaMonomio) {
            tablamono = tablamono.concat(titulosel.tablas?.tablaMonomio);
            let indices = []
            for (const element of tablamono) {
              if (!indices.includes(element.id_indice)) {
                indices.push(element.id_indice)
              } else {
                this.mostrar_carga_todo = false;
                this.toaster.error('No se puede guardar por el titulo : ' + titulosel.descripcion + ' la tabla monomio contiene 2 filas con el mismo indice unificado : ' + element.id_indice, 'INCORRECTO', {
                  closeButton: false,
                  positionClass: 'toast-bottom-right',
                  timeOut: 10000,
                });
                return
              }
            }
          }
          if (titulosel.tablas?.tablaAgrupamiento) {
            tablaagrup = tablaagrup.concat(titulosel.tablas?.tablaAgrupamiento);
          }
          // }
        }
        // console.log('tablatit', tablatit)
        this.formulaPolinomicaInicial = '';
        this.formulaPolinomicaDefinida = '';
        this.arrayFP = [];
        this.arrayFPInicial = [];
        const id_proyecto = this.idProyecto;
        const id_usuario = this.iduser;
        const limpiar = arrayEliminado.join('|');
        const datos1 = JSON.stringify(tablatit);
        const datos2 = JSON.stringify(tablaagrup);
        const datos3 = JSON.stringify(tablamono);
        // console.log('id_proyecto', id_proyecto);
        // console.log('id_usuario', id_usuario);
        // console.log('limpiar', limpiar);
        // console.log('tablatit', tablatit);
        // console.table(tablaagrup, ['id_indice', 'desc_indice', 'agrupamiento', 'vinculo', 'tipo']);
        // console.table(tablamono, ['id_indice', 'desc_indice', 'agrupamiento', 'vinculo', 'tipo']);
        const obj = JSON.stringify({
          id_proyecto: id_proyecto,
          id_usuario: id_usuario,
          limpiar: limpiar,
          datos1: datos1,
          datos2: datos2,
          datos3: datos3,
        });
        const response =
          await this.formulaPolinomicaService.guardarCambiosFormulaPolinomica(
            obj
          );
        if (response.id == '1') {
          await this.eliminarTemporal();
          await this.reiniciarValores();
          await this.recuperarTempIndirecto();
          await this.verificarCambiosPresupuesto();
          await this.listarIndicesUnificados();
          await this.tablaInsumos();
          await this.evaluarDataIniFP();
          this.toaster.success('Se guardo correctamente', 'Éxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
        } else {
          this.mostrar_carga_todo = false;
          SwalService.error('ERROR', response.mensaje);
        }
        this.mostrar_carga_todo = false;
      } else {
        this.toaster.info('Ningun cambio registrado para guardar', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      }
    } catch (error) {
      console.log('error', error);

      SwalService.error();
    }
  }

  async descartarTodosLoscambios() {
    const temporal = await this.listarTemporal();
    if (temporal) {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        null,
        'Se descartará todos los cambios sin guardar realizados.'
      );
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        await this.eliminarTemporal();
        await this.reiniciarValores();
        await this.recuperarTempIndirecto();
        await this.verificarCambiosPresupuesto();
        await this.listarIndicesUnificados();
        await this.tablaInsumos();
        await this.evaluarDataIniFP();
        this.mostrar_carga_todo = false;
        this.toaster.success('Se descartò correctamente', 'Éxito', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
      }
    } else {
      this.toaster.info('Ningun cambio registrado para descartar', null, {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return;
    }
  }

  reiniciarValores() {
    this.vista = 1;
    this.tabSeleccionado = 1;
    this.listaInsumos = [];
    this.listaIndicesUnificados = [];
    this.displayBasic2 = false;
    this.indUniSeleccionado = null;
    this.agrupamientoSeleccionado = null;
    this.listaAgrupamiento = [];
    this.listaEstructuraModificada = [];
    this.subvista = 1;
    this.titEstructSelect = null;
    this.tituloSeleccionado = null;
    this.titulosEstructurados = [];
    this.filtradosTitulos = [];
    this.monomioSeleccionado = null;
    this.agrupPrelMonomios = [];
    this.sumaFactor = '0.00000';
    this.sumaIndMod = '0.00000';
    this.agrupValido = 0;
    this.formulaPolinomicaInicial = '';
    this.formulaPolinomicaDefinida = '';
    this.arrayFP = [];
    this.arrayFPInicial = [];
    this.cambiosAgruCD = false;
    this.cambiosAgruCI = false;
    this.tituloSeleccionado = null;
    this.tituloSlider = null;
  }

  async generarReporte(tipo) {
    if (this.existeTempFP || this.disabAcciones || this.existTempCI) {
      let msj = [];
      if (this.existeTempFP) {
        msj.push('- Formula Polinomica');
      }
      if (this.disabAcciones) {
        msj.push('- Edicion de Presupuesto');
      }
      if (this.existTempCI) {
        msj.push('-Diseño de costos indirectos');
      }
      this.toaster.error(
        ' Guarde o descarte los cambios en :<br>' + msj.join(' <br>'),
        null,
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
          enableHtml: true,
        }
      );
      return;
    } else {
      this.mostrar_carga_todo = true;
      let tabla = [];
      let arrayHeader = [];
      const h1 = [
        { text: 'DETALLE DE ESTRUCTURA POR TÍTULO', colSpan: 1, rowSpan: 2 },
        { text: 'ESTRUCTURA INICIAL', colSpan: 4, rowSpan: 1 },
        { text: 'ESTRUCTURA MODIFICADA', colSpan: 4, rowSpan: 1 },
        { text: 'ESTADO FP', colSpan: 1, rowSpan: 2 },
      ];
      arrayHeader.push(h1);
      const h2 = [
        { text: 'T. CD', colSpan: 1, rowSpan: 1 },
        { text: 'T. CI', colSpan: 1, rowSpan: 1 },
        { text: 'TOTAL COSTOS', colSpan: 1, rowSpan: 1 },
        { text: 'FP', colSpan: 1, rowSpan: 1 },
        { text: 'MONTO', colSpan: 1, rowSpan: 1 },
        { text: 'FP', colSpan: 1, rowSpan: 1 },
        { text: ' AGRUPAMIENTO FP', colSpan: 1, rowSpan: 1 },
        { text: 'DENOMINACIÓN', colSpan: 1, rowSpan: 1 },
      ];
      arrayHeader.push(h2);
      const keys_body = [
        'detalle_estructura',
        'total_CD',
        'total_CI',
        'total_costos',
        'itemfp',
        'monto_gru',
        'itformula',
        'agrupamiento',
        'denominacion',
        'estado',
      ];
      const col_alig = [
        'left',
        'right',
        'right',
        'right',
        'center',
        'right',
        'center',
        'center',
        'left',
        'center',
      ];
      const colores = ['#ff5252', '#11c15b', '#ffe100', '#ae5229'];
      const estados = ['REALIZADO', 'APROBADO', 'INCOMPLETO', 'DESACTUALIZADO'];
      if (tipo == 0) {
        for (const row of this.titulos) {
          const arreglo = row.agrupamiento ? JSON.parse(row.agrupamiento) : [];
          const obj = {
            detalle_estructura: row.item + ' ' + row.descripcion,
            total_CD: this.formService.redondeo(row.parcial, 2),
            total_CI: this.formService.redondeo(row.ci_total, 2),
            total_costos: this.formService.redondeo(row.total_costos, 2),
            itemfp: row.itemfp,
            monto_gru: !row.vinculo
              ? this.formService.redondeo(row.monto_gru, 2)
              : '',
            itformula: !row.vinculo ? row.itformula : '',
            agrupamiento: !row.vinculo ? arreglo.join('+') : '',
            denominacion: !row.vinculo ? row.denominacion : '',
            vinculo: row.vinculo,
            estado: estados[row.estado],
            tipoletra: row.vinculo ? '1' : '3',
            alinea: '',
            fondo: !row.vinculo ? colores[row.estado] : '',
          };
          tabla.push(obj);
        }
      }
      const datos = {
        datos_proyecto: this.datosproy,
        header: arrayHeader,
        keys_body: keys_body,
        col_alig: col_alig,
        tabla: tabla,
        concat_tabla2: false,
        tipo_reporte: 5,
        orientacion: '',
        moneda: this.simbolo, // condicionar
        titulo: 'FORMULA POLINÓMICA',
      };
      // console.log('datos', JSON.parse(JSON.stringify(datos)));
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
  }

  async reporteFormulaXTitulo() {
    try {
      this.mostrar_carga_todo = true;
      setTimeout(async () => {
        let arrayHeaderAgrup = [
          [{ text: 'AGRUPAMIENTO', colSpan: 7, rowSpan: 1 }],
          [
            { text: 'IND.', colSpan: 1, rowSpan: 1 },
            { text: 'DESCRIPCION DE I.U.', colSpan: 1, rowSpan: 1 },
            { text: 'TIPO', colSpan: 1, rowSpan: 1 },
            { text: '% INDICE INICIAL', colSpan: 1, rowSpan: 1 },
            { text: 'INDICE MODIFICADO', colSpan: 1, rowSpan: 1 },
            { text: 'DESCRIPCION DE INDICE UNIFICADO', colSpan: 1, rowSpan: 1 },
            { text: '> AL %5', colSpan: 1, rowSpan: 1 },
          ],
        ];
        let arrayHeaderMon = [
          [{ text: 'MONOMIOS', colSpan: 7, rowSpan: 1 }],
          [
            { text: 'MONOMIO', colSpan: 1, rowSpan: 1 },
            { text: 'FACTOR%', colSpan: 1, rowSpan: 1 },
            { text: '%ACUM.', colSpan: 1, rowSpan: 1 },
            { text: 'SIMBOLO', colSpan: 1, rowSpan: 1 },
            { text: 'IU', colSpan: 1, rowSpan: 1 },
            { text: 'TIPO', colSpan: 1, rowSpan: 1 },
            { text: 'DESCRIPCION DE INDICE UNIFICADO', colSpan: 1, rowSpan: 1 },
          ],
        ];
        let arrayHeaderTitulo = [];
        const h1 = [
          { text: 'DETALLE DE ESTRUCTURA POR TÍTULO', colSpan: 1, rowSpan: 2 },
          { text: 'ESTRUCTURA INICIAL', colSpan: 2, rowSpan: 1 },
          { text: 'ESTRUCTURA MODIFICADA', colSpan: 4, rowSpan: 1 },
        ];
        arrayHeaderTitulo.push(h1);
        const h2 = [
          { text: 'TOTAL COSTOS', colSpan: 1, rowSpan: 1 },
          { text: 'FP', colSpan: 1, rowSpan: 1 },
          { text: 'MONTO', colSpan: 1, rowSpan: 1 },
          { text: 'FP', colSpan: 1, rowSpan: 1 },
          { text: ' AGRUPAMIENTO FP', colSpan: 1, rowSpan: 1 },
          { text: 'DENOMINACIÓN', colSpan: 1, rowSpan: 1 },
        ];
        arrayHeaderTitulo.push(h2);
        const keys_body_titulo = [
          'detalle_estructura',
          'total_costos',
          'itemfp',
          'monto_gru',
          'itformula',
          'agrupamiento',
          'denominacion',
        ];
        const col_alig_titulo = [
          'left',
          'right',
          'center',
          'right',
          'center',
          'center',
          'left',
        ];

        const keys_body_mon = [
          'monomio',
          'factor',
          'acumulado',
          'simbolo',
          'id_indice',
          'tipo',
          'agrupamiento',
        ];
        const keys_body_agrup = [
          'id_indice',
          'desc_indice',
          'tipo',
          'indice_inicial',
          'indice_modificado',
          'agrupamiento',
          'menor5',
        ];
        const col_alig_mon = [
          'center',
          'right',
          'center',
          'center',
          'center',
          'center',
          'left',
        ];
        const col_alig_agrup = [
          'center',
          'left',
          'center',
          'right',
          'right',
          'center',
          'center',
        ];

        let tablaTitulo = [];
        const arreglo = JSON.parse(this.tituloSeleccionado.vinculados_arr);
        for (const row of this.titulos) {
          if (arreglo.includes(row.indice)) {
            const arreglo = row.agrupamiento
              ? JSON.parse(row.agrupamiento)
              : [];
            const obj = {
              detalle_estructura: row.item + ' ' + row.descripcion,

              total_costos: this.formService.redondeo(row.total_costos, 2),
              itemfp: row.itemfp,
              monto_gru: !row.vinculo
                ? this.formService.redondeo(row.monto_gru, 2)
                : '',
              itformula: !row.vinculo ? row.itformula : '',
              agrupamiento: !row.vinculo ? arreglo.join('+') : '',
              denominacion: !row.vinculo ? row.denominacion : '',
              vinculo: row.vinculo,
              tipoletra: row.vinculo ? '1' : '3',
              alinea: '',
              fondo: '',
            };
            tablaTitulo.push(obj);
          }
        }
        let tablaMon = [];
        let tablaAgrup = [];
        for (const iterator of this.agrupPrelMonomios) {
          const obj = {
            monomio: iterator.vinculo ? '' : iterator.monomio,
            vinculo: iterator.vinculo,
            factor: iterator.vinculo
              ? ''
              : this.formService.redondeo(Number(iterator.factor), 3),
            acumulado:
              this.formService.redondeo(Number(iterator.acumulado), 3) + '%',
            simbolo: iterator.vinculo ? '' : iterator.simbolo,
            id_indice: iterator.id_indice,
            tipo: {
              text: iterator.tipo,
              fondo: iterator.tipo == 'CI' ? '#6c757d' : '#00bcd4',
            },
            agrupamiento: iterator.desc_indice,
            tipoletra: iterator.vinculo ? '' : '3',
            alinea: '',
            fondo: '',
          };
          tablaMon.push(obj);
        }
        tablaMon.push({
          monomio: '',
          vinculo: '',
          factor: this.formService.redondeo(Number(this.sumaFactor), 3),
          acumulado: '',
          simbolo: '',
          id_indice: '',
          tipo: '',
          agrupamiento: '',
          tipoletra: '3',
          alinea: '',
          fondo: '#dfdfdf',
        });
        for (const iterator of this.listaAgrupamiento) {
          const array = iterator.agrupamiento
            ? JSON.parse(iterator.agrupamiento)
            : [];
          const obj = {
            id_indice: iterator.id_indice,
            vinculo: iterator.vinculo,
            desc_indice: iterator.desc_indice,
            tipo: {
              text: iterator.tipo,
              fondo: iterator.tipo == 'CI' ? '#6c757d' : '#00bcd4',
            },
            indice_inicial: {
              text: this.formService.redondeo(iterator.indice_inicial, 3),
              fondo: iterator.indice_inicial >= 5 ? '#fda484' : '',
            },
            indice_modificado: this.formService.redondeo(
              iterator.indice_modificado,
              3
            ),
            agrupamiento: iterator.vinculo ? '' : array.join('+'),
            menor5: {
              text: !iterator.menor5 ? 'SI' : 'NO',
              fondo: !iterator.menor5 ? '#11c15b' : '',
            },
            tipoletra: iterator.vinculo ? '' : '3',
            alinea: '',
            fondo: '',
          };
          tablaAgrup.push(obj);
        }
        tablaAgrup.push({
          id_indice: '',
          vinculo: '',
          desc_indice: 'TOTAL',
          tipo: '',
          indice_inicial: '100.000',
          indice_modificado: this.sumaIndMod,
          agrupamiento: '',
          menor5: this.agrupValido ? 'SI CUMPLE' : 'NO CUMPLE',
          tipoletra: '3',
          alinea: '',
          fondo: '#dfdfdf',
        });
        let formula = document.getElementById('text-formula');
        formula.style.width = 'max-content';
        let cadena = document.getElementById('formula-elementos');
        cadena.style.flexFlow = null;
        let image;
        await html2canvas(formula, { scale: 3 }).then((canvas) => {
          const imageData = canvas.toDataURL('image/png');
          image = imageData;
          // const link = document.createElement('a');
          // link.setAttribute('download', 'screenshot.png');
          // link.setAttribute('href', imageData);
          // link.click();
        });
        formula.style.removeProperty('width');
        cadena.style.flexFlow = 'wrap';
        const obj = {
          text1: 'Fórmula Polinómica Inicial, Sin agrupamiento de Monomios',
          estado1: this.agrupValido ? 'Conforme' : 'No Conforme',
          fp_inicial: this.arrayFPInicial,
          text2: 'Fórmula Polinómica Definida',
          estado2: this.tablaMonomioValido ? 'Conforme' : 'No Conforme',
          fp_definida: this.arrayFP,
          text_fp: this.tituloSeleccionado.arr_fp,
        };
        const datos = {
          datos_proyecto: this.datosproy,
          header: arrayHeaderMon,
          header2: arrayHeaderAgrup,
          header3: arrayHeaderTitulo,
          keys_body: keys_body_mon,
          keys_body2: keys_body_agrup,
          keys_body3: keys_body_titulo,
          col_alig: col_alig_mon,
          col_alig2: col_alig_agrup,
          col_alig3: col_alig_titulo,
          tabla: tablaMon,
          tabla3: tablaAgrup,
          tabla4: tablaTitulo,
          concat_tabla2: false,
          tipo_reporte: 5,
          orientacion: '',
          moneda: this.simbolo, // condicionar
          titulo: 'FORMULA POLINÓMICA',
          img_formula: image,
          data_fp: obj,
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
      }, 50);
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.log(error);
      SwalService.error();
    }
  }

  alertaMaxFormulas() {
    let valido = false;
    const cantidad = this.titulos.filter((ele) => !ele.vinculo);
    if (cantidad.length > 4) {
      valido = true;
    }
    return valido;
  }
}
