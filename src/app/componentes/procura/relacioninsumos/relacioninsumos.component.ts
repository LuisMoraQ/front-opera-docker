import { Component, OnInit,Input, HostListener, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from 'src/app/servicios/swal.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { ReportesComponent } from '../../proyectos/reportes/reportes.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-relacioninsumos',
  templateUrl: './relacioninsumos.component.html',
  styleUrls: ['./relacioninsumos.component.scss']
})
export class RelacioninsumosComponent implements OnInit {
  mostrar_carga_todo=false
  widthm1b2: number=100;
  heightpres: number=100;
  heightins: number=100;
  oculceros1=false
  solover=false
  conreque=false
  estadoreg=0;
  //deteccion cambios
  bfaltactder=false;
  bactualizoder=false;
  bcambiost1=false;//Solicitud de presupuesto

  dec_metrado=4;
  mask_metrado='0.4';
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  aspectos:any
  titulo1:any = '';
  titulo1color:any = '';
  titulo1letra:any = '';
  
  id_proyecto:any;
  id_reg:any;
  presu=[]
  presudet=[]
  presusubp=[]

  data2difer:any;
  totalpreasig:any;
  totalpresoli:any;

  dataSource2=[]
  fila2_sel=-1;
  buscando1=false

  dataSourcedet2=[]
  filadet2_sel=-1;

  dataSource3=[];
  fila3_sel=-1
  buscando3=false

  existedisgre=true
  tablaagru=[]

  @Input() filareg:any
  @Input() decproy:any
  @Input() colproy:any
  @Output() listarpri = new EventEmitter<any>();

