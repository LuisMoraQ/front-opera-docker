import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ToastrService } from 'ngx-toastr';

export interface Usuario {
  id_usuario: number;
  id_proyecto: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  correo: string;
  id_asignacion: number;
  tipo_cargo: number;
  fecha_inicio: string;
  fecha_fin: string;
  id_area: number;
  descripcion_area: string;
  abreviatura_area: string;
  id_cargo: number;
  descripcion_cargo: string;
  abreviatura_cargo: string;
  [key: string]: any;
}

export interface CuadrillaBD {
  id_cuadrilla: number;
  id_proyecto: number;
  id_usuario: number; // Usuario jefe/lider (si aplica)
  descripcion: string;
  usuarios: string; // Ejemplo: "41|42|44" o "|41|42|44|"
  fecha: string;
  orden_cuadrilla: number;
}

export interface GrupoCuadrilla {
  id_cuadrilla: number | null;
  id_usuario?: number;
  descripcion: string;
  orden_cuadrilla: number;
  integrantes: Usuario[];
}

export interface ActividadCuadrilla {
  id_actividad?: number;
  id_proyecto: number;
  descripcion: string;
  ubicacion: string;
  unidad: string;
  metrado: number | null;
  horas_laborada: string; // Formato "HH:mm"
  tipo: string;
  indice: number;
  usuarios: string; // Ejemplo: "41,42" o "SR"
  cuadrilla: number | null;
  fecha: string;
  cabecera: string; // 1 = Cabecera, 0 = Detalle
  editandoCampo?: string | null;
}

export interface GrupoActividades {
  cuadrilla: number | null;
  descripcion: string;
  orden: number;
  horasTotal: string;
  cabecera?: string;
  actividades: ActividadCuadrilla[];
}

export interface PartidaPresupuesto {
  indice: number;
  item: string;
  itemord: string;
  descripcion: string;
  unidad: string;
  seleccionado?: boolean;
}

export interface ActividadGenerada {
  id_actividad: number;
  id_proyecto: number;
  descripcion: string;
  ubicacion: string;
  unidad: string;
  metrado: number;
  horas_laborada: string;
  tipo: string;             // Recibe 'TT'
  usuarios: string;         // '47,48'
  asignacionVisual: string; // 'A - 1, 2'
  cuadrilla: number;
  fecha: string;
  cabecera: string;
  indice: string
}

// Interfaces exclusivas para el módulo de vinculación
export interface ActividadVinculacionFlat {
  id_actividad: number;
  es_cabecera: boolean;
  item_label?: string;            // 'A', 'B' o '1', '2', '3'
  indexGlobalActividad?: number; // 1, 2, 3... (excluye cabeceras)
  descripcion: string;
  ubicacion?: string;
  unidad?: string;
  metrado?: number;
  horas_laborada?: string;
  tipo_trabajo?: string;
  vinculo?: string;
  indice?: number | string;
  seleccionadoVinculo?: boolean;  // Checkbox exclusivo
}

export interface PartidaVinculacion {
  id_partida: number;
  item: string;
  indice?: number | string; // 👈 Propiedad añadida para evitar el error TS
  descripcion: string;
  unidad?: string;
  metrado_diario?: number;
  horas_laboradas_sumadas?: string;
  string_indices_vinculados?: string; // Cadena con los item_label de las actividades vinculadas (ej: "1, 2")
  array_indices_vinculados?: number[];
  seleccionadoVinculo?: boolean;
}
export interface PayloadGuardarVinculo {
  id_partida: number;
  id_proyecto: number;
  fecha: string;
  actividades_vinculadas: string;
}


@Component({
  selector: 'app-rh-por-partida',
  templateUrl: './rh-por-partida.component.html',
  styleUrls: ['./rh-por-partida.component.scss']
})
export class RhPorPartidaComponent implements OnInit {
  id_proyecto = null
  idusuario = null
  prueba = null
  id_userproy = null
  tipoProy = '';
  colores: any;
  decima: any;
  solover = false;
  moneda = 'S/';
  simbolo = ''
  aspectos: any;
  titulo1: any = '';
  titulo1color: any = '';
  titulo1letra: any = '';
  tituloSeleccionado = null
  mostrar_carga_todo = false
  meses = []
  dias = []
  @Input() set tabproyecto(value: any) {
    this.prueba = value
    this.id_proyecto = value.get('id_proyecto').value;
    const aspectosGen = (value.get('aspectos_generales') as UntypedFormGroup)
    const datosproy = (aspectosGen.get('datos_proyecto') as UntypedFormGroup)
    const datosrec = (aspectosGen.get('datos_recuperado') as UntypedFormGroup)
    this.id_userproy = datosrec.value.id_usuario;
    this.tipoProy = datosproy.get('id_clasificacion').value;
    this.colores = value.get('aspectab').value;
    this.decima = value.get('decimal').value;
    this.solover = value.get('solover').value;
    this.moneda = datosproy.get('moneda').value.toString() == '0' ? 'S/' : '$';
    this.simbolo = datosrec.value.simbolo
    if (this.colores) {
      this.titulo1 = JSON.parse(this.colores).tipoPresupuesto.split('|');
      this.titulo1color = JSON.parse(this.colores).colorPresupuesto.split('|');
      this.titulo1letra = JSON.parse(this.colores).letraPresupuesto.split('|');
    }
  }

  mesSeleccionado = null
  subvista = 1
  tablaUsuarios = []
  buscando = false
  diaSeleccionado = null
  listaEstructuradaCuadrillas = []
  formCuadrilla: FormGroup;
  formPerdida: FormGroup;
  cuadrillaSeleccionadaModal: GrupoCuadrilla | null = null;
  listaBaseUsuarios = []
  @ViewChild("modalServicio") modalServicio: ModalBasicComponent;
  @ViewChild("modalReemplazarCuadrilla") modalReemplazarCuadrilla: ModalBasicComponent;
  @ViewChild('modalCopiarActividades') modalCopiarActividades: ModalBasicComponent;
  @ViewChild('modalVinculacionPresupuesto') modalVinculacionPresupuesto: ModalBasicComponent;
  @ViewChild('modalPerdidas') modalPerdidas: ModalBasicComponent;
  modoAgrupar: boolean = false;
  idCuadrillaDestino: number | null = null;
  listaEstructuradaActividades: GrupoActividades[] = [];
  tiposTrabajo = [
    { label: 'TC', value: 'TC', bgClass: 'bg-info text-white' },
    { label: 'TP', value: 'TP', bgClass: 'bg-success text-white' },
    { label: 'TNC', value: 'TNC', bgClass: 'bg-danger text-white' },
    { label: 'TT', value: 'TT', bgClass: 'bg-purple text-white' }
  ];
  actividadesSinCuadrillaSeleccionadas: ActividadCuadrilla[] = [];
  cabeceraSeleccionada: any = null;
  modoAgrupar2: boolean = false;
  actividadSeleccionada: any = null;
  seleccionPersonalMap: Map<number, boolean> = new Map<number, boolean>();
  private mapIdUserToIndexGlobal: Map<number, number> = new Map();
  private mapIndexGlobalToIdUser: Map<number, number> = new Map();
  modoVincularPersonal: boolean = false;
  constructor(private cd: ChangeDetectorRef, private fb: FormBuilder, private toaster: ToastrService, public metradoService: MetradoService, private RecursosHumanosService: RecursosHumanosService, private encriptadorService: EncriptadorService) {
    this.formCuadrilla = this.fb.group({
      descripcion: ['', Validators.required],
      id_usuario_jefe: [null]
    });
    this.formNuevaCuadrilla = this.fb.group({
      descripcionCuadrilla: ['', Validators.required],
      fechaAsignada: ['', Validators.required]
    });

    this.formPerdida = this.fb.group({
      descripcion: ['', Validators.required],
      id_perdida: [null]
    });
  }
  gruposActividades: GrupoActividades[] = [];
  gruposUsuarios: GrupoCuadrilla[] = [];
  mostrarAsignacionUsuarioFila: boolean = false;
  listaActividadesGlobal: ActividadCuadrilla[] = [];
  listaUsuariosGlobal: Usuario[] = [];
  opcionesCuadrillasDisponibles: any[] = [];
  modoAgruparActividades: boolean = false;
  opcionesCabecerasDisponibles: any[] = [];
  movimientosTemporales: Map<number, number> = new Map();
  formNuevaCuadrilla!: FormGroup;
  fechaOrigenConsulta: string = '';
  cuadrillasRecuperadasModal: any[] = [];
  consultadoSinResultados: boolean = false;
  fechaOrigen: string = '';
  reemplazarTareas: boolean = false;
  fechaOrigenActividades: string = '';
  listaActividadesOrigen: any[] = [];
  consultadoActividadesSinResultados: boolean = false;
  cargandoCopiaActividades: boolean = false;
  usuariosSeleccionadosMap = new Map<number, boolean>(); // Map<id_usuario, boolean>
  actividadesSeleccionadasMap = new Map<ActividadCuadrilla, boolean>();
  actividadesSeleccionadasSet = new Set<any>();
  usuariosSeleccionadosSet = new Set<string>();
  usuariosSlidersMap = new Map<any, any>();

  listaActividadesAcumuladas: any[] = [];
  seleccionarTodosOrigen: boolean = false;
  listaPresupuesto: PartidaPresupuesto[] = [];
  listaActividadesGeneradas: ActividadGenerada[] = [];
  usuariosSeleccionadosModalMap: Map<number, any> = new Map<number, any>();
  valorOriginalEdicion: any = null;

  diaSeleccionadoVinculo: any = null;
  modoSeleccionVincularActivo: boolean = false;
  listaActividadesParaVinculo: ActividadVinculacionFlat[] = [];
  listaPresupuestoParaVinculo: PartidaVinculacion[] = [];
  fechaHoyVinculo: string = new Date().toISOString().split('T')[0]; // Fecha actual 'YYYY-MM-DD'
  mesesVinculo: any[] = [];
  mesSeleccionadoVinculo: number = 0;
  diasVinculo: any[] = [];
  cargandoPresupuesto: boolean = false;
  partidaEditandoId: number | string | null = null;
  textoVinculoTemporal: string = '';
  textoVinculoOriginal: string = '';

