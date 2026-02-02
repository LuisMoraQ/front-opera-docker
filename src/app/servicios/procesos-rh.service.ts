

import { Injectable } from '@angular/core';
import { RecursosHumanosService } from './recursoshumanos.service';
import * as moment from 'moment';

interface ConsolidadoPorMes {
  mes_key: string;
  mes: string;
  anio: number;
  items: ConsolidadoItem[];
  costo_total_mes: number;
  totales_mes?: TotalesMes[];
}

interface ConsolidadoItem {
  id_area: number;
  descripcion_area: string;
  id_cargo: number | null;
  descripcion_cargo: string;
  tipo_cargo: string;
  cantidad: number;
  asignaciones: any[];
  calendario: CalendarioDia[];
  costo_total: number;
  es_cabecera_area?: boolean;
  es_total_area?: boolean;
  es_total_dia?: boolean;
}

interface CalendarioDia {
  fecha: string;
  dia: string;
  laborable: boolean;
  feriado: boolean;
  esDiaEspecial: boolean;
  monto_dia: number;
  cantidad_asignaciones: number;
  detalle_asistencias: AsistenciaDetalle[];
}

interface AsistenciaDetalle {
  id_asignacion: number;
  id_usuario: number;
  tipo_asistencia: string;
  descuento_aplicado: number;
  monto_individual: number;
}

interface TotalesMes {
  mes_key: string;
  totales_dia: { [fecha: string]: { cantidad_asignaciones: number; monto_dia: number } };
  total_mes: { cantidad_asignaciones: number; monto_mes: number };
}

@Injectable({
  providedIn: 'root'
})
export class ProcesosRhService {
  abreviaturas: Record<string, string> = {
    Lunes: "Lu",
    Martes: "Ma",
    Miércoles: "Mi",
    Jueves: "Ju",
    Viernes: "Vi",
    Sábado: "Sa",
    Domingo: "Do"
  };

  constructor(private recursosHumanosService: RecursosHumanosService) { }

  async calendarioXAsignaciones(idProyecto: number): Promise<any> {
    const [
      [areas, cargos],
      respAsignaciones,
      montosAreas
    ] = await Promise.all([
      this.recursosHumanosService.listarCargosPorArea({ id_proyecto: idProyecto }),
      this.recursosHumanosService.listarAsignacionesProyecto({ id_proyecto: idProyecto }),
      this.listarMontosAreaPresAnaliticoRH(idProyecto)
    ]);

    const { calendario: calendarioRaw, asignaciones, fecha_maxima, fecha_minima } = respAsignaciones;
    const calendario = this.agruparPorAnioMes(calendarioRaw, this.abreviaturas, []);

    const [asistencias, [configuraciones, feriados]] = await Promise.all([
      this.recursosHumanosService.listarRegistrosAsistencia({
        id_proyecto: idProyecto,
        fecha_inicio: fecha_minima,
        fecha_fin: fecha_maxima
      }),
      this.recursosHumanosService.listarHorarioYFeriadosArea({
        id_proyecto: idProyecto,
        id_area: 0
      })
    ]);

    const asistenciasMap = this.crearMapaAsistenciasPorUsuario(asistencias);
    const configuracionesMap = this.crearMapaConfiguraciones(configuraciones);
    const montosAreasMap = this.crearMapaMontosPorArea(montosAreas);

    const consolidadoGeneral = this.procesarAreasYAsignaciones(
      areas,
      cargos,
      asignaciones,
      calendario,
      asistenciasMap,
      configuracionesMap,
      montosAreasMap,
      feriados
    );

    // Agregar cabeceras y totales de área
    const consolidadoConCabeceras = this.agregarCabecerasYTotalArea(consolidadoGeneral);

    // Agrupar por meses con la nueva estructura
    const consolidadoPorMeses = this.agruparConsolidadoPorMesesConTotales(consolidadoConCabeceras, calendario);

    // Obtener totales globales por día y mes
    const totalesGlobales = this.calcularTotalesGlobales(consolidadoPorMeses);

    return {
      consolidadoPorMeses,
      calendario,
      areas,
      cargos,
      totales_globales: totalesGlobales // Nuevo objeto con totales
    };
  }

