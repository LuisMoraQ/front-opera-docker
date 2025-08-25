import { Component, OnInit, Input } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import {
  arraydcols,
  arraygcols,
  arrayicols,
} from '../../proyectos/principal/hoja-metrados/modal-metrado-excel/metrado';
import { SwalService } from 'src/app/servicios/swal.service';

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
  }
  dataSource1 = [];
  constructor(
    public metradoService: MetradoService,
    public formsService: FormsService,
  ) {}

  ngOnInit(): void {
    this.ordenarPorFechaInicio(true);
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  subvista = 1;
  id_registro;
  async cambioVista(ind: any) {
    this.subvista = ind;
    if(ind==2){
      await this.listarTitulos2()
    }
  }
  async ordenarPorFechaInicio(bool = false) {
    this.dataSource1 = await this.metradoService.listarRegistroMetrados({
      id_proyecto: this.id_proyecto,
    });
    console.log(this.dataSource1);
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
  fila1_sel;
  registrotab3;
  cambindicesel1(ind: any, datos) {
    if (ind != this.fila1_sel) {
      this.fila1_sel = ind;
    }
    this.registrotab3 = datos.id_registro;
    // this.datosglo = datos;
  }
  getItemByIndice(valor) {
    return this.dataSource1.find((item) => item.id_registro == valor);
  }
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  mostrar_carga_todo = false;
  pintar() {
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }
  tablaExcelAdjunta = [];
  headerExcel = [];
  titInformSel;
  tablaTitulo;
  noConsistente;
  vinculadoExcel;
  noConsistente2;
  faltantesPresupuesto = [];
  tablaTitResumen;
  indiceTitulo;
  tablaPrincipal
  async listarTitulos2() {
    const obj = {
      id_proyecto: this.id_proyecto,
    };
    const response = await this.metradoService.listarTitulosDeMetrados(obj);
    if (response.length) {
      this.tablaTitResumen = response;
      this.indiceTitulo = this.tablaTitResumen[0].indice;
    } else {
      this.tablaTitResumen = [];
      this.indiceTitulo = null;
    }
    this.verHojaResumenDiario()
  }
  
  async verHojaResumenDiario() {
    this.aspectos = JSON.parse(this.colores);
    await this.pintar();
    this.mostrar_carga_todo = true;
    setTimeout(async () => {
      this.headerExcel = null;
      this.tablaExcelAdjunta = [];
      this.noConsistente = false;
      this.noConsistente2 = false;
      this.faltantesPresupuesto = [];
      this.vinculadoExcel = true;
      let titulo = await this.tablaTitResumen.find(
        (ele) => ele.indice == this.indiceTitulo
      );
      this.titInformSel = titulo;

      if (this.indiceTitulo !== titulo.indice) {
        this.indiceTitulo = titulo.indice;
        let tabla = await this.filtrarTitulo(titulo);
        this.tablaTitulo = tabla;
      }
      const response = await this.listarTablaExcel(titulo.indice, titulo.item);
      this.tablaExcelAdjunta = response[0]
      for (let i = 0; i < this.tablaExcelAdjunta.length; i++) {
        const row = this.tablaExcelAdjunta[i];
        const nextRow = this.tablaExcelAdjunta[i + 1];
        row.mostrar = row.item ? 1 : 0;
        row.tieneSiguiente = row.item && nextRow && !nextRow.item ? 1 : 0;
      }
      console.log(this.tablaTitResumen);
      console.log(this.tablaExcelAdjunta);
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
      const response = await this.metradoService.listarTopMetradosDiarios(obj);
      return response;
    } catch (e) {
      SwalService.error();
      console.log(e);
    }
  }
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
    // this.tablavistametradodiario = await this.metradoService.reporteMetradosMes(
    //   obj
    // );
    //   console.log(this.tablavistametradodiario)
    //   const aspectos = await this.principalService.ListarAspectosDiasProy({
    //     id_proyecto: this.id_proyecto,
    //   });
    //   this.id_registroact = datos.id_registro;
    //   this.diasCalendario2 = await this.generateCalendar(
    //     datos.fechaini,
    //     datos.fechafin,
    //     aspectos[0],
    //     aspectos[1]
    //   );
    //   this.mostrar_carga_todo = false;
  }
}
