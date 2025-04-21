import { map } from 'rxjs/operators';
import { SwalService } from './../../../../servicios/swal.service';
import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogosService } from 'src/app/servicios/catalogos.service';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/servicios/forms.service';

@Component({
  selector: 'app-asociar-catalogos',
  templateUrl: './asociar-catalogos.component.html',
  styleUrls: ['./asociar-catalogos.component.scss']
})
export class AsociarCatalogosComponent implements OnInit {
  @Input() tipoInsumos = [];
  @Input() tiposIndice = [];
  @Input() idUsuario = null;
  @Input() cantidadDisponible = null;
  busqueda = '';
  dataSource = new MatTableDataSource();
  displayedColumn: string[] = ['acciones', 'catalogo', 'insumos'];
  fila_sel = null
  zoom: number = 0.8;
  totalPages: number;
  page: number = 1;
  isLoaded: boolean = false;
  url = null
  fuentes = [{ nombre: 'SISTEMA', id: '0' },{ nombre: 'USUARIO', id: '1' }]
  fuente = 0;
  tipoInsumo = '';
  tipoIndice = '';
  buscando: boolean = false;
  seleccionados: any = []
  mostrar_carga: boolean = false;
  rowSeleccionado: any = null
  constructor(private modal: NgbActiveModal, private catalogosService: CatalogosService,
    private formsService: FormsService,
    private toaster: ToastrService) { }
  async ngOnInit() {
    try {
      await this.cambiarSelect()
    } catch (e) {
      console.log(e);
      SwalService.error
    }
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
  zoomIn() {
    if (this.zoom > 4) return;
    this.zoom = this.zoom + 0.1;
  }

  zoomOut() {
    if (this.zoom < 0.1) return;
    this.zoom = this.zoom - 0.1;
  }

  nextPage() {
    this.page += 1;
  }

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }
  previousPage() {
    this.page -= 1;
  }

  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = true;
  }

  async listaCatalogosInsumo(fuente) {
    this.buscando = true
    this.dataSource.data=[];
    const inputListar = {
      fuente: fuente,//'' si es sistema, id_usuario si no es null
      id_tipo_insumo: this.tipoInsumo,
      id_indice: this.tipoIndice
    }
    this.dataSource.data = await this.catalogosService.listarCatalogosInsumoData(inputListar)
    this.buscando = false
  }
  async cambiarSelect() {
    let fuente = null
    if (this.fuente == 1) {
      fuente = this.idUsuario
    } else {
      fuente = ''
    }
    await this.listaCatalogosInsumo(fuente)
  }
  cambioselt1(row) {
    if (row.seleccion == 0)
      row.seleccion = 1;
    else {
      row.seleccion = 0;
    }
  }

  cambindicesel(ind: any, row) {
    if (ind == this.fila_sel) {
      return
    } else {
      this.fila_sel = ind;
      this.openVisualizador(row)
    }
  }
  closeModal(result: any = null) {
    this.modal.close(result)
  }

  async agregarSeleccionados() {
    if (this.seleccionados.length == this.cantidadDisponible) {
      this.toaster.error('No se pueden agregar mas de ' + this.cantidadDisponible + ' catalogos', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 5000
      })
    } else {
      const seleccionados = this.dataSource.data.filter((data: any) => data.seleccion)
      if (seleccionados.length) {
        await seleccionados.forEach(async (checkeado: any, index) => {
          const encontrado = await this.seleccionados.find((seleccionado: any) => seleccionado.catalogo == checkeado.catalogo)
          if (!encontrado) {
            if (this.seleccionados.length < this.cantidadDisponible) {
              this.seleccionados.push(checkeado)
            }
            if (index == seleccionados.length - 1) {
              this.toaster.success('Se agregó correctamente.', 'Correcto', {
                closeButton: false,
                positionClass: 'toast-bottom-center',
                timeOut: 5000
              })
            }
          } else {
            this.toaster.error(encontrado.catalogo + ' ya seleccionado.', 'Error', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 5000
            })
          }
        })
      }
    }
    this.dataSource.data.map((catalogo: any, index) => {
      catalogo.seleccion = 0
    })
  }

  removearc(index, documento) {
    this.seleccionados.splice(index, 1)
  }

  async openVisualizador(row) {
    try {
      this.mostrar_carga = true
      this.url = null
      this.rowSeleccionado = row
      this.url = await this.formsService.recuperarPDF(row.catalogo)
      this.mostrar_carga = false
    } catch (e) {
      this.mostrar_carga = false
      SwalService.error()
      console.log(e);
    }
  }
  async asociarCatalogos() {
    if (this.seleccionados.length) {
      this.closeModal(this.seleccionados)
    } else {
      this.closeModal()
    }
  }
}
