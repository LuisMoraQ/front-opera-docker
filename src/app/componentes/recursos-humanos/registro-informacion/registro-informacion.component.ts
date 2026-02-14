import { FormsService } from './../../../servicios/forms.service';
import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormGroup, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TinymceComponent } from 'angular2-tinymce';
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { PresupuestosService } from 'src/app/servicios/presupuestos.service';
import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { AddImgUrlComponent } from 'src/app/shared/add-img-url/add-img-url.component';
import * as moment from 'moment';
import { saveAs } from 'file-saver'; // Opcional: para descargar

interface DetalleAgrupamientoCargo {
  abreviatura?: string;
  descripcion?: string;
  area_descripcion?: string;
  area_abreviatura?: string;
  id_area?: number;
  id_proyecto?: number;
  categoria_t1?: string;
  categoria_t2?: string;
  categoria_t3?: string;
  categoria_t4?: string;
  categoria_t5?: string;
  id_cargo?: number;
  habilitado?: boolean;
  texto?: string;
  item?: number | null
}

export interface Cargo {
  id_cargo?: number;
  id_proyecto: number;
  id_area: number;
  descripcion: string;
  abreviatura: string;
  categoria_t1: number; // 0 | 1
  categoria_t2: number; // 0 | 1
  categoria_t3: number; // 0 | 1
  categoria_t4: number; // 0 | 1
  categoria_t5: number; // 0 | 1
  habilitado: number;   // 0 | 1
  texto: string;
}

export interface archivoimg {
  nombre: any;
  base
}

