import { Component, OnInit, Input, HostListener, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SwalService } from 'src/app/servicios/swal.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { PrincipalService } from 'src/app/servicios/principal.service';

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
  indice:any;
}
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
  indice:any;
  indice_subp:any;
  seleccion:any;
}
export interface nodoitem {
  nro:any;
  item:any;
  hijos:nodoitem[];
}
@Component({
  selector: 'app-addpartproy',
  templateUrl: './addpartproy.component.html',
  styleUrls: ['./addpartproy.component.scss'],
})
export class AddpartproyComponent implements OnInit {
  @Input() moneda
  monedabusq='S/';
  @Input('height') height: number = 100;
  @Input() iduser:any;
  mostrar_carga_todo: boolean = false;
  busqueda = '';
  busqueda2 = '';
  busqueda3 = '';
  vista1=true;
  buscando=false;
  /* @Input() proyectos=[]; */
  @Input() opcfila=false;
  @Input() tipofila;
  @Input() tipoProy=[];
  @Input() tipoproypasa;
  @Input() id_proypasa;
  tiposel='';
  fuentesel=0;
  id_nwpart=1;
  @Input() fondo:any = '';
  @Input() color:any = '';
  @Input() letra:any = '';
  dec_metrado=4;
  mask_metrado='0.4';
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  datasourcePri=[];
  fila_sel=-1;
  idproysel:any;
  nomproysel:any;
  @Input() nomproyact:any;
  datasourcePresu=[];
  datadetalle=[];
  datasubp=[];
  fila_sel2=-1;
  @Input() presact=[];
  @Input() presdetact=[];
  @Input() pressubact=[];
  datasourceAct=[];
  datadetalleAct=[];
  datasubpAct=[];
  fila_sel3=-1;
  formaagrega='0';
  arreglosel=[];
  arrdetsel=[];
  arrsubpsel=[];
  filaArrSel=-1;
  nomtabsel='';
  simbolo
  //arreglo de objetos ordenados
  arrordenar:nodoitem[];

  FormConf = new UntypedFormGroup({
    seltipoproy: new UntypedFormControl(''),
  })
  get seltipoproy(): UntypedFormControl { return this.FormConf.get('seltipoproy') as UntypedFormControl }

  constructor(
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    private _EncriptadorService: EncriptadorService,
    private principalServ: PrincipalService,
    private presuservice: PresupuestosService,
  ) { }

