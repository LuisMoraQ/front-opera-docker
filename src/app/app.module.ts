import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AdminComponent } from './layout/admin/admin.component';
import { AuthComponent } from './layout/auth/auth.component';
import { SharedModule } from './shared/shared.module';
import { MenuItems } from './shared/menu-items/menu-items';
import { BreadcrumbsComponent } from './layout/admin/breadcrumbs/breadcrumbs.component';
import { MenuProyectoComponent } from './layout/admin/menu-proyecto/menu-proyecto.component';
import { LoginComponent } from './componentes/login/login.component';

import { ToastyModule } from 'ng2-toasty';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrModule } from 'ngx-toastr';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MainiterceptorInterceptor } from './interceptors/mainiterceptor.interceptor';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;


@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    AuthComponent,
    BreadcrumbsComponent,
    MenuProyectoComponent,
    LoginComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    ToastyModule.forRoot(),
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatNativeDateModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    ToastrModule.forRoot(),
    NgxMaskModule.forRoot(options),
  ],
  providers: [MenuItems,{provide:HTTP_INTERCEPTORS,useClass:MainiterceptorInterceptor,multi:true}],
  bootstrap: [AppComponent],
  exports: [MatNativeDateModule]
})
export class AppModule { }
