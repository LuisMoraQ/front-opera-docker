// export const itemsMenu = [
//     {
//         "id": 1,
//         "name": "Configuracion General",
//         "position": 1,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "icaspec1.png",
//         "verImagen":true
//     },
//     {
//         "id": 2,
//         "name": "Data del Proyecto",
//         "position": 2,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "icpresu1.png",
//         "verImagen":true
//     },
//     {
//         "id": 3,
//         "name": "Registro de Actividades",
//         "position": 3,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "icpresind1.png",
//         "verImagen":true
//     },
//     {
//         "id": 4,
//         "name": "Registro de Metrados",
//         "position": 4,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "",
//         "verImagen":true
//     },
//     {
//         "id": 5,
//         "name": "Registro Financiero",
//         "position": 5,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "",
//         "verImagen":true
//     },
//     {
//         "id": 6,
//         "name": "Procura y Logistica",
//         "position": 6,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "icmetra1.png",
//         "verImagen":true
//     },
//     {
//         "id": 7,
//         "name": "Abastecimiento",
//         "position": 7,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "icmetra1.png",
//         "verImagen":true
//     },
//     {
//         "id": 8,
//         "name": "Movimiento Almacen",
//         "position": 8,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "icformula1.png",
//         "verImagen":true
//     },
//     {
//         "id": 9,
//         "name": "Equipos y Herramientas",
//         "position": 9,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "ictiempro1.png",
//         "verImagen":true
//     },
//     {
//         "id": 10,
//         "name": "Recursos Humanos",
//         "position": 10,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "icprogra1.png",
//         "verImagen":true
//     },
//     {
//         "id": 11,
//         "name": "Cuaderno de Obra",
//         "position": 11,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "icespe1.png",
//         "verImagen":true
//     } ,
//     {
//         "id": 12,
//         "name": "Informes y Reportes",
//         "position": 12,
//         "icon": "fa fa-2x fa-building",
//         "imagen": "icespe1.png",
//         "verImagen":true
//     }
// ]

export const menuAgrupado = [
  {
    titulo: 'DATA GENERAL',
    items: [
      { id: 1, name: "Configuracion General", icon: "fa fa-building", imagen: "icaspec1.png", verImagen: true },
      { id: 2, name: "Data del Proyecto", icon: "fa fa-building", imagen: "icpresu1.png", verImagen: true }
    ]
  },
  {
    titulo: 'RECURSOS HUMANOS',
    items: [
      { id: 10, name: "Configuracion RR.HH", icon: "fa fa-building", imagen: "icprogra1.png", verImagen: true },
      { id: 13, name: "Planilla RR.HH", icon: "fa fa-building", imagen: "icprogra1.png", verImagen: true },
      { id: 14, name: "Registro de asistencia", icon: "fa fa-building", imagen: "icprogra1.png", verImagen: true }
    ]
  },
  {
    titulo: 'PROCURA PROYECTO',
    items: [
      { id: 6, name: "Procura y Logistica", icon: "fa fa-building", imagen: "icmetra1.png", verImagen: true },
      { id: 7, name: "Abastecimiento", icon: "fa fa-building", imagen: "icmetra1.png", verImagen: true }
    ]
  },
  {
    titulo: 'ALMACEN DE OBRA',
    items: [
      { id: 8, name: "Movimiento Almacen", icon: "fa fa-building", imagen: "icformula1.png", verImagen: true }
    ]
  },
  {
    titulo: 'EQUIPO MECANICO',
    items: [
      { id: 9, name: "Equipos y Herramientas", icon: "fa fa-building", imagen: "ictiempro1.png", verImagen: true }
    ]
  },
  {
    titulo: 'REGISTRO EJECUCION',
    items: [
      { id: 4, name: "Registro de Metrados", icon: "fa fa-building", imagen: "", verImagen: true },
      { id: 3, name: "Registro de Actividades", icon: "fa fa-building", imagen: "icpresind1.png", verImagen: true },
      { id: 11, name: "Cuaderno de Obra", icon: "fa fa-building", imagen: "icespe1.png", verImagen: true }
    ]
  },
  {
    titulo: 'REPORTES INFORMES',
    items: [
      { id: 12, name: "Informes y Reportes", icon: "fa fa-building", imagen: "icespe1.png", verImagen: true }
    ]
  }
];