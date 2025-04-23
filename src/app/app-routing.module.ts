import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from './layout/admin/admin.component';
import { RutaGuard } from './guardias/ruta.guard';
// import { RutapriGuard } from './guardias/rutapri.guard';
import { PerfilComponent } from './componentes/configuraciones/perfil/perfil.component';

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
  },
  {path: '**',redirectTo: '',pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
