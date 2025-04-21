import { Component, OnInit,Input,HostListener,ViewEncapsulation } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import { SwalService } from './../../../../servicios/swal.service';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from './../../../../servicios/encriptador.service';

import * as XLSX from 'xlsx';
const EXCEL_TYPE='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8;';
const EXCEL_EXT='.xlsx';

export interface filatablaselcol1 {
  descripcion:string;
  unidad: string;
  precio:string;
  tipoinsumo:string;
  indiceunif:string;
  id_clasificacion:string;
  marcas:string;
  observacion:string;
}

@Component({
  selector: 'app-importarinsumos',
  templateUrl: './importarinsumos.component.html',
  styleUrls: ['./importarinsumos.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ImportarinsumosComponent implements OnInit {
  @Input('height')  heighttmodal2: number=100;
  @Input('height')  heighttmodal1icor: number=100;
  mostrar_carga_todo:boolean;
  mensaje_res:string;

  displayedColumns: string[] = ['ind'];
  displayedColumnsagre:string[]=[];
  datadis=new MatTableDataSource();
  nrofila:any;
  importado=false;
  activarupload=true;
  data: [][];
  datapasar=[];
  actualizartabla=false;
  nom_archivo='';

  idusuariolog=this.encriptadorService.recuperarlocalstory('idusuario');

  displayedColumnimp1: string[] = ['descripcion','unidad','indiceunif','tipoinsumo','precio','marcas'];
  dataselcol=new MatTableDataSource<filatablaselcol1>();

  dataincor=new MatTableDataSource();
  dataincorbd=new MatTableDataSource();
  displayedColumnincorbd: string[] = ['descripcion','unidad','indiceunif','tipoinsumo','precio','marcas','observacion'];

  constructor(
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    private configuracionService:ConfiguracionService,
    private encriptadorService:EncriptadorService
  ) { }

  ngOnInit(): void {
    this.heighttmodal2=window.innerHeight-380;
    this.heighttmodal1icor=(window.innerHeight-300)/2;
    this.nrofila=0;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.heighttmodal2=window.innerHeight-380;
    this.heighttmodal1icor=(window.innerHeight-300)/2;
  }
  //modal importar 1
  cerrarModal1(){
    this.closeModal();
    /* this.nrofila=0;
    this.displayedColumns = ['ind'];
    this.displayedColumnsagre = [];
    this.datadis.data=[];
    this.data=[];
    this.activarupload=true;
    this.dataselcol.data=[];
    this.importado=false;
    this.dataincor.data=[];

    const fileUpload=document.getElementById("file") as HTMLInputElement;
    if(fileUpload!=null)
    {
      fileUpload.value=null;
    }

    this.modal1.hide(); */
  }
  async GuardarModal1(){
    if(this.data!=null){
      if(this.data.length>0){
        if(this.nrofila>=0 && this.nrofila<=this.data.length){
          if(this.dataselcol.data[0].descripcion!='' && this.dataselcol.data[0].unidad!='' && this.dataselcol.data[0].indiceunif!='' && this.dataselcol.data[0].tipoinsumo!=''){
            this.mostrar_carga_todo=true;
  
            let datosincor=[];
            this.datapasar=[];
            for(let i=this.nrofila;i<this.data.length;i++){
              let filaej:filatablaselcol1;
  
              let descpas=this.dataselcol.data[0].descripcion!=''?(this.data[i][this.dataselcol.data[0].descripcion]==null?'':this.data[i][this.dataselcol.data[0].descripcion]):'';
              let unidadpas=this.dataselcol.data[0].unidad!=''?(this.data[i][this.dataselcol.data[0].unidad]==null?'':this.data[i][this.dataselcol.data[0].unidad]):'';
              let indiceunifpas=this.dataselcol.data[0].indiceunif!=''?(this.data[i][this.dataselcol.data[0].indiceunif]==null?'':this.data[i][this.dataselcol.data[0].indiceunif]):'';

              let tipoinsf=this.dataselcol.data[0].tipoinsumo.toString()!=''?(this.data[i][this.dataselcol.data[0].tipoinsumo]==null?'':this.data[i][this.dataselcol.data[0].tipoinsumo].toString()):'';
              let tipoinspas='';
              if(tipoinsf!=''){
                tipoinspas=tipoinsf.toLowerCase()==='1'||tipoinsf.toLowerCase()==='mano de obra'?'1':tipoinsf.toLowerCase()==='2'||tipoinsf.toLowerCase()==='materiales'?'2':tipoinsf.toLowerCase()==='3'||tipoinsf.toLowerCase()==='equipo'?'3':
                tipoinsf.toLowerCase()==='4'||tipoinsf.toLowerCase()==='subcontratos'?'4':'';
              }

              let verprecio=this.dataselcol.data[0].precio!=''?this.data[i][this.dataselcol.data[0].precio]:null;
              filaej={
                  descripcion:descpas,
                  unidad:unidadpas,
                  indiceunif:indiceunifpas,
                  tipoinsumo:tipoinspas!=''?tipoinspas:null,
                  id_clasificacion:null,
                  precio:verprecio,
                  marcas:this.dataselcol.data[0].marcas!=''?this.data[i][this.dataselcol.data[0].marcas]:null,
                  observacion:''
                };
              if(!isNaN(Number(verprecio)) && descpas!='' && unidadpas!='' && indiceunifpas!='' && tipoinspas!=''){
                //validar los campos numeros, fechas
                this.datapasar.push(filaej);
              }
              else{
                datosincor.push(this.data[i])
              }
            }
            
            if(datosincor.length==this.data.length-this.nrofila){
              this.mostrar_carga_todo=false;
              this.mensaje_res="No se pudo agregar ninguna fila por incompatibilidad en los datos. Vuelva a asociar las columnas correctamente.";
              SwalService.error('Advertencia',this.mensaje_res);
            }
            else{
              if(this.datapasar.length>0){
                if(datosincor.length>0){
                  //agregar encabezados
                  for(let h=0;h<this.nrofila;h++){
                    this.dataincor.data.push(this.data[h])
                  }
                  //agregar datos incorrectos
                  for(let row of datosincor){
                    this.dataincor.data.push(row);
                  }
                  this.dataincor.data=this.dataincor.data;
                }
                const tabla1=JSON.stringify(this.datapasar);
                const body=JSON.stringify({
                  'idusuario':this.idusuariolog,
                  'fuente':0,
                  'datos1':tabla1,
                });

                const resp=await this.configuracionService.ImportarDatainsumo(body);
                this.importado=true;
                this.mostrar_carga_todo=false;
                if(resp.id=="1" && datosincor.length==0){
                  this.mensaje_res=resp.mensaje;
                  SwalService.success('Correcto',this.mensaje_res);
                  this.actualizartabla=true;
                  this.cerrarModal1();
                }else if(resp.id=="1" && datosincor.length>0){
                  this.actualizartabla=true;
                  this.mensaje_res="Se agregaron varios registros correctamente, Pero se omitieron los que tenian formatos incorrectos.";
                  SwalService.success('Correcto',this.mensaje_res);
                }
                else if(resp.id=="0"){//agregar los datos incorrectos, tanto del excel como de la bd
                  this.dataincorbd.data=resp.datos;
                  if(resp.datos?.length>0){
                    this.actualizartabla=true;
                  }
                  SwalService.error('Advertencia',resp.mensaje);
                }
              }
              else{
                this.mostrar_carga_todo=false;
                this.toaster.error('Las filas del excel no tienen un formato correcto para los numeros de la data. No se pudo agregar nunguna fila.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
              }
            }
          }
          else{
            this.toaster.error('Debe asociar los campos obligatorios (*).', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
          }
        }
        else{
          this.toaster.error('El numero de fila inicial es mayor al tamaño de la tabla a importar.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        }
      }
      else{
        this.toaster.error('Seleccione un archivo para importar.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      }
    }else{
      this.toaster.error('No hay nada para guardar.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }

  cambiovalnrofila(valor:any){
    if(valor==''){
      this.nrofila=0;
    }else{
      this.nrofila=Number(valor);
    }
  }

  //abrir excel
  onFileChange(evt: any) {
    const target : DataTransfer =  <DataTransfer>(evt.target);
    
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    this.nom_archivo=target.files[0].name;

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname : string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.data = (XLSX.utils.sheet_to_json(ws, { header: 1 }));

      this.activarupload=false;
      let aux=[];
      let ancho=0;
      for(let i=0;i<this.data.length;i++){
        aux.push(this.data[i])        

        if(this.data[i].length>ancho){
          ancho=this.data[i].length;
        }
        if(i==50){
          i=this.data.length;
        }
      }
      for(let f=0;f<ancho;f++){
        this.displayedColumns.push(f.toString());
        this.displayedColumnsagre.push(f.toString());
      }

      for(let row of aux){
        this.datadis.data.push(row);
      }

      let filaej:filatablaselcol1;
      filaej={descripcion:'',unidad:'',indiceunif:'',tipoinsumo:'',id_clasificacion:'',precio:'',marcas:'',observacion:''}
      this.dataselcol.data.push(filaej)

      this.dataselcol.data=this.dataselcol.data;
    };
    reader.readAsBinaryString(target.files[0]);
  }

  cambiarindice1(ind:any,valor:any){
    if(this.dataselcol.data.length>0){
      if(ind==0){
        this.dataselcol.data[0].descripcion=valor;
      }
      if(ind==1){
        this.dataselcol.data[0].unidad=valor;
      }
      if(ind==2){
        this.dataselcol.data[0].indiceunif=valor;
      }
      if(ind==3){
        this.dataselcol.data[0].tipoinsumo=valor;
      }
      if(ind==4){
        this.dataselcol.data[0].precio=valor;
      }
      if(ind==5){
        this.dataselcol.data[0].marcas=valor;
      }
    }
  }
  async closeModal(result: any = null) {
    this.modal.close(this.actualizartabla)
  }
  limpiarModal1(){
    this.nrofila=0;
    this.displayedColumns = ['ind'];
    this.displayedColumnsagre = [];
    this.datadis.data=[];
    this.data=[];
    this.activarupload=true;
    this.dataselcol.data=[];
    this.importado=false;
    this.dataincor.data=[];
    this.nom_archivo='';

    const fileUpload=document.getElementById("file") as HTMLInputElement;
    if(fileUpload!=null)
    {
      fileUpload.value=null;
    }
  }
}
