import { Component, HostListener, Input, OnInit } from '@angular/core';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';

@Component({
  selector: 'app-segcontrol',
  templateUrl: './segcontrol.component.html',
  styleUrls: ['./segcontrol.component.scss']
})
export class SegcontrolComponent implements OnInit {
  mostrar_carga_todo=false
  dataSource2=[]
  fila2_sel=-1
  buscando1=false
  heightpres=250
  simbolo=''

  dec_parcial=2;
  mask_parcial='0.2';

  uidadmin:any
  id_proyecto:any;
  id_reg:any;
  //datosproy=null;

  @Input() filareg:any
  @Input() decproy:any
  
  constructor(
    private _logisticaService:LogisticaService,
    private encriptadorService: EncriptadorService,
    public formService: FormsService,
    //private modalService: NgbModal,
  ) { }

  async ngOnInit() {
    this.heightpres = window.innerHeight-180;
    this.uidadmin = this.encriptadorService.recuperarlocalstory('id_admin');
    this.id_reg=this.filareg.id_registro;
    this.id_proyecto=this.filareg.id_proyecto
    this.simbolo=this.filareg.simbolo
    let decimales = this.decproy;
    if(decimales?.toString().includes('|')){
      let arrdec=decimales.split('|');
      this.dec_parcial=arrdec[2];
      this.mask_parcial='0.'+arrdec[2];
    }
    try{
      this.buscando1=true;
      let tablares=await this._logisticaService.ListarAgruadquisol({id_proyecto:this.id_proyecto,id_registro:this.id_reg,id_usuario:this.uidadmin});
      if(tablares){
        let aux=tablares[0];//presupuesto
        console.log(this.dataSource2)
        for(let row of aux){
          if(row.parcialsol){
            row.monto1=Number(row.parcial-row.parcialsol)
            let monreqsol=Number(row.parcial)==0?1:Number(row.parcial)
            let varia=((Number(row.parcial)-Number(row.parcialsol))/monreqsol)*100;
            row.porc1=this.formService.redondeo(varia,2);
          }
        }
        this.dataSource2=aux;
      }
      this.buscando1=false;
    }
    catch(e){
      this.buscando1=false;
      console.log(e)
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.heightpres = window.innerHeight-180;
  }
  cambindicesel1(ind:any){
    if(ind==this.fila2_sel)
      this.fila2_sel=-1;
    else
      this.fila2_sel=ind;
    console.log(this.fila2_sel)
  }
}
