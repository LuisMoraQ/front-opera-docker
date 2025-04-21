import { Component, OnInit, Input,HostListener,ViewEncapsulation,ViewChild,AfterViewInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BuscaaddunidadmedComponent } from '../../unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { ModalListaClasificacionComponent } from 'src/app/componentes/administrador/datainsumo/modal-lista-clasificacion/modal-lista-clasificacion.component';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
export interface rowinsumo {
  id_tipo_insumo: any;
  id_insumo: any;
  codigo:any;
  descripcion: any;
  id_unidad:any;
  unidad:any;
  operador:any;
  tipo_insumo:any;
  precio:any;
  fuente:any;
  id_indice:any;
  seleccion:any;
  id_clasificacion:any;
  nroimgs:any;
  ficha_tecnica:any;
  grupo:any;
  desc_clasi:any;
  catalogos:any;
  //nrocatalogos:any;
  mostrar:any;
  icomost:any;
  ind:any;
  //ind2:any;
}
export interface unidadmed {
  id_unidad: string;
  unidad: string;
  descripcion:string;
  operador:string;
  tipo_insumo:string;
  id_usuario:string;
  fuente:string;
  activo: string;
}
@Component({
  selector: 'app-buscarinsumo',
  templateUrl: './buscarinsumo.component.html',
  styleUrls: ['./buscarinsumo.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class BuscarinsumoComponent implements OnInit,AfterViewInit {
  @Input('height') height: number = 100;
  @Input() moneda='S/';
  @Input() iduser:any;
  paddingscroll=17;
  mostrar_carga_todo: boolean = false;
  busqueda = '';
  busqueda3='';
  active = 1;
  nomtabsel='';
  nrofilas=200;
  desde=0;
  hasta=200;
  pageSizeOptions=[ 50, 100,150, 200];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('tabset')tabset: any;
  @Input() dec_cant=4;
  @Input() mask_cant='0.4';
  @Input() afcuad=0;
  @Input() clasiInsumos = [];
  @Input() tipoinsumo:any;
  @Input() id_tipo_insumo:any;
  @Input() indices=[];
  @Input() insumos:rowinsumo[]=[];
  @Input() medidas: unidadmed[] = [];
  @Input() rowfiltro:any;
  tipoIndice = [];
  @Input() existentes=[];
  @Input() reemplaza=false;
  @Input() inpfuente = 1;
  @Input() tablaacu=[];
  @Input() acuAct=[];
  mostdetacu=false;
  clasiInsumosFiltrado: any[] = [];
  arregloseleccion=[];
  filaArrSel=-1;
  arreglomostrar=[];
  arregloselact=[];
  arregloact=[];
  dec_precio=2;
  mask_precio='0.2';
  minimbut=false;
  formDataInsumo = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    unidad: new UntypedFormControl('', [Validators.required]),
    precio: new UntypedFormControl('0.000', [Validators.required, Validators.min(0.01)]),
    id_tipo: new UntypedFormControl('', [Validators.required]),
    id_indice: new UntypedFormControl('', [Validators.required]),
    id_clasi: new UntypedFormControl(''),
    /* nombre_indice: new FormControl('', [Validators.required]), */
  })
  get descripcion(): UntypedFormControl { return this.formDataInsumo.get('descripcion') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formDataInsumo.get('unidad') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.formDataInsumo.get('precio') as UntypedFormControl }
  get id_tipo(): UntypedFormControl { return this.formDataInsumo.get('id_tipo') as UntypedFormControl }
  /* get nombre_indice(): FormControl { return this.formDataInsumo.get('nombre_indice') as FormControl } */
  get id_indice(): UntypedFormControl { return this.formDataInsumo.get('id_indice') as UntypedFormControl }
  get id_clasi(): UntypedFormControl { return this.formDataInsumo.get('id_clasi') as UntypedFormControl }

  //displayedColumnins: string[] = ['seleccion', 'descripcion', 'unidad', 'precio','fuente'/* , 'acciones' */];
  //dataSourceins = new TableVirtualScrollDataSource<rowinsumo>();
  datasourcePri:rowinsumo[]=[];
  fila_sel:any;
  fila_sel3:any;
  buscando = false;
  buscando3 = false;

  constructor(
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    public formsService: FormsService,
    private _EncriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
    private administradorService: AdministradorService,
    private catalogosService: CatalogosService,
    private modalService: NgbModal,
  ) { }

  async ngOnInit() {
    var resto = 300;
    if(this.reemplaza){
      this.height = window.innerHeight - resto;
    }
    else{
      this.height=(window.innerHeight - 270)/2;
    }
    this.minimbut=document.body.clientWidth <= 991?true:false;
    let nfilas=200;//Math.floor((this.height-20)/24);
    this.desde=0;
    this.hasta=nfilas;
    this.nrofilas=nfilas;
    let exis=this.pageSizeOptions.indexOf(this.nrofilas);
    if(exis<0){
      this.pageSizeOptions.unshift(this.nrofilas)
    }
    this.buscando=true;
    this.iduser=this.iduser??this._EncriptadorService.recuperarlocalstory('idusuario');
    document.getElementById('inpbusq')?.focus();
    this.medidas = await this.administradorService.listarUnidadMed({ id_usuario:this.iduser,fuente:'',activo: 1,operador:0 })
    this.indices = await this.configuracionService.listarIndiceUnificados({ activo: 1 })
    await this.listarClasificacionInsumo();
    if(this.reemplaza){
      this.descripcion.setValue(this.rowfiltro.descripcion)
      this.unidad.setValue(this.rowfiltro.id_unidad?Number(this.rowfiltro.id_unidad):'')
      this.precio.setValue(this.rowfiltro.precio)
      this.id_tipo.setValue(Number(this.rowfiltro.id_tipo_insumo))
      this.id_indice.setValue(this.rowfiltro.id_indice??'')
      this.id_clasi.setValue(this.rowfiltro.id_clasificacion?Number(this.rowfiltro.id_clasificacion):'')
    }
    console.time('busqins')
    this.insumos = await this.catalogosService.BuscarDataInsumos({id_usuario: this.iduser,id_tipo_insumo: this.id_tipo_insumo,filtro:this.rowfiltro?1:'',operador:this.rowfiltro?(this.rowfiltro.operador??''):'',
    tipo_insumo:this.rowfiltro?(this.rowfiltro.tipo_insumo??''):''});
    console.timeEnd('busqins')
    this.id_tipo.setValue(this.tipoinsumo);
    if(this.existentes.length>0){
      for(let row of this.existentes){
        for(let row2 of this.insumos){
          if(row.id_insumo!=null && row.id_insumo==row2.id_insumo){
            row2.seleccion=2;
            break;
          }
        }
      }
    }
    this.datasourcePri=JSON.parse(JSON.stringify(this.insumos));
    this.arreglomostrar=JSON.parse(JSON.stringify(this.insumos));
    this.buscando=false;
    let decimales = this._EncriptadorService.recuperarlocalstory('decimales');
    if(decimales?.toString().includes('|')){
      let arrdec=decimales.split('|');
      this.dec_precio=arrdec[1];
      this.mask_precio='0.'+arrdec[1];
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 300;
    if(this.reemplaza){
      this.height = window.innerHeight - resto;
    }
    else{
      this.height=(window.innerHeight - 270)/2;
    }
    this.minimbut=document.body.clientWidth <= 991?true:false;
  }
  ngAfterViewInit(): void {
    this.nomtabsel="tab1";
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
  async onNavChange(tab = null) {
    this.nomtabsel=tab;
    if(tab=='tab3'){
      if(this.arregloact.length==0){
        //relacion de insumos por tipo
        this.buscando3=true;
        let tabacu=JSON.parse(JSON.stringify(this.tablaacu));
        let tabresult=[];
        for(let b=0;b<tabacu.length;b++){
          if(Number(tabacu[b].num_det)>0 && tabacu[b].id_tipo_insumo==this.id_tipo_insumo){
            const index = tabresult.findIndex(elem => {
              if(elem.operador!='%'){
                if(elem.id_tipo_insumo.toString() == tabacu[b].id_tipo_insumo.toString() && elem.descripcion==tabacu[b].descripcion && elem.precio==tabacu[b].precio){
                  return elem;
                }
              }
              else{//porcentajes agrupa siempre, cantidad se recalcula
                if(elem.id_tipo_insumo.toString() == tabacu[b].id_tipo_insumo.toString() && elem.descripcion==tabacu[b].descripcion)
                  return elem;
              }
            });
            if(index<0){//si encuentra suma,
              if(tabacu[b].operador=='%'){
                tabacu[b].precio=0;
              }
              tabresult.push(tabacu[b]);
              tabresult[tabresult.length-1].cantidad=0;
              tabresult[tabresult.length-1].cuadrilla=0;
              if(this.existentes.length>0){
                for(let row of this.existentes){
                  if(row.id_insumo!=null && row.id_insumo==tabresult[tabresult.length-1].id_insumo){
                    tabresult[tabresult.length-1].seleccion=2;
                    break;
                  }
                }
              }
            }
          }
        }
        if(tabresult.length>0){
          tabresult.sort( (a, b) => {
            /* if(a.id_tipo_insumo < b.id_tipo_insumo) {
              return -1;
            }
            if(a.id_tipo_insumo > b.id_tipo_insumo) {
              return 1;
            }
            if (a.num_det < b.num_det) {
              return -1;
            }
            if (a.num_det > b.num_det) {
              return 1;
            } */
            if (a.descripcion < b.descripcion) {
              return -1;
            }
            if (a.descripcion > b.descripcion) {
              return 1;
            }
            return 0;
          });
        }
        this.buscando3=false;
        this.arregloact=tabresult;
      }
    }
  }
  cambiarpagina(e:PageEvent){
    this.desde=e.pageIndex*e.pageSize;
    this.hasta=this.desde+e.pageSize;
    this.nrofilas=e.pageSize;
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  limpiarfiltro3() {
    this.busqueda3 = '';
  }
  async seleccionar(){
    try {
      if(this.arregloseleccion.length>0){
        this.modal.close(this.arregloseleccion)
      }
      else{
        if(this.nomtabsel=='tab1' || this.nomtabsel=='tab3'){
          let cont=0;
          let aux=[];
          for(let i=0;i<this.arregloselact.length;i++){
              cont++;
              aux.push(this.arregloselact[i])
          }
          if(cont>0){
            this.modal.close(aux)
          }
          else{
            this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
          }
        }
        else{//guardar en partidas y seleccionar
          if (this.formDataInsumo.invalid) {
            this.formDataInsumo.markAllAsTouched()
            this.toaster.error('Datos incompletos', 'Error', {closeButton: false,positionClass: 'toast-bottom-right', timeOut: 5000})
            return
          } else {
            let undsel=this.medidas.find(data=>data.id_unidad==this.unidad.value);
            if(this.rowfiltro){
              if((undsel.operador=='%' && this.rowfiltro.operador!='%') || (undsel.operador!='%' && this.rowfiltro.operador=='%')){
                this.toaster.error('La unidad de medida no es admitida para reemplazar el insumo.', 'Error', {closeButton: false,positionClass: 'toast-bottom-right', timeOut: 5000})
                return;
              }
            }
            if(undsel.tipo_insumo!=this.id_tipo_insumo){
              this.mostrar_carga_todo = true
              const inputDataInsumo = {
                descripcion: this.descripcion.value.toUpperCase(),
                unidad: this.unidad.value,
                precio: this.precio.value,
                id_tipo: this.id_tipo_insumo,
                id_indice: this.id_indice.value,
                id_clasificacion: this.id_clasi.value,
                ficha_tecnica: null,
                marcas: '',
                id_usuario: this.iduser,
                fuente: this.inpfuente,
                activo: 1
              }
              let resp=await this.configuracionService.guardarInsumosData(inputDataInsumo)
              this.mostrar_carga_todo = false
              if(resp){
                if(resp.id=='1'){
                  let codguarda='';
                  let idinsguarda='';
                  if(resp.observacion?.toString().includes('|')){
                    codguarda=resp.observacion.toString().split('|')[1];
                    idinsguarda=resp.observacion.toString().split('|')[0]
                  }
                  //SwalService.success('Correcto',resp.mensaje)
                  this.toaster.success(resp.mensaje, 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
                  let aux=[];
                  aux.push({
                    codigo:codguarda,
                    descripcion: this.descripcion.value.toUpperCase(),
                    id_unidad:this.unidad.value,
                    unidad:undsel.unidad,
                    operador:undsel.operador,
                    tipo_insumo:undsel.tipo_insumo,
                    precio: this.precio.value.toString().replace(',',''),
                    id_tipo_insumo: this.id_tipo_insumo,
                    id_insumo: idinsguarda,
                    id_indice:this.id_indice.value,
                    fuente:this.inpfuente,//condicionar
                  })
                  this.modal.close(aux)
                }
                else{
                  this.toaster.error(resp.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
                  //SwalService.error('Advertencia',resp.mensaje)
                }
              }
            }
            else{
              this.toaster.error('No se puede asignar la unidad de medida al tipo de insumo seleccionado.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            }
          }
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  toggleOn(row:any,indice:any){
    let indfila=this.desde+indice;
    let condi=row.id_clasificacion??'null';
    let indicebusca=Number(row.ind);
    //modificar arreglomostrar
    this.arreglomostrar[indfila].icomost=1;
    for(let a=indicebusca+1;a<this.datasourcePri.length;a++){
      let clasi=this.datasourcePri[a].id_clasificacion??'null';
      if(clasi==condi)
      {
        if(this.datasourcePri[a].unidad!=''){
          indfila++;
          this.arreglomostrar.splice(indfila,0,JSON.parse(JSON.stringify(this.datasourcePri[a])));
        }
      }
      else{
        break;
      }
    }
  }
  toggleOff(condicion:any,indice:any){//agregar indice a la tabla?
    let indfila=this.desde+indice
    let condi=condicion??'null';
    this.arreglomostrar[indfila].icomost=0;
    for(let a=indfila+1;indfila<this.arreglomostrar.length;a++){
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
  maxtodo(){
    /* for(let row of this.datasourcePri){
      if(row.unidad!=''){
        row.mostrar=1;
      }
      else
        row.icomost=1;
    } */
    this.arreglomostrar=JSON.parse(JSON.stringify(this.datasourcePri));
  }
  mintodo(){
    for(let a=0;a<this.arreglomostrar.length;a++){
      if(this.arreglomostrar[a].unidad!=''){
        this.arreglomostrar.splice(a,1);
          a--;
      }
      else
        this.arreglomostrar[a].icomost=0;
    }
  }
  closeModal(){
    this.modal.close(null)
  }
  cambindicesel(ind:any){
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }
  cambioselt1(row:any,indice:any){//agregar al arreglo seleccion (indice)
    let indfila=this.desde+indice
    let indpri=row.ind;
    if(this.reemplaza && this.arregloselact.length>0){
      let idinsant;
      for(let m=0;m<this.arregloselact.length;m++){
        idinsant=this.arregloselact[m].id_insumo;
        let indpri=this.arregloselact[m].ind;
        this.datasourcePri[indpri].seleccion=0;
      }
      for(let a=0;a<this.arreglomostrar.length;a++){
        if(idinsant==this.arreglomostrar[a].id_insumo){
          this.arreglomostrar[a].seleccion=0;
          break;
        }
      }
      this.limpiarsel3();//crear otro limpiar, porque solo hay uno seleccionado
      /* this.limpiarsel() */
      this.arregloselact=[];
    }
    if(row.seleccion==0){
      row.seleccion=1;
      this.datasourcePri[indpri].seleccion=1;
      //this.arreglomostrar[indfila].seleccion=1;
      //agrega a seleccion
      row.tabla=1;
      this.arregloselact.push(row);
    }
    else{
      row.seleccion=0;
      this.datasourcePri[indpri].seleccion=0;
      //this.arreglomostrar[indfila].seleccion=0;
      //elimina de seleccion
      for(let b=0;b<this.arregloselact.length;b++){
        if(row.id_insumo==this.arregloselact[b].id_insumo){
          this.arregloselact.splice(b,1);
          break;
        }
      }
    }
  }
  limpiarsel(){
    if(this.arregloselact.length>0){
      for(let m=0;m<this.arregloselact.length;m++){
        let indpri=this.arregloselact[m].ind;
        if(this.datasourcePri[indpri].seleccion!=2)
          this.datasourcePri[indpri].seleccion=0;
      }
      for(let b=0;b<this.arregloselact.length;b++){
        if(this.arregloselact[b].tabla==1){
          this.arregloselact.splice(b,1);
          b--;
        }
      }
      for(let a=0;a<this.arreglomostrar.length;a++){
        if(this.arreglomostrar[a].seleccion!=2)
          this.arreglomostrar[a].seleccion=0;
      }
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async verificarDecimales() {
    const precioValido = await this.formsService.autocompletarPrecio(this.precio.value, 3)
    this.precio.setValue(precioValido)
  }
  async guardar(){
    try {
      if (this.formDataInsumo.invalid) {
        this.formDataInsumo.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {closeButton: false,positionClass: 'toast-bottom-right', timeOut: 5000})
        return
      } else {
        let undsel=this.medidas.find(data=>data.id_unidad==this.unidad.value);
        if(undsel.tipo_insumo!=this.id_tipo_insumo){
          this.mostrar_carga_todo = true
          const inputDataInsumo = {
            descripcion: this.descripcion.value.toUpperCase(),
            unidad: this.unidad.value,
            precio: this.precio.value,
            id_tipo: this.id_tipo_insumo,
            id_indice: this.id_indice.value,
            id_clasificacion: this.id_clasi.value,
            ficha_tecnica: null,
            marcas: '',
            id_usuario: this.iduser,
            fuente: this.inpfuente,
            activo: 1
          }
          let resp=await this.configuracionService.guardarInsumosData(inputDataInsumo)
          this.mostrar_carga_todo = false
          if(resp){
            if(resp.id=='1'){
              let codguarda='';
              let idinsguarda='';
              if(resp.observacion?.toString().includes('|')){
                codguarda=resp.observacion.toString().split('|')[1];
                idinsguarda=resp.observacion.toString().split('|')[0]
              }
              //SwalService.success('Correcto',resp.mensaje)
              this.toaster.success(resp.mensaje, 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              let aux=[];
              aux.push({
                codigo:codguarda,
                descripcion: this.descripcion.value.toUpperCase(),
                id_unidad:this.unidad.value,
                unidad:undsel.unidad,
                operador:undsel.operador,
                tipo_insumo:undsel.tipo_insumo,
                precio: this.precio.value.toString().replace(',',''),
                id_tipo_insumo: this.id_tipo_insumo,
                id_insumo: idinsguarda,
                id_indice:this.id_indice.value,
                fuente:this.inpfuente,//condicionar
              })
              this.modal.close(aux)
            }
            else{
              this.toaster.error(resp.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              //SwalService.error('Advertencia',resp.mensaje)
            }
          }
        }
        else{
          this.toaster.error('No se puede asignar la unidad de medida al tipo de insumo seleccionado.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  async abrirmodalUnidades(){//agregar condicion si es unidad % quitar validacion de monto, bloquear y guardar con 0
    this.mostrar_carga_todo = true
    let tablaunid = await this.administradorService.listarUnidadMedxtipo({ id_usuario:this.iduser,tipo_insumo:this.id_tipo_insumo })//cambiar a dinamico u otra consulta que retorne todo
    const valorInicial = this.medidas.find(data => data.id_unidad == this.unidad.value)
    const modalRef = await this.modalService.open(BuscaaddunidadmedComponent, { size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
    modalRef.componentInstance.Listaunidades = tablaunid;
    modalRef.componentInstance.operador = 0;
    modalRef.componentInstance.esinsumo = 1;
    modalRef.componentInstance.tipoinsumo = this.id_tipo_insumo;
    modalRef.componentInstance.iduser = this.iduser;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      if(result.actarray){
        this.medidas=result.tablaact;
      }
      this.unidad.setValue(Number(result.datosel.id_unidad))
      this.cambUnidad();
    } else {
      if (valorInicial) {
        this.unidad.setValue(valorInicial.id_unidad)
        this.cambUnidad();
      }
    }
  }
  cambUnidad(){
    if(this.unidad.value!=''){
      let undsel=this.medidas.find(ele=>ele.id_unidad==this.unidad.value);
      if(undsel){
        if(undsel.operador=='%'){
          this.precio.disable();
          this.precio.setValue('0.00');
          this.precio.clearValidators();
          this.precio.updateValueAndValidity();
        }
        else{
          this.precio.enable();
          this.precio.setValidators([Validators.min(0.01)]);
          this.precio.updateValueAndValidity();
        }
      }
      else{
        this.unidad.setValue('');
      }
    }
    else{
      this.precio.enable();
      this.precio.setValidators([Validators.min(0.01)]);
      this.precio.updateValueAndValidity();
    }
  }
  async listarClasificacionInsumo() {
    this.clasiInsumos = []
    const activo = {
      activo: 1,
      id_tipo_insumo:'',
      id_usuario:this.iduser,
      fuente:''
    }
    this.clasiInsumos = await this.administradorService.listarClasiInsumosData(activo)
    this.clasiInsumosFiltrado = await this.clasiInsumos.filter(clasificacion => clasificacion.id_tipo_insumo == this.id_tipo_insumo)
  }
  async abrirModalClasificacion() {
    this.mostrar_carga_todo = true
    const modalRef = await this.modalService.open(ModalListaClasificacionComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
    modalRef.componentInstance.fuentepasa = this.inpfuente;
    modalRef.componentInstance.id_user = this.iduser;
    modalRef.componentInstance.clasiInsumos = this.clasiInsumos
    modalRef.componentInstance.tipoInsumo = this.id_tipo_insumo
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      //this.id_tipo.setValue(result.id_tipo)
      //await this.cambioTipoInsumo()
      await this.listarClasificacionInsumo();
      this.id_clasi.setValue(result.id_clasificacion)
    }
  }
  duplicafila(row:any){
    //this.active=2;
    this.descripcion.setValue(row.descripcion);
    this.unidad.setValue(Number(row.id_unidad));
    this.precio.setValue(this.formsService.redondeo(row.precio,2));
    //this.id_tipo.setValue(row.id_tipo_insumo);
    this.id_indice.setValue(row.id_indice);
    this.id_clasi.setValue(row.id_clasificacion?Number(row.id_clasificacion):'');
    this.cambUnidad();
    this.tabset.select('tab2');
  }
  //tabla preliminar
  async addtoTabla(){
    try{
      if(this.nomtabsel=='tab1' || this.nomtabsel=='tab3'){//tabla
        let cont=0;
        let cexis=0;
        for(let i=0;i<this.arregloselact.length;i++){
          cont++;
          let index=this.arregloseleccion.find(item=>item.descripcion==this.arregloselact[i].descripcion);
          if(this.arregloselact[i].unidad!='' && !index){
            this.arregloseleccion.push(this.arregloselact[i]);
            this.arregloseleccion[this.arregloseleccion.length-1].cantidad=0;
            this.arregloseleccion[this.arregloseleccion.length-1].editar=0;
            this.arregloseleccion[this.arregloseleccion.length-1].tipo_insumo=this.arregloselact[i].tipo_insumo!=null?this.arregloselact[i].tipo_insumo:null;
          }
          else{
            cexis++;
          }
        }
        if(cont<=0){
          this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        }
        else{
          if(cexis){
            this.toaster.info('No se agregaron los insumos que ya existen','', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
          }

          if(this.arregloselact.length>0){
            for(let a=0;a<this.arregloact.length;a++){
              if(this.arregloact[a].seleccion!=2)
                this.arregloact[a].seleccion=0;
            }
          }
          if(this.arregloselact.length>0){
            for(let m=0;m<this.arregloselact.length;m++){
              if(this.arregloselact[m].tabla==3){
                this.arregloselact.splice(m,1);
                m--;
              }
              else{
                let indpri=this.arregloselact[m].ind;
                if(indpri){
                  if(this.datasourcePri[indpri].seleccion!=2)
                    this.datasourcePri[indpri].seleccion=0;
                }
              }
            }
            for(let a=0;a<this.arreglomostrar.length;a++){
              if(this.arreglomostrar[a].seleccion!=2)
                this.arreglomostrar[a].seleccion=0;
            }
          }
          this.arregloselact=[];
        }
      }
      else{//formulario
        if (this.formDataInsumo.invalid) {
          this.formDataInsumo.markAllAsTouched()
          this.toaster.error('Datos incompletos', 'Error', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
          return
        } else {
          if (this.formDataInsumo.invalid) {
            this.formDataInsumo.markAllAsTouched()
            this.toaster.error('Datos incompletos', 'Error', {closeButton: false,positionClass: 'toast-bottom-right', timeOut: 5000})
            return
          } else {
            let undsel=this.medidas.find(data=>data.id_unidad==this.unidad.value);
            if(undsel.tipo_insumo!=this.id_tipo_insumo){
              this.mostrar_carga_todo = true
              const inputDataInsumo = {
                descripcion: this.descripcion.value.toUpperCase(),
                unidad: this.unidad.value,
                precio: this.precio.value,
                id_tipo: this.id_tipo_insumo,
                id_indice: this.id_indice.value,
                id_clasificacion: this.id_clasi.value,
                ficha_tecnica: null,
                marcas: '',
                id_usuario: this.iduser,
                fuente: this.inpfuente,
                activo: 1
              }
              let resp=await this.configuracionService.guardarInsumosData(inputDataInsumo)
              this.mostrar_carga_todo = false
              if(resp){
                if(resp.id=='1'){
                  let codguarda='';
                  let idinsguarda='';
                  if(resp.observacion?.toString().includes('|')){
                    codguarda=resp.observacion.toString().split('|')[1];
                    idinsguarda=resp.observacion.toString().split('|')[0]
                  }
                  this.toaster.success(resp.mensaje, 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
                  //SwalService.success('Correcto',resp.mensaje)
                  this.arregloseleccion.push({
                    codigo:codguarda,
                    descripcion: this.descripcion.value.toUpperCase(),
                    id_unidad:this.unidad.value,
                    unidad:undsel.unidad,
                    operador:undsel.operador,
                    tipo_insumo:undsel.tipo_insumo,
                    precio: this.precio.value.toString().replace(',',''),
                    id_tipo_insumo: this.id_tipo_insumo,
                    id_insumo: idinsguarda,
                    id_indice:this.id_indice.value,
                    fuente:this.inpfuente,//condicionar
                    cantidad:0,
                    editar:0
                  });

                  //limpiar form agrega
                  this.formDataInsumo.reset({
                    descripcion: '',
                    unidad: '',
                    precio: '0.000',
                    id_tipo: this.tipoinsumo,
                    id_indice: '',
                    id_clasi: '',
                  });
                }
                else{
                  this.toaster.error(resp.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
                  //SwalService.error('Advertencia',resp.mensaje)
                }
              }
            }
            else{
              this.toaster.error('No se puede asignar la unidad de medida al tipo de insumo seleccionado.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            }
          }
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
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
    if(this.filaArrSel<this.arregloseleccion.length-1){
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
  editarceldat1(ind: any) {
      this.arregloseleccion[ind].editar = 1;
  }
  caneditarceldat1(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.arregloseleccion[ind2].cantidad)
    this.arregloseleccion[ind2].editar = 0;
    if (valor != actual) {
      this.arregloseleccion[ind2].cantidad = this.formsService.redondeo(Number(valor), this.dec_cant);
    }
  }
  presentert1(event: any, ind: any) {
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat1(this.arregloseleccion[ind].cantidad,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.arregloseleccion.length) {
        for (let i = ind + 1; i < this.arregloseleccion.length; i++) {
          event.target.blur();
          this.arregloseleccion[i].editar = 1;
          break;
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          event.target.blur();
          this.arregloseleccion[i].editar = 1;
          break;
        }
      }
    }
  }
  //tabla 3 actual
  cambindicesel3(ind:any){
    if (ind == this.fila_sel3)
      this.fila_sel3 = -1;
    else
      this.fila_sel3 = ind;
  }
  cambioselt3(row:any,indice:any){//agregar al arreglo seleccion (indice)
    if(this.reemplaza && this.arregloselact.length>0){
      let idinsant=row.id_insumo;
      for(let m=0;m<this.arregloselact.length;m++){
        idinsant=this.arregloselact[m].id_insumo;
      }
      for(let a=0;a<this.arregloact.length;a++){
        if(idinsant==this.arregloact[a].id_insumo){
          this.arregloact[a].seleccion=0;
          break;
        }
      }
      this.limpiarsel();
      this.arregloselact=[];
      /* this.limpiarsel3(); */
    }
    if(row.seleccion==0){
      row.seleccion=1;
      this.arregloact[indice].seleccion=1;
      //agrega a seleccion
      row.tabla=3;
      row.ind=indice;
      this.arregloselact.push(row);
    }
    else{
      row.seleccion=0;
      this.arregloact[indice].seleccion=0;
      //elimina de seleccion
      for(let b=0;b<this.arregloselact.length;b++){
        if(row.id_insumo==this.arregloselact[b].id_insumo){
          this.arregloselact.splice(b,1);
          break;
        }
      }
    }
  }
  limpiarsel3(){
    if(this.arregloselact.length>0){
      //this.arregloselact=[];
      for(let b=0;b<this.arregloselact.length;b++){
        if(this.arregloselact[b].tabla==3){
          this.arregloselact.splice(b,1);
          b--;
        }
      }
      for(let a=0;a<this.arregloact.length;a++){
        if(this.arregloact[a].seleccion!=2)
          this.arregloact[a].seleccion=0;
      }
    }
  }
  duplicafila3(row:any){
    //this.active=2;
    this.descripcion.setValue(row.descripcion);
    this.unidad.setValue(Number(row.id_unidad));
    this.precio.setValue(this.formsService.redondeo(row.precio,2));
    //this.id_tipo.setValue(row.id_tipo_insumo);
    this.id_indice.setValue(row.id_indice);
    this.id_clasi.setValue(row.id_clasificacion?Number(row.id_clasificacion):'');
    this.cambUnidad();
    this.tabset.select('tab2');
  }
  VeracuACt(){
    this.mostdetacu=!this.mostdetacu;
  }
  toggleOnAcact(condicion: any,indice2:any) {
    this.acuAct[indice2].icomost = 1;
    for (let i=indice2+1;i<this.acuAct.length;i++) {
      if(this.acuAct[i].id_tipo_insumo==condicion)
      {
        if(this.acuAct[i].unidad!='')
        {
          this.acuAct[i].mostrar=1;
        }
      }
      else{ break; }
    }
  }
  toggleOffAcact(condicion: any,indice2:any) {
    this.acuAct[indice2].icomost = 0;
    for (let i=indice2+1;i<this.acuAct.length;i++) {
      if(this.acuAct[i].id_tipo_insumo==condicion)
      {
        if(this.acuAct[i].unidad!='')
        {
          this.acuAct[i].mostrar=0;
        }
      }
      else{ break; }
    }
  }
}