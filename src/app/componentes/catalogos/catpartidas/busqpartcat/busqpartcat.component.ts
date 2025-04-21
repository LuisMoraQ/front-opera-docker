import { Component, OnInit, Input, HostListener,ChangeDetectorRef } from '@angular/core';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { BuscaaddunidadmedComponent } from '../../unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { ModalSubpartidaComponent } from '../modal-subpartida/modal-subpartida.component';
import { BuscarinsumoComponent } from '../buscarinsumo/buscarinsumo.component';
import { BuscartitsubtComponent } from '../buscartitsubt/buscartitsubt.component';

export interface rowpartida {
  id_partida: any;
  descripcion: any;
  id_unidad:any;
  unidad:any;
  precio:any;
  rendimiento:any;
  und_rendi:any;
  jornada:any;
  id_usuario:any;
  tipo_proy:any;
  fuente:any;
  agrupacion:any;
  esgrupo:any;
  referencia:any;
  advceros:any;
  seleccion:any;
  mostrar:any;
  icomost:any;
  ind:any;
  ind2:any;
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
  und_rendi:any
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
  selector: 'app-busqpartcat',
  templateUrl: './busqpartcat.component.html',
  styleUrls: ['./busqpartcat.component.scss']
})
export class BusqpartcatComponent implements OnInit {
  @Input('height') height: number = 100;
  paddingscroll=17;
  paddingscroll1=17;
  paddingscroll2 = 17;
  mostrar_carga_todo: boolean = false;
  procesando=false;
  busqueda = '';
  active = 1;
  id_user:any;
  preventscroll2=false;
  buscando=false;
  @Input() nuevo=false;
  @Input() partidacondiciona=null;
  @Input() partidas:rowpartida[]=[];
  @Input() subpartida=false;
  @Input() tipoProy=[];
  @Input() tipoproysel;
  @Input() fuentecrea;
  @Input() fondo:any = '';
  @Input() color:any = '';
  @Input() letra:any = '';
  @Input() inpfuente:any;
  //@Input() ultidpart:any;
  ultidpart=1;
  tiposel='';
  fuentesel=0;
  nomtabsel='';
  datasourcePri:rowpartida[];
  fila_sel:any;
  //variables opciones vista codigo
  mcodigo=true;
  codsoloiu=false;
  colselacu=false;
  idgruselacu=null;
  editarpreins=false;
  arrsubpart=[];
  idprinc=0;
  //nuevo
  formDataPartida = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    unidad: new UntypedFormControl('', [Validators.required]),
    precio: new UntypedFormControl('0.00', [Validators.required, Validators.min(0)]),
    rendimiento: new UntypedFormControl('1.00', []),
    undrendimiento: new UntypedFormControl('DIA', []),
    jornada: new UntypedFormControl('8', []),
    id_usuario: new UntypedFormControl('', []),
    tipo_proy: new UntypedFormControl('', [Validators.required]),
    agrupacion: new UntypedFormControl(''/* , [Validators.required] */),
  })
  get descripcion(): UntypedFormControl { return this.formDataPartida.get('descripcion') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formDataPartida.get('unidad') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.formDataPartida.get('precio') as UntypedFormControl }
  get rendimiento(): UntypedFormControl { return this.formDataPartida.get('rendimiento') as UntypedFormControl }
  get undrendimiento(): UntypedFormControl { return this.formDataPartida.get('undrendimiento') as UntypedFormControl }
  get jornada(): UntypedFormControl { return this.formDataPartida.get('jornada') as UntypedFormControl }
  get id_usuario(): UntypedFormControl { return this.formDataPartida.get('id_usuario') as UntypedFormControl }
  get tipo_proy(): UntypedFormControl { return this.formDataPartida.get('tipo_proy') as UntypedFormControl }
  get agrupacion(): UntypedFormControl { return this.formDataPartida.get('agrupacion') as UntypedFormControl }
  datasourcePriacu=[];
  fila_selacu: any;
  @Input() medidas: unidadmed[] = [];
  undconcatrendi = '';
  dec_precio=2;
  mask_precio='0.2';
  dec_cant=4;
  mask_cant='0.4';
  padre:any;
  minimbut=false;
  constructor(
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    private formsService: FormsService,
    private catalogosService: CatalogosService,
    private _EncriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
    private changeDetector: ChangeDetectorRef,
    private modalService: NgbModal,
    private adminservice: AdministradorService,
  ) { }

  async ngOnInit() {
    var resto = 305;
    this.height = window.innerHeight - resto;
    this.minimbut=document.body.clientWidth <= 991?true:false;
    this.tiposel=this.tipoproysel;
    this.tipo_proy.setValue(this.tipoproysel);
    this.datasourcePri=this.partidas;
    this.nomtabsel="tab1";
    this.id_user=this._EncriptadorService.recuperarlocalstory('idusuario');
    let detallespart = await this.catalogosService.ListarDetalleDataPartidas({ id_partida: '0' });
    this.datasourcePriacu=detallespart.length>0?detallespart[0]:[];
    this.undrendimiento.disable();
    const selecfuen = document.getElementById("fuenteselect") as HTMLSelectElement;//si se cierra rapido no existe por el tabset
    if(selecfuen)
      selecfuen.value=this.fuentecrea;
    let decimales = this._EncriptadorService.recuperarlocalstory('decimales');
    if(decimales?.toString().includes('|')){
      let arrdec=decimales.split('|');
      this.dec_precio=arrdec[1];
      this.mask_precio='0.'+arrdec[1];
      this.dec_cant=arrdec[3];
      this.mask_cant='0.'+arrdec[3];
    }
    document.getElementById('inpbusq')?.focus();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 305;
    this.height = window.innerHeight - resto;
    this.minimbut=document.body.clientWidth <= 991?true:false;
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    var element = document.getElementById('horscrollbod2');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll != sizeef) {
        this.paddingscroll = sizeef;
      }
    }
    var element2 = document.getElementById('tableBodya');
    if (element2 != undefined) {
      let sizeef = element2.offsetWidth - element2.clientWidth;
      if (this.paddingscroll1 != sizeef) {
        this.paddingscroll1 = sizeef;
      }
      let sizeef2 = element2.offsetHeight - element2.clientHeight;
      if (this.paddingscroll2 != sizeef2) {
        this.paddingscroll2 = sizeef2;
      }
    }
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  SyncScroll2a() {//body
    if (this.preventscroll2) {
      this.preventscroll2 = false;
      return;
    }
    this.preventscroll2 = true;
    var face1 = document.getElementById("tableBodya");
    var face2 = document.getElementById("tableFoota");
    face2.scrollLeft = face1.scrollLeft;
  }
  SyncScroll2b() {//footer
    if (this.preventscroll2) {
      this.preventscroll2 = false;
      return;
    }
    this.preventscroll2 = true;
    var face1 = document.getElementById("tableBodya");
    var face2 = document.getElementById("tableFoota");
    face1.scrollLeft = face2.scrollLeft;
  }
  seleccionar(){
    let cont=0;
    let aux=[];
    for(let i=0;i<this.datasourcePri.length;i++){
      if(this.datasourcePri[i].seleccion==1){
        cont++;
        aux.push(this.datasourcePri[i])
      }
    }
    if(cont>0){
      this.modal.close({response:aux,donde:0,arrsubpart:this.arrsubpart})//donde 0:seleccion catalogo, 1:nueva partida con subpartidas
    }
    else{
      this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  toggleOn(condicion:any,indice:any){
    this.datasourcePri[indice].icomost=1;
    for(let row of this.datasourcePri){
      var palabra = row.agrupacion?.toString().substring(0, condicion.toString().length + 1)
      if(row.agrupacion==condicion)
      {
        if(row.esgrupo!=0){
          row.mostrar=1;
        }
      }
      else if(palabra == (condicion + '.')){
        row.mostrar=1;
        row.icomost=1;
      }
    }
  }
  toggleOff(condicion:any,indice:any){
    this.datasourcePri[indice].icomost=0;
    for(let row of this.datasourcePri){
      var palabra = row.agrupacion?.toString().substring(0, condicion.toString().length + 1)
      if(row.agrupacion==condicion)
      {
        if(row.esgrupo!=0){
          row.mostrar=0;
        }
      }
      else if(palabra == (condicion + '.')){
        row.mostrar=0;
        row.icomost=0;
      }
    }
  }
  maxtodo(){
    for(let row of this.datasourcePri){
      if(row.esgrupo!=0){
        row.mostrar=1;
      }
      else{
        row.icomost=1;
        row.mostrar = 1;
      }
    }
  }
  mintodo(){
    for(let row of this.datasourcePri){
      if(row.esgrupo!=0){
        row.mostrar=0;
      }
      else{
        row.icomost=0;
        row.mostrar = row.agrupacion?.split('.').length == 1 ? 1 : 0;
      }
    }
  }
  closeModal(){
    this.modal.close({response:null,donde:3,arrsubpart:this.arrsubpart})
  }
  cambindicesel(ind:any){
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }
  cambioselt1(row){
    let indpri=row.ind;
    if(row.seleccion==0){
      row.seleccion=1;
      this.datasourcePri[indpri].seleccion=1;
      if(row.esgrupo==0){
        for(let i=Number(indpri)+1;i<this.datasourcePri.length;i++){
          var palabra = this.datasourcePri[i].agrupacion?.toString().substring(0, row.agrupacion.toString().length + 1)
          if(this.datasourcePri[i].agrupacion ==  row.agrupacion || palabra == (row.agrupacion + '.')){
            this.datasourcePri[i].seleccion=1;
          }
          else{
            break;
          }
        }
      }
    }
    else{
      row.seleccion=0;
      this.datasourcePri[indpri].seleccion=0;
      if(row.esgrupo==0){
        for(let i=Number(indpri)+1;i<this.datasourcePri.length;i++){
          var palabra = this.datasourcePri[i].agrupacion?.toString().substring(0, row.agrupacion.toString().length + 1)
          if(this.datasourcePri[i].agrupacion ==  row.agrupacion || palabra == (row.agrupacion + '.')){
            this.datasourcePri[i].seleccion=0;
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
      this.datasourcePri=[];
      let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.id_user,fuente:this.fuentesel, tipo_proy: this.tiposel,idpadre:this.partidacondiciona?.id_partida??'',restriccion:this.partidacondiciona?.referencia??'' });//cambiar dinamico tipo_proy
      this.datasourcePri=rpartidas;
      this.buscando=false;
    }
    catch(e){
      this.buscando=false;
      console.log(e)
    }
  }
  cambiarTipoProy(idtipo: any){
    this.tiposel=idtipo;
    this.buscarPartidas();
  }
  async cambiarFuente(idfuente:any){
    this.fuentesel=idfuente;
    this.buscarPartidas();
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  async onNavChange(tab = null) {
    this.nomtabsel=tab;
  }
  async abrirModalTitsubt(){
    try{
      if(this.tipo_proy.value!=''){
        this.mostrar_carga_todo = true;
        let tablatitsubt = await this.catalogosService.ListarTitsubPartidas({ id_usuario: this.id_user,fuente:this.fuentecrea,tipo_proy:this.tipo_proy.value });
        const modalRef = this.modalService.open(BuscartitsubtComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
        modalRef.componentInstance.tabla = tablatitsubt;
        modalRef.componentInstance.tipoProy=this.tipoProy;
        modalRef.componentInstance.tipoproysel=this.tipo_proy.value;
        modalRef.componentInstance.fuentesel=this.fuentecrea;//pasar fuente en la que se pueda editar
        modalRef.componentInstance.fondo=this.fondo;
        modalRef.componentInstance.color=this.color;
        modalRef.componentInstance.letra=this.letra;
        this.mostrar_carga_todo = false
        const result = await modalRef.result
        if (result) {
          this.tipo_proy.setValue(result.tipoproy)
          this.padre=result.data;
          this.agrupacion.setValue(this.padre.agrupacion+"  "+this.padre.descripcion);
        }
      }
      else{
        this.toaster.error('Seleccione un Tipo de Proyecto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      console.log(e);
    }
  }
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
      for(let row of this.datasourcePriacu){
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
      for(let row of this.datasourcePriacu){
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
    for(let i=0;i<this.datasourcePriacu.length;i++){
      if(this.datasourcePriacu[i].num_det==0){
        if(indgru!=-1){
          sumtot+=parcialgru;
          this.datasourcePriacu[indgru].parcial=this.formsService.redondeo(parcialgru,this.dec_precio);
          this.actinsporc(this.datasourcePriacu[indgru].id_tipo_insumo,parcgrusinporc,this.datasourcePriacu[indgru].operador);
        }
        indgru=i;
        actgru=this.datasourcePriacu[i];
        parcialgru=0;
        parcgrusinporc=0;
      }
      else{
        if(this.datasourcePriacu[i].id_tipo_insumo==actgru.id_tipo_insumo){
          parcialgru+=Number(this.datasourcePriacu[i].parcial)
          if(this.datasourcePriacu[i].unidad != '' && this.datasourcePriacu[i].operador==null){
            parcgrusinporc+=Number(this.datasourcePriacu[i].parcial)
          }
        }
      }
    }
    if(indgru!=-1){
      sumtot+=parcialgru;
      this.datasourcePriacu[indgru].parcial=this.formsService.redondeo(parcialgru,this.dec_precio);
    }
    this.precio.setValue(this.formsService.redondeo(sumtot,this.dec_precio));
  }
  presentertRendi(event:any){
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  toggleOnacu(condicion: any,indice2:any) {
    this.datasourcePriacu[indice2].icomost = 1;
    for (let i=indice2+1;i<this.datasourcePriacu.length;i++) {
      if(this.datasourcePriacu[i].id_tipo_insumo==condicion)
      {
        if(this.datasourcePriacu[i].unidad!='')
        {
          this.datasourcePriacu[i].mostrar=1;
        }
      }
      else{ break; }
    }
  }
  toggleOffacu(condicion: any,indice2:any) {
    this.datasourcePriacu[indice2].icomost = 0;
    for (let i=indice2+1;i<this.datasourcePriacu.length;i++) {
      if(this.datasourcePriacu[i].id_tipo_insumo==condicion)
      {
        if(this.datasourcePriacu[i].unidad!='')
        {
          this.datasourcePriacu[i].mostrar=0;
        }
      }
      else{ break; }
    }
  }
  editarceldat1(ind: any) {
    if(this.formDataPartida.enabled && this.datasourcePriacu[ind].num_det!=0){
      this.datasourcePriacu[ind].editar = 1;
    }
  }
  editarceldat2(ind: any) {
    if(this.formDataPartida.enabled && this.datasourcePriacu[ind].num_det!=0){
      this.datasourcePriacu[ind].editar3 = 1;
    }
  }
  editarceldat3(ind: any) {
    if(this.formDataPartida.enabled && this.datasourcePriacu[ind].num_det!=0 && this.datasourcePriacu[ind].operador==null && this.datasourcePriacu[ind].esinsumo==1){
      this.datasourcePriacu[ind].editar2 = 1;
    }
  }
  actinsporc(id_tipo_ins:any,parcialsinporc:any,operador:any){
    if(operador==null){
      for(let row of this.datasourcePriacu){
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
    var actual = Number(this.datasourcePriacu[ind2].cantidad)
    var aprecio = Number(this.datasourcePriacu[ind2].precio);
    this.datasourcePriacu[ind2].editar = 0;
    if (valor != actual) {
      let resparc=this.datasourcePriacu[ind2].operador=='%'?(valor*aprecio)/100:valor*aprecio;
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      //calcular cuadrilla, si rendimiento es mayor a 0, sino no hace nada
      if(this.datasourcePriacu[ind2].afcuadrilla==1 && Number(this.rendimiento.value)!=0){
        let rescuad=(valor*Number(this.rendimiento.value))/Number(this.jornada.value);
        if(this.errormaxval(rescuad.toString(),'Cuadrilla',10,'El resultado de ')){ return }
        this.datasourcePriacu[ind2].cuadrilla =this.formsService.redondeo(rescuad,8);
      }
      this.datasourcePriacu[ind2].cantidad=this.formsService.redondeo(Number(valor), this.dec_cant);
      this.datasourcePriacu[ind2].parcial=this.formsService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1(this.datasourcePriacu[ind2].id_tipo_insumo);
      this.actinsporc(this.datasourcePriacu[ind2].id_tipo_insumo,sumasinporc,this.datasourcePriacu[ind2].operador);
    }
  }
  caneditarceldat2(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.datasourcePriacu[ind2].cuadrilla);
    var aprecio = Number(this.datasourcePriacu[ind2].precio);
    var rendi=Number(this.rendimiento.value);
    this.datasourcePriacu[ind2].editar3 = 0;
    if (valor != actual) {
      var canti=rendi==0?Number(this.datasourcePriacu[ind2].cantidad):(valor*Number(this.jornada.value))/rendi;
      let resparc=this.datasourcePriacu[ind2].operador=='%'?(Number(this.formsService.redondeo(canti, this.dec_cant))*aprecio)/100:Number(this.formsService.redondeo(canti, this.dec_cant))*aprecio;
      if(this.errormaxval(canti.toString(),'Cantidad',10,'El resultado de ')){ return }
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      this.datasourcePriacu[ind2].cuadrilla=this.formsService.redondeo(Number(valor), 8);
      this.datasourcePriacu[ind2].cantidad=this.formsService.redondeo(canti, this.dec_cant);
      this.datasourcePriacu[ind2].parcial=this.formsService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1(this.datasourcePriacu[ind2].id_tipo_insumo);
      this.actinsporc(this.datasourcePriacu[ind2].id_tipo_insumo,sumasinporc,this.datasourcePriacu[ind2].operador);
    }
  }
  async caneditarceldat3(eve: any, ind2: any) {
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(this.datasourcePriacu[ind2].precio)
    var acantidad = Number(this.datasourcePriacu[ind2].cantidad);
    this.datasourcePriacu[ind2].editar2 = 0;
    if (valor != actual) {
      let resparc=this.datasourcePriacu[ind2].operador=='%'?(valor*acantidad)/100:valor*acantidad;
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      this.datasourcePriacu[ind2].precio=this.formsService.redondeo(Number(valor), this.dec_precio);
      this.datasourcePriacu[ind2].parcial=this.formsService.redondeo(resparc, this.dec_precio);
      let sumasinporc=this.Actparcialt1(this.datasourcePriacu[ind2].id_tipo_insumo)
      this.actinsporc(this.datasourcePriacu[ind2].id_tipo_insumo,sumasinporc,this.datasourcePriacu[ind2].operador);
      if(this.editarpreins && this.datasourcePriacu[ind2].id_insumo){//editar precio de insumo
        let resp=await this.configuracionService.ModificarPrecioInsumo({ id_insumo: this.datasourcePriacu[ind2].id_insumo,precio:this.datasourcePriacu[ind2].precio });
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
      this.caneditarceldat1(this.datasourcePriacu[ind].cantidad,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.datasourcePriacu.length) {
        for (let i = ind + 1; i < this.datasourcePriacu.length; i++) {
          if (this.datasourcePriacu[i].unidad != '') {
            this.datasourcePriacu[i].editar = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (this.datasourcePriacu[i].unidad != '') {
            this.datasourcePriacu[i].editar = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
  }
  presentert2(event: any, ind: any) {
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat2(this.datasourcePriacu[ind].cuadrilla,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.datasourcePriacu.length) {
        for (let i = ind + 1; i < this.datasourcePriacu.length; i++) {
          if (this.datasourcePriacu[i].unidad != '') {
            event.target.blur();
            if(this.datasourcePriacu[i].afcuadrilla==0 || this.datasourcePriacu[i].operador=='%'){
              this.datasourcePriacu[i].editar = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            else{
              this.datasourcePriacu[i].editar3 = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (this.datasourcePriacu[i].unidad != '') {
            event.target.blur();
            if(this.datasourcePriacu[i].afcuadrilla==0 || this.datasourcePriacu[i].operador=='%'){
              this.datasourcePriacu[i].editar = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            else{
              this.datasourcePriacu[i].editar3 = 1;//condicionar si sube a cuadrilla o a cantidad condicionado con rendimiento
            }
            break;
          }
        }
      }
    }
  }
  presentert3(event: any, ind: any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat3(this.datasourcePriacu[ind].precio,ind)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.datasourcePriacu.length) {
        for (let i = ind + 1; i < this.datasourcePriacu.length; i++) {
          if (this.datasourcePriacu[i].unidad != '' && this.datasourcePriacu[i].operador==null && this.datasourcePriacu[i].esinsumo==1) {
            this.datasourcePriacu[i].editar2 = 1;
            event.target.blur();
            break;
          }
        }
      }
    }
    else if (event.keyCode.toString() == "38") {
      if (ind - 1 >= 0) {
        for (let i = ind - 1; i >= 0; i--) {
          if (this.datasourcePriacu[i].unidad != '' && this.datasourcePriacu[i].operador==null && this.datasourcePriacu[i].esinsumo==1) {
            this.datasourcePriacu[i].editar2 = 1;
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
    for (let i = 0; i < this.datasourcePriacu.length; i++) {
      if (this.datasourcePriacu[i].id_tipo_insumo == idtipo && this.datasourcePriacu[i].unidad == '') {
        indgrupo = i;
      }
      if (this.datasourcePriacu[i].id_tipo_insumo == idtipo && this.datasourcePriacu[i].unidad != '') {
        suma += Number(this.datasourcePriacu[i].parcial)
        sumatot += Number(this.datasourcePriacu[i].parcial)
        if(this.datasourcePriacu[i].operador==null){
          sumasinporc+=Number(this.datasourcePriacu[i].parcial)
        }
      }
      if (this.datasourcePriacu[i].id_tipo_insumo != idtipo && this.datasourcePriacu[i].unidad != '') {
        sumatot += Number(this.datasourcePriacu[i].parcial)
      }
    }
    if (indgrupo >= 0) {
      this.datasourcePriacu[indgrupo].parcial = this.formsService.redondeo(suma, this.dec_precio);
      //total tabla
      this.precio.setValue(this.formsService.redondeo(sumatot,this.dec_precio));
      return sumasinporc;
    }
  }
  cambindiceselacu(ind: any) {
    if (ind == this.fila_selacu)
      this.fila_selacu = -1;
    else
      this.fila_selacu = ind;
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
  async guardar(){
    //guardar y seleccionar, buscar los datos del costo unitario y mostrarlo
    if (this.formDataPartida.invalid) {
      this.formDataPartida.markAllAsTouched()
      this.toaster.error('Datos incompletos', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return
    } else {
      this.mostrar_carga_todo = true
      const tabla1 = JSON.stringify(this.datasourcePriacu);
      let existeceros=0;
      for(let i=0;i<this.datasourcePriacu.length;i++){
        if(this.datasourcePriacu[i].unidad!=''){
          if(Number(this.datasourcePriacu[i].cantidad)==0){
            existeceros=1;
          }
          let cuadr=this.datasourcePriacu[i].cuadrilla?this.datasourcePriacu[i].cuadrilla.toString():'';
          if(this.errormaxval(cuadr,'Cuadrilla',10)){ return }
          let cantr=this.datasourcePriacu[i].cantidad.toString();
          if(this.errormaxval(cantr,'Cantidad',10)){ return }
          let precior=this.datasourcePriacu[i].precio.toString();
          if(this.errormaxval(precior,'Precio',10)){ return }
          let parcr=this.datasourcePriacu[i].parcial.toString();
          if(this.errormaxval(parcr,'Parcial',10)){ return }
        }
      }
      let undsel=this.medidas.find(ele=>ele.id_unidad==this.unidad.value);
        let ejemplo:rowpartida={
          id_partida: this.idprinc,
          descripcion: this.descripcion.value.toUpperCase(),
          id_unidad:this.unidad.value,
          unidad: undsel.unidad.toUpperCase(),
          precio:this.precio.value,
          rendimiento:this.rendimiento.value,
          und_rendi:this.undrendimiento.value,
          jornada:this.jornada.value,
          id_usuario:this.id_user,
          tipo_proy:this.tipo_proy.value,
          fuente:this.fuentecrea,
          agrupacion:null,//this.padre.agrupacion,//verificar que pase el padre
          esgrupo:1,
          referencia:null,
          advceros:existeceros,
          seleccion:0,
          mostrar:1,
          icomost:1,
          ind:-1,
          ind2:-1,
        }
        let aux=[];
        aux.push(ejemplo);
        //agregar todo el detalle al arrsubpart, asignar un id al inicio
        for(let row of this.datasourcePriacu){
          row.id_partida=this.idprinc;
          this.arrsubpart.push(row);
        }
        this.modal.close({response:aux,donde:1,arrsubpart:this.arrsubpart})
        this.toaster.success('Se guardó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
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
  async ReemplazarIns(){
    try{
      if(this.fila_selacu>-1){
        let rowsel=this.datasourcePriacu[this.fila_selacu];
        if(rowsel.num_det==0){//agrupacion
          this.toaster.error('La fila seleccionada no se puede reemplazar','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
          return;
        }
        if(rowsel.esinsumo==1){//insumos
          this.mostrar_carga_todo = true;
          /* let insumos=await this.catalogosService.BuscarDataInsumos({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo});
          let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:0 })
          let indicesunif = await this.configuracionService.listarIndiceUnificados({ activo: 1 }) */
          let arrexisten=[]
          let filagru;
          for(let row of this.datasourcePriacu){
            if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det!=0){
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
          this.mostrar_carga_todo = false
          /* modalRef.componentInstance.insumos = insumos;
          modalRef.componentInstance.medidas = umedidas;
          modalRef.componentInstance.indices = indicesunif; */
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.reemplaza = true;
          modalRef.componentInstance.inpfuente = this.inpfuente;//catalogo usuario
          modalRef.componentInstance.rowfiltro=rowsel;
          const result = await modalRef.result
          if (result) {
            if (result.length > 0) {
              //calcular parcial
              let preciogru=0;
              if(result[0].tipo_insumo){
                rowsel.cuadrilla=0;
                for(let rowpri of this.datasourcePriacu){
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
                id_clasificacion:result[0].id_clasificacion,
                id_indice: result[0].id_indice,
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
              this.datasourcePriacu[this.fila_selacu]=agrega;
              let sumasinporc=this.Actparcialt1(this.datasourcePriacu[this.fila_selacu].id_tipo_insumo);
              this.actinsporc(this.datasourcePriacu[this.fila_selacu].id_tipo_insumo,sumasinporc,this.datasourcePriacu[this.fila_selacu].operador);
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
        for(let i=0;i<this.datasourcePriacu.length;i++){
          if(this.datasourcePriacu[i].seleccion==1){
            arrsel.push(this.datasourcePriacu[i]);
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
              tipoinsactporc=!(this.datasourcePriacu[arrindic[j]].operador)?this.datasourcePriacu[arrindic[j]].id_tipo_insumo:tipoinsactporc;
            }
            //si es subpartida, eliminar recursivamente de arrsubpartidas
            if(this.datasourcePriacu[arrindic[j]].esinsumo==0){
              let arrideli=[];
              arrideli.push(this.datasourcePriacu[arrindic[j]].id_subpartida)
              for(let m=0;m<this.arrsubpart.length;m++){//eliminar datos anteriores
                if(this.arrsubpart[m].id_partida==this.datasourcePriacu[arrindic[j]].id_subpartida){
                  if(this.arrsubpart[m].id_subpartida){
                    this.AddideliDetSubp(arrideli,this.arrsubpart[m].id_subpartida)
                    arrideli.push(this.arrsubpart[m].id_subpartida);
                  }
                }
              }
              for(let b=0;b<this.arrsubpart.length;b++){
                let exist=arrideli.find(ele=>ele==this.arrsubpart[b].id_partida)
                if(exist){
                  this.arrsubpart.splice(b,1);
                  b--;
                }
              }
            }
            //fin es subpartida
            for(let k=arrindic[j]+1;k<this.datasourcePriacu.length;k++){//actualizar nuevos num_det
              if(this.datasourcePriacu[k].id_tipo_insumo==arrsel[j].id_tipo_insumo){
                let newind=this.datasourcePriacu[k].num_det-1;
                this.datasourcePriacu[k].num_det=newind;
              }
              let indact=this.datasourcePriacu[k].ind;
              if(indact>arrsel[j].ind){//actualizar ind si es mayor al eliminado
                this.datasourcePriacu[k].ind=this.datasourcePriacu[k].ind-1;
              }
            }
            this.datasourcePriacu.splice(arrindic[j],1);
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
          if(this.datasourcePriacu[this.fila_selacu].num_det!=0){
            const respu=await SwalService.confirm('Esta seguro que desea Eliminar?','');
            if(!respu.isConfirmed){
              return;
            }
            let indpri=this.datasourcePriacu[this.fila_selacu].ind;
            let tipoinssel=this.datasourcePriacu[this.fila_selacu].id_tipo_insumo;
            let operadorsel=this.datasourcePriacu[this.fila_selacu].operador;
            //si es subpartida, eliminar recursivamente de arrsubpartidas
            if(this.datasourcePriacu[this.fila_selacu].esinsumo==0){
              let arrideli=[];
              arrideli.push(this.datasourcePriacu[this.fila_selacu].id_subpartida)
              for(let m=0;m<this.arrsubpart.length;m++){//eliminar datos anteriores
                if(this.arrsubpart[m].id_partida==this.datasourcePriacu[this.fila_selacu].id_subpartida){
                  if(this.arrsubpart[m].id_subpartida){
                    this.AddideliDetSubp(arrideli,this.arrsubpart[m].id_subpartida)
                    arrideli.push(this.arrsubpart[m].id_subpartida);
                  }
                }
              }
              for(let b=0;b<this.arrsubpart.length;b++){
                let exist=arrideli.find(ele=>ele==this.arrsubpart[b].id_partida)
                if(exist){
                  this.arrsubpart.splice(b,1);
                  b--;
                }
              }
            }
            for(let k=this.fila_selacu+1;k<this.datasourcePriacu.length;k++){//actualizar nuevos num_det
              if(this.datasourcePriacu[k].id_tipo_insumo==tipoinssel){
                let newind=this.datasourcePriacu[k].num_det-1;
                this.datasourcePriacu[k].num_det=newind;
              }
              let indact=this.datasourcePriacu[k].ind;
              if(indact>indpri){//actualizar ind si es mayor al eliminado
                this.datasourcePriacu[k].ind=this.datasourcePriacu[k].ind-1;
              }
            }
            this.datasourcePriacu.splice(this.fila_selacu,1);
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
    for(let m=0;m<this.arrsubpart.length;m++){//eliminar datos anteriores
      if(this.arrsubpart[m].id_partida==id_subpartida){
        if(this.arrsubpart[m].id_subpartida){
          this.AddideliDetSubp(arrideli,this.arrsubpart[m].id_subpartida)
          arrideli.push(this.arrsubpart[m].id_subpartida);
        }
      }
    }
  }
  SubirFilaIns(){
    if(this.colselacu){//seleccion multiple
      let arrsel=[];
      let arrindic=[];
      for(let i=0;i<this.datasourcePriacu.length;i++){
        if(this.datasourcePriacu[i].seleccion==1){
          arrsel.push(this.datasourcePriacu[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for(let j=0;j<arrsel.length;j++){
          let sube=this.datasourcePriacu[arrindic[j]];
          let baja=this.datasourcePriacu[arrindic[j]-1];
          if(baja.seleccion==0 && baja.num_det>0){
            sube.num_det=sube.num_det-1;
            baja.num_det=baja.num_det+1;;
            this.datasourcePriacu[arrindic[j]]=baja;
            this.datasourcePriacu[arrindic[j]-1]=sube;
          }
        }
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else{
      if(this.fila_selacu>-1){
        let sube=this.datasourcePriacu[this.fila_selacu];
        let baja=this.datasourcePriacu[this.fila_selacu-1];
        if(sube.num_det!=0){
          if(baja.num_det!=0){
            sube.num_det=sube.num_det-1;
            baja.num_det=baja.num_det+1;;
            this.datasourcePriacu[this.fila_selacu]=baja;
            this.datasourcePriacu[this.fila_selacu-1]=sube;
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
        this.toaster.error('Seleccione una fila para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
  }
  BajarFilaIns(){
    if(this.colselacu){//seleccion multiple
      let arrsel=[];
      let arrindic=[];
      for(let i=0;i<this.datasourcePriacu.length;i++){
        if(this.datasourcePriacu[i].seleccion==1){
          arrsel.push(this.datasourcePriacu[i]);
          arrindic.push(i);
        }
      }
      if(arrsel.length>0){
        for(let j=arrsel.length-1;j>=0;j--){
          let sube=this.datasourcePriacu[arrindic[j]+1];
          let baja=this.datasourcePriacu[arrindic[j]];
          if(sube.seleccion==0 && sube.num_det>0){
            sube.num_det=sube.num_det-1;
            baja.num_det=baja.num_det+1;
            this.datasourcePriacu[arrindic[j]]=sube;
            this.datasourcePriacu[arrindic[j]+1]=baja;
          }
        }
      }
      else{
        this.toaster.error('Seleccione filas para mover.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 });
      }
    }
    else{
      if(this.fila_selacu>-1){
        if(this.fila_selacu<this.datasourcePriacu.length-1){
          let sube=this.datasourcePriacu[this.fila_selacu+1];
          let baja=this.datasourcePriacu[this.fila_selacu];
          if(baja.num_det!=0){
            if(sube.num_det!=0){
              sube.num_det=sube.num_det-1;
              baja.num_det=baja.num_det+1;;
              this.datasourcePriacu[this.fila_selacu]=sube;
              this.datasourcePriacu[this.fila_selacu+1]=baja;
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
      else{
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
        for(let row2 of this.datasourcePriacu){
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
    for(let row of this.datasourcePriacu){
      row.seleccion=0;
    }
  }
  AgregarFilaBut(){
    if(this.fila_selacu>-1){
      let rowsel=this.datasourcePriacu[this.fila_selacu];
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
        let rowsel=this.datasourcePriacu[this.fila_selacu];
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
          for(let row of this.datasourcePriacu){
            if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det!=0){
              arrexisten.push(row);
            }
            else if(row.id_tipo_insumo==rowsel.id_tipo_insumo && row.num_det==0){
              filagru=row;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
          this.mostrar_carga_todo = false
          /* modalRef.componentInstance.insumos = insumos;
          modalRef.componentInstance.medidas = umedidas;
          modalRef.componentInstance.indices = indicesunif; */
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion;//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.inpfuente = this.inpfuente;//catalogo usuario
          modalRef.componentInstance.afcuad=rowsel.afcuadrilla;
          modalRef.componentInstance.mask_cant=this.mask_cant;
          modalRef.componentInstance.dec_cant=this.dec_cant;
          modalRef.componentInstance.acuAct=JSON.parse(JSON.stringify(this.datasourcePriacu));
          const result = await modalRef.result
          if (result) {
            if (result.length > 0) {
              let admitidos = []
              for (let filaadd of result) {
                let existe = false;
                for (let i = 0; i < this.datasourcePriacu.length; i++) {
                  if (this.datasourcePriacu[i].id_tipo_insumo == filaadd.id_tipo_insumo && this.datasourcePriacu[i].id_insumo == filaadd.id_insumo) {
                    existe = true;
                  }
                }
                if (!existe) {
                  admitidos.push(filaadd);
                }
              }
              this.procesando=true;
              let indins=0;
              let nuevnumdet=0;
              if(donde==0){
                for(let i=0;i<this.datasourcePriacu.length;i++){
                  if (this.datasourcePriacu[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.datasourcePriacu[i].num_det==0) {
                    indins=i+1;
                    nuevnumdet=1;
                  }
                  else{
                    if(this.datasourcePriacu[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.datasourcePriacu[i].num_det!=0){
                      this.datasourcePriacu[i].num_det=Number(this.datasourcePriacu[i].num_det)+admitidos.length;
                    }
                  }
                }
              }
              else{
                let indbusq=donde==3?this.fila_selacu+1:this.fila_selacu;
                indins=donde==3?this.fila_selacu+1:this.fila_selacu;
                nuevnumdet=donde==3?Number(this.datasourcePriacu[this.fila_selacu].num_det)+1:Number(this.datasourcePriacu[this.fila_selacu].num_det);
                for (let i = indbusq; i < this.datasourcePriacu.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                  if (this.datasourcePriacu[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                    if(donde!=1){
                      this.datasourcePriacu[i].num_det=Number(this.datasourcePriacu[i].num_det)+admitidos.length;
                    }
                  }
                  else{
                    if(donde==1){
                      indins=i;
                      nuevnumdet=Number(this.datasourcePriacu[i - 1].num_det) + 1;
                      break;
                    }
                  }
                }
              }
              let nronuevo=donde==0?1:nuevnumdet;
              for (let filaadd of admitidos) {
                let preciogru=0;
                if(filaadd.tipo_insumo){
                  for(let rowpri of this.datasourcePriacu){
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
                  id_partida: this.datasourcePriacu[this.fila_selacu].id_partida,
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
                  id_clasificacion:filaadd.id_clasificacion,
                  id_indice: filaadd.id_indice,
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
                  ind:this.datasourcePriacu.length,
                  seleccion:0,
                  afectaref:null,
                };
                this.datasourcePriacu.splice(indins,0,agrega);
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
                  let indexis=this.datasourcePriacu.find(elem=> elem.id_insumo==rowauto.id_insumo);
                  if(!indexis){
                    let preciogru=0;
                    let indagre=-1;
                    let numdetadd=-1;
                    let existipo=false;
                    for(let im=0;im<this.datasourcePriacu.length;im++){
                      if(this.datasourcePriacu[im].num_det>0 && this.datasourcePriacu[im].id_tipo_insumo==rowauto.tipo_insumo && this.datasourcePriacu[im].operador==null){
                        preciogru+=Number(this.datasourcePriacu[im].parcial);
                      }
                      if(!existipo && this.datasourcePriacu[im].id_tipo_insumo==rowauto.id_tipo_insumo){
                        existipo=true;
                      }
                      if(existipo && this.datasourcePriacu[im].id_tipo_insumo!=rowauto.id_tipo_insumo && indagre==-1){
                        numdetadd=(Number(this.datasourcePriacu[im-1].num_det))+1;
                        indagre=im;
                      }
                    }
                    let agrega:rowinsumo = {
                      id_partida: this.datasourcePriacu[this.fila_selacu].id_partida,
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
                      id_clasificacion:rowauto.id_clasificacion,
                      id_indice: rowauto.id_indice,
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
                      ind:this.datasourcePriacu.length,
                      seleccion:0,
                      afectaref:null,
                    };
                    this.datasourcePriacu.splice(indagre,0,agrega);
                  }
                }
              }
              this.procesando=false;
              //calcular todales de la agrupacion y afectar a los porcentajes para calcular el total de toda la partida
              let sumasinporc=this.Actparcialt1(rowsel.id_tipo_insumo)
              this.actinsporc(rowsel.id_tipo_insumo,sumasinporc,rowsel.operador);
            }
          }
        }
        else{//subpartidas
          this.mostrar_carga_todo = true
          let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.id_user,fuente:this.fuentecrea, tipo_proy: this.tipoproysel,idpadre:this.partidacondiciona?.id_partida??'',restriccion:this.partidacondiciona?.referencia??'' });//cambiar dinamico tipo_proy
          const modalRef = this.modalService.open(BusqpartcatComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
          modalRef.componentInstance.partidacondiciona=this.partidacondiciona;
          modalRef.componentInstance.partidas = rpartidas;
          modalRef.componentInstance.subpartida = true;
          modalRef.componentInstance.tipoProy=this.tipoProy;//cargar los tipos de proyecto
          modalRef.componentInstance.tipoproysel=this.tipo_proy.value;//cargar los tipos de proyecto
          modalRef.componentInstance.fuentecrea=this.fuentecrea;
          modalRef.componentInstance.fondo=this.fondo;
          modalRef.componentInstance.color=this.color;
          modalRef.componentInstance.letra=this.letra;
          modalRef.componentInstance.medidas=this.medidas;
          modalRef.componentInstance.inpfuente = this.inpfuente;
          //modalRef.componentInstance.ultidpart=this.ultidpart;
          this.mostrar_carga_todo = false
          const result = await modalRef.result
          if (result.response) {
            let admitidos=[];
            let titsubtitulos=0;
            for(let filaadd of result.response){
              if(filaadd.esgrupo==1){
                let existe=false;
                for(let i=0;i<this.datasourcePriacu.length;i++){
                  if(this.datasourcePriacu[i].esinsumo == 0 && filaadd.esgrupo==1 && this.datasourcePriacu[i].descripcion==filaadd.descripcion){
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
            this.procesando=true;
            let indins=0;
            let nuevnumdet=0;
            if(donde==0){
              for(let i=0;i<this.datasourcePriacu.length;i++){
                if (this.datasourcePriacu[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.datasourcePriacu[i].num_det==0) {
                  indins=i+1;
                  nuevnumdet=1;
                }
                else{
                  if(this.datasourcePriacu[i].id_tipo_insumo == rowsel.id_tipo_insumo && this.datasourcePriacu[i].num_det!=0){
                    this.datasourcePriacu[i].num_det=Number(this.datasourcePriacu[i].num_det)+admitidos.length;
                  }
                }
              }
            }
            else{
              let indbusq=donde==3?this.fila_selacu+1:this.fila_selacu;
              indins=donde==3?this.fila_selacu+1:this.fila_selacu;
              nuevnumdet=donde==3?Number(this.datasourcePriacu[this.fila_selacu].num_det)+1:Number(this.datasourcePriacu[this.fila_selacu].num_det);
              let tienecont=false;
              for (let i = indbusq; i < this.datasourcePriacu.length; i++) {//buscar indice inicial y cambiar el numdet del resto
                if (this.datasourcePriacu[i].id_tipo_insumo == rowsel.id_tipo_insumo) {
                  if(donde!=1){
                    this.datasourcePriacu[i].num_det=Number(this.datasourcePriacu[i].num_det)+admitidos.length;
                  }
                }
              }
              if(!tienecont && donde==1){
                indins=this.datasourcePriacu.length;
                nuevnumdet=this.datasourcePriacu[this.datasourcePriacu.length-1].num_det+1;
              }
            }
            let nronuevo=donde==0?1:nuevnumdet;
            for(let filaadd of admitidos){
              let newidpart=this.ultidpart++;
              let agrega:rowinsumo={
                id_partida:this.datasourcePriacu[this.fila_selacu].id_partida,
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
                id_clasificacion:null,
                id_indice:null,
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
                ind:this.datasourcePriacu.length,
                afectaref:1,
                seleccion:0
              };
              this.datasourcePriacu.splice(indins,0,agrega);
              indins++;
              //agregar detalle de filas admitidas, tambien recuperar de bd si es de catalogo
              if(result.donde==0){
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
                    this.arrsubpart.push(filacop);//dar formato de bd
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
                    this.arrsubpart.push(filacop);//dar formato de bd?
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
      let filacop=JSON.parse(JSON.stringify(fil2))
      if(filacop.id_partida==id_subp){
        filacop.id_partida=newid;
        if(filacop.id_subpartida){
          let newsubp=this.ultidpart++;
          this.cargarSubpartidas(datos,filacop.id_subpartida,newsubp);
          filacop.id_subpartida=newsubp;
        }
        this.arrsubpart.push(filacop);
      }
    }
  }
  async OpenSubpartida(row,indice){
    if(this.formDataPartida.enabled){
      let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:1 })
      let arraux=[];
      for(let fila1 of this.arrsubpart){
        if(fila1.id_partida==row.id_subpartida){
          arraux.push(JSON.parse(JSON.stringify(fila1)));
        }
      }
      const modalRef = this.modalService.open(ModalSubpartidaComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
      modalRef.componentInstance.Arreglosubp = this.arrsubpart;//detallepartida[1];
      modalRef.componentInstance.detallepartida = arraux;
      modalRef.componentInstance.partida = row;
      //modalRef.componentInstance.row =  row
      modalRef.componentInstance.tipoProy= this.tipoProy
      modalRef.componentInstance.tipoproysel=this.tipo_proy.value;//cargar los tipos de proyecto
      modalRef.componentInstance.medidas= umedidas
      modalRef.componentInstance.fondo = this.fondo;
      modalRef.componentInstance.color = this.color;
      modalRef.componentInstance.letra = this.letra;
      modalRef.componentInstance.dec_cant = this.dec_cant
      modalRef.componentInstance.mask_cant =  this.mask_cant
      modalRef.componentInstance.dec_precio =  this.dec_precio
      modalRef.componentInstance.mask_precio =  this.mask_precio
      modalRef.componentInstance.inpfuente = this.inpfuente;//catalogo usuario
      modalRef.componentInstance.ultidpart=this.ultidpart;
      const result = await modalRef.result
      this.ultidpart=result.ultid;
      if (result.cargadet) {
        //const detalleSubpartida = await this.catalogosService.DatosPartidaCatalog({id_partida:row.id_subpartida});
        //if(detalleSubpartida?.length>0){
          for(let i=0;i<this.datasourcePriacu.length;i++){
            if(this.datasourcePriacu[i].id_subpartida == row.id_subpartida){
              //this.datasourcePriacu[i].descripcion = detalleSubpartida[0].descripcion
              //this.datasourcePriacu[i].unidad = detalleSubpartida[0].unidad
              //this.datasourcePriacu[i].precio = detalleSubpartida[0].precio
              var aprecio = Number(this.datasourcePriacu[i].precio);
              const valor = this.datasourcePriacu[i].cantidad
              this.datasourcePriacu[i].parcial=this.formsService.redondeo((valor * aprecio), this.dec_precio);
              this.Actparcialt1(this.datasourcePriacu[i].id_tipo_insumo)
              this.actualizarParcGrupos();
            }
          }
        //}
      }
    }
    else{
      this.toaster.error('Habilitar edicion de Costos Unitarios.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
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
  Anumero(val:any){
    return Number(val);
  }
}
