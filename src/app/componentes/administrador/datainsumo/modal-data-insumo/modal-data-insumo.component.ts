import { BuscaaddunidadmedComponent } from './../../../catalogos/unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { ModalCrudClasificacionComercialComponent } from './../modal-crud-clasificacion-comercial/modal-crud-clasificacion-comercial.component';
import { ModalListaClasificacionComponent } from './../modal-lista-clasificacion/modal-lista-clasificacion.component';
import { AsociarCatalogosComponent } from './../../../catalogos/catinsumos/asociar-catalogos/asociar-catalogos.component';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { ModalIndiceListaComponent } from './../modal-indice-lista/modal-indice-lista.component';
import { map, startWith } from 'rxjs/operators';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';

export interface tipoInsumo {
  activo: number;
  desc_tipo_insumo: string;
  id_tipo_insumo: number
}
export interface unidadmed {
  id_unidad: string;
  unidad: string;
  descripcion:string;
  operador:string;
  tipo_insumo:string;
  id_usuario:string;
  fuente:string;
  activo: string;
  util1:string;
  util2:string;
  util3:string;
  util4:string;
  automatico:string;
}
export interface clasificacionInsumo {
  abrev: string;
  abrev_tipo: string;
  activo: number;
  desc_clasi: string;
  desc_tipo_insumo: string;
  id_clasificacion: number;
  id_tipo_insumo: number;
}
export interface archivoimg {
  nombre: any;
  base: any;
}
@Component({
  selector: 'app-modal-data-insumo',
  templateUrl: './modal-data-insumo.component.html',
  styleUrls: ['./modal-data-insumo.component.scss']
})
export class ModalDataInsumoComponent implements OnInit {
  @Input() editar = null
  @Input() datos = null
  @Input() ver = null
  @Input() catalogoInsumo = false
  @Input() tipoInsumos: tipoInsumo[] = [];
  @Input() clasiInsumos = [];
  @Input() medidas: unidadmed[] = [];
  @Input() fuente = null
  @Input() tipoIndice = [];
  id_user:any;
  //chips
  visible = true;
  selectable = true;
  removable = true;
  //archivo
  nomarch: any = null;
  archdoc: any;
  mostrar_carga_todo: boolean = false
  formDataInsumo = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    unidad: new UntypedFormControl('', [Validators.required]),
    precio: new UntypedFormControl('0.00', [Validators.required, Validators.min(0.01)]),
    id_tipo: new UntypedFormControl('', [Validators.required]),
    id_indice: new UntypedFormControl('', [Validators.required]),
    nombre_indice: new UntypedFormControl('', []),
    id_clasi: new UntypedFormControl(''),
    catalogos: new UntypedFormControl('', []),
    imagen: new UntypedFormControl('', []),
    marcas: new UntypedFormControl('', []),
    id_usuario: new UntypedFormControl('', []),
    activo: new UntypedFormControl(true, []),
    duplicar: new UntypedFormControl(false, [])
  })
  eliminarActual: any = false;
  arrayArchivos: any[] = [];
  textoDuplicar: string = 'NO';
  clasiInsumosFiltrado: any[] = [];
  get descripcion(): UntypedFormControl { return this.formDataInsumo.get('descripcion') as UntypedFormControl }
  get unidad(): UntypedFormControl { return this.formDataInsumo.get('unidad') as UntypedFormControl }
  get precio(): UntypedFormControl { return this.formDataInsumo.get('precio') as UntypedFormControl }
  get id_tipo(): UntypedFormControl { return this.formDataInsumo.get('id_tipo') as UntypedFormControl }
  get nombre_indice(): UntypedFormControl { return this.formDataInsumo.get('nombre_indice') as UntypedFormControl }
  get id_indice(): UntypedFormControl { return this.formDataInsumo.get('id_indice') as UntypedFormControl }
  get id_clasi(): UntypedFormControl { return this.formDataInsumo.get('id_clasi') as UntypedFormControl }
  get catalogos(): UntypedFormControl { return this.formDataInsumo.get('catalogos') as UntypedFormControl }
  get imagen(): UntypedFormControl { return this.formDataInsumo.get('imagen') as UntypedFormControl }
  get marcas(): UntypedFormControl { return this.formDataInsumo.get('marcas') as UntypedFormControl }
  get id_usuario(): UntypedFormControl { return this.formDataInsumo.get('id_usuario') as UntypedFormControl }
  get activo(): UntypedFormControl { return this.formDataInsumo.get('activo') as UntypedFormControl }
  get duplicar(): UntypedFormControl { return this.formDataInsumo.get('duplicar') as UntypedFormControl }


  @ViewChild("modalAddTipo") modaltipo: ModalBasicComponent;
  constructor(private modal: NgbActiveModal,
    private modalService: NgbModal,
    private toaster: ToastrService,
    public formsService: FormsService,
    private catalogosService: CatalogosService,
    private _EncriptadorService: EncriptadorService,
    private configuracionService: ConfiguracionService,
    private administradorService: AdministradorService,
    ) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo=true;
      this.id_user = this._EncriptadorService.recuperarlocalstory('idusuario');
      //await this.listarIndicesUnificados()
      await this.accionModal()
      const idusuario = this._EncriptadorService.recuperarlocalstory('idusuario');
      this.id_usuario.setValue(idusuario)
      if (this.fuente == 0) {
        this.id_clasi.setValidators(Validators.required)
        this.id_clasi.updateValueAndValidity()
      } else {
        this.id_clasi.clearValidators()
        this.id_clasi.updateValueAndValidity()
      }
      this.mostrar_carga_todo=false;
    } catch (e) {
      this.mostrar_carga_todo=false;
      console.log(e);
      SwalService.error(e)
    }
  }
  async accionModal() {
    try {
      if (this.editar) {
        if (this.datos.catalogos) {
          const arrayRecuperados = this.datos?.catalogos.split('|')
          if (arrayRecuperados) {
            await this.crearArrayDocumentos(arrayRecuperados)
          }
        }
        this.formDataInsumo.reset({
          descripcion: this.datos?.descripcion.trim(),
          unidad: '',
          precio: parseFloat(this.datos?.precio).toFixed(2),
          id_tipo: this.datos?.id_tipo_insumo,
          nombre_indice: this.datos?.desc_indice,
          id_indice: this.datos?.id_indice,
          id_clasi: null,
          catalogos: this.datos?.catalogos,
          imagen: this.datos?.imagen,
          marcas: this.datos?.marcas,
          id_usuario: this.datos?.id_usuario,
          activo: this.datos?.activo == 1 ? true : false,
        })
        let exisund=this.medidas.find(ele=>this.datos?.id_unidad==ele.id_unidad)
        if(exisund){
          this.unidad.setValue(this.datos?.id_unidad?Number(this.datos?.id_unidad):'');
          this.cambUnidad();
        }
        await this.cambioTipoInsumo()
        let exisclasi=this.clasiInsumos.find(ele=>this.datos?.id_clasificacion==ele.id_clasificacion)
        if(exisclasi){
          this.id_clasi.setValue(this.datos?.id_clasificacion ? Number(this.datos?.id_clasificacion) : '',)
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  async crearArrayDocumentos(documentos) {
    documentos.map(data => {
      const objeto = {
        nombre_documento: data,
        file: null,
        nuevo: false,
        asociado: false
      }
      this.arrayArchivos.push(objeto)
    })
  }
  // async listarTipoInsumo() {
  //   this.tipoInsumos = []
  //   const activo = {
  //     activo: 1
  //   }
  //   this.tipoInsumos = await this.configuracionService.listarTipoInsumo(activo)
  // }

  async cambioTipoInsumo() {
    if (this.id_tipo.value) {
      this.clasiInsumosFiltrado = await this.clasiInsumos.filter(clasificacion => clasificacion.id_tipo_insumo == this.id_tipo.value)
    } else {
      this.clasiInsumosFiltrado = []
    }
    this.id_clasi.setValue('');
  }
  async verificarDecimales() {
    const precioValido = await this.formsService.autocompletarPrecio(this.precio.value, 3)
    this.precio.setValue(precioValido)
  }
  async listarIndicesUnificados() {
    try {
      this.tipoIndice = []
      this.tipoIndice = await this.configuracionService.listarIndiceUnificados()
    } catch (e) {
      SwalService.error()
    }
  }
  async abrirmodalIndices() {
    this.mostrar_carga_todo = true
    await this.listarIndicesUnificados()
    const valorInicial = this.tipoIndice.find(data => data.id_indice == this.id_indice.value)
    const modalRef = await this.modalService.open(ModalIndiceListaComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false//no cerrar el modal con ESC
    })
    modalRef.componentInstance.tiposIndice = this.tipoIndice
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      this.id_indice.setValue(result.id_indice)
      this.nombre_indice.setValue(result.desc_indice)
    } else {
      if (valorInicial) {
        this.nombre_indice.setValue(valorInicial.desc_indice)
        this.id_indice.setValue(valorInicial.id_indice)
      }
    }
  }
  async abrirmodalUnidades(){
    this.mostrar_carga_todo = true
    let tablaunid = await this.administradorService.listarUnidadMed({ id_usuario:this.id_user,fuente:this.fuente==0?0:'',activo: 1,operador:0 })//cambiar a dinamico u otra consulta que retorne todo
    const valorInicial = this.medidas.find(data => data.id_unidad == this.unidad.value)
    const modalRef = await this.modalService.open(BuscaaddunidadmedComponent, { size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false })
    modalRef.componentInstance.Listaunidades = tablaunid;
    modalRef.componentInstance.operador = 0;
    modalRef.componentInstance.fuentepasa=this.fuente;
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      if(result.actarray){
        this.medidas=result.tablaact;
      }
      this.unidad.setValue(Number(result.datosel.id_unidad));
      this.cambUnidad();
    } else {
      if (valorInicial) {
        this.unidad.setValue(valorInicial.id_unidad)
        this.cambUnidad();
      }
    }
  }
  async cambUnidad(){
    if(this.unidad.value!=''){
      let undsel=this.medidas.find(ele=>ele.id_unidad==this.unidad.value);
      if(undsel.operador=='%'){
        let tipoinsop=undsel.util1=='1'?1:undsel.util2=='1'?2:undsel.util3=='1'?3:undsel.util4=='1'?4:'';
        this.id_tipo.setValue(tipoinsop);
        this.clasiInsumosFiltrado = await this.clasiInsumos.filter(clasificacion => clasificacion.id_tipo_insumo == this.id_tipo.value)
        this.id_clasi.setValue('');
        this.precio.disable();
        this.precio.setValue('0.00');
        this.precio.clearValidators();
        this.precio.updateValueAndValidity();
      }
      else{
        this.precio.enable();
        this.precio.setValidators([Validators.min(0.01)]);
        this.precio.updateValueAndValidity();
      }
    }
    else{
      this.precio.enable();
      this.precio.setValidators([Validators.min(0.01)]);
      this.precio.updateValueAndValidity();
    }
  }
  async seleccionArchivo() {
    try {
      const fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
      if (fileUpload != null) { fileUpload.value = null }
      fileUpload.onchange = () => {
        let cantidadDisponible = 0
        if (this.arrayArchivos.length < 3) {
          cantidadDisponible = 3 - this.arrayArchivos.length
        } else {
          this.toaster.error('No se pueden seleccionar mas de 3 documentos', 'Error', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
          return
        }
        for (let index = 0; index < cantidadDisponible; index++) {
          const file = fileUpload.files[index];
          if (!file) { return }
          if (file.name.toString().includes('.pdf')/*  || file.name.toString().includes('.docx') */) {
            if (file.size < 30000000) {
              const n_arch = file.name;
              this.nomarch = n_arch;
              this.archdoc = file;
              const objeto = {
                nombre_documento: file.name,
                file: file,
                nuevo: true,
                asociado: false
              }
              this.arrayArchivos.push(objeto)
            } else {
              const msj = "El archivo " + file.name + " es muy pesado";
              SwalService.error('Error', msj)
            }
          } else {
            SwalService.error('Error', "Solo se admiten archivos pdf")
          }

        }
      }
      fileUpload.click();
    } catch (err) {
      console.log('ERR:', err)
      SwalService.error()
    }
  }

  // async removearc(index: any, documento) {
  //   try {
  //     if (!documento.nuevo && !documento.asociado) {
  //       const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el documento guardado')
  //       this.mostrar_carga_todo = true
  //       if (sw.isConfirmed) {
  //         const inputEliminar = {
  //           id_insumo: this.datos.id_insumo,
  //           nomarchivo: documento.nombre_documento,
  //           catalogos: this.catalogos.value
  //         }
  //         const response = await this.catalogosService.eliminarCatalogoInsumo(inputEliminar)
  //         if (response.id == '1') {
  //           this.catalogos.setValue(response.imagen)
  //           this.toaster.success('Se eliminó Correctamente', 'Correcto', {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 5000
  //           })
  //         }
  //       }
  //       this.mostrar_carga_todo = false
  //     }

  //     this.arrayArchivos.splice(index, 1)
  //     const fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
  //     if (fileUpload != null) {
  //       fileUpload.value = null;
  //     }
  //   } catch (e) {
  //     SwalService.error()
  //     console.log(e);
  //   }
  // }

  async almacenar() {
    if (this.ver) {
      await this.duplicarInsumo()
    } else {
      if (!this.editar) {
        await this.guardar()
      } else {
        await this.actualizar()
      }
    }
  }

  async guardar() {
    try {
      if (this.formDataInsumo.invalid) {
        this.formDataInsumo.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true
        // condicionar que unidad de medida % no afecte al mismo tipo insumo
        let undsel=this.medidas.find(data=>data.id_unidad==this.unidad.value);
        if(undsel.tipo_insumo!=this.id_tipo.value){
          // const concatenados = await this.concatenarCatalogos()
          // const arrayFiles = await this.arregloFiles()
          const inputDataInsumo = {
            descripcion: (this.descripcion.value).toUpperCase().trim(),
            unidad: this.unidad.value,//typeof (this.unidad.value) == 'string' ? this.unidad.value.toUpperCase() : this.unidad.value.id_unidad.toUpperCase(),
            precio: this.precio.value,
            id_tipo: this.id_tipo.value,
            id_indice: this.id_indice.value,
            id_clasificacion: this.id_clasi.value ? this.id_clasi.value : '',
            marcas: this.marcas.value ? this.marcas.value : '',
            // grupocatalogos: concatenados,
            // catalogos: arrayFiles,
            id_usuario: this.id_usuario.value,
            fuente: this.fuente,
            activo: this.activo.value ? 1 : 0
          }
          const response = await this.configuracionService.guardarInsumosData(inputDataInsumo)
          if (response.id == '1') {
            //SwalService.success()
            this.toaster.success(response.mensaje, 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
            this.closeModal(response)
          } else {
            SwalService.error('Error', response.mensaje)
          }
        }
        else{
          this.toaster.error('No se puede asignar la unidad de medida al tipo de insumo seleccionado.', 'Error', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        }
        this.mostrar_carga_todo = false
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }

  async concatenarCatalogos() {
    let texto = ''
    if (this.arrayArchivos.length) {
      const catalogos = await this.arrayArchivos.filter(catalogos => {
        if (!catalogos.nuevo || catalogos.asociado) {
          return catalogos
        }
      })
      await catalogos.map((catalogo, index) => {
        if (index > 0) {
          texto = texto + '|' + catalogo.nombre_documento
        } else {
          texto = texto + catalogo.nombre_documento
        }
      })
    } else {
      texto = ''
    }
    return texto
  }
  async arregloFiles() {
    let arrayfiles = []
    if (this.arrayArchivos.length) {
      const files = await this.arrayArchivos.filter(catalogo => catalogo.nuevo)
      if (files.length) {
        files.map(file => arrayfiles.push(file.file))
      } else {
        arrayfiles = []
      }
    } else {
      arrayfiles = []
    }
    return arrayfiles
  }

  async actualizar() {
    try {
      if (this.formDataInsumo.invalid) {
        this.formDataInsumo.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true
        //const concatenados = await this.concatenarCatalogos()
        //const arrayFiles = await this.arregloFiles()
        const inputDataInsumo = {
          id_insumo: this.datos.id_insumo,
          descripcion: (this.descripcion.value).toUpperCase().trim(),
          unidad: this.unidad.value,//typeof (this.unidad.value) == 'string' ? this.unidad.value.toUpperCase() : this.unidad.value.id_unidad.toUpperCase(),
          precio: this.precio.value,
          id_tipo: this.id_tipo.value,
          id_clasificacion: this.id_clasi.value ? this.id_clasi.value : '',
          id_indice: this.id_indice.value,
          //grupocatalogos: concatenados,
          //catalogos: arrayFiles,
          marcas: this.marcas.value ? this.marcas.value : '',
          activo: this.activo.value ? 1 : 0,
          id_usuario: this.id_usuario.value
        }
        let response=await this.configuracionService.editarInsumosData(inputDataInsumo)//ya no pasar catalogos
        this.closeModal(response)
        this.mostrar_carga_todo = false
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }

  async duplicarInsumo() {
    try {
      if (this.formDataInsumo.invalid) {
        this.formDataInsumo.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true
        const inputDuplicar = {
          descripcion: (this.descripcion.value).toUpperCase().trim(),
          unidad: this.unidad.value,//typeof (this.unidad.value) == 'string' ? this.unidad.value.toUpperCase() : this.unidad.value.id_unidad.toUpperCase(),
          precio: this.precio.value,
          id_tipo: this.id_tipo.value,
          id_indice: this.id_indice.value,
          id_clasificacion: this.id_clasi.value ? this.id_clasi.value : '',
          catalogos: this.datos.catalogos ? this.datos.catalogos : '',
          imagen: this.datos.imagen ? this.datos.imagen : '',
          marcas: this.marcas.value ? this.marcas.value : '',
          ficha_tecnica: this.datos.ficha_tecnica ? this.datos.ficha_tecnica : '',
          id_usuario: this.id_usuario.value,
          fuente: this.fuente,
          activo: this.activo.value ? 1 : 0,
          todo: this.duplicar.value ? this.duplicar.value : false
        }
        const response = await this.configuracionService.duplicarInsumoData(inputDuplicar)
        this.mostrar_carga_todo = false
        if (response.id == "1") {
          //SwalService.success('Correcto', response.mensaje)
          this.toaster.success(response.mensaje, 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          this.closeModal(response)
        }
        else {
          SwalService.error('Advertencia', response.mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }

  closeModal(result: any = null) {
    this.modal.close(result)
  }

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }

  cambioDuplicar() {
    if (this.duplicar.value) {
      this.textoDuplicar = 'SI'
    } else {
      this.textoDuplicar = 'NO'
    }
  }

  async asociarCatalogos() {
    this.mostrar_carga_todo = true
    let cantidadDisponible = 0
    if (this.arrayArchivos.length < 3) {
      cantidadDisponible = 3 - this.arrayArchivos.length
    } else {
      this.toaster.error('No se pueden agregar mas de 3 catalogos', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      this.mostrar_carga_todo = false
      return
    }
    await this.listarIndicesUnificados()
    const modalRef = this.modalService.open(AsociarCatalogosComponent, {
      size: 'lg modalgrande',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false//no cerrar el modal con ESC
    })
    modalRef.componentInstance.tiposIndice = this.tipoIndice
    modalRef.componentInstance.tipoInsumos = this.tipoInsumos
    modalRef.componentInstance.idUsuario = this.id_usuario.value
    modalRef.componentInstance.cantidadDisponible = cantidadDisponible
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      if (result.length) {
        result.map(data => {
          const objeto = {
            nombre_documento: data.catalogo,
            file: null,
            nuevo: false,
            asociado: true
          }
          this.arrayArchivos.push(objeto)
        })
      }
    }
  }

  async verificarClasificacion() {
    if (!this.id_clasi.value?.id_clasificacion) {
      this.id_clasi.reset()
    } else {
      return
    }
  }
  async listarClasificacionInsumo() {
    this.clasiInsumos = []
    const activo = {
      activo: 1,
      id_tipo_insumo:'',
      id_usuario:this.id_user,
      fuente:this.fuente==0?0:''
    }
    this.clasiInsumos = await this.administradorService.listarClasiInsumosData(activo)
    this.clasiInsumosFiltrado = await this.clasiInsumos.filter(clasificacion => clasificacion.id_tipo_insumo == this.id_tipo.value)
  }

  async abrirModalClasificacion() {
    this.mostrar_carga_todo = true
    const modalRef = await this.modalService.open(ModalListaClasificacionComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false//no cerrar el modal con ESC
    })
    // modalRef.componentInstance.clasiInsumosFiltrado = this.clasiInsumosFiltrado
    modalRef.componentInstance.tipoInsumos = this.tipoInsumos
    modalRef.componentInstance.clasiInsumos = this.clasiInsumos
    modalRef.componentInstance.tipoInsumo = this.id_tipo.value
    modalRef.componentInstance.fuentepasa = this.fuente
    modalRef.componentInstance.id_user = this.id_user
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      this.id_tipo.setValue(result.id_tipo)
      await this.listarClasificacionInsumo();
      await this.cambioTipoInsumo()
      this.id_clasi.setValue(result.id_clasificacion)
    }
  }

  async abrirModalClasificacionAdministrador() {
    this.mostrar_carga_todo = true
    const modalRef = await this.modalService.open(ModalCrudClasificacionComercialComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'pcoded',
      keyboard: false//no cerrar el modal con ESC
    })
    // modalRef.componentInstance.clasiInsumos = this.clasiInsumos
    modalRef.componentInstance.tipoInsumos = this.tipoInsumos
    this.mostrar_carga_todo = false
    const result = await modalRef.result
    if (result) {
      this.clasiInsumos = result.clasiInsumos
      this.id_tipo.setValue(result.id_tipo)
      await this.cambioTipoInsumo()
      this.id_clasi.setValue(result.id_clasificacion)
    }
  }
}
