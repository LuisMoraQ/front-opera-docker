import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AdministradorRoutingModule } from './administrador-routing.module';
import { TipouserComponent } from '../administrador/tipouser/tipouser.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { ToastyModule } from 'ng2-toasty';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { MatTreeModule } from '@angular/material/tree';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DetalleinsumoComponent } from './detalleinsumo/detalleinsumo.component';
import { TipoInsumoComponent } from './detalleinsumo/tipo-insumo/tipo-insumo.component';
import { IndiceUnificadoComponent } from './detalleinsumo/indice-unificado/indice-unificado.component';
import { ModalTipoInsumoComponent } from './detalleinsumo/modal-tipo-insumo/modal-tipo-insumo.component';
import { ModalIndiceUnificadoComponent } from './detalleinsumo/modal-indice-unificado/modal-indice-unificado.component'
import { AnchocolModule } from '../../directivas/anchocol.module';
import { PintarfilapreModule } from 'src/app/directivas/pintarfilapre.module';
import { DatainsumoComponent } from './datainsumo/datainsumo.component';
import { ModalDataInsumoComponent } from './datainsumo/modal-data-insumo/modal-data-insumo.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ModalIndiceListaComponent } from './datainsumo/modal-indice-lista/modal-indice-lista.component';
import { MatChipsModule } from '@angular/material/chips';
import { ModalImagenesInsumoComponent } from './datainsumo/modal-imagenes-insumo/modal-imagenes-insumo.component';
import { LicenciasComponent } from './licencias/licencias.component';
import { ModalLicenciaComponent } from './licencias/modal-licencia/modal-licencia.component';
import { ImportarinsumosComponent } from './datainsumo/importarinsumos/importarinsumos.component';
//import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';//virtual scrolling table
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CaracteristicasInsumoComponent } from './caracteristicas-insumo/caracteristicas-insumo.component';
import { UnidadDeMedidaComponent } from './caracteristicas-insumo/unidad-de-medida/unidad-de-medida.component';
import { ModalUnidadDeMedidaComponent } from './caracteristicas-insumo/modal-unidad-de-medida/modal-unidad-de-medida.component';
import { ModalClasificacionComercialComponent } from './caracteristicas-insumo/modal-clasificacion-comercial/modal-clasificacion-comercial.component';
import { ClasificacionComercialComponent } from './caracteristicas-insumo/clasificacion-comercial/clasificacion-comercial.component';//virtual scrolling table
import { NgSelectModule } from '@ng-select/ng-select';
import { CatalogosModule } from '../catalogos/catalogos.module';
import { TextMaskModule } from 'angular2-text-mask';
import { ModalListaClasificacionComponent } from './datainsumo/modal-lista-clasificacion/modal-lista-clasificacion.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { ModalProveedoresComponent } from './proveedores/modal-proveedores/modal-proveedores.component';
import { PartidasSistemaComponent } from './partidas-sistema/partidas-sistema.component';
import { CarinsumoUsuarioComponent } from './carinsumo-usuario/carinsumo-usuario.component';
import { TinymceModule } from 'angular2-tinymce';
import { ManualusComponent } from './manualus/manualus.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [TipouserComponent,
    DetalleinsumoComponent,
    TipoInsumoComponent,
    IndiceUnificadoComponent,
    ModalTipoInsumoComponent,
    ModalIndiceUnificadoComponent,
    DatainsumoComponent,
    ModalDataInsumoComponent,
    ModalIndiceListaComponent,
    ModalImagenesInsumoComponent,
    LicenciasComponent,
    ModalLicenciaComponent,
    ImportarinsumosComponent,
    CaracteristicasInsumoComponent,
    UnidadDeMedidaComponent,
    ModalUnidadDeMedidaComponent,
    ModalClasificacionComercialComponent,
    ClasificacionComercialComponent,
    ModalListaClasificacionComponent,
    ProveedoresComponent,
    ModalProveedoresComponent,
    PartidasSistemaComponent,
    CarinsumoUsuarioComponent,
    ManualusComponent],
  imports: [
    CommonModule,
    AdministradorRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    NgbModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    ToastyModule,
    MatDatepickerModule,
    AnchocolModule,
    PintarfilapreModule,
    MatAutocompleteModule,
    MatChipsModule,
    //TableVirtualScrollModule,
    ScrollingModule,
    NgSelectModule,
    CatalogosModule,
    TextMaskModule,
    TinymceModule.withConfig({
      selector: '#tinymce',
      //toolbar_mode: 'sliding',
      menubar: false,
      language_url: '../../../assets/langs/es.js',
      statusbar: false,
      toolbar: [
        "bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor | link"
      ],
    }),
    PdfViewerModule
  ],
  exports: [
    TipoInsumoComponent,
    IndiceUnificadoComponent,
    ImportarinsumosComponent,
    ModalDataInsumoComponent, 
    ModalIndiceListaComponent, 
    ModalImagenesInsumoComponent
  ]
})
export class AdministradorModule { }
