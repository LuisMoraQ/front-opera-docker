import { PrincipalService } from './../../../servicios/principal.service';
import { PrincipalComponent } from './../../proyectos/principal/principal.component';
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import * as moment from 'moment';
// import { ToastrService } from 'ngx-toastr';
// import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
// import { SwalService } from 'src/app/servicios/swal.service';

// @Component({
//   selector: 'app-convocatorias',
//   templateUrl: './convocatorias.component.html',
//   styleUrls: ['./convocatorias.component.scss']
// })
// export class ConvocatoriasComponent implements OnInit {
//   mostrar_carga_todo = false
//   // Estados de vista
//   vistaActual: 'lista' | 'detalle' | 'formulario' = 'lista';
//   tituloVista: string = 'CONVOCATORIAS';

//   // Data
//   convocatorias: any[] = [];
//   convocatoriaSeleccionada: any = null;
//   detalleSeleccionado: any = null;

//   // Formulario
//   formPostulacion: FormGroup;
//   archivoCV: File | null = null;
//   mostrarErrores: boolean = false;
//   constructor(private fb: FormBuilder, private RecursosHumanosService: RecursosHumanosService, private toaster: ToastrService,) {
//     this.inicializarFormulario();
//   }

//   ngOnInit() {
//     this.cargarConvocatorias();
//   }

//   inicializarFormulario() {
//     this.formPostulacion = this.fb.group({
//       nombres: ['', [
//         Validators.required,
//         Validators.minLength(3),
//         Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
//       ]],
//       apellidos: ['', [
//         Validators.required,
//         Validators.minLength(3),
//         Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
//       ]],
//       dni: ['', [
//         Validators.required,
//         Validators.pattern(/^[0-9]{8}$/)
//       ]],
//       email: ['', [
//         Validators.required,
//         Validators.email
//       ]],
//       telefono: ['', [
//         Validators.required,
//         Validators.pattern(/^[0-9]{9}$/)
//       ]],
//       link_cv: ['', [
//         Validators.required,
//         // Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)
//       ]],
//       mensaje: ['', [
//         Validators.maxLength(500)
//       ]]
//     });
//   }

//   async cargarConvocatorias() {

//     this.convocatorias = await this.RecursosHumanosService.listarConvocatoriasActivas()
//     console.log('this.convocatorias', this.convocatorias)
//   }

//   // Navegación entre vistas
//   verDetalleConvocatoria(item: any) {
//     this.convocatoriaSeleccionada = item;
//     this.vistaActual = 'detalle';
//     this.tituloVista = `DETALLE: ${item.proyecto.descripcion}`;
//     this.scrollToTop();
//   }

//   irAFormularioPostulacion(detalle: any) {
//     this.detalleSeleccionado = detalle;
//     this.vistaActual = 'formulario';
//     this.tituloVista = 'POSTULACIÓN';
//     this.scrollToTop();
//   }

//   regresar() {
//     switch (this.vistaActual) {
//       case 'detalle':
//         this.vistaActual = 'lista';
//         this.tituloVista = 'CONVOCATORIAS';
//         this.convocatoriaSeleccionada = null;
//         break;
//       case 'formulario':
//         this.vistaActual = 'detalle';
//         this.tituloVista = `DETALLE: ${this.convocatoriaSeleccionada?.proyecto?.descripcion}`;
//         this.detalleSeleccionado = null;
//         this.formPostulacion.reset();
//         this.archivoCV = null;
//         break;
//     }
//     this.scrollToTop();
//   }

//   // Funciones auxiliares (las que ya tenías)
//   getEstadoConvocatoria(item: any): string {
//     // Tu lógica para determinar estado
//     return 'VIGENTE';
//   }

//   getAreasUnicas(detalles: any[]): string {
//     const areas = [...new Set(detalles.map(d => d.area_descripcion))];
//     return areas.join(', ');
//   }

