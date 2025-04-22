import { CatalogosModule } from './../catalogos/catalogos.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule} from '../../shared/shared.module';
import { PresupuestoRoutingModule } from './presupuesto-routing.module';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { MatCheckboxModule} from '@angular/material/checkbox'
import { ToastyModule} from 'ng2-toasty';
import { MatTableModule} from '@angular/material/table';
import { MatSortModule} from '@angular/material/sort';
import { MatPaginatorModule} from '@angular/material/paginator';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatTabsModule} from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import {MatDatepickerModule} from '@angular/material/datepicker';
import { AnchocolModule } from 'src/app/directivas/anchocol.module';
import { MatChipsModule} from '@angular/material/chips';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {TinymceModule} from 'angular2-tinymce';
// import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';//virtual scrolling table
// import {ScrollingModule} from '@angular/cdk/scrolling';//virtual scrolling table
import { AutoFocusModule } from 'src/app/directivas/auto-focus.module';
import { TextMaskModule } from 'angular2-text-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { PintarfilapreModule } from 'src/app/directivas/pintarfilapre.module';
import { PresdirectoComponent } from './presdirecto/presdirecto.component';
import { BusqTitSubtPresuComponent } from './busq-tit-subt-presu/busq-tit-subt-presu.component';
import { BusqPartidasPresuComponent } from './busq-partidas-presu/busq-partidas-presu.component';
// import {TableModule} from 'primeng/table';
import { ModversubplecturaComponent } from './modversubplectura/modversubplectura.component';
import { ModaladdsubpartidaComponent } from './modaladdsubpartida/modaladdsubpartida.component';
import { RelacinsumosComponent } from './relacinsumos/relacinsumos.component';
import { AddpartproyComponent } from './addpartproy/addpartproy.component';
import { ModalvincpartidaComponent } from './modalvincpartida/modalvincpartida.component';
import { MinmaxnumModule } from 'src/app/directivas/minmaxnum.module';
import { DatosinsumoComponent } from './datosinsumo/datosinsumo.component';
import { ClasipartidaspresuComponent } from './clasipartidaspresu/clasipartidaspresu.component';
import { PresindirComponent } from './presindir/presindir.component';

@NgModule({
  declarations: [
    PresdirectoComponent,
    BusqTitSubtPresuComponent,
    BusqPartidasPresuComponent,
    ModversubplecturaComponent,
    ModaladdsubpartidaComponent,
    RelacinsumosComponent,
    AddpartproyComponent,
    ModalvincpartidaComponent,
    DatosinsumoComponent,
    ClasipartidaspresuComponent,
    PresindirComponent,
  ],
  imports: [
    CommonModule,
    PresupuestoRoutingModule,
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
    MatCheckboxModule,
    ToastyModule,
    MatDatepickerModule,
    AnchocolModule,
    MatChipsModule,
    PdfViewerModule,
    MatAutocompleteModule,
    TinymceModule,
    // TableVirtualScrollModule,
    // ScrollingModule,
    AutoFocusModule,
    TextMaskModule,
    NgSelectModule,
    PintarfilapreModule,
    CatalogosModule,
    // TableModule,
    MinmaxnumModule,
  ],
  exports: [ PresdirectoComponent,PresindirComponent ]
})
export class PresupuestoModule { }
