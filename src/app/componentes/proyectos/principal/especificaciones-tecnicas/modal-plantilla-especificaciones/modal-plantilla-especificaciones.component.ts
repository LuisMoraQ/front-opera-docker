import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { mensaje } from './../../../../../servicios/signalrcustom.service';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EspecificacionesTecnicasService } from 'src/app/servicios/especificaciones-tecnicas.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';

@Component({
  selector: 'app-modal-plantilla-especificaciones',
  templateUrl: './modal-plantilla-especificaciones.component.html',
  styleUrls: ['./modal-plantilla-especificaciones.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalPlantillaEspecificacionesComponent
  implements OnInit, AfterViewInit
{
  @Input() idProyecto = null;
  @Input() permisos = null;
  @Input() idCreadorProy = null;

  @Output() cambioPlantilla = new EventEmitter<boolean>()
  opciones = ['TEXTO', 'UNIDAD DE MEDIDA', 'INSUMOS'];
  opciones2 = ['IDEM', 'DUPLICAR CONTENIDO'];
  tiposInsumos = [
    'MANO DE OBRA',
    'MATERIALES',
    'EQUIPO',
    'SUB CONTRATOS',
    'SUB PARTIDAS',
  ];
  actualizar = false;
  mostrar_carga_todo = false;
  widthH = 0;
  id_user = null
  solover = true
  formEspecif = new UntypedFormGroup({
    tablaDetalle: new UntypedFormArray([]),
    parentesco: new UntypedFormArray([]),
  });
  submit: boolean;
  get tablaDetalle(): UntypedFormArray {
    return this.formEspecif.get('tablaDetalle') as UntypedFormArray;
  }
  get parentesco(): UntypedFormArray {
    return this.formEspecif.get('parentesco') as UntypedFormArray;
  }
  constructor(
    private especificacionesTecnicasService: EspecificacionesTecnicasService,
    private _EncriptadorService: EncriptadorService,
    private toaster: ToastrService
  ) {}
  plantilla = null;
  async ngOnInit() {
    this.id_user = this._EncriptadorService.recuperarlocalstory('idusuario');

    if (this.permisos.length) {
      const existe = await this.permisos.find(ele => !ele.edit)
      if (existe ) {
        if (this.idCreadorProy == this.id_user) {
          this.solover = true
        }
      } else {
        this.solover = true
      }
    } else {
      if (this.idCreadorProy == this.id_user) {
        this.solover = true
      }
    }
    await this.recuperarPlantilla();    
  } 
  closeModal(result: any = null) {
    // this.modal.close(this.actualizar);
  }

  ngAfterViewInit(): void {
    const a =  document.getElementById('h-colInf')

    // this.widthH = document.getElementById('h-colInf-0').clientWidth;
    // console.log('widthH', this.widthH);
  }

  async recuperarPlantilla() {
    const obj = {
      id_proyecto: this.idProyecto,
    };
    const response =
      await this.especificacionesTecnicasService.listarPlantillaEspec(obj);

    if (response.length) {
      const base = await this.plantillaInicial();
      let i = 0;
      for (const iterator of base) {
        iterator.seleccion = response[i]?.seleccion ? true : false;
        iterator.informacion = response[i]?.informacion;
        iterator.detalle = response[i]?.detalle;
        if (iterator.informacion == 'INSUMOS' && iterator.detalle) {
          iterator.detalle = JSON.parse(iterator.detalle);
        } else {
          iterator.detalle = response[i]?.detalle;
        }
        i++;
      }
      await this.estructurarForm(base);
    } else {
      const base = await this.plantillaInicial();
      await this.estructurarForm(base, true);
    }
  }

  async estructurarForm(base, inicial = false) {
    base.forEach((tipo, index) => {
      if (tipo.informacion == 'INSUMOS' && inicial && tipo.detalle) {
        tipo.detalle = JSON.parse(tipo.detalle)
      }
      if (index < 10) {
        this.tablaDetalle.push(this.crearTablaDetalle(tipo));
      } else {
        this.parentesco.push(this.crearTablaDetalle(tipo));
      }
    });
  }

  crearTablaDetalle(tipo) {
    const seccionForm = new UntypedFormGroup({
      editarDetalle: new UntypedFormControl(tipo.editarDetalle, []),
      tipo: new UntypedFormControl(tipo.tipo, []),
      seleccion: new UntypedFormControl(tipo.seleccion, []),
      numero: new UntypedFormControl(tipo.numero, []),
      partida: new UntypedFormControl(tipo.partida, []),
      informacion: new UntypedFormControl(tipo.informacion, []),
      detalle: new UntypedFormControl(tipo.detalle, []),
    });
    return seccionForm;
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  plantillaInicial() {
    const plantillaBase = [
      {
        editarDetalle: 0,
        tipo: 0,
        seleccion: false,
        numero: 0,
        partida: 'DETALLE 01:',
        informacion: 'TITULO',
        detalle: 'DESCRIPCION DE LOS TRABAJOS',
      },
      {
        editarDetalle: 0,
        tipo: 1,
        seleccion: false,
        numero: 1,
        partida: 'CONTENIDO 01:',
        informacion: 'TEXTO',
        detalle: '',
      },
      {
        editarDetalle: 0,
        tipo: 0,
        seleccion: false,
        numero: 2,
        partida: 'DETALLE 02:',
        informacion: 'TITULO',
        detalle: 'METODO DE CONSTRUCCION',
      },
      {
        editarDetalle: 0,
        tipo: 1,
        seleccion: false,
        numero: 3,
        partida: 'CONTENIDO 02:',
        informacion: 'TEXTO',
        detalle: '',
      },
      {
        editarDetalle: 0,
        tipo: 0,
        seleccion: false,
        numero: 4,
        partida: 'DETALLE 03:',
        informacion: 'TITULO',
        detalle: 'DETALLE INSUMOS',
      },
      {
        editarDetalle: 0,
        tipo: 1,
        seleccion: false,
        numero: 5,
        partida: 'CONTENIDO 03:',
        informacion: 'INSUMOS',
        detalle: JSON.stringify(this.tiposInsumos),
      },
      {
        editarDetalle: 0,
        tipo: 0,
        seleccion: false,
        numero: 6,
        partida: 'DETALLE 04:',
        informacion: 'TITULO',
        detalle: 'LA UNIDAD DE MEDIDA DE LA PARTIDA',
      },
      {
        editarDetalle: 0,
        tipo: 1,
        seleccion: false,
        numero: 7,
        partida: 'CONTENIDO 04:',
        informacion: 'TEXTO',
        detalle: '',
      },
      {
        editarDetalle: 0,
        tipo: 0,
        seleccion: false,
        numero: 8,
        partida: 'DETALLE 05:',
        informacion: 'TITULO',
        detalle: 'FORMA DE PAGO',
      },
      {
        editarDetalle: 0,
        tipo: 1,
        seleccion: false,
        numero: 9,
        partida: 'CONTENIDO 05:',
        informacion: 'TEXTO',
        detalle: '',
      },
      {
        editarDetalle: 0,
        tipo: 1,
        seleccion: true,
        numero: 10,
        partida: 'Partidas Vinculadas',
        informacion: 'IDEM',
        detalle: 'VER ESPECIFICACION TECNICA DE :',
      },
    ];
    return plantillaBase;
  }

  activarEdicion(i, tipo, tabla) {
    const value = this[tabla].controls[i] as UntypedFormGroup;
    const editar = value.get('editarDetalle') as UntypedFormControl;
    editar.setValue(tipo);
  }

  cambioInformacion(i) {
    const value = this.tablaDetalle.controls[i] as UntypedFormGroup;
    const informacion = value.get('informacion') as UntypedFormControl;
    const detalle = value.get('detalle') as UntypedFormControl;
    const inicial = 'EL TRABAJO  EJECUTADO SE  MEDIRA POR LA UNIDAD :';
    if (informacion.value == 'UNIDAD DE MEDIDA') {
      const valor = detalle.value ? detalle.value : inicial;
      detalle.setValue(valor);
      detalle.addValidators([Validators.required]);
    } else if (informacion.value == 'INSUMOS') {
      detalle.setValue('');
      detalle.addValidators([Validators.required]);
    } else {
      detalle.setValue('');
      detalle.clearValidators();
    }
    detalle.updateValueAndValidity();
  }

  cambioInformacion2(i) {
    const value = this.parentesco.controls[i] as UntypedFormGroup;
    const informacion = value.get('informacion') as UntypedFormControl;
    const detalle = value.get('detalle') as UntypedFormControl;
    const inicial = 'VER ESPECIFICACION TECNICA DE :';
    if (informacion.value == 'IDEM') {
      const valor = detalle.value ? detalle.value : inicial;
      detalle.setValue(valor);
      detalle.addValidators([Validators.required]);
    } else {
      detalle.setValue('');
      detalle.clearValidators();
    }
  }

  cambioDetalleInsumo(i) {
    const value = this.tablaDetalle.controls[i] as UntypedFormGroup;
    // const detalle = value.get('detalle') as FormControl;
    const value2 = this.tablaDetalle.controls[i - 1] as UntypedFormGroup;
    const detalle2 = value2.get('detalle') as UntypedFormControl;
    // const concatenado = detalle.value.join(' / ');
    const concatenado = 'DETALLE INSUMOS'
    detalle2.setValue(concatenado);
  }

  async guardar() {
    try {
      this.submit = true;
    //  const existe = this.tablaDetalle.value.find((ele) => ele.seleccion)
      let existe = false
      let unidParam = 0
      let insumParam = 0
      this.tablaDetalle.value.forEach(ele => {
        if (ele.seleccion) {
          existe = true
        }
        if (ele.informacion === 'INSUMOS') insumParam++;
        if (ele.informacion === 'UNIDAD DE MEDIDA') unidParam++;
      })
      let msj = '' 
      if (!existe) {
        msj = 'Ninguna fila habilitada en la tabla'
      } else if (insumParam > 1) {
        msj = 'Existen mas de 1 fila con contenido de INSUMOS'
      }else if (unidParam > 1) { 
        msj = 'Existen mas de 1 fila con contenido de UNIDAD DE MEDIDA'
      }

      if (msj) {
        this.toaster.error(msj, 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
        return
      }
      if (this.tablaDetalle.valid) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          'Se guardará los cambios realizados'
        );
        if (sw.isConfirmed) {
          this.mostrar_carga_todo = true;
          let tableData = JSON.parse(JSON.stringify(this.tablaDetalle.value));
          tableData = tableData.concat(
            JSON.parse(JSON.stringify(this.parentesco.value))
          );
          const plantilla = await tableData.map((ele) => {
            ele.seleccion = !ele.seleccion ? 0 : 1;
            if (ele.informacion == 'INSUMOS') {
              ele.detalle = JSON.stringify(ele.detalle);
            }
            ele.seleccion = ele.seleccion ? 1 : 0;
            return ele;
          });
          const datos1 = JSON.stringify(plantilla);
          const obj = JSON.stringify({
            id_proyecto: this.idProyecto,
            datos1: datos1,
          });
          const response =
            await this.especificacionesTecnicasService.actualizarPlantillaEspec(
              obj
            );
          if (response.id == '1') {
            this.mostrar_carga_todo = false;
            this.cambioPlantilla.emit(true)
            this.actualizar = true;
            this.toaster.success(response.mensaje, 'Éxito', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            });
          } else {
            this.mostrar_carga_todo = false;
            this.toaster.error(response.mensaje, 'Error', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            });
          }
        }
      } else {
        this.tablaDetalle.markAllAsTouched();

        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        });
        return;
      }
    } catch (error) {
      console.log(error);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }
}
