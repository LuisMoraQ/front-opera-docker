import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from './layout/admin/admin.component';
import { RutaGuard } from './guardias/ruta.guard';
// import { RutapriGuard } from './guardias/rutapri.guard';
import { PerfilComponent } from './componentes/configuraciones/perfil/perfil.component';
// import { LoginComponent } from './componentes/login/login.component';
// import { ContactosComponent } from './componentes/inicio/contactos/contactos.component';
// import { ModulosComponent } from './componentes/inicio/modulos/modulos.component';
// import { PlanesComponent } from './componentes/inicio/planes/planes.component';
// import { VentajasComponent } from './componentes/inicio/ventajas/ventajas.component';
// import { NosotrosComponent } from './componentes/inicio/nosotros/nosotros.component';
// import { PortadaComponent } from './componentes/inicio/portada/portada.component';
// import { PasarelaComponent } from './componentes/inicio/pasarela/pasarela.component';

const routes: Routes = [
  {
    path: 'principal',
    canLoad:[RutaGuard],
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path:'inicio',
        //loadChildren: () => import('./theme/simple-page/simple-page.module').then(m => m.SimplePageModule),//redireccionar a perfil, o modificar el simple-page
        component : PerfilComponent
      },
      {
        path: 'configs',
        loadChildren: () => import('./componentes/configuraciones/configuraciones.module').then(m => m.ConfiguracionesModule),
      },
      {
        path: 'adminis',
        loadChildren: () => import('./componentes/administrador/administrador.module').then(m => m.AdministradorModule)
      },
      {
        path: 'catalog',
        loadChildren: () => import('./componentes/catalogos/catalogos.module').then(m => m.CatalogosModule)
      },
      {
        path: 'proyects',
        loadChildren: () => import('./componentes/proyectos/proyectos.module').then(m => m.ProyectosModule),
      },
      {
        path: '**',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ],canActivate: [RutaGuard]
  },
  /* {path: 'login',component :LoginComponent}, */
  {
    path: '', /* redirectTo: '/principal/inicio',pathMatch: 'full' */
    loadChildren: () => import('./componentes/inicio/inicio.module').then(m => m.InicioModule),
    // component:PortadaComponent,
    // children: [
    //   {path:'', component : LoginComponent},
    //   {path:'nosotros', component : NosotrosComponent},
    //   {path: 'modulos',component :ModulosComponent},
    //   {path: 'planes',component :PlanesComponent},
    //   {path: 'ventajas',component :VentajasComponent},
    //   {path: 'contacto',component :ContactosComponent},
    //   {path: 'pasarela',component :PasarelaComponent},
    //   {
    //     path: '**',
    //     redirectTo: '',
    //     pathMatch: 'full'
    //   }
    // ]/* ,canActivate: [RutapriGuard] */
  },
  {path: '**',redirectTo: '',pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
