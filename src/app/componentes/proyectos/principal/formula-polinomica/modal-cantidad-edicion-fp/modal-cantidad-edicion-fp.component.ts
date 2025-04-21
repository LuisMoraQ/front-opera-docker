import { mensaje } from './../../../../../servicios/signalrcustom.service';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from 'src/app/servicios/configuracion.service';
import { MetradoService } from 'src/app/servicios/metrado.service';
import { SwalService } from 'src/app/servicios/swal.service';
import { insumoModel } from '../formula-polinomica.component';
import { FormulaPolinomicaService } from 'src/app/servicios/formula-polinomica.service';
import { FormsService } from 'src/app/servicios/forms.service';
import { EncriptadorService } from 'src/app/servicios/encriptador.service';
import { ReportesComponent } from '../../../reportes/reportes.component';

@Component({
  selector: 'app-modal-cantidad-edicion-fp',
  templateUrl: './modal-cantidad-edicion-fp.component.html',
  styleUrls: ['./modal-cantidad-edicion-fp.component.scss'],
})
export class ModalCantidadEdicionFpComponent implements OnInit {
  @Input() idProyecto = null;
  @Input() moneda = null;
  mostrar_carga_todo = false;
  buscando2 = false;
  tabSeleccionado = 1;
  @Input() listaInsumos: insumoModel[] = [];
  @Input() disabAcciones: boolean = false;
  @Input() tablasInsXProy = null;
  @Input() datosproy = null;
  @Input() solover = false
  listaIndicesUnificados = [];
  titulos = [];
  tituloSeleccionado: any = null;
  indUniSeleccionado = null;
  indTipIns = null;
  displayBasic2: boolean;
  busqueda = '';
  arrayBusqueda = ['descripcion', 'desc_indice'];

  datasourcePri: any;
  datasourcePriacu: any;
  datasourcePrisub: any;
  dec_metrado = 2;
  mask_metrado = '0.2';
  dec_precio = 2;
  mask_precio = '0.2';
  dec_parcial = 2;
  mask_parcial = '0.2';

  actualizarPrincipal = false;
  filaSelect = null;
  constructor(
    public configuracionService: ConfiguracionService,
    private modal: NgbActiveModal,
    public formService: FormsService,
    private encriptadorService: EncriptadorService,
    public formulaPolinomicaService: FormulaPolinomicaService,
    public metradoService: MetradoService,
    private modalService: NgbModal,
    private toaster: ToastrService
  ) {}

  async ngOnInit() {
    try {
      this.buscando2 = true;
      await this.listarIndicesUnificados();
      this.buscando2 = false;
    } catch (error) {
      console.log(error);
      this.buscando2 = false;
    }
  }

  closeModal(result: any = null) {
    this.listaInsumos.sort((a, b) => a.ind2 - b.ind2);
    const obj = {
      actualizar: this.actualizarPrincipal,
      insumos: this.listaInsumos,
    };
    this.modal.close(obj);
  }

  quitarfoco(element: any) {
    //quitar foco del boton
    element.target.blur();
    element.target.parentElement.blur();
  }

  async listarIndicesUnificados() {
    try {
      this.listaIndicesUnificados = [];
      this.listaIndicesUnificados =
        await this.configuracionService.listarIndiceUnificados();
    } catch (e) {
      SwalService.error();
    }
  }

