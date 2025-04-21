import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { SwalService } from 'src/app/servicios/swal.service';

@Component({
  selector: 'app-modal-crud-clasificacion-comercial',
  templateUrl: './modal-crud-clasificacion-comercial.component.html',
  styleUrls: ['./modal-crud-clasificacion-comercial.component.scss']
})
export class ModalCrudClasificacionComercialComponent implements OnInit {
  @Input() clasiInsumos = []
  @Input() tipoInsumos = []
  clasiInsumosFiltrado = []
  tipoInsumo = ''
  clasificacionComercial = ''
  busqueda = ''
  dataSource = new MatTableDataSource<any>();
  displayedColumn: string[] = ['activo', 'abrev', 'desc_clasi', 'desc_tipo_insumo', 'acciones'];
  verCrud = false
  formClasificacionComercial = new UntypedFormGroup({
    descripcion: new UntypedFormControl('', [Validators.required]),
    abrev: new UntypedFormControl('', [Validators.required]),
    id_tipo: new UntypedFormControl('', [Validators.required]),
    activo: new UntypedFormControl(true, [])
  })
  id_user:any;
  estado: any
  buscando: boolean = false;
  editar = false
  mostrar_carga_todo = false
  clasificionSeleccionado = null
  fila_sel: any;
  get descripcion(): UntypedFormControl { return this.formClasificacionComercial.get('descripcion') as UntypedFormControl }
  get abreviatura(): UntypedFormControl { return this.formClasificacionComercial.get('abrev') as UntypedFormControl }
  get id_tipo(): UntypedFormControl { return this.formClasificacionComercial.get('id_tipo') as UntypedFormControl }
  get activo(): UntypedFormControl { return this.formClasificacionComercial.get('activo') as UntypedFormControl }
  constructor(private modal: NgbActiveModal,
    private adminservice: AdministradorService,
    private administradorService: AdministradorService,
    private encriptadorService: EncriptadorService,
    private toaster: ToastrService) { }

  async ngOnInit() {
    try {
      // this.clasiInsumosFiltrado = this.clasiInsumos
      this.id_user = this.encriptadorService.recuperarlocalstory('idusuario');
      await this.listarClasificacionInsumo()
      await this.cambioTipoInsumo()
      document.getElementById('inpbusq').focus();
      // this.dataSource.data = this.clasiInsumos;
    } catch (e) {
      SwalService.error()
    }
  }
  async seleccionarTipo(row = null) {
    if (row) {
      this.clasificionSeleccionado = row
    }
    if (!this.clasificionSeleccionado) {
      this.toaster.error('Ninguna Clasificación Comercial Seleccionada', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
      return
    } else {            
      const objeto = {
        id_tipo: this.clasificionSeleccionado.id_tipo_insumo,
        id_clasificacion: this.clasificionSeleccionado.id_clasificacion,
        clasiInsumos: this.clasiInsumos
      }
      this.closeModal(objeto)
    }
  }
  cambindicesel(ind: any, row) {
    // this.seleccionado = row
    if (row.activo == 1) {
      if (ind == this.fila_sel) {
        this.fila_sel = -1;
        this.clasificionSeleccionado = null;
      } else {
        this.fila_sel = ind;
        this.clasificionSeleccionado = row
      }
    } else {
      return
    }
  }

  async cambioTipoInsumo() {
    this.dataSource.data = []
    // this.buscando = true
    if (this.tipoInsumo) {
      this.dataSource.data = await this.clasiInsumos.filter(clasificacion => clasificacion.id_tipo_insumo == this.tipoInsumo)
    } else {
      this.dataSource.data = this.clasiInsumos;
    }
    // this.buscando = false
  }

  async recuperarData(row) {
    this.verCrud = true
    this.clasificionSeleccionado = row
    this.formClasificacionComercial.reset({
      descripcion: row?.desc_clasi,
      abrev: row?.abrev,
      id_tipo: row?.id_tipo_insumo,
      activo: row?.activo == 1 ? true : false
    })

  }

  // async guardarClasificacion() {
  //   this.verCrud = false
  // }
  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
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
  async limpiarFormulario() {
    this.verCrud = true;
    // this.formClasificacionComercial.reset({
    //   activo: true,
    //   id_tipo : ''
    // })

  }

  async cambio() {
  }

  async almacenar() {
    if (!this.clasificionSeleccionado) {
      await this.guardar()
    } else {
      await this.actualizar()
    }
  }

  async guardar() {
    try {
      if (this.formClasificacionComercial.invalid) {
        this.formClasificacionComercial.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        const dataClasificacion = {
          desc_clasi: this.descripcion.value.toUpperCase(),
          abrev: (this.abreviatura.value).trim().toUpperCase(),
          id_tipo_insumo: this.id_tipo.value,
          activo: this.activo.value == true ? 1 : 0,
        }
        this.mostrar_carga_todo = true;
        const respuesta = await this.administradorService.guardarClasiInsumosData(dataClasificacion)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == "1") {
          // this.closeModal('ok')
          SwalService.success()
          await this.listarClasificacionInsumo()
          await this.cambioTipoInsumo()
          this.verCrud = false
          this.clasificionSeleccionado = null
          this.fila_sel = null
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
      }
    } catch (e) {
      console.log(e);
      SwalService.error()
    }

  }

  async actualizar() {
    try {
      if (this.formClasificacionComercial.invalid) {
        this.formClasificacionComercial.markAllAsTouched()
        this.toaster.error('Datos incompletos', 'Error', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 5000
        })
        return
      } else {
        this.mostrar_carga_todo = true;
        const editClasificacion = {
          id_clasificacion: this.clasificionSeleccionado?.id_clasificacion,
          desc_clasi: this.descripcion.value.toUpperCase(),
          abrev: (this.abreviatura.value).trim().toUpperCase(),
          //id_tipo_insumo: this.id_tipo.value,
          activo: this.activo.value == true ? 1 : 0,
        }
        const respuesta = await this.administradorService.modificarClasiInsumosData(editClasificacion)
        this.mostrar_carga_todo = false;
        if (respuesta[0].id == "1") {
          SwalService.success()
          await this.listarClasificacionInsumo()
          await this.cambioTipoInsumo()
          this.verCrud = false
          this.clasificionSeleccionado = null
          this.fila_sel = null
        }
        else {
          SwalService.error('Advertencia', respuesta[0].mensaje)
        }
      }
    } catch (e) {
      console.log(e);
      SwalService.error()
    }
  }

  async eliminarClasificacionComercial(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminará:  ' + row.desc_clasi)
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarClasificacion = {
          id_clasificacion: row.id_clasificacion
        }
        const respuesta = await this.administradorService.eliminarClasiInsumosData(eliminarClasificacion)
        this.mostrar_carga_todo = false;
        if (respuesta.id == "1") {
          SwalService.success()
          await this.listarClasificacionInsumo()
          await this.cambioTipoInsumo()
          this.clasificionSeleccionado = null
          this.fila_sel = null
        } else {
          SwalService.error('Advertencia', respuesta.mensaje);
          // await this.listarClasificacionesComerciales()
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
  async listarClasificacionInsumo() {
    this.buscando = true
    const activo = {
      activo: '',
      id_tipo_insumo:'',
      id_usuario:this.id_user,
      fuente:''
    }
    this.clasiInsumos = await this.adminservice.listarClasiInsumosData(activo)
    this.buscando = true
  }

  closeModal(result: any = null) {
    this.modal.close(result)
  }
}
