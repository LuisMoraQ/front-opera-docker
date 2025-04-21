export interface rowpresu {
    id_proyecto: any;
    item: string;
    descripcion: any;
    unidad: any;
    cantidad: any;
    precio: any;
    parcial: any;
    rendimiento: any;
    und_rendi: any;
    jornada: any;
    referencia:any;
    id_partida:any;
    advceros: any;
    tipofila: any;
    id_usuario: any;

    seleccion: any;
    icomost: any;
    ind: any;
    ind2: any;
    mostrar: any;
    editar1: any;
    editar2: any;
  }
  export interface rowacu {//revisar parametros de esta fila
    id_proyecto: any;
    item: any;
    num_det: any;
    codigo:any;
    descripcion: any;
    unidad: any;
    cuadrilla: any;
    cantidad: any;
    precio: any;
    parcial: any;
    id_tipo_insumo: any;
    id_insumo: any;
    id_subpartida: any;
    id_partida: any;
    esinsumo:any;
    afcuadrilla:any;
    afectaref:any;
    
    icomost:any;
    mostrar:any;
    editar:any;
    ind:any;
    ind2:any;
  }

  export const tiposEstado = [
    { id: 0, nombre: 'APROBADO' },
    { id: 1, nombre: 'BORRADOR' },
    { id: 2, nombre: 'EVALLUACION' }
  ]

  export const tiposMoneda = [
    { id: 0, nombre: 'SOLES' },
    { id: 1, nombre: 'DOLARES' }
  ]

  export const paises = [{ id: 227, nombre: 'PERU' }]

  export const modalidades = [
    { id: 0, nombre: 'DIRECTA' },
    { id: 1, nombre: 'CONTRATA' }
  ]
  export const monedas = [
    { id: 0, nombre: 'SOLES' },
    { id: 1, nombre: 'DOLARES' }
  ]
  export const estados = [
    { id: 0, nombre: 'BORRADOR' },
    { id: 1, nombre: 'APROBADO' },
    { id: 2, nombre: 'EVALUACIÓN' }
  ]

  export interface tablagantt {
    start:string;
    end: string;
    name: string;
    id: string;
    custom_class: string;
    dependencies: string,
  }


export interface tabla {
  posicion: number;
  expand: number;
  expand2: number
  item: string;
  descripcion: string;
  duracion: string;
  fechaini: string;
  fechafin: string;
  referencia: string;
  nivel: number;
  color: string;
  tipo: string;
  letra: string;
}