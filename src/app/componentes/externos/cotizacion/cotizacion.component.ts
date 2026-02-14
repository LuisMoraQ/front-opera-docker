import { ChangeDetectorRef,HostListener, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-cotizacion',
  templateUrl: './cotizacion.component.html',
  styleUrls: ['./cotizacion.component.scss']
})
export class CotizacionComponent implements OnInit {
  mostrar_carga_todo=false;
  keyrou=''
  id_proyecto
  id_registro
  idgrupo
  nroprov
  idprov
  fechaac:any;

  dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  dec_cant=4;
  mask_cant='0.4';
  simbolo='S/'

  dataprov=[]
  dataSource2=[]
  tabtotal=0
  fila2_sel=-1
  paddingscroll=0
  paddingscroll2=0
  preventscroll=false;

  formSoli = new FormGroup({
    razon: new FormControl(''),
    ruc: new FormControl(''),
    direccion:new FormControl(''),
    telefono:new FormControl(''),
    correo:new FormControl(''),
    contacto:new FormControl(''),

    lugar:new FormControl('', [Validators.required]),
    plazo:new FormControl('', [Validators.required]),
    oferta:new FormControl('', [Validators.required]),
  })
  estado: any
  get razon(): FormControl { return this.formSoli.get('razon') as FormControl }
  get ruc(): FormControl { return this.formSoli.get('ruc') as FormControl }
  get direccion(): FormControl { return this.formSoli.get('direccion') as FormControl }
  get telefono(): FormControl { return this.formSoli.get('telefono') as FormControl }
  get correo(): FormControl { return this.formSoli.get('correo') as FormControl }
  get contacto(): FormControl { return this.formSoli.get('contacto') as FormControl }

  get lugar(): FormControl { return this.formSoli.get('lugar') as FormControl }
  get plazo(): FormControl { return this.formSoli.get('plazo') as FormControl }
  get oferta(): FormControl { return this.formSoli.get('oferta') as FormControl }

  constructor(
    private route:ActivatedRoute,
    private _logisticaService:LogisticaService,
    public formService: FormsService,
    private toaster: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private encriptadorService: EncriptadorService,
  ) {
    this.route.params.subscribe(params=>{
      this.keyrou=params['key']
    })
  }

