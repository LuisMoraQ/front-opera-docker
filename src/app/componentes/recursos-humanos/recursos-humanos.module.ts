import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ToastyModule } from "ng2-toasty";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { AnchocolModule } from "src/app/directivas/anchocol.module";
import { AutoFocusModule } from "src/app/directivas/auto-focus.module";
import { TextMaskModule } from "angular2-text-mask";
import { PintarfilapreModule } from "src/app/directivas/pintarfilapre.module";
import { NgModule } from "@angular/core";
import { RecursosHumanosRoutingModule } from "./recursos-humanos-routing.module";
import { PanelRecursosHumanosComponent } from './panel-recursos-humanos/panel-recursos-humanos.component';
import { RegistroInformacionComponent } from './registro-informacion/registro-informacion.component';
import { SharedModule } from "src/app/shared/shared.module";
import { TinymceModule } from "angular2-tinymce";
import { NgSelectModule } from '@ng-select/ng-select';
import {MatSliderModule} from '@angular/material/slider';
import { PlanillasComponent } from './planillas/planillas.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { QRCodeModule } from 'angularx-qrcode';
import { ConfiguracionPlanillaComponent } from './configuracion-planilla/configuracion-planilla.component';
import { ReportesRhComponent } from './reportes-rh/reportes-rh.component';
@NgModule({
  declarations: [
    PanelRecursosHumanosComponent,
    RegistroInformacionComponent,
    PlanillasComponent,
    ConfiguracionPlanillaComponent,
    ReportesRhComponent
  ],
  imports: [
    CommonModule,
    RecursosHumanosRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
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
    AutoFocusModule,
    TextMaskModule,
    PintarfilapreModule,
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
    NgSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    QRCodeModule
  ],
  exports: [PlanillasComponent, ConfiguracionPlanillaComponent, ReportesRhComponent]
})
export class RecursosHumanosModule { }
