import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import stringSimilarity from 'string-similarity-js';
import * as converter from 'xml-js';
import { filaProgramacion } from '../programacion-obra.component';
import { PredecessorLinkElement, programacion } from './../projectType';
import { throwError } from 'rxjs';

export interface filaTablaFinal {
  ind: number;
  indice: number;
  item: string;
  idMsProject: number;
  unidad: string;
  uid: number;
  descripcion: string;
  idgantt_xml: number;
  duracion_xml: number;
  fechaini_xml: string;
  fechafin_xml: string;
  referencia_xml: string;
  referenciados_xml: string;
  idgantt_comp: number;
  duracion_comp: number;
  fechaini_comp: string;
  fechafin_comp: string;
  referencia_comp: string;
  duraciontot_comp: number;
  referenciados_comp: string;
  condini: string;
  condfin: string;
  hijos_uid: string;
  existePresupuesto: boolean;
  tipoCambio: number;
  cuadrilla: number;
  metrado: number;
  rendimiento: number;
  tiempoUnitario: number;
  parcial: number;
  indice_ref_hito: number;
  refCorregida: number
}
@Component({
  selector: 'app-modal-programacion-xml',
  templateUrl: './modal-programacion-xml.component.html',
  styleUrls: ['./modal-programacion-xml.component.scss'],
})
export class ModalProgramacionXmlComponent implements OnInit {
  @ViewChild('modalDocumentos') modaldocumentos: ModalBasicComponent;
  @ViewChild('modalMultiple') modalMultiple: ModalBasicComponent;
  @ViewChild('modalNoLaborables') modalNoLaborables: ModalBasicComponent;
  @Input() jsonxml: programacion = null;
  @Input() existentesProg = [];
  @Input() titulo1: any = '';
  @Input() titulo1color: any = '';
  @Input() titulo1letra: any = '';
  @Input() nombreArchivo = '';
  @Input() dataPrincipal = [];
  @Input() idUsuario = null;
  @Input() idProyecto = null;
  @Input() nombreProyecto = null;
  @Input() fechaProyecto = null;
  @Input() dataProyecto = null;
  @Input() noLaborables = null;
  @Input() aspectosdias = null;
  filasel1 = null;
  filasel2 = null;
  filasel3 = null;
  mostrar_carga_todo = false;
  verXmlTabla = false;
  vista = 0;
  xmlTable = [];
  xmlFormat = [];
  porcentaje: number = 0;
  buscando = false;
  hitosXML = [];
  tablaFinal: filaTablaFinal[] = [];
  hitosProgramacion: any[] = [];
  tablaAuxiliar = [];
  tablaCompatibilizada = [];
  yaGenerado: boolean = false;
  fiMenor: any = null;
  ffMayor: any = null;
  filaComparar: any = null;
  filaReemplazo = null;
  idfilaReemplazo = null;
  hitosAgregados = false;
  listaFeriados = [];
  listaNoLaborables = [];
  fuenteFeriados = 0;
  xmlReemplazo: any[] = [];
  filasReemplazo: any[] = [];
  arrReemplazar = [];
  todosMarcados: boolean = false;

  constructor(
    private modal: NgbActiveModal,
    private principalService: PrincipalService,
    public formsService: FormsService,
    private toaster: ToastrService
  ) {}

