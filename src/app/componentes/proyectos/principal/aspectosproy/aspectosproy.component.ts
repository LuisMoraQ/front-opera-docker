import { Component, OnInit,ViewEncapsulation,Input } from '@angular/core';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalferiadoComponent } from './modalferiado/modalferiado.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
@Component({
  selector: 'app-aspectosproy',
  templateUrl: './aspectosproy.component.html',
  styleUrls: ['./aspectosproy.component.scss'],
})
export class AspectosproyComponent implements OnInit {
  mostrar_carga_todo=false;
  mostrar_carga=false;

  id_proyecto='';
  hoy=new Date();
  detallesproy:any;
  aspectosdias:any;
  feriados:any;

  horasdescanso:any;
  horaslabo:any

  @Input() set tabproyecto(value: any) {
    this.id_proyecto = value;
  }
  diassemana=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  tabla1=[{desc:'Hora Ingreso',lun:'',mar:'',mie:'',jue:'',vie:'',sab:'',dom:''},{desc:'Hora Salida',lun:'',mar:'',mie:'',jue:'',vie:'',sab:'',dom:''}];
  tabla2=[{desc:'Hora de Salida Descanso',lun:'',mar:'',mie:'',jue:'',vie:'',sab:'',dom:''},{desc:'Hora de Ingreso Descanso',lun:'',mar:'',mie:'',jue:'',vie:'',sab:'',dom:''}];

  tablaferiados=[];

  Diasnolav = new UntypedFormGroup({
    Inicio: new UntypedFormControl(''),
    Nolab1: new UntypedFormControl(''),
    Nolab2: new UntypedFormControl(''),
  })

  get inicio(): UntypedFormControl { return this.Diasnolav.get('Inicio') as UntypedFormControl }
  get nolab1(): UntypedFormControl { return this.Diasnolav.get('Nolab1') as UntypedFormControl }
  get nolab2(): UntypedFormControl { return this.Diasnolav.get('Nolab2') as UntypedFormControl }

  constructor(
    private principalService:PrincipalService,
    private modalService: NgbModal,
  ) { }