  private agregarCabecerasYTotalArea(consolidadoGeneral: ConsolidadoItem[]): ConsolidadoItem[] {
    const resultado: ConsolidadoItem[] = [];

    // Agrupar items por área
    const itemsPorArea = new Map<number, ConsolidadoItem[]>();

    consolidadoGeneral.forEach(item => {
      if (!itemsPorArea.has(item.id_area)) {
        itemsPorArea.set(item.id_area, []);
      }
      itemsPorArea.get(item.id_area)!.push(item);
    });

    // Para cada área, agregar cabecera y luego los items
    itemsPorArea.forEach((itemsArea, idArea) => {
      if (itemsArea.length === 0) return;

      const primeraArea = itemsArea[0];

      // 1. Agregar cabecera del área (solo descripción, resto vacío)
      const cabeceraArea: ConsolidadoItem = {
        id_area: primeraArea.id_area,
        descripcion_area: primeraArea.descripcion_area,
        id_cargo: null,
        descripcion_cargo: '',
        tipo_cargo: '',
        cantidad: 0,
        asignaciones: [],
        calendario: [], // Vacío para cabecera
        costo_total: 0,
        es_cabecera_area: true
      };
      resultado.push(cabeceraArea);

      // 2. Agregar todos los items del área
      resultado.push(...itemsArea);

      // 3. Calcular y agregar total del área (con el nombre del área)
      const totalArea = this.calcularTotalArea(itemsArea);
      resultado.push(totalArea);
    });

    return resultado;
  }

  private calcularTotalArea(itemsArea: ConsolidadoItem[]): ConsolidadoItem {
    if (itemsArea.length === 0) {
      throw new Error('No hay items para calcular el total del área');
    }

    const primeraArea = itemsArea[0];

    // Crear un mapa para acumular por fecha
    const acumuladoPorFecha = new Map<string, {
      monto_dia: number;
      cantidad_asignaciones: number;
      dia: string;
      laborable: boolean;
      feriado: boolean;
      esDiaEspecial: boolean;
      detalle_asistencias: AsistenciaDetalle[];
    }>();

    // Procesar todos los items del área para acumular por fecha
    itemsArea.forEach(item => {
      item.calendario.forEach(dia => {
        const fecha = dia.fecha;

        if (!acumuladoPorFecha.has(fecha)) {
          acumuladoPorFecha.set(fecha, {
            monto_dia: 0,
            cantidad_asignaciones: 0,
            dia: dia.dia,
            laborable: dia.laborable,
            feriado: dia.feriado,
            esDiaEspecial: dia.esDiaEspecial,
            detalle_asistencias: [] // No necesitamos detalle en el total
          });
        }

        const acumulado = acumuladoPorFecha.get(fecha)!;
        acumulado.monto_dia += dia.monto_dia;
        acumulado.cantidad_asignaciones += dia.cantidad_asignaciones;
      });
    });

    // Convertir el mapa a array de CalendarioDia
    const calendarioTotal: CalendarioDia[] = Array.from(acumuladoPorFecha.entries()).map(([fecha, data]) => ({
      fecha,
      dia: data.dia,
      laborable: data.laborable,
      feriado: data.feriado,
      esDiaEspecial: data.esDiaEspecial,
      monto_dia: data.monto_dia,
      cantidad_asignaciones: data.cantidad_asignaciones,
      detalle_asistencias: []
    }));

    // Calcular costo total
    const costoTotal = calendarioTotal.reduce((sum, dia) => sum + dia.monto_dia, 0);

    // Calcular cantidad total de asignaciones (suma de todas las asignaciones de todos los cargos)
    const cantidadTotal = itemsArea.reduce((sum, item) => sum + item.cantidad, 0);

    return {
      id_area: primeraArea.id_area,
      descripcion_area: null, 
      id_cargo: null,
      descripcion_cargo: 'TOTAL',
      tipo_cargo: '',
      cantidad: cantidadTotal,
      asignaciones: [],
      calendario: calendarioTotal,
      costo_total: costoTotal,
      es_total_area: true
    };
  }

