import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { ToastyModule } from 'ng2-toasty';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AnchocolModule } from 'src/app/directivas/anchocol.module';
import { AutoFocusModule } from 'src/app/directivas/auto-focus.module';
import { TextMaskModule } from 'angular2-text-mask';
import { PintarfilapreModule } from 'src/app/directivas/pintarfilapre.module';
import { MetradosRoutingModule } from './metrados-routing.module';
import { MetradosdiariosComponent } from './metradosdiarios/metradosdiarios.component';
import { RegistroActividadesComponent } from './registro-actividades/registro-actividades.component';


@NgModule({
  declarations: [
    MetradosdiariosComponent,
    RegistroActividadesComponent
  ],
  imports: [
    CommonModule,
    MetradosRoutingModule,
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
  ],
  exports: [MetradosdiariosComponent, RegistroActividadesComponent]
})
export class MetradosModule { }