  async ngOnInit() {
    await this.recuperarHitos();
    this.tablaAuxiliar = JSON.parse(JSON.stringify(this.dataPrincipal));
    this.xmlTable.length = this.dataPrincipal.length;
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async anterior() {
    this.vista--;
  }

  async recuperarHitos() {
    const obj = {
      id_proyecto: this.idProyecto,
    };
    const hitos = await this.principalService.listarHitos(obj);
    if (!hitos.length) {
      this.hitosProgramacion = [];
    } else {
      hitos.map((ele) => {
        const obj = {
          descripcion: ele.descripcion,
          item: '',
          idgantt: '',
          condfin: '',
          condini: '',
          cuadrilla: null,
          duracion: 0,
          duracionreq: 0,
          duraciontot: 0,
          editarCua: false,
          editarDur: false,
          editarFF: false,
          editarFI: false,
          editarPred: false,
          editarRest: false,
          fechafin: ele.fechafin,
          fechafinBD: true,
          fechaini: ele.fechaini,
          fechainiBD: true,
          hijos: '',
          icomost: 0,
          id_proyecto: this.idProyecto,
          id_usuario: this.idUsuario,
          ind: null,
          ind2: null,
          indice: null,
          hijos_uid: null,
          metrado: null,
          mostrar: 1,
          nivel: null,
          nroclick: null,
          predecesor: ele.indice_refer,
          referencia: ele.referencia,
          referenciados: '',
          rendimiento: null,
          restriccion: null,
          restriccion2: null,
          unidad: false,
          existePresupuesto: 1,
          deXml: false,
          idMsProject: null,
          referenciaXML: '',
          uid: ele.uid,
        };
        this.hitosProgramacion.push(obj);
      });
    }
  }

  async importarXML(event, nombre) {
    try {
      this.buscando = true;
      this.fuenteFeriados = 0;
      this.xmlFormat = [];
      this.listaFeriados = [];
      this.listaNoLaborables = [];
      this.nombreArchivo = nombre;
      const file = event.target.files[0];
      if ((!file.name && !file.size) || file.type !== 'text/xml') {
        const text =
          file.type !== 'text/xml'
            ? 'Documento con formato diferente a .xml'
            : 'Documento no valido';
        this.toaster.error(text, 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
        this.buscando = false;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        let xml = e.target.result;
        let result1 = converter.xml2json(xml, { compact: true, spaces: 2 });
        const JSONData = JSON.parse(result1);
        this.jsonxml = JSONData;
        this.estructurarTabla();
        this.yaGenerado = false;
        this.buscando = false;
      };
      reader.readAsText(event.target.files[0]);
      const fileUpload = document.getElementById('archivo') as HTMLInputElement;
      if (fileUpload != null) {
        fileUpload.value = null;
      }
    } catch (e) {
      SwalService.error();
      this.buscando = false;
    }
  }

  async estructurarTabla() {
    try {
      if (!this.jsonxml.Project?.Tasks?.Task) {
        this.toaster.error(
          'Documento con formato incorrecto, seleccione otro documento',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      } else {
        await this.recuperarCalendario(
          this.jsonxml.Project.Calendars,
          this.jsonxml.Project.CalendarUID._text
        );
        let nuevoArray = [];
        this.xmlFormat = [];
        this.tablaAuxiliar = [];
        this.tablaAuxiliar = JSON.parse(JSON.stringify(this.dataPrincipal));
        this.xmlTable = [];
        this.xmlTable.length = this.dataPrincipal.length;
        this.existentesProg = [];
        this.hitosXML = [];
        let index = 0;
        let tasks = this.jsonxml.Project.Tasks.Task;
        const minutsPerDay = Number(this.jsonxml.Project.MinutesPerDay._text);
        for await (const ele of tasks) {
          const duracion = this.duracion(
            ele.Duration?._text ? ele.Duration?._text : '0',
            ele.LevelingDelayFormat._text,
            minutsPerDay
          );
          const igualItem = await this.dataPrincipal.find(
            (dat) => dat.item == ele.OutlineNumber?._text
          );
          const splitItem = ele.OutlineNumber._text
            ? ele.OutlineNumber._text.split('.')
            : '';
          const obj = {
            descripcion: ele.Name?._text
              ? ele.Name?._text?.toUpperCase().trim().replace(/\s+/g, ' ')
              : '',
            item: ele.OutlineNumber?._text,
            idgantt: Number(ele.ID._text),
            condfin: '',
            condini: '',
            duracion: duracion,
            duracionreq: duracion,
            duraciontot: duracion,
            fechafin: ele.Finish?._text
              ? moment(ele.Finish._text).format('YYYY-MM-DD')
              : '',
            fechaini: ele.Start?._text
              ? moment(ele.Start._text).format('YYYY-MM-DD')
              : '',
            hijos: '',
            hijos_uid: '',
            id_proyecto: this.idProyecto,
            id_usuario: this.idUsuario,
            ind: index,
            ind2: index,
            indice: null,
            nivel: splitItem.length,
            predecesor: null,
            referencia: null,
            referenciados: '',
            restriccion: null,
            restriccion2: null,
            unidad: igualItem?.unidad,
            existePresupuesto: false,
            idMsProject: Number(ele.UID._text),
            referenciaXML: '',
            uid: null,
            parecidas: null,
            validas: null,
            refCorregida: false,
          };
          if (ele.Milestone._text !== '0') {
            this.hitosXML.push(ele);
          }
          index++;
          nuevoArray.push(obj);
        }
        let index2 = 0;
        let nroHitos = 0;
        for await (const ele of nuevoArray) {
         
          const object = await this.referenciaStructura(
            tasks[index2].PredecessorLink,
            nuevoArray
          );
          const existePresu = await this.buscarEnTablaPresupuesto(ele);
          nuevoArray[index2].referencia = object.referencia;
          nuevoArray[index2].referenciaXML = object.referenciaXML;
          // nuevoArray[index2].refCorregida = object.novalido;
       
          if (
            existePresu &&
            (existePresu.partidaParecidas.length ||
              existePresu.partidasValidas.length)
          ) {
            if (existePresu.partidasValidas.length == 1) {
              nuevoArray[index2].validas = existePresu.partidasValidas;
              nuevoArray[index2].uid = existePresu.partidasValidas[0].uid;
              await this.agregarTablaCompatibilizada(
                existePresu.partidasValidas[0],
                ele
              );
              nuevoArray[index2].existePresupuesto = true;
            } else if (
              existePresu.partidasValidas.length == 0 &&
              existePresu.partidaParecidas.length > 0
            ) {
              nuevoArray[index2].parecidas = existePresu.partidaParecidas;
              nuevoArray[index2].existePresupuesto = false;
            } else {
              nuevoArray[index2].existePresupuesto = false;
            }
          } else {
            nuevoArray[index2].existePresupuesto = false;
          }
          if (ele.duracion == 0) {
            nroHitos++;
          }

          index2++;
        }
        this.xmlFormat = nuevoArray;
        this.existentesProg = this.xmlFormat.filter(
          (ele) => ele.existePresupuesto
        );
        await this.calcularPorcentaje();
        this.hitosAgregados = false;
      }
    } catch (e) {
      SwalService.error();
      console.log(e);
    }
  }

  async recuperarCalendario(calendario, calendarioUID) {
    let dias = null;
    let exepciones = null;
    if (!Array.isArray(calendario.Calendar)) {
      if (Number(calendarioUID) == Number(calendario.Calendar?.UID?._text)) {
        dias = calendario.Calendar.WeekDays.WeekDay;
        exepciones = calendario.Calendar?.Exceptions?.Exception
          ? calendario.Calendar?.Exceptions?.Exception
          : null;
      } else {
      }
    } else {
      const encontrado = await calendario.Calendar?.find(
        (ele) => Number(ele.UID._text) == Number(calendarioUID)
      );
      if (encontrado) {
        dias = encontrado.WeekDays.WeekDay;
        exepciones = encontrado.Exceptions?.Exception
          ? encontrado.Exceptions?.Exception
          : null;
      } else {
      }
    }
    let exceptions = [];
    let noLaborables = [];
    let feriados = [];
    if (dias) {
      if (exepciones && !Array.isArray(exepciones)) {
        if (exepciones !== null && exepciones !== undefined) {
          exceptions.push(exepciones);
        }
      } else {
        if (exepciones?.length) {
          exceptions = exepciones;
        }
      }
      const diasSemana = [
        'DOMINGO',
        'LUNES',
        'MARTES',
        'MIÉRCOLES',
        'JUEVES',
        'VIERNES',
        'SÁBADO',
      ];
      for (const iterator of dias) {
        if (
          Number(iterator.DayType?._text) > 0 &&
          Number(iterator.DayType?._text) < 8 &&
          iterator.DayWorking?._text == '0'
        ) {
          noLaborables.push(diasSemana[Number(iterator.DayType._text) - 1]);
        }
      }
      let i = 1;
      for (const iterator of exceptions) {
        var fi = moment(iterator.TimePeriod?.FromDate._text);
        var ff = moment(iterator.TimePeriod?.ToDate._text);
        const dias = ff.diff(fi, 'days') + 1;
        if (dias > 1) {
          for (let j = 1; j <= dias; j++) {
            const obj = {
              descripcion: iterator.Name?._text
                ? iterator.Name?._text + j
                : 'Feriado ' + j,
              fecha: moment(fi).add(i, 'days').format('YYYY-MM-DD'),
              id_proyecto: this.idProyecto,
              laborado: 0,
              nro: null,
            };
            feriados.push(obj);
          }
        } else {
          const obj = {
            descripcion: iterator.Name?._text
              ? iterator.Name?._text
              : 'Feriado 1',
            fecha: moment(fi).format('YYYY-MM-DD'),
            id_proyecto: this.idProyecto,
            laborado: 0,
            nro: null,
          };
          feriados.push(obj);
        }
        i++;
      }
    }
    this.listaFeriados = feriados;
    this.listaNoLaborables = noLaborables;
  }

  duracion(horas, horasdiarias, minutosPorDia) {
    const horas_1 = horas.split('PT');
    const horas_Totales = parseInt(horas_1[1]);
    const horas_dias = Number(horasdiarias);
    const duracion = Number(
      this.formsService.redondeo(horas_Totales / (minutosPorDia / 60), 2)
    );
    return duracion;
  }

  async buscarEnPresupuesto(task) {
    const nivel = task.OutlineNumber._text.split('.').length;
    const esPartida = task.Rollup._text == '0' ? true : false;
    const encontrado = await this.dataPrincipal.filter((ele, index) => {
      const nivelPartida = ele.item.split('.').length;
      if (
        ele.descripcion.toUpperCase().trim().replace(/\s+/g, ' ') ===
          task.Name._text.toUpperCase().trim().replace(/\s+/g, ' ') &&
        nivel == nivelPartida
      ) {
        return ele;
      }
    });
    return { encontrado: encontrado.length ? 1 : 0, ele: encontrado };
  }

  async referenciaStructura(predecesorLink, nuevoArray) {
    let string;
    let string2;
    let refNoValida = false;
    const tipos = ['FF', '', 'CF', 'CC', 'FC'];
    if (typeof predecesorLink == 'undefined') {
      string = '';
      string2 = '';
    } else if (typeof predecesorLink == 'object') {
      if (predecesorLink.length) {
        let arrayRefencias = [];
        let arrayRefencias2 = [];
        for await (const ele of predecesorLink) {
          let dias = '';
          let operador = '';
          // console.log('a',ele.PredecessorUID._text)
          // const noesTitulo = await nuevoArray.find(
          //   (elem) =>
          //     elem.unidad && elem.idMsProject == Number(ele.PredecessorUID._text)
          // );

          const idgantt = await this.recuperarIdGantt(
            ele.PredecessorUID._text,
            nuevoArray
          );
          // if (noesTitulo) {
            const tipo = tipos[Number(ele.Type._text)];
            if (idgantt && idgantt.duracion > 0) {
              if (ele.LagFormat && Number(ele.LinkLag._text) !== 0) {
                operador =
                  Math.sign(Number(ele.LinkLag._text)) == 1 ? '+' : '-';
                if (ele.LagFormat._text == '7') {
                  const d = Number(ele.LinkLag._text) / 4800;
                  dias = operador == '-' ? d * -1 + 'd' : d + 'd';
                } else if (ele.LagFormat._text == '19') {
                  const d = Number(ele.LinkLag._text);
                  dias = operador == '-' ? d * -1 + '%' : d + '%';
                } else {
                  dias = '';
                }
              } else {
                operador = '';
              }
              const ref =
                idgantt.idgantt + tipo + (dias ? operador + dias : '');
              arrayRefencias.push(ref);
            }
            arrayRefencias2.push([
              Number(ele.PredecessorUID._text),
              tipo,
              dias ? dias.toString() : '',
              operador,
            ]);
          // } else {
          //   arrayRefencias = [];
          //   arrayRefencias2 = [];
          //   refNoValida = true;
          //   break;
          // }
        }
        string = arrayRefencias.join(',');
        string2 = JSON.stringify(arrayRefencias2);
      } else {
        let ele: PredecessorLinkElement = predecesorLink;
        const idgantt = await this.recuperarIdGantt(
          ele.PredecessorUID._text,
          nuevoArray
        );
        // console.log('b',ele.PredecessorUID._text)
        // const noesTitulo = await nuevoArray.find(
        //   (elem) => elem.unidad && elem.uid == Number(ele.PredecessorUID._text)
        // );

        // if (idgantt && noesTitulo) {
        if (idgantt) {
          const tipo = tipos[Number(ele.Type._text)];
          let dias = '';
          let operador = '';
          if (ele.LagFormat && Number(ele.LinkLag?._text) !== 0) {
            operador = Math.sign(Number(ele.LinkLag._text)) == 1 ? '+' : '-';
            if (ele.LagFormat._text == '7') {
              const d = Number(ele.LinkLag._text) / 4800;
              dias = operador == '-' ? d * -1 + 'd' : d + 'd';
            } else if (ele.LagFormat._text == '19') {
              const d = Number(ele.LinkLag._text);
              dias = operador == '-' ? d * -1 + '%' : d + '%';
            } else {
              dias = '';
            }
          } else {
            operador = '';
          }
          const ref = idgantt.idgantt + tipo + (dias ? operador + dias : '');
          string = ref;
          string2 = JSON.stringify([
            [
              Number(ele.PredecessorUID._text),
              tipo,
              dias ? dias.toString() : '',
              operador,
            ],
          ]);
        }
        // } else {
        //   string = '';
        //   string2 = '';
        //   refNoValida = true;
        // }
      }
    }

    const respuesta = {
      referencia: string,
      referenciaXML: string2,
      novalido: refNoValida,
    };
    return respuesta;
  }

  async recuperarIdGantt(id, nuevoArray) {
    const partida = nuevoArray.find((ele) => ele.idMsProject === Number(id));
    if (partida.duracion !== 0) {
      return partida;
    }
  }

  async mostrarCoincidencias(item) {
    this.filaComparar = item;
    this.modaldocumentos.show();
  }

  async cerrarModal() {
    this.filaComparar = null;
    this.filaReemplazo = null;
    this.idfilaReemplazo = null;
    this.modaldocumentos.hide();
    this.modalMultiple.hide();
  }

  async cambioParecido(event) {
    this.filaReemplazo = this.filaComparar.parecidas.find(
      (ele) => ele.indice == event
    );
    this.idfilaReemplazo = event;
  }

  async cambiarDescripcion() {
    if (this.filaReemplazo) {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se reemplazara la descripcion seleccionada'
      );
      if (sw.isConfirmed) {
        await this.agregarTablaCompatibilizada(
          this.filaReemplazo,
          this.filaComparar
        );
        this.filaComparar.descripcion = this.filaReemplazo.descripcion;
        this.filaComparar.validas = [this.filaReemplazo];
        this.filaComparar.parecidas = null;
        this.filaComparar.uid = this.filaReemplazo.uid;
        this.filaComparar.existePresupuesto = true;
        this.existentesProg = this.xmlFormat.filter(
          (ele) => ele.existePresupuesto
        );
        await this.calcularPorcentaje();
        this.cerrarModal();
      }
    } else {
      this.toaster.error(
        'Ninguna descripcion reemplazo seleccionada',
        'Error',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
      return;
    }
  }

  async solucionarmultiple() {
    this.todosMarcados = false;
    this.modalMultiple.show();
    this.xmlReemplazo = [];
    this.xmlReemplazo = await this.xmlFormat.filter(
      (ele) => ele.parecidas?.length
    );
    this.filasReemplazo = [];
    for (const iterator of this.xmlReemplazo) {
      this.filasReemplazo.push(iterator.parecidas[0]);
    }
  }

  async marcasTodosReemplazo(checked) {
    this.todosMarcados = checked;
    if (checked) {
      this.arrReemplazar = [];
      this.xmlReemplazo.map((ele, index) => {
        this.arrReemplazar.push(index);
      });
    } else {
      this.arrReemplazar = [];
    }
  }

  async cambioCheckReemplazo(checked, i) {
    if (checked) {
      if (!this.arrReemplazar.includes(i)) {
        this.arrReemplazar.push(i);
      }
    } else {
      if (this.arrReemplazar.includes(i)) {
        const indice = this.arrReemplazar.indexOf(i);
        this.arrReemplazar.splice(indice, 1);
      }
    }
  }

  async reemplazarMultiple() {
    if (this.arrReemplazar.length) {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se reemplazará la descripción de taodas las filas seleccionadas'
      );
      if (sw.isConfirmed) {
        for (const iterator of this.arrReemplazar) {
          await this.agregarTablaCompatibilizada(
            this.filasReemplazo[iterator],
            this.xmlReemplazo[iterator]
          );
          this.xmlReemplazo[iterator].descripcion =
            this.filasReemplazo[iterator].descripcion;
          this.xmlReemplazo[iterator].validas = [this.filasReemplazo[iterator]];
          this.xmlReemplazo[iterator].parecidas = null;
          this.xmlReemplazo[iterator].uid = this.filasReemplazo[iterator].uid;
          this.xmlReemplazo[iterator].existePresupuesto = true;
          this.existentesProg = this.xmlFormat.filter(
            (ele) => ele.existePresupuesto
          );
          await this.calcularPorcentaje();
          this.cerrarModal();
        }
      }
    } else {
      this.toaster.error(
        'Ninguna descripcion reemplazo seleccionada',
        'Error',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
      return;
    }
  }

  async calcularPorcentaje() {
    this.porcentaje =
      (this.existentesProg.length * 100) / this.dataPrincipal.length;
  }

  async mostrarTablas() {
    try {
      this.mostrar_carga_todo = true;
      setTimeout(async () => {
        this.vista = 1;
        this.tablaFinal = [];
        let nuevo: filaTablaFinal[] = [];
        if (this.porcentaje > 90) {
          let fiMenor = null;
          let ffMayor = null;
          for (let i = 0; i < this.xmlTable.length; i++) {
            const part = this.xmlTable[i];
            if (!part) {
              const partida = await this.agregarNoExistente(i);
              partida.ind = i;
              partida.ind2 = i;
              this.xmlTable[i] = partida;
            } else {
              this.xmlTable[i].ind = i;
              this.xmlTable[i].ind2 = i;
            }
            if (this.xmlTable[i].unidad) {
              if (fiMenor == null) {
                fiMenor = this.xmlTable[i].fechaini;
              } else {
                if (
                  this.xmlTable[i].fechaini !== '' &&
                  this.xmlTable[i].fechaini < fiMenor
                ) {
                  fiMenor = this.xmlTable[i].fechaini;
                }
              }
              if (ffMayor == null) {
                ffMayor = this.xmlTable[i].fechafin;
              } else {
                if (
                  this.xmlTable[i].fechafin !== '' &&
                  this.xmlTable[i].fechafin > ffMayor
                ) {
                  ffMayor = this.xmlTable[i].fechafin;
                }
              }
            }
          }
          this.fiMenor = fiMenor;
          this.ffMayor = ffMayor;
          if (!this.hitosAgregados) {
            await this.agregarHitos();
          }
          await this.referenciasCorrectas();
          let ind = 0;
          for (const part of this.xmlTable) {
            if (part.referenciados && part.duracion && part.unidad) {
              const referenciados = JSON.parse(part.referenciados);
              if (referenciados.length == 1) {
                await this.agregarAlPadre(
                  referenciados[0][0],
                  part.uid,
                  'xmlTable'
                );
                const response = await this.condicionanteFila(
                  referenciados,
                  ind,
                  'xmlTable'
                );
                part.condini = response.condini
                  ? JSON.stringify(response.condini)
                  : '';
                part.condfin = response.condfin
                  ? JSON.stringify(response.condfin)
                  : '';
              } else {
                const response = await this.condicionanteFila(
                  referenciados,
                  ind,
                  'xmlTable'
                );
                part.condini = response.condini
                  ? JSON.stringify(response.condini)
                  : '';
                part.condfin = response.condfin
                  ? JSON.stringify(response.condfin)
                  : '';
                if (response.condfin) {
                  await this.agregarAlPadre(
                    response.condfin[0],
                    part.uid,
                    'xmlTable'
                  );
                }
                if (response.condini) {
                  await this.agregarAlPadre(
                    response.condini[0],
                    part.uid,
                    'xmlTable'
                  );
                }
              }
            }
            ind++;
          }
          let i = 0;
          let j = 1;
          for (const iterator of this.xmlTable) {
            let idgantt2 = null;
            if (iterator.item && iterator.duracion !== 0) {
              idgantt2 = j;
              j++;
            }

            const fila: filaTablaFinal = {
              condfin: iterator.condfin,
              condini: iterator.condini,
              descripcion: iterator.descripcion,
              idgantt_xml: iterator.idgantt,
              duracion_xml: iterator.duracion,
              fechafin_xml: iterator.fechafin,
              fechaini_xml: iterator.fechaini,
              referencia_xml: iterator.referencia,
              referenciados_xml: iterator.referenciados,
              duracion_comp: iterator.unidad
                ? Math.ceil(iterator.duracion)
                : null,
              fechafin_comp: null,
              fechaini_comp: null,
              referencia_comp: null,
              referenciados_comp: iterator.referenciados,
              duraciontot_comp: null,
              idgantt_comp: idgantt2,
              existePresupuesto: iterator.existePresupuesto,
              hijos_uid: iterator.hijos_uid,
              idMsProject: iterator.idMsProject,
              ind: i,
              indice: iterator.indice,
              uid: iterator.uid,
              unidad: iterator.unidad,
              tipoCambio: null,
              item: iterator.item,
              cuadrilla: iterator.cuadrilla ? iterator.cuadrilla : null,
              indice_ref_hito: null,
              metrado: iterator.metrado ? iterator.metrado : null,
              parcial: iterator.parcial ? iterator.parcial : null,
              rendimiento: iterator.rendimiento ? iterator.rendimiento : null,
              tiempoUnitario: iterator.tiempoUnitario,
              refCorregida : iterator.refCorregida
            };
            if (
              !fila.referencia_xml &&
              fila.unidad &&
              fila.item &&
              !fila.indice_ref_hito
            ) {
              if (fila.duracion_xml) {
                fila.fechaini_comp = moment(
                  this.dataProyecto.fecha_inicio
                ).format('YYYY-MM-DD');
                const response = await this.calcularFechaComplemento(
                  Math.ceil(fila.duracion_xml),
                  fila.fechaini_comp,
                  ''
                );
                fila.fechafin_comp = response.fecha;
                fila.duracion_comp = response.duracion;
                fila.duraciontot_comp = response.duraciontot;
              } else {
                fila.fechaini_comp = moment(
                  this.dataProyecto.fecha_inicio
                ).format('YYYY-MM-DD');
                fila.fechafin_comp = moment(
                  this.dataProyecto.fecha_inicio
                ).format('YYYY-MM-DD');
                fila.duracion_comp = 1;
                fila.duraciontot_comp = 1;
                fila.referencia_comp = '';
                fila.referenciados_comp = '';
                fila.hijos_uid = '';
              }
            }
            nuevo.push(fila);
            i++;
          }
          this.tablaFinal = nuevo;

          for (const fila of this.tablaFinal) {
            if (fila.referenciados_comp) {
              fila.referencia_comp = await this.nuevaReferencia(
                fila.referenciados_comp
              );
            } else {
              fila.referencia_comp = '';
            }
          }
          for (const iterator of this.tablaFinal) {
            if (iterator.hijos_uid && !iterator.referenciados_comp) {
              await this.actualizarEnlazados(iterator);
            }
            if (iterator.unidad && iterator.referenciados_comp) {
              iterator.referencia_comp = await this.refCorrectFinal(
                JSON.parse(iterator.referenciados_comp)
              );
            }
          }

          for (const iterator of this.tablaFinal) {
            if (
              iterator.item &&
              iterator.unidad &&
              iterator.duracion_comp > 0 &&
              (!iterator.fechaini_comp || !iterator.fechafin_comp)
            ) {
              if (
                (iterator.fechafin_comp && !iterator.fechaini_comp) ||
                (!iterator.fechafin_comp && iterator.fechaini_comp)
              ) {
                const reps = await this.calcularFechaComplemento(
                  iterator.duracion_comp,
                  iterator.fechaini_comp,
                  iterator.fechafin_comp
                );
                iterator.duraciontot_comp = reps.duraciontot;
              }
            }
          }
          await this.actualizarTitulos2();
          await this.alertasFilas();
          this.hitosAgregados = true;
          this.mostrar_carga_todo = false;
        } else {
          this.vista = 0;
          this.mostrar_carga_todo = false;
          this.toaster.error(
            'Documento no Valido. Cantidad de coincidencias del documento no debe de ser menor a 90% con la tabla presupuesto del sistema',
            'Error',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 7000,
            }
          );
          return;
        }
      }, 1000);
    } catch (e) {
      console.log(e);
      this.mostrar_carga_todo = false;
      SwalService.error(e);
    }
  }

  async nuevaReferencia(referenciados_comp) {
    const arra = JSON.parse(referenciados_comp);
    let ref = [];
    for (const iterator of arra) {
      const ele = await this.tablaFinal.find((ele) => ele.uid == iterator[0]);
      const referencia =
        ele.idgantt_comp +
        iterator[1] +
        (iterator[2] ? iterator[3] + iterator[2] : '');
      ref.push(referencia);
    }
    return ref.join(',');
  }

  async alertasFilas() {
    for (const iterator of this.tablaFinal) {
      //0=ninguno, 1 = cambio de ref, 2 = fechas dif, 3 =fi fid, 4 = ff dif
      if (iterator.duracion_comp == 0) {
        let respuest = null;
        if (iterator.referencia_comp) {
          const respuest = await this.condHito(iterator);
          iterator.condini = respuest.condini;
          iterator.fechaini_comp = respuest.fechaini;
          iterator.fechafin_comp = respuest.fechafin;
          iterator.referencia_comp = await this.referenciasHitos(
            iterator.referenciados_comp
          );
        } else {
          iterator.condini = '';
          iterator.fechaini_comp = moment(
            this.dataProyecto.fecha_inicio
          ).format('YYYY-MM-DD');
          iterator.fechafin_comp = moment(
            this.dataProyecto.fecha_inicio
          ).format('YYYY-MM-DD');
          iterator.referencia_comp = '';
        }
      }
      if (
        iterator.referencia_xml &&
        iterator.referencia_comp !== iterator.referencia_xml
      ) {
        if (iterator.unidad) {
          iterator.tipoCambio = 1;
        }
      } else {
        if (!iterator.fechaini_xml && !iterator.fechafin_xml) {
          iterator.tipoCambio = 2;
        } else if (
          iterator.fechaini_xml !== iterator.fechaini_comp &&
          iterator.fechafin_xml !== iterator.fechafin_comp
        ) {
          iterator.tipoCambio = 2;
        } else if (
          iterator.fechaini_xml !== iterator.fechaini_comp &&
          iterator.fechafin_xml == iterator.fechafin_comp
        ) {
          iterator.tipoCambio = 3;
        } else if (
          iterator.fechaini_xml == iterator.fechaini_comp &&
          iterator.fechafin_xml !== iterator.fechafin_comp
        ) {
          iterator.tipoCambio = 4;
        } else {
          iterator.tipoCambio = 0;
        }
      }
    }
  }

  async referenciasHitos(referenciados) {
    let refer = [];
    let array = referenciados ? JSON.parse(referenciados) : [];
    for (const iterator of array) {
      const encontrado = await this.tablaFinal.find(
        (ele) => ele.uid == iterator[0]
      );
      const ref =
        encontrado.idgantt_comp +
        iterator[1] +
        (iterator[2] ? iterator[3] + iterator[2] : '');
      refer.push(ref);
    }
    return refer.join(',');
  }

  async condHito(iterator) {
    const array = iterator.referenciados_comp
      ? JSON.parse(iterator.referenciados_comp)
      : [];
    let uid = null;
    let fm = null;
    let condini = null;
    for (const iterator of array) {
      const enco = this.tablaFinal.find((ele) => iterator[0] == ele.uid);
      if (uid == null) {
        fm = enco.fechafin_comp;
        uid = enco.uid;
      } else {
        if (fm < enco.fechafin_comp) {
          fm = enco.fechafin_comp;
          uid = enco.uid;
        }
      }
    }
    return {
      condini: JSON.stringify([uid, '', '']),
      fechaini: fm,
      fechafin: fm,
    };
  }

  async refCorrectFinal(referenciados) {
    let referencias = [];
    for (const iterator of referenciados) {
      const encontrado = await this.tablaFinal.find(
        (ele) => ele.uid == iterator[0]
      );
      let idgantt;
      if (encontrado) {
        idgantt = encontrado.idgantt_comp;
      }
      const ref =
        idgantt + iterator[1] + (iterator[2] ? iterator[3] + iterator[2] : '');
      referencias.push(ref);
    }
    return referencias.join(',');
  }

  async agregarAlPadre(index, uidagregar, tabla) {
    const encontrado = this[tabla].find((ele) => ele.uid == index);
    if (tabla == 'tablaFinal') {
      if (encontrado.duracion_xml === 0) {
        return;
      }
    } else {
      if (encontrado.duracion === 0) {
        return;
      }
    }
    const hijos = this[tabla][encontrado.ind].hijos_uid
      ? JSON.parse(this[tabla][encontrado.ind].hijos_uid)
      : [];
    let hijosArr = hijos;
    if (hijos) {
      if (!hijos.includes(uidagregar)) {
        hijosArr.push(uidagregar);
      }
    } else {
      hijosArr.push(uidagregar);
    }

    this[tabla][encontrado.ind].hijos_uid = hijosArr.length
      ? JSON.stringify(hijosArr)
      : '';
  }

  async actualizarEnlazados(fila) {
    try {
      if (!fila.hijos_uid) {
        return;
      } else {
        const hijos = JSON.parse(fila.hijos_uid);
        for await (const iterator of hijos) {
          const row = await this.tablaFinal.find((ele) => ele.uid == iterator);
          const condicionales = await this.condicionanteFila(
            JSON.parse(row.referenciados_xml),
            row.ind,
            'tablaFinal'
          );

          this.tablaFinal[row.ind].duracion_comp = condicionales.duracion;
          this.tablaFinal[row.ind].fechafin_comp = condicionales.fechafin;
          this.tablaFinal[row.ind].fechaini_comp = condicionales.fechaini;
          this.tablaFinal[row.ind].duraciontot_comp = condicionales.duraciontot;
          await this.actualizarEnlazados(row);
        }
      }
    } catch (e) {

      this.mostrar_carga_todo = false;
      SwalService.error(e);
    }
  }

  async condicionanteFila(referenciados, index, tabla = 'xmlTable') {
    let condini = null;
    let condfin = null;
    let fechafin = null;
    let duraciontot = null;
    let fechaini = null;
    let duracion = null;
    const keydur = tabla == 'tablaFinal' ? 'duracion_comp' : 'duracion';
    const keyini = tabla == 'tablaFinal' ? 'fechaini_comp' : 'fechaini';
    const keyfin = tabla == 'tablaFinal' ? 'fechafin_comp' : 'fechafin';

    if (referenciados.length) {
      let fi = null;
      let ff = null;
      for (const iterator of referenciados) {
        const response = await this.fechadeReferencia(iterator, tabla);
        if (response == 'Fecha Invalida') {
          return;
        }
        if (iterator[1] == 'CF' || iterator[1] == 'FF') {
          if (response > ff || !ff) {
            ff = response;
            condfin = iterator;
          }
        } else {
          if (response > fi || !fi) {
            fi = response;
            condini = iterator;
          }
        }
      }
      if (fi && ff) {
        if(fi > ff) {
          ff = null
          condfin = null
        } else {
          fi = null
          condini = null
        }
      }

      if (ff && fi) {
        if (fi > ff) {
          const response1 = await this.calcularFechaComplemento(
            this[tabla][index][keydur],
            fi,
            ''
          );
          fechafin = response1.fecha;
          duraciontot = response1.duraciontot;
        } else {
          fi = fi ? fi : fechaini;
          ff = ff ? ff : fechafin;
          const response2 = await this.calcularFechaComplemento('', fi, ff);
          duracion = response2.duracion;
          duraciontot = response2.duraciontot;
        }
      } else {
        let response3 = await this.calcularFechaComplemento(
          this[tabla][index][keydur],
          fi,
          ff
        );
        if (ff && !fi && response3.fecha < this.dataProyecto.fecha_inicio) {
          const response4 = await this.calcularFechaComplemento(
            this[tabla][index][keydur],
            '',
            ff
          );
          fechaini = response4.fecha;
          fechafin = ff;
          duracion = this[tabla][index][keydur];
          duraciontot = response4.duraciontot;
        } else {
          fechaini = !fi ? response3.fecha : fi;
          fechafin = !ff ? response3.fecha : ff;
          duraciontot = response3.duraciontot;
        }
      }
    }
    const obj = {
      condini: condini,
      condfin: condfin,
      fechaini: fechaini ? fechaini : this[tabla][index][keyini],
      fechafin: fechafin ? fechafin : this[tabla][index][keyfin],
      duracion: duracion ? duracion : this[tabla][index][keydur],
      duraciontot: duraciontot,
    };
    return obj;
  }

  async fechadeReferencia(referencia, tabla) {
    const tablaferiados = !this.fuenteFeriados
      ? this.noLaborables?.tablaferiados
      : this.listaFeriados;
    const arrayDiasNoLabEdit = !this.fuenteFeriados
      ? this.noLaborables?.arrayDiasNoLabEdit
      : this.listaNoLaborables;

    let fecha = null;
    const row = this[tabla].find((ele) => ele.uid == referencia[0]);
    if (referencia[1] == '' || referencia[1] == 'FC') {
      let fechac = tabla == 'tablaFinal' ? row.fechafin_comp : row.fechafin;
      if (fechac && fechac !== 'Fecha Invalida') {
        let fi;
        let existe = false;
        fi = moment(fechac).add(1, 'days').format('YYYY-MM-DD');
        do {
          const esFeriado = tablaferiados.find((ele) => ele.fecha == fi);
          const nombreDia = moment.weekdays(moment(fi).day());
          if (
            esFeriado ||
            arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
          ) {
            existe = true;
          } else {
            existe = false;
          }
          if (existe) {
            fi = moment(fi).add(1, 'days').format('YYYY-MM-DD');
          }
          if (fi == 'Fecha invalida') {
            existe = false;
          }
        } while (existe);
        fecha = fi;
      }
    } else if (referencia[1] == 'CC') {
      fecha = tabla == 'tablaFinal' ? row.fechaini_comp : row.fechaini;
    } else if (referencia[1] == 'CF') {
      fecha = tabla == 'tablaFinal' ? row.fechaini_comp : row.fechaini;
      let valido = false;
      let f = JSON.parse(JSON.stringify(fecha));
      while (!valido) {
        f = moment(f).subtract(1, 'days').format('YYYY-MM-DD');
        const nombreDia = moment.weekdays(moment(f).day());
        const existe = await tablaferiados.find((ele) => ele.fecha == f);
        if (!existe && !arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())) {
          valido = true;
        }
      }
      fecha = f;
    } else if (referencia[1] == 'FF') {
      fecha = tabla == 'tablaFinal' ? row.fechafin_comp : row.fechafin;
    }

    if (fecha) {
      if (referencia[2]) {
        const numero = parseInt(referencia[2]);
        const tipo = referencia[2].slice(numero.toString().length);
        let dias = 0;
        if (tipo == 'd' || tipo == 'D' || !tipo) {
          dias = numero;
        } else if (tipo == '%') {
          const dur = tabla == 'tablaFinal' ? row.duracion_comp : row.duracion;
          const cant = Math.ceil((dur * numero) / 100);
          dias = cant;
        } else {
        }
        if (referencia[3] == '-') {
          dias = dias + 1;
          fecha = (await this.calcularFechaComplemento(dias, null, fecha))
            .fecha;
        } else {
          dias = dias + 1;
          fecha = (await this.calcularFechaComplemento(dias, fecha, null))
            .fecha;
        }
      }
    }
    // if (fecha == 'Fecha Invalida' || !fecha ) {
    //   throw Error('missing data')
    // }
    return fecha;
  }

  async calcularFechaComplemento(duracion, fechaini, fechafin) {
    const tablaferiados = !this.fuenteFeriados
      ? this.noLaborables?.tablaferiados
      : this.listaFeriados;
    const arrayDiasNoLabEdit = !this.fuenteFeriados
      ? this.noLaborables?.arrayDiasNoLabEdit
      : this.listaNoLaborables;
    let diasTotales = null;
    let diasHabiles = duracion ? duracion : null;
    let fecha = null;
    if (!duracion && fechaini && fechafin) {
      if (fechafin > fechaini) {
        var finia = moment(fechaini);
        var f2 = moment(fechafin);
        var f1 = moment(fechaini);
        diasHabiles = 0;
        diasTotales = f2.diff(f1, 'days') + 1;
        while (
          moment(finia).format('YYYY-MM-DD') < moment(f2).format('YYYY-MM-DD')
        ) {
          fecha = moment(finia).add(1, 'days').format('YYYY-MM-DD');
          const nombreDia = moment.weekdays(moment(fecha).day());
          const existe = await tablaferiados.find(
            (ele) => moment(ele.fecha).format('YYYY-MM-DD') == fecha
          );
          if (
            !existe &&
            !arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
          ) {
            diasHabiles++;
          }
          finia = moment(fecha);
        }
        diasHabiles = diasHabiles + 1;
      } else {
        diasHabiles = 1;
        diasTotales = 1;
      }
    } else if (duracion) {
      if (fechaini && !fechafin) {
        var finia = moment(fechaini);
        let duracionPendiente = duracion == 1 ? 1 : Number(duracion) - 1;
        if (duracion == 1) {
          fecha = fechaini;
        } else {
          while (duracionPendiente > 0) {
            fecha = moment(finia).add(1, 'days').format('YYYY-MM-DD');
            const nombreDia = moment.weekdays(moment(fecha).day());
            const existe = await tablaferiados.find(
              (ele) => ele.fecha == fecha
            );
            if (
              !existe &&
              !arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
            ) {
              duracionPendiente--;
            }
            finia = moment(fecha);
          }
        }
        var fini = moment(fechaini);
        var ffin = moment(fecha);
        diasTotales = ffin.diff(fini, 'days') + 1;
      } else {
        if (duracion == 1) {
          diasHabiles = 1;
          diasTotales = 1;
          fecha = fechafin;
        } else {
          var f1 = moment(fechafin);
          let duracionPendiente = Number(duracion) - 1;
          while (duracionPendiente > 0) {
            fecha = moment(f1).subtract(1, 'days').format('YYYY-MM-DD');
            const nombreDia = moment.weekdays(moment(fecha).day());
            const existe = await tablaferiados.find(
              (ele) => ele.fecha == fecha
            );
            if (
              !existe &&
              !arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
            ) {
              duracionPendiente--;
            }
            f1 = moment(fecha);
          }
          var ffin = moment(fechafin);
          var fini = moment(fecha);
          diasTotales = ffin.diff(fini, 'days') + 1;
        }
      }
    } else if (duracion < 0 && fechaini) {
      var f1 = moment(fechaini);
      let duracionPendiente = Number(duracion) - 1;
      while (duracionPendiente > 0) {
        fecha = moment(f1).subtract(1, 'days').format('YYYY-MM-DD');
        const nombreDia = moment.weekdays(moment(fecha).day());
        const existe = await tablaferiados.find((ele) => ele.fecha == fecha);
        if (!existe && !arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())) {
          duracionPendiente--;
        }
        f1 = moment(fecha);
      }
      var ffin = moment(fechaini);
      var fini = moment(fecha);
      diasTotales = ffin.diff(fini, 'days') + 1;
    }
    const obj = {
      duracion: diasHabiles,
      duraciontot: diasTotales,
      fecha: fecha,
    };
    return obj;
  }

  async agregarTablaCompatibilizada(partidaExistente, partidaRemplazante) {
    const obj = {
      idgantt: partidaRemplazante.idgantt,
      descripcion: partidaExistente.descripcion,
      item: partidaExistente.item,
      condfin: partidaRemplazante.condfin,
      condini: partidaRemplazante.condini,
      duracion: partidaRemplazante.duracion,
      fechafin: partidaRemplazante.fechafin,
      fechaini: partidaRemplazante.fechaini,
      id_proyecto: this.idProyecto,
      id_usuario: this.idUsuario,
      hijos: '',
      hijos_uid: '',
      indice: partidaExistente.indice,
      referencia: partidaExistente.unidad
        ? partidaRemplazante.referencia
        : null,
      referenciados: '',
      existePresupuesto: partidaRemplazante.existePresupuesto
        ? partidaRemplazante.existePresupuesto
        : false,
      idMsProject: partidaRemplazante.idMsProject,
      unidad: partidaExistente.unidad,
      referenciaXML: partidaExistente.unidad
        ? partidaRemplazante.referenciaXML
        : null,
      uid: partidaExistente.uid,
      restriccion: null,
      restriccion2: null,
      cuadrilla: partidaExistente.cuadrilla,
      indice_ref_hito: null,
      metrado: partidaExistente.metrado,
      parcial: partidaExistente.parcial,
      rendimiento: partidaExistente.rendimiento,
      tiempoUnitario: partidaExistente.tiempoUnitario,
    };
    this.xmlTable[partidaExistente.ind] = obj;
  }

  async agregarNoExistente(index) {
    const partidaPresupuesto = this.dataPrincipal[index];
    const obj = {
      idgantt: '',
      descripcion: partidaPresupuesto.descripcion,
      item: partidaPresupuesto.item,
      condfin: '',
      condini: '',
      duracion: '',
      fechafin: '',
      fechaini: '',
      id_proyecto: this.idProyecto,
      id_usuario: this.idUsuario,
      hijos: '',
      hijos_uid: '',
      ind: null,
      ind2: null,
      nivel: partidaPresupuesto.nivel,
      indice: partidaPresupuesto.indice,
      referencia: '',
      referenciados: '',
      existePresupuesto: false,
      idMsProject: null,
      unidad: partidaPresupuesto.unidad,
      referenciaXML: '',
      uid: partidaPresupuesto.uid,
      restriccion: null,
      restriccion2: null,
      cuadrilla: partidaPresupuesto.cuadrilla,
      indice_ref_hito: null,
      metrado: partidaPresupuesto.metrado,
      parcial: partidaPresupuesto.parcial,
      rendimiento: partidaPresupuesto.rendimiento,
      tiempoUnitario: partidaPresupuesto.tiempoUnitario,
    };
    return obj;
  }

  async buscarEnTablaPresupuesto(partida) {
    let partidasValidas = [];
    let partidaParecidas = [];
    let array1 = partida.item ? partida.item.split('.') : [];
    array1 = array1.map((ele) => {
      return parseInt(ele);
    });
    array1 = array1.join('.');
    const desConcat = partida.descripcion.replace(/ /g, '');
    await this.tablaAuxiliar.map((ele) => {
      let array2 = ele.item ? ele.item.split('.') : [];
      array2 = array2.map((ele) => {
        return parseInt(ele);
      });
      array2 = array2.join('.');
      const desConcat2 = ele.descripcion.replace(/ /g, '');
      if (array2 == array1) {
        const porcentaje = stringSimilarity(desConcat, desConcat2);
        if (porcentaje > 0.89) {
          ele.porcentaje = 1;
          partidasValidas.push(ele);
        } else if (porcentaje < 0.9 && porcentaje > 0.68) {
          partidaParecidas.push(ele);
        } else {
        }
      }
    });
    const obj = {
      partidasValidas: partidasValidas,
      partidaParecidas: partidaParecidas,
    };

    return obj.partidaParecidas.length || obj.partidasValidas.length
      ? obj
      : null;
  }

  async agregarHitos() {
    let j = 0;
    for await (const ele of this.hitosXML) {
      const obj = await this.referenciaStructura(
        ele.PredecessorLink,
        this.xmlFormat
      );
      let referenciaCorrecta;
      if (typeof ele.PredecessorLink == 'object') {
        if (ele.PredecessorLink.length) {
          let predecesores = [];
          await ele.PredecessorLink.map((ele) =>
            predecesores.push(ele.PredecessorUID._text)
          );
          const stringRef = predecesores.join(',');
          referenciaCorrecta = await this.referenciaExistentesCompatibilizada(
            stringRef
          );
        } else {
          referenciaCorrecta = await this.referenciaExistentesCompatibilizada(
            ele.PredecessorLink.PredecessorUID._text
          );
        }
      }
      const minutosxdia = this.jsonxml.Project.MinutesPerDay._text;
      const duracion = await this.duracion(
        ele.ManualDuration?._text
          ? ele.ManualDuration?._text
          : ele.Duration._text,
        ele.LevelingDelayFormat._text,
        minutosxdia
      );
      const row = await this.buscarRowReferencia(ele.OutlineNumber._text);
      const hito = {
        idgantt: ele.ID._text,
        descripcion: ele.Name?._text,
        item: '',
        condfin: '',
        condini: '',
        duracion: 0,
        fechafin: ele.EarlyFinish?._text
          ? moment(ele.EarlyFinish._text).format('YYYY-MM-DD')
          : moment(ele.Finish._text).format('YYYY-MM-DD'),
        fechaini: ele.EarlyStart?._text
          ? moment(ele.EarlyStart._text).format('YYYY-MM-DD')
          : moment(ele.Start._text).format('YYYY-MM-DD'),
        id_proyecto: this.idProyecto,
        id_usuario: this.idUsuario,
        hijos: '',
        hijos_uid: '',
        indice: null,
        indice_refer: row.uid ? row.uid : null,
        referencia: obj.referencia,
        referenciados: '',
        existePresupuesto: false,
        idMsProject: Number(ele.UID._text),
        unidad: ele.Rollup._text == '0' ? true : false,
        referenciaXML: obj.referenciaXML,
        uid: null,
        restriccion: null,
        restriccion2: null,
      };

      if (row.unidad) {
        this.xmlTable.splice(Number(row.ind) + 1, 0, hito);
      } else {
        const splitItem = row.item.split('.');
        const sinUltimo = splitItem.splice(splitItem.length - 1);
        const ultimoFin = (Number(sinUltimo[0]) + 1).toString();
        let string;
        if (splitItem.length) {
          string = splitItem.join('.') + '.' + ultimoFin;
        } else {
          string = ultimoFin;
        }
        const encontrado = this.xmlTable.find((ele) => ele.item == string);
        if (!encontrado) {
          this.xmlTable.splice(this.xmlTable.length, 0, hito);
        } else {
          this.xmlTable.splice(Number(encontrado.ind), 0, hito);
        }
      }

      for (let i = row.ind; i < this.xmlTable.length; i++) {
        this.xmlTable[i].ind = i;
        this.xmlTable[i].ind2 = i;
      }
      j++;
    }
  }

  async referenciasCorrectas() {
    for await (let partida of this.xmlTable) {
      partida.refCorregida = false
      if (partida.referenciaXML) {
        const referencia = await this.referenciaExistentes(
          partida.referenciaXML,
          true
        );
        partida.referencia = referencia.referencia;
        partida.referenciados = referencia.referenciados;
        partida.refCorregida = referencia.referenciaCorregida
      }
    }
  }

  async referenciaExistentes(referencia, deXml) {
    let stringRef, stringReferenciados;
    const array = JSON.parse(referencia);
    let arrayReferenciados = [];
    let arrayreferencia = [];
    let referenciaCorregida = 0
    for await (let ref of array) {
      // console.log('ref', ref)
      let encontrado = await this.existentesProg.find(
        (ele) => ele.idMsProject == ref[0]
      );
      if (encontrado && !encontrado?.unidad) {
        referenciaCorregida = 1
        encontrado = null
      }
      
      if (encontrado) {
        const partCompat = await this.xmlTable.find(
          (ele) => ele.uid == encontrado.uid
        );
        if (partCompat) {
          let string = partCompat.idgantt + ref[1];
          const dias = parseInt(ref[2]);
          let diasAdd = '';
          if (ref[2]) {
            ref[2] = ref[2].toUpperCase();
            string = string + (ref[2] ? ref[3] + ref[2] : '');
          }
          arrayreferencia.push(string);
          arrayReferenciados.push([partCompat.uid, ref[1], ref[2], ref[3]]);
        }
      }
      stringRef = arrayreferencia.length ? arrayreferencia.join(',') : '';
      stringReferenciados = arrayReferenciados.length
        ? JSON.stringify(arrayReferenciados)
        : '';
    }
    return { referencia: stringRef, referenciados: stringReferenciados , referenciaCorregida:referenciaCorregida};
  }

  closeModal(result: any = null) {
    this.modal.close(result);
  }

  async buscarRowReferencia(item) {
    let encontrado = null;
    let stringItem = item;
    while (!encontrado) {
      const splitItem = stringItem.split('.');
      const sinUltimo = splitItem.splice(splitItem.length - 1);
      const ultimoFin = (Number(sinUltimo[0]) - 1).toString();
      let string;
      if (splitItem.length) {
        string = splitItem.join('.') + '.' + ultimoFin;
      } else {
        string = ultimoFin;
      }
      encontrado = this.xmlTable.find((ele) => ele.item == string);
      stringItem = string;
    }
    return encontrado;
  }

  async referenciaExistentesCompatibilizada(string) {
    const spliteado = string.split(',');
    let referencias = [];
    await spliteado.map((ele) => {
      const separadosPlus = ele.split('+');
      const idgantt = parseInt(ele);
      const indiceUbicado = separadosPlus[0].trim().indexOf(idgantt.toString());
      const tipoAevaluar = separadosPlus[0]
        .trim()
        .substring(
          indiceUbicado + idgantt.toString().length,
          separadosPlus[0].trim().length
        );
      let diasAdicionles = '';
      if (separadosPlus[1]) {
        const numero = parseInt(separadosPlus[1]);
        const indice = separadosPlus[1].trim().indexOf(numero.toString());
        const tipo = separadosPlus[1]
          .trim()
          .substring(
            indice + numero.toString().length,
            separadosPlus[1].trim().length
          );
        if (tipo == 'd' || tipo == '') {
          diasAdicionles = numero.toString();
        }
      }
      const existe = this.xmlTable.find((ele) => idgantt == ele.idMsProject);
      if (existe) {
        let string = existe.idgantt + tipoAevaluar;
        let referenciado = [existe.idMsProject, tipoAevaluar, diasAdicionles];
        if (diasAdicionles) {
          string = string + '+' + diasAdicionles;
        }
        referencias.push(string);
      }
    });
    const referenciaString = referencias.length ? referencias.join(',') : '';
    return referenciaString;
  }

  async actualizarDatosProyecto(fechas) {
    const modificarProyecto = {
      id_proyecto: this.idProyecto,
      cui: this.dataProyecto.cui ? this.dataProyecto.cui : '',
      descripcion: this.dataProyecto.descripcion,
      id_clasificacion: this.dataProyecto.id_clasificacion,
      modalidad: this.dataProyecto.modalidad,
      id_grupo: this.dataProyecto.id_grupo,
      moneda: this.dataProyecto.moneda,
      estado: this.dataProyecto.estado,
      cod_pais: this.dataProyecto.cod_pais,
      id_localidad: this.dataProyecto.id_localidad,
      direccion: this.dataProyecto.direccion,
      fecha_elaboracion: moment(this.dataProyecto.fecha_elaboracion).format(
        'YYYY-MM-DD'
      ),
      plazo: fechas.plazo,
      fecha_inicio: fechas.fechaIni,
      fecha_culmina: fechas.fechaFin,
      id_usuario: this.idUsuario,
    };
    await this.principalService.modificarProyecto(modificarProyecto);
  }

  async actualizarTitulos2(noConsiderar = false) {
    let titulos = [];
    await this.tablaFinal.map((ele) => {
      if (!ele.unidad && ele.duracion_comp !== 0) {
        titulos.push(ele.ind);
      }
    });
    titulos.reverse();
    for (const iterator of titulos) {
      await this.updatetitulo2(iterator, noConsiderar);
    }
  }

  async updatetitulo2(indice, noConsiderar) {
    const arrayItem = this.tablaFinal[indice].item.split('.');
    const encontrados = await this.tablaFinal.filter((ele) => {
      const arrayItem2 = ele.item.split('.');
      arrayItem2.pop();
      if (arrayItem.join('.') == arrayItem2.join('.')) {
        return ele;
      }
    });
    let mayorFF = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
    let menorFI = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
    if (encontrados.length) {
      encontrados.map((ele, index) => {
        if (index == 0) {
          menorFI = ele.fechaini_comp;
        }
        if (ele.fechaini_comp < menorFI) {
          menorFI = ele.fechaini_comp;
        }
        if (ele.fechafin_comp > mayorFF) {
          mayorFF = ele.fechafin_comp;
        }
      });
    } else {
    }
    this.tablaFinal[indice].fechaini_comp = JSON.parse(JSON.stringify(menorFI));
    this.tablaFinal[indice].fechafin_comp = JSON.parse(JSON.stringify(mayorFF));
    const response = await this.calcularFechaComplemento(
      '',
      this.tablaFinal[indice].fechaini_comp,
      this.tablaFinal[indice].fechafin_comp
    );
    this.tablaFinal[indice].duracion_comp = Number(response.duracion);
    this.tablaFinal[indice].duraciontot_comp = Number(response.duraciontot);
  }

  async listarIndicesElimPresupuesto() {
    try {
      let array = [];
      let arrayUids = [];
      const obj = {
        id_proyecto: this.idProyecto,
      };
      const response = await this.principalService.listarIndiceEliminados(obj);
      if (response.indelipres1) {
        let spliteado = response.indelipres1.split(',');
        array = spliteado.map(Number);

        for (const indice of array) {
          const encontrado = this.dataPrincipal.find(
            (ele) => Number(ele.indice) == indice
          );
          if (encontrado) {
            arrayUids.push(encontrado.uid);
          }
        }
      }
      return arrayUids;
    } catch (e) {
      SwalService.error(e);
      console.log(e);
    }
  }