  private agruparConsolidadoPorMesesConTotales(
    consolidadoConCabeceras: ConsolidadoItem[],
    calendario: any[]
  ): ConsolidadoPorMes[] {
    const mesesMap = new Map<string, ConsolidadoPorMes>();

    // Primero, crear todos los meses del calendario
    for (const anio of calendario) {
      if (!anio || !anio.meses) continue;

      for (const mes of anio.meses) {
        if (!mes) continue;

        const mesKey = `${mes.mes.toUpperCase()}-${anio.anio}`;
        if (!mesesMap.has(mesKey)) {
          mesesMap.set(mesKey, {
            mes_key: mesKey,
            mes: mes.mes,
            anio: anio.anio,
            items: [],
            costo_total_mes: 0
          });
        }
      }
    }

    // Para cada item del consolidado (incluyendo cabeceras y totales)
    for (const item of consolidadoConCabeceras) {
      if (!item || !item.calendario) continue;

      // Agrupar días por mes
      const diasPorMes = new Map<string, CalendarioDia[]>();
      const costoPorMes = new Map<string, number>();

      for (const dia of item.calendario) {
        if (!dia || !dia.fecha) continue;

        const fechaMoment = moment(dia.fecha, 'DD-MM-YYYY');
        const mesKey = `${fechaMoment.format('MMMM').toUpperCase()}-${fechaMoment.year()}`;

        if (!diasPorMes.has(mesKey)) {
          diasPorMes.set(mesKey, []);
          costoPorMes.set(mesKey, 0);
        }

        diasPorMes.get(mesKey)!.push(dia);
        costoPorMes.set(mesKey, (costoPorMes.get(mesKey) || 0) + dia.monto_dia);
      }

      // Crear items por mes
      for (const [mesKey, diasMes] of diasPorMes) {
        const mesConsolidado = mesesMap.get(mesKey);
        if (mesConsolidado) {
          const itemParaMes: ConsolidadoItem = {
            ...item,
            calendario: diasMes,
            costo_total: costoPorMes.get(mesKey) || 0
          };

          mesConsolidado.items.push(itemParaMes);

          // Solo sumar al costo total del mes si no es cabecera (las cabeceras tienen costo 0)
          if (!item.es_cabecera_area) {
            mesConsolidado.costo_total_mes += itemParaMes.costo_total;
          }
        }
      }
    }

    // Ordenar los meses
    return Array.from(mesesMap.values())
      .sort((a, b) => {
        if (a.anio !== b.anio) return a.anio - b.anio;
        const mesesNumeros: { [key: string]: number } = {
          'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
          'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
        };
        const mesNumA = mesesNumeros[a.mes.toLowerCase()] || 0;
        const mesNumB = mesesNumeros[b.mes.toLowerCase()] || 0;
        return mesNumA - mesNumB;
      });
  }

