import { SwalService } from 'src/app/servicios/swal.service';
import { RecursosHumanosService } from './../../../servicios/recursoshumanos.service';
import { ApplicationRef, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { filatabla } from '../../configuraciones/parametros/parametros.component';
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
  asistenciaExistente: boolean
}

@Component({
  selector: 'app-planillas',
  templateUrl: './planillas.component.html',
  styleUrls: ['./planillas.component.scss']
})
export class PlanillasComponent implements OnInit {
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
    { codigo: 'FE', tipo: 'NO MARCO ENTRADA' },
    { codigo: 'FS', tipo: 'NO MARCO SALIDA' }
  ]
  ocultarSinAsistencia: boolean = false;
  activetab = 1
  diaSeleccionado = ''
  fechaSeleccionada = ''
  tablaAsistenciaMovil = []
  filAsisMov = null
  constructor(private recursosHumanosService: RecursosHumanosService, private cdRef: ChangeDetectorRef, private appRef: ApplicationRef) { }

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

    console.log('Fecha actual:', this.fechaSeleccionada); // Ej: "2024-01-15"
  }
  onNavChange(event) {

  }


  async listarAsignacionesProyecto() {
    this.mostrar_carga_todo = true
    this.meses = []
    const obj = {
      id_proyecto: this.idProyecto
    }
    const resp = await this.recursosHumanosService.listarAsignacionesProyecto(obj)
    await this.listarAreasYCargos()

    console.log('listarAsignacionesProyecto', resp)
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
    // 1. Desactivar detección automática temporalmente
    this.cdRef.detach();

    // 2. Forzar un solo renderizado inicial
    this.cdRef.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      await this.cambioDeMes()
      const inicio = this.calendarioFiltrado[0].dias[0].fecha
      const fin = this.calendarioFiltrado[0].dias[this.calendarioFiltrado[0].colspan - 1].fecha
      const registrosAsistencia = await this.listarRegistrosAsistencia(inicio, fin)
      let diasMesVacios = []
      for (let i = 0; i < this.calendarioFiltrado[this.mesSeleccionado]?.colspan; i++) {
        diasMesVacios.push(null)
      }
      let tablaNueva = []
      if (!this.areaSeleccionada) {
        for (const area of this.areas) {
          const cargos = this.cargos.filter(ele => ele.id_area == area.id_area)
          let areagrupo = []
          for (const cargo of cargos) {
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
              }
              areagrupo.push(cargoData)
              let j = 1
              for (const usuario of asignaciones) {
                const registroMes = await this.filtrarPorUsuario(registrosAsistencia, usuario.id_usuario, usuario.id_asignacion)
                // const existe = registroMes.find(ele => ele.id_control)
                const asignacionData: filaTabla = {
                  area: area.descripcion,
                  cargo: cargo.descripcion,
                  descripcion_usuario: usuario.descripcion_usuario,
                  dias: registroMes,
                  estado: usuario.estado,
                  fecha_fin: usuario.fecha_fin,
                  fecha_inicio: usuario.fecha_inicio,
                  id_area: area.id_area,
                  id_asignacion: usuario.id_asignacion,
                  id_cargo: cargo.id_cargo,
                  id_usuario: usuario.id_usuario,
                  nro_grupo: j,
                  total_jornada: 0,
                  coste_dia: 0,
                  coste_mensual: 0,
                  mostrar: true,
                  asistenciaExistente: true,
                }
                areagrupo.push(asignacionData)
                j++
              }
            }
          }
          tablaNueva = tablaNueva.concat(areagrupo)
          // this.cdRef.detectChanges();

        }
      } else {


        let areaarray = []
        for (const area of this.areas) {

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
              }

              areaarray.push(cargoData)
              let j = 1
              for (const usuario of asignaciones) {
                const registroMes = await this.filtrarPorUsuario(registrosAsistencia, usuario.id_usuario, usuario.id_asignacion)
                // const existe = registroMes.find(ele => ele.id_control)
                const asignacionData: filaTabla = {
                  area: area.descripcion,
                  cargo: cargo.descripcion,
                  descripcion_usuario: usuario.descripcion_usuario,
                  dias: registroMes,
                  estado: usuario.estado,
                  fecha_fin: usuario.fecha_fin,
                  fecha_inicio: usuario.fecha_inicio,
                  id_area: area.id_area,
                  id_asignacion: usuario.id_asignacion,
                  id_cargo: cargo.id_cargo,
                  id_usuario: usuario.id_usuario,
                  nro_grupo: j,
                  total_jornada: 0,
                  coste_dia: 0,
                  coste_mensual: 0,
                  mostrar: true,
                  asistenciaExistente: true,
                }
                areaarray.push(asignacionData)
                j++
              }
            }
          }
        }
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
      console.log('this.tablaFiltrada', this.tablaFiltrada)
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

  filtrarPorUsuario(registrosAsistencia: any[], id_usuario: number, id_asignacion: number) {
    const dias = this.calendarioFiltrado[this.mesSeleccionado].dias;

    // Crear un mapa de registros para búsqueda más rápida
    const registroMap = new Map();

    registrosAsistencia.forEach(registro => {
      if (registro.id_usuario == id_usuario && registro.id_asignacion == id_asignacion) {
        const clave = moment(registro.fecha).format('YYYY-MM-DD');
        registroMap.set(clave, registro);
      }
    });

    // Procesar cada día
    return dias.map(dia => {
      const fechaDiaKey = moment(dia.fecha, 'DD-MM-YYYY').format('YYYY-MM-DD');
      const encontrado = registroMap.get(fechaDiaKey);

      return {
        tipo: encontrado?.tipo || '',
        fecha: dia.fecha,
        fuente: encontrado?.fuente || null,
        habilitado: true,
        id_control: encontrado?.id_control || null,
        // Datos adicionales del registro
        ...(encontrado ? {
          id_proyecto: encontrado.id_proyecto,
          id_usuario: encontrado.id_usuario,
          id_asignacion: encontrado.id_asignacion,
          fecha_registro: encontrado.fecha_registro
        } : {})
      };
    });
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
      'FE': 'bg-secondary text-white',
      'FS': 'bg-light text-dark'
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
      'FE': '#6c757d',
      'FS': '#f8f9fa'
    };
    return colores[codigo] || '#f8f9fa';
  }

  getTextColor(codigo: string): string {
    const textosClaros = ['TI', 'FI', 'FJ', 'FM', 'FV', 'FC', 'FD'];
    const textosOscuros = ['T', 'TJ', 'FS'];

    if (textosClaros.includes(codigo)) return 'white';
    if (textosOscuros.includes(codigo)) return 'black';
    return codigo === 'A' || codigo === 'F' || codigo === 'FE' ? 'white' : 'black';
  }


  async onTipoChange(nuevoValor: string, fila: number, columna: any) {

    // Aquí puedes hacer cualquier procesamiento adicional
    if (this.tablaFiltrada[fila].dias[columna].tipo !== nuevoValor) {
      this.tablaFiltrada[fila].dias[columna].tipo = nuevoValor
      const row = this.tablaFiltrada[fila]
      if (!this.tablaFiltrada[fila].dias[columna].id_control) {
        const resp = await this.guardarRegistro(row, row.dias[columna].fecha, nuevoValor)
        this.tablaFiltrada[fila].dias[columna].id_control = resp
      } else {
        this.actualizarRegistro(row, row.dias[columna].fecha, nuevoValor, row.dias[columna].id_control)
      }

    }
  }

  async guardarRegistro(row, fecha, tipo) {
    try {
      const partesFecha = fecha.split('-');
      const fechaFormateada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
      const obj = {
        id_proyecto: this.idProyecto,
        id_usuario: row.id_usuario,
        id_area: row.id_area,
        id_cargo: row.id_cargo,
        id_asignacion: row.id_asignacion,
        fecha: fechaFormateada,
        tipo: tipo,
        fuente: 1
      }
      const resp = await this.recursosHumanosService.guardarRegistrosAsistencia(obj)
      if (resp[0]?.resultado == 'OK') {
        return resp[0].id_control
      } else {
        SwalService.error()
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
    }

  }

  async actualizarRegistro(row, fecha, tipo, id_control) {
    // Lógica adicional si es necesaria
    try {
      const partesFecha = fecha.split('-');
      const fechaFormateada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
      const obj = {
        id_control: id_control,
        id_proyecto: this.idProyecto,
        id_usuario: row.id_usuario,
        id_area: row.id_area,
        id_cargo: row.id_cargo,
        id_asignacion: row.id_asignacion,
        fecha: fechaFormateada,
        tipo: tipo,
        fuente: 1
      }
      console.log('obj', obj)
      const resp = await this.recursosHumanosService.actualizarRegistrosAsistencia(obj)
      console.log('actualizarRegistrosAsistencia', resp)
      if (resp[0]?.id !== '1') {
        SwalService.error()
      }
    } catch (error) {
      console.log(error)
      SwalService.error()
    }

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
      console.log('obj', obj)
      this.tablaAsistenciaMovil = await this.recursosHumanosService.listarAsistenciaMovil(obj)

      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }

  }
}

