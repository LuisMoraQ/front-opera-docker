import { Component, OnInit,Input,HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import * as moment from 'moment';

@Component({
  selector: 'app-almcpanelestado',
  templateUrl: './almcpanelestado.component.html',
  styleUrls: ['./almcpanelestado.component.scss']
})
export class AlmcpanelestadoComponent implements OnInit {
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

  dataSource6=[]
  heighttmodal13:any;
  heighttmodal2:any;
  buscando6=false;
  fila6_sel=-1
  
  totalparc
  totalcant
  totalsaldo
  filasol_sel=-1
  paddingscroll=0
  paddingscroll2=0
  preventscroll=false;
  fechaac:any;
  
  dataSource3=[]//INGRESOS REALIZADOS
  datainsdisgre=[]
  dataingreso=[]
  //datasalida=[]
  datainsSel=[]
  buscando2=false;

  constructor(
    private _logisticaService: LogisticaService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.heighttmodal13=window.innerHeight-187;
    this.heighttmodal2=(window.innerHeight-250)/2;
    this.id_reg = this.filareg.idregmov;
    this.id_proyecto = this.filareg.id_proyecto;
    this.simbolo = this.filareg.simbolo;
    this.solover = this.filareg.estado == 1 ? true : this.filareg.solover;
    this.buscando6 = true;
    let res = await this._logisticaService.ListarMovalmcobraRegest({id_proyecto: this.id_proyecto,fechaini: this.filareg.fechaini,fechafin: this.filareg.fechafin,iding: this.id_reg }); //iding idregmov
    console.log(res);
    this.buscando6 = false;
    if (res?.length > 0) {
      this.dataSource6 = res[0];
      this.datainsdisgre=res[1]
      this.dataingreso=res[2]
      /* this.datainsdisg = res[1];
      this.dataingreso = res[2];
      this.datasalida = res[3]; */
      // this.DatosDisgre=res[1]
      /* let arrfini = this.filareg.fechaini.split('-');
      let ultfecha = moment(
        arrfini[2] + '-' + arrfini[1] + '-' + arrfini[0]
      ).format('YYYY-MM-DD');
      for (let row of this.dataingreso) {
        let fechrow = moment(row.fecha).format('YYYY-MM-DD');
        if (fechrow > ultfecha) {
          ultfecha = fechrow;
        }
      }
      this.fechaSal = ultfecha; */
    } else {
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.heighttmodal2 = (window.innerHeight - 250) / 2;
    this.heighttmodal13 = window.innerHeight - 187;
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
  cambindicesel6(ind: any) {
    if (ind != this.fila6_sel){
      this.fila6_sel = ind;
      this.buscando2=true;
      this.dataSource3=[]
      this.datainsSel=[]
      for(let row of this.dataingreso){
        if(row.id_registro=this.dataSource6[this.fila6_sel].id_registro && row.idgrupo==this.dataSource6[this.fila6_sel].idgrupo && row.idfila==null){
          this.dataSource3.push(row)
        }
      }
      this.totalparc=0;
      this.totalcant=0;
      this.totalsaldo=0;
      for(let row of this.datainsdisgre){
        if(row.id_registro=this.dataSource6[this.fila6_sel].id_registro && row.idgrupo==this.dataSource6[this.fila6_sel].idgrupo){
          this.datainsSel.push(row)
          this.totalparc+=Number(row.parcialsol)
          this.totalcant+=Number(row.cantidad)
          this.totalsaldo+=Number(row.saldo)
        }
      }
      this.buscando2=false;
    }
  }
  cambindiceselSol(ind: any) {
    if (ind == this.filasol_sel) this.filasol_sel = -1;
    else this.filasol_sel = ind;
  }
}