  private calcularTotalesGlobales(consolidadoPorMeses: ConsolidadoPorMes[]): {
    totales_por_mes: TotalesMes[];
    totales_por_dia: { [fecha: string]: { cantidad_asignaciones: number; monto_dia: number } };
    total_general: { cantidad_asignaciones: number; monto_total: number };
  } {
    const totalesPorMes: TotalesMes[] = [];
    const totalesPorDiaMap = new Map<string, { cantidad_asignaciones: number; monto_dia: number }>();
    let totalCantidadGeneral = 0;
    let totalMontoGeneral = 0;

    // Procesar cada mes
    consolidadoPorMeses.forEach(mes => {
      const totalesDiaMes: { [fecha: string]: { cantidad_asignaciones: number; monto_dia: number } } = {};
      let cantidadTotalMes = 0;
      let montoTotalMes = 0;

      // Solo procesar los items que son totales de área (es_total_area === true)
      const itemsTotalesArea = mes.items.filter(item => item.es_total_area);

      itemsTotalesArea.forEach(item => {
        // Sumar al total general del mes
        cantidadTotalMes += item.cantidad;
        montoTotalMes += item.costo_total;

        // Acumular por día
        item.calendario.forEach(dia => {
          const fecha = dia.fecha;

          // Acumular en el mapa global de días
          if (!totalesPorDiaMap.has(fecha)) {
            totalesPorDiaMap.set(fecha, { cantidad_asignaciones: 0, monto_dia: 0 });
          }

          const totalDia = totalesPorDiaMap.get(fecha)!;
          totalDia.cantidad_asignaciones += dia.cantidad_asignaciones;
          totalDia.monto_dia += dia.monto_dia;

          // Acumular en el mapa del mes
          if (!totalesDiaMes[fecha]) {
            totalesDiaMes[fecha] = { cantidad_asignaciones: 0, monto_dia: 0 };
          }
          totalesDiaMes[fecha].cantidad_asignaciones += dia.cantidad_asignaciones;
          totalesDiaMes[fecha].monto_dia += dia.monto_dia;
        });
      });

      // Agregar totales del mes
      totalesPorMes.push({
        mes_key: mes.mes_key,
        totales_dia: totalesDiaMes,
        total_mes: {
          cantidad_asignaciones: cantidadTotalMes,
          monto_mes: montoTotalMes
        }
      });

      // Acumular en totales generales
      totalCantidadGeneral += cantidadTotalMes;
      totalMontoGeneral += montoTotalMes;
    });

    // Convertir el mapa de días a objeto
    const totalesPorDia: { [fecha: string]: { cantidad_asignaciones: number; monto_dia: number } } = {};
    totalesPorDiaMap.forEach((value, key) => {
      totalesPorDia[key] = value;
    });

    return {
      totales_por_mes: totalesPorMes,
      totales_por_dia: totalesPorDia,
      total_general: {
        cantidad_asignaciones: totalCantidadGeneral,
        monto_total: totalMontoGeneral
      }
    };
  }

  // Los demás métodos se mantienen igual...
  private crearMapaAsistenciasPorUsuario(asistencias: any[]): Map<string, Map<number, any>> {
    const mapa = new Map<string, Map<number, any>>();
    if (!asistencias || !Array.isArray(asistencias)) {
      return mapa;
    }

    asistencias.forEach(asistencia => {
      if (asistencia && asistencia.fecha && asistencia.id_usuario) {
        const fechaFormateada = moment(asistencia.fecha).format('DD-MM-YYYY');

        if (!mapa.has(fechaFormateada)) {
          mapa.set(fechaFormateada, new Map<number, any>());
        }

        const mapaUsuarios = mapa.get(fechaFormateada)!;
        mapaUsuarios.set(asistencia.id_usuario, asistencia);
      }
    });

    return mapa;
  }

  private crearMapaConfiguraciones(configuraciones: any[]): Map<number, any> {
    if (!configuraciones || !Array.isArray(configuraciones)) {
      return new Map();
    }

    const entries: [number, any][] = configuraciones
      .filter(config => config && config.id_area !== undefined && config.id_area !== null)
      .map(config => [config.id_area, config] as [number, any]);

    return new Map(entries);
  }

