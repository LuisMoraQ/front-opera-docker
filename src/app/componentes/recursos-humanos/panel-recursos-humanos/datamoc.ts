export const presupuestoData = [
  // Grupo 1 - Principal (sin rubro)
  { item: '1', descripcion: 'Planilla Personal Técnico', rubro: null, exped_tec_presu: 200000, dias_progra: 30, ejecucion_presu: 150000, eje_dias: 25, variacion_presu: 50000, variacion_dias: 5, porcentaje: 6.5, estado: 0, mostrar: 1, icomost: 0, nivel: 0 },
  
  // Hijos del Grupo 1
  { item: 'P-01', descripcion: 'Mano de Obra Calificada', rubro: 'MO', exped_tec_presu: 180000, dias_progra: 28, ejecucion_presu: 160000, eje_dias: 22, variacion_presu: 20000, variacion_dias: 6, porcentaje: 8.2, estado: 1, mostrar: 1, icomost: 1, nivel: 1 },
  { item: 'P-02', descripcion: 'Materiales de Construcción', rubro: 'MAT', exped_tec_presu: 500000, dias_progra: 45, ejecucion_presu: 450000, eje_dias: 40, variacion_presu: 50000, variacion_dias: 5, porcentaje: 10.0, estado: 0, mostrar: 1, icomost: 0, nivel: 1 },
  { item: 'P-03', descripcion: 'Equipos y Maquinaria', rubro: 'EQ', exped_tec_presu: 350000, dias_progra: 35, ejecucion_presu: 300000, eje_dias: 30, variacion_presu: 50000, variacion_dias: 5, porcentaje: 14.3, estado: 1, mostrar: 1, icomost: 1, nivel: 1 },
  { item: 'P-04', descripcion: 'Servicios de Consultoría', rubro: 'SC', exped_tec_presu: 120000, dias_progra: 25, ejecucion_presu: 100000, eje_dias: 20, variacion_presu: 20000, variacion_dias: 5, porcentaje: 16.7, estado: 0, mostrar: 1, icomost: 0, nivel: 1 },
  
  // Grupo 2 - Principal (sin rubro)
  { item: '2', descripcion: 'Instalaciones Especiales', rubro: null, exped_tec_presu: 320000, dias_progra: 40, ejecucion_presu: 280000, eje_dias: 35, variacion_presu: 40000, variacion_dias: 5, porcentaje: 12.5, estado: 1, mostrar: 1, icomost: 1, nivel: 0 },
  
  // Hijos del Grupo 2
  { item: 'P-05', descripcion: 'Instalaciones Eléctricas', rubro: 'IE', exped_tec_presu: 280000, dias_progra: 32, ejecucion_presu: 250000, eje_dias: 28, variacion_presu: 30000, variacion_dias: 4, porcentaje: 10.7, estado: 1, mostrar: 1, icomost: 1, nivel: 1 },
  { item: 'P-06', descripcion: 'Instalaciones Sanitarias', rubro: 'IS', exped_tec_presu: 220000, dias_progra: 30, ejecucion_presu: 180000, eje_dias: 25, variacion_presu: 40000, variacion_dias: 5, porcentaje: 18.2, estado: 0, mostrar: 1, icomost: 0, nivel: 1 },
  { item: 'P-07', descripcion: 'Sistema Contra Incendios', rubro: 'SCI', exped_tec_presu: 190000, dias_progra: 26, ejecucion_presu: 160000, eje_dias: 22, variacion_presu: 30000, variacion_dias: 4, porcentaje: 15.8, estado: 0, mostrar: 1, icomost: 0, nivel: 1 },
  
  // Grupo 3 - Principal (sin rubro)
  { item: '3', descripcion: 'Estructuras y Cimentaciones', rubro: null, exped_tec_presu: 410000, dias_progra: 38, ejecucion_presu: 350000, eje_dias: 32, variacion_presu: 60000, variacion_dias: 6, porcentaje: 14.6, estado: 0, mostrar: 1, icomost: 0, nivel: 0 },
  
  // Hijos del Grupo 3
  { item: 'P-08', descripcion: 'Estructuras Metálicas', rubro: 'EM', exped_tec_presu: 410000, dias_progra: 38, ejecucion_presu: 350000, eje_dias: 32, variacion_presu: 60000, variacion_dias: 6, porcentaje: 14.6, estado: 0, mostrar: 1, icomost: 0, nivel: 1 },
  { item: 'P-09', descripcion: 'Cimentaciones', rubro: 'CIM', exped_tec_presu: 380000, dias_progra: 42, ejecucion_presu: 320000, eje_dias: 36, variacion_presu: 60000, variacion_dias: 6, porcentaje: 15.8, estado: 1, mostrar: 1, icomost: 1, nivel: 1 },
  { item: 'P-10', descripcion: 'Pavimentos y Vías', rubro: 'PV', exped_tec_presu: 290000, dias_progra: 33, ejecucion_presu: 240000, eje_dias: 28, variacion_presu: 50000, variacion_dias: 5, porcentaje: 17.2, estado: 0, mostrar: 1, icomost: 0, nivel: 1 },
  
  // Grupo 4 - Principal (sin rubro)
  { item: '4', descripcion: 'Acabados y Complementos', rubro: null, exped_tec_presu: 170000, dias_progra: 24, ejecucion_presu: 140000, eje_dias: 20, variacion_presu: 30000, variacion_dias: 4, porcentaje: 17.6, estado: 0, mostrar: 1, icomost: 0, nivel: 0 },
  
  // Hijos del Grupo 4
  { item: 'P-11', descripcion: 'Acabados y Terminaciones', rubro: 'AT', exped_tec_presu: 320000, dias_progra: 40, ejecucion_presu: 280000, eje_dias: 35, variacion_presu: 40000, variacion_dias: 5, porcentaje: 12.5, estado: 1, mostrar: 1, icomost: 1, nivel: 1 },
  { item: 'P-12', descripcion: 'Landscaping y Áreas Verdes', rubro: 'LAV', exped_tec_presu: 150000, dias_progra: 22, ejecucion_presu: 120000, eje_dias: 18, variacion_presu: 30000, variacion_dias: 4, porcentaje: 20.0, estado: 1, mostrar: 1, icomost: 1, nivel: 1 },
  { item: 'P-13', descripcion: 'Mobiliario y Equipamiento', rubro: 'ME', exped_tec_presu: 170000, dias_progra: 24, ejecucion_presu: 140000, eje_dias: 20, variacion_presu: 30000, variacion_dias: 4, porcentaje: 17.6, estado: 0, mostrar: 1, icomost: 0, nivel: 1 },
  { item: 'P-14', descripcion: 'Señalización y Seguridad', rubro: 'SS', exped_tec_presu: 130000, dias_progra: 20, ejecucion_presu: 110000, eje_dias: 17, variacion_presu: 20000, variacion_dias: 3, porcentaje: 15.4, estado: 1, mostrar: 1, icomost: 1, nivel: 1 },
  
  // Grupo 5 - Principal (sin rubro)
  { item: '5', descripcion: 'Gestión y Control', rubro: null, exped_tec_presu: 80000, dias_progra: 16, ejecucion_presu: 65000, eje_dias: 13, variacion_presu: 15000, variacion_dias: 3, porcentaje: 18.8, estado: 0, mostrar: 1, icomost: 0, nivel: 0 },
  
  // Hijos del Grupo 5
  { item: 'P-15', descripcion: 'Control de Calidad', rubro: 'CC', exped_tec_presu: 90000, dias_progra: 18, ejecucion_presu: 75000, eje_dias: 15, variacion_presu: 15000, variacion_dias: 3, porcentaje: 16.7, estado: 0, mostrar: 1, icomost: 0, nivel: 1 },
  { item: 'P-16', descripcion: 'Gestión de Residuos', rubro: 'GR', exped_tec_presu: 110000, dias_progra: 21, ejecucion_presu: 90000, eje_dias: 18, variacion_presu: 20000, variacion_dias: 3, porcentaje: 18.2, estado: 1, mostrar: 1, icomost: 1, nivel: 1 },
  { item: 'P-17', descripcion: 'Seguridad y Salud', rubro: 'SSO', exped_tec_presu: 80000, dias_progra: 16, ejecucion_presu: 65000, eje_dias: 13, variacion_presu: 15000, variacion_dias: 3, porcentaje: 18.8, estado: 0, mostrar: 1, icomost: 0, nivel: 1 },
  { item: 'P-18', descripcion: 'Imprevistos y Contingencias', rubro: 'IC', exped_tec_presu: 250000, dias_progra: 50, ejecucion_presu: 200000, eje_dias: 40, variacion_presu: 50000, variacion_dias: 10, porcentaje: 20.0, estado: 1, mostrar: 1, icomost: 1, nivel: 1 }
];