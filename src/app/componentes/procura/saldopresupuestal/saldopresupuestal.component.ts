import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';

@Component({
  selector: 'app-saldopresupuestal',
  templateUrl: './saldopresupuestal.component.html',
  styleUrls: ['./saldopresupuestal.component.scss']
})
export class SaldopresupuestalComponent implements OnInit {
  mostrar_carga_todo=false
  dataSource2=[]
  fila2_sel=-1
  buscando1=false
  heightpres=250

  dec_metrado=4;
  mask_metrado='0.4';
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant=4;
  mask_cant='0.4';
  aspectos:any
  titulo1:any = '';
  titulo1color:any = '';
  titulo1letra:any = '';
  id_proyecto:any;
  id_reg:any;

  @Input() filareg:any
  @Input() decproy:any
  @Input() colproy:any

  constructor(
    private _logisticaService:LogisticaService,
    public formService: FormsService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.heightpres = window.innerHeight-180;
    this.id_reg=this.filareg.id_registro;
    this.id_proyecto=this.filareg.id_proyecto

    this.aspectos = this.colproy?JSON.parse(this.colproy):null;
    this.pintar();
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
    try{
      this.buscando1=true;
      let tablares=await this._logisticaService.ListarSaldoPresu({id_proyecto:this.id_proyecto,id_registro:this.id_reg,fuente:this.filareg.excuagru});//falta 1 parametro this.filareg
      if(tablares){
        console.log(tablares)
        this.dataSource2=tablares;//presupuesto
        //calcular otros valores?

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
  pintar(){
    if(this.aspectos){
      this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
      this.titulo1color = this.aspectos.colorPresupuesto.split('|');
      this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
    }
  }
  cambindicesel1(ind:any){
    if(ind==this.fila2_sel)
      this.fila2_sel=-1;
    else
      this.fila2_sel=ind;
  }
  toggleOnpresu(itemsel, indice) {//icomost   1 mostrar, 0 ocultar
    let pila=[];//objetos{ item, icomost }
    this.dataSource2[indice].icomost=1;
    let nuevogru=false;
    for (let i=indice+1;i<this.dataSource2.length;i++) {
      if (this.dataSource2[i].item != itemsel && !nuevogru) {
        var palabra = this.dataSource2[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.dataSource2[i].item.toString().split('.').length){
            this.dataSource2[i].mostrar=1;
            this.dataSource2[i].estmost=1;
            if(this.dataSource2[i].unidad==''){
              pila.push({item:this.dataSource2[i].item,icomost:this.dataSource2[i].icomost});
            }
          }
          else{
            var palabra2 = this.dataSource2[i].item.toString().substring(0, this.dataSource2[i].item.lastIndexOf('.'))
            let fila1=pila.find(ele=>ele.item==palabra2);
            this.dataSource2[i].mostrar=fila1.icomost==0?0:this.dataSource2[i].estmost;
            if(this.dataSource2[i].unidad==''){
              pila.push({item:this.dataSource2[i].item,icomost:fila1.icomost==0?0:this.dataSource2[i].icomost});
            }
          }
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  toggleOffpresu(itemsel, indice) {
    this.dataSource2[indice].icomost = 0;
    let ind2 = indice+1;
    let nuevogru=false;
    for (let i=ind2;i<this.dataSource2.length;i++) {
      if (this.dataSource2[i].item != itemsel  && !nuevogru) {
        var palabra = this.dataSource2[i].item.toString().substring(0, itemsel.toString().length + 1)
        if (palabra == (itemsel + '.')) {
          if(itemsel.split('.').length+1==this.dataSource2[i].item.toString().split('.').length){
            this.dataSource2[i].estmost=0;
          }
          this.dataSource2[i].mostrar=0;
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
}