@Component({
  selector: 'app-registro-informacion',
  templateUrl: './registro-informacion.component.html',
  styleUrls: ['./registro-informacion.component.scss']
})
export class RegistroInformacionComponent implements OnInit {
  mostrar_carga = false
  @Input() nombreProyecto = null
  @ViewChildren('timeInput') timeInputs: QueryList<ElementRef>;
  dias = [
    "LUNES",
    "MARTES",
    "MIÉRCOLES",
    "JUEVES",
    "VIERNES",
    "SÁBADO",
    "DOMINGO"
  ];
  mostrar_carga_todo = false
  activetab = 1
  datasourcePri = []
  tablaCargos: DetalleAgrupamientoCargo[] = []
  @Input() idProyecto = null
  @Input() tablaPresInd = []
  @ViewChild("modalCargo") modalCargo: ModalBasicComponent;
  @ViewChild("modalUsuario") modalUsuario: ModalBasicComponent;
  @ViewChild("modalAsignacion") modalAsignacion: ModalBasicComponent;
  @ViewChild("modalArea") modalArea: ModalBasicComponent;
  @ViewChild("modalConvocatoria") modalConvocatoria: ModalBasicComponent;
  @ViewChild("modalDetalleConvocatoria") modalDetalleConvocatoria: ModalBasicComponent;
  @ViewChild("modalPostulante") modalPostulante: ModalBasicComponent;
  @ViewChild("modalFeriado") modalFeriado: ModalBasicComponent;
  @ViewChild("modalQRAsignacion") modalQRAsignacion: ModalBasicComponent;
  @ViewChild('tinymce', { static: false }) public tinymce: TinymceComponent;
  @ViewChild('qrcanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild("modalPostulanteUsuario") modalPostulanteUsuario: ModalBasicComponent;
  id_usuario = null
  filSel = null
  filUsuario = null
  basicContent = ''
  dataarchver = [];
  bloquear = true
  numeroImagen: number = 0;
  formCargo = new UntypedFormGroup({
    id_cargo: new UntypedFormControl('', []),
    descripcion: new UntypedFormControl('', [Validators.required]),
    abreviatura: new UntypedFormControl('', [Validators.required]),
    categorias: new UntypedFormControl('', [Validators.required]),
  })
  tablaUsuarios: any[] = [];
  tablaCargos2: DetalleAgrupamientoCargo[] = [];
  cargosFiltrados: any[] = [];
  tiposFiltrados: any = []
  areaSelecHorarios = null
  diasNoLaborablesArray: any[] = [];
  calificar: boolean = false;
  get descripcion(): UntypedFormControl { return this.formCargo.get('descripcion') as UntypedFormControl }
  get abreviatura(): UntypedFormControl { return this.formCargo.get('abreviatura') as UntypedFormControl }
  get id_cargo(): UntypedFormControl { return this.formCargo.get('id_cargo') as UntypedFormControl }
  get categorias(): UntypedFormControl { return this.formCargo.get('categorias') as UntypedFormControl }

  formUsuario = new UntypedFormGroup({
    nombres: new UntypedFormControl('', [Validators.required]),
    apellidos: new UntypedFormControl('', [Validators.required]),
    dni: new UntypedFormControl('', [Validators.required]),
    telefono: new UntypedFormControl('', [Validators.required]),
    correo: new UntypedFormControl('', [Validators.email]),
    fecha_asignacion: new UntypedFormControl('', [Validators.required]),
    fecha_culminacion: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('',),
  })

  get nombres(): UntypedFormControl { return this.formUsuario.get('nombres') as UntypedFormControl }
  get apellidos(): UntypedFormControl { return this.formUsuario.get('apellidos') as UntypedFormControl }
  get dni(): UntypedFormControl { return this.formUsuario.get('dni') as UntypedFormControl }
  get telefono(): UntypedFormControl { return this.formUsuario.get('telefono') as UntypedFormControl }
  get correo(): UntypedFormControl { return this.formUsuario.get('correo') as UntypedFormControl }
  get fecha_asignacion(): UntypedFormControl { return this.formUsuario.get('fecha_asignacion') as UntypedFormControl }
  get fecha_culminacion(): UntypedFormControl { return this.formUsuario.get('fecha_culminacion') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formUsuario.get('estado') as UntypedFormControl }

  formAsignacion = new UntypedFormGroup({
    id_asignacion: new UntypedFormControl('', []),
    id_area: new UntypedFormControl('', [Validators.required]),
    id_cargo: new UntypedFormControl('', [Validators.required]),
    tipo_cargo: new UntypedFormControl('', [Validators.required]),
    fecha_inicio: new UntypedFormControl('', [Validators.required, this.validarFechaInicio.bind(this)]),
    fecha_fin: new UntypedFormControl('', [Validators.required, this.validarFechaFin.bind(this)]),
    estado: new UntypedFormControl('', []),
  })
  get id_asignacion(): UntypedFormControl { return this.formAsignacion.get('id_asignacion') as UntypedFormControl }
  get id_area_asignacion(): UntypedFormControl { return this.formAsignacion.get('id_area') as UntypedFormControl }
  get id_cargo_asignacion(): UntypedFormControl { return this.formAsignacion.get('id_cargo') as UntypedFormControl }
  get tipo_cargo(): UntypedFormControl { return this.formAsignacion.get('tipo_cargo') as UntypedFormControl }
  get fecha_inicio_asignacion(): UntypedFormControl { return this.formAsignacion.get('fecha_inicio') as UntypedFormControl }
  get fecha_fin_asignacion(): UntypedFormControl { return this.formAsignacion.get('fecha_fin') as UntypedFormControl }
  get estado_asignacion(): UntypedFormControl { return this.formAsignacion.get('estado') as UntypedFormControl }

  private fechasLimiteUsuario: any = null;
  private asignacionesExistentes: any[] = [];
  formArea = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    abreviatura: new UntypedFormControl('', [Validators.required]),
    responsable: new UntypedFormControl('', []),
    id_area: new UntypedFormControl('', [])
  })

  get descripcionArea(): UntypedFormControl { return this.formArea.get('descripcion') as UntypedFormControl }
  get abreviaturaArea(): UntypedFormControl { return this.formArea.get('abreviatura') as UntypedFormControl }
  get responsableArea(): UntypedFormControl { return this.formArea.get('responsable') as UntypedFormControl }
  get id_area(): UntypedFormControl { return this.formArea.get('id_area') as UntypedFormControl }

  formConvocatoria = new UntypedFormGroup({
    id_convocatoria: new UntypedFormControl('', []),
    nombre_proyecto: new UntypedFormControl('', [Validators.required]),
    nro_convocatoria: new UntypedFormControl('', [Validators.required]),
    link_bases: new UntypedFormControl('', []),
    fecha: new UntypedFormControl({ value: '', disabled: true }, []),
    fecha_culmina: new UntypedFormControl({ value: '', disabled: true }, []),
    duracion: new UntypedFormControl({ value: '', disabled: true }, [Validators.required]),
    modalidad: new UntypedFormControl('', [Validators.required]),
    descripcion: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('', [Validators.required])
  })

  get id_convocatoria(): UntypedFormControl { return this.formConvocatoria.get('id_convocatoria') as UntypedFormControl }
  get nombre_proyecto(): UntypedFormControl { return this.formConvocatoria.get('nombre_proyecto') as UntypedFormControl }
  get nro_convocatoria(): UntypedFormControl { return this.formConvocatoria.get('nro_convocatoria') as UntypedFormControl }
  get link_bases(): UntypedFormControl { return this.formConvocatoria.get('link_bases') as UntypedFormControl }
  get fechaConvocatoria(): UntypedFormControl { return this.formConvocatoria.get('fecha') as UntypedFormControl }
  get fecha_culmina_convocatoria(): UntypedFormControl { return this.formConvocatoria.get('fecha_culmina') as UntypedFormControl }
  get duracionConvocatoria(): UntypedFormControl { return this.formConvocatoria.get('duracion') as UntypedFormControl }
  get modalidad(): UntypedFormControl { return this.formConvocatoria.get('modalidad') as UntypedFormControl }
  get descripcionConvocatoria(): UntypedFormControl { return this.formConvocatoria.get('descripcion') as UntypedFormControl }
  get estadoConvocatoria(): UntypedFormControl { return this.formConvocatoria.get('estado') as UntypedFormControl }

  formDetalleConvocatoria = new UntypedFormGroup({
    id_detalle: new UntypedFormControl('', []),
    id_area: new UntypedFormControl('', [Validators.required]),
    id_cargo: new UntypedFormControl('', [Validators.required]),
    vacantes: new UntypedFormControl('', [Validators.required]),
    requerimiento: new UntypedFormControl('', [Validators.required]),
    remuneracion: new UntypedFormControl('', [Validators.required]),
    link_documento: new UntypedFormControl('', []),
    estado: new UntypedFormControl('', []),
    ciudad: new UntypedFormControl('', []),
  })

  get id_detalle(): UntypedFormControl { return this.formDetalleConvocatoria.get('id_detalle') as UntypedFormControl }
  get id_area_detalle_conv(): UntypedFormControl { return this.formDetalleConvocatoria.get('id_area') as UntypedFormControl }
  get id_cargo_detalle_conv(): UntypedFormControl { return this.formDetalleConvocatoria.get('id_cargo') as UntypedFormControl }
  get vacantes(): UntypedFormControl { return this.formDetalleConvocatoria.get('vacantes') as UntypedFormControl }
  get requerimiento(): UntypedFormControl { return this.formDetalleConvocatoria.get('requerimiento') as UntypedFormControl }
  get remuneracion(): UntypedFormControl { return this.formDetalleConvocatoria.get('remuneracion') as UntypedFormControl }
  get link_documento(): UntypedFormControl { return this.formDetalleConvocatoria.get('link_documento') as UntypedFormControl }
  get estado_detalle_conv(): UntypedFormControl { return this.formDetalleConvocatoria.get('estado') as UntypedFormControl }
  get ciudad(): UntypedFormControl { return this.formDetalleConvocatoria.get('ciudad') as UntypedFormControl }

  tablaConvocatorias = []
  filConv = null
  areas = []
  cargos = []
  filPostulante = null
  tablaPostulantes = []
  buscando = false
  currentRating: number = 0;
  tablaHorario = []
  dataHorario = null
  tablaFeriados = []
  cantHorasSemana = 0
  cantHorasDescanso = 0
  inicioSemana = null
  celdaEditable = []
  filFeriado = null
  formPostulante = new UntypedFormGroup({
    id_postulante: new UntypedFormControl('', []),
    id_convocatoria: new UntypedFormControl('', []),
    nombres: new UntypedFormControl('', [Validators.required]),
    apellidos: new UntypedFormControl('', [Validators.required]),
    fecha: new UntypedFormControl('', []),
    evaluador: new UntypedFormControl('', []),
    id_area: new UntypedFormControl('', []),
    id_cargo: new UntypedFormControl('', [Validators.required]),
    cv: new UntypedFormControl('', []),
    entrevista: new UntypedFormControl('', []),
    telefono: new UntypedFormControl('', [Validators.required]),
    correo: new UntypedFormControl('', [Validators.required]),
    progreso: new UntypedFormControl('', []),
    calidad: new UntypedFormControl('', []),
    adicional: new UntypedFormControl('', []),
    dni: new UntypedFormControl('', [Validators.required]),
  })
  get id_postulante(): UntypedFormControl { return this.formPostulante.get('id_postulante') as UntypedFormControl }
  get id_convocatoria_postulante(): UntypedFormControl { return this.formPostulante.get('id_convocatoria') as UntypedFormControl }
  get nombres_postulante(): UntypedFormControl { return this.formPostulante.get('nombres') as UntypedFormControl }
  get apellidos_postulante(): UntypedFormControl { return this.formPostulante.get('apellidos') as UntypedFormControl }
  get fecha_postulante(): UntypedFormControl { return this.formPostulante.get('fecha') as UntypedFormControl }
  get evaluador(): UntypedFormControl { return this.formPostulante.get('evaluador') as UntypedFormControl }
  get id_area_postulante(): UntypedFormControl { return this.formPostulante.get('id_area') as UntypedFormControl }
  get id_cargo_postulante(): UntypedFormControl { return this.formPostulante.get('id_cargo') as UntypedFormControl }
  get cv(): UntypedFormControl { return this.formPostulante.get('cv') as UntypedFormControl }
  get entrevista(): UntypedFormControl { return this.formPostulante.get('entrevista') as UntypedFormControl }
  get telefono_postulante(): UntypedFormControl { return this.formPostulante.get('telefono') as UntypedFormControl }
  get correo_postulante(): UntypedFormControl { return this.formPostulante.get('correo') as UntypedFormControl }
  get progreso(): UntypedFormControl { return this.formPostulante.get('progreso') as UntypedFormControl }
  get calidad(): UntypedFormControl { return this.formPostulante.get('calidad') as UntypedFormControl }
  get adicional(): UntypedFormControl { return this.formPostulante.get('adicional') as UntypedFormControl }
  get dni_postulante(): UntypedFormControl { return this.formPostulante.get('dni') as UntypedFormControl }


  formFeriado = new UntypedFormGroup({
    id_feriado: new UntypedFormControl('', []),
    // areas: new UntypedFormControl('', []),
    fecha: new UntypedFormControl('', [Validators.required]),
    descripcion: new UntypedFormControl('', [Validators.required])
  })

  get id_feriado(): UntypedFormControl { return this.formFeriado.get('id_feriado') as UntypedFormControl }
  // get areasFeriado(): UntypedFormControl { return this.formFeriado.get('areas') as UntypedFormControl }
  get fechaFeriado(): UntypedFormControl { return this.formFeriado.get('fecha') as UntypedFormControl }
  get descripcionFeriado(): UntypedFormControl { return this.formFeriado.get('descripcion') as UntypedFormControl }
  tiposAsistencia = []
  tipos = [
    { codigo: 'A', tipo: 'ASISTIO', porcentaje: null },
    { codigo: 'T', tipo: 'TARDANZA', porcentaje: 10 },
    { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA', porcentaje: 10 },
    { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA', porcentaje: null },
    { codigo: 'F', tipo: 'FALTA', porcentaje: 100 },
    { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA', porcentaje: 100 },
    { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA', porcentaje: null },
    { codigo: 'FM', tipo: 'DESCANSO MEDICO', porcentaje: null },
    { codigo: 'FV', tipo: 'VACACIONES', porcentaje: null },
    { codigo: 'FC', tipo: 'CITA MEDICA', porcentaje: null },
    { codigo: 'FD', tipo: 'DUELO', porcentaje: null },
    { codigo: 'PE', tipo: 'PERMISO', porcentaje: null },
    // { codigo: 'FS', tipo: 'NO MARCO SALIDA', porcentaje: null },
    // { codigo: 'OBS', tipo: 'OBSERVADO', porcentaje: null },
    // { codigo: 'IN', tipo: 'INCOMPLETO', porcentaje: null },
    // { codigo: 'TEX', tipo: 'TEXTRA', porcentaje: null }
  ]
  tablaAsignaciones = []
  filAsignacion = null

  detalleConvocatoria = []
  filDetalle = null
  qrData = ''
  tardanza = 0
  tiempo_extra = 0

  tipos_cargos = [
    'Categoria t1',
    'Categoria t2',
    'Categoria t3',
    'Categoria t4',
    'Categoria t5'
  ]

  formUsuarioPostulante = new UntypedFormGroup({
    nombres: new UntypedFormControl('', [Validators.required]),
    apellidos: new UntypedFormControl('', [Validators.required]),
    dni: new UntypedFormControl('', [Validators.required]),
    telefono: new UntypedFormControl('', [Validators.required]),
    correo: new UntypedFormControl('', [Validators.email]),
    fecha_asignacion: new UntypedFormControl('', [Validators.required]),
    fecha_culminacion: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('', []),
    id_area: new UntypedFormControl('', []),
    id_cargo: new UntypedFormControl('', []),
    categoria: new UntypedFormControl('', [Validators.required]),
  })

  get nombres_up(): UntypedFormControl { return this.formUsuarioPostulante.get('nombres') as UntypedFormControl }
  get apellidos_up(): UntypedFormControl { return this.formUsuarioPostulante.get('apellidos') as UntypedFormControl }
  get dni_up(): UntypedFormControl { return this.formUsuarioPostulante.get('dni') as UntypedFormControl }
  get telefono_up(): UntypedFormControl { return this.formUsuarioPostulante.get('telefono') as UntypedFormControl }
  get correo_up(): UntypedFormControl { return this.formUsuarioPostulante.get('correo') as UntypedFormControl }
  get fecha_asignacion_up(): UntypedFormControl { return this.formUsuarioPostulante.get('fecha_asignacion') as UntypedFormControl }
  get fecha_culminacion_up(): UntypedFormControl { return this.formUsuarioPostulante.get('fecha_culminacion') as UntypedFormControl }
  get estado_up(): UntypedFormControl { return this.formUsuarioPostulante.get('estado') as UntypedFormControl }
  get area_up(): UntypedFormControl { return this.formUsuarioPostulante.get('id_area') as UntypedFormControl }
  get cargo_up(): UntypedFormControl { return this.formUsuarioPostulante.get('id_cargo') as UntypedFormControl }
  get categoria_up(): UntypedFormControl { return this.formUsuarioPostulante.get('categoria') as UntypedFormControl }

  paso = 1
  filPostAprobados = null
  postulAprobados = []
  terminoBusqueda = ''
  constructor(private presuservice: PresupuestosService,
    private sanitizer: DomSanitizer,
    private encriptadorService: EncriptadorService,
    private recursosHumanosService: RecursosHumanosService,
    private toaster: ToastrService,
    private modalService: NgbModal,
    public formsService: FormsService
  ) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      this.id_usuario = this.encriptadorService.recuperarlocalstory('idusuario');
      await this.listarCargosPorArea()
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async onNavChange(e) {
    this.mostrar_carga_todo = true
    this.filSel = null
    this.basicContent = null
    this.bloquear = true
    if (e.nextId == 2) {
      this.tablaAsignaciones = []
      this.filUsuario = null
      this.filAsignacion = null
      await this.generarTablaUsuarios()
    }

    if (e.nextId == 3) {
      this.filConv = null
      this.filDetalle = null
      this.filPostulante = null
      await this.listarConvocatorias()
    }
    if (e.nextId == 4) {
      this.areaSelecHorarios = null
      this.areas = []
      await this.listarAreasYCargos()
      if (!this.areaSelecHorarios && this.areas.length) {
        this.areaSelecHorarios = this.areas[0].id_area
        await this.listarHorarioYFeriadosArea()

      }
    }
    this.mostrar_carga_todo = false
  }

  cerrarModal() {
    this.modalCargo.hide();
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async listarCargosPorArea() {
    const obj = {
      id_proyecto: this.idProyecto
    }
    const resp = await this.recursosHumanosService.listarCargosPorArea(obj)
    this.tablaCargos = []
    this.tablaUsuarios = []
    let j = 1
    for (const filaArea of resp[0]) {
      let arraygrupo = []
      arraygrupo.push(filaArea)
      const encontrados = [];
      for (let i = resp[1].length - 1; i >= 0; i--) {
        if (resp[1][i].id_area == filaArea.id_area) {
          // Agregar a encontrados y eliminar del array original
          encontrados.push(resp[1][i]);
          resp[1].splice(i, 1);
        }
      }
      if (encontrados.length) {
        arraygrupo = arraygrupo.concat(encontrados)
      }
      // const existe = this.tablaPresInd.find(ele => ele.indice == filaArea.indice)
      const existe = null
      let k = 1
      for (const element of arraygrupo) {
        const obj: DetalleAgrupamientoCargo = {
          abreviatura: element?.abreviatura,
          descripcion: element?.descripcion,
          area_descripcion: filaArea?.descripcion,
          area_abreviatura: filaArea?.abreviatura,
          id_area: filaArea?.id_area,
          id_proyecto: filaArea?.id_proyecto,
          categoria_t1: element?.categoria_t1,
          categoria_t2: element?.categoria_t2,
          categoria_t3: element?.categoria_t3,
          categoria_t4: element?.categoria_t4,
          categoria_t5: element?.categoria_t5,
          id_cargo: element?.id_cargo,
          habilitado: element?.habilitado == 1 || element?.habilitado == '1' ? true : false,
          texto: element?.texto ? element.texto : '',
          item: element.id_cargo ? k : j
        }
        this.tablaCargos.push(obj)
        k++
      }
      j++
    }
    this.tablaCargos2 = this.tablaCargos
  }

  async eliminarCargo(row, i) {
    const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el cargo seleccionado')
    if (sw.isConfirmed) {
      this.mostrar_carga_todo = true
      const obj = {
        id_cargo: row.id_cargo,
        id_proyecto: row.id_proyecto,
        id_area: row.id_area
      }
      const resp = await this.recursosHumanosService.eliminarCargoArea(obj)
      if (resp[0].id == 1) {
        this.tablaCargos.splice(i, 1)
        this.filSel = null
        this.mostrar_carga_todo = false
        this.toaster.success(
          resp[0].mensaje,
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );

      } else {
        this.mostrar_carga_todo = false
        this.toaster.error(
          resp[0].mensaje,
          '',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      }


    }
  }

  async abrirModalCargo(row?, i?) {
    this.formCargo.reset()
    if (row) {
      let categoria = 'Categoria t1'
      if (row.id_cargo) {
        const categorias = [{ value: 'Categoria t1', key: 'categoria_t1' }, { value: 'Categoria t2', key: 'categoria_t2' }, { value: 'Categoria t3', key: 'categoria_t3' }, { value: 'Categoria t4', key: 'categoria_t4' }, { value: 'Categoria t5', key: 'categoria_t5' }]
        for (const element of categorias) {
          if (row[element.key] == 1) {
            categoria = element.value
          }
        }
      }

      this.formCargo.patchValue({
        id_cargo: row.id_cargo,
        descripcion: row.descripcion,
        abreviatura: row.abreviatura,
        categorias: categoria
      })
    } else {

    }
    this.modalCargo.show()
  }

  abrirModal2() {
    this.formUsuario.reset()
    this.filUsuario = null
    this.modalUsuario.show()
  }

  async abrirModalPostulUsuario() {
    try {
      this.mostrar_carga_todo = true
      this.filPostAprobados = null
      this.postulAprobados = []
      this.formUsuarioPostulante.reset()
      this.formUsuarioPostulante.disable()
      this.modalPostulanteUsuario.show()
      const obj = {
        id_proyecto: this.idProyecto,
        id_convocatoria: null,
        entrevista: 'APROBADO'
      }
      const resp = await this.recursosHumanosService.postulantesPorEstadoConvocatoria(obj)
      const resp2 = await this.recursosHumanosService.listarCargosPorArea({ id_proyecto: this.idProyecto })
      this.areas = resp2[0]
      this.cargos = resp2[1]
      if (resp?.length) {
        this.postulAprobados = resp
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }

  }

  async cargarEnForm(row, i) {
    try {
      this.mostrar_carga_todo = true
      this.formUsuarioPostulante.disable()
      this.formUsuarioPostulante.reset()
      const obj = {
        id_proyecto: row.id_proyecto,
        dni: row.dni
      }
      const resp = await this.recursosHumanosService.verificarDniUsuario(obj)
      if (resp?.length) {
        this.dni_up.setErrors({ incorrect: true })
        this.toaster.error(
          'USUARIO YA REGISTRADO CON ESTADO ACTIVO, CAMBIAR REGISTRO DE USUARIO ( ' + resp[0].nombres + ' ' + resp[0].apellidos + ' ) A INACTIVO PARA PODER AGREGAR NUEVO REGISTRO DE USUARIO',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 6000,
          }
        );
      } else {
        this.toaster.info('Usuario disponible', '',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 3000,
          })
        this.telefono_up.enable()
        this.correo_up.enable()
        this.categoria_up.enable()
        this.fecha_asignacion_up.enable()
        this.fecha_culminacion_up.enable()
        this.area_up.setValue(row.id_area)
        await this.cambioSelectAreaPostUser(null)
        this.cargo_up.setValue(row.id_cargo)
        await this.cambioCargoPostUser(null)
        this.formUsuarioPostulante.patchValue({
          nombres: row.nombres,
          apellidos: row.apellidos,
          dni: row.dni,
          telefono: row.telefono,
          correo: row.correo,
          fecha_asignacion: null,
          fecha_culminacion: null,
          estado: row.estado,
          id_area: row.id_area,
          id_cargo: row.id_cargo,
          categoria: null,
        })
      }


      this.mostrar_carga_todo = false


    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }
  }

  cerrarModalPostUsu() {
    this.modalPostulanteUsuario.hide()
  }

  async agregarCargo() {
    try {
      this.mostrar_carga_todo = true
      if (this.formCargo.invalid) {
        this.mostrar_carga_todo = false
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      const categorias = [{ value: 'Categoria t1', key: 'categoria_t1' }, { value: 'Categoria t2', key: 'categoria_t2' }, { value: 'Categoria t3', key: 'categoria_t3' }, { value: 'Categoria t4', key: 'categoria_t4' }, { value: 'Categoria t5', key: 'categoria_t5' }]

      const fila = this.tablaCargos[this.filSel]
      const obj: Cargo = {
        id_proyecto: this.idProyecto,
        id_area: fila.id_area,
        descripcion: this.descripcion.value.trim().toUpperCase(),
        abreviatura: this.abreviatura.value.trim().toUpperCase(),
        categoria_t1: 0,
        categoria_t2: 0,
        categoria_t3: 0,
        categoria_t4: 0,
        categoria_t5: 0,
        habilitado: 1,
        texto: ''
      }
      for (const element of categorias) {
        if (element.value == this.categorias.value) {
          obj[element.key] = 1
        } else {
          obj[element.key] = 0
        }
      }
      const response = await this.recursosHumanosService.guardarCargoArea(obj)
      await this.listarCargosPorArea()
      this.cerrarModal()
      this.toaster.success(
        'Se agrego Correctamente',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async cambioHabilitado(row, i, checked) {
    try {
      this.mostrar_carga_todo = true
      this.tablaCargos[i].habilitado = checked
      const obj: Cargo = {
        id_cargo: row.id_cargo,
        id_proyecto: row.id_proyecto,
        id_area: row.id_area,
        descripcion: row.descripcion,
        abreviatura: row.abreviatura,
        categoria_t1: row.categoria_t1 ? 1 : 0,
        categoria_t2: row.categoria_t2 ? 1 : 0,
        categoria_t3: row.categoria_t3 ? 1 : 0,
        categoria_t4: row.categoria_t4 ? 1 : 0,
        categoria_t5: row.categoria_t5 ? 1 : 0,
        habilitado: row.cargo_habilitado ? 1 : 0,
        texto: row.texto ? row.texto : ''
      }
      const resp = await this.recursosHumanosService.actualizarCargoArea(obj)
      if (resp[0]) {
        this.bloquear = ((this.tablaCargos[i].id_cargo && this.tablaCargos[i].habilitado) ? false : true)
        this.mostrar_carga_todo = false
        this.toaster.success(
          'Se actualizo correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      } else {
        this.mostrar_carga_todo = false
        SwalService.error()
      }
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }

  }

  async actualizarCategoria(row, categoria, checked, i) {
    const categorias = [{ value: 'Categoria t1', key: 'categoria_t1' }, { value: 'Categoria t2', key: 'categoria_t2' }, { value: 'Categoria t3', key: 'categoria_t3' }, { value: 'Categoria t4', key: 'categoria_t4' }, { value: 'Categoria t5', key: 'categoria_t5' }]
    this.tablaCargos[i][categoria] = checked
    const obj: Cargo = {
      id_cargo: row.id_cargo,
      id_proyecto: row.id_proyecto,
      id_area: row.id_area,
      descripcion: row.descripcion,
      abreviatura: row.abreviatura,
      categoria_t1: row.categoria_t1 ? 1 : 0,
      categoria_t2: row.categoria_t2 ? 1 : 0,
      categoria_t3: row.categoria_t3 ? 1 : 0,
      categoria_t4: row.categoria_t4 ? 1 : 0,
      categoria_t5: row.categoria_t5 ? 1 : 0,
      habilitado: row.habilitado ? 1 : 0,
      texto: row.texto ? row.texto : ''
    }
    for (const element of categorias) {
      if (element.value == this.categorias.value) {
        obj[element.key] = 1
      } else {
        obj[element.key] = 0
      }
    }
    const resp = await this.recursosHumanosService.actualizarCargoArea(obj)
    if (resp[0]) {
      // this.mostrar_carga_todo = false
      // this.toaster.success(
      //   'Se actualizo correctamente',
      //   'Correcto',
      //   {
      //     closeButton: false,
      //     positionClass: 'toast-bottom-right',
      //     timeOut: 4000,
      //   }
      // );
    } else {
      SwalService.error()
    }
  }

  async AddImagen() {
    const imgTagCount = (this.basicContent.match(/<img/g) || []).length;
    if (imgTagCount >= 3) {
      this.toaster.error('No se puede agregar mas de 3 imagenes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return
    }
    const fileUpload = document.getElementById("imgUpload") as HTMLInputElement;
    if (fileUpload != null) { fileUpload.value = null }
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      let anchi = 100;
      let altoi = 100;
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
          await this.cursor(imagen.base, anchi, altoi)
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

  async cursor(img, ancho, alto) {//tope 250
    let propor = 1;
    let nanch = ancho;
    let nalt = alto;
    if (ancho > 250 || alto > 250) {
      propor = Number((ancho / alto).toFixed(3));
      nanch = ancho > alto ? 250 : Number((250 * propor).toFixed(3));
      nalt = ancho > alto ? Number(Math.trunc(250 / propor).toFixed(3)) : 250;
    }
    const array = document.getElementsByTagName('img')
    const text = '<img src="' + img + '" width="' + nanch + '" height="' + nalt + '" id=' + "img" + array.length + '/>'
    if (img) {
      this.tinymce.editor.execCommand('mceInsertContent', false, text);
    }
  }

  async openImgDrive() {
    const imgTagCount = (this.basicContent.match(/<img/g) || []).length;
    if (imgTagCount >= 3) {
      this.toaster.error('No se puede agregar mas de 3 imagenes.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
      return
    }
    const modalRef = this.modalService.open(AddImgUrlComponent, { size: 'lg', backdrop: 'static', windowClass: 'pcoded', keyboard: false })
    const result = await modalRef.result
    if (result) {
      const element = document.getElementById("tinyficha");
      var ancholim = element.offsetWidth - 70;
      let ancho = 255;
      let alto = 255;
      let valido = true;
      await this.getImageDimensions(result)
        .then(dimensions => {
          ancho = dimensions.width
          alto = dimensions.height
        })
        .catch(error => {
          valido = false
          this.toaster.error('No se puedo cargar la imagen.', 'Advertencia', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
        });
      if (!valido) { return }
      //alto img 
      let propor = 1;
      let nanch = ancho;
      let nalt = alto;
      if (ancho > ancholim) {
        propor = Number((ancho / alto).toFixed(3));
        nanch = ancho > alto ? ancholim : Number((ancholim * propor).toFixed(3));
        nalt = ancho > alto ? Number(Math.trunc(ancholim / propor).toFixed(3)) : ancholim;
      }
      const text = '<img src="' + result + '" width="' + nanch + '" height="' + nalt + '"/>'
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

  indicadorImagen(indicador: boolean) {
    if (indicador && (this.numeroImagen < this.dataarchver.length - 1)) {
      this.numeroImagen++
    }
    if (!indicador && (this.numeroImagen > 0)) {
      this.numeroImagen--
    }
  }

  seleccionFila(i) {
    this.filSel = i;
    this.bloquear = ((this.tablaCargos[i].id_cargo && this.tablaCargos[i].habilitado) ? false : true)
    if (this.tablaCargos[i].id_cargo) {
      this.basicContent = this.tablaCargos[i].texto
    } else {
      this.basicContent = ''
    }

  }

  async guardarFichaTecnica() {
    try {
      this.mostrar_carga_todo = true
      const row = this.tablaCargos[this.filSel]
      const obj = {
        id_cargo: row.id_cargo,
        id_proyecto: row.id_proyecto,
        id_area: row.id_area,
        descripcion: row.descripcion,
        abreviatura: row.abreviatura,
        categoria_t1: row.categoria_t1 ? 1 : 0,
        categoria_t2: row.categoria_t2 ? 1 : 0,
        categoria_t3: row.categoria_t3 ? 1 : 0,
        categoria_t4: row.categoria_t4 ? 1 : 0,
        categoria_t5: row.categoria_t5 ? 1 : 0,
        habilitado: row.habilitado ? 1 : 0,
        texto: this.basicContent ? this.basicContent : ''
      }
      const resp = await this.recursosHumanosService.actualizarCargoArea(obj)
      if (resp[0]) {
        this.tablaCargos[this.filSel].texto = obj.texto
        this.toaster.success(
          'Se actualizo correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      } else {
        SwalService.error()
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }


  }

  async generarTablaUsuarios() {
    try {
      const obj = {
        id_proyecto: this.idProyecto
      }
      const resp = await this.recursosHumanosService.listarUsuariosRecursosHumanos(obj)
      this.tablaUsuarios = []
      let tablaNueva = []
      let areaActual = null
      let cargoActual = null

      this.tablaUsuarios = resp
    } catch (error) {
      console.log(error)
      SwalService.error()
      this.mostrar_carga_todo = false
    }

  }

  async verasignacionesUsuario(row, i) {

  }

  async editarUsuario(row, i) {
    this.modalUsuario.show()
    const fechaAsignacion = row.fecha_asignacion
      ? row.fecha_asignacion.split('T')[0]
      : null;

    const fechaCulminacion = row.fecha_culminacion
      ? row.fecha_culminacion.split('T')[0]
      : null;
    this.formUsuario.patchValue({
      nombres: row.nombres,
      apellidos: row.apellidos,
      dni: row.dni,
      telefono: row.telefono,
      correo: row.correo,
      fecha_asignacion: fechaAsignacion,
      fecha_culminacion: fechaCulminacion,
      estado: row.estado == 1 ? true : false,
    })
  }

  async eliminarUsuario(row, i) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el usuario seleccionado y sus asignaciones de cargos')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: row.id_proyecto,
          id_usuario: row.id_usuario
        }
        const resp = await this.recursosHumanosService.eliminarUsuarioRecursosHumanos(obj)
        await this.generarTablaUsuarios()
        this.filUsuario = null
        this.tablaAsignaciones = []
        this.filDetalle = null
        this.mostrar_carga_todo = false
        this.toaster.success(
          'Se elimino correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      }

    } catch (error) {
      console.log(error)
      SwalService.error()
      this.mostrar_carga_todo = false
    }


  }

  async listarAsignacionesUsuario(i) {
    try {
      if (this.filUsuario !== i) {
        this.tablaAsignaciones = []
        this.mostrar_carga = true
        this.filUsuario = i
        const obj = {
          id_proyecto: this.idProyecto,
          id_usuario: this.tablaUsuarios[i].id_usuario
        }
        const resp = await this.recursosHumanosService.listarAsignacionesUsuario(obj)
        if (resp?.length) {
          this.tablaAsignaciones = resp
        }
        this.mostrar_carga = false
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
      this.mostrar_carga = false
      this.mostrar_carga_todo = false
    }

  }

  async abrirModalAsignacion(row?) {
    this.mostrar_carga_todo = true
    await this.listarAreasYCargos()
    if (!row) {
      this.formAsignacion.reset()
      this.id_cargo_asignacion.disable()
      this.tipo_cargo.disable()
    } else {
      this.cargosFiltrados = this.cargos.filter(ele => Number(ele.id_area) == Number(row.id_area))
      const fechaAsignacion = row.fecha_inicio
        ? row.fecha_inicio.split('T')[0]
        : null;

      const fechaCulminacion = row.fecha_fin
        ? row.fecha_fin.split('T')[0]
        : null;

      const cargo = this.cargosFiltrados.find(ele => row.id_cargo == ele.id_cargo)
      let tiposBuscar = ['categoria_t1', 'categoria_t2', 'categoria_t3', 'categoria_t4', 'categoria_t5']
      let categoria = 'categoria_t1'
      for (const element of tiposBuscar) {
        if (cargo[element] == 1) {
          categoria = element
        }
      }
      this.tiposFiltrados = this.tipos_cargos.filter(ele => Number(ele.charAt(ele.length - 1)) <= Number(categoria.charAt(categoria.length - 1)))
      const tipocargo = row.tipo_cargo ? this.tipos_cargos[row.tipo_cargo - 1] : this.tipos_cargos[0]
      this.formAsignacion.reset()
      this.formAsignacion.patchValue({
        id_asignacion: row.id_asignacion,
        id_area: row.id_area,
        id_cargo: row.id_cargo,
        tipo_cargo: tipocargo,
        fecha_inicio: fechaAsignacion,
        fecha_fin: fechaCulminacion,
        estado: row.estado,
      })
    }

    this.modalAsignacion.show()
    this.mostrar_carga_todo = false
  }

  getRomanNumeral(num: any): string {
    const romanNumerals: { [key: number]: string } = {
      1: 'I',
      2: 'II',
      3: 'III',
      4: 'IV',
      5: 'V'
    };

    // Convertir a número y validar
    const numero = Number(num);
    if (isNaN(numero) || numero < 1 || numero > 5 || !Number.isInteger(numero)) {
      return '';
    }

    return romanNumerals[numero] || '';
  }

  cerrarModalAsignacion() {
    this.modalAsignacion.hide()
  }

  setFechasLimiteUsuario(rowUsuario: any) {
    this.fechasLimiteUsuario = {
      fecha_asignacion: rowUsuario.fecha_asignacion,
      fecha_culminacion: rowUsuario.fecha_culminacion
    };
  }

  // Método para establecer las asignaciones existentes
  setAsignacionesExistentes(asignaciones: any[]) {
    this.asignacionesExistentes = asignaciones;
  }

  // Validador para fecha de inicio
  validarFechaInicio(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.fechasLimiteUsuario) {
      return null;
    }

    const fechaInicio = new Date(control.value);
    const fechaLimiteInicio = new Date(this.fechasLimiteUsuario.fecha_asignacion);
    const fechaLimiteFin = new Date(this.fechasLimiteUsuario.fecha_culminacion);

    // Validar que esté dentro del rango permitido
    if (fechaInicio < fechaLimiteInicio) {
      return { fechaInicioMenor: 'La fecha de inicio no puede ser anterior a la fecha límite de asignación' };
    }

    if (fechaInicio > fechaLimiteFin) {
      return { fechaInicioMayor: 'La fecha de inicio no puede ser posterior a la fecha límite de culminación' };
    }

    return null;
  }

  // Validador para fecha de fin
  validarFechaFin(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.fechasLimiteUsuario || !this.fecha_inicio_asignacion.value) {
      return null;
    }

    const fechaFin = new Date(control.value);
    const fechaInicio = new Date(this.fecha_inicio_asignacion.value);
    const fechaLimiteFin = new Date(this.fechasLimiteUsuario.fecha_culminacion);

    // Validar que no sea menor que la fecha de inicio
    if (fechaFin < fechaInicio) {
      return { fechaFinMenor: 'La fecha de fin no puede ser anterior a la fecha de inicio' };
    }

    // Validar que esté dentro del rango permitido
    if (fechaFin > fechaLimiteFin) {
      return { fechaFinMayor: 'La fecha de fin no puede ser posterior a la fecha límite de culminación' };
    }

    return null;
  }

  // // Validador para evitar solapamientos (validador de formulario)
  // validarSolapamiento(formGroup: FormGroup): ValidationErrors | null {
  //   const fechaInicio = formGroup.get('fecha_inicio')?.value;
  //   const fechaFin = formGroup.get('fecha_fin')?.value;
  //   const idAsignacion = formGroup.get('id_asignacion')?.value;

  //   if (!fechaInicio || !fechaFin) {
  //     return null;
  //   }

  //   const inicio = new Date(fechaInicio);
  //   const fin = new Date(fechaFin);

  //   // Buscar solapamientos con asignaciones existentes
  //   const solapamiento = this.asignacionesExistentes.find(asignacion => {
  //     // Excluir la asignación actual si estamos editando
  //     if (idAsignacion && asignacion.id_asignacion === idAsignacion) {
  //       return false;
  //     }

  //     const inicioExistente = new Date(asignacion.fecha_inicio);
  //     const finExistente = new Date(asignacion.fecha_fin);

  //     // Verificar si hay solapamiento
  //     return (
  //       (inicio >= inicioExistente && inicio <= finExistente) || // Nueva inicio dentro de existente
  //       (fin >= inicioExistente && fin <= finExistente) ||       // Nueva fin dentro de existente
  //       (inicio <= inicioExistente && fin >= finExistente)       // Nueva cubre completamente existente
  //     );
  //   });

  //   if (solapamiento) {
  //     return {
  //       solapamiento: `Existe solapamiento con la asignación del ${this.formatDate(solapamiento.fecha_inicio)} al ${this.formatDate(solapamiento.fecha_fin)}`
  //     };
  //   }

  //   return null;
  // }

  // Método auxiliar para formatear fechas
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  async agregarAsignacion() {
    try {
      // Validar formulario
      this.fecha_inicio_asignacion.setErrors(null);
      this.fecha_fin_asignacion.setErrors(null);
      if (this.formAsignacion.invalid) {
        this.formAsignacion.markAllAsTouched();

        // Mostrar mensajes de error específicos
        const errors = this.formAsignacion.errors;
        if (errors) {
          if (errors['solapamiento']) {
            this.toaster.error(errors['solapamiento'], 'Error de solapamiento', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            });
          }
        }

        this.toaster.error(
          'Formulario incompleto o con errores',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return;
      }


      // Validar fechas contra límites del usuario
      const row = this.tablaUsuarios[this.filUsuario];
      const fechaInicio = moment(this.fecha_inicio_asignacion.value).format('YYYY-MM-DD');
      const fechaFin = moment(this.fecha_fin_asignacion.value).format('YYYY-MM-DD');
      const fechaLimiteInicio = moment(row.fecha_asignacion).format('YYYY-MM-DD');
      const fechaLimiteFin = moment(row.fecha_culminacion).format('YYYY-MM-DD');

      if (fechaInicio > fechaFin) {
        this.fecha_inicio_asignacion.setErrors({ incorrect: true })
        this.fecha_fin_asignacion.setErrors({ incorrect: true })
        this.toaster.error(
          `Las fecha inicio no puede ser mayor a la fecha fin`,
          'Error en fechas',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }
      if (fechaInicio < fechaLimiteInicio || fechaFin > fechaLimiteFin || fechaInicio > fechaLimiteFin || fechaFin < fechaLimiteInicio) {
        if (fechaInicio < fechaLimiteInicio || fechaInicio > fechaLimiteFin)
          this.fecha_inicio_asignacion.setErrors({ incorrect: true })


        if (fechaFin > fechaLimiteFin || fechaFin < fechaLimiteInicio)
          this.fecha_fin_asignacion.setErrors({ incorrect: true })


        this.toaster.error(
          `Las fechas deben estar entre ${this.formatDate(row.fecha_asignacion)} y ${this.formatDate(row.fecha_culminacion)}`,
          'Error en fechas',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }

      // Validar solapamientos

      const tieneSolapamiento = await this.verificarSolapamiento(
        fechaInicio,
        fechaFin,
        null, // id_asignacion null para nueva asignación
        this.tablaAsignaciones
      );

      if (tieneSolapamiento) {
        this.fecha_inicio_asignacion.setErrors({ incorrect: true })
        this.fecha_fin_asignacion.setErrors({ incorrect: true })
        this.toaster.error(
          'Existe solapamiento con otra asignación. Por favor, revise las fechas.',
          'Error de solapamiento',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }

      this.mostrar_carga_todo = true
      const obj = {
        id_proyecto: this.idProyecto,
        id_usuario: row.id_usuario,
        id_area: this.id_area_asignacion.value,
        id_cargo: this.id_cargo_asignacion.value,
        tipo_cargo: Number(this.tipo_cargo.value.charAt(this.tipo_cargo.value.length - 1)),
        fecha_inicio: this.fecha_inicio_asignacion.value,
        fecha_fin: this.fecha_fin_asignacion.value,
        estado: 1,
      }
      const response = await this.recursosHumanosService.guardarAsignacionUsuario(obj)
      if (response) {
        this.cerrarModalAsignacion()
        this.toaster.success(
          'Se guardo correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        if (this.filUsuario !== null) {
          const a = JSON.parse(JSON.stringify(this.filUsuario))
          this.filUsuario = null
          await this.listarAsignacionesUsuario(a)
        }

      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  verificarSolapamiento(fechaInicio, fechaFin, idAsignacionActual: number | null, asignaciones: any[]): boolean {

    return asignaciones.some(asignacion => {
      if (idAsignacionActual && asignacion.id_asignacion === idAsignacionActual) {
        return false;
      }
      // Normalizar fechas de la asignación existente
      const inicioExistente = moment(asignacion.fecha_inicio).format('YYYY-MM-DD');
      const finExistente = moment(asignacion.fecha_fin).format('YYYY-MM-DD');



      // Verificar solapamiento (EXCLUYENDO límites exactos)
      // Un día termina y el siguiente empieza - eso NO es solapamiento
      const haySolapamiento = !(fechaFin < inicioExistente || fechaInicio > finExistente);

      // Caso especial: si una termina justo cuando otra empieza, NO es solapamiento
      if (fechaFin === inicioExistente) {
        return true; // Una termina, otra empieza - no hay solapamiento
      }

      if (fechaInicio === finExistente) {
        return true; // Una empieza cuando otra termina - no hay solapamiento
      }

      return haySolapamiento;
    });
  }

  async actualizarAsignacion() {
    try {
      if (this.formAsignacion.invalid) {
        this.formAsignacion.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }


      const row = this.tablaUsuarios[this.filUsuario];
      const fechaInicio = moment(this.fecha_inicio_asignacion.value).format('YYYY-MM-DD');
      const fechaFin = moment(this.fecha_fin_asignacion.value).format('YYYY-MM-DD');
      const fechaLimiteInicio = moment(row.fecha_asignacion).format('YYYY-MM-DD');
      const fechaLimiteFin = moment(row.fecha_culminacion).format('YYYY-MM-DD');

      if (fechaInicio > fechaFin) {
        this.fecha_inicio_asignacion.setErrors({ incorrect: true })
        this.fecha_fin_asignacion.setErrors({ incorrect: true })
        this.toaster.error(
          `Las fecha inicio no puede ser mayor a la fecha fin`,
          'Error en fechas',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }
      if (fechaInicio < fechaLimiteInicio || fechaFin > fechaLimiteFin || fechaInicio > fechaLimiteFin || fechaFin < fechaLimiteInicio) {
        if (fechaInicio < fechaLimiteInicio || fechaInicio > fechaLimiteFin)
          this.fecha_inicio_asignacion.setErrors({ incorrect: true })


        if (fechaFin > fechaLimiteFin || fechaFin < fechaLimiteInicio)
          this.fecha_fin_asignacion.setErrors({ incorrect: true })


        this.toaster.error(
          `Las fechas deben estar entre ${this.formatDate(row.fecha_asignacion)} y ${this.formatDate(row.fecha_culminacion)}`,
          'Error en fechas',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }

      // Validar solapamientos

      const tieneSolapamiento = await this.verificarSolapamiento(
        fechaInicio,
        fechaFin,
        this.id_asignacion.value, // id_asignacion null para nueva asignación
        this.tablaAsignaciones
      );

      if (tieneSolapamiento) {
        this.fecha_inicio_asignacion.setErrors({ incorrect: true })
        this.fecha_fin_asignacion.setErrors({ incorrect: true })
        this.toaster.error(
          'Existe solapamiento con otra asignación. Por favor, revise las fechas.',
          'Error de solapamiento',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }
      this.mostrar_carga_todo = true
      const rowAsignacion = this.tablaAsignaciones[this.filAsignacion]
      const obj = {
        id_asignacion: this.id_asignacion.value,
        id_proyecto: rowAsignacion.id_proyecto,
        id_usuario: rowAsignacion.id_usuario,
        id_area: this.id_area_asignacion.value,
        id_cargo: this.id_cargo_asignacion.value,
        tipo_cargo: Number(this.tipo_cargo.value.charAt(this.tipo_cargo.value.length - 1)),
        fecha_inicio: this.fecha_inicio_asignacion.value,
        fecha_fin: this.fecha_fin_asignacion.value,
        estado: rowAsignacion.estado,
      }
      const response = await this.recursosHumanosService.actualizarAsignacionUsuario(obj)
      if (response) {
        this.cerrarModalAsignacion()
        this.toaster.success(
          'Se guardo correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        if (this.filUsuario !== null) {
          const a = JSON.parse(JSON.stringify(this.filUsuario))
          this.filUsuario = null
          await this.listarAsignacionesUsuario(a)
        }
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async eliminarAsignacion(row, i) {
    try {

      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminará el asignacion seleccionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: row.id_proyecto,
          id_asignacion: row.id_asignacion
        }
        const response = await this.recursosHumanosService.eliminarAsignacionesUsuario(obj)
        if (this.filUsuario !== null) {
          const a = JSON.parse(JSON.stringify(this.filUsuario))
          this.filUsuario = null
          await this.listarAsignacionesUsuario(a)
        }
        this.mostrar_carga_todo = false
        this.toaster.success(
          'Se elimino correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      }
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }

  }

  cerrarModal2() {
    this.modalUsuario.hide()
  }

  async agregarUsuario() {
    try {
      if (this.formUsuario.invalid) {
        this.formUsuario.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto o datos no validos',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      this.mostrar_carga_todo = true
      const obj2 = {
        id_proyecto: this.idProyecto,
        dni: this.dni.value
      }
      const resp = await this.recursosHumanosService.verificarDniUsuario(obj2)
      if (resp?.length) {
        this.dni.setErrors({ incorrect: true })
        this.toaster.error(
          'USUARIO YA REGISTRADO CON ESTADO ACTIVO, CAMBIAR REGISTRO DE USUARIO ( ' + resp[0].nombres + ' ' + resp[0].apellidos + ' ) A INACTIVO PARA PODER AGREGAR NUEVO REGISTRO DE USUARIO',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 6000,
          }
        );
      } else {

        const row = this.tablaUsuarios[this.filUsuario]
        const obj = {
          id_proyecto: this.idProyecto,
          nombres: this.nombres.value,
          apellidos: this.apellidos.value,
          dni: this.dni.value,
          telefono: this.telefono.value,
          correo: this.correo.value,
          fecha_asignacion: this.fecha_asignacion.value,
          fecha_culminacion: this.fecha_culminacion.value,
          estado: 1,
        }
        const response = await this.recursosHumanosService.guardarUsuarioRecursosHumanos(obj)
        if (response) {
          this.cerrarModal2()
          this.toaster.success(
            'Se guardo correctamente',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
          await this.generarTablaUsuarios()
        }
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }

  }

  async actualizarUsuario() {
    try {
      if (this.formUsuario.invalid) {
        this.formUsuario.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto o datos no validos',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      this.mostrar_carga_todo = true
      const obj2 = {
        id_proyecto: this.idProyecto,
        dni: this.dni.value
      }
      const resp = await this.recursosHumanosService.verificarDniUsuario(obj2)
      // console.log('actualizar', resp)
      // console.log('resp[0]?.dni', resp[0]?.dni, this.dni.value)
      const usuarioSelec = this.tablaUsuarios[this.filUsuario]
      if (resp.length && resp[0]?.id_usuario !== usuarioSelec.id_usuario) {
        this.dni.setErrors({ incorrect: true })
        this.mostrar_carga_todo = false
        this.toaster.error(
          'USUARIO YA REGISTRADO CON ESTADO ACTIVO, CAMBIAR REGISTRO DE USUARIO ( ' + resp[0].nombres + ' ' + resp[0].apellidos + ' ) A INACTIVO PARA PODER AGREGAR NUEVO REGISTRO DE USUARIO',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 6000,
          }
        );

      } else {


        const fi = moment(this.fecha_asignacion.value).format('YYYY-MM-DD')
        const ff = moment(this.fecha_culminacion.value).format('YYYY-MM-DD')

        let valido = true
        for (const element of this.tablaAsignaciones) {
          const feini = moment(element.fecha_inicio).format('YYYY-MM-DD')
          const fefin = moment(element.fecha_fin).format('YYYY-MM-DD')

          if (fi > feini || fi > fefin) {
            valido = false
            break
          }
          if (ff < fefin || ff < feini) {
            valido = false
            break
          }
        }
        if (!valido) {
          this.mostrar_carga_todo = false
          this.toaster.error(
            'Existen Asignaciones fuera del margen de fechas, elimine o edite las asignaciones fuera del margen de la fecha a actualizar',
            'Error',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 6000,
            }
          );
          return
        }
        // this.mostrar_carga_todo = true
        const row = this.tablaUsuarios[this.filUsuario]
        const obj = {
          id_usuario: row.id_usuario,
          id_proyecto: row.id_proyecto,
          nombres: this.nombres.value,
          apellidos: this.apellidos.value,
          dni: this.dni.value,
          telefono: this.telefono.value,
          correo: this.correo.value,
          fecha_asignacion: this.fecha_asignacion.value.split('T')[0],
          fecha_culminacion: this.fecha_culminacion.value.split('T')[0],
          estado: this.estado.value ? 1 : 0,
        }
        const response = await this.recursosHumanosService.actualizarUsuarioRecursosHumanos(obj)
        if (response[0]) {
          this.cerrarModal2()
          this.tablaUsuarios[this.filUsuario].nombres = obj.nombres
          this.tablaUsuarios[this.filUsuario].apellidos = obj.apellidos
          this.tablaUsuarios[this.filUsuario].dni = obj.dni
          this.tablaUsuarios[this.filUsuario].telefono = obj.telefono
          this.tablaUsuarios[this.filUsuario].correo = obj.correo
          this.tablaUsuarios[this.filUsuario].fecha_asignacion = obj.fecha_asignacion
          this.tablaUsuarios[this.filUsuario].fecha_culminacion = obj.fecha_culminacion
          this.tablaUsuarios[this.filUsuario].estado = obj.estado == 1 ? true : false
          this.mostrar_carga_todo = false
          this.toaster.success(
            'Se actualizó correctamente',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );

        } else {
          SwalService.error()
          this.mostrar_carga_todo = false
        }
      }
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }

  }

  async cerraModalQr() {
    this.modalQRAsignacion.hide()
    this.qrData = ''
  }

  async generarQRAsignacion(row, i) {
    this.qrData = ''
    const user = this.tablaUsuarios[this.filUsuario]
    this.qrData = user.id_usuario + '|' + user.id_proyecto + '|' + user.nombres + '|' + user.apellidos + '|' + user.dni + '|' + row.id_asignacion + '|' + row.descripcion_area + '|' + row.id_area + '|' + row.descripcion_cargo + '|' + row.id_cargo + '|' + moment(row.fecha_inicio).format('YYYY-MM-DD') + '|' + moment(row.fecha_fin).format('YYYY-MM-DD')
    this.modalQRAsignacion.show()
  }

  descargarQR() {
    if (!this.qrData) return;

    try {
      // Buscar la imagen del QR generada por angularx-qrcode
      const qrImg = document.querySelector('.qr-container img') as HTMLImageElement;

      if (qrImg && qrImg.src) {
        // Crear un canvas para procesar la imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Configurar canvas
        canvas.width = 300;
        canvas.height = 350;

        // Fondo blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Agregar información textual
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        // Título
        ctx.font = 'bold 16px Arial';
        ctx.fillText('CÓDIGO QR ASISTENCIA', canvas.width / 2, 30);

        // Información del usuario
        ctx.font = '12px Arial';
        ctx.fillText(`Usuario: ${this.tablaUsuarios[this.filUsuario]?.nombres + ' ' + this.tablaUsuarios[this.filUsuario]?.apellidos || ''}`, canvas.width / 2, 55);
        ctx.fillText(`Cargo: ${this.tablaAsignaciones[this.filAsignacion]?.descripcion_cargo || ''}`, canvas.width / 2, 75);
        ctx.fillText(`Asignación: #${this.tablaAsignaciones[this.filAsignacion]?.descripcion_area || ''}`, canvas.width / 2, 95);

        // Dibujar el QR (centrado)
        const qrSize = 150;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 120;

        // Crear imagen para dibujar
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

          // Pie de página
          ctx.fillText(`Generado: ${new Date().toLocaleDateString()}`, canvas.width / 2, 310);
          ctx.fillText('Usar para registro de asistencia móvil', canvas.width / 2, 330);

          // Convertir a blob y descargar
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, `QR_Asistencia_${this.tablaUsuarios[this.filUsuario]?.nombre || 'Usuario'}.png`);
            }
          }, 'image/png');
        };

        img.src = qrImg.src;
      }
    } catch (error) {
      console.error('Error al descargar QR:', error);
      alert('No se pudo descargar el QR');
    }
  }

  async agregarArea() {
    try {
      if (this.formArea.invalid) {
        this.mostrar_carga_todo = false
        this.formArea.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }

      const existe = this.tablaCargos.find(ele => (ele.descripcion).toUpperCase() == (this.descripcionArea.value).toUpperCase() && (ele.area_abreviatura).toUpperCase() == (this.abreviaturaArea.value).toUpperCase() && !ele.id_cargo)
      if (existe) {
        this.toaster.error(
          'Descripcion y abreviatura ya asignados a otra area',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      // const existe = this.tablaCargos.find(ele=> ele.)
      this.mostrar_carga_todo = true
      const obj = {
        id_proyecto: this.idProyecto,
        descripcion: (this.descripcionArea.value).toUpperCase(),
        abreviatura: (this.abreviaturaArea.value).toUpperCase(),
        id_responsable: this.responsableArea.value ? this.responsableArea.value : ''
      }
      const resp = await this.recursosHumanosService.guardarAreaRecursosHumanos(obj)
      await this.listarCargosPorArea()
      this.cerrarModalArea()
      this.toaster.success(
        'Se guardo correctamente',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async actualizarArea() {
    try {
      if (this.formArea.invalid) {
        this.mostrar_carga_todo = false
        this.formArea.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }

      const existe = this.tablaCargos.find(ele => (ele.descripcion).toUpperCase() == (this.descripcionArea.value).toUpperCase() && (ele.area_abreviatura).toUpperCase() == (this.abreviaturaArea.value).toUpperCase() && !ele.id_cargo && ele.id_area !== this.id_area.value)
      if (existe) {
        this.toaster.error(
          'Descripcion y abreviatura ya asignados a otra area',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      // const existe = this.tablaCargos.find(ele=> ele.)
      this.mostrar_carga_todo = true
      const obj = {
        id_area: this.id_area.value,
        id_proyecto: this.idProyecto,
        descripcion: (this.descripcionArea.value).toUpperCase(),
        abreviatura: (this.abreviaturaArea.value).toUpperCase(),
        id_responsable: this.responsableArea.value ? this.responsableArea.value : ''
      }
      const resp = await this.recursosHumanosService.actualizarAreaRecursosHumanos(obj)
      await this.listarCargosPorArea()
      this.cerrarModalArea()
      this.toaster.success(
        'Se actualizo correctamente',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  cerrarModalArea() {
    this.modalArea.hide()
  }

  abrirModalArea(row?, index?) {
    if (!row) {
      this.formArea.reset()
    } else {
      this.formArea.reset()
      this.formArea.patchValue({
        descripcion: row.descripcion,
        abreviatura: row.abreviatura,
        responsable: row.responsable,
        id_area: row.id_area
      })
    }
    this.modalArea.show()
  }

  async eliminarArea(row, i) {
    try {

      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el area seleccionado y sus configuraciones plantilla')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: row.id_proyecto,
          id_area: row.id_area
        }
        const response = await this.recursosHumanosService.eliminarAreaRecursosHumanos(obj)
        if (response[0]?.id == 1) {
          await this.listarCargosPorArea()
          this.mostrar_carga_todo = false
          this.toaster.success(
            response[0].mensaje,
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        } else {
          this.mostrar_carga_todo = false
          this.toaster.error(
            response[0].mensaje,
            'Error',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            }
          );
          return
        }

      }
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }

  }

  async actualizarCargo() {
    try {
      this.mostrar_carga_todo = true
      const row = this.tablaCargos[this.filSel]
      const obj = {
        id_cargo: this.id_cargo.value,
        id_proyecto: row.id_proyecto,
        id_area: row.id_area,
        descripcion: this.descripcion.value,
        abreviatura: this.abreviatura.value,
        categoria_t1: 0,
        categoria_t2: 0,
        categoria_t3: 0,
        categoria_t4: 0,
        categoria_t5: 0,
        habilitado: row.habilitado ? 1 : 0,
        texto: row.texto ? row.texto : ''
      }
      const categorias = [{ value: 'Categoria t1', key: 'categoria_t1' }, { value: 'Categoria t2', key: 'categoria_t2' }, { value: 'Categoria t3', key: 'categoria_t3' }, { value: 'Categoria t4', key: 'categoria_t4' }, { value: 'Categoria t5', key: 'categoria_t5' }]
      for (const element of categorias) {
        if (element.value == this.categorias.value) {
          obj[element.key] = 1
        } else {
          obj[element.key] = 0
        }
      }
      const resp = await this.recursosHumanosService.actualizarCargoArea(obj)
      if (resp[0]) {
        await this.listarCargosPorArea()
        this.cerrarModal()
        this.mostrar_carga_todo = false
        this.toaster.success(
          'Se actualizo correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      } else {
        this.mostrar_carga_todo = false
        SwalService.error()
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }

  }

  async openModalConvocatoria(row?) {
    this.mostrar_carga_todo = true
    this.formConvocatoria.reset()
    if (row) {
      const fecha = row.fecha
        ? row.fecha.split('T')[0]
        : null;
      const fechaC = row.fecha_culmina
        ? row.fecha_culmina.split('T')[0]
        : null;
      this.formConvocatoria.patchValue({
        id_convocatoria: row.id_convocatoria,
        nombre_proyecto: row.nombre_proyecto ? row.nombre_proyecto : this.nombreProyecto,
        nro_convocatoria: row.nro_convocatoria,
        link_bases: row.link_bases,
        fecha: fecha,
        fecha_culmina: fechaC,
        modalidad: row.modalidad,
        duracion: row.duracion,
        descripcion: row.descripcion,
        estado: row.estado.toString()
      })
      if (this.estadoConvocatoria.value == '2') {
        this.duracionConvocatoria.enable()
      } else {
        this.duracionConvocatoria.disable()
      }
    } else {
      this.nombre_proyecto.setValue(this.nombreProyecto)
    }
    this.modalConvocatoria.show()
    this.mostrar_carga_todo = false
  }

  cerrarModalConvocatoria() {
    this.modalConvocatoria.hide()
  }

  cambioEstadoConvocatoria(valorSeleccionado: string) {
    // console.log('cambioEstadoConvocatoria', valorSeleccionado);

    if (valorSeleccionado === '2') { // PUBLICADO
      // Habilitar duración
      this.duracionConvocatoria?.enable();

      // Establecer fecha actual
      const fechaActual = new Date();
      const fechaFormateada = fechaActual.toISOString().split('T')[0];
      this.fechaConvocatoria.setValue(fechaFormateada);
      this.duracionConvocatoria.enable();

      // Si ya hay duración, calcular fecha culmina
      this.calcularFechaCulmina();

    } else { // NO PUBLICADO o CERRADO
      // Deshabilitar duración
      this.duracionConvocatoria?.disable();
      // Limpiar y deshabilitar fechas
    }
  }

  calcularFechaCulmina() {
    const fecha = this.fechaConvocatoria?.value;
    const duracion = this.duracionConvocatoria?.value;

    if (fecha && duracion && !isNaN(duracion) && duracion > 0) {
      const fechaInicio = new Date(fecha);
      const fechaCulmina = new Date(fechaInicio);
      fechaCulmina.setDate(fechaInicio.getDate() + parseInt(duracion));

      const fechaFormateada = fechaCulmina.toISOString().split('T')[0];
      this.fecha_culmina_convocatoria?.setValue(fechaFormateada);
      // this.fecha_culmina_convocatoria?.enable();
    } else {
      // Si no hay duración válida, usar la misma fecha
      this.fecha_culmina_convocatoria?.setValue(fecha || '');
      // this.fecha_culmina_convocatoria?.enable();
    }
  }

  async agregarConvocatoria() {
    try {
      if (this.formConvocatoria.invalid) {
        this.mostrar_carga_todo = false
        this.formConvocatoria.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }

      const row = this.tablaConvocatorias[this.filConv]
      // const existe = this.tablaCargos.find(ele=> ele.)
      this.mostrar_carga_todo = true
      const obj = {
        id_proyecto: this.idProyecto, // ya es número
        nombre_proyecto: this.nombre_proyecto.value,
        nro_convocatoria: this.nro_convocatoria.value,
        link_bases: this.link_bases.value,
        fecha: this.fechaConvocatoria.value,
        duracion: parseInt(this.duracionConvocatoria.value) || 0, // convertir a número
        modalidad: this.modalidad.value,
        descripcion: this.descripcionConvocatoria.value,
        estado: parseInt(this.estadoConvocatoria.value) || 0 // convertir a número
      }
      const resp = await this.recursosHumanosService.guardarConvocatoriaRecursosHumanos(obj)
      await this.listarConvocatorias()

      this.detalleConvocatoria = []
      this.tablaPostulantes = []
      this.filConv = null
      this.filDetalle = null
      this.filPostulante = null
      this.cerrarModalConvocatoria()
      this.toaster.success(
        'Se guardo correctamente',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async listarConvocatorias() {
    try {

      this.tablaConvocatorias = []
      this.mostrar_carga_todo = true
      const obj = {
        id_proyecto: this.idProyecto
      }
      const resp = await this.recursosHumanosService.listarConvocatoriasRecursosHumanos(obj)
      for (const element of resp) {
        if (!element.duracion) {
          element.fecha_culmina = element.fecha
        } else {
          const fecha = new Date(element.fecha);
          fecha.setDate(fecha.getDate() + element.duracion);
          element.fecha_culmina = fecha.toISOString()
        }
      }
      // this.tablaConvocatorias = []
      // this.detalleConvocatoria = []
      // this.tablaPostulantes
      this.tablaConvocatorias = resp
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  cambioSelectAreaDetalle(select) {
    this.cargosFiltrados = this.cargos.filter(ele => Number(ele.id_area) == Number(this.id_area_detalle_conv.value))

  }

  cambioSelectAreaAsignacion(select) {
    this.cargosFiltrados = this.cargos.filter(ele => Number(ele.id_area) == Number(this.id_area_asignacion.value))
    this.id_cargo_asignacion.reset()
    // this.id_cargo_asignacion.setValue(null)
    this.tipo_cargo.reset()
    // this.tipo_cargo.setValue(null)
    if (!this.id_area_asignacion.value) {
        this.tipo_cargo.disable()
      this.id_cargo_asignacion.disable()
    } else {
      this.id_cargo_asignacion.enable()
    }
  }

  cambioSelectAreaPostUser(select) {
    this.cargosFiltrados = this.cargos.filter(ele => Number(ele.id_area) == Number(this.area_up.value))
    this.cargo_up.reset()
    this.categoria_up.reset()
    if (!this.id_area_asignacion.value) {
      this.categoria_up.disable()
      this.cargo_up.disable()
    } else {
      this.cargo_up.enable()
    }
  }

  cambioCargoAsignacion(value) {
    this.tipo_cargo.reset()
    if (this.id_cargo_asignacion.value) {
      this.tipo_cargo.enable()

      const cargo = this.cargosFiltrados.find(ele => this.id_cargo_asignacion.value == ele.id_cargo)
      let tiposBuscar = ['categoria_t1', 'categoria_t2', 'categoria_t3', 'categoria_t4', 'categoria_t5']
      let categoria = 'categoria_t1'
      for (const element of tiposBuscar) {
        if (cargo[element] == 1) {
          categoria = element
        }
      }
      this.tiposFiltrados = this.tipos_cargos.filter(ele => Number(ele.charAt(ele.length - 1)) <= Number(categoria.charAt(categoria.length - 1)))

    } else {
      this.tipo_cargo.disable()
    }
  }

  cambioCargoPostUser(value) {
    this.categoria_up.reset()
    if (this.cargo_up.value) {
      this.categoria_up.enable()
      const cargo = this.cargosFiltrados.find(ele => this.cargo_up.value == ele.id_cargo)
      let tiposBuscar = ['categoria_t1', 'categoria_t2', 'categoria_t3', 'categoria_t4', 'categoria_t5']
      let categoria = 'categoria_t1'
      for (const element of tiposBuscar) {
        if (cargo[element] == 1) {
          categoria = element
        }
      }
      this.tiposFiltrados = this.tipos_cargos.filter(ele => Number(ele.charAt(ele.length - 1)) <= Number(categoria.charAt(categoria.length - 1)))
    } else {
      this.categoria_up.disable()
    }
  }

  getCategorias(row: any): string[] {
    const categorias: string[] = [];

    // Lógica jerárquica: si existe una categoría superior
    if (row.categoria_t5 == 1) {
      categorias.push('I', 'II', 'III', 'IV', 'V');
    } else if (row.categoria_t4 == 1) {
      categorias.push('I', 'II', 'III', 'IV');
    } else if (row.categoria_t3 == 1) {
      categorias.push('I', 'II', 'III');
    } else if (row.categoria_t2 == 1) {
      categorias.push('I', 'II');
    } else if (row.categoria_t1 == 1) {
      categorias.push('I');
    }

    return categorias;
  }

  async listarAreasYCargos() {
    try {
      this.areas = []
      this.cargos = []
      this.cargosFiltrados = []
      const obj = {
        id_proyecto: this.idProyecto
      }
      const resp = await this.recursosHumanosService.listarCargosPorArea(obj)
      this.areas = resp[0]
      this.cargos = resp[1]

    } catch (e) {
      console.log(e)
      SwalService.error()
    }
  }

  async actualizarConvocatoria() {
    try {
      if (this.formConvocatoria.invalid) {
        this.mostrar_carga_todo = false
        this.formConvocatoria.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }

      const row = this.tablaConvocatorias[this.filConv]
      // const existe = this.tablaCargos.find(ele=> ele.)
      this.mostrar_carga_todo = true
      const obj = {
        id_convocatoria: this.id_convocatoria.value,
        id_proyecto: row.id_proyecto,
        nombre_proyecto: this.nombre_proyecto.value,
        nro_convocatoria: this.nro_convocatoria.value,
        link_bases: this.link_bases.value,
        fecha: this.fechaConvocatoria.value,
        duracion: this.duracionConvocatoria.value,
        modalidad: this.modalidad.value,
        descripcion: this.descripcionConvocatoria.value,
        estado: this.estadoConvocatoria.value
      }
      const resp = await this.recursosHumanosService.actualizarConvocatoriaRecursosHumanos(obj)
      await this.listarConvocatorias()
      this.cerrarModalConvocatoria()
      this.toaster.success(
        'Se actualizo correctamente',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async eliminarConvocatoria(row, i) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la convocatoria seleccionada ,detalle y postulantes relacionados a ala convocatoria')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: row.id_proyecto,
          id_convocatoria: row.id_convocatoria
        }
        const resp = await this.recursosHumanosService.eliminarConvocatoriaRecursosHumanos(obj)
        if (resp[0]?.resultado == 'OK') {
          await this.listarConvocatorias()
          this.detalleConvocatoria = []
          this.tablaPostulantes = []
          this.filConv = null
          this.filDetalle = null
          this.filPostulante = null
          this.mostrar_carga_todo = false
          this.toaster.success(
            resp[0]?.mensaje,
            resp[0]?.resultado,
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        } else {
          this.mostrar_carga_todo = false
          SwalService.error()
        }
      }
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async selFilConvocatoria(i) {
    try {

      this.tablaPostulantes = []
      this.buscando = true
      this.filConv = i
      const row = this.tablaConvocatorias[i]
      this.listarDetalleConvocatoria(row.id_convocatoria, row.id_proyecto)
      const obj = {
        id_proyecto: row.id_proyecto,
        id_convocatoria: row.id_convocatoria
      }

      this.tablaPostulantes = await this.recursosHumanosService.listarPostulantesConvocatoria(obj)
      this.buscando = false
    } catch (error) {
      console.log(error)
      SwalService.error()
    }

  }

  async openModalDetalleConvocatoria(row?) {
    this.mostrar_carga_todo = true
    this.formDetalleConvocatoria.reset()
    await this.listarAreasYCargos()

    if (row) {
      this.cargosFiltrados = this.cargos.filter(ele => Number(ele.id_area) == Number(row.id_area))
      this.formDetalleConvocatoria.patchValue({
        id_detalle: row.id_detalle,
        id_area: row.id_area,
        id_cargo: row.id_cargo,
        vacantes: row.vacantes,
        requerimiento: row.requerimiento,
        remuneracion: row.remuneracion,
        link_documento: row.link_documento,
        estado: row.estado,
        ciudad: row.ciudad
      })
    }
    this.modalDetalleConvocatoria.show()
    this.mostrar_carga_todo = false
  }

  async cerrarModalDetalleConvocatoria() {
    this.modalDetalleConvocatoria.hide()
  }

  async listarDetalleConvocatoria(id_convotoria, id_proyecto) {
    this.detalleConvocatoria = []
    const obj = {
      id_proyecto: id_proyecto,
      id_convocatoria: id_convotoria
    }
    const resp = await this.recursosHumanosService.listarDetalleConvocatoria(obj)
    if (resp?.length) {
      this.detalleConvocatoria = resp
    }
  }

  async actualizarDetalleConvocatoria() {
    try {
      if (this.formDetalleConvocatoria.invalid) {
        this.mostrar_carga_todo = false
        this.formDetalleConvocatoria.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }

      const convocatoria = this.tablaConvocatorias[this.filConv]
      const detalle = this.detalleConvocatoria[this.filDetalle]
      // const existe = this.tablaCargos.find(ele=> ele.)
      this.mostrar_carga_todo = true
      const obj = {
        id_detalle: detalle.id_detalle,
        id_proyecto: detalle.id_proyecto,
        id_convocatoria: detalle.id_convocatoria,
        id_area: this.id_area_detalle_conv.value,
        id_cargo: this.id_cargo_detalle_conv.value,
        vacantes: this.vacantes.value,
        requerimiento: this.requerimiento.value,
        remuneracion: this.remuneracion.value,
        link_documento: this.link_documento.value ? this.link_documento.value : '',
        estado: this.estado_detalle_conv.value ? 1 : 0,
        ciudad: this.ciudad.value ? (this.ciudad.value).toUpperCase() : ''
      }
      const resp = await this.recursosHumanosService.actualizarDetalleConvocatoria(obj)
      await this.listarDetalleConvocatoria(convocatoria.id_convocatoria, convocatoria.id_proyecto)
      this.cerrarModalDetalleConvocatoria()
      this.toaster.success(
        'Se guardo correctamente',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async guardarDetalleConvocatoria() {
    try {
      if (this.formDetalleConvocatoria.invalid) {
        this.mostrar_carga_todo = false
        this.formDetalleConvocatoria.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }

      const convocatoria = this.tablaConvocatorias[this.filConv]
      const detalle = this.detalleConvocatoria[this.filDetalle]
      // const existe = this.tablaCargos.find(ele=> ele.)
      this.mostrar_carga_todo = true
      const obj = {
        id_proyecto: convocatoria.id_proyecto,
        id_convocatoria: convocatoria.id_convocatoria,
        id_area: this.id_area_detalle_conv.value,
        id_cargo: this.id_cargo_detalle_conv.value,
        vacantes: this.vacantes.value,
        requerimiento: this.requerimiento.value,
        remuneracion: this.remuneracion.value,
        link_documento: this.link_documento.value ? this.link_documento.value : '',
        estado: 1,
        ciudad: this.ciudad.value ? this.ciudad.value : ''
      }
      const resp = await this.recursosHumanosService.guardarDetalleConvocatoria(obj)
      await this.listarDetalleConvocatoria(convocatoria.id_convocatoria, convocatoria.id_proyecto)
      this.cerrarModalDetalleConvocatoria()
      this.toaster.success(
        'Se guardo correctamente',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async eliminarDetalleConvocatoria(row, i) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Eliminará el cargo requerido seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: row.id_proyecto,
          id_convocatoria: row.id_convocatoria,
          id_detalle: row.id_detalle
        }
        const resp = await this.recursosHumanosService.eliminarDetalleConvocatoria(obj)
        if (resp[0].resultado == 'OK') {
          await this.listarDetalleConvocatoria(row.id_convocatoria, row.id_proyecto)
          this.mostrar_carga_todo = false
          this.toaster.success(
            'Se elimino correctamente',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        } else {
          this.mostrar_carga_todo = false
          SwalService.error()
        }
      }
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  cerrarModalPostulante() {
    this.modalPostulante.hide()
  }

  async openModalPostulante(row?, calificar?) {
    this.cargosFiltrados = []
    this.mostrar_carga_todo = true
    this.currentRating = 0;

    this.formPostulante.reset()
    this.cargosFiltrados = this.detalleConvocatoria.map(ele => { const a = { descripcion: ele.area_descripcion + ' -> ' + ele.cargo_descripcion, id: ele.id_area + '-' + ele.id_cargo }; return a })
    if (row) {
      this.calificar = calificar ? true : false
      const fecha = row.fecha
        ? row.fecha.split('T')[0]
        : null;
      this.formPostulante.patchValue({
        id_postulante: row.id_postulante,
        id_convocatoria: row.id_convocatoria,
        nombres: row.nombres,
        apellidos: row.apellidos,
        fecha: fecha,
        evaluador: row.evaluador,
        id_area: row.id_area,
        id_cargo: row.id_area + '-' + row.id_cargo,
        cv: row.cv,
        entrevista: row.entrevista,
        telefono: row.telefono,
        correo: row.correo,
        progreso: row.progreso,
        calidad: row.calidad,
        adicional: row.adicional,
        dni: row.dni
      })
      this.currentRating = row.calidad
    }

    this.modalPostulante.show()
    this.mostrar_carga_todo = false
  }

  cambioSelectAreaPostu(event) {
    console.log('event', event)
  }

  splitearText(texto: string): string[] {
    if (!texto) return [];
    return texto.split('|').filter(item => item.trim() !== '');
  }

  setRating(rating: number): void {
    this.currentRating = rating;

    // Actualizar el FormControl
    const calidadControl = this.formPostulante.get('calidad');
    if (calidadControl) {
      calidadControl.setValue(rating);
      calidadControl.markAsTouched();
    }
  }

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }

  async actualizarPostulante() {
    try {
      if (this.formPostulante.invalid) {
        this.mostrar_carga_todo = false
        this.formPostulante.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }

      const convocatoria = this.tablaConvocatorias[this.filConv]
      // const existe = this.tablaCargos.find(ele=> ele.)
      const dataPostulante = this.tablaPostulantes[this.filPostulante]
      this.mostrar_carga_todo = true
      let area = null
      let cargo = null
      const split = this.id_cargo_postulante.value.split('-')
      if (this.calificar) {
        area = dataPostulante.id_area
        cargo = dataPostulante.id_cargo
      } else {
        area = split[0]
        cargo = split[1]
      }
      const obj = {
        id_postulante: this.id_postulante.value,
        id_proyecto: convocatoria.id_proyecto,
        id_convocatoria: convocatoria.id_convocatoria,
        nombres: (this.nombres_postulante.value).trim(),
        apellidos: (this.apellidos_postulante.value).trim(),
        fecha: this.fecha_postulante.value ? this.fecha_postulante.value : '',
        evaluador: this.evaluador.value ? this.evaluador.value : '',
        id_area: area,
        id_cargo: cargo,
        cv: this.cv.value ? this.cv.value : null,
        entrevista: this.entrevista.value ? this.entrevista.value : '',
        telefono: this.telefono_postulante.value,
        correo: this.correo_postulante.value,
        progreso: this.progreso.value ? this.progreso.value : 0,
        calidad: this.calidad.value ? this.calidad.value : 0,
        adicional: this.adicional.value ? this.adicional.value : '',
        dni: this.dni_postulante.value
      }
      const resp = await this.recursosHumanosService.actualizarPostulanteConvocatoria(obj)
      const obj2 = {
        id_proyecto: convocatoria.id_proyecto,
        id_convocatoria: convocatoria.id_convocatoria
      }

      this.tablaPostulantes = await this.recursosHumanosService.listarPostulantesConvocatoria(obj2)
      this.cerrarModalPostulante()
      this.toaster.success(
        'Se guardo correctamente',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async agregarPostulanteConvocatoria() {
    try {
      if (this.formPostulante.invalid) {
        this.mostrar_carga_todo = false
        this.formPostulante.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }

      const convocatoria = this.tablaConvocatorias[this.filConv]
      // const existe = this.tablaCargos.find(ele=> ele.)
      this.mostrar_carga_todo = true
      const split = this.id_cargo_postulante.value.split('-')
      const obj = {
        id_proyecto: this.idProyecto,
        id_convocatoria: convocatoria.id_convocatoria,
        nombres: (this.nombres_postulante.value).trim(),
        apellidos: (this.apellidos_postulante.value).trim(),
        fecha: '',
        evaluador: '',
        id_area: split[0],
        id_cargo: split[1],
        cv: this.cv.value ? this.cv.value : null,
        entrevista: '',
        telefono: this.telefono_postulante.value,
        correo: this.correo_postulante.value,
        progreso: 0,
        calidad: 0,
        adicional: this.adicional.value ? this.adicional.value : '',
        dni: this.dni_postulante.value
      }
      const resp = await this.recursosHumanosService.guardarPostulanteConvocatoria(obj)
      if (resp[0]?.estado == "EXITO") {
        const obj = {
          id_proyecto: convocatoria.id_proyecto,
          id_convocatoria: convocatoria.id_convocatoria
        }

        this.tablaPostulantes = await this.recursosHumanosService.listarPostulantesConvocatoria(obj)
        this.cerrarModalPostulante()
        this.toaster.success(
          'Se guardo correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      } else {
        this.mostrar_carga_todo = false;
        SwalService.error(resp[0]?.mensaje, 'El dni se encuentra registrado para la postulacion de este cargo');
        return
      }

      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async eliminarPostulanteConvocatoria(row, i) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el postulante de la convocatoria seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: row.id_proyecto,
          id_postulante: row.id_postulante
        }
        const resp = await this.recursosHumanosService.eliminarPostulanteConvocatoria(obj)
        if (resp[0].resultado == 'OK') {
          const obj = {
            id_proyecto: row.id_proyecto,
            id_convocatoria: row.id_convocatoria
          }

          this.tablaPostulantes = await this.recursosHumanosService.listarPostulantesConvocatoria(obj)
          this.filPostulante = null
          this.mostrar_carga_todo = false
          this.toaster.success(
            'Se elimino correctamente',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        } else {
          this.mostrar_carga_todo = false
          SwalService.error()
        }
      }
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async cambioAreaSelecHorarios() {
    await this.listarHorarioYFeriadosArea()
  }

  async listarHorarioYFeriadosArea() {
    try {
      this.mostrar_carga_todo = true
      this.tablaHorario = []
      this.cantHorasSemana = 0
      this.cantHorasDescanso = 0
      this.tablaFeriados = []
      this.diasNoLaborablesArray = []
      this.tardanza = 0
      this.tiempo_extra = 0
      const obj = {
        id_proyecto: this.idProyecto,
        id_area: this.areaSelecHorarios
      }
      let horario = null
      const resp = await this.recursosHumanosService.listarHorarioYFeriadosArea(obj)
      if (resp[0]) {
        if (!resp[0].length) {
          horario = {
            id_configuracion: null,
            id_proyecto: this.idProyecto,
            id_area: this.areaSelecHorarios,
            inicio_semana: 'LUNES',
            dias_nolaborables: 'DOMINGO',
            hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
            hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
            hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
            hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
            totales_dia: 48,
            descuentos: '|10|10||100|100|||||||',
            tardanza: 10,
            tiempo_extra: 0
          }

        } else {
          horario = resp[0][0]
        }
      }
      this.dataHorario = horario
      if (resp[1]) {
        this.tablaFeriados = resp[1].map(ele => {
          // Convertir el string '1|2|3' en array de strings
          const areasArray = ele.areas ? ele.areas.split('|') : [];

          // Verificar si areaSelecHorarios está en el array
          // Nota: areaSelecHorarios podría ser string o number, así que convertimos a string
          const activo = areasArray.includes(this.areaSelecHorarios.toString());
          return {
            ...ele,  // Mantener todas las propiedades originales
            activo: activo
          };
        })
      }
      this.inicioSemana = horario.inicio_semana
      this.tardanza = horario.tardanza
      this.tiempo_extra = horario.tiempo_extra
      const diasNoLaborables = horario.dias_nolaborables.split('|')
      this.diasNoLaborablesArray = this.dias.map(ele => diasNoLaborables.includes(ele))
      this.cantHorasDescanso = this.calcularHorasEntreTurnos(horario.hora_salida_manana, horario.hora_ingreso_tarde)
      this.cantHorasSemana = this.calcularTotalHorasSemana(horario.hora_ingreso_manana, horario.hora_salida_manana, horario.hora_ingreso_tarde, horario.hora_salida_tarde)
      const porcentajes = horario.descuentos.split('|')
      if (porcentajes.length) {

        this.tiposAsistencia = this.tipos.map((ele, index) => { ele.porcentaje = porcentajes[index]; return ele })
      } else {
        this.tiposAsistencia = JSON.parse(JSON.stringify(this.tipos))
      }
      const a = horario.hora_ingreso_manana.split('|')
      a.unshift('Hora ingreso mañana')
      this.tablaHorario.push(a)
      const b = horario.hora_salida_manana.split('|')
      b.unshift('Hora salida mañana')
      this.tablaHorario.push(b)
      const mediodia = ['Hora de descanso', null, null, null, null, null, null, null]
      this.tablaHorario.push(mediodia)
      const c = horario.hora_ingreso_tarde.split('|')
      c.unshift('Hora entrada tarde')
      this.tablaHorario.push(c)
      const d = horario.hora_salida_tarde.split('|')
      d.unshift('Hora salida tarde')
      this.tablaHorario.push(d)

      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
    const obj = {

    }
  }

  calcularHorasEntreTurnos(hora_salida_manana, hora_ingreso_tarde): number {
    // Separar los strings por pipe
    const salidasManana = hora_salida_manana.split('|');
    const ingresosTarde = hora_ingreso_tarde.split('|');

    let horasTotales = 0;

    // Asegurarse que ambos arrays tienen la misma longitud
    const dias = Math.min(salidasManana.length, ingresosTarde.length);

    for (let i = 0; i < dias; i++) {
      if (!this.diasNoLaborablesArray[i]) {
        const salidaManana = salidasManana[i];
        const ingresoTarde = ingresosTarde[i];

        // Verificar que ambos horarios sean válidos (no 00:00:00)
        if (salidaManana !== '' && ingresoTarde !== '') {
          const horas = this.calcularDiferenciaHoras(salidaManana, ingresoTarde);
          horasTotales += horas;
        }
      }
    }

    return horasTotales;
  }

  calcularDiferenciaHoras(horaInicio: string, horaFin: string): number {
    // Convertir horas a minutos desde medianoche
    const inicioMinutos = this.horaAMinutos(horaInicio);
    const finMinutos = this.horaAMinutos(horaFin);

    // Calcular diferencia en minutos
    let diferenciaMinutos = finMinutos - inicioMinutos;

    // Si la diferencia es negativa, podría ser por cambio de día
    if (diferenciaMinutos < 0) {
      // Asumimos que el ingreso tarde es del mismo día que la salida mañana
      // Si es negativo, podría ser un error en los datos
      console.warn(`Diferencia negativa entre ${horaInicio} y ${horaFin}`);
      diferenciaMinutos = 0; // o manejar según tu lógica de negocio
    }

    // Convertir a horas
    return diferenciaMinutos / 60;
  }

  horaAMinutos(hora: string): number {
    const partes = hora.split(':');
    const horas = parseInt(partes[0], 10);
    const minutos = parseInt(partes[1], 10);

    return (horas * 60) + minutos;
  }

  calcularTotalHorasSemana(hora_ingreso_manana, hora_salida_manana, hora_ingreso_tarde, hora_salida_tarde): number {
    let total = 0;
    const dias = 7;

    // Para cada día de la semana
    for (let i = 0; i < dias; i++) {
      // Horas mañana
      if (!this.diasNoLaborablesArray[i]) {
        const ingresoM = hora_ingreso_manana.split('|')[i];
        const salidaM = hora_salida_manana.split('|')[i];

        if (ingresoM !== '' && salidaM !== '') {
          const [h1, m1] = ingresoM.split(':').map(Number);
          const [h2, m2] = salidaM.split(':').map(Number);
          total += (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
        }

        // Horas tarde
        const ingresoT = hora_ingreso_tarde.split('|')[i];
        const salidaT = hora_salida_tarde.split('|')[i];

        if (ingresoT !== '' && salidaT !== '') {
          const [h1, m1] = ingresoT.split(':').map(Number);
          const [h2, m2] = salidaT.split(':').map(Number);
          total += (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
        }
      }
    }

    return parseFloat(total.toFixed(2));
  }

  finalizarEdicion() {
    this.celdaEditable = [];
    const horario = {
      hora_ingreso_manana: this.tablaHorario[0].slice(1).join('|'),
      hora_salida_manana: this.tablaHorario[1].slice(1).join('|'),
      hora_ingreso_tarde: this.tablaHorario[3].slice(1).join('|'),
      hora_salida_tarde: this.tablaHorario[4].slice(1).join('|'),
    }
    this.cantHorasDescanso = this.calcularHorasEntreTurnos(horario.hora_salida_manana, horario.hora_ingreso_tarde)
    this.cantHorasSemana = this.calcularTotalHorasSemana(horario.hora_ingreso_manana, horario.hora_salida_manana, horario.hora_ingreso_tarde, horario.hora_salida_tarde)
    this.actualizarHorario()
  }

  async actualizarHorario() {
    const diasNolabo = this.diasNoLaborablesArray
      .map((ele, index) => ele ? this.dias[index] : null)
      .filter(ele => ele !== null)
      .join('|');
    const hora_ingreso_manana = this.tablaHorario[0].filter((ele, index) => index > 0).join('|')
    const hora_salida_manana = this.tablaHorario[1].filter((ele, index) => index > 0).join('|')
    const hora_ingreso_tarde = this.tablaHorario[3].filter((ele, index) => index > 0).join('|')
    const hora_salida_tarde = this.tablaHorario[4].filter((ele, index) => index > 0).join('|')
    const descuentos = this.tiposAsistencia.map((ele, index) => ele.porcentaje).join('|')
    if (this.dataHorario.id_configuracion) {
      const obj = {
        id_configuracion: this.dataHorario.id_configuracion,
        id_proyecto: this.dataHorario.id_proyecto,
        id_area: this.dataHorario.id_area,
        inicio_semana: this.inicioSemana,
        dias_nolaborables: diasNolabo,
        hora_ingreso_manana: hora_ingreso_manana,
        hora_salida_manana: hora_salida_manana,
        hora_ingreso_tarde: hora_ingreso_tarde,
        hora_salida_tarde: hora_salida_tarde,
        totales_dia: this.cantHorasDescanso,
        descuentos: descuentos,
        tardanza: this.tardanza,
        tiempo_extra: this.tiempo_extra
      }

      const resp = await this.recursosHumanosService.actualizarHorarioArea(obj)
    } else {

      const obj = {
        id_proyecto: this.dataHorario.id_proyecto,
        id_area: this.dataHorario.id_area,
        inicio_semana: this.inicioSemana,
        dias_nolaborables: diasNolabo,
        hora_ingreso_manana: hora_ingreso_manana,
        hora_salida_manana: hora_salida_manana,
        hora_ingreso_tarde: hora_ingreso_tarde,
        hora_salida_tarde: hora_salida_tarde,
        totales_dia: this.cantHorasDescanso,
        descuentos: descuentos,
        tardanza: this.tardanza,
        tiempo_extra: this.tiempo_extra
      }

      const resp = await this.recursosHumanosService.guardarHorarioArea(obj)
      if (resp) {
        this.dataHorario.id_configuracion = resp[0].id_configuracion
      }
    }

  }

  showTimePicker(event: Event, i: number, j: number) {
    event.stopPropagation();

    const input = event.target as HTMLInputElement;

    // Usar type assertion para decirle a TypeScript que confíe en nosotros
    const inputWithPicker = input as HTMLInputElement & {
      showPicker?: () => void;
    };

    // Verificar si showPicker existe
    if (inputWithPicker.showPicker) {
      inputWithPicker.showPicker();
    } else {
      // Fallback para navegadores que no soportan showPicker
      input.focus();
      input.click();
    }
  }

  habilitarEdicionHora(i: number, j: number) {
    if (i !== 2 && j > 0) {
      this.celdaEditable = [i, j]
      setTimeout(() => {
        const inputs = this.timeInputs.toArray();
        const currentInput = inputs.find((_, index) => {
          // Encontrar el input correspondiente a esta celda
          return true; // Lógica para encontrar el input correcto
        });

        if (currentInput) {
          this.showTimePicker({ target: currentInput.nativeElement } as any, i, j);
        }
      }, 50);
    }
  }

  get diasNoLaborables(): boolean[] {
    return this.dias.map(dia => this.diasNoLaborablesArray.includes(dia));
  }

  set diasNoLaborables(val: boolean[]) {
    this.diasNoLaborablesArray = this.dias.filter((dia, index) => val[index]);
  }

  getAbreviatura(dia: string): string {
    const abreviaciones: { [key: string]: string } = {
      'Lunes': 'Lun',
      'Martes': 'Mar',
      'Miércoles': 'Mié',
      'Jueves': 'Jue',
      'Viernes': 'Vie',
      'Sábado': 'Sáb',
      'Domingo': 'Dom'
    };
    return abreviaciones[dia] || dia.substring(0, 3);
  }

  changeNoLaborable() {
    const horario = {
      hora_ingreso_manana: this.tablaHorario[0].slice(1).join('|'),
      hora_salida_manana: this.tablaHorario[1].slice(1).join('|'),
      hora_ingreso_tarde: this.tablaHorario[3].slice(1).join('|'),
      hora_salida_tarde: this.tablaHorario[4].slice(1).join('|'),
    }
    this.cantHorasDescanso = this.calcularHorasEntreTurnos(horario.hora_salida_manana, horario.hora_ingreso_tarde)
    this.cantHorasSemana = this.calcularTotalHorasSemana(horario.hora_ingreso_manana, horario.hora_salida_manana, horario.hora_ingreso_tarde, horario.hora_salida_tarde)
    this.actualizarHorario()
  }

  abrirModalFeriado(row?) {
    this.mostrar_carga_todo = true

    this.formFeriado.reset()

    if (row) {
      const fecha = row.fecha
        ? row.fecha.split('T')[0]
        : null;
      this.formPostulante.patchValue({
        id_postulante: row.id_feriado,
        descripcion: row.descripcion,
        fecha: fecha
      })

    }
    this.modalFeriado.show()
    this.mostrar_carga_todo = false
  }

  cerrarModalFeriado() {
    this.modalFeriado.hide()
  }

  async agregarFeriado() {
    try {
      if (this.formFeriado.invalid) {
        this.formFeriado.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      let agregarTodas = []
      const sw = await SwalService.multiple2('Desea agregar el feriado a todas las areas existentes?', 'En caso de no aceptar se tendra que activar manualmente por area', 'SI', 'NO')
      if (sw.isConfirmed) {
        await this.listarAreasYCargos()
        for (const element of this.areas) {
          agregarTodas.push(element.id_area)
        }
      } else if (sw.isDismissed) {
        agregarTodas = []
      } else {
        return
      }

      this.mostrar_carga_todo = true
      const obj = {
        id_proyecto: this.idProyecto,
        areas: agregarTodas.join('|'),
        fecha_asignacion: this.fechaFeriado.value,
        descripcion: this.descripcionFeriado.value,
      }
      const response = await this.recursosHumanosService.guardarFeriadoRecursosHumanos(obj)
      if (response) {
        this.tablaFeriados = response.map(ele => {
          // Convertir el string '1|2|3' en array de strings
          const areasArray = ele.areas ? ele.areas.split('|') : [];

          // Verificar si areaSelecHorarios está en el array
          // Nota: areaSelecHorarios podría ser string o number, así que convertimos a string
          const activo = areasArray.includes(this.areaSelecHorarios.toString());
          return {
            ...ele,  // Mantener todas las propiedades originales
            activo: activo
          };
        })
        this.cerrarModalFeriado()
        this.toaster.success(
          'Se guardo correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );

      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async actualizarFeriado() {
    try {
      if (this.formFeriado.invalid) {
        this.formFeriado.markAllAsTouched()
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }


      this.mostrar_carga_todo = true
      const row = this.tablaFeriados[this.filFeriado]
      const obj = {
        id_feriado: this.id_feriado.value,
        id_proyecto: row.id_proyecto,
        areas: row.areas,
        fecha_asignacion: this.fechaFeriado.value,
        descripcion: this.descripcionFeriado.value,
      }
      const response = await this.recursosHumanosService.actualizarFeriadoRecursosHumanos(obj)
      if (response) {
        this.cerrarModal2()
        this.toaster.success(
          'Se guardo correctamente',
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        await this.generarTablaUsuarios()
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async eliminarFeriado(row, i) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'se eliminar el feriado seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_feriado: row.id_feriado,
          id_proyecto: row.id_proyecto
        }
        const resp = await this.recursosHumanosService.eliminarFeriadoRecursosHumanos(obj)
        if (resp) {
          this.tablaFeriados = resp.map(ele => {
            // Convertir el string '1|2|3' en array de strings
            const areasArray = ele.areas ? ele.areas.split('|') : [];

            // Verificar si areaSelecHorarios está en el array
            // Nota: areaSelecHorarios podría ser string o number, así que convertimos a string
            const activo = areasArray.includes(this.areaSelecHorarios.toString());
            return {
              ...ele,  // Mantener todas las propiedades originales
              activo: activo
            };
          })
          this.filFeriado = null
          this.toaster.success(
            'Se eliminó correctamente',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
        }
        this.mostrar_carga_todo = false
      }

    } catch (error) {
      this.mostrar_carga_todo = false
      SwalService.error()
      console.log(error)
    }
  }

  abrirEnlace(url: string, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!url) return;

    let urlCompleta = url;

    // Agregar protocolo si no lo tiene
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlCompleta = 'https://' + url;
    }

    // Validar que sea una URL válida
    try {
      new URL(urlCompleta);
      window.open(urlCompleta, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('URL inválida:', url, error);
      this.toaster.error('Enlace inválido', 'No se puede abrir el enlace');
    }
  }

  seleccionFilaPostApro(i) {
    this.filPostAprobados = i
  }

  async agregarPostulante() {
    try {
      if (!this.dni_up.value) {
        return
      }
      if (this.formUsuarioPostulante.invalid) {
        this.formUsuarioPostulante.markAllAsTouched()
        this.mostrar_carga_todo = false
        this.toaster.error(
          'Formulario incompleto o datos no validos',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      if (this.fecha_asignacion_up.value > this.fecha_culminacion_up.value) {
        this.fecha_asignacion_up.setErrors({ incorrect: true })
        this.fecha_culminacion_up.setErrors({ incorrect: true })
        this.toaster.error(
          `Las fecha inicio no puede ser mayor a la fecha fin`,
          'Error en fechas',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }
      const sw = await SwalService.confirm('Esta seguro?', 'Se cambiara el estado de el postulante a estado contratado , se creara el usuario y la asignacion')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const usuario = {
          id_proyecto: this.idProyecto,
          nombres: this.nombres_up.value,
          apellidos: this.apellidos_up.value,
          dni: this.dni_up.value,
          telefono: this.telefono_up.value,
          correo: this.correo_up.value,
          fecha_asignacion: this.fecha_asignacion_up.value,
          fecha_culminacion: this.fecha_culminacion_up.value,
          estado: 1,
        }
        const respUser = await this.recursosHumanosService.guardarUsuarioRecursosHumanos(usuario)
        if (respUser[0].id_usuario) {
          const asignacion = {
            id_proyecto: this.idProyecto,
            id_usuario: respUser[0].id_usuario,
            id_area: this.area_up.value,
            id_cargo: this.cargo_up.value,
            tipo_cargo: Number(this.categoria_up.value.charAt(this.categoria_up.value.length - 1)),
            fecha_inicio: this.fecha_asignacion_up.value,
            fecha_fin: this.fecha_culminacion_up.value,
            estado: 1,
          }
          const response = await this.recursosHumanosService.guardarAsignacionUsuario(asignacion)
          if (response) {
            const dataPostulante = this.postulAprobados[this.filPostAprobados]
            const fecha = dataPostulante.fecha
              ? dataPostulante.fecha.split('T')[0]
              : null;
            const obj = {
              id_postulante: dataPostulante.id_postulante,
              id_proyecto: dataPostulante.id_proyecto,
              id_convocatoria: dataPostulante.id_convocatoria,
              nombres: dataPostulante.nombres,
              apellidos: dataPostulante.apellidos,
              fecha: fecha,
              evaluador: dataPostulante.evaluador,
              id_area: dataPostulante.id_area,
              id_cargo: dataPostulante.id_cargo,
              cv: dataPostulante.cv,
              entrevista: 'CONTRATADO',
              telefono: dataPostulante.telefono,
              correo: dataPostulante.correo,
              progreso: dataPostulante.progreso,
              calidad: dataPostulante.calidad,
              adicional: dataPostulante.adicional,
              dni: dataPostulante.dni
            }
            const resp = await this.recursosHumanosService.actualizarPostulanteConvocatoria(obj)
            this.postulAprobados.splice(this.filPostAprobados, 1)
            this.filPostAprobados = null
            this.formUsuarioPostulante.reset()
            this.formUsuarioPostulante.disable()
            // this.cerrarModalPostUsu()
            this.toaster.success(
              'Se guardo correctamente',
              'Correcto',
              {
                closeButton: false,
                positionClass: 'toast-bottom-right',
                timeOut: 4000,
              }
            );
            this.tablaAsignaciones = []
            this.filUsuario = null
            this.filAsignacion = null
            await this.generarTablaUsuarios()
          }
        }
        this.mostrar_carga_todo = false
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
      this.mostrar_carga_todo = false
    }
  }

  cambioValorEntrevista() {
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().split('T')[0];
    this.fecha_postulante.setValue(fechaFormateada)
  }
}
