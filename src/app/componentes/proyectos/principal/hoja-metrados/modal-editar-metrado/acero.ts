export interface Acero {
  descripcion: string;
  esMetrado: number;
  item: string;
  id_metrado: number;
  indice: number;
  id_proyecto: number;
  cantidad?: string;
  diametro?: string;
  elementos?: string;
  total1?: number;
  longitud?: string;
  total2?: number;
  pesodiametro?: number;
  parcial?: string;
  subtotal?: string;
  id_padre?: string;
  editarEliminar?: boolean;
  editarCopiar?: boolean;
  tieneSubmetrado?: number;
  estitulo?: number;
  editardescripcion?: number;
  editarcantidad?: number;
  editardiametro?: number;
  editarelementos?: number;
  editartotal1?: number;
  editarlongitud?: number;
  editartotal2?: number;
  editarpesodiametro?: number;
  editararchivo?: number;
  archivo?: any;
  estilo?: string;
  icomost?: number;
  mostrar?: number;
  estmost?: number;
  ind? : number
}

export class aceroModelo implements Acero {
  constructor(
    public descripcion: string,
    public esMetrado: number,
    public item: string,
    public id_metrado: number,
    public indice: number,
    public id_proyecto: number,
    public cantidad?: string,
    public diametro?: string,
    public elementos?: string,
    public total1?: number,
    public longitud?: string,
    public total2?: number,
    public pesodiametro?: number,
    public parcial?: string,
    public subtotal?: string,
    public id_padre?: string,
    public tieneSubmetrado?: number,
    public estitulo?: number,
    public editardescripcion?: number,
    public editarEliminar?: boolean,
    public editarCopiar?: boolean,
    public editarcantidad?: number,
    public editardiametro?: number,
    public editarelementos?: number,
    public editartotal1?: number,
    public editarlongitud?: number,
    public editartotal2?: number,
    public editarpesodiametro?: number,
    public editararchivo?: number,
    public archivo?: any,
    public estilo?: string,
    public icomost?: number,
    public mostrar?: number,
    public estmost?: number,
    public ind?: number
  ) {
    this.descripcion = descripcion;
    this.esMetrado = esMetrado;
    this.item = item;
    this.id_metrado = id_metrado;
    this.indice = indice;
    this.id_proyecto = id_proyecto;
    this.cantidad = (cantidad && cantidad  !== undefined )? cantidad : null;
    this.diametro = (diametro && diametro  !== undefined )? diametro : null;
    this.elementos = (elementos && elementos  !== undefined ) ? elementos : null;
    this.total1 = total1 ? total1 : 0.0;
    this.longitud = (longitud && longitud  !== undefined )? longitud : null;
    this.total2 = total2 ? total2 : 0.0;
    this.pesodiametro = (pesodiametro && pesodiametro  !== undefined ) ? pesodiametro : null;
    this.parcial = parcial ? parcial : '0';
    this.subtotal = subtotal ? subtotal : '0';
    this.id_padre = id_padre ? id_padre : null;
    this.editarEliminar = editarEliminar ? editarEliminar : false;
    this.editarCopiar = editarCopiar ? editarCopiar : false;
    this.tieneSubmetrado = tieneSubmetrado ? tieneSubmetrado : 0;
    this.estitulo = estitulo ? estitulo : 0;
    this.editardescripcion = 0;
    this.editarcantidad = 0;
    this.editardiametro = 0;
    this.editarelementos = 0;
    this.editartotal1 = 0;
    this.editarlongitud = 0;
    this.editartotal2 = 0;
    this.editarpesodiametro = 0;
    this.editararchivo = 0;
    this.archivo = (archivo && archivo  !== undefined )? archivo : null;
    this.estilo = estilo ? estilo : '';
    this.icomost =  0;
    this.mostrar = 1;
    this.estmost = 1;
    this.ind = ind;
  }
}
