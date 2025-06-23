import { Component, OnInit, Input, HostListener } from '@angular/core';
import { SwalService } from './../../../../servicios/swal.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { BuscaaddunidadmedComponent } from 'src/app/componentes/catalogos/unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { FormsService } from 'src/app/servicios/forms.service';

export interface rowpresu {
  //id_proyecto: any;
  indice:any;
  item: string;
  descripcion: any;
  id_unidad:any;//consultar en bd?
  unidad: any;
  cantidad: any;
  precio: any;
  parcial: any;
  rendimiento: any;//1
  und_rendi: any;//DIA
  jornada: any;//8
  referencia:any;//null
  id_partida:any;//null
  advceros: any;
  tipofila: any;//0 titulo, 1 subtitulo, 2 fila
  itemord:any; //calcular
  vinculo:any;//null
  responsable:any;//id_usuario
  colorvin:any;//null
  ed_pre:any;//1
  tieneacu:any;
}
export interface rowdeta {
  //id_proyecto: any;
  indice:any;
  id_filadetalle: string;
  id_tipo_insumo:string;
  num_det:string;
  codigo:string;
  descripcion: any;
  id_unidad:any;//consultar en bd?
  unidad: any;
  cuadrilla:any;
  cantidad: any;
  precio: any;
  parcial: any;
  id_indice:any;//indice unificado
  id_clasificacion:string;//es del sistema, null
  id_insumo: any;//null, asignar al buscar en catalogos
  indice_subp:any;//null
  esinsumo: any;
  afcuadrilla: any;//MO,EQ = 1
  rendimiento:any; //solo para subpartidas
  und_rendi:any;//solo para subpartidas
  jornada:any;//null,subpartida
  advceros:any;//por defecto 0?
  referencia:any;//null
  tieneacu:any;
}
export interface filatablaselcol1 {
  item:string;
  descripcion:string;
  unidad: string;
  cantidad: string;
  precio:string;
  parcial:string;
}
export interface filaarch {
  arcexcel:XLSX.WorkBook;
  nombre:string;
  //hojasel:string;
  hojas:pestana[];
}
export interface pestana {
  nombre:string;
  selec:string;
}
@Component({
  selector: 'app-modalimportaproy',
  templateUrl: './modalimportaproy.component.html',
  styleUrls: ['./modalimportaproy.component.scss'],
})
export class ModalimportaproyComponent implements OnInit {
  @Input('height')  heighttmodal2: number=100;
  @Input('height')  heighttm: number=100;
  @Input() idUsuario = null
  @Input() idProyecto = null
  @Input() dec_metrado = null
  @Input() dec_precio = null
  @Input() dec_parcial = null
  @Input() dec_cant = null
  @Input() tindices = [];
  mostrar_carga_todo = false;
  activetab = 1
  activetab2 = 11
  mostrarund=false;

  public Frmdecimales = new UntypedFormGroup({
    metrado:new UntypedFormControl('4'),
    precio: new UntypedFormControl('2'),
    parcial: new UntypedFormControl('2'),
    cantidad: new UntypedFormControl('4'),
  });
  get frmdecmetrado(): UntypedFormControl { return this.Frmdecimales.get('metrado') as UntypedFormControl }
  get frmdecprecio(): UntypedFormControl { return this.Frmdecimales.get('precio') as UntypedFormControl }
  get frmdecparcial(): UntypedFormControl { return this.Frmdecimales.get('parcial') as UntypedFormControl }
  get frmdeccant(): UntypedFormControl { return this.Frmdecimales.get('cantidad') as UntypedFormControl }

  opcfuente='1';
  delppresu=[0,2,9,10,12,13];
  s10presu=[1,5,10,12,15,21];
  sispresu=[0,1,2,3,4,5];
  //[partida,item,txrendi,valrendi,undrendi,agrupacion,codigo,descripcion,unidad,cuadrilla,cantidad,precio,parcial,codsubp]
  delpacu=[0,2,13,13,13,0,0,3,10,11,14,15,16,0];
  s10acu=[0,2,0,3,2,3,0,2,5,7,8,9,10,3];
  s10subp=[0,2,0,4,2,4,0,2,5,7,8,9,10,3];
  sisacu=[0,0,0,0,0,1,0,1,2,3,4,5,6,0];//hacer recortes splits necesarios
  indiceadd=1;
  datapresu=[];
  arrpartidas=[];
  datadetalle=[];
  arrsubpart=[];
  datasubp=[];
  arrund=[];
  filaSelund=-1;
  //errores
  errpresu=[];
  erracu=[];
  errsubp=[];
  filaSelobs=-1;

  filapresu:filaarch;
  filasacu:filaarch[]=[];
  filassubp:filaarch[]=[];
  tabladetlimp=[];
  //fin import presu
  arrtipins=['MANO DE OBRA','MATERIALES','EQUIPO','SUBCONTRATOS','SUBPARTIDAS'];
  //avanzado
  confav=false;
  data: [][];
  datadis1=[];
  columnsadd1=[];
  dataselcol=['','','','','',''];
  data2: [][];
  datadis2=[];
  columnsadd2=[];
  dataselcol2=['','','','','','','','','','','','','',''];
  data3: [][];
  datadis3=[];
  columnsadd3=[];
  dataselcol3=['','','','','','','','','','','','','',''];
  exisacu=false;
  exissubp=false;

  constructor(
    public formService: FormsService,
    private modal: NgbActiveModal,
    private presuservice:PresupuestosService,
    private modalService: NgbModal, 
    public activeModal: NgbActiveModal,
    private toaster: ToastrService,
    private catalogosService: CatalogosService,
    private administradorService: AdministradorService,
  ) { }

