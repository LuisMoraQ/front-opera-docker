import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { ReportesComponent } from '../../proyectos/reportes/reportes.component';

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
  simbolo=''

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

  datosproy=null;

  @Input() filareg:any
  @Input() decproy:any
  @Input() colproy:any

  constructor(
    private _logisticaService:LogisticaService,
    public formService: FormsService,
    private principalService:PrincipalService,
    private modalService: NgbModal,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.heightpres = window.innerHeight-180;
    this.id_reg=this.filareg.id_registro;
    this.id_proyecto=this.filareg.id_proyecto
    this.simbolo=this.filareg.simbolo
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
        this.dataSource2=tablares;//presupuesto
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
  async Imprimir(){
    if(this.datosproy==null){
      const detalleProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.id_proyecto})
      this.datosproy=detalleProyecto;
    }
    //columnas con moneda: PRECIO,PARCIAL,
    const arrayHeader =[[{text:'ITEM',colSpan:1,rowSpan:2},{text:'DESCRIPCION',colSpan:1,rowSpan:2},{text:'UNIDAD',colSpan:1,rowSpan:2},{text:'PRESUPUESTO APROBADO',colSpan:3,rowSpan:1},{text:'PRESUPUESTO UTILIZADO',colSpan:3,rowSpan:1},{text:'SALDO PROYECTO',colSpan:3,rowSpan:1},{text:'PRESUPUESTO SOLICITADO',colSpan:3,rowSpan:1} ],
    [{text:'METRADO',colSpan:1,rowSpan:1}, {text:'PRECIO',colSpan:1,rowSpan:1}, {text:'PARCIAL',colSpan:1,rowSpan:1},{text:'METRADO',colSpan:1,rowSpan:1},{text:'PARCIAL',colSpan:1,rowSpan:1},{text:'%',colSpan:1,rowSpan:1},{text:'METRADO',colSpan:1,rowSpan:1},{text:'PARCIAL',colSpan:1,rowSpan:1},{text:'%',colSpan:1,rowSpan:1},{text:'METRADO SOLICITADO',colSpan:1,rowSpan:1},{text:'PARCIAL',colSpan:1,rowSpan:1},{text:'%SOL',colSpan:1,rowSpan:1}]]
    const arrayKeys = ['item', 'descripcion', 'unidad', 'metrado', 'precio', 'parcial','metradouti','parcialuti','porcuti','metradosal','parcialsal','porcsal','metradosol','parcialsol','porcsol']
    const arrdec=[null,null,null,this.dec_metrado,this.dec_precio,this.dec_parcial,this.dec_metrado,this.dec_parcial,null,this.dec_metrado,this.dec_parcial,null,this.dec_metrado,this.dec_parcial,null];
    const arralig=['left','left','center','right','right','right','right','right','center','right','right','center','right','right','center'];
    let aux=JSON.parse(JSON.stringify(this.dataSource2));
    let arrpasa=[];
    let arrtit=[];
    arrtit.push({
      item:'',
      descripcion:'COMPLETO',
    });
    for(let row of aux){//asignar colores
      let tipol='';
      let colorl='';
      let fondol='';
      let valor2= row.item.toString().split('.');
      if(this.titulo1letra!=undefined)
      {
        if(row.unidad!='')
        {
          colorl=this.titulo1letra[11]
        }
        else
        {
          let ind=valor2.length>=12?11:valor2.length-1;
          colorl=this.titulo1letra[ind];
        }
      }
      if(this.titulo1color!=undefined)
      {
        if(row.unidad!='')
        {
          fondol = this.titulo1color[11];
        }
        else
        {
          let ind=valor2.length>=12?11:valor2.length-1;
          fondol=this.titulo1color[ind];
        }
      }
      if(this.titulo1!=undefined)
      {
        if(row.unidad!='')
        {
          tipol = this.titulo1[11];
        }
        else{
          let ind=valor2.length>=12?11:valor2.length-1;
          tipol=this.titulo1[ind];
        }
      }
      let esp=' ';
      let descp=esp.repeat(valor2.length-1)+row.descripcion;
      row.porcuti=this.formService.redondeo(row.porcuti,2);
      row.porcsal=this.formService.redondeo(row.porcsal,2);
      row.porcsol=this.formService.redondeo(row.porcsol,2);
      row.tipoletra=tipol
      row.color=colorl=='unset'?'':colorl
      row.fondo=fondol=='none'?'':fondol
      arrpasa.push(row)
      // arrpasa.push({
      //   indice:row.indice,
      //   item:row.item,
      //   itemord:row.itemord,
      //   descripcion:descp,
      //   //id_unidad:row.id_unidad,
      //   unidad:row.unidad,
      //   metrado:row.id_unidad!=''?this.formService.redondeo(row.metrado,this.dec_metrado):null,
      //   //jornada:,
      //   precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
      //   parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
      //   //rendimiento:,
      //   //tipofila:row.tipofila,
      //   //und_rendi:,
      //   tipoletra:tipol,
      //   color:colorl=='unset'?'':colorl,
      //   fondo:fondol=='none'?'':fondol
      // });
      if(!(row.item.includes('.'))){
        arrtit.push({
          indice:row.indice,
          item:row.item,
          itemord:row.itemord,
          descripcion:descp,
          //id_unidad:row.id_unidad,
          unidad:row.unidad,
          metrado:row.id_unidad!=''?this.formService.redondeo(row.metrado,this.dec_metrado):null,
          //jornada:,
          precio:row.id_unidad!=''?this.formService.redondeo(row.precio,this.dec_precio):null,
          parcial:this.formService.redondeo(row.parcial,this.dec_parcial),
          //rendimiento:,
          //tipofila:row.tipofila,
          //und_rendi:,
          tipoletra:tipol,
          color:colorl=='unset'?'':colorl,
          fondo:fondol=='none'?'':fondol
        });
      }
    }
    //agregar footer
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec:arrdec,
      col_alig:arralig,
      tabla: arrpasa,
      //tabla2: tablaTotales,
      //concat_tabla2:false,
      tipo_reporte:0,
      reporte:0,
      orientacion:'landscape',
      moneda:this.simbolo,//condicionar
      titulo:'SALDO PRESUPUESTAL '+this.filareg.detalle,
      //parametros filtro por titulo
      //tindirecto:this.tabindir,
      titulos:arrtit,
      dec_parcial:this.dec_parcial,
    }
    const modalRef = this.modalService.open(ReportesComponent, { size: 'lg modalgrande', backdrop: 'static', windowClass: 'pcoded', keyboard: false, });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
}