//   getTotalVacantes(detalles: any[]): number {
//     return detalles.reduce((total, detalle) => total + (detalle.vacantes || 0), 0);
//   }

//   // Manejo de archivos
//   onFileSelected(event: any) {
//     const file = event.target.files[0];
//     if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
//       this.archivoCV = file;
//     } else {
//       alert('Por favor sube un archivo PDF menor a 5MB');
//     }
//   }



//   private scrollToTop() {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }

//   async enviarPostulacion() {
//     try {
//       // Marcar todos los campos como tocados
//       this.formPostulacion.markAllAsTouched();
//       this.mostrarErrores = true;

//       // Verificar si el formulario es inválido
//       if (this.formPostulacion.invalid) {
//         this.mostrar_carga_todo = false;

//         // Enfocar el primer campo con error
//         this.enfocarPrimerError();

//         this.toaster.error(
//           'Formulario incorrecto',
//           'Por favor complete todos los campos requeridos correctamente',
//           {
//             closeButton: true,
//             positionClass: 'toast-bottom-right',
//             timeOut: 5000,
//           }
//         );
//         return;
//       }

//       // Si el formulario es válido, continuar
//       this.mostrar_carga_todo = true;

//       const obj = {
//         id_proyecto: this.convocatoriaSeleccionada.proyecto.id_proyecto,
//         id_convocatoria: this.convocatoriaSeleccionada.convocatoria.id_convocatoria,
//         nombres: this.formPostulacion.get('nombres')?.value.trim(),
//         apellidos: this.formPostulacion.get('apellidos')?.value.trim(),
//         fecha: '',
//         evaluador: '',
//         id_area: this.detalleSeleccionado.id_area,
//         id_cargo: this.detalleSeleccionado.id_cargo,
//         cv: this.formPostulacion.get('link_cv')?.value,
//         entrevista: '',
//         telefono: this.formPostulacion.get('telefono')?.value.trim(),
//         correo: this.formPostulacion.get('email')?.value.trim(),
//         progreso: 0,
//         calidad: 0,
//         adicional: this.formPostulacion.get('mensaje')?.value ? this.formPostulacion.get('mensaje')?.value.trim() : '',
//         dni: this.formPostulacion.get('dni')?.value
//       };

//       console.log('agregarPostulanteConvocatoria', obj);
//       const resp = await this.RecursosHumanosService.guardarPostulanteConvocatoriaPortada(obj);
//       console.log('resp', resp);
//       if (resp[0]?.estado == "EXITO") {
//         this.formPostulacion.reset();
//         this.mostrarErrores = false;

//         this.detalleSeleccionado = null;
//         this.formPostulacion.reset();
//         SwalService.success('¡Postulación enviada!', 'Tu postulación ha sido registrada correctamente');

//         // Regresar a la vista anterior
//         this.vistaActual = 'lista';
//         this.tituloVista = 'CONVOCATORIAS';
//         this.convocatoriaSeleccionada = null;
//       } else {
//         this.mostrar_carga_todo = false;
//         SwalService.error(resp[0]?.mensaje, 'El dni se encuentra registrado para la postulacion de este cargo');
//         return
//       }

//       // Limpiar formulario y mostrar éxito


//       this.mostrar_carga_todo = false;
//     } catch (error) {
//       this.mostrar_carga_todo = false;
//       console.log(error);
//       SwalService.error('Error', 'No se pudo enviar la postulación. Intente nuevamente.');
//     }
//   }

//   // Método para enfocar el primer campo con error
//   enfocarPrimerError() {
//     const controles = [
//       'nombres', 'apellidos', 'dni', 'email',
//       'telefono', 'link_cv', 'mensaje'
//     ];

//     for (let controlName of controles) {
//       const control = this.formPostulacion.get(controlName);
//       if (control?.invalid) {
//         // Enfocar el elemento en el DOM
//         const element = document.querySelector(`[formControlName="${controlName}"]`);
//         if (element) {
//           (element as HTMLElement).focus();
//           // Hacer scroll al elemento
//           element.scrollIntoView({
//             behavior: 'smooth',
//             block: 'center'
//           });
//         }
//         break;
//       }
//     }
//   }

