import { Component, OnInit,Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { SwalService } from 'src/app/servicios/swal.service';

export interface filalista {
  descripcion: string;
  id_tipoproy: any;
  desctipoproy:any;
}

@Component({
  selector: 'app-modal-grupo-partida',
  templateUrl: './modal-grupo-partida.component.html',
  styleUrls: ['./modal-grupo-partida.component.scss']
})
export class ModalGrupoPartidaComponent implements OnInit {
  mostrar_carga_todo = false
  formAgrega = new UntypedFormGroup({
    formainsertar: new UntypedFormControl('0', [Validators.required]),
    titulo: new UntypedFormControl('', [Validators.required]),
    /* tipoproyecto: new FormControl('', [Validators.required]), */
  })

  @Input() titmodal:any;
  @Input() fuente:any;
  @Input() id_usuario:any;
  @Input() tipoProy:any;
  @Input() filasel:any;
  @Input() detallegru=[];
  @Input() tipoproysel='';
  @Input() editar=false;
  @Input() opcfila=false;
  @Input() estitulo=false;
  @Input() datarestr=[];
  @Input() filascambit=[];

  get formainsertar(): UntypedFormControl { return this.formAgrega.get('formainsertar') as UntypedFormControl }
  get titulo(): UntypedFormControl { return this.formAgrega.get('titulo') as UntypedFormControl }
  /* get tipoproyecto(): FormControl { return this.formAgrega.get('tipoproyecto') as FormControl } */

  subgrupo=false;
  arregloseleccion=[];

  constructor(
    private toaster: ToastrService,
    private modal: NgbActiveModal,
    private catalogosService: CatalogosService,
  ) { }

  ngOnInit(): void {
    this.subgrupo=this.titmodal=='Agregar SubTitulo' || this.titmodal=='Editar SubTitulo';
    if(this.editar){
      this.titulo.setValue(this.filasel.descripcion);
      /* this.tipoproyecto.setValue(this.filasel.tipo_proy); */
    }
    else{
      /* this.tipoproyecto.setValue(this.tipoproysel); */
    }
    document.getElementById('descrip').focus();
  }
  botonGuarda(){
    if(this.editar)
      this.EditarGru();
    else
      this.GuardarGru();
  }
  async GuardarGru() {
    try {
      if(this.arregloseleccion.length>0){
        this.mostrar_carga_todo = true;
        let agrupasa="";
        if(this.subgrupo){
          agrupasa=this.filasel.agrupacion;
        }
        else{
          agrupasa="NULL"
        }
        const tabla1=JSON.stringify(this.arregloseleccion);
        const tabla2=JSON.stringify(this.filascambit);
        const elementos = {
          id_usuario: this.id_usuario,
          fuente: this.fuente,
          agrupacion:agrupasa,
          tipo_proy:this.tipoproysel,
          posinserta:this.formainsertar.value,
          datos1: tabla1,
          datos2: tabla2,
        }
        const respuesta = await this.catalogosService.GuardarDataGrupoPartidas(elementos)
        this.mostrar_carga_todo = false;
        if(respuesta.id==1){
          this.modal.close({respuesta:respuesta,posinserta:this.formainsertar.value})
          /* SwalService.success('Correcto', respuesta.mensaje) */
        }
        else{
          SwalService.error('Advertencia', respuesta.mensaje)
        }
      }
      else{
        if (this.formAgrega.invalid) {
          this.formAgrega.markAllAsTouched()
          this.toaster.error('Datos incompletos', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
          return
        } else {
          this.mostrar_carga_todo = true;
        let agrupasa="";
        if(this.subgrupo){
          agrupasa=this.filasel.agrupacion;
        }
        else{
          agrupasa="NULL"
        }
        let ejemplo:filalista={
          descripcion:this.titulo.value.toUpperCase(),
          id_tipoproy:this.tipoproysel,
          desctipoproy:''
        }
        this.arregloseleccion.push(ejemplo);
        const tabla1=JSON.stringify(this.arregloseleccion);
        const tabla2=JSON.stringify(this.filascambit);
        const elementos = {
          id_usuario: this.id_usuario,
          fuente: this.fuente,
          agrupacion:agrupasa,
          tipo_proy:this.tipoproysel,
          posinserta:this.formainsertar.value,
          datos1: tabla1,
          datos2: tabla2
        }
        const respuesta = await this.catalogosService.GuardarDataGrupoPartidas(elementos)
        this.mostrar_carga_todo = false;
        if(respuesta.id==1){
          this.modal.close({respuesta:respuesta,posinserta:this.formainsertar.value})
          /* SwalService.success('Correcto', respuesta.mensaje) */
        }
        else{
          SwalService.error('Advertencia', respuesta.mensaje)
        }
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e)
    }
  }
  async EditarGru(){
    try {
      if (this.formAgrega.invalid) {
        this.formAgrega.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true;
        const tabla1=JSON.stringify(this.detallegru);
        const elementos = {
          id_partida:this.filasel.id_partida,
          descripcion: this.titulo.value.toUpperCase(),
          id_usuario: this.id_usuario,
          tipo_proy: this.tipoproysel,
          fuente: this.fuente,
          referencia:null,
          datos1:tabla1,
        }
        const respuesta = await this.catalogosService.ModificarGrupoDataPartidas(elementos)
        this.mostrar_carga_todo = false;
        if(respuesta.id==1){
          this.modal.close(respuesta)
          /* SwalService.success('Correcto', respuesta.mensaje) */
        }
        else{
          SwalService.error('Advertencia', respuesta.mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e)
    }
  }
  addtoTabla(){
    if (this.formAgrega.invalid) {
      this.formAgrega.markAllAsTouched()
      this.toaster.error('Datos incompletos', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return
    } else {
      //let existe=this.arregloseleccion.find(data => data.descripcion == this.titulo.value.toUpperCase());
      //let filarest=this.datarestr.find(data => data.descripcion == this.titulo.value.toUpperCase())
      /* if(!existe && !filarest){ */
        let tipoproydesc="";
        /* for(let i=0;i<this.tipoProy.length;i++){
          if(this.tipoproyecto.value==this.tipoProy[i].id_clasificacion){
            tipoproydesc=this.tipoProy[i].descripcion;
          }
        } */
        let ejemplo:filalista={
          descripcion:this.titulo.value.toUpperCase(),
          id_tipoproy:this.tipoproysel,
          desctipoproy:tipoproydesc
        }
        this.titulo.setValue('');
        this.arregloseleccion.push(ejemplo);
        document.getElementById('descrip').focus();
      /* }
      else{
        this.toaster.error('Existe un titulo con el mismo nombre.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      } */
    }
  }
  eliminarfila(ind:any){
    this.arregloseleccion.splice(ind,1);
  }
  keyaction(event:any){
    try {
      if(!this.editar && event.keyCode.toString() == "13")
      {
        this.addtoTabla();
      }
    } catch (e) {
      console.log(e)
    }
  }
  closeModal(result: any = null) {
    this.modal.close(result)
  }
}
