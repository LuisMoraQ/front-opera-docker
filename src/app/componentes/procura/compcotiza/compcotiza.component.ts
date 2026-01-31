import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { LogisticaService } from 'src/app/servicios/logistica.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import * as moment from 'moment';

@Component({
  selector: 'app-compcotiza',
  templateUrl: './compcotiza.component.html',
  styleUrls: ['./compcotiza.component.scss']
})
export class CompcotizaComponent implements OnInit {
  @Input() filareg:any
  @Input() decproy:any
  solover=false
  id_reg:any
  id_proyecto:any
  //dec_precio=2;
  mask_precio='0.2';
  dec_parcial=2;
  mask_parcial='0.2';
  //dec_cant=4;
  mask_cant='0.4';
  simbolo=''
  mostrar_carga_todo=false;
  iduser:any
  uidadmin:any
  rowver=null
  puedecanc=-1//si es 1,2,3 es decir que se puede cancelar esa solicitud(solo muestra boton del aprobado)

  buscando=false
  dataSource=[]
  fila_sel=-1
  paddingscroll=0
  paddingscroll2=0
  tab6total:any
  presel:any

  //datos visor solicitud
  formSoli = new FormGroup({
    razon1: new FormControl(''),
    ruc1: new FormControl(''),
    telefono1: new FormControl(''),
    correo1:new FormControl(''),
    direccion1:new FormControl(''),
    actividad1:new FormControl(''),
    contacto1:new FormControl(''),
    fecha1:new FormControl(''),
    plazo1:new FormControl(''),
    estado1:new FormControl(''),
    
    razon2: new FormControl(''),
    ruc2: new FormControl(''),
    telefono2: new FormControl(''),
    correo2:new FormControl(''),
    direccion2:new FormControl(''),
    actividad2:new FormControl(''),
    contacto2:new FormControl(''),
    fecha2:new FormControl(''),
    plazo2:new FormControl(''),
    estado2:new FormControl(''),

    razon3: new FormControl(''),
    ruc3: new FormControl(''),
    telefono3: new FormControl(''),
    correo3:new FormControl(''),
    direccion3:new FormControl(''),
    actividad3:new FormControl(''),
    contacto3:new FormControl(''),
    fecha3:new FormControl(''),
    plazo3:new FormControl(''),
    estado3:new FormControl(''),
  })
  get razon1(): FormControl { return this.formSoli.get('razon1') as FormControl }
  get ruc1(): FormControl { return this.formSoli.get('ruc1') as FormControl }
  get telefono1(): FormControl { return this.formSoli.get('telefono1') as FormControl }
  get correo1(): FormControl { return this.formSoli.get('correo1') as FormControl }
  get direccion1(): FormControl { return this.formSoli.get('direccion1') as FormControl }
  get actividad1(): FormControl { return this.formSoli.get('actividad1') as FormControl }
  get contacto1(): FormControl { return this.formSoli.get('contacto1') as FormControl }
  get fecha1(): FormControl { return this.formSoli.get('fecha1') as FormControl }
  get plazo1(): FormControl { return this.formSoli.get('plazo1') as FormControl }
  get estado1(): FormControl { return this.formSoli.get('estado1') as FormControl }
  get razon2(): FormControl { return this.formSoli.get('razon2') as FormControl }
  get ruc2(): FormControl { return this.formSoli.get('ruc2') as FormControl }
  get telefono2(): FormControl { return this.formSoli.get('telefono2') as FormControl }
  get correo2(): FormControl { return this.formSoli.get('correo2') as FormControl }
  get direccion2(): FormControl { return this.formSoli.get('direccion2') as FormControl }
  get actividad2(): FormControl { return this.formSoli.get('actividad2') as FormControl }
  get contacto2(): FormControl { return this.formSoli.get('contacto2') as FormControl }
  get fecha2(): FormControl { return this.formSoli.get('fecha2') as FormControl }
  get plazo2(): FormControl { return this.formSoli.get('plazo2') as FormControl }
  get estado2(): FormControl { return this.formSoli.get('estado2') as FormControl }
  get razon3(): FormControl { return this.formSoli.get('razon3') as FormControl }
  get ruc3(): FormControl { return this.formSoli.get('ruc3') as FormControl }
  get telefono3(): FormControl { return this.formSoli.get('telefono3') as FormControl }
  get correo3(): FormControl { return this.formSoli.get('correo3') as FormControl }
  get direccion3(): FormControl { return this.formSoli.get('direccion3') as FormControl }
  get actividad3(): FormControl { return this.formSoli.get('actividad3') as FormControl }
  get contacto3(): FormControl { return this.formSoli.get('contacto3') as FormControl }
  get fecha3(): FormControl { return this.formSoli.get('fecha3') as FormControl }
  get plazo3(): FormControl { return this.formSoli.get('plazo3') as FormControl }
  get estado3(): FormControl { return this.formSoli.get('estado3') as FormControl }

