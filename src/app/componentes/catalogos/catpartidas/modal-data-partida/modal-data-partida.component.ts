import { BuscartitsubtComponent } from './../buscartitsubt/buscartitsubt.component';
import { Component, OnInit, Input,HostListener,ChangeDetectorRef,ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { CatalogosService } from './../../../../servicios/catalogos.service';
import { BuscarinsumoComponent } from './../buscarinsumo/buscarinsumo.component';
import { BuscaaddunidadmedComponent } from './../../../catalogos/unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { ModalSubpartidaComponent } from '../modal-subpartida/modal-subpartida.component';
import { BusqpartcatComponent } from '../busqpartcat/busqpartcat.component';
export interface rowinsumo {
  id_partida:any;
  id_tipo_insumo: any;
  num_det:any;
  codigo:any;
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
  selector: 'app-modal-data-partida',
  templateUrl: './modal-data-partida.component.html',
  styleUrls: ['./modal-data-partida.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalDataPartidaComponent implements OnInit {
  @Input('height') height: number = 100;
  @Input() duplicar = null
  @Input() sistema = 0
  @Input() datos = null
  @Input() catalogoPartida;
  @Input() fuente;
  @Input() ver = null
  @Input() medidas:unidadmed[]=[];
  @Input() insumos: rowinsumo[] = [];
  @Input() detallepartidas:rowinsumo[]=[];
  @Input() tipoProy=[];
  @Input() tipoproysel;
  @Input() agrupsel;
  @Input() fuentecrea;
  @Input() padre=null;
  @Input() opcfila=false;
  @Input() fondo:any = '';
  @Input() color:any = '';
  @Input() letra:any = '';
  @Input() filascambit=[];
  @Input() partidacondiciona=null;
  @Input() subpartdup=[];
  mismotipo=true;
  paddingscroll = 17;
  paddingscroll2 = 17;
  mostrar_carga_todo: boolean = false
  procesando=false;
  id_user:any;
  undconcatrendi='';
  datasourcePri=[];
  fila_selacu:any;
  preventscroll=false;
  //variables opciones vista codigo
  mcodigo=true;
  codsoloiu=false;
  colselacu=false;
  idgruselacu=null;
  editarpreins=false;
  dec_cant=4;
  mask_cant='0.4';
  dec_precio=2;
  mask_precio='0.2';
  textoDuplicar: string = 'NO';
  espedup='';
  fichdup='';
  actuapri=false;
  Arrsubpartidas=[];
  ultidpart=1;
  formDataPartida = new UntypedFormGroup({
    formainsertar: new UntypedFormControl('0', [Validators.required]),
    descripcion: new UntypedFormControl('', [Validators.required]),
    unidad: new UntypedFormControl('', [Validators.required]),
    precio: new UntypedFormControl('0.00', [Validators.required, Validators.min(0)]),
    rendimiento: new UntypedFormControl('1.00', []),
    undrendimiento: new UntypedFormControl('DIA', []),
    jornada: new UntypedFormControl('8', []),
    id_usuario: new UntypedFormControl('', []),
    tipo_proy: new UntypedFormControl('', [Validators.required]),
    seltipo_proy: new UntypedFormControl(''),
    agrupacion:new UntypedFormControl('', [Validators.required]),
    duparc:new UntypedFormControl('')
  })
  get formainsertar(): UntypedFormControl { return this.formDataPartida.get('formainsertar') as UntypedFormControl }
  get descripcion(): UntypedFormControl { return this.formDataPartida.get('descripcion') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formDataPartida.get('unidad') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.formDataPartida.get('precio') as UntypedFormControl }
  get rendimiento(): UntypedFormControl { return this.formDataPartida.get('rendimiento') as UntypedFormControl }
  get undrendimiento(): UntypedFormControl { return this.formDataPartida.get('undrendimiento') as UntypedFormControl }
  get jornada(): UntypedFormControl { return this.formDataPartida.get('jornada') as UntypedFormControl }
  get id_usuario(): UntypedFormControl { return this.formDataPartida.get('id_usuario') as UntypedFormControl }
  get tipo_proy(): UntypedFormControl { return this.formDataPartida.get('tipo_proy') as UntypedFormControl }
  get seltipo_proy(): UntypedFormControl { return this.formDataPartida.get('seltipo_proy') as UntypedFormControl }
  get agrupacion(): UntypedFormControl { return this.formDataPartida.get('agrupacion') as UntypedFormControl }
  get duparc(): UntypedFormControl { return this.formDataPartida.get('duparc') as UntypedFormControl }
  /* @ViewChild("modalAddTipo") modaltipo: ModalBasicComponent; */
  minimbut=false;
  constructor(
    private modal: NgbActiveModal,
    private modalService: NgbModal,
    private toaster: ToastrService,
    public formsService: FormsService,
    private _EncriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
    private catalogosService:CatalogosService,
    private adminservice: AdministradorService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    try {
      var resto = 461;
      if(document.body.clientWidth<576)
        resto=resto+110;
      this.height = window.innerHeight - resto;
      this.mostrar_carga_todo=true;
      this.minimbut=document.body.clientWidth <= 991?true:false;
      this.id_user = this._EncriptadorService.recuperarlocalstory('idusuario');
      let decimales = this._EncriptadorService.recuperarlocalstory('decimales');
      if(decimales?.toString().includes('|')){
        let arrdec=decimales.split('|');
        this.dec_cant=arrdec[3];
        this.mask_cant='0.'+arrdec[3];
        this.dec_precio=arrdec[1];
        this.mask_precio='0.'+arrdec[1];
      }
      if(this.sistema==1){
        this.padre=null;
      }
      this.datasourcePri=this.detallepartidas;
      await this.accionModal()
      this.id_usuario.setValue(this.id_user)
      this.undrendimiento.disable();
      this.mostrar_carga_todo=false;
      document.getElementById('descrip').focus();
    } catch (e) {
      console.log('error: '+e);
      SwalService.error(e)
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 461;
    if(document.body.clientWidth<576)
      resto=resto+110;
    this.height = window.innerHeight - resto;
    this.minimbut=document.body.clientWidth <= 991?true:false;
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    var element = document.getElementById('tableBodyMdp');
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
  closeModal(result: any = null) {
    if(!result){
      result={respuesta:null,posinserta:null,actuapri:this.actuapri};
    }
    this.modal.close(result)
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  SyncScroll(phoneFaceId) {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face1 = document.getElementById("tableBodyMdp");
    var face3 = document.getElementById("tableFootMdp");
    face3.scrollLeft = face1.scrollLeft;
  }
  SyncScroll2(phoneFaceId) {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face1 = document.getElementById("tableBodyMdp");
    var face3 = document.getElementById("tableFootMdp");
    face1.scrollLeft = face3.scrollLeft;
  }
  async abrirmodalUnidades(){
    this.mostrar_carga_todo = true
    let tablaunid = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:this.fuentecrea==0?'0':'',activo: 1,operador:1 })//cambiar a dinamico u otra consulta que retorne todo
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
  async accionModal() {
    try {
      if (this.duplicar) {
        this.formDataPartida.reset({ 
          formainsertar:!this.opcfila || this.duplicar?'3':'0',
          descripcion: this.datos?.descripcion,
          unidad: '',//this.datos?.id_unidad?Number(this.datos?.id_unidad):'',
          precio: this.formsService.redondeo(parseFloat(this.datos?.precio),this.dec_precio),
          rendimiento: this.datos?.rendimiento,
          undrendimiento: this.datos?.und_rendi,
          jornada:this.datos?.jornada,
          id_usuario: this.datos?.id_usuario,
          tipo_proy: this.datos?.tipo_proy,
          seltipo_proy:null
        })
        this.espedup=this.datos?.espec_tec;
        this.fichdup=this.datos?.ficha_tec;
        let exisund=this.medidas.find(ele=>this.datos?.id_unidad==ele.id_unidad)
        if(exisund){
          this.unidad.setValue(this.datos?.id_unidad?Number(this.datos?.id_unidad):'');
          this.cambUnidad();
        }
        //this.undconcatrendi=this.datos?.unidad;
        if(this.padre){
          this.agrupacion.setValue(this.padre.agrupacion+"  "+this.padre.descripcion);
        }
        //this.tipo_proy.disable();
        this.Arrsubpartidas=this.subpartdup;
      }
      else{
        if(!this.opcfila){
          this.formainsertar.setValue('3');
        }
        this.agrupacion.setValue(this.padre.agrupacion+"  "+this.padre.descripcion);
        this.tipo_proy.setValue(this.datos?.tipo_proy);
        let tipoP=this.tipoProy.find(ele=> ele.id_clasificacion==this.datos?.tipo_proy);
        this.seltipo_proy.setValue(tipoP)
        //this.tipo_proy.disable();
      }
    } catch (e) {
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
  presentertRendi(event:any){
    if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
  }
  actualizarParcGrupos(){
    let indgru=-1;
    let actgru;
    let parcialgru=0;
    let sumtot=0;
    let parcgrusinporc=0;
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
  async almacenar() {
    await this.guardar()
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
  async guardar() {
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
        this.mostrar_carga_todo = true
        let existeceros=0;
        for(let i=0;i<this.datasourcePri.length;i++){
          if(this.datasourcePri[i].unidad!=''){
            if(Number(this.datasourcePri[i].cantidad)==0){
              existeceros=1;
            }
            let cuadr=this.datasourcePri[i].cuadrilla?this.datasourcePri[i].cuadrilla.toString():'';
            if(this.errormaxval(cuadr,'Cuadrilla',10)){ return }
            let cantr=this.datasourcePri[i].cantidad.toString();
            if(this.errormaxval(cantr,'Cantidad',10)){ return }
            let precior=this.datasourcePri[i].precio.toString();
            if(this.errormaxval(precior,'Precio',10)){ return }
            let parcr=this.datasourcePri[i].parcial.toString();
            if(this.errormaxval(parcr,'Parcial',10)){ return }
          }
          
        }
        let fuentepasa=this.fuente;
        if(this.catalogoPartida){
          if(this.duplicar){
            fuentepasa=this.fuente=='0'?'1':this.fuente;
          }
        }
        else{
          if(this.duplicar){
            fuentepasa=this.fuente=='1'?'0':this.fuente;
          }
        }
        let tipoproypasa='';
        if(this.duplicar){
          tipoproypasa=this.tipo_proy.value;
        }
        else{
          tipoproypasa=this.seltipo_proy.value?.id_clasificacion;
        }
        const tabla1 = JSON.stringify(this.datasourcePri);
        const tabla2=JSON.stringify(this.Arrsubpartidas);
        const body = JSON.stringify({
          'descripcion': this.descripcion.value.toUpperCase(),
          'unidad': this.unidad.value,
          'precio': this.precio.value,
          'rendimiento': this.rendimiento.value,
          'und_rendi': this.undrendimiento.value,
          'jornada':this.jornada.value,
          'id_usuario': this.id_usuario.value,
          'tipo_proy': tipoproypasa,
          'fuente': fuentepasa,//this.duplicar && this.catalogoPartida?this.catalogoPartida=='0'?'1':'0':this.catalogoPartida,
          'agrupacion':this.duplicar && (this.formainsertar.value==0 || this.formainsertar.value==1)?this.padre.agrupacion:this.datos.agrupacion,
          'referencia':null,
          'advceros':existeceros,
          'datos1': tabla1,
          'agrutit':this.duplicar?this.padre.agrupacion:this.datos.agrupacion,//agregar el id_partida del titulo
          'posinserta':this.formainsertar.value,
          'datos2':tabla2,
          'duparch':this.duparc.value?'1':'0',
          'especdup':this.espedup,
          'fichadup':this.fichdup,
        });
        let result=await this.catalogosService.GuardarDataPartidas(body)
        this.mostrar_carga_todo = false
        if (result.id == '1') {
          this.closeModal({respuesta:result,posinserta:this.formainsertar.value,actuapri:this.actuapri})
          //SwalService.success('Correcto', result.mensaje)
          this.toaster.success('Se guardó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        else {
          SwalService.error('Advertencia', result.mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  //tabla analisis de costos unitarios
  toggleOn(condicion:any,indice2:any){
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
  toggleOff(condicion:any,indice2:any){
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
  cambindiceselacu(ind:any){
    if (ind == this.fila_selacu)
      this.fila_selacu = -1;
    else
      this.fila_selacu = ind;
  }
  /* async listarInsumos(tipo_insumo:any){
    try {
      const input = { id_usuario:this.id_user, id_tipo_insumo:tipo_insumo }
      this.insumos = await this.catalogosService.BuscarDataInsumos(input);
    } catch (e) {
      console.log(e);
      SwalService.error()
    }
  } */
  editarceldat1(ind:any){
    if(this.datasourcePri[ind].num_det!=0){
      this.datasourcePri[ind].editar=1;
    }
  }
  editarceldat2(ind: any) {
    if(this.datasourcePri[ind].num_det!=0){
      this.datasourcePri[ind].editar3 = 1;
    }
  }
  editarceldat3(ind: any) {
    if(this.datasourcePri[ind].num_det!=0 && this.datasourcePri[ind].operador==null && this.datasourcePri[ind].esinsumo==1){
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
  caneditarceldat1(eve:any,ind2:any){
    var valor=Number(eve.toString().replace(/\,/g,''));
    var actual=Number(this.datasourcePri[ind2].cantidad)
    var aprecio=Number(this.datasourcePri[ind2].precio);
    this.datasourcePri[ind2].editar=0;
    if(valor!=actual){
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
      let resparc=this.datasourcePri[ind2].operador=='%'?(Number(this.formsService.redondeo(canti, this.dec_cant))*aprecio)/100:Number(this.formsService.redondeo(canti, this.dec_cant))*aprecio;
      if(this.errormaxval(canti.toString(),'Cantidad',10,'El resultado de ')){ return }
      if(this.errormaxval(resparc.toString(),'Parcial',10,'El resultado de ')){ return }
      this.datasourcePri[ind2].cuadrilla=this.formsService.redondeo(Number(valor), 8);
      this.datasourcePri[ind2].cantidad=this.formsService.redondeo(canti, this.dec_cant);
      this.datasourcePri[ind2].parcial=this.formsService.redondeo(resparc, this.dec_precio);
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
  presentert1(event:any,ind:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat1(this.datasourcePri[ind].cantidad,ind)//el primer parametro es el valor de la celda a editar
    }
    else if(event.keyCode.toString() == "13")
    {
      event.target.blur();
    }
    else if(event.keyCode.toString()=="40"){
      if(ind+1<this.datasourcePri.length){
        for(let i=ind+1;i<this.datasourcePri.length;i++){
          if(this.datasourcePri[i].unidad!=''){
            this.datasourcePri[i].editar=1;
            event.target.blur();
            break;
          }
        }
      }
    }
    else if(event.keyCode.toString()=="38"){
      if(ind-1>=0){
        for(let i=ind-1;i>=0;i--){
          if(this.datasourcePri[i].unidad!=''){
            this.datasourcePri[i].editar=1;
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
  Actparcialt1(idtipo:any){
    let indgrupo=-1;
    let suma=0;
    let sumasinporc=0;
    let sumatot=0;
    for(let i=0;i<this.datasourcePri.length;i++){
      if(this.datasourcePri[i].id_tipo_insumo==idtipo && this.datasourcePri[i].unidad==''){
        indgrupo=i;
      }
      if(this.datasourcePri[i].id_tipo_insumo==idtipo && this.datasourcePri[i].unidad!=''){
        suma+=Number(this.datasourcePri[i].parcial)
        sumatot += Number(this.datasourcePri[i].parcial);
        if(this.datasourcePri[i].operador==null){
          sumasinporc+=Number(this.datasourcePri[i].parcial)
        }
      }
      if (this.datasourcePri[i].id_tipo_insumo != idtipo && this.datasourcePri[i].unidad != '') {
        sumatot += Number(this.datasourcePri[i].parcial);
      }
    }
    if(indgrupo>=0){
      this.datasourcePri[indgrupo].parcial=this.formsService.redondeo(suma,this.dec_precio);
      //total tabla
      let nprec=this.formsService.redondeo(sumatot,this.dec_precio)
      this.precio.setValue(nprec);
      return sumasinporc;
    }
  }
  async abrirModalTitsubt(){
    try{
      this.mostrar_carga_todo = true
      let fuentepasa=this.fuente;
      if(this.catalogoPartida){
        if(this.duplicar){
          fuentepasa=this.fuente=='0'?'1':this.fuente;
        }
      }
      else{
        if(this.duplicar){
          fuentepasa=this.fuente=='1'?'0':this.fuente;
        }
      }
      let tablatitsubt = await this.catalogosService.ListarTitsubPartidas({ id_usuario: this.id_user,fuente:fuentepasa,tipo_proy:this.tipo_proy.value });
      const modalRef = this.modalService.open(BuscartitsubtComponent, {
        size: 'lg',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false//no cerrar el modal con ESC
      })
      modalRef.componentInstance.tabla = tablatitsubt;
      modalRef.componentInstance.tipoProy=this.tipoProy;
      modalRef.componentInstance.tipoproysel=this.tipo_proy.value;
      modalRef.componentInstance.fuentesel=fuentepasa;
      modalRef.componentInstance.fondo=this.fondo;
      modalRef.componentInstance.color=this.color;
      modalRef.componentInstance.letra=this.letra;

      this.mostrar_carga_todo = false
      const result = await modalRef.result
      if (result) {
        this.tipo_proy.setValue(result.tipoproy)
        this.padre=result.data;
        this.agrupacion.setValue(this.padre.agrupacion+"  "+this.padre.descripcion);
        if(this.agrupsel==this.padre.agrupacion){
          this.mismotipo=true;
          if(!(this.formainsertar.value==3 || this.formainsertar.value==2)){
            this.formainsertar.setValue(3);
          }
        }
        else{
          this.mismotipo=false;
          if(!(this.formainsertar.value==0 || this.formainsertar.value==1)){
            this.formainsertar.setValue(0);
          }
        }
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      console.log(e);
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
        let rowsel=this.datasourcePri[this.fila_selacu];
        if(rowsel.num_det==0){//agrupacion
          this.toaster.error('La fila seleccionada no se puede reemplazar','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
          return;
        }
        if(rowsel.esinsumo==1){//insumos
          this.mostrar_carga_todo = true;
          /* let insumos=await this.catalogosService.BuscarDataInsumos({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo});
          let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,tipo_insumo:rowsel.id_tipo_insumo })
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
          let fuentepasa=this.fuente;
          if(this.catalogoPartida){
            if(this.duplicar){
              fuentepasa=this.fuente=='0'?'1':this.fuente;
            }
          }
          else{
            if(this.duplicar){
              fuentepasa=this.fuente=='1'?'0':this.fuente;
            }
          }
          const modalRef = this.modalService.open(BuscarinsumoComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
          this.mostrar_carga_todo = false
          /* modalRef.componentInstance.insumos = insumos;
          modalRef.componentInstance.medidas = umedidas;
          modalRef.componentInstance.indices = indicesunif; */
          modalRef.componentInstance.tipoinsumo = filagru?.descripcion//rowsel.descripcion;
          modalRef.componentInstance.id_tipo_insumo = rowsel.id_tipo_insumo;
          modalRef.componentInstance.existentes = arrexisten;
          modalRef.componentInstance.reemplaza = true;
          modalRef.componentInstance.inpfuente=fuentepasa;
          modalRef.componentInstance.rowfiltro=rowsel;
          const result = await modalRef.result
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
                id_clasificacion: result[0].id_clasificacion,
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
                //afectaref:null
              };
              //reemplazar en tablas
              this.datasourcePri[this.fila_selacu]=agrega;
              let sumasinporc=this.Actparcialt1(this.datasourcePri[this.fila_selacu].id_tipo_insumo);
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
          let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,tipo_insumo:rowsel.id_tipo_insumo })
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
          let fuentepasa=this.fuente;
          if(this.catalogoPartida){
            if(this.duplicar){
              fuentepasa=this.fuente=='0'?'1':this.fuente;
            }
          }
          else{
            if(this.duplicar){
              fuentepasa=this.fuente=='1'?'0':this.fuente;
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
          modalRef.componentInstance.inpfuente=fuentepasa;
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
              this.procesando=true;
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
                    };
                    this.datasourcePri.splice(indagre,0,agrega);
                  }
                }
              }
              //calcular todales de la agrupacion y afectar a los porcentajes para calcular el total de toda la partida
              let sumasinporc=this.Actparcialt1(rowsel.id_tipo_insumo)
              this.actinsporc(rowsel.id_tipo_insumo,sumasinporc,rowsel.operador);
              this.procesando=false;
            }
          }
        }
        else{//subpartidas
          let fuentepasa=this.fuente;
          if(this.catalogoPartida){
            if(this.duplicar){
              fuentepasa=this.fuente=='0'?'1':this.fuente;
            }
          }
          else{
            if(this.duplicar){
              fuentepasa=this.fuente=='1'?'0':this.fuente;
            }
          }
          this.mostrar_carga_todo = true;
          let rpartidas = await this.catalogosService.BuscarDataPartidas({ id_usuario: this.id_user,fuente:fuentepasa, tipo_proy: this.tipoproysel,idpadre:/* this.partidacondiciona?.id_partida?? */'',restriccion:/* this.partidacondiciona?.referencia?? */'' });//cambiar dinamico tipo_proy
          const modalRef = this.modalService.open(BusqpartcatComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
          //modalRef.componentInstance.partidacondiciona=this.partidacondiciona;
          modalRef.componentInstance.partidas = rpartidas;
          modalRef.componentInstance.subpartida = true;
          modalRef.componentInstance.tipoProy=this.tipoProy;//cargar los tipos de proyecto
          modalRef.componentInstance.tipoproysel=this.tipo_proy.value;//cargar los tipos de proyecto
          modalRef.componentInstance.fuentecrea=fuentepasa;//this.fuentecrea;
          modalRef.componentInstance.fondo=this.fondo;
          modalRef.componentInstance.color=this.color;
          modalRef.componentInstance.letra=this.letra;
          modalRef.componentInstance.medidas=this.medidas;
          modalRef.componentInstance.inpfuente=fuentepasa;
          this.mostrar_carga_todo = false
          const result = await modalRef.result
          if (result.response) {
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
            this.procesando=true;
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
                // afectaref:1,
                seleccion:0
              };
              this.datasourcePri.splice(indins,0,agrega);
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
  async recuperarDetalleSubPartida(idsubpartida) {
    let detallespart = await this.catalogosService.listarPartidaYDetalle({ id_partida: idsubpartida });
    return detallespart
  }
  async OpenSubpartida(row,indice){
    if(this.formDataPartida.enabled){
      let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:this.fuentecrea==0?'0':'',activo: 1,operador:1 })
      //const detallepartida = await this.recuperarDetalleSubPartida(row.id_subpartida)
      let arraux=[];
      for(let fila1 of this.Arrsubpartidas){
        if(fila1.id_partida==row.id_subpartida){
          arraux.push(JSON.parse(JSON.stringify(fila1)));
        }
      }
      let fuentepasa=this.fuente;
      if(this.catalogoPartida){
        if(this.duplicar){
          fuentepasa=this.fuente=='0'?'1':this.fuente;
        }
      }
      else{
        if(this.duplicar){
          fuentepasa=this.fuente=='1'?'0':this.fuente;
        }
      }
      const modalRef = this.modalService.open(ModalSubpartidaComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
      modalRef.componentInstance.Arreglosubp = this.Arrsubpartidas;//detallepartida[1];
      modalRef.componentInstance.detallepartida = arraux;//detallepartida[1];
      modalRef.componentInstance.partida = row;//detallepartida[0][0];
      //modalRef.componentInstance.row =  row
      modalRef.componentInstance.tipoProy= this.tipoProy;
      modalRef.componentInstance.tipoproysel=this.tipo_proy.value;//cargar los tipos de proyecto
      modalRef.componentInstance.medidas= umedidas;
      modalRef.componentInstance.fondo = this.fondo;
      modalRef.componentInstance.color = this.color;
      modalRef.componentInstance.letra = this.letra;
      modalRef.componentInstance.dec_cant = this.dec_cant
      modalRef.componentInstance.mask_cant =  this.mask_cant
      modalRef.componentInstance.dec_precio =  this.dec_precio
      modalRef.componentInstance.mask_precio =  this.mask_precio
      modalRef.componentInstance.inpfuente=fuentepasa;
      modalRef.componentInstance.ultidpart=this.ultidpart;
      const result = await modalRef.result
      this.ultidpart=result.ultid;
      if (result.cargadet) {
        //const detalleSubpartida = await this.catalogosService.DatosPartidaCatalog({id_partida:row.id_subpartida});
        //if(detalleSubpartida?.length>0){
          for(let i=0;i<this.datasourcePri.length;i++){
            if(this.datasourcePri[i].id_subpartida == row.id_subpartida){
              // this.datasourcePri[i].descripcion = detalleSubpartida[0].descripcion
              // this.datasourcePri[i].unidad = detalleSubpartida[0].unidad
              // this.datasourcePri[i].precio = detalleSubpartida[0].precio
              var aprecio = Number(this.datasourcePri[i].precio);
              const valor = this.datasourcePri[i].cantidad
              this.datasourcePri[i].parcial=this.formsService.redondeo((valor * aprecio), this.dec_precio);
              this.Actparcialt1(this.datasourcePri[i].id_tipo_insumo)
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
  changeTipoProy(){
    this.padre=null;
    this.agrupacion.setValue('');
    if(this.agrupsel==this.padre?.agrupacion){
      this.mismotipo=true;
      if(!(this.formainsertar.value==3 || this.formainsertar.value==2)){
        this.formainsertar.setValue(3);
      }
    }
    else{
      this.mismotipo=false;
      if(!(this.formainsertar.value==0 || this.formainsertar.value==1)){
        this.formainsertar.setValue(0);
      }
    }
  }
  cambioDuplicar() {
    if (this.duparc.value) {
      this.textoDuplicar = 'SI'
    } else {
      this.textoDuplicar = 'NO'
    }
  }
  Anumero(val:any){
    return Number(val);
  }
}
