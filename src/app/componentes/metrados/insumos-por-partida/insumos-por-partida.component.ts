import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
export interface rowacu {//revisar parametros de esta fila
  id_proyecto: any;
  indice: any;
  id_filadetalle: any;
  id_tipo_insumo: any;
  num_det: any;
  codigo: any;
  descripcion: any;
  id_unidad: any;
  unidad: any;
  operador: any;
  tipo_insumo: any;
  cuadrilla: any;
  cantidad: any;
  precio: any;
  parcial: any;
  id_indice: any;
  id_clasificacion: any;
  id_insumo: any;
  id_subpartida: any;
  indice_subp: any;
  accion: any;
  esinsumo: any;
  afcuadrilla: any;
  rendimiento: any;
  und_rendi: any;
  jornada: any;
  advceros: any;
  referencia: any;
  desc_clasi: any;
  //afectaref:any;//no existe en tabla detalle, //0:no es subpartida, 1:agregar referencia, 2:eliminar referencia, para actualizar las referencias en bd
  icomost: any;
  mostrar: any;
  editar: any;
  editar2: any;
  ind: any
  seleccion: any;
  asignaund: any;
  zidmodi: any;
}

export interface filaAcue {
  id_acue: number,
  id_proyecto: number,
  indice: number,
  tipo: number,
  ind_gp: number,
  fecha: string,
  mostrar: number,
  descripcion: string,
  unidad: string
}
@Component({
  selector: 'app-insumos-por-partida',
  templateUrl: './insumos-por-partida.component.html',
  styleUrls: ['./insumos-por-partida.component.scss']
})
export class InsumosPorPartidaComponent implements OnInit {
  id_proyecto = null
  idusuario = null
  subvista = 1
  mostrar_carga_todo = false
  datasourcePri = []
  datasourcePriacu = [];
  datasourcePrisub = [];
  datasourcePrisubaux;
  prueba = null
  id_userproy = null
  tipoProy = '';
  colores: any;
  decima: any;
  solover = false;
  moneda = 'S/';
  simbolo = ''
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  tituloSeleccionado = null
  meses = []
  dias = []
  titulos = []
  busqueda = ''
  camposBusqueda = ['item', 'descripcion', 'unidad'];
  filaSel = null
  mesSeleccionado = null
  tablaacusel = [];
  filaSelacu = -1;
  undconcatrendi = '';
  edicionacu = true;
  editajor = false;
  esgruposel = false;
  acuxmetrado = false;
  dec_parcial = 2;
  butselprecio = '3';
  dec_cant = 4;
  diaSeleccionado = null
  tablaAcue: filaAcue[] = []
  acueCompletoMes: filaAcue[] = []
  registroAcue = true
  mostrar_carga_todo2 = false;
  busquedaMod = ''
  @Input() set tabproyecto(value: any) {
    this.prueba = value
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = (value.get('aspectos_generales') as UntypedFormGroup)
    const datosproy = (aspectosGen.get('datos_proyecto') as UntypedFormGroup)
    const datosrec = (aspectosGen.get('datos_recuperado') as UntypedFormGroup)
    this.id_userproy = datosrec.value.id_usuario;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    this.moneda = datosproy.get('moneda').value.toString() == '0' ? 'S/' : '$';
    this.simbolo = datosrec.value.simbolo
  }
  formDataPartida = new UntypedFormGroup({
    item: new UntypedFormControl(''),
    descripcion: new UntypedFormControl('', [Validators.required]),
    unidad: new UntypedFormControl('', [Validators.required]),
    precio: new UntypedFormControl('', [Validators.required, Validators.min(0)]),
    rendimiento: new UntypedFormControl('', []),
    undrendimiento: new UntypedFormControl('', []),
    jornada: new UntypedFormControl('', []),
    ratio: new UntypedFormControl('', []),
    id_usuario: new UntypedFormControl('', []),
  })
  get item(): UntypedFormControl { return this.formDataPartida.get('item') as UntypedFormControl }
  get descripcion(): UntypedFormControl { return this.formDataPartida.get('descripcion') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formDataPartida.get('unidad') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.formDataPartida.get('precio') as UntypedFormControl }
  get rendimiento(): UntypedFormControl { return this.formDataPartida.get('rendimiento') as UntypedFormControl }
  get undrendimiento(): UntypedFormControl { return this.formDataPartida.get('undrendimiento') as UntypedFormControl }
  get jornada(): UntypedFormControl { return this.formDataPartida.get('jornada') as UntypedFormControl }
  get ratio(): UntypedFormControl { return this.formDataPartida.get('ratio') as UntypedFormControl }
  get id_usuario(): UntypedFormControl { return this.formDataPartida.get('id_usuario') as UntypedFormControl }

