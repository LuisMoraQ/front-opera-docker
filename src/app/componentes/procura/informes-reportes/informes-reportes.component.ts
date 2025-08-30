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
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import * as moment from 'moment';

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
  dec_parcial
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
  constructor(
    public metradoService: MetradoService,
    public formsService: FormsService,
    private presuservice: PresupuestosService
  ) {}
  directototal;
  async ngOnInit() {
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
    let actual = 0;
    for (let row of this.dataSource1) {
      row.avance =
        this.formsService.redondeo(
          (row.total_proyecto * 100) / this.directototal,
          2
        ) + '%';
      row.acumulado = this.formsService.redondeo(
        actual + row.total_proyecto,
        2
      );
      actual = actual + row.total_proyecto;
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
  datosglo
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
  tablasaldos=[]
  async listarTitulos2() {
    this.aspectos = JSON.parse(this.colores);
    await this.pintar();
    this.mostrar_carga_todo = true;
    this.buscando1=true
    const datos = {
          id_proyecto: this.id_proyecto,
          id_registro: this.datosglo.id_registro,
          fecha: moment(this.datosglo.fechaini).format('YYYY-MM-DD'),
        };
    const respuesta= await this.metradoService.ListarMetradosSaldos(datos);
    this.tablasaldos=respuesta[0]
    this.buscando1=false
    this.mostrar_carga_todo = false;
  }
  async changeVista(datos) {
    this.datosglo=datos
    this.cambioVista(2)
  }
  //falta
  async changeVista2(datos) {
    this.datosglo=datos
     this.cambioVista(2)
  }
}
