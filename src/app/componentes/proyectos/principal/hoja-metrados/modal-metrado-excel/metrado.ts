
export const arraygcols = ['gdescripcion', 'gcantidad', 'gfactor', 'gnveces', 'glongitud', 'gancho', 'galtura', 'gsubtotal']
export const arraydcols = ['ddescripcion', 'dcantidad', 'dfactor', 'dnveces', 'dlongitud', 'dancho', 'daltura', 'dsubtotal']
export const arrayicols = ['item', 'descripcion', 'mtotal', 'detalle', 'cantidad', 'nveces', 'factor1', 'factor2', 'factor3','subtotal','otro','area', 'volumen', 'mparcial', 'unidad']


export interface hojaFormat {
    tabla: any,
    id_usuario: any,
    id_proyecto: any,
    id_planilla: any,
    item_inicio: any,
    indice_partida: any
}

export interface metrado {
    item?: any,
    descripcion?: any,
    mtotal?: any,
    detalle?: any,
    cantidad?: any,
    nveces?: any,
    factor1?: any,
    factor2?: any,
    gdescripcion?: any,
    gcantidad?: any,
    gfactor?: any,
    gnveces?: any,
    glongitud?: any,
    gancho?: any,
    galtura?: any,
    gsubtotal?: any,
    ddescripcion?: any,
    dcantidad?: any,
    dfactor?: any,
    dnveces?: any,
    dlongitud?: any,
    dancho?: any,
    daltura?: any,
    dsubtotal?: any,
    area?: any,
    volumen?: any,
    mparcial?: any,
    unidad?: any,
    existePresu?: number
    partida_ref?: any,
    tipoError?: number,
    id_metrado?: number,
    indiceParentesco?: number,
    tipo?: number,
    esMetrado?: number,
    id_hoja?: number,
    nom_hoja?: string,
    indice_fila?: number,
    ind_titulo?: number,
    icomost?: number,
    mostrar?: number,
    estmost?: number,
    arrayIguales?: any,
    arrayIndIguales?: any
}
export class metradoModel implements metrado {
    constructor(
        public item?: any,
        public descripcion?: any,
        public unidad?: any,
        public id_metrado?: number,
        public esMetrado?: number,
        public tipo?: number,
        public id_hoja?: number,
        public nom_hoja?: string,
        public indice_fila?: number,
        public ind_titulo?: number,
        public mtotal?: any,
        public detalle?: any,
        public cantidad?: any,
        public nveces?: any,
        public factor1?: any,
        public factor2?: any,
        public gdescripcion?: any,
        public gcantidad?: any,
        public gfactor?: any,
        public gnveces?: any,
        public glongitud?: any,
        public gancho?: any,
        public galtura?: any,
        public gsubtotal?: any,
        public ddescripcion?: any,
        public dcantidad?: any,
        public dfactor?: any,
        public dnveces?: any,
        public dlongitud?: any,
        public dancho?: any,
        public daltura?: any,
        public dsubtotal?: any,
        public area?: any,
        public volumen?: any,
        public mparcial?: any,
        public existePresu?: number,
        public partida_ref?: any,
        public tipoError?: number,
        public indiceParentesco?: number,
        public mostrar?: number,
        public icomost?: number,
        public estmost?: number,
        public arrayIguales?: any,
        public arrayIndIguales?: any
    ) {
        this.item = (item !== null && item !== undefined) ? item : null
        this.descripcion = (descripcion !== null && descripcion !== undefined) ? descripcion : null
        this.mtotal = (mtotal !== null && mtotal !== undefined) ? mtotal : null
        this.detalle = (detalle !== null && detalle !== undefined) ? detalle : null
        this.cantidad = (cantidad !== null && cantidad !== undefined) ? cantidad : null
        this.nveces = (nveces !== null && nveces !== undefined) ? nveces : null
        this.factor1 = (factor1 !== null && factor1 !== undefined) ? factor1 : null
        this.factor2 = (factor2 !== null && factor2 !== undefined) ? factor2 : null
        this.gdescripcion = (gdescripcion !== null && gdescripcion !== undefined) ? gdescripcion : null
        this.gcantidad = (gcantidad !== null && gcantidad !== undefined) ? gcantidad : null
        this.gfactor = (gfactor !== null && gfactor !== undefined) ? gfactor : null
        this.gnveces = (gnveces !== null && gnveces !== undefined) ? gnveces : null
        this.glongitud = (glongitud !== null && glongitud !== undefined) ? glongitud : null
        this.gancho = (gancho !== null && gancho !== undefined) ? gancho : null
        this.galtura = (galtura !== null && galtura !== undefined) ? galtura : null
        this.gsubtotal = (gsubtotal !== null && gsubtotal !== undefined) ? gsubtotal : null
        this.ddescripcion = (ddescripcion !== null && ddescripcion !== undefined) ? ddescripcion : null
        this.dcantidad = (dcantidad !== null && dcantidad !== undefined) ? dcantidad : null
        this.dfactor = (dfactor !== null && dfactor !== undefined) ? dfactor : null
        this.dnveces = (dnveces !== null && dnveces !== undefined) ? dnveces : null
        this.dlongitud = (dlongitud !== null && dlongitud !== undefined) ? dlongitud : null
        this.dancho = (dancho !== null && dancho !== undefined) ? dancho : null
        this.daltura = (daltura !== null && daltura !== undefined) ? daltura : null
        this.dsubtotal = (dsubtotal !== null && dsubtotal !== undefined) ? dsubtotal : null
        this.area = (area !== null && area !== undefined) ? area : null
        this.volumen = (volumen !== null && volumen !== undefined) ? volumen : null
        this.mparcial = (mparcial !== null && mparcial !== undefined) ? mparcial : null
        this.unidad = (unidad !== null && unidad !== undefined) ? unidad : null
        this.existePresu = (existePresu !== null && existePresu !== undefined) ? existePresu : null
        this.partida_ref = (partida_ref !== null && partida_ref !== undefined) ? partida_ref : null
        this.tipoError = (tipoError !== null && tipoError !== undefined) ? tipoError : null
        this.id_metrado = (id_metrado !== null && id_metrado !== undefined) ? id_metrado : null
        this.indiceParentesco = (indiceParentesco !== null && indiceParentesco !== undefined) ? indiceParentesco : null
        this.tipo = (tipo !== null && tipo !== undefined) ? tipo : null
        this.esMetrado = (esMetrado !== null && esMetrado !== undefined) ? esMetrado : null
        this.id_hoja = (id_hoja !== null && id_hoja !== undefined) ? id_hoja : null
        this.nom_hoja = (nom_hoja !== null && nom_hoja !== undefined) ? nom_hoja : null
        this.indice_fila = (indice_fila !== null && indice_fila !== undefined) ? indice_fila : null
        this.ind_titulo = (ind_titulo !== null && ind_titulo !== undefined) ? ind_titulo : null
        this.icomost = 0
        this.mostrar = 1
        this.estmost = 1
        this.arrayIguales = null
        this.arrayIndIguales = null
    }
}