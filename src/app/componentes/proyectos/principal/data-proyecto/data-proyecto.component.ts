import {
  Component,
  OnInit,
  Input,
  HostListener,
  ViewChild,
} from '@angular/core';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { ModalimportaproyComponent } from '../../../proyectos/principal/modalimportaproy/modalimportaproy.component';
import { SwalService } from 'src/app/servicios/swal.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { orDependencies } from 'mathjs';

export interface rowacu {
  //revisar parametros de esta fila
  id_proyecto: any;
  indice: any;
  id_filadetalle: any;
  id_tipo_insumo: any;
  num_det: any;
  codigo: any;
  descripcion: any;
  id_unidad: any;
  unidad: any;
  operador: any;
  tipo_insumo: any;
  cuadrilla: any;
  cantidad: any;
  precio: any;
  parcial: any;
  id_indice: any;
  id_clasificacion: any;
  id_insumo: any;
  id_subpartida: any;
  indice_subp: any;
  accion: any;
  esinsumo: any;
  afcuadrilla: any;
  rendimiento: any;
  und_rendi: any;
  jornada: any;
  advceros: any;
  referencia: any;
  desc_clasi: any;
  //afectaref:any;//no existe en tabla detalle, //0:no es subpartida, 1:agregar referencia, 2:eliminar referencia, para actualizar las referencias en bd
  icomost: any;
  mostrar: any;
  editar: any;
  editar2: any;
  ind: any;
  seleccion: any;
  asignaund: any;
  zidmodi: any;
}

