import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortadaComponent } from './portada/portada.component';
import { LoginComponent } from '../login/login.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { ModulosComponent } from './modulos/modulos.component';
import { PlanesComponent } from './planes/planes.component';
import { VentajasComponent } from './ventajas/ventajas.component';
import { ContactosComponent } from './contactos/contactos.component';
import { PasarelaComponent } from './pasarela/pasarela.component';

const routes: Routes = [
  {path: '',
    component:PortadaComponent,
    children: [
      {path:'', component : LoginComponent},
      {path:'nosotros', component : NosotrosComponent},
      {path: 'modulos',component :ModulosComponent},
      {path: 'planes',component :PlanesComponent},
      {path: 'ventajas',component :VentajasComponent},
      {path: 'contacto',component :ContactosComponent},
      {path: 'pasarela',component :PasarelaComponent},
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
      }
    ]/* ,canActivate: [RutapriGuard] */
  },
  {path: '**',redirectTo: '',pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioRoutingModule { }
