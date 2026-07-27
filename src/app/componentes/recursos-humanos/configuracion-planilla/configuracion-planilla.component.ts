import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TinymceComponent } from 'angular2-tinymce';
const moment = require('moment');
import { ToastrService } from 'ngx-toastr';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { AddImgUrlComponent } from 'src/app/shared/add-img-url/add-img-url.component';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { saveAs } from 'file-saver';
import { FormsService } from 'src/app/servicios/forms.service';
import { FormulaEvaluatorService } from 'src/app/servicios/formula-evaluator.service';
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
  item?: number | null,
  ind_gp?: number | null;
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
  ind_gp?: number | null;
}

export interface archivoimg {
  nombre: any;
  base
}

interface filaPresAnalitico {
  id_presupuesto: number;
  id_proyecto: number;
  id_area: number;
  item: string;
  descripcion: string;
  abreviatura: string;
  formula: string;
  cargos: cargoFila[];
}

interface cargoFila {
  id_cargo: number;
  porcentaje: number | null;
  parcial: number | null,
  editable?: boolean
}

export interface CargoPlanilla {
  id_cargo?: number | null;
  descripcion: string;
  abreviatura: string;
  categoria_seleccionada: string; // 'Categoria t1', 'Categoria t2', etc.
  categoria_t1?: number;
  categoria_t2?: number;
  categoria_t3?: number;
  categoria_t4?: number;
  categoria_t5?: number;
  habilitado?: number;
  texto: string;
  ind_gp?: number | null;
}

export interface AreaPlanilla {
  id_area?: number | null;
  descripcion: string;
  abreviatura: string;
  id_responsable?: number | null;
  cargos: CargoPlanilla[];
  ind_gp?: number | null;
}

