import { ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators, UntypedFormBuilder, AbstractControl, ValidationErrors, ValidatorFn,FormGroup,FormArray} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { ClasificacionService } from 'src/app/servicios/clasificacion.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { VariablesGlobalesService } from 'src/app/servicios/variables-globales.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { paises, monedas, modalidades, estados } from '../principal/parametros-principal';
import { AgrupacionProyectosComponent } from './../agrupacion-proyectos/agrupacion-proyectos.component';
import { itemsMenu } from './menu-proyecto-list';
import { ModalProyectoComponent } from './modal-proyecto/modal-proyecto.component';
import { BusqTitSubtPresuComponent } from '../../presupuesto/busq-tit-subt-presu/busq-tit-subt-presu.component';
import { ComparteproyComponent } from './comparteproy/comparteproy.component';
import { FormulaPolinomicaService } from 'src/app/servicios/formula-polinomica.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { Router } from '@angular/router';
import { ReportesComponent } from '../reportes/reportes.component';
import { SignalrcustomService } from 'src/app/servicios/signalrcustom.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PrincipalComponent implements OnInit, OnDestroy {
  @Input('height') height: number = 100;
  @ViewChild("modalDetalleProyecto") modalDetalleProyecto: ModalBasicComponent;
  @ViewChild("modproyjunta") Modproyjunta: ModalBasicComponent;
  tabSeleccionado = 1;
  menuPrincipal$: Subscription = new Subscription()
  arrayTabs$: Subscription = new Subscription()
  accesproy$: Subscription = new Subscription()
  preventscroll = false;
  itemsMenu = itemsMenu
  paises = paises
  monedas = monedas
  modalidades = modalidades
  estados = estados
  departamentos = []
  provincias = []
  distritos = []
  clasificaciones = []
  grupos = []
  tabs = [];
  seleccionado = 0
  verMenuProyecto: boolean = false;
  idUsuario: any;
  idUadmin: any;
  esSecund=false;
  proyectoSeleccionado: any = null;
  active = 0
  mostrarModal: boolean = false;
  mostrar_carga = false;
  mostrar_carga_todo = false;
  expanded = false
  ocultarMenu = false
  calculandofecha = false;
  //tabla principal
  dataSourceorg = []//new MatTableDataSource<any>();
  busqueda = '';
  buscando = false;
  fila_sel: any;
  datasourcepap = [];
  busqueda2 = '';
  buscando2 = false;
  fila_sel2: any;
  datasourcecomp = [];
  busqueda3 = '';
  buscando3 = false;
  fila_sel3: any;
  datasourcesis = [];
  busqueda4 = '';
  buscando4 = false;
  fila_sel4: any;
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  dec_metrado = 2;
  mask_metrado = '0.2';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  buscatabla = false;
  //juntarproy
  fuentesel=1;
  busquedajun='';
  datasourcePri=[];
  buscandojun=false;
  filaselpri=-1;
  tiposelj='';
  tvista=0;
  datproy1:any;
  datproy2:any;
  aspecpr1:any;
  aspecpr2:any;
  datacomp=[
    {nombres:'EDICION DEL PRESUPUESTO',permite:'1',mostrar:'1'},
    {nombres:'DISEÑO DE COSTOS INDIRECTOS',permite:'0',mostrar:'1'},
    /* {nombres:'COTIZACION INSUMOS',permite:'0',mostrar:'0'}, */
    {nombres:'HOJA DE METRADOS',permite:'0',mostrar:'1'},
    {nombres:'FÓRMULA POLINÓMICA',permite:'0',mostrar:'1'},
    {nombres:'PROGRAMACION DE OBRA',permite:'0',mostrar:'1'},
    {nombres:'ESPECIFICACIONES TECNICAS',permite:'0',mostrar:'1'},
    /* {nombres:'GESTION DE PROYECTO',permite:'0',mostrar:'0'} */
  ];

  formArrayProyecto = new UntypedFormGroup({
    formProyecto: new UntypedFormArray([], Validators.required)
  })
  listaFeriados = [];
  arrayDiasNoLab = [];
  fechIniAlm: string;
  get formProyecto() {
    return this.formArrayProyecto.controls['formProyecto'] as UntypedFormArray
  }
  bloqconf = false;
  id_proyecto = '';
  //detallesproy: any;//revisar si se usan estos datos hasta configuraciones
  //configuraciones
  public Frmdecimales = new UntypedFormGroup({
    metrado: new UntypedFormControl('4'),
    precio: new UntypedFormControl('2'),
    parcial: new UntypedFormControl('2'),
    cantidad: new UntypedFormControl('4'),
  });
  get frmdecmetrado(): UntypedFormControl { return this.Frmdecimales.get('metrado') as UntypedFormControl }
  get frmdecprecio(): UntypedFormControl { return this.Frmdecimales.get('precio') as UntypedFormControl }
  get frmdecparcial(): UntypedFormControl { return this.Frmdecimales.get('parcial') as UntypedFormControl }
  get frmdeccant(): UntypedFormControl { return this.Frmdecimales.get('cantidad') as UntypedFormControl }
  tipoletra = [
    { id: '1', nombre: 'Normal' },
    { id: '2', nombre: 'Cursiva' },
    { id: '3', nombre: 'Negrita' },
    { id: '4', nombre: 'Cursiva Negrita' },
  ];
  filastabla = [
    { detalle: 'Titulo', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 01', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 02', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 03', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 04', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 05', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 06', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 07', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 08', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 09', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Sub Titulo 10', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Partida', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
    { detalle: 'Desglose Partidas', presupuestoletra: 'unset', presupuestotipo: '1', presupuesto: 'none', cronogramaletra: 'unset', cronogramatipo: '1', cronograma: 'none' },
  ];
  dataSourceColor = [];
  cargocompo = true;
  arrmenuproy=[1,0,0,0,0,0,0,0];

  constructor(
    private configuracionService: ConfiguracionService,
    private _ClasificacionService: ClasificacionService,
    private variablesGlobalesService: VariablesGlobalesService,
    private encriptadorService: EncriptadorService,
    private principalService: PrincipalService,
    private presuservice: PresupuestosService,
    private formulaservice: FormulaPolinomicaService,
    private metradoservice: MetradoService,
    private catalogosService: CatalogosService,
    public formService: FormsService,
    private modalService: NgbModal,
    private changeDetector: ChangeDetectorRef,
    private toaster: ToastrService,
    private formBuilder: UntypedFormBuilder,
    private _SignalrcustomService: SignalrcustomService,
    private router: Router
  ) { }

  async ngOnInit() {
    let bloq = this.encriptadorService.recuperarlocalstory('bloqueaproy');
    if (bloq == 'false') {
      this.encriptadorService.guardarlocalstory('bloqueaproy', JSON.stringify(true));
    }
    else {
      this.cargocompo = false;
      this.router.navigate(['/principal/inicio']);
      this.toaster.error('El componente Proyectos ya esta abierto. Cierre Sesión y Vuelva a Ingresar si persiste el mensaje.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
    }
    await this.onResize(null)
    this.idUsuario = await this.encriptadorService.recuperarlocalstory('idusuario');
    this.idUadmin = await this.encriptadorService.recuperarlocalstory('id_admin');
    let menproy = await this.encriptadorService.recuperarlocalstory('menu_proy');
    this.arrmenuproy=menproy?JSON.parse(menproy).split('|'):this.arrmenuproy;
    this.esSecund=this.idUsuario!=this.idUadmin?true:false;
    this.aspectos = JSON.parse(this.encriptadorService.recuperarlocalstory('aspectostablas'));
    this.pintar();
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
    this.onListar(true);
    this.onListarComp();
    this.onListarSis();
    this.onListarPap(true);
    this.principalService.eliminarProyPerma({ id_usuario: this.idUsuario })
    this.menuPrincipal$ = this.variablesGlobalesService.menuPrincipal.subscribe(data => {
      if (data) {
        this.verMenuProyecto = false
      } else {
        this.verMenuProyecto = true
      }
    })
    await this.listarDepartamentos()
    const tabs = JSON.parse(localStorage.getItem('tabs'))
    if (tabs.length > 0) {
      this.mostrar_carga_todo = true
      await this.listarClasificacionProyectos()
      await this.listarGrupos()
      await tabs.reduce(async (a, tab, currentIndex) => {
        await a;
        await this.crearFormArrayProyecto(tab, currentIndex,tab.solover,tab.escreador)
      }, Promise.resolve());
      this.mostrar_carga_todo = false
    }
    this.accesproy$=this._SignalrcustomService.actaccesoproy.subscribe((mensaje) => {
      if(this.active>=0){
        if(mensaje==this.formProyecto.value[this.active]?.id_proyecto && this.formProyecto.value[this.active]?.solover==false){
          this.close(null, this.active);
          window.location.reload();
        }
      }
    })
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var windowHeight = window.innerHeight;
    var resto = 220;
    if (document.body.clientWidth <= 992) {
      resto = 240;
    }
    this.height = windowHeight - resto;
    if (document.body.clientWidth < 768) {
      this.mostrarModal = true
      if (this.active != 0) {
        // this.modalDetalleProyecto.show()
      }
    } else {
      this.mostrarModal = false
      if (this.modalDetalleProyecto) {
        this.modalDetalleProyecto.hide()
      }
    }
    return
  }
  pintar() {
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  limpiarfiltro2() {
    this.busqueda2 = '';
  }
  limpiarfiltro3() {
    this.busqueda3 = '';
  }
  limpiarfiltro4() {
    this.busqueda4 = '';
  }
  //recuperar datos
  async onListar(cambiatab=false) {
    try {
      this.dataSourceorg = [];
      this.buscando = true;
      if(this.idUadmin!=this.idUsuario){
        let tabaux = await this.principalService.ListarProyectosSec(this.idUadmin);
        for(let a=0;a<tabaux.length;a++){
          if(tabaux[a].nro!=''){
            if(a==tabaux.length-1){
              tabaux.splice(a,1);
              break;
            }
            else{
              if(tabaux[a+1].id_grupo!=tabaux[a].id_grupo){
                tabaux.splice(a,1);
                a--;
              }
            }
          }
        }
        this.dataSourceorg=tabaux;
        this.buscando = false;
      }
      else{
        this.dataSourceorg = await this.principalService.ListarProyectos(this.idUsuario);
        this.buscando = false;
        //si no hay proyectos mover a la pestana sistema?
        if(cambiatab && this.dataSourceorg.length<5){
          this.tabSeleccionado=4;
        }
      }
    }
    catch {
      this.buscando = false;
    }
  }
  async close(event: MouseEvent, toRemove: number) {
    // if (event) {
    //   const sw = await SwalService.confirm('Estas seguro?', 'Se cerrará la pestaña, asegurese de guardar sus cambios')
    //   if (!sw.isConfirmed) {
    //     return;
    //   }
    // }
    this.mostrar_carga_todo = true;
    this.formProyecto.removeAt(toRemove)
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (!this.formProyecto.length) {
      this.variablesGlobalesService.menuPrincipal.next(true)
      this.variablesGlobalesService.arrayTabs.next([])
      localStorage.setItem('tabs', JSON.stringify([]))
      this.verMenuProyecto = false
      this.formProyecto.reset()
      localStorage.setItem('principal', JSON.stringify(true))
      this.mostrar_carga_todo = false;
      return
    }
    for (let i = 0; i < this.formProyecto.value.length; i++) {
      const tab = this.formProyecto.controls[i] as UntypedFormGroup
      const indicetab = tab.get('indice_tab') as UntypedFormControl
      indicetab.setValue(i)
    }
    this.variablesGlobalesService.arrayTabs.next(this.formArrayProyecto.value)
    localStorage.setItem('tabs', JSON.stringify(this.formProyecto.value))
    this.active = this.formProyecto.value[this.formProyecto.value.length - 1].indice_tab
    this.mostrar_carga_todo = false;
  }
  async listarDepartamentos() {
    this.departamentos = await this.configuracionService.Departamento()
  }
  async listarProvincias(idDepartamento: number, nroProyecto: number) {
    const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
    const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
    const datosProyecto = (aspectos_generales.get('datos_proyecto') as UntypedFormGroup)
    datosProyecto.get('lista_provincias').setValue([])
    datosProyecto.get('lista_distritos').setValue([])
    datosProyecto.get('provincia').setValue('')
    datosProyecto.get('distrito').setValue('')
    // console.log('dep', datosProyecto.get('departamento').value);

    if (!idDepartamento) {
      datosProyecto.get('provincia').clearValidators()
      datosProyecto.get('provincia').updateValueAndValidity()
      datosProyecto.get('distrito').clearValidators()
      datosProyecto.get('distrito').updateValueAndValidity()
      return
    }
    const provincias = await this.configuracionService.Provincia(idDepartamento)
    // console.log('provincias', provincias);

    datosProyecto.get('lista_provincias').setValue(provincias)
    datosProyecto.get('provincia').setValidators([Validators.required])
    datosProyecto.get('provincia').updateValueAndValidity()
    datosProyecto.get('distrito').setValidators(Validators.required)
    datosProyecto.get('distrito').updateValueAndValidity()
  }

  async listarDistritos(idProvincia: string, nroProyecto: number) {
    const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
    const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
    const datosProyecto = (aspectos_generales.get('datos_proyecto') as UntypedFormGroup)
    if (!idProvincia) {
      datosProyecto.get('distrito').clearValidators()
      datosProyecto.get('distrito').updateValueAndValidity()
      return
    }
    const provincia = idProvincia.split('-')
    const distritosRecuperados = await this.configuracionService.Distrito(provincia[0], provincia[1])
    // console.log('distritosRecuperados', distritosRecuperados);
    datosProyecto.get('lista_distritos').setValue(distritosRecuperados)
  }
  toggleOn(id: string) {
    for (let row of this.dataSourceorg) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 1;
        }
        else
          row.icomost = 1;
      }
    }
  }
  toggleOff(id: string) {
    for (let row of this.dataSourceorg) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 0;
        }
        else
          row.icomost = 0;
      }
    }
  }
  cambindicesel(row: any, ind: any) {
    //const row = this.dataSourceorg[ind]
    if (row.nro == "") {
      if (ind == this.fila_sel)
        this.fila_sel = -1;
      else {
        this.verDetalleProyecto(row);
        this.fila_sel = row.id_proyecto;
      }
    }
  }
  async abrirProyectoEspecifico(row, i, compar = false) {
    if (compar) {
      this.mostrar_carga_todo = true;
      let resp = await this.principalService.FilaProyectoComp({ id_proyecto: row.id_proyecto, id_usuario: row.id_usuario, id_secundario: this.idUsuario });//cambiar con metodo para compartidos
      if (resp.length == 0) {
        this.mostrar_carga_todo = false;
        this.toaster.error('El proyecto ya no esta compartido.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        this.onListarComp();
        return;
      }
    }
    if (this.formProyecto.value.length >= 5) {
      this.mostrar_carga_todo = false;
      this.verMenuProyecto = false
      SwalService.warning('Error', 'No se pueden abrir mas de 5 proyectos')
      return
    } else {
      this.mostrar_carga_todo = true
      const existe = this.formProyecto.value.find(tab => Number(row.id_proyecto) === tab.id_proyecto)
      this.variablesGlobalesService.menuPrincipal.next(false)
      this.variablesGlobalesService.mantenerPrincipal.next(false)
      localStorage.setItem('principal', JSON.stringify(false))
      this.verMenuProyecto = true
      if (existe) {
        this.active = existe.indice_tab
      } else {
        let confproy = await this.principalService.ListarConfigProy({ id_proyecto: row.id_proyecto });//cambiar con metodo para compartidos
        let ncolores;
        let ndecimales;
        if (confproy) {
          let datos = {
            colorCronograma: confproy.colorCronograma,
            colorPresupuesto: confproy.colorPresupuesto,
            letraCronograma: confproy.letraCronograma,
            letraPresupuesto: confproy.letraPresupuesto,
            tipoCronograma: confproy.tipoCronograma,
            tipoPresupuesto: confproy.tipoPresupuesto,
          };
          ncolores = JSON.stringify(datos);
          ndecimales = confproy.dec_metrado + '|' + confproy.dec_precio + '|' + confproy.dec_parcial + '|' + confproy.dec_cant;
        }
        this.active = this.formProyecto.value.length
        let arrmenu;
        if (row.visual) {
          arrmenu = JSON.parse(row.visual);
        }
        else{
          arrmenu=this.arrmenuproy;
        }
        const proyecto = {
          id_proyecto: row.id_proyecto,
          nombre_proyecto: row.descripcion,
          menuver: arrmenu,//menu-item
          decimal: ndecimales,
          aspectab: ncolores
        }
        if (this.formProyecto.value.length == 0) {
          await this.listarClasificacionProyectos()
          await this.listarGrupos()
        }
        //tabs, propio editable, los otros 3 no editable(usuario secundario ve proyectos y datos del principal,los datos editados son para el principal?)
        let opcver=this.tabSeleccionado==1?false:true;
        //condicionar estado del proyecto, tipo de usuario para editar proyectos del sistema
        let creador=false;
        let roleus = this.encriptadorService.recuperarlocalstory('role');
        if(roleus?.includes('ADMINISTRADOR') && this.tabSeleccionado==4){
          opcver=false;
          if(row.id_usuario==this.idUsuario){
            creador=true;
          }
        }
        if(this.tabSeleccionado==1 && row.id_usuario==this.idUsuario){
          creador=true;
        }
        if(row.estado=='1'){
          opcver=true;
        }
        await this.crearFormArrayProyecto(proyecto, this.formProyecto.value.length,opcver,creador)
        this.variablesGlobalesService.arrayTabs.next(this.formArrayProyecto.value)
        localStorage.setItem('tabs', JSON.stringify(this.formProyecto.value))
      }
      this.mostrar_carga_todo = false
    }
  }

  verProyectosAbiertos() {
    this.verMenuProyecto = true
    this.variablesGlobalesService.menuPrincipal.next(false)
    localStorage.setItem('principal', JSON.stringify(false))
  }

  ngOnDestroy(): void {
    this.menuPrincipal$.unsubscribe()
    this.arrayTabs$.unsubscribe()
    this.accesproy$.unsubscribe();
    this.variablesGlobalesService.arrayTabs.next([])
    this.variablesGlobalesService.menuPrincipal.next(true)
    if (this.cargocompo) {
      this.encriptadorService.guardarlocalstory('bloqueaproy', JSON.stringify(false));
    }
    localStorage.setItem('principal', JSON.stringify(true))
  }
  async verGrupoProyecto() {
    const modalRef = this.modalService.open(AgrupacionProyectosComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
    const result = await modalRef.result
    if (result) {
      if (result.datos.length > 0) {
        this.grupos = result.datos
      }
      if (result.actlista) {
        this.onListar();
      }
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async openModalProyecto(datos = null, editar = null, ver = null) {
    let maxproys = this.encriptadorService.recuperarlocalstory('maxproy');
    if(!isNaN(Number(maxproys))){
      let cont=0;
      for(let rows1 of this.dataSourceorg){
        if(rows1.id_proyecto!=''){
          cont++;
        }
      }
      cont=cont+this.datasourcepap.length;
      if(cont>=maxproys){
        this.toaster.error('Ya no puede crear proyectos. Su maximo permitido es '+maxproys+' incluidos los de la papelera.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        return
      }
    }
    this.mostrar_carga_todo = true
    await this.listarClasificacionProyectos()
    await this.listarGrupos()
    const departamentos = await this.listardepa()
    const modalRef = this.modalService.open(ModalProyectoComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })//no cerrar el modal con ESC
    modalRef.componentInstance.editar = editar
    modalRef.componentInstance.datos = datos
    modalRef.componentInstance.ver = ver
    modalRef.componentInstance.clasificaciones = this.clasificaciones
    modalRef.componentInstance.grupos = this.grupos
    modalRef.componentInstance.departamentos = departamentos
    modalRef.componentInstance.idUsuario = this.idUsuario
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result.datos == 'ok') {
      SwalService.success('Correcto', result.mensaje)
      await this.onListar()
    }
    else {
      if (result.actlista) {
        this.onListar();
      }
    }
  }
  async listarClasificacionProyectos() {
    try {
      const input = { activo: '1' }
      this.clasificaciones = await this._ClasificacionService.ListarClasificacion(input);
    } catch (e) {
      console.log(e);
      SwalService.error()
    }
  }
  async listarGrupos() {
    const input = { activo: '1', id_usuario: this.idUsuario,fuente:1 }
    this.grupos = await this.configuracionService.listarGrupoProyecto(input);
  }

  async listardepa() {
    const departamentos = await this.configuracionService.Departamento()
    return departamentos
  }

  async eliminarProyecto(row) {
    try {
      if (row.id_proyecto !== "") {
        const sw = await SwalService.option3Check('Advertencia', 'Esta seguro que desea eliminar el Proyecto? ', 'Permanente','Papelera')
        if (sw.isConfirmed) {//permanente
          let arrproyab = (this.formArrayProyecto.value.formProyecto);
          let exis = arrproyab.findIndex(ele => ele.id_proyecto == row.id_proyecto)
          if (exis >= 0) {
            this.close(null, exis);
          }
          this.mostrar_carga_todo = true;
          const respuesta = await this.principalService.eliminarProyecto({ id_proyecto: row.id_proyecto })
          this.mostrar_carga_todo = false;
          if (respuesta.id == "0") {
            SwalService.error('Advertencia', respuesta.mensaje);
            await this.onListar()
          }
          else {
            SwalService.success()
            await this.onListar()
          }
        }
        else if (sw.isDenied) {//papelera
          this.mostrar_carga_todo = true;
          const respuesta = await this.principalService.ActualizaElimnaproy({ id_proyecto: row.id_proyecto, accion: 0 });
          this.mostrar_carga_todo = false;
          if (respuesta?.id == "1") {
            SwalService.success('Correcto', respuesta.mensaje)
            await this.onListar()
            await this.onListarPap()
          }
        }
      }
    } catch (err) {
      console.log(err)
      SwalService.error('Advertencia',err.mensaje)
    }
  }
  async verDetalleProyecto(row) {
    this.proyectoSeleccionado = row
    this.active = 1
    this.expanded = false
    if (this.mostrarModal) {
      this.modalDetalleProyecto.show()
    }
  }
  cerrarModalDetalle() {
    this.modalDetalleProyecto.hide();
  }
  ////////////////////////////////////prueba ////////////////////7
  async crearFormArrayProyecto(proyecto, nrotab,opcver,creador) {
    const datosProyecto = await this.recuperarDatosProyecto(proyecto.id_proyecto)
    const aspectosGenerales = await this.crearFormAspectosGenerales(datosProyecto, nrotab)
    const datosTab = new UntypedFormGroup({
      id_proyecto: new UntypedFormControl(datosProyecto.id_proyecto),
      indice_tab: new UntypedFormControl(nrotab),
      nombre_proyecto: new UntypedFormControl(datosProyecto.descripcion),
      menu_proyecto_seleccionado: new UntypedFormControl(0),
      aspectos_generales: new UntypedFormGroup(aspectosGenerales.controls, Validators.required),
      menuver: new UntypedFormControl(proyecto.menuver),//cargar el valor del row menu-item
      solover: new UntypedFormControl(opcver),//menu-item
      aspectab: new UntypedFormControl(proyecto.aspectab),//menu-item
      decimal: new UntypedFormControl(proyecto.decimal),//menu-item
      escreador:new UntypedFormControl(creador)
    })
    this.formProyecto.push(datosTab)
    await this.listarSubmetrado(nrotab)
    // console.log('this.formProyecto', this.formProyecto.value);
  }
  async crearFormAspectosGenerales(datosProyecto, nroProyecto = null): Promise<UntypedFormGroup> {
    const tablaPrueba = new UntypedFormGroup({
      inputBusqueda: new UntypedFormControl(''),
      data_source: new UntypedFormControl([]),
      displayedColums: new UntypedFormControl(['id_partida', 'descripcion', 'unidad', 'precio', 'acciones']),
      filaSeleccionada: new UntypedFormControl(-1),
      totmano: new UntypedFormControl(''),
      totmat: new UntypedFormControl(''),
      totequi: new UntypedFormControl(''),
      totsubc: new UntypedFormControl(''),
      totsubp: new UntypedFormControl(''),
      totdir: new UntypedFormControl(''),
      totind: new UntypedFormControl([]),
      totalproy: new UntypedFormControl(''),
      inserta: new UntypedFormControl([]),
      modifica: new UntypedFormControl([]),
      elimina: new UntypedFormControl([]),
      editado: new UntypedFormControl(false),
    })
    const datos_proyecto = await this.crearDatosProyecto(datosProyecto)
    const ascpectosGenerales = new UntypedFormGroup({
      datos_recuperado: new UntypedFormControl(datosProyecto),
      datos_proyecto: new UntypedFormGroup(datos_proyecto.controls, Validators.required),
      tabla_prueba: new UntypedFormGroup(tablaPrueba.controls),
      opcion_seleccionada: new UntypedFormControl(1)
    })
    ascpectosGenerales.get('datos_proyecto').disable()
    return ascpectosGenerales
  }
  async crearDatosProyecto(datosProyecto): Promise<UntypedFormGroup> {
    const fecha_elaboracion = datosProyecto.fecha_elaboracion ? moment(datosProyecto.fecha_elaboracion).format('YYYY-MM-DD') : ''
    const fecha_inicio = datosProyecto.fecha_inicio ? moment(datosProyecto.fecha_inicio).format('YYYY-MM-DD') : ''
    const fecha_culmina = datosProyecto.fecha_culmina ? moment(datosProyecto.fecha_culmina).format('YYYY-MM-DD') : ''
    let provincias = [], distritos = [], idProvincia = '', idDistrito = ''
    if (datosProyecto.id_deptact) {
      provincias = await this.configuracionService.Provincia(datosProyecto.id_deptact)
    }
    if (datosProyecto.id_provact) {
      idProvincia = datosProyecto.id_deptact + '-' + datosProyecto.id_provact
      distritos = await this.configuracionService.Distrito(datosProyecto.id_deptact, datosProyecto.id_provact)
    }
    if (datosProyecto.id_distact) {
      idDistrito = datosProyecto.id_deptact + '-' + datosProyecto.id_provact + '-' + datosProyecto.id_distact
    }
    this.fechIniAlm = fecha_inicio
    const datos_form = new UntypedFormGroup({
      descripcion: new UntypedFormControl(datosProyecto.descripcion, [Validators.required]),
      id_clasificacion: new UntypedFormControl(datosProyecto.id_clasificacion, [Validators.required]),
      modalidad: new UntypedFormControl(datosProyecto.modalidad, [Validators.required]),
      id_grupo: new UntypedFormControl(datosProyecto.id_grupo, [Validators.required]),
      moneda: new UntypedFormControl(datosProyecto.moneda, [Validators.required]),
      estado: new UntypedFormControl(datosProyecto.estado, [Validators.required]),
      cod_pais: new UntypedFormControl(datosProyecto.cod_pais ? datosProyecto.cod_pais : '', []),
      departamento: new UntypedFormControl(datosProyecto.id_deptact ? datosProyecto.id_deptact : '', []),
      distrito: new UntypedFormControl(idDistrito, []),
      lista_distritos: new UntypedFormControl(distritos, []),
      lista_provincias: new UntypedFormControl(provincias, []),
      provincia: new UntypedFormControl(idProvincia, []),
      direccion: new UntypedFormControl(datosProyecto.direccion, []),
      fecha_elaboracion: new UntypedFormControl(fecha_elaboracion, [Validators.required, this.fechaElaboracionValidator()]),
      plazo: new UntypedFormControl(datosProyecto.plazo, [Validators.required, Validators.min(1), Validators.max(5000)]),
      fecha_inicio: new UntypedFormControl(fecha_inicio, [Validators.required, this.fechaElaboracionValidator()]),
      fecha_culmina: new UntypedFormControl(fecha_culmina, [Validators.required, this.fechaElaboracionValidator()]),
    })
    return datos_form
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
      if (fechaElaboracion < fechaLimiteInferior || fechaElaboracion > fechaLimiteSuperior) {
        return { fechaInvalida: 'La fecha debe estar entre 25 años antes y 25 años después de la fecha actual.' };
      }
      return null; // Si es válida
    };
  }
  async seleccionMenu(itemMenu, numeroProyecto) {
    const proyecto = (this.formProyecto.controls[numeroProyecto] as UntypedFormGroup)
    const numeroMenu = proyecto.get('menu_proyecto_seleccionado') as UntypedFormControl
    if (numeroMenu.value != itemMenu) {
      const idproy = proyecto.get('id_proyecto') as UntypedFormControl
      if (numeroMenu.value == 1) {
        let presutemp = await this.presuservice.ExistePresuTemp({ id_proyecto: idproy.value, id_usuario: this.idUsuario })
        if (presutemp.length > 0) {
          const sw = await SwalService.confirm('Tiene cambios sin guardar!', 'Si no guarda los cambios no se reflejara en los demas procesos. Desea mantenerse en la vista para guardar?')
          if (!sw.isConfirmed) {
            numeroMenu.setValue(itemMenu)
          }
        }
        else {
          numeroMenu.setValue(itemMenu)
        }
      }
      else {
        numeroMenu.setValue(itemMenu)
      }
    }
    if (itemMenu == 0) {
      const aspectosGenerales = (proyecto.get('aspectos_generales') as UntypedFormGroup)
      this.cancelarEditarDatosProyecto(numeroProyecto, aspectosGenerales.value.datos_recuperado);
      const opcionSubMenu = aspectosGenerales.get('opcion_seleccionada') as UntypedFormControl
      if (opcionSubMenu.value == '2') {
        this.id_proyecto = proyecto.value.id_proyecto;
        this.cargarDatosConf(this.id_proyecto);
      }
      await this.listarSubmetrado(numeroProyecto);
    }
  }
  async onNavChange(indice_tab) {
    const proyecto = (this.formProyecto.controls[indice_tab.nextId] as UntypedFormGroup)
    const aspectosGenerales = (proyecto.get('aspectos_generales') as UntypedFormGroup)
    const opcionSubMenu = aspectosGenerales.get('opcion_seleccionada') as UntypedFormControl
    if (opcionSubMenu.value == '3') {//cambiar por impresion
      this.mostrar_carga = true;
      this.id_proyecto = proyecto.value.id_proyecto;
      //cargar impresion?
      //this.detallesproy = await this.principalService.recuperarDatosProyecto({ id_proyecto: proyecto.value.id_proyecto })
      //this.cargarDatos();
      this.mostrar_carga = false;
    }
  }
  async cambioSubMenu(indice_tab, opcionSubmenu) {
    const proyecto = (this.formProyecto.controls[indice_tab] as UntypedFormGroup)
    const aspectosGenerales = (proyecto.get('aspectos_generales') as UntypedFormGroup)
    const opcionSubMenu = aspectosGenerales.get('opcion_seleccionada') as UntypedFormControl
    opcionSubMenu.setValue(opcionSubmenu)
    if (opcionSubmenu == '3') {//cambiar por impresion, aplicar arriba?
      this.mostrar_carga = true;
      this.id_proyecto = proyecto.value.id_proyecto;
      //this.detallesproy = await this.principalService.recuperarDatosProyecto({ id_proyecto: proyecto.value.id_proyecto })
      //this.cargarDatos();
      this.mostrar_carga = false;
    }
    else if (opcionSubmenu == '2') {
      this.id_proyecto = proyecto.value.id_proyecto;
      this.cargarDatosConf(this.id_proyecto);
    }
  }
  async actualizarDatosProyecto(nroProyecto) {
    try {
      const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
      const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
      const datosProyectoForm = (aspectos_generales.get('datos_proyecto') as UntypedFormGroup)
      const datosProyecto = datosProyectoForm.getRawValue()
      let fechainicioInvalida = false
      var fechaSeleccionado = new Date(datosProyecto.fecha_inicio)
      const Fi = moment(datosProyecto.fecha_inicio).format('YYYY-MM-DD')
      const arrayDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
      var nombreDia = arrayDays[fechaSeleccionado.getDay()];
      let encontrado1 = false
      let encontrado = false
      const aspectos = await this.principalService.ListarAspectosDiasProy({ id_proyecto: formProyecto.value.id_proyecto })
      if(aspectos[0].length>0){
        let diasnolabo=aspectos[0][0].nolabo1?(aspectos[0][0].nolabo1.toString().includes('|')?aspectos[0][0].nolabo1.toString().split('|'):[aspectos[0][0].nolabo1.toString()]):[];
        if (aspectos[0][0]) {
          encontrado1 = diasnolabo.find(ele => ele==nombreDia.toUpperCase())?true:false;
        }
      }
      if (aspectos[1]) {
        encontrado = aspectos[1].find(ele => moment(ele.fecha).format('YYYY-MM-DD') == Fi && !ele.laborado)
      }
      fechainicioInvalida = encontrado || encontrado1 ? true : false
      if (datosProyectoForm.invalid) {
        datosProyectoForm.markAllAsTouched()
        SwalService.error('Advertencia', 'Datos Incompletos')
        return
      } else if (fechainicioInvalida) {
        this.toaster.error('La Fecha Inicio Seleccionada es  dia no laborable', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      } else {
        this.mostrar_carga_todo = true;
        const datos_recuperado = (aspectos_generales.get('datos_recuperado') as UntypedFormGroup)
        const fiAnterior = moment((datos_recuperado.value).fecha_inicio).format('YYYY-MM-DD')
        const fiform = moment(datosProyecto.fecha_inicio).format('YYYY-MM-DD')
        if (fiAnterior !== fiform) {
          const sw = await SwalService.multiple('Estas seguro?', 'El cambio de fecha inicio modificara la programación')
          if (sw.isConfirmed) {
            let progratemp = await this.principalService.listarCambiosTemporalesProgramacion({ id_proyecto: formProyecto.value.id_proyecto, id_usuario: '' })
            if(progratemp){
              this.toaster.error('Existen cambios que no se guardaron en Programación. No puede hacer cambios hasta guardar los de Programación.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
              this.mostrar_carga_todo=false;
              return;
            }
            else{
              const objeto = {
                id_proyecto: formProyecto.value.id_proyecto,
                duracion: '',
                fechaini: fiAnterior > fiform ? fiform : fiAnterior,
                fechafin: fiAnterior > fiform ? fiAnterior : fiform,
                posterior: 0
              }
              const response = await this.principalService.fechaDespuesDuracion(objeto)
              const diasModificados = fiAnterior < fiform ? Number(response.duracion) * 1 : Number(response.duracion) * -1
              await this.principalService.desplazarProgramacion({ id_proyecto: formProyecto.value.id_proyecto, diasmodificados: diasModificados,iniproy:datosProyecto.fecha_inicio})
            }
          } else {
            await this.cancelarEditarDatosProyecto(formProyecto.value.indice_tab, datos_recuperado.value)
            this.mostrar_carga_todo = false;
            return
          }
        }
        let descpasa=datosProyecto.descripcion.toString().toUpperCase().trim().replace(/\s+/g, ' ')//quitar saltos y espacios, solo mayuscula
        const modificarProyecto = {
          id_proyecto: formProyecto.value.id_proyecto,
          cui: '',
          descripcion: descpasa,
          id_clasificacion: datosProyecto.id_clasificacion,
          modalidad: datosProyecto.modalidad,
          id_grupo: datosProyecto.id_grupo,
          moneda: datosProyecto.moneda,
          estado: datosProyecto.estado,
          cod_pais: datosProyecto.cod_pais ? datosProyecto.cod_pais : '',
          id_localidad: datosProyecto.distrito ? datosProyecto.distrito : '',
          direccion: datosProyecto.direccion ? datosProyecto.direccion : '',
          fecha_elaboracion: datosProyecto.fecha_elaboracion ? datosProyecto.fecha_elaboracion : '',
          plazo: datosProyecto.plazo ? datosProyecto.plazo : '',
          fecha_inicio: datosProyecto.fecha_inicio ? datosProyecto.fecha_inicio : '',
          fecha_culmina: datosProyecto.fecha_culmina ? datosProyecto.fecha_culmina : '',
          id_usuario: this.idUsuario
        }
        const response = await this.principalService.modificarProyecto(modificarProyecto)
        this.mostrar_carga_todo = false;
        if (response.id == "1") {
          SwalService.success()
          await this.habilitarEdicionDatosProyecto(nroProyecto)
          const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
          const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
          const datosRecuperado = (aspectos_generales.get('datos_recuperado') as UntypedFormControl)
          datosRecuperado.setValue(response)
          formProyecto.get('solover').setValue(datosProyecto.estado=='1'?true:false)
          localStorage.setItem('tabs', JSON.stringify(this.formProyecto.value))
          this.onListar();
        } else {
          SwalService.error('Advertencia', response.mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e);
      SwalService.error()
    }
  }
  async cancelarEditarDatosProyecto(nroProyecto, datosAnteriores) {
    const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
    const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
    const datosProyectoForm = (aspectos_generales.get('datos_proyecto') as UntypedFormGroup)
    datosProyectoForm.get('lista_provincias').setValue([])
    datosProyectoForm.get('lista_distritos').setValue([])
    const form = await this.crearDatosProyecto(datosAnteriores)
    datosProyectoForm.reset(form.value)
    //datosProyectoForm.disable()
    if (!datosProyectoForm.disabled) {
      await this.habilitarEdicionDatosProyecto(nroProyecto)
    }
  }
  async habilitarEdicionDatosProyecto(nroProyecto) {
    const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
    const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
    const datosProyectoForm = (aspectos_generales.get('datos_proyecto') as UntypedFormGroup)
    if (datosProyectoForm.disabled) {
      datosProyectoForm.enable()
    } else {
      datosProyectoForm.disable()
    }
  }
  async recuperarDatosProyecto(idProyecto) {
    const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: idProyecto})
    return detalleProyecto
  }
  async listarSubmetrado(nroProyecto) {
    try {
      this.buscatabla = true;
      const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
      const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
      const tabla = (aspectos_generales.get('tabla_prueba') as UntypedFormGroup)
      const datos_recuperado = (aspectos_generales.get('datos_recuperado') as UntypedFormGroup)
      let tabla1 = new MatTableDataSource;
      const dataSource = await this.presuservice.ListarSubpresuProy({ id_proyecto: datos_recuperado.value.id_proyecto })
      let resind = await this.presuservice.ListarPresuIndirecto({ id_usuario: this.idUsuario, id_proyecto: datos_recuperado.value.id_proyecto, titulo: "0" });
      let arrind = [];
      if (resind.id == "1") {
        let tablapas=JSON.parse(resind.tabla);
        arrind = tablapas[0];
      }
      for(let row of dataSource){
        row.manoobra=this.formService.redondeo(Number(row.manoobra),this.dec_parcial)
        row.equipos=this.formService.redondeo(Number(row.equipos),this.dec_parcial)
        row.materiales=this.formService.redondeo(Number(row.materiales),this.dec_parcial)
        row.subcontratos=this.formService.redondeo(Number(row.subcontratos),this.dec_parcial)
        row.subpartidas=this.formService.redondeo(Number(row.subpartidas),this.dec_parcial)
        row.total=this.formService.redondeo(Number(row.total),this.dec_parcial)
      }
      tabla1.data = dataSource
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
      let aux = [];
      for (let row of arrind) {
        if (row.tipo_registro != '3')
          aux.push(row);
      }
      tabla.get('totmano').setValue(this.formService.redondeo(tot1,this.dec_parcial));
      tabla.get('totmat').setValue(this.formService.redondeo(tot2,this.dec_parcial));
      tabla.get('totequi').setValue(this.formService.redondeo(tot3,this.dec_parcial));
      tabla.get('totsubc').setValue(this.formService.redondeo(tot4,this.dec_parcial));
      tabla.get('totsubp').setValue(this.formService.redondeo(tot5,this.dec_parcial));
      tabla.get('totdir').setValue(this.formService.redondeo(totdir,this.dec_parcial));
      tabla.get('totind').setValue(aux);
      //tabla.get('totalproy').setValue(totindir+totdir);
      this.buscatabla = false;
    } catch (e) {
      SwalService.error()
      console.log(e);
    }
  }
  //subpresupuesto
  cambindiceselsubpresu(ind: any, nroProyecto: any) {
    const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
    const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
    const tabla = (aspectos_generales.get('tabla_prueba') as UntypedFormGroup)
    if (ind == tabla.value.filaSeleccionada)
      tabla.value.filaSeleccionada = -1;
    else
      tabla.value.filaSeleccionada = ind;
  }
  GenerarItemord(item: string) {
    let itemord = '';
    let arrit = item.split('.');
    for (let i = 0; i < arrit.length; i++) {
      itemord = i == arrit.length - 1 ? itemord + arrit[i].padStart((2 * arrit[i].length) - 1, '_') : itemord + arrit[i].padStart((2 * arrit[i].length) - 1, '_') + ".";
    }
    return itemord;
  }
  sigitem(itemant: string) {
    let arrauxagru = itemant.split('.');
    arrauxagru[arrauxagru.length - 1] = (Number(arrauxagru[arrauxagru.length - 1]) + 1).toString();
    return arrauxagru.join('.');
  }
  async agregartitulo(nroProyecto: any) {
    const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
    const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
    const tabla = (aspectos_generales.get('tabla_prueba') as UntypedFormGroup)
    // const datoaccs = await this.principalService.ConfgsAsignaUserProy({id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,id_usuario:this.idUsuario});
    // if(datoaccs?.length>0){
    //   if(datoaccs[0].presu==0){
    //     this.toaster.error('No tiene Permisos para Edición de Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    //     return;
    //   }
    // }
    let indact = tabla.value.filaSeleccionada;
    try {
      let presutemp = await this.presuservice.ExistePresuTemp({ id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto, id_usuario: this.idUsuario })
      if (presutemp.length > 0) {
        this.toaster.error('Tiene cambios sin guardar en Presupuesto. No puede modificar hasta guardar sus cambios.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
      else {
        let rpartidas = await this.catalogosService.ListarTitsubPartidas({ id_usuario: this.idUsuario, fuente: '0', tipo_proy: aspectos_generales.value.datos_recuperado.id_clasificacion });//cambiar dinamico tipo_proy
        let arrtipoProy = await this._ClasificacionService.ListarClasificacion({ activo: '1' });
        let opcfilasel = indact > -1 ? true : false;
        const modalRef = this.modalService.open(BusqTitSubtPresuComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
        modalRef.componentInstance.partidas = rpartidas;
        modalRef.componentInstance.tipoProy = arrtipoProy;//cambiar por el arreglo de tipos de proyecto
        modalRef.componentInstance.estitulo = true;
        modalRef.componentInstance.opcfila = opcfilasel;
        modalRef.componentInstance.fondo = this.titulo1;
        modalRef.componentInstance.color = this.titulo1color;
        modalRef.componentInstance.letra = this.titulo1letra;
        modalRef.componentInstance.tipoproypasa = aspectos_generales.value.datos_recuperado.id_clasificacion;
        const result = await modalRef.result
        if (result) {
          let itemsel = "NULL";
          let itemini = '';
          let indins = -1;
          if (result.forma == "1") {
            itemini = '1';
            indins = 0;
            for (let i = 0; i < tabla.value.data_source.length; i++) {
              let separado = tabla.value.data_source[i].item.toString().split('.');
              let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
              let nuevonum = Number(separado[longi - 1]) + result.datos.length;
              separado[longi - 1] = nuevonum.toString();
              tabla.value.data_source[i].item = separado.join('.');
              tabla.value.data_source[i].itemord = this.GenerarItemord(separado.join('.'));
              this.ActfilCambios(tabla.value.data_source[i].accion == 1 ? tabla.value.inserta : tabla.value.modifica, tabla.value.data_source[i]);
            }
          }
          else if (result.forma == "0") {
            if (tabla.value.data_source.length > 0) {
              let ultit = tabla.value.data_source[tabla.value.data_source.length - 1].item.split('.');
              let numult = Number(ultit[0]);
              itemini = (numult + 1).toString();
              indins = tabla.value.data_source.length;//hacer push al final
            }
            else {
              itemini = '1';
              indins = 0;
            }
          }
          else if (result.forma == "2" || result.forma == "3") {
            itemsel = indact > -1 ? tabla.value.data_source[indact].item : "NULL";
            itemini = result.forma == '3' ? this.sigitem(itemsel) : itemsel;//buscar el item inicial para agregar
            let indpri = indact;
            let enco = false;
            //indact=result.forma=='2'?indact+result.datos.length:indact;
            if (itemsel.split('.').length == 1) {
              for (let i = indpri; i < tabla.value.data_source.length; i++) {
                var prefijo = tabla.value.data_source[i].item.toString().substring(0, itemsel.length + 1)
                if ((result.forma == '3' && (tabla.value.data_source[i].item != itemsel && prefijo != (itemsel + '.'))) || result.forma == '2') {
                  if (!enco) {
                    indins = i;
                    enco = true;
                  }
                  let separado = tabla.value.data_source[i].item.toString().split('.');
                  let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                  let nuevonum = Number(separado[longi - 1]) + result.datos.length;
                  separado[longi - 1] = nuevonum.toString();
                  tabla.value.data_source[i].item = separado.join('.');
                  tabla.value.data_source[i].itemord = this.GenerarItemord(separado.join('.'));
                  //actualizar en arreglo si existe
                  this.ActfilCambios(tabla.value.data_source[i].accion == 1 ? tabla.value.inserta : tabla.value.modifica, tabla.value.data_source[i]);
                }
              }
              if(indins==-1){ indins=tabla.value.data_source.length; }
            }
          }
          let indini = indins;
          let indmax=0;
          for (let row of tabla.value.data_source){
            if(row.indice>indmax)
              indmax=row.indice;
          }
          for (let filaadd of result.datos) {
            /* let filaagrega=this.nuevafilapri(this.ultindice++,itemini,filaadd.descripcion,'','',null,null,0,null,'',null,'',filaadd.id_partida,0,0,1,1,this.id_user,filaadd.descripcion); */
            let filaagrega = {
              id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,
              indice: ++indmax,//null,
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
              accion: 1
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
    }
    catch (e) {
      console.log(e)
    }
  }
  // async eliminartitulo(nroProyecto: any) {
  //   const formProyecto = (this.formProyecto.controls[nroProyecto] as FormGroup)
  //   const aspectos_generales = (formProyecto.get('aspectos_generales') as FormGroup)
  //   const tabla = (aspectos_generales.get('tabla_prueba') as FormGroup)
  //   const datos_recuperado = (aspectos_generales.get('datos_recuperado') as FormGroup)
  //   let indact = tabla.value.filaSeleccionada;
  //   if (indact > -1) {
  //     const dataSource = await this.presuservice.ListarFilasPartPresu({ id_proyecto: datos_recuperado.value.id_proyecto, item: tabla.value.data_source[indact].item });
  //     if (dataSource.length == 0) {
  //       for (let i = indact + 1; i < tabla.value.data_source.length; i++) {
  //         tabla.value.data_source[i].item = Number(tabla.value.data_source[i].item) - 1;
  //         //fila modificada
  //         tabla.value.data_source[i].accion = 2;
  //         this.ActfilCambios(tabla.value.data_source[indact].accion == 1 ? tabla.value.inserta : tabla.value.modifica, tabla.value.data_source[i]);
  //       }
  //       //actualizar montos(todos los totales)
  //       let tot1 = Number(tabla.get('totmano').value);
  //       let tot2 = Number(tabla.get('totmat').value);
  //       let tot3 = Number(tabla.get('totequi').value);
  //       let tot4 = Number(tabla.get('totsubc').value);
  //       let tot5 = Number(tabla.get('totsubp').value);
  //       let totdir = Number(tabla.get('totdir').value);
  //       /* let totindir=Number(tabla.get('totmano').value); */
  //       let totalpr = Number(tabla.get('totalproy').value);
  //       tabla.get('totmano').setValue(tot1 - Number(tabla.value.data_source[indact].manoobra));
  //       tabla.get('totmat').setValue(tot2 - Number(tabla.value.data_source[indact].materiales));
  //       tabla.get('totequi').setValue(tot3 - Number(tabla.value.data_source[indact].equipos));
  //       tabla.get('totsubc').setValue(tot4 - Number(tabla.value.data_source[indact].subcontratos));
  //       tabla.get('totsubp').setValue(tot5 - Number(tabla.value.data_source[indact].subpartidas));
  //       tabla.get('totdir').setValue(totdir - Number(tabla.value.data_source[indact].total));
  //       /* tabla.get('totind').setValue(totindir); */
  //       tabla.get('totalproy').setValue(totalpr - Number(tabla.value.data_source[indact].total));
  //       //fila modificada
  //       this.ActElimArrCambios(tabla.value.data_source[indact], tabla.value.inserta, tabla.value.modifica, tabla.value.elimina);
  //       tabla.value.data_source.splice(indact, 1);
  //       console.table(tabla.value.inserta)
  //       console.table(tabla.value.modifica)
  //       console.table(tabla.value.elimina)
  //       tabla.value.editado = true;
  //     }
  //     else {
  //       this.toaster.error('El titulo seleccionado tiene contenido, eliminar su contenido previamente.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
  //     }
  //   }
  //   else {
  //     this.toaster.error('Seleccione una Fila para Mover.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
  //   }
  // }
  async subirtitulo(nroProyecto: any) {
    const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
    const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
    const tabla = (aspectos_generales.get('tabla_prueba') as UntypedFormGroup)
    // const datoaccs = await this.principalService.ConfgsAsignaUserProy({id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,id_usuario:this.idUsuario});
    // if(datoaccs?.length>0){
    //   if(datoaccs[0].presu==0){
    //     this.toaster.error('No tiene Permisos para Edición de Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    //     return
    //   }
    // }
    let presutemp = await this.presuservice.ExistePresuTemp({ id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto, id_usuario: this.idUsuario })
    if (presutemp.length > 0) {
      this.toaster.error('Tiene cambios sin guardar en Presupuesto. No puede modificar hasta guardar sus cambios.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
    else {
      let indact = tabla.value.filaSeleccionada;
      if (indact > -1) {
        if (indact > 0) {
          let filasub = JSON.parse(JSON.stringify(tabla.value.data_source[indact]));
          let filabaj = JSON.parse(JSON.stringify(tabla.value.data_source[indact - 1]));
          let itemsub = filasub.item;
          let itembaj = filabaj.item;
          filasub.item = itembaj;
          filabaj.item = itemsub;
          //fila modificada
          tabla.value.data_source[indact] = filabaj;
          if(tabla.value.data_source[indact].accion!=1)
            tabla.value.data_source[indact].accion = 2;
          this.ActfilCambios(tabla.value.data_source[indact].accion == 1 ? tabla.value.inserta : tabla.value.modifica, tabla.value.data_source[indact]);
          //fila modificada
          tabla.value.data_source[indact - 1] = filasub;
          if(tabla.value.data_source[indact - 1].accion!=1)
            tabla.value.data_source[indact - 1].accion = 2;
          this.ActfilCambios(tabla.value.data_source[indact-1].accion == 1 ? tabla.value.inserta : tabla.value.modifica, tabla.value.data_source[indact - 1]);
          tabla.value.filaSeleccionada = indact - 1;
          tabla.value.editado = true;
        }
        else {
          this.toaster.error('La fila ya no puede subir.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else {
        this.toaster.error('Seleccione una Fila para Mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
  }
  async bajartitulo(nroProyecto: any) {
    const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
    const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
    const tabla = (aspectos_generales.get('tabla_prueba') as UntypedFormGroup)
    // const datoaccs = await this.principalService.ConfgsAsignaUserProy({id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto,id_usuario:this.idUsuario});
    // if(datoaccs?.length>0){
    //   if(datoaccs[0].presu==0){
    //     this.toaster.error('No tiene Permisos para Edición de Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    //     return
    //   }
    // }
    let indact = tabla.value.filaSeleccionada;
    let presutemp = await this.presuservice.ExistePresuTemp({ id_proyecto: aspectos_generales.value.datos_recuperado.id_proyecto, id_usuario: this.idUsuario })
    if (presutemp.length > 0) {
      this.toaster.error('Tiene cambios sin guardar en Presupuesto. No puede modificar hasta guardar sus cambios.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
    else {
      if (indact > -1) {
        if (indact < tabla.value.data_source.length - 1) {
          let filasub = JSON.parse(JSON.stringify(tabla.value.data_source[indact + 1]));
          let filabaj = JSON.parse(JSON.stringify(tabla.value.data_source[indact]));
          let itemsub = filasub.item;
          let itembaj = filabaj.item;
          filasub.item = itembaj;
          filabaj.item = itemsub;
          //fila modificada
          tabla.value.data_source[indact + 1] = filabaj;
          if(tabla.value.data_source[indact + 1].accion!=1)
            tabla.value.data_source[indact + 1].accion = 2;
          this.ActfilCambios(tabla.value.data_source[indact + 1].accion == 1 ? tabla.value.inserta : tabla.value.modifica, tabla.value.data_source[indact + 1]);
          //fila modificada
          tabla.value.data_source[indact] = filasub;
          if(tabla.value.data_source[indact].accion!=1)
            tabla.value.data_source[indact].accion = 2;
          this.ActfilCambios(tabla.value.data_source[indact].accion == 1 ? tabla.value.inserta : tabla.value.modifica, tabla.value.data_source[indact]);
          tabla.value.filaSeleccionada = indact + 1;
          tabla.value.editado = true;
        }
        else {
          this.toaster.error('La fila ya no puede bajar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else {
        this.toaster.error('Seleccione una Fila para Mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
  }
  ActfilCambios(arrmodi: any, rowpri: any) {
    let eximodi = false;//actualizar en arreglo si existe
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
  // ActElimArrCambios(filaeli: any, arrinserta: any, arrmodifica: any, arrelimina: any) {
  //   if (filaeli.accion == 1) {//si se inserto, eliminamos de tabla insertar
  //     for (let i = 0; i < arrinserta.length; i++) {
  //       if (arrinserta[i].indice == filaeli.indice) {
  //         arrinserta.splice(i, 1);
  //         break;
  //       }
  //     }
  //   }
  //   else if (filaeli.accion == 2) {//si se actualizo la fila, se elimina de update y se agrega a eliminar
  //     for (let i = 0; i < arrmodifica.length; i++) {
  //       if (arrmodifica[i].indice == filaeli.indice) {
  //         arrmodifica.splice(i, 1);
  //         break;
  //       }
  //     }
  //     arrelimina.push(filaeli)
  //   }
  //   else if (filaeli.accion == 0) {//si no se hizo nada,se agrega a array eliminar
  //     arrelimina.push(filaeli)
  //     console.table(arrelimina)
  //   }
  // }
  async CancelarSubpresu(nroProyecto: any) {
    const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
    const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
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
      const formProyecto = (this.formProyecto.controls[nroProyecto] as UntypedFormGroup)
      const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
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
  async CalculaFechaFin(nrotab: any,valmod:any) {
    let formProyecto = (this.formProyecto.controls[nrotab] as UntypedFormGroup)
    let aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
    let datosProyecto = (aspectos_generales.get('datos_proyecto') as UntypedFormGroup)
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
  TeclaCalcFin(event: any) {
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  //pestañas de proyectos
  onNavChangepri(event: any) {
    //limpiar los datos de la derecha
    if (event.nextId == 1) {
      this.fila_sel2 = -1;
      this.fila_sel3 = -1;
      this.fila_sel4 = -1;
    }
    else if (event.nextId == 2) {
      this.fila_sel = -1;
      this.fila_sel3 = -1;
      this.fila_sel4 = -1;
    }
    else if (event.nextId == 3) {
      this.fila_sel = -1;
      this.fila_sel2 = -1;
      this.fila_sel4 = -1;
    }
    else if(event.nextId == 4){
      this.fila_sel = -1;
      this.fila_sel2 = -1;
      this.fila_sel3 = -1;
    }
    this.proyectoSeleccionado = null;
  }
  //papelera
  async onListarPap(princ = false) {
    try {
      this.datasourcepap = [];
      this.buscando2 = true;
      this.datasourcepap = await this.principalService.ListarProyPapelera(this.idUsuario);
      this.buscando2 = false;
      if (princ) {
        let cont = 0;
        for (let row of this.datasourcepap) {
          if (row.restante == 1) {
            cont++;
          }
        }
        if (cont > 0) {
          this.toaster.info('Hay ' + cont + ' Proyectos en Papelera que se pueden recuperar hasta hoy.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        }
      }
    }
    catch {
      this.buscando2 = false;
    }
  }
  cambindicesel2(row: any, ind: any) {
    //const row = this.datasourcepap[ind]
    if (row.nro == "") {
      if (ind == this.fila_sel2)
        this.fila_sel2 = -1;
      else {
        this.verDetalleProyecto(row);
        this.fila_sel2 = row.id_proyecto;
      }
    }
  }
  toggleOn2(id: string) {
    for (let row of this.datasourcepap) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 1;
        }
        else
          row.icomost = 1;
      }
    }
  }
  toggleOff2(id: string) {
    for (let row of this.datasourcepap) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 0;
        }
        else
          row.icomost = 0;
      }
    }
  }
  async eliminarPerma(row: any) {
    try {
      if (row.id_proyecto !== "") {
        const sw = await SwalService.confirm('Estas seguro?', 'Se eliminara el proyecto para siempre.')
        if (sw.isConfirmed) {
          const inputEliminar = {
            id_proyecto: row.id_proyecto
          }
          const respuesta = await this.principalService.eliminarProyecto(inputEliminar)
          if (respuesta.id == "0") {
            SwalService.error('Advertencia', respuesta.mensaje);
            await this.onListarPap()
          }
          else {
            SwalService.success()
            await this.onListarPap()
          }
        }
      }
    } catch (err) {
      SwalService.error(err)
    }
  }
  async RestaurarProy(row: any) {
    try {
      if (row.id_proyecto !== "") {
        const sw = await SwalService.confirm('Estas seguro?', 'El proyecto se movera a la pestaña Proyectos de Usuario.')
        if (sw.isConfirmed) {
          this.mostrar_carga_todo = true;
          const respuesta = await this.principalService.ActualizaElimnaproy({ id_proyecto: row.id_proyecto, accion: 1 });
          this.mostrar_carga_todo = false;
          if (respuesta?.id == "1") {
            SwalService.success('Correcto', respuesta.mensaje)
            await this.onListarPap()
            await this.onListar()
          }
        }
      }
    } catch (err) {
      SwalService.error(err)
    }
  }
  //compartidos
  async onListarComp() {
    try {
      this.datasourcecomp = [];
      this.buscando3 = true;
      this.datasourcecomp = await this.principalService.ListarProyCompartidos({ id_usuario: this.idUsuario });//cambiar con metodo para compartidos
      this.buscando3 = false;
    }
    catch {
      this.buscando3 = false;
    }
  }
  cambindicesel3(row: any, ind: any) {
    //const row = this.datasourcecomp[ind]
    if (row.nro == "") {
      if (ind == this.fila_sel3)
        this.fila_sel3 = -1;
      else {
        this.verDetalleProyecto(row);
        this.fila_sel3 = row.id_proyecto;
      }
    }
  }
  toggleOn3(id: string) {
    for (let row of this.datasourcecomp) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 1;
        }
        else
          row.icomost = 1;
      }
    }
  }
  toggleOff3(id: string) {
    for (let row of this.datasourcecomp) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 0;
        }
        else
          row.icomost = 0;
      }
    }
  }
  async CompartirProy(row: any) {
    const modalRef = this.modalService.open(ComparteproyComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
    modalRef.componentInstance.rowproy = row;
  }
  async DuplicarProye(row: any) {
    try {
      let maxproys = this.encriptadorService.recuperarlocalstory('maxproy');
      if(!isNaN(Number(maxproys))){
        let cont=0;
        for(let rows1 of this.dataSourceorg){
          if(rows1.id_proyecto!=''){
            cont++;
          }
        }
        cont=cont+this.datasourcepap.length;
        if(cont>=maxproys){
          this.toaster.error('Ya no puede crear proyectos. Su maximo permitido es '+maxproys+' incluidos los de la papelera.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
          return
        }
      }
      if(this.tabSeleccionado==2){
        this.mostrar_carga_todo = true;
        let resp = await this.principalService.FilaProyectoComp({ id_proyecto: row.id_proyecto, id_usuario: row.id_usuario, id_secundario: this.idUsuario });//cambiar con metodo para compartidos
        this.mostrar_carga_todo = false;
        if (resp.length == 0) {
          this.toaster.error('El proyecto ya no esta compartido.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
          this.onListarComp();
          return
        }
      }
      this.mostrar_carga_todo=true;
      await this.listarClasificacionProyectos()
      await this.listarGrupos()
      const departamentos = await this.listardepa()
      this.mostrar_carga_todo=false;
      const modalRef = this.modalService.open(ComparteproyComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
      modalRef.componentInstance.rowproy = row;
      modalRef.componentInstance.opcion = "duplica";
      modalRef.componentInstance.asignaund = this.tabSeleccionado==1?0:1;
      modalRef.componentInstance.clasificaciones = this.clasificaciones
      modalRef.componentInstance.grupos = this.grupos
      modalRef.componentInstance.departamentos = departamentos
      const result = await modalRef.result
      if(result=='listar'){
        this.onListar();
      }
    }
    catch (e) {
      console.log(e)
      this.mostrar_carga_todo = false;
      this.toaster.error('No se pudo terminar la copia del proyecto. Revisar si existe en Mis Proyectos y eliminarlo antes de volver a duplicar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      this.onListar();
    }
  }
  //Sistema
  async onListarSis() {
    try {
      this.datasourcesis = [];
      this.buscando4 = true;
      let res = await this.presuservice.BuscarProyAddPresu({ id_usuario: this.idUsuario,fuente:'0',tipo_proy:'',id_proyecto:'' });//fuente 1 proyectos usuario
      this.datasourcesis=res??[];
      this.buscando4 = false;
    }
    catch {
      this.buscando4 = false;
    }
  }
  cambindicesel4(row: any, ind: any) {
    //const row = this.datasourcesis[ind]
    if (row.nro == "") {
      if (ind == this.fila_sel4)
        this.fila_sel4 = -1;
      else {
        this.verDetalleProyecto(row);
        this.fila_sel4 = row.id_proyecto;
      }
    }
  }
  toggleOn4(id: string) {
    for (let row of this.datasourcesis) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 1;
        }
        else
          row.icomost = 1;
      }
    }
  }
  toggleOff4(id: string) {
    for (let row of this.datasourcesis) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 0;
        }
        else
          row.icomost = 0;
      }
    }
  }
  //configuracion proyecto
  cambiarcolor(value, i, columna) {
    if (columna == "cronograma") {
      this.dataSourceColor[i].cronograma = value;
    }
    if (columna == "presupuesto") {
      this.dataSourceColor[i].presupuesto = value;
    }
    if (columna == "presupuestoletra") {
      this.dataSourceColor[i].presupuestoletra = value;
    }
    if (columna == "presupuestotipo") {
      this.dataSourceColor[i].presupuestotipo = value;
    }
    if (columna == "cronogramaletra") {
      this.dataSourceColor[i].cronogramaletra = value;
    }
    if (columna == "cronogramatipo") {
      this.dataSourceColor[i].cronogramatipo = value;
    }
  }
  async cargarDatosConf(idproy) {
    try {
      this.mostrar_carga = true;
      this.bloqconf = true;
      this.dataSourceColor = this.filastabla;
      let respuesta = await this.principalService.ListarConfigProy({ id_proyecto: idproy });
      if (respuesta != null) {
        this.Frmdecimales = this.formBuilder.group({
          metrado: [respuesta.dec_metrado],
          precio: [respuesta.dec_precio],
          parcial: [respuesta.dec_parcial],
          cantidad: [respuesta.dec_cant],
        });
        for (let i = 0; i < this.dataSourceColor.length; i++) {
          this.dataSourceColor[i].presupuesto = respuesta.colorPresupuesto.toString().split('|')[i];
          this.dataSourceColor[i].presupuestoletra = respuesta.letraPresupuesto.toString().split('|')[i];
          this.dataSourceColor[i].presupuestotipo = respuesta.tipoPresupuesto.toString().split('|')[i];
          this.dataSourceColor[i].cronograma = []//respuesta.colorCronograma.toString().split('|')[i];
          this.dataSourceColor[i].cronogramaletra = []//respuesta.letraCronograma.toString().split('|')[i];
          this.dataSourceColor[i].cronogramatipo = []//respuesta.tipoCronograma.toString().split('|')[i];
        }
      }
      this.bloqconf = false;
      this.mostrar_carga = false;
    }
    catch (ex) {
      console.log(ex)
      this.bloqconf = false;
      this.mostrar_carga = false;
    }
  }
  async GuardarConfigsDec(tab: any) {//cambiar opcion del back para validar cuales se van a guardar, mantener la informacion de los decimales recuperados
    try {//detectar cambios en decimales para hacer el calculo o no de todo el proyecto
      const proyecto = (this.formProyecto.controls[tab] as UntypedFormGroup)
      const decimales = (proyecto.get('decimal') as UntypedFormControl)
      let valdec = decimales.value.toString().split('|');
      if (valdec[0] != this.frmdecmetrado.value.toString() || valdec[1] != this.frmdecprecio.value.toString() || valdec[2] != this.frmdecparcial.value.toString() || valdec[3] != this.frmdeccant.value.toString()) {
        const sw = await SwalService.confirm('Advertencia', 'Se volvera a calcular las operaciones en el Presupuesto. El proceso puede demorar.')
        if (sw.isConfirmed) {//papelera
          this.mostrar_carga_todo = true;
          let presutemp = await this.presuservice.ListarPresupuestoTemp({ id_proyecto: this.id_proyecto, id_usuario: this.idUsuario })
          let metradotemp = await this.formulaservice.listarCambiosTemporalesFormulaPolinomica({ id_proyecto: this.id_proyecto, id_usuario: this.idUsuario })
          let exismtemp = metradotemp ? JSON.parse(metradotemp.datatemp).length > 0 : false;
          let formulatemp = await this.metradoservice.listarCambiosTemporalesMetrado2({ id_proyecto: this.id_proyecto, id_usuario: this.idUsuario })
          let progratemp = await this.principalService.listarCambiosTemporalesProgramacion({ id_proyecto: this.id_proyecto, id_usuario: this.idUsuario })
          let exisptemp = progratemp ? JSON.parse(progratemp.dataprogra).dataPrincipal.length > 0 : false;
          if (presutemp.length <= 0 && !exismtemp && formulatemp.length <= 0 && !exisptemp) {//condicionar para que no haya temporales
            console.time('timemoddec');
            const datospas = {
              id_proyecto: this.id_proyecto,
              dec_metrado: this.frmdecmetrado.value,
              dec_precio: this.frmdecprecio.value,
              dec_parcial: this.frmdecparcial.value,
              dec_cant: this.frmdeccant.value
            }
            let respuesta = await this.principalService.ModificarConfigDecProy(datospas);
            console.timeEnd('timemoddec')
            if (respuesta != null) {
              if (respuesta.id == 1) {
                //recalcular todo el proyecto
                decimales.setValue(this.frmdecmetrado.value + '|' + this.frmdecprecio.value + '|' + this.frmdecparcial.value + '|' + this.frmdeccant.value);
                localStorage.setItem('tabs', JSON.stringify(this.formProyecto.value))
                this.mostrar_carga_todo = false;
                SwalService.success('Correcto', 'La cambios se guardaron correctamente.');
              }
              else {
                this.mostrar_carga_todo = false;
                SwalService.error('Advertencia', respuesta.mensaje)
              }
            }
          }
          else {
            this.mostrar_carga_todo = false;
            this.toaster.info('Existen cambios temporales, guardar antes de realizar cambios aqui.', 'Información', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          }
        }
      }
      else {
        this.toaster.info('No hay cambios para guardar.', 'Información', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e)
      SwalService.error('Advertencia', 'Ocurrio una excepción al momento de realizar la operación.')
    }
  }
  async GuardarConfigsColor(tab) {//cambiar opcion del back para validar cuales se van a guardar, mantener la informacion de los decimales recuperados
    try {//detectar cambios en decimales para hacer el calculo o no de todo el proyecto
      this.mostrar_carga = true;
      let colorpre = '';
      let letrapre = '';
      let tipopre = '';
      let colorcro = '';
      let letracro = '';
      let tipocro = '';
      for (let i = 0; i < this.dataSourceColor.length; i++) {
        if (i < this.dataSourceColor.length - 1) {
          colorpre = colorpre + this.dataSourceColor[i].presupuesto + "|";
          letrapre = letrapre + this.dataSourceColor[i].presupuestoletra + "|";
          tipopre = tipopre + this.dataSourceColor[i].presupuestotipo + "|";
          colorcro = colorcro + this.dataSourceColor[i].cronograma + "|";
          letracro = letracro + this.dataSourceColor[i].cronogramaletra + "|";
          tipocro = tipocro + this.dataSourceColor[i].cronogramatipo + "|";
        }
        else {
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
      }
      let respuesta = await this.principalService.ModificarConfigColProy(datospas);
      this.mostrar_carga = false;
      if (respuesta != null) {
        if (respuesta.id == 1) {
          SwalService.success('Correcto', 'Los cambios se guardaron correctamente.');
          const proyecto = (this.formProyecto.controls[tab] as UntypedFormGroup)
          const aspectab = (proyecto.get('aspectab') as UntypedFormControl)
          //asignar valor a la variable correspondiente
          let datos = {
            colorCronograma: colorcro,
            colorPresupuesto: colorpre,
            letraCronograma: letracro,
            letraPresupuesto: letrapre,
            tipoCronograma: tipocro,
            tipoPresupuesto: tipopre,
          };
          aspectab.setValue(JSON.stringify(datos));
          localStorage.setItem('tabs', JSON.stringify(this.formProyecto.value))
        }
        else {
          SwalService.error('Advertencia', 'Ocurrio una excepción al momento de realizar la operación.')
        }
      }
    }
    catch (e) {
      this.mostrar_carga = false;
      console.log(e)
      SwalService.error('Advertencia', 'Ocurrio una excepción al momento de realizar la operación.')
    }
  }
  reasignarColor(eve:any,ind:any){
    this.dataSourceColor[ind].presupuestoletra=eve.target.value;
  }
  Sincolor1(eve:any,ind:any){
    if(eve.target.checked){
      this.dataSourceColor[ind].presupuesto='none';
    }
    else{
      this.dataSourceColor[ind].presupuesto='#ffffff';
    }
  }
  reasignarColor1(eve:any,ind:any){
    this.dataSourceColor[ind].presupuesto=eve.target.value;
  }
  async enviarDataImpresion(index) {
    const tablaprueba = this.formProyecto.value[index].aspectos_generales.tabla_prueba
    const tabla1 = this.formProyecto.value[index].aspectos_generales.tabla_prueba?.data_source
    const arrayHeader = ['ITEM', 'DETALLE DE ESTRUCTURA', 'MANO DE OBRA', 'MATERIALES', 'EQUIPOS', 'SUB CONTRATOS', 'SUB PARTIDAS', 'TOTAL']
    const arrayKeys = ['item', 'descripcion', 'manoobra', 'materiales', 'equipos', 'subcontratos', 'subpartidas', 'total']
    const arralig=['center','left','right','right','right','right','right','right'];
    const tablaSubPresupuesto = tabla1
    let monedapas=this.formProyecto.value[index].aspectos_generales.datos_recuperado.moneda?(this.formProyecto.value[index].aspectos_generales.datos_recuperado.moneda.toString()=='1'?'$':'S/'):'S/';
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
      const obj2 = [
        { text: iterator.descripcion, colSpan: 4, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'left' },
        { text: iterator.abrev, colSpan: 1, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'center' },
        { text: iterator.formula, colSpan: 1, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'center' },
        { text: this.formService.redondeo(Number(iterator.monto.toString()),this.dec_parcial), colSpan: 2, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'right' },
      ]
      tablaTotales.push(obj2)
    }
    const datos = {
      datos_proyecto: this.formProyecto.value[index].aspectos_generales.datos_recuperado,
      header: arrayHeader,
      keys_body: arrayKeys,
      col_alig:arralig,
      tabla: tablaSubPresupuesto,
      tabla2: tablaTotales,
      concat_tabla2:true,
      tipo_reporte:0,
      moneda:monedapas,
      titulo:'RESUMEN DEL PROYECTO'
    }
    const modalRef = this.modalService.open(ReportesComponent,{size: 'lg modalgrande',backdrop: 'static',windowClass: 'pcoded',keyboard: false});
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
  async JuntarProy(){
    this.tvista=0;
    if((this.fila_sel??-1)!=-1){
      this.mostrar_carga=true;
      //verificar que tiene permisos de ejecucion
      const datoaccs = await this.principalService.ConfgsAsignaUserProy({id_proyecto: this.fila_sel,id_usuario:this.idUsuario});
      if(datoaccs?.length>0){
        if(datoaccs[0].presu==0){
          this.mostrar_carga=false;
          this.toaster.error('No tiene permisos de Edición de Presupuesto para este Proyecto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          return;
        }
      }
      this.datasourcePri=JSON.parse(JSON.stringify(this.dataSourceorg));
      for(let row of this.dataSourceorg){
        if(row.id_proyecto==this.fila_sel){
          this.datproy1=row;
        }
      }
      const aspectos = await this.principalService.ListarConfigProy({ id_proyecto: this.fila_sel })
      this.aspecpr1=aspectos;
      this.mostrar_carga=false;
      this.Modproyjunta.show();
    }
    else{
      this.toaster.error('Seleccione un proyecto al que se adjuntara otro.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
    }
  }
  async AccJunta(){
    try{
      let arrpermite=[];
      let edpresu=false;
      for(let ele of this.datacomp){
        arrpermite.push(ele.permite);
        if(ele.nombres=='EDICION DEL PRESUPUESTO' && ele.permite=='1'){
          edpresu=true;
        }
      }
      if(edpresu){
        this.mostrar_carga_todo = true;
        console.time('timetemp')
        let resp=await this.principalService.JuntarPoyecsRap({id_proyecto1:this.fila_sel,id_proyecto2:this.filaselpri,id_usuario:this.idUsuario,asignaund:this.fuentesel==3?'1':'0',admitidos:arrpermite.join('|')});
        console.timeEnd('timetemp')
        this.mostrar_carga_todo=false;
        if (resp?.id == "1") {
          this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          this.cerrarModJunta(1);
        }
        else {
          console.log(resp.mensaje);
          this.toaster.error(resp.mensaje, 'Error', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione Presupuesto para duplicar los elementos selececcionados.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      }
    }
    catch(ex){
      this.mostrar_carga_todo=false;
      console.log(ex)
      SwalService.error('Advertencia', 'Ocurrio una excepción al momento de realizar la operación. ');
    }
  }
  cerrarModJunta(dir:any){
    if(this.tvista==0 || (this.tvista==1 && dir==1)){
      this.datproy1=null;
      this.aspecpr1=null;
      this.datproy2=null;
      this.aspecpr2=null;
      this.datasourcePri=[];
      this.filaselpri=-1;
      this.tiposelj='';
      this.fuentesel=1;
      this.busquedajun='';
      for(let a=0;a<this.datacomp.length;a++){//algunos adaptan a 2 accesos
        this.datacomp[a].mostrar='1';
        this.datacomp[a].permite='1';
      }
      this.Modproyjunta.hide();
    }
    else{
      this.tvista=0;
      this.datproy2=null;
      this.aspecpr2=null;
    }
  }
  limpiarfiljun() {
    this.busquedajun = '';
  }
  async cambiarFuente(idfuente:any){
    this.filaselpri=-1;
    //this.fuentesel=idfuente;
    if(idfuente=="3"){
      this.buscandojun=true;
      this.datasourcePri=[];
      let rproyectos = await this.principalService.ListarProyCompartidos({id_usuario:this.idUsuario});//cambiar con metodo para compartidos
      for(let row of rproyectos){
        if(row.duplica=="1"){
          this.datasourcePri.push(row);
        }
      }
      this.buscandojun=false;
    }
    else{
      this.buscandojun=true;
      this.datasourcePri=[];
      let rproyectos = await this.presuservice.BuscarProyAddPresu({ id_usuario: this.idUsuario,fuente:idfuente,tipo_proy:this.tiposelj,id_proyecto:this.fila_sel });//idproyecto1
      this.datasourcePri=rproyectos;
      this.buscandojun=false;
    }
  }
  async cambiarTipoProy(tipo:any){
    this.filaselpri=-1;
    //this.tiposelj=tipo;
    if(this.fuentesel.toString()=="3"){
      this.buscandojun=true;
      this.datasourcePri=[];
      let rproyectos = await this.principalService.ListarProyCompartidos({id_usuario:this.idUsuario});//cambiar con metodo para compartidos
      for(let row of rproyectos){
        if(row.duplica=="1"){
          this.datasourcePri.push(row);
        }
      }
      this.buscandojun=false;
    }
    else{
      this.buscandojun=true;
      this.datasourcePri=[];
      let rproyectos = await this.presuservice.BuscarProyAddPresu({ id_usuario: this.idUsuario,fuente:this.fuentesel,tipo_proy:this.tiposelj,id_proyecto:this.fila_sel });//idproyecto1
      this.datasourcePri=rproyectos;
      this.buscandojun=false;
    }
  }
  cambindiceselpri(row:any,ind:any){
    if (row.nro == "") {
      if (ind == this.filaselpri)
        this.filaselpri = -1;
      else
        this.filaselpri = row.id_proyecto;
    }
  }
  async SigJunta(){
    if((this.filaselpri??-1)!=-1){
      if(this.fila_sel==this.filaselpri){
        this.toaster.error('No puede adjuntar el mismo proyecto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
      else{
        //condicionar configuraciones?
        for(let row of this.datasourcePri){
          if(row.id_proyecto==this.filaselpri){
            this.datproy2=row;
          }
        }
        const aspectos = await this.principalService.ListarConfigProy({ id_proyecto: this.filaselpri })
        this.aspecpr2=aspectos;
        if(this.aspecpr1.dec_cant==this.aspecpr2.dec_cant && this.aspecpr1.dec_metrado==this.aspecpr2.dec_metrado && this.aspecpr1.dec_precio==this.aspecpr2.dec_precio && this.aspecpr1.dec_parcial==this.aspecpr2.dec_parcial){
          if(this.fuentesel==3){//solo para compartidos, usar parametro permite
            let arrpermite=JSON.parse(this.datproy2.permite);
            let menproy = await this.encriptadorService.recuperarlocalstory('menu_proy');
            let arrmp=menproy?JSON.parse(menproy).split('|'):[0,0,0,0,0,0,0,0];
            arrmp.splice(0,1);//datosproy
            arrmp.splice(4,1);//programacion
            for(let a=0;a<this.datacomp.length;a++){//algunos adaptan a 2 accesos
              this.datacomp[a].mostrar=arrmp[a]=='1'?'1':'0';
              if(this.datacomp[a].nombres == 'FÓRMULA POLINÓMICA'){
                this.datacomp[a].mostrar='0';
                this.datacomp[a].permite='2';
              }
              if(this.datacomp[a].nombres == 'DISEÑO DE COSTOS INDIRECTOS'){
                this.datacomp[a].mostrar='0';
                this.datacomp[a].permite='2';
              }
              if(Number(arrpermite[a])==0){
                this.datacomp[a].permite='2';
              }
              else{
                this.datacomp[a].permite=arrpermite[a];
              }
            }
          }else{//habilita todo
            for(let a=0;a<this.datacomp.length;a++){//algunos adaptan a 2 accesos
              this.datacomp[a].mostrar='1';
              this.datacomp[a].permite='1';
              if(this.datacomp[a].nombres == 'FÓRMULA POLINÓMICA'){
                this.datacomp[a].mostrar='0';
                this.datacomp[a].permite='2';
              }
              if(this.datacomp[a].nombres == 'DISEÑO DE COSTOS INDIRECTOS'){
                this.datacomp[a].mostrar='0';
                this.datacomp[a].permite='2';
              }
            }
          }
          this.tvista=1;
        }
        else{
          this.toaster.error('Las configuraciones de Decimales deben ser iguales en ambos proyectos.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 });
        }
      }
    }
    else{
      this.toaster.error('Seleccione el proyecto para adjuntar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
    }
  }
  cambioselt2(row:any){
    if(row.permite==0){
      row.permite=1;
    }
    else{
      row.permite=0;
    }
  }
  async onTabChange(nuevoTab: any) {
    if(nuevoTab.campo==="decimal"){
      const tabs = JSON.parse(localStorage.getItem('tabs')||'[]')
      let tabIndex = tabs.findIndex((tab: any) => tab.indice_tab === nuevoTab.tab);
      if (tabIndex !== -1) {
        tabs[tabIndex][nuevoTab.campo] = nuevoTab.valor;
        localStorage.setItem('tabs', JSON.stringify(tabs));
      }
      const existe = this.formProyecto.value.find(tab => Number(tab.indice_tab) === nuevoTab.tab);
      if (existe) {
          // Obtener el índice del objeto en el FormArray
          const index = this.formProyecto.value.findIndex(tab => Number(tab.indice_tab) === nuevoTab.tab);
          // Actualizar el FormControl dentro del FormArray
          const formControl = (this.formProyecto as FormArray).at(index).get('decimal');
          if (formControl) {
              formControl.setValue(nuevoTab.valor);
          } else {
              console.error("No se encontró el FormControl 'decimal'");
          }
      } else {
          console.error("No se encontró el proyecto con el índice especificado.");
      }
    }else if(nuevoTab.campo==="aspectab"){
      const tabs = JSON.parse(localStorage.getItem('tabs')||'[]')
      let tabIndex = tabs.findIndex((tab: any) => tab.indice_tab === nuevoTab.tab);
      if (tabIndex !== -1) {
        tabs[tabIndex][nuevoTab.campo] = nuevoTab.valor
        localStorage.setItem('tabs', JSON.stringify(tabs));
      }
      const index = this.formProyecto.value.findIndex(tab => Number(tab.indice_tab) === nuevoTab.tab);
      if (index !== -1) {
          const formGroup = (this.formProyecto as FormArray).at(index) as FormGroup;
          if (formGroup) {
            formGroup.get('aspectab').setValue(nuevoTab.valor);
          } else {
              console.error("No se encontró el FormGroup en el FormArray");
          }
      } else {
          console.error("No se encontró el proyecto con el índice especificado.");
      }
    }else if(nuevoTab.campo==="datos_recuperado"){
      const formProyecto = (this.formProyecto.controls[nuevoTab.tab] as UntypedFormGroup)
      const aspectos_generales = (formProyecto.get('aspectos_generales') as UntypedFormGroup)
      const datosRecuperado = (aspectos_generales.get('datos_recuperado') as UntypedFormControl)
      datosRecuperado.setValue(nuevoTab.valor)
      localStorage.setItem('tabs', JSON.stringify(this.formProyecto.value))
      const tabs = JSON.parse(localStorage.getItem('tabs')||'[]')
    }
  }
}
