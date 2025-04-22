import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { paises, rowacu, rowpresu, tiposEstado, tiposMoneda, monedas, modalidades, estados } from '../principal/parametros-principal';
import { UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ToastrService } from 'ngx-toastr';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { ModalProyectoComponent } from '../principal/modal-proyecto/modal-proyecto.component';
import { SwalService } from 'src/app/servicios/swal.service';
import { ClasificacionService } from 'src/app/servicios/clasificacion.service';

@Component({
  selector: 'app-proysistema',
  templateUrl: './proysistema.component.html',
  styleUrls: ['./proysistema.component.scss']
})
export class ProysistemaComponent implements OnInit {
  @Input('height') height: number = 100;
  @ViewChild("nuevoProyecto") modalnuevo: ModalBasicComponent;
  @ViewChild("modalDetalleProyecto") modalDetalleProyecto: ModalBasicComponent;
  /* menuPrincipal$: Subscription = new Subscription() */
  /* arrayTabs$: Subscription = new Subscription() */
  tabSeleccionado = 1;
  preventscroll = false;
  paises = paises
  monedas = monedas
  modalidades = modalidades
  estados = estados
  departamentos = []
  provincias = []
  distritos = []
  clasificaciones = []
  grupos = []

  /* verMenuProyecto: boolean = false; */
  idUsuario: any;
  proyectoSeleccionado: any = null;
  active = 0
  mostrarModal: boolean = false;
  mostrar_carga = false;
  mostrar_carga_todo = false;

  expanded = false
  id_tipo: string;
  nombre: string;
  abrev: string;
  estado: any;
  tipoobr: any;
  ocultarMenu = false
  calculandofecha = false;
  titmodalcar: string;
  //tabla principal
  dataSourceorg = []//proyectos principal
  busqueda = '';
  buscando = false;
  fila_sel: any;

  dec_metrado = 2;
  mask_metrado = '0.2';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';
  buscatabla = false;

  formArrayProyecto = new UntypedFormGroup({
    formProyecto: new UntypedFormArray([], Validators.required)
  })
  get formProyecto() {
    return this.formArrayProyecto.controls['formProyecto'] as UntypedFormArray
  }
  id_proyecto = '';
  hoy = new Date();
  detallesproy: any;

  cargocompo = true;

  constructor(
    private encriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
    private principalService: PrincipalService,
    private _ClasificacionService: ClasificacionService,
    private modalService: NgbModal,
    private toaster: ToastrService,
    
  ) { }

  async ngOnInit() {
    /* let bloq = this.encriptadorService.recuperarlocalstory('bloqueaproy');
    if (bloq == 'false') {
      this.encriptadorService.guardarlocalstory('bloqueaproy', JSON.stringify(true));
    }
    else {
      this.cargocompo = false;
      this.router.navigate(['/principal/inicio']);
      this.toaster.error('El componente ya esta abierto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    } */
    await this.onResize(null)
    this.idUsuario = await this.encriptadorService.recuperarlocalstory('idusuario');
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
    this.onListar();
    /* this._PrincipalService.eliminarProyPerma({ id_usuario: this.idUsuario }) */
    /* this.menuPrincipal$ = this.variablesGlobalesService.menuPrincipal.subscribe(data => {
      if (data) {
        this.verMenuProyecto = false
      } else {
        this.verMenuProyecto = true
      }
    }) */
    /* const tabs = JSON.parse(localStorage.getItem('tabs'))
    if (tabs.length > 0) {
      this.mostrar_carga_todo = true
      await this.listarClasificacionProyectos()
      await this.listarGrupos()
      await this.listarDepartamentos()
      await tabs.reduce(async (a, tab, currentIndex) => {
        await a;
        await this.crearFormArrayProyecto(tab, currentIndex)
        await this.listarSubmetrado(currentIndex)
      }, Promise.resolve());
      this.mostrar_carga_todo = false
    } */
  }
  ngOnDestroy(): void {
    /* this.menuPrincipal$.unsubscribe()
    this.arrayTabs$.unsubscribe()
    this.variablesGlobalesService.arrayTabs.next([])
    this.variablesGlobalesService.menuPrincipal.next(true)
    if (this.cargocompo) {
      this.encriptadorService.guardarlocalstory('bloqueaproy', JSON.stringify(false));
    }
    localStorage.setItem('principal', JSON.stringify(true)) */
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // Get the browser window size
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
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  //recuperar datos
  async onListar() {
    try {
      this.dataSourceorg = [];
      this.buscando = true;
      this.dataSourceorg = await this.principalService.ListarProyectos(this.idUsuario,0);
      this.buscando = false;
    }
    catch {
      this.buscando = false;
    }
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
  async openModalProyecto(datos = null, editar = null, ver = null) {
    this.mostrar_carga_todo = true
    await this.listarClasificacionProyectos()
    await this.listarGrupos()
    const departamentos = await this.configuracionService.Departamento()
    console.log(this.grupos)
    const modalRef = this.modalService.open(ModalProyectoComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })//no cerrar el modal con ESC
    modalRef.componentInstance.editar = editar
    modalRef.componentInstance.datos = datos
    modalRef.componentInstance.ver = ver
    modalRef.componentInstance.clasificaciones = this.clasificaciones
    modalRef.componentInstance.grupos = this.grupos
    modalRef.componentInstance.departamentos = departamentos
    modalRef.componentInstance.idUsuario = this.idUsuario
    modalRef.componentInstance.fuente = 0
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
    const input = { activo: '1', id_usuario: this.idUsuario,fuente:0 }
    this.grupos = await this.configuracionService.listarGrupoProyecto(input);
  }
  async eliminarProyecto(row) {
    try {
      if (row.id_proyecto !== "") {
        // const sw = await SwalService.option3Check('Advertencia', 'Esta seguro que desea eliminar el Proyecto? ', 'Permanente','Papelera')
        // if (sw.isConfirmed) {//permanente
        //   // let arrproyab = (this.formArrayProyecto.value.formProyecto);
        //   // let exis = arrproyab.findIndex(ele => ele.id_proyecto == row.id_proyecto)
        //   // if (exis >= 0) {
        //   //   this.close(null, exis);
        //   // }
        //   this.mostrar_carga_todo = true;
        //   const respuesta = await this.principalService.eliminarProyecto({ id_proyecto: row.id_proyecto })
        //   this.mostrar_carga_todo = false;
        //   if (respuesta.id == "0") {
        //     SwalService.error('Advertencia', respuesta.mensaje);
        //     await this.onListar()
        //   }
        //   else {
        //     SwalService.success()
        //     await this.onListar()
        //   }
        // }
        // else if (sw.isDenied) {//papelera
        //   this.mostrar_carga_todo = true;
        //   const respuesta = await this.principalService.ActualizaElimnaproy({ id_proyecto: row.id_proyecto, accion: 0 });
        //   this.mostrar_carga_todo = false;
        //   if (respuesta?.id == "1") {
        //     SwalService.success('Correcto', respuesta.mensaje)
        //     await this.onListar()
        //     await this.onListarPap()
        //   }
        // }
        const sw = await SwalService.confirm('Estas seguro?', 'Se eliminará Permanentemente el proyecto y toda información relacionada')
        if (sw.isConfirmed) {
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
      }
    } catch (err) {
      SwalService.error(err)
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
  onNavChangepri(event: any) {
    //limpiar los datos de la derecha
    /* if (event.nextId == 1) {
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
    this.proyectoSeleccionado = null; */
  }
}