@Component({
  selector: 'app-configuracion-planilla',
  templateUrl: './configuracion-planilla.component.html',
  styleUrls: ['./configuracion-planilla.component.scss']
})
export class ConfiguracionPlanillaComponent implements OnInit {
  mostrar_carga_todo = false
  mostrar_carga = false
  subvista = 1
  filSel = null
  bloquear = true
  tablaCargos: DetalleAgrupamientoCargo[] = []
  tablaCargos2: DetalleAgrupamientoCargo[] = [];
  basicContent = ''
  tablaUsuarios: any[] = [];
  dataarchver = [];
  id_usuario = null
  numeroImagen: number = 0;
  filUsuario = null
  filPostAprobados = null
  postulAprobados = []
  areas = []
  cargos = []
  tablaAsignaciones = []
  filDetalle = null
  cargosFiltrados: any[] = [];
  private fechasLimiteUsuario: any = null;
  tiposFiltrados: any = []
  tipos_cargos = [
    'Categoria t1',
    'Categoria t2',
    'Categoria t3',
    'Categoria t4',
    'Categoria t5'
  ]
  filAsignacion = null
  qrData = ''
  terminoBusqueda = ''
  tablaPostulantes = []
  buscando = false
  filConv = null
  tablaConvocatorias = []
  detalleConvocatoria = []
  filPostulante = null
  currentRating: number = 0;
  calificar: boolean = false;
  tablaHorario = []
  tablaFeriados = []
  cantHorasSemana = 0
  cantHorasDescanso = 0
  diasNoLaborablesArray: any[] = [];
  tardanza = 0
  tiempo_extra = 0
  areaSelecHorarios = null
  dataHorario = null
  inicioSemana = null
  // tipos = [
  //   { codigo: 'A', tipo: 'ASISTIO', porcentaje: null },
  //   { codigo: 'T', tipo: 'TARDANZA', porcentaje: 10 },
  //   { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA', porcentaje: 10 },
  //   { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA', porcentaje: null },
  //   { codigo: 'F', tipo: 'FALTA', porcentaje: 100 },
  //   { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA', porcentaje: 100 },
  //   { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA', porcentaje: null },
  //   { codigo: 'FM', tipo: 'DESCANSO MEDICO', porcentaje: null },
  //   { codigo: 'FV', tipo: 'VACACIONES', porcentaje: null },
  //   { codigo: 'FC', tipo: 'CITA MEDICA', porcentaje: null },
  //   { codigo: 'FD', tipo: 'DUELO', porcentaje: null },
  //   { codigo: 'PE', tipo: 'PERMISO', porcentaje: null },
  //   { codigo: 'BF', tipo: 'BONO FERIADO O NO LABORABLE', porcentaje: null },
  // ]
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
    { codigo: 'PE', tipo: 'PERMISO', porcentaje: null },
    { codigo: 'D1', tipo: 'DESCUENTO OPCIONAL 1', porcentaje: null },
    { codigo: 'D2', tipo: 'DESCUENTO OPCIONAL 2', porcentaje: null },
    { codigo: 'D3', tipo: 'DESCUENTO OPCIONAL 3', porcentaje: null },
    { codigo: 'OBS', tipo: 'OBSERVADO', porcentaje: 100 },
    { codigo: 'IN', tipo: 'INCOMPLETO', porcentaje: 100 },
    { codigo: 'TEX', tipo: 'TEXTRA', porcentaje: null },
    { codigo: 'BN', tipo: 'BONO DOMINICAL', porcentaje: null },
    { codigo: 'BF', tipo: 'BONO FERIADO', porcentaje: null },
    { codigo: 'B1', tipo: 'BONO OPCIONAL 1', porcentaje: null },
    { codigo: 'B2', tipo: 'BONO OPCIONAL 2', porcentaje: null },
    { codigo: 'B3', tipo: 'BONO OPCIONAL 3', porcentaje: null },
  ];
  dias = [
    "LUNES",
    "MARTES",
    "MIÉRCOLES",
    "JUEVES",
    "VIERNES",
    "SÁBADO",
    "DOMINGO"
  ];
  tiposAsistencia = []
  celdaEditable = []
  filFeriado = null
  areaSeleccionadaPres = null
  cargosFiltradosPres = []
  tablaPresAnalitico: filaPresAnalitico[] = []
  tablaPresAnaliticoFooter: filaPresAnalitico[] = []
  filPresAna = null
  private contadorSegundos = 0;
  private temporizador: any = null;
  private tiempoLimiteSegundos = 3; // 3 segundos de espera
  private actualizacionEnCurso = false;

  cargosPorFila: any[][] = [];
  tiposPorFila: any[][] = [];
  formSubmitted = false;
  id_asig_eliminar = []
  tablaData = []

  @ViewChild("modalArea") modalArea: ModalBasicComponent;
  @ViewChild("modalCargo") modalCargo: ModalBasicComponent;
  @ViewChild('tinymce', { static: false }) public tinymce: TinymceComponent;
  @ViewChild("modalUsuario") modalUsuario: ModalBasicComponent;
  @ViewChild("modalPostulanteUsuario") modalPostulanteUsuario: ModalBasicComponent;
  @ViewChild("modalAsignacion") modalAsignacion: ModalBasicComponent;
  @ViewChild("modalQRAsignacion") modalQRAsignacion: ModalBasicComponent;

  @ViewChild("modalConvocatoria") modalConvocatoria: ModalBasicComponent;
  @ViewChild("modalDetalleConvocatoria") modalDetalleConvocatoria: ModalBasicComponent;
  @ViewChild("modalPostulante") modalPostulante: ModalBasicComponent;
  @ViewChild("modalFeriado") modalFeriado: ModalBasicComponent;
  @ViewChild("modalPlanillaBase") modalPlanillaBase: ModalBasicComponent;
  @Input() idProyecto = null
  @Input() tabproyecto = null
  @Input() ocultarMenu = null
  @Input() nombreProyecto = null

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

  formCargo = new UntypedFormGroup({
    id_cargo: new UntypedFormControl('', []),
    descripcion: new UntypedFormControl('', [Validators.required]),
    abreviatura: new UntypedFormControl('', [Validators.required]),
    categorias: new UntypedFormControl('', [Validators.required]),
  })

  get descripcion(): UntypedFormControl { return this.formCargo.get('descripcion') as UntypedFormControl }
  get abreviatura(): UntypedFormControl { return this.formCargo.get('abreviatura') as UntypedFormControl }
  get id_cargo(): UntypedFormControl { return this.formCargo.get('id_cargo') as UntypedFormControl }
  get categorias(): UntypedFormControl { return this.formCargo.get('categorias') as UntypedFormControl }

  formUsuario = new UntypedFormGroup({
    id_usuario: new UntypedFormControl('',),
    nombres: new UntypedFormControl('', [Validators.required]),
    apellidos: new UntypedFormControl('', [Validators.required]),
    dni: new UntypedFormControl('', [Validators.required]),
    telefono: new UntypedFormControl('', []),
    correo: new UntypedFormControl('', [Validators.email]),
    fecha_asignacion: new UntypedFormControl('', [Validators.required]),
    fecha_culminacion: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('',),
    asignaciones: new FormArray([])
  })
  get id_user(): UntypedFormControl { return this.formUsuario.get('id_usuario') as UntypedFormControl }
  get nombres(): UntypedFormControl { return this.formUsuario.get('nombres') as UntypedFormControl }
  get apellidos(): UntypedFormControl { return this.formUsuario.get('apellidos') as UntypedFormControl }
  get dni(): UntypedFormControl { return this.formUsuario.get('dni') as UntypedFormControl }
  get telefono(): UntypedFormControl { return this.formUsuario.get('telefono') as UntypedFormControl }
  get correo(): UntypedFormControl { return this.formUsuario.get('correo') as UntypedFormControl }
  get fecha_asignacion(): UntypedFormControl { return this.formUsuario.get('fecha_asignacion') as UntypedFormControl }
  get fecha_culminacion(): UntypedFormControl { return this.formUsuario.get('fecha_culminacion') as UntypedFormControl }
  get estado(): UntypedFormControl { return this.formUsuario.get('estado') as UntypedFormControl }

  get asignaciones(): FormArray {
    return this.formUsuario.get('asignaciones') as FormArray;
  }

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

  areaSeleccionada: string | number = 'TODOS';
  cargoSeleccionado: string | number = 'TODOS';
  tablaUsuariosMaster: any[] = [];
  listaAsignacionesProyecto: any[] = [];
  listaCargosFiltrados: any[] = [];
  filtroAreaSel: string | number = 'TODOS';
  filtroCargoSel: string | number = 'TODOS';


  // Estructura dinámica de la Planilla en edición
  planillaBase: AreaPlanilla[] = [];


  filtroCargo: string = '';
  areaSeleccionadaMaster: string | null = null;
  cargoSeleccionadoMaster: string | null = null;
  areasDisponiblesModal: any[] = [];
  cargosFiltradosModal: string[] = [];

  listaCompletaAreasMaestras: string[] = [
    'PERSONAL DIRECTIVO',
    'ESPECIALISTAS TECNICOS',
    'PERSONAL TECNICO',
    'PERSONAL OBRERO'
  ];

  listaCompletaCargosMaestros: string[] = [
    'GERENTE GENERAL', 'COORDINADOR GENERAL', 'JEFE DE OFICINA TECNICA', 'JEFE DE PRODUCCION',
    'RESPONSABLE DE CONTABILIDAD Y PRESUPUESTO', 'RESPONSABLE DE LOGISTICA Y PROCURA',
    'RESPONSABLE DE ALMACEN', 'RESPONSABLE RECURSOS HUMANOS', 'RESPONSABLE EQUIPO MECANICO',
    'GERENTE DEL PROYECTO', 'DIRECTOR DE PROYECTO', 'COORDINADOR DE PROYECTO',
    'INGENIERO RESIDENTE DE OBRA', 'ESPECIALISTA DE ESTRUCTURAS', 'ESPECIALISTA DE ARQUITECTURA',
    'ESPECIALISTA EN INST. SANITARIAS', 'ESPECIALISTA EN INST. ELECTRICAS', 'ESPECIALISTA EN INST. MECANICAS',
    'ESPECIALISTA EN INST. COMUNICACIONES', 'ESPECIALISTA EN MEDIO AMBIENTE', 'ESPECIALISTA EN SEGURIDAD SALUD EN EL TRABAJO',
    'ESPECIALISTA EN PAVIMENTOS', 'ESPECIALISTA EN GEOTECNIA', 'ESPECIALISTA EN HIDRAULICA',
    'ESPECIALISTA EN TOPOGRAFIA', 'ESPECIALISTA EN OBRAS CIVILES', 'ESPECIALISTA EN PUENTES',
    'ESPECIALISTA EN EQUIPAMIENTO HOSPITALARIO', 'ESPECIALISTA DE COSTOS, METRADOS Y VALORIZACIONES',
    'ESPECIALISTA DE CONTROL Y ASEGURAMIENTO DE LA CALIDAD', 'ESPECIALISTA DE CONTROL DE PROYECTOS',
    'ESPECIALISTA BIM', 'ARQUEOLOGO', 'ASISTENTE DE RESIDENTE', 'ASISTENTE DE COSTOS, METRADOS Y VALORIZACIONES',
    'ADMINISTRADOR', 'MODELADOR BIM', 'TOPOGRAFO', 'DIBUJANTE', 'GUARDIAN', 'ALMACENERO',
    'CHOFER', 'COCINERO', 'PREVENCIONISTA', 'MAESTRO DE OBRA', 'CAPATAZ', 'OPERARIO', 'OFICIAL', 'PEON'
  ];
  constructor(private recursosHumanosService: RecursosHumanosService, public formsService: FormsService, private formulaEvaluator: FormulaEvaluatorService, private encriptadorService: EncriptadorService, private toaster: ToastrService, private sanitizer: DomSanitizer, private modalService: NgbModal,) {
    this.formUsuario.get('fecha_asignacion')?.valueChanges.subscribe(() => this.revalidarTodo());
    this.formUsuario.get('fecha_culminacion')?.valueChanges.subscribe(() => this.revalidarTodo());
  }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      this.id_usuario = this.encriptadorService.recuperarlocalstory('idusuario');
      await this.listarCargosPorArea()
      this.mostrar_carga_todo = false
    } catch (error) {
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()

    }

  }

  async cambioVista(vista) {
    this.subvista = vista
    this.mostrar_carga_todo = true
    this.filSel = null
    this.basicContent = null
    this.bloquear = true
    await this.listarAreasYCargos()
    if (this.subvista == 1) {

    } else if (this.subvista == 2) {
      this.filConv = null
      this.filDetalle = null
      this.filPostulante = null
      await this.listarConvocatorias()
    } else if (this.subvista == 3) {
      // this.tablaAsignaciones = []
      // this.filUsuario = null
      // this.filAsignacion = null
      // await this.generarTablaUsuarios()
      this.tablaAsignaciones = []
      this.filUsuario = null
      this.filAsignacion = null

      // Inicializamos los valores de los filtros en TODOS
      this.filtroAreaSel = 'TODOS'
      this.filtroCargoSel = 'TODOS'
      this.listaCargosFiltrados = [] // Al estar en TODOS, no filtramos subcargos aún

      // Llamamos al generador de tabla
      await this.generarTablaUsuarios()
    } else if (this.subvista == 4) {
      // this.areaSelecHorarios = null
      // this.areas = []

      if (!this.areaSelecHorarios && this.areas.length) {
        this.areaSelecHorarios = this.areas[0].id_area
        await this.listarHorarioYFeriadosArea()
      }
    } else if (this.subvista == 5) {
      this.areaSeleccionadaPres = this.areas.length ? this.areas[0]?.id_area : null
      await this.cambioAreaPres()
    } else if (this.subvista == 6) {

    }
    this.mostrar_carga_todo = false
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
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

  seleccionFila(i) {
    this.filSel = i;
    this.bloquear = ((this.tablaCargos[i].id_cargo && this.tablaCargos[i].habilitado) ? false : true)
    if (this.tablaCargos[i].id_cargo) {
      this.basicContent = this.tablaCargos[i].texto
    } else {
      this.basicContent = ''
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

  cerrarModal() {
    this.modalCargo.hide();
  }

  cerrarModalArea() {
    this.modalArea.hide()
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

  // async listarCargosPorArea() {
  //   const obj = {
  //     id_proyecto: this.idProyecto
  //   }
  //   const resp = await this.recursosHumanosService.listarCargosPorArea(obj)
  //   console.log('resp', resp)
  //   this.tablaCargos = []
  //   this.tablaUsuarios = []
  //   let j = 1
  //   for (const filaArea of resp[0]) {
  //     let arraygrupo = []
  //     arraygrupo.push(filaArea)
  //     const encontrados = [];
  //     for (let i = resp[1].length - 1; i >= 0; i--) {
  //       if (resp[1][i].id_area == filaArea.id_area) {
  //         // Agregar a encontrados y eliminar del array original
  //         encontrados.push(resp[1][i]);
  //         resp[1].splice(i, 1);
  //       }
  //     }
  //     if (encontrados.length) {
  //       arraygrupo = arraygrupo.concat(encontrados)
  //     }
  //     // const existe = this.tablaPresInd.find(ele => ele.indice == filaArea.indice)
  //     const existe = null
  //     let k = 1
  //      console.log('arraygrupo', arraygrupo)
  //     for (const element of arraygrupo) {
  //       const obj: DetalleAgrupamientoCargo = {
  //         abreviatura: element?.abreviatura,
  //         descripcion: element?.descripcion,
  //         area_descripcion: filaArea?.descripcion,
  //         area_abreviatura: filaArea?.abreviatura,
  //         id_area: filaArea?.id_area,
  //         id_proyecto: filaArea?.id_proyecto,
  //         categoria_t1: element?.categoria_t1,
  //         categoria_t2: element?.categoria_t2,
  //         categoria_t3: element?.categoria_t3,
  //         categoria_t4: element?.categoria_t4,
  //         categoria_t5: element?.categoria_t5,
  //         id_cargo: element?.id_cargo,
  //         habilitado: element?.habilitado == 1 || element?.habilitado == '1' ? true : false,
  //         texto: element?.texto ? element.texto : '',
  //         item: element.id_cargo ? k : j
  //       }
  //       this.tablaCargos.push(obj)
  //       k++
  //     }
  //     j++
  //   }
  //   this.tablaCargos2 = this.tablaCargos
  //    console.log('arraygrupo', this.tablaCargos)
  // }

  async listarCargosPorArea() {
    const obj = {
      id_proyecto: this.idProyecto
    };

    const resp = await this.recursosHumanosService.listarCargosPorArea(obj);

    this.tablaCargos = [];
    this.tablaUsuarios = [];
    let j = 1;

    for (const filaArea of resp[0]) {
      let arraygrupo = [];
      arraygrupo.push(filaArea); // El primer elemento siempre es la cabecera del área

      const encontrados = [];

      // 1. Extraer los cargos que pertenecen al área actual
      for (let i = resp[1].length - 1; i >= 0; i--) {
        if (resp[1][i].id_area == filaArea.id_area) {
          encontrados.push(resp[1][i]);
          resp[1].splice(i, 1);
        }
      }

      // 2. ORDENAR los cargos encontrados según 'ind_gp'
      if (encontrados.length > 0) {
        encontrados.sort((a, b) => {
          const valA = a.ind_gp;
          const valB = b.ind_gp;

          // Si ambos son null, mantener su orden original
          if (valA === null || valA === undefined) {
            if (valB === null || valB === undefined) return 0;
            return 1; // Mover 'a' al final si 'b' tiene valor
          }
          if (valB === null || valB === undefined) {
            return -1; // Mover 'b' al final si 'a' tiene valor
          }

          // Ordenar numéricamente de forma ascendente
          return valA - valB;
        });

        // Unir la cabecera del área con sus cargos ya ordenados
        arraygrupo = arraygrupo.concat(encontrados);
      }

      let k = 1;

      // 3. Mapear y registrar en tablaCargos
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
          item: element.id_cargo ? k : j,
          ind_gp: element?.id_cargo ? element?.ind_gp : null
        };

        this.tablaCargos.push(obj);
        k++;
      }
      j++;
    }

    this.tablaCargos2 = this.tablaCargos;
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

  async eliminarCargo(row, i) {
    const sw = await SwalService.confirm('¿Estás seguro?', 'Se eliminará el cargo seleccionado');
    if (sw.isConfirmed) {
      try {
        this.mostrar_carga_todo = true;
        const obj = {
          id_cargo: row.id_cargo,
          id_proyecto: row.id_proyecto,
          id_area: row.id_area
        };

        const resp = await this.recursosHumanosService.eliminarCargoArea(obj);

        if (resp[0].id == 1) {
          // En lugar de hacer un .splice, volvemos a listar para traer el nuevo orden secuencial del back
          await this.listarCargosPorArea();

          this.filSel = null;
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
      } catch (error) {
        console.error(error);
        SwalService.error();
      } finally {
        this.mostrar_carga_todo = false;
      }
    }
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

  indicadorImagen(indicador: boolean) {
    if (indicador && (this.numeroImagen < this.dataarchver.length - 1)) {
      this.numeroImagen++
    }
    if (!indicador && (this.numeroImagen > 0)) {
      this.numeroImagen--
    }
  }

  async abrirModal2(usuario?: any) {
    // Limpiar todo
    while (this.asignaciones.length) {
      this.asignaciones.removeAt(0);
    }
    this.cargosPorFila = [];
    this.tiposPorFila = [];

    this.formUsuario.reset();
    this.formSubmitted = false;

    if (usuario) {
      // Cargar datos del usuario
      this.formUsuario.patchValue(usuario);

      // Cargar asignaciones existentes
      if (usuario.asignaciones && usuario.asignaciones.length > 0) {
        this.cargarAsignacionesExistentes(usuario.asignaciones);
      }
    }

    this.modalUsuario.show();

    // Configurar el subscription de solapamiento
    this.asignaciones.valueChanges.subscribe(() => {
      this.haySolapamiento();
    });
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

  async editarUsuario(row, i) {
    this.mostrar_carga_todo = true
    while (this.asignaciones.length) {
      this.asignaciones.removeAt(0);
    }
    this.cargosPorFila = [];
    this.tiposPorFila = [];
    this.id_asig_eliminar = []

    if (row) {
      let asignaciones = []

      const obj = {
        id_proyecto: row.id_proyecto,
        id_usuario: row.id_usuario
      }
      const resp = await this.recursosHumanosService.listarAsignacionesUsuario(obj)
      if (resp?.length) {
        asignaciones = resp
      }
      // // Cargar datos del row
      // this.formUsuario.patchValue(row);
      const fechaAsignacion = row.fecha_asignacion
        ? row.fecha_asignacion.split('T')[0]
        : null;

      const fechaCulminacion = row.fecha_culminacion
        ? row.fecha_culminacion.split('T')[0]
        : null;

      this.formUsuario.patchValue({
        id_usuario: row.id_usuario,
        nombres: row.nombres,
        apellidos: row.apellidos,
        dni: row.dni,
        telefono: row.telefono,
        correo: row.correo,
        fecha_asignacion: fechaAsignacion,
        fecha_culminacion: fechaCulminacion,
        estado: row.estado == 1 ? true : false,
      })

      // Cargar asignaciones existentes
      if (asignaciones && asignaciones.length > 0) {
        this.cargarAsignacionesExistentes(asignaciones);
      }
    }

    this.modalUsuario.show();

    // Configurar el subscription de solapamiento
    this.asignaciones.valueChanges.subscribe(() => {
      this.haySolapamiento();
    });
    this.mostrar_carga_todo = false
  }

  convertirFechaDMY(fechaISO: string): string {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('-');
    return `${day}-${month}-${year}`;
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

  // async generarTablaUsuarios() {
  //   try {
  //     const obj = {
  //       id_proyecto: this.idProyecto
  //     }
  //     const resp = await this.recursosHumanosService.listarUsuariosRecursosHumanos(obj)
  //     this.tablaUsuarios = []
  //     let tablaNueva = []
  //     let areaActual = null
  //     let cargoActual = null
  //     console.log('resp', resp)
  //     this.tablaUsuarios = resp
  //   } catch (error) {
  //     console.log(error)
  //     SwalService.error()
  //     this.mostrar_carga_todo = false
  //   }

  // }
  async generarTablaUsuarios() {
    try {
      this.mostrar_carga_todo = true
      const obj = {
        id_proyecto: this.idProyecto
      }

      // 1. Traemos la lista de usuarios
      const resp = await this.recursosHumanosService.listarUsuariosRecursosHumanos(obj)
      this.tablaUsuariosMaster = resp || []
      this.tablaUsuarios = [...this.tablaUsuariosMaster] // Hacemos una copia para mostrar

      // 2. Traemos TODAS las asignaciones del proyecto para cruzarlas en los filtros
      // Nota: Si no tienes este método en tu service, puedes crear un endpoint rápido o usar el que ya tienes pasando id_usuario: null o id_usuario: 0 si tu backend lo permite.
      const respAsig = await this.recursosHumanosService.listarAsignacionesUsuario({
        id_proyecto: this.idProyecto,
        id_usuario: 0 // Enviando 0 o null para que el backend retorne todas las asignaciones del proyecto
      })
      this.listaAsignacionesProyecto = respAsig || []

      this.mostrar_carga_todo = false
    } catch (error) {
      console.log(error)
      SwalService.error()
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

  async generarQRAsignacion(row, i) {
    this.qrData = ''
    const user = this.tablaUsuarios[this.filUsuario]
    this.qrData = user.id_usuario + '|' + user.id_proyecto + '|' + user.nombres + '|' + user.apellidos + '|' + user.dni + '|' + row.id_asignacion + '|' + row.descripcion_area + '|' + row.id_area + '|' + row.descripcion_cargo + '|' + row.id_cargo + '|' + moment(row.fecha_inicio).format('YYYY-MM-DD') + '|' + moment(row.fecha_fin).format('YYYY-MM-DD')
    this.modalQRAsignacion.show()
  }

  // async agregarCargo() {
  //   try {
  //     this.mostrar_carga_todo = true
  //     if (this.formCargo.invalid) {
  //       this.mostrar_carga_todo = false
  //       this.toaster.error(
  //         'Formulario incompleto',
  //         'Error',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         }
  //       );
  //       return
  //     }
  //     const categorias = [{ value: 'Categoria t1', key: 'categoria_t1' }, { value: 'Categoria t2', key: 'categoria_t2' }, { value: 'Categoria t3', key: 'categoria_t3' }, { value: 'Categoria t4', key: 'categoria_t4' }, { value: 'Categoria t5', key: 'categoria_t5' }]

  //     const fila = this.tablaCargos[this.filSel]

  //     for (let i = this.filSel; i < this.tablaCargos.length; i++) {
  //       const element = this.tablaCargos[i];

  //     }
  //     const obj: Cargo = {
  //       id_proyecto: this.idProyecto,
  //       id_area: fila.id_area,
  //       descripcion: this.descripcion.value.trim().toUpperCase(),
  //       abreviatura: this.abreviatura.value.trim().toUpperCase(),
  //       categoria_t1: 0,
  //       categoria_t2: 0,
  //       categoria_t3: 0,
  //       categoria_t4: 0,
  //       categoria_t5: 0,
  //       habilitado: 1,
  //       texto: '',
  //       ind_gp: 
  //     }
  //     for (const element of categorias) {
  //       if (element.value == this.categorias.value) {
  //         obj[element.key] = 1
  //       } else {
  //         obj[element.key] = 0
  //       }
  //     }
  //     const response = await this.recursosHumanosService.guardarCargoArea(obj)
  //     await this.listarCargosPorArea()
  //     this.cerrarModal()
  //     this.toaster.success(
  //       'Se agrego Correctamente',
  //       'Correcto',
  //       {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       }
  //     );
  //     this.mostrar_carga_todo = false
  //   } catch (error) {
  //     this.mostrar_carga_todo = false
  //     console.log(error)
  //     SwalService.error()
  //   }
  // }
  async agregarCargo() {
    try {
      this.mostrar_carga_todo = true;

      if (this.formCargo.invalid) {
        this.mostrar_carga_todo = false;
        this.toaster.error(
          'Formulario incompleto',
          'Error',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return;
      }

      const categorias = [
        { value: 'Categoria t1', key: 'categoria_t1' },
        { value: 'Categoria t2', key: 'categoria_t2' },
        { value: 'Categoria t3', key: 'categoria_t3' },
        { value: 'Categoria t4', key: 'categoria_t4' },
        { value: 'Categoria t5', key: 'categoria_t5' }
      ];

      const fila = this.tablaCargos[this.filSel];
      const idAreaActual = fila.id_area;

      // --- CÁLCULO DEL IND_GP CORRELATIVO ---
      // 1. Filtramos todos los cargos existentes en la tabla que pertenezcan a la misma área
      const cargosDeEstaArea = this.tablaCargos.filter(
        item => item.id_area === idAreaActual && item.id_cargo
      );

      // 2. Buscamos el mayor "ind_gp" registrado actualmente en esos cargos
      let maxIndGp = 0;
      cargosDeEstaArea.forEach(item => {
        const val = Number(item.ind_gp);
        if (!isNaN(val) && val > maxIndGp) {
          maxIndGp = val;
        }
      });

      // 3. El nuevo cargo toma el número siguiente (si no hay ninguno anterior, empezará en 1)
      const nuevoIndGp = maxIndGp + 1;

      // Construimos el objeto del nuevo Cargo
      const obj: any = { // Usamos 'any' o tu interfaz 'Cargo' adaptada para soportar ind_gp
        id_proyecto: this.idProyecto,
        id_area: idAreaActual,
        descripcion: this.descripcion.value.trim().toUpperCase(),
        abreviatura: this.abreviatura.value.trim().toUpperCase(),
        categoria_t1: 0,
        categoria_t2: 0,
        categoria_t3: 0,
        categoria_t4: 0,
        categoria_t5: 0,
        habilitado: 1,
        texto: '',
        ind_gp: nuevoIndGp // <-- ASIGNACIÓN DEL ÍNDICE CORRELATIVO CALCULADO
      };

      // Mapeamos el flag de la categoría seleccionada
      for (const element of categorias) {
        if (element.value === this.categorias.value) {
          obj[element.key] = 1;
        } else {
          obj[element.key] = 0;
        }
      }

      // Enviamos a la base de datos
      const response = await this.recursosHumanosService.guardarCargoArea(obj);

      // Refrescamos y cerramos
      await this.listarCargosPorArea();
      this.cerrarModal();

      this.toaster.success(
        'Se agregó Correctamente',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.error(error);
      SwalService.error();
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
        texto: row.texto ? row.texto : '',
        ind_gp: row.ind_gp
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

  cerrarModal2() {
    this.formSubmitted = false;
    this.modalUsuario.hide()
    this.formUsuario.reset();
    while (this.asignaciones.length) this.asignaciones.removeAt(0);
    this.cargosPorFila = [];
    this.tiposPorFila = [];
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
      const row = this.tablaUsuarios[this.filUsuario]
      if (this.dni.value !== row.dni) {
        const resp = await this.recursosHumanosService.verificarDniUsuario(obj2)
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
        }

      } else {
        const objUsuario = {
          id_usuario: this.id_user.value,
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

        let elementos_actualizar = []
        let elementos_agregar = []
        for (const element of this.asignaciones.value) {
          let numeroTipo = 0;
          if (element.tipo_cargo) {
            const match = element.tipo_cargo.match(/\d+$/); // Busca números al final
            numeroTipo = match ? parseInt(match[0]) : 0;
            element.tipo_cargo = numeroTipo
          }
          if (element.id_asignacion !== null) {
            elementos_actualizar.push(element)
          } else {
            elementos_agregar.push(element)
          }
        }
        const idsEliminar = this.id_asig_eliminar || [];
        const payload = {
          ...objUsuario,
          asignaciones_actualizar: elementos_actualizar,
          asignaciones_agregar: elementos_agregar,
          id_asignaciones_eliminar: idsEliminar
        };


        // Llamar al endpoint unificado
        const response = await this.recursosHumanosService.actualizarUsuarioCompleto(payload)
        if (response[0]) {
          this.cerrarModal2()
          this.tablaUsuarios[this.filUsuario].nombres = objUsuario.nombres
          this.tablaUsuarios[this.filUsuario].apellidos = objUsuario.apellidos
          this.tablaUsuarios[this.filUsuario].dni = objUsuario.dni
          this.tablaUsuarios[this.filUsuario].telefono = objUsuario.telefono
          this.tablaUsuarios[this.filUsuario].correo = objUsuario.correo
          this.tablaUsuarios[this.filUsuario].fecha_asignacion = objUsuario.fecha_asignacion
          this.tablaUsuarios[this.filUsuario].fecha_culminacion = objUsuario.fecha_culminacion
          this.tablaUsuarios[this.filUsuario].estado = objUsuario.estado == 1 ? true : false
          const i = this.filUsuario
          this.filUsuario = null
          await this.listarAsignacionesUsuario(i)
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
        this.mostrar_carga_todo = false
      }
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  async agregarUsuario() {
    try {
      // Marcar todo como touched
      this.formSubmitted = true;
      this.formUsuario.markAllAsTouched();
      this.marcarAsignacionesTouched();

      // Recalcular solapamientos
      this.haySolapamiento();

      await new Promise(resolve => setTimeout(resolve, 10));

      if (this.formUsuario.invalid) {
        this.toaster.error('Formulario incompleto o datos no validos', 'Error');
        return;
      }

      if (this.haySolapamiento()) {
        this.toaster.error('Existen solapamiento en fechas de las asignaciones', 'Error');
        return;
      }

      this.mostrar_carga_todo = true;

      // Verificar si el DNI ya existe
      const obj2 = {
        id_proyecto: this.idProyecto,
        dni: this.dni.value
      };

      const resp = await this.recursosHumanosService.verificarDniUsuario(obj2);

      if (resp?.length) {
        this.dni.setErrors({ incorrect: true });
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
        const fechiniProy = this.tabproyecto.value.aspectos_generales.datos_recuperado.fecha_inicio?.split('T')[0];
        const fechfinProy = this.tabproyecto.value.aspectos_generales.datos_recuperado.fecha_culmina?.split('T')[0];


        // Ahora compara correctamente
        if (fechiniProy > this.fecha_asignacion.value || fechfinProy < this.fecha_culminacion.value) {
          const sw = await SwalService.confirm('Esta seguro?', 'Se registrara al usuario con fechas fuera del margen del proyecto');
          if (sw.isConfirmed) {
            // Continuar con el registro
          } else {
            this.mostrar_carga_todo = false;
            return;
          }
        }
        const asignaciones = [];
        for (const element of this.asignaciones.value) {
          let numeroTipo = 0;
          if (element.tipo_cargo) {
            const match = element.tipo_cargo.match(/\d+$/); // Busca números al final
            numeroTipo = match ? parseInt(match[0]) : 0;
          }
          const obj = {
            id_area: element.id_area,
            id_cargo: element.id_cargo,
            tipo_cargo: numeroTipo,
            fecha_inicio: element.fecha_inicio,
            fecha_fin: element.fecha_fin,
            estado: 1,
          };
          asignaciones.push(obj);
        }

        // Datos del usuario
        const usuarioData = {
          id_proyecto: this.idProyecto,
          nombres: this.nombres.value,
          apellidos: this.apellidos.value,
          dni: this.dni.value,
          telefono: this.telefono.value || '',
          correo: this.correo.value || '',
          fecha_asignacion: this.fecha_asignacion.value,
          fecha_culminacion: this.fecha_culminacion.value,
          estado: 1,
          asignaciones: asignaciones // Array de asignaciones
        };

        // Llamar al nuevo servicio que guarda usuario con asignaciones
        const response = await this.recursosHumanosService.guardarUsuarioConAsignaciones(usuarioData);
        if (response && response.success) {
          this.cerrarModal2();
          const i = this.filUsuario
          this.filUsuario = null
          await this.listarAsignacionesUsuario(i)
          this.toaster.success(
            'Se guardó correctamente el usuario y sus asignaciones',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            }
          );
          await this.generarTablaUsuarios();
        }

      }
      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.log(error);
      SwalService.error();
    }
  }

  marcarAsignacionesTouched() {
    for (let i = 0; i < this.asignaciones.length; i++) {
      const formGroup = this.asignaciones.at(i) as UntypedFormGroup;
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
    }
  }

  mostrarError(asig: FormGroup, campo: string): boolean {
    const control = asig.get(campo);
    if (!control) return false;

    // Mostrar error si el campo es inválido Y (está tocado O se intentó guardar)
    const debeMostrar = control.touched || control.dirty || this.formSubmitted;

    return control.invalid && debeMostrar;
  }

  mostrarErrorSolapamiento(asig: FormGroup, campo: string): boolean {
    const control = asig.get(campo);
    if (!control) return false;

    return control.hasError('causaSolapamiento') && (control.touched || control.dirty || this.formSubmitted);
  }

  cerrarModalPostUsu() {
    this.modalPostulanteUsuario.hide()
  }

  seleccionFilaPostApro(i) {
    this.filPostAprobados = i
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

  cerrarModalAsignacion() {
    this.modalAsignacion.hide()
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

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
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

  async cerraModalQr() {
    this.modalQRAsignacion.hide()
    this.qrData = ''
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
      const fechaActual = new Date();
      const fechaFormateada = fechaActual.toISOString().split('T')[0];
      this.fechaConvocatoria.setValue(fechaFormateada);
      this.duracionConvocatoria.setValue(1);
      this.fecha_culmina_convocatoria.setValue(fechaFormateada);
    }
    this.modalConvocatoria.show()
    this.mostrar_carga_todo = false
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

  async cerrarModalDetalleConvocatoria() {
    this.modalDetalleConvocatoria.hide()
  }

  cambioSelectAreaDetalle(select) {
    this.cargosFiltrados = this.cargos.filter(ele => Number(ele.id_area) == Number(this.id_area_detalle_conv.value))
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

  cerrarModalPostulante() {
    this.modalPostulante.hide()
  }

  cambioValorEntrevista() {
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().split('T')[0];
    this.fecha_postulante.setValue(fechaFormateada)
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
            descuentos: '0|10|10|0|100|100|0|0|0|0|0|0|0|0|0|100|100|0|0|0|0|0|0',
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

  async sliderFeriado(row, i, event) {
    try {


      this.mostrar_carga_todo = true

      let areasIncluidas = row.areas ? row.areas?.split('|').map(Number) : []

      if (event.target.checked) {
        if (!areasIncluidas.includes(this.areaSelecHorarios)) {
          areasIncluidas.push(this.areaSelecHorarios)
        }
      } else {
        if (areasIncluidas.includes(this.areaSelecHorarios)) {
          areasIncluidas = areasIncluidas.filter(area => area !== this.areaSelecHorarios)
        }
      }
      row.areas = areasIncluidas.join('|')

      const obj = {
        id_feriado: row.id_feriado,
        id_proyecto: row.id_proyecto,
        areas: row.areas,
        fecha_asignacion: (row.fecha).split('T')[0],
        descripcion: row.descripcion,
      }
      const response = await this.recursosHumanosService.actualizarFeriadoRecursosHumanos(obj)
      if (response) {
        this.toaster.success(
          'Se actualizo correctamente',
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
      console.log(error)
      this.mostrar_carga_todo = false
      SwalService.error()
    }
  }

  async cambioAreaPres() {
    this.cargosFiltradosPres = []
    this.cargosFiltradosPres = this.cargos.filter(ele => ele.id_area == this.areaSeleccionadaPres)

    await this.listarPresAnaliticoArea();
  }

  async listarPresAnaliticoArea() {
    try {
      this.mostrar_carga_todo = true;
      this.tablaPresAnalitico = [];
      this.tablaPresAnaliticoFooter = [];
      // this.horasJornal = 8
      if (this.cargosFiltradosPres.length === 0) {
        console.warn('No hay cargos configurados');
        return;
      }

      const obj = {
        id_proyecto: this.idProyecto,
        id_area: this.areaSeleccionadaPres
      };

      const resp2 = await this.recursosHumanosService.listarPresAnaliticoRH(obj);
      let array = [];
      let array2 = [];
      resp2.forEach(element => {
        let cargos = [];
        if (element.cargos) {
          cargos = this.convertirStringACargoFila(element.cargos);
        } else {
          cargos = this.getCargosPorDefecto();
        }
        const fila: filaPresAnalitico = {
          abreviatura: element.abreviatura,
          descripcion: element.descripcion,
          formula: element.formula,
          id_area: element.id_area,
          id_presupuesto: element.id_presupuesto,
          id_proyecto: element.id_proyecto,
          item: element.item,
          cargos: cargos
        };
        if (element.item.includes('0-')) {

          array2.push(fila)
        } else {
          array.push(fila);
        }
      });


      this.tablaPresAnalitico = array;
      // await this.recalcularTodasFormulas();
      this.tablaPresAnaliticoFooter = array2
      this.mostrar_carga_todo = false;

    } catch (error) {
      console.log(error);
      SwalService.error();
      this.mostrar_carga_todo = false;
    }
  }

  convertirStringACargoFila(cadena: string): cargoFila[] {
    if (!cadena || cadena.trim() === '') return [];

    return cadena
      .split('|') // Separar por pipe
      .filter(item => item.trim() !== '') // Filtrar items vacíos
      .map(item => {
        const partes = item.split('/');
        const id_cargo = parseInt(partes[0].trim(), 10);

        if (isNaN(id_cargo)) return null;

        // Inicializar valores por defecto
        let porcentaje: number | null = null;
        let parcial: number = 0;

        // Analizar según la cantidad de partes
        if (partes.length === 3) {
          // Formato: id/porcentaje/parcial
          if (partes[1].trim() !== '') {
            porcentaje = parseFloat(partes[1].trim());
          }
          if (partes[2].trim() !== '') {
            parcial = parseFloat(partes[2].trim());
          }
        } else if (partes.length === 2) {
          // Formato: id/porcentaje o id//parcial
          if (partes[1].trim() === '') {
            // Formato: id// (solo ID)
            porcentaje = null;
            parcial = 0;
          } else if (partes[1].includes('.')) {
            // Si contiene punto decimal, es porcentaje
            porcentaje = parseFloat(partes[1].trim());
          } else {
            // Es parcial
            parcial = parseFloat(partes[1].trim());
          }
        } else if (partes.length === 1) {
          // Solo ID
          porcentaje = null;
          parcial = 0;
        }

        return {
          id_cargo: id_cargo,
          porcentaje: porcentaje,
          parcial: parcial
        };
      })
      .filter(cargo => cargo !== null) as cargoFila[];
  }

  getCargosPorDefecto() {
    return this.cargosFiltradosPres.map(cargo => ({
      id_cargo: cargo.id,
      porcentaje: null,
      parcial: 0
    }));
  }

  agregarFila() {
    const cargos: cargoFila[] = this.cargosFiltradosPres.map(ele => { return { id_cargo: ele.id_cargo, porcentaje: null, parcial: 0 } })
    const fil: filaPresAnalitico = {
      abreviatura: '',
      cargos: JSON.parse(JSON.stringify(cargos)),
      descripcion: '',
      formula: '',
      id_area: this.areaSeleccionadaPres,
      id_presupuesto: null,
      id_proyecto: this.idProyecto,
      item: (this.tablaPresAnalitico.length + 1).toString()
    }
    let arrayGuardar = []
    if (!this.tablaPresAnalitico.length) {
      const categorias = ['JORNAL DIARIO', 'JORNAL HORARIO', 'JORNAL CATEGORIA 1', 'JORNAL CATEGORIA 2', 'JORNAL CATEGORIA 3', 'JORNAL CATEGORIA 4', 'JORNAL CATEGORIA 5']
      let i = 0
      for (const element of categorias) {
        var fila: filaPresAnalitico = {
          abreviatura: '',
          cargos: JSON.parse(JSON.stringify(cargos)),
          descripcion: element,
          formula: element == 'JORNAL HORARIO' ? '8' : '',
          id_area: this.areaSeleccionadaPres,
          id_presupuesto: null,
          id_proyecto: this.idProyecto,
          item: ('0-' + i).toString()
        }
        i++
        arrayGuardar.push(fila)
      }
    }
    arrayGuardar.push(fil)
    this.guardarPresAnaliticoRH(arrayGuardar)
  }

  async guardarPresAnaliticoRH(array = []) {
    try {
      this.mostrar_carga_todo = true
      let arrayGuardar = []
      for (const fila of array) {
        const cargos = this.convertirCargosAString(fila.cargos)
        const obj = {
          id_proyecto: this.idProyecto,
          id_area: this.areaSeleccionadaPres,
          item: fila.item,
          descripcion: fila.descripcion,
          abreviatura: fila.abreviatura,
          formula: fila.formula,
          cargos: cargos
        }

        arrayGuardar.push(obj)
      }
      const response = await this.recursosHumanosService.guardarPresAnaliticoRH(arrayGuardar)
      if (response?.length > 1) {
        await this.listarPresAnaliticoArea()
        // this.tablaFiltrada = []
        // this.totalMes = 0
        // this.cantidadUsuariosDia = []
      } else if (response?.length == 1 && arrayGuardar.length == 1) {
        const itemABuscar = arrayGuardar[0].item;
        const index = this.tablaPresAnalitico.findIndex(ele => ele.item == itemABuscar);

        if (index !== -1) {
          this.tablaPresAnalitico[index].id_presupuesto = response[0].id_presupuesto;
        } else {
          console.warn(`No se encontró el elemento con item: ${itemABuscar}`);
        }
        // this.tablaFiltrada = []
        // this.totalMes = 0
        // this.cantidadUsuariosDia = []
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

  convertirCargosAString(cargos: cargoFila[]): string {
    if (!cargos || cargos.length === 0) return '';
    return cargos
      .map(cargo => {
        let porcentaje = cargo.porcentaje ?? '';
        let parcial = cargo.parcial ?? '';

        if (typeof porcentaje === 'number' && Number.isNaN(porcentaje)) {
          porcentaje = '';
        }

        if (typeof parcial === 'number' && Number.isNaN(parcial)) {
          parcial = '';
        }

        return `${cargo.id_cargo}/${porcentaje}/${parcial}`;
      })
      .join('|');
  }

  async eliminarFila() {
    if (this.filPresAna === undefined || this.filPresAna === null) {
      SwalService.error('No hay fila seleccionada para eliminar');
      return;
    }

    try {
      const elementoAEliminar = this.tablaPresAnalitico[this.filPresAna];
      if (!elementoAEliminar) {
        SwalService.error('No se encontró el elemento a eliminar');
        return;
      }
      const abreviaturaEliminar = elementoAEliminar.abreviatura;
      const itemEliminar = elementoAEliminar.item;
      const idPresupuestoEliminar = elementoAEliminar.id_presupuesto;
      const actualizaciones: any[] = [];
      const abreviaturasLimpieza = [abreviaturaEliminar];
      const formulasActualizadas = new Set<string>();
      const maxProfundidad = 10;
      let profundidad = 0;

      while (abreviaturasLimpieza.length > 0 && profundidad < maxProfundidad) {
        profundidad++;
        const abreviaturaActual = abreviaturasLimpieza.shift()!;
        this.tablaPresAnalitico.forEach((elemento, index) => {
          if (index === this.filPresAna) return; // Saltar el elemento que se eliminará

          if (elemento.formula && this.formulaContieneAbreviatura(elemento.formula, abreviaturaActual)) {
            if (abreviaturaActual === abreviaturaEliminar) {
              actualizaciones.push({
                id_presupuesto: elemento.id_presupuesto,
                item: elemento.item,
                descripcion: elemento.descripcion,
                abreviatura: elemento.abreviatura,
                formula: '', // Fórmula vacía
                cargos: elemento.cargos || this.getCargosPorDefecto()
              });

              formulasActualizadas.add(elemento.abreviatura);

              if (!abreviaturasLimpieza.includes(elemento.abreviatura) &&
                !formulasActualizadas.has(elemento.abreviatura)) {
                abreviaturasLimpieza.push(elemento.abreviatura);
              }
            }
            else {
              const nuevaFormula = this.limpiarFormula(elemento.formula, abreviaturaActual);
              const formulaEsValida = this.esFormulaValida(nuevaFormula);

              actualizaciones.push({
                id_presupuesto: elemento.id_presupuesto,
                item: elemento.item,
                descripcion: elemento.descripcion,
                abreviatura: elemento.abreviatura,
                formula: formulaEsValida ? nuevaFormula : '',
                cargos: elemento.cargos || this.getCargosPorDefecto()
              });

              formulasActualizadas.add(elemento.abreviatura);

              // Si la fórmula quedó inválida, propagar el efecto
              if (!formulaEsValida) {
                if (!abreviaturasLimpieza.includes(elemento.abreviatura) &&
                  !formulasActualizadas.has(elemento.abreviatura)) {
                  abreviaturasLimpieza.push(elemento.abreviatura);
                }
              }
            }
          }
        });

      }

      // 4. Eliminar duplicados en actualizaciones (mantener la última)
      const actualizacionesUnicas = [];
      const idsProcesados = new Set();

      for (let i = actualizaciones.length - 1; i >= 0; i--) {
        const act = actualizaciones[i];
        if (!idsProcesados.has(act.id_presupuesto)) {
          actualizacionesUnicas.unshift(act);
          idsProcesados.add(act.id_presupuesto);
        }
      }


      // 5. Recalcular todas las fórmulas (después de limpiar las dependencias)
      this.recalcularTodasFormulas();

      // 6. Reordenar items si es necesario
      if (itemEliminar) {
        // Obtener todos los items mayores al que se elimina
        const elementosReordenar = this.tablaPresAnalitico
          .filter((elemento, index) => {
            if (index === this.filPresAna) return false;
            const itemNum = parseInt(elemento.item);
            const itemEliminarNum = parseInt(itemEliminar);
            return !isNaN(itemNum) && !isNaN(itemEliminarNum) && itemNum > itemEliminarNum;
          })
          .sort((a, b) => parseInt(a.item) - parseInt(b.item));


        // Actualizar items
        elementosReordenar.forEach((elemento, index) => {
          const nuevoItem = (parseInt(itemEliminar) + index).toString();

          // Verificar si ya existe una actualización para este elemento
          const idxActualizacion = actualizacionesUnicas.findIndex(
            a => a.id_presupuesto === elemento.id_presupuesto
          );

          if (idxActualizacion !== -1) {
            // Actualizar item en la actualización existente
            actualizacionesUnicas[idxActualizacion].item = nuevoItem;
          } else {
            // Agregar nueva actualización - MANTENER LOS CARGOS
            actualizacionesUnicas.push({
              id_presupuesto: elemento.id_presupuesto,
              item: nuevoItem,
              descripcion: elemento.descripcion,
              abreviatura: elemento.abreviatura,
              formula: elemento.formula || '',
              cargos: elemento.cargos || this.getCargosPorDefecto()
            });
          }
        });
      }

      // 7. Preparar request para backend
      const request = {
        id_presupuesto: idPresupuestoEliminar,
        id_proyecto: this.idProyecto,
        id_area: this.areaSeleccionadaPres,
        actualizaciones: actualizacionesUnicas
      };


      // 8. Enviar al backend
      SwalService.confirm(
        '¿Está seguro de eliminar este registro?',
        'Esta acción eliminará el registro y actualizará ' + actualizacionesUnicas.length + ' registros relacionados.'
      ).then(async (result) => {
        if (result.isConfirmed) {
          this.mostrar_carga_todo = true;

          try {
            const response = await this.recursosHumanosService.eliminarYActualizarPresAnaliticoRH(request);

            if (response.success) {
              // Eliminar localmente la fila
              this.tablaPresAnalitico.splice(this.filPresAna, 1);

              // Actualizar items localmente
              this.actualizarItemsLocalmente();

              // Recalcular fórmulas después de eliminar
              this.recalcularTodasFormulas();

              SwalService.success(response.message);
              this.filPresAna = undefined;
              // this.tablaFiltrada = []
              // this.totalMes = 0
              // this.cantidadUsuariosDia = []
            } else {
              SwalService.error(response.message || 'Error al eliminar el registro');
            }
          } catch (error) {
            console.error('Error:', error);
            SwalService.error('Error al procesar la eliminación');
          } finally {
            this.mostrar_carga_todo = false;
          }
        }
      });

    } catch (error) {
      console.error('Error en eliminación:', error);
      SwalService.error('Error al preparar la eliminación');
    }
  }

  formulaContieneAbreviatura(formula: string, abreviatura: string): boolean {
    if (!formula || !abreviatura) return false;
    const patron = `(?:%\\*?|\\b)${abreviatura}\\b`;
    const regex = new RegExp(patron, 'g');
    const contiene = regex.test(formula);
    return contiene;
  }

  limpiarFormula(formula: string, abreviatura: string): string {
    if (!formula || !abreviatura) return formula || '';


    let nuevaFormula = formula;

    // 1. Eliminar %*ABREV (patrón con asterisco)
    const regexPorcentajeAsterisco = new RegExp(`%\\*${abreviatura}\\b`, 'g');
    nuevaFormula = nuevaFormula.replace(regexPorcentajeAsterisco, '');

    // 2. Eliminar %ABREV (patrón sin asterisco)
    const regexPorcentaje = new RegExp(`%${abreviatura}\\b`, 'g');
    nuevaFormula = nuevaFormula.replace(regexPorcentaje, '');

    // 3. Eliminar ABREV (solo cuando es palabra completa)
    const regexSolo = new RegExp(`\\b${abreviatura}\\b`, 'g');
    nuevaFormula = nuevaFormula.replace(regexSolo, '');

    // 4. Manejar casos especiales con paréntesis
    // Eliminar (ABREV), (%ABREV), (%*ABREV)
    const regexParentesis = new RegExp(`\\(\\s*%?\\*?${abreviatura}\\s*\\)`, 'g');
    nuevaFormula = nuevaFormula.replace(regexParentesis, '()');

    // 5. Limpiar la fórmula resultante
    const resultado = this.limpiarFormulaResultante(nuevaFormula);

    return resultado;
  }

  esFormulaValida(formula: string): boolean {
    if (!formula || formula.trim() === '') {
      return false;
    }

    // Verificar que no contenga solo operadores
    if (/^[+\-*/]+$/.test(formula.replace(/\s+/g, ''))) {
      return false;
    }

    // Verificar que sea una expresión matemática válida o tenga referencias
    return this.esExpresionMatematica(formula) || /[A-Z]{2,}/.test(formula);
  }

  async recalcularTodasFormulas(soloFooter = false) {
    if (!soloFooter) {
      await this.formulaEvaluator.evaluarTodasFormulas(this.tablaPresAnalitico);
    }

    const acumulados: cargoFila[] = Object.values(
      this.tablaPresAnalitico.reduce((acc, element) => {
        element.cargos.forEach(ele => {
          const id = ele.id_cargo;
          if (!acc[id]) {
            acc[id] = {
              id_cargo: id,
              parcial: 0,
              porcentaje: null
            };
          }
          // Redondear acumulación también
          const parcialRedondeado = parseFloat((ele.parcial || 0).toFixed(3));
          acc[id].parcial! += parcialRedondeado;
        });
        return acc;
      }, {} as { [key: number]: cargoFila })
    );

    // Redondear los acumulados también
    acumulados.forEach(cargo => {
      if (cargo.parcial !== null && cargo.parcial !== undefined) {
        cargo.parcial = parseFloat(cargo.parcial.toFixed(3));
      }
    });

    let i = 0;
    let acumuladosCalculados: cargoFila[] = [];


    for (const element of this.tablaPresAnaliticoFooter) {
      if (i == 0) {
        // Caso 0: copiar los acumulados directamente
        element.cargos = JSON.parse(JSON.stringify(acumulados));
        acumuladosCalculados = JSON.parse(JSON.stringify(acumulados));
        // Asegurar que todos los parciales estén redondeados
        element.cargos.forEach(cargo => {
          if (cargo.parcial !== null && cargo.parcial !== undefined) {
            cargo.parcial = parseFloat(cargo.parcial.toFixed(3));
          }
        });
      } else if (i == 1) {
        // Caso 1: dividir todos por las horas
        const horas = element?.formula ? Number(element?.formula) : 1;
        const a = acumulados.map(ele => {
          let parcial = ele.parcial || 0;
          if (horas !== 0) {
            parcial = parcial / horas;
          }
          return {
            ...ele,
            parcial: parcial !== null && parcial !== undefined
              ? parseFloat(parcial.toFixed(3))
              : null
          };
        });
        element.cargos = a;
      } else {
        let k = 0;
        for (const cargo of element.cargos) {
          if (cargo.porcentaje) {

            if (acumuladosCalculados[k]?.parcial != null &&
              cargo?.porcentaje != null &&
              cargo.porcentaje !== 0) {

              // Calcular con 6 decimales para precisión y luego redondear a 3
              const calculo = acumuladosCalculados[k].parcial * (cargo.porcentaje / 100);
              cargo.parcial = parseFloat(calculo.toFixed(3));
            } else {
              cargo.parcial = null;
            }

          } else if (!cargo.porcentaje && !acumuladosCalculados[k]?.parcial) {
            cargo.parcial = null;
          } else if (!cargo.porcentaje && acumuladosCalculados[k]?.parcial != null) {
            // Si no hay porcentaje pero sí hay acumulado, mantener el acumulado redondeado
            cargo.parcial = parseFloat((acumuladosCalculados[k].parcial || 0).toFixed(3));
          }
          k++;
        }
      }
      i++;
    }

  }

  actualizarItemsLocalmente() {
    // Ordenar por item numérico
    this.tablaPresAnalitico.sort((a, b) => {
      const itemA = parseInt(a.item) || 0;
      const itemB = parseInt(b.item) || 0;
      return itemA - itemB;
    });

    // Renumerar items
    this.tablaPresAnalitico.forEach((elemento, index) => {
      elemento.item = (index + 1).toString();
    });
  }

  limpiarFormulaResultante(formula: string): string {
    if (!formula) return '';

    let limpia = formula.trim();

    // Si la fórmula ya está vacía, retornar string vacío
    if (!limpia) return '';

    // 1. Eliminar paréntesis vacíos
    limpia = limpia.replace(/\(\s*\)/g, '');

    // 2. Eliminar operadores duplicados
    limpia = limpia
      .replace(/\+\s*\+/g, '+')
      .replace(/\-\s*\-/g, '-')
      .replace(/\*\s*\*/g, '*')
      .replace(/\/\s*\//g, '/')
      .replace(/\+\s*\-/g, '-')
      .replace(/\-\s*\+/g, '-');

    // 3. Eliminar operadores al inicio y final
    limpia = limpia.replace(/^\s*[+\-*/]\s*|\s*[+\-*/]\s*$/g, '');

    // 4. Simplificar expresiones matemáticas si es posible
    if (this.esExpresionMatematica(limpia)) {
      const resultadoSimplificado = this.simplificarExpresion(limpia);
      if (resultadoSimplificado !== null) {
        return resultadoSimplificado;
      }
    }

    // 5. Si después de limpiar queda solo espacios o nada, devolver string vacío
    const final = limpia.trim();
    return final || '';
  }

  esExpresionMatematica(expresion: string): boolean {
    if (!expresion) return false;
    // Verificar que solo contenga números, operadores, paréntesis y puntos decimales
    return /^[\d\s+\-*/().]+$/.test(expresion);
  }

  simplificarExpresion(expresion: string): string | null {
    try {
      // Limpiar la expresión
      const sinEspacios = expresion.replace(/\s+/g, '');

      // Verificar si es válida
      if (!sinEspacios || /^[+\-*/]+$/.test(sinEspacios)) {
        return '';
      }

      // Eliminar operadores duplicados consecutivos
      const sinDuplicados = sinEspacios.replace(/([+\-*/])\1+/g, '$1');

      // Eliminar operadores al inicio/final
      const limpiaFinal = sinDuplicados.replace(/^[+\-*/]+|[+\-*/]+$/g, '');

      if (!limpiaFinal) {
        return '';
      }

      // Intentar evaluar
      const evaluar = new Function('return ' + limpiaFinal);
      const resultado = evaluar();

      // Verificar que el resultado sea un número válido
      if (typeof resultado === 'number' && !isNaN(resultado) && isFinite(resultado)) {
        // Redondear a 2 decimales
        return parseFloat(resultado.toFixed(2)).toString();
      }

      return null;
    } catch (e) {
      console.warn('Error al simplificar expresión:', e);
      return null;
    }
  }

  async moverFilaArriba() {
    // Validaciones: no hay selección, es la primera fila seleccionable (índice 1), o es índice 0
    if (this.filPresAna === null || this.filPresAna === undefined ||
      this.filPresAna <= 1) { // Cambiado de === 0 a <= 1
      return;
    }

    const indexActual = this.filPresAna;
    const indexNuevo = indexActual - 1;

    // Mover la fila
    const filaAMover = this.tablaPresAnalitico.splice(indexActual, 1)[0];
    this.tablaPresAnalitico.splice(indexNuevo, 0, filaAMover);

    // Renumerar todos los items
    await this.actualizarItemsSecuencialmente();

    // Actualizar selección
    this.filPresAna = indexNuevo;

    this.recalcularTodasFormulas();
    this.reiniciarContador();
  }

  private actualizarItemsSecuencialmente(): void {
    this.tablaPresAnalitico.forEach((fila, index) => {
      fila.item = (index + 1).toString();
    });
  }

  reiniciarContador() {
    this.contadorSegundos = 0;

    // Si ya hay un temporizador en curso, lo detenemos
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }

    // Creamos un nuevo temporizador
    this.temporizador = setTimeout(() => {
      this.actualizarPresAnaliticoRH();
      this.temporizador = null;
    }, this.tiempoLimiteSegundos * 1000);
  }

  async actualizarPresAnaliticoRH() {
    // Si ya hay una actualización en curso, salimos
    if (this.actualizacionEnCurso) {
      // console.log('Actualización ya en curso, ignorando...');
      return;
    }

    // Si hay un temporizador pendiente, lo cancelamos
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }

    try {
      this.actualizacionEnCurso = true;
      // console.log('Iniciando actualización...');

      // Preparar el array de registros
      let completo = []
      const registros = this.tablaPresAnalitico.map(fila => ({
        id_presupuesto: fila.id_presupuesto,
        id_proyecto: fila.id_proyecto,
        id_area: fila.id_area,
        item: fila.item,
        descripcion: fila.descripcion,
        abreviatura: fila.abreviatura,
        formula: fila.formula,
        cargos: this.convertirCargosAString(fila.cargos)
      }));

      const registros2 = this.tablaPresAnaliticoFooter.map(fila => ({
        id_presupuesto: fila.id_presupuesto,
        id_proyecto: fila.id_proyecto,
        id_area: fila.id_area,
        item: fila.item,
        descripcion: fila.descripcion,
        abreviatura: fila.abreviatura,
        formula: fila.formula,
        cargos: this.convertirCargosAString(fila.cargos)
      }));

      completo = registros.concat(registros2)
      // Solo enviar si hay registros
      if (completo.length > 0) {
        const response = await this.recursosHumanosService.actualizarPresAnaliticoRHLote(completo);
        if (response.success) {
          // console.log('Registros actualizados correctamente');
          // this.tablaFiltrada = []
          // this.totalMes = 0
          // this.cantidadUsuariosDia = []
        } else {
          SwalService.error(response.message || 'Error al actualizar registros');
        }
      }

    } catch (error) {
      console.error('Error:', error);
      SwalService.error('Error al actualizar los registros');
    } finally {
      // Siempre liberar el estado de actualización
      this.actualizacionEnCurso = false;
    }
  }

  async moverFilaAbajo() {
    // Validaciones: no hay selección, es la última fila, o es índice 0
    if (this.filPresAna === null || this.filPresAna === undefined ||
      this.filPresAna === 0 || // Añadido para evitar mover índice 0
      this.filPresAna >= this.tablaPresAnalitico.length - 1) {
      return;
    }

    const indexActual = this.filPresAna;
    const indexNuevo = indexActual + 1;

    // Mover la fila
    const filaAMover = this.tablaPresAnalitico.splice(indexActual, 1)[0];
    this.tablaPresAnalitico.splice(indexNuevo, 0, filaAMover);

    // Renumerar todos los items
    await this.actualizarItemsSecuencialmente();

    // Actualizar selección
    this.filPresAna = indexNuevo;

    this.recalcularTodasFormulas();
    this.reiniciarContador();
  }

  async eliminarAreaPresAnaliticoRH() {
    try {
      const sw = await SwalService.confirm('Esta seguro?', 'Se eliminaran los datos de presupuesto analitico del area')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true
        const obj = {
          id_proyecto: this.idProyecto,
          id_area: this.areaSeleccionadaPres
        }
        const resp = await this.recursosHumanosService.eliminarAreaPresAnaliticoRH(obj)
        if (resp) {
          this.tablaPresAnalitico = [];
          this.tablaPresAnaliticoFooter = []
          // this.tablaFiltrada = []
          // this.totalMes = 0
          // this.cantidadUsuariosDia = []
          this.toaster.success(
            'Se eliminaron correctamente los registros',
            'Correcto',
            {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000,
            }
          );
        }
        this.mostrar_carga_todo = false
      }
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  blurDescripcion(value, i) {
    const row = this.tablaPresAnalitico[i];
    if (row.descripcion !== value) {
      this.tablaPresAnalitico[i].descripcion = value;
      this.reiniciarContador();
    }
  }

  blurAbreviatura(valor, index) {
    if (valor == this.tablaPresAnalitico[index].abreviatura) {
      return;
    }

    const nuevaAbrev = valor.toUpperCase().trim();

    // Verificar si la abreviatura ya existe
    const existe = this.tablaPresAnalitico.some((fila, i) =>
      i !== index && fila.abreviatura === nuevaAbrev
    );

    if (existe) {
      alert(`La abreviatura "${nuevaAbrev}" ya existe`);
      return;
    }

    const viejaAbrev = this.tablaPresAnalitico[index].abreviatura;
    this.tablaPresAnalitico[index].abreviatura = nuevaAbrev;

    // Si cambió la abreviatura, recalcular dependencias
    if (viejaAbrev !== nuevaAbrev) {
      this.recalcularTodasFormulas();
      this.reiniciarContador();
    }
  }

  blurFormula(valor: string, index: number) {
    if (index === 0) return; // Fila base no tiene fórmula

    this.tablaPresAnalitico[index].formula = valor.toUpperCase();
    this.recalcularTodasFormulas();
    this.reiniciarContador();
  }

  blurporcentaje(valor, filaIndex, cargoIndex) {
    if (filaIndex === 0) return; // Fila base no tiene porcentajes

    const valorActual = this.tablaPresAnalitico[filaIndex].cargos[cargoIndex].porcentaje;
    const nuevoPorcentaje = parseFloat(valor) || 0;

    // Solo recalcular si realmente cambió
    if (valorActual !== nuevoPorcentaje) {
      this.tablaPresAnalitico[filaIndex].cargos[cargoIndex].porcentaje = nuevoPorcentaje;

      // Recalcular todas las fórmulas para actualizar dependencias
      this.recalcularTodasFormulas();
      this.reiniciarContador();
    }
  }

  blurparcial(valor, filaIndex, cargoIndex) {
    const valorActual = this.tablaPresAnalitico[filaIndex].cargos[cargoIndex].parcial;
    const nuevoParcial = parseFloat(valor) || 0;

    if (valorActual !== nuevoParcial) {
      this.tablaPresAnalitico[filaIndex].cargos[cargoIndex].parcial = nuevoParcial;
      this.tablaPresAnalitico[filaIndex].formula = '';
      this.recalcularTodasFormulas(true);
      this.reiniciarContador();
    }
  }

  blurHoraJornal(value, i) {
    if (value == '') {
      this.toaster.success(
        'Debe de ser valor numerico hora jornada',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000,
        }
      );
      return;
    }
    const acumulados = this.tablaPresAnaliticoFooter[0].cargos
    if (value !== this.tablaPresAnaliticoFooter[i]?.formula) {
      this.tablaPresAnaliticoFooter[i].formula = value;
      let acumuladosCalculados = []
      for (const element of this.tablaPresAnaliticoFooter) {
        if (i == 0) {

        } else if (i == 1) {
          // Caso 1: dividir todos por las horas
          const horas = element?.formula ? Number(element?.formula) : 1;
          acumuladosCalculados = acumulados.map(ele => ({
            ...ele,
            parcial: (ele.parcial || 0) / horas
          }));
          element.cargos = acumuladosCalculados;
        } else {
          let k = 0
          for (const cargo of element.cargos) {
            if (cargo.porcentaje) {
              cargo.parcial =
                acumuladosCalculados[k]?.parcial == null ||
                  cargo?.porcentaje == null ||
                  cargo.porcentaje === 0
                  ? null
                  : acumuladosCalculados[k].parcial * (cargo.porcentaje / 100);
            } else if (!cargo.porcentaje && !acumuladosCalculados[k]?.parcial) {
              cargo.parcial = null
            }
          }


        }
      }
    }
  }

  blurporcentajeFooter(valor, filaIndex, cargoIndex) {
    // if (filaIndex === 0) return; // Fila base no tiene porcentajes
    const valorActual = this.tablaPresAnaliticoFooter[filaIndex].cargos[cargoIndex].porcentaje;
    const nuevoPorcentaje = parseFloat(valor) || 0;

    // Solo recalcular si realmente cambió
    if (valorActual !== nuevoPorcentaje) {
      this.tablaPresAnaliticoFooter[filaIndex].cargos[cargoIndex].porcentaje = nuevoPorcentaje;

      // Recalcular todas las fórmulas para actualizar dependencias
      this.recalcularTodasFormulas();
      this.reiniciarContador();
    }
  }

  blurparcialFooter(valor, filaIndex, cargoIndex) {
    const valorActual = this.tablaPresAnaliticoFooter[filaIndex].cargos[cargoIndex].parcial;
    const nuevoParcial = parseFloat(valor) || 0;

    if (valorActual !== nuevoParcial) {
      this.tablaPresAnaliticoFooter[filaIndex].cargos[cargoIndex].parcial = nuevoParcial;
      // this.tablaPresAnaliticoFooter[filaIndex].formula = '';
      this.recalcularTodasFormulas(true);
      this.reiniciarContador();
    }
  }

  revalidarTodo() {
    this.asignaciones.controls.forEach(control => {
      control.get('fecha_inicio')?.updateValueAndValidity();
      control.get('fecha_fin')?.updateValueAndValidity();
    });
  }

  // Crear una asignación
  crearAsignacion(data?: any): UntypedFormGroup {
    return new UntypedFormGroup({
      id_asignacion: new UntypedFormControl(data?.id_asignacion || null),
      id_area: new UntypedFormControl(data?.id_area || null, Validators.required),
      id_cargo: new UntypedFormControl({ value: data?.id_cargo || null, disabled: !data?.id_area }, Validators.required),
      tipo_cargo: new UntypedFormControl({ value: data?.tipo_cargo || null, disabled: !data?.id_cargo }, Validators.required),
      fecha_inicio: new UntypedFormControl(data?.fecha_inicio || null, [Validators.required, this.validaFecha.bind(this)]),
      fecha_fin: new UntypedFormControl(data?.fecha_fin || null, [Validators.required, this.validaFecha.bind(this)]),
      estado: new UntypedFormControl(data?.estado),
      id_usuario: new UntypedFormControl(data?.id_usuario)
    }, { validators: this.validaRangoFechas.bind(this) });
  }

  // Validación unificada para fechas (fuera de rango)
  validaFecha(control: any) {
    if (!control.value) return null;
    const fecha = moment(control.value);
    const inicio = this.formUsuario?.get('fecha_asignacion')?.value;
    const fin = this.formUsuario?.get('fecha_culminacion')?.value;

    if (inicio && fecha.isBefore(moment(inicio), 'day')) {
      return { fueraRango: true, mensaje: `Debe ser ≥ ${moment(inicio).format('DD/MM/YYYY')}` };
    }
    if (fin && fecha.isAfter(moment(fin), 'day')) {
      return { fueraRango: true, mensaje: `Debe ser ≤ ${moment(fin).format('DD/MM/YYYY')}` };
    }
    return null;
  }

  // Validación cruzada de fechas
  validaRangoFechas(group: UntypedFormGroup): ValidationErrors | null {
    const inicio = group.get('fecha_inicio')?.value;
    const fin = group.get('fecha_fin')?.value;

    if (inicio && fin && moment(inicio).isAfter(moment(fin))) {
      // Agregar error a los campos individuales también
      group.get('fecha_inicio')?.setErrors({ ...group.get('fecha_inicio')?.errors, fechaInvalida: true });
      group.get('fecha_fin')?.setErrors({ ...group.get('fecha_fin')?.errors, fechaInvalida: true });
      return { fechaInvalida: true };
    }

    // Limpiar errores si son válidos
    if (group.get('fecha_inicio')?.hasError('fechaInvalida')) {
      const errors = { ...group.get('fecha_inicio')?.errors };
      delete errors['fechaInvalida'];
      group.get('fecha_inicio')?.setErrors(Object.keys(errors).length ? errors : null);
    }
    if (group.get('fecha_fin')?.hasError('fechaInvalida')) {
      const errors = { ...group.get('fecha_fin')?.errors };
      delete errors['fechaInvalida'];
      group.get('fecha_fin')?.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }

  haySolapamiento(): boolean {
    // Limpiar errores anteriores
    this.limpiarErroresSolapamiento();

    const values = this.asignaciones.value;
    let tieneSolapamiento = false;

    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const a = values[i], b = values[j];

        if (a.fecha_inicio && a.fecha_fin && b.fecha_inicio && b.fecha_fin) {
          const inicioA = moment(a.fecha_inicio);
          const finA = moment(a.fecha_fin);
          const inicioB = moment(b.fecha_inicio);
          const finB = moment(b.fecha_fin);

          // Verificar solapamiento
          if (inicioA.isSameOrBefore(finB) && finA.isSameOrAfter(inicioB)) {
            tieneSolapamiento = true;

            // Marcar error en ambas filas
            const grupoA = this.asignaciones.at(i);
            const grupoB = this.asignaciones.at(j);

            grupoA.setErrors({ ...grupoA.errors, solapamiento: true });
            grupoB.setErrors({ ...grupoB.errors, solapamiento: true });

            // Marcar campos específicos
            if (inicioA.isBetween(inicioB, finB, null, '[]') || inicioB.isBetween(inicioA, finA, null, '[]')) {
              grupoA.get('fecha_inicio')?.setErrors({ ...grupoA.get('fecha_inicio')?.errors, causaSolapamiento: true });
              grupoB.get('fecha_inicio')?.setErrors({ ...grupoB.get('fecha_inicio')?.errors, causaSolapamiento: true });
            }

            if (finA.isBetween(inicioB, finB, null, '[]') || finB.isBetween(inicioA, finA, null, '[]')) {
              grupoA.get('fecha_fin')?.setErrors({ ...grupoA.get('fecha_fin')?.errors, causaSolapamiento: true });
              grupoB.get('fecha_fin')?.setErrors({ ...grupoB.get('fecha_fin')?.errors, causaSolapamiento: true });
            }
          }
        }
      }
    }

    return tieneSolapamiento;
  }

  marcarErrorSolapamientoEnCampos(grupoA: any, grupoB: any, a: any, b: any) {
    const inicioA = moment(a.fecha_inicio);
    const finA = moment(a.fecha_fin);
    const inicioB = moment(b.fecha_inicio);
    const finB = moment(b.fecha_fin);

    // Verificar qué fechas están causando el problema
    if (inicioA.isBetween(inicioB, finB, null, '[]')) {
      grupoA.get('fecha_inicio')?.setErrors({ ...grupoA.get('fecha_inicio')?.errors, causaSolapamiento: true });
    }
    if (finA.isBetween(inicioB, finB, null, '[]')) {
      grupoA.get('fecha_fin')?.setErrors({ ...grupoA.get('fecha_fin')?.errors, causaSolapamiento: true });
    }
    if (inicioB.isBetween(inicioA, finA, null, '[]')) {
      grupoB.get('fecha_inicio')?.setErrors({ ...grupoB.get('fecha_inicio')?.errors, causaSolapamiento: true });
    }
    if (finB.isBetween(inicioA, finA, null, '[]')) {
      grupoB.get('fecha_fin')?.setErrors({ ...grupoB.get('fecha_fin')?.errors, causaSolapamiento: true });
    }
  }

  agregarAsignacionFila() {
    const nuevaAsignacion = this.crearAsignacion();
    const nuevoIndex = this.asignaciones.length;
    this.asignaciones.push(nuevaAsignacion);
    this.cargosPorFila.push([]);
    this.tiposPorFila.push([]);

    // Suscribirse a cambios en la nueva fila
    this.suscribirACambiosFila(nuevaAsignacion, nuevoIndex);

    // Si ya se había intentado guardar, marcar como touched
    if (this.formSubmitted) {
      Object.keys(nuevaAsignacion.controls).forEach(key => {
        const control = nuevaAsignacion.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
    }

    setTimeout(() => this.haySolapamiento(), 0);
  }
  // Eliminar fila
  eliminarAsignacionFila(i: number) {
    const idAsignacion = this.asignaciones.at(i).get('id_asignacion')?.value;
    if (idAsignacion && idAsignacion !== null && idAsignacion !== '') {
      this.id_asig_eliminar.push(idAsignacion);
    }
    this.asignaciones.removeAt(i);
    this.cargosPorFila.splice(i, 1);
    this.tiposPorFila.splice(i, 1);
  }

  // Cambio de área
  // cambioAreaEnFila(i: number, event: any) {
  //   const idArea = event.target.value;
  //   const form = this.asignaciones.at(i);

  //   if (idArea) {
  //     this.cargosPorFila[i] = this.cargos.filter(c => Number(c.id_area) === Number(idArea));
  //     form.get('id_cargo')?.enable();
  //   } else {
  //     this.cargosPorFila[i] = [];
  //     form.get('id_cargo')?.disable();
  //     form.get('tipo_cargo')?.disable();
  //   }
  //   form.get('id_cargo')?.setValue('');
  //   form.get('tipo_cargo')?.setValue('');
  //   this.tiposPorFila[i] = [];
  // }

  cambioAreaEnFila(index: number, event: any) {
    const idArea = event.target.value;
    const asignacionGroup = this.asignaciones.at(index);

    if (idArea) {
      // Filtrar cargos por el área seleccionada
      this.cargosPorFila[index] = this.cargos.filter(
        cargo => Number(cargo.id_area) === Number(idArea)
      );

      // Habilitar el campo de cargo
      asignacionGroup.get('id_cargo')?.enable();
      asignacionGroup.get('id_cargo')?.reset();

      // Resetear y deshabilitar tipo_cargo hasta que se seleccione cargo
      asignacionGroup.get('tipo_cargo')?.reset();
      asignacionGroup.get('tipo_cargo')?.disable();
      this.tiposPorFila[index] = [];
    } else {
      this.cargosPorFila[index] = [];
      asignacionGroup.get('id_cargo')?.disable();
      asignacionGroup.get('id_cargo')?.reset();
      asignacionGroup.get('tipo_cargo')?.disable();
      asignacionGroup.get('tipo_cargo')?.reset();
      this.tiposPorFila[index] = [];
    }
  }

  // Cambio de cargo
  // cambioCargoEnFila(i: number, event: any) {
  //   const idCargo = event.target.value;
  //   const form = this.asignaciones.at(i);

  //   if (idCargo) {
  //     const cargo = this.cargosPorFila[i]?.find(c => Number(c.id_cargo) === Number(idCargo));
  //     if (cargo) {
  //       let categoria = 1;
  //       for (let t = 1; t <= 5; t++) {
  //         if (cargo[`categoria_t${t}`] === 1) categoria = t;
  //       }
  //       this.tiposPorFila[i] = this.tipos_cargos.filter(t => Number(t.slice(-1)) <= categoria);
  //       form.get('tipo_cargo')?.enable();
  //     }
  //   } else {
  //     this.tiposPorFila[i] = [];
  //     form.get('tipo_cargo')?.disable();
  //   }
  //   form.get('tipo_cargo')?.setValue('');
  // }

  cambioCargoEnFila(index: number, event: any) {
    const idCargo = event.target.value;
    const asignacionGroup = this.asignaciones.at(index);

    if (idCargo) {
      // Buscar el cargo seleccionado
      const cargo = this.cargosPorFila[index].find(c => Number(c.id_cargo) === Number(idCargo));

      if (cargo) {
        // Determinar la categoría máxima del cargo
        const tiposBuscar = ['categoria_t1', 'categoria_t2', 'categoria_t3', 'categoria_t4', 'categoria_t5'];
        let categoriaMaxima = 'categoria_t1';

        for (const tipo of tiposBuscar) {
          if (cargo[tipo] === 1) {
            categoriaMaxima = tipo;
          }
        }

        // Filtrar tipos permitidos (solo hasta la categoría máxima)
        const numeroCategoriaMaxima = parseInt(categoriaMaxima.charAt(categoriaMaxima.length - 1));
        this.tiposPorFila[index] = this.tipos_cargos.filter(tipo => {
          const numeroTipo = parseInt(tipo.charAt(tipo.length - 1));
          return numeroTipo <= numeroCategoriaMaxima;
        });

        // Habilitar y resetear el campo tipo_cargo
        asignacionGroup.get('tipo_cargo')?.enable();
        asignacionGroup.get('tipo_cargo')?.reset();
      }
    } else {
      this.tiposPorFila[index] = [];
      asignacionGroup.get('tipo_cargo')?.disable();
      asignacionGroup.get('tipo_cargo')?.reset();
    }
  }

  cargarAsignacionesExistentes(asignacionesExistentes: any[]) {
    // Limpiar filas existentes
    while (this.asignaciones.length) {
      this.asignaciones.removeAt(0);
    }
    this.cargosPorFila = [];
    this.tiposPorFila = [];

    // Agregar cada asignación existente
    asignacionesExistentes.forEach(asig => {

      // Asegurar que el tipo_cargo sea el string correcto
      let tipoCargoString = asig.tipo_cargo;
      if (typeof asig.tipo_cargo === 'number') {
        // Si es número (1,2,3), convertirlo a "Categoria t1", "Categoria t2", etc.
        tipoCargoString = this.tipos_cargos[asig.tipo_cargo - 1] || this.tipos_cargos[0];
      }

      const asignacionData = {
        ...asig,
        tipo_cargo: tipoCargoString,
        fecha_inicio: asig.fecha_inicio?.split('T')[0] || asig.fecha_inicio,
        fecha_fin: asig.fecha_fin?.split('T')[0] || asig.fecha_fin
      };
      const nuevaAsignacion = this.crearAsignacion(asignacionData);

      this.asignaciones.push(nuevaAsignacion);

      // Cargar cargos para esta área
      this.cargosPorFila.push(
        this.cargos.filter(cargo => Number(cargo.id_area) === Number(asig.id_area))
      );

      // Cargar tipos para este cargo
      const cargo = this.cargos.find(c => Number(c.id_cargo) === Number(asig.id_cargo));
      if (cargo) {
        const tiposBuscar = ['categoria_t1', 'categoria_t2', 'categoria_t3', 'categoria_t4', 'categoria_t5'];
        let categoriaMaxima = 'categoria_t1';

        for (const tipo of tiposBuscar) {
          if (cargo[tipo] === 1) {
            categoriaMaxima = tipo;
          }
        }

        const numeroCategoriaMaxima = parseInt(categoriaMaxima.charAt(categoriaMaxima.length - 1));
        const tiposDisponibles = this.tipos_cargos.filter(tipo => {
          const numeroTipo = parseInt(tipo.charAt(tipo.length - 1));
          return numeroTipo <= numeroCategoriaMaxima;
        });

        this.tiposPorFila.push(tiposDisponibles);

        // Si el tipo_cargo actual no está en los disponibles, actualizarlo
        const tipoActual = nuevaAsignacion.get('tipo_cargo')?.value;
        if (tipoActual && !tiposDisponibles.includes(tipoActual)) {
          nuevaAsignacion.get('tipo_cargo')?.setValue(tiposDisponibles[0] || null);
        }
      } else {
        this.tiposPorFila.push([]);
      }

      // Habilitar/deshabilitar campos según corresponda
      if (asig.id_area) {
        nuevaAsignacion.get('id_cargo')?.enable();
      }
      if (asig.id_cargo && cargo) {
        nuevaAsignacion.get('tipo_cargo')?.enable();
      }
    });
  }
  // Limpiar todos los errores de solapamiento
  private limpiarErroresSolapamiento() {
    this.asignaciones.controls.forEach(control => {
      // Limpiar error del grupo
      if (control.hasError('solapamiento')) {
        const errors = { ...control.errors };
        delete errors['solapamiento'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }

      // Limpiar errores de los campos de fecha
      const fechaInicio = control.get('fecha_inicio');
      const fechaFin = control.get('fecha_fin');

      if (fechaInicio?.hasError('causaSolapamiento')) {
        const errors = { ...fechaInicio.errors };
        delete errors['causaSolapamiento'];
        fechaInicio.setErrors(Object.keys(errors).length ? errors : null);
      }

      if (fechaFin?.hasError('causaSolapamiento')) {
        const errors = { ...fechaFin.errors };
        delete errors['causaSolapamiento'];
        fechaFin.setErrors(Object.keys(errors).length ? errors : null);
      }
    });
  }

  // Suscribirse a cambios en las fechas de una fila
  private suscribirACambiosFila(formGroup: UntypedFormGroup, index: number) {
    formGroup.get('fecha_inicio')?.valueChanges.subscribe(() => {
      setTimeout(() => this.haySolapamiento(), 0);
    });

    formGroup.get('fecha_fin')?.valueChanges.subscribe(() => {
      setTimeout(() => this.haySolapamiento(), 0);
    });
  }


  evaluarMargenes(valor: string) {
    // Obtener fechas del proyecto
    let fechiniProy = this.tabproyecto?.value?.aspectos_generales?.datos_recuperado?.fecha_inicio;
    let fechfinProy = this.tabproyecto?.value?.aspectos_generales?.datos_recuperado?.fecha_culmina;

    if (!fechiniProy || !fechfinProy) return '';

    const fechaCampo = this.formUsuario.get(valor)?.value;
    if (!fechaCampo) return '';

    // Función para normalizar fecha a YYYY-MM-DD (sin hora)
    const normalizarFecha = (fecha: string): string => {
      if (!fecha) return '';
      // Si es un objeto Date o string con T, tomar solo YYYY-MM-DD
      if (fecha.includes('T')) {
        return fecha.split('T')[0];
      }
      // Si ya está en formato YYYY-MM-DD
      if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return fecha;
      }
      // Si viene en otro formato, convertir
      return new Date(fecha).toISOString().split('T')[0];
    };

    // Normalizar todas las fechas
    const fechaInicioNorm = normalizarFecha(fechiniProy);
    const fechaFinNorm = normalizarFecha(fechfinProy);
    const fechaCampoNorm = normalizarFecha(fechaCampo);

    // console.log('Fechas normalizadas:', {
    //   fechaCampo: fechaCampoNorm,
    //   inicio: fechaInicioNorm,
    //   fin: fechaFinNorm,
    //   esMenor: fechaCampoNorm < fechaInicioNorm,
    //   esMayor: fechaCampoNorm > fechaFinNorm,
    //   esIgualInicio: fechaCampoNorm === fechaInicioNorm
    // });

    // Función para formatear a dd-mm-yyyy
    const formatearMostrar = (fechaStr: string): string => {
      if (!fechaStr) return '';
      const [anio, mes, dia] = fechaStr.split('-');
      return `${dia}-${mes}-${anio}`;
    };

    // Comparar
    if (fechaCampoNorm < fechaInicioNorm) {
      return `⚠️ La fecha es menor a ${formatearMostrar(fechaInicioNorm)} (inicio del proyecto)`;
    }

    if (fechaCampoNorm > fechaFinNorm) {
      return `⚠️ La fecha es mayor a ${formatearMostrar(fechaFinNorm)} (culminación del proyecto)`;
    }

    return '';
  }

  calcularValorConBono(porcentaje: any): number {
    const valor = Number(porcentaje) || 0;
    return 100 + valor;
  }

  onAreaChange() {
    this.filtroCargoSel = 'TODOS'; // Reseteamos el filtro de cargo al cambiar de área

    if (this.filtroAreaSel === 'TODOS') {
      this.listaCargosFiltrados = []; // Si elige TODOS, el select de cargo solo mostrará "-- TODOS --"
    } else {
      // Filtramos la lista de cargos global para que solo aparezcan los que pertenezcan al id_area seleccionado
      const idAreaNum = Number(this.filtroAreaSel);
      this.listaCargosFiltrados = this.cargos.filter(c => c.id_area === idAreaNum);
    }

    this.filtrarUsuariosLocal();
  }

  filtrarUsuariosLocal() {
    // 1. Limpiamos las selecciones de asignación actuales a la derecha para evitar bugs visuales
    this.filUsuario = null;
    this.tablaAsignaciones = [];

    // 2. Si ambos están en TODOS, restauramos la lista completa
    if (this.filtroAreaSel === 'TODOS' && this.filtroCargoSel === 'TODOS') {
      this.tablaUsuarios = [...this.tablaUsuariosMaster];
      return;
    }

    // 3. Filtramos los usuarios activos basándonos en sus asignaciones cargadas en memoria
    this.tablaUsuarios = this.tablaUsuariosMaster.filter(usuario => {
      // Obtenemos todas las asignaciones que pertenecen a este usuario actual en evaluación
      const asignacionesDelUsuario = this.listaAsignacionesProyecto.filter(
        // Usamos Number() para asegurar que la comparación de estado no falle por el tipo de dato
        asig => asig.id_usuario === usuario.id_usuario && Number(asig.estado) === 1
      );

      // Comprobamos si cumple con el filtro de Área
      const cumpleArea = this.filtroAreaSel === 'TODOS' ||
        asignacionesDelUsuario.some(asig => asig.id_area === Number(this.filtroAreaSel));

      // Comprobamos si cumple con el filtro de Cargo
      const cumpleCargo = this.filtroCargoSel === 'TODOS' ||
        asignacionesDelUsuario.some(asig => asig.id_cargo === Number(this.filtroCargoSel));

      return cumpleArea && cumpleCargo;
    });
  }


  abrirModalPlanillaBase() {

    this.planillaBase = []; // Empezar limpio
    this.areaSeleccionadaMaster = null;
    this.cargoSeleccionadoMaster = null;
    this.cargosFiltradosModal = [];

    const areasMap = new Map<string, any>();

    // 1. PRIMERO: Extraer y agregar las áreas reales existentes desde 'tablaCargos'
    if (this.tablaCargos && this.tablaCargos.length > 0) {
      this.tablaCargos.forEach(item => {
        // Es un área si no tiene id_cargo (o es null/undefined) y tiene id_area asignado
        if (!item.id_cargo && item.id_area) {
          const descMayuscula = item.descripcion.trim().toUpperCase();

          areasMap.set(descMayuscula, {
            descripcion: descMayuscula,
            id_area: item.id_area,
            abreviatura: item.abreviatura || item.area_abreviatura || descMayuscula.substring(0, 3),
            cargosCargadosBD: [] // Guardaremos los cargos reales existentes para calcular los ind_gp después
          });
        }
      });

      // Llenar los cargos existentes que provienen de la BD en su área correspondiente
      this.tablaCargos.forEach((item: any) => {
        if (item.id_cargo && item.id_area) {
          // Buscamos el área correspondiente en el map
          for (let [key, area] of areasMap.entries()) {
            if (area.id_area === item.id_area) {
              area.cargosCargadosBD.push({
                id_cargo: item.id_cargo,
                descripcion: item.descripcion.toUpperCase(),
                abreviatura: item.abreviatura,
                // Conservamos el flag de categorías y el ind_gp original de la BD
                categoria_seleccionada: item.categoria_seleccionada || 'Categoria t1',
                categoria_t1: item.categoria_t1 || 0,
                categoria_t2: item.categoria_t2 || 0,
                categoria_t3: item.categoria_t3 || 0,
                categoria_t4: item.categoria_t4 || 0,
                categoria_t5: item.categoria_t5 || 0,
                habilitado: item.habilitado ?? 1,
                texto: item.texto || "",
                ind_gp: item.ind_gp !== undefined ? item.ind_gp : null // <-- Guardamos ind_gp de BD
              });
            }
          }
        }
      });
    }

    // 2. SEGUNDO: Procesar las 4 áreas maestras por defecto
    this.listaCompletaAreasMaestras.forEach(nombre => {
      const descMayuscula = nombre.trim().toUpperCase();

      if (!areasMap.has(descMayuscula)) {
        areasMap.set(descMayuscula, {
          descripcion: descMayuscula,
          id_area: null,
          abreviatura: descMayuscula.substring(0, 3),
          cargosCargadosBD: [] // Nueva área maestra empieza sin cargos
        });
      }
    });

    // Convertimos el Map a la lista plana ordenada para el selector HTML
    this.areasDisponiblesModal = Array.from(areasMap.values());

    this.modalPlanillaBase.show();
  }

  // 3. Método ejecutado al seleccionar un Área en la izquierda
  seleccionarAreaMaster(area: any) {
    this.areaSeleccionadaMaster = area;
    this.cargoSeleccionadoMaster = null;

    this.cargosFiltradosModal = [...this.listaCompletaCargosMaestros];
  }


  agregarAsignacionDerecha() {
    if (!this.areaSeleccionadaMaster || !this.cargoSeleccionadoMaster) return;

    const areaSeleccionada: any = this.areaSeleccionadaMaster;
    const cargoSeleccionado: any = this.cargoSeleccionadoMaster;

    // Verificar si el contenedor del área ya existe en el lado derecho comparando la DESCRIPCIÓN
    let areaDerecha = this.planillaBase.find(a => a.descripcion.toUpperCase() === areaSeleccionada.descripcion.toUpperCase());

    if (!areaDerecha) {
      // Si el área no existe en el lado derecho, la creamos arrastrando su id_area y sus cargos pre-existentes
      areaDerecha = {
        id_area: areaSeleccionada.id_area,
        descripcion: areaSeleccionada.descripcion.toUpperCase(),
        abreviatura: areaSeleccionada.abreviatura || areaSeleccionada.descripcion.substring(0, 3).toUpperCase(),
        id_responsable: null,
        // Cargamos los cargos que ya existían físicamente de este área en la base de datos
        cargos: areaSeleccionada.cargosCargadosBD ? [...areaSeleccionada.cargosCargadosBD] : []
      };
      this.planillaBase.push(areaDerecha);
    }

    // Evitar agregar el mismo cargo dentro de esta misma área
    const existeCargo = areaDerecha.cargos.find(c => c.descripcion.toUpperCase() === cargoSeleccionado.toUpperCase());
    if (existeCargo) {
      alert(`El cargo "${cargoSeleccionado}" ya está asignado al área "${areaSeleccionada.descripcion}".`);
      return;
    }

    // --- CÁLCULO DE IND_GP CORRELATIVO ---
    // Buscamos el mayor "ind_gp" que tengan actualmente los cargos en esta área
    let maxIndGp = 0;
    if (areaDerecha.cargos && areaDerecha.cargos.length > 0) {
      areaDerecha.cargos.forEach(c => {
        const val = Number(c.ind_gp);
        if (!isNaN(val) && val > maxIndGp) {
          maxIndGp = val;
        }
      });
    }
    const nuevoIndGp = maxIndGp + 1; // Incrementa correlativamente (ej: si el max es 2, será 3)

    // Obtener la abreviatura inicial del cargo
    const abrevBase = cargoSeleccionado
      .split(' ')
      .filter(w => w.length > 2)
      .map(w => w[0])
      .join('')
      .substring(0, 3)
      .toUpperCase();

    // Agregar el cargo con el nuevo correlativo asignado
    areaDerecha.cargos.push({
      id_cargo: null,
      descripcion: cargoSeleccionado.toUpperCase(),
      abreviatura: abrevBase,
      categoria_seleccionada: this.tipos_cargos && this.tipos_cargos.length > 0 ? this.tipos_cargos[0] : 'Categoria t1',
      categoria_t1: 0,
      categoria_t2: 0,
      categoria_t3: 0,
      categoria_t4: 0,
      categoria_t5: 0,
      habilitado: 1,
      texto: "",
      ind_gp: nuevoIndGp // <-- ASIGNACIÓN DEL CORRELATIVO CALCULADO
    });

    this.recalcularAbreviaturas();
    this.cargoSeleccionadoMaster = null;
  }

  eliminarCargoDeArea(indexArea: number, indexCargo: number) {
    this.planillaBase[indexArea].cargos.splice(indexCargo, 1);
    this.recalcularAbreviaturas();
  }

  eliminarArea2(indexArea: number) {
    this.planillaBase.splice(indexArea, 1);
    this.recalcularAbreviaturas();
  }

  obtenerTotalCargosAsignados(): number {
    return this.planillaBase.reduce((acc, area) => acc + (area.cargos ? area.cargos.length : 0), 0);
  }

  recalcularAbreviaturas() {
    const conteoGlobal: { [key: string]: number } = {};

    this.planillaBase.forEach(area => {
      if (area.cargos) {
        area.cargos.forEach(cargo => {
          const abrevBase = cargo.descripcion
            .split(' ')
            .filter(palabra => palabra.length > 2)
            .map(palabra => palabra[0])
            .join('')
            .toUpperCase();

          const key = abrevBase || 'CG';

          if (!conteoGlobal[key]) {
            conteoGlobal[key] = 1;
            cargo.abreviatura = key;
          } else {
            conteoGlobal[key]++;
            cargo.abreviatura = `${key}${conteoGlobal[key]}`;
          }
        });
      }
    });
  }

  cerrarModalPlanillaBase() {
    this.modalPlanillaBase.hide();
  }

  async guardarPlanillaCompleta() {
    if (this.planillaBase.length === 0) {
      this.toaster.error('La estructura de la planilla no puede estar vacía.');
      return;
    }

    try {
      this.mostrar_carga_todo = true;

      const payload = {
        id_proyecto: this.idProyecto,
        areas: this.planillaBase.map(area => ({
          id_area: area.id_area || null,
          id_responsable: area.id_responsable || null,
          descripcion: area.descripcion,
          abreviatura: area.abreviatura,
          cargos: area.cargos.map(cargo => ({
            id_cargo: cargo.id_cargo || null,
            descripcion: cargo.descripcion,
            abreviatura: cargo.abreviatura,
            categoria_t1: cargo.categoria_seleccionada === 'Categoria t1' ? 1 : 0,
            categoria_t2: cargo.categoria_seleccionada === 'Categoria t2' ? 1 : 0,
            categoria_t3: cargo.categoria_seleccionada === 'Categoria t3' ? 1 : 0,
            categoria_t4: cargo.categoria_seleccionada === 'Categoria t4' ? 1 : 0,
            categoria_t5: cargo.categoria_seleccionada === 'Categoria t5' ? 1 : 0,
            habilitado: 1,
            ind_gp: cargo.ind_gp !== undefined ? cargo.ind_gp : null // <-- ENVIADO EN EL PAYLOAD JSON
          }))
        }))
      };


      const response = await this.recursosHumanosService.guardarPlanillaCompleta(payload);

      this.toaster.success('¡Planilla Base procesada y guardada con éxito!');
      this.cerrarModalPlanillaBase();
      await this.listarCargosPorArea();

    } catch (error: any) {
      console.error(error);
      this.toaster.error(error?.error || 'Error al intentar guardar el bloque de la planilla.');
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  onAreaSeleccionadaChange() {
    this.cargoSeleccionadoMaster = null;

    if (!this.areaSeleccionadaMaster) {
      this.cargosFiltradosModal = [];
      return;
    }

    const area: any = this.areaSeleccionadaMaster;

    const cargosExistentesEnArea = this.tablaCargos
      .filter(item => item.id_cargo && item.id_area === area.id_area)
      .map(item => item.descripcion.toUpperCase());

    if (cargosExistentesEnArea.length > 0) {
      this.cargosFiltradosModal = [...new Set([...cargosExistentesEnArea, ...this.listaCompletaCargosMaestros])];
    } else {
      this.cargosFiltradosModal = [...this.listaCompletaCargosMaestros];
    }
  }

  // Si usas este método para agregar de forma directa
  agregarCargoAPlanilla() {
    if (!this.areaSeleccionadaMaster || !this.cargoSeleccionadoMaster) return;

    const areaPadre: any = this.areaSeleccionadaMaster;

    // Calcular el ind_gp correlativo en base a lo que ya existe
    let maxIndGp = 0;
    const cargosDelArea = this.planillaBase.filter(c => c.id_area === areaPadre.id_area);
    cargosDelArea.forEach(c => {
      const val = Number(c.ind_gp);
      if (!isNaN(val) && val > maxIndGp) {
        maxIndGp = val;
      }
    });
    const nuevoIndGp = maxIndGp + 1;

    const nuevoCargo: any = {
      id_area: areaPadre.id_area,
      area_descripcion: areaPadre.descripcion,
      area_abreviatura: areaPadre.abreviatura,
      descripcion: this.cargoSeleccionadoMaster.toUpperCase(),
      abreviatura: this.cargoSeleccionadoMaster.substring(0, 3).toUpperCase(),
      id_cargo: null,
      id_proyecto: this.idProyecto || 352,
      categoria_t1: 0,
      categoria_t2: 0,
      categoria_t3: 0,
      categoria_t4: 0,
      categoria_t5: 0,
      habilitado: true,
      texto: "",
      ind_gp: nuevoIndGp // <-- ASIGNADO AQUÍ TAMBIÉN
    };

    this.planillaBase.push(nuevoCargo);
  }



  esPrimerCargo(row: any, index: number): boolean {
    if (!row || !row.id_cargo) return true;
    return Number(row.ind_gp) <= 1;
  }

  esUltimoCargo(row: any, index: number): boolean {
    if (!row || !row.id_cargo) return true;
    const siguienteFila = this.tablaCargos[index + 1];
    // Si no hay siguiente fila, o la siguiente fila es la cabecera de un Área nueva
    if (!siguienteFila || !siguienteFila.id_cargo) {
      return true;
    }
    return false;
  }

  /**
 * Realiza el desplazamiento y la actualización silenciosa en cascada
 * @param index Fila actual en la tabla
 * @param direccion -1 para subir, 1 para bajar
 */
  async desplazarCargo(index: number, direccion: number) {
    try {
      this.mostrar_carga_todo = true;

      const cargoActual = this.tablaCargos[index];
      const cargoDestino = this.tablaCargos[index + direccion];

      // Doble validación de seguridad para asegurar que no se crucen áreas
      if (!cargoDestino || !cargoDestino.id_cargo || cargoActual.id_area !== cargoDestino.id_area) {
        this.mostrar_carga_todo = false;
        return;
      }

      // Guardamos los índices originales para el intercambio directo
      const indGpActual = cargoActual.ind_gp;
      const indGpDestino = cargoDestino.ind_gp;

      // Construimos los payloads respetando las propiedades originales de tus registros
      const prepararPayload = (row: any, nuevoIndGp: number) => {
        return {
          id_cargo: row.id_cargo,
          id_proyecto: row.id_proyecto,
          id_area: row.id_area,
          descripcion: row.descripcion,
          abreviatura: row.abreviatura,
          categoria_t1: row.categoria_t1 || 0,
          categoria_t2: row.categoria_t2 || 0,
          categoria_t3: row.categoria_t3 || 0,
          categoria_t4: row.categoria_t4 || 0,
          categoria_t5: row.categoria_t5 || 0,
          habilitado: row.habilitado ? 1 : 0,
          texto: row.texto ? row.texto : '',
          ind_gp: nuevoIndGp // <-- Asignamos la nueva posición intercambiada
        };
      };

      const payloadActual = prepararPayload(cargoActual, indGpDestino);
      const payloadDestino = prepararPayload(cargoDestino, indGpActual);

      // Ejecutamos ambas solicitudes concurrentemente aprovechando tu backend actual
      await Promise.all([
        this.recursosHumanosService.actualizarCargoArea(payloadActual),
        this.recursosHumanosService.actualizarCargoArea(payloadDestino)
      ]);

      // Refrescamos la lista completa para reflejar el nuevo orden en el cliente
      await this.listarCargosPorArea();

      this.toaster.success(
        'Posición actualizada',
        'Correcto',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 2000,
        }
      );
    } catch (error) {
      console.error('Error al reordenar los cargos:', error);
      SwalService.error();
    } finally {
      this.mostrar_carga_todo = false;
    }
  }
}



