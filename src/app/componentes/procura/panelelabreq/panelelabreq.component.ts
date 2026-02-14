import { Component, OnInit,Input, ChangeDetectorRef,HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { PrincipalService } from 'src/app/servicios/principal.service';

@Component({
  selector: 'app-panelelabreq',
  templateUrl: './panelelabreq.component.html',
  styleUrls: ['./panelelabreq.component.scss']
})
export class PanelelabreqComponent implements OnInit {
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
    this.decima=value.get('decimal').value;
    this.solover=value.get('solover').value;
    //this.moneda=datosproy.get('moneda').value.toString()=='0'?'S/':'$';
    this.simbolo=datosrec.value.simbolo
  }

  decpasa:any
  dec_parcial=2;
  mask_parcial='0.2';
  filareg:any

  dataSource1=[]
  fila1_sel=-1
  buscando1=false

  tit_sel_1='';
  mostrar_filaseldet1=false;
  dataSourcedet1= [];
  filadet1_sel=-1;
  id_reg:any;

  tot_asig1:any;
  tot_util1:any;
  promporc1:any;
  tot_asig2:any;
  tot_util2:any;
  promporc2:any;
  esSecund=false
  tot_montoasig:any;
  totant_montoasig:any;

  constructor(
    private _logisticaService:LogisticaService,
    private presuservice:PresupuestosService,
    private principalService:PrincipalService,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService,
    public formService: FormsService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  async ngOnInit(){
    this.mostrar_carga=true;
    this.scrollbut=document.body.clientWidth <= 813?true:false;
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
      this.dec_parcial=arrdec[2];
      this.mask_parcial='0.'+arrdec[2];
    }
    let res= await this.presuservice.listarTopPresupuesto({id_proyecto:this.id_proyecto});
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
    this.scrollbut=document.body.clientWidth <= 813?true:false;
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
  async ListarAdquisiciones(){
    this.buscando1=true;
    this.dataSource1=[]
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
  cambindicesel1(ind:any){
    if (ind != this.fila1_sel){
    //   this.fila1_sel = -1;
    // else{
      this.fila1_sel = ind;
      this.filareg=this.dataSource1[ind];
      this.filareg.solover=this.solover;
      this.filareg.simbolo=this.simbolo;
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
}