  async ngOnInit() {
    this.simbolo=this.moneda
    var resto = 300;
    this.height = window.innerHeight - resto;
    /* this.datasourcePri=this.proyectos; */
    this.nomtabsel="tab1";
    this.iduser=this.iduser??this._EncriptadorService.recuperarlocalstory('idusuario');
    let decimales = this._EncriptadorService.recuperarlocalstory('decimales');
    if(decimales?.toString().includes('|')){
      let arrdec=decimales.split('|');
      this.dec_metrado=arrdec[0];
      this.mask_metrado='0.'+arrdec[0];
      this.dec_precio=arrdec[1];
      this.mask_precio='0.'+arrdec[1];
      this.dec_parcial=arrdec[2];
      this.mask_parcial='0.'+arrdec[2];
    }
    this.datasourceAct=JSON.parse(JSON.stringify(this.presact));
    this.datadetalleAct=JSON.parse(JSON.stringify(this.presdetact));
    this.datasubpAct=JSON.parse(JSON.stringify(this.pressubact));
    this.formaagrega=this.opcfila?'3':'0';
    this.cambiarFuente('1');
    this.arrordenar=[];
    document.getElementById('inpbusqaddp')?.focus();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 300;
    this.height = window.innerHeight - resto;
  }
  async onNavChange(tab = null) {
    this.nomtabsel=tab;
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  limpiarfiltro2() {
    this.busqueda2 = '';
  }
  limpiarfiltro3() {
    this.busqueda3 = '';
  }
  cambindicesel(row:any,ind: any) {
    if (row.nro == "") {
      if (ind == this.fila_sel)
        this.fila_sel = -1;
      else
        this.fila_sel = row.id_proyecto;
    }
  }
  toggleOn(id: string) {
    for (let row of this.datasourcePri) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 1;
        }
        else
          row.icomost = 1;
      }
    }
  }
  toggleOff(id: string) {
    for (let row of this.datasourcePri) {
      if (row.id_grupo == id) {
        if (row.nro == '') {
          row.mostrar = 0;
        }
        else
          row.icomost = 0;
      }
    }
  }
  cargarsubpartida(indicesubp:any,arrbusca:any){
    for(let rowsubp of arrbusca){
      if(rowsubp.indice==indicesubp){
        this.arrsubpsel.push(rowsubp);
        if(rowsubp.esinsumo==0 && rowsubp.num_det>0){
          this.cargarsubpartida(rowsubp.indice_subp,arrbusca);
        }
      }
    }
  }
  sigitem(itemant:string)
  {
    let arrauxagru = itemant.split('.');
    arrauxagru[arrauxagru.length-1]=(Number(arrauxagru[arrauxagru.length-1])+1).toString();
    return arrauxagru.join('.');
  }
  limpiarsel(){
    for(let row of this.datasourcePresu){
      row.seleccion=0;
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
  async seleccionar(){
    try {
      let cont=0;
      let cantitem=0;
      let cargar=false;
      let databusca=this.nomtabsel=='tab1'?this.datasourcePresu:this.datasourceAct;
      let detbusca=this.nomtabsel=='tab1'?this.datadetalle:this.datadetalleAct;
      let subbusca=this.nomtabsel=='tab1'?this.datasubp:this.datasubpAct;
      for(let i=0;i<databusca.length;i++){
        if(databusca[i].seleccion==1){
          if(this.nomtabsel=='tab1' && !cargar){
            this.mostrar_carga_todo=true;
            let res= await this.presuservice.ListarPresuDetProy({id_proyecto:this.idproysel});
            detbusca=res;
            let res1= await this.presuservice.ListarPresuSubpProy({id_proyecto:this.idproysel});
            subbusca=res1;
            cargar=true;
          }
          cont++;
          this.arreglosel.push(JSON.parse(JSON.stringify(databusca[i])))
          if(databusca[i].unidad!=''){//seleccionar detalles y vincularlos con las partidas seleccionadas
            for(let rowdet of detbusca){
              if(rowdet.indice==databusca[i].indice){
                this.arrdetsel.push(rowdet)
                if(rowdet.esinsumo==0 && rowdet.num_det>0){
                  this.cargarsubpartida(rowdet.indice_subp,subbusca);
                }
              }
            }
          }
        }
      }
      if(cont>0){
        //ordenar items ejm
        for(let a=0;a<this.arreglosel.length;a++){
          let itemact=this.arreglosel[a].item.toString();
          let arrit=itemact.split('.');
          if(a==0){
            let itemnode:nodoitem={
              nro:this.arrordenar.length+1,
              item:this.arreglosel[a].item,
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
                item:this.arreglosel[a].item,
                hijos:[]
              };
              nodopadre.hijos.push(itemnode);
            }
            else{
              let itemnode:nodoitem={
                nro:this.arrordenar.length+1,
                item:this.arreglosel[a].item,
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
        for(let n=0;n<this.arreglosel.length;n++){
          this.arreglosel[n].item=arritord[n];
          if (arritord[n].split('.').length==1) {
            cantitem++;
          }
        }
        let objretorna={
          forma:this.formaagrega,
          cantitem:cantitem,
          datos:this.arreglosel,
          detalle:this.arrdetsel,
          detsubp:this.arrsubpsel,
          compartido:this.fuentesel==3?1:0
        };
        this.modal.close(objretorna) //descomentar
        this.arrordenar=[];
        this.arreglosel=[];
        this.mostrar_carga_todo=false;
      }
      else{
        this.toaster.error('No hay filas seleccionadas','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  cambiarForma(id_forma){
    this.formaagrega=id_forma;
  }
  closeModal(){
    this.modal.close(null);
  }
  async cambiarFuente(idfuente:any){
    this.fuentesel=idfuente;
    if(idfuente=="3"){
      this.buscando=true;
      this.datasourcePri=[];
      let rproyectos = await this.principalServ.ListarProyCompartidos({id_usuario:this.iduser});//cambiar con metodo para compartidos
      for(let row of rproyectos){
        if(row.duplica=="1"){
          this.datasourcePri.push(row);
        }
      }
      this.buscando=false;
    }
    else{
      this.buscando=true;
      this.datasourcePri=[];
      let rproyectos = await this.presuservice.BuscarProyAddPresu({ id_usuario: this.iduser,fuente:idfuente,tipo_proy:this.tiposel,id_proyecto:this.id_proypasa });//fuente 1 proyectos usuario
      this.datasourcePri=rproyectos;
      this.buscando=false;
    }
    //this.buscarPartidas();
  }
  async cambiarTipoProy(idtipo: any){
    this.fila_sel=-1;
    this.tiposel=this.seltipoproy.value;
    if(this.fuentesel.toString()=="3"){
      this.buscando=true;
      this.datasourcePri=[];
      let rproyectos = await this.principalServ.ListarProyCompartidos({id_usuario:this.iduser});//cambiar con metodo para compartidos
      for(let row of rproyectos){
        if(row.duplica=="1"){
          this.datasourcePri.push(row);
        }
      }
      this.buscando=false;
    }
    else{
      this.buscando=true;
      this.datasourcePri=[];
      let rproyectos = await this.presuservice.BuscarProyAddPresu({ id_usuario: this.iduser,fuente:this.fuentesel,tipo_proy:this.tiposel,id_proyecto:this.id_proypasa });//fuente 1 proyectos usuario
      this.datasourcePri=rproyectos;
      this.buscando=false;
    }
    //this.buscarPartidas();
  }
  async Siguiente(){
    if(this.fila_sel>-1){
      let rowsel;
      for(let row of this.datasourcePri){
        if(row.id_proyecto==this.fila_sel){
          rowsel=row;
          break;
        }
      }
      if(rowsel){
        if(rowsel.nro==''){
          this.mostrar_carga_todo=true;
          if(this.idproysel!=rowsel.id_proyecto){
            this.idproysel=rowsel.id_proyecto;
            this.nomproysel=rowsel.descripcion;
            this.monedabusq=rowsel.moneda?(rowsel.moneda=='1'?'$':'S/'):'S/';
            let res= await this.presuservice.ListarPresuProy({id_proyecto:this.idproysel});
            this.datasourcePresu=res;
          }
          this.mostrar_carga_todo=false;
          this.vista1=false;
        }
        else{
          this.toaster.error('Seleccione un Proyecto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
      else{
        this.toaster.error('Seleccione un Proyecto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
    else{
      this.toaster.error('Seleccione un Proyecto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  Regresar(){
    //this.fila_sel=-1;
    this.vista1=true;
  }
  //presupuesto
  maxgrupo(){
    if(this.fila_sel2>-1){
      let row=this.datasourcePresu[this.fila_sel2];
      if(row.unidad==''){
        let inpri = this.fila_sel2;
        let itemsel=row.item;
        row.icomost=1;
        let nuevogru=false;
        for (let i=inpri+1;i<this.datasourcePresu.length;i++) {
          if (this.datasourcePresu[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourcePresu[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              if(this.datasourcePresu[i].item.split('.').length==(itemsel.split('.').length+1)){
                this.datasourcePresu[i].mostrar = 1;
                this.datasourcePresu[i].icomost = 0;
                this.datasourcePresu[i].estmost=1;
              }
              else{
                this.datasourcePresu[i].mostrar=0;
                this.datasourcePresu[i].icomost = 0;
                this.datasourcePresu[i].estmost=0;
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
  Expandetodo() {//icomost   1 mostrar, 0 ocultar
    if(this.fila_sel2>-1){
      let row=this.datasourcePresu[this.fila_sel2];
      if(row.unidad==''){
        let itemsel=row.item;
        row.icomost=1;
        let nuevogru=false;
        for (let i=this.fila_sel2+1;i<this.datasourcePresu.length;i++) {
          if (this.datasourcePresu[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourcePresu[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              this.datasourcePresu[i].mostrar = 1;
              this.datasourcePresu[i].icomost = 1;
              this.datasourcePresu[i].estmost=1;
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
    if(this.fila_sel2>-1){
      let row=this.datasourcePresu[this.fila_sel2];
      if(row.unidad==''){
        let inpri = this.fila_sel2;
        let itemsel=row.item;
        row.icomost=1;
        let nuevogru=false;
        for (let i=inpri+1;i<this.datasourcePresu.length;i++) {
          if (this.datasourcePresu[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourcePresu[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              if(this.datasourcePresu[i].item.split('.').length==(itemsel.split('.').length+1)){
                this.datasourcePresu[i].mostrar = 1;
                this.datasourcePresu[i].icomost = 0;
                this.datasourcePresu[i].estmost=1;
              }
              else{
                this.datasourcePresu[i].mostrar=0;
                this.datasourcePresu[i].icomost = 0;
                this.datasourcePresu[i].estmost=0;
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
    for (let row of this.datasourcePresu) {
      if(row.item.split('.').length>1){
        row.mostrar=1;
      }
      row.icomost = 1;
    }
  }
  mintodo(){
    for (let row of this.datasourcePresu) {
      if(row.item.split('.').length>1){
        row.estmost=row.mostrar;
        row.mostrar=0;
      }
      else{
        row.icomost=0; row.mostrar=1;
      }
    }
  }
  toggleOnpresu(itemsel, indice) {//icomost   1 mostrar, 0 ocultar
    let encuentra=false;
    for(let j=0;j<this.datasourcePresu.length;j++){
      if(!encuentra){
        if(itemsel==this.datasourcePresu[j].item){
          indice=j;
          encuentra=true;
        }
      }
      else{
        break;
      }
    }
    this.datasourcePresu[indice].icomost=1;
    let nuevogru=false;
    for (let i=indice+1;i<this.datasourcePresu.length;i++) {
      if (this.datasourcePresu[i].item != itemsel && !nuevogru) {
        var palabra = this.datasourcePresu[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.datasourcePresu[i].item.toString().split('.').length){
            this.datasourcePresu[i].mostrar = 1;
          }
          else{
            this.datasourcePresu[i].mostrar = this.datasourcePresu[i].estmost;
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
    let encuentra=false;
    for(let j=0;j<this.datasourcePresu.length;j++){
      if(!encuentra){
        if(itemsel==this.datasourcePresu[j].item){
          indice=j;
          encuentra=true;
        }
      }
      else{
        break;
      }
    }
    this.datasourcePresu[indice].icomost = 0;
    let ind2 = indice+1;
    let nuevogru=false;
    for (let i=ind2;i<this.datasourcePresu.length;i++) {
      if (this.datasourcePresu[i].item != itemsel  && !nuevogru) {
        var palabra = this.datasourcePresu[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          this.datasourcePresu[i].estmost=this.datasourcePresu[i].mostrar;
          this.datasourcePresu[i].mostrar=0;
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  Cambioseltpri(row,ind){
    if(row.seleccion==0){
      row.seleccion=1;
      //seleccionar los siguientes
      if(row.tipofila!=2){
        for(let i=Number(ind)+1;i<this.datasourcePresu.length;i++){
          var palabra = this.datasourcePresu[i].item?.toString().substring(0, row.item.toString().length + 1)
          if(this.datasourcePresu[i].item ==  row.item || palabra == (row.item + '.')){
            this.datasourcePresu[i].seleccion=1;
          }
          else{
            break;
          }
        }
      }
    }
    else{
      row.seleccion=0;
      if(row.tipofila!=2){
        for(let i=Number(ind)+1;i<this.datasourcePresu.length;i++){
          var palabra = this.datasourcePresu[i].item?.toString().substring(0, row.item.toString().length + 1)
          if(row.item==this.datasourcePresu[i].item || palabra==(row.item+'.')){
            this.datasourcePresu[i].seleccion=0;
          }
          else{
            break;
          }
        }
      }
    }
  }
  async cambindiceselpresu(ind: any) {
    if (ind == this.fila_sel2)
      this.fila_sel2 = -1;
    else
      this.fila_sel2 = ind;
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  //proyecto actual
  Expandetodo3() {//icomost   1 mostrar, 0 ocultar
    if(this.fila_sel3>-1){
      let row=this.datasourceAct[this.fila_sel3];
      if(row.unidad==''){
        let itemsel=row.item;
        row.icomost=1;
        let nuevogru=false;
        for (let i=this.fila_sel3+1;i<this.datasourceAct.length;i++) {
          if (this.datasourceAct[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourceAct[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              this.datasourceAct[i].mostrar = 1;
              this.datasourceAct[i].icomost = 1;
              this.datasourceAct[i].estmost=1;
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
  ContraeTodo3(){
    if(this.fila_sel3>-1){
      let row=this.datasourceAct[this.fila_sel3];
      if(row.unidad==''){
        let inpri = this.fila_sel3;
        let itemsel=row.item;
        row.icomost=1;
        let nuevogru=false;
        for (let i=inpri+1;i<this.datasourceAct.length;i++) {
          if (this.datasourceAct[i].item != itemsel && !nuevogru) {
            var palabra = this.datasourceAct[i].item.toString().substring(0, itemsel.toString().length + 1)
            if (palabra == (itemsel + '.')) {
              if(this.datasourceAct[i].item.split('.').length==(itemsel.split('.').length+1)){
                this.datasourceAct[i].mostrar = 1;
                this.datasourceAct[i].icomost = 0;
                this.datasourceAct[i].estmost=1;
              }
              else{
                this.datasourceAct[i].mostrar=0;
                this.datasourceAct[i].icomost = 0;
                this.datasourceAct[i].estmost=0;
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
  maxtodo3(){
    for (let row of this.datasourceAct) {
      if(row.item.split('.').length>1){
        row.mostrar=1;
      }
      row.icomost = 1;
    }
  }
  mintodo3(){
    for (let row of this.datasourceAct) {
      if(row.item.split('.').length>1){
        row.estmost=row.mostrar;
        row.mostrar=0;
      }
      else{
        row.icomost=0; row.mostrar=1;
      }
    }
  }
  toggleOnpresu3(itemsel, indice) {//icomost   1 mostrar, 0 ocultar
    let encuentra=false;
    for(let j=0;j<this.datasourceAct.length;j++){
      if(!encuentra){
        if(itemsel==this.datasourceAct[j].item){
          indice=j;
          encuentra=true;
        }
      }
      else{
        break;
      }
    }
    this.datasourceAct[indice].icomost=1;
    let nuevogru=false;
    for (let i=indice+1;i<this.datasourceAct.length;i++) {
      if (this.datasourceAct[i].item != itemsel && !nuevogru) {
        var palabra = this.datasourceAct[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.datasourceAct[i].item.toString().split('.').length){
            this.datasourceAct[i].mostrar = 1;
          }
          else{
            this.datasourceAct[i].mostrar = this.datasourceAct[i].estmost;
          }
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  toggleOffpresu3(itemsel, indice) {
    let encuentra=false;
    for(let j=0;j<this.datasourceAct.length;j++){
      if(!encuentra){
        if(itemsel==this.datasourceAct[j].item){
          indice=j;
          encuentra=true;
        }
      }
      else{
        break;
      }
    }
    this.datasourceAct[indice].icomost = 0;
    let ind2 = indice+1;
    let nuevogru=false;
    for (let i=ind2;i<this.datasourceAct.length;i++) {
      if (this.datasourceAct[i].item != itemsel  && !nuevogru) {
        var palabra = this.datasourceAct[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          this.datasourceAct[i].estmost=this.datasourceAct[i].mostrar;
          this.datasourceAct[i].mostrar=0;
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  async cambindiceselpresu3(ind: any) {
    if (ind == this.fila_sel3)
      this.fila_sel3 = -1;
    else
      this.fila_sel3 = ind;
  }
  Cambioseltpri3(row,ind){
    if(row.seleccion==0){
      row.seleccion=1;
      //seleccionar los siguientes
      if(row.tipofila!=2){
        for(let i=Number(ind)+1;i<this.datasourceAct.length;i++){
          var palabra = this.datasourceAct[i].item?.toString().substring(0, row.item.toString().length + 1)
          if(this.datasourceAct[i].item ==  row.item || palabra == (row.item + '.')){
            this.datasourceAct[i].seleccion=1;
          }
          else{
            break;
          }
        }
      }
    }
    else{
      row.seleccion=0;
      if(row.tipofila!=2){
        for(let i=Number(ind)+1;i<this.datasourceAct.length;i++){
          var palabra = this.datasourceAct[i].item?.toString().substring(0, row.item.toString().length + 1)
          if(row.item==this.datasourceAct[i].item || palabra==(row.item+'.')){
            this.datasourceAct[i].seleccion=0;
          }
          else{
            break;
          }
        }
      }
    }
  }
}
