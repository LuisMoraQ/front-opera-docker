import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import * as moment from 'moment';

@Component({
  selector: 'app-compcostos',
  templateUrl: './compcostos.component.html',
  styleUrls: ['./compcostos.component.scss']
})
export class CompcostosComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  solover=false
  id_reg:any
  id_proyecto:any
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  //dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  mostrar_carga_todo=false;
  preventscroll=false;
  iduser:any
  uidadmin:any

  dataSource6=[]
  buscando6=false;
  fila6_sel=-1

  dataSource7=[]
  paddingscroll2=0
  paddingscroll=0
  tab7total1:any
  tab7total2:any
  totvaria:any
  tab7total3:any
  tab7total4:any
  tab7total5:any
  fila7_sel=-1

  DatosDisgre=[]
  // tab7total:any
  // dataSource8=[]
  // fila8_sel=-1
  // paddingscroll3=0
  // paddingscroll4=0
  // ind_disgrega=-1;
  subvista=1;
  
  constructor(
    private _logisticaService:LogisticaService,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService,
    public formService: FormsService,
  ) { }

  async ngOnInit() {
    this.iduser = this.encriptadorService.recuperarlocalstory('idusuario');
    this.uidadmin = this.encriptadorService.recuperarlocalstory('id_admin');
    this.id_reg=this.filareg.id_registro;
    this.id_proyecto=this.filareg.id_proyecto
    this.simbolo=this.filareg.simbolo
    this.solover=this.filareg.solover
    let decimales = this.decproy;
    if(decimales?.toString().includes('|')){
      let arrdec=decimales.split('|');
      this.mask_precio='0.'+arrdec[1];
      this.dec_precio=arrdec[1];
      this.dec_parcial=arrdec[2];
      this.mask_parcial='0.'+arrdec[2];
      this.mask_cant='0.'+arrdec[3];
    }
    this.buscando6=true;
    let res=await this._logisticaService.ListarAgruadquisol({id_proyecto:this.id_proyecto,id_registro:this.id_reg,id_usuario:this.uidadmin});
    console.log(res)
    if(res?.length>0){
      let taux=res[0]
      for(let a=0;a<taux.length;a++){
        if(!(taux[a].tipocontra==1 || taux[a].tipocontra==2)){
          taux.splice(a,1)
          a--;
          continue;
        }
        if(taux[a].parcialsol){
          let monreqsol=Number(taux[a].reqsol)==0?1:Number(taux[a].reqsol)
          let varia=((Number(taux[a].reqsol)-Number(taux[a].parcialsol))/monreqsol)*100;
          taux[a].variacion=this.formService.redondeo(varia,2);
          //fecha ate - fecha sol
          if(taux[a].fecha_gana){
            let arrfe=taux[a].fecha_gana.split('-')
            let feac = new Date(Number(arrfe[2]),Number(arrfe[1])-1,Number(arrfe[0]));
            feac.setHours(9, 0, 0,0);
            feac.setDate(feac.getDate()+Number(taux[a].plazo_gana))
            taux[a].fechalim=moment(feac).format('DD-MM-YYYY');
          }
        }
        else
          taux[a].variacion=null
      }
      this.dataSource6=taux
      this.ordenart6()
      this.DatosDisgre=res[1]
    }
    else{
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
    this.buscando6=false;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    //actualiza el paddingscroll2 para el  footer NO BORRAR ESTE METODO
  }
  ngAfterContentChecked(): void {
    //this.changeDetector.detectChanges();
    //cambiar ancho del scroll
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
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambioVista(ind:any){
    //condicionar si selecciono una fila?
    if(this.filareg){
      this.subvista=ind;
    }
    else{
      this.toaster.error('Seleccionar un Registro de Adquisicion.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  cambindicesel7(ind: any) {
    if (ind == this.fila7_sel)
      this.fila7_sel = -1;
    else
      this.fila7_sel = ind;
  }
  cambindicesel6(ind: any) {
    if (ind != this.fila6_sel){
      this.fila6_sel = ind;
      this.CargarDetalle(ind)
    }
  }
  CargarDetalle(ind:any){
    this.dataSource7=[]
    let rowsel=this.dataSource6[ind]
    let sum1=0;
    let sum2=0;
    let sum3=0;
    let sum4=0;
    let sum5=0;
    for(let row of this.DatosDisgre){
      if(row.idgrupo==rowsel.idgrupo){
        let filacop=JSON.parse(JSON.stringify(row))
        let parc1=this.formService.redondeo(Number(filacop.preciosol1)*Number(filacop.cantidad),this.dec_parcial)
        filacop.parcial1=parc1
        let parc2=this.formService.redondeo(Number(filacop.preciosol2)*Number(filacop.cantidad),this.dec_parcial)
        filacop.parcial1=parc1
        let parc3=this.formService.redondeo(Number(filacop.preciosol3)*Number(filacop.cantidad),this.dec_parcial)
        filacop.parcial1=parc1??0
        sum3+=Number(parc1)??0
        filacop.parcial2=parc2??0
        sum4+=Number(parc2)??0
        filacop.parcial3=parc3??0
        sum5+=Number(parc3)??0
        if(filacop.preciosol){
          filacop.preciovar=this.formService.redondeo(Number(filacop.preciosol)-Number(filacop.precio),this.dec_precio)
          let varia=((Number(filacop.precio)-Number(filacop.preciosol))/Number(filacop.precio))*100;
          filacop.variacion=this.formService.redondeo(varia,2);
        }
        else
          filacop.variacion=null;
        this.dataSource7.push(filacop)
        sum1+=(Number(filacop.parcial))
        sum2+=(Number(filacop.parcialsol))
      }
    }
    if(sum2>0){
      let variat=((sum1-sum2)/(sum1==0?1:sum1))*100;
      this.totvaria=this.formService.redondeo(variat,2);
    }
    else
      this.totvaria=null;
    this.tab7total1=sum1
    this.tab7total2=sum2
    this.tab7total3=sum3
    this.tab7total4=sum4
    this.tab7total5=sum5
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
}
