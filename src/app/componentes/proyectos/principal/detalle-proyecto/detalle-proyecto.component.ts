import {Component, HostListener, Input, OnInit,ViewChild} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {EncriptadorService} from 'src/app/servicios/encriptador.service';
import {PresupuestosService} from 'src/app/servicios/presupuestos.service';
import {PrincipalService} from 'src/app/servicios/principal.service';
import {SwalService} from 'src/app/servicios/swal.service';
import { TinymceComponent } from 'angular2-tinymce';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddImgUrlComponent } from 'src/app/shared/add-img-url/add-img-url.component';
export interface tipoData {
  label: string,
  proceso: string,
  tipo: string
}
export interface archivoimg {
  nombre: any;
  base: any;
}

@Component({
  selector: 'app-detalle-proyecto',
  templateUrl: './detalle-proyecto.component.html',
  styleUrls: ['./detalle-proyecto.component.scss']
})
export class DetalleProyectoComponent implements OnInit {
  opcion = 0;
  detalleProyecto = null;
  presupuestoProyecto: tipoData[] = [];
  metradoProyecto: tipoData[] = [];
  programacionObra: tipoData[] = [];
  cotizacionInsumos: tipoData[] = [];
  especificacionesTecnicas: tipoData[] = [];
  formulaPolinomica: tipoData[] = [];
  proyectoSeleccionado = null;
  mostrar_carga = false;
  mostrar_carga_todo = false;
  buscando = false;
  subPresupuesto = [];
  @Input('height') height: number = 100;
  tamao: number;
  id_user = null;
  esAdmin=false;
  datosProyecto: any = null;
  dec_parcial = 2;
  mask_parcial = '0.2';
  moneda='S/';
  bloqesp=true;
  buscaespec=false;
  public especificacionTexto: string = '';
  public esptext: string = '';
  nomarch:any;
  @ViewChild('tinymce', { static: false }) public tinymce: TinymceComponent;

  @Input() set rowSeleccionado(value: any) {
    this.proyectoSeleccionado = value;
    if(value){
      this.moneda=value.moneda.toString()=='0'?'S/':'$';
    }
    let roleus = this.encriptadorService.recuperarlocalstory('role');
    if(roleus?.includes('ADMINISTRADOR') && this.proyectoSeleccionado?.fuente==0){
      this.esAdmin=true;
    }
    this.especificacionTexto='';//this.partida.espec_tec;
    this.esptext='';
    this.bloqesp=true;
    this.recuperarDetalle();
    this.recuperarDatosProyecto();
    console.log('this.proyectoSeleccionado', this.proyectoSeleccionado)
  }

  @Input() set active(value: any) {
    this.opcion = value;
  }

  constructor(
    private principalService: PrincipalService,
    private presuservice: PresupuestosService,
    private encriptadorService: EncriptadorService,
    private sanitizer: DomSanitizer,
    private toaster: ToastrService,
    private modalService: NgbModal,
  ) { }

  async ngOnInit() {
    try {
      this.id_user = await this.encriptadorService.recuperarlocalstory('idusuario');
      await this.asignarbody();
    } catch (e) {
      SwalService.error();
      console.log(e);
    }
  }

