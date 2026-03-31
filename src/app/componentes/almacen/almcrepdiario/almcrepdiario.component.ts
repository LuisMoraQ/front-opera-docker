import { Component, OnInit,Input,HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import * as moment from 'moment';
import { FormsService } from 'src/app/servicios/forms.service';

@Component({
  selector: 'app-almcrepdiario',
  templateUrl: './almcrepdiario.component.html',
  styleUrls: ['./almcrepdiario.component.scss']
})
export class AlmcrepdiarioComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  enviUrl = '';
  solover=false
  id_reg:any
  id_proyecto:any
  iduser:any
  uidadmin:any
  //dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  //dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  mostrar_carga_todo=false;
  cargainicial=false;

  dataSource=[]
  heighttmodal1:any;
  buscando = false
  fila_sel=-1

  dataagru=[]
  dataingreso=[]
  datasalida=[]
  ingresoant=[]
  salidaant=[]

  minicio
  nombmes
  arrmes=[]
  meses = ['',
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  constructor(
    private _logisticaService: LogisticaService,
    public formService: FormsService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.cargainicial=true;
    this.heighttmodal1=window.innerHeight-230;
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
    let res = await this._logisticaService.ListarMovalmcobraRepDiario({id_proyecto: this.id_proyecto }); //iding idregmov
    this.buscando = false;
    if (res?.length > 0) {
      let arraux=[...res[0],...res[1]]
      const arrfinal = [...arraux].sort((a, b) => {
        if (a.idgrupo < b.idgrupo) {
          return -1;
        }
        if (a.orden > b.orden) {
          return 1;
        }
      });
      let idact=''
      let nroorden=0
      for(let a=0;a<arrfinal.length;a++){
        if(arrfinal[a].idfila==0)
        {
          nroorden=arrfinal[a].nro_orden
          idact=arrfinal[a].idgrupo
          continue
        }
        else{
          if(arrfinal[a].idgrupo==idact){
            arrfinal[a].nro_orden=nroorden
          }
        }
        arrfinal[a].mostrar=1
        arrfinal[a].icomost=1
      }
      this.dataagru = arrfinal
      /* this.dataingreso=res[2]
      this.datasalida=res[3] */
      //si tabla 2 y tabla 3 no hay filas, no cargar nada y mostrar mensaje?
    } else {
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
    this.cargainicial=false;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.heighttmodal1 = window.innerHeight - 230;
  }
  cambindicesel(ind: any) {
    if (ind == this.fila_sel) this.fila_sel = -1;
    else this.fila_sel = ind;
  }

  async ActualizarRep(){
    this.mostrar_carga_todo=true;
    if(this.minicio){
      this.arrmes=[]
      this.dataSource=JSON.parse(JSON.stringify(this.dataagru))
      const d1 = this.minicio.split('-');
      let fini=this.minicio+'-01';
      const ultimoDia = new Date(Number(d1[0]), Number(d1[1]), 0);
      let ffin=moment(ultimoDia).format('YYYY-MM-DD');
      let res = await this._logisticaService.ListarMovalmcobraRepDiarioDet({id_proyecto: this.id_proyecto,fechaini: fini,fechafin: ffin }); //iding idregmov
      this.dataingreso=res[0]
      this.datasalida=res[1]
      //anteriores
      this.ingresoant=res[2]
      this.salidaant=res[3]
      if(this.dataingreso.length<=0 && this.datasalida.length<=0){
        this.mostrar_carga_todo=false;
        this.toaster.error('No existen Ingresos ni Salidas.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        return;
      }
      this.CalculaColmes(Number(d1[1]),Number(d1[0]))
      //agregar detalles
      this.CalcularColdetalle()
    }
    else{
      this.toaster.error('Seleccione un Mes para generar el reporte.','Advertencia',{closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
    this.mostrar_carga_todo=false;
  }
  CalcularColdetalle(){
    let objfila=null
    for (let row of this.dataingreso){
      if(!(objfila?.id_registro==row.id_registro && objfila?.idgrupo==row.idgrupo && objfila?.idfila==row.idfila && objfila?.indrep==row.indrep)){        
        objfila=this.dataSource.find(ele=> ele.id_registro==row.id_registro && ele.idgrupo==row.idgrupo && ele.idfila==row.idfila && ele.indrep==row.indrep)
      }
      if(objfila){
        if(objfila.dataing){
          let arrfecha=row.fecha.split('-')
          let diabusca=Number(arrfecha[2])
          objfila.dataing[diabusca-1]=row.cantidad;
          objfila.totingreso=(objfila.totingreso??0)+Number(row.cantidad);
          //objfila.totsaldo=Number(objfila.totingreso??0)-Number(objfila.totsalida??0)
        }
        else{
          objfila.dataing=Array(this.arrmes.length).fill(null)
          let arrfecha=row.fecha.split('-')
          let diabusca=Number(arrfecha[2])
          objfila.dataing[diabusca-1]=row.cantidad;
          objfila.totingreso=(objfila.totingreso??0)+Number(row.cantidad);
          //objfila.totsaldo=Number(objfila.totingreso??0)-Number(objfila.totsalida??0)
        }
      }
    }
    objfila=null
    for (let row of this.datasalida){
      if(!(objfila?.id_registro==row.id_registro && objfila?.idgrupo==row.idgrupo && objfila?.idfila==row.idfila && objfila?.indrep==row.indrep)){
        objfila=this.dataSource.find(ele=> ele.id_registro==row.id_registro && ele.idgrupo==row.idgrupo && ele.idfila==row.idfila && ele.indrep==row.indrep)
      }
      if(objfila){
        if(objfila.datasal){
          let arrfecha=row.fecha.split('-')
          let diabusca=Number(arrfecha[2])
          objfila.datasal[diabusca-1]=row.cantidad;
          objfila.totsalida=(objfila.totsalida??0)+Number(row.cantidad);
          // objfila.totsaldo=Number(objfila.totingreso??0)-Number(objfila.totsalida??0)
        }
        else{
          objfila.datasal=Array(this.arrmes.length).fill(null)
          let arrfecha=row.fecha.split('-')
          let diabusca=Number(arrfecha[2])
          objfila.datasal[diabusca-1]=row.cantidad;
          objfila.totsalida=(objfila.totsalida??0)+Number(row.cantidad);
          // objfila.totsaldo=Number(objfila.totingreso??0)-Number(objfila.totsalida??0)
        }
      }
    }
    for(let row of this.dataSource){
      if(this.ingresoant.length>0){
        let objfila=this.ingresoant.find(ele=> ele.id_registro==row.id_registro && ele.idgrupo==row.idgrupo && ele.idfila==row.idfila && ele.indrep==row.indrep)
        if(objfila){
          row.cantingant=objfila.cantAnt;
          row.valingant=objfila.parcAnt;
        }
      }
      if(this.salidaant.length>0){
        let objfila=this.salidaant.find(ele=> ele.id_registro==row.id_registro && ele.idgrupo==row.idgrupo && ele.idfila==row.idfila && ele.indrep==row.indrep)
        if(objfila){
          row.cantsalant=objfila.cantAnt;
          row.valsalant=objfila.parcAnt;
        }
      }
      //calcular demas
      row.valmesing=this.formService.redondeo(Number(row.totingreso??0)*Number(row.preciosol), this.dec_parcial);
      row.valmessal=this.formService.redondeo(Number(row.totsalida??0)*Number(row.preciosol), this.dec_parcial);
      row.valacuing=this.formService.redondeo(Number(row.valmesing??0)+Number(row.valingant??0), this.dec_parcial);
      row.valacusal=this.formService.redondeo(Number(row.valmessal??0)+Number(row.valsalant??0), this.dec_parcial);
      row.valsaldo=this.formService.redondeo(Number(row.valacuing??0)-Number(row.valacusal??0), this.dec_parcial);
    }
  }
  CalculaColmes(mes:number,anio:number){
      const numDias = new Date(anio, mes, 0).getDate();
      const inicialesDias = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
      this.nombmes=this.meses[mes]+" - " + anio.toString();
      for (let i = 1; i <= numDias; i++) {
        const fecha = new Date(anio, mes - 1, i);
        const indiceDia = fecha.getDay(); // 0 (Dom) a 6 (Sab)
        this.arrmes.push({
          dia: i,
          nomdia: inicialesDias[indiceDia]
        });
      }
    }
}