  async ngOnInit() {
    try{
      console.log(this.keyrou)
      let desenc=this.encriptadorService.desencryptar(this.keyrou)
      if(desenc!='' && desenc.includes('!')){
        let arrpara=desenc.split('!');
        if(arrpara.length==7){
          this.id_proyecto=arrpara[0]
          this.id_registro=arrpara[1]
          this.idgrupo=arrpara[2]
          this.nroprov=arrpara[3]
          let sfecha=arrpara[4]
          let plazolim=arrpara[5]
          this.idprov=arrpara[6]
          //condicionar fecha
          let arrfe=sfecha.split('-')
          let feac = new Date(Number(arrfe[0]),Number(arrfe[1])-1,Number(arrfe[2]));
          feac.setHours(0, 0, 0,0);
          let ffin=new Date()
          ffin.setDate(feac.getDate()+Number(plazolim))
          ffin.setHours(0,0,0,0)
          //hora
          let resfec = await this.encriptadorService.FechaActualBack();
          if (resfec.id == 1) {
            this.fechaac = new Date(resfec.mensaje);
          }
          else{
            this.fechaac=new Date();
          }
          let fechahoy=this.fechaac
          fechahoy.setHours(0,0,0,0)
          if(fechahoy>=feac && fechahoy<=ffin){
            this.mostrar_carga_todo=true;
            //Listar todos los datos
            let tablaaux=await this._logisticaService.ListarInsDisgregaCoti({id_proyecto:this.id_proyecto,id_registro:this.id_registro,idgrupo:this.idgrupo,nroprov:this.nroprov});
            //condicionar si respuesta tiene 2 tablas
            if(tablaaux.length==2){
              this.dataprov=tablaaux[0]
              if(this.dataprov[0].fecha_resp){
                this.SalirVista('La cotizacion ya fue enviada.');
              }
              this.dataSource2 = tablaaux[1];
              this.CargaDatos();
              this.mostrar_carga_todo=false;
            }
            else{//no cargar la pagina
              this.mostrar_carga_todo=false;
              this.SalirVista();
            }
          }
          else{
            //this.SalirVista('La solicitud ya no esta disponible.');
          }
        }
        else{
          this.SalirVista();
        }
      }
      else{
        this.SalirVista();
      }
    }catch(e){
      this.SalirVista();
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    //actualiza el paddingscroll2 para el  footer NO BORRAR ESTE METODO
  }
  ngAfterContentChecked(): void {
    //this.changeDetector.detectChanges();
    //cambiar ancho del scroll
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
  SyncScroll(){
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
  SyncScroll2(){
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
  SalirVista(msj=null){//cargar mensaje para mostrar en la vista
    if(msj){
      this.router.navigate(['/externo/error/'+msj])
    }
    else{
      this.router.navigate(['/externo/error'])
    }
  }
  CargaDatos(){
    if(this.dataprov.length>0){
      if(this.dataprov[0].id_prov==this.idprov){
        this.ruc.setValue(this.dataprov[0].ruc);
        this.razon.setValue(this.dataprov[0].razon);
        this.direccion.setValue(this.dataprov[0].direccion);
        this.telefono.setValue(this.dataprov[0].telefono);
        this.correo.setValue(this.dataprov[0].correo);
        this.contacto.setValue(this.dataprov[0].contacto);
        this.ruc.disable()
        this.razon.disable()
        this.direccion.disable()
        this.telefono.disable()
        this.correo.disable()
        this.contacto.disable()

        this.formSoli.markAllAsTouched();
      }
      else{
        this.SalirVista();
      }
    }
    else{
      this.SalirVista();
    }
  }
  cambindicesel2(ind: any) {
    if (ind == this.fila2_sel)
      this.fila2_sel = -1;
    else
      this.fila2_sel = ind;
  }
  editarcelda3(row: any) {
    if (row.estado == 1) {
      return;
    }
    row.editar = 1;
  }
  caneditarcelda3(valor: any, row: any) {
    if (row.marca != valor) {
      row.marca = valor;
    }
    row.editar = 0;
  }
  presenter3(event: any, ind: any) {
    if (event.keyCode.toString() == '27') {
      //esc descartar los cambios
      this.caneditarcelda3(this.dataSource2[ind].marca, this.dataSource2[ind]); //el primer parametro es el valor de la celda a editar
    } else if (event.keyCode.toString() == '13') {
      event.target.blur();
    }
    else if(event.keyCode.toString()=="40"){
      this.dataSource2[ind].editar=0;
      event.target.blur();
      if(ind+1<this.dataSource2.length){
        this.dataSource2[ind+1].editar=this.dataSource2[ind+1].indice==null?0:1;
      }
    }
    else if(event.keyCode.toString()=="38"){
      this.dataSource2[ind].editar=0;
      event.target.blur();
      if(ind-1>=0){
        this.dataSource2[ind-1].editar=this.dataSource2[ind-1].indice==null?0:1;
      }
    }
  }
  editarcelda2(ind:any){
    this.dataSource2[ind].editar2=1;
  }
  caneditarcelda2(eve:any,ind:any){
    var valor=Number(eve.toString().replace(/\,/g, ''));
    var actual=Number(this.dataSource2[ind].precio)
    var acantidad=Number(this.dataSource2[ind].cantidad);
    var pactual=Number(this.dataSource2[ind].parcial)
    console.log(valor,actual)
    this.dataSource2[ind].editar2=0;
    if(valor!=actual){
      let nparc=this.formService.redondeo((valor*acantidad),this.dec_parcial);
      this.dataSource2[ind].precio=this.formService.redondeo(Number(valor),this.dec_precio);
      this.dataSource2[ind].parcial=nparc;
      
      this.tabtotal=Number(this.tabtotal)-pactual+Number(nparc);
    }
  }
  presenter2(event:any,ind:any){
    if(event.keyCode.toString()=="27"){//esc descartar los cambios
      this.caneditarcelda2(this.dataSource2[ind].precio,ind)//el primer parametro es el valor de la celda a editar
    }
    else if(event.keyCode.toString()=="13")
    {
      event.target.blur();
    }
    else if(event.keyCode.toString()=="40"){
      this.dataSource2[ind].editar2=0;
      event.target.blur();
      if(ind+1<this.dataSource2.length){
        this.dataSource2[ind+1].editar2=this.dataSource2[ind+1].indice==null?0:1;
      }
    }
    else if(event.keyCode.toString()=="38"){
      this.dataSource2[ind].editar2=0;
      event.target.blur();
      if(ind-1>=0){
        this.dataSource2[ind-1].editar2=this.dataSource2[ind-1].indice==null?0:1;
      }
    }
  }

  async EnviarSol(){
    try{
      if(!this.formSoli.invalid){
        let detcor=0;
        for(let row of this.dataSource2){
          if(Number(row.precio>0)){
            detcor++
          }
        }
        if(detcor==this.dataSource2.length){//Number(this.tabtotal)>0
          this.mostrar_carga_todo=true;
          let monto1=this.nroprov==1?Number(this.tabtotal):Number(this.dataprov[0].monto1)
          let monto2=this.nroprov==2?Number(this.tabtotal):Number(this.dataprov[0].monto2)
          let monto3=this.nroprov==3?Number(this.tabtotal):Number(this.dataprov[0].monto3)
          monto1=monto1==0?Number.MAX_VALUE:monto1;
          monto2=monto2==0?Number.MAX_VALUE:monto2;
          monto3=monto3==0?Number.MAX_VALUE:monto3;
          let gana=monto1<monto2?(monto1<monto3?1:3):(monto2<monto3?2:3);
          const datos1 = JSON.stringify(this.dataSource2);
          let objpasa={
            id_proyecto:this.id_proyecto,
            id_registro:this.id_registro,
            idgrupo:this.idgrupo,
            nroprov:this.nroprov,
            plazoate:this.plazo.value,
            monto:this.tabtotal,
            duracionofer:this.oferta.value,
            lugar:this.lugar.value?.toUpperCase(),
            ganador:gana,
            datos1:datos1,
          }
          let res=await this._logisticaService.GuardarRespuestaSoli(objpasa);
          if(res.id==1)
          {
            this.mostrar_carga_todo=false;
            await SwalService.success('Correcto','La solicitud se envió correctamente. Haga clic en aceptar, se cerrara la ventana.')
            // window.location.href = 'https://www.google.com';
            this.router.navigate(['/'])
          }
          else
          {
            this.mostrar_carga_todo=false;
            SwalService.error('Advertencia','No se pudo realizar la Operación. '+res.mensaje);
          }
        }
        else{
          this.toaster.error('Existen insumos con precio 0. Edite los precios de todos los insumos.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
        }
      }
      else{
        this.toaster.error('Debe llenar la información obligatoria.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      }
    }catch(e){
      this.mostrar_carga_todo=false;
    }
  }
}
