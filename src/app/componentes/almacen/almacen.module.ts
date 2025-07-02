import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlmacenRoutingModule } from './almacen-routing.module';
import { PanelalmcComponent } from './panelalmc/panelalmc.component';


@NgModule({
  declarations: [
    PanelalmcComponent
  ],
  imports: [
    CommonModule,
    AlmacenRoutingModule
  ]
})
export class AlmacenModule { }
