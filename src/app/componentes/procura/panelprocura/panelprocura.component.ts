import { ChangeDetectorRef, Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
@Component({
  selector: 'app-panelprocura',
  templateUrl: './panelprocura.component.html',
  styleUrls: ['./panelprocura.component.scss']
})
export class PanelprocuraComponent implements OnInit {
  mostrar_carga=false;
  mostrar_carga_todo=false;
  subvista=1
  nomproy=''
  paddingscroll = 17;
  paddingscroll2 = 17;
  preventscroll=false;
  scrollbut=false;

  id_proyecto
  id_userproy
  tipoProy
  colores
  decima
  solover
  simbolo

  @Input() set tabproyecto(value: any) {
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = (value.get('aspectos_generales') as FormGroup)
    const datosproy = (aspectosGen.get('datos_proyecto') as FormGroup)
    const datosrec = (aspectosGen.get('datos_recuperado') as FormGroup)
    this.id_userproy=datosrec.value.id_usuario;
    this.nomproy=this.id_userproy=datosrec.value.descripcion;
    this.tipoProy=datosproy.get('id_clasificacion').value;
    this.colores=value.get('aspectab').value;
    this.decima=value.get('decimal').value;
    this.solover=value.get('solover').value;
    //this.moneda=datosproy.get('moneda').value.toString()=='0'?'S/':'$';
    this.simbolo=datosrec.value.simbolo
  }

  colorpasa:any
  decpasa:any
  dec_metrado=4;
  mask_metrado='0.4';
  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant=4;
  mask_cant='0.4';
  filareg:any

  dataSource1=[]
  fila1_sel=-1
  buscando1=false

  tit_sel_1='';
  mostrar_filaseldet1=false;
  dataSourcedet1= [];
  filadet1_sel=-1;

  datasourcemodasig=[]

  costopresu=0;
  id_reg:any;

  tot_asig1:any;
  tot_util1:any;
  promporc1:any;
  tot_asig2:any;
  tot_util2:any;
  promporc2:any;
  esSecund=false

  @ViewChild("modalmodadqui") modalmodadqui: ModalBasicComponent;
  FrmModadqui = new FormGroup({
    MaDescreg: new FormControl('', Validators.required),
    MaAsignacion: new FormControl('',Validators.required),
    MaCostodir:new FormControl('',Validators.required),
    MaCosotind:new FormControl('',Validators.required)
  });
  get fMaDescreg(): FormControl { return this.FrmModadqui.get('MaDescreg') as FormControl }
  get fMaAsignacion(): FormControl { return this.FrmModadqui.get('MaAsignacion') as FormControl }
  get fMaCostodir(): FormControl { return this.FrmModadqui.get('MaCostodir') as FormControl }
  get fMaCosotind(): FormControl { return this.FrmModadqui.get('MaCosotind') as FormControl }

  @ViewChild("modalprogadq0") modalprogadq0: ModalBasicComponent;
  FrmProgadq0 = new FormGroup({
    Descreg: new FormControl('', Validators.required),
    Asignacion:new FormControl('',Validators.required),
    Costodir:new FormControl('0.00',Validators.required),
    Cosotind:new FormControl('0.00',Validators.required),
  })
  get fdescreg(): FormControl { return this.FrmProgadq0.get('Descreg') as FormControl }
  get fasignacion(): FormControl { return this.FrmProgadq0.get('Asignacion') as FormControl }
  get fcostodir(): FormControl { return this.FrmProgadq0.get('Costodir') as FormControl }
  get fcosotind(): FormControl { return this.FrmProgadq0.get('Cosotind') as FormControl }

  @ViewChild("modalmodpreasig") modalmodpreasig: ModalBasicComponent;
  
  constructor(
    private _logisticaService:LogisticaService,
    private presuservice:PresupuestosService,
    private principalService:PrincipalService,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService,
    public formService: FormsService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.mostrar_carga=true;
    this.scrollbut=document.body.clientWidth <= 988?true:false;
    let id_user = await this.encriptadorService.recuperarlocalstory('idusuario');//deberia ser el id_usuario del creador del proyecto(usuarios secundarios)
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({id_proyecto: this.id_proyecto,id_usuario:id_user});
    if(datoaccs?.length>0){
      if(datoaccs[0].procura==0){
        this.solover=true;
      }
    } 
    //usuario principal puede cambiar a aprobado
    let uidadmin = await this.encriptadorService.recuperarlocalstory('id_admin');
    this.esSecund=id_user!=uidadmin?true:false;
    let decimales = this.decima;
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
    let res= await this.presuservice.listarTopPresupuesto({id_proyecto:this.id_proyecto});
    //para obtener el total de presupuesto para realizar las comparaciones para agregar 
    if(res){
      let presu=res[0]
      let sumtot=0;
      for(let row of presu){
        if(row.tipofila==0)
          sumtot+=Number(row.parcial)
      }
      this.costopresu=sumtot
    }
    await this.ListarAdquisiciones();
    this.mostrar_carga=false;
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    
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
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    //resize a las tablas
    this.scrollbut=document.body.clientWidth <= 988?true:false;
  }
  leftDivBut(){
    var face1 = document.getElementById('divbut');
    face1.scrollLeft+=15;
  }
  rigthDivBut(){
    var face1 = document.getElementById('divbut');
    face1.scrollLeft-=15;
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambioVista(ind:any){
    //condicionar si selecciono una fila?
    if(this.filareg){
      this.subvista=ind;
    }
    else{
      this.toaster.error('Seleccionar un Registro de Adquisicion.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
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
  cambindicesel1(ind:any){
    if (ind != this.fila1_sel){
    //   this.fila1_sel = -1;
    // else{
      this.fila1_sel = ind;
      this.filareg=this.dataSource1[ind];
      this.filareg.solover=this.solover;
      this.filareg.simbolo=this.simbolo;
      this.colorpasa=this.colores;
      this.decpasa=this.decima;
      this.tit_sel_1=this.dataSource1[this.fila1_sel].detalle;//agregar los datos de tabla det1
      this.calctabladetfila1(ind);
    }
  }
  async calctabladetfila1(ind:any){
    this.dataSourcedet1=[];
    this.id_reg=this.dataSource1[ind].id_registro;
    this.mostrar_filaseldet1=true;

    let tablares=await this._logisticaService.ListarDetPresuAdquiFila({id_proyecto:this.id_proyecto,id_registro:this.id_reg});
    if(tablares){
      this.dataSourcedet1=[];
      let suma1=0;
      let suma2=0;
      let indic=1;
      for(let j=0;j<tablares.length;j++){
        if(tablares[j].num_det=='0')
        {
          let filad={nro:indic,descripcion:tablares[j].descripcion,exptec_dir:tablares[j].parcial ,program_dir: tablares[j].parcialsol,util_dir:'',porc_dir:'',
          exptec_ind:'',program_ind:'',util_ind:'',porc_ind:''};
          this.dataSourcedet1.push(filad)
          suma1=suma1+Number(tablares[j].parcial);
          suma2=suma2+Number(tablares[j].parcialsol);
          indic++;
        }
      }
      let filad={nro:'',descripcion:'TOTAL',exptec_dir:this.formService.redondeo(suma1,this.dec_parcial) ,program_dir: this.formService.redondeo(suma2,this.dec_parcial),util_dir:'',porc_dir:'',
          exptec_ind:'',program_ind:'',util_ind:'',porc_ind:''};
      this.dataSourcedet1.push(filad)
    }
    else{
      this.dataSourcedet1=[]
    }
    this.mostrar_filaseldet1=false;
  }
  cambindiceseldet1(ind:any){
    if(ind==this.filadet1_sel)
      this.filadet1_sel=-1;
    else
      this.filadet1_sel=ind;
  }
  corregirdec(eve:any,entrada:any){
    var valor=Number(eve.target.value.replace(/\,/g,''));
    let nuevo=this.formService.redondeo(valor,this.dec_parcial);
    if(entrada==0){
      this.FrmModadqui.get('MaCostodir').setValue(nuevo);
    }
    else{
      this.FrmModadqui.get('MaCosotind').setValue(nuevo);
    }
  }
  corregirdec1(eve:any,entrada:any){
    var valor=Number(eve.target.value.replace(/\,/g,''));
    let nuevo=this.formService.redondeo(valor,this.dec_parcial);
    if(entrada==0){
      this.FrmProgadq0.get('Costodir').setValue(nuevo);
    }
    else{
      this.FrmProgadq0.get('Cosotind').setValue(nuevo);
    }
  }
  async ListarAdquisiciones(){
    this.buscando1=true;
    let res= await this._logisticaService.ListarAdquisicionesProy({id_proyecto:this.id_proyecto});
    this.buscando1=false;
    this.dataSource1=res;
    this.TotalesAdquisiciones();
  }
  TotalesAdquisiciones(){
    this.tot_asig1=0;
    this.tot_util1=0;
    this.promporc1=0;
    this.tot_asig2=0;
    this.tot_util2=0;
    this.promporc2=0;

    var tot_porcdir=0;
    var tot_porcind=0;
    var nrofilas=this.dataSource1.length;
    for(let row of this.dataSource1){
      this.tot_asig1+=Number(row.costo_dir);
      this.tot_util1+=Number(row.presut_dir);
      tot_porcdir+=Number(row.porc_dir);

      this.tot_asig2+=Number(row.costo_ind);
      this.tot_util2+=Number(row.presut_ind);
      tot_porcind+=Number(row.porc_ind);
    }
    if(nrofilas>0)
    {
      this.promporc1=this.formService.redondeo((this.tot_util1*100)/this.tot_asig1,1);//tot_porcdir/nrofilas
      this.promporc2=this.formService.redondeo((this.tot_util2*100)/this.tot_asig2,1);//tot_porcind/nrofilas
    }
  }
  //registros
  buAgregar(){
    let totalpresu=Number(this.costopresu);
    let totaluti=Number(this.tot_util1);
    let totalasig=Number(this.tot_asig1);
    if(totalasig>=totalpresu){
      this.toaster.error('El presupesto asignado no puede ser mayor al presupuesto del proyecto.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
    else{
      if(totaluti>=totalpresu){
        this.toaster.error('Ya no hay rercursos para asignar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
      else{
        this.FrmProgadq0.reset();//revisar que limpia todos los campos
        this.fcostodir.setValue(this.formService.redondeo(0,this.dec_parcial))
        this.fcosotind.setValue(this.formService.redondeo(0,this.dec_parcial))
        this.modalprogadq0.show();
      }
    }
  }
  buEditarAdqui(){
    if(this.fila1_sel>=0)
    {
      this.id_reg=this.dataSource1[this.fila1_sel].id_registro;
      this.fMaDescreg.setValue(this.dataSource1[this.fila1_sel].detalle)
      this.fMaAsignacion.setValue(this.dataSource1[this.fila1_sel].asignacion)
      let cosdir=this.formService.redondeo(this.dataSource1[this.fila1_sel].costo_dir,this.dec_parcial);
      this.fMaCostodir.setValue(cosdir)
      let cosind=this.formService.redondeo(this.dataSource1[this.fila1_sel].costo_ind,this.dec_parcial);
      this.fMaCosotind.setValue(cosind)
      this.modalmodadqui.show();
    }
    else{
      this.toaster.error('Seleccione una fila para editar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  async buEliminar(){
    if(this.fila1_sel>=0)
    {
      let valor=this.dataSource1[this.fila1_sel].estado;
      if(valor==0){
        const sw = await SwalService.confirm('Estas seguro?',null,'Una vez realizada la acción no se podra revertir los cambios!');
        if (sw.isConfirmed) {
          var id_reg=this.dataSource1[this.fila1_sel].id_registro;
          let res=await this._logisticaService.EliminarAdquisicionProy({id_proyecto:this.id_proyecto,id_registro:id_reg});
          if(res[0].id=="1")
            SwalService.success('Correcto', res[0].mensaje)
          else
            SwalService.error('Advertencia', res[0].mensaje);
          this.ListarAdquisiciones();
        }
      }
      else{
        this.toaster.error('No se puede eliminar si su estado es "DEFINITIVO".', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else{
      this.toaster.error('Seleccione una fila para eliminar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  cerrarModalmodadqui(){
    this.id_reg='';
    this.modalmodadqui.hide();
  }
  async Modificaradqui(){
    if(!this.FrmModadqui.invalid)
    {
      this.mostrar_carga_todo=true;
      var asigna=this.fMaAsignacion.value;
      var costodi=this.fMaCostodir.value;
      var costoin=this.fMaCosotind.value;
      let res=await this._logisticaService.ModificarAdquisicion({id_proyecto:this.id_proyecto,id_registro:this.id_reg,asignacion:asigna,costodir:costodi,costoind:costoin});
      if(res[0].id=="1")
        SwalService.success('Correcto',res.mensaje)
      else
        SwalService.error('Advertencia','Ocurrio una excepcion al momento de guardar.');
  
      this.ListarAdquisiciones();
      this.mostrar_carga_todo=false;
      this.modalmodadqui.hide();
    }
    else
    {
      this.FrmModadqui.markAllAsTouched();
      this.toaster.error('Debe llenar los campos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  cerrarModalProgAdq0(){
    this.modalprogadq0.hide();
  }
  async GuardarModalProgAdq0(){
    if(!this.FrmProgadq0.invalid)
    {
      let idcamb='';
      let mensaj='Una vez realizada la acción no se podra revertir los cambios!';
      if(this.dataSource1.length>0){
        mensaj=this.dataSource1[this.dataSource1.length-1].estado=='0'?'El ultimo registro BORRADOR se cambiara a DEFINITIVO. Esta seguro que desea continuar?':mensaj;
        idcamb=this.dataSource1[this.dataSource1.length-1].estado=='0'?this.dataSource1[this.dataSource1.length-1].id_registro:idcamb;
      }
      //condicionar si hay registro para actualizar a definitivo, para pasar fecha  (fechasol:)
      if(idcamb!=''){
        let fechamin
        if(this.dataSource1[this.dataSource1.length-1].id_anterior){
          for(let rw1 of this.dataSource1){
            if(rw1.id_registro==this.dataSource1[this.dataSource1.length-1].id_anterior){
              fechamin=rw1.fechadef
            }
          }
        }
        const {value:date} = await SwalService.confirmDate('Estas seguro?',null,
        mensaj+'<br>Seleccione la fecha de Confirmación:',fechamin);
        if(date){
          this.mostrar_carga_todo=true;
          var detalle=this.FrmProgadq0.get('Descreg').value;
          var asignacion=this.FrmProgadq0.get('Asignacion').value;
          var costodir=this.FrmProgadq0.get('Costodir').value=="" || this.FrmProgadq0.get('Costodir').value==null?"0":this.FrmProgadq0.get('Costodir').value;
          var costoind=this.FrmProgadq0.get('Cosotind').value=="" || this.FrmProgadq0.get('Cosotind').value==null?"0":this.FrmProgadq0.get('Cosotind').value;
          let idreg=0;
          for(let row of this.dataSource1){
            if(idreg<Number(row.id_registro))
              idreg=Number(row.id_registro);
          }
          let res=await this._logisticaService.GuardarAdquisicionProy({id_proyecto:this.id_proyecto,id_registro:idreg+1,detalle:detalle,asignacion:asignacion,costodir:costodir,costoind:costoind,idcamb:idcamb,fechasol:date});
          if(res.length>0)
            SwalService.success('Correcto',res.mensaje)
          else
            SwalService.error('Advertencia','Ocurrio una excepcion al momento de guardar.');
          this.cerrarModalProgAdq0();
          this.ListarAdquisiciones();
          this.mostrar_carga_todo=false;
        }
        else if(date==''){
          this.toaster.error('Seleccione una fecha valida para Continuar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        const sw = await SwalService.confirm('Estas seguro?',null,mensaj);
        if (sw.isConfirmed) {
          //confirmar
          this.mostrar_carga_todo=true;
          var detalle=this.FrmProgadq0.get('Descreg').value;
          var asignacion=this.FrmProgadq0.get('Asignacion').value;
          var costodir=this.FrmProgadq0.get('Costodir').value=="" || this.FrmProgadq0.get('Costodir').value==null?"0":this.FrmProgadq0.get('Costodir').value;
          var costoind=this.FrmProgadq0.get('Cosotind').value=="" || this.FrmProgadq0.get('Cosotind').value==null?"0":this.FrmProgadq0.get('Cosotind').value;
          let idreg=0;
          for(let row of this.dataSource1){
            if(idreg<Number(row.id_registro))
              idreg=Number(row.id_registro);
          }
          let res=await this._logisticaService.GuardarAdquisicionProy({id_proyecto:this.id_proyecto,id_registro:idreg+1,detalle:detalle,asignacion:asignacion,costodir:costodir,costoind:costoind,idcamb:idcamb});
          this.mostrar_carga_todo=false;
          if(res.length>0)
            SwalService.success('Correcto',res.mensaje)
          else
            SwalService.error('Advertencia','Ocurrio una excepcion al momento de guardar.');
          this.cerrarModalProgAdq0();
          this.ListarAdquisiciones();
        }
      }
    }
    else
    {
      this.FrmProgadq0.markAllAsTouched();
      this.toaster.error('Debe llenar los campos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  tot_montoasig:any;
  totant_montoasig:any;
  async editarpreasig(row:any){
    this.mostrar_carga_todo=true;
    this.tot_montoasig=this.formService.redondeo(row.costo_dir,this.dec_parcial);
    this.totant_montoasig=row.costo_dir;
    this.id_reg=row.id_registro;

    let res=await this._logisticaService.ListarDetallePresasig({id_proyecto:this.id_proyecto,id_registro:this.id_reg});
    if(res?.length>0){
      this.datasourcemodasig=res;
      this.mostrar_carga_todo=false;
      this.modalmodpreasig.show();
    }
    else{
      let filad={id_proyecto:this.id_proyecto,id_registro:1,id_tipo_insumo:1,nro:1,descripcion:"MANO DE OBRA",monto:this.formService.redondeo(0,this.dec_parcial)};
      let filad1={id_proyecto:this.id_proyecto,id_registro:2,id_tipo_insumo:2,nro:2,descripcion:"MATERIALES",monto:this.formService.redondeo(0,this.dec_parcial)};
      let filad2={id_proyecto:this.id_proyecto,id_registro:3,id_tipo_insumo:3,nro:3,descripcion:"EQUIPO",monto:this.formService.redondeo(0,this.dec_parcial)};
      let filad3={id_proyecto:this.id_proyecto,id_registro:4,id_tipo_insumo:4,nro:4,descripcion:"SUB CONTRATOS",monto:this.formService.redondeo(0,this.dec_parcial)};
      this.datasourcemodasig.push(filad)
      this.datasourcemodasig.push(filad1)
      this.datasourcemodasig.push(filad2)
      this.datasourcemodasig.push(filad3)

      this.modalmodpreasig.show();
      this.mostrar_carga_todo=false;
    }
  }
  cerrarModalmodpreasig(){
    this.datasourcemodasig=[];
    this.tot_montoasig="";
    this.totant_montoasig="";
    this.id_reg="";
    this.modalmodpreasig.hide();
  }
  async GuardarModalmodpreasig(){
    let totalpresu=Number(this.costopresu);
    let totalasig=Number(this.tot_asig1);
    let monantasig=Number(this.totant_montoasig);
    let monactasig=Number(this.tot_montoasig.replace(/\,/g,''));
    let nuevototasig=totalasig-monantasig+monactasig;
    if(nuevototasig>=totalpresu){
      let difer=this.formService.redondeo(nuevototasig-totalpresu,2);
      this.toaster.error('El presupesto asignado es mayor al presupuesto del proyecto en '+difer, 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
    else{
      this.mostrar_carga_todo=true;
      const datos1 = JSON.stringify(this.datasourcemodasig);
      let resp=await this._logisticaService.GuardarDetallePreasig({id_proyecto:this.id_proyecto,id_registro:this.id_reg,total:this.tot_montoasig,datos1:datos1});
      this.mostrar_carga_todo=false;
      if(resp.id==1)
        SwalService.success('Correcto',resp.mensaje)
      else
        SwalService.error('Advertencia','Ocurrio una excepcion al momento de guardar.');
      this.cerrarModalmodpreasig();
      this.ListarAdquisiciones();
    }
  }
  caneditarmodasig1(eve:any,row:any){
    var valor=Number(eve.target.value.replace(/\,/g,''));
    let nuevo=this.formService.redondeo(valor,this.dec_parcial);
    row.monto=nuevo.replace(/\d(?=(\d{3})+\.)/g, '$&,');
    this.calculartotalpreasig();
  }
  presenter1(event:any){
    if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
  }
  caneditarmodasig2(eve:any){
    var valor=Number(eve.target.value.replace(/\,/g,''));
    let nuevo=this.formService.redondeo(valor,this.dec_parcial);
    this.tot_montoasig=nuevo.replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
  presenter2(event:any){
    if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
  }
  calculartotalpreasig(){
    let suma=0;
    for(let i=0;i<this.datasourcemodasig.length;i++){
      let valfil=Number(this.datasourcemodasig[i].monto.replace(/\,/g,''));
      suma=suma+valfil;
    }
    this.tot_montoasig=this.formService.redondeo(suma,this.dec_parcial).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
  EditarAdqDir(row:any,ind:any){
    if(row){
      this.fila1_sel=ind
      this.filareg=row;
      this.filareg.solover=this.solover;
      this.filareg.simbolo=this.simbolo;
      this.colorpasa=this.colores;
      this.decpasa=this.decima;
      this.subvista=3;
    }
  }
  ListarExterno(val:any){
    if(val==1){
      this.ListarAdquisiciones();
    }
  }
  async cambiarmodo1(row:any,caso:any){//caso 0:Cambio de borrador, asigna fecha ,1:cambio de Verificar no asigna fecha
    if(caso==0){
      let fechamin
      if(row.id_anterior){
        for(let rw1 of this.dataSource1){
          if(rw1.id_registro==row.id_anterior){
            fechamin=rw1.fechadef
          }
        }
      }
      const {value:date} = await SwalService.confirmDate('Estas seguro?',null,
      'Una vez realizada la acción cambiara a MODO DEFINITIVO, ya no podra editar el Presupuesto Solicitado!<br>Seleccione la fecha de Confirmación:',fechamin);
      if(date){
        this.mostrar_carga=true;
        let resp=await this._logisticaService.ActualizarEstAdqui({id_proyecto:this.id_proyecto,id_registro:row.id_registro,fechasol:date});
        this.fila1_sel=-1
        this.filareg=null
        this.mostrar_carga=false;
        if(resp){
          if(resp[0].id=="1"){
            SwalService.success('Correcto', resp[0].mensaje)
          }
          else{
            SwalService.error('Advertencia', resp[0].mensaje);
          }
        }
        else{
          SwalService.error('Advertencia', 'No se pudo realizar la operación');
        }
        await this.ListarAdquisiciones();
        this.mostrar_carga=false;
      }
      else if(date==''){
        this.toaster.error('Seleccione una fecha valida para Continuar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else{
      const sw = await SwalService.confirm('Estas seguro?',null,'Una vez realizada la acción cambiara a MODO DEFINITIVO, ya no podra editar el Presupuesto Solicitado!');
      if (sw.isConfirmed) {
        this.mostrar_carga=true;
        let resp=await this._logisticaService.ActualizarEstAdqui({id_proyecto:this.id_proyecto,id_registro:row.id_registro});
        this.fila1_sel=-1
        this.filareg=null
        this.mostrar_carga=false;
        if(resp){
          if(resp[0].id=="1"){
            SwalService.success('Correcto', resp[0].mensaje)
          }
          else{
            SwalService.error('Advertencia', resp[0].mensaje);
          }
        }
        else{
          SwalService.error('Advertencia', 'No se pudo realizar la operación');
        }
        await this.ListarAdquisiciones();
        this.mostrar_carga=false;
      }
    }
  }
}