  async ngOnInit() {
    try {
      this.frmdecmetrado.setValue(this.dec_metrado);
      this.frmdecprecio.setValue(this.dec_precio);
      this.frmdecparcial.setValue(this.dec_parcial);
      this.frmdeccant.setValue(this.dec_cant);
      this.heighttmodal2=(window.innerHeight-400)/2;
      this.heighttm=(window.innerHeight)/2;
    } catch (e) {
      console.log(e);
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.heighttmodal2=(window.innerHeight-400)/2;
    this.heighttm=(window.innerHeight)/2;
    //this.heighttmodal1icor=(window.innerHeight-300)/2;
  }
  async guardar() {
    try {
      if(this.datapresu.length>0){
        // this.mostrar_carga_todo = true;
        // console.time('timeimp')
        // /* console.log(JSON.parse(JSON.stringify(this.datapresu)))
        // console.log(JSON.parse(JSON.stringify(this.datadetalle)))
        // console.log(JSON.parse(JSON.stringify(this.datasubp))) */
        // const tabla1=JSON.stringify(this.datapresu);
        // const tabla2=JSON.stringify(this.datadetalle);
        // const tabla3=JSON.stringify(this.datasubp);
        // const tablaund=JSON.stringify(this.arrund);
        // const dataProyecto=JSON.stringify({
        //   'id_usuario': this.idUsuario,
        //   'id_proyecto': this.idProyecto,
        //   'datos1':tabla1,
        //   'datosund':tablaund,
        // });
        // const resp = await this.presuservice.ImportarPresuP1(dataProyecto)
        // console.log(resp)
        // if (resp.id == "1") {
        //   const dataProyecto2=JSON.stringify({
        //     'id_usuario': this.idUsuario,
        //     'id_proyecto': this.idProyecto,
        //     'datos4':tabla2,
        //     'datosund':tablaund,
        //   });
        //   const resp2 = await this.presuservice.ImportarPresuP2(dataProyecto2)
        //   console.log(resp2)
        //   const dataProyecto3=JSON.stringify({
        //     'id_usuario': this.idUsuario,
        //     'id_proyecto': this.idProyecto,
        //     'datos7':tabla3,
        //     'datosund':tablaund,
        //   });
        //   const resp3 = await this.presuservice.ImportarPresuP3(dataProyecto3)
        //   console.log(resp3)
        //   console.timeEnd('timeimp')
        //   this.mostrar_carga_todo = false;
        //   this.closeModal('ok')
        // }
        // else {
        //   this.mostrar_carga_todo = false;
        //   SwalService.error('Advertencia', resp.mensaje);
        // }
        //verificar numero de enteros?
        //prueba rap
        this.mostrar_carga_todo=true;
        console.time('timeverif')
        for(let row of this.datapresu){
          if(row.cantidad){
            let cantr=row.cantidad.toString();
            if(this.errormaxval(cantr,'Cantidad',10,' Item : '+row.item)){ return }
          }
          if(row.precio){
            let precior=row.precio.toString();
            if(this.errormaxval(precior,'Precio',10,' Item : '+row.item)){ return }
          }
          if(row.parcial){
            let parcr=row.parcial.toString();
            if(this.errormaxval(parcr,'Parcial',15,' Item : '+row.item)){ return }
          }
        }
        for(let row of this.datadetalle){
          if(row.cuadrilla){
            let cuadr=row.cuadrilla.toString();
            if(this.errormaxval(cuadr,'Cuadrilla',10,' En Costos Unitarios.')){ return }
          }
          let cantr=row.cantidad.toString();
          if(this.errormaxval(cantr,'Cantidad',10,' En Costos Unitarios.')){ return }
          let precior=row.precio.toString();
          if(this.errormaxval(precior,'Precio',10,' En Costos Unitarios.')){ return }
          let parcr=row.parcial.toString();
          if(this.errormaxval(parcr,'Parcial',10,' En Costos Unitarios.')){ return }
        }
        for(let row of this.datasubp){
          if(row.cuadrilla){
            let cuadr=row.cuadrilla.toString();
            if(this.errormaxval(cuadr,'Cuadrilla',10,' En Subpartidas.')){ return }
          }
          let cantr=row.cantidad.toString();
          if(this.errormaxval(cantr,'Cantidad',10,' En Subpartidas.')){ return }
          let precior=row.precio.toString();
          if(this.errormaxval(precior,'Precio',10,' En Subpartidas.')){ return }
          let parcr=row.parcial.toString();
          if(this.errormaxval(parcr,'Parcial',10,' En Subpartidas.')){ return }
        }
        console.timeEnd('timeverif')
        console.time('timeimp')
        const tabla1=JSON.stringify(this.datapresu);
        const tabla2=JSON.stringify(this.datadetalle);
        const tabla3=JSON.stringify(this.datasubp);
        const dataProyecto=JSON.stringify({
          'id_usuario': this.idUsuario,
          'id_proyecto': this.idProyecto,
          'datos1':tabla1,
          'datos2':tabla2,
          'datos3':tabla3,
        });
        const resp = await this.presuservice.importaPresuTop(dataProyecto)
        if(resp.id=='0'){
          this.mostrar_carga_todo = false;
          SwalService.error('Advertencia', resp.mensaje);
        }
        console.timeEnd('timeimp')
        this.mostrar_carga_todo=false;
        this.closeModal('ok')
      }
      else{
        this.toaster.error('No se procesaron datos para importar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    } catch (e) {
      this.mostrar_carga_todo = false;
      console.log(e)
      SwalService.error('Advertencia','No se pudo realizar la operacion.')
    }
  }
  closeModal(result: any = null) {
    this.filapresu=null;
    this.filasacu=[];
    this.filassubp=[];
    const fileUpload1=document.getElementById("file1") as HTMLInputElement;
    if(fileUpload1!=null)
    {
      fileUpload1.value=null;
    }
    const fileUpload2=document.getElementById("file2") as HTMLInputElement;
    if(fileUpload2!=null)
    {
      fileUpload2.value=null;
    }
    const fileUpload3=document.getElementById("file3") as HTMLInputElement;
    if(fileUpload3!=null)
    {
      fileUpload3.value=null;
    }
    this.modal.close(result)
  }
  //abrir excel
  onFileChange(evt: any) {
    const target : DataTransfer =  <DataTransfer>(evt.target);
    if (target.files.length > 1) throw new Error('Cannot use multiple files');
    if(target.files.length==1){
      if(target.files[0].type=='application/vnd.ms-excel' || target.files[0].type=='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
        if(this.filapresu?.nombre==target.files[0].name){
          this.toaster.error('El Archivo '+target.files[0].name+' ya fue cargado anteriormente.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        else{
          const reader: FileReader = new FileReader();
          reader.readAsBinaryString(target.files[0]);
          reader.onload = (e: any) => {
            const bstr: string = e.target.result;
            let wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
            const lista = wb.SheetNames;
            let listaTablas = [];
            lista.map((ele) => {
              listaTablas.push({nombre:ele,selec:0});
              if(listaTablas.length==1){
                listaTablas[0].selec=1;
              }
            });
            let filapr:filaarch={
              arcexcel:wb,
              hojas:listaTablas,
              nombre:target.files[0].name
            }
            this.filapresu=filapr;
          };
        }
      }
      else
      {
        this.toaster.error('El Archivo seleccionado no es Hoja de Cálculo.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    }
  }
  Cambiosel1(item:any,verif=0){
    item.selec=item.selec==0?1:0;
    if(verif==1){
      this.exisacu=false;
      for(let filaar of this.filasacu){
        for(let hoja of filaar.hojas){
          if(hoja.selec=='1'){
            this.exisacu=true;
            break;
          }
        }
      }
    }
    else if (verif==2){
      this.exissubp=false;
      for(let filaar of this.filassubp){//cargar subpartidas
        for(let hoja of filaar.hojas){
          if(hoja.selec=='1'){
            this.exissubp=true;
            break;
          }
        }
      }
    }
  }
  onFileChange2(evt: any) {
    const target : DataTransfer =  <DataTransfer>(evt.target);
    //if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    if(target.files.length>0){
      for(let a=0;a<target.files.length;a++){
        if(target.files[a].type=='application/vnd.ms-excel' || target.files[a].type=='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          let existe=this.filasacu.find(ele => ele.nombre==target.files[a].name);
          if(!existe){
            const reader: FileReader = new FileReader();
            reader.onload = (e: any) => {
              const bstr: string = e.target.result;
              let wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
              const lista = wb.SheetNames;
              let listaTablas = [];
              let sel=1;
              lista.map((ele) => {
                listaTablas.push({nombre:ele,selec:sel});
                sel=0;
              });
              let filapr:filaarch={
                arcexcel:wb,
                hojas:listaTablas,
                nombre:target.files[a].name
              }
              this.filasacu.push(filapr);
            };
            reader.readAsBinaryString(target.files[a]);
          }
          else{
            this.toaster.error('El Archivo '+target.files[0].name+' ya fue cargado anteriormente.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          }
        }
        else
        {
          this.toaster.error('El Archivo seleccionado no es Hoja de Cálculo.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
    }
  }
  onFileChange3(evt: any) {
    const target : DataTransfer =  <DataTransfer>(evt.target);
    //if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    if(target.files.length>0){
      for(let a=0;a<target.files.length;a++){
        if(target.files[a].type=='application/vnd.ms-excel' || target.files[a].type=='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          let existe=this.filassubp.find(ele => ele.nombre==target.files[a].name);
          if(!existe){
            const reader: FileReader = new FileReader();
            reader.onload = (e: any) => {
              const bstr: string = e.target.result;
              let wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
              const lista = wb.SheetNames;
              let listaTablas = [];
              let sel=1;
              lista.map((ele) => {
                listaTablas.push({nombre:ele,selec:sel});
                sel=0;
              });
              let filapr:filaarch={
                arcexcel:wb,
                hojas:listaTablas,
                nombre:target.files[a].name
              }
              this.filassubp.push(filapr);
            };
            reader.readAsBinaryString(target.files[a]);
          }
          else{
            this.toaster.error('El Archivo '+target.files[0].name+' ya fue cargado anteriormente.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          }
        }
        else
        {
          this.toaster.error('El Archivo seleccionado no es Hoja de Cálculo.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
      }
    }
  }
  EliminaArchivo(donde:any,ind:any){
    if(donde==1){
      this.filapresu=null;
      const fileUpload=document.getElementById("file1") as HTMLInputElement;
      if(fileUpload!=null)
      {
        fileUpload.value=null;
      }
    }
    else if(donde==0){
      this.filasacu.splice(ind,1);
      const fileUpload=document.getElementById("file2") as HTMLInputElement;
      if(fileUpload!=null)
      {
        fileUpload.value=null;
      }
      this.exisacu=false;
      for(let filaar of this.filasacu){
        for(let hoja of filaar.hojas){
          if(hoja.selec=='1'){
            this.exisacu=true;
            break;
          }
        }
      }
    }
    else if(donde==2){
      this.filassubp.splice(ind,1);
      const fileUpload=document.getElementById("file3") as HTMLInputElement;
      if(fileUpload!=null)
      {
        fileUpload.value=null;
      }
      this.exissubp=false;
      for(let filaar of this.filassubp){//cargar subpartidas
        for(let hoja of filaar.hojas){
          if(hoja.selec=='1'){
            this.exissubp=true;
            break;
          }
        }
      }
    }
  }
  nuevafilapre(aindice,aitem,adescripcion,aunidad,acantidad,aprecio,aparcial,arendimiento,aund_rendi,ajornada,atipofila){
    let filaagrega : rowpresu = {
      indice:aindice,
      item: aitem,
      descripcion: adescripcion,
      id_unidad:null,//consultar en bd?
      unidad: aunidad,
      cantidad: acantidad,
      precio: aprecio,
      parcial: aparcial,
      rendimiento: arendimiento,//1
      und_rendi: aund_rendi,//DIA
      jornada: ajornada,//8
      referencia:null,//null
      id_partida:null,//null
      advceros: 1,
      tipofila: atipofila,//0 titulo, 1 subtitulo, 2 fila
      itemord:this.GenerarItemord(aitem), //calcular
      vinculo:null,//null
      responsable:this.idUsuario,
      colorvin:null,//null
      ed_pre:1,//1
      tieneacu:0,
    };
    return filaagrega;
  }
  nuevafiladeta(aindice,aidfila,atipoins,anumdet,acodigo,adescripcion,aunidad,acuadrilla,acantidad,aprecio,aparcial,aidindice,aesinsumo,aafcuad,arendimiento,aund_rendi,ajornada,indicesubp){
    let filaagrega : rowdeta = {
      indice:aindice,
      id_filadetalle: aidfila,
      id_tipo_insumo:atipoins,
      num_det:anumdet,
      codigo:acodigo,
      descripcion: adescripcion,
      id_unidad:null,//consultar en bd?
      unidad: aunidad,
      cuadrilla:acuadrilla,
      cantidad: acantidad,
      precio: aprecio,
      parcial: aparcial,
      id_indice:aidindice,
      id_clasificacion:null,
      id_insumo:null,
      indice_subp:indicesubp,
      esinsumo:aesinsumo,
      afcuadrilla:aafcuad,
      rendimiento: arendimiento,//1
      und_rendi: aund_rendi,//DIA
      jornada: ajornada,//8
      advceros: aesinsumo=='1'?null:1,//deberia empezar con 1? ya que luego se actualiza el detalle?
      referencia:null,//null
      tieneacu:0
    };
    return filaagrega;
  }
  GenerarItemord(item:string)
  {
    let itemord = '';
    let arrit = item.split('.');
    for(let i = 0; i < arrit.length; i++)
    {
      itemord = i == arrit.length - 1 ? itemord + arrit[i].padStart((2 * arrit[i].length) - 1, '_') : itemord + arrit[i].padStart((2 * arrit[i].length) - 1, '_') + ".";
    }
    return itemord;
  }
  async Procesar(forma:any){//0:plantilla,1:avanzado
    try{
      this.dec_cant=Number(this.frmdeccant.value);
      this.dec_metrado=Number(this.frmdecmetrado.value);
      this.dec_precio=Number(this.frmdecprecio.value);
      this.dec_parcial=Number(this.frmdecparcial.value);
      if(this.confav || this.opcfuente=='2'){
        let cump1=true;
        for(let elem of this.dataselcol){//para los 3 arreglos
          if(elem==''){
            cump1=false;
            break;
          }
        }
        if(!cump1){
          this.toaster.error('Debe asignar todas las columnas en Presupuesto para importar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
          return;
        }
        if(this.exisacu){
          let cump2=true;
          for(let el=0;el<this.dataselcol2.length;el++){
            if(!(el==0 || el==2 || el==13) && this.dataselcol2[el]==''){//0,2,13
              cump2=false;
              break;
            }
          }
          if(!cump2){
            this.toaster.error('Debe asignar todas las columnas en Costos Unitarios para importar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
            return;
          }
          let cumptipoins=true;
          if(this.opcfuente=='2'){
            for(let row of this.arrtipins){
              if(row==''){
                cumptipoins=false;
              }
            }
            if(!cumptipoins){
              this.toaster.error('La Configuracion de Tipos de Insumos no permite vacios.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
              return;
            }
          }
        }
        if(this.exissubp){
          let cump3=true;
          for(let el=0;el<this.dataselcol3.length;el++){
            if(!(el==0 || el==1 || el==2) && this.dataselcol3[el]==''){//0,1,2
              cump3=false;
              break;
            }
          }
          if(!cump3){
            this.toaster.error('Debe asignar todas las columnas en Costos Unitarios para importar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
            return;
          }
          let cumptipoins=true;
          if(this.opcfuente=='2'){
            for(let row of this.arrtipins){
              if(row==''){
                cumptipoins=false;
              }
            }
            if(!cumptipoins){
              this.toaster.error('La Configuracion de Tipos de Insumos no permite vacios.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
              return;
            }
          }
        }
      }
      this.mostrar_carga_todo=true;
      this.errpresu=[];
      this.erracu=[];
      this.errsubp=[];
      //validar seleccion obligatoria de presu
      if(this.filapresu!=null){
        let conthoj=0;//presu
        let arrdet=[];
        let conthojas=0;//detalle
        for(let hoja of this.filapresu.hojas){
          if(hoja.selec=='1'){
            conthoj++;
            for(let filas of this.filasacu){
              for(let hojad of filas.hojas){
                if(hojad.selec=='1'){
                  conthojas++;
                  let encuarc=arrdet.find(ele=>ele.nombre==filas.nombre);
                  if(!encuarc){
                    arrdet.push(filas)
                  }
                }
              }
            }
            //validar filas subpartidas?
            if(conthojas==0){//se agrega sin detalle
              const respu=await SwalService.confirm('Esta seguro que desea agregar solo Presupuesto?','No selecciono datos para COSTOS UNITARIOS.');
              if(!respu.isConfirmed){
                this.mostrar_carga_todo=false;
                return;
              }
            }
            //reiniciar variables
            this.indiceadd=1;
            this.datapresu=[];
            this.arrpartidas=[];
            this.datadetalle=[];
            this.arrsubpart=[];
            this.datasubp=[];
            this.arrund=[];
            this.filaSelund=-1;
            const ws: XLSX.WorkSheet = this.filapresu.arcexcel.Sheets[hoja.nombre];
            this.data = (XLSX.utils.sheet_to_json(ws, { header: 1, blankrows:false }));
            let aux=[];
            for(let i=0;i<this.data.length;i++){
                aux.push(this.data[i]);
                aux[aux.length-1].idex=i+1;
            }
            //carga presu
            let arrindpasa=this.opcfuente=="0"?JSON.parse(JSON.stringify(this.s10presu)):this.opcfuente=="1"?JSON.parse(JSON.stringify(this.delppresu)):this.opcfuente=="3"?JSON.parse(JSON.stringify(this.sispresu)):[];
            let arrinddetp=this.opcfuente=="0"?JSON.parse(JSON.stringify(this.s10acu)):this.opcfuente=="1"?JSON.parse(JSON.stringify(this.delpacu)):this.opcfuente=="3"?JSON.parse(JSON.stringify(this.sisacu)):[];
            let arrindsubp=this.opcfuente=="0"?JSON.parse(JSON.stringify(this.s10subp)):this.opcfuente=="1"?JSON.parse(JSON.stringify(this.delpacu)):this.opcfuente=="3"?JSON.parse(JSON.stringify(this.sisacu)):[];
            let arrinds=[];
            if(this.confav || this.opcfuente=='2'){
              for(let ab=0;ab<this.dataselcol.length;ab++){
                arrindpasa[ab]=Number(this.dataselcol[ab]);
              }
              for(let ab=0;ab<this.dataselcol2.length;ab++){
                arrinddetp[ab]=Number(this.dataselcol2[ab]);
                if(ab==13){
                  arrinddetp[ab]=Number(this.dataselcol3[13]);
                }
              }
              for(let ab=0;ab<this.dataselcol3.length;ab++){
                arrindsubp[ab]=Number(this.dataselcol3[ab]);
                if(ab==1){
                  arrindsubp[ab]=Number(this.dataselcol2[1]);
                }
              }
            }
            else{
              if(this.opcfuente=='0'){//s10, buscar los indices de las columnas
                for(let m=0;m<aux.length;m++){
                  for(let n=0;n<aux[m].length;n++){
                    if(aux[m][n]?.toString().toUpperCase()=='ITEM'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase()=='DESCRIPCIÓN'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase()=='UND.'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase()=='METRADO'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase().replace(/\//g,'')=='PRECIO S.'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase().replace(/\//g,'')=='PARCIAL S.'){
                      arrinds.push(n);
                    }
                  }
                  if(arrinds.length>0){
                    break;
                  }
                }
                if(arrinds.length!=6){
                  this.mostrar_carga_todo=false;
                  this.toaster.error('La Hoja de Cálculo ingresada no cumple con la fuente seleccionada.', 'Error1', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
                  return;
                }
                else{
                  arrindpasa=arrinds;
                }
              }
              else if(this.opcfuente=='1'){
                for(let m=0;m<aux.length;m++){
                  for(let n=0;n<aux[m].length;n++){
                    if(aux[m][n]?.toString().toUpperCase()=='ITEM'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase()=='DESCRIPCIÓN'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase()=='UNID.'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase()=='CANT.'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase()=='PRECIO'){
                      arrinds.push(n);
                    }
                    if(aux[m][n]?.toString().toUpperCase()=='PARCIAL'){
                      arrinds.push(n);
                    }
                  }
                  if(arrinds.length>0){
                    break;
                  }
                }
                if(arrinds.length!=6){
                  this.mostrar_carga_todo=false;
                  this.toaster.error('La Hoja de Cálculo ingresada no cumple con la fuente seleccionada.', 'Error1', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
                  return;
                }
                else{
                  arrindpasa=arrinds;
                }
              }
            }
            let result=this.cargartabla(aux,arrindpasa,this.filapresu.nombre)//verificar que existan todos los items
            if(result==''){
              if(this.datapresu.length>4500){
                this.mostrar_carga_todo=false;
                this.toaster.error('La cantidad de partidas a importar no puede ser mayor a 4500.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
                return;
              }
              for(let filaar of arrdet){
                for(let hoja of filaar.hojas){
                  if(hoja.selec=='1'){
                    const ws: XLSX.WorkSheet = filaar.arcexcel.Sheets[hoja.nombre];
                    this.data = (XLSX.utils.sheet_to_json(ws, { header: 1, blankrows:false }));
                    let aux=[];
                    for(let i=0;i<this.data.length;i++){
                      aux.push(this.data[i]);
                      aux[aux.length-1].idex=i+1;
                    }
                    if(forma==0){
                      this.cargartablaDet(aux,arrinddetp,filaar.nombre,hoja.nombre);
                    }
                    else{
                      this.cargartablaDet2(aux,arrinddetp,filaar.nombre,hoja.nombre);
                    }
                  }
                }
              }
              for(let filaar of this.filassubp){//cargar subpartidas
                for(let hoja of filaar.hojas){
                  if(hoja.selec=='1'){
                    const ws: XLSX.WorkSheet = filaar.arcexcel.Sheets[hoja.nombre];
                    this.data = (XLSX.utils.sheet_to_json(ws, { header: 1, blankrows:false }));
                    let aux=[];
                    for(let i=0;i<this.data.length;i++){
                      aux.push(this.data[i]);
                      aux[aux.length-1].idex=i+1;
                    }
                    if(forma==0){
                      this.cargartablaSubp(aux,arrindsubp,filaar.nombre,hoja.nombre)
                    }
                    else{
                      this.cargartablaSubp2(aux,arrindsubp,filaar.nombre,hoja.nombre)
                    }
                  }
                }
              }
              //si hay costos unitarios recalcular totales
              if(this.datadetalle.length>0){
                let parcag=0;
                let indoper=-1;
                for(let a1=this.datasubp.length-1;a1>=0;a1--){
                  if(Number(this.datasubp[a1].id_tipo_insumo==5)){
                    if(this.datasubp[a1].indice!=indoper && parcag>0){
                      let indpadre=-1;
                      let fuente=1;//1detalle,2subpartidas
                      for(let m=0;m<this.datasubp.length;m++){
                        if(indoper==this.datasubp[m].indice_subp){
                          indpadre=m;
                          break;
                        }
                      }
                      if(indpadre==-1){
                        for(let n=0;n<this.datadetalle.length;n++){
                          if(indoper==this.datadetalle[n].indice_subp){
                            indpadre=n;
                            fuente=2;
                            break;
                          }
                        }
                      }
                      if(indpadre>=0){//actualizar el parcial
                        if(fuente==1){
                          let cant=Number(this.datasubp[indpadre].cantidad);
                          let precio=Number(this.datasubp[indpadre].precio);
                          this.datasubp[indpadre].precio=this.formService.redondeo(precio+parcag,this.dec_precio);
                          this.datasubp[indpadre].parcial=this.formService.redondeo(cant*Number(this.datasubp[indpadre].precio),this.dec_precio);
                        }
                        else{
                          let cant=Number(this.datadetalle[indpadre].cantidad);
                          let precio=Number(this.datadetalle[indpadre].precio);
                          this.datadetalle[indpadre].precio=this.formService.redondeo(precio+parcag,this.dec_precio);
                          this.datadetalle[indpadre].parcial=this.formService.redondeo(cant*Number(this.datadetalle[indpadre].precio),this.dec_precio);
                        }
                      }
                      //limpiar variables
                      parcag=0;
                    }
                    parcag+=Number(this.datasubp[a1].parcial);
                    indoper=this.datasubp[a1].indice;
                  }
                  else if((a1==0 || this.datasubp[a1].indice!=indoper) && parcag>0){//num_det==0 no existe
                    let indpadre=-1;
                    let fuente=1;//1detalle,2subpartidas
                    for(let m=0;m<this.datasubp.length;m++){
                      if(indoper==this.datasubp[m].indice_subp){
                        indpadre=m;
                        break;
                      }
                    }
                    if(indpadre==-1){
                      for(let n=0;n<this.datadetalle.length;n++){
                        if(indoper==this.datadetalle[n].indice_subp){
                          indpadre=n;
                          fuente=2;
                          break;
                        }
                      }
                    }
                    if(indpadre>=0){//actualizar el parcial
                      if(fuente==1){
                        let cant=Number(this.datasubp[indpadre].cantidad);
                        let precio=Number(this.datasubp[indpadre].precio);
                        this.datasubp[indpadre].precio=this.formService.redondeo(precio+parcag,this.dec_precio);
                        this.datasubp[indpadre].parcial=this.formService.redondeo(cant*Number(this.datasubp[indpadre].precio),this.dec_precio);
                      }
                      else{
                        let cant=Number(this.datadetalle[indpadre].cantidad);
                        let precio=Number(this.datadetalle[indpadre].precio);
                        this.datadetalle[indpadre].precio=this.formService.redondeo(precio+parcag,this.dec_precio);
                        this.datadetalle[indpadre].parcial=this.formService.redondeo(cant*Number(this.datadetalle[indpadre].precio),this.dec_precio);
                      }
                    }
                    //limpiar variables
                    parcag=0;
                  }
                }
                parcag=0;
                let prec1=0;
                let indpad=-1;
                indoper=-1;
                for(let a2=this.datadetalle.length-1;a2>=0;a2--){//sumar todo, porque se inicia con 0//pendiente
                  if(indpad==-1){
                    indpad=this.datadetalle[a2].indice;
                    prec1+=Number(this.datadetalle[a2].parcial);
                  }
                  else{
                    if(indpad!=this.datadetalle[a2].indice){
                      //actualiza padre
                      for(let m=0;m<this.datapresu.length;m++){
                        if(this.datapresu[m].indice==indpad){
                          this.datapresu[m].precio=this.formService.redondeo(prec1,this.dec_precio);
                          this.datapresu[m].parcial=this.formService.redondeo(Number(this.datapresu[m].precio)*Number(this.datapresu[m].cantidad),this.dec_precio);
                          break;
                        }
                      }
                      indpad=this.datadetalle[a2].indice;
                      prec1=0;
                      prec1+=Number(this.datadetalle[a2].parcial);
                    }
                    else{
                      prec1+=Number(this.datadetalle[a2].parcial);
                    }
                  }
                  if(a2==0){//actua padre, tambien se opera la fila 0, puede ser una subpartida o insumo
                    for(let m=0;m<this.datapresu.length;m++){
                      if(this.datapresu[m].indice==indpad){
                        this.datapresu[m].precio=this.formService.redondeo(prec1,this.dec_precio);
                        this.datapresu[m].parcial=this.formService.redondeo(Number(this.datapresu[m].precio)*Number(this.datapresu[m].cantidad),this.dec_precio);
                        break;
                      }
                    }
                  }
                }
                //recalcular totales grupos presu
                let indtit=[];
                let tottit=[];
                let itemtit=[];
                for (let c = 0; c < this.datapresu.length; c++)
                {
                  if (this.datapresu[c].unidad == "")//titulos
                  {
                    for (let t = itemtit.length - 1; t >= 0; t--)
                    {
                      let itemtem = this.datapresu[c].item;
                      let itemfila = itemtem.Length <= itemtit[t].length + 1 ? "-" : itemtem.substring(0, itemtit[t].length + 1);
                      if (itemtit[t] + "." != itemfila)//si no es predecesor, se actualizan y eliminan los titulos
                      {
                        this.datapresu[indtit[t]].parcial = this.formService.redondeo(tottit[t], this.dec_parcial);
                        indtit.splice(t,1);
                        tottit.splice(t,1);
                        itemtit.splice(t,1);
                      }
                    }
                    indtit.push(c);
                    tottit.push(0);
                    itemtit.push(this.datapresu[c].item);
                  }
                  else//partidas
                  {
                    for(let t = itemtit.length-1; t >= 0;t--)
                    {
                      let itemtem = this.datapresu[c].item;
                      let itemfila = itemtem.Length <= itemtit[t].length + 1 ? "-" : itemtem.substring(0, itemtit[t].length + 1);
                      if (itemtit[t]+"."==itemfila)
                      {
                        tottit[t] += Number(this.datapresu[c].parcial);
                      }
                      else//si no es predecesor, se actualizan y eliminan los titulos
                      {
                        this.datapresu[indtit[t]].parcial = this.formService.redondeo(tottit[t],this.dec_parcial);
                        indtit.splice(t,1);
                        tottit.splice(t,1);
                        itemtit.splice(t,1);
                      }
                    }
                  }
                }
                if(itemtit.length>0){//actualizar totales
                  for (let t = itemtit.length - 1; t >= 0; t--)
                  {
                    this.datapresu[indtit[t]].parcial = this.formService.redondeo(tottit[t], this.dec_parcial);
                    indtit.splice(t,1);
                    tottit.splice(t,1);
                    itemtit.splice(t,1);
                  }
                }
              }
              console.log('presu',JSON.parse(JSON.stringify(this.datapresu)))
              console.log('acu',JSON.parse(JSON.stringify(this.datadetalle)))
              console.log('subp',JSON.parse(JSON.stringify(this.datasubp)))
              //juntar todas los errores
              if(this.erracu.length>0){
                this.erracu.concat(this.errsubp);
              }
              else{
                this.erracu=this.errsubp;
              }
              //await this.VinculaUnd();
              this.activetab=3;
            }
          }
        }
        if(conthoj==0){
          this.toaster.error('Seleccione una Hoja de Cálculo para agregar a Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        }
      }
      else{
        this.toaster.error('Seleccione un archivo para agregar a Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      }
      this.mostrar_carga_todo=false;
    }
    catch(e){
      console.log(e);
      this.mostrar_carga_todo=false;
      this.toaster.error('No se pudo completar la operacion.Ocurrio una Excepcion al momento de procesar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
    }
  }
  cargartabla(datos,arrind,nomarch){
    let empieza=false;
    let nocumple=false;
    let error='';
    let segundorec=false;
    let arrorden=[];//para repetidos? buscar? o por el orden del item?
    for(let a=0;a<datos.length;a++){
      if(empieza){//agregar filas
        if(datos[a][arrind[0]]!=null){//validar variables si cumplen condicion
          let itemact=datos[a][arrind[0]].toString();
          let itemval=itemact?(isNaN(itemact.replace(/\./g,''))?null:itemact):null;
          let itemp=itemval?this.Corrigeitem(itemact):'nocumple';//corregir item
          if(itemp=='nocumple'){
            //nocumple=true;//ya existen filas agregadas
            this.errpresu.push({archivo:nomarch,fila:a,error:'Valor de item no cumple',valor:itemact,valor2:datos[a][arrind[1]],tipo:'0'});
            //error='0';// no se cuent la fila con item incorrecto, pero lo demas sigue
            continue;
          }
          let descp=datos[a][arrind[1]]??'';
          if(descp==''){
            nocumple=true;//ya existen filas agregadas
            this.errpresu.push({archivo:nomarch,fila:datos[a].idex,error:'El valor de Descripcion no es valido.',valor:datos[a],valor2:datos[a][arrind[0]],tipo:'0'});
            error='Descripcion no es valida. '+datos[a][arrind[1]];
            continue;
          }
          let unidadp=datos[a][arrind[2]]??'';
          let metradopass=datos[a][arrind[3]]==null || datos[a][arrind[3]]==''?null:isNaN(datos[a][arrind[3]])?'nocumple':datos[a][arrind[3]];//condiciona numero
          if(metradopass=='nocumple'){
            nocumple=true;//ya existen filas agregadas
            this.errpresu.push({archivo:nomarch,fila:datos[a].idex,error:'El valor de metrado no cumple con el tipo.',valor:datos[a][arrind[3]],valor2:datos[a][arrind[1]],tipo:'0'});
            error='El valor de metrado no cumple con el tipo';
            continue;
          }
          if(unidadp=='' && metradopass!=null){//es partida y no tiene unidad error
            unidadp='und';
            /* this.errpresu.push({archivo:nomarch,fila:a,error:'La partida no tiene unidad de Medida.',valor:datos[a][arrind[2]]});
            error='2';
            continue; */
          }
          if(unidadp!='' && metradopass==null){
            metradopass=0;
          }
          //verificar item(length anterior igual +1,menor concat .1,mayor eliminar hasta la longitud igual debe ser +1 y eliminar longitud igual)(caso si split es 1)
          let itemant=arrorden[arrorden.length-1];
          let arritant=itemant.split('.');
          let arritpas=itemp.split('.');
          if(arritant.length==arritpas.length){
            arritant[arritant.length-1]=Number(arritant[arritant.length-1])+1;
            if(itemp!=arritant.join('.')){
              let corregido=false;
              //itemp.split.length del anterior , usar metodo sigitem
              if(arritpas.length==2){
                let num2=(Number(arritant[arritpas.length-1].toString())-1).toString();
                let ultdig=num2.substring(num2.length-1);
                if(ultdig=='9'){
                  let newnum=Number(arritant[arritant.length-1]);
                  arritpas[arritpas.length-1]=newnum.toString();
                  //comparar que tengan mismo prefijo y que el item tambien lo tenga incluido, sin considerar el 0 que falta
                  if(arritpas.join('.').substring(0,itemp.length)==itemp){
                    itemp=arritpas.join('.');
                    arrorden.splice(arrorden.length-1,1);
                    arrorden.push(itemp);
                    corregido=true;
                  }
                }
              }
              if(!corregido){
                let exisite=this.datapresu.find(ele=>ele.item==itemp);
                if(exisite){
                  nocumple=true;
                  this.errpresu.push({archivo:nomarch,fila:a,error:'Existe un item duplicado.',valor:itemp,valor2:datos[a][arrind[1]],tipo:'0'});
                  error='Existe un item duplicado. Error al analizar item '+itemp;
                  break;
                }
                nocumple=true;
                error='El orden de los items no es correcto. Error al analizar item '+itemp;
                this.errpresu.push({archivo:nomarch,fila:a,error:'El orden de los items no es correcto.',valor:itemp,valor2:datos[a][arrind[1]],tipo:'0'});
                break;
              }
            }
            else{
              arrorden.push(itemp);
            }
          }else if(arritant.length<arritpas.length){
            if(itemant+'.1'!=itemp){
              nocumple=true;
              error='El orden de los items no es correcto. Error al analizar item '+itemp;
              this.errpresu.push({archivo:nomarch,fila:a,error:'El orden de los items no es correcto.',valor:itemp,valor2:datos[a][arrind[1]],tipo:'0'});
              break;
            }else{
              arrorden.push(itemp);
            }
          }else if(arritant.length>arritpas.length){
            while(arritant.length>arritpas.length){
              arrorden.splice(arrorden.length-1,1);
              itemant=arrorden[arrorden.length-1];
              arritant=itemant.split('.');
            }
            arritant[arritant.length-1]=Number(arritant[arritant.length-1])+1;
            if(itemp!=arritant.join('.')){
              let corregido=false;
              //itemp.split.length del anterior , usar metodo sigitem
              if(arritpas.length==2){
                let num2=(Number(arritant[arritpas.length-1].toString())-1).toString();
                let ultdig=num2.substring(num2.length-1);
                if(ultdig=='9'){
                  let newnum=Number(arritant[arritant.length-1]);
                  arritpas[arritpas.length-1]=newnum.toString();
                  //comparar que tengan mismo prefijo y que el item tambien lo tenga incluido, sin considerar el 0 que falta
                  if(arritpas.join('.').substring(0,itemp.length)==itemp){
                    itemp=arritpas.join('.');
                    arrorden.splice(arrorden.length-1,1);
                    arrorden.push(itemp);
                    corregido=true;
                  }
                }
              }
              if(!corregido){
                let exisite=this.datapresu.find(ele=>ele.item==itemp);
                if(exisite){
                  nocumple=true;
                  error='Existe un item duplicado. Error al analizar item '+itemp;
                  this.errpresu.push({archivo:nomarch,fila:a,error:'Existe un item duplicado.',valor:itemp,valor2:datos[a][arrind[1]],tipo:'0'});
                  break;
                }
                nocumple=true;
                error='El orden de los items no es correcto. Error al analizar item '+itemp;
                this.errpresu.push({archivo:nomarch,fila:a,error:'El orden de los items no es correcto.',valor:itemp,valor2:datos[a][arrind[1]],tipo:'0'});
                break;
              }
            }
            else{
              arrorden.splice(arrorden.length-1,1);
              arrorden.push(itemp);
            }
          }
          let tipofp=unidadp!=''?2:itemp.split('.').length>1?1:0;
          if(tipofp==2){
            this.arrpartidas.push({item:itemp,indice:this.indiceadd,ind:this.datapresu.length,tieneacu:0});
          }
          if(unidadp!=''){
            let exisund=this.arrund.find(ele=>ele.unidad1==unidadp);
            if(!exisund){
              this.arrund.push({unidad1:unidadp,unidad2:null,descripcion:null,id_unidad:null,observacion:'Se creará como unidad simple al importar'});
            }
          }
          //redondea y calcula precio?
          let metradored=metradopass==null?null:this.formService.redondeo(metradopass,this.dec_metrado);
          let preciored=unidadp==''?null:0;//this.formService.redondeo(preciop,this.dec_precio);
          let parcialred=tipofp==2?0:null;//this.formService.redondeo(parcialp,this.dec_precio);
          let filaadd=this.nuevafilapre(this.indiceadd++,itemp,descp.toString().toUpperCase().trim().replace(/\s+/g, ' '),unidadp,metradored,preciored,parcialred,null,null,null,tipofp);
          this.datapresu.push(filaadd);
        }
      }
      else{
        if(datos[a][arrind[0]]!=null){//validar variables si cumplen condicion, si no encuentra, buscar con el indice +1 o -1?
          //verificar que item sea un numero, o que contenga puntos
          let itemact=datos[a][arrind[0]].toString();
          let itemval=itemact?(isNaN(itemact.replace(/\./g,''))?null:itemact):null;
          let itemp=itemval?this.Corrigeitem(itemact):'nocumple';//corregir item
          if(itemp=='nocumple'){
            continue;
          }
          let descp=datos[a][arrind[1]]??'';
          if(descp==''){
            nocumple=true;//ya existen filas agregadas
            this.errpresu.push({archivo:nomarch,fila:datos[a].idex,error:'El valor de Descripcion no es valido.',valor:datos[a],valor2:datos[a][arrind[0]],tipo:'0'});
            error='Descripcion no es valida. '+datos[a][arrind[1]];
            continue;
          }
          let unidadp=datos[a][arrind[2]]??'';
          let metradopass=datos[a][arrind[3]]==null || datos[a][arrind[3]]==''?null:isNaN(datos[a][arrind[3]])?'nocumple':datos[a][arrind[3]];//condiciona numero
          if(metradopass=='nocumple'){
            this.errpresu.push({archivo:nomarch,fila:datos[a].idex,error:'El valor de metrado no cumple con el tipo.',valor:datos[a][arrind[3]],valor2:datos[a][arrind[1]],tipo:'0'});
            continue;
          }
          if(unidadp=='' && metradopass!=null){//es partida y no tiene unidad error
            unidadp='und';
          }
          if(unidadp!='' && metradopass==null){
            metradopass=0;
          }
          //comprobar item, debe ser 1
          if(itemp!='1'){
            nocumple=true;
            this.errpresu.push({archivo:nomarch,fila:datos[a].idex,error:'El orden de los items no es correcto.',valor:itemact,valor2:datos[a][arrind[1]],tipo:'0'});
            error='El orden de los items no es correcto, debe empezar en 1.';
            break;
          }
          else{
            arrorden.push(itemp);
          }
          if(unidadp!=''){//no es titulo, deberia empezar en titulo
            nocumple=true;
            this.errpresu.push({archivo:nomarch,fila:datos[a].idex,error:'El primer elemento no es un Titulo.',valor:itemact,valor2:datos[a][arrind[1]],tipo:'0'});
            error='El primer elemento no es un Titulo.';
            break;
          }
          let tipofp=unidadp!=''?2:itemp.split('.').length>1?1:0;
          if(tipofp==2){
            this.arrpartidas.push({item:itemp,indice:this.indiceadd,ind:this.datapresu.length,tieneacu:0});
          }
          if(unidadp!=''){
            let exisund=this.arrund.find(ele=>ele.unidad1==unidadp);
            if(!exisund){
              this.arrund.push({unidad1:unidadp,unidad2:null,descripcion:null,id_unidad:null,observacion:'Se creará como unidad simple al importar'});
            }
          }
          let metradored=metradopass==null?null:this.formService.redondeo(metradopass,this.dec_metrado);
          let preciored=unidadp==''?null:0;//this.formService.redondeo(preciop,this.dec_precio);
          let parcialred=tipofp==2?0:null;//this.formService.redondeo(Number(metradored)*Number(preciored),this.dec_precio);
          let filaadd=this.nuevafilapre(this.indiceadd++,itemp,descp.toString().toUpperCase().trim().replace(/\s+/g, ' '),unidadp,metradored,preciored,parcialred,null,null,null,tipofp);
          this.datapresu.push(filaadd);
          empieza=true;
        }
      }
      if(a==datos.length-1 && !empieza && !segundorec){
        for(let d=0;d<arrind.length;d++){
          arrind[d]=arrind[d]-1;
        }
        a=0;
        segundorec=true;
      }
    }
    if(error=='' && !empieza){
      error='La Hoja de Cálculo para Presupuesto ingresada no cumple con la fuente seleccionada. ';
      nocumple=true;
    }
    if(nocumple){
      this.arrpartidas=[];
      this.datapresu=[];
      this.toaster.error(error, 'Error Presupuesto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
    }
    console.log('solo presu',JSON.parse(JSON.stringify(this.datapresu)))
    //console.table(this.datapresu,['indice','item','descripcion','unidad','cantidad','precio','parcial','tipofila','itemord'])
    return error;
  }
  Corrigeitem(item:string){
    let arrit=item.split('.');
    let arrnu=[];
    for(let a of arrit){
      arrnu.push(Number(a));
    }
    return arrnu.join('.');
  }
  cargartablaDet(datos:any,arrind:any,nomexcel:any,nomhoja:any){
    console.log('metodo cargartabladet')
    let empieza=false;
    let nocumple=false;
    let error='';
    let indpartida;
    let agru=0;
    let numdetaux=0;
    let arrauxdet=[];
    let txpartida=this.opcfuente=='0'?'Partida':(this.opcfuente=='1'?'Partida:':'Partida');
    let txrendimiento=this.opcfuente=='0'?'Rendimiento':(this.opcfuente=='1'?'Rendimiento:':'Rendimiento');
    let txmano=this.opcfuente=='0'?'MANO DE OBRA':(this.opcfuente=='1'?'MANO DE OBRA':(this.opcfuente=='3'?'MANO DE OBRA':this.arrtipins[0]));
    let txmat=this.opcfuente=='0'?'MATERIALES':(this.opcfuente=='1'?'MATERIALES':(this.opcfuente=='3'?'MATERIALES':this.arrtipins[1]));
    let txequi=this.opcfuente=='0'?'EQUIPOS':(this.opcfuente=='1'?'EQUIPO':(this.opcfuente=='3'?'EQUIPO':this.arrtipins[2]));
    let txsubcon=this.opcfuente=='0'?'SUBCONTRATOS':(this.opcfuente=='1'?'SUB-CONTRATOS':(this.opcfuente=='3'?'SUB CONTRATOS':this.arrtipins[3]));
    let txsubpar=this.opcfuente=='0'?'SUBPARTIDAS':(this.opcfuente=='1'?'SUB-PARTIDAS':(this.opcfuente=='3'?'SUB PARTIDAS':this.arrtipins[4]));
    //[partida,item,txrendi,valrendi,undrendi,agrupacion,codigo,descripcion,unidad,cuadrilla,cantidad,precio,parcial]
    for(let row of datos){
      if(this.opcfuente=='3'){
        row[arrind[10]]=row[arrind[10]]!=null?row[arrind[10]].toString().replace('%',''):[row[arrind[10]]];
      }
      if(row[arrind[0]]==txpartida || (this.opcfuente=='3' && (row[arrind[0]]??'').toString().includes(txpartida))){//inicia una partida 'Partida:', en delphin hay otras condiciones para terminar una partida
        let itemact=row[arrind[1]]!=null?row[arrind[1]].toString():null;
        if(this.opcfuente=='3'){
          let separad=row[arrind[0]].toString().split('             ');
          itemact=separad[0].replace('Partida:','').replace(/\s+/g, '');
        }
        let itemval=itemact?(isNaN(itemact.replace(/\./g,''))?null:itemact):null;
        let itemp=itemval?this.Corrigeitem(itemact):'nocumple';//corregir item
        if(itemp=='nocumple'){//inicia partida
          continue;
        }
        let rowpart=this.arrpartidas.find(ele=>ele.item==itemp);
        //agregar undrendi y rendimiento(en la misma fila delphin)
        if(this.opcfuente=='1'){//delphin (Rendimiento:3 und/Día)
          if(row[arrind[2]].toString().includes(txrendimiento)){
            let arrrend=row[arrind[2]].toString().split(" ");
            let rendpas=Number(arrrend[0].replace(txrendimiento,''));
            let undrendp='GLOBAL';
            if(rendpas!=0 && arrrend[1].includes('/')){
              undrendp=arrrend[1].split('/')[1].toUpperCase()=="DÍA" || arrrend[1].split('/')[1].toUpperCase()=="DIA"?'DIA':'GLOBAL';
            }
            this.datapresu[rowpart.ind].rendimiento=this.formService.redondeo(rendpas,2);
            this.datapresu[rowpart.ind].jornada=8;
            this.datapresu[rowpart.ind].und_rendi=undrendp;
          }
          else{
            this.datapresu[rowpart.ind].rendimiento=this.formService.redondeo(0,2);
            this.datapresu[rowpart.ind].jornada=8;
            this.datapresu[rowpart.ind].und_rendi='GLOBAL';
          }
        }
        if(rowpart){//existe se agregan los costos unitarios
          let auxdetcomp=[];
          if(indpartida){
            let total=0;
            let idfiladet=1;
            for(let row2 of arrauxdet){
              total+=Number(row2.parcial);
              row2.id_filadetalle=idfiladet++;
              if(row2.id_tipo_insumo!=5){
                let cant1=Number(row2.cantidad)
                let prec1=Number(row2.precio)
                let parc1=Number(row2.parcial)
                let resul1=((cant1*prec1)/100)-parc1;
                let margen=1/(10**this.dec_precio);
                row2.operador=resul1>-margen && resul1<margen?'%':null
              }
              else{
                row2.operador=null;
              }
              auxdetcomp.push(row2);
            }
            if(arrauxdet.length>0){
              indpartida.tieneacu=1;
              this.datapresu[indpartida.ind].tieneacu=1;
              this.datapresu[indpartida.ind].advceros=0;
              this.datapresu[indpartida.ind].precio=this.formService.redondeo(total,this.dec_precio);
              this.datapresu[indpartida.ind].parcial=this.formService.redondeo(Number(this.formService.redondeo(total,this.dec_precio))*Number(this.datapresu[indpartida.ind].cantidad),this.dec_parcial);
            }
            this.datadetalle=this.datadetalle.concat(auxdetcomp);
          }
          //reiniciar parametros
          indpartida=rowpart;
          agru=0;
          arrauxdet=[];
        }//no existe no se hace nada, no hay partida a cual vincular
      }
      else if(this.opcfuente=='1' && row[arrind[13]]!=null && row[arrind[2]]?.toString().includes(txrendimiento)){
        break;//fin de partidas, comienzo subpartidas
      }
      else if(row[arrind[2]]==txrendimiento || (this.opcfuente=='3' && (row[arrind[2]]??'').toString().includes(txrendimiento))){//fila rendimiento //actualizar padre?
        if(indpartida){//existe partida
          let rendip=row[arrind[3]]==null?'0':isNaN(row[arrind[3]])?'0':row[arrind[3]];//condiciona numero
          if(this.opcfuente=='3'){//sistema
            let arrrend=row[arrind[3]].toString().split("                   ");
            let elerend=arrrend[0].replace(/\s+/g, ' ');
            let elemod=elerend.replace('Rendimiento : ','');
            let arrelems=elemod.split(' ');
            rendip=arrelems[0]!=null?Number(arrelems[0]):'0';
          }
          let undrendip='GLOBAL';
          if(Number(rendip)!=0){
            undrendip='DIA';
          }
          this.datapresu[indpartida.ind].rendimiento=this.formService.redondeo(rendip,2);
          this.datapresu[indpartida.ind].jornada=8;
          this.datapresu[indpartida.ind].und_rendi=undrendip;
        }
      }
      else if(this.strvacionull(row[arrind[5]])!=null && this.strvacionull(row[arrind[8]])==null && this.strvacionull(row[arrind[11]])==null){//deberia ser agru, unidad y precio nulos
        if(indpartida){
          if(row[arrind[5]].toString().toUpperCase()==txmano){//MANO DE OBRA
            agru=1;
            numdetaux=0;
          }
          else if(row[arrind[5]].toString().toUpperCase()==txmat){//MATERIALES
            agru=2;
            numdetaux=0;
          }
          else if(row[arrind[5]].toString().toUpperCase()==txequi){//EQUIPO
            agru=3;
            numdetaux=0;
          }
          else if(row[arrind[5]].toString().toUpperCase()==txsubcon){//SUB-CONTRATOS
            agru=4;
            numdetaux=0;
          }
          else if(row[arrind[5]].toString().toUpperCase()==txsubpar){//SUB-PARTIDAS
            agru=5;
            numdetaux=0;
          }
        }
      }
      else if(this.strvacionull(row[arrind[7]])!=null && this.strvacionull(row[arrind[8]])!=null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){//insumo, primera condicion descripcion no null y precio debe ser numero
        if(indpartida && agru!=0){//existe partida
          if(indpartida.tieneacu==0){
            let codigop=row[arrind[6]]??'';
            let descp=row[arrind[7]]??'';
            if(descp==''){
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Descripcion no cumple con el formato.',valor:row[arrind[7]],valor2:row[arrind[6]],tipo:'1'});
              error='1';
              continue;
            }
            let unidadp=row[arrind[8]]??'';
            if(unidadp==''){
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Unidad no cumple con el formato.',valor:row[arrind[8]],valor2:row[arrind[7]],tipo:'1'});
              error='1';
              continue;
            }
            if(this.opcfuente=='1' || this.opcfuente=='3'){
              row[arrind[9]]=row[arrind[9]]=='-'?null:row[arrind[9]];
            }
            let cuadrillap=row[arrind[9]]==null?null:isNaN(row[arrind[9]])?'nocumple':row[arrind[9]];//condiciona numero,delhpin '-' en vez de vacio
            if(cuadrillap=='nocumple'){
              //nocumple=true;//ya existen filas agregadas
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cuadrilla no cumple con el formato.',valor:row[arrind[9]],valor2:row[arrind[7]],tipo:'1'});
              error='1';
              continue;
            }
            let cantidadp=row[arrind[10]]==null?'nocumple':isNaN(row[arrind[10]])?'nocumple':row[arrind[10]];//condiciona numero
            if(cantidadp=='nocumple'){
              //nocumple=true;
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cantidad no cumple con el formato.',valor:row[arrind[10]],valor2:row[arrind[7]],tipo:'1'});
              error='2';
              continue;
            }
            let preciop=row[arrind[11]]==null?'nocumple':isNaN(row[arrind[11]])?'nocumple':row[arrind[11]];//condiciona numero
            preciop=cantidadp!=null && preciop==null?0:preciop;
            if(preciop=='nocumple'){
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Precio no cumple con el formato.',valor:row[arrind[11]],valor2:row[arrind[7]],tipo:'1'});
              //nocumple=true;
              error='2';
              continue;
            }
            let parcialp=row[arrind[12]]==null?0:isNaN(row[arrind[12]])?0:row[arrind[12]];//condiciona numero parcial no null
            let indice=indpartida.indice;
            codigop=agru==5?codigop:codigop.toString().substring(this.opcfuente=="0"?2:0);
            let indunifp=codigop.length>=2?codigop.toString().substring(0,2):null;
            let indunfcorr=this.tindices.find(ele=>ele.id_indice==indunifp)
            if(!indunfcorr){
              indunifp=null;
            }
            numdetaux++;
            if(agru==5){//subpartida, //agregar indice[subp]
              preciop=0;
              cuadrillap=null;
              parcialp=0;
              indunifp=null;
              this.arrsubpart.push({indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().toUpperCase().trim().replace(/\s+/g, ' '),indice_subp:this.indiceadd,tieneacu:0,unidad:unidadp});
            }
            let afcuadp=agru==1 || agru==3?'1':'0';
            if(unidadp!=''){
              let exisund=this.arrund.find(ele=>ele.unidad1==unidadp);
              if(!exisund){
                this.arrund.push({unidad1:unidadp,unidad2:null,descripcion:null,id_unidad:null,observacion:'Se creará como unidad simple al importar'});
              }
            }
            //redondear montos
            let cuadrired=cuadrillap?this.formService.redondeo(cuadrillap,8):null;
            let cantred=this.formService.redondeo(cantidadp,this.dec_cant);
            let preciored=this.formService.redondeo(preciop,this.dec_precio);
            let parcred=/* agru!=5?this.formService.redondeo(Number(cantred)*Number(preciored),this.dec_precio): */this.formService.redondeo(parcialp,this.dec_precio);
            let filaadd=this.nuevafiladeta(indice,null,agru,numdetaux,codigop,descp.toString().toUpperCase().trim().replace(/\s+/g, ' '),unidadp,cuadrired,cantred,preciored,parcred,indunifp,agru==5?'0':'1',afcuadp,null,null,null,agru==5?this.indiceadd++:null);
            arrauxdet.push(filaadd);//agregar insumo a arraux
            empieza=true;
          }
          else{
            //agregar a tabla errores
            this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'La partida ya tiene costos unitarios.',valor:'Partida : '+indpartida.item,valor2:row[arrind[7]],tipo:'1'});
            //console.log('error, no se pudo agregar acus porque ya se agrego anteriormente',indpartida)
          }
        }
      }
      // else if(row[arrind[1]]!=null && isNaN(row[arrind[7]]??null)){
      //   if(indpartida && agru!=0){//existe partida
      //     // console.log(isNaN(Number(null)));  false
      //     // console.log(isNaN(Number('nasjfsaf')));  true
      //     // console.log(isNaN(Number('25.4')));  false
      //     this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Precio no cumple con el formato.',valor:row[arrind[7]]});
      //   }
      else {
        if(indpartida && agru!=0){//existe partida
          if(row[arrind[7]]==null && row[arrind[8]]!=null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
            this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Descripción no cumple con el formato.',valor:row[arrind[7]],valor2:row[arrind[0]],tipo:'1'});
          }
          if(row[arrind[7]]!=null && row[arrind[8]]==null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
            this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Unidad no cumple con el formato.',valor:row[arrind[8]],valor2:row[arrind[7]],tipo:'1'});
          }
          if(row[arrind[7]]!=null && row[arrind[8]]!=null && isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
            this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cantidad no cumple con el formato.',valor:row[arrind[10]],valor2:row[arrind[7]],tipo:'1'});
          }
          if(row[arrind[7]]!=null && row[arrind[8]]!=null && !isNaN(row[arrind[10]]??'nocumple') && isNaN(row[arrind[11]]??'nocumple')){
            this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Precio no cumple con el formato.',valor:row[arrind[11]],valor2:row[arrind[7]],tipo:'1'});
          }
        }
      }
    }
    //guardar ultimos registros
    if(indpartida){
      let auxdetcomp=JSON.parse(JSON.stringify(this.tabladetlimp));
      //agregar y sumar al grupo, sumar total solo las filas de arrauxdet para total de partida
      for(let raux1 of auxdetcomp){
        raux1.indice=indpartida.indice;
      }
      let total=0;
      let idfiladet=1;
      for(let row2 of arrauxdet){
        total+=Number(row2.parcial);
        row2.id_filadetalle=idfiladet++;
        if(row2.id_tipo_insumo!=5){
          let cant1=Number(row2.cantidad)
          let prec1=Number(row2.precio)
          let parc1=Number(row2.parcial)
          let resul1=((cant1*prec1)/100)-parc1;
          let margen=1/(10**this.dec_precio);
          row2.operador=resul1>-margen && resul1<margen?'%':null
        }
        else{
          row2.operador=null;
        }
        auxdetcomp.push(row2);
      }
      if(arrauxdet.length>0){
        this.datapresu[indpartida.ind].tieneacu=1;
        this.datapresu[indpartida.ind].advceros=0;
        //actualizar precio y calcular parcial
        this.datapresu[indpartida.ind].precio=this.formService.redondeo(total,this.dec_precio);
        this.datapresu[indpartida.ind].parcial=this.formService.redondeo(Number(this.formService.redondeo(total,this.dec_precio))*Number(this.datapresu[indpartida.ind].metrado),this.dec_parcial);
        this.datadetalle=this.datadetalle.concat(auxdetcomp);
      }
    }
    //reiniciar paramtetros
    indpartida=null;
    agru=0;
    arrauxdet=[];
    if(!empieza){
      error=error==''?'No se agrego ninguna fila.La Hoja de Cálculo ingresada no cumple con la fuente seleccionada para Costos Unitarios.':error;
      this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:null,error:'No se agrego ninguna fila.La Hoja de Cálculo ingresada no cumple con la fuente seleccionada para Costos Unitarios.',valor:null,valor2:null,tipo:'1'});
      nocumple=true;
    }
    if(nocumple){//especificar errores?, usar los items de partida para saber cual es el incorrecto?
      this.toaster.error(error, 'Error Costos Unitarios', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
    }
  }
  strvacionull(elem:any){
    return elem!=null?(elem==''?null:elem):null;
  }
  cargartablaSubp(datos,arrind,nomexcel:any,nomhoja:any){
    //arrind[5]=this.opcfuente=='0'?arrind[5]+1:arrind[5];
    let empieza=false;
    let nocumple=false;
    let error='';
    let indpartida;
    let agru=0;
    let numdetaux=0;
    let arrauxdet=[];
    let txpartida=this.opcfuente=='0'?'Partida':(this.opcfuente=='1'?'Partida:':(this.opcfuente=='3'?'Codigo':'Partida'));
    let txrendimiento=this.opcfuente=='0'?'Rendimiento':(this.opcfuente=='1'?'Rendimiento:':'Rendimiento');
    let txmano=this.opcfuente=='0'?'MANO DE OBRA':(this.opcfuente=='1'?'MANO DE OBRA':(this.opcfuente=='3'?'MANO DE OBRA':this.arrtipins[0]));
    let txmat=this.opcfuente=='0'?'MATERIALES':(this.opcfuente=='1'?'MATERIALES':(this.opcfuente=='3'?'MATERIALES':this.arrtipins[1]));
    let txequi=this.opcfuente=='0'?'EQUIPOS':(this.opcfuente=='1'?'EQUIPO':(this.opcfuente=='3'?'EQUIPO':this.arrtipins[2]));
    let txsubcon=this.opcfuente=='0'?'SUBCONTRATOS':(this.opcfuente=='1'?'SUB-CONTRATOS':(this.opcfuente=='3'?'SUB CONTRATOS':this.arrtipins[3]));
    let txsubpar=this.opcfuente=='0'?'SUBPARTIDAS':(this.opcfuente=='1'?'SUB-PARTIDAS':(this.opcfuente=='3'?'SUB PARTIDAS':this.arrtipins[4]));
    for(let filasubp of this.arrsubpart){//si buscamos desde las subpartidas, entonces ya no se agregaran duplicados, ya que agregariamos el primero
      if(filasubp.tieneacu==1){
        continue;
      }
      if(this.opcfuente=='1' && filasubp.codigo.toString()=='99'){
        continue;
      }
      for(let row of datos){
        if(this.opcfuente=='3'){
          row[arrind[10]]=row[arrind[10]]!=null?row[arrind[10]].toString().replace('%',''):[row[arrind[10]]];
        }
        if(indpartida){
          if(row[arrind[2]]==txrendimiento || (this.opcfuente=='3' && (row[arrind[2]]??'').toString().includes(txrendimiento))){//fila rendimiento
            let rendip=row[arrind[3]]==null?'0':isNaN(row[arrind[3]].toString().replace('MO.','').replace('EQ.',''))?'0':row[arrind[3]].toString().replace('MO.','').replace('EQ.','');//condiciona numero
            if(this.opcfuente=='3'){//sistema
              let arrrend=row[arrind[2]].toString().split("                   ");
              let elerend=arrrend[0].replace(/\s+/g, ' ');
              let elemod=elerend.replace('Rendimiento : ','');
              let arrelems=elemod.split(' ');
              rendip=arrelems[0]!=null?Number(arrelems[0]):'0';
            }
            let undrendip='GLOBAL';
            if(Number(rendip)!=0){
                undrendip='DIA';
            }
            let indpadre=-1;
            let fuente=1;//1detalle,2subpartidas
            for(let a2=0;a2<this.datadetalle.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
              if(indpartida.indice==this.datadetalle[a2].indice && indpartida.num_det==this.datadetalle[a2].num_det && indpartida.indice_subp==this.datadetalle[a2].indice_subp){
                indpadre=a2;
                break;
              }
            }//si no ecuentra , debe estar en datasubp?
            if(indpadre==-1){
              for(let a2=0;a2<this.datasubp.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
                if(indpartida.indice==this.datasubp[a2].indice && indpartida.num_det==this.datasubp[a2].num_det && indpartida.indice_subp==this.datasubp[a2].indice_subp){
                  indpadre=a2;
                  fuente=2;
                  break;
                }
              }
            }
            if(indpadre>=0){//actualizar el parcial?
              if(fuente==1){
                this.datadetalle[indpadre].rendimiento=this.formService.redondeo(rendip,2);
                this.datadetalle[indpadre].jornada=8;
                this.datadetalle[indpadre].und_rendi=undrendip;
              }
              else{
                this.datasubp[indpadre].rendimiento=this.formService.redondeo(rendip,2);
                this.datasubp[indpadre].jornada=8;
                this.datasubp[indpadre].und_rendi=undrendip;
              }
            }
          }
          else if(this.strvacionull(row[arrind[5]])!=null && this.strvacionull(row[arrind[8]])==null && this.strvacionull(row[arrind[11]])==null){//agrupacion detalle
            if(indpartida){
              if(row[arrind[5]].toString().toUpperCase()==txmano){//MANO DE OBRA
                agru=1;
                numdetaux=0;
              }
              else if(row[arrind[5]].toString().toUpperCase()==txmat){//MATERIALES
                agru=2;
                numdetaux=0;
              }
              else if(row[arrind[5]].toString().toUpperCase()==txequi){//EQUIPO
                agru=3;
                numdetaux=0;
              }
              else if(row[arrind[5]].toString().toUpperCase()==txsubcon){//SUB-CONTRATOS
                agru=4;
                numdetaux=0;
              }
              else if(row[arrind[5]].toString().toUpperCase()==txsubpar){//SUB-PARTIDAS
                agru=5;
                numdetaux=0;
              }
            }
          }
          else if(this.strvacionull(row[arrind[7]])!=null && this.strvacionull(row[arrind[8]])!=null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){//insumo, descripcion y precio (cantidad,parcial,unidad?)
            if(indpartida && agru!=0){//existe partida
              let codigop=row[arrind[6]]??'';
              let descp=row[arrind[7]]??'';//obligatorio
              if(descp==''){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Descripcion no cumple con el formato.',valor:row[arrind[7]],valor2:row[arrind[6]],tipo:'2'});
                error='1';
                continue;
              }
              let unidadp=row[arrind[8]]??'';//obligatorio
              if(unidadp==''){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Unidad no cumple con el formato.',valor:row[arrind[8]],valor2:row[arrind[7]],tipo:'2'});
                error='1';
                continue;
              }
              if(this.opcfuente=='1' || this.opcfuente=='3'){
                row[arrind[9]]=row[arrind[9]]=='-'?null:row[arrind[9]];
              }
              let cuadrillap=row[arrind[9]]==null?null:isNaN(row[arrind[9]])?'nocumple':row[arrind[9]];//condiciona numero
              if(cuadrillap=='nocumple'){
                //nocumple=true;//ya existen filas agregadas
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cuadrilla no cumple con el formato.',valor:row[arrind[9]],valor2:row[arrind[7]],tipo:'2'});
                error='1';
                continue;
              }
              let cantidadp=row[arrind[10]]==null?'nocumple':isNaN(row[arrind[10]])?'nocumple':row[arrind[10]];//condiciona numero
              if(cantidadp=='nocumple'){//obligatorio
                //nocumple=true;
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cantidad no cumple con el formato.',valor:row[arrind[10]],valor2:row[arrind[7]],tipo:'2'});
                error='2';
                continue;
              }
              let preciop=row[arrind[11]]==null?'nocumple':isNaN(row[arrind[11]])?'nocumple':row[arrind[11]];//condiciona numero
              preciop=cantidadp!=null && preciop==null?0:preciop;
              if(preciop=='nocumple'){//obligatorio
                //nocumple=true;
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Precio no cumple con el formato.',valor:row[arrind[11]],valor2:row[arrind[7]],tipo:'2'});
                error='2';
                continue;
              }
              //let parcialp=row[arrind[12]]==null?null:isNaN(row[arrind[12]])?'nocumple':row[arrind[12]];//condiciona numero
              let parcialp=row[arrind[12]]==null?0:isNaN(row[arrind[12]])?0:row[arrind[12]];
              let indice=indpartida.indice_subp;
              codigop=agru==5?codigop:codigop.toString().substring(this.opcfuente=="0"?2:0);
              let indunifp=codigop.length>=2?codigop.toString().substring(0,2):null;
              let indunfcorr=this.tindices.find(ele=>ele.id_indice==indunifp)
              if(!indunfcorr){
                indunifp=null;
              }
              numdetaux++;
              if(agru==5){//subpartida, //agregar indice[subp]
                preciop=0;
                cuadrillap=null;
                indunifp=null;
                parcialp=0;
                this.arrsubpart.push({indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toUpperCase().toString().trim().replace(/\s+/g, ' '),indice_subp:this.indiceadd,tieneacu:0,unidad:unidadp});
              }
              let afcuadp=agru==1 || agru==3?'1':'0';
              if(unidadp!=''){
                let exisund=this.arrund.find(ele=>ele.unidad1==unidadp);
                if(!exisund){
                  this.arrund.push({unidad1:unidadp,unidad2:null,descripcion:null,id_unidad:null,observacion:'Se creará como unidad simple al importar'});
                }
              }
              let cuadrired=cuadrillap?this.formService.redondeo(cuadrillap,8):null;
              let cantred=this.formService.redondeo(cantidadp,this.dec_cant);
              let preciored=this.formService.redondeo(preciop,this.dec_precio);
              let parcred=/* agru!=5?this.formService.redondeo(Number(cantred)*Number(preciored),this.dec_precio): */this.formService.redondeo(parcialp,this.dec_precio);
              let filaadd=this.nuevafiladeta(indice,null,agru,numdetaux,codigop,descp.toString().toUpperCase().trim().replace(/\s+/g, ' '),unidadp,cuadrired,cantred,preciored,parcred,indunifp,agru==5?'0':'1',afcuadp,null,null,null,agru==5?this.indiceadd++:null);
              arrauxdet.push(filaadd);//agregar insumo a arraux
              empieza=true;
            }
          }
          else {
            if(indpartida && agru!=0){//existe partida
              if(row[arrind[7]]==null && row[arrind[8]]!=null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Descripción no cumple con el formato.',valor:row[arrind[7]],valor2:row[arrind[0]],tipo:'2'});
              }
              if(row[arrind[7]]!=null && row[arrind[8]]==null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Unidad no cumple con el formato.',valor:row[arrind[8]],valor2:row[arrind[7]],tipo:'2'});
              }
              if(row[arrind[7]]!=null && row[arrind[8]]!=null && isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cantidad no cumple con el formato.',valor:row[arrind[10]],valor2:row[arrind[7]],tipo:'2'});
              }
              if(row[arrind[7]]!=null && row[arrind[8]]!=null && !isNaN(row[arrind[10]]??'nocumple') && isNaN(row[arrind[11]]??'nocumple')){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Precio no cumple con el formato.',valor:row[arrind[11]],valor2:row[arrind[7]],tipo:'2'});
              }
            }
          }
          //if(row[arrind[2]].toString().includes(txrendimiento)){ para delphin
          if((this.opcfuente=='0' && row[arrind[0]]==txpartida) || (this.opcfuente=='1' && row[arrind[13]]!=null && row[arrind[2]]?.toString().includes(txrendimiento))
            || (this.opcfuente=='3' && (row[arrind[0]]??'').toString().includes(txpartida))){//fin iteracion encuentra partida,inicia una partida 'Partida:', en delphin empieza con el codigo y el fin, crear otra condicion?
            let auxdetcomp=JSON.parse(JSON.stringify(this.tabladetlimp));
            for(let raux1 of auxdetcomp){
              raux1.indice=indpartida.indice_subp;
            }
            let total=0;
            let idfiladet=1;
            for(let row2 of arrauxdet){
              total+=Number(row2.parcial);
              row2.id_filadetalle=idfiladet++;
              if(row2.id_tipo_insumo!=5){
                let cant1=Number(row2.cantidad)
                let prec1=Number(row2.precio)
                let parc1=Number(row2.parcial)
                let resul1=((cant1*prec1)/100)-parc1;
                let margen=1/(10**this.dec_precio);
                row2.operador=resul1>-margen && resul1<margen?'%':null
              }
              else{
                row2.operador=null;
              }
              auxdetcomp.push(row2);
            }
            //buscar indice del rowsel en datadetalle?
            let indpadre=-1;
            let fuente=1;//1detalle,2subpartidas
            for(let a2=0;a2<this.datadetalle.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
              if(indpartida.indice==this.datadetalle[a2].indice && indpartida.num_det==this.datadetalle[a2].num_det && indpartida.indice_subp==this.datadetalle[a2].indice_subp){
                indpadre=a2;
                break;
              }
            }//si no ecuentra , debe estar en datasubp?
            if(indpadre==-1){
              for(let a2=0;a2<this.datasubp.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
                if(indpartida.indice==this.datasubp[a2].indice && indpartida.num_det==this.datasubp[a2].num_det && indpartida.indice_subp==this.datasubp[a2].indice_subp){
                  indpadre=a2;
                  fuente=2;
                  break;
                }
              }
            }
            if(indpadre>=0){
              if(fuente==1){
                filasubp.tieneacu=1
                this.datadetalle[indpadre].tieneacu=1;
                this.datadetalle[indpadre].advceros=0;
                this.datadetalle[indpadre].precio=this.formService.redondeo(total,this.dec_precio);
                let parc=Number(this.datadetalle[indpadre].precio)*Number(this.datadetalle[indpadre].cantidad);
                this.datadetalle[indpadre].parcial=this.formService.redondeo(parc,this.dec_precio);
              }
              else{
                filasubp.tieneacu=1
                this.datasubp[indpadre].tieneacu=1;
                this.datasubp[indpadre].advceros=0;
                this.datasubp[indpadre].precio=this.formService.redondeo(total,this.dec_precio);
                let parc=Number(this.datasubp[indpadre].precio)*Number(this.datasubp[indpadre].cantidad);
                this.datasubp[indpadre].parcial=this.formService.redondeo(parc,this.dec_precio);
              }
              this.datasubp=this.datasubp.concat(auxdetcomp);
            }
            else{
              console.log(row)
            }
            indpartida=null;
            agru=0;
            arrauxdet=[];
            break;
          }
        }
        else{
          if((this.opcfuente=='0' && row[arrind[0]]==txpartida) || (this.opcfuente=='1' && row[arrind[13]]!=null && row[arrind[2]]?.toString().includes(txrendimiento))
            || (this.opcfuente=='3' && (row[arrind[0]]??'').toString().includes(txpartida))){//inicia una partida 'Partida:' en delphin empieza con el codigo y el fin, crear otra condicion?, delphin compara con el idsubp
            let itemact=row[arrind[13]]!=null?row[arrind[13]].toString():'';//descripcion e codigo de subpartida concatenados (900303050103-0401003-01) split y pos0
            if(this.opcfuente=='3'){
              let separad=row[arrind[0]].toString().split('          ');
              itemact=separad[0].replace('Codigo :','').replace(/\s+/g, '');
            }
            let codigosubp='';
            if(this.opcfuente=='0'){
              if(itemact!=''){//verificar que exista -
                itemact=itemact.replace(/\(/g,'')
                if(itemact.includes('-')){
                  codigosubp=itemact.split('-')[0];
                }
                else if(itemact.includes(')')){
                  codigosubp=itemact.split(')')[0];
                }
                else{
                  codigosubp=itemact
                }
              }
            }
            else{ codigosubp=itemact; }//delphin y avanzado?
            let itemp=codigosubp!=''?codigosubp:'nocumple';//corregir item
            if(itemp=='nocumple'){
              /* error='0'; */
              continue;
            }
            if(filasubp.codigo.toString().toUpperCase()==itemp.toString().toUpperCase()){//existe se agregan los costos unitarios
              indpartida=JSON.parse(JSON.stringify(filasubp));
              agru=0;
              arrauxdet=[];
              //agregar undrendi y rendimiento(en la misma fila delphin)
              if(this.opcfuente=='1'){//delphin (Rendimiento:3 und/Día)
                let indpadre=-1;
                let fuente=1;//1detalle,2subpartidas
                for(let a2=0;a2<this.datadetalle.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
                  if(indpartida.indice==this.datadetalle[a2].indice && indpartida.num_det==this.datadetalle[a2].num_det && indpartida.indice_subp==this.datadetalle[a2].indice_subp){
                    indpadre=a2;
                    break;
                  }
                }//si no ecuentra , debe estar en datasubp?
                if(indpadre==-1){
                  for(let a2=0;a2<this.datasubp.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
                    if(indpartida.indice==this.datasubp[a2].indice && indpartida.num_det==this.datasubp[a2].num_det && indpartida.indice_subp==this.datasubp[a2].indice_subp){
                      indpadre=a2;
                      fuente=2;
                      break;
                    }
                  }
                }
                if(indpadre>=0){//actualizar el parcial?
                  let arrmodi=fuente==1?this.datadetalle:this.datasubp;
                  if(row[arrind[2]].toString().includes(txrendimiento)){
                    let arrrend=row[arrind[2]].toString().split(" ");
                    let rendpas=Number(arrrend[0].replace(txrendimiento,''));
                    let undrendp='GLOBAL';
                    if(rendpas!=0 && arrrend[1].includes('/')){
                      undrendp=arrrend[1].split('/')[1].toUpperCase()=="DÍA" || arrrend[1].split('/')[1].toUpperCase()=="DIA"?'DIA':'GLOBAL';
                    }
                    arrmodi[indpadre].rendimiento=this.formService.redondeo(rendpas,2);
                    arrmodi[indpadre].jornada=8;
                    arrmodi[indpadre].und_rendi=undrendp;
                  }
                  else{
                    arrmodi[indpadre].rendimiento=this.formService.redondeo(0,2);
                    arrmodi[indpadre].jornada=8;
                    arrmodi[indpadre].und_rendi='GLOBAL';
                  }
                }
              }
            }//no existe no se hace nada, no hay partida a cual vincular
          }
        }
      }
      if(indpartida){
        let auxdetcomp=JSON.parse(JSON.stringify(this.tabladetlimp));
        for(let raux1 of auxdetcomp){
          raux1.indice=indpartida.indice_subp;
        }
        let total=0;
        let idfiladet=1;
        for(let row2 of arrauxdet){
          total+=Number(row2.parcial);
          row2.id_filadetalle=idfiladet++;
          if(row2.id_tipo_insumo!=5){
            let cant1=Number(row2.cantidad)
            let prec1=Number(row2.precio)
            let parc1=Number(row2.parcial)
            let resul1=((cant1*prec1)/100)-parc1;
            let margen=1/(10**this.dec_precio);
            row2.operador=resul1>-margen && resul1<margen?'%':null
          }
          else{
            row2.operador=null;
          }
          auxdetcomp.push(row2);
        }
        //buscar indice del rowsel en datadetalle?
        let indpadre=-1;
        let fuente=1;//1detalle,2subpartidas
        for(let a2=0;a2<this.datadetalle.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
          if(indpartida.indice==this.datadetalle[a2].indice && indpartida.num_det==this.datadetalle[a2].num_det && indpartida.indice_subp==this.datadetalle[a2].indice_subp){
            indpadre=a2;
            break;
          }
        }//si no ecuentra , debe estar en datasubp?
        if(indpadre==-1){
          for(let a2=0;a2<this.datasubp.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
            if(indpartida.indice==this.datasubp[a2].indice && indpartida.num_det==this.datasubp[a2].num_det && indpartida.indice_subp==this.datasubp[a2].indice_subp){
              indpadre=a2;
              fuente=2;
              break;
            }
          }
        }
        if(indpadre>=0){//actualizar el parcial?
          if(fuente==1){
            this.datadetalle[indpadre].tieneacu=1;
            this.datadetalle[indpadre].advceros=0;
            this.datadetalle[indpadre].precio=this.formService.redondeo(total,this.dec_precio);
            let parc=Number(this.datadetalle[indpadre].precio)*Number(this.datadetalle[indpadre].cantidad);
            this.datadetalle[indpadre].parcial=this.formService.redondeo(parc,this.dec_precio);
          }
          else{
            this.datasubp[indpadre].tieneacu=1;
            this.datasubp[indpadre].advceros=0;
            this.datasubp[indpadre].precio=this.formService.redondeo(total,this.dec_precio);
            let parc=Number(this.datasubp[indpadre].precio)*Number(this.datasubp[indpadre].cantidad);
            this.datasubp[indpadre].parcial=this.formService.redondeo(parc,this.dec_precio);
          }
          this.datasubp=this.datasubp.concat(auxdetcomp);
        }
        for(let row of this.arrsubpart){
          if(row.indice==indpartida.indice && row.num_det==indpartida.num_det && row.indice_subp==indpartida.indice_subp){
            row.tieneacu=1;
          }
        }
        indpartida=null;
        agru=0;
        arrauxdet=[];
      }
    }
    //reiniciar paramtetros
    indpartida=null;
    agru=0;
    arrauxdet=[];
    console.log('arrsubpart',JSON.parse(JSON.stringify(this.arrsubpart)))
    if(!empieza){
      error=error==''?'No se agrego ninguna fila.La Hoja de Cálculo ingresada no cumple con la fuente seleccionada para Subpartidas.':error;
      nocumple=true;
    }
    if(nocumple){//especificar errores?, usar los items de partida para saber cual es el incorrecto?
      this.toaster.error(error, 'Error Subpartidas', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:null,error:'No se agrego ninguna fila.La Hoja de Cálculo ingresada no cumple con la fuente seleccionada para Subpartidas.',valor:null,valor2:null,tipo:'2'});
    }
  }
  cambindiceselund(ind:any){
      this.filaSelund = ind;
  }
  cambindiceselobs(ind:any){
      this.filaSelobs = ind;
  }
  async VinculaUnd(){
    this.mostrar_carga_todo=true;
    const tabla1=JSON.stringify(this.arrund);
    const dataProyecto=JSON.stringify({
      'id_usuario': this.idUsuario,
      'datos1':tabla1,
    });
    const resp = await this.presuservice.VincularUndImp(dataProyecto)
    if(resp){
      this.arrund=resp;
      this.OrderUnd();
    }
    this.mostrar_carga_todo = false;
  }
  async VinculaUno(ind:any){
    this.mostrar_carga_todo = true
    let tablaunid = await this.administradorService.listarUnidadMed({ id_usuario:this.idUsuario,fuente:'',activo: 1,operador:0 })//cambiar a dinamico u otra consulta que retorne todo
    const modalRef = await this.modalService.open(BuscaaddunidadmedComponent, { size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
    modalRef.componentInstance.Listaunidades = tablaunid;
    modalRef.componentInstance.operador = 0;
    modalRef.componentInstance.fuentepasa=1;
    modalRef.componentInstance.iduser=this.idUsuario;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      this.arrund[ind].unidad2=result.datosel.unidad;
      this.arrund[ind].descripcion=result.datosel.descripcion;
      this.arrund[ind].id_unidad=result.datosel.id_unidad;
      this.arrund[ind].observacion=this.arrund[ind].unidad1.includes('%') && result.datosel.operador!='%'?'Se asigno una unidad simple.':'';
      this.OrderUnd();
    }
  }
  DesVinculaUno(ind:any){
    this.arrund[ind].unidad2=null;
    this.arrund[ind].descripcion=null;
    this.arrund[ind].id_unidad=null;
    this.arrund[ind].observacion='Se creará como unidad simple al importar';
    this.OrderUnd();
  }
  OrderUnd(){
    if(this.arrund.length>0){
      this.arrund.sort( (a, b) => {
        if((a.unidad2==null) && (b.unidad2!=null)) {
          return -1;
        }
        if((a.unidad2!=null) && (b.unidad2==null)) {
          return 1;
        }
        if (a.unidad1.includes('%') && !(b.unidad1.includes('%'))) {
          return -1;
        }
        if (!(a.unidad1.includes('%')) > b.unidad1.includes('%')) {
          return 1;
        }
        return 0;
      });
    }
  }
  Regresar(){
    if(this.confav){
      if(this.activetab==2){
        this.activetab=1;
      }
      else{
        this.activetab=2;
      }
    }else{
      if(this.opcfuente=='2' && this.activetab==3){
        this.activetab=2
      }
      else{
        this.activetab=1;
      }
    }
  }
  //config avanzada indices
  cambiarindice1(ind:any,valor:any,ntabla:any){
    if(ntabla.length>0){
      ntabla[ind]=valor;
    }
  }
  async Siguiente(){
    this.activetab2=11;
    if(this.opcfuente=='2' || (this.opcfuente!='2' && this.confav)){
      if(this.filapresu!=null){
        let conthoj=0;//presu
        let arrdet=[];
        let conthojas=0;//detalle
        for(let hoja of this.filapresu.hojas){
          if(hoja.selec=='1'){
            conthoj++;
            for(let filas of this.filasacu){
              for(let hojad of filas.hojas){
                if(hojad.selec=='1'){
                  conthojas++;
                  let encuarc=arrdet.find(ele=>ele.nombre==filas.nombre);
                  if(!encuarc){
                    arrdet.push(filas)
                  }
                }
              }
            }
            /* //validar filas subpartidas?
            if(conthojas==0){//se agrega sin detalle
              const respu=await SwalService.confirm('Esta seguro que desea agregar solo Presupuesto?','No selecciono datos para COSTOS UNITARIOS.');
              if(!respu.isConfirmed){
                return;
              }
            } */
            //reiniciar variables
            this.data=[];
            this.datadis1=[];
            this.columnsadd1=[];
            const ws: XLSX.WorkSheet = this.filapresu.arcexcel.Sheets[hoja.nombre];
            this.data = XLSX.utils.sheet_to_json(ws, { header: 1 , blankrows:false });
            let aux=[];
            let ancho=0;
            for(let i=0;i<this.data.length;i++){
                aux.push(this.data[i])
                if(this.data[i].length>ancho){
                  ancho=this.data[i].length;
                }
                if(aux.length==100){
                  i=this.data.length;
                }
            }
            for(let f=0;f<ancho;f++){
              this.columnsadd1.push(f.toString());
            }
            this.datadis1=JSON.parse(JSON.stringify(aux));
            //agregar detalles y sbupartidas
            let cargadet=false;
            this.data2=[];
            this.datadis2=[];
            this.columnsadd2=[];
            aux=[];
            ancho=0;
            for(let filaar of arrdet){
              for(let hoja of filaar.hojas){
                if(hoja.selec=='1'){
                  const ws: XLSX.WorkSheet = filaar.arcexcel.Sheets[hoja.nombre];
                  this.data2 = (XLSX.utils.sheet_to_json(ws, { header: 1, blankrows:false }));
                  for(let i=0;i<this.data2.length;i++){
                    aux.push(this.data2[i])
                    if(this.data2[i].length>ancho){
                      ancho=this.data2[i].length;
                    }
                    if(aux.length==100){
                      i=this.data2.length;
                    }
                  }
                  this.exisacu=true;
                  cargadet=true;
                  break;
                }
              }
              if(cargadet){break;}
            }
            for(let f=0;f<ancho;f++){
              this.columnsadd2.push(f.toString());
            }
            this.datadis2=JSON.parse(JSON.stringify(aux));
            //subpartidas
            let cargasub=false;
            this.data3=[];
            this.datadis3=[];
            this.columnsadd3=[];
            aux=[];
            ancho=0;
            for(let filaar of this.filassubp){//cargar subpartidas
              for(let hoja of filaar.hojas){
                if(hoja.selec=='1'){
                  const ws: XLSX.WorkSheet = filaar.arcexcel.Sheets[hoja.nombre];
                  this.data3 = (XLSX.utils.sheet_to_json(ws, { header: 1, blankrows:false }));
                  for(let i=0;i<this.data3.length;i++){
                    aux.push(this.data3[i]);
                    if(this.data3[i].length>ancho){
                      ancho=this.data3[i].length;
                    }
                    if(aux.length==100){
                      i=this.data3.length;
                    }
                  }
                  this.exissubp=true;
                  cargasub=true;
                  break;
                }
              }
              if(cargasub){break};
            }
            for(let f=0;f<ancho;f++){
              this.columnsadd3.push(f.toString());
            }
            this.datadis3=JSON.parse(JSON.stringify(aux));
          }
        }
        if(conthoj==0){
          this.toaster.error('Seleccione una Hoja de Cálculo para agregar a Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        }
        else{
          this.activetab=2;//condicionar con codigo abajo
        }
      }
      else{
        this.toaster.error('Seleccione un archivo para agregar a Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      }
    }
    else{
      this.Procesar(0);
    }
  }
  CopiarConfig(){
    this.dataselcol3=JSON.parse(JSON.stringify(this.dataselcol2));
    if(this.opcfuente=="0"){
      this.dataselcol3[3]='';
      this.dataselcol3[5]='';
      this.dataselcol3[6]='';
    }
    for(let a=0;a<this.dataselcol3.length;a++){
      if(Number(this.dataselcol3[a])>=this.columnsadd3.length){
        this.dataselcol3[a]='';
      }
    }
  }
  async Procesar2(){
    console.log('proc2')
    if(this.confav || this.opcfuente=='2'){
      let cump1=true;
      for(let elem of this.dataselcol){//para los 3 arreglos
        if(elem==''){
          cump1=false;
          break;
        }
      }
      if(!cump1){
        this.toaster.error('Debe asignar todas las columnas en Presupuesto para importar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        return;
      }
      if(this.exisacu){
        let cump2=true;
        for(let el=0;el<this.dataselcol2.length;el++){
          if(!(el==0 || el==2 || el==13) && this.dataselcol2[el]==''){//0,2,13
            cump2=false;
            break;
          }
        }
        if(!cump2){
          this.toaster.error('Debe asignar todas las columnas en Costos Unitarios para importar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
          return;
        }
        let cumptipoins=true;
        if(this.opcfuente=='2'){
          for(let row of this.arrtipins){
            if(row==''){
              cumptipoins=false;
            }
          }
          if(!cumptipoins){
            this.toaster.error('La Configuracion de Tipos de Insumos no permite vacios.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
            return;
          }
        }
      }
      if(this.exissubp){
        let cump3=true;
        for(let el=0;el<this.dataselcol3.length;el++){
          if(!(el==0 || el==1 || el==2) && this.dataselcol3[el]==''){//0,1,2
            cump3=false;
            break;
          }
        }
        if(!cump3){
          this.toaster.error('Debe asignar todas las columnas en Costos Unitarios para importar.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
          return;
        }
        let cumptipoins=true;
        if(this.opcfuente=='2'){
          for(let row of this.arrtipins){
            if(row==''){
              cumptipoins=false;
            }
          }
          if(!cumptipoins){
            this.toaster.error('La Configuracion de Tipos de Insumos no permite vacios.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
            return;
          }
        }
      }
    }
    this.mostrar_carga_todo=true;
    this.errpresu=[];
    this.erracu=[];
    this.errsubp=[];
    //validar seleccion obligatoria de presu
    if(this.filapresu!=null){
      let conthoj=0;//presu
      let arrdet=[];
      let conthojas=0;//detalle
      for(let hoja of this.filapresu.hojas){
        if(hoja.selec=='1'){
          conthoj++;
          for(let filas of this.filasacu){
            for(let hojad of filas.hojas){
              if(hojad.selec=='1'){
                conthojas++;
                let encuarc=arrdet.find(ele=>ele.nombre==filas.nombre);
                if(!encuarc){
                  arrdet.push(filas)
                }
              }
            }
          }
          //validar filas subpartidas?
          if(conthojas==0){//se agrega sin detalle
            const respu=await SwalService.confirm('Esta seguro que desea agregar solo Presupuesto?','No selecciono datos para COSTOS UNITARIOS.');
            if(!respu.isConfirmed){
              return;
            }
          }
          //reiniciar variables
          this.indiceadd=1;
          this.datapresu=[];
          this.arrpartidas=[];
          this.datadetalle=[];
          this.arrsubpart=[];
          this.datasubp=[];
          this.arrund=[];
          this.filaSelund=-1;
          const ws: XLSX.WorkSheet = this.filapresu.arcexcel.Sheets[hoja.nombre];
          this.data = (XLSX.utils.sheet_to_json(ws, { header: 1, blankrows:false }));
          let aux=[];
          for(let i=0;i<this.data.length;i++){
              aux.push(this.data[i]);
              aux[aux.length-1].idex=i+1;
          }
          //carga presu
          let arrindpasa=this.opcfuente=="0"?JSON.parse(JSON.stringify(this.s10presu)):this.opcfuente=="1"?JSON.parse(JSON.stringify(this.delppresu)):this.opcfuente=="3"?JSON.parse(JSON.stringify(this.sispresu)):[];
          let arrinddetp=this.opcfuente=="0"?JSON.parse(JSON.stringify(this.s10acu)):this.opcfuente=="1"?JSON.parse(JSON.stringify(this.delpacu)):this.opcfuente=="3"?JSON.parse(JSON.stringify(this.sisacu)):[];
          let arrindsubp=this.opcfuente=="0"?JSON.parse(JSON.stringify(this.s10subp)):this.opcfuente=="1"?JSON.parse(JSON.stringify(this.delpacu)):this.opcfuente=="3"?JSON.parse(JSON.stringify(this.sisacu)):[];
          let arrinds=[];
          if(this.confav || this.opcfuente=='2'){
            for(let ab=0;ab<this.dataselcol.length;ab++){
              arrindpasa[ab]=Number(this.dataselcol[ab]);
            }
            for(let ab=0;ab<this.dataselcol2.length;ab++){
              arrinddetp[ab]=Number(this.dataselcol2[ab]);
              if(ab==13){
                arrinddetp[ab]=Number(this.dataselcol3[13]);
              }
            }
            for(let ab=0;ab<this.dataselcol3.length;ab++){
              arrindsubp[ab]=Number(this.dataselcol3[ab]);
              if(ab==1){
                arrindsubp[ab]=Number(this.dataselcol2[1]);
              }
            }
          }
          else{
            if(this.opcfuente=='0'){//s10, buscar los indices de las columnas
              for(let m=0;m<aux.length;m++){
                for(let n=0;n<aux[m].length;n++){
                  if(aux[m][n]?.toString().toUpperCase()=='ITEM'){
                    arrinds.push(n);
                  }
                  if(aux[m][n]?.toString().toUpperCase()=='DESCRIPCIÓN'){
                    arrinds.push(n);
                  }
                  if(aux[m][n]?.toString().toUpperCase()=='UND.'){
                    arrinds.push(n);
                  }
                  if(aux[m][n]?.toString().toUpperCase()=='METRADO'){
                    arrinds.push(n);
                  }
                  if(aux[m][n]?.toString().toUpperCase().replace(/\//g,'')=='PRECIO S.'){
                    arrinds.push(n);
                  }
                  if(aux[m][n]?.toString().toUpperCase().replace(/\//g,'')=='PARCIAL S.'){
                    arrinds.push(n);
                  }
                }
                if(arrinds.length>0){
                  break;
                }
              }
              if(arrinds.length!=6){
                this.toaster.error('La Hoja de Cálculo ingresada no cumple con la fuente seleccionada.', 'Error1', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
                return;
              }
              else{
                arrindpasa=arrinds;
              }
            }
          }
          let result=this.cargartabla(aux,arrindpasa,this.filapresu.nombre)//verificar que existan todos los items
          if(result==''){
            if(this.datapresu.length>4500){
              this.toaster.error('La cantidad de partidas a importar no puede ser mayor a 4500.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
              return;
            }
            for(let filaar of arrdet){
              for(let hoja of filaar.hojas){
                if(hoja.selec=='1'){
                  const ws: XLSX.WorkSheet = filaar.arcexcel.Sheets[hoja.nombre];
                  this.data = (XLSX.utils.sheet_to_json(ws, { header: 1, blankrows:false }));
                  let aux=[];
                  for(let i=0;i<this.data.length;i++){
                    aux.push(this.data[i]);
                    aux[aux.length-1].idex=i+1;
                  }
                  this.cargartablaDet2(aux,arrinddetp,filaar.nombre,hoja.nombre);
                }
              }
            }
            for(let filaar of this.filassubp){//cargar subpartidas
              for(let hoja of filaar.hojas){
                if(hoja.selec=='1'){
                  const ws: XLSX.WorkSheet = filaar.arcexcel.Sheets[hoja.nombre];
                  this.data = (XLSX.utils.sheet_to_json(ws, { header: 1, blankrows:false }));
                  let aux=[];
                  for(let i=0;i<this.data.length;i++){
                    aux.push(this.data[i]);
                    aux[aux.length-1].idex=i+1;
                  }
                  this.cargartablaSubp2(aux,arrindsubp,filaar.nombre,hoja.nombre)
                }
              }
            }
            //si hay costos unitarios recalcular totales
            if(this.datadetalle.length>0){
              let parcag=0;
              let indoper=-1;
              for(let a1=this.datasubp.length-1;a1>=0;a1--){
                if(Number(this.datasubp[a1].id_tipo_insumo==5)){
                  parcag+=Number(this.datasubp[a1].parcial);
                  indoper=this.datasubp[a1].indice;
                }
                else if((a1==0 || this.datasubp[a1].indice!=indoper) && parcag>0){//num_det==0 no existe
                  let indpadre=-1;
                  let fuente=1;//1detalle,2subpartidas
                  for(let m=0;m<this.datasubp.length;m++){
                    if(this.datasubp[a1].indice==this.datasubp[m].indice_subp){
                      indpadre=m;
                      break;
                    }
                  }//si no ecuentra , debe estar en datasubp?
                  if(indpadre==-1){
                    for(let n=0;n<this.datadetalle.length;n++){
                      if(this.datasubp[a1].indice==this.datadetalle[n].indice_subp){
                        indpadre=n;
                        fuente=2;
                        break;
                      }
                    }
                  }
                  if(indpadre>=0){//actualizar el parcial
                    if(fuente==1){
                      let cant=Number(this.datasubp[indpadre].cantidad);
                      let precio=Number(this.datasubp[indpadre].precio);
                      this.datasubp[indpadre].precio=this.formService.redondeo(precio+parcag,this.dec_precio);
                      this.datasubp[indpadre].parcial=this.formService.redondeo(cant*Number(this.datasubp[indpadre].precio),this.dec_precio);
                    }
                    else{
                      let cant=Number(this.datadetalle[indpadre].cantidad);
                      let precio=Number(this.datadetalle[indpadre].precio);
                      this.datadetalle[indpadre].precio=this.formService.redondeo(precio+parcag,this.dec_precio);
                      this.datadetalle[indpadre].parcial=this.formService.redondeo(cant*Number(this.datadetalle[indpadre].precio),this.dec_precio);
                    }
                  }
                  //limpiar variables
                  parcag=0;
                }
              }
              parcag=0;
              let prec1=0;
              let indpad=-1;
              indoper=-1;
              for(let a2=this.datadetalle.length-1;a2>=0;a2--){//sumar todo, porque se inicia con 0//pendiente
                if(indpad==-1){
                  indpad=this.datadetalle[a2].indice;
                  prec1+=Number(this.datadetalle[a2].parcial);
                }
                else{
                  if(indpad!=this.datadetalle[a2].indice){
                    //actualiza padre
                    for(let m=0;m<this.datapresu.length;m++){
                      if(this.datapresu[m].indice==indpad){
                        this.datapresu[m].precio=this.formService.redondeo(prec1,this.dec_precio);
                        this.datapresu[m].parcial=this.formService.redondeo(Number(this.datapresu[m].precio)*Number(this.datapresu[m].cantidad),this.dec_precio);
                        break;
                      }
                    }
                    indpad=this.datadetalle[a2].indice;
                    prec1=0;
                    prec1+=Number(this.datadetalle[a2].parcial);
                  }
                  else{
                      prec1+=Number(this.datadetalle[a2].parcial);
                  }
                }
                if(a2==0){//actua padre, tambien se opera la fila 0, puede ser una subpartida o insumo
                  for(let m=0;m<this.datapresu.length;m++){
                    if(this.datapresu[m].indice==indpad){
                      this.datapresu[m].precio=this.formService.redondeo(prec1,this.dec_precio);
                      this.datapresu[m].parcial=this.formService.redondeo(Number(this.datapresu[m].precio)*Number(this.datapresu[m].cantidad),this.dec_precio);
                      break;
                    }
                  }
                }
              }
              //recalcular totales grupos presu
              let indtit=[];
              let tottit=[];
              let itemtit=[];
              for (let c = 0; c < this.datapresu.length; c++)
              {
                if (this.datapresu[c].unidad == "")//titulos
                {
                  for (let t = itemtit.length - 1; t >= 0; t--)
                  {
                    let itemtem = this.datapresu[c].item;
                    let itemfila = itemtem.Length <= itemtit[t].length + 1 ? "-" : itemtem.substring(0, itemtit[t].length + 1);
                    if (itemtit[t] + "." != itemfila)//si no es predecesor, se actualizan y eliminan los titulos
                    {
                      this.datapresu[indtit[t]].parcial = this.formService.redondeo(tottit[t], this.dec_parcial);
                      indtit.splice(t,1);
                      tottit.splice(t,1);
                      itemtit.splice(t,1);
                    }
                  }
                  indtit.push(c);
                  tottit.push(0);
                  itemtit.push(this.datapresu[c].item);
                }
                else//partidas
                {
                  for(let t = itemtit.length-1; t >= 0;t--)
                  {
                    let itemtem = this.datapresu[c].item;
                    let itemfila = itemtem.Length <= itemtit[t].length + 1 ? "-" : itemtem.substring(0, itemtit[t].length + 1);
                    if (itemtit[t]+"."==itemfila)
                    {
                      tottit[t] += Number(this.datapresu[c].parcial);
                    }
                    else//si no es predecesor, se actualizan y eliminan los titulos
                    {
                      this.datapresu[indtit[t]].parcial = this.formService.redondeo(tottit[t],this.dec_parcial);
                      indtit.splice(t,1);
                      tottit.splice(t,1);
                      itemtit.splice(t,1);
                    }
                  }
                }
              }
              if(itemtit.length>0){//actualizar totales
                for (let t = itemtit.length - 1; t >= 0; t--)
                {
                  this.datapresu[indtit[t]].parcial = this.formService.redondeo(tottit[t], this.dec_parcial);
                  indtit.splice(t,1);
                  tottit.splice(t,1);
                  itemtit.splice(t,1);
                }
              }
            }
            //juntar todas los errores
            if(this.erracu.length>0){
              this.erracu.concat(this.errsubp);
            }
            else{
              this.erracu=this.errsubp;
            }
            //await this.VinculaUnd();
            this.activetab=3;
          }
        }
      }
      if(conthoj==0){
        this.toaster.error('Seleccione una Hoja de Cálculo para agregar a Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      }
    }
    else{
      this.toaster.error('Seleccione un archivo para agregar a Presupuesto.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
    }
    this.mostrar_carga_todo=false;
  }
  cargartablaDet2(datos:any,arrind:any,nomexcel:any,nomhoja:any){//no usar palabras clave
    let empieza=false;
    let nocumple=false;
    let error='';
    let indpartida;
    let agru=0;
    let numdetaux=0;
    let arrauxdet=[];
    let txmano=this.opcfuente=='0'?'MANO DE OBRA':(this.opcfuente=='1'?'MANO DE OBRA':(this.opcfuente=='3'?'MANO DE OBRA':this.arrtipins[0].toUpperCase()));
    let txmat=this.opcfuente=='0'?'MATERIALES':(this.opcfuente=='1'?'MATERIALES':(this.opcfuente=='3'?'MATERIALES':this.arrtipins[1].toUpperCase()));
    let txequi=this.opcfuente=='0'?'EQUIPOS':(this.opcfuente=='1'?'EQUIPO':(this.opcfuente=='3'?'EQUIPO':this.arrtipins[2].toUpperCase()));
    let txsubcon=this.opcfuente=='0'?'SUBCONTRATOS':(this.opcfuente=='1'?'SUB-CONTRATOS':(this.opcfuente=='3'?'SUB CONTRATOS':this.arrtipins[3].toUpperCase()));
    let txsubpar=this.opcfuente=='0'?'SUBPARTIDAS':(this.opcfuente=='1'?'SUB-PARTIDAS':(this.opcfuente=='3'?'SUB PARTIDAS':this.arrtipins[4].toUpperCase()));
    //[partida,item,txrendi,valrendi,undrendi,agrupacion,codigo,descripcion,unidad,cuadrilla,cantidad,precio,parcial]
    let conttit=0;
    for(let row of datos){
      if(this.opcfuente=='3'){
        row[arrind[10]]=row[arrind[10]]!=null?row[arrind[10]].toString().replace('%',''):[row[arrind[10]]];
      }
      let itemact=row[arrind[1]]!=null?row[arrind[1]].toString():null;
      if(this.opcfuente=='3' && this.strvacionull(row[arrind[1]])!=null){
        let separad=row[arrind[1]].toString().split('             ');
        itemact=separad[0].replace('Partida:','').replace(/\s+/g, '');
      }
      let itemval=itemact?(isNaN(itemact.replace(/\./g,''))?null:itemact):null;
      let itemp=itemval?(itemval.includes('.')?this.Corrigeitem(itemact):'nocumple'):'nocumple';//corregir item
      if(itemp!='nocumple'){//pueden haber otros registros en la misma columna, se puede condicionar por verificar item para saber donde termina una partida
        let rowpart=this.arrpartidas.find(ele=>ele.item==itemp);
        //buscar rendimiento, und_rendi en la misma fila
        if(rowpart){//existe se agregan los costos unitarios
          if(row[arrind[4]]!=null){//und rendi nunca es null
            if(this.opcfuente=='1'){//delphin (Rendimiento:3 und/Día)
              let arrrend=row[arrind[3]].toString().split(" ");
              let rendpas=Number(arrrend[0].replace('Rendimiento:',''));
              let undrendp='GLOBAL';
              if(rendpas!=0 && arrrend[1].includes('/')){
                undrendp=arrrend[1].split('/')[1].toUpperCase()=="DÍA" || arrrend[1].split('/')[1].toUpperCase()=="DIA"?'DIA':'GLOBAL';
              }
              this.datapresu[rowpart.ind].rendimiento=this.formService.redondeo(rendpas,2);
              this.datapresu[rowpart.ind].jornada=8;
              this.datapresu[rowpart.ind].und_rendi=undrendp;
            }
            else{//si no hay contenido que coincida, buscar en la siguiente fila
              let rendip=row[arrind[3]]==null?'0':isNaN(row[arrind[3]])?'0':row[arrind[3]];//condiciona numero
              let undrendip='GLOBAL';
              if(Number(rendip)!=0){
                undrendip='DIA';
              }
              this.datapresu[rowpart.ind].rendimiento=this.formService.redondeo(rendip,2);
              this.datapresu[rowpart.ind].jornada=8;
              this.datapresu[rowpart.ind].und_rendi=undrendip;
            }
          }
          else{
            this.datapresu[rowpart.ind].rendimiento=this.formService.redondeo(0,2);
            this.datapresu[rowpart.ind].jornada=8;
            this.datapresu[rowpart.ind].und_rendi='GLOBAL';
          }
          let auxdetcomp=[];
          if(indpartida){
            let total=0;
            let idfiladet=1;
            for(let row2 of arrauxdet){
              total+=Number(row2.parcial);
              row2.id_filadetalle=idfiladet++;
              if(row2.id_tipo_insumo!=5){
                let cant1=Number(row2.cantidad)
                let prec1=Number(row2.precio)
                let parc1=Number(row2.parcial)
                let resul1=((cant1*prec1)/100)-parc1;
                let margen=1/(10**this.dec_precio);
                row2.operador=resul1>-margen && resul1<margen?'%':null
              }
              else{
                row2.operador=null;
              }
              auxdetcomp.push(row2);
            }
            if(arrauxdet.length>0){
              indpartida.tieneacu=1;
              this.datapresu[indpartida.ind].tieneacu=1;
              this.datapresu[indpartida.ind].advceros=0;
              this.datapresu[indpartida.ind].precio=this.formService.redondeo(total,this.dec_precio);
              this.datapresu[indpartida.ind].parcial=this.formService.redondeo(Number(this.formService.redondeo(total,this.dec_precio))*Number(this.datapresu[indpartida.ind].cantidad),this.dec_parcial);
            }
            this.datadetalle=this.datadetalle.concat(auxdetcomp);
          }
          //reiniciar parametros
          conttit=0;
          indpartida=rowpart;
          agru=0;
          arrauxdet=[];
        }//no existe no se hace nada, no hay partida a cual vincular
      }
      else if(indpartida){//ya encontro la partida,buscar los demas elementos
        if(this.strvacionull(row[arrind[7]])!=null && this.strvacionull(row[arrind[8]])!=null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){//insumo
          if(agru!=0 && conttit==1){//existe partida
            if(indpartida.tieneacu==0){
              let codigop=row[arrind[6]]??'';
              let descp=row[arrind[7]]??'';
              if(descp==''){
                this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Descripcion no cumple con el formato.',valor:row[arrind[7]],valor2:row[arrind[6]],tipo:'1'});
                error='1';
                continue;
              }
              let unidadp=row[arrind[8]]??'';
              if(unidadp==''){
                this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Unidad no cumple con el formato.',valor:row[arrind[8]],valor2:row[arrind[7]],tipo:'1'});
                error='1';
                continue;
              }
              if(this.opcfuente=='1' || this.opcfuente=='3'){
                row[arrind[9]]=row[arrind[9]]=='-'?null:row[arrind[9]];
              }
              let val9=row[arrind[9]]==' '?null:row[arrind[9]];
              let cuadrillap=val9==null?null:isNaN(val9)?'nocumple':val9;//condiciona numero,delhpin '-' en vez de vacio
              if(cuadrillap=='nocumple'){
                //nocumple=true;//ya existen filas agregadas
                this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cuadrilla no cumple con el formato.',valor:row[arrind[9]],valor2:row[arrind[7]],tipo:'1'});
                error='1';
                continue;
              }
              let cantidadp=row[arrind[10]]==null?'nocumple':isNaN(row[arrind[10]])?'nocumple':row[arrind[10]];//condiciona numero
              if(cantidadp=='nocumple'){
                //nocumple=true;
                this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cantidad no cumple con el formato.',valor:row[arrind[10]],valor2:row[arrind[7]],tipo:'1'});
                error='2';
                continue;
              }
              let preciop=row[arrind[11]]==null?'nocumple':isNaN(row[arrind[11]])?'nocumple':row[arrind[11]];//condiciona numero
              preciop=cantidadp!=null && preciop==null?0:preciop;
              if(preciop=='nocumple'){
                this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Precio no cumple con el formato.',valor:row[arrind[11]],valor2:row[arrind[7]],tipo:'1'});
                //nocumple=true;
                error='2';
                continue;
              }
              let parcialp=row[arrind[12]]==null?0:isNaN(row[arrind[12]])?0:row[arrind[12]];//condiciona numero parcial no null
              let indice=indpartida.indice;
              codigop=agru==5?codigop:codigop.toString().substring(this.opcfuente=="0"?2:0);
              let indunifp=codigop.length>=2?codigop.toString().substring(0,2):null;
              let indunfcorr=this.tindices.find(ele=>ele.id_indice==indunifp)
              if(!indunfcorr){
                indunifp=null;
              }
              numdetaux++;
              if(agru==5){//subpartida, //agregar indice[subp]
                preciop=0;
                cuadrillap=null;
                parcialp=0;
                indunifp=null;
                this.arrsubpart.push({indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().toUpperCase().trim().replace(/\s+/g, ' '),indice_subp:this.indiceadd,tieneacu:0,unidad:unidadp});
              }
              let afcuadp=agru==1 || agru==3?'1':'0';
              if(unidadp!=''){
                let exisund=this.arrund.find(ele=>ele.unidad1==unidadp);
                if(!exisund){
                  this.arrund.push({unidad1:unidadp,unidad2:null,descripcion:null,id_unidad:null,observacion:'Se creará como unidad simple al importar'});
                }
              }
              //redondear montos
              let cuadrired=cuadrillap?this.formService.redondeo(cuadrillap,8):null;
              let cantred=this.formService.redondeo(cantidadp,this.dec_cant);
              let preciored=this.formService.redondeo(preciop,this.dec_precio);
              let parcred=/* agru!=5?this.formService.redondeo(Number(cantred)*Number(preciored),this.dec_precio): */this.formService.redondeo(parcialp,this.dec_precio);
              let filaadd=this.nuevafiladeta(indice,null,agru,numdetaux,codigop,descp.toString().toUpperCase().trim().replace(/\s+/g, ' '),unidadp,cuadrired,cantred,preciored,parcred,indunifp,agru==5?'0':'1',afcuadp,null,null,null,agru==5?this.indiceadd++:null);
              arrauxdet.push(filaadd);//agregar insumo a arraux
              empieza=true;
            }
            else{
              //agregar a tabla errores
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'La partida ya tiene costos unitarios.',valor:'Partida : '+indpartida.item,valor2:row[arrind[7]],tipo:'1'});
              //console.log('error, no se pudo agregar acus porque ya se agrego anteriormente',indpartida)
            }
          }
        }
        else if(this.strvacionull(row[arrind[6]])!=null && this.strvacionull(row[arrind[7]])!=null && this.strvacionull(row[arrind[8]])!=null && isNaN(row[arrind[10]]??0) && isNaN(row[arrind[11]]??0) && isNaN(row[arrind[12]]??0)){//titulos
          conttit++;//fin partida, encontro estructura de una nueva partida
        }
        else if(this.strvacionull(row[arrind[5]])!=null && this.strvacionull(row[arrind[8]])==null && this.strvacionull(row[arrind[11]])==null && conttit!=0){//tipo_insumo, unidad y precio nulos
          if(row[arrind[5]].toString().toUpperCase()==txmano){//MANO DE OBRA
            agru=1;
            numdetaux=0;
          }
          else if(row[arrind[5]].toString().toUpperCase()==txmat){//MATERIALES
            agru=2;
            numdetaux=0;
          }
          else if(row[arrind[5]].toString().toUpperCase()==txequi){//EQUIPO
            agru=3;
            numdetaux=0;
          }
          else if(row[arrind[5]].toString().toUpperCase()==txsubcon){//SUB-CONTRATOS
            agru=4;
            numdetaux=0;
          }
          else if(row[arrind[5]].toString().toUpperCase()==txsubpar){//SUB-PARTIDAS
            agru=5;
            numdetaux=0;
          }
        }
        else if(this.strvacionull(row[arrind[4]])!=null && conttit==0){//rendimiento en otra fila
          let rendip=row[arrind[3]]==null?'0':isNaN(row[arrind[3]])?'0':row[arrind[3]];//condiciona numero
          if(this.opcfuente=='3'){//sistema
            let arrrend=row[arrind[3]].toString().split("                   ");
            let elerend=arrrend[0].replace(/\s+/g, ' ');
            let elemod=elerend.replace('Rendimiento : ','');
            let arrelems=elemod.split(' ');
            rendip=arrelems[0]!=null?Number(arrelems[0]):'0';
          }
          let undrendip='GLOBAL';
          if(Number(rendip)!=0){
            undrendip='DIA';
          }
          if(Number(this.datapresu[indpartida.ind].rendimiento??0)==0){
            this.datapresu[indpartida.ind].rendimiento=this.formService.redondeo(rendip,2);
            this.datapresu[indpartida.ind].jornada=8;
            this.datapresu[indpartida.ind].und_rendi=undrendip;
          }
        }
        else {
          if(agru!=0){//existe partida
            if(row[arrind[7]]==null && row[arrind[8]]!=null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Descripción no cumple con el formato.',valor:row[arrind[7]],valor2:row[arrind[0]],tipo:'1'});
            }
            if(row[arrind[7]]!=null && row[arrind[8]]==null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Unidad no cumple con el formato.',valor:row[arrind[8]],valor2:row[arrind[7]],tipo:'1'});
            }
            if(row[arrind[7]]!=null && row[arrind[8]]!=null && isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cantidad no cumple con el formato.',valor:row[arrind[10]],valor2:row[arrind[7]],tipo:'1'});
            }
            if(row[arrind[7]]!=null && row[arrind[8]]!=null && !isNaN(row[arrind[10]]??'nocumple') && isNaN(row[arrind[11]]??'nocumple')){
              this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Precio no cumple con el formato.',valor:row[arrind[11]],valor2:row[arrind[7]],tipo:'1'});
            }
          }
        }
      }
    }
    //guardar ultimos registros
    if(indpartida){
      let auxdetcomp=JSON.parse(JSON.stringify(this.tabladetlimp));
      //agregar y sumar al grupo, sumar total solo las filas de arrauxdet para total de partida
      for(let raux1 of auxdetcomp){
        raux1.indice=indpartida.indice;
      }
      let total=0;
      let idfiladet=1;
      for(let row2 of arrauxdet){
        total+=Number(row2.parcial);
        row2.id_filadetalle=idfiladet++;
        if(row2.id_tipo_insumo!=5){
          let cant1=Number(row2.cantidad)
          let prec1=Number(row2.precio)
          let parc1=Number(row2.parcial)
          let resul1=((cant1*prec1)/100)-parc1;
          let margen=1/(10**this.dec_precio);
          row2.operador=resul1>-margen && resul1<margen?'%':null
        }
        else{
          row2.operador=null;
        }
        auxdetcomp.push(row2);
      }
      if(arrauxdet.length>0){
        this.datapresu[indpartida.ind].tieneacu=1;
        this.datapresu[indpartida.ind].advceros=0;
        //actualizar precio y calcular parcial
        this.datapresu[indpartida.ind].precio=this.formService.redondeo(total,this.dec_precio);
        this.datapresu[indpartida.ind].parcial=this.formService.redondeo(Number(this.formService.redondeo(total,this.dec_precio))*Number(this.datapresu[indpartida.ind].metrado),this.dec_parcial);
        this.datadetalle=this.datadetalle.concat(auxdetcomp);
      }
    }
    //reiniciar paramtetros
    indpartida=null;
    agru=0;
    arrauxdet=[];
    if(!empieza){
      error=error==''?'No se agrego ninguna fila.La Hoja de Cálculo ingresada no cumple con la fuente seleccionada para Costos Unitarios.':error;
      this.erracu.push({archivo:nomexcel,hoja:nomhoja,fila:null,error:'No se agrego ninguna fila.La Hoja de Cálculo ingresada no cumple con la fuente seleccionada para Costos Unitarios.',valor:null,valor2:null,tipo:'1'});
      nocumple=true;
    }
    if(nocumple){//especificar errores?, usar los items de partida para saber cual es el incorrecto?
      this.toaster.error(error, 'Error2', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
    }
  }
  cargartablaSubp2(datos,arrind,nomexcel:any,nomhoja:any){
    let empieza=false;
    let nocumple=false;
    let error='';
    let indpartida;
    let agru=0;
    let numdetaux=0;
    let arrauxdet=[];
    let txmano=this.opcfuente=='0'?'MANO DE OBRA':(this.opcfuente=='1'?'MANO DE OBRA':(this.opcfuente=='3'?'MANO DE OBRA':this.arrtipins[0].toUpperCase()));
    let txmat=this.opcfuente=='0'?'MATERIALES':(this.opcfuente=='1'?'MATERIALES':(this.opcfuente=='3'?'MATERIALES':this.arrtipins[1].toUpperCase()));
    let txequi=this.opcfuente=='0'?'EQUIPOS':(this.opcfuente=='1'?'EQUIPO':(this.opcfuente=='3'?'EQUIPO':this.arrtipins[2].toUpperCase()));
    let txsubcon=this.opcfuente=='0'?'SUBCONTRATOS':(this.opcfuente=='1'?'SUB-CONTRATOS':(this.opcfuente=='3'?'SUB CONTRATOS':this.arrtipins[3].toUpperCase()));
    let txsubpar=this.opcfuente=='0'?'SUBPARTIDAS':(this.opcfuente=='1'?'SUB-PARTIDAS':(this.opcfuente=='3'?'SUB PARTIDAS':this.arrtipins[4].toUpperCase()));
    for(let filasubp of this.arrsubpart){//si buscamos desde las subpartidas, entonces ya no se agregaran duplicados, ya que agregariamos el primero
      if(filasubp.tieneacu==1){
        continue;
      }
      let conttit=0;
      if(this.opcfuente=='1' && filasubp.codigo.toString()=='99'){
        continue;
      }
      for(let row of datos){
        if(this.opcfuente=='3'){
          row[arrind[10]]=row[arrind[10]]!=null?row[arrind[10]].toString().replace('%',''):[row[arrind[10]]];
        }
        if(indpartida){
          if(this.strvacionull(row[arrind[7]])!=null && this.strvacionull(row[arrind[8]])!=null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){//insumo, descripcion y precio (cantidad,parcial,unidad?)
            if(indpartida && agru!=0){//existe partida
              let codigop=row[arrind[6]]??'';
              let descp=row[arrind[7]]??'';//obligatorio
              if(descp==''){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Descripcion no cumple con el formato.',valor:row[arrind[7]],valor2:row[arrind[6]],tipo:'2'});
                error='1';
                continue;
              }
              let unidadp=row[arrind[8]]??'';//obligatorio
              if(unidadp==''){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Unidad no cumple con el formato.',valor:row[arrind[8]],valor2:row[arrind[7]],tipo:'2'});
                error='1';
                continue;
              }
              if(this.opcfuente=='1' || this.opcfuente=='3'){
                row[arrind[9]]=row[arrind[9]]=='-'?null:row[arrind[9]];
              }
              let val9=row[arrind[9]]==' '?null:row[arrind[9]];
              let cuadrillap=val9==null?null:isNaN(val9)?'nocumple':val9;//condiciona numero
              if(cuadrillap=='nocumple'){
                //nocumple=true;//ya existen filas agregadas
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cuadrilla no cumple con el formato.',valor:row[arrind[9]],valor2:row[arrind[7]],tipo:'2'});
                error='1';
                continue;
              }
              let cantidadp=row[arrind[10]]==null?'nocumple':isNaN(row[arrind[10]])?'nocumple':row[arrind[10]];//condiciona numero
              if(cantidadp=='nocumple'){//obligatorio
                //nocumple=true;
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cantidad no cumple con el formato.',valor:row[arrind[10]],valor2:row[arrind[7]],tipo:'2'});
                error='2';
                continue;
              }
              let preciop=row[arrind[11]]==null?'nocumple':isNaN(row[arrind[11]])?'nocumple':row[arrind[11]];//condiciona numero
              preciop=cantidadp!=null && preciop==null?0:preciop;
              if(preciop=='nocumple'){//obligatorio
                //nocumple=true;
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Precio no cumple con el formato.',valor:row[arrind[11]],valor2:row[arrind[7]],tipo:'2'});
                error='2';
                continue;
              }
              //let parcialp=row[arrind[12]]==null?null:isNaN(row[arrind[12]])?'nocumple':row[arrind[12]];//condiciona numero
              let parcialp=row[arrind[12]]==null?0:isNaN(row[arrind[12]])?0:row[arrind[12]];
              let indice=indpartida.indice_subp;
              codigop=agru==5?codigop:codigop.toString().substring(this.opcfuente=="0"?2:0);
              let indunifp=codigop.length>=2?codigop.toString().substring(0,2):null;
              let indunfcorr=this.tindices.find(ele=>ele.id_indice==indunifp)
              if(!indunfcorr){
                indunifp=null;
              }
              numdetaux++;
              if(agru==5){//subpartida, //agregar indice[subp]
                preciop=0;
                cuadrillap=null;
                indunifp=null;
                parcialp=0;
                this.arrsubpart.push({indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toUpperCase().toString().trim().replace(/\s+/g, ' '),indice_subp:this.indiceadd,tieneacu:0,unidad:unidadp});
              }
              let afcuadp=agru==1 || agru==3?'1':'0';
              if(unidadp!=''){
                let exisund=this.arrund.find(ele=>ele.unidad1==unidadp);
                if(!exisund){
                  this.arrund.push({unidad1:unidadp,unidad2:null,descripcion:null,id_unidad:null,observacion:'Se creará como unidad simple al importar'});
                }
              }
              let cuadrired=cuadrillap?this.formService.redondeo(cuadrillap,8):null;
              let cantred=this.formService.redondeo(cantidadp,this.dec_cant);
              let preciored=this.formService.redondeo(preciop,this.dec_precio);
              let parcred=/* agru!=5?this.formService.redondeo(Number(cantred)*Number(preciored),this.dec_precio): */this.formService.redondeo(parcialp,this.dec_precio);
              let filaadd=this.nuevafiladeta(indice,null,agru,numdetaux,codigop,descp.toString().toUpperCase().trim().replace(/\s+/g, ' '),unidadp,cuadrired,cantred,preciored,parcred,indunifp,agru==5?'0':'1',afcuadp,null,null,null,agru==5?this.indiceadd++:null);
              arrauxdet.push(filaadd);//agregar insumo a arraux
              empieza=true;
            }
          }
          else if(this.strvacionull(row[arrind[6]])!=null && this.strvacionull(row[arrind[7]])!=null && this.strvacionull(row[arrind[8]])!=null && isNaN(row[arrind[10]]??0) && isNaN(row[arrind[11]]??0) && isNaN(row[arrind[12]]??0)){
            conttit++;//fin partida, encontro estructura de una nueva partida
            if(conttit==2){
              let auxdetcomp=[];
              let total=0;
              let idfiladet=1;
              for(let row2 of arrauxdet){
                total+=Number(row2.parcial);
                row2.id_filadetalle=idfiladet++;
                if(row2.id_tipo_insumo!=5){
                  let cant1=Number(row2.cantidad)
                  let prec1=Number(row2.precio)
                  let parc1=Number(row2.parcial)
                  let resul1=((cant1*prec1)/100)-parc1;
                  let margen=1/(10**this.dec_precio);
                  row2.operador=resul1>-margen && resul1<margen?'%':null
                }
                else{
                  row2.operador=null;
                }
                auxdetcomp.push(row2);
              }
              //buscar indice del rowsel en datadetalle?
              let indpadre=-1;
              let fuente=1;//1detalle,2subpartidas
              for(let a2=0;a2<this.datadetalle.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
                if(indpartida.indice==this.datadetalle[a2].indice && indpartida.num_det==this.datadetalle[a2].num_det && indpartida.indice_subp==this.datadetalle[a2].indice_subp){
                  indpadre=a2;
                  break;
                }
              }//si no ecuentra , debe estar en datasubp?
              if(indpadre==-1){
                for(let a2=0;a2<this.datasubp.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
                  if(indpartida.indice==this.datasubp[a2].indice && indpartida.num_det==this.datasubp[a2].num_det && indpartida.indice_subp==this.datasubp[a2].indice_subp){
                    indpadre=a2;
                    fuente=2;
                    break;
                  }
                }
              }
              if(indpadre>=0){//actualizar el parcial?
                if(fuente==1){
                  filasubp.tieneacu=1;
                  this.datadetalle[indpadre].tieneacu=1;
                  this.datadetalle[indpadre].advceros=0;
                  this.datadetalle[indpadre].precio=this.formService.redondeo(total,this.dec_precio);
                  let parc=Number(this.datadetalle[indpadre].precio)*Number(this.datadetalle[indpadre].cantidad);
                  this.datadetalle[indpadre].parcial=this.formService.redondeo(parc,this.dec_precio);
                }
                else{
                  filasubp.tieneacu=1;
                  this.datasubp[indpadre].tieneacu=1;
                  this.datasubp[indpadre].advceros=0;
                  this.datasubp[indpadre].precio=this.formService.redondeo(total,this.dec_precio);
                  let parc=Number(this.datasubp[indpadre].precio)*Number(this.datasubp[indpadre].cantidad);
                  this.datasubp[indpadre].parcial=this.formService.redondeo(parc,this.dec_precio);
                }
                this.datasubp=this.datasubp.concat(auxdetcomp);
              }
              else{
                console.log(row)
              }
              indpartida=null;
              agru=0;
              arrauxdet=[];
              break;
            }
          }
          else if(this.strvacionull(row[arrind[5]])!=null && this.strvacionull(row[arrind[8]])==null && this.strvacionull(row[arrind[11]])==null  && conttit!=0){//agrupacion detalle
            if(indpartida){
              if(row[arrind[5]].toString().toUpperCase()==txmano){//MANO DE OBRA
                agru=1;
                numdetaux=0;
              }
              else if(row[arrind[5]].toString().toUpperCase()==txmat){//MATERIALES
                agru=2;
                numdetaux=0;
              }
              else if(row[arrind[5]].toString().toUpperCase()==txequi){//EQUIPO
                agru=3;
                numdetaux=0;
              }
              else if(row[arrind[5]].toString().toUpperCase()==txsubcon){//SUB-CONTRATOS
                agru=4;
                numdetaux=0;
              }
              else if(row[arrind[5]].toString().toUpperCase()==txsubpar){//SUB-PARTIDAS
                agru=5;
                numdetaux=0;
              }
            }
          }
          else if(this.strvacionull(row[arrind[4]])!=null && conttit==0){//fila rendimiento
            let rendip=row[arrind[3]]==null?'0':isNaN(row[arrind[3]].toString().replace('MO.','').replace('EQ.',''))?'0':row[arrind[3]].toString().replace('MO.','').replace('EQ.','');//condiciona numero caso s10
            if(this.opcfuente=='3'){//sistema
              let arrrend=row[arrind[3]].toString().split("                   ");
              let elerend=arrrend[0].replace(/\s+/g, ' ');
              let elemod=elerend.replace('Rendimiento : ','');
              let arrelems=elemod.split(' ');
              rendip=arrelems[0]!=null?Number(arrelems[0]):'0';
            }
            let undrendip='GLOBAL';
            if(Number(rendip)!=0){
                undrendip='DIA';
            }
            let indpadre=-1;
            let fuente=1;//1detalle,2subpartidas
            for(let a2=0;a2<this.datadetalle.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
              if(indpartida.indice==this.datadetalle[a2].indice && indpartida.num_det==this.datadetalle[a2].num_det && indpartida.indice_subp==this.datadetalle[a2].indice_subp){
                indpadre=a2;
                break;
              }
            }//si no ecuentra , debe estar en datasubp?
            if(indpadre==-1){
              for(let a2=0;a2<this.datasubp.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
                if(indpartida.indice==this.datasubp[a2].indice && indpartida.num_det==this.datasubp[a2].num_det && indpartida.indice_subp==this.datasubp[a2].indice_subp){
                  indpadre=a2;
                  fuente=2;
                  break;
                }
              }
            }
            if(indpadre>=0){//actualizar el parcial?
              if(fuente==1){
                if(Number(this.datadetalle[indpadre].rendimiento??0)==0){
                  this.datadetalle[indpadre].rendimiento=this.formService.redondeo(rendip,2);
                  this.datadetalle[indpadre].jornada=8;
                  this.datadetalle[indpadre].und_rendi=undrendip;
                }
              }
              else{
                if(Number(this.datasubp[indpadre].rendimiento??0)==0){
                  //this.datasubp[indpadre]
                  this.datasubp[indpadre].rendimiento=this.formService.redondeo(rendip,2);
                  this.datasubp[indpadre].jornada=8;
                  this.datasubp[indpadre].und_rendi=undrendip;
                }
              }
            }
          }
          else {
            if(indpartida && agru!=0){//existe partida
              if(row[arrind[7]]==null && row[arrind[8]]!=null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Descripción no cumple con el formato.',valor:row[arrind[7]],valor2:row[arrind[0]],tipo:'2'});
              }
              if(row[arrind[7]]!=null && row[arrind[8]]==null && !isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Unidad no cumple con el formato.',valor:row[arrind[8]],valor2:row[arrind[7]],tipo:'2'});
              }
              if(row[arrind[7]]!=null && row[arrind[8]]!=null && isNaN(row[arrind[10]]??'nocumple') && !isNaN(row[arrind[11]]??'nocumple')){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Cantidad no cumple con el formato.',valor:row[arrind[10]],valor2:row[arrind[7]],tipo:'2'});
              }
              if(row[arrind[7]]!=null && row[arrind[8]]!=null && !isNaN(row[arrind[10]]??'nocumple') && isNaN(row[arrind[11]]??'nocumple')){
                this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:row.idex,error:'Precio no cumple con el formato.',valor:row[arrind[11]],valor2:row[arrind[7]],tipo:'2'});
              }
            }
          }
        }
        else{
          if(this.strvacionull(row[arrind[13]])!=null){
            let itemact=row[arrind[13]].toString();//descripcion e codigo de subpartida concatenados (900303050103-0401003-01) split y pos0
            if(this.opcfuente=='3'){
              let separad=row[arrind[13]].toString().split('          ');
              itemact=separad[0].replace('Codigo :','').replace(/\s+/g, '');
            }
            let codigosubp='';
            if(this.opcfuente=='0'){
              if(itemact!=''){//verificar que exista -
                itemact=itemact.replace(/\(/g,'')
                if(itemact.includes('-')){
                  codigosubp=itemact.split('-')[0];
                }
                else if(itemact.includes(')')){
                  codigosubp=itemact.split(')')[0];
                }
                else{
                  codigosubp=itemact
                }
              }
            }
            else{ codigosubp=itemact; }//delphin y avanzado
            let itemp=codigosubp!=''?codigosubp:'nocumple';//corregir item
            if(itemp=='nocumple'){
              /* error='0'; */
              continue;
            }
            let undenc=row[arrind[8]];
            if(filasubp.codigo.toString().toUpperCase()==itemp.toString().toUpperCase() && filasubp.unidad!=undenc){//existe se agregan los costos unitarios
              indpartida=JSON.parse(JSON.stringify(filasubp));
              agru=0;
              arrauxdet=[];
              let indpadre=-1;
              let fuente=1;//1detalle,2subpartidas
              for(let a2=0;a2<this.datadetalle.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
                if(indpartida.indice==this.datadetalle[a2].indice && indpartida.num_det==this.datadetalle[a2].num_det && indpartida.indice_subp==this.datadetalle[a2].indice_subp){
                  indpadre=a2;
                  break;
                }
              }//si no ecuentra , debe estar en datasubp?
              if(indpadre==-1){
                for(let a2=0;a2<this.datasubp.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
                  if(indpartida.indice==this.datasubp[a2].indice && indpartida.num_det==this.datasubp[a2].num_det && indpartida.indice_subp==this.datasubp[a2].indice_subp){
                    indpadre=a2;
                    fuente=2;
                    break;
                  }
                }
              }
              //agregar undrendi y rendimiento(en la misma fila delphin)
              if(indpadre>=0){//actualizar el parcial?
                let arrmodi=fuente==1?this.datadetalle:this.datasubp;
                if(row[arrind[4]]!=null){//und rendi nunca es null
                  if(this.opcfuente=='1'){//delphin (Rendimiento:3 und/Día)
                    let arrrend=row[arrind[3]].toString().split(" ");
                    let rendpas=Number(arrrend[0].replace('Rendimiento:',''));
                    let undrendp='GLOBAL';
                    if(rendpas!=0 && arrrend[1].includes('/')){
                      undrendp=arrrend[1].split('/')[1].toUpperCase()=="DÍA" || arrrend[1].split('/')[1].toUpperCase()=="DIA"?'DIA':'GLOBAL';
                    }
                    arrmodi[indpadre].rendimiento=this.formService.redondeo(rendpas,2);
                    arrmodi[indpadre].jornada=8;
                    arrmodi[indpadre].und_rendi=undrendp;
                  }
                  else{//si no hay contenido que coincida, buscar en la siguiente fila
                    let rendip=row[arrind[3]]==null?'0':isNaN(row[arrind[3]])?'0':row[arrind[3]];//condiciona numero
                    let undrendip='GLOBAL';
                    if(Number(rendip)!=0){
                      undrendip='DIA';
                    }
                    arrmodi[indpadre].rendimiento=this.formService.redondeo(rendip,2);
                    arrmodi[indpadre].jornada=8;
                    arrmodi[indpadre].und_rendi=undrendip;
                  }
                }
                else{
                  arrmodi[indpadre].rendimiento=this.formService.redondeo(0,2);
                  arrmodi[indpadre].jornada=8;
                  arrmodi[indpadre].und_rendi='GLOBAL';
                }
              }
            }//no existe no se hace nada, no hay partida a cual vincular
          }
        }
      }
      if(indpartida){
        let auxdetcomp=[];
        let total=0;
        let idfiladet=1;
        for(let row2 of arrauxdet){
          total+=Number(row2.parcial);
          row2.id_filadetalle=idfiladet++;
          if(row2.id_tipo_insumo!=5){
            let cant1=Number(row2.cantidad)
            let prec1=Number(row2.precio)
            let parc1=Number(row2.parcial)
            let resul1=((cant1*prec1)/100)-parc1;
            let margen=1/(10**this.dec_precio);
            row2.operador=resul1>-margen && resul1<margen?'%':null
          }
          else{
            row2.operador=null;
          }
          auxdetcomp.push(row2);
        }
        //buscar indice del rowsel en datadetalle?
        let indpadre=-1;
        let fuente=1;//1detalle,2subpartidas
        for(let a2=0;a2<this.datadetalle.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
          if(indpartida.indice==this.datadetalle[a2].indice && indpartida.num_det==this.datadetalle[a2].num_det && indpartida.indice_subp==this.datadetalle[a2].indice_subp){
            indpadre=a2;
            break;
          }
        }//si no ecuentra , debe estar en datasubp?
        if(indpadre==-1){
          for(let a2=0;a2<this.datasubp.length;a2++){//{indice:indice,num_det:numdetaux,codigo:codigop,desc:descp.toString().trim(),indice_subp:this.indiceadd}
            if(indpartida.indice==this.datasubp[a2].indice && indpartida.num_det==this.datasubp[a2].num_det && indpartida.indice_subp==this.datasubp[a2].indice_subp){
              indpadre=a2;
              fuente=2;
              break;
            }
          }
        }
        if(indpadre>=0){//actualizar el parcial?
          if(fuente==1){
            this.datadetalle[indpadre].tieneacu=1;
            this.datadetalle[indpadre].advceros=0;
            this.datadetalle[indpadre].precio=this.formService.redondeo(total,this.dec_precio);
            let parc=Number(this.datadetalle[indpadre].precio)*Number(this.datadetalle[indpadre].cantidad);
            this.datadetalle[indpadre].parcial=this.formService.redondeo(parc,this.dec_precio);
          }
          else{
            this.datasubp[indpadre].tieneacu=1;
            this.datasubp[indpadre].advceros=0;
            this.datasubp[indpadre].precio=this.formService.redondeo(total,this.dec_precio);
            let parc=Number(this.datasubp[indpadre].precio)*Number(this.datasubp[indpadre].cantidad);
            this.datasubp[indpadre].parcial=this.formService.redondeo(parc,this.dec_precio);
          }
          this.datasubp=this.datasubp.concat(auxdetcomp);
        }
        for(let row of this.arrsubpart){
          if(row.indice==indpartida.indice && row.num_det==indpartida.num_det && row.indice_subp==indpartida.indice_subp){
            row.tieneacu=1;
          }
        }
        indpartida=null;
        agru=0;
        arrauxdet=[];
      }
    }
    //reiniciar paramtetros
    indpartida=null;
    agru=0;
    arrauxdet=[];
    console.log('arrsubpart',JSON.parse(JSON.stringify(this.arrsubpart)))
    if(!empieza){
      error=error==''?'No se pudo agregar ninguna fila.La Hoja de Cálculo ingresada no cumple con la fuente seleccionada para Subpartidas.':error;
      nocumple=true;
    }
    if(nocumple){//especificar errores?, usar los items de partida para saber cual es el incorrecto?
      this.toaster.error(error, 'Error3', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
      this.errsubp.push({archivo:nomexcel,hoja:nomhoja,fila:null,error:'No se pudo agregar ninguna fila.La Hoja de Cálculo ingresada no cumple con la fuente seleccionada para Subpartidas. No se agrego ninguna fila.',valor:null,valor2:null,tipo:'2'});
    }
  }
  errormaxval(valor,tetval,nenteros,txtadic=''){
    if(valor.includes('.')){
      let numar=valor.split('.');
      if(numar[0].length>nenteros){
        this.toaster.error('Un valor de '+tetval+' supera el maximo limite de '+nenteros+' digitos enteros.'+txtadic, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        this.mostrar_carga_todo=false;
        return true;
      }
    }
    else{
      if(valor.length>nenteros){
        this.toaster.error('Un valor de '+tetval+' supera el maximo limite de '+nenteros+' digitos enteros.'+txtadic, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 10000 })
        this.mostrar_carga_todo=false;
        return true;
      }
    }
    return false;
  }
}
