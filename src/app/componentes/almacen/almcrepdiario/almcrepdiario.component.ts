import { Component, OnInit,Input,HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LogisticaService } from 'src/app/servicios/logistica.service';

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

  dataSource=[]
  heighttmodal1:any;
  buscando = false
  fila_sel=-1

  dataagru=[]
  dataingreso=[]
  datasalida=[]

  minicio
  nombmes
  arrmes=[]
  meses = ['',
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  constructor(
    private _logisticaService: LogisticaService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
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
    let res = await this._logisticaService.ListarMovalmcobraRepDiario({id_proyecto: this.id_proyecto,fechaini: this.filareg.fechaini,fechafin: this.filareg.fechafin,iding: this.id_reg }); //iding idregmov
    console.log(res);
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
      console.log(JSON.parse(JSON.stringify(arrfinal)))
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
      this.dataingreso=res[2]
      this.datasalida=res[3]
      //si tabla 2 y tabla 3 no hay filas, no cargar nada y mostrar mensaje?
      if(this.dataingreso.length<=0 && this.datasalida.length<=0){
        this.toaster.error('No existen Ingresos ni Salidas.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    } else {
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.heighttmodal1 = window.innerHeight - 230;
  }
  cambindicesel(ind: any) {
    if (ind == this.fila_sel) this.fila_sel = -1;
    else this.fila_sel = ind;
  }

  ActualizarRep(){
    console.log(this.minicio)
    this.mostrar_carga_todo=true;
    this.arrmes=[]
    this.dataSource=JSON.parse(JSON.stringify(this.dataagru))
    
    if(this.minicio){
      const d1 = this.minicio.split('-'); 
      this.CalculaColmes(Number(d1[1]),Number(d1[0]))
      //agregar detalles
      //this.CalcularColdetalle()
    }
    else{
      this.toaster.error('Seleccione un Mes para generar el reporte.','Advertencia',{closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000});
    }
    this.mostrar_carga_todo=false;
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
      console.log(this.arrmes)
    }
}