  @ViewChild("modalRegistroSaldo") modalRegistroSaldo: ModalBasicComponent;

  constructor(private toaster: ToastrService, public metradoService: MetradoService, private presuservice: PresupuestosService, public formService: FormsService,) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      this.aspectos = JSON.parse(this.colores);
      this.pintar();
      await this.listarPresupuesto()
      await this.calendario()
      this.mostrar_carga_todo = false
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      this.toaster.error('La información no cargo correctamente. Actualizar la pestaña.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }

  async calendario() {
    const obj = {
      id_proyecto: this.id_proyecto
    }
    console.log('2')
    const resp = await this.metradoService.generarCalendarioProyecto(obj)
    if (resp) {
      this.meses = resp
      this.mesSeleccionado = 0
      this.dias = this.meses[this.mesSeleccionado].dias
      console.log('this.dias', this.dias)
    } else {
      this.meses = []
      this.mesSeleccionado = null
    }
  }

  pintar() {
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async listarPresupuesto() {
    let res = await this.presuservice.listarTopPresupuesto({ id_proyecto: this.id_proyecto });
    this.datasourcePri = res[0]
    this.titulos = this.datasourcePri.filter(ele => {
      const long = ele.item.split('.');
      return long.length == 1;
    });
    if (this.titulos.length) {
      const todos = {
        item: 0,
        descripcion: 'TODOS'
      }
      this.titulos.unshift(todos)
      this.tituloSeleccionado = 0
    }
    this.datasourcePriacu = res[1];
    this.datasourcePrisub = res[2];
    this.datasourcePrisubaux = JSON.stringify(res[2]);
    console.log('1')
  }

  filtrarTitulo() {
    console.log('this.titulos', this.tituloSeleccionado)
    this.mostrar_carga_todo = true
    this.busqueda = ''
    this.filaSel = null
    const item = this.titulos[this.tituloSeleccionado].item
    for (const element of this.datasourcePri) {
      if (item) {
        const primero = element.item.split('.')[0]
        if (primero == item) {
          element.mostrar = 1
        } else {
          element.mostrar = 0
        }
      } else {
        element.mostrar = 1
      }
    }
    this.mostrar_carga_todo = false
  }

  limpiarfiltro() {
    this.busqueda = '';
  }

  async cambioVista(ind: any) {
    if (this.subvista !== ind) {
      this.mostrar_carga_todo = true
      this.subvista = ind
      this.mostrar_carga_todo = false
    } else {
      return
    }
  }

  maxtodo() {
    for (let row of this.datasourcePri) {
      if (row.item.split('.').length > 1) {
        row.mostrar = 1;
      }
      row.icomost = 1;
      row.estmost = 1;
    }
  }

  mintodo() {
    for (let row of this.datasourcePri) {
      if (row.item.split('.').length > 1) {
        //row.estmost=row.mostrar;
        row.mostrar = 0;
      }
      else {
        row.icomost = 0; row.mostrar = 1;
      }
    }
  }

  Expandetodo() {//icomost   1 mostrar, 0 ocultar
    if (this.filaSel > -1) {
      let row = this.datasourcePri[this.filaSel];
      if (row.unidad == '') {

        let itemsel = row.item;
        row.icomost = 1;
        let nuevogru = false;
        for (let i = this.filaSel + 1; i < this.datasourcePri.length; i++) {
          if (this.datasourcePri[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              this.datasourcePri[i].mostrar = 1;
              this.datasourcePri[i].icomost = 1;
              this.datasourcePri[i].estmost = 1;
            }
            else {
              nuevogru = true;
            }
          }
          else { break; }
        }
      }
    }
  }

  ContraeTodo() {
    if (this.filaSel > -1) {
      let row = this.datasourcePri[this.filaSel];
      if (row.unidad == '') {

        let inpri = this.filaSel;
        let itemsel = row.item;
        row.icomost = 1;
        let nuevogru = false;
        for (let i = inpri + 1; i < this.datasourcePri.length; i++) {
          if (this.datasourcePri[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              if (this.datasourcePri[i].item.split('.').length == (itemsel.split('.').length + 1)) {
                this.datasourcePri[i].mostrar = 1;
                this.datasourcePri[i].icomost = 0;
                this.datasourcePri[i].estmost = 1;
              }
              else {
                this.datasourcePri[i].mostrar = 0;
                this.datasourcePri[i].icomost = 0;
                this.datasourcePri[i].estmost = 0;
              }
            }
            else {
              nuevogru = true;
            }
          }
          else { break; }
        }
      }
    }
  }

  cambioMes() {
    this.mostrar_carga_todo = true
    this.dias = this.meses[this.mesSeleccionado].dias
    this.mostrar_carga_todo = false
  }

  async cambindiceselpresu(ind: any, compara = false) {
    if (ind != this.filaSel || compara) {
      this.filaSel = ind;
      this.filaSelacu = -1;
      if (ind > -1) {
        let rowsel = this.datasourcePri[this.filaSel];
        this.formDataPartida.reset({
          item: rowsel.item,
          descripcion: rowsel.descripcion,
          unidad: rowsel.unidad,
          precio: rowsel.precio,
          rendimiento: rowsel.rendimiento,
          undrendimiento: rowsel.und_rendi,
          jornada: rowsel.jornada,
          usuario: rowsel.usuario,
        });
        this.undconcatrendi = rowsel.unidad;
        if (rowsel.unidad == '' && this.edicionacu) {
          this.unidad.disable();
          this.rendimiento.disable();
          this.undrendimiento.disable();
          this.jornada.disable();
        }
        else if (rowsel.unidad != '' && this.edicionacu) {
          this.unidad.enable();
          this.rendimiento.enable();
          //this.undrendimiento.enable();
          this.jornada.enable();
        }
        if (!this.editajor) {
          this.jornada.disable();
        }
        this.tablaacusel = [];
        if (rowsel.unidad != '') {
          this.esgruposel = false;
          if (this.acuxmetrado) {//acuxmetrado
            let tabacu = JSON.parse(JSON.stringify(this.datasourcePriacu));
            let tabresult = [];
            for (let b = 0; b < tabacu.length; b++) {
              if (tabacu[b].indice == rowsel.indice) {
                tabacu[b].cantpadre = rowsel.cantidad;
                tabresult.push(tabacu[b]);
              }
            }
            this.tablaacusel = this.getRelInsFila(tabresult, Number(rowsel.parcial));
            this.formDataPartida.get('precio').setValue(this.formService.redondeo(rowsel.parcial, this.dec_parcial));
          }
          else {
            let summano = 0;
            let summat = 0;
            let sumeq = 0;
            let sumsubc = 0;
            let sumsubp = 0;
            for (let i = 0; i < this.datasourcePriacu.length; i++) {
              if (this.datasourcePriacu[i].indice == rowsel.indice) {
                this.datasourcePriacu[i].ind = i;
                this.datasourcePriacu[i].seleccion = 0;
                this.tablaacusel.push(this.datasourcePriacu[i]);
                if (this.datasourcePriacu[i].unidad != '') {
                  if (this.datasourcePriacu[i].id_tipo_insumo == '1') {
                    summano += Number(this.datasourcePriacu[i].parcial);
                  }
                  else if (this.datasourcePriacu[i].id_tipo_insumo == '2') {
                    summat += Number(this.datasourcePriacu[i].parcial);
                  }
                  else if (this.datasourcePriacu[i].id_tipo_insumo == '3') {
                    sumeq += Number(this.datasourcePriacu[i].parcial);
                  }
                  else if (this.datasourcePriacu[i].id_tipo_insumo == '4') {
                    sumsubc += Number(this.datasourcePriacu[i].parcial);
                  }
                  else if (this.datasourcePriacu[i].id_tipo_insumo == '5') {
                    sumsubp += Number(this.datasourcePriacu[i].parcial);
                  }
                }
              }
            }
            //agregar filas agrupaciones
            let pindice = this.tablaacusel.length > 0 ? this.tablaacusel[0].indice : null;
            let filamano = this.CrearFilaAgru(pindice, 'MANO DE OBRA', '1', this.formService.redondeo(summano, this.dec_parcial), 1, 1);
            this.tablaacusel.push(filamano);
            filamano = this.CrearFilaAgru(pindice, 'MATERIALES', '2', this.formService.redondeo(summat, this.dec_parcial), 1, 0);
            this.tablaacusel.push(filamano);
            filamano = this.CrearFilaAgru(pindice, 'EQUIPO', '3', this.formService.redondeo(sumeq, this.dec_parcial), 1, 1);
            this.tablaacusel.push(filamano);
            filamano = this.CrearFilaAgru(pindice, 'SUB CONTRATOS', '4', this.formService.redondeo(sumsubc, this.dec_parcial), 1, 0);
            this.tablaacusel.push(filamano);
            filamano = this.CrearFilaAgru(pindice, 'SUB PARTIDAS', '5', this.formService.redondeo(sumsubp, this.dec_parcial), 0, 0);
            this.tablaacusel.push(filamano);
            this.tablaacusel.sort((a, b) => {
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
              return 0;
            });
            this.CalcRatio();
          }
        }
        else {//listado de insumos de titulo
          this.esgruposel = true;
          this.butselprecio = this.butselprecio == '1' ? '2' : this.butselprecio;
          let filapart = [];
          let nuevogru = false;
          for (let i = this.filaSel + 1; i < this.datasourcePri.length; i++) {
            if (this.datasourcePri[i].item != rowsel.item && !nuevogru) {
              var palabra = this.datasourcePri[i].item.toString().substring(0, rowsel.item.toString().length + 1)
              if (palabra == (rowsel.item + '.')) {
                if (this.datasourcePri[i].unidad != '') {
                  filapart.push(this.datasourcePri[i]);
                }
              }
              else {
                nuevogru = true;
              }
            }
            else { break; }
          }
          let tabacu = JSON.parse(JSON.stringify(this.datasourcePriacu));
          let tabresult = [];
          for (let fipart of filapart) {
            for (let b = 0; b < tabacu.length; b++) {
              if (tabacu[b].indice == fipart.indice) {
                tabacu[b].cantpadre = fipart.cantidad;
                tabresult.push(tabacu[b])
              }
            }
          }
          this.tablaacusel = this.getRelInsFila(tabresult, Number(rowsel.parcial));
          this.formDataPartida.get('precio').setValue(this.formService.redondeo(rowsel.parcial, this.dec_parcial));//cambiar por la suma total?
        }
      }
      else {
        this.formDataPartida.reset({
          item: '',
          descripcion: '',
          unidad: '',
          precio: '',
          rendimiento: '',
          undrendimiento: '',
          jornada: '',
          usuario: '',
          /* selprecio:'1' */
        });
        this.tablaacusel = [];
      }
    }
  }

  CalcRatio() {
    let valret = 0;
    for (let row of this.tablaacusel) {
      if (row.id_tipo_insumo == 1) {
        valret = Number(valret ?? 0) + Number(row.cantidad);
      }
    }
    //let valpasa=this.formService.redondeo(valret,this.dec_cant)+' hh/'+this.datasourcePri[this.filaSel].unidad;
    this.ratio.setValue(this.formService.redondeo(valret, this.dec_cant));
  }

  CrearFilaAgru(pindice: any, pdescripcion: any, pid_tipo_insumo: any, pparcial: any, pesinsumo: any, pafcuad: any) {
    let filaaux: rowacu = {
      id_proyecto: this.id_proyecto,
      indice: pindice,// se debe recuperar el indice del padre
      id_filadetalle: null,
      num_det: 0,
      codigo: null/* detpart[a].codigo=='' || detpart[a].codigo==null?null:detpart[a].codigo */,
      descripcion: pdescripcion,
      id_unidad: '',
      unidad: '',
      operador: null,
      tipo_insumo: null,
      cuadrilla: null,
      cantidad: null,
      precio: null,
      parcial: Number(pparcial),
      id_tipo_insumo: Number(pid_tipo_insumo),
      id_indice: null,
      id_clasificacion: null,//revisar valores
      desc_clasi: null,
      id_insumo: null,
      id_subpartida: null,
      indice_subp: null,
      accion: 0,
      esinsumo: pesinsumo,
      afcuadrilla: pafcuad,
      rendimiento: null,
      und_rendi: null,
      jornada: null,
      advceros: null,
      referencia: null,
      mostrar: 1,
      icomost: 1,
      editar: 0,
      editar2: 0,
      ind: -1,
      seleccion: 0,
      asignaund: 0,
      zidmodi: null
    };
    return filaaux;
  }

  getRelInsFila(tabla: any, totalfila: any) {
    let tabresult = [];
    for (let b = 0; b < tabla.length; b++) {
      if (tabla[b].num_det > 0) {
        const index = tabresult.findIndex(elem => {
          if (elem.operador != '%') {
            if (elem.id_tipo_insumo == tabla[b].id_tipo_insumo && elem.descripcion == tabla[b].descripcion && elem.precio == tabla[b].precio)
              return elem;
          }
          else {//revisar para porcentajes no agrupa?
            if (elem.id_tipo_insumo == tabla[b].id_tipo_insumo && elem.descripcion == tabla[b].descripcion)
              return elem;
          }
        });
        if (index > -1) {//si encuentra suma,
          if (tabresult[index].unidad != '') {
            if (tabla[b].operador == '%') {
              let rparc = this.formService.redondeo(Number(tabresult[index].parcial) + (Number(tabla[b].cantpadre) * Number(tabla[b].parcial)), this.dec_parcial);
              tabresult[index].parcial = this.formService.redondeo(Number(rparc), this.dec_parcial);
            }
            else {
              let ropera = this.formService.redondeo(Number(tabresult[index].parcial) + (Number(tabla[b].cantpadre) * Number(tabla[b].parcial)), this.dec_parcial);
              tabresult[index].parcial = Number(ropera);
              tabresult[index].cantidad = tabla[b].unidad != '' ? Number(this.formService.redondeo(Number(tabresult[index].parcial) / Number(tabresult[index].precio), this.dec_cant)) : tabresult[index].cantidad;
            }
          }
        }
        else {//si no encuentra se agrega
          if (tabla[b].operador == '%') {
            tabla[b].cantidad = 0;
            tabla[b].precio = 0;
            tabla[b].parcial = this.formService.redondeo(Number(tabla[b].cantpadre) * Number(tabla[b].parcial), this.dec_parcial);
          }
          else {
            let rparc = this.formService.redondeo(Number(tabla[b].cantpadre) * Number(tabla[b].parcial), this.dec_parcial);
            tabla[b].parcial = this.formService.redondeo(Number(rparc), this.dec_parcial);
            let ropera = this.formService.redondeo(Number(tabla[b].parcial) / Number(tabla[b].precio), this.dec_cant);
            tabla[b].cantidad = tabla[b].unidad != '' ? Number(ropera) : tabla[b].cantidad;
          }
          tabresult.push(tabla[b]);
          tabresult[tabresult.length - 1].num_det = tabresult[tabresult.length - 1].num_det > 0 ? 1 : tabresult[tabresult.length - 1].num_det;
          tabresult[tabresult.length - 1].cuadrilla = '';
        }
      }
    }
    //corregir total en % mano obra operador% tipo_insumo1
    let totax = 0;
    let indporc = -1;
    let indporc2 = -1;
    for (let r1 = 0; r1 < tabresult.length; r1++) {
      totax = totax += Number(tabresult[r1].parcial);
      if (tabresult[r1].operador == '%' && tabresult[r1].tipo_insumo == 1 && indporc == -1) {
        indporc = r1;
      }
      if (tabresult[r1].operador == '%' && indporc2 == -1) {
        indporc2 = r1;
      }
    }
    let indcor = indporc != -1 ? indporc : (indporc2 != -1 ? indporc2 : -1)
    if (indcor >= 0) {
      tabresult[indcor].parcial = this.formService.redondeo((Number(tabresult[indcor].parcial) + (totalfila - totax)), this.dec_parcial);
    }
    //fin corr
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
        }
        else if (tabresult[m].id_tipo_insumo == '2') {
          summat += Number(tabresult[m].parcial);
          if (tabresult[m].operador != '%') {
            spsummat += Number(tabresult[m].parcial);
          }
        }
        else if (tabresult[m].id_tipo_insumo == '3') {
          sumeq += Number(tabresult[m].parcial);
          if (tabresult[m].operador != '%') {
            spsumeq += Number(tabresult[m].parcial);
          }
        }
        else if (tabresult[m].id_tipo_insumo == '4') {
          sumsubc += Number(tabresult[m].parcial);
          if (tabresult[m].operador != '%') {
            spsumsubc += Number(tabresult[m].parcial);
          }
        }
        else if (tabresult[m].id_tipo_insumo == '5') {
          sumsubp += Number(tabresult[m].parcial);
        }
      }
    }
    //agregar filas agrupaciones
    let pindice = tabresult.length > 0 ? tabresult[0].indice : null;
    let filamano = this.CrearFilaAgru(pindice, 'MANO DE OBRA', '1', this.formService.redondeo(summano, this.dec_parcial), 1, 1);
    tabresult.push(filamano);
    filamano = this.CrearFilaAgru(pindice, 'MATERIALES', '2', this.formService.redondeo(summat, this.dec_parcial), 1, 0);
    tabresult.push(filamano);
    filamano = this.CrearFilaAgru(pindice, 'EQUIPO', '3', this.formService.redondeo(sumeq, this.dec_parcial), 1, 1);
    tabresult.push(filamano);
    filamano = this.CrearFilaAgru(pindice, 'SUB CONTRATOS', '4', this.formService.redondeo(sumsubc, this.dec_parcial), 1, 0);
    tabresult.push(filamano);
    filamano = this.CrearFilaAgru(pindice, 'SUB PARTIDAS', '5', this.formService.redondeo(sumsubp, this.dec_parcial), 0, 0);
    tabresult.push(filamano);
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
    for (let row of tabresult) {
      if (row.operador == "%") {
        row.precio = row.tipo_insumo == '1' ? spsummano : row.tipo_insumo == '2' ? spsummat : row.tipo_insumo == '3' ? spsumeq : row.tipo_insumo == '4' ? spsumsubc : '';
        let precfil = Number(row.precio);
        let parcial = Number(row.parcial);
        row.cantidad = row.precio == 0 || row.parcial == 0 ? 0 : this.formService.redondeo(parcial / precfil, this.dec_cant);
      }
    }
    return tabresult;
  }

  seleccionDia(dia) {
    if (this.diaSeleccionado !== dia)
      this.diaSeleccionado = dia
  }

  listarAcuePartida(row: any, i: number) {
    if (i === this.filaSel) {
      return;
    }
    console.log('i', i)
    this.filaSel = i
    // let rowsel = this.datasourcePri[this.filaSel];
    this.formDataPartida.reset({
      item: row.item,
      descripcion: row.descripcion,
      unidad: row.unidad,
      precio: row.precio,
      rendimiento: row.rendimiento,
      undrendimiento: row.und_rendi,
      jornada: row.jornada,
      usuario: row.usuario,
    });
    this.undconcatrendi = row.unidad;
    if (row.unidad == '' && this.edicionacu) {
      this.unidad.disable();
      this.rendimiento.disable();
      this.undrendimiento.disable();
      this.jornada.disable();
    }
    else if (row.unidad != '' && this.edicionacu) {
      this.unidad.enable();
      this.rendimiento.enable();
      //this.undrendimiento.enable();
      this.jornada.enable();
    }
    if (!this.editajor) {
      this.jornada.disable();
    }
    this.tablaAcue = [];
    const array = ['MANO DE OBRA', 'MATERIALES', 'EQUIPO', 'SUB CONTRATOS'];

    array.forEach((element, index) => {
      const j = index + 1;

      const cabecera: filaAcue = {
        fecha: element,
        id_acue: null,
        id_proyecto: this.id_proyecto,
        ind_gp: 0,
        indice: row.indice,
        mostrar: 1,
        tipo: j,
        descripcion: array[index],
        unidad: ''
      };

      this.tablaAcue.push(cabecera);

      const filtrados = this.acueCompletoMes.filter(ele =>
        ele.tipo === j &&
        ele.fecha === this.diaSeleccionado &&
        row.indice === ele.indice
      );

      filtrados.sort((a, b) => a.ind_gp - b.ind_gp);

      filtrados.forEach(ele => {
        const obj: filaAcue = {
          fecha: ele.fecha || '',
          id_acue: ele.id_acue,
          id_proyecto: this.id_proyecto,
          ind_gp: ele.ind_gp,
          indice: row.indice,
          mostrar: 1,
          tipo: j,
          descripcion: ele.descripcion,
          unidad: ele.unidad
        };
        this.tablaAcue.push(obj);
      });
    });
    console.log('this.tablaAcue', this.tablaAcue)
  }

  async modalAgregar(row) {
    try {
      if (this.filaSel == null || this.diaSeleccionado == null) {
        this.toaster.error('Seleccione una partida y un dia', '', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return
      }
      console.log('row', row)
      console.log('diaSeleccionado', this.diaSeleccionado)
      this.mostrar_carga_todo = true
      const fecha = this.diaSeleccionado?.fecha
      if (row.tipo == 2) {
        const obj = {
          id_proyecto: this.id_proyecto,
          fecha: fecha
        }
        const response = await this.metradoService.listadoMovAlmSalidaProyecto(obj)
        console.log('response', response)
      }

      this.busquedaMod = ''
      this.modalRegistroSaldo.show()
      this.mostrar_carga_todo = false
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }


  }

  limpiarfiltroMod() {
    this.busquedaMod = ''
  }

  cerrarModal() {
    this.modalRegistroSaldo.hide()
  }

  limpiarTodoDia() {

  }
}
