export interface plantilla {
    id_usuario?: number,
    nom_plantilla?: string,
    item?: number,
    descripcion?: number,
    mtotal?: number,
    detalle?: number,
    cantidad?: number,
    nveces?: number,
    factor1?: number,
    factor2?: number,
    factor3?: number,
    subtotal?: number,
    otro?: number,
    gdescripcion?: number,
    gcantidad?: number,
    gfactor?: number,
    gnveces?: number,
    glongitud?: number,
    gancho?: number,
    galtura?: number,
    gsubtotal?: number,
    ddescripcion?: number,
    dcantidad?: number,
    dfactor?: number,
    dnveces?: number,
    dlongitud?: number,
    dancho?: number,
    daltura?: number,
    dsubtotal?: number,
    area?: number,
    volumen?: number,
    mparcial?: number,
    unidad?: number,
    id_plantilla?: number
}

export interface plantilla2 {
    id_usuario?: any,
    nom_plantilla?: any,
    item?: any,
    descripcion?: any,
    mtotal?: any,
    detalle?: any,
    cantidad?: any,
    nveces?: any,
    factor1?: any,
    factor2?: any,
    factor3?: any,
    subtotal?: any,
    otro?: any,
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
    id_plantilla: any
}

export class plantillaModel implements plantilla {
    constructor(
        public id_usuario?: number,
        public nom_plantilla?: string,
        public item?: number,
        public descripcion?: number,
        public mtotal?: number,
        public detalle?: number,
        public cantidad?: number,
        public nveces?: number,
        public factor1?: number,
        public factor2?: number,
        public factor3?: number,
        public subtotal?: number,
        public otro?: number,
        public gdescripcion?: number,
        public gcantidad?: number,
        public gfactor?: number,
        public gnveces?: number,
        public glongitud?: number,
        public gancho?: number,
        public galtura?: number,
        public gsubtotal?: number,
        public ddescripcion?: number,
        public dcantidad?: number,
        public dfactor?: number,
        public dnveces?: number,
        public dlongitud?: number,
        public dancho?: number,
        public daltura?: number,
        public dsubtotal?: number,
        public area?: number,
        public volumen?: number,
        public mparcial?: number,
        public unidad?: number,
        public id_plantilla?: number
    ) {
        this.id_usuario = null
        this.nom_plantilla = null
        this.item = 1
        this.descripcion = 1
        this.mtotal = 0
        this.detalle = 0
        this.cantidad = 0
        this.nveces = 0
        this.factor1 = 0
        this.factor2 = 0
        this.factor3 = 0
        this.subtotal = 0
        this.otro = 0
        this.gdescripcion = 0
        this.gcantidad = 0
        this.gfactor = 0
        this.gnveces = 0
        this.glongitud = 0
        this.gancho = 0
        this.galtura = 0
        this.gsubtotal = 0
        this.ddescripcion = 0
        this.dcantidad = 0
        this.dfactor = 0
        this.dnveces = 0
        this.dlongitud = 0
        this.dancho = 0
        this.daltura = 0
        this.dsubtotal = 0
        this.area = 0
        this.volumen = 0
        this.mparcial = 0
        this.unidad = 0
        this.id_plantilla = null
    }
}