import { Component, HostListener, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalService } from 'src/app/servicios/swal.service';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import * as XLSX from 'xlsx';
import { ImportarinsumosComponent } from '../../administrador/datainsumo/importarinsumos/importarinsumos.component';
import { ModalDataInsumoComponent } from '../../administrador/datainsumo/modal-data-insumo/modal-data-insumo.component';
import { ModalImagenesInsumoComponent } from '../../administrador/datainsumo/modal-imagenes-insumo/modal-imagenes-insumo.component';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8;';
const EXCEL_EXT = '.xlsx';
export interface rowinsumo {
  id_insumo: any;
  descripcion: any;
  id_unidad:any;
  unidad: any;
  precio: any;
  fecha_precio:any;
  id_tipo_insumo: any;
  id_indice: any;
  id_clasificacion: any;
  codigo:any;
  observacion:any;
  nroimgs: any;
  imagen:any;
  marcas:any;
  ficha_tecnica: any;
  id_usuario:any;
  fuente: any;
  fecha_registra:any;
  fecha_modifica:any;
  activo:any;
  desc_tipo_insumo:any;
  abrev_tipo:any;
  desc_indice:any;
  abrev_indice:any;
  catalogos: any;
  //nrocatalogos: any;
  desc_clasi: any;
  grupo: any;
  mostrar: any;
  icomost: any;
  ind: any; 
}
export interface tipoInsumo {
  activo: number;
  desc_tipo_insumo: string;
  id_tipo_insumo: number
}

@Component({
  selector: 'app-catinsumos',
  templateUrl: './catinsumos.component.html',
  styleUrls: ['./catinsumos.component.scss']
})
export class CatinsumosComponent implements OnInit {
  @Input('height') height: number = 100;
  paddingscroll = 17;
  busquedaInsSis = ''
  busqueda = '';
  buscando: boolean = false;
  buscando2: boolean = false;
  mostrar_carga = false;
  mostrar_carga_todo = false;
  fila_sel: any
  fila_sel2: any
  tipoInsumos: tipoInsumo[] = [];
  tipoindsel = '';
  clasiInsumos = [];
  umedidas = [];
  id_user:any;
  idUadmin="";
  esSecund=false;
  // displayedColumn: string[] = ['id_insumo', 'descripcion', 'unidad', 'precio', 'id_tipo_insumo', 'id_indice', 'ficha_tecnica', 'imagen', 'marcas', 'activo', 'acciones'];
  //displayedColumn: string[] = ['abrev_tipo', 'descripcion', 'unidad', 'precio', 'id_indice', 'documentos', 'activo', 'acciones'];
  datasourcePri: rowinsumo[] = [];
  datasource2Pri: rowinsumo[] = [];
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  @ViewChild("modalDocumentos") modaldocumentos: ModalBasicComponent;
  insumoSeleccionado: any = null;
  mostrarModal: boolean;
  active: any = 0;
  tabSeleccionado = 1
  indiceSeleccionado: any = null;
  bloquearAcciones: boolean = false;
  expanded = false
  
  nrofilas=200;
  desde=0;
  hasta=200;
  pageSizeOptions=[ 50, 100,150, 200];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  arreglomostrar=[];
  arreglomostrar2=[];

  nrofilas2=200;
  desde2=0;
  hasta2=200;

  listaUsuariosSistema: any = [];
  idUsuario = ''
  constructor(
    private modalService: NgbModal,
    private adminservice: AdministradorService,
    private encriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
    private changeDetector: ChangeDetectorRef,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    try {
      this.mostrar_carga = true
      this.id_user = this.encriptadorService.recuperarlocalstory('idusuario');
      this.idUadmin = await this.encriptadorService.recuperarlocalstory('id_admin');
      this.esSecund=this.id_user!=this.idUadmin?true:false;
      if(this.esSecund){
        this.id_user=this.idUadmin;
      }
      await this.asignarbody()
      await this.listarTipoInsumo();
      this.mostrar_carga = false;
      await this.cambiarTipoInsSistema()
      await this.listarInsumosData(this.tipoindsel)
    } catch (e) {
      console.log(e);
      this.mostrar_carga = false
      SwalService.error()
    }
  }
  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel="Items por Página";
    this.paginator._intl.nextPageLabel="Siguiente";
    this.paginator._intl.previousPageLabel="Anterior";
    this.paginator._intl.firstPageLabel="Primera";
    this.paginator._intl.lastPageLabel="Última";
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const start = page * pageSize + 1;
      const end = (page + 1) * pageSize;
      return `${start} - ${end} de ${length}`;
    };
  }
  cambiarpagina(e:PageEvent){
    this.desde=e.pageIndex*e.pageSize;
    this.hasta=this.desde+e.pageSize;
    this.nrofilas=e.pageSize;
  }
  cambiarpagina2(e:PageEvent){
    this.desde2=e.pageIndex*e.pageSize;
    this.hasta2=this.desde2+e.pageSize;
    this.nrofilas2=e.pageSize;
  }
  async asignarbody() {
    var resto;
    if (document.body.clientWidth <= 992 && document.body.clientWidth > 768) {
      resto = 245;
      this.mostrarModal = false
    } else if (document.body.clientWidth <= 768) {
      this.mostrarModal = true
      resto = 285
    } else if (document.body.clientWidth > 992 && document.body.clientWidth <= 1200) {
      resto = 245
      this.mostrarModal = false
    } else {
      resto = 220
      this.mostrarModal = false
    }
    this.height = window.innerHeight - resto;
    // let nfilas=Math.floor((this.height-50-27)/25);
    // this.desde=0;
    // this.hasta=nfilas;
    // this.nrofilas=nfilas;
    // let exis=this.pageSizeOptions.indexOf(this.nrofilas);
    // if(exis<0){
    //   this.pageSizeOptions.unshift(this.nrofilas)
    // }
    // this.desde2=0;
    // this.hasta2=nfilas;
    // this.nrofilas2=nfilas;
    return
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto;
    if (document.body.clientWidth <= 992 && document.body.clientWidth > 768) {
      resto = 245;
      this.mostrarModal = false
      this.modaldocumentos.hide();
    } else if (document.body.clientWidth <= 768) {
      this.mostrarModal = true
      resto = 285
    } else if (document.body.clientWidth > 992 && document.body.clientWidth <= 1200) {
      resto = 245
      this.mostrarModal = false
      this.modaldocumentos.hide();
    } else {
      resto = 220
      this.mostrarModal = false
      this.modaldocumentos.hide();
    }
    this.height = window.innerHeight - resto;
    return
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
  async listarInsumosData(tipoins: any) {
    this.buscando = true
    this.datasourcePri = []
    const input = {
      activo: '',
      id_usuario: this.id_user,
      id_tipo_insumo: tipoins
    }
    this.datasourcePri = await this.configuracionService.listarInsumosXUsuarioData(input)
    this.arreglomostrar=JSON.parse(JSON.stringify(this.datasourcePri));
    this.buscando = false
  }

  async listarDataInsumoSistema(tipoins) {
    this.buscando2 = true
    const inputInsumosData = {
      activo: 1,
      fuente: 0,
      id_tipo_insumo: tipoins
    }
    this.datasource2Pri = await this.configuracionService.listarInsumosData(inputInsumosData)
    this.arreglomostrar2=JSON.parse(JSON.stringify(this.datasource2Pri));
    this.buscando2 = false
  }

  async listarTipoInsumo() {
    this.tipoInsumos = []
    const activo = { activo: 1, esinsumo: 1 }
    this.tipoInsumos = await this.configuracionService.listarTipoInsumo(activo)
  }
  cambiarTipoIns(idtipo: any) {
    this.tipoindsel = idtipo;
    this.listarInsumosData(this.tipoindsel);
  }

  cambiarTipoInsSistema(idtipo = '') {
    this.listarDataInsumoSistema(idtipo);
  }

  limpiarfiltro() {
    this.busqueda = '';
  }

  limpiarfiltro2() {
    this.busquedaInsSis = '';
  }

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }

  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }

  cambindicesel2(ind: any) {
    if (ind == this.fila_sel2)
      this.fila_sel2 = -1;
    else
      this.fila_sel2 = ind;
  }

  async openModal(datos = null, editar = null, ver = null, fuente = 1) {
    this.mostrar_carga_todo = true
    this.onNavChange()
    await this.listarTipoInsumo()
    await this.listarClasificacionInsumo();
    await this.listarMedidas();
    let arrind=[];
    arrind = await this.configuracionService.listarIndiceUnificados()
    const modalRef = this.modalService.open(ModalDataInsumoComponent, {
      size: 'md',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false//no cerrar el modal con ESC
    })
    modalRef.componentInstance.editar = editar
    modalRef.componentInstance.datos = datos
    modalRef.componentInstance.ver = ver
    modalRef.componentInstance.tipoInsumos = this.tipoInsumos
    modalRef.componentInstance.catalogoInsumo = true
    modalRef.componentInstance.clasiInsumos = this.clasiInsumos;
    modalRef.componentInstance.medidas = this.umedidas;
    modalRef.componentInstance.tipoIndice = arrind;
    modalRef.componentInstance.fuente = fuente;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result?.id == '1') {
      //SwalService.success()
      //this.toaster.success('La operación se realizo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      //await this.listarInsumosData(this.tipoindsel)
      this.mostrar_carga_todo = true;
      const input = { activo: '', id_usuario: this.id_user, id_tipo_insumo: this.tipoindsel }
      let arrpri = await this.configuracionService.listarInsumosXUsuarioData(input)
      let arract=JSON.parse(JSON.stringify(this.arreglomostrar));
      /* let indexis=-1;
      for(let i=0;i<arract.length;i++){
        indexis=arrcopia.findIndex((element) => {
          if(element.grupo==0 && element.descripcion==arract[i].descripcion){
            return true;
          }
          else if(element.grupo!=0 && element.id_insumo==arract[i].id_insumo){
            return true;
          }
          else
            return false;
        });
        if(indexis>=0){
          let mostrartemp=arrcopia[indexis].mostrar;
          let icomosttemp=arrcopia[indexis].icomost;
          let selectemp=arrcopia[indexis].seleccion;
          arract[i].mostrar=mostrartemp;
          arract[i].icomost=icomosttemp;
          arract[i].seleccion=selectemp;
        }
        arrcopia.splice(indexis,1);
      }
      this.datasourcePri=arract; */
      let arrgru=[];
      let arrfin=[];
      for(let i=0;i<arract.length;i++){
        if(arract[i].grupo==0){
          arrgru.push(arract[i]);
        }
      }
      let estclasi=1;
      for(let a=0;a<arrpri.length;a++){
        if(arrpri[a].grupo==0){
          arrfin.push(JSON.parse(JSON.stringify(arrpri[a])));
          let agru=arrgru.find(ele=> ele.id_clasificacion==arrpri[a].id_clasificacion)
          if(agru){
            estclasi=agru.icomost;//0 comprimido, 1 maximizado
            arrfin[arrfin.length-1].icomost=agru.icomost;
          }
          else{
            estclasi=1;//0 comprimido, 1 maximizado
          }
        }
        else{
          if(estclasi==1){
            arrfin.push(JSON.parse(JSON.stringify(arrpri[a])));
          }
        }
      }
      this.datasourcePri=arrpri;
      this.arreglomostrar=arrfin;
      this.mostrar_carga_todo = false;
      let idcompara=!result.observacion?datos.id_insumo:result.observacion?.includes('|')?result.observacion.split('|')[0]:result.observacion;
      const insumoRecuperado = await this.datasourcePri.findIndex(data => data.id_insumo == idcompara)
      this.fila_sel=insumoRecuperado;
      if (editar && !ver) {
        if(!this.expanded){
          await this.openVisualizador(this.datasourcePri[insumoRecuperado], 1, this.indiceSeleccionado)
        }
      } else {
        this.onNavChange()
      }
    }
  }

  async listarClasificacionInsumo() {
    this.clasiInsumos = []
    const activo = {
      activo: 1,
      id_tipo_insumo:'',
      id_usuario:this.id_user,
      fuente:''
    }
    this.clasiInsumos = await this.adminservice.listarClasiInsumosData(activo)
  }
  async listarMedidas() {
    this.umedidas = []
    const activo = {
      id_usuario:this.id_user,
      fuente:'',
      activo: 1,
      operador:0
    }
    this.umedidas = await this.adminservice.listarUnidadMed(activo)
  }

  async eliminarDataInsumo(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el insumo seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarInsumo = {
          id_insumo: row.id_insumo,
          imagenes: row.imagen ? row.imagen : '',
          catalogos: row.catalogos ? row.catalogos : '',
          ficha:row.ficha_tecnica?row.ficha_tecnica:''
        }
        const respuesta = await this.configuracionService.eliminarInsumosData(eliminarInsumo)
        this.mostrar_carga_todo = false;
        if (respuesta.id == "0") {
          SwalService.error('Advertencia', respuesta.mensaje);
          //await this.listarInsumosData(this.tipoindsel)
        } else {
          //SwalService.success()
          this.toaster.success('La operación se realizo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          this.mostrar_carga_todo = true;
          const input = { activo: '', id_usuario: this.id_user, id_tipo_insumo: this.tipoindsel }
          let arrpri = await this.configuracionService.listarInsumosXUsuarioData(input)
          let arract=JSON.parse(JSON.stringify(this.arreglomostrar));
          /* let indexis=-1;
          for(let i=0;i<arract.length;i++){
            indexis=arrcopia.findIndex((element) => {
              if(element.grupo==0 && element.descripcion==arract[i].descripcion){
                return true;
              }
              else if(element.grupo!=0 && element.id_insumo==arract[i].id_insumo){
                return true;
              }
              else
                return false;
            });
            if(indexis>=0){
              let mostrartemp=arrcopia[indexis].mostrar;
              let icomosttemp=arrcopia[indexis].icomost;
              let selectemp=arrcopia[indexis].seleccion;
              arract[i].mostrar=mostrartemp;
              arract[i].icomost=icomosttemp;
              arract[i].seleccion=selectemp;
            }
            arrcopia.splice(indexis,1);
          }
          this.fila_sel=-1;
          this.datasourcePri=arract; */
          let arrgru=[];
          let arrfin=[];
          for(let i=0;i<arract.length;i++){//como saber la clasificacion?, obtener el row al cerrar 
            if(arract[i].grupo==0){
              arrgru.push(arract[i]);
            }
          }
          let estclasi=1;
          for(let a=0;a<arrpri.length;a++){
            if(arrpri[a].grupo==0){
              arrfin.push(JSON.parse(JSON.stringify(arrpri[a])));
              let agru=arrgru.find(ele=> ele.id_clasificacion==arrpri[a].id_clasificacion)
              if(agru){
                estclasi=agru.icomost;//0 comprimido, 1 maximizado
                arrfin[arrfin.length-1].icomost=agru.icomost;
              }
              else{
                estclasi=1;//0 comprimido, 1 maximizado
              }
            }
            else{
              if(estclasi==1){
                arrfin.push(JSON.parse(JSON.stringify(arrpri[a])));
              }
            }
          }
          this.datasourcePri=arrpri;
          this.arreglomostrar=arrfin;
          this.fila_sel=-1;
          this.mostrar_carga_todo = false;
          this.insumoSeleccionado = null
          this.active = 0
          //await this.listarInsumosData(this.tipoindsel)
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }

  async editarImagenes(row) {
    const modalRef = this.modalService.open(ModalImagenesInsumoComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false//no cerrar el modal con ESC
    })
    modalRef.componentInstance.datosInsumo = row
    modalRef.componentInstance.nrofotossel = row.nroimgs
    const result = await modalRef.result
    if (result) {
      await this.listarInsumosData(this.tipoindsel)
    }
  }

  async importarDeExcel() {
    const modalRef = this.modalService.open(ImportarinsumosComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false//no cerrar el modal con ESC
    })
    const result = await modalRef.result
    if (result === 'ok') {
      SwalService.success()
      await this.listarInsumosData(this.tipoindsel)
    }
  }

  Exportar1(): void {
    //filtrar como el pipe y mandar el resultado
    let filtered = [];
    if (this.datasourcePri.length === 0 || !this.busqueda) {
      filtered=this.datasource2Pri;
    }
    else{
      let padre='';
      for (let i=this.datasourcePri.length-1;i>=0;i--) {
        if (this.datasourcePri[i].grupo==1 && this.datasourcePri[i].descripcion.toLowerCase().includes(this.busqueda.toLowerCase())) {
          filtered.push(this.datasourcePri[i]);
          padre=this.datasourcePri[i].desc_clasi;
        }
        if(this.datasourcePri[i].grupo==0 && padre.toLowerCase()==this.datasourcePri[i].desc_clasi.toLowerCase()){
          filtered.push(this.datasourcePri[i]);
        }
      }
      filtered=filtered.reverse()
    }
    this.exportToExcel(filtered, 'DataInsumos');
  }
  exportToExcel(json: any, excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'data': worksheet },
      SheetNames: ['data']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcel(excelBuffer, excelFileName);
  }
  private saveAsExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = fileName + EXCEL_EXT;
    link.click();
  }

  // async abrirPDF(row) {
  //   const url = await this.recuperarPDF(row.ficha_tecnica)
  //   const modalRef = this.modalService.open(VisualizadorPdfComponent, {
  //     centered: true,
  //     size: 'xl'
  //   })
  //   modalRef.componentInstance.urlReport = url
  // }

  async recuperarPDF(nombre) {
    const inputDocumento = {
      nombre: nombre,
      subc: 'Insumos'
    }
    const arregloBytes = await this.encriptadorService.recuperarDocumento(inputDocumento)
    return arregloBytes.archivo
  }

  convertDataURIToBinary(dataURI: string) {
    var raw = window.atob(dataURI);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  async openVisualizador(row, active = 1, indice, bloquearAcciones = false) {
    this.insumoSeleccionado = row
    this.indiceSeleccionado = indice
    this.active = active
    this.bloquearAcciones = this.esSecund?true:bloquearAcciones
    this.expanded = false
    if (this.mostrarModal) {
      this.modaldocumentos.show();
    }
  }
  cerrarModal() {
    //limpiar valores
    this.modaldocumentos.hide();
  }

  // async cargar(e) {
  //   if (e) {
  //     await this.listarInsumosData(this.tipoindsel)
  //     const insumoRecuperado = await this.dataSource.data.find(data => data.id_insumo == e.id_insumo)
  //     await this.openVisualizador(insumoRecuperado, e.active)
  //   }
  // }

  async actualizarDocumentos(documentos) {
    let dimagen="";
    for(let a=0;a<documentos.imagenes.length;a++){
      dimagen+=documentos.imagenes[a].nombre+'|';
      if(a==documentos.imagenes.length-1){
        dimagen=dimagen.substring(0,dimagen.length-1);
      }
    }
    if (this.tabSeleccionado == 1) {
      this.datasourcePri[documentos.indice].nroimgs = documentos.imagenes.length
      this.datasourcePri[documentos.indice].imagen = dimagen
      this.datasourcePri[documentos.indice].catalogos = documentos.catalogos
      this.datasourcePri[documentos.indice].ficha_tecnica = documentos.fichaTecnica
    } else {
      this.datasource2Pri[documentos.indice].nroimgs = documentos.imagenes.length
      this.datasource2Pri[documentos.indice].imagen = dimagen
      this.datasource2Pri[documentos.indice].catalogos = documentos.catalogos
      this.datasource2Pri[documentos.indice].ficha_tecnica = documentos.fichaTecnica
    }
    for(let row of this.arreglomostrar){
      if(this.datasourcePri[documentos.indice].id_insumo==row.id_insumo){//actualizar valor de imagen(actualizar tambien en vista actual)
        row.nroimgs = documentos.imagenes.length;
        row.imagen=dimagen==""?null:dimagen;
        row.catalogos = documentos.catalogos
        row.ficha_tecnica = documentos.fichaTecnica
        break;
      }
    }
  }

  async onNavChange(tab = null) {
    this.insumoSeleccionado = null
    this.active = 0
  }

  toggleOn(condicion: any, indpag:any) {
    /* let datasourcepri
    if (this.tabSeleccionado == 1) { 
      datasourcepri = this.datasourcePri
    } else {
      datasourcepri = this.datasource2Pri
    }
    datasourcepri[indice].icomost = 1;
    for (let row of datasourcepri) {
      if (row.id_clasificacion == condicion) {
        if (row.unidad != '') {
          row.mostrar = 1;
        }
      }
    } */
    let datasourcepri = this.datasourcePri
    let indfila=this.desde+indpag;
    let condi=condicion.id_clasificacion??'null';
    let indicebusca=Number(condicion.ind);
    //modificar arreglomostrar
    this.arreglomostrar[indfila].icomost=1;
    for(let a=indicebusca+1;a<datasourcepri.length;a++){
      let clasi=datasourcepri[a].id_clasificacion??'null';
      if(clasi==condi)
      {
        if(datasourcepri[a].unidad!=''){
          indfila++;
          this.arreglomostrar.splice(indfila,0,JSON.parse(JSON.stringify(datasourcepri[a])));
        }
      }
      else{
        break;
      }
    }
  }
  toggleOff(condicion: any, indpag:any) {
    /* let datasourcepri
    if (this.tabSeleccionado == 1) { 
      datasourcepri = this.datasourcePri
    } else {
      datasourcepri = this.datasource2Pri
    }
    datasourcepri[indice].icomost = 0;
    for (let row of datasourcepri) {
      if (row.id_clasificacion == condicion) {
        if (row.unidad != '') {
          row.mostrar = 0;
        }
      }
    } */
    let indfila=this.desde+indpag
    let condi=condicion??'null';
    this.arreglomostrar[indfila].icomost=0;
    for(let a=indfila+1;a<this.arreglomostrar.length;a++){
      let clasi=this.arreglomostrar[a].id_clasificacion??'null';
      if(clasi==condi)
      {
        if(this.arreglomostrar[a].unidad!=''){
          this.arreglomostrar.splice(a,1);
          a--;
        }
      }
      else{
        break;
      }
    }
  }
  maxtodo() {
    /* let  datasourcepri
    if (this.tabSeleccionado == 1) { 
      datasourcepri = this.datasourcePri
    } else {
      datasourcepri = this.datasource2Pri
    }
    for (let row of datasourcepri) {
      if (row.unidad != '') {
        row.mostrar = 1;
      }
      else
        row.icomost = 1;
    } */
    this.arreglomostrar=JSON.parse(JSON.stringify(this.datasourcePri));
  }
  mintodo() {
    /* let  datasourcepri
    if (this.tabSeleccionado == 1) { 
      datasourcepri = this.datasourcePri
    } else {
      datasourcepri = this.datasource2Pri
    }
    for (let row of datasourcepri) {
      if (row.unidad != '') {
        row.mostrar = 0;
      }
      else
        row.icomost = 0;
    } */
    for(let a=0;a<this.arreglomostrar.length;a++){
      if(this.arreglomostrar[a].unidad!=''){
        this.arreglomostrar.splice(a,1);
          a--;
      }
      else
        this.arreglomostrar[a].icomost=0;
    }
  }
  //catalogo sistema
  toggleOn2(condicion: any, indpag:any) {
    let datasourcepri= this.datasource2Pri
    let indfila=this.desde2+indpag;
    let condi=condicion.id_clasificacion??'null';
    let indicebusca=Number(condicion.ind);
    //modificar arreglomostrar
    this.arreglomostrar2[indfila].icomost=1;
    for(let a=indicebusca+1;a<datasourcepri.length;a++){
      let clasi=datasourcepri[a].id_clasificacion??'null';
      if(clasi==condi)
      {
        if(datasourcepri[a].unidad!=''){
          indfila++;
          this.arreglomostrar2.splice(indfila,0,JSON.parse(JSON.stringify(datasourcepri[a])));
        }
      }
      else{
        break;
      }
    }
  }
  toggleOff2(condicion: any, indpag:any) {
    let indfila=this.desde2+indpag
    let condi=condicion??'null';
    this.arreglomostrar2[indfila].icomost=0;
    for(let a=indfila+1;a<this.arreglomostrar2.length;a++){
      let clasi=this.arreglomostrar2[a].id_clasificacion??'null';
      if(clasi==condi)
      {
        if(this.arreglomostrar2[a].unidad!=''){
          this.arreglomostrar2.splice(a,1);
          a--;
        }
      }
      else{
        break;
      }
    }
  }
  maxtodo2() {
    this.arreglomostrar2=JSON.parse(JSON.stringify(this.datasource2Pri));
  }
  mintodo2() {
    for(let a=0;a<this.arreglomostrar2.length;a++){
      if(this.arreglomostrar2[a].unidad!=''){
        this.arreglomostrar2.splice(a,1);
          a--;
      }
      else
        this.arreglomostrar2[a].icomost=0;
    }
  }
}
