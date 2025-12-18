import { NgModule } from '@angular/core';
import { InicioRoutingModule } from './inicio-routing.module';
import { ContactosComponent } from './contactos/contactos.component';
import { ModulosComponent } from './modulos/modulos.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { PasarelaComponent } from './pasarela/pasarela.component';
import { PlanesComponent } from './planes/planes.component';
import { PortadaComponent } from './portada/portada.component';
import { VentajasComponent } from './ventajas/ventajas.component';

import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedModule } from '../../shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { ConvocatoriasComponent } from './convocatorias/convocatorias.component';

@NgModule({
  declarations: [
    ContactosComponent,
    ModulosComponent,
    NosotrosComponent,
    PasarelaComponent,
    PlanesComponent,
    PortadaComponent,
    VentajasComponent,
    ConvocatoriasComponent,
  ],
  imports: [
    InicioRoutingModule,
    CommonModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    SharedModule,
    MatInputModule,
    /*MatSelectModule,
    MatTooltipModule,
    NgbModule,
    MatIconModule,
    MatButtonModule,
    ToastyModule,
    MatDatepickerModule,
    ScrollingModule,
    TableModule,
    DialogModule,
    ButtonModule,
    NgSelectModule,
    MatStepperModule,
    MatRadioModule,
    MatSlideToggleModule, */
  ],
})
export class InicioModule { }