  async asignarbody() {
    var resto = 220;
    if (document.body.clientWidth >= 1200) {
      var resto = 205;
    }
    if (document.body.clientWidth <= 992 && document.body.clientWidth >= 768) {
      resto = 235;
    }
    if (document.body.clientWidth < 768) {
      resto = 300;
    }
    this.height = window.innerHeight - resto;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 220;
    if (document.body.clientWidth >= 1200) {
      var resto = 205;
    }
    if (document.body.clientWidth <= 992 && document.body.clientWidth >= 768) {
      resto = 235;
    }
    if (document.body.clientWidth < 768) {
      resto = 300;
    }
    this.height = window.innerHeight - resto;
  }

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }

  async recuperarDetalle() {
    if (this.proyectoSeleccionado) {
      this.mostrar_carga = true;
      let result = await this.principalService.DataRealizaProy({id_proyecto: this.proyectoSeleccionado?.id_proyecto});
      if (result) {
        this.presupuestoProyecto = [
          {
            label: 'PRESUPUESTO DIRECTO',
            proceso: result[0].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[0].length > 0 ? 'En Proceso' : 'Pendiente')
          },//pendiente, en proceso,concluido
          {
            label: 'PRESUPUESTO INDIRECTO',
            proceso: result[1].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[1].length > 0 ? 'En Proceso' : 'Pendiente')
          }
        ];
        this.metradoProyecto = [
          {
            label: 'METRADO DEL PROYECTO',
            proceso: result[2].length > 0 || result[3].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[2].length > 0 || result[3].length > 0 ? 'En Proceso' : 'Pendiente')
          }
        ];
        this.programacionObra = [
          {
            label: 'DIAGRAMA GANTT - PER CPM',
            proceso: result[4].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[4].length > 0 ? 'En Proceso' : 'Pendiente')
          },
          {
            label: 'CRONOGRAMA VALORIZADO',
            proceso: result[4].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[4].length > 0 ? 'En Proceso' : 'Pendiente')
          },
          {
            label: 'CRONOGRAMA DESEMBOLSO',
            proceso: result[4].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[4].length > 0 ? 'En Proceso' : 'Pendiente')
          },
          /* { label: 'GRÁFICOS Y DIAGRAMA', proceso: detalleProyecto.graficos.split('|')[0], tipo: detalleProyecto.graficos.split('|')[1] } */
        ];
        this.formulaPolinomica = [
          {
            label: 'COMPA. INDICES UNIFICADOS',
            proceso: result[5].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[5].length > 0 ? 'En Proceso' : 'Pendiente')
          },
          {
            label: 'AGRUPAMIENTO DE FP',
            proceso: result[6].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[6].length > 0 ? 'En Proceso' : 'Pendiente')
          },
          {
            label: 'RESUMEN FP',
            proceso: result[7].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[7].length > 0 ? 'En Proceso' : 'Pendiente')
          },
        ];
        this.especificacionesTecnicas = [
          {
            label: 'ESP. TEC. POR PARTIDA',
            proceso: result[8].length > 0 ? '1' : '0',
            tipo: this.proyectoSeleccionado?.estado == '1' ? 'Concluido' : (result[8].length > 0 ? 'En Proceso' : 'Pendiente')
          }
        ];
        /* this.cotizacionInsumos = [
          { label: 'CUADRO COMPARATIVO', proceso: detalleProyecto.comparativo.split('|')[0], tipo: detalleProyecto.comparativo.split('|')[1] },
          { label: 'COTIZACIÓN DE INSUMO', proceso: detalleProyecto.cotizacion.split('|')[0], tipo: detalleProyecto.cotizacion.split('|')[1] }
        ] */

      } else {
        this.presupuestoProyecto = [];
        this.metradoProyecto = [];
        this.programacionObra = [];
        this.cotizacionInsumos = [];
        this.especificacionesTecnicas = [];
        this.formulaPolinomica = [];
      }
      this.mostrar_carga = false;
    } else {
      this.presupuestoProyecto = [];
      this.metradoProyecto = [];
      this.programacionObra = [];
      this.cotizacionInsumos = [];
      this.especificacionesTecnicas = [];
      this.formulaPolinomica = [];
    }
  }
  async recuperarDatosProyecto() {
    try{
      if (this.proyectoSeleccionado) {
        this.subPresupuesto=[]
        this.buscando=true;
        this.datosProyecto = await this.principalService.recuperarDatosProyecto({id_proyecto: this.proyectoSeleccionado?.id_proyecto});
        await this.CargarInfo();
        let resind = await this.presuservice.ListarPresuIndirecto({
          id_usuario: this.id_user ?? '',
          id_proyecto: this.proyectoSeleccionado?.id_proyecto,
          titulo: '0'
        });
        this.buscando=false;
        if (resind.id == '1') {
          let tablapas=JSON.parse(resind.tabla);
          this.subPresupuesto = tablapas[0]
        } else {
          this.subPresupuesto = [];
        }
      } else {
        this.datosProyecto = null;
      }
    }catch(e){
      this.buscando=false;
    }
  }
  async CargarInfo(){
    try{
      this.especificacionTexto=this.esptext;
      if(this.datosProyecto?.informacion){
        this.buscaespec=true;
        let nom_archivo=this.datosProyecto?this.datosProyecto.informacion:'';
        let result = await this.principalService.RecArchivoInfoProy({nomarch:nom_archivo})
        if(result){
          this.especificacionTexto=result;
          this.esptext=result;
        }
        this.buscaespec=false;
      }
    }
    catch(e){
      console.log(e)
      this.buscaespec=false;
    }
  }
  async canEdita2() {//restaura contenido
    this.especificacionTexto=this.esptext;
    this.bloqesp=true;
  }
  async Edita2() {
    if(this.proyectoSeleccionado){
      this.bloqesp=false;
    }
    else{
      this.toaster.error("Seleccione una fila para Editar.", 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
    }
  }
  async Actua2() {
    try {
      this.mostrar_carga_todo = true
      const input = {
        id_proyecto: this.proyectoSeleccionado.id_proyecto,
        contenido: this.especificacionTexto,
      }
      let result = await this.principalService.ActInfoProy(input)
      this.mostrar_carga_todo = false
      console.log(result)
      if (result[0]?.id == '1') {
        this.toaster.success('Se actualizó correctamente.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        //this.partida.espec_tec=this.especificacionTexto==""?null:this.partida.id_partida+'-espec.txt';
        this.bloqesp=true;
      } else {
        this.toaster.error(result[0]?.mensaje, 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  async resetearEspecificacion() {
    const sw = await SwalService.confirm('Estas seguro?', 'Se reiniciara la Especificacion Tecnica con la plantilla')
    if (sw.isConfirmed) {
      this.especificacionTexto="";
    }
  }
  async SubirArchivo() {
    const imgTagCount = (this.especificacionTexto.match(/<img/g) || []).length;
    if(imgTagCount>=5){
      this.toaster.error('No se puede agregar mas de 5 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
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
  async cursor(img,ancho,alto) {
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
  async openImgDrive(){
    const imgTagCount = (this.especificacionTexto.match(/<img/g) || []).length;
    if(imgTagCount>=5){
      this.toaster.error('No se puede agregar mas de 5 imagenes.', 'Advertencia', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
      return
    }
    const modalRef = this.modalService.open(AddImgUrlComponent, {size: 'lg',backdrop: 'static',windowClass: 'pcoded',keyboard: false})
    const result = await modalRef.result
    if (result) {
      const element = document.getElementById("tiny");
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
