import {
  Component,
  HostListener,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SwalService } from 'src/app/servicios/swal.service';
import { createNumberMask } from 'text-mask-addons';
import { ModalPosiblesCoincidenciasComponent } from '../modal-posibles-coincidencias/modal-posibles-coincidencias.component';
import { EspecificacionesTecnicasService } from 'src/app/servicios/especificaciones-tecnicas.service';
import { ModalVerEspecificacionComponent } from '../modal-ver-especificacion/modal-ver-especificacion.component';

@Component({
  selector: 'app-modal-busqueda-especificacion',
  templateUrl: './modal-busqueda-especificacion.component.html',
  styleUrls: ['./modal-busqueda-especificacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalBusquedaEspecificacionComponent implements OnInit {
  mostrar_carga_todo = false;
  labelPosition: 'after';
  fuentes = [
    { id: 1, descripcion: 'CATALOGOS' },
    { id: 0, descripcion: 'PROYECTOS' },
  ];
  @Input() clasificaciones = [];
  @Input() listaProyUsuario = [];
  @Input() tablaEspecificaciones = [];
  @Input() titulo1 = '';
  @Input() titulo1color = '';
  @Input() titulo1letra = '';
  @Input() id_user = null;
  @Input() dataTitulo = null;
  @Input() idproyecto = null;
  clasificacionesSeleccionadas = [];
  proyectosArray = [];
  tab = 1;
  tablaBusqueda = [];
  tablaParecidos = [];
  buscartodas = true;
  omitirtodas = false;
  omitirsistema = false;
  omitirmanual = false;
  omitirsistman = false;
  omitirpendiente = false;
  omitirdocumento = false;

  public maskUsAmountDecimal = createNumberMask({
    prefix: '',
    allowDecimal: false,
    integerLimit: 3,
  });

  formBusqueda = new UntypedFormGroup({
    fuenteBusqueda: new UntypedFormControl(1, []),
    partidasSistema: new UntypedFormControl('', []),
    partidasUsuario: new UntypedFormControl('', []),
    tiposProyectos: new UntypedFormControl(null, Validators.required),
    proyectosSelect: new UntypedFormControl('', []),
    mantInform: new UntypedFormControl(0, []),
    opciones: new UntypedFormControl('|||', []),
    porcenBusqueda: new UntypedFormControl('80', [
      Validators.required,
      Validators.min(60),
      Validators.max(100),
    ]),
  });
  textoBusqueda: string =
    'Se buscara coincidencias para todas las partidas del titulo omitiendo IDEM';
  arrayGrupos: any[] = [];
  get fuenteBusqueda(): UntypedFormControl {
    return this.formBusqueda.get('fuenteBusqueda') as UntypedFormControl;
  }

  get partidasSistema(): UntypedFormControl {
    return this.formBusqueda.get('partidasSistema') as UntypedFormControl;
  }
  get partidasUsuario(): UntypedFormControl {
    return this.formBusqueda.get('partidasUsuario') as UntypedFormControl;
  }
  get tiposProyectos(): UntypedFormControl {
    return this.formBusqueda.get('tiposProyectos') as UntypedFormControl;
  }
  get proyectosSelect(): UntypedFormControl {
    return this.formBusqueda.get('proyectosSelect') as UntypedFormControl;
  }
  get mantInform(): UntypedFormControl {
    return this.formBusqueda.get('mantInform') as UntypedFormControl;
  }
  get porcenBusqueda(): UntypedFormControl {
    return this.formBusqueda.get('porcenBusqueda') as UntypedFormControl;
  }
  get opciones(): UntypedFormControl {
    return this.formBusqueda.get('opciones') as UntypedFormControl;
  }

  constructor(
    private modal: NgbActiveModal,
    private especificacionesTecnicasService: EspecificacionesTecnicasService,
    private modalService: NgbModal,
    private toaster: ToastrService
  ) {}

  async ngOnInit() {
    const obj = {
      abr_clasi: '',
      activo: 1,
      descripcion: 'Todos',
      icono: '',
      id_clasificacion: 0,
      observacion: '',
    };
    const encontrado = this.clasificaciones.find(
      (ele) => ele.id_clasificacion == 0
    );
    if (!encontrado) {
      this.clasificaciones.unshift(obj);
    }
    let arrayGrupos = [];
    const arrayNom = ['SISTEMA', 'USUARIO', 'COMPARTIDO CON EL USUARIO'];
    let i = 0;
    for (const element of this.listaProyUsuario) {
      if (!arrayGrupos.includes(arrayNom[element.fuente])) {
        arrayGrupos.push(arrayNom[element.fuente]);
      } else {
        arrayGrupos.push(null);
      }
      i++;
    }
    this.arrayGrupos = arrayGrupos;

    
  }

  async ngAfterViewInit() {}

  async cambioDeTab(event) {
    this.tab = event.nextId;
  }

  async omitirCambio(checked, opcion) {
    const arrayValores = [
      'buscartodas',
      'omitirtodas',
      'omitirsistema',
      'omitirmanual',
      'omitirsistman',
      'omitirpendiente',
      'omitirdocumento'
    ];
    if (opcion == 0) {
      this.buscartodas = checked.checked;
      if (this.buscartodas) {
        this.omitirsistema = false;
        this.omitirmanual = false;
        this.omitirsistman = false;
        this.omitirdocumento = false;
        this.omitirpendiente = false;
        this.omitirtodas = false;
        this.opciones.setValue('0|0|0|0|0');
        this.mantInform.setValue(0);
      } else {
        this.omitirtodas = true;
        this.omitirsistema = true;
        this.omitirmanual = true;
        this.omitirsistman = true;
        this.omitirdocumento = true;
        this.omitirpendiente = false;
        this.opciones.setValue('1|1|1|0|1');
        this.mantInform.setValue(1);
      }
    } else if (opcion == 1) {
    } else {
      this.buscartodas = false;
      this[arrayValores[opcion]] = checked.checked;
      this.mantInform.setValue(1);
      if (this.omitirmanual && this.omitirsistema && this.omitirsistman && this.omitirdocumento)  {
        if (opcion == 5 && this.omitirpendiente) {
          this.omitirsistema = false;
          this.omitirmanual = false;
          this.omitirsistman = false;
          this.omitirdocumento = false;
        }
        this.buscartodas = false;
        this.opciones.setValue('1|1|1|0|1');
      }
    }
    if (
      !this.omitirmanual &&
      !this.omitirsistema &&
      !this.omitirsistman &&
      !this.omitirpendiente &&
      !this.omitirdocumento &&
      !this.buscartodas
    ) {
      this.buscartodas = true;
      this.omitirsistema = false;
      this.omitirmanual = false;
      this.omitirsistman = false;
      this.omitirdocumento = false;
      this.omitirpendiente = false;
      this.omitirtodas = false;
      this.opciones.setValue('0|0|0|0');
      this.mantInform.setValue(0);
    }

    let textoBusqueda = null;
    if (this.buscartodas) {
      this.mantInform.setValue(0);
      this.opciones.setValue('0|0|0|0|0');
    } else {
      this.mantInform.setValue(1);
      let string = '';
      let array = [0, 0, 0, 0,0];

      if (this.omitirsistema) {
        array[0] = 1;
      }
      if (this.omitirmanual) {
        array[1] = 1;
      }
      if (this.omitirsistman) {
        array[2] = 1;
      }
      if (this.omitirpendiente) {
        array[3] = 1;
      }
      if (this.omitirdocumento) {
        array[4] = 1;
      }
      string = array.join('|');
      this.opciones.setValue(string);
    }
    if (this.opciones.value === '0|0|0|0|0') {
      textoBusqueda =
        'Se buscará coincidencias para todas las partidas del título omitiendo IDEM';
    } else if (this.opciones.value === '0|0|0|1|0') {
      textoBusqueda = 'Se buscará partidas con vínculo omitiendo IDEM';
    } else {
      textoBusqueda = 'Se buscará partidas con vínculo : PENDIENTE';
      if (!this.omitirsistema) {
        textoBusqueda = textoBusqueda + ', SISTEMA';
      }
      if (!this.omitirmanual) {
        textoBusqueda = textoBusqueda + ', MANUAL';
      }
      if (!this.omitirsistman) {
        textoBusqueda = textoBusqueda + ', SIST/MAN';
      }
      // if (!this.omitirmanual) {
      //   textoBusqueda = textoBusqueda + ', SIST/MAN';
      // }
      if (!this.omitirdocumento) {
        textoBusqueda = textoBusqueda + ', DOCUMENTO';
      }
    }
    this.textoBusqueda = textoBusqueda;
  }

  async cambioFuente() {
    this.clasificacionesSeleccionadas = [];
    this.proyectosArray = [];
    this.proyectosSelect.reset();
    this.tiposProyectos.reset();
    this.partidasSistema.reset();
    this.partidasUsuario.reset();

    this.proyectosSelect.clearValidators();
    this.tiposProyectos.clearValidators();
    if (this.fuenteBusqueda.value == 1) {
      this.tiposProyectos.addValidators([Validators.required]);
    } else {
      this.proyectosSelect.addValidators([Validators.required]);
    }
    this.tiposProyectos.setErrors(null);
    this.proyectosSelect.setErrors(null);
    this.proyectosSelect.markAsUntouched();
    this.tiposProyectos.markAsUntouched();
    this.proyectosSelect.updateValueAndValidity();
    this.tiposProyectos.updateValueAndValidity();
    this.partidasSistema.updateValueAndValidity();
    this.partidasUsuario.updateValueAndValidity();
  }
  async valorClasificacion(checked, tipo) {
    if (tipo.id_clasificacion == 0) {
      this.clasificacionesSeleccionadas = [];
      if (checked) {
        for (const iterator of this.clasificaciones) {
          this.clasificacionesSeleccionadas.push(iterator.id_clasificacion);
        }
      } else {
      }
    } else {
      if (this.clasificacionesSeleccionadas.includes(0)) {
        const index = this.clasificacionesSeleccionadas.indexOf(0);
        if (index !== undefined) {
          this.clasificacionesSeleccionadas.splice(index, 1);
        }
      }
      if (checked) {
        if (
          !this.clasificacionesSeleccionadas.includes(tipo.id_clasificacion)
        ) {
          this.clasificacionesSeleccionadas.push(tipo.id_clasificacion);
        }
      } else {
        const index = this.clasificacionesSeleccionadas.indexOf(
          tipo.id_clasificacion
        );
        if (index !== undefined) {
          this.clasificacionesSeleccionadas.splice(index, 1);
        }
      }
      const filtro = await this.clasificaciones.map(
        (ele) => ele.id_clasificacion
      );
      filtro.shift();
      let auxiliar = JSON.parse(JSON.stringify(filtro));
      let auxiliar2 = JSON.parse(
        JSON.stringify(this.clasificacionesSeleccionadas)
      );
      auxiliar.sort();
      auxiliar2.sort();
      if (JSON.stringify(auxiliar) === JSON.stringify(auxiliar2)) {
        this.clasificacionesSeleccionadas.push(0);
      }
    }
    this.tiposProyectos.markAsTouched();
    this.tiposProyectos.setValue(this.clasificacionesSeleccionadas);
  }

  verificarCheck(tipo) {
    let checkeado = false;
    if (this.clasificacionesSeleccionadas.includes(tipo.id_clasificacion)) {
      checkeado = true;
    }
    return checkeado;
  }

  closeModal(result: any = null) {
    this.modal.close(result);
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async buscarVinculos() {
    try {
      let tipPartValido = true;
      if (this.fuenteBusqueda.value == 1) {
        const valido = await this.evaluarTiposProy();
        if (valido) {
          tipPartValido = false;
        }
      } else {
        tipPartValido =
          this.proyectosArray.length > 3 || !this.proyectosArray.length
            ? false
            : true;
      }
      if (this.formBusqueda.invalid || !tipPartValido) {
        this.formBusqueda.markAllAsTouched();
        this.toaster.error('Datos no válidos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      } else {
        this.mostrar_carga_todo = true;
        await this.listarBusqueda();
       
        this.mostrar_carga_todo = false;
      }
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.log(error);
      SwalService.error();
    }
  }

  async listarBusqueda() {
    try {
      const id_usuario = this.id_user;
      const porcentaje = this.porcenBusqueda.value;
      const fuente = this.fuenteBusqueda.value;
      const mantinform = this.mantInform.value;
      const partsist = this.partidasSistema.value ? 1 : 0;
      const partusua = this.partidasUsuario.value ? 1 : 0;
      const opciones = this.opciones.value;
      let stringTipoProy;
      if (fuente) {
        if (this.tiposProyectos.value)
          stringTipoProy = this.tiposProyectos.value?.includes(0)
            ? ''
            : this.tiposProyectos.value?.join('|');
        else stringTipoProy = '';
      } else {
        stringTipoProy = '';
      }
      const tipoproy = stringTipoProy;
      const todotipo = tipoproy == '' ? 1 : 0;
      const proyectos = this.proyectosSelect.value;
      const datos1 = JSON.stringify(this.tablaEspecificaciones);
      // console.log('fuente', fuente);
      // console.log('mantinform', mantinform);
      // console.log('partsist', partsist);
      // console.log('partusua', partusua);
      // console.log('todotipo', todotipo);
      // console.log('tipoproy', tipoproy);
      // console.log('proyectos', proyectos);
      // console.log('opciones', opciones);
      const obj = JSON.stringify({
        id_usuario: id_usuario,
        porcentaje: porcentaje,
        fuente: fuente,
        mantinform: mantinform,
        opciones: opciones,
        partsist: partsist,
        partusua: partusua,
        todotipo: todotipo,
        tipoproy: tipoproy,
        proyectos: proyectos,
        datos1: datos1,
      });
      const response =
        await this.especificacionesTecnicasService.buscarPareceEspecTabla(obj);
      // console.log('response', JSON.parse(JSON.stringify(response)));

    
      let tabla1 = [];
      let tabla2 = [];
      if (response.id == '1') {
        tabla1 = JSON.parse(response.tabla1);
        tabla2 = JSON.parse(response.tabla2);
        await this.estructurTabla(tabla1, tabla2);
        this.tab = 2;
      } else {
        SwalService.error('Error', 'Error en los parametros de busqueda')
      }
      return { tabla1: tabla1, tabla2: tabla2 };
    } catch (e) {
      SwalService.error(e)
    }
  }

  async estructurTabla(tabla1, tabla2) {
    tabla1 = await tabla1.map((ele) => {
      if (ele.unidad && ele.contsimilar !== null) {
        ele.vinculado = true;
      } else {
        ele.vinculado = false;
      }
      return ele;
    });
    this.tablaBusqueda = tabla1;
    this.tablaParecidos = tabla2;
  }

  async cambioVinculado(checked, index) {
    if (checked) {
      this.tablaBusqueda[index].vinculado = true;
    } else {
      this.tablaBusqueda[index].vinculado = false;
    }
  }

  async vincular() {
    const sw = await SwalService.confirm(
      'Estas seguro?',
      'Se reemplazara todos las filas vinculadas a la tabla principal'
    );
    if (sw.isConfirmed) {
      const filtrados = await this.tablaBusqueda.filter((ele) => ele.vinculado);
      this.closeModal(filtrados);
    }
  }

  async verTablaListaParecidos(row, index) {
    try {
      const listaParecidos = await this.filtrarParecidos(row);
      const modalRef = this.modalService.open(
        ModalPosiblesCoincidenciasComponent,
        {
          size: 'lg',
          backdrop: 'static',
          windowClass: 'pcoded',
          keyboard: false,
        }
      );
      modalRef.componentInstance.partidaSel = row;
      modalRef.componentInstance.listaProyUsuario = this.listaProyUsuario;
      modalRef.componentInstance.arrayPosibles = listaParecidos;
      const result = await modalRef.result;
      if (result.result) {
        this.tablaBusqueda[index].clasificacion = result.result.clasificacion;
        this.tablaBusqueda[index].descripcion2 = result.result.descripcion2;
        this.tablaBusqueda[index].especificacion2 =
          result.result.especificacion2;
        this.tablaBusqueda[index].modalidad = result.result.modalidad;
        this.tablaBusqueda[index].porcentaje2 = result.result.porcentaje2;
        this.tablaBusqueda[index].tipo_vinc2 = result.result.tipo_vinc2;
        this.tablaBusqueda[index].vinculo_esp2 = result.result.vinculo_esp2;
        this.tablaBusqueda[index].vinculo_espproy2 =
          result.result.vinculo_espproy2;
      } else {
        if (result.cambiado) {
          this.tablaBusqueda[index].clasificacion = null;
          this.tablaBusqueda[index].descripcion2 = null;
          this.tablaBusqueda[index].especificacion2 = null;
          this.tablaBusqueda[index].modalidad = null;
          this.tablaBusqueda[index].porcentaje2 = null;
          this.tablaBusqueda[index].tipo_vinc2 = null;
          this.tablaBusqueda[index].vinculo_esp2 = null;
          this.tablaBusqueda[index].vinculo_espproy2 = null;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  async filtrarParecidos(row) {
    let arrayParecidos = [];
    arrayParecidos = await this.tablaParecidos.filter(
      (ele) => Number(ele.indice) == Number(row.indice)
    );
    return arrayParecidos;
  }

  evaluarTiposProy() {
    let valido = false;
    if (
      (this.tiposProyectos.invalid && this.tiposProyectos.touched) ||
      (this.clasificacionesSeleccionadas.length > 3 &&
        !this.clasificacionesSeleccionadas.includes(0) &&
        this.tiposProyectos.touched) ||
      (!this.clasificacionesSeleccionadas.length && this.tiposProyectos.touched)
    ) {
      valido = true;
    }
    return valido;
  }

  evaluarCheck(proyecto) {
    let valido = false;
    if (
      this.proyectosArray.length > 2 &&
      !this.proyectosArray.includes(proyecto.id_proyecto)
    ) {
      valido = true;
    }
    return valido;
  }

  async valorProyectoSelects(checked, proyecto) {
    this.proyectosSelect.markAsTouched();
    if (checked) {
      if (!this.proyectosArray.includes(proyecto.id_proyecto)) {
        this.proyectosArray.push(proyecto.id_proyecto);
      }
    } else {
      const index = this.proyectosArray.indexOf(proyecto.id_proyecto);
      if (index !== undefined) {
        this.proyectosArray.splice(index, 1);
      }
    }
    let value = null;
    if (this.proyectosArray.length < 4 && this.proyectosArray.length > 0) {
      const faltantes = 5 - this.proyectosArray.length;
      value = this.proyectosArray.join('|');
      for (let i = 0; i < faltantes; i++) {
        value = value + '|';
      }
    }
    this.proyectosSelect.setValue(value);
  }

  async especTecnXPartida(item) {
    try {
      const modalRef = this.modalService.open(ModalVerEspecificacionComponent, {
        size: 'lg',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.especificacion = item.especificacion2;
      const result = await modalRef.result;
      if (result) {
      }
    } catch (e) {
      console.log(e);
    }
  }
}
