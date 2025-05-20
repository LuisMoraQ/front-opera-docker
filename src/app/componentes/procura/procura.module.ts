import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProcuraRoutingModule } from './procura-routing.module';
import { PanelprocuraComponent } from './panelprocura/panelprocura.component';


@NgModule({
  declarations: [
    
  
    PanelprocuraComponent
  ],
  imports: [
    CommonModule,
    ProcuraRoutingModule
  ],
  exports: [ PanelprocuraComponent ]
})
export class ProcuraModule { }
