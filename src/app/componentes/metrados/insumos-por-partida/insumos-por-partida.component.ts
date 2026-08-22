import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { EquiposServiciosService } from 'src/app/servicios/equipos-servicios.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { ChangeDetectorRef } from '@angular/core';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SubcontratosService } from 'src/app/servicios/subcontratos.service';
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
  id_proyecto: number;
  indice: number;
  tipo: number;
  ind_gp: number;
  fecha: string;
  mostrar: number;
  descripcion: string;
  unidad: string;
  cuadrilla: number;
  cantidad: number;
  precio: number;
  parcial: number;
  agrupados?: any[]; // <--- Arreglo para almacenar los objetos originales del backend
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
  datasourcePri2 = []
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
  listadoAgrupado: any[] = [];
  listadoAgrupadoOriginal: any[] = []; // Guarda la copia intacta para restaurar al filtrar
  busquedaMod: string = '';
  tipoSel = null
  seHicieronCambiosModal: boolean = false;
  buscando = false
  totalAcueGeneral: number = 0;
  presupuestoCargado: boolean = false;
  mask_parcial = '0.2-2'
  mask_precio = '0.2-2'
  fechaHoy: string = '';
  resumenTabla: any[] = [];
  listaJornadasSemana = []
  modoSeleccion: boolean = false;
  seleccionarTodos: boolean = false;
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
  @ViewChild("modalComparativaPartida") modalComparativaPartida: ModalBasicComponent;

  constructor(private equiposServiciosService: EquiposServiciosService, private cdRef: ChangeDetectorRef, private toaster: ToastrService, public metradoService: MetradoService, private presuservice: PresupuestosService, public formService: FormsService, public principalService: PrincipalService, private subcontratosService: SubcontratosService) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      this.aspectos = JSON.parse(this.colores);
      this.pintar();
      await this.listarPresupuesto()
      this.obtenerFechaHoy();
      await this.listarPresActivid()
      this.obtenerJornadasSemanales()
      await this.calendario()
      this.mostrar_carga_todo = false
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      this.toaster.error('La información no cargo correctamente. Actualizar la pestaña.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }

  obtenerFechaHoy() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    // Formato 'YYYY-MM-DD' para comparar directamente con cadenas ISO (ej. '2026-08-12')
    this.fechaHoy = `${anio}-${mes}-${dia}`;

  }

  async obtenerJornadasSemanales() {
    const obj = {
      id_proyecto: this.id_proyecto,
      fecha: null // Tu controlador lo recibirá y lo convertirá a "NULL" para ConexionBiplan
    };

    try {
      const resp = await this.metradoService.listarJornada(obj);
      if (resp && resp.length > 0) {
        this.listaJornadasSemana = resp;
      }
    } catch (error) {
      console.error('Error al obtener jornadas:', error);
    }
  }

  async calendario() {
    const obj = {
      id_proyecto: this.id_proyecto
    }
    const resp = await this.metradoService.generarCalendarioProyecto(obj)
    if (resp) {
      this.meses = resp
      this.mesSeleccionado = 0
      this.dias = this.meses[this.mesSeleccionado].dias
      if (this.dias.length > 0) {
        await this.marcarDiasConRegistro()
      }
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

  async listarPresActivid(fecha = '') {
    const obj = {
      id_proyecto: this.id_proyecto,
      fecha: fecha
    }

    let res = await this.metradoService.listarPresupuestoActiv(obj);

    this.datasourcePri = this.calcularAcumuladosJerarquicos(res);
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
  }

  calcularAcumuladosJerarquicos(data: any[]): any[] {
    // Mapa para guardar la suma acumulada de las partidas hijas por item (ej. '1.1.1' -> 1375)
    const acumuladosMap = new Map<string, number>();

    // Recorremos de atrás hacia adelante (de las partidas hojas hacia los títulos)
    for (let i = data.length - 1; i >= 0; i--) {
      const fila = data[i];
      const item = fila.item; // ej: "1.1.1.1"

      // Si tiene unidad definida (partida hoja)
      if (fila.unidad && fila.unidad.trim() !== '') {
        // Mantiene el valor tal cual viene (null o número)
        const parcialHoja = fila.parcial;

        // Si tiene un número válido mayor a 0, lo sumamos al acumulador del padre
        if (parcialHoja !== null && parcialHoja !== undefined && Number(parcialHoja) > 0) {
          this.sumarAlPadre(acumuladosMap, item, Number(parcialHoja));
        }
      } else {
        // Si es Título / Subtítulo (sin unidad):
        // Verifica si existe algún valor acumulado registrado por sus hijos en el mapa
        if (acumuladosMap.has(item)) {
          const sumaHijos = acumuladosMap.get(item)!;
          fila.parcial = sumaHijos;

          // Propagamos la suma acumulada del subtítulo hacia su padre directo
          this.sumarAlPadre(acumuladosMap, item, sumaHijos);
        } else {
          // Si ningún hijo tuvo datos, se asigna explícitamente null
          fila.parcial = null;
        }
      }
    }

    return data;
  }

  /**
   * Función auxiliar para buscar el item del padre directo y sumar el parcial acumulado.
   */
  private sumarAlPadre(mapa: Map<string, number>, itemHijo: string, valor: number) {
    const partes = itemHijo.split('.');
    if (partes.length > 1) {
      partes.pop(); // Elimina el último nivel (ej. "1.1.1.1" -> "1.1.1")
      const itemPadre = partes.join('.');

      const sumaActual = mapa.get(itemPadre) || 0;
      mapa.set(itemPadre, sumaActual + valor);
    }
  }

  obtenerHorasJornadaPorFecha(fechaStr: string): number {
    if (!fechaStr || !this.listaJornadasSemana || this.listaJornadasSemana.length === 0) {
      return 0;
    }

    // Se parsea la fecha (asumiendo 'YYYY-MM-DD') evitando desfases de zona horaria
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day);

    // getDay() retorna: 0=Domingo, 1=Lunes, ..., 6=Sábado
    const diaSemana = fechaObj.getDay();

    // Mapeamos al posicion_dia del backend: Lunes(1), Martes(2), ..., Domingo(7)
    const posicionDia = diaSemana === 0 ? 7 : diaSemana;

    const jornadaEncontrada = this.listaJornadasSemana.find(
      (j) => Number(j.posicion_dia) === posicionDia
    );

    const horas = jornadaEncontrada ? Number(jornadaEncontrada.horas_jornada) || 0 : 0;

    // Actualizar el control del formulario
    this.formDataPartida.patchValue({ jornada: horas });

    return horas;
  }

  async listarPresupuesto() {
    let res = await this.presuservice.listarTopPresupuesto({ id_proyecto: this.id_proyecto });
    this.datasourcePri2 = res[0]
    // this.titulos = this.datasourcePri.filter(ele => {
    //   const long = ele.item.split('.');
    //   return long.length == 1;
    // });
    // if (this.titulos.length) {
    //   const todos = {
    //     item: 0,
    //     descripcion: 'TODOS'
    //   }
    //   this.titulos.unshift(todos)
    //   this.tituloSeleccionado = 0
    // }
    this.datasourcePriacu = res[1];
    this.datasourcePrisub = res[2];
    this.datasourcePrisubaux = JSON.stringify(res[2]);

  }

  filtrarTitulo() {
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

  async cambioMes() {
    this.mostrar_carga_todo = true
    this.dias = this.meses[this.mesSeleccionado].dias
    this.diaSeleccionado = null
    this.filaSel = null
    this.presupuestoCargado = false;
    this.tablaAcue = []
    this.busquedaMod = '';
    this.tipoSel = null
    this.seHicieronCambiosModal = false;
    this.totalAcueGeneral = 0;
    await this.listarPresActivid('');
    await this.marcarDiasConRegistro()

    this.mostrar_carga_todo = false
  }

  async marcarDiasConRegistro() {
    // Extraemos el año-mes en formato 'YYYY-MM' desde el primer día del array
    const anioMes = this.dias[0].fecha.substring(0, 7);

    const params = {
      id_proyecto: this.id_proyecto.toString(),
      anio_mes: anioMes
    };
    try {
      // 1. Traemos la lista de fechas registradas en BD (ej: [{ fecha: "2026-08-01" }, ...])
      const diasRegistrados: any[] = await this.metradoService.listarCalendarioRegistroActividades(params);
      // Convertimos la respuesta a un Set para búsquedas O(1) ultra rápidas
      const fechasConRegistroSet = new Set(diasRegistrados.map(item => item.fecha));

      // 2. Mapeamos tu array de días actualizando la propiedad 'estado'
      this.dias.forEach(dia => {
        dia.estado = fechasConRegistroSet.has(dia.fecha) ? 1 : 0;
      });

    } catch (error) {
      console.error('Error al verificar días con registro:', error);
    }
  }

  async cambindiceselpresu(ind: any, compara = false) {
    // if (ind != this.filaSel || compara) {
    // this.filaSel = ind;
    this.filaSelacu = -1;
    if (ind > -1) {
      let rowsel = this.datasourcePri2[ind];
      // this.formDataPartida.reset({
      //   item: rowsel.item,
      //   descripcion: rowsel.descripcion,
      //   unidad: rowsel.unidad,
      //   precio: rowsel.precio,
      //   rendimiento: rowsel.rendimiento,
      //   undrendimiento: rowsel.und_rendi,
      //   jornada: rowsel.jornada,
      //   usuario: rowsel.usuario,
      // });
      // this.undconcatrendi = rowsel.unidad;
      // if (rowsel.unidad == '' && this.edicionacu) {
      //   this.unidad.disable();
      //   this.rendimiento.disable();
      //   this.undrendimiento.disable();
      //   this.jornada.disable();
      // }
      // else if (rowsel.unidad != '' && this.edicionacu) {
      //   this.unidad.enable();
      //   this.rendimiento.enable();
      //   //this.undrendimiento.enable();
      //   this.jornada.enable();
      // }
      // if (!this.editajor) {
      //   this.jornada.disable();
      // }
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
          // this.formDataPartida.get('precio').setValue(this.formService.redondeo(rowsel.parcial, this.dec_parcial));
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
        for (let i = this.filaSel + 1; i < this.datasourcePri2.length; i++) {
          if (this.datasourcePri2[i].item != rowsel.item && !nuevogru) {
            var palabra = this.datasourcePri2[i].item.toString().substring(0, rowsel.item.toString().length + 1)
            if (palabra == (rowsel.item + '.')) {
              if (this.datasourcePri2[i].unidad != '') {
                filapart.push(this.datasourcePri2[i]);
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
        // this.formDataPartida.get('precio').setValue(this.formService.redondeo(rowsel.parcial, this.dec_parcial));//cambiar por la suma total?
      }
    }
    else {
      // this.formDataPartida.reset({
      //   item: '',
      //   descripcion: '',
      //   unidad: '',
      //   precio: '',
      //   rendimiento: '',
      //   undrendimiento: '',
      //   jornada: '',
      //   usuario: '',
      //   /* selprecio:'1' */
      // });
      this.tablaacusel = [];
    }
    // }
  }

  CalcRatio() {
    let valret = 0;
    for (let row of this.tablaacusel) {
      if (row.id_tipo_insumo == 1) {
        valret = Number(valret ?? 0) + Number(row.cantidad);
      }
    }
    //let valpasa=this.formService.redondeo(valret,this.dec_cant)+' hh/'+this.datasourcePri[this.filaSel].unidad;
    // this.ratio.setValue(this.formService.redondeo(valret, this.dec_cant));
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

  async seleccionDia(dia) {
    if (this.diaSeleccionado !== dia) {
      this.diaSeleccionado = dia;
      this.presupuestoCargado = false; // Marcamos como no cargado para la nueva fecha
    } else {
      return;
    }

    if (this.diaSeleccionado) {
      this.mostrar_carga_todo = true;

      // Ejecuta la carga y marca que ya se cargó
      await this.listarPresActivid(this.diaSeleccionado?.fecha);
      this.presupuestoCargado = true;



      if (this.filaSel !== null) {
        const acueDia = await this.listarAcuePartidaAlmacenado(this.filaSel, this.diaSeleccionado);
        const row = this.datasourcePri[this.filaSel];
        await this.formatoTAblaACue(row, acueDia);
        this.calcularTotalesGrupoAcue();
      }

      this.mostrar_carga_todo = false;
    }
  }

  async listarAcuePartida(row: any, i: number) {
    if (i === this.filaSel) {
      return;
    }
    if (!this.presupuestoCargado) {
      this.mostrar_carga_todo = true
    }
    this.filaSel = i;
    this.buscando = true;
    this.tablaAcue = [];

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
    } else if (row.unidad != '' && this.edicionacu) {
      this.unidad.enable();
      this.rendimiento.enable();
      this.jornada.enable();
    }

    if (!this.editajor) {
      this.jornada.disable();
    }

    try {
      if (this.filaSel !== null && this.diaSeleccionado) {
        const acueDia = await this.listarAcuePartidaAlmacenado(this.filaSel, this.diaSeleccionado);

        // SOLO si no se ha cargado previamente para este día
        if (!this.presupuestoCargado) {

          await this.listarPresActivid(this.diaSeleccionado?.fecha);
          this.presupuestoCargado = true; // Se marca como cargado
        }

        await this.formatoTAblaACue(row, acueDia);
        this.calcularTotalesGrupoAcue();

      }
      this.mostrar_carga_todo = false;
    } catch (error) {
      console.error('Error al listar ACPU:', error);
    } finally {
      this.buscando = false;
    }
  }

  calcularTotalesGrupoAcue() {
    let subtotalGrupo = 0;
    let indiceCabecera = -1;
    this.totalAcueGeneral = 0; // Reiniciar gran total

    for (let idx = 0; idx < this.tablaAcue.length; idx++) {
      const item = this.tablaAcue[idx];

      // Si es cabecera de grupo
      if (item.unidad === '' || item.unidad === null) {
        if (indiceCabecera !== -1) {
          this.tablaAcue[indiceCabecera].parcial = subtotalGrupo;
          this.totalAcueGeneral += subtotalGrupo; // Acumular al gran total
        }
        indiceCabecera = idx;
        subtotalGrupo = 0;
      } else {
        // Es un detalle del grupo
        subtotalGrupo += Number(item.parcial || 0);
      }
    }

    // Último grupo de la tabla
    if (indiceCabecera !== -1) {
      this.tablaAcue[indiceCabecera].parcial = subtotalGrupo;
      this.totalAcueGeneral += subtotalGrupo; // Acumular al gran total
    }
  }

  CalcRatio2() {
    let valret = 0;
    for (let row of this.tablaAcue) {
      if (row.tipo == 1) {
        valret = Number(valret ?? 0) + Number(row.cantidad);
      }
    }
    //let valpasa=this.formService.redondeo(valret,this.dec_cant)+' hh/'+this.datasourcePri[this.filaSel].unidad;
    this.ratio.setValue(this.formService.redondeo(valret, this.dec_cant));
  }

  formatoTAblaACue(row: any, acueDia: any[]) {
    this.tablaAcue = [];

    // 1. Obtener horas de jornada a partir de la fecha seleccionada y actualizar el formulario
    const fechaSeleccionada = this.diaSeleccionado?.fecha;
    const horasJornada = this.obtenerHorasJornadaPorFecha(fechaSeleccionada);

    // Obtener rendimiento actual para el cálculo de la cuadrilla (si no existe, default 0)
    const rendimientoActual = Number(this.formDataPartida.get('rendimiento')?.value) || 0;

    const categorias = [
      { tipo: 1, nombre: 'MANO DE OBRA' },
      { tipo: 2, nombre: 'EQUIPO' },
      { tipo: 3, nombre: 'MATERIALES' },
      { tipo: 4, nombre: 'SUB CONTRATOS' }
    ];

    categorias.forEach(cat => {
      // Cabecera principal
      const cabecera: filaAcue = {
        id_proyecto: this.id_proyecto,
        indice: row.indice,
        tipo: cat.tipo,
        ind_gp: 0,
        fecha: cat.nombre,
        mostrar: 1,
        descripcion: cat.nombre,
        unidad: '',
        cuadrilla: null,
        cantidad: 0,
        precio: 0,
        parcial: 0,
        agrupados: []
      };

      this.tablaAcue.push(cabecera);

      // Filtrar elementos de la categoría e índice actual
      const filtrados = acueDia.filter(ele =>
        Number(ele.tipo) === Number(cat.tipo) &&
        Number(ele.indice) === Number(row.indice)
      );

      const mapaAgrupado = new Map<string, filaAcue>();

      filtrados.forEach(ele => {
        const descItem = ele.equipo_descripcion || ele.descripcion || '';
        const undItem = ele.equipo_unidad || ele.unidad || '';
        const montoActual = Number(ele.monto_registro) || 0;
        const precioActual = Number(ele.precio) || 0;

        // Normalizar para comparación
        const descNormalizada = descItem.toString().trim().toLowerCase();
        const undNormalizada = undItem.toString().trim().toLowerCase();
        const precioNormalizado = precioActual.toFixed(4);

        // Clave del Map
        const clave = `${descNormalizada}_${undNormalizada}_${precioNormalizado}`;

        // --- CÁLCULO DE CUADRILLA SEGÚN REGLAS DE NEGOCIO ---
        let cuadrillaCalculada: number | null = null;

        if (horasJornada > 0) {
          if (cat.tipo === 1) {
            // 1. MANO DE OBRA: Se calcula si tiene unidad asignada
            if (undNormalizada !== '') {
              cuadrillaCalculada = (montoActual * rendimientoActual) / horasJornada;
            }
          } else if (cat.tipo === 2) {
            // 2. EQUIPO: Solo si la unidad es 'hm'
            if (undNormalizada === 'hm') {
              cuadrillaCalculada = (montoActual * rendimientoActual) / horasJornada;
            }
          }
          // Materiales (tipo 3) y Subcontratos (tipo 4) permanecen como null
        }

        if (mapaAgrupado.has(clave)) {
          // Acumulación de registros existentes
          const existente = mapaAgrupado.get(clave)!;
          existente.cantidad += montoActual;
          existente.parcial = existente.cantidad * existente.precio;

          // Recalcular cuadrilla con la nueva cantidad total
          if (existente.cuadrilla !== null && horasJornada > 0) {
            existente.cuadrilla = (existente.cantidad * rendimientoActual) / horasJornada;
          }

          existente.agrupados!.push(ele);
        } else {
          // Crear nuevo elemento agrupado
          mapaAgrupado.set(clave, {
            id_proyecto: this.id_proyecto,
            indice: row.indice,
            tipo: cat.tipo,
            ind_gp: 0,
            fecha: ele.fecha || '',
            mostrar: 1,
            descripcion: descItem,
            unidad: undItem,
            cuadrilla: cuadrillaCalculada,
            cantidad: montoActual,
            precio: precioActual,
            parcial: montoActual * precioActual,
            agrupados: [ele]
          });
        }
      });

      // Asignar subíndice (ind_gp) e insertar
      let indexGrupo = 1;
      mapaAgrupado.forEach(itemAgrupado => {
        itemAgrupado.ind_gp = indexGrupo;
        this.tablaAcue.push(itemAgrupado);
        indexGrupo++;
      });
    });

    this.CalcRatio2();
  }

  async modalAgregar(row: any) {
    try {
      if (this.filaSel == null || this.diaSeleccionado == null) {
        this.toaster.error('Seleccione una partida y un día', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        });
        return;
      }
      this.seHicieronCambiosModal = false;
      this.tipoSel = null
      this.listadoAgrupado = []
      this.tipoSel = row.tipo
      this.mostrar_carga_todo = true;
      const fecha = this.diaSeleccionado?.fecha;
      const partidaSeleccionada = this.datasourcePri[this.filaSel];
      const idPartidaSel = partidaSeleccionada?.indice || 0;

      if (row.tipo == 3) {
        const obj = { id_proyecto: this.id_proyecto, fecha: fecha };
        const response = await this.metradoService.listadoMovAlmSalidaProyecto(obj);

        // Procesamos la data agrupada
        this.procesarDataTipo3(response);

        // Si necesitas vincular los registros guardados previamente en la BD:
        const objRegistrosBD = {
          indice: idPartidaSel,
          fecha: fecha,
          id_proyecto: this.id_proyecto
        };
        const resRegistrosBD = await this.equiposServiciosService.listarRegistroMontoActividades(objRegistrosBD);
        const listadoRegistros = Array.isArray(resRegistrosBD) ? resRegistrosBD : [];
        this.asignarRegistrosAEquipos(listadoRegistros);
      } else if (row.tipo == 2) {
        const objDesagregado = {
          id_proyecto: this.id_proyecto,
          fecha: fecha,
          tipocontra: row.tipocontra || 2
        };

        const objRegistrosBD = {
          indice: idPartidaSel,
          fecha: fecha,
          id_proyecto: this.id_proyecto
        };

        const [resDesagregado, resRegistrosBD] = await Promise.all([
          this.equiposServiciosService.listadoDesagregadoEquipo(objDesagregado),
          this.equiposServiciosService.listarRegistroMontoActividades(objRegistrosBD)
        ]);
        this.procesarDataParaModal(resDesagregado);

        // Vinculamos los registros obtenidos de top_registro_monto_actividades a los equipos
        const listadoRegistros = Array.isArray(resRegistrosBD) ? resRegistrosBD : [];
        this.asignarRegistrosAEquipos(listadoRegistros);
      } else if (row.tipo == 4) {
        const objDesagregado = {
          id_proyecto: this.id_proyecto,
          fecha: fecha,
          tipocontra: row.tipocontra || 4
        };

        const objRegistrosBD = {
          indice: idPartidaSel,
          fecha: fecha,
          id_proyecto: this.id_proyecto
        };

        const [resDesagregado, resRegistrosBD] = await Promise.all([
          this.subcontratosService.listadoDesagregadoSubcontrato(objDesagregado),
          this.equiposServiciosService.listarRegistroMontoActividades(objRegistrosBD)
        ]);
        this.procesarDataParaModal(resDesagregado);
        // Vinculamos los registros obtenidos de top_registro_monto_actividades a los equipos
        const listadoRegistros = Array.isArray(resRegistrosBD) ? resRegistrosBD : [];
        this.asignarRegistrosAEquipos(listadoRegistros, true);
      }
      this.busquedaMod = '';
      this.modalRegistroSaldo.show();
      this.mostrar_carga_todo = false;
    } catch (error) {
      console.error(error);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  calcularSaldo(equipo: any): number {
    const limiteMaximo = Number(equipo.horas_dia) || 0;

    if (limiteMaximo === 0) return 0;
    if (!equipo.registros || !Array.isArray(equipo.registros) || equipo.registros.length === 0) {
      return limiteMaximo;
    }

    // Sumar TODOS los registros consumidos sin importar la partida
    const totalConsumido = equipo.registros.reduce((acc: number, curr: any) => {
      return acc + (Number(curr.monto_registro) || 0);
    }, 0);

    const saldo = limiteMaximo - totalConsumido;
    return saldo < 0 ? 0 : saldo;
  }

  asignarRegistrosAEquipos(listadoRegistrosBD: any[], esSubcontrato: boolean = false) {
    const idPartidaSel = this.datasourcePri[this.filaSel]?.indice;
    const fechaActual = this.diaSeleccionado?.fecha;
    const esTipo3 = this.tipoSel == 3;

    if (!this.listadoAgrupado || !Array.isArray(this.listadoAgrupado)) return;

    // Determinar dinámicamente el nombre de la propiedad clave según la entidad
    const campoId = esSubcontrato ? 'id_subcontrato' : 'id_equipo';

    // 1. PRIMER NIVEL: Iterar las Cabeceras Principal
    this.listadoAgrupado.forEach((cabecera: any) => {
      if (cabecera && Array.isArray(cabecera.subcabeceras)) {

        // 2. SEGUNDO NIVEL: Iterar las Subcabeceras
        cabecera.subcabeceras.forEach((sub: any) => {
          if (sub && Array.isArray(sub.equipos)) {

            // 3. TERCER NIVEL: Iterar los Equipos / Materiales / Subcontratos
            sub.equipos.forEach((eq: any) => {

              // Asignar a eq.registros los registros correspondientes
              // En asignarRegistrosAEquipos:

              eq.registros = (listadoRegistrosBD || []).filter((r: any) => {
                const coincideTipo = Number(r.tipo) === Number(this.tipoSel);

                if (esTipo3) {
                  return coincideTipo &&
                    Number(r.idregmov) === Number(eq.idregmov) &&
                    Number(r.nrosalida) === Number(eq.nrosalida) &&
                    Number(r.idsalida) === Number(eq.idsalida) &&
                    Number(r.id_registro) === Number(eq.id_registro);
                } else {
                  // 1. Obtener los IDs del registro BD
                  const idRegistroBD = r[campoId] ?? r.id_equipo;
                  const idDesagregadoBD = r.id_desagregado;

                  // 2. Obtener los IDs del ítem en la lista (equipos / subcontratos)
                  const idItemLista = eq[campoId] ?? eq.id_equipo;
                  const idDesagregadoLista = eq.id_registro_desagregado ?? eq.id_desagregado;

                  // 3. Comparación priorizando ID Desagregado o ID principal
                  const coincideId = Number(idRegistroBD) === Number(idItemLista);
                  const coincideDesagregado = idDesagregadoBD && idDesagregadoLista
                    ? Number(idDesagregadoBD) === Number(idDesagregadoLista)
                    : true;

                  return coincideTipo && coincideId && coincideDesagregado;
                }
              });

              // Asignar a regDia SOLO si coincide la FECHA y el ÍNDICE de la partida seleccionada
              const regDia = eq.registros.find((r: any) => {
                const fechaBD = r.fecha ? r.fecha.toString().split('T')[0] : '';
                const coincideIndicePartida = Number(r.indice) === Number(idPartidaSel);
                const coincideFecha = fechaBD === fechaActual;

                return coincideFecha && coincideIndicePartida;
              });

              // Asignación individual para el input / día actual de la partida seleccionada
              if (regDia) {
                eq.registro_dia = regDia;
                eq.monto_input = regDia.monto_registro;
              } else {
                eq.registro_dia = null;
                eq.monto_input = null;
              }
            });
          }
        });
      }
    });

    // Copia de respaldo para filtros o búsquedas
    this.listadoAgrupadoOriginal = JSON.parse(JSON.stringify(this.listadoAgrupado));
  }

  async cerrarModal() {
    this.modalRegistroSaldo.hide();

    // Si hubo cambios en el modal, refrescamos la tabla ACUE
    if (this.seHicieronCambiosModal) {
      this.mostrar_carga_todo = true
      if (this.filaSel !== null && this.diaSeleccionado) {
        const rowActual = this.datasourcePri[this.filaSel];
        await this.listarPresActivid(this.diaSeleccionado?.fecha)
        const acueDia = await this.listarAcuePartidaAlmacenado(this.filaSel, this.diaSeleccionado);

        await this.formatoTAblaACue(rowActual, acueDia);
        this.calcularTotalesGrupoAcue();
        await this.marcarDiasConRegistro()
      }

      // Reiniciamos el flag
      this.seHicieronCambiosModal = false;
      this.mostrar_carga_todo = false
    }
  }


  procesarDataParaModal(dataPlana: any[]) {
    const esSubcontrato = this.tipoSel == 4;

    const resultado = dataPlana.reduce((acc, curr) => {
      let cabecera = acc.find((c: any) => c.id_registro_cabecera === curr.id_registro_cabecera);
      if (!cabecera) {
        cabecera = {
          id_registro_cabecera: curr.id_registro_cabecera,
          detalle_registro_cabecera: curr.detalle_registro_cabecera,
          subcabeceras: []
        };
        acc.push(cabecera);
      }

      let subcabecera = cabecera.subcabeceras.find((s: any) => s.idgrupo_cabecera === curr.idgrupo_cabecera);
      if (!subcabecera) {
        subcabecera = {
          idgrupo_cabecera: curr.idgrupo_cabecera,
          descripcion_agrupains: curr.descripcion_agrupains,
          equipos: []
        };
        cabecera.subcabeceras.push(subcabecera);
      }

      // Evaluación del ID dinámico según sea Subcontrato (tipoSel == 4) o Equipo
      const idEntidad = esSubcontrato ? curr.id_subcontrato : curr.id_equipo;

      if (idEntidad !== null && idEntidad !== undefined) {
        subcabecera.equipos.push({
          // Mantiene ambas propiedades para compatibilidad de binding en HTML
          id_equipo: curr.id_equipo,
          id_subcontrato: curr.id_subcontrato,
          unidad: curr.unidad,
          placa: curr.placa,
          descripcion_equipo: curr.descripcion_equipo || curr.descripcion_subcontrato,
          id_registro_desagregado: curr.id_registro_desagregado,
          horas_dia: curr.horas_dia,
          minutos_dia: curr.minutos_dia,
          costo_dia: curr.costo_dia,
          horas_detalle: curr.horas_detalle,
          observaciones: curr.observaciones,
          descripcion_completa: curr.descripcion_completa,
          registros: [],
          registro_dia: null
        });
      }

      return acc;
    }, []);

    // Guardamos ambas referencias
    this.listadoAgrupadoOriginal = JSON.parse(JSON.stringify(resultado));
    this.listadoAgrupado = resultado;
  }

  filtrarTabla() {
    const termino = this.busquedaMod.toLowerCase().trim();

    // Si no hay término de búsqueda, restauramos los datos originales
    if (!termino) {
      this.listadoAgrupado = JSON.parse(JSON.stringify(this.listadoAgrupadoOriginal));
      return;
    }

    // Clonamos los datos para evitar mutación del objeto base
    const datosClonados = JSON.parse(JSON.stringify(this.listadoAgrupadoOriginal));

    this.listadoAgrupado = datosClonados.filter((cabecera: any) => {
      cabecera.subcabeceras = cabecera.subcabeceras.filter((sub: any) => {
        // 1. Si coincide la subcabecera principal, dejamos todo tal cual
        const coincideSubcabecera = sub.descripcion_agrupains?.toLowerCase().includes(termino);
        if (coincideSubcabecera) {
          return true;
        }

        // 2. Evaluamos coincidencia de equipos e ítems con o sin unidad
        const equiposCoincidentes: any[] = [];
        let mantenerTituloPrevio = false;

        sub.equipos.forEach((eq: any) => {
          const coincideEquipo = eq.descripcion_equipo?.toLowerCase().includes(termino);

          if (!eq.unidad) {
            // Es un ítem de tipo Título/Subcabecera Secundaria
            equiposCoincidentes.push(eq);
          } else if (coincideEquipo) {
            // Es un elemento hijo que coincide con el filtro
            equiposCoincidentes.push(eq);
            mantenerTituloPrevio = true;
          }
        });

        // 3. Si hay al menos un registro real coincidente, asignamos la lista filtrada
        if (mantenerTituloPrevio) {
          sub.equipos = equiposCoincidentes;
          return true;
        }

        return false;
      });

      return cabecera.subcabeceras.length > 0;
    });
  }

  limpiarfiltroMod() {
    this.busquedaMod = '';
    this.filtrarTabla();
  }

  selFilRegAct(eq) {
    console.log('eq', eq)
  }

  asociarRegistroDia(equipo: any) {
    const idPartidaSel = this.datasourcePri[this.filaSel]?.id_acue; // Identificador de la partida elegida
    const fechaActual = this.diaSeleccionado?.fecha;

    if (equipo.registros && equipo.registros.length > 0) {
      // Filtramos los registros de esta partida y fecha
      const regEncontrado = equipo.registros.find((r: any) =>
        r.id_acue === idPartidaSel && r.fecha === fechaActual
      );

      if (regEncontrado) {
        equipo.registro_dia = regEncontrado;
        equipo.monto_input = regEncontrado.monto_registro;
      } else {
        equipo.registro_dia = null;
        equipo.monto_input = null;
      }
    } else {
      equipo.registro_dia = null;
      equipo.monto_input = null;
    }
  }

  calcularTotalUtilizado(equipo: any): number {
    if (!equipo.registros || equipo.registros.length === 0) return 0;
    const idPartidaSel = this.datasourcePri[this.filaSel]?.id_acue;

    return equipo.registros
      .filter((r: any) => r.id_acue === idPartidaSel)
      .reduce((acc: number, curr: any) => acc + (Number(curr.monto_registro) || 0), 0);
  }

  validarYLimitarMonto(equipo: any) {
    const valorIngresado = this.parsearValorNumerico(equipo.monto_input) || 0;

    if (valorIngresado < 0) {
      this.restaurarValorAnterior(equipo);
      return;
    }

    const idPartidaSel = this.datasourcePri[this.filaSel]?.indice;
    const fechaActual = this.diaSeleccionado?.fecha;
    const limiteMaximo = Number(equipo.horas_dia) || 0;

    // Sumar consumos excluyendo el registro del día/partida actual
    const otrosConsumos = (equipo.registros || []).reduce((acc: number, curr: any) => {
      const esPartidaActual = Number(curr.indice) === Number(idPartidaSel);
      const fechaBD = curr.fecha ? curr.fecha.toString().split('T')[0] : '';
      const esFechaActual = fechaBD === fechaActual;

      if (esPartidaActual && esFechaActual) return acc;
      return acc + (Number(curr.monto_registro) || 0);
    }, 0);

    const saldoDisponibleReal = limiteMaximo - otrosConsumos;

    // SI SOBREPASO EL LÍMITE: Restaurar de forma asíncrona
    if (valorIngresado > saldoDisponibleReal) {
      this.restaurarValorAnterior(equipo);

      this.toaster.warning(
        `El valor ingresado supera el saldo disponible (${saldoDisponibleReal.toFixed(2)}). Se restauró el valor anterior.`,
        '',
        { timeOut: 3000 }
      );
    }
  }

  restaurarValorAnterior(equipo: any) {
    const valorRestaurar = equipo.monto_input_previo ?? null;

    setTimeout(() => {
      equipo.monto_input = valorRestaurar;
      this.cdRef.detectChanges(); // Forzar renderizado en el DOM
    }, 0);
  }

  guardarValorPrevio(equipo: any) {
    equipo.monto_input_previo = equipo.monto_input;
  }

  async procesarGuardadoRegistro(equipo: any) {
    const partidaSeleccionada = this.datasourcePri[this.filaSel];
    const idPartidaSel = partidaSeleccionada?.indice || 0;
    const fechaActual = this.diaSeleccionado?.fecha;

    const nuevoMonto = this.parsearValorNumerico(equipo.monto_input);
    const montoAnterior = equipo.registro_dia?.monto_registro !== undefined && equipo.registro_dia?.monto_registro !== null
      ? Number(equipo.registro_dia.monto_registro)
      : null;

    if (nuevoMonto === montoAnterior) return;

    const esTipo3 = this.tipoSel == 3;
    // CASO 1: ELIMINAR
    if ((nuevoMonto === null || nuevoMonto === 0) && equipo.registro_dia?.id_reg) {
      const payload: any = {
        accion: 'ELIMINAR',
        id_reg: equipo.registro_dia.id_reg,
        indice: idPartidaSel,
        tipo: this.tipoSel || 2,
        fecha: fechaActual || '',
        monto_registro: 0,
        id_proyecto: this.id_proyecto
      };

      if (esTipo3) {
        payload.idregmov = equipo.idregmov || 0;
        payload.nrosalida = equipo.nrosalida || 0;
        payload.idsalida = equipo.idsalida ?? 0;
        payload.indrep = equipo.indrep ?? 0;
        payload.id_registro = equipo.id_registro || 0;
        payload.id_equipo = 0;
        payload.id_desagregado = 0;
      } else {
        // Para Tipo 4 (Subcontratos) toma id_subcontrato; para Tipo 1 y 2 toma id_equipo
        const idEntidad = (this.tipoSel == 4) ? equipo.id_subcontrato : equipo.id_equipo;

        // Se asigna al campo 'id_equipo' del payload
        payload.id_equipo = idEntidad || 0;
        payload.id_desagregado = equipo.id_registro_desagregado || 0;

        // Reseteo de campos de Tipo 3
        payload.idregmov = 0;
        payload.nrosalida = 0;
        payload.idsalida = 0;
        payload.indrep = 0;
        payload.id_registro = 0;
      }
      const res = await this.equiposServiciosService.guardarMovimientoSaldo(payload);

      equipo.registros = equipo.registros.filter((r: any) => r.id_reg !== equipo.registro_dia.id_reg);
      equipo.registro_dia = null;
      equipo.monto_input = null;

      this.listadoAgrupadoOriginal = JSON.parse(JSON.stringify(this.listadoAgrupado));

      // FLAG EN TRUE
      this.seHicieronCambiosModal = true;
      return;
    }

    if (nuevoMonto === null || nuevoMonto === 0) return;

    // CASO 2: CREAR O ACTUALIZAR
    const payload: any = {
      accion: equipo.registro_dia?.id_reg ? 'ACTUALIZAR' : 'CREAR',
      id_reg: equipo.registro_dia?.id_reg || 0,
      indice: idPartidaSel,
      tipo: this.tipoSel || 2,
      fecha: fechaActual,
      monto_registro: nuevoMonto,
      id_proyecto: this.id_proyecto
    };

    if (esTipo3) {
      payload.idregmov = equipo.idregmov || 0;
      payload.nrosalida = equipo.nrosalida || 0;
      payload.idsalida = equipo.idsalida ?? 0;
      payload.indrep = equipo.indrep ?? 0;
      payload.id_registro = equipo.id_registro || 0;
      payload.id_equipo = 0;
      payload.id_desagregado = 0;
    } else {
      // Si es tipo 4 toma id_subcontrato, de lo contrario toma id_equipo
      payload.id_equipo = (this.tipoSel == 4 ? equipo.id_subcontrato : equipo.id_equipo) || 0;
      payload.id_desagregado = equipo.id_registro_desagregado || 0;

      // Limpieza de propiedades del Tipo 3
      payload.idregmov = 0;
      payload.nrosalida = 0;
      payload.idsalida = 0;
      payload.indrep = 0;
      payload.id_registro = 0;
    }
    const res = await this.equiposServiciosService.guardarMovimientoSaldo(payload);
    const dataRes = Array.isArray(res) && res.length > 0 ? res[0] : res;

    if (dataRes && dataRes.id_reg) {
      if (equipo.registro_dia) {
        equipo.registro_dia.monto_registro = nuevoMonto;
      } else {
        const nuevoReg = { ...payload, id_reg: dataRes.id_reg };
        equipo.registros.push(nuevoReg);
        equipo.registro_dia = nuevoReg;
      }

      this.listadoAgrupadoOriginal = JSON.parse(JSON.stringify(this.listadoAgrupado));

      // FLAG EN TRUE
      this.seHicieronCambiosModal = true;
    }
  }

  parsearValorNumerico(val: any): number | null {
    if (val === null || val === undefined || val === '') return null;

    // Si la máscara incluye comas o símbolos de moneda, los removemos
    const valorLimpio = val.toString().replace(/,/g, '');
    const num = parseFloat(valorLimpio);

    return isNaN(num) ? null : num;
  }

  async listarAcuePartidaAlmacenado(filSel, dia) {
    const fila = this.datasourcePri[filSel]

    const obj = {
      id_proyecto: this.id_proyecto,
      indice: fila.indice,
      fecha: dia.fecha
    }
    const res = await this.equiposServiciosService.listarAcuePartida(obj)
    if (res.length) {
      return res
    } else {
      return []
    }
  }

  procesarDataTipo3(dataPlana: any[]) {
    if (!Array.isArray(dataPlana) || dataPlana.length === 0) {
      this.listadoAgrupado = [];
      this.listadoAgrupadoOriginal = [];
      return;
    }

    const resultado = dataPlana.reduce((acc: any[], curr: any) => {
      const claveCabecera = curr.detalle || 'MOVIMIENTO DE ALMACÉN';
      let cabecera = acc.find((c: any) => c.detalle_registro_cabecera === claveCabecera);

      if (!cabecera) {
        cabecera = {
          id_registro_cabecera: curr.idregmov,
          detalle_registro_cabecera: claveCabecera,
          subcabeceras: []
        };
        acc.push(cabecera);
      }

      let subcabecera = cabecera.subcabeceras.find(
        (s: any) => s.idgrupo_cabecera === curr.idregmov
      );

      if (!subcabecera) {
        const tituloSub = curr.idsalida === 0
          ? `${curr.descripcion} Nº ${curr.nrosalida}`
          : `Nota de Salida Nº ${curr.nrosalida}`;

        subcabecera = {
          idgrupo_cabecera: curr.idregmov,
          descripcion_agrupains: tituloSub,
          equipos: []
        };
        cabecera.subcabeceras.push(subcabecera);
      }

      if (curr.idsalida !== 0) {
        subcabecera.equipos.push({
          // CAMPOS ESPECÍFICOS PARA TIPO 3
          idregmov: curr.idregmov,
          nrosalida: curr.nrosalida,
          idsalida: curr.idsalida,
          id_registro: curr.id_registro,

          // CAMPOS COMPATIBLES CON TIPO 2
          id_equipo: curr.id_equipo || 0,
          id_desagregado: curr.id_registro_desagregado || 0,

          // PROPIEDADES VISUALES DE LA TABLA
          codigo: curr.codigo,
          descripcion_equipo: curr.descripcion,
          unidad: curr.unidad,
          horas_dia: curr.cantidad,
          costo_dia: curr.precio,
          monto_parcial: curr.parcial,
          monto_input: '',
          registros: [],
          registro_dia: null
        });
      }

      return acc;
    }, []);

    this.listadoAgrupadoOriginal = JSON.parse(JSON.stringify(resultado));
    this.listadoAgrupado = resultado;
  }

  async modalResumenPartida() {
    if (this.filaSel == null || !this.diaSeleccionado) {
      this.toaster.info('Seleccione un dia y una partida', '', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return
    }
    this.mostrar_carga_todo = true
    this.resumenTabla = []
    this.tablaacusel = []
    await this.cambindiceselpresu(this.filaSel);
    const indice = this.datasourcePri[this.filaSel]?.indice;
    const filaPresupuesto = this.datasourcePri2[this.filaSel];
    const acumuladosEjecutado = await this.listarAcuePartidaAnteriores(indice, this.diaSeleccionado.fecha);

    // Procesamos los datos con los 3 arreglos/objetos
    await this.procesarResumen(this.tablaacusel, filaPresupuesto, acumuladosEjecutado);
    this.modalComparativaPartida.show()
    this.mostrar_carga_todo = false
  }

  procesarResumen(tablaacusel: any[], filaPresupuesto: any, acumuladosEjecutado: any[]) {
    // Helper para sumar parciales de insumos individuales (donde id_filadetalle NO es null)
    const sumarInsumosPorTipo = (idTipo: number) => {
      return tablaacusel
        .filter(x => x.id_tipo_insumo === idTipo && x.id_filadetalle !== null)
        .reduce((sum, item) => sum + (Number(item.parcial) || 0), 0);
    };

    // -------------------------------------------------------------
    // 1. FILA EXPEDIENTE
    // -------------------------------------------------------------
    const expMetradoTotal = Number(filaPresupuesto?.cantidad) || 0;
    const expAcu = Number(filaPresupuesto?.precio) || 0;
    const expPresupuesto = Number(filaPresupuesto?.parcial) || 0;

    const expManoObra = sumarInsumosPorTipo(1);
    const expMateriales = sumarInsumosPorTipo(2);
    const expEquipos = sumarInsumosPorTipo(3);
    // Suma tipo 4 (Otros) + tipo 5 (Subpartidas si aplicara)
    const expOtros = sumarInsumosPorTipo(4) + sumarInsumosPorTipo(5);

    // -------------------------------------------------------------
    // 2. FILA EJECUTADO
    // -------------------------------------------------------------
    const ejeMetradoTotal = 0; // Inicializado en 0 por el momento
    const ejeAcu = ejeMetradoTotal > 0 ? (expPresupuesto / ejeMetradoTotal) : 0;

    // Helper para obtener el total de ejecutado desde la BD
    const obtenerEjecutadoPorTipo = (idTipo: number) => {
      const item = acumuladosEjecutado?.find(x => Number(x.id_tipo_insumo) === idTipo);
      return item ? Number(item.total_monto) : 0;
    };

    const ejeManoObra = obtenerEjecutadoPorTipo(1);
    const ejeMateriales = obtenerEjecutadoPorTipo(2);
    const ejeEquipos = obtenerEjecutadoPorTipo(3);
    const ejeOtros = obtenerEjecutadoPorTipo(4);

    // Presupuesto Ejecutado = suma total acumulada
    const ejePresupuesto = ejeManoObra + ejeMateriales + ejeEquipos + ejeOtros;

    // -------------------------------------------------------------
    // 3. FILA VARIACIÓN (Expediente - Ejecutado)
    // -------------------------------------------------------------
    const varMetradoTotal = expMetradoTotal - ejeMetradoTotal;
    const varAcu = expAcu - ejeAcu;
    const varPresupuesto = expPresupuesto - ejePresupuesto;
    const varManoObra = expManoObra - ejeManoObra;
    const varMateriales = expMateriales - ejeMateriales;
    const varEquipos = expEquipos - ejeEquipos;
    const varOtros = expOtros - ejeOtros;

    // Estructuramos las filas listas para recorrer en el HTML
    this.resumenTabla = [
      {
        detalle: 'Expediente',
        metradoTotal: expMetradoTotal,
        acu: expAcu,
        presupuesto: expPresupuesto,
        manoObra: expManoObra,
        materiales: expMateriales,
        equipos: expEquipos,
        otros: expOtros,
        esVariacion: false
      },
      {
        detalle: 'Ejecutado',
        metradoTotal: ejeMetradoTotal,
        acu: ejeAcu,
        presupuesto: ejePresupuesto,
        manoObra: ejeManoObra,
        materiales: ejeMateriales,
        equipos: ejeEquipos,
        otros: ejeOtros,
        esVariacion: false
      },
      {
        detalle: 'Variacion',
        metradoTotal: varMetradoTotal,
        acu: varAcu,
        presupuesto: varPresupuesto,
        manoObra: varManoObra,
        materiales: varMateriales,
        equipos: varEquipos,
        otros: varOtros,
        esVariacion: true
      }
    ];
  }

  async listarAcuePartidaAnteriores(indice, fecha) {
    const obj = {
      id_proyecto: this.id_proyecto,
      indice: indice,
      fecha: fecha
    }
    const resp = await this.equiposServiciosService.listarAcuePartidaAnteriores(obj)
    return resp
  }

  cerrarModalComparativa() {
    this.modalComparativaPartida.hide()
  }

  toggleModoSeleccion() {
    this.modoSeleccion = !this.modoSeleccion;
    if (!this.modoSeleccion) {
      this.deseleccionarTodosLosEquipos();
    }
  }

  onToggleSeleccionarTodos() {
    this.obtenerTodosEquiposValidos().forEach(eq => {
      eq.seleccionado = this.seleccionarTodos;
    });
  }

  verificarSeleccionIndividual() {
    const validos = this.obtenerTodosEquiposValidos();
    if (validos.length === 0) {
      this.seleccionarTodos = false;
      return;
    }
    this.seleccionarTodos = validos.every(eq => eq.seleccionado);
  }

  private obtenerTodosEquiposValidos(): any[] {
    const listaValida: any[] = [];
    if (!this.listadoAgrupado) return listaValida;

    this.listadoAgrupado.forEach(cabecera => {
      cabecera.subcabeceras?.forEach((sub: any) => {
        sub.equipos?.forEach((eq: any) => {
          // Solo aplica a los que tienen unidad, horas_dia y un registro activo para eliminar
          if (eq.unidad && eq.horas_dia && eq.registro_dia?.id_reg) {
            listaValida.push(eq);
          }
        });
      });
    });
    return listaValida;
  }

  deseleccionarTodosLosEquipos() {
    this.seleccionarTodos = false;
    this.listadoAgrupado?.forEach(cabecera => {
      cabecera.subcabeceras?.forEach((sub: any) => {
        sub.equipos?.forEach((eq: any) => {
          eq.seleccionado = false;
        });
      });
    });
  }

  private async ejecutarEliminacionMasiva(listaAEliminar: any[]) {
    if (!listaAEliminar || listaAEliminar.length === 0) return;

    this.mostrar_carga_todo = true;

    const partidaSeleccionada = this.datasourcePri[this.filaSel];
    const idPartidaSel = partidaSeleccionada?.indice || 0;
    const fechaActual = this.diaSeleccionado?.fecha;
    const esTipo3 = this.tipoSel == 3;

    try {
      // Ejecutamos las peticiones de eliminación secuencialmente
      for (const equipo of listaAEliminar) {
        const payload: any = {
          accion: 'ELIMINAR',
          id_reg: equipo.registro_dia.id_reg,
          indice: idPartidaSel,
          tipo: this.tipoSel || 2,
          fecha: fechaActual || '',
          monto_registro: 0,
          id_proyecto: this.id_proyecto
        };

        if (esTipo3) {
          payload.idregmov = equipo.idregmov || 0;
          payload.nrosalida = equipo.nrosalida || 0;
          payload.idsalida = equipo.idsalida ?? 0;
          payload.indrep = equipo.indrep ?? 0;
          payload.id_registro = equipo.id_registro || 0;
          payload.id_equipo = 0;
          payload.id_desagregado = 0;
        } else {
          payload.id_equipo = equipo.id_equipo || 0;
          payload.id_desagregado = equipo.id_registro_desagregado || 0;
          payload.idregmov = 0;
          payload.nrosalida = 0;
          payload.idsalida = 0;
          payload.indrep = 0;
          payload.id_registro = 0;
        }

        try {
          await this.equiposServiciosService.guardarMovimientoSaldo(payload);

          // Limpiamos referencias locales del ítem
          equipo.registros = (equipo.registros || []).filter((r: any) => r.id_reg !== equipo.registro_dia.id_reg);
          equipo.registro_dia = null;
          equipo.monto_input = null;
          equipo.seleccionado = false;
        } catch (error) {
          console.error('Error al eliminar registro:', equipo, error);
        }
      }

      // Actualizamos copias de seguridad y flags
      this.listadoAgrupadoOriginal = JSON.parse(JSON.stringify(this.listadoAgrupado));
      this.seHicieronCambiosModal = true;
      this.seleccionarTodos = false;
      this.modoSeleccion = false; // Desactivamos el modo selección
    } finally {
      this.mostrar_carga_todo = false;
    }
  }
  async eliminarSeleccionados() {
    const seleccionados = this.obtenerTodosEquiposValidos().filter(eq => eq.seleccionado);

    if (seleccionados.length === 0) {
      // Si no hay ninguno marcado, finalizamos
      return;
    }

    const sw = await SwalService.confirm('¿Estás seguro?', 'Se limpiarán los registros seleccionados.');
    if (sw.isConfirmed) {
      await this.ejecutarEliminacionMasiva(seleccionados);
    }
  }
  async limpiarTodoDia() {
    const todosConRegistro = this.obtenerTodosEquiposValidos();

    if (todosConRegistro.length === 0) {
      return;
    }

    const sw = await SwalService.confirm('¿Estás seguro?', 'Se limpiarán TODOS los registros del día.');
    if (sw.isConfirmed) {
      await this.ejecutarEliminacionMasiva(todosConRegistro);
    }
  }
}
