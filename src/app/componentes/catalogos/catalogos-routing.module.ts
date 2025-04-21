import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatpartidasComponent } from './catpartidas/catpartidas.component';
import { CatinsumosComponent } from './catinsumos/catinsumos.component';
import { CarinsumoUsuarioComponent } from '../administrador/carinsumo-usuario/carinsumo-usuario.component';
import { ClasificacionComponent } from '../proyectos/clasificacion/clasificacion.component';
import { ParametrosComponent } from '../configuraciones/parametros/parametros.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'catpartidas',
        component : CatpartidasComponent
      },
      {
        path: 'catinsumos',
        component : CatinsumosComponent
      },
      {
        path: 'confparam',
        component : ParametrosComponent
      },
      {
        path: 'undusuario',
        component : CarinsumoUsuarioComponent
      },
      {
        path: 'clasificacion',
        component: ClasificacionComponent
      },
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
export class CatalogosRoutingModule { }
