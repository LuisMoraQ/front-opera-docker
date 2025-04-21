import { SwalService } from 'src/app/servicios/swal.service';
import {
  Component,
  HostListener,
  Input,
  OnInit,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  UntypedFormBuilder,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  UntypedFormArray,
} from '@angular/forms';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { FormulaPolinomicaService } from 'src/app/servicios/formula-polinomica.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { modalidades, estados } from '../parametros-principal';
import { ToastrService } from 'ngx-toastr';
import { ClasificacionService } from 'src/app/servicios/clasificacion.service';
import { AgrupacionProyectosComponent } from '../../agrupacion-proyectos/agrupacion-proyectos.component';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { BusqTitSubtPresuComponent } from '../../../presupuesto/busq-tit-subt-presu/busq-tit-subt-presu.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportesComponent } from '../../reportes/reportes.component';
import * as moment from 'moment';
@Component({
  selector: 'app-aspectos-generales',
  templateUrl: './aspectos-generales.component.html',
  styleUrls: ['./aspectos-generales.component.scss'],
})
export class AspectosGeneralesComponent implements OnInit {
  paises;
  monedas;
  modalidades = modalidades;
  estados = estados;
  @Input('height') height: number = 100;
  @Output() tabChange = new EventEmitter<any>();
  esSecund = false;
  idnav;
  bloqconf = false;
  solover;
  mostrar_carga = false;
  mostrar_carga_todo = false;
  id_proyecto;
  permiso: boolean;
  escreador;
  decimales;
  prueba;
  ind_tab;
  colores;
  tipoProy;
  decima;
  moneda;
  monedaaux;
  aspectosGen;
  indice_tab;
  tabs = [];
  allform;
  prueba2;
  descripcion;
  dec_metrado = 2;
  mask_metrado = '0.2';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  idUsuario
  