  constructor(
    private _logisticaService:LogisticaService,
    public formService: FormsService,
    private modalService: NgbModal,
    public principalService: PrincipalService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.heightpres = window.innerHeight-180;
    this.heightins = window.innerHeight-375;
    this.totalpreasig=this.filareg.costo_dir;
    this.id_reg=this.filareg.id_registro;
    this.id_proyecto=this.filareg.id_proyecto
    this.simbolo=this.filareg.simbolo
    this.solover=this.filareg.solover
    this.estadoreg=this.filareg.estado

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
      this.buscando3=true;
      let tablares=await this._logisticaService.ListarDetPresuAdquiSol({id_proyecto:this.id_proyecto,id_registro:this.id_reg,fuente:this.filareg.excuagru});//falta 1 parametro this.filareg
      if(tablares){
        //para verificar demas tablas
        let res=await this._logisticaService.listarRelinsAdqui({id_proyecto:this.id_proyecto,id_registro:this.id_reg,conrelins:'1'});
        console.log(res)
        if(res?.length>0){
          this.existedisgre=res[2].length>0?true:false;
          this.tablaagru=res[1]
          //revisar si no hay estado requerimiento u otros para no habilitar solo ver
          for(let row of this.tablaagru){
            if(row.estado!=0){
              this.solover=true;
              this.conreque=true;
              break;
            }
          }
        }
        else{
          this.existedisgre=false;
        }
        this.presudet=tablares[1];
        this.presusubp=tablares[2];
        this.dataSource2=tablares[0];//presupuesto
        for(let index=0;index<this.dataSource2.length;index++){
          if(this.dataSource2[index].difer==1){
            this.data2difer++;
          }
        }
        this.dataSource3=tablares[3];
        let suma=0;
        for(let j=0;j<this.dataSource3.length;j++){
          if(this.dataSource3[j].num_det=='0')
          {
            let filad={descripcion:this.dataSource3[j].descripcion,parcial:this.dataSource3[j].parcial};
            this.dataSourcedet2.push(filad)
            suma=suma+Number(this.dataSource3[j].parcial);
          }
        }
        this.totalpresoli=this.formService.redondeo(suma,this.dec_parcial);
      }
      this.buscando1=false;
      this.buscando3=false;
    }
    catch(e){
      this.buscando1=false;
      this.buscando3=false;
      console.log(e)
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.heightpres = window.innerHeight-180;
    this.heightins = window.innerHeight-375;
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
  editarcelda1(ind:any){
    if(this.solover){
      return;
    }
    else if(this.estadoreg==1 || this.estadoreg==2){
      return
    }
    else if(this.existedisgre){
      this.toaster.error('No puede editar por la existencia de Insumos Disgregados. Eliminarlos para poder editar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      return;
    }
    this.dataSource2[ind].editar1=1;
  }
  caneditarcelda1(eve:any,ind:any){
    var valor=Number(eve.toString().replace(/\,/g, ''));
    var actual=Number(this.dataSource2[ind].metradosol)
    var aprecio=Number(this.dataSource2[ind].precio);
    var ametrado=Number(this.dataSource2[ind].metrado);
    this.dataSource2[ind].editar1=0;
    if(valor>=0 && valor<=ametrado){
      if(valor!=actual){
        var porc=this.formService.redondeo(((valor*100)/ametrado),2);
        this.dataSource2[ind].porcsol=porc;
        this.dataSource2[ind].difer=0;
        this.data2difer--;
        this.calculartotal(this.formService.redondeo((valor*aprecio),this.dec_parcial),Number(this.dataSource2[ind].parcialsol),ind);
        this.dataSource2[ind].metradosol=this.formService.redondeo(Number(valor),this.dec_metrado);
        this.dataSource2[ind].parcialsol=this.formService.redondeo((valor*aprecio),this.dec_parcial);
        this.dataSource2[ind].accion=1;
        this.bfaltactder=true;
        this.bcambiost1=true;
      }
    }
    else
    {
      this.toaster.error('El Metrado Solicitado no puede ser mayor al Saldo del Metrado.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  presenter1(event:any,ind:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarcelda1(this.dataSource2[ind].metradosol,ind)//el primer parametro es el valor de la celda a editar
    }
    else if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
    else if(event.keyCode.toString()=="40"){
      event.target.blur();
      for(let i=ind+1;i<this.dataSource2.length;i++)
      {
        if(this.dataSource2[i].unidad!='' && Number(this.dataSource2[i].parcial)!=0 && this.dataSource2[i].mostrar==1)
        {
          this.dataSource2[i].editar1=1;
          break;
        }
      }
    }
    else if(event.keyCode.toString()=="38"){
      event.target.blur();
      for(let i=ind-1;i>0;i--)
      {
        if(this.dataSource2[i].unidad!='' && Number(this.dataSource2[i].parcial)!=0 && this.dataSource2[i].mostrar==1)
        {
          this.dataSource2[i].editar1=1;
          break;
        }
      }
    }
  }
  editarcelda2(ind:any){
    if(this.solover){
      return;
    }
    else if(this.estadoreg==1 || this.estadoreg==2){
      return
    }
    else if(this.existedisgre){
      this.toaster.error('No puede editar por la existencia de Insumos Disgregados. Eliminarlos para poder editar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      return;
    }
    this.dataSource2[ind].editar2=1;
  }
  caneditarcelda2(eve:any,ind:any){
    var valor=eve;
    var anterior=Number(this.dataSource2[ind].porcsol);
    this.dataSource2[ind].editar2=0;
    let indpri=this.dataSource2[ind].ind;//buscar el indice
    if(valor!=anterior)
    {
      this.dataSource2[ind].porcsol=this.formService.redondeo(Number(eve),2);
      if(this.dataSource2[ind].unidad!="")//tiene unidad es partida, sino es titulo o subtit
      {
        var aprecio=Number(this.dataSource2[ind].precio);
        var ametrado=Number(this.dataSource2[ind].metrado);
        var ametradosol=Number(this.formService.redondeo(((valor*ametrado)/100),this.dec_metrado));
        this.dataSource2[ind].metradosol=ametradosol.toString();
        this.calculartotal(this.formService.redondeo((ametradosol*aprecio),this.dec_parcial),Number(this.dataSource2[ind].parcialsol),ind);
        this.dataSource2[ind].parcialsol=this.formService.redondeo((ametradosol*aprecio),this.dec_parcial);
        this.dataSource2[ind].accion=1;
      }//si no tiene unidad se operara 1 grupo, en cambio si tiene unidad es una partida
      else
      {
        var titem=this.dataSource2[ind].item;
        for(let k=0;k<this.dataSource2.length;k++){
          var palabra=this.dataSource2[k].item.substring(0,(titem).length)
          if(palabra==titem && k!=indpri)
          {
            this.dataSource2[k].porcsol=this.formService.redondeo(Number(eve),2);
            var aprecio=Number(this.dataSource2[k].precio);
            var ametrado=Number(this.dataSource2[k].metrado);
            var ametradosol=Number(this.formService.redondeo(((valor*ametrado)/100),this.dec_metrado));
            this.dataSource2[k].metradosol=ametradosol.toString();
            this.dataSource2[k].parcialsol=this.formService.redondeo((ametradosol*aprecio),this.dec_parcial);
            this.dataSource2[k].accion=1;
          }
        }
        let agrupado=titem;
        //agrupaciones de parciales
        var aritem=titem.split('.');
        let i=aritem.length-1;
        let suma=0;
        let indexgrup=0;
        while(i>=0){
          //restar lo del parcial si el id agrupado es igual
          for(let k=0;k<this.dataSource2.length;k++){
            var palabra=this.dataSource2[k].item;
            if(palabra.length==agrupado.length)
            {
              if(palabra==agrupado)
              {
                indexgrup=k;
              }
            }
            else
            {
              var ejemplo2=palabra.substring(0,(agrupado).length)
              var palabras=palabra.split('.');
              var items=agrupado.split('.');
              if(palabras.length==items.length+1)
              {
                if(ejemplo2==agrupado)
                {
                  suma=suma+Number(this.dataSource2[k].parcialsol);
                }
              }
            }
          }
          agrupado=agrupado.substring(0,agrupado.length-(aritem[i].length+1))
          this.dataSource2[indexgrup].parcialsol=this.formService.redondeo(suma,this.dec_parcial);
          this.dataSource2[indexgrup].accion=1;
          suma=0;
          i--;
        }
      }
      this.bfaltactder=true;
      this.bcambiost1=true;
    }
  }
  presenter2(event:any,ind:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarcelda2(this.dataSource2[ind].porcsol,ind)//el primer parametro es el valor de la celda a editar
    }
    else if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
    else if(event.keyCode.toString()=="40"){
      event.target.blur();
      //condicion para mover el editar a la siguiente fila con editar
      for(let i=ind+1;i<this.dataSource2.length;i++)
      {
        if(this.dataSource2[i].unidad=='')
        {
          if(this.dataSource2[i+1].unidad!=''){
            this.dataSource2[i].editar2=1;
            break;
          }
        }
        else{
          this.dataSource2[i].editar2=1;
          break;
        }
      }
    }
    else if(event.keyCode.toString()=="38"){
      event.target.blur();
      //condicion para mover el editar a la siguiente fila con editar
      for(let i=ind-1;i>0;i--)
      {
        if(this.dataSource2[i].unidad=='')
        {
          if(this.dataSource2[i+1].unidad!=''){
            this.dataSource2[i].editar2=1;
            break;
          }
        }
        else{
          this.dataSource2[i].editar2=1;
          break;
        }
      }
    }
  }
  calculartotal(valor:any,anterior:any,ind:any){
    var aritem=this.dataSource2[ind].item.split('.');
    if(this.dataSource2[ind].unidad!="")//tiene unidad es partida, sino es titulo o subtit
    {
      var resto=valor-anterior;
      let i=aritem.length-1;
      let titem="";
      let tamaño=0;
      //agrupaciones de parciales
      while(i>0){
        tamaño=tamaño+aritem[i].length+1;
        titem=this.dataSource2[ind].item.substring(0,this.dataSource2[ind].item.length-tamaño)
        let indexgrup=0;
        for(let j=0;j<this.dataSource2.length;j++){
          if(this.dataSource2[j].item==titem)
          {
            var tot=Number(this.dataSource2[j].parcialsol);
            this.dataSource2[j].parcialsol=this.formService.redondeo((tot+resto),this.dec_parcial);
            this.dataSource2[j].accion=1;
            indexgrup=j;
            j=this.dataSource2.length;
          }
        }
        if(i==aritem.length-1){//quitar la condicion para calcular los % de todos los titulos
          var suma=0;
          var cont=0;
          //calcular promedio de porcentajes
          for(let k=0;k<this.dataSource2.length;k++){
            var palabra=this.dataSource2[k].item.substring(0,(titem).length)
            var palabras=this.dataSource2[k].item.split('.');
            var items=titem.split('.');
            if(palabras.length==items.length+1)
            {
              if(palabra==titem)
              {
                var tot=Number(this.dataSource2[k].porcsol);
                suma=suma+tot;
                cont++;
              }
            }
          }
          var porc=this.formService.redondeo((suma/cont),2);
          this.dataSource2[indexgrup].porcsol=porc;
          this.dataSource2[indexgrup].accion=1;
        }
        
        titem=titem+".";
        i--;
      }
    }
  }
  ocultarceros1(val:any){
    if(val==0){
      this.oculceros1=true;
      for(let row of this.dataSource2){
        if(Number(row.metrado)==0 && row.unidad!='')
        {
          row.mostcero=0;
        }
      }
    }
    else{
      this.oculceros1=false;
      for(let row of this.dataSource2){
        if(Number(row.metrado)==0 && row.unidad!='')
        {
          row.mostcero=1;
        }
      }
    }
  }
  cambindiceseldet2(ind:any){
    if(ind==this.filadet2_sel)
      this.filadet2_sel=-1;
    else
      this.filadet2_sel=ind;
  }
  cambindicesel3(ind:any){
    if(ind==this.fila3_sel)
      this.fila3_sel=-1;
    else
      this.fila3_sel=ind;
  }
  toggleOn1(fila:any){
    fila.icomost=1;
    for(let row of this.dataSource3){
      if(row.id_tipo_insumo==fila.id_tipo_insumo)
      {
        if(row.num_det!='0')
          row.mostrar="1";
      }
    }
  }
  toggleOff1(fila:any){
    fila.icomost=0;
    for(let row of this.dataSource3){
      if(row.id_tipo_insumo==fila.id_tipo_insumo)
      {
        if(row.num_det!='0')
          row.mostrar="0";
      }
    }
  }
  async actualizarder(){
    this.mostrar_carga_todo=true;
    this.dataSourcedet2=[];
    this.buscando3=true;
    this.dataSource3=[];
    //carlcular nueva relacion de insumos
    let totsol=0;
    for(let rowres of JSON.parse(JSON.stringify(this.dataSource2))){
      if(rowres.unidad!=''){
        totsol+=Number(rowres.parcialsol)
      }
    }
    let tabresult=await this.getTablaRelInsumos(null,totsol);
    this.dataSource3=tabresult.datos;
    let suma=0;
    for(let j=0;j<this.dataSource3.length;j++){
      if(this.dataSource3[j].num_det=='0')
      {
        let filad={descripcion:this.dataSource3[j].descripcion,parcial:this.dataSource3[j].parcial};
        this.dataSourcedet2.push(filad)
        suma=suma+Number(this.dataSource3[j].parcial);
      }
    }
    this.totalpresoli=this.formService.redondeo(suma,this.dec_parcial);

    this.buscando3=false;
    //fin cambios de tabla 5 y 8 al cambiar tabla 4
    this.bfaltactder=false;
    this.bactualizoder=true;
    this.mostrar_carga_todo=false;
  }
  getTablaRelInsumos(deccant:any,totpre=0){
    deccant=deccant??this.dec_cant;
    try{
      let tabacu=JSON.parse(JSON.stringify(this.presudet));
      let tabsub=JSON.parse(JSON.stringify(this.presusubp));
      let tabresult=[];
      for(let b=0;b<tabacu.length;b++){
        let rowpart;
        for(let fipart of this.dataSource2){
          if(tabacu[b].indice==fipart.indice){
            rowpart=fipart;//partida principal para multiplicar por metrado
            break;
          }
        }
        if(Number(rowpart.metradosol)==0){
          continue;
        }
        if(tabacu[b].indice_subp && tabacu[b].num_det>0){//es subapartida, cargar insumos de subpartida y hacer recursivo
          let cantpasa=Number(tabacu[b].cantidad);
          this.cargaInsumoSubp(tabresult,cantpasa,Number(rowpart.metradosol),tabacu[b].indice_subp,tabsub,deccant);
        }
        else if(!tabacu[b].indice_subp){
          const index = tabresult.findIndex(elem => {
            if(elem.operador!='%'){
              if(elem.id_tipo_insumo.toString() == tabacu[b].id_tipo_insumo.toString() && elem.descripcion==tabacu[b].descripcion && elem.precio==tabacu[b].precio){
                return elem;
              }
            }
            else{//porcentajes agrupa siempre, cantidad se recalcula
              if(elem.id_tipo_insumo.toString() == tabacu[b].id_tipo_insumo.toString() && elem.descripcion==tabacu[b].descripcion)
                return elem;
            }
          });
          if(index>-1){//si encuentra suma,
            if(tabresult[index].unidad!=''){
              if(tabacu[b].operador=='%'){
                let rparc=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(rowpart.metradosol)*Number(tabacu[b].parcial)),this.dec_parcial);
                tabresult[index].parcial=this.formService.redondeo(Number(rparc),this.dec_parcial);
              }
              else{
                let ropera=this.formService.redondeo(Number(tabresult[index].parcial)+(Number(rowpart.metradosol)*Number(tabacu[b].parcial)),this.dec_parcial);
                tabresult[index].parcial=ropera;
                tabresult[index].cantidad=tabacu[b].unidad!=''?this.formService.redondeo(Number(tabresult[index].parcial)/Number(tabresult[index].precio),deccant):tabresult[index].cantidad;
              }
              if(!tabresult[index].codigo && tabacu[b].codigo){
                tabresult[index].codigo=tabacu[b].codigo;
              }
            }
          }
          else{//si no encuentra se agrega
            if(tabacu[b].operador=='%'){
              tabacu[b].cantidad=0;
              tabacu[b].precio=0;
              tabacu[b].parcial=this.formService.redondeo(Number(rowpart.metradosol)*Number(tabacu[b].parcial),this.dec_parcial);
            }
            else{
              let rparc=this.formService.redondeo(Number(rowpart.metradosol)*Number(tabacu[b].parcial),this.dec_parcial);
              tabacu[b].parcial=this.formService.redondeo(Number(rparc),this.dec_parcial);
              let ropera=this.formService.redondeo(Number(tabacu[b].parcial)/Number(tabacu[b].precio),deccant);
              tabacu[b].cantidad=tabacu[b].unidad!=''?Number(ropera):tabacu[b].cantidad;
            }
            let filaadd={
              id_proyecto:tabacu[b].id_proyecto,
              indice:tabacu[b].indice,
              id_filadetalle:tabacu[b].id_filadetalle,
              id_tipo_insumo:tabacu[b].id_tipo_insumo,
              num_det:'1',
              codigo:tabacu[b].codigo,
              descripcion:tabacu[b].descripcion,
              unidad:tabacu[b].unidad,
              cantidad:tabacu[b].cantidad,
              precio:tabacu[b].precio,
              parcial:tabacu[b].parcial,
              id_indice:tabacu[b].id_indice,
              indice_subp:tabacu[b].indice_subp,
              operador:tabacu[b].operador,
              mostrar:tabacu[b].mostrar,
              icomost:tabacu[b].icomost,
              indiceunif:tabacu[b].indiceunif,
              compensa:null
            };
            tabresult.push(filaadd);
            //tabresult[tabresult.length-1].num_det=tabresult[tabresult.length-1].num_det>0?1:tabresult[tabresult.length-1].num_det;
            //tabresult[tabresult.length-1].cuadrilla='';
          }
        }
      }
      //corregir total en % mano obra operador% tipo_insumo1
      let totax=0;
      let indporc=-1;
      for(let r1=0;r1<tabresult.length;r1++){
        totax=totax+=Number(tabresult[r1].parcial);
        if(tabresult[r1].operador=='%' && /* tabresult[r1].tipo_insumo==1 && */ indporc==-1){
          indporc=r1;
        }
      }
      if(indporc>=0){
        console.log(this.formService.redondeo(totpre-totax,4))
        tabresult[indporc].parcial=this.formService.redondeo((Number(tabresult[indporc].parcial)+(totpre-totax)),this.dec_parcial);
        tabresult[indporc].compensa=totpre-totax;
      }
      //fin corr
      /* if(tabresult.length>0){ */
        let summano=0;
        let summat=0;
        let sumeq=0;
        let sumsubc=0;
        //calcular sumas, luego agregar agrupaciones 1 sola vez
        for(let m=0;m<tabresult.length;m++){
          if(tabresult[m].unidad!=''){
            if(tabresult[m].id_tipo_insumo=='1'){
              summano+=Number(tabresult[m].parcial);
            }
            else if(tabresult[m].id_tipo_insumo=='2'){
              summat+=Number(tabresult[m].parcial);
            }
            else if(tabresult[m].id_tipo_insumo=='3'){
              sumeq+=Number(tabresult[m].parcial);
            }
            else if(tabresult[m].id_tipo_insumo=='4'){
              sumsubc+=Number(tabresult[m].parcial);
            }
          }
          if(tabresult[m].operador=="%"){
            tabresult[m].precio=null;
            tabresult[m].cantidad=null;
          }
        }
        //agregar filas agrupaciones
        let filamano=this.CrearFilaAgru('MANO DE OBRA','1',this.formService.redondeo(summano,this.dec_parcial));
        tabresult.push(filamano);
        filamano=this.CrearFilaAgru('MATERIALES','2',this.formService.redondeo(summat,this.dec_parcial));
        tabresult.push(filamano);
        filamano=this.CrearFilaAgru('EQUIPO','3',this.formService.redondeo(sumeq,this.dec_parcial));
        tabresult.push(filamano);
        filamano=this.CrearFilaAgru('SUB CONTRATOS','4',this.formService.redondeo(sumsubc,this.dec_parcial));
        tabresult.push(filamano);
        // filamano=this.CrearFilaAgru('SUB PARTIDAS','5',this.formService.redondeo(sumsubp,this.dec_parcial));
        // tabresult.push(filamano);
        tabresult.sort( (a, b) => {
          if(a.id_tipo_insumo < b.id_tipo_insumo) {
            return -1;
          }
          if(a.id_tipo_insumo > b.id_tipo_insumo) {
            return 1;
          }
          if (a.num_det < b.num_det) {
            return -1;
          }
          if (a.num_det > b.num_det) {
            return 1;
          }
          if (a.descripcion < b.descripcion) {
            return -1;
          }
          if (a.descripcion > b.descripcion) {
            return 1;
          }
          return 0;
        });
        //asignar num_det
        let ndet = 0;
        let idtipoact = '';
        for (let m=0;m<tabresult.length;m++)
        {
          if (tabresult[m].num_det=="0")
          {
            ndet = 0;continue;
          }
          if(idtipoact!= tabresult[m].id_tipo_insumo)
          {
            idtipoact = tabresult[m].id_tipo_insumo;
            tabresult[m].num_det = ++ndet;
          }
          else
          {
            tabresult[m].num_det = ++ndet;
          }
        }
      /* } */
      return {datos:tabresult,total:totpre};
    }
    catch{
      return null;
    }
  }
  cargaInsumoSubp(tabresult:any,cant_padre:any,cant_part:any,indice_padre:any,tabsub:any,deccant:any){
    deccant=deccant??this.dec_cant;
    for(let b=0;b<tabsub.length;b++){
      if(tabsub[b].indice==indice_padre){
        if(tabsub[b].indice_subp && tabsub[b].num_det>0){
          let cantpasa=cant_padre*Number(tabsub[b].cantidad);
          this.cargaInsumoSubp(tabresult,cantpasa,cant_part,tabsub[b].indice_subp,tabsub,deccant);
        }
        else if(!tabsub[b].indice_subp){
          const index = tabresult.findIndex(elem => {
            if(elem.operador!='%'){
              if(elem.id_tipo_insumo.toString() == tabsub[b].id_tipo_insumo.toString() && elem.descripcion==tabsub[b].descripcion && elem.precio==tabsub[b].precio)
              return elem;
            }
            else{//porcentajes agrupa siempre, cantidad se recalcula
              if(elem.id_tipo_insumo.toString() == tabsub[b].id_tipo_insumo.toString() && elem.descripcion==tabsub[b].descripcion)
                return elem;
            }
          });
          if(index>-1){//si encuentra suma,
            if(tabsub[b].operador=='%'){
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), this.dec_parcial+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, this.dec_parcial);
              tabresult[index].parcial=this.formService.redondeo(Number(tabresult[index].parcial)+Number(parctot),this.dec_parcial);
            }
            else{
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), this.dec_parcial+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, this.dec_parcial);
              tabresult[index].parcial=this.formService.redondeo(Number(tabresult[index].parcial)+Number(parctot),this.dec_parcial);
              if(tabresult[index].unidad!=''){
                let ropera=this.formService.redondeo(Number(tabresult[index].parcial)/Number(tabresult[index].precio),deccant)
                tabresult[index].cantidad=tabsub[b].unidad!=''?Number(ropera):tabresult[index].cantidad;
              }
            }
            if(!tabresult[index].codigo && tabsub[b].codigo){
              tabresult[index].codigo=tabsub[b].codigo;
            }
          }
          else{//si no encuentra se agrega
            if(tabsub[b].operador=='%'){
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), this.dec_parcial+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, this.dec_parcial);
              tabsub[b].parcial=parctot;
            }
            else{
              let calcval = this.formService.redondeo(cant_padre * Number(tabsub[b].parcial), this.dec_parcial+1);
              let parctot = this.formService.redondeo(Number(calcval) * cant_part, this.dec_parcial);
              tabsub[b].parcial=parctot;
              let ropera=this.formService.redondeo(Number(parctot)/Number(tabsub[b].precio),deccant);
              tabsub[b].cantidad=tabsub[b].unidad!=''?Number(ropera):tabsub[b].cantidad;
            }
            let filaadd={
              id_proyecto:tabsub[b].id_proyecto,
              indice:tabsub[b].indice,
              id_filadetalle:tabsub[b].id_filadetalle,
              id_tipo_insumo:tabsub[b].id_tipo_insumo,
              num_det:'1',
              codigo:tabsub[b].codigo,
              descripcion:tabsub[b].descripcion,
              unidad:tabsub[b].unidad,
              cantidad:tabsub[b].cantidad,
              precio:tabsub[b].precio,
              parcial:tabsub[b].parcial,
              id_indice:tabsub[b].id_indice,
              indice_subp:tabsub[b].indice_subp,
              operador:tabsub[b].operador,
              mostrar:tabsub[b].mostrar,
              icomost:tabsub[b].icomost,
              indiceunif:tabsub[b].indiceunif,
              compensa:null
            };
            tabresult.push(filaadd);
            //tabresult[tabresult.length-1].num_det=tabresult[tabresult.length-1].num_det>0?1:tabresult[tabresult.length-1].num_det;
            //tabresult[tabresult.length-1].cuadrilla='';
          }
        }
      }
    }
    //return sumasub;
  }
  CrearFilaAgru(pdescripcion:any,pid_tipo_insumo:any,pparcial:any){
    let filaaux={
      id_proyecto:this.id_proyecto,
      indice:null,// se debe recuperar el indice del padre
      id_filadetalle:null,
      id_tipo_insumo:Number(pid_tipo_insumo),
      num_det:0,
      codigo:null/* detpart[a].codigo=='' || detpart[a].codigo==null?null:detpart[a].codigo */,
      descripcion:pdescripcion,
      unidad:'',
      cantidad:null,
      precio:null,
      parcial:Number(pparcial),
      id_indice:null,
      indice_subp:null,
      operador:null,
      mostrar:1,
      icomost:1,
      indiceunif:null,
      compensa:null
    };
    return filaaux;
  }
  async GuardarDatos(){
    try{
      if(this.data2difer>0){
      this.toaster.error('No se puede guardar un proyecto con inconsistencias. Haga clic en corregir.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
    else{
      if(this.bfaltactder){//se hizo cambios en Presupuesto Solicitado, pero no se actualizo
        //this.actualizarder();
        this.toaster.info('Primero debe actualizar la Relacion de Insumos.', 'Informacion', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
      else{
        if(this.bactualizoder || this.bcambiost1){
          this.mostrar_carga_todo=true;
          let resultad=(Number(this.totalpresoli)*100)/Number(this.totalpreasig);
          let porc=this.formService.redondeo(resultad,1);
          //recalcular agrupaciones si existen
          let datos3;
          let editado=false;
          if(this.tablaagru.length>0){
            let total=0;
            for(let a=0;a<this.tablaagru.length;a++){//buscar si existe en relacion de insumos y actualziar con su valor, eliminar si no existe
              if(this.tablaagru[a].indice!=null){
                //buscar en rel insumos
                let val=this.dataSource3.find(ele=>ele.indice==this.tablaagru[a].indice && ele.id_filadetalle==this.tablaagru[a].id_filadetalle);
                if(val){
                  this.tablaagru[a].cantidad=val.cantidad
                  this.tablaagru[a].precio=val.precio
                  this.tablaagru[a].parcial=val.parcial
                  total+=Number(this.tablaagru[a].parcial)
                  editado=true;
                  val.seleccion=2
                }
                else{
                  console.log('elimina - '+ a)
                  this.tablaagru.splice(a,1);
                  editado=true;
                  a--;
                }
              }
            }
            console.log(this.tablaagru)
            //recalcular totales(parcial) y porcentajes(porc)? solo agrupaciones, complemento es 0
            if(editado){
              let indgru=-1;
              let agrusel=''
              let sumgru=0
              for(let b=0;b<this.tablaagru.length;b++){
                if(agrusel!=this.tablaagru[b].idgrupo){
                  if(indgru!=-1){
                    this.tablaagru[indgru].parcial=sumgru;
                    this.tablaagru[indgru].porc=this.formService.redondeo((sumgru*100)/total,1);
                  }
                  indgru=b
                  agrusel=this.tablaagru[b].idgrupo
                  sumgru=0;
                }
                else{
                  sumgru+=Number(this.tablaagru[b].parcial)
                }
              }
              if(indgru!=-1){//actualizar ultima agrupacion
                this.tablaagru[indgru].parcial=sumgru;
                this.tablaagru[indgru].porc=this.formService.redondeo((sumgru*100)/total,1);
              }
              datos3 = JSON.stringify(this.tablaagru);
            }
          }
          const datos1 = JSON.stringify(this.dataSource2);
          const datos2 = JSON.stringify(this.dataSource3);
          let objpasa={
            id_proyecto:this.id_proyecto,
            id_registro:this.id_reg,
            presutdir:this.totalpresoli,
            porcdir:porc,
            donde:this.filareg.excuagru,//0 inserta,1 modifica
            editado:0,
            datos1:datos1,
            datos2:datos2,
            datos3:datos3,
            editaagru:editado?1:0
          }
          let res=await this._logisticaService.GuardarAdquiPresuSol(objpasa);
          this.mostrar_carga_todo=false;
          if(res.id==1)
          {
            SwalService.success('Correcto',res.mensaje)
            this.bfaltactder=false;
            this.bcambiost1=false;//Solicitud de presupuesto
            this.bactualizoder=false;
            this.filareg.excuagru=1;
          }
          else
          {
            SwalService.error('Advertencia','No se pudo realizar la Operación. '+res.mensaje);
          }
          this.listarpri.emit('1')
          //this.ListarAdquisiciones();//listar tabla 1? usar emiter []=> ()="metodo" en el <app
        }
        else{
          this.toaster.info('No hay cambios para guardar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
    }
    }catch(e){
      this.mostrar_carga_todo=false;
      console.log(e)
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  corregirdifer(){
    if(this.data2difer>0){
      this.mostrar_carga_todo=true;
      for(let i=0;i<this.dataSource2.length;i++){
        if(this.dataSource2[i].difer==1){
          let valor=Number(this.dataSource2[i].metrado);
          let aprecio=Number(this.dataSource2[i].precio);
          var porc=this.formService.redondeo(100,2);
          this.dataSource2[i].porcsol=porc;
          this.dataSource2[i].difer=0;
          this.dataSource2[i].metradosol=this.formService.redondeo(Number(valor),this.dec_metrado);
          this.dataSource2[i].parcialsol=this.formService.redondeo((valor*aprecio),this.dec_parcial);
          this.dataSource2[i].accion=1;
          this.calculartotal(this.formService.redondeo((valor*aprecio),this.dec_parcial),Number(this.dataSource2[i].parcialsol),i);
        }
      }
      this.data2difer=0;
      this.bcambiost1=true;
      this.actualizarder();
      this.mostrar_carga_todo=false;
    }
  }
  datosproy=null
  async Imprimir() {
    if (this.datosproy == null) {
      const detalleProyecto =
        await this.principalService.recuperarDatosProyecto({
          id_proyecto: this.id_proyecto,
        });
      this.datosproy = detalleProyecto;
    }
    const arrayHeader = ['N°','DESCRIPCION','UND','CANTIDAD','PRECIO','PARCIAL'];
    const arrayKeys = [
      'num_det',
      'descripcion',
      'unidad',
      'cantidad',
      'precio',
      'parcial',
    ];
    const arrdec = [
      null,
      null,
      this.dec_metrado,
      this.dec_parcial,
      this.dec_parcial,
      this.dec_parcial,
    ];
    const arralig = [
      'center',
      'left',
      'center',
      'right',
      'right',
      'right'
    ];
    let aux = JSON.parse(JSON.stringify(this.dataSource3));
    let arrpasa = [];
    for (let row of aux) {
      arrpasa.push({
        num_det:!row.num_det?'':row.num_det ,
        descripcion: row.descripcion,
        unidad: row.unidad,
        cantidad:this.formService.redondeo(row.cantidad, this.dec_metrado),
        precio:row.precio,
        parcial: row.parcial,
        tipoletra:row.num_det==0?'3': '',
        color: '',
        fondo: row.num_det==0?'#F5F4C6':'',
      });
    }
    const datos = {
      datos_proyecto: this.datosproy,
      header: arrayHeader,
      keys_body: arrayKeys,
      keys_dec: arrdec,
      col_alig: arralig,
      tabla: arrpasa,
      tabla2: [],
      concat_tabla2: false,
      tipo_reporte: 0,
      reporte: 0,
      orientacion: '',
      moneda: this.simbolo,
      titulo: 'RELACION DE INSUMOS',
      dec_parcial: this.dec_parcial,
    };
    const modalRef = this.modalService.open(ReportesComponent, {
      size: 'lg modalgrande',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false,
    });
    modalRef.componentInstance.datos = datos;
    const result = await modalRef.result;
  }
}
