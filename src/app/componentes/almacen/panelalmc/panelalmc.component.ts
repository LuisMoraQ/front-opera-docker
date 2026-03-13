import { Component, OnInit, Input, ViewChild,HostListener } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import * as moment from 'moment';
import { SwalService } from 'src/app/servicios/swal.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { PrincipalService } from 'src/app/servicios/principal.service';

@Component({
  selector: 'app-panelalmc',
  templateUrl: './panelalmc.component.html',
  styleUrls: ['./panelalmc.component.scss']
})
export class PanelalmcComponent implements OnInit {
  mostrar_carga=false;
  mostrar_carga_todo=false;
  subvista=1
  nomproy=''
  scrollbut=false;

  id_proyecto
  id_userproy
  tipoProy
  colores
  decima
  solover
  simbolo
  fechaac:any;
  datospro
  @Input() set tabproyecto(value: any) {
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = (value.get('aspectos_generales') as FormGroup)
    const datosproy = (aspectosGen.get('datos_proyecto') as FormGroup)
    const datosrec = (aspectosGen.get('datos_recuperado') as FormGroup)
    this.id_userproy=datosrec.value.id_usuario;
    this.datospro=datosrec.value;
    this.nomproy=this.id_userproy=datosrec.value.descripcion;
    this.tipoProy=datosproy.get('id_clasificacion').value;
    this.colores=value.get('aspectab').value;
    this.decima=value.get('decimal').value;
    this.solover=value.get('solover').value;
    //this.moneda=datosproy.get('moneda').value.toString()=='0'?'S/':'$';
    this.simbolo=datosrec.value.simbolo
  }

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
  esSecund=false

  @ViewChild("modalagre0") modalagre0: ModalBasicComponent;
  FrmAgre0 = new FormGroup({
    Detalle: new FormControl('', Validators.required),
    Fechaini:new FormControl('',Validators.required),
    Fechafin:new FormControl('',Validators.required),
  })
  get detalle0(): FormControl { return this.FrmAgre0.get('Detalle') as FormControl }
  get Fechaini0(): FormControl { return this.FrmAgre0.get('Fechaini') as FormControl }
  get Fechafin0(): FormControl { return this.FrmAgre0.get('Fechafin') as FormControl }

