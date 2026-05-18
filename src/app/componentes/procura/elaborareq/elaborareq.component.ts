import { Component, Input, OnInit,ViewChild,HostListener } from '@angular/core';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsService } from 'src/app/servicios/forms.service';
import { SwalService } from 'src/app/servicios/swal.service';
import * as moment from 'moment';
import { PrincipalService } from 'src/app/servicios/principal.service';

@Component({
  selector: 'app-elaborareq',
  templateUrl: './elaborareq.component.html',
  styleUrls: ['./elaborareq.component.scss']
})
export class ElaborareqComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  enviUrl = '';
  solover=false
  id_reg:any
  id_proyecto:any
  iduser:any
  uidadmin:any
  //dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  //dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  mostrar_carga_todo=false;

  dataSource6=[]
  heighttmodal13:any;
  buscando6=false;
  fila6_sel=-1
  estadosel=0
  tipocontra=0
  detalledisgre=[]

  prov1
  prov2
  prov3
  provsel=0//1,2,3
  //modal prov
  @ViewChild("modalListaProv") modalListaProv: ModalBasicComponent;
  @ViewChild("modalProv") modalProv: ModalBasicComponent;
  busqueda = '';
  buscando = false
  dataProv=[]
  fila_sel=-1
  editarp=false;
  fechagana
  nroorden

  formProveedor = new FormGroup({
    idprov: new FormControl(''),
    nrodoc: new FormControl('', [Validators.required, Validators.minLength(11)]),
    nombre_razon: new FormControl('', [Validators.required]),
    telefono: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    direccion: new FormControl('', []),
    representante: new FormControl('', []),
    actividad: new FormControl('', []),
    estado: new FormControl(true, [])
  })

  get idprov(): FormControl { return this.formProveedor.get('idprov') as FormControl }
  get nrodoc(): FormControl { return this.formProveedor.get('nrodoc') as FormControl }
  get nombre_razon(): FormControl { return this.formProveedor.get('nombre_razon') as FormControl }
  get telefono(): FormControl { return this.formProveedor.get('telefono') as FormControl }
  get correo(): FormControl { return this.formProveedor.get('correo') as FormControl }
  get direccion(): FormControl { return this.formProveedor.get('direccion') as FormControl }
  get representante(): FormControl { return this.formProveedor.get('representante') as FormControl }
  get actividad(): FormControl { return this.formProveedor.get('actividad') as FormControl }
  get estado(): FormControl { return this.formProveedor.get('estado') as FormControl }

  //datos visor solicitud
  formSoli = new FormGroup({
    razonsol: new FormControl(''),
    rucsol: new FormControl(''),
    fecharespsol: new FormControl(''),
    direccionsol:new FormControl(''),
    telefonosol:new FormControl(''),
    correosol:new FormControl(''),
    contactosol:new FormControl(''),

    lugarsol:new FormControl('', [Validators.required]),
    plazosol:new FormControl('', [Validators.required]),
    ofertasol:new FormControl('', [Validators.required]),
  })
  get razonsol(): FormControl { return this.formSoli.get('razonsol') as FormControl }
  get rucsol(): FormControl { return this.formSoli.get('rucsol') as FormControl }
  get fecharespsol(): FormControl { return this.formSoli.get('fecharespsol') as FormControl }
  get direccionsol(): FormControl { return this.formSoli.get('direccionsol') as FormControl }
  get telefonosol(): FormControl { return this.formSoli.get('telefonosol') as FormControl }
  get correosol(): FormControl { return this.formSoli.get('correosol') as FormControl }
  get contactosol(): FormControl { return this.formSoli.get('contactosol') as FormControl }
  get lugarsol(): FormControl { return this.formSoli.get('lugarsol') as FormControl }
  get plazosol(): FormControl { return this.formSoli.get('plazosol') as FormControl }
  get ofertasol(): FormControl { return this.formSoli.get('ofertasol') as FormControl }
  datasol=[]
  totalsol
  filasol_sel=-1
  paddingscroll=0
  paddingscroll2=0
  preventscroll=false;
  fechaac:any;
  vence1=false
  vence2=false
  vence3=false
  imagenPreview
  nomempresa

  constructor(
    private _logisticaService:LogisticaService,
    private toaster: ToastrService,
    private encriptadorService: EncriptadorService,
    public formService: FormsService,
    private principalService: PrincipalService,
  ) { }

  async ngOnInit() {
    this.enviUrl = window.location.origin;
    this.formSoli.disable();
    this.iduser = this.encriptadorService.recuperarlocalstory('idusuario');
    this.uidadmin = this.encriptadorService.recuperarlocalstory('id_admin');
    this.heighttmodal13=(window.innerHeight-202)/2;
    this.id_reg=this.filareg.id_registro;
    this.id_proyecto=this.filareg.id_proyecto
    this.simbolo=this.filareg.simbolo
    this.solover=this.filareg.solover
    let decimales = this.decproy;
    if(decimales?.toString().includes('|')){
      let arrdec=decimales.split('|');
      this.mask_precio='0.'+arrdec[1];
      this.dec_parcial=arrdec[2];
      this.mask_parcial='0.'+arrdec[2];
      this.mask_cant='0.'+arrdec[3];
    }
    this.nomempresa=this.filareg.nomemp
    if(this.filareg.imagen){
      this.principalService.obtenerImagenProyecto(this.filareg.imagen).subscribe(
        (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagenPreview = e.target.result;
          };
          reader.readAsDataURL(blob);
        },
        error => console.error('Error al cargar imagen:', error)
      );
    }
    //listar datos
    this.buscando6=true;
    let resfec = await this.encriptadorService.FechaActualBack();
    if (resfec.id == 1) {
      this.fechaac = new Date(resfec.mensaje);
    }
    else{
      this.fechaac=new Date();
    }
    let res=await this._logisticaService.ListarAgruadquisol({id_proyecto:this.id_proyecto,id_registro:this.id_reg,id_usuario:this.uidadmin});
    this.buscando6=false;
    if(res?.length>0){
      this.dataSource6=res[0]
      this.detalledisgre=res[1]
      this.ordenart6()
    }
    else{
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
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
  ordenart6(){//revisar
    try{
      if(this.dataSource6.length>0){//generar otra tabla?
        this.dataSource6.sort(function (a, b) {
          if (Number(a.id_comple?a.id_comple.split('-')[1]:0) > Number(b.id_comple?b.id_comple.split('-')[1]:0)) {
            return 1;
          }
          if (Number(a.id_comple?a.id_comple.split('-')[1]:0) < Number(b.id_comple?b.id_comple.split('-')[1]:0)) {
            return -1;
          }
          return 0;
        });
      }
    }
    catch(error){
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambindicesel6(ind: any) {
    if(ind != this.fila6_sel){
      this.prov1=this.prov2=this.prov3=null;
      this.fila6_sel = ind;
      this.estadosel=this.dataSource6[this.fila6_sel].estado
      this.tipocontra=this.dataSource6[this.fila6_sel].tipocontra
      this.vence1=this.vence2=this.vence3=false;
      //cargar contenido inferior
      let rowsel=this.dataSource6[this.fila6_sel]
      if(rowsel?.id_prov1){
        this.prov1={
          id_prov:rowsel.id_prov1,
          ruc:rowsel.ruc1,
          razon:rowsel.razon1,
          telefono:rowsel.telefono1,
          correo:rowsel.correo1,
          direccion:rowsel.direccion1,
          representante:rowsel.representante1,
          actividad:rowsel.actividad1,
          fecha_sol:rowsel.fecha_sol1,
          plazo:rowsel.plazo1,
          fecha_resp:rowsel.fecha_resp1,
          plazo_ate:rowsel.plazo_ate1,
          monto:rowsel.monto1,
          validez:rowsel.duracionofer1,
          lugar:rowsel.lugar1,
          gana:rowsel.nroprov==1?true:false
        }
        if(rowsel.fecha_sol1 && !rowsel.fecha_resp1){
          let arrfe=rowsel.fecha_sol1.split('-')
          let feac = new Date(Number(arrfe[2]),Number(arrfe[1])-1,Number(arrfe[0]));
          feac.setHours(0, 0, 0,0);
          let ffin=new Date()
          ffin.setDate(feac.getDate()+Number(rowsel.plazo1))
          ffin.setHours(0,0,0,0)
          let fechahoy=this.fechaac
          fechahoy.setHours(0,0,0,0)
          if(ffin<fechahoy)
            this.vence1=true
        }
      }
      if(rowsel?.id_prov2){
        this.prov2={
          id_prov:rowsel.id_prov2,
          ruc:rowsel.ruc2,
          razon:rowsel.razon2,
          telefono:rowsel.telefono2,
          correo:rowsel.correo2,
          direccion:rowsel.direccion2,
          representante:rowsel.representante2,
          actividad:rowsel.actividad2,
          fecha_sol:rowsel.fecha_sol2,
          plazo:rowsel.plazo2,
          fecha_resp:rowsel.fecha_resp2,
          plazo_ate:rowsel.plazo_ate2,
          monto:rowsel.monto2,
          validez:rowsel.duracionofer2,
          lugar:rowsel.lugar2,
          gana:rowsel.nroprov==2?true:false
        }
        if(rowsel.fecha_sol2 && !rowsel.fecha_resp2){
          let arrfe=rowsel.fecha_sol2.split('-')
          let feac = new Date(Number(arrfe[2]),Number(arrfe[1])-1,Number(arrfe[0]));
          feac.setHours(0, 0, 0,0);
          let ffin=new Date()
          ffin.setDate(feac.getDate()+Number(rowsel.plazo2))
          ffin.setHours(0,0,0,0)
          let fechahoy=this.fechaac
          fechahoy.setHours(0,0,0,0)
          if(ffin<fechahoy)
            this.vence2=false
        }
      }
      if(rowsel?.id_prov3){
        this.prov3={
          id_prov:rowsel.id_prov3,
          ruc:rowsel.ruc3,
          razon:rowsel.razon3,
          telefono:rowsel.telefono3,
          correo:rowsel.correo3,
          direccion:rowsel.direccion3,
          representante:rowsel.representante3,
          actividad:rowsel.actividad3,
          fecha_sol:rowsel.fecha_sol3,
          plazo:rowsel.plazo3,
          fecha_resp:rowsel.fecha_resp3,
          plazo_ate:rowsel.plazo_ate3,
          monto:rowsel.monto3,
          validez:rowsel.duracionofer3,
          lugar:rowsel.lugar3,
          gana:rowsel.nroprov==3?true:false
        }
        if(rowsel.fecha_sol3 && !rowsel.fecha_resp3){
          let arrfe=rowsel.fecha_sol3.split('-')
          let feac = new Date(Number(arrfe[2]),Number(arrfe[1])-1,Number(arrfe[0]));
          feac.setHours(0, 0, 0,0);
          let ffin=new Date()
          ffin.setDate(feac.getDate()+Number(rowsel.plazo3))
          ffin.setHours(0,0,0,0)
          let fechahoy=this.fechaac
          fechahoy.setHours(0,0,0,0)
          if(ffin<fechahoy)
            this.vence3=false
        }
      }
    }
    this.Vercoti(0);
  }
  CopiarUrl(nro:any){
    let rowsel=this.dataSource6[this.fila6_sel]
    let plazpas=nro==1?rowsel.plazo1:nro==2?rowsel.plazo2:nro==3?rowsel.plazo3:'';
    let fechanro=nro==1?rowsel.fecha_sol1:nro==2?rowsel.fecha_sol2:nro==3?rowsel.fecha_sol3:'';
    let arrfechasol=fechanro.split('-')
    let idprovpas=nro==1?rowsel.id_prov1:nro==2?rowsel.id_prov2:rowsel.id_prov3;
    let valsol=rowsel.id_proyecto+'!'+rowsel.id_registro+'!'+rowsel.idgrupo+'!'+nro+'!'+arrfechasol[2]+'-'+arrfechasol[1]+'-'+arrfechasol[0]+'!'+plazpas+'!'+idprovpas;
    let encrp=this.encriptadorService.encode64(valsol)
    // let encrp=valsol
    let urlcop=this.enviUrl+'/externo/cotizacion/'+encrp;
    SwalService.input2('Link para llenar la cotización:', urlcop)
  }
  async Enviarcorreo(nro:any){
    const res = await SwalService.inputNumber("Plazo de Vigencia de la Cotización:",'Enviar')
    if (!res.isConfirmed) {
      return
    }
    if (!res.value) {
      return
    }
    if (res.value<=0) {
      this.toaster.error('El plazo no puede ser 0 ó negativo.', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000
      })
      return
    }
    let filaope=nro==1?this.prov1:nro==2?this.prov2:nro==3?this.prov3:null;
    if(filaope){
      let hoy = new Date();
      filaope.fecha_sol=moment(hoy).format('DD-MM-YYYY');
      // cuantos dias de vigencia habra?
      this.mostrar_carga_todo=true;
      let rowsel=this.dataSource6[this.fila6_sel]
      //id_proyecto,id_registro,id_grupo,nroprov,fecha,plazo,idprov
      let idprovpas=nro==1?rowsel.id_prov1:nro==2?rowsel.id_prov2:rowsel.id_prov3;
      let valsol=rowsel.id_proyecto+'!'+rowsel.id_registro+'!'+rowsel.idgrupo+'!'+nro+'!'+moment(this.fechaac).format('YYYY-MM-DD')+'!'+res.value+'!'+idprovpas;
      let encrp=this.encriptadorService.encode64(valsol)
      // let encrp=valsol
      const respuesta =await this._logisticaService.AdquisolEnviarSol({id_proyecto:rowsel.id_proyecto,id_registro:rowsel.id_registro,idgrupo:rowsel.idgrupo,idfila:rowsel.idfila,
        destinatario:filaope.correo,razon:filaope.razon,link:(this.enviUrl+'/externo/cotizacion/'+encrp),plazo:res.value, nroprov:nro,agrupacion:rowsel.descripcion,nomempresa:this.filareg.nomemp});
      if (respuesta?.id == "0") {
        SwalService.error('Advertencia', respuesta.mensaje);
      }
      else {
        if(nro==1){
          this.dataSource6[this.fila6_sel].fecha_sol1=filaope.fecha_sol
          this.dataSource6[this.fila6_sel].plazo1=res.value
          this.dataSource6[this.fila6_sel].estado=3
        }
        else if(nro==2){
          this.dataSource6[this.fila6_sel].fecha_sol2=filaope.fecha_sol
          this.dataSource6[this.fila6_sel].plazo2=res.value
          this.dataSource6[this.fila6_sel].estado=3
        }
        else if(nro==3){
          this.dataSource6[this.fila6_sel].fecha_sol3=filaope.fecha_sol
          this.dataSource6[this.fila6_sel].plazo3=res.value
          this.dataSource6[this.fila6_sel].estado=3
        }
        
        SwalService.success('Correcto',respuesta?.mensaje)
      }
      this.mostrar_carga_todo=false
    }
    else{
      this.toaster.error('No existen datos del proveedor para enviar.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }
  Vercoti(nro:any){
    let filaope=nro==1?this.prov1:nro==2?this.prov2:nro==3?this.prov3:null;
    if(filaope){
      this.rucsol.setValue(filaope.ruc);
      this.razonsol.setValue(filaope.razon);
      this.direccionsol.setValue(filaope.direccion);
      this.telefonosol.setValue(filaope.telefono);
      this.correosol.setValue(filaope.correo);
      this.contactosol.setValue(filaope.contacto);
      this.fecharespsol.setValue(filaope.fecha_resp)
      this.lugarsol.setValue(filaope.lugar)
      this.plazosol.setValue(filaope.plazo_ate)
      this.ofertasol.setValue(filaope.validez)
      this.totalsol=filaope.monto
      //cargar tabla
      this.datasol=[]
      let rowsel=this.dataSource6[this.fila6_sel]
      if(rowsel.nroprov==nro){
        this.fechagana=rowsel.fecha_gana
        this.nroorden=rowsel.nro_orden
      }
      else{
        this.fechagana=null
        this.nroorden=null
      }
      for(let row of this.detalledisgre){
        if(row.idgrupo==rowsel.idgrupo){
          let precpas=nro==1?row.preciosol1:nro==2?row.preciosol2:nro==3?row.preciosol3:null;
          let marcpas=nro==1?row.marca1:nro==2?row.marca2:nro==3?row.marca3:null;
          let parcpas=Number(precpas)*Number(row.cantidad)
          let rowadd={
            descripcion:row.descripcion,
            unidad:row.unidad,
            cantidad:row.cantidad,
            marca:marcpas,
            precio:precpas,
            parcial:this.formService.redondeo(parcpas,this.dec_parcial),
          }
          this.datasol.push(rowadd)
        }
      }
    }
    else{
      this.rucsol.setValue('');
      this.razonsol.setValue('');
      this.direccionsol.setValue('');
      this.telefonosol.setValue('');
      this.correosol.setValue('');
      this.contactosol.setValue('');
      this.fecharespsol.setValue('')
      this.lugarsol.setValue('')
      this.plazosol.setValue('')
      this.ofertasol.setValue('')
      this.datasol=[]
      this.fechagana=null
      this.nroorden=null
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
  cambindiceselSol(ind: any) {
    if (ind == this.filasol_sel)
      this.filasol_sel = -1;
    else
      this.filasol_sel = ind;
  }
  //proveedores
  async Addprov(nro:any){
    this.provsel=nro;
    this.modalListaProv.show();
    await this.listarProveedores()
  }
  async Limpprov(nro:any){
    if(nro==1)
      this.prov1=null;
    else if(nro==2)
      this.prov2=null;
    else if(nro==3)
      this.prov3=null;
    //eliminar asignacion
    let rowsel=this.dataSource6[this.fila6_sel]
    this.mostrar_carga_todo=true;
    await this._logisticaService.AdquisolEliminaProv({id_proyecto:rowsel.id_proyecto,id_registro:rowsel.id_registro,idgrupo:rowsel.idgrupo,idfila:rowsel.idfila, nroprov:nro});
    if(nro==1){
      this.dataSource6[this.fila6_sel].actividad1=
      this.dataSource6[this.fila6_sel].correo1=
      this.dataSource6[this.fila6_sel].direccion1=
      this.dataSource6[this.fila6_sel].id_prov1=
      this.dataSource6[this.fila6_sel].razon1=
      this.dataSource6[this.fila6_sel].representante1=
      this.dataSource6[this.fila6_sel].ruc1=
      this.dataSource6[this.fila6_sel].telefono1=null;
    }
    else if(nro==2){
      this.dataSource6[this.fila6_sel].actividad2=
      this.dataSource6[this.fila6_sel].correo2=
      this.dataSource6[this.fila6_sel].direccion2=
      this.dataSource6[this.fila6_sel].id_prov2=
      this.dataSource6[this.fila6_sel].razon2=
      this.dataSource6[this.fila6_sel].representante2=
      this.dataSource6[this.fila6_sel].ruc2=
      this.dataSource6[this.fila6_sel].telefono2=null;
    }
    else if(nro==3){
      this.dataSource6[this.fila6_sel].actividad3=
      this.dataSource6[this.fila6_sel].correo3=
      this.dataSource6[this.fila6_sel].direccion3=
      this.dataSource6[this.fila6_sel].id_prov3=
      this.dataSource6[this.fila6_sel].razon3=
      this.dataSource6[this.fila6_sel].representante3=
      this.dataSource6[this.fila6_sel].ruc3=
      this.dataSource6[this.fila6_sel].telefono3=null;
    }
    this.mostrar_carga_todo=false;
  }
  //modal prove
  closeModal1(){
    this.modalListaProv.hide();
  }
  async seleccionarprov(row=null){
    if (this.fila_sel>=0 || row) {
      let filap=row??this.dataProv[this.fila_sel];
      let provasig={
        id_prov:filap.id_prov,
        ruc:filap.ruc,
        razon:filap.razon,
        telefono:filap.telefono,
        correo:filap.correo,
        direccion:filap.direccion,
        representante:filap.representante,
        actividad:filap.actividad,
        fecha_sol:null,
        plazo:null,
        fecha_resp:null,
        plazo_ate:null,
        monto:null
      }
      if(this.provsel==1)
        this.prov1=provasig;
      else if(this.provsel==2)
        this.prov2=provasig;
      else if(this.provsel==3)
        this.prov3=provasig;
      this.closeModal1()
      //guardar asignacion
      this.mostrar_carga_todo=true;
      let rowsel=this.dataSource6[this.fila6_sel]
      await this._logisticaService.AdquisolAsignaProv({id_proyecto:rowsel.id_proyecto,id_registro:rowsel.id_registro,idgrupo:rowsel.idgrupo,idfila:rowsel.idfila,idprov:filap.id_prov, nroprov:this.provsel});
      //asignar valores a la fila
      if(this.provsel==1){
        this.dataSource6[this.fila6_sel].actividad1=filap.actividad
        this.dataSource6[this.fila6_sel].correo1=filap.correo
        this.dataSource6[this.fila6_sel].direccion1=filap.direccion
        this.dataSource6[this.fila6_sel].id_prov1=filap.id_prov
        this.dataSource6[this.fila6_sel].razon1=filap.razon
        this.dataSource6[this.fila6_sel].representante1=filap.representante
        this.dataSource6[this.fila6_sel].ruc1=filap.ruc
        this.dataSource6[this.fila6_sel].telefono1=filap.telefono
      }
      else if(this.provsel==2){
        this.dataSource6[this.fila6_sel].actividad2=filap.actividad
        this.dataSource6[this.fila6_sel].correo2=filap.correo
        this.dataSource6[this.fila6_sel].direccion2=filap.direccion
        this.dataSource6[this.fila6_sel].id_prov2=filap.id_prov
        this.dataSource6[this.fila6_sel].razon2=filap.razon
        this.dataSource6[this.fila6_sel].representante2=filap.representante
        this.dataSource6[this.fila6_sel].ruc2=filap.ruc
        this.dataSource6[this.fila6_sel].telefono2=filap.telefono
      }
      else if(this.provsel==3){
        this.dataSource6[this.fila6_sel].actividad3=filap.actividad
        this.dataSource6[this.fila6_sel].correo3=filap.correo
        this.dataSource6[this.fila6_sel].direccion3=filap.direccion
        this.dataSource6[this.fila6_sel].id_prov3=filap.id_prov
        this.dataSource6[this.fila6_sel].razon3=filap.razon
        this.dataSource6[this.fila6_sel].representante3=filap.representante
        this.dataSource6[this.fila6_sel].ruc3=filap.ruc
        this.dataSource6[this.fila6_sel].telefono3=filap.telefono
      }
      this.mostrar_carga_todo=false
    } else {
      this.toaster.error('Seleccione un proveedor para continuar.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }
  openNuevo(){
    this.modalProv.show();
  }
  limpiarfiltro() {
    this.busqueda = '';
  }
  async listarProveedores() {
    this.buscando = true;
    this.dataProv = [];
    let tablaaux=await this._logisticaService.ListarProveedores({id_usuario:this.uidadmin});
    this.dataProv = tablaaux;
    this.buscando = false;
  }
  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }
  EditarProv(row:any){
    this.editarp=true;
    this.formProveedor.reset({
      idprov: row.id_prov,
      nrodoc: row.ruc,
      nombre_razon: row.razon,
      telefono: row.telefono,
      correo: row.correo,
      direccion: row.direccion,
      representante: row.representante,
      actividad: row.actividad,
      estado: row.estado==1 ? true : false,
    })
    this.modalProv.show();
  }
  async EliminarProv(row){
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminará el proveedor  seleccionado.')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const respuesta = await this._logisticaService.EliminarProveedor({id_usuario:this.uidadmin,id_prov:row.id_prov})
        this.mostrar_carga_todo = false;
        if (respuesta[0]?.id == "0") {
          SwalService.error('Advertencia', respuesta[0].mensaje);
          this.closeModal2();
        }
        else {
          SwalService.success('Correcto',respuesta[0]?.mensaje)
          this.closeModal2(true);
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
  closeModal2(listar=false){
    //limpiar parametros
    this.formProveedor.reset({
      idprov: '',
      nrodoc: '',
      nombre_razon: '',
      telefono: '',
      correo: '',
      direccion: '',
      representante: '',
      actividad: '',
      estado: true
    })
    this.editarp=false
    this.modalProv.hide();
    if(listar){
      this.listarProveedores();
    }
  }
  async GuardarProv(){
    try {
      if (this.formProveedor.invalid) {
        this.formProveedor.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        return
      } else {
        const input = {
          id_usuario: this.uidadmin,
          id_prov: this.editarp?this.idprov.value:null,
          ruc: this.nrodoc.value,
          razon: (this.nombre_razon.value).toUpperCase().trim(),
          telefono: this.telefono.value,
          correo: this.correo.value,
          direccion: this.direccion.value?.toUpperCase(),
          representante: this.representante.value?.toUpperCase(),
          actividad: this.actividad.value?.toUpperCase().trim(),
          estado: this.estado.value ? 1 : 0,
        }
        if (this.editarp) {
          this.mostrar_carga_todo = true
          const response = await this._logisticaService.ModificarProveedor(input)
          this.mostrar_carga_todo = false
          if (response[0]?.id == "1") {
            SwalService.success('Correcto',response[0].mensaje)
            this.closeModal2(true);
          } else {
            SwalService.error('Advertencia', response[0].mensaje)
          }
        } else {
          this.mostrar_carga_todo = true
          const response = await this._logisticaService.GuardarProveedor(input)
          this.mostrar_carga_todo = false
          if (response[0]?.id == "1") {
            SwalService.success('Correcto',response[0].mensaje)
            this.closeModal2(true);
          } else {
            SwalService.error('Advertencia', response[0].mensaje)
          }
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  async cambiaPresel(nro:any){
    try {
      this.mostrar_carga_todo = true;
      this.prov1.gana=nro==1?true:false;
      this.prov2.gana=nro==2?true:false;
      this.prov3.gana=nro==3?true:false;
      this.dataSource6[this.fila6_sel].nroprov=nro
      let rowsel=this.dataSource6[this.fila6_sel]
      const respuesta = await this._logisticaService.adquiCambiarPreseleccion({id_proyecto:rowsel.id_proyecto,id_registro:rowsel.id_registro,idgrupo:rowsel.idgrupo,idfila:rowsel.idfila, nroprov:nro});
      this.mostrar_carga_todo = false;
      if (respuesta[0]?.id == "0") {
        SwalService.error('Advertencia', respuesta[0].mensaje);
        this.closeModal2();
      }
      else {
        SwalService.success('Correcto',respuesta[0]?.mensaje)
        this.closeModal2(true);
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
  async CancelaCoti(nro:any){
    if(nro==1)
      this.prov1=null;
    else if(nro==2)
      this.prov2=null;
    else if(nro==3)
      this.prov3=null;
    //eliminar asignacion
    let rowsel=this.dataSource6[this.fila6_sel]
    let fsol1=nro==1?null:rowsel.fecha_sol1
    let fsol2=nro==2?null:rowsel.fecha_sol2
    let fsol3=nro==3?null:rowsel.fecha_sol3
    let actuaestp=fsol1==null && fsol2==null && fsol3==null?1:0;
    this.mostrar_carga_todo=true;
    let resp=await this._logisticaService.AdquisolCancelaSol({id_proyecto:rowsel.id_proyecto,id_registro:rowsel.id_registro,idgrupo:rowsel.idgrupo,idfila:rowsel.idfila, nroprov:nro,actuaest:actuaestp});
    if(resp?.length>0){
      if(nro==1){
        this.dataSource6[this.fila6_sel].actividad1=
        this.dataSource6[this.fila6_sel].correo1=
        this.dataSource6[this.fila6_sel].direccion1=
        this.dataSource6[this.fila6_sel].id_prov1=
        this.dataSource6[this.fila6_sel].razon1=
        this.dataSource6[this.fila6_sel].representante1=
        this.dataSource6[this.fila6_sel].ruc1=
        this.dataSource6[this.fila6_sel].telefono1=
        this.dataSource6[this.fila6_sel].fecha_sol1=
        this.dataSource6[this.fila6_sel].plazo1=null;
        this.vence1=false;
      }
      else if(nro==2){
        this.dataSource6[this.fila6_sel].actividad2=
        this.dataSource6[this.fila6_sel].correo2=
        this.dataSource6[this.fila6_sel].direccion2=
        this.dataSource6[this.fila6_sel].id_prov2=
        this.dataSource6[this.fila6_sel].razon2=
        this.dataSource6[this.fila6_sel].representante2=
        this.dataSource6[this.fila6_sel].ruc2=
        this.dataSource6[this.fila6_sel].telefono2=
        this.dataSource6[this.fila6_sel].fecha_sol2=
        this.dataSource6[this.fila6_sel].plazo2=null;
        this.vence2=false;
      }
      else if(nro==3){
        this.dataSource6[this.fila6_sel].actividad3=
        this.dataSource6[this.fila6_sel].correo3=
        this.dataSource6[this.fila6_sel].direccion3=
        this.dataSource6[this.fila6_sel].id_prov3=
        this.dataSource6[this.fila6_sel].razon3=
        this.dataSource6[this.fila6_sel].representante3=
        this.dataSource6[this.fila6_sel].ruc3=
        this.dataSource6[this.fila6_sel].telefono3=
        this.dataSource6[this.fila6_sel].fecha_sol3=
        this.dataSource6[this.fila6_sel].plazo3=null;
        this.vence3=false;
      }
      if(actuaestp){
        this.dataSource6[this.fila6_sel].estado=1;
      }
      SwalService.success('Correcto',resp[0]?.mensaje)
    }
    else{
      SwalService.error('Advertencia', resp[0].mensaje);
    }
    this.mostrar_carga_todo=false;
  }
  async Cambioest(ind:any){
    if(!(this.dataSource6[ind].tipocontra==1 || this.dataSource6[ind].tipocontra==2 || this.dataSource6[ind].tipocontra==4)){
      this.toaster.error('No se puede cambiar de estado por el Tipo de Contratación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
      return;
    }
    const respu = await SwalService.confirm('Esta seguro que desea Cambiar a Estado Borrador?', '');
    if (respu.isConfirmed) {
      this.mostrar_carga_todo=true;
      let res=await this._logisticaService.AgruinsModReqaBorrador({id_proyecto:this.id_proyecto,id_registro:this.dataSource6[ind].id_registro,idgrupo:this.dataSource6[ind].idgrupo});
      if(res[0]?.id=="1"){
        this.dataSource6[ind].estado=0;
        this.dataSource6[ind].plazo_ate=null;
        this.dataSource6[ind].nroprov=null;
        this.dataSource6[ind].parcialsol=null;
        this.mostrar_carga_todo=false;
        SwalService.success('Correcto',res[0]?.mensaje)
      }
      else{
        SwalService.error('Advertencia', 'No se pudo realizar la acción.');
      }
    }
  }
}
