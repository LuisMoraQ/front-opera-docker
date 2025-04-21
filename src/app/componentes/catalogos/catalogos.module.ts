import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { CatalogosRoutingModule } from './catalogos-routing.module';
import { CatpartidasComponent } from './catpartidas/catpartidas.component';

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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CatinsumosComponent } from './catinsumos/catinsumos.component'
import { AnchocolModule } from 'src/app/directivas/anchocol.module';
import { MatChipsModule } from '@angular/material/chips';
import { VisualizadorDocInsumosComponent } from './catinsumos/visualizador-doc-insumos/visualizador-doc-insumos.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TinymceModule } from 'angular2-tinymce';
//import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';//virtual scrolling table
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DetallepartidaComponent } from './catpartidas/detallepartida/detallepartida.component';
import { ModalDataPartidaComponent } from './catpartidas/modal-data-partida/modal-data-partida.component';
import { BuscarinsumoComponent } from './catpartidas/buscarinsumo/buscarinsumo.component';
import { AutoFocusModule } from 'src/app/directivas/auto-focus.module';
import { PintarfilapreModule } from 'src/app/directivas/pintarfilapre.module';
import { TextMaskModule } from 'angular2-text-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { AsociarCatalogosComponent } from './catinsumos/asociar-catalogos/asociar-catalogos.component';
import { FichaTecnicaComponent } from './catinsumos/ficha-tecnica/ficha-tecnica.component';
import { ModalGrupoPartidaComponent } from './catpartidas/modal-grupo-partida/modal-grupo-partida.component';
import {TableModule} from 'primeng/table';
import { BuscartitsubtComponent } from './catpartidas/buscartitsubt/buscartitsubt.component';
import { ModalSubpartidaComponent } from './catpartidas/modal-subpartida/modal-subpartida.component';
import { UnidadesuserComponent } from './unidadesuser/unidadesuser.component';
import { BuscaaddunidadmedComponent } from './unidadesuser/buscaaddunidadmed/buscaaddunidadmed.component';
import { BusqpartcatComponent } from './catpartidas/busqpartcat/busqpartcat.component';
import { MatRadioModule } from '@angular/material/radio';
@NgModule({
  declarations: [
    CatpartidasComponent,
    CatinsumosComponent,
    VisualizadorDocInsumosComponent,
    DetallepartidaComponent,
    ModalDataPartidaComponent,
    BuscarinsumoComponent,
    AsociarCatalogosComponent,
    FichaTecnicaComponent,
    ModalGrupoPartidaComponent,
    BuscartitsubtComponent,
    ModalSubpartidaComponent,
    UnidadesuserComponent,
    BuscaaddunidadmedComponent,
    BusqpartcatComponent
  ],
  imports: [
    CommonModule,
    CatalogosRoutingModule,
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
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    ToastyModule,
    MatDatepickerModule,
    AnchocolModule,
    MatChipsModule,
    PdfViewerModule,
    MatAutocompleteModule,
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
    //TableVirtualScrollModule,
    ScrollingModule,
    AutoFocusModule,
    TextMaskModule,
    NgSelectModule,
    TableModule,
    PintarfilapreModule,
  ],
  exports: [
    AsociarCatalogosComponent,
    VisualizadorDocInsumosComponent,
    ModalGrupoPartidaComponent,
    ModalDataPartidaComponent,
    DetallepartidaComponent,
    UnidadesuserComponent,
    FichaTecnicaComponent
  ]
})
export class CatalogosModule { }
