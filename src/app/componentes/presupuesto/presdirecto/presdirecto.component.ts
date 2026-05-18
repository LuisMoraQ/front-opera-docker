import { PrincipalService } from './../../../servicios/principal.service';
import { Component, OnInit ,OnDestroy,Input,HostListener,ChangeDetectorRef,ViewChild,ViewEncapsulation, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { stringSimilarity } from "string-similarity-js";
import { ClasificacionService } from 'src/app/servicios/clasificacion.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { SignalrcustomService} from 'src/app/servicios/signalrcustom.service';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { BusqTitSubtPresuComponent } from './../busq-tit-subt-presu/busq-tit-subt-presu.component';
import { BusqPartidasPresuComponent } from './../busq-partidas-presu/busq-partidas-presu.component';
import { BuscarinsumoComponent } from '../../catalogos/catpartidas/buscarinsumo/buscarinsumo.component';
import { VariablesGlobalesService } from 'src/app/servicios/variables-globales.service';
import { BuscaaddunidadmedComponent } from '../../catalogos/unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { ModversubplecturaComponent } from '../modversubplectura/modversubplectura.component';
import { ModaladdsubpartidaComponent } from '../modaladdsubpartida/modaladdsubpartida.component';
import { RelacinsumosComponent } from '../relacinsumos/relacinsumos.component';
import * as moment from 'moment';
import { AddpartproyComponent } from '../addpartproy/addpartproy.component';
import { ModalvincpartidaComponent } from '../modalvincpartida/modalvincpartida.component';
import { ClasipartidaspresuComponent } from '../clasipartidaspresu/clasipartidaspresu.component';
import * as math from 'mathjs';
import { ModalimportaproyComponent } from '../../proyectos/principal/modalimportaproy/modalimportaproy.component';
import { ReportesComponent } from '../../proyectos/reportes/reportes.component';
import { environment } from 'src/environments/environment';

export interface rowpresu {
  id_proyecto: any;
  indice:any;
  item: string;
  descripcion: any;
  id_unidad:any;
  unidad: any;
  cantidad: any;
  precio: any;
  parcial: any;
  rendimiento: any;
  und_rendi: any;
  jornada: any;
  referencia:any;
  id_partida:any;
  advceros: any;
  tipofila: any;
  itemord:any;
  vinculo:any;
  responsable:any;
  colorvin:any;
  ed_pre:any;
  seleccion: any;
  icomost: any;
  mostrar: any;
  estmost:any;
  editar1: any;
  editar2: any;
  editar3: any;
  accion:any;//0:nada,1:insertar,2:update , 3 eliminado esta en otra tabla
  descant:any;
  asignaund:any;
  uid:any
}
export interface rowacu {//revisar parametros de esta fila
  id_proyecto: any;
  indice:any;
  id_filadetalle:any;
  id_tipo_insumo: any;
  num_det: any;
  codigo:any;
  descripcion: any;
  id_unidad:any;
  unidad:any;
  operador:any;
  tipo_insumo:any;
  cuadrilla: any;
  cantidad: any;
  precio: any;
  parcial: any;
  id_indice:any;
  id_clasificacion:any;
  id_insumo: any;
  id_subpartida: any;
  indice_subp: any;
  accion:any;
  esinsumo:any;
  afcuadrilla:any;
  rendimiento:any;
  und_rendi:any;
  jornada:any;
  advceros:any;
  referencia:any;
  desc_clasi:any;
  //afectaref:any;//no existe en tabla detalle, //0:no es subpartida, 1:agregar referencia, 2:eliminar referencia, para actualizar las referencias en bd
  icomost:any;
  mostrar:any;
  editar:any;
  editar2:any;
  ind:any
  seleccion:any;
  asignaund:any;
  zidmodi:any;
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
export interface nodoitem {
  nro:any;
  item:any;
  hijos:nodoitem[];
}
@Component({
  selector: 'app-presdirecto',
  templateUrl: './presdirecto.component.html',
  styleUrls: ['./presdirecto.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PresdirectoComponent implements OnInit,OnDestroy {
  orderacu=0;//1:ascdesc,2:descdesc,3:ascparc,4:descparc
  solover=false;
  moneda='S/';
  fuentepasa=1;
  datosproy=null;
  vincClasiRel$:Subscription=new Subscription();
  vincPart$:Subscription=new Subscription();
  @Input('height') height: number = 100;
  @Input('height') heightacu: number = 100;
  scrollbut=false;
  minimbut=false;
  minimbut2=false;
  @ViewChild('divbut', { read: ElementRef }) public divbuthtml: ElementRef<any>;
  paddingscroll = 17;
  padscrollpri = 17;
  paddingscroll2 = 17;
  preventscroll=false;
  mostrar_carga_todo=false;
  mostrar_carga=false;
  mostrarModal: boolean;
  expanded = false;
  vistagrande=true;
  edicionacu=true;
  acuxmetrado=false;
  detallepart = [];
  @ViewChild("modalDetalles") modaldetalle: ModalBasicComponent;
  arrtipoProy=[];
  id_proyecto='';
  id_user:any;
  id_userproy:any;
  tipoProy = '';
  medidas: unidadmed[] = [];
  editajor=false;
  //subpartidas
  detallepartida = null
  partida = null
  indpri = null
  arrPriSubp = [];
  tablaacu=[];
  tablaact=[];
  tablaactacu=[];
  tablaactsub=[];
  paddingscrollsbp = 17;
  paddingscroll2sbp = 17;
  active = 0
  preventscrollsbp = false;
  formTabs = new UntypedFormGroup({
    formSubPartida: new UntypedFormArray([], Validators.required)
  })
  get formSubPartida() {
    return this.formTabs.controls['formSubPartida'] as UntypedFormArray
  }
  @ViewChild("mdVerSubpart") modalSubpart: ModalBasicComponent;
  arrordenar:nodoitem[];//arr obj ordenados
  colores:any;
  decima:any;
  tabindir=[];
  filaselind=-1;
  buscandoind=false;
  mostindir=false;
  heightind=0;
  simbolo
  prueba
  @Input() set tabproyecto(value: any) {
    this.prueba=value
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = (value.get('aspectos_generales') as UntypedFormGroup)
    const datosproy = (aspectosGen.get('datos_proyecto') as UntypedFormGroup)
    const datosrec = (aspectosGen.get('datos_recuperado') as UntypedFormGroup)
    this.id_userproy=datosrec.value.id_usuario;
    this.tipoProy=datosproy.get('id_clasificacion').value;
    this.colores=value.get('aspectab').value;
    this.decima=value.get('decimal').value;
    this.solover=value.get('solover').value;
    this.moneda=datosproy.get('moneda').value.toString()=='0'?'S/':'$';
    this.simbolo=datosrec.value.simbolo
  }
  //guardar
  ultindice=-1;
  inserta=[];
  modifica=[];
  elimina=[];
  insertaacu=[];
  modificaacu=[];
  eliminaacu=[];
  /* insertasub=[];
  modificasub=[];
  eliminasub=[]; */
  //copiar y pegar
  filacopia=[];
  cortar=false;
  indselcorta=-1;
  datasourcePri=[];
  filaSel:any;
  colselpri=false;
  colselpri2=false;
  arrprisel=[];
  arrindprisel=[];
  arrpricopia=[];
  esgruposel=false;
  //costos unitarios
  datasourcePriacu=[];
  tablaacusel=[];
  filaSelacu=-1;
  colselacu=false;
  idgruselacu=null;
  //tabla con subpatidasmodificadas(1: agregar referencia, 2: eliminar referencia)
  datasourcePrisub=[];
  datasourcePrisubaux;
  tablasubsel=[];
  mcodigo=true;
  codsoloiu=false;
  aspectos:any;
  titulo1:any = '';
  titulo1color:any = '';
  titulo1letra:any = '';
  dec_metrado=4;
  mask_metrado='0.4';
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant=4;
  mask_cant='0.4';
  undconcatrendi = '';
  arractback=[];
  //arractualizar precios
  arrcambprecio=[];
  arrindacucambpre=[];
  butselprecio='3';
  existetemp=false;
  cargacomp=false;
  formDataPartida = new UntypedFormGroup({
    item:new UntypedFormControl(''),
    descripcion: new UntypedFormControl('', [Validators.required]),
    unidad: new UntypedFormControl('', [Validators.required]),
    precio: new UntypedFormControl('', [Validators.required, Validators.min(0)]),
    rendimiento: new UntypedFormControl('', []),
    undrendimiento: new UntypedFormControl('', []),
    jornada: new UntypedFormControl('', []),
    ratio: new UntypedFormControl('', []),
    id_usuario: new UntypedFormControl('', []),
  })
  get item(): UntypedFormControl { return this.formDataPartida.get('item') as UntypedFormControl }
  get descripcion(): UntypedFormControl { return this.formDataPartida.get('descripcion') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formDataPartida.get('unidad') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.formDataPartida.get('precio') as UntypedFormControl }
  get rendimiento(): UntypedFormControl { return this.formDataPartida.get('rendimiento') as UntypedFormControl }
  get undrendimiento(): UntypedFormControl { return this.formDataPartida.get('undrendimiento') as UntypedFormControl }
  get jornada(): UntypedFormControl { return this.formDataPartida.get('jornada') as UntypedFormControl }
  get ratio(): UntypedFormControl { return this.formDataPartida.get('ratio') as UntypedFormControl }
  get id_usuario(): UntypedFormControl { return this.formDataPartida.get('id_usuario') as UntypedFormControl }
  startTimer:any;//temporales
  running=false;//temporales
  tiempo=0;//temporales
  bloqtemp=false;//temporales
  timer2:any;//temporales
  initim2=false;//temporales
  worker: Worker;//temporales
  token:any;//temporales
  lineas2=false;

  constructor(
    private modalService: NgbModal,
    private toaster: ToastrService,
    private _ClasificacionService: ClasificacionService,
    private catalogosService: CatalogosService,
    private adminservice: AdministradorService,
    public formService: FormsService,
    private changeDetector: ChangeDetectorRef,
    private encriptadorService: EncriptadorService,
    private presuservice: PresupuestosService,
    private signalrservice:SignalrcustomService,
    private principalService:PrincipalService,
    private configuracionService:ConfiguracionService,
    private varGlobalesService:VariablesGlobalesService,
  ) {
    if (typeof Worker !== 'undefined') {//temporales
      this.worker = new Worker(new URL('src/app/workers/work1.worker', import.meta.url), { type: 'module' });
    }//temporales
  }
  async ngOnInit() {
    try{
      const myButton = document.getElementById('divbut');
      myButton.addEventListener('wheel', (ev) => {
        if (!ev.shiftKey) {
          ev.preventDefault();
          myButton.scrollLeft += ev.deltaY + ev.deltaX;
        }
      });
      this.mostrar_carga_todo=true;
      var resto=210;
      this.height = window.innerHeight - resto;
      resto=350
      this.heightacu = window.innerHeight - resto;
      if ((document.body.clientWidth < 768)) {
        this.mostrarModal = true
        this.vistagrande=false;
      } else {
        this.mostrarModal = false
        this.vistagrande=true;
      }
      this.token=await this.encriptadorService.recuperarlocalstory('token');//temporales
      this.id_user = await this.encriptadorService.recuperarlocalstory('idusuario');//deberia ser el id_usuario del creador del proyecto(usuarios secundarios)
      const datoaccs = await this.principalService.ConfgsAsignaUserProy({id_proyecto: this.id_proyecto,id_usuario:this.id_user});
      if(datoaccs?.length>0){
        if(datoaccs[0].presu==0){
          this.solover=true;
        }
      }
      this.solover=true;
      if(this.solover){
        this.formDataPartida.disable();
        this.edicionacu=false;
      }
      this.aspectos = JSON.parse(this.colores);
      this.pintar();
      let decimales = this.decima;
      if(decimales?.toString().includes('|')){
        let arrdec=decimales.split('|');
        this.dec_metrado=arrdec[0];
        this.mask_metrado='0.'+arrdec[0];
        this.dec_precio=arrdec[1];
        this.mask_precio='0.'+arrdec[1];
        this.dec_parcial=arrdec[2];
        this.mask_parcial='0.'+arrdec[2];
        this.dec_cant=arrdec[3];
        this.mask_cant='0.'+arrdec[3];
      }
      let res= await this.presuservice.listarTopPresupuesto({id_proyecto:this.id_proyecto});
      console.log(res)
        this.datasourcePri=res[0]
        this.datasourcePriacu=res[1];
        this.datasourcePrisub=res[2];
        this.datasourcePrisubaux=JSON.stringify(res[2]);
        let resindi=await this.presuservice.UltimoIndicePresu({id_proyecto:this.id_proyecto});
        this.ultindice=resindi[0].ultindice;
      let difer=this.solover?722:(1285+(this.cargacomp && this.datasourcePri.length==0 && !this.existetemp && !this.solover?32:0)+
        (!this.vistagrande || this.expanded?32:0));
      if ((document.body.clientWidth <= difer)) {
        this.scrollbut=true;
      }
      else{
        this.scrollbut=false;
      }
      let limmin=!this.vistagrande || this.expanded?991:1125;
      if ((document.body.clientWidth <= limmin)) {
        this.minimbut=true;
      }
      else{
        this.minimbut=false;
      }
      this.minimbut2=document.body.clientWidth <= 991?true:false;
      this.arrtipoProy = await this._ClasificacionService.ListarClasificacion({activo: '1'});//donde se usa?
      this.medidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_userproy,fuente:'',activo: 1,operador:1 })
      this.cargacomp=true;
      this.arrordenar=[];
      this.jornada.disable();
      this.ratio.disable();
      this.undrendimiento.disable();
      this.vincClasiRel$.unsubscribe();
      this.vincPart$.unsubscribe();
      this.vincClasiRel$=this.varGlobalesService.editaClasi.subscribe(data=>{//indicador que se cambio clasi comercial desde relacion de insumos, para actualizar en el principal
        if(data){//tabla,id_clasi,desc_clasi
          if(data.opcion=='1' && data.tabla){//camb clasi
            for(let rowt of data.tabla){//buscar en detalle part y subpart, comparar (id_tipo_insumo,descripcion,precio)
              for(let a=0;a<this.datasourcePriacu.length;a++){
                if(rowt.operador!='%'){
                  if(this.datasourcePriacu[a].id_tipo_insumo==rowt.id_tipo_insumo && this.datasourcePriacu[a].descripcion==rowt.descripcion && this.datasourcePriacu[a].precio==rowt.precio){
                    this.datasourcePriacu[a].id_clasificacion=data.id_clasi;
                    this.datasourcePriacu[a].desc_clasi=data.desc_clasi;
                    this.ActfilCambiosAcu(this.datasourcePriacu[a].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[a]);
                    break;
                  }
                }
                else{//porcentajes agrupa siempre, cantidad se recalcula
                  if(this.datasourcePriacu[a].id_tipo_insumo==rowt.id_tipo_insumo && this.datasourcePriacu[a].descripcion==rowt.descripcion){
                    this.datasourcePriacu[a].id_clasificacion=data.id_clasi;
                    this.datasourcePriacu[a].desc_clasi=data.desc_clasi;
                    this.ActfilCambiosAcu(this.datasourcePriacu[a].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[a]);
                    break;
                  }
                }
              }
              for(let b=0;b<this.datasourcePrisub.length;b++){
                if(rowt.operador!='%'){
                  if(this.datasourcePrisub[b].id_tipo_insumo==rowt.id_tipo_insumo && this.datasourcePrisub[b].descripcion==rowt.descripcion && this.datasourcePrisub[b].precio==rowt.precio){
                    this.datasourcePrisub[b].id_clasificacion=data.id_clasi;
                    this.datasourcePrisub[b].desc_clasi=data.desc_clasi;
                    break;
                  }
                }else{
                  if(this.datasourcePrisub[b].id_tipo_insumo==rowt.id_tipo_insumo && this.datasourcePrisub[b].descripcion==rowt.descripcion){
                    this.datasourcePrisub[b].id_clasificacion=data.id_clasi;
                    this.datasourcePrisub[b].desc_clasi=data.desc_clasi;
                    break;
                  }
                }
              }
            }
            this.actualizarTemp(50);
          }
          else if(data.opcion=='2'){//precio
            for(let a=0;a<this.datasourcePriacu.length;a++){
              if(data.tabla.operador!='%'){
                if(this.datasourcePriacu[a].id_tipo_insumo==data.tabla.id_tipo_insumo && this.datasourcePriacu[a].descripcion==data.tabla.descripcion && this.datasourcePriacu[a].precio==data.anterior){
                  var valor = Number(data.tabla.precio);
                  var acantidad = Number(this.datasourcePriacu[a].cantidad);
                  this.datasourcePriacu[a].precio=this.formService.redondeo(Number(valor), this.dec_precio);
                  let resparc=this.datasourcePriacu[a].operador=='%'?(valor*acantidad)/100:valor*acantidad;
                  this.datasourcePriacu[a].parcial=this.formService.redondeo(resparc, this.dec_precio);
                  this.ActfilCambiosAcu(this.datasourcePriacu[a].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[a]);
                  let indpart=-1;
                  for(let m=0;m<this.datasourcePri.length;m++){
                    if(this.datasourcePri[m].indice==this.datasourcePriacu[a].indice){
                      indpart=m;
                      break;
                    }
                  }
                  let arrindacu=[];
                  for(let n=0;n<this.datasourcePriacu.length;n++){
                    if(this.datasourcePriacu[n].indice==this.datasourcePriacu[a].indice){
                      arrindacu.push(n);
                    }
                  }
                  let sumasinporc=this.ActparcialNovis(this.datasourcePriacu[a].id_tipo_insumo,indpart,arrindacu)//indice partida, arreglo de indices de su acu
                  this.actinsporcsinvis(this.datasourcePriacu[a].id_tipo_insumo,sumasinporc,this.datasourcePriacu[a].operador,indpart,arrindacu);//indice partida, arreglo de indices de su acu
                  let existecer=0;
                  for(let indacu of arrindacu){
                    if(this.datasourcePriacu[indacu].unidad!='' && Number(this.datasourcePriacu[indacu].parcial)==0){
                      existecer=1;
                      break;
                    }
                  }
                  this.datasourcePri[indpart].advceros=existecer;//cambiar por la fila1 del arreglo
                  this.ActfilCambios(this.datasourcePri[indpart].accion==1?this.inserta:this.modifica,this.datasourcePri[indpart]);
                }
              }
            }
            for(let b=0;b<this.datasourcePrisub.length;b++){//subpartidas, actualizan partidas detalle y principal
              if(data.tabla.operador!='%'){
                if(this.datasourcePrisub[b].id_tipo_insumo==data.tabla.id_tipo_insumo && this.datasourcePrisub[b].descripcion==data.tabla.descripcion && this.datasourcePrisub[b].precio==data.anterior){
                  var valor = Number(data.tabla.precio);
                  var acantidad = Number(this.datasourcePrisub[b].cantidad);
                  this.datasourcePrisub[b].precio=this.formService.redondeo(Number(valor), this.dec_precio);
                  let resparc=this.datasourcePrisub[b].operador=='%'?(valor*acantidad)/100:valor*acantidad;
                  this.datasourcePrisub[b].parcial=this.formService.redondeo(resparc, this.dec_precio);
                  let indpadre=-1;
                  let arrindacu=[];
                  let nivel='s';//'s' subpartida,'a' acu
                  for(let l=0;l<this.datasourcePrisub.length;l++){
                    if(this.datasourcePrisub[l].indice_subp==this.datasourcePrisub[b].indice){
                      indpadre=l;
                      nivel='s';
                    }
                    if(this.datasourcePrisub[l].indice==this.datasourcePrisub[b].indice){
                      arrindacu.push(l);
                    }
                  }
                  if(indpadre==-1){
                    for(let o=0;o<this.datasourcePriacu.length;o++){
                      if(this.datasourcePriacu[o].indice_subp==this.datasourcePrisub[b].indice){
                        indpadre=o;
                        nivel='a';
                        break;
                      }
                    }
                  }
                  let sumasinporc=this.ActparcialSubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
                  this.actinsporcsubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,sumasinporc,this.datasourcePrisub[b].operador,arrindacu,this.datasourcePrisub,nivel);//indice partida, arreglo de indices de su acu
                  this.ActuaMontosPadre(indpadre,nivel)
                }
              }
            }
            let sumatot=0;
            for(let rowres of JSON.parse(JSON.stringify(this.datasourcePri))){
              if(rowres.unidad!=''){
                sumatot+=Number(rowres.parcial)
              }
            }
            let tabresult=this.getTablaRelInsumos(null,sumatot);
            this.varGlobalesService.updrelacinsumo.next(tabresult);
            this.cambindiceselpresu(this.filaSel,true);
            this.actualizarTemp(51);//al final de todo
          }
          else if(data.opcion=='3' && data.tabla){//vincular
            for(let filavinc of data.tabla){
              for(let a=0;a<this.datasourcePriacu.length;a++){
                if(this.datasourcePriacu[a].id_tipo_insumo==filavinc.id_tipo_insumo && this.datasourcePriacu[a].descripcion==filavinc.descripcion && 
                (filavinc.operador=='%' || (filavinc.operador!='%' && this.datasourcePriacu[a].precio==filavinc.precio))){
                  let arrindacu=[];
                  for(let n=0;n<this.datasourcePriacu.length;n++){
                    if(this.datasourcePriacu[n].indice==this.datasourcePriacu[a].indice){
                      arrindacu.push(n);
                    }
                  }
                  let exiins;//indice del nuevo insumo si existe en acu
                  for(let indacu of arrindacu){
                    if(this.datasourcePriacu[indacu].id_tipo_insumo==data.anterior.id_tipo_insumo && this.datasourcePriacu[indacu].descripcion==data.anterior.descripcion &&
                      (data.anterior.operador=='%' || (data.anterior.operador!='%' && this.datasourcePriacu[indacu].precio==data.anterior.precio))){
                        exiins=indacu;
                      }
                  }
                  let indpart=-1;
                  for(let m=0;m<this.datasourcePri.length;m++){
                    if(this.datasourcePri[m].indice==this.datasourcePriacu[a].indice){
                      indpart=m;
                      break;
                    }
                  }
                  if(exiins){
                    let tipoinssel=data.anterior.id_tipo_insumo;
                    let numdeteli=Number(this.datasourcePriacu[a].num_det);
                    for(let k=0;k<arrindacu.length;k++){//actualizar nuevos num_det
                      if(this.datasourcePriacu[arrindacu[k]].id_tipo_insumo==tipoinssel && Number(this.datasourcePriacu[arrindacu[k]].num_det)>numdeteli){
                        let newind=this.datasourcePriacu[arrindacu[k]].num_det-1;
                        this.datasourcePriacu[arrindacu[k]].num_det=newind;
                        this.ActfilCambiosAcu(this.datasourcePriacu[arrindacu[k]].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[arrindacu[k]]);
                      }
                    }
                    //eliminar insumo porque existe el vinculado princ
                    this.ActElimArrCambiosAcu(this.datasourcePriacu[a]);
                    this.datasourcePriacu.splice(a,1);//actualizar arr indices si es mayor al indice eliminado
                    this.ActIndTabacusel(a);
                    for(let m=0;m<arrindacu.length;m++){
                      if(arrindacu[m]==a){
                        arrindacu.splice(m,1);
                        m--;
                      }
                      if(arrindacu[m]>a){
                        arrindacu[m]=arrindacu[m]-1;
                      }
                    }
                    //actualizar los valores del insumo al que se agregara el vinculado
                    if(data.anterior.operador=='%'){//volver a calcular el precio y parcial
                      this.ActparcialNovis(tipoinssel,indpart,arrindacu)//indice partida, arreglo de indices de su acu
                    }
                    else{//solo calcula precio y parcial
                      let sumasinporc=this.ActparcialNovis(tipoinssel,indpart,arrindacu)//indice partida, arreglo de indices de su acu
                      this.actinsporcsinvis(tipoinssel,sumasinporc,data.anterior.operador,indpart,arrindacu);//indice partida, arreglo de indices de su acu
                    }
                    let existecer=0;
                    for(let indacu of arrindacu){
                      if(this.datasourcePriacu[indacu].unidad!='' && Number(this.datasourcePriacu[indacu].parcial)==0){
                        existecer=1;
                        break;
                      }
                    }
                    this.datasourcePri[indpart].advceros=existecer;//cambiar por la fila1 del arreglo
                    this.ActfilCambios(this.datasourcePri[indpart].accion==1?this.inserta:this.modifica,this.datasourcePri[indpart]);
                  }
                  else{
                    this.datasourcePriacu[a].codigo=data.anterior.codigo;
                    this.datasourcePriacu[a].desc_clasi=data.anterior.desc_clasi;
                    this.datasourcePriacu[a].descripcion=data.anterior.descripcion;
                    this.datasourcePriacu[a].id_clasificacion=data.anterior.id_clasificacion;
                    this.datasourcePriacu[a].id_indice=data.anterior.id_indice;
                    this.datasourcePriacu[a].id_insumo=data.anterior.id_insumo;
                    this.datasourcePriacu[a].id_unidad=data.anterior.id_unidad;
                    this.datasourcePriacu[a].operador=data.anterior.operador;
                    this.datasourcePriacu[a].tipo_insumo=data.anterior.tipo_insumo;
                    this.datasourcePriacu[a].unidad=data.anterior.unidad;
                    if(data.anterior.operador=='%'){//volver a calcular el precio y parcial
                      let parcsinporc=0;
                      for(let b=0;b<arrindacu.length;b++){//buscar el total del tipo, para operar con la fila editada
                        if(this.datasourcePriacu[arrindacu[b]].id_tipo_insumo==data.anterior.tipo_insumo && this.datasourcePriacu[arrindacu[b]].num_det>0 && this.datasourcePriacu[arrindacu[b]].operador!='%'){
                          parcsinporc+=Number(this.datasourcePriacu[arrindacu[b]].parcial);
                        }
                      }
                      var valor = Number(this.formService.redondeo(parcsinporc, this.dec_precio));
                      var acantidad = Number(this.datasourcePriacu[a].cantidad);
                      this.datasourcePriacu[a].precio=valor;
                      let resparc=/* this.datasourcePriacu[a].operador=='%'? */(valor*acantidad)/100/* :valor*acantidad */;
                      this.datasourcePriacu[a].parcial=this.formService.redondeo(resparc, this.dec_precio);
                      this.ActfilCambiosAcu(this.datasourcePriacu[a].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[a]);
                      this.ActparcialNovis(this.datasourcePriacu[a].id_tipo_insumo,indpart,arrindacu)//indice partida, arreglo de indices de su acu
                    }
                    else{//solo calcula precio y parcial
                      var valor = Number(data.anterior.precio);
                      var acantidad = Number(this.datasourcePriacu[a].cantidad);
                      this.datasourcePriacu[a].precio=this.formService.redondeo(Number(valor), this.dec_precio);
                      let resparc=/* this.datasourcePriacu[a].operador=='%'?(valor*acantidad)/100: */valor*acantidad;
                      this.datasourcePriacu[a].parcial=this.formService.redondeo(resparc, this.dec_precio);
                      this.ActfilCambiosAcu(this.datasourcePriacu[a].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[a]);
                      let sumasinporc=this.ActparcialNovis(this.datasourcePriacu[a].id_tipo_insumo,indpart,arrindacu)//indice partida, arreglo de indices de su acu
                      this.actinsporcsinvis(this.datasourcePriacu[a].id_tipo_insumo,sumasinporc,this.datasourcePriacu[a].operador,indpart,arrindacu);//indice partida, arreglo de indices de su acu
                    }
                    let existecer=0;
                    for(let indacu of arrindacu){
                      if(this.datasourcePriacu[indacu].unidad!='' && Number(this.datasourcePriacu[indacu].parcial)==0){
                        existecer=1;
                        break;
                      }
                    }
                    this.datasourcePri[indpart].advceros=existecer;//cambiar por la fila1 del arreglo
                    this.ActfilCambios(this.datasourcePri[indpart].accion==1?this.inserta:this.modifica,this.datasourcePri[indpart]);
                  }
                }
              }
              for(let b=0;b<this.datasourcePrisub.length;b++){//subpartidas, actualizan partidas detalle y principal
                //subpartidas no afectan al porcentaje, solo el insumo modificado al actual subp, sus predesesores no cambia mucho(solo cambiar precio y actualizar totales, no cambia porcentajes)
                if(this.datasourcePrisub[b].id_tipo_insumo==filavinc.id_tipo_insumo && this.datasourcePrisub[b].descripcion==filavinc.descripcion && 
                    (filavinc.operador=='%' || (filavinc.operador!='%' && this.datasourcePrisub[b].precio==filavinc.precio))){
                  let indpadre=-1;
                  let arrindacu=[];
                  let nivel='s';//'s' subpartida,'a' acu
                  for(let l=0;l<this.datasourcePrisub.length;l++){
                    if(this.datasourcePrisub[l].indice_subp==this.datasourcePrisub[b].indice){
                      indpadre=l;
                      nivel='s';
                    }
                    if(this.datasourcePrisub[l].indice==this.datasourcePrisub[b].indice){
                      arrindacu.push(l);
                    }
                  }
                  let exiins;//indice del nuevo insumo si existe en acu
                  for(let indacu of arrindacu){
                    if(this.datasourcePrisub[indacu].id_tipo_insumo==data.anterior.id_tipo_insumo && this.datasourcePrisub[indacu].descripcion==data.anterior.descripcion &&
                      (data.anterior.operador=='%' || (data.anterior.operador!='%' && this.datasourcePrisub[indacu].precio==data.anterior.precio))){
                        exiins=indacu;
                      }
                  }
                  if(indpadre==-1){
                    for(let o=0;o<this.datasourcePriacu.length;o++){
                      if(this.datasourcePriacu[o].indice_subp==this.datasourcePrisub[b].indice){
                        indpadre=o;
                        nivel='a';
                        break;
                      }
                    }
                  }
                  if(exiins){
                    let tipoinssel=data.anterior.id_tipo_insumo;
                    let numdeteli=Number(this.datasourcePrisub[b].num_det);
                    for(let k=0;k<arrindacu.length;k++){//actualizar nuevos num_det
                      if(this.datasourcePrisub[arrindacu[k]].id_tipo_insumo==tipoinssel && Number(this.datasourcePrisub[arrindacu[k]].num_det)>numdeteli){
                        let newind=this.datasourcePrisub[arrindacu[k]].num_det-1;
                        this.datasourcePrisub[arrindacu[k]].num_det=newind;
                      }
                    }
                    //aliminar insumo porque existe el vinculado princ
                    this.ActElimArrCambiosAcu(this.datasourcePrisub[b]);
                    this.datasourcePrisub.splice(b,1);//actualizar arr indices si es mayor al indice eliminado
                    for(let m=0;m<arrindacu.length;m++){
                      if(arrindacu[m]==b){
                        arrindacu.splice(m,1);
                        m--;
                      }
                      if(arrindacu[m]>b){
                        arrindacu[m]=arrindacu[m]-1;
                      }
                    }
                    //actualizar los valores del insumo al que se agregara el vinculado
                    if(data.anterior.operador=='%'){//volver a calcular el precio y parcial
                      this.ActparcialSubp(tipoinssel,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
                    }
                    else{//solo calcula precio y parcial
                      let sumasinporc=this.ActparcialSubp(tipoinssel,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
                      this.actinsporcsubp(tipoinssel,indpadre,sumasinporc,data.anterior.operador,arrindacu,this.datasourcePrisub,nivel);//indice partida, arreglo de indices de su acu
                    }
                  }
                  else{
                    this.datasourcePrisub[b].codigo=data.anterior.codigo;
                    this.datasourcePrisub[b].desc_clasi=data.anterior.desc_clasi;
                    this.datasourcePrisub[b].descripcion=data.anterior.descripcion;
                    this.datasourcePrisub[b].id_clasificacion=data.anterior.id_clasificacion;
                    this.datasourcePrisub[b].id_indice=data.anterior.id_indice;
                    this.datasourcePrisub[b].id_insumo=data.anterior.id_insumo;
                    this.datasourcePrisub[b].id_unidad=data.anterior.id_unidad;
                    this.datasourcePrisub[b].operador=data.anterior.operador;
                    this.datasourcePrisub[b].tipo_insumo=data.anterior.tipo_insumo;
                    this.datasourcePrisub[b].unidad=data.anterior.unidad;
                    if(data.anterior.operador=='%'){//volver a calcular el precio y parcial
                      let parcsinporc=0;
                      for(let c=0;c<arrindacu.length;c++){//buscar el total del tipo, para operar con la fila editada)
                        if(this.datasourcePrisub[arrindacu[c]].id_tipo_insumo==data.anterior.tipo_insumo && Number(this.datasourcePrisub[arrindacu[c]].num_det)>0 && this.datasourcePrisub[arrindacu[c]].operador!='%'){
                          parcsinporc+=Number(this.datasourcePrisub[arrindacu[c]].parcial);
                        }
                      }
                      var valor = Number(this.formService.redondeo(parcsinporc, this.dec_precio));
                      var acantidad = Number(this.datasourcePrisub[b].cantidad)//Number(data.anterior.cantidad);
                      this.datasourcePrisub[b].precio=valor;
                      let resparc=/* this.datasourcePrisub[b].operador=='%'? */(valor*acantidad)/100/* :valor*acantidad */;
                      this.datasourcePrisub[b].parcial=this.formService.redondeo(resparc, this.dec_precio);
                      this.ActparcialSubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
                    }
                    else{//solo calcula precio y parcial
                      var valor = Number(data.anterior.precio);
                      var acantidad = Number(this.datasourcePrisub[b].cantidad);
                      this.datasourcePrisub[b].precio=this.formService.redondeo(Number(valor), this.dec_precio);
                      let resparc=/* this.datasourcePrisub[b].operador=='%'?(valor*acantidad)/100: */valor*acantidad;
                      this.datasourcePrisub[b].parcial=this.formService.redondeo(resparc, this.dec_precio);
                      let sumasinporc=this.ActparcialSubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
                      this.actinsporcsubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,sumasinporc,this.datasourcePrisub[b].operador,arrindacu,this.datasourcePrisub,nivel);//indice partida, arreglo de indices de su acu
                    }
                  }
                  this.ActuaMontosPadre(indpadre,nivel)
                }
              }
            }let sumatot=0;
            for(let rowres of JSON.parse(JSON.stringify(this.datasourcePri))){
              if(rowres.unidad!=''){
                sumatot+=Number(rowres.parcial)
              }
            }
            let tabresult=this.getTablaRelInsumos(null,sumatot);
            this.varGlobalesService.updrelacinsumo.next(tabresult);
            this.cambindiceselpresu(this.filaSel,true);
            this.actualizarTemp(52);//al final de todo
          }
          else if(data.opcion=='4'){//reemplazar
            for(let a=0;a<this.datasourcePriacu.length;a++){
              if(this.datasourcePriacu[a].id_tipo_insumo==data.anterior.id_tipo_insumo && this.datasourcePriacu[a].descripcion==data.anterior.descripcion && 
              (data.anterior.operador=='%' || (data.anterior.operador!='%' && this.datasourcePriacu[a].precio==data.anterior.precio))){
                this.datasourcePriacu[a].codigo=data.tabla.codigo;
                this.datasourcePriacu[a].descripcion= data.tabla.descripcion;
                this.datasourcePriacu[a].id_unidad=data.tabla.id_unidad;
                this.datasourcePriacu[a].unidad= data.tabla.unidad;
                this.datasourcePriacu[a].id_tipo_insumo= data.tabla.id_tipo_insumo;
                this.datasourcePriacu[a].id_insumo= data.tabla.id_insumo;
                this.datasourcePriacu[a].id_indice= data.tabla.id_indice;
                this.datasourcePriacu[a].id_clasificacion=data.tabla.id_clasificacion;//revisar valores
                this.datasourcePriacu[a].desc_clasi=data.tabla.id_clasificacion?data.tabla.desc_clasi:null;
                this.datasourcePriacu[a].advceros=data.tabla.advceros;
                this.datasourcePriacu[a].referencia=data.tabla.referencia;
                this.ActfilCambiosAcu(this.datasourcePriacu[a].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[a]);
              }
            }
            for(let b=0;b<this.datasourcePrisub.length;b++){//subpartidas, actualizan partidas detalle y principal
              if(this.datasourcePrisub[b].id_tipo_insumo==data.anterior.id_tipo_insumo && this.datasourcePrisub[b].descripcion==data.anterior.descripcion && 
              (data.anterior.operador=='%' || (data.anterior.operador!='%' && this.datasourcePrisub[b].precio==data.anterior.precio))){
                this.datasourcePrisub[b].codigo=data.tabla.codigo;
                this.datasourcePrisub[b].descripcion= data.tabla.descripcion;
                this.datasourcePrisub[b].id_unidad=data.tabla.id_unidad;
                this.datasourcePrisub[b].unidad= data.tabla.unidad;
                this.datasourcePrisub[b].id_tipo_insumo= data.tabla.id_tipo_insumo;
                this.datasourcePrisub[b].id_insumo= data.tabla.id_insumo;
                this.datasourcePrisub[b].id_indice= data.tabla.id_indice;
                this.datasourcePrisub[b].id_clasificacion=data.tabla.id_clasificacion;//revisar valores
                this.datasourcePrisub[b].desc_clasi=data.tabla.id_clasificacion?data.tabla.desc_clasi:null;
                this.datasourcePrisub[b].advceros=data.tabla.advceros;
                this.datasourcePrisub[b].referencia=data.tabla.referencia;
              }
            }
            this.cambindiceselpresu(this.filaSel,true);
            this.actualizarTemp(51);
          }
          else if(data.opcion=='5'){//camb unidad
            for(let a=0;a<this.datasourcePriacu.length;a++){
              if(data.anterior.operador!='%'){
                if(this.datasourcePriacu[a].id_tipo_insumo==data.anterior.id_tipo_insumo && this.datasourcePriacu[a].descripcion==data.anterior.descripcion && this.datasourcePriacu[a].precio==data.anterior.precio){
                  this.datasourcePriacu[a].id_unidad=data.anterior.id_unidad;
                  this.datasourcePriacu[a].unidad=data.anterior.unidad;
                  this.ActfilCambiosAcu(this.datasourcePriacu[a].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[a]);
                }
              }
              else{//porcentajes agrupa siempre, cantidad se recalcula
                if(this.datasourcePriacu[a].id_tipo_insumo==data.anterior.id_tipo_insumo && this.datasourcePriacu[a].descripcion==data.anterior.descripcion){
                  this.datasourcePriacu[a].id_unidad=data.anterior.id_unidad;
                  this.datasourcePriacu[a].unidad=data.anterior.unidad;
                  this.ActfilCambiosAcu(this.datasourcePriacu[a].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[a]);
                }
              }
            }
            for(let b=0;b<this.datasourcePrisub.length;b++){
              if(data.anterior.operador!='%'){
                if(this.datasourcePrisub[b].id_tipo_insumo==data.anterior.id_tipo_insumo && this.datasourcePrisub[b].descripcion==data.anterior.descripcion && this.datasourcePrisub[b].precio==data.anterior.precio){
                  this.datasourcePrisub[b].id_unidad=data.anterior.id_unidad;
                  this.datasourcePrisub[b].unidad=data.anterior.unidad;
                }
              }else{
                if(this.datasourcePrisub[b].id_tipo_insumo==data.anterior.id_tipo_insumo && this.datasourcePrisub[b].descripcion==data.anterior.descripcion){
                  this.datasourcePrisub[b].id_unidad=data.anterior.id_unidad;
                  this.datasourcePrisub[b].unidad=data.anterior.unidad;
                }
              }
            }
            this.actualizarTemp(50);
          }
        }
        // console.log('termina edita relinsumo')
      });
      this.vincPart$=this.varGlobalesService.vincPart.subscribe(dataret=>{//indicador que se guardo un elemento en el modal de subpartida, para actualizar en el principal
        if(dataret && this.filaSel){
          let numporc=Number(dataret.numporc)/100;
          let rowsel=this.datasourcePri[this.filaSel];
          let data=JSON.parse(JSON.stringify(this.datasourcePri));
          let filtered = [];
          let arrind=[];
          let padre='';
          for (let i=data.length-1;i>=0;i--) {
            if(rowsel.vinculo && rowsel.vinculo==data[i].vinculo){
              let parece=stringSimilarity(data[i].descripcion, rowsel.descripcion);//usar para comparar parecidos
              data[i].seleccion=1;
              data[i].porc=this.formService.redondeo(parece*100,2);
              data[i].verbloq=1;
              filtered.push(data[i]);
              arrind.push(i);
              padre=data[i].item.substring(0,data[i].item.lastIndexOf('.'));
            }
            else{
              let parece=stringSimilarity(data[i].descripcion, rowsel.descripcion);//usar para comparar parecidos
              if (parece>=numporc && data[i].unidad!='') {
                if(data[i].unidad!='' && data[i].vinculo!=null){
                  data[i].seleccion=2;
                  if(rowsel.vinculo && data[i].vinculo==rowsel.vinculo){
                    data[i].seleccion=1;
                  }
                }
                else{
                  data[i].seleccion=rowsel.indice==data[i].indice?1:0;
                }
                data[i].porc=this.formService.redondeo(parece*100,2);
                data[i].verbloq=1;
                filtered.push(data[i]);
                arrind.push(i);
                padre=data[i].item.substring(0,data[i].item.lastIndexOf('.'));
              }
            }
            if(padre==data[i].item){
              if(data[i].unidad!='' && data[i].vinculo!=null){
                data[i].seleccion=2;
              }
              filtered.push(data[i]);
              arrind.push(i);
              padre=data[i].item.split('.').length>1?data[i].item.substring(0,data[i].item.lastIndexOf('.')):'';
            }
          }
          let tablapasa=filtered.reverse();
          let arrindpasa=arrind.reverse();
          let objpasa={
            tabla:tablapasa,
            arrind:arrindpasa
          };
          this.varGlobalesService.updvincPart.next(objpasa);
        }
      });
      this.mostrar_carga_todo=false;
    }
    catch(e){
      this.mostrar_carga_todo=false;
      console.log(e);
      this.toaster.error('La información no cargo correctamente. Actualizar la pestaña.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  ngOnDestroy(): void {//temporales
    clearInterval(this.startTimer);
    clearInterval(this.timer2);
    if(this.token){//crear otro metodo pasando token
      if((this.running && !this.bloqtemp) || this.initim2){
        this.GuardTemp(this.id_proyecto,this.id_user,this.ultindice,this.datasourcePri,this.datasourcePriacu,this.datasourcePrisub,this.inserta,this.modifica,this.elimina,this.insertaacu,this.modificaacu,this.eliminaacu);
      }
    }//temporales
    //this.varGlobalesService.editaClasi.next(null);
    this.vincClasiRel$.unsubscribe();
    //this.varGlobalesService.updvincPart.next(null);
    this.vincPart$.unsubscribe();
  }
  ActuaMontosPadre(ind_fila:any,nivel:any){
    if(nivel=='a'){
      let indpadre=-1;
      let arrindacu=[];
      for(let a=0;a<this.datasourcePriacu.length;a++){
        if(this.datasourcePriacu[a].indice==this.datasourcePriacu[ind_fila].indice){
          arrindacu.push(a);
        }
      }
      for(let b=0;b<this.datasourcePri.length;b++){
        if(this.datasourcePri[b].indice==this.datasourcePriacu[ind_fila].indice){
          indpadre=b;
          break;
        }
      }
      this.ActparcialSubp(this.datasourcePriacu[ind_fila].id_tipo_insumo,indpadre,arrindacu,this.datasourcePriacu,'p')//indice partida, arreglo de indices de su acu
    }
    else{
      let npadre=-1;
      let nnivel='s';
      let arrindacu=[];
      for(let l=0;l<this.datasourcePrisub.length;l++){
        if(this.datasourcePrisub[l].indice_subp==this.datasourcePrisub[ind_fila].indice){//en ambos existe en indice, comparar con algo mas?
          npadre=l;
        }
        if(this.datasourcePrisub[l].indice==this.datasourcePrisub[ind_fila].indice){
          arrindacu.push(l);
        }
      }
      if(npadre==-1){
        for(let o=0;o<this.datasourcePriacu.length;o++){
          if(this.datasourcePriacu[o].indice_subp==this.datasourcePrisub[ind_fila].indice){
            npadre=o;
            nnivel='a';
            break;
          }
        }
      }
      this.ActparcialSubp(this.datasourcePrisub[ind_fila].id_tipo_insumo,npadre,arrindacu,this.datasourcePrisub,nnivel)//indice partida, arreglo de indices de su acu
      this.ActuaMontosPadre(npadre,nnivel)
    }
  }
  ActparcialSubp(idtipo: any,indpadre:any,arracu:any,arregloedita:any,nivel:any) {//indpartida,arreglo indices de acu(filtrado),Nivel es del padre
    let suma = 0;
    let sumasinporc=0;
    let sumatot=0;
    let existecer=0;
    for(let a=0;a<arracu.length;a++){
      if (arregloedita[arracu[a]].id_tipo_insumo == idtipo && arregloedita[arracu[a]].unidad != '') {
        suma += Number(arregloedita[arracu[a]].parcial);
        sumatot += Number(arregloedita[arracu[a]].parcial);
        if(arregloedita[arracu[a]].operador==null){
          sumasinporc+=Number(arregloedita[arracu[a]].parcial);
        }
      }
      if (arregloedita[arracu[a]].id_tipo_insumo != idtipo && arregloedita[arracu[a]].unidad != '') {
        sumatot += Number(arregloedita[arracu[a]].parcial);
      }
      if(arregloedita[arracu[a]].unidad!='' && Number(arregloedita[arracu[a]].parcial)==0){
        existecer=1;
      }
    }
    if(nivel=='a'){//el padre es acu
      var cantidad = Number(this.datasourcePriacu[indpadre].cantidad)
      this.datasourcePriacu[indpadre].precio=Number(this.formService.redondeo(sumatot, this.dec_precio));
      this.datasourcePriacu[indpadre].parcial=Number(this.formService.redondeo((cantidad * sumatot), this.dec_precio));
      this.datasourcePriacu[indpadre].advceros=existecer;
      this.ActfilCambiosAcu(this.datasourcePriacu[indpadre].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[indpadre]);
    }
    else if(nivel=='p'){//padre es partida
      var cantidad = Number(this.datasourcePri[indpadre].cantidad)
      this.datasourcePri[indpadre].precio=Number(this.formService.redondeo(sumatot, this.dec_precio));
      this.datasourcePri[indpadre].parcial=Number(this.formService.redondeo((cantidad * sumatot), this.dec_parcial));
      this.datasourcePri[indpadre].advceros=existecer;
      this.ActfilCambios(this.datasourcePri[indpadre].accion==1?this.inserta:this.modifica,this.datasourcePri[indpadre]);
      this.calculartotalpadres(indpadre);
    }
    else{
      var cantidad = Number(this.datasourcePrisub[indpadre].cantidad)
      this.datasourcePrisub[indpadre].precio=Number(this.formService.redondeo(sumatot, this.dec_precio));
      this.datasourcePrisub[indpadre].parcial=Number(this.formService.redondeo((cantidad * sumatot), this.dec_precio));
    }
    return sumasinporc;
  }
  actinsporcsubp(id_tipo_ins:any,indpadre:any,parcialsinporc:any,operador:any,arracu:any,arregloedita:any,nivel:any){
    //2 casos, actualizar acu padre, subpartida padre
    if(operador==null){
      for(let a=0;a<arracu.length;a++){
        if(arregloedita[arracu[a]].operador=="%" && arregloedita[arracu[a]].tipo_insumo==id_tipo_ins){
          let cant=Number(arregloedita[arracu[a]].cantidad);
          let newparc=(parcialsinporc*cant)/100;
          arregloedita[arracu[a]].precio=this.formService.redondeo(parcialsinporc, this.dec_precio);
          arregloedita[arracu[a]].parcial=this.formService.redondeo(newparc, this.dec_precio);
          if(nivel=='p'){//padre es partida => arractual es acu
            this.ActfilCambiosAcu(arregloedita[arracu[a]].accion==1?this.insertaacu:this.modificaacu,arregloedita[arracu[a]]);
          }
          this.ActparcialSubp(arregloedita[arracu[a]].id_tipo_insumo,indpadre,arracu,arregloedita,nivel);
        }
      }
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto=210;
    this.height = window.innerHeight - resto-(this.mostindir?180:0);
    var resto=350;
    this.heightacu = window.innerHeight - resto;
    if ((document.body.clientWidth < 768)) {
      this.vistagrande=false;
      this.mostrarModal = true;
    } else {
      this.mostrarModal = false;
      this.vistagrande=true;
      if(!this.expanded){
        this.cerrarModal()
      }
    }
    let difer=this.solover?722:(1285+(this.cargacomp && this.datasourcePri.length==0 && !this.existetemp && !this.solover?32:0)+
    (!this.vistagrande || this.expanded?32:0));
    if ((document.body.clientWidth <= difer)) {
      this.scrollbut=true;
    }
    else{
      this.scrollbut=false;
    }
    let limmin=!this.vistagrande || this.expanded?991:1125;
    if ((document.body.clientWidth <= limmin)) {
      this.minimbut=true;
    }
    else{
      this.minimbut=false;
    }
    this.minimbut2=document.body.clientWidth <= 991?true:false;
  }
  leftDivBut(){
    var face1 = document.getElementById('divbut');
    face1.scrollLeft+=15;
  }
  rigthDivBut(){
    var face1 = document.getElementById('divbut');
    face1.scrollLeft-=15;
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    var element2 = document.getElementById('Tabpresu');
    var element = document.getElementById('tableBody');
    if (element2 != undefined) {
      let sizeef3 = element2.offsetWidth - element2.clientWidth;
      if (this.padscrollpri != sizeef3) {
        this.padscrollpri = sizeef3;
      }
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll != sizeef) {
        this.paddingscroll = sizeef;
      }
      let sizeef2 = element.offsetHeight - element.clientHeight;
      if (this.paddingscroll2 != sizeef2) {
        this.paddingscroll2 = sizeef2;
      }
    }
    var element = document.getElementById('tableBodysubp');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscrollsbp != sizeef) {
        this.paddingscrollsbp = sizeef;
      }
      let sizeef2 = element.offsetHeight - element.clientHeight;
      if (this.paddingscroll2sbp != sizeef2) {
        this.paddingscroll2sbp = sizeef2;
      }
    }
  }
  SyncScroll() {
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBody");
      var face3 = document.getElementById("tableFoot");
      face3.scrollLeft = face2.scrollLeft;
    }
    catch(ex){}
  }
  SyncScroll2() {
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBody");
      var face3 = document.getElementById("tableFoot");
      face2.scrollLeft = face3.scrollLeft;
    }catch(ex){}
  }
  pintar(){
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  sigitem(itemant:string)
  {
    let arrauxagru = itemant.split('.');
    arrauxagru[arrauxagru.length-1]=(Number(arrauxagru[arrauxagru.length-1])+1).toString();
    return arrauxagru.join('.');
  }
  antitem(itemant:string)
  {
    let arrauxagru = itemant.split('.');
    arrauxagru[arrauxagru.length-1]=(Number(arrauxagru[arrauxagru.length-1])-1).toString();
    return arrauxagru.join('.');
  }
  GenerarItemord(item:string)
  {
    let itemord = '';
    let arrit = item.split('.');
    for(let i = 0; i < arrit.length; i++)
    {
      itemord = i == arrit.length - 1 ? itemord + arrit[i].padStart((2 * arrit[i].length) - 1, '_') : itemord + arrit[i].padStart((2 * arrit[i].length) - 1, '_') + ".";
    }
    return itemord;
  }
  start(){//temporales
    try{
      if(!this.running){
        this.running=true;
        this.startTimer=setInterval(async ()=>{
          this.tiempo++;
          if(this.tiempo==5){
            //temporales
            this.GuardTemp(this.id_proyecto,this.id_user,this.ultindice,this.datasourcePri,this.datasourcePriacu,this.datasourcePrisub,this.inserta,this.modifica,this.elimina,this.insertaacu,this.modificaacu,this.eliminaacu);
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
  async GuardTemp(idproy:any,iduser:any,ultind:any,tab1:any,tab2:any,tab3:any,tab4:any,tab5:any,tab6:any,tab7:any,tab8:any,tab9:any){//temporales
    this.bloqtemp=true;
    let texto1='[]';
    let texto2='[]';
    let texto3='[]';
    let texto4='[]';
    let texto5='[]';
    let texto6='[]';
    let texto7='[]';
    let texto8='[]';
    let texto9='[]';
    await this.compressTextAsync(JSON.stringify(tab1)).then(compressedText => {
      texto1=compressedText;
    }).catch(error => {
      console.error('Error en la compresión:', error);
    });
    await this.compressTextAsync(JSON.stringify(tab2)).then(compressedText => {
      texto2=compressedText;
    }).catch(error => {
      console.error('Error en la compresión:', error);
    });
    await this.compressTextAsync(JSON.stringify(tab3)).then(compressedText => {
      texto3=compressedText;
    }).catch(error => {
      console.error('Error en la compresión:', error);
    });
    await this.compressTextAsync(JSON.stringify(tab4)).then(compressedText => {
      texto4=compressedText;
    }).catch(error => {
      console.error('Error en la compresión:', error);
    });
    await this.compressTextAsync(JSON.stringify(tab5)).then(compressedText => {
      texto5=compressedText;
    }).catch(error => {
      console.error('Error en la compresión:', error);
    });
    await this.compressTextAsync(JSON.stringify(tab6)).then(compressedText => {
      texto6=compressedText;
    }).catch(error => {
      console.error('Error en la compresión:', error);
    });
    await this.compressTextAsync(JSON.stringify(tab7)).then(compressedText => {
      texto7=compressedText;
    }).catch(error => {
      console.error('Error en la compresión:', error);
    });
    await this.compressTextAsync(JSON.stringify(tab8)).then(compressedText => {
      texto8=compressedText;
    }).catch(error => {
      console.error('Error en la compresión:', error);
    });
    await this.compressTextAsync(JSON.stringify(tab9)).then(compressedText => {
      texto9=compressedText;
    }).catch(error => {
      console.error('Error en la compresión:', error);
    });
    let formData: FormData = new FormData();
    formData.append('id_proyecto', idproy);
    formData.append('id_usuario', iduser);
    formData.append('ultindice', ultind);
    formData.append('tablapri', texto1);
    formData.append('tablapriacu', texto2);
    formData.append('tablaprisubp', texto3);
    formData.append('inserta', texto4);
    formData.append('modifica', texto5);
    formData.append('elimina', texto6);
    formData.append('insertaacu', texto7);
    formData.append('modificaacu', texto8);
    formData.append('eliminaacu', texto9);
    fetch(environment.apiUrl+'/api/presupuesto/guardarPresuTemp', {
      method: 'POST',
      body: formData,
      headers:{'Authorization':'Bearer ' +JSON.parse(this.token)}
    })
    .then((response) => {
      return response;
    })
    .then((data) => {
      this.bloqtemp=false;
      this.stop();
    })
    .catch((error) => {
      this.bloqtemp=false;
      console.error('Error:', error);
      this.stop();
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
  actualizarTemp(ind){
    if(this.bloqtemp && !this.initim2){//temporales
      this.initim2=true;
      this.start2();
    }
    else if(this.tiempo<5){
      this.restart();
    }//temporales
    this.existetemp=true;
    this.RecalculaIndir();
  }
  async listarPresupuesto(){
    let res= await this.presuservice.listarTopPresupuesto({id_proyecto:this.id_proyecto});
    this.datasourcePri=res[0];
    this.datasourcePriacu=res[1];
    this.datasourcePrisub=res[2];
    this.datasourcePrisubaux=JSON.stringify(res[2]);
    this.ultindice=res[3][0].ultindice;
  }
  RestauraDesc(){
    if(this.filaSel>-1){
      if(this.datasourcePri[this.filaSel].descripcion!=this.datasourcePri[this.filaSel].descant){
        this.datasourcePri[this.filaSel].descripcion=this.datasourcePri[this.filaSel].descant;
        this.datasourcePri[this.filaSel].vinculo=null;
        this.descripcion.setValue(this.datasourcePri[this.filaSel].descant);
        this.ActfilCambios(this.datasourcePri[this.filaSel].accion==1?this.inserta:this.modifica,this.datasourcePri[this.filaSel]);
        this.actualizarTemp(32);
      }
    }
    else{
      this.toaster.error('Seleccione una fila para restaurar descripcion.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async OpenmodalAddTitulo() {
    try {
      let rpartidas = await this.catalogosService.ListarTitsubPartidas({ id_usuario: this.id_userproy,fuente:'0',tipo_proy:this.tipoProy });//cambiar dinamico tipo_proy
      let opcfilasel=this.filaSel>-1?(this.datasourcePri[this.filaSel].tipofila=="0"?true:false):false;
      const modalRef = this.modalService.open(BusqTitSubtPresuComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
      modalRef.componentInstance.partidas = rpartidas;
      modalRef.componentInstance.tipoProy = this.arrtipoProy;//cambiar por el arreglo de tipos de proyecto
      modalRef.componentInstance.estitulo=true;
      modalRef.componentInstance.opcfila=opcfilasel;
      modalRef.componentInstance.fondo=this.titulo1;
      modalRef.componentInstance.color=this.titulo1color;
      modalRef.componentInstance.letra=this.titulo1letra;
      modalRef.componentInstance.tipoproypasa=this.tipoProy;
      modalRef.componentInstance.iduser=this.id_userproy;
      const result = await modalRef.result
      if (result) {
        let itemsel="NULL";
        let itemini='';
        let indins=-1;
        if(result.forma=="1"){
          itemini='1';
          indins=0;
          for(let i=0;i<this.datasourcePri.length;i++){
            let separado = this.datasourcePri[i].item.toString().split('.');
            let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
            let nuevonum = Number(separado[longi - 1]) + result.datos.length;
            separado[longi - 1] = nuevonum.toString();
            this.datasourcePri[i].item=separado.join('.');
            this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
            //this.filaSel=this.filaSel+result.datos.length;
            this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
          }
        }
        else if(result.forma=="0"){
          if(this.datasourcePri.length>0){
            let ultit=this.datasourcePri[this.datasourcePri.length-1].item.split('.');
            let numult=Number(ultit[0]);
            itemini=(numult+1).toString();
            indins=this.datasourcePri.length;//hacer push al final
          }
          else{
            itemini='1';
            indins=0;
          }
        }
        else if(result.forma=="2" || result.forma=="3"){
          itemsel=this.filaSel>-1?this.datasourcePri[this.filaSel].item:"NULL";
          itemini=result.forma=='3'?this.sigitem(itemsel):itemsel;//buscar el item inicial para agregar
          let indpri=this.filaSel;
          let enco=false;
          //this.filaSel=result.forma=='2'?this.filaSel+result.datos.length:this.filaSel;
          if(itemsel.split('.').length==1){
            for(let i=indpri;i<this.datasourcePri.length;i++){
              var prefijo = this.datasourcePri[i].item.toString().substring(0, itemsel.length+1)
              if((result.forma=='3' && (this.datasourcePri[i].item != itemsel && prefijo!=(itemsel+'.'))) || result.forma=='2'){
                if(!enco){
                  indins=i;
                  enco=true;
                }
                let separado = this.datasourcePri[i].item.toString().split('.');
                let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                let nuevonum = Number(separado[longi - 1]) + result.datos.length;
                separado[longi - 1] = nuevonum.toString();
                this.datasourcePri[i].item=separado.join('.');
                this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
              }
            }
          }
          if(indins==-1){ indins=this.datasourcePri.length; }
        }
        let indini=indins;
        for(let filaadd of result.datos){
          let filaagrega=this.nuevafilapri(this.ultindice++,itemini,filaadd.descripcion,'','',null,null,0,null,'',null,null,filaadd.id_partida,0,0,1,1,this.id_userproy,filaadd.descripcion);
          itemini=this.sigitem(itemini);
          this.datasourcePri.splice(indins++,0,filaagrega);
          this.inserta.push(filaagrega);
        }
        this.cambindiceselpresu(indini);
        this.actualizarTemp(2);
      }
    }
    catch (e) {
      console.log(e)
    }
  }
  async OpenmodalAddsubTitulo() {
    try {
      if (this.filaSel >= 0) {
        let rpartidas = await this.catalogosService.ListarTitsubPartidas({ id_usuario: this.id_userproy,fuente:'0',tipo_proy:this.tipoProy });//cambiar dinamico tipo_proy
        let opcfilasel=this.filaSel>-1?(this.datasourcePri[this.filaSel].tipofila!="0"?true:false):false;
        const modalRef = this.modalService.open(BusqTitSubtPresuComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
        modalRef.componentInstance.partidas = rpartidas;
        modalRef.componentInstance.tipoProy = this.arrtipoProy;//cambiar por el arreglo de tipos de proyecto
        modalRef.componentInstance.estitulo=false;
        modalRef.componentInstance.opcfila=opcfilasel;
        modalRef.componentInstance.fondo=this.titulo1;
        modalRef.componentInstance.color=this.titulo1color;
        modalRef.componentInstance.letra=this.titulo1letra;
        modalRef.componentInstance.tipoproypasa=this.tipoProy;
        modalRef.componentInstance.iduser=this.id_userproy;
        const result = await modalRef.result
        if (result) {
          let itemsel=this.filaSel>-1?this.datasourcePri[this.filaSel].item:"NULL";
          let itemini='';
          let indins=-1;
          if(result.forma=="1"){//inicio
            itemini=itemsel+".1";
            indins=this.filaSel+1;
            for(let i=indins;i<this.datasourcePri.length;i++){
              var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
              if (palabra == itemsel) {
                let separado = this.datasourcePri[i].item.toString().split('.');
                let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                let nuevonum = Number(separado[longi]) + result.datos.length;
                separado[longi] = nuevonum.toString();
                let nuevoagr = separado.join('.');
                let nord = this.GenerarItemord(nuevoagr);
                this.datasourcePri[i].item=nuevoagr;
                this.datasourcePri[i].itemord=nord;
                this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
              }//desde la fila seleccionada
              else{
                break;
              }
            }
          }
          else if(result.forma=="0"){//fin
            for(let i=this.filaSel+1;i<this.datasourcePri.length;i++){
              var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
              if (palabra != itemsel) {
                if(i-1==this.filaSel){
                  itemini=itemsel+".1";
                }
                else{
                  let itemfiant=this.datasourcePri[i-1].item.split('.');
                  let nuevit='';
                  for(let b=0;b<itemsel.split('.').length+1;b++){
                    nuevit+=itemfiant[b]+'.';
                  }
                  itemini=this.sigitem(nuevit.substring(0,nuevit.length-1));
                }
                indins=i;
                break;
              }
            }
            if(indins==-1){
              let ultit=this.datasourcePri[this.datasourcePri.length-1].item;
              if(ultit==itemsel){
                itemini=itemsel+".1";
              }
              else{
                let arrultit=ultit.split('.');
                let auxite='';
                for(let b=0;b<itemsel.split('.').length+1;b++){
                  auxite+=arrultit[b]+'.';
                }
                itemini+=this.sigitem(auxite.substring(0,auxite.length-1));
              }
              indins=this.datasourcePri.length;
            }
          }
          else if(result.forma=="2" || result.forma=="3"){
            itemini=result.forma=='3'?this.sigitem(itemsel):itemsel;//buscar el item inicial para agregar
            let indpri=this.filaSel;
            let enco=false;
            //this.filaSel=result.forma=='2'?this.filaSel+result.datos.length:this.filaSel;
            let condicion=itemsel.substring(0,itemsel.lastIndexOf('.')+1);//vacio si es titulo(1er nivel), 1. o 1.1.
            for(let i=indpri;i<this.datasourcePri.length;i++){
              var palabra = this.datasourcePri[i].item.toString().substring(0, condicion.length)
              if (palabra === condicion) {
                var prefijo = this.datasourcePri[i].item.toString().substring(0, itemsel.length+1)
                if((result.forma=='3' && (this.datasourcePri[i].item != itemsel && prefijo!=(itemsel+'.'))) || result.forma=='2'){
                  if(!enco){
                    indins=i;
                    enco=true;
                  }
                  let separado = this.datasourcePri[i].item.toString().split('.');
                  let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                  let nuevonum = Number(separado[longi - 1]) + result.datos.length;
                  separado[longi - 1] = nuevonum.toString();
                  let nuevoagr = separado.join('.');
                  this.datasourcePri[i].item=nuevoagr;
                  this.datasourcePri[i].itemord=this.GenerarItemord(nuevoagr);
                  this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i])
                }
              }//desde la fila seleccionada
              else{
                if(indins==-1){ indins=i; }
                break;
              }
            }
            if(indins==-1){ indins=this.datasourcePri.length; }
          }
          let indini=indins;
          for(let filaadd of result.datos){
            let filaagrega=this.nuevafilapri(this.ultindice++,itemini,filaadd.descripcion,'','',null,null,0,null,'',null,null,filaadd.id_partida,0,1,1,1,this.id_userproy,filaadd.descripcion);
            itemini=this.sigitem(itemini);
            this.datasourcePri.splice(indins++,0,filaagrega);
            this.inserta.push(filaagrega);
          }
          this.cambindiceselpresu(indini);
          this.actualizarTemp(3);
        }
      }
      else {
        this.toaster.error('Seleccione una fila para agregar un subtitulo.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch (e) {
      console.log(e)
    }
  }
  async PartidaBlanco(){//agregar partida fila
    if (this.filaSel >= 0) {
      let filaact=this.datasourcePri[this.filaSel];
      let itemsel=filaact.item;
      let itemini='';
      let indins=-1;
      if(filaact.unidad==''){//fin
        for(let i=this.filaSel+1;i<this.datasourcePri.length;i++){
          var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
          if (palabra != itemsel) {
            if(i-1==this.filaSel){
              itemini=itemsel+".1";
            }
            else{
              let arrultit=this.datasourcePri[i-1].item.split('.');
              let auxite='';
              for(let b=0;b<itemsel.split('.').length+1;b++){
                auxite+=arrultit[b]+'.';
              }
              itemini=this.sigitem(auxite.substring(0,auxite.length-1));
            }
            indins=i;
            break;
          }
        }
        if(indins==-1){
          let ultit=this.datasourcePri[this.datasourcePri.length-1].item;
          if(ultit==itemsel){
            itemini=itemsel+".1";
          }
          else{
            let arrultit=ultit.split('.');
            let auxite='';
            for(let b=0;b<itemsel.split('.').length+1;b++){
              auxite+=arrultit[b]+'.';
            }
            itemini+=this.sigitem(auxite.substring(0,auxite.length-1));
          }
          indins=this.datasourcePri.length;
        }
      }
      else{//bajo seleccion
        itemini=this.sigitem(itemsel);//buscar el item inicial para agregar
        let indpri=this.filaSel;
        let enco=false;
        let condicion=itemsel.substring(0,itemsel.lastIndexOf('.')+1);//vacio si es titulo(1er nivel), 1. o 1.1.
        for(let i=indpri;i<this.datasourcePri.length;i++){
          var palabra = this.datasourcePri[i].item.toString().substring(0, condicion.length)
          if (palabra === condicion) {
            var prefijo = this.datasourcePri[i].item.toString().substring(0, itemsel.length+1)
            if(this.datasourcePri[i].item != itemsel && prefijo!=(itemsel+'.')){
              if(!enco){
                indins=i;
                enco=true;
              }
              let separado = this.datasourcePri[i].item.toString().split('.');
              let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
              let nuevonum = Number(separado[longi - 1]) + 1;
              separado[longi - 1] = nuevonum.toString();
              this.datasourcePri[i].item=separado.join('.');
              this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
              this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
            }
          }//desde la fila seleccionada
          else{
            if(indins==-1){ indins=i; }
            break;
          }
        }
        if(indins==-1){ indins=this.datasourcePri.length; }
      }
      let indini=indins;
      let newindice=this.ultindice++;
      let filaagrega=this.nuevafilapri(newindice,itemini,'',41,'UND',0,0,0,1,'DIA',8,null,null,0,2,1,1,this.id_userproy,'');
      this.datasourcePri.splice(indins++,0,filaagrega);
      this.inserta.push(filaagrega);
      this.cambindiceselpresu(indini);
      this.EditarDesc(indini);
      this.actualizarTemp(4);
    }
    else {
      this.toaster.error('Seleccione una fila para agregar un subtitulo.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async SubtituloBlanco(){//agregar partida fila
    if (this.filaSel >= 0) {
      let filaact=this.datasourcePri[this.filaSel];
      let itemsel=filaact.item;
      let itemini='';
      let indins=-1;
      if(filaact.unidad==''){//fin
        for(let i=this.filaSel+1;i<this.datasourcePri.length;i++){
          var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
          if (palabra != itemsel) {
            if(i-1==this.filaSel){
              itemini=itemsel+".1";
            }
            else{
              let arrultit=this.datasourcePri[i-1].item.split('.');
              let auxite='';
              for(let b=0;b<itemsel.split('.').length+1;b++){
                auxite+=arrultit[b]+'.';
              }
              itemini=this.sigitem(auxite.substring(0,auxite.length-1));
            }
            indins=i;
            break;
          }
        }
        if(indins==-1){
          let ultit=this.datasourcePri[this.datasourcePri.length-1].item;
          if(ultit==itemsel){
            itemini=itemsel+".1";
          }
          else{
            let arrultit=ultit.split('.');
            let auxite='';
            for(let b=0;b<itemsel.split('.').length+1;b++){
              auxite+=arrultit[b]+'.';
            }
            itemini+=this.sigitem(auxite.substring(0,auxite.length-1));
          }
          indins=this.datasourcePri.length;
        }
      }
      else{//bajo seleccion
        itemini=this.sigitem(itemsel);//buscar el item inicial para agregar
        let indpri=this.filaSel;
        let enco=false;
        let condicion=itemsel.substring(0,itemsel.lastIndexOf('.')+1);//vacio si es titulo(1er nivel), 1. o 1.1.
        for(let i=indpri;i<this.datasourcePri.length;i++){
          var palabra = this.datasourcePri[i].item.toString().substring(0, condicion.length)
          if (palabra === condicion) {
            var prefijo = this.datasourcePri[i].item.toString().substring(0, itemsel.length+1)
            if(this.datasourcePri[i].item != itemsel && prefijo!=(itemsel+'.')){
              if(!enco){
                indins=i;
                enco=true;
              }
              let separado = this.datasourcePri[i].item.toString().split('.');
              let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
              let nuevonum = Number(separado[longi - 1]) + 1;
              separado[longi - 1] = nuevonum.toString();
              this.datasourcePri[i].item=separado.join('.');
              this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
              this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
            }
          }//desde la fila seleccionada
          else{
            if(indins==-1){ indins=i; }
            break;
          }
        }
        if(indins==-1){ indins=this.datasourcePri.length; }
      }
      let indini=indins;
      let newindice=this.ultindice++;
      let filaagrega=this.nuevafilapri(newindice,itemini,'','','',null,null,0,null,'',  null,null,null,0,1,1,1,this.id_userproy,'');
      this.datasourcePri.splice(indins++,0,filaagrega);
      this.inserta.push(filaagrega);
        
      this.cambindiceselpresu(indini);
      this.EditarDesc(indini);
      this.actualizarTemp(4);
    }
    else {
      this.toaster.error('Seleccione una fila para agregar un subtitulo.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async OpenmodalAddPartida() {
    try {
      let filapresel = this.filaSel;
      let unidadfila = filapresel >= 0 ? this.datasourcePri[filapresel].unidad : '';
      if (filapresel >= 0) {
        let umedidas = await this.adminservice.listarUnidadMed({id_usuario:this.id_userproy,fuente:'',activo: 1,operador:1})
        this.medidas=umedidas;
        let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.id_userproy,fuente:this.fuentepasa, tipo_proy: this.tipoProy,idpadre:'',restriccion:'' });//cambiar dinamico tipo_proy
        let opcfilasel=unidadfila==''?false:true;
        const modalRef = this.modalService.open(BusqPartidasPresuComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
        modalRef.componentInstance.partidas = rpartidas;
        modalRef.componentInstance.tipoProy = this.arrtipoProy;//cambiar por el arreglo de tipos de proyecto
        modalRef.componentInstance.opcfila=opcfilasel;
        modalRef.componentInstance.fondo=this.titulo1;
        modalRef.componentInstance.color=this.titulo1color;
        modalRef.componentInstance.letra=this.titulo1letra;
        modalRef.componentInstance.medidas=umedidas;
        modalRef.componentInstance.tipoproypasa=this.tipoProy;
        modalRef.componentInstance.fuentepasa=this.fuentepasa;
        modalRef.componentInstance.dec_cant=this.dec_cant;
        modalRef.componentInstance.mask_cant=this.mask_cant;
        modalRef.componentInstance.dec_precio=this.dec_precio;
        modalRef.componentInstance.mask_precio=this.mask_precio;
        modalRef.componentInstance.tablaacu=this.datasourcePriacu;
        modalRef.componentInstance.tablaact=JSON.parse(JSON.stringify(this.datasourcePri));
        modalRef.componentInstance.tablaactacu=JSON.parse(JSON.stringify(this.datasourcePriacu));
        modalRef.componentInstance.tablaactsub=JSON.parse(JSON.stringify(this.datasourcePrisub));
        modalRef.componentInstance.moneda=this.simbolo;
        modalRef.componentInstance.iduser=this.id_userproy;
        const result = await modalRef.result
        if (result) {
          this.mostrar_carga_todo=true;
          let itemsel=this.filaSel>-1?this.datasourcePri[this.filaSel].item:"NULL";
          let itemini='';
          let indins=-1;
          if(result.forma=="1"){//inicio
            itemini=itemsel+".1";
            indins=this.filaSel+1;
            for(let i=indins;i<this.datasourcePri.length;i++){
              var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
              if (palabra == itemsel) {
                let separado = this.datasourcePri[i].item.toString().split('.');
                let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                let nuevonum = Number(separado[longi]) + result.datos.length;
                separado[longi] = nuevonum.toString();
                this.datasourcePri[i].item=separado.join('.');
                this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
              }//desde la fila seleccionada
              else{
                break;
              }
            }
          }
          else if(result.forma=="0"){//fin
            for(let i=this.filaSel+1;i<this.datasourcePri.length;i++){
              var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
              if (palabra != itemsel) {
                if(i-1==this.filaSel){
                  itemini=itemsel+".1";
                }
                else{
                  let arrultit=this.datasourcePri[i-1].item.split('.');
                  let auxite='';
                  for(let b=0;b<itemsel.split('.').length+1;b++){
                    auxite+=arrultit[b]+'.';
                  }
                  itemini=this.sigitem(auxite.substring(0,auxite.length-1));
                }
                indins=i;
                break;
              }
            }
            if(indins==-1){
              let ultit=this.datasourcePri[this.datasourcePri.length-1].item;
              if(ultit==itemsel){
                itemini=itemsel+".1";
              }
              else{
                let arrultit=ultit.split('.');
                let auxite='';
                for(let b=0;b<itemsel.split('.').length+1;b++){
                  auxite+=arrultit[b]+'.';
                }
                itemini+=this.sigitem(auxite.substring(0,auxite.length-1));
              }
              indins=this.datasourcePri.length;
            }
          }
          else if(result.forma=="2" || result.forma=="3"){//3 bajo sel, 2 sobre sel
            itemini=result.forma=='3'?this.sigitem(itemsel):itemsel;//buscar el item inicial para agregar
            let indpri=this.filaSel;
            let enco=false;
            //this.filaSel=result.forma=='2'?this.filaSel+result.datos.length:this.filaSel;
            let condicion=itemsel.substring(0,itemsel.lastIndexOf('.')+1);//vacio si es titulo(1er nivel), 1. o 1.1.
            for(let i=indpri;i<this.datasourcePri.length;i++){
              var palabra = this.datasourcePri[i].item.toString().substring(0, condicion.length)
              if (palabra === condicion) {
                var prefijo = this.datasourcePri[i].item.toString().substring(0, itemsel.length+1)
                if((result.forma=='3' && (this.datasourcePri[i].item != itemsel && prefijo!=(itemsel+'.'))) || result.forma=='2'){
                  if(!enco){
                    indins=i;
                    enco=true;
                  }
                  let separado = this.datasourcePri[i].item.toString().split('.');
                  let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                  let nuevonum = Number(separado[longi - 1]) + result.datos.length;
                  separado[longi - 1] = nuevonum.toString();
                  this.datasourcePri[i].item=separado.join('.');
                  this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                  this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
                }
              }//desde la fila seleccionada
              else{
                if(indins==-1){ indins=i; }
                break;
              }
            }
            if(indins==-1){ indins=this.datasourcePri.length; }
          }
          let indini=indins;
          for(let filaadd of result.datos){
            let newindice=this.ultindice++;
            let filaagrega=this.nuevafilapri(newindice,itemini,filaadd.descripcion,filaadd.id_unidad,filaadd.unidad,0,filaadd.precio,0,filaadd.rendimiento,filaadd.und_rendi,
              filaadd.jornada,filaadd.referencia,filaadd.id_partida,filaadd.advceros,2,1,1,this.id_userproy,filaadd.descripcion);
            itemini=this.sigitem(itemini);
            this.datasourcePri.splice(indins++,0,filaagrega);
            this.inserta.push(filaagrega);
            if(filaadd.id_partida!=null){//agregar detalle de partidas
              let tabdet=await this.catalogosService.ListarDetalleDataPartidas({ id_partida: filaadd.id_partida });
              let detpart=tabdet.length>0?tabdet[0]:[];
              let detsubp=tabdet.length>0?tabdet[1]:[];
              let arragru=[];
              for(let m=0;m<detpart.length;m++){
                if(detpart[m].num_det!=0){
                  let sumasubp=0;
                  if(detpart[m].esinsumo==0 && detpart[m].num_det>0){//condicionar con id_partida!=null o agregar directamente detalle cuando se agrega la subpartida
                    let indicedet=detpart[m].esinsumo==0 && detpart[m].num_det>0?this.ultindice++:null;
                    sumasubp=await this.CargarDetalleSubpartida(detsubp,detpart[m],detpart[m].id_subpartida,indicedet,null);//se debe pasar subpartida
                    detpart[m].indice_subp=indicedet;
                    detpart[m].codigo='SP'+indicedet.toString().padStart(5,'0');
                  }
                  let cantaux;
                  if(detpart[m].operador=='%'){
                    cantaux=this.formService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
                    detpart[m].precio=0;
                  }
                  else{
                    if(detpart[m].afcuadrilla==1){
                      var canti=Number(filaadd.rendimiento)==0?detpart[m].cantidad:(Number(detpart[m].cuadrilla)*Number(filaadd.jornada))/Number(filaadd.rendimiento);
                      cantaux=this.formService.redondeo(Number(canti),this.dec_cant);//se calcula, en el caso de afcuadrilla
                    }else{
                      cantaux=this.formService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
                    }
                  }
                  detpart[m].cantidad=cantaux;
                  let precioaux=detpart[m].esinsumo==0 && detpart[m].num_det>0?this.formService.redondeo(sumasubp,this.dec_precio):this.formService.redondeo(Number(detpart[m].precio),this.dec_precio);
                  detpart[m].precio=precioaux;
                  let nparc=Number(cantaux)*Number(precioaux);
                  detpart[m].parcial=this.formService.redondeo(nparc,this.dec_precio);
                  let agruexs=arragru.find(ele=>ele.id_tipo_insumo==detpart[m].id_tipo_insumo);
                  if(agruexs && detpart[m].operador!='%'){//suma
                    agruexs.parcial=Number(agruexs.parcial)+Number(detpart[m].parcial);
                  }else{//agrega
                    arragru.push({id_tipo_insumo:detpart[m].id_tipo_insumo,parcial:nparc});
                  }
                }
              }
              //calcular porcentajes, calcular sumas sin porc
              for(let n=0;n<detpart.length;n++){
                if(detpart[n].operador=='%'){
                  let exind=arragru.find(ele=>ele.id_tipo_insumo==detpart[n].tipo_insumo);
                  if(exind){
                    detpart[n].precio=this.formService.redondeo(Number(exind.parcial),this.dec_precio);
                    detpart[n].parcial=this.formService.redondeo((Number(detpart[n].cantidad)*Number(detpart[n].precio))/100,this.dec_precio);
                  }
                }
              }
              for(let a=0;a<detpart.length;a++){
                //let indicedet=detpart[a].esinsumo==0 && detpart[a].num_det>0?this.ultindice++:null;
                if(detpart[a].num_det>0){
                  let agrega:rowacu = {
                    id_proyecto:this.id_proyecto,
                    indice_subp: detpart[a].indice_subp??null,//condicionar con subpartida
                    id_filadetalle:null,
                    num_det: detpart[a].num_det,
                    codigo:detpart[a].codigo,
                    descripcion: detpart[a].descripcion,
                    id_unidad:detpart[a].id_unidad,
                    unidad: detpart[a].unidad,
                    operador:detpart[a].operador??null,
                    tipo_insumo:detpart[a].esinsumo==0 && detpart[a].num_det>0?null:detpart[a].tipo_insumo,
                    cuadrilla: detpart[a].operador!='%' && detpart[a].cuadrilla!=null?Number(detpart[a].cuadrilla):null,
                    cantidad: detpart[a].cantidad,
                    precio: detpart[a].precio,
                    parcial: detpart[a].parcial,
                    id_tipo_insumo: detpart[a].id_tipo_insumo??null,
                    id_insumo: detpart[a].id_insumo??null,
                    id_indice: detpart[a].id_indice??null,
                    id_clasificacion:detpart[a].id_clasificacion,//revisar valores
                    desc_clasi:detpart[a].desc_clasi??null,
                    id_subpartida: detpart[a].esinsumo==0 && detpart[a].num_det>0?detpart[a].id_subpartida:null,
                    esinsumo:detpart[a].esinsumo,
                    afcuadrilla:detpart[a].afcuadrilla,
                    rendimiento:detpart[a].esinsumo==0 && detpart[a].num_det>0?detpart[a].rendimiento:null,
                    und_rendi:detpart[a].esinsumo==0 && detpart[a].num_det>0?detpart[a].und_rendi:null,
                    jornada:detpart[a].esinsumo==0 && detpart[a].num_det>0?detpart[a].jornada:null,
                    advceros:detpart[a].advceros,
                    referencia:null,
                    icomost: '1',
                    mostrar: '1',
                    editar: 0,
                    editar2:0,
                    ind:this.datasourcePriacu.length,
                    accion:1,
                    indice:newindice,
                    seleccion:0,
                    asignaund:0,
                    zidmodi:this.insertaacu.length>0?this.insertaacu[this.insertaacu.length-1].zidmodi+1:1//ultimo id?
                  };
                  this.datasourcePriacu.push(agrega);//para pushear se debe obtener el formato del objeto rowacu
                  this.insertaacu.push(agrega);
                }
              }
            }
            else{//agregar nueva partida directamente, o agregada al detalle directamente
              for(let row of result.detalle){
                if(row.num_det>0){
                  let indicedet=row.esinsumo==0 && row.num_det>0?this.ultindice++:null;
                  if(row.indice==filaadd.indice){
                    let ncod=row.num_det>0 && row.id_tipo_insumo==5?'SP'+indicedet.toString().padStart(5,'0'):row.codigo;
                    let filaaux:rowacu={
                      id_proyecto:this.id_proyecto,
                      num_det:row.num_det,
                      id_filadetalle:null,
                      codigo:ncod,//row.codigo=='' || row.codigo==null?null:row.codigo,
                      descripcion:row.descripcion,
                      id_unidad:row.id_unidad,
                      unidad:row.unidad,
                      operador:row.operador,
                      tipo_insumo:row.tipo_insumo,
                      cuadrilla:row.cuadrilla!=null?Number(row.cuadrilla):null,
                      cantidad:row.cantidad!=null?Number(row.cantidad):null,
                      precio:row.precio!=null?Number(row.precio):null,
                      parcial:row.parcial!=null?Number(row.parcial):null,
                      id_tipo_insumo:Number(row.id_tipo_insumo),
                      id_indice:row.id_indice,
                      id_clasificacion:row.id_clasificacion,//revisar valores
                      desc_clasi:row.id_clasificacion?row.desc_clasi:null,
                      id_insumo:row.id_insumo?Number(row.id_insumo):null,
                      id_subpartida:row.id_subpartida,
                      indice:newindice,
                      indice_subp:indicedet,
                      accion:1,
                      esinsumo:row.esinsumo,
                      afcuadrilla:row.afcuadrilla,
                      rendimiento:row.rendimiento,
                      und_rendi:row.und_rendi,
                      jornada:row.jornada,
                      advceros:row.advceros,
                      referencia:row.referencia,
                      mostrar:row.mostrar,
                      icomost:row.icomost,
                      editar:0,
                      editar2:0,
                      ind:-1,
                      seleccion:0,
                      asignaund:0,
                      zidmodi:this.insertaacu.length>0?this.insertaacu[this.insertaacu.length-1].zidmodi+1:1
                    };
                    this.datasourcePriacu.push(filaaux)
                    this.insertaacu.push(filaaux);
                    if(row.esinsumo==0 && row.num_det>0){//cargar las subpartidas que vienen del modal
                      this.cargarsubparrbusq(result.detsubp,row.indice_subp,indicedet)
                    }
                  }
                }
              }
            }
          }
          this.cambindiceselpresu(indini);
          this.actualizarTemp(4);
          this.mostrar_carga_todo=false;
        }
      }
      else {
        this.toaster.error('Seleccione una fila para agregar una partida.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e)
    }
  }
  cargarsubparrbusq(arrsubp:any,indicepadre:any,newindice:any){
    for(let rowdet of arrsubp){
      if(indicepadre==rowdet.indice){
        if(rowdet.num_det>0){
          let indicedet=rowdet.esinsumo==0 && rowdet.num_det>0?this.ultindice++:null;
          let ncod;
          if(rowdet.esinsumo==0 && rowdet.num_det>0){
            ncod='SP'+indicedet.toString().padStart(5,'0');
          }
          else{
            ncod=rowdet.codigo;
          }
          let filaaux:rowacu={
            id_proyecto:this.id_proyecto,
            id_filadetalle:null,
            num_det:rowdet.num_det,
            codigo:ncod,//rowdet.codigo=='' || rowdet.codigo==null?null:rowdet.codigo,
            descripcion:rowdet.descripcion,
            id_unidad:rowdet.id_unidad,
            unidad:rowdet.unidad,
            operador:rowdet.operador,
            tipo_insumo:rowdet.tipo_insumo,
            cuadrilla:rowdet.cuadrilla!=null?Number(rowdet.cuadrilla):null,
            cantidad:rowdet.cantidad!=null?Number(rowdet.cantidad):null,
            precio:rowdet.precio!=null?Number(rowdet.precio):null,
            parcial:rowdet.parcial!=null?Number(rowdet.parcial):null,
            id_tipo_insumo:Number(rowdet.id_tipo_insumo),
            id_indice:rowdet.id_indice,
            id_clasificacion:rowdet.id_clasificacion,
            desc_clasi:rowdet.id_clasificacion?rowdet.desc_clasi:null,
            id_insumo:rowdet.id_insumo?Number(rowdet.id_insumo):null,
            id_subpartida:rowdet.id_subpartida,
            indice:newindice,//cambia por el indice del padre
            indice_subp:indicedet,
            accion:1,
            esinsumo:rowdet.esinsumo,
            afcuadrilla:rowdet.afcuadrilla,
            rendimiento:rowdet.rendimiento,
            und_rendi:rowdet.und_rendi,
            jornada:rowdet.jornada,
            advceros:rowdet.advceros,
            referencia:rowdet.referencia,
            mostrar:rowdet.mostrar,
            icomost:rowdet.icomost,
            editar:0,
            editar2:0,
            ind:-1,
            seleccion:0,
            asignaund:0,
            zidmodi:null
          };
          this.datasourcePrisub.push(filaaux);
          if(rowdet.esinsumo==0 && rowdet.num_det>0){//cargar las subpartidas que vienen del modal
            this.cargarsubparrbusq(arrsubp,rowdet.indice_subp,indicedet)
          }
        }
      }
    }
  }
  async CargarDetalleSubpartida(detsubp:any,fillaadd:any,id_partida:any,newindice:any,refer:any){//revisar
    let detpart = [];
    let tablabusq=JSON.parse(JSON.stringify(detsubp));
    for(let fila1 of tablabusq){
      if(fila1.id_partida==id_partida && fila1.num_det>0){
        detpart.push(fila1);
      }
    }
    let sumapsubp=0;
    let arragru=[];
    for(let m=0;m<detpart.length;m++){
      if(detpart[m].num_det>0){
        let sumasubp=0;
        if(detpart[m].esinsumo==0 && detpart[m].num_det>0){//condicionar con id_partida!=null o agregar directamente detalle cuando se agrega la subpartida
          let indicedet=this.ultindice++;
          sumasubp=await this.CargarDetalleSubpartida(detsubp,detpart[m],detpart[m].id_subpartida,indicedet,refer);//se debe pasar subpartida
          detpart[m].indice_subp=indicedet;
        }
        let cantaux;
        if(detpart[m].operador=='%'){
          cantaux=this.formService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
          detpart[m].precio=0;
        }
        else{
          if(detpart[m].afcuadrilla==1){
            var canti=Number(fillaadd.rendimiento)==0?detpart[m].cantidad:(Number(detpart[m].cuadrilla)*Number(fillaadd.jornada))/Number(fillaadd.rendimiento);
            cantaux=this.formService.redondeo(Number(canti),this.dec_cant);//se calcula, en el caso de afcuadrilla
          }else{
            cantaux=this.formService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
          }
        }
        detpart[m].cantidad=cantaux;
        let precioaux=detpart[m].esinsumo==0 && detpart[m].num_det>0?this.formService.redondeo(sumasubp,this.dec_precio):this.formService.redondeo(Number(detpart[m].precio),this.dec_precio);
        detpart[m].precio=precioaux;
        let nparc=Number(cantaux)*Number(precioaux);
        detpart[m].parcial=this.formService.redondeo(nparc,this.dec_precio);
        let encind=arragru.find(ele=>ele.id_tipo_insumo==detpart[m].id_tipo_insumo)
        if(encind){
          encind.parcial=Number(encind.parcial)+Number(detpart[m].parcial)
        }
        else{
          arragru.push({id_tipo_insumo:detpart[m].id_tipo_insumo,parcial:detpart[m].parcial})
        }
      }
    }
    for(let n=0;n<detpart.length;n++){//calcular porcentajes
      if(detpart[n].operador=='%'){
        let parcagru=arragru.find(ele=>ele.id_tipo_insumo==detpart[n].tipo_insumo)
        if(parcagru){
          detpart[n].precio=this.formService.redondeo(Number(parcagru.parcial),this.dec_precio);
          detpart[n].parcial=this.formService.redondeo((Number(detpart[n].cantidad)*Number(detpart[n].precio))/100,this.dec_precio);
        }
        else{
          detpart[n].precio=0;
          detpart[n].parcial=0;
        }
      }
    }
    for(let a=0;a<detpart.length;a++){
      let referpasa=null;
      let ncod;
      if(detpart[a].esinsumo==0 && detpart[a].num_det>0){
        referpasa=detpart[a].referencia==null || detpart[a].referencia==''?refer:(refer!=null?detpart[a].referencia+","+refer:detpart[a].referencia);
        ncod='SP'+detpart[a].indice_subp.toString().padStart(5,'0');
      }
      else{
        ncod=detpart[a].codigo;
      }
      let filaaux:rowacu={
        id_proyecto:this.id_proyecto,
        indice:newindice,// se debe recuperar el indice del padre
        id_filadetalle:null,
        num_det:detpart[a].num_det,
        codigo:ncod/* detpart[a].codigo=='' || detpart[a].codigo==null?null:detpart[a].codigo */,
        descripcion:detpart[a].descripcion,
        id_unidad:detpart[a].id_unidad,
        unidad:detpart[a].unidad,
        operador:detpart[a].operador,
        tipo_insumo:detpart[a].tipo_insumo,
        cuadrilla:detpart[a].operador!='%' && detpart[a].cuadrilla!=null?Number(detpart[a].cuadrilla):null,
        cantidad:detpart[a].cantidad!=null?Number(detpart[a].cantidad):null,
        precio:detpart[a].precio!=null?Number(detpart[a].precio):null,
        parcial:detpart[a].parcial!=null?Number(detpart[a].parcial):null,
        id_tipo_insumo:Number(detpart[a].id_tipo_insumo),
        id_indice:detpart[a].id_indice,
        id_clasificacion:detpart[a].id_clasificacion,//revisar valores
        desc_clasi:detpart[a].id_clasificacion?detpart[a].desc_clasi:null,
        id_insumo:detpart[a].id_insumo?Number(detpart[a].id_insumo):null,
        id_subpartida:detpart[a].id_subpartida,
        indice_subp:detpart[a].indice_subp??null,
        accion:1,
        esinsumo:detpart[a].esinsumo,
        afcuadrilla:detpart[a].afcuadrilla,
        rendimiento:detpart[a].rendimiento,
        und_rendi:detpart[a].und_rendi,
        jornada:detpart[a].jornada,
        advceros:detpart[a].advceros,
        referencia:referpasa,
        mostrar:detpart[a].mostrar,
        icomost:detpart[a].icomost,
        editar:0,
        editar2:0,
        ind:-1,
        seleccion:0,
        asignaund:0,
        zidmodi:null
      };
      this.datasourcePrisub.push(filaaux);//para pushear se debe obtener el formato del objeto rowacu
      if(detpart[a].num_det>0){
        sumapsubp+=Number(detpart[a].parcial)
      }
    }
    return sumapsubp;
  }
  async CargarSubpartidasResult(subpartidas,indicepadre,indicesubp,refer){
    for(let rowsubp of subpartidas){
      if(rowsubp.indice==indicesubp && rowsubp.num_det>0){
        let referpasa=null;
        let ncod;
        let indicedet=rowsubp.esinsumo==0 && rowsubp.num_det>0?this.ultindice++:null;
        if(rowsubp.esinsumo==0 && rowsubp.num_det>0){
          referpasa=rowsubp.referencia==null || rowsubp.referencia==''?refer:(refer!=null?rowsubp.referencia+","+refer:rowsubp.referencia);
          ncod='SP'+indicedet.toString().padStart(5,'0');
        }
        else{
          ncod=rowsubp.codigo;
        }
        let agrega:rowacu={
          id_proyecto:this.id_proyecto,
          indice:indicepadre,//debe tener indice para vincular?
          id_filadetalle:null,
          //id_partida:rowsubp.id_partida,
          num_det:rowsubp.num_det,
          codigo:ncod/* rowsubp.codigo=='' || rowsubp.codigo==null?null:rowsubp.codigo */,
          descripcion:rowsubp.descripcion,
          id_unidad:rowsubp.id_unidad,
          unidad:rowsubp.unidad,
          operador:rowsubp.operador??null,
          tipo_insumo:rowsubp.tipo_insumo??null,
          cuadrilla:rowsubp.cuadrilla,
          cantidad:rowsubp.cantidad,
          precio:rowsubp.precio,
          parcial:rowsubp.parcial,
          id_tipo_insumo:rowsubp.id_tipo_insumo,
          id_insumo:rowsubp.id_insumo,
          id_indice:rowsubp.id_indice,
          id_clasificacion:rowsubp.id_clasificacion,//revisar valores
          desc_clasi:rowsubp.id_clasificacion?rowsubp.desc_clasi:null,
          id_subpartida:rowsubp.id_subpartida,
          indice_subp:indicedet?indicedet:null,
          esinsumo:rowsubp.esinsumo,
          afcuadrilla:rowsubp.afcuadrilla,
          rendimiento:rowsubp.rendimiento,
          und_rendi:rowsubp.und_rendi,
          jornada:rowsubp.jornada,
          advceros:rowsubp.advceros,
          referencia:referpasa,
          icomost:'1',
          mostrar:rowsubp.icomost=='1'?'1':'0',
          editar:0,
          editar2:0,
          ind:-1,
          seleccion:0,
          accion:1,
          asignaund:0,
          zidmodi:null
        };
        this.datasourcePrisub.push(agrega);
        if(rowsubp.esinsumo==0 && rowsubp.num_det>0){//si es subpartidas, agregar su detalle
          await this.CargarSubpartidasResult(subpartidas,indicedet,rowsubp.indice_subp,refer);
        }
      }
    }
  }
  ActElimArrCambios(filaeli:any){
    if(filaeli.accion==1){//si se inserto, eliminamos de tabla insertar
      for(let i=0;i<this.inserta.length;i++){
        if(this.inserta[i].indice==filaeli.indice){
          this.inserta.splice(i,1);
          break;
        }
      }
    }
    else if(filaeli.accion==2){//si se actualizo la fila, se elimina de update y se agrega a eliminar
      for(let i=0;i<this.modifica.length;i++){
        if(this.modifica[i].indice==filaeli.indice){
          this.modifica.splice(i,1);
          break;
        }
      }
      this.elimina.push(filaeli)
    }
    else if(filaeli.accion==0){//si no se hizo nada,se agrega a array eliminar
      this.elimina.push(filaeli)
    }
  }
  /* ActElimArrAcuCambios(filaeli:any){
    if(filaeli.accion==1){//si se inserto, eliminamos de tabla insertar
      for(let i=0;i<this.insertaacu.length;i++){
        if(this.insertaacu[i].indice==filaeli.indice && this.insertaacu[i].num_det==filaeli.num_det && this.insertaacu[i].id_tipo_insumo==filaeli.id_tipo_insumo){
          this.insertaacu.splice(i,1);
          break;
        }
      }
    }
    else if(filaeli.accion==2){//si se actualizo la fila, se elimina de update y se agrega a eliminar
      for(let i=0;i<this.modificaacu.length;i++){
        if(this.modificaacu[i].indice==filaeli.indice && this.modificaacu[i].num_det==filaeli.num_det && this.modificaacu[i].id_tipo_insumo==filaeli.id_tipo_insumo){
          this.modificaacu.splice(i,1);
          break;
        }
      }
      this.eliminaacu.push(filaeli)
    }
    else if(filaeli.accion==0){//si no se hizo nada,se agrega a array eliminar
      this.eliminaacu.push(filaeli)
    }
  } */
  async EliminarFila(corta=false) {
    try {
      let sellista=this.colselpri || this.colselpri2?true:false;
      if(!sellista){//seleccion por fila
        if (this.filaSel >= 0) {
          if(!corta){
            const respu=await SwalService.confirm('Esta seguro que desea Eliminar?','');
            if(!respu.isConfirmed){
              return;
            }
          }
          let cantfilborra=0;
          let indiceborra = corta?this.indselcorta:this.filaSel;
          let row = this.datasourcePri[indiceborra];
          let actitem = row.item.toString();
          let arritem = row.item.toString().split('.');
          for (let i = indiceborra; i < this.datasourcePri.length; i++) {
            let itemfila = this.datasourcePri[i].item.toString();
            if (itemfila == actitem) {
              if(this.datasourcePri[i].unidad!=''){
                for(let a=0;a<this.datasourcePriacu.length;a++){
                  if(this.datasourcePriacu[a].indice==this.datasourcePri[i].indice){
                    if (this.datasourcePriacu[a].esinsumo == 0) {//si es subpartida hacer un recursivo para que agregue sus detalles y subpartidas
                      this.eliminaDatosSubp(this.datasourcePriacu[a])
                    }
                    this.ActElimArrCambiosAcu(this.datasourcePriacu[a]);
                    this.datasourcePriacu.splice(a,1);
                    this.ActIndTabacusel(a);
                    a--;
                  }
                }
              }
              this.ActElimArrCambios(this.datasourcePri[i]);
              this.datasourcePri.splice(i,1);
              cantfilborra++;
              i--;
            }
            else if(itemfila.substring(0, actitem.length + 1) == actitem + '.'){
              if(this.datasourcePri[i].unidad!=''){
                for(let a=0;a<this.datasourcePriacu.length;a++){
                  if(this.datasourcePriacu[a].indice==this.datasourcePri[i].indice){
                    if (this.datasourcePriacu[a].esinsumo == 0) {//si es subpartida hacer un recursivo para que agregue sus detalles y subpartidas
                      this.eliminaDatosSubp(this.datasourcePriacu[a])
                    }
                    this.ActElimArrCambiosAcu(this.datasourcePriacu[a])
                    this.datasourcePriacu.splice(a,1);
                    this.ActIndTabacusel(a);
                    a--;
                  }
                }
              }
              this.ActElimArrCambios(this.datasourcePri[i])
              this.datasourcePri.splice(i,1);
              cantfilborra++;
              i--;
            }
            else{//actualizar indices (para las filas posteriores a las filas eliminadas)
              let nivelant=actitem.substring(0, actitem.lastIndexOf('.')+1);
              var prefijo2 = itemfila.toString().substring(0, nivelant.length)
              if(prefijo2 == nivelant){//comparar con prefijo superior sino break
                let separado=itemfila.split('.');
                let longi = arritem.length;
                let nuevonum = Number(separado[longi-1]) -1;
                separado[longi-1] = nuevonum.toString();
                this.datasourcePri[i].item=separado.join('.');
                this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
              }
              else{
                break;
              }
            }
          }
          if(indiceborra>0){
            this.calculartotalpadres(indiceborra-1);
          }
          if(!corta){
            this.actualizarTemp(5);
          }
          this.cambindiceselpresu(-1);
          this.toaster.success('La operacion se realizo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          return cantfilborra;
        }
        else {
          this.mostrar_carga_todo = false
          this.toaster.error('Seleccione una fila para eliminar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          return 0;
        }
      }//seleccion multiple
      else{
        if(this.arrprisel.length>0){
          if(!corta){
            const respu=await SwalService.confirm('Esta seguro que desea Eliminar las Filas Seleccionadas?','');
            if(!respu.isConfirmed){
              return;
            }
          }
          let cantfilborra=0;
          this.mostrar_carga=true;
          for(let indi=0;indi<this.arrindprisel.length;indi++){
            let row = this.datasourcePri[this.arrindprisel[indi]];
            let actitem = row.item.toString();
            for (let i = this.arrindprisel[indi]; i < this.datasourcePri.length; i++) {
              let itemfila = this.datasourcePri[i].item.toString();
              if (itemfila == actitem) {
                if(this.datasourcePri[i].unidad!=''){
                  for(let a=0;a<this.datasourcePriacu.length;a++){
                    if(this.datasourcePriacu[a].indice==this.datasourcePri[i].indice){
                      if (this.datasourcePriacu[a].esinsumo == 0) {//si es subpartida hacer un recursivo para que agregue sus detalles y subpartidas
                        this.eliminaDatosSubp(this.datasourcePriacu[a])
                      }
                      this.ActElimArrCambiosAcu(this.datasourcePriacu[a]);
                      this.datasourcePriacu.splice(a,1);
                      this.ActIndTabacusel(a);
                      a--;
                    }
                  }
                }
                this.ActElimArrCambios(this.datasourcePri[i]);
                this.datasourcePri.splice(i,1);
                cantfilborra++;
                i--;
              }
              else{//actualizar indices (para las filas posteriores a las filas eliminadas) solo si son ddel mismo nivel?
                let nivelant=actitem.substring(0, actitem.lastIndexOf('.')+1);
                var prefijo2 = itemfila.toString().substring(0, nivelant.length)
                if(nivelant!='' && prefijo2 == nivelant){//comparar con prefijo superior sino break
                  let prefijo1=itemfila.toString().substring(0, actitem.length+1)
                  if(prefijo1!=actitem+'.'){//si es un hijo, no se debe actualizar los items, ya que se eliminaran
                    let separado=itemfila.split('.');
                    let longi = row.item.toString().split('.').length;
                    let nuevonum = Number(separado[longi-1]) -1;
                    separado[longi-1] = nuevonum.toString();
                    this.datasourcePri[i].item=separado.join('.');
                    this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                    this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
                  }
                }
                else{
                  break;
                }
              }
            }
            this.calculartotalpadres(this.arrindprisel[indi]-1);//revisar al eliminar multiple
            //restar los indices de los posteriores porque se elimino
            for(let a=indi+1;a<this.arrindprisel.length;a++){
              if(this.arrindprisel[a]>this.arrindprisel[indi]){
                this.arrindprisel[a]=this.arrindprisel[a]-1;
              }
            }
          }
          if(!corta){
            this.actualizarTemp(6);
            this.toaster.success('La operacion se realizo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          }
          this.mostrar_carga=false;
          //limpiar las selecciones
          if(sellista){
            if(this.colselpri)
              this.HabSelPri();
            else if(this.colselpri2)
              this.HabSelPri2();
            this.colselpri=false;
            this.colselpri2=false;
            this.arrindprisel=[];
          }
          this.cambindiceselpresu(-1);
          return cantfilborra;
        }
        else {
          this.mostrar_carga = false
          this.toaster.error('Seleccione filas para eliminar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          return 0;
        }
      }
    }
    catch (e) {
      this.mostrar_carga = false
      console.log(e)
      return 0;
    }
  }
  getRelInsFila(tabla:any,totalfila:any){
    let tabresult=[];
    for(let b=0;b<tabla.length;b++){
      if(tabla[b].num_det>0){
        const index = tabresult.findIndex(elem => {
          if(elem.operador!='%'){
            if(elem.id_tipo_insumo == tabla[b].id_tipo_insumo && elem.descripcion==tabla[b].descripcion && elem.precio==tabla[b].precio)
            return elem;
          }
          else{//revisar para porcentajes no agrupa?
            if(elem.id_tipo_insumo == tabla[b].id_tipo_insumo && elem.descripcion==tabla[b].descripcion)
              return elem;
          }
        });
        if(index>-1){//si encuentra suma,
          if(tabresult[index].unidad!=''){
            if(tabla[b].operador=='%'){
              let rparc=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(tabla[b].cantpadre)*Number(tabla[b].parcial)),this.dec_parcial);
              tabresult[index].parcial=this.formService.redondeo(Number(rparc),this.dec_parcial);
            }
            else{
              let ropera=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(tabla[b].cantpadre)*Number(tabla[b].parcial)),this.dec_parcial);
              tabresult[index].parcial=Number(ropera);
              tabresult[index].cantidad=tabla[b].unidad!=''?Number(this.formService.redondeo(Number(tabresult[index].parcial)/Number(tabresult[index].precio),this.dec_cant)):tabresult[index].cantidad;
            }
          }
        }
        else{//si no encuentra se agrega
          if(tabla[b].operador=='%'){
            tabla[b].cantidad=0;
            tabla[b].precio=0;
            tabla[b].parcial=this.formService.redondeo(Number(tabla[b].cantpadre)*Number(tabla[b].parcial),this.dec_parcial);
          }
          else{
            let rparc=this.formService.redondeo(Number(tabla[b].cantpadre)*Number(tabla[b].parcial),this.dec_parcial);
            tabla[b].parcial=this.formService.redondeo(Number(rparc),this.dec_parcial);
            let ropera=this.formService.redondeo(Number(tabla[b].parcial)/Number(tabla[b].precio),this.dec_cant);
            tabla[b].cantidad=tabla[b].unidad!=''?Number(ropera):tabla[b].cantidad;
          }
          tabresult.push(tabla[b]);
          tabresult[tabresult.length-1].num_det=tabresult[tabresult.length-1].num_det>0?1:tabresult[tabresult.length-1].num_det;
          tabresult[tabresult.length-1].cuadrilla='';
        }
      }
    }
    //corregir total en % mano obra operador% tipo_insumo1
    let totax=0;
    let indporc=-1;
    let indporc2=-1;
    for(let r1=0;r1<tabresult.length;r1++){
      totax=totax+=Number(tabresult[r1].parcial);
      if(tabresult[r1].operador=='%' && tabresult[r1].tipo_insumo==1 && indporc==-1){
        indporc=r1;
      }
      if(tabresult[r1].operador=='%' && indporc2==-1){
        indporc2=r1;
      }
    }
    let indcor=indporc!=-1?indporc:(indporc2!=-1?indporc2:-1)
    if(indcor>=0){
      tabresult[indcor].parcial=this.formService.redondeo((Number(tabresult[indcor].parcial)+(totalfila-totax)),this.dec_parcial);
    }
    //fin corr
    //parciales agru
    let summano=0;
    let summat=0;
    let sumeq=0;
    let sumsubc=0;
    let sumsubp=0;
    let spsummano=0;
    let spsummat=0;
    let spsumeq=0;
    let spsumsubc=0;
    //calcular sumas, luego agregar agrupaciones 1 sola vez
    for(let m=0;m<tabresult.length;m++){
      if(tabresult[m].unidad!=''){
        if(tabresult[m].id_tipo_insumo=='1'){
          summano+=Number(tabresult[m].parcial);
          if(tabresult[m].operador!='%'){
            spsummano+=Number(tabresult[m].parcial);
          }
        }
        else if(tabresult[m].id_tipo_insumo=='2'){
          summat+=Number(tabresult[m].parcial);
          if(tabresult[m].operador!='%'){
            spsummat+=Number(tabresult[m].parcial);
          }
        }
        else if(tabresult[m].id_tipo_insumo=='3'){
          sumeq+=Number(tabresult[m].parcial);
          if(tabresult[m].operador!='%'){
            spsumeq+=Number(tabresult[m].parcial);
          }
        }
        else if(tabresult[m].id_tipo_insumo=='4'){
          sumsubc+=Number(tabresult[m].parcial);
          if(tabresult[m].operador!='%'){
            spsumsubc+=Number(tabresult[m].parcial);
          }
        }
        else if(tabresult[m].id_tipo_insumo=='5'){
          sumsubp+=Number(tabresult[m].parcial);
        }
      }
    }
    //agregar filas agrupaciones
    let pindice=tabresult.length>0?tabresult[0].indice:null;
    let filamano=this.CrearFilaAgru(pindice,'MANO DE OBRA','1',this.formService.redondeo(summano,this.dec_parcial),1,1);
    tabresult.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'MATERIALES','2',this.formService.redondeo(summat,this.dec_parcial),1,0);
    tabresult.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'EQUIPO','3',this.formService.redondeo(sumeq,this.dec_parcial),1,1);
    tabresult.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'SUB CONTRATOS','4',this.formService.redondeo(sumsubc,this.dec_parcial),1,0);
    tabresult.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'SUB PARTIDAS','5',this.formService.redondeo(sumsubp,this.dec_parcial),0,0);
    tabresult.push(filamano);
    tabresult.sort( (a, b) => {
      if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
      }
      if (a.descripcion < b.descripcion) {
        return -1;
      }
      if (a.descripcion > b.descripcion) {
        return 1;
      }
      return 0;
    });
    for(let row of tabresult){
      if(row.operador=="%"){
        row.precio=row.tipo_insumo=='1'?spsummano:row.tipo_insumo=='2'?spsummat:row.tipo_insumo=='3'?spsumeq:row.tipo_insumo=='4'?spsumsubc:'';
        let precfil=Number(row.precio);
        let parcial=Number(row.parcial);
        row.cantidad=row.precio==0 || row.parcial==0?0:this.formService.redondeo(parcial/precfil,this.dec_cant);
      }
    }
    return tabresult;
  }
  CrearFilaAgru(pindice:any,pdescripcion:any,pid_tipo_insumo:any,pparcial:any,pesinsumo:any,pafcuad:any){
    let filaaux:rowacu={
      id_proyecto:this.id_proyecto,
      indice:pindice,// se debe recuperar el indice del padre
      id_filadetalle:null,
      num_det:0,
      codigo:null/* detpart[a].codigo=='' || detpart[a].codigo==null?null:detpart[a].codigo */,
      descripcion:pdescripcion,
      id_unidad:'',
      unidad:'',
      operador:null,
      tipo_insumo:null,
      cuadrilla:null,
      cantidad:null,
      precio:null,
      parcial:Number(pparcial),
      id_tipo_insumo:Number(pid_tipo_insumo),
      id_indice:null,
      id_clasificacion:null,//revisar valores
      desc_clasi:null,
      id_insumo:null,
      id_subpartida:null,
      indice_subp:null,
      accion:0,
      esinsumo:pesinsumo,
      afcuadrilla:pafcuad,
      rendimiento:null,
      und_rendi:null,
      jornada:null,
      advceros:null,
      referencia:null,
      mostrar:1,
      icomost:1,
      editar:0,
      editar2:0,
      ind:-1,
      seleccion:0,
      asignaund:0,
      zidmodi:null
    };
    return filaaux;
  }
  async cambindiceselpresu(ind: any,compara=false) {//agregar parametro para saber si se va a volver a cargar sin comparar indices
    if (ind != this.filaSel || compara){
      this.filaSel=ind;
      this.filaSelacu=-1;
      if(ind>-1){
        let rowsel=this.datasourcePri[this.filaSel];
        this.formDataPartida.reset({
          item:rowsel.item,
          descripcion:rowsel.descripcion,
          unidad:rowsel.unidad,
          precio:rowsel.precio,
          rendimiento:rowsel.rendimiento,
          undrendimiento:rowsel.und_rendi,
          jornada:rowsel.jornada,
          usuario:rowsel.usuario,
        });
        this.undconcatrendi=rowsel.unidad;
        if(rowsel.unidad=='' && this.edicionacu){
          this.unidad.disable();
          this.rendimiento.disable();
          this.undrendimiento.disable();
          this.jornada.disable();
        }
        else if(rowsel.unidad!='' && this.edicionacu){
          this.unidad.enable();
          this.rendimiento.enable();
          //this.undrendimiento.enable();
          this.jornada.enable();
        }
        if(!this.editajor){
          this.jornada.disable();
        }
        this.tablaacusel=[];
        if(rowsel.unidad!=''){
          this.esgruposel=false;
          if(this.acuxmetrado){//acuxmetrado
            let tabacu=JSON.parse(JSON.stringify(this.datasourcePriacu));
            let tabresult=[];
            for(let b=0;b<tabacu.length;b++){
              if(tabacu[b].indice==rowsel.indice){
                tabacu[b].cantpadre=rowsel.cantidad;
                tabresult.push(tabacu[b]);
              }
            }
            this.tablaacusel=this.getRelInsFila(tabresult,Number(rowsel.parcial));
            this.formDataPartida.get('precio').setValue(this.formService.redondeo(rowsel.parcial,this.dec_parcial));
          }
          else{
            let summano=0;
            let summat=0;
            let sumeq=0;
            let sumsubc=0;
            let sumsubp=0;
            for(let i=0;i<this.datasourcePriacu.length;i++){
              if(this.datasourcePriacu[i].indice == rowsel.indice){
                this.datasourcePriacu[i].ind=i;
                this.datasourcePriacu[i].seleccion=0;
                this.tablaacusel.push(this.datasourcePriacu[i]);
                if(this.datasourcePriacu[i].unidad!=''){
                  if(this.datasourcePriacu[i].id_tipo_insumo=='1'){
                    summano+=Number(this.datasourcePriacu[i].parcial);
                  }
                  else if(this.datasourcePriacu[i].id_tipo_insumo=='2'){
                    summat+=Number(this.datasourcePriacu[i].parcial);
                  }
                  else if(this.datasourcePriacu[i].id_tipo_insumo=='3'){
                    sumeq+=Number(this.datasourcePriacu[i].parcial);
                  }
                  else if(this.datasourcePriacu[i].id_tipo_insumo=='4'){
                    sumsubc+=Number(this.datasourcePriacu[i].parcial);
                  }
                  else if(this.datasourcePriacu[i].id_tipo_insumo=='5'){
                    sumsubp+=Number(this.datasourcePriacu[i].parcial);
                  }
                }
              }
            }
            //agregar filas agrupaciones
            let pindice=this.tablaacusel.length>0?this.tablaacusel[0].indice:null;
            let filamano=this.CrearFilaAgru(pindice,'MANO DE OBRA','1',this.formService.redondeo(summano,this.dec_parcial),1,1);
            this.tablaacusel.push(filamano);
            filamano=this.CrearFilaAgru(pindice,'MATERIALES','2',this.formService.redondeo(summat,this.dec_parcial),1,0);
            this.tablaacusel.push(filamano);
            filamano=this.CrearFilaAgru(pindice,'EQUIPO','3',this.formService.redondeo(sumeq,this.dec_parcial),1,1);
            this.tablaacusel.push(filamano);
            filamano=this.CrearFilaAgru(pindice,'SUB CONTRATOS','4',this.formService.redondeo(sumsubc,this.dec_parcial),1,0);
            this.tablaacusel.push(filamano);
            filamano=this.CrearFilaAgru(pindice,'SUB PARTIDAS','5',this.formService.redondeo(sumsubp,this.dec_parcial),0,0);
            this.tablaacusel.push(filamano);
            this.tablaacusel.sort( (a, b) => {
              if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
              }
              return 0;
            });
            this.CalcRatio();
          }
        }
        else{//listado de insumos de titulo
          this.esgruposel=true;
          this.butselprecio=this.butselprecio=='1'?'2':this.butselprecio;
          let filapart=[];
          let nuevogru=false;
          for (let i=this.filaSel+1;i<this.datasourcePri.length;i++) {
            if (this.datasourcePri[i].item != rowsel.item && !nuevogru) {
              var palabra = this.datasourcePri[i].item.toString().substring(0, rowsel.item.toString().length + 1)
              if (palabra == (rowsel.item + '.')) {
                if(this.datasourcePri[i].unidad!=''){
                  filapart.push(this.datasourcePri[i]);
                }
              }
              else{
                nuevogru=true;
              }
            }
            else{ break; }
          }
          let tabacu=JSON.parse(JSON.stringify(this.datasourcePriacu));
          let tabresult=[];
          for(let fipart of filapart){
            for(let b=0;b<tabacu.length;b++){
              if(tabacu[b].indice==fipart.indice){
                tabacu[b].cantpadre=fipart.cantidad;
                tabresult.push(tabacu[b])
              }
            }
          }
          this.tablaacusel=this.getRelInsFila(tabresult,Number(rowsel.parcial));
          this.formDataPartida.get('precio').setValue(this.formService.redondeo(rowsel.parcial,this.dec_parcial));//cambiar por la suma total?
        }
      }
      else{
        this.formDataPartida.reset({
          item:'',
          descripcion:'',
          unidad:'',
          precio:'',
          rendimiento:'',
          undrendimiento:'',
          jornada:'',
          usuario:'',
          /* selprecio:'1' */
        });
        this.tablaacusel=[];
      }
    }
  }
  async openModal() {
    try {
      if(this.filaSel>-1){
        this.modaldetalle.show();
      }
      else{
        this.toaster.error('Seleccione una fila para ver.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
      
    }
    catch (e){
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo cargar los datos.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      console.log(e);
    }
  }
  cerrarModal() {
    this.modaldetalle.hide();
  }
  cambioExpande(){
    if(this.expanded){
      this.expanded=false; /* this.mostrarModal=false; */
    }
    else{
      this.expanded=true; /* this.mostrarModal=true; */
    }
    let difer=this.solover?680:(1282+(this.cargacomp && this.datasourcePri.length==0 && !this.existetemp && !this.solover?32:0)+
    (!this.vistagrande || this.expanded?32:0));
    if ((document.body.clientWidth <= difer)) {
      this.scrollbut=true;
    }
    else{
      this.scrollbut=false;
    }
    let limmin=!this.vistagrande || this.expanded?991:1125;
    if ((document.body.clientWidth <= limmin)) {
      this.minimbut=true;
    }
    else{
      this.minimbut=false;
    }
  }
  Expandetodo() {//icomost   1 mostrar, 0 ocultar
    if(this.filaSel>-1){
      let row=this.datasourcePri[this.filaSel];
      if(row.unidad==''){
        let itemsel=row.item;
        row.icomost=1;
        let nuevogru=false;
        for (let i=this.filaSel+1;i<this.datasourcePri.length;i++) {
          if (this.datasourcePri[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              this.datasourcePri[i].mostrar = 1;
              this.datasourcePri[i].icomost = 1;
              this.datasourcePri[i].estmost=1;
            }
            else{
              nuevogru=true;
            }
          }
          else{ break; }
        }
      }
    }
  }
  ContraeTodo(){
    if(this.filaSel>-1){
      let row=this.datasourcePri[this.filaSel];
      if(row.unidad==''){
        let inpri = this.filaSel;
        let itemsel=row.item;
        row.icomost=1;
        let nuevogru=false;
        for (let i=inpri+1;i<this.datasourcePri.length;i++) {
          if (this.datasourcePri[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              if(this.datasourcePri[i].item.split('.').length==(itemsel.split('.').length+1)){
                this.datasourcePri[i].mostrar = 1;
                this.datasourcePri[i].icomost = 0;
                this.datasourcePri[i].estmost=1;
              }
              else{
                this.datasourcePri[i].mostrar=0;
                this.datasourcePri[i].icomost = 0;
                this.datasourcePri[i].estmost=0;
              }
            }
            else{
              nuevogru=true;
            }
          }
          else{ break; }
        }
      }
    }
  }
  maxtodo(){
    for (let row of this.datasourcePri) {
      if(row.item.split('.').length>1){
        row.mostrar=1;
      }
      row.icomost = 1;
      row.estmost=1;
    }
  }
  mintodo(){
    for (let row of this.datasourcePri) {
      if(row.item.split('.').length>1){
        //row.estmost=row.mostrar;
        row.mostrar=0;
      }
      else{
        row.icomost=0; row.mostrar=1;
      }
    }
  }
  toggleOnpresu(itemsel, indice) {//icomost   1 mostrar, 0 ocultar
    let pila=[];//objetos{ item, icomost }
    this.datasourcePri[indice].icomost=1;
    let nuevogru=false;
    for (let i=indice+1;i<this.datasourcePri.length;i++) {
      if (this.datasourcePri[i].item != itemsel && !nuevogru) {
        var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.datasourcePri[i].item.toString().split('.').length){
            this.datasourcePri[i].mostrar=1;
            this.datasourcePri[i].estmost=1;
            if(this.datasourcePri[i].unidad==''){
              pila.push({item:this.datasourcePri[i].item,icomost:this.datasourcePri[i].icomost});
            }
          }
          else{
            var palabra2 = this.datasourcePri[i].item.toString().substring(0, this.datasourcePri[i].item.lastIndexOf('.'))
            let fila1=pila.find(ele=>ele.item==palabra2);
            this.datasourcePri[i].mostrar=fila1.icomost==0?0:this.datasourcePri[i].estmost;
            if(this.datasourcePri[i].unidad==''){
              pila.push({item:this.datasourcePri[i].item,icomost:fila1.icomost==0?0:this.datasourcePri[i].icomost});
            }
          }
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  toggleOffpresu(itemsel, indice) {
    this.datasourcePri[indice].icomost = 0;
    let ind2 = indice+1;
    let nuevogru=false;
    for (let i=ind2;i<this.datasourcePri.length;i++) {
      if (this.datasourcePri[i].item != itemsel  && !nuevogru) {
        var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.datasourcePri[i].item.toString().split('.').length){
            this.datasourcePri[i].estmost=0;
          }
          this.datasourcePri[i].mostrar=0;
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  //editar columna descripcion
  async EditarDesc(ind:any){
    if(!this.solover){
      this.datasourcePri[ind].editar1 = 1;
    }
  }
  caneditarDesc(eve: any, ind2: any) {
    var valor = eve.toString();
    var actual = this.datasourcePri[ind2].descripcion;
    this.datasourcePri[ind2].editar1 = 0;
    if (valor !== actual) {
      this.datasourcePri[this.filaSel].descant=actual;
      this.datasourcePri[ind2].descripcion=valor.toUpperCase();
      this.datasourcePri[ind2].vinculo=null;
      this.descripcion.setValue(valor.toUpperCase());
      this.ActfilCambios(this.datasourcePri[ind2].accion==1?this.inserta:this.modifica,this.datasourcePri[ind2]);
      this.actualizarTemp(8);
    }
  }
  presenterDesc(event:any,ind2:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarDesc(this.datasourcePri[ind2].descripcion,ind2)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind2 + 1 < this.datasourcePri.length) {//condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
          if(this.datasourcePri[i].mostrar==1){
            event.target.blur();
            this.datasourcePri[i].editar1 = 1;
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind2 - 1 >= 0) {//condicion para mover el editar a la siguiente fila con editar
        for (let i = ind2 - 1; i >= 0; i--) {
          if(this.datasourcePri[i].mostrar==1){
            event.target.blur();
            this.datasourcePri[i].editar1 = 1;
            break;
          }
        }
      }
    }
  }
  //editar columna cantidad
  EditarCant(ind:any){
    if(!this.solover){
      this.datasourcePri[ind].editar2 = 1;
    }
  }
  async caneditarCant(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.datasourcePri[ind2].cantidad)
    var aprecio = Number(this.datasourcePri[ind2].precio);
    this.datasourcePri[ind2].editar2 = 0;
    if (valor != actual) {
      this.datasourcePri[ind2].cantidad=Number(this.formService.redondeo(valor, this.dec_metrado));
      this.datasourcePri[ind2].parcial=Number(this.formService.redondeo((valor * aprecio), this.dec_parcial));
      this.datasourcePri[ind2].ed_pre=1;
      this.ActfilCambios(this.datasourcePri[ind2].accion==1?this.inserta:this.modifica,this.datasourcePri[ind2]);
      this.calculartotalpadres(ind2);
      this.actualizarTemp(9);
      if(this.acuxmetrado){
        this.cambindiceselpresu(this.filaSel,true)
      }
    }
  }
  calculartotal(valor:any,anterior:any,ind:any){//no se usa
    var aritem=this.datasourcePri[ind].item.split('.');
    var resto=valor-anterior;
    let i=aritem.length-1;
    let titem="";
    let tamaño=0;
    //agrupaciones de parciales
    while(i>0){
      tamaño=tamaño+aritem[i].length+1;
      titem=this.datasourcePri[ind].item.substring(0,this.datasourcePri[ind].item.length-tamaño)
      for(let j=0;j<this.datasourcePri.length;j++){
        if(this.datasourcePri[j].item==titem)
        {
          var tot=Number(this.datasourcePri[j].parcial);
          this.datasourcePri[j].parcial=this.formService.redondeo((tot+resto),this.dec_parcial);
          this.ActfilCambios(this.datasourcePri[j].accion==1?this.inserta:this.modifica,this.datasourcePri[j]);
          break;
        }
      }
      titem=titem+".";
      i--;
    }
  }
  calculartotalpadres(ind:any){
    var aritem=this.datasourcePri[ind].item.split('.');
    let i=aritem.length-1;
    let titem="";
    let tamaño=0;
    //agrupaciones de parciales
    if(this.datasourcePri[ind].unidad==''){
      titem=this.datasourcePri[ind].item;
      let indgru=-1;
      let sumgru=0;
      for(let j=0;j<this.datasourcePri.length;j++){
        if(this.datasourcePri[j].item==titem)
        {
          indgru=j;
        }
        else{//sumar los siguientes hasta encontrar uno diferente y break
          if(indgru>-1){
            var palabra = this.datasourcePri[j].item.toString().substring(0, titem.length+1);
            if(titem+'.'==palabra){
              if(titem.split('.').length+1==this.datasourcePri[j].item.split('.').length){
                sumgru+=Number(this.datasourcePri[j].parcial);
              }
            }
            else{
              break;
            }
          }
        }
      }
      this.datasourcePri[indgru].parcial=this.formService.redondeo(sumgru,this.dec_parcial);
      this.ActfilCambios(this.datasourcePri[indgru].accion==1?this.inserta:this.modifica,this.datasourcePri[indgru]);
    }
    while(i>0){
      tamaño=tamaño+aritem[i].length+1;
      titem=this.datasourcePri[ind].item.substring(0,this.datasourcePri[ind].item.length-tamaño)
      let indgru=-1;
      let sumgru=0;
      for(let j=0;j<this.datasourcePri.length;j++){
        if(this.datasourcePri[j].item==titem)
        {
          indgru=j;
        }
        else{//sumar los siguientes hasta encontrar uno diferente y break
          if(indgru>-1){
            var palabra = this.datasourcePri[j].item.toString().substring(0, titem.length+1);
            if(titem+'.'==palabra){
              if(titem.split('.').length+1==this.datasourcePri[j].item.split('.').length){
                sumgru+=Number(this.datasourcePri[j].parcial);
              }
            }
            else{
              break;
            }
          }
        }
      }
      this.datasourcePri[indgru].parcial=this.formService.redondeo(sumgru,this.dec_parcial);
      this.ActfilCambios(this.datasourcePri[indgru].accion==1?this.inserta:this.modifica,this.datasourcePri[indgru]);
      titem=titem+".";
      i--;
    }
  }
  presenterCant(event:any,ind2:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarCant(this.datasourcePri[ind2].cantidad,ind2)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind2 + 1 < this.datasourcePri.length) {
        for (let i = ind2 + 1; i < this.datasourcePri.length; i++) {
          if (this.datasourcePri[i].unidad != '' && this.datasourcePri[i].mostrar==1) {
            event.target.blur();
            this.datasourcePri[i].editar2 = 1;
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind2 - 1 >= 0) {
        for (let i = ind2 - 1; i >= 0; i--) {
          if (this.datasourcePri[i].unidad != '' && this.datasourcePri[i].mostrar==1) {
            event.target.blur();
            this.datasourcePri[i].editar2 = 1;
            break;
          }
        }
      }
    }
  }
  async SubirFila(){
    try{
      if(this.filaSel>-1){
        let indpri=this.filaSel;
        let agrufila=this.datasourcePri[indpri].item;
        let arragrufila=agrufila.split('.');
        let numsubir=Number(arragrufila[arragrufila.length-1]);
        if(numsubir!=1){
          //this.mostrar_carga_todo=true;
          let itemant='';
          let indinicam=-1;
          for(let j=0;j<arragrufila.length;j++){
            if(j<arragrufila.length-1){
              itemant+=arragrufila[j]+'.';
            }
          }
          itemant+=numsubir-1;
          let filasbaja=[];
          let filassube=[];
          for(let i=indpri;i<this.datasourcePri.length;i++){
            let filact=this.datasourcePri[i];
            if((agrufila+".") == filact.item.toString().substring(0, agrufila.toString().length + 1)){
              filassube.push(filact)
            }
            else if(agrufila==filact.item){
              filassube.push(filact)
            }
            else{ break; }
          }
          for(let i=indpri-1;i>=0;i--){
            let filact=this.datasourcePri[i];
            if((itemant+".") == filact.item.toString().substring(0, itemant.toString().length + 1)){
              filasbaja.unshift(filact)
            }
            else if(itemant==filact.item){
              indinicam =i;
              filasbaja.unshift(filact)
            }
            else{ 
              indinicam=indinicam==-1?this.filaSel:indinicam;
              break; }
          }
          this.filaSel=indinicam;
          for(let k=0;k<filassube.length;k++){
            let itemsact = filassube[k].item.split('.');
            itemsact[arragrufila.length-1] = (numsubir-1).toString();
            filassube[k].item = itemsact.join('.');
            filassube[k].itemord=this.GenerarItemord(itemsact.join('.'))
            this.datasourcePri[indinicam]=filassube[k];
            this.ActfilCambios(this.datasourcePri[indinicam].accion==1?this.inserta:this.modifica,this.datasourcePri[indinicam]);
            indinicam++;
          }
          for(let k=0;k<filasbaja.length;k++){
            let itemsact = filasbaja[k].item.split('.');
            itemsact[arragrufila.length-1] = (numsubir).toString();
            filasbaja[k].item = itemsact.join('.');
            filasbaja[k].itemord = this.GenerarItemord(itemsact.join('.'));
            this.datasourcePri[indinicam]=filasbaja[k];
            this.ActfilCambios(this.datasourcePri[indinicam].accion==1?this.inserta:this.modifica,this.datasourcePri[indinicam]);
            indinicam++;
          }
          this.cambindiceselpresu(this.filaSel,true);
          this.actualizarTemp(10);
        }
        else{
          this.toaster.error('La fila ya no puede subir.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione una fila para subir.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      console.log(e)
    }
  }
  async BajarFila(){
    try{
      if(this.filaSel>-1){
        let indpri=this.filaSel;
        let agrufila=this.datasourcePri[indpri].item;
        let arragrufila=agrufila.split('.');
        let numbajar=Number(arragrufila[arragrufila.length-1]);
        let final=this.datasourcePri.length==indpri?true:false;
        let existesiguiente=false;
        for(let i=indpri+1;i<this.datasourcePri.length;i++){
          let agruact=this.datasourcePri[i].item;
          let arragruact=agruact.split('.');
          if(arragruact.length<arragrufila.length){
            break;
          }
          else if(arragruact.length==arragrufila.length){
            existesiguiente=true;
            break;
          }
        }
        if(!final && existesiguiente){
          let itemsig='';
          let indinicam=indpri;
          for(let j=0;j<arragrufila.length;j++){
            if(j<arragrufila.length-1){
              itemsig+=arragrufila[j]+'.';
            }
          }
          itemsig+=numbajar+1;
          let filasbaja=[];
          let filassube=[];
          let indbusqsig=-1;
          for(let i=indpri;i<this.datasourcePri.length;i++){
            let filact=this.datasourcePri[i];
            if((agrufila+".") == filact.item.toString().substring(0, agrufila.toString().length + 1)){
              filasbaja.push(filact)
            }
            else if(agrufila==filact.item){
              filasbaja.push(filact)
            }
            else{ 
              indbusqsig=i;
              break;
            }
          }
          for(let i=indbusqsig;i<this.datasourcePri.length;i++){
            let filact=this.datasourcePri[i];
            if((itemsig+".") == filact.item.toString().substring(0, itemsig.toString().length + 1)){
              filassube.push(filact)
            }
            else if(itemsig==filact.item){
              filassube.push(filact)
            }
            else{ break; }
          }
          for(let k=0;k<filassube.length;k++){
            let itemsact = filassube[k].item.split('.');
            itemsact[arragrufila.length-1] = (numbajar).toString();
            filassube[k].item = itemsact.join('.');
            filassube[k].itemord=this.GenerarItemord(itemsact.join('.'))
            this.datasourcePri[indinicam]=filassube[k];
            this.ActfilCambios(this.datasourcePri[indinicam].accion==1?this.inserta:this.modifica,this.datasourcePri[indinicam]);
            indinicam++;
          }
          this.filaSel=indinicam;
          for(let k=0;k<filasbaja.length;k++){
            let itemsact = filasbaja[k].item.split('.');
            itemsact[arragrufila.length-1] = (numbajar+1).toString();
            filasbaja[k].ind=indinicam;
            filasbaja[k].ind2=indinicam;
            filasbaja[k].item = itemsact.join('.');
            filasbaja[k].itemord = this.GenerarItemord(itemsact.join('.'));
            this.datasourcePri[indinicam]=filasbaja[k];
            this.ActfilCambios(this.datasourcePri[indinicam].accion==1?this.inserta:this.modifica,this.datasourcePri[indinicam]);
            indinicam++;
          }
          this.cambindiceselpresu(this.filaSel,true);
          this.actualizarTemp(11);
        }
        else{
          this.toaster.error('La fila ya no puede bajar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione una fila para bajar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      console.log(e)
    }
  }
  async MovIzqui(){
    try{
      if(this.filaSel>-1){
        let arrcomp=[];
        let arrmov=[];
        let arract=[];
        let arrsig=[];
        let nitem='';
        let itemsel=this.datasourcePri[this.filaSel].item;
        let arritemsel=itemsel.split('.');
        if(arritemsel.length>1){
          let superior='';
          for(let i=0;i<arritemsel.length-2;i++){//verificar hasta que punto puede moverse a la izquierda, de 1.1.3 -> 1.  al menos longitud 3, si es longitud 1 no se puede, si es longitud 2 se actualiza todo
            superior=superior+arritemsel[i]+".";
          }
          let indactparc=-1;
          if(superior!=''){//si es vacio se intenta convertir a titulo
            let difer=false;
            let encontrado=false;
            for(let m=0;m<this.datasourcePri.length;m++){
              if(!difer || !encontrado){
                var palabra = this.datasourcePri[m].item.toString().substring(0, superior.length)
                if (palabra == superior) {
                  arrcomp.push(this.datasourcePri[m]);
                  encontrado=true;
                }
                else{
                  if(encontrado){
                    difer=true;
                  }
                }
                if(this.datasourcePri[m].item==itemsel.substring(0, itemsel.lastIndexOf('.'))){
                  indactparc=m;
                }
              }
              else{ break; }
            }
            arrcomp=JSON.parse(JSON.stringify(arrcomp));
          }
          else{//mover subtitulo a titulo
            let tipofila=this.datasourcePri[this.filaSel].unidad!=''?0:1;//0 es partida,1 es titulo o subtitulo
            if(tipofila==1){
              const respu=await SwalService.confirm('Esta seguro que desea convertir a titulo?','La operación puede tardar en finalizar.');
              if(respu.isConfirmed){
                this.datasourcePri[this.filaSel].tipofila=0;
                arrcomp=JSON.parse(JSON.stringify(this.datasourcePri));
                for(let m=0;m<this.datasourcePri.length;m++){
                  if(this.datasourcePri[m].item==itemsel.substring(0, itemsel.lastIndexOf('.'))){
                    indactparc=m;
                    break;
                  }
                }
              }
              else{ return; }
            }
            else{
              this.toaster.error('La partida ya no se puede mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
              return;
            }
          }
          //buscar parametros
          let exitmover=false;
          for(let a=0;a<arrcomp.length;a++){
            var prefijo = arrcomp[a].item.toString().substring(0, itemsel.length+1)
            if(arrcomp[a].item == itemsel){
              arrmov.push(arrcomp[a]);
              exitmover=true;
            }
            else if (prefijo == (itemsel+".")) {
              arrmov.push(arrcomp[a]);
            }
            else{
              if(exitmover){//revisar comparaciones
                let nivelant=itemsel.substring(0, itemsel.lastIndexOf('.')+1);
                var prefijo2 = arrcomp[a].item.toString().substring(0, nivelant.length)
                if(prefijo2 == nivelant){
                  arract.push(arrcomp[a]);
                }
                else{
                  arrsig.push(arrcomp[a]);
                }
              }
            }
          }
          //buscar el anterior nitem
          let nnum=Number(arritemsel[arritemsel.length-2])+1;
          for(let i=0;i<arritemsel.length-2;i++){//verificar hasta que punto puede moverse a la izquierda, de 1.1.3 -> 1.  al menos longitud 3, si es longitud 1 no se puede, si es longitud 2 se actualiza todo
            nitem=nitem+arritemsel[i]+".";
          }
          nitem=nitem+nnum.toString();
          //actualizar items
          for(let i = 0; i < arrmov.length; i++)//reemplazar prefijo por item nuevo
          {
            if (arrmov[i].item == itemsel)
            {
              arrmov[i].item=nitem;
              arrmov[i].itemord=this.GenerarItemord(nitem);
            }
            else
            {
              let agrufila = arrmov[i].item;
              let itempasa = nitem + agrufila.substring(itemsel.length);
              let itemord = this.GenerarItemord(itempasa);
              arrmov[i].item=itempasa;
              arrmov[i].itemord=itemord;
            }
          }
          let tamelim = itemsel.split('.').length;
          for(let j = 0; j < arract.length; j++)
          {
            let itemsact = arract[j].item.toString().split('.');
            itemsact[tamelim - 1] = (Number(itemsact[tamelim - 1]) - 1).toString();
            arract[j].item=itemsact.join('.');
            arract[j].itemord=this.GenerarItemord(itemsact.join('.'));
          }
          for(let j = 0; j < arrsig.length; j++)
          {
            let itemsact = arrsig[j].item.toString().split('.');
            itemsact[tamelim - 2] = (Number(itemsact[tamelim - 2]) + 1).toString();
            arrsig[j].item=itemsact.join('.');
            arrsig[j].itemord=this.GenerarItemord(itemsact.join('.'));
          }
          //actualizar filas en la tabla
          let indmovact=this.filaSel;
          for(let row of arract){
            row.ind=indmovact;
            row.ind2=indmovact;
            this.datasourcePri[indmovact]=row;
            this.ActfilCambios(this.datasourcePri[indmovact].accion==1?this.inserta:this.modifica,this.datasourcePri[indmovact]);
            indmovact++;
          }
          this.filaSel=indmovact;
          for(let row of arrmov){
            row.ind=indmovact;
            row.ind2=indmovact;
            this.datasourcePri[indmovact]=row;
            this.ActfilCambios(this.datasourcePri[indmovact].accion==1?this.inserta:this.modifica,this.datasourcePri[indmovact]);
            indmovact++;
          }
          for(let row of arrsig){
            row.ind=indmovact;
            row.ind2=indmovact;
            this.datasourcePri[indmovact]=row;
            this.ActfilCambios(this.datasourcePri[indmovact].accion==1?this.inserta:this.modifica,this.datasourcePri[indmovact]);
            indmovact++;
          }
          this.cambindiceselpresu(this.filaSel,true);
          if(indactparc>-1){
            this.calculartotalpadres(indactparc);
          }
          this.actualizarTemp(12);
        }
        else{
          this.toaster.error('Un Titulo no se puede mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      console.log(e)
    }
  }
  async MovDerec(){
    try{
      if(this.filaSel>-1){
        let arrcomp=[];
        let arrmov=[];
        let arract=[];
        let nitem='';
        let itemsel=this.datasourcePri[this.filaSel].item;
        let superior=itemsel.substring(0,itemsel.lastIndexOf('.')+1);//vacio si es titulo(1er nivel), 1. o 1.1.
        let numant=Number(itemsel.substring(itemsel.lastIndexOf('.')+1,itemsel.length))-1;
          let itant=superior+numant.toString();
        if(numant>0){
          if(superior!=''){//subtitulos
            let difer=false;
            let encontrado=false;
            for(let row of this.datasourcePri){
              if(!difer || !encontrado){
                var palabra = row.item.toString().substring(0, superior.length)
                if (palabra == superior) {
                  arrcomp.push(row);
                  encontrado=true;
                }
                else{
                  if(encontrado){
                    difer=true;
                  }
                }
              }
              else{ break; }
            }
            arrcomp=JSON.parse(JSON.stringify(arrcomp));
          }
          else{//mover derecha un titulo
            const respu=await SwalService.confirm('Esta seguro que desea mover un titulo?','La operación puede tardar en finalizar.');
            if(respu.isConfirmed){
              this.datasourcePri[this.filaSel].tipofila=1;
              arrcomp=JSON.parse(JSON.stringify(this.datasourcePri));
            }
            else { return; }
          }
        }
        else{
          this.toaster.error('No se puede mover a la derecha.No se encontro un item superior al que pueda pertenecer.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          return;
        }
        //buscar parametros
        let supespartida=false;
        let exitmover=false;
        for(let a=0;a<arrcomp.length;a++){
          if(arrcomp[a].item==itant){//el item anterior no puede ser partida
            if(arrcomp[a].unidad!=''){
              supespartida=true;
              break;
            }
          }
          var prefijo = arrcomp[a].item.toString().substring(0, itemsel.length+1)
          if(arrcomp[a].item == itemsel){
            //buscar el anterior nitem
            let arragruant=arrcomp[a-1].item.split('.');
            let nnum=itemsel.split('.').length==arragruant.length?1:Number(arragruant[itemsel.split('.').length])+1;
            nitem=itant+"."+nnum.toString();
            arrmov.push(arrcomp[a]);
            exitmover=true;
          }
          else if (prefijo == (itemsel+".")) {
            arrmov.push(arrcomp[a]);
          }
          else{
            if(exitmover){
              arract.push(arrcomp[a]);
            }
          }
        }
        if(!supespartida){
          let indmovact=this.filaSel;
          for(let i=0;i<arrmov.length;i++){
            if (arrmov[i].item == itemsel)
            {
              arrmov[i].item=nitem;
              arrmov[i].itemord=this.GenerarItemord(nitem);
              this.datasourcePri[indmovact]=arrmov[i];
              this.ActfilCambios(this.datasourcePri[indmovact].accion==1?this.inserta:this.modifica,this.datasourcePri[indmovact]);
            }
            else
            {
              let agrufila = arrmov[i].item;
              let itempasa = nitem + agrufila.substring(itemsel.length);
              let itemord = this.GenerarItemord(itempasa);
              arrmov[i].item=itempasa;
              arrmov[i].itemord=itemord;
              this.datasourcePri[indmovact]=arrmov[i];
              this.ActfilCambios(this.datasourcePri[indmovact].accion==1?this.inserta:this.modifica,this.datasourcePri[indmovact]);
            }
            indmovact++;
          }
          for(let j=0;j<arract.length;j++){
            let tamelim = itemsel.split('.').length;
            let itemsact = arract[j].item.toString().split('.');
            itemsact[tamelim - 1] = (Number(itemsact[tamelim - 1]) - 1).toString();
            arract[j].item=itemsact.join('.');
            arract[j].itemord=this.GenerarItemord(itemsact.join('.'));
            this.datasourcePri[indmovact]=arract[j];
            this.ActfilCambios(this.datasourcePri[indmovact].accion==1?this.inserta:this.modifica,this.datasourcePri[indmovact]);
            indmovact++;
          }
          this.cambindiceselpresu(this.filaSel,true);
          this.calculartotalpadres(this.filaSel);
          this.actualizarTemp(13);
        }
        else{
          this.toaster.error('No se puede mover a la derecha.El item superior es una partida.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      console.log(e)
    }
  }
  Copiar(){
    this.filacopia=[];
    this.cortar=false;
    if(this.colselpri || this.colselpri2){
      if(this.arrprisel.length>0){
        this.arrpricopia=this.arrprisel;
        this.toaster.info('La selección esta lista para pegar.', '', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
      else{
        this.toaster.error('Seleccione filas para Copiar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    else{
      if(this.filaSel>-1){//fila 0 es fila que condiciona como pegar
        let itemsel=this.datasourcePri[this.filaSel].item;
        if(this.datasourcePri[this.filaSel].tipofila!='0'){
          for(let i=this.filaSel;i<this.datasourcePri.length;i++){
            var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
            if (palabra == itemsel) {
              if(!this.datasourcePri[i].tipofila){
                this.datasourcePri[i].tipofila=this.datasourcePri[i].unidad!=''?2:(this.datasourcePri[i].item.split('.').length==1?0:1);
              }
              this.filacopia.push(JSON.parse(JSON.stringify(this.datasourcePri[i])));
            }
            else{ break; }
          }
          this.toaster.info('La selección esta lista para pegar.', '', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        else{
          this.toaster.error('No se puede copiar un titulo.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione una fila para Copiar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
  }
  Cortar(){
    this.filacopia=[];
    this.cortar=true;
    if(this.colselpri || this.colselpri2){
      if(this.arrprisel.length>0){
        this.arrpricopia=this.arrprisel;
        this.toaster.info('La selección esta lista para pegar.', '', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
      else{
        this.toaster.error('Seleccione filas para Copiar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    else{
      if(this.filaSel>-1){//fila 0 es fila que condiciona como pegar
        let itemsel=this.datasourcePri[this.filaSel].item;
        this.indselcorta=this.filaSel;
        if(this.datasourcePri[this.filaSel].tipofila!='0'){
          for(let i=this.filaSel;i<this.datasourcePri.length;i++){
            var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
            if (palabra == itemsel) {
              if(!this.datasourcePri[i].tipofila){
                this.datasourcePri[i].tipofila=this.datasourcePri[i].unidad!=''?2:(this.datasourcePri[i].item.split('.').length==1?0:1);
              }
              this.filacopia.push(JSON.parse(JSON.stringify(this.datasourcePri[i])));
            }
            else{ break; }
          }
          this.toaster.info('La selección esta lista para pegar.', '', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        else{
          this.toaster.error('No se puede copiar un titulo.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione una fila para Copiar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
  }
  PegarBut(){
    if(this.filaSel>-1){
      let rowsel=this.datasourcePri[this.filaSel];
      if(rowsel.unidad==''){ this.Pegar(1) }
      else{ this.Pegar(3) }
    }
    else{
      this.toaster.error('Seleccione una fila para pegar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
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
  async Pegar(donde:any){//agregar una ventana con opciones de pegado sobre, bajo seleccion, inicio fin grupo?
    try{
      if(this.filaSel>-1){
        let sellista=this.colselpri || this.colselpri2?true:false;
        if((!sellista && this.filacopia.length>0) || (sellista && this.arrpricopia.length>0)){//condicionar opciones, se hara un splice y push para agregar los nuevos, tambien se agregaran los detalles
          let itemsel=this.filaSel>-1?this.datasourcePri[this.filaSel].item:"NULL";
          let itemini='';
          let indins=-1;
          let indini=-1;
          let nindsel=-1;
          let arragrega=sellista?this.arrpricopia:this.filacopia;
          let resta=false;
          for(let a=0;a<arragrega.length;a++){//ordenar grupos
            let itemact=arragrega[a].item.toString();
            let arrit=itemact.split('.');
            if(a==0){
              let itemnode:nodoitem={ nro:this.arrordenar.length+1, item:arragrega[a].item, hijos:[] };
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
                  item:arragrega[a].item,
                  hijos:[]
                };
                nodopadre.hijos.push(itemnode);
              }
              else{
                let itemnode:nodoitem={
                  nro:this.arrordenar.length+1,
                  item:arragrega[a].item,
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
          for(let n=0;n<arragrega.length;n++){
            arragrega[n].item=arritord[n];
          }
          //fin ordenar grupos
          let increm=sellista?this.arrordenar.length:1;
          if(donde=='0'){//inicio
            if(this.datasourcePri[this.filaSel].unidad==''){
              itemini=itemsel+".1";
              indins=this.filaSel+1;
              for(let i=indins;i<this.datasourcePri.length;i++){
                var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
                if (palabra == itemsel) {
                  let separado = this.datasourcePri[i].item.toString().split('.');
                  let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                  let nuevonum = Number(separado[longi]) + increm;/* 1 */
                  separado[longi] = nuevonum.toString();
                  this.datasourcePri[i].item=separado.join('.');
                  this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                  this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
                }//desde la fila seleccionada
                else{
                  break;
                }
              }
              indini=indins;
            }
            else{
              this.toaster.error('No se puede pegar con la opcion seleccionada.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
              return;
            }
          }
          else if(donde=='1'){//fin
            if(this.datasourcePri[this.filaSel].unidad==''){
              let encuentra=false;
              for(let i=this.filaSel+1;i<this.datasourcePri.length;i++){
                var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
                if (palabra != itemsel) {
                  encuentra=true;
                  if(i-1==this.filaSel){
                    itemini=itemsel+".1";
                  }
                  else{
                    let arrit=this.datasourcePri[i-1].item.split('.');
                    let nuevit='';
                    for(let a=0;a<itemsel.split('.').length+1;a++){
                      nuevit+=arrit[a]+'.';
                    }
                    itemini=this.sigitem(nuevit.substring(0,nuevit.length-1));
                  }
                  indins=i;
                  break;
                }
              }
              if(!encuentra){
                indins=this.datasourcePri.length;
                let arrit=this.datasourcePri[indins-1].item.split('.');
                let nuevit='';
                for(let a=0;a<itemsel.split('.').length+1;a++){
                  nuevit+=arrit[a]+'.';
                }
                itemini=this.datasourcePri.length-1==this.filaSel?itemsel+".1":this.sigitem(nuevit.substring(0,nuevit.length-1));
              }
              indini=indins;
            }
            else{
              this.toaster.error('No se puede pegar con la opcion seleccionada.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
              return;
            }
          }
          else if(donde=='2'){//sobre
            let tipofi=this.datasourcePri[this.filaSel].unidad!=''?2:(this.datasourcePri[this.filaSel].item.split('.').length==1?0:1);
            if(tipofi==1 || tipofi==2){
              itemini=itemsel;
              indins=this.filaSel;
              let indpri=this.filaSel;
              let condicion=itemsel.substring(0,itemsel.lastIndexOf('.')+1);//vacio si es titulo(1er nivel), 1. o 1.1.
              for(let i=indpri;i<this.datasourcePri.length;i++){
                var palabra = this.datasourcePri[i].item.toString().substring(0, condicion.length)
                if (palabra === condicion) {
                  var prefijo = this.datasourcePri[i].item.toString().substring(0, itemsel.length+1)
                    let separado = this.datasourcePri[i].item.toString().split('.');
                    let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                    let nuevonum = Number(separado[longi - 1]) + increm;/* 1 */
                    separado[longi - 1] = nuevonum.toString();
                    this.datasourcePri[i].item=separado.join('.');
                    this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                    this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
                }
                else{ break; }
              }
              indini=indins;
            }
            else{
              this.toaster.error('No se puede pegar con la opcion seleccionada.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
              return;
            }
          }
          else if(donde=='3'){//bajo
            let tipofi=this.datasourcePri[this.filaSel].unidad!=''?2:(this.datasourcePri[this.filaSel].item.split('.').length==1?0:1);
            if(tipofi==1 || tipofi==2){
              itemini=this.sigitem(itemsel);//buscar el item inicial para agregar
              let indpri=this.filaSel;
              let enco=false;
              let condicion=itemsel.substring(0,itemsel.lastIndexOf('.')+1);//vacio si es titulo(1er nivel), 1. o 1.1.
              let encuentra=false;
              for(let i=indpri;i<this.datasourcePri.length;i++){
                var palabra = this.datasourcePri[i].item.toString().substring(0, condicion.length)
                if (palabra === condicion) {
                  var prefijo = this.datasourcePri[i].item.toString().substring(0, itemsel.length+1)
                  if(this.datasourcePri[i].item != itemsel && prefijo!=(itemsel+'.')){
                    if(!enco){
                      encuentra=true;
                      indins=i;
                      enco=true;
                    }
                    let separado = this.datasourcePri[i].item.toString().split('.');
                    let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                    let nuevonum = Number(separado[longi - 1]) + increm;/* 1 */
                    separado[longi - 1] = nuevonum.toString();
                    this.datasourcePri[i].item=separado.join('.');
                    this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                    this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
                  }
                }//desde la fila seleccionada
                else{
                  if(indins==-1){
                    encuentra=true;
                    indins=i;
                  }
                  break;
                }
              }
              if(!encuentra){
                indins=this.datasourcePri.length;
              }
              indini=indins;
            }
            else{
              this.toaster.error('No se puede pegar con la opcion seleccionada.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
              return;
            }
          }
          //agregar las filas 
          let itemgru='';
          let cantresta=0;
          for(let filaadd of arragrega){
            let newindice=this.ultindice++;
            //condicionar si pertenece a un grupo o no para poner siguiente item?
            let itemnuevo=itemini;
            if(itemgru==''){
              itemgru=filaadd.item;
            }
            else{
              var palabra = itemgru==filaadd.item?filaadd.item+'.':filaadd.item.toString().substring(0, itemgru.toString().length + 1);
              if(itemgru+'.'==palabra){
                itemnuevo=itemini+filaadd.item.substring(itemgru.length,filaadd.item.length-itemgru.length+1);
              }
              else{
                itemini=this.sigitem(itemini);
                itemgru=filaadd.item;
                itemnuevo=itemini;
              }
            }
            nindsel=nindsel>=0?nindsel:newindice;
            let filaagrega=this.nuevafilapri(newindice,itemnuevo,filaadd.descripcion,filaadd.id_unidad,filaadd.unidad,filaadd.unidad!=''?filaadd.cantidad:null,filaadd.precio,filaadd.parcial,filaadd.rendimiento,filaadd.und_rendi,
              filaadd.jornada,filaadd.referencia,filaadd.id_partida,filaadd.advceros,filaadd.tipofila==2?2:1,1,1,this.id_userproy,filaadd.descant);
            this.datasourcePri.splice(indins++,0,filaagrega);
            this.inserta.push(filaagrega);
            if(indini<this.indselcorta){
              this.indselcorta++;
              resta=true;
            }
            for(let m=0;m<this.arrindprisel.length;m++){
              if(indini<this.arrindprisel[m]){
                this.arrindprisel[m]=this.arrindprisel[m]+1;//mayor suma
                resta=true;
              }
            }
            //agregar detalle de partidas
            if(filaagrega.unidad!=''){
              this.AgregaDetAcu(filaadd,newindice,0);
            }
          }
          if(this.cortar){
            let copindi=JSON.parse(JSON.stringify(this.arrindprisel));
            if(copindi.length>0){
              for(let m=0;m<copindi.length;m++){
                if(indini>copindi[m]){
                  cantresta++;//menor resta
                }
              }
            }
            else{
              if(indini>this.filaSel){
                cantresta=1;
                //this.indselcorta++;
              }
            }
            let fileli=await this.EliminarFila(true);
          }
          for(let m=0;m<this.datasourcePri.length;m++){
            if(this.datasourcePri[m].indice==nindsel){
              indini=m;
              break;
            }
          }
          if(indini<this.datasourcePri.length){
            this.calculartotalpadres(indini);//crear metodo para volver a calcular los totales de sus padres, probar con seleccion multiple
          }
          this.cambindiceselpresu(indini)
          this.actualizarTemp(17);
          this.arrordenar=[];
          this.arrpricopia=[];
          this.filacopia=[];
          this.cortar=false;
          this.toaster.success('La operacion se realizo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          if(sellista){
            if(this.colselpri)
              this.HabSelPri();
            else if(this.colselpri2)
              this.HabSelPri2();
          }
        }
        else{
          this.toaster.error('Seleccione una fila y haga clic en Copiar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione una fila destino para Pegar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch(e){
      console.log(e)
    }
  }
  ActfilCambios(arrmodi:any,rowpri:any){
    let eximodi=false;//actualizar en arreglo si existe
    for(let a=0;a<arrmodi.length;a++){
      if(rowpri.indice==arrmodi[a].indice){
        arrmodi[a]=rowpri;
        eximodi=true;
      }
    }
    if(!eximodi){
      arrmodi.push(rowpri);
    }
  }
  AgregaDetAcu(filaadd,newindice,tipo){//tipo 0:acu, 1:subpartidas
    if(tipo==0){
      for(let rowd of this.datasourcePriacu){
        let filacop=JSON.parse(JSON.stringify(rowd));
        if(filacop.indice==filaadd.indice){
          filacop.indice=newindice;
          if(filacop.unidad!='' && filacop.esinsumo==0 && filacop.num_det>0){
            let newindsubp=this.ultindice++;
            filacop.indice_subp=newindsubp;
            this.AgregaDetAcu(rowd,newindsubp,1)
          }
          filacop.accion=1;
          filacop.zidmodi=this.insertaacu.length>0?this.insertaacu[this.insertaacu.length-1].zidmodi+1:1;
          this.datasourcePriacu.push(filacop);
          this.insertaacu.push(filacop);
        }
      }
    }
    else{
      for(let rowd of this.datasourcePrisub){
        let filacop=JSON.parse(JSON.stringify(rowd));
        if(filacop.indice==filaadd.indice_subp){
          filacop.indice=newindice;
          if(filacop.unidad!='' && filacop.esinsumo==0 && filacop.num_det>0){
            let newindsubp=this.ultindice++;
            filacop.indice_subp=newindsubp;
            this.AgregaDetAcu(rowd,newindsubp,1)
          }
          filacop.accion=1;
          this.datasourcePrisub.push(filacop);
        }
      }
    }
  }
  nuevafilapri(indice,item,descripcion,id_unidad,unidad,cantidad,precio,parcial,rendimiento,und_rendi,jornada,referencia,id_partida,advceros,tipofila,mostrar,accion,responsable,descant,asigund=0){
    let filaagrega : rowpresu = {
      id_proyecto: this.id_proyecto,
      indice:indice,
      item: item,
      descripcion: descripcion.trim().replace(/\s+/g, ' '),
      id_unidad:id_unidad,
      unidad: unidad,
      cantidad: cantidad,
      precio: precio,
      parcial: parcial,
      rendimiento:rendimiento,
      und_rendi:und_rendi,
      jornada:jornada,
      referencia:referencia,
      id_partida:id_partida,
      advceros:advceros,
      tipofila:tipofila,
      itemord:this.GenerarItemord(item),
      responsable:responsable,
      vinculo:null,//falta agregar, no deberia mandar desde esta vista
      seleccion: 0,
      icomost: 1,
      mostrar: mostrar,
      estmost:mostrar,
      editar1:0,
      editar2:0,
      editar3:0,
      accion:accion,
      descant:descant,
      colorvin:null,
      ed_pre:1,
      asignaund:asigund,
      uid:null
    };
    return filaagrega;
  }
  errormaxval(valor,tetval,nenteros,txtadic='',txtini='Un valor de '){
    if(valor.includes('.')){
      let numar=valor.split('.');
      if(numar[0].length>nenteros){
        this.toaster.error(txtini+tetval+' supera el maximo limite de '+nenteros+' digitos enteros.'+txtadic, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        this.mostrar_carga_todo=false;
        return true;
      }
    }
    else{
      if(valor.length>nenteros){
        this.toaster.error(txtini+tetval+' supera el maximo limite de '+nenteros+' digitos enteros.'+txtadic, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        this.mostrar_carga_todo=false;
        return true;
      }
    }
    return false;
  }
  public async guardarCambiosPresu(){
    try{
      if(this.bloqtemp /* || this.running */){//temporales
        this.toaster.error('Espere a que termine de guardar sus cambios en la nube. Tiene que desaparecer el icono de nube azul.', 'Información', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return;
      }//temporales
      let bcambsupbt=JSON.stringify(this.datasourcePrisub)===this.datasourcePrisubaux?true:false;
      if(this.inserta.length==0 && this.modifica.length==0 && this.elimina.length==0 && this.insertaacu.length==0 && this.modificaacu.length==0 && this.eliminaacu.length==0 && bcambsupbt){
        this.toaster.info('No hay Cambios para Guardar.', 'Información', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
      else{//verificar si los montos son correctos
        this.mostrar_carga_todo=true;
        //console.time('timetemp')
        for(let row of this.datasourcePri){
          if(row.precio){
            let precior=row.precio.toString();
            if(this.errormaxval(precior,'Precio',10,' Item : '+row.item)){ return }
          }
          let parcr=row.parcial.toString();
          if(this.errormaxval(parcr,'Parcial',15,' Item : '+row.item)){ return }
        }
        //detalles y subpartidas?
          /* for(let row1 of this.datasourcePriacu){

          } */
        /* console.timeEnd('timetemp')
        this.mostrar_carga_todo=false;//elimina
        return false;//elimina */
        this.stop();//temporales
        const tabla1=JSON.stringify(this.inserta);
        const tabla2=JSON.stringify(this.modifica);
        const tabla3=JSON.stringify(this.elimina);
        const tabla4=JSON.stringify(this.insertaacu);
        const tabla5=JSON.stringify(this.modificaacu);
        const tabla6=JSON.stringify(this.eliminaacu);
        const tabla7=JSON.stringify(this.datasourcePrisub);
        //const tabla8=JSON.stringify([]);//this.modificasubp //const tabla9=JSON.stringify([]);//this.eliminasubp
        const body=JSON.stringify({
          'id_proyecto':this.id_proyecto,
          'id_usuario':this.id_userproy,
          'id_usermod':this.id_user,
          'datos1':tabla1,
          'datos2':tabla2,
          'datos3':tabla3,
          'datos4':tabla4,
          'datos5':tabla5,
          'datos6':tabla6,
          'datos7':tabla7,//'datos8':tabla8,//'datos9':tabla9,
        });
        let resp=await this.presuservice.GuardarCambiosPresupuesto(body);
        if(resp.id=='1'){
          this.existetemp=false;
          await this.listarPresupuesto();
          this.cambindiceselpresu(this.filaSel,true);
          this.inserta=[];
          this.modifica=[];
          this.elimina=[];
          this.insertaacu=[];
          this.modificaacu=[];
          this.eliminaacu=[];
          this.existetemp=false;
          this.butselprecio='3';
          if(this.mostindir){
            this.ListarIndirecto();
          }
          this.mostrar_carga_todo=false;
          this.toaster.success('Se guardó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        else{
          this.actualizarTemp(30);
          this.mostrar_carga_todo=false;
          SwalService.error('Advertencia', resp.mensaje);
        }
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      console.log(e);
      this.toaster.error('No se pudo realizar la operación.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  async descartaCambiosPresu(){
    try{
      if(this.bloqtemp){//temporales
        this.toaster.error('Espere a que termine de guardar sus cambios en la nube. Tiene que desaparecer el icono de nube azul.', 'Información', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return;
      }//temporales
      let bcambsupbt=JSON.stringify(this.datasourcePrisub)==this.datasourcePrisubaux?true:false;
      if(/* ( */this.inserta.length==0 && this.modifica.length==0 && this.elimina.length==0 && this.insertaacu.length==0 && this.modificaacu.length==0 && this.eliminaacu.length==0 && bcambsupbt/* ) || !this.existetemp */){
        this.toaster.info('No hay Cambios para Descartar.', 'Información', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
      else{
        const respu=await SwalService.confirm('Esta seguro que desea Descartar los Cambios que no Guardó?','');
        if(respu.isConfirmed){
          if(this.bloqtemp){//temporales
            this.toaster.error('Espere a que termine de guardar sus cambios en la nube. Tiene que desaparecer el icono de nube azul.', 'Información', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            return;
          }//temporales
          this.mostrar_carga=true;
          this.stop();//temporales
          this.inserta=[];
          this.modifica=[];
          this.elimina=[];
          this.insertaacu=[];
          this.modificaacu=[];
          this.eliminaacu=[];
          this.colselpri=false;
          this.colselpri2=false;
          this.arrordenar=[];
          this.butselprecio='3';
          await this.presuservice.DescartarCambiosPresupuesto({id_proyecto:this.id_proyecto,id_usuario:this.id_user});//es el iduser del que modifica
          this.existetemp=false;
          this.toaster.success('Los cambios se descartaron correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          await this.listarPresupuesto();
          this.cambindiceselpresu(-1);
          this.mostrar_carga=false;
          if(this.mostindir){
            this.ListarIndirecto();
          }
        }
      }
    }
    catch(e){
      this.mostrar_carga=false;
      console.log(e)
      this.toaster.error('No se pudo realizar la operación.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  Cambioseltpri(row,ind){
    if(row.seleccion==0){
      row.seleccion=1;
      if(!(this.arrindprisel.find(elem=> elem==ind))){
        this.arrprisel.push(JSON.parse(JSON.stringify(row)));
        this.arrindprisel.push(ind);
        if(row.unidad==''){
          for(let i=ind+1;i<this.datasourcePri.length;i++){
            var palabra = this.datasourcePri[i].item.toString().substring(0, row.item.length)
            if (palabra == row.item) {
              if(!(this.arrindprisel.find(elem=> elem==i))){
                this.datasourcePri[i].seleccion=1;
                this.arrprisel.push(JSON.parse(JSON.stringify(this.datasourcePri[i])));
                this.arrindprisel.push(i);
              }
            }
            else{ break; }
          }
        }
      }
    }
    else{
      row.seleccion=0;
      for(let k=0;k<this.arrprisel.length;k++){
        if(row.indice==this.arrprisel[k].indice){
          this.arrprisel.splice(k,1);
          this.arrindprisel.splice(k,1);
          break;
        }
      }
      if(row.unidad==''){//buscar predecesores y quitar seleccion de padres, solo si es subtitulo
        for(let i=ind+1;i<this.datasourcePri.length;i++){
          var palabra = this.datasourcePri[i].item.toString().substring(0, row.item.length)
          if (palabra == row.item) {
            for(let k=0;k<this.arrprisel.length;k++){
              if(this.datasourcePri[i].indice==this.arrprisel[k].indice){
                this.datasourcePri[i].seleccion=0;
                this.arrprisel.splice(k,1);
                this.arrindprisel.splice(k,1);
                break;
              }
            }
            
          }
          else{ break; }
        }
        var aritem=row.item.split('.');
        let i=aritem.length-1;
        let titem="";
        let tamaño=0;
        while(i>0){
          tamaño=tamaño+aritem[i].length+1;
          titem=row.item.substring(0,row.item.length-tamaño)
          for(let j=0;j<this.datasourcePri.length;j++){
            if(this.datasourcePri[j].item==titem)
            {
              for(let i=0;i<this.arrprisel.length;i++){
                if(this.datasourcePri[j].indice==this.arrprisel[i].indice){
                  this.datasourcePri[j].seleccion=0;
                  this.arrprisel.splice(i,1);
                  this.arrindprisel.splice(i,1);
                  break;
                }
              }
            }
          }
          titem=titem+".";
          i--;
        }
      }
    }
  }
  HabSelPri(){
    this.colselpri=!this.colselpri;
    this.colselpri2=false;
    for(let row of this.datasourcePri){
      row.seleccion=0;
    }
    this.arrprisel=[];
    this.arrindprisel=[];
  }
  HabSelPri2(){
    this.colselpri2=!this.colselpri2;
    this.colselpri=false;
    for(let row of this.datasourcePri){
      row.seleccion=0;
    }
    this.arrprisel=[];
    this.arrindprisel=[];
  }
  //costos unitarios
  changeEdicion(){
    if(this.edicionacu){
      this.formDataPartida.disable();
      /* this.selprecio.disable(); */
      this.edicionacu=false;
    }
    else{
      this.edicionacu=true;
      this.formDataPartida.enable();
      /* this.selprecio.enable(); */
      if(this.datasourcePri[this.filaSel]?.unidad=='' && this.edicionacu){
        this.unidad.disable();
        this.rendimiento.disable();
        this.undrendimiento.disable();
        this.jornada.disable();
      }
      else if(this.datasourcePri[this.filaSel]?.unidad!='' && this.edicionacu){
        this.unidad.enable();
        this.rendimiento.enable();
        //this.undrendimiento.enable();
        this.jornada.enable();
      }
      if(!this.editajor){
        this.jornada.disable();
      }
      this.undrendimiento.disable();
    }
  }
  toggleOn(condicion: any,indice2:any) {
    this.tablaacusel[indice2].icomost = 1;
    for (let i=indice2+1;i<this.tablaacusel.length;i++) {
      if(this.tablaacusel[i].id_tipo_insumo==condicion)
      {
        if(this.tablaacusel[i].unidad!='')
        {
          this.tablaacusel[i].mostrar=1;
        }
      }
      else{ break; }
    }
  }
  toggleOff(condicion: any,indice2:any) {
    this.tablaacusel[indice2].icomost = 0;
    for (let i=indice2+1;i<this.tablaacusel.length;i++) {
      if(this.tablaacusel[i].id_tipo_insumo==condicion)
      {
        if(this.tablaacusel[i].unidad!='')
        {
          this.tablaacusel[i].mostrar=0;
        }
      }
      else{ break; }
    }
  }
  cambindiceselacu(ind: any) {
    if (ind == this.filaSelacu)
      this.filaSelacu = -1;
    else
      this.filaSelacu = ind;
  }
  editarceldat1(ind: any) {
    if((this.edicionacu && !this.esgruposel && !this.acuxmetrado) && this.tablaacusel[ind].num_det!=0){
      this.tablaacusel[ind].editar = 1;
    }
  }
  editarceldat2(ind: any) {
    if((this.edicionacu && !this.esgruposel && !this.acuxmetrado) && this.tablaacusel[ind].num_det!=0){
      this.tablaacusel[ind].editar3 = 1;
    }
  }
  editarceldat3(ind: any) {
    if((this.edicionacu && /* !this.esgruposel && */ !this.acuxmetrado) && this.tablaacusel[ind].num_det!=0 && this.tablaacusel[ind].operador==null && this.tablaacusel[ind].esinsumo==1){
      this.tablaacusel[ind].editar2 = 1;
    }
  }
  actinsporc(id_tipo_ins:any,parcialsinporc:any,operador:any){
    if(operador==null){
      for(let row of this.tablaacusel){
        if(row.operador=="%" && row.tipo_insumo==id_tipo_ins){
          let cant=Number(row.cantidad);
          let newparc=(parcialsinporc*cant)/100;
          let indpri=row.ind;
          row.precio=this.formService.redondeo(parcialsinporc,this.dec_precio);
          this.datasourcePriacu[indpri].precio=this.formService.redondeo(parcialsinporc, this.dec_precio);
          row.parcial=this.formService.redondeo(newparc,this.dec_precio);
          this.datasourcePriacu[indpri].parcial=this.formService.redondeo(newparc, this.dec_precio);
          this.ActfilCambiosAcu(this.datasourcePriacu[indpri].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[indpri]);
          this.Actparcialt1(row.id_tipo_insumo)
        }
      }
    }
  }
  Addsubpdesubp(arradd:any,indicepadre:any){
    for(let rowsubp of this.datasourcePrisub){
      if(rowsubp.indice==indicepadre){
        arradd.push(rowsubp);
        if(rowsubp.esinsumo==0 && rowsubp.num_det>0){
          this.Addsubpdesubp(arradd,rowsubp.indice_subp)
        }
      }
    }
  }
  async atualizavinculado(arrdetpri:any,arrsubppri:any,a:any,){
    //precio, calcula totales
    var cantidad = Number(this.datasourcePri[a].cantidad)
    var precio = Number(this.datasourcePri[this.filaSel].precio)
    this.datasourcePri[a].precio=this.datasourcePri[this.filaSel].precio;
    this.datasourcePri[a].parcial=this.formService.redondeo(cantidad*precio,this.dec_parcial);
    this.datasourcePri[a].id_unidad=this.datasourcePri[this.filaSel].id_unidad;
    this.datasourcePri[a].unidad=this.datasourcePri[this.filaSel].unidad;
    this.datasourcePri[a].rendimiento=this.datasourcePri[this.filaSel].rendimiento;
    this.datasourcePri[a].und_rendi=this.datasourcePri[this.filaSel].und_rendi;
    this.datasourcePri[a].jornada=this.datasourcePri[this.filaSel].jornada;
    this.datasourcePri[a].referencia=this.datasourcePri[this.filaSel].referencia;
    this.datasourcePri[a].id_partida=this.datasourcePri[this.filaSel].id_partida;
    this.datasourcePri[a].advceros=this.datasourcePri[this.filaSel].advceros;
    this.calculartotalpadres(a);
    //eliminar detalle existente(pasar al arreglo eliminar), recuperar el ultimo id_filadetalle(length arreglo), agregar nuevo detalle
    for(let b=0;b<this.datasourcePriacu.length;b++){
      if(this.datasourcePriacu[b].indice==this.datasourcePri[a].indice){
        if (this.datasourcePriacu[b].esinsumo == 0 && this.datasourcePriacu[b].num_det>0) {
          this.eliminaDatosSubp(this.datasourcePriacu[b])//eliminar detalle subpartida si existiera y agregar de los nuevos si existen
        }
        this.ActElimArrCambiosAcu(this.datasourcePriacu[b]);
        this.datasourcePriacu.splice(b,1);
        this.ActIndTabacusel(b);
        b--;
      }
    }
    //agregar nuevos detalles
    for (let filaadd of arrdetpri) {
      let referpasa=null;
      if(filaadd.esinsumo==0 && filaadd.num_det>0){
        referpasa=filaadd.referencia==null || filaadd.referencia==''?this.datasourcePri[this.filaSel].id_partida:filaadd.referencia+","+this.datasourcePri[this.filaSel].id_partida;
      }
      let indicedet=filaadd.esinsumo==0 && filaadd.num_det>0?this.ultindice++:null;
      let agrega:rowacu = {
        id_proyecto:this.id_proyecto,
        indice_subp: filaadd.esinsumo==0 && filaadd.num_det>0?indicedet:null,//condicionar con subpartida
        id_filadetalle:null,
        num_det: filaadd.num_det,
        codigo:filaadd.codigo,
        descripcion: filaadd.descripcion,
        id_unidad:filaadd.id_unidad,
        unidad: filaadd.unidad,
        operador:filaadd.esinsumo==0 && filaadd.num_det>0?null:filaadd.operador,
        tipo_insumo:filaadd.esinsumo==0 && filaadd.num_det>0?null:filaadd.tipo_insumo,
        cuadrilla: filaadd.cuadrilla,
        cantidad: filaadd.cantidad,
        precio: filaadd.precio,
        parcial: filaadd.parcial,
        id_tipo_insumo: filaadd.id_tipo_insumo,
        id_insumo: filaadd.id_insumo,
        id_indice: filaadd.id_indice,
        id_clasificacion: filaadd.id_clasificacion,
        desc_clasi:filaadd.desc_clasi?filaadd.desc_clasi:null,
        id_subpartida: filaadd.esinsumo==0 && filaadd.num_det>0?filaadd.id_subpartida:null,
        esinsumo:filaadd.esinsumo,
        afcuadrilla:filaadd.afcuadrilla,
        rendimiento:filaadd.esinsumo==0 && filaadd.num_det>0?filaadd.rendimiento:null,
        und_rendi:filaadd.esinsumo==0 && filaadd.num_det>0?filaadd.und_rendi:null,
        jornada:filaadd.esinsumo==0 && filaadd.num_det>0?filaadd.jornada:null,
        advceros:filaadd.advceros,
        referencia:referpasa,
        icomost: '1',
        mostrar: '1',
        editar: 0,
        editar2:0,
        ind:this.datasourcePriacu.length,
        accion:1,
        indice:this.datasourcePri[a].indice,
        seleccion:0,
        asignaund:0,
        zidmodi:this.insertaacu.length>0?this.insertaacu[this.insertaacu.length-1].zidmodi+1:1
      };
      this.datasourcePriacu.push(agrega);
      this.insertaacu.push(agrega);
      if(filaadd.esinsumo==0 && filaadd.num_det>0){
        await this.CargarSubpartidasResult(arrsubppri,indicedet,filaadd.indice_subp,referpasa);
      }
    }
    this.ActfilCambios(this.datasourcePri[a].accion==1?this.inserta:this.modifica,this.datasourcePri[a]);
  }
  caneditarceldat1(eve: any, ind2: any) {//cantidad
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.tablaacusel[ind2].cantidad)
    var aprecio = Number(this.tablaacusel[ind2].precio);
    this.tablaacusel[ind2].editar = 0;
    if (valor != actual) {
      let resparc=this.tablaacusel[ind2].operador=='%'?(valor*aprecio)/100:valor*aprecio;
      if(this.errormaxval(resparc.toString(),'Parcial',10,'','El resultado de ')){ return }
      let indpri=this.tablaacusel[ind2].ind;
      //calcular cuadrilla, si rendimiento es mayor a 0, sino no hace nada
      if(this.tablaacusel[ind2].afcuadrilla==1 && Number(this.rendimiento.value)!=0){
        let rescuad=(valor*Number(this.rendimiento.value))/Number(this.jornada.value);
        if(this.errormaxval(rescuad.toString(),'Cuadrilla',10,'','El resultado de ')){ return }
        this.tablaacusel[ind2].cuadrilla =this.formService.redondeo(rescuad,8);
        this.datasourcePriacu[indpri].cuadrilla=this.formService.redondeo(rescuad,8);
      }
      this.tablaacusel[ind2].cantidad = this.formService.redondeo(Number(valor), this.dec_cant);
      this.datasourcePriacu[indpri].cantidad=this.formService.redondeo(Number(valor), this.dec_cant);
      this.tablaacusel[ind2].parcial =this.formService.redondeo(resparc, this.dec_precio);
      this.datasourcePriacu[indpri].parcial=this.formService.redondeo(resparc, this.dec_precio);
      this.ActfilCambiosAcu(this.datasourcePriacu[indpri].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[indpri]);
      let sumasinporc=this.Actparcialt1(this.tablaacusel[ind2].id_tipo_insumo);
      this.actinsporc(this.tablaacusel[ind2].id_tipo_insumo,sumasinporc,this.tablaacusel[ind2].operador);
      let existecer=0;
      for(let row of this.tablaacusel){
        if(row.unidad!='' && Number(row.parcial)==0){
          existecer=1;
          break;
        }
      }
      this.CalcRatio();
      this.datasourcePri[this.filaSel].advceros=existecer;
      //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
      if(this.datasourcePri[this.filaSel].vinculo!=null){
        if(this.datasourcePri.length>500){
          this.mostrar_carga_todo=true;
        }
        let arrdetpri=[];
        let arrsubppri=[];
        for(let a=0;a<this.datasourcePri.length;a++){
          if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
            if(arrdetpri.length<=0){
              for(let rowacup of this.datasourcePriacu){
                if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                  arrdetpri.push(rowacup);
                  if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                    this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                  }
                }
              }
            }
            //actualizar detalles
            this.atualizavinculado(arrdetpri,arrsubppri,a);
          }
        }
        this.mostrar_carga_todo=false;
      }
      this.actualizarTemp(18);//poner al final de la actualizacion de los vinculos
    }
  }
  caneditarceldat2(eve: any, ind2: any) {//cuadrilla
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.tablaacusel[ind2].cuadrilla);
    var aprecio = Number(this.tablaacusel[ind2].precio);
    var rendi=Number(this.rendimiento.value);
    this.tablaacusel[ind2].editar3 = 0;
    if (valor != actual) {
      //verificar totales?
      var canti=rendi==0?Number(this.tablaacusel[ind2].cantidad):(valor*Number(this.jornada.value))/rendi;
      let resparc=this.tablaacusel[ind2].operador=='%'?(Number(this.formService.redondeo(canti, this.dec_cant))*aprecio)/100:Number(this.formService.redondeo(canti, this.dec_cant))*aprecio;
      if(this.errormaxval(canti.toString(),'Cantidad',10,'','El resultado de ')){ return }
      if(this.errormaxval(resparc.toString(),'Parcial',10,'','El resultado de ')){ return }
      let indpri=this.tablaacusel[ind2].ind;
      this.tablaacusel[ind2].cuadrilla = this.formService.redondeo(Number(valor), 8);
      this.datasourcePriacu[indpri].cuadrilla=this.formService.redondeo(Number(valor), 8);
      this.tablaacusel[ind2].cantidad=this.formService.redondeo(canti,this.dec_cant);
      this.datasourcePriacu[indpri].cantidad=this.formService.redondeo(canti, this.dec_cant);
      this.tablaacusel[ind2].parcial =this.formService.redondeo(resparc, this.dec_precio);// valor*aprecio==0?'-':
      this.datasourcePriacu[indpri].parcial=this.formService.redondeo(resparc, this.dec_precio);
      this.ActfilCambiosAcu(this.datasourcePriacu[indpri].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[indpri]);
      let sumasinporc=this.Actparcialt1(this.tablaacusel[ind2].id_tipo_insumo);
      this.actinsporc(this.tablaacusel[ind2].id_tipo_insumo,sumasinporc,this.tablaacusel[ind2].operador);
      let existecer=0;
      for(let row of this.tablaacusel){
        if(row.unidad!='' && Number(row.parcial)==0){
          existecer=1;
          break;
        }
      }
      this.CalcRatio();
      this.datasourcePri[this.filaSel].advceros=existecer;
      //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
      if(this.datasourcePri[this.filaSel].vinculo!=null){
        if(this.datasourcePri.length>500){
          this.mostrar_carga_todo=true;
        }
        let arrdetpri=[];
        let arrsubppri=[];
        for(let a=0;a<this.datasourcePri.length;a++){
          if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
            //buscar los detalles y subpartidas del principal
            if(arrdetpri.length<=0){
              for(let rowacup of this.datasourcePriacu){
                if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                  arrdetpri.push(rowacup);
                  if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                    this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                  }
                }
              }
            }
            this.atualizavinculado(arrdetpri,arrsubppri,a);
          }
        }
        this.mostrar_carga_todo=false;
      }
      this.actualizarTemp(19);
    }
  }
  ActparcialNovis(idtipo:any,indpartida:any,arracu:any) {//indpartida,arreglo indices de acu
    let sumasinporc=0;
    let sumatot=0;
    for(let a=0;a<arracu.length;a++){
      if(this.datasourcePriacu[arracu[a]].indice==this.datasourcePri[indpartida].indice){
        if (this.datasourcePriacu[arracu[a]].id_tipo_insumo == idtipo && this.datasourcePriacu[arracu[a]].unidad != '') {
          sumatot += Number(this.datasourcePriacu[arracu[a]].parcial);
          if(this.datasourcePriacu[arracu[a]].operador==null){
            sumasinporc+=Number(this.datasourcePriacu[arracu[a]].parcial);
          }
        }
        if (this.datasourcePriacu[arracu[a]].id_tipo_insumo != idtipo && this.datasourcePriacu[arracu[a]].unidad != '') {
          sumatot += Number(this.datasourcePriacu[arracu[a]].parcial);
        }
      }
    }
    var cantidad = Number(this.datasourcePri[indpartida].cantidad)
    this.datasourcePri[indpartida].precio=Number(this.formService.redondeo(sumatot, this.dec_precio));
    this.datasourcePri[indpartida].parcial=Number(this.formService.redondeo((cantidad * sumatot), this.dec_parcial));
    let existecer=0;
    for(let rowacu of arracu){
      if(this.datasourcePriacu[rowacu].unidad!='' && Number(this.datasourcePriacu[rowacu].parcial)==0){
        existecer=1;
        break;
      }
    }
    this.datasourcePri[indpartida].advceros=existecer;//cambiar por la fila1 del arreglo
    this.ActfilCambios(this.datasourcePri[indpartida].accion==1?this.inserta:this.modifica,this.datasourcePri[indpartida]);
    this.calculartotalpadres(/* Number(this.formService.redondeo((cantidad * sumatot), this.dec_parcial)),parcialactual, */indpartida);
    return sumasinporc;
  }
  actinsporcsinvis(id_tipo_ins:any,parcialsinporc:any,operador:any,indpartida:any,arracu:any){
    if(operador==null){
      for(let a=0;a<arracu.length;a++){
        if(this.datasourcePriacu[arracu[a]].indice==this.datasourcePri[indpartida].indice){
          if(this.datasourcePriacu[arracu[a]].operador=="%" && this.datasourcePriacu[arracu[a]].tipo_insumo==id_tipo_ins){
            let cant=Number(this.datasourcePriacu[arracu[a]].cantidad);
            let newparc=(parcialsinporc*cant)/100;
            this.datasourcePriacu[arracu[a]].precio=this.formService.redondeo(parcialsinporc, this.dec_precio);
            this.datasourcePriacu[arracu[a]].parcial=this.formService.redondeo(newparc, this.dec_precio);
            this.ActfilCambiosAcu(this.datasourcePriacu[arracu[a]].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[arracu[a]]);
            this.ActparcialNovis(this.datasourcePriacu[arracu[a]].id_tipo_insumo,indpartida,arracu)
          }
        }
      }
    }
  }
  itemSubpartida(indicebusq:any){
    let itemret='';
    let indpadre=indicebusq;
    let indacu=-1;
    while (indacu==-1){//busca desde el nivel mas bajo, hasta el detalle acu, en vez de recursivo
      for(let j=0;j<this.datasourcePriacu.length;j++){
        if(this.datasourcePriacu[j].indice_subp==this.datasourcePrisub[indpadre].indice){
          indacu=j;
          break;
        }
      }
      if(indacu==-1){
        for(let i=0;i<this.datasourcePrisub.length;i++){
          if(this.datasourcePrisub[i].indice_subp==this.datasourcePrisub[indpadre].indice){
            indpadre=i;
            break;
          }
        }
      }
    }
    for(let k=0;k<this.datasourcePri.length;k++){
      if(this.datasourcePri[k].indice==this.datasourcePriacu[indacu].indice){
        itemret=this.datasourcePri[k].item;
        break;
      }
    }
    return itemret;
  }
  actuaprecio(ind:any,precamb:any){
    let itemact=this.item.value.includes('.')?this.item.value.substring(0,this.item.value.indexOf('.')):this.item.value;
    let encuent=false;
    if(/* this.selprecio.value==2 */this.butselprecio=='2'){//todo el titulo
      this.mostrar_carga_todo=true;
      for(let i=0;i<this.datasourcePri.length;i++){
        var palabra = this.datasourcePri[i].item.toString().substring(0, itemact.toString().length + 1)
        if (palabra == (itemact + '.')) {//debe ser diferente del actual
          encuent=true;
          if(this.datasourcePri[i].unidad!='' && this.datasourcePri[i].item!=this.item.value){
            this.arrcambprecio.push(i);//indice de partidas a verificar
            this.arrindacucambpre.push([]);
          }
        }
        else{
          if(encuent){
            break;
          }
        }
      }
      //recorrer los costos unitarios y buscar los indices
      //definir si agregar al arreglo indices un array de arrays con indices de los acu de las partidas fila1
      for(let a=0;a<this.datasourcePriacu.length;a++){
        for(let b=0;b<this.arrcambprecio.length;b++){
          if(this.datasourcePriacu[a].indice==this.datasourcePri[this.arrcambprecio[b]].indice){
            this.arrindacucambpre[b].push(a);//solo considerar subpartidas de este grupo
            break;
          }
        }
      }
      for(let c=0;c<this.arrcambprecio.length;c++){
        for(let wow2 of this.arrindacucambpre[c]){
          if(this.datasourcePriacu[wow2].indice==this.datasourcePri[this.arrcambprecio[c]].indice && this.datasourcePriacu[wow2].descripcion==this.tablaacusel[ind].descripcion){//cambiar id_insumo por condicion correcta
            var actual = Number(this.datasourcePriacu[wow2].precio)
            var acantidad = Number(this.datasourcePriacu[wow2].cantidad);
            if (precamb != actual) {
              let nprec=this.formService.redondeo(Number(precamb), this.dec_precio);
              this.datasourcePriacu[wow2].precio=nprec;
              let resparc=this.datasourcePriacu[wow2].operador=='%'?(Number(nprec)*acantidad)/100:Number(nprec)*acantidad;
              this.datasourcePriacu[wow2].parcial=this.formService.redondeo(resparc, this.dec_precio);
              this.ActfilCambiosAcu(this.datasourcePriacu[wow2].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[wow2]);
              let sumasinporc=this.ActparcialNovis(this.datasourcePriacu[wow2].id_tipo_insumo,this.arrcambprecio[c],this.arrindacucambpre[c])//pasar arreglo de indices a otro metodo
              this.actinsporcsinvis(this.datasourcePriacu[wow2].id_tipo_insumo,sumasinporc,this.datasourcePriacu[wow2].operador,this.arrcambprecio[c],this.arrindacucambpre[c]);//pasar arreglo de indices a otro metodo
            }
          }
        }
        let existecer=0;
        for(let row of this.arrindacucambpre[c]){
          if(this.datasourcePriacu[row].unidad!='' && Number(this.datasourcePriacu[row].parcial)==0){
            existecer=1;
            break;
          }
        }
        this.datasourcePri[this.arrcambprecio[c]].advceros=existecer;//cambiar por la fila1 del arreglo
      }
      for(let b=0;b<this.datasourcePrisub.length;b++){//condicionar por titulo, cambiar id_insumo por condicion correcta
        if(this.datasourcePrisub[b].id_tipo_insumo==this.tablaacusel[ind].id_tipo_insumo && this.datasourcePrisub[b].descripcion==this.tablaacusel[ind].descripcion/* this.datasourcePrisub[b].descripcion==this.tablaacusel[ind].descripcion && this.datasourcePrisub[b].precio==data.anterior */){
          let itemins=this.itemSubpartida(b);
          var pala = itemins.toString().substring(0, itemact.toString().length + 1)
          if (pala == (itemact + '.')) {//pertenece al grupo
            var valor = this.formService.redondeo(Number(precamb), this.dec_precio);
            var acantidad = Number(this.datasourcePrisub[b].cantidad);
            this.datasourcePrisub[b].precio=valor;
            let resparc=this.datasourcePrisub[b].operador=='%'?(Number(valor)*acantidad)/100:Number(valor)*acantidad;
            this.datasourcePrisub[b].parcial=this.formService.redondeo(resparc, this.dec_precio);
            let indpadre=-1;
            let arrindacu=[];
            let nivel='s';//'s' subpartida,'a' acu
            for(let l=0;l<this.datasourcePrisub.length;l++){
              if(this.datasourcePrisub[l].indice_subp==this.datasourcePrisub[b].indice){
                indpadre=l;
                nivel='s';
              }
              if(this.datasourcePrisub[l].indice==this.datasourcePrisub[b].indice){
                arrindacu.push(l);
              }
            }
            if(indpadre==-1){
              for(let o=0;o<this.datasourcePriacu.length;o++){
                if(this.datasourcePriacu[o].indice_subp==this.datasourcePrisub[b].indice){
                  indpadre=o;
                  nivel='a';
                  break;
                }
              }
            }
            let sumasinporc=this.ActparcialSubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
            this.actinsporcsubp(this.datasourcePrisub[b].id_tipo_insumo,sumasinporc,this.datasourcePrisub[b].operador,indpadre,arrindacu,this.datasourcePrisub,nivel);//indice partida, arreglo de indices de su acu
            this.ActuaMontosPadre(indpadre,nivel)
          }
        }
      }
      this.mostrar_carga_todo=false;
    }
    else if(/* this.selprecio.value==3 */this.butselprecio=='3'){//todo el proyecto
      this.mostrar_carga_todo=true;
      let arradmite=[]
      for(let d=0;d<this.datasourcePriacu.length;d++){
        if(this.datasourcePriacu[d].descripcion==this.tablaacusel[ind].descripcion){
          arradmite.push(d);
        }
      }
      for(let i=0;i<this.datasourcePri.length;i++){
        let encind=arradmite.find(ele=>this.datasourcePri[i].indice==this.datasourcePriacu[ele].indice);
        if(encind){
          this.arrcambprecio.push(i);//indice de partidas a verificar
          this.arrindacucambpre.push([]);
        }
      }
      for(let a=0;a<this.datasourcePriacu.length;a++){
        for(let b=0;b<this.arrcambprecio.length;b++){
          if(this.datasourcePriacu[a].indice==this.datasourcePri[this.arrcambprecio[b]].indice){
            this.arrindacucambpre[b].push(a);
            break;
          }
        }
      }
      //cambiar y quitar la comparacion, solo recorrer los ya filtrados
      for(let c=0;c<this.arrcambprecio.length;c++){
        for(let wow2 of this.arrindacucambpre[c]){
          if(this.datasourcePriacu[wow2].indice==this.datasourcePri[this.arrcambprecio[c]].indice && this.datasourcePriacu[wow2].descripcion==this.tablaacusel[ind].descripcion){//cambiar id_insumo por condicion correcta
            var actual = Number(this.datasourcePriacu[wow2].precio)
            var acantidad = Number(this.datasourcePriacu[wow2].cantidad);
            if (precamb != actual) {
              let nprec=this.formService.redondeo(Number(precamb), this.dec_precio);
              this.datasourcePriacu[wow2].precio=nprec;
              let resparc=this.datasourcePriacu[wow2].operador=='%'?(Number(nprec)*acantidad)/100:Number(nprec)*acantidad;
              this.datasourcePriacu[wow2].parcial=this.formService.redondeo(resparc, this.dec_precio);
              this.ActfilCambiosAcu(this.datasourcePriacu[wow2].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[wow2]);
              let sumasinporc=this.ActparcialNovis(this.datasourcePriacu[wow2].id_tipo_insumo,this.arrcambprecio[c],this.arrindacucambpre[c])//pasar arreglo de indices a otro metodo
              this.actinsporcsinvis(this.datasourcePriacu[wow2].id_tipo_insumo,sumasinporc,this.datasourcePriacu[wow2].operador,this.arrcambprecio[c],this.arrindacucambpre[c]);//pasar arreglo de indices a otro metodo
            }
          }
        }
        let existecer=0;
        for(let row of this.arrindacucambpre[c]){
          if(this.datasourcePriacu[row].unidad!='' && Number(this.datasourcePriacu[row].parcial)==0){
            existecer=1;
            break;
          }
        }
        this.datasourcePri[this.arrcambprecio[c]].advceros=existecer;//cambiar por la fila1 del arreglo
      }
      for(let b=0;b<this.datasourcePrisub.length;b++){
        if(this.datasourcePrisub[b].id_tipo_insumo==this.tablaacusel[ind].id_tipo_insumo && this.datasourcePrisub[b].descripcion==this.tablaacusel[ind].descripcion/*  && this.datasourcePrisub[b].descripcion==this.tablaacusel[ind].descripcion */){
          var valor = this.formService.redondeo(Number(precamb), this.dec_precio);
          var acantidad = Number(this.datasourcePrisub[b].cantidad);
          this.datasourcePrisub[b].precio=valor;
          let resparc=this.datasourcePrisub[b].operador=='%'?(Number(valor)*acantidad)/100:Number(valor)*acantidad;
          this.datasourcePrisub[b].parcial=this.formService.redondeo(resparc, this.dec_precio);
          let indpadre=-1;
          let arrindacu=[];
          let nivel='s';//'s' subpartida,'a' acu
          for(let l=0;l<this.datasourcePrisub.length;l++){
            if(this.datasourcePrisub[l].indice_subp==this.datasourcePrisub[b].indice){
              indpadre=l;
              nivel='s';
            }
            if(this.datasourcePrisub[l].indice==this.datasourcePrisub[b].indice){
              arrindacu.push(l);
            }
          }
          if(indpadre==-1){
            for(let o=0;o<this.datasourcePriacu.length;o++){
              if(this.datasourcePriacu[o].indice_subp==this.datasourcePrisub[b].indice){
                indpadre=o;
                nivel='a';
                break;
              }
            }
          }
          let sumasinporc=this.ActparcialSubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
          this.actinsporcsubp(this.datasourcePrisub[b].id_tipo_insumo,sumasinporc,this.datasourcePrisub[b].operador,indpadre,arrindacu,this.datasourcePrisub,nivel);//indice partida, arreglo de indices de su acu
          this.ActuaMontosPadre(indpadre,nivel)
        }
      }
      this.mostrar_carga_todo=false;
    }
    else if(/* this.selprecio.value==4 */this.butselprecio=='4'){//precio de mercado

    }
    //limpiar las variables y los arreglos
    this.arrcambprecio=[];
    this.arrindacucambpre=[];
  }
  async caneditarceldat3(eve: any, ind2: any) {//precio
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.tablaacusel[ind2].precio)
    var acantidad = Number(this.tablaacusel[ind2].cantidad);
    this.tablaacusel[ind2].editar2 = 0;
    if (valor != actual) {
      if (this.esgruposel){
        if(this.butselprecio=='3'){//proy
          this.mostrar_carga_todo=true;
          let arradmite=[]
          for(let d=0;d<this.datasourcePriacu.length;d++){
            if(this.datasourcePriacu[d].descripcion==this.tablaacusel[ind2].descripcion){
              arradmite.push(d);
            }
          }
          for(let i=0;i<this.datasourcePri.length;i++){
            let encind=arradmite.find(ele=>this.datasourcePri[i].indice==this.datasourcePriacu[ele].indice);
            if(encind){
              this.arrcambprecio.push(i);//indice de partidas a verificar
              this.arrindacucambpre.push([]);
            }
          }
          for(let a=0;a<this.datasourcePriacu.length;a++){
            for(let b=0;b<this.arrcambprecio.length;b++){
              if(this.datasourcePriacu[a].indice==this.datasourcePri[this.arrcambprecio[b]].indice){
                this.arrindacucambpre[b].push(a);
                break;
              }
            }
          }
          //cambiar y quitar la comparacion, solo recorrer los ya filtrados
          for(let c=0;c<this.arrcambprecio.length;c++){
            for(let wow2 of this.arrindacucambpre[c]){
              if(this.datasourcePriacu[wow2].indice==this.datasourcePri[this.arrcambprecio[c]].indice && this.datasourcePriacu[wow2].descripcion==this.tablaacusel[ind2].descripcion && this.datasourcePriacu[wow2].precio==actual){//cambiar id_insumo por condicion correcta
                var actual = Number(this.datasourcePriacu[wow2].precio)
                var acantidad = Number(this.datasourcePriacu[wow2].cantidad);
                if (valor != actual) {
                  let nprec=this.formService.redondeo(Number(valor), this.dec_precio);
                  this.datasourcePriacu[wow2].precio=nprec;
                  let resparc=this.datasourcePriacu[wow2].operador=='%'?(Number(nprec)*acantidad)/100:Number(nprec)*acantidad;
                  this.datasourcePriacu[wow2].parcial=this.formService.redondeo(resparc, this.dec_precio);
                  this.ActfilCambiosAcu(this.datasourcePriacu[wow2].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[wow2]);
                  let sumasinporc=this.ActparcialNovis(this.datasourcePriacu[wow2].id_tipo_insumo,this.arrcambprecio[c],this.arrindacucambpre[c])//pasar arreglo de indices a otro metodo
                  this.actinsporcsinvis(this.datasourcePriacu[wow2].id_tipo_insumo,sumasinporc,this.datasourcePriacu[wow2].operador,this.arrcambprecio[c],this.arrindacucambpre[c]);//pasar arreglo de indices a otro metodo
                }
              }
            }
            let existecer=0;
            for(let row of this.arrindacucambpre[c]){
              if(this.datasourcePriacu[row].unidad!='' && Number(this.datasourcePriacu[row].parcial)==0){
                existecer=1;
                break;
              }
            }
            this.datasourcePri[this.arrcambprecio[c]].advceros=existecer;//cambiar por la fila1 del arreglo
          }
          for(let b=0;b<this.datasourcePrisub.length;b++){
            if(this.datasourcePrisub[b].id_tipo_insumo==this.tablaacusel[ind2].id_tipo_insumo && this.datasourcePrisub[b].descripcion==this.tablaacusel[ind2].descripcion && this.datasourcePrisub[b].precio==actual){
              var valor2 = this.formService.redondeo(Number(valor), this.dec_precio);
              var acantidad = Number(this.datasourcePrisub[b].cantidad);
              this.datasourcePrisub[b].precio=valor2;
              let resparc=this.datasourcePrisub[b].operador=='%'?(Number(valor2)*acantidad)/100:Number(valor2)*acantidad;
              this.datasourcePrisub[b].parcial=this.formService.redondeo(resparc, this.dec_precio);
              let indpadre=-1;
              let arrindacu=[];
              let nivel='s';//'s' subpartida,'a' acu
              for(let l=0;l<this.datasourcePrisub.length;l++){
                if(this.datasourcePrisub[l].indice_subp==this.datasourcePrisub[b].indice){
                  indpadre=l;
                  nivel='s';
                }
                if(this.datasourcePrisub[l].indice==this.datasourcePrisub[b].indice){
                  arrindacu.push(l);
                }
              }
              if(indpadre==-1){
                for(let o=0;o<this.datasourcePriacu.length;o++){
                  if(this.datasourcePriacu[o].indice_subp==this.datasourcePrisub[b].indice){
                    indpadre=o;
                    nivel='a';
                    break;
                  }
                }
              }
              let sumasinporc=this.ActparcialSubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
              this.actinsporcsubp(this.datasourcePrisub[b].id_tipo_insumo,sumasinporc,this.datasourcePrisub[b].operador,indpadre,arrindacu,this.datasourcePrisub,nivel);//indice partida, arreglo de indices de su acu
              this.ActuaMontosPadre(indpadre,nivel)
            }
          }
          this.cambindiceselpresu(this.filaSel,true);
          if(this.orderacu==1){
            this.OrdenascRelins();
          }
          else if(this.orderacu==2){
            this.OrdendescRelins();
          }
          else if(this.orderacu==3){
            this.OrdenParcascRelins();
          }
          else if(this.orderacu==4){
            this.OrdenParcdescRelins();
          }
          this.arrcambprecio=[];
          this.arrindacucambpre=[];
          this.mostrar_carga_todo=false;
        }
        else{
          let itemact=this.item.value.includes('.')?this.item.value.substring(0,this.item.value.indexOf('.')):this.item.value;
          for(let a=0;a<this.datasourcePriacu.length;a++){
            if(this.tablaacusel[ind2].operador!='%'){
              if(this.datasourcePriacu[a].id_tipo_insumo==this.tablaacusel[ind2].id_tipo_insumo && this.datasourcePriacu[a].descripcion==this.tablaacusel[ind2].descripcion && this.datasourcePriacu[a].precio==actual){
                let itemins='';
                for(let k=0;k<this.datasourcePri.length;k++){
                  if(this.datasourcePri[k].indice==this.datasourcePriacu[a].indice){
                    itemins=this.datasourcePri[k].item;
                    break;
                  }
                }
                var pala = itemins.toString().substring(0, itemact.toString().length + 1)
                if (pala == (itemact + '.')) {//debe ser diferente del actual
                  var acantidad = Number(this.datasourcePriacu[a].cantidad);
                  let nprec=this.formService.redondeo(Number(valor), this.dec_precio)
                  this.datasourcePriacu[a].precio=nprec;
                  let resparc=this.datasourcePriacu[a].operador=='%'?(Number(nprec)*acantidad)/100:Number(nprec)*acantidad;
                  this.datasourcePriacu[a].parcial=this.formService.redondeo(resparc, this.dec_precio);
                  this.ActfilCambiosAcu(this.datasourcePriacu[a].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[a]);
                  //fin actualizar fila acu(insumo)
                  let indpart=-1;
                  for(let m=0;m<this.datasourcePri.length;m++){
                    if(this.datasourcePri[m].indice==this.datasourcePriacu[a].indice){
                      indpart=m;
                      break;
                    }
                  }
                  let arrindacu=[];
                  for(let n=0;n<this.datasourcePriacu.length;n++){
                    if(this.datasourcePriacu[n].indice==this.datasourcePriacu[a].indice){
                      arrindacu.push(n);
                    }
                  }
                  //actualizar agrupacion del tipo y la partida a la que corresponde
                  let sumasinporc=this.ActparcialNovis(this.datasourcePriacu[a].id_tipo_insumo,indpart,arrindacu)//indice partida, arreglo de indices de su acu
                  //actualiza fila del insumo porcentaje si existe por tipo y vuelve a llamar al de arriba
                  this.actinsporcsinvis(this.datasourcePriacu[a].id_tipo_insumo,sumasinporc,this.datasourcePriacu[a].operador,indpart,arrindacu);//indice partida, arreglo de indices de su acu
                  //cambiar los metodos y solo guardar una vez los cambios de partida, pero si los cambios de los acu modificados(insumo y porcentaje si existe)
                  let existecer=0;
                  for(let indacu of arrindacu){
                    if(this.datasourcePriacu[indacu].unidad!='' && Number(this.datasourcePriacu[indacu].parcial)==0){
                      existecer=1;
                      break;
                    }
                  }
                  this.datasourcePri[indpart].advceros=existecer;//cambiar por la fila1 del arreglo
                  this.ActfilCambios(this.datasourcePri[indpart].accion==1?this.inserta:this.modifica,this.datasourcePri[indpart]);
                }
              }
            }
          }
          for(let b=0;b<this.datasourcePrisub.length;b++){//subpartidas, actualizan partidas detalle y principal
            //subpartidas no afectan al porcentaje, solo el insumo modificado al actual subp, sus predesesores no cambia mucho(solo cambiar precio y actualizar totales, no cambia porcentajes)
            if(this.tablaacusel[ind2].operador!='%'){
              if(this.datasourcePrisub[b].id_tipo_insumo==this.tablaacusel[ind2].id_tipo_insumo && this.datasourcePrisub[b].descripcion==this.tablaacusel[ind2].descripcion && this.datasourcePrisub[b].precio==actual){
                let itemins=this.itemSubpartida(b);
                var pala = itemins.toString().substring(0, itemact.toString().length + 1)
                if (pala == (itemact + '.')) {
                  var acantidad = Number(this.datasourcePrisub[b].cantidad);
                  let nprec=this.formService.redondeo(Number(valor), this.dec_precio);
                  this.datasourcePrisub[b].precio=nprec;
                  let resparc=this.datasourcePrisub[b].operador=='%'?(Number(nprec)*acantidad)/100:Number(nprec)*acantidad;
                  this.datasourcePrisub[b].parcial=this.formService.redondeo(resparc, this.dec_precio);
                  let indpadre=-1;
                  let arrindacu=[];
                  let nivel='s';//'s' subpartida,'a' acu
                  for(let l=0;l<this.datasourcePrisub.length;l++){
                    if(this.datasourcePrisub[l].indice_subp==this.datasourcePrisub[b].indice){
                      indpadre=l;
                      nivel='s';
                    }
                    if(this.datasourcePrisub[l].indice==this.datasourcePrisub[b].indice){
                      arrindacu.push(l);
                    }
                  }
                  if(indpadre==-1){
                    for(let o=0;o<this.datasourcePriacu.length;o++){
                      if(this.datasourcePriacu[o].indice_subp==this.datasourcePrisub[b].indice){
                        indpadre=o;
                        nivel='a';
                        break;
                      }
                    }
                  }
                  let sumasinporc=this.ActparcialSubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
                  this.actinsporcsubp(this.datasourcePrisub[b].id_tipo_insumo,sumasinporc,this.datasourcePrisub[b].operador,indpadre,arrindacu,this.datasourcePrisub,nivel);//indice partida, arreglo de indices de su acu
                  this.ActuaMontosPadre(indpadre,nivel)
                }
              }
            }
          }
          this.cambindiceselpresu(this.filaSel,true);
        }
      }
      else{
        let nprec=this.formService.redondeo(Number(valor), this.dec_precio);
        let resparc=this.tablaacusel[ind2].operador=='%'?(Number(nprec)*acantidad)/100:Number(nprec)*acantidad;
        if(this.errormaxval(resparc.toString(),'Parcial',10,'','El resultado de ')){ return }
        let indpri=this.tablaacusel[ind2].ind;
        this.tablaacusel[ind2].precio = nprec;
        this.datasourcePriacu[indpri].precio=nprec;
        this.tablaacusel[ind2].parcial = this.formService.redondeo(resparc, this.dec_precio);
        this.datasourcePriacu[indpri].parcial=this.formService.redondeo(resparc, this.dec_precio);
        this.ActfilCambiosAcu(this.datasourcePriacu[indpri].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[indpri]);
        let sumasinporc=this.Actparcialt1(this.datasourcePriacu[indpri].id_tipo_insumo)
        this.actinsporc(this.tablaacusel[ind2].id_tipo_insumo,sumasinporc,this.tablaacusel[ind2].operador);
        if(/* this.selprecio.value!=1 */this.butselprecio!='1'){
          this.actuaprecio(ind2,valor);
        }
        //actualizar el precio en subpartidas
        for(let b=0;b<this.datasourcePrisub.length;b++){//subpartidas, actualizan partidas detalle y principal
          //subpartidas no afectan al porcentaje, solo el insumo modificado al actual subp, sus predesesores no cambia mucho(solo cambiar precio y actualizar totales, no cambia porcentajes)
          if(this.tablaacusel[ind2].operador!='%'){
            if(this.datasourcePrisub[b].id_tipo_insumo==this.tablaacusel[ind2].id_tipo_insumo && this.datasourcePrisub[b].descripcion==this.tablaacusel[ind2].descripcion && this.datasourcePrisub[b].precio==actual){
              let itemins=this.itemSubpartida(b);
              if (itemins == this.item.value) {
                var acantidad = Number(this.datasourcePrisub[b].cantidad);
                let nprec=this.formService.redondeo(Number(valor), this.dec_precio);
                this.datasourcePrisub[b].precio=nprec;
                let resparc=this.datasourcePrisub[b].operador=='%'?(Number(nprec)*acantidad)/100:Number(nprec)*acantidad;
                this.datasourcePrisub[b].parcial=this.formService.redondeo(resparc, this.dec_precio);
                let indpadre=-1;
                let arrindacu=[];
                let nivel='s';//'s' subpartida,'a' acu
                for(let l=0;l<this.datasourcePrisub.length;l++){
                  if(this.datasourcePrisub[l].indice_subp==this.datasourcePrisub[b].indice){
                    indpadre=l;
                    nivel='s';
                  }
                  if(this.datasourcePrisub[l].indice==this.datasourcePrisub[b].indice){
                    arrindacu.push(l);
                  }
                }
                if(indpadre==-1){
                  for(let o=0;o<this.datasourcePriacu.length;o++){
                    if(this.datasourcePriacu[o].indice_subp==this.datasourcePrisub[b].indice){
                      indpadre=o;
                      nivel='a';
                      break;
                    }
                  }
                }
                let sumasinporc=this.ActparcialSubp(this.datasourcePrisub[b].id_tipo_insumo,indpadre,arrindacu,this.datasourcePrisub,nivel)//indice partida, arreglo de indices de su acu
                this.actinsporcsubp(this.datasourcePrisub[b].id_tipo_insumo,sumasinporc,this.datasourcePrisub[b].operador,indpadre,arrindacu,this.datasourcePrisub,nivel);//indice partida, arreglo de indices de su acu
                this.ActuaMontosPadre(indpadre,nivel)
              }
            }
          }
        }
        this.precio.setValue(this.datasourcePri[this.filaSel].precio);
        //actualizar el precio en subpartidas fin
        let existecer=0;
        for(let row of this.tablaacusel){
          if(row.unidad!='' && Number(row.parcial)==0){
            existecer=1;
            break;
          }
        }
        this.datasourcePri[this.filaSel].advceros=existecer;
        //agregar codigo para cambios indivicuales, cambio en titulos afecta a vinculados en otros titulos
        let itemact=this.datasourcePri[this.filaSel].item;
        let tit=itemact.substring(0,itemact.indexOf('.'));
        if(this.datasourcePri[this.filaSel].vinculo!=null && (/* this.selprecio.value==1  */this.butselprecio=='1' || /* this.selprecio.value==2 */this.butselprecio=='2')){
          let arrdetpri=[];
          let arrsubppri=[];
          for(let a=0;a<this.datasourcePri.length;a++){
            if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
              //buscar los detalles y subpartidas del principal
              let itemfila=this.datasourcePri[a].item;
              if((/* this.selprecio.value==2 */this.butselprecio=='2' && tit!=itemfila.substring(0,itemfila.indexOf('.'))) || /* this.selprecio.value==1 */this.butselprecio=='1'){
                if(arrdetpri.length<=0){
                  for(let rowacup of this.datasourcePriacu){
                    if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                      arrdetpri.push(rowacup);
                      if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                        this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                      }
                    }
                  }
                }
                //actualizar detalles
                this.atualizavinculado(arrdetpri,arrsubppri,a);
              }
            }
          }
        }
      }
      this.actualizarTemp(20);
    }
  }
  presentert1(event: any, ind: any) {
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat1(this.tablaacusel[ind].cantidad,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.tablaacusel.length) {
        for (let i = ind + 1; i < this.tablaacusel.length; i++) {
          if (this.tablaacusel[i].unidad != '') {
            event.target.blur();
            this.tablaacusel[i].editar = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (this.tablaacusel[i].unidad != '') {
            event.target.blur();
            this.tablaacusel[i].editar = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            break;
          }
        }
      }
    }
  }
  presentert2(event: any, ind: any) {
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat2(this.tablaacusel[ind].cuadrilla,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.tablaacusel.length) {
        for (let i = ind + 1; i < this.tablaacusel.length; i++) {
          if (this.tablaacusel[i].unidad != '') {
            event.target.blur();
            if(this.tablaacusel[i].afcuadrilla==0 || this.tablaacusel[i].operador=='%'){
              this.tablaacusel[i].editar = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            else{
              this.tablaacusel[i].editar3 = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (this.tablaacusel[i].unidad != '') {
            event.target.blur();
            if(this.tablaacusel[i].afcuadrilla==0 || this.tablaacusel[i].operador=='%'){
              this.tablaacusel[i].editar = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            else{
              this.tablaacusel[i].editar3 = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            break;
          }
        }
      }
    }
  }
  presentert3(event: any, ind: any) {
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat3(this.tablaacusel[ind].precio,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.tablaacusel.length) {
        for (let i = ind + 1; i < this.tablaacusel.length; i++) {
          if (this.tablaacusel[i].unidad != '' && this.tablaacusel[i].operador==null && this.tablaacusel[i].esinsumo==1) {
            event.target.blur();
            if (!this.esgruposel){
              this.tablaacusel[i].editar2 = 1;
            }
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (this.tablaacusel[i].unidad != '' && this.tablaacusel[i].operador==null && this.tablaacusel[i].esinsumo==1) {
            event.target.blur();
            if (!this.esgruposel){
              this.tablaacusel[i].editar2 = 1;
            }
            break;
          }
        }
      }
    }
  }
  Actparcialt1(idtipo: any) {//revisar
    let indgrupo = -1;
    let suma = 0;
    let sumasinporc=0;
    let sumatot=0;
    for (let i = 0; i < this.tablaacusel.length; i++) {
      if (this.tablaacusel[i].id_tipo_insumo == idtipo && this.tablaacusel[i].unidad == '') {
        indgrupo = i;
      }
      if (this.tablaacusel[i].id_tipo_insumo == idtipo && this.tablaacusel[i].unidad != '') {
        suma += Number(this.tablaacusel[i].parcial);
        sumatot += Number(this.tablaacusel[i].parcial);
        if(this.tablaacusel[i].operador==null){
          sumasinporc+=Number(this.tablaacusel[i].parcial);
        }
      }
      if (this.tablaacusel[i].id_tipo_insumo != idtipo && this.tablaacusel[i].unidad != '') {
        sumatot += Number(this.tablaacusel[i].parcial);
      }
    }
    if (indgrupo >= 0) {
      this.tablaacusel[indgrupo].parcial = this.formService.redondeo(suma, this.dec_precio);
      let nprec=this.formService.redondeo(sumatot,this.dec_precio)
      this.precio.setValue(nprec);
      var cantidad = Number(this.datasourcePri[this.filaSel].cantidad)
      this.datasourcePri[this.filaSel].precio=nprec;
      this.datasourcePri[this.filaSel].parcial=Number(this.formService.redondeo((cantidad * Number(nprec)), this.dec_parcial));
      this.ActfilCambios(this.datasourcePri[this.filaSel].accion==1?this.inserta:this.modifica,this.datasourcePri[this.filaSel]);
      this.calculartotalpadres(this.filaSel);
      let existecer=0;
      for(let rowacu of this.tablaacusel){
        if(rowacu.unidad!='' && Number(rowacu.parcial)==0){
          existecer=1;
          break;
        }
      }
      this.datasourcePri[this.filaSel].advceros=existecer;//cambiar por la fila1 del arreglo
      return sumasinporc;
    }
  }
  async verificarDecimales() {
    if(this.filaSel>-1){
      if(this.rendimiento.dirty){
        let rendiprinc=this.datasourcePri[this.filaSel].rendimiento.toString();
        let valrendi=Number(this.rendimiento.value.toString().replace(/\,/g,''));
        let rendiValido = await this.formService.redondeo(valrendi, 2);
        if(rendiprinc!=rendiValido){//si es diferente actualizar valores
          this.rendimiento.setValue(rendiValido)
          this.datasourcePri[this.filaSel].rendimiento=rendiValido;
          this.ActfilCambios(this.datasourcePri[this.filaSel].accion==1?this.inserta:this.modifica,this.datasourcePri[this.filaSel]);
          if(valrendi==0){
            this.undrendimiento.setValue('GLOBAL');
            this.datasourcePri[this.filaSel].und_rendi='GLOBAL';
          }
          else{
            this.undrendimiento.setValue('DIA');
            this.datasourcePri[this.filaSel].und_rendi='DIA';
          }
          for(let row of this.tablaacusel){
            if(row.num_det>0 && row.afcuadrilla==1 && row.operador!='%'){
              let cuadri=Number(row.cuadrilla);
              let aprecio=Number(row.precio);
              var canti=0;
              if(valrendi==0){
                row.cuadrilla=this.formService.redondeo(0,8);
                this.datasourcePriacu[row.ind].cuadrilla=this.formService.redondeo(0,8);
                canti=Number(row.cantidad);
              }else{
                if(cuadri==0 && aprecio!=0){
                  canti=Number(row.cantidad);
                  cuadri=(canti*valrendi)/Number(this.jornada.value.toString().replace(/\,/g,''));
                  row.cuadrilla=this.formService.redondeo(cuadri,8);
                  this.datasourcePriacu[row.ind].cuadrilla=this.formService.redondeo(cuadri, 8);
                }
                else{
                  var canti=(cuadri*Number(this.jornada.value.toString().replace(/\,/g,'')))/valrendi;
                }
              }
              row.cantidad=this.formService.redondeo(canti,this.dec_cant);
              this.datasourcePriacu[row.ind].cantidad=this.formService.redondeo(canti, this.dec_cant);
              row.parcial =this.formService.redondeo((Number(row.cantidad) * aprecio), this.dec_precio);
              this.datasourcePriacu[row.ind].parcial=this.formService.redondeo((Number(row.cantidad) * aprecio), this.dec_precio);
              this.ActfilCambiosAcu(this.datasourcePriacu[row.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[row.ind]);
            }
          }
          let existecer=0;
          for(let rowacu of this.tablaacusel){
            if(rowacu.unidad!='' && Number(rowacu.parcial)==0){
              existecer=1;
              break;
            }
          }
          this.CalcRatio();
          this.datasourcePri[this.filaSel].advceros=existecer;//cambiar por la fila1 del arreglo
          this.actualizarParcGrupos();
          //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
          if(this.datasourcePri[this.filaSel].vinculo!=null){
            let arrdetpri=[];
            let arrsubppri=[];
            for(let a=0;a<this.datasourcePri.length;a++){
              if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
                //buscar los detalles y subpartidas del principal
                if(arrdetpri.length<=0){
                  for(let rowacup of this.datasourcePriacu){
                    if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                      arrdetpri.push(rowacup);
                      if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                        this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                      }
                    }
                  }
                }
                //actualizar detalles
                this.atualizavinculado(arrdetpri,arrsubppri,a);
              }
            }
          }
          this.actualizarTemp(21);
        }
      }
    }
    else{
      this.toaster.error('Seleccione una partida antes de editar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  async verificarDecimalesJor() {
    if(this.filaSel>-1){
      if(this.jornada.dirty){
        let jornpri=this.datasourcePri[this.filaSel].jornada;
        let valjor=Number(this.jornada.value.toString().replace(/\,/g,''));
        const jornValido = await this.formService.redondeo(valjor, 0)
        if(jornpri!=Number(jornValido)){
          this.jornada.setValue(jornValido)
          this.datasourcePri[this.filaSel].jornada=jornValido;
          this.ActfilCambios(this.datasourcePri[this.filaSel].accion==1?this.inserta:this.modifica,this.datasourcePri[this.filaSel]);
          var arendi=Number(this.rendimiento.value.toString().replace(/\,/g,''));
          for(let row of this.tablaacusel){
            if(row.num_det>0 && row.afcuadrilla==1 && row.operador!='%'){
              let cuadri=Number(row.cuadrilla);
              let aprecio=Number(row.precio);
              var canti=arendi==0?Number(row.cantidad):(cuadri*valjor)/arendi;
              row.cantidad=this.formService.redondeo(canti,this.dec_cant);
              this.datasourcePriacu[row.ind].cantidad=this.formService.redondeo(canti, this.dec_cant);
              row.parcial =this.formService.redondeo((Number(row.cantidad) * aprecio), this.dec_precio);
              this.datasourcePriacu[row.ind].parcial=this.formService.redondeo((Number(row.cantidad) * aprecio), this.dec_precio);
              this.ActfilCambiosAcu(this.datasourcePriacu[row.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[row.ind]);
            }
          }
          let existecer=0;
          for(let rowacu of this.tablaacusel){
            if(rowacu.unidad!='' && Number(rowacu.parcial)==0){
              existecer=1;
              break;
            }
          }
          this.CalcRatio();
          this.datasourcePri[this.filaSel].advceros=existecer;//cambiar por la fila1 del arreglo
          this.actualizarParcGrupos();
          //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
          if(this.datasourcePri[this.filaSel].vinculo!=null){
            let arrdetpri=[];
            let arrsubppri=[];
            for(let a=0;a<this.datasourcePri.length;a++){
              if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
                //buscar los detalles y subpartidas del principal
                if(arrdetpri.length<=0){
                  for(let rowacup of this.datasourcePriacu){
                    if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                      arrdetpri.push(rowacup);
                      if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                        this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                      }
                    }
                  }
                }
                //actualizar detalles
                this.atualizavinculado(arrdetpri,arrsubppri,a);
              }
            }
          }
          this.actualizarTemp(22);
        }
      }
    }
    else{
      this.toaster.error('Seleccione una partida antes de editar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  actualizarParcGrupos(){
    let indgru=-1;
    let actgru;
    let parcialgru=0;
    let parcgrusinporc=0;
    let sumtot=0;
    for(let i=0;i<this.tablaacusel.length;i++){
      if(this.tablaacusel[i].num_det==0){
        if(indgru!=-1){
          sumtot+=parcialgru;
          this.tablaacusel[indgru].parcial=this.formService.redondeo(parcialgru,this.dec_precio);
          this.actinsporc(this.tablaacusel[indgru].id_tipo_insumo,parcgrusinporc,this.tablaacusel[indgru].operador);
        }
        indgru=i;
        actgru=this.tablaacusel[i];
        parcialgru=0;
        parcgrusinporc=0;
      }
      else{
        if(this.tablaacusel[i].id_tipo_insumo==actgru.id_tipo_insumo){
          parcialgru+=Number(this.tablaacusel[i].parcial)
          if(this.tablaacusel[i].unidad != '' && this.tablaacusel[i].operador==null){
            parcgrusinporc+=Number(this.tablaacusel[i].parcial)
          }
        }
      }
    }
    if(indgru!=-1){
      sumtot+=parcialgru;
      this.tablaacusel[indgru].parcial=this.formService.redondeo(parcialgru,this.dec_precio);
    }
    this.precio.setValue(this.formService.redondeo(sumtot,this.dec_precio));
    //llamar metodo actualizar precio y parcial de fila
    var cantidad = Number(this.datasourcePri[this.filaSel].cantidad)
    this.datasourcePri[this.filaSel].precio=Number(this.formService.redondeo(sumtot, this.dec_precio));
    this.datasourcePri[this.filaSel].parcial=Number(this.formService.redondeo((cantidad * sumtot), this.dec_parcial));
    this.ActfilCambios(this.datasourcePri[this.filaSel].accion==1?this.inserta:this.modifica,this.datasourcePri[this.filaSel]);
    this.calculartotalpadres(this.filaSel);
  }
  presentertRendi(event:any){
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  AgregarFilaBut(){
    if(this.filaSelacu>-1){
      let rowsel=this.tablaacusel[this.filaSelacu];
      if(rowsel.num_det==0){
        this.AgregarFilaIns(1)
      }
      else{
        this.AgregarFilaIns(3)
      }
    }
    else{
      this.toaster.error('Seleccione una fila para agregar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  async AgregarFilaIns(donde:any){//0:inicio,1:final,2:sobre,3:bajo//aqui nos quedamos
    try{
      if(!this.edicionacu || this.esgruposel || this.acuxmetrado){
        let msj=!this.edicionacu?'Habilitar la Edición de Costos Unitarios.':(this.esgruposel?'No se puede Editar los Costos Unitarios de un Titulo/Subtitulo.':'La edicion no esta disponible.');
        this.toaster.error(msj,'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        return;
      }
      if(this.filaSelacu>-1){
        let rowsel=this.tablaacusel[this.filaSelacu];
        if(rowsel.num_det==0){//agrupacion
          if(donde==2 || donde==3){
            this.toaster.error('No se puede agregar '+(donde==2?'sobre la selección.':'bajo la selección.'),'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
            return;
          }
        }
        if(rowsel.esinsumo==1){//insumos
          this.mostrar_carga_todo = true;
          /* let insumos=await this.catalogosService.BuscarDataInsumos({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo});
          let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:0 })
          let indicesunif = await this.configuracionService.listarIndiceUnificados({ activo: 1 }) */
          let arrexisten=[]
          let filagru;
          for(let row of this.tablaacusel){
            if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det!=0){
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false/* no cerrar el modal con ESC */})
          this.mostrar_carga_todo = false
          /* modalRef.componentInstance.insumos = insumos;
          modalRef.componentInstance.medidas = umedidas;
          modalRef.componentInstance.indices = indicesunif; */
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.inpfuente=1;
          modalRef.componentInstance.afcuad=rowsel.afcuadrilla;
          modalRef.componentInstance.tablaacu=this.datasourcePriacu;
          modalRef.componentInstance.moneda=this.simbolo;
          modalRef.componentInstance.iduser=this.id_userproy;
          modalRef.componentInstance.acuAct=JSON.parse(JSON.stringify(this.tablaacusel));
          const result = await modalRef.result
          if (result) {
            if (result.length > 0) {
              let admitidos = []
              for (let filaadd of result) {
                let existe = false;
                for (let i = 0; i < this.tablaacusel.length; i++) {
                  if (this.tablaacusel[i].id_tipo_insumo == filaadd.id_tipo_insumo && this.tablaacusel[i].descripcion == filaadd.descripcion) {
                    existe = true;
                  }
                }
                if (!existe) {
                  admitidos.push(filaadd);
                }
              }
              let indins=0;
              let nuevnumdet=0;
              if(donde==0){
                for(let i=0;i<this.tablaacusel.length;i++){
                  if (this.tablaacusel[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.tablaacusel[i].num_det==0) {
                    indins=i+1;
                    nuevnumdet=1;
                  }
                  else{
                    if(this.tablaacusel[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.tablaacusel[i].num_det!=0){
                      this.tablaacusel[i].num_det=Number(this.tablaacusel[i].num_det)+admitidos.length;
                      this.ActfilCambiosAcu(this.tablaacusel[i].accion==1?this.insertaacu:this.modificaacu,this.tablaacusel[i]);//verificar que solo sean insumos
                    }
                  }
                }
              }
              else{
                let indbusq=donde==3?this.filaSelacu+1:this.filaSelacu;
                indins=donde==3?this.filaSelacu+1:this.filaSelacu;
                nuevnumdet=donde==3?Number(this.tablaacusel[this.filaSelacu].num_det)+1:Number(this.tablaacusel[this.filaSelacu].num_det);
                for (let i = indbusq; i < this.tablaacusel.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                  if (this.tablaacusel[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                    if(donde!=1){
                      this.tablaacusel[i].num_det=Number(this.tablaacusel[i].num_det)+admitidos.length;
                      this.ActfilCambiosAcu(this.tablaacusel[i].accion==1?this.insertaacu:this.modificaacu,this.tablaacusel[i]);
                    }
                  }
                  else{
                    if(donde==1){
                      indins=i;
                      nuevnumdet=Number(this.tablaacusel[i - 1].num_det) + 1;
                      break;
                    }
                  }
                }
              }
              let indini=indins;
              let nronuevo=donde==0?1:nuevnumdet;
              for (let filaadd of admitidos) {
                let preciogru=0;
                if(filaadd.tipo_insumo){
                  for(let rowpri of this.tablaacusel){
                    if(rowpri.num_det>0 && rowpri.id_tipo_insumo==filaadd.tipo_insumo && rowpri.operador==null){
                      preciogru+=Number(rowpri.parcial);
                    }
                  }
                }
                //calcular total de cantidad o con cuadrilla, tambien ver si agrega algun porcentaje
                let cuadpasa=rowsel.afcuadrilla==1 && filaadd.operador!='%'?filaadd.cantidad:0;
                let cantpasa=0;
                let preciopasa=0;
                let parccal=0;
                if(filaadd.cantidad && Number(filaadd.cantidad)!=0){
                  var canti=0;
                  if(rowsel.afcuadrilla==1 && filaadd.operador!='%'){
                    canti=Number(this.rendimiento.value.toString())==0?Number(filaadd.cantidad):(cuadpasa*Number(this.jornada.value.toString().replace(/\,/g,'')))/Number(this.rendimiento.value.toString());
                  }
                  cantpasa=rowsel.afcuadrilla==1 && filaadd.operador!='%'?(this.formService.redondeo(canti,this.dec_cant)):filaadd.cantidad;
                  preciopasa=preciogru>0?preciogru:filaadd.precio;//filaadd.operador=='%'?():filaadd.precio;//buscar precio de agrupacion, si cumple condicion buscar, sino no, usar preciogru
                  parccal=filaadd.operador=='%'?(Number(cantpasa)*Number(preciopasa))/100 :Number(cantpasa)*Number(preciopasa);//condicionar si se opera con porcentaje
                }
                else{
                  preciopasa=preciogru>0?preciogru:filaadd.precio;
                }
                let agrega:rowacu = {
                  id_proyecto:this.id_proyecto,
                  indice_subp: null,
                  id_filadetalle:null,
                  num_det: nronuevo++,
                  codigo:filaadd.codigo,
                  descripcion: filaadd.descripcion,
                  id_unidad:filaadd.id_unidad,
                  unidad: filaadd.unidad,
                  operador:filaadd.operador,
                  tipo_insumo:filaadd.tipo_insumo,
                  cuadrilla: rowsel.afcuadrilla==1?(filaadd.cantidad??0):0,
                  cantidad: cantpasa,
                  precio: preciopasa,
                  parcial: this.formService.redondeo(parccal,this.dec_precio),
                  id_tipo_insumo: filaadd.id_tipo_insumo,
                  id_insumo: filaadd.id_insumo,
                  id_indice: filaadd.id_indice,
                  id_clasificacion:filaadd.id_clasificacion,//revisar valores
                  desc_clasi:filaadd.id_clasificacion?filaadd.desc_clasi:null,
                  id_subpartida: null,
                  esinsumo:rowsel.esinsumo,
                  afcuadrilla:rowsel.afcuadrilla,
                  rendimiento:null,
                  und_rendi:null,
                  jornada:null,
                  advceros:filaadd.advceros,
                  referencia:filaadd.referencia,
                  //afectaref:null,
                  icomost: '1',
                  mostrar: rowsel.icomost == '1' ? '1' : '0',
                  editar: 0,
                  editar2:0,
                  ind:this.datasourcePriacu.length,
                  accion:1,
                  indice:this.datasourcePri[this.filaSel].indice,
                  seleccion:0,
                  asignaund:0,
                  zidmodi:this.insertaacu.length>0?this.insertaacu[this.insertaacu.length-1].zidmodi+1:1
                };
                this.datasourcePriacu.push(agrega);
                this.tablaacusel.splice(indins,0,agrega);
                this.insertaacu.push(agrega);
                indins++;
              }
              this.filaSelacu=(donde==0 && rowsel.num_det!=0) || donde==2?this.filaSelacu+admitidos.length:this.filaSelacu;
              if (result.length != admitidos.length) {
                let difer = result.length - admitidos.length;
                this.toaster.error(difer + ' insumos ya existen.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
              }
              //calcular todales de la agrupacion y afectar a los porcentajes para calcular el total de toda la partida
              let sumasinporc=this.Actparcialt1(rowsel.id_tipo_insumo)
              this.actinsporc(rowsel.id_tipo_insumo,sumasinporc,rowsel.operador);
              this.filaSelacu=indini;
              if(admitidos.length>0){
                let insumosauto=await this.catalogosService.ListarInsumosAddAuto({id_usuario: this.id_userproy,id_tipo_insumo: rowsel.id_tipo_insumo});
                for(let rowauto of insumosauto){
                  let indexis=this.tablaacusel.find(elem=> elem.id_insumo==rowauto.id_insumo);
                  if(!indexis){
                    let preciogru=0;
                    let indagre=-1;
                    let numdetadd=-1;
                    let existipo=false;
                    for(let im=0;im<this.tablaacusel.length;im++){
                      if(this.tablaacusel[im].num_det>0 && this.tablaacusel[im].id_tipo_insumo==rowauto.tipo_insumo && this.tablaacusel[im].operador==null){
                        preciogru+=Number(this.tablaacusel[im].parcial);
                      }
                      if(!existipo && this.tablaacusel[im].id_tipo_insumo==rowauto.id_tipo_insumo){
                        existipo=true;
                      }
                      if(existipo && this.tablaacusel[im].id_tipo_insumo!=rowauto.id_tipo_insumo && indagre==-1){
                        numdetadd=(Number(this.tablaacusel[im-1].num_det))+1;
                        indagre=im;
                      }
                    }
                    let agrega:rowacu = {
                      id_proyecto:this.id_proyecto,
                      indice_subp: null,
                      id_filadetalle:null,
                      num_det: numdetadd,//posicion
                      codigo:rowauto.codigo,
                      descripcion: rowauto.descripcion,
                      id_unidad:rowauto.id_unidad,
                      unidad: rowauto.unidad,
                      operador:rowauto.operador,
                      tipo_insumo:rowauto.tipo_insumo,
                      cuadrilla: 0,
                      cantidad: 0,
                      precio: preciogru,
                      parcial: 0,
                      id_tipo_insumo: rowauto.id_tipo_insumo,
                      id_insumo: rowauto.id_insumo,
                      id_indice: rowauto.id_indice,
                      id_clasificacion:rowauto.id_clasificacion,//revisar valores
                      desc_clasi:rowauto.id_clasificacion?rowauto.desc_clasi:null,
                      id_subpartida: null,
                      esinsumo:rowsel.esinsumo,
                      afcuadrilla:rowsel.afcuadrilla,
                      rendimiento:null,
                      und_rendi:null,
                      jornada:null,
                      advceros:null,
                      referencia:null,
                      //afectaref:null,
                      icomost: '1',
                      mostrar: rowsel.icomost == '1' ? '1' : '0',
                      editar: 0,
                      editar2:0,
                      ind:this.datasourcePriacu.length,
                      seleccion:0,
                      accion:1,
                      indice:this.datasourcePri[this.filaSel].indice,
                      asignaund:0,
                      zidmodi:this.insertaacu.length>0?this.insertaacu[this.insertaacu.length-1].zidmodi+1:1
                    };
                    this.datasourcePriacu.push(agrega);
                    this.tablaacusel.splice(indagre,0,agrega);
                    this.insertaacu.push(agrega);
                  }
                }
              }
              let existecer=0;
              for(let filaacu of this.tablaacusel){
                if(filaacu.unidad!='' && Number(filaacu.parcial)==0){
                  existecer=1;
                  break;
                }
              }
              this.datasourcePri[this.filaSel].advceros=existecer;//cambiar por la fila1 del arreglo
              //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
              if(this.datasourcePri[this.filaSel].vinculo!=null && admitidos.length>0){
                let arrdetpri=[];
                let arrsubppri=[];
                for(let a=0;a<this.datasourcePri.length;a++){
                  if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
                    //buscar los detalles y subpartidas del principal
                    if(arrdetpri.length<=0){
                      for(let rowacup of this.datasourcePriacu){
                        if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                          arrdetpri.push(rowacup);
                          if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                            this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                          }
                        }
                      }
                    }
                    //actualizar detalles
                    this.atualizavinculado(arrdetpri,arrsubppri,a);
                  }
                }
              }
              this.actualizarTemp(23);
            }
          }
        }
        else{//cargar tabla con subpartidas
          let arrosubp=[];
          for(let row1 of this.datasourcePriacu){
            if(row1.id_tipo_insumo==5 && Number(row1.num_det)>0){
              let exist=arrosubp.find(ele=>ele.descripcion==row1.descripcion && ele.precio==row1.precio);
              if(!exist){
                arrosubp.push(JSON.parse(JSON.stringify(row1)));
              }
            }
          }
          for(let row2 of this.datasourcePrisub){
            if(row2.id_tipo_insumo==5 && Number(row2.num_det)>0){
              let exist=arrosubp.find(ele=>ele.descripcion==row2.descripcion && ele.precio==row2.precio);
              if(!exist){
                arrosubp.push(JSON.parse(JSON.stringify(row2)));
              }
            }
          }
          this.mostrar_carga_todo = true
          let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.id_userproy,fuente:this.fuentepasa, tipo_proy: this.tipoProy,idpadre:this.datasourcePri[this.filaSel].id_partida??'',restriccion:this.datasourcePri[this.filaSel].referencia??'' });//cambiar dinamico tipo_proy
          const modalRef = this.modalService.open(ModaladdsubpartidaComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false/* no cerrar el modal con ESC */})
          modalRef.componentInstance.partidacondiciona=this.datasourcePri[this.filaSel];
          modalRef.componentInstance.partidas = rpartidas;
          modalRef.componentInstance.subpartida = true;
          modalRef.componentInstance.tipoProy=this.arrtipoProy;//cargar los tipos de proyecto
          modalRef.componentInstance.tipoproysel=this.tipoProy;
          modalRef.componentInstance.fondo=this.titulo1;
          modalRef.componentInstance.color=this.titulo1color;
          modalRef.componentInstance.letra=this.titulo1letra;
          modalRef.componentInstance.medidas=this.medidas;
          modalRef.componentInstance.fuentecrea=this.fuentepasa;
          modalRef.componentInstance.dec_cant=this.dec_cant;
          modalRef.componentInstance.mask_cant=this.mask_cant;
          modalRef.componentInstance.dec_precio=this.dec_precio;
          modalRef.componentInstance.mask_precio=this.mask_precio;
          modalRef.componentInstance.tablaacu=this.datasourcePriacu;
          modalRef.componentInstance.tablaact=JSON.parse(JSON.stringify(this.datasourcePri));
          modalRef.componentInstance.tablaactacu=JSON.parse(JSON.stringify(this.datasourcePriacu));
          modalRef.componentInstance.tablaactsub=JSON.parse(JSON.stringify(this.datasourcePrisub));
          modalRef.componentInstance.subpartact=JSON.parse(JSON.stringify(arrosubp));
          modalRef.componentInstance.moneda=this.simbolo;
          modalRef.componentInstance.id_user=this.id_userproy;
          this.mostrar_carga_todo = false
          const result = await modalRef.result
          if (result) {
            this.mostrar_carga_todo=true;
            let admitidos=[];
            let titsubtitulos=0;
            if(result.forma==2){//del mismo proyecto
              for(let filaadd of result.partidas){
                let existe=false;
                for(let i=0;i<this.tablaacusel.length;i++){
                  //comparar si permite la referencia , ya se filtro antes de agregar
                  if(this.tablaacusel[i].esinsumo == 0 && (filaadd.id_partida && this.tablaacusel[i].id_subpartida==filaadd.id_partida)){
                    existe=true;
                  }
                }
                if(!existe){
                  admitidos.push(filaadd);
                }
              }
            }
            else{
              for(let filaadd of result.partidas){
                if(filaadd.esgrupo==1){
                  let existe=false;
                  for(let i=0;i<this.tablaacusel.length;i++){
                    //comparar si permite la referencia , ya se filtro antes de agregar
                    if(this.tablaacusel[i].esinsumo == 0 && filaadd.esgrupo==1 && (filaadd.id_partida && this.tablaacusel[i].id_subpartida==filaadd.id_partida)){
                      existe=true;
                    }
                  }
                  if(!existe){
                    admitidos.push(filaadd);
                  }
                }
                else{
                  titsubtitulos++;
                }
              }
            }
            let indins=0;
            let nuevnumdet=0;
            if(donde==0){
              for(let i=0;i<this.tablaacusel.length;i++){
                if (this.tablaacusel[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.tablaacusel[i].num_det==0) {
                  indins=i+1;
                  nuevnumdet=1;
                }
                else{
                  if(this.tablaacusel[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.tablaacusel[i].num_det!=0){
                    this.tablaacusel[i].num_det=Number(this.tablaacusel[i].num_det)+admitidos.length;
                    this.ActfilCambiosAcu(this.tablaacusel[i].accion==1?this.insertaacu:this.modificaacu,this.tablaacusel[i]);
                  }
                }
              }
            }
            else{
              let indbusq=donde==3?this.filaSelacu+1:this.filaSelacu;
              indins=donde==3?this.filaSelacu+1:this.filaSelacu;
              nuevnumdet=donde==3?Number(this.tablaacusel[this.filaSelacu].num_det)+1:Number(this.tablaacusel[this.filaSelacu].num_det);
              let tienecont=false;
              for (let i = indbusq; i < this.tablaacusel.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                if (this.tablaacusel[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                  if(donde!=1){
                    this.tablaacusel[i].num_det=Number(this.tablaacusel[i].num_det)+admitidos.length;
                    this.ActfilCambiosAcu(this.tablaacusel[i].accion==1?this.insertaacu:this.modificaacu,this.tablaacusel[i]);
                  }
                }
              }
              if(!tienecont && donde==1){
                indins=this.tablaacusel.length;
                nuevnumdet=this.tablaacusel[this.tablaacusel.length-1].num_det+1;
              }
            }
            let indini=indins;
            let nronuevo=donde==0?1:nuevnumdet;
            for(let filaadd of admitidos){
              let referpasa=null;
              if(filaadd.esinsumo==0 && filaadd.num_det>0){
                referpasa=filaadd.referencia==null || filaadd.referencia==''?this.datasourcePri[this.filaSel].id_partida:filaadd.referencia+","+this.datasourcePri[this.filaSel].id_partida;
              }
              let indicedet=this.ultindice++;
              let totpart;
              if(result.forma==1){
                let tabdet=await this.catalogosService.ListarDetalleDataPartidas({ id_partida: filaadd.id_partida });
                let arrdet=tabdet.length>0?tabdet[0]:[];
                let arrsub=tabdet.length>0?tabdet[1]:[];
                let arraux=[];
                arraux=arrdet.concat(arrsub);
                totpart=await this.CargarDetalleSubpartida(arraux,filaadd,filaadd.id_partida,indicedet,referpasa);//referencia debe ser null? si el padre es null?
              }
              else{//cargar arreglo de supbartidas
                this.CargarSubpartidasResult(result.subpartidas,indicedet,result.tipopart=='0'?filaadd.indice:filaadd.indice_subp,referpasa);//referencia no se modifica porque el padre no tiene id
              }
              let ncod='SP'+indicedet.toString().padStart(5,'0');
              let agrega:rowacu={
                id_proyecto:this.id_proyecto,
                indice_subp:indicedet,
                id_filadetalle:null,
                num_det:nronuevo++,
                codigo:ncod,//filaadd.codigo,
                descripcion:filaadd.descripcion,
                id_unidad:filaadd.id_unidad,
                unidad:filaadd.unidad,
                operador:null,
                tipo_insumo:null,
                cuadrilla:0,
                cantidad:0,
                precio:totpart?this.formService.redondeo(totpart,this.dec_precio):filaadd.precio,
                parcial:0,
                id_tipo_insumo:rowsel.id_tipo_insumo,
                id_insumo:null,
                id_indice:null,
                id_clasificacion:null,//revisar valores, subpartida null
                desc_clasi:null,
                id_subpartida:filaadd.id_subpartida,
                esinsumo:rowsel.esinsumo,
                afcuadrilla:0,
                icomost:'1',
                mostrar:rowsel.icomost=='1'?'1':'0',
                editar:0,
                editar2:0,
                ind:this.datasourcePriacu.length,
                rendimiento:filaadd.rendimiento,
                und_rendi:filaadd.und_rendi,
                jornada:filaadd.jornada,
                advceros:filaadd.advceros,
                referencia:referpasa,
                //afectaref:1,
                accion:1,
                indice:this.datasourcePri[this.filaSel].indice,
                seleccion:0,
                asignaund:0,
                zidmodi:this.insertaacu.length>0?this.insertaacu[this.insertaacu.length-1].zidmodi+1:1
              };
              this.datasourcePriacu.push(agrega);
              this.tablaacusel.splice(indins,0,agrega);
              this.insertaacu.push(agrega);
              indins++;
            }
            this.filaSelacu=indini;
            this.datasourcePri[this.filaSel].advceros=1;//cambiar por la fila1 del arreglo
            //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
            if(this.datasourcePri[this.filaSel].vinculo!=null && admitidos.length>0){
              let arrdetpri=[];
              let arrsubppri=[];
              for(let a=0;a<this.datasourcePri.length;a++){
                if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
                  //buscar los detalles y subpartidas del principal
                  if(arrdetpri.length<=0){
                    for(let rowacup of this.datasourcePriacu){
                      if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                        arrdetpri.push(rowacup);
                        if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                            this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                        }
                      }
                    }
                  }
                  //actualizar detalles
                  this.atualizavinculado(arrdetpri,arrsubppri,a);
                }
              }
            }
            this.actualizarTemp(24);
            this.mostrar_carga_todo=false;
            this.filaSelacu=(donde==0 && rowsel.num_det!=0) || donde==2?this.filaSelacu+admitidos.length:this.filaSelacu;
            if((result.partidas.length-titsubtitulos)!=admitidos.length){
              let difer=(result.partidas.length-titsubtitulos)-admitidos.length;
              this.toaster.error(difer+' subpartida(s) ya existen.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
            }
          }
        }
      }
      else{
        this.toaster.error('Seleccione una fila para agregar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      console.log(e)
    }
  }
  async ReemplazarIns(){
    try{
      if(!this.edicionacu || this.esgruposel || this.acuxmetrado){
        let msj=!this.edicionacu?'Habilitar la Edición de Costos Unitarios.':(this.esgruposel?'No se puede Editar los Costos Unitarios de un Titulo/Subtitulo.':'La edicion no esta disponible.');
        this.toaster.error(msj,'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        return;
      }
      if(this.filaSelacu>-1){
        let rowsel=this.tablaacusel[this.filaSelacu];
        if(rowsel.num_det==0){//agrupacion
          this.toaster.error('La fila seleccionada no se puede reemplazar','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
          return;
        }
        if(rowsel.esinsumo==1){//insumos
          this.mostrar_carga_todo = true;
          // let insumos=await this.catalogosService.BuscarDataInsumos({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo});
          // let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:0 })
          // let indicesunif = await this.configuracionService.listarIndiceUnificados({ activo: 1 })
          let arrexisten=[]
          let filagru;
          for(let row of this.tablaacusel){
            if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det!=0){
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false/* no cerrar el modal con ESC */})
          this.mostrar_carga_todo = false
          // modalRef.componentInstance.insumos = insumos;
          // modalRef.componentInstance.medidas = umedidas;
          // modalRef.componentInstance.indices = indicesunif;
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.reemplaza = true;
          modalRef.componentInstance.inpfuente=1;
          modalRef.componentInstance.mask_cant=this.mask_cant;
          modalRef.componentInstance.dec_cant=this.dec_cant;
          modalRef.componentInstance.tablaacu=this.datasourcePriacu;
          modalRef.componentInstance.rowfiltro=rowsel;
          modalRef.componentInstance.moneda=this.simbolo;
          modalRef.componentInstance.iduser=this.id_userproy;
          const result = await modalRef.result
          if (result) {
            if (result.length > 0) {
              let preciogru=0;
              if(result[0].tipo_insumo){
                rowsel.cuadrilla=0;
                for(let rowpri of this.tablaacusel){
                  if(rowpri.num_det>0 && rowpri.id_tipo_insumo==result[0].tipo_insumo && rowpri.operador==null){
                    preciogru+=Number(rowpri.parcial);
                  }
                }
              }
              else{
                preciogru=result[0].precio;
              }
              if(rowsel.afcuadrilla==1 && rowsel.operador=='%'){
                rowsel.cuadrilla=0;
                rowsel.cantidad=0;
              }
              let nparc=result[0].operador=='%'?(Number(rowsel.cantidad)*preciogru)/100:Number(rowsel.cantidad)*preciogru;
              let agrega:rowacu = {
                id_proyecto:this.id_proyecto,
                indice_subp:null,
                id_filadetalle:rowsel.id_filadetalle,
                num_det: rowsel.num_det,
                codigo:result[0].codigo,
                descripcion: result[0].descripcion,
                id_unidad:result[0].id_unidad,
                unidad: result[0].unidad,
                operador:result[0].operador,
                tipo_insumo:result[0].tipo_insumo,
                cuadrilla: rowsel.cuadrilla,
                cantidad:  rowsel.cantidad,
                precio: preciogru,
                parcial: this.formService.redondeo(nparc,this.dec_precio),
                id_tipo_insumo: result[0].id_tipo_insumo,
                id_insumo: result[0].id_insumo,
                id_indice: result[0].id_indice,
                id_clasificacion:result[0].id_clasificacion,//revisar valores
                desc_clasi:result[0].id_clasificacion?result[0].desc_clasi:null,
                id_subpartida: null,
                esinsumo:rowsel.esinsumo,
                afcuadrilla:rowsel.afcuadrilla,
                rendimiento:null,
                und_rendi:null,
                jornada:null,
                advceros:result[0].advceros,
                referencia:result[0].referencia,
                //afectaref:null,
                icomost: '1',
                mostrar: rowsel.icomost == '1' ? '1' : '0',
                editar: 0,
                editar2:0,
                ind:rowsel.ind,
                accion:rowsel.accion,
                indice:this.datasourcePri[this.filaSel].indice,
                seleccion:0,
                asignaund:0,
                zidmodi:this.tablaacusel[this.filaSelacu].zidmodi
              };
              //reemplazar en tablas
              this.tablaacusel[this.filaSelacu]=agrega;
              this.datasourcePriacu[rowsel.ind]=agrega;
              this.ActfilCambiosAcu(this.datasourcePriacu[rowsel.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[rowsel.ind]);
              let sumasinporc=this.Actparcialt1(this.tablaacusel[this.filaSelacu].id_tipo_insumo)
              this.actinsporc(this.tablaacusel[this.filaSelacu].id_tipo_insumo,sumasinporc,this.tablaacusel[this.filaSelacu].operador);
              //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
              if(this.datasourcePri[this.filaSel].vinculo!=null){
                let arrdetpri=[];
                let arrsubppri=[];
                for(let a=0;a<this.datasourcePri.length;a++){
                  if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
                    //buscar los detalles y subpartidas del principal
                    if(arrdetpri.length<=0){
                      for(let rowacup of this.datasourcePriacu){
                        if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                          arrdetpri.push(rowacup);
                          if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                            this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                          }
                        }
                      }
                    }
                    //actualizar detalles
                    this.atualizavinculado(arrdetpri,arrsubppri,a);
                  }
                }
              }
              this.actualizarTemp(25);
            }
          }
        }
        else{//subpartidas
          this.toaster.error('No se puede reemplazar una subpartida, Eliminar la subpartida y Agregar una nueva.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        }
      }
      else{
        this.toaster.error('Seleccione una fila para agregar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      console.log(e)
    }
  }
  async EliminarIns(){
    try {
      if(!this.edicionacu || this.esgruposel || this.acuxmetrado){
        let msj=!this.edicionacu?'Habilitar la Edición de Costos Unitarios.':(this.esgruposel?'No se puede Editar los Costos Unitarios de un Titulo/Subtitulo.':'La edicion no esta disponible.');
        this.toaster.error(msj,'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        return;
      }
      if(this.colselacu){//seleccion multiple
        let arrsel=[];
        let arrindic=[];
        let tipoins="";
        for(let i=0;i<this.tablaacusel.length;i++){
          if(this.tablaacusel[i].seleccion==1){
            arrsel.push(this.tablaacusel[i]);
            arrindic.push(i);
            tipoins=this.tablaacusel[i].id_tipo_insumo;
          }
        }
        if(arrsel.length>0){
          const respu=await SwalService.confirm('Esta seguro que desea Eliminar?','');
          if(!respu.isConfirmed){
            return;
          }
          let tipoinsactporc;
          for(let j=0;j<arrsel.length;j++){
            if(!tipoinsactporc){
              tipoinsactporc=!(this.datasourcePriacu[arrindic[j]].operador)?this.datasourcePriacu[arrindic[j]].id_tipo_insumo:tipoinsactporc;
            }
            /* for(let k=arrindic[j]+1;k<this.tablaacusel.length;k++){//actualizar nuevos num_det
              if(this.tablaacusel[k].id_tipo_insumo==arrsel[j].id_tipo_insumo){
                let newind=Number(JSON.parse(JSON.stringify(this.tablaacusel[k].num_det)))-1;
                this.tablaacusel[k].num_det=newind;
                this.datasourcePriacu[this.tablaacusel[k].ind].num_det=newind;
                this.ActfilCambiosAcu(this.tablaacusel[k].accion==1?this.insertaacu:this.modificaacu,this.tablaacusel[k]);
              }
            } */
            for(let row of this.tablaacusel){
              let indact=row.ind;
              if(indact>arrsel[j].ind){//actualizar ind si es mayor al eliminado
                row.ind=row.ind-1;
              }
            }
            if (arrsel[j].esinsumo == 0) {
              this.eliminaDatosSubp(arrsel[j])
            }
            this.datasourcePriacu.splice(arrsel[j].ind,1);
            this.ActElimArrCambiosAcu(arrsel[j]);
            this.tablaacusel.splice(arrindic[j],1);
            for(let a=j+1;a<arrindic.length;a++){
              arrindic[a]=arrindic[a]-1;
            }
          }
          let sumasinporc=this.Actparcialt1(arrsel[0].id_tipo_insumo);
          this.actinsporc(tipoinsactporc,sumasinporc,null);
          let existecer=0;
          for(let rowacu of this.tablaacusel){
            if(rowacu.unidad!='' && Number(rowacu.parcial)==0){
              existecer=1;
              break;
            }
          }
          let ndt=1;
          for(let k=0;k<this.tablaacusel.length;k++){//actualizar nuevos num_det
            if(this.tablaacusel[k].id_tipo_insumo==tipoins && this.tablaacusel[k].num_det!=0){
              this.tablaacusel[k].num_det=ndt;
              this.datasourcePriacu[this.tablaacusel[k].ind].num_det=ndt;
              this.ActfilCambiosAcu(this.tablaacusel[k].accion==1?this.insertaacu:this.modificaacu,this.tablaacusel[k]);
              ndt++;
            }
          }
          this.CalcRatio();
          this.datasourcePri[this.filaSel].advceros=existecer;//cambiar por la fila1 del arreglo
          //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
          if(this.datasourcePri[this.filaSel].vinculo!=null){
            let arrdetpri=[];
            let arrsubppri=[];
            for(let a=0;a<this.datasourcePri.length;a++){
              if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
                //buscar los detalles y subpartidas del principal
                if(arrdetpri.length<=0){
                  for(let rowacup of this.datasourcePriacu){
                    if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                      arrdetpri.push(rowacup);
                      if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                        this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                      }
                    }
                  }
                }
                //actualizar detalles
                this.atualizavinculado(arrdetpri,arrsubppri,a);
              }
            }
          }
          this.actualizarTemp(26);
        }
        else{
          this.toaster.error('Seleccione insumos para eliminar','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        }
      }
      else{//seleccion individual
        if(this.filaSelacu>-1){
          if(this.tablaacusel[this.filaSelacu].num_det!=0){
            const respu=await SwalService.confirm('Esta seguro que desea Eliminar?','');
            if(!respu.isConfirmed){
              return;
            }
            let indpri=this.tablaacusel[this.filaSelacu].ind;
            let tipoinssel=this.tablaacusel[this.filaSelacu].id_tipo_insumo;
            let operadorsel=this.tablaacusel[this.filaSelacu].operador;
            let ndt=1;
            for(let k=0;k<this.tablaacusel.length;k++){//actualizar num_det del grupo
              if(this.tablaacusel[k].id_tipo_insumo==tipoinssel && this.tablaacusel[k].num_det!=0){
                if(k!=this.filaSelacu){
                  this.tablaacusel[k].num_det=ndt;
                  this.datasourcePriacu[this.tablaacusel[k].ind].num_det=ndt;
                  this.ActfilCambiosAcu(this.tablaacusel[k].accion==1?this.insertaacu:this.modificaacu,this.tablaacusel[k]);
                  ndt++;
                }
              }
            }
            for(let row of this.tablaacusel){
              let indact=row.ind;
              if(indact>indpri){//actualizar ind si es mayor al eliminado
                row.ind=row.ind-1;
              }
            }
            if (this.tablaacusel[this.filaSelacu].esinsumo == 0) {
              this.eliminaDatosSubp(this.tablaacusel[this.filaSelacu])
            }
            this.ActElimArrCambiosAcu(this.tablaacusel[this.filaSelacu]);
            this.tablaacusel.splice(this.filaSelacu,1);
            this.datasourcePriacu.splice(indpri,1);
            this.filaSelacu=-1;
            let sumasinporc=this.Actparcialt1(tipoinssel);
            this.actinsporc(tipoinssel,sumasinporc,operadorsel);
            let existecer=0;
            for(let rowacu of this.tablaacusel){
              if(rowacu.unidad!='' && Number(rowacu.parcial)==0){
                existecer=1;
                break;
              }
            }
            this.CalcRatio();
            this.datasourcePri[this.filaSel].advceros=existecer;//cambiar por la fila1 del arreglo
            //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
            if(this.datasourcePri[this.filaSel].vinculo!=null){
              let arrdetpri=[];
              let arrsubppri=[];
              for(let a=0;a<this.datasourcePri.length;a++){
                if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
                  //buscar los detalles y subpartidas del principal
                  if(arrdetpri.length<=0){
                    for(let rowacup of this.datasourcePriacu){
                      if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                        arrdetpri.push(rowacup);
                        if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                          this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                        }
                      }
                    }
                  }
                  //actualizar detalles
                  await this.atualizavinculado(arrdetpri,arrsubppri,a);
                }
              }
            }
            this.actualizarTemp(27);
          }
          else{
            this.toaster.error('No se puede eliminar el elemento seleccionado','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
          }
        }
        else{
          this.toaster.error('Seleccione una insumo para eliminar','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        }
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false
      console.log(e)
    }
  }
  eliminaDatosSubp(filaelimina:any){
    for(let i=0;i<this.datasourcePrisub.length;i++){
      if(this.datasourcePrisub[i].indice==filaelimina.indice_subp){
        let feliminar=JSON.parse(JSON.stringify(this.datasourcePrisub[i]))
        this.datasourcePrisub.splice(i,1);
        i--;
        if (feliminar.esinsumo == 0) {//si es subpartida hacer un recursivo para que agregue sus detalles y subpartidas
          this.eliminaDatosSubp(feliminar);
        }
      }
    }
  }
  SubirFilaIns(){
    if(!this.edicionacu || this.esgruposel || this.acuxmetrado){
      let msj=!this.edicionacu?'Habilitar la Edición de Costos Unitarios.':(this.esgruposel?'No se puede Editar los Costos Unitarios de un Titulo/Subtitulo.':'La edicion no esta disponible.');
      this.toaster.error(msj,'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      return;
    }
    if(this.colselacu){//seleccion multiple
      let arrsel=[];
      let arrindic=[];
      for(let i=0;i<this.tablaacusel.length;i++){
        if(this.tablaacusel[i].seleccion==1){
          arrsel.push(this.tablaacusel[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for(let j=0;j<arrsel.length;j++){
          let sube=this.tablaacusel[arrindic[j]];
          let baja=this.tablaacusel[arrindic[j]-1];
          if(baja.seleccion==0 && baja.num_det>0){
            sube.num_det=sube.num_det-1;
            baja.num_det=baja.num_det+1;
            this.datasourcePriacu[sube.ind].num_det=sube.num_det;
            this.datasourcePriacu[baja.ind].num_det=baja.num_det;
            this.tablaacusel[arrindic[j]]=baja;
            this.tablaacusel[arrindic[j]-1]=sube;
            this.ActfilCambiosAcu(this.datasourcePriacu[sube.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[sube.ind]);
            this.ActfilCambiosAcu(this.datasourcePriacu[baja.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[baja.ind]);
          }
        }
        //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
        if(this.datasourcePri[this.filaSel].vinculo!=null){
          let arrdetpri=[];
          let arrsubppri=[];
          for(let a=0;a<this.datasourcePri.length;a++){
            if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
              //buscar los detalles y subpartidas del principal
              if(arrdetpri.length<=0){
                for(let rowacup of this.datasourcePriacu){
                  if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                    arrdetpri.push(rowacup);
                    if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                      this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                    }
                  }
                }
              }
              //actualizar detalles
              this.atualizavinculado(arrdetpri,arrsubppri,a);
            }
          }
        }
        this.actualizarTemp(28);
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else{
      if(this.filaSelacu>-1){
        let sube=this.tablaacusel[this.filaSelacu];
        let baja=this.tablaacusel[this.filaSelacu-1];
        if(sube.num_det!=0){
          if(baja.num_det!=0){
            sube.num_det=sube.num_det-1;
            baja.num_det=baja.num_det+1;;
            this.datasourcePriacu[sube.ind].num_det=sube.num_det;
            this.datasourcePriacu[baja.ind].num_det=baja.num_det;
            this.tablaacusel[this.filaSelacu]=baja;
            this.tablaacusel[this.filaSelacu-1]=sube;
            this.ActfilCambiosAcu(this.datasourcePriacu[sube.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[sube.ind]);
            this.ActfilCambiosAcu(this.datasourcePriacu[baja.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[baja.ind]);
            this.filaSelacu=this.filaSelacu-1;
            //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
            if(this.datasourcePri[this.filaSel].vinculo!=null){
              let arrdetpri=[];
              let arrsubppri=[];
              for(let a=0;a<this.datasourcePri.length;a++){
                if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
                  //buscar los detalles y subpartidas del principal
                  if(arrdetpri.length<=0){
                    for(let rowacup of this.datasourcePriacu){
                      if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                        arrdetpri.push(rowacup);
                        if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                          this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                        }
                      }
                    }
                  }
                  //actualizar detalles
                  this.atualizavinculado(arrdetpri,arrsubppri,a);
                }
              }
            }
            this.actualizarTemp(29);
          }
          else{
            this.toaster.error('Ya no se puede subir.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
          }
        }
        else{
          this.toaster.error('La fila seleccionada no se puede mover.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        }
      }
      else{
        this.toaster.error('Seleccione una fila para mover.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
  }
  BajarFilaIns(){
    if(!this.edicionacu || this.esgruposel || this.acuxmetrado){
      let msj=!this.edicionacu?'Habilitar la Edición de Costos Unitarios.':(this.esgruposel?'No se puede Editar los Costos Unitarios de un Titulo/Subtitulo.':'La edicion no esta disponible.');
      this.toaster.error(msj,'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      return;
    }
    if(this.colselacu){//seleccion multiple
      let arrsel=[];
      let arrindic=[];
      for(let i=0;i<this.tablaacusel.length;i++){
        if(this.tablaacusel[i].seleccion==1){
          arrsel.push(this.tablaacusel[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for(let j=arrsel.length-1;j>=0;j--){
          let sube=this.tablaacusel[arrindic[j]+1];
          let baja=this.tablaacusel[arrindic[j]];
          if(sube.seleccion==0 && sube.num_det>0){
            sube.num_det=sube.num_det-1;
            baja.num_det=baja.num_det+1;
            this.datasourcePriacu[sube.ind].num_det=sube.num_det;
            this.datasourcePriacu[baja.ind].num_det=baja.num_det;
            this.tablaacusel[arrindic[j]]=sube;
            this.tablaacusel[arrindic[j]+1]=baja;
            this.ActfilCambiosAcu(this.datasourcePriacu[sube.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[sube.ind]);
            this.ActfilCambiosAcu(this.datasourcePriacu[baja.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[baja.ind]);
          }
        }
        //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
        if(this.datasourcePri[this.filaSel].vinculo!=null){
          let arrdetpri=[];
          let arrsubppri=[];
          for(let a=0;a<this.datasourcePri.length;a++){
            if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
              //buscar los detalles y subpartidas del principal
              if(arrdetpri.length<=0){
                for(let rowacup of this.datasourcePriacu){
                  if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                    arrdetpri.push(rowacup);
                    if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                      this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                    }
                  }
                }
              }
              //actualizar detalles
              this.atualizavinculado(arrdetpri,arrsubppri,a);
            }
          }
        }
        this.actualizarTemp(30);
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else{
      if(this.filaSelacu>-1){
        if(this.filaSelacu<this.tablaacusel.length-1){
          let sube=this.tablaacusel[this.filaSelacu+1];
          let baja=this.tablaacusel[this.filaSelacu];
          if(baja.num_det!=0){
            if(sube.num_det!=0){
              sube.num_det=sube.num_det-1;
              baja.num_det=baja.num_det+1;;
              this.datasourcePriacu[sube.ind].num_det=sube.num_det;
              this.datasourcePriacu[baja.ind].num_det=baja.num_det;
              this.tablaacusel[this.filaSelacu]=sube;
              this.tablaacusel[this.filaSelacu+1]=baja;
              this.ActfilCambiosAcu(this.datasourcePriacu[sube.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[sube.ind]);
              this.ActfilCambiosAcu(this.datasourcePriacu[baja.ind].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[baja.ind]);
              this.filaSelacu=this.filaSelacu+1;
              //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
              if(this.datasourcePri[this.filaSel].vinculo!=null){
                let arrdetpri=[];
                let arrsubppri=[];
                for(let a=0;a<this.datasourcePri.length;a++){
                  if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
                    //buscar los detalles y subpartidas del principal
                    if(arrdetpri.length<=0){
                      for(let rowacup of this.datasourcePriacu){
                        if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                          arrdetpri.push(rowacup);
                          if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                            this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                          }
                        }
                      }
                    }
                    //actualizar detalles
                    this.atualizavinculado(arrdetpri,arrsubppri,a);
                  }
                }
              }
              this.actualizarTemp(31);
            }
            else{
              this.toaster.error('Ya no se puede bajar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
            }
          }
          else{
            this.toaster.error('La fila seleccionada no se puede mover.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
          }
        }
        else{
          this.toaster.error('Ya no se puede bajar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        }
      }
      else{
        this.toaster.error('Seleccione una fila para mover.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
  }
  OpcCodigo(opc:any){
    if(opc==1){//ver codigo
      this.mcodigo=true;
      this.codsoloiu=false;
    }
    else if(opc==2){//ver indice unif
      this.mcodigo=true;
      this.codsoloiu=true;
    }
    else if(opc==3){//ocultar codigo
      this.mcodigo=false;
    }
  }
  ActfilCambiosAcu(arrmodi:any,rowpri:any){
    if(rowpri.zidmodi){
      for(let a=0;a<arrmodi.length;a++){
        if(rowpri.indice==arrmodi[a].indice && rowpri.zidmodi==arrmodi[a].zidmodi && rowpri.id_tipo_insumo==arrmodi[a].id_tipo_insumo){
          arrmodi[a]=rowpri;
          break;
        }
      }
    }
    else{
      rowpri.zidmodi=arrmodi.length>0?arrmodi[arrmodi.length-1].zidmodi+1:1;
      arrmodi.push(rowpri);
    }
  }
  ActElimArrCambiosAcu(filaeli:any){
    if(filaeli.accion==1){//si se inserto, eliminamos de tabla insertar
      for(let i=0;i<this.insertaacu.length;i++){
        if(this.insertaacu[i].indice==filaeli.indice && this.insertaacu[i].zidmodi==filaeli.zidmodi && this.insertaacu[i].id_tipo_insumo==filaeli.id_tipo_insumo){
          this.insertaacu.splice(i,1);
          break;
        }
      }
    }
    else if(filaeli.accion==2){//si se actualizo la fila, se elimina de update y se agrega a eliminar
      for(let i=0;i<this.modificaacu.length;i++){
        if(this.modificaacu[i].indice==filaeli.indice && this.modificaacu[i].zidmodi==filaeli.zidmodi && this.modificaacu[i].id_tipo_insumo==filaeli.id_tipo_insumo){
          this.modificaacu.splice(i,1);
          break;
        }
      }
      this.eliminaacu.push(filaeli)
    }
    else if(filaeli.accion==0){//si no se hizo nada,se agrega a array eliminar
      this.eliminaacu.push(filaeli)
    }
  }
  CambDescUndtoPri(tipo:any){
    if(this.filaSel>-1){
      if(tipo==1){//descripcion
        let descpri=this.datasourcePri[this.filaSel].descripcion;
        if(descpri!=this.descripcion.value.toUpperCase()){
          this.datasourcePri[this.filaSel].descant=descpri;
          this.datasourcePri[this.filaSel].descripcion=this.descripcion.value.toUpperCase();
          this.datasourcePri[this.filaSel].vinculo=null;
          this.ActfilCambios(this.datasourcePri[this.filaSel].accion==1?this.inserta:this.modifica,this.datasourcePri[this.filaSel]);
          this.actualizarTemp(32);
        }
      }
    }
    else{
      this.toaster.error('Seleccione una partida antes de editar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  Cambioundren(value:any){
    if(this.filaSel>-1){
      this.datasourcePri[this.filaSel].und_rendi=value;
      this.ActfilCambios(this.datasourcePri[this.filaSel].accion==1?this.inserta:this.modifica,this.datasourcePri[this.filaSel]);
      if(this.datasourcePri[this.filaSel].vinculo!=null){
        for(let a=0;a<this.datasourcePri.length;a++){
          if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
            this.datasourcePri[a].und_rendi=value;
            this.ActfilCambios(this.datasourcePri[a].accion==1?this.inserta:this.modifica,this.datasourcePri[a]);
          }
        }
      }
      this.actualizarTemp(33);
    }
    else{
      this.toaster.error('Seleccione una partida antes de editar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  Cambioseltacu(row){
    if(!this.idgruselacu){
      this.idgruselacu=row.id_tipo_insumo;
    }
    if(row.seleccion==0){
      if(this.idgruselacu==row.id_tipo_insumo){
        row.seleccion=1;
      }
      else{
        row.seleccion=1;
        this.idgruselacu=row.id_tipo_insumo;
        for(let row2 of this.tablaacusel){
          if(row2.id_tipo_insumo!=row.id_tipo_insumo){
            row2.seleccion=0;
          }
        }
      }
    }
    else{
      row.seleccion=0;
    }
  }
  HabSelAcu(){
    if(!this.edicionacu || this.esgruposel || this.acuxmetrado){
      let msj=!this.edicionacu?'Habilitar la Edición de Costos Unitarios.':(this.esgruposel?'No se puede Editar los Costos Unitarios de un Titulo/Subtitulo.':'La edicion no esta disponible.');
      this.toaster.error(msj,'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      return;
    }
    this.colselacu=!this.colselacu;
    this.idgruselacu=null;
    for(let row of this.tablaacusel){
      row.seleccion=0;
    }
  }
  async OpenSubpartida(row,indice){
    if(this.edicionacu){
      let detallepart=[];
      let summano=0;
      let summat=0;
      let sumeq=0;
      let sumsubc=0;
      let sumsubp=0;
      for(let fila1 of this.datasourcePrisub){
        if(row.indice_subp==fila1.indice){
          detallepart.push(fila1);
          if(fila1.unidad!=''){
            if(fila1.id_tipo_insumo=='1'){
              summano+=Number(fila1.parcial);
            }
            else if(fila1.id_tipo_insumo=='2'){
              summat+=Number(fila1.parcial);
            }
            else if(fila1.id_tipo_insumo=='3'){
              sumeq+=Number(fila1.parcial);
            }
            else if(fila1.id_tipo_insumo=='4'){
              sumsubc+=Number(fila1.parcial);
            }
            else if(fila1.id_tipo_insumo=='5'){
              sumsubp+=Number(fila1.parcial);
            }
          }
        }
      }
      //agregar agrupaciones
      let pindice=detallepart.length>0?detallepart[0].indice:null;
      let filamano=this.CrearFilaAgru(pindice,'MANO DE OBRA','1',this.formService.redondeo(summano,this.dec_parcial),1,1);
      detallepart.push(filamano);
      filamano=this.CrearFilaAgru(pindice,'MATERIALES','2',this.formService.redondeo(summat,this.dec_parcial),1,0);
      detallepart.push(filamano);
      filamano=this.CrearFilaAgru(pindice,'EQUIPO','3',this.formService.redondeo(sumeq,this.dec_parcial),1,1);
      detallepart.push(filamano);
      filamano=this.CrearFilaAgru(pindice,'SUB CONTRATOS','4',this.formService.redondeo(sumsubc,this.dec_parcial),1,0);
      detallepart.push(filamano);
      filamano=this.CrearFilaAgru(pindice,'SUB PARTIDAS','5',this.formService.redondeo(sumsubp,this.dec_parcial),0,0);
      detallepart.push(filamano);
      detallepart.sort( (a, b) => {
        if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
        }
        return 0;
      });
      let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_userproy,fuente:'',activo: 1,operador:1 })
      //modalRef.componentInstance.indicepri=this.ultindice;
      this.medidas=umedidas;
      this.detallepartida = JSON.parse(JSON.stringify(detallepart));
      this.partida = JSON.parse(JSON.stringify(row));
      //this.tipoProy= this.arrtipoProy;
      this.indpri= indice;
      this.arrPriSubp=this.datasourcePrisub;
      //this.tipoproysel =  this.tipoProy
      //this.fuentecrea =  this.fuentepasa
      this.tablaacu=this.datasourcePriacu;
      this.tablaact=JSON.parse(JSON.stringify(this.datasourcePri));
      this.tablaactacu=JSON.parse(JSON.stringify(this.datasourcePriacu));
      this.tablaactsub=JSON.parse(JSON.stringify(this.datasourcePrisub));
      //this.id_user=this.id_userproy;
      await this.agregartab(this.partida, this.detallepartida);
      this.modalSubpart.show();
    }
    else{
      if(this.solover){
        let detallepart=[];
        let summano=0;
        let summat=0;
        let sumeq=0;
        let sumsubc=0;
        let sumsubp=0;
        for(let fila1 of this.datasourcePrisub){
          if(row.indice_subp==fila1.indice){
            detallepart.push(fila1);
            if(fila1.unidad!=''){
              if(fila1.id_tipo_insumo=='1'){
                summano+=Number(fila1.parcial);
              }
              else if(fila1.id_tipo_insumo=='2'){
                summat+=Number(fila1.parcial);
              }
              else if(fila1.id_tipo_insumo=='3'){
                sumeq+=Number(fila1.parcial);
              }
              else if(fila1.id_tipo_insumo=='4'){
                sumsubc+=Number(fila1.parcial);
              }
              else if(fila1.id_tipo_insumo=='5'){
                sumsubp+=Number(fila1.parcial);
              }
            }
          }
        }
        //agregar agrupaciones
        let pindice=detallepart.length>0?detallepart[0].indice:null;
        let filamano=this.CrearFilaAgru(pindice,'MANO DE OBRA','1',this.formService.redondeo(summano,this.dec_parcial),1,1);
        detallepart.push(filamano);
        filamano=this.CrearFilaAgru(pindice,'MATERIALES','2',this.formService.redondeo(summat,this.dec_parcial),1,0);
        detallepart.push(filamano);
        filamano=this.CrearFilaAgru(pindice,'EQUIPO','3',this.formService.redondeo(sumeq,this.dec_parcial),1,1);
        detallepart.push(filamano);
        filamano=this.CrearFilaAgru(pindice,'SUB CONTRATOS','4',this.formService.redondeo(sumsubc,this.dec_parcial),1,0);
        detallepart.push(filamano);
        filamano=this.CrearFilaAgru(pindice,'SUB PARTIDAS','5',this.formService.redondeo(sumsubp,this.dec_parcial),0,0);
        detallepart.push(filamano);
        detallepart.sort( (a, b) => {
          if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
          }
          return 0;
        });
        const modalRef = this.modalService.open(ModversubplecturaComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false });
        modalRef.componentInstance.moneda=this.simbolo;
        modalRef.componentInstance.detallepartida = JSON.parse(JSON.stringify(detallepart));
        modalRef.componentInstance.partida = JSON.parse(JSON.stringify(row));
        modalRef.componentInstance.indpri= indice;
        modalRef.componentInstance.tipoProy= this.arrtipoProy;
        modalRef.componentInstance.dec_precio =  this.dec_precio
        modalRef.componentInstance.mask_precio =  this.mask_precio
        modalRef.componentInstance.dec_cant =  this.dec_cant
        modalRef.componentInstance.mask_cant =  this.mask_cant
        modalRef.componentInstance.arrPriSubp=this.datasourcePrisub;
        const result = await modalRef.result
        //condicionar con this.solover al anterior
      }else{
        this.toaster.error('Habilitar edicion de Costos Unitarios.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
  }
  async abrirmodalUnidades(){
    this.mostrar_carga_todo = true
    let tablaunid = await this.adminservice.listarUnidadMed({ id_usuario:this.id_userproy,fuente:'',activo: 1,operador:1 })//cambiar a dinamico u otra consulta que retorne todo
    const valorInicial = this.medidas.find(data => data.id_unidad == this.unidad.value)
    const modalRef = await this.modalService.open(BuscaaddunidadmedComponent, { size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
    modalRef.componentInstance.Listaunidades = tablaunid;
    modalRef.componentInstance.operador = 1;
    modalRef.componentInstance.iduser = this.id_userproy;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      if(result.actarray){
        this.medidas=result.tablaact;
      }
      this.unidad.setValue(Number(result.datosel.id_unidad))
      let undsel=this.medidas.find(ele=>ele.id_unidad==this.unidad.value);
      this.undconcatrendi=undsel.unidad.toUpperCase();
      this.actualizarTemp(34);
    } else {
      if (valorInicial) {
        this.unidad.setValue(valorInicial.id_unidad)
      }
    }
  }
  cambUnidad(){
    if(this.unidad.value!=''){
      let undsel=this.medidas.find(ele=>ele.id_unidad==this.unidad.value);
      this.undconcatrendi=undsel.unidad.toUpperCase();
      let undpri=this.datasourcePri[this.filaSel].unidad;
      if(undpri!=undsel.unidad.toUpperCase()){
        this.datasourcePri[this.filaSel].unidad=undsel.unidad.toUpperCase();
        this.datasourcePri[this.filaSel].id_unidad=undsel.id_unidad;
        this.ActfilCambios(this.datasourcePri[this.filaSel].accion==1?this.inserta:this.modifica,this.datasourcePri[this.filaSel]);
        //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
        if(this.datasourcePri[this.filaSel].vinculo!=null){
          for(let a=0;a<this.datasourcePri.length;a++){
            if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
              //this.datasourcePri[a].und_rendi=value;
              this.datasourcePri[a].unidad=undsel.unidad.toUpperCase();
              this.datasourcePri[a].id_unidad=undsel.id_unidad;
              this.ActfilCambios(this.datasourcePri[a].accion==1?this.inserta:this.modifica,this.datasourcePri[a]);
            }
          }
        }
        this.actualizarTemp(35);
      }
    }
    else{
      this.undconcatrendi='';
    }
  }
  OrdendescRelins(){
    if(this.tablaacusel.length>0){
      this.orderacu=2;
      for(let row of this.tablaacusel){
        row.num_det=row.num_det>0?1:row.num_det;
      }
      this.tablaacusel.sort( (a, b) => {
        if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
        }
        if (a.descripcion > b.descripcion) {
          return -1;
        }
        if (a.descripcion < b.descripcion) {
          return 1;
        }
        return 0;
      });
      let ndet=1;
      for(let row of this.tablaacusel){
        if(row.num_det==0){
          ndet=1;
        }
        else{
          row.num_det=ndet++;
        }
      }
    }
  }
  OrdenascRelins(){
    if(this.tablaacusel.length>0){
      this.orderacu=1;
      for(let row of this.tablaacusel){
        row.num_det=row.num_det>0?1:row.num_det;
      }
      this.tablaacusel.sort( (a, b) => {
        if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
        }
        if (a.descripcion < b.descripcion) {
          return -1;
        }
        if (a.descripcion > b.descripcion) {
          return 1;
        }
        return 0;
      });
      let ndet=1;
      for(let row of this.tablaacusel){
        if(row.num_det==0){
          ndet=1;
        }
        else{
          row.num_det=ndet++;
        }
      }
    }
  }
  OrdenParcdescRelins(){
    if(this.tablaacusel.length>0){
      this.orderacu=4;
      for(let row of this.tablaacusel){
        row.num_det=row.num_det>0?1:row.num_det;
      }
      this.tablaacusel.sort( (a, b) => {
        if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
        }
        if (Number(a.parcial) > Number(b.parcial)) {
          return -1;
        }
        if (Number(a.parcial) < Number(b.parcial)) {
          return 1;
        }
        return 0;
      });
      let ndet=1;
      for(let row of this.tablaacusel){
        if(row.num_det==0){
          ndet=1;
        }
        else{
          row.num_det=ndet++;
        }
      }
    }
  }
  OrdenParcascRelins(){
    if(this.tablaacusel.length>0){
      this.orderacu=3;
      for(let row of this.tablaacusel){
        row.num_det=row.num_det>0?1:row.num_det;
      }
      this.tablaacusel.sort( (a, b) => {
        if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
        }
        if (Number(a.parcial) < Number(b.parcial)) {
          return -1;
        }
        if (Number(a.parcial) > Number(b.parcial)) {
          return 1;
        }
        return 0;
      });
      let ndet=1;
      for(let row of this.tablaacusel){
        if(row.num_det==0){
          ndet=1;
        }
        else{
          row.num_det=ndet++;
        }
      }
    }
  }
  //relacion de insumos
  cargaInsumoSubp(tabresult:any,cant_padre:any,cant_part:any,indice_padre:any,tabsub:any,deccant:any){
    deccant=deccant??this.dec_cant;
    for(let b=0;b<tabsub.length;b++){
      if(tabsub[b].indice==indice_padre){
        if(tabsub[b].esinsumo==0 && tabsub[b].num_det>0){
          let cantpasa=cant_padre*Number(tabsub[b].cantidad);
          this.cargaInsumoSubp(tabresult,cantpasa,cant_part,tabsub[b].indice_subp,tabsub,deccant);
        }
        else if(tabsub[b].esinsumo!=0){
          const index = tabresult.findIndex(elem => {
            if(elem.operador!='%'){
              if(elem.id_tipo_insumo.toString() == tabsub[b].id_tipo_insumo.toString() && elem.descripcion==tabsub[b].descripcion && elem.precio==tabsub[b].precio)
              return elem;
            }
            else{//porcentajes agrupa siempre, cantidad se recalcula
              if(elem.id_tipo_insumo.toString() == tabsub[b].id_tipo_insumo.toString() && elem.descripcion==tabsub[b].descripcion)
                return elem;
            }
          });
          if(index>-1){//si encuentra suma,
            if(tabsub[b].operador=='%'){
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), this.dec_parcial+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, this.dec_parcial);
              tabresult[index].parcial=this.formService.redondeo(Number(tabresult[index].parcial)+Number(parctot),this.dec_parcial);
            }
            else{
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), this.dec_parcial+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, this.dec_parcial);
              tabresult[index].parcial=this.formService.redondeo(Number(tabresult[index].parcial)+Number(parctot),this.dec_parcial);
              if(tabresult[index].unidad!=''){
                let ropera=this.formService.redondeo(Number(tabresult[index].parcial)/Number(tabresult[index].precio),deccant)
                tabresult[index].cantidad=tabsub[b].unidad!=''?Number(ropera):tabresult[index].cantidad;
              }
            }
            if(!tabresult[index].codigo && tabsub[b].codigo){
              tabresult[index].codigo=tabsub[b].codigo;
            }
          }
          else{//si no encuentra se agrega
            if(tabsub[b].operador=='%'){
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), this.dec_parcial+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, this.dec_parcial);
              tabsub[b].parcial=parctot;
            }
            else{
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), this.dec_parcial+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, this.dec_parcial);
              tabsub[b].parcial=parctot;
              let ropera=this.formService.redondeo(Number(parctot)/Number(tabsub[b].precio),deccant);
              tabsub[b].cantidad=tabsub[b].unidad!=''?Number(ropera):tabsub[b].cantidad;
            }
            tabresult.push(tabsub[b]);
            tabresult[tabresult.length-1].num_det=tabresult[tabresult.length-1].num_det>0?1:tabresult[tabresult.length-1].num_det;
            tabresult[tabresult.length-1].cuadrilla='';
          }
        }
      }
    }
    //return sumasub;
  }
  getTablaRelInsumos(deccant:any,totpre=0){
    deccant=deccant??this.dec_cant;
    try{
      let tabacu=JSON.parse(JSON.stringify(this.datasourcePriacu));
      let tabsub=JSON.parse(JSON.stringify(this.datasourcePrisub));
      let tabresult=[];
      for(let b=0;b<tabacu.length;b++){
        let rowpart;
        for(let fipart of this.datasourcePri){
          if(tabacu[b].indice==fipart.indice){
            rowpart=fipart;//partida principal para multiplicar por metrado
            break;
          }
        }
        if(tabacu[b].esinsumo==0 && tabacu[b].num_det>0){//es subapartida, cargar insumos de subpartida y hacer recursivo
          let cantpasa=Number(tabacu[b].cantidad);
          this.cargaInsumoSubp(tabresult,cantpasa,Number(rowpart.cantidad),tabacu[b].indice_subp,tabsub,deccant);
        }
        else if(tabacu[b].esinsumo!=0){
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
          if(index>-1){//si encuentra suma,
            if(tabresult[index].unidad!=''){
              if(tabacu[b].operador=='%'){
                let rparc=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(rowpart.cantidad)*Number(tabacu[b].parcial)),this.dec_parcial);
                tabresult[index].parcial=this.formService.redondeo(Number(rparc),this.dec_parcial);
              }
              else{
                let ropera=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(rowpart.cantidad)*Number(tabacu[b].parcial)),this.dec_parcial);
                tabresult[index].parcial=ropera;
                tabresult[index].cantidad=tabacu[b].unidad!=''?this.formService.redondeo(Number(tabresult[index].parcial)/Number(tabresult[index].precio),deccant):tabresult[index].cantidad;
              }
              if(!tabresult[index].codigo && tabacu[b].codigo){
                tabresult[index].codigo=tabacu[b].codigo;
              }
            }
          }
          else{//si no encuentra se agrega
            if(tabacu[b].operador=='%'){
              tabacu[b].cantidad=0;
              tabacu[b].precio=0;
              tabacu[b].parcial=this.formService.redondeo(Number(rowpart.cantidad)*Number(tabacu[b].parcial),this.dec_parcial);
            }
            else{
              let rparc=this.formService.redondeo(Number(rowpart.cantidad)*Number(tabacu[b].parcial),this.dec_parcial);
              tabacu[b].parcial=this.formService.redondeo(Number(rparc),this.dec_parcial);
              let ropera=this.formService.redondeo(Number(tabacu[b].parcial)/Number(tabacu[b].precio),deccant);
              tabacu[b].cantidad=tabacu[b].unidad!=''?Number(ropera):tabacu[b].cantidad;
            }
            tabresult.push(JSON.parse(JSON.stringify(tabacu[b])));
            tabresult[tabresult.length-1].num_det=tabresult[tabresult.length-1].num_det>0?1:tabresult[tabresult.length-1].num_det;
            tabresult[tabresult.length-1].cuadrilla='';
          }
        }
      }
      //corregir total en % mano obra operador% tipo_insumo1
      let totax=0;
      let indporc=-1;
      // let indporc2=-1;
      for(let r1=0;r1<tabresult.length;r1++){
        totax=totax+=Number(tabresult[r1].parcial);
        if(tabresult[r1].operador=='%' /* && tabresult[r1].tipo_insumo==1 */ && indporc==-1){
          indporc=r1;
        }
        // if(tabresult[r1].operador=='%' && indporc2==-1){
        //   indporc2=r1;
        // }
      }
      let indcor=indporc/* !=-1?indporc:(indporc2!=-1?indporc2:-1) */
      if(indcor>=0){
        console.log(this.formService.redondeo(totpre-totax,4))
        tabresult[indcor].parcial=this.formService.redondeo((Number(tabresult[indcor].parcial)+(totpre-totax)),this.dec_parcial);
      }
      //fin corr
      if(tabresult.length>0){
        let summano=0;
        let summat=0;
        let sumeq=0;
        let sumsubc=0;
        let sumsubp=0;
        let spsummano=0;
        let spsummat=0;
        let spsumeq=0;
        let spsumsubc=0;
        //calcular sumas, luego agregar agrupaciones 1 sola vez
        for(let m=0;m<tabresult.length;m++){
          if(tabresult[m].unidad!=''){
            if(tabresult[m].id_tipo_insumo=='1'){
              summano+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsummano+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='2'){
              summat+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsummat+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='3'){
              sumeq+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsumeq+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='4'){
              sumsubc+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsumsubc+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='5'){
              sumsubp+=Number(tabresult[m].parcial);
            }
          }
        }
        //agregar filas agrupaciones
        let pindice=tabresult.length>0?tabresult[0].indice:null;
        let filamano=this.CrearFilaAgru(pindice,'MANO DE OBRA','1',this.formService.redondeo(summano,this.dec_parcial),1,1);
        tabresult.push(filamano);
        filamano=this.CrearFilaAgru(pindice,'MATERIALES','2',this.formService.redondeo(summat,this.dec_parcial),1,0);
        tabresult.push(filamano);
        filamano=this.CrearFilaAgru(pindice,'EQUIPO','3',this.formService.redondeo(sumeq,this.dec_parcial),1,1);
        tabresult.push(filamano);
        filamano=this.CrearFilaAgru(pindice,'SUB CONTRATOS','4',this.formService.redondeo(sumsubc,this.dec_parcial),1,0);
        tabresult.push(filamano);
        filamano=this.CrearFilaAgru(pindice,'SUB PARTIDAS','5',this.formService.redondeo(sumsubp,this.dec_parcial),0,0);
        tabresult.push(filamano);
        tabresult.sort( (a, b) => {
          if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
          }
          if (a.descripcion < b.descripcion) {
            return -1;
          }
          if (a.descripcion > b.descripcion) {
            return 1;
          }
          return 0;
        });
        let naux=0;
        for(let row of tabresult){
          if(row.operador=="%"){
            row.precio=row.tipo_insumo=='1'?summano:row.tipo_insumo=='2'?summat:row.tipo_insumo=='3'?sumeq:row.tipo_insumo=='4'?sumsubc:'';
            let precfil=Number(row.precio);
            let parcial=Number(row.parcial);
            row.cantidad=row.precio==0 || row.parcial==0?0:this.formService.redondeo(parcial/precfil,deccant);
          }
          row.aux=naux++;
        }
      }
      return {datos:tabresult,total:totpre};
    }
    catch{
      return null;
    }
  }
  async relacionInsumosProy(){
    this.mostrar_carga=true;
    let sumatot=0;
    for(let rowres of JSON.parse(JSON.stringify(this.datasourcePri))){
      if(rowres.unidad!=''){
        sumatot+=Number(rowres.parcial)
      }
    }
    let tabresult=await this.getTablaRelInsumos(null,sumatot);
    let ubicaproy='';
    let fechapasa='';
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    if(this.datosproy){
      ubicaproy=(this.datosproy.deptact?this.datosproy.deptact:'')+' '+(this.datosproy.provact?this.datosproy.provact:'')+' '+(this.datosproy.distact?this.datosproy.distact:'')+' '+(this.datosproy.direccion?this.datosproy.direccion:'');
      fechapasa=moment(this.datosproy?.fecha_registro).format('DD-MM-YYYY');
    }
    this.mostrar_carga=false;
    const modalRef = this.modalService.open(RelacinsumosComponent, {size: 'xl',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
    modalRef.componentInstance.arreglo = tabresult.datos;//cambiar por el arreglo de tipos de proyecto
    modalRef.componentInstance.id_proyecto = this.id_proyecto;
    modalRef.componentInstance.descproy = this.datosproy?.descripcion;
    modalRef.componentInstance.propproy = this.datosproy?.desc_grupo;
    modalRef.componentInstance.ubicaproy = ubicaproy;
    modalRef.componentInstance.fechproy = fechapasa;
    modalRef.componentInstance.arrPriSubp=this.datasourcePrisub;
    modalRef.componentInstance.dec_metrado = this.dec_metrado;
    modalRef.componentInstance.mask_metrado = this.mask_metrado;
    modalRef.componentInstance.dec_precio = this.dec_precio;
    modalRef.componentInstance.mask_precio = this.mask_precio;
    modalRef.componentInstance.dec_parcial = this.dec_parcial;
    modalRef.componentInstance.mask_parcial = this.mask_parcial;
    modalRef.componentInstance.dec_cant = this.dec_cant;
    modalRef.componentInstance.mask_cant = this.mask_cant;
    modalRef.componentInstance.moneda = this.simbolo;
    modalRef.componentInstance.solover = this.solover;
    modalRef.componentInstance.total = this.formService.redondeo(sumatot,this.dec_parcial);
    modalRef.componentInstance.id_user = this.id_userproy;
    const result = await modalRef.result
    this.varGlobalesService.updrelacinsumo.next(null);
    if (result) {
    }
  }
  async OpenmodaddData() {
    try {
      let filapresel = this.filaSel;
      let unidadfila = filapresel >= 0 ? this.datasourcePri[filapresel].unidad : '';
      /* if (filapresel >= 0) { */
        this.mostrar_carga = true
        //let rproyectos = await this.presuservice.BuscarProyAddPresu({ id_usuario: this.id_user,fuente:'1',tipo_proy:'',id_proyecto:this.id_proyecto });//fuente 1 proyectos usuario
        let opcfilasel=unidadfila==''?false:true;
        if(this.datosproy==null){
          const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
          this.datosproy=detalleProyecto;
        }
        this.mostrar_carga = false;
        const modalRef = this.modalService.open(AddpartproyComponent, {size: 'xl',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
        /* modalRef.componentInstance.proyectos = rproyectos; */
        modalRef.componentInstance.tipoProy = this.arrtipoProy;//cambiar por el arreglo de tipos de proyecto
        modalRef.componentInstance.opcfila=opcfilasel;
        modalRef.componentInstance.tipofila=this.datasourcePri[this.filaSel]?this.datasourcePri[this.filaSel].tipofila:null;//condicionar si es vacio
        modalRef.componentInstance.fondo=this.titulo1;
        modalRef.componentInstance.color=this.titulo1color;
        modalRef.componentInstance.letra=this.titulo1letra;
        modalRef.componentInstance.tipoproypasa=this.tipoProy;
        modalRef.componentInstance.id_proypasa = this.id_proyecto;
        modalRef.componentInstance.presact=this.datasourcePri;
        modalRef.componentInstance.presdetact=this.datasourcePriacu;
        modalRef.componentInstance.pressubact=this.datasourcePrisub;
        modalRef.componentInstance.nomproyact=this.datosproy?.descripcion;
        modalRef.componentInstance.moneda = this.simbolo;
        modalRef.componentInstance.iduser = this.id_userproy;
        const result = await modalRef.result
        if (result) {
          this.mostrar_carga_todo=true;
          let itemsel=this.filaSel>-1?this.datasourcePri[this.filaSel].item:"NULL";
          let itemini='';
          let indins=-1;
          if(this.filaSel>-1){
            if(result.forma=="1"){//inicio
              itemini=itemsel+".1";
              indins=this.filaSel+1;
              for(let i=indins;i<this.datasourcePri.length;i++){
                var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
                if (palabra == itemsel) {
                  let separado = this.datasourcePri[i].item.toString().split('.');
                  let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                  let nuevonum = Number(separado[longi]) + result.cantitem;
                  separado[longi] = nuevonum.toString();
                  this.datasourcePri[i].item=separado.join('.');
                  this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                  this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
                }//desde la fila seleccionada
                else{
                  break;
                }
              }
            }
            else if(result.forma=="0"){//fin
              for(let i=this.filaSel+1;i<this.datasourcePri.length;i++){
                var palabra = this.datasourcePri[i].item.toString().substring(0, itemsel.length)
                if (palabra != itemsel) {
                  if(i-1==this.filaSel){
                    itemini=itemsel+".1";
                  }
                  else{
                    let arrultit=this.datasourcePri[i-1].item.split('.');
                    let auxite='';
                    for(let b=0;b<itemsel.split('.').length+1;b++){
                      auxite+=arrultit[b]+'.';
                    }
                    itemini=this.sigitem(auxite.substring(0,auxite.length-1));
                  }
                  indins=i;
                  break;
                }
              }
              if(indins==-1){
                let ultit=this.datasourcePri[this.datasourcePri.length-1].item;
                if(ultit==itemsel){
                  itemini=itemsel+".1";
                }
                else{
                  let arrultit=ultit.split('.');
                  let auxite='';
                  for(let b=0;b<itemsel.split('.').length+1;b++){
                    auxite+=arrultit[b]+'.';
                  }
                  itemini+=this.sigitem(auxite.substring(0,auxite.length-1));
                }
                indins=this.datasourcePri.length;
              }
            }
            else if(result.forma=="2" || result.forma=="3"){//3 bajo sel, 2 sobre sel
              itemini=result.forma=='3'?this.sigitem(itemsel):itemsel;//buscar el item inicial para agregar
              let indpri=this.filaSel;
              let enco=false;
              let condicion=itemsel.substring(0,itemsel.lastIndexOf('.')+1);//vacio si es titulo(1er nivel), 1. o 1.1.
              for(let i=indpri;i<this.datasourcePri.length;i++){
                var palabra = this.datasourcePri[i].item.toString().substring(0, condicion.length)
                if (palabra === condicion) {
                  var prefijo = this.datasourcePri[i].item.toString().substring(0, itemsel.length+1)
                  if((result.forma=='3' && (this.datasourcePri[i].item != itemsel && prefijo!=(itemsel+'.'))) || result.forma=='2'){
                    if(!enco){
                      indins=i;
                      enco=true;
                    }
                    let separado = this.datasourcePri[i].item.toString().split('.');
                    let longi = itemsel != "NULL" ? itemsel.split('.').length : 1;
                    let nuevonum = Number(separado[longi - 1]) + result.cantitem;
                    separado[longi - 1] = nuevonum.toString();
                    this.datasourcePri[i].item=separado.join('.');
                    this.datasourcePri[i].itemord=this.GenerarItemord(separado.join('.'));
                    this.ActfilCambios(this.datasourcePri[i].accion==1?this.inserta:this.modifica,this.datasourcePri[i]);
                  }
                }//desde la fila seleccionada
                else{
                  if(indins==-1){ indins=i; }
                  break;
                }
              }
              if(indins==-1){ indins=this.datasourcePri.length; }
            }
          }
          else{
            let itemaux=this.datasourcePri.length>0?this.datasourcePri[this.datasourcePri.length-1].item:'';
            let itemcom=itemaux==''?0:Number(itemaux.substring(0,itemaux.indexOf('.')));
            itemini=(itemcom+1).toString();
            indins=this.datasourcePri.length;
          }
          //agregar las filas 
          let indini=indins;
          let itemgru='';
          for(let filaadd of result.datos){//si es partida y tiene item sin punto, ignorar fila
            let newindice=this.ultindice++;
            //condicionar si pertenece a un grupo o no para poner siguiente item?
            let itemnuevo=itemini;
            if(itemgru==''){
              itemgru=filaadd.item;
            }
            else{
              var palabra = itemgru==filaadd.item?filaadd.item+'.':filaadd.item.toString().substring(0, itemgru.toString().length + 1);
              if(itemgru+'.'==palabra){
                itemnuevo=itemini+filaadd.item.substring(itemgru.length,filaadd.item.length-itemgru.length+1);
              }
              else{
                itemini=this.sigitem(itemini);
                itemgru=filaadd.item;
                itemnuevo=itemini;
              }
            }
            if(!itemnuevo.includes('.') && filaadd.unidad!=''){//condicionar si es partida y lo quiere poner como titulo, ignorar
              itemini=this.antitem(itemini);
              continue;
            }
            //agregar y modificar los detalles y subpartidas
            let arrdet=[];
            for(let f=0;f<result.detalle.length;f++){
              if(result.detalle[f].indice==filaadd.indice && result.detalle[f].num_det>0){//te quedaste en esta condicion
                arrdet.push(result.detalle[f]);
                result.detalle.splice(f,1);
                f--;
              }
            }
            let sumadet=0;
            let arragru=[];
            for(let m=0;m<arrdet.length;m++){//no calcula el total de la agrupacion
              if(arrdet[m].num_det!=0){
                let sumasubp=0;
                if(arrdet[m].esinsumo==0 && arrdet[m].num_det>0){//condicionar con id_partida!=null o agregar directamente detalle cuando se agrega la subpartida
                  let indicedet=arrdet[m].esinsumo==0 && arrdet[m].num_det>0?this.ultindice++:null;
                  sumasubp=await this.CorrigeSubpartidasResult(result.detsubp,arrdet[m],arrdet[m].indice_subp,indicedet,null,result.compartido);//se debe pasar subpartida
                  arrdet[m].indice_subp=indicedet;
                }
                let cantaux;
                if(arrdet[m].operador=='%'){
                  cantaux=this.formService.redondeo(Number(arrdet[m].cantidad),this.dec_cant);
                  arrdet[m].precio=0;
                }
                else{
                  if(arrdet[m].afcuadrilla==1){
                    var canti=Number(filaadd.rendimiento)==0?arrdet[m].cantidad:(Number(arrdet[m].cuadrilla)*Number(filaadd.jornada))/Number(filaadd.rendimiento);
                    cantaux=this.formService.redondeo(Number(canti),this.dec_cant);//se calcula, en el caso de afcuadrilla
                  }else{
                    cantaux=this.formService.redondeo(Number(arrdet[m].cantidad),this.dec_cant);
                  }
                }
                arrdet[m].cantidad=cantaux;
                let precioaux=arrdet[m].esinsumo==0 && arrdet[m].num_det>0?this.formService.redondeo(sumasubp,this.dec_precio):this.formService.redondeo(Number(arrdet[m].precio),this.dec_precio);
                arrdet[m].precio=precioaux;
                let nparc=Number(cantaux)*Number(precioaux);
                arrdet[m].parcial=this.formService.redondeo(nparc,this.dec_precio);
                let agruexs=arragru.find(ele=>ele.id_tipo_insumo==arrdet[m].id_tipo_insumo);
                if(agruexs && arrdet[m].operador!='%'){//suma
                  agruexs.parcial=Number(agruexs.parcial)+Number(arrdet[m].parcial);
                }else{//agrega
                  arragru.push({id_tipo_insumo:arrdet[m].id_tipo_insumo,parcial:nparc});
                }
              }
            }
            //calcular porcentajes
            for(let n=0;n<arrdet.length;n++){
              if(arrdet[n].operador=='%'){
                let exind=arragru.find(ele=>ele.id_tipo_insumo==arrdet[n].tipo_insumo);
                if(exind){
                  arrdet[n].precio=this.formService.redondeo(Number(exind.parcial),this.dec_precio);
                  arrdet[n].parcial=this.formService.redondeo((Number(arrdet[n].cantidad)*Number(arrdet[n].precio))/100,this.dec_precio);
                }
              }
            }
            for(let row of arrdet){//eliminar los encontradoa
              if(row.num_det>0){
                let filaaux:rowacu={
                  id_proyecto:this.id_proyecto,
                  num_det:row.num_det,
                  id_filadetalle:null,
                  codigo:row.codigo=='' || row.codigo==null?null:row.codigo,
                  descripcion:row.descripcion,
                  id_unidad:row.id_unidad,
                  unidad:row.unidad,
                  operador:row.operador,
                  tipo_insumo:row.tipo_insumo,
                  cuadrilla:row.cuadrilla!=null?Number(row.cuadrilla):null,
                  cantidad:row.cantidad!=null?Number(row.cantidad):null,
                  precio:row.precio!=null?Number(row.precio):null,
                  parcial:row.parcial!=null?Number(row.parcial):null,
                  id_tipo_insumo:Number(row.id_tipo_insumo),
                  id_indice:row.id_indice,
                  id_clasificacion:row.id_clasificacion,
                  desc_clasi:row.id_clasificacion?row.desc_clasi:null,
                  id_insumo:row.id_insumo?Number(row.id_insumo):null,
                  id_subpartida:row.id_subpartida,
                  indice:newindice,
                  indice_subp:row.indice_subp??null,
                  accion:1,
                  esinsumo:row.esinsumo,
                  afcuadrilla:row.afcuadrilla,
                  rendimiento:row.rendimiento,
                  und_rendi:row.und_rendi,
                  jornada:row.jornada,
                  advceros:row.advceros,
                  referencia:row.referencia,
                  mostrar:row.mostrar,
                  icomost:row.icomost,
                  editar:0,
                  editar2:0,
                  ind:-1,
                  seleccion:0,
                  asignaund:result.compartido,
                  zidmodi:this.insertaacu.length>0?this.insertaacu[this.insertaacu.length-1].zidmodi+1:1
                };
                this.datasourcePriacu.push(filaaux)
                this.insertaacu.push(filaaux);
                if(row.num_det>0){
                  sumadet+=Number(row.parcial)
                }
              }
            }
            //asignar sumadet a precio de la partida
            let preciopart=this.formService.redondeo(sumadet,this.dec_precio)
            let filaagrega=this.nuevafilapri(newindice,itemnuevo,filaadd.descripcion,filaadd.id_unidad,filaadd.unidad,filaadd.unidad!=''?0:null,filaadd.unidad!=''?preciopart:null,0,filaadd.rendimiento,filaadd.und_rendi,
              filaadd.jornada,filaadd.referencia,filaadd.id_partida,filaadd.advceros,filaadd.unidad!=''?2:(itemnuevo.includes('.')?1:0),1,1,this.id_userproy,filaadd.descripcion,result.compartido);
            this.datasourcePri.splice(indins++,0,filaagrega);
            this.inserta.push(filaagrega);
          }
          if(indini<this.datasourcePri.length)
            this.cambindiceselpresu(indini);
          this.actualizarTemp(36);
          this.mostrar_carga_todo=false;
        }
      /* }
      else {
        this.toaster.error('Seleccione una fila para agregar una contenido.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      } */
    }
    catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e)
    }
  }
  async CorrigeSubpartidasResult(subpartidas,filapadre,indicepadre,indicesubp,refer,asigund=0){
    let detpart=[];
    for(let f=0;f<subpartidas.length;f++){
      if(subpartidas[f].indice==indicepadre){
        detpart.push(subpartidas[f]);
        subpartidas.splice(f,1);
        f--;
      }
    }
    let sumapsubp=0;
    let arragru=[];
    for(let m=0;m<detpart.length;m++){
      if(detpart[m].num_det!=0){
        let sumasubp=0;
        if(detpart[m].esinsumo==0 && detpart[m].num_det>0){//condicionar con id_partida!=null o agregar directamente detalle cuando se agrega la subpartida
          let indicedet=this.ultindice++;
          sumasubp=await this.CorrigeSubpartidasResult(subpartidas,detpart[m],detpart[m].indice_subp,indicedet,refer,asigund);//se debe pasar subpartida
          detpart[m].indice_subp=indicedet;
        }
        let cantaux;
        if(detpart[m].operador=='%'){
          cantaux=this.formService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
          detpart[m].precio=0;
        }
        else{
          if(detpart[m].afcuadrilla==1){
            var canti=Number(filapadre.rendimiento)==0?detpart[m].cantidad:(Number(detpart[m].cuadrilla)*Number(filapadre.jornada))/Number(filapadre.rendimiento);
            cantaux=this.formService.redondeo(Number(canti),this.dec_cant);//se calcula, en el caso de afcuadrilla
          }else{
            cantaux=this.formService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
          }
        }
        detpart[m].cantidad=cantaux;
        let precioaux=detpart[m].esinsumo==0 && detpart[m].num_det>0?this.formService.redondeo(sumasubp,this.dec_precio):this.formService.redondeo(Number(detpart[m].precio),this.dec_precio);
        detpart[m].precio=precioaux;
        let nparc=Number(cantaux)*Number(precioaux);
        detpart[m].parcial=this.formService.redondeo(nparc,this.dec_precio);
        let agruexs=arragru.find(ele=>ele.id_tipo_insumo==detpart[m].id_tipo_insumo);
        if(agruexs && detpart[m].operador!='%'){//suma
          agruexs.parcial=Number(agruexs.parcial)+Number(detpart[m].parcial);
        }else{//agrega
          arragru.push({id_tipo_insumo:detpart[m].id_tipo_insumo,parcial:nparc});
        }
      }
    }
    //calcular porcentajes
    for(let n=0;n<detpart.length;n++){
      if(detpart[n].operador=='%'){
        let exind=arragru.find(ele=>ele.id_tipo_insumo==detpart[n].tipo_insumo);
        if(exind){
          detpart[n].precio=this.formService.redondeo(Number(exind.parcial),this.dec_precio);
          detpart[n].parcial=this.formService.redondeo((Number(detpart[n].cantidad)*Number(detpart[n].precio))/100,this.dec_precio);
        }
      }
    }
    for(let rowsubp of detpart){
      if(rowsubp.num_det>0){
        let referpasa=null;
        if(rowsubp.esinsumo==0 && rowsubp.num_det>0){
          referpasa=rowsubp.referencia==null || rowsubp.referencia==''?refer:(refer!=null?rowsubp.referencia+","+refer:rowsubp.referencia);
        }
        //let indicedet=rowsubp.esinsumo==0 && rowsubp.num_det>0?this.ultindice++:null;
        let agrega:rowacu={
          id_proyecto:this.id_proyecto,
          indice:indicesubp,//debe tener indice para vincular?
          id_filadetalle:null,
          //id_partida:rowsubp.id_partida,
          num_det:rowsubp.num_det,
          codigo:rowsubp.codigo=='' || rowsubp.codigo==null?null:rowsubp.codigo,
          descripcion:rowsubp.descripcion,
          id_unidad:rowsubp.id_unidad,
          unidad:rowsubp.unidad,
          operador:rowsubp.operador??null,
          tipo_insumo:rowsubp.tipo_insumo??null,
          cuadrilla:rowsubp.operador!='%' && rowsubp.cuadrilla!=null?Number(rowsubp.cuadrilla):null,
          cantidad:rowsubp.cantidad,
          precio:rowsubp.precio,
          parcial:rowsubp.parcial,
          id_tipo_insumo:rowsubp.id_tipo_insumo,
          id_insumo:rowsubp.id_insumo,
          id_indice:rowsubp.id_indice,
          id_clasificacion:rowsubp.id_clasificacion,//revisar valores
          desc_clasi:rowsubp.id_clasificacion?rowsubp.desc_clasi:null,
          id_subpartida:rowsubp.id_subpartida,
          indice_subp:rowsubp.indice_subp??null,
          esinsumo:rowsubp.esinsumo,
          afcuadrilla:rowsubp.afcuadrilla,
          rendimiento:rowsubp.rendimiento,
          und_rendi:rowsubp.und_rendi,
          jornada:rowsubp.jornada,
          advceros:rowsubp.advceros,
          referencia:referpasa,
          icomost:'1',
          mostrar:rowsubp.icomost=='1'?'1':'0',
          editar:0,
          editar2:0,
          ind:-1,
          seleccion:0,
          accion:1,
          asignaund:asigund,
          zidmodi:null
        };
        this.datasourcePrisub.push(agrega);
        if(rowsubp.num_det>0){
          sumapsubp+=Number(rowsubp.parcial)
        }
      }
    }
    return sumapsubp;
  }
  MetradoAcu(){
    this.acuxmetrado=!this.acuxmetrado;
    this.cambindiceselpresu(this.filaSel,true)
  }
  CambioEditajor(){
    this.editajor=!this.editajor;
    if(this.editajor){
      this.jornada.enable();
    }
    else{
      this.jornada.disable();
    }
  }
  CambEditaPrecio(idsel:any){
    if(this.esgruposel && idsel==1){
      //y que pasa con subtitulos?
      this.toaster.error('No se puede editar una fila en un Titulo seleccionado.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
    else{
      this.butselprecio=idsel;
    }
  }
  async openModalVinculo(){
    if(this.filaSel>-1){
      let rowsel=this.datasourcePri[this.filaSel];
      if(rowsel.unidad!=''){
        let data=JSON.parse(JSON.stringify(this.datasourcePri));
        let filtered = [];
        let arrind=[];
        let padre='';
        let rowpri;
        //console.log(stringSimilarity("EQUIPOS INDIVIDUAL INDI", "EQUIPO INDIVIDUAL PRIM"));//usar para comparar parecidos
        for (let i=data.length-1;i>=0;i--) {
          if(rowsel.vinculo && rowsel.vinculo==data[i].vinculo){
            let parece=stringSimilarity(data[i].descripcion, rowsel.descripcion);//usar para comparar parecidos
            data[i].seleccion=1;
            data[i].porc=this.formService.redondeo(parece*100,2);
            data[i].verbloq=1;
            filtered.push(data[i]);
            arrind.push(i);
            padre=data[i].item.substring(0,data[i].item.lastIndexOf('.'));
            if(rowsel.vinculo==data[i].indice){
              rowpri=data[i];
            }
          }
          else{
            let parece=stringSimilarity(data[i].descripcion, rowsel.descripcion);//usar para comparar parecidos
            if (parece>=0.9 && data[i].unidad!='') {
              if(data[i].unidad!='' && data[i].vinculo!=null){
                data[i].seleccion=2;
                //asignar vinculo existente?
                if(rowsel.vinculo && data[i].vinculo==rowsel.vinculo){
                  data[i].seleccion=1;
                  rowpri=data[i];
                }
              }
              else{
                data[i].seleccion=rowsel.indice==data[i].indice?1:0;
              }
              data[i].porc=this.formService.redondeo(parece*100,2);
              data[i].verbloq=1;
              filtered.push(data[i]);
              arrind.push(i);
              padre=data[i].item.substring(0,data[i].item.lastIndexOf('.'));
            }
          }
          if(padre==data[i].item){
            if(data[i].unidad!='' && data[i].vinculo!=null){
              data[i].seleccion=2;
            }
            filtered.push(data[i]);
            arrind.push(i);
            padre=data[i].item.split('.').length>1?data[i].item.substring(0,data[i].item.lastIndexOf('.')):'';
          }
        }
        let tablapasa=filtered.reverse();
        let indicestabla=arrind.reverse();
        const modalRef = this.modalService.open(ModalvincpartidaComponent, {size: 'xl',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
        modalRef.componentInstance.arreglo = tablapasa;//cambiar por el arreglo de tipos de proyecto
        modalRef.componentInstance.rowpasa = rowsel;
        modalRef.componentInstance.fondo=this.titulo1;
        modalRef.componentInstance.color=this.titulo1color;
        modalRef.componentInstance.letra=this.titulo1letra;
        modalRef.componentInstance.vincmayor=rowpri;
        modalRef.componentInstance.arrind=indicestabla;
        modalRef.componentInstance.dec_metrado = this.dec_metrado;
        modalRef.componentInstance.mask_metrado = this.mask_metrado;
        modalRef.componentInstance.dec_precio = this.dec_precio;
        modalRef.componentInstance.mask_precio = this.mask_precio;
        modalRef.componentInstance.dec_parcial = this.dec_parcial;
        modalRef.componentInstance.mask_parcial = this.mask_parcial;
        modalRef.componentInstance.moneda = this.simbolo;
        const result = await modalRef.result
        this.varGlobalesService.updvincPart.next(null);
        if (result) {//recorrer arreglo y comparar para saber si se edito
          if(result.todo==true){
            if(this.datasourcePri.length>400){
              this.mostrar_carga_todo=true;
            }
            for(let row of result.datos){
              for(let a=0;a<this.datasourcePri.length;a++){
                if(row.vinculo==this.datasourcePri[a].vinculo){
                  this.datasourcePri[a].vinculo=null;
                  this.datasourcePri[a].colorvin=null;
                  this.ActfilCambios(this.datasourcePri[a].accion==1?this.inserta:this.modifica,this.datasourcePri[a]);
                }
              }
            }
            this.cambindiceselpresu(this.filaSel,true);
            this.actualizarTemp(37);
            this.mostrar_carga_todo=false;
          }
          else{
            let arrdetpri=[];
            let arrsubppri=[];
            let arrindpasa=result.indices;
            this.mostrar_carga_todo = true;
            rowpri=result.nfilapri;
            for(let a=0;a<result.datos.length;a++){
              let cambiado=false;
              if(rowpri){
                if(result.desvpri && result.datos[a].seleccion==1 && result.datos[a].vinculo!=null){//actualizar la fila vinculo, los detalles no, cuando se Desvincula el principal
                  this.datasourcePri[arrindpasa[a]].vinculo=rowpri.indice;//quitar vinculo
                  this.datasourcePri[arrindpasa[a]].colorvin=result.colorv;
                  cambiado=true;
                  this.ActfilCambios(this.datasourcePri[arrindpasa[a]].accion==1?this.inserta:this.modifica,this.datasourcePri[arrindpasa[a]]);
                }
                if(result.datos[a].seleccion==1 && result.datos[a].vinculo==null){//al inicio el vinculosel es null, agrega vinculo
                  //buscar los detalles y subpartidas del principal
                  if(arrdetpri.length<=0){
                    for(let rowacup of this.datasourcePriacu){
                      if(rowacup.indice==rowpri.indice){
                        arrdetpri.push(rowacup);
                        if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                          this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                        }
                      }
                    }
                  }
                  //fin buscar los detalles y subpartidas del principal
                  this.datasourcePri[arrindpasa[a]].vinculo=rowpri.vinculo??rowpri.indice;//rowpri?rowpri.vinculo:
                  this.datasourcePri[arrindpasa[a]].colorvin=result.colorv;
                  //copiar los datos del principal?
                  if(this.datasourcePri[arrindpasa[a]].indice!=rowpri.indice){//es diferente al principal, agregar vinculo a los nuevos
                    var cantidad = Number(this.datasourcePri[arrindpasa[a]].cantidad)
                    var precio = Number(rowpri.precio)
                    this.datasourcePri[arrindpasa[a]].precio=rowpri.precio;
                    this.datasourcePri[arrindpasa[a]].parcial=this.formService.redondeo(cantidad*precio,this.dec_parcial);
                    this.datasourcePri[arrindpasa[a]].id_unidad=rowpri.id_unidad;
                    this.datasourcePri[arrindpasa[a]].unidad=rowpri.unidad;
                    this.datasourcePri[arrindpasa[a]].rendimiento=rowpri.rendimiento;
                    this.datasourcePri[arrindpasa[a]].und_rendi=rowpri.und_rendi;
                    this.datasourcePri[arrindpasa[a]].jornada=rowpri.jornada;
                    this.datasourcePri[arrindpasa[a]].referencia=rowpri.referencia;
                    this.datasourcePri[arrindpasa[a]].id_partida=rowpri.id_partida;
                    this.datasourcePri[arrindpasa[a]].advceros=rowpri.advceros;
                    this.calculartotalpadres(arrindpasa[a]);
                    //eliminar detalle existente(pasar al arreglo eliminar), recuperar el ultimo id_filadetalle(length arreglo), agregar nuevo detalle
                    for(let b=0;b<this.datasourcePriacu.length;b++){
                      if(this.datasourcePriacu[b].indice==this.datasourcePri[arrindpasa[a]].indice){
                        if (this.datasourcePriacu[b].esinsumo == 0 && this.datasourcePriacu[b].num_det>0) {//si es subpartida hacer un recursivo para que agregue sus detalles y subpartidas
                          //eliminar detalle subpartida si existiera y agregar de los nuevos si existen
                          this.eliminaDatosSubp(this.datasourcePriacu[b])
                        }
                        this.ActElimArrCambiosAcu(this.datasourcePriacu[b]);
                        this.datasourcePriacu.splice(b,1);
                        this.ActIndTabacusel(b);
                        b--;
                      }
                    }
                    //agregar nuevos detalles
                    for (let filaadd of arrdetpri) {
                      if(filaadd.num_det>0){
                        let referpasa=null;
                        if(filaadd.esinsumo==0 && filaadd.num_det>0){
                          referpasa=filaadd.referencia==null || filaadd.referencia==''?this.datasourcePri[this.filaSel].id_partida:filaadd.referencia+","+this.datasourcePri[this.filaSel].id_partida;
                        }
                        let indicedet=this.ultindice++;
                        let agrega:rowacu = {
                          id_proyecto:this.id_proyecto,
                          indice_subp: filaadd.esinsumo==0 && filaadd.num_det>0?indicedet:null,//condicionar con subpartida
                          id_filadetalle:null,
                          num_det: filaadd.num_det,
                          codigo:filaadd.codigo,
                          descripcion: filaadd.descripcion,
                          id_unidad:filaadd.id_unidad,
                          unidad: filaadd.unidad,
                          operador:filaadd.esinsumo==0 && filaadd.num_det>0?null:filaadd.operador,
                          tipo_insumo:filaadd.esinsumo==0 && filaadd.num_det>0?null:filaadd.tipo_insumo,
                          cuadrilla: filaadd.cuadrilla,
                          cantidad: filaadd.cantidad,
                          precio: filaadd.precio,
                          parcial: filaadd.parcial,
                          id_tipo_insumo: filaadd.id_tipo_insumo,
                          id_insumo: filaadd.id_insumo,
                          id_indice: filaadd.id_indice,
                          id_clasificacion:filaadd.id_clasificacion,//revisar valores
                          desc_clasi:filaadd.id_clasificacion?filaadd.desc_clasi:null,
                          id_subpartida: filaadd.esinsumo==0 && filaadd.num_det>0?filaadd.id_subpartida:null,
                          esinsumo:filaadd.esinsumo,
                          afcuadrilla:filaadd.afcuadrilla,
                          rendimiento:filaadd.esinsumo==0 && filaadd.num_det>0?filaadd.rendimiento:null,
                          und_rendi:filaadd.esinsumo==0 && filaadd.num_det>0?filaadd.und_rendi:null,
                          jornada:filaadd.esinsumo==0 && filaadd.num_det>0?filaadd.jornada:null,
                          advceros:filaadd.advceros,
                          referencia:referpasa,
                          icomost: '1',
                          mostrar: '1',
                          editar: 0,
                          editar2:0,
                          ind:this.datasourcePriacu.length,
                          accion:1,
                          indice:this.datasourcePri[arrindpasa[a]].indice,
                          seleccion:0,
                          asignaund:0,
                          zidmodi:this.insertaacu.length>0?this.insertaacu[this.insertaacu.length-1].zidmodi+1:1
                        };
                        this.datasourcePriacu.push(agrega);
                        this.insertaacu.push(agrega);
                        if(filaadd.esinsumo==0 && filaadd.num_det>0){
                          this.CargarSubpartidasResult(arrsubppri,indicedet,filaadd.indice_subp,referpasa);
                        }
                      }
                    }
                  }
                  cambiado=true;
                  this.ActfilCambios(this.datasourcePri[arrindpasa[a]].accion==1?this.inserta:this.modifica,this.datasourcePri[arrindpasa[a]]);
                }
                if(result.datos[a].seleccion==0 && result.datos[a].unidad!='' && result.datos[a].vinculo!=null ){//desvincular un vinculado
                  this.datasourcePri[arrindpasa[a]].vinculo=null;//quitar vinculo
                  this.datasourcePri[arrindpasa[a]].colorvin=null;
                  cambiado=true;
                  this.ActfilCambios(this.datasourcePri[arrindpasa[a]].accion==1?this.inserta:this.modifica,this.datasourcePri[arrindpasa[a]]);
                }
                if(result.datos[a].seleccion==1 && rowpri.colorvin!=result.colorv && !cambiado){//no se considera como cambios para actualizar en bd, solo agregar los que cambia, si cambia color, cambian todos
                  this.datasourcePri[arrindpasa[a]].colorvin=result.colorv;
                  this.ActfilCambios(this.datasourcePri[arrindpasa[a]].accion==1?this.inserta:this.modifica,this.datasourcePri[arrindpasa[a]]);
                }
              }
              else{
                if(result.datos[a].seleccion==0 && this.datasourcePri[arrindpasa[a]].unidad!='' && this.datasourcePri[arrindpasa[a]].vinculo!=null){//se quito el vinculo, no hay vinculo todo null
                  this.datasourcePri[arrindpasa[a]].vinculo=null;//quitar vinculo
                  this.datasourcePri[arrindpasa[a]].colorvin=null;
                  this.ActfilCambios(this.datasourcePri[arrindpasa[a]].accion==1?this.inserta:this.modifica,this.datasourcePri[arrindpasa[a]]);
                }
              }
              this.mostrar_carga_todo=false;
            }
            this.cambindiceselpresu(this.filaSel,true);
            //guardar en temp
            this.actualizarTemp(37);
          }
        }
      }
      else{
        this.toaster.error('Solo se pueden vincular partidas.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    else{
      this.toaster.error('Seleccione una partida para vincular.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async ClasiComerProy(){
    this.mostrar_carga_todo=true;
    let sumatot=0;
    for(let row of JSON.parse(JSON.stringify(this.datasourcePri))){
      if(row.unidad!=''){
        sumatot+=Number(row.parcial)
      }
    }
    let tabresult=this.getTablaRelInsumos(null,sumatot);
    /* for(let row1 of tabresult.datos){
      row1.num_det=row1.num_det>0?1:row1.num_det;
    } */
    let ubicaproy='';
    let fechapasa='';
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    if(this.datosproy){
      ubicaproy=(this.datosproy.deptact?this.datosproy.deptact:'')+' '+(this.datosproy.provact?this.datosproy.provact:'')+' '+(this.datosproy.distact?this.datosproy.distact:'')+' '+(this.datosproy.direccion?this.datosproy.direccion:'');
      fechapasa=moment(this.datosproy?.fecha_registro).format('DD-MM-YYYY');
    }
    const modalRef = this.modalService.open(ClasipartidaspresuComponent, {size: 'xl',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
    modalRef.componentInstance.arreglo = tabresult.datos;//cambiar por el arreglo de tipos de proyecto
    modalRef.componentInstance.id_proyecto = this.id_proyecto;
    modalRef.componentInstance.descproy = this.datosproy?.descripcion;
    modalRef.componentInstance.propproy = this.datosproy?.desc_grupo;
    modalRef.componentInstance.ubicaproy = ubicaproy;
    modalRef.componentInstance.fechproy = fechapasa;
    modalRef.componentInstance.arrPriSubp=this.datasourcePrisub;
    modalRef.componentInstance.dec_metrado = this.dec_metrado;
    modalRef.componentInstance.mask_metrado = this.mask_metrado;
    modalRef.componentInstance.dec_precio = this.dec_precio;
    modalRef.componentInstance.mask_precio = this.mask_precio;
    modalRef.componentInstance.dec_parcial = this.dec_parcial;
    modalRef.componentInstance.mask_parcial = this.mask_parcial;
    modalRef.componentInstance.dec_cant = this.dec_cant;
    modalRef.componentInstance.mask_cant = this.mask_cant;
    modalRef.componentInstance.moneda = this.simbolo;
    modalRef.componentInstance.solover = this.solover;
    modalRef.componentInstance.total = this.formService.redondeo(sumatot,this.dec_parcial);
    modalRef.componentInstance.id_user = this.id_userproy;
    this.mostrar_carga_todo=false;
    this.varGlobalesService.updclasinsumo.next(null);
    const result = await modalRef.result
    if (result) {
    }
  }
  abretotal
  totaldir
  async ListarIndirecto(){
    this.mostindir=!this.mostindir;
    if(this.mostindir){
      this.heightind=180;
      this.height=this.height-180;
      this.buscandoind=true;
      this.tabindir=[];
      let res= await this.presuservice.ListarPresuIndirecto({id_usuario:this.id_userproy,id_proyecto:this.id_proyecto,titulo:0});
      if(res.id=="1"){
        let tablapas=JSON.parse(res.tabla);
        this.tabindir=tablapas[0];
        let elementoEncontrado = this.tabindir.find(item => item.tipo_registro === 3)
        this.abretotal=elementoEncontrado?.abrev
        this.totaldir=elementoEncontrado?.monto
      }
      this.buscandoind=false;
      if(this.existetemp){//actualizar montos,siempre actualizar?
        this.RecalculaIndir();
      }
    }
    else{
      this.height+=180;
    }
  }
  RecalculaIndir(){
    let totpresu=0;
    for(let row of this.datasourcePri){
      if(row.item.substring('.').length==1){
        totpresu+=Number(row.parcial);
      }
    }
    for(let a=0;a<this.tabindir.length;a++){
      if(this.tabindir[a].tipo_registro==3)//costo directo
      {
        this.tabindir[a].monto=this.formService.redondeo(totpresu,this.dec_parcial);
      }
    }
    //actualizar en tabla indirecto antes de calcular
    this.CalcularTabla();
  }
  CalcularTabla(){
    let arraux=JSON.parse(JSON.stringify(this.tabindir));
    for (let a = 0; a < arraux.length; a++) {
      let formula = arraux[a].formula == null||arraux[a].tipo_registro==4 ? '' : arraux[a].formula;
      if (formula == '') {
        arraux[a].calculado = 1;
      } else {
        arraux[a].calculado = 0;
      }
      arraux[a].indice = a;
    }
    for(let b=0;b<arraux.length;b++){
      if(arraux[b].calculado==0){
        let continua=true;
        const arregloResultado = this.convertirAArray(arraux[b].formula);
        for(let a=0;a<arregloResultado.length;a++){
          const operadores = arregloResultado[a].toString().match(/[+\-*()/]/g);
          // Si no hay operadores, devolver el arreglo con el string completo
          if (!operadores) {
            for(let row of arraux){
              if(row.abrev==arregloResultado[a]){
                if(row.calculado==1){
                  arregloResultado[a]=row.monto;
                }
                else{
                  let raux=JSON.parse(JSON.stringify(arraux[b]));
                  arraux.splice(b,1);
                  arraux.push(raux);
                  b--;
                  continua=false;
                  break;
                }
              }
            }
          }
          if(!continua){
            break;
          }
        }
        if(continua){
          let result=this.calcularformula(arregloResultado.join(''));
          if(result==null || result==Infinity){
            //this.datasourcePri[i].formula='';
            arraux[b].monto=0;
            let allnum=true;
            for(let a=0;a<arregloResultado.length;a++){
              const operadores = arregloResultado[a].toString().match(/[+\-*()/]/g);
              if (!operadores) {
                if(isNaN(Number(arregloResultado[a]))){
                  allnum=false;
                  break;
                }
              }
            }
            if(allnum){
              arraux[b].calculado=1
            }
          }
          else{
            arraux[b].monto=this.formService.redondeo(result,this.dec_parcial);
            arraux[b].calculado=1
          }
        }
      }
    }
    for(let filas of arraux){
      this.tabindir[filas.indice].monto=filas.monto;
    }
  }
  calcularformula(texto){
    try{ return math.evaluate(texto); }catch{ return null; }
  }
  convertirAArray(expresion: string): string[] {
    const partes = expresion.split(/([\+\-\*/\(\)])/);
    const resultado = partes.filter(elemento => elemento !== '');
    return resultado;
  }
  cambindiceselind(ind:any){
    if (ind != this.filaSel){
      this.filaselind=ind;
    }
  }
  async VerificarOrden(){
    let error='';
    let empieza=false;
    let arrorden=[];//para repetidos? buscar? o por el orden del item?
    let nocumple=false;
    for(let row of this.datasourcePri){
      let itemact=row.item.toString();
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
      console.log(error)
      //this.toaster.error(error+'| '+error0, 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      SwalService.error('Mandar Captura de Error', error)
      return;
    }
    console.log('correcto')
  }
  async ImportarPresu(){
    this.mostrar_carga_todo = true
    let indices = await this.configuracionService.listarIndiceUnificados()
    const modalRef = this.modalService.open(ModalimportaproyComponent, { size: 'xl',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
    modalRef.componentInstance.idUsuario = this.id_userproy;
    modalRef.componentInstance.idProyecto=this.id_proyecto;
    modalRef.componentInstance.dec_metrado=this.dec_metrado;
    modalRef.componentInstance.dec_precio=this.dec_precio;
    modalRef.componentInstance.dec_parcial=this.dec_parcial;
    modalRef.componentInstance.dec_cant=this.dec_cant;
    modalRef.componentInstance.tindices=indices;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result == 'ok') {
      //asignar presupuesto
      this.mostrar_carga=true;
      let res= await this.presuservice.listarTopPresupuesto({id_proyecto:this.id_proyecto});
        this.datasourcePri=res[0]
        this.datasourcePriacu=res[1];
        this.datasourcePrisub=res[2];
        this.datasourcePrisubaux=JSON.stringify(res[2]);
        let resindi=await this.presuservice.UltimoIndicePresu({id_proyecto:this.id_proyecto});
        this.ultindice=resindi[0].ultindice;
      this.mostrar_carga=false;
      SwalService.success('Correcto', result.mensaje)
    }
  }
  Anumero(val:any){
    return Number(val);
  }
  async Imprime(){
    if(this.existetemp){
      this.toaster.error('Guardar sus cambios antes de generar Reportes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return;
    }
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    const arrayHeader = ['ITEM', 'DESCRIPCION', 'UNIDAD', 'METRADO', 'PRECIO', 'PARCIAL']
    const arrayKeys = ['item', 'descripcion', 'unidad', 'cantidad', 'precio', 'parcial']
    const arrdec=[null,null,null,this.dec_metrado,this.dec_precio,this.dec_parcial];
    const arralig=['left','left','center','right','right','right'];
    let aux=JSON.parse(JSON.stringify(this.datasourcePri));
    let arrpasa=[];
    let arrtit=[];
    arrtit.push({
      item:'',
      descripcion:'COMPLETO',
    });
    for(let row of aux){//asignar colores
      let tipol='';
      let colorl='';
      let fondol='';
      let valor2= row.item.toString().split('.');
      if(this.titulo1letra!=undefined)
      {
        if(row.unidad!='')
        {
          colorl=this.titulo1letra[11]
        }
        else
        {
          let ind=valor2.length>=12?11:valor2.length-1;
          colorl=this.titulo1letra[ind];
        }
      }
      if(this.titulo1color!=undefined)
      {
        if(row.unidad!='')
        {
          fondol = this.titulo1color[11];
        }
        else
        {
          let ind=valor2.length>=12?11:valor2.length-1;
          fondol=this.titulo1color[ind];
        }
      }
      if(this.titulo1!=undefined)
      {
        if(row.unidad!='')
        {
          tipol = this.titulo1[11];
        }
        else{
          let ind=valor2.length>=12?11:valor2.length-1;
          tipol=this.titulo1[ind];
        }
      }
      let esp=' ';
      let descp=esp.repeat(valor2.length-1)+row.descripcion;
      arrpasa.push({
        indice:row.indice,
        item:row.item,
        itemord:row.itemord,
        descripcion:descp,
        id_unidad:row.id_unidad,
        unidad:row.unidad,
        cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
        //jornada:,
        precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
        parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
        //rendimiento:,
        tipofila:row.tipofila,
        //und_rendi:,
        tipoletra:tipol,
        color:colorl=='unset'?'':colorl,
        fondo:fondol=='none'?'':fondol
      });
      if(!(row.item.includes('.'))){
        arrtit.push({
          indice:row.indice,
          item:row.item,
          itemord:row.itemord,
          descripcion:descp,
          id_unidad:row.id_unidad,
          unidad:row.unidad,
          cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
          //jornada:,
          precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
          parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
          //rendimiento:,
          tipofila:row.tipofila,
          //und_rendi:,
          tipoletra:tipol,
          color:colorl=='unset'?'':colorl,
          fondo:fondol=='none'?'':fondol
        });
      }
    }
    //agregar footer
    let tablaTotales = []
    if(this.tabindir.length==0){
      this.tabindir=[];
      let res= await this.presuservice.ListarPresuIndirecto({id_usuario:this.id_userproy,id_proyecto:this.id_proyecto,titulo:0});
      if(res.id=="1"){
        let tablapas=JSON.parse(res.tabla);
        this.tabindir=tablapas[0];
      }
    }
    for (const iterator of this.tabindir) {
      let formulaaux
      if(iterator.tipo_registro===4){
        formulaaux= iterator.abrev+'/'+(iterator.formula==''?this.abretotal:iterator.formula)+'='+(iterator.monto*100/(iterator.formula==''?this.totaldir:this.findabrev(iterator.formula))).toFixed(2)+'%'
      }else{
        formulaaux=iterator.formula
      }
      const obj2 = [
        { text: iterator.orden, colSpan: 1, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'left' },
        { text: iterator.descripcion, colSpan: 1, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'left' },
        { text: iterator.abrev, colSpan: 1, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'center' },
        { text: formulaaux, colSpan: 1, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'center' },
        { text: this.formService.redondeo(Number(iterator.monto.toString()),this.dec_parcial), colSpan: 2, tipoletra:iterator.tipo_registro=='2' || iterator.tipo_registro=='3'?'3':'',color:'',fondo:'',alinea:'right' },
      ]
      tablaTotales.push(obj2)
    }
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec:arrdec,
      col_alig:arralig,
      tabla: arrpasa,
      tabla2: tablaTotales,
      concat_tabla2:false,
      tipo_reporte:0,
      moneda:this.simbolo,//condicionar
      titulo:'PRESUPUESTO DE OBRA',
      //parametros filtro por titulo
      tindirecto:this.tabindir,
      titulos:arrtit,
      dec_parcial:this.dec_parcial,
    }
    const modalRef = this.modalService.open(ReportesComponent, { size: 'lg modalgrande', backdrop: 'static', windowClass: 'pcoded', keyboard: false, });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
  listarIndirTit(tabla:any,titulos:any,titsel:any){
    //buscar en cambios, sino cargar de bd
    let tabaux=JSON.parse(JSON.stringify(tabla));
    let titulo=titulos.find(ele=>ele.item==titsel);
    let costotit=0;
    let valprop=1;
    let sumtot=0;
    for(let rowf of titulos){
      sumtot+=Number(rowf.parcial);
    }
    for(let a=0;a<tabaux.length;a++){
      if(tabaux[a].tipo_registro==3)//costo directo
      {
        tabaux[a].monto=titulo.parcial;
        costotit=Number(titulo.parcial);
        valprop=costotit/sumtot;
      }
      else{
        tabaux[a].monto=this.formService.redondeo(Number(tabaux[a].monto)*valprop,this.dec_parcial);
      }
      if(tabaux[a].aplicatit==0){
        tabaux.splice(a,1);
        a--;
      }
    }
    return tabaux;
  }
  async imprrelins(){
    if(this.existetemp){
      this.toaster.error('Guardar sus cambios antes de generar Reportes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return;
    }
    this.mostrar_carga=true;
    let sumatot=0;
    for(let rowres of JSON.parse(JSON.stringify(this.datasourcePri))){
      if(rowres.unidad!=''){
        sumatot+=Number(rowres.parcial)
      }
    }
    let tabresult=this.getTablaRelInsumos(4,sumatot);
    let arrpasa=[];
    for(let row of tabresult.datos){
      if(row.id_tipo_insumo!=5){
        arrpasa.push({
          num_det:row.num_det,
          id_tipo_insumo:row.id_tipo_insumo,
          indice:row.indice,
          codigo:row.codigo,
          descripcion:row.descripcion,
          unidad:row.unidad,
          //jornada:,
          cuadrilla:row.cuadrilla,
          cantidad:row.cantidad!=null?this.formService.redondeo(row.cantidad,4):null,
          precio:row.precio!=null?this.formService.redondeo(row.precio,this.dec_precio):null,
          parcial:row.parcial!=null?this.formService.redondeo(row.parcial,this.dec_parcial):null,
          //rendimiento:,
          tipoletra:row.unidad!=''?'1':'3',
          alinea:row.unidad!=''?'':'center',
          fondo:row.unidad!=''?'':'',
        });
        /* if(row.unidad!=''){
          sumatot+=Number(row.parcial)
        } */
      }
    }
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    const arrayHeader = ['CODIGO', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'COSTO', 'TOTAL']
    const arrayKeys = ['codigo', 'descripcion', 'unidad', 'cantidad', 'precio', 'parcial']
    const arrdec=[null,null,null,4,this.dec_precio,this.dec_parcial];
    const arralig=['left','left','center','right','right','right'];
    let tablaTotales = []
    const obj = [
      { text: 'TOTAL', colSpan: 5, tipoletra:'3',color:'',fondo:'',alinea:'center' },
      { text: this.formService.redondeo(sumatot,this.dec_parcial), colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' },
    ]
    tablaTotales.push(obj)
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec:arrdec,
      col_alig:arralig,
      tabla: arrpasa,
      tabla2: tablaTotales,
      concat_tabla2:true,
      tipo_reporte:0,
      moneda:this.simbolo,//condicionar
      titulo:'RELACIÓN DE INSUMOS DEL PROYECTO',
      //datos adicionales para relacion de insumos por titulo
      tabaux1:JSON.parse(JSON.stringify(this.datasourcePri)),
      tabaux2:JSON.parse(JSON.stringify(this.datasourcePriacu)),
      tabaux3:JSON.parse(JSON.stringify(this.datasourcePrisub)),
      dec_parcial:this.dec_parcial,
      dec_cant:4
    }
    //ejemplo relins por titulo
    // let tabop=this.filtratit(this.datasourcePri,'1');
    // let tabaux=this.getTablaRelInsumostit(tabop,this.datasourcePriacu,this.datasourcePrisub,this.dec_parcial,this.dec_cant);
    // console.log(tabaux)
    // let tablares=tabaux.datos;
    // console.log(tablares);
    //fin ejemplo relins por titulo
    this.mostrar_carga=false;
    const modalRef = this.modalService.open(ReportesComponent, { size: 'lg modalgrande', backdrop: 'static', windowClass: 'pcoded', keyboard: false, });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
  async imprClasi(){
    if(this.existetemp){
      this.toaster.error('Guardar sus cambios antes de generar Reportes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return;
    }
    this.mostrar_carga=true;
    let sumatot=0;
    for(let rowres of JSON.parse(JSON.stringify(this.datasourcePri))){
      if(rowres.unidad!=''){
        sumatot+=Number(rowres.parcial)
      }
    }
    let tabresult=this.getTablaRelInsumos(null,sumatot);
    let arraux=JSON.parse(JSON.stringify(tabresult.datos));
    if(arraux.length>0){
      arraux.sort( (a, b) => {
        if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
        }
        if ((a.desc_clasi==null?"":a.desc_clasi) < (b.desc_clasi==null?"":b.desc_clasi)) {
          return -1;
        }
        if ((a.desc_clasi==null?"":a.desc_clasi) > (b.desc_clasi==null?"":b.desc_clasi)) {
          return 1;
        }
        return 0;
      });
      let clasiadd='';
      for(let fila=0;fila<arraux.length;fila++){
        if(clasiadd!=arraux[fila].desc_clasi && arraux[fila].unidad!=''){
          clasiadd=arraux[fila].desc_clasi;
          arraux.splice(fila,0,{id_proyecto:arraux[fila].id_proyecto,num_det:arraux[fila].num_det,icomost:1,id_clasificacion:arraux[fila].id_clasificacion,
            id_tipo_insumo:arraux[fila].id_tipo_insumo,mostrar:1,seleccion:0,unidad:'',descripcion:arraux[fila].desc_clasi??'SIN CLASIFICACION',agruclasi:1,desc_clasi:arraux[fila].desc_clasi??null});
          fila++;
        }
        else if(arraux[fila].unidad==''){
          clasiadd='';
        }
      }
    }
    let arrpasa=[];
    for(let row of arraux){
      if(row.id_tipo_insumo!=5){
        arrpasa.push({
          id_proyecto:row.id_proyecto,
          id_tipo_insumo:row.id_tipo_insumo,
          id_filadetalle:row.id_filadetalle,
          num_det:row.num_det,
          agruclasi:row.agruclasi??0,
          codigo:row.codigo,
          descripcion:row.descripcion,
          id_unidad:row.id_unidad,
          unidad:row.unidad,
          id_clasificacion:row.id_clasificacion,
          desc_clasi:row.desc_clasi,
          cantidad:row.cantidad!=null?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
          precio:row.precio!=null?this.formService.redondeo(row.precio,this.dec_precio):null,
          parcial:row.parcial!=null?this.formService.redondeo(row.parcial,this.dec_parcial):null,
          tipoletra:row.unidad!=''?'1':(row.agruclasi=='1'?'4':'3'),
          alinea:row.unidad!=''?'':'center',
          fondo:row.unidad!=''?'':'',
        });
        /* if(row.unidad!=''){
          sumatot+=Number(this.formService.redondeo(row.parcial??0,this.dec_parcial))
        } */
      }
    }
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    const arrayHeader = ['CODIGO', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'COSTO', 'TOTAL']
    const arrayKeys = ['codigo', 'descripcion', 'unidad', 'cantidad', 'precio', 'parcial']
    const arrdec=[null,null,null,4,this.dec_precio,this.dec_parcial];
    const arralig=['left','left','center','right','right','right'];
    let tablaTotales = []
    const obj = [
      { text: 'TOTAL', colSpan: 5, tipoletra:'3',color:'',fondo:'',alinea:'center' },
      { text: this.formService.redondeo(sumatot,this.dec_parcial), colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' },
    ]
    tablaTotales.push(obj)
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec:arrdec,
      col_alig:arralig,
      tabla: arrpasa,
      tabla2: tablaTotales,
      concat_tabla2:true,
      tipo_reporte:0,
      moneda:this.simbolo,//condicionar
      titulo:'CLASIFICACIÓN COMERCIAL DE INSUMOS DEL PROYECTO',
    }
    this.mostrar_carga=false;
    const modalRef = this.modalService.open(ReportesComponent, { size: 'lg modalgrande', backdrop: 'static', windowClass: 'pcoded', keyboard: false, });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
    this.mostrar_carga=false;
  }
  async imprdesagre(){//generar 3er reporte
    if(this.existetemp){
      this.toaster.error('Guardar sus cambios antes de generar Reportes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return;
    }
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    const arrayHeader = ['ITEM', 'DESCRIPCION', 'UNIDAD', 'METRADO', 'PU','MANO DE OBRA','MATERIALES','EQUIPOS','SUBCONTRATOS','SUBPARTIDAS', 'COSTO PARCIAL']
    const arrayKeys = ['item', 'descripcion', 'unidad', 'cantidad', 'precio','mano','mate','equi','subcont','subpart', 'parcial']
    const arrdec=[null,null,null,this.dec_metrado,this.dec_precio,this.dec_parcial,this.dec_parcial,this.dec_parcial,this.dec_parcial,this.dec_parcial,this.dec_parcial];
    const arralig=['left','left','center','right','right','right','right','right','right','right','right'];
    let aux=JSON.parse(JSON.stringify(this.datasourcePri));
    let auxdet=JSON.parse(JSON.stringify(this.datasourcePriacu));
    let arrpasa=[];
    let arrtit=[];
    arrtit.push({
      item:'',
      descripcion:'COMPLETO',
    });
    let sumatot=0;
    for(let row of aux){//asignar colores
      let tipol='';
      let colorl='';
      let fondol='';
      let valor2= row.item.toString().split('.');
      if(this.titulo1letra!=undefined)
      {
        if(row.unidad!='')
        {
          colorl=this.titulo1letra[11]
        }
        else
        {
          let ind=valor2.length>=12?11:valor2.length-1;
          colorl=this.titulo1letra[ind];
        }
      }
      if(this.titulo1color!=undefined)
      {
        if(row.unidad!='')
        {
          fondol = this.titulo1color[11];
        }
        else
        {
          let ind=valor2.length>=12?11:valor2.length-1;
          fondol=this.titulo1color[ind];
        }
      }
      if(this.titulo1!=undefined)
      {
        if(row.unidad!='')
        {
          tipol = this.titulo1[11];
        }
        else{
          let ind=valor2.length>=12?11:valor2.length-1;
          tipol=this.titulo1[ind];
        }
      }
      let esp=' ';
      let descp=esp.repeat(valor2.length-1)+row.descripcion;
      arrpasa.push({
        indice:row.indice,
        item:row.item,
        itemord:row.itemord,
        descripcion:descp,
        id_unidad:row.id_unidad,
        unidad:row.unidad,
        cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
        precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
        mano:null,
        mate:null,
        equi:null,
        subcont:null,
        subpart:null,
        parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
        tipofila:row.tipofila,
        tipoletra:tipol,
        color:colorl=='unset'?'':colorl,
        fondo:fondol=='none'?'':fondol
      });
      if(!(row.item.includes('.'))){
        arrtit.push({
          indice:row.indice,
          item:row.item,
          itemord:row.itemord,
          descripcion:descp,
          id_unidad:row.id_unidad,
          unidad:row.unidad,
          cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
          precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
          mano:null,
          mate:null,
          equi:null,
          subcont:null,
          subpart:null,
          parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
          tipofila:row.tipofila,
          tipoletra:tipol,
          color:colorl=='unset'?'':colorl,
          fondo:fondol=='none'?'':fondol
        });
      }
      if(row.unidad!=''){
        sumatot+=Number(this.formService.redondeo(row.parcial??0,this.dec_parcial))
      }
    }
    //calcular agrupaciones
    for(let b=0;b<auxdet.length;b++){
      let parcopera=Number(auxdet[b].parcial);
      //buscar en presu, break, solo sumar
      for(let c=0;c<arrpasa.length;c++){
        if(arrpasa[c].indice==auxdet[b].indice){
          if(auxdet[b].id_tipo_insumo=='1'){
            let valant=Number(arrpasa[c].mano??0);
            arrpasa[c].mano=this.formService.redondeo(valant+parcopera,this.dec_parcial);
          }
          else if(auxdet[b].id_tipo_insumo=='2'){
            let valant=Number(arrpasa[c].mate??0);
            arrpasa[c].mate=this.formService.redondeo(valant+parcopera,this.dec_parcial);
          }
          else if(auxdet[b].id_tipo_insumo=='3'){
            let valant=Number(arrpasa[c].equi??0);
            arrpasa[c].equi=this.formService.redondeo(valant+parcopera,this.dec_parcial);
          }
          else if(auxdet[b].id_tipo_insumo=='4'){
            let valant=Number(arrpasa[c].subcont??0);
            arrpasa[c].subcont=this.formService.redondeo(valant+parcopera,this.dec_parcial);
          }
          else if(auxdet[b].id_tipo_insumo=='5'){
            let valant=Number(arrpasa[c].subpart??0);
            arrpasa[c].subpart=this.formService.redondeo(valant+parcopera,this.dec_parcial);
          }
          break;
        }
      }
    }
    //volver a recorrer para multiplicar por metrado
    for(let d=arrpasa.length-1;d>=0;d--){
      if(arrpasa[d].cantidad){
        let cantop=arrpasa[d].cantidad;
        arrpasa[d].mano=arrpasa[d].mano?this.formService.redondeo(cantop*Number(arrpasa[d].mano),this.dec_parcial):arrpasa[d].mano;
        arrpasa[d].mate=arrpasa[d].mate?this.formService.redondeo(cantop*Number(arrpasa[d].mate),this.dec_parcial):arrpasa[d].mate;
        arrpasa[d].equi=arrpasa[d].equi?this.formService.redondeo(cantop*Number(arrpasa[d].equi),this.dec_parcial):arrpasa[d].equi;
        arrpasa[d].subcont=arrpasa[d].subcont?this.formService.redondeo(cantop*Number(arrpasa[d].subcont),this.dec_parcial):arrpasa[d].subcont;
        arrpasa[d].subpart=arrpasa[d].subpart?this.formService.redondeo(cantop*Number(arrpasa[d].subpart),this.dec_parcial):arrpasa[d].subpart;
      }
    }
    //totales agrupaciones (sub)titulos
    let indtit=[];
    let tottit1=[];
    let tottit2=[];
    let tottit3=[];
    let tottit4=[];
    let tottit5=[];
    let itemtit=[];
    for (let c = 0; c < arrpasa.length; c++)
    {
      if (arrpasa[c].unidad == "")//titulos
      {
        for (let t = itemtit.length - 1; t >= 0; t--)
        {
          let itemtem = arrpasa[c].item;
          let itemfila = itemtem.Length <= itemtit[t].length + 1 ? "-" : itemtem.substring(0, itemtit[t].length + 1);
          if (itemtit[t] + "." != itemfila)//si no es predecesor, se actualizan y eliminan los titulos
          {
            arrpasa[indtit[t]].mano = tottit1[t]!=null?this.formService.redondeo(tottit1[t],this.dec_parcial):tottit1[t];
            arrpasa[indtit[t]].mate = tottit2[t]!=null?this.formService.redondeo(tottit2[t],this.dec_parcial):tottit2[t];
            arrpasa[indtit[t]].equi = tottit3[t]!=null?this.formService.redondeo(tottit3[t],this.dec_parcial):tottit3[t];
            arrpasa[indtit[t]].subcont = tottit4[t]!=null?this.formService.redondeo(tottit4[t],this.dec_parcial):tottit4[t];
            arrpasa[indtit[t]].subpart = tottit5[t]!=null?this.formService.redondeo(tottit5[t],this.dec_parcial):tottit5[t];
            indtit.splice(t,1);
            tottit1.splice(t,1);
            tottit2.splice(t,1);
            tottit3.splice(t,1);
            tottit4.splice(t,1);
            tottit5.splice(t,1);
            itemtit.splice(t,1);
          }
        }
        indtit.push(c);
        tottit1.push(null);
        tottit2.push(null);
        tottit3.push(null);
        tottit4.push(null);
        tottit5.push(null);
        itemtit.push(arrpasa[c].item);
      }
      else//partidas
      {
        for(let t = itemtit.length-1; t >= 0;t--)
        {
          let itemtem = arrpasa[c].item;
          let itemfila = itemtem.Length <= itemtit[t].length + 1 ? "-" : itemtem.substring(0, itemtit[t].length + 1);
          if (itemtit[t]+"."==itemfila)
          {
            if(arrpasa[c].mano){
              tottit1[t] = Number(tottit1[t]??0)+Number(arrpasa[c].mano);
            }
            if(arrpasa[c].mate){
              tottit2[t] = Number(tottit2[t]??0)+Number(arrpasa[c].mate);
            }
            if(arrpasa[c].equi){
              tottit3[t] = Number(tottit3[t]??0)+Number(arrpasa[c].equi);
            }
            if(arrpasa[c].subcont){
              tottit4[t] = Number(tottit4[t]??0)+Number(arrpasa[c].subcont);
            }
            if(arrpasa[c].subpart){
              tottit5[t] = Number(tottit5[t]??0)+Number(arrpasa[c].subpart);
            }
          }
          else//si no es predecesor, se actualizan y eliminan los titulos
          {
            arrpasa[indtit[t]].mano = tottit1[t]!=null?this.formService.redondeo(tottit1[t],this.dec_parcial):tottit1[t];
            arrpasa[indtit[t]].mate = tottit2[t]!=null?this.formService.redondeo(tottit2[t],this.dec_parcial):tottit2[t];
            arrpasa[indtit[t]].equi = tottit3[t]!=null?this.formService.redondeo(tottit3[t],this.dec_parcial):tottit3[t];
            arrpasa[indtit[t]].subcont = tottit4[t]!=null?this.formService.redondeo(tottit4[t],this.dec_parcial):tottit4[t];
            arrpasa[indtit[t]].subpart = tottit5[t]!=null?this.formService.redondeo(tottit5[t],this.dec_parcial):tottit5[t];
            indtit.splice(t,1);
            tottit1.splice(t,1);
            tottit2.splice(t,1);
            tottit3.splice(t,1);
            tottit4.splice(t,1);
            tottit5.splice(t,1);
            itemtit.splice(t,1);
          }
        }
      }
    }
    if(itemtit.length>0){//actualizar totales
      for (let t = itemtit.length - 1; t >= 0; t--)
      {
        arrpasa[indtit[t]].mano = tottit1[t]!=null?this.formService.redondeo(tottit1[t],this.dec_parcial):tottit1[t];
        arrpasa[indtit[t]].mate = tottit2[t]!=null?this.formService.redondeo(tottit2[t],this.dec_parcial):tottit2[t];
        arrpasa[indtit[t]].equi = tottit3[t]!=null?this.formService.redondeo(tottit3[t],this.dec_parcial):tottit3[t];
        arrpasa[indtit[t]].subcont = tottit4[t]!=null?this.formService.redondeo(tottit4[t],this.dec_parcial):tottit4[t];
        arrpasa[indtit[t]].subpart = tottit5[t]!=null?this.formService.redondeo(tottit5[t],this.dec_parcial):tottit5[t];
        indtit.splice(t,1);
        tottit1.splice(t,1);
        tottit2.splice(t,1);
        tottit3.splice(t,1);
        tottit4.splice(t,1);
        tottit5.splice(t,1);
        itemtit.splice(t,1);
      }
    }
    let tablaTotales = []
    const obj = [
      { text: 'TOTAL', colSpan: 10, tipoletra:'3',color:'',fondo:'',alinea:'center' },
      { text: this.formService.redondeo(sumatot,this.dec_parcial), colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' },
    ]
    tablaTotales.push(obj)
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec:arrdec,
      col_alig:arralig,
      tabla: arrpasa,
      orientacion:'landscape',
      tabla2: tablaTotales,
      concat_tabla2:true,
      tipo_reporte:0,
      moneda:this.simbolo,//condicionar
      titulo:'COSTO DEL PROYECTO DESAGREGADO X TIPO',
      titulos:arrtit,
    }
    const modalRef = this.modalService.open(ReportesComponent, { size: 'lg modalgrande', backdrop: 'static', windowClass: 'pcoded', keyboard: false, });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
  async imprAcu(){
    if(this.existetemp){
      this.toaster.error('Guardar sus cambios antes de generar Reportes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return;
    }
    if(this.datasourcePri.length>500){
      this.mostrar_carga_todo=true;
    }
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    const arrayHeader = ['Código', 'Descripción', 'Unidad', 'Recursos', 'Cantidad','Precio','Parcial']
    const arrayKeys = ['codigo', 'descripcion', 'unidad', 'cuadrilla', 'cantidad','precio','parcial']
    const arrdec=[null,null,null,4,this.dec_cant,this.dec_precio,this.dec_precio];
    const arralig=['center','left','center','right','right','right','right'];
    if(!this.mcodigo){
      arrayHeader.splice(0,1);
      arrayKeys.splice(0,1);
      arralig.splice(0,1);
    }
    let aux=JSON.parse(JSON.stringify(this.datasourcePri));
    let auxdet=JSON.parse(JSON.stringify(this.datasourcePriacu));
    let arrpasa=[];
    let arrtit=[];
    for(let row of aux){//asignar colores
      if(row.unidad!=''){
        arrpasa.push({
          indice:row.indice,
          item:row.item,
          itemord:row.itemord,
          descripcion:row.descripcion,
          id_unidad:row.id_unidad,
          unidad:row.unidad,
          //cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
          precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
          //parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
          rendimiento:row.rendimiento,
          und_rendi:Number(row.rendimiento)==0?/* row.und_rendi */'GLB':row.unidad+'/'+row.und_rendi,
          jornada:row.jornada,
          ratio:null,
          und_ratio:null,
          tipofila:row.tipofila,
          detalle:[]
        });
      }
      else if(!(row.item.includes('.'))){
        arrtit.push({
          indice:row.indice,
          item:row.item,
          itemord:row.itemord,
          descripcion:row.descripcion,
          id_unidad:row.id_unidad,
          unidad:row.unidad,
          //cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
          precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
          //parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
          rendimiento:row.rendimiento,
          und_rendi:Number(row.rendimiento)==0?/* row.und_rendi */'GLB':row.unidad+'/'+row.und_rendi,
          jornada:row.jornada,
          ratio:null,
          und_ratio:null,
          tipofila:row.tipofila,
          detalle:[]
        })
      }
    }
    //si se ordena, se puede agregar agrupaciones?
    for(let row1 of auxdet){
      //refactorizar el row1, agregar agrupaciones, optimizar
      let codpasa=this.codsoloiu && row1.codigo?(row1.codigo.length>2?row1.codigo.substring(0,2):row1.codigo):row1.codigo;
      let objadd={
        indice:row1.indice,
        id_filadetalle:row1.id_filadetalle,
        id_tipo_insumo:row1.id_tipo_insumo,
        num_det:row1.num_det,
        codigo:codpasa,
        descripcion:row1.descripcion,
        id_unidad:row1.id_unidad,
        unidad:row1.unidad,
        cuadrilla:row1.afcuadrilla==0 || row1.operador=='%'?null:row1.cuadrilla,
        cantidad:this.formService.redondeo(row1.cantidad,this.dec_cant)+(row1.operador=='%'?' %':''),
        precio:this.formService.redondeo(row1.precio,this.dec_precio),
        parcial:this.formService.redondeo(row1.parcial,this.dec_precio),
        rendimiento:row1.rendimiento,
        und_rendi:row1.id_tipo_insumo=='5'?(Number(row1.rendimiento)==0?/* row.und_rendi */'GLB':row1.unidad+'/'+row1.und_rendi):null,
        jornada:row1.jornada,
        indice_subp:row1.indice_subp
      }
      for(let row2 of arrpasa){
        if(row1.indice==row2.indice){
          let indagru=-1;
          let exisagru=false;
          let indadd=-1;
          for(let n=row2.detalle.length-1;n>=0;n--){
            if(Number(row2.detalle[n].id_tipo_insumo)==Number(row1.id_tipo_insumo)){
              if(Number(row2.detalle[n].num_det)==0){//agru
                indagru=n;
                indadd=indadd==-1?n+1:indadd;
                exisagru=true;
              }
              else{
                if(Number(row2.detalle[n].num_det)<Number(row1.num_det)){
                  indadd=indadd==-1?n+1:indadd;
                }
              }
            }
            //solo posicion de agru, si no existe
            if(Number(row1.id_tipo_insumo)<Number(row2.detalle[n].id_tipo_insumo) && Number(row2.detalle[n].num_det)==0){
              if(!exisagru){
                indagru=n;
              }
            }
          }
          if(exisagru){//suma
            row2.detalle[indagru].parcial=this.formService.redondeo(Number(row2.detalle[indagru].parcial)+Number(row1.parcial),this.dec_precio);
            row2.detalle.splice(indadd,0,objadd);
          }
          else{
            let desctipo=row1.id_tipo_insumo==1?'MANO DE OBRA':row1.id_tipo_insumo==2?'MATERIALES':row1.id_tipo_insumo==3?'EQUIPO':row1.id_tipo_insumo==4?'SUB CONTRATOS':row1.id_tipo_insumo==5?'SUB PARTIDAS':'';
            let agruadd={
              indice:row1.indice,
              id_filadetalle:null,
              id_tipo_insumo:row1.id_tipo_insumo,
              num_det:0,
              codigo:null,
              descripcion:desctipo,
              id_unidad:'',
              unidad:null,
              cuadrilla:null,
              cantidad:null,
              precio:null,
              parcial:this.formService.redondeo(row1.parcial,this.dec_parcial),
              rendimiento:null,
              und_rendi:null,
              jornada:null,
              indice_subp:null
            }
            if(row2.detalle.length==0){
              row2.detalle.push(agruadd);
              row2.detalle.push(objadd);
            }
            else{
              row2.detalle.splice(indagru!=-1?indagru:row2.detalle.length,0,agruadd);
              row2.detalle.splice(indagru!=-1?indagru+1:row2.detalle.length,0,objadd);
            }
          }
          if(objadd.id_tipo_insumo==1){
            row2.ratio=this.formService.redondeo(Number(row2.ratio??0)+Number(objadd.cantidad),this.dec_cant);
            let arrsp=row2.und_rendi.includes('/')?row2.und_rendi.split('/'):['',row2.und_rendi];
            row2.und_ratio='hh/'+arrsp[1];
          }
          break;
        }
      }
    }
    /* arrtit.push({
      item:'',
      descripcion:'COMPLETO',
    }); */
    this.mostrar_carga_todo=false;
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec:arrdec,
      col_alig:arralig,
      tabla: arrpasa,
      titulos:arrtit,
      concat_tabla2:false,
      tipo_reporte:1,
      moneda:this.simbolo,//condicionar
      titulo:'ANALISIS DE COSTOS UNITARIOS',
      // tabla2: tablaTotales
    }
    const modalRef = this.modalService.open(ReportesComponent, { size: 'lg modalgrande', backdrop: 'static', windowClass: 'pcoded', keyboard: false, });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
  filtratit(arrcomp:any,titulo:any){
    let arraux=[];
    let arrop=JSON.parse(JSON.stringify(arrcomp));
    for(let row of arrop){
      if (row.item != titulo){
        var palabra = row.item.toString().substring(0, titulo.toString().length + 1)
        if (palabra == (titulo + '.')) {
          arraux.push(row);
        }
      }
    }
    return arraux;
  }
  async imprAcuxMet(){
    if(this.existetemp){
      this.toaster.error('Guardar sus cambios antes de generar Reportes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return;
    }
    if(this.datasourcePri.length>500){
      this.mostrar_carga_todo=true;
    }
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    const arrayHeader = ['Código', 'Descripción', 'Unidad', 'Cantidad','Precio','Parcial']
    const arrayKeys = ['codigo', 'descripcion', 'unidad', 'cantidad','precio','parcial']
    const arrdec=[null,null,null,this.dec_cant,this.dec_precio,this.dec_parcial];
    const arralig=['center','left','center','right','right','right'];
    if(!this.mcodigo){
      arrayHeader.splice(0,1);
      arrayKeys.splice(0,1);
      arralig.splice(0,1);
    }
    let aux=JSON.parse(JSON.stringify(this.datasourcePri));
    let auxdet=JSON.parse(JSON.stringify(this.datasourcePriacu));
    let arrpasa=[];
    let arrtit=[];
    for(let row of aux){//asignar colores
      if(row.unidad!=''){
        arrpasa.push({
          indice:row.indice,
          item:row.item,
          itemord:row.itemord,
          descripcion:row.descripcion,
          id_unidad:row.id_unidad,
          unidad:row.unidad,
          cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
          precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
          //parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
          rendimiento:row.rendimiento,
          und_rendi:Number(row.rendimiento)==0?/* row.und_rendi */'GLB':row.unidad+'/'+row.und_rendi,
          jornada:row.jornada,
          tipofila:row.tipofila,
          detalle:[]
        });
      }
      else if(!(row.item.includes('.'))){
        arrtit.push({
          indice:row.indice,
          item:row.item,
          itemord:row.itemord,
          descripcion:row.descripcion,
          id_unidad:row.id_unidad,
          unidad:row.unidad,
          //cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
          precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
          //parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
          rendimiento:row.rendimiento,
          und_rendi:Number(row.rendimiento)==0?/* row.und_rendi */'GLB':row.unidad+'/'+row.und_rendi,
          jornada:row.jornada,
          tipofila:row.tipofila,
          detalle:[]
        })
      }
    }
    //si se ordena, se puede agregar agrupaciones?
    for(let row1 of auxdet){
      //refactorizar el row1, agregar agrupaciones, optimizar
      let codpasa=this.codsoloiu && row1.codigo?(row1.codigo.length>2?row1.codigo.substring(0,2):row1.codigo):row1.codigo;
      let objadd={
        indice:row1.indice,
        id_filadetalle:row1.id_filadetalle,
        id_tipo_insumo:row1.id_tipo_insumo,
        num_det:row1.num_det,
        codigo:codpasa,
        descripcion:row1.descripcion,
        id_unidad:row1.id_unidad,
        unidad:row1.unidad,
        //cuadrilla:row1.cuadrilla,
        cantidad:this.formService.redondeo(row1.cantidad,this.dec_cant),
        precio:this.formService.redondeo(row1.precio,this.dec_precio),
        parcial:this.formService.redondeo(row1.parcial,this.dec_precio),
        rendimiento:row1.rendimiento,
        und_rendi:row1.id_tipo_insumo=='5'?(Number(row1.rendimiento)==0?/* row.und_rendi */'GLB':row1.unidad+'/'+row1.und_rendi):null,
        jornada:row1.jornada,
        indice_subp:row1.indice_subp,
        operador:row1.operador,
        tipo_insumo:row1.tipo_insumo
      }
      for(let row2 of arrpasa){
        if(row1.indice==row2.indice){
          let indagru=-1;
          let exisagru=false;
          let indadd=-1;
          for(let n=row2.detalle.length-1;n>=0;n--){
            if(Number(row2.detalle[n].id_tipo_insumo)==Number(row1.id_tipo_insumo)){
              if(Number(row2.detalle[n].num_det)==0){//agru
                indagru=n;
                indadd=indadd==-1?n+1:indadd;
                exisagru=true;
              }
              else{
                if(Number(row2.detalle[n].num_det)<Number(row1.num_det)){
                  indadd=indadd==-1?n+1:indadd;
                }
              }
            }
            //solo posicion de agru, si no existe
            if(Number(row1.id_tipo_insumo)<Number(row2.detalle[n].id_tipo_insumo) && Number(row2.detalle[n].num_det)==0){
              if(!exisagru){
                indagru=n;
              }
            }
          }
          if(objadd.operador=='%'){
            objadd.cantidad='0.00';
            objadd.precio='0.00';
            objadd.parcial=this.formService.redondeo(Number(row2.cantidad)*Number(objadd.parcial),this.dec_parcial);
          }
          else{
            let rparc=this.formService.redondeo(Number(row2.cantidad)*Number(objadd.parcial),this.dec_parcial);
            objadd.parcial=this.formService.redondeo(Number(rparc),this.dec_parcial);
            let ropera=this.formService.redondeo(Number(objadd.parcial)/Number(objadd.precio),this.dec_cant);
            objadd.cantidad=objadd.unidad!=''?ropera:objadd.cantidad;
          }
          if(exisagru){//suma
            row2.detalle[indagru].parcial=this.formService.redondeo(Number(row2.detalle[indagru].parcial)+Number(objadd.parcial),this.dec_precio);
            row2.detalle.splice(indadd,0,objadd);
          }
          else{
            let desctipo=objadd.id_tipo_insumo==1?'MANO DE OBRA':objadd.id_tipo_insumo==2?'MATERIALES':objadd.id_tipo_insumo==3?'EQUIPO':objadd.id_tipo_insumo==4?'SUB CONTRATOS':objadd.id_tipo_insumo==5?'SUB PARTIDAS':'';
            let agruadd={
              indice:objadd.indice,
              id_filadetalle:null,
              id_tipo_insumo:objadd.id_tipo_insumo,
              num_det:0,
              codigo:null,
              descripcion:desctipo,
              id_unidad:'',
              unidad:null,
              cuadrilla:null,
              cantidad:null,
              precio:null,
              parcial:objadd.parcial,
              rendimiento:null,
              und_rendi:null,
              jornada:null,
              indice_subp:null
            }
            if(row2.detalle.length==0){
              row2.detalle.push(agruadd);
              row2.detalle.push(objadd);
            }
            else{
              row2.detalle.splice(indagru!=-1?indagru:row2.detalle.length,0,agruadd);
              row2.detalle.splice(indagru!=-1?indagru+1:row2.detalle.length,0,objadd);
            }
          }
          break;
        }
      }
    }
    //actualizar porcentajes cada vez que se actualiza la tabla?
    for(let row3 of arrpasa){
      if(row3.detalle.length>0){
        let arrindagru=[0,0,0,0,0]
        for(let p=0;p<row3.detalle.length;p++){
          if(Number(row3.detalle[p].num_det)==0){
            arrindagru[Number(row3.detalle[p].id_tipo_insumo)-1]=p;
          }
        }
        for(let row of row3.detalle){
          if(row.operador=="%"){
            row.precio=row.tipo_insumo=='1'?row3.detalle[arrindagru[0]].parcial:row.tipo_insumo=='2'?row3.detalle[arrindagru[1]].parcial:row.tipo_insumo=='3'?row3.detalle[arrindagru[2]].parcial:
            row.tipo_insumo=='4'?row3.detalle[arrindagru[3]].parcial:'';
            let precfil=Number(row.precio);
            let parcial=Number(row.parcial);
            row.cantidad=row.precio==0 || row.parcial==0?0:this.formService.redondeo(parcial/precfil,this.dec_metrado);
          }
        }
      }
    }
    /* arrtit.push({
      item:'',
      descripcion:'COMPLETO',
    }); */
    this.mostrar_carga_todo=false;
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec:arrdec,
      col_alig:arralig,
      tabla: arrpasa,
      titulos:arrtit,
      concat_tabla2:false,
      tipo_reporte:1,
      moneda:this.simbolo,//condicionar
      titulo:'ANALISIS DE COSTOS UNITARIOS X METRADO',
      // tabla2: tablaTotales
    }
    const modalRef = this.modalService.open(ReportesComponent, { size: 'lg modalgrande', backdrop: 'static', windowClass: 'pcoded', keyboard: false, });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
  async imprSubp(){
    if(this.existetemp){
      this.toaster.error('Guardar sus cambios antes de generar Reportes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return;
    }
    if(this.datasourcePri.length>500){
      this.mostrar_carga_todo=true;
    }
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    const arrayHeader = ['Código', 'Descripción', 'Unidad', 'Recursos', 'Cantidad','Precio','Parcial']
    const arrayKeys = ['codigo', 'descripcion', 'unidad', 'cuadrilla', 'cantidad','precio','parcial']
    const arrdec=[null,null,null,4,this.dec_cant,this.dec_precio,this.dec_precio];
    const arralig=['center','left','center','right','right','right','right'];
    if(!this.mcodigo){
      arrayHeader.splice(0,1);
      arrayKeys.splice(0,1);
      arralig.splice(0,1);
    }
    //let aux=JSON.parse(JSON.stringify(this.datasourcePri));
    let auxdet=JSON.parse(JSON.stringify(this.datasourcePriacu));
    let auxdet2=JSON.parse(JSON.stringify(this.datasourcePrisub));
    let arrpasa=[];
    //empezar por acu
    for(let row of auxdet){
      if(row.id_tipo_insumo==5 && Number(row.num_det)>0){
        arrpasa.push({
          indice:row.indice,
          num_det:row.num_det,
          codigo:row.codigo,
          descripcion:row.descripcion,
          id_unidad:row.id_unidad,
          unidad:row.unidad,
          precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
          rendimiento:row.rendimiento,
          und_rendi:Number(row.rendimiento)==0?/* row.und_rendi */'GLB':row.unidad+'/'+row.und_rendi,
          jornada:row.jornada,
          ratio:null,
          und_ratio:null,
          indice_subp:row.indice_subp,
          detalle:[]
        });
      }
    }
    auxdet2.sort( (a, b) => {
      if (a.indice < b.indice) {
        return -1;
      }
      if (a.indice > b.indice) {
        return 1;
      }
      if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
      }
      return 0;
    });
    for(let row1 of auxdet2){
      if(row1.id_tipo_insumo==5 && Number(row1.num_det)>0){//subpartida, agregar tambien a arrapasa
        arrpasa.push({
          indice:row1.indice,
          num_det:row1.num_det,
          codigo:row1.codigo,
          descripcion:row1.descripcion,
          id_unidad:row1.id_unidad,
          unidad:row1.unidad,
          precio:row1.id_unidad!=''?this.formService.redondeo(row1.precio,this.dec_precio):null,
          rendimiento:row1.rendimiento,
          und_rendi:Number(row1.rendimiento)==0?/* row1.und_rendi */'GLB':row1.unidad+'/'+row1.und_rendi,
          jornada:row1.jornada,
          ratio:null,
          und_ratio:null,
          indice_subp:row1.indice_subp,
          detalle:[]
        });
      }
      let codpasa=this.codsoloiu && row1.codigo?(row1.codigo.length>2?row1.codigo.substring(0,2):row1.codigo):row1.codigo;
      let objadd={
        indice:row1.indice,
        id_filadetalle:row1.id_filadetalle,
        id_tipo_insumo:row1.id_tipo_insumo,
        num_det:row1.num_det,
        codigo:codpasa,
        descripcion:row1.descripcion,
        id_unidad:row1.id_unidad,
        unidad:row1.unidad,
        cuadrilla:row1.afcuadrilla==0 || row1.operador=='%'?null:row1.cuadrilla,
        cantidad:this.formService.redondeo(row1.cantidad,this.dec_cant)+(row1.operador=='%'?' %':''),
        precio:this.formService.redondeo(row1.precio,this.dec_precio),
        parcial:this.formService.redondeo(row1.parcial,this.dec_precio),
        rendimiento:row1.rendimiento,
        und_rendi:row1.id_tipo_insumo=='5'?(Number(row1.rendimiento)==0?/* row.und_rendi */'GLB':row1.unidad+'/'+row1.und_rendi):null,
        jornada:row1.jornada,
        indice_subp:row1.indice_subp
      }
      for(let row2 of arrpasa){
        if(row1.indice==row2.indice_subp){
          let indagru=-1;
          let exisagru=false;
          let indadd=-1;
          for(let n=row2.detalle.length-1;n>=0;n--){
            if(Number(row2.detalle[n].id_tipo_insumo)==Number(row1.id_tipo_insumo)){
              if(Number(row2.detalle[n].num_det)==0){//agru
                indagru=n;
                indadd=indadd==-1?n+1:indadd;
                exisagru=true;
              }
              else{
                if(Number(row2.detalle[n].num_det)<Number(row1.num_det)){
                  indadd=indadd==-1?n+1:indadd;
                }
              }
            }
            //solo posicion de agru, si no existe
            if(Number(row1.id_tipo_insumo)<Number(row2.detalle[n].id_tipo_insumo) && Number(row2.detalle[n].num_det)==0){
              if(!exisagru){
                indagru=n;
              }
            }
          }
          if(exisagru){//suma
            row2.detalle[indagru].parcial=this.formService.redondeo(Number(row2.detalle[indagru].parcial)+Number(row1.parcial),this.dec_precio);
            row2.detalle.splice(indadd,0,objadd);
          }
          else{
            let desctipo=row1.id_tipo_insumo==1?'MANO DE OBRA':row1.id_tipo_insumo==2?'MATERIALES':row1.id_tipo_insumo==3?'EQUIPO':row1.id_tipo_insumo==4?'SUB CONTRATOS':row1.id_tipo_insumo==5?'SUB PARTIDAS':'';
            let agruadd={
              indice:row1.indice,
              id_filadetalle:null,
              id_tipo_insumo:row1.id_tipo_insumo,
              num_det:0,
              codigo:null,
              descripcion:desctipo,
              id_unidad:'',
              unidad:null,
              cuadrilla:null,
              cantidad:null,
              precio:null,
              parcial:this.formService.redondeo(row1.parcial,this.dec_parcial),
              rendimiento:null,
              und_rendi:null,
              jornada:null,
              indice_subp:null
            }
            if(row2.detalle.length==0){
              row2.detalle.push(agruadd);
              row2.detalle.push(objadd);
            }
            else{
              row2.detalle.splice(indagru!=-1?indagru:row2.detalle.length,0,agruadd);
              row2.detalle.splice(indagru!=-1?indagru+1:row2.detalle.length,0,objadd);
            }
          }
          if(objadd.id_tipo_insumo==1){
            row2.ratio=this.formService.redondeo(Number(row2.ratio??0)+Number(objadd.cantidad),this.dec_cant);
            let arrsp=row2.und_rendi.includes('/')?row2.und_rendi.split('/'):['',row2.und_rendi];
            row2.und_ratio='hh/'+arrsp[1];
          }
          break;
        }
      }
    }
    let ultarray=[];
    for(let a=0;a<arrpasa.length;a++){
      let exisind=ultarray.find(ele=>ele.indice==arrpasa[a].indice);
      if(!exisind){
        ultarray.push(JSON.parse(JSON.stringify(arrpasa[a])));
        this.cargarindsupb(ultarray,arrpasa[a].detalle,arrpasa);
      }
    }
    this.mostrar_carga_todo=false;
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec:arrdec,
      col_alig:arralig,
      tabla: ultarray,
      //titulos:arrtit,
      concat_tabla2:false,
      tipo_reporte:1,
      moneda:this.simbolo,//condicionar
      titulo:'ANALISIS DE COSTOS UNITARIOS DE SUB PARTIDAS DEL PRESUPUESTO',
      // tabla2: tablaTotales
    }
    const modalRef = this.modalService.open(ReportesComponent, { size: 'lg modalgrande', backdrop: 'static', windowClass: 'pcoded', keyboard: false, });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
  cargarindsupb(arrres:any,detalle:any,arrpri:any){
    for(let b=0;b<detalle.length;b++){
      if(detalle[b].id_tipo_insumo==5 && Number(detalle[b].num_det)>0){
        let exisind=arrres.find(ele=>ele.indice==detalle[b].indice_subp);
        if(!exisind){
          let eleadd=arrpri.find(ele=>ele.indice_subp==detalle[b].indice_subp)
          if(eleadd){
            arrres.push(JSON.parse(JSON.stringify(eleadd)));
            this.cargarindsupb(arrres,eleadd.detalle,arrpri);
          }
        }
      }
    }
  }
  async ReiniciaPresu(){
    if(this.bloqtemp){//temporales
        this.toaster.error('Espere a que termine de guardar sus cambios en la nube. Tiene que desaparecer el icono de nube azul.', 'Información', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return;
      }//temporales
    const respu=await SwalService.confirmCheck('Esta seguro que desea Reiniciar el Presupuesto?',
    'Se eliminará todo el Presupuesto importados.');
    if(respu.isConfirmed){
      this.mostrar_carga=true;
      // let res=await this.presuservice.ReiniciarPresupuesto({id_proyecto:this.id_proyecto,id_usuario:this.id_userproy});
      // console.log(res)
      let res=await this.presuservice.limpiarTopPresupuesto({id_proyecto:this.id_proyecto});
      console.log(res)
      if(res?.id=="1"){
        this.datasourcePri=[];
        this.datasourcePriacu=[];
        this.datasourcePrisub=[];
        this.inserta=[];
        this.modifica=[];
        this.elimina=[];
        this.insertaacu=[];
        this.modificaacu=[];
        this.eliminaacu=[];
        this.colselpri=false;
        this.colselpri2=false;
        this.arrordenar=[];
        this.butselprecio='3';
        this.existetemp=false;
        this.toaster.success('Se reinició correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        this.cambindiceselpresu(-1);
        this.mostrar_carga=false;
        if(this.mostindir){
          this.ListarIndirecto();
        }
      }
      else{
        this.toaster.error('No se pudo completar el proceso correctamente.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        this.mostrar_carga=false;
      }
    }
  }
  async RecalculaPresu(){
    try{
      if(this.existetemp){
        this.toaster.error('No se puede realizar esta accion si tiene cambios. Guardar o descartar sus cambios.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return;
      }
      const respu=await SwalService.confirmCheck('Esta seguro que desea Recalcular el Presupuesto?',
        'Se recalcularan los montos para corregir posibles diferencias. Este proceso puede demorar.');
      if(respu.isConfirmed){
        this.mostrar_carga_todo=true;
        let res=await this.presuservice.RecalculaPresu({id_proyecto:this.id_proyecto,dec_metrado:this.dec_metrado,dec_precio:this.dec_precio,dec_parcial:this.dec_parcial,dec_cant:this.dec_cant});
        if(res?.id=="1"){
          await this.listarPresupuesto();
          this.butselprecio='3';
          this.existetemp=false;
          this.toaster.success('Se recalculo correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          this.cambindiceselpresu(-1);
          this.mostrar_carga_todo=false;
          if(this.mostindir){
            this.ListarIndirecto();
          }
        }
        else{
          this.toaster.error(res?.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          this.mostrar_carga_todo=false;
        }
      }
    }
    catch(e){
      console.log(e);
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo completar el proceso correctamente.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  //calcula ratio unitario
  CalcRatio(){
    let valret=0;
    for(let row of this.tablaacusel){
      if(row.id_tipo_insumo==1){
        valret=Number(valret??0)+Number(row.cantidad);
      }
    }
    //let valpasa=this.formService.redondeo(valret,this.dec_cant)+' hh/'+this.datasourcePri[this.filaSel].unidad;
    this.ratio.setValue(this.formService.redondeo(valret,this.dec_cant));
  }
  //metodos reporte relacion insumos
  getTablaRelInsumostit(tabla1:any,tabla2:any,tabla3:any,dec_parc:any,dec_cant:any){
    try{
      let tabacu=JSON.parse(JSON.stringify(tabla2));
      let tabsub=JSON.parse(JSON.stringify(tabla3));
      let tabresult=[];
      let totpre=0;
      for(let rowres of tabla1){
        if(rowres.unidad!=''){
          totpre+=Number(rowres.parcial)
        }
      }
      for(let b=0;b<tabacu.length;b++){
        let rowpart;
        for(let fipart of tabla1){
          if(tabacu[b].indice==fipart.indice){
            rowpart=fipart;//partida principal para multiplicar por metrado
            break;
          }
        }
        if(rowpart){
          if(tabacu[b].esinsumo==0 && tabacu[b].num_det>0){//es subapartida, cargar insumos de subpartida y hacer recursivo
            let cantpasa=Number(tabacu[b].cantidad);
            this.cargaInsumoSubpTit(tabresult,cantpasa,Number(rowpart.cantidad),tabacu[b].indice_subp,tabsub,dec_parc,dec_cant);
          }
          else if(tabacu[b].esinsumo!=0){
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
            if(index>-1){//si encuentra suma,
              if(tabresult[index].unidad!=''){
                if(tabacu[b].operador=='%'){
                  let rparc=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(rowpart.cantidad)*Number(tabacu[b].parcial)),dec_parc);
                  tabresult[index].parcial=this.formService.redondeo(Number(rparc),dec_parc);
                }
                else{
                  let ropera=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(rowpart.cantidad)*Number(tabacu[b].parcial)),dec_parc);
                  tabresult[index].parcial=ropera;
                  tabresult[index].cantidad=tabacu[b].unidad!=''?this.formService.redondeo(Number(tabresult[index].parcial)/Number(tabresult[index].precio),dec_cant):tabresult[index].cantidad;
                }
              }
            }
            else{//si no encuentra se agrega
              if(tabacu[b].operador=='%'){
                tabacu[b].cantidad=0;
                tabacu[b].precio=0;
                tabacu[b].parcial=this.formService.redondeo(Number(rowpart.cantidad)*Number(tabacu[b].parcial),dec_parc);
              }
              else{
                let rparc=this.formService.redondeo(Number(rowpart.cantidad)*Number(tabacu[b].parcial),dec_parc);
                tabacu[b].parcial=this.formService.redondeo(Number(rparc),dec_parc);
                let ropera=this.formService.redondeo(Number(tabacu[b].parcial)/Number(tabacu[b].precio),dec_cant);
                tabacu[b].cantidad=tabacu[b].unidad!=''?Number(ropera):tabacu[b].cantidad;
              }
              tabresult.push(JSON.parse(JSON.stringify(tabacu[b])));
              tabresult[tabresult.length-1].num_det=tabresult[tabresult.length-1].num_det>0?1:tabresult[tabresult.length-1].num_det;
              tabresult[tabresult.length-1].cuadrilla='';
            }
          }
        }
      }
      //corregir total en % mano obra operador% tipo_insumo1
      let totax=0;
      let indporc=-1;
      let indporc2=-1;
      for(let r1=0;r1<tabresult.length;r1++){
        totax=totax+=Number(tabresult[r1].parcial);
        if(tabresult[r1].operador=='%' && tabresult[r1].tipo_insumo==1 && indporc==-1){
          indporc=r1;
        }
        if(tabresult[r1].operador=='%' && indporc2==-1){
          indporc2=r1;
        }
      }
      let indcor=indporc!=-1?indporc:(indporc2!=-1?indporc2:-1)
      if(indcor>=0){
        console.log(this.formService.redondeo(totpre-totax,4))
        tabresult[indcor].parcial=this.formService.redondeo((Number(tabresult[indcor].parcial)+(totpre-totax)),this.dec_parcial);
      }
      //fin corr
      if(tabresult.length>0){
        let summano=0;
        let summat=0;
        let sumeq=0;
        let sumsubc=0;
        let sumsubp=0;
        let spsummano=0;
        let spsummat=0;
        let spsumeq=0;
        let spsumsubc=0;
        for(let m=0;m<tabresult.length;m++){
          if(tabresult[m].unidad!=''){
            if(tabresult[m].id_tipo_insumo=='1'){
              summano+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsummano+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='2'){
              summat+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsummat+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='3'){
              sumeq+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsumeq+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='4'){
              sumsubc+=Number(tabresult[m].parcial);
              if(tabresult[m].operador!='%'){
                spsumsubc+=Number(tabresult[m].parcial);
              }
            }
            else if(tabresult[m].id_tipo_insumo=='5'){
              sumsubp+=Number(tabresult[m].parcial);
            }
          }
        }
        let pindice=tabresult.length>0?tabresult[0].indice:null;
        let filamano=this.CrearFilaAgruTit(pindice,'MANO DE OBRA','1',this.formService.redondeo(summano,dec_parc),1,1);
        tabresult.push(filamano);
        filamano=this.CrearFilaAgruTit(pindice,'MATERIALES','2',this.formService.redondeo(summat,dec_parc),1,0);
        tabresult.push(filamano);
        filamano=this.CrearFilaAgruTit(pindice,'EQUIPO','3',this.formService.redondeo(sumeq,dec_parc),1,1);
        tabresult.push(filamano);
        filamano=this.CrearFilaAgruTit(pindice,'SUB CONTRATOS','4',this.formService.redondeo(sumsubc,dec_parc),1,0);
        tabresult.push(filamano);
        filamano=this.CrearFilaAgruTit(pindice,'SUB PARTIDAS','5',this.formService.redondeo(sumsubp,dec_parc),0,0);
        tabresult.push(filamano);
        tabresult.sort( (a, b) => {
          if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
          }
          if (a.descripcion < b.descripcion) {
            return -1;
          }
          if (a.descripcion > b.descripcion) {
            return 1;
          }
          return 0;
        });
        for(let row of tabresult){
          if(row.operador=="%"){
            row.precio=row.tipo_insumo=='1'?summano:row.tipo_insumo=='2'?summat:row.tipo_insumo=='3'?sumeq:row.tipo_insumo=='4'?sumsubc:'';
            let precfil=Number(row.precio);
            let parcial=Number(row.parcial);
            row.cantidad=row.precio==0 || row.parcial==0?0:this.formService.redondeo(parcial/precfil,dec_cant);
          }
        }
      }
      return {datos:tabresult,total:null};
    }
    catch(e){
      console.log(e)
      return null;
    }
  }
  cargaInsumoSubpTit(tabresult:any,cant_padre:any,cant_part:any,indice_padre:any,tabsub:any,dec_parc:any,dec_cant:any){
    for(let b=0;b<tabsub.length;b++){
      if(tabsub[b].indice==indice_padre){
        if(tabsub[b].esinsumo==0 && tabsub[b].num_det>0){
          let cantpasa=cant_padre*Number(tabsub[b].cantidad);
          this.cargaInsumoSubpTit(tabresult,cantpasa,cant_part,tabsub[b].indice_subp,tabsub,dec_parc,dec_cant);
        }
        else if(tabsub[b].esinsumo!=0){
          const index = tabresult.findIndex(elem => {
            if(elem.operador!='%'){
              if(elem.id_tipo_insumo.toString() == tabsub[b].id_tipo_insumo.toString() && elem.descripcion==tabsub[b].descripcion && elem.precio==tabsub[b].precio)
              return elem;
            }
            else{//porcentajes agrupa siempre, cantidad se recalcula
              if(elem.id_tipo_insumo.toString() == tabsub[b].id_tipo_insumo.toString() && elem.descripcion==tabsub[b].descripcion)
                return elem;
            }
          });
          if(index>-1){//si encuentra suma,
            if(tabsub[b].operador=='%'){
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), dec_parc+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, dec_parc);
              tabresult[index].parcial=this.formService.redondeo(Number(tabresult[index].parcial)+Number(parctot),dec_parc);
            }
            else{
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), dec_parc+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, dec_parc);
              tabresult[index].parcial=this.formService.redondeo(Number(tabresult[index].parcial)+Number(parctot),dec_parc);
              if(tabresult[index].unidad!=''){
                let ropera=this.formService.redondeo(Number(tabresult[index].parcial)/Number(tabresult[index].precio),dec_cant)
                tabresult[index].cantidad=tabsub[b].unidad!=''?Number(ropera):tabresult[index].cantidad;
              }
            }
          }
          else{//si no encuentra se agrega
            if(tabsub[b].operador=='%'){
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), dec_parc+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, dec_parc);
              tabsub[b].parcial=parctot;
            }
            else{
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), dec_parc+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, dec_parc);
              tabsub[b].parcial=parctot;
              let ropera=this.formService.redondeo(Number(parctot)/Number(tabsub[b].precio),dec_cant);
              tabsub[b].cantidad=tabsub[b].unidad!=''?Number(ropera):tabsub[b].cantidad;
            }
            tabresult.push(tabsub[b]);
            tabresult[tabresult.length-1].num_det=tabresult[tabresult.length-1].num_det>0?1:tabresult[tabresult.length-1].num_det;
            tabresult[tabresult.length-1].cuadrilla='';
          }
        }
      }
    }
  }
  CrearFilaAgruTit(pindice:any,pdescripcion:any,pid_tipo_insumo:any,pparcial:any,pesinsumo:any,pafcuad:any){
    let filaaux={
      id_proyecto:this.id_proyecto,
      indice:pindice,// se debe recuperar el indice del padre
      id_filadetalle:null,
      num_det:0,
      codigo:null/* detpart[a].codigo=='' || detpart[a].codigo==null?null:detpart[a].codigo */,
      descripcion:pdescripcion,
      id_unidad:'',
      unidad:'',
      operador:null,
      tipo_insumo:null,
      cuadrilla:null,
      cantidad:null,
      precio:null,
      parcial:Number(pparcial),
      id_tipo_insumo:Number(pid_tipo_insumo),
      id_indice:null,
      id_clasificacion:null,//revisar valores
      desc_clasi:null,
      id_insumo:null,
      id_subpartida:null,
      indice_subp:null,
      accion:0,
      esinsumo:pesinsumo,
      afcuadrilla:pafcuad,
      rendimiento:null,
      und_rendi:null,
      jornada:null,
      advceros:null,
      referencia:null,
      mostrar:1,
      icomost:1,
      editar:0,
      editar2:0,
      ind:-1,
      seleccion:0,
      asignaund:0
    };
    return filaaux;
  }
  ActIndTabacusel(indeli:any){
    for(let row of this.tablaacusel){
      if(row.ind){
        if(row.ind>indeli){
          row.ind--;
        }
      }
    }
  }
  //modal subpartidas
  SyncScrollsubp() {
    if (this.preventscrollsbp) {
      this.preventscrollsbp = false;
      return;
    }
    this.preventscrollsbp = true;
    var face2 = document.getElementById("tableBodysubp");
    var face3 = document.getElementById("tableFootsubp");
    face3.scrollLeft = face2.scrollLeft;
  }
  SyncScroll2subp() {
    if (this.preventscrollsbp) {
      this.preventscrollsbp = false;
      return;
    }
    this.preventscrollsbp = true;
    var face2 = document.getElementById("tableBodysubp");
    var face3 = document.getElementById("tableFootsubp");
    face2.scrollLeft = face3.scrollLeft;
  }
  async agregartab(row, detalleSubpartida) {
    if (this.formSubPartida.value.length >= 4) {
      this.toaster.error('No se puede abrir mas de 4 pestañas', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    console.log(detalleSubpartida)
    const nrotab = this.formSubPartida.value.length
    const datosPartida = await this.formDataSubPartida(row)
    const datosTab = new UntypedFormGroup({
      indice_tab: new UntypedFormControl(nrotab),
      data_partida: new UntypedFormGroup(datosPartida.controls, Validators.required),//controles de partida(descripcion,unidad,rendimiento,und_rendi,jornada,precio)
      data_tabla: new UntypedFormControl(detalleSubpartida),//tabla detalles de la partida
      tabla_editada: new UntypedFormControl(false),//bool para saber si se edito la tabla detalle partidas
      precio: new UntypedFormControl(row.precio),
      //cambiossubpartidas: new FormControl([]),
      row: new UntypedFormControl(row),
      undconcatrendi: new UntypedFormControl(row.unidad),
      filteredOptions: new UntypedFormControl([]),
      filasel: new UntypedFormControl(-1),
      codsoloiu: new UntypedFormControl(false),
      mcodigo: new UntypedFormControl(true),
      colselacu: new UntypedFormControl(false),
      editarpreins: new UntypedFormControl(false),
      idgruselacu: new UntypedFormControl(null),
      filasinserta: new UntypedFormControl([]),
      filaselimina: new UntypedFormControl([]),
      editajor:new UntypedFormControl(false)
    })
    this.formSubPartida.push(datosTab)
    this.CalcRatioSubp(this.formSubPartida.length-1);
    this.active = this.formSubPartida.value.length - 1;
  }
  async formDataSubPartida(partida): Promise<UntypedFormGroup> {
    const inputidusuariols = this.encriptadorService.recuperarlocalstory('idusuario');
    const formDataPartida = new UntypedFormGroup({
      descripcion: new UntypedFormControl(partida.descripcion, [Validators.required]),
      unidad: new UntypedFormControl(partida.unidad, [Validators.required]),
      precio: new UntypedFormControl(partida.precio, [Validators.required, Validators.min(0)]),
      rendimiento: new UntypedFormControl(partida.rendimiento!=null?partida.rendimiento : '', []),
      undrendimiento: new UntypedFormControl(partida.und_rendi ? partida.und_rendi : '', []),
      jornada: new UntypedFormControl(partida.jornada, []),
      id_usuario: new UntypedFormControl(inputidusuariols, []),
      ratio: new UntypedFormControl('', []),
    })
    formDataPartida.get('undrendimiento').disable();
    formDataPartida.get('ratio').disable();
    return formDataPartida
  }
  async closeModal() {
    if(this.formSubPartida.controls.length>0){
      const form = (this.formSubPartida.controls[this.active]) as UntypedFormGroup
      const tabla_editada = (form.get('tabla_editada') as UntypedFormControl).value
      const dataSubPartidaEditada = (form.get('data_partida') as UntypedFormGroup).dirty
      if (tabla_editada || dataSubPartidaEditada) {
        const respu=await SwalService.confirm('Esta seguro que desea Salir sin guardar los cambios?','');
        if(!respu.isConfirmed){
          return;
        }
        else{
          this.detallepartida = null;
          this.partida = null;
          this.indpri= null;
          this.arrPriSubp=[];
          this.tablaacu=[];
          this.tablaact=[];
          this.tablaactacu=[];
          this.tablaactsub=[];
          this.formSubPartida.clear();
          this.modalSubpart.hide();
        }
      }
      else{
        this.detallepartida = null;
        this.partida = null;
        this.indpri= null;
        this.arrPriSubp=[];
        this.tablaacu=[];
        this.tablaact=[];
        this.tablaactacu=[];
        this.tablaactsub=[];
        this.formSubPartida.clear();
        this.modalSubpart.hide();
      }
    }
    else{
      this.detallepartida = null;
      this.partida = null;
      this.indpri= null;
      this.arrPriSubp=[];
      this.tablaacu=[];
      this.tablaact=[];
      this.tablaactacu=[];
      this.tablaactsub=[];
      this.formSubPartida.clear();
      this.modalSubpart.hide();
    }
  }
  cambindselacusubp(ind: any, tab: any) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let filaselact = form.get('filasel') as UntypedFormControl
    if (ind == filaselact.value)
      filaselact.setValue(-1);
    else
      filaselact.setValue(ind);
  }
  async verifDecsubp(tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    const rendimiento = dataPartida.get('rendimiento') as UntypedFormControl
    const jornada = dataPartida.get('jornada') as UntypedFormControl
    const undrendimiento= dataPartida.get('undrendimiento') as UntypedFormControl;
    if (rendimiento.dirty) {
      let valrendi = Number(rendimiento.value.toString().replace(/\,/g, ''));
      const rendiValido = await this.formService.redondeo(valrendi, 2);
      rendimiento.setValue(rendiValido)
      if(valrendi==0){
        undrendimiento.setValue('GLOBAL');
      }
      else{
        undrendimiento.setValue('DIA');
      }
      for (let row of dataTabla) {
        if (row.num_det > 0 && row.afcuadrilla == 1 && row.operador!='%') {
          let cuadri = Number(row.cuadrilla);
          let aprecio = Number(row.precio);
          var canti=0;
          if(valrendi==0){
            row.cuadrilla=this.formService.redondeo(0,8);
            canti=Number(row.cantidad);
          }else{
            if(cuadri==0 && aprecio!=0){
              canti=Number(row.cantidad);
              cuadri=(canti*valrendi)/Number(jornada.value.toString().replace(/\,/g,''));
              row.cuadrilla=this.formService.redondeo(cuadri,8);
            }
            else{
              var canti=(cuadri*Number(jornada.value.toString().replace(/\,/g,'')))/valrendi;
            }
          }
          //var canti = (cuadri * Number(jornada.value.toString().replace(/\,/g, ''))) / valrendi;
          row.cantidad = this.formService.redondeo(canti, this.dec_cant);
          row.parcial = this.formService.redondeo((canti * aprecio), this.dec_precio);
        }
      }
      this.CalcRatioSubp(tab);
      this.actParcGrupSubp(tab);
    }
  }
  async verifDecJorsubp(tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    const rendimiento = dataPartida.get('rendimiento') as UntypedFormControl
    const jornada = dataPartida.get('jornada') as UntypedFormControl
    if (jornada.dirty) {
      let valjor = Number(jornada.value.toString().replace(/\,/g, ''));
      const jornValido = await this.formService.redondeo(valjor, 0)
      jornada.setValue(jornValido)
      var arendi = Number(rendimiento.value.toString().replace(/\,/g, ''));
      for (let i = 0; i < dataTabla.length; i++) {
        if (dataTabla[i].num_det > 0 && dataTabla[i].afcuadrilla == 1 && dataTabla[i].operador != '%') {
          let cuadri = Number(dataTabla[i].cuadrilla);
          let aprecio = Number(dataTabla[i].precio);
          var canti = arendi==0?Number(dataTabla[i].cantidad):(cuadri * valjor) / arendi;
          dataTabla[i].cantidad = this.formService.redondeo(canti, this.dec_cant);
          dataTabla[i].parcial = this.formService.redondeo((canti * aprecio), this.dec_precio);
        }
      }
      this.CalcRatioSubp(tab);
      this.actParcGrupSubp(tab);
    }
  }
  actParcGrupSubp(tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    let precio = formSubpartida.get('precio') as UntypedFormControl
    let indgru = -1;
    let actgru;
    let parcialgru = 0;
    let parcgrusinporc=0;
    let sumtot = 0;
    for (let i = 0; i < dataTabla.length; i++) {
      if (dataTabla[i].num_det == 0) {
        if (indgru != -1) {
          sumtot += parcialgru;
          dataTabla[indgru].parcial = this.formService.redondeo(parcialgru, this.dec_precio);
          this.actinsporcmodsubp(dataTabla[indgru].id_tipo_insumo,parcgrusinporc,dataTabla[indgru].operador,tab);
        }
        indgru = i;
        actgru = dataTabla[i];
        parcialgru = 0;
        parcgrusinporc=0;
      }
      else {
        if (dataTabla[i].id_tipo_insumo == actgru.id_tipo_insumo) {
          parcialgru += Number(dataTabla[i].parcial)
          if(dataTabla[i].unidad != '' && dataTabla[i].operador==null){
            parcgrusinporc+=Number(dataTabla[i].parcial)
          }
        }
      }
    }
    if (indgru != -1) {
      sumtot += parcialgru;
      dataTabla[indgru].parcial = this.formService.redondeo(parcialgru, this.dec_precio);
    }
    precio.setValue(this.formService.redondeo(sumtot, this.dec_precio));
  }
  editceldat1subp(ind: any, tab:any) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = form.get('data_tabla').value;
    if(dataTabla[ind].num_det!=0){
      dataTabla[ind].editar = 1;
    }
  }
  editceldat2subp(ind: any,tab:any) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = form.get('data_tabla').value;
    if(dataTabla[ind].num_det!=0){
      dataTabla[ind].editar3 = 1;
    }
  }
  editceldat3subp(ind: any,tab:any) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = form.get('data_tabla').value;
    if(dataTabla[ind].num_det!=0 && dataTabla[ind].operador==null && dataTabla[ind].esinsumo==1){
      dataTabla[ind].editar2 = 1;
    }
  }
  actinsporcmodsubp(id_tipo_ins:any,parcialsinporc:any,operador:any,tab:any){
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = form.get('data_tabla').value;
    if(operador==null){
      for(let row of dataTabla){
        if(row.operador=="%" && row.tipo_insumo==id_tipo_ins){
          let cant=Number(row.cantidad);
          let newparc=(parcialsinporc*cant)/100;
          row.precio=this.formService.redondeo(parcialsinporc,this.dec_precio);
          row.parcial=this.formService.redondeo(newparc,this.dec_precio);
          this.Actparcialt1subp(row.id_tipo_insumo,tab);
        }
      }
    }
  }
  caneditceldat1subp(eve: any, ind2: any, tab) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (form.get('data_tabla') as UntypedFormControl).value
    const dataPartida = form.get('data_partida') as UntypedFormGroup
    const rendimiento = dataPartida.get('rendimiento') as UntypedFormControl
    const jornada = dataPartida.get('jornada') as UntypedFormControl
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(dataTabla[ind2].cantidad)
    var aprecio = Number(dataTabla[ind2].precio);
    dataTabla[ind2].editar = 0;
    if (valor != actual) {
      let resparc=dataTabla[ind2].operador=='%'?(valor*aprecio)/100:valor*aprecio;
      if(this.errormaxval(resparc.toString(),'Parcial',10,'','El resultado de ')){ return }
      //calcular cuadrilla, si rendimiento es mayor a 0, sino no hace nada
      if(dataTabla[ind2].afcuadrilla==1 && Number(rendimiento.value)!=0){
        let rescuad=(valor*Number(rendimiento.value))/Number(jornada.value);
        if(this.errormaxval(rescuad.toString(),'Cuadrilla',10,'','El resultado de ')){ return }
        dataTabla[ind2].cuadrilla =this.formService.redondeo(rescuad,8);
      }
      dataTabla[ind2].cantidad = this.formService.redondeo(Number(valor), this.dec_cant);
      dataTabla[ind2].parcial = this.formService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1subp(dataTabla[ind2].id_tipo_insumo, tab)
      this.actinsporcmodsubp(dataTabla[ind2].id_tipo_insumo,sumasinporc,dataTabla[ind2].operador,tab);
      this.CalcRatioSubp(tab);
    }
  }
  caneditceldat2subp(eve: any, ind2: any, tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    const rendimiento = dataPartida.get('rendimiento') as UntypedFormControl
    const jornada = dataPartida.get('jornada') as UntypedFormControl
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(dataTabla[ind2].cuadrilla);
    var aprecio = Number(dataTabla[ind2].precio);
    var rendi = Number(rendimiento.value);
    dataTabla[ind2].editar3 = 0;
    if (valor != actual) {
      var canti = rendi==0?Number(dataTabla[ind2].cantidad):(valor * Number(jornada.value)) / rendi;
      let resparc=dataTabla[ind2].operador=='%'?(Number(this.formService.redondeo(canti, this.dec_cant))*aprecio)/100:Number(this.formService.redondeo(canti, this.dec_cant))*aprecio;
      if(this.errormaxval(canti.toString(),'Cantidad',10,'','El resultado de ')){ return }
      if(this.errormaxval(resparc.toString(),'Parcial',10,'','El resultado de ')){ return }
      dataTabla[ind2].cuadrilla = this.formService.redondeo(Number(valor), 8);
      dataTabla[ind2].cantidad = this.formService.redondeo(canti, this.dec_cant);
      dataTabla[ind2].parcial = this.formService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1subp(dataTabla[ind2].id_tipo_insumo, tab)
      this.actinsporcmodsubp(dataTabla[ind2].id_tipo_insumo,sumasinporc,dataTabla[ind2].operador,tab);
      this.CalcRatioSubp(tab);
    }
  }
  async caneditceldat3subp(eve: any, ind2: any,tab:any) {
    const form = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (form.get('data_tabla') as UntypedFormControl).value
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(dataTabla[ind2].precio)
    var acantidad = Number(dataTabla[ind2].cantidad);
    dataTabla[ind2].editar2 = 0;
    if (valor != actual) {
      let resparc=dataTabla[ind2].operador=='%'?(valor*acantidad)/100:valor*acantidad;
      if(this.errormaxval(resparc.toString(),'Parcial',10,'','El resultado de ')){ return }
      dataTabla[ind2].precio=this.formService.redondeo(Number(valor), this.dec_precio);
      dataTabla[ind2].parcial=this.formService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1subp(dataTabla[ind2].id_tipo_insumo,tab)
      this.actinsporcmodsubp(dataTabla[ind2].id_tipo_insumo,sumasinporc,dataTabla[ind2].operador,tab);
    }
  }
  presentert1subp(event: any, ind: any, tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    if (event.keyCode.toString() == "27") {
      this.caneditceldat1subp(dataTabla[ind].cantidad, ind, tab)
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < dataTabla.length) {
        for (let i = ind + 1; i < dataTabla.length; i++) {
          if (dataTabla[i].unidad != '') {
            event.target.blur();
            dataTabla[i].editar = 1;
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (dataTabla[i].unidad != '') {
            event.target.blur();
            dataTabla[i].editar = 1;
            break;
          }
        }
      }
    }
  }
  presentert2subp(event: any, ind: any, tab) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    if (event.keyCode.toString() == "27") {//esc descartar los cambios
      this.caneditceldat2subp(dataTabla[ind].cuadrilla, ind, tab)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < dataTabla.length) {
        for (let i = ind + 1; i < dataTabla.length; i++) {
          if (dataTabla[i].unidad != '') {
            event.target.blur();
            if(dataTabla[i].afcuadrilla==0 || dataTabla[i].operador=='%'){
              dataTabla[i].editar = 1;
            }
            else{
              dataTabla[i].editar3 = 1;
            }
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (dataTabla[i].unidad != '') {
            event.target.blur();
            if(dataTabla[i].afcuadrilla==0 || dataTabla[i].operador=='%'){
              dataTabla[i].editar = 1;
            }
            else{
              dataTabla[i].editar3 = 1;
            }
            break;
          }
        }
      }
    }
  }
  presentert3subp(event: any, ind: any,tab:any){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditceldat3subp(dataTabla[ind].precio,ind,tab)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < dataTabla.length) {
        for (let i = ind + 1; i < dataTabla.length; i++) {
          if (dataTabla[i].unidad != '' && dataTabla[i].operador==null && dataTabla[i].esinsumo==1) {
            dataTabla[i].editar2 = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (dataTabla[i].unidad != '' && dataTabla[i].operador==null && dataTabla[i].esinsumo==1) {
            dataTabla[i].editar2 = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
  }
  async cerrarPestana(event: MouseEvent, toRemove: number) {
    const form = (this.formSubPartida.controls[this.active]) as UntypedFormGroup
    const tabla_editada = (form.get('tabla_editada') as UntypedFormControl).value
    const dataSubPartidaEditada = (form.get('data_partida') as UntypedFormGroup).dirty
    if (tabla_editada || dataSubPartidaEditada) {
      const sw = await SwalService.confirm('Desea guardar los Cambios?', '')
      if (sw.isConfirmed) {
        this.actualizarsubp(this.active)//revisar accion se realiza?
      }
      else {
        this.accionCerrpest(event, toRemove);
      }
    }
    else {
      this.accionCerrpest(event, toRemove);
    }
  }
  accionCerrpest(event: MouseEvent, toRemove: any) {
    if (!this.formSubPartida.value.length) {
      this.closeModal()
    } else {
      this.formSubPartida.removeAt(toRemove)
      if (!this.formSubPartida.value.length) {
        this.closeModal()
      }
      event?.preventDefault();
      event?.stopImmediatePropagation();
      this.active = this.formSubPartida.value.length - 1
      for (let i = 0; i < this.formSubPartida.value.length; i++) {
        const form = (this.formSubPartida.controls[i]) as UntypedFormGroup
        const indicetab = form.get('indice_tab') as UntypedFormControl
        indicetab.setValue(i)
      }
    }
  }
  async abrirDetalleTab(row,tab) {
    const tabla_editada = this.formSubPartida.value[tab].tabla_editada
    const form = this.formSubPartida.controls[tab] as UntypedFormGroup
    if (tabla_editada || form.dirty) {
      this.toaster.error('Datos no Guardados', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      return
    }
    const encontrado = this.formSubPartida.value.some(ele => ele.row.indice == row.indice && ele.row.indice_subp == row.indice_subp);
    if (encontrado) {
      this.toaster.error('Sub Partida ya abierta', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return
    }
    let summano=0;
    let summat=0;
    let sumeq=0;
    let sumsubc=0;
    let sumsubp=0;
    let detallepart = [];
    for (let fila1 of this.arrPriSubp) {
      if (row.indice_subp == fila1.indice) {
        detallepart.push(fila1);
        if(fila1.unidad!=''){
          if(fila1.id_tipo_insumo=='1'){
            summano+=Number(fila1.parcial);
          }
          else if(fila1.id_tipo_insumo=='2'){
            summat+=Number(fila1.parcial);
          }
          else if(fila1.id_tipo_insumo=='3'){
            sumeq+=Number(fila1.parcial);
          }
          else if(fila1.id_tipo_insumo=='4'){
            sumsubc+=Number(fila1.parcial);
          }
          else if(fila1.id_tipo_insumo=='5'){
            sumsubp+=Number(fila1.parcial);
          }
        }
      }
    }
    //agregar filas agrupaciones
    let pindice=detallepart.length>0?detallepart[0].indice:null;
    let filamano=this.CrearFilaAgru(pindice,'MANO DE OBRA','1',summano,1,1);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'MATERIALES','2',summat,1,0);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'EQUIPO','3',sumeq,1,1);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'SUB CONTRATOS','4',sumsubc,1,0);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'SUB PARTIDAS','5',sumsubp,0,0);
    detallepart.push(filamano);
    detallepart.sort( (a, b) => {
      if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
      }
      return 0;
    });
    if (detallepart.length > 0) {
      await this.agregartab(row, JSON.parse(JSON.stringify(detallepart)));
    }
    else {
      this.toaster.error('Debe guardar los cambios para ver la subpartida.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  toggleOnsubp(condicion: any, ind: any, tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = formSubpartida.get('data_tabla').value;
    dataTabla[ind].icomost = 1;
    for (let i = ind + 1; i < dataTabla.length; i++) {
      if (dataTabla[i].id_tipo_insumo == condicion) {
        if (dataTabla[i].unidad != '') {
          dataTabla[i].mostrar = 1;
        }
      }
      else { break; }
    }
  }
  toggleOffsubp(condicion: any, ind: any, tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let dataTabla = formSubpartida.get('data_tabla').value;
    dataTabla[ind].icomost = 0;
    for (let i = ind + 1; i < dataTabla.length; i++) {
      if (dataTabla[i].id_tipo_insumo == condicion) {
        if (dataTabla[i].unidad != '') {
          dataTabla[i].mostrar = 0;
        }
      }
      else { break; }
    }
  }
  Actparcialt1subp(idtipo: any, tab) {
    let indgrupo = -1;
    let suma = 0;
    let sumasinporc=0;
    let sumatot=0;
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const tabla = formSubpartida.get('data_tabla') as UntypedFormControl
    const precio = formSubpartida.get('precio') as UntypedFormControl
    const tabla_editada = formSubpartida.get('tabla_editada') as UntypedFormControl
    let dataTabla = tabla.value
    for (let i = 0; i < dataTabla.length; i++) {
      if (dataTabla[i].id_tipo_insumo == idtipo && dataTabla[i].unidad == '') {
        indgrupo = i;
      }
      if (dataTabla[i].id_tipo_insumo == idtipo && dataTabla[i].unidad != '') {
        suma += Number(dataTabla[i].parcial)
        sumatot += Number(dataTabla[i].parcial)
        if(dataTabla[i].operador==null){
          sumasinporc+=Number(dataTabla[i].parcial)
        }
      }
      if (dataTabla[i].id_tipo_insumo != idtipo && dataTabla[i].unidad != '') {
        sumatot += Number(dataTabla[i].parcial)
      }
    }
    if (indgrupo >= 0) {
      dataTabla[indgrupo].parcial = this.formService.redondeo(suma, this.dec_precio);
      let nprec=this.formService.redondeo(sumatot,this.dec_precio)
      precio.setValue(nprec);
      tabla_editada.setValue(true)
      return sumasinporc;
    }
  }
  async actualizarsubp(tab) {//guardar cambios, actualizar en tablas y demas
    try {
      const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
      const tabla = formSubpartida.get('data_tabla') as UntypedFormControl
      const tablaeditada = formSubpartida.get('tabla_editada') as UntypedFormControl
      const formpartida = formSubpartida.get('data_partida') as UntypedFormGroup
      //const cambios = formSubpartida.get('cambiossubpartidas') as FormControl
      const rowControl = formSubpartida.get('row') as UntypedFormControl
      const precio = formSubpartida.get('precio') as UntypedFormGroup
      const filasins = formSubpartida.get('filasinserta').value;//agregar referencia
      const filaseli = formSubpartida.get('filaselimina').value;//quitar referencia
      let dataTabla = tabla.value
      let formValue = formpartida.value
      let row = rowControl.value
      if (formpartida.invalid) {
        formpartida.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return
      } else {
        this.mostrar_carga_todo = true
        let existeceros = 0;
        let arregloguarda=JSON.parse(JSON.stringify(dataTabla));
        for (let i = 0; i < arregloguarda.length; i++) {
          if (arregloguarda[i].unidad != '') {
            if(Number(arregloguarda[i].parcial) == 0){
              existeceros = 1;
            }
            let cuadr=arregloguarda[i].cuadrilla?arregloguarda[i].cuadrilla.toString():'';
            if(this.errormaxval(cuadr,'Cuadrilla',10)){ return }
            let cantr=arregloguarda[i].cantidad.toString();
            if(this.errormaxval(cantr,'Cantidad',10)){ return }
            let precior=arregloguarda[i].precio.toString();
            if(this.errormaxval(precior,'Precio',10)){ return }
            let parcr=arregloguarda[i].parcial.toString();
            if(this.errormaxval(parcr,'Parcial',10)){ return }
          }
        }
        //agregar codigo para actualizar los valores en las tablas
        let datosform=formpartida.getRawValue();
        if(row.indice==this.partida.indice){//es subpartida prinicipal
          let undsel=this.medidas.find(ele=>ele.id_unidad==formValue.unidad);
          row.descripcion=this.partida.descripcion = formValue.descripcion.toUpperCase();
          row.id_unidad=this.partida.id_unidad = formValue.unidad;
          row.unidad=this.partida.unidad=undsel.unidad;
          row.rendimiento=this.partida.rendimiento = formValue.rendimiento;
          row.und_rendi=this.partida.und_rendi = datosform.undrendimiento;
          row.jornada=this.partida.jornada = formValue.jornada;
          row.precio=this.partida.precio = precio.value;
          row.advceros=this.partida.advceros = existeceros;
          for (let a = 0; a < this.arrPriSubp.length; a++) {//eliminar detalle existente anterior para agregar los nuevos
            if (row.indice_subp == this.arrPriSubp[a].indice) {
              this.arrPriSubp.splice(a, 1);
              a--;
            }
          }
          for (let b = 0; b < arregloguarda.length; b++) {//agregar los nuevos detalles
            if(arregloguarda[b].num_det>0){
              this.arrPriSubp.push(arregloguarda[b]);
            }
          }
          for (let c = 0; c < filasins.length; c++) {//filas de detalles de subpartidas agregadas
            this.arrPriSubp.push(filasins[c]);
          }
          for (let d = 0; d < filaseli.length; d++) {//eliminar los detalles de subpartidas eliminadas,solo si son subpartidas
            for (let e = 0; e < this.arrPriSubp.length; e++) {
              if (filaseli[d].indice == this.arrPriSubp[e].indice && filaseli[d].indice_subp == this.arrPriSubp[e].indice_subp) {
                this.arrPriSubp.splice(e, 1);
                break;
              }
            }
          }
          //actualizar la fila editada en arrPriSubp
          for(let f=0;f<this.arrPriSubp.length;f++){
            if(this.arrPriSubp[f].indice==row.indice && this.arrPriSubp[f].indice_subp==row.indice_subp){
              this.arrPriSubp[f].descripcion=row.descripcion;
              this.arrPriSubp[f].id_unidad=row.id_unidad;
              this.arrPriSubp[f].unidad=row.unidad;
              this.arrPriSubp[f].rendimiento=row.rendimiento;
              this.arrPriSubp[f].und_rendi=row.und_rendi;
              this.arrPriSubp[f].jornada=row.jornada;
              this.arrPriSubp[f].precio=row.precio;
              this.arrPriSubp[f].advceros=row.advceros;
              break;
            }
          }
          formSubpartida.markAsPristine();
          let objretorna = { fila: JSON.stringify(this.partida), ind: this.indpri };
          //actualiza principal y tambien subpartidas, indices,etc
          await this.actSubpPrinc(objretorna);
        }
        else {//subpartida de una subpartida
          let datosform=formpartida.getRawValue();
          let undsel=this.medidas.find(ele=>ele.id_unidad==formValue.unidad);
          row.descripcion=formValue.descripcion.toUpperCase();
          row.id_unidad=formValue.unidad;
          row.unidad=undsel.unidad;
          row.rendimiento=formValue.rendimiento;
          row.und_rendi=datosform.undrendimiento;
          row.jornada=formValue.jornada;
          row.precio=precio.value;
          row.advceros=existeceros;
          for (let a = 0; a < this.arrPriSubp.length; a++) {
            if (row.indice_subp == this.arrPriSubp[a].indice) {
              this.arrPriSubp.splice(a, 1);
              a--;
            }
          }
          for (let b = 0; b < arregloguarda.length; b++) {//agregar los nuevos detalles
            if(arregloguarda[b].num_det>0){
              this.arrPriSubp.push(arregloguarda[b]);
            }
          }
          row.advceros=existeceros;
          for (let c = 0; c < filasins.length; c++) {//filas de detalles de subpartidas agregadas
            this.arrPriSubp.push(filasins[c]);
          }
          for (let d = 0; d < filaseli.length; d++) {//eliminar los detalles de subpartidas eliminadas,solo si son subpartidas
            for (let e = 0; e < this.arrPriSubp.length; e++) {
              if (filaseli[d].indice == this.arrPriSubp[e].indice && filaseli[d].indice_subp == this.arrPriSubp[e].indice_subp) {
                this.arrPriSubp.splice(e, 1);
                break;
              }
            }
          }
          //actualizar la fila editada en arrPriSubp
          for(let f=0;f<this.arrPriSubp.length;f++){
            if(this.arrPriSubp[f].indice==row.indice && this.arrPriSubp[f].indice_subp==row.indice_subp){
              this.arrPriSubp[f].descripcion=row.descripcion;
              this.arrPriSubp[f].id_unidad=row.id_unidad;
              this.arrPriSubp[f].unidad=row.unidad;
              this.arrPriSubp[f].rendimiento=row.rendimiento;
              this.arrPriSubp[f].und_rendi=row.und_rendi;
              this.arrPriSubp[f].jornada=row.jornada;
              this.arrPriSubp[f].precio=row.precio;
              this.arrPriSubp[f].advceros=row.advceros;
              break;
            }
          }
          //actualizar los datos del padre, buscar en pestañas, hacer metodo recursivo si no esta en las pestañas
          await this.actualizarPadres(row, precio.value);
          formSubpartida.markAsPristine()
        }
        //cerrar pestañas si las subpartidas se elimina
        for(let pest=0;pest<this.formSubPartida.value.length;pest++){
          const encontrado = this.arrPriSubp.find(ele => this.formSubPartida.value[pest].row.indice == ele.indice && this.formSubPartida.value[pest].row.indice_subp == ele.indice_subp);
          if (!encontrado) {
            if(this.formSubPartida.value[pest].row.indice!=this.partida.indice && this.formSubPartida.value[pest].row.indice_subp!=this.partida.indice_subp){
              this.accionCerrpest(null, this.formSubPartida.value[pest].indice_tab);
              pest--;
            }
          }
        }
        this.toaster.success('Se guardó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        tablaeditada.setValue(false)
        //cambios.setValue([])//cambios subpartidas
        formSubpartida.get('filasinserta').setValue([]);
        formSubpartida.get('filaselimina').setValue([]);
        this.mostrar_carga_todo = false;
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  async actualizarPadres(filaact: any, precio: any) {//filaact = fila de la subpartida modificada
    for(let indtab=0;indtab<this.formSubPartida.value.length;indtab++){//buscar en pestaña y actualizar
      const pestana = (this.formSubPartida.controls[indtab]) as UntypedFormGroup;
      if(pestana.value.row.indice_subp==filaact.indice){//actalizar precio fila
        let tabladetpad = pestana.get('data_tabla').value;
        for(let c=0;c<tabladetpad.length;c++){
          if(tabladetpad[c].indice==filaact.indice && tabladetpad[c].indice_subp==filaact.indice_subp){
            tabladetpad[c].descripcion=filaact.descripcion;
            tabladetpad[c].id_unidad=filaact.id_unidad;
            tabladetpad[c].unidad=filaact.unidad;
            tabladetpad[c].rendimiento=filaact.rendimiento;
            tabladetpad[c].und_rendi=filaact.und_rendi;
            tabladetpad[c].jornada=filaact.jornada;
            tabladetpad[c].advceros=filaact.advceros;
            var acanti = Number(tabladetpad[c].cantidad)
            tabladetpad[c].precio = this.formService.redondeo(precio, this.dec_precio);
            tabladetpad[c].parcial = this.formService.redondeo((acanti * precio), this.dec_precio);
            this.Actparcialt1subp(tabladetpad[c].id_tipo_insumo, indtab)//actualizar tambien en la tabla principal
          }
        }
        const tablaeditada = pestana.get('tabla_editada') as UntypedFormControl
        tablaeditada.setValue(false);
      }
    }
    if(this.partida.indice_subp==filaact.indice){//el padre es el principal
      let indicesubp=-1;
      let sumatot=0;
      for(let a=0;a<this.arrPriSubp.length;a++){
        if(filaact.indice==this.arrPriSubp[a].indice && filaact.indice_subp==this.arrPriSubp[a].indice_subp){
          indicesubp=a;
        }
        if(filaact.indice==this.arrPriSubp[a].indice && this.arrPriSubp[a].num_det>0 && filaact.indice_subp!=this.arrPriSubp[a].indice_subp){//corregir esta condicion para el sumatot
          sumatot+=Number(this.arrPriSubp[a].parcial);//sumat total sin la subpartida, se cambiara el parcial
        }
      }
      //actualizar fila
      this.arrPriSubp[indicesubp].descripcion=filaact.descripcion;
      this.arrPriSubp[indicesubp].id_unidad=filaact.id_unidad;
      this.arrPriSubp[indicesubp].unidad=filaact.unidad;
      this.arrPriSubp[indicesubp].rendimiento=filaact.rendimiento;
      this.arrPriSubp[indicesubp].und_rendi=filaact.und_rendi;
      this.arrPriSubp[indicesubp].jornada=filaact.jornada;
      this.arrPriSubp[indicesubp].precio=filaact.precio;
      this.arrPriSubp[indicesubp].advceros=filaact.advceros;
      let cantiact=Number(this.arrPriSubp[indicesubp].cantidad);
      let precionuev=this.formService.redondeo(precio, this.dec_precio)
      this.arrPriSubp[indicesubp].precio=precionuev;
      //actualizar el parcial del grupo subpartidas
      let nparc = (cantiact * Number(precionuev));
      this.arrPriSubp[indicesubp].parcial=this.formService.redondeo(nparc, this.dec_precio);
      sumatot+=nparc;
      this.partida.precio=this.formService.redondeo(sumatot,this.dec_precio);//calcular nuevo precio
      //si es la subpartida principal, actualizar los datos del presupuesto
      let objretorna = { fila: JSON.stringify(this.partida), ind: this.indpri }
      //actualiza principal
      await this.actSubpPrinc(objretorna);
    }
    else{//buscar en supartidas
      let indicepadre=-1;
      let indicesubp=-1;
      let sumatot=0;
      for(let a=0;a<this.arrPriSubp.length;a++){
        if(filaact.indice==this.arrPriSubp[a].indice && filaact.indice_subp==this.arrPriSubp[a].indice_subp){
          indicesubp=a;
        }
        if(filaact.indice==this.arrPriSubp[a].indice_subp){
          indicepadre=a;
        }
        if(filaact.indice==this.arrPriSubp[a].indice && this.arrPriSubp[a].num_det>0 && filaact.indice_subp!=this.arrPriSubp[a].indice_subp){//corregir esta condicion para el sumatot
          sumatot+=Number(this.arrPriSubp[a].parcial);//sumat total sin la subpartida, se cambiara el parcial
        }
      }
      //actualizar fila
      let cantiact=Number(this.arrPriSubp[indicesubp].cantidad);
      let precionuev=this.formService.redondeo(precio, this.dec_precio)
      let nparc = (cantiact * Number(precionuev));
      this.arrPriSubp[indicesubp].precio=precionuev;
      this.arrPriSubp[indicesubp].parcial=this.formService.redondeo(nparc, this.dec_precio);
      sumatot+=nparc;
      this.arrPriSubp[indicepadre].precio=this.formService.redondeo(sumatot,this.dec_precio);
      this.actualizarPadres(this.arrPriSubp[indicepadre],this.arrPriSubp[indicepadre].precio);
    }
  }
  async descartarsubp(numb) {
    const form = (this.formSubPartida.controls[numb]) as UntypedFormGroup
    const row = form.get('row').value;
    const data_partida = form.get('data_partida') as UntypedFormGroup
    form.get('filasinserta').setValue([]);
    form.get('filaselimina').setValue([]);
    data_partida.patchValue({
      descripcion: row.descripcion,
      unidad: Number(row.id_unidad),
      precio: row.precio,
      rendimiento: row.rendimiento,
      undrendimiento: row.und_rendi,
      jornada: row.jornada,
      id_usuario: this.id_userproy,
      tipo_proy: row.tipo_proy,
    })
    let summano=0;
    let summat=0;
    let sumeq=0;
    let sumsubc=0;
    let sumsubp=0;
    let detallepart = []
    for (let fila1 of this.arrPriSubp) {
      if (row.indice_subp == fila1.indice) {
        detallepart.push(fila1);
        if(fila1.unidad!=''){
          if(fila1.id_tipo_insumo=='1'){
            summano+=Number(fila1.parcial);
          }
          else if(fila1.id_tipo_insumo=='2'){
            summat+=Number(fila1.parcial);
          }
          else if(fila1.id_tipo_insumo=='3'){
            sumeq+=Number(fila1.parcial);
          }
          else if(fila1.id_tipo_insumo=='4'){
            sumsubc+=Number(fila1.parcial);
          }
          else if(fila1.id_tipo_insumo=='5'){
            sumsubp+=Number(fila1.parcial);
          }
        }
      }
    }
    //agregar filas agrupaciones
    let pindice=detallepart.length>0?detallepart[0].indice:null;
    let filamano=this.CrearFilaAgru(pindice,'MANO DE OBRA','1',summano,1,1);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'MATERIALES','2',summat,1,0);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'EQUIPO','3',sumeq,1,1);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'SUB CONTRATOS','4',sumsubc,1,0);
    detallepart.push(filamano);
    filamano=this.CrearFilaAgru(pindice,'SUB PARTIDAS','5',sumsubp,0,0);
    detallepart.push(filamano);
    detallepart.sort( (a, b) => {
      if(a.id_tipo_insumo < b.id_tipo_insumo) {
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
      }
      return 0;
    });
    form.patchValue({
      data_tabla: JSON.parse(JSON.stringify(detallepart)),
      tabla_editada: false,
      precio: row.precio,
      //cambiossubpartidas: [],
      undconcatrendi: row.unidad.toUpperCase(),
      filteredOptions: []
    })
    form.markAsPristine()
    this.CalcRatioSubp(numb);
  }
  AddFilaButsubp(tab){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
      const tabla = formSubpartida.get('data_tabla') as UntypedFormControl
      let indselfila = formSubpartida.get('filasel').value;
      let dataTabla = tabla.value
    if(indselfila>-1){
      let rowsel=dataTabla[indselfila];
      if(rowsel.num_det==0){
        this.AddFilaInsSubp(1,tab)
      }
      else{
        this.AddFilaInsSubp(3,tab)
      }
    }
    else{
      this.toaster.error('Seleccione una fila para agregar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  async AddFilaInsSubp(donde: any, tab: any) {//0:inicio,1:final,2:sobre,3:bajo
    try {
      const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
      const tabla = formSubpartida.get('data_tabla') as UntypedFormControl
      const editada = formSubpartida.get('tabla_editada') as UntypedFormControl
      const datosrow = formSubpartida.get('row') as UntypedFormControl
      let filasins = formSubpartida.get('filasinserta').value
      let indselfila = formSubpartida.get('filasel').value;
      let dataTabla = tabla.value
      const formpartida = formSubpartida.get('data_partida') as UntypedFormGroup
      let formValue = formpartida.value
      if (indselfila > -1) {
        let rowsel = dataTabla[indselfila];
        if (rowsel.esinsumo == 1) {//insumos
          this.mostrar_carga_todo = true;
          let arrexisten = []
          let filagru;
          for (let row of dataTabla) {
            if (row.id_tipo_insumo == rowsel.id_tipo_insumo && row.num_det != 0) {
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false/* no cerrar el modal con ESC */ })
          this.mostrar_carga_todo = false
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.inpfuente=1;
          modalRef.componentInstance.afcuad=rowsel.afcuadrilla;
          modalRef.componentInstance.mask_cant=this.mask_cant;
          modalRef.componentInstance.dec_cant=this.dec_cant;
          modalRef.componentInstance.tablaacu=this.tablaacu;
          modalRef.componentInstance.moneda=this.simbolo;
          modalRef.componentInstance.iduser=this.id_userproy;
          modalRef.componentInstance.acuAct=JSON.parse(JSON.stringify(dataTabla));
          const result = await modalRef.result
          if (result?.length > 0) {
            let admitidos = []
            for (let filaadd of result) {
              let existe = false;
              for (let i = 0; i < dataTabla.length; i++) {
                if (dataTabla[i].id_tipo_insumo == filaadd.id_tipo_insumo && dataTabla[i].descripcion == filaadd.descripcion) {
                  existe = true;
                }
              }
              if (!existe) {
                admitidos.push(filaadd);
              }
            }
            let indins = 0;
            let nuevnumdet = 0;
            if (donde == 0) {
              for (let i = 0; i < dataTabla.length; i++) {
                if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo && dataTabla[i].num_det == 0) {
                  indins = i + 1;
                  nuevnumdet = 1;
                }
                else {
                  if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo && dataTabla[i].num_det != 0) {
                    dataTabla[i].num_det = Number(dataTabla[i].num_det) + admitidos.length;
                  }
                }
              }
            }
            else {
              let indbusq = donde == 3 ? indselfila + 1 : indselfila;
              indins = donde == 3 ? indselfila + 1 : indselfila;
              nuevnumdet = donde == 3 ? Number(dataTabla[indselfila].num_det) + 1 : Number(dataTabla[indselfila].num_det);
              for (let i = indbusq; i < dataTabla.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                  if (donde != 1) {
                    dataTabla[i].num_det = Number(dataTabla[i].num_det) + admitidos.length;
                  }
                }
                else {
                  if (donde == 1) {
                    indins = i;
                    nuevnumdet = Number(dataTabla[i - 1].num_det) + 1;
                    break;
                  }
                }
              }
            }
            let nronuevo = donde == 0 ? 1 : nuevnumdet;
            for (let filaadd of admitidos) {
              let preciogru=0;
              if(filaadd.tipo_insumo){
                for(let rowpri of dataTabla){
                  if(rowpri.num_det>0 && rowpri.id_tipo_insumo==filaadd.tipo_insumo && rowpri.operador==null){
                    preciogru+=Number(rowpri.parcial);
                  }
                }
              }
              //calcular total de cantidad o con cuadrilla, tambien ver si agrega algun porcentaje
              let cuadpasa=rowsel.afcuadrilla==1 && filaadd.operador!='%'?filaadd.cantidad:0;
              let cantpasa=0;
              let preciopasa=0;
              let parccal=0;
              if(filaadd.cantidad && Number(filaadd.cantidad)!=0){
                var canti=0;
                if(rowsel.afcuadrilla==1 && filaadd.operador!='%'){
                  canti=Number(formValue.rendimiento.toString())==0?Number(filaadd.cantidad):(cuadpasa*Number(formValue.jornada.toString().replace(/\,/g,'')))/Number(formValue.rendimiento.toString());
                }
                cantpasa=rowsel.afcuadrilla==1 && filaadd.operador!='%'?(this.formService.redondeo(canti,this.dec_cant)):filaadd.cantidad;
                preciopasa=preciogru>0?preciogru:filaadd.precio;//filaadd.operador=='%'?():filaadd.precio;//buscar precio de agrupacion, si cumple condicion buscar, sino no, usar preciogru
                parccal=filaadd.operador=='%'?(Number(cantpasa)*Number(preciopasa))/100 :Number(cantpasa)*Number(preciopasa);//condicionar si se opera con porcentaje
              }
              else{
                preciopasa=preciogru>0?preciogru:filaadd.precio;
              }
              let agrega: rowacu = {
                id_proyecto: this.partida.id_proyecto,
                indice: datosrow.value?.indice_subp,
                id_filadetalle:null,
                //id_part_padre: datosrow.value?.id_partida,
                id_tipo_insumo: filaadd.id_tipo_insumo,
                num_det: nronuevo++,
                codigo: filaadd.codigo,
                descripcion: filaadd.descripcion,
                id_unidad:filaadd.id_unidad,
                unidad: filaadd.unidad,
                operador:filaadd.operador,
                tipo_insumo:filaadd.tipo_insumo,
                cuadrilla: rowsel.afcuadrilla==1?(filaadd.cantidad??0):0,
                cantidad: cantpasa,
                precio: preciopasa,
                parcial: this.formService.redondeo(parccal,this.dec_precio),
                id_insumo: filaadd.id_insumo,
                id_indice: filaadd.id_indice,
                id_subpartida: null,
                indice_subp: null,
                esinsumo: rowsel.esinsumo,
                afcuadrilla: rowsel.afcuadrilla,
                rendimiento: null,
                und_rendi: null,
                jornada: null,
                advceros: filaadd.advceros??null,
                referencia: filaadd.referencia??null,
                id_clasificacion:filaadd.id_clasificacion,
                desc_clasi:filaadd.id_clasificacion?filaadd.desc_clasi:null,
                //afectaref:null,
                icomost: '1',
                mostrar: rowsel.icomost == '1' ? '1' : '0',
                editar: 0,
                editar2:0,
                ind: -1,//this.datasourcePriacu.length,
                accion: 1,
                seleccion: 0,
                asignaund:0,
                zidmodi:null
              };
              dataTabla.splice(indins, 0, agrega);
              editada.setValue(true);
              indins++;
            }
            indselfila = (donde == 0 && rowsel.num_det != 0) || donde == 2 ? indselfila + admitidos.length : indselfila;
            formSubpartida.get('filasel').setValue(indselfila);
            if (result.length != admitidos.length) {
              let difer = result.length - admitidos.length;
              this.toaster.error(difer + ' insumos ya existen.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            }
            if(admitidos.length>0){
              let insumosauto=await this.catalogosService.ListarInsumosAddAuto({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo});
              for(let rowauto of insumosauto){
                let indexis=dataTabla.find(elem=> elem.id_insumo==rowauto.id_insumo);
                if(!indexis){
                  let preciogru=0;
                  let indagre=-1;
                  let numdetadd=-1;
                  let existipo=false;
                  for(let im=0;im<dataTabla.length;im++){
                    if(dataTabla[im].num_det>0 && dataTabla[im].id_tipo_insumo==rowauto.tipo_insumo && dataTabla[im].operador==null){
                      preciogru+=Number(dataTabla[im].parcial);
                    }
                    if(!existipo && dataTabla[im].id_tipo_insumo==rowauto.id_tipo_insumo){
                      existipo=true;
                    }
                    if(existipo && dataTabla[im].id_tipo_insumo!=rowauto.id_tipo_insumo && indagre==-1){
                      numdetadd=(Number(dataTabla[im-1].num_det))+1;
                      indagre=im;
                    }
                  }
                  let agrega:rowacu = {
                    id_proyecto: this.partida.id_proyecto,
                    indice: datosrow.value?.indice_subp,
                    id_filadetalle:null,
                    id_tipo_insumo: rowauto.id_tipo_insumo,
                    num_det: numdetadd,//posicion
                    codigo:rowauto.codigo,
                    descripcion: rowauto.descripcion,
                    id_unidad:rowauto.id_unidad,
                    unidad: rowauto.unidad,
                    operador:rowauto.operador,
                    tipo_insumo:rowauto.tipo_insumo,
                    cuadrilla: 0,
                    cantidad: 0,
                    precio: preciogru,
                    parcial: 0,
                    id_insumo: rowauto.id_insumo,
                    id_indice: rowauto.id_indice,
                    id_subpartida: null,
                    indice_subp: null,
                    esinsumo:rowsel.esinsumo,
                    afcuadrilla:rowsel.afcuadrilla,
                    rendimiento: null,
                    und_rendi: null,
                    jornada: null,
                    advceros: null,
                    referencia: null,
                    id_clasificacion:rowauto.id_clasificacion,
                    desc_clasi:rowauto.id_clasificacion?rowauto.desc_clasi:null,
                    //afectaref:null,
                    icomost: '1',
                    mostrar: rowsel.icomost == '1' ? '1' : '0',
                    editar: 0,
                    editar2:0,
                    ind:dataTabla.length,
                    seleccion:0,
                    accion: 1,
                    asignaund:0,
                    zidmodi:null
                  };
                  dataTabla.splice(indagre,0,agrega);
                }
              }
            }
            //calcular todales de la agrupacion y afectar a los porcentajes para calcular el total de toda la partida
            let sumasinporc=this.Actparcialt1subp(rowsel.id_tipo_insumo,tab)
            this.actinsporcmodsubp(rowsel.id_tipo_insumo,sumasinporc,rowsel.operador,tab);
          }
        }
        else {//subpartidas
          let rowcondi = JSON.parse(JSON.stringify(datosrow.value))
          rowcondi.id_partida = datosrow.value.id_subpartida;
          this.mostrar_carga_todo = true
          //cargar tabla con subpartidas
          let arrosubp=[];
          for(let row1 of this.tablaactacu){
            if(row1.id_tipo_insumo==5 && Number(row1.num_det)>0){
              let exist=arrosubp.find(ele=>ele.descripcion==row1.descripcion && ele.precio==row1.precio);
              if(!exist){
                arrosubp.push(JSON.parse(JSON.stringify(row1)));
              }
            }
          }
          for(let row2 of this.tablaactsub){
            if(row2.id_tipo_insumo==5 && Number(row2.num_det)>0){
              let exist=arrosubp.find(ele=>ele.descripcion==row2.descripcion && ele.precio==row2.precio);
              if(!exist){
                arrosubp.push(JSON.parse(JSON.stringify(row2)));
              }
            }
          }
          let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.id_user, fuente: this.fuentepasa, tipo_proy: this.tipoProy, idpadre: rowcondi.id_partida??'', restriccion: rowcondi.referencia??'' });//cambiar dinamico tipo_proy
          const modalRef = this.modalService.open(ModaladdsubpartidaComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
          modalRef.componentInstance.partidacondiciona = rowcondi;
          modalRef.componentInstance.partidas = rpartidas;
          modalRef.componentInstance.subpartida = true;
          modalRef.componentInstance.tipoProy = this.arrtipoProy;//cargar los tipos de proyecto
          modalRef.componentInstance.tipoproysel=this.tipoProy;//cargar los tipos de proyecto
          modalRef.componentInstance.medidas = this.medidas;
          modalRef.componentInstance.fuentecrea=this.fuentepasa;//dinamico
          modalRef.componentInstance.dec_cant=this.dec_cant;
          modalRef.componentInstance.mask_cant=this.mask_cant;
          modalRef.componentInstance.dec_precio=this.dec_precio;
          modalRef.componentInstance.mask_precio=this.mask_precio;
          modalRef.componentInstance.tablaacu=this.tablaacu;
          modalRef.componentInstance.tablaact=JSON.parse(JSON.stringify(this.tablaact));
          modalRef.componentInstance.tablaactacu=JSON.parse(JSON.stringify(this.tablaactacu));
          modalRef.componentInstance.tablaactsub=JSON.parse(JSON.stringify(this.tablaactsub));
          modalRef.componentInstance.subpartact=JSON.parse(JSON.stringify(arrosubp));
          modalRef.componentInstance.moneda=this.simbolo;
          modalRef.componentInstance.id_user=this.id_user;
          this.mostrar_carga_todo = false;
          const result = await modalRef.result
          if (result) {
            this.mostrar_carga_todo=true;
            let admitidos = [];
            let titsubtitulos = 0;
            if(result.forma==2){//del mismo proyecto
              for(let filaadd of result.partidas){
                let existe=false;
                for(let i=0;i<dataTabla.length;i++){
                  //comparar si permite la referencia , ya se filtro antes de agregar
                  if(dataTabla[i].esinsumo == 0 && (filaadd.id_partida && dataTabla[i].id_subpartida==filaadd.id_partida)){
                    existe=true;
                  }
                }
                if(!existe){
                  admitidos.push(filaadd);
                }
              }
            }
            else{
              for (let filaadd of result.partidas) {
                if (filaadd.esgrupo == 1) {
                  let existe = false;
                  for (let i = 0; i < dataTabla.length; i++) {
                    if (dataTabla[i].esinsumo == 0 && filaadd.esgrupo == 1 && (filaadd.id_partida && dataTabla[i].id_subpartida == filaadd.id_partida)) {
                      existe = true;
                    }
                  }
                  if (!existe) {
                    admitidos.push(filaadd);
                  }
                }
                else {
                  titsubtitulos++;
                }
              }
            }
            let indins = 0;
            let nuevnumdet = 0;
            if (donde == 0) {
              for (let i = 0; i < dataTabla.length; i++) {
                if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo && dataTabla[i].num_det == 0) {
                  indins = i + 1;
                  nuevnumdet = 1;
                }
                else {
                  if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo && dataTabla[i].num_det != 0) {
                    dataTabla[i].num_det = Number(dataTabla[i].num_det) + admitidos.length;
                  }
                }
              }
            }
            else {
              let indbusq = donde == 3 ? indselfila + 1 : indselfila;
              indins = donde == 3 ? indselfila + 1 : indselfila;
              nuevnumdet = donde == 3 ? Number(dataTabla[indselfila].num_det) + 1 : Number(dataTabla[indselfila].num_det);
              let tienecont = false;
              for (let i = indbusq; i < dataTabla.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                if (dataTabla[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                  if (donde != 1) {
                    dataTabla[i].num_det = Number(dataTabla[i].num_det) + admitidos.length;
                  }
                }
              }
              if (!tienecont && donde == 1) {
                indins = dataTabla.length;
                nuevnumdet = dataTabla[dataTabla.length - 1].num_det + 1;
              }
            }
            let nronuevo = donde == 0 ? 1 : nuevnumdet;
            for (let filaadd of admitidos) {
              //cargar detalle de partida al principal? solo de supartidas, manejar un indice para eliminar solo esos datos si se elimina la subpartida
              let indicedet=this.ultindice++;
              let totpart;
              //if(filaadd && filaadd.id_partida && filaadd.id_partida!=''){//solo buscar y agregar a subpartidas
              if(result.forma==1){//catalogos
                let tabdet=await this.catalogosService.ListarDetalleDataPartidas({ id_partida: filaadd.id_partida });
                let arrdet=tabdet.length>0?tabdet[0]:[];
                let arrsub=tabdet.length>0?tabdet[1]:[];
                let arraux=[];
                arraux=arrdet.concat(arrsub);
                totpart=await this.CargarDetalleModSubp(arraux,filaadd,filaadd.id_partida,indicedet,filasins,null);//referencia debe ser null? si el padre es null?
              }
              else{//cargar arreglo de supbartidas
                this.CargarModSubpResult(result.subpartidas,indicedet,result.tipopart=='0'?filaadd.indice:filaadd.indice_subp,null,filasins);//referencia no se modifica porque el padre no tiene id
              }
              let referact = filaadd.referencia == null || filaadd.referencia == '' ? (datosrow.value?.id_partida) : (filaadd.referencia + "," + datosrow.value?.id_partida);
              let ncod='SP'+indicedet.toString().padStart(5,'0');
              let agrega: rowacu = {
                id_proyecto: this.partida.id_proyecto,
                indice: datosrow.value?.indice_subp,
                id_filadetalle:null,
                id_tipo_insumo: rowsel.id_tipo_insumo,
                num_det: nronuevo++,
                codigo: ncod,//filaadd.codigo,
                descripcion: filaadd.descripcion,
                id_unidad:filaadd.id_unidad,
                unidad:filaadd.unidad,
                operador:null,
                tipo_insumo:null,
                cuadrilla: 0,
                cantidad: 0,
                precio: totpart?this.formService.redondeo(totpart,this.dec_precio):filaadd.precio,
                parcial: 0,
                id_insumo: null,
                id_indice: null,
                id_subpartida: filaadd.id_subpartida,
                indice_subp: indicedet,//this.datasourcePri[this.filaSel].id_partida,
                esinsumo: rowsel.esinsumo,
                afcuadrilla: 0,
                rendimiento: filaadd.rendimiento,
                und_rendi: filaadd.und_rendi,
                jornada: filaadd.jornada,
                advceros: filaadd.advceros??null,
                referencia: referact??null,
                id_clasificacion:null,
                desc_clasi:null,
                icomost: '1',
                mostrar: rowsel.icomost == '1' ? '1' : '0',
                editar: 0,
                editar2:0,
                ind: -1,//this.datasourcePriacu.length,
                accion: 1,
                seleccion: 0,
                asignaund:0,
                zidmodi:null
              };
              dataTabla.splice(indins, 0, agrega);
              editada.setValue(true);
              indins++;
            }
            indselfila = (donde == 0 && rowsel.num_det != 0) || donde == 2 ? indselfila + admitidos.length : indselfila;
            formSubpartida.get('filasel').setValue(indselfila);
            this.mostrar_carga_todo=false;
            if ((result.partidas.length - titsubtitulos) != admitidos.length) {
              let difer = (result.partidas.length - titsubtitulos) - admitidos.length;
              this.toaster.error(difer + ' subpartida(s) ya existen.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            }
          }
        }
      }
      else {
        this.toaster.error('Seleccione una fila para agregar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e)
    }
  }
  async CargarModSubpResult(subpartidas,indicepadre,indicesubp,refer,arragrega){
    for(let rowsubp of subpartidas){
      if(rowsubp.indice==indicesubp && rowsubp.num_det>0){
        let referpasa=null;
        let ncod;
        let indicedet=rowsubp.esinsumo==0 && rowsubp.num_det>0?this.ultindice++:null;
        if(rowsubp.esinsumo==0 && rowsubp.num_det>0){
          referpasa=rowsubp.referencia==null || rowsubp.referencia==''?refer:(refer!=null?rowsubp.referencia+","+refer:rowsubp.referencia);
          ncod='SP'+indicedet.toString().padStart(5,'0');
        }
        let agrega:rowacu={
          id_tipo_insumo:rowsubp.id_tipo_insumo,
          num_det:rowsubp.num_det,
          codigo:ncod,//rowsubp.codigo=='' || rowsubp.codigo==null?null:rowsubp.codigo,
          descripcion:rowsubp.descripcion,
          id_unidad:rowsubp.id_unidad,
          unidad:rowsubp.unidad,
          operador:rowsubp.operador??null,
          tipo_insumo:rowsubp.tipo_insumo??null,
          cuadrilla:rowsubp.cuadrilla??null,
          cantidad:rowsubp.cantidad??null,
          precio:rowsubp.precio??null,
          parcial:rowsubp.parcial??null,
          indice:indicepadre,//debe tener indice para vincular?
          indice_subp:indicedet?indicedet:null,
          id_indice:rowsubp.id_indice,
          id_clasificacion:rowsubp.id_clasificacion,
          desc_clasi:rowsubp.desc_clasi,
          id_insumo:rowsubp.id_insumo,
          id_subpartida:rowsubp.id_subpartida,
          esinsumo:rowsubp.esinsumo,
          afcuadrilla:rowsubp.afcuadrilla,
          rendimiento:rowsubp.rendimiento,
          und_rendi:rowsubp.und_rendi,
          jornada:rowsubp.jornada,
          advceros:rowsubp.advceros,
          referencia:referpasa,
          icomost:'1',
          mostrar:rowsubp.icomost=='1'?'1':'0',
          editar:0,
          editar2:0,
          ind:-1,
          seleccion:0,
          accion: 1,
          id_proyecto: this.partida.id_proyecto,
          id_filadetalle:null,
          asignaund:0,
          zidmodi:null
        };
        arragrega.push(agrega);
        if(rowsubp.esinsumo==0 && rowsubp.num_det>0){//si es subpartidas, agregar su detalle
          await this.CargarModSubpResult(subpartidas,indicedet,rowsubp.indice_subp,refer,arragrega);
        }
      }
    }
  }
  async CargarDetalleModSubp(detsubp:any,fillaadd:any,id_partida:any, newindice:any, filasins:any, refer:any) {//filains, arreglo al que se agregan las partidas
    let detpart = [];
    let tablabusq=JSON.parse(JSON.stringify(detsubp));
    for(let fila1 of tablabusq){
      if(fila1.id_partida==id_partida && fila1.num_det>0){
        detpart.push(fila1);
      }
    }
    let sumapsubp=0;
    let arragru=[];
    for(let m=0;m<detpart.length;m++){
      if(detpart[m].num_det>0){
        let sumasubp=0;
        if(detpart[m].esinsumo==0 && detpart[m].num_det>0){//condicionar con id_partida!=null o agregar directamente detalle cuando se agrega la subpartida
          let indicedet=this.ultindice++;
          sumasubp=await this.CargarDetalleModSubp(detsubp,detpart[m],detpart[m].id_subpartida,indicedet,filasins,refer);//se debe pasar subpartida
          detpart[m].indice_subp=indicedet;
        }
        let cantaux;
        if(detpart[m].operador=='%'){
          cantaux=this.formService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
          detpart[m].precio=0;
        }
        else{
          if(detpart[m].afcuadrilla==1){
            var canti=Number(fillaadd.rendimiento)==0?Number(detpart[m].cantidad):(Number(detpart[m].cuadrilla)*Number(fillaadd.jornada))/Number(fillaadd.rendimiento);
            cantaux=this.formService.redondeo(Number(canti),this.dec_cant);//se calcula, en el caso de afcuadrilla
          }else{
            cantaux=this.formService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
          }
        }
        detpart[m].cantidad=cantaux;
        let precioaux=detpart[m].esinsumo==0 && detpart[m].num_det>0?this.formService.redondeo(sumasubp,this.dec_precio):this.formService.redondeo(Number(detpart[m].precio),this.dec_precio);
        detpart[m].precio=precioaux;
        let nparc=Number(cantaux)*Number(precioaux);
        detpart[m].parcial=this.formService.redondeo(nparc,this.dec_precio);
        let encind=arragru.find(ele=>ele.id_tipo_insumo==detpart[m].id_tipo_insumo)
        if(encind){
          encind.parcial=Number(encind.parcial)+Number(detpart[m].parcial)
        }
        else{
          arragru.push({id_tipo_insumo:detpart[m].id_tipo_insumo,parcial:detpart[m].parcial})
        }
      }
    }
    //calcular porcentajes
    for(let n=0;n<detpart.length;n++){
      if(detpart[n].operador=='%'){
        let parcagru=arragru.find(ele=>ele.id_tipo_insumo==detpart[n].tipo_insumo)
        if(parcagru){
          detpart[n].precio=this.formService.redondeo(Number(parcagru.parcial),this.dec_precio);
          detpart[n].parcial=this.formService.redondeo((Number(detpart[n].cantidad)*Number(detpart[n].precio))/100,this.dec_precio);
        }
        else{
          detpart[n].precio=0;
          detpart[n].parcial=0;
        }
      }
    }
    for (let a = 0; a < detpart.length; a++) {
      let referpasa = null;
      let ncod;
      if (detpart[a].esinsumo == 0 && detpart[a].num_det > 0/*  && !refer */) {
        referpasa = detpart[a].referencia == null || detpart[a].referencia == '' ? refer : (refer!=null?detpart[a].referencia + "," + refer:detpart[a].referencia);
        ncod='SP'+detpart[a].indice_subp.toString().padStart(5,'0');
      }
      //let indicedet=detpart[a].esinsumo==0 && detpart[a].num_det>0?this.indicepri++:null;
      let filaaux: rowacu = {
        id_proyecto: this.partida.id_proyecto,
        indice: newindice,
        id_filadetalle:null,
        id_tipo_insumo: Number(detpart[a].id_tipo_insumo),
        num_det: detpart[a].num_det,
        codigo: ncod,//detpart[a].codigo == '' || detpart[a].codigo == null ? null : detpart[a].codigo,
        descripcion: detpart[a].descripcion,
        id_unidad:detpart[a].id_unidad,
        unidad:detpart[a].unidad,
        operador:detpart[a].operador,
        tipo_insumo:detpart[a].tipo_insumo,
        cuadrilla: detpart[a].operador!='%' && detpart[a].cuadrilla!=null?Number(detpart[a].cuadrilla):null,
        cantidad: detpart[a].cantidad != null ? Number(detpart[a].cantidad) : null,
        precio: detpart[a].precio != null ? Number(detpart[a].precio) : null,
        parcial: detpart[a].parcial != null ? Number(detpart[a].parcial) : null,
        id_indice: detpart[a].id_indice,
        id_insumo: Number(detpart[a].id_insumo),
        id_subpartida: detpart[a].id_subpartida,
        indice_subp: detpart[a].indice_subp??null,
        esinsumo: detpart[a].esinsumo,
        afcuadrilla: detpart[a].afcuadrilla,
        rendimiento: detpart[a].rendimiento,
        und_rendi: detpart[a].und_rendi,
        jornada: detpart[a].jornada,
        advceros: detpart[a].advceros??null,
        referencia: referpasa??null,
        id_clasificacion:detpart[a].id_clasificacion,
        desc_clasi:detpart[a].id_clasificacion?detpart[a].desc_clasi:null,
        accion: 1,
        mostrar: 1,
        icomost: 1,
        editar: 0,
        editar2:0,
        ind: -1,
        seleccion: 0,
        asignaund:0,
        zidmodi:null
      };
      filasins.push(filaaux);//para pushear se debe obtener el formato del objeto rowacu
      if(detpart[a].num_det>0){
        sumapsubp+=Number(detpart[a].parcial)
      }
    }
    return sumapsubp;
  }
  OpcCodSubp(opc: any, tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let mcodigo = formSubpartida.get('mcodigo');
    let codsoloiu = formSubpartida.get('codsoloiu');
    if (opc == 1) {//ver codigo
      mcodigo.setValue(true);
      codsoloiu.setValue(false);
    }
    else if (opc == 2) {//ver indice unif
      mcodigo.setValue(true);
      codsoloiu.setValue(true);
    }
    else if (opc == 3) {//ocultar codigo
      mcodigo.setValue(false);
    }
  }
  HabSelAcuSubp(tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const tabladet = formSubpartida.get('data_tabla') as UntypedFormControl
    let colselacu = formSubpartida.get('colselacu');
    let idgruselacu = formSubpartida.get('idgruselacu');
    colselacu.setValue(!colselacu.value);
    idgruselacu.setValue(null);
    for (let row of tabladet.value) {
      row.seleccion = 0;
    }
  }
  Cambseltacusubp(row, tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const tabladet = formSubpartida.get('data_tabla').value;
    let idgruselacu = formSubpartida.get('idgruselacu');
    if (!idgruselacu.value) {
      idgruselacu.setValue(row.id_tipo_insumo);
    }
    if (row.seleccion == 0) {
      if (idgruselacu.value == row.id_tipo_insumo) {
        row.seleccion = 1;
      }
      else {
        row.seleccion = 1;
        idgruselacu.setValue(row.id_tipo_insumo);
        for (let row2 of tabladet) {
          if (row2.id_tipo_insumo != row.id_tipo_insumo) {
            row2.seleccion = 0;
          }
        }
      }
    }
    else { row.seleccion = 0; }
  }
  SubFilaInsSubp(tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let tabladet = formSubpartida.get('data_tabla').value;
    let colselacu = formSubpartida.get('colselacu').value;
    let indselfila = formSubpartida.get('filasel').value;
    const tablaeditada = formSubpartida.get('tabla_editada') as UntypedFormControl
    if (colselacu) {//seleccion multiple
      let arrsel = [];
      let arrindic = [];
      for (let i = 0; i < tabladet.length; i++) {
        if (tabladet[i].seleccion == 1) {
          arrsel.push(tabladet[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for (let j = 0; j < arrsel.length; j++) {
          let sube = tabladet[arrindic[j]];
          let baja = tabladet[arrindic[j] - 1];
          if (baja.seleccion == 0 && baja.num_det > 0) {
            sube.num_det = sube.num_det - 1;
            baja.num_det = baja.num_det + 1;;
            tabladet[arrindic[j]] = baja;
            tabladet[arrindic[j] - 1] = sube;
          }
        }
        tablaeditada.setValue(true);
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else {
      if (indselfila > -1) {
        let sube = tabladet[indselfila];
        let baja = tabladet[indselfila - 1];
        if (sube.num_det != 0) {
          if (baja.num_det != 0) {
            sube.num_det = sube.num_det - 1;
            baja.num_det = baja.num_det + 1;;
            tabladet[indselfila] = baja;
            tabladet[indselfila - 1] = sube;
            indselfila = indselfila - 1;
            formSubpartida.get('filasel').setValue(indselfila);
            tablaeditada.setValue(true);
          }
          else {
            this.toaster.error('Ya no se puede subir.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          }
        }
        else {
          this.toaster.error('La fila seleccionada no se puede mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
      else {
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
  }
  BajFilaInsSubp(tab: any) {
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    let tabladet = formSubpartida.get('data_tabla').value;
    let colselacu = formSubpartida.get('colselacu').value;
    let indselfila = formSubpartida.get('filasel').value;
    const tablaeditada = formSubpartida.get('tabla_editada') as UntypedFormControl
    if (colselacu) {//seleccion multiple
      let arrsel = [];
      let arrindic = [];
      for (let i = 0; i < tabladet.length; i++) {
        if (tabladet[i].seleccion == 1) {
          arrsel.push(tabladet[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for (let j = arrsel.length - 1; j >= 0; j--) {
          let sube = tabladet[arrindic[j] + 1];
          let baja = tabladet[arrindic[j]];
          if (sube.seleccion == 0 && sube.num_det > 0) {
            sube.num_det = sube.num_det - 1;
            baja.num_det = baja.num_det + 1;
            tabladet[arrindic[j]] = sube;
            tabladet[arrindic[j] + 1] = baja;
          }
        }
        tablaeditada.setValue(true);
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else {
      if (indselfila > -1) {
        if (indselfila < tabladet.length - 1) {
          let sube = tabladet[indselfila + 1];
          let baja = tabladet[indselfila];
          if (baja.num_det != 0) {
            if (sube.num_det != 0) {
              sube.num_det = sube.num_det - 1;
              baja.num_det = baja.num_det + 1;;
              tabladet[indselfila] = sube;
              tabladet[indselfila + 1] = baja;
              indselfila = indselfila + 1;
              formSubpartida.get('filasel').setValue(indselfila);
              tablaeditada.setValue(true);
            }
            else {
              this.toaster.error('Ya no se puede bajar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
            }
          }
          else {
            this.toaster.error('La fila seleccionada no se puede mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          }
        }
        else {
          this.toaster.error('Ya no se puede bajar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
      else {
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
  }
  eliminaDatosModSubp(filaelimina:any,filaseli:any){
    for(let row of this.arrPriSubp){
      if(row.indice==filaelimina.indice_subp){
        filaseli.push(row);
        if (row.esinsumo == 0) {
          this.eliminaDatosModSubp(row,filaseli);//si es subpartida hacer un recursivo para que agregue sus detalles y subpartidas
        }
      }
    }
  }
  async DelInsSubp(tab: any) {
    try {
      const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
      let tabladet = formSubpartida.get('data_tabla').value;
      let colselacu = formSubpartida.get('colselacu').value;
      let indselfila = formSubpartida.get('filasel').value;
      //let cambiossubpartidas = formSubpartida.get('cambiossubpartidas').value;
      let filaseli = formSubpartida.get('filaselimina').value;
      if (colselacu) {//seleccion multiple
        let arrsel = [];
        let arrindic = [];
        for (let i = 0; i < tabladet.length; i++) {
          if (tabladet[i].seleccion == 1) {
            arrsel.push(tabladet[i]);
            arrindic.push(i);
          }
        }
        if (arrsel.length > 0) {
          const respu = await SwalService.confirm('Esta seguro que desea Eliminar?', '');
          if (!respu.isConfirmed) {
            return;
          }
          for (let j = 0; j < arrsel.length; j++) {
            //revisar cambios para subpartidas
            /* let existecambiosub=false;
            for(let j=0;j<cambiossubpartidas.length;j++){
              if(cambiossubpartidas[j].id_subpartida==arrsel[j].id_subpartida){
                cambiossubpartidas.splice(j,1);
                existecambiosub=true;
              }
            }
            if(!existecambiosub && arrsel[j].esinsumo==0){
              arrsel[j].afectaref=2;
              cambiossubpartidas.push(arrsel[j])
            } */
            //fin revisar cambios subpartidas
            // for (let k = arrindic[j] + 1; k < tabladet.length; k++) {//actualizar nuevos num_det
            //   if (tabladet[k].id_tipo_insumo == arrsel[j].id_tipo_insumo) {
            //     let newind = tabladet[k].num_det - 1;
            //     tabladet[k].num_det = newind;
            //   }
            //   let indact = tabladet[k].ind;
            //   if (indact > arrsel[j].ind) {//actualizar ind si es mayor al eliminado
            //     tabladet[k].ind = tabladet[k].ind - 1;
            //   }
            // }
            for (let k = 0; k < tabladet.length; k++) {//actualizar nuevos num_det
              let indact = tabladet[k].ind;
              if (indact > arrsel[j].ind) {//actualizar ind si es mayor al eliminado
                tabladet[k].ind = tabladet[k].ind - 1;
              }
            }
            if (arrsel[j].esinsumo == 0) {
              //si es subpartida hacer un recursivo para que agregue sus detalles y subpartidas
              this.eliminaDatosModSubp(arrsel[j],filaseli)
            }
            tabladet.splice(arrindic[j], 1);
            for (let a = j + 1; a < arrindic.length; a++) {
              arrindic[a] = arrindic[a] - 1;
            }
          }
          //actualizar insumos porc
          let sumasinporc=this.Actparcialt1subp(arrsel[0].id_tipo_insumo, tab);
          this.actinsporcmodsubp(arrsel[0].id_tipo_insumo,sumasinporc,arrsel[0].operador,tab);
          let ndt=1;
          for(let k=0;k<tabladet.length;k++){//actualizar nuevos num_det
            if(tabladet[k].id_tipo_insumo==arrsel[0].id_tipo_insumo && tabladet[k].num_det!=0){
              tabladet[k].num_det=ndt;
              ndt++;
            }
          }
          this.CalcRatioSubp(tab);
        }
        else {
          this.toaster.error('Seleccione insumos para eliminar', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
      else {//seleccion individual
        if (indselfila > -1) {
          if (tabladet[indselfila].num_det != 0) {
            const respu = await SwalService.confirm('Esta seguro que desea Eliminar?', '');
            if (!respu.isConfirmed) {
              return;
            }
            let indpri = tabladet[indselfila].ind;
            let tipoinssel = tabladet[indselfila].id_tipo_insumo;
            ///revisar cambios para subpartidas
            //let existecambiosub = false;
            // for (let j = 0; j < cambiossubpartidas.length; j++) {
            //   if (cambiossubpartidas[j].id_subpartida == tabladet[indselfila].id_subpartida) {
            //     cambiossubpartidas.splice(j, 1);
            //     existecambiosub = true;
            //   }
            // }
            // if (!existecambiosub && tabladet[indselfila].esinsumo == 0) {
            //   tabladet[indselfila].afectaref = 2;
            // }
            //fin revisar cambios subpartidas
            // for (let k = indselfila + 1; k < tabladet.length; k++) {//actualizar nuevos num_det
            //   if (tabladet[k].id_tipo_insumo == tipoinssel) {
            //     let newind = tabladet[k].num_det - 1;
            //     tabladet[k].num_det = newind;
            //   }
            //   let indact = tabladet[k].ind;
            //   if(indact>indpri) {//actualizar ind si es mayor al eliminado
            //     tabladet[k].ind = tabladet[k].ind - 1;
            //   }
            // }
            let ndt=1;
            for(let k=0;k<tabladet.length;k++){//actualizar num_det del grupo
              if(tabladet[k].id_tipo_insumo==tipoinssel && tabladet[k].num_det!=0){
                if(k!=indselfila){
                  tabladet[k].num_det=ndt;
                  ndt++;
                }
              }
            }
            for(let row of tabladet){
              let indact=row.ind;
              if(indact>indpri){//actualizar ind si es mayor al eliminado
                row.ind=row.ind-1;
              }
            }
            if (tabladet[indselfila].esinsumo == 0) {
              /* filaseli.push(tabladet[indselfila]);//al eliminar del acu ya no se agregara al actualizar */
              //si es subpartida hacer un recursivo para que agregue sus detalles y subpartidas
              this.eliminaDatosModSubp(tabladet[indselfila],filaseli)
            }
            tabladet.splice(indselfila, 1);
            formSubpartida.get('filasel').setValue(-1);
            let sumasinporc=this.Actparcialt1subp(tipoinssel, tab);
            this.actinsporcmodsubp(tipoinssel,sumasinporc,tabladet[indselfila].operador,tab);
            this.CalcRatioSubp(tab);
          }
          else {
            this.toaster.error('No se puede eliminar el elemento seleccionado', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          }
        }
        else {
          this.toaster.error('Seleccione una insumo para eliminar', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false
      console.log(e)
    }
  }
  async ReplaceInsSubp(tab: any) {
    try {
      const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
      let tabladet = formSubpartida.get('data_tabla').value;
      let indselfila = formSubpartida.get('filasel').value;
      const datosrow = formSubpartida.get('row') as UntypedFormControl
      if (indselfila > -1) {
        let rowsel = tabladet[indselfila];
        if (rowsel.num_det == 0) {//agrupacion
          this.toaster.error('La fila seleccionada no se puede reemplazar', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
          return;
        }
        if (rowsel.esinsumo == 1) {//insumos
          this.mostrar_carga_todo = true;
          let arrexisten = []
          let filagru;
          for (let row of tabladet) {
            if (row.id_tipo_insumo == rowsel.id_tipo_insumo && row.num_det != 0) {
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
          this.mostrar_carga_todo = false
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.reemplaza = true;
          modalRef.componentInstance.inpfuente=1;
          modalRef.componentInstance.tablaacu=this.tablaacu;
          modalRef.componentInstance.rowfiltro=rowsel;
          modalRef.componentInstance.moneda=this.simbolo;
          modalRef.componentInstance.iduser=this.id_userproy;
          const result = await modalRef.result
          if (result) {
            if (result.length > 0) {
              let preciogru=0;
              if(result[0].tipo_insumo){
                rowsel.cuadrilla=0;
                for(let rowpri of tabladet){
                  if(rowpri.num_det>0 && rowpri.id_tipo_insumo==result[0].tipo_insumo && rowpri.operador==null){
                    preciogru+=Number(rowpri.parcial);
                  }
                }
              }
              else{
                preciogru=result[0].precio;
              }
              if(rowsel.afcuadrilla==1 && rowsel.operador=='%'){
                rowsel.cuadrilla=0;
                rowsel.cantidad=0;
              }
              let nuevparc=result[0].operador=='%'?(Number(rowsel.cantidad)*preciogru)/100:Number(rowsel.cantidad)*preciogru;
              let agrega: rowacu = {
                id_proyecto: this.partida.id_proyecto,
                indice: datosrow.value?.indice_subp,
                id_filadetalle:null,
                id_tipo_insumo: result[0].id_tipo_insumo,
                num_det: rowsel.num_det,
                codigo: result[0].codigo,
                descripcion: result[0].descripcion,
                id_unidad:result[0].id_unidad,
                unidad: result[0].unidad,
                operador:result[0].operador,
                tipo_insumo:result[0].tipo_insumo,
                cuadrilla: rowsel.cuadrilla,
                cantidad: rowsel.cantidad,
                precio: preciogru,
                parcial: this.formService.redondeo(nuevparc,this.dec_precio),
                id_insumo: result[0].id_insumo,
                id_indice: result[0].id_indice,
                id_subpartida: null,
                indice_subp: null,
                esinsumo: rowsel.esinsumo,
                afcuadrilla: rowsel.afcuadrilla,
                rendimiento: null,
                und_rendi: null,
                jornada: null,
                advceros: result[0].advceros??null,
                referencia: result[0].referencia??null,
                id_clasificacion:result[0].id_clasificacion,
                desc_clasi:result[0].id_clasificacion?result[0].desc_clasi:null,
                //afectaref:null,
                icomost: '1',
                mostrar: rowsel.icomost == '1' ? '1' : '0',
                editar: 0,
                editar2:0,
                ind: rowsel.ind,
                accion: 2,
                seleccion: 0,
                asignaund:0,
                zidmodi:null
              };
              //reemplazar en tablas
              tabladet[indselfila] = agrega;
              let sumasinporc=this.Actparcialt1subp(tabladet[indselfila].id_tipo_insumo, tab)
              this.actinsporcmodsubp(tabladet[indselfila].id_tipo_insumo,sumasinporc,tabladet[indselfila].operador,tab);
            }
          }
        }
        else {//subpartidas
          this.toaster.error('No se puede reemplazar una subpartida, Eliminar la subpartida y Agregar una nueva.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
        }
      }
      else {
        this.toaster.error('Seleccione una fila para agregar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e)
    }
  }
  async abrirUndsubp(tab:any){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    const unidad = dataPartida.get('unidad') as UntypedFormControl
    const undconcatrendi = (formSubpartida.get('undconcatrendi') as UntypedFormControl);
    this.mostrar_carga_todo = true
    let tablaunid = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:1 })//cambiar a dinamico u otra consulta que retorne todo
    const valorInicial = this.medidas.find(data => data.id_unidad == unidad.value)
    const modalRef = await this.modalService.open(BuscaaddunidadmedComponent, { size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
    modalRef.componentInstance.Listaunidades = tablaunid;
    modalRef.componentInstance.operador = 1;
    modalRef.componentInstance.iduser = this.id_userproy;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      if(result.actarray){
        this.medidas=result.tablaact;
      }
      unidad.setValue(Number(result.datosel.id_unidad))
      let undsel=this.medidas.find(ele=>ele.id_unidad==unidad.value);
      undconcatrendi.setValue(undsel.unidad.toUpperCase());
    } else {
      if (valorInicial) {
        unidad.setValue(valorInicial.id_unidad)
      }
    }
  }
  cambUnidadsubp(tab:any){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    const unidad = dataPartida.get('unidad') as UntypedFormControl
    const undconcatrendi = (formSubpartida.get('undconcatrendi') as UntypedFormControl);
    if(unidad.value!=''){
      let undsel=this.medidas.find(ele=>ele.id_unidad==unidad.value);
      undconcatrendi.setValue(undsel.unidad.toUpperCase());
    }
    else{
      undconcatrendi.setValue('');
    }
  }
  async cambioTab(changeEvent) {
    const form = (this.formSubPartida.controls[this.active]) as UntypedFormGroup
    const tabla_editada = (form.get('tabla_editada') as UntypedFormControl).value
    const dataSubPartidaEditada = (form.get('data_partida') as UntypedFormGroup).dirty
    if (tabla_editada || dataSubPartidaEditada) {
      if (changeEvent.nextId !== this.active) {
        changeEvent.preventDefault();
        this.toaster.error('Guarde o descarte cambios realizados', 'Advertencia', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      }
    }
  }
  CalcRatioSubp(tab:any){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    let dataTabla = (formSubpartida.get('data_tabla') as UntypedFormControl).value
    const ratio = dataPartida.get('ratio') as UntypedFormControl
    let valret=0;
    for(let row of dataTabla){
      if(row.id_tipo_insumo==1){
        valret=Number(valret??0)+Number(row.cantidad);
      }
    }
    //let valpasa=this.formService.redondeo(valret,this.dec_cant)+' hh/'+this.datasourcePri[this.filaSel].unidad;
    ratio.setValue(this.formService.redondeo(valret,this.dec_cant));
  }
  CambEditjorsubp(tab){
    const formSubpartida = (this.formSubPartida.controls[tab]) as UntypedFormGroup
    const dataPartida = formSubpartida.get('data_partida') as UntypedFormGroup
    const editaj = formSubpartida.get('editajor') as UntypedFormControl
    const jorna = dataPartida.get('jornada') as UntypedFormControl
    editaj.setValue(!editaj.value);
    if(editaj.value){
      jorna.enable();
    }
    else{
      jorna.disable();
    }
  }
  async actSubpPrinc(data){
    let partida=data?JSON.parse(data.fila):null;
    if(data && data.ind && this.id_proyecto==partida.id_proyecto){
      let indice=data.ind;
      this.datasourcePriacu[this.tablaacusel[indice].ind]=partida;
      this.tablaacusel[indice].advceros=partida.advceros;
      let indpri=this.tablaacusel[indice].ind;
      if(this.tablaacusel[indice].descripcion!=partida.descripcion){
        this.tablaacusel[indice].descripcion=partida.descripcion;
        this.datasourcePriacu[indpri].descripcion=partida.descripcion;
        this.ActfilCambiosAcu(this.datasourcePriacu[indpri].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[indpri]);
      }
      if(this.tablaacusel[indice].unidad!=partida.unidad){
        this.tablaacusel[indice].id_unidad=partida.id_unidad;
        this.datasourcePriacu[indpri].id_unidad=partida.id_unidad;
        this.tablaacusel[indice].unidad=partida.unidad;
        this.datasourcePriacu[indpri].unidad=partida.unidad;
        this.ActfilCambiosAcu(this.datasourcePriacu[indpri].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[indpri]);
      }
      if(this.tablaacusel[indice].rendimiento!=partida.rendimiento){
        this.tablaacusel[indice].rendimiento=partida.rendimiento;
        this.datasourcePriacu[indpri].rendimiento=partida.rendimiento;
        this.tablaacusel[indice].und_rendi=partida.und_rendi;
        this.datasourcePriacu[indpri].und_rendi=partida.und_rendi;
        this.ActfilCambiosAcu(this.datasourcePriacu[indpri].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[indpri]);
      }
      if(this.tablaacusel[indice].precio!=partida.precio){
        let preccambia=this.formService.redondeo(Number(partida.precio),this.dec_precio)
        this.tablaacusel[indice].precio=preccambia;
        this.datasourcePriacu[indpri].precio=preccambia;
        let precact=Number(preccambia);
        var cantact = Number(this.tablaacusel[indice].cantidad)
        this.tablaacusel[indice].parcial =this.formService.redondeo((cantact * precact), this.dec_precio);
        this.datasourcePriacu[indpri].parcial=this.formService.redondeo((cantact * precact), this.dec_precio);
        this.ActfilCambiosAcu(this.datasourcePriacu[indpri].accion==1?this.insertaacu:this.modificaacu,this.datasourcePriacu[indpri]);
        this.Actparcialt1(this.tablaacusel[indice].id_tipo_insumo)
      }
      let existecer=0;
      for(let rowacu of this.tablaacusel){
        if(rowacu.unidad!='' && Number(rowacu.parcial)==0){
          existecer=1;
          break;
        }
      }
      this.datasourcePri[this.filaSel].advceros=existecer;//cambiar por la fila1 del arreglo
      //agregar cambios a los vinculados, no repetir llamando al mismo metodo, solo 1 vez
      if(this.datasourcePri[this.filaSel].vinculo!=null){
        let arrdetpri=[];
        let arrsubppri=[];
        for(let a=0;a<this.datasourcePri.length;a++){
          if(this.datasourcePri[a].vinculo==this.datasourcePri[this.filaSel].vinculo && this.datasourcePri[a].indice!=this.datasourcePri[this.filaSel].indice){
            //buscar los detalles y subpartidas del principal
            if(arrdetpri.length<=0){
              for(let rowacup of this.datasourcePriacu){
                if(rowacup.indice==this.datasourcePri[this.filaSel].indice){
                  arrdetpri.push(rowacup);
                  if(rowacup.esinsumo==0 && rowacup.num_det>0){//solo esta el primer nivel, hacer recursivo para mas niveles?
                    this.Addsubpdesubp(arrsubppri,rowacup.indice_subp)
                  }
                }
              }
            }
            //actualizar detalles
            await this.atualizavinculado(arrdetpri,arrsubppri,a);
          }
        }
      }
      this.actualizarTemp(1);
    }
  }
  findabrev(input){
    let encontrado= this.tabindir.find((item)=>item.abrev==input)
    if(encontrado){
      return encontrado.monto
    }else{
      return ''
    }
  }
  CambioLineas(){
    this.lineas2=!this.lineas2;
  }
  multipSubpar(auxsubp:any,indbusq:any,filabusq:any){
    let fulasubp=null;
    fulasubp=auxsubp.find(ele=>ele.indice_subp==indbusq)
    if(fulasubp){
      //recursivo para recuperar multiplicador e inidice
      filabusq.indpart=fulasubp.indice;
      filabusq.multi=(filabusq.multi??1)*fulasubp.cantidad;
      this.multipSubpar(auxsubp,fulasubp.indice,filabusq);
    }
  }
  acumuladetsubp(arrsubp:any,filadet:any,filarrtot:any){
    for(let c=0;c<arrsubp.length;c++){
      if(arrsubp[c].indpart==filadet.indice_subp){
        //let parcopera=Number(filadet.cantidad) * Number(arrsubp[c].parcial) * Number(arrsubp[c].multi);//operar con multiplicador
        let parc1=Number(arrsubp[c].parcial) * Number(arrsubp[c].multi);//operar con multiplicador
        let cantop=Number(filadet.parcial)/Number(filadet.precio);
        let parcopera=Number(cantop) * Number(parc1);//operar con multiplicador
        if(arrsubp[c].id_tipo_insumo=='1'){
          let valant=Number(filarrtot.mano??0);
          filarrtot.mano=this.formService.redondeo(valant+parcopera,Number(this.dec_parcial)+3);
        }
        else if(arrsubp[c].id_tipo_insumo=='2'){
          let valant=Number(filarrtot.mate??0);
          filarrtot.mate=this.formService.redondeo(valant+parcopera,Number(this.dec_parcial)+3);
        }
        else if(arrsubp[c].id_tipo_insumo=='3'){
          let valant=Number(filarrtot.equi??0);
          filarrtot.equi=this.formService.redondeo(valant+parcopera,Number(this.dec_parcial)+3);
        }
        else if(arrsubp[c].id_tipo_insumo=='4'){
          let valant=Number(filarrtot.subcont??0);
          filarrtot.subcont=this.formService.redondeo(valant+parcopera,Number(this.dec_parcial)+3);
        }
      }
    }
  }
  async imprdesagre2(){//generar 3er reporte
    if(this.existetemp){
      this.toaster.error('Guardar sus cambios antes de generar Reportes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return;
    }
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    const arrayHeader = ['ITEM', 'DESCRIPCION', 'UNIDAD', 'METRADO', 'PU','MANO DE OBRA','MATERIALES','EQUIPOS','SUBCONTRATOS','COSTO PARCIAL']
    const arrayKeys = ['item', 'descripcion', 'unidad', 'cantidad', 'precio','mano','mate','equi','subcont', 'parcial']
    const arrdec=[null,null,null,this.dec_metrado,this.dec_precio,Number(this.dec_parcial)+1,Number(this.dec_parcial)+1,Number(this.dec_parcial)+1,Number(this.dec_parcial)+1,this.dec_parcial];
    const arralig=['left','left','center','right','right','right','right','right','right','right'];
    let aux=JSON.parse(JSON.stringify(this.datasourcePri));
    let auxdet=JSON.parse(JSON.stringify(this.datasourcePriacu));
    let auxsubp=JSON.parse(JSON.stringify(this.datasourcePrisub));
    let arrpasa=[];
    let arrtit=[];
    arrtit.push({
      item:'',
      descripcion:'COMPLETO',
    });
    let sumatot=0;
    for(let row of aux){//asignar colores
      let tipol='';
      let colorl='';
      let fondol='';
      let valor2= row.item.toString().split('.');
      if(this.titulo1letra!=undefined)
      {
        if(row.unidad!='')
        {
          colorl=this.titulo1letra[11]
        }
        else
        {
          let ind=valor2.length>=12?11:valor2.length-1;
          colorl=this.titulo1letra[ind];
        }
      }
      if(this.titulo1color!=undefined)
      {
        if(row.unidad!='')
        {
          fondol = this.titulo1color[11];
        }
        else
        {
          let ind=valor2.length>=12?11:valor2.length-1;
          fondol=this.titulo1color[ind];
        }
      }
      if(this.titulo1!=undefined)
      {
        if(row.unidad!='')
        {
          tipol = this.titulo1[11];
        }
        else{
          let ind=valor2.length>=12?11:valor2.length-1;
          tipol=this.titulo1[ind];
        }
      }
      let esp=' ';
      let descp=esp.repeat(valor2.length-1)+row.descripcion;
      arrpasa.push({
        indice:row.indice,
        item:row.item,
        itemord:row.itemord,
        descripcion:descp,
        id_unidad:row.id_unidad,
        unidad:row.unidad,
        cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
        precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
        mano:null,
        mate:null,
        equi:null,
        subcont:null,
        subpart:null,
        parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
        tipofila:row.tipofila,
        tipoletra:tipol,
        color:colorl=='unset'?'':colorl,
        fondo:fondol=='none'?'':fondol
      });
      if(!(row.item.includes('.'))){
        arrtit.push({
          indice:row.indice,
          item:row.item,
          itemord:row.itemord,
          descripcion:descp,
          id_unidad:row.id_unidad,
          unidad:row.unidad,
          cantidad:row.id_unidad!=''?this.formService.redondeo(row.cantidad,this.dec_metrado):null,
          precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
          mano:null,
          mate:null,
          equi:null,
          subcont:null,
          subpart:null,
          parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
          tipofila:row.tipofila,
          tipoletra:tipol,
          color:colorl=='unset'?'':colorl,
          fondo:fondol=='none'?'':fondol
        });
      }
      if(row.unidad!=''){
        sumatot+=Number(this.formService.redondeo(row.parcial??0,this.dec_parcial))
      }
    }
    //operar subpartidas
    //generar un nuevo array con los datos acumulados de las subpartidas que son de detalles
    let filasubp;
    let indant=-1;
    let indpartant=-1;
    let multiant=1;
    for(let m=0;m<auxsubp.length;m++){//calcular por partidas y asignar cuando se encuentre en la siguiente iteracion
      if(indant==auxsubp[m].indice){
        auxsubp[m].indpart=indpartant;
        auxsubp[m].multi=multiant;
      }
      else{
        filasubp=auxsubp.find(ele=>ele.indice_subp==auxsubp[m].indice)
        if(filasubp){
          auxsubp[m].indpart=filasubp.indice;
          auxsubp[m].multi=(auxsubp[m].multi??1)*filasubp.cantidad;
          //recursivo para recuperar multiplicador e inidice
          this.multipSubpar(auxsubp,filasubp.indice,auxsubp[m]);
          indpartant=auxsubp[m].indpart;
          multiant=auxsubp[m].multi;
        }
        else{//directo, asignar indice de partida?
          auxsubp[m].indpart=auxsubp[m].indice;
          auxsubp[m].multi=1;
          indpartant=auxsubp[m].indice;
          multiant=1;
        }
      }
      filasubp=null;
    }
    //calcular agrupaciones
    for(let b=0;b<auxdet.length;b++){
      let parcopera=Number(auxdet[b].parcial);
      //buscar en presu, break, solo sumar
      for(let c=0;c<arrpasa.length;c++){
        if(arrpasa[c].indice==auxdet[b].indice){
          if(auxdet[b].id_tipo_insumo=='1'){
            let valant=Number(arrpasa[c].mano??0);
            arrpasa[c].mano=valant+parcopera;
          }
          else if(auxdet[b].id_tipo_insumo=='2'){
            let valant=Number(arrpasa[c].mate??0);
            arrpasa[c].mate=valant+parcopera;
          }
          else if(auxdet[b].id_tipo_insumo=='3'){
            let valant=Number(arrpasa[c].equi??0);
            arrpasa[c].equi=valant+parcopera;
          }
          else if(auxdet[b].id_tipo_insumo=='4'){
            let valant=Number(arrpasa[c].subcont??0);
            arrpasa[c].subcont=valant+parcopera;
          }
          else if(auxdet[b].id_tipo_insumo=='5'){//subpartidas, buscar los detalles en arrauxsubp
            this.acumuladetsubp(auxsubp,auxdet[b],arrpasa[c])
          }
          break;
        }
      }
    }
    //volver a recorrer para multiplicar por metrado
    for(let d=arrpasa.length-1;d>=0;d--){
      if(arrpasa[d].cantidad){
        //let cantop=arrpasa[d].cantidad;
        let cantop=Number(arrpasa[d].parcial)/Number(arrpasa[d].precio);
        arrpasa[d].mano=arrpasa[d].mano?this.formService.redondeo(cantop*Number(arrpasa[d].mano),Number(this.dec_parcial)+1):arrpasa[d].mano;
        arrpasa[d].mate=arrpasa[d].mate?this.formService.redondeo(cantop*Number(arrpasa[d].mate),Number(this.dec_parcial)+1):arrpasa[d].mate;
        arrpasa[d].equi=arrpasa[d].equi?this.formService.redondeo(cantop*Number(arrpasa[d].equi),Number(this.dec_parcial)+1):arrpasa[d].equi;
        arrpasa[d].subcont=arrpasa[d].subcont?this.formService.redondeo(cantop*Number(arrpasa[d].subcont),Number(this.dec_parcial)+1):arrpasa[d].subcont;
      }
    }
    //totales agrupaciones (sub)titulos
    let indtit=[];
    let tottit1=[];
    let tottit2=[];
    let tottit3=[];
    let tottit4=[];
    let itemtit=[];
    for (let c = 0; c < arrpasa.length; c++)
    {
      if (arrpasa[c].unidad == "")//titulos
      {
        for (let t = itemtit.length - 1; t >= 0; t--)
        {
          let itemtem = arrpasa[c].item;
          let itemfila = itemtem.Length <= itemtit[t].length + 1 ? "-" : itemtem.substring(0, itemtit[t].length + 1);
          if (itemtit[t] + "." != itemfila)//si no es predecesor, se actualizan y eliminan los titulos
          {
            arrpasa[indtit[t]].mano = tottit1[t]!=null?this.formService.redondeo(tottit1[t],Number(this.dec_parcial)+1):tottit1[t];
            arrpasa[indtit[t]].mate = tottit2[t]!=null?this.formService.redondeo(tottit2[t],Number(this.dec_parcial)+1):tottit2[t];
            arrpasa[indtit[t]].equi = tottit3[t]!=null?this.formService.redondeo(tottit3[t],Number(this.dec_parcial)+1):tottit3[t];
            arrpasa[indtit[t]].subcont = tottit4[t]!=null?this.formService.redondeo(tottit4[t],Number(this.dec_parcial)+1):tottit4[t];
            indtit.splice(t,1);
            tottit1.splice(t,1);
            tottit2.splice(t,1);
            tottit3.splice(t,1);
            tottit4.splice(t,1);
            itemtit.splice(t,1);
          }
        }
        indtit.push(c);
        tottit1.push(null);
        tottit2.push(null);
        tottit3.push(null);
        tottit4.push(null);
        itemtit.push(arrpasa[c].item);
      }
      else//partidas
      {
        for(let t = itemtit.length-1; t >= 0;t--)
        {
          let itemtem = arrpasa[c].item;
          let itemfila = itemtem.Length <= itemtit[t].length + 1 ? "-" : itemtem.substring(0, itemtit[t].length + 1);
          if (itemtit[t]+"."==itemfila)
          {
            if(arrpasa[c].mano){
              tottit1[t] = Number(tottit1[t]??0)+Number(arrpasa[c].mano);
            }
            if(arrpasa[c].mate){
              tottit2[t] = Number(tottit2[t]??0)+Number(arrpasa[c].mate);
            }
            if(arrpasa[c].equi){
              tottit3[t] = Number(tottit3[t]??0)+Number(arrpasa[c].equi);
            }
            if(arrpasa[c].subcont){
              tottit4[t] = Number(tottit4[t]??0)+Number(arrpasa[c].subcont);
            }
          }
          else//si no es predecesor, se actualizan y eliminan los titulos
          {
            arrpasa[indtit[t]].mano = tottit1[t]!=null?this.formService.redondeo(tottit1[t],Number(this.dec_parcial)+1):tottit1[t];
            arrpasa[indtit[t]].mate = tottit2[t]!=null?this.formService.redondeo(tottit2[t],Number(this.dec_parcial)+1):tottit2[t];
            arrpasa[indtit[t]].equi = tottit3[t]!=null?this.formService.redondeo(tottit3[t],Number(this.dec_parcial)+1):tottit3[t];
            arrpasa[indtit[t]].subcont = tottit4[t]!=null?this.formService.redondeo(tottit4[t],Number(this.dec_parcial)+1):tottit4[t];
            indtit.splice(t,1);
            tottit1.splice(t,1);
            tottit2.splice(t,1);
            tottit3.splice(t,1);
            tottit4.splice(t,1);
            itemtit.splice(t,1);
          }
        }
      }
    }
    if(itemtit.length>0){//actualizar totales
      for (let t = itemtit.length - 1; t >= 0; t--)
      {
        arrpasa[indtit[t]].mano = tottit1[t]!=null?this.formService.redondeo(tottit1[t],Number(this.dec_parcial)+1):tottit1[t];
        arrpasa[indtit[t]].mate = tottit2[t]!=null?this.formService.redondeo(tottit2[t],Number(this.dec_parcial)+1):tottit2[t];
        arrpasa[indtit[t]].equi = tottit3[t]!=null?this.formService.redondeo(tottit3[t],Number(this.dec_parcial)+1):tottit3[t];
        arrpasa[indtit[t]].subcont = tottit4[t]!=null?this.formService.redondeo(tottit4[t],Number(this.dec_parcial)+1):tottit4[t];
        indtit.splice(t,1);
        tottit1.splice(t,1);
        tottit2.splice(t,1);
        tottit3.splice(t,1);
        tottit4.splice(t,1);
        itemtit.splice(t,1);
      }
    }
    let tablaTotales = []
    const obj = [
      { text: 'TOTAL', colSpan: 9, tipoletra:'3',color:'',fondo:'',alinea:'center' },
      { text: this.formService.redondeo(sumatot,this.dec_parcial), colSpan: 1, tipoletra:'3',color:'',fondo:'',alinea:'right' },
    ]
    tablaTotales.push(obj)
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec:arrdec,
      col_alig:arralig,
      tabla: arrpasa,
      orientacion:'landscape',
      tabla2: tablaTotales,
      concat_tabla2:true,
      tipo_reporte:0,
      moneda:this.simbolo,//condicionar
      titulo:'COSTO DEL PROYECTO DESAGREGADO',
      titulos:arrtit,
    }
    const modalRef = this.modalService.open(ReportesComponent, { size: 'lg modalgrande', backdrop: 'static', windowClass: 'pcoded', keyboard: false, });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
}
