import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy,ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ModversubplecturaComponent } from '../modversubplectura/modversubplectura.component';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { VariablesGlobalesService } from 'src/app/servicios/variables-globales.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { Subscription } from 'rxjs';
import { SwalService } from 'src/app/servicios/swal.service';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { BuscarinsumoComponent } from '../../catalogos/catpartidas/buscarinsumo/buscarinsumo.component';
import { DatosinsumoComponent } from '../datosinsumo/datosinsumo.component';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
@Component({
  selector: 'app-relacinsumos',
  templateUrl: './relacinsumos.component.html',
  styleUrls: ['./relacinsumos.component.scss']
})
export class RelacinsumosComponent implements OnInit,OnDestroy {
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
  mostrar_carga_todo = false;
  updateRelIns$:Subscription=new Subscription();
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

  frmUnidad = new UntypedFormGroup({
    unidad: new UntypedFormControl('', [Validators.required]),
  })
  get unidad(): UntypedFormControl { return this.frmUnidad.get('unidad') as UntypedFormControl }
  medidas=[];

  @ViewChild("cambUnidad") modalcambUnd: ModalBasicComponent;
  orden=0;//1:descrasc,2:descrdesc,3:parcasc,4:parcdesc

  constructor(
    private modalService: NgbModal,
    private modal: NgbActiveModal,
    private changeDetector: ChangeDetectorRef,
    private toaster: ToastrService,
    private encriptadorService: EncriptadorService,
    private adminservice: AdministradorService,
    private varGlobalesService: VariablesGlobalesService,
    public formService: FormsService,
    private catalogosService: CatalogosService,
  ) { }

