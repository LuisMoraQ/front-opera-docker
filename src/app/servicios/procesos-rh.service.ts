

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
  valor_aplicado: number;  // Puede ser descuento o bonificación
  monto_individual: number;
  tipo_valor: string;  // 'descuento' o 'bonificacion'
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
  tipos = [
    { codigo: 'A', tipo: 'ASISTIO', porcentaje: null, influye_cantidad: 1 },
    { codigo: 'T', tipo: 'TARDANZA', porcentaje: 10, influye_cantidad: 1 },
    { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA', porcentaje: 10, influye_cantidad: 1 },
    { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA', porcentaje: null, influye_cantidad: 1 },
    { codigo: 'F', tipo: 'FALTA', porcentaje: 100, influye_cantidad: 0 },
    { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA', porcentaje: 100, influye_cantidad: 0 },
    { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA', porcentaje: null, influye_cantidad: 0 },
    { codigo: 'FM', tipo: 'DESCANSO MEDICO', porcentaje: null, influye_cantidad: 0 },
    { codigo: 'FV', tipo: 'VACACIONES', porcentaje: null, influye_cantidad: 0 },
    { codigo: 'PE', tipo: 'PERMISO', porcentaje: null, influye_cantidad: 0 },
    { codigo: 'D1', tipo: 'DESCUENTO OPCIONAL 1', porcentaje: null, influye_cantidad: 1 },
    { codigo: 'D2', tipo: 'DESCUENTO OPCIONAL 2', porcentaje: null, influye_cantidad: 1 },
    { codigo: 'D3', tipo: 'DESCUENTO OPCIONAL 3', porcentaje: null, influye_cantidad: 0 },
    { codigo: 'OBS', tipo: 'OBSERVADO', porcentaje: 100, influye_cantidad: 0 },
    { codigo: 'IN', tipo: 'INCOMPLETO', porcentaje: 100, influye_cantidad: 0 },
    { codigo: 'TEX', tipo: 'TEXTRA', porcentaje: null, influye_cantidad: 0 },
    { codigo: 'BN', tipo: 'BONO DOMINICAL', porcentaje: null, influye_cantidad: 0 },
    { codigo: 'BF', tipo: 'BONO FERIADO', porcentaje: null, influye_cantidad: 0 },
    { codigo: 'B1', tipo: 'BONO OPCIONAL 1', porcentaje: null, influye_cantidad: 1 },
    { codigo: 'B2', tipo: 'BONO OPCIONAL 2', porcentaje: null, influye_cantidad: 1 },
    { codigo: 'B3', tipo: 'BONO OPCIONAL 3', porcentaje: null, influye_cantidad: 0 },
  ];
  constructor(private recursosHumanosService: RecursosHumanosService) { }

  // async calendarioXAsignaciones(idProyecto: number): Promise<any> {
  //   const [
  //     [areas, cargos],
  //     respAsignaciones,
  //     montosAreas
  //   ] = await Promise.all([
  //     this.recursosHumanosService.listarCargosPorArea({ id_proyecto: idProyecto }),
  //     this.recursosHumanosService.listarAsignacionesProyecto({ id_proyecto: idProyecto }),
  //     this.listarMontosAreaPresAnaliticoRH(idProyecto)
  //   ]);

  //   const { calendario: calendarioRaw, asignaciones, fecha_maxima, fecha_minima } = respAsignaciones;
  //   const calendario = this.agruparPorAnioMes(calendarioRaw, this.abreviaturas, []);

  //   const [asistencias, [configuraciones, feriados]] = await Promise.all([
  //     this.recursosHumanosService.listarRegistrosAsistencia({
  //       id_proyecto: idProyecto,
  //       fecha_inicio: fecha_minima,
  //       fecha_fin: fecha_maxima
  //     }),
  //     this.recursosHumanosService.listarHorarioYFeriadosArea({
  //       id_proyecto: idProyecto,
  //       id_area: 0
  //     })
  //   ]);
  //   const asistenciasMap = this.crearMapaAsistenciasPorUsuario(asistencias);
  //   console.log('asistenciasMap', asistenciasMap)
  //   const configuracionesMap = this.crearMapaConfiguraciones(configuraciones);
  //   console.log('configuracionesMap', configuracionesMap)
  //   const montosAreasMap = this.crearMapaMontosPorArea(montosAreas);
  //   console.log('montosAreasMap', montosAreasMap)
  //   const consolidadoGeneral = this.procesarAreasYAsignaciones(
  //     areas,
  //     cargos,
  //     asignaciones,
  //     calendario,
  //     asistenciasMap,
  //     configuracionesMap,
  //     montosAreasMap,
  //     feriados
  //   );

  //   // 1. Primero agrupar los datos reales por meses
  //   const consolidadoPorMesesBase = this.agruparConsolidadoPorMeses(consolidadoGeneral, calendario);

  //   // 2. Insertar cabeceras y calcular total de área DENTRO de cada mes
  //   const consolidadoPorMeses = this.procesarCabecerasYTotalesPorMes(consolidadoPorMesesBase);

  //   // 3. Obtener totales globales por día y mes
  //   const totalesGlobales = this.calcularTotalesGlobales(consolidadoPorMeses, this.tipos); return {
  //     consolidadoPorMeses,
  //     calendario,
  //     areas,
  //     cargos,
  //     totales_globales: totalesGlobales, // Nuevo objeto con totales
  //     sinPresAnalitico: montosAreas.length ? false : true
  //   };
  // }

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

    // -------------------------------------------------------------
    // NUEVO: Agrupar la información de configuración y montos por área
    // -------------------------------------------------------------
    const areasConDetalle = areas.map((area: any) => {
      const idArea = area.id_area || area.id; // Ajusta según la propiedad de ID de tu objeto área
      return {
        ...area,
        monto: montosAreasMap.get(idArea) || null,
        configuracion: configuracionesMap.get(idArea) || null
      };
    });

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

    // 1. Primero agrupar los datos reales por meses
    const consolidadoPorMesesBase = this.agruparConsolidadoPorMeses(consolidadoGeneral, calendario);

    // 2. Insertar cabeceras y calcular total de área DENTRO de cada mes
    const consolidadoPorMeses = this.procesarCabecerasYTotalesPorMes(consolidadoPorMesesBase);

    // 3. Obtener totales globales por día y mes
    const totalesGlobales = this.calcularTotalesGlobales(consolidadoPorMeses, this.tipos);

    // Retornamos el nuevo parámetro 'areasDetalle' junto con la respuesta
    return {
      consolidadoPorMeses,
      calendario,
      areas,
      cargos,
      areasDetalle: areasConDetalle, // <-- NUEVO PARÁMETRO
      totales_globales: totalesGlobales,
      sinPresAnalitico: !montosAreas.length
    };
  }

  private agruparConsolidadoPorMeses(
    consolidadoGeneral: ConsolidadoItem[],
    calendario: any[]
  ): ConsolidadoPorMes[] {
    const mesesMap = new Map<string, ConsolidadoPorMes>();

    // Crear estructura de meses
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

    // Agrupar items reales
    for (const item of consolidadoGeneral) {
      if (!item || !item.calendario) continue;

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
        costoPorMes.set(mesKey, (costoPorMes.get(mesKey) || 0) + (dia.monto_dia || 0));
      }

      for (const [mesKey, diasMes] of diasPorMes) {
        const mesConsolidado = mesesMap.get(mesKey);
        if (mesConsolidado) {
          const itemParaMes: ConsolidadoItem = {
            ...item,
            calendario: diasMes,
            costo_total: costoPorMes.get(mesKey) || 0
          };
          mesConsolidado.items.push(itemParaMes);
          mesConsolidado.costo_total_mes += itemParaMes.costo_total;
        }
      }
    }

    return Array.from(this.mapaToArrayYOrdenar(mesesMap));
  }

  private mapaToArrayYOrdenar(mesesMap: Map<string, ConsolidadoPorMes>): ConsolidadoPorMes[] {
    const mesesOrden: { [key: string]: number } = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
      'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
      'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
    };

    return Array.from(mesesMap.values()).sort((a, b) => {
      // 1. Primero se ordena por año
      if (a.anio !== b.anio) {
        return a.anio - b.anio;
      }

      // 2. Si es el mismo año, se ordena por el mes
      const mesNumA = mesesOrden[a.mes.toLowerCase().trim()] || 0;
      const mesNumB = mesesOrden[b.mes.toLowerCase().trim()] || 0;

      return mesNumA - mesNumB;
    });
  }

  private procesarCabecerasYTotalesPorMes(consolidadoPorMeses: ConsolidadoPorMes[]): ConsolidadoPorMes[] {
    return consolidadoPorMeses.map(mes => {
      const itemsProcesados: ConsolidadoItem[] = [];
      const itemsPorArea = new Map<number, ConsolidadoItem[]>();

      // Agrupar los items del mes por id_area
      mes.items.forEach(item => {
        if (!itemsPorArea.has(item.id_area)) {
          itemsPorArea.set(item.id_area, []);
        }
        itemsPorArea.get(item.id_area)!.push(item);
      });

      itemsPorArea.forEach((itemsArea, idArea) => {
        if (itemsArea.length === 0) return;

        // ------------------------------------------------------------------
        // CAMBIO 1: Filtrar solo los cargos/detalles reales del área.
        // Eliminamos cualquier fila que sea encabezado previo o no tenga cargo.
        // ------------------------------------------------------------------
        const cargosReales = itemsArea.filter(item =>
          !item.es_cabecera_area &&
          item.id_cargo !== null &&
          item.descripcion_cargo !== ''
        );

        const primeraArea = itemsArea[0];

        // ------------------------------------------------------------------
        // CAMBIO 2: Agregar una ÚNICA Cabecera de Área
        // ------------------------------------------------------------------
        itemsProcesados.push({
          id_area: primeraArea.id_area,
          descripcion_area: primeraArea.descripcion_area,
          id_cargo: null,
          // Asignamos el texto aquí para que la celda "Cargo" muestre el título del Área
          descripcion_cargo: `ÁREA: ${primeraArea.descripcion_area}`,
          tipo_cargo: '',
          cantidad: 0,
          asignaciones: [],
          calendario: [],
          costo_total: 0,
          es_cabecera_area: true,
          es_total_area: false
        });

        // ------------------------------------------------------------------
        // CAMBIO 3: Insertar ÚNICAMENTE los cargos reales filtrados
        // ------------------------------------------------------------------
        itemsProcesados.push(...cargosReales);

        // ------------------------------------------------------------------
        // CAMBIO 4: Calcular el total del área basándose solo en cargos reales
        // ------------------------------------------------------------------
        const totalAreaItem = this.construirTotalAreaParaMes(cargosReales, primeraArea);
        itemsProcesados.push(totalAreaItem);
      });

      return {
        ...mes,
        items: itemsProcesados
      };
    });
  }

  private construirTotalAreaParaMes(itemsArea: ConsolidadoItem[], primeraArea: ConsolidadoItem): ConsolidadoItem {
    // Guardamos el objeto completo del día junto con los acumulados
    const mapaDiasTotal = new Map<string, { diaBase: CalendarioDia; cantidad_asignaciones: number; monto_dia: number }>();
    let costoTotalArea = 0;
    let cantidadTotalArea = 0;

    itemsArea.forEach(item => {
      costoTotalArea += item.costo_total || 0;
      cantidadTotalArea += item.cantidad || 0;

      item.calendario.forEach(dia => {
        if (!mapaDiasTotal.has(dia.fecha)) {
          mapaDiasTotal.set(dia.fecha, {
            diaBase: dia, // Mantenemos la referencia de dia, laborable, feriado, etc.
            cantidad_asignaciones: 0,
            monto_dia: 0
          });
        }
        const acumuladoDia = mapaDiasTotal.get(dia.fecha)!;
        acumuladoDia.cantidad_asignaciones += (dia.cantidad_asignaciones || 0);
        acumuladoDia.monto_dia += (dia.monto_dia || 0);
      });
    });

    // Reconstruimos el array garantizando el tipo CalendarioDia[]
    const calendarioTotalArea: CalendarioDia[] = Array.from(mapaDiasTotal.values()).map(val => ({
      ...val.diaBase, // Mantiene dia, laborable, feriado, esDiaEspecial, etc.
      cantidad_asignaciones: val.cantidad_asignaciones,
      monto_dia: val.monto_dia,
      detalle_asistencias: [] // Vacío para la fila resumen de total
    }));

    return {
      id_area: primeraArea.id_area,
      descripcion_area: `TOTAL ${primeraArea.descripcion_area}`,
      id_cargo: null,
      descripcion_cargo: '',
      tipo_cargo: '',
      cantidad: cantidadTotalArea,
      asignaciones: [],
      calendario: calendarioTotalArea, // Cumple estrictamente con CalendarioDia[]
      costo_total: costoTotalArea,
      es_cabecera_area: false,
      es_total_area: true
    };
  }



  // private calcularTotalesGlobales(consolidadoPorMeses: ConsolidadoPorMes[]): {
  //   totales_por_mes: TotalesMes[];
  //   totales_por_dia: { [fecha: string]: { cantidad_asignaciones: number; monto_dia: number } };
  //   total_general: { cantidad_asignaciones: number; monto_total: number };
  // } {
  //   const totalesPorMes: TotalesMes[] = [];
  //   const totalesPorDiaMap = new Map<string, { cantidad_asignaciones: number; monto_dia: number }>();
  //   let totalCantidadGeneral = 0;
  //   let totalMontoGeneral = 0;

  //   // Procesar cada mes
  //   consolidadoPorMeses.forEach(mes => {
  //     const totalesDiaMes: { [fecha: string]: { cantidad_asignaciones: number; monto_dia: number } } = {};
  //     let cantidadTotalMes = 0;
  //     let montoTotalMes = 0;

  //     // Solo procesar los items que son totales de área (es_total_area === true)
  //     const itemsTotalesArea = mes.items.filter(item => item.es_total_area);

  //     itemsTotalesArea.forEach(item => {
  //       // Sumar al total general del mes
  //       cantidadTotalMes += item.cantidad;
  //       montoTotalMes += item.costo_total;

  //       // Acumular por día
  //       item.calendario.forEach(dia => {
  //         const fecha = dia.fecha;

  //         // Acumular en el mapa global de días
  //         if (!totalesPorDiaMap.has(fecha)) {
  //           totalesPorDiaMap.set(fecha, { cantidad_asignaciones: 0, monto_dia: 0 });
  //         }

  //         const totalDia = totalesPorDiaMap.get(fecha)!;
  //         totalDia.cantidad_asignaciones += dia.cantidad_asignaciones;
  //         totalDia.monto_dia += dia.monto_dia;

  //         // Acumular en el mapa del mes
  //         if (!totalesDiaMes[fecha]) {
  //           totalesDiaMes[fecha] = { cantidad_asignaciones: 0, monto_dia: 0 };
  //         }
  //         totalesDiaMes[fecha].cantidad_asignaciones += dia.cantidad_asignaciones;
  //         totalesDiaMes[fecha].monto_dia += dia.monto_dia;
  //       });
  //     });

  //     // Agregar totales del mes
  //     totalesPorMes.push({
  //       mes_key: mes.mes_key,
  //       totales_dia: totalesDiaMes,
  //       total_mes: {
  //         cantidad_asignaciones: cantidadTotalMes,
  //         monto_mes: montoTotalMes
  //       }
  //     });

  //     // Acumular en totales generales
  //     totalCantidadGeneral += cantidadTotalMes;
  //     totalMontoGeneral += montoTotalMes;
  //   });

  //   // Convertir el mapa de días a objeto
  //   const totalesPorDia: { [fecha: string]: { cantidad_asignaciones: number; monto_dia: number } } = {};
  //   totalesPorDiaMap.forEach((value, key) => {
  //     totalesPorDia[key] = value;
  //   });

  //   return {
  //     totales_por_mes: totalesPorMes,
  //     totales_por_dia: totalesPorDia,
  //     total_general: {
  //       cantidad_asignaciones: totalCantidadGeneral,
  //       monto_total: totalMontoGeneral
  //     }
  //   };
  // }
  private calcularTotalesGlobales(
    consolidadoPorMeses: ConsolidadoPorMes[],
    tiposAsistencia: any[] // Se pasa el arreglo tipos con la propiedad influye_cantidad
  ): {
    totales_por_mes: TotalesMes[];
    totales_por_dia: { [fecha: string]: { cantidad_asignaciones: number; monto_dia: number } };
    total_general: { cantidad_asignaciones: number; monto_total: number };
  } {
    // Set con los códigos de tipo_asistencia que SÍ influyen (influye_cantidad === 1)
    const codigosQueInfluyen = new Set(
      (tiposAsistencia || [])
        .filter(t => t.influye_cantidad === 1)
        .map(t => t.codigo)
    );

    const totalesPorMes: TotalesMes[] = [];
    const totalesPorDiaMap = new Map<string, { cantidad_asignaciones: number; monto_dia: number }>();
    let totalCantidadGeneral = 0;
    let totalMontoGeneral = 0;

    consolidadoPorMeses.forEach(mes => {
      const totalesDiaMes: { [fecha: string]: { cantidad_asignaciones: number; monto_dia: number } } = {};
      let cantidadTotalMes = 0;
      let montoTotalMes = 0;

      // Solo procesamos totales de área
      const itemsTotalesArea = mes.items.filter(item => item.es_total_area);

      itemsTotalesArea.forEach(item => {
        item.calendario.forEach(dia => {
          const fecha = dia.fecha;

          // Si existen detalles de asistencia, contamos cuántas asistencias
          // tienen un tipo_asistencia que SÍ influye en la cantidad.
          let cantidadValidaDia = 0;

          if (dia.detalle_asistencias && dia.detalle_asistencias.length > 0) {
            cantidadValidaDia = dia.detalle_asistencias.filter(asist =>
              codigosQueInfluyen.has(asist.tipo_asistencia)
            ).length;
          } else {
            // Si no hay detalle explícito pero hay cantidad_asignaciones precalculada
            cantidadValidaDia = dia.cantidad_asignaciones || 0;
          }

          const montoDia = dia.monto_dia || 0;

          // Acumular totales del mes
          cantidadTotalMes += cantidadValidaDia;
          montoTotalMes += montoDia;

          // Acumular en mapa global de días
          if (!totalesPorDiaMap.has(fecha)) {
            totalesPorDiaMap.set(fecha, { cantidad_asignaciones: 0, monto_dia: 0 });
          }
          const totalDia = totalesPorDiaMap.get(fecha)!;
          totalDia.cantidad_asignaciones += cantidadValidaDia;
          totalDia.monto_dia += montoDia;

          // Acumular en mapa del mes
          if (!totalesDiaMes[fecha]) {
            totalesDiaMes[fecha] = { cantidad_asignaciones: 0, monto_dia: 0 };
          }
          totalesDiaMes[fecha].cantidad_asignaciones += cantidadValidaDia;
          totalesDiaMes[fecha].monto_dia += montoDia;
        });
      });

      totalesPorMes.push({
        mes_key: mes.mes_key,
        totales_dia: totalesDiaMes,
        total_mes: {
          cantidad_asignaciones: cantidadTotalMes,
          monto_mes: montoTotalMes
        }
      });

      totalCantidadGeneral += cantidadTotalMes;
      totalMontoGeneral += montoTotalMes;
    });

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

      let horarioConfArea = configuracionesMap.get(area.id_area);
      if (!horarioConfArea) {
        horarioConfArea = {
          id_configuracion: null,
          id_proyecto: area.id_proyecto,
          id_area: area.id_area,
          inicio_semana: 'LUNES',
          dias_nolaborables: 'DOMINGO',
          hora_ingreso_manana: '07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|07:30:00|',
          hora_salida_manana: '12:00:00|12:00:00|12:00:00|12:00:00|12:00:00|13:00:00|',
          hora_ingreso_tarde: '14:00:00|14:00:00|14:00:00|14:00:00|14:00:00||',
          hora_salida_tarde: '18:00:00|18:00:00|18:00:00|18:00:00|18:00:00||',
          totales_dia: 48,
          descuentos: "0|10|10|0|100|100|0|0|0|0|0|0|0|100|100|0|0|0|0|0|0",
          tardanza: 10,
          tiempo_extra: 0
        };
      }

      // OBTENER Y FILTRAR FERIADOS DEL ÁREA UNA SOLA VEZ
      const feriadosSoloFecha = feriados
        .filter(ele => {
          if (!ele || !ele.areas) return false;
          const areasFeriado = ele.areas.split('|');
          return areasFeriado.includes(area.id_area.toString());
        })
        .map(ele => ele.fecha?.split('T')[0])
        .filter(Boolean);

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

          // BÚSQUEDA MÁS ROBUSTA DE COSTO DÍA
          let costoDia = 0;
          if (areaMontosMap && tipoCargo) {
            const tipoCargoClean = String(tipoCargo ?? '').trim().toUpperCase();

            for (const [tipoKey, cargosMap] of areaMontosMap) {
              // Convertimos también la llave del Map a String por seguridad
              const tipoKeyClean = String(tipoKey ?? '').trim().toUpperCase();

              if (tipoKeyClean.endsWith(tipoCargoClean)) {
                costoDia = cargosMap.get(cargo.id_cargo) || 0;
                break;
              }
            }
          }

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
              asignaciones: [...asignacionesGrupo],
              calendario: calendarioProcesado,
              costo_total: costoTotal
            });
          } else {
            const item = consolidadoMap.get(key)!;
            item.cantidad += asignacionesGrupo.length;
            item.asignaciones.push(...asignacionesGrupo);
            item.costo_total += costoTotal;
            // NOTA: Si necesitas fusionar los datos de item.calendario con calendarioProcesado,
            // deberás agregar una función auxiliar aquí para combinar ambos arrays.
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

    const descuentosRaw = horarioConfArea?.descuentos || [];
    const diasNoLaborables = [];
    const descuentos = typeof descuentosRaw === 'string'
      ? descuentosRaw.split('|')
      : descuentosRaw;

    const tipos = [
      { codigo: 'A', tipo: 'ASISTIO', tipoValor: 'descuento' },
      { codigo: 'T', tipo: 'TARDANZA', tipoValor: 'descuento' },
      { codigo: 'TI', tipo: 'TARDANZA INJUSTIFICADA', tipoValor: 'descuento' },
      { codigo: 'TJ', tipo: 'TARDANZA JUSTIFICADA', tipoValor: 'descuento' },
      { codigo: 'F', tipo: 'FALTA', tipoValor: 'descuento' },
      { codigo: 'FI', tipo: 'FALTA INJUSTIFICADA', tipoValor: 'descuento' },
      { codigo: 'FJ', tipo: 'FALTA JUSTIFICADA', tipoValor: 'descuento' },
      { codigo: 'FM', tipo: 'DESCANSO MEDICO', tipoValor: 'descuento' },
      { codigo: 'FV', tipo: 'VACACIONES', tipoValor: 'descuento' },
      { codigo: 'PE', tipo: 'PERMISO', tipoValor: 'descuento' },
      { codigo: 'D1', tipo: 'DESCUENTO OPCIONAL 1', tipoValor: 'descuento' },
      { codigo: 'D2', tipo: 'DESCUENTO OPCIONAL 2', tipoValor: 'descuento' },
      { codigo: 'D3', tipo: 'DESCUENTO OPCIONAL 3', tipoValor: 'descuento' },
      { codigo: 'OBS', tipo: 'OBSERVADO', tipoValor: 'descuento' },
      { codigo: 'IN', tipo: 'INCOMPLETO', tipoValor: 'descuento' },
      { codigo: 'TEX', tipo: 'TEXTRA', tipoValor: 'descuento' },
      { codigo: 'BN', tipo: 'BONO NO LABORABLE', tipoValor: 'bonificacion' },
      { codigo: 'BF', tipo: 'BONO FERIADO', tipoValor: 'bonificacion' },
      { codigo: 'B1', tipo: 'BONO OPCIONAL 1', tipoValor: 'bonificacion' },
      { codigo: 'B2', tipo: 'BONO OPCIONAL 2', tipoValor: 'bonificacion' },
      { codigo: 'B3', tipo: 'BONO OPCIONAL 3', tipoValor: 'bonificacion' },
    ];

    const tipoMap = new Map();
    tipos.forEach((tipoObj, index) => {
      const valorNumero = parseInt(descuentos[index] || "0", 10) || 0;
      tipoMap.set(tipoObj.codigo, {
        ...tipoObj,
        valor: valorNumero
      });
    });

    const isAsignacionActivaEnFecha = (asignacion: any, fecha: moment.Moment): boolean => {
      if (!asignacion) return false;

      if (asignacion.fecha_inicio && asignacion.fecha_fin) {
        const fechaInicio = moment(asignacion.fecha_inicio);
        const fechaFin = moment(asignacion.fecha_fin);
        return fecha.isSameOrAfter(fechaInicio, 'day') && fecha.isSameOrBefore(fechaFin, 'day');
      }

      if (asignacion.fecha_inicio && !asignacion.fecha_fin) {
        const fechaInicio = moment(asignacion.fecha_inicio);
        return fecha.isSameOrAfter(fechaInicio, 'day');
      }

      if (!asignacion.fecha_inicio && asignacion.fecha_fin) {
        const fechaFin = moment(asignacion.fecha_fin);
        return fecha.isSameOrBefore(fechaFin, 'day');
      }

      return true;
    };

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

            const estaActiva = isAsignacionActivaEnFecha(asignacion, fechaDia);
            const asistencia = usuariosMap.get(asignacion.id_usuario);

            // Si NO está activa la asignación Y TAMPOCO hay asistencia registrada, se omite.
            if (!estaActiva && !asistencia) {
              detalleAsistencias.push({
                id_asignacion: asignacion.id_asignacion || 0,
                id_usuario: asignacion.id_usuario || 0,
                tipo_asistencia: '',
                valor_aplicado: 0,
                monto_individual: 0,
                tipo_valor: ''
              });
              continue;
            }

            if (asistencia) {
              // Soporta tanto asistencia.tipo como asistencia.tipo_asistencia
              const rawTipo = asistencia.tipo || asistencia.tipo_asistencia || '';
              // Limpia el asterisco '*' (ej. 'A*' -> 'A') para consultar el Map
              const tipoCodigo = rawTipo.replace('*', '').trim();

              let montoIndividual = 0;
              let valorAplicado = 0;
              let tipoValor = '';

              if (tipoCodigo && tipoCodigo !== '') {
                const tipoInfo = tipoMap.get(tipoCodigo);
                if (tipoInfo) {
                  valorAplicado = tipoInfo.valor;
                  tipoValor = tipoInfo.tipoValor;

                  if (!esDiaEspecial) {
                    if (tipoValor === 'descuento') {
                      if (valorAplicado > 0) {
                        const descuentoMonto = costoDia * (valorAplicado / 100);
                        montoIndividual = costoDia - descuentoMonto;
                      } else {
                        montoIndividual = costoDia;
                      }
                    } else if (tipoValor === 'bonificacion') {
                      const bonificacionMonto = costoDia * (valorAplicado / 100);
                      montoIndividual = costoDia + bonificacionMonto;
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
                id_usuario: asistencia.id_usuario || asignacion.id_usuario || 0,
                tipo_asistencia: rawTipo, // Mantiene el formato original (ej. 'A*')
                valor_aplicado: valorAplicado,
                monto_individual: montoIndividual,
                tipo_valor: tipoValor
              });
            } else {
              // Si la asignación está activa pero no marcó asistencia en esa fecha
              detalleAsistencias.push({
                id_asignacion: asignacion.id_asignacion || 0,
                id_usuario: asignacion.id_usuario || 0,
                tipo_asistencia: '',
                valor_aplicado: 0,
                monto_individual: 0,
                tipo_valor: ''
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

  async listarInformacionRHPlanilla(id_proyecto) {
    const obj = {
      id_proyecto: id_proyecto
    }
    const resp = await this.recursosHumanosService.listarInformacionRHPlanilla(obj)
    return resp
  }
}