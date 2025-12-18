import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-convocatorias',
  templateUrl: './convocatorias.component.html',
  styleUrls: ['./convocatorias.component.scss']
})
export class ConvocatoriasComponent implements OnInit {
 mostrar_carga_todo = false;
  convocatorias: any[] = [];
  
  ngOnInit() {
    this.cargarConvocatorias();
  }
  
  cargarConvocatorias() {
    this.mostrar_carga_todo = true;
    
    // Aquí llamarías a tu servicio
    // Ejemplo de datos de prueba:
    this.convocatorias = [
      {
        id: 1,
        titulo: 'Ingeniero Civil para Proyecto de Infraestructura',
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-02-15',
        estado: 'abierta',
        ciudad: 'Lima',
        area: 'Construcción Civil',
        numero_cargos: 3,
        pago: 'S/. 5,000 - 7,000',
        descripcion: 'Se busca ingeniero civil con experiencia en proyectos de infraestructura vial...',
        postulantes: 24
      },
      {
        id: 2,
        titulo: 'Arquitecto para Diseño de Edificios',
        fecha_inicio: '2024-01-10',
        fecha_fin: '2024-01-31',
        estado: 'proxima',
        ciudad: 'Arequipa',
        area: 'Arquitectura',
        numero_cargos: 2,
        pago: 'S/. 4,500 - 6,000',
        descripcion: 'Arquitecto con experiencia en diseño de edificios comerciales...',
        postulantes: 15
      },
      {
        id: 3,
        titulo: 'Supervisor de Obras',
        fecha_inicio: '2023-12-01',
        fecha_fin: '2023-12-31',
        estado: 'cerrada',
        ciudad: 'Trujillo',
        area: 'Supervisión',
        numero_cargos: 1,
        pago: 'S/. 6,000 - 8,000',
        descripcion: 'Supervisor con experiencia en obras de gran envergadura...',
        postulantes: 42
      },
      {
        id: 4,
        titulo: 'Especialista en Costos y Presupuestos',
        fecha_inicio: '2024-02-01',
        fecha_fin: '2024-02-28',
        estado: 'abierta',
        ciudad: 'Lima',
        area: 'Costos',
        numero_cargos: 5,
        pago: 'S/. 5,500 - 7,500',
        descripcion: 'Especialista en elaboración de presupuestos y control de costos...',
        postulantes: 18
      }
    ];
    
    setTimeout(() => {
      this.mostrar_carga_todo = false;
    }, 1000);
  }
  
  verDetalleConvocatoria(id: number) {
    // Navegar al formulario de postulación
    console.log('Ver convocatoria:', id);
    // this.router.navigate(['/postular', id]);
  }
}
