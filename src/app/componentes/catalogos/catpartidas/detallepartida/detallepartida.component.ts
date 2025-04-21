import { ModalSubpartidaComponent } from './../modal-subpartida/modal-subpartida.component';
import { Component, OnInit, EventEmitter, Input, Output, HostListener, ViewEncapsulation,ChangeDetectorRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';;
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { CatalogosService } from './../../../../servicios/catalogos.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BuscarinsumoComponent } from '../buscarinsumo/buscarinsumo.component';
import { BuscaaddunidadmedComponent } from '../../unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { TinymceComponent } from 'angular2-tinymce';
import { DomSanitizer } from '@angular/platform-browser';
import { BusqpartcatComponent } from '../busqpartcat/busqpartcat.component';
import { AddImgUrlComponent } from 'src/app/shared/add-img-url/add-img-url.component';

export interface archivoimg {
  nombre: any;
  base: any;
}
export interface rowinsumo {
  id_partida:any;
  id_tipo_insumo: any;
  num_det:any;
  codigo:any
  descripcion:any;
  id_unidad:any;
  unidad:any;
  operador:any;
  tipo_insumo:any;
  cuadrilla:any;
  cantidad:any;
  precio:any;
  parcial:any;
  id_indice:any;
  id_insumo: any;
  id_clasificacion:any;
  id_subpartida:any;
  esinsumo:any;
  afcuadrilla:any;
  rendimiento:any;
  und_rendi:any;
  jornada:any;
  advceros:any;
  icomost:any;
  mostrar:any;
  editar:any;
  editar2:any;
  ind:any;
  afectaref:any;
  seleccion:any;
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
  selector: 'app-detallepartida',
  templateUrl: './detallepartida.component.html',
  styleUrls: ['./detallepartida.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class DetallepartidaComponent implements OnInit {
  @Input('height') height: number = 100;
  @Input() datos = null
  @Input() medidas: unidadmed[] = [];
  @Input() tipoProy = [];
  @Input() rowSistema = false;
  @Input() fondo:any = '';
  @Input() color:any = '';
  @Input() letra:any = '';
  @Input() oculto:any = false;
  //variables opciones vista codigo
  mcodigo=true;
  codsoloiu=false;
  colselacu=false;
  idgruselacu=null;
  editarpreins=false;
  preventscroll=false;
  buscando=false;
  @Output() cargar = new EventEmitter<any>();
  active = false
  partida = null
  mostrar_carga: boolean = false
  mostrar_carga_todo: boolean = false
  insumos = [];
  dec_cant=4;
  mask_cant='0.4';
  dec_precio=2;
  mask_precio='0.2';
  id_user: any;
  undconcatrendi = '';
  paddingscroll = 17;
  paddingscroll2 = 17;
  ultidpart=1;
  Arrsubpartidas=[];
  Arrsubactual=[];
  datasourcePri=[];
  tabladetactual=[];
  fila_selacu: any;
  //tabla con subpatidasmodificadas(1: agregar referencia, 2: eliminar referencia)
  cambiossubpartidas=[];
  actuapri=false;
  minimbut=false;
  @ViewChild('tinymce', { static: false }) public tinymce: TinymceComponent;
  @ViewChild('tinymce2', { static: false }) public tinymce2: TinymceComponent;
  public especificacionTexto: string = '';
  public especificacionTexto2: string = '';
  public esptext: string = '';
  public esptext2: string = '';
  bloqesp=true;
  bloqfic=true;
  activetab = 1
  tabsel=1;
  buscaficha=false;
  buscaespec=false;
  procesando=false;

  formDataPartida = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    unidad: new UntypedFormControl('', [Validators.required]),
    precio: new UntypedFormControl('', [Validators.required, Validators.min(0)]),
    rendimiento: new UntypedFormControl('', []),
    undrendimiento: new UntypedFormControl('', []),
    jornada: new UntypedFormControl('', []),
    id_usuario: new UntypedFormControl('', []),
    tipo_proy: new UntypedFormControl('', [Validators.required]),
  })
  get descripcion(): UntypedFormControl { return this.formDataPartida.get('descripcion') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formDataPartida.get('unidad') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.formDataPartida.get('precio') as UntypedFormControl }
  get rendimiento(): UntypedFormControl { return this.formDataPartida.get('rendimiento') as UntypedFormControl }
  get undrendimiento(): UntypedFormControl { return this.formDataPartida.get('undrendimiento') as UntypedFormControl }
  get jornada(): UntypedFormControl { return this.formDataPartida.get('jornada') as UntypedFormControl }
  get id_usuario(): UntypedFormControl { return this.formDataPartida.get('id_usuario') as UntypedFormControl }
  get tipo_proy(): UntypedFormControl { return this.formDataPartida.get('tipo_proy') as UntypedFormControl }

  @Input() set partidaSeleccionado(value: any) {
    this.cambiossubpartidas=[];
    this.partida = value
    this.activetab = 1
    this.formDataPartida.disable()
    if (this.partida) {
      this.recuperarFormCostoUnitario(this.partida)
      this.especificacionTexto="";//this.partida.espec_tec;
      this.especificacionTexto2="";//this.partida.ficha_tec;
    } else {
      this.formDataPartida.reset()
    }
    this.especificacionTexto='';//this.partida.espec_tec;
    this.especificacionTexto2='';//this.partida.ficha_tec;
    this.esptext='';
    this.esptext2='';
    this.bloqesp=true;
    this.bloqfic=true;
  }
  @Input() set edicionacu(value: any) {
    this.active=value;
  }
  @Input() set tabladetalle(value: any) {
    this.datasourcePri = value.length>0?value[0]:[];
    this.tabladetactual = JSON.parse(JSON.stringify(value.length>0?value[0]:[]));
    this.Arrsubpartidas=value.length>0?value[1]:[];
    this.Arrsubactual = JSON.parse(JSON.stringify(value.length>0?value[1]:[]));
    //buscar indice en ambas tablas
    let mayor2=0;
    for(let row of this.Arrsubpartidas){
      if(mayor2<Number(row.id_partida)){
        mayor2=Number(row.id_partida);
      }
    }
    this.ultidpart=mayor2+1;
    this.fila_selacu=-1;
    this.editarpreins=false;
    if(this.colselacu){
      this.HabSelAcu();
    }
  }
  @Input() set cargatabla(value: any) {
    this.buscando=value;
  }
  @Input() set expanded(value: any) {
    this.oculto=value;
  }
  constructor(
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService,
    private configuracionService: ConfiguracionService,
    public formsService: FormsService,
    private catalogosService: CatalogosService,
    private adminservice: AdministradorService,
    private modalService: NgbModal,
    private changeDetector: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) { }

  async ngOnInit() {
    this.formDataPartida.disable()
    this.id_user = this.encriptadorService.recuperarlocalstory('idusuario');
    let decimales = this.encriptadorService.recuperarlocalstory('decimales');
    if(decimales?.toString().includes('|')){
      let arrdec=decimales.split('|');
      this.dec_cant=arrdec[3];
      this.mask_cant='0.'+arrdec[3];
      this.dec_precio=arrdec[1];
      this.mask_precio='0.'+arrdec[1];
    }
    let limmin=this.oculto?991:1280;
    if ((document.body.clientWidth <= limmin)) {
      this.minimbut=true;
    }
    else{
      this.minimbut=false;
    }
    var resto=398;
    if(document.body.clientWidth<576)
      resto=resto+118;
    this.height = window.innerHeight - resto;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto=398;
    if(document.body.clientWidth<576)
      resto=resto+118;
    this.height = window.innerHeight - resto;
    let limmin=this.oculto?991:1280;
    if ((document.body.clientWidth <= limmin)) {
      this.minimbut=true;
    }
    else{
      this.minimbut=false;
    }
    return
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    var element = document.getElementById('tableBody');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll != sizeef) {
        this.paddingscroll = sizeef;
      }
      let sizeef2 = element.offsetHeight - element.clientHeight;
      if (this.paddingscroll2 != sizeef2) {
        this.paddingscroll2 = sizeef2;
      }
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async edicionForm() {
    if(this.partida){
      if (this.formDataPartida.disabled) {
        this.formDataPartida.enable()
        this.undrendimiento.disable();
      } else {
        this.formDataPartida.disable()
        if(this.colselacu==true){
          this.HabSelAcu();
        }
      }
    }
    else{
      this.toaster.error("Seleccione una fila para Editar.", 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  SyncScroll(indica) {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face2 = document.getElementById("tableBody");
    var face3 = document.getElementById("tableFoot");
    face3.scrollLeft = face2.scrollLeft;
  }
  SyncScroll2(indica) {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face2 = document.getElementById("tableBody");
    var face3 = document.getElementById("tableFoot");
    face2.scrollLeft = face3.scrollLeft;
  }
  recuperarFormCostoUnitario(partida) {
    let tipoP=this.tipoProy.find(ele=> ele.id_clasificacion==partida.tipo_proy);
    const inputidusuariols = this.encriptadorService.recuperarlocalstory('idusuario');
    this.undconcatrendi=partida.unidad
    this.formDataPartida.reset({
      descripcion: partida.descripcion,
      unidad: partida.id_unidad ? Number(partida.id_unidad) : '',
      precio: partida.precio,
      rendimiento: partida.rendimiento!=null ? partida.rendimiento : '',
      undrendimiento: partida.und_rendi ? partida.und_rendi : '',
      jornada: partida.jornada,
      id_usuario: inputidusuariols,
      tipo_proy: tipoP,
    })
    this.datasourcePri=JSON.parse(JSON.stringify(this.tabladetactual));
    this.Arrsubpartidas = JSON.parse(JSON.stringify(this.Arrsubactual));
  }
  //tabla analisis de costos unitarios
  toggleOn(condicion: any,indice2:any) {
    this.datasourcePri[indice2].icomost = 1;
    for (let i=indice2+1;i<this.datasourcePri.length;i++) {
      if(this.datasourcePri[i].id_tipo_insumo==condicion)
      {
        if(this.datasourcePri[i].unidad!='')
        {
          this.datasourcePri[i].mostrar=1;
        }
      }
      else{ break; }
    }
  }
  toggleOff(condicion: any,indice2:any) {
    this.datasourcePri[indice2].icomost = 0;
    for (let i=indice2+1;i<this.datasourcePri.length;i++) {
      if(this.datasourcePri[i].id_tipo_insumo==condicion)
      {
        if(this.datasourcePri[i].unidad!='')
        {
          this.datasourcePri[i].mostrar=0;
        }
      }
      else{ break; }
    }
  }
  cambindiceselacu(ind: any) {
    if (ind == this.fila_selacu)
      this.fila_selacu = -1;
    else
      this.fila_selacu = ind;
  }
  /* async listarInsumos(tipo_insumo: any) {
    try {
      this.insumos = await this.catalogosService.BuscarDataInsumos({id_usuario: this.id_user,id_tipo_insumo: tipo_insumo});
    } catch (e) {
      console.log(e);
      SwalService.error()
    }
  } */
  async verificarDecimales() {
    if(this.rendimiento.dirty){
      let valrendi=Number(this.rendimiento.value.toString().replace(/\,/g,''));
      const rendiValido = await this.formsService.redondeo(valrendi, 2);
      this.rendimiento.setValue(rendiValido)
      if(valrendi==0){
        this.undrendimiento.setValue('GLOBAL');
      }
      else{
        this.undrendimiento.setValue('DIA');
      }
      for(let row of this.datasourcePri){
        if(row.num_det>0 && row.afcuadrilla==1 && row.operador!='%'){
          let cuadri=Number(row.cuadrilla);
          let aprecio=Number(row.precio);
          var canti=0;
          if(valrendi==0){
            row.cuadrilla=this.formsService.redondeo(0,8);
            canti=Number(row.cantidad);
          }else{
            if(cuadri==0 && aprecio!=0){
              canti=Number(row.cantidad);
              cuadri=(canti*valrendi)/Number(this.jornada.value.toString().replace(/\,/g,''));
              row.cuadrilla=this.formsService.redondeo(cuadri,8);
            }
            else{
              var canti=(cuadri*Number(this.jornada.value.toString().replace(/\,/g,'')))/valrendi;
            }
          }
          //var canti=(cuadri*Number(this.jornada.value.toString().replace(/\,/g,'')))/valrendi;
          row.cantidad=this.formsService.redondeo(canti,this.dec_cant);
          row.parcial =this.formsService.redondeo((canti * aprecio), this.dec_precio);
        }
      }
      this.actualizarParcGrupos();
    }
  }
  async verificarDecimalesJor() {
    if(this.jornada.dirty){
      let valjor=Number(this.jornada.value.toString().replace(/\,/g,''));
      const jornValido = await this.formsService.redondeo(valjor, 0)
      this.jornada.setValue(jornValido)
      var arendi=Number(this.rendimiento.value.toString().replace(/\,/g,''));
      for(let row of this.datasourcePri){
        if(row.num_det>0 && row.afcuadrilla==1 && row.operador!='%'){
          let cuadri=Number(row.cuadrilla);
          let aprecio=Number(row.precio);
          var canti=arendi==0?Number(row.cantidad):(cuadri*valjor)/arendi;
          row.cantidad=this.formsService.redondeo(canti,this.dec_cant);
          row.parcial =this.formsService.redondeo((canti * aprecio), this.dec_precio);
        }
      }
      this.actualizarParcGrupos();
    }
  }
  actualizarParcGrupos(){
    let indgru=-1;
    let actgru;
    let parcialgru=0;
    let parcgrusinporc=0;
    let sumtot=0;
    for(let i=0;i<this.datasourcePri.length;i++){
      if(this.datasourcePri[i].num_det==0){
        if(indgru!=-1){
          sumtot+=parcialgru;
          this.datasourcePri[indgru].parcial=this.formsService.redondeo(parcialgru,this.dec_precio);
          this.actinsporc(this.datasourcePri[indgru].id_tipo_insumo,parcgrusinporc,this.datasourcePri[indgru].operador);
        }
        indgru=i;
        actgru=this.datasourcePri[i];
        parcialgru=0;
        parcgrusinporc=0;
      }
      else{
        if(this.datasourcePri[i].id_tipo_insumo==actgru.id_tipo_insumo){
          parcialgru+=Number(this.datasourcePri[i].parcial)
          if(this.datasourcePri[i].unidad != '' && this.datasourcePri[i].operador==null){
            parcgrusinporc+=Number(this.datasourcePri[i].parcial)
          }
        }
      }
    }
    if(indgru!=-1){
      sumtot+=parcialgru;
      this.datasourcePri[indgru].parcial=this.formsService.redondeo(parcialgru,this.dec_precio);
    }
    this.precio.setValue(this.formsService.redondeo(sumtot,this.dec_precio));
  }
  presentertRendi(event:any){
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  editarceldat1(ind: any) {
    if(this.formDataPartida.enabled && this.datasourcePri[ind].num_det!=0){
      this.datasourcePri[ind].editar = 1;
    }
  }
  editarceldat2(ind: any) {
    if(this.formDataPartida.enabled && this.datasourcePri[ind].num_det!=0){
      this.datasourcePri[ind].editar3 = 1;
    }
  }
  editarceldat3(ind: any) {
    if(this.formDataPartida.enabled && this.datasourcePri[ind].num_det!=0 && this.datasourcePri[ind].operador==null && this.datasourcePri[ind].esinsumo==1){
      this.datasourcePri[ind].editar2 = 1;
    }
  }
  actinsporc(id_tipo_ins:any,parcialsinporc:any,operador:any){
    if(operador==null){
      for(let row of this.datasourcePri){
        if(row.operador=="%" && row.tipo_insumo==id_tipo_ins){
          let cant=Number(row.cantidad);
          let newparc=(parcialsinporc*cant)/100;
          row.precio=this.formsService.redondeo(parcialsinporc,this.dec_precio);
          row.parcial=this.formsService.redondeo(newparc,this.dec_precio);
          this.Actparcialt1(row.id_tipo_insumo)
        }
      }
    }
  }
  caneditarceldat1(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.datasourcePri[ind2].cantidad)
    var aprecio = Number(this.datasourcePri[ind2].precio);
    this.datasourcePri[ind2].editar = 0;
    if (valor != actual) {
      let resparc=this.datasourcePri[ind2].operador=='%'?(valor*aprecio)/100:valor*aprecio;
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      //calcular cuadrilla, si rendimiento es mayor a 0, sino no hace nada
      if(this.datasourcePri[ind2].afcuadrilla==1 && Number(this.rendimiento.value)!=0){
        let rescuad=(valor*Number(this.rendimiento.value))/Number(this.jornada.value);
        if(this.errormaxval(rescuad.toString(),'Cuadrilla',10,'El resultado de ')){ return }
        this.datasourcePri[ind2].cuadrilla =this.formsService.redondeo(rescuad,8);
      }
      this.datasourcePri[ind2].cantidad=this.formsService.redondeo(Number(valor), this.dec_cant);
      this.datasourcePri[ind2].parcial=this.formsService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1(this.datasourcePri[ind2].id_tipo_insumo)
      this.actinsporc(this.datasourcePri[ind2].id_tipo_insumo,sumasinporc,this.datasourcePri[ind2].operador);
    }
  }
  caneditarceldat2(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.datasourcePri[ind2].cuadrilla);
    var aprecio = Number(this.datasourcePri[ind2].precio);
    var rendi=Number(this.rendimiento.value);
    this.datasourcePri[ind2].editar3 = 0;
    if (valor != actual) {
      var canti=rendi==0?Number(this.datasourcePri[ind2].cantidad):(valor*Number(this.jornada.value))/rendi;
      let resparc=this.datasourcePri[ind2].operador=='%'?(Number(this.formsService.redondeo(canti,this.dec_cant))*aprecio)/100:Number(this.formsService.redondeo(canti,this.dec_cant))*aprecio;
      if(this.errormaxval(canti.toString(),'Cantidad',10,'El resultado de ')){ return }
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      this.datasourcePri[ind2].cuadrilla = this.formsService.redondeo(Number(valor), 8);
      this.datasourcePri[ind2].cantidad=this.formsService.redondeo(canti,this.dec_cant);
      this.datasourcePri[ind2].parcial =this.formsService.redondeo(resparc, this.dec_precio);// valor*aprecio==0?'-':
      let sumasinporc=this.Actparcialt1(this.datasourcePri[ind2].id_tipo_insumo)
      this.actinsporc(this.datasourcePri[ind2].id_tipo_insumo,sumasinporc,this.datasourcePri[ind2].operador);
    }
  }
  async caneditarceldat3(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.datasourcePri[ind2].precio)
    var acantidad = Number(this.datasourcePri[ind2].cantidad);
    this.datasourcePri[ind2].editar2 = 0;
    if (valor != actual) {
      let resparc=this.datasourcePri[ind2].operador=='%'?(valor*acantidad)/100:valor*acantidad;
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      this.datasourcePri[ind2].precio=this.formsService.redondeo(Number(valor), this.dec_precio);
      this.datasourcePri[ind2].parcial=this.formsService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1(this.datasourcePri[ind2].id_tipo_insumo)
      this.actinsporc(this.datasourcePri[ind2].id_tipo_insumo,sumasinporc,this.datasourcePri[ind2].operador);
      if(this.editarpreins && this.datasourcePri[ind2].id_insumo){//editar precio de insumo
        let resp=await this.configuracionService.ModificarPrecioInsumo({ id_insumo: this.datasourcePri[ind2].id_insumo,precio:this.datasourcePri[ind2].precio });
        if(resp[0]?.id==1){
          this.toaster.success(resp[0].mensaje, 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        else if(resp[0]?.id==0){
          this.toaster.error(resp[0].mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
    }
  }
  presentert1(event: any, ind: any) {
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat1(this.datasourcePri[ind].cantidad,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.datasourcePri.length) {
        for (let i = ind + 1; i < this.datasourcePri.length; i++) {
          if (this.datasourcePri[i].unidad != '') {
            this.datasourcePri[i].editar = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (this.datasourcePri[i].unidad != '') {
            this.datasourcePri[i].editar = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
  }
  presentert2(event: any, ind: any) {
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat2(this.datasourcePri[ind].cuadrilla,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.datasourcePri.length) {
        for (let i = ind + 1; i < this.datasourcePri.length; i++) {
          if (this.datasourcePri[i].unidad != '') {
            event.target.blur();
            if(this.datasourcePri[i].afcuadrilla==0 || this.datasourcePri[i].operador=='%'){
              this.datasourcePri[i].editar = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            else{
              this.datasourcePri[i].editar3 = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (this.datasourcePri[i].unidad != '') {
            event.target.blur();
            if(this.datasourcePri[i].afcuadrilla==0 || this.datasourcePri[i].operador=='%'){
              this.datasourcePri[i].editar = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            else{
              this.datasourcePri[i].editar3 = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            break;
          }
        }
      }
    }
  }
  presentert3(event: any, ind: any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat3(this.datasourcePri[ind].precio,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.datasourcePri.length) {
        for (let i = ind + 1; i < this.datasourcePri.length; i++) {
          if (this.datasourcePri[i].unidad != '' && this.datasourcePri[i].operador==null && this.datasourcePri[i].esinsumo==1) {
            this.datasourcePri[i].editar2 = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (this.datasourcePri[i].unidad != '' && this.datasourcePri[i].operador==null && this.datasourcePri[i].esinsumo==1) {
            this.datasourcePri[i].editar2 = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
  }
  Actparcialt1(idtipo: any) {
    let indgrupo = -1;
    let suma = 0;
    let sumasinporc=0;
    let sumatot=0;
    for (let i = 0; i < this.datasourcePri.length; i++) {
      if (this.datasourcePri[i].id_tipo_insumo == idtipo && this.datasourcePri[i].unidad == '') {
        indgrupo = i;
      }
      if (this.datasourcePri[i].id_tipo_insumo == idtipo && this.datasourcePri[i].unidad != '') {
        suma += Number(this.datasourcePri[i].parcial)
        sumatot += Number(this.datasourcePri[i].parcial);
        if(this.datasourcePri[i].operador==null){
          sumasinporc+=Number(this.datasourcePri[i].parcial)
        }
      }
      if (this.datasourcePri[i].id_tipo_insumo != idtipo && this.datasourcePri[i].unidad != '') {
        sumatot += Number(this.datasourcePri[i].parcial);
      }
    }
    if (indgrupo >= 0) {
      this.datasourcePri[indgrupo].parcial = this.formsService.redondeo(suma, this.dec_precio);
      //total tabla
      let nprec=this.formsService.redondeo(sumatot,this.dec_precio)
      this.precio.setValue(nprec);
      return sumasinporc;
    }
  }
  errormaxval(valor,tetval,nenteros,txtini='Un valor de '){
    if(valor.includes('.')){
      let numar=valor.split('.');
      if(numar[0].length>nenteros){
        this.toaster.error(txtini+tetval+' supera el maximo limite de '+nenteros+' digitos enteros.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 8000 })
        this.mostrar_carga_todo=false;
        return true;
      }
    }
    else{
      if(valor.length>nenteros){
        this.toaster.error(txtini+tetval+' supera el maximo limite de '+nenteros+' digitos enteros.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 8000 })
        this.mostrar_carga_todo=false;
        return true;
      }
    }
    return false;
  }
  async actualizar() {
    try {
      if (this.formDataPartida.invalid) {
        this.formDataPartida.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        //verificar los montos totales
        for(let row of this.datasourcePri){
          if(row.unidad!=''){
            let cuadr=row.cuadrilla?row.cuadrilla.toString():'';
            if(this.errormaxval(cuadr,'Cuadrilla',10)){return}
            let cantr=row.cantidad.toString();
            if(this.errormaxval(cantr,'Cantidad',10)){return}
            let precior=row.precio.toString();
            if(this.errormaxval(precior,'Precio',10)){return}
            let parcr=row.parcial.toString();
            if(this.errormaxval(parcr,'Parcial',10)){return}
          }
        }
        this.mostrar_carga_todo = true
        const tabla1 = JSON.stringify(this.datasourcePri);
        const tabla2 = JSON.stringify(this.Arrsubpartidas);
        let existeceros=0;
        for(let i=0;i<this.datasourcePri.length;i++){
          if(this.datasourcePri[i].unidad!='' && Number(this.datasourcePri[i].cantidad)==0){
            existeceros=1;
            break;
          }
        }
        const body = JSON.stringify({
          'id_partida': this.partida.id_partida,
          'descripcion': this.descripcion.value.toUpperCase(),
          'unidad': this.unidad.value,
          'precio': this.precio.value,
          'rendimiento': this.rendimiento.value,
          'und_rendi': this.undrendimiento.value,
          'jornada': this.jornada.value,
          'id_usuario': this.id_usuario.value,
          'tipo_proy': this.tipo_proy.value?.id_clasificacion,
          'fuente': this.partida.fuente,
          'referencia':this.partida.referencia,
          'advceros':existeceros,
          'datos1': tabla1,
          'datos2':tabla2
        });
        let result = await this.catalogosService.ModificarDataPartidas(body)
        this.mostrar_carga_todo = false
        if (result.id == '1') {
          this.toaster.success('Se actualizó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          this.Arrsubactual=this.Arrsubpartidas;
          let mayor2=0;
          for(let row of this.Arrsubpartidas){
            if(mayor2<Number(row.id_partida)){
              mayor2=Number(row.id_partida);
            }
          }
          this.ultidpart=mayor2+1;
          await this.edicionForm()
          this.cargar.emit(this.partida.id_partida)
        } else {
          SwalService.error('Error', result.mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  async cancelarEdicion() {
    await this.edicionForm()
    /* this.rendimiento.markAsDirty(); */
    await this.recuperarFormCostoUnitario(this.partida)
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
  async ReemplazarIns(){
    try{
      if(this.fila_selacu>-1){
        let rowsel=this.datasourcePri[this.fila_selacu];
        if(rowsel.num_det==0){//agrupacion
          this.toaster.error('La fila seleccionada no se puede reemplazar','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
          return;
        }
        if(rowsel.esinsumo==1){//insumos
          this.mostrar_carga_todo = true;
          /* let insumos=await this.catalogosService.BuscarDataInsumos({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo});
          let umedidas = await this.adminservice.listarUnidadMedxtipo({ id_usuario:this.id_user,tipo_insumo:rowsel.id_tipo_insumo })
          let indicesunif = await this.configuracionService.listarIndiceUnificados({ activo: 1 }) */
          let arrexisten=[]
          let filagru;
          for(let row of this.datasourcePri){
            if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det!=0){
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
          this.mostrar_carga_todo = false;
          /* modalRef.componentInstance.insumos = insumos;
          modalRef.componentInstance.medidas = umedidas;
          modalRef.componentInstance.indices = indicesunif; */
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.reemplaza = true;
          modalRef.componentInstance.inpfuente=this.partida.fuente;
          modalRef.componentInstance.rowfiltro=rowsel;
          const result = await modalRef.result;
          if (result) {
            if (result.length > 0) {
              //calcular parcial
              let preciogru=0;
              if(result[0].tipo_insumo){
                rowsel.cuadrilla=0;
                for(let rowpri of this.datasourcePri){
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
              let nuevparc=result[0].tipo_insumo?(Number(rowsel.cantidad)*Number(preciogru))/100:Number(rowsel.cantidad)*Number(preciogru);//redondear              
              let agrega:rowinsumo = {
                id_partida: rowsel.id_partida,
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
                parcial: this.formsService.redondeo(nuevparc,this.dec_precio),
                id_tipo_insumo: result[0].id_tipo_insumo,
                id_insumo: result[0].id_insumo,
                id_indice: result[0].id_indice,
                id_clasificacion:result[0].id_clasificacion,
                id_subpartida: null,
                esinsumo:rowsel.esinsumo,
                afcuadrilla:rowsel.afcuadrilla,
                rendimiento:null,
                und_rendi:null,
                jornada:null,
                advceros:null,
                icomost: '1',
                mostrar: rowsel.icomost == '1' ? '1' : '0',
                editar: 0,
                editar2:0,
                ind:rowsel.ind,
                seleccion:0,
                afectaref:null
              };
              //reemplazar en tablas
              this.datasourcePri[this.fila_selacu]=agrega;
              let sumasinporc=this.Actparcialt1(this.datasourcePri[this.fila_selacu].id_tipo_insumo)
              this.actinsporc(this.datasourcePri[this.fila_selacu].id_tipo_insumo,sumasinporc,this.datasourcePri[this.fila_selacu].operador);
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
      if(this.colselacu){//seleccion multiple
        let arrsel=[];
        let arrindic=[];
        for(let i=0;i<this.datasourcePri.length;i++){
          if(this.datasourcePri[i].seleccion==1){
            arrsel.push(this.datasourcePri[i]);
            arrindic.push(i);
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
              tipoinsactporc=!(this.datasourcePri[arrindic[j]].operador)?this.datasourcePri[arrindic[j]].id_tipo_insumo:tipoinsactporc;
            }
            //si es subpartida, eliminar recursivamente de arrsubpartidas
            if(this.datasourcePri[arrindic[j]].esinsumo==0){
              let arrideli=[];
              arrideli.push(this.datasourcePri[arrindic[j]].id_subpartida)
              for(let m=0;m<this.Arrsubpartidas.length;m++){//eliminar datos anteriores
                if(this.Arrsubpartidas[m].id_partida==this.datasourcePri[arrindic[j]].id_subpartida){
                  if(this.Arrsubpartidas[m].id_subpartida){
                    this.AddideliDetSubp(arrideli,this.Arrsubpartidas[m].id_subpartida)
                    arrideli.push(this.Arrsubpartidas[m].id_subpartida);
                  }
                }
              }
              for(let b=0;b<this.Arrsubpartidas.length;b++){
                let exist=arrideli.find(ele=>ele==this.Arrsubpartidas[b].id_partida)
                if(exist){
                  this.Arrsubpartidas.splice(b,1);
                  b--;
                }
              }
            }
            //fin es subpartida
            for(let k=arrindic[j]+1;k<this.datasourcePri.length;k++){//actualizar nuevos num_det
              if(this.datasourcePri[k].id_tipo_insumo==arrsel[j].id_tipo_insumo){
                let newind=this.datasourcePri[k].num_det-1;
                this.datasourcePri[k].num_det=newind;
              }
              let indact=this.datasourcePri[k].ind;
              if(indact>arrsel[j].ind){//actualizar ind si es mayor al eliminado
                this.datasourcePri[k].ind=this.datasourcePri[k].ind-1;
              }
            }
            this.datasourcePri.splice(arrindic[j],1);
            for(let a=j+1;a<arrindic.length;a++){
              arrindic[a]=arrindic[a]-1;
            }
          }
          let sumasinporc=this.Actparcialt1(arrsel[0].id_tipo_insumo);
          this.actinsporc(tipoinsactporc,sumasinporc,null);
        }
        else{
          this.toaster.error('Seleccione insumos para eliminar','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        }
      }
      else{//seleccion individual
        if(this.fila_selacu>-1){
          if(this.datasourcePri[this.fila_selacu].num_det!=0){
            const respu=await SwalService.confirm('Esta seguro que desea Eliminar?','');
            if(!respu.isConfirmed){
              return;
            }
            //si es subpartida, eliminar recursivamente de arrsubpartidas
            if(this.datasourcePri[this.fila_selacu].esinsumo==0){
              let arrideli=[];
              arrideli.push(this.datasourcePri[this.fila_selacu].id_subpartida)
              for(let m=0;m<this.Arrsubpartidas.length;m++){//eliminar datos anteriores
                if(this.Arrsubpartidas[m].id_partida==this.datasourcePri[this.fila_selacu].id_subpartida){
                  if(this.Arrsubpartidas[m].id_subpartida){
                    this.AddideliDetSubp(arrideli,this.Arrsubpartidas[m].id_subpartida)
                    arrideli.push(this.Arrsubpartidas[m].id_subpartida);
                  }
                }
              }
              for(let b=0;b<this.Arrsubpartidas.length;b++){
                let exist=arrideli.find(ele=>ele==this.Arrsubpartidas[b].id_partida)
                if(exist){
                  this.Arrsubpartidas.splice(b,1);
                  b--;
                }
              }
            }
            let indpri=this.datasourcePri[this.fila_selacu].ind;
            let tipoinssel=this.datasourcePri[this.fila_selacu].id_tipo_insumo;
            let operadorsel=this.datasourcePri[this.fila_selacu].operador;
            for(let k=this.fila_selacu+1;k<this.datasourcePri.length;k++){//actualizar nuevos num_det
              if(this.datasourcePri[k].id_tipo_insumo==tipoinssel){
                let newind=this.datasourcePri[k].num_det-1;
                this.datasourcePri[k].num_det=newind;
              }
              let indact=this.datasourcePri[k].ind;
              if(indact>indpri){//actualizar ind si es mayor al eliminado
                this.datasourcePri[k].ind=this.datasourcePri[k].ind-1;
              }
            }
            this.datasourcePri.splice(this.fila_selacu,1);
            this.fila_selacu=-1;
            let sumasinporc=this.Actparcialt1(tipoinssel);
            this.actinsporc(tipoinssel,sumasinporc,operadorsel);
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
  AddideliDetSubp(arrideli:any,id_subpartida:any){
    for(let m=0;m<this.Arrsubpartidas.length;m++){//eliminar datos anteriores
      if(this.Arrsubpartidas[m].id_partida==id_subpartida){
        if(this.Arrsubpartidas[m].id_subpartida){
          this.AddideliDetSubp(arrideli,this.Arrsubpartidas[m].id_subpartida)
          arrideli.push(this.Arrsubpartidas[m].id_subpartida);
        }
      }
    }
  }
  SubirFilaIns(){
    if(this.colselacu){//seleccion multiple
      let arrsel=[];
      let arrindic=[];
      for(let i=0;i<this.datasourcePri.length;i++){
        if(this.datasourcePri[i].seleccion==1){
          arrsel.push(this.datasourcePri[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for(let j=0;j<arrsel.length;j++){
          let sube=this.datasourcePri[arrindic[j]];
          let baja=this.datasourcePri[arrindic[j]-1];
          if(baja.seleccion==0 && baja.num_det>0){
            sube.num_det=sube.num_det-1;
            baja.num_det=baja.num_det+1;;
            this.datasourcePri[arrindic[j]]=baja;
            this.datasourcePri[arrindic[j]-1]=sube;
          }
        }
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else{
      if(this.fila_selacu>-1){
        let sube=this.datasourcePri[this.fila_selacu];
        let baja=this.datasourcePri[this.fila_selacu-1];
        if(sube.num_det!=0){
          if(baja.num_det!=0){
            sube.num_det=sube.num_det-1;
            baja.num_det=baja.num_det+1;;
            this.datasourcePri[this.fila_selacu]=baja;
            this.datasourcePri[this.fila_selacu-1]=sube;
            this.fila_selacu=this.fila_selacu-1;
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
    if(this.colselacu){//seleccion multiple
      let arrsel=[];
      let arrindic=[];
      for(let i=0;i<this.datasourcePri.length;i++){
        if(this.datasourcePri[i].seleccion==1){
          arrsel.push(this.datasourcePri[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for(let j=arrsel.length-1;j>=0;j--){
          let sube=this.datasourcePri[arrindic[j]+1];
          let baja=this.datasourcePri[arrindic[j]];
          if(sube.seleccion==0 && sube.num_det>0){
            sube.num_det=sube.num_det-1;
            baja.num_det=baja.num_det+1;
            this.datasourcePri[arrindic[j]]=sube;
            this.datasourcePri[arrindic[j]+1]=baja;
          }
        }
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else{
      if(this.fila_selacu>-1){
        if(this.fila_selacu<this.datasourcePri.length-1){
          let sube=this.datasourcePri[this.fila_selacu+1];
          let baja=this.datasourcePri[this.fila_selacu];
          if(baja.num_det!=0){
            if(sube.num_det!=0){
              sube.num_det=sube.num_det-1;
              baja.num_det=baja.num_det+1;;
              this.datasourcePri[this.fila_selacu]=sube;
              this.datasourcePri[this.fila_selacu+1]=baja;
              this.fila_selacu=this.fila_selacu+1;
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
      else {
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
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
        for(let row2 of this.datasourcePri){
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
    this.colselacu=!this.colselacu;
    this.idgruselacu=null;
    for(let row of this.datasourcePri){
      row.seleccion=0;
    }
  }
  AgregarFilaBut(){
    if(this.fila_selacu>-1){
      let rowsel=this.datasourcePri[this.fila_selacu];
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
  async AgregarFilaIns(donde:any){//0:inicio,1:final,2:sobre,3:bajo
    try{
      if(this.fila_selacu>-1){
        let rowsel=this.datasourcePri[this.fila_selacu];
        if(rowsel.num_det==0){//agrupacion
          if(donde==2 || donde==3){
            this.toaster.error('No se puede agregar '+(donde==2?'sobre la selección.':'bajo la selección.'),'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
            return;
          }
        }
        if(rowsel.esinsumo==1){//insumos
          this.mostrar_carga_todo = true;
          /* let insumos=await this.catalogosService.BuscarDataInsumos({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo});
          let umedidas = await this.adminservice.listarUnidadMedxtipo({ id_usuario:this.id_user,tipo_insumo:rowsel.id_tipo_insumo })
          let indicesunif = await this.configuracionService.listarIndiceUnificados({ activo: 1 }) */
          let arrexisten=[]
          let filagru;
          for(let row of this.datasourcePri){
            if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det!=0){
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
          this.mostrar_carga_todo = false;
          /* modalRef.componentInstance.insumos = insumos;
          modalRef.componentInstance.medidas = umedidas;
          modalRef.componentInstance.indices = indicesunif; */
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.inpfuente=this.partida.fuente;
          modalRef.componentInstance.afcuad=rowsel.afcuadrilla;
          modalRef.componentInstance.mask_cant=this.mask_cant;
          modalRef.componentInstance.dec_cant=this.dec_cant;
          modalRef.componentInstance.acuAct=JSON.parse(JSON.stringify(this.datasourcePri));
          const result = await modalRef.result
          if (result) {
            if (result.length > 0) {
              let admitidos = []
              for (let filaadd of result) {
                let existe = false;
                for (let i = 0; i < this.datasourcePri.length; i++) {
                  if (this.datasourcePri[i].id_tipo_insumo == filaadd.id_tipo_insumo && this.datasourcePri[i].id_insumo == filaadd.id_insumo) {
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
                for(let i=0;i<this.datasourcePri.length;i++){
                  if (this.datasourcePri[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.datasourcePri[i].num_det==0) {
                    indins=i+1;
                    nuevnumdet=1;
                  }
                  else{
                    if(this.datasourcePri[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.datasourcePri[i].num_det!=0){
                      this.datasourcePri[i].num_det=Number(this.datasourcePri[i].num_det)+admitidos.length;
                    }
                  }
                }
              }
              else{
                let indbusq=donde==3?this.fila_selacu+1:this.fila_selacu;
                indins=donde==3?this.fila_selacu+1:this.fila_selacu;
                nuevnumdet=donde==3?Number(this.datasourcePri[this.fila_selacu].num_det)+1:Number(this.datasourcePri[this.fila_selacu].num_det);
                for (let i = indbusq; i < this.datasourcePri.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                  if (this.datasourcePri[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                    if(donde!=1){
                      this.datasourcePri[i].num_det=Number(this.datasourcePri[i].num_det)+admitidos.length;
                    }
                  }
                  else{
                    if(donde==1){
                      indins=i;
                      nuevnumdet=Number(this.datasourcePri[i - 1].num_det) + 1;
                      break;
                    }
                  }
                }
              }
              let nronuevo=donde==0?1:nuevnumdet;
              for (let filaadd of admitidos) {
                let preciogru=0;
                if(filaadd.tipo_insumo){
                  for(let rowpri of this.datasourcePri){
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
                  cantpasa=rowsel.afcuadrilla==1 && filaadd.operador!='%'?(this.formsService.redondeo(canti,this.dec_cant)):filaadd.cantidad;
                  preciopasa=preciogru>0?preciogru:filaadd.precio;//filaadd.operador=='%'?():filaadd.precio;//buscar precio de agrupacion, si cumple condicion buscar, sino no, usar preciogru
                  parccal=filaadd.operador=='%'?(Number(cantpasa)*Number(preciopasa))/100 :Number(cantpasa)*Number(preciopasa);//condicionar si se opera con porcentaje
                }
                else{
                  preciopasa=preciogru>0?preciogru:filaadd.precio;
                }
                let agrega:rowinsumo = {
                  id_partida: this.datasourcePri[this.fila_selacu].id_partida,
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
                  parcial: this.formsService.redondeo(parccal,this.dec_precio),
                  id_tipo_insumo: filaadd.id_tipo_insumo,
                  id_insumo: filaadd.id_insumo,
                  id_indice: filaadd.id_indice,
                  id_clasificacion: filaadd.id_clasificacion,
                  id_subpartida: null,
                  esinsumo:rowsel.esinsumo,
                  afcuadrilla:rowsel.afcuadrilla,
                  rendimiento:null,
                  und_rendi:null,
                  jornada:null,
                  advceros:null,
                  //afectaref:null,
                  icomost: '1',
                  mostrar: rowsel.icomost == '1' ? '1' : '0',
                  editar: 0,
                  editar2:0,
                  ind:this.datasourcePri.length,
                  seleccion:0,
                  afectaref:null,
                };
                this.datasourcePri.splice(indins,0,agrega);
                indins++;
              }
              this.fila_selacu=(donde==0 && rowsel.num_det!=0) || donde==2?this.fila_selacu+admitidos.length:this.fila_selacu;
              if (result.length != admitidos.length) {
                let difer = result.length - admitidos.length;
                this.toaster.error(difer + ' insumos ya existen.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
              }
              if(admitidos.length>0){
                let insumosauto=await this.catalogosService.ListarInsumosAddAuto({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo});
                for(let rowauto of insumosauto){
                  let indexis=this.datasourcePri.find(elem=> elem.id_insumo==rowauto.id_insumo);
                  if(!indexis){
                    let preciogru=0;
                    let indagre=-1;
                    let numdetadd=-1;
                    let existipo=false;
                    for(let im=0;im<this.datasourcePri.length;im++){
                      if(this.datasourcePri[im].num_det>0 && this.datasourcePri[im].id_tipo_insumo==rowauto.tipo_insumo && this.datasourcePri[im].operador==null){
                        preciogru+=Number(this.datasourcePri[im].parcial);
                      }
                      if(!existipo && this.datasourcePri[im].id_tipo_insumo==rowauto.id_tipo_insumo){
                        existipo=true;
                      }
                      if(existipo && this.datasourcePri[im].id_tipo_insumo!=rowauto.id_tipo_insumo && indagre==-1){
                        numdetadd=(Number(this.datasourcePri[im-1].num_det))+1;
                        indagre=im;
                      }
                    }
                    let agrega:rowinsumo = {
                      id_partida: this.datasourcePri[this.fila_selacu].id_partida,
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
                      id_clasificacion: rowauto.id_clasificacion,
                      id_subpartida: null,
                      esinsumo:rowsel.esinsumo,
                      afcuadrilla:rowsel.afcuadrilla,
                      rendimiento:null,
                      und_rendi:null,
                      jornada:null,
                      advceros:null,
                      //afectaref:null,
                      icomost: '1',
                      mostrar: rowsel.icomost == '1' ? '1' : '0',
                      editar: 0,
                      editar2:0,
                      ind:this.datasourcePri.length,
                      seleccion:0,
                      afectaref:null,
                    };
                    this.datasourcePri.splice(indagre,0,agrega);
                  }
                }
              }
              //calcular todales de la agrupacion y afectar a los porcentajes para calcular el total de toda la partida
              let sumasinporc=this.Actparcialt1(rowsel.id_tipo_insumo)
              this.actinsporc(rowsel.id_tipo_insumo,sumasinporc,rowsel.operador);
            }
          }
        }
        else{//subpartidas
          this.mostrar_carga_todo = true
          let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.id_user,fuente:this.partida.fuente, tipo_proy: this.tipo_proy.value?.id_clasificacion,idpadre:this.partida.id_partida??'',restriccion:this.partida.referencia??'' });//cambiar dinamico tipo_proy
          const modalRef = this.modalService.open(BusqpartcatComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
          modalRef.componentInstance.partidacondiciona=this.partida;
          modalRef.componentInstance.partidas = rpartidas;
          modalRef.componentInstance.subpartida = true;
          modalRef.componentInstance.tipoProy=this.tipoProy;//cargar los tipos de proyecto
          modalRef.componentInstance.tipoproysel=this.tipo_proy.value?.id_clasificacion;//cargar los tipos de proyecto
          modalRef.componentInstance.fuentecrea=this.partida.fuente;
          modalRef.componentInstance.fondo=this.fondo;
          modalRef.componentInstance.color=this.color;
          modalRef.componentInstance.letra=this.letra;
          modalRef.componentInstance.medidas=this.medidas;
          modalRef.componentInstance.inpfuente=this.partida.fuente;
          //modalRef.componentInstance.ultidpart=this.ultidpart;
          this.mostrar_carga_todo = false
          const result = await modalRef.result
          if (result.response) {//response debe tener arreglo de subpartidas
            let admitidos=[];
            let titsubtitulos=0;
            for(let filaadd of result.response){
              if(filaadd.esgrupo==1){
                let existe=false;
                for(let i=0;i<this.datasourcePri.length;i++){
                  if(this.datasourcePri[i].esinsumo == 0 && filaadd.esgrupo==1 && this.datasourcePri[i].descripcion==filaadd.descripcion){
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
            let indins=0;
            let nuevnumdet=0;
            if(donde==0){
              for(let i=0;i<this.datasourcePri.length;i++){
                if (this.datasourcePri[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.datasourcePri[i].num_det==0) {
                  indins=i+1;
                  nuevnumdet=1;
                }
                else{
                  if(this.datasourcePri[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.datasourcePri[i].num_det!=0){
                    this.datasourcePri[i].num_det=Number(this.datasourcePri[i].num_det)+admitidos.length;
                  }
                }
              }
            }
            else{
              let indbusq=donde==3?this.fila_selacu+1:this.fila_selacu;
              indins=donde==3?this.fila_selacu+1:this.fila_selacu;
              nuevnumdet=donde==3?Number(this.datasourcePri[this.fila_selacu].num_det)+1:Number(this.datasourcePri[this.fila_selacu].num_det);
              let tienecont=false;
              for (let i = indbusq; i < this.datasourcePri.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                if (this.datasourcePri[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                  if(donde!=1){
                    this.datasourcePri[i].num_det=Number(this.datasourcePri[i].num_det)+admitidos.length;
                  }
                }
              }
              if(!tienecont && donde==1){
                indins=this.datasourcePri.length;
                nuevnumdet=this.datasourcePri[this.datasourcePri.length-1].num_det+1;
              }
            }
            let nronuevo=donde==0?1:nuevnumdet;
            this.procesando=true;
            for(let filaadd of admitidos){
              let newidpart=this.ultidpart++;
              let agrega:rowinsumo={
                id_partida:this.datasourcePri[this.fila_selacu].id_partida,
                num_det:nronuevo++,
                codigo:null,
                descripcion:filaadd.descripcion,
                id_unidad:filaadd.id_unidad,
                unidad:filaadd.unidad,
                operador:null,
                tipo_insumo:null,
                cuadrilla:0,
                cantidad:0,
                precio:filaadd.precio,
                parcial:0,
                id_tipo_insumo:rowsel.id_tipo_insumo,
                id_insumo:null,
                id_indice:null,
                id_clasificacion:null,
                id_subpartida:newidpart,
                esinsumo:rowsel.esinsumo,
                afcuadrilla:0,
                rendimiento:filaadd.rendimiento,
                und_rendi:filaadd.und_rendi,
                jornada:filaadd.jornada,
                advceros:filaadd.advceros,
                icomost:'1',
                mostrar:rowsel.icomost=='1'?'1':'0',
                editar:0,
                editar2:0,
                ind:this.datasourcePri.length,
                afectaref:1,
                seleccion:0
              };
              this.datasourcePri.splice(indins,0,agrega);
              this.cambiossubpartidas.push(agrega);
              indins++;
              //agregar detalle de filas admitidas
              if(result.donde==0){//catalogo
                let tablas = await this.catalogosService.ListarDetalleDataPartidas({ id_partida: filaadd.id_partida });
                if(tablas.length>0){
                  for(let fil1 of tablas[0]){//detalle
                    let filacop=JSON.parse(JSON.stringify(fil1))
                    filacop.id_partida=newidpart;
                    if(filacop.id_subpartida){
                      let newsubp=this.ultidpart++;
                      this.cargarSubpartidas(tablas[1],fil1.id_subpartida,newsubp);
                      filacop.id_subpartida=newsubp;
                    }
                    this.Arrsubpartidas.push(filacop);//dar formato de bd
                  }
                }
              }
              else{//nuevo
                for(let row of result.arrsubpart){
                  if(row.id_partida==filaadd.id_partida){
                    let filacop=JSON.parse(JSON.stringify(row))
                    filacop.id_partida=newidpart;//asignar nuevos ids?
                    if(filacop.id_subpartida){
                      let newsubp=this.ultidpart++;
                      this.cargarSubpartidas(result.arrsubpart,row.id_subpartida,newsubp);
                      filacop.id_subpartida=newsubp;
                    }
                    this.Arrsubpartidas.push(filacop);//dar formato de bd?
                  }
                }
              }
            }
            this.procesando=false;
            this.fila_selacu=(donde==0 && rowsel.num_det!=0) || donde==2?this.fila_selacu+admitidos.length:this.fila_selacu;
            if((result.response.length-titsubtitulos)!=admitidos.length){
              let difer=(result.response.length-titsubtitulos)-admitidos.length;
              this.toaster.error(difer+' subpartida(s) ya existen.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
            }
          }
          if(result.actuapri==true){
            this.actuapri=true;
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
  cargarSubpartidas(datos:any,id_subp:any,newid:any){
    for(let fil2 of datos){//subpartidas //recursivo
      let filacop=JSON.parse(JSON.stringify(fil2));
      if(filacop.id_partida==id_subp){
        filacop.id_partida=newid;
        if(filacop.id_subpartida){
          let newsubp=this.ultidpart++;
          this.cargarSubpartidas(datos,filacop.id_subpartida,newsubp);
          filacop.id_subpartida=newsubp;
        }
        this.Arrsubpartidas.push(filacop);
      }
    }
  }
  async OpenSubpartida(row,indice){
    /* if(this.active){ */
      /* if(this.formDataPartida.enabled){ */
        let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:1 })
        let arraux=[];
        for(let fila1 of this.Arrsubpartidas){
          if(fila1.id_partida==row.id_subpartida){
            arraux.push(JSON.parse(JSON.stringify(fila1)));
          }
        }
        const modalRef = this.modalService.open(ModalSubpartidaComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
        modalRef.componentInstance.Arreglosubp = this.Arrsubpartidas;//detallepartida[1];
        modalRef.componentInstance.detallepartida = arraux;//detallepartida[0][0];
        modalRef.componentInstance.partida = row;//detallepartida[0][0];
        //modalRef.componentInstance.row =  row
        modalRef.componentInstance.tipoProy= this.tipoProy
        modalRef.componentInstance.tipoproysel=this.tipo_proy.value?.id_clasificacion;//cargar los tipos de proyecto
        modalRef.componentInstance.medidas= umedidas
        modalRef.componentInstance.fondo = this.fondo;
        modalRef.componentInstance.color = this.color;
        modalRef.componentInstance.letra = this.letra;
        modalRef.componentInstance.dec_cant =  this.dec_cant
        modalRef.componentInstance.mask_cant =  this.mask_cant
        modalRef.componentInstance.dec_precio =  this.dec_precio
        modalRef.componentInstance.mask_precio =  this.mask_precio
        modalRef.componentInstance.inpfuente=this.partida.fuente;
        modalRef.componentInstance.ultidpart=this.ultidpart;
        modalRef.componentInstance.bloquear=this.active?(this.formDataPartida.enabled?false:true):true;
        const result = await modalRef.result
        this.ultidpart=result.ultid;
        if (result.cargadet) {
          this.mostrar_carga_todo=true;
          for(let i=0;i<this.datasourcePri.length;i++){
            if(this.datasourcePri[i].id_subpartida == row.id_subpartida){
              var aprecio = Number(this.datasourcePri[i].precio);
              const valor = this.datasourcePri[i].cantidad
              this.datasourcePri[i].parcial=this.formsService.redondeo((valor * aprecio), this.dec_precio);
              this.Actparcialt1(this.datasourcePri[i].id_tipo_insumo)
              this.actualizarParcGrupos();
            }
          }
          this.mostrar_carga_todo=false;
        }
      /* }
      else{
        this.toaster.error('Habilitar edicion de Costos Unitarios.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      } */
    /* } */
  }
  async abrirmodalUnidades(){
    this.mostrar_carga_todo = true
    let tablaunid = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:1 })//cambiar a dinamico u otra consulta que retorne todo
    const valorInicial = this.medidas.find(data => data.id_unidad == this.unidad.value)
    const modalRef = await this.modalService.open(BuscaaddunidadmedComponent, { size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
    modalRef.componentInstance.Listaunidades = tablaunid;
    modalRef.componentInstance.operador = 1;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      if(result.actarray){
        this.medidas=result.tablaact;
      }
      this.unidad.setValue(Number(result.datosel.id_unidad))
      let undsel=this.medidas.find(ele=>ele.id_unidad==this.unidad.value);
      this.undconcatrendi=undsel.unidad.toUpperCase();
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
    }
    else{
      this.undconcatrendi='';
    }
  }
  //PESTANAS
  async onNavChange(tab = null){
    if(tab.nextId=="3" && this.esptext2==''){
      this.especificacionTexto2=this.esptext2;
      if(this.partida?.ficha_tec){
        this.buscaficha=true;
        let result = await this.catalogosService.ListarArchPartidasCat({nomarch:this.partida.ficha_tec})
        if(result?.length>0){
          this.especificacionTexto2=result[0].ficha;
          this.esptext2=result[0].ficha;
        }
        this.buscaficha=false;
      }
    }
    if(tab.nextId=="2" && this.esptext==''){
      this.especificacionTexto=this.esptext;
      if(this.partida?.espec_tec){
        this.buscaespec=true;
        let result = await this.catalogosService.ListarArchPartidasCat({nomarch:this.partida.espec_tec})
        if(result?.length>0){
          this.especificacionTexto=result[0].ficha;
          this.esptext=result[0].ficha;
        }
        this.buscaespec=false;
      }
    }
    //cuando 
    /* if(tab.nextId==2){
      this.abrirPDF();
    } */
  }
  async resetearEspecificacion() {
    const sw = await SwalService.confirm('Estas seguro?', 'Se reiniciara la Especificacion Tecnica con la plantilla')
    if (sw.isConfirmed) {
      this.especificacionTexto="";
    }
  }
  async resetearEspecificacion2() {
    const sw = await SwalService.confirm('Estas seguro?', 'Se reiniciara la Ficha Tecnica con la plantilla')
    if (sw.isConfirmed) {
      this.especificacionTexto2="";
    }
  }
  AgregaUnidadEsp(){
    const detalle = '<b> ' + this.partida.unidad + ' </b>'
    this.tinymce.editor.execCommand('mceInsertContent', false, detalle);
  }
  async AgregaInsumosEsp(){
    let tinsumos = await this.recuperarInsumosMEtYEqui()
    if(tinsumos!=''){
      const detalle = '<p style="padding-left: 40px">' + tinsumos + '</p>'
      this.tinymce.editor.execCommand('mceInsertContent', false, detalle);
    }
  }
  async recuperarInsumosMEtYEqui() {
    let arrayElementos = []
    for (let i=0;i<this.datasourcePri.length;i++) {
      if(this.datasourcePri[i].num_det>0){
        arrayElementos.push({ descripcion: this.datasourcePri[i].descripcion, tipo: 0 })
      }
      else{
        let agrega=false;
        if(i<this.datasourcePri.length-1){
          if(this.datasourcePri[i+1].id_tipo_insumo==this.datasourcePri[i].id_tipo_insumo){
            agrega=true;
          }
        }
        if(agrega){
          arrayElementos.push({ descripcion: this.datasourcePri[i].descripcion, tipo: 1 })
        }
      }
    }
    let lista = null
    if (arrayElementos.length) {
      lista = 'Los materiales  utilizados en la partida son : <br>'
      let i = 0
      for (const iterator of arrayElementos) {
        if (iterator.tipo == 1) {
          lista = lista + '<h5 style="margin-left: 45px; font-weight:900;">' + iterator.descripcion + '<h5> <ul style="padding-left: 40px;list-style-type: circle;">'
        } else {
          lista = lista + '<li style="margin-left: 30px">' + iterator.descripcion + '</li>'
          if (i < arrayElementos.length - 1) {
            if (arrayElementos[i + 1].tipo == 1) {
              lista = lista + '</ul>'
            }
          }
        }
        i++
      }
    } else {
      lista = ''
      this.toaster.error('No hay insumos para agregar. Agregarlos desde Costos Unitarios', '', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
    return lista
  }
  async SubirArchivo() {
    const imgTagCount = (this.especificacionTexto.match(/<img/g) || []).length;
    if(imgTagCount>=5){
      this.toaster.error('No se puede agregar mas de 5 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
    if (fileUpload != null) { fileUpload.value = null }
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      let anchi=100;
      let altoi=100;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          anchi = img.width;
          altoi = img.height;
        };
        img.src = e.target.result;
        this.extraerBase64(file).then(async (imagen: any) => {
          let fagre: archivoimg;
          fagre = { nombre: file.name, base: imagen.base };
          imagen = fagre;
          await this.cursor(imagen.base,anchi,altoi)
        });
      };
      reader.readAsDataURL(file);
    }
    fileUpload.click();
  }
  async SubirArchivo2() {
    const imgTagCount = (this.especificacionTexto2.match(/<img/g) || []).length;
    if(imgTagCount>=5){
      this.toaster.error('No se puede agregar mas de 5 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const fileUpload = document.getElementById("fileUpload2") as HTMLInputElement;
    if (fileUpload != null) { fileUpload.value = null }
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      let anchi=100;
      let altoi=100;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          anchi = img.width;
          altoi = img.height;
        };
        img.src = e.target.result;
        this.extraerBase64(file).then(async (imagen: any) => {
          let fagre: archivoimg;
          fagre = { nombre: file.name, base: imagen.base };
          imagen = fagre;
          await this.cursor2(imagen.base,anchi,altoi)
        });
      };
      reader.readAsDataURL(file);
    }
    fileUpload.click();
  }
  async cursor(img,ancho,alto) {
    let propor=1;
    let nanch=ancho;
    let nalt=alto;
    if(ancho>250 || alto>250){
      propor=Number((ancho/alto).toFixed(3));
      nanch=ancho>alto?250:Number((250*propor).toFixed(3));
      nalt=ancho>alto?Number(Math.trunc(250/propor).toFixed(3)):250;
    }
    const array = document.getElementsByTagName('img')
    const text = '<img src="' + img + '" width="'+nanch+'" height="'+nalt+'" id=' + "img" + array.length + '/>'
    if (img) {
      this.tinymce.editor.execCommand('mceInsertContent', false, text);
    }
  }
  async cursor2(img,ancho,alto) {
    let propor=1;
    let nanch=ancho;
    let nalt=alto;
    if(ancho>250 || alto>250){
      propor=Number((ancho/alto).toFixed(3));
      nanch=ancho>alto?250:Number((250*propor).toFixed(3));
      nalt=ancho>alto?Number(Math.trunc(250/propor).toFixed(3)):250;
    }
    const array = document.getElementsByTagName('img')
    const text = '<img src="' + img + '" width="'+nanch+'" height="'+nalt+'" id=' + "img" + array.length + '/>'
    if (img) {
      this.tinymce2.editor.execCommand('mceInsertContent', false, text);
    }
  }
  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeimg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeimg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        })
      };
    }
    catch (e) {
      return null;
    }
  });
  async Actua2() {
    try {
      this.mostrar_carga_todo = true
      const input = {
        id_partida: this.partida.id_partida,
        espec_tec: this.especificacionTexto,
      }
      let result = await this.catalogosService.ModificarEspePartidas(input)
      this.mostrar_carga_todo = false
      if (result[0]?.id == '1') {
        this.toaster.success('Se actualizó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        this.partida.espec_tec=this.especificacionTexto==""?null:this.partida.id_partida+'-espec.txt';
        this.bloqesp=true;
      } else {
        this.toaster.error(result[0]?.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  async canEdita2() {//restaura contenido
    this.especificacionTexto=this.esptext;
    this.bloqesp=true;
  }
  async Edita2() {
    if(this.partida){
      this.bloqesp=false;
    }
    else{
      this.toaster.error("Seleccione una fila para Editar.", 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async Actua3() {
    try {
        this.mostrar_carga_todo = true
        const input = {
          id_partida: this.partida.id_partida,
          ficha_tec: this.especificacionTexto2,
        };
        let result = await this.catalogosService.ModificarFichaPartidas(input)
        this.mostrar_carga_todo = false
        if (result[0]?.id == '1') {
          this.toaster.success('Se actualizó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          this.partida.ficha_tec=this.especificacionTexto2==""?null:this.partida.id_partida+'-ficha.txt';
          this.bloqfic=true;
        } else {
          SwalService.error('Error', result[0]?.mensaje)
        }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error(e)
    }
  }
  async canEdita3() {//restaura contenido
    this.especificacionTexto2=this.esptext2;
    this.bloqfic=true;
  }
  async Edita3() {
    if(this.partida){
      this.bloqfic=false;
    }
    else{
      this.toaster.error("Seleccione una fila para Editar.", 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  Anumero(val:any){
    return Number(val);
  }
  async openImgDrive(){
    const imgTagCount = (this.especificacionTexto.match(/<img/g) || []).length;
    if(imgTagCount>=5){
      this.toaster.error('No se puede agregar mas de 5 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const modalRef = this.modalService.open(AddImgUrlComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
    const result = await modalRef.result
    if (result) {
      const element = document.getElementById("tiny");
      var ancholim=element.offsetWidth-70;
      let ancho=255;
      let alto=255;
      let valido=true
      await this.getImageDimensions(result)
      .then(dimensions => {
        ancho=dimensions.width
        alto=dimensions.height
      })
      .catch(error => {
        valido=false
        this.toaster.error('No se puedo cargar la imagen.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      });
      if(!valido){return}
      //alto img
      let propor=1;
      let nanch=ancho;
      let nalt=alto;
      if(ancho>ancholim){
        propor=Number((ancho/alto).toFixed(3));
        nanch=ancho>alto?ancholim:Number((ancholim*propor).toFixed(3));
        nalt=ancho>alto?Number(Math.trunc(ancholim/propor).toFixed(3)):ancholim;
      }
      const text = '<img src="' + result + '" width="'+nanch+'" height="'+nalt+'"/>'
      this.tinymce.editor.execCommand('mceInsertContent', false, text);
    }
  }
  async openImgDrive2(){
    const imgTagCount = (this.especificacionTexto2.match(/<img/g) || []).length;
    if(imgTagCount>=5){
      this.toaster.error('No se puede agregar mas de 5 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const modalRef = this.modalService.open(AddImgUrlComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
    const result = await modalRef.result
    if (result) {
      const element = document.getElementById("tiny2");
      var ancholim=element.offsetWidth-70;
      let ancho=255;
      let alto=255;
      let valido=true;
      await this.getImageDimensions(result)
      .then(dimensions => {
        ancho=dimensions.width
        alto=dimensions.height
      })
      .catch(error => {
        valido=false
        this.toaster.error('No se puedo cargar la imagen.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      });
      if(!valido){return}
      //alto img 
      let propor=1;
      let nanch=ancho;
      let nalt=alto;
      if(ancho>ancholim){
        propor=Number((ancho/alto).toFixed(3));
        nanch=ancho>alto?ancholim:Number((ancholim*propor).toFixed(3));
        nalt=ancho>alto?Number(Math.trunc(ancholim/propor).toFixed(3)):ancholim;
      }
      const text = '<img src="' + result + '" width="'+nanch+'" height="'+nalt+'"/>'
      this.tinymce2.editor.execCommand('mceInsertContent', false, text);
    }
  }
  getImageDimensions(base64Image: string): Promise<{ width: number, height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        resolve({ width, height });
      };
      img.onerror = reject;
      img.src = base64Image;
    });
  }
}
