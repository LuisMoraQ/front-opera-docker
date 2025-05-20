import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { ModalListaClasificacionComponent } from '../../administrador/datainsumo/modal-lista-clasificacion/modal-lista-clasificacion.component';
import { VariablesGlobalesService } from 'src/app/servicios/variables-globales.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clasipartidaspresu',
  templateUrl: './clasipartidaspresu.component.html',
  styleUrls: ['./clasipartidaspresu.component.scss']
})
export class ClasipartidaspresuComponent implements OnInit {
  @Input() solover=false;
  @Input() moneda='S/';
  @Input('height') heightacu: number = 100;
  @Input() arreglo:[];
  @Input() id_proyecto:any;
  @Input() descproy:any;
  @Input() propproy:any;
  @Input() ubicaproy:any;
  @Input() fechproy:any;
  @Input() total:any;
  @Input() arrPriSubp:any;
  @Input() id_user:any;
  mostrar_carga_todo=false;
  /* updateRelIns$:Subscription=new Subscription(); */
  buscando=false;
  disabAcciones=false;
  busqueda = '';

  paddingscroll = 17;
  paddingscroll2 = 17;
  preventscroll=false;
  //variables opciones vista codigo
  mcodigo=true;
  codsoloiu=false;

  tablaacusel=[];
  filaSelacu=-1;
  rowsel=null;
  colselacu=true;
  idgruselacu=null;
  preciototal=0;

  @Input() dec_metrado=2;
  @Input() mask_metrado='0.2';
  @Input() dec_precio=2;
  @Input() mask_precio='0.2';
  @Input() dec_parcial=2;
  @Input() mask_parcial='0.2';
  @Input() dec_cant=2;
  @Input() mask_cant='0.2';

  formDataProy = new UntypedFormGroup({
    proyecto: new UntypedFormControl('', [Validators.required]),
    propietario: new UntypedFormControl('', [Validators.required]),
    ubicacion: new UntypedFormControl('', [Validators.required]),
    fechaproy: new UntypedFormControl('', [Validators.required]),
  })
  
  get proyecto(): UntypedFormControl { return this.formDataProy.get('proyecto') as UntypedFormControl }
  get propietario(): UntypedFormControl { return this.formDataProy.get('propietario') as UntypedFormControl }
  get ubicacion(): UntypedFormControl { return this.formDataProy.get('ubicacion') as UntypedFormControl }
  get fechaproy(): UntypedFormControl { return this.formDataProy.get('fechaproy') as UntypedFormControl }

  constructor(
    private modalService: NgbModal,
    private modal: NgbActiveModal,
    private changeDetector: ChangeDetectorRef,
    private toaster: ToastrService,
    private encriptadorService: EncriptadorService,
    private adminservice: AdministradorService,
    private varGlobalesService: VariablesGlobalesService,
    public formService: FormsService,
  ) { }

