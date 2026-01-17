import { SwalService } from './../../../servicios/swal.service';
import { RecursosHumanosService } from './../../../servicios/recursoshumanos.service';
import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import * as moment from 'moment';
import { filatabla } from '../../configuraciones/parametros/parametros.component';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';
import * as math from 'mathjs';
import { AnchocolDirective } from 'src/app/directivas/anchocol.directive';
import { Anchocol2Directive } from 'src/app/directivas/anchocol2.directive';
import { FormulaEvaluatorService } from 'src/app/servicios/formula-evaluator.service';
import { ModalBasicComponent } from 'src/app/shared/modal-basic/modal-basic.component';
interface DiaEntrada {
  anio: number;
  mes_nombre: string;
  mes_numero: number;
  dia_nombre: string;
  dia_numero: number;
  fecha: string;
}

interface DiaSalida {
  dia: string;
  abreviatura: string;
  numero_dia_mes: number;
  laborable: boolean;
  feriado: boolean;
  fecha: string;
}

interface MesSalida {
  mes: string;
  mes_numero: number;
  cantdias: number;
  dias: DiaSalida[];
}

interface AnioSalida {
  anio: number;
  cantmeses: number;
  cantdias: number;
  meses: MesSalida[];
}

interface filaTabla {
  id_area: number,
  area: string,
  id_cargo: number,
  cargo: string,
  id_asignacion: number,
  id_usuario: number,
  estado: string | number,
  descripcion_usuario: string,
  fecha_inicio: string,
  fecha_fin: string,
  dias: any,
  nro_grupo: number | null,
  total_jornada: number | null,
  coste_dia: number | null,
  coste_mensual: number | null,
  mostrar: boolean,
  asistenciaExistente: boolean,
  invalido: boolean,
  dias_laborados: number | null,
  dias_dominicales: number | null,
  dias_feriados: number | null,
  dias_tardanzas: number | null,
  dias_permiso: number | null,
  dias_otros: number | null,
  dias_faltados: number | null,
  descuentos: any,
  diasNoLaborables: any,
  feriadosSoloFecha: any

}
interface Asistencia {
  id_asistencia: number;
  id_proyecto: number;
  id_asignacion: number;
  id_usuario: number;
  id_area: number;
  id_cargo: number;
  tipo_asistencia: number;
  fecha_hora: string;
  id_supervisor: number | null;
  modo_registro: number;
  nombres_usuario: string;
  apellidos_usuario: string;
  nombre_completo_usuario: string;
  nombre_area: string;
  nombre_cargo: string;
  nombres_supervisor: string | null;
  apellidos_supervisor: string | null;
  nombre_completo_supervisor: string | null;
}