  constructor(
    private _logisticaService:LogisticaService,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService,
    public formService: FormsService,
  ) { }

  async ngOnInit() {
    this.iduser = this.encriptadorService.recuperarlocalstory('idusuario');
    this.uidadmin = this.encriptadorService.recuperarlocalstory('id_admin');
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
    this.formSoli.disable()
    await this.listar();
  }
  async listar(){
    this.buscando=true;
    let res=await this._logisticaService.ListarAgruadquisol({id_proyecto:this.id_proyecto,id_registro:this.id_reg,id_usuario:this.uidadmin});
    this.buscando=false;
    console.log(res)
    if(res?.length>0){
      let arraux=[...res[0],...res[1]]
      const arrfinal = [...arraux].sort((a, b) => {
        if (a.idgrupo < b.idgrupo) {
          return -1;
        }
        if (a.orden > b.orden) {
          return 1;
        }
      });
      for(let row of arrfinal){
        row.mostrar=1
        row.icomost=1
      }
      this.dataSource=arrfinal
      //this.detalledisgre=res[1]
    }
    else{
      this.toaster.error('No se pudo cargar la información.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 });
    }
  }

  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }

  VerProvs(row){
    this.rowver=row
    console.log(this.rowver)
    this.presel=row.nroprov
    this.ruc1.setValue(row.ruc1)
    this.razon1.setValue(row.razon1)
    this.telefono1.setValue(row.telefono1)
    this.correo1.setValue(row.correo1)
    this.direccion1.setValue(row.direccion1)
    this.actividad1.setValue(row.actividad1)
    this.contacto1.setValue(row.representante1)
    this.fecha1.setValue(row.fecha_sol1)
    this.plazo1.setValue(row.plazo1)
    this.estado1.setValue(row.fecha_resp1?'Atendido':'Pendiente')
    this.razon2.setValue(row.razon2)
    this.ruc2.setValue(row.ruc2)
    this.telefono2.setValue(row.telefono2)
    this.correo2.setValue(row.correo2)
    this.direccion2.setValue(row.direccion2)
    this.actividad2.setValue(row.actividad2)
    this.contacto2.setValue(row.representante2)
    this.fecha2.setValue(row.fecha_sol2)
    this.plazo2.setValue(row.plazo2)
    this.estado2.setValue(row.fecha_resp2?'Atendido':'Pendiente')
    this.razon3.setValue(row.razon3)
    this.ruc3.setValue(row.ruc3)
    this.telefono3.setValue(row.telefono3)
    this.correo3.setValue(row.correo3)
    this.direccion3.setValue(row.direccion3)
    this.actividad3.setValue(row.actividad3)
    this.contacto3.setValue(row.representante3)
    this.fecha3.setValue(row.fecha_sol3)
    this.plazo3.setValue(row.plazo3)
    this.estado3.setValue(row.fecha_resp3?'Atendido':'Pendiente')
    //cargar condicionales de ver cancelar verificar fechas fecha_gana,plazo_gana
    // if(row.fecha_gana){
    //   let fhoy=moment(new Date()).format('YYYY-MM-DD')//cambiar con servidor si es necesario
    //   let fechaana1=new Date(moment(fhoy).format('YYYY-MM-DD')+' 09:00:00');
    //   let fechaa = moment(fechaana1);
    //   let fechana=new Date(moment(row.fecha_gana).format('YYYY-MM-DD')+' 09:00:00');
    //   fechana.setDate(fechana.getDate()+Number(row.plazo_gana))
    //   let fechab = moment(fechana);
    //   let difdias=(fechab.diff(fechaa, 'days'));
    //   if(difdias<0){
    //     this.puedecanc=row.nroprov
    //   }
    // }
    this.puedecanc=row.nroprov
  }
  toggleOn(tipo: any) {
    for (let row of this.dataSource) {
      if (row.idgrupo == tipo) {
        if (row.idfila != 0) {
          row.mostrar = 1;
        } else row.icomost = 1;
      }
    }
  }
  toggleOff(tipo: any) {
    for (let row of this.dataSource) {
      if (row.idgrupo == tipo) {
        if (row.idfila != 0) {
          row.mostrar = 0;
        } else row.icomost = 0;
      }
    }
  }
  async Cancelar(nroprov:any){
    try{
      const sw = await SwalService.confirm('Estas seguro que desea Cancelar la Orden de Servicio?', '')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo=true;
        let res=await this._logisticaService.DesAprobarCotizacion({id_proyecto:this.id_proyecto,id_registro:this.rowver.id_registro,idgrupo:this.rowver.idgrupo,idfila:this.rowver.idfila});
        if(res.id==1)
        {
          await this.listar();
          this.mostrar_carga_todo=false;
          await SwalService.success('Correcto',res.mensaje)
        }
        else
        {
          this.mostrar_carga_todo=false;
          SwalService.error('Advertencia','No se pudo realizar la Operación. '+res.mensaje);
        }
      }
    }catch(e){
      this.mostrar_carga_todo=false
      console.log(e)
    }
  }
  async Aprobar(nroprov:any){
    try{
      const sw = await SwalService.confirm('Estas seguro que desea Aprobar la Orden de Servicio?', '')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo=true;
        let datapasa=[]
        for(let row of this.dataSource){
          if(row.idgrupo==this.rowver.idgrupo && row.idfila!=0){
            let preciop=nroprov==1?row.preciosol1:nroprov==2?row.preciosol2:row.preciosol3;
            let parcialp=this.formService.redondeo(Number(preciop)*Number(row.cantidad),this.dec_parcial)
            let newrow={
              id_proyecto:row.id_proyecto,
              id_registro:row.id_registro,
              idgrupo:row.idgrupo,
              idfila:row.idfila,
              indrep:row.indrep,
              precio:preciop,
              parcial:parcialp
            }
            datapasa.push(newrow)
          }
        }
        //generar reporte y pasar al backend

        const datos1 = JSON.stringify(datapasa);
        let objpasa={
          id_proyecto:this.id_proyecto,
          id_registro:this.rowver.id_registro,
          idgrupo:this.rowver.idgrupo,
          idfila:this.rowver.idfila,
          nroprov:nroprov,
          plazoate:nroprov==1?this.rowver.plazo1:nroprov==2?this.rowver.plazo2:this.rowver.plazo3,
          parcial:nroprov==1?this.rowver.monto1:nroprov==2?this.rowver.monto2:this.rowver.monto3,
          datos1:datos1,
        }
        let res=await this._logisticaService.AprobarCotizacion(objpasa);
        if(res.id==1)
        {
          await this.listar();
          this.mostrar_carga_todo=false;
          await SwalService.success('Correcto',res.mensaje)
        }
        else
        {
          this.mostrar_carga_todo=false;
          SwalService.error('Advertencia','No se pudo realizar la Operación. '+res.mensaje);
        }
      }
    }catch(e){
      this.mostrar_carga_todo=false
      console.log(e)
    }
  }
}