//   // Método para obtener el mensaje de error de un campo
//   getErrorMessage(controlName: string): string {
//     const control = this.formPostulacion.get(controlName);

//     if (!control?.errors) return '';

//     if (control.errors['required']) {
//       return 'Este campo es requerido';
//     }

//     if (control.errors['minlength']) {
//       return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
//     }

//     if (control.errors['pattern']) {
//       switch (controlName) {
//         case 'dni':
//           return 'Debe tener 8 dígitos';
//         case 'telefono':
//           return 'Debe tener 9 dígitos';
//         case 'link_cv':
//           return 'URL inválida';
//         default:
//           return 'Formato inválido';
//       }
//     }

//     if (control.errors['email']) {
//       return 'Correo electrónico inválido';
//     }

//     if (control.errors['maxlength']) {
//       return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
//     }

//     return 'Campo inválido';
//   }

//   calcularFechaFinConvocatoria(item: any): Date {
//     if (!item.convocatoria.fecha || !item.convocatoria.duracion) {
//       return null;
//     }

//     const fechaInicio = new Date(item.convocatoria.fecha);
//     const fechaFin = new Date(fechaInicio);
//     fechaFin.setDate(fechaFin.getDate() + item.convocatoria.duracion);
//     return fechaFin;
//   }

//   // Método para formatear fecha fin
//   getFechaFinConvocatoria(item: any): string {
//     const fechaFin = this.calcularFechaFinConvocatoria(item);
//     // return fechaFin ? this.datePipe.transform(fechaFin, 'dd/MM/yyyy') : 'No definida';
//     return fechaFin ? moment(fechaFin).format('DD/MM/YYYY') : 'No definida';
//   }

//   // Método para verificar si mostrar área (solo si hay 1 cargo)
//   debeMostrarArea(item: any): boolean {
//     return item.detalles && item.detalles.length === 1;
//   }

//   // Método para obtener el área (si solo hay una)
//   getAreaConvocatoria(item: any): string {
//     if (this.debeMostrarArea(item) && item.detalles[0].area_descripcion) {
//       return item.detalles[0].area_descripcion;
//     }
//     return '';
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-convocatorias',
  templateUrl: './convocatorias.component.html',
  styleUrls: ['./convocatorias.component.scss']
})
export class ConvocatoriasComponent implements OnInit {
  mostrar_carga_todo = false;

  // Estados de vista
  vistaActual: 'lista' | 'detalle' | 'formulario' = 'lista';
  tituloVista: string = 'CONVOCATORIAS';

  // Data
  convocatorias: any[] = [];
  convocatoriasFiltradas: any[] = [];
  convocatoriaSeleccionada: any = null;
  detalleSeleccionado: any = null;

  // Filtros
  filtroAnio: string = 'todos';
  filtroMes: string = 'todos';
  filtroEstadoConvocatoria: string = 'todos';
  listaAnios: number[] = [];
  listaMeses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Formulario
  formPostulacion: FormGroup;
  archivoCV: File | null = null;
  mostrarErrores: boolean = false;

