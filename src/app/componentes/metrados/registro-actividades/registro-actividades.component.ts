import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-registro-actividades',
  templateUrl: './registro-actividades.component.html',
  styleUrls: ['./registro-actividades.component.scss']
})
export class RegistroActividadesComponent implements OnInit {
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
  simbolo: any;
  nomproy: any;
  dec_metrado: any;
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
      console.log('this.tablaRegistroMetrados', this.tablaRegistroMetrados)
      if (this.tablaRegistroMetrados.length) {
        this.metradoMes = this.tablaRegistroMetrados[0].id_registro

        await this.generarCalendario(this.tablaRegistroMetrados[0])
        await this.generarTablaPresuMetradoXRegistro(this.metradoMes)
        if (this.titulos.length) {
          this.indiceTitulo = this.titulos[0].indice
          await this.filtroTitulo(this.indiceTitulo, this.tablaPresCompleto)
        }
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
    console.log('obj', obj)
    const response = await this.metradoService.listarTotalmetradosPresu(obj)
    console.log('response', response)
    if (response.length) {
      this.tablaPresCompleto = response
      this.titulos = this.tablaPresCompleto.filter(ele => ele.item.split('.').length == 1)
    }
  }

  async filtroTitulo(indice, tablaCompleta) {
    const tituloSel = this.titulos.find(ele => ele.indice == indice)
    const filtrados = tablaCompleta.filter(ele => ele.item.startsWith(`${tituloSel.item}.`))
    filtrados.unshift(tituloSel)
    this.tablaPresupuesto = filtrados
  }

  verHojaMetrado() {
    console.log('')
  }

  async cambioVista(ind: any) {
    this.subvista = ind;
    console.log('ind', ind)
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
    console.log('this.diasCalendario', this.diasCalendario)
    console.log('datos', datos)
    const aspectos = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.id_proyecto,
    });
    this.diasCalendario = await this.generateCalendar(
      datos.fechaini,
      datos.fechafin,
      aspectos[0],
      aspectos[1]
    );
    console.log('2', this.diasCalendario)
    const estadoXPart = []
    for (const element of this.diasCalendario) {
      estadoXPart.push(null)
    }
    this.estadoXPart = estadoXPart
  }

  async cambioFechasMetrado() {
    this.mostrar_carga_todo = true
    this.indiceDia = null
    this.fechaselecionada = null
    this.diasCalendario = []
    this.estadoXPart = []
    this.tablaMovAlmcSalida = []
    const met = this.tablaRegistroMetrados.find(ele => ele.id_registro == this.metradoMes)
    console.log('met', met)
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
    console.log('diaaaa', dia)
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
    console.log('reponse', response)
    this.tablaMovAlmcSalida = response
    this.buscando = false
  }
  selPartida(index, row) {
    this.filaSeleccionada = row
    if (row.unidad) {
      let estadoXPart = row.estadodiario ? row.estadodiario : []
      if (!estadoXPart || !estadoXPart.length || estadoXPart?.length == 1) {
        for (const element of this.diasCalendario) {
          estadoXPart.push(null)
        }
      }
      this.estadoXPart = estadoXPart
    } else {
      const estadoXPart = []
      for (const element of this.diasCalendario) {
        estadoXPart.push(null)
      }
      this.estadoXPart = estadoXPart
    }
  }

  onNavChange(data) {

  }

  habilitarEditar(ind, celda) {
    this.tablaMovAlmcSalida[ind]['editar' + celda] = true
  }

  caneditarcelda1(value, indice, celda) {
    if (value)
    this.tablaMovAlmcSalida[indice][celda] = value
  }
}
