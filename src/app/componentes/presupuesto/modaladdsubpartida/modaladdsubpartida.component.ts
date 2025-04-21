import { Component, OnInit, Input, HostListener,ChangeDetectorRef } from '@angular/core';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BuscarinsumoComponent } from '../../catalogos/catpartidas/buscarinsumo/buscarinsumo.component';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { BuscaaddunidadmedComponent } from '../../catalogos/unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { ModversubplecturaComponent } from '../modversubplectura/modversubplectura.component';

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
  indice:any;
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
  id_clasificacion:any;
  desc_clasi:any;
  id_insumo: any;
  id_subpartida:any;
  esinsumo:any;
  afcuadrilla:any;
  rendimiento:any;
  und_rendi:any;
  jornada:any;
  advceros:any;
  referencia:any;
  icomost:any;
  mostrar:any;
  editar:any;
  editar2:any;
  ind:any;
  //afectaref:any;  
  indice:any;
  indice_subp:any;
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
  selector: 'app-modaladdsubpartida',
  templateUrl: './modaladdsubpartida.component.html',
  styleUrls: ['./modaladdsubpartida.component.scss']
})
export class ModaladdsubpartidaComponent implements OnInit {
  @Input('height') height: number = 100;
  @Input() moneda='S/';
  @Input() id_user;
  paddingscroll=17;
  paddingscroll1=17;
  paddingscroll2 = 17;
  mostrar_carga_todo: boolean = false;
  busqueda = '';
  active = 1;
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
  @Input() arrsubptemp;
  @Input() tablaacu=[];
  @Input() tablaact=[];
  @Input() tablaactacu=[];
  @Input() tablaactsub=[];
  @Input() subpartact=[];
  tiposel='';
  fuentesel=0;
  nomtabsel='';
  datasourcePri:rowpartida[];
  fila_sel:any;
  id_nwpart=1;
  arrsubpt=[];
  tipopart='0';
  datasourceAct=[];
  fila_sel3:any;
  busqueda3 = '';
  buscando3=false;
  //variables opciones vista codigo
  mcodigo=true;
  codsoloiu=false;
  colselacu=false;
  idgruselacu=null;
  editarpreins=false;
  editajor=false;
  minimbut=false;
  //nuevo
  formDataPartida = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    unidad: new UntypedFormControl('', [Validators.required]),
    precio: new UntypedFormControl('0.00', [Validators.required, Validators.min(0)]),
    rendimiento: new UntypedFormControl('1.00', []),
    undrendimiento: new UntypedFormControl('DIA', []),
    jornada: new UntypedFormControl('8', []),
    id_usuario: new UntypedFormControl('', []),
    //tipo_proy: new FormControl('', [Validators.required]),
    // agrupacion: new FormControl('', [Validators.required]),
  })
  get descripcion(): UntypedFormControl { return this.formDataPartida.get('descripcion') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formDataPartida.get('unidad') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.formDataPartida.get('precio') as UntypedFormControl }
  get rendimiento(): UntypedFormControl { return this.formDataPartida.get('rendimiento') as UntypedFormControl }
  get undrendimiento(): UntypedFormControl { return this.formDataPartida.get('undrendimiento') as UntypedFormControl }
  get jornada(): UntypedFormControl { return this.formDataPartida.get('jornada') as UntypedFormControl }
  get id_usuario(): UntypedFormControl { return this.formDataPartida.get('id_usuario') as UntypedFormControl }
  //get tipo_proy(): FormControl { return this.formDataPartida.get('tipo_proy') as FormControl }
  //get agrupacion(): FormControl { return this.formDataPartida.get('agrupacion') as FormControl }
  displayedColumnacu: string[] = ['num_det', 'descripcion', 'unidad','cuadrilla', 'cantidad', 'precio', 'parcial', 'acciones'];
  displayedColumnFooter: string[] = ['precio_total', 'monto', 'acciones']
  /* dataSourceacu = []; */
  datasourcePriacu=[];
  fila_selacu: any;
  @Input() medidas: unidadmed[] = [];
  /* filteredOptions: Observable<unidadmed[]>; */
  undconcatrendi = '';
  @Input() dec_precio=2;
  @Input() mask_precio='0.2';
  @Input() dec_cant=4;
  @Input() mask_cant='0.4';
  padre:any;

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
    var resto = 210;
    this.height = window.innerHeight - resto;
    this.minimbut=document.body.clientWidth <= 991?true:false;
    this.tiposel=this.tipoproysel;
    //this.tipo_proy.setValue(this.tipoproysel);
    this.datasourcePri=this.partidas;
    this.datasourceAct=this.tablaact;
    this.nomtabsel="tab1";
    this.id_user=this.id_user??this._EncriptadorService.recuperarlocalstory('idusuario');
    let detallespart = await this.catalogosService.ListarDetalleDataPartidas({ id_partida: '0' });
    this.datasourcePriacu=detallespart.length>0?detallespart[0]:[];
    this.undrendimiento.disable();
    this.jornada.disable();
    const fileUpload = document.getElementById("fuenteselect") as HTMLSelectElement;
    fileUpload.value=this.fuentecrea;
    document.getElementById('inpbusq')?.focus();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.height = window.innerHeight - 200;
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
  async CargarSubpartidasAct(subpartidas,indicepadre){
    for(let rowsubp of subpartidas){
      if(rowsubp.indice==indicepadre){
        this.arrsubpt.push(rowsubp);
        if(rowsubp.indice_subp){
          await this.CargarSubpartidasAct(subpartidas,rowsubp.indice_subp);
        }
      }
    }
  }
  seleccionar(){
    if(this.nomtabsel=='tab1'){
      let cont=0;
      let aux=[];
      for(let i=0;i<this.datasourcePri.length;i++){
        if(this.datasourcePri[i].seleccion==1){
          cont++;
          aux.push(this.datasourcePri[i])
        }
      }
      if(cont>0){
        let objretorna={ partidas:aux, subpartidas:this.arrsubpt, forma:1 };
        this.modal.close(objretorna)
      }
      else{
        this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
    else{
      let cont=0;
      let aux=[];
      for(let i=0;i<this.datasourceAct.length;i++){
        if(this.datasourceAct[i].seleccion==1 && this.datasourceAct[i].unidad!=''){
          cont++;
          aux.push(this.datasourceAct[i])
        }
      }
      if(cont>0){
        for(let filas of aux){
          if(this.tipopart=='0'){
            for(let row of this.tablaactacu){
              if(row.indice==filas.indice){
                this.arrsubpt.push(row)
                if(row.num_det>0 && row.esinsumo==0){//cargar datos de subpartida recursivamente
                  this.CargarSubpartidasAct(this.tablaactsub,row.indice_subp);
                }
              }
            }
          }
          else{
            this.CargarSubpartidasAct(this.tablaactsub,filas.indice_subp);
          }
        }
        let objretorna={ partidas:aux, subpartidas:this.arrsubpt, tipopart:this.tipopart, forma:2 };
        this.modal.close(objretorna)
      }
      else{
        this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
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
    this.modal.close(null)
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
  caneditarceldat1(eve: any, ind2: any) {//cantidad
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
  caneditarceldat2(eve: any, ind2: any) {//cuadrilla
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
  async caneditarceldat3(eve: any, ind2: any) {//precio
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
      //const tabla1 = JSON.stringify(this.datasourcePriacu);
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
      this.mostrar_carga_todo = false
      let ejemplo:rowpartida={
        id_partida: null,
        descripcion: this.descripcion.value.toUpperCase(),
        id_unidad:this.unidad.value,
        unidad: undsel.unidad.toUpperCase(),
        precio:this.precio.value,
        rendimiento:this.rendimiento.value,
        und_rendi:this.undrendimiento.value,
        jornada:this.jornada.value,
        id_usuario:this.id_user,
        tipo_proy:this.tipoproysel,
        fuente:1,
        agrupacion:null,//verificar que pase el padre
        esgrupo:1,
        referencia:null,
        advceros:existeceros,
        indice:0,
        seleccion:0,
        mostrar:1,
        icomost:1,
        ind:-1,
        ind2:-1,
      }
      for(let row of this.datasourcePriacu){
        row.indice=0;
        row.indicesubp=row.indicesubp?row.indicesubp:null;
        this.arrsubpt.push(row)
      }
      let aux=[];
      aux.push(ejemplo);
      let objretorna={
        partidas:aux,
        subpartidas:this.arrsubpt,
        forma:3,
        tipopart:'0',
      };
      this.modal.close(objretorna)
      this.toaster.success('Se agregó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
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
          modalRef.componentInstance.inpfuente=1;
          modalRef.componentInstance.tablaacu=this.tablaacu;
          modalRef.componentInstance.rowfiltro=rowsel;
          modalRef.componentInstance.moneda=this.moneda;
          modalRef.componentInstance.iduser=this.id_user;
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
                codigo:result[0].codigo=='' || result[0].codigo==null?null:result[0].codigo,
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
                desc_clasi:result[0].desc_clasi,
                id_indice: result[0].id_indice,
                id_subpartida: null,
                esinsumo:rowsel.esinsumo,
                afcuadrilla:rowsel.afcuadrilla,
                rendimiento:null,
                und_rendi:null,
                jornada:null,
                advceros:result[0].advceros,
                referencia:result[0].referencia,
                icomost: '1',
                mostrar: rowsel.icomost == '1' ? '1' : '0',
                editar: 0,
                editar2:0,
                ind:rowsel.ind,
                seleccion:0,
                //afectaref:null,
                indice:0,//debe tener indice para vincular?
                indice_subp:null
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
          modalRef.componentInstance.inpfuente=1;
          modalRef.componentInstance.afcuad=rowsel.afcuadrilla;
          modalRef.componentInstance.mask_cant=this.mask_cant;
          modalRef.componentInstance.dec_cant=this.dec_cant;
          modalRef.componentInstance.tablaacu=this.tablaacu;
          modalRef.componentInstance.moneda=this.moneda;
          modalRef.componentInstance.iduser=this.id_user;
          modalRef.componentInstance.acuAct=JSON.parse(JSON.stringify(this.datasourcePriacu));
          const result = await modalRef.result
          if (result) {
            if (result.length > 0) {
              let admitidos = []
              for (let filaadd of result) {
                let existe = false;
                for (let i = 0; i < this.datasourcePriacu.length; i++) {
                  if (this.datasourcePriacu[i].id_tipo_insumo == filaadd.id_tipo_insumo && this.datasourcePriacu[i].descripcion == filaadd.descripcion) {
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
                  codigo:filaadd.codigo=='' || filaadd.codigo==null?null:filaadd.codigo,
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
                  desc_clasi:filaadd.desc_clasi,
                  id_indice: filaadd.id_indice,
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
                  seleccion:0,
                  //afectaref:null,
                  indice:0,//debe tener indice para vincular?
                  indice_subp:null
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
                      codigo:rowauto.codigo=='' || rowauto.codigo==null?null:rowauto.codigo,
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
                      desc_clasi:rowauto.desc_clasi,
                      id_indice: rowauto.id_indice,
                      id_subpartida: null,
                      esinsumo:rowsel.esinsumo,
                      afcuadrilla:rowsel.afcuadrilla,
                      rendimiento:null,
                      und_rendi:null,
                      jornada:null,
                      advceros:rowauto.advceros,
                      referencia:rowauto.referencia,
                      //afectaref:null,
                      icomost: '1',
                      mostrar: rowsel.icomost == '1' ? '1' : '0',
                      editar: 0,
                      editar2:0,
                      ind:this.datasourcePriacu.length,
                      seleccion:0,
                      //afectaref:null,
                      indice:0,//debe tener indice para vincular?
                      indice_subp:null
                    };
                    this.datasourcePriacu.splice(indagre,0,agrega);
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
          let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.id_user,fuente:this.fuentecrea, tipo_proy: this.tipoproysel,idpadre:this.datasourcePriacu[this.fila_selacu].id_partida??'',restriccion:this.datasourcePriacu[this.fila_selacu].referencia??'' });//cambiar dinamico tipo_proy
          const modalRef = this.modalService.open(ModaladdsubpartidaComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
          modalRef.componentInstance.partidacondiciona=this.datasourcePriacu[this.fila_selacu];
          modalRef.componentInstance.partidas = rpartidas;
          modalRef.componentInstance.subpartida = true;
          modalRef.componentInstance.tipoProy=this.tipoProy;//cargar los tipos de proyecto
          modalRef.componentInstance.tipoproysel=this.tipoproysel;//cargar los tipos de proyecto
          //modalRef.componentInstance.fuentecrea=this.fuentecrea;
          modalRef.componentInstance.fondo=this.fondo;
          modalRef.componentInstance.color=this.color;
          modalRef.componentInstance.letra=this.letra;
          modalRef.componentInstance.medidas=this.medidas;
          modalRef.componentInstance.fuentecrea=this.fuentecrea;
          modalRef.componentInstance.dec_cant=this.dec_cant;
          modalRef.componentInstance.mask_cant=this.mask_cant;
          modalRef.componentInstance.dec_precio=this.dec_precio;
          modalRef.componentInstance.mask_precio=this.mask_precio;
          modalRef.componentInstance.tablaacu=this.tablaacu;
          modalRef.componentInstance.tablaact=JSON.parse(JSON.stringify(this.tablaact));
          modalRef.componentInstance.tablaactacu=JSON.parse(JSON.stringify(this.tablaactacu));
          modalRef.componentInstance.tablaactsub=JSON.parse(JSON.stringify(this.tablaactsub));
          modalRef.componentInstance.subpartact=JSON.parse(JSON.stringify(arrosubp));
          modalRef.componentInstance.moneda=this.moneda;
          modalRef.componentInstance.id_user=this.id_user;
          this.mostrar_carga_todo = false
          const result = await modalRef.result
          if (result) {
            this.mostrar_carga_todo=true;
            let admitidos=[];
            let titsubtitulos=0;
            if(result.forma==2){//del mismo proyecto
              for(let filaadd of result.partidas){
                let existe=false;
                for(let i=0;i<this.datasourcePriacu.length;i++){
                  //comparar si permite la referencia , ya se filtro antes de agregar
                  if(this.datasourcePriacu[i].esinsumo == 0 && (filaadd.id_partida && this.datasourcePriacu[i].id_subpartida==filaadd.id_partida)){
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
                  for(let i=0;i<this.datasourcePriacu.length;i++){
                    if(this.datasourcePriacu[i].esinsumo == 0 && filaadd.esgrupo==1 && (filaadd.id_partida && this.datasourcePriacu[i].id_subpartida==filaadd.id_partida)){
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
              //cargar detalles de subpartidas
              let indadd=this.id_nwpart++;
              let totpart;
              //if(filaadd && filaadd.id_partida && filaadd.id_partida!=''){//buscar en bd y agregar a la tabla arrsubpt
              if(result.forma==1){
                let tabdet=await this.catalogosService.ListarDetalleDataPartidas({ id_partida: filaadd.id_partida });
                let arrdet=tabdet.length>0?tabdet[0]:[];
                let arrsub=tabdet.length>0?tabdet[1]:[];
                let arraux=[];
                arraux=arrdet.concat(arrsub);
                totpart=await this.CargarDetalleSubpartida(arraux,filaadd,filaadd.id_partida,indadd,null);//referencia debe ser null?
              }
              else{//cargar arreglo de supbartidas
                await this.CargarSubpartidasResult(result.subpartidas,indadd,result.tipopart=='0'?filaadd.indice:filaadd.indice_subp);
              }
              let agrega:rowinsumo={
                id_partida:this.datasourcePriacu[this.fila_selacu].id_partida,
                num_det:nronuevo++,
                codigo:filaadd.codigo=='' || filaadd.codigo==null?null:filaadd.codigo,
                descripcion:filaadd.descripcion,
                id_unidad:filaadd.id_unidad,
                unidad:filaadd.unidad,
                operador:null,
                tipo_insumo:null,
                cuadrilla:0,
                cantidad:0,
                precio:totpart?this.formsService.redondeo(totpart,this.dec_precio):filaadd.precio,
                parcial:0,
                id_tipo_insumo:rowsel.id_tipo_insumo,
                id_insumo:null,
                id_clasificacion:filaadd.id_clasificacion,
                desc_clasi:filaadd.desc_clasi,
                id_indice:null,
                id_subpartida:filaadd.id_subpartida,
                esinsumo:rowsel.esinsumo,
                afcuadrilla:0,
                rendimiento:filaadd.rendimiento,
                und_rendi:filaadd.und_rendi,
                jornada:filaadd.jornada,
                advceros:filaadd.advceros,
                referencia:filaadd.referencia,
                icomost:'1',
                mostrar:rowsel.icomost=='1'?'1':'0',
                editar:0,
                editar2:0,
                ind:this.datasourcePriacu.length,
                //afectaref:1,
                seleccion:0,
                indice:0,//debe tener indice para vincular?
                indice_subp:indadd
              };
              this.datasourcePriacu.splice(indins,0,agrega);
              indins++;
            }
            this.mostrar_carga_todo=false;
            this.fila_selacu=(donde==0 && rowsel.num_det!=0) || donde==2?this.fila_selacu+admitidos.length:this.fila_selacu;
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
  async CargarSubpartidasResult(subpartidas,indicepadre,indicesubp){
    for(let rowsubp of subpartidas){
      if(rowsubp.indice==indicesubp){
        let indaddsubp;
        if(rowsubp.indice_subp){
          indaddsubp=this.id_nwpart++;
        }
        let agrega:rowinsumo={
          id_partida:rowsubp.id_partida,
          num_det:rowsubp.num_det,
          codigo:rowsubp.codigo=='' || rowsubp.codigo==null?null:rowsubp.codigo,
          descripcion:rowsubp.descripcion,
          id_unidad:rowsubp.id_unidad,
          unidad:rowsubp.unidad,
          operador:rowsubp.operador,
          tipo_insumo:rowsubp.tipo_insumo,
          cuadrilla:rowsubp.cuadrilla,
          cantidad:rowsubp.cantidad,
          precio:rowsubp.precio,
          parcial:rowsubp.parcial,
          id_tipo_insumo:rowsubp.id_tipo_insumo,
          id_clasificacion:rowsubp.id_clasificacion,
          desc_clasi:rowsubp.desc_clasi,
          id_insumo:rowsubp.id_insumo,
          id_indice:rowsubp.id_indice,
          id_subpartida:rowsubp.id_subpartida,
          indice:indicepadre,//debe tener indice para vincular?
          indice_subp:indaddsubp?indaddsubp:null,
          esinsumo:rowsubp.esinsumo,
          afcuadrilla:rowsubp.afcuadrilla,
          rendimiento:rowsubp.rendimiento,
          und_rendi:rowsubp.und_rendi,
          jornada:rowsubp.jornada,
          advceros:rowsubp.advceros,
          referencia:rowsubp.referencia,
          icomost:'1',
          mostrar:rowsubp.icomost=='1'?'1':'0',
          editar:0,
          editar2:0,
          ind:this.datasourcePriacu.length,
          //afectaref:1,
          seleccion:0,
        };
        this.arrsubpt.push(agrega);
        if(rowsubp.indice_subp){//si es subpartidas, agregar su detalle
          await this.CargarSubpartidasResult(subpartidas,indaddsubp,rowsubp.indice_subp);
        }
      }
    }
  }
  async CargarDetalleSubpartida(detsubp:any,fillaadd:any,id_partida:any,newindice:any,refer:any){
    let detpart = [];
    let tablabusq=JSON.parse(JSON.stringify(detsubp));
    for(let fila1 of tablabusq){
      if(fila1.id_partida==id_partida){
        detpart.push(fila1);
      }
    }
    let sumapsubp=0;
    //actualiza primero los que no son porcentajes y actualizar totales(sinporc)?, actualizar los porcentajes con los totales(sinporc), actualizar totales final
    let indgru=-1;
    let sumgru=0;
    for(let m=0;m<detpart.length;m++){
      if(detpart[m].num_det==0){
        if(indgru!=-1){
          detpart[indgru].parcial=this.formsService.redondeo(sumgru,this.dec_precio);
        }
        indgru=m;
        //actgru=this.tablaacusel[i];
        sumgru=0;
      }
      else{
        let sumasubp=0;
        if(detpart[m].esinsumo==0 && detpart[m].num_det>0){//condicionar con id_partida!=null o agregar directamente detalle cuando se agrega la subpartida
          let indicedet=this.id_nwpart++;
          sumasubp=await this.CargarDetalleSubpartida(detsubp,detpart[m],detpart[m].id_subpartida,indicedet,refer);//se debe pasar subpartida
          detpart[m].indice_subp=indicedet;
        }
        let cantaux;
        if(detpart[m].operador=='%'){
          cantaux=this.formsService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
          detpart[m].precio=0;
        }
        else{
          if(detpart[m].afcuadrilla==1){
            var canti=Number(fillaadd.rendimiento)==0?Number(detpart[m].cantidad):(Number(detpart[m].cuadrilla)*Number(fillaadd.jornada))/Number(fillaadd.rendimiento);
            cantaux=this.formsService.redondeo(Number(canti),this.dec_cant);//se calcula, en el caso de afcuadrilla
          }else{
            cantaux=this.formsService.redondeo(Number(detpart[m].cantidad),this.dec_cant);
          }
        }
        detpart[m].cantidad=cantaux;
        let precioaux=detpart[m].esinsumo==0 && detpart[m].num_det>0?this.formsService.redondeo(sumasubp,this.dec_precio):this.formsService.redondeo(Number(detpart[m].precio),this.dec_precio);
        detpart[m].precio=precioaux;
        let nparc=Number(cantaux)*Number(precioaux);
        detpart[m].parcial=this.formsService.redondeo(nparc,this.dec_precio);
        sumgru+=Number(nparc);
      }
    }
    if(indgru!=-1){
      detpart[indgru].parcial=this.formsService.redondeo(sumgru,this.dec_precio);
    }
    let arrcambparc=[];
    //calcular porcentajes
    for(let n=0;n<detpart.length;n++){
      if(detpart[n].operador=='%'){
        let exind=-1;
        for(let k=0;k<detpart.length;k++){
          if(detpart[k].id_tipo_insumo==detpart[n].tipo_insumo && detpart[k].num_det===0){
            exind=k;
            break;
          }
        }
        if(exind>-1){
          detpart[n].precio=this.formsService.redondeo(Number(detpart[exind].parcial),this.dec_precio);
          detpart[n].parcial=this.formsService.redondeo((Number(detpart[n].cantidad)*Number(detpart[n].precio))/100,this.dec_precio);
          arrcambparc.push({tipo:detpart[n].id_tipo_insumo,parcial:detpart[n].parcial})
        }
      }
    }
    for(let rowaux of detpart){
      if(rowaux.num_det==0){
        for(let x=0;x<arrcambparc.length;x++){
          if(arrcambparc[x].tipo==rowaux.id_tipo_insumo){
            rowaux.parcial=Number(arrcambparc[x].parcial)+Number(rowaux.parcial);
          }
        }
      }
    }
    for(let a=0;a<detpart.length;a++){
      //verificar si es subpartida y llamar a metodo que cargue subpartidas, consultar bd
      let filaaux:rowinsumo={
        id_partida:detpart[a].id_partida==''?null:detpart[a].id_partida,
        id_tipo_insumo:Number(detpart[a].id_tipo_insumo),
        num_det:detpart[a].num_det,
        codigo:detpart[a].codigo=='' || detpart[a].codigo==null?null:detpart[a].codigo,
        descripcion:detpart[a].descripcion,
        id_unidad:detpart[a].id_unidad,
        unidad:detpart[a].unidad,
        operador:detpart[a].operador,
        tipo_insumo:detpart[a].tipo_insumo,
        cuadrilla:detpart[a].operador!='%' && detpart[a].cuadrilla!=null?Number(detpart[a].cuadrilla):null,
        cantidad:detpart[a].cantidad!=null?Number(detpart[a].cantidad):null,
        precio:detpart[a].precio!=null?Number(detpart[a].precio):null,
        parcial:detpart[a].parcial!=null?Number(detpart[a].parcial):null,
        id_indice:detpart[a].id_indice,
        id_clasificacion:detpart[a].id_clasificacion,
        desc_clasi:detpart[a].desc_clasi,
        id_insumo:Number(detpart[a].id_insumo),
        id_subpartida:detpart[a].id_subpartida,
        esinsumo:detpart[a].esinsumo,
        afcuadrilla:detpart[a].afcuadrilla,
        rendimiento:detpart[a].rendimiento,
        und_rendi:detpart[a].und_rendi,
        jornada:detpart[a].jornada,
        advceros:detpart[a].advceros,
        referencia:detpart[a].referencia,//referpasa,
        icomost:detpart[a].icomost,
        mostrar:detpart[a].mostrar,
        editar:0,
        editar2:0,
        ind:-1,
        indice:newindice,
        indice_subp:detpart[a].indice_subp??null,
        seleccion:0
      };
      this.arrsubpt.push(filaaux);
      if(detpart[a].num_det>0){
        sumapsubp+=Number(detpart[a].parcial)
      }
    }
    return sumapsubp;
  }
  CrearFilaAgru(pindice:any,pdescripcion:any,pid_tipo_insumo:any,pparcial:any,pesinsumo:any,pafcuad:any){
    let filaaux={
      id_proyecto:null,
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
      seleccion:0
    };
    return filaaux;
  }
  async OpenSubpartida(row,indice){
    if(this.formDataPartida.enabled){
      let detallepart=[];
      let summano=0;
      let summat=0;
      let sumeq=0;
      let sumsubc=0;
      let sumsubp=0;
      for(let fila1 of this.arrsubpt){
        if(row.indice_subp==fila1.indice && fila1.unidad!=''){
          detallepart.push(fila1);
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
      //agregar agrupaciones
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
      let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:1 })
      const modalRef = this.modalService.open(ModversubplecturaComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
      modalRef.componentInstance.detallepartida = JSON.parse(JSON.stringify(detallepart));
      modalRef.componentInstance.partida = JSON.parse(JSON.stringify(row));
      modalRef.componentInstance.arrPriSubp=this.arrsubpt;
      modalRef.componentInstance.row =  row
      modalRef.componentInstance.tipoProy= this.tipoProy
      modalRef.componentInstance.medidas= umedidas
      modalRef.componentInstance.fondo = this.fondo;
      modalRef.componentInstance.color = this.color;
      modalRef.componentInstance.letra = this.letra;
      modalRef.componentInstance.dec_cant = this.dec_cant
      modalRef.componentInstance.mask_cant =  this.mask_cant
      modalRef.componentInstance.dec_precio =  this.dec_precio
      modalRef.componentInstance.mask_precio =  this.mask_precio
      modalRef.componentInstance.moneda=this.moneda;
      //const result = await modalRef.result
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
    modalRef.componentInstance.iduser = this.id_user;
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
  //proyecto actual
  cambindicesel3(ind:any){
    if (ind == this.fila_sel3)
      this.fila_sel3 = -1;
    else
      this.fila_sel3 = ind;
  }
  limpiarfiltro3() {
    this.busqueda3 = '';
  }
  toggleOn3(itemsel:any,indice:any){
    let pila=[];//objetos{ item, icomost }
    this.datasourceAct[indice].icomost=1;
    let nuevogru=false;
    for (let i=indice+1;i<this.datasourceAct.length;i++) {
      if (this.datasourceAct[i].item != itemsel && !nuevogru) {
        var palabra = this.datasourceAct[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.datasourceAct[i].item.toString().split('.').length){
            this.datasourceAct[i].mostrar=1;
            this.datasourceAct[i].estmost=1;
            if(this.datasourceAct[i].unidad==''){
              pila.push({item:this.datasourceAct[i].item,icomost:this.datasourceAct[i].icomost});
            }
          }
          else{
            var palabra2 = this.datasourceAct[i].item.toString().substring(0, this.datasourceAct[i].item.lastIndexOf('.'))
            let fila1=pila.find(ele=>ele.item==palabra2);
            this.datasourceAct[i].mostrar=fila1.icomost==0?0:this.datasourceAct[i].estmost;
            if(this.datasourceAct[i].unidad==''){
              pila.push({item:this.datasourceAct[i].item,icomost:fila1.icomost==0?0:this.datasourceAct[i].icomost});
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
  toggleOff3(itemsel:any,indice:any){
    this.datasourceAct[indice].icomost = 0;
    let ind2 = indice+1;
    let nuevogru=false;
    for (let i=ind2;i<this.datasourceAct.length;i++) {
      if (this.datasourceAct[i].item != itemsel  && !nuevogru) {
        var palabra = this.datasourceAct[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.datasourceAct[i].item.toString().split('.').length){
            this.datasourceAct[i].estmost=0;
          }
          this.datasourceAct[i].mostrar=0;
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  maxtodo3(){
    for (let row of this.datasourceAct) {
      if(row.item.split('.').length>1){
        row.mostrar=1;
      }
      row.icomost = 1;
      row.estmost=1;
    }
  }
  mintodo3(){
    for (let row of this.datasourceAct) {
      if(row.item.split('.').length>1){
        //row.estmost=row.mostrar;
        row.mostrar=0;
      }
      else{
        row.icomost=0; row.mostrar=1;
      }
    }
  }
  cambioselt3(row,indice){//actualizar seleccion, no hay indice, pasar indice
    if(row.seleccion==0){
      row.seleccion=1;
      //this.datasourceAct[indice].seleccion=1;
      if(row.unidad==''){
        let nuevogru=false;
        for(let i=indice+1;i<this.datasourceAct.length;i++){
          if (this.datasourceAct[i].item != row.item  && !nuevogru) {
            var palabra = this.datasourceAct[i].item.toString().substring(0, row.item.toString().length + 1)
            if (palabra == (row.item + '.')) {
              this.datasourceAct[i].seleccion=1;
            }
            else{
              nuevogru=true;
            }
          }
          else{ break; }
        }
      }
    }
    else{
      row.seleccion=0;
      //this.datasourceAct[indice].seleccion=0;
      if(row.unidad==''){
        let nuevogru=false;
        for(let i=indice+1;i<this.datasourceAct.length;i++){
          if (this.datasourceAct[i].item != row.item  && !nuevogru) {
            var palabra = this.datasourceAct[i].item.toString().substring(0, row.item.toString().length + 1)
            if (palabra == (row.item + '.')) {
              this.datasourceAct[i].seleccion=0;
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
  cambiarTipoPart(idtipo: any){
    this.tipopart=idtipo;
    //actualizar tablas
    if(this.tipopart=='0'){
      this.datasourceAct=this.tablaact;
    }
    else{
      this.datasourceAct=this.subpartact;
    }
  }
  Anumero(val:any){
    return Number(val);
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
}