interface AsistenciaAgrupada {
  id_usuario: number;
  id_proyecto: number;
  id_area: number;
  id_cargo: number;
  id_asignacion: number;
  nombres_usuario: string;
  apellidos_usuario: string;
  nombre_completo_usuario: string;
  nombre_area: string;
  nombre_cargo: string;
  tipo_asistencia1: string | null;
  tipo_asistencia2: string | null;
  tipo_asistencia3: string | null;
  tipo_asistencia4: string | null;
  registros_completos: boolean; // Si tiene los 4 tipos de asistencia
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
@Component({
  selector: 'app-planillas',
  templateUrl: './planillas.component.html',
  styleUrls: ['./planillas.component.scss']
})
export class PlanillasComponent implements OnInit, OnChanges, OnDestroy {
  @Input() idProyecto = null
  @Input() tablaPresInd = null
  abreviaturas: Record<string, string> = {
    Lunes: "Lu",
    Martes: "Ma",
    Miércoles: "Mi",
    Jueves: "Ju",
    Viernes: "Vi",
    Sábado: "Sa",
    Domingo: "Do"
  };
  noLaborables = []
  mostrar_carga_todo = false
  mesSeleccionado = 0
  meses = []
  calendario = []
  calendarioFiltrado = []
  asignaciones = []
  areaSeleccionada = ''
  areaSeleccionada2 = ''
  areas = []
  cargos = []
  cargosFiltrados = []
  cargosFiltrados2 = []
  cargoSeleccionada = ''
  cargoSeleccionada2 = ''
  tablaFiltrada: filaTabla[] = []
  tipos = [
    { codigo: 'A', tipo: 'ASISTIO' },
    { codigo: 'T', tipo: 'TARDANZA' },
    { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA' },
    { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA' },
    { codigo: 'F', tipo: 'FALTA' },
    { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA' },
    { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA' },
    { codigo: 'FM', tipo: 'DESCANSO MEDICO' },
    { codigo: 'FV', tipo: 'VACACIONES' },
    { codigo: 'FC', tipo: 'CITA MEDICA' },
    { codigo: 'FD', tipo: 'DUELO' },
    // { codigo: 'FE', tipo: 'NO MARCO ENTRADA' },
    // { codigo: 'FS', tipo: 'NO MARCO SALIDA' },
    { codigo: 'OBS', tipo: 'OBSERVADO' },
    { codigo: 'IN', tipo: 'INCOMPLETO' },
    { codigo: 'TEX', tipo: 'TEXTRA' }
  ]
  ocultarSinAsistencia: boolean = false;
  activetab = 1
  diaSeleccionado = ''
  fechaSeleccionada = ''
  tablaAsistenciaMovil = []
  filAsisMov = null
  diasSemana = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
  totalMes: number = 0;
  tablaPresAnalitico: filaPresAnalitico[] = []
  tablaPresAnaliticoFooter: filaPresAnalitico[] = []
  dec_parcial = 3
  cargosFiltradosPres = []
  areaSeleccionadaPres = null
  filPresAna = null

  contador: number = 0;
  tiempoLimite: number = 3; // 5 segundos
  intervalo: number = 100; // Actualiza cada 100ms para mayor precisión

  // horasJornal = 8
  private actualizacionEnCurso = false;
  private contadorSegundos = 0;
  private tiempoLimiteSegundos = 3; // 3 segundos de espera
  private temporizador: any = null;
  tablaMesUsuario = []
  @ViewChildren(Anchocol2Directive) anchors: QueryList<Anchocol2Directive>;
  @ViewChild("modalDetalleUsuario") modalDetalleUsuario: ModalBasicComponent;
  usuarioSeleccionado: any;
  filTabFil = null
  mostrarSelColum: boolean;
  cantidadUsuariosDia: number[] = [];
  constructor(private recursosHumanosService: RecursosHumanosService, private cdRef: ChangeDetectorRef, private appRef: ApplicationRef, private toaster: ToastrService,
    public formsService: FormsService, private formulaEvaluator: FormulaEvaluatorService) { }

  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      this.inicializarFechaActual()
      await this.listarAsignacionesProyecto()
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }
  }

  private inicializarFechaActual() {
    const hoy = new Date();

    // Formato: YYYY-MM-DD (para input type="date")
    const year = hoy.getFullYear();
    const month = ('0' + (hoy.getMonth() + 1)).slice(-2);
    const day = ('0' + hoy.getDate()).slice(-2);

    this.fechaSeleccionada = `${year}-${month}-${day}`;

  }

  ngOnChanges() {
    // Reaplicar estilos después de que la vista se renderice
    setTimeout(() => {
      this.anchors.forEach(anchor => {
        // Forzar reaplicación
      });
    }, 100);
  }

  async onNavChange(event) {
    this.mostrar_carga_todo = true
    if (event.nextId == 3 && !this.areaSeleccionadaPres) {
      this.areaSeleccionadaPres = this.areas.length ? this.areas[0]?.id_area : null
      await this.cambioAreaPres()
    }
    this.mostrar_carga_todo = false
  }

  ngOnDestroy() {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }

  detenerTemporizador() {
    if (this.temporizador) {
      this.actualizarPresAnaliticoRH()
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
  }

  async listarAsignacionesProyecto() {
    this.mostrar_carga_todo = true
    this.meses = []
    const obj = {
      id_proyecto: this.idProyecto
    }
    const resp = await this.recursosHumanosService.listarAsignacionesProyecto(obj)
    await this.listarAreasYCargos()
    this.asignaciones = resp.asignaciones
    if (resp) {
      this.calendario = this.agruparPorAnioMes(resp.calendario)
      for (const anio of this.calendario) {
        for (const mes of anio.meses) {
          this.meses.push(anio.anio + ' - ' + mes.mes)
        }
      }
      // await this.cambioDeMes()
    }
    this.mostrar_carga_todo = false
  }

  async listarAreasYCargos() {
    try {

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

  agruparPorAnioMes(
    datos: DiaEntrada[]
  ): AnioSalida[] {
    const esLaborable = (dia: string): boolean =>
      !this.noLaborables.includes(dia);
    return datos.reduce<AnioSalida[]>((acc, item) => {

      // ===== AÑO =====
      let anioObj = acc.find(a => a.anio === item.anio);
      if (!anioObj) {
        anioObj = {
          anio: item.anio,
          cantmeses: 0,
          cantdias: 0,
          meses: []
        };
        acc.push(anioObj);
      }

      // ===== MES =====
      let mesObj = anioObj.meses.find(
        m => m.mes_numero === item.mes_numero
      );

      if (!mesObj) {
        mesObj = {
          mes: item.mes_nombre,
          mes_numero: item.mes_numero,
          cantdias: 0,
          dias: []
        };
        anioObj.meses.push(mesObj);
        anioObj.cantmeses++;
      }

      // ===== DÍA =====
      mesObj.dias.push({
        dia: item.dia_nombre,
        abreviatura: this.abreviaturas[item.dia_nombre],
        numero_dia_mes: item.dia_numero,
        laborable: esLaborable(item.dia_nombre),
        feriado: false,
        fecha: item.fecha
      });

      mesObj.cantdias++;
      anioObj.cantdias++;

      return acc;
    }, []);
  }

  cambioDeMes() {
    this.mostrar_carga_todo = true
    let i = 0
    this.calendarioFiltrado = []
    for (const anio of this.calendario) {
      for (const mes of anio.meses) {
        if (i == this.mesSeleccionado) {
          this.calendarioFiltrado.push(
            {
              nombre: anio.anio + '-' + mes.mes,
              colspan: mes.cantdias,
              dias: mes.dias
            }
          )
        }
        i++
      }
    }
    this.mostrar_carga_todo = false
  }

  async cambioArea() {
    this.cargoSeleccionada = ''
    this.cargosFiltrados = this.cargos.filter(ele => ele.id_area == this.areaSeleccionada)
  }

  async cambioArea2() {
    this.cargoSeleccionada2 = ''
    this.cargosFiltrados2 = this.cargos.filter(ele => ele.id_area == this.areaSeleccionada2)
  }


  async listarRegistrosAsistencia(fechaini, fechafin) {
    const obj = {
      id_proyecto: this.idProyecto,
      fecha_inicio: fechaini,
      fecha_fin: fechafin
    }
    const res = await this.recursosHumanosService.listarRegistrosAsistencia(obj)
    return res
  }

  async filtroListadoCargos() {
    this.mostrar_carga_todo = true
    this.tablaFiltrada = []
    this.totalMes = 0
    this.cantidadUsuariosDia = []
    // 1. Desactivar detección automática temporalmente
    this.cdRef.detach();

    // 2. Forzar un solo renderizado inicial
    this.cdRef.detectChanges();
    this.mostrarSelColum = this.areaSeleccionada && this.cargoSeleccionada ? true : false

    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      await this.cambioDeMes()
      const inicio = this.calendarioFiltrado[0].dias[0].fecha
      const fin = this.calendarioFiltrado[0].dias[this.calendarioFiltrado[0].colspan - 1].fecha
      const registrosAsistencia = await this.listarRegistrosAsistencia(inicio, fin)
      const data = {
        id_proyecto: this.idProyecto,
        id_area: 0
      }
      const datos = await this.recursosHumanosService.listarHorarioYFeriadosArea(data)
      let diasMesVacios = []
      for (let i = 0; i < this.calendarioFiltrado[0]?.colspan; i++) {
        diasMesVacios.push(null)
      }
      let tablaNueva = []
      const montosAreas = await this.listarMontosAreaPresAnaliticoRH()
      if (!this.areaSeleccionada) {
        let totalMes = 0
        for (const area of this.areas) {
          let letTotalAreas = 0
          const cargos = this.cargos.filter(ele => ele.id_area == area.id_area)
          let areagrupo = []
          for (const cargo of cargos) {
            let cargoTotal = 0
            const asignaciones = await this.asignaciones.filter(ele => ele.id_area == cargo.id_area && ele.id_cargo == cargo.id_cargo)
            if (!areagrupo.length && asignaciones.length) {
              const areadata: filaTabla = {
                area: area.descripcion,
                cargo: null,
                descripcion_usuario: null,
                dias: diasMesVacios,
                estado: null,
                fecha_fin: '',
                fecha_inicio: '',
                id_area: area.id_area,
                id_asignacion: null,
                id_cargo: null,
                id_usuario: null,
                nro_grupo: null,
                total_jornada: null,
                coste_dia: null,
                coste_mensual: null,
                mostrar: true,
                asistenciaExistente: true,
                invalido: false,
                dias_dominicales: null,
                dias_feriados: null,
                dias_laborados: null,
                dias_otros: null,
                dias_permiso: null,
                dias_tardanzas: null,
                dias_faltados: null,
                descuentos: null,
                diasNoLaborables: null,
                feriadosSoloFecha: null
              }
              areagrupo.push(areadata)
            }
            if (asignaciones.length) {
              const cargoData: filaTabla = {
                area: area.descripcion,
                cargo: cargo.descripcion,
                descripcion_usuario: null,
                dias: diasMesVacios,
                estado: null,
                fecha_fin: '',
                fecha_inicio: '',
                id_area: area.id_area,
                id_asignacion: null,
                id_cargo: cargo.id_cargo,
                id_usuario: null,
                nro_grupo: null,
                total_jornada: null,
                coste_dia: null,
                coste_mensual: null,
                mostrar: true,
                asistenciaExistente: true,
                invalido: false,
                dias_dominicales: null,
                dias_feriados: null,
                dias_laborados: null,
                dias_otros: null,
                dias_permiso: null,
                dias_tardanzas: null,
                dias_faltados: null,
                descuentos: null,
                diasNoLaborables: null,
                feriadosSoloFecha: null
              }
              areagrupo.push(cargoData)
              let j = 1
              for (const usuario of asignaciones) {
                let dataHorario = datos[0].find(ele => ele.id_area == usuario.id_area)
                if (!dataHorario) {
                  dataHorario = {
                    id_configuracion: null,
                    id_proyecto: usuario.id_proyecto,
                    id_area: usuario.id_area,
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
                }
                const costesCargoDia = montosAreas.find(ele => ele.id_area == usuario.id_area && ele.tipo == ('JORNAL CATEGORIA ' + usuario.tipo_cargo))?.cargos.find(ele => ele.id_cargo == usuario.id_cargo)
                let costeDia = costesCargoDia ? costesCargoDia.parcial : 0

                const descuentos = dataHorario?.descuentos.split('|')
                const diasNoLaborables = dataHorario?.dias_nolaborables.split('|')
                const feriadosSoloFecha = datos[1].filter(ele => {
                  const areas = ele.areas?.split('|');
                  return areas && areas.includes(usuario.id_area.toString());
                }).map(ele => ele.fecha.split('T')[0]);
                const resusuario = await this.filtrarPorUsuario(registrosAsistencia, usuario.id_usuario, usuario.id_asignacion, descuentos, diasNoLaborables, feriadosSoloFecha, costeDia)
                // const existe = registroMes.find(ele => ele.id_control)
                const asignacionData: filaTabla = {
                  area: area.descripcion,
                  cargo: cargo.descripcion,
                  descripcion_usuario: usuario.descripcion_usuario,
                  dias: resusuario.registroMes,
                  estado: usuario.estado,
                  fecha_fin: usuario.fecha_fin,
                  fecha_inicio: usuario.fecha_inicio,
                  id_area: area.id_area,
                  id_asignacion: usuario.id_asignacion,
                  id_cargo: cargo.id_cargo,
                  id_usuario: usuario.id_usuario,
                  nro_grupo: j,
                  total_jornada: 0,
                  coste_dia: costeDia,
                  coste_mensual: resusuario.montoMes,
                  mostrar: true,
                  asistenciaExistente: true,
                  invalido: resusuario.invalido,
                  dias_dominicales: resusuario.conteos.dias_dominicales,
                  dias_faltados: resusuario.conteos.dias_faltados,
                  dias_feriados: resusuario.conteos.dias_feriados,
                  dias_laborados: resusuario.conteos.dias_laborados,
                  dias_otros: resusuario.conteos.dias_otros,
                  dias_permiso: resusuario.conteos.dias_permiso,
                  dias_tardanzas: resusuario.conteos.dias_tardanzas,
                  descuentos: descuentos,
                  diasNoLaborables: diasNoLaborables,
                  feriadosSoloFecha: feriadosSoloFecha
                }
                cargoTotal += resusuario.montoMes
                areagrupo.push(asignacionData)
                j++
              }
            }
            letTotalAreas += cargoTotal
          }
          tablaNueva = tablaNueva.concat(areagrupo)
          // this.cdRef.detectChanges();
          totalMes += letTotalAreas
        }
        this.totalMes = totalMes
      } else {
        let areaarray = []
        let totalMes = 0
        for (const area of this.areas) {
          let letTotalAreas = 0
          if (area.id_area == this.areaSeleccionada) {
            const areadata: filaTabla = {
              area: area.descripcion,
              cargo: null,
              descripcion_usuario: null,
              dias: diasMesVacios,
              estado: null,
              fecha_fin: '',
              fecha_inicio: '',
              id_area: area.id_area,
              id_asignacion: null,
              id_cargo: null,
              id_usuario: null,
              nro_grupo: null,
              total_jornada: null,
              coste_dia: null,
              coste_mensual: null,
              mostrar: true,
              asistenciaExistente: true,
              invalido: false,
              dias_dominicales: null,
              dias_feriados: null,
              dias_laborados: null,
              dias_otros: null,
              dias_permiso: null,
              dias_tardanzas: null,
              dias_faltados: null,
              descuentos: null,
              diasNoLaborables: null,
              feriadosSoloFecha: null
            }
            areaarray.push(areadata)
            const cargos = this.cargos.filter(ele => ele.id_area == area.id_area)
            let cargosBuscar = []
            if (this.cargoSeleccionada) {
              const encontrado = cargos.find(ele => ele.id_cargo == this.cargoSeleccionada)
              if (encontrado) {
                cargosBuscar.push(encontrado)
              }
            } else {
              cargosBuscar = cargos
            }

            for (const cargo of cargosBuscar) {
              let cargoTotal = 0
              const asignaciones = await this.asignaciones.filter(ele => ele.id_area == cargo.id_area && ele.id_cargo == cargo.id_cargo)
              const cargoData: filaTabla = {
                area: area.descripcion,
                cargo: cargo.descripcion,
                descripcion_usuario: null,
                dias: diasMesVacios,
                estado: null,
                fecha_fin: '',
                fecha_inicio: '',
                id_area: area.id_area,
                id_asignacion: null,
                id_cargo: cargo.id_cargo,
                id_usuario: null,
                nro_grupo: null,
                total_jornada: null,
                coste_dia: null,
                coste_mensual: null,
                mostrar: true,
                asistenciaExistente: true,
                invalido: false,
                dias_dominicales: null,
                dias_feriados: null,
                dias_laborados: null,
                dias_otros: null,
                dias_permiso: null,
                dias_tardanzas: null,
                dias_faltados: null,
                descuentos: null,
                diasNoLaborables: null,
                feriadosSoloFecha: null
              }

              areaarray.push(cargoData)
              let j = 1
              for (const usuario of asignaciones) {
                let dataHorario = datos[0].find(ele => ele.id_area == usuario.id_area)
                if (!dataHorario) {
                  dataHorario = {
                    id_configuracion: null,
                    id_proyecto: usuario.id_proyecto,
                    id_area: usuario.id_area,
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
                }
                // const costesCargoHora = montosAreas.find(ele => ele.id_area == usuario.id_area && ele.tipo == "JORNAL DIARIO")?.cargos.find(ele => ele.id_cargo == usuario.id_cargo)
                const costesCargoDia = montosAreas.find(ele => ele.id_area == usuario.id_area && ele.tipo == ('JORNAL CATEGORIA ' + usuario.tipo_cargo))?.cargos.find(ele => ele.id_cargo == usuario.id_cargo)
                // let costeHora = costesCargoHora ? costesCargoHora.parcial : 0
                let costeDia = costesCargoDia ? costesCargoDia.parcial : 0
                const descuentos = dataHorario?.descuentos.split('|')
                const diasNoLaborables = dataHorario?.dias_nolaborables.split('|')
                const feriadosSoloFecha = datos[1].filter(ele => {
                  const areas = ele.areas?.split('|');
                  return areas && areas.includes(usuario.id_area.toString());
                }).map(ele => ele.fecha.split('T')[0]);
                const resusuario = await this.filtrarPorUsuario(registrosAsistencia, usuario.id_usuario, usuario.id_asignacion, descuentos, diasNoLaborables, feriadosSoloFecha, costeDia)
                const asignacionData: filaTabla = {
                  area: area.descripcion,
                  cargo: cargo.descripcion,
                  descripcion_usuario: usuario.descripcion_usuario,
                  dias: resusuario.registroMes,
                  estado: usuario.estado,
                  fecha_fin: usuario.fecha_fin,
                  fecha_inicio: usuario.fecha_inicio,
                  id_area: area.id_area,
                  id_asignacion: usuario.id_asignacion,
                  id_cargo: cargo.id_cargo,
                  id_usuario: usuario.id_usuario,
                  nro_grupo: j,
                  total_jornada: 0,
                  coste_dia: costeDia,
                  coste_mensual: resusuario.montoMes,
                  mostrar: true,
                  asistenciaExistente: true,
                  invalido: resusuario.invalido,
                  dias_dominicales: resusuario.conteos.dias_dominicales,
                  dias_faltados: resusuario.conteos.dias_faltados,
                  dias_feriados: resusuario.conteos.dias_feriados,
                  dias_laborados: resusuario.conteos.dias_laborados,
                  dias_otros: resusuario.conteos.dias_otros,
                  dias_permiso: resusuario.conteos.dias_permiso,
                  dias_tardanzas: resusuario.conteos.dias_tardanzas,
                  descuentos: descuentos,
                  diasNoLaborables: diasNoLaborables,
                  feriadosSoloFecha: feriadosSoloFecha
                }
                cargoTotal += resusuario.montoMes
                areaarray.push(asignacionData)
                j++
              }
              letTotalAreas += cargoTotal
            }
          }
          totalMes += letTotalAreas
        }
        this.totalMes = totalMes
        tablaNueva = areaarray
      }
      let ocultar = true
      let ocultarArea = true
      if (this.ocultarSinAsistencia) {
        for (let i = tablaNueva.length - 1; i >= 0; i--) {

          const element = tablaNueva[i];
          if (element.id_asignacion) {
            const existe = element.dias.find(ele => ele.id_control)
            ocultar = existe ? false : true
            ocultarArea = existe ? false : true
            element.asistenciaExistente = existe ? true : false
          } else if (element.id_cargo) {
            element.asistenciaExistente = !ocultar
            if (ocultar) {
              ocultar = true
            }
          } else {
            element.asistenciaExistente = !ocultarArea
            if (ocultarArea) {
              ocultarArea = true
            }
          }
        }

        this.tablaFiltrada = tablaNueva
      } else {
        this.tablaFiltrada = tablaNueva
      }
      // this.mostrar_carga_todo = false
      await this.recalcularTotales()
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.cdRef.reattach();
      this.mostrar_carga_todo = false;
      this.cdRef.detectChanges();
    }

  }

  trackByFn(index: number, item: any): any {
    // Retorna un identificador único
    if (item.id_usuario) return item.id_usuario;
    if (item.id_cargo) return `cargo_${item.id_cargo}`;
    if (item.id_area) return `area_${item.id_area}`;
    return index;
  }



  filtrarPorUsuario(registrosAsistencia: any[], id_usuario: number, id_asignacion: number, descuentos: string[], diasNoLaborables: string[], feriadosSoloFecha: string[], costedia) {

    const dias = this.calendarioFiltrado[0].dias;

    // Tipos de asistencia con sus códigos
    const tipos = [
      { codigo: 'A', tipo: 'ASISTIO' },
      { codigo: 'T', tipo: 'TARDANZA' },
      { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA' },
      { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA' },
      { codigo: 'F', tipo: 'FALTA' },
      { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA' },
      { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA' },
      { codigo: 'FM', tipo: 'DESCANSO MEDICO' },
      { codigo: 'FV', tipo: 'VACACIONES' },
      { codigo: 'FC', tipo: 'CITA MEDICA' },
      { codigo: 'FD', tipo: 'DUELO' },
      { codigo: 'PE', tipo: 'PERMISO' },
      { codigo: 'OBS', tipo: 'OBSERVADO' },
      { codigo: 'IN', tipo: 'INCOMPLETO' },
      { codigo: 'TEX', tipo: 'TEXTRA' }
    ];

    // Crear un mapa para búsqueda rápida de tipos
    const tipoMap = new Map();
    tipos.forEach((tipoObj, index) => {
      tipoMap.set(tipoObj.codigo, {
        ...tipoObj,
        descuento: descuentos[index] || "0"
      });
    });

    // Crear un mapa de registros para búsqueda más rápida
    const registroMap = new Map();

    registrosAsistencia.forEach(registro => {
      if (registro.id_usuario == id_usuario && registro.id_asignacion == id_asignacion) {
        const clave = moment(registro.fecha).format('YYYY-MM-DD');
        registroMap.set(clave, registro);
      }
    });

    // Función para obtener día de la semana en español
    const getDiaSemanaEspanol = (fechaMoment: moment.Moment): string => {
      const diasMap: { [key: string]: string } = {
        'SUNDAY': 'DOMINGO',
        'MONDAY': 'LUNES',
        'TUESDAY': 'MARTES',
        'WEDNESDAY': 'MIÉRCOLES',
        'THURSDAY': 'JUEVES',
        'FRIDAY': 'VIERNES',
        'SATURDAY': 'SÁBADO'
      };

      const diaIngles = fechaMoment.format('dddd').toUpperCase();
      return diasMap[diaIngles] || diaIngles;
    };

    // Variables para acumular
    let montoTotal = 0;
    let tieneInvalido = false;

    // Inicializar contadores
    let dias_laborados = 0;
    let dias_dominicales = 0;
    let dias_feriados = 0;
    let dias_tardanzas = 0;
    let dias_permiso = 0;
    let dias_faltados = 0;
    let dias_otros = 0;

    // Procesar cada día
    const registroMes = dias.map(dia => {
      const fechaDia = moment(dia.fecha, 'DD-MM-YYYY');
      const fechaDiaKey = fechaDia.format('YYYY-MM-DD');
      const diaSemana = getDiaSemanaEspanol(fechaDia);

      const encontrado = registroMap.get(fechaDiaKey);
      const tipoCodigo = encontrado?.tipo || '';

      // Determinar si es día no laborable o feriado
      const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
      const esFeriado = feriadosSoloFecha.includes(fechaDiaKey);
      const esDiaEspecial = esDiaNoLaborable || esFeriado;

      // CONTAR DIAS DOMINICALES
      if (diaSemana === 'DOMINGO') {
        dias_dominicales++;
      }

      // CONTAR DIAS FERIADOS
      if (esFeriado) {
        dias_feriados++;
      }

      // Verificar si el tipo es inválido (IN o OBS)
      if (tipoCodigo === 'IN' || tipoCodigo === 'OBS') {
        tieneInvalido = true;
      }

      // CONTAR POR TIPO DE ASISTENCIA (solo si es día laborable)
      if (!esDiaEspecial) {
        // DIAS LABORADOS: 'A', 'TEX'
        if (tipoCodigo === 'A' || tipoCodigo === 'TEX') {
          dias_laborados++;
        }
        // DIAS TARDANZAS: 'T', 'TI', 'TJ'
        else if (tipoCodigo === 'T' || tipoCodigo === 'TI' || tipoCodigo === 'TJ') {
          dias_tardanzas++;
        }
        // DIAS PERMISO: 'PE'
        else if (tipoCodigo === 'PE') {
          dias_permiso++;
        }
        // DIAS FALTADOS: 'F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD'
        else if (['F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD', '', null].includes(tipoCodigo)) {
          dias_faltados++;
        }
        // DIAS OTROS: 'OBS', 'IN' y cualquier otro código no categorizado
        else if (tipoCodigo === 'OBS' || tipoCodigo === 'IN' || (tipoCodigo && !tipoMap.has(tipoCodigo))) {
          dias_otros++;
        }
      }

      // Inicializar valores
      let monto = 0;
      let descuentoAplicado = "0";
      let tipoDescripcion = '';

      // Obtener información del tipo si existe
      if (tipoCodigo && tipoCodigo !== '') {
        const tipoInfo = tipoMap.get(tipoCodigo);

        if (tipoInfo) {
          tipoDescripcion = tipoInfo.tipo;
          descuentoAplicado = tipoInfo.descuento;

          // Calcular monto con descuento (solo si no es día especial)
          if (!esDiaEspecial) {
            if (descuentoAplicado && descuentoAplicado !== "") {
              const porcentajeDescuento = parseInt(descuentoAplicado) || 0;
              const descuentoMonto = costedia * (porcentajeDescuento / 100);
              monto = costedia - descuentoMonto;
            } else {
              monto = costedia; // Sin descuento
            }
          }
          // Si es día especial, monto ya está en 0
        } else {
          // Tipo no encontrado en la lista
          tipoDescripcion = 'TIPO DESCONOCIDO';
          if (!esDiaEspecial) {
            monto = costedia;
          }
        }
      } else {
        // Tipo vacío
        tipoDescripcion = '';
        if (!esDiaEspecial) {
          monto = 0; // Tipo vacío en día laborable = 0
        }
      }

      // Si es día especial, mostrar descripción especial pero mantener el tipo original
      let descripcionMostrar = tipoDescripcion;
      if (esDiaEspecial && !tipoDescripcion) {
        descripcionMostrar = esFeriado ? 'FERIADO' : 'DIA NO LABORABLE';
      }

      // Acumular el monto total
      montoTotal += monto;

      return {
        tipo: tipoCodigo, // Mantener el tipo original
        tipoDescripcion: descripcionMostrar,
        fecha: dia.fecha,
        fuente: encontrado?.fuente || null,
        habilitado: true,
        asistencia1: encontrado?.asistencia_1,
        asistencia2: encontrado?.asistencia_2,
        asistencia3: encontrado?.asistencia_3,
        asistencia4: encontrado?.asistencia_4,
        monto_extra: encontrado?.monto_extra || 0,
        horas_extra: encontrado?.horas_extra || 0,
        id_control: encontrado?.id_control || null,
        // Campos nuevos para la funcionalidad
        monto: monto, // Será 0 si es día especial
        costedia: costedia,
        descuento: descuentoAplicado, // Mantener el descuento original
        esDiaNoLaborable: esDiaNoLaborable,
        esFeriado: esFeriado,
        esDiaEspecial: esDiaEspecial,
        // Datos adicionales del registro
        ...(encontrado ? {
          id_proyecto: encontrado.id_proyecto,
          id_usuario: encontrado.id_usuario,
          id_asignacion: encontrado.id_asignacion,
          fecha_registro: encontrado.fecha_registro
        } : {})
      };
    });

    // Retornar objeto con registroMes, montoMes e invalido
    return {
      registroMes: registroMes,
      montoMes: montoTotal,
      invalido: tieneInvalido,
      // Nuevos contadores
      conteos: {
        dias_laborados: dias_laborados,
        dias_dominicales: dias_dominicales,
        dias_feriados: dias_feriados,
        dias_tardanzas: dias_tardanzas,
        dias_permiso: dias_permiso,
        dias_faltados: dias_faltados,
        dias_otros: dias_otros
      }
    };
  }

  getSelectClass(tipoCodigo: string): string {
    const clases: { [key: string]: string } = {
      'A': 'bg-success',
      'T': 'bg-warning text-dark',
      'TI': 'bg-orange text-white',
      'TJ': 'bg-yellow text-dark',
      'F': 'bg-danger',
      'FI': 'bg-dark-red text-white',
      'FJ': 'bg-pink text-white',
      'FM': 'bg-purple text-white',
      'FV': 'bg-info text-white',
      'FC': 'bg-teal text-white',
      'FD': 'bg-dark text-white',
      'PE': 'bg-secondary text-white',
      // 'FS': 'bg-light text-dark border',

      // Nuevos estados con colores únicos
      'OBS': 'bg-indigo text-white',        // Violeta para observado
      'IN': 'bg-light-blue text-dark border',     // Cian para incompleto
      'TEX': 'bg-lime text-dark'  // Verde suave para tiempo extra
    };
    return clases[tipoCodigo] || 'bg-light text-dark';
  }

  getColor(codigo: string): string {
    const colores: { [key: string]: string } = {
      'A': '#28a745',
      'T': '#ffc107',
      'TI': '#fd7e14',
      'TJ': '#ffeb3b',
      'F': '#dc3545',
      'FI': '#c82333',
      'FJ': '#e83e8c',
      'FM': '#6f42c1',
      'FV': '#17a2b8',
      'FC': '#20c997',
      'FD': '#343a40',
      'PE': '#6c757d',
      // 'FS': '#f8f9fa',

      // Colores alternativos
      'OBS': '#8b5cf6',    // Violeta - Observado
      'IN': '#06b6d4',     // Cian - Incompleto
      'TEX': '#22c55e'     // Verde - Tiempo extra
    };
    return colores[codigo] || '#f8f9fa';
  }

  getTextColor(codigo: string): string {
    // Definir los grupos de colores de texto
    const textoBlanco = new Set([
      'TI', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD', 'OBS', // Fondos oscuros
      'A', 'F', 'PE'                                    // Variables con fondo oscuro
    ]);

    const textoNegro = new Set([
      'T', 'TJ', 'IN', 'TEX'  // Fondos claros
    ]);

    // Si está en el grupo de texto blanco, retornar 'white'
    if (textoBlanco.has(codigo)) {
      return 'white';
    }

    // Si está en el grupo de texto negro, retornar 'black'
    if (textoNegro.has(codigo)) {
      return 'black';
    }

    // Por defecto, texto negro
    return 'black';
  }

  async onTipoChange(nuevoValor: string, fila: number, columna: any) {

    // if (this.tablaFiltrada[fila].dias[columna].tipo !== nuevoValor) {
    this.tablaFiltrada[fila].dias[columna].tipo = nuevoValor
    const row = this.tablaFiltrada[fila]
    if (!this.tablaFiltrada[fila].dias[columna].id_control) {
      await this.guardarRegistro(row, row.dias[columna], nuevoValor, fila, columna)

      this.recalcularTodoFila(fila)
    } else {
      this.actualizarRegistro(row, row.dias[columna], nuevoValor, row.dias[columna].id_control, fila, columna)
    }

    // }
  }

  recalcularTodoFila(ind: number): void {

    // 1. Recalcular montos
    this.recalcularMontosFila(ind);

    // 2. Recalcular contadores
    this.recalcularContadoresFila(ind);

    this.recalcularTotales()
  }

  recalcularTotales() {
    let totalMes = 0
    this.tablaFiltrada.map(ele => { if (ele.mostrar && ele.id_usuario) { totalMes += ele.coste_mensual } })
    this.totalMes = totalMes
    const codigosFaltas = ['F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD'];
    this.cantidadUsuariosDia = this.calendarioFiltrado[0]?.dias?.map(() => 0);

    if (this.tablaFiltrada.length) {
      this.tablaFiltrada.forEach(usuario => {
        // REMOVER la condición de id_asignacion o usar un check más flexible
        // Si quieres contar incluso usuarios sin asignación, elimina este if
        // O usa: if (usuario.dias && usuario.dias.length > 0)

        usuario.dias?.forEach((dia, index) => {
          if (dia && dia.tipo && dia.tipo.trim() !== '') {
            if (!codigosFaltas.includes(dia.tipo) && this.cantidadUsuariosDia[index] !== undefined) {
              this.cantidadUsuariosDia[index] += 1;
            }
            // Si quieres contar cualquier registro con tipo no vacío:
            // if (this.cantidadUsuariosDia[index] !== undefined) {
            //   this.cantidadUsuariosDia[index] += 1;
            // }
          }
        });
      });
    }
  }

  async guardarRegistro(row, dataDia, tipo, fila, columna) {
    try {
      const partesFecha = dataDia.fecha.split('-');
      const fechaFormateada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
      const convertirFechaMySQL = (fechaStr: string) => {
        if (!fechaStr) return '';
        // Reemplazar T por espacio para formato MySQL
        return fechaStr.replace('T', ' ');
      };

      // CONVERTIR valores null a strings vacíos
      const obj = {
        id_proyecto: this.idProyecto.toString(),
        id_usuario: row.id_usuario.toString(),
        id_area: row.id_area.toString(),
        id_cargo: row.id_cargo.toString(),
        id_asignacion: row.id_asignacion.toString(),
        fecha: fechaFormateada,
        tipo: tipo,
        fuente: '1',
        asistencia_1: dataDia.asistencia1 ? convertirFechaMySQL(dataDia.asistencia1) : '',
        asistencia_2: dataDia.asistencia2 ? convertirFechaMySQL(dataDia.asistencia2) : '',
        asistencia_3: dataDia.asistencia3 ? convertirFechaMySQL(dataDia.asistencia3) : '',
        asistencia_4: dataDia.asistencia4 ? convertirFechaMySQL(dataDia.asistencia4) : '',
        horas_extra: (dataDia.horas_extra || 0).toString(),
        monto_extra: (dataDia.monto_extra || 0).toString()
      }

      const resp = await this.recursosHumanosService.guardarRegistrosAsistencia(obj)

      if (resp && resp[0]?.resultado == 'OK') {
        this.tablaFiltrada[fila].dias[columna].id_control = resp[0].id_control
        this.tablaFiltrada[fila].dias[columna].fuente = obj.fuente
        this.tablaFiltrada[fila].dias[columna].tipo = obj.tipo
      } else {
        SwalService.error()
        return null;
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
      return null;
    }
  }

  async actualizarRegistro(row, dataDia, tipo, id_control, fila, columna) {
    try {
      const partesFecha = dataDia.fecha.split('-');
      const fechaFormateada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
      const convertirFechaMySQL = (fechaStr: string) => {
        if (!fechaStr) return '';
        return fechaStr.replace('T', ' ');
      };

      const obj = {
        id_control: id_control.toString(),
        id_proyecto: this.idProyecto.toString(),
        id_usuario: row.id_usuario.toString(),
        id_area: row.id_area.toString(),
        id_cargo: row.id_cargo.toString(),
        id_asignacion: row.id_asignacion.toString(),
        fecha: fechaFormateada,
        tipo: tipo,
        fuente: "1",
        asistencia_1: dataDia.asistencia1 ? convertirFechaMySQL(dataDia.asistencia1) : '',
        asistencia_2: dataDia.asistencia2 ? convertirFechaMySQL(dataDia.asistencia2) : '',
        asistencia_3: dataDia.asistencia3 ? convertirFechaMySQL(dataDia.asistencia3) : '',
        asistencia_4: dataDia.asistencia4 ? convertirFechaMySQL(dataDia.asistencia4) : '',
        horas_extra: (dataDia.horas_extra || 0).toString(),
        monto_extra: (dataDia.monto_extra || 0).toString()
      }
      const resp = await this.recursosHumanosService.actualizarRegistrosAsistencia(obj)
      if (resp && resp[0]?.id !== '1') {
        SwalService.error()
      } else if (resp) {
        this.tablaFiltrada[fila].dias[columna].fuente = obj.fuente
        this.tablaFiltrada[fila].dias[columna].tipo = obj.tipo
        this.recalcularTodoFila(fila)
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
    }
  }


  // Método para recalcular solo los contadores de una fila específica usando los datos que ya tiene
  recalcularContadoresFila(ind: number): void {
    const row = this.tablaFiltrada[ind];

    if (!row || !row.dias || !Array.isArray(row.dias)) {
      console.error('Fila no válida o sin días');
      return;
    }

    // Usar los parámetros que ya están en la fila
    const descuentos = row.descuentos || [];
    const diasNoLaborables = row.diasNoLaborables || ['DOMINGO'];
    const feriadosSoloFecha = row.feriadosSoloFecha || [];

    // Crear mapa de tipos con descuentos
    const tipoMap = new Map();
    const tipos = [
      { codigo: 'A', tipo: 'ASISTIO' },
      { codigo: 'T', tipo: 'TARDANZA' },
      { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA' },
      { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA' },
      { codigo: 'F', tipo: 'FALTA' },
      { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA' },
      { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA' },
      { codigo: 'FM', tipo: 'DESCANSO MEDICO' },
      { codigo: 'FV', tipo: 'VACACIONES' },
      { codigo: 'FC', tipo: 'CITA MEDICA' },
      { codigo: 'FD', tipo: 'DUELO' },
      { codigo: 'PE', tipo: 'PERMISO' },
      { codigo: 'OBS', tipo: 'OBSERVADO' },
      { codigo: 'IN', tipo: 'INCOMPLETO' },
      { codigo: 'TEX', tipo: 'TEXTRA' }
    ];

    tipos.forEach((tipoObj, index) => {
      tipoMap.set(tipoObj.codigo, {
        ...tipoObj,
        descuento: descuentos[index] || "0"
      });
    });

    // Función para obtener día de la semana en español
    const getDiaSemanaEspanol = (fechaMoment: moment.Moment): string => {
      const diasMap: { [key: string]: string } = {
        'SUNDAY': 'DOMINGO',
        'MONDAY': 'LUNES',
        'TUESDAY': 'MARTES',
        'WEDNESDAY': 'MIÉRCOLES',
        'THURSDAY': 'JUEVES',
        'FRIDAY': 'VIERNES',
        'SATURDAY': 'SÁBADO'
      };

      const diaIngles = fechaMoment.format('dddd').toUpperCase();
      return diasMap[diaIngles] || diaIngles;
    };

    // Reiniciar contadores
    const conteos = {
      dias_laborados: 0,
      dias_dominicales: 0,
      dias_feriados: 0,
      dias_tardanzas: 0,
      dias_permiso: 0,
      dias_faltados: 0,
      dias_otros: 0
    };

    let tieneInvalido = false;

    // Procesar cada día
    row.dias.forEach(dia => {
      if (!dia || !dia.fecha) return;

      try {
        const fechaDia = moment(dia.fecha, 'DD-MM-YYYY');
        const fechaDiaKey = fechaDia.format('YYYY-MM-DD');
        const diaSemana = getDiaSemanaEspanol(fechaDia);

        // Determinar si es día no laborable o feriado
        const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
        const esFeriado = feriadosSoloFecha.includes(fechaDiaKey);
        const esDiaEspecial = esDiaNoLaborable || esFeriado;

        // CONTAR DIAS DOMINICALES
        if (diaSemana === 'DOMINGO') {
          conteos.dias_dominicales++;
        }

        // CONTAR DIAS FERIADOS
        if (esFeriado) {
          conteos.dias_feriados++;
        }

        // Verificar si el tipo es inválido (IN o OBS)
        if (dia.tipo === 'IN' || dia.tipo === 'OBS') {
          tieneInvalido = true;
        }

        // CONTAR POR TIPO DE ASISTENCIA (solo si es día laborable)
        if (!esDiaEspecial) {
          const tipoCodigo = dia.tipo || '';

          // DIAS LABORADOS: 'A', 'TEX'
          if (tipoCodigo === 'A' || tipoCodigo === 'TEX') {
            conteos.dias_laborados++;
          }
          // DIAS TARDANZAS: 'T', 'TI', 'TJ'
          else if (tipoCodigo === 'T' || tipoCodigo === 'TI' || tipoCodigo === 'TJ') {
            conteos.dias_tardanzas++;
          }
          // DIAS PERMISO: 'PE'
          else if (tipoCodigo === 'PE') {
            conteos.dias_permiso++;
          }
          // DIAS FALTADOS: 'F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD'
          else if (['F', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD', '', null].includes(tipoCodigo)) {
            conteos.dias_faltados++;
          }
          // DIAS OTROS: 'OBS', 'IN' y cualquier otro código no categorizado
          else if (tipoCodigo === 'OBS' || tipoCodigo === 'IN' || (tipoCodigo && !tipoMap.has(tipoCodigo))) {
            conteos.dias_otros++;
          }
        }
      } catch (error) {
        console.warn('Error procesando día:', dia, error);
      }
    });

    // Actualizar la fila directamente
    row.dias_dominicales = conteos.dias_dominicales;
    row.dias_faltados = conteos.dias_faltados;
    row.dias_feriados = conteos.dias_feriados;
    row.dias_laborados = conteos.dias_laborados;
    row.dias_otros = conteos.dias_otros;
    row.dias_permiso = conteos.dias_permiso;
    row.dias_tardanzas = conteos.dias_tardanzas;
    row.invalido = tieneInvalido;


    // También recalcular coste_mensual si es necesario (sumando los montos de cada día)
    if (row.dias && row.dias.length > 0) {
      const nuevoCosteMensual = row.dias.reduce((total, dia) => {
        return total + (dia?.monto || 0);
      }, 0);

      row.coste_mensual = nuevoCosteMensual;
    }

    // Forzar actualización de la vista
    this.tablaFiltrada = [...this.tablaFiltrada];

  }

  // Método para recalcular solo los montos de una fila (si cambió el tipo de asistencia)
  recalcularMontosFila(ind: number): void {
    const row = this.tablaFiltrada[ind];

    if (!row || !row.dias || !Array.isArray(row.dias)) {
      return;
    }

    // Usar los parámetros que ya están en la fila
    const descuentos = row.descuentos || [];

    // Crear mapa de tipos con descuentos
    const tipoMap = new Map();
    const tipos = [
      { codigo: 'A', tipo: 'ASISTIO' },
      { codigo: 'T', tipo: 'TARDANZA' },
      { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA' },
      { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA' },
      { codigo: 'F', tipo: 'FALTA' },
      { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA' },
      { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA' },
      { codigo: 'FM', tipo: 'DESCANSO MEDICO' },
      { codigo: 'FV', tipo: 'VACACIONES' },
      { codigo: 'FC', tipo: 'CITA MEDICA' },
      { codigo: 'FD', tipo: 'DUELO' },
      { codigo: 'PE', tipo: 'PERMISO' },
      { codigo: 'OBS', tipo: 'OBSERVADO' },
      { codigo: 'IN', tipo: 'INCOMPLETO' },
      { codigo: 'TEX', tipo: 'TEXTRA' }
    ];

    tipos.forEach((tipoObj, index) => {
      tipoMap.set(tipoObj.codigo, {
        ...tipoObj,
        descuento: descuentos[index] || "0"
      });
    });

    let montoTotal = 0;

    // Procesar cada día para recalcular montos
    row.dias.forEach(dia => {
      if (!dia || !dia.fecha) return;

      try {
        const fechaDia = moment(dia.fecha, 'DD-MM-YYYY');
        const fechaDiaKey = fechaDia.format('YYYY-MM-DD');
        const diaSemana = this.getDiaSemanaEspanol(fechaDia);

        // Usar los parámetros de la fila
        const diasNoLaborables = row.diasNoLaborables || ['DOMINGO'];
        const feriadosSoloFecha = row.feriadosSoloFecha || [];

        const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
        const esFeriado = feriadosSoloFecha.includes(fechaDiaKey);
        const esDiaEspecial = esDiaNoLaborable || esFeriado;

        const tipoCodigo = dia.tipo || '';
        let monto = 0;
        let descuentoAplicado = "0";

        // Obtener información del tipo si existe
        if (tipoCodigo && tipoCodigo !== '') {
          const tipoInfo = tipoMap.get(tipoCodigo);

          if (tipoInfo) {
            descuentoAplicado = tipoInfo.descuento;

            // Calcular monto con descuento (solo si no es día especial)
            if (!esDiaEspecial) {
              if (descuentoAplicado && descuentoAplicado !== "") {
                const porcentajeDescuento = parseInt(descuentoAplicado) || 0;
                const descuentoMonto = dia.costedia * (porcentajeDescuento / 100);
                monto = dia.costedia - descuentoMonto;
              } else {
                monto = dia.costedia; // Sin descuento
              }
            }
            // Si es día especial, monto ya está en 0
          } else {
            // Tipo no encontrado en la lista
            if (!esDiaEspecial) {
              monto = dia.costedia;
            }
          }
        } else {
          // Tipo vacío
          if (!esDiaEspecial) {
            monto = 0; // Tipo vacío en día laborable = 0
          }
        }

        // Actualizar el monto del día
        dia.monto = monto;
        dia.descuento = descuentoAplicado;
        montoTotal += monto;

      } catch (error) {
        console.warn('Error recalculando monto para día:', dia, error);
      }
    });

    // Actualizar el coste_mensual de la fila
    row.coste_mensual = montoTotal;

    // Forzar actualización de la vista
    this.tablaFiltrada = [...this.tablaFiltrada];

  }

  // Método auxiliar: obtener día de la semana en español
  getDiaSemanaEspanol(fecha: moment.Moment): string {
    const diasMap: { [key: string]: string } = {
      'SUNDAY': 'DOMINGO',
      'MONDAY': 'LUNES',
      'TUESDAY': 'MARTES',
      'WEDNESDAY': 'MIÉRCOLES',
      'THURSDAY': 'JUEVES',
      'FRIDAY': 'VIERNES',
      'SATURDAY': 'SÁBADO'
    };

    const diaIngles = fecha.format('dddd').toUpperCase();
    return diasMap[diaIngles] || diaIngles;
  }

  async listarAsistenciasMovil() {

    try {
      this.mostrar_carga_todo = true
      this.tablaAsistenciaMovil = []
      this.filAsisMov = null
      const obj = {
        id_proyecto: this.idProyecto,
        id_area: this.areaSeleccionada2,
        id_cargo: this.cargoSeleccionada2,
        fecha_inicio: this.fechaSeleccionada,
        fecha_fin: this.fechaSeleccionada,
      }
      const tablaAsistenciaMovil = await this.recursosHumanosService.listarAsistenciaMovil(obj)
      if (!tablaAsistenciaMovil.length) {
        this.toaster.error(
          'No se encontraron registros para esta fecha',
          '',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
      } else {
        const response = await this.agrupar(tablaAsistenciaMovil)
        this.tablaAsistenciaMovil = response
      }
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }

  }

  async vincularASistenciaDiaPlanilla() {
    try {
      if (!this.tablaAsistenciaMovil.length) {
        this.toaster.error(
          'Ningun dato que vincular',
          '',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );
        return
      }
      this.mostrar_carga_todo = true
      const data = {
        id_proyecto: this.idProyecto,
        id_area: 0
      }
      const datos = await this.recursosHumanosService.listarHorarioYFeriadosArea(data)
      // console.log('horarios', datos[0])
      let dataAlmacenar = []
      for (const usuario of this.tablaAsistenciaMovil) {
        let horarioArea = datos[0].find(ele => ele.id_area == usuario.id_area)
        if (!horarioArea) {
          horarioArea = {
            id_configuracion: null,
            id_proyecto: usuario.id_proyecto,
            id_area: usuario.id_area,
            inicio_semana: 'LUNES',
            dias_nolaborables: 'DOMINGO',
            hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
            hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
            hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
            hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
            totales_dia: 48,
            descuentos: '|10|10||100|100|||||||',
            tardanza: 0,
            tiempo_extra: 0
          }
        }
        const feriados = datos[1]
          .filter(ele => {
            const areas = ele.areas.split('|');
            return areas.includes(usuario.id_area.toString());
          })
          .map(ele => {
            return {
              ...ele,
              fecha_formateada: moment(ele.fecha).format('DD-MM-YYYY')
            };
          });

        const resultado = await this.analizarUsuario(usuario, horarioArea, horarioArea.tardanza ? horarioArea.tardanza : 0)
        const fecha = usuario.tipo_asistencia1 ||
          usuario.tipo_asistencia2 ||
          usuario.tipo_asistencia3 ||
          usuario.tipo_asistencia4
        const convertirFechaMySQL = (fechaStr: string) => {
          if (!fechaStr) return null;
          // Reemplazar T por espacio para formato MySQL
          return fechaStr.replace('T', ' ');
        };
        const obj =
        {
          id_proyecto: usuario.id_proyecto,
          id_usuario: usuario.id_usuario,
          id_area: usuario.id_area,
          id_cargo: usuario.id_cargo,
          id_asignacion: usuario.id_asignacion,
          fecha: moment(fecha).format('YYYY-MM-DD'),
          tipo: resultado.estado || '',
          fuente: 0,
          fecha_registro: null,
          asistencia_1: usuario.tipo_asistencia1 ? convertirFechaMySQL(usuario.tipo_asistencia1) : null,
          asistencia_2: usuario.tipo_asistencia2 ? convertirFechaMySQL(usuario.tipo_asistencia2) : null,
          asistencia_3: usuario.tipo_asistencia3 ? convertirFechaMySQL(usuario.tipo_asistencia3) : null,
          asistencia_4: usuario.tipo_asistencia4 ? convertirFechaMySQL(usuario.tipo_asistencia4) : null,
          horas_extra: 0,
          monto_extra: 0
        }
        dataAlmacenar.push(obj)
      }
      // const datos1 = JSON.stringify(dataAlmacenar);
      // const obj = JSON.stringify({
      //   datos1: datos1,
      // });
      const resp = await this.recursosHumanosService.guardarActualizarRegistrosAsistencia(dataAlmacenar)
      if (resp?.id == "1") {
        this.tablaFiltrada = []
        this.toaster.success(
          resp?.mensaje,
          'Correcto',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
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

  agrupar(asistencias: Asistencia[]): AsistenciaAgrupada[] {
    const grupos = new Map<string, any>();

    asistencias.forEach(asistencia => {
      const clave = this.generarClave(asistencia);

      if (!grupos.has(clave)) {
        grupos.set(clave, this.crearGrupoBase(asistencia));
      }

      this.asignarAsistenciaPorTipo(grupos.get(clave), asistencia);
    });

    return this.procesarGrupos(grupos);
  }

  // Generar clave única para agrupación
  generarClave(asistencia: Asistencia): string {
    return `${asistencia.id_usuario}_${asistencia.id_proyecto}_${asistencia.id_area}_${asistencia.id_cargo}_${asistencia.id_asignacion}`;
  }

  // Crear objeto base del grupo
  crearGrupoBase(asistencia: Asistencia): any {
    return {
      id_usuario: asistencia.id_usuario,
      id_proyecto: asistencia.id_proyecto,
      id_area: asistencia.id_area,
      id_cargo: asistencia.id_cargo,
      id_asignacion: asistencia.id_asignacion,
      nombres_usuario: asistencia.nombres_usuario,
      apellidos_usuario: asistencia.apellidos_usuario,
      nombre_completo_usuario: asistencia.nombre_completo_usuario,
      nombre_area: asistencia.nombre_area,
      nombre_cargo: asistencia.nombre_cargo,
      tipo_asistencia1: null,
      tipo_asistencia2: null,
      tipo_asistencia3: null,
      tipo_asistencia4: null,
      total_registros: 0
    };
  }

  // Asignar asistencia según tipo
  asignarAsistenciaPorTipo(grupo: any, asistencia: Asistencia): void {
    const propiedad = `tipo_asistencia${asistencia.tipo_asistencia}`;
    if (grupo.hasOwnProperty(propiedad)) {
      grupo[propiedad] = asistencia.fecha_hora;
      grupo.total_registros++;
    }
  }

  // Procesar y añadir propiedades adicionales
  procesarGrupos(grupos: Map<string, any>): AsistenciaAgrupada[] {
    return Array.from(grupos.values()).map(grupo => {
      const registrosCompletos = grupo.tipo_asistencia1 !== null &&
        grupo.tipo_asistencia2 !== null &&
        grupo.tipo_asistencia3 !== null &&
        grupo.tipo_asistencia4 !== null;

      return {
        ...grupo,
        registros_completos: registrosCompletos,
        tiene_ingreso: grupo.tipo_asistencia1 !== null,
        tiene_salida_almuerzo: grupo.tipo_asistencia2 !== null,
        tiene_retorno_almuerzo: grupo.tipo_asistencia3 !== null,
        tiene_salida: grupo.tipo_asistencia4 !== null
      };
    });
  }

  // // Filtrar por usuario específico
  // static filtrarPorUsuario(asistenciasAgrupadas: AsistenciaAgrupada[], idUsuario: number): AsistenciaAgrupada[] {
  //   return asistenciasAgrupadas.filter(grupo => grupo.id_usuario === idUsuario);
  // }

  // Obtener usuarios con registros incompletos
  static obtenerIncompletos(asistenciasAgrupadas: AsistenciaAgrupada[]): AsistenciaAgrupada[] {
    return asistenciasAgrupadas.filter(grupo => !grupo.registros_completos);
  }

  obtenerIndiceDia(fechaString) {
    // Extraer solo la parte de la fecha (sin hora)
    const fechaPart = fechaString.split('T')[0];
    const [year, month, day] = fechaPart.split('-').map(Number);

    // Crear fecha en hora local pero forzando la hora a mediodía
    // para evitar problemas de cambios de día por diferencia horaria
    const fecha = new Date(year, month - 1, day, 12, 0, 0);

    const diaJS = fecha.getDay();

    // Convertir: Lunes=0, Domingo=6
    return diaJS === 0 ? 6 : diaJS - 1;
  }

  // Convertir hora string "HH:MM:SS" a milisegundos del día
  horaStringAMilisegundos(horaStr) {
    if (!horaStr || horaStr === '00:00:00') return null;

    const partes = horaStr.split(':');
    const horas = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);
    const segundos = parseInt(partes[2]);

    return (horas * 3600 + minutos * 60 + segundos) * 1000;
  }

  // analizarUsuario(usuario, horarioArea, toleranciaTardanza) {
  //   // Obtener el día del primer registro (asumiendo que todos los registros son del mismo día)
  //   const fechaRegistro = usuario.tipo_asistencia1 ||
  //     usuario.tipo_asistencia2 ||
  //     usuario.tipo_asistencia3 ||
  //     usuario.tipo_asistencia4;

  //   if (!fechaRegistro) {
  //     return {
  //       estado: 'falto',
  //       diferencias: null,
  //       detalles: 'No hay registros de asistencia'
  //     };
  //   }

  //   const indiceDia = this.obtenerIndiceDia(fechaRegistro);
  //   const diaSemana = this.diasSemana[indiceDia];
  //   // Obtener horas esperadas para ese día

  //   const horasEsperadas = {
  //     ingresoManana: horarioArea.hora_ingreso_manana.split('|')[indiceDia],
  //     salidaManana: horarioArea.hora_salida_manana.split('|')[indiceDia],
  //     ingresoTarde: horarioArea.hora_ingreso_tarde.split('|')[indiceDia],
  //     salidaTarde: horarioArea.hora_salida_tarde.split('|')[indiceDia]
  //   };
  //   // Calcular diferencias
  //   const diferencias = {
  //     tipo1: this.calcularDiferencia(usuario.tipo_asistencia1, horasEsperadas.ingresoManana),
  //     tipo2: this.calcularDiferencia(usuario.tipo_asistencia2, horasEsperadas.salidaManana),
  //     tipo3: this.calcularDiferencia(usuario.tipo_asistencia3, horasEsperadas.ingresoTarde),
  //     tipo4: this.calcularDiferencia(usuario.tipo_asistencia4, horasEsperadas.salidaTarde)
  //   };
  //    console.log('horasEsperadas', horasEsperadas)
  //   console.log('diferencias', diferencias)
  //   // Contar registros existentes
  //   const registrosExistentes = [
  //     usuario.tipo_asistencia1,
  //     usuario.tipo_asistencia2,
  //     usuario.tipo_asistencia3,
  //     usuario.tipo_asistencia4
  //   ].filter(reg => reg !== null && reg !== undefined).length;
  //   // Verificar si es día no laborable
  //   const esDiaNoLaborable = horarioArea.dias_nolaborables.includes(diaSemana) ||
  //     horasEsperadas.ingresoManana === '00:00:00';

  //   if (esDiaNoLaborable) {
  //     return {
  //       estado: 'observado',
  //       diferencias: diferencias,
  //       detalles: `Día no laborable (${diaSemana})`,
  //       registrosCompletos: registrosExistentes === 4
  //     };
  //   }

  //   // Evaluar estado según criterios
  //   let estado = '';
  //   let detalles = '';

  //   // 1. Falto - No hay ningún registro
  //   if (registrosExistentes === 0) {
  //     estado = 'F';
  //     detalles = 'No hay registros de asistencia';
  //   }
  //   // 2. Asistió - Todos los registros en hora exacta
  //   else if (diferencias.tipo1 === 0 &&
  //     diferencias.tipo2 === 0 &&
  //     diferencias.tipo3 === 0 &&
  //     diferencias.tipo4 === 0) {
  //     estado = 'A';
  //     detalles = 'Todos los registros en hora exacta';
  //   }
  //   // 3. Tardanza - Ingreso mañana o tarde después del tiempo de tolerancia
  //   else if (registrosExistentes == 4 && ((diferencias.tipo1 > 0 && diferencias.tipo1 * 1000 > toleranciaTardanza) ||
  //     (diferencias.tipo3 > 0 && diferencias.tipo3 * 1000 > toleranciaTardanza))) {

  //     estado = 'T';
  //     detalles = `Retraso en ingreso (tolerancia: ${horarioArea.tardanza || 10} min)`;
  //   }
  //   // 4. Horas Exceso - Salida mañana o tarde después de la hora
  //   else if (registrosExistentes == 4 && ((diferencias.tipo2 > 0 && diferencias.tipo2 > 0) ||
  //     (diferencias.tipo4 > 0 && diferencias.tipo4 > 0))) {
  //     estado = 'TEX';
  //     detalles = 'Tiempo extra trabajado';
  //   }
  //   // 5. Incompleto - Faltan registros (pero hay al menos uno)
  //   else if (registrosExistentes < 4) {
  //     estado = 'IN';
  //     detalles = `Faltan ${4 - registrosExistentes} registros`;
  //   }
  //   // 6. Observado - Otros casos (antes de la hora, dentro de tolerancia, etc.)
  //   else {
  //     estado = 'OBS';
  //     detalles = 'Registros dentro de parámetros normales';
  //   }

  //   return {
  //     estado: estado,
  //     diferencias: diferencias,
  //     detalles: detalles,
  //     registrosCompletos: registrosExistentes === 4,
  //     dia: diaSemana,
  //     horasEsperadas: horasEsperadas
  //   };
  // }

  analizarUsuario(usuario, horarioArea, toleranciaTardanza) {
    // Obtener el día del primer registro (asumiendo que todos los registros son del mismo día)
    const fechaRegistro = usuario.tipo_asistencia1 ||
      usuario.tipo_asistencia2 ||
      usuario.tipo_asistencia3 ||
      usuario.tipo_asistencia4;

    if (!fechaRegistro) {
      return {
        estado: 'falto',
        diferencias: null,
        detalles: 'No hay registros de asistencia'
      };
    }

    const indiceDia = this.obtenerIndiceDia(fechaRegistro);
    const diaSemana = this.diasSemana[indiceDia];

    // Obtener horas esperadas para ese día
    const horasEsperadas = {
      ingresoManana: this.obtenerHoraEsperada(horarioArea.hora_ingreso_manana, indiceDia),
      salidaManana: this.obtenerHoraEsperada(horarioArea.hora_salida_manana, indiceDia),
      ingresoTarde: this.obtenerHoraEsperada(horarioArea.hora_ingreso_tarde, indiceDia),
      salidaTarde: this.obtenerHoraEsperada(horarioArea.hora_salida_tarde, indiceDia)
    };
    const registros = {
      ingresoManana: usuario.tipo_asistencia1,
      salidaManana: usuario.tipo_asistencia2,
      ingresoTarde: usuario.tipo_asistencia3,
      salidaTarde: usuario.tipo_asistencia4
    }

    // Verificar si existen las horas esperadas
    const existeIngresoManana = horasEsperadas.ingresoManana !== null && horasEsperadas.ingresoManana !== '00:00:00';
    const existeSalidaManana = horasEsperadas.salidaManana !== null && horasEsperadas.salidaManana !== '00:00:00';
    const existeIngresoTarde = horasEsperadas.ingresoTarde !== null && horasEsperadas.ingresoTarde !== '00:00:00';
    const existeSalidaTarde = horasEsperadas.salidaTarde !== null && horasEsperadas.salidaTarde !== '00:00:00';

    // Verificar registros existentes del usuario
    const existeRegistro1 = usuario.tipo_asistencia1 !== null && usuario.tipo_asistencia1 !== undefined;
    const existeRegistro2 = usuario.tipo_asistencia2 !== null && usuario.tipo_asistencia2 !== undefined;
    const existeRegistro3 = usuario.tipo_asistencia3 !== null && usuario.tipo_asistencia3 !== undefined;
    const existeRegistro4 = usuario.tipo_asistencia4 !== null && usuario.tipo_asistencia4 !== undefined;

    // Contar registros existentes
    const registrosExistentes = [
      existeRegistro1,
      existeRegistro2,
      existeRegistro3,
      existeRegistro4
    ].filter(existe => existe).length;

    // Verificar si es día no laborable
    const esDiaNoLaborable = horarioArea.dias_nolaborables.includes(diaSemana) ||
      (!existeIngresoManana && !existeSalidaManana && !existeIngresoTarde && !existeSalidaTarde);

    if (esDiaNoLaborable) {
      // Verificar si hay registros en día no laborable
      if (registrosExistentes > 0) {
        return {
          estado: 'OBS',
          diferencias: null,
          detalles: `Registros en día no laborable (${diaSemana})`,
          registrosCompletos: false,
          dia: diaSemana,
          horasEsperadas: horasEsperadas
        };
      }
      return {
        estado: 'observado',
        diferencias: null,
        detalles: `Día no laborable (${diaSemana})`,
        registrosCompletos: false,
        dia: diaSemana,
        horasEsperadas: horasEsperadas
      };
    }

    // Verificar incompatibilidad entre registros y horas esperadas
    // Si no existe hora esperada pero sí existe registro -> OBS
    if ((!existeIngresoManana && existeRegistro1) ||
      (!existeSalidaManana && existeRegistro2) ||
      (!existeIngresoTarde && existeRegistro3) ||
      (!existeSalidaTarde && existeRegistro4)) {
      return {
        estado: 'OBS',
        diferencias: null,
        detalles: 'Registro sin hora esperada correspondiente',
        registrosCompletos: false,
        dia: diaSemana,
        horasEsperadas: horasEsperadas,
        tardanza: toleranciaTardanza,
        tiempo_extra: horarioArea.tiempo_extra
      };
    }

    // Si no existe registro pero sí existe hora esperada -> IN (incompleto)
    const registrosFaltantes = [];
    if (existeIngresoManana && !existeRegistro1) registrosFaltantes.push('ingreso mañana');
    if (existeSalidaManana && !existeRegistro2) registrosFaltantes.push('salida mañana');
    if (existeIngresoTarde && !existeRegistro3) registrosFaltantes.push('ingreso tarde');
    if (existeSalidaTarde && !existeRegistro4) registrosFaltantes.push('salida tarde');

    if (registrosFaltantes.length > 0) {
      return {
        estado: 'IN',
        diferencias: null,
        detalles: `Faltan registros: ${registrosFaltantes.join(', ')}`,
        registrosCompletos: false,
        dia: diaSemana,
        horasEsperadas: horasEsperadas,
        tardanza: toleranciaTardanza,
        tiempo_extra: horarioArea.tiempo_extra
      };
    }

    // Si no hay registros ni horas esperadas (día libre) -> observado
    if (registrosExistentes === 0 &&
      !existeIngresoManana &&
      !existeSalidaManana &&
      !existeIngresoTarde &&
      !existeSalidaTarde) {
      return {
        estado: 'observado',
        diferencias: null,
        detalles: 'Día sin horas laborales definidas',
        registrosCompletos: false,
        dia: diaSemana,
        horasEsperadas: horasEsperadas,
        tardanza: toleranciaTardanza,
        tiempo_extra: horarioArea.tiempo_extra
      };
    }

    // Calcular diferencias solo para las combinaciones que existen
    const diferencias = {
      tipo1: existeRegistro1 && existeIngresoManana ?
        this.calcularDiferencia(usuario.tipo_asistencia1, horasEsperadas.ingresoManana) : null,
      tipo2: existeRegistro2 && existeSalidaManana ?
        this.calcularDiferencia(usuario.tipo_asistencia2, horasEsperadas.salidaManana) : null,
      tipo3: existeRegistro3 && existeIngresoTarde ?
        this.calcularDiferencia(usuario.tipo_asistencia3, horasEsperadas.ingresoTarde) : null,
      tipo4: existeRegistro4 && existeSalidaTarde ?
        this.calcularDiferencia(usuario.tipo_asistencia4, horasEsperadas.salidaTarde) : null
    };



    // Convertir minutos a segundos para comparaciones
    const toleranciaTardanzaSegundos = toleranciaTardanza * 60; // minutos a segundos
    const tiempoExtraSegundos = (horarioArea.tiempo_extra || 0) * 60; // minutos a segundos

    // console.log('Tolerancia tardanza:', toleranciaTardanza, 'min =', toleranciaTardanzaSegundos, 'seg');
    // console.log('Tiempo extra:', horarioArea.tiempo_extra || 0, 'min =', tiempoExtraSegundos, 'seg');

    // Evaluar estado según criterios
    let estado = '';
    let detalles = '';

    // 1. Falto - No hay ningún registro cuando debería haber
    if (registrosExistentes === 0 && (existeIngresoManana || existeSalidaManana || existeIngresoTarde || existeSalidaTarde)) {
      estado = 'falto';
      detalles = 'No hay registros de asistencia';
    }
    // 2. Asistió - Todos los registros en hora exacta (solo donde ambos existen)
    else if ((!existeRegistro1 || diferencias.tipo1 === 0) &&
      (!existeRegistro2 || diferencias.tipo2 === 0) &&
      (!existeRegistro3 || diferencias.tipo3 === 0) &&
      (!existeRegistro4 || diferencias.tipo4 === 0)) {
      estado = 'A';
      detalles = 'Todos los registros en hora exacta';
    }
    // 3. Tardanza - Ingreso mañana o tarde dentro de la tolerancia (positivo pero <= tolerancia)
    else if (((existeRegistro1 && existeIngresoManana && diferencias.tipo1 > 0 && diferencias.tipo1 <= toleranciaTardanzaSegundos) ||
      (existeRegistro3 && existeIngresoTarde && diferencias.tipo3 > 0 && diferencias.tipo3 <= toleranciaTardanzaSegundos))) {

      estado = 'T';
      detalles = `Retraso dentro de tolerancia (${toleranciaTardanza} min)`;
    }
    // 4. TEX - Tiempo extra (salida después del tiempo extra permitido)
    else if (((existeRegistro2 && existeSalidaManana && diferencias.tipo2 > 0 &&
      diferencias.tipo2 > tiempoExtraSegundos) ||
      (existeRegistro4 && existeSalidaTarde && diferencias.tipo4 > 0 &&
        diferencias.tipo4 > tiempoExtraSegundos))) {

      estado = 'TEX';
      detalles = `Tiempo extra trabajado (más de ${horarioArea.tiempo_extra || 0} min)`;
    }
    // 5. Observado por tardanza excesiva (más que la tolerancia)
    else if (((existeRegistro1 && existeIngresoManana && diferencias.tipo1 > 0 && diferencias.tipo1 > toleranciaTardanzaSegundos) ||
      (existeRegistro3 && existeIngresoTarde && diferencias.tipo3 > 0 && diferencias.tipo3 > toleranciaTardanzaSegundos))) {

      estado = 'OBS';
      detalles = `Retraso excede tolerancia (más de ${toleranciaTardanza} min)`;
    }
    // 6. Observado por salida antes de tiempo (diferencia negativa)
    else if (((existeRegistro2 && existeSalidaManana && diferencias.tipo2 < 0) ||
      (existeRegistro4 && existeSalidaTarde && diferencias.tipo4 < 0))) {

      estado = 'OBS';
      detalles = 'Salida antes de la hora programada';
    }
    // 7. Observado por ingreso antes de tiempo (diferencia negativa)
    else if (((existeRegistro1 && existeIngresoManana && diferencias.tipo1 < 0) ||
      (existeRegistro3 && existeIngresoTarde && diferencias.tipo3 < 0))) {

      estado = 'OBS';
      detalles = 'Ingreso antes de la hora programada';
    }
    // 8. Observado por salida dentro del tiempo extra permitido (positivo pero <= tiempo extra)
    else if (((existeRegistro2 && existeSalidaManana && diferencias.tipo2 > 0 && diferencias.tipo2 <= tiempoExtraSegundos) ||
      (existeRegistro4 && existeSalidaTarde && diferencias.tipo4 > 0 && diferencias.tipo4 <= tiempoExtraSegundos))) {

      estado = 'OBS';
      detalles = `Salida dentro del tiempo extra permitido (hasta ${horarioArea.tiempo_extra || 0} min)`;
    }
    // 9. Otros casos observados
    else {
      estado = 'OBS';
      detalles = 'Registros dentro de parámetros normales';
    }

    return {
      estado: estado,
      diferencias: diferencias,
      detalles: detalles,
      registrosCompletos: registrosExistentes === 4,
      dia: diaSemana,
      horasEsperadas: horasEsperadas,
      registros: registros,
      tardanza: toleranciaTardanza,
      tiempo_extra: horarioArea.tiempo_extra
    };
  }

  // Función auxiliar para obtener hora esperada
  obtenerHoraEsperada(cadenaHoras, indiceDia) {
    if (!cadenaHoras) return null;
    const horas = cadenaHoras.split('|');
    if (indiceDia >= horas.length) return null;
    const hora = horas[indiceDia];
    return hora === '00:00:00' ? null : hora;
  }

  // Función para calcular diferencia en segundos
  calcularDiferencia(registro: string, horaEsperada: string): number | null {
    if (!registro || !horaEsperada) return null;

    const fechaRegistro = new Date(registro).getTime(); // timestamp en ms

    // Extraer hora, minutos y segundos de la hora esperada
    const [horas, minutos, segundos] = horaEsperada.split(':').map(Number);

    // Crear fecha base (usando la fecha del registro pero con la hora esperada)
    const fechaBase = new Date(registro);
    fechaBase.setHours(horas, minutos, segundos, 0);
    const timestampEsperado = fechaBase.getTime(); // timestamp en ms

    // Calcular diferencia en segundos
    return (fechaRegistro - timestampEsperado) / 1000;
  }

  findabrev(input) {
    let encontrado = this.tablaPresAnalitico.find((item) => item.abreviatura == input)
    if (encontrado) {
      // return encontrado.monto
    } else {
      return ''
    }
  }

  convertirAArray(expresion: string): string[] {
    const partes = expresion.split(/([\+\-\*/\(\)])/)
    const resultado = partes.filter((elemento) => elemento !== '')
    return resultado
  }

  VerifBucle(formula: any, vbusq: any) {
    const arregloResultado = this.convertirAArray(formula);
    let bucle = false;
    for (let a = 0; a < arregloResultado.length; a++) {
      const operadores = arregloResultado[a].match(/[+\-*()/]/g);
      if (!operadores) {
        if (arregloResultado[a] == vbusq) {
          bucle = true;
          break;
        }
        for (let row of this.tablaPresAnalitico) {
          if (row.abreviatura == arregloResultado[a]) {
            if ((row.formula ?? '') != '') {
              bucle = this.VerifBucle(row.formula, vbusq); //recursivo
              if (bucle) {
                break;
              }
            }
          }
        }
      }
    }
    return bucle;
  }

  calcularformula(texto) {
    try {
      return math.evaluate(texto);
    } catch {
      return null;
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
    // this.tablaPresAnalitico.push(fil)

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

  iniciarTemporizador() {
    this.temporizador = setInterval(() => {
      this.contador += this.intervalo / 1000; // Incrementa en fracciones de segundo


      if (this.contador >= this.tiempoLimite) {
        this.actualizarPresAnaliticoRH();
        this.detenerTemporizador();
      }
    }, this.intervalo);
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

  blurFormula(valor: string, index: number) {
    if (index === 0) return; // Fila base no tiene fórmula

    this.tablaPresAnalitico[index].formula = valor.toUpperCase();
    this.recalcularTodasFormulas();
    this.reiniciarContador();
  }

  // async recalcularTodasFormulas(soloFooter = false) {
  //   if (!soloFooter) {
  //     await this.formulaEvaluator.evaluarTodasFormulas(this.tablaPresAnalitico);
  //   }

  //   const acumulados: cargoFila[] = Object.values(
  //     this.tablaPresAnalitico.reduce((acc, element) => {
  //       element.cargos.forEach(ele => {
  //         const id = ele.id_cargo;
  //         if (!acc[id]) {
  //           acc[id] = {
  //             id_cargo: id,
  //             parcial: 0,
  //             porcentaje: null
  //           };
  //         }
  //         acc[id].parcial! += (ele.parcial || 0);
  //       });
  //       return acc;
  //     }, {} as { [key: number]: cargoFila })
  //   );
  //   // this.tablaPresAnaliticoFooter[0].cargos = JSON.parse(JSON.stringify(acumulados))

  //   let i = 0
  //   let acumuladosCalculados
  //   console.log('a1', JSON.parse(JSON.stringify(this.tablaPresAnaliticoFooter)))
  //   for (const element of this.tablaPresAnaliticoFooter) {
  //     if (i == 0) {
  //       // Caso 0: copiar los acumulados directamente
  //       element.cargos = JSON.parse(JSON.stringify(acumulados));
  //     } else if (i == 1) {
  //       // Caso 1: dividir todos por las horas
  //       const horas = element?.formula ? Number(element?.formula) : 1;
  //       acumuladosCalculados = acumulados.map(ele => ({
  //         ...ele,
  //         parcial: (ele.parcial || 0) / horas
  //       }));
  //       element.cargos = acumuladosCalculados;
  //     } else {
  //       let k = 0
  //       for (const cargo of element.cargos) {
  //         if (cargo.porcentaje) {
  //           console.log('cargo', cargo)
  //           console.log('p1', JSON.parse(JSON.stringify(cargo.porcentaje)))
  //           cargo.parcial =
  //             acumuladosCalculados[k]?.parcial == null ||
  //               cargo?.porcentaje == null ||
  //               cargo.porcentaje === 0
  //               ? null
  //               : acumuladosCalculados[k].parcial * (cargo.porcentaje / 100);
  //           console.log('p2', JSON.parse(JSON.stringify(cargo.porcentaje)))
  //         } else if (!cargo.porcentaje && !acumuladosCalculados[k]?.parcial) {
  //           cargo.parcial = null
  //         }
  //         k++
  //       }


  //     }
  //     i++
  //   }
  //   console.log('a2', JSON.parse(JSON.stringify(this.tablaPresAnaliticoFooter)))
  // }

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

  obtenerDependencias(formula: string): string[] {
    return this.formulaEvaluator.obtenerDependencias(formula);
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
        this.tablaFiltrada = []
        this.totalMes = 0
        this.cantidadUsuariosDia = []
      } else if (response?.length == 1 && arrayGuardar.length == 1) {
        // Si es solo un elemento, encontrar su índice y actualizar
        const itemABuscar = arrayGuardar[0].item;

        // Encontrar el índice del elemento que coincide
        const index = this.tablaPresAnalitico.findIndex(ele => ele.item == itemABuscar);

        if (index !== -1) {
          // Actualizar solo esa fila con el id_control de la respuesta
          this.tablaPresAnalitico[index].id_presupuesto = response[0].id_presupuesto;

          // Si necesitas actualizar otros campos de la respuesta
          // this.tablaPresAnalitico[index] = { ...this.tablaPresAnalitico[index], ...response[0] };
        } else {
          console.warn(`No se encontró el elemento con item: ${itemABuscar}`);
        }
        this.tablaFiltrada = []
        this.totalMes = 0
        this.cantidadUsuariosDia = []
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
          this.tablaFiltrada = []
          this.totalMes = 0
          this.cantidadUsuariosDia = []
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
  // async eliminarFila() {
  //   if (this.filPresAna === undefined || this.filPresAna === null) {
  //     SwalService.error('No hay fila seleccionada para eliminar');
  //     return;
  //   }

  //   try {
  //     // 1. Obtener el elemento a eliminar
  //     const elementoAEliminar = this.tablaPresAnalitico[this.filPresAna];

  //     if (!elementoAEliminar) {
  //       SwalService.error('No se encontró el elemento a eliminar');
  //       return;
  //     }

  //     const abreviaturaEliminar = elementoAEliminar.abreviatura;
  //     const itemEliminar = elementoAEliminar.item;
  //     const idPresupuestoEliminar = elementoAEliminar.id_presupuesto;

  //     // 2. Preparar array para actualizaciones
  //     const actualizaciones: any[] = [];

  //     // 3. Buscar fórmulas que usen esta abreviatura
  //     const abreviaturasLimpieza = [abreviaturaEliminar];
  //     const formulasActualizadas = new Set<string>();
  //     const maxProfundidad = 10;
  //     let profundidad = 0;

  //     while (abreviaturasLimpieza.length > 0 && profundidad < maxProfundidad) {
  //       profundidad++;
  //       const abreviaturaActual = abreviaturasLimpieza.shift()!;
  //       const esElementoEliminando = abreviaturaActual === this.tablaPresAnalitico[this.filPresAna].abreviatura;

  //       // Buscar fórmulas que contengan esta abreviatura
  //       this.tablaPresAnalitico.forEach((elemento, index) => {
  //         if (index === this.filPresAna) return; // Saltar el elemento que se eliminará

  //         if (elemento.formula && this.formulaContieneAbreviatura(elemento.formula, abreviaturaActual)) {
  //           // CASO 1: Si la abreviatura actual es la del elemento que se ELIMINA
  //           // Entonces limpiar la fórmula del elemento que la referencia
  //           if (esElementoEliminando) {
  //             actualizaciones.push({
  //               id_presupuesto: elemento.id_presupuesto,
  //               item: elemento.item,
  //               descripcion: elemento.descripcion,
  //               abreviatura: elemento.abreviatura,
  //               formula: '', // Fórmula vacía porque referencia a un elemento eliminado
  //               cargos: elemento.cargos || this.getCargosPorDefecto()
  //             });
  //             formulasActualizadas.add(elemento.abreviatura);

  //             // Si limpiamos esta fórmula, podría afectar a otras que dependan de ella
  //             if (!abreviaturasLimpieza.includes(elemento.abreviatura)) {
  //               abreviaturasLimpieza.push(elemento.abreviatura);
  //             }
  //           }
  //           // CASO 2: Si contiene una abreviatura que fue invalidada (pero no es el elemento eliminado)
  //           // Solo aplicar si NO es el elemento que se está eliminando directamente
  //           else if (!esElementoEliminando) {
  //             // Limpiar la fórmula de la referencia inválida
  //             const nuevaFormula = this.limpiarFormula(elemento.formula, abreviaturaActual);

  //             // Verificar si la fórmula resultante es válida
  //             const formulaEsValida = this.esFormulaValida(nuevaFormula);

  //             actualizaciones.push({
  //               id_presupuesto: elemento.id_presupuesto,
  //               item: elemento.item,
  //               descripcion: elemento.descripcion,
  //               abreviatura: elemento.abreviatura,
  //               formula: formulaEsValida ? nuevaFormula : '',
  //               cargos: elemento.cargos || this.getCargosPorDefecto()
  //             });

  //             formulasActualizadas.add(elemento.abreviatura);

  //             // Si la fórmula quedó inválida, propagar el efecto
  //             if (!formulaEsValida) {
  //               if (!abreviaturasLimpieza.includes(elemento.abreviatura)) {
  //                 abreviaturasLimpieza.push(elemento.abreviatura);
  //               }
  //             }
  //           }
  //         }
  //       });
  //     }

  //     // 4. Recalcular todas las fórmulas (después de limpiar las dependencias)
  //     this.recalcularTodasFormulas();

  //     // 5. Reordenar items si es necesario
  //     if (itemEliminar) {
  //       // Obtener todos los items mayores al que se elimina
  //       const elementosReordenar = this.tablaPresAnalitico
  //         .filter((elemento, index) => {
  //           if (index === this.filPresAna) return false;
  //           const itemNum = parseInt(elemento.item);
  //           const itemEliminarNum = parseInt(itemEliminar);
  //           return !isNaN(itemNum) && !isNaN(itemEliminarNum) && itemNum > itemEliminarNum;
  //         })
  //         .sort((a, b) => parseInt(a.item) - parseInt(b.item));

  //       // Actualizar items
  //       elementosReordenar.forEach((elemento, index) => {
  //         const nuevoItem = (parseInt(itemEliminar) + index).toString();

  //         // Verificar si ya existe una actualización para este elemento
  //         const idxActualizacion = actualizaciones.findIndex(
  //           a => a.id_presupuesto === elemento.id_presupuesto
  //         );

  //         if (idxActualizacion !== -1) {
  //           // Actualizar item en la actualización existente
  //           actualizaciones[idxActualizacion].item = nuevoItem;
  //         } else {
  //           // Agregar nueva actualización - MANTENER LOS CARGOS
  //           actualizaciones.push({
  //             id_presupuesto: elemento.id_presupuesto,
  //             item: nuevoItem,
  //             descripcion: elemento.descripcion,
  //             abreviatura: elemento.abreviatura,
  //             formula: elemento.formula || '',
  //             cargos: elemento.cargos || this.getCargosPorDefecto() // Mantener cargos existentes o usar por defecto
  //           });
  //         }
  //       });
  //     }

  //     // 6. Preparar request para backend
  //     const request = {
  //       id_presupuesto: idPresupuestoEliminar,
  //       id_proyecto: this.idProyecto,
  //       id_area: this.areaSeleccionadaPres,
  //       actualizaciones: actualizaciones
  //     };

  //     console.log('Request para backend:', request);

  //     // 7. Enviar al backend
  //     SwalService.confirm(
  //       '¿Está seguro de eliminar este registro?',
  //       'Esta acción eliminará el registro y actualizará ' + actualizaciones.length + ' registros relacionados.'
  //     ).then(async (result) => {
  //       if (result.isConfirmed) {
  //         this.mostrar_carga_todo = true;

  //         try {
  //           const response = await this.recursosHumanosService.eliminarYActualizarPresAnaliticoRH(request);

  //           if (response.success) {
  //             // Eliminar localmente la fila
  //             this.tablaPresAnalitico.splice(this.filPresAna, 1);

  //             // Actualizar items localmente
  //             this.actualizarItemsLocalmente();

  //             // Recalcular fórmulas después de eliminar
  //             this.recalcularTodasFormulas();

  //             SwalService.success(response.message);
  //             this.filPresAna = undefined;
  //           } else {
  //             SwalService.error(response.message || 'Error al eliminar el registro');
  //           }
  //         } catch (error) {
  //           console.error('Error:', error);
  //           SwalService.error('Error al procesar la eliminación');
  //         } finally {
  //           this.mostrar_carga_todo = false;
  //         }
  //       }
  //     });
  //     console.log('this.tablaPresAnalitico', this.tablaPresAnalitico)
  //   } catch (error) {
  //     console.error('Error en eliminación:', error);
  //     SwalService.error('Error al preparar la eliminación');
  //   }
  // }

  async eliminarFila() {
    if (this.filPresAna === undefined || this.filPresAna === null) {
      SwalService.error('No hay fila seleccionada para eliminar');
      return;
    }

    try {
      // 1. Obtener el elemento a eliminar
      const elementoAEliminar = this.tablaPresAnalitico[this.filPresAna];

      if (!elementoAEliminar) {
        SwalService.error('No se encontró el elemento a eliminar');
        return;
      }

      const abreviaturaEliminar = elementoAEliminar.abreviatura;
      const itemEliminar = elementoAEliminar.item;
      const idPresupuestoEliminar = elementoAEliminar.id_presupuesto;

      // 2. Preparar array para actualizaciones
      const actualizaciones: any[] = [];

      // 3. Buscar fórmulas que usen esta abreviatura (y propagar)
      const abreviaturasLimpieza = [abreviaturaEliminar];
      const formulasActualizadas = new Set<string>();
      const maxProfundidad = 10;
      let profundidad = 0;

      while (abreviaturasLimpieza.length > 0 && profundidad < maxProfundidad) {
        profundidad++;
        const abreviaturaActual = abreviaturasLimpieza.shift()!;

        // Buscar fórmulas que contengan esta abreviatura
        this.tablaPresAnalitico.forEach((elemento, index) => {
          if (index === this.filPresAna) return; // Saltar el elemento que se eliminará

          if (elemento.formula && this.formulaContieneAbreviatura(elemento.formula, abreviaturaActual)) {

            // CASO A: Si la abreviatura actual es la del elemento que se ELIMINA
            if (abreviaturaActual === abreviaturaEliminar) {

              // Limpiar la fórmula completamente porque referencia a un elemento eliminado
              actualizaciones.push({
                id_presupuesto: elemento.id_presupuesto,
                item: elemento.item,
                descripcion: elemento.descripcion,
                abreviatura: elemento.abreviatura,
                formula: '', // Fórmula vacía
                cargos: elemento.cargos || this.getCargosPorDefecto()
              });

              formulasActualizadas.add(elemento.abreviatura);

              // Esta fila ahora tiene fórmula vacía, podría afectar a otras
              if (!abreviaturasLimpieza.includes(elemento.abreviatura) &&
                !formulasActualizadas.has(elemento.abreviatura)) {
                abreviaturasLimpieza.push(elemento.abreviatura);
              }
            }
            // CASO B: Si contiene una abreviatura que fue invalidada
            else {

              // Limpiar solo la referencia a la abreviatura inválida
              const nuevaFormula = this.limpiarFormula(elemento.formula, abreviaturaActual);

              // Verificar si la fórmula resultante es válida
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
              this.tablaFiltrada = []
              this.totalMes = 0
              this.cantidadUsuariosDia = []
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
  // Método auxiliar para verificar si una fórmula contiene una abreviatura (con o sin %)
  formulaContieneAbreviatura(formula: string, abreviatura: string): boolean {
    if (!formula || !abreviatura) return false;

    // Crear regex que busque la abreviatura con o sin %, y también con * después del %
    // Patrones a buscar: F2, %F2, %*F2
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

  // // Método para limpiar la fórmula después de eliminar referencias
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

  // Verificar si es una expresión matemática válida
  esExpresionMatematica(expresion: string): boolean {
    if (!expresion) return false;
    // Verificar que solo contenga números, operadores, paréntesis y puntos decimales
    return /^[\d\s+\-*/().]+$/.test(expresion);
  }

  // Simplificar expresión matemática
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

  // Verificar si una fórmula es válida
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

  // Método para obtener cargos por defecto
  getCargosPorDefecto() {
    return this.cargosFiltradosPres.map(cargo => ({
      id_cargo: cargo.id,
      porcentaje: null,
      parcial: 0
    }));
  }

  // Método para actualizar items localmente
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

  private actualizarItemsSecuencialmente(): void {
    this.tablaPresAnalitico.forEach((fila, index) => {
      fila.item = (index + 1).toString();
    });
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
          this.tablaFiltrada = []
          this.totalMes = 0
          this.cantidadUsuariosDia = []
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

  detalleUsuario(row) {
    this.tablaMesUsuario = []

    this.tablaMesUsuario = row.dias.map(ele => {
      // Crear una copia profunda del objeto
      const nuevoElemento = JSON.parse(JSON.stringify(ele));
      const fecha = this.convertirFechadia(ele.fecha)
      nuevoElemento.fecha = fecha;
      nuevoElemento.editado = false;
      return nuevoElemento;
    });
    this.modalDetalleUsuario.show()
  }

  cerrarModalDetalleUsuario() {
    this.modalDetalleUsuario.hide()
  }

  convertirFechadia(fechaStr: string) {

    if (!fechaStr) return null;

    // Si la fecha está en formato DD-MM-YYYY
    if (fechaStr.includes('-')) {
      const partes = fechaStr.split('-');
      if (partes.length === 3) {
        // Convertir DD-MM-YYYY a YYYY-MM-DD
        const dia = parseInt(partes[0], 10);
        return dia
      }
    }

    // Si ya está en formato válido o ISO
    return new Date(fechaStr);
  }

  convertirFecha(fechaStr: string): string {
    // Convierte "31-12-2025" a "2025-12-31"
    if (!fechaStr) return '';


    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      const dia = parts[0];
      const mes = parts[1];
      const anio = parts[2];

      // Validar que sea una fecha válida
      if (dia && mes && anio) {
        const fechaFormateada = `${anio}-${mes}-${dia}`;
        return fechaFormateada;
      }
    }

    console.warn('Formato de fecha no reconocido:', fechaStr);
    return fechaStr;
  }

  blurModal(value, key, i) {

    if (value !== this.tablaMesUsuario[i][key]) {
      this.tablaMesUsuario[i].editado = true
      this.tablaMesUsuario[i][key] = value
    }

  }

  // async guardarLoteUsuarioExtras() {
  //   try {

  //     const filtrados = [];
  //     const indicesFiltrados = [];
  //     const indicesTablaMes = []; // Guardar índices en tablaMesUsuario

  //     // Obtener elementos editados
  //     this.tablaMesUsuario.forEach((ele, index) => {
  //       if (ele.editado) {
  //         filtrados.push(ele);
  //         indicesFiltrados.push(index);
  //         indicesTablaMes.push(index);
  //       }
  //     });

  //     if (!filtrados.length) {
  //       this.toaster.error('Ningún cambio registrado', '', {
  //         closeButton: false,
  //         positionClass: 'toast-bottom-right',
  //         timeOut: 4000,
  //       });
  //       return;
  //     }

  //     this.mostrar_carga_todo = true;
  //     let elementosGuardar = [];

  //     // IMPORTANTE: Guardar información de referencia
  //     const referencias = []; // Para poder actualizar después

  //     const convertirFechaMySQL = (fechaStr: string) => {
  //       if (!fechaStr) return null;
  //       return fechaStr.replace('T', ' ');
  //     };

  //     for (let j = 0; j < filtrados.length; j++) {
  //       const row = filtrados[j];
  //       const indTablaMes = indicesTablaMes[j];

  //       // Obtener fecha del usuario seleccionado
  //       const fechaOriginal = this.usuarioSeleccionado.dias[indTablaMes]?.fecha;
  //       const fechaFormateada = this.convertirFecha(fechaOriginal);

  //       const obj = {
  //         id_control: row.id_control || null,
  //         id_proyecto: this.idProyecto,
  //         id_usuario: this.usuarioSeleccionado.id_usuario,
  //         id_area: this.usuarioSeleccionado.id_area,
  //         id_cargo: this.usuarioSeleccionado.id_cargo,
  //         id_asignacion: this.usuarioSeleccionado.id_asignacion,
  //         fecha: fechaFormateada,
  //         tipo: row.tipo,
  //         fuente: 2,
  //         asistencia_1: row.asistencia1 ? convertirFechaMySQL(row.asistencia1) : null,
  //         asistencia_2: row.asistencia2 ? convertirFechaMySQL(row.asistencia2) : null,
  //         asistencia_3: row.asistencia3 ? convertirFechaMySQL(row.asistencia3) : null,
  //         asistencia_4: row.asistencia4 ? convertirFechaMySQL(row.asistencia4) : null,
  //         horas_extra: row.horas_extra || 0,
  //         monto_extra: row.monto_extra || 0
  //       };

  //       elementosGuardar.push(obj);

  //       // Guardar referencia para poder actualizar después
  //       referencias.push({
  //         id_usuario: this.usuarioSeleccionado.id_usuario,
  //         fecha: fechaFormateada,
  //         fechaOriginal: fechaOriginal,
  //         indiceTablaMes: indTablaMes,
  //         indiceEnvio: j
  //       });
  //     }

  //     console.log('referencias', referencias)
  //     const resp = await this.recursosHumanosService.guardarLoteRegistroAsistenciaRH(elementosGuardar);
  //     console.log('resp', resp)
  //     if (resp && resp.success && resp.data) {

  //       // Actualizar this.tablaFiltrada
  //       this.actualizarTablaFiltrada(resp.data, referencias);

  //       this.toaster.success(
  //         `${resp.data.length} registros guardados correctamente`,
  //         'Éxito',
  //         {
  //           closeButton: false,
  //           positionClass: 'toast-bottom-right',
  //           timeOut: 4000,
  //         }
  //       );

  //       // Cerrar modal si está abierto
  //       if (this.modalDetalleUsuario) {
  //         this.modalDetalleUsuario.hide();
  //       }
  //     }

  //     this.mostrar_carga_todo = false;
  //   } catch (error) {
  //     this.mostrar_carga_todo = false;
  //     console.error('Error al guardar:', error);
  //     this.toaster.error('Error al guardar los registros', '', {
  //       closeButton: false,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 4000,
  //     });
  //   }
  // }

  // Método para actualizar tablaFiltrada CORREGIDO
  actualizarTablaFiltrada(datosBackend: any[], referencias: any[]) {

    // Encontrar la fila del usuario en tablaFiltrada
    const usuarioId = this.usuarioSeleccionado.id_usuario;
    const areaId = this.usuarioSeleccionado.id_area;
    const cargoId = this.usuarioSeleccionado.id_cargo;
    const asignacionId = this.usuarioSeleccionado.id_asignacion;

    // Buscar la fila correspondiente en tablaFiltrada
    const filaUsuario = this.tablaFiltrada.find(fila =>
      fila.id_usuario === usuarioId &&
      fila.id_area === areaId &&
      fila.id_cargo === cargoId &&
      fila.id_asignacion === asignacionId
    );

    if (!filaUsuario) {
      console.error('No se encontró la fila del usuario en tablaFiltrada');
      return;
    }


    // Actualizar cada día en la fila
    datosBackend.forEach((respuesta, index) => {

      // Verificar que tenemos datos
      if (!respuesta.datos || !Array.isArray(respuesta.datos) || respuesta.datos.length === 0) {
        return;
      }

      // ¡IMPORTANTE! datos es un array, tomar el primer elemento
      const datos = respuesta.datos[0];

      const ref = referencias[index];
      if (!ref) {
        return;
      }

      const fechaOriginal = ref.fechaOriginal;

      // Buscar el día en la fila
      const diaIndex = filaUsuario.dias.findIndex(dia =>
        dia && dia.fecha === fechaOriginal
      );

      if (diaIndex !== -1) {

        // Actualizar el día
        const dia = filaUsuario.dias[diaIndex];

        // Actualizar campos principales
        dia.id_control = datos.id_control;
        dia.tipo = datos.tipo || '';
        dia.horas_extra = datos.horas_extra || 0;
        dia.monto_extra = datos.monto_extra || 0;
        dia.fecha_registro = datos.fecha_registro;
        dia.id_proyecto = datos.id_proyecto;
        dia.id_usuario = datos.id_usuario;
        dia.id_asignacion = datos.id_asignacion;

        // Actualizar asistencias si existen
        if (datos.asistencia_1) {
          dia.asistencia1 = this.formatFechaFromBackend(datos.asistencia_1);
        }
        if (datos.asistencia_2) {
          dia.asistencia2 = this.formatFechaFromBackend(datos.asistencia_2);
        }
        if (datos.asistencia_3) {
          dia.asistencia3 = this.formatFechaFromBackend(datos.asistencia_3);
        }
        if (datos.asistencia_4) {
          dia.asistencia4 = this.formatFechaFromBackend(datos.asistencia_4);
        }

        // Actualizar tipoDescripcion
        dia.tipoDescripcion = this.getTipoDescripcion(datos.tipo || '');

        // Recalcular monto si es necesario
        if (dia.costedia) {
          dia.monto = this.calcularMonto(datos.tipo || '', dia.costedia);
          dia.descuento = this.calcularDescuento(datos.tipo || '', dia.costedia);
        }


        // Forzar actualización de la vista (si usas Angular)
        this.tablaFiltrada = [...this.tablaFiltrada];

      } else {
        console.warn(`❌ No se encontró fecha ${fechaOriginal} en la fila del usuario`);
      }
    });

    // Recalcular totales
    this.recalcularTotalesFila(filaUsuario);
  }

  // Método auxiliar para tipoDescripcion
  getTipoDescripcion(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'T': 'TARDANZA',
      'IN': 'INCOMPLETO',
      'F': 'FALTA',
      '': 'NORMAL'
    };
    return tipos[tipo] || tipo;
  }

  // Formato de fecha mejorado
  formatFechaFromBackend(fechaStr: string): string {
    if (!fechaStr) return null;

    // Si ya tiene formato ISO (con T), dejarlo igual
    if (fechaStr.includes('T')) {
      return fechaStr;
    }

    // Convertir "2025-12-31 00:00:00" a "2025-12-31T00:00:00"
    return fechaStr.replace(' ', 'T');
  }

  calcularMonto(tipo: string, costeDia: number): number {
    // Lógica de cálculo basada en el tipo
    if (tipo === 'T') return costeDia * 0.98; // 2% descuento por tardanza
    if (tipo === 'IN') return costeDia * 0.5; // 50% por incompleto
    if (tipo === 'F') return 0; // Falta total
    return costeDia; // Normal
  }

  calcularDescuento(tipo: string, costeDia: number): string {
    if (tipo === 'T') return '2';
    if (tipo === 'IN') return '50';
    if (tipo === 'F') return '100';
    return '0';
  }

  recalcularTotalesFila(fila: any) {
    // Recalcular coste_mensual sumando todos los montos
    if (fila.dias && fila.dias.length > 0) {
      let totalMensual = 0;
      fila.dias.forEach(dia => {
        if (dia && dia.monto) {
          totalMensual += dia.monto;
        }
      });
      fila.coste_mensual = totalMensual;
    }
  }


  async procesarRegistrosAsistencia(
    elementos: any[],
    fuente: number,
    mensajeExito: string = 'Registros guardados correctamente'
  ): Promise<boolean> {
    try {
      if (!elementos.length) {
        this.toaster.error('Ningún cambio registrado', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return false;
      }

      this.mostrar_carga_todo = true;

      // Preparar elementos para enviar
      const elementosGuardar = elementos.map(elemento => ({
        ...elemento,
        fuente: fuente // Diferenciar fuente (1 para cambiarColumna, 2 para guardarLoteUsuarioExtras)
      }));


      const resp = await this.recursosHumanosService.guardarLoteRegistroAsistenciaRH(elementosGuardar);

      if (resp && resp.success && resp.data) {
        // Actualizar tablaFiltrada con la respuesta
        this.actualizarTablaFiltradaConRespuesta(resp.data, elementos);

        this.toaster.success(
          `${resp.data.length} ${mensajeExito}`,
          'Éxito',
          {
            closeButton: false,
            positionClass: 'toast-bottom-right',
            timeOut: 4000,
          }
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error al procesar registros:', error);
      this.toaster.error('Error al guardar los registros', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
      return false;
    } finally {
      this.mostrar_carga_todo = false;
    }
  }

  // Método mejorado para actualizar tablaFiltrada
  actualizarTablaFiltradaConRespuesta(datosBackend: any[], elementosOriginales: any[]) {
    // Crear un mapa para acceso rápido por usuario+fecha
    const mapaActualizaciones = new Map();

    datosBackend.forEach((respuesta, index) => {
      if (!respuesta.datos || !Array.isArray(respuesta.datos) || respuesta.datos.length === 0) {
        return;
      }

      const datos = respuesta.datos[0];
      const elementoOriginal = elementosOriginales[index];

      if (datos && elementoOriginal) {
        const clave = `${elementoOriginal.id_usuario}_${elementoOriginal.fecha}`;
        mapaActualizaciones.set(clave, {
          datos,
          elementoOriginal
        });
      }
    });

    // Actualizar todas las filas afectadas
    this.tablaFiltrada.forEach(fila => {
      if (!fila.id_usuario) return;

      fila.dias.forEach((dia, diaIndex) => {
        if (!dia || !dia.fecha) return;

        const clave = `${fila.id_usuario}_${this.convertirFecha(dia.fecha)}`;
        const actualizacion = mapaActualizaciones.get(clave);

        if (actualizacion) {
          this.actualizarDia(dia, actualizacion.datos);
        }
      });

      // Recalcular totales de la fila
      this.recalcularTotalesFila(fila);

    });

    // Forzar actualización de la vista
    this.tablaFiltrada = [...this.tablaFiltrada];

  }

  // Método auxiliar para actualizar un día específico
  actualizarDia(dia: any, datosBackend: any) {
    // Actualizar campos principales
    dia.id_control = datosBackend.id_control;
    dia.tipo = datosBackend.tipo || '';
    dia.horas_extra = datosBackend.horas_extra || 0;
    dia.monto_extra = datosBackend.monto_extra || 0;
    dia.fecha_registro = datosBackend.fecha_registro;
    dia.id_proyecto = datosBackend.id_proyecto;
    dia.id_usuario = datosBackend.id_usuario;
    dia.id_asignacion = datosBackend.id_asignacion;
    dia.fuente = datosBackend.fuente
    // Actualizar asistencias
    if (datosBackend.asistencia_1) {
      dia.asistencia1 = this.formatFechaFromBackend(datosBackend.asistencia_1);
    }
    if (datosBackend.asistencia_2) {
      dia.asistencia2 = this.formatFechaFromBackend(datosBackend.asistencia_2);
    }
    if (datosBackend.asistencia_3) {
      dia.asistencia3 = this.formatFechaFromBackend(datosBackend.asistencia_3);
    }
    if (datosBackend.asistencia_4) {
      dia.asistencia4 = this.formatFechaFromBackend(datosBackend.asistencia_4);
    }

    // Actualizar tipoDescripcion
    dia.tipoDescripcion = this.getTipoDescripcion(datosBackend.tipo || '');

    // Recalcular monto si es necesario
    if (dia.costedia) {
      dia.monto = this.calcularMonto(datosBackend.tipo || '', dia.costedia);
      dia.descuento = this.calcularDescuento(datosBackend.tipo || '', dia.costedia);
    }
  }

  async cambiarColumna(value: string, k: number, selectElement: HTMLSelectElement) {
    try {
      const sw = await SwalService.confirm(
        '¿Está seguro?',
        `Se actualizarán todos los usuarios con el estado ${value} en el día seleccionado`
      );

      if (!sw.isConfirmed) {
        setTimeout(() => {
          selectElement.value = '';
        }, 0);
        return;
      }

      const elementos = [];
      const referencias = [];

      // Recorrer tablaFiltrada para obtener todos los usuarios
      this.tablaFiltrada.forEach(element => {
        if (element.id_usuario && element.dias[k]) {
          const dia = element.dias[k];
          const fechaOriginal = dia.fecha;
          const fechaFormateada = this.convertirFecha(fechaOriginal);

          elementos.push({
            id_control: dia.id_control || null,
            id_proyecto: this.idProyecto,
            id_usuario: element.id_usuario,
            id_area: element.id_area,
            id_cargo: element.id_cargo,
            id_asignacion: element.id_asignacion,
            fecha: fechaFormateada,
            tipo: value,
            fuente: 1,
            asistencia_1: dia.asistencia1 ? this.convertirFechaMySQL(dia.asistencia1) : null,
            asistencia_2: dia.asistencia2 ? this.convertirFechaMySQL(dia.asistencia2) : null,
            asistencia_3: dia.asistencia3 ? this.convertirFechaMySQL(dia.asistencia3) : null,
            asistencia_4: dia.asistencia4 ? this.convertirFechaMySQL(dia.asistencia4) : null,
            horas_extra: dia.horas_extra || 0,
            monto_extra: dia.monto_extra || 0
          });

          referencias.push({
            id_usuario: element.id_usuario,
            fecha: fechaFormateada,
            fechaOriginal: fechaOriginal
          });
        }
      });

      if (elementos.length === 0) {
        this.toaster.error('No hay usuarios para actualizar', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        setTimeout(() => {
          selectElement.value = '';
        }, 0);
        return;
      }

      const success = await this.procesarRegistrosAsistencia(
        elementos,
        1,
        'registros actualizados correctamente'
      );

      if (success) {
        // También actualizar tablaMesUsuario si está abierta
        if (this.tablaMesUsuario && this.tablaMesUsuario.length > 0) {
          this.tablaMesUsuario.forEach(dia => {
            dia.editado = false;
          });
        }
        this.recalcularTotales()
      }

      // Resetear el select
      setTimeout(() => {
        selectElement.value = '';
      }, 0);

    } catch (error) {
      console.error('Error en cambiarColumna:', error);
      SwalService.error();

      // Resetear el select incluso en error
      setTimeout(() => {
        if (selectElement) {
          selectElement.value = '';
        }
      }, 0);
    }
  }

  async guardarLoteUsuarioExtras() {
    try {
      const filtrados = [];
      const referencias = [];

      // Obtener elementos editados
      this.tablaMesUsuario.forEach((ele, index) => {
        if (ele.editado) {
          filtrados.push(ele);

          const fechaOriginal = this.usuarioSeleccionado.dias[index]?.fecha;
          const fechaFormateada = this.convertirFecha(fechaOriginal);

          referencias.push({
            id_usuario: this.usuarioSeleccionado.id_usuario,
            fecha: fechaFormateada,
            fechaOriginal: fechaOriginal,
            indiceTablaMes: index
          });
        }
      });

      if (filtrados.length === 0) {
        this.toaster.error('Ningún cambio registrado', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
        return;
      }

      const elementos = [];

      for (let j = 0; j < filtrados.length; j++) {
        const row = filtrados[j];
        const ref = referencias[j];

        const obj = {
          id_control: row.id_control || null,
          id_proyecto: this.idProyecto,
          id_usuario: this.usuarioSeleccionado.id_usuario,
          id_area: this.usuarioSeleccionado.id_area,
          id_cargo: this.usuarioSeleccionado.id_cargo,
          id_asignacion: this.usuarioSeleccionado.id_asignacion,
          fecha: ref.fecha,
          tipo: row.tipo,
          fuente: 2,
          asistencia_1: row.asistencia1 ? this.convertirFechaMySQL(row.asistencia1) : null,
          asistencia_2: row.asistencia2 ? this.convertirFechaMySQL(row.asistencia2) : null,
          asistencia_3: row.asistencia3 ? this.convertirFechaMySQL(row.asistencia3) : null,
          asistencia_4: row.asistencia4 ? this.convertirFechaMySQL(row.asistencia4) : null,
          horas_extra: row.horas_extra || 0,
          monto_extra: row.monto_extra || 0
        };

        elementos.push(obj);
      }

      const success = await this.procesarRegistrosAsistencia(
        elementos,
        2,
        'registros guardados correctamente'
      );

      if (success) {
        // Limpiar tablaMesUsuario
        this.recalcularTotales()
        this.tablaMesUsuario.forEach(dia => {
          dia.editado = false;
        });

        // Cerrar modal si está abierto
        if (this.modalDetalleUsuario) {
          this.modalDetalleUsuario.hide();
        }

      }

    } catch (error) {
      console.error('Error en guardarLoteUsuarioExtras:', error);
      this.toaster.error('Error al guardar los registros', '', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    }
  }

  convertirFechaMySQL(fechaStr: string): string {
    if (!fechaStr) return null;
    return fechaStr.replace('T', ' ');
  }

  async listarMontosAreaPresAnaliticoRH() {
    let montos = []
    const obj = {
      id_proyecto: this.idProyecto
    }
    const resp = await this.recursosHumanosService.listarMontosAreaPresAnaliticoRH(obj)
    if (resp.length) {
      const toNumberOrNull = (value: string): number | null => {
        if (!value || value.trim() === '') {
          return null;
        }
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };
      for (const element of resp) {
        const cargos = [];

        // Verificar que element.cargos sea un string válido
        if (element.cargos && typeof element.cargos === 'string') {
          // Dividir por | para obtener cada cargo
          const cargosStrings = element.cargos.split('|');

          for (const cargoStr of cargosStrings) {
            // Dividir cada cargo por //
            const partes = cargoStr.split('/');

            // Crear objeto cargo con los índices correctos
            const cargo = {
              id_cargo: toNumberOrNull(partes[0]),
              porcentaje: toNumberOrNull(partes[1]),
              parcial: toNumberOrNull(partes[2])
            };

            // Solo agregar si tiene id_cargo
            if (cargo.id_cargo !== null) {
              cargos.push(cargo);
            }
          }
        }

        const data = {
          id_area: element.id_area,
          cargos: cargos,
          tipo: element.descripcion,
          horas_dia: element.formula
        };

        montos.push(data);
      }
    }
    return montos
  }
}


