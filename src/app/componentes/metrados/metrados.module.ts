import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MetradosRoutingModule } from './metrados-routing.module';
import { MetradosdiariosComponent } from './metradosdiarios/metradosdiarios.component';


@NgModule({
  declarations: [
    MetradosdiariosComponent
  ],
  imports: [
    CommonModule,
    MetradosRoutingModule
  ],
  exports: [ MetradosdiariosComponent ]
})
export class MetradosModule { }
