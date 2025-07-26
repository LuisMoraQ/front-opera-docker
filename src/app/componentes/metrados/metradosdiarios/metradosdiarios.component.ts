import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from 'src/app/servicios/swal.service';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import {
  arraydcols,
  arraygcols,
  arrayicols,
} from '../../proyectos/principal/hoja-metrados/modal-metrado-excel/metrado';
import { AnchocolDirective } from 'src/app/directivas/anchocol.directive';
import Swal from 'sweetalert2';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Component({
  selector: 'app-metradosdiarios',
  templateUrl: './metradosdiarios.component.html',
  styleUrls: ['./metradosdiarios.component.scss'],
})
export class MetradosdiariosComponent implements OnInit {
  subvista = 1;
  scrollbut = false;
  simbolo;
  prueba;
  id_proyecto;
  solover;
  moneda;
  decima;
  colores;
  tipoProy;
  id_userproy;
  nomproy = '';
  mostrar_carga_todo = false;
  mostrar_carga = false;
  @ViewChild('p3') public popover3: NgbPopover;
  @ViewChild('modalHojas') modalHojas: ModalBasicComponent;
  @ViewChild('modalEstado') modalEstado: ModalBasicComponent;
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
  }
  constructor(
    private toaster: ToastrService,
    public metradoService: MetradoService,
    public principalService: PrincipalService,
    public formsService: FormsService
  ) {}

  dataSource1 = [];
  id_registro;
  id_registro2;
  async ngOnInit() {
    this.ordenarPorFechaInicio(true);
  }
  async ordenarPorFechaInicio(bool = false) {
    this.dataSource1 = await this.metradoService.listarRegistroMetrados({
      id_proyecto: this.id_proyecto,
    });
    if (bool) {
      this.id_registro =
        this.dataSource1.length > 0
          ? this.dataSource1[this.dataSource1.length - 1].id_registro + 1
          : 1;
    }
    this.dataSource1 = this.dataSource1.slice().sort((a, b) => {
      return new Date(a.fechaini).getTime() - new Date(b.fechaini).getTime();
    });
    return this.dataSource1;
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambioVista(ind: any) {
    this.subvista = ind;
  }
  closeModal() {
    this.modalHojas.hide();
  }
  openModal2(datos = null) {
    if (datos != null) {
      this.id_registro2 = datos.id_registro;
      this.formEstado.get('detalle2').setValue(datos?.detalle);
      this.formEstado.get('estado').setValue(datos?.estado);
      this.modalEstado.show();
    }
  }
  closeModal2() {
    this.modalEstado.hide();
  }
  formHojas = new UntypedFormGroup({
    detalle: new UntypedFormControl('', [Validators.required]),
    fechaini: new UntypedFormControl('', [Validators.required]),
    fechafin: new UntypedFormControl('', [Validators.required]),
  });
  get detalle(): UntypedFormControl {
    return this.formHojas.get('detalle') as UntypedFormControl;
  }
  get fechaini(): UntypedFormControl {
    return this.formHojas.get('fechaini') as UntypedFormControl;
  }
  get fechafin(): UntypedFormControl {
    return this.formHojas.get('fechafin') as UntypedFormControl;
  }
  formEstado = new UntypedFormGroup({
    detalle2: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('', [Validators.required]),
    observacion: new UntypedFormControl('', [Validators.required]),
  });
  get detalle2(): UntypedFormControl {
    return this.formEstado.get('detalle2') as UntypedFormControl;
  }
  get estado(): UntypedFormControl {
    return this.formEstado.get('estado') as UntypedFormControl;
  }
  get observacion(): UntypedFormControl {
    return this.formEstado.get('observacion') as UntypedFormControl;
  }
  validarFechasFila(fechaini: string, fechafin: string): boolean {
    if (!fechaini || !fechafin) return false;
    const ini = new Date(fechaini);
    const fin = new Date(fechafin);
    return ini < fin;
  }
  validarSolapFechas(array, newdate): boolean {
    const nuevoIni = new Date(newdate.fechaini);
    const nuevoFin = new Date(newdate.fechafin);

    for (const r of array) {
      const ini = new Date(r.fechaini);
      const fin = new Date(r.fechafin);
      const seCruzan = nuevoIni <= fin && ini <= nuevoFin;
      if (seCruzan) {
        return false;
      }
    }
    return true;
  }
  async almacenar() {
    try {
      if (this.formHojas.invalid) {
        this.formHojas.markAllAsTouched();
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
        return;
      } else {
        const datos = {
          id_proyecto: this.id_proyecto,
          id_registro: this.id_registro,
          detalle: this.formHojas.get('detalle').value.toUpperCase(),
          fechaini: this.formHojas.get('fechaini').value,
          fechafin: this.formHojas.get('fechafin').value,
        };
        if (!this.validarFechasFila(datos.fechaini, datos.fechafin)) {
          SwalService.error(
            'Error',
            'La fecha fin debe ser mayor a la fecha inicio.'
          );
          return;
        }
        if (!this.validarSolapFechas(this.dataSource1, datos)) {
          SwalService.error(
            'Error',
            'El nuevo intervalo de fecha tiene un conflicto con otro ya registrado.'
          );
          return;
        }
        this.mostrar_carga_todo = true;
        const respuesta = await this.metradoService.guardarRegistroMetrado(
          datos
        );
        if (respuesta[0].id == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          this.id_registro++;
          await this.ordenarPorFechaInicio();
          this.mostrar_carga_todo = false;
          this.closeModal();
        } else {
          SwalService.error('Advertencia', respuesta[0].mensaje);
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error();
    }
  }
  async OpenModal() {
    this.modalHojas.show();
  }
  async almacenar2() {
    try {
      if (this.formEstado.invalid) {
        this.formEstado.markAllAsTouched();
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
        return;
      } else {
        this.mostrar_carga_todo = true;
        const datos = {
          id_proyecto: this.id_proyecto,
          id_registro: this.id_registro2,
          observacion: this.formEstado.get('observacion').value,
          estado: this.formEstado.get('estado').value,
        };
        const respuesta = await this.metradoService.actEstadoRegistroMetrado(
          datos
        );
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          await this.ordenarPorFechaInicio();
          this.closeModal2();
        } else {
          SwalService.error('Advertencia', respuesta[0].mensaje);
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error();
    }
  }
  async eliminarHoja(row) {
    try {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se eliminarà la fila selecionada'
      );
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const edatos = {
          id_proyecto: this.id_proyecto,
          id_registro: row.id_registro,
        };
        const respuesta = await this.metradoService.eliminarRegistroMetrado(
          edatos
        );
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == '1') {
          SwalService.success();
          await this.ordenarPorFechaInicio();
        } else {
          SwalService.error('Advertencia', respuesta.mensaje);
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err);
    }
  }
  async changeVista(datos) {
    this.cambioVista(2);
    const aspectos = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.id_proyecto,
    });
    this.id_registroact = datos.id_registro;
    this.diasCalendario = await this.generateCalendar(
      datos.fechaini,
      datos.fechafin,
      aspectos[0],
      aspectos[1]
    );
    this.fechaselecionada = this.diasCalendario[0].fecha;    
    await this.listarTitulos();
  }
  diasCalendario;
  async MostrarTotales(array){
    const valores=array.split('/').map(Number);
    let suma = 0;
    for(let k=0;k<this.diasCalendario.length;k++){
        const value = k==0&&valores[k]==0? null:valores[k] ?? null;
        suma += value??0;
        this.diasCalendario[k].value=value
    }
  }
  async generateCalendar(fechaini: string,fechafin: string,jornada: any[],feriados: any[]) {
    const start = new Date(fechaini);
    start.setDate(start.getDate() + 1);
    const end = new Date(fechafin);
    end.setDate(end.getDate() + 1);
    const diasNoLaborables = jornada[0]?.nolabo1 || [];
    const diasNoLaborables2 = jornada[0]?.nolabo2 || [];
    const feriadosMap = new Set(
      feriados.map((f) => new Date(f.fecha).toDateString())
    );
    const dias: any[] = [];
    let current = new Date(start);
    while (current <= end) {
      const dayNumber = current.getDay();
      const dayLetters = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
      const diaLetra = dayLetters[dayNumber];
      const nombreDia = current
        .toLocaleDateString('es-PE', { weekday: 'long' })
        .toUpperCase();
      const esDomingo = diasNoLaborables.includes(nombreDia);
      const NoLabo = diasNoLaborables2.includes(nombreDia);
      const esFeriado = feriadosMap.has(current.toDateString());
      dias.push({
        fecha: new Date(current),
        dia: current.getDate(),
        letraDia: diaLetra,
        bloqueado: esDomingo || esFeriado || NoLabo,
        value:null,
      });
      current = new Date(current.setDate(current.getDate() + 1));
    }
    return dias;
  }
  tablaTitResumen;
  indiceTitulo;
  async listarTitulos() {
    const obj = {
      id_proyecto: this.id_proyecto,
    };
    const response = await this.metradoService.listarTitulosDeMetrados(obj);
    if (response.length) {
      this.tablaTitResumen = response;
      this.indiceTitulo = this.tablaTitResumen[0].indice;
      this.verHojaMetrado(null);
    } else {
      this.tablaTitResumen = [];
      this.indiceTitulo = null;
    }
  }
  filaExcelSel;
  indexTablaExcel;
  async seleccionTablaExcel(row, i) {
    this.IndexMetradoDiario=null
    this.filaExcelSel = row;
    if (this.filaExcelSel && row.item) {
      this.CerrarAcordion(this.indexTablaExcel);
      this.AbrirAcordion(i);
    } else {
      this.AbrirAcordion(i);
    }
    if (row.item && this.indexTablaExcel !== i) {
      this.indexTablaExcel = i;
      await this.SelecionarMetradoDiario();
    } else if ((row.item && this.indexTablaExcel == i) || !row.item) {
      return;
    }
  }
  tablaExcelAdjunta = [];
  headerExcel = [];
  filaSel;
  titInformSel;
  tablaTitulo;
  async verHojaMetrado(titulo) {
    this.metradoSeleccionado = null;
    this.filaExcelSel = null;
    this.IndexMetradoDiario = null;
    if (this.indiceTitulo == titulo?.indice) {
      return;
    }
    this.mostrar_carga_todo = true;
    setTimeout(async () => {
      this.tablaSistema = [];
      this.tablaTitulo = [];
      this.headerExcel = null;
      this.tablaExcelAdjunta = [];
      this.filaSel = null;
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
      const response = await this.listarTablaExcel(titulo.indice, titulo.item);
      const response2 = await this.tablaTipoExcel(response, this.tablaTitulo);
      this.tablaExcelAdjunta = response2.body;
      for (let row of this.tablaExcelAdjunta) {
        row.mostrar = row.item ? 1 : 0;
      }
      this.headerExcel = response2.header;
      this.mostrar_carga_todo = false;
    }, 5);
  }
  async listarTablaExcel(indice, item) {
    try {
      const obj = {
        id_proyecto: this.id_proyecto,
        indice_tit: indice,
        item: item,
      };
      const response = await this.metradoService.listarTopMetrados(obj);
      return response;
    } catch (e) {
      SwalService.error();
      console.log(e);
    }
  }
  noConsistente;
  vinculadoExcel;
  noConsistente2;
  faltantesPresupuesto = [];
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
          const encontrado = await response[0].find(
            (ele) =>
              ele.item == element.item && ele.descripcion == element.descripcion
          );

          if (!encontrado) {
            vinculado = false;
            this.noConsistente2 = true;
            this.faltantesPresupuesto.push(
              element.item + '-' + element.descripcion
            );
          }
        }
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
            (ele) => ele.indice == iterator.indice_fila
          );
          iterator.descripcion2 = null;
          iterator.item2 = null;
          iterator.metrado2 = null;
          if (!encontrado) {
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
    return { header: header, body: body, vinculado: vinculado };
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
  tablaPrincipal;
  dec_metrado = 2; //falta
  async filtrarTitulo(titulo) {
    const obj2 = {
      id_proyecto: this.id_proyecto,
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
    const filtrados = this.tablaPrincipal.filter((ele) => {
      const splitItem = ele.item.split('.');
      if (Number(splitItem[0]) == Number(titulo.item)) {
        return ele;
      }
    });
    filtrados.map((ele, index) => (ele.ind2 = index));
    return filtrados;
  }
  fechaselecionada = null;
  ChangeDia(dia) {
    if (!dia.bloqueado) {
      this.fechaselecionada = dia.fecha;
      this.CerrarAcordion(this.indexTablaExcel);
      this.filaExcelSel = null;
      this.metradoSeleccionado = null;
      this.IndexMetradoDiario = null;
      this.indexTablaExcel=null
      this.tablaSistema = [];
      this.MostrarTotales('')
    } else {
      return;
    }
  }
  filaDiaria;
  IndexMetradoDiario;
  async seleccionMetradoDiario(row, i) {
    this.filaDiaria = row;
    this.IndexMetradoDiario = i;
  }
  tablaSistema = [];
  id_registroact;
  async SelecionarMetradoDiario() {
    this.tablaSistema = [];
    if (this.fechaselecionada && this.filaExcelSel) {
      const edatos = {
        id_proyecto: this.id_proyecto,
        id_registro: this.id_registroact,
        indice: this.filaExcelSel.indice,
      };
      const respuesta = await this.metradoService.listarMetradosDiarios(edatos);
      console.log(respuesta)
      console.log(respuesta[1].length)
      this.tablaSistema = respuesta[1].filter(item => 
        moment(item.fecha).format('YYYY-MM-DD') === moment(this.fechaselecionada).format('YYYY-MM-DD')
      );
      console.log(this.tablaSistema)
      if(respuesta[2].length){
        this.MostrarTotales(respuesta[2][0].montodias)
      }else{
        this.MostrarTotales('')
      }
    } else {
      return;
    }
  }
  async AbrirAcordion(indice) {
    let ind2 = indice + 1;
    for (let i = ind2; i < this.tablaExcelAdjunta.length; i++) {
      if (!this.tablaExcelAdjunta[i].item) {
        this.tablaExcelAdjunta[i].mostrar = 1;
      } else {
        break;
      }
    }
  }
  async CerrarAcordion(indice) {
    let ind2 = indice + 1;
    for (let i = ind2; i < this.tablaExcelAdjunta.length; i++) {
      if (!this.tablaExcelAdjunta[i].item) {
        this.tablaExcelAdjunta[i].mostrar = 0;
      } else {
        break;
      }
    }
  }
  async AgregarADiario(row, checkbox: MatCheckbox) {
    this.auxidfila++;
    const fila =
      row.tieneSubmetrado == '0' && row.nivel == 2
        ? 1
        : (row.tieneSubmetrado == '1' || row.tieneSubmetrado == '0') &&
          row.nivel == 0
        ? 2
        : row.tieneSubmetrado == '0' &&
          row.nivel == 1 &&
          this.tablaSistema.length > 0
        ? 3
        : row.tieneSubmetrado == '0' &&
          row.nivel == 3 &&
          this.tablaSistema.length > 0
        ? 4
        : 2;
    const fila2 = {
      id_fila: this.auxidfila,
      descripcion: row.descripcion,
      cantidad: '',
      n_veces: '',
      largo: '',
      ancho: '',
      altura: '',
      total: '',
      parcial: '',
      tipofila: fila,
      subtotal: '',
    };
    this.tablaSistema.push(fila2);
    checkbox.checked = false;
  }
  habilitarMultipleSelect = false;
  inicioCeldaCopiado = null;
  finCeldaCopiado = null;
  habilitadoCopiar = false;
  seleccionCelda: any;
  bloquearBotones = false;
  copiadoCeldas: boolean = false;
  metradoSeleccionado = null;
  habilitarEditarSistema(celda, rowIndex) {
    if (this.bloquearBotones && this.tablaSistema[rowIndex].id_fila == null) {
      return;
    }
    if (!this.seleccionCelda && !this.copiadoCeldas) {
      this.IndexMetradoDiario = rowIndex;
      this.metradoSeleccionado = this.tablaSistema[this.IndexMetradoDiario];
      this.tablaSistema[rowIndex]['editar' + celda] = 1;
    } else {
      if (this.seleccionCelda) {
      } else {
        this.metradoSeleccionado = null;
        this.IndexMetradoDiario = null;
        const array = [
          'descripcion',
          'cantidad',
          'n_veces',
          'largo',
          'ancho',
          'altura',
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
  async moverArribaTablaSistema(value, columna, i) {
    if (this.IndexMetradoDiario > 0) {
      value.target.blur();
      const index = i - 1;
      this.tablaSistema[index]['editar' + columna] = 1;
      this.IndexMetradoDiario = index;
      this.metradoSeleccionado = this.tablaSistema[this.IndexMetradoDiario];
      // this.stiloFormula();
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
      default:
        return sgte;
    }
  }
  saltardescripcion: boolean;
  async moverDerechaTablaSistema(event, columna, index) {
    if (columna == 'descripcion' || columna == 'item') {
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
    } else if (columna !== 'tarifa') {
      this.saltardescripcion = false;
      event.target.blur();
      const element = this.sgteColumna(columna, true);
      this.tablaSistema[index]['editar' + element] = 1;
    }
  }
  async moverIzquierdaTablaSistema(event, columna, index) {
    if (columna == 'descripcion' || columna == 'item') {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement.selectionStart === 0) {
        if (this.saltardescripcion) {
          event.target.blur();
          const element = this.sgteColumna(columna, false);
          this.tablaSistema[index]['editar' + element] = 1;
        } else {
          this.saltardescripcion = true;
        }
      } else {
        this.saltardescripcion = false;
      }
    } else {
      event.target.blur();
      const element = this.sgteColumna(columna, false);
      this.tablaSistema[index]['editar' + element] = 1;
    }
  }
  async moverAbajoTablaSistema(value, columna, i) {
    if (this.IndexMetradoDiario < this.tablaSistema.length - 1) {
      value.target.blur();
      const index = i + 1;
      this.tablaSistema[index]['editar' + columna] = 1;
      this.IndexMetradoDiario = index;
      this.metradoSeleccionado = this.tablaSistema[this.IndexMetradoDiario];
    } else {
      return;
    }
  }
  handleKeyDown(event: KeyboardEvent, index: number, columna: string) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moverArribaTablaSistema(event, columna, index);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moverAbajoTablaSistema(event, columna, index);
    } else if (event.key === 'ArrowRight') {
      this.moverDerechaTablaSistema(event, columna, index);
    } else if (event.key === 'ArrowLeft') {
      this.moverIzquierdaTablaSistema(event, columna, index);
    }
  }
  pintarCelda(letra) {
    let valido = false;
    if (
      this.metradoSeleccionado.id_fila !== null &&
      this.metradoSeleccionado.id_fila !== ''
    ) {
      const formula =
        this.metradoSeleccionado.formula == null ||
        this.metradoSeleccionado.formula == ''
          ? 'E*F*G*H'
          : this.metradoSeleccionado.formula;
      const spliteado = formula.split(/[/+*-]+/);
      spliteado.map((ele) => {
        if (ele.includes(letra)) {
          valido = true;
        }
      });
    }
    return valido;
  }
  habEditFormula = false;
  tempFormula: any[] = [];
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
  async guardarCambios() {
    this.mostrar_carga_todo=true
    let sumaTotal = 0;
    let letrasConcatenadas = '';
    let dias= this.diasCalendario
    dias.forEach((dia, index) => {
      if (dia.fecha === this.fechaselecionada) {
        dia.value = this.auxtotal?this.auxtotal:null
      }
      sumaTotal += parseFloat(dia.value==null?0:dia.value)
      letrasConcatenadas += dia.value;
      if (index < dias.length - 1) {
        letrasConcatenadas += '/';
      }
    });
    try {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se guardara todos los cambios realizados'
      );
      if (sw.isConfirmed) {
        const datos = {
          id_proyecto: this.id_proyecto,
          id_registro: this.id_registroact,
          indice: this.filaExcelSel.indice,
          total:sumaTotal,
          montodias:letrasConcatenadas,
          fecha:moment(this.fechaselecionada).format('YYYY-MM-DD'),
          datos1:JSON.stringify(this.tablaSistema)
        };
        const respuesta = await this.metradoService.guardarMetradoDiario(datos);
         if (respuesta.id == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          await this.ordenarPorFechaInicio();
          this.mostrar_carga_todo = false;
          this.closeModal();
        } else {
          SwalService.error('Advertencia', respuesta[0].mensaje);
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err);
      console.log(err);
    }
  }
  async cambioCheckboxCopiar() {}
  async agregarFilaSel(arriba = false) {
    this.auxidfila++;
    let desplazar = arriba ? 0 : 1;
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    if (this.metradoSeleccionado) {
      let filaagrega = {
        id_fila: this.auxidfila,
        descripcion: '',
        cantidad: '',
        n_veces: '',
        largo: '',
        ancho: '',
        altura: '',
        total: '',
        parcial: '',
        tipofila: 2,
        subtotal: '',
      };
      this.tablaSistema.splice(filaSel2 + desplazar, 0, filaagrega);
      this.IndexMetradoDiario = filaSel2 + (arriba ? 1 : 0);
      this.metradoSeleccionado = this.tablaSistema[filaSel2];
    } else {
      let filaagrega = {
        id_fila: this.auxidfila,
        descripcion: '',
        cantidad: '',
        n_veces: '',
        largo: '',
        ancho: '',
        altura: '',
        total: '',
        parcial: '',
        tipofila: 2,
        subtotal: '',
      };
      this.tablaSistema.push(filaagrega);
    }
  }
  @HostListener('document:keydown.control.arrowup', ['$event'])
  async moverArriba() {
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    if (this.metradoSeleccionado?.id_fila == null) {
      this.mostrarError('No se puede mover', 'Error', 2000);
      return;
    } else if (this.metradoSeleccionado.tipofila === 1) {
      let array = [];
      let array2 = [];
      let index = null;
      const anteriorValido = await this.anteValido(filaSel2 - 1, 1);
      if (!anteriorValido.antExistente) {
        this.mostrarError('No se puede mover', 'Error', 2000);
        return;
      } else {
        for (let i = filaSel2 - 1; i >= 0; i--) {
          const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
          if (row.tipofila > 1 || !row.tipofila) {
            array.push(row);
          } else if (row.tipofila == 1) {
            array.push(row);
            index = i;
            break;
          }
        }
        const obj = JSON.parse(
          JSON.stringify(this.tablaSistema[this.IndexMetradoDiario])
        );
        array2.push(obj);
        for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
          const existeSgte = await this.sgteexistente(i);
          if (existeSgte) {
            const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
            if (!row.tipofila || row.tipofila > 1) {
              array2.push(row);
            } else {
              if (row.id_fila !== null && row.tipofila == 1) {
                break;
              }
            }
          } else {
            break;
          }
        }
        this.IndexMetradoDiario = index;
        array2.reverse();
        for (let elemento of array2) {
          this.tablaSistema.splice(index, 0, elemento);
        }
        this.tablaSistema.splice(
          index + array2.length + array.length,
          array2.length
        );
        this.metradoSeleccionado = this.tablaSistema[this.IndexMetradoDiario];
      }
    } else if (this.metradoSeleccionado.tipofila === 2) {
      let array = [];
      let array2 = [];
      let index = null;
      const anteriorValido = await this.anteValido(filaSel2 - 1, 2);
      if (!anteriorValido.antExistente) {
        this.mostrarError('No se puede mover', 'Error', 2000);
        return;
      } else {
        for (let i = filaSel2 - 1; i >= 0; i--) {
          const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
          if (row.tipofila > 2 || !row.tipofila) {
            array.push(row);
          } else if (row.tipofila == 2) {
            array.push(row);
            index = i;
            break;
          }
        }
        const obj = JSON.parse(
          JSON.stringify(this.tablaSistema[this.IndexMetradoDiario])
        );
        array2.push(obj);
        for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
          const existeSgte = await this.sgteexistente(i);
          if (existeSgte) {
            const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
            if (!row.tipofila || row.tipofila > 2) {
              array2.push(row);
            } else {
              if (row.id_fila !== null && row.tipofila == 2) {
                break;
              }
            }
          } else {
            break;
          }
        }
        this.IndexMetradoDiario = index;
        array2.reverse();
        for (let elemento of array2) {
          this.tablaSistema.splice(index, 0, elemento);
        }
        this.tablaSistema.splice(
          index + array2.length + array.length,
          array2.length
        );
        this.metradoSeleccionado = this.tablaSistema[this.IndexMetradoDiario];
      }
    } else if (
      this.metradoSeleccionado.tipofila === 4 ||
      this.metradoSeleccionado.tipofila === 3
    ) {
      const anterior = await this.anteValido(
        filaSel2 - 1,
        this.metradoSeleccionado.tipofila
      );
      if (
        !anterior ||
        (anterior?.antExistente?.tipofila !== 4 &&
          anterior?.antExistente?.tipofila !== 3)
      ) {
        this.mostrarError('No se puede mover', 'Error', 2000);
        return;
      } else {
        const inx = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
        const ele = JSON.parse(JSON.stringify(this.metradoSeleccionado));
        this.tablaSistema[anterior.index] = ele;
        this.tablaSistema[inx] = anterior.antExistente;
        this.IndexMetradoDiario = anterior.index;
        this.metradoSeleccionado = this.tablaSistema[this.IndexMetradoDiario];
      }
    }
  }
  auxidfila = 20;
  modificandofila = false;
  async blurInputSistema(event, i, input) {
    this.tablaSistema[i]['editar' + input] = 0;
    this.saltardescripcion = false;
    this.modificandofila = true;
    let value = event.target.value;
    if (!isNaN(value) && value.trim() !== '') {
      const partes = value.split('.');
      if (partes[0].length > 8) {
        this.mostrarAdvertencia(
          'El valor excede al maximo de 8 caracteres en la parte entera',
          'Advertencia'
        );
        return;
      }
    } else {
      const cantLimite = input == 'descripcion' ? 200 : 80;
      if (value.length > cantLimite) {
        this.mostrarAdvertencia(
          'El valor excede al maximo de ' +
            cantLimite +
            ' caracteres para texto',
          'Advertencia'
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
    let modificado = 0;
    if (this.tablaSistema[i].id_fila !== null) {
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
      if (this.tablaSistema[i].id_fila == null) {
        if (value !== '' && value !== undefined && value !== null) {
          const spliteado = value.split('.');
          if (
            spliteado.length == 2 &&
            !isNaN(Number(spliteado[1])) &&
            !spliteado[0]
          ) {
            value = '0.' + spliteado[1];
          }
          let filaagrega = {
            id_fila: this.auxidfila + 1,
            descripcion: '',
            cantidad: '',
            n_veces: '',
            largo: '',
            ancho: '',
            altura: '',
            total: '',
            parcial: '',
            tipofila: 2,
            subtotal: '',
          };
          this.tablaSistema[i] = filaagrega;
          if (input == 'descripcion') {
            this.tablaSistema[i].parcial = this.formsService.redondeo(0, 2);
          }
          this.tablaSistema[i][input] = value;
          modificado = 1;
          this.auxidfila++;
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
      await this.actuaTablaSistema();
      this.modificandofila = false;
    }
  }
  cantFil: any = 0;
  async agregarFilas(arriba = false) {
    const cantidad = this.cantFil;
    for (let i = 0; i < cantidad; i++) {
      await this.agregarFilaSel(arriba);
    }
    this.popover3.close();
  }
  @HostListener('document:keydown.control.arrowdown', ['$event'])
  async moverAbajo() {
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    if (this.metradoSeleccionado.id_fila == null) {
      this.mostrarError('No se puede mover', 'Error', 2000);
      return;
    } else if (this.metradoSeleccionado.tipofila < 5) {
      const nuevo2 = (
        await this.sgtValido(filaSel2 + 1, this.metradoSeleccionado.tipofila)
      ).index;
      if (nuevo2) {
        const nuevo3 = await this.BuscarSiguiente2(
          nuevo2 + 1,
          this.metradoSeleccionado.tipofila
        );
        if (nuevo3) {
          let array1 = [];
          let array2 = [];
          array1.push(this.tablaSistema[filaSel2]);
          for (let i = filaSel2 + 1; i < nuevo2; i++) {
            const row = JSON.parse(JSON.stringify(this.tablaSistema[i]));
            array1.push(row);
          }
          for (let i = nuevo2; i < nuevo3; i++) {
            if (
              this.tablaSistema[i].id_fila !== null &&
              this.tablaSistema[i].id_fila !== ''
            ) {
              const row2 = JSON.parse(JSON.stringify(this.tablaSistema[i]));
              array2.push(row2);
            }
          }
          this.tablaSistema.splice(filaSel2, nuevo3 - filaSel2);
          this.tablaSistema.splice(filaSel2, 0, ...array2);
          this.tablaSistema.splice(filaSel2 + array2.length, 0, ...array1);
          // this.CompletarTablaSistema()
          this.IndexMetradoDiario = filaSel2 + array2.length;
          this.metradoSeleccionado = this.tablaSistema[this.IndexMetradoDiario];
        } else {
          this.mostrarError('No se puede mover', 'Error', 2000);
          return;
        }
      } else {
        this.mostrarError('No se puede mover', 'Error', 2000);
        return;
      }
    }
  }
  mostrarError(mensaje, titulo, tiempo) {
    this.toaster.error(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: tiempo,
    });
  }
  async anteValido(indice, tipofila) {
    let antExistente = null;
    let index = null;
    if (tipofila == 1) {
      for (let i = indice; i >= 0; i--) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }
      }
    } else if (tipofila == 2) {
      for (let i = indice; i >= 0; i--) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        } else if (row.id_fila !== null && row.tipofila == 1) {
          break;
        }
      }
    } else if (tipofila == 3 || tipofila == 4) {
      for (let i = indice; i >= 0; i--) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && (row.tipofila == 3 || row.tipofila == 4)) {
          antExistente = row;
          index = i;
          break;
        } else if (
          row.id_fila !== null &&
          (row.tipofila == 1 || row.tipofila == 2)
        ) {
          break;
        }
      }
    }
    return { antExistente: antExistente, index: index };
  }
  async sgteexistente(ind) {
    let existe = false;
    for (let i = ind; i < this.tablaSistema.length; i++) {
      const element = this.tablaSistema[i];
      if (element.id_fila !== null) {
        existe = true;
        break;
      }
    }
    return existe;
  }
  async sgtValido(indice, tipofila) {
    let antExistente = null;
    let index = null;
    if (tipofila == 1) {
      for (let i = indice; i < this.tablaSistema.length; i++) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        }
      }
    } else if (tipofila == 2) {
      for (let i = indice; i < this.tablaSistema.length; i++) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && row.tipofila == tipofila) {
          antExistente = row;
          index = i;
          break;
        } else if (row.id_fila !== null && row.tipofila == 1) {
          break;
        }
      }
    } else if (tipofila == 3 || tipofila == 4) {
      for (let i = indice; i < this.tablaSistema.length; i++) {
        const row = this.tablaSistema[i];
        if (row.id_fila !== null && (row.tipofila == 3 || row.tipofila == 4)) {
          antExistente = row;
          index = i;
          break;
        } else if (
          row.id_fila !== null &&
          (row.tipofila == 1 || row.tipofila == 2)
        ) {
          break;
        }
      }
    }
    return { antExistente: antExistente, index: index };
  }
  BuscarSiguiente2(indice, tipofila) {
    var aux = indice;
    for (let i = indice; i < this.tablaSistema.length; i++) {
      const row = this.tablaSistema[i];
      if (tipofila == 1) {
        if (
          row?.id_fila !== null &&
          row?.id_fila !== '' &&
          row?.tipofila == tipofila
        ) {
          return i;
        } else if (row?.id_fila !== '' && row?.id_fila !== null) {
          aux = i;
        }
      } else if (tipofila == 2) {
        if (
          (row?.id_fila !== null &&
            row?.id_fila !== '' &&
            row?.tipofila == tipofila) ||
          (row?.id_fila !== null && row?.id_fila !== '' && row?.tipofila == 1)
        ) {
          return i;
        } else if (row?.id_fila !== '' && row?.id_fila !== null) {
          aux = i;
        }
      } else if (tipofila == 3 || tipofila == 4) {
        if (
          (row?.id_fila !== null &&
            row?.id_fila !== '' &&
            row?.tipofila == tipofila) ||
          (row?.id_fila !== null &&
            row?.id_fila !== '' &&
            (row?.tipofila == 1 || row?.tipofila == 2))
        ) {
          return i;
        } else if (row?.id_fila !== '' && row?.id_fila !== null) {
          aux = i;
        }
      }
    }
    if (aux == indice) {
      return aux;
    } else {
      return aux + 1;
    }
  }
  mostrarInfo(mensaje, titulo, tiempo) {
    this.toaster.info(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: tiempo,
    });
  }
  mostrarAdvertencia(mensaje, titulo) {
    this.toaster.warning(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
    });
  }
  @HostListener('document:keydown.control.arrowright', ['$event'])
  async bajarNivel(e?: KeyboardEvent) {
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    if (this.metradoSeleccionado.id_fila !== null) {
      if (this.metradoSeleccionado.tipofila !== 4) {
        const compr = await this.EncontrarTitulo();
        if (
          compr ||
          (this.tablaSistema[filaSel2 - 1]?.tipofila == 1 &&
            this.tablaSistema[filaSel2].tipofila == 1)
        ) {
          let nuevo = parseInt(this.metradoSeleccionado.tipofila) + 1;
          this.tablaSistema[filaSel2].tipofila = nuevo;
        } else {
          this.mostrarError('No existe un Titulo Superior', 'Error', 2000);
        }
      } else {
        this.mostrarError('Fila seleccionada no valida', 'Error', 2000);
      }
    }
    this.actuaTablaSistema();
    this.metradoSeleccionado = this.tablaSistema[this.IndexMetradoDiario];
  }
  async EncontrarTitulo() {
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    if (filaSel2 == 0 && this.metradoSeleccionado.tipofila == 1) {
      return true;
    }
    for (let k = filaSel2 - 1; k >= 0; k--) {
      if (this.tablaSistema[k].tipofila == 2) {
        return true;
      }
    }
  }
  @HostListener('document:keydown.control.arrowleft', ['$event'])
  async subirNivelfila(e?: KeyboardEvent) {
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    if (this.metradoSeleccionado.id_fila !== null) {
      if (this.metradoSeleccionado.tipofila !== 1) {
        if (this.metradoSeleccionado.tipofila == 2) {
          const nue = await this.EncontrarTituloAfter();
          if (nue) {
            this.tablaSistema[filaSel2].tipofila = 1;
          } else {
            this.tablaSistema[filaSel2].tipofila = 1;
            if(this.tablaSistema[filaSel2+1]){
               this.tablaSistema[filaSel2 + 1].tipofila=2
            }
          }
        } else {
          let nuevo = parseInt(this.metradoSeleccionado.tipofila) - 1;
          this.tablaSistema[filaSel2].tipofila = nuevo;
        }
      } else {
        this.mostrarError('Fila seleccionada no valida', 'Error', 2000);
      }
    }
    this.actuaTablaSistema();
    this.metradoSeleccionado = this.tablaSistema[this.IndexMetradoDiario];
  }
  async EncontrarTituloAfter() {
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    for (let k = filaSel2 + 1; k < this.tablaSistema.length - 1; k++) {
      if (this.tablaSistema[k].tipofila == 1) {
        continue;
      } else if (this.tablaSistema[k].tipofila == 2) {
        return true;
      } else if (this.tablaSistema[k].tipofila > 2) {
        return false;
      }
    }
  }

  dec_indirectos = 2;
  convertirPorcentaje(valor) {
    if (typeof valor === 'string' && valor.includes('%')) {
      return parseFloat(valor.replace('%', '')) / 100;
    }
    return parseFloat(valor);
  }
  auxtotal
  async actuaTablaSistema() {
    for (let i = this.tablaSistema.length - 1; i >= 0; i--) {
      let row = this.tablaSistema[i];
      if (row.tipofila === 3||row.tipofila === 2) {
        let total = 0;
        const { cantidad, n_veces, largo, ancho, altura } = row;
        if (row.formula == null || row.formula == '') {
          const valoresNumericos = [
            this.convertirPorcentaje(cantidad),
            this.convertirPorcentaje(n_veces),
            this.convertirPorcentaje(largo),
            this.convertirPorcentaje(ancho),
            this.convertirPorcentaje(altura),
          ].filter((val) => !isNaN(val) && String(val) !== '');
          if (valoresNumericos.length > 0) {
            total = valoresNumericos[0];
            for (let j = 1; j < valoresNumericos.length; j++) {
              total *= valoresNumericos[j];
            }
            row.subtotal= total===0? null: this.formsService.redondeo(total, this.dec_indirectos);
            row.parcial = row.tipofila==3?null:row.subtotal
          } else {
            row.subtotal = 0;
            row.parcial = row.tipofila==3?null:0;
          }
        } else {
          const array2 = [
            { key: cantidad, value: 'E' },
            { key: n_veces, value: 'F' },
            { key: largo, value: 'G' },
            { key: ancho, value: 'H' },
            { key: altura, value: 'I' },
          ];
          let formula = row.formula;
          array2.forEach((item) => {
            const regex = new RegExp(item.value, 'g');
            const valor =
              item.key === '' || item.key == null
                ? 0
                : this.convertirPorcentaje(item.key);
            formula = formula.replace(regex, valor);
          });
          try {
            formula = formula.replace(/[^0-9+\-*/(). ]/g, '');
            total = eval(formula);
            row.subtotal= total == 0? null: this.formsService.redondeo(total, this.dec_indirectos);
            row.parcial =row.tipofila==3? null:row.subtotal
          } catch (e) {
            row.subtotal = null;
            row.parcial = null;
          }
        }
      }
    }
    var total =0
    var totalsup=0
    let auxiliar
    for (let i = this.tablaSistema.length - 1; i >= 0; i--) {
      let row = this.tablaSistema[i];
      if (row.tipofila === 3 && row.subtotal) {
        total=total +parseFloat(row.subtotal)
        auxiliar='fila3'
      }else if (row.tipofila==2){
        if(auxiliar=='fila3'){
          totalsup =totalsup+total
          row.parcial=this.esCero(total)?null:this.formsService.redondeo(total, this.dec_indirectos)
          total=0
          auxiliar=''
          row.subtotal=null
        }else if(auxiliar==''||!auxiliar){
          totalsup = totalsup+ parseFloat(row.parcial)
        }
      }else if(row.tipofila==1||row.tipofila==5){
        row.parcial=null
      }
    }
    this.auxtotal=this.formsService.redondeo(totalsup,this.dec_indirectos)
    // const filteredData  =await JSON.parse(JSON.stringify(this.tablaSistema.filter(item => item.indice !== null && item.indice !== '' && item.id_fila !== null&&item.id_fila !=='')))
    // filteredData.forEach((item, index) => {
    //   item.id_fila = index + 1
    // })
    // const filterdata2 =  await this.datasourceDeta.filter(item => item.indice != this.auxindice.toString());
    // this.datasourceDeta =  [...filterdata2, ...filteredData]
  }
  esCero = (valor: any): boolean => {
    return parseFloat(valor) === 0;
  };
  todosCheck = false
  async eliminarRow() {
    console.log(this.IndexMetradoDiario)
    let arrayEliminar = [];
    if (this.habilitadoCopiar) {
      this.tablaSistema.map((ele, index) => {
        if ((ele.editarEliminar || ele.editarCopiar)&&ele.id_fila!==null&&ele.id_fila!=='') {
          arrayEliminar.push(index);
          ele.editarEliminar = false;
          ele.editarCopiar = false;
        }
      });
      this.habilitadoCopiar = false;
      this.todosCheck = false;
    } else {
      arrayEliminar.push(this.IndexMetradoDiario);
    }
    if (!arrayEliminar.length) {
      this.mostrarError('Ninguna fila seleccionada', '',2000)
      return;
    }
    arrayEliminar.sort((a, b) => b - a);
    for (let indice of arrayEliminar) {
      this.tablaSistema.splice(indice, 1);
    }
    // await this.ComprobarFilas()
    this.actuaTablaSistema()
    this.metradoSeleccionado = null;
    this.tempFormula = [];
    this.IndexMetradoDiario = null;
  }
}