  private crearMapaMontosPorArea(montosAreas: any[]): Map<number, Map<string, Map<number, number>>> {
    const mapa = new Map<number, Map<string, Map<number, number>>>();

    if (!montosAreas || !Array.isArray(montosAreas)) {
      return mapa;
    }

    montosAreas.forEach(areaMonto => {
      if (!areaMonto || !areaMonto.id_area) return;

      if (!mapa.has(areaMonto.id_area)) {
        mapa.set(areaMonto.id_area, new Map());
      }

      const areaMap = mapa.get(areaMonto.id_area)!;
      if (areaMonto.tipo) {
        areaMap.set(areaMonto.tipo, new Map());

        if (areaMonto.cargos && Array.isArray(areaMonto.cargos)) {
          areaMonto.cargos.forEach((cargo: any) => {
            if (cargo && cargo.id_cargo !== undefined) {
              areaMap.get(areaMonto.tipo)!.set(cargo.id_cargo, cargo.parcial || 0);
            }
          });
        }
      }
    });

    return mapa;
  }

  private procesarAreasYAsignaciones(
    areas: any[],
    cargos: any[],
    asignaciones: any[],
    calendario: any[],
    asistenciasMap: Map<string, Map<number, any>>,
    configuracionesMap: Map<number, any>,
    montosAreasMap: Map<number, Map<string, Map<number, number>>>,
    feriados: any[]
  ): ConsolidadoItem[] {
    const cargosPorArea = this.agruparCargosPorArea(cargos);
    const asignacionesPorCargo = this.agruparAsignacionesPorCargo(asignaciones);
    const consolidadoMap = new Map<string, ConsolidadoItem>();

    for (const area of areas) {
      if (!area) continue;

      const horarioConfArea = configuracionesMap.get(area.id_area);
      const areaMontosMap = montosAreasMap.get(area.id_area);
      const cargosArea = cargosPorArea.get(area.id_area) || [];

      for (const cargo of cargosArea) {
        if (!cargo) continue;

        const asignacionesCargo = asignacionesPorCargo.get(cargo.id_cargo) || [];
        const asignacionesPorTipo = new Map<string, any[]>();

        asignacionesCargo.forEach(asignacion => {
          if (!asignacion) return;
          const key = asignacion.tipo_cargo || '';
          if (!asignacionesPorTipo.has(key)) {
            asignacionesPorTipo.set(key, []);
          }
          asignacionesPorTipo.get(key)!.push(asignacion);
        });

        for (const [tipoCargo, asignacionesGrupo] of asignacionesPorTipo) {
          const key = `${area.id_area}_${cargo.id_cargo}_${tipoCargo}`;

          let costoDia = 0;
          if (areaMontosMap && tipoCargo) {
            for (const [tipo, cargosMap] of areaMontosMap) {
              if (tipo && tipo.endsWith(tipoCargo)) {
                costoDia = cargosMap.get(cargo.id_cargo) || 0;
                break;
              }
            }
          }

          const feriadosSoloFecha = feriados.filter(ele => {
            if (!ele || !ele.areas) return false;
            const areas = ele.areas?.split('|');
            return areas && areas.includes(area.id_area.toString());
          }).map(ele => ele.fecha?.split('T')[0]).filter(Boolean);

          const { calendarioProcesado, costoTotal } = this.procesarDiasCalendarioGrupo(
            calendario,
            asistenciasMap,
            costoDia,
            horarioConfArea,
            feriadosSoloFecha,
            asignacionesGrupo
          );

          if (!consolidadoMap.has(key)) {
            consolidadoMap.set(key, {
              id_area: area.id_area,
              descripcion_area: area.descripcion || '',
              id_cargo: cargo.id_cargo,
              descripcion_cargo: cargo.descripcion || '',
              tipo_cargo: tipoCargo,
              cantidad: asignacionesGrupo.length,
              asignaciones: asignacionesGrupo,
              calendario: calendarioProcesado,
              costo_total: costoTotal
            });
          } else {
            const item = consolidadoMap.get(key)!;
            item.cantidad += asignacionesGrupo.length;
            item.asignaciones.push(...asignacionesGrupo);
            item.costo_total += costoTotal;
          }
        }
      }
    }

    return Array.from(consolidadoMap.values());
  }

