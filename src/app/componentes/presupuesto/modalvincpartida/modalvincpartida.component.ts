import { Component, OnInit, Input,HostListener,ViewEncapsulation, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';
import { Subscription } from 'rxjs';
import { VariablesGlobalesService } from 'src/app/servicios/variables-globales.service';
@Component({
  selector: 'app-modalvincpartida',
  templateUrl: './modalvincpartida.component.html',
  styleUrls: ['./modalvincpartida.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalvincpartidaComponent implements OnInit,OnDestroy {
  @Input() moneda='S/';
  @Input('height') heightacu: number = 100;
  @Input() arreglo:[];
  @Input() arrind:[];
  @Input() rowpasa:any;
  @Input() fondo:any;
  @Input() color:any;
  @Input() letra:any;
  @Input() vincmayor:any;
  updatevincpart$:Subscription=new Subscription();
  tablapri=[];
  arrindpri=[];
  filaSel=-1;
  colsel=false;
  desvpri=false;
  m_igual=true;
  m_parece=true;
  verbloq=true;
  //idgruselacu=null;
  //preciototal=0;
  vinculosel=null;
  minimbut=false;

  @Input() dec_metrado=2;
  @Input() mask_metrado='0.2';
  @Input() dec_precio=2;
  @Input() mask_precio='0.2';
  @Input() dec_parcial=2;
  @Input() mask_parcial='0.2';

  formData = new UntypedFormGroup({
    itempri: new UntypedFormControl('', [Validators.required]),
    descripcionpri: new UntypedFormControl('', [Validators.required]),
    colorv: new UntypedFormControl('#f8f8f8'),
  })
  formfoot = new UntypedFormGroup({
    numporc: new UntypedFormControl(90,[Validators.min(50),Validators.max(100)])
  })
  
  get itempri(): UntypedFormControl { return this.formData.get('itempri') as UntypedFormControl }
  get descripcionpri(): UntypedFormControl { return this.formData.get('descripcionpri') as UntypedFormControl }
  get colorv(): UntypedFormControl { return this.formData.get('colorv') as UntypedFormControl }
  get numporc(): UntypedFormControl { return this.formfoot.get('numporc') as UntypedFormControl }

  constructor(
    private modal: NgbActiveModal,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService,
    private varGlobalesService: VariablesGlobalesService,
  ) { }

  ngOnInit(): void {
    let resto=320
    this.heightacu = window.innerHeight - resto;
    this.minimbut=document.body.clientWidth <= 991?true:false;
    this.tablapri=JSON.parse(JSON.stringify(this.arreglo));
    this.arrindpri=JSON.parse(JSON.stringify(this.arrind));
    if(this.vincmayor){
      this.vinculosel=this.vincmayor;
      this.itempri.setValue(this.vincmayor.item);
      this.descripcionpri.setValue(this.vincmayor.descripcion);
      let colorp=this.vincmayor?.colorvin!=null?this.vincmayor.colorvin.substring(0,this.vincmayor.colorvin.length-2):'#f8f8f8';
      this.colorv.setValue(colorp);
    }
    else{
      this.vinculosel=this.rowpasa;
      this.itempri.setValue(this.rowpasa.item);
      this.descripcionpri.setValue(this.rowpasa.descripcion);
      let colorp=this.rowpasa?.colorvin!=null?this.rowpasa.colorvin.substring(0,this.rowpasa.colorvin.length-2):'#f8f8f8';
      this.colorv.setValue(colorp);
    }
    this.formData.disable();
    this.colorv.enable();
    this.numporc.enable();
    /* this.selvinc.enable(); */
    this.updatevincpart$=this.varGlobalesService.updvincPart.subscribe(data=>{//indicador que se cambio clasi comercial desde relacion de insumos, para actualizar en el principal
      if(data){
        this.tablapri=JSON.parse(JSON.stringify(data.tabla));
        this.arrindpri=JSON.parse(JSON.stringify(data.arrind));
      }
    });
  }
  ngOnDestroy(): void {
    this.varGlobalesService.vincPart.next(null);
    this.varGlobalesService.updvincPart.next(null);
    this.updatevincpart$.unsubscribe();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto=320;
    this.heightacu = window.innerHeight - resto;
    this.minimbut=document.body.clientWidth <= 991?true:false;
  }
  public maskUsAmountDecimal = createNumberMask({
    prefix: '',
    allowDecimal: false,
    integerLimit: 3,
  });
  async closeModal(){
    let cont=0;
    let filavinculo;
    let filaselnueva;
    let filaselvin;
    for(let row of this.tablapri){
      if(row.seleccion==1 && row.vinculo==null){
        cont++;
        if(row.indice==this.rowpasa.indice){
          cont--;
        }
      }
      if(row.seleccion==0 && row.vinculo!=null){
        cont++;
      }
      if(filavinculo==null && this.desvpri && row.vinculo!=null && row.seleccion==1){//una sola vez
        filavinculo=row;
      }
      if(filaselnueva==null && row.seleccion==1 && row.vinculo==null){
        filaselnueva=row;
      }
      if(filaselvin==null && row.seleccion==1 && row.indice==this.rowpasa.indice){//fila pasa esta seleccionada
        filaselvin=row;
      }
    }
    let objpasa={
      desvpri:this.desvpri,
      colorv:this.colorv.value+'4d',
      nfilapri:this.desvpri?filavinculo:filaselvin!=null?filaselvin:filaselnueva,
      datos:this.tablapri,
      indices:this.arrindpri,
      todo:false
    };
    let colorp=this.rowpasa?.colorvin!=null?this.rowpasa.colorvin.substring(0,this.rowpasa.colorvin.length-2):null;
    if(cont>0 || (this.rowpasa.colorvin!=null && colorp!=this.colorv.value) || (this.rowpasa.colorvin==null && this.colorv.value!='#f8f8f8')){//hay cambios
      const sw = await SwalService.confirm('Desea Guardar Cambios?', '')
      if (sw.isConfirmed) {
        this.modal.close(objpasa);
      }
      else{
        if(sw.dismiss.toString() =="cancel"){
          this.modal.close();
        }
      }
    }
    else{
      this.modal.close();
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  toggleOn(condicion: any,indice:any) {
    let pila=[];//objetos{ item, icomost }
    this.tablapri[indice].icomost=1;
    let nuevogru=false;
    for (let i=indice+1;i<this.tablapri.length;i++) {
      if (this.tablapri[i].item != condicion && !nuevogru) {
        var palabra = this.tablapri[i].item.toString().substring(0, condicion.toString().length + 1)
        if (palabra == (condicion + '.')) {
          if(condicion.split('.').length+1==this.tablapri[i].item.toString().split('.').length){
            this.tablapri[i].mostrar=1;
            this.tablapri[i].estmost=1;
            if(this.tablapri[i].unidad==''){
              pila.push({item:this.tablapri[i].item,icomost:this.tablapri[i].icomost});
            }
          }
          else{
            var palabra2 = this.tablapri[i].item.toString().substring(0, this.tablapri[i].item.lastIndexOf('.'))
            let fila1=pila.find(ele=>ele.item==palabra2);
            this.tablapri[i].mostrar=fila1.icomost==0?0:this.tablapri[i].estmost;
            if(this.tablapri[i].unidad==''){
              pila.push({item:this.tablapri[i].item,icomost:fila1.icomost==0?0:this.tablapri[i].icomost});
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
  toggleOff(condicion: any,indice:any) {
    this.tablapri[indice].icomost = 0;
    let ind2 = indice+1;
    let nuevogru=false;
    for (let i=ind2;i<this.tablapri.length;i++) {
      if (this.tablapri[i].item != condicion  && !nuevogru) {
        var palabra = this.tablapri[i].item.toString().substring(0, condicion.toString().length + 1)
        if (palabra == (condicion + '.')) {
          if(condicion.split('.').length+1==this.tablapri[i].item.toString().split('.').length){
            this.tablapri[i].estmost=0;
          }
          this.tablapri[i].mostrar=0;
        }
        else{
          nuevogru=true;
        }
      }
      else{ break; }
    }
  }
  maxtodo(){
    for (let row of this.tablapri) {
      if(row.item.split('.').length>1){
        row.mostrar=1;
      }
      row.icomost = 1;
    }
  }
  mintodo(){
    for (let row of this.tablapri) {
      if(row.item.split('.').length>1){
        //row.estmost=row.mostrar;
        row.mostrar=0;
      }
      else{
        row.icomost=0; row.mostrar=1;
      }
    }
  }
  cambindiceselacu(ind: any) {
    if (ind == this.filaSel)
      this.filaSel = -1;
    else
      this.filaSel = ind;
  }
  cambioseltpri(row){
    if(row.seleccion==0){
      row.seleccion=1;
      if(row.indice==this.rowpasa.indice && row.vinculo!=null){
        this.desvpri=false;
      }
    }
    else{
      row.seleccion=0;
      if(row.indice==this.rowpasa.indice && row.vinculo!=null){
        this.desvpri=true;
      }
    }
  }
  Vincular(){
    let cont=0;
    let filavinculo;
    let filaselnueva;
    let filaselvin;
    for(let row of this.tablapri){
      if(row.seleccion==1 && row.vinculo==null){
        cont++;
      }
      if(row.seleccion==0 && row.vinculo!=null){
        cont++;
      }
      if(filavinculo==null && this.desvpri && row.vinculo!=null && row.seleccion==1){//una sola vez
        filavinculo=row;
      }
      if(filaselnueva==null && row.seleccion==1 && row.vinculo==null){
        filaselnueva=row;
      }
      if(filaselvin==null && row.seleccion==1 && row.indice==this.rowpasa.indice){//fila pasa esta seleccionada
        filaselvin=row;
      }
    }
    let objpasa={
      desvpri:this.desvpri,
      colorv:this.colorv.value+'4d',
      nfilapri:this.desvpri?filavinculo:filaselvin!=null?filaselvin:filaselnueva,
      datos:this.tablapri,
      indices:this.arrindpri,
      todo:false,
    };
    let colorp=this.rowpasa?.colorvin!=null?this.rowpasa.colorvin.substring(0,this.rowpasa.colorvin.length-2):null;
    //if(cont>0 || (this.rowpasa.colorvin!=null && colorp!=this.colorv.value)){//hay cambios
    if(cont>0 || (this.rowpasa.colorvin!=null && colorp!=this.colorv.value) || (this.rowpasa.colorvin==null && this.colorv.value!='#f8f8f8')){//hay cambios
      this.modal.close(objpasa);
    }
    else{//no hay cambios
      this.toaster.info('No hay cambios para guardar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  Seltodo(){
    for(let row of this.tablapri){
      if(row.unidad!=''){
        if(row.seleccion==0){
          row.seleccion=1;
          if(row.indice==this.rowpasa.indice && row.vinculo!=null){
            this.desvpri=false;
          }
        }
      }
    }
  }
  Deseltodo(){
    for(let row of this.tablapri){
      if(row.unidad!=''){
        if(row.seleccion==1){
          if(row.indice==this.vinculosel.indice && row.vinculo==null){
            row.seleccion=1;
          }
          else{
            row.seleccion=0;
            if(row.indice==this.rowpasa.indice && row.vinculo!=null){
              this.desvpri=true;
            }
          }
        }
      }
    }
  }
  Resigual(){
    for(let row of this.tablapri){
      if(row.porc==100 && row.seleccion==0){
        row.seleccion=1;
      }
    }
  }
  Resparece(){
    this.m_parece=!this.m_parece;
  }
  ReiniColor(){
    this.colorv.setValue('#f8f8f8')
  }
  OcultaBloq(){
    this.verbloq=!this.verbloq;
    if(this.verbloq){
      for(let row of this.tablapri){
        if(row.seleccion==2){
          row.verbloq=1;
        }
      }
    }
    else{
      for(let row of this.tablapri){
        if(row.seleccion==2){
          row.verbloq=0;
        }
      }
    }
  }
  async CambioPorc(){
    if(!this.numporc.invalid){
      let objretorna={
        numporc:this.numporc.value
      }
      await this.varGlobalesService.vincPart.next(objretorna);
    }
    else{
      this.toaster.info('El valor debe ser como minimo 50 y maximo 100.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async QuitaVinc(){
    const sw = await SwalService.confirm('Esta seguro de Quitar Vinculos?', 'Se eliminaran todos los vinculos de las partidas en la tabla y sus vinculados que no aparecen en esta tabla.')
    if (sw.isConfirmed) {
      let arrdesv=[]
      let indsdesv=[]
      for(let a=0;a<this.tablapri.length;a++){
        if(this.tablapri[a].vinculo!=null){
          let exvinc=arrdesv.find(ele=>this.tablapri[a].vinculo==ele.vinculo);
          if(!exvinc){
            arrdesv.push(this.tablapri[a]);
            indsdesv.push(this.arrindpri[a])
          }
        }
      }
      let objpasa={
        desvpri:null,
        colorv:null,
        nfilapri:null,
        datos:arrdesv,
        indices:indsdesv,
        todo:true
      };
      this.modal.close(objpasa);
    }
  }
}
