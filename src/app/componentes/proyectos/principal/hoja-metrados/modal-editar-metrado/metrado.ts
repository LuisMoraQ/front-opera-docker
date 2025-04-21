export interface Metrado {
    descripcion: string;
    esMetrado: number;
    item: string;
    id_metrado?: number;
    indice?: number;
    id_proyecto?: number;
    cantidad?: string;
    n_veces?: string;
    largo?: string;
    ancho?: string;
    altura?: string;
    parcial?: string;
    subtotal?: string;
    tieneAceros?: number;
    editardescripcion?: number;
    editarcantidad?: number;
    editarn_veces?: number;
    editarlargo?: number;
    editarancho?: number;
    editaraltura?: number;
    editarEliminar?: boolean;
    editarCopiar?: boolean;
    editararchivo?: number;
    tieneSubmetrado?: number;
    estitulo?: number;
    editadoMetrado?: number;
    editadofila?: number;
    archivo?: any,
    estilo?: string,
    icomost?: number,
    mostrar?: number,
    id_padre?: string,
    estmost?: number,
    ind?:number
}

export class metradoModelo implements Metrado {
    constructor(
        public descripcion: string,
        public esMetrado: number,
        public item: string,
        public id_metrado: number,
        public indice?: number,
        public id_proyecto?: number,
        public editarEliminar?: boolean,
        public tieneSubmetrado?: number,
        public tieneAceros?: number,
        public estitulo?: number,
        public estilo?: string,
        public cantidad?: string,
        public n_veces?: string,
        public largo?: string,
        public ancho?: string,
        public altura?: string,
        public subtotal?: string,
        public parcial?: string,
        public editardescripcion?: number,
        public editarcantidad?: number,
        public editarn_veces?: number,
        public editarlargo?: number,
        public editarancho?: number,
        public editaraltura?: number,
        public editadoMetrado?: number,
        public editadofila?: number,
        public editarCopiar?: boolean,
        public editararchivo?: number,
        public archivo?: any,
        public icomost?: number,
        public mostrar?: number,
        public id_padre?: string,
        public estmost?: number,
        public ind?: number
    ) {
        this.id_metrado = id_metrado
        this.descripcion = (descripcion && descripcion !== undefined) ? descripcion : null
        this.item = item
        this.indice = indice
        this.id_proyecto = id_proyecto
        this.esMetrado = esMetrado
        this.editarEliminar = false
        this.editarCopiar = false
        this.tieneSubmetrado = tieneSubmetrado ? tieneSubmetrado : 0
        this.cantidad = (cantidad && cantidad !== undefined) ? cantidad : null
        this.n_veces = (n_veces && n_veces !== undefined) ? n_veces : null
        this.largo = (largo && largo !== undefined) ? largo : null
        this.ancho = (ancho && ancho !== undefined) ? ancho : null
        this.altura = (altura && altura !== undefined) ? altura : null
        this.subtotal = subtotal ? subtotal : '0'
        this.parcial = parcial ? parcial :'0'
        this.tieneAceros = tieneAceros ? tieneAceros : null
        this.estitulo = estitulo ? estitulo : 0
        this.editardescripcion = editardescripcion ? editardescripcion : null
        this.editarcantidad = editarcantidad ? editarcantidad : null
        this.editarn_veces = editarn_veces ? editarn_veces : null
        this.editarlargo = editarlargo ? editarlargo : null
        this.editarancho = editarancho ? editarancho : null
        this.editaraltura = editaraltura ? editaraltura : null
        this.editararchivo = editararchivo ? editararchivo : null
        this.editadoMetrado = editadoMetrado ? editadoMetrado : 0
        this.editadofila = editadofila ? editadofila : 0
        this.archivo = (archivo && archivo !== undefined)  ? archivo : null
        this.estilo = estilo ? estilo : ''
        this.icomost = 0
        this.mostrar = 1
        this.estmost = 1
        this.id_padre = (id_padre !== null && id_padre !== undefined) ? id_padre : null
        this.ind = ind
    }
}

export const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']