  async ngOnInit() {
    try{
      this.mostrar_carga=true;
      this.detallesproy = await this.principalService.recuperarDatosProyecto({id_proyecto:this.id_proyecto})
      this.cargarDatos();
    }catch(e){
      this.mostrar_carga=false;
      console.log(e)
      SwalService.error('Advertencia','No se pudo cargar los datos.')
    }
  }
  async cargarDatos(){
    let resulta = await this.principalService.ListarAspectosDiasProy({id_proyecto:this.id_proyecto})
    if(resulta.length>0){
      this.aspectosdias=resulta[0];
      this.tablaferiados=resulta[1];
      this.inicio.setValue(this.aspectosdias[0]?.inicioSemana!=null?this.aspectosdias[0].inicioSemana:'');
      this.nolab1.setValue(this.aspectosdias[0]?.nolabo1!=null?this.aspectosdias[0].nolabo1:'');
      this.nolab2.setValue(this.aspectosdias[0]?.nolabo2!=null?this.aspectosdias[0].nolabo2:'');
      let horasing=this.aspectosdias[0]?.horaIngreso!=null?this.aspectosdias[0].horaIngreso.split('|'):[];
      let horassal=this.aspectosdias[0]?.horaSalida!=null? this.aspectosdias[0].horaSalida.split('|'):[];
      let descing=this.aspectosdias[0]?.descansoIng!=null? this.aspectosdias[0].descansoIng.split('|'):[];
      let descsal=this.aspectosdias[0]?.descansoSal!=null? this.aspectosdias[0].descansoSal.split('|'):[];

      if(horasing.length>0){
        this.tabla1[0].lun=horasing[0];
        this.tabla1[0].mar=horasing[1];
        this.tabla1[0].mie=horasing[2];
        this.tabla1[0].jue=horasing[3];
        this.tabla1[0].vie=horasing[4];
        this.tabla1[0].sab=horasing[5];
        this.tabla1[0].dom=horasing[6];
      }
      if(horassal.length>0){
        this.tabla1[1].lun=horassal[0];
        this.tabla1[1].mar=horassal[1];
        this.tabla1[1].mie=horassal[2];
        this.tabla1[1].jue=horassal[3];
        this.tabla1[1].vie=horassal[4];
        this.tabla1[1].sab=horassal[5];
        this.tabla1[1].dom=horassal[6];
      }
      if(descing.length>0){
        this.tabla2[0].lun=descing[0];
        this.tabla2[0].mar=descing[1];
        this.tabla2[0].mie=descing[2];
        this.tabla2[0].jue=descing[3];
        this.tabla2[0].vie=descing[4];
        this.tabla2[0].sab=descing[5];
        this.tabla2[0].dom=descing[6];
      }
      if(descsal.length>0){
        this.tabla2[1].lun=descsal[0];
        this.tabla2[1].mar=descsal[1];
        this.tabla2[1].mie=descsal[2];
        this.tabla2[1].jue=descsal[3];
        this.tabla2[1].vie=descsal[4];
        this.tabla2[1].sab=descsal[5];
        this.tabla2[1].dom=descsal[6];
      }
    }
    this.mostrar_carga=false;
  }
  cambio(event,fila,columna){
    switch (columna) {
      case 0: this.tabla1[fila].lun=event.target.value; this.calcularTothoras(); break;
      case 1: this.tabla1[fila].mar=event.target.value; this.calcularTothoras(); break;
      case 2: this.tabla1[fila].mie=event.target.value; this.calcularTothoras(); break;
      case 3: this.tabla1[fila].jue=event.target.value; this.calcularTothoras(); break;
      case 4: this.tabla1[fila].vie=event.target.value; this.calcularTothoras(); break;
      case 5: this.tabla1[fila].sab=event.target.value; this.calcularTothoras(); break;
      case 6: this.tabla1[fila].dom=event.target.value; this.calcularTothoras(); break;
      default: break;
    }
  }
  cambio2(event,fila,columna){
    switch (columna) {
      case 0: this.tabla2[fila].lun=event.target.value; this.calcularTothoras(); break;
      case 1: this.tabla2[fila].mar=event.target.value; this.calcularTothoras(); break;
      case 2: this.tabla2[fila].mie=event.target.value; this.calcularTothoras(); break;
      case 3: this.tabla2[fila].jue=event.target.value; this.calcularTothoras(); break;
      case 4: this.tabla2[fila].vie=event.target.value; this.calcularTothoras(); break;
      case 5: this.tabla2[fila].sab=event.target.value; this.calcularTothoras(); break;
      case 6: this.tabla2[fila].dom=event.target.value; this.calcularTothoras(); break;
      default: break;
    }
  }
  async GuardarJornada(){
    try {
      this.mostrar_carga_todo=true;
      let horasing=this.tabla1[0].lun+'|'+this.tabla1[0].mar+'|'+this.tabla1[0].mie+'|'+this.tabla1[0].jue+'|'+this.tabla1[0].vie+'|'+this.tabla1[0].sab+'|'+this.tabla1[0].dom;
      let horassal=this.tabla1[1].lun+'|'+this.tabla1[1].mar+'|'+this.tabla1[1].mie+'|'+this.tabla1[1].jue+'|'+this.tabla1[1].vie+'|'+this.tabla1[1].sab+'|'+this.tabla1[1].dom;
      let descing=this.tabla2[0].lun+'|'+this.tabla2[0].mar+'|'+this.tabla2[0].mie+'|'+this.tabla2[0].jue+'|'+this.tabla2[0].vie+'|'+this.tabla2[0].sab+'|'+this.tabla2[0].dom;
      let descsal=this.tabla2[1].lun+'|'+this.tabla2[1].mar+'|'+this.tabla2[1].mie+'|'+this.tabla2[1].jue+'|'+this.tabla2[1].vie+'|'+this.tabla2[1].sab+'|'+this.tabla2[1].dom;
      const input = {
        id_proyecto: this.id_proyecto,
        inicioSemana: this.inicio.value,
        nolabo1:this.nolab1.value,
        nolabo2:this.nolab2.value,
        horaIngreso:horasing,
        horaSalida:horassal,
        descansoIng:descing,
        descansoSal:descsal
      }
      let res = await this.principalService.GuardarAspectosDiasProy(input);
      this.mostrar_carga_todo=false;
      if(res.length>0){
        if(res[0].id=='1'){
          await SwalService.success('Exitoso',res[0].mensaje);
        }
        else{
          await SwalService.error('Advertencia','No se pudo realizar la operación.');
        }
      }
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error()
    }
  }
  async abrirmodal(datos=null,editar=false){
    try{
      this.mostrar_carga_todo = true
      const modalRef = this.modalService.open(ModalferiadoComponent, {
        size: 'md',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false//no cerrar el modal con ESC
      })
      modalRef.componentInstance.editar = editar
      modalRef.componentInstance.datos = datos
      modalRef.componentInstance.id_proyecto = this.id_proyecto
      modalRef.componentInstance.nro = datos?.nro

      this.mostrar_carga_todo = false
      const result = await modalRef.result
      if (result) {
        /* SwalService.success() */
        this.cargarDatos()
      }
    }
    catch(e){
      this.mostrar_carga_todo=false;
      if(e!=(1 || 0)){
        SwalService.error('Advertencia','No se pudo cargar los datos.')
      }
      console.log('error',e)
    }
  }
  async eliminarfila(row){
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminara el feriado seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const respuesta = await this.principalService.EliminarFeriadosDiasProy({id_proyecto: row.id_proyecto,nro:row.nro});
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == "0") {
          SwalService.error('Advertencia', respuesta[0].mensaje);
        }
        else {
          SwalService.success('Correcto',respuesta[0].mensaje)
          await this.cargarDatos()
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  calcularTothoras(){
    let suma1=0;
    let suma2=0;
    if(this.tabla2.length==2){
      if(this.tabla2[0].lun!='' && this.tabla2[1].lun!=''){
        var a = new Date("February 12, 2014 "+this.tabla2[0].lun+":00");
        var b = new Date("February 12, 2014 "+this.tabla2[1].lun+":00");
        suma2=suma2+this.restahoras(a,b);
      }
      
      if(this.tabla2[0].mar!='' && this.tabla2[1].mar!=''){
        var a = new Date("February 12, 2014 "+this.tabla2[0].mar+":00");
        var b = new Date("February 12, 2014 "+this.tabla2[1].mar+":00");
        suma2=suma2+this.restahoras(a,b);
      }

      if(this.tabla2[0].mie!='' && this.tabla2[1].mie!=''){
        var a = new Date("February 12, 2014 "+this.tabla2[0].mie+":00");
        var b = new Date("February 12, 2014 "+this.tabla2[1].mie+":00");
        suma2=suma2+this.restahoras(a,b);
      }

      if(this.tabla2[0].jue!='' && this.tabla2[1].jue!=''){
        var a = new Date("February 12, 2014 "+this.tabla2[0].jue+":00");
        var b = new Date("February 12, 2014 "+this.tabla2[1].jue+":00");
        suma2=suma2+this.restahoras(a,b);
      }

      if(this.tabla2[0].vie!='' && this.tabla2[1].vie!=''){
        var a = new Date("February 12, 2014 "+this.tabla2[0].vie+":00");
        var b = new Date("February 12, 2014 "+this.tabla2[1].vie+":00");
        suma2=suma2+this.restahoras(a,b);
      }

      if(this.tabla2[0].sab!='' && this.tabla2[1].sab!=''){
        var a = new Date("February 12, 2014 "+this.tabla2[0].sab+":00");
        var b = new Date("February 12, 2014 "+this.tabla2[1].sab+":00");
        suma2=suma2+this.restahoras(a,b);
      }

      if(this.tabla2[0].dom!='' && this.tabla2[1].dom!=''){
        var a = new Date("February 12, 2014 "+this.tabla2[0].dom+":00");
        var b = new Date("February 12, 2014 "+this.tabla2[1].dom+":00");
        suma2=suma2+this.restahoras(a,b);
      }
      this.horasdescanso=this.minutesToString(suma2);
    }
    if(this.tabla1.length==2){
      if(this.tabla1[0].lun!='' && this.tabla1[1].lun!=''){
        var a = new Date("February 12, 2014 "+this.tabla1[0].lun+":00");
        var b = new Date("February 12, 2014 "+this.tabla1[1].lun+":00");
        suma1=suma1+this.restahoras(a,b);
      }

      if(this.tabla1[0].mar!='' && this.tabla1[1].mar!=''){
        var a = new Date("February 12, 2014 "+this.tabla1[0].mar+":00");
        var b = new Date("February 12, 2014 "+this.tabla1[1].mar+":00");
        suma1=suma1+this.restahoras(a,b);
      }

      if(this.tabla1[0].mie!='' && this.tabla1[1].mie!=''){
        var a = new Date("February 12, 2014 "+this.tabla1[0].mie+":00");
        var b = new Date("February 12, 2014 "+this.tabla1[1].mie+":00");
        suma1=suma1+this.restahoras(a,b);
      }

      if(this.tabla1[0].jue!='' && this.tabla1[1].jue!=''){
        var a = new Date("February 12, 2014 "+this.tabla1[0].jue+":00");
        var b = new Date("February 12, 2014 "+this.tabla1[1].jue+":00");
        suma1=suma1+this.restahoras(a,b);
      }

      if(this.tabla1[0].vie!='' && this.tabla1[1].vie!=''){
        var a = new Date("February 12, 2014 "+this.tabla1[0].vie+":00");
        var b = new Date("February 12, 2014 "+this.tabla1[1].vie+":00");
        suma1=suma1+this.restahoras(a,b);
      }
      
      if(this.tabla1[0].sab!='' && this.tabla1[1].sab!=''){
        var a = new Date("February 12, 2014 "+this.tabla1[0].sab+":00");
        var b = new Date("February 12, 2014 "+this.tabla1[1].sab+":00");
        suma1=suma1+this.restahoras(a,b);
      }

      if(this.tabla1[0].dom!='' && this.tabla1[1].dom!=''){
        var a = new Date("February 12, 2014 "+this.tabla1[0].dom+":00");
        var b = new Date("February 12, 2014 "+this.tabla1[1].dom+":00");
        suma1=suma1+this.restahoras(a,b);
      }
      this.horaslabo=this.minutesToString(suma1-suma2);
    }
  }
  restahoras(dia1,dia2){
    try{
      let fechaa=moment(dia1);
      let fechab=moment(dia2);
      return fechab.diff(fechaa, 'minutes');
      
    }
    catch(e){
      return 0;
    }
  }
  minutesToString(minutes) {
    let signo=minutes>=0?'':'-';
    let multi=minutes>=0?1:-1;
    var hour = Math.floor((multi*minutes) / 60);
    let strhour = (hour < 10)? '0' + hour : hour;
    var minute = Math.floor((multi*minutes) % 60);
    let strminute = (minute < 10)? '0' + minute : minute;
    return signo+strhour + ':' + strminute;
  }
}