  async restaurarEditadosIU(idx = null) {
    const cambios = await this.listaInsumos.find((ele) => ele.nuevo_indice);
    if (cambios) {
      if (idx == null) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          null,
          'Se descartará todos los cambios realizados en indices unificados.'
        );
        if (sw.isConfirmed) {
          for (const row of this.listaInsumos) {
            row.nuevo_indice = null;
          }
        }
      } else {
        this.listaInsumos[idx].nuevo_indice = null;
      }
      this.filaSelect = null;
    } else {
      this.toaster.info('Ninguna cambio realizado', null, {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    }
  }

  async verificarAsignados() {
    const encontrados = await this.listaInsumos.filter((ele) => ele.sel_mult);
    if (encontrados.length) {
      for (let row of this.listaInsumos) {
        if (row.sel_mult) {
          row.nuevo_indice = this.indUniSeleccionado;
          row.sel_mult = false;
        }
      }
      this.indUniSeleccionado = null;
      this.toaster.success('Se cambio correctamente', 'Correcto', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 2000,
      });
      // this.displayBasic2 = false
    } else {
      this.toaster.error('Ninguna fila seleccionada', 'Error', {
        closeButton: false,
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
      });
    }
  }

  async cerrarModal() {
    this.indTipIns = null;
    this.indUniSeleccionado = null;
    for (let row of this.listaInsumos) {
      if (row.sel_mult) {
        row.sel_mult = false;
      }
    }
  }

  toggleOnEdicionUI(idx) {
    this.listaInsumos[idx].icomost = 1;
    for (let i = idx + 1; i < this.listaInsumos.length; i++) {
      if (this.listaInsumos[i].unidad !== '') {
        this.listaInsumos[i].mostrar = 1;
      } else {
        break;
      }
    }
  }

  toggleOffEdicionUI(idx) {
    this.listaInsumos[idx].icomost = 0;
    for (let i = idx + 1; i < this.listaInsumos.length; i++) {
      if (this.listaInsumos[i].unidad !== '') {
        this.listaInsumos[i].mostrar = 0;
      } else {
        break;
      }
    }
  }

  maxtodoEdicionUI() {
    for (let i = 0; i < this.listaInsumos.length; i++) {
      if (this.listaInsumos[i].unidad !== '') {
        this.listaInsumos[i].mostrar = 1;
      } else {
        this.listaInsumos[i].icomost = 1;
      }
    }
  }

  mintodoEdicionUI() {
    for (let i = 0; i < this.listaInsumos.length; i++) {
      if (this.listaInsumos[i].unidad !== '') {
        this.listaInsumos[i].mostrar = 0;
      } else {
        this.listaInsumos[i].icomost = 0;
      }
    }
  }

  async activarindTipIns(id_tipo_insumo, idx, tablaCompleta = false) {
    if (!tablaCompleta) {
      this.indTipIns = id_tipo_insumo;
      await this.toggleOnEdicionUI(idx);
    } else {
      this.maxtodoEdicionUI();
      this.indTipIns = -1;
    }
    this.displayBasic2 = true;
  }

  async cambioMultiple(event, idx) {
    this.listaInsumos[idx].sel_mult = event;
  }

  async guardarCambiosPrincipal() {
    try {
      this.displayBasic2 = false;
      const encontrados = await this.listaInsumos.filter(
        (ele) => ele.nuevo_indice !== null
      );
      if (encontrados.length) {
        const sw = await SwalService.confirm(
          'Estas seguro?',
          null,
          'Se guardara todos los cambios realizados.'
        );
        if (sw.isConfirmed) {
          this.mostrar_carga_todo = true;
          for (const row of encontrados) {
            row.id_indice = row.nuevo_indice.id_indice;
            this.listaInsumos[row.ind].id_indice = row.nuevo_indice.id_indice;
            this.listaInsumos[row.ind].desc_indice =
              row.nuevo_indice.desc_indice;
          }
          const datos1 = JSON.stringify(encontrados);
          const datos2 = JSON.stringify(this.tablasInsXProy[1]);
          const datos3 = JSON.stringify(this.tablasInsXProy[2]);
          const obj = JSON.stringify({
            id_proyecto: this.idProyecto,
            datos1: datos1,
            datos2: datos2,
            datos3: datos3,
          });
          const response =
            await this.formulaPolinomicaService.modificarIndiceInsumoRelacionInsumos(
              obj
            );
          if (response.id == '1') {
            this.listaInsumos = await this.listaInsumos.map((ele) => {
              ele.nuevo_indice = null;
              return ele;
            });
            this.mostrar_carga_todo = false;
            this.actualizarPrincipal = true;
            this.toaster.success('Se guardo correctamente', 'Ëxito', {
              closeButton: false,
              positionClass: 'toast-bottom-right',
              timeOut: 4000,
            });
          } else {
            this.mostrar_carga_todo = false;
            SwalService.error('Error', response.mensaje);
          }
        }
      } else {
        this.toaster.info('Ningun cambio realizado', '', {
          closeButton: false,
          positionClass: 'toast-bottom-right',
          timeOut: 4000,
        });
      }
    } catch (error) {
      this.mostrar_carga_todo = false;
      console.log();
      SwalService.error();
    }
  }

  async ordenarDescendente(idx, tipo) {
    const grupo = [];
    for (let i = idx + 1; i < this.listaInsumos.length; i++) {
      if (this.listaInsumos[i].unidad !== '') {
        grupo.push(this.listaInsumos[i]);
      } else {
        break;
      }
    }
    if (grupo.length) {
      grupo.sort((a, b) => {
        if (tipo == 'indUni') {
          if (a.desc_indice < b.desc_indice) {
            return 1;
          }
          if (a.desc_indice > b.desc_indice) {
            return -1;
          }
        } else {
          if (a.descripcion < b.descripcion) {
            return 1;
          }
          if (a.descripcion > b.descripcion) {
            return -1;
          }
        }

        return 0;
      });
      let j = 0;
      for (let i = idx + 1; i < this.listaInsumos.length; i++) {
        if (this.listaInsumos[i].unidad !== '') {
          this.listaInsumos[i] = grupo[j];
          j++;
        } else {
          break;
        }
      }
    }
    this.listaInsumos = await this.listaInsumos.map((ele, index) => {
      ele.ind = index;
      return ele;
    });
  }
  async ordenarAscendente(idx, tipo) {
    const grupo = [];
    for (let i = idx + 1; i < this.listaInsumos.length; i++) {
      if (this.listaInsumos[i].unidad !== '') {
        grupo.push(this.listaInsumos[i]);
      } else {
        break;
      }
    }
    if (grupo.length) {
      grupo.sort((a, b) => {
        if (tipo == 'indUni') {
          if (a.desc_indice < b.desc_indice) {
            return -1;
          }
          if (a.desc_indice > b.desc_indice) {
            return 1;
          }
        } else {
          if (a.descripcion < b.descripcion) {
            return -1;
          }
          if (a.descripcion > b.descripcion) {
            return 1;
          }
        }
        return 0;
      });
      let j = 0;
      for (let i = idx + 1; i < this.listaInsumos.length; i++) {
        if (this.listaInsumos[i].unidad !== '') {
          this.listaInsumos[i] = grupo[j];
          j++;
        } else {
          break;
        }
      }
    }
    this.listaInsumos = await this.listaInsumos.map((ele, index) => {
      ele.ind = index;
      return ele;
    });
  }

  async reporteIndicesUnificados() {
    try {
      this.mostrar_carga_todo = false;
      let tabla = [];
      let arrayHeader = [
        'N°',
        'DESCRIPCION',
        'UND',
        'PRECIO',
        'PARCIAL',
        'INDICE UNIFICADO',
      ];
      let keys_body = ['ind','descripcion', 'unidad', 'precio', 'parcial', 'indice_unificado'];
      let col_alig = ['center', 'left', 'center', 'right', 'right', 'left'];
      const fuentes = ['#ae5229', '#00bcd4', '#A96EFC'];
      const fuenteText = ['SISTEMA', 'USUARIO', 'IMPORTADO'];
      let i = 0
      for (const row of this.listaInsumos) {        
        const obj = {
          ind: i,
          descripcion: row.descripcion,
          unidad: row.unidad ? row.unidad: '',
          precio: row.unidad ? row.precio: '',
          parcial: row.unidad ? row.parcial : '',
          tipoletra: row.unidad ? '' : '3',
          fuente: '',
          indice_unificado: row.unidad ? row.id_indice + ' - ' + row.desc_indice : '',
          color: '',
          fondo: row.unidad ? '': '#dddddd',
        };        
        tabla.push(obj)
        i++
      }
      const datos = {
        datos_proyecto: this.datosproy,
        header: arrayHeader,
        keys_body: keys_body,
        col_alig: col_alig,
        tabla: tabla,
        concat_tabla2: false,
        tipo_reporte: 5,
        orientacion: '',
        moneda: this.moneda, // condicionar
        titulo: 'INDICES UNIFICADOS',
      };
      const modalRef = this.modalService.open(ReportesComponent, {
        size: 'lg modalgrande',
        backdrop: 'static',
        windowClass: 'pcoded',
        keyboard: false,
      });
      modalRef.componentInstance.datos = datos;
      const result = await modalRef.result;
    } catch (error) {
      this.mostrar_carga_todo = false;
      SwalService.error();
      console.log(error);
    }
  }
}
