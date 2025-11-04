import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-registro-actividades',
  templateUrl: './registro-actividades.component.html',
  styleUrls: ['./registro-actividades.component.scss']
})
export class RegistroActividadesComponent implements OnInit {
  @ViewChild("modalRegistros") modalRegistros: ModalBasicComponent;
  @ViewChild("modalRegistros2") modalRegistros2: ModalBasicComponent;
  subvista = 1;
  existecambios = false;
  datosglo;
  tablaRegistroMetrados = []
  tablaPresupuesto = []
  tablaPresCompleto = []
  titulos = []
  id_proyecto: any;
  id_userproy: any;
  tipoProy: any;
  colores: any;
  decima: any;
  solover: any;
  moneda: string;
  nomproy: any;
  prueba: any;
  metradoMes = null
  indiceTitulo = null
  metradoMes2 = null
  indiceTitulo2 = null
  diasCalendario = []
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  indiceDia = null
  fechaselecionada = null;
  mostrar_carga_todo = false
  active = 0
  estadoXPart: any[] = [];
  filaSeleccionada: any = null
  filaSeleccionada2: any = null
  tablaMovAlmcSalida: any = [];
  buscando = false
  fila4_sel = null
  dec_metrado = 4;
  mask_metrado = '0.4';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  dec_cant = 4;
  mask_cant = '0.4';
  simbolo = '';
  saldosRegistros = [];
  estadoXReg: any[] = [];
  registradoXDia = []
  formatos = ['DIA', 'SEMANA', 'MES']
  formato = 'DIA'
  tablaProgramacion = []
  calendarioProgra = []
  aspectosdias: any;
  verRutaCritica = false
  fechas: any;
  calendarioBase = []
  calendarioSemana = [[], []];
  calendarioMes = [[], []];
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
    if (this.colores) {
      this.titulo1 = JSON.parse(this.colores).tipoPresupuesto.split('|');
      this.titulo1color = JSON.parse(this.colores).colorPresupuesto.split('|');
      this.titulo1letra = JSON.parse(this.colores).letraPresupuesto.split('|');
    }
    let decimales = this.decima;
    if (decimales?.toString().includes('|')) {
      let arrdec = decimales.split('|');
      this.dec_metrado = arrdec[0];
      this.mask_metrado = '0.' + arrdec[0];
      this.dec_precio = arrdec[1];
      this.mask_precio = '0.' + arrdec[1];
      this.dec_parcial = arrdec[2];
      this.mask_parcial = '0.' + arrdec[2];
      this.dec_cant = arrdec[3];
      this.mask_cant = '0.' + arrdec[3];
    }
    // //listar 
  }
  constructor(private toaster: ToastrService,
    public principalService: PrincipalService,
    public formsService: FormsService,
    public metradoService: MetradoService,
    private cdr: ChangeDetectorRef) { }

  private nombresDiasMap: { [key: string]: number } = {
    'domingo': 0,
    'lunes': 1,
    'martes': 2,
    'miercoles': 3,
    'miércoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sabado': 6,
    'sábado': 6
  };
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  getDiasVisibles() {
    if (!this.calendarioProgra[1]) return [];
    return this.calendarioProgra[1].filter(dia => dia.mostrar === 1);
  }

  getAbarcoVisibles(row: any) {
    if (!row.abarca || !this.calendarioProgra[1]) return [];

    const result = [];
    for (let i = 0; i < this.calendarioProgra[1].length; i++) {
      if (this.calendarioProgra[1][i].mostrar === 1) {
        result.push({
          abarca: row.abarca[i],
          cantidad: row.cantidades ? row.cantidades[i] : null,
          parcial: row.parciales ? row.parciales[i] : null,
          originalIndex: i,
          metradodiario: row.metradodiario ? row.metradodiario[i] : null,
          realizado: row.realizado ? row.realizado[i] : null
        });
      }
    }
    return result;
  }

  seleccionarFila(fila: any) {
    this.filaSeleccionada2 = fila;
  }


  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      await this.listarPresu()
      this.mostrar_carga_todo = false
    } catch (error) {
      SwalService.error()
      this.mostrar_carga_todo = false
      console.log('error', error)
    }
  }

  async listarPresu(bool = false) {
    try {
      this.tablaRegistroMetrados = await this.metradoService.listarRegistroMetrados({
        id_proyecto: this.id_proyecto,
      });
      if (this.tablaRegistroMetrados.length) {
        this.metradoMes = this.tablaRegistroMetrados[0].id_registro
        this.metradoMes2 = 0
        await this.generarCalendario(this.tablaRegistroMetrados[0])
        await this.generarTablaPresuMetradoXRegistro(this.metradoMes)
        // if (this.titulos.length) {
        //   this.indiceTitulo = this.titulos[0].indice
        //   await this.filtroTitulo(this.indiceTitulo, this.tablaPresCompleto)
        // }
        this.indiceTitulo = ''
        this.indiceTitulo2 = ''
      }
    } catch (e) {
      SwalService.error()
      console.log(e)
    }

  }

  async generarTablaPresuMetradoXRegistro(id_registro) {
    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: id_registro
    }
    const response = await this.metradoService.listarTotalmetradosPresu(obj)
    if (response.length) {
      this.tablaPresCompleto = response
      this.titulos = this.tablaPresCompleto.filter(ele => ele.item.split('.').length == 1)
      const obj = {
        cantidad: null,
        descripcion: "TODOS",
        estadodias: null,
        icomost: 1,
        ind: null,
        indice: '',
        item: "0",
        metradodiario: null,
        montodias: null,
        mostrar: 1,
        saldo: null,
        total_registrado: null,
        unidad: ""
      }
      this.titulos.unshift(obj)
      // if (this.titulos.length) {
      //   this.indiceTitulo = this.titulos[0].indice
      //   await this.filtroTitulo(this.indiceTitulo, this.tablaPresCompleto)
      // }
      await this.filtroTitulo(null, this.tablaPresCompleto)
      await this.listarRegistroSaldoXProy(id_registro)
    }
  }

  async filtroTitulo(indice, tablaCompleta) {

    this.fila4_sel = null;
    this.tablaMovAlmcSalida = [];


    let resultado;

    if (indice == null || indice == '') {
      // Caso TODOS: usar toda la tabla completa
      resultado = [...tablaCompleta];
    } else {
      // Caso normal: filtrar por el título
      const tituloSel = this.titulos.find(ele => ele.indice == indice);
      resultado = tablaCompleta.filter(ele => ele.item.startsWith(`${tituloSel.item}.`));
      resultado.unshift(tituloSel);
    }

    // Aplicar propiedades comunes a todos los elementos
    for (const ele of resultado) {
      ele.icomost = 1;
      ele.mostrar = 1;
    }
    // console.log('resultado', resultado)
    this.tablaPresupuesto = resultado;
  }


  async cambioVista(ind: any) {
    this.mostrar_carga_todo = true
    this.subvista = ind;
    this.filaSeleccionada2 = null
    this.filaSeleccionada = null
    if (ind == 3) {
      // if (this.existecambios) {
      //   await this.guardarCambios();
      //   this.existecambios = false;
      // }
      // await this.changeVista2(this.datosglo);
    } else if (ind == 2) {
      this.subvista = ind
      await this.listarProgra()
      // if (this.existecambios) {
      //   await this.guardarCambios();
      //   this.existecambios = false;
      // }
      // await this.changeVista(this.datosglo);
    } else if (ind == 1) {
      // if (this.existecambios) {
      //   await this.guardarCambios();
      //   this.existecambios = false;
      // }
    } else if (ind == 4) {
      // if (this.existecambios) {
      //   await this.guardarCambios();
      //   this.existecambios = false;
      // }
      // await this.changeVista3(this.datosglo);
    }
    this.mostrar_carga_todo = false
  }

  async generarCalendario(datos) {
    const aspectos = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.id_proyecto,
    });
    this.aspectosdias = aspectos[0];
    this.diasCalendario = await this.generateCalendar(
      datos.fechaini,
      datos.fechafin,
      aspectos[0],
      aspectos[1]
    );
    let estadoXPart = []
    if (datos.version) {
      estadoXPart = datos.version?.split('/')
    } else {
      for (const element of this.diasCalendario) {
        estadoXPart.push(0)
      }
    }
    let estados = []
    if (datos.estado_saldo !== null && datos.estado_saldo !== '') {
      estados = datos.estado_saldo?.split('/')
    } else {
      for (const element of this.diasCalendario) {
        estados.push(0)
      }
    }
    this.estadoXPart = estadoXPart
    this.estadoXReg = this.diasCalendario.map((ele, index) => { return { estado: estados[index], fecha: moment(ele.fecha).format('DD-MM-YYYY'), bloqueado: ele.bloqueado } })
  }

  async cambioFechasMetrado() {
    this.mostrar_carga_todo = true
    this.indiceDia = null
    this.fechaselecionada = null
    this.diasCalendario = []
    this.estadoXPart = []
    this.tablaMovAlmcSalida = []
    const met = this.tablaRegistroMetrados.find(ele => ele.id_registro == this.metradoMes)
    await this.generarCalendario(met)
    await this.generarTablaPresuMetradoXRegistro(this.metradoMes)
    const obj2 = {
      id_proyecto: this.id_proyecto,
      id_registro: this.metradoMes
    }
    const resp2 = await this.metradoService.metradosDiariosXPartida(obj2)
    for (const element of this.tablaPresupuesto) {
      const encontrado = resp2.find(ele => ele.indice == element.indice)
      if (encontrado?.montodias?.length) {
        element.metradodiario = encontrado.montodias.split('/').map(item => {
          if (item === 'null' || item === 'NULL') {
            return null;
          }
          const num = Number(item);
          return isNaN(num) ? null : num;
        });
      } else {
        element.metradodiario = this.diasCalendario.map(ele => { return null })
      }
    }
    this.mostrar_carga_todo = false
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
    const feriadosMap = new Set(
      feriados.map((f) => new Date(f.fecha).toDateString())
    );
    const dias: any[] = [];
    let current = new Date(start);
    let indexCounter = 0
    while (current <= end) {
      const dayNumber = current.getDay();
      const dayLetters = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
      const diaLetra = dayLetters[dayNumber];
      const nombreDia = current
        .toLocaleDateString('es-PE', { weekday: 'long' })
        .toUpperCase();
      const esDomingo = diasNoLaborables.includes(nombreDia);
      const esFeriado = feriadosMap.has(current.toDateString());
      const currentDateStr = current.toISOString().split('T')[0];
      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];
      const indice = (currentDateStr >= startDateStr && currentDateStr <= endDateStr)
        ? indexCounter++
        : null;
      dias.push({
        fecha: new Date(current),
        dia: current.getDate(),
        letraDia: diaLetra,
        bloqueado: esDomingo || esFeriado,
        value: null,
        indice: indice
      });
      current = new Date(current.setDate(current.getDate() + 1));
    }
    return dias;
  }

  async ChangeDia(dia) {
    if (dia.bloqueado) {
      this.toaster.warning('Dia no laborable', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000
      })
      return
    }
    this.buscando = true
    if (!dia.bloqueado) {
      this.fechaselecionada = dia.fecha;
    }
    this.indiceDia = dia.indice
    // this.estadoXPart = []
    const obj = {
      id_proyecto: this.id_proyecto,
      fecha: moment(this.fechaselecionada).format('YYYY-MM-DD')
    }
    const response = await this.metradoService.listadoMovAlmSalidaProyecto(obj)

    this.tablaMovAlmcSalida = response.map((ele, index) => { ele['ind'] = index; ele.mostrar = true; ele.icomost = 1; return ele })
    if (this.fechaselecionada && this.filaSeleccionada) {
      await this.actualizarTablaAlmacen()
    }



    this.buscando = false
  }

  actualizarTablaAlmacen() {
    for (const element of this.tablaMovAlmcSalida) {
      const array = this.saldosRegistros.filter(ele => ele.idregmov == element.idregmov && ele.idsalida == element.idsalida && ele.nrosalida == element.nrosalida)
      const saldo = array.find(ele => ele.indice == this.filaSeleccionada?.indice)
      element['registrado'] = saldo ? saldo : null
      element['registros'] = array
    }
  }

  async selPartida(index, row) {
    this.filaSeleccionada = row
    
    if (this.fechaselecionada && this.filaSeleccionada) {
      await this.actualizarTablaAlmacen()
    }
  }

  disponibleXInsumo(row) {
    let total = 0
    if (row.registros) {
      for (const element of row.registros) {
        total = total + Number(element.monto_registrado)
      }
    }

    return Number(row.cantidad) - total
  }

  onNavChange(data) {

  }

  habilitarEditar(ind, celda) {
    if (!this.filaSeleccionada) {
      this.toaster.error('Ninguna fila seleccionada en presupuesto', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000
      })
      return
    }
    this.tablaMovAlmcSalida[ind]['editar' + celda] = true
  }

  async caneditarcelda1(value, indice, celda) {
    try {
      if (value && value !== this.tablaMovAlmcSalida[indice][celda]) {
        // this.tablaMovAlmcSalida[indice][celda].monto_registrado = value
        const montoAnterior = this.tablaMovAlmcSalida[indice].monto_registrado ? Number(this.tablaMovAlmcSalida[indice].monto_registrado) : 0;
        const disponible = await this.disponibleXInsumo(this.tablaMovAlmcSalida[indice]);
        if (disponible + montoAnterior < Number(value)) {
          this.tablaMovAlmcSalida[indice]['editar' + celda] = false
          this.toaster.warning('Monto excede a disponible', '', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000
          })
          return
        }

        if (this.tablaMovAlmcSalida[indice].registrado?.id_regsaldo) {
          this.actualizarRegistroSaldo(this.tablaMovAlmcSalida[indice].registrado, value, indice)
        } else {
          this.guardarRegistroSaldo(this.filaSeleccionada.indice, this.tablaMovAlmcSalida[indice], value, indice)
        }
      }
      this.tablaMovAlmcSalida[indice]['editar' + celda] = false
    } catch (e) {
      console.log(e)
      SwalService.error()
    }
  }

  toggleOn4(tipo: any) {
    for (let row of this.tablaMovAlmcSalida) {
      if (row.nrosalida == tipo) {
        if (row.unidad != '') {
          row.mostrar = 1;
        } else row.icomost = 0;
      }
    }
  }

  toggleOff4(tipo: any) {
    for (let row of this.tablaMovAlmcSalida) {
      if (row.nrosalida == tipo) {
        if (row.unidad != '') {
          row.mostrar = 0;
        } else row.icomost = 1;
      }
    }
  }

  async guardarRegistroSaldo(indPartida, dataRegSal, monto, indice) {
    const obj = {
      id_proyecto: this.id_proyecto,
      idregmov: dataRegSal.idregmov,
      nrosalida: dataRegSal.nrosalida,
      idsalida: dataRegSal.idsalida,
      id_registro: this.metradoMes,
      indice: indPartida,
      monto_registrado: monto,
      fecha: moment(this.fechaselecionada).format('YYYY-MM-DD'),
      insumo: dataRegSal.descripcion
    }

    const res = await this.metradoService.guardarRegistroSaldo(obj)
    if (res[0]?.id_regsaldo) {
      obj['id_regsaldo'] = res[0]?.id_regsaldo;
      const registrosSaldos = this.tablaMovAlmcSalida[indice].registros;
      const index = registrosSaldos.findIndex(item => item.id_regsaldo === res[0]?.id_regsaldo);
      if (index !== -1) {
        registrosSaldos[index] = obj;
      } else {
        registrosSaldos.push(obj);
      }
      this.tablaMovAlmcSalida[indice].registrado = obj
      this.saldosRegistros.push(obj)
      this.tablaPresupuesto[this.filaSeleccionada.ind].registros_saldos.push(obj)
      for (const element of this.estadoXReg) {
        const existe = this.saldosRegistros.find(ele => ele.fecha == moment(element.fecha).format('YYYY-MM-DD'))
        if (existe) {
          element.estado = 1
        }
      }
      this.actualizarEstadoRegistro()
    }
  }

  async actualizarEstadoRegistro() {
    let estados = ''
    const resultado = this.estadoXReg.map(item => item.estado || "0").join('/');
    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: this.metradoMes,
      estados: resultado
    }
    const response = await this.metradoService.actualizarEstadoRegistro(obj)
  }

  async actualizarRegistroSaldo(dataRegSal, monto, indice) {
    const obj = {
      id_regsaldo: dataRegSal.id_regsaldo,
      id_proyecto: this.id_proyecto,
      monto_registrado: monto
    }
    const res = await this.metradoService.actualizarRegistroSaldo(obj)
    this.tablaMovAlmcSalida[indice].registrado.monto_registrado = monto
    this.actualizarEstadoRegistro()
  }

  async listarRegistroSaldoXProy(id_registro) {

    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: id_registro
    }
    const resp = await this.metradoService.listarRegistroSaldoXProy(obj)
    this.saldosRegistros = resp
    for (const element of this.tablaPresupuesto) {
      if (element.unidad) {
        element.registros_saldos = resp.filter(ele => ele.indice == element.indice)
      }

    }
    for (const element of this.estadoXReg) {
      // const existe = this.saldosRegistros.find(ele => ele.fecha == moment(element?.fecha).format('YYYY-MM-DD'))
      // if (existe) {
      //   element.estado = 1
      // }
      for (const element of this.estadoXReg) {
        // Especificar el formato de fecha explícitamente
        const fechaFormateada = moment(element?.fecha, 'DD-MM-YYYY').format('YYYY-MM-DD')
        const existe = this.saldosRegistros.find(ele => ele.fecha == fechaFormateada)
        if (existe) {
          element.estado = 1
        }
      }
    }
  }

  presenter1(event: any, ind: any) {

  }

  cerrarModal() {
    //limpiar valores
    this.modalRegistros.hide();
  }

  abrirModal(row) {
    this.modalRegistros.show()
  }

  cerrarModal2() {
    //limpiar valores
    this.modalRegistros2.hide();
  }

  abrirModal2(row, fecha) {
    this.registradoXDia = []
    for (const element of row.registros_saldos) {
      if (moment(element.fecha).format('YYYY-MM-DD') == moment(fecha).format('YYYY-MM-DD')) {
        this.registradoXDia.push(element)
      }
    }
    this.modalRegistros2.show()
  }

  tieneRegistrosParaFecha(row: any, fechaSeleccionada: string): boolean {
    if (!row.registros_saldos?.length || !fechaSeleccionada) {
      return false;
    }
    const a = row.registros_saldos.some((registro: any) =>
      moment(registro.fecha).format('YYYY-MM-DD') === moment(fechaSeleccionada).format('YYYY-MM-DD')
    );
    // Buscar si existe algún registro con la fecha seleccionada
    return a
  }

  toggleOnpresu(itemsel, indice) {//icomost   1 mostrar, 0 ocultar
    let pila = [];//objetos{ item, icomost }
    this.tablaPresupuesto[indice].icomost = 1;
    let nuevogru = false;
    for (let i = indice + 1; i < this.tablaPresupuesto.length; i++) {
      if (this.tablaPresupuesto[i].item != itemsel && !nuevogru) {
        var palabra = this.tablaPresupuesto[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if (itemsel.split('.').length + 1 == this.tablaPresupuesto[i].item.toString().split('.').length) {
            this.tablaPresupuesto[i].mostrar = 1;
            this.tablaPresupuesto[i].estmost = 1;
            if (this.tablaPresupuesto[i].unidad == '') {
              pila.push({ item: this.tablaPresupuesto[i].item, icomost: this.tablaPresupuesto[i].icomost });
            }
          }
          else {
            var palabra2 = this.tablaPresupuesto[i].item.toString().substring(0, this.tablaPresupuesto[i].item.lastIndexOf('.'))
            let fila1 = pila.find(ele => ele.item == palabra2);
            this.tablaPresupuesto[i].mostrar = fila1.icomost == 0 ? 0 : this.tablaPresupuesto[i].estmost;
            if (this.tablaPresupuesto[i].unidad == '') {
              pila.push({ item: this.tablaPresupuesto[i].item, icomost: fila1.icomost == 0 ? 0 : this.tablaPresupuesto[i].icomost });
            }
          }
        }
        else {
          nuevogru = true;
        }
      }
      else { break; }
    }
  }

  toggleOffpresu(itemsel, indice) {
    this.tablaPresupuesto[indice].icomost = 0;
    let ind2 = indice + 1;
    let nuevogru = false;
    for (let i = ind2; i < this.tablaPresupuesto.length; i++) {
      if (this.tablaPresupuesto[i].item != itemsel && !nuevogru) {
        var palabra = this.tablaPresupuesto[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if (itemsel.split('.').length + 1 == this.tablaPresupuesto[i].item.toString().split('.').length) {
            this.tablaPresupuesto[i].estmost = 0;
          }
          this.tablaPresupuesto[i].mostrar = 0;
        }
        else {
          nuevogru = true;
        }
      }
      else { break; }
    }
  }

  async listarProgra() {
    this.calendarioProgra = []
    const obj = { id_proyecto: this.id_proyecto }
    const res = await this.principalService.listarProgramacionProyecto(obj)
    this.tablaProgramacion = res[0]
    const horario = {
      horaIngreso: this.aspectosdias[0]?.horaIngreso ? this.aspectosdias[0]?.horaIngreso.split('|') : ['', '', '', '', '', '', ''],
      horaSalida: this.aspectosdias[0]?.horaSalida ? this.aspectosdias[0]?.horaSalida?.split('|') : ['', '', '', '', '', '', ''],
      descansoIng: this.aspectosdias[0]?.descansoIng ? this.aspectosdias[0]?.descansoIng.split('|') : ['', '', '', '', '', '', ''],
      descansoSal: this.aspectosdias[0]?.descansoSal ? this.aspectosdias[0]?.descansoSal.split('|') : ['', '', '', '', '', '', ''],
    };
    const diasNoLab = this.aspectosdias[0]?.nolabo1 ? this.aspectosdias[0]?.nolabo1.split('|') : []
    const nuevoHorario = await this.analizarHorario(horario, diasNoLab)
    const horasxDia = await this.calcularHorasPorDia(nuevoHorario)
    let fechaMin = null
    let fechaMax = null
    let calendario = []
    if (!this.tablaProgramacion || this.tablaProgramacion.length === 0) {
      fechaMin = null
      fechaMax = null
    }

    const resultado = this.tablaRegistroMetrados.reduce((acumulador, registro) => {
      // Convertir strings a Date sin problema de zona horaria
      const fechaIni = new Date(registro.fechaini + 'T05:00:00'); // Compensar GMT-5
      const fechaFin = new Date(registro.fechafin + 'T05:00:00');

      return {
        minFechaini: fechaIni < acumulador.minFechaini ? fechaIni : acumulador.minFechaini,
        maxFechafin: fechaFin > acumulador.maxFechafin ? fechaFin : acumulador.maxFechafin
      };
    }, {
      minFechaini: new Date(this.tablaRegistroMetrados[0]?.fechaini + 'T05:00:00') || null,
      maxFechafin: new Date(this.tablaRegistroMetrados[0]?.fechafin + 'T05:00:00') || null
    });

    this.fechas = resultado
    calendario = await this.generarCalendarioPorFormato(resultado.minFechaini, resultado.maxFechafin);
    const diasPorMes = await this.obtenerDiasPorMes(calendario);
    await this.crearArraysAbarca(calendario, this.tablaProgramacion, horasxDia);
    this.calendarioProgra.push(diasPorMes)
    this.calendarioProgra.push(calendario)
    this.calendarioBase = JSON.parse(JSON.stringify(this.calendarioProgra))
    const resp = await this.acumuladosRegistrosXFechas(this.metradoMes2, this.fechas.minFechaini, this.fechas.maxFechafin)
    let i = 0
    for (const element of this.tablaProgramacion) {
      element.realizado = JSON.parse(resp[i].array_valores)
      const a = JSON.parse(resp[i].metradodiario)
      if (this.metradoMes2 == '0' || this.metradoMes2 == 0) {
        if (this.formato == 'DIA') {
          const b = await this.asignarMetradosACalendario(this.calendarioProgra[1], a)
          element.metradodiario = b
        }
      } else {


      }
      i++
    }
  }

  async crearArraysAbarca(calendario, tablaProgramacion, horasPorDia) {
    const tabla1 = JSON.stringify(tablaProgramacion);
    const body = JSON.stringify({
      datos: tabla1,
    });
    const response = await this.principalService.generarRutaCr(body);

    tablaProgramacion.forEach(partida => {
      let totalHorasXPart = 0
      partida.abarca = calendario.map(diaCalendario => {
        const fechaCalendario = new Date(diaCalendario.fecha);
        fechaCalendario.setHours(0, 0, 0, 0);

        const fechaIni = new Date(partida.fechaini);
        const fechaFin = new Date(partida.fechafin);

        fechaIni.setHours(0, 0, 0, 0);
        fechaFin.setHours(0, 0, 0, 0);

        const fecha = new Date(fechaCalendario);
        const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
        const esValido = fechaCalendario >= fechaIni && fechaCalendario <= fechaFin ? nombreDia : null
        if (esValido && partida.unidad) {
          totalHorasXPart += horasPorDia[nombreDia]
        }

        // Si la fecha del calendario está dentro del rango, devolver 1, sino 0
        return esValido;
      });
      partida.costeXHora = totalHorasXPart > 0 ? partida.metrado / totalHorasXPart : 0
    });

    let index = 0
    tablaProgramacion.forEach(partida => {
      if (partida.unidad) {
        partida.cantidades = partida.abarca.map(ele => {
          const costo = ele !== null ? partida.costeXHora * horasPorDia[ele] : null
          return costo
        })
        partida.parciales = partida.cantidades.map(ele => {
          const parcial = ele !== null ? ele * partida.precio : null
          return parcial
        })
        partida.rutaCritica = response[index].custom_class == 'bar-milestone' ? 1 : 0
        index++
      } else {
        partida.rutaCritica = null
      }
    })
  }

  // generarCalendarioPorFormato(fechaInicio: Date, fechaFin: Date): any[] {

  //   const calendario = [];
  //   const fechaActual = new Date(fechaInicio);
  //   const encontrarIdRegistrosEnRango = (fechaIni: Date, fechaFin: Date): number[] => {
  //     const registrosEnRango = this.tablaRegistroMetrados.filter(reg => {
  //       const fechaIniReg = new Date(reg.fechaini);
  //       const fechaFinReg = new Date(reg.fechafin);
  //       fechaIniReg.setHours(0, 0, 0, 0);
  //       fechaFinReg.setHours(23, 59, 59, 999);

  //       // Verificar si hay superposición de rangos
  //       return fechaIni <= fechaFinReg && fechaFin >= fechaIniReg;
  //     });

  //     return registrosEnRango.map(reg => reg.id_registro);
  //   };

  //   switch (this.formato) {
  //     case 'DIA':
  //       // Calendario por día (igual al original)
  //       while (fechaActual <= fechaFin) {
  //         const idRegistro = encontrarIdRegistro(fechaActual);
  //         const obj = {
  //           fecha: new Date(fechaActual),
  //           mostrar: 1,
  //           id_registro: idRegistro
  //         }
  //         calendario.push(obj);
  //         fechaActual.setDate(fechaActual.getDate() + 1);
  //       }
  //       break;

  //     case 'SEMANA':
  //       const inicioSemanaNumero = this.getDiaSemanaNumero(this.aspectosdias[0].inicioSemana);
  //       // Calendario por semana con inicio personalizado
  //       while (fechaActual <= fechaFin) {
  //         // Encontrar el día de inicio de la semana según configuración
  //         const inicioSemanaDate = new Date(fechaActual);
  //         const diaActual = inicioSemanaDate.getDay(); // 0=Domingo, 1=Lunes, 2=Martes, etc.

  //         // Calcular diferencia para llegar al día de inicio configurado
  //         let diff = inicioSemanaNumero - diaActual;
  //         if (diff > 0) {
  //           diff -= 7; // Ir a la semana anterior
  //         }

  //         inicioSemanaDate.setDate(inicioSemanaDate.getDate() + diff);
  //         inicioSemanaDate.setHours(0, 0, 0, 0);

  //         // Calcular fin de semana (6 días después del inicio)
  //         const finSemanaDate = new Date(inicioSemanaDate);
  //         finSemanaDate.setDate(inicioSemanaDate.getDate() + 6);
  //         finSemanaDate.setHours(23, 59, 59, 999);

  //         // Verificar que la semana esté dentro del rango
  //         if (inicioSemanaDate <= fechaFin && finSemanaDate >= fechaInicio) {

  //           // Agregar solo si no existe ya en el calendario
  //           const existe = calendario.some(semana =>
  //             semana.fechainicio.getTime() === inicioSemanaDate.getTime()
  //           );

  //           if (!existe) {
  //             const idRegistro = encontrarIdRegistro(inicioSemanaDate);
  //             const semanaObj = {
  //               fechainicio: new Date(inicioSemanaDate),
  //               fechafin: new Date(finSemanaDate),
  //               abreviatura: this.generarAbreviaturaSemana(inicioSemanaDate, finSemanaDate),
  //               cantdias: 7,
  //               mostrar: 1,
  //               id_registro: idRegistro,
  //               // Propiedades adicionales para compatibilidad
  //               fecha: inicioSemanaDate.toISOString().split('T')[0],
  //               mes: this.getMesNombre(inicioSemanaDate.getMonth()),
  //               anio: inicioSemanaDate.getFullYear(),
  //               // Para el template
  //               dia: this.formatearRangoSemana(inicioSemanaDate, finSemanaDate)
  //             };

  //             calendario.push(semanaObj);
  //           }
  //         }

  //         fechaActual.setDate(fechaActual.getDate() + 7);
  //       }
  //       break;


  //     case 'MES':
  //       // Calendario por mes (primer día de cada mes)
  //       const tempFechaMes = new Date(fechaInicio);
  //       tempFechaMes.setDate(1);

  //       while (tempFechaMes <= fechaFin) {
  //         const primerDiaMes = new Date(tempFechaMes.getFullYear(), tempFechaMes.getMonth(), 1);
  //         if (primerDiaMes >= fechaInicio && primerDiaMes <= fechaFin) {
  //           const idRegistro = encontrarIdRegistro(primerDiaMes);

  //           const mesObj = {
  //             fecha: new Date(primerDiaMes),
  //             mostrar: 1,
  //             id_registro: idRegistro,  // Nueva propiedad
  //             mes: this.getMesNombre(primerDiaMes.getMonth()),
  //             anio: primerDiaMes.getFullYear()
  //           };

  //           calendario.push(mesObj);
  //         }

  //         tempFechaMes.setMonth(tempFechaMes.getMonth() + 1);
  //       }
  //       break;
  //   }
  //   return calendario;
  // }



  // Generar abreviatura para la semana (ej: "M25-J31/ENE")
  generarCalendarioPorFormato(fechaInicio: Date, fechaFin: Date): any[] {
    const calendario = [];

    // Función para normalizar fechas considerando la zona horaria
    const normalizarFecha = (fecha: Date): Date => {
      // Usar toISOString y tomar solo la parte de la fecha para evitar problemas de zona horaria
      const isoString = fecha.toISOString().split('T')[0];
      return new Date(isoString + 'T00:00:00.000Z');
    };

    // Función para debug
    const debugRegistro = (fecha: Date, registroEncontrado: any) => {
      const fechaStr = fecha.toISOString().split('T')[0];
    };

    // Función para encontrar id_registro para un día específico
    const encontrarIdRegistroParaDia = (fecha: Date): number | null => {
      const fechaNormalizada = normalizarFecha(fecha);

      const registro = this.tablaRegistroMetrados.find(reg => {
        const fechaIniReg = normalizarFecha(new Date(reg.fechaini));
        const fechaFinReg = normalizarFecha(new Date(reg.fechafin));

        // Debug para fechas problemáticas
        if (fechaNormalizada.toISOString().split('T')[0] === '2024-11-30' ||
          fechaNormalizada.toISOString().split('T')[0] === '2024-12-31') {

          if (this.tablaRegistroMetrados[1]) {
            const reg2Ini = normalizarFecha(new Date(this.tablaRegistroMetrados[1].fechaini));
            const reg2Fin = normalizarFecha(new Date(this.tablaRegistroMetrados[1].fechafin));

          }
        }

        return fechaNormalizada >= fechaIniReg && fechaNormalizada <= fechaFinReg;
      });

      // Debug
      if (fechaNormalizada.toISOString().split('T')[0] === '2024-11-30' ||
        fechaNormalizada.toISOString().split('T')[0] === '2024-12-31') {
        debugRegistro(fechaNormalizada, registro);
      }

      return registro ? registro.id_registro : null;
    };

    // Para el caso DIA
    if (this.formato === 'DIA') {
      const fechaActual = new Date(fechaInicio);

      while (fechaActual <= fechaFin) {
        const idRegistro = encontrarIdRegistroParaDia(fechaActual);
        const obj = {
          fecha: new Date(fechaActual),
          mostrar: 1,
          id_registro: idRegistro
        }
        calendario.push(obj);
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    }

    // ... el resto de los casos (SEMANA y MES) se mantienen igual

    return calendario;
  }


  generarAbreviaturaSemana(fechaInicio: Date, fechaFin: Date): string {
    const diasAbreviados = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const mesesAbreviados = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const diaInicio = fechaInicio.getDate();
    const diaFin = fechaFin.getDate();
    const mesInicio = fechaInicio.getMonth();
    const mesFin = fechaFin.getMonth();

    const diaInicioAbr = diasAbreviados[fechaInicio.getDay()];
    const diaFinAbr = diasAbreviados[fechaFin.getDay()];

    if (mesInicio === mesFin) {
      return `${diaInicioAbr}${diaInicio}-${diaFinAbr}${diaFin}/${mesesAbreviados[mesInicio]}`;
    } else {
      return `${diaInicioAbr}${diaInicio}/${mesesAbreviados[mesInicio]}-${diaFinAbr}${diaFin}/${mesesAbreviados[mesFin]}`;
    }
  }

  // Formatear rango de semana para display
  formatearRangoSemana(fechaInicio: Date, fechaFin: Date): string {
    const diaInicio = fechaInicio.getDate();
    const diaFin = fechaFin.getDate();
    const mesInicio = fechaInicio.getMonth() + 1;
    const mesFin = fechaFin.getMonth() + 1;

    if (mesInicio === mesFin) {
      return `S${diaInicio}-${diaFin}/${mesInicio}`;
    } else {
      return `S${diaInicio}/${mesInicio}-${diaFin}/${mesFin}`;
    }
  }

  // Obtener nombre del mes
  getMesNombre(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes];
  }

  // Método para obtener el número del día de la semana (0-6)
  getDiaSemanaNumero(nombreDia: string): number {
    const dias = {
      'domingo': 0,
      'lunes': 1,
      'martes': 2,
      'miercoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sabado': 6
    };
    return dias[nombreDia.toLowerCase()] || 1; // Default: Lunes
  }


  async cambiarFormato() {
    this.mostrar_carga_todo = true
    setTimeout(async () => {
      let fi = null
      let ff = null
      if (this.formato == 'SEMANA') {
        if (this.metradoMes2 !== '0' && this.metradoMes2 !== 0) {
          const fila = this.tablaRegistroMetrados.find(ele => ele.id_registro == this.metradoMes2);
          fi = fila.fechaini
          ff = fila.fechafin
        } else {
          fi = this.fechas.minFechaini
          ff = this.fechas.maxFechafin
        }

        const dia = await this.obtenerNumeroDiaSemana(this.aspectosdias[0].inicioSemana)
        const calendario = await this.generarCalendarioSemana(fi, ff, dia, this.calendarioBase[1])
        const header = this.generarMesesConColspan(calendario)
        this.calendarioSemana = [header, calendario]
        for (const element of this.tablaProgramacion) {
          if (element.unidad) {
            let arrayCantidades = []
            let arrayParciales = []
            for (const row of calendario) {
              let cantidadSemana = null
              let parcialesSemana = null
              for (let i = row.indexInicio; i <= row.indexFinal; i++) {
                const cant = element.cantidades[i] !== null ? element.cantidades[i] : null;
                const parc = element.parciales[i] !== null ? element.parciales[i] : null;
                if (cant !== null) {
                  cantidadSemana = cantidadSemana + cant
                }
                if (parc !== null) {
                  parcialesSemana = parcialesSemana + parc
                }

              }
              arrayCantidades.push(cantidadSemana)
              arrayParciales.push(parcialesSemana)
            }
            element.cantidadesSemana = arrayCantidades
            element.parcialesSemana = arrayParciales
          } else {
            let arrayCantidades = []
            let arrayParciales = []
            for (const row of calendario) {
              arrayCantidades.push(null)
              arrayParciales.push(null)
            }
            element.cantidadesSemana = arrayCantidades
            element.parcialesSemana = arrayParciales
          }
        }
        await this.calcularAcumuladosPorSemana()
      } else if (this.formato == 'DIA') {
        await this.filtrarRegistroCalendario()
      } else if (this.formato == 'MES') {
        const fechaInicio = new Date(this.fechas.minFechaini);
        const fechaFin = new Date(this.fechas.maxFechafin);

        // Normalizar fechas
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(0, 0, 0, 0);

        const mesesMap = new Map();
        const añosMap = new Map();
        const fechaActual = new Date(fechaInicio);

        while (fechaActual <= fechaFin) {
          const mes = fechaActual.getMonth();
          const anio = fechaActual.getFullYear();
          const dia = fechaActual.getDate();
          const claveMes = `${anio}-${mes}`;

          // Procesar meses
          if (!mesesMap.has(claveMes)) {
            const primerDiaMes = new Date(anio, mes, 1);
            const ultimoDiaMes = new Date(anio, mes + 1, 0);
            const rangoCompleto = fechaInicio <= primerDiaMes && fechaFin >= ultimoDiaMes;

            mesesMap.set(claveMes, {
              mes: this.obtenerNombreMes(mes),
              cantdias: 0,
              anio: anio,
              mesNumero: mes + 1,
              diaInicio: dia,
              diaFin: dia,
              fechaInicio: new Date(fechaActual),
              fechaFin: new Date(fechaActual),
              rangoCompleto: rangoCompleto
            });
          } else {
            const mesData = mesesMap.get(claveMes);
            mesData.diaFin = dia;
            mesData.fechaFin = new Date(fechaActual);
          }

          mesesMap.get(claveMes).cantdias++;

          // Procesar años
          if (!añosMap.has(anio)) {
            añosMap.set(anio, {
              anio: anio,
              cantMeses: 0,
              colspan: 0
            });
          }

          fechaActual.setDate(fechaActual.getDate() + 1);
        }

        // Calcular cantMeses y colspan para cada año
        añosMap.forEach((añoData, anio) => {
          // Contar meses únicos para este año
          const mesesDelAño = Array.from(mesesMap.keys()).filter(clave => {
            const [añoClave] = clave.split('-');
            return parseInt(añoClave) === anio;
          });

          añoData.cantMeses = mesesDelAño.length;
          añoData.colspan = añoData.cantMeses * 2; // Cada mes tiene 2 columnas
        });

        const resultadoMeses = Array.from(mesesMap.values());
        const resultadoAños = Array.from(añosMap.values());

        // Ordenar por año y mes
        resultadoMeses.sort((a, b) => {
          if (a.anio !== b.anio) return a.anio - b.anio;
          return a.mesNumero - b.mesNumero;
        });

        // Ordenar años
        resultadoAños.sort((a, b) => a.anio - b.anio);
        this.calendarioMes = [resultadoAños, resultadoMeses]



        await this.calcularAcumuladosPorFila();

        // Primero, crear un mapa de fechas para acceso rápido
      }
      console.log('tablaprogra', this.tablaProgramacion)

      this.mostrar_carga_todo = false
    }, 0);


  }

  calcularAcumuladosPorSemana() {
    this.tablaProgramacion.forEach((fila, indexFila) => {
      const semanaMetrado: (number | null)[] = [];
      const semanaRealizado: (number | null)[] = [];

      const metradoDiarioFila = fila.metradodiario || [];
      const realizadoFila = fila.realizado || [];

      const semanasFila = this.calendarioSemana[1] || [];
      semanasFila.forEach((semana, indexSemana) => {
        let acumuladoMetrado = 0;
        let acumuladoRealizado = 0;

        let tieneMetrado = false;
        let tieneRealizado = false;
        let diasConDatosMetrado = 0;
        let diasConDatosRealizado = 0;

        // Recorrer todos los días de la semana
        semana.dias.forEach((diaSemana) => {
          const indexDia = diaSemana.indexEnCompleto;

          // Sumar metrado diario
          if (metradoDiarioFila[indexDia] !== null &&
            metradoDiarioFila[indexDia] !== undefined) {

            const metradoDia = metradoDiarioFila[indexDia].metrado_dia;
            const metradoNum = this.convertirANumero(metradoDia);

            if (metradoNum !== null) {
              acumuladoMetrado += metradoNum;
              tieneMetrado = true;
              diasConDatosMetrado++;
            }
          }

          // Sumar realizado
          if (realizadoFila[indexDia] !== null &&
            realizadoFila[indexDia] !== undefined) {

            const realizadoNum = this.convertirANumero(realizadoFila[indexDia]);

            if (realizadoNum !== null) {
              acumuladoRealizado += realizadoNum;
              tieneRealizado = true;
              diasConDatosRealizado++;
            }
          }
        });

        // Determinar valores finales para la semana
        semanaMetrado.push(tieneMetrado ? acumuladoMetrado : (diasConDatosMetrado > 0 ? 0 : null));
        semanaRealizado.push(tieneRealizado ? acumuladoRealizado : (diasConDatosRealizado > 0 ? 0 : null));
      });

      // Asignar los acumulados semanales a la fila
      fila.semanaMetrado = semanaMetrado;
      fila.semanaRealizado = semanaRealizado;


    });
  }

  calcularAcumuladosPorFila() {
    this.tablaProgramacion.forEach((fila, indexFila) => {
      const mesesParciales: (number | null)[] = [];
      const mesesCantidades: (number | null)[] = [];
      const mesesRealizado: (number | null)[] = [];
      const mesesMetradoDiario: (number | null)[] = [];

      const cantidadesFila = fila.cantidades || [];
      const parcialesFila = fila.parciales || [];
      const realizadoFila = fila.realizado || [];
      const metradoDiarioFila = fila.metradodiario || [];

      const mesesFila = this.calendarioMes[indexFila] || this.calendarioMes[1] || [];
      const diasFila = this.calendarioBase[indexFila] || this.calendarioBase[1] || [];

      mesesFila.forEach((mes, indexMes) => {
        let acumuladoParciales = 0;
        let acumuladoCantidades = 0;
        let acumuladoRealizado = 0;
        let acumuladoMetradoDiario = 0;

        let tieneParciales = false;
        let tieneCantidades = false;
        let tieneRealizado = false;
        let tieneMetradoDiario = false;
        let diasConDatosMetrado = 0;

        // Recorrer todos los días y verificar si pertenecen a este mes
        diasFila.forEach((dia, indexDia) => {
          if (dia && dia.fecha) {
            const fechaDia = new Date(dia.fecha);

            // Verificar si este día pertenece al mes actual
            if (fechaDia.getFullYear() === mes.anio &&
              fechaDia.getMonth() + 1 === mes.mesNumero &&
              fechaDia.getDate() >= mes.diaInicio &&
              fechaDia.getDate() <= mes.diaFin) {

              // Sumar cantidades
              if (cantidadesFila[indexDia] !== null && cantidadesFila[indexDia] !== undefined) {
                acumuladoCantidades += Number(cantidadesFila[indexDia]);
                tieneCantidades = true;
              }

              // Sumar parciales
              if (parcialesFila[indexDia] !== null && parcialesFila[indexDia] !== undefined) {
                acumuladoParciales += Number(parcialesFila[indexDia]);
                tieneParciales = true;
              }

              // Sumar realizado
              if (realizadoFila[indexDia] !== null && realizadoFila[indexDia] !== undefined) {
                acumuladoRealizado += Number(realizadoFila[indexDia]);
                tieneRealizado = true;
              }

              // Sumar metrado diario (objeto con propiedad metrado_dia)
              if (metradoDiarioFila[indexDia] !== null &&
                metradoDiarioFila[indexDia] !== undefined) {

                const metradoDia = metradoDiarioFila[indexDia].metrado_dia;
                if (metradoDia !== null && metradoDia !== undefined) {
                  // Convertir a número antes de sumar
                  const metradoNumero = Number(metradoDia);
                  if (!isNaN(metradoNumero)) {
                    acumuladoMetradoDiario += metradoNumero;
                    tieneMetradoDiario = true;
                    diasConDatosMetrado++;
                  }
                }
              }
            }
          }
        });

        mesesCantidades.push(tieneCantidades ? acumuladoCantidades : null);
        mesesParciales.push(tieneParciales ? acumuladoParciales : null);
        mesesRealizado.push(tieneRealizado ? acumuladoRealizado : null);

        // Para metradoDiario: null si no hay datos, 0 si hay datos pero suma 0, valor si hay datos
        if (tieneMetradoDiario) {
          mesesMetradoDiario.push(acumuladoMetradoDiario);
        } else {
          mesesMetradoDiario.push(diasConDatosMetrado > 0 ? 0 : null);
        }
      });

      // Asignar todos los acumulados a la fila
      fila.mesesParciales = mesesParciales;
      fila.mesesCantidades = mesesCantidades;
      fila.mesesRealizado = mesesRealizado;
      fila.mesesMetradoDiario = mesesMetradoDiario;


    });
  }

  convertirANumero(valor: any): number | null {
    if (valor === null || valor === undefined) {
      return null;
    }

    if (typeof valor === 'number') {
      return isNaN(valor) ? null : valor;
    }

    if (typeof valor === 'string') {
      const numero = Number(valor);
      return isNaN(numero) ? null : numero;
    }

    return null;
  }



  obtenerNombreMes(mes: number): string {
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return meses[mes];
  }

  obtenerNumeroDiaSemana(nombreDia: string): number {
    const nombreNormalizado = nombreDia.toLowerCase().trim();
    const numero = this.nombresDiasMap[nombreNormalizado];

    if (numero === undefined) {
      throw new Error(`Nombre de día no válido: ${nombreDia}. Use: domingo, lunes, martes, miércoles, jueves, viernes, sábado`);
    }

    return numero;
  }

  generarMesesConColspan(semanas: any[]): any[] {
    if (!semanas || semanas.length === 0) return [];

    const mesesMap = new Map<string, {
      mes: string,
      anio: number,
      colspan: number,
      semanas: number
    }>();

    // Procesar cada semana
    semanas.forEach(semana => {
      const mesesEnSemana = new Set<string>();

      // Identificar qué meses participan en esta semana
      semana.dias.forEach(dia => {
        const fecha = new Date(dia.fecha);
        const mesKey = this.obtenerKeyMes(fecha);
        mesesEnSemana.add(mesKey);
      });

      // Distribuir la semana (colspan 2) entre los meses participantes
      const colspanPorMes = 2 / mesesEnSemana.size;

      mesesEnSemana.forEach(mesKey => {
        const [nombreMes, anioStr] = mesKey.split('-');
        const anio = parseInt(anioStr);

        if (!mesesMap.has(mesKey)) {
          mesesMap.set(mesKey, {
            mes: nombreMes,
            anio: anio,
            colspan: colspanPorMes,
            semanas: 1 / mesesEnSemana.size
          });
        } else {
          const mesExistente = mesesMap.get(mesKey)!;
          mesExistente.colspan += colspanPorMes;
          mesExistente.semanas += 1 / mesesEnSemana.size;
        }
      });
    });

    // Redondear el colspan a números enteros (ya que cada semana son 2)
    const mesesArray = Array.from(mesesMap.values());

    mesesArray.forEach(mes => {
      // Redondear al entero más cercano (ya que cada semana son 2 de colspan)
      mes.colspan = Math.round(mes.colspan);
    });

    return mesesArray.sort((a, b) => {
      const fechaA = new Date(a.anio, this.obtenerNumeroMes(a.mes), 1);
      const fechaB = new Date(b.anio, this.obtenerNumeroMes(b.mes), 1);
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  private obtenerKeyMes(fecha: Date): string {
    const nombreMes = fecha.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const anio = fecha.getFullYear();
    return `${nombreMes}-${anio}`;
  }

  private obtenerNumeroMes(nombreMes: string): number {
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return meses.indexOf(nombreMes);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  generarCalendarioSemana(
    fechaInicio: string | Date,
    fechaFin: string | Date,
    inicioSemana: number | string,
    arrayCompleto: any[] // Tu array completo de 92 días
  ): any {
    // Convertir strings a Date y normalizar
    const inicio = this.parsearFecha(fechaInicio);
    const fin = this.parsearFecha(fechaFin);

    // Convertir inicioSemana a número si es string
    const inicioSemanaNum = typeof inicioSemana === 'string'
      ? this.obtenerNumeroDiaSemana(inicioSemana)
      : inicioSemana;

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const calendario: any = [];
    let semanaActual: any = {
      dias: [],
      cantDias: 0,
      mostrar: 1,
      abrev_Nombre: '',
      indexInicio: -1,
      indexFinal: -1
    };

    const fechaActual = new Date(inicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar el índice de la fecha de inicio en el array completo
    let indexEnCompleto = this.buscarIndiceEnArrayCompleto(fechaActual, arrayCompleto);

    if (indexEnCompleto === -1) {
      console.warn('Fecha de inicio no encontrada en array completo');
      return calendario;
    }

    let primeraIteracion = true;

    while (fechaActual <= fin && indexEnCompleto < arrayCompleto.length) {
      const diaCompleto = arrayCompleto[indexEnCompleto];

      // Verificar que la fecha coincide
      const fechaCompleto = new Date(diaCompleto.fecha);
      fechaCompleto.setHours(0, 0, 0, 0);

      if (fechaCompleto.getTime() !== fechaActual.getTime()) {
        console.warn(`Discrepancia de fechas en índice ${indexEnCompleto}`);
        break;
      }

      const dia = {
        fecha: new Date(fechaActual),
        indexEnCompleto: indexEnCompleto,
        datosOriginales: diaCompleto // Opcional: incluir los datos originales
      };

      semanaActual.dias.push(dia);
      semanaActual.cantDias++;

      // Establecer índices de inicio y fin en el array completo
      if (primeraIteracion) {
        semanaActual.indexInicio = indexEnCompleto;
        primeraIteracion = false;
      }
      semanaActual.indexFinal = indexEnCompleto;

      // Si completamos una semana o llegamos al fin, procesar y agregar al calendario
      if (fechaActual.getDay() === (inicioSemanaNum + 6) % 7 || fechaActual.getTime() === fin.getTime()) {
        semanaActual.abrev_Nombre = this.generarAbreviaturaSemana2(semanaActual.dias);
        calendario.push(semanaActual);

        // Reiniciar para la siguiente semana
        indexEnCompleto++;
        semanaActual = {
          dias: [],
          cantDias: 0,
          mostrar: 1,
          abrev_Nombre: '',
          indexInicio: indexEnCompleto,
          indexFinal: indexEnCompleto
        };
        primeraIteracion = true;
      } else {
        indexEnCompleto++;
      }

      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);

      if (fechaActual > fin || indexEnCompleto >= arrayCompleto.length) {
        break;
      }
    }

    // Si queda una semana parcial al final, procesarla
    if (semanaActual.dias.length > 0) {
      semanaActual.abrev_Nombre = this.generarAbreviaturaSemana2(semanaActual.dias);
      calendario.push(semanaActual);
    }

    return calendario;
  }

  private buscarIndiceEnArrayCompleto(fecha: Date, arrayCompleto: any[]): number {
    const fechaBuscada = fecha.getTime();

    for (let i = 0; i < arrayCompleto.length; i++) {
      const diaCompleto = arrayCompleto[i];
      if (diaCompleto.fecha) {
        const fechaCompleto = new Date(diaCompleto.fecha);
        fechaCompleto.setHours(0, 0, 0, 0);

        if (fechaCompleto.getTime() === fechaBuscada) {
          return i;
        }
      }
    }

    return -1; // No encontrado
  }

  private generarAbreviaturaSemana2(dias: any[]): string {
    if (dias.length === 0) return '';

    const primerDia = dias[0].fecha;
    const ultimoDia = dias[dias.length - 1].fecha;

    const abrevPrimer = this.obtenerAbreviaturaDia(primerDia);
    const abrevUltimo = this.obtenerAbreviaturaDia(ultimoDia);

    const diaPrimer = primerDia.getDate();
    const diaUltimo = ultimoDia.getDate();

    return `${abrevPrimer}-${diaPrimer} => ${abrevUltimo}-${diaUltimo}`;
  }

  private obtenerAbreviaturaDia(fecha: Date): string {
    const diasAbreviaturas = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
    return diasAbreviaturas[fecha.getDay()];
  }

  private parsearFecha(fecha: string | Date): Date {
    if (fecha instanceof Date) {
      return new Date(fecha.getTime());
    }

    const fechaStr = fecha.toString().trim();

    // Detectar formato automáticamente
    const formatos = [
      // YYYY-MM-DD
      {
        regex: /^(\d{4})-(\d{2})-(\d{2})$/, handler: (match: RegExpMatchArray) =>
          new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
      },

      // YYYY/MM/DD
      {
        regex: /^(\d{4})\/(\d{2})\/(\d{2})$/, handler: (match: RegExpMatchArray) =>
          new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
      },

      // DD-MM-YYYY
      {
        regex: /^(\d{2})-(\d{2})-(\d{4})$/, handler: (match: RegExpMatchArray) =>
          new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]))
      },

      // DD/MM/YYYY
      {
        regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, handler: (match: RegExpMatchArray) =>
          new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]))
      }
    ];

    for (const formato of formatos) {
      const match = fechaStr.match(formato.regex);
      if (match) {
        const fechaResult = formato.handler(match);
        if (!isNaN(fechaResult.getTime())) {
          return fechaResult;
        }
      }
    }

    // Fallback al constructor Date
    const fechaParsed = new Date(fechaStr);
    if (isNaN(fechaParsed.getTime())) {
      throw new Error(`Formato de fecha no válido: ${fecha}`);
    }

    return fechaParsed;
  }



  // acumularCantidadesPorSemana(cantidades: any[], semanas: any[]): number[] {
  //   const resultado: number[] = [];

  //   semanas.forEach((semana, indexSemana) => {
  //     let acumulado = 0;

  //     // Recorrer todos los días de esta semana
  //     if (semana.dias && Array.isArray(semana.dias)) {
  //       semana.dias.forEach((dia: any) => {
  //         const indexDia = this.obtenerIndiceDiaEnCalendario(dia.fecha);
  //         if (indexDia !== -1 && cantidades[indexDia] !== null && cantidades[indexDia] !== undefined) {
  //           acumulado += Number(cantidades[indexDia]) || 0;
  //         }
  //       });
  //     }

  //     resultado.push(acumulado);
  //   });

  //   return resultado;
  // }

  // acumularParcialesPorSemana(parciales: any[], semanas: any[]): number[] {
  //   const resultado: number[] = [];

  //   semanas.forEach((semana, indexSemana) => {
  //     let acumulado = 0;

  //     if (semana.dias && Array.isArray(semana.dias)) {
  //       semana.dias.forEach((dia: any) => {
  //         const indexDia = this.obtenerIndiceDiaEnCalendario(dia.fecha);
  //         if (indexDia !== -1 && parciales[indexDia] !== null && parciales[indexDia] !== undefined) {
  //           acumulado += Number(parciales[indexDia]) || 0;
  //         }
  //       });
  //     }

  //     resultado.push(acumulado);
  //   });

  //   return resultado;
  // }

  // Obtener el índice de un día en el calendario original
  obtenerIndiceDiaEnCalendario(fecha: Date): number {
    if (!this.calendarioProgra[1]) return -1;

    const fechaBuscada = new Date(fecha).toISOString().split('T')[0];

    for (let i = 0; i < this.calendarioProgra[1].length; i++) {
      const diaCalendario = this.calendarioProgra[1][i];
      const fechaCalendario = new Date(diaCalendario.fecha).toISOString().split('T')[0];

      if (fechaCalendario === fechaBuscada) {
        return i;
      }
    }

    return -1;
  }

  obtenerDiasPorMes(calendario) {
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];

    const resultado = {};

    calendario.forEach(fecha => {
      // Solo contar si mostrar == 1
      if (fecha.mostrar !== 1) {
        return; // Saltar esta iteración
      }

      const mes = fecha.fecha.getMonth(); // 0-11
      const anio = fecha.fecha.getFullYear();
      const clave = `${anio}-${mes}`;

      if (!resultado[clave]) {
        resultado[clave] = {
          mes: meses[mes],
          anio: anio,
          cantdias: 0
        };
      }

      resultado[clave].cantdias++;
    });

    return Object.values(resultado);
  }

  transform(dia, formato: string = 'corto'): string {
    if (!dia) return '';
    const diaSemana = dia.fecha.toLocaleDateString('es-ES', {
      weekday: formato === 'largo' ? 'long' : 'short'
    });
    const diaNumero = dia.fecha.getDate();

    // Para que quede "Lun-1" en lugar de "lun-1"
    const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

    return `${diaCapitalizado}-${diaNumero}`;
  }

  async calcularHorasPorDia(horario: any) {
    const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const horasPorDia: Record<string, number> = {};

    for (let i = 0; i < 7; i++) {
      const ingreso = horario.horaIngreso[i];
      const salida = horario.horaSalida[i];
      const descansoInicio = horario.descansoIng[i];
      const descansoFin = horario.descansoSal[i];

      // Si no hay horario, el día no se trabaja (0 horas)
      if (!ingreso || !salida) {
        horasPorDia[dias[i]] = 0;
        continue;
      }

      // Calcular horas de la mañana (horaIngreso -> horaSalida)
      const horasManana = await this.calcularDiferenciaHoras(ingreso, salida);

      // Calcular horas de la tarde (descansoIng -> descansoSal) si existen
      let horasTarde = 0;
      if (descansoInicio && descansoFin) {
        horasTarde = await this.calcularDiferenciaHoras(descansoInicio, descansoFin);
      }

      horasPorDia[dias[i]] = horasManana + horasTarde;
    }

    return horasPorDia;
  }

  async calcularDiferenciaHoras(horaInicio: string, horaFin: string) {
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);

    const diferencia = (hFin * 60 + mFin) - (hIni * 60 + mIni);
    return diferencia / 60; // Convertir minutos a horas (ej. 4.5 horas)
  }

  analizarHorario(horario, DiasNoLab) {
    const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
    // Modificar horario.horaIngreso
    for (let i = 0; i < horario.horaIngreso.length; i++) {
      if (i < 6) {
        if (horario.horaIngreso[i] == '') {
          horario.horaIngreso[i] = '07:30';
        }
      }
      if (DiasNoLab.includes(dias[i])) {
        horario.horaIngreso[i] = '';
      }
    }

    // Modificar horario.horaSalida
    for (let j = 0; j < horario.horaSalida.length; j++) {
      if (j < 5) {
        if (horario.horaSalida[j] == '') {
          horario.horaSalida[j] = '12:00';
        }
      } else if (j == 5) {
        if (horario.horaSalida[j] == '') {
          horario.horaSalida[j] = '13:00';
        }
      }
      if (DiasNoLab.includes(dias[j])) {
        horario.horaSalida[j] = '';
      }
    }

    // Modificar horario.descansoIng
    for (let k = 0; k < horario.descansoIng.length; k++) {
      if (k < 5) {
        if (horario.descansoIng[k] == '') {
          horario.descansoIng[k] = '14:00';
        }
      }
      if (DiasNoLab.includes(dias[k])) {
        horario.descansoIng[k] = '';
      }
    }

    // Modificar horario.descansoSal
    for (let l = 0; l < horario.descansoSal.length; l++) {
      if (l < 5) {
        if (horario.descansoSal[l] == '') {
          horario.descansoSal[l] = '18:00';
        }
      }
      if (DiasNoLab.includes(dias[l])) {
        horario.descansoSal[l] = '';
      }
    }

    return horario;
  }

  async filtrarRegistroCalendario() {
    this.mostrar_carga_todo = true;
    setTimeout(async () => {
      if (this.metradoMes2 == 0 || this.metradoMes2 == '0') {
        this.formatos = ['DIA', 'SEMANA', 'MES']
      } else {
        this.formatos = ['DIA', 'SEMANA']
        this.formato = 'DIA'
      }


      let fila = null
      this.filaSeleccionada2 = null
      if (this.metradoMes2 !== '0' && this.metradoMes2 !== 0) {
        fila = this.tablaRegistroMetrados.find(ele => ele.id_registro == this.metradoMes2);
        if (fila) {
          // Parsear fechas del filtro
          const fechaIniFiltro = this.parsearFechaLocal(fila.fechaini);
          const fechaFinFiltro = this.parsearFechaLocal(fila.fechafin);
          await this.aplicarFiltroCalendarioBase(fechaIniFiltro, fechaFinFiltro);

          // Generar calendario SEMANA solo dentro del rango filtrado
          if (this.formato == 'DIA') {
            // this.calendarioProgra[1] = await this.generarCalendarioPorFormato(fechaIniFiltro, fechaFinFiltro);
            const diasPorMes = await this.obtenerDiasPorMes(this.calendarioProgra[1]);

            // Recalcular acumulados
            this.calendarioProgra[0] = diasPorMes
          } else {

          }
          // Recalcular acumulados
          await this.crearCantidadSemanaParaElementos();
        }
      } else {

        if (this.formato == 'DIA') {
          this.calendarioProgra[1] = await this.generarCalendarioPorFormato(
            this.fechas.minFechaini,
            this.fechas.maxFechafin
          );
          this.calendarioProgra[1].forEach(element => {
            element.mostrar = 1
          });
          const diasPorMes = await this.obtenerDiasPorMes(this.calendarioProgra[1]);
          // Recalcular acumulados
          this.calendarioProgra[0] = diasPorMes
        } else {
          this.cambiarFormato()
        }
        await this.crearCantidadSemanaParaElementos();
      }
      const resp = await this.acumuladosRegistrosXFechas(this.metradoMes2, fila !== null ? fila.fechaini : this.fechas.minFechaini, fila !== null ? fila.fechafin : this.fechas.maxFechafin)
      let i = 0
      for (const element of this.tablaProgramacion) {
        element.realizado = JSON.parse(resp[i].array_valores)
        const a = JSON.parse(resp[i].metradodiario)


        if (this.formato == 'DIA') {
          const b = await this.asignarMetradosACalendario(this.calendarioProgra[1], a)
          // console.log('b', b)
          // console.log('item', element.item)
          // let array = []
          // if (this.metradoMes2 == 0 || this.metradoMes2 == '0') {
          //   array = b
          // } else {
          //   array = b.filter(ele => ele.fecha == this.metradoMes2)
          // }
          element.metradodiario = b
        }

        i++
      }

      this.mostrar_carga_todo = false;
    }, 0);
  }


  asignarMetradosACalendario(calendario: any[], metradosPorRegistro: any[]): any[] {
    return calendario.map(item => {
      // Buscar los metrados correspondientes al id_registro del item del calendario
      const registroMetrados = metradosPorRegistro.find(reg => reg.id_registro === item.id_registro);

      if (!registroMetrados) {
        return {
          ...item,
          metrado_dia: null
        };
      }

      const arrayMetrados = registroMetrados.metrados;

      // Para formato DIA: obtener el metrado específico del día
      if (this.formato === 'DIA' && item.fecha) {
        const diaDelMes = item.fecha.getDate() - 1; // Posición en el array (0-based)
        let metradoDelDia = diaDelMes < arrayMetrados.length ? arrayMetrados[diaDelMes] : null;
        if (metradoDelDia === 0 || metradoDelDia === '0' || metradoDelDia === null || metradoDelDia === undefined || metradoDelDia === '') {
          metradoDelDia = null;
        }

        // Si es string, intentar convertirlo a número y verificar si es 0
        if (typeof metradoDelDia === 'string') {
          const metradoNumerico = parseFloat(metradoDelDia);
          if (metradoNumerico === 0 || isNaN(metradoNumerico)) {
            metradoDelDia = null;
          }
        }

        return {
          ...item,
          metrado_dia: metradoDelDia
        };
      }

      // Para otros formatos, retornar el item sin cambios o con el array completo
      return {
        ...item,
        metrado_dia: null,
        metrados_array: arrayMetrados // Opcional: incluir el array completo
      };
    });
  }

  private parsearFechaLocal(fechaString: string | Date): Date {
    if (fechaString instanceof Date) {
      return new Date(fechaString.getFullYear(), fechaString.getMonth(), fechaString.getDate());
    }

    // Eliminar cualquier parte de tiempo y trabajar solo con fecha
    const fechaStr = fechaString.split('T')[0];
    const [year, month, day] = fechaStr.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  normalizarFecha(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  aplicarFiltroCalendarioBase(fechaIniFiltro: Date, fechaFinFiltro: Date) {
    const calendarioDias = this.calendarioProgra[1];

    // Normalizar fechas del filtro
    const fechaIniNormalizada = this.normalizarFecha(fechaIniFiltro);
    const fechaFinNormalizada = this.normalizarFecha(fechaFinFiltro);

    this.calendarioProgra[1].forEach(dia => {
      const fechaDiaNormalizada = this.normalizarFecha(new Date(dia.fecha));

      // Mostrar solo los días dentro del rango del filtro
      dia.mostrar = (fechaDiaNormalizada >= fechaIniNormalizada && fechaDiaNormalizada <= fechaFinNormalizada) ? 1 : 0;
    });
  }


  async crearCantidadSemanaParaElementos() {
    const calendarioDiasBase = this.calendarioBase[1]; // Array completo de días
    const semanas = this.calendarioProgra[1]; // Semanas ya generadas con el filtro aplicado

    // Obtener solo los días visibles después del filtro
    const diasVisibles = calendarioDiasBase.filter(dia => dia.mostrar === 1);


    this.tablaProgramacion.forEach((elemento, indexElemento) => {
      if (elemento.cantidades && elemento.cantidades.length > 0) {
        elemento.cantidadSemana = this.acumularCantidadesSoloDiasVisibles(
          elemento.cantidades,
          semanas,
          calendarioDiasBase,
          diasVisibles,
          elemento
        );
        elemento.parcialSemana = this.acumularParcialesSoloDiasVisibles(
          elemento.parciales,
          semanas,
          calendarioDiasBase,
          diasVisibles,
          elemento
        );

        // Debug para elementos con valores

      } else {
        elemento.cantidadSemana = new Array(semanas.length).fill(0);
        elemento.parcialSemana = new Array(semanas.length).fill(0);
      }
    });

  }

  acumularParcialesSoloDiasVisibles(
    parciales: any[],
    semanas: any[],
    calendarioDiasBase: any[],
    diasVisibles: any[],
    elemento: any
  ): number[] {
    const resultado: number[] = new Array(semanas.length).fill(0);

    semanas.forEach((semana, indexSemana) => {
      let acumulado = 0;

      const fechaInicioSemana = new Date(semana.fechainicio);
      const fechaFinSemana = new Date(semana.fechafin);

      // Recorrer solo los días VISIBLES que pertenecen a esta semana
      diasVisibles.forEach(diaVisible => {
        const fechaDia = new Date(diaVisible.fecha);

        if (fechaDia >= fechaInicioSemana && fechaDia <= fechaFinSemana) {
          const indexDiaBase = this.obtenerIndiceDiaEnCalendarioBase(
            fechaDia,
            calendarioDiasBase
          );

          if (indexDiaBase !== -1 &&
            parciales[indexDiaBase] !== null &&
            parciales[indexDiaBase] !== undefined) {

            acumulado += Number(parciales[indexDiaBase]) || 0;
          }
        }
      });

      resultado[indexSemana] = acumulado;
    });

    return resultado;
  }

  acumularCantidadesSoloDiasVisibles(
    cantidades: any[],
    semanas: any[],
    calendarioDiasBase: any[],
    diasVisibles: any[],
    elemento: any
  ): number[] {
    const resultado: number[] = new Array(semanas.length).fill(0);

    semanas.forEach((semana, indexSemana) => {
      let acumulado = 0;

      const fechaInicioSemana = new Date(semana.fechainicio);
      const fechaFinSemana = new Date(semana.fechafin);

      // Recorrer solo los días VISIBLES que pertenecen a esta semana
      diasVisibles.forEach(diaVisible => {
        const fechaDia = new Date(diaVisible.fecha);

        // Verificar si el día visible está dentro de esta semana
        if (fechaDia >= fechaInicioSemana && fechaDia <= fechaFinSemana) {
          // Encontrar el índice correspondiente en el calendario base
          const indexDiaBase = this.obtenerIndiceDiaEnCalendarioBase(
            fechaDia,
            calendarioDiasBase
          );

          if (indexDiaBase !== -1 &&
            cantidades[indexDiaBase] !== null &&
            cantidades[indexDiaBase] !== undefined) {

            const valor = Number(cantidades[indexDiaBase]) || 0;
            acumulado += valor;


          }
        }
      });

      resultado[indexSemana] = acumulado;
    });

    return resultado;
  }

  obtenerIndiceDiaEnCalendarioBase(fecha: Date, calendarioDiasBase: any[]): number {
    const fechaBuscada = fecha.toISOString().split('T')[0];

    for (let i = 0; i < calendarioDiasBase.length; i++) {
      const diaBase = calendarioDiasBase[i];
      const fechaDiaBase = new Date(diaBase.fecha).toISOString().split('T')[0];

      if (fechaDiaBase === fechaBuscada) {
        return i;
      }
    }

    return -1;
  }



  filtroTitulo2(indiceTitulo, tablaProgramacion) {
    this.mostrar_carga_todo = true
    setTimeout(() => {
      if (indiceTitulo) {
        const titulo = this.titulos.find(ele => ele.indice == indiceTitulo)
        tablaProgramacion = tablaProgramacion.forEach(ele => {
          if (ele.item.startsWith(`${titulo.item}.`) || ele.item == titulo.item) {
            ele.mostrar = 1
          } else {
            ele.mostrar = 0
          }
        }

        );

      } else {
        this.tablaProgramacion.forEach(ele => {
          ele.mostrar = 1
        })
      }
      this.mostrar_carga_todo = false
    }, 0);

  }


  async acumuladosRegistrosXFechas(id_registro, fechaini, fechafin) {
    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: id_registro,
      fechaini: moment(fechaini).format('YYYY-MM-DD'),
      fechafin: moment(fechafin).format('YYYY-MM-DD')
    }
    const response = await this.metradoService.acumuladosRegistrosXFechas(obj)
    return response
  }
}
