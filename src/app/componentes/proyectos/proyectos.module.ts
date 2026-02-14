import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ProyectosRoutingModule } from './proyectos-routing.module';
import { ClasificacionComponent } from './clasificacion/clasificacion.component';
import { PrincipalComponent } from './principal/principal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
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
import { MatInputModule } from '@angular/material/input';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MatRadioModule} from '@angular/material/radio';
import { MatTreeModule } from '@angular/material/tree';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { AnchocolModule } from '../../directivas/anchocol.module';
import { PintarfilapreModule } from 'src/app/directivas/pintarfilapre.module';
import { AgrupacionProyectosComponent } from './agrupacion-proyectos/agrupacion-proyectos.component';
import { ModalProyectoComponent } from './principal/modal-proyecto/modal-proyecto.component';
import { DetalleProyectoComponent } from './principal/detalle-proyecto/detalle-proyecto.component';
import { AspectosGeneralesComponent } from './principal/aspectos-generales/aspectos-generales.component';
import { PresupuestoModule } from './../presupuesto/presupuesto.module';
import { ProgramacionObraComponent } from './principal/programacion-obra/programacion-obra.component';
//import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TableModule } from 'primeng/table';
import { TextMaskModule } from 'angular2-text-mask';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { AutoFocusModule } from 'src/app/directivas/auto-focus.module';
import { ModalProgramacionXmlComponent } from './principal/programacion-obra/modal-programacion-xml/modal-programacion-xml.component';
import { ModalHitoComponent } from './principal/programacion-obra/modal-hito/modal-hito.component';
import { HojaMetradosComponent } from './principal/hoja-metrados/hoja-metrados.component';
import { ModalMetradoExcelComponent } from './principal/hoja-metrados/modal-metrado-excel/modal-metrado-excel.component';
import { ModalPlantillaComponent } from './principal/hoja-metrados/modal-plantilla/modal-plantilla.component';
import { ModalPesosComercialesComponent } from './principal/hoja-metrados/modal-pesos-comerciales/modal-pesos-comerciales.component';
import { FormulaPolinomicaComponent } from './principal/formula-polinomica/formula-polinomica.component';
import { ModalCantidadEdicionFpComponent } from './principal/formula-polinomica/modal-cantidad-edicion-fp/modal-cantidad-edicion-fp.component';
import { ModalNoLaborablesComponent } from './principal/programacion-obra/modal-no-laborables/modal-no-laborables.component';
import { ComparteproyComponent } from './principal/comparteproy/comparteproy.component';
import { EspecificacionesTecnicasComponent } from './principal/especificaciones-tecnicas/especificaciones-tecnicas.component';
import { ModalPlantillaEspecificacionesComponent } from './principal/especificaciones-tecnicas/modal-plantilla-especificaciones/modal-plantilla-especificaciones.component';
import { TinymceModule } from 'angular2-tinymce';
import { ModalVerEspecificacionComponent } from './principal/especificaciones-tecnicas/modal-ver-especificacion/modal-ver-especificacion.component';
import { ModalBusquedaEspecificacionComponent } from './principal/especificaciones-tecnicas/modal-busqueda-especificacion/modal-busqueda-especificacion.component';
import { ModalPosiblesCoincidenciasComponent } from './principal/especificaciones-tecnicas/modal-posibles-coincidencias/modal-posibles-coincidencias.component';
import { ModalVinculoPartidasEspComponent } from './principal/especificaciones-tecnicas/modal-vinculo-partidas-esp/modal-vinculo-partidas-esp.component';
import { ModalimportaproyComponent } from './principal/modalimportaproy/modalimportaproy.component';
import { TiemposProgramacionComponent } from './principal/tiempos-programacion/tiempos-programacion.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ReportesComponent } from './reportes/reportes.component';
import { ProysistemaComponent } from './proysistema/proysistema.component';
import { ColaboraproyComponent } from './colaboraproy/colaboraproy.component';
import { VisorDePlanoComponent } from './principal/visor-de-plano/visor-de-plano.component';
// import { IfcViewerModule } from 'ngx-ifc-viewer';
import { ChartModule } from 'angular2-chartjs';
import { ConfproyimprComponent } from './principal/confproyimpr/confproyimpr.component';
import { DataProyectoComponent } from './principal/data-proyecto/data-proyecto.component';
import { AddproybiplanComponent } from './addproybiplan/addproybiplan.component';
import { ProcuraModule } from '../procura/procura.module';
import { MetradosModule } from '../metrados/metrados.module';
import { AlmacenModule } from '../almacen/almacen.module';
import { RecursosHumanosModule } from '../recursos-humanos/recursos-humanos.module';
import { EquiposHerramientasComponent } from './principal/equipos-herramientas/equipos-herramientas.component';

@NgModule({
  declarations: [
    ClasificacionComponent,
    PrincipalComponent,
    AgrupacionProyectosComponent,
    ModalProyectoComponent,
    DetalleProyectoComponent,
    AspectosGeneralesComponent,
    ProgramacionObraComponent,
    ModalProgramacionXmlComponent,
    ModalHitoComponent,
    HojaMetradosComponent,
    ModalMetradoExcelComponent,
    ModalPlantillaComponent,
    ModalPesosComercialesComponent,
    FormulaPolinomicaComponent,
    ModalCantidadEdicionFpComponent,
    ModalNoLaborablesComponent,
    ComparteproyComponent,
    EspecificacionesTecnicasComponent,
    ModalPlantillaEspecificacionesComponent,
    ModalVerEspecificacionComponent,
    ModalBusquedaEspecificacionComponent,
    ModalPosiblesCoincidenciasComponent,
    ModalVinculoPartidasEspComponent,
    ModalimportaproyComponent,
    TiemposProgramacionComponent,
    ReportesComponent,
    ProysistemaComponent,
    ColaboraproyComponent,
    VisorDePlanoComponent,
    ConfproyimprComponent,
    DataProyectoComponent,
    AddproybiplanComponent,
    EquiposHerramientasComponent,
    
  ],
  imports: [
    CommonModule,
    ProyectosRoutingModule,
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
    PresupuestoModule,
    ProcuraModule,
    AlmacenModule,
    MetradosModule,
    ScrollingModule,
    TableModule,
    TextMaskModule,
    DialogModule,
    ButtonModule,
    NgSelectModule,
    PintarfilapreModule,
    AutoFocusModule,
    MatStepperModule,
    MatRadioModule,
    TinymceModule.withConfig({
      selector: '#tinymce',
      menubar: false,
      language_url: '../../../assets/langs/es.js',
      toolbar: [
        "bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor | link | table tabledelete | image"
      ],
      min_height: 800,
      resize: true,
      object_resizing: true
    }),
    MatSlideToggleModule,
    // IfcViewerModule,
    ChartModule,
    RecursosHumanosModule
  ],
  exports: [ClasificacionComponent],
})
export class ProyectosModule { }
