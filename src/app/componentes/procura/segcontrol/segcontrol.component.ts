import { Component, HostListener, Input, OnInit } from '@angular/core';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-segcontrol',
  templateUrl: './segcontrol.component.html',
  styleUrls: ['./segcontrol.component.scss']
})
export class SegcontrolComponent implements OnInit {
  mostrar_carga_todo=false
  dataSource2=[]
  dataCompleto=[]
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

  FormConf = new FormGroup({
      seltipocontra: new FormControl(''),
    })
    get seltipocontra(): FormControl { return this.FormConf.get('seltipocontra') as FormControl }
  
  constructor(
    private _logisticaService:LogisticaService,
    private encriptadorService: EncriptadorService,
    public formService: FormsService,
    //private modalService: NgbModal,
  ) { }

  async ngOnInit() {
    this.heightpres = window.innerHeight-222;
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
      let tablares=await this._logisticaService.ListarAgruadquiSeguimiento({id_proyecto:this.id_proyecto,id_registro:this.id_reg,id_usuario:this.uidadmin});
      if(tablares){
        let aux=tablares[0];//presupuesto
        console.log(this.dataSource2)
        for(let row of aux){
          if(row.parcialsol){
            row.monto1=Number(row.parcial-row.parcialsol)
            let monreqsol=Number(row.parcial)==0?1:Number(row.parcial)
            let varia=((Number(row.parcial)-Number(row.parcialsol))/monreqsol)*100;
            row.porc1=this.formService.redondeo(varia,2);
            if(row.fechaing){
              let arrf1=row.fecha_gana.split('-');
              let fechaa = moment(arrf1[2]+'-'+arrf1[1]+'-'+arrf1[0]);
              let arrf2=row.fechaing.split('-');
              let fechab = moment(arrf2[2]+'-'+arrf2[1]+'-'+arrf2[0]);
              let difdias=(fechab.diff(fechaa, 'days'));
              row.plazoing=difdias;
              let arrf3=row.fecha_sol.split('-');
              let fechac = moment(arrf3[2]+'-'+arrf3[1]+'-'+arrf3[0]);
              let difdias2=(fechab.diff(fechac, 'days'));
              row.varia=difdias2

              let porcd=((Number(row.varia)*100)/Number(row.plazo_ate??1));
              row.porc2=porcd;
            }
          }
        }
        this.dataCompleto=aux;
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
  onResize(event:any) {
    this.heightpres = window.innerHeight-222;
  }
  cambindicesel1(ind:any){
    if(ind==this.fila2_sel)
      this.fila2_sel=-1;
    else
      this.fila2_sel=ind;
  }
  cambiarTipo(tipo:any){
    console.log(tipo)
    this.dataSource2 = this.dataCompleto.filter(x => (tipo=='' || x.tipocontra === parseInt(tipo)));
  }
}
