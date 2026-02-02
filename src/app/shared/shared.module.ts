import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ToggleFullScreenDirective} from './fullscreen/toggle-fullscreen.directive';
import {AccordionAnchorDirective} from './accordion';
import {AccordionLinkDirective} from './accordion';
import {AccordionDirective} from './accordion';
import {HttpClientModule} from '@angular/common/http';
import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {TitleComponent} from '../layout/admin/title/title.component';
import {CardComponent} from './card/card.component';
import {CardToggleDirective} from './card/card-toggle.directive';
import {ModalBasicComponent} from './modal-basic/modal-basic.component';
import {ModalAnimationComponent} from './modal-animation/modal-animation.component';
import {SpinnerComponent} from './spinner/spinner.component';
import {ClickOutsideModule} from 'ng-click-outside';
import {DataFilterPipe} from './elements/data-filter.pipe';
import { CargandoComponent } from './cargando/cargando.component';
import { VisualizadorPdfComponent } from './visualizador-pdf/visualizador-pdf.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SafePipePipe } from './elements/safe-pipe.pipe';
import { DetProyEstadoPipe } from './elements/det-proy-estado.pipe';
import { ReemplazarTextoPipe } from './elements/reemplazar-texto.pipe';
import { FormatoDecPipe } from './elements/formato-dec.pipe';
import { TablaGanttComponent } from './tabla-gantt/tabla-gantt.component';
import { HeaderCalendarioComponent } from './header-calendario/header-calendario.component';
import { AnchocolModule } from '../directivas/anchocol.module';
import { RecortatextPipe } from './elements/recortatext.pipe';
import { FiltroTablaPipe } from './elements/filtro-tabla.pipe';
import { FiltroTablaInsPipe } from './elements/filtro-tabla-ins.pipe';
import { FiltoTablaDescPipe } from './elements/filto-tabla-desc.pipe';
import { FiltroTablaProyPipe } from './elements/filtro-tabla-proy.pipe';
import { FiltroPresuPipe } from './elements/filtro-presu.pipe';
import { FiltroBusqTablaPipe } from './elements/filtro-busq-tabla.pipe';
import { FiltroAcuPipe } from './elements/filtro-acu.pipe';
import { PeriodoHoraPipe } from './elements/periodo-hora.pipe';
import { NombreProyectoPipe } from './elements/nombre-proyecto.pipe';
import { AgrupamientoPipe } from './elements/agrupamiento.pipe';
import { OfflinepageComponent } from './offlinepage/offlinepage.component';
import { AddImgUrlComponent } from './add-img-url/add-img-url.component';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { FiltroTablaColPipe } from './elements/filtro-tabla-col.pipe';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    HttpClientModule,
    PerfectScrollbarModule,
    ClickOutsideModule,
    PdfViewerModule,
    AnchocolModule,
    MatInputModule,
    MatRadioModule,
    FormsModule
  ],
  exports: [
    NgbModule,
    ToggleFullScreenDirective,
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    CardToggleDirective,
    HttpClientModule,
    PerfectScrollbarModule,
    TitleComponent,
    CardComponent,
    ModalBasicComponent,
    ModalAnimationComponent,
    SpinnerComponent,
    ClickOutsideModule,
    DataFilterPipe,
    CargandoComponent,
    VisualizadorPdfComponent,
    SafePipePipe,
    DetProyEstadoPipe,
    ReemplazarTextoPipe,
    FormatoDecPipe,
    TablaGanttComponent,
    HeaderCalendarioComponent,
    RecortatextPipe,
    FiltroTablaPipe,
    FiltroTablaInsPipe,
    FiltoTablaDescPipe,
    FiltroTablaProyPipe,
    FiltroPresuPipe,
    FiltroBusqTablaPipe,
    FiltroAcuPipe,
    PeriodoHoraPipe,
    NombreProyectoPipe,
    AgrupamientoPipe,
    FiltroTablaColPipe
  ],
  declarations: [
    ToggleFullScreenDirective,
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    CardToggleDirective,
    TitleComponent,
    CardComponent,
    ModalBasicComponent,
    ModalAnimationComponent,
    SpinnerComponent,
    DataFilterPipe,
    CargandoComponent,
    VisualizadorPdfComponent,
    SafePipePipe,
    DetProyEstadoPipe,
    ReemplazarTextoPipe,
    FormatoDecPipe,
    TablaGanttComponent,
    HeaderCalendarioComponent,
    RecortatextPipe,
    FiltroTablaPipe,
    FiltroTablaInsPipe,
    FiltoTablaDescPipe,
    FiltroTablaProyPipe,
    FiltroPresuPipe,
    FiltroBusqTablaPipe,
    FiltroAcuPipe,
    PeriodoHoraPipe,
    NombreProyectoPipe,
    AgrupamientoPipe,
    OfflinepageComponent,
    AddImgUrlComponent,
    FiltroTablaColPipe
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  schemas: [ NO_ERRORS_SCHEMA ]
})
export class SharedModule { }