  constructor(
    private fb: FormBuilder,
    private RecursosHumanosService: RecursosHumanosService,
    private PrincipalService: PrincipalService,
    private toaster: ToastrService
  ) {
    this.inicializarFormulario();
  }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      await this.listarLimitesConvocatorias()
      this.mostrar_carga_todo = false
    } catch (error) {
      this.mostrar_carga_todo = false
      console.log(error)
      SwalService.error()
    }

  }

  async listarLimitesConvocatorias() {
    const response = await this.RecursosHumanosService.listarLimitesConvocatorias()
    this.listaAnios = response
  }

  inicializarFormulario() {
    this.formPostulacion = this.fb.group({
      nombres: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      dni: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{8}$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{9}$/)
      ]],
      link_cv: ['', [
        Validators.required
      ]],
      mensaje: ['', [
        Validators.maxLength(500)
      ]]
    });
  }



  // async cargarConvocatorias() {
  //   try {
  //     this.mostrar_carga_todo = true;
  //     const obj = {
  //       anio: this.filtroAnio,
  //       mes: this.filtroMes,
  //       estado: this.filtroEstadoConvocatoria
  //     }
  //     console.log('obj', obj)
  //     let resp = await this.RecursosHumanosService.listarConvocatoriasActivas(obj);
  //     for (const element of resp) {
  //       if (element.proyecto.imagen_empresa) {
  //         const img = await this.PrincipalService.obtenerImagenProyecto2(element.proyecto.imagen_empresa)
  //         const base64 = await this.blobToBase64(blob);

  //         // 3. Asignar la imagen base64 al elemento
  //         element.proyecto.imagen_empresa_64 = base64;
  //       } else {
  //         element.proyecto.imagen_empresa_64 = null
  //       }
  //     }
  //     this.convocatorias = resp
  //     // Actualizar lista de años basada en las fechas de las convocatorias
  //     this.actualizarListaAnios();

  //     // Inicializar lista filtrada con todas las convocatorias
  //     this.convocatoriasFiltradas = [...this.convocatorias];

  //     console.log('this.convocatorias', this.convocatorias);
  //   } catch (error) {
  //     console.error('Error al cargar convocatorias:', error);
  //     this.toaster.error('Error al cargar convocatorias', 'Error', {
  //       closeButton: true,
  //       positionClass: 'toast-bottom-right',
  //       timeOut: 4000,
  //     });
  //   } finally {
  //     this.mostrar_carga_todo = false;
  //   }
  // }

  async cargarConvocatorias() {
    try {
      this.mostrar_carga_todo = true;
      const obj = {
        anio: this.filtroAnio,
        mes: this.filtroMes,
        estado: this.filtroEstadoConvocatoria
      };

      let resp = await this.RecursosHumanosService.listarConvocatoriasActivas(obj);
      // Crear promesas para cargar todas las imágenes en paralelo
      const promesas = resp.map(async (element) => {
        if (element.proyecto?.imagen_empresa) {
          try {
            const blob = await this.PrincipalService.obtenerImagenProyecto2(element.proyecto.imagen_empresa);
            const base64 = await this.blobToBase64(blob);
            return {
              ...element,
              proyecto: {
                ...element.proyecto,
                imagen_empresa_64: base64
              }
            };
          } catch (error) {
            console.error(`Error al cargar imagen ${element.proyecto.imagen_empresa}:`, error);
            return {
              ...element,
              proyecto: {
                ...element.proyecto,
                imagen_empresa_64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjgiIGZpbGw9IiNGMEYyRjQiIHN0cm9rZT0iI0QxRDVENiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KPHBhdGggZD0iTTIwIDI1SDRNNTYgMjVINDBNMjAgMzVINDRNNTYgMzVINDhNMjAgNDVINDRNNTYgNDVINDhNMzYgMjVWNDVNMTYgMTVINDhWNDVIMTZWMzVIMjBWMzFIMTZWMjVIMjBWMjFIMTZWMjFaIiBzdHJva2U9IiM2QzczN0QiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg=='
              }
            };
          }
        }
        return {
          ...element,
          proyecto: {
            ...element.proyecto,
            imagen_empresa_64: null
          }
        };
      });

      // Esperar a que todas las imágenes se carguen
      this.convocatorias = await Promise.all(promesas);
      this.actualizarListaAnios();
      this.convocatoriasFiltradas = [...this.convocatorias];

    } catch (error) {
      console.error('Error al cargar convocatorias:', error);
      this.toaster.error('Error al cargar convocatorias', 'Error', {
        closeButton: true,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    } finally {
      this.mostrar_carga_todo = false;
    }
  }
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  // Método para actualizar lista de años basada en las convocatorias reales
  actualizarListaAnios() {
    const aniosSet = new Set<number>();

    // Agregar años de todas las convocatorias
    this.convocatorias.forEach(item => {
      const anio = this.getAnioDeFecha(item.convocatoria.fecha);
      if (anio) {
        aniosSet.add(anio);
      }
    });

    // Agregar rango de años actual ±2
    const anioActual = new Date().getFullYear();
    for (let i = anioActual - 2; i <= anioActual + 2; i++) {
      aniosSet.add(i);
    }

    // Convertir a array y ordenar descendente
    this.listaAnios = Array.from(aniosSet).sort((a, b) => b - a);
  }

  // Método para obtener nombre del mes
  getNombreMes(numeroMes: string): string {
    if (numeroMes === 'todos') return 'Todos';
    const mesIndex = parseInt(numeroMes) - 1;
    return this.listaMeses[mesIndex] || 'Desconocido';
  }

  // Método para extraer año de una fecha
  getAnioDeFecha(fechaString: string): number {
    if (!fechaString) return null;
    const fecha = new Date(fechaString);
    return fecha.getFullYear();
  }

  // Método para extraer mes de una fecha
  getMesDeFecha(fechaString: string): number {
    if (!fechaString) return null;
    const fecha = new Date(fechaString);
    return fecha.getMonth() + 1; // +1 porque getMonth() devuelve 0-11
  }

  // Método principal para aplicar todos los filtros
  aplicarFiltros() {
    let convocatoriasFiltradas = [...this.convocatorias];

    // Filtro por año
    if (this.filtroAnio !== 'todos') {
      const anioFiltro = parseInt(this.filtroAnio);
      convocatoriasFiltradas = convocatoriasFiltradas.filter(item => {
        const anioConvocatoria = this.getAnioDeFecha(item.convocatoria.fecha);
        return anioConvocatoria === anioFiltro;
      });
    }

    // Filtro por mes
    if (this.filtroMes !== 'todos') {
      const mesFiltro = parseInt(this.filtroMes);
      convocatoriasFiltradas = convocatoriasFiltradas.filter(item => {
        const mesConvocatoria = this.getMesDeFecha(item.convocatoria.fecha);
        return mesConvocatoria === mesFiltro;
      });
    }

    // Filtro por estado
    if (this.filtroEstadoConvocatoria !== 'todos') {
      if (this.filtroEstadoConvocatoria === 'activas') {
        // Filtrar por convocatorias vigentes o próximas (no cerradas)
        convocatoriasFiltradas = convocatoriasFiltradas.filter(item => {
          const estado = this.getEstadoConvocatoria(item);
          return estado === 'vigente' || estado === 'proxima';
        });
      } else {
        convocatoriasFiltradas = convocatoriasFiltradas.filter(item => {
          const estado = this.getEstadoConvocatoria(item);
          return estado === this.filtroEstadoConvocatoria;
        });
      }
    }

    this.convocatoriasFiltradas = convocatoriasFiltradas;
  }

  // Método para limpiar todos los filtros
  limpiarFiltros() {
    this.filtroAnio = 'todos';
    this.filtroMes = 'todos';
    this.filtroEstadoConvocatoria = 'todos';
    this.convocatoriasFiltradas = [...this.convocatorias];
  }

  // Navegación entre vistas
  verDetalleConvocatoria(item: any) {
    this.convocatoriaSeleccionada = item;
    this.vistaActual = 'detalle';
    this.tituloVista = `DETALLE: ${item.proyecto.descripcion}`;
    this.scrollToTop();
  }

  irAFormularioPostulacion(detalle: any) {
    this.detalleSeleccionado = detalle;
    this.vistaActual = 'formulario';
    this.tituloVista = 'POSTULACIÓN';
    this.scrollToTop();
  }

  regresar() {
    switch (this.vistaActual) {
      case 'detalle':
        this.vistaActual = 'lista';
        this.tituloVista = 'CONVOCATORIAS';
        this.convocatoriaSeleccionada = null;
        break;
      case 'formulario':
        this.vistaActual = 'detalle';
        this.tituloVista = `DETALLE: ${this.convocatoriaSeleccionada?.proyecto?.descripcion}`;
        this.detalleSeleccionado = null;
        this.formPostulacion.reset();
        this.archivoCV = null;
        this.mostrarErrores = false;
        break;
    }
    this.scrollToTop();
  }

  // Métodos para determinar estado de convocatoria
  getEstadoConvocatoria(item: any): string {
    if (!item || !item.convocatoria) return 'desconocido';

    const hoy = new Date();
    const fechaInicio = new Date(item.convocatoria.fecha);
    const fechaFin = this.calcularFechaFinConvocatoria(item);

    if (!fechaInicio || !fechaFin) return 'desconocido';

    // Si la fecha actual es menor a la fecha inicio
    if (hoy < fechaInicio) {
      return 'proxima';
    }

    // Si la fecha actual está entre fecha inicio y fecha fin
    if (hoy >= fechaInicio && hoy <= fechaFin) {
      return 'vigente';
    }

    // Si la fecha actual es mayor a fecha fin
    return 'cerrada';
  }

  // Métodos para cálculos de fechas
  calcularFechaFinConvocatoria(item: any): Date {
    if (!item.convocatoria.fecha || !item.convocatoria.duracion) {
      return null;
    }

    const fechaInicio = new Date(item.convocatoria.fecha);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + item.convocatoria.duracion);
    return fechaFin;
  }

  getFechaFinConvocatoria(item: any): string {
    const fechaFin = this.calcularFechaFinConvocatoria(item);
    return fechaFin ? moment(fechaFin).format('DD/MM/YYYY') : 'No definida';
  }

  // Método para calcular días restantes
  getDiasRestantes(item: any): number {
    const fechaFin = this.calcularFechaFinConvocatoria(item);
    if (!fechaFin) return 0;

    const hoy = new Date();
    const diferencia = fechaFin.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferencia / (1000 * 3600 * 24));

    return diasRestantes > 0 ? diasRestantes : 0;
  }

  // Funciones auxiliares
  getAreasUnicas(detalles: any[]): string {
    const areas = [...new Set(detalles.map(d => d.area_descripcion))];
    return areas.join(', ');
  }

  getTotalVacantes(detalles: any[]): number {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((total, detalle) => total + (detalle.vacantes || 0), 0);
  }

  // Método para verificar si mostrar área (solo si hay 1 cargo)
  debeMostrarArea(item: any): boolean {
    return item.detalles && item.detalles.length === 1;
  }

  // Método para obtener el área (si solo hay una)
  getAreaConvocatoria(item: any): string {
    if (this.debeMostrarArea(item) && item.detalles[0].area_descripcion) {
      return item.detalles[0].area_descripcion;
    }
    return '';
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async enviarPostulacion() {
    try {
      // Marcar todos los campos como tocados
      this.formPostulacion.markAllAsTouched();
      this.mostrarErrores = true;

      // Verificar si el formulario es inválido
      if (this.formPostulacion.invalid) {
        this.mostrar_carga_todo = false;

        // Enfocar el primer campo con error
        this.enfocarPrimerError();

        this.toaster.error(
          'Formulario incorrecto',
          'Por favor complete todos los campos requeridos correctamente',
          {
            closeButton: true,
            positionClass: 'toast-bottom-right',
            timeOut: 5000,
          }
        );
        return;
      }

      // Si el formulario es válido, continuar
      this.mostrar_carga_todo = true;

      const obj = {
        id_proyecto: this.convocatoriaSeleccionada.proyecto.id_proyecto,
        id_convocatoria: this.convocatoriaSeleccionada.convocatoria.id_convocatoria,
        nombres: this.formPostulacion.get('nombres')?.value.trim(),
        apellidos: this.formPostulacion.get('apellidos')?.value.trim(),
        fecha: '',
        evaluador: '',
        id_area: this.detalleSeleccionado.id_area,
        id_cargo: this.detalleSeleccionado.id_cargo,
        cv: this.formPostulacion.get('link_cv')?.value,
        entrevista: '',
        telefono: this.formPostulacion.get('telefono')?.value.trim(),
        correo: this.formPostulacion.get('email')?.value.trim(),
        progreso: 0,
        calidad: 0,
        adicional: this.formPostulacion.get('mensaje')?.value ? this.formPostulacion.get('mensaje')?.value.trim() : '',
        dni: this.formPostulacion.get('dni')?.value
      };

      const resp = await this.RecursosHumanosService.guardarPostulanteConvocatoriaPortada(obj);
      if (resp[0]?.estado == "EXITO") {
        this.formPostulacion.reset();
        this.mostrarErrores = false;

        this.detalleSeleccionado = null;
        this.formPostulacion.reset();
        SwalService.success('¡Postulación enviada!', 'Tu postulación ha sido registrada correctamente');

        // Regresar a la vista anterior
        this.vistaActual = 'lista';
        this.tituloVista = 'CONVOCATORIAS';
        this.convocatoriaSeleccionada = null;
      } else {
        this.mostrar_carga_todo = false;
        SwalService.warning(resp[0]?.mensaje, 'El dni se encuentra registrado para la postulacion de este cargo');
        return
      }

      // Limpiar formulario y mostrar éxito


      this.mostrar_carga_todo = false;
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.log(error);
      SwalService.error('Error', 'No se pudo enviar la postulación. Intente nuevamente.');
    }
  }

  // Método para enfocar el primer campo con error
  enfocarPrimerError() {
    const controles = [
      'nombres', 'apellidos', 'dni', 'email',
      'telefono', 'link_cv', 'mensaje'
    ];

    for (let controlName of controles) {
      const control = this.formPostulacion.get(controlName);
      if (control?.invalid) {
        // Enfocar el elemento en el DOM
        const element = document.querySelector(`[formControlName="${controlName}"]`);
        if (element) {
          (element as HTMLElement).focus();
          // Hacer scroll al elemento
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
        break;
      }
    }
  }

  // Método para obtener el mensaje de error de un campo
  getErrorMessage(controlName: string): string {
    const control = this.formPostulacion.get(controlName);

    if (!control?.errors) return '';

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }

    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }

    if (control.errors['pattern']) {
      switch (controlName) {
        case 'dni':
          return 'Debe tener 8 dígitos';
        case 'telefono':
          return 'Debe tener 9 dígitos';
        case 'link_cv':
          return 'URL inválida';
        default:
          return 'Formato inválido';
      }
    }

    if (control.errors['email']) {
      return 'Correo electrónico inválido';
    }

    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  getBadgeClass(item: any): string {
    const estado = this.getEstadoConvocatoria(item);

    switch (estado) {
      case 'vigente':
        return 'badge-estado-vigente';
      case 'proxima':
        return 'badge-estado-proxima';
      case 'cerrada':
        return 'badge-estado-cerrada';
      default:
        return 'badge-estado-desconocido';
    }
  }

  onImageError(event: any) {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjgiIGZpbGw9IiNGMEYyRjQiIHN0cm9rZT0iI0QxRDVENiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KPHBhdGggZD0iTTIwIDI1SDRNNTYgMjVINDBNMjAgMzVINDRNNTYgMzVINDhNMjAgNDVINDRNNTYgNDVINDhNMzYgMjVWNDVNMTYgMTVINDhWNDVIMTZWMzVIMjBWMzFIMTZWMjVIMjBWMjFIMTZWMjFaIiBzdHJva2U9IiM2QzczN0QiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==';
    event.target.onerror = null; // Prevenir bucle infinito
  }
}