  ngOnInit(): void {
    let resto=420
    this.heightacu = window.innerHeight - resto;
    this.id_user=this.id_user??this.encriptadorService.recuperarlocalstory('idusuario');
    /* let decimales = this.encriptadorService.recuperarlocalstory('decimales');
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
    } */
    this.buscando=true;
    let arraux=JSON.parse(JSON.stringify(this.arreglo));
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
    this.tablaacusel=arraux;
    this.NuevoInd(this.tablaacusel)
    this.buscando=false;

    this.preciototal=this.total;
    this.proyecto.setValue(this.descproy);
    this.propietario.setValue(this.propproy);
    this.ubicacion.setValue(this.ubicaproy);
    this.fechaproy.setValue(this.fechproy);
    this.formDataProy.disable();
    /* this.updateRelIns$=this.varGlobalesService.updclasinsumo.subscribe(data=>{//indicador que se cambio clasi comercial desde relacion de insumos, para actualizar en el principal
      if(data){
        console.log(data)
        this.tablaacusel=data.datos;
        this.preciototal=Number(this.formService.redondeo(data.total,this.dec_parcial));
      }
    }); */
  }
   NuevoInd(arr) {
    let contador = 1;
    arr.forEach((row) => {
      if (row.unidad === '') {
        row.indiceLocal = ''; // vacío porque no queremos mostrar número
        contador = 1; // reinicia contador
      } else {
        row.indiceLocal = contador;
        contador++;
      }
    });
  }
  ngOnDestroy(): void {
    this.varGlobalesService.editaClasi.next(null);
    /* this.updateRelIns$.unsubscribe(); */
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    //cambiar ancho del scroll
    var element = document.getElementById('tableBodyri');
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
  closeModal(){
    this.modal.close();
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  SyncScroll() {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face2 = document.getElementById("tableBodyri");
    var face3 = document.getElementById("tableFootri");
    face3.scrollLeft = face2.scrollLeft;
  }
  SyncScroll2() {
    if (this.preventscroll) {
      this.preventscroll = false;
      return;
    }
    this.preventscroll = true;
    var face2 = document.getElementById("tableBodyri");
    var face3 = document.getElementById("tableFootri");
    face2.scrollLeft = face3.scrollLeft;
  }
  toggleOn(condicion: any) {
    let indice2=this.tablaacusel.indexOf(condicion);//buscar indice, el indice que se pasa es dinamico por el filtro
    this.tablaacusel[indice2].icomost = 1;
    if(condicion.agruclasi=='1'){
      for (let i=indice2+1;i<this.tablaacusel.length;i++) {
        if(this.tablaacusel[i].id_clasificacion==condicion.id_clasificacion)
        {
          if(this.tablaacusel[i].unidad!='' || this.tablaacusel[i].agruclasi=='1')
          {
            this.tablaacusel[i].mostrar=1;
          }
        }
        else{ break; }
      }
    }else{
      for (let i=indice2+1;i<this.tablaacusel.length;i++) {
        if(this.tablaacusel[i].id_tipo_insumo==condicion.id_tipo_insumo)
        {
          if(this.tablaacusel[i].unidad!='' || this.tablaacusel[i].agruclasi=='1')
          {
            this.tablaacusel[i].mostrar=1;
            this.tablaacusel[i].icomost=1;
          }
        }
        else{ break; }
      }
    }
  }
  toggleOff(condicion: any) {
    let indice2=this.tablaacusel.indexOf(condicion);//buscar indice, el indice que se pasa es dinamico por el filtro
    this.tablaacusel[indice2].icomost = 0;
    if(condicion.agruclasi=='1'){
      for (let i=indice2+1;i<this.tablaacusel.length;i++) {
        if(this.tablaacusel[i].id_clasificacion==condicion.id_clasificacion)
        {
          if(this.tablaacusel[i].unidad!='' || this.tablaacusel[i].agruclasi=='1')
          {
            this.tablaacusel[i].mostrar=0;
          }
        }
        else{ break; }
      }
    }else{
      for (let i=indice2+1;i<this.tablaacusel.length;i++) {
        if(this.tablaacusel[i].id_tipo_insumo==condicion.id_tipo_insumo)
        {
          if(this.tablaacusel[i].unidad!='' || this.tablaacusel[i].agruclasi=='1')
          {
            this.tablaacusel[i].mostrar=0;
            this.tablaacusel[i].icomost=0;
          }
        }
        else{ break; }
      }
    }
  }
  cambindiceselacu(ind: any,row:any) {
    if (ind == this.filaSelacu){
      this.filaSelacu = -1;
      this.rowsel=null;
    }
    else{
      this.rowsel=row;
      this.filaSelacu = ind;
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
          row2.selvin=0;
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
    for(let row of this.tablaacusel){
      row.seleccion=0;
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
  /* OrdendescRelins(){
    if(this.tablaacusel.length>0){
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
  } */
  /* OrdenascRelins(){
    if(this.tablaacusel.length>0){
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
  } */
  async CambClasi(){
    this.mostrar_carga_todo = true
    let rowsel1;
    let arrsel=[];
    let arrclexis=[];
    for(let rowf of this.tablaacusel){
      if(rowf.seleccion==1){
        rowsel1=rowsel1?rowsel1:rowf;
        arrsel.push(rowf);
      }
      if(rowf.indice==null){
        arrclexis.push(rowf);
      }
    }
    if(rowsel1){
      let clasiInsumos = []
      clasiInsumos = await this.adminservice.listarClasiInsumosData({ activo: 1, id_tipo_insumo:rowsel1.id_tipo_insumo, id_usuario:this.id_user, fuente:''})
      this.mostrar_carga_todo = false;
      const modalRef = await this.modalService.open(ModalListaClasificacionComponent, { size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
      modalRef.componentInstance.tipoInsumos = []
      modalRef.componentInstance.clasiInsumos = clasiInsumos
      modalRef.componentInstance.tipoInsumo = rowsel1.id_tipo_insumo;
      modalRef.componentInstance.fuentepasa = 1//para presupuesto de usaurio
      modalRef.componentInstance.id_user = this.id_user
      modalRef.componentInstance.clasipresu = true;
      modalRef.componentInstance.clexiste = arrclexis;
      const result = await modalRef.result
      if (result) {
        //enviar al subscribe el arreglo y los datos de la nueva clasificacion
        this.mostrar_carga_todo = true;
        let objretorna = {
          opcion:1,//clasi
          tabla: arrsel,
          id_clasi: result.id_clasificacion,
          desc_clasi:result.desc_clasi
        }
        this.varGlobalesService.editaClasi.next(objretorna);
        this.tablaacusel.forEach(element => {
          if(element.seleccion==1){
            element.id_clasificacion=result.id_clasificacion;
            element.desc_clasi=result.desc_clasi;
            element.seleccion=0;
          }
        });
        //volver a crear la tabla?(solo cambiar, luego ordenar?)
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
          if ((a.desc_clasi==null?"":a.desc_clasi) < (b.desc_clasi==null?"":b.desc_clasi)) {
            return -1;
          }
          if ((a.desc_clasi==null?"":a.desc_clasi) > (b.desc_clasi==null?"":b.desc_clasi)) {
            return 1;
          }
          if ((b.agruclasi==null?0:b.agruclasi) < (a.agruclasi==null?0:a.agruclasi)) {
            return -1;
          }
          if ((b.agruclasi==null?0:b.agruclasi) > (a.agruclasi==null?0:a.agruclasi)) {
            return 1;
          }
          return 0;
        });
        //si no existe clasificacion, agregar, eliminar si ya no tiene detalles?,  eliminar agru que no tiene contenido, agregar agru nueva si no existe
        let clasiadd='';
        for(let fila=0;fila<this.tablaacusel.length;fila++){
          if(this.tablaacusel[fila].num_det!=0){
            if(this.tablaacusel[fila].indice==null){
              clasiadd=this.tablaacusel[fila].descripcion=='SIN CLASIFICACION'?null:this.tablaacusel[fila].descripcion;
              if(fila==this.tablaacusel.length-1){//si el ultimo es clasi, eliminar
                this.tablaacusel.splice(fila,1);
              }
              else{
                if(this.tablaacusel[fila+1].desc_clasi!=clasiadd){
                  this.tablaacusel.splice(fila,1);
                  fila--;
                }
              }
            }
            else{
              if(clasiadd!=this.tablaacusel[fila].desc_clasi){
                clasiadd=this.tablaacusel[fila].desc_clasi;
                this.tablaacusel.splice(fila,0,{id_proyecto:this.tablaacusel[fila].id_proyecto,num_det:this.tablaacusel[fila].num_det,icomost:1,id_clasificacion:this.tablaacusel[fila].id_clasificacion,
                  id_tipo_insumo:this.tablaacusel[fila].id_tipo_insumo,mostrar:1,seleccion:0,unidad:'',descripcion:this.tablaacusel[fila].desc_clasi??'SIN CLASIFICACION',agruclasi:1,desc_clasi:this.tablaacusel[fila].desc_clasi??null});
                fila++;
              }
            }
          }
          else{
            clasiadd='';
          }
        }
        this.filaSelacu=-1;
        this.mostrar_carga_todo = false;
      }
    }
    else{
      this.mostrar_carga_todo = false
      this.toaster.error('Seleccione las filas a las que desea cambiar Clasificación.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  toggleoffAgru() {
    if(this.rowsel){
      let condicion=this.rowsel;
      let indice2=this.tablaacusel.indexOf(condicion);//buscar indice, el indice que se pasa es dinamico por el filtro
      if(condicion.unidad=='' && condicion.agruclasi!='1'){
        this.tablaacusel[indice2].icomost = 1;
        for (let i=indice2+1;i<this.tablaacusel.length;i++) {
          if(this.tablaacusel[i].id_tipo_insumo==condicion.id_tipo_insumo)
          {
            if(this.tablaacusel[i].agruclasi=='1')
            {
              this.tablaacusel[i].mostrar=1;
              this.tablaacusel[i].icomost=0;
            }
            else{
              this.tablaacusel[i].mostrar=0;
            }
          }
          else{ break; }
        }
      }
    }
    else{
      this.toaster.error('Seleccione la fila de un Tipo de Insumo.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  toggleonAgru(){
    if(this.rowsel){
      let condicion=this.rowsel;
      let indice2=this.tablaacusel.indexOf(condicion);//buscar indice, el indice que se pasa es dinamico por el filtro
      if(condicion.unidad=='' && condicion.agruclasi!='1'){
        this.tablaacusel[indice2].icomost = 1;
        for (let i=indice2+1;i<this.tablaacusel.length;i++) {
          if(this.tablaacusel[i].id_tipo_insumo==condicion.id_tipo_insumo)
          {
            if(this.tablaacusel[i].agruclasi=='1')
            {
              this.tablaacusel[i].mostrar=1;
              this.tablaacusel[i].icomost=1;
            }
            else{
              this.tablaacusel[i].mostrar=1;
            }
          }
          else{ break; }
        }
      }
    }
    else{
      this.toaster.error('Seleccione la fila de un Tipo de Insumo.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  maxtodo(){
    for (let row of this.tablaacusel) {
      if(row.unidad!='' || row.agruclasi=='1'){
        row.mostrar=1;
      }
      row.icomost = 1;
      row.estmost=1;
    }
  }
  mintodo(){
    for (let row of this.tablaacusel) {
      if(row.unidad!='' || row.agruclasi=='1'){
        //row.estmost=row.mostrar;
        row.mostrar=0;
      }
      else{
        row.icomost=0; row.mostrar=1;
      }
    }
  }
}
