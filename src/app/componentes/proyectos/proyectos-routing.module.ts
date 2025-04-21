import { MenuProyectosComponent } from './menu-proyectos/menu-proyectos.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClasificacionComponent } from './../proyectos/clasificacion/clasificacion.component';
import { PrincipalComponent } from './../proyectos/principal/principal.component';
import { CatpartidasComponent } from '../catalogos/catpartidas/catpartidas.component';
import { CatinsumosComponent } from '../catalogos/catinsumos/catinsumos.component';
import { ReportesComponent } from './reportes/reportes.component';
import { ColaboraproyComponent } from './colaboraproy/colaboraproy.component';
import { VisorDePlanoComponent } from './principal/visor-de-plano/visor-de-plano.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'principal',
        component: PrincipalComponent
      },
      {
        path: 'clasificacion',
        component: ClasificacionComponent
      },
      {
        path: 'menuproyecto',
        component: MenuProyectosComponent
      },
      {
        path: 'catpartidas',
        component: CatpartidasComponent
      },
      {
        path: 'catinsumos',
        component: CatinsumosComponent
      },
      {
        path: 'reportes',
        component: ReportesComponent
      },
      {
        path: 'visor-planos',
        component: VisorDePlanoComponent
      },
      {
        path: 'asignafunc',
        component: ColaboraproyComponent
      },
      {
        path: '**',
        redirectTo: 'principal/inicio',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProyectosRoutingModule { }
