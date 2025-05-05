import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalNoLaborablesComponent } from '../programacion-obra/modal-no-laborables/modal-no-laborables.component';
import { ReportesComponent } from '../../reportes/reportes.component';

@Component({
  selector: 'app-tiempos-programacion',
  templateUrl: './tiempos-programacion.component.html',
  styleUrls: ['./tiempos-programacion.component.scss'],
})
export class TiemposProgramacionComponent implements OnInit {
  @Input() idProyecto = null;
  @ViewChild('automcompletarSelect')
  ngSelectAutomcompletarRol: NgSelectComponent;

  colores: any;
  decima: any;
  tipoProy = '';
  existetemp: boolean = false;
  tempPresu: boolean;
  solover = false;
  nombreDiaIniProy: string = null;
  simbolo
  @Input() set tabproyecto(value: any) {
    this.idProyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    this.simbolo=datosrec.value.simbolo
  }
  mostrar_carga_todo: boolean = false;
  buscando: boolean = false;
  habilitarEditarTab1 = false;
  dataPrincipal = [];
  progTiempNoVAlidos: boolean = false;
  active = 1;
  dataProyecto = null;
  FFRestriccion: string = null;
  editadoFeriados = false;
  editadoJornada = false;
  editadoColores = false;
  hoy = new Date();
  tablaferiados = [];
  arrayDiasNoLabEdit = [];
  horasdescanso: any;
  horaslabo: any;
  id_usuario: any;
  aspectos: any;
  dec_metrado = 2;
  mask_metrado = '0.2';
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  aspectosdias: any;
  prograNoActua = false;
  arrayEliminadosFeriados = [];
  titulosModificados = [];
  rowSeleccionado: any = null;
  tablaDetallePartida = [];
  buscando5 = false;
  tablaDesemDesactua = false;
  hitosEliminados = [];
  plazoHabil: number = 0;
  diassemana = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  tabla1 = [
    {
      desc: 'Hora Ingreso',
      lun: '',
      mar: '',
      mie: '',
      jue: '',
      vie: '',
      sab: '',
      dom: '',
    },
    {
      desc: 'Hora Salida',
      lun: '',
      mar: '',
      mie: '',
      jue: '',
      vie: '',
      sab: '',
      dom: '',
    },
  ];
  tabla2 = [
    {
      desc: 'Hora de Salida Descanso',
      lun: '',
      mar: '',
      mie: '',
      jue: '',
      vie: '',
      sab: '',
      dom: '',
    },
    {
      desc: 'Hora de Ingreso Descanso',
      lun: '',
      mar: '',
      mie: '',
      jue: '',
      vie: '',
      sab: '',
      dom: '',
    },
  ];
  noLaborables = [];
  uidsOrdenados: any[] = [];

  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  dec_cant = 4;
  mask_cant = '0.4';
  Diasnolav = new UntypedFormGroup({
    Inicio: new UntypedFormControl(''),
    Nolab1: new UntypedFormControl(''),
    Nolab2: new UntypedFormControl(''),
    colorNoLabo: new UntypedFormControl('#ccc3a980'),
    colorFeriado: new UntypedFormControl('#ccc3a980'),
    colorActual: new UntypedFormControl('#ccc3a980'),
  });
  coloresProgra = [
    { nombre: 'color_1', id: '#ccc3a980' },
    { nombre: 'color_2', id: '#c674d180' },
    { nombre: 'color_3', id: '#95B9DD80' },
    { nombre: 'color_4', id: '#ef616180' },
    { nombre: 'color_5', id: '#86e54180' },
    { nombre: 'color_6', id: '#eea02680' },
  ];
  moneda = 'S/';

  get inicio(): UntypedFormControl {
    return this.Diasnolav.get('Inicio') as UntypedFormControl;
  }
  get nolab1(): UntypedFormControl {
    return this.Diasnolav.get('Nolab1') as UntypedFormControl;
  }
  get nolab2(): UntypedFormControl {
    return this.Diasnolav.get('Nolab2') as UntypedFormControl;
  }
  get colorNoLabo(): UntypedFormControl {
    return this.Diasnolav.get('colorNoLabo') as UntypedFormControl;
  }
  get colorFeriado(): UntypedFormControl {
    return this.Diasnolav.get('colorFeriado') as UntypedFormControl;
  }
  get colorActual(): UntypedFormControl {
    return this.Diasnolav.get('colorActual') as UntypedFormControl;
  }

  startTimer:any;//temporales
  running=false;//temporales
  tiempo=0;//temporales
  bloqtemp=false;//temporales
  timer2:any;//temporales
  initim2=false;//temporales
  worker: Worker;//temporales
  token:any;//temporales

  constructor(
    private toaster: ToastrService,
    public formsService: FormsService,
    private presuservice: PresupuestosService,
    private _EncriptadorService: EncriptadorService,
    private principalService: PrincipalService,
    private modalService: NgbModal,
    private encriptadorService: EncriptadorService
  ) {
    if (typeof Worker !== 'undefined') {//temporales
      this.worker = new Worker(new URL('src/app/workers/work1.worker', import.meta.url), { type: 'module' });
    }//temporales
  }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true;
      this.token=await this.encriptadorService.recuperarlocalstory('token');//temporales

      const tempPresu = await this.ListarPresupuestoTemp();
      if (tempPresu) {
        this.tempPresu = true;
        this.mostrar_carga_todo = false;
        SwalService.warning(
          'Error',
          'Cambios no guardados en Edicion de presupuesto. Guarde o descarte los cambios en la vista edicion de presupuesto'
        );
        return;
      } else {
        this.tempPresu = false;
      }
      this.pintar();
      await this.recuperarDatosProyecto(this.idProyecto);
      if (!this.dataProyecto.fecha_culmina) {
        this.mostrar_carga_todo = false;
        SwalService.warning(
          'Error',
          'Proyecto sin fecha culminacion registrada.'
        );
        return;
      }
      await this.cargarDatos();
      await this.listaFeriados();
      await this.permisosUsuario();
      await this.listarTablaPrograTiempos(true);
      this.inicio.disable();
      this.colorActual.disable();
      this.colorFeriado.disable();
      this.colorNoLabo.disable();
      this.mostrar_carga_todo = false;
      this.colorNoLabo.valueChanges.subscribe((ele) => {
        this.editadoColores = true;
      });
      this.colorFeriado.valueChanges.subscribe((ele) => {
        this.editadoColores = true;
      });
      this.colorActual.valueChanges.subscribe((ele) => {
        this.editadoColores = true;
      });
    } catch (error) {
      SwalService.error();
      console.log(error);
    }
    this.calcularHorasPorDia()
  }

  async permisosUsuario() {
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
    });
    if (datoaccs.length) {
      if (datoaccs[0]?.progra == 0) {
        this.solover = true;
      }
    }
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async ListarPresupuestoTemp() {
    this.id_usuario = this._EncriptadorService.recuperarlocalstory('idusuario');
    const obj = { id_proyecto: this.idProyecto, id_usuario: '' };
    const response = await this.presuservice.ExistePresuTemp(obj);
    return response.length ? true : false;
  }

  async datosComplementarios() {
    let decimales = this.decima;
    if (decimales?.toString().includes('|')) {
      let arrdec = decimales.split('|');
      this.dec_metrado = arrdec[0];
      this.mask_metrado = '0.' + arrdec[0];
      this.dec_precio = arrdec[1];
      this.mask_precio = '0.' + arrdec[1];
      this.dec_parcial = arrdec[2];
      this.mask_parcial = '0.' + arrdec[2];
      // this.dec_cant=arrdec[3];
      // this.mask_cant='0.'+arrdec[3];
    }
  }

  pintar() {
    this.id_usuario = this._EncriptadorService.recuperarlocalstory('idusuario');
    this.aspectos = JSON.parse(this.colores);
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }

  async verificarDAtosNecesarios(event) {
    if (event == undefined) {
      return;
    }
    if (
      this.habilitarEditarTab1 ||
      !this.dataPrincipal.length ||
      (this.progTiempNoVAlidos && event.nextId !== 1) ||
      this.tempPresu
    ) {
      let msj = '';
      if (this.tempPresu) {
        msj = 'Edición de presupuesto con datos no guardados';
      } else {
        if (!this.dataPrincipal.length) {
          msj = 'Tabla presupuesto vacia';
        } else if (this.habilitarEditarTab1) {
          msj = 'Datos generales sin guardar';
        } else if (this.progTiempNoVAlidos) {
          msj = 'Filas con dias habiles no validos';
        }
      }
      this.toaster.error(msj, 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
    }
  }

  async recuperarDatosProyecto(idProyecto) {
    const inputProyecto = {
      id_proyecto: idProyecto,
    };
    this.dataProyecto = await this.principalService.recuperarDatosProyecto(
      inputProyecto
    );
    const objeto = {
      id_proyecto: this.idProyecto,
      duracion: this.dataProyecto.plazo,
      fechaini: moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD'),
      fechafin: '',
      posterior: 0,
    };
    this.nombreDiaIniProy = moment(this.dataProyecto.fecha_inicio).format('dddd').toUpperCase();
    const response = await this.principalService.fechaDespuesDuracion(objeto);
    this.FFRestriccion = response.fecha;
    // this.moneda = this.dataProyecto.moneda.toString() == '0' ? 'S/' : '$';
    this.moneda = this.simbolo?this.simbolo:'S/'
  }

  async cargarDatos() {
    let resulta = await this.principalService.ListarAspectosDiasProy({
      id_proyecto: this.idProyecto,
    });
    if (resulta.length > 0) {
      this.aspectosdias = resulta[0];
      for (const iterator of resulta[1]) {
        iterator.fecha = moment(iterator.fecha).format('YYYY-MM-DD');
      }
      this.tablaferiados = resulta[1];
      this.inicio.setValue(
        this.aspectosdias[0]?.inicioSemana != null
          ? this.aspectosdias[0].inicioSemana
          : ''
      );
      this.nolab1.setValue(
        this.aspectosdias[0]?.nolabo1 != null
          ? this.aspectosdias[0].nolabo1
          : ''
      );
      this.arrayDiasNoLabEdit =
        this.nolab1.value == '' ? [] : this.nolab1.value.split('|');
      if (!this.aspectosdias[0]?.nolabo2) {
        this.colorNoLabo.setValue('#ccc3a980');
        this.colorActual.setValue('#ccc3a980');
        this.colorFeriado.setValue('#ccc3a980');
      } else {
        const arrayColProgra = this.aspectosdias[0]?.nolabo2.split('|');
        let colornolabo = '#ccc3a980';
        let coloractual = '#ccc3a980';
        let colorferiado = '#ccc3a980';
        if (arrayColProgra[0]) {
          const encontrado = this.coloresProgra.find(
            (ele) => ele.nombre == arrayColProgra[0]
          );
          colornolabo = encontrado ? encontrado.id : '#ccc3a980';
        }
        if (arrayColProgra[1]) {
          const encontrado = this.coloresProgra.find(
            (ele) => ele.nombre == arrayColProgra[1]
          );
          colorferiado = encontrado ? encontrado.id : '#ccc3a980';
        }
        if (arrayColProgra[2]) {
          const encontrado = this.coloresProgra.find(
            (ele) => ele.nombre == arrayColProgra[2]
          );
          coloractual = encontrado ? encontrado.id : '#ccc3a980';
        }

        this.colorNoLabo.setValue(colornolabo);
        this.colorActual.setValue(coloractual);
        this.colorFeriado.setValue(colorferiado);
      }
      this.nolab2.setValue(
        this.aspectosdias[0]?.nolabo2 ? this.aspectosdias[0].nolabo2 : ''
      );
      let horasing =
        this.aspectosdias[0]?.horaIngreso != null
          ? this.aspectosdias[0].horaIngreso.split('|')
          : [];
      let horassal =
        this.aspectosdias[0]?.horaSalida != null
          ? this.aspectosdias[0].horaSalida.split('|')
          : [];
      let descing =
        this.aspectosdias[0]?.descansoIng != null
          ? this.aspectosdias[0].descansoIng.split('|')
          : [];
      let descsal =
        this.aspectosdias[0]?.descansoSal != null
          ? this.aspectosdias[0].descansoSal.split('|')
          : [];
      if (horasing.length > 0) {
        this.tabla1[0].lun = !this.arrayDiasNoLabEdit.includes('LUNES')
          ? horasing[0] !== ''
            ? horasing[0]
            : '07:30'
          : '';
        this.tabla1[0].mar = !this.arrayDiasNoLabEdit.includes('MARTES')
          ? horasing[1] !== ''
            ? horasing[1]
            : '07:30'
          : '';
        this.tabla1[0].mie = !this.arrayDiasNoLabEdit.includes('MIÉRCOLES')
          ? horasing[2] !== ''
            ? horasing[2]
            : '07:30'
          : '';
        this.tabla1[0].jue = !this.arrayDiasNoLabEdit.includes('JUEVES')
          ? horasing[3] !== ''
            ? horasing[3]
            : '07:30'
          : '';
        this.tabla1[0].vie = !this.arrayDiasNoLabEdit.includes('VIERNES')
          ? horasing[4] !== ''
            ? horasing[4]
            : '07:30'
          : '';
        this.tabla1[0].sab = !this.arrayDiasNoLabEdit.includes('SÁBADO')
          ? horasing[5] !== ''
            ? horasing[5]
            : '07:30'
          : '';
        this.tabla1[0].dom = !this.arrayDiasNoLabEdit.includes('DOMINGO')
          ? horasing[6] !== ''
            ? horasing[6]
            : '07:30'
          : '';
      } else {
        this.tabla1[0].lun = !this.arrayDiasNoLabEdit.includes('LUNES')
          ? '07:30'
          : '';
        this.tabla1[0].mar = !this.arrayDiasNoLabEdit.includes('MARTES')
          ? '07:30'
          : '';
        this.tabla1[0].mie = !this.arrayDiasNoLabEdit.includes('MIÉRCOLES')
          ? '07:30'
          : '';
        this.tabla1[0].jue = !this.arrayDiasNoLabEdit.includes('JUEVES')
          ? '07:30'
          : '';
        this.tabla1[0].vie = !this.arrayDiasNoLabEdit.includes('VIERNES')
          ? '07:30'
          : '';
        this.tabla1[0].sab = !this.arrayDiasNoLabEdit.includes('SÁBADO')
          ? '07:30'
          : '';
        this.tabla1[0].dom = !this.arrayDiasNoLabEdit.includes('DOMINGO')
          ? '07:30'
          : '';
      }
      if (horassal.length > 0) {
        this.tabla1[1].lun = !this.arrayDiasNoLabEdit.includes('LUNES')
          ? horassal[0] !== ''
            ? horassal[0]
            : '12:00'
          : '';
        this.tabla1[1].mar = !this.arrayDiasNoLabEdit.includes('MARTES')
          ? horassal[1] !== ''
            ? horassal[1]
            : '12:00'
          : '';
        this.tabla1[1].mie = !this.arrayDiasNoLabEdit.includes('MIÉRCOLES')
          ? horassal[2] !== ''
            ? horassal[2]
            : '12:00'
          : '';
        this.tabla1[1].jue = !this.arrayDiasNoLabEdit.includes('JUEVES')
          ? horassal[3] !== ''
            ? horassal[3]
            : '12:00'
          : '';
        this.tabla1[1].vie = !this.arrayDiasNoLabEdit.includes('VIERNES')
          ? horassal[4] !== ''
            ? horassal[4]
            : '12:00'
          : '';
        this.tabla1[1].sab = !this.arrayDiasNoLabEdit.includes('SÁBADO')
          ? horassal[5] !== ''
            ? horassal[5]
            : '13:00'
          : '';
        this.tabla1[1].dom = !this.arrayDiasNoLabEdit.includes('DOMINGO')
          ? horassal[6] !== ''
            ? horassal[6]
            : '13:00'
          : '';
      } else {
        this.tabla1[1].lun = !this.arrayDiasNoLabEdit.includes('LUNES')
          ? '12:00'
          : '';
        this.tabla1[1].mar = !this.arrayDiasNoLabEdit.includes('MARTES')
          ? '12:00'
          : '';
        this.tabla1[1].mie = !this.arrayDiasNoLabEdit.includes('MIÉRCOLES')
          ? '12:00'
          : '';
        this.tabla1[1].jue = !this.arrayDiasNoLabEdit.includes('JUEVES')
          ? '12:00'
          : '';
        this.tabla1[1].vie = !this.arrayDiasNoLabEdit.includes('VIERNES')
          ? '12:00'
          : '';
        this.tabla1[1].sab = !this.arrayDiasNoLabEdit.includes('SÁBADO')
          ? '13:00'
          : '';
        this.tabla1[1].dom = !this.arrayDiasNoLabEdit.includes('DOMINGO')
          ? '13:00'
          : '';
      }
      if (descing.length > 0) {
        this.tabla2[0].lun = !this.arrayDiasNoLabEdit.includes('LUNES')
          ? descing[0] !== ''
            ? descing[0]
            : '14:00'
          : '';
        this.tabla2[0].mar = !this.arrayDiasNoLabEdit.includes('MARTES')
          ? descing[1] !== ''
            ? descing[1]
            : '14:00'
          : '';
        this.tabla2[0].mie = !this.arrayDiasNoLabEdit.includes('MIÉRCOLES')
          ? descing[2] !== ''
            ? descing[2]
            : '14:00'
          : '';
        this.tabla2[0].jue = !this.arrayDiasNoLabEdit.includes('JUEVES')
          ? descing[3] !== ''
            ? descing[3]
            : '14:00'
          : '';
        this.tabla2[0].vie = !this.arrayDiasNoLabEdit.includes('VIERNES')
          ? descing[4] !== ''
            ? descing[4]
            : '14:00'
          : '';
        this.tabla2[0].sab = !this.arrayDiasNoLabEdit.includes('SÁBADO')
          ? descing[5] !== ''
            ? descing[5]
            : ''
          : '';
        this.tabla2[0].dom = !this.arrayDiasNoLabEdit.includes('DOMINGO')
          ? descing[6] !== ''
            ? descing[6]
            : ''
          : '';
      } else {
        this.tabla2[0].lun = !this.arrayDiasNoLabEdit.includes('LUNES')
          ? '14:00'
          : '';
        this.tabla2[0].mar = !this.arrayDiasNoLabEdit.includes('MARTES')
          ? '14:00'
          : '';
        this.tabla2[0].mie = !this.arrayDiasNoLabEdit.includes('MIÉRCOLES')
          ? '14:00'
          : '';
        this.tabla2[0].jue = !this.arrayDiasNoLabEdit.includes('JUEVES')
          ? '14:00'
          : '';
        this.tabla2[0].vie = !this.arrayDiasNoLabEdit.includes('VIERNES')
          ? '14:00'
          : '';
        this.tabla2[0].sab = !this.arrayDiasNoLabEdit.includes('SÁBADO')
          ? ''
          : '';
        this.tabla2[0].dom = !this.arrayDiasNoLabEdit.includes('DOMINGO')
          ? ''
          : '';
      }
      if (descsal.length > 0) {
        this.tabla2[1].lun = !this.arrayDiasNoLabEdit.includes('LUNES')
          ? descsal[0] !== ''
            ? descsal[0]
            : '18:00'
          : '';
        this.tabla2[1].mar = !this.arrayDiasNoLabEdit.includes('MARTES')
          ? descsal[1] !== ''
            ? descsal[1]
            : '18:00'
          : '';
        this.tabla2[1].mie = !this.arrayDiasNoLabEdit.includes('MIÉRCOLES')
          ? descsal[2] !== ''
            ? descsal[2]
            : '18:00'
          : '';
        this.tabla2[1].jue = !this.arrayDiasNoLabEdit.includes('JUEVES')
          ? descsal[3] !== ''
            ? descsal[3]
            : '18:00'
          : '';
        this.tabla2[1].vie = !this.arrayDiasNoLabEdit.includes('VIERNES')
          ? descsal[4] !== ''
            ? descsal[4]
            : '18:00'
          : '';
        this.tabla2[1].sab = !this.arrayDiasNoLabEdit.includes('SÁBADO')
          ? descsal[5] !== ''
            ? descsal[5]
            : ''
          : '';
        this.tabla2[1].dom = !this.arrayDiasNoLabEdit.includes('DOMINGO')
          ? descsal[6] !== ''
            ? descsal[6]
            : ''
          : '';
      } else {
        this.tabla2[1].lun = !this.arrayDiasNoLabEdit.includes('LUNES')
          ? '18:00'
          : '';
        this.tabla2[1].mar = !this.arrayDiasNoLabEdit.includes('MARTES')
          ? '18:00'
          : '';
        this.tabla2[1].mie = !this.arrayDiasNoLabEdit.includes('MIÉRCOLES')
          ? '18:00'
          : '';
        this.tabla2[1].jue = !this.arrayDiasNoLabEdit.includes('JUEVES')
          ? '18:00'
          : '';
        this.tabla2[1].vie = !this.arrayDiasNoLabEdit.includes('VIERNES')
          ? '18:00'
          : '';
        this.tabla2[1].sab = !this.arrayDiasNoLabEdit.includes('SÁBADO')
          ? ''
          : '';
        this.tabla2[1].dom = !this.arrayDiasNoLabEdit.includes('DOMINGO')
          ? ''
          : '';
      }
      await this.calcularTothoras();
    }
  }

  async listaFeriados() {
    let arrayFeriados = [];
    let fecha = JSON.parse(
      JSON.stringify(moment(this.dataProyecto.fecha_inicio))
    );
    let ff = moment(this.dataProyecto.fecha_culmina).format('YYYY-MM-DD');
    while (moment(fecha).format('YYYY-MM-DD') <= ff) {
      const nombreDia = moment
        .weekdays(moment(fecha).day())
        .toLocaleUpperCase();
      const existe = await this.tablaferiados.find(
        (ele) => moment(ele.fecha).format('YYYY-MM-DD') == fecha
      );
      if (this.arrayDiasNoLabEdit.includes(nombreDia) || existe) {
        arrayFeriados.push(moment(fecha).format('YYYY-MM-DD'));
      }
      fecha = moment(fecha).add(1, 'days').format('YYYY-MM-DD');
    }
    this.noLaborables = arrayFeriados;
    this.plazoHabil = this.dataProyecto.plazo - this.noLaborables.length;
  }

  async habilitarEdicionDatosGenerales() {
    const temporal = await this.listarTemporalProgramacion();
    if (temporal || this.prograNoActua) {
      this.toaster.error(
        'Guarde o descarte los cambios no guardados desde programacion obra para poder editar los dias no laborables',
        'Error',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
      return;
    } else {
      this.habilitarEditarTab1 = true;
      this.inicio.enable();
      this.colorActual.enable();
      this.colorFeriado.enable();
      this.colorNoLabo.enable();
    }
  }

  async listarTemporalProgramacion() {
    // let datosRecuperados = null;
    // const obj = {
    //   id_proyecto: this.idProyecto,
    //   id_usuario: this.id_usuario,
    // };
    // const response =
    //   await this.principalService.listarCambiosTemporalesProgramacion(obj);
    // if (response) {
    //   datosRecuperados = JSON.parse(response.dataprogra);
    // }
    // return datosRecuperados;
   
      let datosRecuperados = null;
  
      const obj = {
        id_proyecto: this.idProyecto,
        id_usuario: this.id_usuario,
      };
      const response =
        await this.principalService.listarCambiosTemporalesProgramacion(obj);
      if (response) {
        // datosRecuperados = JSON.parse(response.dataprogra);
        datosRecuperados = await this.encriptadorService.descomprimirJSON(
          response.dataprogra
        );
      }
      return datosRecuperados;
    
  }

  async abrirModalNoLaborables(fila = null, index = null) {
    const modalRef = this.modalService.open(ModalNoLaborablesComponent, {
      size: 'md',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false, //no cerrar el modal con ESC
    });
    modalRef.componentInstance.idproyecto = this.idProyecto;
    modalRef.componentInstance.inicioProyect = this.dataProyecto.fecha_inicio;
    modalRef.componentInstance.fila = fila;
    modalRef.componentInstance.tablaferiados = this.tablaferiados;
    const result = await modalRef.result;
    if (result) {
      if (index !== null) {
        (this.tablaferiados[index].descripcion = result.descripcion),
          (this.tablaferiados[index].fecha = moment(result.fecha).format(
            'YYYY-MM-DD'
          )),
          (this.tablaferiados[index].laborado = result.laborado);
      } else {
        this.tablaferiados.push(result);
      }
      this.editadoFeriados = true;
    }
  }

  async cambioDia(dia, check, key) {
    if (check) {
      if (!this.arrayDiasNoLabEdit.includes(dia)) {
        this.arrayDiasNoLabEdit.push(dia);
        this.editadoJornada = true;
        this.tabla1[0][key] = '';
        this.tabla1[1][key] = '';
        this.tabla2[0][key] = '';
        this.tabla2[1][key] = '';
      }
    } else {
      if (this.arrayDiasNoLabEdit.includes(dia)) {
        const indice = this.arrayDiasNoLabEdit.indexOf(dia);
        this.arrayDiasNoLabEdit.splice(indice, 1);
        this.editadoJornada = true;
        this.tabla1[0][key] =
          key !== 'sab' && key !== 'dom' ? '07:30' : '07:30';
        this.tabla1[1][key] =
          key !== 'sab' && key !== 'dom' ? '12:00' : '13:00';
        this.tabla2[0][key] = key !== 'sab' && key !== 'dom' ? '14:00' : '';
        this.tabla2[1][key] = key !== 'sab' && key !== 'dom' ? '18:00' : '';
      }
    }
    this.calcularTothoras();
    const value = this.arrayDiasNoLabEdit.length
      ? this.arrayDiasNoLabEdit.join('|')
      : '';
    this.nolab1.setValue(value);
  }
  totalhorasxdia:any
  calcularHorasPorDia() {
    const dias = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
    const resultado = [{
        lun: 0, mar: 0, mie: 0, jue: 0, vie: 0, sab: 0, dom: 0
    }]
    for (const dia of dias) {
        const fecha = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
        const ingresoManana = this.tabla1[0][dia]? fecha + ' ' + this.tabla1[0][dia] + ':00':0
        const salidaManana = this.tabla1[1][dia]?fecha + ' ' + this.tabla1[1][dia] + ':00':0
        const salidaTarde = this.tabla2[0][dia]?fecha + ' ' + this.tabla2[0][dia] + ':00':0
        const ingresoTarde =this.tabla2[1][dia] ? fecha + ' ' + this.tabla2[1][dia] + ':00':0
        const horasManana = this.restahoras(ingresoManana, salidaManana);
        const horasTarde = this.restahoras(salidaTarde, ingresoTarde);
        resultado[0][dia] = this.minutesToString(horasManana + horasTarde)
    }
    this.totalhorasxdia=resultado
  }

  calcularTothoras() {
    let suma1 = 0;
    let suma2 = 0;
    let suma3 = 0;
    const dias = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
    for (const iterator of dias) {
      const fecha = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
      if (this.tabla2[0][iterator]) {
        const a = fecha + ' ' + this.tabla2[0][iterator] + ':00';
        const b = fecha + ' ' + this.tabla2[1][iterator] + ':00';
        const c = fecha + ' ' + this.tabla1[1][iterator] + ':00';
        suma2 = suma2 + this.restahoras(a, b);
        suma3 = suma3 + this.restahoras(c, a);
      }
    }
    this.horasdescanso = this.minutesToString(suma3);
    for (const iterator of dias) {
      const fecha = moment(this.dataProyecto.fecha_inicio).format('YYYY-MM-DD');
      if (this.tabla1[0][iterator]) {
        const a = fecha + ' ' + this.tabla1[0][iterator] + ':00';
        const b = fecha + ' ' + this.tabla1[1][iterator] + ':00';
        suma1 = suma1 + this.restahoras(a, b);
      }
    }
    this.horaslabo = this.minutesToString(suma1 + suma2);
  }
  

  restahoras(dia1, dia2) {
    try {
      let fechaa = moment(dia1);
      let fechab = moment(dia2);
      return fechab.diff(fechaa, 'minutes');
    } catch (e) {
      return 0;
    }
  }
  minutesToString(minutes) {
    let signo = minutes >= 0 ? '' : '-';
    let multi = minutes >= 0 ? 1 : -1;
    var hour = Math.floor((multi * minutes) / 60);
    let strhour = hour < 10 ? '0' + hour : hour;
    var minute = Math.floor((multi * minutes) % 60);
    let strminute = minute < 10 ? '0' + minute : minute;
    return signo + strhour + ':' + strminute;
  }

  cambio(event, fila, columna) {
    switch (columna) {
      case 0:
        this.tabla1[fila].lun = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 1:
        this.tabla1[fila].mar = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 2:
        this.tabla1[fila].mie = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 3:
        this.tabla1[fila].jue = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 4:
        this.tabla1[fila].vie = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 5:
        this.tabla1[fila].sab = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 6:
        this.tabla1[fila].dom = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        this.editadoJornada = true;
        break;
      default:
        break;
    }
  }

  cambio2(event, fila, columna) {
    switch (columna) {
      case 0:
        this.tabla2[fila].lun = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 1:
        this.tabla2[fila].mar = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 2:
        this.tabla2[fila].mie = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 3:
        this.tabla2[fila].jue = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 4:
        this.tabla2[fila].vie = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 5:
        this.tabla2[fila].sab = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      case 6:
        this.tabla2[fila].dom = event.target.value;
        this.calcularTothoras();
        this.editadoJornada = true;
        break;
      default:
        break;
    }
  }

  async GuardarJornada() {
    try {
      let horasing =
        this.tabla1[0].lun +
        '|' +
        this.tabla1[0].mar +
        '|' +
        this.tabla1[0].mie +
        '|' +
        this.tabla1[0].jue +
        '|' +
        this.tabla1[0].vie +
        '|' +
        this.tabla1[0].sab +
        '|' +
        this.tabla1[0].dom;
      let horassal =
        this.tabla1[1].lun +
        '|' +
        this.tabla1[1].mar +
        '|' +
        this.tabla1[1].mie +
        '|' +
        this.tabla1[1].jue +
        '|' +
        this.tabla1[1].vie +
        '|' +
        this.tabla1[1].sab +
        '|' +
        this.tabla1[1].dom;
      let descing =
        this.tabla2[0].lun +
        '|' +
        this.tabla2[0].mar +
        '|' +
        this.tabla2[0].mie +
        '|' +
        this.tabla2[0].jue +
        '|' +
        this.tabla2[0].vie +
        '|' +
        this.tabla2[0].sab +
        '|' +
        this.tabla2[0].dom;
      let descsal =
        this.tabla2[1].lun +
        '|' +
        this.tabla2[1].mar +
        '|' +
        this.tabla2[1].mie +
        '|' +
        this.tabla2[1].jue +
        '|' +
        this.tabla2[1].vie +
        '|' +
        this.tabla2[1].sab +
        '|' +
        this.tabla2[1].dom;
      let colores = '';
      if (this.editadoColores) {
        let colornolabo = 'color_1';
        let colornoFeriado = 'color_1';
        let colorActual = 'color_1';
        if (this.colorNoLabo.value) {
          const encontrado = this.coloresProgra.find(
            (ele) => this.colorNoLabo.value == ele.id
          );
          colornolabo = encontrado ? encontrado.nombre : 'color_1';
        }
        if (this.colorFeriado.value) {
          const encontrado = this.coloresProgra.find(
            (ele) => this.colorFeriado.value == ele.id
          );
          colornoFeriado = encontrado ? encontrado.nombre : 'color_1';
        }
        if (this.colorActual.value) {
          const encontrado = this.coloresProgra.find(
            (ele) => this.colorActual.value == ele.id
          );
          colorActual = encontrado ? encontrado.nombre : 'color_1';
        }
        colores = colornolabo + '|' + colornoFeriado + '|' + colorActual;
      } else {
        colores = this.nolab2.value;
      }
      const input = {
        id_proyecto: this.idProyecto,
        inicioSemana: this.inicio.value,
        nolabo1: this.nolab1.value,
        nolabo2: colores,
        horaIngreso: horasing,
        horaSalida: horassal,
        descansoIng: descing,
        descansoSal: descsal,
      };
      let res = await this.principalService.GuardarAspectosDiasProy(input);
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error();
    }
  }

  async eliminarFilaFeriado(fila, index) {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se eliminarà la fila seleccionada'
    );
    if (sw.isConfirmed) {
      if (fila.nro) {
        this.arrayEliminadosFeriados.push(fila.nro);
      }
      this.tablaferiados.splice(index, 1);
      this.editadoFeriados = true;
    }
  }

  async descartarCambiosGenerales() {
    if (!this.editadoFeriados && !this.editadoJornada && !this.editadoColores) {
      this.toaster.info('Ningun cambio realizado', null, {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      this.habilitarEditarTab1 = false;
      this.inicio.disable();
      this.colorActual.disable();
      this.colorFeriado.disable();
      this.colorNoLabo.disable();
    } else {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se descartará todos los cambios no guardados en datos generales'
      );
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        await this.cargarDatos();
        this.habilitarEditarTab1 = false;
        this.editadoJornada = false;
        this.editadoFeriados = false;
        this.editadoColores = false;
        this.inicio.disable();
        this.colorActual.disable();
        this.colorFeriado.disable();
        this.colorNoLabo.disable();
        this.mostrar_carga_todo = false;
      }
    }
  }

  async guardarCambiosGenerales() {
    try {
      if (
        !this.editadoFeriados &&
        !this.editadoJornada &&
        !this.editadoColores
      ) {
        this.toaster.info('Ningun cambio realizado', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
        this.habilitarEditarTab1 = false;
      } else {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          'Se guardaran todos los cambios realizados y se actualizara la programacion gantt'
        );
        if (sw.isConfirmed) {
          this.mostrar_carga_todo = true;
          if (
            this.editadoColores &&
            !this.editadoJornada &&
            !this.editadoFeriados
          ) {
          } else {
            await this.actuaTodaProgramacion();
          }
          let guardado=await this.guardarCambios();
          if(!guardado){
            this.mostrar_carga_todo=false
            return;
          }
          if (this.editadoFeriados) {
            await this.guardarFeriados();
          }
          if (this.editadoJornada || this.editadoColores) {
            await this.GuardarJornada();
          }
          await this.cargarDatos();
          await this.datosComplementarios();
          this.habilitarEditarTab1 = false;
          this.inicio.disable();
          this.colorActual.disable();
          this.colorFeriado.disable();
          this.colorNoLabo.disable();
          this.mostrar_carga_todo = false;
          this.toaster.success(
            'Se almacenó datos generales y actualizó correctamente la programación',
            'Éxito',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        }
      }
      this.calcularHorasPorDia()
    } catch (e) {
      this.mostrar_carga_todo = false;
      SwalService.error();
      console.log(e);
    }
  }

  async guardarFeriados() {
    const datos1 = JSON.stringify(this.tablaferiados);
    const datos2 = JSON.stringify(this.arrayEliminadosFeriados);
    const obj = JSON.stringify({
      id_proyecto: this.idProyecto,
      datos1: datos1,
      datos2: datos2,
    });
    const response = await this.principalService.guardaCambiosTablaFeriados(
      obj
    );
    this.arrayEliminadosFeriados = [];
  }

  async listarTablaPrograTiempos(actualizar = false) {
    const tempPresu = await this.ListarPresupuestoTemp();
    if (tempPresu) {
      this.mostrar_carga_todo = false;
      SwalService.warning(
        'Error',
        'Cambios no guardados en Edicion de presupuesto. El encargado  debe guardar o descartar los cambios en la vista edicion de presupuesto'
      );
      return;
    }
    const temporal = await this.listarTemporalProgramacion();
    let tablaProgra = [];
    const input = { id_proyecto: this.idProyecto };
    const response = await this.principalService.listarProgramacionProyecto(
      input
    );
    if (temporal) {
      this.existetemp = true;
      tablaProgra = temporal.dataPrincipal;
      this.prograNoActua = temporal.prograNoActua;
      this.hitosEliminados = temporal.hitosEliminados;
    } else {
      this.existetemp = false;
      if (!response[0].length) {
        return;
      } else {
        tablaProgra = response[0];
      }
    }
    let programacion = await this.formatoProgramacion(tablaProgra, response);
    if (actualizar) {
      programacion = await this.actualizarCuadrilla(programacion);
    }
    this.dataPrincipal = programacion;
    let arrayUIDsOrdenados = [];
    this.dataPrincipal.map((ele) => {
      if (ele.uid) {
        arrayUIDsOrdenados[ele.uid] = ele;
      }
    });
    this.uidsOrdenados = arrayUIDsOrdenados;
  }

  async actualizarCuadrilla(array) {
    for (const row of array) {
      if (row.unidad && !row.indice_ref_hito) {
        if (Number(row.metrado) == 0) {
          row.tiempoUnitario = 1;
          row.diasHabilesValido = true;
          row.cuadrilla = row.tiempoUnitario / row.duracion;
        } else {
        }
      }
    }
    return array;
  }

  async formatoProgramacion(programacion, actual) {
    for (const element of programacion) {
      element.editarCua = false;
      element.editarDur = false;
      if (!element.fechafin) {
        element.fechafin = moment(this.dataProyecto.fecha_inicio).format(
          'YYYY-MM-DD'
        );
        element.fechafinBD = false;
      } else {
        element.fechafin = moment(element.fechafin).format('YYYY-MM-DD');
        element.fechafinBD = true;
      }
      if (!element.fechaini) {
        element.fechaini = moment(this.dataProyecto.fecha_inicio).format(
          'YYYY-MM-DD'
        );
        element.fechainiBD = false;
      } else {
        element.fechaini = moment(element.fechaini).format('YYYY-MM-DD');
        element.fechainiBD = true;
      }

      if (!element.restriccion) {
        element.restriccion = '';
      } else {
        element.restriccion = moment(element.restriccion).format('YYYY-MM-DD');
      }
      if (!element.restriccion2) {
        element.restriccion2 = '';
      } else {
        element.restriccion2 = moment(element.restriccion2).format(
          'YYYY-MM-DD'
        );
      }
      if (!element.condini) {
        element.condini = '';
      }
      if (!element.condfin) {
        element.condfin = '';
      }
      if (!element.parcial) {
        element.parcial = '0.00';
      } else {
        element.parcial = this.formsService.redondeo(element.parcial, 2);
      }
      element.editarRest = false;
      element.editarCua = false;
      element.editarDur = false;
      element.editarFF = false;
      element.editarFI = false;
      element.editarPred = false;
      element.editarDescrip = false;
      if (element.unidad) {
        const encontrado = await actual[0].find(
          (ele) => ele.uid == element.uid
        );
        if (
          isNaN(Number(element.rendimiento)) ||
          Number(element.rendimiento) == 0
        ) {
          element.rendimiento = 1;
        }
        element.metrado = encontrado ? encontrado.metrado : element.metrado;
        if (Number(element.metrado) == 0) {
          element.tiempoUnitario = 1;
          element.diasHabilesValido = true;
        } else {
          element.tiempoUnitario = this.formsService.redondeo(
            parseFloat(element.metrado) / parseFloat(element.rendimiento),
            5
          );
        }

        if (element.referencia == null && Number(element.cuadrilla) == 1) {
          element.cuadrilla = 1;
          element.tiempoUnitario = Number(element.tiempoUnitario)
            ? element.tiempoUnitario
            : this.formsService.redondeo(
                parseFloat(element.metrado) / parseFloat(element.rendimiento),
                5
              );
          const diasRequeridos =
            parseFloat(element.tiempoUnitario) /
            parseFloat(element.cuadrilla ? element.cuadrilla : 1);
          element.duracion = element.unidad
            ? Math.ceil(diasRequeridos == 0 ? 1 : diasRequeridos)
            : 1;
          if (element.duracion > this.plazoHabil) {
            element.diasHabilesValido = false;
            element.duracion = this.plazoHabil;
            const cuadrillaNecesaria =
              element.tiempoUnitario /
              (element.duracion ? element.duracion : 1);
            element.cuadrilla = Number(
              this.formsService.redondeo(cuadrillaNecesaria, 2)
            );
            element.filaEditada = true;
            const response = await this.calcularFechaComplemento(
              element.duracion,
              element.fechaini,
              ''
            );
            element.fechafin = response.fecha;
            element.duraciontot = response.duraciontot;
          } else {
            const response = await this.calcularFechaComplemento(
              element.duracion,
              element.fechaini,
              ''
            );
            element.diasHabilesValido = true;
            element.fechafin = response.fecha;
            element.duraciontot = response.duraciontot;
          }
        } else {
          element.cuadrilla = element.tiempoUnitario / element.duracion;
        }
        if (element.duracion <= this.plazoHabil) {
          element.diasHabilesValido = true;
        } else {
          element.diasHabilesValido = false;
        }
      }
    }
    return programacion;
  }

  async habilitarEditar(rowIndex, input) {
    if (this.solover) {
      return;
    }
    if (input == 'duracion' && this.dataPrincipal[rowIndex].duracion) {
      this.dataPrincipal[rowIndex].editarDur = true;
    }
    if (input == 'fechaini') {
      this.dataPrincipal[rowIndex].editarFI = true;
    }
    if (input == 'fechafin' && this.dataPrincipal[rowIndex].duracion) {
      this.dataPrincipal[rowIndex].editarFF = true;
    }
    if (input == 'predecesor') {
      this.dataPrincipal[rowIndex].editarPred = true;
    }
    if (input == 'cuadrilla' && this.dataPrincipal[rowIndex].duracion) {
      this.dataPrincipal[rowIndex].editarCua = true;
    }
    if (input == 'descripcion' && !this.dataPrincipal[rowIndex].duracion) {
      this.dataPrincipal[rowIndex].editarDescrip = true;
    }
  }

  deshabilitarEditar(rowIndex) {
    this.dataPrincipal[rowIndex].editarDur = false;
    this.dataPrincipal[rowIndex].editarFI = false;
    this.dataPrincipal[rowIndex].editarFF = false;
    this.dataPrincipal[rowIndex].editarPred = false;
    this.dataPrincipal[rowIndex].editarRest = false;
    this.dataPrincipal[rowIndex].editarCua = false;
    this.dataPrincipal[rowIndex].editarDescrip = false;
  }

  async recuperarDetallePartida(row) {
    this.rowSeleccionado = row;
    this.tablaDetallePartida = [];
    this.buscando5 = true;
    if (row.unidad) {
      if (!row.detalle_partida) {
        const obj = {
          id_proyecto: this.idProyecto,
          indice: row.indice,
        };
        const listaInsumos = await this.principalService.detallePartidaProgra(
          obj
        );
        let response = [];
        const arrayTipos = ['MANO DE OBRA', 'EQUIPOS'];
        let i = 1;
        for (const iterator of arrayTipos) {
          const obj = {
            codigo: null,
            cuadrilla: null,
            cuadrillamod: null,
            descripcion: iterator,
            id_filadetalle: null,
            id_proyecto: null,
            id_tipo_insumo: i,
            indice: null,
            num_det: null,
            unidad: '',
          };
          response.push(obj);
          const encontrados = await listaInsumos.filter(
            (ele) => ele.id_tipo_insumo == i
          );
          response = response.concat(encontrados);
          i = i + 2;
        }
        if (response.length) {
          let arrayAbreviaturas = [];
          for (const iterator of response) {
            let word = '';
            const arrayTextos = ['DE', 'CON'];
            if (iterator.unidad) {
              const texto = iterator.descripcion.trim();
              if (texto.includes(' ')) {
                const spliteado = texto.split(' ');
                let i = 1;
                if (spliteado.length > 1) {
                  while (
                    i < spliteado.length &&
                    arrayTextos.includes(spliteado[i].toUpperCase())
                  ) {
                    i++;
                  }
                }
                word = spliteado[0].substr(0, 1) + spliteado[i].substr(0, 1);
              } else {
                word = texto.substr(0, 2);
              }
              const abrev = word[0].toUpperCase() + word.slice(1);
              const encontrados = arrayAbreviaturas.filter(
                (ele) => ele == abrev
              );
              iterator.unidad2 = !encontrados.length
                ? abrev
                : abrev + encontrados.length;
              arrayAbreviaturas.push(abrev);
            } else {
              iterator.unidad2 = '';
            }
            iterator.cuadrilla2 = row.cuadrilla * iterator.cuadrilla;
          }
          this.tablaDetallePartida = response;
          this.dataPrincipal[row.ind].detalle_partida = response;
        }
      } else {
        this.tablaDetallePartida = row.detalle_partida;
      }
      let cuadrillaArr = [[], []];
      let i = -1;
      for (const iterator of row.detalle_partida) {
        if (!iterator.unidad) {
          i++;
        } else {
          const texto =
            this.formsService.redondeo(iterator.cuadrilla, 2) +
            '(' +
            iterator.unidad2 +
            ')';
          cuadrillaArr[i].push(texto);
        }
      }
      const cuadrillaMO = cuadrillaArr[0].join(' + ');
      const cuadrillaEQ = cuadrillaArr[1].join(' + ');
      this.rowSeleccionado.cuadrillaMO = cuadrillaMO;
      this.rowSeleccionado.cuadrillaEQ = cuadrillaEQ;
      await this.cuadrillaEditadaTabla(this.rowSeleccionado.ind);
    }
    this.buscando5 = false;
  }

  async cuadrillaEditadaTabla(ind) {
    const rowSeleccionado = this.dataPrincipal[ind];
    for (const iterator of rowSeleccionado.detalle_partida) {
      iterator.cuadrilla2 = rowSeleccionado.cuadrilla * iterator.cuadrilla;
    }
    let cuadrillaArr = [[], []];
    let i = -1;
    for (const iterator of rowSeleccionado.detalle_partida) {
      if (!iterator.unidad) {
        i++;
      } else {
        const texto =
          this.formsService.redondeo(iterator.cuadrilla2, 2) +
          '(' +
          iterator.unidad2 +
          ')';
        cuadrillaArr[i].push(texto);
      }
    }
    const cuadrillaMO = cuadrillaArr[0].join(' + ');
    const cuadrillaEQ = cuadrillaArr[1].join(' + ');
    this.dataPrincipal[ind].cuadrillaMO1 = cuadrillaMO;
    this.dataPrincipal[ind].cuadrillaEQ1 = cuadrillaEQ;
  }

  async calcularFechaComplemento(duracion, fechaini, fechafin) {
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
          const existe = await this.tablaferiados.find(
            (ele) => moment(ele.fecha).format('YYYY-MM-DD') == fecha
          );
          if (
            !existe &&
            !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
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
            const existe = await this.tablaferiados.find(
              (ele) => ele.fecha == fecha
            );
            if (
              !existe &&
              !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
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
            const existe = await this.tablaferiados.find(
              (ele) => ele.fecha == fecha
            );
            if (
              !existe &&
              !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
            ) {
              duracionPendiente--;
            }
            f1 = moment(fecha);
          }
          var ffin = moment(fechaini);
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
        const existe = await this.tablaferiados.find(
          (ele) => ele.fecha == fecha
        );
        if (
          !existe &&
          !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
        ) {
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

  presTeclaTiempos(event, ind, input, input2) {
    if (event.keyCode.toString() == '27') {
      //esc descartar los cambios
      event.target.blur();
    } else if (event.keyCode.toString() == '13') {
      //enter
      event.target.blur();
    } else if (event.keyCode.toString() == '40') {
      // abajo
      const cantidadFilas = this.dataPrincipal.length;
      if (ind + 1 < cantidadFilas) {
        for (let i = ind + 1; i < cantidadFilas; i++) {
          if (this.dataPrincipal[i].unidad) {
            event.target.blur();
            this.dataPrincipal[i]['editar' + input] = true;
            break;
          }
        }
      } else {
        return;
      }
    } else if (event.keyCode.toString() == '38') {
      //arriba
      const cantidadFilas = this.dataPrincipal.length;
      if (ind + 1 > 0) {
        for (let i = ind - 1; i > 0; i--) {
          if (this.dataPrincipal[i].unidad) {
            event.target.blur();
            this.dataPrincipal[i]['editar' + input] = true;
            break;
          }
        }
      } else {
        return;
      }
    } else if (event.keyCode.toString() == '37') {
      //izquierda
      event.target.blur();
      this.dataPrincipal[ind]['editar' + input2] = true;
    }
    if (event.keyCode.toString() == '39') {
      //derecha
      event.target.blur();
      this.dataPrincipal[ind]['editar' + input2] = true;
    }
  }

  async evaluarCuadrillaTiempos(valor3, index, reinicio = false) {
    // console.log('ec', valor3, index, reinicio);

    this.dataPrincipal[index].editarCua = 0;
    const valor = valor3.toString().replace(',', '');

    if (valor == '' || isNaN(Number(valor)) || Number(valor) == 0) {
      this.toaster.error('Valor cuadrilla no valido', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      });
      return;
    } else {
      const row = this.dataPrincipal[index];
      if (parseFloat(row.cuadrilla) == parseFloat(valor)) {
        return;
      } else {
        this.dataPrincipal[index].cuadrilla = this.formsService.redondeo(
          parseFloat(valor),
          2
        );
        const element = this.dataPrincipal[index];
        const diasHabiles =
          element.tiempoUnitario /
          (element.cuadrilla ? parseFloat(element.cuadrilla) : 1);
        if (diasHabiles > this.plazoHabil) {
          element.diasHabilesValido = false;
          element.duracion = this.plazoHabil;
          const cuadrillaNecesaria =
            element.tiempoUnitario / (element.duracion ? element.duracion : 1);
          element.cuadrilla = Number(
            this.formsService.redondeo(cuadrillaNecesaria, 2)
          );
          element.filaEditada = true;
          const response = await this.calcularFechaComplemento(
            element.duracion,
            element.fechaini,
            ''
          );
          element.fechafin = response.fecha;
          element.duraciontot = response.duraciontot;
        } else {
          this.dataPrincipal[index].duracion = Math.ceil(diasHabiles);
          const response = await this.calcularFechaComplemento(
            element.duracion,
            element.fechaini,
            ''
          );
          this.dataPrincipal[index].fechafin = response.fecha;
          this.dataPrincipal[index].duraciontot = response.duraciontot;
          this.dataPrincipal[index].filaEditada = true;
        }
        if (row.hijos_uid) {
          this.prograNoActua = true;
        }
        await this.superiores(this.dataPrincipal[index].ind);
        this.tablaDesemDesactua = true;
        if (this.dataPrincipal[index].detalle_partida) {
          await this.cuadrillaEditadaTabla(index);
        }
        if (!reinicio) {
          // this.guardarTemporal();
          this.actualizarTemp()
        }
      }
    }
  }

  async evaluarDuracionTiempos(valor, index, reinicio = false) {
    this.dataPrincipal[index].editarDur = 0;
    if (
      valor == '' ||
      isNaN(Number(valor)) ||
      Number(valor) > this.plazoHabil
    ) {
      if (!reinicio) {
        if (Number(valor) > this.plazoHabil) {
          this.toaster.error(
            'Valor dias excendente a dias habiles : ' + this.plazoHabil,
            'Error',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        } else {
          this.toaster.error('Valor dias no valido', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          });
        }
        return;
      }
    } else {
      const row = this.dataPrincipal[index];
      if (parseInt(row.duracion) == parseInt(valor)) {
        return;
      } else {
        this.dataPrincipal[index].duracion = Number(valor);
        this.dataPrincipal[index].diasHabilesValido = true;
        const element = this.dataPrincipal[index];
        const cuadrillaNecesaria =
          element.tiempoUnitario / (element.duracion ? element.duracion : 1);
        this.dataPrincipal[index].cuadrilla = Number(
          this.formsService.redondeo(cuadrillaNecesaria + 0.001, 2)
        );
        this.dataPrincipal[index].filaEditada = true;
        const response = await this.calcularFechaComplemento(
          element.duracion,
          element.fechaini,
          ''
        );
        this.dataPrincipal[index].fechafin = response.fecha;
        this.dataPrincipal[index].duraciontot = response.duraciontot;
        this.dataPrincipal[index].filaEditada = true;
        await this.superiores(this.dataPrincipal[index].ind);
        if (row.hijos_uid) {
          this.prograNoActua = true;
        }
        this.tablaDesemDesactua = true;
      }
      if (this.dataPrincipal[index].detalle_partida) {
        await this.cuadrillaEditadaTabla(index);
      }
      if (!reinicio) {
        // this.guardarTemporal(this.dataPrincipal,this.prograNoActua,this.hitosEliminados);
        this.actualizarTemp()
      }
    }
  }

  async superiores(index) {
    const itemSpliteado = this.dataPrincipal[index].item.split('.');
    itemSpliteado.pop();
    while (itemSpliteado.length) {
      const encontrado = await this.dataPrincipal.find((ele) => {
        if (ele.item === itemSpliteado.join('.')) {
          return ele;
        }
      });
      this.dataPrincipal[encontrado.ind].filaEditada = true;
      itemSpliteado.pop();
    }
  }

  async reiniciarUnDiaCuadrilla() {
    try {
      this.mostrar_carga_todo = true;
      for (const iterator of this.dataPrincipal) {
        if (iterator.unidad && iterator.duracion) {
          await this.evaluarCuadrillaTiempos(1.0, iterator.ind, true);
        }
      }
      await this.guardarTemporal(this.dataPrincipal,this.prograNoActua,this.hitosEliminados);
      this.mostrar_carga_todo = false;
      this.toaster.success('Se actualizo cuadrilla correctamente', 'Correcto', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.log(error);
      SwalService.error();
    }
  }

  async reiniciarUnDiaDuracion() {
    try {
      this.mostrar_carga_todo = true;
      for (const iterator of this.dataPrincipal) {
        if (iterator.unidad && !iterator.indice_ref_hito && iterator.duracion) {
          await this.evaluarDuracionTiempos(1.0, iterator.ind, true);
        }
      }
      await this.guardarTemporal(this.dataPrincipal,this.prograNoActua,this.hitosEliminados);
      this.mostrar_carga_todo = false;
      this.toaster.success('Se actualizó duración correctamente', 'Correcto', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
      console.log(error);
    }
  }

  async correcionDiasHabiles() {
    try {
      this.mostrar_carga_todo = true;
      const filter = await this.dataPrincipal.find(
        (iterator) => !iterator.diasHabilesValido && iterator.unidad
      );
      if (filter) {
        let existe = false;

        for (const iterator of this.dataPrincipal) {
          if (!iterator.diasHabilesValido && iterator.unidad) {
            existe = true;
            await this.evaluarDuracionTiempos(
              this.dataProyecto.plazo,
              iterator.ind,
              true
            );
          }
        }
        this.progTiempNoVAlidos = false;
        if (existe) {
          // this.guardarTemporal(this.dataPrincipal,this.prograNoActua,this.hitosEliminados);
          this.actualizarTemp()
        }
        this.mostrar_carga_todo = false;
      } else {
        this.toaster.info('Ninguna fila para corregir', null, {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
      }
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.log(error);
      SwalService.error();
    }
  }

  // async guardarTemporal() {
  //   const datos = {
  //     dataPrincipal: this.dataPrincipal,
  //     prograNoActua: this.prograNoActua,
  //     hitosEliminados: this.hitosEliminados,
  //   };
  //   // console.table(this.dataPrincipal, ['idgantt','uid','duracion','fechaini','fechafin','referencia','referenciados','hijos_uid','filaEditada']);
  //   const dataprogra = JSON.stringify(datos);
  //   const obj = {
  //     id_proyecto: this.idProyecto,
  //     id_usuario: this.id_usuario,
  //     dataprogra: dataprogra,
  //   };
  //   const response =
  //     await this.principalService.guardarCambiosTemporalesProgramacion(obj);
  //   this.existetemp = true;
  // }
  async guardarTemporal(dataPrincipal, prograNoActua, hitosEliminados) {
    if (this.solover) {
      return
    }
    this.bloqtemp = true;
    this.existetemp = true
    const datos = {
      dataPrincipal: dataPrincipal,
      prograNoActua: prograNoActua,
      hitosEliminados: hitosEliminados,
    };
    let tabla_1 = ''
    await this.compressTextAsync(JSON.stringify(datos))
    .then((compressedText) => {
      tabla_1 = compressedText;
    })
    .catch((error) => {
      console.error('Error en la compresión:', error);
    });
    const obj = {
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
      dataprogra: tabla_1,
    };
    const response =
      await this.principalService.guardarCambiosTemporalesProgramacion(obj);
      this.bloqtemp = false;
    this.stop();
  }

  async reiniciarProgramacion() {
    try {
      const sw = await SwalService.confirm(
        'Estas seguro?',
        'Se reiniciará completamente el la programacion del proyecto'
      );
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        await this.descartarTemporalProgramacion();
        const inputProyecto = {
          id_proyecto: this.idProyecto,
          id_usuario: this.id_usuario,
        };
        const response = await this.principalService.restaurarPrograma(
          inputProyecto
        );
        await this.listarTablaPrograTiempos();
        this.mostrar_carga_todo = false;
        this.toaster.success('Se restauró correctamente', 'Éxito', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
      }
    } catch (error) {
      console.log(error);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  async descartarTemporalProgramacion() {
    const obj = {
      id_proyecto: this.idProyecto,
      id_usuario: this.id_usuario,
    };
    const response =
      await this.principalService.eliminarCambiosTemporalesProgramacion(obj);
    this.existetemp = false;
  }

  async guardarCambios() {
    let partidas = [];
    await this.dataPrincipal.forEach((ele, index) => {
      if (ele.filaEditada) {
        ele.referencia = ele.referencia == null ? '' : ele.referencia;
        ele.referenciados = ele.referenciados == null ? '' : ele.referenciados;
        ele.hijos = ele.hijos == null ? '' : ele.hijos;
        ele.hijos_uid = ele.hijos_uid == null ? '' : ele.hijos_uid;
        ele.indice_ref_hito =
          ele.indice_ref_hito == null ? '' : ele.indice_ref_hito;
        if (!ele.indice_ref_hito) {
          partidas.push(ele);
        } else {
        }
      }
    });
    const tabla1 = JSON.stringify(partidas);
    const body = JSON.stringify({
      id_usuario: this.id_usuario,
      datos1: tabla1,
      id_proyecto: this.idProyecto,
    });
    const response = await this.principalService.guardarDatosProgramacion(body);
    if (response.id == '1') {
      await this.permisosUsuario();
      await this.listarTablaPrograTiempos(true);
    }
    else{
      // this.actualizarTemp();
      this.toaster.error(
        response.mensaje,
        'Adevertencia',{closeButton: false,positionClass: 'toast-bottom-right',timeOut: 10000});
      return false;
    }
    return true;
  }

  async actualizarEnlazados(iterator, actualizar = false) {
    if (!iterator.hijos_uid) {
      return;
    } else {
      const hijos = JSON.parse(iterator.hijos_uid);
      for (const uid of hijos) {
        const encontrado = this.dataPrincipal.find((ele) => ele.uid == uid);
        const row = encontrado;

        const condicionales = await this.condicionanteFila(
          JSON.parse(row.referenciados),
          row.ind
        );
        this.dataPrincipal[row.ind].filaEditada = true;
        this.dataPrincipal[row.ind].duracion = condicionales.duracion;
        this.dataPrincipal[row.ind].fechafin = condicionales.fechafin;
        this.dataPrincipal[row.ind].fechaini = condicionales.fechaini;
        this.dataPrincipal[row.ind].duraciontot = condicionales.duraciontot;
        await this.actualizarEnlazados(row, actualizar);
      }
    }
  }

  async condicionanteFila(referenciados, index) {
    let condini = null;
    let condfin = null;
    let fechafin = null;
    let duraciontot = null;
    let fechaini = null;
    let duracion = null;
    if (referenciados.length) {
      let fi = null;
      let ff = null;
      for (const iterator of referenciados) {
        const response = await this.fechadeReferencia(iterator);
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

      if (ff && fi) {
        if (fi > ff) {
          const response1 = await this.calcularFechaComplemento(
            this.dataPrincipal[index].duracion,
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
          this.dataPrincipal[index].duracion,
          fi,
          ff
        );
        if (ff && !fi && response3.fecha < this.dataProyecto.fecha_inicio) {
          const response4 = await this.calcularFechaComplemento(
            this.dataPrincipal[index].duracion,
            '',
            ff
          );
          fechaini = response4.fecha;
          fechafin = ff;
          duracion = this.dataPrincipal[index].duracion;
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
      fechaini: fechaini ? fechaini : this.dataPrincipal[index].fechaini,
      fechafin: fechafin ? fechafin : this.dataPrincipal[index].fechafin,
      duracion: duracion ? duracion : this.dataPrincipal[index].duracion,
      duraciontot: duraciontot,
    };

    return obj;
  }

  async fechadeReferencia(referencia) {
    let fecha = null;
    const row = this.uidsOrdenados[referencia[0]];
    if (referencia[1] == '' || referencia[1] == 'FC') {
      let fechac = row.fechafin;
      let fi;
      let existe = false;
      fi = moment(fechac).add(1, 'days').format('YYYY-MM-DD');
      do {
        const esFeriado = this.tablaferiados.find((ele) => ele.fecha == fi);
        const nombreDia = moment.weekdays(moment(fi).day());
        if (
          esFeriado ||
          this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
        ) {
          existe = true;
        } else {
          existe = false;
        }
        if (existe) {
          fi = moment(fi).add(1, 'days').format('YYYY-MM-DD');
        }
      } while (existe);
      fecha = fi;
    } else if (referencia[1] == 'CC') {
      fecha = row.fechaini;
    } else if (referencia[1] == 'CF') {
      let valido = false;
      let f = JSON.parse(JSON.stringify(row.fechaini));
      while (!valido) {
        f = moment(f).subtract(1, 'days').format('YYYY-MM-DD');
        const nombreDia = moment.weekdays(moment(f).day());
        const existe = await this.tablaferiados.find((ele) => ele.fecha == f);
        if (
          !existe &&
          !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
        ) {
          valido = true;
        }
      }
      fecha = f;
    } else if (referencia[1] == 'FF') {
      fecha = row.fechafin;
    }
    if (fecha) {
      if (referencia[2]) {
        const numero = parseInt(referencia[2]);
        const tipo = referencia[2].slice(numero.toString().length);
        let dias = 0;
        if (tipo == 'd' || tipo == 'D' || !tipo) {
          dias = numero;
        } else if (tipo == '%') {
          const dur = row.duracion;
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
    return fecha;
  }

  async actualizarTitulos2() {
    let titulos = [];
    await this.dataPrincipal.map((ele) => {
      if (!ele.unidad && !ele.indice_ref_hito && ele.item) {
        titulos.push(ele.ind);
      }
    });
    titulos.reverse();
    for (const iterator of titulos) {
      await this.updatetitulo2(iterator);
    }
  }

  async updatetitulo2(indice) {
    const fechaiIni = JSON.parse(
      JSON.stringify(this.dataPrincipal[indice].fechaini)
    );
    const fechaiFin = JSON.parse(
      JSON.stringify(this.dataPrincipal[indice].fechafin)
    );
    const arrayItem = this.dataPrincipal[indice].item.split('.');
    const encontrados = await this.dataPrincipal.filter((ele) => {
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
          menorFI = ele.fechaini;
        }
        if (ele.fechaini < menorFI) {
          menorFI = ele.fechaini;
        }
        if (ele.fechafin > mayorFF) {
          mayorFF = ele.fechafin;
        }
      });
    } else {
    }
    this.dataPrincipal[indice].fechaini = JSON.parse(JSON.stringify(menorFI));
    this.dataPrincipal[indice].fechafin = JSON.parse(JSON.stringify(mayorFF));
    const response = await this.calcularFechaComplemento(
      '',
      this.dataPrincipal[indice].fechaini,
      this.dataPrincipal[indice].fechafin
    );
    this.dataPrincipal[indice].duracion = Number(response.duracion);
    this.dataPrincipal[indice].duraciontot = Number(response.duraciontot);
  }

  async verificarFechaInicio(fecha) {
    let nuevaFecha = null;
    const nombreDia = moment.weekdays(moment(fecha).day());
    const existe = await this.tablaferiados.find((ele) => ele.fecha == fecha);
    if (!existe && !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())) {
      return nuevaFecha;
    } else {
      let noValido = true;
      while (noValido) {
        const fech = moment(fecha).add(1, 'days').format('YYYY-MM-DD');
        const nombreDia = moment.weekdays(moment(fech).day());
        const existe = await this.tablaferiados.find(
          (ele) => moment(ele.fecha).format('YYYY-MM-DD') == fech
        );
        if (
          !existe &&
          !this.arrayDiasNoLabEdit.includes(nombreDia.toUpperCase())
        ) {
          nuevaFecha = fech;
          noValido = false;
        } else {
          fecha = moment(fech);
        }
      }
    }
    return nuevaFecha;
  }

  async agregarAlPadre(uid, uidagregar) {
    const hijos = this.uidsOrdenados[uid].hijos_uid
      ? JSON.parse(this.uidsOrdenados[uid].hijos_uid)
      : [];
    let hijosArr = hijos;
    if (hijos) {
      if (!hijos.includes(uidagregar)) {
        hijosArr.push(uidagregar);
        this.uidsOrdenados[uid].filaEditada = true;
      }
    } else {
      hijosArr.push(uidagregar);
      this.uidsOrdenados[uid].filaEditada = true;
    }
    return hijosArr;
  }

  async eliminarDelPadre(uid, uideliminar) {
    const hijos = this.uidsOrdenados[uid].hijos_uid
      ? JSON.parse(this.uidsOrdenados[uid].hijos_uid)
      : [];
    let hijosArr = hijos;
    if (hijos) {
      if (hijos.includes(uideliminar)) {
        var indice = hijosArr.indexOf(uideliminar);
        hijosArr.splice(indice, 1);
        this.uidsOrdenados[uid].filaEditada = true;
      }
    }
    this.uidsOrdenados[uid].hijos_uid = hijosArr.length
      ? JSON.stringify(hijosArr)
      : '';
  }

  async actuaTodaProgramacion() {
    // for await (const iterator of this.dataPrincipal) {
    //   if (  iterator.unidad &&
    //     !iterator.hijos_uid &&
    //     iterator.referenciados &&
    //     !iterator.indice_ref_hito) {
    //       console.log('iterator', iterator)
    //     if (iterator.condini) {
    //       await this.eliminarDelPadre(
    //         JSON.parse(iterator.condini)[0],
    //         iterator.uid
    //       );
    //     }
    //     if (iterator.condfin) {
    //       await this.eliminarDelPadre(
    //         JSON.parse(iterator.condfin)[0],
    //         iterator.uid
    //       );
    //     }
    //     const condicionales = await this.condicionanteFila(
    //       JSON.parse(iterator.referenciados),
    //       iterator.ind
    //     );
    //     if (condicionales.condini) {
    //       this.uidsOrdenados[iterator.uid].condini = JSON.stringify(
    //         condicionales.condini
    //       );
    //       const hijos = await this.agregarAlPadre(
    //         condicionales.condini[0],
    //         iterator.uid
    //       );
    //       this.uidsOrdenados[condicionales.condini[0]].hijos_uid = hijos
    //         ? JSON.stringify(hijos)
    //         : '';
    //     }
    //     if (condicionales.condfin) {
    //       this.uidsOrdenados[iterator.uid].condfin = JSON.stringify(
    //         condicionales.condfin
    //       );
    //       const hijos = await this.agregarAlPadre(
    //         condicionales.condfin[0],
    //         iterator.uid
    //       );
    //       this.uidsOrdenados[condicionales.condfin[0]].hijos_uid = hijos
    //         ? JSON.stringify(hijos)
    //         : '';
    //     }
    //     this.uidsOrdenados[iterator.uid].duracion = condicionales.duracion;
    //     this.uidsOrdenados[iterator.uid].fechafin = condicionales.fechafin;
    //     this.uidsOrdenados[iterator.uid].fechaini = condicionales.fechaini;
    //     this.uidsOrdenados[iterator.uid].duraciontot =
    //       condicionales.duraciontot;
    //   }
    // }

    // for await (const iterator of this.dataPrincipal) {
    //   console.log('iterator2', iterator)
    //   if (iterator.unidad && iterator.hijos_uid && !iterator.referenciados) {
    //     await this.actualizarEnlazados(iterator, false);
    //   }
    //   iterator.filaEditada = true;
    // }
    // await this.actualizarTitulos2();
    for (const element of this.dataPrincipal) {
      if (element.unidad && !element.indice_ref_hito) {
        if (
          (element.hijos_uid && !element.referenciados) ||
          (!element.referenciados && !element.condfin && !element.condini)
        ) {
          const diasCorregidos = await this.correcionFechas(element);
          if (
            element.fechaini !== diasCorregidos.fi ||
            element.fechafin !== diasCorregidos.ff
          ) {
            element.fechaini = diasCorregidos.fi;
            element.fechafin = diasCorregidos.ff;
            element.filaEditada = true;
          }
        }
      }
    }
    for (const element of this.dataPrincipal) {
      if (element.unidad && !element.indice_ref_hito) {
        if (element.hijos_uid && !element.referenciados) {
          await this.actualizarEnlazados(element, false);
          
        }
        element.filaEditada = true;
      }
    }
    await this.actualizarTitulos2();
    // console.table(this.dataPrincipal,['item','duracion' ,'fechaini','fechafin','condini','condfin'])
  }

  async correcionFechas(row) {
    let fiCorrecta = null;
    let ffCorrecta = null;
    let fecha = row.fechaini;
    let validoini = false;
    while (!validoini) {
      const nombreDia = moment
        .weekdays(moment(fecha).day())
        .toLocaleUpperCase();
      const nolabo = this.arrayDiasNoLabEdit.includes(nombreDia);
      const existe = await this.tablaferiados.find(
        (ele) => moment(ele.fecha).format('YYYY-MM-DD') == fecha
      );
      if (!nolabo && !existe) {
        validoini = true;
      } else {
        fecha = moment(fecha).add(1, 'days').format('YYYY-MM-DD');
      }
    }
    fiCorrecta = fecha;
    // console.log('fiCorrecta', JSON.parse(JSON.stringify(fiCorrecta)))
    let dias = row.duracion;
    let inicio = JSON.parse(JSON.stringify(fiCorrecta));
    if (dias == 1) {
      ffCorrecta = fiCorrecta;
    } else {
      dias--;
      while (dias > 0) {
        inicio = moment(inicio).add(1, 'days').format('YYYY-MM-DD');
        // console.log('inicio',inicio)
        const nombreDia = moment
          .weekdays(moment(inicio).day())
          .toLocaleUpperCase();
        const nolabo = this.arrayDiasNoLabEdit.includes(nombreDia);
        const existe = await this.tablaferiados.find(
          (ele) => moment(ele.fecha).format('YYYY-MM-DD') == inicio
        );
        // console.log('comp',nolabo,existe, dias)
        if (!nolabo && !existe) {
          dias--
        }
      }
      ffCorrecta = inicio
    }

    return { fi: fiCorrecta, ff: ffCorrecta };
  }

  async cambioColor(event) {}

  async closeSelect() {}

  openAutocompletarRolDeColaborador(event) {
    setTimeout(() => {
      this.ngSelectAutomcompletarRol.open();
    }, 100);
  }

  async generarReporte() {
    if (this.existetemp) {
      this.toaster.error(
        'Guarde o descarte los cambios no almacenados en la vista programacion de obra',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
    } else {
      this.mostrar_carga_todo = true;
      const tablaHeader = [
        'ITEM',
        'DESCRIPCION',
        'UNIDAD',
        'METRADO',
        'RENDIMIENTO',
        'TIEMPO UNITARIO',
        'FACTOR CUADRILLA',
        'DIAS HABILES',
        'PRESUPUESTO',
      ];
      const keys_body = [
        'item',
        'descripcion',
        'unidad',
        'metrado',
        'rendimiento',
        'tiempoUnitario',
        'cuadrilla',
        'duracion',
        'parcial',
      ];
      const col_alig = [
        'left',
        'left',
        'center',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
      ];
      let tabla = [];
      for (const row of this.dataPrincipal) {
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
        tabla.push({
          item: row.item,
          descripcion: descp,
          unidad: row.unidad,
          metrado: row.unidad ? this.formsService.redondeo(row.metrado, 2) : '',
          rendimiento: row.unidad ? row.rendimiento : '',
          tiempoUnitario: row.unidad
            ? this.formsService.redondeo(row.tiempoUnitario, 3)
            : '',
          cuadrilla: row.unidad
            ? this.formsService.redondeo(row.cuadrilla, 3)
            : '',
          duracion: row.unidad ? row.duracion : '',
          parcial: row.unidad ? this.formsService.redondeo(row.parcial, 2) : '',
          tipoletra: tipol,
          color: colorl == 'unset' ? '' : colorl,
          fondo: fondol == 'none' ? '' : fondol,
        });
      }
      const datos = {
        datos_proyecto: this.dataProyecto,
        header: tablaHeader,
        keys_body: keys_body,
        col_alig: col_alig,
        tabla: tabla,
        tabla2: [],
        concat_tabla2: true,
        tipo_reporte: 0,
        orientacion: '',
        moneda: this.simbolo, // condicionar
        titulo: 'PROGRAMACIÓN DE TIEMPOS',
      };
      const modalRef = this.modalService.open(ReportesComponent, {
        size: 'lg modalgrande',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.datos = datos;
      const result = await modalRef.result;
      this.mostrar_carga_todo = false;
    }
  }


  start(){//temporales
    try{
      if(!this.running){
        this.running=true;
        this.startTimer=setInterval(async ()=>{
          this.tiempo++;
          if(this.tiempo==5){
            //temporales
            // this.GuardTemp(this.id_proyecto,this.id_user,this.ultindice,this.datasourcePri,this.datasourcePriacu,this.datasourcePrisub,this.inserta,this.modifica,this.elimina,this.insertaacu,this.modificaacu,this.eliminaacu);
            this.guardarTemporal(this.dataPrincipal,this.prograNoActua,this.hitosEliminados)
          }
        },1000);
      }
      else{
        this.stop();
      }
    }catch(ex){
      console.log(ex)
    }
  }//temporales

  compressTextAsync(text: string): Promise<string> {//temporales
    return new Promise((resolve, reject) => {
      if (this.worker) {
        this.worker.postMessage({ action: 'compress', text });
        this.worker.onmessage = (e) => {
          const { action, result } = e.data;
          if (action === 'compressed') {
            resolve(result);
          }
        };
        this.worker.onerror = (error) => {
          reject(error);
        };
      } else {
        reject('El Web Worker no está disponible.');
      }
    });
  }//temporales

  stop(){//temporales
    clearInterval(this.startTimer);
    this.running=false;
    this.tiempo=0;
  }
  restart(){//temporales
    clearInterval(this.startTimer);
    this.running=false;
    this.tiempo=0;
    this.start();
  }
  start2(){//temporales
    try{
      this.timer2=setInterval(async ()=>{
        // console.log('timer2',this.bloqtemp)
        if(!this.bloqtemp){
          this.start();
          this.stop2();
        }
      },1000);
    }catch(ex){
      console.log(ex)
    }
  }
  stop2(){//temporales
    this.initim2=false;
    clearInterval(this.timer2);
  }
  actualizarTemp(){
    if(this.bloqtemp && !this.initim2){//temporales
      // console.log('inicia timer2')
      this.initim2=true;
      this.start2();
    }
    else if(this.tiempo<5){
      this.restart();
    }//temporales
    this.existetemp=true;
  }
}