  @Input() set tabproyecto(value: any) {
    this.prueba = value.get('aspectos_generales').value.datos_recuperado;
    this.allform = value;
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    this.idnav = aspectosGen.get('opcion_seleccionada').value;
    this.decimales = value.get('decimal').value;
    this.escreador = value.get('escreador').value;
    this.idUsuario = datosrec.value.id_usuario;
    this.indice_tab = value.get('indice_tab').value;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    this.moneda=datosrec.value.simbolo
  }
  departamentos = [];
  async listarDepartamentos() {
    this.departamentos = await this.configuracionService.Departamento();
  }
  async GuardarConfigsDec(tab: any) {
    //cambiar opcion del back para validar cuales se van a guardar, mantener la informacion de los decimales recuperados
    try {
      //detectar cambios en decimales para hacer el calculo o no de todo el proyecto
      let valdec = this.decimales.split('|');
      if (
        valdec[0] != this.frmdecmetrado.value.toString() ||
        valdec[1] != this.frmdecprecio.value.toString() ||
        valdec[2] != this.frmdecparcial.value.toString() ||
        valdec[3] != this.frmdeccant.value.toString()
      ) {
        const sw = await SwalService.confirm(
          'Advertencia',
          'Se volvera a calcular las operaciones en el Presupuesto. El proceso puede demorar.'
        );
        if (sw.isConfirmed) {
          //papelera
          this.mostrar_carga_todo = true;
          let presutemp = await this.presuservice.ListarPresupuestoTemp({
            id_proyecto: this.id_proyecto,
            id_usuario: this.idUsuario,
          });
          let metradotemp =
            await this.formulaservice.listarCambiosTemporalesFormulaPolinomica({
              id_proyecto: this.id_proyecto,
              id_usuario: this.idUsuario,
            });
          let exismtemp = metradotemp
            ? JSON.parse(metradotemp.datatemp).length > 0
            : false;
          let formulatemp =
            await this.metradoservice.listarCambiosTemporalesMetrado2({
              id_proyecto: this.id_proyecto,
              id_usuario: this.idUsuario,
            });
          let progratemp =
            await this.principalService.listarCambiosTemporalesProgramacion({
              id_proyecto: this.id_proyecto,
              id_usuario: this.idUsuario,
            });
          let exisptemp = progratemp
            ? JSON.parse(progratemp.dataprogra).dataPrincipal.length > 0
            : false;
          if (
            presutemp.length <= 0 &&
            !exismtemp &&
            formulatemp.length <= 0 &&
            !exisptemp
          ) {
            //condicionar para que no haya temporales
            console.time('timemoddec');
            const datospas = {
              id_proyecto: this.id_proyecto,
              dec_metrado: this.frmdecmetrado.value,
              dec_precio: this.frmdecprecio.value,
              dec_parcial: this.frmdecparcial.value,
              dec_cant: this.frmdeccant.value,
            };
            let respuesta = await this.principalService.ModificarConfigDecProy(
              datospas
            );
            console.timeEnd('timemoddec');
            if (respuesta != null) {
              if (respuesta.id == 1) {
                //recalcular todo el proyecto
                this.decimales =
                  this.frmdecmetrado.value +
                  '|' +
                  this.frmdecprecio.value +
                  '|' +
                  this.frmdecparcial.value +
                  '|' +
                  this.frmdeccant.value;
                const emitir = {
                  campo: 'decimal',
                  valor: this.decimales,
                  tab: this.indice_tab,
                };
                this.tabChange.emit(emitir);
                this.mostrar_carga_todo = false;
                SwalService.success(
                  'Correcto',
                  'La cambios se guardaron correctamente.'
                );
              } else {
                this.mostrar_carga_todo = false;
                SwalService.error('Advertencia', respuesta.mensaje);
              }
            }
          } else {
            this.mostrar_carga_todo = false;
            this.toaster.info(
              'Existen cambios temporales, guardar antes de realizar cambios aqui.',
              'Información',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              }
            );
          }
        }
      } else {
        this.toaster.info('No hay cambios para guardar.', 'Información', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error(
        'Advertencia',
        'Ocurrio una excepción al momento de realizar la operación.'
      );
    }
  }
  async cambioSubMenu(opcionSubmenu) {
    this.idnav = opcionSubmenu;
    if (opcionSubmenu == '3') {
      this.mostrar_carga = true;
      this.mostrar_carga = false;
    } else if (opcionSubmenu == '2') {
      this.cargarDatosConf(this.id_proyecto);
    } else if (opcionSubmenu == '1') {
    }
  }

  async GuardarConfigsColor(tab) {
    //cambiar opcion del back para validar cuales se van a guardar, mantener la informacion de los decimales recuperados
    try {
      //detectar cambios en decimales para hacer el calculo o no de todo el proyecto
      this.mostrar_carga = true;
      let colorpre = '';
      let letrapre = '';
      let tipopre = '';
      let colorcro = '';
      let letracro = '';
      let tipocro = '';
      for (let i = 0; i < this.dataSourceColor.length; i++) {
        if (i < this.dataSourceColor.length - 1) {
          colorpre = colorpre + this.dataSourceColor[i].presupuesto + '|';
          letrapre = letrapre + this.dataSourceColor[i].presupuestoletra + '|';
          tipopre = tipopre + this.dataSourceColor[i].presupuestotipo + '|';
          colorcro = colorcro + this.dataSourceColor[i].cronograma + '|';
          letracro = letracro + this.dataSourceColor[i].cronogramaletra + '|';
          tipocro = tipocro + this.dataSourceColor[i].cronogramatipo + '|';
        } else {
          colorpre = colorpre + this.dataSourceColor[i].presupuesto;
          letrapre = letrapre + this.dataSourceColor[i].presupuestoletra;
          tipopre = tipopre + this.dataSourceColor[i].presupuestotipo;
          colorcro = colorcro + this.dataSourceColor[i].cronograma;
          letracro = letracro + this.dataSourceColor[i].cronogramaletra;
          tipocro = tipocro + this.dataSourceColor[i].cronogramatipo;
        }
      }
      const datospas = {
        id_proyecto: this.id_proyecto,
        colorPresupuesto: colorpre,
        letraPresupuesto: letrapre,
        tipoPresupuesto: tipopre,
        colorCronograma: colorcro,
        letraCronograma: letracro,
        tipoCronograma: tipocro,
        colorPlan: '',
        letraPlan: '',
        tipoPlan: '',
      };
      let respuesta = await this.principalService.ModificarConfigColProy(
        datospas
      );
      this.mostrar_carga = false;
      if (respuesta != null) {
        if (respuesta.id == 1) {
          let datos = {
            colorCronograma: colorcro,
            colorPresupuesto: colorpre,
            letraCronograma: letracro,
            letraPresupuesto: letrapre,
            tipoCronograma: tipocro,
            tipoPresupuesto: tipopre,
          };
          const emitir = {
            campo: 'aspectab',
            valor: JSON.stringify(datos),
            tab: this.indice_tab,
          };
          this.tabChange.emit(emitir);
          SwalService.success(
            'Correcto',
            'Los cambios se guardaron correctamente.'
          );

          // const proyecto = (this.allform.controls[tab] as UntypedFormGroup)
          // const aspectab = (proyecto.get('aspectab') as UntypedFormControl)

          // aspectab.setValue(JSON.stringify(datos));
          // localStorage.setItem('tabs', JSON.stringify(this.allform.value))
        } else {
          SwalService.error(
            'Advertencia',
            'Ocurrio una excepción al momento de realizar la operación.'
          );
        }
      }
    } catch (e) {
      this.mostrar_carga = false;
      console.log(e);
      SwalService.error(
        'Advertencia',
        'Ocurrio una excepción al momento de realizar la operación.'
      );
    }
  }
  tipoletra = [
    { id: '1', nombre: 'Normal' },
    { id: '2', nombre: 'Cursiva' },
    { id: '3', nombre: 'Negrita' },
    { id: '4', nombre: 'Cursiva Negrita' },
  ];
  reasignarColor(eve: any, ind: any) {
    this.dataSourceColor[ind].presupuestoletra = eve.target.value;
  }
  Sincolor1(eve: any, ind: any) {
    if (eve.target.checked) {
      this.dataSourceColor[ind].presupuesto = 'none';
    } else {
      this.dataSourceColor[ind].presupuesto = '#ffffff';
    }
  }
  reasignarColor1(eve: any, ind: any) {
    this.dataSourceColor[ind].presupuesto = eve.target.value;
  }
  filastabla = [
    {
      detalle: 'Titulo',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 01',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 02',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 03',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 04',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 05',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 06',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 07',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 08',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 09',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Sub Titulo 10',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Partida',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
    {
      detalle: 'Desglose Partidas',
      presupuestoletra: 'unset',
      presupuestotipo: '1',
      presupuesto: 'none',
      cronogramaletra: 'unset',
      cronogramatipo: '1',
      cronograma: 'none',
    },
  ];
  cambiarcolor(value, i, columna) {
    if (columna == 'cronograma') {
      this.dataSourceColor[i].cronograma = value;
    }
    if (columna == 'presupuesto') {
      this.dataSourceColor[i].presupuesto = value;
    }
    if (columna == 'presupuestoletra') {
      this.dataSourceColor[i].presupuestoletra = value;
    }
    if (columna == 'presupuestotipo') {
      this.dataSourceColor[i].presupuestotipo = value;
    }
    if (columna == 'cronogramaletra') {
      this.dataSourceColor[i].cronogramaletra = value;
    }
    if (columna == 'cronogramatipo') {
      this.dataSourceColor[i].cronogramatipo = value;
    }
  }
  dataSourceColor = [];

  public Frmdecimales = new UntypedFormGroup({
    metrado: new UntypedFormControl('4'),
    precio: new UntypedFormControl('2'),
    parcial: new UntypedFormControl('2'),
    cantidad: new UntypedFormControl('4'),
  });
  get frmdecmetrado(): UntypedFormControl {
    return this.Frmdecimales.get('metrado') as UntypedFormControl;
  }
  get frmdecprecio(): UntypedFormControl {
    return this.Frmdecimales.get('precio') as UntypedFormControl;
  }
  get frmdecparcial(): UntypedFormControl {
    return this.Frmdecimales.get('parcial') as UntypedFormControl;
  }
  get frmdeccant(): UntypedFormControl {
    return this.Frmdecimales.get('cantidad') as UntypedFormControl;
  }
  async cargarDatosConf(idproy) {
    try {
      this.mostrar_carga = true;
      this.bloqconf = true;
      this.dataSourceColor = this.filastabla;
      let respuesta = await this.principalService.ListarConfigProy({
        id_proyecto: idproy,
      });
      if (respuesta != null) {
        this.Frmdecimales = this.formBuilder.group({
          metrado: [respuesta.dec_metrado],
          precio: [respuesta.dec_precio],
          parcial: [respuesta.dec_parcial],
          cantidad: [respuesta.dec_cant],
        });
        for (let i = 0; i < this.dataSourceColor.length; i++) {
          this.dataSourceColor[i].presupuesto = respuesta.colorPresupuesto
            .toString()
            .split('|')[i];
          this.dataSourceColor[i].presupuestoletra = respuesta.letraPresupuesto
            .toString()
            .split('|')[i];
          this.dataSourceColor[i].presupuestotipo = respuesta.tipoPresupuesto
            .toString()
            .split('|')[i];
          this.dataSourceColor[i].cronograma = []; //respuesta.colorCronograma.toString().split('|')[i];
          this.dataSourceColor[i].cronogramaletra = []; //respuesta.letraCronograma.toString().split('|')[i];
          this.dataSourceColor[i].cronogramatipo = []; //respuesta.tipoCronograma.toString().split('|')[i];
        }
      }
      this.bloqconf = false;
      this.mostrar_carga = false;
    } catch (ex) {
      console.log(ex);
      this.bloqconf = false;
      this.mostrar_carga = false;
    }
  }
  constructor(
    private configuracionService: ConfiguracionService,
    private catalogosService: CatalogosService,
    private encriptadorService: EncriptadorService,
    private modalService: NgbModal,
    private _ClasificacionService: ClasificacionService,
    private principalService: PrincipalService,
    private formBuilder: UntypedFormBuilder,
    private presuservice: PresupuestosService,
    public formService: FormsService,
    private changeDetector: ChangeDetectorRef,
    private formulaservice: FormulaPolinomicaService,
    private metradoservice: MetradoService,
    private toaster: ToastrService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var windowHeight = window.innerHeight;
    var resto = 220;
    if (document.body.clientWidth <= 992) {
      resto = 240;
    }
    this.height = windowHeight - resto;
    return;
  }
  OtroPais: boolean = false;
  myGroup = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    id_clasificacion: new UntypedFormControl('', [Validators.required]),
    modalidad: new UntypedFormControl('', [Validators.required]),
    id_grupo: new UntypedFormControl('', [Validators.required]),
    moneda: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('', [Validators.required]),
    cod_pais: new UntypedFormControl('', []),
    departamento: new UntypedFormControl('', []),
    otrodepartamento: new UntypedFormControl('', []),
    otraprovincia: new UntypedFormControl('', []),
    otrodistrito: new UntypedFormControl('', []),
    distrito: new UntypedFormControl('', []),
    provincia: new UntypedFormControl('', []),
    direccion: new UntypedFormControl('', []),
    fecha_elaboracion: new UntypedFormControl('', [
      Validators.required,
      this.fechaElaboracionValidator(),
    ]),
    plazo: new UntypedFormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(5000),
    ]),
    fecha_inicio: new UntypedFormControl('', [
      Validators.required,
      this.fechaElaboracionValidator(),
    ]),
    fecha_culmina: new UntypedFormControl('', [
      Validators.required,
      this.fechaElaboracionValidator(),
    ]),
  });
  get departamento(): UntypedFormControl {
    return this.myGroup.get('departamento') as UntypedFormControl;
  }
  get distrito(): UntypedFormControl {
    return this.myGroup.get('distrito') as UntypedFormControl;
  }
  get provincia(): UntypedFormControl {
    return this.myGroup.get('provincia') as UntypedFormControl;
  }
  get cod_pais(): UntypedFormControl {
    return this.myGroup.get('cod_pais') as UntypedFormControl;
  }
  get plazo(): UntypedFormControl {
    return this.myGroup.get('plazo') as UntypedFormControl;
  }
  get fecha_elaboracion(): UntypedFormControl {
    return this.myGroup.get('fecha_elaboracion') as UntypedFormControl;
  }
  get fecha_inicio(): UntypedFormControl {
    return this.myGroup.get('fecha_inicio') as UntypedFormControl;
  }
  get fecha_culmina(): UntypedFormControl {
    return this.myGroup.get('fecha_culmina') as UntypedFormControl;
  }
  distritos = [];
  grupos = [];
  provincias = [];
  async CrearGrupo(carga=false) {
    this.mostrar_carga=true
    const usuarioEncontrado = JSON.parse(JSON.stringify(this.prueba))
    const form = this.myGroup;
    form.get('descripcion').setValue(usuarioEncontrado.descripcion);
    form.get('id_clasificacion').setValue(usuarioEncontrado.id_clasificacion);
    form.get('modalidad').setValue(usuarioEncontrado.modalidad);
    form.get('id_grupo').setValue(usuarioEncontrado.id_grupo);
    form.get('moneda').setValue(usuarioEncontrado.moneda);
    form.get('estado').setValue(usuarioEncontrado.estado);
    form.get('cod_pais').setValue(usuarioEncontrado.cod_pais);
    form.get('id_clasificacion').setValue(usuarioEncontrado.id_clasificacion);
    let idProvincia = '';
    let idDistrito = '';
    if (this.myGroup.get('cod_pais').value ==227) {
      this.OtroPais = false;
      if(!carga){
        await this.listarDepartamentos()
      }
      if (usuarioEncontrado.id_deptact) {
        this.provincias = await this.configuracionService.Provincia(
          this.prueba.id_deptact
        );
        form.get('departamento').setValue(usuarioEncontrado.id_deptact);
      }
      if (usuarioEncontrado.id_provact) {
        idProvincia =
          usuarioEncontrado.id_deptact + '-' + usuarioEncontrado.id_provact;
        this.distritos = await this.configuracionService.Distrito(
          usuarioEncontrado.id_deptact,
          usuarioEncontrado.id_provact
        );
        form.get('provincia').setValue(idProvincia);
      }
      if (usuarioEncontrado.id_distact) {
        idDistrito =
          usuarioEncontrado.id_deptact +
          '-' +
          usuarioEncontrado.id_provact +
          '-' +
          usuarioEncontrado.id_distact;
          setTimeout(() => {
            form.get('distrito').setValue(idDistrito);
          });
      }
    } else {
      this.OtroPais = true;
      if (usuarioEncontrado.cui) {
        const valores = usuarioEncontrado.cui.split('|');
        form.get('otrodepartamento').setValue(valores[0]);
        form.get('otraprovincia').setValue(valores[1]);
        form.get('otrodistrito').setValue(valores[2]);
      }
    }
    const fecha_elaboracion = this.prueba.fecha_elaboracion
      ? moment(this.prueba.fecha_elaboracion).format('YYYY-MM-DD')
      : '';
    const fecha_inicio = this.prueba.fecha_inicio
      ? moment(this.prueba.fecha_inicio).format('YYYY-MM-DD')
      : '';
    const fecha_culmina = this.prueba.fecha_culmina
      ? moment(this.prueba.fecha_culmina).format('YYYY-MM-DD')
      : '';
    form.get('direccion').setValue(usuarioEncontrado.direccion);
    form.get('fecha_elaboracion').setValue(fecha_elaboracion);
    form.get('plazo').setValue(usuarioEncontrado.plazo);
    form.get('fecha_inicio').setValue(fecha_inicio);
    form.get('fecha_culmina').setValue(fecha_culmina);
    form.disable();
    this.mostrar_carga=false
  }
  TeclaCalcFin(event: any) {
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  async ngOnInit() {
    await this.onResize(null);
    this.idUadmin = await this.encriptadorService.recuperarlocalstory('id_admin');
    this.permiso = (!this.solover||this.idUadmin== this.idUsuario)? true:false
    let decimales = this.encriptadorService.recuperarlocalstory('decimales');
    if (decimales?.toString().includes('|')) {
      let arrdec = decimales.split('|');
      this.dec_metrado = arrdec[0];
      this.mask_metrado = '0.' + arrdec[0];
      this.dec_precio = arrdec[1];
      this.mask_precio = '0.' + arrdec[1];
      this.dec_parcial = arrdec[2];
      this.mask_parcial = '0.' + arrdec[2];
    }
    await this.listarPaises();
    await this.FindTotal()
    await this.listarClasificacionProyectos();
    await this.listarGrupos();
    await this.CrearGrupo()
  }
  totaldir
  abretotal
  FindTotal(){
    let aspectosGen = (this.allform.get('aspectos_generales') as UntypedFormGroup)
    let datosrec = aspectosGen.get('tabla_prueba') as UntypedFormGroup;
    // console.log(datosrec.value.totdir)
    this.abretotal='CD'
    this.totaldir=datosrec.value.totdir
  }
  findabrev(input){
    let aspectosGen = (this.allform.get('aspectos_generales') as UntypedFormGroup)
    let datosrec = aspectosGen.get('tabla_prueba') as UntypedFormGroup;
    let tabla2=datosrec.value.totind
    const encontrado= tabla2.find((item)=>item.abrev==input)
    if(encontrado){
      return encontrado?.monto
    }else{
      return this.totaldir
    }
  }
  async listarPaises() {
    this.paises = await this.configuracionService.listarPaises();
    this.monedas = await this.configuracionService.listarMonedas();
  }
  async listarGrupos() {
    const input = { activo: '1', id_usuario: this.idUsuario, fuente: 1 };
    this.grupos = await this.configuracionService.listarGrupoProyecto(input);
  }
  async verGrupoProyecto() {
    const modalRef = this.modalService.open(AgrupacionProyectosComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false,
    });
    const result = await modalRef.result;
    if (result) {
      if (result.datos.length > 0) {
        this.grupos = result.datos;
      }
      if (result.actlista) {
        this.onListar();
      }
    }
  }
  clasificaciones = [];
  async listarClasificacionProyectos() {
    try {
      const input = { activo: '1' };
      this.clasificaciones =
        await this._ClasificacionService.ListarClasificacion(input);
    } catch (e) {
      console.log(e);
      SwalService.error();
    }
  }
  fechaElaboracionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Si no hay valor, no aplicar validación
      }
      const fechaElaboracion = new Date(control.value);
      const fechaActual = new Date();
      // Calcular las fechas límites
      const fechaLimiteInferior = new Date(fechaActual);
      fechaLimiteInferior.setFullYear(fechaActual.getFullYear() - 25); // 25 años antes de la fecha actual
      const fechaLimiteSuperior = new Date(fechaActual);
      fechaLimiteSuperior.setFullYear(fechaActual.getFullYear() + 25); // 25 años después de la fecha actual
      // Validación: la fecha debe estar dentro del rango
      if (
        fechaElaboracion < fechaLimiteInferior ||
        fechaElaboracion > fechaLimiteSuperior
      ) {
        return {
          fechaInvalida:
            'La fecha debe estar entre 25 años antes y 25 años después de la fecha actual.',
        };
      }
      return null; // Si es válida
    };
  }
  async habilitarEdicionDatosProyecto() {
    if (this.permiso) {
      this.myGroup.enable();
    } else {
      this.myGroup.disable();
    }
    this.permiso = !this.permiso;
  }
  async cancelarEditarDatosProyecto() {
    await this.CrearGrupo(true);
    await this.habilitarEdicionDatosProyecto();
  }
  calculandofecha = false;
  listaFeriados = [];
  arrayDiasNoLab = [];
  fechIniAlm: string;
    async CalculaFechaFin(nrotab: any,valmod:any) {
      // let aspectos_generales = (this.allform.get('aspectos_generales') as UntypedFormGroup)
      // let datosProyecto = (aspectos_generales.get('datos_proyecto') as UntypedFormGroup)
      let datosProyecto=this.myGroup
      let fiform = datosProyecto.value.fecha_inicio!=''?moment(datosProyecto.value.fecha_inicio).format('YYYY-MM-DD'):'';
      let fcform = datosProyecto.value.fecha_culmina!=''?moment(datosProyecto.value.fecha_culmina).format('YYYY-MM-DD'):'';
      let plazoform = datosProyecto.value.plazo
      if(valmod==0){//plazo
        let plazores=!isNaN(Number(plazoform))?plazoform:1;
        if(plazores==null || plazores=='' || plazores==0){
          datosProyecto.get('fecha_culmina').setValue(moment(fiform).format('YYYY-MM-DD'))
          datosProyecto.get('plazo').setValue(1);
        }
        else{
          if(fiform){
            let fechaf=new Date(fiform);
            this.calculandofecha=true;
            fechaf.setDate(fechaf.getDate()+Number(plazores))
            this.calculandofecha=false;
            datosProyecto.get('fecha_culmina').setValue(moment(fechaf).format('YYYY-MM-DD'))
          }
        }
      }else if(valmod==1){//inicio
        if(fiform){
          const nombDiaFi = moment(fiform).format('dddd').toUpperCase()
          const fechai = moment(fiform).format('YYYY-MM-DD')
   
          if(this.listaFeriados.includes(fechai) || this.arrayDiasNoLab.includes(nombDiaFi)) {
            datosProyecto.get('fecha_culmina').setValue(this.fechIniAlm)
            this.toaster.error('La fecha ingresada esta registrada como dia no laborable', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            return
          }
  
          let plazores=!isNaN(Number(plazoform))?plazoform:0;
          if(plazores==null || plazores==''){
            datosProyecto.get('fecha_culmina').setValue(moment(fiform).format('YYYY-MM-DD'))
          }
          else{
            let fechaf=new Date(fiform);
            this.calculandofecha=true;
            fechaf.setDate(fechaf.getDate()+Number(plazores))
            this.calculandofecha=false;
            datosProyecto.get('fecha_culmina').setValue(moment(fechaf).format('YYYY-MM-DD'))
          }
        }
      }else if(valmod==2){//culmina
        if(fcform!=''){
          if(fiform!=''){
            //fecha culmina menor, error, asignar fecha actual plazo 1 dia
            let fechaa = moment(fiform);
            let fechab = moment(fcform);
            let difdias=fechab.diff(fechaa, 'days');
            if(difdias<0){
              this.toaster.error('La Fecha de Culminación no puede ser menor a la Fecha Inicial.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              datosProyecto.get('fecha_culmina').setValue(moment(fiform).format('YYYY-MM-DD'))
              datosProyecto.get('plazo').setValue(1);
            }
            else{
              datosProyecto.get('plazo').setValue(difdias+1)
            }
          }
        }
      }
    }
  async actualizarDatosProyecto(nroProyecto) {
    const datosProyecto = this.prueba
    const formulario=this.myGroup.value
    try {
      let fechainicioInvalida = false;
      var fechaSeleccionado = new Date(formulario.fecha_inicio);
      const Fi = moment(formulario.fecha_inicio).format('YYYY-MM-DD');
      const arrayDays = [
        'Lunes',
        'Martes',
        'Miercoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
      ];
      var nombreDia = arrayDays[fechaSeleccionado.getDay()];
      let encontrado1 = false;
      let encontrado = false;
      const aspectos = await this.principalService.ListarAspectosDiasProy({
        id_proyecto: datosProyecto.id_proyecto,
      });
      if (aspectos[0].length > 0) {
        let diasnolabo = aspectos[0][0].nolabo1
          ? aspectos[0][0].nolabo1.toString().includes('|')
            ? aspectos[0][0].nolabo1.toString().split('|')
            : [aspectos[0][0].nolabo1.toString()]
          : [];
        if (aspectos[0][0]) {
          encontrado1 = diasnolabo.find((ele) => ele == nombreDia.toUpperCase())
            ? true
            : false;
        }
      }
      if (aspectos[1]) {
        encontrado = aspectos[1].find(
          (ele) => moment(ele.fecha).format('YYYY-MM-DD') == Fi && !ele.laborado
        );
      }
      fechainicioInvalida = encontrado || encontrado1 ? true : false;
      if (this.myGroup.invalid) {
        this.myGroup.markAllAsTouched();
        SwalService.error('Advertencia', 'Datos Incompletos');
        return;
      } else if (fechainicioInvalida) {
        this.toaster.error(
          'La Fecha Inicio Seleccionada es  dia no laborable',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
      } else {
        this.mostrar_carga_todo = true;
        const fiAnterior = moment(formulario.fecha_inicio).format(
          'YYYY-MM-DD'
        );
        const fiform = moment(this.myGroup.get('fecha_inicio').value).format(
          'YYYY-MM-DD'
        );
        if (fiAnterior !== fiform) {
          const sw = await SwalService.multiple(
            'Estas seguro?',
            'El cambio de fecha inicio modificara la programación'
          );
          if (sw.isConfirmed) {
            let progratemp =
              await this.principalService.listarCambiosTemporalesProgramacion({
                id_proyecto: this.id_proyecto,
                id_usuario: '',
              });
            if (progratemp) {
              this.toaster.error(
                'Existen cambios que no se guardaron en Programación. No puede hacer cambios hasta guardar los de Programación.',
                'Advertencia',
                {
                  closeButton: false,
                  positionClass: 'toast-bottom-right',
                  timeOut: 5000,
                }
              );
              this.mostrar_carga_todo = false;
              return;
            } else {
              const objeto = {
                id_proyecto: this.id_proyecto,
                duracion: '',
                fechaini: fiAnterior > fiform ? fiform : fiAnterior,
                fechafin: fiAnterior > fiform ? fiAnterior : fiform,
                posterior: 0,
              };
              const response = await this.principalService.fechaDespuesDuracion(
                objeto
              );
              const diasModificados =
                fiAnterior < fiform
                  ? Number(response.duracion) * 1
                  : Number(response.duracion) * -1;
              await this.principalService.desplazarProgramacion({
                id_proyecto: this.id_proyecto,
                diasmodificados: diasModificados,
              });
            }
          } else {
            await this.cancelarEditarDatosProyecto();
            this.mostrar_carga_todo = false;
            return;
          }
        }
        let descpasa = this.myGroup
          .get('descripcion')
          .value.toString()
          .toUpperCase()
          .trim()
          .replace(/\s+/g, ' '); //quitar saltos y espacios, solo mayuscula
        const modificarProyecto = {
          id_proyecto: this.id_proyecto,
          cui:this.myGroup.get('cod_pais').value===227? '':this.myGroup.get('otrodepartamento').value+'|'+ this.myGroup.get('otraprovincia').value+'|'+ this.myGroup.get('otrodistrito').value,
          descripcion: descpasa,
          id_clasificacion: this.myGroup.get('id_clasificacion').value,
          modalidad: this.myGroup.get('modalidad').value,
          id_grupo: this.myGroup.get('id_grupo').value,
          moneda: this.myGroup.get('moneda').value,
          estado: this.myGroup.get('estado').value,
          cod_pais: this.myGroup.get('cod_pais').value
            ? this.myGroup.get('cod_pais').value
            : '',
          id_localidad: this.myGroup.get('distrito').value
            ? this.myGroup.get('distrito').value
            : '',
          direccion: this.myGroup.get('direccion').value
            ? this.myGroup.get('direccion').value
            : '',
          fecha_elaboracion: this.myGroup.get('fecha_elaboracion').value
            ? this.myGroup.get('fecha_elaboracion').value
            : '',
          plazo: this.myGroup.get('plazo').value
            ? this.myGroup.get('plazo').value
            : '',
          fecha_inicio: this.myGroup.get('fecha_inicio').value
            ? this.myGroup.get('fecha_elaboracion').value
            : '',
          fecha_culmina: this.myGroup.get('fecha_culmina').value
            ? this.myGroup.get('fecha_culmina').value
            : '',
          id_usuario: this.idUsuario,
        };
        const response = await this.principalService.modificarProyecto(modificarProyecto);
        if (response.id == '1') {
          this.moneda=this.monedas.find((item)=>item.id_moneda==modificarProyecto.moneda).simbolo
          SwalService.success();
          await this.habilitarEdicionDatosProyecto();
          const emitir = {
            campo: 'datos_recuperado',
            valor: response,
            tab: this.indice_tab,
          };
          await this.tabChange.emit(emitir);
          this.onListar();
          this.mostrar_carga_todo = false;
        } else {
          SwalService.error('Advertencia', response.mensaje);
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error();
    }
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }
  async listarProvincias(idDepartamento: number) {
    this.provincias = [];
    this.distritos = [];
    this.provincia.setValue('');
    this.distrito.setValue('');
    if (!idDepartamento) {
      this.provincia.clearValidators();
      this.provincia.updateValueAndValidity();
      this.distrito.clearValidators();
      this.distrito.updateValueAndValidity();
      return;
    }
    this.provincia.setValidators([Validators.required]);
    this.provincia.updateValueAndValidity();
    this.distrito.setValidators([Validators.required]);
    this.distrito.updateValueAndValidity();
    this.provincias = await this.configuracionService.Provincia(idDepartamento);
  }
  async listarDistritos(idProvincia: string) {
    this.distritos = [];
    this.distrito.reset();
    this.distrito.setValue('');
    if (!idProvincia) {
      this.distrito.clearValidators();
      this.distrito.updateValueAndValidity();
      return;
    }
    const provincia = this.provincia.value.split('-');
    this.distritos = await this.configuracionService.Distrito(
      this.departamento.value,
      provincia[1]
    );
  }
  async CambiarPais(id) {
    const form = this.myGroup;
    if (id === '227') {
      await this.listarDepartamentos();
      this.OtroPais = false;
      form.get('otrodepartamento').setValue('');
      form.get('otrodistrito').setValue('');
      form.get('otraprovincia').setValue('');
    } else {
      this.OtroPais = true;
      form.get('departamento').setValue('');
      form.get('distrito').setValue('');
      form.get('provincia').setValue('');
    }
  }

  cambindiceselsubpresu(ind: any, nroProyecto: any) {
    const aspectos_generales = this.allform.get(
      'aspectos_generales'
    ) as UntypedFormGroup;
    const tabla = aspectos_generales.get('tabla_prueba') as UntypedFormGroup;
    if (ind == tabla.value.filaSeleccionada) tabla.value.filaSeleccionada = -1;
    else tabla.value.filaSeleccionada = ind;
  }
  buscando = false;
  dataSourceorg = [];
  tabSeleccionado = 1;
  idUadmin: any;
  GenerarItemord(item: string) {
    let itemord = '';
    let arrit = item.split('.');
    for (let i = 0; i < arrit.length; i++) {
      itemord =
        i == arrit.length - 1
          ? itemord + arrit[i].padStart(2 * arrit[i].length - 1, '_')
          : itemord + arrit[i].padStart(2 * arrit[i].length - 1, '_') + '.';
    }
    return itemord;
  }
  ActfilCambios(arrmodi: any, rowpri: any) {
    let eximodi = false; //actualizar en arreglo si existe
    for (let a = 0; a < arrmodi.length; a++) {
      if (rowpri.indice == arrmodi[a].indice) {
        arrmodi[a] = rowpri;
        eximodi = true;
      }
    }
    if (!eximodi) {
      arrmodi.push(rowpri);
    }
  }
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';

  async agregartitulo(nroProyecto: any) {
    const aspectos_generales = this.allform.get(
      'aspectos_generales'
    ) as UntypedFormGroup;
    const tabla = aspectos_generales.get('tabla_prueba') as UntypedFormGroup;
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({
      id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,
      id_usuario: this.idUsuario,
    });
    if (datoaccs?.length > 0) {
      if (datoaccs[0].presu == 0) {
        this.toaster.error(
          'No tiene Permisos para Edición de Presupuesto.',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }
    }
    let indact = tabla.value.filaSeleccionada;
    try {
      let presutemp = await this.presuservice.ExistePresuTemp({
        id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,
        id_usuario: this.idUsuario,
      });
      if (presutemp.length > 0) {
        this.toaster.error(
          'Tiene cambios sin guardar en Presupuesto. No puede modificar hasta guardar sus cambios.',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
      } else {
        let rpartidas = await this.catalogosService.ListarTitsubPartidas({
          id_usuario: this.idUsuario,
          fuente: '0',
          tipo_proy: aspectos_generales.value.datos_recuperado.id_clasificacion,
        }); //cambiar dinamico tipo_proy
        let arrtipoProy = await this._ClasificacionService.ListarClasificacion({
          activo: '1',
        });
        let opcfilasel = indact > -1 ? true : false;
        const modalRef = this.modalService.open(BusqTitSubtPresuComponent, {
          size: 'lg',
          backdrop: 'static',
          windowClass: 'pcoded',
          keyboard: false,
        });
        modalRef.componentInstance.partidas = rpartidas;
        modalRef.componentInstance.tipoProy = arrtipoProy; //cambiar por el arreglo de tipos de proyecto
        modalRef.componentInstance.estitulo = true;
        modalRef.componentInstance.opcfila = opcfilasel;
        modalRef.componentInstance.fondo = this.titulo1;
        modalRef.componentInstance.color = this.titulo1color;
        modalRef.componentInstance.letra = this.titulo1letra;
        modalRef.componentInstance.tipoproypasa =
          aspectos_generales.value.datos_recuperado.id_clasificacion;
        const result = await modalRef.result;
        if (result) {
          let itemsel = 'NULL';
          let itemini = '';
          let indins = -1;
          if (result.forma == '1') {
            itemini = '1';
            indins = 0;
            for (let i = 0; i < tabla.value.data_source.length; i++) {
              let separado = tabla.value.data_source[i].item
                .toString()
                .split('.');
              let longi = itemsel != 'NULL' ? itemsel.split('.').length : 1;
              let nuevonum = Number(separado[longi - 1]) + result.datos.length;
              separado[longi - 1] = nuevonum.toString();
              tabla.value.data_source[i].item = separado.join('.');
              tabla.value.data_source[i].itemord = this.GenerarItemord(
                separado.join('.')
              );
              this.ActfilCambios(
                tabla.value.data_source[i].accion == 1
                  ? tabla.value.inserta
                  : tabla.value.modifica,
                tabla.value.data_source[i]
              );
            }
          } else if (result.forma == '0') {
            if (tabla.value.data_source.length > 0) {
              let ultit =
                tabla.value.data_source[
                  tabla.value.data_source.length - 1
                ].item.split('.');
              let numult = Number(ultit[0]);
              itemini = (numult + 1).toString();
              indins = tabla.value.data_source.length; //hacer push al final
            } else {
              itemini = '1';
              indins = 0;
            }
          } else if (result.forma == '2' || result.forma == '3') {
            itemsel =
              indact > -1 ? tabla.value.data_source[indact].item : 'NULL';
            itemini = result.forma == '3' ? this.sigitem(itemsel) : itemsel; //buscar el item inicial para agregar
            let indpri = indact;
            let enco = false;
            //indact=result.forma=='2'?indact+result.datos.length:indact;
            if (itemsel.split('.').length == 1) {
              for (let i = indpri; i < tabla.value.data_source.length; i++) {
                var prefijo = tabla.value.data_source[i].item
                  .toString()
                  .substring(0, itemsel.length + 1);
                if (
                  (result.forma == '3' &&
                    tabla.value.data_source[i].item != itemsel &&
                    prefijo != itemsel + '.') ||
                  result.forma == '2'
                ) {
                  if (!enco) {
                    indins = i;
                    enco = true;
                  }
                  let separado = tabla.value.data_source[i].item
                    .toString()
                    .split('.');
                  let longi = itemsel != 'NULL' ? itemsel.split('.').length : 1;
                  let nuevonum =
                    Number(separado[longi - 1]) + result.datos.length;
                  separado[longi - 1] = nuevonum.toString();
                  tabla.value.data_source[i].item = separado.join('.');
                  tabla.value.data_source[i].itemord = this.GenerarItemord(
                    separado.join('.')
                  );
                  //actualizar en arreglo si existe
                  this.ActfilCambios(
                    tabla.value.data_source[i].accion == 1
                      ? tabla.value.inserta
                      : tabla.value.modifica,
                    tabla.value.data_source[i]
                  );
                }
              }
              if (indins == -1) {
                indins = tabla.value.data_source.length;
              }
            }
          }
          let indini = indins;
          let indmax = 0;
          for (let row of tabla.value.data_source) {
            if (row.indice > indmax) indmax = row.indice;
          }
          for (let filaadd of result.datos) {
            /* let filaagrega=this.nuevafilapri(this.ultindice++,itemini,filaadd.descripcion,'','',null,null,0,null,'',null,'',filaadd.id_partida,0,0,1,1,this.id_user,filaadd.descripcion); */
            let filaagrega = {
              id_proyecto:
                aspectos_generales.value.datos_recuperado.id_proyecto,
              indice: ++indmax, //null,
              item: itemini,
              descripcion: filaadd.descripcion,
              manoobra: 0,
              materiales: 0,
              equipos: 0,
              subcontratos: 0,
              subpartidas: 0,
              total: 0,
              responsable: this.idUsuario,
              id_partida: filaadd.id_partida,
              itempri: itemini,
              accion: 1,
            };
            itemini = this.sigitem(itemini);
            tabla.value.data_source.splice(indins++, 0, filaagrega);
            tabla.value.inserta.push(filaagrega);
          }
          tabla.value.filaSeleccionada = indini;
          tabla.value.editado = true;
          //this.actualizarTemp();
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  sigitem(itemant: string) {
    let arrauxagru = itemant.split('.');
    arrauxagru[arrauxagru.length - 1] = (
      Number(arrauxagru[arrauxagru.length - 1]) + 1
    ).toString();
    return arrauxagru.join('.');
  }
  async subirtitulo(nroProyecto: any) {
    const aspectos_generales = this.allform.get(
      'aspectos_generales'
    ) as UntypedFormGroup;
    const tabla = aspectos_generales.get('tabla_prueba') as UntypedFormGroup;
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({
      id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,
      id_usuario: this.idUsuario,
    });
    if (datoaccs?.length > 0) {
      if (datoaccs[0].presu == 0) {
        this.toaster.error(
          'No tiene Permisos para Edición de Presupuesto.',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }
    }
    let presutemp = await this.presuservice.ExistePresuTemp({
      id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,
      id_usuario: this.idUsuario,
    });
    if (presutemp.length > 0) {
      this.toaster.error(
        'Tiene cambios sin guardar en Presupuesto. No puede modificar hasta guardar sus cambios.',
        'Advertencia',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
    } else {
      let indact = tabla.value.filaSeleccionada;
      if (indact > -1) {
        if (indact > 0) {
          let filasub = JSON.parse(
            JSON.stringify(tabla.value.data_source[indact])
          );
          let filabaj = JSON.parse(
            JSON.stringify(tabla.value.data_source[indact - 1])
          );
          let itemsub = filasub.item;
          let itembaj = filabaj.item;
          filasub.item = itembaj;
          filabaj.item = itemsub;
          //fila modificada
          tabla.value.data_source[indact] = filabaj;
          if (tabla.value.data_source[indact].accion != 1)
            tabla.value.data_source[indact].accion = 2;
          this.ActfilCambios(
            tabla.value.data_source[indact].accion == 1
              ? tabla.value.inserta
              : tabla.value.modifica,
            tabla.value.data_source[indact]
          );
          //fila modificada
          tabla.value.data_source[indact - 1] = filasub;
          if (tabla.value.data_source[indact - 1].accion != 1)
            tabla.value.data_source[indact - 1].accion = 2;
          this.ActfilCambios(
            tabla.value.data_source[indact - 1].accion == 1
              ? tabla.value.inserta
              : tabla.value.modifica,
            tabla.value.data_source[indact - 1]
          );
          tabla.value.filaSeleccionada = indact - 1;
          tabla.value.editado = true;
        } else {
          this.toaster.error('La fila ya no puede subir.', 'Advertencia', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          });
        }
      } else {
        this.toaster.error('Seleccione una Fila para Mover.', 'Advertencia', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
      }
    }
  }
  async bajartitulo(nroProyecto: any) {
    const aspectos_generales = this.allform.get(
      'aspectos_generales'
    ) as UntypedFormGroup;
    const tabla = aspectos_generales.get('tabla_prueba') as UntypedFormGroup;
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({
      id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,
      id_usuario: this.idUsuario ,
    });
    if (datoaccs?.length > 0) {
      if (datoaccs[0].presu == 0) {
        this.toaster.error(
          'No tiene Permisos para Edición de Presupuesto.',
          'Advertencia',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }
    }
    let indact = tabla.value.filaSeleccionada;
    let presutemp = await this.presuservice.ExistePresuTemp({
      id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,
      id_usuario: this.idUsuario,
    });
    if (presutemp.length > 0) {
      this.toaster.error(
        'Tiene cambios sin guardar en Presupuesto. No puede modificar hasta guardar sus cambios.',
        'Advertencia',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
    } else {
      if (indact > -1) {
        if (indact < tabla.value.data_source.length - 1) {
          let filasub = JSON.parse(
            JSON.stringify(tabla.value.data_source[indact + 1])
          );
          let filabaj = JSON.parse(
            JSON.stringify(tabla.value.data_source[indact])
          );
          let itemsub = filasub.item;
          let itembaj = filabaj.item;
          filasub.item = itembaj;
          filabaj.item = itemsub;
          //fila modificada
          tabla.value.data_source[indact + 1] = filabaj;
          if (tabla.value.data_source[indact + 1].accion != 1)
            tabla.value.data_source[indact + 1].accion = 2;
          this.ActfilCambios(
            tabla.value.data_source[indact + 1].accion == 1
              ? tabla.value.inserta
              : tabla.value.modifica,
            tabla.value.data_source[indact + 1]
          );
          //fila modificada
          tabla.value.data_source[indact] = filasub;
          if (tabla.value.data_source[indact].accion != 1)
            tabla.value.data_source[indact].accion = 2;
          this.ActfilCambios(
            tabla.value.data_source[indact].accion == 1
              ? tabla.value.inserta
              : tabla.value.modifica,
            tabla.value.data_source[indact]
          );
          tabla.value.filaSeleccionada = indact + 1;
          tabla.value.editado = true;
        } else {
          this.toaster.error('La fila ya no puede bajar.', 'Advertencia', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          });
        }
      } else {
        this.toaster.error('Seleccione una Fila para Mover.', 'Advertencia', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
      }
    }
  }
  async CancelarSubpresu(nroProyecto: any) {
    const aspectos_generales = (this.allform.get('aspectos_generales') as UntypedFormGroup)
    const tabla = (aspectos_generales.get('tabla_prueba') as UntypedFormGroup)
    const datos_recuperado = (aspectos_generales.get('datos_recuperado') as UntypedFormGroup)
    const dataSource = await this.presuservice.ListarSubpresuProy({ id_proyecto: datos_recuperado.value.id_proyecto })
    tabla.get('data_source').setValue(dataSource)//corregir error stringfy
    let tot1 = 0;
    let tot2 = 0;
    let tot3 = 0;
    let tot4 = 0;
    let tot5 = 0;
    let totdir = 0;
    //let totindir=0;
    for (let row of dataSource) {
      tot1 += Number(row.manoobra);
      tot2 += Number(row.materiales);
      tot3 += Number(row.equipos);
      tot4 += Number(row.subcontratos);
      tot5 += Number(row.subpartidas);
      totdir += Number(row.total);
    }
    tabla.get('totmano').setValue(tot1);
    tabla.get('totmat').setValue(tot2);
    tabla.get('totequi').setValue(tot3);
    tabla.get('totsubc').setValue(tot4);
    tabla.get('totsubp').setValue(tot5);
    tabla.get('totdir').setValue(totdir);
    //tabla.get('totind').setValue(totindir);
    //tabla.get('totalproy').setValue(totindir+totdir);
    tabla.value.inserta = [];
    tabla.value.modifica = [];
    tabla.value.elimina = [];
    tabla.value.editado = false;
  }
  async GuardarSubpresu(nroProyecto: any) {
    try {
      this.mostrar_carga_todo = true;
      const aspectos_generales = (this.allform.get('aspectos_generales') as UntypedFormGroup)
      const tabla = (aspectos_generales.get('tabla_prueba') as UntypedFormGroup)
      const datos_recuperado = (aspectos_generales.get('datos_recuperado') as UntypedFormGroup)
      const tablaa = JSON.stringify(tabla.value.inserta);
      const tablab = JSON.stringify(tabla.value.modifica);
      const tablac = JSON.stringify(tabla.value.elimina);
      const body = JSON.stringify({
        'id_proyecto': datos_recuperado.value.id_proyecto,
        'id_usuario': this.idUsuario,
        'datos1': tablaa,
        'datos2': tablab,
        'datos3': tablac,
      });
      let resp = await this.presuservice.GuardarCambiosSubPresu(body);
      if (resp.id == '1') {
        const dataSource = await this.presuservice.ListarSubpresuProy({ id_proyecto: datos_recuperado.value.id_proyecto })
        let resind = await this.presuservice.ListarPresuIndirecto({ id_usuario: this.idUsuario, id_proyecto: datos_recuperado.value.id_proyecto, titulo: "0" });
        let arrind = [];
        if (resind.id == "1") {
          let tablapas=JSON.parse(resind.tabla);
          arrind = tablapas[0];
        }
        let aux = [];
        for (let row of arrind) {
          if (row.tipo_registro != '3')
            aux.push(row);
        }
        tabla.get('data_source').setValue(dataSource)//corregir error stringfy
        let tot1 = 0;
        let tot2 = 0;
        let tot3 = 0;
        let tot4 = 0;
        let tot5 = 0;
        let totdir = 0;
        for (let row of dataSource) {
          tot1 += Number(row.manoobra);
          tot2 += Number(row.materiales);
          tot3 += Number(row.equipos);
          tot4 += Number(row.subcontratos);
          tot5 += Number(row.subpartidas);
          totdir += Number(row.total);
        }
        tabla.get('totmano').setValue(tot1);
        tabla.get('totmat').setValue(tot2);
        tabla.get('totequi').setValue(tot3);
        tabla.get('totsubc').setValue(tot4);
        tabla.get('totsubp').setValue(tot5);
        tabla.get('totdir').setValue(totdir);
        tabla.get('totind').setValue(aux);
        //tabla.get('totalproy').setValue(totindir+totdir);
        tabla.value.inserta = [];
        tabla.value.modifica = [];
        tabla.value.elimina = [];
        tabla.value.editado = false;
        this.mostrar_carga_todo = false;
        this.toaster.success('Se guardó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
      else {
        this.mostrar_carga_todo = false;
        this.toaster.error(resp.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
    }
  }

  async onListar(cambiatab = false) {
    try {
      this.dataSourceorg = [];
      this.buscando = true;
      if(this.idUadmin!=this.idUsuario){
        let tabaux = await this.principalService.ListarProyectosSec(
          this.idUadmin
        );
        for (let a = 0; a < tabaux.length; a++) {
          if (tabaux[a].nro != '') {
            if (a == tabaux.length - 1) {
              tabaux.splice(a, 1);
              break;
            } else {
              if (tabaux[a + 1].id_grupo != tabaux[a].id_grupo) {
                tabaux.splice(a, 1);
                a--;
              }
            }
          }
        }
        this.dataSourceorg = tabaux;
        this.buscando = false;
      } else {
        this.dataSourceorg = await this.principalService.ListarProyectos(
          this.idUsuario
        );
        this.buscando = false;
        //si no hay proyectos mover a la pestana sistema?
        if (cambiatab && this.dataSourceorg.length < 5) {
          this.tabSeleccionado = 4;
        }
      }
    } catch {
      this.buscando = false;
    }
  }
  async enviarDataImpresion(index) {
    const formdata = this.allform.value
    const tablaprueba = formdata.aspectos_generales.tabla_prueba
    const tabla1 = formdata.aspectos_generales.tabla_prueba?.data_source
    const arrayHeader = ['ITEM', 'DETALLE DE ESTRUCTURA', 'MANO DE OBRA', 'MATERIALES', 'EQUIPOS', 'SUB CONTRATOS', 'SUB PARTIDAS', 'TOTAL']
    const arrayKeys = ['item', 'descripcion', 'manoobra', 'materiales', 'equipos', 'subcontratos', 'subpartidas', 'total']
    const arralig=['center','left','right','right','right','right','right','right'];
    const tablaSubPresupuesto = tabla1
    let monedapas=this.moneda;
    let tablaTotales = []
    const obj = [
      { text: 'COSTO DIRECTO', colSpan: 2 , tipoletra:'3',color:'',fondo:'',alinea:'left'},
      { text: tablaprueba.totmano, colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' },
      { text: tablaprueba.totmat, colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' },
      { text: tablaprueba.totequi, colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' },
      { text: tablaprueba.totsubc, colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' },
      { text: tablaprueba.totsubp, colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' },
      { text: tablaprueba.totdir, colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' }
    ]
    tablaTotales.push(obj)
    for (const iterator of tablaprueba.totind) {
      let formulaaux
      if(iterator.tipo_registro===4){
        formulaaux= iterator.abrev+'/'+(iterator.formula==''?this.abretotal:iterator.formula)+'='+(iterator.monto*100/(iterator.formula==''?this.totaldir:this.findabrev(iterator.formula))).toFixed(2)+'%'
      }else{
        formulaaux=iterator.formula
      }
      const obj2 = [
        { text: iterator.descripcion, colSpan: 4, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'left' },
        { text: iterator.abrev, colSpan: 1, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'center' },
        { text: formulaaux, colSpan: 1, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'center' },
        { text: this.formService.redondeo(Number(iterator.monto.toString()),this.dec_parcial), colSpan: 2, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'right' },
      ]
      tablaTotales.push(obj2)
    }
    const datos = {
      datos_proyecto: formdata.aspectos_generales.datos_recuperado,
      header: arrayHeader,
      keys_body: arrayKeys,
      col_alig:arralig,
      tabla: tablaSubPresupuesto,
      tabla2: tablaTotales,
      concat_tabla2:true,
      tipo_reporte:0,
      moneda:monedapas,
      titulo:'RESUMEN DEL PROYECTO',
    }
    const modalRef = this.modalService.open(ReportesComponent,{size: 'lg modalgrande',backdrop: 'static',windowClass: 'pcoded',keyboard: false});
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
}