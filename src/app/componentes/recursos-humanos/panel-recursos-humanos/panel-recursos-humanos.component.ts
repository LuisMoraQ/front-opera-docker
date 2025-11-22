import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { presupuestoData } from './datamoc';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
import { PrincipalService } from 'src/app/servicios/principal.service';
import { ToastrService } from 'ngx-toastr';

interface IAgrupamiento {
  id_agrupamiento: number;
  id_elemento: number | null;
  id_proyecto: number;
  descripcion: string;
  indice: number | null;
  orden: number;
  abreviatura: string;
  descripcion_costo: string;
  id_indice: number | null;
  monto: number;
  monto2: number | null;
  mostrar: number;
  icomost: number;
  estado: number | null;
  abrev: string
}

@Component({
  selector: 'app-panel-recursos-humanos',
  templateUrl: './panel-recursos-humanos.component.html',
  styleUrls: ['./panel-recursos-humanos.component.scss']
})
export class PanelRecursosHumanosComponent implements OnInit {
  meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  anios = []
  mostrar_carga_todo = false
  @Input() idProyecto = null
  @Input() tabproyecto = null
  @Input() ocultarMenu = null
  @Input() nombreProyecto = null
  subvista = 1
  tablaPanelRecursos = []
  dataTab = null
  id_usuario = null
  tablaPresInd = []
  tablaAgrupamientos: IAgrupamiento[] = []
  filSel = null
  @ViewChild("modalAgregarAgrupados") modalAgregarAgrupados: ModalBasicComponent;
  @ViewChild("modalActualizarAgrupado") modalActualizarAgrupado: ModalBasicComponent;
  @ViewChild("modalAgregarElemento") modalAgregarElemento: ModalBasicComponent;
  formAgrupacion = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    indice: new UntypedFormControl('', [Validators.required]),
    orden: new UntypedFormControl('', []),
    estado: new UntypedFormControl(false, []),
    id_agrupamiento: new UntypedFormControl('', [])
  })
  get descripcion(): UntypedFormControl { return this.formAgrupacion.get('descripcion') as UntypedFormControl }
  get indice(): UntypedFormControl { return this.formAgrupacion.get('indice') as UntypedFormControl }
  get orden(): UntypedFormControl { return this.formAgrupacion.get('orden') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formAgrupacion.get('estado') as UntypedFormControl }
  get id_agrupamiento(): UntypedFormControl { return this.formAgrupacion.get('id_agrupamiento') as UntypedFormControl }

  formElementos = new UntypedFormGroup({
    anio: new UntypedFormControl('', [Validators.required]),
    mes: new UntypedFormControl('', [])
  })

  get anio(): UntypedFormControl { return this.formElementos.get('anio') as UntypedFormControl }
  get mes(): UntypedFormControl { return this.formElementos.get('mes') as UntypedFormControl }

  constructor(private presuservice: PresupuestosService,
    private _EncriptadorService: EncriptadorService,
    private recursosHumanosService: RecursosHumanosService,
    private principalService: PrincipalService,
    private toaster: ToastrService,
  ) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      await this.informacionProyecto()
      await this.listarPresInd()
      await this.listarPanel()
      await this.listarProgramacion()
      this.mostrar_carga_todo = false
    } catch (e) {
      console.log(e)
      this.mostrar_carga_todo = false
      SwalService.error()
    }
  }

  async informacionProyecto() {
    this.id_usuario = this._EncriptadorService.recuperarlocalstory('idusuario');
    this.dataTab = (this.tabproyecto as FormGroup).getRawValue()
  }

  async listarPresInd() {
    let res = await this.presuservice.ListarPresuIndirecto({
      id_usuario: this.id_usuario,
      id_proyecto: this.dataTab.id_proyecto,
      titulo: 0,
    });
    if (res.id == '1') {
      let tabs = JSON.parse(res.tabla);
      this.tablaPresInd = tabs[0];
    }
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
  cambioVista(tab) {
    this.subvista = tab
  }

  async listarPanel() {
    this.tablaAgrupamientos = []
    this.anios = []
    const obj = {
      id_proyecto: this.idProyecto
    }
    const res = await this.recursosHumanosService.listarAgrupamientoExpTec(obj)
    if (res.length) {
      let agrupActual = null
      for (const element of res) {
        if (!element.id_elemento) {
          agrupActual = element
        }
        const encontrado = this.tablaPresInd.find(ele => ele.indice == element.indice)
        const obj: IAgrupamiento = {
          id_agrupamiento: element.id_agrupamiento,
          id_elemento: element.id_elemento,
          id_proyecto: element.id_proyecto,
          descripcion: element.descripcion,
          indice: element.indice,
          orden: element.id_elemento ? element.orden_elemento : element.orden,
          abreviatura: agrupActual?.abrev,
          descripcion_costo: encontrado?.descripcion,
          id_indice: encontrado?.id_indice,
          monto: encontrado?.monto,
          monto2: null,
          mostrar: 1,
          icomost: 0,
          estado: element.estado,
          abrev: encontrado?.abrev
        }
        this.tablaAgrupamientos.push(obj)
      }
      // this.tablaAgrupamientos = res.map(ele => { ele.mostrar = 1; ele.rubro = ''; return ele })
    }
  }

  toggleOnpresu(row, index) {
    this.tablaPanelRecursos[index].icomost = 1
    for (let i = index + 1; i < this.tablaPanelRecursos.length; i++) {

      if (!this.tablaPanelRecursos[i].rubro) {
        break
      }
      this.tablaPanelRecursos[i].mostrar = 1;
    }
  }
  toggleOffpresu(row, index) {
    this.tablaPanelRecursos[index].icomost = 0
    for (let i = index + 1; i < this.tablaPanelRecursos.length; i++) {

      if (!this.tablaPanelRecursos[i].rubro) {
        break
      }
      this.tablaPanelRecursos[i].mostrar = 0;
    }
  }

  openModal() {
    this.formAgrupacion.reset()
    this.modalAgregarAgrupados.show();
  }

  actualizarModal(row) {
    this.formAgrupacion.reset()
    this.descripcion.setValue(row.descripcion)
    this.estado.setValue(row.estado == 2 ? true : false)
    this.id_agrupamiento.setValue(row.id_agrupamiento)
    this.modalActualizarAgrupado.show();
  }

  openModalElementos() {
    this.formElementos.reset()
    this.modalAgregarElemento.show();
  }

  cerrarModal() {
    this.modalAgregarAgrupados.hide();
  }

  cerrarModal2() {
    this.modalActualizarAgrupado.hide();
  }

  cerrarModal3() {
    this.modalAgregarElemento.hide();
  }

  async guardarAgrupamiento() {
    try {
      this.mostrar_carga_todo = true
      const existe = this.tablaAgrupamientos.find(ele => !ele.id_elemento && ele.indice == this.indice.value)
      if (existe) {
        this.mostrar_carga_todo = false
        this.toaster.error(
          'Costo relacionado ya asignado en otro agrupamiento',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      const cantidadAgrupamientos = (this.tablaAgrupamientos.filter(ele => !ele.id_elemento)).length
      const obj = {
        id_proyecto: this.idProyecto,
        descripcion: this.descripcion.value.trim(),
        indice: this.indice.value,
        orden: cantidadAgrupamientos + 1
      }
      const resp = await this.recursosHumanosService.guardarAgrupamientoExpTec(obj)

      await this.listarPresInd();
      await this.listarPanel();
      await this.listarProgramacion();
      this.mostrar_carga_todo = false
      this.cerrarModal()

    } catch (error) {
      console.log(error)
      SwalService.error()
    }


  }

  async actualizarAgrupamiento() {
    try {
      const obj = {
        id_agrupamiento: this.id_agrupamiento.value,
        id_proyecto: this.idProyecto,
        estado: this.estado.value == true ? 2 : (this.tablaAgrupamientos[this.filSel].estado == null ? 0 : this.tablaAgrupamientos[this.filSel].estado),
        descripcion: this.descripcion.value
      }
      const resp = await this.recursosHumanosService.actualizarAgrupamientoExpTec(obj)
      this.cerrarModal2()
    } catch (error) {
      console.log(error)
      SwalService.error()
    }

  }

  async listarProgramacion() {
    const input = { id_proyecto: this.idProyecto };
    const response = await this.recursosHumanosService.listarPrograConFechasLimite(
      input
    );
    this.anios = this.obtenerArrayAñosConMargen(response.calendario)
    // let tablaNueva = []
    // for (const element of this.tablaAgrupamientos) {

    //   tablaNueva.push(element)
    //   const monto = response.calendario.length > 0 ? (element.monto / response.calendario.length) : 0

    //   response.calendario.map((ele, index) => {
    //     const obj = {
    //       abrev: element.abrev,
    //       descripcion: ele.mes,
    //       estado: 0,
    //       formula: '',
    //       id_agrupamiento: null,
    //       id_proyecto: element.id_proyecto,
    //       indice: null,
    //       item: 'p-' + (index + 1),
    //       monto: monto,
    //       monto2: null,
    //       mostrar: 1,
    //       orden: null,
    //       presu_descripcion: '',
    //       rubro: 'mes'
    //     }
    //     tablaNueva.push(obj)
    //   })
    // }
    // this.tablaAgrupamientos = tablaNueva
    // console.table(this.tablaAgrupamientos)
  }

  obtenerArrayAñosConMargen(calendario, margen = 2) {
    const todasLasFechas = calendario.flatMap(item => item.dias);
    const años = todasLasFechas.map(fecha => parseInt(fecha.split('-')[0]));

    const añoMin = Math.min(...años);
    const añoMax = Math.max(...años);

    const arrayAños = [];
    for (let año = añoMin - margen; año <= añoMax + margen; año++) {
      arrayAños.push(año);
    }

    return arrayAños;
  }

  async agregarElemento(index) {
    this.mostrar_carga_todo = true;
    const row = this.tablaAgrupamientos[index];
    const fecha = this.mes.value + '-' + this.anio.value;
    const existe = this.tablaAgrupamientos.find(ele => ele.descripcion == fecha)
    // Convertir la nueva fecha
    if (existe) {
      this.mostrar_carga_todo = false
      this.toaster.error(
        'Fecha ya existente',
        'Error',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return
    }
    const nuevaFecha = this.parsearFecha(fecha);

    // Buscar la posición correcta
    let posicionInsercion = index + 1;

    for (let i = index + 1; i < this.tablaAgrupamientos.length; i++) {
      const element = this.tablaAgrupamientos[i];
      if (!element.id_elemento) break;

      const fechaElemento = this.parsearFecha(element.descripcion);
      if (nuevaFecha <= fechaElemento) {
        posicionInsercion = i;
        break;
      }
      posicionInsercion = i + 1;
    }

    // CALCULAR ORDEN - LÓGICA SIMPLIFICADA
    let orden = 1;

    // Si hay elementos antes de la posición de inserción
    if (posicionInsercion > 0) {
      const elementoAnterior = this.tablaAgrupamientos[posicionInsercion - 1];
      if (elementoAnterior && elementoAnterior.orden !== undefined) {
        if (posicionInsercion === index + 1) {
          orden = 1;
        } else {
          orden = elementoAnterior.orden + 1;
        }
      }
    }

    // Guardar los elementos que necesitan actualización
    const elementosAActualizar = [];

    // Si estamos insertando en medio, necesitamos reordenar los elementos siguientes
    if (posicionInsercion < this.tablaAgrupamientos.length) {
      // Incrementar el orden de todos los elementos siguientes
      for (let i = posicionInsercion; i < this.tablaAgrupamientos.length; i++) {
        if (this.tablaAgrupamientos[i].orden !== undefined &&
          this.tablaAgrupamientos[i].id_elemento) {
          this.tablaAgrupamientos[i].orden += 1;
          // Guardar referencia para actualizar en BD
          elementosAActualizar.push({
            id_proyecto: this.tablaAgrupamientos[i].id_proyecto,
            id_elemento: this.tablaAgrupamientos[i].id_elemento,
            id_agrupamiento: this.tablaAgrupamientos[i].id_agrupamiento,
            descripcion: this.tablaAgrupamientos[i].descripcion,
            orden: this.tablaAgrupamientos[i].orden,
            estado: this.tablaAgrupamientos[i].estado || 0
          });
        }
      }
    }

    const elementoNuevo = {
      id_agrupamiento: row.id_agrupamiento,
      id_proyecto: row.id_proyecto,
      descripcion: fecha,
      orden: orden,
      estado: 0  // Estado por defecto
    };

    const requestData = {
      datos1: JSON.stringify(elementoNuevo),
      datos2: JSON.stringify(elementosAActualizar)
    }


    await this.guardarElemento(requestData);
    this.mostrar_carga_todo = false;
  }

  parsearFecha(fechaString: string): Date {
    const [mes, anio] = fechaString.split('-');
    const meses = {
      'ENERO': 0, 'FEBRERO': 1, 'MARZO': 2, 'ABRIL': 3, 'MAYO': 4, 'JUNIO': 5,
      'JULIO': 6, 'AGOSTO': 7, 'SEPTIEMBRE': 8, 'OCTUBRE': 9, 'NOVIEMBRE': 10, 'DICIEMBRE': 11
    };

    const mesNumero = meses[mes.toUpperCase()];
    const anioNumero = parseInt(anio);

    return new Date(anioNumero, mesNumero);
  }

  esFechaValida(fechaString: string): boolean {
    try {
      const [mes, anio] = fechaString.split('-');
      const mesesValidos = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
      return mesesValidos.includes(mes.toUpperCase()) && !isNaN(parseInt(anio));
    } catch {
      return false;
    }
  }

  async guardarElemento(row) {
    try {
      const res = await this.recursosHumanosService.guardarElementoAgrupamiento(row);


      await this.listarPresInd();
      await this.listarPanel();
      await this.listarProgramacion();
      this.cerrarModal3();
    } catch (error) {
      console.log(error);
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }


  async eliminarElemento(index: number) {
    this.mostrar_carga_todo = true;

    const elementoAEliminar = this.tablaAgrupamientos[index];
    const elementosAActualizar = [];


    // 1. Reordenar los elementos que están después del eliminado
    for (let i = index + 1; i < this.tablaAgrupamientos.length; i++) {
      if (this.tablaAgrupamientos[i].orden !== undefined &&
        this.tablaAgrupamientos[i].id_elemento) {

        // Disminuir el orden en 1
        this.tablaAgrupamientos[i].orden -= 1;

        // Guardar para actualizar en BD
        elementosAActualizar.push({
          id_proyecto: this.tablaAgrupamientos[i].id_proyecto,
          id_elemento: this.tablaAgrupamientos[i].id_elemento,
          id_agrupamiento: this.tablaAgrupamientos[i].id_agrupamiento,
          descripcion: this.tablaAgrupamientos[i].descripcion,
          orden: this.tablaAgrupamientos[i].orden,
          estado: this.tablaAgrupamientos[i].estado || 0
        });
      }
    }

    // 2. Preparar datos para enviar al backend
    const requestData = {
      elementoEliminar: JSON.stringify(elementoAEliminar),
      elementosActualizar: JSON.stringify(elementosAActualizar)
    }


    try {
      const resultado = await this.recursosHumanosService.eliminarElementoAgrupamiento(requestData);

      if (resultado && resultado.id === "1") {
        await this.listarPresInd();
        await this.listarPanel();
        await this.listarProgramacion();
      } else {
        console.error('Error al eliminar:', resultado?.mensaje);
        SwalService.error(resultado?.mensaje || 'Error al eliminar elemento');
      }

    } catch (error) {
      console.error('Error:', error);
      SwalService.error('Error al eliminar elemento');
      this.mostrar_carga_todo = false;
    }

    this.mostrar_carga_todo = false;
  }

  async eliminarAgrupamiento(index: number) {
    this.mostrar_carga_todo = true;

    const agrupamientoAEliminar = this.tablaAgrupamientos[index];
    const agrupamientosAActualizar = [];


    // Validar que sea un agrupamiento (no tiene id_elemento)
    if (agrupamientoAEliminar.id_elemento) {
      console.error('No se puede eliminar - es un elemento, no un agrupamiento');
      SwalService.error('Solo se pueden eliminar agrupamientos completos');
      this.mostrar_carga_todo = false;
      return;
    }

    // 1. Reordenar los agrupamientos que están después del eliminado
    for (let i = index + 1; i < this.tablaAgrupamientos.length; i++) {
      // Solo procesar agrupamientos (que no tienen id_elemento)
      if (!this.tablaAgrupamientos[i].id_elemento) {
        // Disminuir el orden en 1
        this.tablaAgrupamientos[i].orden -= 1;

        // Guardar para actualizar en BD
        agrupamientosAActualizar.push({
          id_proyecto: this.tablaAgrupamientos[i].id_proyecto,
          id_agrupamiento: this.tablaAgrupamientos[i].id_agrupamiento,
          descripcion: this.tablaAgrupamientos[i].descripcion,
          orden: this.tablaAgrupamientos[i].orden,
          estado: this.tablaAgrupamientos[i].estado || 0
        });
      }
    }

    // 2. Preparar datos para enviar al backend
    const requestData = {
      agrupamientoEliminar: JSON.stringify(agrupamientoAEliminar),
      agrupamientosActualizar: JSON.stringify(agrupamientosAActualizar)
    }


    try {
      const resultado = await this.recursosHumanosService.eliminarAgrupamientoCompleto(requestData);

      if (resultado && resultado.id === "1") {
        // Eliminar localmente de la tabla

        await this.listarPresInd();
        await this.listarPanel();
        await this.listarProgramacion();

      } else {
        console.error('Error al eliminar agrupamiento:', resultado?.mensaje);
        SwalService.error(resultado?.mensaje || 'Error al eliminar agrupamiento');
      }

    } catch (error) {
      console.error('Error:', error);
      SwalService.error('Error al eliminar agrupamiento');
    }

    this.mostrar_carga_todo = false;
  }


}
