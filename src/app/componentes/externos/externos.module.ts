import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExternosRoutingModule } from './externos-routing.module';
import { CotizacionComponent } from './cotizacion/cotizacion.component';
import { NodispoComponent } from './nodispo/nodispo.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AnchocolModule } from '../../directivas/anchocol.module';
import { SharedModule } from '../../shared/shared.module';
import { AutoFocusModule } from 'src/app/directivas/auto-focus.module';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
  declarations: [
    CotizacionComponent,
    NodispoComponent
  ],
  imports: [
    CommonModule,
    ExternosRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    AnchocolModule,
    SharedModule,
    AutoFocusModule,
    TextMaskModule,
  ]
})
export class ExternosModule { }