  async guardarProgramacion() {
    try {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se guardara y reemplazara ' +
          (this.fuenteFeriados ? '(incluido los feriados del sistema)' : '') +
          ' toda informacion almacenada'
      );
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        let hitos = [];
        let partidas: filaProgramacion[] = [];
        let hitosEliminar = [];
        await this.hitosProgramacion.map((ele) => hitosEliminar.push(ele.uid));
        let i = 0;
        for (const iterator of this.tablaFinal) {
          if (iterator.duracion_comp !== 0) {
            const fila = await this.formatoProgra(iterator);
            partidas.push(fila);
          } else {
            const hit = await this.formatoHito(iterator, i);
            hitos.push(hit);
          }
          i++;
        }
        const arrayEliminar = await this.listarIndicesElimPresupuesto();
        let partidasFiltradas = []
        if (arrayEliminar.length) {
          for (const element of partidas) {
            const partida = await this.actualizarPrograInd(arrayEliminar, element);
            if (partida) {
              partidasFiltradas.push(partida)
            }
          }
          partidas = partidasFiltradas
        }
        // console.table(partidas, ['uid','item','descripcion','idgantt','duracion','fechaini','fechafin','referencia','referenciados','condini','condfin','hijos_uid']);
        const tabla1 = JSON.stringify(partidas);
        const body = JSON.stringify({
          id_usuario: this.idUsuario,
          datos1: tabla1,
          id_proyecto: this.idProyecto
        });
        const response = await this.principalService.guardarDatosProgramacion(
          body
        );
        // console.log('response', response)
        if (response.id == '1') {
          const tablaA = JSON.stringify(hitos);
          const tabla2 = JSON.stringify([]);
          const tabla3 = JSON.stringify(hitosEliminar);
          const body2 = JSON.stringify({
            id_proyecto: this.idProyecto,
            id_usuario: this.idUsuario,
            datos1: tablaA,
            datos2: tabla2,
            datos3: tabla3,
          });
          const response2 = await this.principalService.CambiosProyHitos(body2);
          if (response2.id == '1') {
            if (this.fuenteFeriados) {
              await this.guardarFeriados();
              await this.guardarNoLaborables();
            }
            this.mostrar_carga_todo = false;
            this.toaster.success('Se guardo correctamente', 'Éxito', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            });
            this.closeModal('ok');
          } else {
            this.mostrar_carga_todo = false;
            this.toaster.error('No se pudo guardar', 'Error', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            });
          }
        } else {
          this.toaster.error('No se pudo guardar', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
          this.mostrar_carga_todo = false;
        }
      }
    } catch (e) {
      console.log(e);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  async actualizarPrograInd(arrIndices, row) {
    // let partidas = [];
    // for (const row of this.dataPrincipal) {
    if (row.unidad) {
      if (!row.indice_ref_hito) {
        if (arrIndices.includes(row.uid)) {
          row = null
        } else {
          // let editado = row.filaEditada;
          let limpiar = false;
          if (row.condini) {
            var condini = JSON.parse(row.condini);
            if (arrIndices.includes(condini[0])) {
              row.condini = '';
              limpiar = true;
              
            }
          }
          if (row.condfin) {
            var condfin = JSON.parse(row.condfin);
            if (arrIndices.includes(condfin[0])) {
              row.condfin = '';
              limpiar = true;
              
            }
          }
          if (row.hijos_uid) {
            var hijos_uid = JSON.parse(row.hijos_uid);
            let nuevo_hijos = [];
            for (const hijo of hijos_uid) {
              if (!arrIndices.includes(hijo)) {
                nuevo_hijos.push(hijo);
              } else {
                
              }
            }
            row.hijos_uid = !nuevo_hijos.length
              ? ''
              : JSON.stringify(nuevo_hijos);
          }
          if (limpiar) {
            row.referenciados = '';
            row.referencia = '';
          } else {
            if (row.referenciados) {
              var referenciados = JSON.parse(row.referenciados);
              let indices = [];
              let i = 0;
              for (const ref of referenciados) {
                if (arrIndices.includes(ref[0])) {
                  indices.unshift(i);
                }
                i++;
              }
              if (indices.length) {
                let referencia = row.referencia.split(',');
                for (const indic of indices) {
                  referenciados.splice(indic, 1);
                  referencia.splice(indic, 1);
                  
                }
                row.referencia = referencia.join(',');
                if (!referenciados.length) {
                  row.referenciados = '';
                } else {
                  row.referenciados = JSON.stringify(referenciados);
                }
              }
            }
          }

          // if (editado) {
            if (row.hijos == null) {
              row.hijos = '';
            }
            if (row.hijos_uid == null) {
              row.hijos_uid = '';
            }
            if (row.indice_ref_hito == null) {
              row.indice_ref_hito = '';
            }
          //   partidas.push(row);
          // }
        }
      } else {
        var indice_ref_hito = row.indice_ref_hito;
        if (arrIndices.includes(indice_ref_hito)) {
          // editado = true;
         row  = null
        }
      }
    }
    // }
    return row;
  }

  async formatoProgra(fila) {
    const filaProgra: filaProgramacion = {
      condfin: fila.condfin ? fila.condfin : '',
      condini: fila.condini ? fila.condini : '',
      editarDescrip: false,
      editarDur: false,
      editarFI: false,
      editarPred: false,
      editarRest: false,
      hijos: '',
      ind: fila.ind,
      cuadrilla: fila.cuadrilla,
      diasHabilesValido: true,
      duracion: fila.duracion_comp,
      duracionreq: null,
      duraciontot: null,
      fechafin: fila.fechafin_comp,
      fechaini: fila.fechaini_comp,
      filaEditada: false,
      hijos_uid: fila.hijos_uid,
      idgantt: fila.idgantt_comp,
      ind2: null,
      indice: fila.indice,
      indice_ref_hito: null,
      metrado: fila.metrado,
      nroclick: null,
      predecesor: null,
      referencia: fila.referencia_comp ? fila.referencia_comp : '',
      referenciados: fila.referenciados_comp,
      rendimiento: fila.rendimiento,
      restriccion: '',
      restriccion2: '',
      tiempoUnitario: fila.tiempoUnitario,
      uid: fila.uid,
      cuadrillaEQ: null,
      cuadrillaEQ1: null,
      cuadrillaMO: null,
      cuadrillaMO1: null,
      descripcion: fila.descripcion,
      detalle_partida: null,
      editarCua: false,
      editarFF: false,
      fechafinBD: false,
      fechainiBD: false,
      icomost: null,
      id_proyecto: this.idProyecto,
      id_unidad: null,
      id_usuario: this.idUsuario,
      item: fila.item,
      mostrar: 1,
      nivel: fila.nivel ? fila.nivel : null,
      parcial: fila.parcial,
      unidad: fila.unidad,
    };
    if (!filaProgra.indice_ref_hito && filaProgra.unidad) {
      const cuadrillaNecesaria =
        filaProgra.tiempoUnitario /
        (filaProgra.duracion ? filaProgra.duracion : 1);
      filaProgra.cuadrilla = Number(
        this.formsService.redondeo(cuadrillaNecesaria, 5)
      );
    } else {
      if (filaProgra.indice_ref_hito) {
        filaProgra.cuadrilla = null;
        filaProgra.duracion = 0;
      }
    }

    return filaProgra;
  }

  async formatoHito(iterator, indexAnt) {
    const uid = this.tablaFinal[indexAnt - 1].uid;
    const hito = {
      id_proyecto: this.idProyecto,
      descripcion: iterator.descripcion.trim().toUpperCase(),
      fechaini: iterator.fechaini_comp,
      fechafin: iterator.fechafin_comp,
      id_usuario: this.idUsuario,
      referencias: iterator.referencia_comp,
      referenciados: iterator.referenciados_comp,
      indice_refer: uid,
      uid: iterator.uid,
    };
    return hito;
  }

  async guardarFeriados() {
    const datos1 = JSON.stringify(this.listaFeriados);
    const eliminarIndice = [];
    this.noLaborables?.tablaferiados.map((ele) => eliminarIndice.push(ele.nro));
    const datos2 = JSON.stringify(eliminarIndice);
    const obj = JSON.stringify({
      id_proyecto: this.idProyecto,
      datos1: datos1,
      datos2: datos2,
    });
    const response = await this.principalService.guardaCambiosTablaFeriados(
      obj
    );
  }

  async guardarNoLaborables() {
    const stringArray = this.listaNoLaborables.join('|');
    const input = {
      id_proyecto: this.idProyecto,
      inicioSemana: this.aspectosdias[0].inicioSemana,
      nolabo1: stringArray,
      nolabo2: 'color_1|color_1|color_1',
      horaIngreso: this.aspectosdias[0].horaIngreso,
      horaSalida: this.aspectosdias[0].horaSalida,
      descansoIng: this.aspectosdias[0].descansoIng,
      descansoSal: this.aspectosdias[0].descansoSal,
    };
    let res = await this.principalService.GuardarAspectosDiasProy(input);
  }
}
