import { Component, HostListener, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDataInsumoComponent } from './modal-data-insumo/modal-data-insumo.component';
import { ImportarinsumosComponent } from './importarinsumos/importarinsumos.component';
import { SwalService } from 'src/app/servicios/swal.service';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { AdministradorService } from './../../../servicios/administrador.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ModalImagenesInsumoComponent } from './modal-imagenes-insumo/modal-imagenes-insumo.component';
import { TinymceComponent } from 'angular2-tinymce';
import * as XLSX from 'xlsx';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { _fixedSizeVirtualScrollStrategyFactory } from '@angular/cdk/scrolling';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { DomSanitizer } from '@angular/platform-browser';
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
  idvinculo:any;
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
export interface archivoimg {
  nombre: any;
  base: any;
}
@Component({
  selector: 'app-datainsumo',
  templateUrl: './datainsumo.component.html',
  styleUrls: ['./datainsumo.component.scss']
})
export class DatainsumoComponent implements OnInit {
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
  tipoInsumoSistema = '';
  tipoInsumo = '';
  clasiInsumos = [];
  umedidas = [];
  id_user:any;
  // displayedColumn: string[] = ['id_insumo', 'descripcion', 'unidad', 'precio', 'id_tipo_insumo', 'id_indice', 'ficha_tecnica', 'imagen', 'marcas', 'activo', 'acciones'];
  //displayedColumn: string[] = ['abrev_tipo', 'descripcion', 'unidad', 'precio', 'documentos', 'activo', 'acciones'];
  //dataSourceins = new TableVirtualScrollDataSource<rowinsumo>();
  datasourcePri: rowinsumo[] = [];
  //dataSource2ins = new TableVirtualScrollDataSource<any>();
  datasource2Pri: rowinsumo[] = [];
  //datatabla2=[];
  @ViewChild('table1', { read: MatSort, static: true }) sort: MatSort;
  @ViewChild("modalDocumentos") modaldocumentos: ModalBasicComponent;
  insumoSeleccionado: any = null;
  mostrarModal: boolean;
  active: any = 0;
  active2=11;
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
  @ViewChild("modalVincula") modalVincula: ModalBasicComponent;
  @ViewChild("modalVerArch") modalVerarch: ModalBasicComponent;
  
  datasource2m=[];
  arreglobusq=[];
  fila_selm: any
  busquedam='';
  nrofilasm=200;
  desdem=0;
  hastam=200;
  tipoInsumom = '';
  buscandom = false;
  vinculosel=null;
  vinculoant=null;
  Arrvincs=[];
  fila_selv: any;
  cambiararch=false;
  //insumosprinc=[];

  dataarchver = [];
  numeroImagen: number = 0;
  buscaficha=false;
  public basicContent: string = '';
  @ViewChild('tinymce', { static: false }) public tinymce: TinymceComponent;

  constructor(
    private modalService: NgbModal,
    private adminservice: AdministradorService,
    private encriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
    private changeDetector: ChangeDetectorRef,
    private principalService: PrincipalService,
    private toaster: ToastrService,
    private sanitizer: DomSanitizer,
  ) { }

