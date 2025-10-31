import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { SwalService } from 'src/app/servicios/swal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportesComponent } from '../../proyectos/reportes/reportes.component';

@Component({
  selector: 'app-compatinsumos',
  templateUrl: './compatinsumos.component.html',
  styleUrls: ['./compatinsumos.component.scss']
})
export class CompatinsumosComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  solover=false
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
    Codigo13a: new FormControl(''),
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
    private principalService:PrincipalService,
    private modalService: NgbModal,
    public formService: FormsService,
  ) { }

  async ngOnInit() {
    this.heighttmodal13=(window.innerHeight-202)/2;
    this.id_reg=this.filareg.id_registro;
    this.id_proyecto=this.filareg.id_proyecto
    this.simbolo=this.filareg.simbolo
    this.solover=this.filareg.solover
    let decimales = this.decproy;
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
    this.buscando6=false;
    if(res?.length>0){
      this.dataSource6=res[0]
      this.DatosDisgre=res[1]
      this.ordenart6();
      console.log(this.dataSource6)
      console.log(this.DatosDisgre)
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
        precio:null,parcial:null,operador:null,acumulado:this.dataSource6[j].reqsol,proceso:'',princi:0,estado:0,ingreso:0,salida:0,fecha_sol:null,mostrar:1,icomost:1,editar:0,editar2:0};
        this.dataSource8.push(filagru)
        totalgru=totalgru+Number(this.dataSource6[j].reqsol);
        if(this.DatosDisgre.length>0){
          for(let i=0;i<this.DatosDisgre.length;i++){
            if(this.DatosDisgre[i].idgrupo==idgrucom){
              let filaaux=JSON.parse(JSON.stringify(this.DatosDisgre[i]))
              filaaux.editar=0
              filaaux.editar2=0
              this.dataSource8.push(filaaux);
            }
          }
        }
      }
    }
    if(this.dataSource8.length>0){
      this.dataSource8.sort(function (a, b) {
        if (Number(a.idgrupo.split('-')[1]) > Number(b.idgrupo.split('-')[1])) {
          return 1;
        }
        if (Number(a.idgrupo.split('-')[1]) < Number(b.idgrupo.split('-')[1])) {
          return -1;
        }
        if (Number(a.orden??0) > Number(b.orden??0)) {
          return 1;
        }
        if (Number(a.orden??0) < Number(b.orden??0)) {
          return -1;
        }
        return 0;
      });
    }
    this.tab7total=this.formService.redondeo(totalgru,this.dec_parcial)
    for(let h=0;h<this.dataSource6.length;h++){
      if(this.dataSource6[h].id_comple==idcom && this.dataSource6[h].complemento==0){
        let parcial=Number(this.dataSource6[h].parcial);
        let varia=((parcial-totalgru)/parcial)*100;
        this.dataSource6[h].variacion=this.formService.redondeo(varia,2);
        this.dataSource6[h].accion=1
      }
    }
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
      let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgru,idfila:this.dataSource7[ind].idfila,indrep:0,orden:this.UltOrden(),indice:this.dataSource7[ind].indice,id_filadetalle:this.dataSource7[ind].id_filadetalle,
        num_det:this.dataSource7[ind].num_det,codigo:this.dataSource7[ind].codigo,descripcion:this.dataSource7[ind].descripcion,unidad:this.dataSource7[ind].unidad,
        cantidad:this.dataSource7[ind].operador=='%'?1:this.dataSource7[ind].cantidad,
        precio:this.dataSource7[ind].operador=='%'?this.dataSource7[ind].parcial:this.dataSource7[ind].precio,parcial:this.dataSource7[ind].parcial,
        operador:this.dataSource7[ind].operador,acumulado:this.dataSource7[ind].parcial,proceso:'',princi:1,estado:0,ingreso:0,salida:0,fecha_sol:null,mostrar:1,icomost:1,editar:0,editar2:0};
      this.dataSource8.push(ejm);
      this.bcambiost8=true;
      //agregar tambien a data
      this.DatosDisgre.push(JSON.parse(JSON.stringify(ejm)))
      //las desviaciones y requerimiento solicitado
      let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
      let paragre=Number(parcial);
      this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);
      this.tab7total=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);

      let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
      let varia=this.formService.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
      this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
      this.dataSource6[this.fila6_sel].accion=1
      //para los saldos
      let parc1=Number(this.dataSource7[ind].parcial);
      let sald=(((parc1-(paragre))/parc1)*100);
      for(let row of this.dataSource6){
        if(row.idgrupo==idgru && row.idfila==codig){
          row.saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
          row.accion=1;
          break;
        }
      }
      this.dataSource7[ind].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
      //this.actualizarvistat5();
      //this.ordenart6();//ES NECESARIO
      this.cargartabla8mostrar(this.idcomple);//TAMBIEN ES NECESARIO?
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
    let parcialdel=Number(this.dataSource8[ind].parcial);
    let acumdel=this.dataSource8[ind].acumulado;
    //las desviaciones y requerimiento solicitado
    let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
    this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo((reqsoli-parcialdel),this.dec_parcial);
    this.tab7total=this.formService.redondeo((reqsoli-parcialdel),this.dec_parcial);
    let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
    let varia=this.formService.redondeo((((parcialgru-(reqsoli-parcialdel))/parcialgru)*100),2);
    this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
    this.dataSource6[this.fila6_sel].accion=1
    //si se elimina grupo, agregar acumulado al siguiente o no agregar nada 0
    let difer=0;
    if((acumdel??'')!=''){//principal
      difer=Number(acumdel)-parcialdel;
      for(let k=ind+1;k<this.dataSource8.length;k++){
        if(this.dataSource8[k].idfila==this.dataSource8[ind].idfila){
          this.dataSource8[k].acumulado=this.formService.redondeo(difer,this.dec_parcial);
          this.dataSource8[k].princi=1;//actualizar a la data principal
          for(let row1 of this.DatosDisgre){
            if(row1.idgrupo==this.dataSource8[k].idgrupo && row1.idfila==this.dataSource8[k].idfila && row1.indrep==this.dataSource8[k].indrep){
              row1.acumulado=this.formService.redondeo(difer,this.dec_parcial);
              row1.princi=1
              break;
            }
          }
          break;
        }
      }
    }
    else{//detalle  
      for(let k=ind;k>=0;k--){
        if(this.dataSource8[k].idfila==this.dataSource8[ind].idfila && this.dataSource8[k].princi==1){
          difer=Number(this.dataSource8[k].acumulado)-parcialdel;
          this.dataSource8[k].acumulado=this.formService.redondeo(difer,this.dec_parcial);
          for(let row1 of this.DatosDisgre){
            if(row1.idgrupo==this.dataSource8[k].idgrupo && row1.idfila==this.dataSource8[k].idfila && row1.indrep==this.dataSource8[k].indrep){
              row1.acumulado=this.formService.redondeo(difer,this.dec_parcial);
              break;
            }
          }
          break;
        }
      }
    }
    //para los saldos
    for(let i=0;i<this.dataSource6.length;i++){
      if(this.dataSource6[i].idgrupo==this.dataSource8[ind].idgrupo && this.dataSource6[i].idfila==this.dataSource8[ind].idfila){
        let parc1=Number(this.dataSource6[i].parcial);
        let sald=(((parc1-(difer))/parc1)*100);
        this.dataSource6[i].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
        this.dataSource6[i].accion=1
        for(let row1 of this.dataSource7){
          if(row1.idgrupo==this.dataSource6[i].idgrupo && row1.idfila==this.dataSource6[i].idfila){
            row1.saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
            break;
          }
        }
        break;
      }
    }
    //this.actualizarvistat5();
    for(let a=0;a<this.DatosDisgre.length;a++){
      if(this.DatosDisgre[a].idgrupo==this.dataSource8[ind].idgrupo && this.DatosDisgre[a].idfila==this.dataSource8[ind].idfila && this.DatosDisgre[a].indrep==this.dataSource8[ind].indrep){
        this.DatosDisgre.splice(a,1)
        break;
      }
    }
    this.dataSource8.splice(ind,1);
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
      this.Cantidad13a.setValue(this.formService.redondeo(this.dataSource7[ind].cantidad??0,this.dec_cant))
      this.Preciou13a.setValue(this.formService.redondeo(this.dataSource7[ind].precio??0,this.dec_precio))
      this.Parcial13a.setValue(this.formService.redondeo(this.dataSource7[ind].precio?this.dataSource7[ind].parcial:0,this.dec_parcial))
      //agregar los disgregados existentes
      let idgru=this.dataSource7[ind].idgrupo;
      let idfila=this.dataSource7[ind].idfila;
      for(let i=0;i<this.dataSource8.length;i++){
        if(this.dataSource8[i].idgrupo==idgru && this.dataSource8[i].idfila==idfila){
          let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgru,idfila:this.dataSource8[i].idfila,indrep:this.dataSource8[i].indrep,orden:this.dataSource8[i].orden,
            indice:this.dataSource8[i].indice,id_filadetalle:this.dataSource8[i].id_filadetalle,num_det:this.dataSource8[i].num_det,codigo:this.dataSource8[i].codigo,descripcion:this.dataSource8[i].descripcion,
            unidad:this.dataSource8[i].unidad,cantidad:this.dataSource8[i].cantidad,precio:this.dataSource8[i].precio,parcial:this.dataSource8[i].parcial,operador:this.dataSource8[i].operador,
            acumulado:this.dataSource8[i].acumulado,proceso:this.dataSource8[i].proceso,princi:this.dataSource8[i].princi,estado:this.dataSource8[i].estado,ingreso:this.dataSource8[i].ingreso,
            salida:this.dataSource8[i].salida,fecha_sol:this.dataSource8[i].fecha_sol,mostrar:this.dataSource8[i].mostrar,icomost:this.dataSource8[i].icomost,existe:1};//existe se usa?
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
    if(!this.Frmmostrar13a.invalid)//validar que parcial sea !=0
    {
      if(Number(this.Parcial13a.value)>0){
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
            acumulado:null,proceso:'',princi:0,estado:0,ingreso:0,salida:0,fecha_sol:null,mostrar:1,icomost:1,existe:0};
        this.dataSource8aux.push(ejm);
        this.calcfoottab8aux();
      }
      else{
        this.toaster.error('No puede agregar un insumo con Parcial igual a 0.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    } 
    else
    {
      this.Frmmostrar13a.markAllAsTouched();
      this.toaster.error('Debe llenar los campos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  lvcantm13a(eve:any){
    let preclv=Number(this.Preciou13a.value);
    let cantlv=Number(eve.toString().replace(/\,/g,''));
    let parciallv=cantlv*preclv;
    this.Cantidad13a.setValue(this.formService.redondeo(cantlv,this.dec_cant));
    this.Parcial13a.setValue(this.formService.redondeo(parciallv,this.dec_parcial));
  }
  presenterCant(event:any){
    if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
  }
  lvprem13a(eve:any){
    let cantlv=Number(this.Cantidad13a.value);
    let preclv=Number(eve.toString().replace(/\,/g,''));
    let parciallv=cantlv*preclv;
    this.Preciou13a.setValue(this.formService.redondeo(preclv,this.dec_precio));
    this.Parcial13a.setValue(this.formService.redondeo(parciallv,this.dec_parcial));
  }
  presenterPrec(event:any){
    if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
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
      totcant=totcant+(row.cantidad?Number(row.cantidad.toString()):0);
      totparc=totparc+Number(row.parcial.toString());
    }
    this.canttotal8aux=this.formService.redondeo(totcant,this.dec_parcial)
    this.parcialtotal8aux=this.formService.redondeo(totparc,this.dec_parcial)
  }
  UltOrden(){
    let ord=0
    for(let a=0;a<this.dataSource8.length;a++){
      if(Number(this.dataSource8[a].orden)>ord){
        ord=this.dataSource8[a].orden;
      }
    }
    return ord+1;
  }
  GuardarModalmostrar13a(){
    if(this.dataSource8aux.length>0){
      //recorrer la tabla, agregar y calcular los valores de saldo y variacion
      let idgru=this.dataSource7[this.ind_disgrega].idgrupo;
      let idfila=this.dataSource7[this.ind_disgrega].idfila;
      let indgrupo=-1;
      let idgraux='';
      let idfilagru='';
      let nrorep=0;
      for(let j=0;j<this.dataSource8.length;j++){
        if(idgraux!='' && idfilagru!=''){
          nrorep=nrorep+1;
        }
        if(this.dataSource8[j].idgrupo==idgru && this.dataSource8[j].idfila==idfila && this.dataSource8[j].princi==1)
        {
          indgrupo=j;
          idgraux=this.dataSource8[j].idgrupo;
          idfilagru=this.dataSource8[j].idfila;
        }
      }
      if(indgrupo==-1){
        let morden= this.UltOrden();
        for(let i=0;i<this.dataSource8aux.length;i++){
          this.dataSource8aux[i].acumulado=i==0?this.parcialtotal8aux:null;
          this.dataSource8aux[i].princi=i==0?1:0;
          this.dataSource8aux[i].indrep=nrorep++;
          this.dataSource8aux[i].mostrar=1
          this.dataSource8aux[i].icomost=1
          this.dataSource8aux[i].orden=morden
          this.dataSource8aux[i].editar=0
          this.dataSource8aux[i].editar2=0
          this.dataSource8.push(this.dataSource8aux[i]);
          //agregar tambien a data
          this.DatosDisgre.push(JSON.parse(JSON.stringify(this.dataSource8aux[i])))
        }
        this.bcambiost8=true;
        //las desviaciones y requerimiento solicitado
        let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
        let paragre=Number(this.parcialtotal8aux);
        this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);

        let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
        let varia=this.formService.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
        this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
        this.dataSource6[this.fila6_sel].accion=1

        //para los saldos
        let parc1=Number(this.dataSource7[this.ind_disgrega].parcial);
        let sald=(((parc1-(paragre))/parc1)*100);
        this.dataSource7[this.ind_disgrega].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
        for(let row of this.dataSource6){
          if(row.idgrupo==this.dataSource7[this.ind_disgrega].idgrupo && row.idfila==this.dataSource7[this.ind_disgrega].idfila){
            row.saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
            row.accion=1
            break;
          }
        }
        // this.actualizarvistat5();
        // this.ordenart6();
        this.cargartabla8mostrar(this.idcomple);
      }
      else{
        nrorep=nrorep+1;
        let sumdif=0;
        let suma=Number(this.dataSource8[indgrupo].acumulado);
        for(let i=0;i<this.dataSource8aux.length;i++){
          if(this.dataSource8aux[i].existe==0){
            sumdif=sumdif+Number(this.dataSource8aux[i].parcial);
            this.dataSource8aux[i].acumulado=null;
            this.dataSource8aux[i].princi=0;
            this.dataSource8aux[i].indrep=nrorep++;
            this.dataSource8aux[i].mostrar=1
            this.dataSource8aux[i].icomost=1
            this.dataSource8aux[i].orden=this.dataSource8[indgrupo].orden
            this.dataSource8aux[i].editar=0
            this.dataSource8aux[i].editar2=0
            this.dataSource8.splice(indgrupo+1,0,this.dataSource8aux[i]);
            //agregar tambien a data
            this.DatosDisgre.push(JSON.parse(JSON.stringify(this.dataSource8aux[i])))
          }
        }
        //indgru varia, no se pushea en la fila correcta
        suma=suma+sumdif;
        this.dataSource8[indgrupo].acumulado=this.formService.redondeo(suma,this.dec_parcial);
        //modificar en datosdisgre tambien
        this.bcambiost8=true;
        for(let rowds of this.DatosDisgre){
          if(rowds.idgrupo==this.dataSource8[indgrupo].idgrupo && rowds.idfila==this.dataSource8[indgrupo].idfila && rowds.princi==1){
            rowds.acumulado=this.formService.redondeo(suma,this.dec_parcial);//agrupacion suma tabla8
          }
        }
        //las desviaciones y requerimiento solicitado
        let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
        this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo(reqsoli+sumdif,this.dec_parcial);

        let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
        let varia=this.formService.redondeo((((parcialgru-(reqsoli+sumdif))/parcialgru)*100),2);
        this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
        this.dataSource6[this.fila6_sel].accion=1
        //para los saldos
        let parc1=Number(this.dataSource7[this.ind_disgrega].parcial);
        let sald=(((parc1-(suma))/parc1)*100);
        this.dataSource7[this.ind_disgrega].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
        for(let row of this.dataSource6){
          if(row.idgrupo==this.dataSource7[this.ind_disgrega].idgrupo && row.idfila==this.dataSource7[this.ind_disgrega].idfila){
            row.saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
            row.accion=1
            break;
          }
        }
        //this.actualizarvistat5();
        //this.ordenart6();
        this.cargartabla8mostrar(this.idcomple);
      }
      this.cerrarModalmostrar13a();
    }
    else
    {
      if(!this.Frmmostrar13a.invalid)
      {
        let insumo=this.Insumo13a.value;
        let unid=this.Unidad13a.value;
        let cantidad=this.Cantidad13a.value;
        let precio=this.Preciou13a.value;
        let parcial=this.Parcial13a.value;
        let idgru=this.dataSource7[this.ind_disgrega].idgrupo;
        let idfila=this.dataSource7[this.ind_disgrega].idfila;
        
        let indgrupo=-1;
        let idgraux='';
        let idfilagru='';
        let nrorep=0;
        for(let j=0;j<this.dataSource8.length;j++){
          if(idgraux!='' && idfilagru!=''){
            if(this.dataSource8[j].princi==1)
            {
              break;
            }
            nrorep=nrorep+1;
          }
          if(this.dataSource8[j].idgrupo==idgru && this.dataSource8[j].idfila==idfila && this.dataSource8[j].princi==1)
          {
            indgrupo=j;
            idgraux=this.dataSource8[j].idgrupo;
            idfilagru=this.dataSource8[j].idfila;
          }
        }
        if(indgrupo==-1){//no entrara porque se carga en t8aux al existir
          //agregar a tabla 8 e datosdisg
          let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgru,idfila:this.dataSource7[this.ind_disgrega].idfila,indrep:0,orden:this.UltOrden(),indice:this.dataSource7[this.ind_disgrega].indice,id_filadetalle:this.dataSource7[this.ind_disgrega].id_filadetalle,
            num_det:this.dataSource7[this.ind_disgrega].num_det,codigo:this.dataSource7[this.ind_disgrega].codigo,descripcion:insumo,unidad:unid,cantidad:cantidad,
            precio:precio,parcial:parcial,operador:this.dataSource7[this.ind_disgrega].operador,acumulado:parcial,proceso:'',princi:1,estado:0,ingreso:0,salida:0,fecha_sol:null,icomost:1,mostrar:1,editar:0,editar2:0};
          this.dataSource8.splice(indgrupo+1,0,ejm);
          //agregar tambien a data
          this.DatosDisgre.push(JSON.parse(JSON.stringify(ejm)))

          this.bcambiost8=true;
          //las desviaciones y requerimiento solicitado
          let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
          let paragre=Number(parcial);

          this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);
          let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
          let varia=this.formService.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
          this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
          this.dataSource6[this.fila6_sel].accion=1
          //para los saldos
          let parc1=Number(this.dataSource7[this.ind_disgrega].parcial);
          let sald=(((parc1-(paragre))/parc1)*100);
          this.dataSource7[this.ind_disgrega].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
          for(let row of this.dataSource6){
            if(row.idgrupo==this.dataSource7[this.ind_disgrega].idgrupo && row.idfila==this.dataSource7[this.ind_disgrega].idfila){
              row.saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
              row.accion=1
              break;
            }
          }
          // this.actualizarvistat5();
          // this.ordenart6();
          this.cargartabla8mostrar(this.idcomple);//debe ordenar?
        }
        else{
          nrorep=nrorep+1;
          let suma=Number(this.dataSource8[indgrupo].acumulado);
          suma=suma+Number(parcial);//agrupacion suma tabla8
          this.dataSource8[indgrupo].acumulado=this.formService.redondeo(suma,this.dec_parcial);//agrupacion suma tabla8

          let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgru,idfila:this.dataSource7[this.ind_disgrega].idfila,indrep:nrorep,orden:this.dataSource8[indgrupo].orden,indice:this.dataSource7[this.ind_disgrega].indice,id_filadetalle:this.dataSource7[this.ind_disgrega].id_filadetalle,
            num_det:this.dataSource7[this.ind_disgrega].num_det,codigo:this.dataSource7[this.ind_disgrega].codigo,descripcion:insumo,unidad:unid,cantidad:cantidad,
            precio:precio,parcial:parcial,operador:this.dataSource7[this.ind_disgrega].operador,acumulado:null,proceso:'',princi:0,estado:0,ingreso:0,salida:0,fecha_sol:null,icomost:1,mostrar:1,editar:0,editar2:0};
          this.dataSource8.splice(indgrupo+1,0,ejm);
          //agregar tambien a data
          this.DatosDisgre.push(JSON.parse(JSON.stringify(ejm)))
          this.bcambiost8=true;
          //las desviaciones y requerimiento solicitado
          let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
          let paragre=Number(parcial);
          this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);

          let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
          let varia=this.formService.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
          this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
          this.dataSource6[this.fila6_sel].accion=1
          //para los saldos
          let parc1=Number(this.dataSource7[this.ind_disgrega].parcial);
          let sald=(((parc1-(suma))/parc1)*100);
          this.dataSource7[this.ind_disgrega].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
          for(let row of this.dataSource6){
            if(row.idgrupo==this.dataSource7[this.ind_disgrega].idgrupo && row.idfila==this.dataSource7[this.ind_disgrega].idfila){
              row.saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
              row.accion=1
              break;
            }
          }
          //this.actualizarvistat5();
          //this.ordenart6();
          this.cargartabla8mostrar(this.idcomple);
        }
        this.cerrarModalmostrar13a();
      }
      else
      {
        this.Frmmostrar13a.markAllAsTouched();
        this.toaster.error('Debe llenar los campos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
  }
  async GuardarDatos(){
    try{
      if(this.bcambiost8){
        this.mostrar_carga_todo=true;
        let tabaux=[];
        for(let row of this.dataSource6){
          if(row.accion==1)
            tabaux.push(row);
        }
        const datos1 = JSON.stringify(tabaux);
        const datos2 = JSON.stringify(this.DatosDisgre);
        let objpasa={
          id_proyecto:this.id_proyecto,
          id_registro:this.id_reg,
          datos1:datos1,
          datos2:datos2,
        }
        let res=await this._logisticaService.GuardarAdquiDisgreins(objpasa);
        if(res.id==1)
        {
          this.bcambiost8=false;//Solicitud de presupuesto
          for(let row of this.dataSource6){
            row.accion=0
          }
          this.mostrar_carga_todo=false;
          SwalService.success('Correcto',res.mensaje)
        }
        else
        {
          this.mostrar_carga_todo=false;
          SwalService.error('Advertencia','No se pudo realizar la Operación. '+res.mensaje);
        }
      }
      else{
        this.toaster.info('No hay cambios para guardar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }catch(e){
      this.mostrar_carga_todo=false;
      console.log(e)
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  editarcelda1(ind:any){
    this.dataSource8[ind].editar=1;
  }
  caneditarcelda1(eve:any,ind:any){
    var valor=Number(eve.toString().replace(/\,/g, ''));
    var actual=Number(this.dataSource8[ind].cantidad)
    var aprecio=Number(this.dataSource8[ind].precio);
    var pactual=Number(this.dataSource8[ind].parcial)
    this.dataSource8[ind].editar=0;
    if(valor!=actual){
      let indgrupo=-1;
      for(let j=0;j<this.dataSource7.length;j++){//para condicionar si existe
        if(this.dataSource7[j].idgrupo==this.dataSource8[ind].idgrupo && this.dataSource7[j].idfila==this.dataSource8[ind].idfila)
        {
          indgrupo=j;
        }
      }
      //validar que no exista en t8 antes de agregar
      if(indgrupo!=-1){//no existe entonces se puede agregar directo
        let nparc=this.formService.redondeo((valor*aprecio),this.dec_parcial);
        this.dataSource8[ind].cantidad=this.formService.redondeo(Number(valor),this.dec_cant);
        this.dataSource8[ind].parcial=nparc;
        let nacumu=0;
        if(this.dataSource8[ind].princi==1){
          nacumu=Number(this.dataSource8[ind].acumulado)-pactual+Number(nparc);
          this.dataSource8[ind].acumulado=this.formService.redondeo(nacumu,this.dec_parcial);
        }
        else{
          let indacu=-1;
          for(let j=0;j<this.dataSource8.length;j++){
            if(this.dataSource8[j].idgrupo==this.dataSource8[ind].idgrupo && this.dataSource8[j].idfila==this.dataSource8[ind].idfila && this.dataSource8[j].princi==1)
            {
              indacu=j; break;
            }
          }
          nacumu=Number(this.dataSource8[indacu].acumulado)-pactual+Number(nparc);//agrupacion suma tabla8
          this.dataSource8[indacu].acumulado=this.formService.redondeo(nacumu,this.dec_parcial);//agrupacion suma tabla8
        }
        this.bcambiost8=true;
        //agregar tambien a data
        for(let rowds of this.DatosDisgre){
          if(rowds.idgrupo==this.dataSource8[ind].idgrupo && rowds.idfila==this.dataSource8[ind].idfila && rowds.indrep==this.dataSource8[ind].indrep){
            rowds.cantidad=this.formService.redondeo(Number(valor),this.dec_cant);
            rowds.parcial=nparc;
          }
          if(rowds.idgrupo==this.dataSource8[ind].idgrupo && rowds.idfila==this.dataSource8[ind].idfila && rowds.princi==1){
            let suma=Number(rowds.acumulado)-pactual+Number(nparc);//agrupacion suma tabla8
            rowds.acumulado=this.formService.redondeo(suma,this.dec_parcial);//agrupacion suma tabla8
          }
        }
        //las desviaciones y requerimiento solicitado
        let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
        let paragre=Number(nparc)-pactual;
        this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);
        this.tab7total=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);
        let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
        let varia=this.formService.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
        this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
        this.dataSource6[this.fila6_sel].accion=1
        //para los saldos
        let parc1=Number(this.dataSource7[indgrupo].parcial);
        let sald=(((parc1-(nacumu))/parc1)*100);
        for(let row of this.dataSource6){
          if(row.idgrupo==this.dataSource8[ind].idgrupo && row.idfila==this.dataSource8[ind].idfila){
            row.saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
            row.accion=1;
            break;
          }
        }
        this.dataSource7[indgrupo].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
        this.cargartabla8mostrar(this.idcomple);//TAMBIEN ES NECESARIO?
      }
    }
  }
  presenter1(event:any,ind:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarcelda1(this.dataSource8[ind].cantidad,ind)//el primer parametro es el valor de la celda a editar
    }
    else if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
    else if(event.keyCode.toString()=="40"){
      this.dataSource8[ind].editar=0;
      if(ind+1<this.dataSource8.length){
        this.dataSource8[ind+1].editar=this.dataSource8[ind+1].indice==null?0:1;
      }
    }
    else if(event.keyCode.toString()=="38"){
      this.dataSource8[ind].editar=0;
      if(ind-1>=0){
        this.dataSource8[ind-1].editar=this.dataSource8[ind-1].indice==null?0:1;
      }
    }
  }
  editarcelda2(ind:any){
    this.dataSource8[ind].editar2=1;
  }
  caneditarcelda2(eve:any,ind:any){
    var valor=Number(eve.toString().replace(/\,/g, ''));
    var actual=Number(this.dataSource8[ind].precio)
    var acantidad=Number(this.dataSource8[ind].cantidad);
    var pactual=Number(this.dataSource8[ind].parcial)
    this.dataSource8[ind].editar2=0;
    if(valor!=actual){
      let nparc=this.formService.redondeo((valor*acantidad),this.dec_parcial);
      this.dataSource8[ind].precio=this.formService.redondeo(Number(valor),this.dec_precio);
      this.dataSource8[ind].parcial=nparc;
      let nacumu=0;
      if(this.dataSource8[ind].princi==1){
        nacumu=Number(this.dataSource8[ind].acumulado)-pactual+Number(nparc);
        this.dataSource8[ind].acumulado=this.formService.redondeo(nacumu,this.dec_parcial);
      }
      else{
        let indacu=-1;
        for(let j=0;j<this.dataSource8.length;j++){
          if(this.dataSource8[j].idgrupo==this.dataSource8[ind].idgrupo && this.dataSource8[j].idfila==this.dataSource8[ind].idfila && this.dataSource8[j].princi==1)
          {
            indacu=j; break;
          }
        }
        nacumu=Number(this.dataSource8[indacu].acumulado)-pactual+Number(nparc);//agrupacion suma tabla8
        this.dataSource8[indacu].acumulado=this.formService.redondeo(nacumu,this.dec_parcial);//agrupacion suma tabla8
      }
      this.bcambiost8=true;
      //agregar tambien a data
      for(let rowds of this.DatosDisgre){
        if(rowds.idgrupo==this.dataSource8[ind].idgrupo && rowds.idfila==this.dataSource8[ind].idfila && rowds.indrep==this.dataSource8[ind].indrep){
          rowds.precio=this.formService.redondeo(Number(valor),this.dec_precio);
          rowds.parcial=nparc;
        }
        if(rowds.idgrupo==this.dataSource8[ind].idgrupo && rowds.idfila==this.dataSource8[ind].idfila && rowds.princi==1){
          let suma=Number(rowds.acumulado)-pactual+Number(nparc);//agrupacion suma tabla8
          rowds.acumulado=this.formService.redondeo(suma,this.dec_parcial);//agrupacion suma tabla8
        }
      }
      //las desviaciones y requerimiento solicitado
      let reqsoli=Number(this.dataSource6[this.fila6_sel].reqsol);
      let paragre=Number(nparc)-pactual;
      this.dataSource6[this.fila6_sel].reqsol=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);
      this.tab7total=this.formService.redondeo((reqsoli+paragre),this.dec_parcial);
      let parcialgru=Number(this.dataSource6[this.fila6_sel].parcial);
      let varia=this.formService.redondeo((((parcialgru-(reqsoli+paragre))/parcialgru)*100),2);
      this.dataSource6[this.fila6_sel].variacion=this.dataSource6[this.fila6_sel].complemento==1?'':varia;
      this.dataSource6[this.fila6_sel].accion=1
      //para los saldos
      let indgrupo=-1;
      for(let j=0;j<this.dataSource7.length;j++){//para condicionar si existe
        if(this.dataSource7[j].idgrupo==this.dataSource8[ind].idgrupo && this.dataSource7[j].idfila==this.dataSource8[ind].idfila)
        {
          indgrupo=j;
        }
      }
      let parc1=Number(this.dataSource7[indgrupo].parcial);
      let sald=(((parc1-(nacumu))/parc1)*100);
      for(let row of this.dataSource6){
        if(row.idgrupo==this.dataSource8[ind].idgrupo && row.idfila==this.dataSource8[ind].idfila){
          row.saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
          row.accion=1;
          break;
        }
      }
      this.dataSource7[indgrupo].saldo=sald<0?'0.00':this.formService.redondeo(sald,2);
      this.cargartabla8mostrar(this.idcomple);//TAMBIEN ES NECESARIO?
    }
  }
  presenter2(event:any,ind:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarcelda2(this.dataSource8[ind].precio,ind)//el primer parametro es el valor de la celda a editar
    }
    else if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
    else if(event.keyCode.toString()=="40"){
      this.dataSource8[ind].editar2=0;
      if(ind+1<this.dataSource8.length){
        this.dataSource8[ind+1].editar2=this.dataSource8[ind+1].indice==null?0:1;
      }
    }
    else if(event.keyCode.toString()=="38"){
      this.dataSource8[ind].editar2=0;
      if(ind-1>=0){
        this.dataSource8[ind-1].editar2=this.dataSource8[ind-1].indice==null?0:1;
      }
    }
  }
  datosproy=null
  async Imprimir1() {
    if (this.datosproy == null) {
      const detalleProyecto =
        await this.principalService.recuperarDatosProyecto({
          id_proyecto: this.id_proyecto,
        });
      this.datosproy = detalleProyecto;
    }
    const arrayHeader = ['AGRUPAMIENTO','ITEM','INS. EXPEDIENTE','LUGAR DE ENTREGA','FECHA PROG.','FECHA SOL.','PLAZO','ESTADO','REQ. PROGRAMADO','REQ. SOLICITADO','VARIACION']
    const arrayHeader2 = ['IND. UNIF.','INSUMO PROGRAMADO','UND','CANTIDAD','P.U.','PARCIAL','SALDO']
    const arrayKeys2 = [
      'indiceunif',
      'descripcion',
      'unidad',
      'cantidad',
      'precio',
      'parcial',
      'saldo'
    ];
    const arradec2 = [
      null,
      null,
      null,
      this.dec_metrado,
      this.dec_parcial,
      this.dec_parcial,
      2
    ];
    const arralig2 = [
      'center',
      'left',
      'center',
      'right',
      'right',
      'right',
      'center'
    ];
    const arrayHeader3 = ['INS. SOLICITADO','UND','CODIGO','CANTIDAD','P.U.','PARCIAL','ACUMULADO']
    const arrayKeys3 = [
      'descripcion',
      'unidad',
      'codigo',
      'cantidad',
      'precio',
      'parcial',
      'acumulado'
    ];
    const arradec3 = [
      null,
      null,
      null,
      this.dec_metrado,
      this.dec_parcial,
      this.dec_parcial,
      this.dec_parcial
    ];
    const arralig3 = [
      'left',
      'center',
      'center',
      'right',
      'right',
      'right',
      'right'
    ];
    const arrayKeys = [
      'id_comple',
      'idgrupo',
      'descripcion',
      'entrega',
      'fecha',
      'fecha_sol',
      'plazo_ate',
      'estado',
      'parcial',
      'reqsol',
      'variacion'
    ];
    const arradec = [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      this.dec_parcial,
      this.dec_parcial,
      2
    ];
    const arralig = [
      'center',
      'center',
      'left',
      'center',
      'center',
      'center',
      'center',
      'center',
      'right',
      'right',
      'center',
    ];
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      col_alig: arralig,
      header2: arrayHeader2,
      keys_body2: arrayKeys2,
      header3: arrayHeader3,
      keys_body3: arrayKeys3,
      col_alig2: arralig2,
      keys_dec: arradec,
      keys_dec2: arradec2,
      keys_dec3: arradec3,
      col_alig3: arralig3,
      tabla:this.dataSource6,
      tabla2:JSON.parse(JSON.stringify(this.DatosDisgre)),
      tipo_reporte: 0,
      orientacion: 'landscape',
      moneda: this.simbolo, 
      titulo: 'COMPATIBILIZACION DE INSUMOS',
      dec_parcial: this.dec_parcial,
      dec_metrado:this.dec_metrado
    };
    const modalRef = this.modalService.open(ReportesComponent, {
      size: 'lg modalgrande',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false,
    });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
}