  private procesarDiasCalendarioGrupo(
    calendario: any[],
    asistenciasMap: Map<string, Map<number, any>>,
    costoDia: number,
    horarioConfArea: any,
    feriadosSoloFecha: string[],
    asignacionesGrupo: any[]
  ): { calendarioProcesado: CalendarioDia[], costoTotal: number } {
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

    const descuentos = horarioConfArea?.descuentos || [];
    const diasNoLaborables = horarioConfArea?.dias_nolaborables?.split('|') || [];

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

    const tipoMap = new Map();
    tipos.forEach((tipoObj, index) => {
      const descuentoNumero = parseInt(descuentos[index] || "0", 10) || 0;
      tipoMap.set(tipoObj.codigo, {
        ...tipoObj,
        descuento: descuentoNumero
      });
    });

    const calendarioProcesado: CalendarioDia[] = [];
    let costoTotal = 0;

    for (const anio of calendario) {
      if (!anio || !anio.meses) continue;

      for (const mes of anio.meses) {
        if (!mes || !mes.dias) continue;

        for (const dia of mes.dias) {
          if (!dia || !dia.fecha) continue;

          const fechaDia = moment(dia.fecha, 'DD-MM-YYYY');
          const fechaDiaKey = fechaDia.format('DD-MM-YYYY');
          const diaSemana = getDiaSemanaEspanol(fechaDia);
          const fecha = dia.fecha;

          const esDiaNoLaborable = diasNoLaborables.includes(diaSemana);
          const esFeriado = feriadosSoloFecha.includes(fechaDiaKey);
          const esDiaEspecial = esDiaNoLaborable || esFeriado;

          const detalleAsistencias: AsistenciaDetalle[] = [];
          let montoDia = 0;
          let cantidadAsignacionesConMonto = 0;

          const usuariosMap = asistenciasMap.get(fechaDiaKey) || new Map<number, any>();

          for (const asignacion of asignacionesGrupo) {
            if (!asignacion) continue;

            const asistencia = usuariosMap.get(asignacion.id_usuario);

            if (asistencia) {
              const tipoCodigo = asistencia.tipo;
              let montoIndividual = 0;
              let descuentoAplicado = 0;

              if (tipoCodigo && tipoCodigo !== '') {
                const tipoInfo = tipoMap.get(tipoCodigo);
                if (tipoInfo) {
                  descuentoAplicado = tipoInfo.descuento;
                  if (!esDiaEspecial) {
                    if (descuentoAplicado > 0) {
                      const descuentoMonto = costoDia * (descuentoAplicado / 100);
                      montoIndividual = costoDia - descuentoMonto;
                    } else {
                      montoIndividual = costoDia;
                    }
                    montoDia += montoIndividual;
                    cantidadAsignacionesConMonto++;
                  }
                } else {
                  if (!esDiaEspecial) {
                    montoIndividual = costoDia;
                    montoDia += montoIndividual;
                    cantidadAsignacionesConMonto++;
                  }
                }
              } else {
                if (!esDiaEspecial) {
                  montoIndividual = 0;
                }
              }

              detalleAsistencias.push({
                id_asignacion: asignacion.id_asignacion || 0,
                id_usuario: asistencia.id_usuario || 0,
                tipo_asistencia: tipoCodigo || '',
                descuento_aplicado: descuentoAplicado,
                monto_individual: montoIndividual
              });
            } else {
              detalleAsistencias.push({
                id_asignacion: asignacion.id_asignacion || 0,
                id_usuario: asignacion.id_usuario || 0,
                tipo_asistencia: '',
                descuento_aplicado: 0,
                monto_individual: 0
              });
            }
          }

          costoTotal += montoDia;

          calendarioProcesado.push({
            fecha: fecha,
            dia: dia.dia || '',
            laborable: dia.laborable || false,
            feriado: dia.feriado || false,
            esDiaEspecial,
            monto_dia: montoDia,
            cantidad_asignaciones: cantidadAsignacionesConMonto,
            detalle_asistencias: detalleAsistencias
          });
        }
      }
    }

    return { calendarioProcesado, costoTotal };
  }

