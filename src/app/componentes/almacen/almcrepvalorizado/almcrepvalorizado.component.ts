import { Component, OnInit,Input,HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import * as moment from 'moment';

@Component({
  selector: 'app-almcrepvalorizado',
  templateUrl: './almcrepvalorizado.component.html',
  styleUrls: ['./almcrepvalorizado.component.scss']
})
export class AlmcrepvalorizadoComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  solover=false
  id_reg:any
  id_proyecto:any
  //dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  //dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  mostrar_carga_todo=false;

  dataSourcePri=[]
  heighttmodal1:any;
  buscando=false;
  fila_sel=-1
  totalingreso
  totalsalida
  totalsaldo

  paddingscroll=0
  paddingscroll2=0
  preventscroll=false;
  // fechaac:any;
  
  dataagru=[]
  dataingreso=[]
  datasalida=[]

  arrmes=[]//un array en las filas, para los resultados?
  arrtots=[]
  minicio
  mfin
  completo=true
  fechamenor
  fechamayor
  nombremes = ['',
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(
    private _logisticaService: LogisticaService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.heighttmodal1=window.innerHeight-261;
    this.id_reg = this.filareg.idregmov;
    this.id_proyecto = this.filareg.id_proyecto;
    this.simbolo = this.filareg.simbolo;
    this.solover = this.filareg.estado == 1 ? true : this.filareg.solover;
    this.buscando = true;
    let decimales = this.decproy;
    if (decimales?.toString().includes('|')) {
      let arrdec = decimales.split('|');
      //this.dec_precio = arrdec[1];
      this.mask_precio = '0.' + arrdec[1];
      this.dec_parcial = arrdec[2];
      this.mask_parcial = '0.' + arrdec[2];
      //this.dec_cant = arrdec[3];
      this.mask_cant = '0.' + arrdec[3];
    }
    let res = await this._logisticaService.ListarMovalmcobraRepValo({id_proyecto: this.id_proyecto,fechaini: this.filareg.fechaini,fechafin: this.filareg.fechafin,iding: this.id_reg }); //iding idregmov
    console.log(res);
    this.buscando = false;
    if (res?.length > 0) {
      this.dataagru = res[0];
      this.dataingreso=res[1]
      this.datasalida=res[2]
      // this.DatosDisgre=res[1]
      let ini1=this.dataingreso[0]?moment(this.dataingreso[0].fecha).format('YYYY-MM-DD'):null;
      let ini2=this.datasalida[0]?moment(this.datasalida[0].fecha).format('YYYY-MM-DD'):null;
      let fin1=this.dataingreso[this.dataingreso.length-1]?moment(this.dataingreso[this.dataingreso.length-1].fecha).format('YYYY-MM-DD'):null;
      let fin2=this.datasalida[this.datasalida.length-1]?moment(this.datasalida[this.datasalida.length-1].fecha).format('YYYY-MM-DD'):null;
      console.log(ini1,ini2,fin1,fin2)
      if(ini1){
        if(ini2)
          this.fechamenor=ini1<ini2?ini1:ini2;
        else
          this.fechamenor=ini1;
      }
      else{
        if(ini1)
          this.fechamenor=ini1<ini2?ini1:ini2;
        else
          this.fechamenor=ini2;
      }
      if(fin1){
        if(fin2)
          this.fechamayor=fin1>fin2?fin1:fin2;
        else
          this.fechamayor=fin1;
      }
      else{
        if(fin1)
          this.fechamayor=fin1>fin2?fin1:fin2;
        else
          this.fechamayor=fin2;
      }
      console.log(this.fechamenor,this.fechamayor)
    } else {
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.heighttmodal1 = window.innerHeight - 261;
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
  cambindiceselSol(ind: any) {
    if (ind == this.fila_sel) this.fila_sel = -1;
    else this.fila_sel = ind;
  }
  ActualizarRep(){
    this.mostrar_carga_todo=true;
    this.arrmes=[]
    this.totalingreso=0;
    this.totalsalida=0;
    this.totalsaldo=0;
    this.dataSourcePri=JSON.parse(JSON.stringify(this.dataagru))
    if(this.completo){
      //reemplazar el valor de dia en fechaini,fin
      let arrinicio=this.fechamenor.toString().split('-')
      arrinicio[2]="01"
      let d1=new Date(arrinicio.join('-')+"T09:00:00")
      let arrfin=this.fechamayor.toString().split('-')
      arrfin[2]="01"
      let d2=new Date(arrfin.join('-')+"T09:00:00")
      this.CalculaColmes(d1,d2)
      //agregar detalles
      this.CalcularColdetalle()
    }
    else{
      if(this.minicio && this.mfin){
        const d1 = new Date(this.minicio + '-01'+"T09:00:00"); 
        const d2 = new Date(this.mfin + '-01'+"T09:00:00");
        this.CalculaColmes(d1,d2)
        //agregar detalles
        this.CalcularColdetalle()
      }
      else{
        this.toaster.error('Seleccione un Mes Inicio y Fin.','Advertencia',{closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
      }
    }
    this.mostrar_carga_todo=false;
  }
  CalculaColmes(d1:Date,d2:Date){
    const meses = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    let menor=d2<d1?d2:d1;
    let valmes=moment(menor).format('YYYY-MM-DD').split('-')
    let numvalmes=Number(valmes[1])
    let numvalan=Number(valmes[0])
    for(let a=0;a<(Math.abs(meses)+1);a++){
      this.arrmes.push({
        idmes:numvalan+'-'+(numvalmes.toString().length==1? "0"+numvalmes:numvalmes),
        nommes:this.nombremes[numvalmes]+" "+numvalan,
        toting:0,
        totsal:0
      });
      numvalmes++;
      numvalan=numvalmes>12?(numvalan+1):numvalan
      numvalmes=numvalmes>12?1:numvalmes
    }
    console.log(this.arrmes)
  }
  CalcularColdetalle(){
    let objfila=null
    for (let row of this.dataingreso){
      if(objfila?.id_registro!=row.id_registro && objfila?.idgrupo!=row.idgrupo){
        objfila=this.dataSourcePri.find(ele=> ele.id_registro==row.id_registro && ele.idgrupo==row.idgrupo)
      }
      if(objfila){
        if(objfila.dataing){
          let arrfecha=row.fecha.split('-')
          let objbusca=arrfecha[0]+'-'+arrfecha[1]
          let indarr=this.arrmes.findIndex(ele=>ele.idmes==objbusca)
          if(indarr>=0){
            objfila.dataing[indarr]=row.total;
            this.arrmes[indarr].toting+=Number(row.total)
            objfila.totingreso=(objfila.totingreso??0)+Number(row.total);
            objfila.totsaldo=Number(objfila.totingreso??0)-Number(objfila.totsalida??0)
          }
        }
        else{
          objfila.dataing=Array(this.arrmes.length).fill(null)
          let arrfecha=row.fecha.split('-')
          let objbusca=arrfecha[0]+'-'+arrfecha[1]
          let indarr=this.arrmes.findIndex(ele=>ele.idmes==objbusca)
          if(indarr>=0){
            objfila.dataing[indarr]=row.total;
            this.arrmes[indarr].toting+=Number(row.total)
            objfila.totingreso=(objfila.totingreso??0)+Number(row.total);
            objfila.totsaldo=Number(objfila.totingreso??0)-Number(objfila.totsalida??0)
          }
        }
        console.log(JSON.parse(JSON.stringify(objfila)))
      }
    }
    objfila=null
    for (let row of this.datasalida){
      if(objfila?.id_registro!=row.id_registro && objfila?.idgrupo!=row.idgrupo){
        objfila=this.dataSourcePri.find(ele=> ele.id_registro==row.id_registro && ele.idgrupo==row.idgrupo)
      }
      if(objfila){
        if(objfila.datasal){
          let arrfecha=row.fecha.split('-')
          let objbusca=arrfecha[0]+'-'+arrfecha[1]
          let indarr=this.arrmes.findIndex(ele=>ele.idmes==objbusca)
          if(indarr>=0){
            objfila.datasal[indarr]=row.total;
            this.arrmes[indarr].totsal+=Number(row.total)
            objfila.totsalida=(objfila.totsalida??0)+Number(row.total);
            objfila.totsaldo=Number(objfila.totingreso??0)-Number(objfila.totsalida??0)
          }
        }
        else{
          objfila.datasal=Array(this.arrmes.length).fill(null)
          let arrfecha=row.fecha.split('-')
          let objbusca=arrfecha[0]+'-'+arrfecha[1]
          let indarr=this.arrmes.findIndex(ele=>ele.idmes==objbusca)
          if(indarr>=0){
            objfila.datasal[indarr]=row.total;
            this.arrmes[indarr].totsal+=Number(row.total)
            objfila.totsalida=(objfila.totsalida??0)+Number(row.total);
            objfila.totsaldo=Number(objfila.totingreso??0)-Number(objfila.totsalida??0)
          }
        }
        console.log(JSON.parse(JSON.stringify(objfila)))
      }
    }
    for(let row of this.arrmes){
      this.totalingreso=(this.totalingreso??0)+Number(row.toting);
      this.totalsalida=(this.totalsalida??0)+Number(row.totsal);
    }
    this.totalsaldo=(this.totalingreso??0)-(this.totalsalida??0)
  }
  cambioDetsel(val:any){
    this.completo=val==0?true:false;
    //reiniciar inputs?
  }
}
