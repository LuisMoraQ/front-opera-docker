import { NgModule } from '@angular/core';
import { AnchocolDirective } from './anchocol.directive';
import { Anchocol2Directive } from './anchocol2.directive';

@NgModule({
  imports: [],
  declarations: [AnchocolDirective, Anchocol2Directive],
  exports: [AnchocolDirective,Anchocol2Directive]
})
export class AnchocolModule { }