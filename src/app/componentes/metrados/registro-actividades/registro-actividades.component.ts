import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';

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
    public metradoService: MetradoService) { }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
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

        await this.generarCalendario(this.tablaRegistroMetrados[0])
        await this.generarTablaPresuMetradoXRegistro(this.metradoMes)
        // if (this.titulos.length) {
        //   this.indiceTitulo = this.titulos[0].indice
        //   await this.filtroTitulo(this.indiceTitulo, this.tablaPresCompleto)
        // }
        this.indiceTitulo = ''
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
      console.log('titulos', this.titulos)
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
    // this.fila4_sel = null
    // this.tablaMovAlmcSalida = []
    // const tituloSel = this.titulos.find(ele => ele.indice == indice)
    // const filtrados = tablaCompleta.filter(ele => ele.item.startsWith(`${tituloSel.item}.`))
    // filtrados.unshift(tituloSel)
    // for (const ele of filtrados) {
    //   ele.icomost = 1;
    //   ele.mostrar = 1
    // }

    // this.tablaPresupuesto = filtrados
    this.fila4_sel = null;
    this.tablaMovAlmcSalida = [];


    console.log('indice', indice)
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

    this.tablaPresupuesto = resultado;
  }

  verHojaMetrado() {
    console.log('')
  }

  async cambioVista(ind: any) {
    this.subvista = ind;
    if (ind == 3) {
      // if (this.existecambios) {
      //   await this.guardarCambios();
      //   this.existecambios = false;
      // }
      // await this.changeVista2(this.datosglo);
    } else if (ind == 2) {
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
  }

  async generarCalendario(datos) {
    const aspectos = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.id_proyecto,
    });
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
    // if (row.unidad) {
    //   let estadoXPart = row.metradodiario ? row.metradodiario : []
    //   if (!estadoXPart || !estadoXPart.length || estadoXPart?.length == 1) {
    //     for (const element of this.diasCalendario) {
    //       estadoXPart.push(null)
    //     }
    //   }
    //   this.estadoXPart = estadoXPart
    // } else {
    //   const estadoXPart = []
    //   for (const element of this.diasCalendario) {
    //     estadoXPart.push(null)
    //   }
    //   this.estadoXPart = estadoXPart
    // }
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
      const existe = this.saldosRegistros.find(ele => ele.fecha == moment(element?.fecha).format('YYYY-MM-DD'))
      if (existe) {
        element.estado = 1
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
    console.log('fecha', fecha)
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
}