  ngOnInit(): void {
    let resto=420
    this.heightacu = window.innerHeight - resto;
    this.id_user=this.id_user??this.encriptadorService.recuperarlocalstory('idusuario');
    this.tablaacusel=this.arreglo;
    this.NuevoInd(this.tablaacusel)
    this.preciototal=this.total;
    this.proyecto.setValue(this.descproy);
    this.propietario.setValue(this.propproy);
    this.ubicacion.setValue(this.ubicaproy);
    this.fechaproy.setValue(this.fechproy);
    this.formDataProy.disable();
    this.updateRelIns$=this.varGlobalesService.updrelacinsumo.subscribe(data=>{//indicador que se cambio clasi comercial desde relacion de insumos, para actualizar en el principal
      if(data){
        this.tablaacusel=data.datos;
        if(this.orden!=0)
          this.ordertabla(this.orden);
        this.preciototal=Number(this.formService.redondeo(data.total,this.dec_parcial));
      }
    });
    console.log(this.tablaacusel)
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
    this.updateRelIns$.unsubscribe();
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
  toggleOn(condicion: any,row:any) {
    row.icomost = 1;
    for (let i=0;i<this.tablaacusel.length;i++) {
      if(this.tablaacusel[i].id_tipo_insumo==condicion)
      {
        if(this.tablaacusel[i].unidad!='')
        {
          this.tablaacusel[i].mostrar=1;
        }
      }
      /* else{ break; } */
    }
  }
  toggleOff(condicion: any,row:any) {
    row.icomost = 0;
    for (let i=0;i<this.tablaacusel.length;i++) {
      if(this.tablaacusel[i].id_tipo_insumo==condicion)
      {
        if(this.tablaacusel[i].unidad!='')
        {
          this.tablaacusel[i].mostrar=0;
        }
      }
      /* else{ break; } */
    }
  }
  cambindiceselacu(ind: any) {
    if (ind == this.filaSelacu)
      this.filaSelacu = -1;
    else
      this.filaSelacu = ind;
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
  OrdendescRelins(){
    if(this.tablaacusel.length>0){
      this.orden=2;
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
      this.orden=1;
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
      this.orden=4;
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
      this.orden=3;
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
  async OpenSubpartida(row,indice){//revisar no carga correctamente los valores
    let detallepart=[];
    for(let fila1 of this.arrPriSubp){
      if(row.indice_subp==fila1.indice){
        detallepart.push(fila1);
      }
    }
    let umedidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:1 })
    const modalRef = this.modalService.open(ModversubplecturaComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
    modalRef.componentInstance.detallepartida = JSON.parse(JSON.stringify(detallepart));
    modalRef.componentInstance.partida = JSON.parse(JSON.stringify(row));
    modalRef.componentInstance.arrPriSubp=this.arrPriSubp;
    modalRef.componentInstance.row = row
    modalRef.componentInstance.medidas= umedidas
    modalRef.componentInstance.dec_cant = this.dec_cant
    modalRef.componentInstance.mask_cant = this.mask_cant
    modalRef.componentInstance.dec_precio = this.dec_precio
    modalRef.componentInstance.mask_precio = this.mask_precio
    modalRef.componentInstance.moneda = this.moneda;
    //const result = await modalRef.result
  }
  Cambioselvinc(row:any){
    if(!this.idgruselacu){
      this.idgruselacu=row.id_tipo_insumo;
    }
    if(row.selvin==0 || row.selvin==null){
      if(this.idgruselacu!=row.id_tipo_insumo){
        for(let row3 of this.tablaacusel){
          row3.seleccion=0;
        }
      }
      //si cambia de grupo al seleccionar vinculo o checkseleccion se debe limpiar?
      row.selvin=1;
      row.seleccion=0;
      this.idgruselacu=row.id_tipo_insumo;
      for(let row2 of this.tablaacusel){
        if(JSON.stringify(row2)!=JSON.stringify(row)){
          row2.selvin=0;
        }
      }
    }
    else{
      row.selvin=0;
    }
  }
  async Vincular(){
    const sw = await SwalService.confirm('Estas seguro?', 'Se vincularán los insumos seleccionados.')
    if (sw.isConfirmed) {
      let rowvinc;
      let tabvinc=[];
      for(let row of this.tablaacusel){
        if(row.selvin==1){
          rowvinc=row;
        }
        if(row.seleccion==1 && row.selvin==0){
          tabvinc.push(row)
        }
      }
      if(rowvinc){
        //agregar condiciones de no nulos
        let objretorna = {
          opcion:3,//vincular insumos
          tabla: tabvinc,
          anterior:rowvinc
        }
        await this.varGlobalesService.editaClasi.next(objretorna);
      }
      else{
        this.toaster.error('Seleccione una filas en la columna Vincular.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
  }
  editarceldat3(row:any){
    if(row.num_det!=0 && row.operador==null && row.esinsumo==1 && !this.solover){
      row.editar2 = 1;
    }
  }
  presentert3(event: any, row: any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarceldat3(row.precio,row)//el primer parametro es el valor de la celda a editar
    }
    else if (event.keyCode.toString() == "13") {
      event.target.blur();
    }
    /* else if (event.keyCode.toString() == "40") {
      if (ind + 1 < this.tablaacusel.length) {
        for (let i = ind + 1; i < this.tablaacusel.length; i++) {
          if (this.tablaacusel[i].unidad != '' && this.tablaacusel[i].operador==null && this.tablaacusel[i].esinsumo==1) {
            event.target.blur();
            this.tablaacusel[i].editar2 = 1;
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
            this.tablaacusel[i].editar2 = 1;
            break;
          }
        }
      }
    } */
  }
  async caneditarceldat3(eve: any, row: any){
    //validar si es igual al actual para no realizar el proceso en vano
    var valor = Number(eve.toString().replace(/\,/g, ''));
    var actual = Number(row.precio)
    var acantidad = Number(row.cantidad);
    row.editar2 = 0;
    if (valor != actual) {
      this.mostrar_carga_todo=true;
      row.precio = this.formService.redondeo(Number(valor), this.dec_precio);
      let resparc=row.operador=='%'?(valor*acantidad)/100:valor*acantidad;
      row.parcial = this.formService.redondeo(resparc, this.dec_parcial);
      /* let sumasinporc=this.Actparcialt1(this.row.id_tipo_insumo);//copiar codigo
      this.actinsporc(this.row.id_tipo_insumo,sumasinporc,this.row.operador);//copiar codigo */
      let objretorna = {
        opcion:2,//precio
        tabla: row,
        anterior:actual
      }
      await this.varGlobalesService.editaClasi.next(objretorna);
      console.log('termina emitir')
      //calcular total
      /* let totaux=0;
      for(let row of this.tablaacusel){
        if(row.unidad!=''){
          totaux+=Number(row.parcial);
        }
      }
      this.preciototal=totaux; */
      this.mostrar_carga_todo=false;
    }
  }
  Actparcialt1(idtipo: any) {//revisar
    let indgrupo = -1;
    let suma = 0;
    let sumasinporc=0;
    for (let i = 0; i < this.tablaacusel.length; i++) {
      if (this.tablaacusel[i].id_tipo_insumo == idtipo && this.tablaacusel[i].unidad == '') {
        indgrupo = i;
      }
      if (this.tablaacusel[i].id_tipo_insumo == idtipo && this.tablaacusel[i].unidad != '') {
        suma += Number(this.tablaacusel[i].parcial)
      }
      if(this.tablaacusel[i].id_tipo_insumo == idtipo && this.tablaacusel[i].unidad != '' && this.tablaacusel[i].operador==null){
        sumasinporc+=Number(this.tablaacusel[i].parcial)
      }
    }
    if (indgrupo >= 0) {
      let parcant = Number(this.tablaacusel[indgrupo].parcial);
      let difer = parcant - suma;
      this.tablaacusel[indgrupo].parcial = this.formService.redondeo(suma, this.dec_parcial);
      this.preciototal=Number(this.formService.redondeo(this.preciototal-difer,this.dec_parcial));
      return sumasinporc;
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
          row.parcial=this.formService.redondeo(newparc,this.dec_parcial);
          this.Actparcialt1(row.id_tipo_insumo)
        }
      }
    }
  }
  async Reemplazar(){
    try{
      if(this.filaSelacu>-1){
        let rowsel=this.tablaacusel[this.filaSelacu];
        if(rowsel?.esinsumo==1){//insumos
          this.mostrar_carga_todo = true;
          // let insumos=await this.catalogosService.BuscarDataInsumos({id_usuario: this.id_user,id_tipo_insumo: rowsel.id_tipo_insumo,filtro:1,operador:rowsel.operador??'',tipo_insumo:rowsel.tipo_insumo??''});
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
          modalRef.componentInstance.rowfiltro=rowsel;
          modalRef.componentInstance.moneda = this.moneda;
          modalRef.componentInstance.iduser = this.id_user;
          const result = await modalRef.result
          if (result) {
            if (result.length > 0) {
              let rowant=JSON.parse(JSON.stringify(this.tablaacusel[this.filaSelacu]));
              //calcular parcial
              this.tablaacusel[this.filaSelacu].codigo=result[0].codigo;
              this.tablaacusel[this.filaSelacu].descripcion= result[0].descripcion;
              this.tablaacusel[this.filaSelacu].id_unidad=result[0].id_unidad;
              this.tablaacusel[this.filaSelacu].unidad= result[0].unidad;
              this.tablaacusel[this.filaSelacu].id_tipo_insumo= result[0].id_tipo_insumo;
              this.tablaacusel[this.filaSelacu].id_insumo= result[0].id_insumo;
              this.tablaacusel[this.filaSelacu].id_indice= result[0].id_indice;
              this.tablaacusel[this.filaSelacu].id_clasificacion=result[0].id_clasificacion;//revisar valores
              this.tablaacusel[this.filaSelacu].desc_clasi=result[0].id_clasificacion?result[0].desc_clasi:null;
              this.tablaacusel[this.filaSelacu].advceros=result[0].advceros;
              this.tablaacusel[this.filaSelacu].referencia=result[0].referencia;
              //actualizar en el principal
              //validar si es igual al actual para no realizar el proceso en vano
              this.mostrar_carga_todo=true;
              let objretorna = {
                opcion:4,//reemplazar
                tabla: this.tablaacusel[this.filaSelacu],
                anterior:rowant
              }
              await this.varGlobalesService.editaClasi.next(objretorna);
              console.log('termina emitir')
              this.mostrar_carga_todo=false;
            }
          }
        }
        else{//subpartidas
          this.toaster.error('No se puede reemplazar una subpartida, Eliminar la subpartida y Agregar una nueva.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
        }
      }
      else{
        this.toaster.error('Seleccione una fila para reemplazar.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      console.log(e)
    }
  }
  async verDatos(rowsel){
    if(rowsel.id_insumo!=''){
      let result = await this.catalogosService.DataInsumos({ id_insumo: rowsel.id_insumo })
      if(result.length>0){
        const modalRef = this.modalService.open(DatosinsumoComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
        modalRef.componentInstance.rowinsumo= result[0];
      }
      else{
        this.toaster.error('No se encontraron datos del insumo seleccionado.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
    else{
      
    }
  }
  //cambiar unidad
  cerrarModal2(){
    this.modalcambUnd.hide();
  }
  async ReempUnd(){
    if(this.filaSelacu>-1){
      if(this.tablaacusel[this.filaSelacu].operador=='%'){
        this.toaster.error('No se puede cambiar la unidad de este tipo de Insumo.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
      else{
        this.medidas = await this.adminservice.listarUnidadMed({ id_usuario:this.id_user,fuente:'',activo: 1,operador:1 })
        this.unidad.setValue(Number(this.tablaacusel[this.filaSelacu].id_unidad));
        this.modalcambUnd.show();
      }
    }
    else{
      this.toaster.error('Seleccione una fila para reemplazar la Unidad de Medida.','Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
  }
  async GuardaCambio(){
    //si unidad es diferente, se reasigna sino no se hace nada
    if(this.unidad.value!=this.tablaacusel[this.filaSelacu].id_unidad){
      let elem=this.medidas.find(ele=>ele.id_unidad==this.unidad.value);
      if(elem){
        this.tablaacusel[this.filaSelacu].id_unidad=this.unidad.value;
        this.tablaacusel[this.filaSelacu].unidad=elem.unidad;
        let objretorna = {
          opcion:5,//unidad
          anterior: this.tablaacusel[this.filaSelacu],
        }
        await this.varGlobalesService.editaClasi.next(objretorna);
        this.modalcambUnd.hide();
        console.log('termina emitir')
      }
    }
  }
  ordertabla(tord:any){
    console.log(tord)
    for(let row of this.tablaacusel){
      row.num_det=row.num_det>0?1:row.num_det;
    }
    if(tord==1){
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
    }
    else if(tord==2){
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
    }
    else if(tord==3){
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
    }
    else if(tord==4){
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
    }
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
