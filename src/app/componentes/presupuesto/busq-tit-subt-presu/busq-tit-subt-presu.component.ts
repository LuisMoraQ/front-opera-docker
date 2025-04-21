import { Component, OnInit, Input, HostListener, ChangeDetectorRef } from '@angular/core';
//import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

export interface rowpartida {
  id_partida: any;
  descripcion: any;
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

export interface filalista {
  id_partida:string;
  item:string;
  descripcion: string;
}

@Component({
  selector: 'app-busq-tit-subt-presu',
  templateUrl: './busq-tit-subt-presu.component.html',
  styleUrls: ['./busq-tit-subt-presu.component.scss']
})
export class BusqTitSubtPresuComponent implements OnInit {
  @Input('height') height: number = 100;
  @Input() iduser:any;
  paddingscroll=17;
  mostrar_carga_todo: boolean = false;
  busqueda = '';
  buscando=false;
  @Input() opcfila=false;
  @Input() estitulo=false;
  @Input() partidacondiciona=null;
  @Input() partidas:rowpartida[]=[];
  @Input() subpartida=false;
  @Input() tipoProy=[];
  @Input() tipoproypasa;
  tiposel='';
  fuentesel=0;

  @Input() fondo:any = '';
  @Input() color:any = '';
  @Input() letra:any = '';

  //displayedColumn: string[] = ['seleccion', 'descripcion', 'unidad', 'precio','fuente'/* , 'acciones' */];
  //dataSource = new TableVirtualScrollDataSource<rowpartida>();
  datasourcePri:rowpartida[];
  fila_sel:any;

  formaagrega='0';
  arregloseleccion=[];
  nomtabsel='';
  inditemsel=-1;

  FormConf = new UntypedFormGroup({
    seltipoproy: new UntypedFormControl(''),
  })
  get seltipoproy(): UntypedFormControl { return this.FormConf.get('seltipoproy') as UntypedFormControl }

  formAgrega = new UntypedFormGroup({
    titulo: new UntypedFormControl('', [Validators.required]),
  })

  get titulo(): UntypedFormControl { return this.formAgrega.get('titulo') as UntypedFormControl }

