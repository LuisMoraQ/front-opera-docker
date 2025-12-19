import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RecursosHumanosService } from 'src/app/servicios/recursoshumanos.service';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-convocatorias',
  templateUrl: './convocatorias.component.html',
  styleUrls: ['./convocatorias.component.scss']
})
export class ConvocatoriasComponent implements OnInit {
  mostrar_carga_todo = false
  // Estados de vista
  vistaActual: 'lista' | 'detalle' | 'formulario' = 'lista';
  tituloVista: string = 'CONVOCATORIAS';

  // Data
  convocatorias: any[] = [];
  convocatoriaSeleccionada: any = null;
  detalleSeleccionado: any = null;

  // Formulario
  formPostulacion: FormGroup;
  archivoCV: File | null = null;
  mostrarErrores: boolean = false;
  constructor(private fb: FormBuilder, private RecursosHumanosService: RecursosHumanosService, private toaster: ToastrService,) {
    this.inicializarFormulario();
  }

  ngOnInit() {
    this.cargarConvocatorias();
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
        Validators.required,
        // Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)
      ]],
      mensaje: ['', [
        Validators.maxLength(500)
      ]]
    });
  }

  async cargarConvocatorias() {
    // Aquí cargas tus convocatorias desde el servicio
    // this.convocatoriaService.getConvocatorias().subscribe(data => {
    //   this.convocatorias = data;
    // });
    this.convocatorias = await this.RecursosHumanosService.listarConvocatoriasActivas()
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
        break;
    }
    this.scrollToTop();
  }

  // Funciones auxiliares (las que ya tenías)
  getEstadoConvocatoria(item: any): string {
    // Tu lógica para determinar estado
    return 'abierta';
  }

  getAreasUnicas(detalles: any[]): string {
    const areas = [...new Set(detalles.map(d => d.area_descripcion))];
    return areas.join(', ');
  }

  getTotalVacantes(detalles: any[]): number {
    return detalles.reduce((total, detalle) => total + (detalle.vacantes || 0), 0);
  }

  // Manejo de archivos
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
      this.archivoCV = file;
    } else {
      alert('Por favor sube un archivo PDF menor a 5MB');
    }
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

      console.log('agregarPostulanteConvocatoria', obj);
      const resp = await this.RecursosHumanosService.guardarPostulanteConvocatoriaPortada(obj);
      console.log('resp', resp);
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
        SwalService.error(resp[0]?.mensaje, 'El dni se encuentra registrado para la postulacion de este cargo');
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
}
