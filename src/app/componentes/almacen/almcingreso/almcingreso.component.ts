import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';

@Component({
  selector: 'app-almcingreso',
  templateUrl: './almcingreso.component.html',
  styleUrls: ['./almcingreso.component.scss']
})
export class AlmcingresoComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  @Output() listarpri = new EventEmitter<any>();
  solover=false
  mostrar_carga_todo=false
  fechaac:any;
  widthm1b2: number=100;
  heighttmodal13=250;
  heighttmodal=250;

  dec_metrado=4;
  mask_metrado='0.4';
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  id_proyecto:any;
  id_reg:any;

  dataSource2=[]
  fila2_sel=-1
  buscando2=false
  datainsdisg=[]
  dataingreso=[]
  datasalida=[]

  dataSource3=[]
  fila3_sel=-1
  buscando3=false
  tab3totalcant:any;
  tab3totalparc:any;
  tab3totalsal:any;

  dataSource4=[]
  fila4_sel=-1
  buscando4=false
  tab4total:any

  paddingscroll = 17;
  paddingscroll2 = 17;
  paddingscroll3 = 17;
  paddingscroll4 = 17;
  preventscroll=false;
  paddingscrollsup=0

  constructor(
    private _EncriptadorService:EncriptadorService,
    private _logisticaService:LogisticaService,
    public formService: FormsService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.id_reg=this.filareg.idregmov;
      this.id_proyecto=this.filareg.id_proyecto
    this.solover=this.filareg.solover
    //evitar salto de tabla por scroll
    let resto=this.solover?70:90;
    this.widthm1b2=(window.innerWidth/2)-resto;
    // this.anchofoot3=this.solover?372:this.anchofoot3;
    this.heighttmodal=window.innerHeight-155;
    this.heighttmodal13=(window.innerHeight-106)/2;
    console.log(this.heighttmodal,this.heighttmodal13)
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
    //listar y otras funciones
    let resfec = await this._EncriptadorService.FechaActualBack();
    if (resfec.id == 1) {
      this.fechaac = new Date(resfec.mensaje);
    }
    else{
      this.fechaac=new Date();
    }
    //listar datos
    await this.listar1();
    console.log(this.filareg)
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    //this.heighttmodal=window.innerHeight-165;
    let resto=this.solover?70:90;
    this.widthm1b2=(window.innerWidth/2)-resto;

    this.heighttmodal=window.innerHeight-155;
    this.heighttmodal13=(window.innerHeight-106)/2;
  }
  ngAfterContentChecked(): void {
    //this.changeDetector.detectChanges();
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
    var element = document.getElementById('tableBody2');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll3 != sizeef) {
        this.paddingscroll3 = sizeef;
      }
      let sizeef2 = element.offsetHeight - element.clientHeight;
      if (this.paddingscroll4 != sizeef2) {
        this.paddingscroll4 = sizeef2;
      }
    }
    var element = document.getElementById('contbody');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscrollsup != sizeef) {
        this.paddingscrollsup = sizeef;
      }
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  SyncScroll() {
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
  SyncScroll2() {
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
  SyncScroll3() {
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
  SyncScroll4() {
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
  async listar1(){
    this.buscando2=true;
    let res=await this._logisticaService.ListarMovalmcobraDet({id_proyecto:this.id_proyecto,fechaini:this.filareg.fechaini,fechafin:this.filareg.fechafin,iding:this.id_reg});//iding idregmov
    console.log(res)
    this.buscando2=false;
    if(res?.length>0){
      this.dataSource2=res[0]
      this.datainsdisg=res[1]
      this.dataingreso=res[2]
      this.datasalida=res[3]
      // this.DatosDisgre=res[1]
    }
    else{
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
    this.tab4total=0;
    this.tab3totalcant=0;
    this.tab3totalparc=0;
    this.tab3totalsal=0;
  }
  cambindicesel2(ind:any){
    if(ind==this.fila2_sel){
      this.fila2_sel=-1;
      this.dataSource3=[]
      this.dataSource4=[]
      this.fila4_sel=-1;
      this.tab3totalcant=0;
      this.tab3totalparc=0;
      this.tab3totalsal=0;
    }
    else{
      this.fila2_sel=ind;
      this.fila4_sel=-1;
      let suma1=0;
      let suma2=0;
      let suma3=0;
      let idgru=this.dataSource2[this.fila2_sel].idgrupo;
      let idreg=this.dataSource2[this.fila2_sel].id_registro;
      this.dataSource3=[]
      this.dataSource4=[]
      for(let row of this.datainsdisg){
        if(row.idgrupo==idgru && row.id_registro==idreg){
          row.saldo=this.formService.redondeo(Number(row.cantidad)-Number(row.ingreso),this.dec_cant);
          row.indicador=Number(row.saldo)>0?0:1
          suma1+=Number(row.cantidad);
          suma2+=Number(row.parcial);
          suma3+=Number(row.saldo??0);
          this.dataSource3.push(row)
        }
      }
      let suma=0;
      for(let row of this.dataingreso){
        if(row.idgrupo==idgru && row.id_registro==idreg)
        {
          if(row.unidad==''){
            suma+=Number(row.parcial.replace(/\,/g,''));
          }
          this.dataSource4.push(row)
        }
      }
      this.tab4total=this.formService.redondeo(suma,this.dec_parcial);
      //this.totalselval=this.redondeo(suma,this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      this.tab3totalcant=this.formService.redondeo(suma1,this.dec_cant);
      this.tab3totalparc=this.formService.redondeo(suma2,this.dec_parcial);
      this.tab3totalsal=this.formService.redondeo(suma3,this.dec_cant);
    }
  }
  cambindicesel3(ind:any){
    if(ind==this.fila3_sel)
      this.fila3_sel=-1;
    else
      this.fila3_sel=ind;
  }
  OpenModalIngreso1(){

  }
  OpenModalEditarIng1(){

  }
  EliminarIng1(){

  }
  cerrarModalIngreso1(){
    
  }
  guardarModalIngreso1(){
    
  }
}
