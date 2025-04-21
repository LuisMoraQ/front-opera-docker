import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* import { CostodirectoComponent} from './costodirecto/costodirecto.component'; */

const routes: Routes = [
  {
    path: '',
    children: [
      /* {
        path: 'costodirec',
        component : CostodirectoComponent
      }, */
      {
          path: '**',
          redirectTo: 'principal/inicio',//al poner una ruta que no existe se redirecciona al primer componente del arbol
          pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresupuestoRoutingModule { }
