import { Component, OnInit, Input, ViewChild,HostListener } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import * as moment from 'moment';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportesComponent } from '../../proyectos/reportes/reportes.component';
import * as math from 'mathjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-informes-reportes',
  templateUrl: './informes-reportes.component.html',
  styleUrls: ['./informes-reportes.component.scss'],
})
export class InformesReportesComponent implements OnInit {
  id_proyecto;
  prueba;
  id_userproy;
  tipoProy;
  colores;
  decima;
  solover;
  moneda;
  simbolo;
  nomproy;
  dec_metrado;
  dec_parcial;
  scrollbut=false
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
    this.dec_parcial = this.prueba.value.decimal.split('|')[2] ?? 2;
  }
  dataSource1 = [];
  @ViewChild('modalEstado') modalEstado: ModalBasicComponent;
  constructor(
    public metradoService: MetradoService,
    public formService: FormsService,
    private modalService: NgbModal,
    public principalService: PrincipalService,
    private toaster: ToastrService,
    private presuservice: PresupuestosService
  ) {}
  directototal;
  async ngOnInit() {
    this.scrollbut=document.body.clientWidth <= 980?true:false;
    await this.CargarTabla1();
  }
  async CargarTabla1() {
    this.mostrar_carga_todo = true;
    this.dataSource1 = await this.metradoService.ListarTotalRegistros({
      id_proyecto: this.id_proyecto,
    });
    let res = await this.presuservice.ListarPresuIndirecto({
      id_usuario: this.id_userproy,
      id_proyecto: this.id_proyecto,
      titulo: 0,
    });
    if (res.id == '1') {
      let tablapas = JSON.parse(res.tabla);
      let elementoEncontrado = tablapas[0].find(
        (item) => item.tipo_registro === 3
      );
      this.directototal = elementoEncontrado?.monto;
    }
    this.mostrar_carga_todo = false;
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  subvista = 1;
  id_registro;
  async cambioVista(ind: any) {
    this.subvista = ind;
    if (ind == 2) {
      await this.listarTitulos2();
    }
  }
  fila1_sel;
  registrotab3;
  datosglo;
  cambindicesel1(ind: any, datos) {
    if (ind != this.fila1_sel) {
      this.fila1_sel = ind;
    }
    this.registrotab3 = datos.id_registro;
    this.datosglo = datos;
  }
  getItemByIndice(valor) {
    return this.dataSource1.find((item) => item.id_registro == valor);
  }
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  mostrar_carga_todo = false;
  mostrar_carga = false;
  pintar() {
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }
  buscando1: boolean = false;
  tablasaldos = [];
  tablafooter = [];
  async listarTitulos2() {
    this.aspectos = JSON.parse(this.colores);
    await this.pintar();
    this.mostrar_carga_todo = true;
    this.buscando1 = true;
    const datos = {
      id_proyecto: this.id_proyecto,
      id_registro: this.datosglo.id_registro,
      fecha: moment(this.datosglo.fechaini).format('YYYY-MM-DD'),
      titulo: 0,
    };
    const respuesta = await this.metradoService.ListarMetradosSaldos(datos);
    this.tablasaldos = respuesta[0] || [];
    this.tablafooter = respuesta[1] || [];
    let aux;
    let aux2;
    for (let k = 0; k < this.tablafooter.length; k++) {
      let array = this.tablafooter[k];
      if (k == 0) {
        aux = array.suma_total_actual / array.monto;
        aux2 = array.suma_total_anterior / array.monto;
        array.acumulado = array.suma_total_actual + array.suma_total_anterior;
        array.saldo = array.monto - array.acumulado;
      } else {
        array.suma_total_actual = array.monto * aux;
        array.suma_total_anterior = array.monto * aux2;
        array.acumulado = array.suma_total_actual + array.suma_total_anterior;
        array.saldo = array.monto - array.acumulado;
      }
    }
    this.buscando1 = false;
    this.mostrar_carga_todo = false;
  }
  datosproy = null;
  @HostListener('window:resize', ['$event'])
  async onResize() {
    this.scrollbut=document.body.clientWidth <= 980?true:false;
  }
  leftDivBut(){
    var face1 = document.getElementById('divbut3');
    face1.scrollLeft+=15;
  }
  rigthDivBut(){
    var face1 = document.getElementById('divbut3');
    face1.scrollLeft-=15;
  }
  async enviarDataImpresion2() {
    if (this.datosproy == null) {
      const detalleProyecto =
        await this.principalService.recuperarDatosProyecto({
          id_proyecto: this.id_proyecto,
        });
      this.datosproy = detalleProyecto;
    }
    const arrayHeader = [
      [
        { text: 'ITEM', colSpan: 1, rowSpan: 3 },
        { text: 'DESCRIPCION', colSpan: 1, rowSpan: 3 },
        { text: 'PRESUPUESTO PROGRAMADO', colSpan: 4, rowSpan: 2 },
        { text: 'AVANCES', colSpan: 9, rowSpan: 1 },
        { text: 'SALDO', colSpan: 3, rowSpan: 2 },
      ],
      [
        { text: 'ANTERIOR', colSpan: 3, rowSpan: 1 },
        { text: 'ACTUAL', colSpan: 3, rowSpan: 1 },
        { text: 'ACUMULADO', colSpan: 3, rowSpan: 1 },
      ],
      [
        { text: 'Unid', colSpan: 1, rowSpan: 1 },
        { text: 'Metrado', colSpan: 1, rowSpan: 1 },
        { text: 'P. Unitario', colSpan: 1, rowSpan: 1 },
        { text: 'Presu', colSpan: 1, rowSpan: 1 },
        { text: 'Metrado', colSpan: 1, rowSpan: 1 },
        { text: 'Valorizado', colSpan: 1, rowSpan: 1 },
        { text: '%', colSpan: 1, rowSpan: 1 },
        { text: 'Metrado', colSpan: 1, rowSpan: 1 },
        { text: 'Valorizado', colSpan: 1, rowSpan: 1 },
        { text: '%', colSpan: 1, rowSpan: 1 },
        { text: 'Metrado', colSpan: 1, rowSpan: 1 },
        { text: 'Valorizado', colSpan: 1, rowSpan: 1 },
        { text: '%', colSpan: 1, rowSpan: 1 },
        { text: 'Metrado', colSpan: 1, rowSpan: 1 },
        { text: 'Valorizado', colSpan: 1, rowSpan: 1 },
        { text: '%', colSpan: 1, rowSpan: 1 },
      ],
    ];
    const arrayKeys = [
      'item',
      'descripcion',
      'unidad',
      'cantidad',
      'precio',
      'parcial',
      'metrado_anterior',
      'total_anterior',
      'porcentaje_anterior',
      'metrado_actual',
      'total_actual',
      'porcentaje_actual',
      'metrado_acumulado',
      'total_acumulado',
      'porcentaje_acumulado',
      'metrado_saldo',
      'total_saldo',
      'porcentaje_saldo',
    ];
    const arrdec = [
      null,
      null,
      null,
      this.dec_metrado,
      this.dec_parcial,
      this.dec_parcial,
      this.dec_metrado,
      this.dec_parcial,
      null,
      this.dec_metrado,
      this.dec_parcial,
      null,
      this.dec_metrado,
      this.dec_parcial,
      null,
      this.dec_metrado,
      this.dec_parcial,
      null,
    ];
    const arralig = [
      'left',
      'left',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
    ];
    const tabla2 = []
     for (const iterator of this.tablafooter) {
      const obj2 = [
        { text: '', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'left'},
        { text: iterator.descripcion, colSpan: 4, tipoletra:'3',color:'',fondo:'',alinea:'left' },
        { text: iterator.monto, colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'center' },
        { text: '', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'left'},
        { text: iterator.suma_total_anterior??'', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'center' },
        { text: this.formService.redondeo(iterator.suma_total_anterior*100/iterator.monto,2)+'%', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'center' },
        { text: '', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'left'},
        { text: iterator.suma_total_actual??'', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'center' },
        { text: this.formService.redondeo(iterator.suma_total_actual*100/iterator.monto,2)+'%', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'center' },
        { text: '', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'left'},
        { text: iterator.acumulado??'', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'center' },
        { text: this.formService.redondeo(iterator.acumulado*100/iterator.monto,2)+'%', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'center' },
        { text: '', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'left'},
        { text: iterator.saldo??'', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'center' },
        { text: this.formService.redondeo(iterator.saldo*100/iterator.monto,2)+'%', colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'center' },
      ]
      tabla2.push(obj2)
    }
    let aux = JSON.parse(JSON.stringify(this.tablasaldos));
    let arrpasa = [];
    for (let row of aux) {
      //asignar colores
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
      if (this.titulo1color != undefined) {
        if (row.unidad != '') {
          fondol = this.titulo1color[11];
        } else {
          let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
          fondol = this.titulo1color[ind];
        }
      }
      if (this.titulo1 != undefined) {
        if (row.unidad != '') {
          tipol = this.titulo1[11];
        } else {
          let ind = valor2.length >= 12 ? 11 : valor2.length - 1;
          tipol = this.titulo1[ind];
        }
      }
      let esp = ' ';
      let descp = esp.repeat(valor2.length - 1) + row.descripcion;
      arrpasa.push({
        item: row.item,
        descripcion: descp,
        unidad: row.unidad,
        cantidad: !row.cantidad
          ? ''
          : this.formService.redondeo(row.cantidad, this.dec_metrado),
        precio: !row.precio
          ? ''
          : this.formService.redondeo(row.precio, this.dec_parcial),
        parcial: !row.parcial
          ? ''
          : this.formService.redondeo(row.parcial, this.dec_parcial),
        metrado_anterior: !row.metrado_anterior
          ? ''
          : this.formService.redondeo(row.metrado_anterior, this.dec_metrado),
        total_anterior: !row.total_anterior
          ? ''
          : this.formService.redondeo(row.total_anterior, this.dec_parcial),
        porcentaje_anterior: row.porcentaje_anterior,
        metrado_actual: !row.metrado_actual
          ? ''
          : this.formService.redondeo(row.metrado_actual, this.dec_metrado),
        total_actual: !row.total_actual
          ? ''
          : this.formService.redondeo(row.total_actual, this.dec_parcial),
        porcentaje_actual: row.porcentaje_actual,
        metrado_acumulado: !row.metrado_acumulado
          ? ''
          : this.formService.redondeo(row.metrado_acumulado, this.dec_metrado),
        total_acumulado: !row.total_acumulado
          ? ''
          : this.formService.redondeo(row.total_acumulado, this.dec_parcial),
        porcentaje_acumulado: row.porcentaje_acumulado,
        metrado_saldo: !row.metrado_saldo
          ? ''
          : this.formService.redondeo(row.metrado_saldo, this.dec_metrado),
        total_saldo: !row.total_saldo
          ? ''
          : this.formService.redondeo(row.total_saldo, this.dec_parcial),
        porcentaje_saldo: row.porcentaje_saldo,
        tipoletra: tipol,
        color: colorl == 'unset' ? '' : colorl,
        fondo: fondol == 'none' ? '' : fondol,
      });
    }
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec: arrdec,
      col_alig: arralig,
      tabla: arrpasa,
      tabla2: tabla2,
      concat_tabla2: true,
      tipo_reporte: 6,
      reporte:0,
      orientacion: 'landscape',
      moneda: this.simbolo,
      titulo: 'VALORIZACION PROGRAMADA',
      dec_parcial: this.dec_parcial,
    };
    const modalRef = this.modalService.open(ReportesComponent, {
      size: 'lg modalgrande',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false,
    });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
  calcularTotal(array) {
    let total = 0;
    for (let k = 0; k < array.length; k++) {
      if (
        array[k].tipofila == 2 &&
        array[k].total !== '' &&
        array[k].total !== null
      ) {
        total = total + parseFloat(array[k].total);
      }
    }
    return total;
  }
  convertirAArray(expresion: string): string[] {
    const partes = expresion.split(/([\+\-\*/\(\)])/);
    const resultado = partes.filter((elemento) => elemento !== '');
    return resultado;
  }
  calcularformula(texto) {
    try {
      return math.evaluate(texto);
    } catch {
      return null;
    }
  }
  async changeVista(datos) {
    this.datosglo = datos;
    this.cambioVista(2);
  }
  formEstado = new UntypedFormGroup({
    detalle2: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl(0, [Validators.required]),
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
  id_registro2;
  openModal2(datos = null) {
    if (datos != null) {
      this.id_registro2 = datos.id_registro;
      this.formEstado.get('detalle2').setValue(datos?.detalle);
      this.formEstado
        .get('observacion')
        .setValue(
          datos.observacion == 'null' ||
            datos.observacion == null ||
            !datos.observacion
            ? ''
            : datos.observacion
        );
      this.modalEstado.show();
    }
  }
  closeModal2() {
    this.modalEstado.hide();
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
          this.dataSource1[this.fila1_sel].estado = 0;
          this.dataSource1[this.fila1_sel].fecha_aprob = '';
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
}
