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
  fila6_sel=-1
  rowtotal
  
  paddingscroll=0
  paddingscroll2=0
  preventscroll=false;
  // fechaac:any;
  
  datainsdisgre=[]
  dataingreso=[]
  datasalida=[]

  constructor(
    private _logisticaService: LogisticaService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.heighttmodal1=window.innerHeight-215;
    this.id_reg = this.filareg.idregmov;
    this.id_proyecto = this.filareg.id_proyecto;
    this.simbolo = this.filareg.simbolo;
    this.solover = this.filareg.estado == 1 ? true : this.filareg.solover;
    this.buscando = true;
    let res = await this._logisticaService.ListarMovalmcobraRegest({id_proyecto: this.id_proyecto,fechaini: this.filareg.fechaini,fechafin: this.filareg.fechafin,iding: this.id_reg }); //iding idregmov
    console.log(res);
    this.buscando = false;
    if (res?.length > 0) {
      this.dataSourcePri = res[0];
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
    this.heighttmodal1 = window.innerHeight - 215;
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
}