  constructor(
    private _logisticaService:LogisticaService,
    private _EncriptadorService:EncriptadorService,
    private principalService:PrincipalService,
    public formService: FormsService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    this.scrollbut=document.body.clientWidth <= 1030?true:false;
    let id_user = await this._EncriptadorService.recuperarlocalstory('idusuario');
    const datoaccs = await this.principalService.ConfgsAsignaUserProy({id_proyecto: this.id_proyecto,id_usuario:id_user});
    if(datoaccs?.length>0){//accesos para usuarios secundarios
      if(datoaccs[0].movalmc==0){
        this.solover=true;
      }
    }
    //usuario principal puede cambiar a aprobado
    let uidadmin = await this._EncriptadorService.recuperarlocalstory('id_admin');
    this.esSecund=id_user!=uidadmin?true:false;
    //listar y otras funciones
    let resfec = await this._EncriptadorService.FechaActualBack();
    if (resfec.id == 1) {
      this.fechaac = new Date(resfec.mensaje);
    }
    else{
      this.fechaac=new Date();
    }
    await this.Listar1();
  }
  @HostListener('window:resize', ['$event'])
    onResize(event) {
      //resize a las tablas
      this.scrollbut=document.body.clientWidth <= 1030?true:false;
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
      this.toaster.error('Seleccionar un Registro de Movimientos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  async Listar1(){
    this.buscando1=true;
    let res= await this._logisticaService.ListarMovalmcobra({id_proyecto:this.id_proyecto});
    this.dataSource1=res
    let suma1=0;
    let suma2=0;
    let suma3=0;
    for(let i=0;i<res.length;i++){
        let resaldo=Number(res[i].ingreso)-Number(res[i].salida);
        /* filaad={cui:res[i].cui,version:res[i].version,detalle:res[i].detalle,estado:res[i].estado,fecha:res[i].fecha,fechaini:res[i].fechaini,fechafin:res[i].fechafin,
          ingreso:res[i].ingreso,salida:res[i].salida,tipo:res[i].tipo,nro:'',saldo:this.formService.redondeo(resaldo,this.dec_parcial),porcsaldo:'',icomost:0,mostrar:1,idsiguiente:res[i].idsiguiente,id_reg:res[i].id_reg}; */
        res[i].saldo=this.formService.redondeo(resaldo,this.dec_parcial)
        res[i].porcsaldo=0
        res[i].icomost=0
        res[i].mostrar=1
        suma1+=Number(res[i].ingreso);
        suma2+=Number(res[i].salida);
        suma3+=Number(res[i].saldo)
    }
    for(let row1 of res){
      if(Number(row1.saldo)!=0){
        let porcp=(Number(row1.saldo)*100)/row1.ingreso;
        row1.porcsaldo=this.formService.redondeo(porcp,1);
      }
    }
    this.buscando1=false;
  }
  cambindicesel1(ind:any){
    if (ind != this.fila1_sel){
    //   this.fila1_sel = -1;
    // else{
      this.fila1_sel = ind;
      if(this.dataSource1[ind].nro){
        this.filareg=null;
      }
      else{
        this.filareg=this.dataSource1[ind];
        this.filareg.solover=this.solover;
        this.filareg.simbolo=this.simbolo;
        this.decpasa=this.decima;
      }
    }
  }
  toggleOn(sele:any){
    for(let row of this.dataSource1){
      if(row.tipo==sele)
      {
        if(row.idregmov!=null)
        {
          row.mostrar="1";
        }
        else
          row.icomost=1;
      }
    }
  }
  toggleOff(sele:any){
    for(let row of this.dataSource1){
      if(row.tipo==sele)
      {
        if(row.idregmov!=null)
        {
          row.mostrar="0";
        }
        else
          row.icomost=0;
      }
    }
  }
  buAgregar(){
    const primerDia = new Date(this.fechaac.getFullYear(), this.fechaac.getMonth() , 1)
    const ultimoDia = new Date(this.fechaac.getFullYear(), this.fechaac.getMonth() + 1, 0)
    var fecha1=moment(primerDia).format('YYYY-MM-DD');//this.datePipe.transform(primerDia, "yyyy-MM-dd");
    var fecha2=moment(ultimoDia).format('YYYY-MM-DD');//this.datePipe.transform(ultimoDia, "yyyy-MM-dd");
    this.detalle0.setValue('')
    this.Fechaini0.setValue(fecha1)
    this.Fechafin0.setValue(fecha2)
    this.modalagre0.show();
  }
  cambiofecha1(){
    let fecha1=this.FrmAgre0.get("Fechaini").value;
    let fecha2=this.FrmAgre0.get("Fechafin").value;
    if(fecha2!=''){
      let fechaform1=new Date(fecha1);
      let fechaform2=new Date(fecha2);
      if(fechaform1>fechaform2)
      {
        this.toaster.error('La Fecha inicial no puede ser mayor a la fecha final.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
  }
  cambiofecha2(){
    let fecha1=this.FrmAgre0.get("Fechaini").value;
    let fecha2=this.FrmAgre0.get("Fechafin").value;
    if(fecha1!=''){
      let fechaform1=new Date(fecha1);
      let fechaform2=new Date(fecha2);
      if(fechaform1>fechaform2)
      {
        this.toaster.error('La Fecha inicial no puede ser mayor a la fecha final.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
  }
  cerrarModalAgre0(){
    this.modalagre0.hide();
  }
  async GuardarModalAgre0(){
    if(!this.FrmAgre0.invalid)
    {
      let fecha1=this.Fechaini0.value;
      let fecha2=this.Fechafin0.value;
      if(fecha1!='' && fecha2!=''){
        let fechaform1=new Date(fecha1);
        let fechaform2=new Date(fecha2);
        if(fechaform1>fechaform2)
        {
          this.toaster.error('La Fecha inicial no puede ser mayor a la fecha final.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
        else{
          const sw = await SwalService.confirm('Estas seguro?',null,'Una vez realizada la acción no se podra revertir los cambios!');
          if (sw.isConfirmed) {
            this.mostrar_carga_todo=true;
            //confirmar
            var detalle=this.detalle0.value;
            let idant='';
            let idgru='';
            for(let a=0;a<this.dataSource1.length;a++){
              if(this.dataSource1[a].idregmov==null){
                idgru=this.dataSource1[a].nro;
              }else{
                idant=this.dataSource1[a].idregmov;
              }
            }
            let idreg=0;
            for(let row of this.dataSource1){
              if(idreg<Number(row.idregmov))
                idreg=Number(row.idregmov);
            }
            let res=await this._logisticaService.GuardarMovalmcobra({id_proyecto:this.id_proyecto,idregmov:idreg+1,detalle:detalle,estado:0,fecha:'',fechaini:fecha1,fechafin:fecha2,
              ingreso:'',salida:'',idant:idant });
            await this.Listar1();
            this.cerrarModalAgre0();
            this.mostrar_carga_todo=false;
            if(res.length>0)
            {
              if(res[0].id=="1"){
                SwalService.success('Correcto', res[0].mensaje)
              }
              else{
                SwalService.error('Advertencia', res[0].mensaje);
              }
            }
            else
            {
              SwalService.error('Advertencia',"Ocurrio una excepcion al momento de guardar.");
            }
          }
        }
      }
    }
    else
    {
      this.FrmAgre0.markAllAsTouched();
      this.toaster.error('Debe llenar los campos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  async Eliminar1(row:any){
    if(row.idsiguiente==''){
      const sw = await SwalService.confirm('Estas seguro?',null,'Una vez realizada la acción no se podra revertir los cambios!');
      if (sw.isConfirmed) {
        this.mostrar_carga_todo=true;
        let res=await this._logisticaService.EliminarMovalmcobra({id_proyecto:this.id_proyecto,idregmov:row.idregmov});
        await this.Listar1();
        this.fila1_sel=-1
        this.mostrar_carga_todo=false;
        if(res.length>0)
        {
          if(res[0].id=="1"){
            SwalService.success('Correcto', res[0].mensaje)
          }
          else{
            SwalService.error('Advertencia', res[0].mensaje);
          }
        }
        else
        {
          SwalService.error('Advertencia',"Ocurrio una excepcion al momento de guardar.");
        }
        
      }
    }
    else{
      this.toaster.error('Solo se puede eliminar el ultimo registro.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  Editar1(row:any,ind:any){
    if(row){
      this.fila1_sel=ind
      this.filareg=row;
      this.filareg.solover=this.solover;
      this.filareg.simbolo=this.simbolo;
      //this.colorpasa=this.colores;
      this.decpasa=this.decima;
      this.subvista=2;
    }
  }
  ListarExterno(val:any){
    if(val==1){
      this.Listar1();
    }
  }
  async cambiarmodo1(row:any,caso:any){//caso 0:Cambio de borrador, asigna fecha ,1:cambio de Verificar no asigna fecha
    if(caso==0){
      const sw = await SwalService.confirm('Estas seguro?', 'Una vez realizada la acción cambiara a MODO APROBADO, ya no podra editar los registros!')
      if (sw.isConfirmed) {
        this.mostrar_carga=true;
        let resp=await this._logisticaService.ActEstadoMovAlmcReg({id_proyecto:this.id_proyecto,idregmov:row.idregmov});
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
        await this.Listar1();
        this.mostrar_carga=false;
      }
    }
    else{
      const sw = await SwalService.confirm('Estas seguro?',null,'Una vez realizada la acción cambiara a MODO APROBADO, ya no podra editar los registros!');
      if (sw.isConfirmed) {
        this.mostrar_carga=true;
        let resp=await this._logisticaService.ActEstadoMovAlmcReg({id_proyecto:this.id_proyecto,idregmov:row.idregmov});
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
        await this.Listar1();
        this.mostrar_carga=false;
      }
    }
  }
}