@Component({
  selector: 'app-data-proyecto',
  templateUrl: './data-proyecto.component.html',
  styleUrls: ['./data-proyecto.component.scss'],
})
export class DataProyectoComponent implements OnInit {
  @ViewChild('modalDetalles') modaldetalle: ModalBasicComponent;
  @Input('height') height: number = 100;
  mostrar_carga_todo = false;
  mostrar_carga = false;
  activetab = 1;
  idnav = 1;
  expanded = false;
  vistagrande = true;
  datasourcePri = [];
  tabindir = [];
  data_source2 = [];
  data_source3 = [];
  tablaDetalles = [];
  buscatabla = false;
  id_proyecto;
  allform;
  prueba;
  moneda;
  dec_metrado;
  dec_precio;
  dec_parcial;
  dec_cant;
  mostindir = false;
  simbolo;
  decima;
  colores;
  solover;
  tipoProy;
  id_userproy;
  mask_precio = '0.2';
  existetemp = false;
  datosproy
  @Input('height') heightacu: number = 100;
  @Input() set tabproyecto(value: any) {
    this.prueba = value;
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = value.get('aspectos_generales') as UntypedFormGroup;
    const datosproy = aspectosGen.get('datos_proyecto') as UntypedFormGroup;
    const datosrec = aspectosGen.get('datos_recuperado') as UntypedFormGroup;
    this.id_userproy = datosrec.value.id_usuario;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    // this.datosproy= datosproy.value
    this.simbolo = datosrec.value.simbolo;
  }
  constructor(
    private configuracionService: ConfiguracionService,
    private presuservice: PresupuestosService,
    private modalService: NgbModal,
    public formService: FormsService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
  }
  async onNavChange(event) {
    if (event.nextId == 1) {
      this.activetab = 1;
    } else if (event.nextId == 2) {
      this.activetab = 2;
    } else if (event.nextId == 3) {
      this.activetab = 3;
    } else if (event.nextId == 4) {
      this.activetab = 4;
    }
  }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambioSubMenu(value) {
    this.idnav = value;
  }
  ultindice = -1;
  datasourcePriacu = [];
  datasourcePrisub = [];
  datasourcePrisubaux;
  butselprecio = '3';
  titsel = '0';
  filaSel = -1;
  mostrarError(mensaje, titulo, tiempo) {
    this.toaster.error(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: tiempo,
    });
  }
  mostrarInfo(mensaje, titulo, tiempo) {
    this.toaster.info(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: tiempo,
    });
  }
  mostrarAdvertencia(mensaje, titulo) {
    this.toaster.warning(mensaje, titulo, {
      closeButton: false,
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
    });
  }
  async cambindiceselpresu(ind: any, compara = false) {
    if (ind != this.filaSel || compara) {
      this.filaSel = ind;
    }
  }
  // async CambTiporeg(value, indice) {
  //   if(this.datasourcePri[indice].tipo_registro =='4'){
  //     let indice2=this.datasourcePri[indice].indice
  //     if(this.existetemp){
  //       if (this.tablacambios && this.titsel == '0'){
  //         let res = this.tablacambios.tabla2.filter((item)=>item.indice==indice2)
  //         if(res.length>0){
  //           this.mostrarError('Limpie la tabla de Desagregados','',2000)
  //           return;
  //         }
  //       }
  //     }else{
  //       let resp = await this.listIndirectoProy({id_proyecto:this.id_proyecto})
  //       let res = resp[1].filter((item)=>item.indice==indice2)
  //       if(res.length>0){
  //         this.mostrarError('Limpie la tabla de Desagregados','',2000)
  //         return;
  //       }
  //     }
  //   }
  //   this.datasourcePri[indice].tipo_registro = value;
  //   if (value == 2) {
  //     this.datasourcePri[indice].monto = 0;
  //   }else if(value==4){
  //     this.datasourcePri[indice].formula = '';
  //     this.datasourcePri[indice].monto = 0;
  //   }
  //   await this.GetTabladetalles()
  //   this.CalcularTabla();
  //   this.actualizarTemp(12);
  // }
  agregarFila() {
    if (this.titsel == '0') {
      let indins = -1;
      let maxorden = -1;
      if (this.filaSel == -1 || this.filaSel == this.datasourcePri.length - 1) {
        //fin
        let orden
        indins = this.datasourcePri.length;
        if(this.datasourcePri.length==0){
          orden=0
        }else{
          orden=this.datasourcePri[this.datasourcePri.length - 1].orden + 1
        }
        maxorden = orden;
      } else {
        //bajo seleccion
        indins = this.filaSel + 1;
        for (let m = 0; m < this.datasourcePri.length; m++) {
          if (m == indins) {
            maxorden = this.datasourcePri[m].orden;
            this.datasourcePri[m].orden++;
          } else if (m > indins) {
            this.datasourcePri[m].orden++;
          }
        }
      }
      let newindice = this.ultindice++;
      let filaagrega = {
        id_proyecto: this.id_proyecto,
        titulo: this.titsel,
        indice: newindice,
        orden: maxorden,
        tipo_registro: 1,
        abrev: '',
        descripcion: '',
        formula: '',
        monto: 0,
        incluyefp: 0,
        id_indice: null,
        id_usuario: this.id_userproy,
        aplicatit: 1,
        editar1: 0,
        editar2: 0,
        editar3: 0,
        editar4: 0,
        editar5: 0,
        accion: 1, //0:nada,1:insertar,2:update , 3 eliminado esta en otra tabla
        //descant:any;
      };
      if (indins < this.datasourcePri.length) {
        this.datasourcePri.splice(indins, 0, filaagrega);
      } else {
        this.datasourcePri.push(filaagrega);
      }
      //this.inserta.push(filaagrega);
      //this.cambindiceselpresu(indini);
      //this.EditarDesc(indini);
      // this.actualizarTemp(4);
    }
  }
  // public async guardarCambios() {
  //   try {
  //     if (!this.existetemp) {
  //       this.mostrarInfo('No hay Cambios para Guardar.', 'Información', 5000);
  //     } else {
  //       this.mostrar_carga_todo = true;
  //       //ejemplos filas tabladetalle
  //       /* let obj1={
  //         id_proyecto:this.id_proyecto,
  //         indice:3,
  //         id_fila:1,
  //         item:null,
  //         descripcion:'titulo',
  //         unidad:null,
  //         incidencia:null,
  //         cantidad:null,
  //         tiempo:null,
  //         tarifa:null,
  //         total:'1000',
  //         orden:1,
  //         nivel:1,
  //         tipofila:0,
  //         formula:null
  //       }
  //       let obj2={
  //         id_proyecto:this.id_proyecto,
  //         indice:3,
  //         id_fila:2,
  //         item:null,
  //         descripcion:'detalle',
  //         unidad:'',
  //         incidencia:'1',
  //         cantidad:'2',
  //         tiempo:'2',
  //         tarifa:'250',
  //         total:'1000',
  //         orden:1,
  //         nivel:1,
  //         tipofila:0,
  //         formula:null
  //       }
  //       this.tablacambios.tabla2=[];
  //       this.tablacambios.tabla2.push(obj1)
  //       this.tablacambios.tabla2.push(obj2) */
  //       const tabla1 = JSON.stringify(this.tablacambios.tabla);
  //       const tabla2 = JSON.stringify(this.tablacambios.tabla2);
  //       const body = JSON.stringify({
  //         id_proyecto: this.id_proyecto,
  //         id_usuario: this.id_user,
  //         datos1: tabla1,
  //         datos2: tabla2,
  //       });
  //       let resp = await this.presuservice.GuardarCambiosPresIndir(body);
  //       this.mostrar_carga_todo = false;
  //       if (resp.id == '1') {
  //         this.tablacambios = null;
  //         await this.listarPresupuesto();
  //         this.existetemp = false;
  //         let elementoEncontrado = this.datasourcePri.find(
  //           (item) => item.tipo_registro === 3
  //         );
  //         this.abretotal = elementoEncontrado.abrev;
  //         this.totaldir = elementoEncontrado.monto;
  //         this.toaster.success('Se guardó correctamente.', 'Correcto', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 5000,
  //         });
  //       } else {
  //         this.toaster.error(resp.mensaje, 'Advertencia', {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 5000,
  //         });
  //       }
  //     }
  //   } catch (e) {
  //     this.mostrar_carga_todo = false;
  //     console.log(e);
  //     this.toaster.error('No se pudo realizar la operación.', 'Advertencia', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 5000,
  //     });
  //   }
  // }
  // async descartaCambios() {
  //   try {
  //     if (!this.existetemp) {
  //       this.mostrarInfo('No hay Cambios para Descartar.', 'Información', 5000);
  //     } else {
  //       const respu = await SwalService.confirm(
  //         'Esta seguro que desea Descartar los Cambios que no Guardó?',
  //         ''
  //       );
  //       if (respu.isConfirmed) {
  //         this.mostrar_carga = true;
  //         await this.presuservice.DescartarCambiosIndirecto({
  //           id_proyecto: this.id_proyecto,
  //           id_usuario: this.id_user,
  //         }); //descomentar al implementar
  //         this.toaster.success(
  //           'Los cambios se descartaron correctamente.',
  //           'Correcto',
  //           {
  //             closeButton: false,
  //             positionClass: 'toast-bottom-right',
  //             timeOut: 5000,
  //           }
  //         );
  //         this.tablacambios = null;
  //         this.existetemp = false;
  //         await this.listarPresupuesto();
  //         await this.VerDetalles(this.auxindice, true);
  //         this.cambindiceselpresu(-1);
  //         this.mostrar_carga = false;
  //       }
  //     }
  //   } catch (e) {
  //     this.mostrar_carga = false;
  //     console.log(e);
  //     this.toaster.error('No se pudo realizar la operación.', 'Advertencia', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 5000,
  //     });
  //   }
  // }
  async SubirFila() {
    try {
      if (this.titsel == '0') {
        if (this.filaSel > -1) {
          let numsubir = this.filaSel - 1;
          if (numsubir >= 0) {
            let filaact = JSON.parse(
              JSON.stringify(this.datasourcePri[this.filaSel])
            ); //sube
            // filaact.orden=JSON.parse(JSON.stringify(this.datasourcePri[numsubir].orden));
            filaact.orden = this.datasourcePri[numsubir].orden;
            let filamuev = JSON.parse(
              JSON.stringify(this.datasourcePri[numsubir])
            ); //baja
            // filamuev.orden=JSON.parse(JSON.stringify(this.datasourcePri[this.filaSel].orden));
            filamuev.orden = this.datasourcePri[this.filaSel].orden;
            if (filamuev.tipo_registro != '3') {
              this.datasourcePri[this.filaSel] = filamuev;
              this.datasourcePri[numsubir] = filaact;
              this.filaSel = numsubir;
              // this.actualizarTemp(10);
            } else {
              this.toaster.error('La fila ya no puede subir.', 'Advertencia', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              });
            }
          } else {
            this.toaster.error('La fila ya no puede subir.', 'Advertencia', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            });
          }
        } else {
          this.toaster.error('Seleccione una fila para subir.', 'Advertencia', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          });
        }
      }
      console.table(JSON.parse(JSON.stringify(this.datasourcePri)), [
        'indice',
        'orden',
        'tipo_registro',
        'descripcion',
      ]);
    } catch (e) {
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      console.log(e);
    }
  }
  async BajarFila() {
    try {
      if (this.titsel == '0') {
        if (this.filaSel > -1) {
          let final =
            this.datasourcePri.length - 1 == this.filaSel ? true : false;
          if (!final) {
            let indinicam = this.filaSel + 1;
            let filaact = JSON.parse(
              JSON.stringify(this.datasourcePri[this.filaSel])
            );
            if (filaact.tipo_registro != '3') {
              filaact.orden = this.datasourcePri[indinicam].orden;
              let filamuev = JSON.parse(
                JSON.stringify(this.datasourcePri[indinicam])
              );
              filamuev.orden = this.datasourcePri[this.filaSel].orden;
              this.datasourcePri[this.filaSel] = filamuev;
              this.datasourcePri[indinicam] = filaact;
              this.filaSel = indinicam;
              // this.actualizarTemp(11);
            } else {
              this.toaster.error('La fila ya no puede bajar.', 'Advertencia', {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 5000,
              });
            }
          } else {
            this.toaster.error('La fila ya no puede bajar.', 'Advertencia', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            });
          }
        } else {
          this.toaster.error('Seleccione una fila para bajar.', 'Advertencia', {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          });
        }
      }
      console.table(JSON.parse(JSON.stringify(this.datasourcePri)), [
        'indice',
        'orden',
        'tipo_registro',
        'descripcion',
      ]);
    } catch (e) {
      this.toaster.error('No se pudo realizar la operacion.', 'Advertencia', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
      });
      console.log(e);
    }
  }
}
