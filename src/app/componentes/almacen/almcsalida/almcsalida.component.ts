import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { SwalService } from 'src/app/servicios/swal.service';
import * as moment from 'moment';

@Component({
  selector: 'app-almcsalida',
  templateUrl: './almcsalida.component.html',
  styleUrls: ['./almcsalida.component.scss']
})
export class AlmcsalidaComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  @Output() listarpri = new EventEmitter<any>();//aun no se usa, usar para el principal registros mov
  solover=false
  mostrar_carga_todo=false
  // fechaac:any;
  widthm1b2: number=100;
  heighttmodal13=250;
  heighttmodal=250;

  dec_metrado=4;
  mask_metrado='0.4';
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  id_proyecto:any;
  id_reg:any;

  dataSource2=[]
  fila2_sel=-1
  buscando2=false
  datainsdisg=[]
  dataingreso=[]
  datasalida=[]

  dataSource3=[]
  fila3_sel=-1
  buscando3=false
  tab3totalcant:any;
  tab3totalparc:any;
  tab3totalsal:any;

  dataSource4=[]
  fila4_sel=-1
  buscando4=false
  tab4total:any

  paddingscroll = 17;
  paddingscroll2 = 17;
  paddingscroll3 = 17;
  paddingscroll4 = 17;
  preventscroll=false;
  paddingscrollsup=0

  //agregar salida
  @ViewChild("modalSalida1") modalSalida1: ModalBasicComponent;
  nrosalida='';
  nroreqsel:any;
  detreqsol:any;
  lugreqsol:any;
  editasal=false;
  bcambiost5=false;
  heighttmodal2=100;
  paddingscroll2m=17
  paddingscrollm=17
  paddingscroll2n=17
  paddingscrolln=17

  dataSource5= [];
  fila5_sel=-1;
  tott5:any;
  seltodo5=0;

  dataSource3aux= [];
  fila3_selaux=-1;
  tab3auxtotalcant:any;
  tab3auxtotalparc:any;
  tab3auxtotalsal:any;
  widthm1b3=100;
  fechaSal
  fechamin
  fechamax

  constructor(
    private _EncriptadorService:EncriptadorService,
    private _logisticaService:LogisticaService,
    public formService: FormsService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.id_reg=this.filareg.idregmov;
    this.id_proyecto=this.filareg.id_proyecto
    this.simbolo=this.filareg.simbolo
    this.solover=this.filareg.solover
    //evitar salto de tabla por scroll
    let resto=this.solover?70:90;
    this.widthm1b2=(window.innerWidth/2)-resto;
    this.widthm1b3=(window.innerWidth-10)/2;
    // this.anchofoot3=this.solover?372:this.anchofoot3;
    this.heighttmodal=window.innerHeight-155;
    this.heighttmodal13=(window.innerHeight-106)/2;
    this.heighttmodal2=window.innerHeight-174;
    console.log(this.heighttmodal,this.heighttmodal13)
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
    // //listar y otras funciones
    // let resfec = await this._EncriptadorService.FechaActualBack();
    // if (resfec.id == 1) {
    //   this.fechaac = new Date(resfec.mensaje);
    // }
    // else{
    //   this.fechaac=new Date();
    // }
    // this.fechaSal=moment(this.fechaac).format('YYYY-MM-DD')
    let val1=this.filareg.fechaini.split('-')
    this.fechamin=val1[2]+'-'+val1[1]+'-'+val1[0]
    val1=this.filareg.fechafin.split('-')
    this.fechamax=val1[2]+'-'+val1[1]+'-'+val1[0]
    //listar datos
    await this.listar1();
    console.log(this.filareg)
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    //this.heighttmodal=window.innerHeight-165;
    let resto=this.solover?70:90;
    this.widthm1b2=(window.innerWidth/2)-resto;
    this.widthm1b3=(window.innerWidth-10)/2;

    this.heighttmodal=window.innerHeight-155;
    this.heighttmodal13=(window.innerHeight-106)/2;
    this.heighttmodal2=window.innerHeight-174;
    console.log(this.heighttmodal2)
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
    var element = document.getElementById('tableBody2');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll3 != sizeef) {
        this.paddingscroll3 = sizeef;
      }
      let sizeef2 = element.offsetHeight - element.clientHeight;
      if (this.paddingscroll4 != sizeef2) {
        this.paddingscroll4 = sizeef2;
      }
    }
    var element = document.getElementById('contbody');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscrollsup != sizeef) {
        this.paddingscrollsup = sizeef;
      }
    }
    var element = document.getElementById('tableBodym');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscrollm != sizeef) {
        this.paddingscrollm = sizeef;
      }
      let sizeef2 = element.offsetHeight - element.clientHeight;
      if (this.paddingscroll2m != sizeef2) {
        this.paddingscroll2m = sizeef2;
      }
    }
    var element = document.getElementById('tableBodyn');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscrolln != sizeef) {
        this.paddingscrolln = sizeef;
      }
      let sizeef2 = element.offsetHeight - element.clientHeight;
      if (this.paddingscroll2n != sizeef2) {
        this.paddingscroll2n = sizeef2;
      }
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  SyncScroll() {
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
  SyncScroll2() {
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
  SyncScroll3() {
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBody2");
      var face3 = document.getElementById("tableFoot2");
      face3.scrollLeft = face2.scrollLeft;
    }
    catch(ex){}
  }
  SyncScroll4() {
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBody2");
      var face3 = document.getElementById("tableFoot2");
      face2.scrollLeft = face3.scrollLeft;
    }catch(ex){}
  }
  async listar1(){
    this.buscando2=true;
    let res=await this._logisticaService.ListarMovalmcobraDet({id_proyecto:this.id_proyecto,fechaini:this.filareg.fechaini,fechafin:this.filareg.fechafin,iding:this.id_reg});//iding idregmov
    console.log(res)
    this.buscando2=false;
    if(res?.length>0){
      this.dataSource2=res[0]
      this.datainsdisg=res[1]
      this.dataingreso=res[2]
      this.datasalida=res[3]
      // this.DatosDisgre=res[1]
      let arrfini=this.filareg.fechaini.split('-');
      console.log(moment(arrfini[2]+'-'+arrfini[1]+'-'+arrfini[0]).format('YYYY-MM-DD'))
      let ultfecha=moment(arrfini[2]+'-'+arrfini[1]+'-'+arrfini[0]).format('YYYY-MM-DD');
      for(let row of this.datasalida){
        let fechrow=moment(row.fecha).format('YYYY-MM-DD');
        if(fechrow>ultfecha){
          ultfecha=fechrow
        }
      }
      this.fechaSal=ultfecha
      console.log(ultfecha)//menor a ult fecha no debe ser editable, si es igual o mayor , permitir editar
      //agregar input fecha al agregar una nota de ingreso o salida?
      //tambien agregar fecha a las agrupaciones de las adquicisiones, lo que importa es la fecha de aprobacion, agregar fecha al hacer eso?
    }
    else{
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
    this.tab4total=0;
    this.tab3totalcant=0;
    this.tab3totalparc=0;
    this.tab3totalsal=0;
  }
  cambindicesel2(ind:any,seligual=false){
    if(ind==this.fila2_sel && !seligual){
      this.fila2_sel=-1;
      this.dataSource3=[]
      this.dataSource4=[]
      this.fila4_sel=-1;
      this.tab3totalcant=0;
      this.tab3totalparc=0;
      this.tab3totalsal=0;
    }
    else{
      this.fila2_sel=ind;
      this.fila4_sel=-1;
      let suma1=0;
      let suma2=0;
      let suma3=0;
      let idgru=this.dataSource2[this.fila2_sel].idgrupo;
      let idreg=this.dataSource2[this.fila2_sel].id_registro;
      this.dataSource3=[]
      this.dataSource4=[]
      for(let row of this.datainsdisg){
        if(row.idgrupo==idgru && row.id_registro==idreg){
          row.saldo=this.formService.redondeo(Number(row.ingreso)-Number(row.salida),this.dec_cant);
          row.indicador=Number(row.saldo)>0?0:1
          suma1+=Number(row.cantidad);
          suma2+=Number(row.parcial);
          suma3+=Number(row.saldo??0);
          this.dataSource3.push(row)
        }
      }
      let suma=0;
      console.log(this.datasalida)
      for(let row of this.datasalida){
        if(row.idgrupo==idgru && row.id_registro==idreg)
        {
          if(row.unidad==''){
            suma+=Number(row.parcial);
          }
          this.dataSource4.push(row)
        }
      }
      this.tab4total=this.formService.redondeo(suma,this.dec_parcial);
      //this.totalselval=this.redondeo(suma,this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      this.tab3totalcant=this.formService.redondeo(suma1,this.dec_cant);
      this.tab3totalparc=this.formService.redondeo(suma2,this.dec_parcial);
      this.tab3totalsal=this.formService.redondeo(suma3,this.dec_cant);
    }
  }
  cambindicesel3(ind:any){
    if(ind==this.fila3_sel)
      this.fila3_sel=-1;
    else
      this.fila3_sel=ind;
  }
  async OpenModalSalida1(){
    if(this.fila2_sel!=-1){
      let estadoreq=this.dataSource2[this.fila2_sel].estsalida;
      if(estadoreq!=2){
        this.tott5=this.formService.redondeo(0,this.dec_parcial);
        if(this.fila2_sel!=-1){
          let saldogru=Number(this.tab3totalsal);
          if(saldogru>0){
            this.nroreqsel=this.dataSource2[this.fila2_sel].idgrupo;
            this.detreqsol=this.dataSource2[this.fila2_sel].descripcion;
            this.lugreqsol=this.dataSource2[this.fila2_sel].entrega;
            this.mostrar_carga_todo=true;
            this.dataSource3aux=[];
            for(let m=0;m<this.dataSource3.length;m++){
              //filaag=this.dataSource3.data[m];
              // let filaag={id_registro:this.dataSource3.data[m].id_registro,cui:this.dataSource3.data[m].cui,version:this.dataSource3.data[m].version,idgrupo:this.dataSource3.data[m].idgrupo,codigo:this.dataSource3.data[m].codigo,nro:this.dataSource3.data[m].nro,indrep:this.dataSource3.data[m].indrep,descripcion:this.dataSource3.data[m].descripcion,estado:this.dataSource3.data[m].estado,
              //   idinsumo:this.dataSource3.data[m].idinsumo,unidad:this.dataSource3.data[m].unidad,cantidad:this.dataSource3.data[m].cantidad,precio:this.dataSource3.data[m].precio,parcial:this.dataSource3.data[m].parcial,acumulado:this.dataSource3.data[m].acumulado,proceso:this.dataSource3.data[m].proceso,princi:this.dataSource3.data[m].princi,mostrar:this.dataSource3.data[m].mostrar,
              //   ingreso:this.dataSource3.data[m].ingreso,salida:this.dataSource3.data[m].salida,saldo:this.dataSource3.data[m].saldo,indicador:this.dataSource3.data[m].indicador,seleccion:this.dataSource3.data[m].seleccion,editado:0};
              let filaag=JSON.parse(JSON.stringify(this.dataSource3[m]))
              filaag.seleccion=0
              filaag.editado=0
              this.dataSource3aux.push(filaag);
            }
            this.tab3auxtotalcant=this.tab3totalcant;
            this.tab3auxtotalparc=this.tab3totalparc;
            this.tab3auxtotalsal=this.tab3totalsal;
            let res=await this._logisticaService.UltNroSalAlmcobra({id_proyecto:this.id_proyecto,idregmov:this.id_reg});
            if(res.length>0){
              this.nrosalida=res[0].ultimo;
            }
            this.editasal=false;
            this.modalSalida1.show();
            this.mostrar_carga_todo=false;
          }
          else{
            this.toaster.error('No hay saldo para agregar Notas de Salida.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
          }
        }
        else{
          this.toaster.error('Seleccione un Requerimiento.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('No se puede modificar un requerimiento con estado CONFORME.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else{
      this.toaster.error('Seleccione una fila de Requerimientos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  OpenModalEditarSal1(){
    let estadoreq=this.dataSource2[this.fila2_sel].estsalida;
    if(estadoreq!=2){
      if(this.fila4_sel>=0)
      {
        let tipofila=this.dataSource4[this.fila4_sel].unidad==''?1:0;
        if(tipofila==1){
          this.editasal=true;
          this.nroreqsel=this.dataSource2[this.fila2_sel].idgrupo;
          this.detreqsol=this.dataSource2[this.fila2_sel].descripcion;
          this.lugreqsol=this.dataSource2[this.fila2_sel].entrega;
          this.nrosalida=this.dataSource4[this.fila4_sel].nrosalida;
          this.dataSource3aux=[];
          for(let m=0;m<this.dataSource3.length;m++){
            let filaag=JSON.parse(JSON.stringify(this.dataSource3[m]))
            filaag.seleccion=0
            filaag.editado=0
            this.dataSource3aux.push(filaag);
          }
          this.tab3auxtotalcant=this.tab3totalcant;
          this.tab3auxtotalparc=this.tab3totalparc;
          this.tab3auxtotalsal=this.tab3totalsal;
          let ind3=0
          for(let i=0;i<this.dataSource4.length;i++){
            if(this.dataSource4[i].nrosalida==this.nrosalida && this.dataSource4[i].unidad!='')
            {
              for(let j=0;j<this.dataSource3aux.length;j++){
                if(this.dataSource3aux[j].id_registro==this.dataSource4[i].id_registro && this.dataSource3aux[j].idgrupo==this.dataSource4[i].idgrupo &&
                this.dataSource3aux[j].idfila==this.dataSource4[i].idfila && this.dataSource3aux[j].indrep==this.dataSource4[i].indrep){
                  this.dataSource3aux[j].seleccion=2;//actualizar y buscar el indice correspondiente a la fila
                  break;
                }
              }
              let ejm={id_proyecto:this.id_proyecto,idregmov:this.id_reg,nrosalida:this.nrosalida,idsalida:this.dataSource4[i].idsalida,
                id_registro:this.dataSource4[i].id_registro,idgrupo:this.dataSource4[i].idgrupo,idfila:this.dataSource4[i].idfila,indrep:this.dataSource4[i].indrep,
                codigo:this.dataSource4[i].codigo,descripcion:this.dataSource4[i].descripcion,unidad:this.dataSource4[i].unidad,
                cantidad:this.dataSource4[i].cantidad,precio:this.dataSource4[i].precio,parcial:this.dataSource4[i].parcial,indice3:ind3++,editar:0};
              this.dataSource5.push(ejm);
            }
          }
          console.log(this.dataSource5)
          this.tott5=this.dataSource4[this.fila4_sel].parcial;
          this.mostrar_carga_todo=false;
          this.modalSalida1.show();
        }
        else{
          this.toaster.error('Seleccione una Nota de Salida para Editar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('Seleccione una Nota de Salida para Editar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else{
      this.toaster.error('No se puede modificar un requerimiento con estado CONFORME.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  async EliminarSal1(){
    try{
      let estadoreq=this.dataSource2[this.fila2_sel].estsalida;
      if(estadoreq!=2){
        if(this.fila4_sel>=0)
        {
          let tipofila=this.dataSource4[this.fila4_sel].unidad==''?1:0;
          if(tipofila==1){
            let nomdetalle=this.dataSource4[this.fila4_sel].descripcion+" N° "+this.dataSource4[this.fila4_sel].nrosalida;
            let mensj='Se eliminarán todos los datos del registro : '+nomdetalle.substring(0,nomdetalle.length>80?80:nomdetalle.length)+(nomdetalle.length>80?'...':'')
            const sw = await SwalService.confirm('Estas seguro?',null,mensj);
            if (sw.isConfirmed) {
              this.mostrar_carga_todo=true;
              let aux2=[];
              let nrosali=this.dataSource4[this.fila4_sel].nrosalida;
              for(let i=0;i<this.dataSource4.length;i++){
                if(this.dataSource4[i].unidad!='' && this.dataSource4[i].nrosalida==nrosali){
                  for(let j=0;this.dataSource3.length;j++){
                    if(this.dataSource3[j].id_registro==this.dataSource4[i].id_registro && this.dataSource3[j].idgrupo==this.dataSource4[i].idgrupo &&
                      this.dataSource3[j].idfila==this.dataSource4[i].idfila && this.dataSource3[j].indrep==this.dataSource4[i].indrep){
                      let salidaact=Number(this.dataSource3[j].salida);
                      let agregasal=Number(this.dataSource4[i].cantidad);
                      salidaact-=agregasal;
                      this.dataSource3[j].salida=this.formService.redondeo(salidaact,this.dec_cant);
                      let ingresoact=Number(this.dataSource3[j].ingreso);
                      this.dataSource3[j].saldo=this.formService.redondeo(ingresoact-salidaact,this.dec_cant);
                      this.dataSource3[j].indicador=ingresoact-salidaact>0?0:1;
                      aux2.push(this.dataSource3[j]);
                      break;
                    }
                  }
                }
              }
              //actualizar tabla izquierda
              let suma3=0;
              for(let row of this.dataSource3){
                suma3+=Number(row.saldo);
              }
              let estadosal=suma3>0?0:1;
              const tabla1=JSON.stringify(aux2);
              const body=JSON.stringify({
                'id_proyecto':this.id_proyecto,
                'idregmov':this.id_reg,
                'nrosalida':this.dataSource4[this.fila4_sel].nrosalida,
                'parcial':this.dataSource4[this.fila4_sel].parcial,
                'id_registro':this.dataSource2[this.fila2_sel].id_registro,
                'idgrupo':this.dataSource2[this.fila2_sel].idgrupo,
                'estadosal':estadosal,
                'datos1':tabla1,
              });
              let res=await this._logisticaService.EliminarNotaSalAlmcObra(body);//iding idregmov
              if(res?.id=='1'){
                this.fila4_sel=-1;
                await this.listar1();
                await this.cambindicesel2(this.fila2_sel,true)
                this.mostrar_carga_todo=false;
                this.listarpri.emit('1')
                SwalService.success('Correcto', res.mensaje)
              }
              else{
                this.mostrar_carga_todo=false;
                SwalService.error('Advertencia', res?res.mensaje:'Ocurrio una excepcion al momento de guardar.');
              }
            }
          }
          else{
            this.toaster.error('Seleccione una Nota de Salida.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
          }
        }
        else{
          this.toaster.error('Seleccione una Nota de Salida para Eliminar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('No se puede modificar un requerimiento con estado CONFORME.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    catch(e){
      console.log(e)
      this.mostrar_carga_todo=false
      this.toaster.error('No se puedo realizar la operación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  async cerrarModalSalida1(){
    if(this.bcambiost5){
      const sw = await SwalService.confirm('Desea Guardar los cambios?','','');
      if (sw.isConfirmed) {
        this.guardarModalSalida1();
      }
      else{
        //cancelar
        this.editasal=false;
        this.seltodo5=0;
        this.dataSource5=[];
        this.bcambiost5=false;
        this.dataSource3aux=[]
        this.tott5='0.00';
        this.modalSalida1.hide();
      }
    }
    else{
      this.editasal=false;
      this.seltodo5=0;
      this.bcambiost5=false;
      this.dataSource5=[];
      this.dataSource3aux=[]
      for(let row of this.dataSource3){//mantener?
        row.seleccion=0;
      }
      this.tott5='0.00';
      this.modalSalida1.hide();
    }
  }
  async guardarModalSalida1(){
    try{
      let monto0=false;
      if(this.dataSource5.length>0){
        if(this.bcambiost5){
          if(!this.editasal){
            const fecha = new Date(this.fechaSal);
            if(isNaN(fecha.getTime())){
              this.toaster.error('La Fecha de Salida asignada no es valida.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
              return;
            }
            let aux=[];
            let aux2=[];
            let ejm={id_proyecto:this.id_proyecto,idregmov:this.id_reg,nrosalida:this.nrosalida,idsalida:0,id_registro:this.dataSource2[this.fila2_sel].id_registro,idgrupo:this.dataSource2[this.fila2_sel].idgrupo,idfila:null,
              indrep:null,codigo:null,descripcion:"Nota de Salida de Materiales",unidad:'',cantidad:null,precio:null,parcial:this.tott5,indice3:null,editar:0};
            aux.push(ejm);
            for(let i=0;i<this.dataSource5.length;i++){
              aux.push(this.dataSource5[i]);
              if(Number(this.dataSource5[i].cantidad)==0){
                monto0=true;
              }
            }
            if(!monto0){
              this.mostrar_carga_todo=true;
              let suma3=0;
              for(let i=0;i<this.dataSource3aux.length;i++){//hacer un listar general y volver a cargar la fila seleccionada sería mejor?
                if(this.dataSource3aux[i].editado==1){
                  aux2.push(this.dataSource3aux[i]);
                  // //actualizar tabla 3 principal ingreso, saldo
                  // this.dataSource3[i].ingreso=this.dataSource3aux[i].ingreso;
                  // this.dataSource3[i].saldo=this.dataSource3aux[i].saldo;
                  // this.dataSource3[i].indicador=Number(this.dataSource3aux[i].saldo)>0?0:1;

                  // this.dataSource3b[i].ingreso=this.dataSource3aux[i].ingreso;//que tabla es datasource3b?
                  // let ingresot3=Number(this.dataSource3aux[i].ingreso);
                  // let salidat3b=Number(this.dataSource3b[i].salida);
                  // this.dataSource3b[i].saldo=this.formService.redondeo(ingresot3-salidat3b,2);
                  // this.dataSource3b[i].indicador=(ingresot3-salidat3b)>0?0:1;
                }
                suma3+=Number(this.dataSource3aux[i].saldo);//cantidad-ingreso
              }
              let estadosal=suma3>0?0:1;
              // nuevos parametros para metodo
              const tabla1=JSON.stringify(aux);
              const tabla2=JSON.stringify(aux2);
              const body=JSON.stringify({
                'id_proyecto':this.id_proyecto,
                'idregmov':this.id_reg,
                'id_registro':this.dataSource2[this.fila2_sel].id_registro,
                'idgrupo':this.dataSource2[this.fila2_sel].idgrupo,
                'estadosal':estadosal,
                'fecha':this.fechaSal,
                'datos1':tabla1,
                'datos2':tabla2,
              });
              let res=await this._logisticaService.GuardarSalidaAlmcobra(body);//iding idregmov
              if(res?.id=='1'){
                await this.listar1();
                //cargar los elementos seleccionados
                await this.cambindicesel2(this.fila2_sel,true)
                this.mostrar_carga_todo=false;
                this.bcambiost5=false;
                this.cerrarModalSalida1();
                //listar principal
                this.listarpri.emit('1')
                SwalService.success('Correcto', res.mensaje)
              }
              else{
                this.mostrar_carga_todo=false;
                SwalService.error('Advertencia', res?res.mensaje:'Ocurrio una excepcion al momento de guardar.');
              }
            }
            else{
              this.toaster.error('Existen registros con cantidad 0. Quitar de la tabla si no cambia de cantidad.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
            }
          }
          else{
            let aux2=[];
            for(let row of this.dataSource5){
              if(Number(row.cantidad)==0){
                monto0=true;
              }
            }
            if(!monto0){
              this.mostrar_carga_todo=true;
              let suma3=0;
              for(let i=0;i<this.dataSource3aux.length;i++){
                if(this.dataSource3aux[i].editado==1){
                  aux2.push(this.dataSource3aux[i]);
                  // //actualizar tabla 3 principal ingreso, saldo
                  // this.dataSource3[i].ingreso=this.dataSource3aux[i].ingreso;
                  // this.dataSource3[i].saldo=this.dataSource3aux[i].saldo;
                  // this.dataSource3[i].indicador=Number(this.dataSource3aux[i].saldo)>0?0:1;

                  // this.dataSource3b[i].ingreso=this.dataSource3aux[i].ingreso;
                  // let ingresot3=Number(this.dataSource3aux[i].ingreso);
                  // let salidat3b=Number(this.dataSource3b[i].salida);
                  // this.dataSource3b[i].saldo=this.formService.redondeo(ingresot3-salidat3b,this.dec_cant);
                  // this.dataSource3b[i].indicador=(ingresot3-salidat3b)>0?0:1;
                }
                suma3+=Number(this.dataSource3aux[i].saldo);//cantidad-ingreso
              }
              let estadosal=suma3>0?0:1;
              // nuevos parametros para metodo
              const tabla1=JSON.stringify(this.dataSource5);
              const tabla2=JSON.stringify(aux2);
              const body=JSON.stringify({
                'id_proyecto':this.id_proyecto,
                'idregmov':this.id_reg,
                'nrosalida':this.nrosalida,
                'parcial':this.tott5,
                'id_registro':this.dataSource2[this.fila2_sel].id_registro,
                'idgrupo':this.dataSource2[this.fila2_sel].idgrupo,
                'estadosal':estadosal,
                'datos1':tabla1,
                'datos2':tabla2,
              });
              let res=await this._logisticaService.EditarSalidaAlmcobra(body);//iding idregmov
              if(res?.id=='1'){
                await this.listar1();
                //cargar los elementos seleccionados
                await this.cambindicesel2(this.fila2_sel,true)
                this.mostrar_carga_todo=false;
                this.bcambiost5=false;
                this.cerrarModalSalida1();
                //listar principal
                this.listarpri.emit('1')
                SwalService.success('Correcto', res.mensaje)
              }
              else{
                this.mostrar_carga_todo=false;
                SwalService.error('Advertencia', res?res.mensaje:'Ocurrio una excepcion al momento de guardar.');
              }
            }
            else{
              this.toaster.error('Existen registros con cantidad 0. Quitar de la tabla si no cambia de cantidad.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
            }
          }
        }
        else{
          this.toaster.error('No hay cambios para guardar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('No hay detalles para guardar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    catch(e){
      console.log(e)
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  cambindicesel3aux(ind:any){
    if(ind==this.fila3_selaux)
      this.fila3_selaux=-1;
    else
      this.fila3_selaux=ind;
  }
  cambioselt31(row){
    if(row.seleccion==0)
      row.seleccion=1;
    else{
      row.seleccion=0;
    }
  }
  AgregarDetalle(){
    let totagrins=Number(this.tott5);
    let cont=0;
    let ultiding=0
    for(let row of this.dataSource5){
      ultiding=Number(row.idsalida)>ultiding?Number(row.idsalida):ultiding;
    }
    for(let i=0;i<this.dataSource3aux.length;i++){
      if(this.dataSource3aux[i].seleccion==1 && Number(this.dataSource3aux[i].saldo)>0)
      {
        cont++;
        let parc=Number(this.dataSource3aux[i].saldo)*Number(this.dataSource3aux[i].precio);
        let ejm={id_proyecto:this.id_proyecto,idregmov:this.id_reg,nrosalida:this.nrosalida,idsalida:++ultiding,
          id_registro:this.dataSource3aux[i].id_registro,idgrupo:this.dataSource3aux[i].idgrupo,idfila:this.dataSource3aux[i].idfila,indrep:this.dataSource3aux[i].indrep,
          codigo:this.dataSource3aux[i].codigo,descripcion:this.dataSource3aux[i].descripcion,unidad:this.dataSource3aux[i].unidad,
          cantidad:this.dataSource3aux[i].saldo,precio:this.dataSource3aux[i].precio,parcial:this.formService.redondeo(parc,this.dec_parcial),indice3:i,editar:0};
        this.dataSource5.push(ejm);
        totagrins=totagrins+parc;
        this.dataSource3aux[i].seleccion=2;//cambiar en la vista source4.data
        let cantagre=Number(this.dataSource3aux[i].saldo);
        let salidat3=Number(this.dataSource3aux[i].salida);
        this.dataSource3aux[i].salida=this.formService.redondeo(salidat3+cantagre,this.dec_cant);
        let valcant=Number(this.dataSource3aux[i].ingreso);
        this.dataSource3aux[i].saldo=this.formService.redondeo(valcant-(salidat3+cantagre),this.dec_cant);
        if(valcant-(salidat3+cantagre)>0){
          this.dataSource3aux[i].indicador=0;
        }
        else{
          this.dataSource3aux[i].indicador=1;
        }
        this.dataSource3aux[i].editado=1;
        this.TotalSaldo(this.dataSource3aux);
        this.bcambiost5=true;
      }
    }
    console.log(this.dataSource5)
    this.tott5=this.formService.redondeo(totagrins,this.dec_parcial);
    if(cont<1){
      this.toaster.error('Seleccione los insumos para agregar al grupo.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  TotalSaldo(data:any){
    let suma=0;
    for(let row of data){
      suma+=Number(row.saldo);
    }
    this.tab3auxtotalsal=this.formService.redondeo(suma,this.dec_cant);
  }
  cambioseltodos5(){
    if(this.seltodo5){
      this.seltodo5=0;
    }
    else{
      this.seltodo5=1;
    }
    for(let row of this.dataSource3aux){
      let idgru=this.dataSource2[this.fila2_sel].idgrupo;
      let idreg=this.dataSource2[this.fila2_sel].id_registro;
      if(row.idgrupo==idgru && row.id_registro==idreg && Number(row.saldo.replace(/\,/g,''))>0 && row.seleccion!=2){
        row.seleccion=this.seltodo5;
      }
    }
  }
  SyncScrollm() {
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBodym");
      var face3 = document.getElementById("tableFootm");
      face3.scrollLeft = face2.scrollLeft;
    }
    catch(ex){}
  }
  SyncScroll2m() {
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBodym");
      var face3 = document.getElementById("tableFootm");
      face2.scrollLeft = face3.scrollLeft;
    }catch(ex){}
  }
  SyncScrolln() {
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBodyn");
      var face3 = document.getElementById("tableFootn");
      face3.scrollLeft = face2.scrollLeft;
    }
    catch(ex){}
  }
  SyncScroll2n() {
    try{
      if (this.preventscroll) {
        this.preventscroll = false;
        return;
      }
      this.preventscroll = true;
      var face2 = document.getElementById("tableBodyn");
      var face3 = document.getElementById("tableFootn");
      face2.scrollLeft = face3.scrollLeft;
    }catch(ex){}
  }
  cambindicesel4(ind:any){
    if(ind==this.fila4_sel)
      this.fila4_sel=-1;
    else
      this.fila4_sel=ind;
  }
  toggleOn4(tipo:any){
    for(let row of this.dataSource4){
      if(row.nrosalida==tipo)
      {
        if(row.unidad!='')
        {
          row.mostrar=1;
        }
        else
          row.icomost=1;
      }
    }
  }
  toggleOff4(tipo:any){
    for(let row of this.dataSource4){
      if(row.nrosalida==tipo)
      {
        if(row.unidad!='')
        {
          row.mostrar=0;
        }
        else
          row.icomost=0;
      }
    }
  }
  //tabla5
  cambindicesel5(ind:any){
    if(ind==this.fila5_sel)
      this.fila5_sel=-1;
    else
    {
      this.fila5_sel=ind;
    }
  }
  editarcelda1(ind:any){
    this.dataSource5[ind].editar=1;
  }
  caneditarcelda1(eve:any,ind:any){
    var valor=Number(eve);
    var actual=Number(this.dataSource5[ind].cantidad)
    var pactual=Number(this.dataSource5[ind].parcial)
    var aprecio=Number(this.dataSource5[ind].precio);
    console.log(this.dataSource5[ind].indice3)
    var asaldo=Number(this.dataSource3aux[this.dataSource5[ind].indice3].saldo);
    var saldototal=asaldo+actual;
    this.dataSource5[ind].editar=false;
    if(valor>=0 && valor<=saldototal){
      if(valor!=actual){
        let montotot=this.tott5;
        montotot=montotot-pactual;
        montotot=montotot+(valor*aprecio);
        this.dataSource5[ind].cantidad=this.formService.redondeo(Number(valor),this.dec_cant);
        this.dataSource5[ind].parcial=this.formService.redondeo((valor*aprecio),this.dec_parcial);
        this.tott5=this.formService.redondeo(montotot,this.dec_parcial)

        let difer=actual-valor;
        let valsalida=Number(this.dataSource3aux[this.dataSource5[ind].indice3].salida);
        let valcant=Number(this.dataSource3aux[this.dataSource5[ind].indice3].ingreso);
        this.dataSource3aux[this.dataSource5[ind].indice3].salida=this.formService.redondeo(valsalida-difer,this.dec_cant);
        this.dataSource3aux[this.dataSource5[ind].indice3].saldo=this.formService.redondeo(valcant-(valsalida-difer),this.dec_cant);
        if(valcant-(valsalida-difer)>0){
          this.dataSource3aux[this.dataSource5[ind].indice3].indicador=0;
        }
        else{
          this.dataSource3aux[this.dataSource5[ind].indice3].indicador=1;
        }
        this.dataSource3aux[this.dataSource5[ind].indice3].editado=1;
        this.bcambiost5=true;
        this.TotalSaldo(this.dataSource3aux);
      }
    }
    else
    {
      this.toaster.error('La cantidad de Salida es mayor al saldo del requerimiento.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  presenter1(event:any,ind:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarcelda1(this.dataSource5[ind].cantidad,ind)//el primer parametro es el valor de la celda a editar
    }
    else if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
    else if(event.keyCode.toString()=="40"){
      this.dataSource5[ind].editar=0;
      if(ind+1<this.dataSource5.length){
        this.dataSource5[ind+1].editar=1;
      }
    }
    else if(event.keyCode.toString()=="38"){
      this.dataSource5[ind].editar=0;
      if(ind-1>=0){
        this.dataSource5[ind-1].editar=1;
      }
    }
  }
  quitarfilaSal(ind:any){
    let tot=Number(this.tott5);
    let parcial=Number(this.dataSource5[ind].parcial);
    let cant=Number(this.dataSource5[ind].cantidad);
    this.tott5=this.formService.redondeo(tot-parcial,this.dec_parcial);
    let ind3=this.dataSource5[ind].indice3;
    this.dataSource3aux[ind3].seleccion=0;
    let salidat3=Number(this.dataSource3aux[ind3].salida);
    this.dataSource3aux[ind3].salida=this.formService.redondeo(salidat3-cant,this.dec_cant);
    let ingresot3=Number(this.dataSource3aux[this.dataSource5[ind].indice3].ingreso);
    this.dataSource3aux[ind3].saldo=this.formService.redondeo(ingresot3-(salidat3-cant),this.dec_cant);
    if(ingresot3-(salidat3-cant)>0){
      this.dataSource3aux[this.dataSource5[ind].indice3].indicador=0;
    }
    else{
      this.dataSource3aux[this.dataSource5[ind].indice3].indicador=1;
    }
    this.dataSource3aux[this.dataSource5[ind].indice3].editado=1;
    this.dataSource5.splice(ind,1);
    this.bcambiost5=true;
    this.TotalSaldo(this.dataSource3aux);
  }
}
