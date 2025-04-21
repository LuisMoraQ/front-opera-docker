import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TinymceComponent } from 'angular2-tinymce';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddImgUrlComponent } from 'src/app/shared/add-img-url/add-img-url.component';
export interface archivoimg {
  nombre: any;
  base: any;
}
export interface documentoPdf {
  nombre: any;
  url: any;
}
@Component({
  selector: 'app-visualizador-doc-insumos',
  templateUrl: './visualizador-doc-insumos.component.html',
  styleUrls: ['./visualizador-doc-insumos.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class VisualizadorDocInsumosComponent implements OnInit {
  @Output() documentos = new EventEmitter<any>();
  @ViewChild("modalVerImagen") modalVerImagen: ModalBasicComponent;
  @ViewChild("modalSubirImagen") modalSubirImagen: ModalBasicComponent;
  @ViewChild("modalAddCat") modalAddCat: ModalBasicComponent;
  @ViewChild("modalImgDrive") modalImgDrive: ModalBasicComponent;
  active = 0
  url = null
  insumo = null
  nrofotossel = null
  mostrar_carga: boolean = false
  mostrar_carga_todo: boolean = false
  mostrar_carga_body: boolean = false
  buscaficha=false;
  zoom: number = 0.8;
  totalPages: number;
  page: number = 1;
  isLoaded: boolean = false;
  stringImagenes=[];
  dataarchver = [];
  dataarchivossel = [];
  dataestadoarchsel = [];
  dataarchb64 = [];
  verguardararch = false;
  numeroImagen: number = 0;
  verImagenes = true
  public basicContent: string = '';
  nomficha='';
  arrayNombresDocs: documentoPdf[] = [];
  documentoSeleccionado = null
  indiceTabla: any;
  bloquear: any;
  urlimagen="";
  imagenInvalida=false;
  arraddimg=[];
  _insumoSeleccionado
  fromdrive=2;
  idimagen='';
  @Input() set insumoSeleccionado(value: any) {
    if(value!=this.insumo){
      this.dataarchver=[];
      this.insumo = value
      this.url = null
      this.page = 1
      this.zoom = 0.8;
      this.arrayNombresDocs = []
      this.documentoSeleccionado = 0
      this.active = 1
      if (this.insumo) {
        //this.crearArrayDocumentos(this.insumo)
        this.arrcatal=this.insumo.catalogos?JSON.parse(this.insumo.catalogos):[];
        this.recuperarImagenes(this.insumo.imagen)
        this.nrofotossel = this.insumo.nroimgs
        this.nomficha=this.insumo.ficha_tecnica;
        //this.basicContent = this.insumo.ficha_tecnica ? this.insumo.ficha_tecnica : '';
        this.basicContent='';
      }
    }
  }
  @Input() set opcionSeleccionada(value: any) {
    this.active = value
  }

  @Input() set indiceSeleccionado(value: any) {
    this.indiceTabla = value
  }
  @Input() set bloquearAcciones(value: any) {
    this.bloquear = value
  }
  @ViewChild('tinymce', { static: false }) public tinymce: TinymceComponent;
  
  constructor(private encriptadorService: EncriptadorService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private toaster: ToastrService,
    private principalService: PrincipalService,
    private modalService: NgbModal,
    private configuracionService: ConfiguracionService) {
  }

  ngOnInit() {

  }
  convertirTexto(str) {
    // var aux = str;
    // document.getElementById("demo").innerHTML = aux;
  };
  // async crearArrayDocumentos(row) {
  //   if (row.catalogos) {
  //     const arrayNombres = row.catalogos.split('|')
  //     await arrayNombres.forEach(nombre => {
  //       const objeto: documentoPdf = {
  //         nombre: nombre,
  //         url: null
  //       }
  //       this.arrayNombresDocs.push(objeto)
  //     })
  //   }
  // }

  // async abrirPDF(numeroDoc = this.documentoSeleccionado) {
  //   try {
  //     if (this.arrayNombresDocs.length) {
  //       this.mostrar_carga_body = true
  //       this.documentoSeleccionado = numeroDoc
  //       if (!this.arrayNombresDocs[numeroDoc].url) {
  //         this.url = await this.recuperarPDF(this.arrayNombresDocs[numeroDoc].nombre)
  //         this.arrayNombresDocs[numeroDoc].url = this.url
  //       } else {
  //         this.url = this.arrayNombresDocs[numeroDoc].url
  //       }
  //       this.mostrar_carga_body = false
  //     }
  //   } catch (e) {
  //     this.mostrar_carga_body = false
  //     console.log(e);
  //     SwalService.error()
  //   }
  // }

  async recuperarPDF(nombre) {

    let pdfbytes = null
    const inputDocumento = {
      nombre: nombre,
      subc: 'Insumos'
    }
    const arregloBytes = await this.encriptadorService.recuperarDocumento(inputDocumento)
    if (arregloBytes.archivo) {
      pdfbytes = await this._base64ToArrayBuffer(arregloBytes.archivo)
    }

    return pdfbytes
  }

  async _base64ToArrayBuffer(base64) {
    var binary_string = base64.replace(/\\n/g, '');
    binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
  zoomIn() {
    if (this.zoom > 4) return;
    this.zoom = this.zoom + 0.1;
  }

  zoomOut() {
    if (this.zoom < 0.1) return;
    this.zoom = this.zoom - 0.1;
  }

  nextPage() {
    this.page += 1;
  }

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }

  previousPage() {
    this.page -= 1;
  }

  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = true;
  }

  async recuperarImagenes(stringImagen) {
    try {
      if (stringImagen) {
        this.mostrar_carga = true
        this.stringImagenes = stringImagen
        const nombresImagenes = {
          imagen: stringImagen ? stringImagen : ''
        }
        const response = await this.configuracionService.descargarArrayImagenesInsumo(nombresImagenes)
        if (response) {
          this.dataarchver = []
          response.map(data => {
            let fagre: archivoimg;
            if(data.archivo){
              let objectURL = 'data:image/png;base64,' + data.archivo;
              fagre = { nombre: data.nombre, base: this.sanitizer.bypassSecurityTrustUrl(objectURL) };
            }
            else{
              fagre = { nombre: data.nombre, base: data.nombre };
            }
            this.dataarchver.push(fagre);
          })
          this.numeroImagen=0;
        }
        this.mostrar_carga = false
      } else {
        this.dataarchver = []
      }
    } catch (e) {
      console.log(e);
      SwalService.error()
    }
  }

  indicadorImagen(indicador: boolean) {
    if (indicador && (this.numeroImagen < this.dataarchver.length - 1)) {
      this.numeroImagen++
    }
    if (!indicador && (this.numeroImagen > 0)) {
      this.numeroImagen--
    }
  }

  SubirArchivo() {
    if (this.dataarchver.length < 5) {
      const fileUpload = document.getElementById("fileUpload2") as HTMLInputElement;
      fileUpload.onchange = () => {
        let falta = 5 - this.nrofotossel;
        let longmayor = fileUpload.files.length > falta ? falta : fileUpload.files.length;
        for (let index = 0; index < longmayor; index++) {
          const file = fileUpload.files[index];
          this.dataarchivossel.push(file);
          this.dataestadoarchsel.push(false);
          this.extraerBase64(file).then((imagen: any) => {
            let fagre: archivoimg;
            fagre = { nombre: file.name, base: imagen.base };
            this.dataarchb64.push(fagre);
          });
          if (this.dataarchivossel.length > 0) {
            this.verguardararch = true;
          }
        }
        if (fileUpload.files.length > falta) {
          this.toaster.warning('Solo se pueden subir ' + falta + ' imagenes.', 'Incorrecto', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000
          })
        }
      }
      fileUpload.click();
    }
    else {
      this.toaster.warning('No se puede subir mas de 5 imagenes.', 'Incorrecto', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return false
    }
  }

  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeimg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeimg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        })
      };
    }
    catch (e) {
      return null;
    }
  });

  QuitarImagenSubir(ind: any) {
    this.dataarchivossel.splice(ind, 1);
    this.dataestadoarchsel.splice(ind, 1);
    this.dataarchb64.splice(ind, 1);
    if (this.dataarchivossel.length > 0) {
      this.verguardararch = true;
    }
    else {
      this.verguardararch = false;
    }
  }

  async almacenarImagenes() {
    try {
      this.mostrar_carga_todo = true
      let archivo=this.arraddimg.join('|')
      const respuesta = await this.configuracionService.actualizarImgIns({id_insumo: this.insumo.idvinculo??this.insumo.id_insumo,archivo:archivo})
      this.mostrar_carga_todo=false
      if(respuesta?.id==1){
        this.modalSalirSubirImangenes()
        this.toaster.success('Las imagenes se guardaron correctamente.', 'Correcto', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
        this.arraddimg=[];
        this.urlimagen='';
        this.imagenInvalida=false;
        await this.recuperarImagenes(respuesta.imagen)//cambiar metodo para admitir los 2 casos
        await this.emitirDatadocumetos()//que hace?
        this.active = 1
      }
      else{
        this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      }
      // await this.dataarchivossel.reduce(async (a, archivo, currentIndex) => {
      //   // Wait for the previous item to finish processing
      //   await a;
      //   const inputImagen = {
      //     id_insumo: this.insumo.idvinculo??this.insumo.id_insumo,
      //     ind: this.insumo.imagen,
      //     archivo: archivo
      //   }
      //   const response = await this.guardarImagen(inputImagen)
      //   if (currentIndex == this.dataarchivossel.length - 1) {
      //     this.dataarchivossel = []
      //     this.dataestadoarchsel = [];
      //     this.dataarchb64 = [];
      //     await this.recuperarImagenes(response.imagen)
      //     this.mostrar_carga_todo = false
      //     await this.emitirDatadocumetos()
      //     this.active = 1
      //     this.modalSalirSubirImangenes()
      //     this.toaster.success('Las imagenes se guardaron correctamente.', 'Exitò', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      //   }
      // }, Promise.resolve());
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error
    }
  }

  async guardarImagen(inputImagen) {
    const respuesta = await this.configuracionService.guardarImagenInsumo(inputImagen)
    return respuesta
  }

  async guardarFichaTecnica() {
    try {
      this.mostrar_carga_todo = true;
      const inputObservacion = {
        id_insumo: this.insumo.idvinculo??this.insumo.id_insumo,
        observacion: this.basicContent ? this.basicContent : '',
      }
      const response = await this.principalService.actualizarObservacionInsumo(inputObservacion)

      if (response.id == "1") {
        // const emitir = {
        //   id_insumo: this.insumo.id_insumo,
        //   active: 3
        // }
        // this.cargar.emit(emitir)
        this.nomficha=this.basicContent!=''?(this.insumo.idvinculo??this.insumo.id_insumo)+'-ficha.txt':null;
        await this.emitirDatadocumetos()
        SwalService.success()
        //this.basicContent = response.ficha_tecnica
        this.mostrar_carga_todo = false
      }
      else {
        SwalService.error('Advertencia', response.mensaje)
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  // async descargarDocumento() {
  //   try {
  //     this.mostrar_carga_todo = true
  //     const inputDescargar = {
  //       nombre: this.arrayNombresDocs[this.documentoSeleccionado].nombre,
  //       subc: 'Insumos'
  //     }
  //     const response = await this.principalService.descargarDocumento(inputDescargar)
  //     if (response.nombre.toString().includes('.pdf')) {
  //       const source = `data:application/.xls;base64,${response.archivo}`;
  //       const link = document.createElement("a");
  //       link.href = source;
  //       link.download = `${response.nombre}`
  //       link.click();
  //     }
  //     this.mostrar_carga_todo = false
  //   } catch (e) {
  //     this.mostrar_carga_todo = false
  //     console.log(e);
  //     SwalService.error()
  //   }
  // }
  async eliminarImagen() {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminará la Imagen seleccionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const inputEliminarInsumo = {
          id_insumo: this.insumo.idvinculo??this.insumo.id_insumo,
          archivo: this.dataarchver[this.numeroImagen].nombre,
          grupo: this.insumo.imagen
        }
        const response = await this.configuracionService.eliminarImagenInsumo(inputEliminarInsumo)
        if (response[0].id) {
          this.dataarchver.splice(this.numeroImagen, 1)
          if (this.dataarchver.length) {
            this.numeroImagen = this.dataarchver.length - 1
          } else {
            this.numeroImagen = 0
          }
          await this.emitirDatadocumetos()
        }
        this.mostrar_carga_todo = false
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error(e)
    }
  }

  async seleccionarImagen(nroImagen) {
    this.numeroImagen = nroImagen
  }

  cerrarImagen() {
    this.modalVerImagen.hide()
  }

  abrirImagen() {
    this.modalVerImagen.show()
  }

  modalSubirImangenes() {
    if(this.dataarchver.length<3)
      this.modalSubirImagen.show()
    else
      this.toaster.error('Solo se puede subir 3 imagenes.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
  }

  modalSalirSubirImangenes() {
    /* const fileUpload1=document.getElementById("fileUpload2") as HTMLInputElement;
    if(fileUpload1!=null)
    {
      fileUpload1.value=null;
    } */
    this.urlimagen=""
    this.imagenInvalida=false
    this.arraddimg=[]
    this.idimagen=''
    this.fromdrive=1
    this.modalSubirImagen.hide()
  }

  async emitirDatadocumetos() {
    /* let string = ''
    if (this.arrayNombresDocs.length) {
      this.arrayNombresDocs.map((doc, index) => {
        if (index > 0) {
          string = string + '|' + doc.nombre
        } else {
          string = string + doc.nombre
        }
      })
    } else {
      string = null
    } */
    const objeto = {
      imagenes: this.dataarchver,
      catalogos: this.arrcatal.length>0?JSON.stringify(this.arrcatal):null,
      fichaTecnica: this.nomficha,
      indice: this.indiceTabla
    }
    this.documentos.emit(objeto)
  }
  async onNavChange(tab = null) {
    /* if(tab.nextId==3){
      this.abrirPDF();
    }
    else */ if(tab.nextId==2){
      this.buscaficha=true;
      let result=await this.principalService.ArchivoFichaInsumo({nomarch:this.insumo.ficha_tecnica})
      if(result?.length>0){
        this.basicContent=result[0].ficha;
      }
      this.buscaficha=false;
    }
  }
  async AddImagen() {
    const imgTagCount = (this.basicContent.match(/<img/g) || []).length;
    if(imgTagCount>=3){
      this.toaster.error('No se puede agregar mas de 3 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const fileUpload = document.getElementById("imgUpload") as HTMLInputElement;
    if (fileUpload != null) { fileUpload.value = null }
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      let anchi=100;
      let altoi=100;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          anchi = img.width;
          altoi = img.height;
        };
        img.src = e.target.result;
        this.extraerBase64(file).then(async (imagen: any) => {
          let fagre: archivoimg;
          fagre = { nombre: file.name, base: imagen.base };
          imagen = fagre;
          await this.cursor(imagen.base,anchi,altoi)
        });
      };
      reader.readAsDataURL(file);
    }
    fileUpload.click();
  }
  async cursor(img,ancho,alto) {//tope 250
    let propor=1;
    let nanch=ancho;
    let nalt=alto;
    if(ancho>250 || alto>250){
      propor=Number((ancho/alto).toFixed(3));
      nanch=ancho>alto?250:Number((250*propor).toFixed(3));
      nalt=ancho>alto?Number(Math.trunc(250/propor).toFixed(3)):250;
    }
    const array = document.getElementsByTagName('img')
    const text = '<img src="' + img + '" width="'+nanch+'" height="'+nalt+'" id=' + "img" + array.length + '/>'
    if (img) {
      this.tinymce.editor.execCommand('mceInsertContent', false, text);
    }
  }
  Addimg(){
    let totimg=this.arraddimg.length+this.dataarchver.length;
    if(totimg>=3){
      this.toaster.error('Solo puede vincular 3 imagenes.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      return;
    }
    if(!this.imagenInvalida){
      if(this.urlimagen.substring(0,4)!="http"){
        this.toaster.warning('El texto ingresado no es una url, debe empezar con http o https', 'Incorrecto', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        return;
      }
      this.arraddimg.push(this.urlimagen);
      this.urlimagen=''
      this.idimagen=''
    }
    else{
      this.toaster.warning('La url de la imagen no se puede cargar. Ingresar una url valida', 'Incorrecto', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
    }
  }
  QuitarImagArr(ind:any){
    this.arraddimg.splice(ind,1);
  }
  agregaID(){
    this.imagenInvalida = false;
    this.urlimagen='';
    if(this.fromdrive==2){
      if(this.idimagen.includes('https://drive.google')){
        let recoverid=''
        const regex = /\/d\/(.+?)\/view/;
        const match = this.idimagen.match(regex);
        if (match && match[1]) {
            recoverid = match[1];
        }
        this.urlimagen='https://drive.google.com/thumbnail?sz=w1000&id='+recoverid
      }
      else{
        this.toaster.warning('La url de la imagen no corresponde a Google Drive. Ingresar una url valida', 'Incorrecto', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        this.urlimagen=''
      }
    }
    else if(this.fromdrive==3){
      if(this.idimagen.includes('https://www.dropbox')){
        this.urlimagen=this.idimagen.replace("&dl=0","&raw=1")
      }
      else{
        this.toaster.warning('La url de la imagen no corresponde a Dropbox. Ingresar una url valida', 'Incorrecto', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
        this.urlimagen=''
      }
    }
  }
  cambFromDrive(){this.urlimagen=''
    if(this.fromdrive!=1){
      this.agregaID()
    }
  }
  //cargar pdfs de link
  arrcatal=[];
  editcat=-1;
  fila_sel2=-1;
  formLinkCat = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    link: new UntypedFormControl('', [Validators.required]),
  })
  estado: any
  get descripcion(): UntypedFormControl { return this.formLinkCat.get('descripcion') as UntypedFormControl }
  get link(): UntypedFormControl { return this.formLinkCat.get('link') as UntypedFormControl }
  cerrAddCat(){
    this.formLinkCat.reset({
      descripcion: '',
      link: '',
    })
    this.editcat=-1;
    this.modalAddCat.hide();
  }
  AbrirAddCat(row:any,ind){
    if(row){
      this.formLinkCat.reset({
        descripcion: row.descripcion,
        link: row.link,
      })
      this.editcat=ind
    }
    else if(this.arrcatal.length>=5){
      this.toaster.error('Solo puede agregar 5 links.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      return;
    }
    this.modalAddCat.show();
  }
  async guardaCat(){
    if(this.formLinkCat.invalid){
      this.toaster.error('Datos incompletos.', 'Advertencia', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000})
      return;
    }
    if(this.editcat>=0){
      this.arrcatal[this.editcat].descripcion=this.descripcion.value.toString().toUpperCase();
      this.arrcatal[this.editcat].link=this.link.value;
    }
    else{
      this.arrcatal.push({descripcion:this.descripcion.value,link:this.link.value});
    }
    //guardarbd?como json
    this.mostrar_carga_todo = true
    const respuesta = await this.configuracionService.GuardarCatalInsumo({id_insumo: this.insumo.idvinculo??this.insumo.id_insumo,catalogos:this.arrcatal.length>0?JSON.stringify(this.arrcatal):""})
    this.mostrar_carga_todo=false
    if(respuesta[0]?.id==1){
      this.toaster.success('Las imagenes se guardaron correctamente.', 'Correcto', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      await this.emitirDatadocumetos()//que hace?
      //this.active = 1
    }
    else{
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
    }
    this.cerrAddCat();
  }
  async eliminaCat(ind:any){
    this.arrcatal.splice(ind,1);
    this.mostrar_carga_todo = true
    const respuesta = await this.configuracionService.GuardarCatalInsumo({id_insumo: this.insumo.idvinculo??this.insumo.id_insumo,catalogos:this.arrcatal.length>0?JSON.stringify(this.arrcatal):""})
    this.mostrar_carga_todo=false
    if(respuesta[0]?.id==1){
      this.toaster.success('Las imagenes se guardaron correctamente.', 'Correcto', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      await this.emitirDatadocumetos()
    }
    else{
      this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
    }
  }
  async ElimTodoCat(){
    const sw = await SwalService.confirm('Estas seguro?', 'Se eliminará todos los links.')
    if (sw.isConfirmed) {
      this.arrcatal=[];
      this.mostrar_carga_todo = true
      const respuesta = await this.configuracionService.GuardarCatalInsumo({id_insumo: this.insumo.idvinculo??this.insumo.id_insumo,catalogos:""})
      this.mostrar_carga_todo=false
      if(respuesta[0]?.id==1){
        this.toaster.success('Las imagenes se guardaron correctamente.', 'Correcto', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
        await this.emitirDatadocumetos()
      }
      else{
        this.toaster.error('No se pudo realizar la operación.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      }
    }
  }
  cambindicesel2(ind:any){
    this.fila_sel2=ind==this.fila_sel2?-1:ind;
  }
  //imagen a tinymce
  async openImgDrive(){
    const imgTagCount = (this.basicContent.match(/<img/g) || []).length;
    if(imgTagCount>=3){
      this.toaster.error('No se puede agregar mas de 3 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const modalRef = this.modalService.open(AddImgUrlComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
    const result = await modalRef.result
    if (result) {
      const element = document.getElementById("tinyficha");
      var ancholim=element.offsetWidth-70;
      let ancho=255;
      let alto=255;
      let valido=true;
      await this.getImageDimensions(result)
      .then(dimensions => {
        ancho=dimensions.width
        alto=dimensions.height
      })
      .catch(error => {
        valido=false
        this.toaster.error('No se puedo cargar la imagen.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      });
      if(!valido){return}
      //alto img 
      let propor=1;
      let nanch=ancho;
      let nalt=alto;
      if(ancho>ancholim){
        propor=Number((ancho/alto).toFixed(3));
        nanch=ancho>alto?ancholim:Number((ancholim*propor).toFixed(3));
        nalt=ancho>alto?Number(Math.trunc(ancholim/propor).toFixed(3)):ancholim;
      }
      const text = '<img src="' + result + '" width="'+nanch+'" height="'+nalt+'"/>'
      this.tinymce.editor.execCommand('mceInsertContent', false, text);
    }
  }
  getImageDimensions(base64Image: string): Promise<{ width: number, height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        resolve({ width, height });
      };
      img.onerror = reject;
      img.src = base64Image;
    });
  }
}