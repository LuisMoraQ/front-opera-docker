import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimplePageComponent } from './simple-page.component';
import {SimplePageRoutingModule} from './simple-page-routing.module';
import {SharedModule} from '../../shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SimplePageRoutingModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [SimplePageComponent]
})
export class SimplePageModule { }