  mesSeleccionadoResumen: number = 0;
  mesesControl: any[] = [];
  mesesResumen: any[] = [];
  diasResumen: any[] = [];
  diasControl: any[] = [];
  diaSeleccionadoResumen: any = null;
  cargos = []
  partidas = []
  mesSeleccionadoControl: number = 0
  filaSeleccionada = null
  listaActividadesPartida: any[] = [];
  perdidasFrecuentes: any[] = []
  idPerdidaSeleccionada: number | null = null;
  listaTopPerdidas: any[] = [];
  modoEdicion: boolean = false;
  horasJornadaDia: number = 8.5;

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      this.idusuario = this.encriptadorService.recuperarlocalstory('idusuario');
      await this.calendario()
      await this.marcarDiasConRegistroVinculo()
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      SwalService.error()
      console.log(error)
    }
  }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async cambioVista(ind: any) {
    if (this.subvista !== ind) {
      this.mostrar_carga_todo = true
      this.subvista = ind
      if (ind == 1) {

      } else if (ind == 2) {
        await this.inicializarSubvistaVinculacion()
      } else if (ind == 3) {
        await this.inicializarSubvistaResumen()
      } else if (ind == 4) {
        // await this.cargarPresupuesto()
        this.mesSeleccionadoControl = 0
        this.diaSeleccionadoResumen = null
        this.listaPresupuesto = [];
        this.listaActividadesPartida = []
        this.filaSeleccionada = null
        await this.cargarPresupuesto();
      }
      await this.marcarDiasConRegistroVinculo();
      this.mostrar_carga_todo = false
    } else {
      return
    }
  }

  async calendario() {
    const obj = {
      id_proyecto: this.id_proyecto
    }
    const resp = await this.metradoService.generarCalendarioProyecto(obj)
    if (resp) {
      this.meses = resp
      this.mesSeleccionado = 0
      this.dias = this.meses[this.mesSeleccionado].dias
    } else {
      this.meses = []
      this.mesSeleccionado = null
    }
  }

  async cambioMes() {
    this.mostrar_carga_todo = true
    this.dias = this.meses[this.mesSeleccionado].dias
    this.diaSeleccionado = null
    // this.filaSel = null
    // this.presupuestoCargado = false;
    // this.tablaAcue = []
    // this.busquedaMod = '';
    // this.tipoSel = null
    // this.seHicieronCambiosModal = false;
    // this.totalAcueGeneral = 0;
    // await this.listarPresActivid('');
    // await this.marcarDiasConRegistro()

    this.mostrar_carga_todo = false
  }

  async listarRegistrosAsistencia(fechaConsulta: string) {
    const obj = {
      id_proyecto: this.id_proyecto,
      fecha: fechaConsulta // formato 'YYYY-MM-DD'
    };
    try {
      const res = await this.RecursosHumanosService.listarCuadrillaDia(obj);
      return res;
    } catch (error) {
      console.error('Error al listar asistencia:', error);
    }
  }

  async listarCuadrillaFechaOMayor(fechaConsulta: string) {
    const obj = {
      id_proyecto: this.id_proyecto,
      fecha: fechaConsulta // formato 'YYYY-MM-DD'
    };
    try {
      const res = await this.RecursosHumanosService.listarCuadrillaFechaOMayor(obj);
      return res;
    } catch (error) {
      console.error('Error al listar asistencia:', error);
    }
  }

  async seleccionDia(dia: any) {
    this.diaSeleccionado = dia;

    if (this.diaSeleccionado) {
      this.mostrar_carga_todo = true;

      try {
        const usuarios: Usuario[] = await this.listarRegistrosAsistencia(this.diaSeleccionado.fecha);
        const cuadrillas: CuadrillaBD[] = await this.listarCuadrillaFechaOMayor(this.diaSeleccionado.fecha);
        this.listaBaseUsuarios = usuarios || [];

        this.listaEstructuradaCuadrillas = [...this.procesarEstructuraCuadrillas(usuarios || [], cuadrillas)];
        // Actualizar mapas de índice correlativo (1..N)
        this.actualizarMapasCorrelativos();

        // Recargar actividades del día seleccionado
        await this.recargarTablaActividades();

        // // CALCULAR A NIVEL DE FRONT: Suma las horas asignadas a cada usuario en el día
        // this.actualizarJornalTodosLosUsuarios();
        await this.recalcularTodo();
      } catch (error) {
        console.error('Error al procesar la lista:', error);
      } finally {
        this.mostrar_carga_todo = false;
      }
    }
  }

  actualizarMapasCorrelativos() {
    this.mapIdUserToIndexGlobal.clear();
    this.mapIndexGlobalToIdUser.clear();

    this.listaEstructuradaCuadrillas.forEach(grupo => {
      grupo.integrantes.forEach(u => {
        if (u.indexGlobal !== undefined) {
          this.mapIdUserToIndexGlobal.set(u.id_usuario, u.indexGlobal);
          this.mapIndexGlobalToIdUser.set(u.indexGlobal, u.id_usuario);
        }
      });
    });
  }

  procesarEstructuraCuadrillas(listaUsuarios: Usuario[], listaCuadrillas: CuadrillaBD[]): GrupoCuadrilla[] {
    const idsUsuariosAsignados = new Set<number>();

    // 1. Armar las cuadrillas con sus integrantes
    const resultado: GrupoCuadrilla[] = listaCuadrillas.map((cuadrilla) => {
      const idsArray: number[] = cuadrilla.usuarios
        ? cuadrilla.usuarios
          .split('|')
          .filter((id) => id.trim() !== '')
          .map((id) => Number(id))
        : [];

      const integrantes = listaUsuarios.filter((u) => {
        const pertenece = idsArray.includes(u.id_usuario);
        if (pertenece) {
          idsUsuariosAsignados.add(u.id_usuario);
        }
        return pertenece;
      });

      return {
        id_cuadrilla: cuadrilla.id_cuadrilla,
        descripcion: cuadrilla.descripcion,
        orden_cuadrilla: cuadrilla.orden_cuadrilla || 0,
        integrantes: integrantes
      };
    });

    // 2. Identificar usuarios sin cuadrilla
    const sinCuadrilla = listaUsuarios.filter((u) => !idsUsuariosAsignados.has(u.id_usuario));

    if (sinCuadrilla.length > 0) {
      resultado.push({
        id_cuadrilla: null,
        descripcion: 'Personal sin cuadrilla',
        orden_cuadrilla: 999,
        integrantes: sinCuadrilla
      });
    }

    // 3. Ordenar los grupos por orden de cuadrilla primero
    resultado.sort((a, b) => a.orden_cuadrilla - b.orden_cuadrilla);

    // 4. ASIGNAR EL ÍNDICE GLOBAL CORRELATIVO A CADA USUARIO
    let contadorGlobal = 1;

    resultado.forEach((grupo) => {
      grupo.integrantes = grupo.integrantes.map((usuario) => {
        const usuarioConIndex = {
          ...usuario,
          indexGlobal: contadorGlobal // <--- Se asigna el índice acumulativo
        };
        contadorGlobal++;
        return usuarioConIndex;
      });
    });

    return resultado;
  }

  abrirModalCrearCuadrilla() {
    this.formCuadrilla.reset();
    this.modalServicio.show();
  }

  async agregarCuadrilla() {
    if (this.formCuadrilla.invalid) {
      this.formCuadrilla.markAllAsTouched();
      return;
    }

    try {
      this.mostrar_carga_todo = true;

      // Calcular el orden correlativo de la cuadrilla
      const orden = this.listaEstructuradaCuadrillas.filter(g => g.id_cuadrilla !== null).length + 1;

      const formData = new FormData();
      formData.append('id_cuadrilla', '0'); // Envia 0 para indicar creación
      formData.append('id_proyecto', this.id_proyecto.toString());
      formData.append('id_usuario', this.idusuario);
      formData.append('descripcion', this.formCuadrilla.value.descripcion);
      formData.append('usuarios', ''); // Siempre vacío al crear
      formData.append('fecha', this.diaSeleccionado.fecha);
      formData.append('orden_cuadrilla', orden.toString());

      await this.RecursosHumanosService.guardarCuadrilla(formData);

      this.cerrarModalServicio();
      await this.recargarTabla();
    } catch (error) {
      console.error('Error al agregar cuadrilla:', error);
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  cerrarModalServicio() {
    this.modalServicio.hide()
  }

  async guardarEstadoCuadrillasBD() {
    this.mostrar_carga_todo = true;
    try {
      // Filtramos solo las cuadrillas reales (excluimos 'Personal sin cuadrilla' con id_cuadrilla === null)
      const promesas = this.listaEstructuradaCuadrillas
        .filter(grupo => grupo.id_cuadrilla !== null)
        .map(grupo => {
          // Formatear los IDs de integrantes activos en la cuadrilla en formato |1|2|3|
          const ids = (grupo.integrantes || [])
            .map((u: any) => u.id_usuario ?? u.id)
            .filter((id: any) => id !== undefined && id !== null);

          const stringUsuarios = ids.length > 0 ? `|${ids.join('|')}|` : '';

          const formData = new FormData();
          formData.append('id_cuadrilla', grupo.id_cuadrilla.toString());
          formData.append('id_proyecto', this.id_proyecto.toString());
          formData.append('id_usuario', (grupo.id_usuario || 0).toString());
          formData.append('descripcion', grupo.descripcion || '');
          formData.append('usuarios', stringUsuarios);
          formData.append('fecha', this.diaSeleccionado.fecha);
          formData.append('orden_cuadrilla', (grupo.orden_cuadrilla || 0).toString());

          return this.RecursosHumanosService.guardarCuadrilla(formData);
        });

      // Enviar todas las peticiones en paralelo
      await Promise.all(promesas);

      // Recargar la tabla desde la BD para reflejar la versión oficial guardada
      await this.recargarTabla();
    } catch (error) {
      console.error('Error al guardar estado de cuadrillas:', error);
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  async recargarTabla(fechaFija?: string) {
    const fechaABuscar = fechaFija || (this.diaSeleccionado ? this.diaSeleccionado.fecha : null);
    if (!fechaABuscar) return;

    // Busca la referencia original del objeto dentro del arreglo de días del componente
    let diaReal = null;
    if (this.dias && this.dias.length > 0) {
      diaReal = this.dias.find((d: any) => String(d.fecha) === String(fechaABuscar));
    }

    // Si no se encuentra en el arreglo, usa el que ya tenía asignado
    const objetoDia = diaReal || this.diaSeleccionado || { fecha: fechaABuscar };

    // Invocar seleccionDia con el objeto real sin desglosarlo con spread operator {...}
    await this.seleccionDia(objetoDia);
  }

  async recargarTablaActividades() {
    if (!this.diaSeleccionado || !this.id_proyecto) return;

    this.mostrar_carga_todo = true;
    try {
      const respuesta = await this.RecursosHumanosService.listarActividadesCuadrilla({
        id_proyecto: this.id_proyecto,
        fecha: this.diaSeleccionado.fecha
      });

      const listaPlana: ActividadCuadrilla[] = respuesta || [];

      // Agrupamiento estructurado por asignación de usuarios
      this.listaEstructuradaActividades = this.agruparActividades(listaPlana, this.listaBaseUsuarios);

    } catch (error) {
      console.error('Error al cargar la tabla de actividades:', error);
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  reagruparTodo(): void {
    this.reagruparActividadesPorAsignacion();
    this.recalcularHorasLaboradasUsuarios();
  }

  reagruparActividadesPorAsignacion(): void {
    const mapaFrecuencias = new Map<string, number>();

    // 1. Conprobar frecuencias de asignación
    this.listaActividadesGlobal.forEach(act => {
      const firma = (act.usuarios || '').trim();
      if (firma && firma !== 'SR') {
        mapaFrecuencias.set(firma, (mapaFrecuencias.get(firma) || 0) + 1);
      }
    });

    // 2. Clasificar actividades
    const gruposMap = new Map<string, ActividadCuadrilla[]>();
    const sinAgrupamiento: ActividadCuadrilla[] = [];

    this.listaActividadesGlobal.forEach(act => {
      const firma = (act.usuarios || '').trim();

      if (firma && firma !== 'SR' && (mapaFrecuencias.get(firma) || 0) >= 2) {
        if (!gruposMap.has(firma)) {
          gruposMap.set(firma, []);
        }
        gruposMap.get(firma)!.push(act);
      } else {
        sinAgrupamiento.push(act);
      }
    });

    // 3. Reconstruir array gruposActividades
    const nuevosGrupos: GrupoActividades[] = [];
    let orden = 1;

    gruposMap.forEach((actividades, firma) => {
      const ids = firma.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
      const descripcionCabecera = this.obtenerNombreCuadrillaPorIds(ids);
      const horasTotal = this.calcularSumaHoras(actividades);

      nuevosGrupos.push({
        cuadrilla: orden,
        descripcion: `CUADRILLA (${descripcionCabecera})`,
        orden: orden,
        horasTotal: horasTotal,
        cabecera: '',
        actividades: actividades
      });
      orden++;
    });

    // Grupo Sin Agrupamiento
    nuevosGrupos.push({
      cuadrilla: null,
      descripcion: 'SIN AGRUPAMIENTO',
      orden: orden,
      horasTotal: this.calcularSumaHoras(sinAgrupamiento),
      cabecera: '',
      actividades: sinAgrupamiento
    });

    this.gruposActividades = nuevosGrupos;
  }

  obtenerNombreCuadrillaPorIds(ids: number[]): string {
    const nombres = ids.map(id => {
      const usr = this.listaUsuariosGlobal.find(u => u.id_usuario === id);
      if (usr) {
        return usr.nombres.trim().split(' ')[0].toUpperCase();
      }
      return `ID:${id}`;
    });
    return nombres.join(' - ');
  }

  onEdicionManualAsignacion(act: ActividadCuadrilla, nuevoTexto: string): void {
    act.editandoCampo = null;
    const textoLimpio = (nuevoTexto || '').trim();
    act.usuarios = textoLimpio ? textoLimpio : 'SR';
    this.reagruparTodo();
  }

  toggleFilaAsignacionUsuario(): void {
    this.mostrarAsignacionUsuarioFila = !this.mostrarAsignacionUsuarioFila;
  }

  async moverUsuarioACuadrilla(usuario: any, idCuadrillaDestinoStr: string) {
    if (!idCuadrillaDestinoStr || !usuario) return;

    // Convertir el string recibido del <select> a number
    const idCuadrillaDestino = Number(idCuadrillaDestinoStr);

    // 1. Buscar y remover al usuario del grupo origen (Personal sin cuadrilla)
    const grupoOrigen = this.listaEstructuradaCuadrillas.find((g) => g.id_cuadrilla === null);
    if (grupoOrigen && grupoOrigen.integrantes) {
      const index = grupoOrigen.integrantes.findIndex((u: any) => u.id_usuario === usuario.id_usuario);
      if (index !== -1) {
        grupoOrigen.integrantes.splice(index, 1);
      }
    }

    // 2. Buscar la cuadrilla destino
    const grupoDestino = this.listaEstructuradaCuadrillas.find(
      (g) => Number(g.id_cuadrilla) === idCuadrillaDestino
    );

    // 3. Asignar el nuevo ID de cuadrilla al usuario e insertarlo en la lista destino
    if (grupoDestino) {
      usuario.id_cuadrilla = idCuadrillaDestino;
      if (!grupoDestino.integrantes) {
        grupoDestino.integrantes = [];
      }
      grupoDestino.integrantes.push(usuario);
    }

    // 4. Recalcular la numeración correlativa global (indexGlobal)
    await this.guardarEstadoCuadrillasBD()
    this.recalcularIndexGlobal();
  }

  recalcularIndexGlobal(): void {
    let contador = 1;
    this.listaEstructuradaCuadrillas.forEach((grupo) => {
      if (grupo.integrantes && grupo.integrantes.length > 0) {
        grupo.integrantes.forEach((usr: any) => {
          usr.indexGlobal = contador++;
        });
      }
    });
  }

  async quitarUsuarioDeCuadrilla(usr: any, grupoOrigenParam?: any): Promise<void> {
    const keyUsr = usr.id_usuario ?? usr.id;

    // 1. Obtener ID de la cuadrilla origen priorizando el parámetro o el objeto
    const idCuadrillaOrigen = grupoOrigenParam?.id_cuadrilla ?? usr.id_cuadrilla;

    // 2. Buscar cuadrilla origen y grupo sin cuadrilla (usando == para evitar fallos string/number)
    const grupoOrigen = grupoOrigenParam || this.listaEstructuradaCuadrillas.find(g => String(g.id_cuadrilla) === String(idCuadrillaOrigen));
    const grupoSinCuadrilla = this.listaEstructuradaCuadrillas.find(g => g.id_cuadrilla === null || g.id_cuadrilla === 0 || g.id_cuadrilla === undefined);

    if (!grupoOrigen) {
      console.error('No se localizó la cuadrilla origen del usuario:', usr);
      return;
    }

    // 3. Remover el usuario de la cuadrilla origen
    grupoOrigen.integrantes = grupoOrigen.integrantes.filter(u => {
      const currentId = u.id_usuario ?? u.id;
      return String(currentId) !== String(keyUsr);
    });

    // 4. Asignarle id_cuadrilla nulo y agregarlo a "Personal sin cuadrilla" si existe el grupo
    usr.id_cuadrilla = null;

    if (grupoSinCuadrilla) {
      // Validar que no exista previamente para evitar duplicados en la UI
      const existeEnSinCuadrilla = grupoSinCuadrilla.integrantes.some(u => String(u.id_usuario ?? u.id) === String(keyUsr));
      if (!existeEnSinCuadrilla) {
        grupoSinCuadrilla.integrantes.push(usr);
      }
    }

    // 5. Romper referencia para forzar detección de cambios en Angular
    this.listaEstructuradaCuadrillas = [...this.listaEstructuradaCuadrillas];

    // 6. Guardar estado actualizado en Base de Datos
    try {
      await this.guardarEstadoCuadrillasBD();
    } catch (error) {
      console.error('Error al auto-guardar desvinculación en BD:', error);
    }
  }

  eliminarOAnularActividad(act: ActividadCuadrilla): void {
    const estaEnSinAgrupamiento = !act.usuarios || act.usuarios === 'SR';

    if (estaEnSinAgrupamiento) {
      this.listaActividadesGlobal = this.listaActividadesGlobal.filter(a => a !== act);
    } else {
      act.usuarios = 'SR';
    }
    this.reagruparTodo();
  }

  calcularSumaHoras(actividades: ActividadCuadrilla[]): string {
    let totalMinutos = 0;
    actividades.forEach(act => {
      if (act.horas_laborada && act.horas_laborada.includes(':')) {
        const [h, m] = act.horas_laborada.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          totalMinutos += h * 60 + m;
        }
      }
    });

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  recalcularHorasLaboradasUsuarios(): void {
    this.listaUsuariosGlobal.forEach(usr => {
      let minutosUsuario = 0;
      this.listaActividadesGlobal.forEach(act => {
        if (act.usuarios && act.usuarios !== 'SR') {
          const idsAsignados = act.usuarios.split(',').map(id => Number(id.trim()));
          if (idsAsignados.includes(usr.id_usuario)) {
            if (act.horas_laborada && act.horas_laborada.includes(':')) {
              const [h, m] = act.horas_laborada.split(':').map(Number);
              if (!isNaN(h) && !isNaN(m)) {
                minutosUsuario += h * 60 + m;
              }
            }
          }
        }
      });

      const h = Math.floor(minutosUsuario / 60);
      const m = minutosUsuario % 60;
      usr['horas_acumuladas'] = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    });
  }

  moverActividadACuadrilla(act: ActividadCuadrilla, firmaCuadrillaDestino: string): void {
    if (!firmaCuadrillaDestino) return;
    act.usuarios = firmaCuadrillaDestino;
    this.reagruparTodo();
  }

  toggleModoAgrupar(): void {
    this.modoAgrupar = !this.modoAgrupar;

    if (this.modoAgrupar) {
      this.modoVincularPersonal = false;
      this.actualizarOpcionesCuadrillas(); // Carga fresca de opciones
    }
  }

  actualizarOpcionesCuadrillas(): void {
    this.opcionesCuadrillasDisponibles = this.listaEstructuradaCuadrillas.filter(
      (g) => g.id_cuadrilla !== null
    );
  }

  getCargoTipoFormat(usr: any): string {
    if (!usr) return '';

    const abreviatura = usr.abreviatura_cargo || '';

    // Buscar qué categoría tiene el valor 1 (categoria_t1, categoria_t2, etc.)
    let categoria = '';
    for (let i = 1; i <= 5; i++) {
      if (usr[`categoria_t${i}`] === 1) {
        categoria = `T${i}`;
        break;
      }
    }

    // Si tiene abreviatura y categoría, retorna "P - T1"
    if (abreviatura && categoria) {
      return `${abreviatura} - ${categoria}`;
    }

    // Si solo tiene abreviatura o descripción como fallback
    return abreviatura || usr.descripcion_cargo || '';
  }

  async eliminarCuadrilla(grupo: any): Promise<void> {
    if (!grupo || grupo.id_cuadrilla === null) return;

    this.mostrar_carga_todo = true;
    try {
      const formData = new FormData();
      formData.append('id_cuadrilla', grupo.id_cuadrilla.toString());
      formData.append('id_proyecto', this.id_proyecto.toString());

      await this.RecursosHumanosService.eliminarCuadrilla(formData);
      await this.guardarEstadoCuadrillasBD()
      await this.recargarTabla();
    } catch (error) {
      console.error('Error al eliminar la cuadrilla:', error);
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  toggleModoAgruparActividades() {
    this.modoAgruparActividades = !this.modoAgruparActividades;
    this.movimientosTemporales.clear();
    if (this.modoAgruparActividades) {
      this.actualizarOpcionesCabecerasActividades();
    }
  }

  actualizarOpcionesCabecerasActividades() {
    this.opcionesCabecerasDisponibles = this.listaEstructuradaActividades
      .filter(g => g.cuadrilla !== null)
      .map(g => ({ cuadrilla: g.cuadrilla, descripcion: g.descripcion }));
  }

  prepararMovimientoActividad(actividad: any, cuadrillaDestinoVal: string) {
    if (!cuadrillaDestinoVal) {
      this.movimientosTemporales.delete(actividad.id_actividad);
      return;
    }
    const idCuadrilla = Number(cuadrillaDestinoVal);
    this.movimientosTemporales.set(actividad.id_actividad, idCuadrilla);
  }

  async confirmarAgrupamientoActividades() {
    if (this.movimientosTemporales.size === 0) {
      this.modoAgruparActividades = false;
      return;
    }

    this.mostrar_carga_todo = true;
    try {
      for (const [idActividad, idCuadrilla] of this.movimientosTemporales.entries()) {
        // Buscar la actividad original
        const grupoSinAgrupar = this.listaEstructuradaActividades.find(g => g.cuadrilla === null);
        const act = grupoSinAgrupar?.actividades.find((a: any) => a.id_actividad === idActividad);

        if (act) {
          act.cuadrilla = idCuadrilla;
          await this.persistirActividad(act, 'GUARDAR', false);
        }
      }
      await this.recargarTablaActividades();
    } catch (error) {
      console.error('Error al agrupar actividades:', error);
    } finally {
      this.movimientosTemporales.clear();
      this.modoAgruparActividades = false;
      this.mostrar_carga_todo = false;
    }
  }

  async quitarDeAgrupamiento(act: any) {
    act.cuadrilla = 0; // Se manda 0/null para que el backend reconozca sin cuadrilla
    act.usuarios = 'SR';
    await this.persistirActividad(act, 'GUARDAR');
    this.recalcularTodo();
  }

  async eliminarActividadFisica(act: any) {

    const sw = await SwalService.confirm('Estas seguro?', 'Se eliminará esta actividad')
    if (sw.isConfirmed) {
      await this.persistirActividad(act, 'ELIMINAR');
      this.recalcularTodo();
    }
  }

  async eliminarCabeceraActividades(grupo: any) {
    const sw = await SwalService.confirm('Estas seguro?', `¿Desea eliminar la cabecera "${grupo.descripcion}" y todas sus actividades asignadas?`)
    if (sw.isConfirmed) {


      this.mostrar_carga_todo = true;
      try {
        for (const act of grupo.actividades) {
          await this.persistirActividad(act, 'ELIMINAR', false);
        }
        await this.recargarTablaActividades();
      } catch (error) {
        console.error('Error al eliminar cabecera:', error);
      } finally {
        this.mostrar_carga_todo = false;
      }
    }
  }

  iniciarEdicionCampo(act: any, campo: string, inputElement?: HTMLInputElement): void {
    // 1. Asignamos la propiedad que evalúa el *ngIf
    act.editandoCampo = campo;
    // 2. Guardamos una copia del valor actual antes de ser modificado
    this.valorOriginalEdicion = act[campo];

    // 3. Forzamos el foco e iteración de selección al input recién renderizado
    setTimeout(() => {
      if (inputElement) {
        inputElement.focus();
        if (typeof inputElement.select === 'function') {
          inputElement.select();
        }
      }
    }, 50);
  }

  async guardarEdicionCampo(act: any, campo: string): Promise<void> {
    // Si no está actualmente editando este campo, ignoramos para evitar ejecuciones dobles
    if (act.editandoCampo !== campo) {
      return;
    }

    const valorNuevo = act[campo];
    const valorViejo = this.valorOriginalEdicion;

    // Cerramos la edición de la celda
    act.editandoCampo = null;
    this.valorOriginalEdicion = null;

    // Si los valores formateados a texto son idénticos, no hacemos peticiones innecesarias
    if (String(valorNuevo ?? '').trim() === String(valorViejo ?? '').trim()) {
      return;
    }

    // Recalculamos totales o metrados locales
    if (typeof this.recalcularTodo === 'function') {
      this.recalcularTodo();
    }

    // Persistimos en base de datos
    try {
      await this.persistirActividad(act, 'GUARDAR', false);
    } catch (error) {
      console.error('Error al persistir la edición:', error);
    }
  }

  async onChangeTipo(act: any, nuevoTipo: string, tipoAnterior: string) {
    // 1. Si no hubo cambio de valor, finalizar
    if (nuevoTipo === tipoAnterior) return;

    // 2. REGLA: Si NO era 'TT' y se intenta cambiar a 'TT', bloqear el cambio
    if (tipoAnterior !== 'TT' && nuevoTipo === 'TT') {
      this.toaster.error(
        'No se permite cambiar de un tipo especial (HN, HE, etc.) a tipo TT.',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );

      // Forzamos la re-evaluación en el template restaurando la propiedad
      act.tipo = tipoAnterior;

      // Si la referencia directa no refresca el select visualmente en Angular,
      // puedes resetear temporalmente el valor o apoyarte en ChangeDetectorRef
      setTimeout(() => { act.tipo = tipoAnterior; }, 0);
      return;
    }

    // 3. REGLA: Si cambia desde 'TT' hacia otro tipo, limpiar la propiedad 'indice'
    if (tipoAnterior === 'TT' && nuevoTipo !== 'TT') {
      act.indice = null; // o '' según la estructura que manejes en tu Backend
    }

    // 4. Asignar el nuevo tipo a la actividad
    act.tipo = nuevoTipo;

    // 5. Recalcular contadores/agrupaciones y persistir en BD
    this.recalcularTodo();

    try {
      await this.persistirActividad(act, 'GUARDAR', false);
    } catch (error) {
      console.error('Error al actualizar el tipo de actividad:', error);
      // En caso de error en BD, revertir
      act.tipo = tipoAnterior;
    }
  }

  obtenerTextoAsignacion(act: any): string {
    return act.usuarios && act.usuarios !== '' ? act.usuarios : 'SR';
  }

  async persistirActividad(actividad: any, accion: 'GUARDAR' | 'ELIMINAR', carga = true) {
    if (carga) {
      this.mostrar_carga_todo = true;
    }

    try {
      let fechaRaw = actividad.fecha || (this.diaSeleccionado ? this.diaSeleccionado.fecha : '');

      // Formatear la fecha a YYYY-MM-DD
      if (fechaRaw.includes('T')) {
        fechaRaw = fechaRaw.split('T')[0];
      }

      const formData = new FormData();
      formData.append('id_actividad', (actividad.id_actividad || 0).toString());
      formData.append('id_proyecto', this.id_proyecto.toString());
      formData.append('descripcion', actividad.descripcion || '');
      formData.append('ubicacion', actividad.ubicacion || '');
      formData.append('unidad', actividad.unidad || '');
      formData.append('metrado', (actividad.metrado ?? 0).toString());
      formData.append('horas_laborada', actividad.horas_laborada || '00:00:00');
      formData.append('tipo', actividad.tipo || '');
      formData.append('indice', actividad.indice || '');
      formData.append('usuarios', actividad.usuarios || 'SR');
      formData.append('cuadrilla', (actividad.cuadrilla ?? 0).toString());
      formData.append('fecha', fechaRaw); // Enviar en formato YYYY-MM-DD
      formData.append('cabecera', (actividad.cabecera || '').toString());
      formData.append('accion', accion);
      await this.RecursosHumanosService.guardarActividadCuadrilla(formData);

      if (carga) {
        await this.recargarTablaActividades();
      }
    } catch (error) {
      console.error('Error al procesar actividad:', error);
    } finally {
      if (carga) {
        this.mostrar_carga_todo = false;
      }
    }
  }

  agruparActividades(listaPlana: ActividadCuadrilla[], listaUsuariosBase: any[] = []): any[] {
    if (!listaPlana || listaPlana.length === 0) return [];

    // Map temporal para agrupar por el texto/IDs de asignación en 'usuarios'
    const mapaPorUsuarios = new Map<string, ActividadCuadrilla[]>();

    listaPlana.forEach(act => {
      const asignacion = (act.usuarios || '').trim().toUpperCase();

      // Normalizar si está vacío o es 'SR'
      const clave = (!asignacion || asignacion === 'SR') ? 'SIN_AGRUPAR' : act.usuarios.trim();

      if (!mapaPorUsuarios.has(clave)) {
        mapaPorUsuarios.set(clave, []);
      }
      mapaPorUsuarios.get(clave)!.push(act);
    });

    const actividadesSinAgrupar: ActividadCuadrilla[] = [];
    const gruposEstructurados: any[] = [];

    // Procesar cada grupo de asignación
    mapaPorUsuarios.forEach((actividades, claveAsignacion) => {
      // Ordenar alfabéticamente por descripción dentro del grupo
      actividades.sort((a, b) => (a.descripcion || '').localeCompare(b.descripcion || ''));

      // Caso 1: Asignaciones "SR" o vacías -> Van a Sin Agrupar
      if (claveAsignacion === 'SIN_AGRUPAR') {
        actividadesSinAgrupar.push(...actividades);
      }
      // Caso 2: Tienen la misma asignación y son 2 o más actividades -> Generan Cabecera/Cuadrilla
      else if (actividades.length >= 2) {
        const primerRegistro = actividades[0];
        const idCuadrilla = primerRegistro.cuadrilla || primerRegistro.id_actividad;

        // Obtener el nombre descriptivo del/los usuario(s) agrupado(s)
        const nombreUsuarios = this.obtenerNombreUsuarios(claveAsignacion, listaUsuariosBase);
        const descripcionCabecera = `CUADRILLA - ${nombreUsuarios}`;

        gruposEstructurados.push({
          cuadrilla: idCuadrilla,
          descripcion: descripcionCabecera,
          actividades: actividades
        });
      }
      // Caso 3: Es una asignación única (1 sola actividad con ese usuario) -> Va a Sin Agrupar
      else {
        actividadesSinAgrupar.push(...actividades);
      }
    });

    // Agregar la sección "SIN AGRUPAMIENTO" al final si hay actividades sueltas
    if (actividadesSinAgrupar.length > 0) {
      // Ordenar alfabéticamente también las actividades sin agrupar
      actividadesSinAgrupar.sort((a, b) => (a.descripcion || '').localeCompare(b.descripcion || ''));

      gruposEstructurados.push({
        cuadrilla: null,
        descripcion: 'SIN AGRUPAMIENTO',
        actividades: actividadesSinAgrupar
      });
    }

    return gruposEstructurados;
  }

  obtenerNombreUsuarios(idsUsuariosStr: string, listaUsuariosBase: any[]): string {
    if (!idsUsuariosStr || idsUsuariosStr === 'SR') return 'Sin Asignar';

    // Soportar tanto coma como pipe como separador
    const separador = idsUsuariosStr.includes('|') ? '|' : ',';
    const ids = idsUsuariosStr.split(separador).map(id => id.trim()).filter(id => id !== '');

    const nombres = ids.map(id => {
      // Buscar coincidencia flexible por ID
      const usr = listaUsuariosBase.find(u => {
        const idReal = String(u.id_usuario ?? u.id_persona ?? u.id).trim();
        return idReal === String(id).trim();
      });

      if (!usr) return `Usuario ${id}`;

      // Obtener la cadena de nombre
      const nombreCompleto = usr.nombres || usr.nombre || usr.usuario || '';

      // Extraer solo el primer nombre (ej: "Rosa Isabel" -> "Rosa")
      const primerNombre = nombreCompleto.trim().split(' ')[0] || `Usuario ${id}`;

      return primerNombre;
    });

    return nombres.join(', ');
  }

  obtenerColorTipo(tipo: string): string {
    if (!tipo) return 'bg-light text-dark';

    const coincidencia = this.tiposTrabajo.find(t => t.value === tipo);
    return coincidencia ? coincidencia.bgClass : 'bg-light text-dark';
  }

  obtenerIdsDesdeIndexGlobal(entradaInput: string): string {
    if (!entradaInput || entradaInput.trim().toUpperCase() === 'SR') {
      return 'SR';
    }

    const todosLosIntegrantes = this.listaEstructuradaCuadrillas.reduce(
      (acc: any[], c: any) => acc.concat(c.integrantes || []),
      []
    );

    const indicesSeleccionados = new Set<number>();

    // Separar el input del usuario por comas
    const bloques = entradaInput.split(',');

    for (const bloque of bloques) {
      const item = bloque.trim();
      if (item.includes('-')) {
        const [inicio, fin] = item.split('-').map(v => parseInt(v.trim(), 10));
        if (!isNaN(inicio) && !isNaN(fin)) {
          for (let i = Math.min(inicio, fin); i <= Math.max(inicio, fin); i++) {
            indicesSeleccionados.add(i);
          }
        }
      } else {
        const num = parseInt(item, 10);
        if (!isNaN(num)) {
          indicesSeleccionados.add(num);
        }
      }
    }

    const idsUsuariosEncontrados: number[] = [];

    indicesSeleccionados.forEach(idx => {
      const integrante = todosLosIntegrantes.find((user: any) => user.indexGlobal === idx);
      if (integrante && integrante.id_usuario) {
        idsUsuariosEncontrados.push(integrante.id_usuario);
      }
    });

    if (idsUsuariosEncontrados.length === 0) {
      return 'SR';
    }

    // Retornar los IDs reales separados estrictamente por coma sin espacios para la BD
    return idsUsuariosEncontrados.join(',');
  }

  async agregarActividadSinAgrupar() {
    const nuevaActividad = {
      id_actividad: 0,
      id_proyecto: this.id_proyecto,
      descripcion: '',
      ubicacion: '',
      unidad: '',
      metrado: 0,
      horas_laborada: '00:00:00',
      tipo: 'TC',
      indice: 0,
      usuarios: 'SR',
      cuadrilla: 0,
      cabecera: ''
    };

    // Persistir en backend y recargar la lista de actividades
    await this.persistirActividad(nuevaActividad, 'GUARDAR');
  }

  convertirAHorasMinutos(tiempoStr: string): number {
    if (!tiempoStr || tiempoStr.trim() === '' || tiempoStr === 'SR') return 0;
    const partes = tiempoStr.split(':').map(v => parseInt(v.trim(), 10));
    const horas = partes[0] || 0;
    const minutos = partes[1] || 0;
    return (horas * 60) + minutos;
  }

  convertirMinutosAHHMM(minutosTotales: number): string {
    if (isNaN(minutosTotales) || minutosTotales <= 0) return '00:00';
    const hh = Math.floor(minutosTotales / 60);
    const mm = minutosTotales % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  recalcularHorasCabeceraAgrupamientos(): void {
    if (!this.listaEstructuradaActividades || this.listaEstructuradaActividades.length === 0) {
      return;
    }

    this.listaEstructuradaActividades.forEach((grupo: any) => {
      // Solo calculamos si pertenece a un grupo/cuadrilla real
      if (grupo.cuadrilla !== null && grupo.actividades && grupo.actividades.length > 0) {
        let minutosTotalesGrupo = 0;

        grupo.actividades.forEach((actividad: any) => {
          const tiempoActividad = actividad.horas_laborada || '00:00';
          minutosTotalesGrupo += this.convertirAHorasMinutos(tiempoActividad);
        });

        grupo.horasTotal = this.convertirMinutosAHHMM(minutosTotalesGrupo);
      } else {
        grupo.horasTotal = '00:00';
      }
    });
  }

  recalcularHorasJornadaUsuarios(): void {
    if (!this.listaEstructuradaCuadrillas || this.listaEstructuradaCuadrillas.length === 0) {
      return;
    }

    // Mapa para rastrear los minutos acumulados por cada id_usuario
    const minutosPorUsuario = new Map<string, number>();

    // 1. Inicializar en 0 los minutos de todos los usuarios
    this.listaEstructuradaCuadrillas.forEach((cuadrilla: any) => {
      (cuadrilla.integrantes || []).forEach((integrante: any) => {
        const idReal = String(integrante.id_usuario ?? integrante.id_persona ?? integrante.id).trim();
        minutosPorUsuario.set(idReal, 0);
      });
    });

    // 2. Acumular las horas de todas las actividades de todos los grupos
    this.listaEstructuradaActividades.forEach((grupo: GrupoActividades) => {
      (grupo.actividades || []).forEach((act: any) => {
        if (!act.usuarios || act.usuarios === 'SR') return;

        const tiempoActividad = act.horas_laborada || '00:00';
        const minutosActividad = this.convertirAHorasMinutos(tiempoActividad);

        if (minutosActividad <= 0) return;

        // Obtener los IDs guardados en la BD (separados por coma o pipe)
        const separador = act.usuarios.includes('|') ? '|' : ',';
        const idsAsignados = String(act.usuarios)
          .split(separador)
          .map(id => id.trim())
          .filter(id => id !== '' && id !== 'SR');

        // Sumar los minutos de la actividad a cada usuario asignado
        idsAsignados.forEach(idUser => {
          const acumuladoActual = minutosPorUsuario.get(idUser) || 0;
          minutosPorUsuario.set(idUser, acumuladoActual + minutosActividad);
        });
      });
    });

    // 3. Asignar el total en formato HH:MM a cada integrante de las cuadrillas
    this.listaEstructuradaCuadrillas.forEach((cuadrilla: any) => {
      (cuadrilla.integrantes || []).forEach((integrante: any) => {
        const idReal = String(integrante.id_usuario ?? integrante.id_persona ?? integrante.id).trim();
        const minutosTotales = minutosPorUsuario.get(idReal) || 0;

        // Guarda la hora acumulada en el atributo visual de la cuadrilla
        integrante.horaJornada = this.convertirMinutosAHHMM(minutosTotales);
      });
    });
  }

  recalcularTodo(): void {
    this.recalcularHorasCabeceraAgrupamientos();
    this.recalcularHorasJornadaUsuarios();
  }

  abrirModalReemplazarCuadrilla() {
    this.fechaOrigenConsulta = '';
    this.reemplazarTareas = false;
    this.cuadrillasRecuperadasModal = [];
    this.consultadoSinResultados = false;
    this.modalReemplazarCuadrilla.show();
  }

  cerrarModalReemplazar() {
    this.fechaOrigenConsulta = '';
    this.reemplazarTareas = false;
    this.cuadrillasRecuperadasModal = [];
    this.consultadoSinResultados = false;

    // NUNCA hacer: this.diaSeleccionado = null;
    this.modalReemplazarCuadrilla.hide();
  }

  async consultarCuadrillaOrigen() {
    if (!this.fechaOrigenConsulta) return;

    try {
      this.mostrar_carga_todo = true;
      this.consultadoSinResultados = false;

      // Consultas idénticas a la lógica de seleccionDia()
      const usuarios: any[] = await this.listarRegistrosAsistencia(this.fechaOrigenConsulta);
      const cuadrillas: any[] = await this.listarCuadrillaFechaOMayor(this.fechaOrigenConsulta);

      // Procesa y arma la estructura para mostrar en la tabla
      this.cuadrillasRecuperadasModal = this.procesarEstructuraCuadrillas(usuarios || [], cuadrillas || []);

      if (!this.cuadrillasRecuperadasModal || this.cuadrillasRecuperadasModal.length === 0) {
        this.consultadoSinResultados = true;
      }

    } catch (error) {
      console.error('Error al consultar cuadrilla de fecha origen:', error);
      this.cuadrillasRecuperadasModal = [];
      this.consultadoSinResultados = true;
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  async confirmarDuplicacion() {
    if (!this.fechaOrigenConsulta || !this.diaSeleccionado?.fecha) {
      return;
    }
    const sw = await SwalService.confirm('Estas seguro?', 'Se reemplazara el dia con las cuadrillas seleccionadas')
    if (sw.isConfirmed) {
      // 1. Guardar una copia de la fecha destino como cadena (primitivo seguro)
      const fechaDestinoStr = String(this.diaSeleccionado.fecha);

      try {
        this.mostrar_carga_todo = true;

        const formData = new FormData();
        formData.append('id_proyecto', this.id_proyecto.toString());
        formData.append('fecha_origen', this.fechaOrigenConsulta);
        formData.append('fecha_destino', fechaDestinoStr);
        formData.append('reemplazar_tareas', this.reemplazarTareas ? 'true' : 'false');

        // 2. Ejecutar duplicación en BD
        await this.RecursosHumanosService.duplicarCuadrillasDia(formData);

        // 3. Cerrar Modal
        this.cerrarModalReemplazar();

        // 4. Recargar la tabla pasando la fecha destino explícita
        await this.recargarTabla(fechaDestinoStr);

      } catch (error) {
        console.error('Error al duplicar cuadrilla:', error);
      } finally {
        this.mostrar_carga_todo = false;
      }
    }
  }

  abrirModalCopiarActividades() {
    this.fechaOrigenActividades = '';
    this.listaActividadesOrigen = [];
    this.listaActividadesAcumuladas = []; // Reiniciar acumuladas al abrir
    this.consultadoActividadesSinResultados = false;
    this.seleccionarTodosOrigen = false;
    this.modalCopiarActividades.show();
  }

  // Método para cerrar el modal
  cerrarModalCopiarActividades() {
    this.modalCopiarActividades.hide();
  }

  // Consultar actividades del día origen seleccionado (Lista simple sin agrupar)
  async consultarActividadesOrigen() {
    if (!this.fechaOrigenActividades || !this.id_proyecto) return;

    try {
      this.mostrar_carga_todo = true;
      this.consultadoActividadesSinResultados = false;
      this.seleccionarTodosOrigen = false;

      const respuesta: any[] = await this.RecursosHumanosService.listarActividadesCuadrilla({
        id_proyecto: this.id_proyecto,
        fecha: this.fechaOrigenActividades
      });

      const listaPlana = respuesta || [];

      // Mapear agregando la propiedad 'seleccionado' predeterminada en true
      this.listaActividadesOrigen = listaPlana
        .filter((item: any) => item.cabecera !== 1)
        .map((item: any) => ({
          ...item,
          seleccionado: true
        }));

      this.seleccionarTodosOrigen = this.listaActividadesOrigen.length > 0;

      if (this.listaActividadesOrigen.length === 0) {
        this.consultadoActividadesSinResultados = true;
      }
    } catch (error) {
      console.error('Error al consultar actividades origen:', error);
      this.listaActividadesOrigen = [];
      this.consultadoActividadesSinResultados = true;
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  toggleSeleccionarTodosOrigen() {
    this.listaActividadesOrigen.forEach(item => item.seleccionado = this.seleccionarTodosOrigen);
  }

  contarSeleccionadas(): number {
    return this.listaActividadesOrigen.filter(a => a.seleccionado).length;
  }

  agregarSeleccionadasACesta() {
    const seleccionadas = this.listaActividadesOrigen.filter(a => a.seleccionado);

    if (seleccionadas.length === 0) {
      // alert('Selecciona al menos una actividad.');
      this.toaster.error(
        'Selecciona al menos una actividad.',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    }

    seleccionadas.forEach(origen => {
      this.listaActividadesAcumuladas.push({
        id_proyecto: this.id_proyecto,
        descripcion: origen.descripcion || '',
        ubicacion: origen.ubicacion || '',
        unidad: origen.unidad || '',
        metrado: origen.metrado ?? 0,
        tipo: origen.tipo || 'TC',
        fechaOrigenReferencia: this.fechaOrigenActividades
      });

      // Desmarcar el checkbox de la fila agregada para evitar duplicar por error
      origen.seleccionado = false;
    });

    this.seleccionarTodosOrigen = false;
  }

  quitarDeAcumulados(index: number) {
    this.listaActividadesAcumuladas.splice(index, 1);
  }

  limpiarListaAcumulada() {
    this.listaActividadesAcumuladas = [];
  }
  // GUARDAR: Copia la lista acumulada hacia el día de destino sin borrar
  async confirmarGuardarActividadesAcumuladas() {
    if (!this.diaSeleccionado || !this.diaSeleccionado.fecha || !this.id_proyecto) return;
    if (this.listaActividadesAcumuladas.length === 0) return;

    let fechaDestinoStr: string = String(this.diaSeleccionado.fecha);
    if (fechaDestinoStr.includes('T')) {
      fechaDestinoStr = fechaDestinoStr.split('T')[0];
    }

    this.cargandoCopiaActividades = true;
    this.mostrar_carga_todo = true;

    try {
      // Mapear objetos garantizando valores válidos en la estructura DTO
      const payloadEnvio = this.listaActividadesAcumuladas.map((item, idx) => ({
        id_actividad: 0,
        id_proyecto: this.id_proyecto,
        descripcion: String(item.descripcion || ''),
        ubicacion: String(item.ubicacion || ''),
        unidad: String(item.unidad || ''),
        metrado: Number(item.metrado || 0),
        horas_laborada: '00:00:00',
        tipo: String(item.tipo || 'TC'),
        indice: idx + 1,
        usuarios: '', // Viaja como cadena vacía para que el SP asigne 'SR' por defecto
        cuadrilla: 0,
        fecha: fechaDestinoStr,
        cabecera: ''
      }));
      await this.RecursosHumanosService.guardarActividadesMasivo(payloadEnvio);

      this.cerrarModalCopiarActividades();

      // Actualizar la vista del día seleccionado
      let diaObjetivo = this.dias?.find((d: any) => String(d.fecha) === fechaDestinoStr);
      if (!diaObjetivo) {
        diaObjetivo = { fecha: fechaDestinoStr };
      }
      await this.seleccionDia(diaObjetivo);

    } catch (error) {
      console.error('Error al guardar actividades acumuladas:', error);
    } finally {
      this.cargandoCopiaActividades = false;
      this.mostrar_carga_todo = false;
    }
  }

  toggleModoVincularPersonal(): void {
    this.modoVincularPersonal = !this.modoVincularPersonal;
    if (!this.modoVincularPersonal) {
      this.limpiarSeleccionesVincular();
    }
  }

  limpiarSeleccionesVincular(): void {
    this.usuariosSeleccionadosSet.clear();
    this.actividadesSeleccionadasSet.clear();
  }

  limpiarSelecciones(): void {
    this.usuariosSeleccionadosMap.clear();
    this.actividadesSeleccionadasMap.clear();
  }

  getUserIdKey(usr: any): string {
    const id = usr.id_usuario ?? usr.id_persona ?? usr.id;
    return String(id).trim();
  }

  getActividadIdKey(act: any): string {
    const id = act.id_actividad_cuadrilla ?? act.id_actividad ?? act.id;
    return String(id).trim();
  }

  toggleSeleccionUsuario(usr: any, checked: boolean): void {
    const key = this.getUserIdKey(usr);
    if (!key) return;

    if (checked) {
      this.usuariosSeleccionadosSet.add(key);
    } else {
      this.usuariosSeleccionadosSet.delete(key);
    }
  }

  esUsuarioSeleccionado(usr: any): boolean {
    return this.usuariosSeleccionadosSet.has(this.getUserIdKey(usr));
  }

  toggleSeleccionarCuadrilla(grupoUsr: any, checked: boolean): void {
    (grupoUsr.integrantes || []).forEach((usr: any) => {
      this.toggleSeleccionUsuario(usr, checked);
    });
  }

  esCuadrillaTotalmenteSeleccionada(grupoUsr: any): boolean {
    if (!grupoUsr.integrantes || grupoUsr.integrantes.length === 0) return false;
    return grupoUsr.integrantes.every((usr: any) => this.esUsuarioSeleccionado(usr));
  }

  toggleSeleccionarTodosUsuarios(checked: boolean): void {
    this.listaEstructuradaCuadrillas.forEach(grupo => {
      (grupo.integrantes || []).forEach((usr: any) => {
        this.toggleSeleccionUsuario(usr, checked);
      });
    });
  }

  toggleSeleccionActividad(act: any, checked: boolean): void {
    const key = this.getActividadIdKey(act);
    if (!key) return;

    if (checked) {
      this.actividadesSeleccionadasSet.add(key);
    } else {
      this.actividadesSeleccionadasSet.delete(key);
    }
  }

  toggleSeleccionarGrupoActividades(grupo: any, checked: boolean): void {
    (grupo.actividades || []).forEach((act: any) => {
      this.toggleSeleccionActividad(act, checked);
    });
  }

  esActividadSeleccionada(act: any): boolean {
    return this.actividadesSeleccionadasSet.has(this.getActividadIdKey(act));
  }

  esGrupoActividadesTotalmenteSeleccionado(grupo: any): boolean {
    if (!grupo.actividades || grupo.actividades.length === 0) return false;
    return grupo.actividades.every((act: any) => this.esActividadSeleccionada(act));
  }

  toggleSeleccionarTodasActividades(checked: boolean): void {
    this.listaEstructuradaActividades.forEach(grupo => {
      (grupo.actividades || []).forEach((act: any) => {
        this.toggleSeleccionActividad(act, checked);
      });
    });
  }

  obtenerIndexGlobalDesdeIds(cadenaIds: string): string {
    if (!cadenaIds || cadenaIds.trim() === '' || cadenaIds.toUpperCase() === 'SR') {
      return 'SR';
    }

    // Soportar tanto coma como pipe si venían de datos antiguos
    const separador = cadenaIds.includes('|') ? '|' : ',';
    const idsArray = cadenaIds
      .split(separador)
      .map(id => id.trim())
      .filter(id => id !== '' && id !== 'SR');

    const indices: number[] = [];

    idsArray.forEach(idStr => {
      // Buscar id_usuario tanto como número como string
      const idNum = parseInt(idStr, 10);
      const indexGlobal = this.mapIdUserToIndexGlobal.get(idNum) ?? this.mapIdUserToIndexGlobal.get(idStr as any);

      if (indexGlobal !== undefined && !indices.includes(indexGlobal)) {
        indices.push(indexGlobal);
      }
    });

    // Ordenar los índices de menor a mayor (1, 2, 3...)
    indices.sort((a, b) => a - b);

    return indices.length > 0 ? indices.join(', ') : 'SR';
  }

  obtenerIdsDesdeIndexGlobales(cadenaIndexes: string): string {
    if (!cadenaIndexes || cadenaIndexes.trim() === '' || cadenaIndexes.toUpperCase() === 'SR') {
      return 'SR';
    }

    const separador = cadenaIndexes.includes('|') ? '|' : ',';
    const indexesArray = cadenaIndexes
      .split(separador)
      .map(idx => parseInt(idx.trim(), 10))
      .filter(idx => !isNaN(idx));

    if (indexesArray.length === 0) return 'SR';

    const mapaIndicesConId: { indexGlobal: number; idUsuario: string }[] = [];

    indexesArray.forEach(idx => {
      const idUser = this.mapIndexGlobalToIdUser.get(idx);
      if (idUser !== undefined) {
        mapaIndicesConId.push({ indexGlobal: idx, idUsuario: String(idUser) });
      }
    });

    mapaIndicesConId.sort((a, b) => a.indexGlobal - b.indexGlobal);

    // Guardar internamente separado por comas
    return mapaIndicesConId.map(item => item.idUsuario).join(',');
  }

  async onBlurAsignacionPersonal(act: any, valorInput: string): Promise<void> {
    if (act.editandoCampo !== 'usuarios' && act.editandoCampo !== 'personal') {
      return;
    }

    act.editandoCampo = null;

    const nuevosIds = this.obtenerIdsDesdeIndexGlobales(valorInput);

    if (act.usuarios !== nuevosIds) {
      act.usuarios = nuevosIds;

      // AVISO: Asegurar que la fecha pertenezca al día actualmente seleccionado si act.fecha viene undefined
      if (!act.fecha && this.diaSeleccionado) {
        act.fecha = this.diaSeleccionado.fecha;
      }

      // Reestructurar memoria
      this.reestructurarYRecalcular();

      // Guardar en BD pasando 'false' en el último parámetro si no deseas destruir la estructura visual local con un reload pesado
      try {
        await this.persistirActividad(act, 'GUARDAR', false);
      } catch (error) {
        console.error('Error al persistir la asignación de usuarios:', error);
      }
    }
  }

  procesarVinculacionMasiva(): void {
    const arrayUsuariosIds = Array.from(this.usuariosSeleccionadosSet); // IDs reales de BD seleccionados
    const arrayActividadesIds = Array.from(this.actividadesSeleccionadasSet); // IDs de actividades seleccionadas

    if (arrayUsuariosIds.length === 0 || arrayActividadesIds.length === 0) {
      // alert('Debe seleccionar al menos un usuario y una actividad.');
      this.toaster.error(
        'Debe seleccionar al menos un usuario y una actividad.',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    }

    // Recorrer todas las actividades
    this.listaEstructuradaActividades.forEach(grupo => {
      (grupo.actividades || []).forEach(act => {
        const actKey = this.getActividadIdKey(act);

        // Si la actividad fue seleccionada en el checkbox
        if (this.actividadesSeleccionadasSet.has(actKey)) {
          let idsExistentes: string[] = [];

          // Leer los IDs actuales si la actividad ya tenía asignación
          if (act.usuarios && act.usuarios !== 'SR') {
            const separador = act.usuarios.includes('|') ? '|' : ',';
            idsExistentes = act.usuarios
              .split(separador)
              .map((id: string) => id.trim())
              .filter((id: string) => id !== '' && id !== 'SR');
          }

          // Acumular los usuarios seleccionados junto a los que ya tenía sin duplicar
          const setIdsUnicos = new Set<string>([...idsExistentes, ...arrayUsuariosIds]);
          const idsCombinados = Array.from(setIdsUnicos);

          // Mapear con su indexGlobal para ordenar correlativamente
          const listaConIndex: { indexGlobal: number; idUsuario: string }[] = [];
          idsCombinados.forEach(idUserStr => {
            const idNum = parseInt(idUserStr, 10);
            const idxGlobal = this.mapIdUserToIndexGlobal.get(idNum) ?? 999999;
            listaConIndex.push({ indexGlobal: idxGlobal, idUsuario: idUserStr });
          });

          // Ordenar según el correlativo del personal (1, 2, 3...)
          listaConIndex.sort((a, b) => a.indexGlobal - b.indexGlobal);

          // Asignar los IDs a la actividad usando COMA como separador
          act.usuarios = listaConIndex.map(item => item.idUsuario).join(',');
        }
      });
    });

    // Reorganizar las cabeceras (para que si ahora comparten 1,2,3 pasen a la cuadrilla correspondiente)
    this.reestructurarYRecalcular();

    // Desactivar modo vinculación
    this.toggleModoVincularPersonal();
  }

  reestructurarYRecalcular(): void {
    // 1. Extraer todas las actividades en una lista plana
    let listaPlanaTotal: any[] = [];
    this.listaEstructuradaActividades.forEach(grupo => {
      if (grupo.actividades) {
        listaPlanaTotal.push(...grupo.actividades);
      }
    });

    // 2. Reorganizar cabeceras de actividades mediante agruparActividades()
    this.listaEstructuradaActividades = this.agruparActividades(listaPlanaTotal, this.listaBaseUsuarios);

    // 3. Recalcular las horas de cabeceras y jornadas de personal
    this.recalcularTodo();
  }

  toggleSliderUsuario(usr: any, activo: boolean): void {
    const key = usr.id_usuario ?? usr.id;
    if (activo) {
      this.usuariosSlidersMap.set(key, usr);
    } else {
      this.usuariosSlidersMap.delete(key);
    }
  }

  async moverUsuariosMarcadosACuadrilla(grupoCuadrillaDestino: any): Promise<void> {
    if (this.usuariosSlidersMap.size === 0) {
      // alert('Debe activar el slider de al menos un integrante de "Personal sin cuadrilla".');
      this.toaster.error(
        'Debe activar el slider de al menos un integrante de "Personal sin cuadrilla".',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    }

    // 1. Obtener la clave de los usuarios marcados
    const idsSeleccionados = Array.from(this.usuariosSlidersMap.keys());

    // 2. Localizar el grupo "Personal sin cuadrilla"
    const grupoSinCuadrilla = this.listaEstructuradaCuadrillas.find(g => g.id_cuadrilla === null);

    if (!grupoSinCuadrilla || !grupoSinCuadrilla.integrantes) {
      console.error('No se encontró el grupo "Personal sin cuadrilla".');
      return;
    }

    // 3. Filtrar y transferir usuarios en memoria
    const usuariosAMover = grupoSinCuadrilla.integrantes.filter(usr => {
      const keyUsr = usr.id_usuario ?? usr.id;
      return idsSeleccionados.includes(keyUsr);
    });

    usuariosAMover.forEach(usr => {
      usr.id_cuadrilla = grupoCuadrillaDestino.id_cuadrilla;
    });

    grupoCuadrillaDestino.integrantes.push(...usuariosAMover);

    grupoSinCuadrilla.integrantes = grupoSinCuadrilla.integrantes.filter(usr => {
      const keyUsr = usr.id_usuario ?? usr.id;
      return !idsSeleccionados.includes(keyUsr);
    });

    // Limpiar selección de sliders y actualizar vista en memoria
    this.usuariosSlidersMap.clear();
    this.listaEstructuradaCuadrillas = [...this.listaEstructuradaCuadrillas];

    // 4. GUARDADO AUTOMÁTICO EN LA BASE DE DATOS
    try {
      await this.guardarEstadoCuadrillasBD();
    } catch (error) {
      console.error('Error al auto-guardar cuadrillas en BD:', error);
    }
  }

  async agregarMultiplesActividades(): Promise<void> {
    const result = await SwalService.inputNumber('Ingrese la cantidad de actividades a crear:', 'Aceptar');

    // Si el usuario presiona "Cancelar" o cierra el modal, result.isConfirmed será false
    if (!result.isConfirmed) return;

    const cantidad = parseInt(result.value, 10);

    if (isNaN(cantidad) || cantidad <= 0) {
      this.toaster.error(
        'Ingrese una cantidad válida mayor a 0.',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    }

    this.mostrar_carga_todo = true;

    try {
      const fechaRaw = this.diaSeleccionado ? this.diaSeleccionado.fecha : '';
      const fechaLimpia = fechaRaw.includes('T') ? fechaRaw.split('T')[0] : fechaRaw;

      // Crear la lista con las N actividades en memoria
      const listaNuevasActividades: any[] = [];
      for (let i = 0; i < cantidad; i++) {
        listaNuevasActividades.push({
          id_actividad: 0,
          id_proyecto: this.id_proyecto,
          descripcion: '',
          ubicacion: '',
          unidad: '',
          metrado: 0,
          horas_laborada: '00:00:00',
          tipo: 'TC',
          indice: '0',       // Mantén '0' explícito en lugar de ''
          usuarios: 'SR',
          cuadrilla: 0,
          fecha: fechaLimpia,
          cabecera: ''
        });
      }

      // Petición única enviando el array JSON  
      await this.RecursosHumanosService.guardarActividadesMasivo(listaNuevasActividades);

      // Recargar tabla una sola vez
      await this.recargarTablaActividades();

    } catch (error) {
      console.error('Error al insertar actividades masivas:', error);
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  async abrirModalVinculacion() {
    if (!this.diaSeleccionado) return;

    // 1. Activar el estado de vinculación para mostrar las columnas de Checkboxes
    this.modoVincularPersonal = true;

    // 2. Limpiar selecciones previas
    this.listaActividadesGeneradas = [];
    if (this.usuariosSeleccionadosMap) {
      this.usuariosSeleccionadosMap.clear();
    }

    // 3. Activar el bloqueador de pantalla e abrir el modal INMEDIATAMENTE
    this.mostrar_carga_todo = true;
    if (this.modalVinculacionPresupuesto) {
      this.modalVinculacionPresupuesto.show();
    }

    try {
      // 4. Cargar la data del presupuesto en segundo plano con el modal ya visible
      await this.cargarPresupuesto();
      this.pintar()
    } catch (error) {
      console.error('Error al cargar presupuesto:', error);
    } finally {
      // 5. Apagar el bloqueador de carga una vez finalizada la consulta
      this.mostrar_carga_todo = false;
    }
  }

  cerrarModalVinculacion(): void {
    this.modoVincularPersonal = false;
    this.modalVinculacionPresupuesto.hide();
  }

  async cargarPresupuesto() {
    const obj = {
      id_proyecto: this.id_proyecto
    };

    try {
      const resp = await this.RecursosHumanosService.listarPresupuestoProyecto(obj);

      if (resp && resp.length > 0) {
        // Mapeamos los datos y añadimos la propiedad 'seleccionado' para los checkboxes
        this.listaPresupuesto = resp.map((item: any) => ({
          ...item,
          seleccionado: false
        }));
      } else {
        this.listaPresupuesto = [];
      }
    } catch (error) {
      console.error('Error al cargar presupuesto:', error);
      this.listaPresupuesto = [];
    }
  }

  async guardarActividadesPresupuestoVinculadas() {
    if (!this.diaSeleccionado?.fecha || !this.id_proyecto) {
      // alert('Información de proyecto o fecha no válida.');
      this.toaster.error(
        'Información de proyecto o fecha no válida.',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    }

    if (this.listaActividadesGeneradas.length === 0) {
      this.toaster.error(
        'No hay partidas generadas para guardar.',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    }

    // Normalización del formato de fecha (YYYY-MM-DD)
    let fechaDestinoStr: string = String(this.diaSeleccionado?.fecha);
    if (fechaDestinoStr.includes('T')) {
      fechaDestinoStr = fechaDestinoStr.split('T')[0];
    }

    // this.cargandoGuardado = true;
    this.mostrar_carga_todo = true;

    try {
      // Mapear objetos ajustados estrictamente a la estructura del DTO
      const payloadEnvio = this.listaActividadesGeneradas.map((item, idx) => ({
        id_actividad: 0,
        id_proyecto: this.id_proyecto,
        descripcion: String(item.descripcion || ''),
        ubicacion: String(item.ubicacion || ''),
        unidad: String(item.unidad || ''),
        metrado: Number(item.metrado || 0),
        horas_laborada: '00:00:00',
        tipo: String(item.tipo || 'TT'), // Mantiene 'TT'
        indice: item.indice || '',
        usuarios: String(item.usuarios || ''), // Viaja como "47,48"
        cuadrilla: 0,
        fecha: fechaDestinoStr,
        cabecera: ''
      }));

      // Enviar al servicio
      await this.RecursosHumanosService.guardarActividadesMasivo(payloadEnvio);

      // Limpiar y cerrar modal tras guardar con éxito
      this.listaActividadesGeneradas = [];
      this.usuariosSeleccionadosMap.clear();
      this.cerrarModalVinculacion();

      // Refrescar la vista del día actual
      let diaObjetivo = this.dias?.find((d: any) => String(d.fecha) === fechaDestinoStr);
      if (!diaObjetivo) {
        diaObjetivo = { fecha: fechaDestinoStr };
      }
      await this.seleccionDia(diaObjetivo);

    } catch (error) {
      console.error('Error al guardar actividades vinculadas del presupuesto:', error);
      SwalService.error()
    } finally {

      this.mostrar_carga_todo = false;
    }
  }

  generarActividadesPartidas(): void {
    const usuariosArr: any[] = Array.from(this.usuariosSeleccionadosModalMap.values());
    const partidasSeleccionadas = this.listaPresupuesto.filter(p => p.seleccionado && this.esPartidaValida(p));

    if (usuariosArr.length === 0) {
      this.toaster.error(
        'Debe marcar al menos un usuario de la tabla de personal.',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    }

    if (partidasSeleccionadas.length === 0) {
      this.toaster.error(
        'Debe marcar al menos una partida que contenga valor de Unidad.',
        '',
        {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        }
      );
      return;
    }

    // 1. Ordenar personal por indexGlobal
    usuariosArr.sort((a: any, b: any) => {
      const idxA = Number(a.indexGlobal) || 0;
      const idxB = Number(b.indexGlobal) || 0;
      return idxA - idxB;
    });

    // 2. Concatenación de IDs reales de BD para enviar en la propiedad 'usuarios' (ej: "41,42,46")
    const cadenaIdsUsuariosBD = usuariosArr
      .map(u => u.id_usuario ?? u.id)
      .filter(id => id !== undefined && id !== null)
      .join(',');

    // 3. Cadena de correlativos de personal para la columna 'Asignación' (ej: "1, 2, 3")
    const cadenaIndexVisual = usuariosArr
      .map(u => u.indexGlobal)
      .filter(idx => idx !== undefined && idx !== null)
      .join(', ');

    // 4. Concatenación de los índices de las partidas con '|' (ej: "5" o "5|6|7")
    const cadenaIndicesPartidas = partidasSeleccionadas
      .map(p => p.indice)
      .filter(idx => idx !== undefined && idx !== null)
      .join('|');

    // Formato de fecha YYYY-MM-DD
    let fechaDestinoStr: string = String(this.diaSeleccionado?.fecha || '');
    if (fechaDestinoStr.includes('T')) {
      fechaDestinoStr = fechaDestinoStr.split('T')[0];
    }

    // 5. Crear los objetos generados
    partidasSeleccionadas.forEach(partida => {
      const nuevaActividad: any = {
        id_actividad: 0,
        id_proyecto: this.id_proyecto,
        descripcion: partida.descripcion,
        ubicacion: '',
        unidad: partida.unidad,
        metrado: 0,
        horas_laborada: '00:00:00',
        tipo: 'TT',
        usuarios: cadenaIdsUsuariosBD,    // IDs de usuarios en BD: "41,42,46"
        asignacionVisual: cadenaIndexVisual, // Correlativos en vista: "1, 2, 3"
        indice: cadenaIndicesPartidas,    // Cadena concatenada: "5" o "5|6|7"
        cuadrilla: 0,
        fecha: fechaDestinoStr,
        cabecera: ''
      };

      this.listaActividadesGeneradas.push(nuevaActividad);
    });

    // Limpiar checkboxes
    this.limpiarSeleccionesEnTablasModal();
  }

  limpiarSeleccionesEnTablasModal(): void {
    // Vaciar solo el mapa del modal
    this.usuariosSeleccionadosModalMap.clear();

    // Desmarcar partidas del presupuesto
    if (this.listaPresupuesto && this.listaPresupuesto.length > 0) {
      this.listaPresupuesto.forEach(partida => {
        partida.seleccionado = false;
      });
    }
  }

  esPartidaValida(partida: any): boolean {
    if (!partida) return false;

    // Evalúa que la propiedad 'unidad' exista, no sea nula, no sea 'null' en string y tenga texto
    const unidadValida = partida.unidad &&
      String(partida.unidad).trim() !== '' &&
      String(partida.unidad).trim().toLowerCase() !== 'null';

    return Boolean(unidadValida);
  }

  limpiarSeleccionesEnTablas(): void {
    // 1. Limpiar el mapa de usuarios seleccionados
    this.usuariosSeleccionadosMap.clear();

    // 2. Desmarcar todos los checkboxes de la lista de presupuesto
    if (this.listaPresupuesto && this.listaPresupuesto.length > 0) {
      this.listaPresupuesto.forEach(partida => {
        partida.seleccionado = false;
      });
    }

    // 3. Limpiar mapa auxiliar de sliders (si se utiliza en la tabla de cuadrillas)
    if (this.usuariosSlidersMap) {
      this.usuariosSlidersMap.clear();
    }
  }

  esUsuarioSeleccionadoModal(usr: any): boolean {
    const id = usr.id_usuario ?? usr.id;
    return this.usuariosSeleccionadosModalMap.has(id);
  }

  toggleSeleccionUsuarioModal(usr: any, checked: boolean): void {
    const id = usr.id_usuario ?? usr.id;
    if (checked) {
      this.usuariosSeleccionadosModalMap.set(id, usr);
    } else {
      this.usuariosSeleccionadosModalMap.delete(id);
    }
  }

  esCuadrillaTotalmenteSeleccionadaModal(grupoUsr: any): boolean {
    if (!grupoUsr.integrantes || grupoUsr.integrantes.length === 0) return false;
    return grupoUsr.integrantes.every((usr: any) => this.esUsuarioSeleccionadoModal(usr));
  }

  toggleSeleccionarCuadrillaModal(grupoUsr: any, checked: boolean): void {
    if (!grupoUsr.integrantes) return;
    grupoUsr.integrantes.forEach((usr: any) => {
      this.toggleSeleccionUsuarioModal(usr, checked);
    });
  }

  toggleSeleccionarTodosUsuariosModal(checked: boolean): void {
    if (!this.listaEstructuradaCuadrillas) return;
    this.listaEstructuradaCuadrillas.forEach((grupo: any) => {
      if (grupo.integrantes) {
        grupo.integrantes.forEach((usr: any) => {
          this.toggleSeleccionUsuarioModal(usr, checked);
        });
      }
    });
  }

  pintar() {
    this.aspectos = JSON.parse(this.colores);
    this.titulo1 = this.aspectos.tipoPresupuesto.split('|');
    this.titulo1color = this.aspectos.colorPresupuesto.split('|');
    this.titulo1letra = this.aspectos.letraPresupuesto.split('|');
  }

  async cargarSubvistaVinculacionIndependiente(dia: any) {
    this.diaSeleccionadoVinculo = dia;
    if (!this.diaSeleccionadoVinculo) return;

    this.mostrar_carga_todo = true;
    try {
      // 1. Cargar en orden: Primero las actividades
      await this.obtenerActividadesIndependientes();

      // 2. Cargar el presupuesto pasando directamente la referencia de las actividades
      await this.obtenerPresupuestoIndependiente(this.listaActividadesParaVinculo);

    } catch (error) {
      console.error('Error al cargar la subvista de vinculación:', error);
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  async obtenerActividadesIndependientes() {
    const queryObj = {
      id_proyecto: this.id_proyecto,
      fecha: this.diaSeleccionadoVinculo.fecha
    };

    const respuesta = await this.RecursosHumanosService.listarActividadesCuadrilla(queryObj) || [];
    const gruposEstructurados = this.agruparActividades(respuesta, this.listaBaseUsuarios);
    this.listaActividadesParaVinculo = [];
    let contadorLetra = 65;  // A, B, C...
    let contadorTarea = 1;   // 1, 2, 3...

    gruposEstructurados.forEach((grupo) => {
      // Cabecera
      this.listaActividadesParaVinculo.push({
        id_actividad: 0,
        es_cabecera: true,
        item_label: String.fromCharCode(contadorLetra++),
        descripcion: grupo.descripcion,
        seleccionadoVinculo: false
      } as ActividadVinculacionFlat);

      // Actividades del grupo
      grupo.actividades.forEach((act: any) => {
        // Normalizar campo de horas
        const horasValidadas = act.horas_laborada || act.horas || act.horas_trabajadas || '00:00:00';

        this.listaActividadesParaVinculo.push({
          ...act,
          horas_laborada: String(horasValidadas).trim(),
          es_cabecera: false,
          item_label: (contadorTarea++).toString(),
          seleccionadoVinculo: false
        });
      });
    });
  }

  async obtenerPresupuestoIndependiente(actividadesDirectas?: ActividadVinculacionFlat[]) {
    // Usar el parámetro si existe, o el estado actual del componente como fallback
    const listaBase = actividadesDirectas || this.listaActividadesParaVinculo || [];

    // Extraer actividades reales que no sean cabecera
    const actividadesReales = listaBase.filter(a => !a.es_cabecera);

    if (actividadesReales.length === 0) {
      console.warn('⚠️ No se encontraron actividades reales para calcular el presupuesto.');
    }

    const queryObj = { id_proyecto: this.id_proyecto };
    const respuestaServicio: any[] = await this.RecursosHumanosService.listarPresupuestoProyecto(queryObj) || [];

    const presupuestoProcesado = respuestaServicio.map((partida) => {
      const idPartidaStr = partida.id_partida != null ? String(partida.id_partida).trim() : '';
      const indicePartidaStr = partida.indice != null ? String(partida.indice).trim() : '';

      // 1. Filtrar las actividades vinculadas
      const actividadesVinculadas = actividadesReales.filter(act => {
        const vinculoAct = act.indice;
        if (vinculoAct === null || vinculoAct === undefined || vinculoAct === '') return false;

        const indicesAsignados = String(vinculoAct)
          .split(/[|,]/)
          .map(s => s.trim())
          .filter(Boolean);

        return indicesAsignados.some(idx =>
          (idPartidaStr !== '' && idx === idPartidaStr) ||
          (indicePartidaStr !== '' && idx === indicePartidaStr)
        );
      });

      // 2. Correlativos visuales ('1', '2', '3')
      const itemsActividadesVinculadas = actividadesVinculadas
        .map(a => String(a.item_label || '').trim())
        .filter(Boolean);

      // 3. Extraer las horas (garantizando lectura de horas_laborada)
      const arregloHoras = actividadesVinculadas.map(a => {
        const h = a.horas_laborada;
        if (h && typeof h === 'string' && h.trim() !== '' && h.trim() !== '-') {
          return h.trim();
        }
        return '00:00:00';
      });

      // 4. Calcular la suma
      const totalHorasCalculadas = this.sumarHoras(arregloHoras);

      return {
        ...partida,
        indice: partida.indice ?? partida.id_partida,
        metrado_diario: partida.metrado_diario || 0,
        horas_laboradas_sumadas: totalHorasCalculadas,
        string_indices_vinculados: itemsActividadesVinculadas.join(', '),
        array_indices_vinculados: itemsActividadesVinculadas.map(Number).filter(n => !isNaN(n)),
        seleccionadoVinculo: false
      };
    });

    // Reasignar lista y forzar refresco de Angular
    this.listaPresupuestoParaVinculo = [...presupuestoProcesado];

    if (this.cd) {
      this.cd.detectChanges();
    }
  }

  toggleModoSeleccionVinculo() {
    this.modoSeleccionVincularActivo = !this.modoSeleccionVincularActivo;
    if (!this.modoSeleccionVincularActivo) {
      this.limpiarSeleccionesCheck();
    }
  }

  ejecutarVinculacion() {
    const tareasSeleccionadas = this.listaActividadesParaVinculo.filter(a => !a.es_cabecera && a.seleccionadoVinculo);
    const partidasSeleccionadas = this.listaPresupuestoParaVinculo.filter(p => p.unidad && p.unidad.trim() !== '' && p.seleccionadoVinculo);

    if (tareasSeleccionadas.length === 0 || partidasSeleccionadas.length === 0) {
      alert('Seleccione al menos una actividad y una partida con unidad.');
      return;
    }

    const nuevosIndicesGlobales = tareasSeleccionadas.map(a => a.indexGlobalActividad!);

    partidasSeleccionadas.forEach(partida => {
      const setTemporal = new Set<number>([...partida.array_indices_vinculados!, ...nuevosIndicesGlobales]);
      partida.array_indices_vinculados = Array.from(setTemporal).sort((a, b) => a - b);
      partida.string_indices_vinculados = partida.array_indices_vinculados.join('|');
    });

    this.recalcularHorasEnPresupuesto();
    this.limpiarSeleccionesCheck();
  }

  ejecutarDesvinculacion() {
    const tareasSeleccionadas = this.listaActividadesParaVinculo.filter(a => !a.es_cabecera && a.seleccionadoVinculo);
    const partidasSeleccionadas = this.listaPresupuestoParaVinculo.filter(p => p.unidad && p.unidad.trim() !== '' && p.seleccionadoVinculo);

    if (tareasSeleccionadas.length === 0 || partidasSeleccionadas.length === 0) {
      alert('Seleccione al menos una actividad y una partida para desvincular.');
      return;
    }

    const setIndicesARemover = new Set(tareasSeleccionadas.map(a => a.indexGlobalActividad!));

    partidasSeleccionadas.forEach(partida => {
      partida.array_indices_vinculados = partida.array_indices_vinculados!.filter(idx => !setIndicesARemover.has(idx));
      partida.string_indices_vinculados = partida.array_indices_vinculados.join('|');
    });

    this.recalcularHorasEnPresupuesto();
    this.limpiarSeleccionesCheck();
  }

  recalcularHorasEnPresupuesto() {
    if (!this.listaPresupuestoParaVinculo || !this.listaActividadesParaVinculo) return;

    const actividadesReales = this.listaActividadesParaVinculo.filter(a => !a.es_cabecera);

    this.listaPresupuestoParaVinculo = this.listaPresupuestoParaVinculo.map(partida => {
      const idPartidaStr = partida.id_partida != null ? String(partida.id_partida).trim() : '';
      const indicePartidaStr = partida.indice != null ? String(partida.indice).trim() : '';

      const actividadesVinculadas = actividadesReales.filter(act => {
        if (!act.indice) return false;
        const indices = String(act.indice).split(/[|,]/).map(s => s.trim()).filter(Boolean);
        return indices.some(idx => (idPartidaStr !== '' && idx === idPartidaStr) || (indicePartidaStr !== '' && idx === indicePartidaStr));
      });

      const arregloHoras = actividadesVinculadas.map(a => {
        const h = a.horas_laborada;
        return (h && typeof h === 'string' && h.trim() !== '' && h.trim() !== '-') ? h.trim() : '00:00:00';
      });

      return {
        ...partida,
        horas_laboradas_sumadas: this.sumarHoras(arregloHoras) // Asignar al mismo campo
      };
    });

    if (this.cd) this.cd.detectChanges();
  }

  async generarPayloadGuardadoVinculo() {
    const partidasSeleccionadas = this.listaPresupuestoParaVinculo.filter(
      p => p.seleccionadoVinculo && p.unidad && p.unidad.trim() !== ''
    );

    const actividadesSeleccionadas = this.listaActividadesParaVinculo.filter(
      a => !a.es_cabecera && a.seleccionadoVinculo
    );

    if (partidasSeleccionadas.length === 0) {
      alert('Por favor, selecciona al menos una partida del presupuesto destino.');
      return;
    }

    if (actividadesSeleccionadas.length === 0) {
      alert('Por favor, selecciona al menos una actividad para vincular.');
      return;
    }

    this.mostrar_carga_todo = true;

    try {
      // 1. Obtener los IDs/Índices de las partidas seleccionadas actualmente en la UI (ej. [5, 7])
      const nuevosIndicesPartidas = partidasSeleccionadas.map(p => String(p.indice ?? p.id_partida).trim());

      // 2. Construir el payload masivo combinando con los datos previos de la actividad
      const payloadMasivo = actividadesSeleccionadas.map(act => {
        // Extraer los índices previos que ya tenía la actividad (ej: "4|5" -> ["4", "5"])
        const indicesPrevios = act.indice
          ? String(act.indice).split(/[|,]/).map(s => s.trim()).filter(Boolean)
          : [];

        // Unir los previos con los nuevos mediante un Set para eliminar duplicados
        // ["4", "5"] + ["5", "7"] = Set {"4", "5", "7"}
        const indicesUnicos = Array.from(new Set([...indicesPrevios, ...nuevosIndicesPartidas]));

        // Opcional: ordenar numéricamente los índices
        indicesUnicos.sort((a, b) => Number(a) - Number(b));

        // Concatenar el resultado final con '|' (ej: "4|5|7")
        const indiceFinal = indicesUnicos.join('|');

        return {
          id_actividad: act.id_actividad,
          id_proyecto: this.id_proyecto,
          indice: indiceFinal // 👈 Resultado enviado: "4|5|7"
        };
      });

      // 3. Enviar el payload resultante al backend
      await this.RecursosHumanosService.guardarVinculosMasivo(payloadMasivo);

      // 4. Limpiar selecciones
      actividadesSeleccionadas.forEach(a => a.seleccionadoVinculo = false);
      partidasSeleccionadas.forEach(p => p.seleccionadoVinculo = false);

      // 5. Recargar la vista para refrescar las tablas
      await this.cargarSubvistaVinculacionIndependiente(this.diaSeleccionadoVinculo);

    } catch (error) {
      console.error('Error al guardar vinculación masiva:', error);
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  private limpiarSeleccionesCheck() {
    this.listaActividadesParaVinculo.forEach(a => a.seleccionadoVinculo = false);
    this.listaPresupuestoParaVinculo.forEach(p => p.seleccionadoVinculo = false);
  }



  // Método formateador seguro
  formatearVinculoParaVisualizacion(cadenaVinculada: string): string {
    if (!cadenaVinculada || cadenaVinculada.trim() === '') return '-';
    // Retorna formato limpio ej: "[ 1, 2 ]" o simplemente "1, 2"
    return cadenaVinculada;
  }

  async inicializarSubvistaVinculacion() {
    if (!this.meses || this.meses.length === 0) {
      this.mesesVinculo = [];
      this.diasVinculo = [];
      return;
    }

    // Copia profunda para romper referencias en memoria
    this.mesesVinculo = JSON.parse(JSON.stringify(this.meses));
    this.mesSeleccionadoVinculo = 0;

    // Dispara el flujo del selector de la subvista
    await this.cambioMesVinculo();
  }

  async cambioMesVinculo() {
    this.mostrar_carga_todo = true;

    if (this.mesesVinculo[this.mesSeleccionadoVinculo]) {
      this.diasVinculo = this.mesesVinculo[this.mesSeleccionadoVinculo].dias || [];
    } else {
      this.diasVinculo = [];
    }

    // Limpia estados previos
    this.diaSeleccionadoVinculo = null;
    this.listaActividadesParaVinculo = [];
    this.listaPresupuestoParaVinculo = [];

    // Marcar checks/cruces para los días de esta subvista
    await this.marcarDiasConRegistroVinculo();

    // Selecciona el primer día si existe y carga sus datos
    // if (this.diasVinculo.length > 0) {
    //   await this.seleccionDiaVinculo(this.diasVinculo[0]);
    // }

    this.mostrar_carga_todo = false;
  }

  async seleccionDiaVinculo(dia: any) {
    if (!dia) return;

    this.diaSeleccionadoVinculo = dia;
    this.mostrar_carga_todo = true;

    try {
      // 1. Cargar y procesar PRIMERO las actividades
      await this.obtenerActividadesIndependientes();

      // 2. Cargar el presupuesto pasándole la lista procesada para garantizar reactividad
      await this.obtenerPresupuestoIndependiente(this.listaActividadesParaVinculo);

      // ❌ QUITAR O COMENTAR ESTA LÍNEA (Es la que pisa 'horas_laboradas_sumadas' con '00:00:00')
      // this.recalcularHorasEnPresupuesto();

    } catch (error) {
      console.error('Error al seleccionar el día en vinculación:', error);
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  async marcarDiasConRegistroVinculo() {
    // Asegurarnos de evaluar el arreglo correcto (diasVinculo o dias)

    const arregloDias = this.dias;
    if (!arregloDias || arregloDias.length === 0) return;

    const anioMes = arregloDias[0].fecha.substring(0, 7);

    const params = {
      id_proyecto: this.id_proyecto.toString(),
      anio_mes: anioMes
    };
    try {
      const diasVinculados: any[] = await this.RecursosHumanosService.listarCalendarioRegistroVinculos(params);
      // Normalizar fechas al formato YYYY-MM-DD por si vienen con hora
      const fechasConVinculoSet = new Set(
        diasVinculados.map(item => String(item.fecha).split('T')[0])
      );

      // Actualizar la propiedad 'estado' de cada día
      arregloDias.forEach(dia => {
        const fechaLimpia = String(dia.fecha).split('T')[0];
        dia.estado = fechasConVinculoSet.has(fechaLimpia) ? 1 : 0;
      });

    } catch (error) {
      console.error('Error al verificar días con vínculo:', error);
    }
  }

  // Marca o desmarca todas las actividades que pertenecen al grupo marcado
  toggleSeleccionarGrupo(cabeceraGrupo: ActividadVinculacionFlat) {
    const estado = cabeceraGrupo.seleccionadoVinculo;
    let dentroDelGrupo = false;

    for (let item of this.listaActividadesParaVinculo) {
      // Si encontramos la cabecera actual, activamos la búsqueda de sus hijos
      if (item.es_cabecera && item.item_label === cabeceraGrupo.item_label) {
        dentroDelGrupo = true;
        continue;
      }

      // Si encontramos OTRA cabecera, detenemos el recorrido del grupo
      if (item.es_cabecera && dentroDelGrupo) {
        break;
      }

      // Si estamos dentro del grupo objetivo, le asignamos el estado del checkbox padre
      if (dentroDelGrupo && !item.es_cabecera) {
        item.seleccionadoVinculo = estado;
      }
    }
  }

  sumarHoras(arregloHoras: string[]): string {
    if (!arregloHoras || arregloHoras.length === 0) return '00:00:00';

    let totalSegundos = 0;

    arregloHoras.forEach(horaStr => {
      if (!horaStr || typeof horaStr !== 'string') return;

      // Eliminar espacios adicionales o caracteres invisibles
      const horaLimpia = horaStr.trim();
      if (horaLimpia === '' || horaLimpia === '-') return;

      const partes = horaLimpia.split(':').map(val => parseInt(val, 10));

      if (partes.length === 3 && !partes.some(isNaN)) {
        const [hh, mm, ss] = partes;
        totalSegundos += hh * 3600 + mm * 60 + ss;
      } else if (partes.length === 2 && !partes.some(isNaN)) {
        const [hh, mm] = partes;
        totalSegundos += hh * 3600 + mm * 60;
      }
    });

    if (totalSegundos <= 0) return '00:00:00';

    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    const hhPad = String(horas).padStart(2, '0');
    const mmPad = String(minutos).padStart(2, '0');
    const ssPad = String(segundos).padStart(2, '0');

    return `${hhPad}:${mmPad}:${ssPad}`;
  }

  iniciarEdicionVinculo(partida: any) {
    if (!partida.unidad) return; // Solo ejecutable en partidas reales

    this.partidaEditandoId = partida.id_partida ?? partida.indice;
    this.textoVinculoOriginal = (partida.string_indices_vinculados || '').trim();
    this.textoVinculoTemporal = this.textoVinculoOriginal;

    // Enfocar input automáticamente en el siguiente ciclo del DOM
    setTimeout(() => {
      const inputEl = document.getElementById(`input-vinculo-${this.partidaEditandoId}`);
      if (inputEl) inputEl.focus();
    }, 50);
  }

  cancelarEdicionVinculo() {
    this.partidaEditandoId = null;
    this.textoVinculoTemporal = '';
    this.textoVinculoOriginal = '';
  }

  async guardarEdicionVinculo(partida: any) {
    if (this.partidaEditandoId === null) return;

    const idPartidaStr = String(partida.indice ?? partida.id_partida).trim();
    const valorIngresado = this.textoVinculoTemporal.trim();

    // 1. Si el valor es exactamente el mismo, cancelar sin persistir ni recargar
    if (valorIngresado === this.textoVinculoOriginal) {
      this.cancelarEdicionVinculo();
      return;
    }

    // 2. Validar formato (solo números separados por comas o vacío)
    const regexFormato = /^(\d+\s*,\s*)*\d+$|^$/;
    if (!regexFormato.test(valorIngresado)) {
      this.toaster.error(
        'Formato no válido. Usa números separados por comas (Ej: 1, 2, 3).',
        '',
        { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 4000 }
      );
      this.cancelarEdicionVinculo();
      return;
    }

    // 3. Extraer correlativos ingresados ('1', '2' -> [1, 2])
    const correlativosNuevos = valorIngresado !== ''
      ? valorIngresado.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const actividadesReales = (this.listaActividadesParaVinculo || []).filter(a => !a.es_cabecera);

    // 4. Validar que los correlativos existan en la tabla izquierda
    const correlativosInvalidos = correlativosNuevos.filter(
      numStr => !actividadesReales.some(act => String(act.item_label).trim() === numStr)
    );

    if (correlativosInvalidos.length > 0) {
      this.toaster.warning(
        `Los correlativos [${correlativosInvalidos.join(', ')}] no existen en las actividades realizables.`,
        '',
        { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 4000 }
      );
      this.cancelarEdicionVinculo();
      return;
    }

    // Finalizar modo edición UI antes de procesar red
    this.partidaEditandoId = null;
    // this.mostrar_carga_todo = true; // Bloqueo visual global

    try {
      // 5. Detectar qué actividades deben asociar o desasociar esta partida
      const actividadesAGuardar: any[] = [];

      actividadesReales.forEach(act => {
        const itemLabelStr = String(act.item_label || '').trim();
        const perteneceANuevos = correlativosNuevos.includes(itemLabelStr);

        // Extraer los índices/partidas previas de la actividad (ej: "4|5" -> ["4", "5"])
        const indicesPrevios = act.indice
          ? String(act.indice).split(/[|,]/).map((s: string) => s.trim()).filter(Boolean)
          : [];

        const yaTeniaEstaPartida = indicesPrevios.includes(idPartidaStr);

        let nuevoIndiceStr = act.indice;
        let huboCambio = false;

        if (perteneceANuevos && !yaTeniaEstaPartida) {
          // Agregar la partida actual a la actividad
          const setIndices = new Set([...indicesPrevios, idPartidaStr]);
          nuevoIndiceStr = Array.from(setIndices).sort((a, b) => Number(a) - Number(b)).join('|');
          huboCambio = true;
        } else if (!perteneceANuevos && yaTeniaEstaPartida) {
          // Remover la partida actual de la actividad
          const indicesFiltrados = indicesPrevios.filter((i: string) => i !== idPartidaStr);
          nuevoIndiceStr = indicesFiltrados.join('|');
          huboCambio = true;
        }

        if (huboCambio) {
          actividadesAGuardar.push({
            ...act,
            indice: nuevoIndiceStr
          });
        }
      });

      // 6. Guardar cambios en backend usando persistirActividad de manera silenciosa
      for (const act of actividadesAGuardar) {
        // Se pasa carga = false para evitar recargarTablaActividades() en cada iteración
        await this.persistirActividad(act, 'GUARDAR', false);

        // Actualizar la referencia local inmediatamente
        const actLocal = this.listaActividadesParaVinculo.find(a => a.id_actividad === act.id_actividad);
        if (actLocal) {
          actLocal.indice = act.indice;
        }
      }

      // 7. Recalcular las horas y enlaces localmente en la tabla del presupuesto
      await this.obtenerPresupuestoIndependiente(this.listaActividadesParaVinculo);

      this.toaster.success(
        'Vinculación actualizada correctamente.',
        '',
        { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 3000 }
      );

    } catch (error) {
      console.error('Error al actualizar vinculación desde la partida:', error);
      this.toaster.error(
        'Ocurrió un error al guardar los cambios.',
        '',
        { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 4000 }
      );
    } finally {
      this.mostrar_carga_todo = false; // Desbloquear pantalla
    }
  }

  async listaractividadesagrupadas(anio_mes: string, dia?: string) {
    try {
      const payload: any = {
        id_proyecto: this.id_proyecto,
        anio_mes: anio_mes
      };

      if (dia) {
        payload.dia = dia;
      }

      const data = await this.RecursosHumanosService.listaractividadesagrupadas(payload);

      this.cargos = data?.cargos || [];
      this.partidas = data?.partidas || [];
      this.horasJornadaDia = data?.horas_jornada_dia || 8.5;
    } catch (error) {
      console.error("Error al cargar actividades agrupadas:", error);
    }
  }

  obtenerTooltipTrabajador(usuariosDetalle: any, keyCargo: string): string {
    if (!usuariosDetalle || !usuariosDetalle[keyCargo]) return '';
    return usuariosDetalle[keyCargo]
      .map((u: any) => `${u.nombres} - Tarifa: S/ ${u.precio_unitario}`)
      .join('\n');
  }

  async inicializarSubvistaResumen() {
    if (!this.meses || this.meses.length === 0) {
      this.mesesResumen = [];
      this.diasResumen = [];
      return;
    }

    // Copia profunda para romper referencias en memoria
    this.mesesVinculo = JSON.parse(JSON.stringify(this.meses));
    this.mesSeleccionadoVinculo = 0;

    // Dispara el flujo del selector de la subvista
    await this.cambioMesResumen();
  }

  async cambioMesResumen() {
    this.mostrar_carga_todo = true;
    const mesSelect = this.mesesVinculo[this.mesSeleccionadoVinculo];
    const anioMesFormateado = mesSelect.dias[0].fecha.substring(0, 7);
    // await this.listaractividadesagrupadas(anioMesFormateado);
    this.mostrar_carga_todo = false;
  }

  obtenerDetalleTooltip(usuariosDetalle: any, keyCargo: string): string {
    // 1. Validar que exista el objeto y la propiedad del cargo correspondiente
    if (!usuariosDetalle || !usuariosDetalle[keyCargo] || usuariosDetalle[keyCargo].length === 0) {
      return '';
    }

    // 2. Mapear cada usuario formateando su nombre y fechas de asignación
    const listaUsuarios = usuariosDetalle[keyCargo].map((u: any) => {
      const nombre = u.nombres || 'Usuario sin nombre';
      const cargo = u.cargo_descripcion ? ` (${u.cargo_descripcion})` : '';
      const inicio = u.fecha_inicio || '';
      const fin = u.fecha_fin || '';

      return `• ${nombre}${cargo}\n  Vigencia: ${inicio} al ${fin}`;
    });

    // 3. Unir todos los usuarios en un solo texto separado por saltos de línea
    return listaUsuarios.join('\n\n');
  }

  cambioMesControl() {
    this.mostrar_carga_todo = true;

    const mesSelect = this.meses[this.mesSeleccionadoControl];
    const anioMesFormateado = mesSelect.dias[0].fecha.substring(0, 7);

    // 1. Reiniciar selección de fila y listado
    this.filaSeleccionada = null;
    this.listaActividadesPartida = [];

    // 2. Reiniciar estados de formulario/edición
    this.modoEdicion = false;
    this.idPerdidaSeleccionada = null;

    // 3. Reiniciar formulario de pérdida si aplica
    if (this.formPerdida) {
      this.formPerdida.reset();
    }

    this.mostrar_carga_todo = false;
  }

  // async seleccionPartida(item: any, i: number) {
  //   try {
  //     if (item == this.filaSeleccionada) {
  //       return;
  //     }
  //     this.mostrar_carga_todo = true;
  //     this.filaSeleccionada = item;
  //     const mesSelect = this.meses[this.mesSeleccionadoVinculo];
  //     const anioMesFormateado = mesSelect.dias[0].fecha.substring(0, 7);

  //     const obj = {
  //       id_proyecto: this.id_proyecto,
  //       indice: item.indice,
  //       mes: anioMesFormateado
  //     };

  //     const respuesta: any = await this.RecursosHumanosService.listarActividadesPartida(obj);

  //     // Mapeo e interpretación de cabecera ('influencia|id_perdida')
  //     this.listaActividadesPartida = (respuesta || []).map((act: any) => {
  //       let influencia = 0;
  //       let idPerdida = null;

  //       if (act.cabecera && typeof act.cabecera === 'string' && act.cabecera.includes('|')) {
  //         const partes = act.cabecera.split('|');
  //         influencia = parseFloat(partes[0]) || 0;
  //         idPerdida = partes[1] && partes[1] !== 'null' ? parseInt(partes[1], 10) : null;
  //       }

  //       return {
  //         ...act,
  //         seleccionado: act.seleccionado ?? false,
  //         influencia_perdida: influencia,
  //         id_perdida_frecuente: idPerdida
  //       };
  //     });
  //     await this.obtenerPerdidas()
  //     this.mostrar_carga_todo = false;
  //   } catch (error) {
  //     this.mostrar_carga_todo = false;
  //     SwalService.error();
  //   }
  // }

  async seleccionPartida(item: any, i: number) {
    try {
      if (item == this.filaSeleccionada) return;
      this.mostrar_carga_todo = true;
      this.filaSeleccionada = item;

      const mesSelect = this.meses[this.mesSeleccionadoControl];
      const anioMesFormateado = mesSelect.dias[0].fecha.substring(0, 7);

      const payload = {
        id_proyecto: this.id_proyecto,
        indice: item.indice,
        anio_mes: anioMesFormateado
      };

      const respuesta: any = await this.RecursosHumanosService.listarActividadesPorPartidaMensual(payload);

      this.cargos = respuesta?.cargos || [];

      this.listaActividadesPartida = (respuesta?.actividades || []).map((act: any) => {
        let influencia = 0;
        let idPerdida = null;

        if (act.cabecera && typeof act.cabecera === 'string' && act.cabecera.includes('|')) {
          const partes = act.cabecera.split('|');
          influencia = parseFloat(partes[0]) || 0;
          idPerdida = partes[1] && partes[1] !== 'null' ? parseInt(partes[1], 10) : null;
        }

        return {
          ...act,
          // Asegurar que resumen_dh_formato o cuadrilla_texto contengan la cadena procesada
          resumen_dh_formato: typeof act.resumen_dh_formato === 'string' ? act.resumen_dh_formato : '-',
          costo: act.costo_actividad ?? act.costo ?? 0,
          seleccionado: act.seleccionado ?? false,
          influencia_perdida: influencia,
          id_perdida_frecuente: idPerdida
        };
      });
      await this.obtenerPerdidas();
      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }
  async modalListaPerdidas() {
    this.limpiarFormulario();
    await this.obtenerPerdidas();
    this.modalPerdidas.show();
  }

  cerrarModal() {
    this.modalPerdidas.hide();
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.formPerdida.reset();
    this.modoEdicion = false;
    this.idPerdidaSeleccionada = null;
  }

  async obtenerPerdidas() {
    try {
      this.mostrar_carga_todo = true;
      const res = await this.RecursosHumanosService.listarTopPerdidas({ id_proyecto: this.id_proyecto });
      this.listaTopPerdidas = res || [];
      this.perdidasFrecuentes = this.listaTopPerdidas.map(p => ({ id: p.id_perdida, descripcion: p.descripcion }));
      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  async guardarOActualizarPerdida() {
    if (this.formPerdida.invalid) return;

    try {
      this.mostrar_carga_todo = true;
      const descripcion = this.formPerdida.get('descripcion')?.value;

      if (this.modoEdicion && this.idPerdidaSeleccionada) {
        await this.RecursosHumanosService.actualizarTopPerdida({
          id_perdida: this.idPerdidaSeleccionada,
          id_proyecto: this.id_proyecto,
          descripcion: descripcion
        });
      } else {
        await this.RecursosHumanosService.guardarTopPerdida({
          id_proyecto: this.id_proyecto,
          descripcion: descripcion
        });
      }

      this.limpiarFormulario();
      await this.obtenerPerdidas();
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  editarPerdida(item: any) {
    this.modoEdicion = true;
    this.idPerdidaSeleccionada = item.id_perdida;
    this.formPerdida.patchValue({
      descripcion: item.descripcion
    });
  }

  async eliminarPerdidaItem(id_perdida: any) {
    try {
      this.mostrar_carga_todo = true;
      await this.RecursosHumanosService.eliminarTopPerdida({ id_perdida });
      if (this.idPerdidaSeleccionada === id_perdida) {
        this.limpiarFormulario();
      }
      await this.obtenerPerdidas();
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }

  async onCambioPerdida(actividadEditada: any) {
    const influencia = actividadEditada.influencia_perdida ?? 0;
    const idPerdida = actividadEditada.id_perdida_frecuente ?? '';
    const nuevaCabecera = `${influencia}|${idPerdida}`;

    let filasAActualizar: any[] = [];

    // Si la fila editada tiene checkbox activo, actualiza todas las que tengan checkbox activo
    if (actividadEditada.seleccionado) {
      filasAActualizar = this.listaActividadesPartida.filter(item => item.seleccionado);
    } else {
      // Si no, solo actualiza la fila actual
      filasAActualizar = [actividadEditada];
    }

    // Mapeamos los N elementos al formato DTO del backend
    const payload = filasAActualizar.map(act => {
      // Sincronizar localmente en pantalla
      act.influencia_perdida = influencia;
      act.id_perdida_frecuente = idPerdida;
      act.cabecera = nuevaCabecera;

      return {
        id_actividad: act.id_actividad,
        id_proyecto: this.id_proyecto,
        cabecera: nuevaCabecera
      };
    });

    try {
      this.mostrar_carga_todo = true;

      // Llamada masiva en una sola petición HTTP
      await this.RecursosHumanosService.actualizarCabecerasMasivo(payload);

      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
    }
  }


  async seleccionDiaResumen(dia: any) {
    this.mostrar_carga_todo = true;
    // await this.cargarPresupuesto();

    // Si hace clic en el mismo día seleccionado, se desselecciona y se carga el acumulado mensual
    if (this.diaSeleccionadoResumen === dia) {
      this.diaSeleccionadoResumen = null;
    } else {
      this.diaSeleccionadoResumen = dia;
    }

    const mesSelect = this.mesesVinculo[this.mesSeleccionadoVinculo];
    const anioMesFormateado = mesSelect.dias[0].fecha.substring(0, 7);

    if (this.diaSeleccionadoResumen && this.diaSeleccionadoResumen.fecha) {
      // Envia el día específico
      await this.listaractividadesagrupadas(anioMesFormateado, this.diaSeleccionadoResumen.fecha);
    } else {
      // Envia sin parámetro 'dia' para retornar el acumulado del mes
      await this.listaractividadesagrupadas(anioMesFormateado);
    }

    this.mostrar_carga_todo = false;
  }
}

