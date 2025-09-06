import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
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
      console.log('error', error)
    }
  }

  async listarPresu(bool = false) {
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
  }

  async generarTablaPresuMetradoXRegistro(id_registro) {
    const obj = {
      id_proyecto: this.id_proyecto,
      id_registro: id_registro
    }
    const response = await this.metradoService.listarTotalmetradosPresu(obj)
    console.log('response', response)
    if (response.length) {
      this.tablaPresCompleto = response
      console.log('this.tablaPresCompleto', this.tablaPresCompleto)
     
      this.titulos = this.tablaPresCompleto.filter(ele => ele.item.split('.').length == 1)
       console.log('this.titulos', this.titulos)
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

    const aspectos = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.id_proyecto,
    });
    this.diasCalendario = await this.generateCalendar(
      datos.fechaini,
      datos.fechafin,
      aspectos[0],
      aspectos[1]
    );
  }

  cambioFechasMetrado() {
    console.log('metrado', this.metradoMes)
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

  ChangeDia(dia) {
    if (!dia.bloqueado) {
      this.fechaselecionada = dia.fecha;
    }
    this.indiceDia = dia.indice
  }

  onNavChange(data) {

  }
}
