import { ChangeDetectorRef, Component, HostListener, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { ClasificacionService } from 'src/app/servicios/clasificacion.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { ModalDataPartidaComponent } from '../../catalogos/catpartidas/modal-data-partida/modal-data-partida.component';
import { ModalGrupoPartidaComponent } from '../../catalogos/catpartidas/modal-grupo-partida/modal-grupo-partida.component';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
export interface rowPartida {
  id_partida: string;
  descripcion: string;
  id_unidad:string;
  unidad: string;
  precio: string;
  rendimiento: string;
  und_rendi: string;
  jornada: string;
  id_usuario: string;
  tipo_proy: string;
  fuente: string;
  agrupacion: string;
  esgrupo: any;
  referencia: string;
  advceros:any;
  itemord:any;
  usuario: string;
  mostrar: string;
  icomost: string;
  ind: string;
}
export interface nodoitem {
  nro:any;
  item:any;
  hijos:nodoitem[];
}

@Component({
  selector: 'app-partidas-sistema',
  templateUrl: './partidas-sistema.component.html',
  styleUrls: ['./partidas-sistema.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PartidasSistemaComponent implements OnInit {
  @Input('height') height: number = 100;
  paddingscroll = 17;
  buscandotabla = false;
  busqueda = '';
  busqueda2 = '';
  buscando: boolean = false;
  mostrar_carga = false;
  mostrar_carga_todo = false;
  fila_sel = -1;
  fila_sel2 = -1;
  tabSeleccionado = 1
  tipoProy= /* tipoInsumo[] = */ [];
  tipoProysel = '';
  tipoProysel2 = ''
  umedidas = [];
  detallepart = [];
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  edicionacu=false;
  iduser_local = "";
  rowconfig: any;
  //arreglo de objetos ordenados
  arrordenar:nodoitem[];
  datasourcePri: rowPartida[] = [];
  datasourcePri2: rowPartida[] = [];
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  partidaSeleccionada: any = null;
  mostrarModal: boolean;
  active: any = 1;
  expanded = false
  vistagrande = true;
  @ViewChild("modalDetalles") modaldetalle: ModalBasicComponent;
  @ViewChild("modalAddvarios") modalAddvar: ModalBasicComponent;
  rowSistema: boolean = false;
  listaUsuariosSistema: any = [];
  idUsuario = ''
  //duplicar varios
  filasellmp=-1;
  arregloseleccion=[];
  filaArrSel=-1;
  databusq=[];
  busqmul='';
  tiposel='';
  fuentesel=0;
  textoDuplicar: string = 'SI';
  FormConf = new UntypedFormGroup({
    seltipoproy: new UntypedFormControl(''),
  })
  get seltipoproy(): UntypedFormControl { return this.FormConf.get('seltipoproy') as UntypedFormControl }
  formDataPartida = new UntypedFormGroup({
    duparc:new UntypedFormControl(true)
  })
  get duparc(): UntypedFormControl { return this.formDataPartida.get('duparc') as UntypedFormControl }
  
  constructor(
    private modalService: NgbModal,
    private encriptadorService: EncriptadorService,
    private catalogosService: CatalogosService,
    private _ClasificacionService: ClasificacionService,
    private adminservice: AdministradorService,
    private changeDetector: ChangeDetectorRef,
    private configuracionService: ConfiguracionService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    try {
      this.mostrar_carga = true
      this.iduser_local = this.encriptadorService.recuperarlocalstory('idusuario');
      this.aspectos = JSON.parse(this.encriptadorService.recuperarlocalstory('aspectostablas'));
      this.pintar();
      await this.asignarbody()
      await this.listarMantenimientoUsuarios()
      await this.listarClasificacionProyectos();
      await this.listarPartidasSistemaData(this.tipoProysel)
      await this.listarPartidasUserData(this.tipoProysel2)
      await this.listarMedidas();
      this.mostrar_carga = false
    } catch (e) {
      console.log(e);
      this.mostrar_carga = false
      SwalService.error()
    }
  }
  async asignarbody() {
    var resto = 170;
    if (document.body.clientWidth < 576)
      resto = resto + 76;
    this.height = window.innerHeight - resto;
    if ((document.body.clientWidth < 768)) {
      this.mostrarModal = true
      this.vistagrande = false;
    } else {
      this.mostrarModal = false
      this.vistagrande = true;
      // this.cerrarModal() 
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 170;
    if (document.body.clientWidth < 576)
      resto = resto + 76;
    this.height = window.innerHeight - resto;
    if ((document.body.clientWidth < 768)) {
      this.mostrarModal = true;
      this.vistagrande = false;
    } else {
      this.mostrarModal = this.expanded?true:false;
      this.vistagrande = true;
      if(!this.expanded){
        this.cerrarModal()
      }
    }
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    //cambiar ancho del scroll
    var element = document.getElementById('horscrollbod');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll != sizeef) {
        this.paddingscroll = sizeef;
      }
    }
  }
  pintar() {
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }
  SyncScroll(phoneFaceId) {
    var face1 = document.getElementById("horscrollbod");
    var face2 = document.getElementById("horscrollhead");
    if (phoneFaceId == "horscrollbod") {
      face2.scrollLeft = face1.scrollLeft;
    }
    else {
      face1.scrollLeft = face2.scrollLeft;
    }
  }
  async listarMantenimientoUsuarios() {
    this.listaUsuariosSistema = await this.configuracionService.ListarMantenimientoUsuarios()
  }
  async listarClasificacionProyectos() {
    try {
      const input = {
        activo: '1'
      }
      this.tipoProy = await this._ClasificacionService.ListarClasificacion(input);
      if(this.tipoProy.length>0){
        this.tipoProysel=this.tipoProy[0].id_clasificacion;
        this.tipoProysel2=this.tipoProy[0].id_clasificacion;
      }
    } catch (e) {
      console.log(e);
      SwalService.error()
    }
  }
  async listarPartidasUserData(tipo: any) {
    this.buscando = true
    this.datasourcePri2 = []
    const input = {
      fuente: 1,
      id_usuario: this.idUsuario,
      tipo_proy: tipo
    }
    this.datasourcePri2 = await this.catalogosService.ListarDataPartidasUser(input)
    this.buscando = false
  }

  async listarPartidasSistemaData(tipo: any) {
    this.buscando = true
    this.datasourcePri = []
    const input = {
      fuente: 0,
      tipo_proy: tipo
    }
    this.datasourcePri = await this.catalogosService.ListarDataPartidas(input)
    this.buscando = false
  }

  async cambiarUsuario() {
    await this.listarPartidasUserData(this.tipoProysel2)
  }
  limpiarfiltro2() {
    this.busqueda2 = '';
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  cambiarTipoProy(idtipo: any) {
    if (this.tabSeleccionado == 2) {
      this.tipoProysel2 = idtipo;
      this.fila_sel2=-1;
      this.listarPartidasUserData(this.tipoProysel2);
    } else {
      this.tipoProysel = idtipo;
      this.fila_sel=-1;
      this.listarPartidasSistemaData(this.tipoProysel);
    }
    this.partidaSeleccionada = null;
    this.detallepart = [];
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambindicesel(row: any, ind: any) {
    if (ind != this.fila_sel) {
      this.edicionacu=true;
      this.fila_sel = ind;
      if (!this.mostrarModal) {
        if (row.esgrupo == 1) {
          this.openVisualizador(row, 1, true, false)
        }
        else {
          this.listarMedidas();
          this.partidaSeleccionada = row
          this.rowSistema = null
          this.buscandotabla = true;
          this.detallepart = [];
          this.buscandotabla = false;
          if (this.mostrarModal) {
            this.modaldetalle.show();
          }
        }
      }
    }
  }
  cambindicesel2(row: any, ind: any) {
    if (ind != this.fila_sel2) {
      this.edicionacu=false;
      this.fila_sel2 = ind;
      if (!this.mostrarModal) {
        if (row.esgrupo == 1) {
          this.openVisualizador(row, 1, true, false)
        }
        else {
          this.listarMedidas();
          this.partidaSeleccionada = row
          this.rowSistema = null
          this.buscandotabla = true;
          this.detallepart = [];
          this.buscandotabla = false;
          if (this.mostrarModal) {
            this.modaldetalle.show();
          }
        }
      }
    }
  }
  async openVisualizador(row, active = 1, loader = true, sistema = false) {
    /* if (loader) {
      this.mostrar_carga_todo = true;
    } */
    //this.expanded = false
    this.listarMedidas();
    this.partidaSeleccionada = row
    this.active = active
    this.rowSistema = sistema
    this.buscandotabla = true;
    this.detallepart = [];
    let tablas = await this.catalogosService.ListarDetalleDataPartidas({ id_partida: row.id_partida });
    this.detallepart=tablas;
    this.buscandotabla = false;
    /* if (loader) {
      this.mostrar_carga_todo = false;
    } */
    if (this.mostrarModal) {
      this.modaldetalle.show();
    }
  }
  async openModalGrupo(tabsel: any) {//0:usuario,1:fuente
    try {
      this.mostrar_carga_todo = true;
      let opcfila = false;
      let filascambitem = [];
      if (this.fila_sel != -1) {
        let rowactual = this.datasourcePri[this.fila_sel];
        if (rowactual.agrupacion.split('.').length == 1) {
          opcfila = true;
          //pushear las filas que se van a actualizar y pasar al modal
          for (let i = this.fila_sel; i < this.datasourcePri.length; i++) {
            filascambitem.push(this.datasourcePri[i]);
          }
        }
      }
      const modalRef = this.modalService.open(ModalGrupoPartidaComponent, {size: 'md',backdrop: 'static',windowClass: 'pcoded',keyboard: false})//no cerrar el modal con ESC
      modalRef.componentInstance.tipoProy = this.tipoProy;
      modalRef.componentInstance.titmodal = 'Agregar Titulo';
      modalRef.componentInstance.fuente = tabsel;
      modalRef.componentInstance.id_usuario = this.iduser_local;
      modalRef.componentInstance.tipoproysel = this.tipoProysel;
      //modalRef.componentInstance.datarestr = this.datasourcePri2;
      modalRef.componentInstance.opcfila = opcfila;
      modalRef.componentInstance.filascambit = filascambitem;
      modalRef.componentInstance.estitulo = true;
      this.mostrar_carga_todo = false
      const result = await modalRef.result
      if (result) {
        if (result.respuesta.id == '0') {
          SwalService.error('Advertencia', result.respuesta.mensaje)
        }
        else {
          this.toaster.success('Se agrego correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        this.mostrar_carga_todo=true;
        if (tabsel == 0) {
          //await this.listarPartidasUserData(this.tipoProysel2)
          if(result.posinserta=="0"){//final
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            let indsel=this.datasourcePri.length;
            for(let i=this.datasourcePri.length;i<arract.length;i++){
              this.datasourcePri.push(arract[i]);
            }
            this.cambindicesel(this.datasourcePri[indsel],indsel);
          }
          else if(result.posinserta=="1"){//inicio
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            let cantadd=arract.length-this.datasourcePri.length;
            for(let a=cantadd-1;a>=0;a--){
              this.datasourcePri.unshift(arract[a]);
            }
            for(let i=cantadd;i<this.datasourcePri.length;i++){
              //cambia indice, solo indice
              this.datasourcePri[i].agrupacion=arract[i].agrupacion;
              this.datasourcePri[i].itemord=arract[i].itemord;
              this.datasourcePri[i].ind=arract[i].ind;
            }
            this.cambindicesel(this.datasourcePri[0],0);
          }
          else if(result.posinserta=="2"){//sobre
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            let cantadd=arract.length-this.datasourcePri.length;
            let indini=this.fila_sel;
            for(let a=0;a<cantadd;a++){
              this.datasourcePri.splice(indini,0,arract[indini]);
              indini++;
            }
            for(let i=indini;i<this.datasourcePri.length;i++){
              //cambia indice, solo indice
              this.datasourcePri[i].agrupacion=arract[i].agrupacion;
              this.datasourcePri[i].itemord=arract[i].itemord;
              this.datasourcePri[i].ind=arract[i].ind;
            }
            this.cambindicesel(this.datasourcePri[this.fila_sel],this.fila_sel);
          }
          else if(result.posinserta=="3"){//bajo
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            let agrucompara=this.datasourcePri[this.fila_sel].agrupacion;
            let indopera=-1;
            for(let a=this.fila_sel;a<this.datasourcePri.length;a++){
              if (this.datasourcePri[a].agrupacion.split('.').length == agrucompara.split('.').length)
              {
                if (this.datasourcePri[a].agrupacion != agrucompara)
                {
                  indopera = a;
                  break;
                }
              }
            }
            indopera=indopera==-1?this.datasourcePri.length:indopera;
            let cantadd=arract.length-this.datasourcePri.length;
            let indini=indopera;
            let indsel=indopera;
            for(let a=0;a<cantadd;a++){
              this.datasourcePri.splice(indini,0,arract[indini]);
              indini++;
            }
            for(let i=indini;i<this.datasourcePri.length;i++){
              //cambia indice, solo indice
              this.datasourcePri[i].agrupacion=arract[i].agrupacion;
              this.datasourcePri[i].itemord=arract[i].itemord;
              this.datasourcePri[i].ind=arract[i].ind;
            }
            this.cambindicesel(this.datasourcePri[indsel],indsel);
          }
        }
        this.mostrar_carga_todo = false
        /* else {
          await this.listarPartidasSistemaData(this.tipoProysel)
        } */
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
    }
  }
  async openModalSubgrupo(row: any, tabsel: any) {
    try {
      this.mostrar_carga_todo = true
      let opcfila = row.agrupacion.split('.').length==1?false:true;
      let filascambitem = [];
      if (this.fila_sel != -1) {
        //pushear las filas que se van a actualizar y pasar al modal
        let indpri = this.fila_sel;
        let condicion = row.agrupacion.substring(0, row.agrupacion.lastIndexOf('.') + 1);//vacio si es titulo(1er nivel), 1. o 1.1.
        for (let i = indpri; i < this.datasourcePri.length; i++) {
          var palabra = this.datasourcePri[i].agrupacion.toString().substring(0, condicion.length)
          if (palabra === condicion) {
            filascambitem.push(this.datasourcePri[i]);
          }//desde la fila seleccionada
          /* else {
            break;
          } */
        }
      }
      const modalRef = this.modalService.open(ModalGrupoPartidaComponent, {size: 'md',backdrop: 'static',windowClass: 'pcoded',keyboard: false})//no cerrar el modal con ESC
      modalRef.componentInstance.tipoProy = this.tipoProy;
      modalRef.componentInstance.filasel = row;
      modalRef.componentInstance.titmodal = 'Agregar SubTitulo';
      modalRef.componentInstance.fuente = tabsel;
      modalRef.componentInstance.tipoproysel = row.tipo_proy;
      modalRef.componentInstance.id_usuario = this.iduser_local;
      //modalRef.componentInstance.datarestr = this.datasourcePri2;
      modalRef.componentInstance.estitulo = false;
      modalRef.componentInstance.opcfila = opcfila;
      modalRef.componentInstance.filascambit = filascambitem;

      this.mostrar_carga_todo = false
      const result = await modalRef.result
      if (result) {
        if (result.respuesta.id == '0') {
          SwalService.error('Advertencia', result.respuesta.mensaje)
        }
        else {
          this.toaster.success('Se agrego correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        this.mostrar_carga_todo = true;
        if (tabsel == 0) {
          //await this.listarPartidasUserData(this.tipoProysel2)
          if(result.posinserta=="0"){//final
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            let agrucompara=this.datasourcePri[this.fila_sel].agrupacion;
            let indopera=-1;
            for(let a=this.fila_sel;a<this.datasourcePri.length;a++){
              if (this.datasourcePri[a].agrupacion.split('.').length == agrucompara.split('.').length)
              {
                if (this.datasourcePri[a].agrupacion != agrucompara)
                {
                  indopera = a;
                  break;
                }
              }
              else if(this.datasourcePri[a].agrupacion.split('.').length < agrucompara.split('.').length){
                indopera = a;
                  break;
              }
            }
            indopera=indopera==-1?this.datasourcePri.length:indopera;//actualizar todas las filas
            let cantadd=arract.length-this.datasourcePri.length;
            let indini=indopera;
            let indsel=indopera;
            for(let a=0;a<cantadd;a++){
              this.datasourcePri.splice(indini,0,arract[indini]);
              indini++;
            }
            for(let i=indini;i<this.datasourcePri.length;i++){
              this.datasourcePri[i].agrupacion=arract[i].agrupacion;
              this.datasourcePri[i].itemord=arract[i].itemord;
              this.datasourcePri[i].ind=arract[i].ind;
            }
            this.cambindicesel(this.datasourcePri[indsel],indsel);
          }
          else if(result.posinserta=="1"){//inicio
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            let cantadd=arract.length-this.datasourcePri.length;
            let indini=this.fila_sel+1;
            let indsel=this.fila_sel+1;
            for(let a=0;a<cantadd;a++){
              this.datasourcePri.splice(indini,0,arract[indini]);
              indini++;
            }
            for(let i=indini;i<this.datasourcePri.length;i++){
              this.datasourcePri[i].agrupacion=arract[i].agrupacion;
              this.datasourcePri[i].itemord=arract[i].itemord;
              this.datasourcePri[i].ind=arract[i].ind;
            }
            this.cambindicesel(this.datasourcePri[indsel],indsel);
          }
          else if(result.posinserta=="2"){//sobre
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            let cantadd=arract.length-this.datasourcePri.length;
            let indini=this.fila_sel;
            let indsel=this.fila_sel;
            for(let a=0;a<cantadd;a++){
              this.datasourcePri.splice(indini,0,arract[indini]);
              indini++;
            }
            for(let i=indini;i<this.datasourcePri.length;i++){
              this.datasourcePri[i].agrupacion=arract[i].agrupacion;
              this.datasourcePri[i].itemord=arract[i].itemord;
              this.datasourcePri[i].ind=arract[i].ind;
            }
            this.fila_sel=-1;
            this.cambindicesel(this.datasourcePri[indsel],indsel);
          }
          else if(result.posinserta=="3"){//bajo
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            let agrucompara=this.datasourcePri[this.fila_sel].agrupacion;
            let indopera=-1;
            for(let a=this.fila_sel;a<this.datasourcePri.length;a++){
              if (this.datasourcePri[a].agrupacion.split('.').length == agrucompara.split('.').length)
              {
                if (this.datasourcePri[a].agrupacion != agrucompara)
                {
                  indopera = a;
                  break;
                }
              }
              else if(this.datasourcePri[a].agrupacion.split('.').length < agrucompara.split('.').length){
                indopera = a;
                  break;
              }
            }
            indopera=indopera==-1?this.datasourcePri.length:indopera;
            let cantadd=arract.length-this.datasourcePri.length;
            let indini=indopera;
            let indsel=indopera;
            for(let a=0;a<cantadd;a++){
              this.datasourcePri.splice(indini,0,arract[indini]);
              indini++;
            }
            for(let i=indini;i<this.datasourcePri.length;i++){
              //cambia indice, solo indice
              this.datasourcePri[i].agrupacion=arract[i].agrupacion;
              this.datasourcePri[i].itemord=arract[i].itemord;
              this.datasourcePri[i].ind=arract[i].ind;
            }
            this.cambindicesel(this.datasourcePri[indsel],indsel);
          }
        }
        this.mostrar_carga_todo = false
        /* else {
          await this.listarPartidasSistemaData(this.tipoProysel)
        } */
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
    }
  }
  async openModal(fuente: any, esgrupo: any, datos = null, editar = null, duplicar = null, pasarpadre = false) {
    try {
      if (esgrupo == 0) {
        this.mostrar_carga_todo = true
        const modalRef = this.modalService.open(ModalGrupoPartidaComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})//no cerrar el modal con ESC
        let aux = [];
        for (let ini = datos.ind + 1; ini < this.datasourcePri.length; ini++) {
          var palabra = this.datasourcePri[ini].agrupacion?.toString().substring(0, datos.agrupacion.toString().length + 1)
          if (this.datasourcePri[ini].agrupacion == datos.agrupacion || palabra == (datos.agrupacion + '.')) {
            aux.push(this.datasourcePri[ini]);
          }
          else {
            break;
          }
        }
        modalRef.componentInstance.tipoProy = this.tipoProy;
        modalRef.componentInstance.tipoproysel = datos.tipo_proy;
        modalRef.componentInstance.filasel = datos;
        modalRef.componentInstance.titmodal = datos.agrupacion?.split('.').length > 1 ? 'Editar SubTitulo' : 'Editar Titulo';
        modalRef.componentInstance.fuente = fuente;
        modalRef.componentInstance.id_usuario = this.iduser_local;
        modalRef.componentInstance.editar = true;
        modalRef.componentInstance.detallegru = aux;

        this.mostrar_carga_todo = false
        const result = await modalRef.result
        if (result) {
          if (result.id == '0') {
            SwalService.error('Advertencia', result.mensaje)
          }
          else {
            this.toaster.success('Se actualizó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          }
          if (fuente == 0) {
            //await this.listarPartidasUserData(this.tipoProysel2)
            this.mostrar_carga_todo = true;
            let indfila=this.fila_sel;
            this.fila_sel=-1;
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            this.datasourcePri[indfila].descripcion=arract[indfila].descripcion;
            this.cambindicesel(arract[indfila],indfila);
            this.mostrar_carga_todo = false;
          }
          /* else {
            await this.listarPartidasSistemaData(this.tipoProysel)
          } */
        }
      }
      else {
        if (editar) {
          this.mostrar_carga_todo = true;
          //this.expanded = false
          this.listarMedidas();
          this.partidaSeleccionada = datos
          this.active = 1
          this.rowSistema = false
          this.buscandotabla = true;
          this.detallepart = [];
          let tabdet=await this.catalogosService.ListarDetalleDataPartidas({ id_partida: datos.id_partida });
          this.detallepart = tabdet;
          this.buscandotabla = false;
          this.mostrar_carga_todo = false;
          if (this.mostrarModal) {
            this.modaldetalle.show();
          }
        }
        else {
          this.mostrar_carga_todo = true
          let opcfila = this.rowconfig.unidad == '' ? true : false;
          let filascambitem = [];//revisar opciones de agrega partida
          let dataopera = [];
          if (this.tabSeleccionado == 1) {
            dataopera = this.datasourcePri;
          }
          else {
            dataopera = this.datasourcePri2;
          }
          //pushear las filas que se van a actualizar y pasar al modal
          let condicion = this.rowconfig.agrupacion.substring(0, this.rowconfig.agrupacion.lastIndexOf('.') + 1);//vacio si es titulo(1er nivel), 1. o 1.1.
          let empieza=false;
          for (let i = 0; i < dataopera.length; i++) {
            if(empieza){
              let palabra = dataopera[i].agrupacion.toString().substring(0, condicion.length)
              if (palabra === condicion) {
                filascambitem.push(dataopera[i]);//pasar desde la seleccion hasta el final
              }//desde la fila seleccionada
            }
            else{
              if(this.rowconfig.agrupacion==dataopera[i].agrupacion){
                filascambitem.push(dataopera[i]);//pasar desde la seleccion hasta el final
                empieza=true;
              }
            }
          }
          let filapadre = this.rowconfig;
          if (pasarpadre) {
            let indice = this.rowconfig.agrupacion.toString().lastIndexOf('.');
            let agrucompara = this.rowconfig.agrupacion.includes('.') ? this.rowconfig.agrupacion.substring(0, indice) : this.rowconfig;//si es duplicar del usuario cargar directamente, sino no se cargara nada
            for (let row of dataopera) {
              if (row.agrupacion == agrucompara) {
                filapadre = row;
              }
            }
          }
          await this.listarMedidas();
          let detallespart = await this.catalogosService.ListarDetalleDataPartidas({ id_partida: datos != null && duplicar ? datos.id_partida : '0' });
          const modalRef = this.modalService.open(ModalDataPartidaComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})//no cerrar el modal con ESC
          modalRef.componentInstance.partidacondiciona=this.rowconfig;
          modalRef.componentInstance.duplicar = duplicar;//para duplicar
          modalRef.componentInstance.sistema = this.tabSeleccionado == 2 ? 1 : 0;//para duplicar
          modalRef.componentInstance.datos = datos;
          modalRef.componentInstance.detallepartidas = detallespart.length>0?detallespart[0]:[];
          modalRef.componentInstance.tipoProy = this.tipoProy;
          modalRef.componentInstance.catalogoPartida = false;
          modalRef.componentInstance.fuente = fuente;
          modalRef.componentInstance.tipoproysel=datos.tipo_proy;//cargar los tipos de proyecto ***
          modalRef.componentInstance.agrupsel=filapadre.agrupacion;
          modalRef.componentInstance.fuentecrea=0;//catalogo de sistema
          modalRef.componentInstance.medidas = this.umedidas;
          modalRef.componentInstance.padre = filapadre;//pasarpadre?filapadre:null;
          modalRef.componentInstance.opcfila = duplicar ? true : opcfila;
          modalRef.componentInstance.filascambit = filascambitem;
          modalRef.componentInstance.fondo = this.titulo1;
          modalRef.componentInstance.color = this.titulo1color;
          modalRef.componentInstance.letra = this.titulo1letra;
          modalRef.componentInstance.subpartdup=duplicar?detallespart[1]:[];
          this.mostrar_carga_todo = false
          const result = await modalRef.result
          if (result.respuesta) {
            this.mostrar_carga_todo = true;
            //await this.listarPartidasUserData(this.tipoProysel2)
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            //let agregado=false;
            let indadd=-1;
            for(let i=0;i<this.datasourcePri.length;i++){
              if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
                this.datasourcePri.splice(i,0,arract[i]);
                //agregado=true;
                indadd=i;
              }
              else{
                this.datasourcePri[i].referencia=arract[i].referencia;
                this.datasourcePri[i].agrupacion=arract[i].agrupacion;
                this.datasourcePri[i].itemord=arract[i].itemord;
                this.datasourcePri[i].ind=arract[i].ind;
              }
            }
            if(arract.length>this.datasourcePri.length){
              for(let indaux=this.datasourcePri.length;indaux<arract.length;indaux++){
                this.datasourcePri.push(arract[indaux]);
                indadd=indaux;
              }
            }
            if(this.tabSeleccionado==1){
              this.cambindicesel(this.datasourcePri[indadd],indadd);
            }
            this.mostrar_carga_todo = false;
            // const insumoRecuperado = await this.dataSource2.data.find(data => data.id_insumo == datos.id_insumo)
            // await this.openVisualizador(insumoRecuperado)
          }
          else if(result.actuapri==true){//actualizar tabla
            this.mostrar_carga_todo = true;
            let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
            let indadd=-1;
            for(let i=0;i<this.datasourcePri.length;i++){
              if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
                this.datasourcePri.splice(i,0,arract[i]);
                indadd=i;
              }
              else{
                this.datasourcePri[i].referencia=arract[i].referencia;
                this.datasourcePri[i].agrupacion=arract[i].agrupacion;
                this.datasourcePri[i].itemord=arract[i].itemord;
                this.datasourcePri[i].ind=arract[i].ind;
              }
            }
            if(arract.length>this.datasourcePri.length){
              for(let indaux=this.datasourcePri.length;indaux<arract.length;indaux++){
                this.datasourcePri.push(arract[indaux]);
                indadd=indaux;
              }
            }
            if(this.tabSeleccionado==1){
              this.cambindicesel(this.datasourcePri[indadd],indadd);
            }
            this.mostrar_carga_todo = false;
          }
          this.mostrar_carga_todo=false;
        }
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      this.toaster.error('No se pudo cargar los datos.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      console.log(e);
    }
  }
  async listarMedidas() {
    this.umedidas = []
    const activo = {
      id_usuario:this.iduser_local,
      fuente:0,
      activo: 1,
      operador:1//no carga las unidades con operacion
    }
    this.umedidas = await this.adminservice.listarUnidadMed(activo)
  }
  cerrarModal() {
    //limpiar valores
    this.modaldetalle.hide();
  }
  async cargar(e) {
    if (this.tabSeleccionado == 2) {
      await this.listarPartidasUserData(this.tipoProysel2)
      let insumoRecuperado = await this.datasourcePri2.find(data => data.id_partida == e)
      await this.openVisualizador(insumoRecuperado, 1, false)
    } else {
      this.mostrar_carga_todo=true;
      let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: /* this.iduser_local */'', tipo_proy: this.tipoProysel })
      let indcamb=this.fila_sel;
      let insumoRecuperado;
      for(let i=0;i<this.datasourcePri.length;i++){
        if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
          this.datasourcePri.splice(i,0,arract[i]);
          indcamb=indcamb>i?indcamb+1:indcamb;
        }
        else{
          this.datasourcePri[i].referencia=arract[i].referencia;
          this.datasourcePri[i].agrupacion=arract[i].agrupacion;
          this.datasourcePri[i].itemord=arract[i].itemord;
          this.datasourcePri[i].ind=arract[i].ind;
          if(this.datasourcePri[i].id_partida==e){
            this.datasourcePri[i].descripcion=arract[i].descripcion;
            this.datasourcePri[i].id_unidad=arract[i].id_unidad;
            this.datasourcePri[i].unidad=arract[i].unidad;
            this.datasourcePri[i].rendimiento=arract[i].rendimiento;
            this.datasourcePri[i].jornada=arract[i].jornada;
            this.datasourcePri[i].und_rendi=arract[i].und_rendi;
            this.datasourcePri[i].precio=arract[i].precio;
            this.datasourcePri[i].advceros=arract[i].advceros;
            insumoRecuperado=this.datasourcePri[i];
          }
        }
      }
      if(arract.length>this.datasourcePri.length){
        for(let indaux=this.datasourcePri.length;indaux<arract.length;indaux++){
          this.datasourcePri.push(arract[indaux]);
        }
      }
      this.fila_sel=indcamb;
      this.mostrar_carga_todo=false;
      await this.openVisualizador(insumoRecuperado, 1, false)
    }
  }
  buscarNodo(item:any,arrbusca:any){
    let nodoret;
    for(let row of arrbusca){
      var palabra = item.toString().substring(0, row.item.toString().length + 1)
      if(row.item==item){
        nodoret=row;
        break;
      }
      else if(palabra==row.item+'.'){
        nodoret=this.buscarNodo(item,row.hijos);
      }
    }
    return nodoret;
  }
  AsigItemNodoHijo(item:any,hijos:any,arrins:any){
    for(let row of hijos){
      let itempasa=item+'.'+row.nro;
      arrins.push(itempasa);
      if(row.hijos.length>0){
        this.AsigItemNodoHijo(itempasa,row.hijos,arrins);
      }
    }
  }
  async eliminarDataInsumo(row: any, fuente: any) {
    try {
      let desccorta = row.descripcion.length > 80 ? row.descripcion.substring(0, 80) : row.descripcion;
      let mensaje = row.esgrupo == 0 ? "Se eliminará el Titulo/Subtitulo " + desccorta + " y todas las partidas que contiene." : "Se eliminará la partida " + desccorta + ".";
      const sw = await SwalService.confirm('Estas seguro?', mensaje)
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        let arrelimina = [];
        let arrcambit = [];
        //let arrindeli=[]
        let cambitsig=true;
          arrelimina.push(row);
          for (let i = row.ind + 1; i < this.datasourcePri.length; i++) {
            var palabra = this.datasourcePri[i].agrupacion?.toString().substring(0, row.agrupacion.toString().length + 1)
            if (palabra == (row.agrupacion + '.')) {
              /* if(!(this.datasourcePri[i].referencia==null || this.datasourcePri[i].referencia=='')){
                let itemact=this.datasourcePri[i].agrupacion;
                arrindeli.push(this.datasourcePri[i]);
                cambitsig=false;
                for(let a=0;a<arrelimina.length;a++){
                  let itcomp=arrelimina[a].agrupacion+'.';
                  if(itcomp==itemact.substring(0,itcomp.length)){
                    arrindeli.push(arrelimina[a]);
                    arrelimina.splice(a,1);
                    a--;
                  }
                }
              }
              else{ */
                arrelimina.push(this.datasourcePri[i]);
              /* } */
            }
            else {//no se deberia cambiar el item, si no se elimina el titulo?
              let lagruelim = row.agrupacion.split('.').length;
              if (this.datasourcePri[i].agrupacion.split('.').length >= lagruelim) { arrcambit.push(this.datasourcePri[i]); }
              else { break; }
            }
          }
          //ordenar arreglo edita
          /* arrindeli.sort( (a, b) => {
            if(a.itemord < b.itemord) {
              return -1;
            }
            if(a.itemord > b.itemord) {
              return 1;
            }
            return 0;
          });
          //ordenar grupos?
          this.arrordenar=[];
          let itemnu=row.agrupacion;
          for(let a=0;a<arrindeli.length;a++){
            let itemact=arrindeli[a].agrupacion.toString();
            let arrit=itemact.split('.');
            if(a==0){
              let itemnode:nodoitem={
                nro:itemnu,//this.arrordenar.length+1,
                item:arrindeli[a].agrupacion,
                hijos:[]
              };
              this.arrordenar.push(itemnode);
            }
            else{
              let nodopadre;
              let itemtemp=itemact.substring(0,itemact.lastIndexOf('.'));
              for(let m=0;m<arrit.length-1;m++){
                nodopadre=this.buscarNodo(itemtemp,this.arrordenar);
                if(!nodopadre){
                  itemtemp=itemtemp.substring(0,itemtemp.lastIndexOf('.'));
                }
                else{
                  break;
                }
              }
              if(nodopadre){
                let itemnode:nodoitem={
                  nro:nodopadre.hijos.length+1,
                  item:arrindeli[a].agrupacion,
                  hijos:[]
                };
                nodopadre.hijos.push(itemnode);
              }
              else{
                let itemnode:nodoitem={
                  nro:this.sigitem(itemnu),//this.arrordenar.length+1,
                  item:arrindeli[a].agrupacion,
                  hijos:[]
                };
                this.arrordenar.push(itemnode);
              }
            }
          }
          let arritord=[];
          for(let row of this.arrordenar){
            arritord.push(row.nro.toString());
            if(row.hijos.length>0){
              this.AsigItemNodoHijo(row.nro.toString(),row.hijos,arritord);
            }
          }
          for(let n=0;n<arrindeli.length;n++){
            arrindeli[n].agrupacion=arritord[n];
          } */
          //fin ordenar
          const tabla1 = JSON.stringify(arrelimina);
          const tabla2 = JSON.stringify(cambitsig?arrcambit:[]);
          //const tabla3 = JSON.stringify(arrindeli);
          const eliminarInsumo = {
            id_partida: row.id_partida,
            agrupacion: row.agrupacion,
            id_usuario: row.id_usuario,
            datos1: tabla1,
            datos2: tabla2,
            //datos3: tabla3,
          }
          const respuesta = await this.catalogosService.EliminarDataPartidas(eliminarInsumo)
          if (respuesta.id == "0") {
            this.mostrar_carga_todo = false;
            SwalService.error('Advertencia', respuesta.mensaje);
          }
          else {
            this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            if (fuente == 0) {
              this.partidaSeleccionada = null;
              this.detallepart = [];
              let resta=0;
              for(let row of arrelimina){
                this.datasourcePri.splice(row.ind-resta,1);
                resta++;
              }
              let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
              for(let m=0;m<arract.length;m++){
                this.datasourcePri[m].referencia=arract[m].referencia;
                this.datasourcePri[m].agrupacion=arract[m].agrupacion;
                this.datasourcePri[m].itemord=arract[m].itemord;
                this.datasourcePri[m].ind=arract[m].ind;
              }
            }
            else {
              this.partidaSeleccionada = null;
              this.detallepart = [];
              await this.listarPartidasUserData(this.tipoProysel2)
            }
            this.fila_sel = -1;
            this.mostrar_carga_todo = false;
          }
          this.mostrar_carga_todo=false;
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }

  async onNavChange(tab = null) {
    this.fila_sel = this.fila_sel2 = -1;
    this.partidaSeleccionada = null
    this.detallepart = [];
    this.active = 1
  }
  maxtodo() {
    let datasourcepri
    if (this.tabSeleccionado == 1) {
      datasourcepri = this.datasourcePri
    } else {
      datasourcepri = this.datasourcePri2
    }
    for (let row of datasourcepri) {
      if (row.esgrupo != 0) {
        row.mostrar = 1;
      }
      else {
        row.icomost = 1;
        row.mostrar = 1;
      }
    }
  }
  mintodo() {
    let datasourcepri
    if (this.tabSeleccionado == 1) {
      datasourcepri = this.datasourcePri
    } else {
      datasourcepri = this.datasourcePri2
    }
    for (let row of datasourcepri) {
      if (row.esgrupo != 0) {
        row.mostrar = 0;
      }
      else {
        row.icomost = 0;
        row.mostrar = row.agrupacion?.split('.').length == 1 ? 1 : 0;
      }
    }
  }

  toggleOn(condicion: any, indice: any, id_usuario) {
    let  datasourcepri
    if (this.tabSeleccionado == 1) {
      datasourcepri = this.datasourcePri
    } else {
      datasourcepri = this.datasourcePri2
    }
    datasourcepri[indice].icomost = 1;
    for (let row of datasourcepri) {
      var palabra = row.agrupacion?.toString().substring(0, condicion.toString().length + 1)
      if (row.agrupacion == condicion) {
        if (row.esgrupo != 0) {
          row.mostrar = 1;
        }
      }
      else if (palabra == (condicion + '.') && (id_usuario==null || id_usuario === row.id_usuario)) {
        row.mostrar = 1;
        row.icomost = 1;
      }
    }
  }
  toggleOff(condicion: any, indice: any, id_usuario) {
    let datasourcepri
    if (this.tabSeleccionado == 1) {
      datasourcepri = this.datasourcePri
    } else {
      datasourcepri = this.datasourcePri2
    }
    datasourcepri[indice].icomost = 0;
    for (let row of datasourcepri) {
      var palabra = row.agrupacion?.toString().substring(0, condicion.toString().length + 1)
      if (row.agrupacion == condicion) {
        if (row.esgrupo != 0) {
          row.mostrar = 0;
        }
      }
      else if (palabra == (condicion + '.') && (id_usuario==null || id_usuario === row.id_usuario)) {
        row.mostrar = 0;
        row.icomost = 0;
      }
    }
  }
  confrow(row: any) {
    this.rowconfig = row;
  }
  duplicar2(row: any) {
    //this.cambindicesel2(row, row.ind2);
    this.rowconfig = row;
    this.openModal(1, 1, row, false, true, false)
  }
  VerPartida(row:any){
    this.rowconfig = row;
    if(this.mostrarModal){
      this.openModal(0,row.esgrupo,row,true)
    }
  }
  async SubirFila() {
    try {
      if (this.fila_sel > -1) {
        let indpri = this.fila_sel;
        let agrufila = this.datasourcePri[indpri].agrupacion;
        let arragrufila = agrufila.split('.');
        let numsubir = arragrufila[arragrufila.length - 1]
        if (numsubir != '1') {
          this.mostrar_carga_todo=true;
          const input = {
            agrupacion: agrufila,
            numsubir: numsubir,
            indice: arragrufila.length - 1,
            id_usuario: this.iduser_local,
            tipoproy:this.tipoProysel,
            fuente: 0//1: usuario, 0 sistema
          }
          let respuesta = await this.catalogosService.SubirDataPartidas(input)
          //this.mostrar_carga_todo=false;
          if (respuesta) {
            if (respuesta.id == "0") {
              SwalService.error('Advertencia', respuesta.mensaje);
            }
            else {
              this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
              let indsel=-1;
              for(let i=0;i<this.datasourcePri.length;i++){
                if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
                  indsel=indsel!=-1?indsel:i;
                  this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                }
              }
              this.cambindicesel(this.datasourcePri[indsel],indsel);
            }
          }
          this.mostrar_carga_todo=false;
        }
        else {
          this.toaster.error('La fila ya no puede subir.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else {
        this.toaster.error('Seleccione una fila para subir.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      this.buscando = false;//en vez de mostrar carga
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      console.log(e)
    }
  }
  sigitem(itemant:string)
  {
    let arrauxagru = itemant.split('.');
    arrauxagru[arrauxagru.length-1]=(Number(arrauxagru[arrauxagru.length-1])+1).toString();
    return arrauxagru.join('.');
  }
  async BajarFila() {
    try {
      if (this.fila_sel > -1) {
        let indpri = this.fila_sel;
        let agrufila = this.datasourcePri[indpri].agrupacion;
        let arragrufila = agrufila.split('.');
        let numbajar = arragrufila[arragrufila.length - 1];
        let final = this.datasourcePri.length == indpri ? true : false;
        let existesiguiente = false;
        for (let i = indpri + 1; i < this.datasourcePri.length; i++) {
          let agruact = this.datasourcePri[i].agrupacion;
          let arragruact = agruact.split('.');
          if (arragruact.length < arragrufila.length) {
            break;
          }
          else if (arragruact.length == arragrufila.length) {
            existesiguiente = true;
            break;
          }
        }
        if (!final && existesiguiente) {
          this.mostrar_carga_todo=true;
          const input = {
            agrupacion: agrufila,
            numbajar: numbajar,
            indice: arragrufila.length - 1,
            id_usuario: this.iduser_local,
            tipoproy:this.tipoProysel,
            fuente: 0//1: usuario, 0 sistema
          }
          let respuesta = await this.catalogosService.BajarDataPartidas(input)
          //this.mostrar_carga_todo=false;
          if (respuesta) {
            if (respuesta.id == "0") {
              SwalService.error('Advertencia', respuesta.mensaje);
            }
            else {
              /* SwalService.success() */
              this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              //await this.listarPartidasSistemaData(this.tipoProysel)
              let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
              let indsel=-1;
              for(let i=0;i<this.datasourcePri.length;i++){
                if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
                  this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                }
                if(this.datasourcePri[i].agrupacion==this.sigitem(agrufila)){
                  indsel=indsel!=-1?indsel:i;
                }
              }
              this.cambindicesel(this.datasourcePri[indsel],indsel);
            }
          }
          this.mostrar_carga_todo=false;
        }
        else {
          this.toaster.error('La fila ya no puede bajar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else {
        this.toaster.error('Seleccione una fila para bajar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      console.log(e)
    }
  }
  cambioExpande() {
    if (this.expanded) {
      this.expanded = false;
      this.mostrarModal = false;
    }
    else {
      this.expanded = true;
      this.mostrarModal = true;
    }
  }
  //derecha
  async MovDerec() {
    try {
      if (this.fila_sel > -1) {
        let arrcomp = [];
        //parametros pasa
        let arrmov = [];
        let arract = [];
        let nitem = '';
        //fin parametros pasa
        let itemsel = this.datasourcePri[this.fila_sel].agrupacion;
        let superior = itemsel.substring(0, itemsel.lastIndexOf('.') + 1);//vacio si es titulo(1er nivel), 1. o 1.1.
        if (superior != '') {//subtitulos
          //anterior
          let numant = Number(itemsel.substring(itemsel.lastIndexOf('.') + 1, itemsel.length)) - 1;
          let itant = superior + numant.toString();
          //fin anterior
          if (numant > 0) {
            let difer = false;
            let encontrado = false;
            for (let row of this.datasourcePri) {
              if (!difer || !encontrado) {
                var palabra = row.agrupacion.toString().substring(0, superior.length)
                if (palabra == superior) {
                  arrcomp.push(row);
                  encontrado = true;
                }
                else {
                  if (encontrado) {
                    difer = true;
                  }
                }
              }
              else {
                break;
              }
            }
            //buscar parametros
            let supespartida = false;
            let exitmover = false;
            for (let a = 0; a < arrcomp.length; a++) {
              if (arrcomp[a].agrupacion == itant) {//el item anterior no puede ser partida
                if (arrcomp[a].unidad != '') {
                  supespartida = true;
                  break;
                }
              }
              var prefijo = arrcomp[a].agrupacion.toString().substring(0, itemsel.length + 1)
              if (arrcomp[a].agrupacion == itemsel) {
                //buscar el anterior nitem
                let arragruant = arrcomp[a - 1].agrupacion.split('.');
                let nnum = itemsel.split('.').length == arragruant.length ? 1 : Number(arragruant[itemsel.split('.').length]) + 1;
                nitem = itant + "." + nnum.toString();
                arrmov.push(arrcomp[a]);
                exitmover = true;
              }
              else if (prefijo == (itemsel + ".")) {
                arrmov.push(arrcomp[a]);
              }
              else {
                if (exitmover) {
                  arract.push(arrcomp[a]);
                }
              }
            }
            if (!supespartida) {
              this.mostrar_carga_todo=true;
              const tabla1 = JSON.stringify(arrmov);
              const tabla2 = JSON.stringify(arract);
              const input = {
                nuevoitem: nitem,
                itemmueve: itemsel,
                arrmover: tabla1,
                arractua: tabla2,
              }
              let respuesta = await this.catalogosService.DerechaDataPartidas(input)
              if (respuesta) {
                if (respuesta.id == "0") {
                  SwalService.error('Advertencia', respuesta.mensaje);
                }
                else {
                  this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
                  //await this.listarPartidasSistemaData(this.tipoProysel)
                  let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
                  let indsel=-1;
                  for(let i=0;i<this.datasourcePri.length;i++){
                    if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
                      this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                    }
                    else if(this.datasourcePri[i].agrupacion!=arract[i].agrupacion){
                      this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                    }
                    if(this.datasourcePri[i].agrupacion==nitem){
                      indsel=indsel!=-1?indsel:i;
                    }
                  }
                  this.cambindicesel(this.datasourcePri[indsel],indsel);
                }
              }
              this.mostrar_carga_todo=false;
            }
            else {
              this.toaster.error('No se puede mover a la derecha.El item superior es una partida.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            }
          }
          else {
            this.toaster.error('No se puede mover a la derecha.No se encontro un item superior al que pueda pertenecer.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          }
        }
        else {//mover derecha un titulo
          const respu = await SwalService.confirm('Esta seguro que desea mover un titulo?', 'La operación puede tardar en finalizar.');
          if (respu.isConfirmed) {
            //anterior
            let numant = Number(itemsel.substring(itemsel.lastIndexOf('.') + 1, itemsel.length)) - 1;
            let itant = superior + numant.toString();
            //fin anterior
            if (numant > 0) {
              arrcomp = JSON.parse(JSON.stringify(this.datasourcePri));
              //buscar parametros
              let supespartida = false;
              let exitmover = false;
              for (let a = 0; a < arrcomp.length; a++) {
                if (arrcomp[a].agrupacion == itant) {//el item anterior no puede ser partida
                  if (arrcomp[a].unidad != '') {
                    supespartida = true;
                    break;
                  }
                }
                var prefijo = arrcomp[a].agrupacion.toString().substring(0, itemsel.length + 1)
                if (arrcomp[a].agrupacion == itemsel) {
                  //buscar el anterior nitem
                  let arragruant = arrcomp[a - 1].agrupacion.split('.');
                  let nnum = itemsel.split('.').length == arragruant.length ? 1 : Number(arragruant[itemsel.split('.').length]) + 1;
                  nitem = itant + "." + nnum.toString();
                  arrmov.push(arrcomp[a]);
                  exitmover = true;
                }
                else if (prefijo == (itemsel + ".")) {
                  arrmov.push(arrcomp[a]);
                }
                else {
                  if (exitmover) {
                    arract.push(arrcomp[a]);
                  }
                }
              }
              if (!supespartida) {
                this.mostrar_carga_todo=true;
                const tabla1 = JSON.stringify(arrmov);
                const tabla2 = JSON.stringify(arract);
                const input = {
                  nuevoitem: nitem,
                  itemmueve: itemsel,
                  arrmover: tabla1,
                  arractua: tabla2,
                }
                let respuesta = await this.catalogosService.DerechaDataPartidas(input);
                //this.mostrar_carga_todo=false;
                this.buscando = false;
                if (respuesta) {
                  if (respuesta.id == "0") {
                    SwalService.error('Advertencia', respuesta.mensaje);
                  }
                  else {
                    this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
                    //await this.listarPartidasSistemaData(this.tipoProysel)
                    let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
                    let indsel=-1;
                    for(let i=0;i<this.datasourcePri.length;i++){
                      if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
                        this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                      }
                      else if(this.datasourcePri[i].agrupacion!=arract[i].agrupacion){
                        this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                      }
                      if(this.datasourcePri[i].agrupacion==nitem){
                        indsel=indsel!=-1?indsel:i;
                      }
                    }
                    this.cambindicesel(this.datasourcePri[indsel],indsel);
                  }
                }
                this.mostrar_carga_todo=false;
              }
              else {
                this.toaster.error('No se puede mover a la derecha.El item superior es una partida.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              }
            }
            else {
              this.toaster.error('No se puede mover a la derecha.No se encontro un item superior al que pueda pertenecer.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            }
          }
        }
      }
      else {
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      this.buscando = false;//en vez de mostrar carga
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      console.log(e)
    }
  }
  async MovIzqui() {
    try {
      if (this.fila_sel > -1) {
        let arrcomp = [];
        //parametros pasa
        let arrmov = [];
        let arract = [];
        let nitem = '';
        //fin parametros pasa
        let itemsel = this.datasourcePri[this.fila_sel].agrupacion;
        let arritemsel = itemsel.split('.');
        if (arritemsel.length > 1) {
          let superior = '';
          for (let i = 0; i < arritemsel.length - 2; i++) {//verificar hasta que punto puede moverse a la izquierda, de 1.1.3 -> 1.  al menos longitud 3, si es longitud 1 no se puede, si es longitud 2 se actualiza todo
            superior = superior + arritemsel[i] + ".";
          }
          if (superior != '') {//si es vacio se intenta convertir a titulo
            let difer = false;
            let encontrado = false;
            for (let row of this.datasourcePri) {
              if (!difer || !encontrado) {
                var palabra = row.agrupacion.toString().substring(0, superior.length)
                if (palabra == superior) {
                  arrcomp.push(row);
                  encontrado = true;
                }
                else {
                  if (encontrado) {
                    difer = true;
                  }
                }
              }
              else {
                break;
              }
            }
            //buscar parametros
            let exitmover = false;
            for (let a = 0; a < arrcomp.length; a++) {
              var prefijo = arrcomp[a].agrupacion.toString().substring(0, itemsel.length + 1)
              if (arrcomp[a].agrupacion == itemsel) {
                arrmov.push(arrcomp[a]);
                exitmover = true;
              }
              else if (prefijo == (itemsel + ".")) {
                arrmov.push(arrcomp[a]);
              }
              else {
                if (exitmover) {
                  arract.push(arrcomp[a]);
                }
              }
            }
            //buscar el anterior nitem
            let nnum = Number(arritemsel[arritemsel.length - 2]) + 1;
            for (let i = 0; i < arritemsel.length - 2; i++) {//verificar hasta que punto puede moverse a la izquierda, de 1.1.3 -> 1.  al menos longitud 3, si es longitud 1 no se puede, si es longitud 2 se actualiza todo
              nitem = nitem + arritemsel[i] + ".";
            }
            nitem = nitem + nnum.toString();
            this.mostrar_carga_todo=true;
            const tabla1 = JSON.stringify(arrmov);
            const tabla2 = JSON.stringify(arract);
            const input = {
              nuevoitem: nitem,
              itemmueve: itemsel,
              arrmover: tabla1,
              arractua: tabla2,
            }
            let respuesta = await this.catalogosService.IzquierdaDataPartidas(input)
            if (respuesta) {
              if (respuesta.id == "0") {
                SwalService.error('Advertencia', respuesta.mensaje);
              }
              else {
                this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
                //await this.listarPartidasSistemaData(this.tipoProysel)
                let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
                let indsel=-1;
                for(let i=0;i<this.datasourcePri.length;i++){
                  if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
                    this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                  }
                  else if(this.datasourcePri[i].agrupacion!=arract[i].agrupacion){
                    this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                  }
                  if(this.datasourcePri[i].agrupacion==nitem){
                    indsel=indsel!=-1?indsel:i;
                  }
                }
                this.cambindicesel(this.datasourcePri[indsel],indsel);
              }
            }
            this.mostrar_carga_todo=false;
          }
          else {//mover subtitulo a titulo
            let tipofila = this.datasourcePri[this.fila_sel].unidad != '' ? 0 : 1;//0 es partida,1 es titulo o subtitulo
            if (tipofila == 1) {
              const respu = await SwalService.confirm('Esta seguro que desea convertir a titulo?', 'La operación puede tardar en finalizar.');
              if (respu.isConfirmed) {
                arrcomp = JSON.parse(JSON.stringify(this.datasourcePri));
                //buscar parametros
                let exitmover = false;
                for (let a = 0; a < arrcomp.length; a++) {
                  var prefijo = arrcomp[a].agrupacion.toString().substring(0, itemsel.length + 1)
                  if (arrcomp[a].agrupacion == itemsel) {
                    arrmov.push(arrcomp[a]);
                    exitmover = true;
                  }
                  else if (prefijo == (itemsel + ".")) {
                    arrmov.push(arrcomp[a]);
                  }
                  else {
                    if (exitmover) {
                      arract.push(arrcomp[a]);
                    }
                  }
                }
                //buscar el anterior nitem
                let nnum = Number(arritemsel[arritemsel.length - 2]) + 1;
                for (let i = 0; i < arritemsel.length - 2; i++) {//verificar hasta que punto puede moverse a la izquierda, de 1.1.3 -> 1.  al menos longitud 3, si es longitud 1 no se puede, si es longitud 2 se actualiza todo
                  nitem = nitem + arritemsel[i] + ".";
                }
                nitem = nitem + nnum.toString();
                this.mostrar_carga_todo=true;
                const tabla1 = JSON.stringify(arrmov);
                const tabla2 = JSON.stringify(arract);
                const input = {
                  nuevoitem: nitem,
                  itemmueve: itemsel,
                  arrmover: tabla1,
                  arractua: tabla2,
                }
                let respuesta = await this.catalogosService.IzquierdaDataPartidas(input)
                if (respuesta) {
                  if (respuesta.id == "0") {
                    SwalService.error('Advertencia', respuesta.mensaje);
                  }
                  else {
                    this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
                    //await this.listarPartidasSistemaData(this.tipoProysel)
                    let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
                    let indsel=-1;
                    for(let i=0;i<this.datasourcePri.length;i++){
                      if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
                        this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                      }
                      else if(this.datasourcePri[i].agrupacion!=arract[i].agrupacion){
                        this.datasourcePri[i]=JSON.parse(JSON.stringify(arract[i]));
                      }
                      if(this.datasourcePri[i].agrupacion==nitem){
                        indsel=indsel!=-1?indsel:i;
                      }
                    }
                    this.cambindicesel(this.datasourcePri[indsel],indsel);
                    //console.table(this.datasourcePri,["agrupacion","id_partida","descripcion","ind","referencia"])
                  }
                }
                this.mostrar_carga_todo=false;
              }
            }
            else {
              this.toaster.error('La partida ya no se puede mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            }
          }
        }
        else {
          this.toaster.error('Un Titulo no se puede mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else {
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      this.buscando = false;//en vez de mostrar carga
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      console.log(e)
    }
  }
  //modal agregar varios
  Addvarios(){
    this.seltipoproy.setValue(this.tipoProysel)
    this.cambiarTipoProymul('');
    this.duparc.setValue(false);
    this.modalAddvar.show();
  }
  limpiarfiltrolmp() {
    this.busqmul = '';
  }
  cambindicesellmp(ind:any){
    if (ind == this.filasellmp)
      this.filasellmp = -1;
    else
      this.filasellmp = ind;
  }
  cambioselt1(row){
    let indpri=row.ind;
    if(row.seleccion==0){
      row.seleccion=1;
      this.databusq[indpri].seleccion=1;
      if(row.esgrupo==0){
        for(let i=Number(indpri)+1;i<this.databusq.length;i++){
          var palabra = this.databusq[i].agrupacion?.toString().substring(0, row.agrupacion.toString().length + 1)
          if(this.databusq[i].agrupacion ==  row.agrupacion || palabra == (row.agrupacion + '.')){
            this.databusq[i].seleccion=1;
          }
          else{
            break;
          }
        }
      }
    }
    else{
      row.seleccion=0;
      this.databusq[indpri].seleccion=0;
      if(row.esgrupo==0){
        for(let i=Number(indpri)+1;i<this.databusq.length;i++){
          var palabra = this.databusq[i].agrupacion?.toString().substring(0, row.agrupacion.toString().length + 1)
          if(this.databusq[i].agrupacion ==  row.agrupacion || palabra == (row.agrupacion + '.')){
            this.databusq[i].seleccion=0;
          }
          else{
            break;
          }
        }
      }
    }
  }
  async buscarPartidas(){
    try{
      this.buscando=true;
      this.databusq=[];
      let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.iduser_local,fuente:this.fuentesel, tipo_proy: this.tiposel,idpadre:'',restriccion:'' });//cambiar dinamico tipo_proy
      this.databusq=rpartidas;
      this.buscando=false;
    }
    catch(e){
      this.buscando=false;
      console.log(e)
    }
  }
  async cambiarTipoProymul(idtipo: any){
    //filtrar solo front
    this.tiposel=this.seltipoproy.value;
    this.buscarPartidas();
  }
  async cambiarFuentemul(idfuente:any){
    this.fuentesel=idfuente;
    this.buscarPartidas();
  }
  async addtoTabla(){
    let cont=0;
    for(let i=0;i<this.databusq.length;i++){
      if(this.databusq[i].seleccion==1){
        cont++;
        if(this.databusq[i].unidad!=''){
          this.arregloseleccion.push(this.databusq[i]);
        }
        this.databusq[i].seleccion=0;
      }
    }
    if(cont<=0){
      this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  eliminarfila(ind:any){
    this.arregloseleccion.splice(ind,1);
  }
  cambindiceArrsel(ind:any){
    if (ind == this.filaArrSel)
      this.filaArrSel = -1;
    else
      this.filaArrSel = ind;
  }
  subirpresel(){
    if(this.filaArrSel>0){
      let sube=JSON.parse(JSON.stringify(this.arregloseleccion[this.filaArrSel]));
      let baja=JSON.parse(JSON.stringify(this.arregloseleccion[this.filaArrSel-1]));
      this.arregloseleccion[this.filaArrSel]=baja;
      this.arregloseleccion[this.filaArrSel-1]=sube;
      this.filaArrSel=this.filaArrSel-1;
    }
  }
  bajarpresel(){
    if(this.filaArrSel>=0 && this.filaArrSel<this.arregloseleccion.length-1){
      let sube=JSON.parse(JSON.stringify(this.arregloseleccion[this.filaArrSel+1]));
      let baja=JSON.parse(JSON.stringify(this.arregloseleccion[this.filaArrSel]));
      this.arregloseleccion[this.filaArrSel+1]=baja;
      this.arregloseleccion[this.filaArrSel]=sube;
      this.filaArrSel=this.filaArrSel+1;
    }
  }
  EliminarSel(){
    this.arregloseleccion=[];
  }
  cambioDuplicar() {
    if (this.duparc.value) {
      this.textoDuplicar = 'SI'
    } else {
      this.textoDuplicar = 'NO'
    }
  }
  async AgregarMult(){
    //descomentar limpiar variables
    this.mostrar_carga_todo=true;
    let arraux=[]
    if(this.arregloseleccion.length>0){
      arraux=this.arregloseleccion;
    }
    else{
      for(let row of this.databusq){
        if(row.seleccion==1 && row.unidad!=''){
          arraux.push(row);
        }
      }
    }
    if(arraux.length>0){
      let tabla1=JSON.stringify(arraux);
      const body = JSON.stringify({
        'idusuario': this.iduser_local,
        'agrupadre': this.datasourcePri[this.fila_sel].agrupacion,
        'fuente': 0,//sistema
        'tipoproy': this.tipoProysel,
        'duparch': this.duparc.value?'1':'0',
        'datos1': tabla1,
      });
      let result = await this.catalogosService.CopiarVariasPartidas(body)
      if(result?.id=="1"){
        this.toaster.success('Se agrego correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
      else{
        this.toaster.error('No se pudo agregar las partidas correctamente', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      }
      this.filaArrSel=-1;
      this.filasellmp=-1;
      this.arregloseleccion=[];
      this.databusq=[];
      this.busqmul='';
      this.tiposel='';
      this.fuentesel=0;
      //actualizar tabla agregando las nuevas filas, solo agrega, no edita ni nada
      this.modalAddvar.hide();
      let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
      for(let i=0;i<this.datasourcePri.length;i++){
        if(this.datasourcePri[i].id_partida!=arract[i].id_partida){
          this.datasourcePri.splice(i,0,arract[i]);
        }
        else{
          this.datasourcePri[i].ind=arract[i].ind;
        }
      }
      if(arract.length>this.datasourcePri.length){
        for(let indaux=this.datasourcePri.length;indaux<arract.length;indaux++){
          this.datasourcePri.push(arract[indaux]);
        }
      }
      this.mostrar_carga_todo=false;
    }
    else{
      this.mostrar_carga_todo=false;
      this.toaster.error('No selecciono ninguna partida para agregar.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
    }
  }
  cerrarModalmp() {
    //limpiar valores
    this.filaArrSel=-1;
    this.filasellmp=-1;
    this.arregloseleccion=[];
    this.databusq=[];
    this.busqmul='';
    this.tiposel='';
    this.fuentesel=0;
    this.modalAddvar.hide();
  }
  //fin duplica mult
  async VerificarOrden(donde:any){
    let error='';
    let error0='';
    let empieza=false;
    let arrorden=[];//para repetidos? buscar? o por el orden del item?
    let nocumple=false;

    let arract = await this.catalogosService.ListarDataPartidasUser({ fuente: 0, id_usuario: this.iduser_local, tipo_proy: this.tipoProysel })
    let longi=arract.length>this.datasourcePri.length?arract:this.datasourcePri.length;
    for(let a=0;a<longi;a++){
      if(a>=this.datasourcePri.length){
        nocumple=true;
        error0='La tabla principal tiene menos items'
        break;
      }
      if(a>=arract.length){
        nocumple=true;
        error0='La tabla en base de datos tiene menos items'
        break;
      }
      if(!this.compararfilas(arract[a],this.datasourcePri[a])){
        nocumple=true;
        console.log(JSON.stringify(arract[a]),JSON.stringify(this.datasourcePri[a]));
        error0='La partida '+ arract[a].agrupacion +' | ' +this.datasourcePri[a].agrupacion+' no coinciden'
        break;
      }
    }

    for(let row of this.datasourcePri){
      let itemact=row.agrupacion.toString();
      if(!empieza){//primero siempre 1
        if(itemact=='1'){
          arrorden.push(itemact);
          empieza=true;
        }
      }else{
        //verificar item(length anterior igual +1,menor concat .1,mayor eliminar hasta la longitud igual debe ser +1 y eliminar longitud igual)(caso si split es 1)
        let itemant=arrorden[arrorden.length-1];
        let arritant=itemant.split('.');
        let arritpas=itemact.split('.');
        if(arritant.length==arritpas.length){
          arritant[arritant.length-1]=Number(arritant[arritant.length-1])+1;
          if(itemact!=arritant.join('.')){
              nocumple=true;
              error='El orden de los items no es correcto. Error al analizar item '+itemact;
              break;
          }
          else{
            arrorden.push(itemact);
          }
        }else if(arritant.length<arritpas.length){
          if(itemant+'.1'!=itemact){
            nocumple=true;
            error='El orden de los items no es correcto. Error al analizar item '+itemact;
            break;
          }else{
            arrorden.push(itemact);
          }
        }else if(arritant.length>arritpas.length){
          while(arritant.length>arritpas.length){
            arrorden.splice(arrorden.length-1,1);
            itemant=arrorden[arrorden.length-1];
            arritant=itemant.split('.');
          }
          arritant[arritant.length-1]=Number(arritant[arritant.length-1])+1;
          if(itemact!=arritant.join('.')){
            nocumple=true;
              error='El orden de los items no es correcto. Error al analizar item '+itemact;
              break;
          }
          else{
            arrorden.splice(arrorden.length-1,1);
            arrorden.push(itemact);
          }
        }
      }
    }
    if(!empieza){
      console.log('no hay item 1')
      this.toaster.error('no hay item 1', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      return;
    }
    if(nocumple){
      console.log(error+'| '+error0)
      //this.toaster.error(error+'| '+error0, 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      SwalService.error('Mandar Captura de Error', error+'| '+error0+' | '+donde)
      return;
    }
    console.log('correcto')
  }
  compararfilas(fila1:any,fila2:any){
    let respo=true;
    if(fila1.id_partida!=fila2.id_partida){
      console.log(1)
      return false;
    }
    if(fila1.descripcion!=fila2.descripcion){
      console.log(2)
      return false;
    }
    if(fila1.id_unidad!=fila2.id_unidad){
      console.log(3)
      return false;
    }
    if(fila1.precio!=fila2.precio){
      console.log(4)
      return false;
    }
    if(fila1.rendimiento!=fila2.rendimiento){
      console.log(5)
      return false;
    }
    if(fila1.und_rendi!=fila2.und_rendi){
      console.log(6)
      return false;
    }
    if(fila1.jornada!=fila2.jornada){
      console.log(7)
      return false;
    }
    if(fila1.tipo_proy!=fila2.tipo_proy){
      console.log(9)
      return false;
    }
    if(fila1.fuente!=fila2.fuente){
      console.log(10)
      return false;
    }
    if(fila1.agrupacion!=fila2.agrupacion){
      console.log(11)
      return false;
    }
    if(fila1.esgrupo!=fila2.esgrupo){
      console.log(12)
      return false;
    }
    if(fila1.referencia!=fila2.referencia){
      console.log(13)
      return false;
    }
    if(fila1.advceros!=fila2.advceros){
      console.log(14)
      return false;
    }
    if(fila1.itemord!=fila2.itemord){
      console.log(15)
      return false;
    }
    if(fila1.espec_tec!=fila2.espec_tec){
      console.log(17)
      return false;
    }
    if(fila1.ficha_tec!=fila2.ficha_tec){
      console.log(18)
      return false;
    }
    if(fila1.ind!=fila2.ind){
      console.log(19)
      return false;
    }
    return respo;
  }
}
