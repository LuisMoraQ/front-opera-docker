import { SwalService } from './../../../servicios/swal.service';
import { Component, Input, OnInit,HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-agrupacion-proyectos',
  templateUrl: './agrupacion-proyectos.component.html',
  styleUrls: ['./agrupacion-proyectos.component.scss']
})
export class AgrupacionProyectosComponent implements OnInit {
  @Input() fuente=1;
  @Input('height') height: number = 100;
  busqueda = '';
  buscando: boolean = false;
  dataSource = new MatTableDataSource<any>();
  fila_sel: any;
  displayedColumn: string[] = ['descripcion', 'activo', 'acciones'];
  formAgrupacion = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    activo: new UntypedFormControl(true, [Validators.required])
  })
  editar: boolean = false;
  mostrar_carga_todo: boolean = false;
  idUsuario: any = null;
  idGrupoSeleccionado: any = null;
  actlista=false;
  get descripcion(): UntypedFormControl { return this.formAgrupacion.get('descripcion') as UntypedFormControl }
  get activo(): UntypedFormControl { return this.formAgrupacion.get('activo') as UntypedFormControl }
  estado: any
  constructor(private configuracionService: ConfiguracionService,
    private modal: NgbActiveModal,
    private toaster: ToastrService,
    private encriptadorService: EncriptadorService) { }

  async ngOnInit() {
    try {
      var resto = 391;
      this.height = window.innerHeight - resto;
      this.idUsuario = await this.encriptadorService.recuperarlocalstory('idusuario');
      await this.listaragrupaciones()
    } catch (e) {
      console.log(e);
      SwalService.error()
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 391;
      this.height = window.innerHeight - resto;
  }
  async listaragrupaciones() {
    this.buscando = true;
    this.dataSource.data = [];
    const input = {
      id_usuario: this.idUsuario,
      activo: '',
      fuente:this.fuente
    }
    this.dataSource.data = await this.configuracionService.listarGrupoProyecto(input)
    this.buscando = false;
  }

  async recuperarValores(row) {
    this.formAgrupacion.reset({
      descripcion: row.descripcion,
      activo: row.activo == 1 ? true : false
    })
    this.editar = true
    this.idGrupoSeleccionado = row.id_grupo
  }

  applyFilterPrinc(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  limpiarfiltro() {
    this.busqueda = '';
    if (this.busqueda == '')
      this.dataSource.filter = "";
  }

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }

  cambindicesel(ind: any) {
    if (ind == this.fila_sel)
      this.fila_sel = -1;
    else
      this.fila_sel = ind;
  }

  limpiarFormulario() {
    this.formAgrupacion = new UntypedFormGroup({
      descripcion: new UntypedFormControl('', [Validators.required]),
      activo: new UntypedFormControl(true, [Validators.required])
    })
    this.activo.setValue(true)
    this.editar = false
    this.idGrupoSeleccionado = null
    this.descripcion.markAsPending()
  }

  async almacenar() {
    if (this.editar) {
      await this.actualizar()
    } else {
      await this.guardar()
    }
  }

  async guardar() {
    try {
      if (this.formAgrupacion.invalid) {
        this.formAgrupacion.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true
        const inputGuardar = {
          descripcion: this.descripcion.value.toString().toUpperCase(),
          activo: this.activo.value ? 1 : 0,
          id_usuario: this.idUsuario,
          fuente:this.fuente
        }
        const response = await this.configuracionService.guardarGrupoProyecto(inputGuardar)
        this.mostrar_carga_todo = false
        if (response.id == "1") {
          this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          await this.limpiarFormulario()
          await this.listaragrupaciones()
        }
        else {
          this.toaster.error(response.mensaje, 'Error', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
          //SwalService.error('Advertencia', response.mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }

  async actualizar() {
    try {
      if (this.formAgrupacion.invalid) {
        this.formAgrupacion.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', { closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
        return
      } else {
        this.mostrar_carga_todo = true
        const inputGuardar = {
          descripcion: this.descripcion.value.toString().toUpperCase(),
          activo: this.activo.value ? 1 : 0,
          id_grupo: this.idGrupoSeleccionado
        }
        const response = await this.configuracionService.modificarGrupoProyecto(inputGuardar)
        this.mostrar_carga_todo = false
        if (response.id == "1") {
          this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          await this.limpiarFormulario()
          await this.listaragrupaciones()
          this.actlista=true;
        }
        else {
          this.toaster.error(response.mensaje, 'Error', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
          //SwalService.error('Advertencia', response.mensaje)
        }
      }
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }

  async eliminarAgrupacion(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà la agrupación seleccionada')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarInsumo = {
          id_grupo: row.id_grupo
        }
        const respuesta = await this.configuracionService.eliminarGrupoProyecto(eliminarInsumo)
        this.mostrar_carga_todo = false;
        if (respuesta.id == "0") {
          this.toaster.error(respuesta.mensaje, 'Error', {closeButton: false,positionClass: 'toast-bottom-right',timeOut: 5000 })
          //SwalService.error('Advertencia', respuesta.mensaje);
          await this.listaragrupaciones()
        }
        else {
          this.toaster.success('La operacion se realizó con éxito.', 'Correcto', { closeButton: false, positionClass: 'toast-bottom-right', timeOut: 5000 })
          await this.listaragrupaciones()
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
  closeModal(result: any = null) {
    this.modal.close({datos:this.dataSource.data,actlista:this.actlista})
  }
}