  private agruparCargosPorArea(cargos: any[]): Map<number, any[]> {
    const mapa = new Map<number, any[]>();
    if (!cargos || !Array.isArray(cargos)) {
      return mapa;
    }

    cargos.forEach(cargo => {
      if (cargo && cargo.id_area !== undefined) {
        if (!mapa.has(cargo.id_area)) {
          mapa.set(cargo.id_area, []);
        }
        mapa.get(cargo.id_area)!.push(cargo);
      }
    });
    return mapa;
  }

  private agruparAsignacionesPorCargo(asignaciones: any[]): Map<number, any[]> {
    const mapa = new Map<number, any[]>();
    if (!asignaciones || !Array.isArray(asignaciones)) {
      return mapa;
    }

    asignaciones.forEach(asignacion => {
      if (asignacion && asignacion.id_cargo !== undefined) {
        if (!mapa.has(asignacion.id_cargo)) {
          mapa.set(asignacion.id_cargo, []);
        }
        mapa.get(asignacion.id_cargo)!.push(asignacion);
      }
    });
    return mapa;
  }

  agruparPorAnioMes(
    datos: any[], abreviaturas: Record<string, string>, noLaborables: string[]
  ): any[] {
    const esLaborable = (dia: string): boolean =>
      !noLaborables.includes(dia);
    return datos.reduce<any[]>((acc, item) => {
      if (!item) return acc;

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

      let mesObj = anioObj.meses.find(
        m => m.mes_numero === item.mes_numero
      );

      if (!mesObj) {
        mesObj = {
          mes: item.mes_nombre,
          mes_numero: item.mes_numero,
          anio: item.anio,
          cantdias: 0,
          dias: []
        };
        anioObj.meses.push(mesObj);
        anioObj.cantmeses++;
      }

      mesObj.dias.push({
        dia: item.dia_nombre,
        abreviatura: abreviaturas[item.dia_nombre] || item.dia_nombre.substring(0, 2),
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

  async listarMontosAreaPresAnaliticoRH(idProyecto: number): Promise<any[]> {
    let montos: any[] = [];
    const obj = {
      id_proyecto: idProyecto
    };

    const resp = await this.recursosHumanosService.listarMontosAreaPresAnaliticoRH(obj);

    if (resp && resp.length) {
      const toNumberOrNull = (value: string): number | null => {
        if (!value || value.trim() === '') {
          return null;
        }
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };

      for (const element of resp) {
        if (!element) continue;

        const cargos = [];

        if (element.cargos && typeof element.cargos === 'string') {
          const cargosStrings = element.cargos.split('|');

          for (const cargoStr of cargosStrings) {
            const partes = cargoStr.split('/');
            const cargo = {
              id_cargo: toNumberOrNull(partes[0]),
              porcentaje: toNumberOrNull(partes[1]),
              parcial: toNumberOrNull(partes[2])
            };

            if (cargo.id_cargo !== null) {
              cargos.push(cargo);
            }
          }
        }

        const data = {
          id_area: element.id_area || 0,
          cargos: cargos,
          tipo: element.descripcion || '',
          horas_dia: element.formula || ''
        };

        montos.push(data);
      }
    }

    return montos;
  }

  obtenerMesesCalendario(calendario: any[]): string[] {
    const meses: string[] = [];

    if (!calendario || !Array.isArray(calendario)) {
      return meses;
    }

    for (const anio of calendario) {
      if (!anio || !anio.meses) continue;

      for (const mes of anio.meses) {
        if (!mes || !mes.mes) continue;

        meses.push(`${mes.mes.toUpperCase()}-${anio.anio}`);
      }
    }

    return meses;
  }

  
}