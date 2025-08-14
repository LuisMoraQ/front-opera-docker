import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
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
import * as math from 'mathjs';

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
  @Input('height') height: number = 100;
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
  @ViewChild('modalTotale') modalTotale: ModalBasicComponent;
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
    this.dec_metrado= this.prueba.value.decimal.split('|')[0]??2
  }
  constructor(
    private toaster: ToastrService,
    public metradoService: MetradoService,
    public principalService: PrincipalService,
    public formsService: FormsService,
    private cdRef:ChangeDetectorRef,
    
  ) {
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  dataSource1 = [];
  id_registro;
  id_registro2;
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  async ngOnInit() {
    var resto = 210;
    this.height = window.innerHeight - resto;
    this.ordenarPorFechaInicio(true);
  }
  pintar() {
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
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
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async cambioVista(ind: any) {
    this.subvista = ind;
    if (ind == 3) {
      if(this.existecambios){
        await this.guardarCambios()
        this.existecambios=false
      }
      await this.changeVista2(this.datosglo);
    } else if (ind == 2) {
      if(this.existecambios){
        await this.guardarCambios()
        this.existecambios=false
      }
      await this.changeVista(this.datosglo);
    }else if(ind==1){
      if(this.existecambios){
        await this.guardarCambios()
        this.existecambios=false
      }
    }
  }
  closeModal() {
    this.modalHojas.hide();
  }
  openModal2(datos = null) {
    if (datos != null) {
      this.id_registro2 = datos.id_registro;
      this.formEstado.get('detalle2').setValue(datos?.detalle);
      this.formEstado.get('estado').setValue(datos?.estado);
      this.formEstado.get('observacion').setValue(datos?.observacion);
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
    observacion: new UntypedFormControl(''),
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
  validarMes(fechaInicio: string, fechaFin: string): boolean {
    const [anio1, mes1] = fechaInicio.split('-').map(Number);
    const [anio2, mes2] = fechaFin.split('-').map(Number);
    return anio1 === anio2 && mes1 === mes2;
  }
  async almacenar() {
    //aca
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
        if (!this.validarMes(datos.fechaini, datos.fechafin)) {
          SwalService.error(
            'Error',
            'El rango de fechas debe ser en el mismo mes'
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
    this.formHojas.reset();
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
        if (respuesta[0].id == '1') {
          this.toaster.success('Se guardo correctamente', 'Ëxito', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          await this.ordenarPorFechaInicio();
          this.closeModal2();
          this.mostrar_carga_todo = false;
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
        if (respuesta[0].id == '1') {
          SwalService.success();
          await this.ordenarPorFechaInicio();
        } else {
          SwalService.error('Advertencia', respuesta.mensaje);
        }
        this.mostrar_carga_todo = false;
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err);
    }
  }
  tablaaux = [];
  nuevoauxtotal;
  async AbrilModalDiario(row, fecha, busq) {
    const edatos = {
      id_proyecto: row.id_proyecto,
      id_registro: this.registrotab3,
      indice: row.indice,
      fecha: moment(fecha).format('YYYY-MM-DD'),
    };
    const respuesta = await this.metradoService.listarMetradosDiarios(edatos);
    this.nuevoauxtotal = await this.metradoSeleccionado.redondeo(row.montodias?.split('/')[busq],this.dec_metrado)
    this.tablaaux = respuesta[1];
    this.modalTotale.show();
  }
  teclaFormula(value) {
    if (!this.habEditFormula) {
      this.tempFormula = [];
      return;
    }
    this.tempFormula = this.convertirAArray(value.toUpperCase());
  }
  convertirAArray(expresion: string): string[] {
    const partes = expresion.split(/([\+\-\*/\(\)])/);
    const resultado = partes.filter((elemento) => elemento !== '');
    return resultado;
  }
  async evaluarFormula(texto, input: HTMLInputElement) {
    this.habEditFormula = false;
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    setTimeout(async () => {
      if (this.metradoSeleccionado !== null && texto != 'B*C*D*E*F') {
        texto = texto.toString().toUpperCase().replace(/\s+/g, '');
        const spliteado = this.convertirAArray2(texto, true);
        let arrayCorrecto = [];
        const respuesta = await this.previaPruebaFormula(spliteado);
        if (!respuesta.valido) {
          this.mostrarError('Formula no Valida', 'Error', 3000);
          input.value = this.valorAnterior;
          return;
        } else {
          arrayCorrecto = respuesta.arrayCorrecto;
        }
        const formula = arrayCorrecto.join('');
        if (formula !== this.tablaSistema[filaSel2].formula) {
          this.tablaSistema[filaSel2].formula = formula;
        }
        const excedido = await this.actuaTablaSistema(true)
        this.modificandofila = false;
        if (excedido) {
          this.tablaSistema[filaSel2].formula = this.valorAnterior
          input.value = this.valorAnterior;
          await this.actuaTablaSistema(false)
        }
      } else {
        return;
      }
    }, 50);
  }
  mostrarColrs: boolean = false;
  // verificarHabForm() {
  //   this.tempFormula = [];
  //   this.mostrarColrs = false;
  //   if (this.solover) {
  //     return;
  //   }
  //   if (this.IndexMetradoDiario !== null) {
  //     if (this.tablaSistema[this.IndexMetradoDiario].tipofila !== 4&&this.tablaSistema[this.IndexMetradoDiario].tipofila !==3) {
  //       this.mostrarError('Formula no editable', null, 3000);
  //       return;
  //     }
  //     this.habEditFormula = true;
  //     // this.mostrarColrs = true
  //     this.teclaFormula(
  //       this.metradoSeleccionado.formula == null ||
  //         this.metradoSeleccionado.formula == ''
  //         ? 'B*C*D*E*F'
  //         : this.metradoSeleccionado.formula
  //     );
  //   } else {
  //     this.mostrarError('Ninguna fila seleccionada de la tabla', null, 3000);
  //     this.mostrarColrs = false;
  //     this.habEditFormula = false;
  //     return;
  //   }
  // }
  async previaPruebaFormula(texto) {
    const columnas = ['B', 'C', 'D', 'E','F'];
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
  calcularformula(texto) {
    try {
      return math.evaluate(texto);
    } catch {
      return null;
    }
  }
  convertirAArray2(expresion: string, tipo = false): string[] {
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

  async changeVista(datos) {
    this.aspectos = JSON.parse(this.colores);
    await this.pintar();
    this.datosglo = datos;
    this.mostrar_carga_todo = true;
    this.subvista = 2;
    const aspectos = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.id_proyecto,
    });
    this.id_registroact = datos.id_registro;
    this.registrotab3 = this.id_registroact;
    this.diasCalendario = await this.generateCalendar(
      datos.fechaini,
      datos.fechafin,
      aspectos[0],
      aspectos[1]
    );
    this.indexTablaExcel = null;
    this.saldometrado = 0;
    this.metradoanterior = 0;
    this.metradoposterior = 0;
    this.metradoacumulado = 0;
    this.fechaselecionada = this.diasCalendario[0].fecha;
    await this.listarTitulos();
    this.mostrar_carga_todo = false;
  }
  tablavistametradodiario;
  registrotab3;
  getMontosParsed: { [id: string]: number[] } = {};
  getMontos(montoDiasStr: string, filaId?: string): number[] {
    const cantidadDias = this.diasCalendario2?.length || 0;
    if (filaId && this.getMontosParsed[filaId]) {
      return this.getMontosParsed[filaId];
    }
    let montos = (montoDiasStr ?? '').split('/').map((m) => {
      if (m === '' || m.toLowerCase?.() === 'null') return 0;
      const num = Number(m);
      return isNaN(num) ? 0 : num;
    });
    while (montos.length < cantidadDias) {
      montos.push(0);
    }
    montos = montos.slice(0, cantidadDias);
    if (filaId) {
      this.getMontosParsed[filaId] = montos;
    }
    return montos;
  }
  getItemByIndice(valor) {
    return this.dataSource1.find((item) => item.id_registro == valor);
  }
  async cerrarModal3() {
    this.modalTotale.hide();
  }
  async changeVista2(datos) {
    this.aspectos = JSON.parse(this.colores);
    await this.pintar();
    this.mostrar_carga_todo = true;
    this.registrotab3 = datos.id_registro;
    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: datos.id_registro,
      fechaini: datos.fechaini,
    };
    this.tablavistametradodiario = await this.metradoService.reporteMetradosMes(
      obj
    );
    const aspectos = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.id_proyecto,
    });
    this.id_registroact = datos.id_registro;
    this.diasCalendario2 = await this.generateCalendar(
      datos.fechaini,
      datos.fechafin,
      aspectos[0],
      aspectos[1]
    );
    this.mostrar_carga_todo = false;
  }
  diasCalendario2;
  diasCalendario;
  valordia;
  async MostrarTotales(array) {
    const valores = array.split('/').map(Number);
    let suma = 0;
    for (let k = 0; k < this.diasCalendario.length; k++) {
      const value = k == 0 && valores[k] == 0 ? null : valores[k] ?? null;
      suma += isNaN(value) ? 0 : value;
      this.diasCalendario[k].value = value;
      if (this.diasCalendario[k].fecha == this.fechaselecionada) {
        this.auxtotal = value;
        this.valordia = value??0;
      }
    }
    this.metradoacumulado = this.metradoanterior + suma;
    this.saldometrado = this.filaExcelSel
      ? this.filaExcelSel.mtotal -
        (this.metradoacumulado + this.metradoposterior)
      : null;
  }
  async generateCalendar(
    fechaini: string,
    fechafin: string,
    jornada: any[],
    feriados: any[]
  ) {
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
        value: null,
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
    if(this.subvista==2&&this.existecambios && this.indexTablaExcel !== i){
      await this.guardarCambios()
      this.existecambios=false
    }
    this.metradoSeleccionado=null
    this.IndexMetradoDiario = null;
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
      for (let i = 0; i < this.tablaExcelAdjunta.length; i++) {
        const row = this.tablaExcelAdjunta[i];
        const nextRow = this.tablaExcelAdjunta[i + 1]
        row.mostrar = row.item ? 1 : 0;
        row.tieneSiguiente = row.item&&nextRow && !nextRow.item ? 1 : 0;
      }
      this.headerExcel = response2.header;
      // console.log(this.tablaExcelAdjunta)
      this.mostrar_carga_todo = false;
    },5)
  }
  mintodoExcel() {
    for (let row of this.tablaExcelAdjunta) {
      if (!row.item) {
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
  dec_metrado
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
      this.saldometrado = 0;
      this.metradoanterior = 0;
      this.metradoposterior = 0;
      this.metradoacumulado = 0;
      this.fechaselecionada = dia.fecha;
      this.CerrarAcordion(this.indexTablaExcel);
      this.filaExcelSel = null;
      this.metradoSeleccionado = null;
      this.IndexMetradoDiario = null;
      this.indexTablaExcel = null;
      this.tablaSistema = [];
      this.MostrarTotales('');
    } else {
      return;
    }
  }
  IndexMetradoDiario;
  async seleccionMetradoDiario(row, i) {
    this.metradoSeleccionado = row; 
    this.IndexMetradoDiario = i;
  }
  tablaSistema = [];
  id_registroact;
  saldometrado;
  metradoanterior;
  metradoposterior;
  metradoacumulado;
  formulario1 = new UntypedFormGroup({
    activardiario: new UntypedFormControl(false),
  });
  activarDiarios;
  ChangeOption() {
    this.activarDiarios = this.formulario1.get('activardiario').value;
  }
  tablainicialdiario=[]
  cantidadFilasTabla = 15;
  async SelecionarMetradoDiario() {
    this.metradoSeleccionado=null
    this.saldometrado = 0;
    this.metradoanterior = 0;
    this.metradoposterior = 0;
    this.metradoacumulado = 0;
    this.tablaSistema = [];
    if (this.fechaselecionada && this.filaExcelSel) {
      const edatos = {
        id_proyecto: this.id_proyecto,
        id_registro: this.id_registroact,
        indice: this.filaExcelSel.indice,
        fecha: moment(this.fechaselecionada).format('YYYY-MM-DD'),
      };
      const respuesta = await this.metradoService.listarMetradosDiarios(edatos);
      this.auxidfila = respuesta[1].length+1;
      this.tablaSistema = respuesta[1]
      this.tablainicialdiario=JSON.parse(JSON.stringify(respuesta[1]))
      if (this.tablaSistema.length < this.cantidadFilasTabla) {
        const faltantes = this.cantidadFilasTabla - this.tablaSistema.length;
        for (let i = 0; i < faltantes; i++) {
          let filaagrega = {
            id_fila: null,
            descripcion: '',
            cantidad: '',
            n_veces: '',
            largo: '',
            ancho: '',
            altura: '',
            total: '',
            parcial: '',
            tipofila: null,
            subtotal: '',
          };
          this.tablaSistema.push(filaagrega);
        }
      }
      for (let i = 0; i < respuesta[0].length; i++) {
        if (this.id_registroact !== respuesta[0][i].id_registro) {
          if (
            moment(respuesta[0][i].fechafin).format('YYYY-MM-DD') >
            moment(this.fechaselecionada).format('YYYY-MM-DD')
          ) {
            this.metradoposterior += parseFloat(respuesta[0][i].total);
          } else {
            this.metradoanterior += parseFloat(respuesta[0][i].total);
          }
        }
      }
      if (respuesta[2].length) {
        this.MostrarTotales(respuesta[2][0].montodias);
      } else {
        this.MostrarTotales('');
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
    const filaac = this.tablaSistema.findIndex(
      (item) => item.id_fila == null || item.id_fila == ''
    );
    this.tablaSistema[filaac].id_fila = this.auxidfila;
    this.tablaSistema[filaac].descripcion = row.descripcion;
    this.tablaSistema[filaac].tipofila = fila;
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
          ? 'B*C*D*E*F'
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
  async mostrarColores(row) {
    this.metradoSeleccionado=row
    if (!this.seleccionCelda) {
      if (
        this.metradoSeleccionado?.id_fila !== null &&
        this.metradoSeleccionado?.id_fila !== '' &&
        (this.metradoSeleccionado?.tipofila==2||this.metradoSeleccionado?.tipofila==3)
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
    let sumaTotal = 0;
    let letrasConcatenadas = '';
    let dias = this.diasCalendario;
    dias.forEach((dia, index) => {
      if (dia.fecha === this.fechaselecionada) {
        dia.value = this.auxtotal ? this.auxtotal : null;
      }
      sumaTotal += parseFloat(
        dia.value == null || isNaN(dia.value) ? 0 : dia.value
      );
      letrasConcatenadas += isNaN(dia.value) ? '' : dia.value;
      if (index < dias.length - 1) {
        letrasConcatenadas += '/';
      }
    });
    const filteredData = await JSON.parse(
      JSON.stringify(
        this.tablaSistema.filter(
          (item) => item.id_fila !== null && item.id_fila !== ''
        )
      )
    );
    filteredData.forEach((item, index) => {
      item.id_fila = index + 1;
    });
    const datos = {
          id_proyecto: this.id_proyecto,
          id_registro: this.id_registroact,
          indice: this.filaExcelSel.indice,
          total: sumaTotal,
          montodias: letrasConcatenadas,
          fecha: moment(this.fechaselecionada).format('YYYY-MM-DD'),
          datos1: JSON.stringify(filteredData),
        };
    const respuesta = await this.metradoService.guardarMetradoDiario(datos);
    console.log(respuesta)

    // try {
    //   const sw = await SwalService.confirm(
    //     'Estas seguro?',
    //     'Se guardara todos los cambios realizados'
    //   );
    //   if (sw.isConfirmed) {
    //     const datos = {
    //       id_proyecto: this.id_proyecto,
    //       id_registro: this.id_registroact,
    //       indice: this.filaExcelSel.indice,
    //       total: sumaTotal,
    //       montodias: letrasConcatenadas,
    //       fecha: moment(this.fechaselecionada).format('YYYY-MM-DD'),
    //       datos1: JSON.stringify(filteredData),
    //     };
    //     const respuesta = await this.metradoService.guardarMetradoDiario(datos);
    //     if (respuesta.id == '1') {
    //       this.toaster.success('Se guardo correctamente', 'Ëxito', {
    //         closeButton: false,
    //         positionClass: 'toast-bottom-right',
    //         timeOut: 4000,
    //       });
    //       await this.SelecionarMetradoDiario();
    //       this.mostrar_carga_todo = false;
    //     } else {
    //       SwalService.error('Advertencia', respuesta[0].mensaje);
    //     }
    //   }
    // } catch (err) {
    //   SwalService.error(err);
    //   console.log(err);
    // }
  }
  async cambioCheckboxCopiar(valor, index) {
    if (!valor) {
      this.todosCheck = false;
    }
      const row = this.tablaSistema[index];
      this.tablaSistema[index].editarCopiar = valor;
      if (row.tipofila<5) {
        const resp =this.BuscarSiguiente(index+1,row.tipofila)
        let nuevo = resp==this.tablaSistema.length-1? resp+1:resp
        for (let i = index + 1; i < nuevo  ; i++) {
          this.tablaSistema[i].editarCopiar = true
        }
      }
  }
    BuscarSiguiente(indice,tipofila){
    for(let i=indice;i<=this.tablaSistema.length;i++){
      const row = this.tablaSistema[i];
      if(tipofila==1){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(i==this.tablaSistema.length-1)){
          return i
        }
      }else if(tipofila==2){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila==1)||(i==this.tablaSistema.length-1)){
          return i
        }
      }else if(tipofila==3){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(row?.id_fila !== null&&row?.id_fila!=='' && (row?.tipofila==1||row?.tipofila==2))||(i==this.tablaSistema.length-1)){
          return i
        }
      }else if(tipofila==4){
        if((row?.id_fila !== null&&row?.id_fila!=='' && row?.tipofila == tipofila)||(row?.id_fila !== null&&row?.id_fila!=='' && (row?.tipofila==1||row?.tipofila==2||row?.tipofila==3))||(i==this.tablaSistema.length-1)){
          return i
        }
      }
    }
  }
  async agregarFilaSel(arriba = false) {
    let desplazar = arriba ? 0 : 1;
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    if (this.metradoSeleccionado) {
      let filaagrega = {
        id_fila: '',
        descripcion: '',
        cantidad: '',
        n_veces: '',
        largo: '',
        ancho: '',
        altura: '',
        total: '',
        parcial: '',
        tipofila: '',
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
  auxidfila;
  modificandofila = false;
  async blurInputSistema(event, i, input) {
    let auxiliar;
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
      if (partes[1]?.length > 5) {
        this.mostrarAdvertencia(
          'El valor excede al maximo de 5 caracteres en la parte decimal',
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
    if (this.tablaSistema[i][input] == value ||value == undefined ||value == null) {
      this.modificandofila = false;
      return;
    }
    let modificado = 0;
    if (this.tablaSistema[i].id_fila !== null) {
      if (value == undefined || value == null) {
        this.modificandofila = false;
        return;
      }
      if ((this.tablaSistema[i][input] == null? '': this.tablaSistema[i][input]) !== value) {
        const spliteado = value.split('.');
        if (
          spliteado.length == 2 &&
          !isNaN(Number(spliteado[1])) &&
          !spliteado[0]
        ) {
          value = '0.' + spliteado[1];
        }
        auxiliar = this.tablaSistema[i][input];
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
          this.auxidfila++
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
            formula:'',
            tipofila: 2,
            subtotal: '',
          };
          this.tablaSistema[i] = filaagrega
          this.tablaSistema[i][input] = value
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
      const excedido = await this.actuaTablaSistema(true)
      this.modificandofila = false;
      if (excedido) {
        this.tablaSistema[i][input] = auxiliar
        await this.actuaTablaSistema(false)
      }
    }
  }
    async limpiarTabla() {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se eliminará todos los registros de la tabla hoja de metrado sistema'
    );
    if (sw.isConfirmed) {
      let indOrdenado = this.tablaSistema.filter((ele) => ele.id_fila !== null).map((ele) => ele.id_fila);
      indOrdenado.sort((a, b) => b - a);
      this.tablaSistema = [];
      for (let i = 0; i < this.cantidadFilasTabla; i++) {
        let filaagrega = {
          id_fila: null,
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
      this.IndexMetradoDiario = null;
      this.metradoSeleccionado = null;
      this.tempFormula = [];
      this.habilitadoCopiar = false;
    }
    this.auxtotal=null
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
    CompletarTablaSistema(){
    if (this.tablaSistema.length < this.cantidadFilasTabla) {
      const faltantes = this.cantidadFilasTabla - this.tablaSistema.length;
      for (let i = 0; i < faltantes; i++) {
        let filaagrega = {
            id_proyecto: this.id_proyecto,
            cantidad: '',
            id_fila: null,
            incidencia: '',
            item: '',
            nivel: '',
            formula: '',
            orden: '',
            tiempo: '',
            tipofila: null,
            total: '',
            unidad: '',
            descripcion: '',
            tarifa: '',
            mostrar: 1,
        };
        this.tablaSistema.push(filaagrega)
      }
    }
  }
  fila1_sel;
  datosglo;
  cambindicesel1(ind: any, datos) {
    if (ind != this.fila1_sel) {
      this.fila1_sel = ind;
    }
    this.registrotab3 = datos.id_registro;
    this.datosglo = datos;
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
    let auxi
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    if (this.metradoSeleccionado.id_fila !== null) {
      if (this.metradoSeleccionado.tipofila !== 4) {
        const compr = await this.EncontrarTitulo();
        if (compr ||(this.tablaSistema[filaSel2 - 1]?.tipofila == 1 && this.tablaSistema[filaSel2].tipofila == 1)) {
          auxi= await this.metradoSeleccionado.tipofila
          let nuevo = parseInt(this.metradoSeleccionado.tipofila) + 1;
          this.tablaSistema[filaSel2].tipofila = nuevo;
        } else {
          this.mostrarError('No existe un Titulo Superior', 'Error', 2000)
          return;
        }
      } else {
        this.mostrarError('Accion no valida', 'Error', 2000)
        return;
      }
    }
    const excedido = await this.actuaTablaSistema(true)
    this.modificandofila = false;
    if (excedido) {
      this.tablaSistema[filaSel2].tipofila = auxi
      await this.actuaTablaSistema(false)
    }
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
  busqueda=''
  limpiarfiltro() {
    this.busqueda = '';
  }
  @HostListener('document:keydown.control.arrowleft', ['$event'])
  async subirNivelfila(e?: KeyboardEvent) {
    let aux1
    let auxili2
    const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
    if (this.metradoSeleccionado.id_fila !== null) {
      if (this.metradoSeleccionado.tipofila !== 1) {
        if (this.metradoSeleccionado.tipofila == 2) {
          const nue = await this.EncontrarTituloAfter();
          if (nue) {
            aux1=1
            this.tablaSistema[filaSel2].tipofila = 1;
          } else {
            aux1=2
            this.tablaSistema[filaSel2].tipofila = 1;
            if (this.tablaSistema[filaSel2 + 1]) {
              auxili2=await this.tablaSistema[filaSel2 + 1].tipofila
              this.tablaSistema[filaSel2 + 1].tipofila = 2;
            }
          }
        } else {
          aux1=3
          auxili2=await this.metradoSeleccionado.tipofila
          let nuevo = parseInt(this.metradoSeleccionado.tipofila) - 1;
          this.tablaSistema[filaSel2].tipofila = nuevo;
        }
      } else {
        this.mostrarError('Accion no valida', 'Error', 2000);
        return
      }
    }
    const excedido = await this.actuaTablaSistema(true)
    this.modificandofila = false;
    if (excedido) {
      if(aux1==1){
        this.tablaSistema[filaSel2].tipofila = 2
      }else if(aux1==2){
        this.tablaSistema[filaSel2].tipofila = 2
        this.tablaSistema[filaSel2 + 1].tipofila= auxili2
      }else if(aux1==3){
        this.tablaSistema[filaSel2].tipofila =auxili2
      }
      await this.actuaTablaSistema(false)
    }
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
  Expandetodo() {//icomost   1 mostrar, 0 ocultar
    this.tablaExcelAdjunta[this.indexTablaExcel].icomost = 1
    const total= this.tablaExcelAdjunta.length
    let row=this.tablaExcelAdjunta[this.indexTablaExcel];
    if(row.tipofila<4&&total-1>this.indexTablaExcel){
      const resp = this.BuscarSiguiente(this.indexTablaExcel+1,row.tipofila)
      let nuevo=resp==total-1? resp+1:resp 
      for (let i = this.indexTablaExcel + 1; i < nuevo  ; i++) {
        const row2 = this.tablaExcelAdjunta[i];
          row2.mostrar = 1
          if(row2.icomost==0){
            row2.icomost=1
          }
      }
    }  
  }
  ContraeTodo(){
    const total= this.tablaExcelAdjunta.length
    let row=this.tablaExcelAdjunta[this.indexTablaExcel];
    if(row.tipofila<4&&total-1>this.indexTablaExcel){
      const resp = this.BuscarSiguiente(this.indexTablaExcel+1,row.tipofila)
      let nuevo=resp==total-1? resp+1:resp 
      for (let i = this.indexTablaExcel + 1; i < nuevo  ; i++) {
        const row2 = this.tablaExcelAdjunta[i];
         if(row2.tipofila==row.tipofila+1){
            row2.icomost=0
         }else{
            row2.icomost=0
            row2.mostrar=0
         }
      }
    }  
  }
  convertirPorcentaje(valor) {
    if (typeof valor === 'string' && valor.includes('%')) {
      return parseFloat(valor.replace('%', '')) / 100;
    }
    return parseFloat(valor);
  }
  auxtotal=null
  arrayCopiadosMetrado = []
  async copiarFila() {
    this.arrayCopiadosMetrado = [];
    this.tablasistemaaxi=await JSON.parse(JSON.stringify(this.tablaSistema))
    if (this.metradoSeleccionado?.id_fila !== null) {
      this.arrayCopiadosMetrado.push(
        JSON.parse(JSON.stringify(this.metradoSeleccionado))
      );
      this.mostrarColrs = false;
      this.tempFormula = [];
      this.mostrarInfo('', 'Copiado',2000)
      return;
    } else {
      this.mostrarError('Ninguna Fila Seleccionada', '',2000)
      return;
    }
  }
  existecambios=false
  async actuaTablaSistema(validarSaldo: boolean = true): Promise<boolean> {
    let totalTemp = 0;
    let totalSup = 0;
    let auxiliar: string | undefined
    for (let i = this.tablaSistema.length - 1; i >= 0; i--) {
      let row = this.tablaSistema[i];
      if(row.id_fila){
        if ((row.tipofila === 3 || row.tipofila === 2) && row.id_fila) {
        const { cantidad, n_veces, largo, ancho, altura, formula } = row;
        if (!formula) {
          const valoresNumericos = [
            this.convertirPorcentaje(cantidad),
            this.convertirPorcentaje(n_veces),
            this.convertirPorcentaje(largo),
            this.convertirPorcentaje(ancho),
            this.convertirPorcentaje(altura),
          ].filter((val) => !isNaN(val) && String(val) !== '');
          if (valoresNumericos.length > 0) {
            let subtotalCalc = valoresNumericos.reduce((acc, val) => acc * val);
            row.subtotal = subtotalCalc == 0? null: this.formsService.redondeo(subtotalCalc, this.dec_metrado);
            row.parcial = row.tipofila == 3? null : row.subtotal;
          } else {
            row.subtotal = 0;
            row.parcial = row.tipofila == 3 ? null : 0;
          }
        } else {
          let formulaCalc = formula;
          const array2 = [
            { key: cantidad, value: 'B' },
            { key: n_veces, value: 'C' },
            { key: largo, value: 'D' },
            { key: ancho, value: 'E' },
            { key: altura, value: 'F' },
          ];
          array2.forEach((item) => {
            const regex = new RegExp(item.value, 'g');
            const valor = item.key === '' || item.key == null
              ? 0
              : this.convertirPorcentaje(item.key);
            formulaCalc = formulaCalc.replace(regex, valor);
          });
          try {
            formulaCalc = formulaCalc.replace(/[^0-9+\-*/(). ]/g, '');
            const subtotalCalc = eval(formulaCalc);
            row.subtotal = subtotalCalc == 0
              ? 0
              : this.formsService.redondeo(subtotalCalc, this.dec_metrado);
            row.parcial = row.tipofila == 3? null : row.subtotal;
          } catch (e) {
            row.subtotal = null;
            row.parcial = null;
          }
        }
        }
        if (row.tipofila === 3 && row.subtotal) {
          totalTemp += parseFloat(row.subtotal);
          auxiliar = 'fila3';
        } else if (row.tipofila === 2) {
          if (auxiliar === 'fila3') {
            totalSup += totalTemp
            row.parcial = this.esCero(totalTemp)
              ? null
              : this.formsService.redondeo(totalTemp, this.dec_metrado);
            totalTemp = 0;
            auxiliar = '';
            row.subtotal = null;
          } else if (!auxiliar) {
            row.subtotal=row.parcial
            totalSup += parseFloat(row.parcial);
          }
        } else if (row.tipofila === 1 || row.tipofila === 4) {
          row.parcial = null;
          row.subtotal = null;
        }
      }
    }
    this.auxtotal = this.formsService.redondeo(totalSup, this.dec_metrado);
    if (validarSaldo) {
      const excedido =parseFloat(this.saldometrado) +parseFloat(this.valordia) -parseFloat(this.auxtotal) < 0;
      this.existecambios=true
      if (excedido) {
        this.mostrarError(
          'El saldo excede el monto de metrado de la partida',
          'Error',
          2000
        );
        return true;
      }
    }
    return false;
  }
  esCero = (valor: any): boolean => {
    return parseFloat(valor) === 0;
  };
  async habilitarMultiple(value) {
    this.IndexMetradoDiario = null;
    this.metradoSeleccionado = null;
    this.mostrarColrs = false;
    this.tempFormula = [];
    this.todosCheck = false;
    this.habilitadoCopiar = true; 
  }
  tablasistemaaxi=[]
  async copiarFilaMultiple() {
    this.tablasistemaaxi=await JSON.parse(JSON.stringify(this.tablaSistema))
    this.arrayCopiadosMetrado = [];
    this.celdasCopiadosMetrado = [];
      let i = 0;
      this.tablaSistema.map((ele, index) => {
        if (ele.editarCopiar && ele.id_fila !== null) {
          i++;
          ele.editarCopiar = false;
          this.arrayCopiadosMetrado.push(JSON.parse(JSON.stringify(ele)));
          this.tablaSistema[index].editarCopiar = false;
        }
        ele.editarCopiar = false;
      });
      if (!this.arrayCopiadosMetrado.length) {
        this.mostrarError('Ninguna fila seleccionada', '',2000)
      } else {
        this.habilitadoCopiar = false;
        this.todosCheck = false;
        this.IndexMetradoDiario = null;
        this.metradoSeleccionado = null;
        this.mostrarColrs = false;
        this.tempFormula = [];
        this.mostrarInfo('', 'Copiado',2000)
      }
  }
  todosCheck = false;
  async eliminarRow() {
    let arrayEliminar = [];
    if (this.habilitadoCopiar) {
      this.tablaSistema.map((ele, index) => {
        if (
          (ele.editarEliminar || ele.editarCopiar) &&
          ele.id_fila !== null &&
          ele.id_fila !== ''
        ) {
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
      this.mostrarError('Ninguna fila seleccionada', '', 2000);
      return;
    }
    arrayEliminar.sort((a, b) => b - a);
    for (let indice of arrayEliminar) {
      this.tablaSistema.splice(indice, 1);
    }
    // await this.ComprobarFilas()
    this.actuaTablaSistema(false);
    this.metradoSeleccionado = null;
    this.tempFormula = [];
    this.IndexMetradoDiario = null;
    this.CompletarTablaSistema()
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
      const array = ['descripcion','cantidad','n_veces','largo','ancho','altura']
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
            row[key] = '';
          }
        }
        arrayCopiar.push(obj);
      }
    } else if (
      this.copiadoCeldas &&
      this.inicioCeldaCopiado &&
      !this.finCeldaCopiado
    ) {
      const valor =
        this.tablaSistema[this.inicioCeldaCopiado.fila][
          this.inicioCeldaCopiado.colname
        ];
      const arr = [valor];
      arrayCopiar.push(arr);
    } else {
      this.mostrarError('Ninguna celda seleccionada', '',2000)
      return;
    }
    this.arrayCopiadosMetrado = [];
    this.celdasCopiadosMetrado = arrayCopiar;
  }
  async cortarSeleccionados() {
    let arrayCortados = [];
      let indicesEliminar = [];
      if (this.habilitadoCopiar) {
        this.tablaSistema = this.tablaSistema.map((ele) => {
          if (ele.editarCopiar&&ele.id_fila) {
            indicesEliminar.push(ele.ind);
            ele.id_fila = null;
            ele.editarCopiar = false;
            arrayCortados.push(JSON.parse(JSON.stringify(ele)));
            let filaagrega = {
                id_fila: null,
                descripcion: '',
                cantidad: '',
                n_veces: '',
                largo: '',
                ancho: '',
                altura: '',
                total: '',
                parcial: '',
                tipofila: null,
                subtotal: '',
            };
            ele = filaagrega;
          }
          return ele;
        });
      } else {
        if (this.copiadoCeldas) {
          await this.guardarSeleccionadosCeldas(true);
          this.copiadoCeldas = false;
        } else {
          indicesEliminar.push(this.metradoSeleccionado.ind);
          let filaagrega = {
            id_fila: null,
            descripcion: '',
            cantidad: '',
            n_veces: '',
            largo: '',
            ancho: '',
            altura: '',
            total: '',
            parcial: '',
            tipofila: null,
            subtotal: '',
          };
          this.metradoSeleccionado.editarCopiar = false;
          arrayCortados.push(
            JSON.parse(JSON.stringify(this.metradoSeleccionado))
          );
          this.metradoSeleccionado = null;
          this.tablaSistema[this.IndexMetradoDiario] = filaagrega;
        }
        this.habilitadoCopiar = false;
      }
      this.arrayCopiadosMetrado = arrayCortados;
      indicesEliminar.sort((a, b) => b - a);
      this.ultiCelda = null;
      this.habilitadoCopiar = false;
  }  
  async EliminarSelecionado(){
    if (this.copiadoCeldas) {
      await this.guardarSeleccionadosCeldas(true);
      this.limpiarCopiados()
      this.arrayCopiadosMetrado=[]
      this.celdasCopiadosMetrado=[]
    }
    this.actuaTablaSistema(false)
  }
  async limpiarCopiados() {
    // if (this.formulaCopiada !== null) {
    //   this.formulaCopiada = null;
    // }
    this.habilitadoCopiar = false;
    this.arrayCopiadosMetrado = [];
    this.CancelarCopiarFraccionTabla();
    this.tablaSistema = this.tablaSistema.map((ele) => {
      ele.editarCopiar = false;
      ele.editarEliminar = false;
      return ele;
    });
  }
  async CancelarCopiarFraccionTabla() {
    this.copiadoCeldas = false;
    this.inicioCeldaCopiado = null;
    this.finCeldaCopiado = null;
    this.metradoSeleccionado = null;
    this.IndexMetradoDiario = null;
    this.todosCheck = false;
  }  
  async pegarCopiados() {
    if (this.IndexMetradoDiario == null) {
      this.mostrarError( 'Seleccione una fila o celda valida para pegar','',3000)
      return;
    } else {
      const array = ['descripcion','cantidad','n_veces','largo','ancho','altura']
      if (this.celdasCopiadosMetrado.length) {
        const idx = array.indexOf(this.ultiCelda);
        const arrayValidos =
        idx == -1 ? array : array.slice(idx, array.length);
        let ind = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
        for (const iterator of this.celdasCopiadosMetrado) {
          this.auxidfila++
          if (ind >= this.tablaSistema.length) {
            let metrado = {
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
            for (let i = 0; i < iterator.length; i++) {
              metrado[arrayValidos[i]] = iterator[i];
            }
            this.tablaSistema.push(metrado);
          } else {
            let metrado = this.tablaSistema[ind];
              metrado.id_fila = this.auxidfila;
              metrado.tipofila= metrado.tipofila!==''&&metrado.tipofila!==null?metrado.tipofila:3
            for (let i = 0; i < iterator.length; i++) {
              metrado[arrayValidos[i]] = iterator[i];
            }
          }
          ind++;
        }
      } else if (this.arrayCopiadosMetrado.length) {
        let ind = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
        let celdasEspecificas = [];
        if (this.ultiCelda) {
          const idx = array.indexOf(this.ultiCelda);
          celdasEspecificas =
            idx == -1 ? array : array.slice(idx, array.length);
        }
        for (let iterator of this.arrayCopiadosMetrado) {
          if (ind > this.tablaSistema.length) {
            if (!celdasEspecificas.length) {
              this.tablaSistema.push(iterator);
            } else {
              this.auxidfila++
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
              let k = 0;
              for (const key of celdasEspecificas) {
                filaagrega[key] = iterator[array[k]];
                k++;
              }
              this.tablaSistema.push(filaagrega);
            }
          } else {
            if (!celdasEspecificas.length) {
              this.auxidfila++
              iterator.id_fila =this.auxidfila ;
              this.tablaSistema[ind] = iterator;
            } else {
              let metrado = this.tablaSistema[ind];
              let k = 0;
              if (!metrado) {
                this.auxidfila++
                let metrado = {
                  id_proyecto: this.id_proyecto,
                  id_fila: this.auxidfila,
                  formula: '',
                  tipofila: 2,
                  total: '',
                  mostrar:1,
                };
                for (const key of celdasEspecificas) {
                  metrado[key] = iterator[array[k]];
                  k++;
                }
                this.tablaSistema.push(metrado);
              } else {
                for (const key of celdasEspecificas) {
                  metrado[key] = iterator[array[k]];
                  k++;
                }
                metrado.id_fila = this.auxidfila;
                metrado.tipofila = 2;
                metrado.mostrar=1,
                metrado.icomost=0,
                this.tablaSistema[ind] = metrado;
              }
            }
          }
          ind++;
        }
        this.ultiCelda = null;
      } else {
        this.mostrarInfo('Ningun dato  copiada', '',2000)
        return;
      }
    }
    this.ultiCelda = null;
    this.celdasCopiadosMetrado = [];
    this.limpiarCopiados()
    const excedido = await this.actuaTablaSistema(true)
    this.modificandofila = false;
    if (excedido) {
      this.tablaSistema=this.tablasistemaaxi
      await this.actuaTablaSistema(false)
    }
  }
  async copiarFraccionTabla() {
    this.tablasistemaaxi=await JSON.parse(JSON.stringify(this.tablaSistema))
    this.copiadoCeldas = true;
    this.inicioCeldaCopiado = null;
    this.finCeldaCopiado = null;
    this.metradoSeleccionado = null;
    this.IndexMetradoDiario = null;
  }
  async descartaCambios(){
    const respu = await SwalService.confirm('Esta seguro que desea Descartar los Cambios?','')
      if (respu.isConfirmed) {
        this.mostrar_carga = true;
        this.tablaSistema=this.tablainicialdiario
        this.CompletarTablaSistema()
        this.mostrar_carga = false;
      }
  }
  ultiCelda: any;
  celdasCopiadosMetrado = []
  async reiniciarFormula() {
    if (this.metradoSeleccionado &&this.metradoSeleccionado?.id_fila !== null&&this.metradoSeleccionado?.id_fila !== '') {
      const filaSel2 = JSON.parse(JSON.stringify(this.IndexMetradoDiario));
      let arrayIndices = []
      let formulas=[]
      if (this.metradoSeleccionado.tipofila==2) {
        for (let i = filaSel2 + 1; i < this.tablaSistema.length; i++) {
          const row = this.tablaSistema[i];
          if (row.id_fila !== null&&row.id_fila !== '') {
            if (row.tipofila==1||row.tipofila==2) {
              break;
            }else if (row.tipofila==3) {
              arrayIndices.push(i);
              formulas.push(row.formula)
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
        } 
      }else if (this.metradoSeleccionado.tipofila==3) {
        arrayIndices.push(this.IndexMetradoDiario);
        formulas.push(this.metradoSeleccionado.formula)
      }
      if (arrayIndices.length) {
        for (const iterator of arrayIndices) {
          this.tablaSistema[iterator].formula = '';
        }
        const excedido = await this.actuaTablaSistema(true)
        if (excedido) {
          console.log(formulas)
          let i=0
          for (const iterator of arrayIndices) {
            this.tablaSistema[iterator].formula =formulas[i];
            i++
          }
          await this.actuaTablaSistema(false)
        }
      }
    }
  }
  valorAnterior: string = '';
  guardarValorAnterior(valor: string) {
    this.valorAnterior = valor;
  }
  async ngOnDestroy() {
   if(this.subvista==2&&this.existecambios){
    await this.guardarCambios()
    this.existecambios=false
   }
   window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }
  async handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.subvista === 2 && this.existecambios) {
      await this.guardarCambios();
      event.preventDefault();
      event.returnValue = '';
    }
  }
  @HostListener('window:resize', ['$event'])
  async onResize() {
    var resto = 210;
    this.height = window.innerHeight - resto;
    if (document.body.clientWidth <= 768) {
      this.vistagrande = false;
      //this.mostrarModal = true;
    } else {
      //this.mostrarModal = false;
      this.vistagrande = true;
      if (!this.expanded) {
        //this.cerrarModal()
      }
    }
   await this.CheckTamanio()
  }
  async CheckTamanio(){
    setTimeout(() => {
      if (this.box2) {
        const wBotones = this.box2.nativeElement.clientWidth;
        if (wBotones < 800) {
          this.scrollbut = true;
        } else {
          this.scrollbut = false;
        }
      }
    }, 0);
  }
  @ViewChild('box2', { static: false }) box2!: ElementRef;
  vistagrande = true;
  expanded = false;
  private viewCheckedExecuted = false; 
  ngAfterViewChecked() {
    if (!this.viewCheckedExecuted && this.box2) {
      setTimeout(() => {
        this.CheckTamanio();
        this.viewCheckedExecuted = true; 
        this.cdRef.detectChanges(); 
      }, 0);
    }
  }
  leftDivBut2() {
    var face1 = document.getElementById('divbut2');
    face1.scrollLeft += 15;
  }
  rigthDivBut2() {
    var face1 = document.getElementById('divbut2');
    face1.scrollLeft -= 15;
  }
}
