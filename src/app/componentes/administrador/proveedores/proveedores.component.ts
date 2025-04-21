import { ModalProveedoresComponent } from './modal-proveedores/modal-proveedores.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalService } from './../../../servicios/swal.service';
import { Component, HostListener, Input, OnInit, ChangeDetectorRef} from '@angular/core';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { MatTableDataSource } from '@angular/material/table';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
//import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss']
})
export class ProveedoresComponent implements OnInit {
  @Input('height') height: number = 100;
  paddingscroll = 17
  fila_sel: any
  mostrar_carga_todo = false
  buscando = false
  proveedores = [];
  departamentos = []
  busqueda = ''
  displayedColumn: string[] = ['nrodoc', 'nombre_razon', 'departamento', 'correo', 'direccion', 'telefono', 'activo', 'acciones'];
  dataSource = [];
  roleAdmin=false;
  constructor(private administradorService: AdministradorService,
    private configuracionService: ConfiguracionService,
    private modalService: NgbModal,
    private changeDetector: ChangeDetectorRef,
    private encriptadorService: EncriptadorService,
    ) { }

  async ngOnInit() {
    try {
      this.mostrar_carga_todo = true
      let roleus = this.encriptadorService.recuperarlocalstory('role');
    if(roleus?.includes('ADMINISTRADOR')){
      this.roleAdmin=true;
    }
      await this.asignarbody()
      await this.listarProveedores()
      this.mostrar_carga_todo = false
    } catch (e) {
      this.mostrar_carga_todo = false
      console.log(e);
      SwalService.error()
    }
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
    //cambiar ancho del scroll
    var element = document.getElementById('horscrollbod');
    if (element != undefined) {
      let sizeef = element.offsetWidth - element.clientWidth;
      if (this.paddingscroll != sizeef) {
        this.paddingscroll = sizeef;
      }
    }
  }
  async asignarbody() {
    var resto = 150;
    if (document.body.clientWidth <= 992 && document.body.clientWidth >= 768) {
      resto = 170;
    } else if (document.body.clientWidth <= 768) {
      resto = 200;
    }
    this.height = window.innerHeight - resto;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var resto = 150;
    if (document.body.clientWidth <= 992 && document.body.clientWidth >= 768) {
      resto = 170;
    } else if (document.body.clientWidth <= 768) {
      resto = 200;
    }
    this.height = window.innerHeight - resto;
  }
  /* applyFilterPrinc(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  } */
  limpiarfiltro() {
    this.busqueda = '';
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
  /* SyncScroll(phoneFaceId) {
    var face1 = document.getElementById("horscrollbod");
    var face2 = document.getElementById("horscrollhead");
    if (phoneFaceId == "horscrollbod") {
      face2.scrollLeft = face1.scrollLeft;
    }
    else {
      face1.scrollLeft = face2.scrollLeft;
    }
  } */
  async listarProveedores() {
    this.buscando = true
    this.proveedores = await this.administradorService.listarMantenimientoProveeores()
    this.dataSource = this.proveedores
    this.buscando = false
  }
  async listarDepartamentos() {
    this.departamentos = await this.configuracionService.Departamento()
  }
  async openModal(datos = null, editar = null, ver = null) {
    try {
      this.mostrar_carga_todo = true
      await this.listarDepartamentos()
      const modalRef = this.modalService.open(ModalProveedoresComponent, {
        size: 'md',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false//no cerrar el modal con ESC
      })
      modalRef.componentInstance.editar = editar
      modalRef.componentInstance.datos = datos
      modalRef.componentInstance.departamentos = this.departamentos
      modalRef.componentInstance.ver = ver
      this.mostrar_carga_todo = false
      const result = await modalRef.result
      if (result === 'ok') {
        // SwalService.success()
        await this.listarProveedores()
      }
    } catch (e) {
      console.log('error', e)
    }
  }
  async eliminarProveedor(row) {
    try {
      const sw = await SwalService.confirm('Estas seguro?', 'Se eliminarà el proveedor seleccionado')
      if (sw.isConfirmed) {
        this.mostrar_carga_todo = true;
        const eliminarProveedor = {
          id_proveedor: row.id_proveedor
        }
        const respuesta = await this.administradorService.eliminarProveedor(eliminarProveedor)
        this.mostrar_carga_todo = false;
        if (respuesta.id == "1") {
          SwalService.success('Correcto', respuesta.mensaje)
          await this.listarProveedores()
        }
        else {
          SwalService.error('Advertencia', respuesta.mensaje);
        }
      }
    } catch (err) {
      this.mostrar_carga_todo = false;
      SwalService.error(err)
    }
  }
}