  constructor(
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    private catalogosService: CatalogosService,
    private _EncriptadorService: EncriptadorService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    var resto = 280;
    this.height = window.innerHeight - resto;
    this.datasourcePri=this.partidas;
    this.nomtabsel="tab1";
    this.iduser=this.iduser??this._EncriptadorService.recuperarlocalstory('idusuario');
    //this.formaagrega=this.opcfila?"3":"0";
    this.seltipoproy.setValue(this.tipoproypasa);
    this.tiposel=this.tipoproypasa;
    await this.cambiarTipoProy(this.seltipoproy);
    document.getElementById('inpbusq')?.focus();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 280;
      this.height = window.innerHeight - resto;
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    //cambiar ancho del scroll
    var element = document.getElementById('horscrollbod2');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll != sizeef) {
        this.paddingscroll = sizeef;
      }
    }
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  SyncScroll(phoneFaceId) {
    var face1 = document.getElementById("horscrollbod2");
    var face2 = document.getElementById("horscrollhead2");
    if (phoneFaceId=="horscrollbod2") {
      face2.scrollLeft = face1.scrollLeft;
    }
    else {
      face1.scrollLeft = face2.scrollLeft;
    }
  }
  seleccionar(){
    if(this.arregloseleccion.length>0){
      let objretorna={
        forma:this.formaagrega,
        datos:this.arregloseleccion
      }
      this.modal.close(objretorna)
    }
    else{
      if(this.nomtabsel=="tab1"){//tabla
        let cont=0;
        let aux=[];
        for(let i=0;i<this.datasourcePri.length;i++){
          if(this.datasourcePri[i].seleccion==1){
            cont++;
            aux.push(this.datasourcePri[i])
          }
        }
        if(cont>0){
          let objretorna={
            forma:this.formaagrega,
            datos:aux
          }
          this.modal.close(objretorna)
        }
        else{
          this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        }
      }
      else{//form
        if (this.formAgrega.invalid) {
          this.formAgrega.markAllAsTouched()
          this.toaster.error('Datos incompletos', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
          return
        } else {
          let ejemplo:filalista={
            descripcion:this.titulo.value.toUpperCase(),
            id_partida: null,
            item:''
          }
          this.arregloseleccion.push(ejemplo);
          let objretorna={
            forma:this.formaagrega,
            datos:this.arregloseleccion
          }
          this.modal.close(objretorna)
        }
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
      if(row.agrupacion.split('.').length>1){
        row.mostrar=1;
      }
      else
        row.icomost=1;
    }
  }
  mintodo(){
    for(let row of this.datasourcePri){
      if(row.agrupacion.split('.').length>1){
        row.mostrar=0;
      }
      else
        row.icomost=0;
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
      if(row.esgrupo==0 && !this.estitulo){
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
      if(row.esgrupo==0  && !this.estitulo){
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
      let rpartidas = await this.catalogosService.ListarTitsubPartidas({ id_usuario: this.iduser,fuente:this.fuentesel, tipo_proy: this.tiposel });//cambiar dinamico tipo_proy
      this.datasourcePri=rpartidas;
      this.buscando=false;
    }
    catch(e){
      this.buscando=false;
      console.log(e)
    }
  }
  cambiarTipoProy(idtipo: any){
    //filtrar solo front
    this.tiposel=this.seltipoproy?.value;
    this.buscarPartidas();
    /* let aux=[];
    let ind2=0;
    for(let row of this.datasourcePri){
      if(row.mostrar==1 && (row.tipo_proy==idtipo || idtipo=='')){
        row.ind2=ind2;
        aux.push(row);
        ind2++;
      }
      else{
        row.ind2=-1;
      }
    }
    this.dataSource.data=aux; */
  }
  async cambiarFuente(idfuente:any){
    this.fuentesel=idfuente;
    this.buscarPartidas();
    /* this.buscando=true;
    this.dataSource.data=[];
    let rpartidas = await this.catalogosService.ListarTitsubPartidas({ id_usuario: this.iduser,fuente:idfuente });//cambiar dinamico tipo_proy
    this.datasourcePri=rpartidas;
    this.dataSource.data=rpartidas;
    this.buscando=false; */
  }
  //nueva partida
  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambiarForma(id_forma){
    this.formaagrega=id_forma;
  }
  addtoTabla(){
    if(this.nomtabsel=="tab1"){//tabla
      let cont=0;
      for(let i=0;i<this.datasourcePri.length;i++){
        if(this.datasourcePri[i].seleccion==1){
          cont++;
          this.arregloseleccion.push(this.datasourcePri[i]);
          this.datasourcePri[i].seleccion=0;
        }
      }
      if(cont<=0){
        this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
    else{//formulario
      if (this.formAgrega.invalid) {
        this.formAgrega.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        let existe=this.arregloseleccion.find(data => data.descripcion == this.titulo.value.toUpperCase());
        if(!existe){
          let ejemplo:filalista={
            id_partida:null,
            descripcion:this.titulo.value.toUpperCase(),
            item:''
          }
          this.titulo.setValue('');
          this.arregloseleccion.push(ejemplo);
          document.getElementById('descrip').focus();
        }
        else{
          this.toaster.error('Existe un titulo con el mismo nombre.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        }
      }
    }
  }
  eliminarfila(ind:any){
    this.arregloseleccion.splice(ind,1);
    this.inditemsel=-1;
  }
  keyaction(event:any){
    try {
      if(event.keyCode.toString() == "13")
      {
        this.addtoTabla();
      }
    } catch (e) {
      console.log(e)
    }
  }
  async onNavChange(tab = null) {
    this.nomtabsel=tab;
  }
  subirpresel(){
    if(this.inditemsel>0){
      let sube=JSON.parse(JSON.stringify(this.arregloseleccion[this.inditemsel]));
      let baja=JSON.parse(JSON.stringify(this.arregloseleccion[this.inditemsel-1]));
      this.arregloseleccion[this.inditemsel]=baja;
      this.arregloseleccion[this.inditemsel-1]=sube;
      this.inditemsel=this.inditemsel-1;
    }
  }
  bajarpresel(){
    if(this.inditemsel<this.arregloseleccion.length-1){
      let sube=JSON.parse(JSON.stringify(this.arregloseleccion[this.inditemsel+1]));
      let baja=JSON.parse(JSON.stringify(this.arregloseleccion[this.inditemsel]));
      this.arregloseleccion[this.inditemsel+1]=baja;
      this.arregloseleccion[this.inditemsel]=sube;
      this.inditemsel=this.inditemsel+1;
    }
  }
  camindsel(ind){
    if(ind!=this.inditemsel){
      this.inditemsel=ind;
    }
    else{
      this.inditemsel=-1;
    }
  }
  EliminarSel(){
    this.arregloseleccion=[];
  }
}
