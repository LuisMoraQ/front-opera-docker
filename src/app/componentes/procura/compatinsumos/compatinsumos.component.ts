import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';

@Component({
  selector: 'app-compatinsumos',
  templateUrl: './compatinsumos.component.html',
  styleUrls: ['./compatinsumos.component.scss']
})
export class CompatinsumosComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  id_reg:any
  id_proyecto:any
  dec_metrado=4;
  mask_metrado='0.4';
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  mostrar_carga_todo=false;
  preventscroll=false;
  bcambiost8=false;

  dataSource6=[]
  heighttmodal13:any;
  buscando6=false;
  fila6_sel=-1
  //indfila6_sel=-1;
  tab6idgrsel='';
  idcomple='';

  dataSource7=[]
  paddingscroll2=0
  paddingscroll=0
  tab6total:any
  fila7_sel=-1

  DatosDisgre=[]
  tab7total:any
  dataSource8=[]
  fila8_sel=-1
  paddingscroll3=0
  paddingscroll4=0
  ind_disgrega=-1;

  dataSource8aux=[]
  fila8_selaux=-1
  canttotal8aux='';
  parcialtotal8aux='';
  @ViewChild("modalmostrar13a") modalmostrar13a: ModalBasicComponent;
  Frmmostrar13a = new FormGroup({
    Item13a: new FormControl('', Validators.required),
    InsumoPr13a: new FormControl(''),
    CantidadPr13a: new FormControl(''),
    PreciouPr13a: new FormControl(''),
    ParcialPr13a: new FormControl(''),
    Insumo13a: new FormControl('', Validators.required),
    Unidad13a: new FormControl('', Validators.required),
    Codigo13a: new FormControl('', Validators.required),
    Cantidad13a: new FormControl('', Validators.required),
    Preciou13a: new FormControl('', Validators.required),
    Parcial13a: new FormControl('', Validators.required),
  })
  get Item13a(): FormControl { return this.Frmmostrar13a.get('Item13a') as FormControl }
  get InsumoPr13a(): FormControl { return this.Frmmostrar13a.get('InsumoPr13a') as FormControl }
  get CantidadPr13a(): FormControl { return this.Frmmostrar13a.get('CantidadPr13a') as FormControl }
  get PreciouPr13a(): FormControl { return this.Frmmostrar13a.get('PreciouPr13a') as FormControl }
  get ParcialPr13a(): FormControl { return this.Frmmostrar13a.get('ParcialPr13a') as FormControl }
  get Insumo13a(): FormControl { return this.Frmmostrar13a.get('Insumo13a') as FormControl }
  get Unidad13a(): FormControl { return this.Frmmostrar13a.get('Unidad13a') as FormControl }
  get Codigo13a(): FormControl { return this.Frmmostrar13a.get('Codigo13a') as FormControl }
  get Cantidad13a(): FormControl { return this.Frmmostrar13a.get('Cantidad13a') as FormControl }
  get Preciou13a(): FormControl { return this.Frmmostrar13a.get('Preciou13a') as FormControl }
  get Parcial13a(): FormControl { return this.Frmmostrar13a.get('Parcial13a') as FormControl }

  constructor(
    private _logisticaService:LogisticaService,
    private toaster: ToastrService,
    public formService: FormsService,
  ) { }

  async ngOnInit() {
    this.heighttmodal13=(window.innerHeight-202)/2;
    this.id_reg=this.filareg.id_registro;
    this.id_proyecto=this.filareg.id_proyecto
    let decimales = this.decproy;
    console.log(decimales)
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
    //listar datos
    this.buscando6=true;
    let res=await this._logisticaService.listarRelinsAdqui({id_proyecto:this.id_proyecto,id_registro:this.id_reg,conrelins:'0'});
    console.log(res)//si no existe, mostrar mensaje para solicitar en pestana anterior
    this.buscando6=false;
    if(res?.length>0){
      this.dataSource6=res[0]
      this.DatosDisgre=res[1]
      this.ordenart6();
    }
    else{
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.heighttmodal13=(window.innerHeight-202)/2;
    }
    ngAfterContentChecked(): void {
      // this.changeDetector.detectChanges();
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
      //cambiar ancho del scroll
      var el_down = document.getElementById('tableBody2');
      if(el_down!=undefined){
        let sizeef = el_down.offsetWidth - el_down.clientWidth;
        if (this.paddingscroll3 != sizeef) {
          this.paddingscroll3 = sizeef;
        }
        let sizeef2 = el_down.offsetHeight - el_down.clientHeight;
        if (this.paddingscroll4 != sizeef2) {
          this.paddingscroll4 = sizeef2;
        }
      }
    }
  SyncScroll(){
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
  SyncScroll2(){
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
  SyncScroll1(){
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBody2");
      var face3 = document.getElementById("tableFoot2");
      face3.scrollLeft = face2.scrollLeft;
    }
    catch(ex){}
  }
  SyncScroll12(){
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBody2");
      var face3 = document.getElementById("tableFoot2");
      face2.scrollLeft = face3.scrollLeft;
    }catch(ex){}
  }
  cambindicesel6(ind:any,row:any){
    if(ind==this.fila6_sel)
    {
      this.fila6_sel=-1;
      //this.indfila6_sel=-1;
      this.tab6idgrsel='';
      this.idcomple='';
      this.tab6total='';
      this.fila7_sel=-1;
      this.tab7total='';
      this.dataSource8=[];
      this.dataSource7=[];
    }
    else{
      this.fila6_sel=ind;
      //this.indfila6_sel=row.indice;
      this.tab6idgrsel=row.idgrupo;
      this.idcomple=row.id_comple;
      this.tab6total=row.parcial;
      //this.tab7total=row.reqsol;
      this.cargartabla7(this.tab6idgrsel);
      this.cargartabla8mostrar(this.idcomple);
    }
  }
  cargartabla7(idgru:any){
    this.dataSource7=[];
    for(let row of this.dataSource6){
      if(row.idgrupo==idgru && row.indice!=null){
        this.dataSource7.push(row)
      }
    }
  }
  cargartabla8mostrar(idcom:any){
    this.dataSource8=[];
    let totalgru=0;
    for(let j=0;j<this.dataSource6.length;j++){
      if(this.dataSource6[j].id_comple==idcom){
        let idgrucom=this.dataSource6[j].idgrupo;
        let filagru={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgrucom,idfila:this.dataSource6[j].idfila,indrep:0,orden:null,indice:this.dataSource6[j].indice,id_filadetalle:this.dataSource6[j].id_filadetalle,
        num_det:this.dataSource6[j].num_det,codigo:this.dataSource6[j].codigo,descripcion:this.dataSource6[j].descripcion,unidad:this.dataSource6[j].unidad,cantidad:null,
        precio:null,parcial:null,operador:null,acumulado:this.dataSource6[j].reqsol,proceso:'',princi:0,estado:0,ingreso:0,salida:0,mostrar:1,icomost:1};

        this.dataSource8.push(filagru)
        totalgru=totalgru+Number(this.dataSource6[j].reqsol);
        
        if(this.DatosDisgre.length>0){
          for(let i=0;i<this.DatosDisgre.length;i++){
            if(this.DatosDisgre[i].idgrupo==idgrucom){
              this.dataSource8.push(this.DatosDisgre[i]);
            }
          }
        }
      }
    }
    this.tab7total=this.formService.redondeo(totalgru,this.dec_parcial)
    for(let h=0;h<this.dataSource6.length;h++){
      if(this.dataSource6[h].id_comple==idcom && this.dataSource6[h].complemento==0){
        let parcial=Number(this.dataSource6[h].parcial);
        let varia=((parcial-totalgru)/parcial)*100;
        this.dataSource6[h].variacion=this.formService.redondeo(varia,2);
      }
    }
    //aqui podemos agregar la variacion
  }
  cambindicesel7(ind:any){
    if(ind==this.fila7_sel)
    {
      this.fila7_sel=-1;
    }
    else{
      this.fila7_sel=ind;
    }
  }
  agregardirecto(ind:any){
    console.log(ind)
    console.log(this.dataSource7[ind])
    let idgru=this.dataSource7[ind].idgrupo;
    let codig=this.dataSource7[ind].idfila;
    var parcial=this.dataSource7[ind].parcial;
    let indgrupo=-1;
    for(let j=0;j<this.dataSource8.length;j++){//para condicionar si existe
      if(this.dataSource8[j].idgrupo==idgru && this.dataSource8[j].idfila==codig && this.dataSource8[j].princi==1)
      {
        indgrupo=j;
      }
    }
    //validar que no exista en t8 antes de agregar
    if(indgrupo==-1){//no existe entonces se puede agregar directo
      let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgru,idfila:this.dataSource7[ind].idfila,indrep:0,orden:this.dataSource8.length,indice:this.dataSource7[ind].indice,id_filadetalle:this.dataSource7[ind].id_filadetalle,
        num_det:this.dataSource7[ind].num_det,codigo:this.dataSource7[ind].codigo,descripcion:this.dataSource7[ind].descripcion,unidad:this.dataSource7[ind].unidad,cantidad:this.dataSource7[ind].cantidad,
        precio:this.dataSource7[ind].precio,parcial:this.dataSource7[ind].parcial,operador:this.dataSource7[ind].operador,acumulado:this.dataSource7[ind].parcial,proceso:'',princi:1,estado:0,ingreso:0,salida:0,icomost:1};
      this.dataSource8.push(ejm);
      this.bcambiost8=true;
      //agregar tambien a data
      this.DatosDisgre.push(JSON.parse(JSON.stringify(ejm)))

      //las desviaciones y requerimiento solicitado
      let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
      let paragre=Number(parcial);

      this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);

      let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
      let varia=this.formService.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
      this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
      //para los saldos
      let parc1=Number(this.dataSource6[ind].parcial);
      let sald=(((parc1-(paragre))/parc1)*100);
      this.dataSource6[ind].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
      this.dataSource6[ind].accion=1;
      
      //this.actualizarvistat5();

      //this.ordenart6();//ES NECESARIO
      this.cargartabla8mostrar(this.idcomple);//TAMBIEN ES NECESARIO?
      console.log(this.dataSource8)
    }
    else{//entra al siguiente porque existe
      this.toaster.error('No se puede agregar directamente porque ya existe. Usar la opción de disgregar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  ordenart6(){//revisar
    try{
      if(this.dataSource6.length>0){//generar otra tabla?
        this.dataSource6.sort(function (a, b) {
          if (Number(a.id_comple?a.id_comple.split('-')[1]:0) > Number(b.id_comple?b.id_comple.split('-')[1]:0)) {
            return 1;
          }
          if (Number(a.id_comple?a.id_comple.split('-')[1]:0) < Number(b.id_comple?b.id_comple.split('-')[1]:0)) {
            return -1;
          }
          return 0;
        });
      }
    }
    catch(error){
    }
  }

  cambindicesel8(ind:any){
    if(ind==this.fila8_sel)
    {
      this.fila8_sel=-1;
    }
    else{
      this.fila8_sel=ind;
    }
  }
  toggleOn8(id:string){
    for(let row of this.dataSource8){
      if(row.idgrupo==id)
      {
        if(row.indice!=null)
        {
          row.mostrar="1";
        }
        else
          row.icomost=1;
      }
    }
  }
  toggleOff8(id:string){
    for(let row of this.dataSource8){
      if(row.idgrupo==id)
      {
        if(row.indice!=null)
        {
          row.mostrar="0";
        }
        else
          row.icomost=0;
      }
    }
  }
  quitarfilat8(ind:any){
    let idgru1=this.dataSource8[ind].idgrupo;
    let codigo1=this.dataSource8[ind].idfila;
    let indrep1=this.dataSource8[ind].indrep;
    let indt8d=-1;
    for(let h=0;h<this.dataSource8.length;h++){
      if(this.dataSource8[h].idgrupo==idgru1 && this.dataSource8[h].idfila==codigo1 && this.dataSource8[h].indrep==indrep1){
        indt8d=h;
      }
    }
    let parcialdel=Number(this.dataSource8[indt8d].parcial);
    let acumdel=this.dataSource8[indt8d].acumulado;
    //las desviaciones y requerimiento solicitado
    let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
    this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo((reqsoli-parcialdel),this.dec_parcial);
    //this.tab7total=this.redondeo((reqsoli-parcialdel),this.dec_parcial);
    let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
    let varia=this.formService.redondeo((((parcialgru-(reqsoli-parcialdel))/parcialgru)*100),2);
    this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
    //si se elimina grupo, agregar acumulado al siguiente o no agregar nada 0
    let difer=0;
    if(acumdel!=''){//principal
      difer=Number(acumdel)-parcialdel;
      for(let k=indt8d+1;k<this.dataSource8.length;k++){
        if(this.dataSource8[k].idfila==this.dataSource8[indt8d].idfila){
          this.dataSource8[k].acumulado=this.formService.redondeo(difer,this.dec_parcial);
          this.dataSource8[k].princi=1;
          break;
        }
      }
    }
    else{//detalle  
      for(let k=indt8d;k>=0;k--){
        if(this.dataSource8[k].idfila==this.dataSource8[indt8d].idfila && this.dataSource8[k].princi==1){
          difer=Number(this.dataSource8[k].acumulado)-parcialdel;
          this.dataSource8[k].acumulado=this.formService.redondeo(difer,this.dec_parcial);
          break;
        }
      }
    }

    //para los saldos
    for(let i=this.fila6_sel;i<this.dataSource6.length;i++){
      if(this.dataSource6[i].idfila==this.dataSource8[indt8d].idfila){
        let parc1=Number(this.dataSource6[i].parcial);
        let sald=(((parc1-(difer))/parc1)*100);
        this.dataSource6[i].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
        break;
      }
    }
    //this.actualizarvistat5();
    for(let a=0;a<this.DatosDisgre.length;a++){
      if(this.DatosDisgre[a].idfila==this.dataSource8[indt8d].idfila && this.DatosDisgre[a].indrep==this.dataSource8[indt8d].indrep){
        this.DatosDisgre.splice(a,1)
        break;
      }
    }
    this.dataSource8.splice(indt8d,1);
    this.cargartabla8mostrar(this.idcomple);
    this.bcambiost8=true;
  }

  agregarinsumo(ind:any){
    this.ind_disgrega=ind;
    if(ind!=-1){
      this.Item13a.setValue(this.dataSource7[ind].num_det)
      this.InsumoPr13a.setValue(this.dataSource7[ind].descripcion)
      this.CantidadPr13a.setValue(this.formService.redondeo(this.dataSource7[ind].cantidad,this.dec_cant))
      this.PreciouPr13a.setValue(this.formService.redondeo(this.dataSource7[ind].precio,this.dec_precio))
      this.ParcialPr13a.setValue(this.formService.redondeo(this.dataSource7[ind].parcial,this.dec_parcial))
      this.Insumo13a.setValue(this.dataSource7[ind].descripcion)
      this.Unidad13a.setValue(this.dataSource7[ind].unidad)
      this.Codigo13a.setValue(this.dataSource7[ind].codigo)
      this.Cantidad13a.setValue(this.formService.redondeo(this.dataSource7[ind].cantidad,this.dec_cant))
      this.Preciou13a.setValue(this.formService.redondeo(this.dataSource7[ind].precio,this.dec_precio))
      this.Parcial13a.setValue(this.formService.redondeo(this.dataSource7[ind].parcial,this.dec_parcial))
      //agregar los disgregados existentes
      let idgru=this.dataSource7[ind].idgrupo;
      let idfila=this.dataSource7[ind].idfila;
      for(let i=0;i<this.dataSource8.length;i++){
        if(this.dataSource8[i].idgrupo==idgru && this.dataSource8[i].idfila==idfila){
          let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgru,idfila:this.dataSource8[i].idfila,indrep:this.dataSource8[i].indrep,orden:this.dataSource8[i].orden,
            indice:this.dataSource8[i].indice,id_filadetalle:this.dataSource8[i].id_filadetalle,num_det:this.dataSource8[i].num_det,codigo:this.dataSource8[i].codigo,descripcion:this.dataSource8[i].descripcion,
            unidad:this.dataSource8[i].unidad,cantidad:this.dataSource8[i].cantidad,precio:this.dataSource8[i].precio,parcial:this.dataSource8[i].parcial,operador:this.dataSource8[i].operador,
            acumulado:this.dataSource8[i].acumulado,proceso:this.dataSource8[i].proceso,princi:this.dataSource8[i].princi,estado:this.dataSource8[i].estado,ingreso:this.dataSource8[i].ingreso,
            salida:this.dataSource8[i].salida,mostrar:this.dataSource8[i].mostrar,icomost:this.dataSource8[i].icomost,existe:1};//existe se usa?
          this.dataSource8aux.push(ejm);
          this.calcfoottab8aux();
        }
      }
      this.modalmostrar13a.show();
    }
    else
    {
      this.toaster.error('Seleccione un insumo en la tabla de la izquierda.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  cerrarModalmostrar13a(){
    this.ind_disgrega=-1;
    this.fila8_selaux=-1;
    this.canttotal8aux='';
    this.parcialtotal8aux='';
    this.dataSource8aux=[];
    this.modalmostrar13a.hide();
  }
  Agregartabla8aux(){
    if(!this.Frmmostrar13a.invalid)
    {
      var insumo=this.Insumo13a.value;
      var unid=this.Unidad13a.value;
      var idinsum=this.Codigo13a.value;
      var cantidad=this.Cantidad13a.value;
      var precio=this.Preciou13a.value;
      var parcial=this.Parcial13a.value;
      let idgru=this.dataSource7[this.ind_disgrega].idgrupo;

      let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgru,idfila:this.dataSource7[this.ind_disgrega].idfila,indrep:null,orden:null,
          indice:this.dataSource7[this.ind_disgrega].indice,id_filadetalle:this.dataSource7[this.ind_disgrega].id_filadetalle,num_det:this.dataSource7[this.ind_disgrega].num_det,codigo:idinsum,descripcion:insumo,
          unidad:unid,cantidad:cantidad,precio:precio,parcial:parcial,operador:this.dataSource7[this.ind_disgrega].operador,
          acumulado:null,proceso:'',princi:0,estado:0,ingreso:0,salida:0,mostrar:1,icomost:1,existe:0};
      this.dataSource8aux.push(ejm);
      this.calcfoottab8aux();
    } 
    else
    {
      this.Frmmostrar13a.markAllAsTouched();
      this.toaster.error('Debe llenar los campos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  lvcantm13a(eve:any){
    let preclv=Number(this.Preciou13a.value);
    let cantlv=Number(eve.target.value.toString());
    let parciallv=cantlv*preclv;
    this.Cantidad13a.setValue(this.formService.redondeo(cantlv,this.dec_cant));
    this.Parcial13a.setValue(this.formService.redondeo(parciallv,this.dec_parcial));
  }
  presenterCant(event:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      console.log(this.Cantidad13a)
      this.lvcantm13a(this.Cantidad13a.value)//el primer parametro es el valor de la celda a editar
    }
    else if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
  }
  lvprem13a(eve:any){
    let cantlv=Number(this.Frmmostrar13a.get('Cantidad13a').value);
    let preclv=Number(eve.target.value.toString());
    let parciallv=cantlv*preclv;
    //this.Preciou13a.setValue(this.formService.redondeo(preclv,this.dec_precio));
    this.Parcial13a.setValue(this.formService.redondeo(parciallv,this.dec_parcial));
  }
  //modal mostrra 13b
  buscarinsumo(){
    // let itm=this.Frmmostrar13a.get('Parcial13a').value;
    // if(itm!=''){
    //   this.mostrar_carga_todo=true;
    //   this._logisticaService.ListarDataInusmo(this.cui,"").subscribe((res:any)=>{
    //     let tabla1=res;
    //     this.dataSource8aux2.data=tabla1;
    //     this.mostrar_carga_todo=false;
    //     this.modalmostrar13b.show();
    //     this.mostrarbusqins=true;
    //     /* setTimeout(()=>{ */
    //     /* }, 1000); */
    //   },err => {
    //     // Entra aquí si el servicio entrega un código http de error EJ: 404, 
    //     this.mostrar_carga_todo=false;
    //   });
    // }
    // else
    // {
    //   this.addToast({title:'Advertencia', msg:'No se cargo el item correctamente.', timeout: 5000, theme:'default', position:'bottom-right', type:'error'})
    // }
  }
  cambindicesel8aux(ind:any){
    if(ind==this.fila8_selaux)
    {
      this.fila8_selaux=-1;
    }
    else{
      this.fila8_selaux=ind;
    }
  }
  quitarfilat8aux(ind:any){
    this.dataSource8aux.splice(ind,1);
    this.calcfoottab8aux();
  }
  calcfoottab8aux(){
    //calcular totales
    let totcant=0;
    let totparc=0;
    for(let row of this.dataSource8aux){
      totcant=totcant+Number(row.cantidad.toString());
      totparc=totparc+Number(row.parcial.toString());
    }
    this.canttotal8aux=this.formService.redondeo(totcant,this.dec_parcial)
    this.parcialtotal8aux=this.formService.redondeo(totparc,this.dec_parcial)
  }
  GuardarModalmostrar13a(){
    // if(this.dataSource8aux.data.length>0){
    //   //recorrer la tabla, agregar y calcular los valores de saldo y variacion
    //   var item=this.Frmmostrar13a.get('Item13a').value;
    //   let idgru=this.dataSource5Pri[this.ind_disgrega].idgrupo;
    //   let codig=this.dataSource5Pri[this.ind_disgrega].codigo;

    //   let tablaux=[];
    //   let indgrupo=-1;
    //   let idgraux='';
    //   let nroitemgru='';
    //   let codigogru='';
    //   let inddetfin=-1;
    //   let nrorep=0;

    //   for(let j=0;j<this.dataSource8.data.length;j++){
    //     if(idgraux!='' && nroitemgru!='' && codigogru!=''){
    //       if(this.dataSource8.data[j].princi==1)
    //       {
    //         inddetfin=j;
    //         break;
    //       }
    //       nrorep=nrorep+1;
    //     }
    //     tablaux.push(this.dataSource8.data[j]);
    //     if(this.dataSource8.data[j].idgrupo==idgru && this.dataSource8.data[j].nro==item && this.dataSource8.data[j].codigo==codig && this.dataSource8.data[j].princi==1)
    //     {
    //       indgrupo=j;
    //       idgraux=this.dataSource8.data[j].idgrupo;
    //       nroitemgru=this.dataSource8.data[j].nro;
    //       codigogru=this.dataSource8.data[j].codigo;
    //     }
    //   }

    //   if(indgrupo==-1){
    //     let ejm:filatabla8;
    //     for(let i=0;i<this.dataSource8aux.data.length;i++){
    //       ejm={idgrupo:idgru,idinsumo:this.dataSource8aux.data[i].idinsumo,codigo:this.dataSource8aux.data[i].codigo,nro:this.dataSource8aux.data[i].nro,descripcion:this.dataSource8aux.data[i].descripcion,
    //         unidad:this.dataSource8aux.data[i].unidad,cantidad:this.dataSource8aux.data[i].cantidad,
    //         precio:this.dataSource8aux.data[i].precio,parcial:this.dataSource8aux.data[i].parcial,acumulado:i==0?this.parcialtotal8aux:'',proceso:'',princi:i==0?1:0,indrep:nrorep++,estado:0,ingreso:'0.00',salida:'0.00'};
    //       tablaux.push(ejm);
    //     }
    //     this.dataSource8.data=tablaux;
    //     this.bcambiost8=true;
    //     //las desviaciones y requerimiento solicitado
    //     let reqsoli=Number(this.dataSource5Pri[this.indfila6_sel].reqsol.replace(/\,/g,''));
    //     let paragre=Number(this.parcialtotal8aux.replace(/\,/g,''));

    //     this.dataSource5Pri[this.indfila6_sel].reqsol=this.redondeo((reqsoli+paragre),this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    //     let parcialgru=Number(this.dataSource5Pri[this.indfila6_sel].parcial.replace(/\,/g,''));
    //     let varia=this.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
    //     this.dataSource5Pri[this.indfila6_sel].variacion=this.dataSource5Pri[this.indfila6_sel].complemento==1?'':varia;

    //     //para los saldos
    //     let parc1=Number(this.dataSource5Pri[this.ind_disgrega].parcial.replace(/\,/g,''));
    //     let sald=(((parc1-(paragre))/parc1)*100);
    //     this.dataSource5Pri[this.ind_disgrega].saldo=sald<0?'0.00':this.redondeo(sald,2);
    //     this.actualizarvistat5();

    //     let tabla6aux=[];
    //     for(let row of this.dataSource5Pri){
    //       if(row.idinsumo==''){
    //         tabla6aux.push(row);
    //       }
    //     }
    //     this.dataSource6.data=tabla6aux;
    //     this.ordenart6();
    //     this.cargartabla8mostrar(this.idcomple);
    //   }
    //   else{
    //     nrorep=nrorep+1;
    //     let sumdif=0;
    //     for(let i=0;i<this.dataSource8aux.data.length;i++){
    //       if(this.dataSource8aux.data[i].existe==0){
    //         let ejm1:filatabla8;
    //         ejm1={idgrupo:idgru,idinsumo:this.dataSource8aux.data[i].idinsumo,codigo:this.dataSource8aux.data[i].codigo,nro:this.dataSource8aux.data[i].nro,descripcion:this.dataSource8aux.data[i].descripcion,
    //           unidad:this.dataSource8aux.data[i].unidad,cantidad:this.dataSource8aux.data[i].cantidad,
    //           precio:this.dataSource8aux.data[i].precio,parcial:this.dataSource8aux.data[i].parcial,acumulado:'',proceso:'',princi:0,indrep:nrorep++,estado:0,ingreso:'0.00',salida:'0.00'};
    
    //         sumdif=sumdif+Number(this.dataSource8aux.data[i].parcial.replace(/\,/g,''));
    //         tablaux.push(ejm1);
    //       }
    //     }
    //     let suma=Number(this.dataSource8.data[indgrupo].acumulado.replace(/\,/g,''));
    //     suma=suma+sumdif;
    //     tablaux[indgrupo].acumulado=this.redondeo(suma,this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        
    //     if(inddetfin>-1){
    //       for(let k=inddetfin;k<this.dataSource8.data.length;k++){
    //         tablaux.push(this.dataSource8.data[k]);
    //       }
    //     }
    //     this.dataSource8.data=tablaux;
    //     this.bcambiost8=true;
    //     //las desviaciones y requerimiento solicitado
    //     let reqsoli=Number(this.dataSource5Pri[this.indfila6_sel].reqsol.replace(/\,/g,''));

    //     this.dataSource5Pri[this.indfila6_sel].reqsol=this.redondeo(reqsoli+sumdif,this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    //     let parcialgru=Number(this.dataSource5Pri[this.indfila6_sel].parcial.replace(/\,/g,''));
    //     let varia=this.redondeo((((parcialgru-(reqsoli+sumdif))/parcialgru)*100),2);
    //     this.dataSource5Pri[this.indfila6_sel].variacion=this.dataSource5Pri[this.indfila6_sel].complemento==1?'':varia;

    //     //para los saldos
    //     let parc1=Number(this.dataSource5Pri[this.ind_disgrega].parcial.replace(/\,/g,''));
    //     let sald=(((parc1-(suma))/parc1)*100);
    //     this.dataSource5Pri[this.ind_disgrega].saldo=sald<0?'0.00':this.redondeo(sald,2);
    //     this.actualizarvistat5();

    //     let tabla6aux=[];
    //     for(let row of this.dataSource5Pri){
    //       if(row.idinsumo==''){
    //         tabla6aux.push(row);
    //       }
    //     }
    //     this.dataSource6.data=tabla6aux;
    //     this.ordenart6();
    //     this.cargartabla8mostrar(this.idcomple);
    //   }

    //   this.cerrarModalmostrar13a();
    // }
    // else
    // {
    //   if(!this.Frmmostrar13a.invalid)
    //   {
    //     var item=this.Frmmostrar13a.get('Item13a').value;
    //     var insumo=this.Frmmostrar13a.get('Insumo13a').value;
    //     var unid=this.Frmmostrar13a.get('Unidad13a').value;
    //     var idinsum=this.Frmmostrar13a.get('Codigo13a').value;
    //     var cantidad=this.Frmmostrar13a.get('Cantidad13a').value;
    //     var precio=this.Frmmostrar13a.get('Preciou13a').value;
    //     var parcial=this.Frmmostrar13a.get('Parcial13a').value;

    //     let idgru=this.dataSource5Pri[this.ind_disgrega].idgrupo;
    //     let codig=this.dataSource5Pri[this.ind_disgrega].codigo;
        
    //     let tablaux=[];
    //     let indgrupo=-1;
    //     let idgraux='';
    //     let nroitemgru='';
    //     let codigogru='';
    //     let inddetfin=-1;
    //     let nrorep=0;

    //     for(let j=0;j<this.dataSource8.data.length;j++){
    //       if(idgraux!='' && nroitemgru!='' && codigogru!=''){
    //         if(this.dataSource8.data[j].princi==1)
    //         {
    //           inddetfin=j;
    //           break;
    //         }
    //         nrorep=nrorep+1;
    //       }
    //       tablaux.push(this.dataSource8.data[j]);
    //       if(this.dataSource8.data[j].idgrupo==idgru && this.dataSource8.data[j].nro==item && this.dataSource8.data[j].codigo==codig && this.dataSource8.data[j].princi==1)
    //       {
    //         indgrupo=j;
    //         idgraux=this.dataSource8.data[j].idgrupo;
    //         nroitemgru=this.dataSource8.data[j].nro;
    //         codigogru=this.dataSource8.data[j].codigo;
    //       }
    //     }

    //     if(indgrupo==-1){//no entrara porque se carga en t8aux al existir
    //       let ejm:filatabla8;
    //       ejm={idgrupo:idgru,idinsumo:idinsum,codigo:codig,nro:item,descripcion:insumo,unidad:unid,cantidad:cantidad,
    //         precio:precio,parcial:parcial,acumulado:parcial,proceso:'',princi:1,indrep:0,estado:0,ingreso:'0.00',salida:'0.00'};
    //       tablaux.push(ejm);

    //       this.dataSource8.data=tablaux;
    //       this.bcambiost8=true;
    //       //las desviaciones y requerimiento solicitado
    //       let reqsoli=Number(this.dataSource5Pri[this.indfila6_sel].reqsol.replace(/\,/g,''));
    //       let paragre=Number(parcial.replace(/\,/g,''));

    //       this.dataSource5Pri[this.indfila6_sel].reqsol=this.redondeo((reqsoli+paragre),this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    //       let parcialgru=Number(this.dataSource5Pri[this.indfila6_sel].parcial.replace(/\,/g,''));
    //       let varia=this.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
    //       this.dataSource5Pri[this.indfila6_sel].variacion=this.dataSource5Pri[this.indfila6_sel].complemento==1?'':varia;

    //       //para los saldos
    //       let parc1=Number(this.dataSource5Pri[this.ind_disgrega].parcial.replace(/\,/g,''));
    //       let sald=(((parc1-(paragre))/parc1)*100);
    //       this.dataSource5Pri[this.ind_disgrega].saldo=sald<0?'0.00':this.redondeo(sald,2);
          
    //       this.actualizarvistat5();
    //       let tabla6aux=[];
    //       for(let row of this.dataSource5Pri){
    //         if(row.idinsumo==''){
    //           tabla6aux.push(row);
    //         }
    //       }
    //       this.dataSource6.data=tabla6aux;
    //       this.ordenart6();
    //       this.cargartabla8mostrar(this.idcomple);
    //     }
    //     else{
    //       nrorep=nrorep+1;
    //       let suma=Number(this.dataSource8.data[indgrupo].acumulado.replace(/\,/g,''));
          
    //       let ejm1={idgrupo:idgru,idinsumo:idinsum,codigo:codig,nro:item,descripcion:insumo,unidad:unid,cantidad:cantidad,
    //         precio:precio,parcial:parcial,acumulado:'',proceso:'',princi:0,indrep:nrorep};

    //       tablaux.push(ejm1);

    //       suma=suma+Number(parcial.replace(/\,/g,''));
    //       tablaux[indgrupo].acumulado=this.redondeo(suma,this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,');
          
    //       if(inddetfin>-1){
    //         for(let k=inddetfin;k<this.dataSource8.data.length;k++){
    //           tablaux.push(this.dataSource8.data[k]);
    //         }
    //       }
    //       this.dataSource8.data=tablaux;
    //       this.bcambiost8=true;
    //       //las desviaciones y requerimiento solicitado
    //       let reqsoli=Number(this.dataSource5Pri[this.indfila6_sel].reqsol.replace(/\,/g,''));
    //       let paragre=Number(parcial.replace(/\,/g,''));
    //       this.dataSource5Pri[this.indfila6_sel].reqsol=this.redondeo((reqsoli+paragre),this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    //       let parcialgru=Number(this.dataSource5Pri[this.indfila6_sel].parcial.replace(/\,/g,''));
    //       let varia=this.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
    //       this.dataSource5Pri[this.indfila6_sel].variacion=this.dataSource5Pri[this.indfila6_sel].complemento==1?'':varia;

    //       //para los saldos
    //       let parc1=Number(this.dataSource5Pri[this.ind_disgrega].parcial.replace(/\,/g,''));
    //       let sald=(((parc1-(suma))/parc1)*100);
    //       this.dataSource5Pri[this.ind_disgrega].saldo=sald<0?'0.00':this.redondeo(sald,2);
    //       this.actualizarvistat5();

    //       let tabla6aux=[];
    //       for(let row of this.dataSource5Pri){
    //         if(row.idinsumo==''){
    //           tabla6aux.push(row);
    //         }
    //       }
    //       this.dataSource6.data=tabla6aux;
    //       this.ordenart6();
    //       this.cargartabla8mostrar(this.idcomple);
    //     }
    //     this.cerrarModalmostrar13a();
    //   }
    //   else
    //   {
    //     this.Frmmostrar13a.get('Item13a').markAsTouched();
    //     this.Frmmostrar13a.get('Insumo13a').markAsTouched();
    //     this.Frmmostrar13a.get('Unidad13a').markAsTouched();
    //     this.Frmmostrar13a.get('Codigo13a').markAsTouched();
    //     this.Frmmostrar13a.get('Cantidad13a').markAsTouched();
    //     this.Frmmostrar13a.get('Preciou13a').markAsTouched();
    //     this.Frmmostrar13a.get('Parcial13a').markAsTouched();
        
    //     this.addToast({title:'Advertencia', msg:'Debe llenar los campos.', timeout: 5000, theme:'default', position:'bottom-right', type:'error'})
    //   }
    // }
  }
}