  async ngOnInit() {
    try {
      this.mostrar_carga = true
      this.id_user = this.encriptadorService.recuperarlocalstory('idusuario');
      await this.asignarbody()
      await this.listarTipoInsumo();
      await this.listarMantenimientoUsuarios()
      this.mostrar_carga = false;
      await this.listarDataInsumoSistema(this.tipoInsumoSistema)
      await this.listarInsumosData(this.tipoInsumo)
      // let $comment = document.getElementById("dicbusq1")
      // let timeout
      //El evento lo puedes reemplazar con keyup, keypress y el tiempo a tu necesidad
      /* $comment.addEventListener('keyup', () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          let dataaux=this.datasource2Pri;
          //filtrar la tabla
          // if (dataaux.length === 0 || !this.busquedaInsSis) {
          //   this.datatabla2=dataaux;
          // }
          // let filtered = [];
          // let padre='';
          // for (let i=dataaux.length-1;i>=0;i--) {
          //   if (dataaux[i].grupo==1 && dataaux[i].descripcion.toLowerCase().includes(this.busquedaInsSis.toLowerCase())) {
          //     filtered.push(dataaux[i]);
          //     padre=dataaux[i].desc_clasi;
          //   }
          //   if(dataaux[i].grupo==0 && padre.toLowerCase()==dataaux[i].desc_clasi.toLowerCase()){
          //     filtered.push(dataaux[i]);
          //   }
          // }
          // this.datatabla2=filtered.reverse();
          
          console.log('Has dejado de escribir en el input')
          clearTimeout(timeout)
        },750)
      }) */
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
    var element = document.getElementById('horscroll1bod');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll != sizeef) {
        this.paddingscroll = sizeef;
      }
    }
  }
  async listarInsumosData(tipoins: any) {
    this.buscando2 = true
    this.datasourcePri = []
    const input = {
      activo: '',
      id_usuario: this.idUsuario,//this.id_user, //'' para ver de todos
      id_tipo_insumo: tipoins
    }
    this.datasourcePri = await this.configuracionService.listarInsumosXUsuarioData(input)
    this.arreglomostrar2=JSON.parse(JSON.stringify(this.datasourcePri));
    this.buscando2 = false
  }

  async listarDataInsumoSistema(tipoins) {//aplicar filtro si existe,//crear metodo
    this.buscando = true
    this.arreglomostrar = []
    const inputInsumosData = {
      activo: '',
      fuente: 0,
      id_tipo_insumo: tipoins
    }
    this.datasource2Pri = await this.configuracionService.listarInsumosData(inputInsumosData)
    this.datasource2m=JSON.parse(JSON.stringify(this.datasource2Pri));
    //this.datatabla2=JSON.parse(JSON.stringify(this.datasource2Pri));
    this.arreglomostrar=JSON.parse(JSON.stringify(this.datasource2Pri));
    this.buscando = false
  }

  async listarTipoInsumo() {
    this.tipoInsumos = []
    const activo = { activo: 1, esinsumo: 1 }
    this.tipoInsumos = await this.configuracionService.listarTipoInsumo(activo)
  }
  cambiarTipoIns(idtipo: any) {
    // this.tipoindsel = idtipo;
    this.listarInsumosData(this.tipoInsumo);
  }

  cambiarTipoInsSistema(idtipo = '') {
    this.listarDataInsumoSistema(this.tipoInsumoSistema);
  }
  
  limpiarfiltro() {
    this.busquedaInsSis = '';
  }

  limpiarfiltro2() {
    this.busqueda = '';
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
    if (ind == this.busqueda)
      this.fila_sel2 = -1;
    else
      this.fila_sel2 = ind;
  }
  async openModal(datos = null, editar = null, ver = null) {
    this.mostrar_carga_todo = true
    this.onNavChange()
    await this.listarTipoInsumo()
    await this.listarClasificacionInsumo();
    await this.listarMedidas();
    let arrind=[];
    arrind = await this.configuracionService.listarIndiceUnificados()
    const modalRef = this.modalService.open(ModalDataInsumoComponent, { size: 'md', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
    modalRef.componentInstance.editar = editar
    modalRef.componentInstance.datos = datos
    modalRef.componentInstance.ver = ver
    modalRef.componentInstance.tipoInsumos = this.tipoInsumos
    modalRef.componentInstance.catalogoInsumo = true
    modalRef.componentInstance.clasiInsumos = this.clasiInsumos;
    modalRef.componentInstance.medidas = this.umedidas;
    modalRef.componentInstance.tipoIndice = arrind;
    modalRef.componentInstance.fuente = 0;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result && result?.id=='1') {
      // SwalService.success()
      //await this.listarInsumosData(this.tipoInsumo)//cambiar por agregar a arreglo de insumos del usuario
      //await this.listarDataInsumoSistema(this.tipoInsumoSistema)
      this.mostrar_carga_todo = true;
      const input = { activo: '', fuente: 0, id_tipo_insumo: this.tipoInsumoSistema }
      let arrpri = await this.configuracionService.listarInsumosData(input)
      this.datasource2m=JSON.parse(JSON.stringify(arrpri));
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
          arract[i].mostrar=mostrartemp;
          arract[i].icomost=icomosttemp;
        }
        arrcopia.splice(indexis,1);
      } */
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
      this.datasource2Pri=arrpri;
      this.arreglomostrar=arrfin;
      this.mostrar_carga_todo = false;
      let idcompara=!result.observacion?datos.id_insumo:result.observacion?.includes('|')?result.observacion.split('|')[0]:result.observacion;
      const insumoRecuperado = await this.datasource2Pri.findIndex(data => data.id_insumo == idcompara)
      this.fila_sel2=insumoRecuperado;
      if (editar && !ver) {
        if(!this.expanded){
          await this.openVisualizador(this.datasource2Pri[insumoRecuperado], 1, this.indiceSeleccionado)
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
      fuente:0
    }
    this.clasiInsumos = await this.adminservice.listarClasiInsumosData(activo)
  }
  async listarMedidas() {
    this.umedidas = []
    const activo = {
      activo: 1,
      id_usuario:this.id_user,
      fuente:0,
      operador:0
    }
    this.umedidas = await this.adminservice.listarUnidadMed(activo)
  }

  async eliminarDataInsumo(row, sistema = null) {
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
        } else {
          // SwalService.success()
          this.toaster.success('La operación se realizo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          this.mostrar_carga_todo = true;
          const input = { activo: '', fuente: 0, id_tipo_insumo: this.tipoInsumoSistema }
          let arrpri = await this.configuracionService.listarInsumosData(input)
          this.datasource2m=JSON.parse(JSON.stringify(arrpri));
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
              arract[i].mostrar=mostrartemp;
              arract[i].icomost=icomosttemp;
            }
            arrcopia.splice(indexis,1);
          } */
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
          this.datasource2Pri=arrpri;
          this.arreglomostrar=arrfin;
          this.fila_sel=-1;
          //this.datasource2Pri=arract;
          this.mostrar_carga_todo = false;
          this.insumoSeleccionado = null
          this.active = 0
        }
        /* await this.listarInsumosData(this.tipoInsumo)
        await this.listarDataInsumoSistema(this.tipoInsumoSistema) */
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
      //await this.listarInsumosData(this.tipoInsumo)
      await this.listarDataInsumoSistema(this.tipoInsumoSistema)
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
      //await this.listarInsumosData(this.tipoInsumo)
      await this.listarDataInsumoSistema(this.tipoInsumoSistema)
    }
  }

  Exportar1(): void {
    //this.exportToExcel(this.dataSourceins.filteredData, 'DataInsumos');
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

  async openVisualizador(row, active = 1,  indice, bloquearAcciones = false) {
    this.insumoSeleccionado = row
    this.indiceSeleccionado = indice
    this.active = active
    // this.expanded = false
    this.bloquearAcciones = bloquearAcciones
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
  //     await this.listarInsumosData(this.tipoInsumo)
  //     await this.listarDataInsumoSistema(this.tipoInsumoSistema)
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
    if (this.tabSeleccionado == 2) {
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
    if(this.datasource2Pri[documentos.indice].idvinculo){
      for(let row of this.arreglomostrar){
        if(this.datasource2Pri[documentos.indice].idvinculo==row.idvinculo && row.idvinculo!=null){
          row.nroimgs = documentos.imagenes.length
          row.imagen=dimagen==""?null:dimagen;
          row.catalogos = documentos.catalogos
          row.ficha_tecnica = documentos.fichaTecnica
        }
      }
      for(let row2 of this.datasource2Pri){
        if(this.datasource2Pri[documentos.indice].idvinculo==row2.idvinculo && row2.idvinculo!=null){
          row2.nroimgs = documentos.imagenes.length
          row2.imagen=dimagen==""?null:dimagen;
          row2.catalogos = documentos.catalogos
          row2.ficha_tecnica = documentos.fichaTecnica
        }
      }
    }
    else{
      for(let row of this.arreglomostrar){
        if(this.datasource2Pri[documentos.indice].id_insumo==row.id_insumo){
          row.nroimgs = documentos.imagenes.length
          row.imagen=dimagen==""?null:dimagen;
          row.catalogos = documentos.catalogos
          row.ficha_tecnica = documentos.fichaTecnica
          break;
        }
      }
    }
  }
  async onNavChange(tab = null) {
    this.insumoSeleccionado = null
    this.active = 0
  }

  toggleOn(condicion: any, indpag:any) {
    /* let datasourcepri
    if (this.tabSeleccionado == 2) { 
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
    let datasourcepri = this.datasource2Pri
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
    if (this.tabSeleccionado == 2) { 
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
    if (this.tabSeleccionado == 2) { 
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
    this.arreglomostrar=JSON.parse(JSON.stringify(this.datasource2Pri));
  }
  mintodo() {
    /* let  datasourcepri
    if (this.tabSeleccionado == 2) { 
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
  async listarMantenimientoUsuarios() {
    this.listaUsuariosSistema = await this.configuracionService.ListarMantenimientoUsuarios()
  }
  async cambiarUsuario() {
    await this.listarInsumosData(this.tipoInsumo)
  }
  toggleOn2(condicion: any, indpag:any) {
    let datasourcepri= this.datasourcePri
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
    this.arreglomostrar2=JSON.parse(JSON.stringify(this.datasourcePri));
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
  //vincular insumos
  openVinc(row:any){
    this.vinculosel=row;
    this.vinculoant=row;
    let tabaux=this.datasource2m;
    let tabpasa=[];
    let vinccompara=row.idvinculo??-1;
    for(let a=0;a<tabaux.length;a++){
      tabaux[a].seleccion=0;
      if(tabaux[a].id_insumo==row.id_insumo){
        tabaux[a].seleccion=1;
        this.Arrvincs.push(tabaux[a]);
      }
      else if(tabaux[a].idvinculo==vinccompara){
        tabaux[a].seleccion=1;
        this.Arrvincs.push(tabaux[a]);
      }
      else if(tabaux[a].idvinculo && tabaux[a].idvinculo!=vinccompara){
        tabaux[a].seleccion=2;
      }
      tabpasa.push(tabaux[a]);
    }
    this.arreglobusq=tabpasa;
    this.modalVincula.show()
  }
  cerrarModal2(){
    //limpiar variables
    this.vinculosel=null;
    this.vinculoant=null;
    this.cambiararch=false;
    this.Arrvincs=[];
    this.tipoInsumom='';
    this.modalVincula.hide();
  }
  cambiarpaginam(e:PageEvent){
    this.desdem=e.pageIndex*e.pageSize;
    this.hastam=this.desdem+e.pageSize;
    this.nrofilasm=e.pageSize;
  }
  maxtodom() {
    //revisar el caso que este filtrado por tipo
    if(this.tipoInsumom==''){
      this.arreglobusq=JSON.parse(JSON.stringify(this.datasource2m));
    }
    else{
      let arr1=[];
      for(let row of this.datasource2m){
        if(this.tipoInsumom=='' || row.id_tipo_insumo==this.tipoInsumom){
          row.icomost=1;
          arr1.push(row);
        }
        if(row.grupo==0){
          row.icomost=1;
          arr1.push(row);
        }
      }
      let arraux=[];
      for(let a=0;a<arr1.length;a++){
        if(arr1[a].grupo==0){
          if (a < arr1.length - 1)
          {
            //asignar tambien tipo? o filtrar antes por tipo, luego hacer esta asignacion?
            if (arr1[a+1].id_clasificacion == arr1[a].id_clasificacion && arr1[a+1].grupo == "1")
            {
              arr1[a].ind = arraux.length;
                arraux.push(arr1[a]);
            }
          }
        }
        else{
          arr1[a].ind = arraux.length;
          arraux.push(arr1[a]);
        }
      }
      this.arreglobusq=arraux//JSON.parse(JSON.stringify(this.datasource2m));
    }
  }
  mintodom() {
    for(let a=0;a<this.arreglobusq.length;a++){
      if(this.arreglobusq[a].unidad!=''){
        this.arreglobusq.splice(a,1);
          a--;
      }
      else
        this.arreglobusq[a].icomost=0;
    }
  }
  limpiarfiltrom() {
    this.busquedam = '';
  }
  async cambiarTipoInsm(idtipo = '') {
    this.buscandom = true
    this.arreglobusq = []
    let arr1=[];
    for(let row of this.datasource2m){
      if(this.tipoInsumom=='' || row.id_tipo_insumo==this.tipoInsumom){
        arr1.push(row);
      }
      if(row.grupo==0){
        arr1.push(row);
      }
    }
    let arraux=[];
    for(let a=0;a<arr1.length;a++){
      if(arr1[a].grupo==0){
        if (a < arr1.length - 1)
        {
          if (arr1[a+1].id_clasificacion == arr1[a].id_clasificacion && arr1[a+1].grupo == "1")
          {
            arr1[a].ind = arraux.length;
              arraux.push(arr1[a]);
          }
        }
      }
      else{
        arr1[a].ind = arraux.length;
        arraux.push(arr1[a]);
      }
    }
    this.arreglobusq=arraux;
    this.buscandom = false;
  }
  toggleOnm(condicion: any, indpag:any) {//revisar funcionamiento
    let indfila=this.desdem+indpag;
    let condi=condicion.id_clasificacion??'null';
    let indicebusca=Number(condicion.ind);
    this.arreglobusq[indfila].icomost=1;
    for(let a=0;a<this.datasource2m.length;a++){
      let clasi=this.datasource2m[a].id_clasificacion??'null';
      if(clasi==condi)
      {
        if(this.datasource2m[a].unidad!=''){
          indfila++;
          this.arreglobusq.splice(indfila,0,JSON.parse(JSON.stringify(this.datasource2m[a])));
        }
      }
      /* else{
        break;
      } */
    }
  }
  toggleOffm(condicion: any, indpag:any) {
    let indfila=this.desdem+indpag
    let condi=condicion??'null';
    this.arreglobusq[indfila].icomost=0;
    for(let a=indfila+1;a<this.arreglobusq.length;a++){
      let clasi=this.arreglobusq[a].id_clasificacion??'null';
      if(clasi==condi)
      {
        if(this.arreglobusq[a].unidad!=''){
          this.arreglobusq.splice(a,1);
          a--;
        }
      }
      else{
        break;
      }
    }
  }
  cambindiceselm(ind: any) {
    if (ind == this.fila_selm)
    this.fila_selm = -1;
  else
    this.fila_selm = ind;
  }
  cambioselm(row:any){
    if(row.seleccion==0){
      row.seleccion=1;
      this.Arrvincs.push(row);
      //actualizar en arreglo principal
      for(let row1 of this.datasource2m){
        if(row1.id_insumo==row.id_insumo){
          row1.seleccion=1;
          break;
        }
      }
    }
    else{
      row.seleccion=0;
      for(let row1 of this.datasource2m){
        if(row1.id_insumo==row.id_insumo){
          row1.seleccion=0;
          break;
        }
      }
    }
  }
  async Desvincula(row:any,ind:any){
    if(this.Arrvincs.length>1){
      if(row.id_insumo==this.vinculosel.idvinculo){//advertencia para cambiar el insumo principal
        this.Arrvincs.splice(ind,1);
        this.vinculosel=this.Arrvincs[0];
        this.vinculosel.idvinculo=this.Arrvincs[0].id_insumo;
        this.cambiararch=true;
        for(let fila of this.arreglobusq){
          if(fila.id_insumo==row.id_insumo){
            fila.seleccion=0;
            break;
          }
        }
        //actualizar en arreglo principal
        for(let row1 of this.datasource2m){
          if(row1.id_insumo==row.id_insumo){
            row1.seleccion=0;
            break;
          }
        }
      }else{
        this.Arrvincs.splice(ind,1);
        for(let fila of this.arreglobusq){
          if(fila.id_insumo==row.id_insumo){
            fila.seleccion=0;
            break;
          }
        }
        for(let row1 of this.datasource2m){
          if(row1.id_insumo==row.id_insumo){
            row1.seleccion=0;
            break;
          }
        }
      }
    }
    else{
      this.toaster.error('No se puede eliminar la ultima partida.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async GuardarVinc(){
    this.mostrar_carga_todo=true;
    let tabla1=JSON.stringify(this.Arrvincs);
    const body = JSON.stringify({
      'idusuario': this.id_user,
      'idvinculo': this.vinculosel.idvinculo??this.vinculosel.id_insumo,
      'idvinculoant': this.vinculoant.idvinculo??this.vinculoant.id_insumo,//nuevo valor?
      'imagen': this.vinculosel.imagen,
      'nroimgs': this.vinculosel.nroimgs,
      'ficha_tecnica': this.vinculosel.ficha_tecnica,
      'datos1': tabla1,
    });
    let result = await this.principalService.VincularArchInsumos(body)
    if(result.id=="1"){
      //cambiar nombre de archivos
      if(this.cambiararch){//advertencia para cambiar el insumo principal
        if(this.vinculoant.ficha_tecnica){
          let indprim = this.vinculoant.ficha_tecnica.indexOf('-');
          let nnomb = (this.vinculosel.idvinculo??this.vinculosel.id_vinculo) + this.vinculoant.ficha_tecnica.substring(indprim);
          this.vinculosel.ficha_tecnica=nnomb;
        }
        if(this.vinculoant.imagen){
          let arrimg=this.vinculoant.imagen.split('|');
          let nimg='';
          for(let m=0;m<arrimg.length;m++){
            let indprim = arrimg[m].indexOf('-');
            let nnomb = (this.vinculosel.idvinculo??this.vinculosel.id_vinculo) + arrimg[m].substring(indprim);
            nimg=m==arrimg.length-1?nimg+nnomb:nimg+nnomb+'|';
          }
          this.vinculosel.imagen=nimg;
        }
      }
      let vinc1=JSON.parse(JSON.stringify(this.vinculoant))
      let vinc2=JSON.parse(JSON.stringify(this.vinculosel))
      for(let row1 of this.arreglomostrar){//no actualiza cuando se desvincula el principal
        if(row1.idvinculo==(vinc1.idvinculo??vinc1.id_insumo)){
          row1.idvinculo=null;
          row1.nroimgs=0;
          row1.imagen=null;
          row1.ficha_tecnica=null;
        }
        let findtab=this.Arrvincs.find(ele=> ele.id_insumo==row1.id_insumo);
        if(findtab){
          row1.idvinculo=vinc2.idvinculo??vinc2.id_insumo;
          row1.nroimgs=vinc2.nroimgs;
          row1.imagen=vinc2.imagen;
          row1.ficha_tecnica=vinc2.ficha_tecnica;
        }
      }
      //tambien modificar datasource pri
      for(let row2 of this.datasource2Pri){
        if(row2.idvinculo==(vinc1.idvinculo??vinc1.id_insumo)){
          row2.idvinculo=null;
          row2.nroimgs=0;
          row2.imagen=null;
          row2.ficha_tecnica=null;
        }
        let findtab=this.Arrvincs.find(ele=> ele.id_insumo==row2.id_insumo);
        if(findtab){
          row2.idvinculo=this.vinculosel.idvinculo??this.vinculosel.id_insumo;
          row2.nroimgs=this.vinculosel.nroimgs;
          row2.imagen=this.vinculosel.imagen;
          row2.ficha_tecnica=this.vinculosel.ficha_tecnica;
        }
      }
      this.toaster.success('La operación se realizo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
    this.vinculoant=null;
    this.vinculosel=null;
    this.cambiararch=false;
    this.Arrvincs=[];
    this.tipoInsumom='';
    this.modalVincula.hide();
    this.mostrar_carga_todo=false;
  }
  async onNavChange2(tab = null) {
    
  }
  async seleccionarImagen(nroImagen) {
    this.numeroImagen = nroImagen
  }
  async openVerArch(){
    this.mostrar_carga_todo=true;
    await this.recuperarImagenes(this.vinculosel?.imagen);
    this.buscaficha=true;
    let result=await this.principalService.ArchivoFichaInsumo({nomarch:this.vinculosel?.ficha_tecnica})
    if(result?.length>0){
      this.basicContent=result[0].ficha;
    }
    this.buscaficha=false;
    this.mostrar_carga_todo=false;
    this.modalVerarch.show()
  }
  cerrarModal3(){
    //limpiar variables
    this.active2=11;
    this.modalVerarch.hide();
  }
  cambindiceselv(ind: any) {
    if (ind == this.fila_selv)
      this.fila_selv = -1;
    else
      this.fila_selv = ind;
  }
  async recuperarImagenes(stringImagen) {
    try {
      if (stringImagen) {
        this.mostrar_carga = true
        const nombresImagenes = {
          imagen: stringImagen ? stringImagen : ''
        }
        const response = await this.configuracionService.descargarArrayImagenesInsumo(nombresImagenes)
        if (response) {
          this.dataarchver = []
          response.map(data => {
            let fagre: archivoimg;
            if(data.archivo){
              let objectURL = 'data:image/png;base64,' + data.archivo;
              fagre = { nombre: data.nombre, base: this.sanitizer.bypassSecurityTrustUrl(objectURL) };
            }
            else{
              fagre = { nombre: data.nombre, base: data.nombre };
            }
            this.dataarchver.push(fagre);
          })
          this.numeroImagen=0;
        }
        this.mostrar_carga = false
      } else {
        this.dataarchver = []
      }
    } catch (e) {
      console.log(e);
      this.mostrar_carga = false
      SwalService.error()
    }
  }
}