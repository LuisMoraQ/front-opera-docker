import { Component, HostListener, Input, OnInit, ViewChild,Output,EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from 'src/app/servicios/swal.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

@Component({
  selector: 'app-agrupinsumos',
  templateUrl: './agrupinsumos.component.html',
  styleUrls: ['./agrupinsumos.component.scss']
})
export class AgrupinsumosComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  @Output() listarpri = new EventEmitter<any>();
  solover=false
  anchofoot3=404;
  mostrar_carga_todo=false
  widthm1b2: number=100;
  heighttmodal: number=100;
  paddingscroll = 17;
  paddingscroll2 = 17;
  preventscroll=false;
  fechaac:any;
  oculceros2=false;
  ordent4=0;
  dataSource4= [];
  fila4_sel=-1;
  filtrom12="";
  oculdisp2=false;
  buscando4=false;
  bcambiost5=false;

  dataSource5= [];
  fila5_sel=-1;
  totalinsagru='0.00';
  promporc1=100;
  dataSource6= [];//tabla insumodisgrega

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
  @ViewChild("modalmostrar12a") modalmostrar12a: ModalBasicComponent;
  Frmmostrar12a = new FormGroup({
    Iditem12a: new FormControl('', [Validators.required]),
    Descgru12a: new FormControl('', [Validators.required]),
    Lugar: new FormControl('', [Validators.required]),
  })
  get Iditem12a(): FormControl { return this.Frmmostrar12a.get('Iditem12a') as FormControl }
  get Descgru12a(): FormControl { return this.Frmmostrar12a.get('Descgru12a') as FormControl }
  get Lugar(): FormControl { return this.Frmmostrar12a.get('Lugar') as FormControl }

  @ViewChild("modalmostrar12b") modalmostrar12b: ModalBasicComponent;
  Frmmostrar12b = new FormGroup({
    Iditemsel12b: new FormControl(null, Validators.required),
    Idcomsel12b: new FormControl(null, Validators.required),
    Descgrusel12b: new FormControl(null, Validators.required),
    Iditem12b: new FormControl(null, Validators.required),
    Descgru12b: new FormControl('', Validators.required),
    Lugar: new FormControl('', Validators.required),
  })
  get Iditemsel12b(): FormControl { return this.Frmmostrar12b.get('Iditemsel12b') as FormControl }
  get Idcomsel12b(): FormControl { return this.Frmmostrar12b.get('Idcomsel12b') as FormControl }
  get Descgrusel12b(): FormControl { return this.Frmmostrar12b.get('Descgrusel12b') as FormControl }
  get Iditem12b(): FormControl { return this.Frmmostrar12b.get('Iditem12b') as FormControl }
  get Descgru12b(): FormControl { return this.Frmmostrar12b.get('Descgru12b') as FormControl }
  get Lugarb(): FormControl { return this.Frmmostrar12b.get('Lugar') as FormControl }

  constructor(
    private _logisticaService:LogisticaService,
    public formService: FormsService,
    private _EncriptadorService:EncriptadorService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    try{
      this.id_reg=this.filareg.id_registro;
      this.id_proyecto=this.filareg.id_proyecto
      this.solover=this.filareg.solover
      let resto=this.solover?70:90;
      this.widthm1b2=(window.innerWidth/2)-resto;
      this.anchofoot3=this.solover?372:this.anchofoot3;
      this.heighttmodal=window.innerHeight-165;
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
      //listar y otras funciones
      let resfec = await this._EncriptadorService.FechaActualBack();
      if (resfec.id == 1) {
        this.fechaac = new Date(resfec.mensaje);
      }
      else{
        this.fechaac=new Date();
      }
      this.buscando4=true;
      let res=await this._logisticaService.listarRelinsAdqui({id_proyecto:this.id_proyecto,id_registro:this.id_reg,conrelins:'1'});
      this.buscando4=false
      if(res?.length>0){
        this.dataSource4=res[0];
        this.dataSource5=res[1]
        this.dataSource6=res[2]
        if(res[0].length<=4){
          this.toaster.error('Aun no guardó Metrados Solicitado en la pestaña RELACIÓN DE INSUMOS.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    catch(e){
      console.log(e);
      this.buscando4=false
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.heighttmodal=window.innerHeight-165;
    let resto=this.solover?70:90;
    this.widthm1b2=(window.innerWidth/2)-resto;
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
  cambindicesel4(ind:any){
    if(ind==this.fila4_sel)
      this.fila4_sel=-1;
    else
      this.fila4_sel=ind;
  }
  toggleOn2(fila:any){
    fila.icomost=1;
    let idtipo=fila.id_tipo_insumo;
    for(let row of this.dataSource4){
      if(row.id_tipo_insumo==idtipo && row.num_det!=0)
      {
        row.mostrar=1;
      }
    }
  }
  toggleOff2(fila:any){
    fila.icomost=0;
    let idtipo=fila.id_tipo_insumo;
    for(let row of this.dataSource4){
      if(row.id_tipo_insumo==idtipo && row.num_det!=0)
      {
          row.mostrar=0;
      }
    }
  }
  ocultarceros2(val:any){
    if(val==0){
      this.oculceros2=true;
      for(let row of this.dataSource4){
        if(Number(row.parcial)==0 && row.nro!='0')
        {
          row.mostcero=0;
        }
      }
    }
    else{
      this.oculceros2=false;
      for(let row of this.dataSource4){
        if(Number(row.parcial)==0 && row.nro!='0')
        {
          row.mostcero=1;
        }
      }
    }
  }
  ordenart4asc(){//revisar ordenamientos
    if(this.dataSource4.length>0){
      this.ordent4=2;
      this.dataSource4.sort(function(a,b){
        if(a.id_tipo_insumo > b.id_tipo_insumo) {
          return 1;
        }
        if(a.id_tipo_insumo < b.id_tipo_insumo) {
          return -1;
        }
        if(a.filains > b.filains) {
          return 1;
        }
        if(a.filains < b.filains) {
          return -1;
        }
        if (a.indiceunif < b.indiceunif) {
          return 1;
        }
        if (a.indiceunif > b.indiceunif) {
          return -1;
        }
        return 0;
      })
    }
  }
  ordenart4desc(){
    if(this.dataSource4.length>0){
      this.ordent4=1;
      this.dataSource4.sort(function(a,b){
        if(a.id_tipo_insumo > b.id_tipo_insumo) {
          return 1;
        }
        if(a.id_tipo_insumo < b.id_tipo_insumo) {
          return -1;
        }
        if(a.filains > b.filains) {
          return 1;
        }
        if(a.filains < b.filains) {
          return -1;
        }
        if (a.indiceunif > b.indiceunif) {
          return 1;
        }
        if (a.indiceunif < b.indiceunif) {
          return -1;
        }
        return 0;
      })
    }
  }
  ordenart4def(){
    if(this.dataSource4.length>0){
      this.ordent4=0;
      this.dataSource4.sort(function(a,b){
        if(a.id_tipo_insumo > b.id_tipo_insumo) {
          return 1;
        }
        if(a.id_tipo_insumo < b.id_tipo_insumo) {
          return -1;
        }
        if (a.num_det > b.num_det) {
          return 1;
        }
        if (a.num_det < b.num_det) {
          return -1;
        }
        return 0;
      })
    }
  }
  mostdisponibles2(val:any){
    if(val==0){
      this.oculdisp2=true;
      for(let row of this.dataSource4){
        if(row.seleccion==2 && row.nro!=0)
        {
          row.mostsele=0;
        }
      }
    }
    else{
      this.oculdisp2=false;
      for(let row of this.dataSource4){
        if(row.seleccion==2 && row.nro!=0)
        {
          row.mostsele=1;
        }
      }
    }
  }
  applyFilterm12(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtrom12=filterValue;
    for(let row of this.dataSource4){
      if(row.num_det!=0){
        if((row.descripcion.toLowerCase().replace(/\s+/g, ' ').includes(filterValue.toLowerCase().replace(/\s+/g, ' ')))){
          row.mostfilt=1
        }
        else{
          row.mostfilt=0
        }
      }
    }
  }
  limpiarfiltrom12(){
    var valor = $("#txt_buscam12").val();
    if(valor==''){
      this.filtrom12="";
      for(let row of this.dataSource4){
        row.mostfilt=1
      }
    }
  }
  cambiosel4(fila:any){//revisar al filtrar
    if(fila.seleccion==0)
      fila.seleccion=1;
    else
      fila.seleccion=0;
  }
  //metodos tabla2
  AgregarGrupo(){
    let nomite='R-';
    let existe=[];
    let total=[];
    let falta=[];
    let mayor=1;
    for(let i=0;i<this.dataSource5.length;i++){
      if(!this.dataSource5[i].indice)
      {
        existe.push(Number(this.dataSource5[i].idgrupo.split('-')[1]));
        if(mayor<Number(this.dataSource5[i].idgrupo.split('-')[1])){
          mayor=Number(this.dataSource5[i].idgrupo.split('-')[1]);
        }
      }
    }
    for(let j=1;j<=mayor+1;j++){
      total.push(j)
    }
    for(let nro of total){
      let bexiste=false;
      for(let nro2 of existe){
        if(nro2==nro){
          bexiste=true;
          break;
        }
      }
      if(!bexiste){
        falta.push(nro);
      }
    }
    nomite=nomite+(falta[0]);
    this.Iditem12a.setValue(nomite);
    this.Descgru12a.setValue('')
    this.Lugar.setValue('')
    this.modalmostrar12a.show();
  }
  cerrarModalmostrar12a(){
    this.modalmostrar12a.hide();
  }
  GuardarModalmostrar12a(){
    if(!this.Frmmostrar12a.invalid)
    {
      let nomite='A-';
      let existe=[];
      let total=[];
      let falta=[];
      let mayor=1;
      for(let i=0;i<this.dataSource5.length;i++){
        if(!this.dataSource5[i].indice)
        {
          existe.push(Number(this.dataSource5[i].id_comple.split('-')[1]));
          if(mayor<Number(this.dataSource5[i].id_comple.split('-')[1])){
            mayor=Number(this.dataSource5[i].id_comple.split('-')[1]);
          }
        }
      }
      for(let j=1;j<=mayor+1;j++){
        total.push(j)
      }
      for(let nro of total){
        let bexiste=false;
        for(let nro2 of existe){
          if(nro2==nro){
            bexiste=true;
            break;
          }
        }
        if(!bexiste){
          falta.push(nro);
        }
      }
      nomite=nomite+(falta[0]);
      var idgrup=this.Iditem12a.value;
      var descrip=this.Descgru12a.value;
      var lugar=this.Lugar.value;
      var fecham=moment(this.fechaac).format('DD-MM-YY');
      for(let row of this.dataSource5){
        row.seleccion=0;
      }
      let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgrup,idfila:0,nro:0,
        indice:null,id_filadetalle:null,num_det:null,codigo:'',descripcion:descrip,unidad:'',cantidad:null,precio:null,parcial:0,indiceunif:'',porc:0,reqsol:0,
        variacion:100,estado:0,saldo:null,observacion:'',fecha:fecham,fecha_sol:null,fecha_ate:null,complemento:0,id_comple:nomite,entrega:lugar,seleccion:1,mostrar:1,icomost:1,editar:0};
      this.dataSource5.push(ejm);
      this.bcambiost5=true;
      this.modalmostrar12a.hide();
    }
    else
    {
      this.Frmmostrar12a.markAllAsTouched();
      this.toaster.error('Debe llenar los campos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  async QuitarGrupo(){
    //confirmar
    let tablaux=[];
    let totfilas=this.dataSource5.length
    let idgrupo='';
    let estadogru='0';
    let existecomp=0;
    let agrup='';
    for(let h=0;h<this.dataSource5.length;h++){
      if(this.dataSource5[h].seleccion==1 && this.dataSource5[h].indice==null){
        estadogru=this.dataSource5[h].estado;
        //if(this.dataSource5[h].complemento==0){
          agrup=this.dataSource5[h].id_comple;
        //}
      }
      else{
        if(this.dataSource5[h].indice==null && this.dataSource5[h].id_comple===agrup){
          existecomp=1;
        }
      }
    }
    if(estadogru!='1'){
      if(existecomp==0){
        if(agrup!=''){
          const sw = await SwalService.confirm('Estas seguro?', 'Una vez realizada la acción no se podra revertir los cambios!')
          if (sw.isConfirmed) {
            for(let j=0;j<totfilas;j++){
              if(idgrupo!=''){
                if(this.dataSource5[j].seleccion==1 && this.dataSource5[j].indice){
                  tablaux.push(this.dataSource5[j]);
                  let totelim=Number(this.dataSource5[j].parcial)
                  this.dataSource5.splice(j,1);
                  j=j-1;
                  totfilas=totfilas-1;
                  let tottem=Number(this.totalinsagru);
                  this.totalinsagru=this.formService.redondeo(tottem-totelim,this.dec_parcial);
                }
              }
              else{
                if(this.dataSource5[j].seleccion==1 && this.dataSource5[j].indice==null){
                  idgrupo=this.dataSource5[j].idgrupo;
                  estadogru=this.dataSource5[j].estado;
                  //eliminar si existe en tabla8
                  for(let k=0;k<this.dataSource6.length;k++){
                    if(this.dataSource5[j].idgrupo==this.dataSource6[k].idgrupo){
                      this.dataSource6.splice(k,1);
                      k--;
                    }
                  }
                  this.dataSource5.splice(j,1);
                  this.bcambiost5=true;
                  j=j-1;
                  totfilas=totfilas-1;
                }
              }
            }
            if(idgrupo!=''){
              let gruant='';
              let gruact='';
              let cambgru='';
              let cambiar=false;
              for(let k=0;k<this.dataSource5.length;k++){
                if(this.dataSource5[k].indice==null){//es grupo
                  gruact=this.dataSource5[k].idgrupo;
                  let numgru=Number(gruact.split('-')[1]);
                  if(gruant!=''){
                    let numgruant=Number(gruant.split('-')[1]);
                    if(numgru==numgruant+1){
                      cambiar=false;
                      cambgru='';
                    }
                    else{
                      cambiar=true;
                      cambgru='R-'+(numgruant+1);
                      for(let row of this.dataSource6){
                        if(row.idgrupo==this.dataSource5[k].idgrupo){
                          row.idgrupo=cambgru;
                        }
                      }
                      this.dataSource5[k].idgrupo=cambgru;
                    }
                  }
                  else{
                    if(numgru!=1){
                      cambiar=true;
                      cambgru='R-1';
                      for(let row of this.dataSource6){
                        if(row.idgrupo==this.dataSource5[k].idgrupo){
                          row.idgrupo=cambgru;
                        }
                      }
                      this.dataSource5[k].idgrupo=cambgru;
                    }
                    else{
                      cambiar=false;
                      cambgru='';
                    }
                  }
                  gruant=cambgru!=''?cambgru:gruact;
                }
                else{
                  if(cambiar){
                    if(this.dataSource5[k].idgrupo==gruact){
                      this.dataSource5[k].idgrupo=cambgru;
                    }
                  }
                }
              }
              let grucomant='';
              let grucomact='';
              let cambgrucom='';
              let cambiarcom=false;
              for(let k=0;k<this.dataSource5.length;k++){
                if(this.dataSource5[k].unidad==null && this.dataSource5[k].complemento==0){
                  grucomact=this.dataSource5[k].id_comple;
                  let numgru=Number(grucomact.split('-')[1]);
                  if(grucomant!=''){
                    let numgruant=Number(grucomant.split('-')[1]);
                    if(numgru==numgruant+1){
                      cambiarcom=false;
                      cambgrucom='';
                    }
                    else{
                      cambiarcom=true;
                      cambgrucom='A-'+(numgruant+1);
                      for(let row of this.dataSource5){
                        if(row.id_comple==this.dataSource5[k].id_comple && row.complemento==1 && row.unidad==''){
                          row.id_comple=cambgrucom;
                        }
                      }
                      this.dataSource5[k].id_comple=cambgrucom;
                    }
                  }
                  else{
                    if(numgru!=1){
                      cambiarcom=true;
                      cambgrucom='A-1';
                      for(let row of this.dataSource5){
                        if(row.id_comple==this.dataSource5[k].id_comple && row.complemento==1 && row.unidad==''){
                          row.id_comple=cambgrucom;
                        }
                      }
                      this.dataSource5[k].id_comple=cambgrucom;
                    }
                    else{
                      cambiarcom=false;
                      cambgrucom='';
                    }
                  }
                  grucomant=cambgrucom!=''?cambgrucom:grucomact;
                }
                else{
                  if(cambiar){
                    if(this.dataSource5[k].id_comple==grucomact){
                      this.dataSource5[k].id_comple=cambgrucom;
                    }
                  }
                }
              }
              //this.actualizarvistat5();
              // let tabla6aux=[];
              // for(let row of this.dataSource5Pri){
              //   if(row.idinsumo==''){
              //     tabla6aux.push(row);
              //   }
              // }
              // this.dataSource6.data=tabla6aux;
              // this.ordenart6();
              for(let k=0;k<tablaux.length;k++){//actualizar en tabla 4 la seleccion
                for(let i=0;i<this.dataSource4.length;i++){
                  if(this.dataSource4[i].indice==tablaux[k].indice && this.dataSource4[i].id_filadetalle==tablaux[k].id_filadetalle){//condicionar con claves primarias
                    this.dataSource4[i].seleccion=0;
                    this.dataSource4[i].accion=1;
                    break;
                  }
                }
              }
              // //actualizar las vistas del eliminado no se puede ver
              // this.cambindicesel6(this.fila6_sel,this.dataSource6.data[this.fila6_sel]);
            }
            else
            {
              this.toaster.error('Debe seleccionar un grupo completo para quitar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
            }
          }
        }
        else{
          this.toaster.error('Debe seleccionar un grupo completo para quitar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('Eliminar primero los complementos de este grupo.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else{
      this.toaster.error('No se puede eliminar un grupo con estado Completo.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  AgregarComple(){
    let totfilas=this.dataSource5.length
    let idgrupo='';
    let nomgrupo='';
    let idcomgru='';
    let entrega='';
    let complemento=0;
    for(let j=0;j<totfilas;j++){
      if(this.dataSource5[j].seleccion==1 && this.dataSource5[j].indice==null){
        idgrupo=this.dataSource5[j].idgrupo;
        nomgrupo=this.dataSource5[j].descripcion;
        idcomgru=this.dataSource5[j].id_comple;
        entrega=this.dataSource5[j].entrega;
        complemento=this.dataSource5[j].complemento;
      }
    }
    if(idgrupo!=''){
      if(complemento==0){
        let nomite='R-';
        let existe=[];
        let total=[];
        let falta=[];
        let mayor=1;
        for(let i=0;i<this.dataSource5.length;i++){
          if(this.dataSource5[i].indice==null)
          {
            existe.push(Number(this.dataSource5[i].idgrupo.split('-')[1]));
            if(mayor<Number(this.dataSource5[i].idgrupo.split('-')[1])){
              mayor=Number(this.dataSource5[i].idgrupo.split('-')[1]);
            }
          }
        }
        for(let j=1;j<=mayor+1;j++){
          total.push(j)
        }
        for(let nro of total){
          let bexiste=false;
          for(let nro2 of existe){
            if(nro2==nro){
              bexiste=true;
              break;
            }
          }
          if(!bexiste){
            falta.push(nro);
          }
        }
        nomite=nomite+(falta[0]);
        this.Iditemsel12b.setValue(idgrupo)
        this.Idcomsel12b.setValue(idcomgru)
        this.Descgrusel12b.setValue(nomgrupo)
        this.Iditem12b.setValue(nomite)
        this.Descgru12b.setValue('')
        this.Lugarb.setValue(entrega)
        this.modalmostrar12b.show();
      }
      else{
        this.toaster.error('No se puede hacer complemento a este grupo.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else
    {
      this.toaster.error('Debe seleccionar un grupo completo para hacer un complemento.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  cerrarModalmostrar12b(){
    this.modalmostrar12b.hide();
  }
  GuardarModalmostrar12b(){
    if(!this.Frmmostrar12b.invalid)
    {
      var idcomsel=this.Idcomsel12b.value;
      var idgrup=this.Iditem12b.value;
      var descrip=this.Descgru12b.value;
      var entrega=this.Lugarb.value;
      var fecham=moment(this.fechaac).format('DD-MM-YY');
      let taux=[]
      for(let row1 of this.dataSource5){
        if(row1.seleccion==1){
          row1.seleccion=0;
          taux.push(JSON.parse(JSON.stringify(row1)))
        }
      }
      let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgrup,idfila:0,nro:0,
      indice:null,id_filadetalle:null,num_det:null,codigo:'',descripcion:descrip,unidad:'',cantidad:null,precio:null,parcial:0,indiceunif:'',porc:0,reqsol:0,
      variacion:null,estado:0,saldo:null,observacion:'',fecha:fecham,fecha_sol:null,fecha_ate:null,complemento:1,id_comple:idcomsel,entrega:entrega,seleccion:1,mostrar:1,icomost:1,editar:0};
      this.dataSource5.push(ejm);
      for(let row of taux){
        if(row.indice){
          ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgrup,idfila:row.idfila,nro:row.nro,//se asigna dependiendo al ultimo del grupo?es lo mismo del principal
            indice:row.indice,id_filadetalle:row.id_filadetalle,num_det:row.num_det,codigo:row.codigo,descripcion:row.descripcion,unidad:row.unidad,cantidad:row.cantidad,precio:row.precio,parcial:row.parcial,
            indiceunif:row.indiceunif,porc:row.porc,reqsol:row.reqsol,
            variacion:row.variacion,estado:0,saldo:row.saldo,observacion:row.observacion,fecha:null,fecha_sol:null,fecha_ate:null,complemento:1,
            id_comple:'',entrega:row.entrega,seleccion:1,mostrar:1,icomost:row.icomost,editar:0};//todo se asigna igual
          this.dataSource5.push(ejm);
        }
      }
      // let tabla6aux=[];
      // for(let row of this.dataSource5Pri){
      //   if(row.idinsumo==''){
      //     tabla6aux.push(row);
      //   }
      // }
      // this.dataSource6.data=tabla6aux;
      // this.ordenart6();
      this.bcambiost5=true;
      this.modalmostrar12b.hide();
    }
    else
    {
      this.Frmmostrar12b.markAllAsTouched();
      this.toaster.error('Debe llenar los campos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  AgregarFilasAgrIns(){
    let indgrupo=-1;
    let complem=0;
    let idgraux='';
    let idcomple='';
    let estgru='0';
    let datos_Selcomp=[];
    let nropas=0;
    let idfilmay=0;
    let inddetfin=-1;
    for(let j=0;j<this.dataSource5.length;j++){
      if(idgraux!=''){
        if(this.dataSource5[j].idgrupo!=idgraux)
        {
          break;
        }
      }
      if((this.dataSource5[j].seleccion==1 || this.dataSource5[j].seleccion==2) && this.dataSource5[j].indice==null)
      {
        inddetfin=j
        indgrupo=j;
        estgru=this.dataSource5[j].estado;
        complem=this.dataSource5[j].complemento;
        idgraux=this.dataSource5[j].idgrupo;
        idcomple=this.dataSource5[j].id_comple;
      }
      else if((this.dataSource5[j].seleccion==1 || this.dataSource5[j].seleccion==2) && this.dataSource5[j].indice){
        inddetfin=j
        nropas=this.dataSource5[j].nro;
        idfilmay=this.dataSource5[j].idfila>idfilmay?this.dataSource5[j].idfila:idfilmay;
      }
    }
    if(indgrupo>-1)
    {
      if(estgru!='1'){
        if(complem==0){
          let totagrins=Number(this.totalinsagru);
          let cont=0;
          let suma=Number(this.dataSource5[indgrupo].parcial);
          for(let row of this.dataSource4){
            if(row.seleccion==1 && ((row.operador!='%' && Number(row.cantidad)>0)|| row.operador=='%'))//porcentaje no tiene cantidad
            {
              cont++;
              var idgrup=this.dataSource5[indgrupo].idgrupo;
              var entrega=this.dataSource5[indgrupo].entrega;
              let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgrup,idfila:++idfilmay,nro:++nropas,//se asigna dependiendo al ultimo del grupo?es lo mismo del principal
                indice:row.indice,id_filadetalle:row.id_filadetalle,num_det:row.num_det,codigo:row.codigo,descripcion:row.descripcion,unidad:row.unidad,cantidad:row.cantidad,precio:row.precio,parcial:row.parcial,
                indiceunif:row.indiceunif,porc:0,reqsol:0,variacion:null,estado:0,saldo:100,observacion:'',fecha:null,fecha_sol:null,fecha_ate:null,complemento:0,
                id_comple:'',entrega:entrega,seleccion:1,mostrar:this.dataSource5[indgrupo].icomost==1?1:0,icomost:1,editar:0};//todo se asigna igual
              this.dataSource5.splice(++inddetfin,0,ejm);
              totagrins=totagrins+Number(row.parcial);
              datos_Selcomp.push(ejm)
              row.seleccion=2;//cambiar en la vista source4.data
              row.accion=1;
              suma=suma+Number(row.parcial);
            }
          }
          this.dataSource5[indgrupo].parcial=this.formService.redondeo(suma,this.dec_parcial);
          this.totalinsagru=this.formService.redondeo(totagrins,this.dec_parcial);
          this.calcporcentajegrupoins(false);
          // let tabla6aux=[];
          // let indaux=0
          // for(let row of this.dataSource5Pri){
          //   row.indice=indaux;
          //   if(row.idinsumo==''){
          //     tabla6aux.push(row);
          //   }
          //   indaux++;
          // }
          // this.dataSource6.data=tabla6aux;
          // this.ordenart6();
          if(cont<1){
            this.toaster.error('Seleccione los insumos para agregar al grupo.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
          }
          else{
            this.agregarfilaInsComple(idgraux,idcomple,datos_Selcomp)
            this.bcambiost5=true;
          }
        }
        else{
          this.toaster.error('No se puede agregar insumos a un complemento.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('No se puede modificar un grupo Completo.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else{
      this.toaster.error('Seleccione el grupo para agregar los insumos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  calcporcentajegrupoins(calcvar:boolean){
    let suma=0;
    let indicesgru=[];
    for(let i=0;i<this.dataSource5.length;i++){
      if(this.dataSource5[i].indice==null){
        let parcfila=Number(this.dataSource5[i].parcial);
        suma=suma+parcfila;
        indicesgru.push(i);
      }
    }
    for(let j=0;j<indicesgru.length;j++){
      let parcfila=Number(this.dataSource5[indicesgru[j]].parcial);
      var porcfilag=(parcfila*100)/suma;
      this.dataSource5[indicesgru[j]].porc=this.formService.redondeo(porcfilag,1);
      //calcular la variacion
      if(calcvar){
        let reqsoli=Number(this.dataSource5[indicesgru[j]].reqsol);
        let varia=this.formService.redondeo((((parcfila-reqsoli)/parcfila)*100),2);
        this.dataSource5[indicesgru[j]].variacion=this.dataSource5[indicesgru[j]].complemento==1?'':varia;
      }
    }
    // this.actualizarvistat5();
    this.totalinsagru=this.formService.redondeo(suma,this.dec_parcial);
  }
  agregarfilaInsComple(idgrupo:any,idcomp:any,datos_Selcomp:any){
    //revisar bucle, se puede modificar?no for dentro de otro for, un for para sacar datos, otro for para agregar datos
    let inddetfin=-1;
    for(let h=0;h<this.dataSource5.length;h++){
      if(this.dataSource5[h].idgrupo!=idgrupo && this.dataSource5[h].id_comple==idcomp && this.dataSource5[h].indice==null && this.dataSource5[h].complemento=="1"){
        let indgrupo=-1;
        let idgraux='';
        for(let j=0;j<this.dataSource5.length;j++){
          if(idgraux!=''){
            if(this.dataSource5[j].idgrupo!=idgraux)
            {
              inddetfin=j;
              break;
            }
          }
          if(this.dataSource5[j].idgrupo==this.dataSource5[h].idgrupo && this.dataSource5[j].indice==null)
          {
            indgrupo=j;
            idgraux=this.dataSource5[j].idgrupo;
          }
        }
        inddetfin=inddetfin==-1?this.dataSource5.length:inddetfin;
        for(let row of datos_Selcomp){
          if((row.operador!='%' && Number(row.cantidad)>0)|| row.operador=='%')//porcentaje no tiene cantidad
          {
            var idgrup=this.dataSource5[indgrupo].idgrupo;
            let ejm={id_proyecto:this.id_proyecto,id_registro:this.id_reg,idgrupo:idgrup,idfila:row.idfila,nro:row.nro,//se asigna dependiendo al ultimo del grupo?es lo mismo del principal
                indice:row.indice,id_filadetalle:row.id_filadetalle,num_det:row.num_det,codigo:row.codigo,descripcion:row.descripcion,unidad:row.unidad,cantidad:row.cantidad,precio:row.precio,parcial:row.parcial,
                indiceunif:row.indiceunif,porc:0,reqsol:0,variacion:null,estado:0,saldo:100,observacion:'',fecha:null,fecha_sol:null,fecha_ate:null,complemento:0,
                id_comple:'',entrega:row.entrega,seleccion:0,mostrar:this.dataSource5[indgrupo].icomost==1?1:0,icomost:1,editar:0};//todo se asigna igual
            //this.dataSource5.push(ejm);
            this.dataSource5.splice(inddetfin++,0,ejm);
          }
        }
      }
    }
    //this.actualizarvistat5();
  }
  async EliminarFilaAgrIns(){//no funciona con complementos
    //confirmar
    let tablaux=[];
    let indgru=-1;
    let idgrupo='';
    let complem=0;
    let idcomple='';
    let estgru='0';
    let reqsolgru=0;
    let suma=0;
    let totagrins=Number(this.totalinsagru);
    for(let h=0;h<this.dataSource5.length;h++){
      if((this.dataSource5[h].seleccion==1 || this.dataSource5[h].seleccion==2) && this.dataSource5[h].indice==null){
        suma=Number(this.dataSource5[h].parcial);
        reqsolgru=Number(this.dataSource5[h].reqsol);
        indgru=h;
        idgrupo=this.dataSource5[h].idgrupo;
        estgru=this.dataSource5[h].estado;
        complem=this.dataSource5[h].complemento;
        idcomple=this.dataSource5[h].id_comple;
      }
    }
    if(estgru!='1'){
      if(complem==0){
        let existefsel=0;
        for(let j=0;j<this.dataSource5.length;j++){
          if(this.dataSource5[j].seleccion==1 && this.dataSource5[j].indice!=null){
            existefsel++;
          }
        }
        if(existefsel>0){
          const sw = await SwalService.confirm('Estas seguro?', 'Una vez realizada la acción no se podra revertir los cambios!')
          if (sw.isConfirmed) {
            let totfilas=this.dataSource5.length;
            for(let j=0;j<totfilas;j++){
              if(this.dataSource5[j].seleccion==1 && this.dataSource5[j].indice!=null){
                tablaux.push(this.dataSource5[j]);//corregir la clave que se debe pasar -> toda la fila
                suma=suma-Number(this.dataSource5[j].parcial);
                totagrins=totagrins-Number(this.dataSource5[j].parcial);
                //eliminar si existe en tabla8
                for(let k=0;k<this.dataSource6.length;k++){
                  if(this.dataSource5[j].idgrupo==this.dataSource6[k].idgrupo && this.dataSource5[j].idfila==this.dataSource6[k].idfila){
                    reqsolgru=reqsolgru-Number(this.dataSource6[k].parcial);
                    this.dataSource6.splice(k,1);
                    k--;
                  }
                }
                this.dataSource5.splice(j,1);
                j=j-1;
                totfilas=totfilas-1;
                this.bcambiost5=true;
              }
            }
            if(indgru>-1){
              this.dataSource5[indgru].parcial=this.formService.redondeo(suma,this.dec_parcial);
              //this.tab6total=this.dataSource5[indgru].parcial;
              //las desviaciones y requerimiento solicitado
              this.dataSource5[indgru].reqsol=this.formService.redondeo(reqsolgru,this.dec_parcial);
              //this.tab7total=this.redondeo(reqsolgru,this.dec_parcial);
              let varia=this.formService.redondeo((((suma-reqsolgru)/suma)*100),2);
              this.dataSource5[indgru].variacion=this.dataSource5[indgru].complemento==1?'':varia;
            }
            this.eliminarfilaInsComple(idgrupo,idcomple,tablaux);
            this.totalinsagru=this.formService.redondeo(totagrins,this.dec_parcial);
            this.calcporcentajegrupoins(false);
            // let tabla6aux=[];
            // for(let row of this.dataSource5Pri){
            //   if(row.idinsumo==''){
            //     tabla6aux.push(row);
            //   }
            // }
            // this.dataSource6.data=tabla6aux;
            // this.ordenart6();
            // this.cargartabla8mostrar(this.idcomple);
            for(let k=0;k<tablaux.length;k++){
              for(let i=0;i<this.dataSource4.length;i++){
                if(this.dataSource4[i].indice==tablaux[k].indice && this.dataSource4[i].id_filadetalle==tablaux[k].id_filadetalle){
                  this.dataSource4[i].seleccion=0;
                  this.dataSource4[i].accion=1;
                  break;
                }
              }
            }
          }
        }
        else{
          this.toaster.error('Seleccione filas para quitar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }else{
        this.toaster.error('No se puede quitar insumos a un complemento.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else{
      this.toaster.error('No se puede modificar un grupo Completo.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  eliminarfilaInsComple(idgrupo:any,idcomp:any,datos_Selcomp:any){
    let idgrupocomple='';
    let totfilas=this.dataSource5.length;
    let reqsolgru=0;
    let indgru=-1;
    for(let row of datos_Selcomp){
      for(let h=0;h<totfilas;h++){
        if(idgrupocomple!=''){
          if(this.dataSource5[h].idgrupo==idgrupocomple && this.dataSource5[h].indice==row.indice && this.dataSource5[h].id_filadetalle==row.id_filadetalle){
            //eliminar si existe en tabla8
            for(let k=0;k<this.dataSource6.length;k++){
              if(this.dataSource5[h].idgrupo==this.dataSource6[k].idgrupo && this.dataSource5[h].idfila==this.dataSource6[k].idfila){
                reqsolgru=reqsolgru-Number(this.dataSource6[k].parcial.replace(/\,/g,''));
                this.dataSource6.splice(k,1);
                k--;
              }
            }
            if(indgru>-1){
              //las desviaciones y requerimiento solicitado
              this.dataSource5[indgru].reqsol=this.formService.redondeo(reqsolgru,this.dec_parcial);
            }
            this.dataSource5.splice(h,1);
            h=h-1;
            totfilas=totfilas-1;
          }
        }
        if(this.dataSource5[h].idgrupo!=idgrupo && this.dataSource5[h].id_comple==idcomp && this.dataSource5[h].indice==null && this.dataSource5[h].complemento=="1"){
          reqsolgru=Number(this.dataSource5[h].reqsol);
          idgrupocomple=this.dataSource5[h].idgrupo;
          indgru=h;
        }
      }
    }
    // this.actualizarvistat5();
  }
  subirfila5(){
    let cantfil=0;
    let indfilasel=0;
    for(let i=0;i<this.dataSource5.length;i++){
      if(this.dataSource5[i].seleccion==1 && this.dataSource5[i].indice!=null)
      {
        cantfil=cantfil+1;
        indfilasel=i;
      }
    }
    if(cantfil==1)
    {
      let ind_ant=indfilasel>0?indfilasel-1:-1;
      //usar json.parse(json.stringfy)
      if(ind_ant>0){
        let rowant=JSON.parse(JSON.stringify(this.dataSource5[ind_ant]))
        let nroant=rowant.nro;
        let fiact=JSON.parse(JSON.stringify(this.dataSource5[indfilasel]));
        let nroact=fiact.nro;
        if(rowant.indice!=null && rowant.idgrupo==fiact.idgrupo){
          this.fila5_sel=ind_ant;
          //subir
          fiact.nro=nroant
          this.dataSource5[ind_ant]=fiact;
          //bajar
          rowant.nro=nroact
          this.dataSource5[indfilasel]=rowant;
        }
        else{
          this.toaster.error('El registro ya no se puede Subir.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('El registro ya no se puede Subir.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else
    {
      this.toaster.error('Debe seleccionar una sola fila para mover.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  bajarfila5(){
    let cantfil=0;
    let indfilasel=0;
    for(let i=0;i<this.dataSource5.length;i++){
      if(this.dataSource5[i].seleccion==1 && this.dataSource5[i].indice!=null)
      {
        cantfil=cantfil+1;
        indfilasel=i;
      }
    }
    if(cantfil==1)
    {
      //variable nro se debe actualizar, para definir orden,probar json.parse,json stringfy
      let ind_ant=indfilasel<this.dataSource5.length-1?indfilasel+1:-1;
      if(ind_ant>0 && ind_ant<this.dataSource5.length){
        let rowant=JSON.parse(JSON.stringify(this.dataSource5[ind_ant]))
        let nroant=rowant.nro;
        let fiact=JSON.parse(JSON.stringify(this.dataSource5[indfilasel]));
        let nroact=fiact.nro;
        if(rowant.indice!=null && rowant.idgrupo==fiact.idgrupo){
          this.fila5_sel=ind_ant;
          //subir
          fiact.nro=nroant
          this.dataSource5[ind_ant]=fiact;
          //bajar
          rowant.nro=nroact
          this.dataSource5[indfilasel]=rowant;
        }
        else{
          this.toaster.error('El registro ya no se puede Bajar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('El registro ya no se puede Bajar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }
    else
    {
      this.toaster.error('Debe seleccionar una sola fila para mover.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  mostrarTodo5(){
    for(let row of this.dataSource5){
      if(row.indice!=null)
      {
        row.mostrar="1";
      }
      else
        row.icomost=1;
    }
  }
  ocultarTodo5(){
    for(let row of this.dataSource5){
      if(row.indice!=null)
      {
        row.mostrar="0";
      }else{
        row.icomost=0;
      }
    }
  }
  //tabla 5
  cambindicesel5(ind:any){
    if(ind==this.fila5_sel)
    {
      this.fila5_sel=-1;
    }
    else{
      this.fila5_sel=ind;
    }
  }
  toggleOn5(fila:any){
    fila.icomost=1;
    for(let row of this.dataSource5){
      if(row.idgrupo==fila.idgrupo)
      {
        if(row.indice!=null)
        {
          row.mostrar="1";
        }
        else
          row.icomost=1;
      }
    }
  }
  toggleOff5(fila:any){
    fila.icomost=0;
    for(let row of this.dataSource5){
      if(row.idgrupo==fila.idgrupo)
      {
        if(row.indice!=null)
        {
          row.mostrar="0";
        }
      }
    }
  }
  cambiosel5(ind:any){
    if(this.dataSource5[ind].seleccion==0){
      this.dataSource5[ind].seleccion=1;
    }
    else if(this.dataSource5[ind].seleccion==1){
      this.dataSource5[ind].seleccion=0;
    }
    else if(this.dataSource5[ind].seleccion==2){
      this.dataSource5[ind].seleccion=1;
    }
    /* error  son 2 casos uno para grupo, otro para fila*/
    let rowsel=this.dataSource5[ind];
    if(rowsel.indice==null){//grupo
      if(rowsel.seleccion==1)//todo seleccionado
      {
        for(let j=0;j<this.dataSource5.length;j++){
          if(rowsel.idgrupo==this.dataSource5[j].idgrupo){
            this.dataSource5[j].seleccion=1;
          }
          else{
            this.dataSource5[j].seleccion=0;
          }
        }
      }
      else if(rowsel.seleccion==0)//todo deseleccionado
      {
        for(let j=0;j<this.dataSource5.length;j++){
          if(rowsel.idgrupo==this.dataSource5[j].idgrupo){
            this.dataSource5[j].seleccion=0;
          }
          else{
            this.dataSource5[j].seleccion=0;
          }
        }
      }
      else{//2 Indeterminate, seleccionar todo
        for(let j=0;j<this.dataSource5.length;j++){
          if(rowsel.idgrupo==this.dataSource5[j].idgrupo){
            this.dataSource5[j].seleccion=1;
          }
          else{
            this.dataSource5[j].seleccion=0;
          }
        }
      }
    }
    else{//detalle
      let contacant=0;
      let contnados=0;
      let indgrup=-1;
      for(let j=0;j<this.dataSource5.length;j++){
        if(rowsel.idgrupo==this.dataSource5[j].idgrupo){
          if(this.dataSource5[j].indice==null)
          {
            indgrup=j;
          }
          else
          {
            contacant=contacant+1;
            if(this.dataSource5[j].seleccion==1)
              contnados=contnados+1;
          }
        }
        else
        {
          this.dataSource5[j].seleccion=0;
        }
      }
      if(indgrup>-1)
      {
        this.dataSource5[indgrup].seleccion=contnados==0?0:contacant==contnados?1:2;
      }
    }
  }
  editarcelda3(row:any){
    row.editar=1;
  }
  caneditarcelda3(valor:any,row:any){
    if(row.descripcion!=valor){
      row.descripcion=valor;
      this.bcambiost5=true;
    }
    
    row.editar=0;
  }
  presenter3(event:any,row:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarcelda3(row.descripcion,row)//el primer parametro es el valor de la celda a editar
    }
    else if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
  }
  async GuardarDatos(){
    try{
      if(this.bcambiost5){
        this.mostrar_carga_todo=true;
        let tabaux=[];
        for(let row of this.dataSource4){
          if(row.accion==1)
            tabaux.push(row);
        }
        //verificar estado y parsar si se va a cambiar a 2
        let actestado=this.filareg.estado==1?1:0;
        const datos1 = JSON.stringify(tabaux);
        const datos2 = JSON.stringify(this.dataSource5);
        const datos3 = JSON.stringify(this.dataSource6);
        let objpasa={
          id_proyecto:this.id_proyecto,
          id_registro:this.id_reg,
          actestado:actestado,
          datos1:datos1,
          datos2:datos2,
          datos3:datos3
        }
        let res=await this._logisticaService.GuardarAdquiAgruins(objpasa);
        this.mostrar_carga_todo=false;
        if(res.id==1)
        {
          SwalService.success('Correcto',res.mensaje)
          this.bcambiost5=false;//Solicitud de presupuesto
          if(this.filareg.estado==1)
            this.listarpri.emit('1')
        }
        else
        {
          SwalService.error('Advertencia','No se pudo realizar la Operación. '+res.mensaje);
        }
      }
      else{
        this.toaster.info('No hay cambios para guardar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }catch(e){
      this.mostrar_carga_todo=false;
      console.log(e)
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
}
