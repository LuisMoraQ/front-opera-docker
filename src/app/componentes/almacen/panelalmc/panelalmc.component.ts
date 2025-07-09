import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import * as moment from 'moment';
import { SwalService } from 'src/app/servicios/swal.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormsService } from 'src/app/servicios/forms.service';

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

  @ViewChild("modalagre0") modalagre0: ModalBasicComponent;
  FrmAgre0 = new FormGroup({
    Detalle: new FormControl('', Validators.required),
    Fechaini:new FormControl('',Validators.required),
    Fechafin:new FormControl('',Validators.required),
    Tipo:new FormControl('',Validators.required),
  })
  get detalle0(): FormControl { return this.FrmAgre0.get('Detalle') as FormControl }
  get Fechaini0(): FormControl { return this.FrmAgre0.get('Fechaini') as FormControl }
  get Fechafin0(): FormControl { return this.FrmAgre0.get('Fechafin') as FormControl }
  get Tipo0(): FormControl { return this.FrmAgre0.get('Tipo') as FormControl }

  constructor(
    private _logisticaService:LogisticaService,
    private _EncriptadorService:EncriptadorService,
    public formService: FormsService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    console.log('entra')
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
        let porcp=(Number(row1.saldo)*100)/suma3;
        row1.porcsaldo=this.formService.redondeo(porcp,1);
      }
      
    }
    this.buscando1=false;
    // let aux=[];
    // let filaad;
    // let indicegru=0;
    // let suma1=0;
    // let suma2=0;
    //valorizada
    // filaad={id_proyecto:this.id_proyecto,id_registro:null,nro:'1',detalle:'Reporte de Almacen Según el Expediente Tecnico',tipo:'1',estado:'0',fecha:'',fechaini:'',fechafin:'',ingreso:0,salida:0,idsiguiente:'',
    //   saldo:null,porcsaldo:null,icomost:1,mostrar:1};
    // aux.push(filaad);
    // for(let i=0;i<res.length;i++){
    //   if(res[i].tipo=="1"){
    //     let resaldo=Number(res[i].ingreso)-Number(res[i].salida);
    //     /* filaad={cui:res[i].cui,version:res[i].version,detalle:res[i].detalle,estado:res[i].estado,fecha:res[i].fecha,fechaini:res[i].fechaini,fechafin:res[i].fechafin,
    //       ingreso:res[i].ingreso,salida:res[i].salida,tipo:res[i].tipo,nro:'',saldo:this.formService.redondeo(resaldo,this.dec_parcial),porcsaldo:'',icomost:0,mostrar:1,idsiguiente:res[i].idsiguiente,id_reg:res[i].id_reg}; */
    //     res[i].saldo=this.formService.redondeo(resaldo,this.dec_parcial)
    //     res[i].porcsaldo=0
    //     res[i].icomost=0
    //     res[i].mostrar=1
    //     aux.push(res[i]);
    //     suma1+=Number(res[i].ingreso);
    //     suma2+=Number(res[i].salida);
    //   }
    // }
    // aux[indicegru].ingreso=this.formService.redondeo(suma1,this.dec_parcial);
    // aux[indicegru].salida=this.formService.redondeo(suma2,this.dec_parcial);
    // aux[indicegru].saldo=this.formService.redondeo(suma1-suma2,this.dec_parcial);
    // //no valorizada
    // indicegru=aux.length;
    // suma1=0;
    // suma2=0;
    // filaad={id_proyecto:this.id_proyecto,id_registro:null,nro:'2',detalle:'Reporte de Almacen Según - Mayores Metrados',tipo:'2',estado:'0',fecha:'',fechaini:'',fechafin:'',ingreso:0,salida:0,idsiguiente:'',
    // saldo:null,porcsaldo:null,icomost:1,mostrar:1};
    // aux.push(filaad);
    // for(let i=0;i<res.length;i++){
    //   if(res[i].tipo=="2"){
    //     let resaldo=Number(res[i].ingreso)-Number(res[i].salida);
    //     /* filaad={cui:res[i].cui,version:res[i].version,detalle:res[i].detalle,estado:res[i].estado,fecha:res[i].fecha,fechaini:res[i].fechaini,fechafin:res[i].fechafin,
    //       ingreso:res[i].ingreso,salida:res[i].salida,tipo:res[i].tipo,nro:'',saldo:this.formService.redondeo(resaldo,this.dec_parcial),porcsaldo:'',icomost:0,mostrar:1,idsiguiente:res[i].idsiguiente,id_reg:res[i].id_reg}; */
    //     res[i].saldo=this.formService.redondeo(resaldo,this.dec_parcial)
    //     res[i].porcsaldo=0
    //     res[i].icomost=0
    //     res[i].mostrar=1
    //     aux.push(res[i]);
    //     suma1+=Number(res[i].ingreso);
    //     suma2+=Number(res[i].salida);
    //   }
    // }
    // aux[indicegru].ingreso=this.formService.redondeo(suma1,this.dec_parcial);
    // aux[indicegru].salida=this.formService.redondeo(suma2,this.dec_parcial);
    // aux[indicegru].saldo=this.formService.redondeo(suma1-suma2,this.dec_parcial);

    // //calidad de prestamo
    // indicegru=aux.length;
    // suma1=0;
    // suma2=0;
    // filaad={id_proyecto:this.id_proyecto,id_registro:null,nro:'3',detalle:'Reporte de Almacen Según - Partidas Nuevas',tipo:'3',estado:'0',fecha:'',fechaini:'',fechafin:'',ingreso:0,salida:0,idsiguiente:'',
    // saldo:null,porcsaldo:null,icomost:1,mostrar:1};
    // aux.push(filaad);
    // for(let i=0;i<res.length;i++){
    //   if(res[i].tipo=="3"){
    //     /* filaad={cui:res[i].cui,version:res[i].version,detalle:res[i].detalle,estado:res[i].estado,fecha:res[i].fecha,fechaini:res[i].fechaini,fechafin:res[i].fechafin,
    //       ingreso:res[i].ingreso,salida:res[i].salida,tipo:res[i].tipo,nro:'',saldo:'',porcsaldo:'',icomost:0,mostrar:1,idsiguiente:res[i].idsiguiente,id_reg:res[i].id_reg}; */

    //     res[i].porcsaldo=0
    //     res[i].icomost=0
    //     res[i].mostrar=1
    //     aux.push(res[i]);
    //     suma1+=Number(res[i].ingreso);
    //     suma1+=Number(res[i].salida);
    //   }
    // }
    // aux[indicegru].ingreso=this.formService.redondeo(suma1,this.dec_parcial);
    // aux[indicegru].salida=this.formService.redondeo(suma2,this.dec_parcial);
    // aux[indicegru].saldo=this.formService.redondeo(suma1-suma2,this.dec_parcial);

    // let sumagru=0;
    // let grupose='';
    // for(let m=0;m<aux.length;m++){//revisar y tambien que pase los parametros correctos al guardar
    //   if(aux[m].fechaini==''){
    //     sumagru=Number(aux[m].ingreso);
    //     grupose=aux[m].tipo;
    //   }
    //   else{
    //     if(grupose!=''){
    //       if(aux[m].tipo==grupose){
    //         if(sumagru>0){
    //           let saldant=0;
    //           if(m>0){
    //             if(aux[m-1].fechaini!=''){
    //               saldant=Number(aux[m-1].saldo);
    //             }
    //           }
    //           let ingr=Number(aux[m].ingreso);
    //           let sali=Number(aux[m].salida);
    //           let ressal=saldant+ingr-sali;
    //           aux[m].saldo=this.formService.redondeo(ressal,this.dec_parcial);

    //           let resu=(ressal/sumagru)*100;
    //           aux[m].porcsaldo=this.formService.redondeo(resu,1);
    //         }
    //         else{
    //           aux[m].porcsaldo=this.formService.redondeo(0,1);
    //         }
    //       }
    //     }
    //   }
    // }
    // this.dataSource1=aux;
    // console.log(this.dataSource1)
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
    console.log(primerDia)
    console.log(ultimoDia)
    var fecha1=moment(primerDia).format('YYYY-MM-DD');//this.datePipe.transform(primerDia, "yyyy-MM-dd");
    var fecha2=moment(ultimoDia).format('YYYY-MM-DD');//this.datePipe.transform(ultimoDia, "yyyy-MM-dd");
    console.log(fecha1,fecha2)
    this.detalle0.setValue('')
    this.Fechaini0.setValue(fecha1)
    this.Fechafin0.setValue(fecha2)
    this.Tipo0.setValue('')
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
            var tipo=this.Tipo0.value;
            let idant='';
            let idgru='';
            for(let a=0;a<this.dataSource1.length;a++){
              if(this.dataSource1[a].tipo==tipo)
              {
                if(this.dataSource1[a].idregmov==null){
                  idgru=this.dataSource1[a].nro;
                }else{
                  idant=this.dataSource1[a].idregmov;
                }
              }
              else{
                if(idgru!=''){
                  break;
                }
              }
            }
            let idreg=0;
            for(let row of this.dataSource1){
              if(idreg<Number(row.idregmov))
                idreg=Number(row.idregmov);
            }
            let res=await this._logisticaService.GuardarMovalmcobra({id_proyecto:this.id_proyecto,idregmov:idreg+1,detalle:detalle,tipo:tipo,estado:0,fecha:'',fechaini:fecha1,fechafin:fecha2,
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
}
